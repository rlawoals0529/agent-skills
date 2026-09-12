/**
 * The catalogue.
 *
 * Design read: a catalogue of FAILURES, indexed by the skill that prevents each one. The
 * repository is organised that way - every skill is here because something kept going wrong -
 * so the failure leads and the skill's name is the answer to it, the way a catalogue entry
 * names the part that fixes the thing you looked up.
 *
 * Everything on the page is generated from the skills themselves by scripts/build-catalogue.mjs,
 * including the triggers, which come from `agent-skill-lint`'s own `triggersOf`. A second
 * definition of "trigger" would mean the linter that checks these skills for colliding
 * triggers and the page that lists them were describing different things.
 */
import { createThemeStore, DEFAULT_THEME, grouped, type Theme } from "./lib/theme.js";
import { wirePalette } from "./lib/palette-keys.js";

interface Entry {
  name: string;
  dir: string;
  failure: string;
  description: string;
  triggers: string[];
}

const catalogue = (await fetch("./catalogue.json").then((r) => r.json())) as Entry[];
const list = document.getElementById("catalogue")!;
const query = document.getElementById("q") as HTMLInputElement;
const count = document.getElementById("count")!;

const REPO = "https://github.com/rlawoals0529/agent-skills/tree/main/skills";

function render(entries: readonly Entry[], typed: string): void {
  list.replaceChildren(
    ...entries.map((e) => {
      const item = document.createElement("li");
      item.className = "entry";
      item.dataset.skill = e.name;

      const failure = document.createElement("p");
      failure.className = "failure";
      failure.textContent = e.failure;

      const answer = document.createElement("a");
      answer.className = "answer";
      answer.href = `${REPO}/${e.dir}`;
      answer.textContent = e.name;

      const triggers = document.createElement("ul");
      triggers.className = "triggers";
      for (const t of e.triggers) {
        const chip = document.createElement("li");
        // Marked when it is why this entry is on screen, so a filtered list says WHICH
        // phrase matched rather than leaving you to find it.
        chip.className = typed && t.includes(typed) ? "trigger hit" : "trigger";
        chip.textContent = t;
        triggers.append(chip);
      }

      item.append(failure, answer, triggers);
      return item;
    }),
  );
}

function filter(): void {
  const typed = query.value.trim().toLowerCase();
  const matched = typed ? catalogue.filter((e) => e.triggers.some((t) => t.includes(typed))) : catalogue;
  render(matched, typed);

  if (!typed) {
    count.textContent = `${catalogue.length} skills, ${catalogue.reduce((n, e) => n + e.triggers.length, 0)} trigger phrases.`;
    return;
  }
  count.textContent =
    matched.length === 0
      ? `No trigger contains "${typed}". A harness might still route to one of these: it reads the description, not the quoted phrases.`
      : `${matched.length} of ${catalogue.length} skills claim a trigger containing "${typed}".`;
}

query.addEventListener("input", filter);
filter();

/* ---- palette ---------------------------------------------------------------------------- */

const THEMES = (await fetch("./theme/palettes.json").then((r) => r.json())) as Theme[];
const store = createThemeStore(THEMES, "twilight-comet", "agent-skills:theme");
let chosen = store.initial();

const host = document.getElementById("palette-host")!;
host.innerHTML = `
  <section class="palette">
    <button class="palette-toggle" type="button" aria-expanded="false" aria-controls="palette-list">
      <span class="palette-chip" aria-hidden="true" id="chip"></span>
      <span class="sr-only">Palette: </span><span id="palette-name"></span>
    </button>
    <div class="palette-list" id="palette-list" hidden></div>
  </section>`;

const plist = document.getElementById("palette-list")!;
const toggle = document.querySelector<HTMLButtonElement>(".palette-toggle")!;
const chip = document.getElementById("chip")!;
const nameOut = document.getElementById("palette-name")!;
const options: HTMLElement[] = [];

for (const group of grouped(THEMES)) {
  const set = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = group.label;
  set.append(legend);
  for (const t of group.themes) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.theme = t.id;
    // data-theme on the CHIP too: on the button alone it rescopes --fg and --dim, so the
    // option's own label gets painted in a palette the page is not showing.
    const swatch = document.createElement("span");
    swatch.className = "palette-chip";
    swatch.setAttribute("aria-hidden", "true");
    swatch.dataset.theme = t.id;
    b.append(swatch, t.label);
    options.push(b);
    set.append(b);
  }
  plist.append(set);
}

function select(id: string): void {
  chosen = store.apply(id);
  nameOut.textContent = THEMES.find((x) => x.id === chosen)?.label ?? "Palette";
  chip.dataset.theme = chosen;
}

function setOpen(open: boolean): void {
  toggle.setAttribute("aria-expanded", String(open));
  plist.hidden = !open;
  if (!open) toggle.focus();
}

const picker = wirePalette(plist, options, { select, current: () => chosen, onEscape: () => setOpen(false) });
toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
select(chosen);
picker.refresh();
