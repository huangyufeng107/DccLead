// ===== Batch Dispatch Pages (产品设计阶段) =====

// === AI Outbound Batch Dispatch ===
function initBatchDispatchAiPage() {
  const page = document.getElementById('batchDispatchAiPage');
  if (!page) return;

  page.innerHTML = `
    <div class="design-stage show" style="margin-top: 20px;">
      <div>
        <div class="design-stage-title">产品设计阶段</div>
        <div class="design-stage-desc">AI批量下发正在产品设计阶段，后续将补充完整的页面内容。</div>
      </div>
    </div>
  `;
}

// === Manual Customer Service Batch Dispatch ===
function initBatchDispatchManualPage() {
  const page = document.getElementById('batchDispatchManualPage');
  if (!page) return;

  page.innerHTML = `
    <div class="design-stage show" style="margin-top: 20px;">
      <div>
        <div class="design-stage-title">产品设计阶段</div>
        <div class="design-stage-desc">人工批量下发正在产品设计阶段，后续将补充完整的页面内容。</div>
      </div>
    </div>
  `;
}
