(() => {
  const root = document.documentElement;
  const langButtons = [...document.querySelectorAll('[data-lang]')];
  const copyNodes = [...document.querySelectorAll('[data-copy]')];
  const downloadLink = document.querySelector('#download-link');
  const checkboxes = [...document.querySelectorAll('[data-check]')];
  const progressCount = document.querySelector('#progress-count');
  const progressBar = document.querySelector('#progress-bar');
  const resetButton = document.querySelector('#reset-button');
  const copyButton = document.querySelector('#copy-record');
  const copyStatus = document.querySelector('#copy-status');
  const recordPreview = document.querySelector('#record-preview');
  const e002Start = document.querySelector('#e002-start');
  const e002Form = document.querySelector('#e002-form');
  const e002Stage = document.querySelector('#e002-stage');
  const e002Ineligible = document.querySelector('#e002-ineligible');
  const e002Redacted = document.querySelector('#e002-redacted');
  const e002ShowPrice = document.querySelector('#e002-show-price');
  const e002FormStatus = document.querySelector('#e002-form-status');
  const e002PriceStage = document.querySelector('#e002-price-stage');
  const e002BuildReceipt = document.querySelector('#e002-build-receipt');
  const e002ReceiptStage = document.querySelector('#e002-receipt-stage');
  const e002Receipt = document.querySelector('#e002-receipt');
  const e002CopyReceipt = document.querySelector('#e002-copy-receipt');
  const e002CopyStatus = document.querySelector('#e002-copy-status');
  const e002Reset = document.querySelector('#e002-reset');
  const storageKey = 'field-note-checklist-v01';
  let activeLang = 'zh';
  let e002StartedAt = 0;
  let e002ParticipantCode = '';
  let e002CompletionMinutes = 0;

  const templates = {
    zh: `## AI 工作流测试记录

- 工作流 / 版本：
- 目的：
- 禁止动作：
- 数据分级：
- 工具权限：
- 风险分数：
- 正常案例结果：
- 坏案例结果：
- 人工审批点：
- 回滚方法：
- 下次复查日期：`,
    en: `## AI workflow test record

- Workflow / version:
- Purpose:
- Prohibited actions:
- Data class:
- Tool permissions:
- Risk score:
- Normal-case result:
- Hostile/broken-case result:
- Human approval point:
- Rollback method:
- Next review date:`
  };

  function setLanguage(lang) {
    activeLang = lang;
    root.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = lang === 'zh'
      ? '实证档案 — 隐私优先 AI 工作流检查表'
      : 'FIELD NOTE — Privacy-first AI Workflow Checklist';
    copyNodes.forEach((node) => { node.hidden = node.dataset.copy !== lang; });
    langButtons.forEach((button) => {
      const active = button.dataset.lang === lang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    downloadLink.href = lang === 'zh'
      ? 'downloads/privacy-first-ai-checklist.zh-CN.md'
      : 'downloads/privacy-first-ai-checklist.en.md';
    recordPreview.textContent = templates[lang];
    copyStatus.textContent = '';
  }

  function loadChecks() {
    try {
      const checked = JSON.parse(localStorage.getItem(storageKey) || '[]');
      checkboxes.forEach((box) => { box.checked = checked.includes(box.dataset.check); });
    } catch {
      checkboxes.forEach((box) => { box.checked = false; });
    }
    updateProgress();
  }

  function saveChecks() {
    const checked = checkboxes.filter((box) => box.checked).map((box) => box.dataset.check);
    try { localStorage.setItem(storageKey, JSON.stringify(checked)); } catch { /* local storage may be disabled */ }
    updateProgress();
  }

  function updateProgress() {
    const count = checkboxes.filter((box) => box.checked).length;
    progressCount.textContent = String(count);
    progressBar.style.width = `${(count / checkboxes.length) * 100}%`;
    resetButton.disabled = count === 0;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand('copy');
    helper.remove();
    if (!copied) throw new Error('copy failed');
  }

  function checkedValue(name) {
    return e002Form.querySelector(`input[name="${name}"]:checked`)?.value || '';
  }

  function newParticipantCode() {
    const values = new Uint32Array(1);
    if (window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(values);
    } else {
      values[0] = Math.floor(Math.random() * 900000);
    }
    return `P${String((values[0] % 900000) + 100000)}`;
  }

  function updateE002Form() {
    const persona = checkedValue('persona');
    const gap = checkedValue('gap');
    const workaround = checkedValue('workaround');
    const eligible = persona === 'yes';
    const readyForPrice = eligible && gap && workaround && e002Redacted.checked;
    const stepsDone = [persona, gap, workaround, e002Redacted.checked ? 'yes' : '']
      .filter(Boolean).length;

    e002Ineligible.hidden = persona !== 'no';
    e002ShowPrice.disabled = !e002PriceStage.hidden || !readyForPrice;
    e002FormStatus.textContent = persona === 'no'
      ? '本实验只统计最近 6 个月有真实付费客户交付经历的参与者。'
      : readyForPrice
        ? '已满足隐私与样本条件；价格仍未显示。'
        : '请完成 01–04 后继续。';
    if (e002PriceStage.hidden) e002Stage.textContent = `${Math.min(stepsDone + 1, 4)} / 4`;

    const intent = checkedValue('intent');
    const followup = checkedValue('followup');
    e002BuildReceipt.disabled = !(intent && followup);
  }

  function freezePrePriceFields(disabled) {
    e002Form.querySelectorAll('input[name="persona"], input[name="gap"], input[name="workaround"], #e002-redacted')
      .forEach((input) => { input.disabled = disabled; });
  }

  function localDate() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  }

  function resetE002() {
    e002Form.reset();
    e002Form.hidden = true;
    e002PriceStage.hidden = true;
    e002ReceiptStage.hidden = true;
    e002Start.disabled = false;
    e002StartedAt = 0;
    e002ParticipantCode = '';
    e002CompletionMinutes = 0;
    e002Receipt.textContent = '';
    e002CopyStatus.textContent = '';
    e002Stage.textContent = '1 / 4';
    freezePrePriceFields(false);
    updateE002Form();
    document.querySelector('#handoff-test').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  langButtons.forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
  checkboxes.forEach((box) => box.addEventListener('change', saveChecks));
  resetButton.addEventListener('click', () => {
    checkboxes.forEach((box) => { box.checked = false; });
    saveChecks();
  });
  document.querySelector('#print-button').addEventListener('click', () => window.print());
  copyButton.addEventListener('click', async () => {
    try {
      await copyText(templates[activeLang]);
      copyStatus.textContent = activeLang === 'zh' ? '已复制到剪贴板。' : 'Copied to clipboard.';
    } catch {
      copyStatus.textContent = activeLang === 'zh' ? '复制失败，请手动选择右侧模板。' : 'Copy failed. Select the template manually.';
    }
  });

  e002Start.addEventListener('click', () => {
    e002StartedAt = Date.now();
    e002ParticipantCode = newParticipantCode();
    e002Start.disabled = true;
    e002Form.hidden = false;
    e002Form.querySelector('input[name="persona"]').focus();
  });
  e002Form.addEventListener('change', updateE002Form);
  e002ShowPrice.addEventListener('click', () => {
    if (e002ShowPrice.disabled || !e002StartedAt) return;
    e002CompletionMinutes = Math.max(1, Math.ceil((Date.now() - e002StartedAt) / 60000));
    freezePrePriceFields(true);
    e002ShowPrice.disabled = true;
    e002PriceStage.hidden = false;
    e002Stage.textContent = '5 / 6';
    e002PriceStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  e002BuildReceipt.addEventListener('click', () => {
    const rawGap = checkedValue('gap');
    const problemCategory = rawGap === 'none_reported' ? 'other' : rawGap;
    const intent = checkedValue('intent');
    const followup = checkedValue('followup');
    if (!intent || !followup || !e002CompletionMinutes) return;

    const receipt = [
      'E-002 privacy-redacted receipt',
      `observed_at=${localDate()}`,
      'experiment_id=E-002',
      'market=domestic',
      'source=self_hosted_zero_tracking_preview',
      `participant_code=${e002ParticipantCode}`,
      'persona_fit=yes',
      'workflow_context=synthetic_client_automation',
      `problem_trigger=${rawGap}`,
      `problem_category=${problemCategory}`,
      `current_workaround=${checkedValue('workaround')}`,
      `consequence=${rawGap === 'none_reported' ? 'no_material_gap' : 'handoff_answer_not_immediate'}`,
      'preview_completed=yes',
      `completion_minutes=${e002CompletionMinutes}`,
      `missing_control=${rawGap}`,
      'selected_promise=15_minute_handoff_preflight',
      'price_shown=99',
      'currency=CNY',
      `purchase_intent=${intent}`,
      'commitment_type=preview_completed',
      `followup_allowed=${followup}`,
      'privacy_redacted=yes',
      'evidence_location=voluntary_receipt_same_channel',
      'notes=fixed_categories_only_no_client_data'
    ].join('\n');

    e002Receipt.textContent = receipt;
    e002ReceiptStage.hidden = false;
    e002Stage.textContent = '6 / 6';
    e002ReceiptStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  e002CopyReceipt.addEventListener('click', async () => {
    try {
      await copyText(e002Receipt.textContent);
      e002CopyStatus.textContent = '已复制。页面没有发送数据；请自行检查后再决定是否主动提供。';
    } catch {
      e002CopyStatus.textContent = '复制失败，请手动选择上方固定分类回执。';
    }
  });
  e002Reset.addEventListener('click', resetE002);

  setLanguage('zh');
  loadChecks();
  updateE002Form();
})();
