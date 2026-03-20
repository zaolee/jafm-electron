'use strict';

/* =========================================
   탭 전환
========================================= */
/**
 * 지정한 탭을 활성화합니다.
 * @param {'input'|'report'|'export'|'settings'} name
 */
function switchTab(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
  if (name === 'input')    renderAll();
  if (name === 'settings') { renderSettingsForm(); renderApprovalForm(); }
}

/* =========================================
   토스트 메시지
========================================= */
let toastTimer;
/**
 * 화면 하단에 토스트 메시지를 표시합니다.
 * @param {string} msg
 * @param {'success'|'error'|''} [type]
 */
function showToast(msg, type='') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show' + (type ? ' '+type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ el.className = ''; }, 2800);
}

/* =========================================
   사용자 설명서
========================================= */
function openManual() {
  if (isElectron) {
    window.electronAPI.openManual();
  } else {
    window.open('../manual.html');
  }
}

/* =========================================
   초기화
========================================= */
(async function init() {
  // 오늘 날짜 헤더
  const now = new Date();
  document.getElementById('todayDate').textContent =
    now.getFullYear() + '년 ' + (now.getMonth()+1) + '월 ' + now.getDate() + '일 (' +
    ['일','월','화','수','목','금','토'][now.getDay()] + ')';

  // 날짜 입력 기본값: 오늘
  setVal('f-date', todayStr());

  // 보고서 기간 기본값: 이번 주 월요일 ~ 일요일
  const dow = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  setVal('rpt-from', mon.toISOString().slice(0, 10));
  setVal('rpt-to',   sun.toISOString().slice(0, 10));

  // 데이터 로드 (Electron: IPC, 브라우저: localStorage)
  await loadInitBalance();
  await loadData();

  // 입출금 내역 기간 디폴트: 이번 주 월~일
  setVal('filter-from', mon.toISOString().slice(0, 10));
  setVal('filter-to',   sun.toISOString().slice(0, 10));

  // 계좌 드롭다운 초기화
  refreshAccountDropdowns();
  renderAll();

  // Electron 메뉴 이벤트 연결
  if (isElectron) {
    window.electronAPI.onMenuBackup(backupData);
    window.electronAPI.onMenuRestore(() => /** @type {HTMLElement} */ (document.querySelector('input[accept=".json"]'))?.click());
  }
})();
