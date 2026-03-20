'use strict';

const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs   = require('fs');
const { autoUpdater } = require('electron-updater');

// ── 개발 모드 여부 ──────────────────────────
const isDev = process.argv.includes('--dev');

// ── 데이터 저장 경로 (userData 폴더 = 설치 후에도 유지) ──
const DATA_DIR  = app.getPath('userData');
const TX_FILE   = path.join(DATA_DIR, 'transactions.json');
const BAL_FILE  = path.join(DATA_DIR, 'init_balance.json');

// ── 메인 윈도우 ─────────────────────────────
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1280,
    height: 980,
    minWidth:  900,
    minHeight: 720,
    useContentSize: true,
    title: '자금일보 관리 시스템',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      preload:         path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // 보안: renderer ↔ main 격리
      nodeIntegration:  false,  // 보안: renderer에서 Node 직접 사용 금지
    },
  });

  // 메인 HTML 로드
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 개발 모드에서만 DevTools 열기
  if (isDev) mainWindow.webContents.openDevTools();

  // 외부 링크는 기본 브라우저로 열기
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── 앱 메뉴 ─────────────────────────────────
function buildMenu() {
  const template = [
    {
      label: '파일',
      submenu: [
        {
          label: '데이터 백업 (JSON)',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu-backup'),
        },
        {
          label: '백업 파일 복원',
          click: () => mainWindow?.webContents.send('menu-restore'),
        },
        { type: 'separator' },
        { label: '종료', role: 'quit' },
      ],
    },
    {
      label: '보기',
      submenu: [
        {
          label: '새로고침',
          accelerator: 'F5',
          click: () => mainWindow?.webContents.reload(),
        },
        { type: 'separator' },
        {
          label: '확대',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => mainWindow?.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 1),
        },
        {
          label: '축소',
          accelerator: 'CmdOrCtrl+-',
          click: () => mainWindow?.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 1),
        },
        {
          label: '기본 크기',
          accelerator: 'CmdOrCtrl+0',
          click: () => mainWindow?.webContents.setZoomLevel(0),
        },
        { type: 'separator' },
        { label: '전체 화면', role: 'togglefullscreen' },
      ],
    },
    {
      label: '도움말',
      submenu: [
        {
          label: '사용자 설명서',
          click: () => {
            const manualPath = path.join(__dirname, '..', 'manual.html');
            if (fs.existsSync(manualPath)) shell.openPath(manualPath);
          },
        },
        {
          label: '데이터 저장 위치 열기',
          click: () => shell.openPath(DATA_DIR),
        },
        { type: 'separator' },
        {
          label: '버전 정보',
          click: () => {
            const { version } = require('../package.json');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '버전 정보',
              message: `자금일보 관리 시스템 v${version}`,
              detail: 'Electron 기반 로컬 설치형 자금 관리 프로그램\nCopyright © 2026 n2soft',
            });
          },
        },
      ],
    },
  ];

  // macOS: 앱 이름 메뉴 추가
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── IPC 핸들러: renderer → main 파일 저장/읽기 ──
//    renderer는 preload를 통해 window.electronAPI.xxx() 호출

ipcMain.handle('save-transactions', async (_e, data) => {
  try {
    fs.writeFileSync(TX_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('load-transactions', async () => {
  try {
    if (!fs.existsSync(TX_FILE)) return { ok: true, data: [] };
    const raw = fs.readFileSync(TX_FILE, 'utf-8');
    return { ok: true, data: JSON.parse(raw) };
  } catch (err) {
    return { ok: false, data: [], error: err.message };
  }
});

ipcMain.handle('save-init-balance', async (_e, data) => {
  try {
    fs.writeFileSync(BAL_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('load-init-balance', async () => {
  try {
    if (!fs.existsSync(BAL_FILE)) return { ok: true, data: null };
    const raw = fs.readFileSync(BAL_FILE, 'utf-8');
    return { ok: true, data: JSON.parse(raw) };
  } catch (err) {
    return { ok: false, data: null, error: err.message };
  }
});

// 파일 저장 다이얼로그 (엑셀 / JSON 백업)
ipcMain.handle('save-file-dialog', async (_e, { defaultName, filters }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: path.join(app.getPath('downloads'), defaultName),
    filters,
  });
  return result; // { canceled, filePath }
});

// 파일 열기 다이얼로그 (JSON 복원 / 은행 파일)
ipcMain.handle('open-file-dialog', async (_e, { filters }) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters,
  });
  return result; // { canceled, filePaths }
});

// 파일 쓰기 (엑셀 버퍼를 파일로 저장)
ipcMain.handle('write-file', async (_e, { filePath, buffer, base64 }) => {
  try {
    const data = base64 ? Buffer.from(base64, 'base64') : Buffer.from(new Uint8Array(buffer));
    fs.writeFileSync(filePath, data);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// 보고서 인쇄 미리보기 (새 창으로 열고 print 다이얼로그 표시)
ipcMain.handle('print-report', async (_e, { html }) => {
  const tmpFile = path.join(app.getPath('temp'), 'jafm_report_print.html');
  fs.writeFileSync(tmpFile, html, 'utf-8');
  const printWin = new BrowserWindow({
    width: 950, height: 900, show: true, title: '자금일보 인쇄',
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  await printWin.loadFile(tmpFile);
  // 렌더링 완료 대기 (CSS/폰트 로딩 시간)
  await new Promise(r => setTimeout(r, 800));
  printWin.webContents.print({ silent: false, printBackground: false }, () => {
    setTimeout(() => {
      if (!printWin.isDestroyed()) printWin.close();
      try { fs.unlinkSync(tmpFile); } catch(e) {}
    }, 500);
  });
  return { ok: true };
});

// 사용자 설명서 열기
ipcMain.handle('open-manual', async () => {
  const manualPath = path.join(__dirname, '..', 'manual.html');
  if (!fs.existsSync(manualPath)) return { ok: false };
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    title: '사용자 설명서',
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  win.loadFile(manualPath);
  return { ok: true };
});

// 파일 읽기 (은행 xlsx / csv)
ipcMain.handle('read-file', async (_e, { filePath }) => {
  try {
    const buf = fs.readFileSync(filePath);
    return { ok: true, buffer: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// ── 앱 생명주기 ─────────────────────────────
// ── 자동 업데이트 ────────────────────────────
function setupAutoUpdater() {
  if (isDev) return; // 개발 모드에서는 실행 안 함

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '업데이트',
      message: '새 버전이 있습니다. 백그라운드에서 다운로드합니다.',
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '업데이트 준비 완료',
      message: '업데이트가 준비되었습니다. 지금 재시작할까요?',
      buttons: ['지금 재시작', '나중에'],
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  });
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  setupAutoUpdater();

  // macOS: Dock 아이콘 클릭 시 창 재생성
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
