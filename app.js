const STORAGE_KEY = "study-log.entries.v1";

const form = document.querySelector("#study-form");
const dateInput = document.querySelector("#entry-date");
const subjectInput = document.querySelector("#entry-subject");
const minutesInput = document.querySelector("#entry-minutes");
const noteInput = document.querySelector("#entry-note");
const clearButton = document.querySelector("#clear-button");
const entryList = document.querySelector("#entry-list");
const emptyState = document.querySelector("#empty-state");
const saveState = document.querySelector("#save-state");
const charCount = document.querySelector("#char-count");
const editingLabel = document.querySelector("#editing-label");
const totalMinutes = document.querySelector("#total-minutes");
const studyDays = document.querySelector("#study-days");
const entryCount = document.querySelector("#entry-count");
const summaryRow = document.querySelector("#summary-row");
const searchInput = document.querySelector("#search-input");
const subjectFilter = document.querySelector("#subject-filter");

let entries = loadEntries();
let editingEntryId = null;

function loadEntries() {
  const rawEntries = localStorage.getItem(STORAGE_KEY);

  if (!rawEntries) {
    return [];
  }

  try {
    const parsedEntries = JSON.parse(rawEntries);
    return Array.isArray(parsedEntries)
      ? parsedEntries.filter(
          (entry) =>
            entry &&
            typeof entry.id === "string" &&
            typeof entry.date === "string" &&
            typeof entry.subject === "string" &&
            Number.isInteger(entry.minutes) &&
            entry.minutes > 0 &&
            typeof entry.note === "string",
        )
      : [];
  } catch {
    return [];
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getTodayIso() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function parseIsoDate(dateText) {
  return new Date(`${dateText}T00:00:00`);
}

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(dateText) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(parseIsoDate(dateText));
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFilteredEntries() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedSubject = subjectFilter.value;

  return entries.filter((entry) => {
    const matchesSubject = selectedSubject === "all" || entry.subject === selectedSubject;
    const searchableText = `${entry.date} ${entry.subject} ${entry.note}`.toLowerCase();
    const matchesQuery = !query || searchableText.includes(query);

    return matchesSubject && matchesQuery;
  });
}

function renderEntries() {
  const filteredEntries = getFilteredEntries();

  entryList.innerHTML = filteredEntries
    .map(
      (entry) => `
        <li class="entry-card">
          <div class="entry-topline">
            <span class="entry-date">${formatDate(entry.date)}</span>
            <span class="duration-badge">${entry.minutes}分</span>
          </div>
          <h3 class="entry-subject">${escapeHtml(entry.subject)}</h3>
          ${entry.note ? `<p class="entry-note">${escapeHtml(entry.note)}</p>` : ""}
          <div class="entry-actions">
            <button type="button" data-action="edit" data-entry-id="${escapeHtml(entry.id)}">編集</button>
            <button class="danger-button" type="button" data-action="delete" data-entry-id="${escapeHtml(entry.id)}">削除</button>
          </div>
        </li>
      `,
    )
    .join("");

  if (entries.length > 0 && filteredEntries.length === 0) {
    emptyState.innerHTML = `
      <span class="empty-mark" aria-hidden="true">⌕</span>
      <strong>条件に合う記録がありません</strong>
      <span>検索ワードや学習内容の絞り込みを変えてみてください。</span>
    `;
  } else {
    emptyState.innerHTML = `
      <span class="empty-mark" aria-hidden="true">✎</span>
      <strong>学習記録はまだありません</strong>
      <span>今日取り組んだことを記録してみましょう。</span>
    `;
  }

  emptyState.hidden = filteredEntries.length > 0;
  entryList.hidden = filteredEntries.length === 0;
}

function renderSummary() {
  const total = entries.reduce((sum, entry) => sum + entry.minutes, 0);
  const days = new Set(entries.map((entry) => entry.date)).size;
  const subjectTotals = new Map();

  entries.forEach((entry) => {
    subjectTotals.set(entry.subject, (subjectTotals.get(entry.subject) ?? 0) + entry.minutes);
  });

  totalMinutes.textContent = total.toLocaleString("ja-JP");
  studyDays.textContent = days.toLocaleString("ja-JP");
  entryCount.textContent = entries.length.toLocaleString("ja-JP");
  summaryRow.innerHTML = [...subjectTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(
      ([subject, minutes]) =>
        `<span class="summary-chip">${escapeHtml(subject)} <strong>${minutes.toLocaleString("ja-JP")}分</strong></span>`,
    )
    .join("");

  const currentSubject = subjectFilter.value;
  const subjects = [...new Set(entries.map((entry) => entry.subject))].sort((a, b) =>
    a.localeCompare(b, "ja"),
  );
  subjectFilter.replaceChildren(new Option("すべての学習", "all"));
  subjects.forEach((subject) => {
    subjectFilter.add(new Option(subject, subject));
  });
  subjectFilter.value = subjects.includes(currentSubject) ? currentSubject : "all";
}

function render() {
  entries.sort((a, b) => b.date.localeCompare(a.date));
  renderSummary();
  renderEntries();
}

function resetForm() {
  form.reset();
  dateInput.value = getTodayIso();
  editingEntryId = null;
  editingLabel.textContent = "新しい学習記録";
  updateCharCount();
  updateSaveState("入力待ち");
}

function updateCharCount() {
  charCount.textContent = noteInput.value.length;
}

function updateSaveState(text) {
  saveState.textContent = text;
}

function loadEntryIntoForm(entry) {
  editingEntryId = entry.id;
  dateInput.value = entry.date;
  subjectInput.value = entry.subject;
  minutesInput.value = entry.minutes;
  noteInput.value = entry.note;
  editingLabel.textContent = `${formatDate(entry.date)}の記録を編集中`;
  updateCharCount();
  updateSaveState("編集中");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const date = dateInput.value;
  const subject = subjectInput.value.trim();
  const minutes = Number(minutesInput.value);
  const note = noteInput.value.trim();

  if (!date || !subject || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
    updateSaveState("入力を確認");
    return;
  }

  const existingIndex = entries.findIndex((entry) => entry.id === editingEntryId);
  const now = new Date().toISOString();
  const nextEntry = {
    id: existingIndex >= 0 ? entries[existingIndex].id : createId(),
    date,
    subject,
    minutes,
    note,
    createdAt: existingIndex >= 0 ? entries[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    entries[existingIndex] = nextEntry;
  } else {
    entries.push(nextEntry);
  }

  saveEntries();
  render();
  resetForm();
  updateSaveState("保存しました");
});

for (const input of [dateInput, subjectInput, minutesInput]) {
  input.addEventListener("input", () => updateSaveState("編集中"));
}

noteInput.addEventListener("input", () => {
  updateCharCount();
  updateSaveState("編集中");
});

dateInput.addEventListener("change", () => {
  editingEntryId = null;
  const previousEntry = entries
    .filter((entry) => entry.date === dateInput.value)
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))[0];

  if (!previousEntry) {
    subjectInput.value = "";
    minutesInput.value = "";
    noteInput.value = "";
    editingLabel.textContent = "新しい学習記録";
    updateCharCount();
    updateSaveState("入力待ち");
    return;
  }

  subjectInput.value = previousEntry.subject;
  minutesInput.value = previousEntry.minutes;
  noteInput.value = previousEntry.note;
  editingLabel.textContent = `${formatDate(previousEntry.date)}の記録を表示中`;
  updateCharCount();
  updateSaveState("過去の記録を表示");
});

clearButton.addEventListener("click", resetForm);

entryList.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const entry = entries.find((item) => item.id === button.dataset.entryId);

  if (!entry) {
    return;
  }

  if (button.dataset.action === "edit") {
    loadEntryIntoForm(entry);
    document.querySelector(".editor-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (button.dataset.action === "delete") {
    const shouldDelete = confirm(`${formatDate(entry.date)}の「${entry.subject}」の記録を削除しますか？`);

    if (!shouldDelete) {
      return;
    }

    entries = entries.filter((item) => item.id !== entry.id);
    saveEntries();
    render();

    if (editingEntryId === entry.id) {
      resetForm();
    }
  }
});

searchInput.addEventListener("input", renderEntries);
subjectFilter.addEventListener("change", renderEntries);

dateInput.value = getTodayIso();
updateCharCount();
render();
