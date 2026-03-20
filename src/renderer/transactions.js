'use strict';

/* =========================================
   거래 추가 / 삭제
========================================= */
/**
 * 입력 폼 값을 읽어 새 거래내역을 추가하고 저장·렌더링합니다.
 */
function addTransaction() {
  const date    = getVal('f-date');
  const account = getVal('f-account');
  const type    = getVal('f-type');
  const amtRaw  = getVal('f-amount');
  const desc    = getVal('f-desc').trim();
  const note    = getVal('f-note').trim();
  const amount  = parseAmount(amtRaw);

  if (!date)   { showToast('날짜를 입력해주세요', 'error'); return; }
  if (!amount) { showToast('금액을 입력해주세요', 'error'); return; }
  if (!desc)   { showToast('거래처/내용을 입력해주세요', 'error'); return; }

  transactions.push({ id: crypto.randomUUID(), date, account, type, amount, desc, note });
  saveData();
  renderAll();
  clearForm();
  showToast('✅ 저장되었습니다', 'success');
}

/**
 * UUID로 거래내역을 찾아 삭제합니다.
 * @param {string} id 삭제할 거래내역의 UUID
 */
function deleteTransaction(id) {
  if (!confirm('이 내역을 삭제하시겠습니까?')) return;
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) { showToast('❌ 삭제할 내역을 찾을 수 없습니다', 'error'); return; }
  transactions.splice(idx, 1);
  saveData();
  renderAll();
  showToast('삭제되었습니다');
}

/** 입력 폼의 금액·거래처·비고 필드를 초기화합니다. */
function clearForm() {
  setVal('f-amount', '');
  setVal('f-desc',   '');
  setVal('f-note',   '');
}

/** 거래내역 목록의 모든 필터를 초기화하고 전체 목록을 표시합니다. */
function clearFilter() {
  setVal('filter-from', '');
  setVal('filter-to',   '');
  const ft = document.getElementById('filter-type');    if (ft) ft.value = '';
  const fa = document.getElementById('filter-account'); if (fa) fa.value = '';
  renderAll();
}
