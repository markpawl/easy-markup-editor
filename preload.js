const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file-dialog'),
  saveFile: (content, saveAs) => ipcRenderer.invoke('save-file', { content, saveAs }),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', (_event, data) => callback(data)),
  onRequestSave: (callback) => ipcRenderer.on('request-save', () => callback()),
  onRequestSaveAs: (callback) => ipcRenderer.on('request-save-as', () => callback())
});
