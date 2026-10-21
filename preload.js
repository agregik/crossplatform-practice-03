// Скрипт предзагрузки: работает в привилегированном изолированном контексте
// и публикует для интерфейса «тонкий» API window.api.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listDir: (dir) => ipcRenderer.invoke('list-dir', dir),
  saveNote: (text) => ipcRenderer.invoke('save-note', text)
});
