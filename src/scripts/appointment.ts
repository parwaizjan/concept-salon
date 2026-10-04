/**
 * Client appointment engine: selection, Google Sheet merge, and the WhatsApp
 * hand-off.
 *
 * Plain DOM + sessionStorage, no framework. Runs on every page so the sticky bar
 * and selection stay in sync; the booking form only exists on `/book`. All
 * salon-specific values and UI strings arrive through the `#appointment-config`
 * JSON block rendered by `BaseLayout`.
 */
import { formatPrice } from "../lib/format";
import { getSheetCsvUrl, parseServiceSheet } from "../lib/sheet";
import {
  buildAppointmentMessage,
  type AppointmentDetails,
} from "../lib/appointment";
import { buildWhatsAppUrl } from "../lib/whatsapp";
import type { Locale } from "../data/site";
import type { UiKey } from "../i18n/ui";

type AppointmentConfig = {
  whatsappNumber: string;
  siteName: string;
  lang: string;
  i18n: Record<string, string>;
  services: {
    mode: "runtime" | "build";
    sheetId: string;
    sheetTab: string;
    refreshMinutes: number;
  };
  appointment: {
    slots: string[];
    minLeadDays: number;
    maxLeadDays: number;
  };
};

type Item = {
  id: string;
  name: string;
  price: number;
  duration?: number;
  available: boolean;
  category: string;
};

const STORAGE_KEY = "amara-booking-v1";
const CACHE_KEY = "amara-services-sheet-v1";

function readConfig(): AppointmentConfig | null {
  const node = document.getElementById("appointment-config");
  if (!node?.textContent) return null;
  try {
    return JSON.parse(node.textContent) as AppointmentConfig;
  } catch {
    return null;
  }
}

function loadSelection(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveSelection(ids: string[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable; selection stays in-memory for this page view */
  }
}

class AppointmentApp {
  private config: AppointmentConfig;
  private selection: Set<string>;
  private items = new Map<string, Item>();
  private t: (key: UiKey) => string;

  constructor(config: AppointmentConfig) {
    this.config = config;
    this.selection = new Set(loadSelection());
    this.t = (key) => this.config.i18n[key] ?? key;
  }

  init(): void {
    this.collectItems();
    this.bind();
    this.syncSelectionToUI();
    this.render();
    this.updateOpenNow();
    void this.refreshFromSheet();
  }

  private collectItems(): void {
    document.querySelectorAll<HTMLElement>("[data-service]").forEach((node) => {
      const id = node.dataset.id;
      if (!id) return;
      this.items.set(id, {
        id,
        name: node.dataset.name ?? id,
        price: Number(node.dataset.price ?? 0),
        duration: node.dataset.duration
          ? Number(node.dataset.duration)
          : undefined,
        available: node.dataset.available !== "false",
        category: node.dataset.category ?? "",
      });
    });
  }

  private bind(): void {
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;

      const toggle = target.closest<HTMLElement>("[data-service-toggle]");
      if (toggle) {
        const host = toggle.closest<HTMLElement>("[data-service]");
        if (host?.dataset.id) this.toggle(host.dataset.id);
        return;
      }

      const remove = target.closest<HTMLElement>("[data-estimator-remove]");
      if (remove?.dataset.estimatorRemove) {
        this.setSelected(remove.dataset.estimatorRemove, false);
        return;
      }

      const chip = target.closest<HTMLElement>("[data-category-chip]");
      if (chip) {
        this.filterCategory(chip.dataset.categoryChip ?? "all", chip);
      }
    });

    document.addEventListener("change", (event) => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement &&
        target.matches("[data-service-check]")
      ) {
        const host = target.closest<HTMLElement>("[data-service]");
        if (host?.dataset.id) this.setSelected(host.dataset.id, target.checked);
        return;
      }

      if (
        target instanceof HTMLInputElement &&
        target.matches("[data-slot-any]")
      ) {
        if (target.checked) {
          this.slotInputs().forEach((input) => {
            if (input !== target) input.checked = false;
          });
        }
      }
    });

    const form = document.querySelector<HTMLFormElement>(
      "[data-appointment-form]",
    );
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      this.send(form);
    });
  }

  private get selectedItems(): Item[] {
    return [...this.items.values()].filter((item) =>
      this.selection.has(item.id),
    );
  }

  private get total(): number {
    return this.selectedItems.reduce((sum, item) => sum + item.price, 0);
  }

  private toggle(id: string): void {
    this.setSelected(id, !this.selection.has(id));
  }

  private setSelected(id: string, selected: boolean): void {
    const item = this.items.get(id);
    if (selected && item && !item.available) return;

    if (selected) {
      this.selection.add(id);
    } else {
      this.selection.delete(id);
    }
    saveSelection([...this.selection]);
    this.syncSelectionToUI();
    this.render();
  }

  /** Reflect the current selection in every card/row control. */
  private syncSelectionToUI(): void {
    document.querySelectorAll<HTMLElement>("[data-service]").forEach((host) => {
      const id = host.dataset.id;
      if (!id) return;
      const selected = this.selection.has(id);

      host
        .querySelectorAll<HTMLInputElement>("[data-service-check]")
        .forEach((input) => {
          input.checked = selected;
        });

      host
        .querySelectorAll<HTMLButtonElement>("[data-service-toggle]")
        .forEach((button) => {
          button.setAttribute("aria-pressed", String(selected));
          button.textContent = selected
            ? (button.dataset.labelAdded ?? "Added")
            : (button.dataset.labelAdd ?? "Add");
        });

      host.classList.toggle("ring-2", selected);
      host.classList.toggle("ring-primary", selected);
    });
  }

  private render(): void {
    this.renderSticky();
    this.renderEstimator();
  }

  private renderSticky(): void {
    const bar = document.querySelector<HTMLElement>("[data-sticky-bar]");
    const summary = document.querySelector<HTMLElement>(
      "[data-sticky-summary]",
    );
    const countNode = document.querySelector<HTMLElement>(
      "[data-sticky-count]",
    );
    const totalNode = document.querySelector<HTMLElement>(
      "[data-sticky-total]",
    );
    const labelNode = document.querySelector<HTMLElement>(
      "[data-sticky-label]",
    );
    const count = this.selection.size;

    // The bar is a running summary, not a duplicate header CTA: show it only when
    // something is selected, and never on the /book page (which has its own send
    // button in the form).
    const hasForm = Boolean(document.querySelector("[data-appointment-form]"));
    if (bar) bar.hidden = count === 0 || hasForm;

    if (summary) summary.hidden = count === 0;
    if (countNode) {
      countNode.textContent = `${count} ${
        count === 1 ? this.t("sticky.service") : this.t("sticky.services")
      }`;
    }
    if (totalNode) totalNode.textContent = formatPrice(this.total);
    if (labelNode) {
      labelNode.textContent =
        count > 0 ? this.t("sticky.review") : this.t("sticky.book");
    }
  }

  private renderEstimator(): void {
    const list = document.querySelector<HTMLElement>("[data-estimator-list]");
    const empty = document.querySelector<HTMLElement>("[data-estimator-empty]");
    const totals = document.querySelector<HTMLElement>(
      "[data-estimator-totals]",
    );
    const totalNode = document.querySelector<HTMLElement>(
      "[data-estimator-total]",
    );
    const send = document.querySelector<HTMLButtonElement>(
      "[data-appointment-send]",
    );
    const warning = document.querySelector<HTMLElement>(
      "[data-appointment-warning]",
    );
    if (!list) return;

    const items = this.selectedItems;
    list.replaceChildren();

    for (const item of items) {
      list.append(this.renderEstimatorLine(item));
    }

    if (empty) empty.hidden = items.length > 0;
    if (totals) totals.hidden = items.length === 0;
    if (totalNode) totalNode.textContent = formatPrice(this.total);
    if (send) send.disabled = items.length === 0;
    if (warning && items.length > 0) warning.hidden = true;
  }

  private renderEstimatorLine(item: Item): HTMLElement {
    const line = document.createElement("li");
    line.className = "flex items-center justify-between gap-3 py-2";

    const name = document.createElement("span");
    name.className = "min-w-0 truncate";
    name.textContent = item.name;

    const right = document.createElement("span");
    right.className = "flex shrink-0 items-center gap-2";

    const price = document.createElement("span");
    price.className = "font-medium";
    price.textContent = formatPrice(item.price);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "text-xs text-text-muted underline hover:text-danger";
    remove.dataset.estimatorRemove = item.id;
    remove.textContent = this.t("common.remove");

    right.append(price, remove);
    line.append(name, right);
    return line;
  }

  private slotInputs(): HTMLInputElement[] {
    return Array.from(
      document.querySelectorAll<HTMLInputElement>("[data-slot]"),
    );
  }

  private send(form: HTMLFormElement): void {
    const items = this.selectedItems;

    if (items.length === 0) {
      const warning = document.querySelector<HTMLElement>(
        "[data-appointment-warning]",
      );
      if (warning) warning.hidden = false;
      return;
    }

    const dateEl = form.querySelector<HTMLInputElement>("[data-date]");
    const nameEl = form.querySelector<HTMLInputElement>("[data-name]");
    const notesEl = form.querySelector<HTMLTextAreaElement>("[data-notes]");

    const date = dateEl?.value.trim() || undefined;
    const slots = this.slotInputs()
      .filter((input) => input.checked)
      .map((input) => input.value);

    const details: AppointmentDetails = {
      lines: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
      })),
      total: this.total,
      date,
      slots,
      name: nameEl?.value,
      notes: notesEl?.value,
    };

    const message = buildAppointmentMessage(
      details,
      this.config.lang as Locale,
      this.t,
    );

    window.open(
      buildWhatsAppUrl(message, this.config.whatsappNumber),
      "_blank",
      "noopener,noreferrer",
    );
  }

  private filterCategory(category: string, active: HTMLElement): void {
    document
      .querySelectorAll<HTMLElement>("[data-category-section]")
      .forEach((section) => {
        section.hidden =
          category !== "all" && section.dataset.categorySection !== category;
      });

    document
      .querySelectorAll<HTMLElement>("[data-category-chip]")
      .forEach((chip) => {
        const isActive = chip === active;
        chip.setAttribute("aria-pressed", String(isActive));
        chip.classList.toggle("btn-primary", isActive);
        chip.classList.toggle("btn-outline", !isActive);
      });
  }

  private updateOpenNow(): void {
    const badge = document.querySelector<HTMLElement>("[data-open-badge]");
    if (!badge) return;

    const rows = Array.from(
      document.querySelectorAll<HTMLElement>("[data-hours-day]"),
    );
    if (rows.length === 0) return;

    const now = new Date();
    const today = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();

    const toMinutes = (value: string): number => {
      const [h, m] = value.split(":").map(Number);
      return (h ?? 0) * 60 + (m ?? 0);
    };

    const row = rows.find((r) => Number(r.dataset.hoursDay) === today);
    let open = false;
    if (row?.dataset.hoursOpen && row?.dataset.hoursClose) {
      const start = toMinutes(row.dataset.hoursOpen);
      const end = toMinutes(row.dataset.hoursClose);
      open = minutes >= start && minutes < end;
    }

    badge.textContent = open
      ? this.t("visit.openNow")
      : this.t("visit.closedNow");
    badge.className = `badge ${
      open ? "bg-success text-white" : "bg-danger text-white"
    }`;
    badge.hidden = false;
  }

  private async refreshFromSheet(): Promise<void> {
    const { mode, sheetId, sheetTab, refreshMinutes } = this.config.services;
    if (mode !== "runtime" || !sheetId) return;

    const sheet = await this.fetchSheet(sheetId, sheetTab, refreshMinutes);
    if (!sheet) return;

    for (const [id, row] of Object.entries(sheet)) {
      const item = this.items.get(id);
      if (!item) continue;

      const host = document.querySelector<HTMLElement>(
        `[data-service][data-id="${CSS.escape(id)}"]`,
      );

      if (typeof row.price === "number") {
        item.price = row.price;
        if (host) {
          host.dataset.price = String(row.price);
          host
            .querySelectorAll<HTMLElement>("[data-price-display]")
            .forEach((node) => {
              node.textContent = formatPrice(row.price as number);
            });
        }
      }

      if (typeof row.available === "boolean") {
        item.available = row.available;
        if (host) {
          host.dataset.available = String(row.available);
          host.classList.toggle("opacity-60", !row.available);
          host
            .querySelectorAll<HTMLInputElement>("[data-service-check]")
            .forEach((input) => {
              input.disabled = !row.available;
            });
          host
            .querySelectorAll<HTMLButtonElement>("[data-service-toggle]")
            .forEach((button) => {
              button.disabled = !row.available;
            });
          const unavailable =
            host.querySelector<HTMLElement>("[data-unavailable]");
          if (unavailable) unavailable.hidden = row.available;

          if (!row.available && this.selection.has(id)) {
            this.selection.delete(id);
            saveSelection([...this.selection]);
          }
        }
      }
    }

    this.syncSelectionToUI();
    this.render();
  }

  private async fetchSheet(
    sheetId: string,
    sheetTab: string,
    refreshMinutes: number,
  ) {
    const cacheKey = `${CACHE_KEY}:${sheetId}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { at: number; data: unknown };
        if (Date.now() - parsed.at < refreshMinutes * 60_000) {
          return parsed.data as ReturnType<typeof parseServiceSheet>;
        }
      }
    } catch {
      /* ignore cache errors */
    }

    try {
      const response = await fetch(getSheetCsvUrl(sheetId, sheetTab));
      if (!response.ok) return null;
      const data = parseServiceSheet(await response.text());
      try {
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({ at: Date.now(), data }),
        );
      } catch {
        /* ignore cache write errors */
      }
      return data;
    } catch {
      return null;
    }
  }
}

const config = readConfig();
if (config) {
  new AppointmentApp(config).init();
}
