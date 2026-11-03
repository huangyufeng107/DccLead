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
    modalStep: 1,
    uploadFileName: '',
    uploadRows: [],
    uploadValidCount: 0,
    uploadErrors: 0,
    templateLoading: false,
    importLoading: false,
    downloadingId: 0,
    toastTimer: 0,
    notifyTimer: 0,
    msgTimer: 0
  };
  var nliModalTrigger = null;

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
    css += [
      '#leadImportPage .nli-page{display:grid;gap:14px;padding:0 0 24px;}',
      '#leadImportPage .nli-page-card{padding:0;border:1px solid #e4eaf3;border-radius:8px;box-shadow:0 1px 2px rgba(15,23,42,.05);overflow:hidden;}',
      '#leadImportPage .nli-search{display:grid;grid-template-columns:repeat(3,minmax(150px,1fr)) minmax(300px,1.5fr) auto;align-items:end;gap:14px 12px;padding:18px 20px 20px;border-radius:0;}',
      '#leadImportPage .nli-fi{display:flex;flex-direction:column;align-items:stretch;gap:6px;min-width:0;}',
      '#leadImportPage .nli-label{font-size:12px;font-weight:700;line-height:1.2;color:#475569;}',
      '#leadImportPage .nli-input,#leadImportPage .nli-select,#leadImportPage .nli-date{width:100%;height:36px;border:1px solid #d5deea;border-radius:6px;background-color:#f8fafc;color:#1f2937;font-size:13px;}',
      '#leadImportPage .nli-input:focus,#leadImportPage .nli-select:focus,#leadImportPage .nli-date:focus{border-color:#2563eb;background-color:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.12);}',
      '#leadImportPage .nli-date-range{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:6px;}',
      '#leadImportPage .nli-date-range span{color:#64748b;font-size:12px;}',
      '#leadImportPage .nli-search-actions{margin:0;padding:0;align-self:end;gap:8px;white-space:nowrap;}',
      '#leadImportPage .nli-btn{height:36px;border-color:#d5deea;color:#475569;font-size:13px;font-weight:600;}',
      '#leadImportPage .nli-btn:hover{border-color:#93c5fd;color:#2563eb;}',
      '#leadImportPage .nli-btn-primary{border-color:#2563eb;background:#2563eb;color:#fff;}',
      '#leadImportPage .nli-btn-primary:hover{border-color:#1d4ed8;background:#1d4ed8;color:#fff;}',
      '#leadImportPage .nli-toolbar{padding:13px 16px;border-bottom:1px solid #e8eef7;gap:8px;}',
      '#leadImportPage .nli-toolbar-title{margin-right:auto;color:#111827;font-size:15px;font-weight:700;}',
      '#leadImportPage .nli-toolbar-count{margin-left:8px;color:#94a3b8;font-size:12px;font-weight:500;}',
      '#leadImportPage .nli-table-wrap{padding:0;}',
      '#leadImportPage .nli-table{min-width:1050px;font-size:13px;}',
      '#leadImportPage .nli-table th{height:auto;padding:12px 14px;background:#f8fafc;color:#64748b;font-size:12px;text-align:left;border-color:#e8eef7;}',
      '#leadImportPage .nli-table td{padding:14px;color:#334155;text-align:left;border-color:#edf2f7;}',
      '#leadImportPage .nli-table tbody tr:hover td{background:#f8fbff;}',
      '#leadImportPage .nli-table .nli-number{text-align:center;}',
      '#leadImportPage .nli-table .nli-file-cell{max-width:390px;overflow:hidden;text-overflow:ellipsis;}',
      '#leadImportPage .nli-table .nli-count{text-align:right;font-variant-numeric:tabular-nums;}',
      '#leadImportPage .nli-status{display:inline-flex;align-items:center;min-height:22px;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:700;}',
      '#leadImportPage .nli-status.success{background:#ecfdf5;color:#0f766e;}',
      '#leadImportPage .nli-status.error{background:#fff1f1;color:#b91c1c;}',
      '#leadImportPage .nli-status.processing{background:#eff6ff;color:#1d4ed8;}',
      '#leadImportPage .nli-status.pending{background:#f5f7fa;color:#64748b;}',
      '#leadImportPage .nli-link-btn{color:#2563eb;font-size:13px;font-weight:600;}',
      '#leadImportPage .nli-pager{justify-content:space-between;padding:13px 20px;border-top:1px solid #e8eef7;color:#64748b;font-size:13px;}',
      '#leadImportPage .nli-pager-controls{display:flex;align-items:center;gap:6px;}',
      '#leadImportPage .nli-page-btn{height:30px;min-width:30px;border-color:#d5deea;color:#475569;font-size:13px;}',
      '#leadImportPage .nli-page-btn.on{border-color:#2563eb;background:#2563eb;color:#fff;}',
      '.nli-modal-mask{top:var(--dcc-docs-header-height,0px);background:rgba(15,23,42,.48);z-index:21900;padding:20px;}',
      '.nli-modal{width:min(1040px,calc(100vw - 40px));max-height:calc(100vh - var(--dcc-docs-header-height,0px) - 40px);display:flex;flex-direction:column;overflow:hidden;border:1px solid #e4eaf3;border-radius:10px;box-shadow:0 20px 50px rgba(15,23,42,.2);}',
      '.nli-modal-head{padding:18px 22px;border-color:#e8eef7;color:#111827;}',
      '.nli-modal-body{padding:22px;overflow:auto;}',
      '.nli-modal-foot{padding:14px 22px;border-color:#e8eef7;}',
      '.nli-modal .nli-btn{height:36px;border-color:#d5deea;color:#475569;font-size:13px;font-weight:600;}',
      '.nli-modal .nli-btn-primary{border-color:#2563eb;background:#2563eb;color:#fff;}',
      '.nli-modal .nli-btn-primary:hover{border-color:#1d4ed8;background:#1d4ed8;color:#fff;}',
      '.nli-dragger{border-color:#bfd3f3;background:#f8fbff;}',
      '.nli-dragger:hover,.nli-dragger.nli-dragover{border-color:#2563eb;background:#eff6ff;}',
      '.nli-drag-text{color:#334155;}',
      '.nli-drag-hint{color:#64748b;}',
      '.nli-modal .assignment-import-preview table{width:100%;min-width:700px;border-collapse:collapse;font-size:13px;}',
      '.nli-modal .assignment-import-preview th,.nli-modal .assignment-import-preview td{padding:10px 12px;border-bottom:1px solid #e8eef7;text-align:left;}',
      '.nli-modal .assignment-import-preview th{background:#f8fafc;color:#64748b;}',
      '.nli-notification{top:calc(var(--dcc-docs-header-height,0px) + 24px);}',
      '.nli-message,.nli-toast{top:calc(var(--dcc-docs-header-height,0px) + 12px);}',
      '@media(max-width:1450px){#leadImportPage .nli-search{grid-template-columns:repeat(3,minmax(0,1fr));}#leadImportPage .nli-date-field{grid-column:span 2;}#leadImportPage .nli-search-actions{justify-content:flex-end;}}',
      '@media(max-width:900px){#leadImportPage .nli-search{grid-template-columns:repeat(2,minmax(0,1fr));}#leadImportPage .nli-date-field{grid-column:span 2;}}',
      '@media(max-width:600px){#leadImportPage .nli-search{grid-template-columns:1fr;}#leadImportPage .nli-date-field{grid-column:auto;}#leadImportPage .nli-search-actions{justify-content:flex-start;}#leadImportPage .nli-pager{flex-wrap:wrap;gap:10px;}}'
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
      '<label class="nli-fi"><span class="nli-label">文件名称</span><input class="nli-input" id="nliFFileName" placeholder="请输入文件名称" value="' + nliEsc(f.fileName) + '" /></label>' +
      '<label class="nli-fi"><span class="nli-label">导入结果</span><select class="nli-select" id="nliFImportStatus">' + optHtml(NLI_IMPORT_STATUS, f.importStatus) + '</select></label>' +
      '<label class="nli-fi"><span class="nli-label">下发结果</span><select class="nli-select" id="nliFSendResult">' + optHtml(NLI_SEND_RESULT, f.sendResult) + '</select></label>' +
      '<div class="nli-fi nli-date-field"><span class="nli-label">创建时间</span><div class="nli-date-range"><input class="nli-date" id="nliDateS" type="date" aria-label="创建开始日期" value="' + nliEsc(f.createdDate[0]) + '" /><span>至</span><input class="nli-date" id="nliDateE" type="date" aria-label="创建结束日期" value="' + nliEsc(f.createdDate[1]) + '" /></div></div>' +
      '<div class="nli-search-actions">' +
      '<button class="nli-btn nli-btn-primary" type="button" id="nliQueryBtn">查询</button>' +
      '<button class="nli-btn" type="button" id="nliResetBtn">重置</button>' +
      '</div></div>';
  }

  // ==================== 工具栏（生产 toolBarRender：仅「导入」primary；options.reload → 刷新） ====================
  function nliToolbarHtml() {
    return '<div class="nli-toolbar">' +
      '<div class="nli-toolbar-title">线索导入列表<span class="nli-toolbar-count">共 ' + nliQueryRows().length + ' 条记录</span></div>' +
      '<button class="nli-btn" type="button" id="nliReloadBtn">刷新</button>' +
      '<button class="nli-btn nli-btn-primary" type="button" id="nliImportOpenBtn">导入数据</button>' +
      '</div>';
  }

  // ==================== 表格（保留原有 8 个字段，按站内列表样式展示） ====================
  function nliTableHtml() {
    var rows = nliQueryRows();
    var total = rows.length;
    var start = (nliState.page - 1) * nliState.pageSize;
    var pageRows = rows.slice(start, start + nliState.pageSize);
    var html = '<div class="nli-table-wrap"><table class="nli-table"><thead><tr>' +
      '<th class="nli-number" style="width:70px">序号</th>' +
      '<th style="min-width:220px">文件名称</th>' +
      '<th style="width:110px">导入结果</th>' +
      '<th style="width:110px">下发结果</th>' +
      '<th class="nli-count" style="width:100px">总行数</th>' +
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
          '<td class="nli-number">' + (start + idx + 1) + '</td>' +
          '<td class="nli-file-cell" title="' + nliEsc(r.fileName) + '">' + nliEsc(r.fileName) + '</td>' +
          '<td><span class="nli-status ' + (r.importStatus === 0 ? 'error' : r.importStatus === 1 ? 'success' : 'processing') + '">' + nliEsc(NLI_IMPORT_STATUS[r.importStatus]) + '</span></td>' +
          '<td><span class="nli-status ' + (r.sendResult === 0 ? 'pending' : r.sendResult === 1 ? 'success' : 'processing') + '">' + nliEsc(NLI_SEND_RESULT[r.sendResult]) + '</span></td>' +
          '<td class="nli-count">' + r.totalRecords + '</td>' +
          '<td>' + nliEsc(r.creator) + '</td>' +
          '<td>' + nliEsc(r.createdDate) + '</td>' +
          '<td><button type="button" class="nli-link-btn' + (dl ? ' loading' : '') + '" data-download="' + r.id + '"' + (dl ? ' disabled' : '') + '>下载记录</button></td>' +
          '</tr>';
      });
    }
    html += '</tbody></table></div>';
    // 分页（ProTable 默认 pageSize 20 + showSizeChanger）
    var totalPages = Math.max(1, Math.ceil(total / nliState.pageSize));
    html += '<div class="nli-pager prototype-pagination"><span class="prototype-pagination-summary">共 ' + total + ' 条记录，当前第 ' + nliState.page + ' / ' + totalPages + ' 页</span><div class="nli-pager-controls prototype-pagination-controls">' +
      '<select class="prototype-pagination-select" id="nliPageSize" aria-label="每页显示条数">' +
      [5, 10, 20, 50, 100].map(function (n) { return '<option value="' + n + '"' + (nliState.pageSize === n ? ' selected' : '') + '>每页 ' + n + ' 条</option>'; }).join('') + '</select>' +
      '<button type="button" class="prototype-pagination-arrow" id="nliPrevPage" aria-label="上一页" ' + (nliState.page <= 1 ? 'disabled' : '') + '><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>' +
      '<select class="prototype-pagination-select" id="nliPageSelect" aria-label="选择页码">' +
      Array.from({ length: totalPages }, function (_, index) { var p = index + 1; return '<option value="' + p + '"' + (p === nliState.page ? ' selected' : '') + '>第 ' + p + ' 页</option>'; }).join('') + '</select>' +
      '<button type="button" class="prototype-pagination-arrow" id="nliNextPage" aria-label="下一页" ' + (nliState.page >= totalPages ? 'disabled' : '') + '><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button></div></div>';
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
    var step = nliState.modalStep;
    var steps = ['上传文件', '数据预览', '导入完成'].map(function (title, index) {
      var number = index + 1;
      return '<div class="assignment-import-step ' + (number === step ? 'active' : number < step ? 'done' : '') + '"><div class="assignment-import-step-index">Step' + number + '</div><div class="assignment-import-step-title">' + title + '</div></div>';
    }).join('');
    var fileRow = nliState.uploadFileName
      ? '<div class="nli-file-row"><i class="nli-file-ico">✓</i><span class="nli-file-name" title="' + nliEsc(nliState.uploadFileName) + '">' + nliEsc(nliState.uploadFileName) + '</span><button class="nli-file-x" id="nliFileRemove" title="移除文件">×</button></div>'
      : '';
    var body = step === 1
      ? '<div class="assignment-import-panel"><div class="assignment-import-tip">Step1 操作说明：下载 Excel 模板了解格式要求 → 按模板填写 → 上传文件。必填字段为客户姓名、手机号、意向车系、R渠道编码；上传后校验表头、必填项、手机号格式与文件内重复数据。</div><div><button type="button" class="btn-secondary" id="nliTemplateBtn">下载模板</button></div><label class="assignment-import-upload"><input type="file" id="nliFileInput" accept=".xls,.csv" /><div><strong>上传线索文件</strong><span>支持本页 Excel 模板（.xls），也兼容 CSV 文件；单文件不超过 10MB</span></div></label>' + fileRow + '</div>'
      : step === 2
        ? '<div class="assignment-import-panel"><div class="assignment-import-summary"><div class="assignment-import-stat"><div class="assignment-import-stat-label">解析总数</div><div class="assignment-import-stat-value">' + nliState.uploadRows.length + '</div></div><div class="assignment-import-stat"><div class="assignment-import-stat-label">校验通过</div><div class="assignment-import-stat-value">' + nliState.uploadValidCount + '</div></div><div class="assignment-import-stat"><div class="assignment-import-stat-label">异常或重复</div><div class="assignment-import-stat-value">' + nliState.uploadErrors + '</div></div></div><div class="assignment-import-preview"><table><thead><tr><th>行号</th><th>客户姓名</th><th>手机号</th><th>意向车系</th><th>R渠道编码</th><th>校验结果</th></tr></thead><tbody>' + nliState.uploadRows.slice(0, 6).map(function (row) { return '<tr><td>' + row.rowNo + '</td><td>' + nliEsc(row.name) + '</td><td>' + nliEsc(row.phone) + '</td><td>' + nliEsc(row.series) + '</td><td>' + nliEsc(row.channel) + '</td><td class="' + (row.valid ? 'assignment-import-pass' : 'assignment-import-error') + '">' + nliEsc(row.error || '通过') + '</td></tr>'; }).join('') + '</tbody></table></div><div class="assignment-import-tip">仅校验通过的数据会加入导入任务；异常和重复数据不会导入。</div></div>'
        : '<div class="assignment-import-complete"><div class="assignment-import-complete-title">导入完成</div><div class="assignment-import-complete-desc">已导入 ' + nliState.uploadValidCount + ' 条，异常或重复 ' + nliState.uploadErrors + ' 条；批次已加入列表，等待后续下发处理。</div></div>';
    var footer = step === 1
      ? '<button type="button" class="btn-cancel" id="nliCancelBtn">取消</button><button type="button" class="btn-save" id="nliNextBtn"' + (nliState.uploadRows.length ? '' : ' disabled') + '>下一步</button>'
      : step === 2
        ? '<button type="button" class="btn-cancel" id="nliBackBtn">上一步</button><button type="button" class="btn-save" id="nliImportBtn"' + (nliState.uploadValidCount ? '' : ' disabled') + '>确认导入</button>'
        : '<button type="button" class="btn-save" id="nliFinishBtn">完成</button>';
    return '<div class="nli-modal-mask" id="nliModalMask">' +
      '<div class="modal assignment-import-modal nli-modal" role="dialog" aria-modal="true" aria-labelledby="nliModalTitle">' +
      '<div class="modal-header nli-modal-head" id="nliModalTitle">导入线索<button type="button" class="modal-close nli-modal-close" id="nliModalClose" aria-label="关闭">×</button></div>' +
      '<div class="modal-body nli-modal-body"><div class="assignment-import-steps">' + steps + '</div>' + body + '</div>' +
      '<div class="modal-footer nli-modal-foot">' + footer + '</div>' +
      '</div></div>';
  }

  function nliModalOpen() {
    nliModalTrigger = document.activeElement;
    nliState.modalVisible = true;
    nliState.modalStep = 1;
    nliState.uploadFileName = '';
    nliState.uploadRows = [];
    nliState.uploadValidCount = 0;
    nliState.uploadErrors = 0;
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
    if (nliModalTrigger && nliModalTrigger.isConnected) nliModalTrigger.focus();
  }

  function nliModalRender() {
    var old = document.getElementById('nliModalMask');
    if (old) old.remove();
    var wrap = document.createElement('div');
    wrap.innerHTML = nliModalHtml();
    var mask = wrap.children[0];
    document.body.appendChild(mask);
    nliBindModalEvents(mask);
    mask.querySelector('#nliModalClose').focus();
  }

  // 与其他导入页共用 Excel XML 工作簿模板，确保下载后可直接用 Excel 填写并回传。
  function nliHandleTemplate() {
    downloadExcelWorkbookFile('线索导入模板.xls', [
      { name: '导入数据', columns: ['客户姓名', '手机号', '意向车系', 'R渠道编码'], rows: [['张三', '13800138000', 'N6', 'R1']] },
      { name: '填写说明', columns: ['字段', '是否必填', '填写说明'], rows: [
        ['客户姓名', '必填', '填写客户姓名'],
        ['手机号', '必填', '中国大陆 11 位手机号；同一文件内不可重复'],
        ['意向车系', '必填', '填写客户意向车系'],
        ['R渠道编码', '必填', '填写线索来源的渠道编码']
      ] }
    ], '线索导入 Excel 模板已下载');
  }

  // 确认后新增批次。当前原型解析本页生成的 Excel XML 模板或 CSV 文本。
  function nliHandleImport() {
    if (!nliState.uploadValidCount) return;
    var maxId = 0;
    nliState.rows.forEach(function (r) { if (r.id > maxId) maxId = r.id; });
    var now = new Date();
    nliState.rows.unshift({
      id: maxId + 1,
      fileName: nliState.uploadFileName,
      importStatus: 1,
      sendResult: 0,
      totalRecords: nliState.uploadRows.length,
      creator: 'dcc_supervisor',
      createdDate: now.getFullYear() + '-' + nliPad2(now.getMonth() + 1) + '-' + nliPad2(now.getDate()) + ' ' + nliPad2(now.getHours()) + ':' + nliPad2(now.getMinutes()) + ':' + nliPad2(now.getSeconds())
    });
    nliState.page = 1;
    nliState.modalStep = 3;
    nliRenderPage();
    nliModalRender();
  }

  // ==================== 主页面渲染 ====================
  function nliRenderPage() {
    var page = document.getElementById('leadImportPage');
    if (!page) return;
    nliEnsureStyles();
    page.innerHTML = '<div class="nli-page"><div class="page-hero"><div><div class="page-title">线索导入</div><div class="page-desc">按文件查看线索批次的导入与下发结果，支持模板下载和批量导入。</div></div></div><section class="card nli-page-card"><div class="section-header"><div class="section-title">筛选查询</div></div>' + nliFilterBarHtml() + '</section><section class="card nli-page-card">' + nliToolbarHtml() + nliTableHtml() + '</section></div>';
    nliBindEvents(page);
  }

  // ==================== 主页面事件（委托） ====================
  function nliBindEvents(page) {
    if (page._nliBound) return;
    page._nliBound = true;
    page.addEventListener('click', function (e) {
      if (e.target.closest('#nliQueryBtn')) {
        nliCollectFilters();
        if (nliState.filters.createdDate[0] && nliState.filters.createdDate[1] && nliState.filters.createdDate[0] > nliState.filters.createdDate[1]) {
          nliMessage('开始日期不能晚于结束日期');
          return;
        }
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
        var record = nliState.rows.find(function (row) { return row.id === id; });
        if (!record) return;
        downloadExcelWorkbookFile(record.fileName.replace(/\.(xlsx|xls|csv)$/i, '') + '_导入记录.xls', [{
          name: '导入记录',
          columns: ['文件名称', '导入结果', '下发结果', '总行数', '创建账号', '创建时间'],
          rows: [[record.fileName, NLI_IMPORT_STATUS[record.importStatus], NLI_SEND_RESULT[record.sendResult], record.totalRecords, record.creator, record.createdDate]]
        }], '批次记录 Excel 文件已下载');
      }
    });
    page.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.closest('.nli-search')) {
        e.preventDefault();
        page.querySelector('#nliQueryBtn').click();
      }
    });
    page.addEventListener('change', function (e) {
      if (e.target.id === 'nliPageSize') {
        nliState.pageSize = +e.target.value;
        nliState.page = 1;
        nliRenderPage();
        return;
      }
      if (e.target.id === 'nliPageSelect') {
        nliState.page = Math.min(Math.max(1, +e.target.value || 1), Math.max(1, Math.ceil(nliQueryRows().length / nliState.pageSize)));
        nliRenderPage();
        return;
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
    mask.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') nliModalClose();
    });
    mask.addEventListener('click', function (e) {
      if (e.target === mask || e.target.closest('#nliModalClose') || e.target.closest('#nliCancelBtn') || e.target.closest('#nliFinishBtn')) {
        nliModalClose();
        return;
      }
      if (e.target.closest('#nliNextBtn')) {
        if (!nliState.uploadRows.length) return;
        nliState.modalStep = 2;
        nliModalRender();
        return;
      }
      if (e.target.closest('#nliBackBtn')) {
        nliState.modalStep = 1;
        nliModalRender();
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
        nliState.uploadRows = [];
        nliState.uploadValidCount = 0;
        nliState.uploadErrors = 0;
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
        nliAcceptFile(e.target.files[0]);
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
          nliAcceptFile(e.dataTransfer.files[0]);
        }
      });
    }
  }

  function nliParseCsv(text) {
    var records = [], row = [], cell = '', quoted = false;
    text = String(text || '').replace(/^\ufeff/, '');
    for (var i = 0; i < text.length; i++) {
      var char = text[i];
      if (char === '"') {
        if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
        else quoted = !quoted;
      } else if (char === ',' && !quoted) {
        row.push(cell.trim()); cell = '';
      } else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && text[i + 1] === '\n') i++;
        row.push(cell.trim()); cell = '';
        if (row.some(Boolean)) records.push(row);
        row = [];
      } else cell += char;
    }
    row.push(cell.trim());
    if (row.some(Boolean)) records.push(row);
    return records;
  }

  function nliParseExcelXml(text) {
    var doc = new DOMParser().parseFromString(String(text || '').replace(/^\ufeff/, ''), 'text/xml');
    if (doc.querySelector('parsererror')) return [];
    var sheet = doc.getElementsByTagName('Worksheet')[0] || doc.getElementsByTagNameNS('*', 'Worksheet')[0];
    if (!sheet) return [];
    var rows = sheet.getElementsByTagName('Row');
    if (!rows.length) rows = sheet.getElementsByTagNameNS('*', 'Row');
    return Array.from(rows, function (row) {
      var cells = row.getElementsByTagName('Cell');
      if (!cells.length) cells = row.getElementsByTagNameNS('*', 'Cell');
      return Array.from(cells, function (cell) { return cell.textContent.trim(); });
    }).filter(function (row) { return row.some(Boolean); });
  }

  // 文件接受：按模板列校验 Excel XML 或 CSV 内容，重复手机号只保留第一条。
  function nliAcceptFile(file) {
    if (!/\.(xls|csv)$/i.test(file.name)) {
      nliMessage('请上传本页下载的 Excel 模板（.xls），或 CSV 文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { nliMessage('文件不能超过 10MB'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var matrix = /\.xls$/i.test(file.name) ? nliParseExcelXml(reader.result) : nliParseCsv(reader.result);
      var expected = ['客户姓名', '手机号', '意向车系', 'R渠道编码'];
      if (!matrix.length || expected.some(function (name, i) { return (matrix[0][i] || '') !== name; })) {
        nliMessage('表头与导入模板不一致');
        return;
      }
      var seen = new Set();
      var rows = matrix.slice(1).map(function (cells, index) {
        var name = (cells[0] || '').trim(), phone = (cells[1] || '').trim();
        var series = (cells[2] || '').trim(), channel = (cells[3] || '').trim();
        var error = !name || !phone || !series || !channel ? '必填项未填写'
          : !/^1[3-9]\d{9}$/.test(phone) ? '手机号格式不正确'
            : seen.has(phone) ? '手机号重复' : '';
        if (!error) seen.add(phone);
        return { rowNo: index + 2, name: name, phone: phone, series: series, channel: channel, valid: !error, error: error };
      });
      if (!rows.length) { nliMessage('文件中没有可导入的数据'); return; }
      nliState.uploadFileName = file.name;
      nliState.uploadRows = rows;
      nliState.uploadValidCount = rows.filter(function (row) { return row.valid; }).length;
      nliState.uploadErrors = rows.length - nliState.uploadValidCount;
      nliModalRender();
    };
    reader.onerror = function () { nliMessage('文件读取失败，请重新选择'); };
    reader.readAsText(file, 'utf-8');
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
