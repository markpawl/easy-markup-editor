const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file-dialog'),
  saveFile: (content, filePath, saveAs) => ipcRenderer.invoke('save-file', { content, filePath, saveAs }),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', (_event, data) => callback(data)),
  onRequestSave: (callback) => ipcRenderer.on('request-save', () => callback()),
  onRequestSaveAs: (callback) => ipcRenderer.on('request-save-as', () => callback()),
  onRequestNewTab: (callback) => ipcRenderer.on('request-new-tab', () => callback()),
  onRequestCloseTab: (callback) => ipcRenderer.on('request-close-tab', () => callback()),
  reportState: (state) => ipcRenderer.send('session-state', state),
  onSessionRestore: (callback) => ipcRenderer.on('session-restore', (_event, data) => callback(data))
});
