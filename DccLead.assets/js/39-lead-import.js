(function () {
  'use strict';

  // ==================== 39 号：线索导入（生产 clueImport，ProTable + UpdateTemplate 弹窗） ====================
  // 生产源码对齐要点（p__NEV__Sale__NEV__clueImport chunk）：
  //   列（8 列全 align center）：序号(index,80) / 文件名称(fileName,150) / 导入结果(importStatus,150,select)
  //     / 下发结果(sendResult,150,select) / 总行数(totalRecords,150,hideInSearch) / 创建账号(creator,150,hideInSearch)
  //     / 创建时间(createdDate,200,dateRange 搜索,render 原值) / 操作(option,150,「下载」link loading)
  //   valueEnum：导入结果 0=导入失败 1=导入成功 2=导入中；下发结果 0=未下发 1=已下发 2=下发中
  //   搜索：createdDate[0]→createdStartDate 00:00:00、createdDate[1]→createdEndDate 23:59:59、createdDate 置空
  //   工具栏 toolBarRender：仅「导入」primary 按钮
  //   弹窗：Modal title「提示」，footer=模版下载/取消/导入；Upload.Dragger(accept .xlsx,maxCount 1,手动上传)
  //     文案：点击或将文件拖拽到这里上传 / 支持.xlsx格式文件
  //   提交：无文件 message.info('请先上传文件')；成功 notification.success('操作成功','导入成功')+关闭+reload
  //   模版下载：receiveTagImportTemplate → 下载「线索导入模版_{timestamp}.xlsx」
  //   行下载：receiveTagImportExport({taskId}) → changeNameAndDownload(res, record.fileName)

  // ==================== 确定性伪随机（与 34-38 号同源算法） ====================
  function nliRnd(seed) {
    var h = 5381;
    for (var i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) % 100003;
    var x = Math.sin(h + 1) * 10000;
    return x - Math.floor(x);
  }
  function nliInt(seed, min, max) { return Math.floor(nliRnd(seed) * (max - min + 1)) + min; }
  function nliPick(seed, arr) { return arr[Math.floor(nliRnd(seed) * arr.length) % arr.length]; }
  function nliPad2(n) { return (n < 10 ? '0' : '') + n; }
  function nliEsc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ==================== 公共字典（对齐生产 valueEnum） ====================
  var NLI_IMPORT_STATUS = { 0: '导入失败', 1: '导入成功', 2: '导入中' };
  var NLI_SEND_RESULT = { 0: '未下发', 1: '已下发', 2: '下发中' };
  var NLI_ACTIVITIES = [
    '全国车展留资线索', '秋季新媒体矩阵推广线索', '懂车帝留资补录表', '呼叫中心未接通二次外呼',
    '老车主置换专场导入', '易车网高潜线索', '官网预约试驾线索', '区域巡展专项留资',
    '异业合作潜客线索', '抖音直播留资', '百度SEM投放线索', '小红书店头活动线索'
  ];
  var NLI_CREATORS = ['admin_hq', 'dcc_supervisor', 'marketing_op01', 'marketing_op02', 'nev_op_zhang', 'dcc_li_na', 'op_trainee'];

  // 近 30 天日期池（2026-09-20 ~ 2026-10-19，避免 Date 漂移保证确定性）
  var NLI_DAYS = (function () {
    var arr = [];
    var d = new Date(2026, 8, 20);
    for (var i = 0; i < 30; i++) {
      arr.push(d.getFullYear() + '-' + nliPad2(d.getMonth() + 1) + '-' + nliPad2(d.getDate()));
      d.setDate(d.getDate() + 1);
    }
    return arr;
  })();

  // ==================== 数据生成（固定 36 条导入任务） ====================
  var NLI_ROW_COUNT = 36;
  var NLI_ROWS = (function () {
    var rows = [];
    for (var i = 0; i < NLI_ROW_COUNT; i++) {
      var seed = 'nli-' + i;
      var day = NLI_DAYS[29 - nliInt(seed + 'day', 0, 29)];
      var activity = nliPick(seed + 'act', NLI_ACTIVITIES);
      var batch = nliInt(seed + 'batch', 1, 12);
      var sr = nliRnd(seed + 'sm');
      var importStatus = sr < 0.08 ? 0 : sr < 0.80 ? 1 : 2;
      var srr = nliRnd(seed + 'snd');
      var sendResult = importStatus === 0 ? 0 : importStatus === 1 ? (srr < 0.7 ? 1 : 2) : 0;
      rows.push({
        id: i + 1,
        fileName: '2026-' + day.slice(5, 7) + '月' + activity + '_第' + nliPad2(batch) + '批.xlsx',
        importStatus: importStatus,
        sendResult: sendResult,
        totalRecords: nliInt(seed + 'tot', 96, 3120),
        creator: nliPick(seed + 'cr', NLI_CREATORS),
        createdDate: day + ' ' + nliPad2(nliInt(seed + 'hh', 8, 21)) + ':' + nliPad2(nliInt(seed + 'mi', 0, 59)) + ':' + nliPad2(nliInt(seed + 'ss', 0, 59))
      });
    }
    return rows;
  })();

  // ==================== 页面状态 ====================
  var nliState = {
    rows: NLI_ROWS.slice(),
    filters: { fileName: '', importStatus: '', sendResult: '', createdDate: ['', ''] },
    page: 1,
    pageSize: 20,
    modalVisible: false,
    uploadFileName: '',
    templateLoading: false,
    importLoading: false,
    downloadingId: 0,
    toastTimer: 0,
    notifyTimer: 0,
    msgTimer: 0
  };

  function nliDefaultFilters() {
    return { fileName: '', importStatus: '', sendResult: '', createdDate: ['', ''] };
  }

  // ==================== 过滤逻辑（对齐生产 request 参数映射） ====================
  function nliQueryRows() {
    var f = nliState.filters;
    return nliState.rows.filter(function (r) {
      if (f.fileName && r.fileName.indexOf(f.fileName) < 0) return false;
      if (f.importStatus !== '' && r.importStatus !== +f.importStatus) return false;
      if (f.sendResult !== '' && r.sendResult !== +f.sendResult) return false;
      var day = r.createdDate.slice(0, 10);
      if (f.createdDate[0] && day < f.createdDate[0]) return false;
      if (f.createdDate[1] && day > f.createdDate[1]) return false;
      return true;
    });
  }

  // ==================== 样式注入（对齐 37 号 ProTable 复刻体系，前缀 nli-） ====================
  var nliStylesInited = false;
  function nliEnsureStyles() {
    if (nliStylesInited) return;
    nliStylesInited = true;
    var css = [
      '.nli-page-card{background:#fff;border-radius:8px;padding:0 0 16px;}',
      /* 搜索区（ProTable search） */
      '.nli-search{display:flex;flex-wrap:wrap;gap:10px 18px;padding:18px 24px 4px;background:#fff;border-radius:8px 8px 0 0;}',
      '.nli-fi{display:flex;align-items:center;gap:8px;}',
      '.nli-label{font-size:14px;color:rgba(0,0,0,0.88);white-space:nowrap;}',
      '.nli-select,.nli-input,.nli-date{height:32px;border:1px solid #d9d9d9;border-radius:6px;padding:0 10px;font-size:14px;color:rgba(0,0,0,0.88);background:#fff;outline:none;box-sizing:border-box;}',
      '.nli-select:focus,.nli-input:focus,.nli-date:focus{border-color:#4096ff;box-shadow:0 0 0 2px rgba(5,145,255,0.1);}',
      '.nli-search-actions{margin-left:auto;display:flex;align-items:center;padding-bottom:14px;}',
      /* 按钮 */
      '.nli-btn{height:32px;padding:0 15px;border-radius:6px;border:1px solid #d9d9d9;background:#fff;color:rgba(0,0,0,0.88);font-size:14px;cursor:pointer;transition:.2s;white-space:nowrap;}',
      '.nli-btn:hover{border-color:#4096ff;color:#4096ff;}',
      '.nli-btn-primary{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.nli-btn-primary:hover{background:#4096ff;border-color:#4096ff;color:#fff;}',
      '.nli-btn[disabled]{cursor:not-allowed;background:#f5f5f5;border-color:#d9d9d9;color:rgba(0,0,0,0.25);}',
      '.nli-btn-primary[disabled]:hover{background:#f5f5f5;border-color:#d9d9d9;color:rgba(0,0,0,0.25);}',
      '.nli-btn.loading{pointer-events:none;opacity:.65;}',
      '.nli-btn.loading::after{content:"";display:inline-block;width:12px;height:12px;margin-left:6px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:nliSpin .8s linear infinite;vertical-align:-2px;}',
      '@keyframes nliSpin{to{transform:rotate(360deg)}}',
      /* 工具栏 */
      '.nli-toolbar{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 24px;}',
      /* 表格 */
      '.nli-table-wrap{overflow-x:auto;padding:0 24px;}',
      '.nli-table{width:100%;border-collapse:collapse;font-size:14px;}',
      '.nli-table th{background:#fafafa;color:rgba(0,0,0,0.88);font-weight:600;height:44px;padding:8px 12px;text-align:center;border-bottom:1px solid #f0f0f0;white-space:nowrap;}',
      '.nli-table td{padding:10px 12px;text-align:center;border-bottom:1px solid #f0f0f0;color:rgba(0,0,0,0.88);white-space:nowrap;}',
      '.nli-table tbody tr:hover td{background:#fafafa;}',
      '.nli-link-btn{border:none;background:none;color:#1677ff;font-size:14px;cursor:pointer;padding:0 4px;height:24px;}',
      '.nli-link-btn:hover{color:#4096ff;}',
      '.nli-link-btn.loading{pointer-events:none;color:rgba(0,0,0,0.25);}',
      '.nli-link-btn.loading::before{content:"";display:inline-block;width:11px;height:11px;margin-right:4px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:nliSpin .8s linear infinite;vertical-align:-1px;}',
      '.nli-empty-row td{padding:32px 0;color:rgba(0,0,0,0.25);font-size:14px;text-align:center;border-bottom:none;}',
      /* 分页 */
      '.nli-pager{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:16px 24px 0;font-size:14px;color:rgba(0,0,0,0.88);}',
      '.nli-page-btn{min-width:32px;height:32px;border-radius:6px;border:1px solid #d9d9d9;background:#fff;cursor:pointer;font-size:14px;color:rgba(0,0,0,0.88);transition:.2s;}',
      '.nli-page-btn:hover:not([disabled]):not(.on){border-color:#4096ff;color:#4096ff;}',
      '.nli-page-btn.on{border-color:#1677ff;color:#1677ff;}',
      '.nli-page-btn[disabled]{cursor:not-allowed;color:rgba(0,0,0,0.25);background:#f5f5f5;}',
      /* Modal（antd Modal 复刻） */
      '.nli-modal-mask{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1000;display:flex;align-items:center;justify-content:center;}',
      '.nli-modal{width:520px;max-width:92vw;background:#fff;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);animation:nliModalIn .2s ease-out;}',
      '@keyframes nliModalIn{from{opacity:0;transform:scale(.96) translateY(-8px)}to{opacity:1;transform:none}}',
      '.nli-modal-head{position:relative;padding:16px 24px;font-size:16px;font-weight:600;color:rgba(0,0,0,0.88);border-bottom:1px solid #f0f0f0;}',
      '.nli-modal-close{position:absolute;right:16px;top:15px;width:22px;height:22px;border:none;background:none;font-size:16px;line-height:22px;color:rgba(0,0,0,0.45);cursor:pointer;border-radius:4px;}',
      '.nli-modal-close:hover{color:rgba(0,0,0,0.88);background:rgba(0,0,0,0.06);}',
      '.nli-modal-body{padding:24px;}',
      '.nli-modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:10px 16px;border-top:1px solid #f0f0f0;}',
      /* Upload.Dragger 复刻 */
      '.nli-dragger{border:1px dashed #d9d9d9;border-radius:8px;background:#fafafa;transition:border-color .3s,background .3s;padding:32px 16px;text-align:center;cursor:pointer;}',
      '.nli-dragger:hover,.nli-dragger.nli-dragover{border-color:#4096ff;background:rgba(5,145,255,0.04);}',
      '.nli-drag-icon{width:48px;height:48px;margin:0 auto 12px;border-radius:50%;background:rgba(5,145,255,0.08);display:flex;align-items:center;justify-content:center;}',
      '.nli-drag-icon svg{width:24px;height:24px;stroke:#1677ff;}',
      '.nli-drag-text{font-size:15px;color:rgba(0,0,0,0.88);margin-bottom:8px;}',
      '.nli-drag-hint{font-size:13px;color:rgba(0,0,0,0.45);}',
      '.nli-file-row{display:flex;align-items:center;gap:8px;margin-top:12px;padding:8px 12px;background:#f6ffed;border:1px solid #b7eb8f;border-radius:6px;font-size:13px;color:rgba(0,0,0,0.88);text-align:left;}',
      '.nli-file-ico{color:#52c41a;font-style:normal;}',
      '.nli-file-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.nli-file-x{border:none;background:none;color:rgba(0,0,0,0.45);cursor:pointer;font-size:14px;line-height:1;padding:2px 4px;border-radius:4px;}',
      '.nli-file-x:hover{color:rgba(0,0,0,0.88);background:rgba(0,0,0,0.06);}',
      /* notification（antd 右上角通知） */
      '.nli-notification{position:fixed;top:24px;right:24px;z-index:2000;background:#fff;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:12px 16px;display:flex;gap:10px;align-items:flex-start;min-width:280px;max-width:360px;animation:nliNotifyIn .24s ease-out;}',
      '@keyframes nliNotifyIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}',
      '.nli-notification.out{opacity:0;transform:translateX(24px);transition:.24s;}',
      '.nli-notify-ico{width:22px;height:22px;border-radius:50%;background:#52c41a;color:#fff;font-size:13px;line-height:22px;text-align:center;flex:none;font-weight:700;}',
      '.nli-notify-title{font-size:15px;font-weight:600;color:rgba(0,0,0,0.88);margin-bottom:2px;}',
      '.nli-notify-desc{font-size:13px;color:rgba(0,0,0,0.65);}',
      /* message（antd 顶部居中） */
      '.nli-message{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2100;background:#fff;border-radius:6px;box-shadow:0 6px 16px rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:9px 16px;font-size:14px;color:rgba(0,0,0,0.88);display:flex;align-items:center;gap:8px;animation:nliMsgIn .2s ease-out;}',
      '@keyframes nliMsgIn{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%)}}',
      '.nli-msg-ico{width:16px;height:16px;border-radius:50%;background:#1677ff;color:#fff;font-size:11px;line-height:16px;text-align:center;font-style:normal;font-weight:700;}',
      /* toast（沿用 34-38 号体系） */
      '.nli-toast{position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:2200;background:#fff;border-radius:6px;box-shadow:0 6px 16px rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:9px 16px;font-size:14px;color:rgba(0,0,0,0.88);animation:nliMsgIn .2s ease-out;}'
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'nliStyle';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ==================== 筛选区（ProTable search：文件名称/导入结果/下发结果/创建时间 + 查询/重置） ====================
  function nliFilterBarHtml() {
    var f = nliState.filters;
    var optHtml = function (dict, cur) {
      return '<option value=""' + (cur === '' ? ' selected' : '') + '>请选择</option>' +
        Object.keys(dict).map(function (k) {
          return '<option value="' + k + '"' + (+cur === +k ? ' selected' : '') + '>' + dict[k] + '</option>';
        }).join('');
    };
    return '<div class="nli-search">' +
      '<div class="nli-fi"><span class="nli-label">文件名称</span><input class="nli-input" id="nliFFileName" style="width:208px" placeholder="请输入文件名称" value="' + nliEsc(f.fileName) + '" /></div>' +
      '<div class="nli-fi"><span class="nli-label">导入结果</span><select class="nli-select" id="nliFImportStatus" style="width:140px">' + optHtml(NLI_IMPORT_STATUS, f.importStatus) + '</select></div>' +
      '<div class="nli-fi"><span class="nli-label">下发结果</span><select class="nli-select" id="nliFSendResult" style="width:140px">' + optHtml(NLI_SEND_RESULT, f.sendResult) + '</select></div>' +
      '<div class="nli-fi"><span class="nli-label">创建时间</span><input class="nli-date" id="nliDateS" type="date" style="width:140px" value="' + nliEsc(f.createdDate[0]) + '" /><span style="color:rgba(0,0,0,0.45)">~</span><input class="nli-date" id="nliDateE" type="date" style="width:140px" value="' + nliEsc(f.createdDate[1]) + '" /></div>' +
      '<div class="nli-search-actions">' +
      '<button class="nli-btn nli-btn-primary" id="nliQueryBtn">查 询</button>' +
      '<button class="nli-btn" id="nliResetBtn">重 置</button>' +
      '</div></div>';
  }

  // ==================== 工具栏（生产 toolBarRender：仅「导入」primary；options.reload → 刷新） ====================
  function nliToolbarHtml() {
    return '<div class="nli-toolbar">' +
      '<button class="nli-btn" id="nliReloadBtn">刷新</button>' +
      '<button class="nli-btn nli-btn-primary" id="nliImportOpenBtn">导入</button>' +
      '</div>';
  }

  // ==================== 表格（8 列全居中，对齐生产 columns） ====================
  function nliTableHtml() {
    var rows = nliQueryRows();
    var total = rows.length;
    var start = (nliState.page - 1) * nliState.pageSize;
    var pageRows = rows.slice(start, start + nliState.pageSize);
    var html = '<div class="nli-table-wrap"><table class="nli-table"><thead><tr>' +
      '<th style="width:80px">序号</th>' +
      '<th style="min-width:220px">文件名称</th>' +
      '<th style="width:110px">导入结果</th>' +
      '<th style="width:110px">下发结果</th>' +
      '<th style="width:100px">总行数</th>' +
      '<th style="width:130px">创建账号</th>' +
      '<th style="width:180px">创建时间</th>' +
      '<th style="width:100px">操作</th>' +
      '</tr></thead><tbody>';
    if (!pageRows.length) {
      html += '<tr class="nli-empty-row"><td colspan="8">暂无数据</td></tr>';
    } else {
      pageRows.forEach(function (r, idx) {
        var dl = nliState.downloadingId === r.id;
        html += '<tr>' +
          '<td>' + (start + idx + 1) + '</td>' +
          '<td title="' + nliEsc(r.fileName) + '">' + nliEsc(r.fileName) + '</td>' +
          '<td>' + nliEsc(NLI_IMPORT_STATUS[r.importStatus]) + '</td>' +
          '<td>' + nliEsc(NLI_SEND_RESULT[r.sendResult]) + '</td>' +
          '<td>' + r.totalRecords + '</td>' +
          '<td>' + nliEsc(r.creator) + '</td>' +
          '<td>' + nliEsc(r.createdDate) + '</td>' +
          '<td><button class="nli-link-btn' + (dl ? ' loading' : '') + '" data-download="' + r.id + '"' + (dl ? ' disabled' : '') + '>下载</button></td>' +
          '</tr>';
      });
    }
    html += '</tbody></table></div>';
    // 分页（ProTable 默认 pageSize 20 + showSizeChanger）
    var totalPages = Math.max(1, Math.ceil(total / nliState.pageSize));
    html += '<div class="nli-pager"><span>共 ' + total + ' 条</span>' +
      '<select class="nli-select" id="nliPageSize" style="width:94px">' +
      [10, 20, 50, 100].map(function (n) { return '<option value="' + n + '"' + (nliState.pageSize === n ? ' selected' : '') + '>' + n + ' 条/页</option>'; }).join('') + '</select>' +
      '<button class="nli-page-btn" id="nliPrevPage" ' + (nliState.page <= 1 ? 'disabled' : '') + '>‹</button>';
    for (var p = 1; p <= totalPages; p++) {
      if (totalPages > 7 && p > 3 && p < totalPages - 1 && Math.abs(p - nliState.page) > 1) {
        if (p === 4) html += '<span>…</span>';
        continue;
      }
      html += '<button class="nli-page-btn' + (p === nliState.page ? ' on' : '') + '" data-page="' + p + '">' + p + '</button>';
    }
    html += '<button class="nli-page-btn" id="nliNextPage" ' + (nliState.page >= totalPages ? 'disabled' : '') + '>›</button>' +
      '<span>第 ' + nliState.page + ' / ' + totalPages + ' 页</span></div>';
    return html;
  }

  // ==================== 提示组件（对齐 antd notification / message / 交互 toast） ====================
  function nliNotification(title, desc) {
    var old = document.getElementById('nliNotification');
    if (old) old.remove();
    clearTimeout(nliState.notifyTimer);
    var el = document.createElement('div');
    el.className = 'nli-notification';
    el.id = 'nliNotification';
    el.innerHTML = '<div class="nli-notify-ico">✓</div><div><div class="nli-notify-title">' + nliEsc(title) + '</div><div class="nli-notify-desc">' + nliEsc(desc) + '</div></div>';
    document.body.appendChild(el);
    nliState.notifyTimer = setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { if (el.parentNode) el.remove(); }, 260);
    }, 3500);
  }

  function nliMessage(text) {
    var old = document.getElementById('nliMessage');
    if (old) old.remove();
    clearTimeout(nliState.msgTimer);
    var el = document.createElement('div');
    el.className = 'nli-message';
    el.id = 'nliMessage';
    el.innerHTML = '<i class="nli-msg-ico">i</i>' + nliEsc(text);
    document.body.appendChild(el);
    nliState.msgTimer = setTimeout(function () { if (el.parentNode) el.remove(); }, 2500);
  }

  function nliToast(text) {
    var old = document.getElementById('nliToast');
    if (old) old.remove();
    clearTimeout(nliState.toastTimer);
    var el = document.createElement('div');
    el.className = 'nli-toast';
    el.id = 'nliToast';
    el.textContent = text;
    document.body.appendChild(el);
    nliState.toastTimer = setTimeout(function () { if (el.parentNode) el.remove(); }, 2200);
  }

  // ==================== 导入弹窗（对齐生产 UpdateTemplate：Modal「提示」+ 三按钮 + Dragger） ====================
  function nliModalHtml() {
    var fileRow = nliState.uploadFileName
      ? '<div class="nli-file-row"><i class="nli-file-ico">✓</i><span class="nli-file-name" title="' + nliEsc(nliState.uploadFileName) + '">' + nliEsc(nliState.uploadFileName) + '</span><button class="nli-file-x" id="nliFileRemove" title="移除文件">×</button></div>'
      : '';
    return '<div class="nli-modal-mask" id="nliModalMask">' +
      '<div class="nli-modal">' +
      '<div class="nli-modal-head">提示<button class="nli-modal-close" id="nliModalClose" title="关闭">×</button></div>' +
      '<div class="nli-modal-body">' +
      '<div class="nli-dragger" id="nliDragger">' +
      '<div class="nli-drag-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg></div>' +
      '<div class="nli-drag-text">点击或将文件拖拽到这里上传</div>' +
      '<div class="nli-drag-hint">支持.xlsx格式文件</div>' +
      fileRow +
      '</div>' +
      '<input type="file" id="nliFileInput" accept=".xlsx" style="display:none" />' +
      '</div>' +
      '<div class="nli-modal-foot">' +
      '<button class="nli-btn' + (nliState.templateLoading ? ' loading' : '') + '" id="nliTemplateBtn"' + (nliState.templateLoading ? ' disabled' : '') + '>模版下载</button>' +
      '<button class="nli-btn" id="nliCancelBtn">取消</button>' +
      '<button class="nli-btn nli-btn-primary' + (nliState.importLoading ? ' loading' : '') + '" id="nliImportBtn"' + (nliState.importLoading ? ' disabled' : '') + '>导入</button>' +
      '</div>' +
      '</div></div>';
  }

  function nliModalOpen() {
    nliState.modalVisible = true;
    nliState.uploadFileName = '';
    nliState.templateLoading = false;
    nliState.importLoading = false;
    nliModalRender();
  }

  function nliModalClose() {
    nliState.modalVisible = false;
    nliState.templateLoading = false;
    nliState.importLoading = false;
    var mask = document.getElementById('nliModalMask');
    if (mask) mask.remove();
  }

  function nliModalRender() {
    var old = document.getElementById('nliModalMask');
    if (old) old.remove();
    var wrap = document.createElement('div');
    wrap.innerHTML = nliModalHtml();
    var mask = wrap.children[0];
    document.body.appendChild(mask);
    nliBindModalEvents(mask);
  }

  // 模版下载（生产 receiveTagImportTemplate → 线索导入模版_{timestamp}.xlsx）
  function nliHandleTemplate() {
    if (nliState.templateLoading) return;
    nliState.templateLoading = true;
    nliModalRender();
    setTimeout(function () {
      nliState.templateLoading = false;
      if (nliState.modalVisible) nliModalRender();
      nliToast('模版下载成功');
    }, 600);
  }

  // 导入提交（生产：无文件 message.info；成功 notification + 关闭 + reload）
  function nliHandleImport() {
    if (nliState.importLoading) return;
    if (!nliState.uploadFileName) {
      nliMessage('请先上传文件');
      return;
    }
    nliState.importLoading = true;
    nliModalRender();
    setTimeout(function () {
      nliState.importLoading = false;
      nliModalClose();
      nliNotification('操作成功', '导入成功');
      // 新导入任务插入列表头部（导入中 / 未下发，对齐生产异步任务语义）
      var maxId = 0;
      nliState.rows.forEach(function (r) { if (r.id > maxId) maxId = r.id; });
      var now = new Date();
      nliState.rows.unshift({
        id: maxId + 1,
        fileName: nliState.uploadFileName,
        importStatus: 2,
        sendResult: 0,
        totalRecords: nliInt('nli-upload-' + (maxId + 1), 120, 860),
        creator: 'dcc_supervisor',
        createdDate: now.getFullYear() + '-' + nliPad2(now.getMonth() + 1) + '-' + nliPad2(now.getDate()) + ' ' + nliPad2(now.getHours()) + ':' + nliPad2(now.getMinutes()) + ':' + nliPad2(now.getSeconds())
      });
      nliState.uploadFileName = '';
      nliState.page = 1;
      nliRenderPage();
    }, 700);
  }

  // ==================== 主页面渲染 ====================
  function nliRenderPage() {
    var page = document.getElementById('leadImportPage');
    if (!page) return;
    nliEnsureStyles();
    page.innerHTML = '<div class="nli-page-card">' + nliFilterBarHtml() + nliToolbarHtml() + nliTableHtml() + '</div>';
    nliBindEvents(page);
  }

  // ==================== 主页面事件（委托） ====================
  function nliBindEvents(page) {
    if (page._nliBound) return;
    page._nliBound = true;
    page.addEventListener('click', function (e) {
      if (e.target.closest('#nliQueryBtn')) {
        nliCollectFilters();
        nliState.page = 1;
        nliRenderPage();
        return;
      }
      if (e.target.closest('#nliResetBtn')) {
        nliState.filters = nliDefaultFilters();
        nliState.page = 1;
        nliRenderPage();
        return;
      }
      if (e.target.closest('#nliImportOpenBtn')) {
        nliModalOpen();
        return;
      }
      if (e.target.closest('#nliReloadBtn')) {
        nliRenderPage();
        nliToast('刷新成功');
        return;
      }
      if (e.target.closest('#nliPrevPage') && nliState.page > 1) {
        nliState.page--;
        nliRenderPage();
        return;
      }
      if (e.target.closest('#nliNextPage') && nliState.page < Math.max(1, Math.ceil(nliQueryRows().length / nliState.pageSize))) {
        nliState.page++;
        nliRenderPage();
        return;
      }
      var pb = e.target.closest('.nli-page-btn[data-page]');
      if (pb) {
        nliState.page = +pb.getAttribute('data-page');
        nliRenderPage();
        return;
      }
      var dl = e.target.closest('[data-download]');
      if (dl && !dl.disabled) {
        var id = +dl.getAttribute('data-download');
        nliState.downloadingId = id;
        nliRenderPage();
        setTimeout(function () {
          nliState.downloadingId = 0;
          if (document.getElementById('leadImportPage')) nliRenderPage();
          nliToast('下载成功');
        }, 600);
      }
    });
    page.addEventListener('change', function (e) {
      if (e.target.id === 'nliPageSize') {
        nliState.pageSize = +e.target.value;
        nliState.page = 1;
        nliRenderPage();
        return;
      }
      if (e.target.id === 'nliDateS' || e.target.id === 'nliDateE') {
        nliState.filters.createdDate = [
          (document.getElementById('nliDateS') || {}).value || '',
          (document.getElementById('nliDateE') || {}).value || ''
        ];
      }
    });
  }

  function nliCollectFilters() {
    var fn = document.getElementById('nliFFileName');
    var is = document.getElementById('nliFImportStatus');
    var sr = document.getElementById('nliFSendResult');
    if (fn) nliState.filters.fileName = fn.value.trim();
    if (is) nliState.filters.importStatus = is.value;
    if (sr) nliState.filters.sendResult = sr.value;
    nliState.filters.createdDate = [
      (document.getElementById('nliDateS') || {}).value || '',
      (document.getElementById('nliDateE') || {}).value || ''
    ];
  }

  // ==================== 弹窗事件（委托 + Dragger 拖拽） ====================
  function nliBindModalEvents(mask) {
    mask.addEventListener('click', function (e) {
      if (e.target === mask || e.target.closest('#nliModalClose') || e.target.closest('#nliCancelBtn')) {
        nliModalClose();
        return;
      }
      if (e.target.closest('#nliTemplateBtn')) {
        nliHandleTemplate();
        return;
      }
      if (e.target.closest('#nliImportBtn')) {
        nliHandleImport();
        return;
      }
      if (e.target.closest('#nliFileRemove')) {
        nliState.uploadFileName = '';
        nliModalRender();
        return;
      }
      if (e.target.closest('#nliDragger')) {
        var fi = mask.querySelector('#nliFileInput');
        if (fi) fi.click();
      }
    });
    mask.addEventListener('change', function (e) {
      if (e.target.id === 'nliFileInput' && e.target.files && e.target.files.length) {
        nliAcceptFile(e.target.files[0].name);
      }
    });
    var dragger = mask.querySelector('#nliDragger');
    if (dragger) {
      dragger.addEventListener('dragover', function (e) {
        e.preventDefault();
        dragger.classList.add('nli-dragover');
      });
      dragger.addEventListener('dragleave', function () {
        dragger.classList.remove('nli-dragover');
      });
      dragger.addEventListener('drop', function (e) {
        e.preventDefault();
        dragger.classList.remove('nli-dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
          nliAcceptFile(e.dataTransfer.files[0].name);
        }
      });
    }
  }

  // 文件接受（生产 accept .xlsx + maxCount 1，重复选择覆盖）
  function nliAcceptFile(name) {
    if (!/\.xlsx$/i.test(name)) {
      nliMessage('仅支持.xlsx格式文件');
      return;
    }
    nliState.uploadFileName = name;
    nliModalRender();
  }

  // ==================== 挂载入口（后加载覆盖 23 号旧版，30/31 号先例） ====================
  window.renderLeadImportPage = nliRenderPage;

  // ==================== 初始化 ====================
  function init() {
    var page = document.getElementById('leadImportPage');
    if (page && page.classList.contains('show')) {
      nliRenderPage();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
