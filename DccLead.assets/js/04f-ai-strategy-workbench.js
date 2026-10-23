// AI 策略工作台评审副本：审核通过即模拟向 DCC 发布单条规则；不调用真实 DCC 接口。
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
  { dimension: '渠道', ruleId: 'CH-002', priority: 6, sample: 120, habc: { H: 18, A: 32, B: 40, C: 30 }, rates: [82, 65, 78, 72, 70, 76, 74], recommended: '人工60% / AI40%', aiMode: '', aiPolicyId: '', aiType: '', type: '动态调配' },
  { dimension: 'SC大项目名', ruleId: 'PROJ-001', priority: 4, sample: 86, habc: { H: 22, A: 28, B: 24, C: 12 }, rates: [88, 79, 84, 81, 80, 83, 82], recommended: '人工80% / AI20%', aiMode: '', aiPolicyId: '', aiType: '', type: '高效对象保留人工' },
  { dimension: '专营店', ruleId: 'DLR-001', priority: 5, sample: 95, habc: { H: 30, A: 35, B: 20, C: 10 }, rates: [92, 85, 88, 86, 84, 89, 85], recommended: '人工100% / AI0%', aiMode: '', aiPolicyId: '', aiType: '', type: '标杆全人工' },
  { dimension: '车系', ruleId: 'CAR-001', priority: 2, sample: 180, habc: { H: 45, A: 55, B: 50, C: 30 }, rates: [89, 82, 85, 80, 78, 84, 81], recommended: '人工0% / AI100%', aiMode: '不按比例', aiPolicyId: '', aiType: '科大讯飞-冷线索', type: '优先培育' },
  { dimension: '专营店', ruleId: 'DLR-002', priority: 3, sample: 68, habc: { H: 14, A: 22, B: 20, C: 12 }, rates: [78, 68, 72, 68, 62, 68, 58], recommended: '人工40% / AI60%', aiMode: '', aiPolicyId: '', aiType: '', type: '动态培育' }
];
const aiStrategyDemoTargets = [80, 70, 75, 70, 65, 70, 60];
const aiStrategyGradeOptions = ['优先建议人工', '按容量动态建议', '优先建议AI'];
const aiStrategyHelpContent = {
  metrics: { title: '七项评分参数', purpose: '用于把数据组提供的七项指标率值换算为对象综合分，供 Agent 比较对象效果并生成比例建议。', steps: ['为每项指标填写目标值；目标值必须是 1–100 的正整数。', '填写权重；权重可以为 0，表示不使用该指标，七项权重合计必须为 100%。', '填写最低样本量，作为评分服务的参考参数；建议列表不依据该门槛自行拦截或标记对象。', '点击“保存评分参数”，保存后再生成策略建议。'], note: '这里配置的是评分参考口径，不会直接改变单条线索的人工/AI分派。' },
  grades: { title: 'H/A/B/C 分级参考配置', purpose: '把对象综合分划成 H、A、B、C 四档，并告诉 Agent 各档在生成对象比例建议时优先参考人工还是 AI。', steps: ['填写 H、A、B 三档下限，必须满足 H>A>B>0。', '系统自动生成不重叠区间：H≥H下限、A为A至H（不含）、B为B至A（不含）、C为0至B（不含）。', '选择每档建议方向；“按容量动态建议”表示先保留H和A，再结合T+1人工容量判断B。', '点击“保存分级参考配置”。'], note: '仅供 Agent 生成对象比例建议参考，不直接分派单条线索。' },
  'low-efficiency': { title: '低效对象配置', purpose: '将六类普通分配规则中已启用的策略关联为低效对象。命中后直接执行关联策略当前有效的分派动作，不进入 Agent 评分、排名和动态调配。', steps: ['点击“导入数据”“导出数据”执行批量维护。导入按“上传文件→数据预览→导入完成”操作，可下载模板和失败明细；只新增校验通过的记录，不覆盖重复记录，导出包含当前名单全部数据。','选择对象维度，再选择该维度下已启用的分配策略；匹配值、规则 ID、当前动作和状态会自动显示。', '填写维护说明后加入低效清单；同一策略不能重复关联。', '在清单中查看关联状态、继承的分派动作和 Agent 处理方式；可移除关联。'], note: '这里只维护关联，不修改普通规则，也不另行配置人工/AI比例。关联策略停用或删除后关联失效，线索回到普通规则匹配。' },
  'data-scope': { title: '直派名单', purpose: '维护需要直接执行的线索标识。当前仅支持“大项目名”，用于识别直派路径。命中后不参与 Agent 评分、排名和动态调配。', steps: ['点击“导入数据”“导出数据”执行批量维护。导入按“上传文件→数据预览→导入完成”操作，可下载模板和失败明细；只新增校验通过的记录，不覆盖重复记录，导出包含当前名单全部数据。','选择直派名单类型（当前仅“大项目名”）。', '填写标识值和生效说明，加入直派名单。', '在名单中核对记录；可移除不再适用的标识。'], note: '直派名单只维护标识及说明，不编辑分配策略；命中后按直派路径执行，不参与 Agent 评分、排名和动态调配。' },
  capacity: { title: '容量查看', purpose: '查看 Agent 生成建议时使用的上一完整业务日人工容量快照。', steps: ['查看计划上限、已占用任务和可承接量。', '确认数据日期和结算状态。', '容量不足时，Agent按H/A/B/C优先级生成对象比例建议；实际执行仍按已发布规则。'], note: '本版本不做实时重算，容量采用T+1数据。' },
  drafts: { title: '策略建议与审核', purpose: '按建议批次查看 Agent 评分、现行规则模板与建议比例，并逐条审核发布。支持按批次、规则维度、匹配值、建议比例和状态筛选。', steps: ['点击“导出数据”，导出当前建议批次及筛选条件下的全部列表记录，不限当前页；包含 Agent 建议、执行方案、接收时间及审核记录。', '“接收时间”为系统收到并保存该条 Agent 建议的时间；立即入库时可与创建时间相同，后续修改与审核不会改变接收时间。', '可先在“审核规则设置”中配置审核人员、邮箱通知、频率和超时提醒。关闭通知仅停止邮件与超时提醒，不影响审核人员配置、建议生成或列表审核发布操作。实时通知针对新增建议；每小时／每日汇总覆盖全部仍可审核的待审核建议（含跨日遗留），不受列表筛选影响。超时从首次成功通知起跨日连续计时，每条仅提醒一次；已处理、已失效或已归档后停止通知。', '点击“生成建议”，数据结算且成功生成新建议后，同一对象的旧未发布建议才标记“已失效”；未结算或生成失败时，遗留建议继续可审。', 'Agent 建议比例只读；执行方案来源支持“默认预设补齐”（默认）和“Agent 完整方案”。选择来源后须保存并确认才生效，仅影响新接收建议；已有建议保留来源及快照；Agent 模式不读取默认预设，明细缺失或无效时需人工补齐，禁止直接发布。点击“调整方案”可更改实际人工／AI 比例、引用预设或调整 AI 类型及内部比例；全 AI 也支持按比例和不按比例，全人工无需配置 AI。', '人工执行占比限 0–100 的整数，AI 自动补足；人工 100% 时隐藏 AI 配置。调整窗口实时展示最终比例，保存只影响当前建议。默认预设来源的“恢复默认”会恢复 Agent 比例并读取最新默认预设；Agent 来源的“恢复 Agent 方案”仅恢复该条原始完整结果。审核时校验建议仍有效、内部比例合计 100%；按最终结果复用已有启用配置或新建配置，每条审核通过立即发布并分别留痕。自动新建的分配比例配置在列表标识“策略审核自动创建”，详情保留来源批次、规则对象及创建人和时间；复用不改变原创建来源。', '只有 DCC 发布成功并返回规则 ID 和版本号，才能标记“已发布”；失败时保留原有效规则并允许核对后重试。'], note: '“当前比例”读取关联分配规则的模板内容。默认补齐模式使用 Agent 总比例与预设组合；完整模式采用 Agent 返回的具体类型和比例，不自动读取预设。旧建议跨日不自动过期，按业务日期满六个自然月只读归档；新建议到来不会撤销已发布策略。发布只影响后续新线索。' },
  versions: { title: '版本与回滚', purpose: '按每次成功发布的正式版本查看整套规则快照与逐条审核记录；可选择历史版本中的单条规则、单个维度或整套策略生成回滚版本。', steps: ['单条建议审核通过并成功发布后，新增一个发布版本；同一建议批次可对应多个版本。版本详情展示本次变更、规则内容及审核记录。', '版本列表可组合选择建议批次、规则维度、匹配值、状态，以及搜索版本号或 DCC 规则 ID；维度和匹配值只查该版本本次变更的规则。输入后点击“查询”或按回车；点击“重置”清空条件，结果可分页查看。', '点击版本列表“选择回滚”，或在表单手动选同一版本，都会自动带入整套目标快照并显示与当前版本的差异；需要缩小范围时可改选维度或规则并重新预览。', '只恢复一条规则时，在历史版本详情点击“回滚此规则”，系统自动带入该条规则并显示差异。', '填写回滚原因并核对差异后生成待发布回滚版本；产品负责人或管理员确认发布时再次校验当前生效版本，待发布版本也可取消。'], note: '每次单条建议发布会产生一个新版本，但版本保存发布后的整套规则快照；选择版本恢复整套，选择规则只恢复该条。发布仅影响后续新线索。发布结果以 DCC 成功回执及返回的规则 ID、版本号为准。' }
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
            <button type="button" style="color:#93c5fd; border:1px solid #3b82f6; background:rgba(37,99,235,0.25); padding:6px 14px; font-size:12px; font-weight:600; border-radius:4px; cursor:pointer;" onclick="window.open('DccLead.assets/docs/线索分派策略_产品方案.html?v=20261022-v28-closeout', '_blank')">在新窗口打开完整手册 ↗</button>
            <button type="button" style="background:none; border:none; color:#94a3b8; font-size:22px; cursor:pointer; line-height:1;" onclick="closeLeadAllocationPlanDocModal()">✕</button>
          </div>
        </header>
        <div style="flex:1; overflow:hidden; background:#f8fafc;">
          <iframe src="DccLead.assets/docs/线索分派策略_产品方案.html?v=20261022-v28-closeout" style="width:100%; height:100%; border:none;"></iframe>
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
    grid.disabled = !enabled;
  }
  if (hint) {
    hint.textContent = enabled
      ? '按所选频率通知仍可审核的建议，包含跨日遗留记录。'
      : '通知已关闭；实时邮件、汇总邮件和超时提醒均不发送，列表仍可正常审核。';
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
            <div class="audit-rule-section-title">审核人员</div>
            <div class="audit-notification-field" style="margin-bottom:24px;">
              ${aiStrategyGetPersonPickerHtml('reviewers')}
              <div class="form-field-helper-label">从账号人员中选择审核人，支持多选、全选和清除所选。关闭通知不影响审核人员配置与列表审核操作。</div>
            </div>
            <div class="audit-rule-section-title">邮件通知</div>
            <label for="aiStrategyNotifyEnabled" class="audit-rule-readonly" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; cursor:pointer; user-select:none;">
              <div>
                <strong>开启审核通知</strong>
                <div class="form-field-helper-label" id="aiStrategyNotifyHint" style="margin-top:4px;">
                  ${config.notifyEnabled ? '按所选频率通知仍可审核的建议，包含跨日遗留记录。' : '通知已关闭；实时邮件、汇总邮件和超时提醒均不发送，列表仍可正常审核。'}
                </div>
              </div>
              <span class="switch">
                <input id="aiStrategyNotifyEnabled" type="checkbox" ${config.notifyEnabled ? 'checked' : ''} onchange="aiStrategyToggleNotifySwitch(this)" />
                <span class="slider"></span>
              </span>
            </label>

            <fieldset class="audit-notification-grid" id="aiStrategyAuditNotificationGrid" aria-label="邮件通知配置" ${config.notifyEnabled ? '' : 'disabled'} style="${config.notifyEnabled ? '' : 'opacity:0.45;'}">
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
                <div class="form-label">待审核通知频率</div>
                <select class="form-input" id="aiStrategyNotifyFrequency" aria-describedby="aiStrategyNotifyFrequencyHelp">
                  ${[{value:'实时通知',label:'实时通知（新增建议）'}, {value:'每小时汇总',label:'每小时汇总（含遗留待审核）'}, {value:'每日汇总',label:'每日汇总（含遗留待审核）'}].map(item => `<option value="${item.value}" ${config.notifyFrequency === item.value ? 'selected' : ''}>${item.label}</option>`).join('')}
                </select>
                <div class="form-field-helper-label" id="aiStrategyNotifyFrequencyHelp">实时通知针对新增建议；每小时／每日汇总全部仍可审核的待审核建议，包含昨日及更早遗留记录，不受当前列表筛选影响。已发布、已驳回、已失效或已归档的记录不再通知。</div>
              </div>

              <div class="audit-notification-field">
                <div class="form-label">超时提醒</div>
                <select class="form-input" id="aiStrategyTimeoutReminder" aria-describedby="aiStrategyTimeoutReminderHelp">
                  ${['不提醒', '1小时未处理提醒审核人员', '2小时未处理提醒审核人员', '4小时未处理提醒审核人员'].map(v => `<option value="${v}" ${config.timeoutReminder === v ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
                <div class="form-field-helper-label" id="aiStrategyTimeoutReminderHelp">每条建议首次通知后开始计时，跨日不重置；到时仍可审核且未处理时提醒一次。已发布、已驳回、已失效或已归档后停止；与汇总通知分别执行。</div>
              </div>
            </fieldset>
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
const aiStrategyBaseSnapshot = {
  '低效规则': '车系=轩逸（CAR-002）：继承关联策略分派动作',
  '专营店': '杭州东风日产滨江店：人工100% / AI0%',
  '车系': 'N6：人工40% / AI60%（单一AI类型：科大讯飞-冷线索）',
  'SC': 'SC-GZ-2026：人工30% / AI70%（科大讯飞-冷线索70%，人工外呼30%）',
  'SC大项目名': '置换活动：人工80% / AI20%（单一AI类型：科大讯飞-冷线索）',
  '线索状态': '总部_休眠未购：人工30% / AI70%（科大讯飞-冷线索70%，人工外呼30%）',
  '渠道': '渠道R2：人工50% / AI50%（科大讯飞-冷线索50%，人工外呼50%）'
};
const aiStrategyInitialLowEfficiency = [{ dimension: '车系', value: '轩逸', strategyId: 'CAR-002', strategyName: '轩逸车系混合比例分配', strategyVersion: '2026-06-11 14:20', condition: '意向车系=轩逸', note: '命中后沿用关联策略，不进入 Agent 动态调配' }];

function aiStrategyLowEfficiencySummary(items = []) {
  return items.length ? items.map(item => `${item.dimension}=${item.value}（${item.strategyId}）：继承关联策略分派动作`).join('；') : '无';
}
function aiStrategyLowEfficiencySignature(items = []) {
  return JSON.stringify(items.map(item => ({ dimension: item.dimension, value: item.value, strategyId: item.strategyId })).sort((a, b) => `${a.dimension}:${a.strategyId}`.localeCompare(`${b.dimension}:${b.strategyId}`)));
}

function aiStrategyRuleKey(rule) {
  return rule.ruleId ? `ID:${rule.ruleId}` : `MATCH:${encodeURIComponent(rule.dimension)}:${encodeURIComponent(rule.value)}`;
}

function aiStrategyLegacyRules(snapshot = {}) {
  const knownRuleIds = { '专营店\u0000杭州东风日产滨江店': 'DLR-001', '车系\u0000N6': 'CAR-001', 'SC\u0000SC-GZ-2026': 'SC-002', 'SC大项目名\u0000置换活动': 'PROJ-001', '线索状态\u0000总部_休眠未购': 'LS-002', '渠道\u0000渠道R2': 'CH-002' };
  return aiStrategyRouteOrder.flatMap(dimension => {
    const text = String(snapshot[dimension] || '');
    if (!text || text === '无') return [];
    const colon = text.indexOf('：');
    if (colon < 0) return [];
    const value = text.slice(0, colon).trim();
    const content = text.slice(colon + 1).trim();
    return [{ dimension, value, ruleId: knownRuleIds[`${dimension}\u0000${value}`] || '', content, reviewer: '未记录', reviewedAt: '未记录', source: '历史快照' }];
  });
}

function aiStrategyVersionRules(version) {
  return (version?.rules || aiStrategyLegacyRules(version?.snapshot)).map(rule => ({ ...rule }));
}

function aiStrategySnapshotFromRules(base, rules) {
  const snapshot = { ...base };
  aiStrategyRouteOrder.forEach(dimension => {
    const entries = rules.filter(rule => rule.dimension === dimension);
    snapshot[dimension] = entries.length ? entries.map(rule => `${rule.value}：${rule.content}`).join('；') : '无';
  });
  return snapshot;
}

function aiStrategyNewSnapshot(draft = aiStrategyState.draft) {
  const current = aiStrategyCurrentVersion();
  const rules = aiStrategyVersionRules(current);
  let snapshot = { ...(current?.snapshot || aiStrategyBaseSnapshot) };
  // 单条审核只替换对应对象规则；评分参数和低效关联不随此次发布改变。
  (draft?.rows || []).filter(row => row.reviewStatus === '已通过' || row.reviewStatus === '已发布').forEach(row => {
    const result = aiExecutionResult(row);
    const rule = { dimension: row.dimension, value: row.value, ruleId: row.ruleId || '', dccRuleId: row.dccRuleId || '', content: aiExecutionSummary(result), allocations: aiDefaultsClone(result.parts || []), allocationPolicyId: row.allocationPolicyId || '', execution: aiDefaultsClone(row.execution), agentRecommended: row.agentRecommended || row.recommended, reviewer: row.review?.reviewer || '未记录', reviewedAt: row.review?.reviewedAt || '未记录', source: draft.id };

    const key = aiStrategyRuleKey(rule);
    const index = rules.findIndex(item => aiStrategyRuleKey(item) === key);
    if (index < 0) rules.push(rule); else rules[index] = rule;
  });
  snapshot = aiStrategySnapshotFromRules(snapshot, rules);
  const lowEfficiency = aiStrategyState.lowEfficiency.map(item => ({ ...item }));
  snapshot['低效规则'] = aiStrategyLowEfficiencySummary(lowEfficiency);
  return { snapshot, rules, lowEfficiency };
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
  const sourceRows = [...aiStrategyDemoRows.map(item => {
    const rule = aiStrategyDemoRule(item);
    return rule ? { ...item, value: item.dimension === '渠道' ? `渠道${rule.keyValue}` : rule.keyValue, current: aiStrategyRuleNumericRatio(rule) } : { ...item, value: item.value || '规则已停用或不存在', current: '—', reviewStatus: '无需审核' };
  }), ...lowEfficiencyRows, ...directRows];
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
// 内部初始快照仅用于计算后续版本差异，不代表一次发布或导入事件。
const aiStrategyDemoVersions = (() => {
  const baseline = {
    id: 'V-DEMO-1', internalBaseline: true,
    agentRecommendationId: '', dccRuleIds: [], apiStatus: '',
    status: '历史有效', publishAt: '2026-09-28 10:00:00', time: '2026-09-28 10:00:00',
    operator: '', changedRuleCount: 0,
    snapshot: { ...aiStrategyBaseSnapshot }, lowEfficiency: aiStrategyInitialLowEfficiency.map(item => ({ ...item })),
    rules: aiStrategyLegacyRules(aiStrategyBaseSnapshot).map(rule => ({ ...rule, reviewer: '', reviewedAt: '' }))
  };
  function publishOne(previous, { id, recommendationId, dimension, value, content, dccRuleId, reviewer, reviewedAt, publishAt }) {
    const rules = aiStrategyVersionRules(previous).map(rule => rule.dimension === dimension && rule.value === value
      ? { ...rule, content, dccRuleId, reviewer, reviewedAt, source: recommendationId }
      : rule);
    return {
      id, source: `${recommendationId} · ${dimension}/${value}`, sourceType: '单条建议审核发布',
      agentRecommendationId: recommendationId, dccRuleIds: [dccRuleId], apiStatus: '模拟成功（待联调）',
      status: '历史有效', publishAt, time: publishAt, operator: reviewer, changedRuleCount: 1,
      baseVersionId: previous.id, rules, snapshot: aiStrategySnapshotFromRules(previous.snapshot, rules), lowEfficiency: previous.lowEfficiency.map(item => ({ ...item }))
    };
  }
  const v2 = publishOne(baseline, {
    id: 'V-DEMO-2', recommendationId: 'REC-20261008-0001', dimension: '车系', value: 'N6',
    content: '人工0% / AI100%（单一AI类型：科大讯飞-冷线索）', dccRuleId: 'DCC-RULE-DEMO-2',
    reviewer: '张晓彤（EMP-01017）', reviewedAt: '2026-10-08 14:18:35', publishAt: '2026-10-08 14:20:00'
  });
  const v3 = publishOne(v2, {
    id: 'V-DEMO-3', recommendationId: 'REC-20261011-0001', dimension: 'SC大项目名', value: '置换活动',
    content: '人工100% / AI0%', dccRuleId: 'DCC-RULE-DEMO-3',
    reviewer: '李敏（EMP-00816）', reviewedAt: '2026-10-11 17:13:42', publishAt: '2026-10-11 17:15:00'
  });
  const v4 = publishOne(v3, {
    id: 'V-DEMO-4', recommendationId: 'REC-20261012-0001', dimension: '渠道', value: '渠道R2',
    content: '人工30% / AI70%（科大讯飞-冷线索70%，人工外呼30%）', dccRuleId: 'DCC-RULE-DEMO-4',
    reviewer: '管理员（EMP-00001）', reviewedAt: '2026-10-12 18:28:51', publishAt: '2026-10-12 18:30:00'
  });
  v4.status = '演示生效';
  return [v4, v3, v2, baseline];
})();

const aiStrategyDemoAudits = [
  { action: '审核通过并发布 渠道/渠道R2；DCC规则ID DCC-RULE-DEMO-4；版本 V-DEMO-4', operator: '管理员（EMP-00001）', time: '2026-10-12 18:30:00' },
  { action: '审核通过并发布 SC大项目名/置换活动；DCC规则ID DCC-RULE-DEMO-3；版本 V-DEMO-3', operator: '李敏（EMP-00816）', time: '2026-10-11 17:15:00' },
  { action: '审核通过并发布 车系/N6；DCC规则ID DCC-RULE-DEMO-2；版本 V-DEMO-2', operator: '张晓彤（EMP-01017）', time: '2026-10-08 14:20:00' }
];

const aiStrategyState = {
  tab: 'ai-defaults',
  window: 30,
  weights: [15, 15, 15, 15, 10, 15, 15],
  lowEfficiency: aiStrategyInitialLowEfficiency.map(item => ({ ...item })),
  directLeadList: [{ type: '大项目名', value: '直派示例项目', note: '仍计入数据组汇总率值和样本量；仅影响执行路径' }],
  targets: [...aiStrategyDemoTargets],
  sampleMin: 3,
  scoreCap: true,
  gradeConfig: { thresholds: { H: 70, A: 60, B: 50 }, directions: { H: '优先建议人工', A: '优先建议人工', B: '按容量动态建议', C: '优先建议AI' } },
  attribution: '首次进线窗口',
  capacity: { planMax: 120, minNew: 20, followUpDue: 35, assignedNew: 55, otherOpen: 12 },
  sourceSettled: true,
  publishChecks: [false, false, false, false],
  draft: null,
  drafts: [],
  draftFilters: { draftId: '', dimension: '', value: '', status: '全部', ratioFilter: '' },
  draftPage: 1,
  draftPageSize: 10,
  versions: aiStrategyDemoVersions.map(v => ({ ...v, snapshot: { ...v.snapshot }, lowEfficiency: v.lowEfficiency.map(item => ({ ...item })) })),
  locallyPublishedRuleKeys: [],
  rollbackSelection: { targetId: '', scope: 'FULL', dimension: '', ruleKey: '', reason: '', previewBaseVersionId: '' },
  versionFilter: { batchId: '', dimension: '', matchValue: '', status: '全部', keyword: '' },
  versionPage: 1,
  versionPageSize: 20,
  versionDetailId: '',
  versionDetailShowAll: false,
  versionDetailFilter: { dimension: '', value: '' },
  pendingRollbackId: '',
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

function aiStrategyDemoRule(row) {
  return row.ruleId ? aiStrategyEnabledRules(row.dimension).find(rule => rule.id === row.ruleId) : null;
}

function aiStrategyRuleNumericRatio(rule) {
  const policy = rule?.allocationPolicyId && typeof leadAllocationPolicies !== 'undefined' ? leadAllocationPolicies.find(item => item.id === rule.allocationPolicyId && item.status === '启用') : null;
  const allocations = policy?.allocations?.length ? policy.allocations : rule?.allocations;
  if (!Array.isArray(allocations) || !allocations.length) return '—';
  const ai = allocations.filter(item => !String(item.channel || '').includes('人工')).reduce((sum, item) => sum + Number(item.percent || 0), 0);
  const human = allocations.filter(item => String(item.channel || '').includes('人工')).reduce((sum, item) => sum + Number(item.percent || 0), 0);
  return `人工${human}% / AI${ai}%`;
}

function aiStrategyCurrentRuleTemplate(row) {
  const ruleKey = aiStrategyRuleKey(row);
  if (aiStrategyState.locallyPublishedRuleKeys.includes(ruleKey)) {
    return aiStrategyVersionRules(aiStrategyCurrentVersion()).find(item => aiStrategyRuleKey(item) === ruleKey)?.content || '未配置';
  }
  const value = String(row.value || '').replace(/^渠道/, '');
  const rule = aiStrategyDemoRule(row) || aiStrategyEnabledRules(row.dimension).find(item => String(item.keyValue || '') === value || [item.channelValues, item.projectValues, item.seriesValues, item.dealerValues, item.scValues].some(values => Array.isArray(values) && values.includes(value)));
  if (!rule) return row.current || '—';
  if (rule.allocationPolicyId && typeof leadAllocationPolicies !== 'undefined') {
    const policy = leadAllocationPolicies.find(item => item.id === rule.allocationPolicyId && item.status === '启用');
    if (policy) return typeof getAllocationPolicySummary === 'function' ? getAllocationPolicySummary(policy) : policy.action || row.current || '—';
  }
  return rule.action || row.current || '—';
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
  aiStrategyState.lowEfficiency = aiStrategyInitialLowEfficiency.map(item => ({ ...item, note: '命中后沿用关联策略，不进入 Agent 动态调配' }));
  aiStrategyState.directLeadList = [{ type: '大项目名', value: '直派示例项目', note: '仍计入数据组汇总率值和样本量；仅影响执行路径' }];
  aiStrategyState.capacity = { planMax: 120, minNew: 20, followUpDue: 35, assignedNew: 55, otherOpen: 12 };
  aiStrategyState.sourceSettled = true;
  aiStrategyState.draft = null;
  aiStrategyState.drafts = [];
  aiStrategyState.draftFilters = { draftId: '', dimension: '', value: '', status: '全部', ratioFilter: '' };
  aiStrategyState.publishChecks = [false, false, false, false];
  aiStrategyState.pendingRollbackId = '';
  aiStrategyState.rollbackSelection = { targetId: '', scope: 'FULL', dimension: '', ruleKey: '', reason: '', previewBaseVersionId: '' };
  aiStrategyState.versions = aiStrategyDemoVersions.map(v => ({ ...v, snapshot: { ...v.snapshot }, lowEfficiency: v.lowEfficiency.map(item => ({ ...item })) }));
  aiStrategyState.locallyPublishedRuleKeys = [];
  aiStrategyState.audit = [...aiStrategyDemoAudits];
  aiStrategyState.help = '';
  aiStrategyState.tab = 'ai-defaults';
  aiStrategyLog('载入完整演示数据');
  renderAiStrategyWorkbench();
  aiStrategyNotice('完整演示数据已载入：可直接生成草案并操作审核、发布和回滚流程。', true);
}

function aiStrategyLog(action) {
  aiStrategyState.audit.unshift({ action, operator: aiStrategyCurrentAccountName(), time: new Date().toLocaleString('zh-CN', { hour12: false }) });
}

function aiStrategyCurrentAccountName() {
  const name = document.querySelector('.topbar-user-name')?.textContent?.trim();
  const accountId = document.getElementById('profileEmpId')?.value?.trim();
  return name && accountId ? `${name}（${accountId}）` : name || accountId || '当前登录帐号';
}

function aiStrategyCanPublish() {
  const role = document.querySelector('.topbar-user-role')?.textContent?.trim();
  return ['产品负责人', '管理员', '总部超级管理员'].includes(role);
}

function renderAiStrategyWorkbench(panel = document.getElementById('aiStrategyWorkbenchPage')) {
  if (!panel) return;
  const enabledLowEfficiencyCount = aiStrategyState.lowEfficiency.filter(item => aiStrategyGetLinkedRule(item)).length;
  const directLeadCount = aiStrategyState.directLeadList.length;
  const pendingReviewCount = (aiStrategyState.drafts || []).reduce((total, draft) => total + (draft.rows || []).filter(row => aiStrategyCanReviewRow(draft, row)).length, 0);
  const activeVersion = aiStrategyCurrentVersion()?.id || '—';
  const nav = [
    ['ai-defaults', 'AI 分配默认方案'],
    ['low-efficiency', '低效对象配置'],
    ['data-scope', '直派名单'],
    ['drafts', '策略建议与审核'],
    ['versions', '版本与回滚']
  ];
  panel.innerHTML = `
    <section class="ai-strategy-workbench" aria-label="AI策略工作台">
      <div class="ai-strategy-intro">
        <div class="ai-strategy-intro-copy"><div class="ai-strategy-title">AI策略工作台</div>
          <p>预设 AI 分配方式，维护例外名单，审核执行分配方案并管理发布版本。</p></div>
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
    case 'ai-defaults': return aiDefaultsRender();
    case 'versions': return aiStrategyRenderVersions();
    default: return aiDefaultsRender();
  }
}

function aiStrategyRenderFlow() {
  return `<section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>功能逻辑流程</h3><p>这里展示“每天怎么生成策略”和“新线索怎么执行分派”两条链路。生成建议不会直接改动正在执行的规则。</p></div><span class="ai-strategy-tag">已确认口径</span></div>
    <div class="ai-strategy-flow"><span>数据组T+1数据</span><i>→</i><span>低效对象判断</span><i>→</i><span>样本检查</span><i>→</i><span>系统算分</span><i>→</i><span>Agent建议</span><i>→</i><span>人工审核并发布单条规则</span><i>→</i><span>DCC返回规则ID与版本</span></div>
    <div class="ai-strategy-logic-grid"><div class="ai-strategy-info is-stop"><span>命中低效对象</span><strong>沿用关联的普通策略</strong><small>不进入Agent评分、排名和动态调配。</small></div><div class="ai-strategy-info is-stop"><span>样本不足</span><strong>沿用当前有效规则</strong><small>不评分、不排名、不调整，不影响其他对象。</small></div><div class="ai-strategy-info is-ok"><span>样本足够</span><strong>进入系统评分和Agent建议</strong><small>Agent逐对象返回评分，运营人员再确定人工/AI执行方式。</small></div></div></section>
    <section class="ai-strategy-card"><h3>新线索实际执行顺序</h3><div class="ai-strategy-flow"><span>线索进入</span><i>→</i><span>识别直派/普通路径</span><i>→</i><span>低效关联优先识别</span><i>→</i><span>专营店</span><i>→</i><span>车系</span><i>→</i><span>SC</span><i>→</i><span>SC大项目名</span><i>→</i><span>线索状态</span><i>→</i><span>渠道兜底</span></div><div class="ai-strategy-two-col"><div class="ai-strategy-info"><span>人工部分</span><strong>沿用现有坐席/主管承接逻辑</strong><small>坐席达到最大接收量时挂靠主管，仍属于人工流程。</small></div><div class="ai-strategy-info"><span>AI部分</span><strong>使用关联策略选定的AI方式</strong><small>低效对象也不另设AI方案，直接读取关联策略当前设置。</small></div></div></section>
    <section class="ai-strategy-card"><h3>异常时的处理</h3><div class="ai-strategy-logic-grid"><div class="ai-strategy-info is-stop"><span>数据未结算或字段缺失</span><strong>不生成可发布草案</strong><small>沿用最近有效策略并提示运营。</small></div><div class="ai-strategy-info is-stop"><span>Agent失败或输出不完整</span><strong>不创建新版本</strong><small>记录失败原因，不影响已发布分派。</small></div><div class="ai-strategy-info is-ok"><span>回滚</span><strong>生成新版本再切换</strong><small>只影响回滚后新线索，已经分配的任务不重派。</small></div></div></section>`;
}

function aiStrategyRenderBlueprint() {
  return `<section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>系统蓝图</h3><p>按“谁提供数据、谁计算、谁建议、谁审核、谁执行”划分边界，避免把系统计算工作交给Agent。</p></div><span class="ai-strategy-tag">职责边界</span></div>
    <div class="ai-strategy-blueprint"><div><b>① 数据来源</b><span>数据组：六类对象七项率值、样本量、数据日期。</span><span>DCC：现行规则、排班、坐席容量、任务占用。</span></div><div><b>② 业务系统</b><span>保存运营配置和版本。</span><span>计算七项分、对象分、线索分、H/A/B/C和T+1缺口。</span></div><div><b>③ Agent建议</b><span>读取已算好的结果。</span><span>逐对象返回评分和人工/AI总比例建议，不直接发布。</span></div><div><b>④ 人工决策</b><span>运营核对评分和比例。</span><span>AI占比大于0时，必须选择按比例或不按比例及对应配置；每条审核通过后立即提交 DCC 发布。</span></div><div><b>⑤ DCC执行</b><span>单条规则发布成功后更新生效版本，并用于后续新线索。</span><span>任务记录规则ID和策略版本，便于回看。</span></div></div><p class="ai-strategy-muted" style="margin-top:14px">数据与控制方向：数据组/DCC → 业务系统算分 → Agent草案 → 运营补充AI执行方式 → 单条审核并发布 → DCC执行 → 结果回传复盘。回传接口未完成时，只展示分派执行结果，不宣称已经验证转化提升。</p></section>
    <section class="ai-strategy-card"><h3>关键输入和输出</h3><div class="ai-strategy-table-wrap"><table class="ai-strategy-table"><thead><tr><th>交互方</th><th>提供/接收内容</th><th>失败时处理</th></tr></thead><tbody><tr><td>数据组 → 系统</td><td>七项率值、样本量、数据日期和核对明细；汇总包含直派</td><td>数据不完整，不生成新草案</td></tr><tr><td>DCC → 系统</td><td>当前策略、容量、继续跟进占用和已分派任务</td><td>容量或版本读不到，不允许发布新建议</td></tr><tr><td>系统 → Agent</td><td>已算好的得分、H/A/B/C、样本状态、缺口、当前比例和运营边界</td><td>输入缺失，Agent结果标记失败</td></tr><tr><td>Agent → 人工</td><td>每个对象的 Agent评分、建议比例和规则维度信息</td><td>漏对象或字段不完整，不能进入审核发布</td></tr><tr><td>人工 → DCC</td><td>单条已审核规则、AI内部配置引用及当前版本</td><td>发布失败，继续使用旧版本</td></tbody></table></div></section>`;
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
  return `<section class="ai-strategy-card ai-low-eff-card"><div class="ai-strategy-section-head"><div><h3>运营配置低效对象</h3><p>选择已启用的普通分配策略并填写维护说明。命中后不参与 Agent 评分和动态调配，分派动作沿用关联策略。</p></div><div class="ai-strategy-section-head-actions">${aiStrategyPlanDocButton()}${aiStrategyHelpButton('low-efficiency')}${aiListTransferButtons('low')}</div></div>
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
  return `<section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>直派名单</h3><p>维护需要直接执行的线索标识，保存后按直派路径执行。命中直派名单后，不参与 Agent 评分、排名和动态调配。</p></div><div class="ai-strategy-section-head-actions">${aiStrategyPlanDocButton()}${aiStrategyHelpButton('data-scope')}${aiListTransferButtons('direct')}</div></div>
    <form id="aiDirectLeadForm" class="ai-strategy-config-form ai-direct-lead-form" novalidate>
      <label>直派名单类型<select name="type" required><option value="">请选择</option><option value="大项目名">大项目名</option></select><small class="ai-strategy-field-error" data-error="type"></small></label>
      <label>标识值<input name="value" type="text" maxlength="80" placeholder="例如：高德地图大项目" required><small class="ai-strategy-field-error" data-error="value"></small></label>
      <label>生效说明<input name="note" type="text" maxlength="120" placeholder="例如：用于识别执行路径，不扣除汇总分母" required><small class="ai-strategy-field-error" data-error="note"></small></label>
      <button type="submit" class="ai-strategy-btn primary">加入直派标识</button>
    </form>
    <div class="ai-strategy-table-wrap"><table class="ai-strategy-table ai-strategy-direct-lead-table"><thead><tr><th>直派名单类型</th><th>标识值</th><th>对 Agent 的作用</th><th>生效说明</th><th>操作</th></tr></thead><tbody>${aiStrategyState.directLeadList.length ? aiStrategyState.directLeadList.map((item, index) => `<tr><td>${aiStrategyEsc(item.type)}</td><td><strong>${aiStrategyEsc(item.value)}</strong></td><td>不参与评分、排名和动态调配</td><td>${aiStrategyEsc(item.note)}</td><td><button type="button" class="ai-strategy-text-btn" data-ai-action="remove-direct" data-ai-value="${index}">移除</button></td></tr>`).join('') : '<tr><td colspan="5" class="ai-strategy-empty">暂无直派标识，请按业务名单添加。</td></tr>'}</tbody></table></div></section>`;
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
function aiStrategyDraftObjectKey(row) { return `${row.dimension || ''}\u0000${row.value || ''}`; }
function aiStrategyFilteredDraftRows(draft, filters = aiStrategyState.draftFilters || {}) {
  return (draft?.rows || []).map((row, index) => ({ row, index })).filter(({ row }) =>
    (!filters.dimension || row.dimension === filters.dimension) &&
    (!filters.value || String(row.value || '').toLowerCase().includes(filters.value.toLowerCase())) &&
    (!filters.ratioFilter || (row.recommended !== '—' && (filters.ratioFilter === '包含AI' ? aiStrategyGetAiPercent(row.recommended) > 0 : aiStrategyGetAiPercent(row.recommended) <= 0))) &&
    (filters.status === '全部' || !filters.status || (row.reviewStatus || '待审核') === filters.status));
}
function aiStrategySelectedDraft() {
  return aiStrategyState.drafts.find(item => item.id === aiStrategyState.draftFilters?.draftId) || aiStrategyState.draft;
}
function aiStrategyArchiveDate(draft) {
  const [year, month, day] = aiStrategyDraftDate(draft).split('-').map(Number);
  const lastDay = new Date(year, month + 6, 0).getDate();
  return new Date(year, month + 5, Math.min(day, lastDay));
}
function aiStrategyIsArchived(draft) {
  return !!draft && new Date(aiStrategyBusinessDate() + 'T00:00:00') >= aiStrategyArchiveDate(draft);
}
function aiStrategyLatestEntry(row) {
  const key = aiStrategyDraftObjectKey(row);
  for (const draft of aiStrategyState.drafts) {
    const match = (draft.rows || []).find(item => aiStrategyDraftObjectKey(item) === key && item.reviewStatus !== '无需审核');
    if (match) return { draft, row: match };
  }
  return null;
}
function aiStrategyCanReviewRow(draft, row) {
  if (!draft || !row) return false;
  const latest = aiStrategyLatestEntry(row);
  return !aiStrategyIsArchived(draft) && draft.status === '演示草案' && row.reviewStatus === '待审核' && !row.supersededBy && latest?.draft === draft && latest.row === row;
}
function aiStrategySupersedeOldRows(newDraft) {
  const newKeys = new Set((newDraft.rows || []).filter(row => row.reviewStatus !== '无需审核').map(aiStrategyDraftObjectKey));
  aiStrategyState.drafts.forEach(draft => {
    if (draft === newDraft || draft.status === '演示已发布') return;
    (draft.rows || []).forEach(row => {
      if (!newKeys.has(aiStrategyDraftObjectKey(row)) || ['无需审核', '已失效', '已发布'].includes(row.reviewStatus)) return;
      row.previousReviewStatus = row.reviewStatus || '待审核';
      row.reviewStatus = '已失效';
      row.supersededBy = newDraft.id;
      row.supersededAt = newDraft.createdAt;
    });
    draft.selected = [];
  });
}
function aiStrategyPublishReviewedRow(draft, row, comment = '') {
  if (!aiStrategyCanReviewRow(draft, row) || aiStrategyState.pendingRollbackId) return false;
  const current = aiStrategyCurrentVersion();
  if (!current || !aiStrategyDemoRule(row) || aiExecutionResult(row).error) return false;
  const serial = aiStrategyState.versions.length + 1;
  const id = `V-DEMO-${serial}`;
  const dccRuleId = `DCC-RULE-DEMO-${serial}`;
  const now = new Date().toLocaleString('zh-CN', { hour12: false });
  const reviewer = aiStrategyCurrentAccountName();
  // 原型模拟 DCC 成功回执；生产环境必须以 DCC 返回成功及规则 ID 为提交条件。
  const policyPlan = aiExecutionPreparePolicy(row);
  if (policyPlan.error) return false;
  const publishedRow = { ...row, allocationPolicyId: policyPlan.policy.id, allocationPolicySource: policyPlan.created ? '自动新建' : '复用已有', reviewStatus: '已发布', review: { reviewer, reviewedAt: now, comment }, dccRuleId };
  const versionData = aiStrategyNewSnapshot({ ...draft, rows: [publishedRow] });
  if (!versionData.rules.some(rule => rule.dccRuleId === dccRuleId)) return false;
  if (policyPlan.created) {
    Object.assign(policyPlan.policy, { creationSource: '策略审核自动创建', createdBy: reviewer, createdAt: now, sourceBatchId: draft.id, sourceRuleObject: `${row.dimension} · ${row.value}`, sourceRuleId: row.ruleId || '未记录' });
    leadAllocationPolicies.push(policyPlan.policy);
  }
  current.status = '历史有效';
  aiStrategyState.versions.unshift({ id, source: `${draft.id} · ${row.dimension}/${row.value}`, sourceType: '单条建议审核发布', agentRecommendationId: draft.id, dccRuleIds: [dccRuleId], apiStatus: '模拟成功（待联调）', status: '演示生效', time: now, publishAt: now, operator: reviewer, snapshot: versionData.snapshot, rules: versionData.rules, lowEfficiency: versionData.lowEfficiency, changedRuleCount: 1, baseVersionId: current.id });
  aiStrategyState.locallyPublishedRuleKeys = [...new Set([...aiStrategyState.locallyPublishedRuleKeys, aiStrategyRuleKey(row)])];
  Object.assign(row, publishedRow, { publishedVersionId: id, publishAt: now });
  aiExecutionSyncPublishedRule(row, policyPlan.policy, now);
  draft.publishedVersionIds = [...(draft.publishedVersionIds || []), id];
  if (draft.rows.every(item => ['已发布', '无需审核', '已失效'].includes(item.reviewStatus))) draft.status = '演示已发布';
  aiStrategyLog(`审核通过并发布 ${row.dimension}/${row.value}；DCC规则ID ${dccRuleId}；版本 ${id}`);
  return true;
}
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
// 原型在建议进入批次时记录接收时间；正式实现由接收 Agent 结果的服务端写入。
function aiStrategyRecordReceived(draft, receivedAt) {
  draft.receivedAt = draft.receivedAt || receivedAt;
  draft.rows.forEach(row => {
    if (row.reviewStatus !== '无需审核' && row.recommended !== '—' && !row.receivedAt) row.receivedAt = draft.receivedAt;
  });
}
function aiStrategyReceivedTime(row) {
  if (row.reviewStatus === '无需审核' || row.recommended === '—') return '<span class="ai-strategy-muted">—</span>';
  const value = String(row.receivedAt || '');
  const match = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}:\d{2}(?::\d{2})?)/);
  if (!match) return `<span class="ai-strategy-muted">${aiStrategyEsc(value || '未记录')}</span>`;
  return `<time class="ai-strategy-received-time"><span>${match[1]}-${match[2].padStart(2,'0')}-${match[3].padStart(2,'0')}</span><small>${match[4]}</small></time>`;
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
    const receivedAt = new Date().toLocaleString('zh-CN', { hour12: false });
    aiStrategyState.draft = {
      id: `REC-${aiStrategyBusinessDate().replaceAll('-', '')}-0001`,
      businessDate: aiStrategyBusinessDate(),
      name: '线索分派策略建议',
      status: '演示草案',
      createdAt: receivedAt,
      receivedAt,
      gradeConfig: { thresholds: { ...aiStrategyState.gradeConfig.thresholds }, directions: { ...aiStrategyState.gradeConfig.directions } },
      rows: aiStrategyCalculatedDemoRows().map(row => ({ ...row, reviewStatus: row.reviewStatus || '待审核', agentRecommended: row.agentRecommended || row.recommended, habc: row.habc ? { ...row.habc } : null, aiMode: row.aiMode || '', aiPolicyId: row.aiPolicyId || '', aiType: row.aiType || '' }))
    };
    const historyDate = new Date(); historyDate.setDate(historyDate.getDate() - 1);
    const source = aiStrategyState.draft.rows.find(row => row.dimension === '渠道' && row.reviewStatus !== '无需审核') || aiStrategyState.draft.rows.find(row => row.reviewStatus !== '无需审核');
    const legacyRule = aiStrategyEnabledRules('渠道').find(rule => rule.id === 'CH-004');
    const legacyRow = source && legacyRule ? { ...source, ruleId: legacyRule.id, dimension: '渠道', value: `渠道${legacyRule.keyValue}`, current: aiStrategyRuleNumericRatio(legacyRule), recommended: '人工100% / AI0%', agentRecommended: '人工100% / AI0%', aiMode: '', aiPolicyId: '', aiType: '', reviewStatus: '待审核', review: null } : null;
    const legacyDraft = { ...aiStrategyState.draft, id: 'DEMO-HISTORY-' + aiStrategyBusinessDate(historyDate).replaceAll('-', ''), businessDate: aiStrategyBusinessDate(historyDate), createdAt: aiStrategyBusinessDate(historyDate) + ' 08:30:00', rows: legacyRow ? [legacyRow] : [], selected: [] };
    aiStrategyRecordReceived(aiStrategyState.draft, receivedAt);
    legacyDraft.receivedAt = legacyDraft.createdAt;
    aiStrategyRecordReceived(legacyDraft, legacyDraft.receivedAt);
    aiStrategyState.drafts = [aiStrategyState.draft, legacyDraft];
    aiStrategyState.drafts.forEach(item => item.rows.forEach(aiExecutionEnsure));
  }
  if (!aiStrategyState.drafts.length) aiStrategyState.drafts = [aiStrategyState.draft];
  const currentDraft = aiStrategyState.draft;
  const filters = aiStrategyState.draftFilters || { draftId: '', dimension: '', value: '', status: '全部', ratioFilter: '' };
  const draft = aiStrategySelectedDraft();
  const draftDate = aiStrategyDraftDate(draft);
  const allRows = draft?.rows || [];
  allRows.filter(row => row.reviewStatus !== '无需审核' && row.recommended !== '—').forEach(aiExecutionEnsure);
  const filteredRows = aiStrategyFilteredDraftRows(draft, filters);
  const pendingRows = filteredRows.filter(({ row }) => aiStrategyCanReviewRow(draft, row));
  const pageSize = Number(aiStrategyState.draftPageSize || 10);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  aiStrategyState.draftPage = Math.min(Math.max(1, Number(aiStrategyState.draftPage || 1)), totalPages);
  const pagedRows = filteredRows.slice((aiStrategyState.draftPage - 1) * pageSize, aiStrategyState.draftPage * pageSize);
  const pagePendingRows = pagedRows.filter(({ row }) => aiStrategyCanReviewRow(draft, row));
  const archived = aiStrategyIsArchived(draft);
  const editable = draft?.status === '演示草案' && !archived;
  const invalidCount = allRows.filter(row => row.reviewStatus === '已失效').length;
  const draftLabel = archived ? '已归档，只读' : invalidCount === allRows.length && allRows.length ? '已失效，只读' : editable ? (draft === currentDraft ? '可审核' : '遗留可审核') : '已处理，只读';
  const dimensions = [...new Set(allRows.map(row => row.dimension))];
  return `<section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>策略建议与审核</h3><p>根据已启用的分配规则生成策略建议。Agent 建议保留原值；执行方案按接收时配置的来源生成，可调整后审核发布。</p></div><div class="ai-strategy-section-head-actions">${aiStrategyPlanDocButton()}${aiStrategyHelpButton('drafts')}<button type="button" class="ai-strategy-btn secondary" data-ai-io="export-suggestions" title="导出当前批次及筛选条件下的全部记录，不限当前页">导出数据</button><button type="button" class="ai-strategy-btn secondary" data-ai-action="open-audit-rules" title="设置策略建议审核通知、审核人与超时提醒">审核规则设置</button><button type="button" class="ai-strategy-btn primary" data-ai-action="generate-draft">生成建议</button></div></div>
    ${aiExecutionDefaultBanner()}
    ${!draft ? '<div class="ai-strategy-empty block">暂无策略建议。请点击右上角“生成建议”。</div>' : `
      <div class="ai-strategy-draft-head"><div><strong>${aiStrategyEsc(draft.name)}</strong><small>建议批次号：${aiStrategyEsc(draft.id)} · 业务日期 ${aiStrategyEsc(draftDate)} · 接收于 ${aiStrategyEsc(draft.receivedAt || '未记录')}${draft.publishedVersionIds?.length ? ` · 已发布 ${draft.publishedVersionIds.length} 条` : ''}</small></div><span class="ai-strategy-status-tag ${editable ? 'is-current' : 'is-expired'}">${draftLabel}</span></div>
      <div class="ai-strategy-filterbar"><label class="ai-strategy-date-filter">建议批次<select class="ai-strategy-inline-select" data-ai-filter="draftId">${aiStrategyState.drafts.map(item => `<option value="${aiStrategyEsc(item.id)}" ${item === draft ? 'selected' : ''}>${aiStrategyEsc(aiStrategyDraftDate(item))} · ${aiStrategyEsc(item.id)}</option>`).join('')}</select></label><select class="ai-strategy-inline-select" data-ai-filter="dimension"><option value="">全部规则维度</option>${dimensions.map(d => `<option value="${aiStrategyEsc(d)}" ${filters.dimension === d ? 'selected' : ''}>${aiStrategyEsc(d)}</option>`).join('')}</select><input class="ai-strategy-inline-input" data-ai-filter="value" value="${aiStrategyEsc(filters.value)}" placeholder="搜索匹配值"><select class="ai-strategy-inline-select" data-ai-filter="ratioFilter" title="按建议比例筛选"><option value="">全部建议比例</option><option value="包含AI" ${filters.ratioFilter === '包含AI' ? 'selected' : ''}>包含AI</option><option value="不包含AI" ${filters.ratioFilter === '不包含AI' ? 'selected' : ''}>不包含AI</option></select><select class="ai-strategy-inline-select" data-ai-filter="status"><option value="待审核" ${filters.status === '待审核' ? 'selected' : ''}>待审核</option><option value="已发布" ${filters.status === '已发布' ? 'selected' : ''}>已发布</option><option value="已驳回" ${filters.status === '已驳回' ? 'selected' : ''}>已驳回</option><option value="已失效" ${filters.status === '已失效' ? 'selected' : ''}>已失效</option><option value="无需审核" ${filters.status === '无需审核' ? 'selected' : ''}>无需审核</option><option value="全部" ${filters.status === '全部' ? 'selected' : ''}>全部状态</option></select><button type="button" class="ai-strategy-btn secondary" data-ai-action="reset-draft-filters">重置</button><span class="ai-strategy-muted">当前 ${filteredRows.length} 条，可审核 ${pendingRows.length} 条</span>${archived ? '<span class="ai-strategy-expired-note">业务日期满六个月后只读归档。</span>' : invalidCount ? `<span class="ai-strategy-expired-note">${invalidCount} 条建议已被新批次替代。</span>` : ''}</div>
      <div class="ai-strategy-table-wrap"><table class="ai-strategy-table ai-strategy-drafts-table"><thead><tr><th><input type="checkbox" data-ai-action="select-visible" ${!pagePendingRows.length ? 'disabled' : ''} ${pagePendingRows.length && pagePendingRows.every(({index}) => draft.selected?.includes(index)) ? 'checked' : ''}></th><th>规则维度</th><th>匹配值</th><th>样本量</th><th>当前比例 <small title="读取当前启用分配规则对应的模板内容">（规则模板）</small></th><th>Agent 建议比例</th><th>执行分配方案</th><th>建议说明</th><th>审核/发布状态</th><th title="系统接收并保存 Agent 建议的时间">接收时间</th><th>操作</th></tr></thead><tbody>${pagedRows.map(({row, index}) => {
  const status = row.reviewStatus || '待审核';
  const rowCanReview = aiStrategyCanReviewRow(draft, row);
  const rowCanEdit = rowCanReview || (editable && status === '已驳回' && !row.supersededBy && aiStrategyLatestEntry(row)?.row === row);
  const agentRatio = row.agentRecommended || row.recommended;
  const recRatioHtml = `<strong>${aiStrategyEsc(agentRatio)}</strong>`;
  const aiCellHtml = aiExecutionCell(row, index, rowCanReview);

  return `<tr><td><input type="checkbox" data-ai-row-select="${index}" ${draft.selected?.includes(index) ? 'checked' : ''} ${!rowCanReview ? 'disabled' : ''}></td><td><strong>${aiStrategyEsc(row.dimension)}</strong></td><td>${aiStrategyEsc(row.value)}${row.ruleId ? `<small class="ai-strategy-rule-ref">规则 ${aiStrategyEsc(row.ruleId)}</small>` : ''}</td><td>${row.sample}</td><td>${aiStrategyEsc(aiStrategyCurrentRuleTemplate(row))}</td><td>${recRatioHtml}</td><td>${aiCellHtml}</td><td>${aiStrategyEsc(aiStrategyAgentReason(row))}</td><td>${aiStrategyEsc(status)}${row.supersededBy ? `<small style="display:block;color:#64748b">由 ${aiStrategyEsc(row.supersededBy)} 替代</small>` : ''}${row.dccRuleId ? `<small class="ai-strategy-rule-ref">DCC规则ID：${aiStrategyEsc(row.dccRuleId)} · ${aiStrategyEsc(row.publishedVersionId)}</small>` : ''}</td><td>${aiStrategyReceivedTime(row)}</td><td><div class="ai-strategy-row-actions">${rowCanReview ? `<button type="button" class="ai-strategy-text-btn" data-ai-action="approve-row" data-ai-value="${index}" title="审核通过后立即发布本条执行方案">通过并发布</button> <button type="button" class="ai-strategy-text-btn" data-ai-action="reject-row" data-ai-value="${index}">驳回</button>` : rowCanEdit ? `<button type="button" class="ai-strategy-text-btn" data-ai-action="edit-row" data-ai-value="${index}">修改后重审</button>` : `<span class="ai-strategy-muted">${status === '已失效' ? '已失效' : status === '无需审核' ? '无需审核' : archived ? '已归档' : '已处理'}</span>`}</div></td></tr>`;
}).join('')}</tbody></table></div><div class="ai-strategy-pagination"><button type="button" class="ai-strategy-btn secondary" data-ai-action="draft-page-prev" ${aiStrategyState.draftPage <= 1 ? 'disabled' : ''}>上一页</button><span>第 ${aiStrategyState.draftPage} / ${totalPages} 页，共 ${filteredRows.length} 条</span><button type="button" class="ai-strategy-btn secondary" data-ai-action="draft-page-next" ${aiStrategyState.draftPage >= totalPages ? 'disabled' : ''}>下一页</button><select class="ai-strategy-inline-select" data-ai-filter="pageSize"><option value="10" ${aiStrategyState.draftPageSize === 10 ? 'selected' : ''}>10条/页</option><option value="20" ${aiStrategyState.draftPageSize === 20 ? 'selected' : ''}>20条/页</option><option value="50" ${aiStrategyState.draftPageSize === 50 ? 'selected' : ''}>50条/页</option></select></div>
      <div class="ai-strategy-actions">${pendingRows.length ? '<button type="button" class="ai-strategy-btn primary" data-ai-action="approve-selected" title="逐条审核并发布已勾选且已完成AI配置的建议">审核并发布选中</button><button type="button" class="ai-strategy-btn secondary" data-ai-action="approve-all-visible" title="逐条审核并发布当前筛选结果的待审核建议">批量审核并发布</button>' : ''}</div>`}
  </section>`;
}
function aiStrategyRollbackData(current, target, choice) {
  if (!current || !target) return null;
  const currentRules = aiStrategyVersionRules(current);
  const targetRules = aiStrategyVersionRules(target);
  const currentByKey = new Map(currentRules.map(rule => [aiStrategyRuleKey(rule), rule]));
  const targetByKey = new Map(targetRules.map(rule => [aiStrategyRuleKey(rule), rule]));
  if (currentByKey.size !== currentRules.length || targetByKey.size !== targetRules.length) return null;
  if (choice.scope === 'DIMENSION' && !choice.dimension) return null;
  if (choice.scope === 'RULE' && (!choice.ruleKey || !currentByKey.has(choice.ruleKey) || !targetByKey.has(choice.ruleKey))) return null;
  const keys = new Set([...currentByKey.keys(), ...targetByKey.keys()].filter(key => {
    const rule = currentByKey.get(key) || targetByKey.get(key);
    return choice.scope === 'FULL' || (choice.scope === 'DIMENSION' && rule.dimension === choice.dimension) || (choice.scope === 'RULE' && key === choice.ruleKey);
  }));
  const preview = [...keys].map(key => {
    const before = currentByKey.get(key);
    const historical = targetByKey.get(key);
    return { key, dimension: (before || historical).dimension, value: (before || historical).value, currentValue: before?.value || '未配置', targetValue: historical?.value || '未配置', ruleId: (before || historical).ruleId || '—', current: before?.content || '未配置', target: historical?.content || '未配置', changed: before?.dimension !== historical?.dimension || before?.value !== historical?.value || before?.content !== historical?.content };
  });
  if (choice.scope === 'FULL') {
    const beforeItems = aiStrategyState.lowEfficiency;
    const historicalItems = target.lowEfficiency || [];
    preview.push({ key: 'LOW_EFFICIENCY', dimension: '低效规则', value: '关联配置', currentValue: '关联配置', targetValue: '关联配置', ruleId: '—', current: aiStrategyLowEfficiencySummary(beforeItems), target: aiStrategyLowEfficiencySummary(historicalItems), changed: aiStrategyLowEfficiencySignature(beforeItems) !== aiStrategyLowEfficiencySignature(historicalItems) });
  }
  const rules = currentRules.filter(rule => !keys.has(aiStrategyRuleKey(rule)));
  targetRules.filter(rule => keys.has(aiStrategyRuleKey(rule))).forEach(rule => {
    rules.push({ ...rule, source: `回滚自 ${target.id}`, restoredFromVersion: target.id });
  });
  const base = choice.scope === 'FULL' ? { ...current.snapshot, ...target.snapshot } : { ...current.snapshot };
  const lowEfficiency = (choice.scope === 'FULL' ? target.lowEfficiency || [] : aiStrategyState.lowEfficiency).map(item => ({ ...item }));
  const snapshot = aiStrategySnapshotFromRules(base, rules);
  snapshot['低效规则'] = aiStrategyLowEfficiencySummary(lowEfficiency);
  return { rules, snapshot, lowEfficiency, preview, changedCount: preview.filter(row => row.changed).length };
}

function aiStrategyVersionChangedRules(version) {
  const rules = aiStrategyVersionRules(version);
  const base = aiStrategyState.versions.find(item => item.id === version.baseVersionId);
  if (!base) return rules;
  const before = new Map(aiStrategyVersionRules(base).map(rule => [aiStrategyRuleKey(rule), rule]));
  const after = new Map(rules.map(rule => [aiStrategyRuleKey(rule), rule]));
  const publishedIds = new Set(version.dccRuleIds || []);
  const changed = rules.filter(rule => {
    const old = before.get(aiStrategyRuleKey(rule));
    return (rule.dccRuleId && publishedIds.has(rule.dccRuleId)) || !old || old.content !== rule.content || old.dccRuleId !== rule.dccRuleId;
  });
  aiStrategyVersionRules(base).forEach(rule => {
    if (!after.has(aiStrategyRuleKey(rule))) changed.push(rule);
  });
  return changed;
}

function aiStrategyVersionChangedSummary(version) {
  const changed = aiStrategyVersionChangedRules(version);
  if (!changed.length) return '';
  const names = changed.slice(0, 2).map(rule => `${rule.dimension}/${rule.value}`).join('、');
  return `<small class="ai-strategy-rule-ref">本次：${aiStrategyEsc(names)}${changed.length > 2 ? '等' : ''}</small>`;
}

function aiStrategyRenderVersions() {
  const current = aiStrategyCurrentVersion();
  const versionFilter = aiStrategyState.versionFilter;
  const publishedVersions = aiStrategyState.versions.filter(item => !item.internalBaseline);
  const batches = [...new Set(publishedVersions.map(item => item.agentRecommendationId).filter(Boolean))];
  const visibleVersions = publishedVersions.filter(item => {
    if (versionFilter.status !== '全部' && item.status !== versionFilter.status) return false;
    if (versionFilter.batchId && item.agentRecommendationId !== versionFilter.batchId) return false;
    if (versionFilter.keyword.trim() && !`${item.id} ${(item.dccRuleIds || []).join(' ')}`.toLowerCase().includes(versionFilter.keyword.trim().toLowerCase())) return false;
    if (!versionFilter.dimension && !versionFilter.matchValue.trim()) return true;
    return aiStrategyVersionChangedRules(item).some(rule =>
      (!versionFilter.dimension || rule.dimension === versionFilter.dimension) &&
      (!versionFilter.matchValue.trim() || rule.value.toLowerCase().includes(versionFilter.matchValue.trim().toLowerCase()))
    );
  });
  const pageSize = Number(aiStrategyState.versionPageSize) || 20;
  const totalPages = Math.max(1, Math.ceil(visibleVersions.length / pageSize));
  aiStrategyState.versionPage = Math.min(Math.max(1, Number(aiStrategyState.versionPage) || 1), totalPages);
  const pageVersions = visibleVersions.slice((aiStrategyState.versionPage - 1) * pageSize, aiStrategyState.versionPage * pageSize);
  const detailVersion = publishedVersions.find(item => item.id === aiStrategyState.versionDetailId);
  const historical = publishedVersions.filter(item => item.status === '历史有效');
  const choice = aiStrategyState.rollbackSelection;
  const target = historical.find(item => item.id === choice.targetId);
  const targetRules = aiStrategyVersionRules(target);
  const currentRuleKeys = new Set(aiStrategyVersionRules(current).map(aiStrategyRuleKey));
  const selectableRules = targetRules.filter(rule => currentRuleKeys.has(aiStrategyRuleKey(rule)) && (!choice.dimension || rule.dimension === choice.dimension));
  const pending = aiStrategyState.versions.find(item => item.id === aiStrategyState.pendingRollbackId && item.status === '待发布');
  const rollback = target && current && choice.previewBaseVersionId === current.id ? aiStrategyRollbackData(current, target, choice) : null;
  const preview = rollback?.preview.filter(row => row.changed) || [];
  const detailHtml = detailVersion ? (() => {
    const vf = aiStrategyState.versionDetailFilter || { dimension: '', value: '' };
    const allRules = aiStrategyVersionRules(detailVersion);
    const dimensions = [...new Set(allRules.map(rule => rule.dimension))];
    const baseVersion = aiStrategyState.versions.find(item => item.id === detailVersion.baseVersionId);
    const lowEfficiencyChanged = Boolean(baseVersion && aiStrategyLowEfficiencySignature(baseVersion.lowEfficiency || []) !== aiStrategyLowEfficiencySignature(detailVersion.lowEfficiency || []));
    const detailRuleKeys = new Set(allRules.map(aiStrategyRuleKey));
    const changedRules = aiStrategyVersionChangedRules(detailVersion).filter(rule => detailRuleKeys.has(aiStrategyRuleKey(rule)));
    const hasFocusedView = Boolean(baseVersion && changedRules.length && changedRules.length < allRules.length);
    const showAll = !hasFocusedView || aiStrategyState.versionDetailShowAll;
    const scopedRules = showAll ? allRules : changedRules;
    const rules = scopedRules.filter(rule => (!showAll || !vf.dimension || rule.dimension === vf.dimension) && (!showAll || !vf.value || `${rule.dimension} ${rule.value} ${rule.ruleId || ''} ${rule.content}`.toLowerCase().includes(vf.value.toLowerCase())));
    const currentKeys = new Set(aiStrategyVersionRules(current).map(aiStrategyRuleKey));
    return `<aside class="ai-strategy-version-drawer"><div class="ai-strategy-version-drawer-head"><div><strong>${aiStrategyEsc(detailVersion.id)} 版本详情</strong><small>来源：${aiStrategyEsc(detailVersion.sourceType || detailVersion.source)} · 生效时间：${aiStrategyEsc(detailVersion.publishAt || detailVersion.time)}</small></div><button type="button" class="ai-strategy-help-close" data-ai-action="close-version-detail" aria-label="关闭详情">×</button></div>
      <div class="ai-strategy-version-meta"><span>本次发布到 DCC 的规则ID：${aiStrategyEsc(detailVersion.dccRuleIds?.join('、') || '未记录')}</span><span>发布人：${aiStrategyEsc(detailVersion.operator || '未记录')}</span><span>本次变更：${detailVersion.changedRuleCount ?? '未记录'} 条</span></div>
      ${lowEfficiencyChanged ? `<p class="ai-strategy-muted">低效关联变化：${aiStrategyEsc(aiStrategyLowEfficiencySummary(baseVersion.lowEfficiency || []))} → ${aiStrategyEsc(aiStrategyLowEfficiencySummary(detailVersion.lowEfficiency || []))}</p>` : ''}
      <div class="ai-strategy-version-scope"><strong>${showAll ? `完整快照 · ${allRules.length} 条` : `本次变更 · ${changedRules.length} 条`}</strong>${hasFocusedView ? `<button type="button" class="ai-strategy-text-btn" data-ai-action="toggle-version-detail-scope">${showAll ? '只看本次变更' : `查看完整快照（${allRules.length} 条）`}</button>` : ''}</div>
      ${showAll && allRules.length > 1 ? `<div class="ai-strategy-filterbar"><select class="ai-strategy-inline-select" data-version-detail-filter="dimension"><option value="">全部规则维度</option>${dimensions.map(d => `<option value="${aiStrategyEsc(d)}" ${vf.dimension === d ? 'selected' : ''}>${aiStrategyEsc(d)}</option>`).join('')}</select><input class="ai-strategy-inline-input" data-version-detail-filter="value" value="${aiStrategyEsc(vf.value)}" placeholder="搜索匹配值、规则ID或内容"></div>` : ''}
      <div class="ai-strategy-table-wrap"><table class="ai-strategy-table ai-strategy-version-rules-table"><thead><tr><th>规则对象</th><th>规则内容</th><th>审核记录</th><th>操作</th></tr></thead><tbody>${rules.map(rule => { const key = aiStrategyRuleKey(rule); const canRollback = detailVersion.status === '历史有效' && currentKeys.has(key); const hasAudit = rule.reviewer && rule.reviewer !== '未记录' && rule.reviewedAt && rule.reviewedAt !== '未记录'; return `<tr><td><strong>${aiStrategyEsc(rule.dimension)} · ${aiStrategyEsc(rule.value)}</strong>${rule.ruleId ? `<small class="ai-strategy-rule-ref">原配置规则ID：${aiStrategyEsc(rule.ruleId)}</small>` : ''}</td><td>${aiStrategyEsc(rule.content)}</td><td>${hasAudit ? `${aiStrategyEsc(rule.reviewer)}<small class="ai-strategy-rule-ref">${aiStrategyEsc(rule.reviewedAt)}</small>` : '未记录'}</td><td>${canRollback ? `<button type="button" class="ai-strategy-text-btn" data-ai-action="rollback-rule" data-ai-value="${aiStrategyEsc(key)}">回滚此规则</button>` : '<span class="ai-strategy-muted">—</span>'}</td></tr>`; }).join('') || '<tr><td colspan="4" class="ai-strategy-empty">暂无匹配规则</td></tr>'}</tbody></table></div>
      ${showAll && detailVersion.status === '历史有效' ? '<p class="ai-strategy-muted">当前版已删除的规则需单独评估恢复。</p>' : ''}</aside>`;
  })() : '';
  return `<section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>版本记录与回滚</h3><p>每条建议审核发布形成一个新版本，版本保存发布后的整套规则。列表“选择回滚”恢复整套快照；详情“回滚此规则”只恢复单条。</p></div></div>
    <div class="ai-strategy-filterbar" aria-label="查询发布版本">
      <span>建议批次</span><select class="ai-strategy-inline-select ai-version-batch-select" data-version-filter="batchId"><option value="">全部建议批次</option>${batches.map(id => `<option value="${aiStrategyEsc(id)}" ${versionFilter.batchId === id ? 'selected' : ''}>${aiStrategyEsc(id.match(/^REC-(\d{4})(\d{2})(\d{2})/) ? `${id.slice(4, 8)}-${id.slice(8, 10)}-${id.slice(10, 12)} · ${id}` : id)}</option>`).join('')}</select>
      <select class="ai-strategy-inline-select" data-version-filter="dimension" aria-label="规则维度"><option value="">全部规则维度</option>${aiStrategyRouteOrder.map(name => `<option value="${aiStrategyEsc(name)}" ${versionFilter.dimension === name ? 'selected' : ''}>${aiStrategyEsc(name)}</option>`).join('')}</select>
      <input class="ai-strategy-inline-input" data-version-filter="matchValue" value="${aiStrategyEsc(versionFilter.matchValue)}" placeholder="搜索匹配值" aria-label="搜索匹配值">
      <select class="ai-strategy-inline-select" data-version-filter="status" aria-label="版本状态"><option value="全部" ${versionFilter.status === '全部' ? 'selected' : ''}>全部状态</option><option value="演示生效" ${versionFilter.status === '演示生效' ? 'selected' : ''}>当前生效</option><option value="历史有效" ${versionFilter.status === '历史有效' ? 'selected' : ''}>历史有效</option><option value="待发布" ${versionFilter.status === '待发布' ? 'selected' : ''}>待发布</option></select>
      <input class="ai-strategy-inline-input" data-version-filter="keyword" value="${aiStrategyEsc(versionFilter.keyword)}" placeholder="搜索版本号 / DCC规则ID" aria-label="搜索版本号或DCC规则ID">
      <button type="button" class="ai-strategy-btn secondary" data-ai-action="search-versions">查询</button><button type="button" class="ai-strategy-btn secondary" data-ai-action="reset-version-filters">重置</button>
      <span class="ai-strategy-muted">匹配 ${visibleVersions.length} / ${publishedVersions.length} 个版本；维度和匹配值按本次变更规则查找</span></div>
    <div class="ai-strategy-table-wrap"><table class="ai-strategy-table ai-strategy-versions-table"><thead><tr><th>正式版本号</th><th>来源</th><th>建议批次号</th><th>规则总数 / 本次变更</th><th>本次 DCC 规则ID</th><th>接口结果</th><th>状态</th><th>生效时间</th><th>发布操作人</th><th>操作</th></tr></thead><tbody>${pageVersions.map(version => `<tr><td><strong>${aiStrategyEsc(version.id)}</strong></td><td>${aiStrategyEsc(version.sourceType || version.source)}</td><td>${aiStrategyEsc(version.agentRecommendationId || '—')}</td><td>${aiStrategyVersionRules(version).length} / ${version.changedRuleCount ?? '未记录'}${aiStrategyVersionChangedSummary(version)}</td><td>${aiStrategyEsc(version.dccRuleIds?.join('、') || '未记录')}</td><td>${aiStrategyEsc(version.apiStatus === '模拟成功（待联调）' ? '发布成功' : version.apiStatus || '—')}</td><td>${aiStrategyEsc(version.status === '演示生效' ? '当前生效' : version.status)}</td><td>${aiStrategyEsc(version.publishAt || version.time)}</td><td>${aiStrategyEsc(version.operator || '未记录')}</td><td><button type="button" class="ai-strategy-text-btn" data-ai-action="view-version" data-ai-value="${aiStrategyEsc(version.id)}">查看详情</button>${version.status === '历史有效' ? ` <button type="button" class="ai-strategy-text-btn" data-ai-action="select-rollback-version" data-ai-value="${aiStrategyEsc(version.id)}">选择回滚</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="10" class="ai-strategy-empty">没有符合条件的发布版本，请调整查询条件</td></tr>'}</tbody></table></div>
    <div class="ai-strategy-pagination"><button type="button" class="ai-strategy-btn secondary" data-ai-action="version-page-prev" ${aiStrategyState.versionPage <= 1 ? 'disabled' : ''}>上一页</button><span>第 ${aiStrategyState.versionPage} / ${totalPages} 页，共 ${visibleVersions.length} 个版本</span><button type="button" class="ai-strategy-btn secondary" data-ai-action="version-page-next" ${aiStrategyState.versionPage >= totalPages ? 'disabled' : ''}>下一页</button><select class="ai-strategy-inline-select" data-version-filter="pageSize" aria-label="每页版本数"><option value="20" ${pageSize === 20 ? 'selected' : ''}>20条/页</option><option value="50" ${pageSize === 50 ? 'selected' : ''}>50条/页</option></select></div>${detailHtml}
    </section>
    <section class="ai-strategy-card"><div class="ai-strategy-section-head"><div><h3>创建回滚版本</h3><p>从上方选择历史版本后，目标和差异自动带入；核对范围、填写原因，再生成待发布版本。</p></div><div class="ai-strategy-section-head-actions">${aiStrategyPlanDocButton()}${aiStrategyHelpButton('versions')}</div></div>
      <div class="ai-strategy-config-form ai-rollback-form"><label>回滚目标版本<select id="aiRollbackTarget"><option value="">请选择历史有效版本</option>${historical.map(item => `<option value="${aiStrategyEsc(item.id)}" ${choice.targetId === item.id ? 'selected' : ''}>${aiStrategyEsc(item.id)}</option>`).join('')}</select></label>
      <label>回滚范围<select id="aiRollbackScope"><option value="FULL" ${choice.scope === 'FULL' ? 'selected' : ''}>整套分派规则（含低效关联）</option><option value="DIMENSION" ${choice.scope === 'DIMENSION' ? 'selected' : ''}>单个规则维度</option><option value="RULE" ${choice.scope === 'RULE' ? 'selected' : ''}>单条规则</option></select></label>
      <label>规则维度<select id="aiRollbackDimension" ${choice.scope === 'FULL' ? 'disabled' : ''}><option value="">${choice.scope === 'FULL' ? '整套回滚无需选择' : '请选择规则维度'}</option>${choice.scope === 'FULL' ? '' : aiStrategyRouteOrder.map(name => `<option value="${name}" ${choice.dimension === name ? 'selected' : ''}>${name}</option>`).join('')}</select></label>
      <label class="${choice.scope === 'RULE' ? '' : 'ai-rollback-rule-hidden'}">目标规则<select id="aiRollbackRule" ${choice.scope === 'RULE' ? '' : 'disabled'}><option value="">请选择具体规则</option>${selectableRules.map(rule => `<option value="${aiStrategyEsc(aiStrategyRuleKey(rule))}" ${choice.ruleKey === aiStrategyRuleKey(rule) ? 'selected' : ''}>${aiStrategyEsc(rule.dimension)} / ${aiStrategyEsc(rule.value)}${rule.ruleId ? ` (${aiStrategyEsc(rule.ruleId)})` : ''}</option>`).join('')}</select></label>
      <label>回滚原因<input type="text" id="aiRollbackReason" maxlength="100" placeholder="请说明回滚原因" value="${aiStrategyEsc(choice.reason)}"></label></div>
      <div class="ai-rollback-quick-tags"><span class="ai-rollback-quick-label">常用原因：</span><button type="button" class="ai-rollback-quick-tag" data-ai-action="set-rollback-reason" data-ai-value="业务指标波动，紧急恢复稳定版本">业务指标波动恢复</button><button type="button" class="ai-rollback-quick-tag" data-ai-action="set-rollback-reason" data-ai-value="规则配置误操作，恢复上个有效版本">规则误操作恢复</button><button type="button" class="ai-rollback-quick-tag" data-ai-action="set-rollback-reason" data-ai-value="策略效果未达预期，回退至历史有效规则">策略效果不及预期</button></div>
      <div class="ai-strategy-actions"><button type="button" class="ai-strategy-btn secondary" data-ai-action="preview-rollback" ${historical.length ? '' : 'disabled'}>${rollback ? '重新预览回滚差异' : '预览回滚差异'}</button></div>
      ${preview.length ? `<div class="ai-strategy-table-wrap"><table class="ai-strategy-table ai-strategy-rollback-preview-table"><thead><tr><th>规则维度 / 规则ID</th><th>当前生效 ${aiStrategyEsc(current.id)}</th><th>历史目标 ${aiStrategyEsc(target.id)}</th><th>回滚后</th></tr></thead><tbody>${preview.map(row => `<tr><td>${aiStrategyEsc(row.dimension)}<small class="ai-strategy-rule-ref">${aiStrategyEsc(row.ruleId)}</small></td><td>${aiStrategyEsc(row.currentValue)}：${aiStrategyEsc(row.current)}</td><td>${aiStrategyEsc(row.targetValue)}：${aiStrategyEsc(row.target)}</td><td>${aiStrategyEsc(row.targetValue)}：${aiStrategyEsc(row.target)}</td></tr>`).join('')}</tbody></table></div><p class="ai-strategy-muted">已自动带入 ${aiStrategyEsc(target.id)}，本次将变更 ${rollback.changedCount} 条；其余规则沿用当前生效版本。请填写回滚原因后生成待发布版本。</p><div class="ai-strategy-actions"><button type="button" class="ai-strategy-btn primary" data-ai-action="create-rollback">生成待发布回滚版本</button></div>` : rollback ? '<p class="ai-strategy-muted">所选范围与当前生效版本没有差异，无需回滚。</p>' : ''}
      ${pending ? `<div class="ai-strategy-feedback is-success"><strong>${aiStrategyEsc(pending.id)}</strong> 已生成，状态：待发布；从 ${aiStrategyEsc(pending.targetVersionId || '历史版本')} 恢复 ${pending.changedRuleCount || 0} 条规则。发布后只影响新线索，已分派任务不重新分派。</div><div class="ai-strategy-actions"><button type="button" class="ai-strategy-btn primary" data-ai-action="publish-rollback">确认发布回滚版本</button><button type="button" class="ai-strategy-btn secondary" data-ai-action="cancel-rollback">取消待发布回滚</button></div>` : ''}
    </section><section class="ai-strategy-card"><h3>操作留痕</h3><div class="ai-strategy-audit">${aiStrategyState.audit.length ? aiStrategyState.audit.map(log => `<div><span>${aiStrategyEsc(log.time)}</span><b>${aiStrategyEsc(log.operator || '未记录')}：${aiStrategyEsc(log.action)}</b></div>`).join('') : '<p class="ai-strategy-empty">暂无操作记录。</p>'}</div></section>`;
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
  aiStrategyLog(`新增低效对象配置：${fields.dimension} / ${linkedRule.name}（${linkedRule.id}）`);
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
  aiStrategyLog('保存评分参数');
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
  if (aiStrategyState.sourceSettled === false || !aiStrategyState.capacity || !Number.isFinite(Number(aiStrategyState.capacity.planMax))) {
    aiStrategyNotice('业务数据未结算或容量数据缺失，未生成新建议；已有待审核建议保持可审。');
    return;
  }
  if (!aiStrategyState.weights || !aiStrategyState.targets || aiStrategyState.targets.some(value => !(Number(value) > 0))) {
    aiStrategyState.weights = [15, 15, 15, 15, 10, 15, 15];
    aiStrategyState.targets = [...aiStrategyDemoTargets];
  }
  if (!aiStrategyState.gradeConfig) {
    aiStrategyState.gradeConfig = { thresholds: { H: 70, A: 60, B: 50 }, directions: { H: '优先建议人工', A: '优先建议人工', B: '按容量动态建议', C: '优先建议AI' } };
  }
  if (!aiStrategyState.draft) aiStrategyRenderDrafts();
  const id = `DEMO-${Date.now()}`;
  const receivedAt = new Date().toLocaleString('zh-CN', { hour12: false });
  const newDraft = { id, receivedAt, businessDate: aiStrategyBusinessDate(), name: '线索分派策略建议', status: '演示草案', createdAt: receivedAt, gradeConfig: { thresholds: { ...aiStrategyState.gradeConfig.thresholds }, directions: { ...aiStrategyState.gradeConfig.directions } }, rows: aiStrategyCalculatedDemoRows().map(row => ({ ...row, reviewStatus: row.reviewStatus || '待审核', agentRecommended: row.agentRecommended || row.recommended, habc: row.habc ? { ...row.habc } : null, aiMode: row.aiMode || '', aiPolicyId: row.aiPolicyId || '', aiType: row.aiType || '' })), selected: [] };
  if (!newDraft.rows.some(row => row.reviewStatus === '待审核')) { aiStrategyNotice('本批次未生成有效建议，已有待审核建议保持可审。'); return; }
  aiStrategyRecordReceived(newDraft, receivedAt);
  newDraft.rows.forEach(aiExecutionEnsure);
  aiStrategySupersedeOldRows(newDraft);
  aiStrategyState.drafts.unshift(newDraft);
  aiStrategyState.draft = newDraft;
  aiStrategyState.draftFilters = { draftId: id, dimension: '', value: '', status: '全部', ratioFilter: '' };
  aiStrategyLog(`生成 ${id} 策略建议`);
  renderAiStrategyWorkbench();
  aiStrategyNotice('策略建议已接收，可查看各对象明细并提交审核。', true);
}

function aiStrategyTransition(status, action) {
  if (!aiStrategyState.draft) return;
  aiStrategyState.draft.status = status;
  aiStrategyLog(action);
  renderAiStrategyWorkbench();
  aiStrategyNotice(`${action}。`, true);
}

function aiStrategyValidateDraftSelections(targetRows = null) {
  const rows = targetRows || aiStrategySelectedDraft()?.rows || [];
  const invalid = rows.find(row => row.reviewStatus !== '无需审核' && aiExecutionResult(row).error);
  if (invalid) {
    aiStrategyNotice(`【${invalid.dimension}=${invalid.value}】${aiExecutionResult(invalid).error}`);
    return false;
  }
  return true;
}

function aiStrategySelectRollbackVersion(targetId, scrollToForm = false) {
  if (!targetId) {
    aiStrategyState.rollbackSelection = { targetId: '', scope: 'FULL', dimension: '', ruleKey: '', reason: '', previewBaseVersionId: '' };
    renderAiStrategyWorkbench();
    return;
  }
  const target = aiStrategyState.versions.find(item => item.id === targetId && item.status === '历史有效' && !item.internalBaseline);
  const current = aiStrategyCurrentVersion();
  if (!target || !current) { aiStrategyNotice('请选择可回滚的历史有效版本。'); return; }
  aiStrategyState.rollbackSelection = { targetId: target.id, scope: 'FULL', dimension: '', ruleKey: '', reason: '', previewBaseVersionId: current.id };
  const rollback = aiStrategyRollbackData(current, target, aiStrategyState.rollbackSelection);
  aiStrategyState.versionDetailId = '';
  renderAiStrategyWorkbench();
  aiStrategyNotice(rollback?.changedCount ? `已带入 ${target.id} 的整套规则，下方已显示 ${rollback.changedCount} 条差异；请填写回滚原因。` : '该版本与当前生效版本相同，无需回滚。', Boolean(rollback?.changedCount));
  if (scrollToForm) document.getElementById('aiRollbackTarget')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function aiStrategyPreviewRollback() {
  const targetId = document.getElementById('aiRollbackTarget').value;
  const scope = document.getElementById('aiRollbackScope').value;
  const dimension = document.getElementById('aiRollbackDimension').value;
  const ruleKey = document.getElementById('aiRollbackRule').value;
  const reason = document.getElementById('aiRollbackReason').value.trim();
  const target = aiStrategyState.versions.find(item => item.id === targetId && item.status === '历史有效' && !item.internalBaseline);
  const current = aiStrategyCurrentVersion();
  if (!target) { aiStrategyNotice('请选择历史有效版本，不能选择当前、停用或异常版本。'); return; }
  if (scope !== 'FULL' && !dimension) { aiStrategyNotice('请选择要恢复的规则维度。'); return; }
  if (scope === 'RULE' && !ruleKey) { aiStrategyNotice('请选择要恢复的具体规则。'); return; }
  const selection = { targetId, scope, dimension: scope === 'FULL' ? '' : dimension, ruleKey: scope === 'RULE' ? ruleKey : '', reason, previewBaseVersionId: current?.id || '' };
  const rollback = aiStrategyRollbackData(current, target, selection);
  if (!rollback) { aiStrategyNotice('所选规则在当前版或历史版中不存在，不能单条回滚；请重新选择。'); return; }
  if (!rollback.changedCount) { aiStrategyNotice('所选范围与当前生效版相同，无需生成回滚版本。'); return; }
  aiStrategyState.rollbackSelection = selection;
  renderAiStrategyWorkbench();
  aiStrategyNotice(`回滚差异已生成：将变更 ${rollback.changedCount} 条规则，其余规则保留当前版本。`, true);
}

function aiStrategyCreateRollback() {
  if (!aiStrategyCanPublish()) { aiStrategyNotice('当前帐号无回滚权限。'); return; }
  const choice = aiStrategyState.rollbackSelection;
  const current = aiStrategyCurrentVersion();
  const target = aiStrategyState.versions.find(item => item.id === choice.targetId && item.status === '历史有效' && !item.internalBaseline);
  if (!current || !target || choice.previewBaseVersionId !== current.id) { aiStrategyNotice('回滚预览已失效，请重新选择并预览。'); return; }
  if (!String(choice.reason || '').trim()) { aiStrategyNotice('请填写回滚原因后再生成回滚版本。'); document.getElementById('aiRollbackReason')?.focus(); return; }
  if (aiStrategyState.pendingRollbackId) { aiStrategyNotice('已有待发布的回滚版本，请先完成该版本。'); return; }
  const rollback = aiStrategyRollbackData(current, target, choice);
  if (!rollback?.changedCount) { aiStrategyNotice('目标规则已变化或当前版无差异，请重新预览。'); return; }
  const id = `V-DEMO-RB-${aiStrategyState.versions.length + 1}`;
  const scopeLabel = choice.scope === 'FULL' ? '整套' : choice.scope === 'DIMENSION' ? `${choice.dimension}维度` : `${choice.dimension}单条规则`;
  aiStrategyState.versions.unshift({ id, source: `${target.id} · ${scopeLabel}回滚`, status: '待发布', time: new Date().toLocaleString('zh-CN', { hour12: false }), snapshot: rollback.snapshot, rules: rollback.rules, lowEfficiency: rollback.lowEfficiency, baseLowEfficiencySignature: aiStrategyLowEfficiencySignature(aiStrategyState.lowEfficiency), baseVersionId: current.id, targetVersionId: target.id, changedRuleCount: rollback.changedCount, rollbackScope: choice.scope, rollbackRuleKey: choice.ruleKey, reason: choice.reason, operator: aiStrategyCurrentAccountName() });
  aiStrategyState.pendingRollbackId = id;
  aiStrategyState.rollbackSelection = { targetId: '', scope: 'FULL', dimension: '', ruleKey: '', reason: '', previewBaseVersionId: '' };
  aiStrategyLog(`创建待发布回滚版本 ${id}；从 ${target.id} 恢复 ${rollback.changedCount} 条规则；原因：${choice.reason}`);
  renderAiStrategyWorkbench();
  aiStrategyNotice(`${id} 已生成，但尚未生效。`, true);
}

function aiStrategyPublishRollback() {
  if (!aiStrategyCanPublish()) { aiStrategyNotice('当前帐号无发布权限。'); return; }
  const pending = aiStrategyState.versions.find(item => item.id === aiStrategyState.pendingRollbackId && item.status === '待发布');
  const current = aiStrategyCurrentVersion();
  if (!pending || !current || current.id !== pending.baseVersionId) { aiStrategyNotice('当前生效版本已变化，请重新创建回滚版本。'); return; }
  if (pending.baseLowEfficiencySignature !== aiStrategyLowEfficiencySignature(aiStrategyState.lowEfficiency)) { aiStrategyNotice('低效关联清单已变化，请取消待发布版本并重新预览。'); return; }
  const executionRollback = aiExecutionPrepareRollback(pending, current);
  if (executionRollback.error) { aiStrategyNotice(executionRollback.error); return; }
  current.status = '历史有效';
  pending.status = '演示生效';
  if (pending.rollbackScope === 'FULL') aiStrategyState.lowEfficiency = pending.lowEfficiency.map(item => ({ ...item }));
  pending.publishAt = new Date().toLocaleString('zh-CN', { hour12: false });
  pending.operator = aiStrategyCurrentAccountName();
  const previousRules = new Map(aiStrategyVersionRules(current).map(rule => [aiStrategyRuleKey(rule), rule]));
  pending.dccRuleIds = [];
  pending.rules = (pending.rules || []).map((rule, index) => {
    const before = previousRules.get(aiStrategyRuleKey(rule));
    if (before?.content === rule.content) return rule;
    const dccRuleId = `DCC-RULE-DEMO-RB-${pending.id}-${index + 1}`;
    pending.dccRuleIds.push(dccRuleId);
    return { ...rule, dccRuleId };
  });
  const newRules = new Map(pending.rules.map(rule => [aiStrategyRuleKey(rule), rule]));
  const changedKeys = new Set([...previousRules.keys(), ...newRules.keys()].filter(key => previousRules.get(key)?.content !== newRules.get(key)?.content));
  aiStrategyState.locallyPublishedRuleKeys = [...new Set([...aiStrategyState.locallyPublishedRuleKeys, ...changedKeys])];
  aiExecutionSyncRollback(executionRollback, pending.publishAt, pending);
  pending.apiStatus = '模拟成功（待联调）';
  pending.sourceType = '历史版本回滚';
  aiStrategyState.pendingRollbackId = '';
  aiStrategyLog(`立即生效回滚版本 ${pending.id}；从 ${pending.targetVersionId} 恢复 ${pending.changedRuleCount} 条规则；仅影响之后的新线索`);
  renderAiStrategyWorkbench();
  aiStrategyNotice(`${pending.id} 已发布；DCC规则ID：${pending.dccRuleIds.join('、') || '无普通规则变更'}。历史版本未改写，已分派任务不重新分派。`, true);
}

function aiStrategyCancelRollback() {
  const id = aiStrategyState.pendingRollbackId;
  const index = aiStrategyState.versions.findIndex(item => item.id === id && item.status === '待发布');
  if (index < 0) { aiStrategyNotice('没有可取消的待发布回滚版本。'); return; }
  aiStrategyState.versions.splice(index, 1);
  aiStrategyState.pendingRollbackId = '';
  if (aiStrategyState.versionDetailId === id) aiStrategyState.versionDetailId = '';
  aiStrategyLog(`取消待发布回滚版本 ${id}`);
  renderAiStrategyWorkbench();
  aiStrategyNotice(`${id} 已取消，当前生效版本保持不变。`, true);
}

function aiStrategyReviewRow(index, result) {
  const draft = aiStrategySelectedDraft();
  const row = draft?.rows?.[index];
  if (!aiStrategyCanReviewRow(draft, row)) { aiStrategyNotice('该建议已被新批次替代或已归档，不能审核。'); return; }
  if (result === '通过') {
    if (!aiStrategyValidateDraftSelections([row])) return;
    if (!window.confirm(`确认审核通过并立即发布 ${row.dimension}/${row.value}？\n最终分配：${aiExecutionSummary(aiExecutionResult(row))}`)) return;
  }
  const reason = result === '驳回' ? window.prompt('请输入驳回原因（必填）：', '') : '';
  if (result === '驳回' && !String(reason || '').trim()) { aiStrategyNotice('驳回必须填写原因，未完成驳回。'); return; }
  if (!aiStrategyCanReviewRow(draft, row)) { aiStrategyNotice('提交前校验失败：该建议已不再是最新有效版本。'); return; }
  if (result === '通过') {
    if (!aiStrategyPublishReviewedRow(draft, row)) { aiStrategyNotice('审核发布未完成：请检查建议是否仍有效、是否存在待发布回滚版本及当前生效规则。'); return; }
  } else {
    row.reviewStatus = '已驳回';
    row.review = { reviewer: aiStrategyCurrentAccountName(), reviewedAt: new Date().toLocaleString('zh-CN', { hour12: false }), comment: String(reason).trim() };
    aiStrategyLog(`驳回建议：${row.dimension} / ${row.value}`);
  }
  renderAiStrategyWorkbench();
  if (result === '通过') aiStrategyNotice(`已发布 ${row.dimension}/${row.value}；DCC规则ID ${row.dccRuleId}，版本 ${row.publishedVersionId}。`, true, 6000);
}
function aiStrategyBulkReview(allVisible) {
  const draft = aiStrategySelectedDraft(); if (!draft) return;
  const visible = aiStrategyFilteredDraftRows(draft).filter(({row, index}) => aiStrategyCanReviewRow(draft, row) && (allVisible || (draft.selected || []).includes(index)));
  if (!visible.length) { aiStrategyNotice('没有可审核的待审核建议。'); return; }
  if (!aiStrategyValidateDraftSelections(visible.map(item => item.row))) return;
  if (!window.confirm(`确认逐条审核并发布 ${visible.length} 条建议到 DCC？每条成功发布都形成独立版本。`)) return;
  if (!visible.every(({row}) => aiStrategyCanReviewRow(draft, row))) { aiStrategyNotice('提交前校验失败：部分建议已被新批次替代，请刷新后重试。'); return; }
  let published = 0;
  visible.forEach(({row}) => { if (aiStrategyPublishReviewedRow(draft, row, '批量审核通过')) published += 1; });
  draft.selected = [];
  renderAiStrategyWorkbench();
  aiStrategyNotice(`已逐条发布 ${published}/${visible.length} 条；每条成功记录独立版本和 DCC 规则 ID。`, published === visible.length, 6000);
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
    if (removed) aiStrategyLog(`移除低效对象配置：${removed.dimension} / ${removed.strategyName || removed.value}`);
    renderAiStrategyWorkbench(); aiStrategyNotice('低效对象关联已移除。', true); return;
  }
  if (action === 'remove-direct') {
    const removed = aiStrategyState.directLeadList.splice(Number(value), 1)[0];
    if (removed) aiStrategyLog(`移除直派标识：${removed.type} / ${removed.value}`);
    renderAiStrategyWorkbench(); aiStrategyNotice('直派标识已移除。', true); return;
  }
  if (action === 'reset-draft-filters') { aiStrategyState.draftFilters = { draftId: aiStrategySelectedDraft()?.id || '', dimension: '', value: '', status: '全部', ratioFilter: '' }; renderAiStrategyWorkbench(); return; }
  if (action === 'search-versions') { aiStrategyState.versionPage = 1; renderAiStrategyWorkbench(); return; }
  if (action === 'reset-version-filters') { aiStrategyState.versionFilter = { batchId: '', dimension: '', matchValue: '', status: '全部', keyword: '' }; aiStrategyState.versionPage = 1; renderAiStrategyWorkbench(); return; }
  if (action === 'version-page-prev') { aiStrategyState.versionPage = Math.max(1, aiStrategyState.versionPage - 1); renderAiStrategyWorkbench(); return; }
  if (action === 'version-page-next') { aiStrategyState.versionPage += 1; renderAiStrategyWorkbench(); return; }
  if (action === 'draft-page-prev') { aiStrategyState.draftPage = Math.max(1, (aiStrategyState.draftPage || 1) - 1); renderAiStrategyWorkbench(); return; }
  if (action === 'draft-page-next') { aiStrategyState.draftPage = (aiStrategyState.draftPage || 1) + 1; renderAiStrategyWorkbench(); return; }
  if (action === 'edit-row') { const draft = aiStrategySelectedDraft(); const row = draft?.rows?.[Number(value)]; if (!row || row.reviewStatus !== '已驳回' || row.supersededBy || aiStrategyIsArchived(draft) || aiStrategyLatestEntry(row)?.row !== row) { aiStrategyNotice('该建议已失效或已归档，不能修改。'); return; } row.reviewHistory = row.reviewHistory || []; if (row.review) row.reviewHistory.push(row.review); row.reviewStatus = '待审核'; row.review = null; draft.status = '演示草案'; aiStrategyLog(`修改后重审：${row.dimension} / ${row.value}`); renderAiStrategyWorkbench(); aiStrategyNotice('该条建议已恢复为待审核，可修改后重新提交。'); return; }
  if (action === 'approve-row') { aiStrategyReviewRow(Number(value), '通过'); return; }
  if (action === 'reject-row') { aiStrategyReviewRow(Number(value), '驳回'); return; }
  if (action === 'approve-selected') { aiStrategyBulkReview(false); return; }
  if (action === 'approve-all-visible') { aiStrategyBulkReview(true); return; }
  if (action === 'select-visible') { const draft = aiStrategySelectedDraft(); const visible = [...event.target.closest('.ai-strategy-workbench').querySelectorAll('[data-ai-row-select]')].filter(input => !input.disabled).map(input => Number(input.dataset.aiRowSelect)); if (draft) { const selected = new Set(draft.selected || []); visible.forEach(index => { if (event.target.checked) selected.add(index); else selected.delete(index); }); draft.selected = [...selected]; } renderAiStrategyWorkbench(); return; }
  if (action === 'generate-draft') { aiStrategyGenerateDraft(); return; }
  if (action === 'view-version') { if (!aiStrategyState.versions.some(item => item.id === value && !item.internalBaseline)) return; aiStrategyState.versionDetailId = value; aiStrategyState.versionDetailShowAll = false; aiStrategyState.versionDetailFilter = { dimension: '', value: '' }; renderAiStrategyWorkbench(); return; }
  if (action === 'toggle-version-detail-scope') { aiStrategyState.versionDetailShowAll = !aiStrategyState.versionDetailShowAll; aiStrategyState.versionDetailFilter = { dimension: '', value: '' }; renderAiStrategyWorkbench(); return; }
  if (action === 'close-version-detail') { aiStrategyState.versionDetailId = ''; return renderAiStrategyWorkbench(); }
  if (action === 'rollback-rule') {
    const target = aiStrategyState.versions.find(item => item.id === aiStrategyState.versionDetailId && item.status === '历史有效' && !item.internalBaseline);
    const rule = target ? aiStrategyVersionRules(target).find(item => aiStrategyRuleKey(item) === value) : null;
    const current = aiStrategyCurrentVersion();
    if (!rule || !current || !aiStrategyVersionRules(current).some(item => aiStrategyRuleKey(item) === value)) { aiStrategyNotice('该规则在当前版或历史版中不存在，无法单条回滚。'); return; }
    aiStrategyState.rollbackSelection = { targetId: target.id, scope: 'RULE', dimension: rule.dimension, ruleKey: value, reason: '', previewBaseVersionId: current.id };
    const rollback = aiStrategyRollbackData(current, target, aiStrategyState.rollbackSelection);
    aiStrategyState.versionDetailId = '';
    renderAiStrategyWorkbench();
    aiStrategyNotice(rollback?.changedCount ? `已带入 ${target.id} 的 ${rule.dimension} / ${rule.value}，下方已显示 ${rollback.changedCount} 条差异；请填写回滚原因。` : '这条规则与当前生效版本相同，无需回滚。', Boolean(rollback?.changedCount));
    document.getElementById('aiRollbackRule')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (action === 'select-rollback-version') {
    aiStrategySelectRollbackVersion(value, true);
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
  if (action === 'cancel-rollback') { aiStrategyCancelRollback(); return; }
});

document.addEventListener('change', event => {
  const rowCheckbox = event.target.closest?.('[data-ai-row-select]');
  if (rowCheckbox?.closest('.ai-strategy-workbench')) {
    const draft = aiStrategySelectedDraft();
    const index = Number(rowCheckbox.dataset.aiRowSelect);
    if (!draft || !aiStrategyCanReviewRow(draft, draft.rows[index])) { renderAiStrategyWorkbench(); return; }
    const selected = new Set(draft.selected || []);
    if (rowCheckbox.checked) selected.add(index); else selected.delete(index);
    draft.selected = [...selected];
    renderAiStrategyWorkbench();
    return;
  }
  if (event.target.id === 'aiRollbackScope') {
    aiStrategyState.rollbackSelection.scope = event.target.value;
    aiStrategyState.rollbackSelection.dimension = '';
    aiStrategyState.rollbackSelection.ruleKey = '';
    aiStrategyState.rollbackSelection.previewBaseVersionId = '';
    renderAiStrategyWorkbench();
    return;
  }
  if (event.target.id === 'aiRollbackTarget') {
    aiStrategySelectRollbackVersion(event.target.value);
    return;
  }
  if (event.target.id === 'aiRollbackDimension') {
    aiStrategyState.rollbackSelection.dimension = event.target.value;
    aiStrategyState.rollbackSelection.ruleKey = '';
    aiStrategyState.rollbackSelection.previewBaseVersionId = '';
    renderAiStrategyWorkbench();
    return;
  }
  if (event.target.id === 'aiRollbackRule') {
    aiStrategyState.rollbackSelection.ruleKey = event.target.value;
    aiStrategyState.rollbackSelection.previewBaseVersionId = '';
    return;
  }
  const filter = event.target.closest('[data-ai-filter]');
  if (filter && filter.closest('.ai-strategy-workbench')) {
    aiStrategyState.draftFilters = aiStrategyState.draftFilters || { draftId: '', dimension: '', value: '', status: '全部', ratioFilter: '' };
    if (filter.dataset.aiFilter === 'pageSize') { aiStrategyState.draftPageSize = Number(filter.value) || 10; aiStrategyState.draftPage = 1; } else { aiStrategyState.draftFilters[filter.dataset.aiFilter] = filter.value; aiStrategyState.draftPage = 1; if (filter.dataset.aiFilter === 'draftId') { aiStrategyState.draftFilters.dimension = ''; aiStrategyState.draftFilters.value = ''; aiStrategyState.draftFilters.status = '全部'; aiStrategyState.draftFilters.ratioFilter = ''; } }
    renderAiStrategyWorkbench();
    return;
  }
  if (event.target.id === 'aiLowEfficiencyDimension' || event.target.id === 'aiLowEfficiencyStrategy') {
    aiStrategyPopulateLowEfficiencyStrategies();
    return;
  }
  const detailFilter = event.target.closest('[data-version-detail-filter]');
  if (detailFilter) { aiStrategyState.versionDetailFilter[detailFilter.dataset.versionDetailFilter] = detailFilter.value; renderAiStrategyWorkbench(); return; }
  const versionFilter = event.target.closest('[data-version-filter]');
  if (versionFilter) {
    if (versionFilter.dataset.versionFilter === 'pageSize') aiStrategyState.versionPageSize = Number(versionFilter.value) || 20;
    else aiStrategyState.versionFilter[versionFilter.dataset.versionFilter] = versionFilter.value;
    if (versionFilter.tagName === 'INPUT') return;
    aiStrategyState.versionPage = 1;
    renderAiStrategyWorkbench();
    return;
  }
});

document.addEventListener('keydown', event => {
  const field = event.target.closest?.('[data-version-filter="matchValue"], [data-version-filter="keyword"]');
  if (event.key !== 'Enter' || !field?.closest('.ai-strategy-workbench')) return;
  event.preventDefault();
  aiStrategyState.versionFilter[field.dataset.versionFilter] = field.value;
  aiStrategyState.versionPage = 1;
  renderAiStrategyWorkbench();
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
  if (versionFilter && versionFilter.tagName === 'INPUT') { aiStrategyState.versionFilter[versionFilter.dataset.versionFilter] = input.value; return; }
  const filter = input.closest('[data-ai-filter]');
  if (filter) {
    aiStrategyState.draftFilters = aiStrategyState.draftFilters || { draftId: '', dimension: '', value: '', status: '全部', ratioFilter: '' };
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
  aiStrategyLog(`新增直派标识：${fields.type} / ${value}`);
  renderAiStrategyWorkbench(); aiStrategyNotice('直派标识已加入。', true);
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
  aiStrategyNotice('容量口径已保存。', true);
}

function aiStrategySaveCapacity() {
  const ids = ['planMax', 'minNew', 'followUpDue', 'assignedNew', 'otherOpen'];
  const values = Object.fromEntries(ids.map(key => [key, document.getElementById(`aiCapacity${key.charAt(0).toUpperCase()}${key.slice(1)}`)?.value.trim() || '']));
  const invalid = ids.some(key => !aiStrategyPositiveInteger(values[key]));
  if (invalid) { aiStrategyNotice('容量字段必须填写大于 0 的整数。'); return; }
  aiStrategyState.capacity = Object.fromEntries(ids.map(key => [key, Number(values[key])]));
  const remaining = Math.max(0, aiStrategyState.capacity.planMax - aiStrategyState.capacity.followUpDue - aiStrategyState.capacity.assignedNew);
  aiStrategyLog(`重算容量，实时剩余容量：${remaining}`);
  renderAiStrategyWorkbench();
  aiStrategyNotice(`容量已重算：今日剩余人工容量 ${remaining} 条。`, true);
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeLeadAllocationPlanDocModal();
  }
});

