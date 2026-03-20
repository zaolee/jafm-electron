'use strict';

/* =========================================
   설정: 계좌 초기잔액
========================================= */
/**
 * 계좌 설정 폼(이름·계좌번호·종류·기준잔액·현재잔액)을 렌더링합니다.
 * @param {BalanceMap} [bal] 생략 시 calcBalance()로 계산
 */
function renderSettingsForm(bal) {
  bal = bal || calcBalance();
  const container = document.getElementById('settings-form');
  const inputStyle = 'width:100%;height:48px;border:1.5px solid var(--border);border-radius:8px;padding:0 14px;font-size:15px;font-family:inherit;color:var(--text);outline:none;transition:border-color .2s;background:var(--card);';
  container.innerHTML = ACCOUNTS.map((a, i) => {
    const isUsd = a.type === 'usd';
    const initVal = INIT_BALANCE[a.key] || 0;
    const displayVal = isUsd ? initVal.toFixed(2) : initVal.toLocaleString('ko-KR');
    const liveVal = bal[a.key] || 0;
    const liveDisplay = isUsd ? ('$ ' + liveVal.toFixed(2)) : ('₩ ' + liveVal.toLocaleString('ko-KR'));
    const isNeg = liveVal < 0;
    const txCount = transactions.filter(t => t.account === a.key).length;
    const canDelete = txCount === 0;
    const delTitle = canDelete ? '계좌 삭제' : `거래내역 ${txCount}건이 있어 삭제 불가`;
    return `
      <div style="position:relative;padding:18px 20px;background:var(--bg);border-radius:10px;border:1px solid var(--border);">
        <button onclick="deleteAccountSetting(${i})" title="${esc(delTitle)}"
          ${canDelete ? '' : 'disabled'}
          style="position:absolute;top:12px;right:12px;width:32px;height:32px;border:none;border-radius:6px;cursor:${canDelete?'pointer':'not-allowed'};background:${canDelete?'#fdecea':'#f0f0f0'};color:${canDelete?'var(--accent)':'#bbb'};font-size:16px;display:flex;align-items:center;justify-content:center;">🗑️</button>
        <div style="display:grid;grid-template-columns:1fr 1fr 140px;gap:10px;margin-bottom:10px;padding-right:44px;">
          <div>
            <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:4px;">계좌 이름</div>
            <input type="text" id="acc-label-${a.key}" value="${esc(a.label)}"
              style="${inputStyle}"
              onfocus="this.style.setProperty('border-color','var(--primary)')"
              onblur="this.style.setProperty('border-color','var(--border)')">
          </div>
          <div>
            <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:4px;">계좌번호</div>
            <input type="text" id="acc-num-${a.key}" value="${esc(a.num)}"
              placeholder="없으면 빈칸"
              style="${inputStyle}"
              onfocus="this.style.setProperty('border-color','var(--primary)')"
              onblur="this.style.setProperty('border-color','var(--border)')">
          </div>
          <div>
            <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:4px;">종류</div>
            <select id="acc-type-${a.key}" style="${inputStyle}cursor:pointer;">
              <option value="krw"  ${a.type==='krw' ?'selected':''}>원화 (₩)</option>
              <option value="usd"  ${a.type==='usd' ?'selected':''}>외화 ($)</option>
              <option value="cash" ${a.type==='cash'?'selected':''}>현금</option>
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:4px;" title="거래내역 반영 전 시작 금액 · 직접 입력">기준 잔액 ⓘ</div>
            <div style="position:relative;">
              <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:17px;font-weight:700;color:var(--text-muted);pointer-events:none;">${isUsd ? '$' : '₩'}</span>
              <input type="text" id="init-bal-${a.key}" value="${esc(displayVal)}"
                style="${inputStyle}padding:0 14px 0 36px;font-size:18px;font-weight:700;"
                onfocus="this.select(); this.style.setProperty('border-color','var(--primary)')"
                onblur="fmtSettingInput(this, ${isUsd}); this.style.setProperty('border-color','var(--border)')"
                onkeydown="if(event.key==='Enter'){this.blur();}"
                inputmode="numeric">
            </div>
          </div>
          <div>
            <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:4px;" title="기준잔액 + 입금 − 출금 · 자동계산">현재잔액 ⓘ</div>
            <div style="height:48px;border:1.5px solid ${isNeg?'var(--accent)':'var(--border)'};border-radius:8px;padding:0 14px;display:flex;align-items:center;background:${isNeg?'#fdecea':'var(--primary-light)'};font-size:18px;font-weight:700;color:${isNeg?'var(--accent)':'var(--primary)'};">
              ${isNeg ? '⚠️ ' : ''}${liveDisplay}
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

/**
 * 설정 폼의 금액 입력 필드에 원화 콤마 포맷을 적용합니다. USD는 그대로 둡니다.
 * @param {HTMLInputElement} el
 * @param {boolean} isUsd
 */
function fmtSettingInput(el, isUsd) {
  if (isUsd) return;
  const raw = el.value.replace(/[^0-9]/g, '');
  const num = parseInt(raw, 10);
  el.value = isNaN(num) ? '' : num.toLocaleString('ko-KR');
}

/** 설정 폼 값을 읽어 ACCOUNTS·INIT_BALANCE를 갱신하고 저장합니다. */
function saveSettings() {
  ACCOUNTS.forEach(a => {
    const labelEl = document.getElementById('acc-label-' + a.key);
    const numEl   = document.getElementById('acc-num-'   + a.key);
    const typeEl  = document.getElementById('acc-type-'  + a.key);
    const balEl   = document.getElementById('init-bal-'  + a.key);
    if (labelEl && labelEl.value.trim()) a.label = labelEl.value.trim();
    if (numEl)  a.num  = numEl.value.trim();
    if (typeEl) a.type = typeEl.value;
    if (!balEl) return;
    const isUsd = a.type === 'usd';
    const raw = balEl.value.replace(/[^0-9.]/g, '');
    INIT_BALANCE[a.key] = isUsd ? parseFloat(raw) || 0 : parseInt(raw, 10) || 0;
  });
  saveInitBalance();
  refreshAccountDropdowns();
  renderAll();
  showToast('✅ 설정이 저장되었습니다', 'success');
}

/** 새 계좌를 ACCOUNTS에 추가하고 설정 폼을 갱신합니다. */
function addAccountSetting() {
  const key = 'account_' + Date.now();
  ACCOUNTS.push({ key, label: '새 계좌', num: '', type: 'krw' });
  INIT_BALANCE[key] = 0;
  renderSettingsForm();
  const labelInput = document.getElementById('acc-label-' + key);
  if (labelInput) {
    labelInput.scrollIntoView({ block: 'center' });
    labelInput.focus();
    labelInput.select();
  }
}

/**
 * 인덱스로 계좌를 삭제합니다. 거래내역이 있으면 삭제를 거부합니다.
 * @param {number} idx ACCOUNTS 배열 인덱스
 */
function deleteAccountSetting(idx) {
  const a = ACCOUNTS[idx];
  const txCount = transactions.filter(t => t.account === a.key).length;
  if (txCount > 0) {
    showToast(`거래내역이 ${txCount}건 있어 삭제할 수 없습니다`, 'error');
    return;
  }
  if (!confirm(`"${a.label}" 계좌를 삭제하시겠습니까?\n삭제 후 저장 버튼을 눌러야 반영됩니다.`)) return;
  ACCOUNTS.splice(idx, 1);
  delete INIT_BALANCE[a.key];
  renderSettingsForm();
  showToast(`"${a.label}" 계좌가 삭제되었습니다. 저장을 눌러 반영하세요.`);
}

/* =========================================
   결재란 설정
========================================= */
/** 결재란 설정 폼에 현재 APPROVAL_NAMES 값을 채웁니다. */
function renderApprovalForm() {
  const n1 = document.getElementById('approval-name1');
  const n2 = document.getElementById('approval-name2');
  if (n1) n1.value = APPROVAL_NAMES.name1 || '담당';
  if (n2) n2.value = APPROVAL_NAMES.name2 || '이사';
}

/** 결재란 이름 입력 값을 APPROVAL_NAMES에 저장합니다. */
function saveApprovalNames() {
  const n1 = document.getElementById('approval-name1')?.value.trim();
  const n2 = document.getElementById('approval-name2')?.value.trim();
  if (n1) APPROVAL_NAMES.name1 = n1;
  if (n2) APPROVAL_NAMES.name2 = n2;
  saveInitBalance();
  showToast('✅ 결재란 설정이 저장되었습니다', 'success');
}
