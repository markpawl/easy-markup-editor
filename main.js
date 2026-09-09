const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { existsSync, writeFileSync } = require('fs');

let mainWindow;

// --- Persistent store ------------------------------------------------------
// One JSON file under userData holds everything that outlives the renderer:
// the recent-files list and the last session. Recent-files changes are
// written immediately; session writes are additionally debounced (see the
// Session section).

const RECENT_MAX = 5;

let store = {
  recentFiles: [], // absolute paths, most-recent first, max RECENT_MAX
  session: null    // { filePath, fileName, content, dirty } | null
};

function storePath() {
  return path.join(app.getPath('userData'), 'state.json');
}

function legacyRecentPath() {
  return path.join(app.getPath('userData'), 'recent.json');
}

function sameFile(a, b) {
  return process.platform === 'win32'
    ? a.toLowerCase() === b.toLowerCase()
    : a === b;
}

// Normalize a session to { tabs: [{ filePath, fileName, content, dirty }], activeIndex }.
// Accepts the legacy single-doc shape ({ filePath, fileName, content, dirty }).
function sanitizeSession(s) {
  if (!s || typeof s !== 'object') return null;
  let list;
  if (Array.isArray(s.tabs)) {
    list = s.tabs;
  } else if ('content' in s || 'filePath' in s || 'fileName' in s) {
    list = [s];
  } else {
    return null;
  }
  const tabs = list
    .filter(t => t && typeof t === 'object')
    .map(t => ({
      filePath: typeof t.filePath === 'string' && t.filePath ? t.filePath : null,
      fileName: typeof t.fileName === 'string' && t.fileName ? t.fileName : 'Untitled.md',
      content: typeof t.content === 'string' ? t.content : '',
      dirty: !!t.dirty
    }));
  if (!tabs.length) return null;
  let activeIndex = Number.isInteger(s.activeIndex) ? s.activeIndex : 0;
  if (activeIndex < 0 || activeIndex >= tabs.length) activeIndex = 0;
  return { tabs, activeIndex };
}

function sanitizeStore(raw) {
  const out = { recentFiles: [], session: null };
  if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.recentFiles)) {
      out.recentFiles = raw.recentFiles.filter(p => typeof p === 'string').slice(0, RECENT_MAX);
    }
    out.session = sanitizeSession(raw.session);
  }
  return out;
}

async function loadStore() {
  try {
    store = sanitizeStore(JSON.parse(await fs.readFile(storePath(), 'utf-8')));
    return;
  } catch {
    // no readable state.json — try a one-time import of the legacy recent.json
  }
  try {
    const legacy = JSON.parse(await fs.readFile(legacyRecentPath(), 'utf-8'));
    if (Array.isArray(legacy)) {
      store = sanitizeStore({ recentFiles: legacy });
      await writeStore();
    }
  } catch {
    store = sanitizeStore(null);
  }
}

async function writeStore() {
  try {
    await fs.writeFile(storePath(), JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Could not write state.json:', err);
  }
}

let storeWriteTimer = null;

// Debounced write, for the frequent session-state pushes from the renderer.
function scheduleStoreWrite() {
  if (storeWriteTimer) clearTimeout(storeWriteTimer);
  storeWriteTimer = setTimeout(() => {
    storeWriteTimer = null;
    writeStore();
  }, 600);
}

// Synchronous flush for the quit path, where async writes may not finish.
function writeStoreSync() {
  if (storeWriteTimer) {
    clearTimeout(storeWriteTimer);
    storeWriteTimer = null;
  }
  try {
    writeFileSync(storePath(), JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Could not write state.json on quit:', err);
  }
}

// --- Session ------------------------------------------------------------
// The renderer pushes { content, fileName, dirty } on every change
// (debounced on its side). Main attaches the current file path — which it
// owns — and persists it debounced, plus a synchronous flush on quit.

ipcMain.on('session-state', (event, s) => {
  const clean = sanitizeSession(s);
  if (!clean) return;
  store.session = clean;
  scheduleStoreWrite();
});

// Build the restore payload from the persisted session and hand it to the
// renderer once the page is ready. Per tab: a dirty tab restores its buffer
// as-is; a clean one re-reads its file from disk (fresher), falling back to
// the buffer — marked unsaved — if the file is gone.
async function sendSessionRestore(win) {
  const s = store.session;
  if (!s || !s.tabs.length) {
    win.webContents.send('session-restore', null);
    return;
  }

  const tabs = [];
  for (const t of s.tabs) {
    let content = t.content;
    let dirty = t.dirty;
    if (t.filePath && !dirty) {
      try {
        content = await fs.readFile(t.filePath, 'utf-8');
      } catch {
        dirty = true;
      }
    }
    tabs.push({
      filePath: t.filePath,
      fileName: t.fileName || (t.filePath ? path.basename(t.filePath) : 'Untitled.md'),
      content,
      dirty
    });
  }

  win.webContents.send('session-restore', { tabs, activeIndex: s.activeIndex });
}

// --- Recent files --------------------------------------------------------

async function addRecent(filePath) {
  const resolved = path.resolve(filePath);
  store.recentFiles = [resolved, ...store.recentFiles.filter(p => !sameFile(p, resolved))].slice(0, RECENT_MAX);
  await writeStore();
  buildMenu();
}

async function pruneRecent(filePath) {
  const resolved = path.resolve(filePath);
  const kept = store.recentFiles.filter(p => !sameFile(p, resolved));
  if (kept.length !== store.recentFiles.length) {
    store.recentFiles = kept;
    await writeStore();
    buildMenu();
  }
}

async function clearRecent() {
  store.recentFiles = [];
  await writeStore();
  buildMenu();
}

// Paths that still exist on disk, in stored order.
function existingRecent() {
  return store.recentFiles.filter(p => existsSync(p));
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
  mainWindow.webContents.once('did-finish-load', () => sendSessionRestore(mainWindow));
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
        { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.send('request-new-tab') },
        { label: 'Open…', accelerator: 'CmdOrCtrl+O', click: () => openFile() },
        { label: 'Open Recent', submenu: recentSubmenu() },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('request-save') },
        { label: 'Save As…', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow.webContents.send('request-save-as') },
        { type: 'separator' },
        { label: 'Close Tab', accelerator: 'CmdOrCtrl+W', click: () => mainWindow.webContents.send('request-close-tab') },
        isMac ? { role: 'close', accelerator: 'CmdOrCtrl+Shift+W' } : { role: 'quit' }
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

ipcMain.handle('save-file', async (event, { content, filePath, saveAs }) => {
  let target = typeof filePath === 'string' && filePath ? filePath : null;
  let viaDialog = false;
  if (saveAs || !target) {
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: 'Markdown', extensions: ['md'] }],
      defaultPath: target || 'untitled.md'
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    target = result.filePath;
    viaDialog = true;
  }
  await fs.writeFile(target, content, 'utf-8');
  if (viaDialog) await addRecent(target);
  return { canceled: false, filePath: target };
});

app.whenReady().then(async () => {
  await loadStore();
  createWindow();
});

app.on('before-quit', () => {
  writeStoreSync();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
