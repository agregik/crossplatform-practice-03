// Главный процесс (main process) приложения Electron File Explorer.
// Управляет жизненным циклом приложения, создаёт окно и выполняет
// все системные операции (чтение каталога, диалог сохранения, запись файла).
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 700,
    minHeight: 480,
    title: 'Electron File Explorer — Боков Н. Е., ТРПО23-2',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // изоляция контекста preload от страницы
      nodeIntegration: false, // запрет прямого доступа к Node.js из интерфейса
      sandbox: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

// Задание 3: чтение содержимого каталога средствами Node.js (модуль fs).
ipcMain.handle('list-dir', async (event, dir) => {
  const target = path.resolve(dir || '.');
  const entries = await fs.readdir(target, { withFileTypes: true });
  return {
    path: target,
    entries: entries
      .map(e => ({ name: e.name, isDir: e.isDirectory() }))
      .sort((a, b) => (b.isDir - a.isDir) || a.name.localeCompare(b.name, 'ru'))
  };
});

// Задание 4 (вариант 3): «Сохранить заметку» — системный диалог
// сохранения файла (dialog.showSaveDialog) и запись текста (fs.writeFile).
ipcMain.handle('save-note', async (event, text) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Сохранить заметку',
    buttonLabel: 'Сохранить',
    defaultPath: path.join(process.cwd(), 'заметка.txt'),
    filters: [
      { name: 'Текстовые файлы', extensions: ['txt'] },
      { name: 'Markdown', extensions: ['md'] },
      { name: 'Все файлы', extensions: ['*'] }
    ]
  });
  if (canceled || !filePath) {
    return { saved: false };
  }
  await fs.writeFile(filePath, String(text ?? ''), 'utf-8');
  const { size } = await fs.stat(filePath);
  return { saved: true, filePath, size };
});

// События жизненного цикла приложения.
app.whenReady().then(() => {
  createWindow();
  // macOS: приложение продолжает работать без окон; при щелчке по значку
  // в Dock (событие activate) окно создаётся заново.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Windows и Linux: закрытие последнего окна завершает приложение.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
