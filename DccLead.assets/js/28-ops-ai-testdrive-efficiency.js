/**
 * 28-ops-ai-testdrive-efficiency.js
 * AI 试驾排程效能看板 (统计报表子页面)
 * 1:1 对齐《AI外呼试驾全自动排程_评审调整方案》第 6 节（体验与 ROI 目标）与第 7.2 节监控要求
 */

(function() {
  'use strict';

  let currentPeriod = '7d';
  let metricPopoverTrigger = null;

  const AI_METRIC_INFO = {
    completeness: {
      title: '四项信息采全率',
      definition: '衡量 AI 在一次明确试驾意向沟通中，是否完成车系、门店、预约日期和试驾时段四项信息采集，并获得客户确认。',
      rule: '分子为统计周期内四项信息均有效且已确认的 AI 试驾意向通话数；分母为统计周期内表达明确到店试驾意向的 AI 接通通话数。按 call_session_id 去重。',
      trend: '较上一相同统计周期上升 2.3 个百分点；这里的“百分点”表示两期比例的直接差值，并非数量增长 2.3%。',
      note: '当前 88.5% = 2,832 / 3,200。'
    },
    prebuilt: {
      title: 'DCC 建单成功率',
      definition: '统计带试驾排程标识的建单处理结果。',
      rule: '正式统计分母应取带试驾排程标识的有效建单请求；建单和厂商同步分别计量。',
      note: '原有页面数值仅为展示样例，不作为实际服务结果或新统计需求。'
    },
    callback: {
      title: 'AI 随路数据回传成功率',
      definition: '衡量 AI 通话结束后，是否向 DCC 完整回传包含结果标签、四要素、通话小结及录音关联的数据包。',
      rule: '分子为统计周期内收到有效 AI 随路数据包的通话数；分母为统计周期内已发起 AI 试驾外呼的意向通话数。按 call_session_id 去重。',
      trend: '较上一相同统计周期上升 0.8 个百分点；用于观察 AI 回调链路的完整性变化。',
      note: '当前 98.5% = 2,790 / 2,832。'
    },
    conflict: {
      title: '试驾排程标识建单',
      definition: 'AI返回数据带「试驾排程」标识时创建排程工单。',
      rule: '不以弱意向或四要素采集完整率新增建单拦截条件。',
      note: '业务规则已确认；本卡为规则说明，不展示未经验证的拦截统计。'
    },
    noCapacity: {
      title: '可用时段补位',
      definition: '返回时段无可用空档时，选择可用时段继续排程。',
      rule: '采用该日期下最新有空档的时段，或者下个工作日最早有空档的时段。',
      note: '具体排序及两者均无空档的情况，按既有排程服务契约核对；不默认转线索。'
    },
    hqFollow: {
      title: '总部回访工单生成量',
      definition: '统计异常履约后，符合总部电销回访准入且门店补救未达标时，由系统生成的试驾排程回访工单量。',
      rule: '以履约状态更新时间 T 为统计基准；状态映射“是否需总部电销回访=是”，且 T+1 无有效门店回访，或已回访但 T+3 未取得完成重排回传时计入。同一预约的同一次异常事件仅计一次。',
      note: '当前 68 单不包含系统取消（线索无效）场景。'
    },
    savedHours: {
      title: '累计节省人工工时',
      definition: '估算 AI 完成四项信息采集、建单和中台同步后，相比人工逐笔执行排程流程所减少的操作工时。',
      rule: '逐条取统计周期内“AI 建单成功、正式下发店端且 NEV 同步成功”的去重预约记录，按对应排程类型匹配《人工排程基准耗时》配置，并将各记录的基准分钟数汇总后除以 60。公式：累计节省工时 = Σ（有效 AI 排程记录 × 对应人工基准耗时〔分钟〕）÷ 60；不包含异常履约后的总部人工回访时长。',
      breakdown: '<table class="ai-metric-breakdown"><thead><tr><th>人工排程基准分组</th><th>有效记录</th><th>单笔基准耗时</th><th>合计</th></tr></thead><tbody><tr><td>常规新建排程</td><td>2,140 条</td><td>4 分钟</td><td>8,560 分钟</td></tr><tr><td>需补充核验的排程</td><td>440 条</td><td>6 分 15 秒</td><td>2,750 分钟</td></tr><tr><td><strong>合计</strong></td><td><strong>2,580 条</strong></td><td>—</td><td><strong>11,310 分钟</strong></td></tr></tbody></table><div class="ai-metric-data-rule"><strong>数据统计与分组说明</strong><ol><li><b>有效排程筛选：</b>仅统计周期内由 AI 外呼且最终下发店端成功的真实试驾预约（已剔除重复记录与未履约/失败单）。</li><li><b>较复杂排程（需补充核验 · 折合 6 分 15 秒/单）：</b>AI 在通话中存在改动或深度核验的单据，包括：客户临时变更过预约日期或时段、更正过个人信息、或门店档期紧张触发深度核验（多项命中仍计 1 笔）。</li><li><b>顺畅标准排程（常规新建 · 折合 4 分钟/单）：</b>客户一次性确认时间、门店、车型与信息，AI 无需二次改动直接办结的标准预约。</li></ol><p>💡 业务说明：以上两类共计 2,580 笔，均由 AI 全程自动化完成；分组仅用于对应不同复杂度下“若是人工处理所需耗费的基准时间”。</p></div><p class="ai-metric-breakdown-tip">样例计算：2,140 × 4 + 440 × 6.25 = 11,310 分钟；11,310 ÷ 60 = 188.5 小时。正式上线后，这两类记录数及单笔基准耗时应读取《人工排程基准耗时》配置与实际业务记录，不应写死在页面。</p>',
      note: '按 8 小时 / 坐席人天换算，188.5 ÷ 8 = 23.5625，展示为约 23.6 个坐席人天。该指标仅用于评估 AI 前段排程自动化收益。'
    },
    funnelCard: {
      title: 'AI试驾数据与建单观察',
      definition: '采集完整率用于观察数据质量；带试驾排程标识则创建排程工单。',
      rule: '采集、建单、同步分别观察，不将采集不完整或时段无空档直接推断为不建单或转线索。',
      note: '现有数量仅演示展示，各阶段分母需以服务契约核对；不宣称互斥或统计已闭环。'
    },
    fluencyCard: {
      title: 'AI 对话流畅度（时段查询耗时）',
      definition: '衡量 AI 在通话中获取目标门店可用试驾时段时的响应速度，核心业务价值在于彻底防止 AI 交互时“冷场、发呆”，保证客户在电话中体验到如真人销售顾问般即时、自然的对答。',
      rule: '统计口径与算法规则：<br>1. <b>统计基数</b>：已敲定“门店 + 日期”的 2,832 次时段查询（call_session_id + query_id 唯一去重，一次查询只算一次）；<br>2. <b>耗时服务端打点</b>：DCC 服务端返回时间 - 接收时间（response_ms = response_at - request_at），由单一服务端记录消除多端时钟偏差；<br>3. <b>耗时分档聚合（互斥加和 = 100%）</b>：<br>• 🟢 <b>0–50ms 即时响应（96.8%）</b>：耗时 ≤ 50ms 且命中 Pre-fetch 缓存（cache_hit=true），完全秒回，客户毫无等待感；<br>• 🟡 <b>50–200ms 轻量校验（2.6%）</b>：弱校验返回，眨眼级轻微核实，听觉上没有感知延迟；<br>• ⚪ <b>客户改期重拉取（0.6%）</b>：客户通话中主动变更预约日期重新查询（正常业务变更，单列排除）；<br>• 🔴 <b>> 200ms 明显停顿（0 次 · 0%）</b>：耗时超过 200ms 的明显卡顿（全周期实绩为 0 次，零冷场）；<br>4. <b>核心性能指标</b>：P50 为 18ms（中位数，即半数以上查询极速完成）；P95 为 72ms（95% 用户体验耗时），远低于人类感知停顿的 200ms 阈值。',
      note: '实现原则：本期不新增前端埋点，复用 DCC 现有的“试驾可用性查询”基础服务，每次查询顺手记录一条日志即可，以极低成本实现服务可测。'
    },
    syncCard: {
      title: 'AI试驾建单与同步',
      definition: '收到带试驾排程标识的数据后创建排程工单，并记录同步结果。',
      rule: '返回时段不可用时按已确认的时段补位规则处理。',
      note: '建单成功不等于厂商同步成功；真实数据与回执待联调。'
    },
    remedyCard: {
      title: '异常履约总部回访承接监控',
      definition: '针对预约后因故未能顺利到店完成试驾的异常场景（用户取消、门店取消、逾期未到店），系统优先保障专营店在 T+1 至 T+3 窗口期内自主联系挽回；若门店超时未补救或补救未成功，由总部电销坐席生成试驾排程回访工单进行兜底承接。',
      rule: '统计规则与口径说明：<br>1. <b>统计时间基准 T</b>：履约异常发生当日（如客户触发取消或订单逾期未到店的时间点）；<br>2. <b>门店补救校验规则（T+1 / T+3）</b>：<br>• <b>用户取消</b>：T+1（24小时内）若专营店未录入有效回访记录，判定门店未补救，触发总部工单；<br>• <b>门店取消与已逾期</b>：T+1 门店未回访，或 T+3（72小时内）未取得重新排程结果回传，触发总部工单；<br>• <b>系统取消（线索无效）</b>：如空号/停机等无效线索，直接归档不兜底，生成 0 单；<br>3. <b>事件量 vs 生成工单量差值原因</b>：<br>• 用户取消：42 笔事件中，有 11 笔在 T+1 窗口期内被专营店成功化解挽回，仅超时的 31 笔生成总部回访工单；<br>• 门店取消：18 笔事件中，门店自行改期 4 笔，超时未解决的 14 笔生成总部工单；<br>• 已逾期：26 笔事件中，门店完成改期 3 笔，其余 23 笔生成总部工单；<br>4. <b>防重规则</b>：同一预约的同一次异常事件仅计入一张有效回访工单；后续校验仅更新状态，不重复计数。',
      note: '业务价值：既赋予专营店充分的自主挽回空间，又通过总部兜底机制防止潜客流失。'
    }
  };

  function closeAiEfficiencyMetricInfo() {
    document.getElementById('aiEfficiencyMetricPopover')?.remove();
    document.querySelectorAll('#opsAiTestDriveEfficiencyPage .ai-efficiency-metric-card').forEach(card => card.classList.remove('metric-info-active'));
    metricPopoverTrigger = null;
  }

  function positionAiEfficiencyMetricInfo() {
    const popover = document.getElementById('aiEfficiencyMetricPopover');
    if (!popover || !metricPopoverTrigger || !document.body.contains(metricPopoverTrigger)) return;
    const rect = metricPopoverTrigger.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      closeAiEfficiencyMetricInfo();
      return;
    }
    const width = Math.min(480, window.innerWidth - 32);
    const height = popover.offsetHeight || 250;
    const left = Math.max(16, Math.min(rect.left, window.innerWidth - width - 16));
    let top = rect.bottom + 10;
    if (top + height > window.innerHeight) top = rect.top - height - 10;
    top = Math.max(16, Math.min(top, window.innerHeight - height - 16));
    popover.style.width = `${width}px`;
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  }

  function showAiEfficiencyMetricInfo(metric, element) {
    const info = AI_METRIC_INFO[metric];
    if (!info || !element) return;
    const existing = document.getElementById('aiEfficiencyMetricPopover');
    if (existing?.dataset.metric === metric) {
      closeAiEfficiencyMetricInfo();
      return;
    }
    closeAiEfficiencyMetricInfo();
    element.classList.add('metric-info-active');
    metricPopoverTrigger = element;
    const popover = document.createElement('div');
    popover.id = 'aiEfficiencyMetricPopover';
    popover.className = 'ai-efficiency-metric-popover';
    popover.dataset.metric = metric;
    const trendHtml = info.trend ? `<div><b>率值说明</b>${info.trend}</div>` : '';
    const breakdownHtml = info.breakdown ? `<div><b>当前样例的计算明细</b>${info.breakdown}</div>` : '';
    popover.innerHTML = `<div class="ai-metric-popover-head"><strong>${info.title} · 指标说明</strong><button type="button" aria-label="关闭指标说明" onclick="window.closeAiEfficiencyMetricInfo()">×</button></div><div class="ai-metric-popover-body"><div><b>指标说明</b>${info.definition}</div><div><b>统计口径</b>${info.rule}</div>${breakdownHtml}${trendHtml}<div class="ai-metric-popover-note">${info.note}</div></div>`;
    document.body.appendChild(popover);
    positionAiEfficiencyMetricInfo();
  }

  function ensureAiEfficiencyMetricInfoStyle() {
    if (document.getElementById('aiEfficiencyMetricInfoStyle')) return;
    document.head.insertAdjacentHTML('beforeend', `<style id="aiEfficiencyMetricInfoStyle">#opsAiTestDriveEfficiencyPage .ai-efficiency-metric-card{font-family:inherit;text-align:left;cursor:pointer;position:relative;width:100%;min-height:122px;transition:border-color .16s,box-shadow .16s}#opsAiTestDriveEfficiencyPage .ai-efficiency-metric-card:hover,#opsAiTestDriveEfficiencyPage .ai-efficiency-metric-card.metric-info-active{border-color:#93c5fd!important;box-shadow:0 4px 12px rgba(37,99,235,.12)!important}#opsAiTestDriveEfficiencyPage .ai-metric-click-hint{position:absolute;right:12px;bottom:10px;color:#94a3b8;font-size:10px}.ai-demo-data-note{font-size:11px;color:#64748b;white-space:nowrap}.ai-funnel-integrity-warning{margin-top:8px;padding:7px 9px;border:1px solid #fed7aa;border-radius:5px;background:#fff7ed;color:#9a3412;font-size:11px;line-height:1.5}.ai-metric-inline-hint{transition:all .15s ease}.ai-metric-inline-hint:hover{background:#dbeafe!important;border-color:#60a5fa!important;transform:translateY(-1px)}.ai-efficiency-metric-popover{position:fixed;z-index:10050;max-height:calc(100vh - 32px);display:flex;flex-direction:column;border:1px solid #bfdbfe;border-radius:9px;background:#fff;box-shadow:0 14px 34px rgba(15,23,42,.18);overflow:hidden}.ai-metric-popover-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 13px;background:#eff6ff;color:#1d4ed8;font-size:13px}.ai-metric-popover-head button{border:0;background:transparent;color:#64748b;font-size:20px;line-height:1;cursor:pointer}.ai-metric-popover-body{flex:1;overflow-y:auto;padding:12px 13px;color:#475569;font-size:12px;line-height:1.6}.ai-metric-popover-body>div{margin-bottom:10px}.ai-metric-popover-body>div:last-child{margin-bottom:0}.ai-metric-popover-body b{display:block;margin-bottom:2px;color:#334155;font-size:12px}.ai-metric-popover-note{padding:8px 9px;border-radius:5px;background:#f8fafc;color:#2563eb}.ai-metric-breakdown{width:100%;margin-top:5px;border-collapse:collapse;font-size:11px}.ai-metric-breakdown th,.ai-metric-breakdown td{padding:5px 4px;border:1px solid #dbeafe;text-align:right;vertical-align:top}.ai-metric-breakdown th:first-child,.ai-metric-breakdown td:first-child{text-align:left}.ai-metric-breakdown th{background:#f8fafc;color:#64748b;font-weight:600}.ai-metric-data-rule{margin-top:9px;padding:8px 9px;border-left:3px solid #60a5fa;background:#f8fbff;color:#475569;font-size:11px;line-height:1.55}.ai-metric-data-rule strong{display:block;color:#1d4ed8;margin-bottom:3px}.ai-metric-data-rule ol{margin:4px 0 4px 17px;padding:0}.ai-metric-data-rule p{margin:5px 0 0}.ai-metric-breakdown-tip{margin:7px 0 0;color:#64748b;font-size:11px;line-height:1.5}@media(max-width:1100px){#opsAiTestDriveEfficiencyPage .kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:640px){#opsAiTestDriveEfficiencyPage .kpi-grid{grid-template-columns:1fr!important}.ai-demo-data-note{display:none}}</style>`);
    document.addEventListener('scroll', positionAiEfficiencyMetricInfo, true);
    window.addEventListener('resize', positionAiEfficiencyMetricInfo);
  }

  function renderOpsAiTestDriveEfficiencyPage() {
    const container = document.getElementById('opsAiTestDriveEfficiencyPage');
    if (!container) return;
    ensureAiEfficiencyMetricInfoStyle();
    closeAiEfficiencyMetricInfo();

    container.innerHTML = `
      <div class="mw-report-container" style="padding:16px 20px; max-width:1480px; margin:0 auto;">
        <!-- 页面顶部 Hero -->
        <header class="page-hero" style="background:linear-gradient(135deg, #ffffff 0%, #f8faff 100%); border:1px solid #e2e8f0; border-radius:10px; padding:20px 24px; margin-bottom:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
              <h2 style="margin:0; font-size:20px; font-weight:800; color:#0f172a;">AI 试驾排程效能看板</h2>
              <span style="font-size:11px; font-weight:700; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; padding:2px 8px; border-radius:12px;">AI 建单 · 门店补救 · 总部兜底</span>
            </div>
            <p style="margin:0; font-size:13px; color:#64748b; line-height:1.5;">前段监控 AI 外呼试驾建单与 NEV 同步效能；后段按履约状态更新时间监控门店补救及总部试驾排程回访承接。</p>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <span style="font-size:11px; color:#64748b; white-space:nowrap;">时间范围（示例）</span>
            <div class="period-toggle" style="display:flex; background:#f1f5f9; padding:3px; border-radius:6px; border:1px solid #e2e8f0;">
              <button type="button" class="btn-period ${currentPeriod==='today'?'active':''}" style="padding:4px 12px; border:none; background:${currentPeriod==='today'?'#fff':'none'}; color:${currentPeriod==='today'?'#2563eb':'#64748b'}; font-weight:${currentPeriod==='today'?'700':'500'}; font-size:12px; border-radius:4px; cursor:pointer; box-shadow:${currentPeriod==='today'?'0 1px 2px rgba(0,0,0,0.05)':'none'};" onclick="window.switchAiEfficiencyPeriod('today')">今日实时</button>
              <button type="button" class="btn-period ${currentPeriod==='7d'?'active':''}" style="padding:4px 12px; border:none; background:${currentPeriod==='7d'?'#fff':'none'}; color:${currentPeriod==='7d'?'#2563eb':'#64748b'}; font-weight:${currentPeriod==='7d'?'700':'500'}; font-size:12px; border-radius:4px; cursor:pointer; box-shadow:${currentPeriod==='7d'?'0 1px 2px rgba(0,0,0,0.05)':'none'};" onclick="window.switchAiEfficiencyPeriod('7d')">近 7 天</button>
              <button type="button" class="btn-period ${currentPeriod==='30d'?'active':''}" style="padding:4px 12px; border:none; background:${currentPeriod==='30d'?'#fff':'none'}; color:${currentPeriod==='30d'?'#2563eb':'#64748b'}; font-weight:${currentPeriod==='30d'?'700':'500'}; font-size:12px; border-radius:4px; cursor:pointer; box-shadow:${currentPeriod==='30d'?'0 1px 2px rgba(0,0,0,0.05)':'none'};" onclick="window.switchAiEfficiencyPeriod('30d')">近 30 天</button>
            </div>
            <span class="ai-demo-data-note" title="当前页面使用固定示例数据，尚未接入真实统计接口">原型示例数据</span>
            <button type="button" class="btn-secondary" style="height:32px; padding:0 14px; background:#fff; border:1px solid #d9d9d9; border-radius:4px; font-size:12px; color:#1e293b; cursor:pointer; font-weight:500;" onclick="if(typeof showToast==='function') showToast('当前为原型示例数据，导出功能尚未接入真实数据', false);">导出示例数据</button>
            <button type="button" class="btn-secondary" style="height:32px; padding:0 14px; background:#2563eb; border:1px solid #2563eb; border-radius:4px; font-size:12px; color:#fff; cursor:pointer; font-weight:500;" onclick="renderOpsAiTestDriveEfficiencyPage(); if(typeof showToast==='function') showToast('示例数据已重新加载', true);">重新加载示例</button>
          </div>
        </header>

        <!-- 核心指标卡：按指标组覆盖前段建单、同步质量、异常承接与 ROI -->
        <section class="kpi-grid" style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:14px; margin-bottom:18px;">
          <div class="kpi-card ai-efficiency-metric-card" role="button" tabindex="0" onclick="window.showAiEfficiencyMetricInfo('completeness', this)" style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size:12px; color:#64748b; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
              <span>四项信息采全率</span>
              <span style="font-size:11px; color:#059669; font-weight:600;">↑ 2.3 个百分点</span>
            </div>
            <div style="font-size:24px; font-weight:800; color:#0f172a; line-height:1.2;">88.5%</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:4px;">采全 2,832 / 意向 3,200 通</div>
            <span class="ai-metric-click-hint">点击查看口径</span>
          </div>

          <div class="kpi-card ai-efficiency-metric-card" role="button" tabindex="0" onclick="window.showAiEfficiencyMetricInfo('prebuilt', this)" style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size:12px; color:#64748b; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
              <span>DCC 即时建单成功率</span>
              <span style="font-size:11px; color:#059669; font-weight:600;">↑ 1.1 个百分点</span>
            </div>
            <div style="font-size:24px; font-weight:800; color:#2563eb; line-height:1.2;">92.3%</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:4px;">生成成功 2,614 / 请求 2,832 单</div>
            <span class="ai-metric-click-hint">点击查看口径</span>
          </div>

          <div class="kpi-card ai-efficiency-metric-card" role="button" tabindex="0" onclick="window.showAiEfficiencyMetricInfo('callback', this)" style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size:12px; color:#64748b; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
              <span>AI 随路回传成功率</span>
              <span style="font-size:11px; color:#059669; font-weight:600;">↑ 0.8 个百分点</span>
            </div>
            <div style="font-size:24px; font-weight:800; color:#059669; line-height:1.2;">98.5%</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:4px;">已回传 2,790 / 采全 2,832 单</div>
            <span class="ai-metric-click-hint">点击查看口径</span>
          </div>

          <div class="kpi-card ai-efficiency-metric-card" role="button" tabindex="0" onclick="window.showAiEfficiencyMetricInfo('conflict', this)" style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size:12px; color:#64748b; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
              <span>试驾排程标识建单</span>
              <span style="font-size:11px; color:#64748b; font-weight:normal;">已确认规则</span>
            </div>
            <div style="font-size:24px; font-weight:800; color:#d97706; line-height:1.2;">按标识建单</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:4px;">带「试驾排程」标识即创建工单</div>
            <span class="ai-metric-click-hint">点击查看口径</span>
          </div>

          <div class="kpi-card ai-efficiency-metric-card" role="button" tabindex="0" onclick="window.showAiEfficiencyMetricInfo('noCapacity', this)" style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size:12px; color:#64748b; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <span>可用时段补位</span>
              <span style="font-size:11px; color:#0891b2; font-weight:600; white-space:nowrap;">沿用既有排程能力</span>
            </div>
            <div style="font-size:24px; font-weight:800; color:#0891b2; line-height:1.2;">补位处理</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:4px;">当日可用时段 / 下个工作日最早空档</div>
            <span class="ai-metric-click-hint">点击查看口径</span>
          </div>

          <div class="kpi-card ai-efficiency-metric-card" role="button" tabindex="0" onclick="window.showAiEfficiencyMetricInfo('hqFollow', this)" style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size:12px; color:#64748b; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
              <span>总部回访工单生成量</span>
              <span style="font-size:11px; color:#7c3aed; font-weight:600;">门店补救超时兜底</span>
            </div>
            <div style="font-size:24px; font-weight:800; color:#7c3aed; line-height:1.2;">68 <small style="font-size:12px; font-weight:normal;">单</small></div>
            <div style="font-size:11px; color:#94a3b8; margin-top:4px;">T+1 未回访或 T+3 未重排触发</div>
            <span class="ai-metric-click-hint">点击查看口径</span>
          </div>

          <div class="kpi-card ai-efficiency-metric-card" role="button" tabindex="0" onclick="window.showAiEfficiencyMetricInfo('savedHours', this)" style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size:12px; color:#64748b; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
              <span>累计节省人工工时</span>
              <span style="font-size:11px; color:#059669; font-weight:600;">ROI 标杆</span>
            </div>
            <div style="font-size:24px; font-weight:800; color:#0f172a; line-height:1.2;">188.5 <small style="font-size:12px; font-weight:normal;">小时</small></div>
            <div style="font-size:11px; color:#94a3b8; margin-top:4px;">11,310 分钟 ÷ 60；约 23.6 个坐席人天</div>
            <span class="ai-metric-click-hint">点击查看口径</span>
          </div>
        </section>

        <!-- 中部：全生命周期转化漏斗 与 Pre-fetch 体验分布 -->
        <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:16px; margin-bottom:18px;">
          <!-- 转化漏斗卡片 -->
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <h3 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">AI 建单与中台同步漏斗</h3>
                  <button type="button" class="ai-metric-inline-hint" onclick="window.showAiEfficiencyMetricInfo('funnelCard', this)" style="border:1px solid #bfdbfe; background:#eff6ff; color:#1d4ed8; font-size:11px; font-weight:600; padding:2px 8px; border-radius:4px; cursor:pointer;" title="查看漏斗各阶段指标定义与统计口径">ⓘ 口径说明</button>
                </div>
                <span style="font-size:12px; color:#64748b;">基准呼叫量：10,000 通接通</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:10px;">
                <!-- 漏斗阶段 1 -->
                <div style="background:#f8fafc; border-radius:6px; padding:10px 14px; border:1px solid #e2e8f0;">
                  <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:#334155; margin-bottom:4px;">
                    <span>① AI外呼成功接通</span>
                    <span>10,000 通 (100%)</span>
                  </div>
                  <div style="width:100%; height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
                    <div style="width:100%; height:100%; background:#94a3b8;"></div>
                  </div>
                </div>

                <!-- 漏斗阶段 2 -->
                <div style="background:#f8fafc; border-radius:6px; padding:10px 14px; border:1px solid #e2e8f0;">
                  <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:#334155; margin-bottom:4px;">
                    <span>② 表达明确到店试驾意向</span>
                    <span>3,200 通 (32.0%)</span>
                  </div>
                  <div style="width:100%; height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
                    <div style="width:32%; height:100%; background:#60a5fa;"></div>
                  </div>
                </div>

                <!-- 漏斗阶段 3 -->
                <div style="background:#f8fafc; border-radius:6px; padding:10px 14px; border:1px solid #e2e8f0;">
                  <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:#334155; margin-bottom:4px;">
                    <span>③ 四要素采全并随路交付</span>
                    <span>2,832 单（意向→采全 88.5%；接通→交付 28.3%）</span>
                  </div>
                  <div style="width:100%; height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
                    <div style="width:28.3%; height:100%; background:#2563eb;"></div>
                  </div>
                </div>

                <!-- 已确认业务规则；不沿用旧示例的缺项/无份额分流推断。 -->
                <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:12px 14px;color:#334155;font-size:12px;line-height:1.8;">
                  <strong>④ 标识建单与时段补位</strong><br>
                  AI返回数据带「试驾排程」标识即创建排程工单。时段无可用空档时，采用该日期下最新有空档的时段，或者下个工作日最早有空档的时段。<br>
                  建单结果与同步状态分别记录；采集完整率不作为新增拦截条件。
                </div>
              </div>
            </div>

            <!-- 卡片 1 底部指标说明与统计口径 -->
            <div style="background:#f8fafc; border-radius:6px; padding:10px 12px; border:1px solid #e2e8f0; font-size:11px; color:#475569; line-height:1.55; margin-top:12px;">
              <strong>展示口径：</strong>本页数量为原型样例。采集、建单及同步是不同阶段，不能直接作为互斥的最终去向相加；正式指标分母以服务数据核对。
            </div>
          </div>

          <!-- 可约时段响应体验：三类结果互斥，合计 100% -->
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <h3 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">AI 对话流畅度（时段查询耗时）</h3>
                  <button type="button" class="ai-metric-inline-hint" onclick="window.showAiEfficiencyMetricInfo('fluencyCard', this)" style="border:1px solid #bbf7d0; background:#f0fdf4; color:#166534; font-size:11px; font-weight:600; padding:2px 8px; border-radius:4px; cursor:pointer;" title="查看流畅度分档规则与统计口径">ⓘ 口径说明</button>
                </div>
                <span style="font-size:11px; padding:2px 6px; border-radius:3px; background:#dcfce7; color:#166534; font-weight:600;">对答极流畅</span>
              </div>
              <div style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:14px;">
                统计已敲定“门店 + 日期”的 2,832 次时段沟通：AI 在客户说出门店后提前拉取排期，客户说出时段即可无缝对答。三类结果互斥，合计 100%。
              </div>
              <div aria-label="时段响应结果分布图" style="display:flex; width:100%; height:18px; overflow:hidden; border-radius:6px; background:#e2e8f0; margin-bottom:12px;">
                <span title="0–50ms 即时响应：96.8%" style="width:96.8%; background:#10b981;"></span>
                <span title="50–200ms 轻量校验：2.6%" style="width:2.6%; min-width:8px; background:#3b82f6;"></span>
                <span title="客户改期重拉取：0.6%" style="width:0.6%; min-width:6px; background:#f59e0b;"></span>
              </div>
              <div style="display:grid; grid-template-columns:1fr; gap:8px; font-size:11px; color:#475569;">
                <div style="display:flex; justify-content:space-between; gap:10px;"><span><i style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981;"></i> <strong style="color:#0f172a;">0–50ms 即时响应</strong>：完全秒回，客户无停顿等待感知</span><strong style="color:#059669; white-space:nowrap;">96.8%</strong></div>
                <div style="display:flex; justify-content:space-between; gap:10px;"><span><i style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#3b82f6;"></i> <strong style="color:#0f172a;">50–200ms 轻量校验</strong>：眨眼级轻微核实，听觉无明显延迟</span><strong style="color:#2563eb; white-space:nowrap;">2.6%</strong></div>
                <div style="display:flex; justify-content:space-between; gap:10px;"><span><i style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#f59e0b;"></i> <strong style="color:#0f172a;">客户改期重拉取（业务事件）</strong>：客户中途变更日期后重新查询，不属于耗时分档</span><strong style="color:#d97706; white-space:nowrap;">0.6%</strong></div>
              </div>
              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-top:14px; padding-top:12px; border-top:1px solid #e2e8f0;">
                <div><div style="font-size:10px; color:#94a3b8;">中位数耗时 (P50)</div><strong style="font-size:14px; color:#0f172a;">18ms</strong></div>
                <div><div style="font-size:10px; color:#94a3b8;">95% 用户耗时 (P95)</div><strong style="font-size:14px; color:#0f172a;">72ms</strong></div>
                <div><div style="font-size:10px; color:#94a3b8;">明显停顿 (>200ms)</div><strong style="font-size:14px; color:#0f172a;">0 次</strong></div>
              </div>
            </div>

            <!-- 卡片 2 底部指标说明与统计口径 -->
            <div style="background:#f8fafc; border-radius:6px; padding:10px 12px; border:1px solid #e2e8f0; font-size:11px; color:#475569; line-height:1.55; margin-top:12px;">
              💡 <strong>指标说明与统计口径：</strong>衡量 AI 通话时查时段的响应速度，核心价值在<strong>彻底杜绝 AI 冷场发呆</strong>。<br>
              • <strong>0–50ms 秒回（96.8%）</strong>：耗时≤50ms 且命中缓存，客户毫无等待感；<br>
              • <strong>50–200ms 轻量校验（2.6%）</strong>：眨眼级轻微核实，听觉无感；<strong>改期重查（0.6%）</strong>：客户改期单独归类；<br>
              • <strong>P50 中位数 18ms、P95 72ms、>200ms 明显停顿 0 次</strong>，按单端服务日志打点（0 新增埋点成本）。
            </div>
          </div>
        </div>

        <section class="card" style="padding:18px;margin-bottom:16px;">
          <h3 style="margin-top:0;">AI试驾排程处理规则</h3>
          <table class="mw-report-table" style="width:100%;border-collapse:collapse;"><thead><tr><th>场景</th><th>处理方式</th></tr></thead><tbody>
          <tr><td>返回数据带试驾排程标识</td><td>创建试驾排程工单，一般使用返回的试驾日期。</td></tr>
          <tr><td>返回时段无可用空档</td><td>采用该日期下最新有空档的时段，或者下个工作日最早有空档的时段。</td></tr>
          <tr><td>结果展示</td><td>区分DCC建单结果与厂商同步结果；通知沿用现状。</td></tr>
          </tbody></table>
        </section>

        <section style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:14px;">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <h3 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">异常履约总部回访承接监控</h3>
                <button type="button" class="ai-metric-inline-hint" onclick="window.showAiEfficiencyMetricInfo('remedyCard', this)" style="border:1px solid #e9d5ff; background:#faf5ff; color:#6b21a8; font-size:11px; font-weight:600; padding:2px 8px; border-radius:4px; cursor:pointer;" title="查看异常履约与门店补救回访统计口径">ⓘ 口径说明</button>
              </div>
              <p style="margin:4px 0 0; font-size:12px; color:#64748b;">按履约状态更新时间 <b>T</b> 统计；仅状态映射允许且门店补救未达标时，才生成总部试驾排程回访工单。</p>
            </div>
            <span style="font-size:11px; padding:3px 8px; border-radius:10px; background:#faf5ff; color:#7c3aed; white-space:nowrap;">统计基数：异常履约事件</span>
          </div>
          <div style="overflow-x:auto;">
            <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; min-width:1060px;">
              <thead><tr style="background:#f8fafc; color:#64748b; border-bottom:1px solid #e2e8f0;"><th style="padding:10px 12px;">履约异常场景</th><th style="padding:10px 12px;">是否需总部电销回访</th><th style="padding:10px 12px;">门店补救校验口径（T+1 / T+3 规则）</th><th style="padding:10px 12px;">总部回访工单</th><th style="padding:10px 12px;">分派路径</th><th style="padding:10px 12px; text-align:right;">事件量</th><th style="padding:10px 12px; text-align:right;">生成工单量</th></tr></thead>
              <tbody>
                <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 12px; font-weight:600;">用户取消</td><td style="padding:10px 12px;"><span style="color:#166534;">是</span></td><td style="padding:10px 12px; color:#475569;">T+1 门店未回访（42 件中 11 件门店已自救挽回，剩余 31 件超时转总部）</td><td style="padding:10px 12px;"><span style="color:#6d28d9; font-weight:600;">已生成</span></td><td style="padding:10px 12px;">按原始渠道分派</td><td style="padding:10px 12px; text-align:right;">42</td><td style="padding:10px 12px; text-align:right; font-weight:700; color:#7c3aed;">31</td></tr>
                <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 12px; font-weight:600;">门店取消</td><td style="padding:10px 12px;"><span style="color:#166534;">是</span></td><td style="padding:10px 12px; color:#475569;">T+1 未回访或 T+3 未重排（18 件中 4 件门店已改期，剩余 14 件超时转总部）</td><td style="padding:10px 12px;"><span style="color:#6d28d9; font-weight:600;">已生成</span></td><td style="padding:10px 12px;">按原始渠道分派</td><td style="padding:10px 12px; text-align:right;">18</td><td style="padding:10px 12px; text-align:right; font-weight:700; color:#7c3aed;">14</td></tr>
                <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 12px; font-weight:600;">已逾期</td><td style="padding:10px 12px;"><span style="color:#166534;">是</span></td><td style="padding:10px 12px; color:#475569;">T+1 未回访或 T+3 未重排（26 件中 3 件门店已改期，剩余 23 件超时转总部）</td><td style="padding:10px 12px;"><span style="color:#6d28d9; font-weight:600;">已生成</span></td><td style="padding:10px 12px;">按原始渠道分派</td><td style="padding:10px 12px; text-align:right;">26</td><td style="padding:10px 12px; text-align:right; font-weight:700; color:#7c3aed;">23</td></tr>
                <tr><td style="padding:10px 12px; font-weight:600;">系统取消（线索无效）</td><td style="padding:10px 12px;"><span style="color:#64748b;">否</span></td><td style="padding:10px 12px; color:#94a3b8;">空号/无效线索，直接结案，不进入门店补救与总部回访（0 工单）</td><td style="padding:10px 12px;"><span style="color:#64748b;">不生成</span></td><td style="padding:10px 12px; color:#94a3b8;">—</td><td style="padding:10px 12px; text-align:right;">12</td><td style="padding:10px 12px; text-align:right; color:#64748b;">0</td></tr>
              </tbody>
            </table>
          </div>

          <!-- 卡片 4 底部指标说明与统计口径 -->
          <div style="margin-top:12px; padding:10px 12px; border-radius:6px; background:#faf5ff; border:1px solid #e9d5ff; color:#6b21a8; font-size:11px; line-height:1.55;">
            💡 <strong>指标说明与统计口径：</strong>衡量专营店服务补救超时后由总部电销兜底承接的业务规模。<br>
            • <strong>业务逻辑</strong>：以履约异常发生日 <strong>T</strong> 为基准，为专营店预留 24~72 小时自主挽回窗口；若 T+1 门店未联系、或 T+3 未成功重排，系统自动派发总部坐席工单；<br>
            • <strong>事件量与工单量差值说明</strong>：如用户取消 42 笔中，有 11 笔在窗口期内已被门店成功化解，仅超时未达标的 31 笔生成总部工单；<br>
            • <strong>系统取消（如空号）</strong>直接结案归档，不浪费坐席工时。同一异常事件仅生成一次工单，不重复计数。
          </div>
        </section>
      </div>
    `;
  }

  window.switchAiEfficiencyPeriod = function(period) {
    currentPeriod = period;
    renderOpsAiTestDriveEfficiencyPage();
  };

  window.renderOpsAiTestDriveEfficiencyPage = renderOpsAiTestDriveEfficiencyPage;
  window.showAiEfficiencyMetricInfo = showAiEfficiencyMetricInfo;
  window.closeAiEfficiencyMetricInfo = closeAiEfficiencyMetricInfo;

})();
