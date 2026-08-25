// ===== 培育任务工作台（原型） =====
const nurtureTaskQueues = [
  { id: 'new', name: '新任务', count: 3 },
  { id: 'today', name: '当日跟进', count: 2 },
  { id: 'overdue', name: '逾期任务', count: 4 },
  { id: 'future', name: '未来任务', count: 6 }
];

const nurtureTaskItems = [
  { id: 'NT-202607290001', queue: 'overdue', customer: '陈先生', phone: '158****9999', series: 'N6', level: 'H', due: '已逾期 1 天', channel: 'AI智能外呼', status: '暂缓', source: '总部冷线索', store: '广州东风日产天河店', city: '广州', project: '新能源小程序预约试驾', last: '2026-07-28 15:30', note: '关注续航和置换补贴，建议优先回访。' },
  { id: 'NT-202607290002', queue: 'overdue', customer: '赵女士', phone: '185****1111', series: 'N7', level: 'H', due: '已逾期 2 小时', channel: '人工外呼', status: '待跟进', source: '门店冷线索', store: '上海东风日产浦东店', city: '上海', project: 'N7新品上市线索', last: '2026-07-29 09:00', note: '上次接通未完成需求确认。' },
  { id: 'NT-202607290003', queue: 'overdue', customer: '王先生', phone: '136****2203', series: 'NX8', level: 'M', due: '已逾期 4 小时', channel: 'AI智能外呼', status: '暂缓', source: '三无忧线索', store: '深圳东风日产福田店', city: '深圳', project: '暑期购车活动', last: '2026-07-28 17:20', note: '等待客户确认到店日期。' },
  { id: 'NT-202607290004', queue: 'today', customer: '刘女士', phone: '139****8216', series: '轩逸', level: 'M', due: '今日 15:30', channel: '人工外呼', status: '待跟进', source: '门店冷线索', store: '成都东风日产高新店', city: '成都', project: '金融方案咨询', last: '2026-07-29 10:15', note: '意向金融分期方案。' },
  { id: 'NT-202607290005', queue: 'new', customer: '周先生', phone: '137****6880', series: '天籁', level: 'L', due: '今日 16:00', channel: 'AI智能外呼', status: '新任务', source: '总部冷线索', store: '杭州东风日产西湖店', city: '杭州', project: '夏季试驾招募', last: '—', note: '首次跟进，需确认购车计划。' }
];

let activeNurtureTaskQueue = 'overdue';
let activeNurtureTaskId = 'NT-202607290001';
let activeNurtureTaskSideTab = 'records';
let nurtureTaskProfileExpanded = false;

function showNurtureTaskPage() {
  hideLeadPages();
  setStrategyConfigTabsVisible(false);
  setManualAiConfigTabsVisible(false);
  setExcellentConfigManageTabsVisible(false);
  document.querySelector('nav[aria-label="培育策略三级菜单"]')?.classList.add('hidden');
  document.querySelector('.leads-nav')?.classList.remove('show');
  document.querySelector('.reports-nav')?.classList.remove('show');
  document.querySelector('.ops-nav')?.classList.remove('show');
  setSidebarActiveByName('培育任务');
  setPolicyContentVisible(false);
  setPageName('NEV培育 / 培育任务');
  document.getElementById('designStage')?.classList.remove('show');
  document.getElementById('nurtureTaskPage')?.classList.add('show');
  renderNurtureTaskPage();
}

function getActiveNurtureTask() {
  return nurtureTaskItems.find(item => item.id === activeNurtureTaskId) || nurtureTaskItems[0];
}

function renderNurtureTaskLeadDetail(task) {
  const groups = [
    {
      title: '基础信息',
      fields: [
        ['线索类型', task.leadType || '一般留资线索'], ['首次线索状态', task.firstStatus || '培育中'],
        ['跟进次数', task.followCount || '—'], ['意向门店', task.store || '—'], ['车系车型', task.vehicleModel || '—'], ['VIN码', task.vin || '—']
      ]
    },
    {
      title: '来源与意向信息',
      fields: [
        ['IP归属地', task.ipLocation || task.city || '—'], ['线索来源', task.source], ['首次意向级别', task.firstLevel || task.level],
        ['最新意向车系', task.series], ['留资时间', task.createdAt || '2026-07-29 09:00:00'], ['线索描述', task.description || '—'],
        ['购车时间', task.purchaseTime || '—'], ['购车门店', task.purchaseStore || '—'], ['线索备注', task.leadRemark || '—']
      ]
    },
    {
      title: '业务标识信息',
      fields: [
        ['线索编码', task.leadCode || '1789848611849150571'], ['渠道名称', task.channelName || 'R3-天网行动'], ['大项目名', task.project],
        ['任务编码', task.taskCode || task.id], ['媒体名称', task.mediaName || '百度有驾'], ['是否AI外呼过', task.aiCalled || '否']
      ]
    }
  ];
  return groups.map(group => `<div class="nurture-profile-block"><h4>${group.title}</h4><dl>${group.fields.map(([label, value]) => `<dt>${label}</dt><dd title="${value}">${value}</dd>`).join('')}</dl></div>`).join('');
}

function renderNurtureTaskPage() {
  const page = document.getElementById('nurtureTaskPage');
  if (!page) return;
  const task = getActiveNurtureTask();
  const queueTasks = nurtureTaskItems.filter(item => item.queue === activeNurtureTaskQueue);
  page.innerHTML = `
    <div class="nurture-task-page-head">
      <div><div class="page-title">培育任务</div><div class="page-desc">按优先级处理待跟进线索，在同一工作台完成沟通、回访和客户信息查看。</div><div class="nurture-task-summary"><span>待处理 <b>11</b></span><span class="warning">逾期 <b>4</b></span><span>今日已完成 <b>8</b></span></div></div>
      <div class="nurture-task-head-actions">
        <button class="btn-secondary" type="button" style="background:#fff7ed; color:#c2410c; border-color:#ffedd5; font-weight:600;" onclick="openNurturePopScreenModal()">📞 模拟坐席接听弹屏 (场景A/C代跟进)</button>
        <button class="btn-secondary" type="button" data-nurture-task-action="toggle-profile">${nurtureTaskProfileExpanded ? '收起辅助信息' : '查看客户信息'}</button>
        <button class="btn-secondary" type="button" data-nurture-task-action="refresh">刷新任务</button>
        <button class="btn-add" type="button" data-nurture-task-action="claim">领取任务</button>
      </div>
    </div>
    <div class="nurture-task-workspace ${nurtureTaskProfileExpanded ? 'profile-open' : 'profile-closed'}">
      <aside class="nurture-task-queue-panel">
        <div class="nurture-task-panel-head"><span>任务队列</span><input id="nurtureTaskSearch" class="lead-input" placeholder="客户/手机号" value="" /></div>
        <div class="nurture-task-queue-tabs">${nurtureTaskQueues.map(queue => `<button type="button" class="nurture-task-queue ${queue.id === activeNurtureTaskQueue ? 'active' : ''}" data-nurture-queue="${queue.id}"><span>${queue.name}</span><b>${queue.count}</b></button>`).join('')}</div>
        <div class="nurture-task-list" id="nurtureTaskList">${queueTasks.length ? queueTasks.map(item => `<button type="button" class="nurture-task-card ${item.id === task.id ? 'active' : ''}" data-nurture-task-id="${item.id}"><div class="nurture-task-card-top"><span class="nurture-task-status ${item.status === '暂缓' ? 'suspended' : ''}">${item.status}</span><span class="nurture-task-due ${item.due.includes('逾期') ? 'overdue' : ''}">${item.due}</span></div><div class="nurture-task-card-name">${item.customer}<span>${item.level}级</span></div><div class="nurture-task-card-phone">${item.phone} · ${item.series}</div><div class="nurture-task-card-meta">${item.channel}</div></button>`).join('') : '<div class="nurture-task-empty">当前队列暂无任务</div>'}</div>
      </aside>
      <main class="nurture-task-detail-panel">
        <div class="nurture-task-detail-head"><div><div class="nurture-task-customer">${task.customer}<span>${task.phone}</span></div><div class="nurture-task-subtitle">任务编号 ${task.id} · ${task.channel} · ${task.due}</div></div><div class="nurture-task-detail-state"><span class="nurture-task-level">意向 ${task.level}</span><span class="nurture-task-owner">当前处理人：张敏 ${task.isBackup ? `<b style="color:#c2410c; margin-left:4px;">(代跟进)</b>` : ''}</span></div></div>
        ${task.isBackup ? `<div style="background:#fff7ed; border:1px solid #ffedd5; color:#c2410c; padding:10px 14px; border-radius:6px; font-size:13px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between;"><span><strong>【代跟进任务】</strong> 原归属坐席：${task.originalOwner || '客服张三'}（超时自动转接）</span><span style="font-size:12px; opacity:0.9;">请查阅右侧历史记录接续沟通</span></div>` : ''}
        <div class="nurture-task-workflow"><span class="active">1. 查看线索</span><i></i><span>2. 沟通回访</span><i></i><span>3. 提交结果</span></div>
        <section class="nurture-task-section nurture-task-brief-section"><div class="nurture-task-section-title">跟进摘要</div><div class="nurture-task-brief-grid"><div><label>线索来源</label><strong>${task.source}</strong></div><div><label>意向门店</label><strong>${task.store}</strong></div><div><label>上次跟进</label><strong>${task.last}</strong></div><div><label>任务时效</label><strong class="${task.due.includes('逾期') ? 'warning' : ''}">${task.due}</strong></div></div><button class="nurture-task-detail-link" type="button" data-nurture-task-action="open-lead-detail">查看完整线索信息</button></section>
        <section class="nurture-task-section"><div class="nurture-task-section-title">沟通提示</div><div class="nurture-task-tip">${task.note}</div></section>
        <section class="nurture-task-section nurture-task-form-section"><div class="nurture-task-section-title">回访提交</div><div class="nurture-task-form-grid"><label>接触状态<select class="form-input"><option>请选择接触状态</option><option>已接通</option><option>未接通</option><option>拒接</option></select></label><label>回访结果<select class="form-input"><option>请选择回访结果</option><option>下次回访</option><option>有意向</option><option>待考虑</option><option>无意向</option></select></label><label>下次回访时间<input class="form-input" type="datetime-local" /></label><label>意向级别<select class="form-input"><option>${task.level}</option><option>H</option><option>M</option><option>L</option></select></label><label class="wide">本次沟通备注<textarea class="form-input" placeholder="记录客户需求、异议与后续跟进计划"></textarea></label></div><div style="font-size:12px; color:#1677ff; background:#e6f4ff; padding:6px 12px; border-radius:4px; margin-bottom:12px;">* 系统提示：保存下次回访时间后，系统将在预约时间自动发起预测外呼并发配坐席，无需手动拨号。</div><div class="nurture-task-form-actions"><button class="btn-secondary" type="button" data-nurture-task-action="emergency-call">手动紧急外拨</button><button class="btn-secondary" type="button" data-nurture-task-action="pause">暂缓任务</button><button class="btn-add" type="button" data-nurture-task-action="submit">提交回访</button></div></section>
      </main>
      ${nurtureTaskProfileExpanded ? `<aside class="nurture-task-profile-panel"><div class="nurture-task-profile-head"><span>客户辅助信息</span><button type="button" data-nurture-task-action="toggle-profile" aria-label="收起客户辅助信息">×</button></div><div class="nurture-task-profile-tabs"><button class="${activeNurtureTaskSideTab === 'records' ? 'active' : ''}" data-nurture-side-tab="records">回访记录</button><button class="${activeNurtureTaskSideTab === 'profile' ? 'active' : ''}" data-nurture-side-tab="profile">客户档案</button><button class="${activeNurtureTaskSideTab === 'lead' ? 'active' : ''}" data-nurture-side-tab="lead">线索详情</button><button class="${activeNurtureTaskSideTab === 'insight' ? 'active' : ''}" data-nurture-side-tab="insight">AI画像</button></div><div class="nurture-task-profile-content">${renderNurtureTaskSidePanel(task)}</div></aside>` : ''}
    </div>`;
  bindNurtureTaskPageEvents();
}

function openNurturePopScreenModal() {
  document.getElementById('leadDispatchRuleModalTitle').textContent = '📞 坐席接听弹屏 - 场景 A/C 差异化弹屏体验';
  document.getElementById('leadDispatchRuleModalBody').innerHTML = `
    <div class="dispatch-rule-form">
      <div style="background:#fff7ed; border:1px solid #ffedd5; border-radius:8px; padding:14px 18px; margin-bottom:16px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <div style="font-size:15px; font-weight:700; color:#c2410c; display:flex; align-items:center; gap:8px;">
            <span>⚠️【代跟进任务强提醒】</span>
            <span style="font-size:12px; background:#ffedd5; color:#9a3412; padding:2px 8px; border-radius:12px; font-weight:600;">超时自动转接</span>
          </div>
          <span style="font-size:12px; color:#ea580c; font-weight:600;">● 通话中 00:15</span>
        </div>
        <div style="font-size:13px; color:#9a3412; line-height:1.6;">
          本线索原归属坐席为 <strong>客服张三</strong>，因原坐席忙碌且超过 30 分钟预设超时降级阀值，系统已根据回访预外呼降级规则自动将此呼通线索转接给您！请注意接续沟通。
        </div>
      </div>

      <section class="dispatch-form-section">
        <div class="dispatch-section-title">实时弹屏客户与工单摘要</div>
        <div class="dispatch-form-grid">
          <div class="form-group">
            <div class="form-label">客户姓名</div>
            <div style="font-size:14px; font-weight:700; color:#1f2937;">陈先生 <span style="font-size:12px; color:#6b7280; font-weight:normal;">(158****9999)</span></div>
          </div>
          <div class="form-group">
            <div class="form-label">意向级别 / 车系</div>
            <div style="font-size:14px; font-weight:700; color:#1677ff;">H级 / N6</div>
          </div>
          <div class="form-group">
            <div class="form-label">关联回访工单</div>
            <div style="font-size:13px; color:#374151;">WO-20260825-009 (待跟进)</div>
          </div>
          <div class="form-group">
            <div class="form-label">上一次回访记录</div>
            <div style="font-size:13px; color:#4b5563;">关注续航和置换补贴，约定今日到店试驾。</div>
          </div>
        </div>
      </section>
    </div>
  `;
  document.getElementById('leadDispatchRuleModalFooter').innerHTML = `
    <button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">挂断电话</button>
    <button class="btn-save" type="button" onclick="locateNurtureBackupTask()">一键定位代跟进任务并接续</button>
  `;
  document.getElementById('leadDispatchRuleModal').classList.add('show');
}

function locateNurtureBackupTask() {
  closeModal('leadDispatchRuleModal');
  activeNurtureTaskQueue = 'overdue';
  activeNurtureTaskId = 'NT-202607290001';
  const task = nurtureTaskItems.find(t => t.id === 'NT-202607290001');
  if (task) task.isBackup = true;
  renderNurtureTaskPage();
  showToast('已定位至该代跟进任务工作台，请接续沟通', true);
}

function renderNurtureTaskSidePanel(task) {
  if (activeNurtureTaskSideTab === 'lead') return renderNurtureTaskLeadDetail(task);
  if (activeNurtureTaskSideTab === 'profile') return `<div class="nurture-profile-block"><h4>客户档案</h4><dl><dt>客户姓名</dt><dd>${task.customer}</dd><dt>联系方式</dt><dd>${task.phone}</dd><dt>意向车系</dt><dd>${task.series}</dd><dt>意向门店</dt><dd>${task.store}</dd></dl><h4>购车关注点</h4><div class="nurture-tag-list"><span>续航</span><span>金融方案</span><span>到店试驾</span></div></div>`;
  if (activeNurtureTaskSideTab === 'insight') return `<div class="nurture-profile-block"><h4>AI画像</h4><div class="nurture-insight-score">${task.level}<small>意向等级</small></div><p>当前重点关注 ${task.series} 的产品配置与购车优惠，建议围绕到店试驾和金融方案推进。</p><h4>推荐沟通方向</h4><div class="nurture-tag-list"><span>试驾邀约</span><span>置换补贴</span><span>购车周期</span></div></div>`;
  return `<div class="nurture-profile-block"><h4>最近回访</h4><ol class="nurture-record-list"><li><b>2026-07-28 15:30</b><span>客户暂缓决策，关注续航与补贴政策。</span></li><li><b>2026-07-25 10:20</b><span>已接通，确认近期有购车计划。</span></li><li><b>2026-07-22 16:45</b><span>首次触达未接通。</span></li></ol></div>`;
}

function bindNurtureTaskPageEvents() {
  const page = document.getElementById('nurtureTaskPage');
  if (!page || page.dataset.bound === 'true') return;
  page.dataset.bound = 'true';
  page.addEventListener('click', event => {
    const queue = event.target.closest('[data-nurture-queue]');
    if (queue) { activeNurtureTaskQueue = queue.dataset.nurtureQueue; const first = nurtureTaskItems.find(item => item.queue === activeNurtureTaskQueue); if (first) activeNurtureTaskId = first.id; renderNurtureTaskPage(); return; }
    const task = event.target.closest('[data-nurture-task-id]');
    if (task) { activeNurtureTaskId = task.dataset.nurtureTaskId; renderNurtureTaskPage(); return; }
    const tab = event.target.closest('[data-nurture-side-tab]');
    if (tab) { activeNurtureTaskSideTab = tab.dataset.nurtureSideTab; renderNurtureTaskPage(); return; }
    const action = event.target.closest('[data-nurture-task-action]')?.dataset.nurtureTaskAction;
    if (action === 'toggle-profile') { nurtureTaskProfileExpanded = !nurtureTaskProfileExpanded; renderNurtureTaskPage(); return; }
    if (action === 'open-lead-detail') { nurtureTaskProfileExpanded = true; activeNurtureTaskSideTab = 'lead'; renderNurtureTaskPage(); return; }
    if (action === 'emergency-call') { showToast('已发起手动紧急外拨，预测外呼预约队列已自动撤销', true); return; }
    if (action === 'submit') showToast('回访结果已保存，下次回访任务已自动推送到预测外呼队列', true);
    if (action === 'pause') showToast('任务已暂缓，请后续重新安排跟进', true);
    if (action === 'claim') showToast('已领取当前队列中的首条任务', true);
    if (action === 'refresh') showToast('任务队列已刷新', true);
  });
}
