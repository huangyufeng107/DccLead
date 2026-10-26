(function () {
  'use strict';

  // ==================== 40 号：下载列表（生产 download/index.jsx，统计报表-下载列表） ====================
  // 生产源码对齐要点（p__NEV__Sale__NEV__download__index chunk）：
  //   外层 div padding 16 + ProTable（toolBarRender: false 无工具栏按钮）
  //   列（6 列全 align center）：序号(index,60,跨页累计 (current-1)*pageSize+i+1)
  //     / 文件类型(logType,可搜索,request 异步 queryDownloadTypeLists → logTypeName/logTypeCode)
  //     / 创建人(creator,hideInSearch) / 提交时间(createdDate,dateRange 搜索,disabledDate 未来日期)
  //     / 状态(logStatus,hideInSearch,valueEnum 0失败error/1成功success/2进行中processing)
  //     / 下载(option,150,link button disabled:logStatus!==1,文本 record.filename)
  //   请求映射：createdDate[0]→startCreatedDate 00:00:00、createdDate[1]→endCreatedDate 23:59:59
  //   全量数据 + 前端分页（接口返回全量 rows，total=rows.length）
  //   分页：showTotal「第 X-Y 条/总共 Z 条」+ 页码（单页无箭头），条数切换器 total>50 时显示（antd 默认）

  // ==================== 确定性伪随机（与 34-39 号同源算法） ====================
  function nldRnd(seed) {
    var h = 5381;
    for (var i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) % 100003;
    var x = Math.sin(h + 1) * 10000;
    return x - Math.floor(x);
  }
  function nldInt(seed, min, max) { return Math.floor(nldRnd(seed) * (max - min + 1)) + min; }
  function nldPick(seed, arr) { return arr[Math.floor(nldRnd(seed) * arr.length) % arr.length]; }
  function nldPad2(n) { return (n < 10 ? '0' : '') + n; }
  function nldEsc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ==================== 公共字典 ====================
  // 状态（对齐生产 valueEnum：text + status）
  var NLD_STATUS = { 0: '失败', 1: '成功', 2: '进行中' };
  var NLD_STATUS_DOT = { 0: '#ff4d4f', 1: '#52c41a', 2: '#1677ff' }; // antd Badge error/success/processing
  // 文件类型（生产 queryDownloadTypeLists 异步字典，对齐统计报表各导出场景；截图确认前两项）
  var NLD_TYPES = [
    { code: 1, name: 'NEV预外呼明细列表' },
    { code: 2, name: 'AI外呼任务明细' },
    { code: 3, name: '总部培育报表' },
    { code: 4, name: '总部NEV日报' },
    { code: 5, name: 'AI渠道质量日报' },
    { code: 6, name: '坐席业绩看板' },
    { code: 7, name: 'AI试驾排程效能看板' },
    { code: 8, name: '录音列表' }
  ];
  var NLD_CREATORS = ['黄裕烽', '陈思远', '刘雨欣', '王建国', '林嘉怡', '赵明轩', '孙晓雯', '周子涵'];

  // 近 60 天日期池（2026-08-21 ~ 2026-10-19，避免 Date 漂移保证确定性）
  var NLD_DAYS = (function () {
    var arr = [];
    var d = new Date(2026, 7, 21);
    for (var i = 0; i < 60; i++) {
      arr.push(d.getFullYear() + '-' + nldPad2(d.getMonth() + 1) + '-' + nldPad2(d.getDate()));
      d.setDate(d.getDate() + 1);
    }
    return arr;
  })();

  // ==================== 数据生成（固定 56 条，>50 触发条数切换器，按提交时间倒序） ====================
  var NLD_ROW_COUNT = 56;
  var NLD_ROWS = (function () {
    var rows = [];
    for (var i = 0; i < NLD_ROW_COUNT; i++) {
      var seed = 'nld-' + i;
      // 时间倒序：i 越大时间越早（首行最新）
      var day = NLD_DAYS[NLD_ROW_COUNT - 1 - i];
      var hh = nldInt(seed + 'hh', 8, 21);
      var mi = nldPad2(nldInt(seed + 'mi', 0, 59));
      var ss = nldPad2(nldInt(seed + 'ss', 0, 59));
      var ymd = day.replace(/-/g, '').slice(2); // YYMMDD
      var type = nldPick(seed + 'tp', NLD_TYPES);
      var tr = nldRnd(seed + 'st');
      var logStatus = tr < 0.12 ? 0 : tr < 0.24 ? 2 : 1; // 12% 失败 12% 进行中 76% 成功
      // 文件名（对齐截图两种生产格式）
      var filename;
      if (type.code === 1) filename = '预外呼明细列表_' + ymd + nldPad2(hh) + mi + '.xlsx';
      else if (type.code === 2) filename = 'AI外呼任务明细列表_' + ymd + '_' + nldPad2(hh) + mi + ss + '.xlsx';
      else filename = type.name + '_' + ymd + '_' + nldPad2(hh) + mi + ss + '.xlsx';
      rows.push({
        id: i + 1,
        logType: type.code,
        logTypeName: type.name,
        creator: nldPick(seed + 'cr', NLD_CREATORS),
        createdDate: day + ' ' + nldPad2(hh) + ':' + mi + ':' + ss,
        logStatus: logStatus,
        filename: filename
      });
    }
    return rows;
  })();

  // ==================== 页面状态 ====================
  var nldState = {
    rows: NLD_ROWS.slice(),
    filters: { logType: '', createdDate: ['', ''] },
    page: 1,
    pageSize: 20,
    toastTimer: 0
  };

  function nldDefaultFilters() {
    return { logType: '', createdDate: ['', ''] };
  }

  // ==================== 过滤逻辑（对齐生产 request 参数映射） ====================
  function nldQueryRows() {
    var f = nldState.filters;
    return nldState.rows.filter(function (r) {
      if (f.logType !== '' && r.logType !== +f.logType) return false;
      var day = r.createdDate.slice(0, 10);
      if (f.createdDate[0] && day < f.createdDate[0]) return false;
      if (f.createdDate[1] && day > f.createdDate[1]) return false;
      return true;
    });
  }

  // ==================== 样式注入（对齐 39 号 ProTable 复刻体系，前缀 nld-） ====================
  var nldStylesInited = false;
  function nldEnsureStyles() {
    if (nldStylesInited) return;
    nldStylesInited = true;
    var css = [
      '.nld-page{padding:16px;}',
      '.nld-card{background:#fff;border-radius:8px;padding:0 0 16px;}',
      /* 搜索区（ProTable search） */
      '.nld-search{display:flex;flex-wrap:wrap;gap:10px 18px;padding:18px 24px 4px;background:#fff;border-radius:8px 8px 0 0;}',
      '.nld-fi{display:flex;align-items:center;gap:8px;}',
      '.nld-label{font-size:14px;color:rgba(0,0,0,0.88);white-space:nowrap;}',
      '.nld-select,.nld-date{height:32px;border:1px solid #d9d9d9;border-radius:6px;padding:0 10px;font-size:14px;color:rgba(0,0,0,0.88);background:#fff;outline:none;box-sizing:border-box;}',
      '.nld-select:focus,.nld-date:focus{border-color:#4096ff;box-shadow:0 0 0 2px rgba(5,145,255,0.1);}',
      '.nld-search-actions{margin-left:auto;display:flex;align-items:center;padding-bottom:14px;}',
      /* 按钮（生产顺序：重置在左、查询在右，对齐截图） */
      '.nld-btn{height:32px;padding:0 15px;border-radius:6px;border:1px solid #d9d9d9;background:#fff;color:rgba(0,0,0,0.88);font-size:14px;cursor:pointer;transition:.2s;white-space:nowrap;}',
      '.nld-btn:hover{border-color:#4096ff;color:#4096ff;}',
      '.nld-btn-primary{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.nld-btn-primary:hover{background:#4096ff;border-color:#4096ff;color:#fff;}',
      /* 表格（6 列全居中） */
      '.nld-table-wrap{overflow-x:auto;padding:0 24px;}',
      '.nld-table{width:100%;border-collapse:collapse;font-size:14px;}',
      '.nld-table th{background:#fafafa;color:rgba(0,0,0,0.88);font-weight:600;height:44px;padding:8px 12px;text-align:center;border-bottom:1px solid #f0f0f0;white-space:nowrap;}',
      '.nld-table td{padding:10px 12px;text-align:center;border-bottom:1px solid #f0f0f0;color:rgba(0,0,0,0.88);white-space:nowrap;}',
      '.nld-table tbody tr:hover td{background:#fafafa;}',
      '.nld-empty-row td{padding:32px 0;color:rgba(0,0,0,0.25);font-size:14px;text-align:center;border-bottom:none;}',
      /* 状态列（antd Badge：圆点 + 文本） */
      '.nld-badge{display:inline-flex;align-items:center;gap:8px;font-size:14px;color:rgba(0,0,0,0.88);}',
      '.nld-badge-dot{width:6px;height:6px;border-radius:50%;flex:none;}',
      /* 下载列（antd link button，禁用置灰） */
      '.nld-dl-btn{border:none;background:none;color:#1677ff;font-size:14px;cursor:pointer;padding:0 4px;height:24px;}',
      '.nld-dl-btn:hover{color:#4096ff;}',
      '.nld-dl-btn[disabled]{cursor:not-allowed;color:rgba(0,0,0,0.25);}',
      '.nld-dl-btn[disabled]:hover{color:rgba(0,0,0,0.25);}',
      /* 分页（对齐截图：左「第 X-Y 条/总共 Z 条」+ 右页码，单页无箭头） */
      '.nld-pager{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:16px 24px 0;font-size:14px;color:rgba(0,0,0,0.88);}',
      '.nld-total{margin-right:auto;color:rgba(0,0,0,0.65);}',
      '.nld-page-btn{min-width:32px;height:32px;border-radius:6px;border:1px solid #d9d9d9;background:#fff;cursor:pointer;font-size:14px;color:rgba(0,0,0,0.88);transition:.2s;padding:0 6px;}',
      '.nld-page-btn:hover:not([disabled]):not(.on){border-color:#4096ff;color:#4096ff;}',
      '.nld-page-btn.on{border-color:#1677ff;color:#1677ff;}',
      '.nld-page-btn[disabled]{cursor:not-allowed;color:rgba(0,0,0,0.25);background:#f5f5f5;}',
      '.nld-size-changer{height:32px;border:1px solid #d9d9d9;border-radius:6px;padding:0 8px;font-size:14px;color:rgba(0,0,0,0.88);background:#fff;outline:none;}',
      /* toast（沿用 34-39 号体系） */
      '.nld-toast{position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:2200;background:#fff;border-radius:6px;box-shadow:0 6px 16px rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:9px 16px;font-size:14px;color:rgba(0,0,0,0.88);animation:nldToastIn .2s ease-out;}',
      '@keyframes nldToastIn{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%)}}'
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'nldStyle';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ==================== 筛选区（文件类型 + 提交时间，按钮顺序对齐截图「重置 查询」） ====================
  function nldFilterBarHtml() {
    var f = nldState.filters;
    var today = new Date();
    var todayStr = today.getFullYear() + '-' + nldPad2(today.getMonth() + 1) + '-' + nldPad2(today.getDate());
    return '<div class="nld-search">' +
      '<div class="nld-fi"><span class="nld-label">文件类型</span><select class="nld-select" id="nldFType" style="width:180px">' +
      '<option value=""' + (f.logType === '' ? ' selected' : '') + '>请选择</option>' +
      NLD_TYPES.map(function (t) {
        return '<option value="' + t.code + '"' + (f.logType !== '' && +f.logType === t.code ? ' selected' : '') + '>' + nldEsc(t.name) + '</option>';
      }).join('') +
      '</select></div>' +
      '<div class="nld-fi"><span class="nld-label">提交时间</span>' +
      '<input class="nld-date" id="nldDateS" type="date" style="width:140px" max="' + todayStr + '" value="' + nldEsc(f.createdDate[0]) + '" />' +
      '<span style="color:rgba(0,0,0,0.45)">~</span>' +
      '<input class="nld-date" id="nldDateE" type="date" style="width:140px" max="' + todayStr + '" value="' + nldEsc(f.createdDate[1]) + '" /></div>' +
      '<div class="nld-search-actions">' +
      '<button class="nld-btn" id="nldResetBtn">重 置</button>' +
      '<button class="nld-btn nld-btn-primary" id="nldQueryBtn">查 询</button>' +
      '</div></div>';
  }

  // ==================== 表格（6 列全居中，对齐生产 columns；无工具栏） ====================
  function nldTableHtml() {
    var rows = nldQueryRows();
    var total = rows.length;
    var totalPages = Math.max(1, Math.ceil(total / nldState.pageSize));
    if (nldState.page > totalPages) nldState.page = totalPages;
    var start = (nldState.page - 1) * nldState.pageSize;
    var pageRows = rows.slice(start, start + nldState.pageSize);
    var html = '<div class="nld-table-wrap"><table class="nld-table"><thead><tr>' +
      '<th style="width:60px">序号</th>' +
      '<th style="min-width:190px">文件类型</th>' +
      '<th style="min-width:110px">创建人</th>' +
      '<th style="min-width:170px">提交时间</th>' +
      '<th style="min-width:100px">状态</th>' +
      '<th style="width:280px">下载</th>' +
      '</tr></thead><tbody>';
    if (!pageRows.length) {
      html += '<tr class="nld-empty-row"><td colspan="6">暂无数据</td></tr>';
    } else {
      pageRows.forEach(function (r, idx) {
        var ok = r.logStatus === 1;
        var typeObj = NLD_TYPES.filter(function (t) { return t.code === r.logType; })[0];
        // 序号跨页累计（生产 render：(current-1)*pageSize+i+1）
        html += '<tr>' +
          '<td>' + (start + idx + 1) + '</td>' +
          '<td>' + nldEsc(typeObj ? typeObj.name : r.logTypeName) + '</td>' +
          '<td>' + nldEsc(r.creator) + '</td>' +
          '<td>' + nldEsc(r.createdDate) + '</td>' +
          '<td><span class="nld-badge"><span class="nld-badge-dot" style="background:' + NLD_STATUS_DOT[r.logStatus] + '"></span>' + nldEsc(NLD_STATUS[r.logStatus]) + '</span></td>' +
          '<td><button class="nld-dl-btn" data-dl="' + r.id + '"' + (ok ? '' : ' disabled') + ' title="' + nldEsc(r.filename) + '">' + nldEsc(r.filename) + '</button></td>' +
          '</tr>';
      });
    }
    html += '</tbody></table></div>';
    // 分页（对齐截图：左「第 X-Y 条/总共 Z 条」+ 右页码，单页无箭头；条数切换 total>50 显示）
    var rangeStart = total ? start + 1 : 0;
    var rangeEnd = Math.min(start + nldState.pageSize, total);
    html += '<div class="nld-pager"><span class="nld-total">第 ' + rangeStart + '-' + rangeEnd + ' 条/总共 ' + total + ' 条</span>';
    if (total > 50) {
      html += '<select class="nld-size-changer" id="nldPageSize">' +
        [10, 20, 50, 100].map(function (n) { return '<option value="' + n + '"' + (nldState.pageSize === n ? ' selected' : '') + '>' + n + ' 条/页</option>'; }).join('') + '</select>';
    }
    if (totalPages > 1) {
      html += '<button class="nld-page-btn" id="nldPrevPage" ' + (nldState.page <= 1 ? 'disabled' : '') + '>‹</button>';
    }
    for (var p = 1; p <= totalPages; p++) {
      if (totalPages > 7 && p > 3 && p < totalPages - 1 && Math.abs(p - nldState.page) > 1) {
        if (p === 4) html += '<span>…</span>';
        continue;
      }
      html += '<button class="nld-page-btn' + (p === nldState.page ? ' on' : '') + '" data-page="' + p + '">' + p + '</button>';
    }
    if (totalPages > 1) {
      html += '<button class="nld-page-btn" id="nldNextPage" ' + (nldState.page >= totalPages ? 'disabled' : '') + '>›</button>';
    }
    html += '</div>';
    return html;
  }

  // ==================== 提示（沿用 34-39 号 toast 体系） ====================
  function nldToast(text) {
    var old = document.getElementById('nldToast');
    if (old) old.remove();
    clearTimeout(nldState.toastTimer);
    var el = document.createElement('div');
    el.className = 'nld-toast';
    el.id = 'nldToast';
    el.textContent = text;
    document.body.appendChild(el);
    nldState.toastTimer = setTimeout(function () { if (el.parentNode) el.remove(); }, 2200);
  }

  // ==================== 主页面渲染（外层 padding 16，无工具栏） ====================
  function nldRenderPage() {
    var page = document.getElementById('opsDownloadListPage');
    if (!page) return;
    nldEnsureStyles();
    page.innerHTML = '<div class="nld-page"><div class="nld-card">' + nldFilterBarHtml() + nldTableHtml() + '</div></div>';
    nldBindEvents(page);
  }

  // ==================== 主页面事件（委托） ====================
  function nldBindEvents(page) {
    if (page._nldBound) return;
    page._nldBound = true;
    page.addEventListener('click', function (e) {
      if (e.target.closest('#nldQueryBtn')) {
        nldCollectFilters();
        nldState.page = 1;
        nldRenderPage();
        return;
      }
      if (e.target.closest('#nldResetBtn')) {
        nldState.filters = nldDefaultFilters();
        nldState.page = 1;
        nldRenderPage();
        return;
      }
      if (e.target.closest('#nldPrevPage') && nldState.page > 1) {
        nldState.page--;
        nldRenderPage();
        return;
      }
      var totalPages = Math.max(1, Math.ceil(nldQueryRows().length / nldState.pageSize));
      if (e.target.closest('#nldNextPage') && nldState.page < totalPages) {
        nldState.page++;
        nldRenderPage();
        return;
      }
      var pb = e.target.closest('.nld-page-btn[data-page]');
      if (pb) {
        nldState.page = +pb.getAttribute('data-page');
        nldRenderPage();
        return;
      }
      var dl = e.target.closest('[data-dl]');
      if (dl && !dl.disabled) {
        nldToast('下载成功');
      }
    });
    page.addEventListener('change', function (e) {
      if (e.target.id === 'nldPageSize') {
        nldState.pageSize = +e.target.value;
        nldState.page = 1;
        nldRenderPage();
        return;
      }
      if (e.target.id === 'nldDateS' || e.target.id === 'nldDateE') {
        nldState.filters.createdDate = [
          (document.getElementById('nldDateS') || {}).value || '',
          (document.getElementById('nldDateE') || {}).value || ''
        ];
      }
    });
  }

  function nldCollectFilters() {
    var tp = document.getElementById('nldFType');
    if (tp) nldState.filters.logType = tp.value;
    nldState.filters.createdDate = [
      (document.getElementById('nldDateS') || {}).value || '',
      (document.getElementById('nldDateE') || {}).value || ''
    ];
  }

  // ==================== 挂载入口（后加载覆盖 26 号旧版，30/31、23/39 号先例） ====================
  window.renderOpsDownloadListPage = nldRenderPage;

  // ==================== 初始化 ====================
  function init() {
    var page = document.getElementById('opsDownloadListPage');
    if (page && page.classList.contains('show')) {
      nldRenderPage();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
