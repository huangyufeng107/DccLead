/**
 * DCC培育平台 - 统计报表 > 人工坐席工单
 * 100% 对齐截图字段与原型大厂规范
 */

const manualAgentWorkordersMockData = [
  {
    index: 1,
    taskId: '2026080100000000001',
    leadId: '1883735719848067112',
    channelR: 'R6-总部新媒体',
    customerName: '用户',
    phone: '18874369548',
    intentSeries: '2026款探陆',
    latestSeries: '2026款探陆',
    followStatus: '已完成',
    followCount: 5,
    taskType: '预外呼',
    initialStatus: '培育中',
    initialLevel: 'H',
    assignType: '首次分配',
    assignTime: '2026-08-01 00:00:10',
    agentAccount: '电销D组张敏',
    store: '广州东风日产天河店',
    city: '广州',
    notes: '客户已确认本周六预约到店试驾，关注置换补贴。'
  },
  {
    index: 2,
    taskId: '2026080100000000002',
    leadId: '1883735719848067115',
    channelR: 'R1-官网预约',
    customerName: '陈先生',
    phone: '15899998888',
    intentSeries: 'N6',
    latestSeries: 'N6 智驾版',
    followStatus: '跟进中',
    followCount: 3,
    taskType: '预测外呼',
    initialStatus: '培育中',
    initialLevel: 'H',
    assignType: '超时转接',
    assignTime: '2026-08-01 09:15:30',
    agentAccount: '电销A组李雷',
    store: '广州东风日产天河店',
    city: '广州',
    notes: '原坐席超时未跟进，自动转接后已联系，发送选配手册。'
  },
  {
    index: 3,
    taskId: '2026080100000000003',
    leadId: '1883735719848067120',
    channelR: 'R3-车展留资',
    customerName: '赵女士',
    phone: '18511112222',
    intentSeries: 'N7',
    latestSeries: 'N7 旗舰款',
    followStatus: '待跟进',
    followCount: 1,
    taskType: '预外呼',
    initialStatus: '待分配',
    initialLevel: 'A',
    assignType: '首次分配',
    assignTime: '2026-08-01 10:30:00',
    agentAccount: '电销D组张敏',
    store: '上海东风日产浦东店',
    city: '上海',
    notes: '关注三电终身质保与首发权益。'
  },
  {
    index: 4,
    taskId: '2026080100000000004',
    leadId: '1883735719848067132',
    channelR: 'R2-垂媒引流',
    customerName: '王先生',
    phone: '13622031122',
    intentSeries: 'NX8',
    latestSeries: 'NX8 豪华版',
    followStatus: '已完成',
    followCount: 4,
    taskType: '手动跟进',
    initialStatus: '跟进中',
    initialLevel: 'B',
    assignType: '重新分配',
    assignTime: '2026-08-01 14:20:18',
    agentAccount: '电销B组王五',
    store: '深圳东风日产福田店',
    city: '深圳',
    notes: '对比领克08，已提供2年0息专属金融方案。'
  },
  {
    index: 5,
    taskId: '2026080100000000005',
    leadId: '1883735719848067145',
    channelR: 'R6-总部新媒体',
    customerName: '刘女士',
    phone: '13982163344',
    intentSeries: '轩逸',
    latestSeries: '轩逸 经典款',
    followStatus: '暂缓',
    followCount: 2,
    taskType: '预测外呼',
    initialStatus: '培育中',
    initialLevel: 'C',
    assignType: '首次分配',
    assignTime: '2026-08-01 16:45:00',
    agentAccount: '电销C组赵六',
    store: '成都东风日产高新店',
    city: '成都',
    notes: '客户暂无购车资金，预计下月再联系。'
  }
];

let manualWorkordersFilter = {
  startDate: '2026-08-01',
  endDate: '2026-08-26',
  keyword: '',
  followStatus: '',
  assignType: '',
  agentAccount: ''
};
let manualWorkorderDetailTab = 'detail';
let activeManualWorkorderDetailId = '';

function renderManualAgentWorkordersPage() {
  const container = document.getElementById('manualAgentWorkordersPage');
  if (!container) return;

  const filteredTasks = manualAgentWorkordersMockData.filter(item => {
    const assignDate = item.assignTime.slice(0, 10);
    if (manualWorkordersFilter.startDate && assignDate < manualWorkordersFilter.startDate) return false;
    if (manualWorkordersFilter.endDate && assignDate > manualWorkordersFilter.endDate) return false;
    if (manualWorkordersFilter.keyword) {
      const kw = manualWorkordersFilter.keyword.trim().toLowerCase();
      const match = item.taskId.toLowerCase().includes(kw) ||
                    item.leadId.toLowerCase().includes(kw) ||
                    item.customerName.toLowerCase().includes(kw) ||
                    item.phone.includes(kw);
      if (!match) return false;
    }
    if (manualWorkordersFilter.followStatus && item.followStatus !== manualWorkordersFilter.followStatus) return false;
    if (manualWorkordersFilter.assignType && item.assignType !== manualWorkordersFilter.assignType) return false;
    if (manualWorkordersFilter.agentAccount && !item.agentAccount.includes(manualWorkordersFilter.agentAccount)) return false;
    return true;
  });

  const statusClass = status => ({ '已完成': 'done', '跟进中': 'progress', '待跟进': 'pending', '暂缓': 'paused' }[status] || 'paused');
  container.innerHTML = `
    <section class="mw-report-filter-card">
      <div class="mw-report-filter-title">筛选查询</div>
      <div class="mw-report-filter-grid">
        <label>人工回访工单<input class="form-input" id="mwFilterKeyword" placeholder="请输入工单、线索编码、客户或电话" value="${manualWorkordersFilter.keyword}" /></label>
        <label>跟进状态<select class="form-input" id="mwFilterFollowStatus"><option value="">全部</option>${['已完成', '跟进中', '待跟进', '暂缓'].map(value => `<option value="${value}" ${manualWorkordersFilter.followStatus === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
        <label>分配类型<select class="form-input" id="mwFilterAssignType"><option value="">全部</option>${['首次分配', '重新分配', '超时转接'].map(value => `<option value="${value}" ${manualWorkordersFilter.assignType === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
        <label>坐席账号<select class="form-input" id="mwFilterAgent"><option value="">全部坐席</option>${[['张敏','电销D组张敏'],['李雷','电销A组李雷'],['王五','电销B组王五'],['赵六','电销C组赵六']].map(([value, label]) => `<option value="${value}" ${manualWorkordersFilter.agentAccount === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
        <div class="mw-report-filter-actions"><button class="btn-blue-primary" type="button" onclick="applyManualWorkordersFilter()">查询</button><button class="btn-outline-blue" type="button" onclick="resetManualWorkordersFilter()">重置</button></div>
      </div>
      <div class="mw-report-filter-more"><label>分配时间<div><input class="form-input" type="date" value="${manualWorkordersFilter.startDate}" id="mwFilterStartDate" /><span>至</span><input class="form-input" type="date" value="${manualWorkordersFilter.endDate}" id="mwFilterEndDate" /></div></label></div>
    </section>

    <section class="mw-report-summary" aria-label="工单统计摘要">
      <div><span>总派发工单</span><strong>128<small> 单</small></strong></div><div><span>已跟进完成</span><strong class="success">105<small> 单（82%）</small></strong></div><div><span>待跟进工单</span><strong class="warning">15<small> 单</small></strong></div><div><span>平均跟进次数</span><strong class="primary">3.4<small> 次/单</small></strong></div><div><span>超时转接比例</span><strong class="danger">3.1%</strong></div>
    </section>

    <section class="mw-report-table-card">
      <div class="mw-report-table-toolbar"><h2>人工坐席工单</h2><div><button class="btn-outline-blue" type="button" onclick="exportManualWorkordersReport()">导出数据</button><select class="form-input" aria-label="排序字段"><option>分配时间</option></select><select class="form-input" aria-label="排序方向"><option>降序</option><option>升序</option></select><button class="btn-outline-blue" type="button">字段显示</button></div></div>
      <div class="mw-report-table-scroll"><table class="mw-report-table">
        <thead>
          <tr><th>序号</th><th>人工回访工单</th><th>培育线索编码</th><th>线索渠道</th><th>客户姓名</th><th>联系电话</th><th>意向车系</th><th>最新留资车系</th><th>跟进状态</th><th>跟进次数</th><th>任务类型</th><th>初始线索状态</th><th>初始意向级别</th><th>分配类型</th><th>分配时间 ↓</th><th>坐席账号</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${filteredTasks.length ? filteredTasks.map(item => `
            <tr><td>${item.index}</td><td class="mono">${item.taskId}</td><td class="mono">${item.leadId}</td><td>${item.channelR}</td><td class="customer">${item.customerName}</td><td class="mono">${item.phone}</td><td>${item.intentSeries}</td><td>${item.latestSeries}</td><td><span class="mw-status ${statusClass(item.followStatus)}">${item.followStatus}</span></td><td class="center strong">${item.followCount}</td><td>${item.taskType}</td><td>${item.initialStatus}</td><td class="center level">${item.initialLevel}</td><td class="${item.assignType === '超时转接' ? 'assign-alert' : ''}">${item.assignType}</td><td class="muted">${item.assignTime}</td><td>${item.agentAccount}</td><td><button class="mw-detail-link" type="button" onclick="openWorkorderDetailModal('${item.taskId}')">详情</button></td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="17" class="empty">暂无符合条件的人工坐席工单数据</td>
            </tr>
          `}
        </tbody>
      </table></div>
      <footer class="mw-report-pagination"><span>共 ${filteredTasks.length} 条记录，当前第 1 / 1 页</span><div><select class="form-input"><option>每页 10 条</option></select><button type="button" disabled>‹</button><select class="form-input"><option>第 1 页</option></select><button type="button" disabled>›</button></div></footer>
    </section>
  `;
}

function applyManualWorkordersFilter() {
  const startDate = document.getElementById('mwFilterStartDate')?.value || '';
  const endDate = document.getElementById('mwFilterEndDate')?.value || '';
  const kw = document.getElementById('mwFilterKeyword')?.value || '';
  const fs = document.getElementById('mwFilterFollowStatus')?.value || '';
  const at = document.getElementById('mwFilterAssignType')?.value || '';
  const ag = document.getElementById('mwFilterAgent')?.value || '';
  manualWorkordersFilter.startDate = startDate;
  manualWorkordersFilter.endDate = endDate;
  manualWorkordersFilter.keyword = kw;
  manualWorkordersFilter.followStatus = fs;
  manualWorkordersFilter.assignType = at;
  manualWorkordersFilter.agentAccount = ag;
  renderManualAgentWorkordersPage();
  if (typeof showToast === 'function') showToast('工单筛选条件已生效', true);
}

function resetManualWorkordersFilter() {
  manualWorkordersFilter = {
    startDate: '2026-08-01',
    endDate: '2026-08-26',
    keyword: '',
    followStatus: '',
    assignType: '',
    agentAccount: ''
  };
  renderManualAgentWorkordersPage();
  if (typeof showToast === 'function') showToast('筛选条件已重置', true);
}

function exportManualWorkordersReport() {
  if (typeof showToast === 'function') showToast('正在导出【人工坐席工单】报表 (CSV)...', true);
}

function showManualWorkorderDetailPage(taskId) {
  const item = manualAgentWorkordersMockData.find(d => d.taskId === taskId) || manualAgentWorkordersMockData[0];
  activeManualWorkorderDetailId = item.taskId;
  manualWorkorderDetailTab = 'detail';
  document.querySelector('nav[aria-label="培育策略三级菜单"]')?.classList.add('hidden');
  document.querySelector('.leads-nav')?.classList.remove('show');
  document.querySelector('.reports-nav')?.classList.add('show');
  if (typeof setReportsNavActive === 'function') setReportsNavActive('人工坐席工单');
  if (typeof setSidebarActiveByName === 'function') setSidebarActiveByName('统计报表');
  if (typeof hideLeadPages === 'function') hideLeadPages();
  document.getElementById('designStage')?.classList.remove('show');
  if (typeof setPageName === 'function') setPageName('统计报表 / 人工坐席工单 / 工单详情');
  renderManualWorkorderDetailPage(item);
  document.getElementById('manualAgentWorkorderDetailPage')?.classList.add('show');
}

function renderManualWorkorderDetailPage(item) {
  const page = document.getElementById('manualAgentWorkorderDetailPage');
  if (!page) return;
  page.innerHTML = `
    <div class="detail-page-header mw-workorder-detail-header"><div><div class="detail-page-title">查看人工坐席工单</div><div class="detail-page-subtitle">统计报表 / 人工坐席工单 / ${item.taskId}</div></div><div class="lead-toolbar-right"><button class="btn-secondary" type="button" onclick="showReportsPage('人工坐席工单')">返回列表</button></div></div>
    <section class="mw-workorder-detail-summary"><div><span>人工回访工单</span><strong>${item.taskId}</strong></div><div><span>跟进状态</span><strong class="${item.followStatus === '已完成' ? 'success' : 'primary'}">${item.followStatus}</strong></div><div><span>客户信息</span><strong>${item.customerName} ${item.phone}</strong></div><div><span>意向车系</span><strong>${item.intentSeries}</strong></div><div><span>分配时间</span><strong>${item.assignTime}</strong></div><div><span>坐席账号</span><strong>${item.agentAccount}</strong></div></section>
    <section class="mw-workorder-detail-content">${renderManualWorkorderDetailContent(item)}</section>
  `;
}

function openWorkorderDetailModal(taskId) {
  showManualWorkorderDetailPage(taskId);
  return;
  const item = manualAgentWorkordersMockData.find(d => d.taskId === taskId) || manualAgentWorkordersMockData[0];
  const modalTitle = document.getElementById('leadDispatchRuleModalTitle');
  const modalBody = document.getElementById('leadDispatchRuleModalBody');
  const modalFooter = document.getElementById('leadDispatchRuleModalFooter');

  manualWorkorderDetailTab = 'detail';
  if (modalTitle) modalTitle.textContent = `人工坐席工单详情 - ${item.taskId}`;
  if (modalBody) modalBody.innerHTML = renderManualWorkorderDetailContent(item);
  if (modalFooter) {
    modalFooter.innerHTML = `
      <button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">关闭</button>
      <button class="btn-save" type="button" onclick="closeModal('leadDispatchRuleModal'); showNurtureTaskPage();">前往培育任务工作台跟进</button>
    `;
  }
  document.getElementById('leadDispatchRuleModal')?.classList.add('show');
}

function switchManualWorkorderDetailTab(taskId, tab) {
  const item = manualAgentWorkordersMockData.find(d => d.taskId === taskId) || manualAgentWorkordersMockData[0];
  manualWorkorderDetailTab = tab;
  if (document.getElementById('manualAgentWorkorderDetailPage')?.classList.contains('show')) {
    renderManualWorkorderDetailPage(item);
    return;
  }
  const modalBody = document.getElementById('leadDispatchRuleModalBody');
  if (modalBody) modalBody.innerHTML = renderManualWorkorderDetailContent(item);
}

function renderManualWorkorderDetailContent(item) {
  const tabs = [['detail', '工单详情'], ['quality', '员工质检'], ['tags', '线索预评'], ['timeline', '时光轴']];
  const ratingByLevel = { H: { text: '高', score: 80, color: '#be123c' }, A: { text: '中', score: 68, color: '#d97706' }, B: { text: '中', score: 65, color: '#d97706' }, C: { text: '低', score: 45, color: '#2563eb' } };
  const rating = ratingByLevel[item.initialLevel] || ratingByLevel.H;
  const ratingTags = {
    basic: [['年龄段', '25-35岁'], ['职业', '企业管理人员'], ['预测婚否', '已婚'], ['预测是否有孩', '有'], ['预测消费水平', '中高'], ['预测收入水平', '中高'], ['预测人生阶段', '家庭成长期'], ['预测人生关键节点', '换购期'], ['预测是否有车', '是'], ['预测有车品牌', '日产'], ['有车品牌等级', '合资'], ['职业_外部', '企业管理'], ['省份组合', item.city === '广州' ? '广东省' : item.city], ['常住城市等级', '新一线'], ['城市组合', item.city], ['区县组合', '吴中区'], ['最新车品牌', '日产'], ['最新车车系', '轩逸'], ['最新车车龄', '5年'], ['预测手机品牌', '华为'], ['预测在用手机价格区间', '5-8千'], ['预测设备使用时长', '4-6h'], ['预测作息时间偏好', '晚睡型'], ['预测上网最热时段', '晚高峰'], ['是否到店用户', '是'], ['预测性别', '男'], ['预测学历', '本科']],
    interaction: [['最近一次留资距今天数', '5天'], ['有效留资次数', '3次'], ['最近一次试驾距今天数', '3天'], ['最近一次到店距今天数', '3天'], ['试驾次数', '1次'], ['最新车当前里程数', '8万公里'], ['到店次数', '2次']],
    preference: [['近三月平台访问次数', '28次'], ['融合兴趣标签(30天)', '科技数码']],
    purchase: [['预约到店日期', '2026-08-22'], ['预计用车时间', '1个月内'], ['品牌认知', '高'], ['购车预算', '16-20万'], ['关注竞品', '比亚迪宋PLUS'], ['购车关注点', '智能化'], ['购车顾虑点', '保值率'], ['用车场景', '家庭出游'], ['购买形态', '换购'], ['付款方式', '贷款'], ['车位情况', '有'], ['充电条件', '有'], ['已有车辆品牌', '日产']]
  };
  const renderRatingGroup = (title, values) => `<section class="rating-feature-group"><div class="rating-feature-heading"><h6>${title}</h6></div><div class="rating-feature-tags">${values.map(([label, value]) => `<span><em>${label}</em><strong>${value}</strong></span>`).join('')}</div></section>`;
  const ratingContent = `<div class="nurture-rating-panel mw-rating-panel"><div class="rating-result-label">预评结果</div><div class="rating-score-strip"><strong class="rating-level" style="color:${rating.color}">${rating.text}</strong><strong class="rating-score">${rating.score}<small>分</small></strong><div class="rating-progress"><i style="width:${rating.score}%; background:${rating.color}"></i></div><span class="rating-percent">${rating.score}%</span></div><section class="rating-summary-block"><h5>预评小结</h5><div class="rating-summary-copy">当前评为<strong>${rating.text}等级</strong>：计划<strong>1个月内</strong>购车，关注<strong>${item.intentSeries}</strong>，预算<strong>16-20万</strong>、倾向<strong>贷款</strong>；已产生<strong>${item.followCount}次</strong>跟进，近期平台访问活跃，建议围绕金融方案与到店试驾持续推进。</div></section><section class="rating-features-block"><h5>客户特征</h5><div class="tag-summary-block"><h6>标签小结</h6><p>25-35岁企业管理人员，处于家庭成长期；计划1个月内换购，预算16-20万，重点关注智能化与金融方案。</p></div>${renderRatingGroup('基础画像', ratingTags.basic)}${renderRatingGroup('互动表现', ratingTags.interaction)}${renderRatingGroup('兴趣偏好', ratingTags.preference)}${renderRatingGroup('购车需求', ratingTags.purchase)}</section></div>`;
  const content = manualWorkorderDetailTab === 'detail' ? `
      <div class="dispatch-rule-form">
        <section class="dispatch-form-section">
          <div class="dispatch-section-title">工单基础与分配信息</div>
          <div class="dispatch-form-grid">
            <div class="form-group"><div class="form-label">人工回访工单</div><div style="font-weight:700; color:#1677ff;">${item.taskId}</div></div>
            <div class="form-group"><div class="form-label">培育线索编码</div><div style="font-family:monospace;">${item.leadId}</div></div>
            <div class="form-group"><div class="form-label">客户姓名</div><div><strong>${item.customerName}</strong> (${item.phone})</div></div>
            <div class="form-group"><div class="form-label">线索R渠道</div><div>${item.channelR}</div></div>
            <div class="form-group"><div class="form-label">意向车系 / 最新留资</div><div>${item.intentSeries} / ${item.latestSeries}</div></div>
            <div class="form-group"><div class="form-label">初始状态 / 初始级别</div><div>${item.initialStatus} / <strong style="color:#be123c;">${item.initialLevel}级</strong></div></div>
            <div class="form-group"><div class="form-label">分配类型</div><div>${item.assignType}</div></div>
            <div class="form-group"><div class="form-label">分配时间</div><div>${item.assignTime}</div></div>
            <div class="form-group"><div class="form-label">坐席账号</div><div>${item.agentAccount}</div></div>
            <div class="form-group"><div class="form-label">意向门店</div><div>${item.store} (${item.city})</div></div>
          </div>
        </section>

        <section class="dispatch-form-section">
          <div class="dispatch-section-title">跟进进度与备注</div>
          <div style="background:#f8fbff; border:1px solid #e5edf7; border-radius:6px; padding:12px 16px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <span style="font-size:13px; font-weight:700; color:#0f172a;">跟进状态: <span style="color:#1677ff;">${item.followStatus}</span></span>
              <span style="font-size:12px; color:#64748b;">累计跟进次数: <strong>${item.followCount} 次</strong></span>
            </div>
            <div style="font-size:13px; color:#334155; line-height:1.6;">
              <strong>最新跟进备注：</strong> ${item.notes}
            </div>
          </div>
        </section>
      </div>
    ` : manualWorkorderDetailTab === 'quality' ? `
      <section class="mw-detail-pane"><div class="mw-quality-score"><span>本次质检得分</span><strong>92<small> 分</small></strong><em>通过</em></div><div class="mw-quality-list"><div><span>开场及身份确认</span><b>合规</b></div><div><span>需求信息确认</span><b>完整</b></div><div><span>产品与权益介绍</span><b>准确</b></div><div><span>服务规范与结束语</span><b>合规</b></div></div><p class="mw-detail-note">质检结论：沟通节奏清晰，已确认客户当前关注点与下一步跟进安排。</p></section>
    ` : manualWorkorderDetailTab === 'tags' ? ratingContent
    : `
      <section class="mw-detail-pane"><div class="mw-workorder-timeline"><div><time>${item.assignTime}</time><span><b>工单已分配</b><small>分配至 ${item.agentAccount}</small></span></div><div><time>2026-08-01 10:45:00</time><span><b>首次外呼完成</b><small>已确认客户意向与关注点</small></span></div><div><time>2026-08-01 11:20:00</time><span><b>跟进结果已更新</b><small>${item.notes}</small></span></div></div></section>
    `;
  return `<div class="mw-detail-tabs" role="tablist">${tabs.map(([key, label]) => `<button class="${manualWorkorderDetailTab === key ? 'active' : ''}" type="button" onclick="switchManualWorkorderDetailTab('${item.taskId}', '${key}')">${label}</button>`).join('')}</div>${content}`;
}
