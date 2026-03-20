'use strict';

/* =========================================
   엑셀 내보내기
========================================= */
/**
 * 기간 필터를 적용한 거래내역 목록을 날짜 오름차순으로 반환합니다.
 * @param {string} from 시작일 'YYYY-MM-DD'
 * @param {string} to   종료일 'YYYY-MM-DD'
 * @returns {Transaction[]}
 */
function getExportList(from, to) {
  let list = [...transactions].sort((a,b) => a.date.localeCompare(b.date));
  if (from) list = list.filter(t => t.date >= from);
  if (to)   list = list.filter(t => t.date <= to);
  return list;
}

function exportCurrentView() {
  const from    = getVal('filter-from');
  const to      = getVal('filter-to');
  const type    = getVal('filter-type');
  const account = getVal('filter-account');

  let list = [...transactions].sort((a,b) => a.date.localeCompare(b.date));
  if (from)    list = list.filter(t => t.date    >= from);
  if (to)      list = list.filter(t => t.date    <= to);
  if (type)    list = list.filter(t => t.type    === type);
  if (account) list = list.filter(t => t.account === account);

  const parts = [];
  if (from || to) parts.push(`${from||''}~${to||''}`);
  if (type)       parts.push(type);
  if (account)    parts.push(ACCOUNTS.find(a=>a.key===account)?.label || account);
  const suffix = parts.length ? '_' + parts.join('_') : '_전체';

  doExport(list, `자금일보${suffix}`);
}

function exportExcel() {
  const from = getVal('exp-from');
  const to   = getVal('exp-to');
  const acct = getVal('exp-account');
  if (!from || !to) { showToast('기간을 선택해주세요', 'error'); return; }
  let list = getExportList(from, to);
  if (acct) list = list.filter(t => t.account === acct);
  const suffix = acct ? `_${ACCOUNTS.find(a=>a.key===acct)?.label||acct}` : '';
  doExport(list, `자금일보_${from}_${to}${suffix}`);
}

function exportAllExcel() {
  const acct = getVal('exp-account');
  let list = [...transactions].sort((a,b)=>a.date.localeCompare(b.date));
  if (acct) list = list.filter(t => t.account === acct);
  const suffix = acct ? `_${ACCOUNTS.find(a=>a.key===acct)?.label||acct}` : '';
  doExport(list, `자금일보_전체${suffix}`);
}

async function doExport(list, filename) {
  if (!list.length) { showToast('내보낼 데이터가 없습니다', 'error'); return; }

  const prevBal = {}, sumIn = {}, sumOut = {};
  ACCOUNTS.forEach(a => {
    prevBal[a.key] = INIT_BALANCE[a.key] || 0;
    transactions.filter(t => t.date < (list[0]?.date || '9999') && t.account === a.key)
      .forEach(t => { prevBal[a.key] += t.type === '입금' ? t.amount : -t.amount; });
    sumIn[a.key]  = list.filter(t => t.account === a.key && t.type === '입금').reduce((s, t) => s + t.amount, 0);
    sumOut[a.key] = list.filter(t => t.account === a.key && t.type === '출금').reduce((s, t) => s + t.amount, 0);
  });

  const totIn     = list.filter(t => t.type === '입금').reduce((s, t) => s + t.amount, 0);
  const totOut    = list.filter(t => t.type === '출금').reduce((s, t) => s + t.amount, 0);
  const totPrev   = ACCOUNTS.filter(a => a.type !== 'usd').reduce((s, a) => s + (prevBal[a.key] || 0), 0);
  const totBalIn  = ACCOUNTS.filter(a => a.type !== 'usd').reduce((s, a) => s + (sumIn[a.key]  || 0), 0);
  const totBalOut = ACCOUNTS.filter(a => a.type !== 'usd').reduce((s, a) => s + (sumOut[a.key] || 0), 0);
  const totCur    = totPrev + totBalIn - totBalOut;

  const wb = XLSX.utils.book_new();

  const ws1Data = [
    ['날짜', '계좌', '구분', '거래처/내용', '입금', '출금', '비고'],
    ...list.map(t => [
      t.date,
      ACCOUNTS.find(a => a.key === t.account)?.label || t.account,
      t.type,
      t.desc || '',
      t.type === '입금' ? t.amount : '',
      t.type === '출금' ? t.amount : '',
      t.note || '',
    ]),
    ['합 계', '', '', '', totIn, totOut, ''],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ws1Data), '입출금내역');

  const ws2Data = [
    ['계좌', '계좌번호', '전기잔액', '입금합계', '출금합계', '현잔고'],
    ...ACCOUNTS.map(a => {
      const cur = (prevBal[a.key] || 0) + (sumIn[a.key] || 0) - (sumOut[a.key] || 0);
      return [a.label, a.num || '', prevBal[a.key] || 0, sumIn[a.key] || 0, sumOut[a.key] || 0, cur];
    }),
    ['합 계 (원화)', '', totPrev, totBalIn, totBalOut, totCur],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ws2Data), '계좌잔액현황');

  const xlsxFilename = filename + '.xlsx';
  if (isElectron) {
    const { canceled, filePath } = await window.electronAPI.saveFileDialog({
      defaultName: xlsxFilename,
      filters: [{ name: 'Excel 파일', extensions: ['xlsx'] }],
    });
    if (canceled || !filePath) return;
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const res = await window.electronAPI.writeFile({ filePath, base64 });
    if (res.ok) showToast('📥 엑셀 파일이 저장되었습니다', 'success');
    else showToast('❌ 저장 실패: ' + res.error, 'error');
  } else {
    XLSX.writeFile(wb, xlsxFilename);
    showToast('📥 엑셀 파일이 다운로드되었습니다', 'success');
  }
}

/* =========================================
   데이터 백업 / 복원
========================================= */
async function backupData() {
  const today = todayStr();
  const defaultName = `자금일보_백업_${today}.json`;

  const backup = {
    version: 2,
    transactions,
    accounts: getAccountConfig(),
    initBalance: { ...INIT_BALANCE },
    approvalNames: { ...APPROVAL_NAMES },
  };
  const json = JSON.stringify(backup, null, 2);

  if (isElectron) {
    const { canceled, filePath } = await window.electronAPI.saveFileDialog({
      defaultName,
      filters: [{ name: 'JSON 파일', extensions: ['json'] }],
    });
    if (canceled || !filePath) return;
    const bytes = new TextEncoder().encode(json);
    let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const res = await window.electronAPI.writeFile({ filePath, base64: btoa(bin) });
    if (res.ok) showToast('💾 백업 파일이 저장되었습니다', 'success');
    else showToast('❌ 저장 실패: ' + res.error, 'error');
  } else {
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = defaultName;
    a.click();
    showToast('💾 백업 파일이 저장되었습니다', 'success');
  }
}

function restoreData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const raw = JSON.parse(/** @type {string} */ (ev.target.result));

      const isNew = raw && typeof raw === 'object' && !Array.isArray(raw) && raw.version >= 2;
      const txData       = isNew ? (raw.transactions || []) : (Array.isArray(raw) ? raw : []);
      const accData      = isNew ? (raw.accounts     || []) : null;
      const balData      = isNew ? (raw.initBalance  || {}) : {};
      const approvalData = isNew ? (raw.approvalNames || {}) : {};

      const msg = isNew
        ? `거래내역 ${txData.length}건, 계좌 ${accData.length}개 정보를 복원하시겠습니까?\n현재 데이터는 모두 덮어씌워집니다.`
        : `${txData.length}건의 거래내역을 복원하시겠습니까?\n현재 데이터는 유지됩니다.`;
      if (!confirm(msg)) return;

      if (isNew) {
        transactions = txData;
        if (accData) applyAccountConfig(accData);
        INIT_BALANCE = { ...balData };
        if (approvalData.name1) APPROVAL_NAMES.name1 = approvalData.name1;
        if (approvalData.name2) APPROVAL_NAMES.name2 = approvalData.name2;
        saveData();
        saveInitBalance();
      } else {
        const existing = new Set(transactions.map(t => t.id));
        const newItems = txData.filter(t => !existing.has(t.id));
        transactions = [...transactions, ...newItems].sort((a, b) => a.date.localeCompare(b.date));
        saveData();
      }

      renderAll();
      showToast(`✅ 복원 완료 (거래내역 ${txData.length}건${isNew ? ' + 계좌설정' : ''})`, 'success');
    } catch {
      showToast('❌ 파일 형식이 올바르지 않습니다', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function clearAllData() {
  if (!confirm('⚠️ 모든 데이터(거래내역 · 계좌정보 · 잔액)가 삭제됩니다.\n정말 삭제하시겠습니까?')) return;
  if (!confirm('마지막 확인: 삭제된 데이터는 복구할 수 없습니다. 계속하시겠습니까?')) return;
  transactions = [];
  saveData();
  ACCOUNTS = [];
  INIT_BALANCE = {};
  APPROVAL_NAMES = { name1: '담당', name2: '이사' };
  saveInitBalance();
  renderAll();
  showToast('✅ 전체 데이터가 삭제되었습니다', 'success');
}
