// AI 策略工作台评审副本：仅在当前页面内模拟，不写入旧规则或调用 DCC。
const aiStrategyMetrics = [
  ['接通率', '接通数', '任一通话时长大于 0；按线索 ID 去重'],
  ['有效线索率', '有效线索量', '以最新线索状态识别有效；排除跟进后无效结案'],
  ['排程下发率', '排程下发量', '下发成功状态、重复下发去重待数据确认'],
  ['意向线索下发率', '意向线索下发量', '下发成功状态、重复下发去重待数据确认'],
  ['线索到店率', '到店量', '多次到店去重与状态口径待数据确认'],
  ['线索试驾率', '试驾量', '按线索 ID＋车系去重；跨窗口归属待确认'],
  ['线索锁单率', '有效锁单量', '排除作废/销退；跨窗口归属待确认']
];
const aiStrategyRouteOrder = ['专营店', '车系', 'SC', 'SC大项目名', '线索状态', '渠道'];
const aiStrategyAiPolicies = [
  { id: 'AI-POL-001', version: 'v1', name: 'AI统一分流方案A', detail: '科大讯飞-冷线索70% / 一知-冷线索30%' },
  { id: 'AI-POL-002', version: 'v3', name: 'AI统一分流方案B', detail: '滨南-冷线索60% / 科大讯飞-冷线索40%' }
];
const aiStrategyAiTypes = ['科大讯飞-冷线索', '滨南-冷线索', '一知-冷线索'];

function aiStrategyGetAiPercent(ratioStr) {
  if (!ratioStr || typeof ratioStr !== 'string') return 0;
  const match = ratioStr.match(/AI\s*(\d+)%/i);
  if (match) return Number(match[1]);
  if (/^AI\s*100%?$/i.test(ratioStr.trim())) return 100;
  return 0;
}
const aiStrategyDemoRows = [
  { dimension: '渠道', value: '渠道R2', priority: 6, sample: 120, habc: { H: 18, A: 32, B: 40, C: 30 }, rates: [82, 65, 78, 72, 70, 76, 74], current: '人工100% / AI0%', recommended: '人工60% / AI40%', aiMode: '', aiPolicyId: '', aiType: '', type: '动态调配', reason: 'T+1人工缺口30条，按综合分优先保留人工；AI分配40%（AI>0%已联动解锁操作），字段不做自动联动，需运营人员手动选择内部方式/方案。' },
  { dimension: 'SC大项目名', value: '项目A', priority: 4, sample: 86, habc: { H: 22, A: 28, B: 24, C: 12 }, rates: [88, 79, 84, 81, 80, 83, 82], current: '人工80% / AI20%', recommended: '人工80% / AI20%', aiMode: '', aiPolicyId: '', aiType: '', type: '高效对象保留人工', reason: '综合分较高，优先保留人工；AI分配20%（AI>0%已联动解锁操作），字段不做自动联动，需运营人员手动选择内部方式/方案。' },
  { dimension: '专营店', value: '专营店B', priority: 5, sample: 95, habc: { H: 30, A: 35, B: 20, C: 10 }, rates: [92, 85, 88, 86, 84, 89, 85], current: '人工100% / AI0%', recommended: '人工100% / AI0%', aiMode: '', aiPolicyId: '', aiType: '', type: '标杆全人工', reason: '转化效能优异，建议比例保持人工100%/AI0%（AI=0%已锁定操作），无需且不可配置AI内部方案。' },
  { dimension: '车系', value: 'N6', priority: 2, sample: 180, habc: { H: 45, A: 55, B: 50, C: 30 }, rates: [89, 82, 85, 80, 78, 84, 81], current: '人工70% / AI30%', recommended: '人工0% / AI100%', aiMode: '不按比例', aiPolicyId: '', aiType: '科大讯飞-冷线索', type: '优先培育', reason: 'Agent建议评分为 100.0 分，系统将该评分作为对象效能参考，建议结合当前人工容量与现行分派规则审核确认。' },
  { dimension: '专营店', value: '旗舰店A', priority: 3, sample: 68, habc: { H: 14, A: 22, B: 20, C: 12 }, rates: [78, 68, 72, 68, 62, 68, 58], current: '人工50% / AI50%', recommended: '人工40% / AI60%', aiMode: '', aiPolicyId: '', aiType: '', type: '动态培育', reason: '综合评分 96.8 分，根据人工容量与门店转化表现，建议调整为人工40%/AI60%；AI分配60%已解锁，需运营人员选择内部方式/方案。' }
];
const aiStrategyDemoTargets = [80, 70, 75, 70, 65, 70, 60];
const aiStrategyGradeOptions = ['优先建议人工', '按容量动态建议', '优先建议AI'];
const aiStrategyHelpContent = {
  metrics: { title: '七项评分参数', purpose: '用于把数据组提供的七项指标率值换算为对象综合分，供 Agent 比较对象效果并生成比例建议。', steps: ['为每项指标填写目标值；目标值必须是 1–100 的正整数。', '填写权重；权重可以为 0，表示不使用该指标，七项权重合计必须为 100%。', '填写最低样本量，作为评分服务的参考参数；建议列表不依据该门槛自行拦截或标记对象。', '点击“保存评分参数”，保存后再生成策略建议。'], note: '这里配置的是评分参考口径，不会直接改变单条线索的人工/AI分派。' },
  grades: { title: 'H/A/B/C 分级参考配置', purpose: '把对象综合分划成 H、A、B、C 四档，并告诉 Agent 各档在生成对象比例建议时优先参考人工还是 AI。', steps: ['填写 H、A、B 三档下限，必须满足 H>A>B>0。', '系统自动生成不重叠区间：H≥H下限、A为A至H（不含）、B为B至A（不含）、C为0至B（不含）。', '选择每档建议方向；“按容量动态建议”表示先保留H和A，再结合T+1人工容量判断B。', '点击“保存分级参考配置”。'], note: '仅供 Agent 生成对象比例建议参考，不直接分派单条线索。' },
  'low-efficiency': { title: '低效对象配置', purpose: '将六类普通分配规则中已启用的策略关联为低效对象。命中后直接执行关联策略当前有效的分派动作，不进入 Agent 评分、排名和动态调配。', steps: ['选择对象维度，再选择该维度下已启用的分配策略；匹配值、规则 ID、当前动作和状态会自动显示。', '填写维护说明后加入低效清单；同一策略不能重复关联。', '在清单中查看关联状态、继承的分派动作和 Agent 处理方式；可移除关联。'], note: '这里只维护关联，不修改普通规则，也不另行配置人工/AI比例。关联策略停用或删除后关联失效，线索回到普通规则匹配。' },
  'data-scope': { title: '直派名单', purpose: '维护需要直接执行的线索标识。当前仅支持“大项目名”，用于识别直派路径。命中后不参与 Agent 评分、排名和动态调配。', steps: ['选择直派名单类型（当前仅“大项目名”）。', '填写标识值和生效说明，加入直派名单。', '在名单中核对记录；可移除不再适用的标识。'], note: '直派名单只维护标识及说明，不编辑分配策略；命中后按直派路径执行，不参与 Agent 评分、排名和动态调配。' },
  capacity: { title: '容量查看', purpose: '查看 Agent 生成建议时使用的上一完整业务日人工容量快照。', steps: ['查看计划上限、已占用任务和可承接量。', '确认数据日期和结算状态。', '容量不足时，Agent按H/A/B/C优先级生成对象比例建议；实际执行仍按已发布规则。'], note: '本版本不做实时重算，容量采用T+1数据。' },
  drafts: { title: '策略建议与审核', purpose: '查看按规则维度生成的 Agent 评分、当前比例和建议比例，并审核建议。支持按日期、规则维度、匹配值、建议比例和审核状态筛选。', steps: ['可先在“审核规则设置”中配置审核人员、邮箱通知、频率和超时提醒。', '点击“生成建议”，通过数据与配置校验后查看列表；单条审核可通过或驳回，驳回需填写原因。', '待审核建议可微调为 Agent 建议、全人工或全 AI 比例；AI 比例大于 0% 时必须选择“按比例”或“不按比例”，并完成对应的内部方案或外呼类型选择；AI 为 0% 时内部方式锁定。', '使用“审核选中”处理已勾选项，或“批量审核通过”处理当前筛选结果中的全部待审核项；未完成 AI 配置时会拦截并指出对应规则。', '建议全部通过后，具备权限的产品负责人或管理员可确认发布，生成新的生效版本。'], note: 'Agent 仅提供评分和建议比例；说明文字由页面按规则生成，不代表 Agent 返回的原因。发布仅影响后续新线索，已分派任务不重新分派。' },
  versions: { title: '版本与回滚', purpose: '查看策略版本记录与快照；选择历史有效版本，预览整套或单个规则维度的回滚差异，再生成待发布版本。', steps: ['按状态或版本号/建议 ID 搜索版本，可查看版本来源、规则快照和操作留痕。', '选择历史有效版本、回滚范围（整套策略或单个规则维度），填写原因并点击“预览回滚差异”。', '核对当前版本、目标版本和新版本将使用的配置；确认后生成待发布回滚版本。', '由产品负责人或管理员点击“确认发布回滚版本”；发布后新版本生效。'], note: '仅产品负责人或管理员可发布或回滚。生成待发布版本本身不会改变线上策略；回滚发布只影响之后的新线索，已分派任务不重新分派。' }
};

function aiStrategyHelpButton(key) {
  return `<button type="button" class="ai-strategy-help-btn" data-ai-action="help" data-ai-value="${key}" aria-label="查看${aiStrategyHelpContent[key].title}说明">功能说明</button>`;
}

function aiStrategyRenderHelpModal() {
  const key = aiStrategyState.help;
  const help = aiStrategyHelpContent[key];
  if (!help) return '';
  return `<div class="ai-strategy-help-backdrop" data-ai-action="close-help"><section class="ai-strategy-help-modal" data-ai-help-modal role="dialog" aria-modal="true" aria-labelledby="aiHelpTitle"><div class="ai-strategy-help-head"><h3 id="aiHelpTitle">${help.title}</h3><button type="button" class="ai-strategy-help-close" data-ai-action="close-help" aria-label="关闭说明">×</button></div><p><strong>功能用途</strong>${help.purpose}</p><div><strong>操作步骤</strong><ol>${help.steps.map(step => `<li>${step}</li>`).join('')}</ol></div><p class="ai-strategy-muted"><strong>注意</strong>${help.note}</p></section></div>`;
}

function aiStrategyPlanDocButton() {
  return `<button type="button" class="btn-outline-blue" data-ai-action="open-plan-doc" onclick="openLeadAllocationPlanDocModal()" title="查看线索分派策略产品方案说明与业务蓝图"><span style="font-size:14px;">📋</span> 线索分派策略_产品方案说明</button>`;
}

function openLeadAllocationPlanDocModal() {
  let modal = document.getElementById('leadAllocationPlanDocModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'leadAllocationPlanDocModal';
    modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; z-index:9999; background:rgba(15,23,42,0.65); display:flex; justify-content:center; align-items:center; backdrop-filter:blur(3px);';
    modal.innerHTML = `
      <div style="background:#fff; width:94%; max-width:1300px; height:88vh; border-radius:12px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); display:flex; flex-direction:column; overflow:hidden;">
        <header style="padding:16px 24px; background:#1e293b; color:#fff; display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #2563eb;">
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
              <span>📋 线索分派策略｜产品方案说明</span>
              <span style="font-size:11px; padding:2px 8px; border-radius:999px; background:#2563eb; color:#fff;">V0.7 评审版</span>
            </h3>
            <p style="margin:4px 0 0; font-size:12px; color:#94a3b8;">面向 DCC 培育平台的 Agent 智能生成分派策略方案（供产品、业务、数据、技术联合评审与对照执行）</p>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <button type="button" style="color:#93c5fd; border:1px solid #3b82f6; background:rgba(37,99,235,0.25); padding:6px 14px; font-size:12px; font-weight:600; border-radius:4px; cursor:pointer;" onclick="window.open('DccLead.assets/docs/线索分派策略_产品方案.html', '_blank')">在新窗口打开完整手册 ↗</button>
            <button type="button" style="background:none; border:none; color:#94a3b8; font-size:22px; cursor:pointer; line-height:1;" onclick="closeLeadAllocationPlanDocModal()">✕</button>
          </div>
        </header>
        <div style="flex:1; overflow:hidden; background:#f8fafc;">
          <iframe src="DccLead.assets/docs/线索分派策略_产品方案.html" style="width:100%; height:100%; border:none;"></iframe>
        </div>
        <footer style="padding:12px 24px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; align-items:center;">
          <button type="button" style="height:32px; padding:0 20px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; font-weight:500; cursor:pointer;" onclick="closeLeadAllocationPlanDocModal()">完成查阅，返回工作台</button>
        </footer>
      </div>
    `;
    modal.onclick = function (e) {
      if (e.target === modal) closeLeadAllocationPlanDocModal();
    };
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }
}

function closeLeadAllocationPlanDocModal() {
  const modal = document.getElementById('leadAllocationPlanDocModal');
  if (modal) modal.style.display = 'none';
}

window.openLeadAllocationPlanDocModal = openLeadAllocationPlanDocModal;
window.closeLeadAllocationPlanDocModal = closeLeadAllocationPlanDocModal;

function aiStrategyGetPersonPickerConfig(type) {
  const configs = {
    reviewers: {
      hiddenId: 'aiStratAuditRuleReviewers',
      triggerId: 'aiStratAuditRuleReviewersTrigger',
      panelId: 'aiStratAuditRuleReviewersPanel',
      countId: 'aiStratAuditRuleReviewersCount',
      listId: 'aiStratAuditRuleReviewersList',
      placeholder: '请选择审核人员'
    },
  };
  return configs[type];
}

function aiStrategyGetPersonPickerHtml(type) {
  const config = aiStrategyGetPersonPickerConfig(type);
  return `
    <input id="${config.hiddenId}" type="hidden" />
    <div class="account-picker">
      <div class="account-select-trigger placeholder" id="${config.triggerId}" role="button" tabindex="0" onclick="toggleAiStrategyPersonPicker('${type}')">${config.placeholder}</div>
      <div class="account-picker-panel" id="${config.panelId}">
        <div class="account-picker-tools">
          <span id="${config.countId}">已选 0 / 6</span>
          <span class="account-picker-actions">
            <button class="account-picker-action" type="button" onclick="aiStrategySelectAllPeople('${type}')">全选</button>
            <button class="account-picker-action" type="button" onclick="aiStrategyClearPeople('${type}')">清除所选</button>
          </span>
        </div>
        <div class="account-option-list" id="${config.listId}"></div>
      </div>
    </div>
  `;
}

function aiStrategyRenderPersonPicker(type) {
  const config = aiStrategyGetPersonPickerConfig(type);
  if (!config) return;
  const users = typeof reviewUserOptions !== 'undefined' ? reviewUserOptions : [
    { account: 'U10021', name: '张敏', role: '黑名单审核员', department: '线索运营部' },
    { account: 'U10008', name: '李强', role: 'DCC主管', department: 'DCC管理组' },
    { account: 'U10032', name: '陈晨', role: '线索运营', department: '线索运营部' },
    { account: 'U10016', name: '王磊', role: '运营负责人', department: '运营管理部' },
    { account: 'U10061', name: '赵佳', role: '合规审核员', department: '合规管理组' },
    { account: 'U10077', name: '周宁', role: '平台管理员', department: 'DCC平台组' }
  ];
  const selectedAccounts = aiStrategyState.auditRuleConfig?.[type] || [];
  if (typeof renderAccountMultiPicker === 'function') {
    renderAccountMultiPicker({
      selectedAccounts,
      users,
      formatLabel: user => `${user.name}（${user.role}）`,
      hiddenId: config.hiddenId,
      triggerId: config.triggerId,
      countId: config.countId,
      listId: config.listId,
      placeholder: config.placeholder,
      onchange: user => `aiStrategyTogglePersonSelection('${type}', '${user.account}', this.checked)`
    });
  }
}

function toggleAiStrategyPersonPicker(type) {
  const config = aiStrategyGetPersonPickerConfig(type);
  const panel = document.getElementById(config?.panelId);
  if (!panel) return;
  const wasShown = panel.classList.contains('show');
  document.querySelectorAll('.ai-strategy-audit-rules-modal .account-picker-panel').forEach(p => p.classList.remove('show'));
  if (!wasShown) {
    panel.classList.add('show');
    aiStrategyRenderPersonPicker(type);
  }
}

function aiStrategyTogglePersonSelection(type, account, checked) {
  if (!aiStrategyState.auditRuleConfig) return;
  const current = aiStrategyState.auditRuleConfig[type] || [];
  aiStrategyState.auditRuleConfig[type] = checked
    ? [...new Set([...current, account])]
    : current.filter(a => a !== account);
  aiStrategyRenderPersonPicker(type);
}

function aiStrategySelectAllPeople(type) {
  if (!aiStrategyState.auditRuleConfig) return;
  const users = typeof reviewUserOptions !== 'undefined' ? reviewUserOptions : [];
  aiStrategyState.auditRuleConfig[type] = users.map(u => u.account);
  aiStrategyRenderPersonPicker(type);
}

function aiStrategyClearPeople(type) {
  if (!aiStrategyState.auditRuleConfig) return;
  aiStrategyState.auditRuleConfig[type] = [];
  aiStrategyRenderPersonPicker(type);
}

function aiStrategyToggleNotifySwitch(input) {
  const enabled = Boolean(input?.checked);
  if (aiStrategyState.auditRuleConfig) {
    aiStrategyState.auditRuleConfig.notifyEnabled = enabled;
  }
  const grid = document.getElementById('aiStrategyAuditNotificationGrid');
  const hint = document.getElementById('aiStrategyNotifyHint');
  if (grid) {
    grid.style.opacity = enabled ? '1' : '0.45';
    grid.style.pointerEvents = enabled ? 'auto' : 'none';
  }
  if (hint) {
    hint.textContent = enabled
      ? '产生待审核记录时，向配置的审核通知邮箱发送提醒。'
      : '通知已关闭；仍会生成待审核记录，但不会发送提醒。';
  }
}

function aiStrategyCloseAuditRules(event) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  aiStrategyState.auditRuleModalOpen = false;
  renderAiStrategyWorkbench();
}

function aiStrategySaveAuditRules(event) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  const reviewerEmailsInput = document.getElementById('aiStrategyReviewerEmails');
  const noticeEmailsInput = document.getElementById('aiStrategyNoticeEmails');
  const notifyFrequencySelect = document.getElementById('aiStrategyNotifyFrequency');
  const timeoutReminderSelect = document.getElementById('aiStrategyTimeoutReminder');
  const notifySwitch = document.getElementById('aiStrategyNotifyEnabled');

  aiStrategyState.auditRuleConfig = aiStrategyState.auditRuleConfig || {};
  if (notifySwitch) aiStrategyState.auditRuleConfig.notifyEnabled = notifySwitch.checked;
  if (reviewerEmailsInput) aiStrategyState.auditRuleConfig.reviewerEmails = reviewerEmailsInput.value.trim();
  if (noticeEmailsInput) aiStrategyState.auditRuleConfig.noticeEmails = noticeEmailsInput.value.trim();
  if (notifyFrequencySelect) aiStrategyState.auditRuleConfig.notifyFrequency = notifyFrequencySelect.value;
  if (timeoutReminderSelect) aiStrategyState.auditRuleConfig.timeoutReminder = timeoutReminderSelect.value;

  aiStrategyState.auditRuleModalOpen = false;
  aiStrategyLog('更新策略审核规则与通知设置');
  renderAiStrategyWorkbench();
  aiStrategyNotice('审核规则与通知设置已保存生效。', true);
}

function aiStrategyRenderAuditRuleModal() {
  if (!aiStrategyState.auditRuleModalOpen) return '';
  const config = aiStrategyState.auditRuleConfig || {
    notifyEnabled: false,
    reviewers: ['U10021', 'U10008'],
    noticeRecipients: ['U10021', 'U10032'],
    reviewerEmails: 'lead-audit-review@dcc.example.com',
    noticeEmails: 'dcc-manager@dcc.example.com, operation-owner@dcc.example.com',
    notifyFrequency: '实时通知',
    timeoutReminder: '2小时未处理提醒审核人员'
  };

  return `
    <div class="ai-strategy-modal-backdrop" onclick="if(event.target===this){aiStrategyCloseAuditRules(event);}">
      <div class="ai-strategy-audit-rules-modal" role="dialog" aria-modal="true" aria-labelledby="aiAuditRulesTitle">
        <div class="ai-strategy-modal-header">
          <div class="ai-strategy-modal-title" id="aiAuditRulesTitle">审核规则设置</div>
          <button type="button" class="ai-strategy-help-close" data-ai-action="close-audit-rules" onclick="aiStrategyCloseAuditRules(event)" aria-label="关闭">×</button>
        </div>
        <div class="ai-strategy-modal-body">
          <div class="audit-rule-section audit-rule-notification-region" id="aiStrategyAuditNotificationRegion">
            <div class="audit-rule-section-title">审核与通知</div>
            <label for="aiStrategyNotifyEnabled" class="audit-rule-readonly" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; cursor:pointer; user-select:none;">
              <div>
                <strong>开启审核通知</strong>
                <div class="form-field-helper-label" id="aiStrategyNotifyHint" style="margin-top:4px;">
                  ${config.notifyEnabled ? '产生待审核记录时，向配置的审核通知邮箱发送提醒。' : '通知已关闭；仍会生成待审核记录，但不会发送提醒。'}
                </div>
              </div>
              <span class="switch">
                <input id="aiStrategyNotifyEnabled" type="checkbox" ${config.notifyEnabled ? 'checked' : ''} onchange="aiStrategyToggleNotifySwitch(this)" />
                <span class="slider"></span>
              </span>
            </label>

            <div class="audit-notification-grid" id="aiStrategyAuditNotificationGrid" style="${config.notifyEnabled ? '' : 'opacity:0.45;pointer-events:none;'}">
              <div class="audit-notification-field">
                <div class="form-label">审核人员</div>
                ${aiStrategyGetPersonPickerHtml('reviewers')}
                <div class="form-field-helper-label">从账号人员中选择审核人，支持多选、全选和清除所选。</div>
              </div>


              <div class="audit-notification-field">
                <div class="form-label">审核通知邮箱</div>
                <input class="form-input" id="aiStrategyReviewerEmails" value="${aiStrategyEsc(config.reviewerEmails || '')}" placeholder="多个邮箱用逗号分隔" />
                <div class="form-field-helper-label">支持录入多个邮箱，使用逗号、分号或换行分隔。</div>
              </div>

              <div class="audit-notification-field">
                <div class="form-label">邮件抄送邮箱</div>
                <input class="form-input" id="aiStrategyNoticeEmails" value="${aiStrategyEsc(config.noticeEmails || '')}" placeholder="多个邮箱用逗号分隔" />
                <div class="form-field-helper-label">支持录入多个邮箱，使用逗号、分号或换行分隔。</div>
              </div>

              <div class="audit-notification-field">
                <div class="form-label">通知频率</div>
                <select class="form-input" id="aiStrategyNotifyFrequency">
                  ${['实时通知', '每小时汇总', '每日汇总'].map(v => `<option value="${v}" ${config.notifyFrequency === v ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
              </div>

              <div class="audit-notification-field">
                <div class="form-label">超时提醒</div>
                <select class="form-input" id="aiStrategyTimeoutReminder">
                  ${['不提醒', '1小时未处理提醒审核人员', '2小时未处理提醒审核人员', '4小时未处理提醒审核人员'].map(v => `<option value="${v}" ${config.timeoutReminder === v ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="ai-strategy-modal-footer">
          <button type="button" class="ai-strategy-btn secondary" data-ai-action="close-audit-rules" onclick="aiStrategyCloseAuditRules(event)">取消</button>
          <button type="button" class="ai-strategy-btn primary" data-ai-action="save-audit-rules" onclick="aiStrategySaveAuditRules(event)">保存配置</button>
        </div>
      </div>
    </div>
  `;
}

if (typeof window !== 'undefined') {
  window.toggleAiStrategyPersonPicker = toggleAiStrategyPersonPicker;
  window.aiStrategyTogglePersonSelection = aiStrategyTogglePersonSelection;
  window.aiStrategySelectAllPeople = aiStrategySelectAllPeople;
  window.aiStrategyClearPeople = aiStrategyClearPeople;
  window.aiStrategyToggleNotifySwitch = aiStrategyToggleNotifySwitch;
  window.aiStrategyCloseAuditRules = aiStrategyCloseAuditRules;
  window.aiStrategySaveAuditRules = aiStrategySaveAuditRules;
  window.aiStrategyDismissNotice = aiStrategyDismissNotice;
}
const aiStrategyAllocationDemo = [
  { object: '项目A', leads: 50, score: 82 },
  { object: '项目B', leads: 30, score: 70 },
  { object: '项目C', leads: 20, score: 45 }
];
const aiStrategySnapshotDimensions = ['低效规则', ...aiStrategyRouteOrder];
const aiStrategyBaseSnapshot = {
  '低效规则': '无', '专营店': '示例门店A：人工80% / AI20%',
  '车系': 'N6：人工70% / AI30%', 'SC': '示例SC01：人工70% / AI30%',
  'SC大项目名': '项目A：人工80% / AI20%', '线索状态': '待跟进：人工60% / AI40%',
  '渠道': '渠道R2：人工100% / AI0%'
};

function aiStrategyNewSnapshot() {
  const snapshot = { ...aiStrategyBaseSnapshot };
  snapshot.gradeConfig = aiStrategyState.draft?.gradeConfig || aiStrategyState.gradeConfig;
  snapshot.scoreParams = { weights: [...(aiStrategyState.weights || [])], targets: [...(aiStrategyState.targets || [])], sampleMin: aiStrategyState.sampleMin, scoreCap: aiStrategyState.scoreCap };
  const enabledRules = aiStrategyState.lowEfficiency.filter(item => aiStrategyGetLinkedRule(item)?.status === '启用');
  snapshot['低效规则'] = enabledRules.length ? enabledRules.map(item => `${item.dimension}=${item.strategyName || item.value}（${item.strategyId || '无规则ID'}）：继承关联策略分派动作`).join('；') : '无';
  (aiStrategyState.draft?.rows || []).forEach(row => {
    const aiPercent = aiStrategyGetAiPercent(row.recommended);
    let aiDetail = '';
    if (aiPercent <= 0) {
      aiDetail = '全人工跟进';
    } else if (row.aiMode === '按比例') {
      aiDetail = `按比例：${aiStrategyPolicyLabel(row.aiPolicyId)}`;
    } else {
      aiDetail = `单一AI类型：${row.aiType || '未指定'}`;
    }
    snapshot[row.dimension] = `${row.value}：${row.recommended}（${aiDetail}）`;
  });
  return snapshot;
}

function aiStrategyCurrentVersion() {
  return aiStrategyState.versions.find(item => item.status === '演示生效');
}

function aiStrategyCalculatedDemoRows() {
  const weights = aiStrategyState.weights || [15, 15, 15, 15, 10, 15, 15];
  const targets = aiStrategyState.targets.map((value, index) => Number(value) > 0 ? Number(value) : aiStrategyDemoTargets[index]);
  const directRows = (aiStrategyState.directLeadList || []).map(item => ({
    dimension: item.type === '大项目名' ? '大项目名' : item.type,
    value: item.value,
    priority: 0,
    sample: 0,
    habc: null,
    rates: null,
    current: '—',
    recommended: '—',
    aiMode: '—',
    aiPolicyId: '',
    aiType: '',
    type: '直派名单命中',
    reason: item.note || '命中直派名单，直接按直派路径执行，不进入Agent建议审核。',
    reviewStatus: '无需审核',
    reviewReason: '命中直派名单，直接执行'
  }));
  const lowEfficiencyRows = (aiStrategyState.lowEfficiency || []).map(item => {
    return {
      dimension: item.dimension,
      value: item.value,
      priority: -1,
      sample: 42,
      habc: null,
      rates: null,
      current: '—',
      recommended: '—',
      agentRecommended: '—',
      aiMode: '',
      aiPolicyId: '',
      aiType: '',
      type: '低效对象沿用关联策略',
      reason: '命中低效对象配置，Agent不参与评分，按关联策略当前有效动作执行。',
      reviewStatus: '无需审核',
      reviewReason: '命中低效对象配置，沿用关联策略'
    };
  });
  const sourceRows = [...aiStrategyDemoRows, ...lowEfficiencyRows, ...directRows];
  return sourceRows.map(row => {
    const agentRecommended = row.agentRecommended || row.recommended || '—';
    const low = aiStrategyState.lowEfficiency.some(item => item.dimension === row.dimension && item.value === row.value);
    if (low) return { ...row, agentRecommended, score: '—', scores: '低效对象，不生成评分', targets, reviewStatus: '无需审核', reviewReason: '命中低效对象配置，沿用关联策略' };
    if (row.reviewStatus === '无需审核') return { ...row, agentRecommended, score: '—', scores: '直派对象，不生成评分', targets };
    if (!row.rates || !row.rates.length) {
      return {
        ...row,
        agentRecommended: row.current || '—',
        recommended: row.current || '—',
        score: '—',
        scores: '指标数据缺失，不生成评分',
        targets,
        reviewStatus: '无需审核',
        reviewReason: '评分指标数据缺失，暂无法生成策略建议，沿用现行规则'
      };
    }
    const scores = row.rates.map((rate, index) => {
      const score = rate / targets[index] * 100;
      return aiStrategyState.scoreCap ? Math.min(score, 100) : score;
    });
    const composite = scores.reduce((sum, score, index) => sum + score * weights[index] / 100, 0);
    return { ...row, agentRecommended, score: composite.toFixed(1), scores: scores.map(score => score.toFixed(1)).join(' / '), targets, weights };
  });
}

function aiStrategyCalculateAllocation() {
  let remaining = Math.max(0, aiStrategyState.capacity.planMax - aiStrategyState.capacity.followUpDue - aiStrategyState.capacity.assignedNew);
  return aiStrategyAllocationDemo.map(item => {
    const human = Math.min(item.leads, remaining);
    remaining -= human;
    const ai = item.leads - human;
    return { ...item, human, ai, humanRate: Math.round(human / item.leads * 100), aiRate: Math.round(ai / item.leads * 100) };
  });
}
const aiStrategyDemoVersions = [
  {
    id: 'V-DEMO-BASE',
    source: 'DEMO-101201 · Agent建议审核发布',
    sourceType: 'Agent建议审核发布',
    agentRecommendationId: 'DEMO-101201',
    formalPolicyId: 'DCC-DEMO-BASE',
    apiStatus: '已联调成功',
    status: '演示生效',
    publishAt: '2026-10-12 18:30:00',
    time: '2026-10-12 18:30:00',
    operator: '产品负责人',
    snapshot: {
      '低效规则': '车系=N6（CAR-001）：继承关联策略分派动作',
      '专营店': '示例门店A：人工80% / AI20%（单一AI类型：科大讯飞-冷线索）',
      '车系': 'N6：沿用当前规则（关联低效清单）',
      'SC': '示例SC01：人工70% / AI30%（按比例：内部方案A）',
      'SC大项目名': '项目A：人工80% / AI20%（单一AI类型：科大讯飞-冷线索）',
      '线索状态': '待跟进：人工60% / AI40%（按比例：内部方案B）',
      '渠道': '渠道R2：人工60% / AI40%（按比例：内部方案A）'
    }
  },
  {
    id: 'V-DEMO-3',
    source: 'DEMO-101103 · Agent建议审核发布',
    sourceType: 'Agent建议审核发布',
    agentRecommendationId: 'DEMO-101103',
    formalPolicyId: 'DCC-DEMO-V3',
    apiStatus: '已联调成功',
    status: '历史有效',
    publishAt: '2026-10-11 17:15:00',
    time: '2026-10-11 17:15:00',
    operator: '产品负责人',
    snapshot: {
      '低效规则': '无',
      '专营店': '示例门店A：人工70% / AI30%（单一AI类型：科大讯飞-冷线索）',
      '车系': 'N6：人工70% / AI30%（单一AI类型：一知-冷线索）',
      'SC': '示例SC01：人工80% / AI20%（按比例：内部方案A）',
      'SC大项目名': '项目A：人工70% / AI30%（单一AI类型：科大讯飞-冷线索）',
      '线索状态': '待跟进：人工50% / AI50%（按比例：内部方案B）',
      '渠道': '渠道R2：人工80% / AI20%（按比例：内部方案A）'
    }
  },
  {
    id: 'V-DEMO-2',
    source: 'V-DEMO-1 · 整套策略紧急回滚',
    sourceType: '历史版本回滚',
    agentRecommendationId: '—',
    formalPolicyId: 'DCC-DEMO-V2',
    apiStatus: '已联调成功',
    status: '历史有效',
    publishAt: '2026-10-08 14:20:00',
    time: '2026-10-08 14:20:00',
    operator: '管理员',
    reason: '业务指标波动，紧急恢复稳定版本',
    snapshot: {
      '低效规则': '无',
      '专营店': '示例门店A：人工85% / AI15%（单一AI类型：滨南-冷线索）',
      '车系': 'N6：人工80% / AI20%（单一AI类型：科大讯飞-冷线索）',
      'SC': '示例SC01：人工75% / AI25%（按比例：内部方案A）',
      'SC大项目名': '项目A：人工85% / AI15%（单一AI类型：科大讯飞-冷线索）',
      '线索状态': '待跟进：人工70% / AI30%（按比例：内部方案B）',
      '渠道': '渠道R2：人工100% / AI0%'
    }
  },
  {
    id: 'V-DEMO-1',
    source: '原有规则基线快照',
    sourceType: '系统原有',
    agentRecommendationId: '—',
    formalPolicyId: 'DCC-DEMO-V1',
    apiStatus: '已有策略',
    status: '历史有效',
    publishAt: '2026-09-28 10:00:00',
    time: '2026-09-28 10:00:00',
    operator: '系统演示',
    snapshot: { ...aiStrategyBaseSnapshot }
  }
];

const aiStrategyDemoAudits = [
  { action: '审核通过并生成正式策略 DCC-DEMO-BASE；关联Agent建议 DEMO-101201', operator: '产品负责人', time: '2026-10-12 18:30:00' },
  { action: '审核通过并生成正式策略 DCC-DEMO-V3；关联Agent建议 DEMO-101103', operator: '产品负责人', time: '2026-10-11 17:15:00' },
  { action: '立即生效回滚版本 V-DEMO-2；原因：业务指标波动，紧急恢复稳定版本', operator: '管理员', time: '2026-10-08 14:20:00' }
];

const aiStrategyState = {
  tab: 'low-efficiency',
  window: 30,
  weights: [15, 15, 15, 15, 10, 15, 15],
  lowEfficiency: [{ dimension: '车系', value: '轩逸', strategyId: 'CAR-002', strategyName: '轩逸车系混合比例分配', strategyVersion: '2026-06-11 14:20', condition: '意向车系=轩逸', note: '命中后沿用关联策略，不进入 Agent 动态调配' }],
  directLeadList: [{ type: '大项目名', value: '直派示例项目', note: '仍计入数据组汇总率值和样本量；仅影响执行路径' }],
  targets: [...aiStrategyDemoTargets],
  sampleMin: 3,
  scoreCap: true,
  gradeConfig: { thresholds: { H: 70, A: 60, B: 50 }, directions: { H: '优先建议人工', A: '优先建议人工', B: '按容量动态建议', C: '优先建议AI' } },
  attribution: '首次进线窗口',
  capacity: { planMax: 120, minNew: 20, followUpDue: 35, assignedNew: 55, otherOpen: 12 },
  publishChecks: [false, false, false, false],
  draft: null,
  draftFilters: { dimension: '', value: '', status: '全部', ratioFilter: '' },
  draftPage: 1,
  draftPageSize: 10,
  versions: aiStrategyDemoVersions.map(v => ({ ...v, snapshot: { ...v.snapshot } })),
  rollbackSelection: { targetId: '', scope: 'FULL', dimension: '', reason: '' },
  versionFilter: { status: '全部', keyword: '' },
  versionDetailId: '',
  versionDetailFilter: { dimension: '', value: '' },
  pendingRollbackId: '',
  currentRole: '产品负责人',
  audit: [...aiStrategyDemoAudits],
  feedback: '',
  help: '',
  auditRuleModalOpen: false,
  auditRuleConfig: {
    notifyEnabled: false,
    reviewers: ['U10021', 'U10008'],
    noticeRecipients: ['U10021', 'U10032'],
    reviewerEmails: 'lead-audit-review@dcc.example.com',
    noticeEmails: 'dcc-manager@dcc.example.com, operation-owner@dcc.example.com',
    notifyFrequency: '实时通知',
    timeoutReminder: '2小时未处理提醒审核人员'
  }
};

function aiStrategyPolicyLabel(id) {
  const policy = aiStrategyAiPolicies.find(item => item.id === id);
  return policy ? `${policy.name}（${policy.id} ${policy.version}）` : '未关联';
}

const aiStrategyDimensionAliases = {
  '专营店': ['意向门店', '专营店'],
  '车系': ['意向车系', '车系'],
  'SC': ['SmartCode', 'SC'],
  'SC大项目名': ['大项目名', 'SC大项目名'],
  '线索状态': ['线索状态'],
  '渠道': ['渠道编码', '渠道']
};

function aiStrategyEnabledRules(dimensionName) {
  const aliases = aiStrategyDimensionAliases[dimensionName] || [dimensionName];
  const dimension = (typeof leadAssignmentDimensions !== 'undefined' ? leadAssignmentDimensions : []).find(item => aliases.includes(item.name) || aliases.includes(item.key));
  return dimension ? dimension.rules.filter(rule => rule.status === '启用') : [];
}

function aiStrategyPopulateLowEfficiencyStrategies() {
  const dimension = document.getElementById('aiLowEfficiencyDimension');
  const strategy = document.getElementById('aiLowEfficiencyStrategy');
  const detail = document.getElementById('aiLowEfficiencyStrategyDetail');
  if (!dimension || !strategy) return;
  const selectedId = strategy.value;
  const rules = aiStrategyEnabledRules(dimension.value);
  strategy.innerHTML = dimension.value
    ? `<option value="">请选择已启用策略</option>${rules.map(rule => `<option value="${aiStrategyEsc(rule.id)}">${aiStrategyEsc(rule.name)}（${aiStrategyEsc(rule.id)}）</option>`).join('')}`
    : '<option value="">请先选择对象维度</option>';
  strategy.disabled = !dimension.value || !rules.length;
  if (rules.some(rule => rule.id === selectedId)) strategy.value = selectedId;
  const selected = rules.find(rule => rule.id === strategy.value);
  if (!selected) {
    if (detail) detail.innerHTML = '<span>关联策略预览</span><strong>选择策略后自动显示</strong><small>仅展示对应维度下状态为“启用”的策略名称。</small>';
    return;
  }
  if (detail) detail.innerHTML = `<span>关联策略预览</span><strong>${aiStrategyEsc(selected.name)}（${aiStrategyEsc(selected.id)}）</strong><small>匹配值：${aiStrategyEsc(selected.keyValue || '—')}；匹配条件：${aiStrategyEsc(selected.condition || '—')}；当前动作：${aiStrategyEsc(selected.action || '—')}；版本：${aiStrategyEsc(selected.updatedAt || '当前')}</small>`;
}

function aiStrategyGetLinkedRule(item) {
  const rules = aiStrategyEnabledRules(item.dimension);
  return rules.find(rule => rule.id === item.strategyId) || null;
}

function aiStrategyLinkedAllocationSummary(item) {
  const rule = aiStrategyGetLinkedRule(item);
  return rule
    ? `${aiStrategyEsc(rule.action || '—')}<br><small>按关联策略 ${aiStrategyEsc(rule.id)} 当前有效设置执行</small>`
    : '<span class="ai-strategy-danger">关联策略已停用或不存在；不执行过期比例</span>';
}

function aiStrategyEsc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

let aiStrategyNoticeTimer = null;

function aiStrategyNotice(text, success = false, duration = 3000) {
  aiStrategyState.feedback = text;
  const node = document.getElementById('aiStrategyFeedback');
  if (node) {
    if (aiStrategyNoticeTimer) {
      clearTimeout(aiStrategyNoticeTimer);
      aiStrategyNoticeTimer = null;
    }
    node.innerHTML = `
      <div class="ai-strategy-feedback-content">
        <span>${aiStrategyEsc(text)}</span>
        <button type="button" class="ai-strategy-feedback-close" onclick="aiStrategyDismissNotice()" aria-label="关闭提示">×</button>
      </div>
    `;
    node.className = `ai-strategy-feedback ${success ? 'is-success' : 'is-warning'}`;
    node.style.opacity = '1';
    node.hidden = false;

    if (duration > 0) {
      aiStrategyNoticeTimer = setTimeout(() => {
        aiStrategyDismissNotice();
      }, duration);
    }
  }
}

function aiStrategyDismissNotice() {
  const node = document.getElementById('aiStrategyFeedback');
  if (!node) return;
  if (aiStrategyNoticeTimer) {
    clearTimeout(aiStrategyNoticeTimer);
    aiStrategyNoticeTimer = null;
  }
  node.style.opacity = '0';
  setTimeout(() => {
    node.hidden = true;
    aiStrategyState.feedback = '';
  }, 250);
}

function aiStrategyLoadDemoData() {
  aiStrategyState.weights = [15, 15, 15, 15, 10, 15, 15];
  aiStrategyState.targets = [...aiStrategyDemoTargets];
  aiStrategyState.sampleMin = 3;
  aiStrategyState.scoreCap = true;
  aiStrategyState.gradeConfig = { thresholds: { H: 70, A: 60, B: 50 }, directions: { H: '优先建议人工', A: '优先建议人工', B: '按容量动态建议', C: '优先建议AI' } };
  aiStrategyState.attribution = '首次进线窗口';
  aiStrategyState.lowEfficiency = [{ dimension: '车系', value: '轩逸', strategyId: 'CAR-002', strategyName: '轩逸车系混合比例分配', strategyVersion: '2026-06-11 14:20', condition: '意向车系=轩逸', note: '演示：命中后沿用关联策略，不进入 Agent 动态调配' }];
  aiStrategyState.directLeadList = [{ type: '大项目名', value: '直派示例项目', note: '演示：仍计入数据组汇总率值和样本量；仅影响执行路径' }];
  aiStrategyState.capacity = { planMax: 120, minNew: 20, followUpDue: 35, assignedNew: 55, otherOpen: 12 };
  aiStrategyState.draft = null;
  aiStrategyState.publishChecks = [false, false, false, false];
  aiStrategyState.pendingRollbackId = '';
  aiStrategyState.rollbackSelection = { targetId: '', scope: 'FULL', dimension: '', reason: '' };
  aiStrategyState.versions = aiStrategyDemoVersions.map(v => ({ ...v, snapshot: { ...v.snapshot } }));
  aiStrategyState.audit = [...aiStrategyDemoAudits];
  aiStrategyState.help = '';
  aiStrategyState.tab = 'low-efficiency';
  aiStrategyLog('载入完整演示数据');
  renderAiStrategyWorkbench();
  aiStrategyNotice('完整演示数据已载入：可直接生成草案并操作审核、发布和回滚流程。', true);
}

function aiStrategyLog(action) {
  aiStrategyState.audit.unshift({ action, operator: aiStrategyState.currentRole || '系统演示', time: new Date().toLocaleString('zh-CN', { hour12: false }) });
}

function renderAiStrategyWorkbench(panel = document.getElementById('aiStrategyWorkbenchPage')) {
  if (!panel) return;
  const enabledLowEfficiencyCount = aiStrategyState.lowEfficiency.filter(item => aiStrategyGetLinkedRule(item)).length;
  const directLeadCount = aiStrategyState.directLeadList.length;
  const pendingReviewCount = aiStrategyState.draft?.status === '待演示审核' ? 1 : (aiStrategyState.draft ? (aiStrategyState.draft.rows || []).filter(r => (r.reviewStatus || '待审核') === '待审核').length : 0);
  const activeVersion = aiStrategyCurrentVersion()?.id || '—';
  const nav = [
    ['low-efficiency', '低效对象配置'],
    ['data-scope', '直派名单'],
    ['drafts', '策略建议与审核'],
    ['versions', '版本与回滚']
  ];
  panel.innerHTML = `
    <section class="ai-strategy-workbench" aria-label="AI策略工作台">
      <div class="ai-strategy-intro">
        <div class="ai-strategy-intro-copy"><div class="ai-strategy-title">AI策略工作台</div>
          <p>维护直派线索名单，配置标识类型、标识值和生效说明。</p></div>
        <div class="ai-strategy-intro-stats" aria-label="AI策略工作台概况">
          <div class="ai-strategy-intro-stat is-blue"><span>低效关联</span><strong>${enabledLowEfficiencyCount}</strong></div>
          <div class="ai-strategy-intro-stat is-green"><span>直派标识</span><strong>${directLeadCount}</strong></div>
          <div class="ai-strategy-intro-stat is-orange"><span>待审核建议</span><strong>${pendingReviewCount}</strong></div>
          <div class="ai-strategy-intro-stat is-slate"><span>当前生效版本</span><strong class="is-version">${aiStrategyEsc(activeVersion)}</strong></div>
        </div>
      </div>
      <div class="ai-strategy-tabs" role="tablist" aria-label="AI策略工作台功能页">
        ${nav.map(([key, name]) => `<button type="button" class="ai-strategy-tab ${aiStrategyState.tab === key ? 'active' : ''}" data-ai-action="tab" data-ai-value="${key}" role="tab" aria-selected="${aiStrategyState.tab === key}">${name}</button>`).join('')}
      </div>
      <div id="aiStrategyFeedback" class="ai-strategy-feedback" hidden></div>
      <div class="ai-strategy-body">${aiStrategyRenderTab()}</div>
      ${aiStrategyRenderHelpModal()}
      ${aiStrategyRenderAuditRuleModal()}
    </section>`;
  aiStrategyPopulateLowEfficiencyStrategies();
  if (aiStrategyState.auditRuleModalOpen) {
    aiStrategyRenderPersonPicker('reviewers');
  }
}

function aiStrategyRenderTab() {
  switch (aiStrategyState.tab) {
    case 'low-efficiency': return aiStrategyRenderLowEfficiency();
    case 'data-scope': return aiStrategyRenderDataScope();
    case 'drafts': return aiStrategyRenderDrafts();
    case 'versions': return aiStrategyRenderVersions();
    default: return aiStrategyRenderLowEfficiency();
  }
}

function aiStrategyRenderFlow() {
  return `<section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>功能逻辑流程</h3><p>这里展示“每天怎么生成策略”和“新线索怎么执行分派”两条链路。生成建议不会直接改动正在执行的规则。</p></div><span class="ai-strategy-tag">已确认口径</span></div>
    <div class="ai-strategy-flow"><span>数据组T+1数据</span><i>→</i><span>低效对象判断</span><i>→</i><span>样本检查</span><i>→</i><span>系统算分</span><i>→</i><span>Agent建议</span><i>→</i><span>运营审核</span><i>→</i><span>授权发布新版本</span></div>
    <div class="ai-strategy-logic-grid"><div class="ai-strategy-info is-stop"><span>命中低效对象</span><strong>沿用关联的普通策略</strong><small>不进入Agent评分、排名和动态调配。</small></div><div class="ai-strategy-info is-stop"><span>样本不足</span><strong>沿用当前有效规则</strong><small>不评分、不排名、不调整，不影响其他对象。</small></div><div class="ai-strategy-info is-ok"><span>样本足够</span><strong>进入系统评分和Agent建议</strong><small>Agent逐对象返回评分，运营人员再确定人工/AI执行方式。</small></div></div></section>
    <section class="ai-strategy-card"><h3>新线索实际执行顺序</h3><div class="ai-strategy-flow"><span>线索进入</span><i>→</i><span>识别直派/普通路径</span><i>→</i><span>低效关联优先识别</span><i>→</i><span>专营店</span><i>→</i><span>车系</span><i>→</i><span>SC</span><i>→</i><span>SC大项目名</span><i>→</i><span>线索状态</span><i>→</i><span>渠道兜底</span></div><div class="ai-strategy-two-col"><div class="ai-strategy-info"><span>人工部分</span><strong>沿用现有坐席/主管承接逻辑</strong><small>坐席达到最大接收量时挂靠主管，仍属于人工流程。</small></div><div class="ai-strategy-info"><span>AI部分</span><strong>使用关联策略选定的AI方式</strong><small>低效对象也不另设AI方案，直接读取关联策略当前设置。</small></div></div></section>
    <section class="ai-strategy-card"><h3>异常时的处理</h3><div class="ai-strategy-logic-grid"><div class="ai-strategy-info is-stop"><span>数据未结算或字段缺失</span><strong>不生成可发布草案</strong><small>沿用最近有效策略并提示运营。</small></div><div class="ai-strategy-info is-stop"><span>Agent失败或输出不完整</span><strong>不创建新版本</strong><small>记录失败原因，不影响已发布分派。</small></div><div class="ai-strategy-info is-ok"><span>回滚</span><strong>生成新版本再切换</strong><small>只影响回滚后新线索，已经分配的任务不重派。</small></div></div></section>`;
}

function aiStrategyRenderBlueprint() {
  return `<section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>系统蓝图</h3><p>按“谁提供数据、谁计算、谁建议、谁审核、谁执行”划分边界，避免把系统计算工作交给Agent。</p></div><span class="ai-strategy-tag">职责边界</span></div>
    <div class="ai-strategy-blueprint"><div><b>① 数据来源</b><span>数据组：六类对象七项率值、样本量、数据日期。</span><span>DCC：现行规则、排班、坐席容量、任务占用。</span></div><div><b>② 业务系统</b><span>保存运营配置和版本。</span><span>计算七项分、对象分、线索分、H/A/B/C和T+1缺口。</span></div><div><b>③ Agent建议</b><span>读取已算好的结果。</span><span>逐对象返回评分和人工/AI总比例建议，不直接发布。</span></div><div><b>④ 人工决策</b><span>运营核对评分和比例。</span><span>AI占比大于0时，必须选择按比例或不按比例及对应配置；负责人审核，授权人员确认发布。</span></div><div><b>⑤ DCC执行</b><span>整套版本切换后分派新线索。</span><span>任务记录规则ID和策略版本，便于回看。</span></div></div><p class="ai-strategy-muted" style="margin-top:14px">数据与控制方向：数据组/DCC → 业务系统算分 → Agent草案 → 运营补充AI执行方式 → 审核发布 → DCC执行 → 结果回传复盘。回传接口未完成时，只展示分派执行结果，不宣称已经验证转化提升。</p></section>
    <section class="ai-strategy-card"><h3>关键输入和输出</h3><div class="ai-strategy-table-wrap"><table class="ai-strategy-table"><thead><tr><th>交互方</th><th>提供/接收内容</th><th>失败时处理</th></tr></thead><tbody><tr><td>数据组 → 系统</td><td>七项率值、样本量、数据日期和核对明细；汇总包含直派</td><td>数据不完整，不生成新草案</td></tr><tr><td>DCC → 系统</td><td>当前策略、容量、继续跟进占用和已分派任务</td><td>容量或版本读不到，不允许发布新建议</td></tr><tr><td>系统 → Agent</td><td>已算好的得分、H/A/B/C、样本状态、缺口、当前比例和运营边界</td><td>输入缺失，Agent结果标记失败</td></tr><tr><td>Agent → 人工</td><td>每个对象的 Agent评分、建议比例和规则维度信息</td><td>漏对象或字段不完整，不能进入审核发布</td></tr><tr><td>人工 → DCC</td><td>审核后的整套新版本及AI内部配置引用</td><td>发布失败，继续使用旧版本</td></tbody></table></div></section>`;
}

function aiStrategyRenderOverview() {
  return `
    <div class="ai-strategy-kpis">
      <div><span>评分指标</span><strong>7 项</strong><small>直接采用数据组汇总率值，包含直派</small></div>
      <div><span>现有路由维度</span><strong>6 类</strong><small>继续按既有优先级独立匹配</small></div>
      <div><span>演示草案</span><strong>${aiStrategyState.draft ? aiStrategyEsc(aiStrategyState.draft.status) : '未生成'}</strong><small>不代表线上已发布策略</small></div>
      <div><span>评审待确认</span><strong>关键口径</strong><small>权重、目标值、评分对象、跨窗口归属</small></div>
    </div>
    <section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>快速开始</h3><p>载入一组完整演示数据，直接体验低效关联、评分、容量、Agent审核、发布和回滚流程。</p></div><button type="button" class="ai-strategy-btn primary" data-ai-action="load-demo-data">载入完整演示数据</button></div><p class="ai-strategy-muted">演示数据仅保存在当前副本页面内：N6车系关联低效清单后沿用其已启用策略；直派线索仍计入数据组汇总率值和样本量；七项权重、T+1容量和AI内部比例方案均为演示数据。</p></section>
    <div class="ai-strategy-two-col">
      <section class="ai-strategy-card"><h3>推荐操作顺序</h3><ol class="ai-strategy-steps">
        <li>业务/数据确认七项计数、目标值和 W1–W7 权重。</li>
        <li>运营把低效对象关联到现有启用策略，无需再填分派比例；直派仅作为执行标识，不从汇总数据排除。</li>
        <li>系统读取结算数据、容量和现行版本，完成评分与校验。</li>
        <li>Agent 输出可解释建议；运营审核后由有权限人员发布。</li>
        <li>DCC 按发布版本分派，并在任务上记录策略 ID 与版本。</li>
      </ol></section>
      <section class="ai-strategy-card"><h3>与现有原型的关系</h3><div class="ai-strategy-link-list">
        <div><b>沿用</b><span>六类规则页、分配比例公共配置、坐席管理最大接收量、排班管理。</span></div>
        <div><b>新增</b><span>七项评分配置、低效对象清单、容量说明、策略草案、审批/发布演示、版本追溯。</span></div>
        <div><b>不覆盖</b><span>AI工作台的示例草案不自动改写既有路由规则；原有菜单和无关页面保持不变。</span></div>
      </div></section>
    </div>
    <section class="ai-strategy-card"><h3>已确认的路由顺序</h3><div class="ai-strategy-route"><span>低效关联（优先识别）</span><i>→</i>${aiStrategyRouteOrder.map((label, i) => `<span>${i + 1}. ${label}</span>`).join('<i>→</i>')}</div><p class="ai-strategy-muted">命中低效关联后直接执行所关联策略当前有效的分派动作；未命中时，六类普通规则独立维护，按固定顺序命中第一条有效规则后停止。渠道是现有最粗的兜底路由。</p></section>
    <section class="ai-strategy-card"><h3>暂不纳入本链路</h3><p class="ai-strategy-muted">R9 保客在未命中低效关联时沿用现行独立分配规则，不进入本次 Agent 评分；若命中低效关联，则沿用关联策略。ABTest 当前不接入 Agent 分配流程。未结算或样本不足时沿用已生效规则，不因为评分缺失而停止分派。</p></section>`;
}

function aiStrategyRenderMetrics() {
  const weights = aiStrategyState.weights || Array(7).fill('');
  const gradeConfig = aiStrategyState.gradeConfig;
  const gradeRange = grade => {
    if (!gradeConfig) return '待配置';
    const { H, A, B } = gradeConfig.thresholds;
    if (grade === 'H') return `≥ ${H} 分`;
    if (grade === 'A') return `${A}–<${H} 分`;
    if (grade === 'B') return `${B}–<${A} 分`;
    return `0–<${B} 分`;
  };
  return `<section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>七项评分参数</h3><p>目标值和最低样本量必须为正整数；权重可填 0，七项权重之和必须为 100%。</p></div>${aiStrategyHelpButton('metrics')}</div>
    <div class="ai-strategy-table-wrap"><table class="ai-strategy-table"><thead><tr><th>指标</th><th>目标值（%）</th><th>权重（%）</th></tr></thead><tbody>
    ${aiStrategyMetrics.map(([name], index) => `<tr><td><strong>${name}</strong></td><td><input id="aiTarget${index}" type="number" min="1" max="100" step="1" inputmode="numeric" value="${aiStrategyEsc(aiStrategyState.targets[index] || '')}" aria-describedby="aiTargetError${index}" required><small id="aiTargetError${index}" class="ai-strategy-field-error" aria-live="polite"></small></td><td><input id="aiWeight${index}" type="number" min="0" max="100" step="1" inputmode="numeric" value="${aiStrategyEsc(weights[index] ?? '')}" aria-describedby="aiWeightError${index}" required><small id="aiWeightError${index}" class="ai-strategy-field-error" aria-live="polite"></small></td></tr>`).join('')}
    </tbody></table></div>
    <div class="ai-strategy-config-form"><label>最低样本量（条）<input id="aiSampleMin" type="number" min="1" step="1" inputmode="numeric" value="${aiStrategyState.sampleMin}" aria-describedby="aiSampleMinError" required><small id="aiSampleMinError" class="ai-strategy-field-error" aria-live="polite"></small></label><label>指标得分超过目标时<select id="aiScoreCap"><option value="cap" ${aiStrategyState.scoreCap ? 'selected' : ''}>最高按100分</option><option value="uncapped" ${!aiStrategyState.scoreCap ? 'selected' : ''}>按实际结果计算</option></select></label></div>
    <div class="ai-strategy-actions"><button type="button" class="ai-strategy-btn primary" data-ai-action="save-weights">保存评分参数配置</button></div>
  </section>
  <section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>H/A/B/C 分级参考配置</h3><p>按线索综合分划分等级，并配置 Agent 生成对象比例建议时参考的方向。这里不直接分派单条线索。</p></div>${aiStrategyHelpButton('grades')}</div>
    <div class="ai-strategy-table-wrap"><table class="ai-strategy-table"><thead><tr><th>等级</th><th>分值范围</th><th>Agent 建议方向</th></tr></thead><tbody>
      ${['H', 'A', 'B', 'C'].map(grade => `<tr><td><strong>${grade}</strong></td><td>${grade === 'C' ? gradeRange(grade) : `<label class="ai-grade-threshold"><span class="ai-grade-range-preview">${gradeRange(grade)}</span><input id="aiGrade${grade}" type="number" min="1" max="100" step="1" inputmode="numeric" value="${gradeConfig?.thresholds[grade] ?? ''}" aria-describedby="aiGrade${grade}Error" required><small id="aiGrade${grade}Error" class="ai-strategy-field-error" aria-live="polite"></small></label>`}</td><td><select id="aiGradeDirection${grade}" class="ai-strategy-inline-select">${aiStrategyGradeOptions.map(direction => `<option value="${direction}" ${gradeConfig?.directions[grade] === direction ? 'selected' : ''}>${direction}</option>`).join('')}</select></td></tr>`).join('')}
    </tbody></table></div>
    <div class="ai-strategy-info ai-grade-capacity-info"><strong>容量判断口径</strong><span>Agent先保留 H，再保留 A；B 根据对象上一完整业务日的人工可承接容量决定；C 优先建议 AI。Agent只输出对象人工/AI建议比例，实际分派仍按已发布的对象规则执行。</span></div>
    <p class="ai-strategy-muted">范围按下限自动衔接，不会重叠：H 为 H 下限以上；A 为 A 下限至 H 下限（不含）；B 为 B 下限至 A 下限（不含）；C 为 0 至 B 下限（不含）。须满足 H ＞ A ＞ B ＞ 0。</p>
    <div class="ai-strategy-actions"><button type="button" class="ai-strategy-btn primary" data-ai-action="save-grades">保存分级参考配置</button></div>
  </section>`;
}

function aiStrategyRenderLowEfficiency() {
  return `<section class="ai-strategy-card ai-low-eff-card"><div class="ai-strategy-section-head"><div><h3>运营配置低效对象</h3><p>选择已启用的普通分配策略并填写维护说明。命中后不参与 Agent 评分和动态调配，分派动作沿用关联策略。</p></div><div class="ai-strategy-section-head-actions">${aiStrategyPlanDocButton()}${aiStrategyHelpButton('low-efficiency')}</div></div>
    <form id="aiLowEfficiencyForm" class="ai-strategy-config-form ai-low-eff-form" novalidate>
      <label>对象维度<select name="dimension" id="aiLowEfficiencyDimension" required><option value="">请选择</option>${aiStrategyRouteOrder.map(name => `<option value="${name}">${name}</option>`).join('')}</select><small class="ai-strategy-field-error" data-error="dimension"></small></label>
      <label>对象值（关联分配策略名称）<select name="strategyId" id="aiLowEfficiencyStrategy" required disabled><option value="">请先选择对象维度</option></select><small class="ai-strategy-field-error" data-error="strategyId"></small></label>
      <label class="ai-low-eff-note">维护说明<input name="note" type="text" maxlength="100" placeholder="例如：该策略不参与 Agent 调配" required><small class="ai-strategy-field-error" data-error="note"></small></label>
      <div class="ai-strategy-info ai-low-eff-detail" id="aiLowEfficiencyStrategyDetail" aria-live="polite"><span>关联策略预览</span><strong>选择策略后自动显示</strong><small>仅展示对应维度下状态为“启用”的策略名称。</small></div>
      <button type="submit" class="ai-strategy-btn primary">加入低效清单</button>
    </form>
    <p class="ai-strategy-muted ai-low-eff-hint">命中低效关联时，直接执行关联策略当前生效的分派动作；关联策略停用或删除后，该关联失效，线索回到普通规则匹配。</p>
    <div class="ai-low-eff-list-head"><h4>已配置低效对象</h4><span>共 ${aiStrategyState.lowEfficiency.length} 条</span></div>
    <div class="ai-strategy-table-wrap"><table class="ai-strategy-table ai-strategy-low-eff-table"><thead><tr><th>对象维度</th><th>关联策略</th><th>匹配值/规则ID</th><th>关联策略状态</th><th>继承的分派动作</th><th>对 Agent 的作用</th><th>维护说明</th><th>操作</th></tr></thead><tbody>${aiStrategyState.lowEfficiency.length ? aiStrategyState.lowEfficiency.map((item, index) => `<tr><td><strong>${aiStrategyEsc(item.dimension)}</strong></td><td>${aiStrategyEsc(item.strategyName || '—')}</td><td>${aiStrategyEsc(item.value || '—')}<br><small>${aiStrategyEsc(item.strategyId || '—')}</small></td><td>${aiStrategyGetLinkedRule(item) ? '启用' : '<span class="ai-strategy-danger">关联失效</span>'}</td><td>${aiStrategyLinkedAllocationSummary(item)}</td><td>不参与评分、排名和动态调配</td><td>${aiStrategyEsc(item.note)}</td><td><button type="button" class="ai-strategy-text-btn" data-ai-action="remove-low-eff" data-ai-value="${index}">移除</button></td></tr>`).join('') : '<tr><td colspan="8" class="ai-strategy-empty">暂无低效关联。请从六类规则中选择已启用策略；此处不会修改普通分配规则。</td></tr>'}</tbody></table></div></section>`;
}

function aiStrategyRenderDataScope() {
  return `<section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>直派名单</h3><p>维护需要直接执行的线索标识，保存后按直派路径执行。命中直派名单后，不参与 Agent 评分、排名和动态调配。</p></div><div class="ai-strategy-section-head-actions">${aiStrategyPlanDocButton()}${aiStrategyHelpButton('data-scope')}</div></div>
    <form id="aiDirectLeadForm" class="ai-strategy-config-form ai-direct-lead-form" novalidate>
      <label>直派名单类型<select name="type" required><option value="">请选择</option><option value="大项目名">大项目名</option></select><small class="ai-strategy-field-error" data-error="type"></small></label>
      <label>标识值<input name="value" type="text" maxlength="80" placeholder="例如：高德地图大项目" required><small class="ai-strategy-field-error" data-error="value"></small></label>
      <label>生效说明<input name="note" type="text" maxlength="120" placeholder="例如：用于识别执行路径，不扣除汇总分母" required><small class="ai-strategy-field-error" data-error="note"></small></label>
      <button type="submit" class="ai-strategy-btn primary">加入直派标识</button>
    </form>
    <div class="ai-strategy-table-wrap"><table class="ai-strategy-table ai-strategy-direct-lead-table"><thead><tr><th>直派名单类型</th><th>标识值</th><th>对 Agent 的作用</th><th>生效说明</th><th>操作</th></tr></thead><tbody>${aiStrategyState.directLeadList.length ? aiStrategyState.directLeadList.map((item, index) => `<tr><td>${aiStrategyEsc(item.type)}</td><td><strong>${aiStrategyEsc(item.value)}</strong></td><td>不参与评分、排名和动态调配</td><td>${aiStrategyEsc(item.note)}</td><td><button type="button" class="ai-strategy-text-btn" data-ai-action="remove-direct" data-ai-value="${index}">移除</button></td></tr>`).join('') : '<tr><td colspan="5" class="ai-strategy-empty">暂无演示直派标识。请按业务确认名单维护。</td></tr>'}</tbody></table></div></section>`;
}

function aiStrategyRenderCapacity() {
  const capacity = aiStrategyState.capacity;
  const remaining = Math.max(0, capacity.planMax - capacity.followUpDue - capacity.assignedNew);
  return `<section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>上一完整业务日人工容量</h3><p>查看策略建议所使用的容量快照。容量来自现有排班、坐席和任务数据，此处不重复维护。</p></div><div class="ai-strategy-section-head-actions">${aiStrategyHelpButton('capacity')}</div></div>
    <div class="ai-strategy-kpis compact"><div><span>计划人工上限</span><strong>${capacity.planMax}</strong></div><div><span>继续跟进占用</span><strong>${capacity.followUpDue}</strong></div><div><span>已分派新任务</span><strong>${capacity.assignedNew}</strong></div><div><span>剩余人工容量</span><strong>${remaining}</strong></div></div>
    <p class="ai-strategy-muted">计算：${capacity.planMax} − ${capacity.followUpDue} − ${capacity.assignedNew} = ${remaining} 条。数据未结算或缺失时，不能据此生成新建议。</p>
  </section>`;
}

function aiStrategyBusinessDate(value = new Date()) {
  const y = value.getFullYear(); const m = String(value.getMonth() + 1).padStart(2, '0'); const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function aiStrategyDraftDate(draft) { return draft?.businessDate || String(draft?.createdAt || '').slice(0, 10) || aiStrategyBusinessDate(); }
function aiStrategyAgentReason(row) {
  const score = row?.score;
  if (score !== undefined && score !== null && score !== '' && score !== '—' && Number.isFinite(Number(score))) {
    return `Agent建议评分为 ${score} 分，系统将该评分作为对象效能参考，建议结合当前人工容量与现行分派规则审核确认。`;
  }
  if (row?.reviewStatus === '无需审核' && row?.type === '直派名单命中') return '命中直派名单，Agent不参与评分，按直派路径直接执行。';
  if (row?.scores === '低效对象，不生成评分') return '命中低效对象配置，Agent不参与评分，沿用关联策略执行。';
  if (row?.scores === '指标数据缺失，不生成评分') return '评分指标数据缺失，暂无法生成策略建议，沿用现行分派规则直接执行。';
  return 'Agent建议记录已生成，建议结合当前人工容量与现行分派规则审核确认。';
}
function aiStrategyRenderDrafts() {
  if (!aiStrategyState.draft) {
    if (!aiStrategyState.weights || !aiStrategyState.targets) {
      aiStrategyState.weights = [15, 15, 15, 15, 10, 15, 15];
      aiStrategyState.targets = [...aiStrategyDemoTargets];
    }
    if (!aiStrategyState.gradeConfig) {
      aiStrategyState.gradeConfig = { thresholds: { H: 70, A: 60, B: 50 }, directions: { H: '优先建议人工', A: '优先建议人工', B: '按容量动态建议', C: '优先建议AI' } };
    }
    aiStrategyState.draft = {
      id: 'REC-20261012-0001',
      businessDate: aiStrategyBusinessDate(),
      name: '线索分派策略建议 · 演示草案',
      status: '演示草案',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      gradeConfig: { thresholds: { ...aiStrategyState.gradeConfig.thresholds }, directions: { ...aiStrategyState.gradeConfig.directions } },
      rows: aiStrategyCalculatedDemoRows().map(row => ({ ...row, agentRecommended: row.agentRecommended || row.recommended, habc: row.habc ? { ...row.habc } : null, aiMode: row.aiMode || '', aiPolicyId: row.aiPolicyId || '', aiType: row.aiType || '' }))
    };
  }
  const currentDraft = aiStrategyState.draft;
  const filters = aiStrategyState.draftFilters || { dimension: '', value: '', status: '全部', ratioFilter: '' };
  const requestedDate = filters.businessDate || aiStrategyDraftDate(currentDraft);
  const draft = requestedDate !== aiStrategyDraftDate(currentDraft) ? aiStrategyState.demoHistoricalDraft : currentDraft;
  const draftDate = aiStrategyDraftDate(draft);
  const allRows = draft?.rows || [];
  const filteredRows = allRows.map((row, index) => ({ row, index })).filter(({ row }) => (!filters.businessDate || filters.businessDate === draftDate) && (!filters.dimension || row.dimension === filters.dimension) && (!filters.value || String(row.value || '').toLowerCase().includes(filters.value.toLowerCase())) && (!filters.ratioFilter || (row.recommended !== '—' && (filters.ratioFilter === '包含AI' ? aiStrategyGetAiPercent(row.recommended) > 0 : aiStrategyGetAiPercent(row.recommended) <= 0))) && (filters.status === '全部' || (row.reviewStatus || '待审核') === filters.status));
  const pendingRows = filteredRows.filter(({ row }) => (row.reviewStatus || '待审核') === '待审核');
  const pageSize = Number(aiStrategyState.draftPageSize || 10);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  aiStrategyState.draftPage = Math.min(Math.max(1, Number(aiStrategyState.draftPage || 1)), totalPages);
  const pagedRows = filteredRows.slice((aiStrategyState.draftPage - 1) * pageSize, aiStrategyState.draftPage * pageSize);
  const isToday = draftDate === aiStrategyBusinessDate();
  const editable = draft?.status === '演示草案' && isToday;
  const dimensions = [...new Set(allRows.map(row => row.dimension))];
  return `<section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>策略建议与审核</h3><p>支持按规则维度、匹配值、建议比例（包含AI / 不包含AI）和审核状态筛选；单条或批量处理只影响当前待审核建议。</p></div><div class="ai-strategy-section-head-actions">${aiStrategyPlanDocButton()}${aiStrategyHelpButton('drafts')}<button type="button" class="ai-strategy-btn secondary" data-ai-action="open-audit-rules" title="设置策略建议审核通知、审核人与超时提醒">审核规则设置</button><button type="button" class="ai-strategy-btn primary" data-ai-action="generate-draft">生成建议</button></div></div>
    ${!draft ? '<div class="ai-strategy-empty block">暂无策略建议。请点击右上角“生成建议”。</div>' : `
      <div class="ai-strategy-draft-head"><div><strong>${aiStrategyEsc(draft.name)}</strong><small>${aiStrategyEsc(draft.id)} · 业务日期 ${aiStrategyEsc(draftDate)} · 生成于 ${aiStrategyEsc(draft.createdAt)}</small></div><span class="ai-strategy-status-tag ${isToday ? 'is-current' : 'is-expired'}">${isToday ? '今日可审核' : '已过期，只读'}</span></div>
      <div class="ai-strategy-filterbar"><label class="ai-strategy-date-filter">版本日期<input type="date" data-ai-filter="businessDate" value="${aiStrategyEsc(filters.businessDate || draftDate)}"></label><select class="ai-strategy-inline-select" data-ai-filter="dimension"><option value="">全部规则维度</option>${dimensions.map(d => `<option value="${aiStrategyEsc(d)}" ${filters.dimension === d ? 'selected' : ''}>${aiStrategyEsc(d)}</option>`).join('')}</select><input class="ai-strategy-inline-input" data-ai-filter="value" value="${aiStrategyEsc(filters.value)}" placeholder="搜索匹配值"><select class="ai-strategy-inline-select" data-ai-filter="ratioFilter" title="按建议比例筛选"><option value="">全部建议比例</option><option value="包含AI" ${filters.ratioFilter === '包含AI' ? 'selected' : ''}>包含AI</option><option value="不包含AI" ${filters.ratioFilter === '不包含AI' ? 'selected' : ''}>不包含AI</option></select><select class="ai-strategy-inline-select" data-ai-filter="status"><option value="待审核" ${filters.status === '待审核' ? 'selected' : ''}>待审核</option><option value="已通过" ${filters.status === '已通过' ? 'selected' : ''}>已通过</option><option value="已驳回" ${filters.status === '已驳回' ? 'selected' : ''}>已驳回</option><option value="全部" ${filters.status === '全部' ? 'selected' : ''}>全部状态</option></select><button type="button" class="ai-strategy-btn secondary" data-ai-action="reset-draft-filters">重置</button><span class="ai-strategy-muted">当前 ${filteredRows.length} 条，待审核 ${pendingRows.length} 条</span>${!isToday ? '<span class="ai-strategy-expired-note">该版本审核窗口已结束，仅支持查看。</span>' : ''}</div>
      <div class="ai-strategy-table-wrap"><table class="ai-strategy-table ai-strategy-drafts-table"><thead><tr><th><input type="checkbox" data-ai-action="select-visible" ${!editable ? 'disabled' : ''} ${pendingRows.length && pendingRows.every(({index}) => aiStrategyState.draft.selected?.includes(index)) ? 'checked' : ''}></th><th>规则维度</th><th>匹配值</th><th>样本量</th><th>当前比例</th><th>建议比例 <span style="font-size:11px;color:#2563eb;font-weight:normal;" title="微调选项收敛为3类参数：Agent建议、全人工或全AI">(可微调)</span></th><th>AI内部方式/方案 <span style="font-size:11px;color:#d97706;font-weight:normal;" title="联动控制：全人工自动锁定；全AI固定不按比例并指定AI类型；混合比例由运营自主选择">(联动控制)</span></th><th>建议说明</th><th>审核状态</th><th>操作</th></tr></thead><tbody>${pagedRows.map(({row, index}) => {
  const status = row.reviewStatus || '待审核';
  const policy = row.aiPolicyId ? aiStrategyAiPolicies.find(item => item.id === row.aiPolicyId) : null;
  const mode = row.aiMode || '';
  const aiPercent = aiStrategyGetAiPercent(row.recommended);
  const isUnlocked = aiPercent > 0;

  // 1. 建议比例渲染（收敛为3类参数：Agent原始建议、人工100% / AI0%、人工0% / AI100%）
  const agentRatio = row.agentRecommended || row.recommended;
  const ratioOptions = [];

  if (agentRatio && agentRatio !== '—') {
    ratioOptions.push({
      value: agentRatio,
      label: `${agentRatio}（Agent建议）`
    });
  }

  if (agentRatio !== '人工100% / AI0%') {
    ratioOptions.push({
      value: '人工100% / AI0%',
      label: '人工100% / AI0%'
    });
  }

  if (agentRatio !== '人工0% / AI100%') {
    ratioOptions.push({
      value: '人工0% / AI100%',
      label: '人工0% / AI100%'
    });
  }

  let recRatioHtml = '';
  if (row.scores === '低效对象，不生成评分') {
    recRatioHtml = '<strong>—</strong><small style="display:block;color:#64748b;font-size:11px;">低效对象，不生成建议</small>';
  } else if (editable && status === '待审核' && row.recommended !== '—') {
    recRatioHtml = `<select class="ai-strategy-inline-select" data-ai-rec-index="${index}" style="font-weight:600;min-width:145px;" title="微调建议比例：可选择Agent建议、全人工或全AI">
      ${ratioOptions.map(opt => `<option value="${aiStrategyEsc(opt.value)}" ${row.recommended === opt.value ? 'selected' : ''}>${aiStrategyEsc(opt.label)}</option>`).join('')}
    </select>`;
  } else {
    const isAgentRec = row.recommended === agentRatio;
    recRatioHtml = `<strong>${aiStrategyEsc(row.recommended)}</strong>${isAgentRec && row.recommended !== '—' ? '<small style="display:block;color:#64748b;font-size:11px;">Agent建议</small>' : (!isAgentRec ? '<small style="display:block;color:#d97706;font-size:11px;">运营调整</small>' : '')}`;
  }

  // 2. AI内部方式/方案渲染（核心联动：全人工锁定、全AI固定不按比例直接选类型、混合比例运营自主选择）
  let aiCellHtml = '';
  if (row.scores === '低效对象，不生成评分') {
    aiCellHtml = '<span class="ai-strategy-status-tag">沿用关联策略</span>';
  } else if (!isUnlocked) {
    // 建议比例无AI分配（AI 0% 或 全人工），锁定置灰不可操作
    aiCellHtml = `
      <div style="display:flex;flex-direction:column;gap:3px;">
        <span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:#64748b;background:#f1f5f9;border:1px solid #cbd5e1;padding:1px 6px;border-radius:4px;width:fit-content;">
          🔒 已锁定 (建议无AI分派)
        </span>
        <select class="ai-strategy-inline-select" disabled title="建议比例未分配给AI（AI 0%），锁定无需配置">
          <option value="">无需配置内部方案</option>
        </select>
        <small style="color:#94a3b8;font-size:11px;">100%全人工跟进，已锁定无需配置</small>
      </div>
    `;
  } else {
    // 存在分配给AI（AI > 0%，含 100% 全AI 与 混合比例），完全解锁运营自主选择【不按比例】或【按比例】
    const modeSelect = `
      <div style="display:flex;align-items:center;gap:4px;margin-bottom:3px;">
        <span style="display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:600;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:1px 6px;border-radius:4px;">
          🔓 已解锁 (AI ${aiPercent}%)
        </span>
      </div>
      <select class="ai-strategy-inline-select" data-ai-ai-index="${index}" data-ai-ai-field="mode" ${editable && status === '待审核' ? '' : 'disabled'}>
        <option value="" ${!mode ? 'selected' : ''}>请选择内部方式（需运营指定）</option>
        <option value="不按比例" ${mode === '不按比例' ? 'selected' : ''}>不按比例</option>
        <option value="按比例" ${mode === '按比例' ? 'selected' : ''}>按比例</option>
      </select>
    `;
    let subSelect = '';
    if (!mode) {
      subSelect = `<select class="ai-strategy-inline-select" disabled><option value="">待先选择内部方式</option></select><small style="color:#d97706;display:block;margin-top:2px;font-size:11px;">⚠️ 字段不做联动，待运营选择</small>`;
    } else if (mode === '按比例') {
      subSelect = `<select class="ai-strategy-inline-select" data-ai-ai-index="${index}" data-ai-ai-field="policy" ${editable && status === '待审核' ? '' : 'disabled'}><option value="">请选择AI内部方案（必选）</option>${aiStrategyAiPolicies.map(item => `<option value="${item.id}" ${item.id === row.aiPolicyId ? 'selected' : ''}>${aiStrategyEsc(item.name)}（${item.version}）</option>`).join('')}</select><small style="display:block;margin-top:2px;font-size:11px;color:${row.aiPolicyId ? '#64748b' : '#d97706'}">${aiStrategyEsc(policy ? policy.detail : '⚠️ 需运营指定具体分流方案')}</small>`;
    } else if (mode === '不按比例') {
      subSelect = `<select class="ai-strategy-inline-select" data-ai-ai-index="${index}" data-ai-ai-field="type" ${editable && status === '待审核' ? '' : 'disabled'}><option value="">请选择AI外呼类型（必选）</option>${aiStrategyAiTypes.map(type => `<option value="${aiStrategyEsc(type)}" ${type === row.aiType ? 'selected' : ''}>${aiStrategyEsc(type)}</option>`).join('')}</select>${!row.aiType ? '<small style="color:#d97706;display:block;margin-top:2px;font-size:11px;">⚠️ 需运营指定AI外呼类型</small>' : ''}`;
    }
    aiCellHtml = `${modeSelect}${subSelect}`;
  }

  return `<tr><td><input type="checkbox" data-ai-row-select="${index}" ${aiStrategyState.draft.selected?.includes(index) ? 'checked' : ''} ${!editable || status !== '待审核' ? 'disabled' : ''}></td><td><strong>${aiStrategyEsc(row.dimension)}</strong></td><td>${aiStrategyEsc(row.value)}</td><td>${row.sample}</td><td>${aiStrategyEsc(row.current)}</td><td>${recRatioHtml}</td><td>${aiCellHtml}</td><td>${aiStrategyEsc(aiStrategyAgentReason(row))}</td><td>${aiStrategyEsc(status)}</td><td>${status === '待审核' ? (editable ? `<button type="button" class="ai-strategy-text-btn" data-ai-action="approve-row" data-ai-value="${index}">通过</button> <button type="button" class="ai-strategy-text-btn" data-ai-action="reject-row" data-ai-value="${index}">驳回</button>` : '<span class="ai-strategy-muted">已过期</span>') : (status === '已驳回' && editable ? `<button type="button" class="ai-strategy-text-btn" data-ai-action="edit-row" data-ai-value="${index}">修改后重审</button>` : (status === '无需审核' ? '<span class="ai-strategy-muted">无需审核</span>' : '<span class="ai-strategy-muted">已处理</span>')) }</td></tr>`;
}).join('')}</tbody></table></div><div class="ai-strategy-pagination"><button type="button" class="ai-strategy-btn secondary" data-ai-action="draft-page-prev" ${aiStrategyState.draftPage <= 1 ? 'disabled' : ''}>上一页</button><span>第 ${aiStrategyState.draftPage} / ${totalPages} 页，共 ${filteredRows.length} 条</span><button type="button" class="ai-strategy-btn secondary" data-ai-action="draft-page-next" ${aiStrategyState.draftPage >= totalPages ? 'disabled' : ''}>下一页</button><select class="ai-strategy-inline-select" data-ai-filter="pageSize"><option value="10" ${aiStrategyState.draftPageSize === 10 ? 'selected' : ''}>10条/页</option><option value="20" ${aiStrategyState.draftPageSize === 20 ? 'selected' : ''}>20条/页</option><option value="50" ${aiStrategyState.draftPageSize === 50 ? 'selected' : ''}>50条/页</option></select></div>
      <div class="ai-strategy-actions">${pendingRows.length ? '<button type="button" class="ai-strategy-btn primary" data-ai-action="approve-selected" title="仅审核已勾选且已完成AI配置的建议">审核选中</button><button type="button" class="ai-strategy-btn secondary" data-ai-action="approve-all-visible" title="审核当前筛选结果中的全部待审核建议；存在未完成AI配置时会提示具体规则">批量审核通过</button>' : ''}${draft.status === '演示已批准' ? '<button type="button" class="ai-strategy-btn primary" data-ai-action="publish-draft">确认发布并生成正式策略</button>' : ''}</div>`}
  </section>`;
}
function aiStrategyRenderVersions() {
  const current = aiStrategyCurrentVersion();
  const versionFilter = aiStrategyState.versionFilter || { status: '全部', keyword: '' };
  const visibleVersions = aiStrategyState.versions.filter(item => (versionFilter.status === '全部' || item.status === versionFilter.status) && (!versionFilter.keyword || `${item.id} ${item.formalPolicyId || ''} ${item.agentRecommendationId || ''}`.toLowerCase().includes(versionFilter.keyword.toLowerCase())));
  const detailVersion = aiStrategyState.versions.find(item => item.id === aiStrategyState.versionDetailId);
  const historical = aiStrategyState.versions.filter(item => item.status === '历史有效');
  const rollbackDimensions = aiStrategyRouteOrder;
  const choice = aiStrategyState.rollbackSelection;
  const target = historical.find(item => item.id === choice.targetId);
  const pending = aiStrategyState.versions.find(item => item.id === aiStrategyState.pendingRollbackId && item.status === '待发布');
  const preview = target && current && choice.reason ? aiStrategySnapshotDimensions.map(dimension => ({
    dimension, current: current.snapshot[dimension] || '无', target: target.snapshot[dimension] || '无',
    result: choice.scope === 'FULL' || choice.dimension === dimension ? target.snapshot[dimension] || '无' : current.snapshot[dimension] || '无',
    action: choice.scope === 'FULL' || choice.dimension === dimension ? '恢复历史版本' : '保留当前版本'
  })) : [];
  return `<section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>版本记录与回滚</h3><p>查看当前与历史版本，按需发起回滚。</p></div><label class="ai-publish-choice">当前角色<select id="aiCurrentRole"><option value="产品负责人" ${aiStrategyState.currentRole === '产品负责人' ? 'selected' : ''}>产品负责人</option><option value="管理员" ${aiStrategyState.currentRole === '管理员' ? 'selected' : ''}>管理员</option><option value="普通运营" ${aiStrategyState.currentRole === '普通运营' ? 'selected' : ''}>普通运营</option></select></label></div>
    <div class="ai-strategy-filterbar"><select class="ai-strategy-inline-select" data-version-filter="status"><option value="全部" ${versionFilter.status === '全部' ? 'selected' : ''}>全部状态</option><option value="演示生效" ${versionFilter.status === '演示生效' ? 'selected' : ''}>当前生效</option><option value="历史有效" ${versionFilter.status === '历史有效' ? 'selected' : ''}>历史有效</option><option value="待发布" ${versionFilter.status === '待发布' ? 'selected' : ''}>待发布</option></select><input class="ai-strategy-inline-input" data-version-filter="keyword" value="${aiStrategyEsc(versionFilter.keyword)}" placeholder="搜索版本号 / 建议ID"><span class="ai-strategy-muted">共 ${visibleVersions.length} 个版本</span></div><div class="ai-strategy-table-wrap"><table class="ai-strategy-table ai-strategy-versions-table"><thead><tr><th>版本</th><th>来源</th><th>Agent建议ID</th><th>正式策略ID</th><th>接口结果</th><th>状态</th><th>生效时间</th><th>操作人</th><th>操作</th></tr></thead><tbody>${visibleVersions.map(version => `<tr><td><strong>${aiStrategyEsc(version.id)}</strong></td><td>${aiStrategyEsc(version.sourceType || version.source)}</td><td>${aiStrategyEsc(version.agentRecommendationId || '—')}</td><td>${aiStrategyEsc(version.formalPolicyId || '待生成')}</td><td>${aiStrategyEsc(version.apiStatus || '—')}</td><td>${aiStrategyEsc(version.status === '演示生效' ? '当前生效' : version.status)}</td><td>${aiStrategyEsc(version.publishAt || version.time)}</td><td>${aiStrategyEsc(version.operator || '系统演示')}</td><td><button type="button" class="ai-strategy-text-btn" data-ai-action="view-version" data-ai-value="${aiStrategyEsc(version.id)}">查看详情</button>${version.status === '历史有效' ? ` <button type="button" class="ai-strategy-text-btn" data-ai-action="select-rollback-version" data-ai-value="${aiStrategyEsc(version.id)}">选择回滚</button>` : ''}</td></tr>`).join('')}</tbody></table></div>${detailVersion ? (() => { const vf = aiStrategyState.versionDetailFilter || { dimension: '', value: '' }; const lowEfficiency = (detailVersion.snapshot || {})['低效规则'] || '无'; const allEntries = Object.entries(detailVersion.snapshot || {}).filter(([dimension]) => dimension !== '低效规则'); const entries = allEntries.filter(([dimension, value]) => (!vf.dimension || dimension === vf.dimension) && (!vf.value || `${dimension} ${value}`.toLowerCase().includes(vf.value.toLowerCase()))); const dims = allEntries.map(([dimension]) => dimension); return `<aside class="ai-strategy-version-drawer"><div class="ai-strategy-version-drawer-head"><div><strong>${aiStrategyEsc(detailVersion.id)} 版本详情</strong><small>数据来源：${aiStrategyEsc(detailVersion.sourceType || detailVersion.source)} · 发布时间：${aiStrategyEsc(detailVersion.publishAt || detailVersion.time)}</small></div><button type="button" class="ai-strategy-help-close" data-ai-action="close-version-detail" aria-label="关闭详情">×</button></div><div class="ai-strategy-version-meta"><span>正式策略：${aiStrategyEsc(detailVersion.formalPolicyId || '待生成')}</span><span>操作人：${aiStrategyEsc(detailVersion.operator || '系统演示')}</span><span>Agent建议规则：${allEntries.length} 条（覆盖 ${dims.length} 个规则维度）</span><span>低效关联：业务系统维护（${aiStrategyEsc(lowEfficiency)}）</span></div><div class="ai-strategy-filterbar"><select class="ai-strategy-inline-select" data-version-detail-filter="dimension"><option value="">全部规则维度</option>${dims.map(d => `<option value="${aiStrategyEsc(d)}" ${vf.dimension === d ? 'selected' : ''}>${aiStrategyEsc(d)}</option>`).join('')}</select><input class="ai-strategy-inline-input" data-version-detail-filter="value" value="${aiStrategyEsc(vf.value)}" placeholder="搜索匹配值或规则内容"></div><div class="ai-strategy-table-wrap"><table class="ai-strategy-table"><thead><tr><th>规则维度</th><th>版本规则内容</th></tr></thead><tbody>${entries.map(([dimension, value]) => `<tr><td><strong>${aiStrategyEsc(dimension)}</strong></td><td>${aiStrategyEsc(value)}</td></tr>`).join('') || '<tr><td colspan="2" class="ai-strategy-empty">暂无匹配规则</td></tr>'}</tbody></table></div></aside>`; })() : ''}
    <div class="ai-strategy-version-hint">
      <p class="ai-strategy-muted">Agent保留建议详情；业务系统只记录建议ID、正式策略ID、审核发布结果和版本关系，避免重复保存整份计算数据。当前接口结果为评审模拟，真实 DCC 接口待技术联调。</p>
      <p class="ai-strategy-muted">当前操作人：${aiStrategyEsc(aiStrategyState.currentRole)}。仅产品负责人或管理员可发布、回滚；回滚只影响发布后的新线索，已分派任务不重新分派。</p>
    </div></section>
    <section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>创建回滚版本</h3><p>先选目标版本和范围，预览“恢复哪些规则、保留哪些规则”，再填写原因生成待发布版本。</p></div><div class="ai-strategy-section-head-actions">${aiStrategyPlanDocButton()}${aiStrategyHelpButton('versions')}</div></div>
      <div class="ai-strategy-config-form ai-rollback-form"><label>回滚目标版本<select id="aiRollbackTarget"><option value="">请选择历史有效版本</option>${historical.map(item => `<option value="${aiStrategyEsc(item.id)}" ${choice.targetId === item.id ? 'selected' : ''}>${aiStrategyEsc(item.id)}</option>`).join('')}</select></label>
      <label>回滚范围<select id="aiRollbackScope"><option value="FULL" ${choice.scope === 'FULL' ? 'selected' : ''}>整套策略（含低效关联）</option><option value="DIMENSION" ${choice.scope === 'DIMENSION' ? 'selected' : ''}>单个规则维度</option></select></label>
      <label>单个规则维度<select id="aiRollbackDimension" ${choice.scope === 'FULL' ? 'disabled' : ''}>${choice.scope === 'FULL' ? '<option value="">整套回滚无需指定维度</option>' : `<option value="">请选择维度</option>${rollbackDimensions.map(name => `<option value="${name}" ${choice.dimension === name ? 'selected' : ''}>${name}</option>`).join('')}`}</select></label>
      <label>回滚原因<input type="text" id="aiRollbackReason" maxlength="100" placeholder="请说明为什么回滚（如：业务指标波动紧急恢复）" value="${aiStrategyEsc(choice.reason)}"></label></div>
      <div class="ai-rollback-quick-tags"><span class="ai-rollback-quick-label">常用原因：</span><button type="button" class="ai-rollback-quick-tag" data-ai-action="set-rollback-reason" data-ai-value="业务指标波动，紧急恢复稳定版本">业务指标波动恢复</button><button type="button" class="ai-rollback-quick-tag" data-ai-action="set-rollback-reason" data-ai-value="规则配置误操作，恢复上个有效版本">规则误操作恢复</button><button type="button" class="ai-rollback-quick-tag" data-ai-action="set-rollback-reason" data-ai-value="策略效果未达预期，回退至基线规则">策略效果不及预期</button></div>
      <div class="ai-strategy-actions"><button type="button" class="ai-strategy-btn secondary" data-ai-action="preview-rollback" ${historical.length ? '' : 'disabled'}>预览回滚差异</button></div>
      ${preview.length ? `<div class="ai-strategy-table-wrap"><table class="ai-strategy-table"><thead><tr><th>规则层/维度</th><th>当前生效 ${aiStrategyEsc(current.id)}</th><th>历史目标 ${aiStrategyEsc(target.id)}</th><th>新版本将使用</th><th>处理方式</th></tr></thead><tbody>${preview.map(row => `<tr><td><strong>${aiStrategyEsc(row.dimension)}</strong></td><td>${aiStrategyEsc(row.current)}</td><td>${aiStrategyEsc(row.target)}</td><td>${aiStrategyEsc(row.result)}</td><td>${row.action}</td></tr>`).join('')}</tbody></table></div><div class="ai-strategy-actions"><button type="button" class="ai-strategy-btn primary" data-ai-action="create-rollback">生成待发布回滚版本</button></div>` : ''}
      ${pending ? `<div class="ai-strategy-feedback is-success"><strong>${aiStrategyEsc(pending.id)}</strong> 已生成，状态：待发布。来源：${aiStrategyEsc(pending.source)}。确认发布后只影响之后的新线索；原有任务不重新分派。</div><div class="ai-strategy-actions"><button type="button" class="ai-strategy-btn primary" data-ai-action="publish-rollback">确认发布回滚版本</button></div>` : ''}
    </section>
    <section class="ai-strategy-card"><h3>操作留痕</h3><div class="ai-strategy-audit">${aiStrategyState.audit.length ? aiStrategyState.audit.map(log => `<div><span>${aiStrategyEsc(log.time)}</span><b>${aiStrategyEsc(log.operator || '系统演示')}：${aiStrategyEsc(log.action)}</b></div>`).join('') : '<p class="ai-strategy-empty">尚无演示操作。</p>'}</div></section>`;
}

function aiStrategyPositiveInteger(value) {
  return /^[1-9]\d*$/.test(String(value).trim());
}

function aiStrategyValidateParameterInput(input) {
  const id = input.id;
  const raw = input.value.trim();
  let message = '';
  if (/^aiTarget\d+$/.test(id)) {
    if (!aiStrategyPositiveInteger(raw) || Number(raw) > 100) message = '请输入 1–100 的整数';
  } else if (/^aiGrade[HAB]$/.test(id)) {
    if (!aiStrategyPositiveInteger(raw) || Number(raw) > 100) message = '请输入 1–100 的整数';
 } else if (/^aiWeight\d+$/.test(id)) {
    if (!/^\d+$/.test(raw) || Number(raw) > 100) message = '请输入 0–100 的整数；0 表示不参与评分';
  } else if (id === 'aiSampleMin') {
    if (!aiStrategyPositiveInteger(raw)) message = '请输入大于 0 的整数';
  } else return true;
  const error = document.getElementById(`${id}Error`);
  if (error) error.textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

function aiStrategyAddLowEfficiency(form) {
  const fields = Object.fromEntries(new FormData(form).entries());
  const errors = {};
  if (!fields.dimension) errors.dimension = '请选择对象维度';
  const linkedRule = aiStrategyEnabledRules(fields.dimension).find(rule => rule.id === fields.strategyId);
  if (!linkedRule) errors.strategyId = '请选择该维度下已启用的分配策略';
  if (!String(fields.note || '').trim()) errors.note = '请输入维护说明';
  form.querySelectorAll('[data-error]').forEach(el => { el.textContent = errors[el.dataset.error] || ''; });
  if (Object.keys(errors).length) { aiStrategyNotice('请先修正表单中的字段错误。'); return; }
  const value = linkedRule.keyValue || linkedRule.condition || '—';
  if (aiStrategyState.lowEfficiency.some(item => item.dimension === fields.dimension && item.strategyId === linkedRule.id)) {
    form.querySelector('[data-error="strategyId"]').textContent = '该策略已关联低效规则';
    aiStrategyNotice('请勿重复关联同一条分配策略。');
    return;
  }
  aiStrategyState.lowEfficiency.push({ dimension: fields.dimension, strategyId: linkedRule.id, strategyName: linkedRule.name, strategyVersion: linkedRule.updatedAt || '当前版本', condition: linkedRule.condition, value, note: fields.note.trim() });
  aiStrategyLog(`新增低效对象演示配置：${fields.dimension} / ${linkedRule.name}（${linkedRule.id}）`);
  renderAiStrategyWorkbench();
  aiStrategyNotice('已加入低效清单；命中后沿用关联策略的分派动作，不单独设置比例。', true);
}

function aiStrategySaveWeights() {
  const entries = aiStrategyMetrics.map((_, i) => document.getElementById(`aiWeight${i}`));
  const targets = aiStrategyMetrics.map((_, i) => document.getElementById(`aiTarget${i}`));
  const sampleInput = document.getElementById('aiSampleMin');
  const valid = [...entries, ...targets, sampleInput].map(aiStrategyValidateParameterInput).every(Boolean);
  if (!valid) { aiStrategyNotice('请修正评分参数。'); return; }
  const values = entries.map(input => Number(input.value.trim()));
  const targetValues = targets.map(input => Number(input.value.trim()));
  if (values.reduce((a, b) => a + b, 0) !== 100) { aiStrategyNotice('七项权重之和必须等于 100%。'); return; }
  aiStrategyState.weights = values;
  aiStrategyState.targets = targetValues;
  aiStrategyState.sampleMin = Number(sampleInput.value.trim());
  aiStrategyState.scoreCap = document.getElementById('aiScoreCap').value === 'cap';
  aiStrategyLog('保存评分参数示例');
  renderAiStrategyWorkbench();
  aiStrategyNotice('评分参数已在评审副本中保存。', true);
}

function aiStrategySaveGrades() {
  const h = document.getElementById('aiGradeH');
  const a = document.getElementById('aiGradeA');
  const b = document.getElementById('aiGradeB');
  const inputs = [h, a, b].filter(Boolean);
  if (!inputs.map(aiStrategyValidateParameterInput).every(Boolean)) { aiStrategyNotice('请修正 H/A/B 分值下限。'); return; }
  const thresholds = { H: Number(h.value), A: Number(a.value), B: Number(b.value) };
  if (!(thresholds.H > thresholds.A && thresholds.A > thresholds.B && thresholds.B > 0)) { aiStrategyNotice('分值下限必须满足 H ＞ A ＞ B ＞ 0。'); return; }
  aiStrategyState.gradeConfig = { thresholds, directions: Object.fromEntries(['H', 'A', 'B', 'C'].map(grade => [grade, document.getElementById(`aiGradeDirection${grade}`).value])) };
  aiStrategyLog('保存 H/A/B/C 分级参考配置');
  renderAiStrategyWorkbench();
  aiStrategyNotice('H/A/B/C 分级参考配置已保存，仅供 Agent 生成建议时参考。', true);
}

function aiStrategyGenerateDraft() {
  if (!aiStrategyState.weights || !aiStrategyState.targets || aiStrategyState.targets.some(value => !(Number(value) > 0))) {
    aiStrategyState.weights = [15, 15, 15, 15, 10, 15, 15];
    aiStrategyState.targets = [...aiStrategyDemoTargets];
  }
  if (!aiStrategyState.gradeConfig) {
    aiStrategyState.gradeConfig = { thresholds: { H: 70, A: 60, B: 50 }, directions: { H: '优先建议人工', A: '优先建议人工', B: '按容量动态建议', C: '优先建议AI' } };
  }
  const id = `DEMO-${String(Date.now()).slice(-6)}`;
  aiStrategyState.draft = { id, businessDate: aiStrategyBusinessDate(), name: '线索分派策略建议 · 演示草案', status: '演示草案', createdAt: new Date().toLocaleString('zh-CN', { hour12: false }), gradeConfig: { thresholds: { ...aiStrategyState.gradeConfig.thresholds }, directions: { ...aiStrategyState.gradeConfig.directions } }, rows: aiStrategyCalculatedDemoRows().map(row => ({ ...row, agentRecommended: row.agentRecommended || row.recommended, habc: row.habc ? { ...row.habc } : null, aiMode: row.aiMode || '', aiPolicyId: row.aiPolicyId || '', aiType: row.aiType || '' })) };
  const historyDate = new Date(); historyDate.setDate(historyDate.getDate() - 1);
  aiStrategyState.demoHistoricalDraft = { ...aiStrategyState.draft, id: 'DEMO-HISTORY-20261013', businessDate: aiStrategyBusinessDate(historyDate), createdAt: '2026/10/13 08:30:00', status: '演示草案', rows: aiStrategyState.draft.rows.map(row => ({ ...row, reviewStatus: '待审核', review: null })) };
  aiStrategyLog(`生成 ${id} 演示草案`);
  renderAiStrategyWorkbench();
  aiStrategyNotice('示例建议已生成，可查看各对象明细并提交审核。', true);
}

function aiStrategyTransition(status, action) {
  if (!aiStrategyState.draft) return;
  aiStrategyState.draft.status = status;
  aiStrategyLog(action);
  renderAiStrategyWorkbench();
  aiStrategyNotice(`${action}。本操作只影响副本中的演示状态。`, true);
}

function aiStrategyUpdateRecommendedRatio(select) {
  const index = Number(select.dataset.aiRecIndex);
  const row = aiStrategyState.draft?.rows?.[index];
  if (!row) return;
  const newRatio = select.value;
  row.recommended = newRatio;
  const aiPercent = aiStrategyGetAiPercent(newRatio);
  if (aiPercent <= 0) {
    row.aiMode = '';
    row.aiPolicyId = '';
    row.aiType = '';
    aiStrategyLog(`调整${row.dimension}=${row.value}建议比例为 ${newRatio}；100%全人工跟进，自动联动锁定AI方式`);
    renderAiStrategyWorkbench();
    aiStrategyNotice(`建议比例已调整为“${newRatio}”（100%全人工）：AI内部方式已自动锁定无需配置。`, true);
  } else {
    if (row.aiMode === '不按比例' && !row.aiType) {
      row.aiMode = '';
    } else if (row.aiMode === '按比例' && !row.aiPolicyId) {
      row.aiMode = '';
    }
    aiStrategyLog(`调整${row.dimension}=${row.value}建议比例为 ${newRatio}；AI占比 ${aiPercent}%，已联动解锁AI内部方式`);
    renderAiStrategyWorkbench();
    aiStrategyNotice(`建议比例已更新为“${newRatio}”（AI ${aiPercent}%）：已联动解锁“AI内部方式/方案”，请运营人员选择。`, true);
  }
}

function aiStrategyUpdateAiSelection(select) {
  const index = Number(select.dataset.aiAiIndex);
  const field = select.dataset.aiAiField;
  const row = aiStrategyState.draft?.rows?.[index];
  if (!row || !field) return;
  row[field === 'mode' ? 'aiMode' : field === 'policy' ? 'aiPolicyId' : 'aiType'] = select.value;
  if (field === 'mode') {
    if (select.value !== '按比例') {
      row.aiPolicyId = '';
    }
    if (select.value !== '不按比例') {
      row.aiType = '';
    }
  }
  aiStrategyLog(`调整${row.dimension}=${row.value}的AI内部方式：${field === 'mode' ? (select.value || '未选择') : field === 'policy' ? aiStrategyPolicyLabel(select.value) : (select.value || '未选择')}`);
  renderAiStrategyWorkbench();
  aiStrategyNotice('AI内部方式已由运营操作人员手动调整更新。', true);
}

function aiStrategyValidateDraftSelections(targetRows = null) {
  const rows = targetRows || aiStrategyState.draft?.rows || [];
  const invalid = rows.find(row => {
    const aiPercent = aiStrategyGetAiPercent(row.recommended);
    if (aiPercent <= 0) return false;
    // 只要有 AI 分派（含 100% 全AI 与 混合比例）：都必须由运营人员选择内部方式
    if (!row.aiMode || !['按比例', '不按比例'].includes(row.aiMode)) return true;
    // 选择“按比例”时必须选择内部方案
    if (row.aiMode === '按比例') return !row.aiPolicyId;
    // 选择“不按比例”时必须选择AI外呼类型
    if (row.aiMode === '不按比例') return !row.aiType;
    return false;
  });
  if (invalid) {
    const aiPercent = aiStrategyGetAiPercent(invalid.recommended);
    if (!invalid.aiMode || !['按比例', '不按比例'].includes(invalid.aiMode)) {
      aiStrategyNotice(`【${invalid.dimension}=${invalid.value}】建议比例存在分配给AI (${aiPercent}%)，已解锁，请运营人员先选择AI内部方式（按比例/不按比例）。`);
    } else if (invalid.aiMode === '按比例') {
      aiStrategyNotice(`【${invalid.dimension}=${invalid.value}】已选择按比例，请运营人员选择具体AI内部方案。`);
    } else if (invalid.aiMode === '不按比例') {
      aiStrategyNotice(`【${invalid.dimension}=${invalid.value}】已选择不按比例，请运营人员选择AI外呼类型。`);
    }
    return false;
  }
  return true;
}

function aiStrategyPreviewRollback() {
  const targetId = document.getElementById('aiRollbackTarget').value;
  const scope = document.getElementById('aiRollbackScope').value;
  const dimension = document.getElementById('aiRollbackDimension').value;
  const reason = document.getElementById('aiRollbackReason').value.trim();
  if (!aiStrategyState.versions.some(item => item.id === targetId && item.status === '历史有效')) { aiStrategyNotice('请选择历史有效版本，不能选择当前、停用或异常版本。'); return; }
  if (scope === 'DIMENSION' && !dimension) { aiStrategyNotice('单维度回滚时，请选择要恢复的规则维度。'); return; }
  if (!reason) { aiStrategyNotice('请先填写回滚原因。'); return; }
  aiStrategyState.rollbackSelection = { targetId, scope, dimension: scope === 'DIMENSION' ? dimension : '', reason };
  renderAiStrategyWorkbench();
  aiStrategyNotice('回滚差异已生成：请核对“恢复历史版本”和“保留当前版本”的范围。', true);
}

function aiStrategyCreateRollback() {
  if (!['产品负责人', '管理员'].includes(aiStrategyState.currentRole)) { aiStrategyNotice('当前角色无回滚权限。'); return; }
  const choice = aiStrategyState.rollbackSelection;
  const current = aiStrategyCurrentVersion();
  const target = aiStrategyState.versions.find(item => item.id === choice.targetId && item.status === '历史有效');
  if (!current || !target || !choice.reason || (choice.scope === 'DIMENSION' && !choice.dimension)) { aiStrategyNotice('回滚预览已失效，请重新选择并预览。'); return; }
  if (aiStrategyState.pendingRollbackId) { aiStrategyNotice('已有待发布的回滚版本，请先完成该版本。'); return; }
  const snapshot = { ...current.snapshot };
  const restored = choice.scope === 'FULL' ? aiStrategySnapshotDimensions : [choice.dimension];
  restored.forEach(dimension => { snapshot[dimension] = target.snapshot[dimension] || '无'; });
  const id = `V-DEMO-RB-${aiStrategyState.versions.length + 1}`;
  aiStrategyState.versions.unshift({ id, source: `${target.id} · ${choice.scope === 'FULL' ? '整套' : choice.dimension}回滚`, status: '待发布', time: new Date().toLocaleString('zh-CN', { hour12: false }), snapshot, baseVersionId: current.id, reason: choice.reason, operator: aiStrategyState.currentRole });
  aiStrategyState.pendingRollbackId = id;
  aiStrategyState.rollbackSelection = { targetId: '', scope: 'FULL', dimension: '', reason: '' };
  aiStrategyLog(`创建待发布回滚版本 ${id}；原因：${choice.reason}`);
  renderAiStrategyWorkbench();
  aiStrategyNotice(`${id} 已生成，但尚未生效。`, true);
}

function aiStrategyPublishRollback() {
  if (!['产品负责人', '管理员'].includes(aiStrategyState.currentRole)) { aiStrategyNotice('当前角色无发布权限。'); return; }
  const pending = aiStrategyState.versions.find(item => item.id === aiStrategyState.pendingRollbackId && item.status === '待发布');
  const current = aiStrategyCurrentVersion();
  if (!pending || !current || current.id !== pending.baseVersionId) { aiStrategyNotice('当前生效版本已变化，请重新创建回滚版本。'); return; }
  current.status = '历史有效';
  pending.status = '演示生效';
  pending.publishAt = new Date().toLocaleString('zh-CN', { hour12: false });
  pending.operator = aiStrategyState.currentRole;
  pending.formalPolicyId = `DCC-DEMO-${pending.id}`;
  pending.apiStatus = '模拟成功（待联调）';
  pending.sourceType = '历史版本回滚';
  aiStrategyState.pendingRollbackId = '';
  aiStrategyLog(`立即生效回滚版本 ${pending.id}；操作人：${aiStrategyState.currentRole}；仅影响之后的新线索`);
  renderAiStrategyWorkbench();
  aiStrategyNotice(`${pending.id} 已生效并生成正式策略 ${pending.formalPolicyId}（接口为评审模拟）；历史版本未改写，已分派任务不重新分派。`, true);
}

function aiStrategyReviewRow(index, result) {
  const row = aiStrategyState.draft?.rows?.[index];
  if (!row || aiStrategyDraftDate(aiStrategyState.draft) !== aiStrategyBusinessDate() || (row.reviewStatus || '待审核') !== '待审核') { if (aiStrategyDraftDate(aiStrategyState.draft) !== aiStrategyBusinessDate()) aiStrategyNotice('该版本已过期，不能再进行审核操作。'); return; }
  if (result === '通过') {
    if (!aiStrategyValidateDraftSelections([row])) return;
  }
  const reason = result === '驳回' ? window.prompt('请输入驳回原因（必填）：', '') : '';
  if (result === '驳回' && !String(reason || '').trim()) { aiStrategyNotice('驳回必须填写原因，未完成驳回。'); return; }
  row.reviewStatus = result === '通过' ? '已通过' : '已驳回';
  if (result === '通过' && (aiStrategyState.draft.rows || []).length && aiStrategyState.draft.rows.every(item => item.reviewStatus === '已通过')) aiStrategyState.draft.status = '演示已批准';
  row.review = { reviewer: aiStrategyState.currentRole, reviewedAt: new Date().toLocaleString('zh-CN', { hour12: false }), comment: String(reason || '').trim() };
  aiStrategyLog(`${result}建议：${row.dimension} / ${row.value}`);
  renderAiStrategyWorkbench();
}
function aiStrategyBulkReview(allVisible) {
  const draft = aiStrategyState.draft; if (!draft) return;
  if (aiStrategyDraftDate(draft) !== aiStrategyBusinessDate()) { aiStrategyNotice('该版本已过期，不能再进行审核操作。'); return; }
  const visible = (draft.rows || []).map((row, index) => ({row, index})).filter(({row}) => (row.reviewStatus || '待审核') === '待审核' && (allVisible || (draft.selected || []).includes(draft.rows.indexOf(row))));
  if (!visible.length) { aiStrategyNotice('没有可审核的待审核建议。'); return; }
  if (!aiStrategyValidateDraftSelections(visible.map(item => item.row))) return;
  if (!window.confirm(`确认审核通过 ${visible.length} 条待审核建议？已通过、已驳回和已发布记录不会被修改。`)) return;
  visible.forEach(({row}) => { row.reviewStatus = '已通过'; row.review = { reviewer: aiStrategyState.currentRole, reviewedAt: new Date().toLocaleString('zh-CN', { hour12: false }), comment: '批量审核通过' }; });
  draft.selected = [];
  if ((draft.rows || []).length && draft.rows.every(row => row.reviewStatus === '已通过')) draft.status = '演示已批准';
  aiStrategyLog(`批量审核通过 ${visible.length} 条建议`);
  renderAiStrategyWorkbench();
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-ai-action]');
  if (!button || !button.closest('.ai-strategy-workbench')) return;
  const action = button.dataset.aiAction;
  const value = button.dataset.aiValue;
  if (action === 'open-plan-doc') { openLeadAllocationPlanDocModal(); return; }
  if (action === 'help') { aiStrategyState.help = value; renderAiStrategyWorkbench(); return; }
  if (action === 'close-help') {
    if (event.target.closest('[data-ai-help-modal]') && !button.classList.contains('ai-strategy-help-close')) return;
    aiStrategyState.help = ''; renderAiStrategyWorkbench(); return;
  }
  if (action === 'open-audit-rules') { aiStrategyState.auditRuleModalOpen = true; renderAiStrategyWorkbench(); return; }
  if (action === 'close-audit-rules') {
    if (event.target.closest('.ai-strategy-audit-rules-modal') && !button.classList.contains('ai-strategy-help-close') && !button.classList.contains('ai-strategy-btn')) return;
    aiStrategyCloseAuditRules(event);
    return;
  }
  if (action === 'save-audit-rules') {
    const reviewerEmailsInput = document.getElementById('aiStrategyReviewerEmails');
    const noticeEmailsInput = document.getElementById('aiStrategyNoticeEmails');
    const notifyFrequencySelect = document.getElementById('aiStrategyNotifyFrequency');
    const timeoutReminderSelect = document.getElementById('aiStrategyTimeoutReminder');
    const notifySwitch = document.getElementById('aiStrategyNotifyEnabled');

    if (notifySwitch) aiStrategyState.auditRuleConfig.notifyEnabled = notifySwitch.checked;
    if (reviewerEmailsInput) aiStrategyState.auditRuleConfig.reviewerEmails = reviewerEmailsInput.value.trim();
    if (noticeEmailsInput) aiStrategyState.auditRuleConfig.noticeEmails = noticeEmailsInput.value.trim();
    if (notifyFrequencySelect) aiStrategyState.auditRuleConfig.notifyFrequency = notifyFrequencySelect.value;
    if (timeoutReminderSelect) aiStrategyState.auditRuleConfig.timeoutReminder = timeoutReminderSelect.value;

    aiStrategyState.auditRuleModalOpen = false;
    aiStrategyLog('更新策略审核规则与通知设置');
    renderAiStrategyWorkbench();
    aiStrategyNotice('审核规则与通知设置已保存生效。', true);
    return;
  }
  if (!event.target.closest('.account-picker')) {
    document.querySelectorAll('.ai-strategy-audit-rules-modal .account-picker-panel').forEach(p => p.classList.remove('show'));
  }
  if (action === 'tab') { aiStrategyState.tab = value; renderAiStrategyWorkbench(); return; }
  if (action === 'load-demo-data') { aiStrategyLoadDemoData(); return; }
  if (action === 'save-weights') { aiStrategySaveWeights(); return; }
  if (action === 'save-grades') { aiStrategySaveGrades(); return; }
  if (action === 'remove-low-eff') {
    const removed = aiStrategyState.lowEfficiency.splice(Number(value), 1)[0];
    if (removed) aiStrategyLog(`移除低效对象演示配置：${removed.dimension} / ${removed.strategyName || removed.value}`);
    renderAiStrategyWorkbench(); aiStrategyNotice('演示配置已移除；旧规则未受影响。', true); return;
  }
  if (action === 'remove-direct') {
    const removed = aiStrategyState.directLeadList.splice(Number(value), 1)[0];
    if (removed) aiStrategyLog(`移除直派标识演示项：${removed.type} / ${removed.value}`);
    renderAiStrategyWorkbench(); aiStrategyNotice('直派标识演示项已移除；旧规则未受影响。', true); return;
  }
  if (action === 'reset-draft-filters') { aiStrategyState.draftFilters = { businessDate: aiStrategyDraftDate(aiStrategyState.draft), dimension: '', value: '', status: '全部', ratioFilter: '' }; renderAiStrategyWorkbench(); return; }
  if (action === 'draft-page-prev') { aiStrategyState.draftPage = Math.max(1, (aiStrategyState.draftPage || 1) - 1); renderAiStrategyWorkbench(); return; }
  if (action === 'draft-page-next') { aiStrategyState.draftPage = (aiStrategyState.draftPage || 1) + 1; renderAiStrategyWorkbench(); return; }
  if (action === 'edit-row') { const row = aiStrategyState.draft?.rows?.[Number(value)]; if (row && row.reviewStatus === '已驳回') { row.reviewHistory = row.reviewHistory || []; if (row.review) row.reviewHistory.push(row.review); row.reviewStatus = '待审核'; row.review = null; aiStrategyState.draft.status = '演示草案'; aiStrategyLog(`修改后重审：${row.dimension} / ${row.value}`); renderAiStrategyWorkbench(); aiStrategyNotice('该条建议已恢复为待审核，可修改后重新提交。'); } return; }
  if (action === 'approve-row') { aiStrategyReviewRow(Number(value), '通过'); return; }
  if (action === 'reject-row') { aiStrategyReviewRow(Number(value), '驳回'); return; }
  if (action === 'approve-selected') { aiStrategyBulkReview(false); return; }
  if (action === 'approve-all-visible') { aiStrategyBulkReview(true); return; }
  if (action === 'select-visible') { const visible = [...event.target.closest('.ai-strategy-workbench').querySelectorAll('[data-ai-row-select]')].filter(input => !input.disabled).map(input => Number(input.dataset.aiRowSelect)); aiStrategyState.draft.selected = event.target.checked ? visible : []; renderAiStrategyWorkbench(); return; }
  if (action === 'generate-draft') { aiStrategyGenerateDraft(); return; }
  if (action === 'submit-draft' && aiStrategyState.draft?.status === '演示草案') { aiStrategyTransition('待演示审核', '提交演示审核'); return; }
  if (action === 'edit-rejected' && aiStrategyState.draft?.status === '演示已驳回') { aiStrategyState.draft.status = '演示草案'; aiStrategyLog('进入驳回修改：' + aiStrategyState.draft.id); renderAiStrategyWorkbench(); aiStrategyNotice('已进入修改状态，修改建议后才能重新提交审核。'); return; }
  if (action === 'approve-draft' && aiStrategyState.draft?.status === '待演示审核') { if (!window.confirm('确认审核通过？通过后将进入发布前状态。')) return; const comment = window.prompt('请输入审核意见（可选）：', ''); aiStrategyState.draft.review = { result: '审核通过', reviewer: aiStrategyState.currentRole, reviewedAt: new Date().toLocaleString('zh-CN', { hour12: false }), comment: String(comment || '').trim() }; aiStrategyTransition('演示已批准', '演示审核通过'); return; }
  if (action === 'reject-draft' && aiStrategyState.draft?.status === '待演示审核') { if (!window.confirm('确认驳回该建议？')) return; const reason = window.prompt('请输入驳回原因（必填）：', ''); if (!String(reason || '').trim()) { aiStrategyNotice('驳回必须填写原因，未完成驳回。'); return; } aiStrategyState.draft.review = { result: '已驳回', reviewer: aiStrategyState.currentRole, reviewedAt: new Date().toLocaleString('zh-CN', { hour12: false }), comment: String(reason).trim() }; aiStrategyTransition('演示已驳回', '驳回演示草案'); return; }
  if (action === 'publish-draft' && aiStrategyState.draft?.status === '演示已批准') {
    if (!['产品负责人', '管理员'].includes(aiStrategyState.currentRole)) { aiStrategyNotice('当前角色无发布权限。'); return; }
    if (aiStrategyState.pendingRollbackId) { aiStrategyNotice('已有待发布回滚版本，请先处理，避免版本冲突。'); return; }
    if (!aiStrategyValidateDraftSelections()) return;
    aiStrategyState.versions.forEach(item => { if (item.status === '演示生效') item.status = '历史有效'; });
    const id = `V-DEMO-${aiStrategyState.versions.length + 1}`;
    const formalPolicyId = `DCC-DEMO-${id}`;
    aiStrategyState.versions.unshift({ id, source: aiStrategyState.draft.id, sourceType: 'Agent建议审核发布', agentRecommendationId: aiStrategyState.draft.id, formalPolicyId, apiStatus: '模拟成功（待联调）', status: '演示生效', time: new Date().toLocaleString('zh-CN', { hour12: false }), publishAt: new Date().toLocaleString('zh-CN', { hour12: false }), operator: aiStrategyState.currentRole, snapshot: aiStrategyNewSnapshot() });
    aiStrategyState.draft.status = '演示已发布';
    aiStrategyLog(`审核通过并生成正式策略 ${formalPolicyId}；关联Agent建议 ${aiStrategyState.draft.id}；操作人：${aiStrategyState.currentRole}`);
    renderAiStrategyWorkbench();
    aiStrategyNotice(`${id} 已生效，已模拟生成正式策略 ${formalPolicyId}；真实 DCC 接口待联调，已分派任务不重新分派。`, true);
    return;
  }
  if (action === 'view-version') { aiStrategyState.versionDetailId = value; renderAiStrategyWorkbench(); return; }
  if (action === 'close-version-detail') { aiStrategyState.versionDetailId = ''; return renderAiStrategyWorkbench(); }
  if (action === 'select-rollback-version') {
    aiStrategyState.rollbackSelection.targetId = value;
    aiStrategyState.versionDetailId = '';
    renderAiStrategyWorkbench();
    aiStrategyNotice(`已选择 ${value} 作为回滚目标，请继续预览差异。`, true);
    const targetEl = document.getElementById('aiRollbackTarget');
    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (action === 'set-rollback-reason') {
    const input = document.getElementById('aiRollbackReason');
    if (input) {
      input.value = value;
      aiStrategyState.rollbackSelection.reason = value;
      input.focus();
    }
    return;
  }
  if (action === 'preview-rollback') { aiStrategyPreviewRollback(); return; }
  if (action === 'create-rollback') { aiStrategyCreateRollback(); return; }
  if (action === 'publish-rollback') { aiStrategyPublishRollback(); return; }
});

document.addEventListener('change', event => {
  if (event.target.id === 'aiRollbackScope') {
    const scopeVal = event.target.value;
    aiStrategyState.rollbackSelection.scope = scopeVal;
    const dimSelect = document.getElementById('aiRollbackDimension');
    if (dimSelect) {
      const isFull = scopeVal === 'FULL';
      dimSelect.disabled = isFull;
      dimSelect.innerHTML = isFull
        ? '<option value="">整套回滚无需指定维度</option>'
        : `<option value="">请选择维度</option>${aiStrategyRouteOrder.map(name => `<option value="${name}">${name}</option>`).join('')}`;
      if (isFull) {
        aiStrategyState.rollbackSelection.dimension = '';
      }
    }
    return;
  }
  if (event.target.id === 'aiRollbackTarget') {
    aiStrategyState.rollbackSelection.targetId = event.target.value;
    return;
  }
  if (event.target.id === 'aiRollbackDimension') {
    aiStrategyState.rollbackSelection.dimension = event.target.value;
    return;
  }
  const filter = event.target.closest('[data-ai-filter]');
  if (filter && filter.closest('.ai-strategy-workbench')) {
    aiStrategyState.draftFilters = aiStrategyState.draftFilters || { dimension: '', value: '', status: '全部', ratioFilter: '' };
    if (filter.dataset.aiFilter === 'pageSize') { aiStrategyState.draftPageSize = Number(filter.value) || 10; aiStrategyState.draftPage = 1; } else { aiStrategyState.draftFilters[filter.dataset.aiFilter] = filter.value; aiStrategyState.draftPage = 1; }
    renderAiStrategyWorkbench();
    return;
  }
  if (event.target.id === 'aiCurrentRole') {
    aiStrategyState.currentRole = event.target.value;
    renderAiStrategyWorkbench();
    aiStrategyNotice(`当前角色已切换为“${aiStrategyState.currentRole}”。`, true);
    return;
  }
  if (event.target.id === 'aiLowEfficiencyDimension' || event.target.id === 'aiLowEfficiencyStrategy') {
    aiStrategyPopulateLowEfficiencyStrategies();
    return;
  }
  const detailFilter = event.target.closest('[data-version-detail-filter]');
  if (detailFilter) { aiStrategyState.versionDetailFilter[detailFilter.dataset.versionDetailFilter] = detailFilter.value; renderAiStrategyWorkbench(); return; }
  const versionFilter = event.target.closest('[data-version-filter]');
  if (versionFilter) { aiStrategyState.versionFilter[versionFilter.dataset.versionFilter] = versionFilter.value; renderAiStrategyWorkbench(); return; }
  const recSelect = event.target.closest('[data-ai-rec-index]');
  if (recSelect && recSelect.closest('.ai-strategy-workbench')) {
    aiStrategyUpdateRecommendedRatio(recSelect);
    return;
  }
  const select = event.target.closest('[data-ai-ai-index]');
  if (!select || !select.closest('.ai-strategy-workbench')) return;
  aiStrategyUpdateAiSelection(select);
});

document.addEventListener('input', event => {
  const input = event.target;
  if (!input.closest?.('.ai-strategy-workbench')) return;
  if (input.id === 'aiRollbackReason') {
    aiStrategyState.rollbackSelection.reason = input.value;
    return;
  }
  const detailFilter = input.closest('[data-version-detail-filter]');
  if (detailFilter) { aiStrategyState.versionDetailFilter[detailFilter.dataset.versionDetailFilter] = input.value; return; }
  const versionFilter = input.closest('[data-version-filter]');
  if (versionFilter) { aiStrategyState.versionFilter[versionFilter.dataset.versionFilter] = input.value; return; }
  const filter = input.closest('[data-ai-filter]');
  if (filter) {
    aiStrategyState.draftFilters = aiStrategyState.draftFilters || { dimension: '', value: '', status: '全部', ratioFilter: '' };
    aiStrategyState.draftFilters[filter.dataset.aiFilter] = input.value;
    return;
  }
  if (/^ai(?:Target|Weight)\d+$/.test(input.id) || /^aiGrade[HAB]$/.test(input.id) || input.id === 'aiSampleMin') {
    const raw = input.value.trim();
    const isWeight = /^aiWeight\d+$/.test(input.id);
    const invalidShape = raw !== '' && !/^\d+$/.test(raw);
    const invalidMinimum = raw !== '' && Number(raw) < (isWeight ? 0 : 1);
    if (invalidShape || invalidMinimum) {
      input.value = '';
    }
    aiStrategyValidateParameterInput(input);
  }
});

document.addEventListener('submit', event => {
  if (event.target.id !== 'aiLowEfficiencyForm') return;
  event.preventDefault();
  aiStrategyAddLowEfficiency(event.target);
});

document.addEventListener('submit', event => {
  if (event.target.id !== 'aiDirectLeadForm') return;
  event.preventDefault();
  const form = event.target;
  const fields = Object.fromEntries(new FormData(form).entries());
  const errors = {};
  if (!fields.type) errors.type = '请选择直派标识类型';
  if (!String(fields.value || '').trim()) errors.value = '请输入标识值';
  if (!String(fields.note || '').trim()) errors.note = '请输入生效说明';
  form.querySelectorAll('[data-error]').forEach(el => { el.textContent = errors[el.dataset.error] || ''; });
  if (Object.keys(errors).length) { aiStrategyNotice('请先补充直派标识字段。'); return; }
  const value = fields.value.trim();
  if (aiStrategyState.directLeadList.some(item => item.type === fields.type && item.value === value)) { form.querySelector('[data-error="value"]').textContent = '该直派标识已存在'; return; }
  aiStrategyState.directLeadList.push({ type: fields.type, value, note: fields.note.trim() });
  aiStrategyLog(`新增直派标识演示项：${fields.type} / ${value}`);
  renderAiStrategyWorkbench(); aiStrategyNotice('直派标识演示项已加入；未影响现有规则。', true);
});

function aiStrategySaveScope() {
  const values = aiStrategyMetrics.map((_, index) => document.getElementById(`aiTarget${index}`)?.value.trim() || '');
  let valid = true;
  values.forEach((raw, index) => {
    const error = document.getElementById(`aiTargetError${index}`);
    if (raw && (!/^\d+$/.test(raw) || Number(raw) > 100)) { error.textContent = '请输入 0–100 的整数'; valid = false; } else error.textContent = '';
  });
  if (!valid) { aiStrategyNotice('请修正目标值输入。'); return; }
  aiStrategyState.targets = values;
  aiStrategyState.attribution = document.getElementById('aiAttribution').value;
  aiStrategyLog(`保存目标值和跨窗口归属：${aiStrategyState.attribution}`);
  aiStrategyNotice('演示口径已保存；未确认的目标值不会进入正式发布。', true);
}

function aiStrategySaveCapacity() {
  const ids = ['planMax', 'minNew', 'followUpDue', 'assignedNew', 'otherOpen'];
  const values = Object.fromEntries(ids.map(key => [key, document.getElementById(`aiCapacity${key.charAt(0).toUpperCase()}${key.slice(1)}`)?.value.trim() || '']));
  const invalid = ids.some(key => !aiStrategyPositiveInteger(values[key]));
  if (invalid) { aiStrategyNotice('容量字段必须填写大于 0 的整数。'); return; }
  aiStrategyState.capacity = Object.fromEntries(ids.map(key => [key, Number(values[key])]));
  const remaining = Math.max(0, aiStrategyState.capacity.planMax - aiStrategyState.capacity.followUpDue - aiStrategyState.capacity.assignedNew);
  aiStrategyLog(`重算演示容量，实时剩余容量：${remaining}`);
  renderAiStrategyWorkbench();
  aiStrategyNotice(`容量已重算：今日剩余人工容量 ${remaining} 条。`, true);
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeLeadAllocationPlanDocModal();
  }
});

