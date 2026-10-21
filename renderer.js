// Процесс отрисовки (renderer): только интерфейс.
// Системные операции запрашиваются через window.api (preload + IPC).
const btnList = document.getElementById('btn-list');
const dirPath = document.getElementById('dir-path');
const fileList = document.getElementById('file-list');
const note = document.getElementById('note');
const noteInfo = document.getElementById('note-info');
const btnSave = document.getElementById('btn-save');
const statusEl = document.getElementById('status');

async function showDir(highlight) {
  try {
    const { path, entries } = await window.api.listDir('.');
    dirPath.textContent = `Каталог: ${path} (элементов: ${entries.length})`;
    fileList.innerHTML = '';
    for (const entry of entries) {
      const li = document.createElement('li');
      li.textContent = entry.name;
      li.className = entry.isDir ? 'dir' : 'file';
      if (entry.name === highlight) li.classList.add('new');
      fileList.appendChild(li);
    }
  } catch (err) {
    dirPath.textContent = `Ошибка чтения каталога: ${err.message}`;
  }
}

function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.className = kind;
}

btnList.addEventListener('click', () => showDir());

note.addEventListener('input', () => {
  noteInfo.textContent = `${note.value.length} символов`;
});

// Вариант 3: «Сохранить заметку».
btnSave.addEventListener('click', async () => {
  if (!note.value.trim()) {
    setStatus('Заметка пуста — введите текст.', 'warn');
    return;
  }
  try {
    const result = await window.api.saveNote(note.value);
    if (!result.saved) {
      setStatus('Сохранение отменено пользователем.', 'warn');
      return;
    }
    setStatus(`Заметка сохранена: ${result.filePath} (${result.size} байт)`, 'ok');
    const fileName = result.filePath.split(/[\\/]/).pop();
    await showDir(fileName);
  } catch (err) {
    setStatus(`Ошибка сохранения: ${err.message}`, 'err');
  }
});
