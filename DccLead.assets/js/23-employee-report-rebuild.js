/*
 * 员工维度报告
 *
 * 页面内容与交互以运营提供的《员工晾晒看板》HTML 为准。该页面通过独立
 * 文档嵌入，避免改写其筛选、图表、悬停提示、排序与导出逻辑；外层仅提供
 * DCC 原型的页签、边距和蓝灰视觉容器。
 */
(function () {
  const REPORT_PATH = 'DccLead.assets/employee-dimension-report.html?v=2026091512';
  const FRAME_ID = 'sdEmployeeOperationalReport';
  const EMPLOYEE_HEADER_SUMMARY = '按日期、时段及 10 项筛选维度查看员工执行数据，任务、话单、有效接通、后端转化与企微指标分别按对应口径统计。';
  const EMPLOYEE_HEADER_DETAIL = '<br><br><b>口径说明：</b><br>· <b>指标 A</b>：任务类，新增、继续跟进、首触时效及客户分层与下发均按任务编码去重。<br>· <b>指标 B</b>：话单类，外呼次数、通话接通量及通话时长均按通话 ID 去重；指标 C / D / E 分别对应 30 / 60 / 90 秒有效接通次数。<br>· <b>指标 F</b>：后端转化为 T+1 数据，按总部培育线索 ID 去重；所有转化率分母均为线索量。<br>· <b>企微指标</b>：与后端转化相同，均为 T+1 非实时数据；按好友添加时间统计，数量类指标按员工 ID + 客户 ID 去重。<br><br><b>术语定义：</b><br>· <b>线索量</b>：本期纳入后端转化统计、人工回访过的总部培育线索数，按总部培育线索 ID 去重，统计口径为任务生成日期。<br>· <b>人工任务量</b>：与外呼任务量同口径；有效外呼率分母统一为外呼任务量。<br>· <b>已接通通话总时长</b>：统计周期内通话状态为已接通的话单通话时长之和，单位为秒。<br>· <b>人日均接通时长</b>：坐席日已接通通话时长按坐席、按日聚合后取均值，单位为小时。<br><br><b>对账恒等式：</b><br>· 外呼任务量 = 已分配任务量 + 待分配任务量。<br>· 当日跟进任务量 + 当日未跟进任务量 + 无回访记录量 = 外呼任务量。<br>· 继续跟进任务已处理量 + 待处理量 = 继续跟进任务量。<br><br><b>枚举值：</b><br>· <b>回访结果</b>：下次回访 / 下发门店 / 试驾线索下发 / 试驾排程下发 / 意向线索下发 / 无人接听下发 / 休眠未购 / 休眠失联 / 战败 / 无效结案。<br>· <b>线索状态</b>：培育中 / 暂败 / 休眠未购 / 休眠失联 / 战败 / 无效。<br>· <b>意向级别</b>：H / A / B / C / L。<br>· <b>跟进状态</b>：试驾线索下发 / 试驾排程下发 / 意向线索下发 / 无人接听下发。';
  const EMPLOYEE_HEADER_HTML = EMPLOYEE_HEADER_SUMMARY + EMPLOYEE_HEADER_DETAIL;
  let headerObserver;

  function applyEmployeeHeader(root) {
    const header = root?.querySelector('header');
    if (!header) return;
    const title = header.querySelector('h1');
    const desc = header.querySelector('p');
    if (title && title.textContent !== '员工维度报告') title.textContent = '员工维度报告';
    if (desc && desc.dataset.employeeReportIntro !== 'ready') {
      desc.dataset.employeeReportIntro = 'ready';
      desc.dataset.full = EMPLOYEE_HEADER_HTML;
      desc.innerHTML = EMPLOYEE_HEADER_HTML;
      window.sdCompactReportIntro?.(root);
    }
  }

  function protectEmployeeHeader(root) {
    headerObserver?.disconnect();
    headerObserver = new MutationObserver(() => {
      if (root.querySelector('.sd-employee-operational-clone')) applyEmployeeHeader(root);
    });
    headerObserver.observe(root.querySelector('header'), { childList: true, characterData: true, subtree: true });
  }

  function syncFrameHeight(event) {
    const frame = document.getElementById(FRAME_ID);
    if (!frame || event.source !== frame.contentWindow || !event.data || event.data.type !== 'dcc-employee-report-height') return;
    const height = Math.max(1200, Math.min(Number(event.data.height) || 1200, 12000));
    frame.style.height = height + 'px';
  }
  window.addEventListener('message', syncFrameHeight);

  renderSdEmployeeDimensionReport = window.renderSdEmployeeDimensionReport = function () {
    const root = document.querySelector('#seatPerformanceDashboardPage .sd');
    if (!root) return;
    applyEmployeeHeader(root);

    // The dashboard renderer creates the two performance-report panels before
    // it delegates to the active tab. They are not part of this report and
    // must not remain below the employee page after a tab switch.
    root.querySelectorAll('.sd-panel, .sd-under-panel, .sd-employee-report').forEach(node => node.remove());
    const nav = root.querySelector('.sd-report-tabs');
    const section = document.createElement('section');
    section.className = 'sd-employee-report sd-employee-operational-clone';
    section.innerHTML = '<iframe id="' + FRAME_ID + '" title="员工维度报告" src="' + REPORT_PATH + '" loading="eager"></iframe>';
    if (nav) nav.insertAdjacentElement('afterend', section); else root.appendChild(section);
    protectEmployeeHeader(root);
  };

  if (!document.getElementById('sd-employee-operational-clone-css')) {
    document.head.insertAdjacentHTML('beforeend', '<style id="sd-employee-operational-clone-css">'
      + '#seatPerformanceDashboardPage .sd-employee-operational-clone{margin-top:18px;overflow:hidden;border:1px solid #e3eaf3;border-radius:16px;background:#f6f8fc;box-shadow:0 8px 26px rgba(37,56,88,.055)}'
      + '#seatPerformanceDashboardPage .sd-employee-operational-clone iframe{display:block;width:100%;height:5400px;border:0;background:#f6f8fc}'
      + '@media(max-width:760px){#seatPerformanceDashboardPage .sd-employee-operational-clone{margin-top:12px;border-radius:11px}#seatPerformanceDashboardPage .sd-employee-operational-clone iframe{height:6200px}}'
      + '</style>');
  }

  window.renderSeatPerformanceDashboard?.();
})();

/* 小组通话时长占比：与员工报告的环形图一致的悬停反馈。 */
(function () {
  if (typeof sdCanvas !== 'function' || typeof sdDonutVisible === 'undefined') return;
  const colours = ['#2f64b9', '#2f8066', '#8aa1ba'];

  function geometry(canvas, data) {
    const values = data.gs.map(group => group.c / 60);
    const visible = sdDonutVisible[canvas.dataset.panel] || [true, true, true];
    const total = values.reduce((sum, value, index) => sum + (visible[index] ? value : 0), 0);
    return { values, visible, total, cx: canvas.getBoundingClientRect().width / 2, cy: 164, r: Math.min(102, canvas.getBoundingClientRect().width * .19) };
  }

  sdDrawDonut = function (canvas, data) {
    const { x, w, h } = sdCanvas(canvas);
    const state = canvas.__sdDonutState || { active: -1 };
    const { values, visible, total, cx, cy, r } = geometry(canvas, data);
    const inner = r * .61;
    x.clearRect(0, 0, w, h);
    x.fillStyle = '#253754'; x.font = '700 15px Microsoft YaHei'; x.textAlign = 'center';
    x.fillText('小组通话时长占比', cx, 27);

    let angle = -Math.PI / 2;
    values.forEach((value, index) => {
      if (!visible[index] || !total) return;
      const span = value / total * Math.PI * 2;
      const middle = angle + span / 2;
      const offset = state.active === index ? 9 : 0;
      const ox = Math.cos(middle) * offset, oy = Math.sin(middle) * offset;
      x.save();
      x.globalAlpha = state.active >= 0 && state.active !== index ? .38 : 1;
      x.beginPath();
      x.arc(cx + ox, cy + oy, r, angle, angle + span);
      x.arc(cx + ox, cy + oy, inner, angle + span, angle, true);
      x.closePath(); x.fillStyle = colours[index]; x.fill();
      x.strokeStyle = '#fff'; x.lineWidth = 2.5; x.stroke();
      x.restore();
      angle += span;
    });
    if (!total) {
      x.strokeStyle = '#e7edf4'; x.lineWidth = r - inner; x.beginPath(); x.arc(cx, cy, (r + inner) / 2, 0, Math.PI * 2); x.stroke();
    }
    x.beginPath(); x.arc(cx, cy, inner, 0, Math.PI * 2); x.fillStyle = '#fff'; x.fill();
    x.fillStyle = '#52637c'; x.font = '700 13px Microsoft YaHei'; x.textAlign = 'center'; x.fillText('通话总时长', cx, cy - 4);
    x.fillStyle = '#253754'; x.font = '700 18px Microsoft YaHei'; x.fillText(Math.round(total) + ' 分', cx, cy + 21);

    angle = -Math.PI / 2;
    values.forEach((value, index) => {
      if (!visible[index] || !total) return;
      const span = value / total * Math.PI * 2, middle = angle + span / 2;
      const side = Math.cos(middle) >= 0 ? 1 : -1;
      const startX = cx + Math.cos(middle) * (r + 2), startY = cy + Math.sin(middle) * (r + 2);
      const bendX = cx + Math.cos(middle) * (r + 18), bendY = cy + Math.sin(middle) * (r + 18);
      const textX = bendX + side * 32, textY = bendY + (Math.abs(Math.sin(middle)) > .82 ? (middle > 0 ? 16 : -8) : 0);
      const percent = (value / total * 100).toFixed(2);
      x.strokeStyle = colours[index]; x.lineWidth = 1.5; x.beginPath(); x.moveTo(startX, startY); x.lineTo(bendX, bendY); x.lineTo(textX - side * 7, bendY); x.stroke();
      x.fillStyle = '#52637c'; x.font = '13px Microsoft YaHei'; x.textAlign = side > 0 ? 'left' : 'right';
      x.fillText(data.gs[index].g, textX, textY);
      x.fillText((Math.round(value * 10) / 10) + '分（' + percent + '%）', textX, textY + 18);
      angle += span;
    });
    const ly = h - 26, start = cx - 110;
    data.gs.forEach((group, index) => {
      const px = start + index * 105;
      x.fillStyle = visible[index] ? colours[index] : '#c9d1dc'; x.beginPath(); x.roundRect(px, ly - 12, 28, 16, 4); x.fill();
      x.fillStyle = visible[index] ? '#52637c' : '#9aa7b8'; x.font = '13px Microsoft YaHei'; x.textAlign = 'left'; x.fillText(group.g, px + 37, ly + 1);
    });
  };

  sdBindDonutHover = function (canvas, data) {
    const parent = canvas.parentElement;
    if (!parent) return;
    parent.style.position = 'relative';
    let tip = parent.querySelector('.sd-donut-tip');
    if (!tip) { tip = document.createElement('div'); tip.className = 'sd-donut-tip'; parent.appendChild(tip); }
    if (!document.getElementById('sd-donut-unified-hover-css')) document.head.insertAdjacentHTML('beforeend', '<style id="sd-donut-unified-hover-css">#seatPerformanceDashboardPage .sd-donut-tip{display:none;position:absolute;z-index:12;min-width:184px;padding:12px 14px;border:1px solid #2f64b9;border-radius:8px;background:rgba(255,255,255,.98);box-shadow:0 8px 22px rgba(15,23,42,.16);color:#52637c;font-size:13px;line-height:1.55;pointer-events:none}#seatPerformanceDashboardPage .sd-donut-tip strong{display:block;color:#334155;font-size:15px;font-weight:700}#seatPerformanceDashboardPage .sd-donut-tip span{display:block;white-space:nowrap}</style>');
    const legendIndex = (px, py, width, height) => {
      const ly = height - 26, start = width / 2 - 110;
      if (py < ly - 23 || py > ly + 12) return -1;
      for (let index = 0; index < 3; index++) if (px >= start + index * 105 - 8 && px <= start + index * 105 + 91) return index;
      return -1;
    };
    const hitSlice = (px, py, box) => {
      const g = geometry(canvas, data), inner = g.r * .61, dist = Math.hypot(px - g.cx, py - g.cy);
      if (!g.total || dist < inner || dist > g.r + 10) return -1;
      let target = Math.atan2(py - g.cy, px - g.cx) + Math.PI / 2; if (target < 0) target += Math.PI * 2;
      let start = 0;
      for (let index = 0; index < g.values.length; index++) {
        if (!g.visible[index]) continue;
        const span = g.values[index] / g.total * Math.PI * 2;
        if (target >= start && target < start + span) return index;
        start += span;
      }
      return -1;
    };
    canvas.onmousemove = event => {
      const box = canvas.getBoundingClientRect(), px = event.clientX - box.left, py = event.clientY - box.top;
      const legend = legendIndex(px, py, box.width, box.height);
      if (legend >= 0) { canvas.style.cursor = 'pointer'; tip.style.display = 'none'; return; }
      const index = hitSlice(px, py, box);
      canvas.__sdDonutState = canvas.__sdDonutState || { active: -1 };
      if (canvas.__sdDonutState.active !== index) { canvas.__sdDonutState.active = index; sdDrawDonut(canvas, data); }
      if (index < 0) { canvas.style.cursor = 'default'; tip.style.display = 'none'; return; }
      const g = geometry(canvas, data), minutes = Math.round(g.values[index] * 10) / 10, percent = (g.values[index] / g.total * 100).toFixed(2);
      tip.innerHTML = '<strong>' + data.gs[index].g + '</strong><span>通话时长：' + minutes + ' 分钟（' + percent + '%）</span>';
      tip.style.borderColor = colours[index]; tip.style.display = 'block'; canvas.style.cursor = 'pointer';
      tip.style.left = Math.min(Math.max(12, px + 18), box.width - 212) + 'px'; tip.style.top = Math.min(Math.max(44, py - 58), box.height - 92) + 'px';
    };
    canvas.onclick = event => {
      const box = canvas.getBoundingClientRect(), index = legendIndex(event.clientX - box.left, event.clientY - box.top, box.width, box.height);
      if (index < 0) return;
      sdDonutVisible[canvas.dataset.panel][index] = !sdDonutVisible[canvas.dataset.panel][index];
      canvas.__sdDonutState = { active: -1 }; tip.style.display = 'none'; sdDrawDonut(canvas, data);
    };
    canvas.onmouseleave = () => { if (canvas.__sdDonutState?.active >= 0) { canvas.__sdDonutState.active = -1; sdDrawDonut(canvas, data); } tip.style.display = 'none'; canvas.style.cursor = 'default'; };
  };
  requestAnimationFrame(() => { if (typeof sdDrawCharts === 'function') sdDrawCharts(); });
})();
