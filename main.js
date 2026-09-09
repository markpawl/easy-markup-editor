const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { existsSync } = require('fs');

let mainWindow;
let currentFilePath = null;

// --- Recent files ------------------------------------------------------------
// Minimal main-process store: an array of absolute paths, most-recent first,
// persisted as JSON under userData. Work set #2 (session restore) will fold
// this into a shared store.

const RECENT_MAX = 5;
let recentPaths = [];

function recentStorePath() {
  return path.join(app.getPath('userData'), 'recent.json');
}

function sameFile(a, b) {
  return process.platform === 'win32'
    ? a.toLowerCase() === b.toLowerCase()
    : a === b;
}

async function loadRecent() {
  try {
    const parsed = JSON.parse(await fs.readFile(recentStorePath(), 'utf-8'));
    if (Array.isArray(parsed)) {
      recentPaths = parsed.filter(p => typeof p === 'string');
    }
  } catch {
    recentPaths = [];
  }
}

async function saveRecent() {
  try {
    await fs.writeFile(recentStorePath(), JSON.stringify(recentPaths, null, 2), 'utf-8');
  } catch (err) {
    console.error('Could not write recent.json:', err);
  }
}

async function addRecent(filePath) {
  const resolved = path.resolve(filePath);
  recentPaths = [resolved, ...recentPaths.filter(p => !sameFile(p, resolved))].slice(0, RECENT_MAX);
  await saveRecent();
  buildMenu();
}

async function pruneRecent(filePath) {
  const resolved = path.resolve(filePath);
  const kept = recentPaths.filter(p => !sameFile(p, resolved));
  if (kept.length !== recentPaths.length) {
    recentPaths = kept;
    await saveRecent();
    buildMenu();
  }
}

async function clearRecent() {
  recentPaths = [];
  await saveRecent();
  buildMenu();
}

// Paths that still exist on disk, in stored order.
function existingRecent() {
  return recentPaths.filter(p => existsSync(p));
}

// --- Window & menu ---------------------------------------------------------

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 760,
    minHeight: 480,
    backgroundColor: '#EEF0EE',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  buildMenu();
}

function recentSubmenu() {
  const items = existingRecent();
  if (!items.length) {
    return [{ label: '(No recent files)', enabled: false }];
  }
  return [
    ...items.map(p => ({ label: p, click: () => openPath(p) })),
    { type: 'separator' },
    { label: 'Clear Recent Files', click: () => clearRecent() }
  ];
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'Open…', accelerator: 'CmdOrCtrl+O', click: () => openFile() },
        { label: 'Open Recent', submenu: recentSubmenu() },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('request-save') },
        { label: 'Save As…', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow.webContents.send('request-save-as') },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// --- Open / save ---------------------------------------------------------

async function openPath(filePath) {
  let content;
  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    dialog.showErrorBox('Could not open file', `${filePath}\n\n${err.message}`);
    await pruneRecent(filePath);
    return;
  }
  currentFilePath = filePath;
  mainWindow.webContents.send('file-opened', { filePath, content });
  await addRecent(filePath);
}

async function openFile() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
      { name: 'All files', extensions: ['*'] }
    ]
  });
  if (result.canceled || !result.filePaths.length) return;
  await openPath(result.filePaths[0]);
}

ipcMain.handle('open-file-dialog', async () => {
  await openFile();
});

ipcMain.handle('save-file', async (event, { content, saveAs }) => {
  let filePath = currentFilePath;
  let viaDialog = false;
  if (saveAs || !filePath) {
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: 'Markdown', extensions: ['md'] }],
      defaultPath: filePath || 'untitled.md'
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    filePath = result.filePath;
    viaDialog = true;
  }
  await fs.writeFile(filePath, content, 'utf-8');
  currentFilePath = filePath;
  if (viaDialog) await addRecent(filePath);
  return { canceled: false, filePath };
});

app.whenReady().then(async () => {
  await loadRecent();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
