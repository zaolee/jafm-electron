'use strict';

/* =========================================
   계좌 카드 렌더
========================================= */
/**
 * 계좌 잔액 카드를 렌더링합니다.
 * @param {BalanceMap} [bal] 생략 시 calcBalance()로 계산
 */
function renderAccountCards(bal) {
  bal = bal || calcBalance();
  const html = ACCOUNTS.map(a => {
    const v = bal[a.key] || 0;
    const isNeg  = v < 0;
    const isUsd  = a.type === 'usd';
    const isCash = a.type === 'cash';
    const cls = (isUsd ? 'foreign' : isCash ? 'cash' : '') + (isNeg ? ' negative-balance' : '');
    const dispBal = isUsd ? fmtUsd(v) : fmtKrw(v);
    const balClass = isNeg ? 'acc-bal negative' : 'acc-bal';
    const badge = isNeg
      ? '<span class="warn-badge">⚠️ 잔액 부족</span>'
      : a.type === 'usd'  ? '<span class="acc-badge" style="background:#f0edff;color:#6c5ce7;">USD</span>'
      : a.type === 'cash' ? '<span class="acc-badge" style="background:#e6f5ec;color:#0f6e3a;">현금</span>'
      : '<span class="acc-badge">원화</span>';
    return `
      <div class="acc-card ${cls}">
        ${badge}
        <div class="acc-name">${esc(a.label)}</div>
        ${a.num ? `<div class="acc-num">${esc(a.num)}</div>` : ''}
        <div class="${balClass}">${dispBal}</div>
        ${isNeg ? '<div class="acc-shortage">마이너스 상태입니다</div>' : ''}
      </div>`;
  }).join('');
  document.getElementById('accountCards').innerHTML = html;

  const total = getTotal(bal);
  document.getElementById('totalFund').textContent =
    '₩ ' + total.toLocaleString('ko-KR');
}

/* =========================================
   거래 목록 렌더
========================================= */
/**
 * 현재 필터 조건에 맞는 거래내역 목록을 테이블에 렌더링합니다.
 */
function renderTransactions() {
  const from = getVal('filter-from');
  const to   = getVal('filter-to');

  const typeFilter    = document.getElementById('filter-type')?.value    || '';
  const accountFilter = document.getElementById('filter-account')?.value || '';

  let list = [...transactions].sort((a,b) => b.date.localeCompare(a.date));
  if (from)          list = list.filter(t => t.date >= from);
  if (to)            list = list.filter(t => t.date <= to);
  if (typeFilter)    list = list.filter(t => t.type    === typeFilter);
  if (accountFilter) list = list.filter(t => t.account === accountFilter);

  const tbody = document.getElementById('txBody');
  if (!list.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8">📭 내역이 없습니다</td></tr>';
    return;
  }

  const isUsdAccount = (key) => ACCOUNTS.find(a => a.key === key)?.type === 'usd';

  tbody.innerHTML = list.map(tx => {
    const inAmt  = tx.type === '입금' ? (isUsdAccount(tx.account) ? fmtUsd(tx.amount) : fmtKrw(tx.amount)) : '';
    const outAmt = tx.type === '출금' ? (isUsdAccount(tx.account) ? fmtUsd(tx.amount) : fmtKrw(tx.amount)) : '';
    return `
      <tr>
        <td>${fmtDate(tx.date)}</td>
        <td>${esc(getAccDisplay(tx.account))}</td>
        <td><span style="color:${tx.type==='입금'?'var(--primary)':'var(--accent)'};font-weight:700;">${esc(tx.type)}</span></td>
        <td class="td-left">${esc(tx.desc) || '-'}</td>
        <td class="amount-in">${inAmt}</td>
        <td class="amount-out">${outAmt}</td>
        <td style="color:var(--text-muted);font-size:13px;">${esc(tx.note)}</td>
        <td><button class="del-btn" onclick="deleteTransaction('${tx.id}')">삭제</button></td>
      </tr>`;
  }).join('');
}

/* =========================================
   계좌 드롭다운 갱신
========================================= */
/**
 * 계좌 선택 드롭다운(입력폼·필터·내보내기·은행가져오기)을 ACCOUNTS 기준으로 갱신합니다.
 */
function refreshAccountDropdowns() {
  const opts = ACCOUNTS.map(a => `<option value="${esc(a.key)}">${esc(a.label)}</option>`).join('');
  const fAcct     = document.getElementById('f-account');
  const impAcct   = document.getElementById('import-account');
  const expAcct   = document.getElementById('exp-account');
  const filterAcc = document.getElementById('filter-account');
  if (fAcct)   fAcct.innerHTML   = opts;
  if (impAcct) impAcct.innerHTML = opts;
  if (expAcct) expAcct.innerHTML = `<option value="">전체 계좌</option>` + opts;
  if (filterAcc) filterAcc.innerHTML = `<option value="">전체 계좌</option>` + opts;
}

/* =========================================
   전체 렌더
========================================= */
/**
 * 카드·거래목록·설정폼·드롭다운을 전부 다시 그립니다.
 */
function renderAll() {
  const bal = calcBalance();
  renderAccountCards(bal);
  renderTransactions();
  renderSettingsForm(bal);
  renderApprovalForm();
  refreshAccountDropdowns();
}
