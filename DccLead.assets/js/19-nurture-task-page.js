// ===== 培育任务工作台（原型） =====
const nurtureTaskQueues = [
  { id: 'new', name: '新任务', count: 3 },
  { id: 'today', name: '当日跟进', count: 2 },
  { id: 'overdue', name: '逾期任务', count: 4 },
  { id: 'future', name: '未来任务', count: 6 }
];

let nurtureSortState = {
  assignTime: 'newest',
  receiveTime: 'newest',
  planTime: 'newest'
};

const nurtureTaskItems = [
  {
    id: 'NT-202607290001', queue: 'overdue', customer: '陈先生', phone: '158****9999', series: 'N6', level: 'H', due: '已逾期 1 天', channel: 'AI智能外呼', status: '暂缓', source: '总部冷线索', store: '广州东风日产天河店', city: '广州', project: '新能源小程序预约试驾', last: '2026-07-28 15:30', note: '关注续航和置换补贴，建议优先回访。',
    aiInsight: {
      levelText: '高', score: 80, levelColor: '#be123c',
      htmlNote: '当前评为<strong>高等级</strong>：计划<strong>1个月内</strong>换购<strong>N6</strong>，预算<strong>16-20万</strong>、<strong>需贷款</strong>；已<strong>到店2次</strong>、<strong>试驾1次</strong>，试驾后竞品态度质变为"<strong>只认本品</strong>"，试驾意愿升级、交易风险消除；近期平台访问活跃，线上线下行为与意向持续走强。唯一弱化：购车意向降至"考虑中"，但线下行为客观性强，整体仍上行。'
    },
    insightTags: {
      basic: [
        ['年龄段', '25-35岁'], ['职业', '企业管理人员'], ['预测婚否', '已婚'], ['预测是否有孩', '有'],
        ['预测消费水平', '中高'], ['预测收入水平', '中高'], ['预测人生阶段', '家庭成长期'], ['预测人生关键节点', '换购期'],
        ['省份组合', '广东省'], ['城市组合', '广州'], ['预测手机品牌', '华为'], ['预测作息时间偏好', '晚睡型']
      ],
      status: [
        ['最近一次留资距今天数', '5天'], ['有效留资次数', '3次'], ['最近一次试驾距今天数', '3天'],
        ['最近一次到店距今天数', '3天'], ['试驾次数', '1次'], ['到店次数', '2次']
      ],
      preference: [
        ['近三月平台访问次数', '28次'], ['融合兴趣标签(30天)', '科技数码']
      ],
      carBackground: [
        ['预约到店日期', '2026-08-22'], ['预计用车时间', '1个月内'], ['品牌认知', '高'],
        ['购车预算', '16-20万'], ['关注竞品', '比亚迪宋PLUS'], ['购车关注点', '智能化'],
        ['购买形态', '换购'], ['付款方式', '贷款'], ['已有车辆品牌', '日产']
      ]
    }
  },
  {
    id: 'NT-202607290002', queue: 'overdue', customer: '赵女士', phone: '185****1111', series: 'N7', level: 'H', due: '已逾期 2 小时', channel: '人工外呼', status: '待跟进', source: '门店冷线索', store: '上海东风日产浦东店', city: '上海', project: 'N7新品上市线索', last: '2026-07-29 09:00', note: '上次接通未完成需求确认。',
    aiInsight: {
      levelText: '高', score: 85, levelColor: '#be123c',
      htmlNote: '当前评为<strong>高等级</strong>：重点关注<strong>N7首发权益</strong>与<strong>三电终身质保</strong>政策；已<strong>线上留资3次</strong>、<strong>APP定制选配下订</strong>，购车意愿极其强烈；建议坐席优先邀约到店锁单试驾。'
    },
    insightTags: {
      bestTime: '12:30-13:30',
      basic: [
        ['年龄段', '30-40岁'], ['职业', '金融/财会分析师'], ['预测婚否', '未婚'],
        ['省份组合', '上海市'], ['城市组合', '上海'], ['预测手机品牌', '苹果'], ['预测上网最热时段', '午休高峰']
      ],
      status: [
        ['最近一次留资距今天数', '1天'], ['有效留资次数', '4次'], ['到店次数', '1次']
      ],
      preference: [
        ['近三月平台访问次数', '42次'], ['融合兴趣标签(30天)', '时尚生活/新能源汽车']
      ],
      carBackground: [
        ['预计用车时间', '2周内'], ['购车预算', '20-25万'], ['购车关注点', '外观设计/续航性能'],
        ['购买形态', '首购'], ['付款方式', '全款']
      ]
    }
  },
  {
    id: 'NT-202607290003', queue: 'overdue', customer: '王先生', phone: '136****2203', series: 'NX8', level: 'A', due: '已逾期 4 小时', channel: 'AI智能外呼', status: '暂缓', source: '三无忧线索', store: '深圳东风日产福田店', city: '深圳', project: '暑期购车活动', last: '2026-07-28 17:20', note: '等待客户确认到店日期。',
    aiInsight: {
      levelText: '中', score: 68, levelColor: '#d97706',
      htmlNote: '当前评为<strong>中等级</strong>：对比竞品<strong>宋L与领克08</strong>，关注置换补贴力度；已<strong>电话沟通1次</strong>，对智驾满意但对金融月供持观望态度；建议推介专属2年0息分期方案。'
    },
    insightTags: {
      bestTime: '18:00-19:00',
      basic: [
        ['年龄段', '35-45岁'], ['职业', 'IT/互联网高级工程师'], ['省份组合', '广东省'], ['城市组合', '深圳']
      ],
      status: [
        ['最近一次留资距今天数', '7天'], ['有效留资次数', '2次']
      ],
      preference: [
        ['近三月平台访问次数', '15次']
      ],
      carBackground: [
        ['预计用车时间', '3个月内'], ['购车预算', '15-18万'], ['关注竞品', '领克08'], ['购车顾虑点', '金融月供与利率'], ['付款方式', '贷款/分期']
      ]
    }
  },
  {
    id: 'NT-202607290004', queue: 'today', customer: '刘女士', phone: '139****8216', series: '轩逸', level: 'B', due: '今日 15:30', channel: '人工外呼', status: '待跟进', source: '门店冷线索', store: '成都东风日产高新店', city: '成都', project: '金融方案咨询', last: '2026-07-29 10:15', note: '意向金融分期方案。',
    aiInsight: {
      levelText: '中', score: 65, levelColor: '#d97706',
      htmlNote: '当前评为<strong>中等级</strong>：计划<strong>2周内购车</strong>，核心询问<strong>低首付分期方案</strong>；已<strong>到店1次</strong>，对月供3000以内比较敏感；建议重点推荐低首付弹性长贷政策。'
    },
    insightTags: {
      bestTime: '10:00-11:30',
      basic: [
        ['年龄段', '25-30岁'], ['省份组合', '四川省'], ['城市组合', '成都']
      ],
      status: [
        ['最近一次留资距今天数', '2天'], ['到店次数', '1次']
      ],
      preference: [
        ['近三月平台访问次数', '8次']
      ],
      carBackground: [
        ['预计用车时间', '2周内'], ['购车预算', '10-13万'], ['付款方式', '低首付贷款']
      ]
    }
  },
  {
    id: 'NT-202607290005', queue: 'new', customer: '周先生', phone: '137****6880', series: '天籁', level: 'C', due: '今日 16:00', channel: 'AI智能外流', status: '新任务', source: '总部冷线索', store: '杭州东风日产西湖店', city: '杭州', project: '夏季试驾招募', last: '—', note: '首次跟进，需确认购车计划。',
    aiInsight: {
      levelText: '低', score: 45, levelColor: '#2563eb',
      htmlNote: '当前评为<strong>低等级</strong>：首次官网留资，属于<strong>夏季试驾招募</strong>活动引流线索；尚未明确具体购车时间；建议先建立微信联系，下发电子车型手册进行培育。'
    },
    insightTags: { bestTime: '15:00-16:00', basic: [['省份组合', '浙江省'], ['城市组合', '杭州']], status: [['最近一次留资距今天数', '1天']], preference: [['近三月平台访问次数', '2次']], carBackground: [] }
  },
  {
    id: 'NT-202607290006', queue: 'future', customer: '陆先生', phone: '138****6721', series: 'N7', level: 'H', due: '3天后 10:00', channel: '人工外呼', status: '待跟进', source: '私域高频互动', store: '广州东风日产天河店', city: '广州', project: 'N7下订预热', last: '2026-08-25 14:00', note: '客户约定周末到店试驾选配。',
    aiInsight: {
      levelText: '高', score: 88, levelColor: '#be123c',
      htmlNote: '当前评为<strong>高等级</strong>：小程序内使用<strong>车价计算器3次</strong>，且在本店<strong>留资2次</strong>，意向极其明确；约定3天后到店看车。'
    },
    insightTags: { bestTime: '14:00-15:00', basic: [['省份组合', '广东省'], ['城市组合', '广州']], status: [['最近一次留资距今天数', '2天']], preference: [['近三月平台访问次数', '18次']], carBackground: [['预计用车时间', '本周内'], ['购车预算', '20-25万']] }
  },
  {
    id: 'NT-202607290007', queue: 'future', customer: '张女士', phone: '135****9988', series: '逍客', level: 'A', due: '5天后 15:00', channel: '人工外呼', status: '待跟进', source: '官网预约', store: '北京东风日产朝阳店', city: '北京', project: '置换补贴活动', last: '2026-08-24 11:30', note: '等待旧车评估出价。',
    aiInsight: {
      levelText: '中', score: 72, levelColor: '#d97706',
      htmlNote: '当前评为<strong>中等级</strong>：关注二手车置换补贴，计划5天后回访确定二手车残值评估结果。'
    },
    insightTags: { bestTime: '11:00-12:00', basic: [['省份组合', '北京市'], ['城市组合', '北京']], status: [['最近一次留资距今天数', '3天']], preference: [['近三月平台访问次数', '10次']], carBackground: [['预计用车时间', '下周'], ['购车预算', '12-15万']] }
  }
];

let activeNurtureTaskQueue = 'overdue';
let activeNurtureTaskId = 'NT-202607290001';
let activeNurtureTaskSideTab = 'lead';
let nurtureTaskProfileExpanded = false;
let nurtureTaskUtilityMenuOpen = false;

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
        ['跟进次数', task.followCount || '3 次'], ['意向门店', task.store || '广州东风日产天河店'],
        ['车系车型', task.vehicleModel || '东风日产 N6 2026款 智驾版'], ['VIN码', task.vin || 'LNBF20268899201']
      ]
    },
    {
      title: '来源与意向信息',
      fields: [
        ['IP归属地', task.ipLocation || task.city || '广州'], ['线索来源', task.source], ['最新意向级别', task.level || 'H'],
        ['最新意向车系', task.series], ['留资时间', task.createdAt || '2026-07-29 09:00:00'],
        ['购车时间', task.purchaseTime || '预计1个月内'], ['购车门店', task.purchaseStore || task.store || '广州东风日产天河店'],
        ['线索备注', task.leadRemark || '客户偏好周末到店，需提前电话联系'],
        ['线索描述', task.description || '小程序留资预约到店体验，关注置换补贴']
      ]
    },
    {
      title: '业务标识信息',
      fields: [
        ['线索编码', task.leadCode || '1789848611849150571'], ['渠道名称', task.channelName || 'R3-天网行动'],
        ['大项目名', task.project], ['媒体名称', task.mediaName || '百度有驾'], ['是否AI外呼过', task.aiCalled || '否']
      ]
    }
  ];
  return groups.map(group => `<div class="nurture-profile-block"><h4>${group.title}</h4><dl>${group.fields.map(([label, value]) => `<dt>${label}</dt><dd title="${value}">${value}</dd>`).join('')}</dl></div>`).join('');
}

function renderNurtureTaskPage() {
  const page = document.getElementById('nurtureTaskPage');
  if (!page) return;

  // 动态更新各队列的真实数据量
  nurtureTaskQueues.forEach(q => {
    q.count = nurtureTaskItems.filter(item => item.queue === q.id).length;
  });

  const queueTasks = nurtureTaskItems.filter(item => item.queue === activeNurtureTaskQueue);
  let task = nurtureTaskItems.find(item => item.id === activeNurtureTaskId && item.queue === activeNurtureTaskQueue);
  if (!task && queueTasks.length) {
    task = queueTasks[0];
    activeNurtureTaskId = task.id;
  }
  if (!task) {
    task = nurtureTaskItems[0];
  }
  page.innerHTML = `
    <div class="nurture-task-page-head">
      <div><div class="page-title">培育任务</div><div class="page-desc">按优先级处理待跟进线索，在同一工作台完成沟通、回访和客户信息查看。</div><div class="nurture-task-summary"><span>待处理 <b>11</b></span><span class="warning">逾期 <b>4</b></span><span>今日已完成 <b>8</b></span></div></div>
      <div class="nurture-task-head-actions">
        <button class="btn-secondary" type="button" style="background:#fff7ed; color:#c2410c; border-color:#ffedd5; font-weight:600;" onclick="openNurturePopScreenModal()">📞 模拟坐席接听弹屏 (场景A/C代跟进)</button>
        <button class="btn-secondary" type="button" data-nurture-task-action="toggle-profile">${nurtureTaskProfileExpanded ? '收起辅助信息' : '查看客户信息'}</button>
        <button class="btn-secondary" type="button" data-nurture-task-action="refresh">刷新任务</button>
      </div>
    </div>
    <div class="nurture-task-workspace ${nurtureTaskProfileExpanded ? 'profile-open' : 'profile-closed'}">
      <aside class="nurture-task-queue-panel">
        <div class="nurture-task-panel-head">
          <span style="font-weight:700; color:#1f2937; font-size:14px;">外呼列表</span>
          <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:0;">
            <input id="nurtureTaskSearch" class="lead-input" placeholder="手机号搜索" value="" style="flex:1; min-width:0; height:32px; font-size:12px;" />
            <button class="nurture-filter-btn" type="button" title="更多筛选与系统排序" onclick="openNurtureTaskFilterModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            </button>
          </div>
        </div>
        <div class="nurture-task-queue-tabs">${nurtureTaskQueues.map(queue => `<button type="button" class="nurture-task-queue ${queue.id === activeNurtureTaskQueue ? 'active' : ''}" data-nurture-queue="${queue.id}"><span>${queue.name}</span><b>${queue.count}</b></button>`).join('')}</div>
        <div class="nurture-task-list" id="nurtureTaskList">${queueTasks.length ? queueTasks.map(item => {
          const isKeyBehavior = (item.phone === '138****8810' || item.phone === '138****8888' || item.phone === '136****2203' || item.phone === '138****6721' || item.customer.includes('王') || item.customer.includes('陆'));
          const dueShort = item.due.replace('已逾期 ', '逾期 ').replace('小时', 'h').replace('分钟', 'm').replace('天', 'd');
          return `<button type="button" class="nurture-task-card ${item.id === task.id ? 'active' : ''}" data-nurture-task-id="${item.id}" style="padding:10px 12px; min-height:auto; ${isKeyBehavior ? 'background:#fef2f2; border:1px solid #fca5a5;' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <div style="display:flex; align-items:center; gap:5px;">
                <span style="font-size:13.5px; font-weight:800; color:#0f172a;">${item.customer}</span>
                <span style="background:${item.level === 'H' ? '#fef3c7' : '#f1f5f9'}; color:${item.level === 'H' ? '#b45309' : '#475569'}; border:1px solid ${item.level === 'H' ? '#fde68a' : '#cbd5e1'}; padding:0 4px; border-radius:3px; font-size:10px; font-weight:bold;">${item.level}级</span>
                ${isKeyBehavior ? `<span style="background:#dc2626; color:#fff; padding:1px 5px; border-radius:3px; font-size:9.5px; font-weight:bold; font-family:sans-serif;">关键提醒</span>` : ''}
              </div>
              <span style="font-size:11px; color:${item.due.includes('逾期') ? '#dc2626' : '#64748b'}; font-weight:bold; font-family:monospace;">${dueShort}</span>
            </div>
            <div style="font-size:11.5px; color:#475569; font-family:monospace; display:flex; align-items:center; gap:4px;">
              <span>${item.phone}</span>
              <span style="color:#cbd5e1;">·</span>
              <span style="color:#64748b; font-family:sans-serif;">${item.series}</span>
            </div>
          </button>`;
        }).join('') : '<div class="nurture-task-empty">当前队列暂无任务</div>'}</div>
      </aside>
      <main class="nurture-task-detail-panel">
        <div class="nurture-task-detail-head"><div><div class="nurture-task-customer">${task.customer}<span>${task.phone}</span></div><div class="nurture-task-subtitle">任务编号 ${task.id}${task.channel && task.channel !== '人工外呼' ? ` · ${task.channel}` : ''} · ${task.due}</div></div><div class="nurture-task-detail-state"><span class="nurture-task-level">意向 ${task.level}</span><span class="nurture-task-owner">当前处理人：张敏 ${task.isBackup ? `<b style="color:#c2410c; margin-left:4px;">(代跟进)</b>` : ''}</span></div></div>
        
        <!-- 频繁留资强提醒与时间轴旅程卡片组件 -->
        ${(task.phone === '138****8810' || task.phone === '138****8888' || task.phone === '138****6721' || task.customer.includes('陆') || task.customer.includes('王')) ? `
          <div style="background:#fef2f2; border:1px solid #fecaca; padding:12px 16px; border-radius:8px; margin:16px 0 16px 0; display:flex; align-items:center; gap:12px; box-shadow:0 2px 8px rgba(239,68,68,0.06);">
            <div style="font-size:16px;">⚠️</div>
            <div style="flex:1;">
              <div style="font-size:13px; font-weight:800; color:#991b1b; margin:0 0 4px 0; display:flex; align-items:center; gap:8px;">
                <span>关键行为强提醒</span>
                <span style="background:#ef4444; color:#fff; border-radius:10px; padding:1px 8px; font-size:10.5px; font-weight:bold;">同店2次留资 (广州天河店)</span>
                <span style="background:#8b5cf6; color:#fff; border-radius:10px; padding:1px 8px; font-size:10.5px; font-weight:bold;">私域高频互动</span>
              </div>
              <div style="font-size:12px; color:#7f1d1d; margin:0; font-weight:500;">客户${task.customer}近期频繁关注车型信息，意向较高建议主动联系。</div>
            </div>
          </div>
        ` : ''}

        ${task.isBackup ? `<div style="background:#fff7ed; border:1px solid #ffedd5; color:#c2410c; padding:8px 14px; border-radius:6px; font-size:12.5px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between;"><span><strong>【超时自动转接】</strong> 原归属坐席：${task.originalOwner || '客服张三'}（超时未跟进），线索已转接给您，请接续沟通。</span><span style="font-size:12px; opacity:0.9;">查阅历史记录接续</span></div>` : ''}


        <section class="nurture-task-section">
          <div class="nurture-task-section-title">沟通提示</div>
          <div class="ai-insight-panel">
            <div class="ai-insight-head">
              <span class="ai-insight-level" style="color:${(task.aiInsight || {}).levelColor || '#be123c'}">${(task.aiInsight || {}).levelText || '高意向'}</span>
              <span class="ai-insight-score">${(task.aiInsight || {}).score || 80}<small>分</small></span>
            </div>
            <div class="ai-insight-card">
              ${(task.aiInsight || {}).htmlNote || task.note}
            </div>
            <button class="nurture-rating-result-link" type="button" data-nurture-task-action="open-rating-result">查看预评结果与客户特征</button>
          </div>
        </section>
        <section class="nurture-task-section nurture-task-form-section">
          <div class="nurture-task-section-title">回访提交</div>
          <div class="nurture-visit-form">
            <div class="nurture-visit-form-grid-3col">
              <label><span class="req">*</span>接触状态<select class="form-input"><option value="">请选择接触状态</option><option>已接通</option><option>未接通</option><option>拒接</option><option>空号</option><option>停机</option></select></label>
              <label><span class="req">*</span>回访结果<select class="form-input" data-nurture-visit-result><option value="">请先选择接触状态</option><option>下次回访</option><option>有意向</option><option>待考虑</option><option>无意向</option></select></label>
              <label><span class="req">*</span>结果原因<select class="form-input"><option value="">请选择</option><option>资金问题</option><option>价格未谈妥</option><option>需对比竞品</option><option>无购车需求</option></select></label>
              <label>意向级别<select class="form-input"><option value="">请选择</option><option selected>${task.level}</option><option>H</option><option>A</option><option>B</option><option>C</option><option>F</option><option>L</option></select></label>
              <label class="nurture-visit-followup-field"><span>下次回访时间</span><input class="form-input" type="date" placeholder="请选择日期" /></label>
              <label class="nurture-visit-followup-field"><span>预计到店时间</span><input class="form-input" type="date" placeholder="请选择日期" /></label>
              <label class="nurture-visit-followup-field"><span>意向车辆</span><select class="form-input"><option value="">请选择</option><option selected>${task.series}</option><option>N6</option><option>N7</option><option>轩逸</option><option>天籁</option><option>逍客</option><option>奇骏</option><option>ARIYA</option><option>探陆</option></select></label>
              <label class="nurture-visit-followup-field"><span>意向门店</span><select class="form-input"><option value="">请选择</option><option selected>${task.store}</option><option>广州东风日产天河店</option><option>上海东风日产浦东店</option><option>深圳东风日产福田店</option></select></label>
              <label class="nurture-visit-followup-field"><span>购车方式</span><select class="form-input"><option value="">请选择</option><option>全款</option><option>贷款/分期</option><option>置换</option><option>租赁</option></select></label>
              <label class="nurture-visit-followup-field"><span>计划购买时间</span><select class="form-input"><option value="">请选择</option><option>1周内</option><option>2周内</option><option>1个月内</option><option>3个月内</option><option>半年内</option></select></label>
              <label class="nurture-visit-followup-field"><span>添加企微</span><select class="form-input"><option value="">请选择</option><option>已添加</option><option>未添加</option><option>客户拒绝</option></select></label>
              <label>性别<select class="form-input"><option value="">请选择</option><option>男</option><option>女</option><option>保密</option></select></label>
              <label>备用电话<input class="form-input" placeholder="请输入" /></label>
              <label>上次回访时间<div class="form-plain-text">${task.last || '—'}</div></label>
              <label class="wide"><span class="req">*</span>回访描述<textarea class="form-input" rows="3" placeholder="请输入本次沟通内容、客户异议与已确认结论"></textarea></label>
              <label class="wide">备注信息<textarea class="form-input" rows="2" placeholder="补充需要协同或特别关注的事项"></textarea></label>
            </div>
          </div>
          
          <div class="nurture-task-form-actions-bar">
            <button class="btn-disabled" type="button" disabled title="智能体填单暂未开启">智能体填单</button>
            <button class="btn-outline-blue" type="button" data-nurture-task-action="pause">回访暂存</button>
            <button class="btn-blue-primary" type="button" data-nurture-task-action="submit">回访提交</button>
            <div class="nurture-task-more-actions"><button class="nurture-task-more-trigger" type="button" data-nurture-task-action="toggle-utility-menu">更多操作 <span>⌄</span></button>${nurtureTaskUtilityMenuOpen ? `<div class="nurture-task-utility-menu"><button type="button" data-nurture-task-action="send-sms">下发短信</button><button type="button" data-nurture-task-action="store-query">门店查询</button><button type="button" data-nurture-task-action="drive-record">试驾记录</button></div>` : ''}</div>
          </div>
        </section>
      </main>
      ${nurtureTaskProfileExpanded ? `<aside class="nurture-task-profile-panel"><div class="nurture-task-profile-head"><span>客户辅助信息</span><button type="button" data-nurture-task-action="toggle-profile" aria-label="收起客户辅助信息">×</button></div><div class="nurture-task-profile-tabs"><button class="${activeNurtureTaskSideTab === 'insight' ? 'active' : ''}" data-nurture-side-tab="insight">线索预评</button><button class="${activeNurtureTaskSideTab === 'lead' ? 'active' : ''}" data-nurture-side-tab="lead">线索详情</button><button class="${activeNurtureTaskSideTab === 'records' ? 'active' : ''}" data-nurture-side-tab="records">回访记录</button></div><div class="nurture-task-profile-content">${renderNurtureTaskSidePanel(task)}</div></aside>` : ''}
    </div>`;
  bindNurtureTaskPageEvents();
}

function openNurtureTaskFilterModal() {
  document.getElementById('leadDispatchRuleModalTitle').textContent = '更多筛选与系统排序';
  document.getElementById('leadDispatchRuleModalBody').innerHTML = `
    <div class="dispatch-rule-form">
      <section class="dispatch-form-section">
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="width:105px; text-align:right; font-size:13px; font-weight:600; color:#334155; flex-shrink:0;">分配时间：</span>
            <input class="form-input" type="date" style="width:145px;" />
            <span style="color:#94a3b8;">➔</span>
            <input class="form-input" type="date" style="width:145px;" />
            <div class="sort-btn-group" data-sort-group="assignTime" style="margin-left:10px;">
              <button type="button" class="btn-sort ${nurtureSortState.assignTime === 'newest' ? 'active' : ''}" onclick="toggleNurtureSort('assignTime', 'newest')">最新排序</button>
              <button type="button" class="btn-sort ${nurtureSortState.assignTime === 'oldest' ? 'active' : ''}" onclick="toggleNurtureSort('assignTime', 'oldest')">最旧排序</button>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="width:105px; text-align:right; font-size:13px; font-weight:600; color:#334155; flex-shrink:0;">接收时间：</span>
            <input class="form-input" type="date" style="width:145px;" />
            <span style="color:#94a3b8;">➔</span>
            <input class="form-input" type="date" style="width:145px;" />
            <div class="sort-btn-group" data-sort-group="receiveTime" style="margin-left:10px;">
              <button type="button" class="btn-sort ${nurtureSortState.receiveTime === 'newest' ? 'active' : ''}" onclick="toggleNurtureSort('receiveTime', 'newest')">最新排序</button>
              <button type="button" class="btn-sort ${nurtureSortState.receiveTime === 'oldest' ? 'active' : ''}" onclick="toggleNurtureSort('receiveTime', 'oldest')">最旧排序</button>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="width:105px; text-align:right; font-size:13px; font-weight:600; color:#334155; flex-shrink:0;">计划回访时间：</span>
            <input class="form-input" type="date" style="width:145px;" />
            <span style="color:#94a3b8;">➔</span>
            <input class="form-input" type="date" style="width:145px;" />
            <div class="sort-btn-group" data-sort-group="planTime" style="margin-left:10px;">
              <button type="button" class="btn-sort ${nurtureSortState.planTime === 'newest' ? 'active' : ''}" onclick="toggleNurtureSort('planTime', 'newest')">最新排序</button>
              <button type="button" class="btn-sort ${nurtureSortState.planTime === 'oldest' ? 'active' : ''}" onclick="toggleNurtureSort('planTime', 'oldest')">最旧排序</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
  document.getElementById('leadDispatchRuleModalFooter').innerHTML = `
    <button class="btn-cancel" type="button" onclick="resetNurtureTaskFilterModal()">重 置</button>
    <button class="btn-save" type="button" onclick="applyNurtureTaskFilterModal()">确 定</button>
  `;
  const modal = document.getElementById('leadDispatchRuleModal');
  if (modal) {
    modal.classList.add('compact-filter-modal');
    modal.classList.add('show');
  }
}

function toggleNurtureSort(group, sortType) {
  nurtureSortState[group] = sortType;
  const container = document.querySelector(`.sort-btn-group[data-sort-group="${group}"]`);
  if (container) {
    container.querySelectorAll('.btn-sort').forEach(btn => {
      const isNewestBtn = btn.textContent.includes('最新');
      if ((sortType === 'newest' && isNewestBtn) || (sortType === 'oldest' && !isNewestBtn)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}

function resetNurtureTaskFilterModal() {
  nurtureSortState = { assignTime: 'newest', receiveTime: 'newest', planTime: 'newest' };
  openNurtureTaskFilterModal();
}

function applyNurtureTaskFilterModal() {
  const modal = document.getElementById('leadDispatchRuleModal');
  if (modal) modal.classList.remove('compact-filter-modal');
  closeModal('leadDispatchRuleModal');
  showToast('已应用筛选条件与系统排序，列表已更新', true);
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
          原归属坐席 <strong>客服张三</strong> 超时未跟进，线索已自动转接给您，请接续沟通。
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
  if (activeNurtureTaskSideTab === 'insight') {
    const insight = task.aiInsight || {
      levelText: task.level || '高',
      score: 80,
      levelColor: '#be123c',
      htmlNote: `当前评为<strong>${task.level || '高'}等级</strong>：关注<strong>${task.series}</strong>的产品配置与购车优惠，建议围绕到店试驾和金融方案推进。`
    };
    
    const tags = task.insightTags || {
      basic: [
        ['年龄段', '25-35岁'], ['职业', '企业管理人员'], ['预测婚否', '已婚'],
        ['预测是否有孩', '有'], ['预测消费水平', '中高'], ['预测收入水平', '中高'],
        ['预测人生阶段', '家庭成长期'], ['预测人生关键节点', '换购期'], ['预测是否有车', '是'],
        ['预测有车品牌', '日产'], ['有车品牌等级', '合资'], ['职业_外部', '企业管理'],
        ['省份组合', '江苏省'], ['常住城市等级', '新一线'], ['城市组合', '苏州'],
        ['区县组合', '吴中区'], ['最新车品牌', '日产'], ['最新车车系', '轩逸'],
        ['最新车车龄', '5年'], ['预测手机品牌', '华为'], ['预测在用手机价格区间', '5-8千'],
        ['预测设备使用时长', '4-6h'], ['预测作息时间偏好', '晚睡型'], ['预测上网最热时段', '晚高峰'],
        ['是否到店用户', '是'], ['预测性别', '男'], ['预测学历', '本科']
      ],
      status: [
        ['最近一次留资距今天数', '5天'], ['有效留资次数', '3次'], ['最近一次试驾距今天数', '3天'],
        ['最近一次到店距今天数', '3天'], ['试驾次数', '1次'], ['最新车当前里程数', '8万公里'],
        ['到店次数', '2次']
      ],
      preference: [
        ['近三月平台访问次数', '28次'], ['融合兴趣标签(30天)', '科技数码']
      ],
      carBackground: [
        ['预约到店日期', '2026-08-22'], ['预计用车时间', '1个月内'], ['品牌认知', '高'],
        ['购车预算', '16-20万'], ['关注竞品', '比亚迪宋PLUS'], ['购车关注点', '智能化'],
        ['购车顾虑点', '保值率'], ['用车场景', '家庭出游'], ['购买形态', '换购'],
        ['付款方式', '贷款'], ['车位情况', '有'], ['充电条件', '有'], ['已有车辆品牌', '日产']
      ]
    };

    const getTagValue = (labels) => {
      const allTags = [tags.basic, tags.status, tags.preference, tags.carBackground].flat();
      const matched = allTags.find(([label]) => labels.includes(label));
      return matched?.[1];
    };

    const purchaseType = getTagValue(['购买形态']);
    const useTime = getTagValue(['预计用车时间']);
    const budget = getTagValue(['购车预算']);
    const payment = getTagValue(['付款方式']);
    const focus = getTagValue(['购车关注点']);
    const competitor = getTagValue(['关注竞品']);
    const visits = getTagValue(['近三月平台访问次数']);
    const storeVisits = getTagValue(['到店次数']);
    const testDrives = getTagValue(['试驾次数']);
    const age = getTagValue(['年龄段']);
    const occupation = getTagValue(['职业', '职业_外部']);
    const city = getTagValue(['城市组合']);
    const familyStage = getTagValue(['预测人生阶段']);
    const tagSummary = [
      [age, occupation, city].filter(Boolean).join('、'),
      [familyStage && `处于${familyStage}`, purchaseType, useTime && `${useTime}购车`, budget && `预算${budget}`].filter(Boolean).join('，'),
      [focus && `重点关注${focus}`, payment && `倾向${payment}`, visits && `近三月访问${visits}`].filter(Boolean).join('，')
    ].filter(Boolean).join('；') || '当前命中标签较少，建议在本次沟通中补充购车需求与用车场景。';

    const renderFeatureGroup = (title, list) => {
      const validItems = (list || []).filter(([_, val]) => val !== undefined && val !== null && val !== '' && val !== '—');
      if (!validItems.length) return '';
      return `
        <section class="rating-feature-group">
          <div class="rating-feature-heading">
            <h6>${title}</h6>
          </div>
          <div class="rating-feature-tags">
            ${validItems.map(([label, val]) => `<span><em>${label}</em><strong>${val}</strong></span>`).join('')}
          </div>
        </section>
      `;
    };

    return `
      <div class="nurture-rating-panel">
        <div class="rating-result-label">预评结果</div>
        <div class="rating-score-strip">
          <strong class="rating-level" style="color:${insight.levelColor}">${insight.levelText}</strong>
          <strong class="rating-score">${insight.score}<small>分</small></strong>
          <div class="rating-progress"><i style="width:${Math.min(100, Math.max(0, insight.score))}%; background:${insight.levelColor}"></i></div>
          <span class="rating-percent">${insight.score}%</span>
        </div>

        <section class="rating-summary-block">
          <h5>预评小结</h5>
          <div class="rating-summary-copy">${insight.htmlNote}</div>
        </section>

        <section class="rating-features-block">
          <h5>客户特征</h5>
          <div class="tag-summary-block">
            <h6>标签小结</h6>
            <p>${tagSummary}。</p>
          </div>
          ${renderFeatureGroup('基础画像', tags.basic)}
          ${renderFeatureGroup('互动表现', tags.status)}
          ${renderFeatureGroup('兴趣偏好', tags.preference)}
          ${renderFeatureGroup('购车需求', tags.carBackground)}
        </section>
      </div>
    `;
  }
  // 高保真回访记录时间轴 (100% 对齐截图)
  const defaultRecords = [
    {
      result: '无人接听下发',
      status: '无人接听',
      agent: '张敏',
      time: '2026-07-29 09:30',
      desc: '拨打电话3次均未接通，系统根据预设规则自动触发无人接听下发动作。',
      remark: '已自动转投下发队列，等待下一轮多渠道自动触达。',
      showReasonSummary: true,
      reasonSummary: '经AI多维度评估，外呼未接通但意向分达57，系统已将线索由C级提权至B级。建议采用<strong>“痛点直击”</strong>话术策略，优先致电跟进。'
    },
    {
      result: '下次回访',
      status: '正常接通',
      agent: '张敏',
      time: '2026-07-28 15:30',
      desc: '客户关注续航里程与置换补贴政策，约定本周末到店体验 N6 智驾版。',
      remark: '需提前一日电话回访确认到店行程与试驾专员安排。'
    },
    {
      result: '下次回访',
      status: '企微跟进',
      agent: '李雷',
      time: '2026-07-25 10:20',
      desc: '已通过微信发送 N6 官方选配手册与 2000 元购车膨胀券。',
      remark: '客户微信已查收，表示优先考虑置换方案。'
    }
  ];

  const records = task.followRecords || defaultRecords;

  return `
    <div class="nurture-profile-block">
      <h4>回访记录</h4>
      <div class="nurture-timeline">
        ${records.map(rec => `
          <div class="nurture-timeline-item">
            <div class="nurture-timeline-dot"></div>
            <div class="nurture-timeline-head">
              <span class="nurture-timeline-result">${rec.result}</span>
              <span class="nurture-timeline-status-tag">${rec.status}</span>
            </div>
            <div class="nurture-timeline-meta">
              <span class="agent">@${rec.agent}</span>
              <span class="time">${rec.time}</span>
            </div>
            <div class="nurture-timeline-block">
              <label>回访描述</label>
              <p>${rec.desc}</p>
            </div>
            <div class="nurture-timeline-block">
              <label>备注信息</label>
              <p>${rec.remark}</p>
            </div>
            ${(rec.showReasonSummary || (rec.result === '无人接听下发' && task.level === 'C')) ? `
              <div class="nurture-dispatch-summary-box">
                <div class="summary-title">💡 下发原因小结</div>
                <p class="summary-desc">${rec.reasonSummary || '经AI多维度评估，外呼未接通但意向分达57，系统已将线索由C级提权至B级。建议采用<strong>“痛点直击”</strong>话术策略，优先致电跟进。'}</p>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
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
    if (action === 'open-rating-result') { nurtureTaskProfileExpanded = true; activeNurtureTaskSideTab = 'insight'; renderNurtureTaskPage(); return; }
    if (action === 'toggle-utility-menu') { nurtureTaskUtilityMenuOpen = !nurtureTaskUtilityMenuOpen; renderNurtureTaskPage(); return; }
    if (action === 'emergency-call') { showToast('已发起手动紧急外拨，预测外呼预约队列已自动撤销', true); return; }
    if (action === 'submit') { showToast('回访结果已保存，下次回访任务已自动推送到预测外呼队列', true); return; }
    if (action === 'pause') { showToast('回访任务已暂存', true); return; }
    if (action === 'send-sms') { showToast('短信关怀模板已发送至客户手机', true); return; }
    if (action === 'store-query') { showToast('已调取意向门店地图、展厅状态与试驾车辆库存', true); return; }
    if (action === 'drive-record') { showToast('已检索并展开客户历史试驾预约与评价记录', true); return; }
    if (action === 'claim') showToast('已领取当前队列中的首条任务', true);
    if (action === 'refresh') showToast('任务队列已刷新', true);
  });
  page.addEventListener('change', event => {
    if (!event.target.matches('[data-nurture-visit-result]')) return;
    const needsFollowup = ['下次回访', '有意向', '待考虑'].includes(event.target.value);
    page.querySelectorAll('.nurture-visit-followup-field').forEach(field => field.classList.toggle('shown', needsFollowup));
  });
}
