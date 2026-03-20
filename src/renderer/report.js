'use strict';

/* =========================================
   보고서 생성
========================================= */
function renderReport() {
  const from = getVal('rpt-from');
  const to   = getVal('rpt-to');
  if (!from || !to) { showToast('기간을 선택해주세요', 'error'); return; }

  const rptType = document.getElementById('rpt-type')?.value || '';
  const list = transactions.filter(t =>
    t.date >= from && t.date <= to && (!rptType || t.type === rptType)
  );

  const prevBal = {};
  ACCOUNTS.forEach(a => {
    let b = INIT_BALANCE[a.key] || 0;
    transactions.filter(t => t.date < from && t.account === a.key).forEach(t => {
      b += t.type === '입금' ? t.amount : -t.amount;
    });
    prevBal[a.key] = b;
  });

  const sumIn  = {};
  const sumOut = {};
  ACCOUNTS.forEach(a => { sumIn[a.key] = 0; sumOut[a.key] = 0; });
  list.forEach(t => {
    if (t.type === '입금') sumIn[t.account]  = (sumIn[t.account]  || 0) + t.amount;
    else                   sumOut[t.account] = (sumOut[t.account] || 0) + t.amount;
  });

  const curBal = {};
  ACCOUNTS.forEach(a => { curBal[a.key] = (prevBal[a.key] || 0) + (sumIn[a.key] || 0) - (sumOut[a.key] || 0); });

  const accountRows = ACCOUNTS.map(a => {
    const isUsd = a.type === 'usd';
    const fmt = isUsd ? fmtUsd : fmtKrw;
    const totalIn  = sumIn[a.key]  || 0;
    const totalOut = sumOut[a.key] || 0;
    const cur = curBal[a.key] || 0;
    if (!prevBal[a.key] && !totalIn && !totalOut) return '';
    return `<tr>
      <td class="td-name">${esc(a.label)}</td>
      <td>${esc(a.num) || ''}</td>
      <td style="text-align:right;">${fmt(prevBal[a.key])}</td>
      <td style="text-align:right;color:var(--primary);">${totalIn ? fmt(totalIn) : '-'}</td>
      <td style="text-align:right;color:var(--accent);">${totalOut ? fmt(totalOut) : '-'}</td>
      <td style="text-align:right;font-weight:700;">${fmt(cur)}</td>
    </tr>`;
  }).join('');

  const totPrev = ACCOUNTS.filter(a=>a.type!=='usd').reduce((s,a)=>s+(prevBal[a.key]||0),0);
  const totIn   = ACCOUNTS.filter(a=>a.type!=='usd').reduce((s,a)=>s+(sumIn[a.key]||0),0);
  const totOut  = ACCOUNTS.filter(a=>a.type!=='usd').reduce((s,a)=>s+(sumOut[a.key]||0),0);
  const totCur  = ACCOUNTS.filter(a=>a.type!=='usd').reduce((s,a)=>s+(curBal[a.key]||0),0);

  const sortedList = [...list].sort((a, b) => a.date.localeCompare(b.date));
  const combinedRows = sortedList.length
    ? sortedList.map(t => {
        const isUsd = ACCOUNTS.find(a => a.key === t.account)?.type === 'usd';
        const inAmt  = t.type === '입금' ? (isUsd ? fmtUsd(t.amount) : fmtKrw(t.amount)) : '';
        const outAmt = t.type === '출금' ? (isUsd ? fmtUsd(t.amount) : fmtKrw(t.amount)) : '';
        return `<tr>
          <td>${fmtDate(t.date)}</td>
          <td class="td-name">${esc(getAccLabel(t.account))}</td>
          <td style="font-weight:700;color:${t.type==='입금'?'var(--primary)':'var(--accent)'};">${esc(t.type)}</td>
          <td class="td-name">${esc(t.desc) || ''}</td>
          <td style="text-align:right;color:var(--primary);font-weight:700;">${inAmt}</td>
          <td style="text-align:right;color:var(--accent);font-weight:700;">${outAmt}</td>
          <td style="color:var(--text-muted);font-size:13px;">${esc(t.note === '은행파일' ? '' : t.note)}</td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="7" style="text-align:center;color:#aaa;padding:16px;">내역 없음</td></tr>';

  const fmt = document.getElementById('rpt-format')?.value || 'formal';
  const n1  = APPROVAL_NAMES.name1 || '담당';
  const n2  = APPROVAL_NAMES.name2 || '이사';

  const approvalBoxHtml = `
        <div class="approval-box" style="margin-bottom:24px;">
          <table class="approval-table">
            <tr>
              <td class="head-cell" rowspan="2">결재</td>
              <td style="background:#eee;font-weight:700;font-size:13px;">${esc(n1)}</td>
              <td style="background:#eee;font-weight:700;font-size:13px;">${esc(n2)}</td>
            </tr>
            <tr>
              <td class="approval-sign"><div class="sign-input" contenteditable="true" data-placeholder="서명"></div></td>
              <td class="approval-sign"><div class="sign-input" contenteditable="true" data-placeholder="서명"></div></td>
            </tr>
          </table>
        </div>`;

  let html;
  if (fmt === 'simple') {
    const inList  = sortedList.filter(t => t.type === '입금');
    const outList = sortedList.filter(t => t.type === '출금');
    const makeDetailRows = (arr) => arr.length
      ? arr.map(t => {
          const isUsd = ACCOUNTS.find(a => a.key === t.account)?.type === 'usd';
          const amt = isUsd ? fmtUsd(t.amount) : fmtKrw(t.amount);
          return `<tr>
            <td>${fmtDate(t.date)}</td>
            <td class="td-name">${esc(getAccLabel(t.account))}</td>
            <td class="td-name">${esc(t.desc) || ''}</td>
            <td style="text-align:right;font-weight:700;">${amt}</td>
            <td style="color:var(--text-muted);font-size:13px;">${esc(t.note === '은행파일' ? '' : t.note)}</td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:12px;">내역 없음</td></tr>';

    html = `
      <div class="report-doc">
        <h2>주 간 자 금 일 지</h2>
        <div class="report-meta"><span>date. ${fmtDate(from)} ~ ${fmtDate(to)}</span></div>
        ${approvalBoxHtml}
        <div class="report-section-title">1. 계좌별 잔액 현황</div>
        <table class="report-table">
          <thead>
            <tr><th>구분</th><th>계좌번호</th><th>전주잔액</th><th>금주입금</th><th>금주출금</th><th>현잔고</th></tr>
          </thead>
          <tbody>
            ${accountRows}
            <tr class="total">
              <td class="td-name" colspan="2">합 계 (원화)</td>
              <td style="text-align:right;">${fmtKrw(totPrev)}</td>
              <td style="text-align:right;color:var(--primary);">${fmtKrw(totIn)}</td>
              <td style="text-align:right;color:var(--accent);">${fmtKrw(totOut)}</td>
              <td style="text-align:right;font-size:16px;">${fmtKrw(totCur)}</td>
            </tr>
          </tbody>
        </table>
        <div class="report-section-title" style="margin-top:24px;">2. 입금 내역</div>
        <table class="report-table">
          <thead><tr><th>날짜</th><th>계좌</th><th>거래처/내용</th><th>입금액</th><th>비고</th></tr></thead>
          <tbody>${makeDetailRows(inList)}</tbody>
          <tfoot><tr class="subtotal">
            <td colspan="2" style="text-align:right;">입금 합계</td>
            <td></td>
            <td style="text-align:right;color:var(--primary);font-weight:700;">${fmtKrw(totIn)}</td>
            <td></td>
          </tr></tfoot>
        </table>
        <div class="report-section-title" style="margin-top:24px;">3. 출금 내역</div>
        <table class="report-table">
          <thead><tr><th>날짜</th><th>계좌</th><th>거래처/내용</th><th>출금액</th><th>비고</th></tr></thead>
          <tbody>${makeDetailRows(outList)}</tbody>
          <tfoot><tr class="subtotal">
            <td colspan="2" style="text-align:right;">출금 합계</td>
            <td></td>
            <td style="text-align:right;color:var(--accent);font-weight:700;">${fmtKrw(totOut)}</td>
            <td></td>
          </tr></tfoot>
        </table>
        <div style="margin-top:28px;padding:16px;background:#f0f4fb;border-radius:8px;font-size:15px;">
          <strong>가용자금 합계 : ${fmtKrw(totCur)}</strong>
        </div>
      </div>`;
  } else {
    html = `
      <div class="report-doc">
        <h2>주 간 자 금 일 지</h2>
        <div class="report-meta"><span>date. ${fmtDate(from)} ~ ${fmtDate(to)}</span></div>
        ${approvalBoxHtml}
        <div class="report-section-title">1. 계좌별 잔액 현황</div>
        <table class="report-table">
          <thead>
            <tr><th>구분</th><th>계좌번호</th><th>전주잔액</th><th>금주입금</th><th>금주출금</th><th>현잔고</th></tr>
          </thead>
          <tbody>
            ${accountRows}
            <tr class="total">
              <td class="td-name" colspan="2">합 계 (원화)</td>
              <td style="text-align:right;">${fmtKrw(totPrev)}</td>
              <td style="text-align:right;color:var(--primary);">${fmtKrw(totIn)}</td>
              <td style="text-align:right;color:var(--accent);">${fmtKrw(totOut)}</td>
              <td style="text-align:right;font-size:16px;">${fmtKrw(totCur)}</td>
            </tr>
          </tbody>
        </table>
        <div class="report-section-title" style="margin-top:24px;">2. 입·출금 내역</div>
        <table class="report-table">
          <thead>
            <tr><th>날짜</th><th>계좌</th><th>구분</th><th>거래처/내용</th><th>입금</th><th>출금</th><th>비고</th></tr>
          </thead>
          <tbody>${combinedRows}</tbody>
          <tfoot>
            <tr class="subtotal">
              <td colspan="3" style="text-align:right;font-weight:700;">합계</td>
              <td></td>
              <td style="text-align:right;color:var(--primary);font-weight:700;">${fmtKrw(totIn)}</td>
              <td style="text-align:right;color:var(--accent);font-weight:700;">${fmtKrw(totOut)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <div style="margin-top:28px;padding:16px;background:#f0f4fb;border-radius:8px;font-size:15px;">
          <strong>가용자금 합계 : ${fmtKrw(totCur)}</strong>
        </div>
      </div>`;
  }

  document.getElementById('reportBody').innerHTML = html;
  showToast('✅ 보고서가 생성되었습니다', 'success');
}

/* =========================================
   인쇄
========================================= */
async function printReport() {
  const body = document.getElementById('reportBody');
  if (!body || !body.querySelector('.report-doc')) {
    showToast('먼저 보고서를 생성해주세요', 'error');
    return;
  }
  const styles = document.querySelector('link[rel="stylesheet"]')
    ? await fetch('style.css').then(r => r.text()).catch(() => '')
    : '';
  const html = `<!DOCTYPE html><html lang="ko"><head>
    <meta charset="UTF-8"><title>자금일보 인쇄</title>
    <style>${styles} body{background:#fff;padding:24px;margin:0;} @media print{body{padding:0;}}</style>
  </head><body>${body.innerHTML}</body></html>`;

  if (isElectron) {
    showToast('⏳ 인쇄 미리보기 준비 중...', '');
    await window.electronAPI.printReport({ html });
  } else {
    const win = window.open('', '_blank', 'width=950,height=900');
    if (win) { win.document.write(html); win.document.close(); }
  }
}

/* =========================================
   Word 저장
========================================= */
async function exportToWord() {
  const from    = document.getElementById('rpt-from')?.value   || '';
  const to      = document.getElementById('rpt-to')?.value     || '';
  const rptType = document.getElementById('rpt-type')?.value   || '';
  const fmt     = document.getElementById('rpt-format')?.value || 'formal';
  if (!from || !to) { showToast('보고서 기간을 선택해주세요', 'error'); return; }

  const list = transactions.filter(t =>
    t.date >= from && t.date <= to && (!rptType || t.type === rptType)
  );
  const prevBal = {};
  ACCOUNTS.forEach(a => {
    let b = INIT_BALANCE[a.key] || 0;
    transactions.filter(t => t.date < from && t.account === a.key)
      .forEach(t => { b += t.type === '입금' ? t.amount : -t.amount; });
    prevBal[a.key] = b;
  });
  const sumIn = {}, sumOut = {};
  ACCOUNTS.forEach(a => { sumIn[a.key] = 0; sumOut[a.key] = 0; });
  list.forEach(t => {
    if (t.type === '입금') sumIn[t.account]  = (sumIn[t.account]  || 0) + t.amount;
    else                   sumOut[t.account] = (sumOut[t.account] || 0) + t.amount;
  });
  const curBal = {};
  ACCOUNTS.forEach(a => { curBal[a.key] = (prevBal[a.key] || 0) + (sumIn[a.key] || 0) - (sumOut[a.key] || 0); });

  const totPrev = ACCOUNTS.filter(a => a.type !== 'usd').reduce((s, a) => s + (prevBal[a.key] || 0), 0);
  const totIn   = ACCOUNTS.filter(a => a.type !== 'usd').reduce((s, a) => s + (sumIn[a.key]  || 0), 0);
  const totOut  = ACCOUNTS.filter(a => a.type !== 'usd').reduce((s, a) => s + (sumOut[a.key] || 0), 0);
  const totCur  = ACCOUNTS.filter(a => a.type !== 'usd').reduce((s, a) => s + (curBal[a.key] || 0), 0);

  const n1 = APPROVAL_NAMES.name1 || '담당';
  const n2 = APPROVAL_NAMES.name2 || '이사';

  // Word 호환 인라인 스타일 상수
  const T   = 'border-collapse:collapse;width:100%;table-layout:fixed;';
  const TH  = 'border:1px solid #333;background:#d0e8f8;padding:5pt 8pt;font-weight:bold;text-align:center;font-size:10pt;';
  const TD  = 'border:1px solid #555;padding:5pt 8pt;font-size:10pt;word-break:break-word;';
  const TDR = 'border:1px solid #555;padding:5pt 8pt;font-size:10pt;text-align:right;';
  const TDI = 'border:1px solid #555;padding:5pt 8pt;font-size:10pt;text-align:right;color:#1a4fa0;font-weight:bold;';
  const TDO = 'border:1px solid #555;padding:5pt 8pt;font-size:10pt;text-align:right;color:#c8321a;font-weight:bold;';
  const TOT = 'border:1px solid #333;padding:5pt 8pt;background:#e8f0fb;font-weight:bold;font-size:10pt;text-align:right;';
  const TOTH= 'border:1px solid #333;padding:5pt 8pt;background:#e8f0fb;font-weight:bold;font-size:10pt;';
  const SEC = 'font-weight:bold;font-size:11pt;background:#dce8f5;padding:4pt 8pt;margin:14pt 0 6pt;';

  const approvalTable = `
  <table style="${T}margin-left:auto;width:200pt;margin-bottom:16pt;">
    <tr>
      <td rowspan="2" style="border:1px solid #333;padding:5pt 10pt;font-weight:bold;text-align:center;width:50pt;background:#e8e8e8;">결재</td>
      <td style="border:1px solid #333;padding:5pt 10pt;font-weight:bold;text-align:center;background:#eee;width:75pt;">${esc(n1)}</td>
      <td style="border:1px solid #333;padding:5pt 10pt;font-weight:bold;text-align:center;background:#eee;width:75pt;">${esc(n2)}</td>
    </tr>
    <tr>
      <td style="border:1px solid #333;height:40pt;"></td>
      <td style="border:1px solid #333;height:40pt;"></td>
    </tr>
  </table>`;

  const accRows = ACCOUNTS.map(a => {
    const isUsd = a.type === 'usd';
    const fmt2 = isUsd ? fmtUsd : fmtKrw;
    if (!prevBal[a.key] && !sumIn[a.key] && !sumOut[a.key]) return '';
    return `<tr>
      <td style="${TD}width:130pt;">${esc(a.label)}</td>
      <td style="${TD}width:150pt;">${esc(a.num) || ''}</td>
      <td style="${TDR}width:100pt;">${fmt2(prevBal[a.key] || 0)}</td>
      <td style="${TDI}width:100pt;">${sumIn[a.key] ? fmt2(sumIn[a.key]) : '-'}</td>
      <td style="${TDO}width:100pt;">${sumOut[a.key] ? fmt2(sumOut[a.key]) : '-'}</td>
      <td style="${TDR}font-weight:bold;width:110pt;">${fmt2(curBal[a.key] || 0)}</td>
    </tr>`;
  }).join('');

  const balTable = `
  <div style="${SEC}">1. 계좌별 잔액 현황</div>
  <table style="${T}">
    <thead><tr>
      <th style="${TH}width:130pt;">구분</th>
      <th style="${TH}width:150pt;">계좌번호</th>
      <th style="${TH}width:100pt;">전주잔액</th>
      <th style="${TH}width:100pt;">금주입금</th>
      <th style="${TH}width:100pt;">금주출금</th>
      <th style="${TH}width:110pt;">현잔고</th>
    </tr></thead>
    <tbody>
      ${accRows}
      <tr>
        <td colspan="2" style="${TOTH}">합 계 (원화)</td>
        <td style="${TOT}">${fmtKrw(totPrev)}</td>
        <td style="${TOT}color:#1a4fa0;">${fmtKrw(totIn)}</td>
        <td style="${TOT}color:#c8321a;">${fmtKrw(totOut)}</td>
        <td style="${TOT}font-size:11pt;">${fmtKrw(totCur)}</td>
      </tr>
    </tbody>
  </table>`;

  const sortedList = [...list].sort((a, b) => a.date.localeCompare(b.date));
  let detailSection = '';

  if (fmt === 'simple') {
    const inList  = sortedList.filter(t => t.type === '입금');
    const outList = sortedList.filter(t => t.type === '출금');
    const makeRows = arr => arr.length
      ? arr.map(t => {
          const isUsd = ACCOUNTS.find(a => a.key === t.account)?.type === 'usd';
          const amt = isUsd ? fmtUsd(t.amount) : fmtKrw(t.amount);
          return `<tr>
            <td style="${TD}width:90pt;">${fmtDate(t.date)}</td>
            <td style="${TD}width:130pt;">${esc(getAccDisplay(t.account))}</td>
            <td style="${TD}width:220pt;">${esc(t.desc) || ''}</td>
            <td style="${TDR}width:110pt;font-weight:bold;">${amt}</td>
            <td style="${TD}width:140pt;">${esc(t.note === '은행파일' ? '' : (t.note || ''))}</td>
          </tr>`;
        }).join('')
      : `<tr><td colspan="5" style="${TD}text-align:center;color:#888;">내역 없음</td></tr>`;

    detailSection = `
    <div style="${SEC}margin-top:16pt;">2. 입금 내역</div>
    <table style="${T}">
      <thead><tr>
        <th style="${TH}width:90pt;">날짜</th>
        <th style="${TH}width:130pt;">계좌</th>
        <th style="${TH}width:220pt;">거래처/내용</th>
        <th style="${TH}width:110pt;">입금액</th>
        <th style="${TH}width:140pt;">비고</th>
      </tr></thead>
      <tbody>${makeRows(inList)}</tbody>
      <tfoot><tr>
        <td colspan="2" style="${TOTH}text-align:right;">입금 합계</td>
        <td style="${TD}"></td>
        <td style="${TOT}color:#1a4fa0;">${fmtKrw(totIn)}</td>
        <td style="${TD}"></td>
      </tr></tfoot>
    </table>
    <div style="${SEC}margin-top:16pt;">3. 출금 내역</div>
    <table style="${T}">
      <thead><tr>
        <th style="${TH}width:90pt;">날짜</th>
        <th style="${TH}width:130pt;">계좌</th>
        <th style="${TH}width:220pt;">거래처/내용</th>
        <th style="${TH}width:110pt;">출금액</th>
        <th style="${TH}width:140pt;">비고</th>
      </tr></thead>
      <tbody>${makeRows(outList)}</tbody>
      <tfoot><tr>
        <td colspan="2" style="${TOTH}text-align:right;">출금 합계</td>
        <td style="${TD}"></td>
        <td style="${TOT}color:#c8321a;">${fmtKrw(totOut)}</td>
        <td style="${TD}"></td>
      </tr></tfoot>
    </table>`;
  } else {
    const txRows = sortedList.length
      ? sortedList.map(t => {
          const isUsd = ACCOUNTS.find(a => a.key === t.account)?.type === 'usd';
          const inAmt  = t.type === '입금' ? (isUsd ? fmtUsd(t.amount) : fmtKrw(t.amount)) : '';
          const outAmt = t.type === '출금' ? (isUsd ? fmtUsd(t.amount) : fmtKrw(t.amount)) : '';
          return `<tr>
            <td style="${TD}width:90pt;">${fmtDate(t.date)}</td>
            <td style="${TD}width:120pt;">${esc(getAccDisplay(t.account))}</td>
            <td style="${TD}width:60pt;text-align:center;font-weight:bold;color:${t.type==='입금'?'#1a4fa0':'#c8321a'};">${esc(t.type)}</td>
            <td style="${TD}width:200pt;">${esc(t.desc) || ''}</td>
            <td style="${TDI}width:110pt;">${inAmt}</td>
            <td style="${TDO}width:110pt;">${outAmt}</td>
            <td style="${TD}width:120pt;">${esc(t.note === '은행파일' ? '' : (t.note || ''))}</td>
          </tr>`;
        }).join('')
      : `<tr><td colspan="7" style="${TD}text-align:center;color:#888;">내역 없음</td></tr>`;

    detailSection = `
    <div style="${SEC}margin-top:16pt;">2. 입·출금 내역</div>
    <table style="${T}">
      <thead><tr>
        <th style="${TH}width:90pt;">날짜</th>
        <th style="${TH}width:120pt;">계좌</th>
        <th style="${TH}width:60pt;">구분</th>
        <th style="${TH}width:200pt;">거래처/내용</th>
        <th style="${TH}width:110pt;">입금</th>
        <th style="${TH}width:110pt;">출금</th>
        <th style="${TH}width:120pt;">비고</th>
      </tr></thead>
      <tbody>${txRows}</tbody>
      <tfoot><tr>
        <td colspan="3" style="${TOTH}text-align:right;">합계</td>
        <td style="${TD}"></td>
        <td style="${TOT}color:#1a4fa0;">${fmtKrw(totIn)}</td>
        <td style="${TOT}color:#c8321a;">${fmtKrw(totOut)}</td>
        <td style="${TD}"></td>
      </tr></tfoot>
    </table>`;
  }

  const wordHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
    xmlns:w='urn:schemas-microsoft-com:office:word'
    xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="UTF-8">
    <meta name="ProgId" content="Word.Document">
    <title>자금일보</title>
    <!--[if gte mso 9]><xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml><![endif]-->
    <style>
      @page { margin: 2cm 2.5cm; }
      body { font-family: '맑은 고딕', 'Malgun Gothic', sans-serif; font-size: 10pt; line-height: 1.4; }
      h2 { text-align: center; font-size: 16pt; font-weight: bold; margin: 0 0 8pt; letter-spacing: 4pt; }
      p { margin: 0 0 6pt; font-size: 10pt; }
    </style>
  </head>
  <body>
    <h2>주 간 자 금 일 지</h2>
    <p style="text-align:right;font-size:10pt;margin-bottom:12pt;">date. ${fmtDate(from)} ~ ${fmtDate(to)}</p>
    ${approvalTable}
    ${balTable}
    ${detailSection}
    <div style="margin-top:20pt;padding:8pt 12pt;background:#f0f4fb;border:1px solid #c0d0e8;font-size:11pt;font-weight:bold;">
      가용자금 합계 : ${fmtKrw(totCur)}
    </div>
  </body>
  </html>`;

  const docFilename = `자금일보_${from}_${to}.doc`;
  if (isElectron) {
    const { canceled, filePath } = await window.electronAPI.saveFileDialog({
      defaultName: docFilename,
      filters: [{ name: 'Word 문서', extensions: ['doc'] }],
    });
    if (canceled || !filePath) return;
    const bytes = new TextEncoder().encode(wordHtml);
    let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const res = await window.electronAPI.writeFile({ filePath, base64: btoa(bin) });
    if (res.ok) showToast('📄 Word 파일이 저장되었습니다', 'success');
    else showToast('❌ 저장 실패: ' + res.error, 'error');
  } else {
    const blob = new Blob([wordHtml], { type: 'application/msword;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = docFilename;
    a.click();
    showToast('📄 Word 파일이 다운로드되었습니다', 'success');
  }
}
