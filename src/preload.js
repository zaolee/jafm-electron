'use strict';

/**
 * preload.js
 * renderer(HTML)와 main(Node.js) 사이의 보안 브릿지.
 * contextIsolation = true 이므로 이 파일을 통해서만 IPC 통신 가능.
 * window.electronAPI.xxx() 형태로 renderer에서 사용.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

  // ── 거래 데이터 ──────────────────────────────
  saveTransactions: (data)    => ipcRenderer.invoke('save-transactions', data),
  loadTransactions: ()        => ipcRenderer.invoke('load-transactions'),

  // ── 초기잔액 ────────────────────────────────
  saveInitBalance:  (data)    => ipcRenderer.invoke('save-init-balance', data),
  loadInitBalance:  ()        => ipcRenderer.invoke('load-init-balance'),

  // ── 파일 다이얼로그 ──────────────────────────
  saveFileDialog: (opts)      => ipcRenderer.invoke('save-file-dialog', opts),
  openFileDialog: (opts)      => ipcRenderer.invoke('open-file-dialog', opts),

  // ── 파일 읽기/쓰기 ──────────────────────────
  writeFile: (opts)           => ipcRenderer.invoke('write-file', opts),
  readFile:  (opts)           => ipcRenderer.invoke('read-file', opts),

  // ── 인쇄 / 설명서 ────────────────────────────
  printReport: (opts) => ipcRenderer.invoke('print-report', opts),
  openManual:  ()    => ipcRenderer.invoke('open-manual'),

  // ── 메인 메뉴 → renderer 이벤트 ─────────────
  onMenuBackup:  (cb) => ipcRenderer.on('menu-backup',  () => cb()),
  onMenuRestore: (cb) => ipcRenderer.on('menu-restore', () => cb()),
});
