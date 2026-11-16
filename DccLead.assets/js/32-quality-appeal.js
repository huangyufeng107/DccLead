// ===== 质检管理模块 - 质检申诉（对齐生产 qualityAudit 页面） =====
// 页面结构：筛选区（坐席/申诉时间/回复时间）→ 申诉列表（ProTable 风格）
//          → 操作（审核/详情）→ 审核抽屉（QualityCheckDetailModal：员工质检/对话标签双Tab）
// 对齐规则：纯静态原型，确定性伪随机演示数据，不依赖后端 API。
// 结构对齐生产 chunk p__NEV__Sale__NEV__qualityAudit（20261019 下载源码）。

(function () {
  'use strict';

  // ==================== 确定性伪随机工具 ====================
  function qaaRnd(seed) {
    var h = 5381;
    for (var i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) % 100003;
    var x = Math.sin(h + 1) * 10000;
    return x - Math.floor(x);
  }
  function qaaInt(seed, min, max) { return Math.floor(qaaRnd(seed) * (max - min + 1)) + min; }
  function qaaFixed(seed, min, max, digits) { return +(qaaRnd(seed) * (max - min) + min).toFixed(digits == null ? 2 : digits); }

  function qaaEsc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function qaaFmtDate(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function qaaFmtDateTime(d) {
    return qaaFmtDate(d) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
  }
  function qaaDateRange(days) {
    var end = new Date(); end.setDate(end.getDate() - 1);
    var start = new Date(); start.setDate(start.getDate() - days);
    return [qaaFmtDate(start), qaaFmtDate(end)];
  }

  // ==================== Toast（对齐 antd message） ====================
  function qaaToast(text, type) {
    var old = document.querySelector('.qaa-toast');
    if (old) old.remove();
    var el = document.createElement('div');
    el.className = 'qaa-toast';
    var color = type === 'warn' ? '#faad14' : type === 'error' ? '#ff4d4f' : '#52c41a';
    el.setAttribute('style', 'position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:30000;padding:8px 20px;border-radius:4px;background:#fff;box-shadow:0 3px 12px rgba(0,0,0,0.15);font-size:14px;color:' + color + ';pointer-events:none;');
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2400);
  }

  // ==================== 坐席数据（复用看板账号体系） ====================
  var qaaSeats = [
    { account: '1005641', name: '张伟' }, { account: '1005642', name: '李娜' },
    { account: '1005643', name: '王强' }, { account: '1005644', name: '刘芳' },
    { account: '1005645', name: '陈明' }, { account: '1005646', name: '赵丽' },
    { account: '1005647', name: '孙鹏' }, { account: '1005648', name: '周婷' }
  ];

  var qaaSeriesNames = ['N7', 'ARION', '天籁', '探陆', '轩逸'];
  var qaaCustNames = ['王先生', '李女士', '陈先生', '刘女士', '杨先生', '赵女士', '黄先生', '周女士', '吴先生', '徐女士', '孙先生', '马女士', '朱先生', '胡女士', '郭先生', '何女士', '高先生', '林女士', '罗先生', '郑女士'];

  // ==================== 申诉/回复文案池（对齐 AiAnalysis 申诉场景） ====================
  var qaaAppealTexts = [
    '客户在通话中已明确表示购车意向和预算范围，系统判定未触发需求分析相关细项有误，申请复核。',
    '该通通话中坐席已完整介绍当前购车权益政策，系统判定权益介绍未触发不正确，申请复核。',
    '客户主动提出需要添加企业微信，坐席已发送添加邀请并确认，判定未触发添加企业微信细项有误。',
    '通话结尾坐席已使用礼貌结束语并确认客户无其他问题，判定未触发礼貌结束细项与事实不符。',
    '客户当时表示近期不方便接听，坐席已约定下周再次沟通，判定未主动邀请试驾有误，申请复核。',
    '系统判定触发了服务禁语，但实际语境中该表述为正常业务确认用语，并无不当表述，申请复核。',
    '客户询问的车型配置信息坐席均已准确回答，判定产品知识回答有误与录音实际情况不符。',
    '该线索客户已在其他渠道完成试驾预约，判定未引导到店试驾不合理，申请复核该项扣分。',
    '通话中客户明确表述了购车用途为家庭代步，判定未触发问购车用途细项有误，申请复核。',
    '坐席在通话全程语气平和并主动安抚客户情绪，判定服务态度扣分与实际情况不符，申请复核。'
  ];
  var qaaReplyTexts = [
    '经复核录音，坐席确实已完成该项询问，申诉成立，该项得分已恢复，请继续保持。',
    '经复核录音，该细项判定准确，坐席表述未达到触发标准，申诉驳回，建议加强话术规范。',
    '经复核，系统判定与录音实际情况一致，坐席未明确触发该细项要求，申诉驳回。',
    '经复核录音，坐席已完整执行该动作，申诉通过，相关扣分已恢复，感谢反馈。',
    '经复核，该表述在业务语境中确属正常确认用语，申诉通过，本次扣分已撤销。',
    '经复核录音，坐席对该配置问题的回答存在不准确之处，申诉驳回，建议加强产品知识学习。'
  ];

  // ==================== 质检模型（与质检看板同一模型体系） ====================
  var qaaQualityMode = [
    {
      firstSortCode: 'FS001', firstSortName: '销售引导及话术标准', firstSortPercent: 35,
      secondSorts: [
        { secondSortCode: 'SS001', secondSortName: '开场白', thirdSorts: [
          { thirdSortCode: 'TS001', thirdSortName: '报品牌+自我介绍', thirdSortDesc: '开场报出品牌并做自我介绍' }
        ] },
        { secondSortCode: 'SS002', secondSortName: '留资信息确认', thirdSorts: [
          { thirdSortCode: 'TS002', thirdSortName: '确认留资意愿', thirdSortDesc: '与客户确认留资意愿及信息准确性' }
        ] },
        { secondSortCode: 'SS003', secondSortName: '需求分析', thirdSorts: [
          { thirdSortCode: 'TS003', thirdSortName: '问购车用途', thirdSortDesc: '询问客户购车的用途场景' },
          { thirdSortCode: 'TS004', thirdSortName: '问购车方式', thirdSortDesc: '询问客户购车方式（全款/分期）' },
          { thirdSortCode: 'TS005', thirdSortName: '问购车时间', thirdSortDesc: '询问客户计划购车时间' },
          { thirdSortCode: 'TS006', thirdSortName: '问客户城市', thirdSortDesc: '确认客户所在城市' }
        ] },
        { secondSortCode: 'SS004', secondSortName: '邀请试驾排程', thirdSorts: [
          { thirdSortCode: 'TS007', thirdSortName: '主动邀请到店试驾', thirdSortDesc: '主动邀请客户到店试驾并约定时间' }
        ] },
        { secondSortCode: 'SS005', secondSortName: '姓氏确认', thirdSorts: [
          { thirdSortCode: 'TS008', thirdSortName: '确认客户姓氏', thirdSortDesc: '称呼客户前确认客户姓氏' }
        ] },
        { secondSortCode: 'SS006', secondSortName: '邀请添加企业微信', thirdSorts: [
          { thirdSortCode: 'TS009', thirdSortName: '添加客户微信', thirdSortDesc: '邀请客户添加企业微信并确认添加成功' }
        ] },
        { secondSortCode: 'SS007', secondSortName: '礼貌结束', thirdSorts: [
          { thirdSortCode: 'TS010', thirdSortName: '礼貌结束通话', thirdSortDesc: '通话结束时使用礼貌结束语' }
        ] },
        { secondSortCode: 'SS008', secondSortName: '产品介绍', thirdSorts: [
          { thirdSortCode: 'TS011', thirdSortName: '介绍车型卖点', thirdSortDesc: '结合客户需求介绍车型核心卖点' }
        ] },
        { secondSortCode: 'SS009', secondSortName: '权益介绍', thirdSorts: [
          { thirdSortCode: 'TS012', thirdSortName: '介绍购车权益', thirdSortDesc: '向客户介绍当前购车权益政策' }
        ] }
      ]
    },
    {
      firstSortCode: 'FS002', firstSortName: '应对技巧', firstSortPercent: 20,
      secondSorts: [
        { secondSortCode: 'SS010', secondSortName: '异议处理', thirdSorts: [
          { thirdSortCode: 'TS013', thirdSortName: '价格异议应对', thirdSortDesc: '客户提出价格异议时合理应对' },
          { thirdSortCode: 'TS014', thirdSortName: '竞品对比应对', thirdSortDesc: '客户提及竞品时客观应对不贬低' }
        ] },
        { secondSortCode: 'SS011', secondSortName: '需求引导', thirdSorts: [
          { thirdSortCode: 'TS015', thirdSortName: '引导到店', thirdSortDesc: '合理引导客户到店看车' },
          { thirdSortCode: 'TS016', thirdSortName: '引导留资', thirdSortDesc: '引导客户补充完善留资信息' }
        ] }
      ]
    },
    {
      firstSortCode: 'FS003', firstSortName: '服务态度', firstSortPercent: 20,
      secondSorts: [
        { secondSortCode: 'SS012', secondSortName: '服务热情', thirdSorts: [
          { thirdSortCode: 'TS017', thirdSortName: '主动问候', thirdSortDesc: '接通后主动问候客户' },
          { thirdSortCode: 'TS018', thirdSortName: '耐心解答', thirdSortDesc: '客户反复询问时耐心解答不敷衍' }
        ] },
        { secondSortCode: 'SS013', secondSortName: '情绪管理', thirdSorts: [
          { thirdSortCode: 'TS019', thirdSortName: '语气平和', thirdSortDesc: '全程语气平和，无情绪化表达' },
          { thirdSortCode: 'TS020', thirdSortName: '安抚客户', thirdSortDesc: '客户有不满情绪时及时安抚' }
        ] }
      ]
    },
    {
      firstSortCode: 'FS004', firstSortName: '通话行为', firstSortPercent: 25,
      secondSorts: [
        { secondSortCode: 'SS014', secondSortName: '表述清晰', thirdSorts: [
          { thirdSortCode: 'TS021', thirdSortName: '口齿清楚', thirdSortDesc: '表达清晰，吐字清楚不含糊' },
          { thirdSortCode: 'TS022', thirdSortName: '语速适中', thirdSortDesc: '语速平稳适中，不含糊、不急促' }
        ] },
        { secondSortCode: 'SS015', secondSortName: '通话规范', thirdSorts: [
          { thirdSortCode: 'TS023', thirdSortName: '无长时间静音', thirdSortDesc: '通话中未出现10秒以上静音' },
          { thirdSortCode: 'TS024', thirdSortName: '无打断客户', thirdSortDesc: '客户讲话时未强行打断' }
        ] }
      ]
    }
  ];

  // ==================== 申诉列表数据（对齐 queryAuditLists 返回 rows/records） ====================
  // 行字段：id/taskCode/recordId/qcSource/seatName/seatAccount/custName/hdClueId/
  //        appealCnt/appealText/replyText/appealDate/replyDate/seedKey
  function qaaBuildAppealRows() {
    var rows = [];
    var total = 47;
    for (var i = 0; i < total; i++) {
      var sk = 'APPEAL_ROW_' + i;
      var seat = qaaSeats[qaaPick(sk + '_seat', qaaSeats.length)];
      var custIdx = qaaInt(sk + '_cust', 0, qaaCustNames.length - 1);
      // 约定：前 60% 为已回复（详情模式），后 40% 为待审核（审核模式）
      var replied = qaaRnd(sk + '_rep') < 0.6;
      var appealCnt = qaaInt(sk + '_cnt', 1, 8);
      // 申诉时间：近 30 天内
      var adOff = qaaInt(sk + '_ad', 0, 29);
      var ad = new Date(); ad.setDate(ad.getDate() - 1 - adOff);
      ad.setHours(qaaInt(sk + '_adh', 9, 18), qaaInt(sk + '_adm', 0, 59), qaaInt(sk + '_ads', 0, 59), 0);
      var rd = null;
      if (replied) {
        rd = new Date(ad.getTime() + (qaaInt(sk + '_rdh', 2, 48) * 3600 + qaaInt(sk + '_rdm', 0, 59)) * 1000);
      }
      rows.push({
        id: 20001 + i,
        taskCode: 'TASK' + (782100 + i * 7),
        recordId: 'QI' + (53100 + i * 3),
        qcSource: 2,
        seedKey: sk,
        seatName: seat.name,
        seatAccount: seat.account,
        custName: qaaCustNames[custIdx],
        hdClueId: 'HD' + (20430 + i * 11),
        seriesName: qaaSeriesNames[qaaPick(sk + '_ser', qaaSeriesNames.length)],
        appealCnt: appealCnt,
        appealText: qaaAppealTexts[qaaPick(sk + '_at', qaaAppealTexts.length)],
        replyText: replied ? qaaReplyTexts[qaaPick(sk + '_rt', qaaReplyTexts.length)] : '',
        appealDate: qaaFmtDateTime(ad),
        replyDate: rd ? qaaFmtDateTime(rd) : ''
      });
    }
    return rows;
  }

  // 伪随机取数组下标
  function qaaPick(seed, len) { return Math.floor(qaaRnd(seed) * len) % len; }

  // ==================== 页面状态 ====================
  var qaaState = {
    params: { seatIds: [], appealDate: null, replyDate: null },
    page: 1, pageSize: 10,
    sort: { key: '', dir: '' },
    allRows: []
  };

  // 过滤 + 排序 + 分页（对齐 getData 参数逻辑）
  function qaaQueryRows() {
    var p = qaaState.params;
    var rows = qaaState.allRows.filter(function (r) {
      if (p.seatIds.length && p.seatIds.indexOf(r.seatAccount) < 0) return false;
      if (p.appealDate) {
        var t = r.appealDate.slice(0, 10);
        if (t < p.appealDate[0] || t > p.appealDate[1]) return false;
      }
      if (p.replyDate) {
        if (!r.replyDate) return false;
        var t2 = r.replyDate.slice(0, 10);
        if (t2 < p.replyDate[0] || t2 > p.replyDate[1]) return false;
      }
      return true;
    });
    var s = qaaState.sort;
    if (s.key) {
      rows = rows.slice().sort(function (a, b) {
        var av = s.key === 'appealCnt' ? a.appealCnt : new Date(a[s.key]).getTime() || 0;
        var bv = s.key === 'appealCnt' ? b.appealCnt : new Date(b[s.key]).getTime() || 0;
        return s.dir === 'asc' ? av - bv : bv - av;
      });
    }
    return rows;
  }

  // ==================== 页面样式（对齐 ProTable 视觉） ====================
  function qaaEnsureStyles() {
    if (document.getElementById('qaaStyles')) return;
    var css = [
      '.qaa-main{padding:24px 20px;background-color:#f0f2f5;min-height:100%;}',
      '.qaa-card{background-color:#fff;border-radius:12px;}',
      /* 筛选区（ProTable 查询表单） */
      '.qaa-search{padding:16px 16px 0;}',
      '.qaa-search-form{display:flex;flex-wrap:wrap;gap:16px 24px;align-items:flex-start;}',
      '.qaa-form-item{display:flex;align-items:flex-start;}',
      '.qaa-form-label{flex:none;line-height:32px;font-size:14px;color:rgba(0,0,0,0.88);margin-right:8px;}',
      '.qaa-input{height:32px;padding:4px 11px;font-size:14px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;color:rgba(0,0,0,0.88);outline:none;transition:border-color .2s;box-sizing:border-box;}',
      '.qaa-input:focus{border-color:#2885ff;box-shadow:0 0 0 2px rgba(40,133,255,0.1);}',
      '.qaa-date-sep{line-height:32px;padding:0 4px;color:rgba(0,0,0,0.45);}',
      /* 坐席多选（antd Select multiple 对齐） */
      '.qaa-select-multiple{min-height:32px;min-width:220px;max-width:340px;padding:2px 4px;display:flex;flex-wrap:wrap;gap:2px;align-items:center;border:1px solid #d9d9d9;border-radius:6px;background:#fff;cursor:pointer;transition:border-color .2s;}',
      '.qaa-select-multiple:hover,.qaa-select-multiple.qaa-focused{border-color:#2885ff;}',
      '.qaa-select-multiple .qaa-placeholder{color:rgba(0,0,0,0.25);font-size:14px;padding:0 7px;line-height:28px;}',
      '.qaa-select-multiple .qaa-tag{display:inline-flex;align-items:center;max-width:100%;height:24px;padding:0 7px;font-size:12px;background:rgba(0,0,0,0.06);border-radius:4px;color:rgba(0,0,0,0.88);}',
      '.qaa-select-multiple .qaa-tag .qaa-tag-close{margin-left:4px;font-style:normal;color:rgba(0,0,0,0.45);cursor:pointer;}',
      '.qaa-select-multiple .qaa-tag .qaa-tag-close:hover{color:rgba(0,0,0,0.88);}',
      '.qaa-select-multiple .qaa-arrow{margin-left:auto;color:rgba(0,0,0,0.25);padding:0 7px;}',
      '.qaa-select-dropdown{position:fixed;z-index:11000;width:280px;background:#fff;border-radius:8px;box-shadow:0 6px 16px 0 rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:4px;max-height:280px;overflow:auto;font-size:14px;}',
      '.qaa-select-search{width:calc(100% - 4px);height:28px;margin:2px 0 6px;padding:0 7px;border:1px solid #d9d9d9;border-radius:4px;outline:none;font-size:14px;box-sizing:border-box;}',
      '.qaa-opt{display:flex;align-items:center;height:30px;padding:0 8px;cursor:pointer;border-radius:4px;}',
      '.qaa-opt:hover{background:rgba(0,0,0,0.03);}',
      '.qaa-opt .qaa-checkbox{width:16px;height:16px;border:1px solid #d9d9d9;border-radius:4px;margin-right:8px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:#fff;transition:all .2s;font-size:12px;color:#fff;}',
      '.qaa-opt .qaa-checkbox.qaa-checked{background:#1677ff;border-color:#1677ff;}',
      '.qaa-opt .qaa-opt-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.qaa-empty-opt{padding:12px 8px;color:rgba(0,0,0,0.25);text-align:center;font-size:14px;}',
      /* 按钮 */
      '.qaa-btn{display:inline-flex;align-items:center;justify-content:center;height:32px;padding:4px 15px;font-size:14px;border-radius:6px;border:1px solid #d9d9d9;background:#fff;color:rgba(0,0,0,0.88);cursor:pointer;transition:all .2s;white-space:nowrap;}',
      '.qaa-btn:hover{color:#2885ff;border-color:#2885ff;}',
      '.qaa-btn-primary{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.qaa-btn-primary:hover{background:#4096ff;border-color:#4096ff;color:#fff;}',
      '.qaa-search-actions{display:flex;gap:8px;margin-left:auto;padding-bottom:16px;}',
      /* 表格 */
      '.qaa-table-wrap{padding:0 16px 16px;}',
      '.qaa-grid-table{width:100%;border-collapse:collapse;font-size:14px;table-layout:auto;}',
      '.qaa-grid-table th{background:#fafafa;padding:12px 16px;text-align:left;font-weight:600;color:rgba(0,0,0,0.88);border-bottom:1px solid #f0f0f0;white-space:nowrap;position:relative;}',
      '.qaa-grid-table th .qaa-sorter{display:inline-flex;flex-direction:column;margin-left:4px;cursor:pointer;vertical-align:middle;}',
      '.qaa-grid-table th .qaa-sorter i{border-left:4px solid transparent;border-right:4px solid transparent;display:block;width:0;height:0;}',
      '.qaa-grid-table th .qaa-sorter i.up{border-bottom:5px solid #bfbfbf;margin-bottom:2px;}',
      '.qaa-grid-table th .qaa-sorter i.down{border-top:5px solid #bfbfbf;margin-top:2px;}',
      '.qaa-grid-table th.qaa-sort-on .qaa-sorter i.up{border-bottom-color:#1677ff;}',
      '.qaa-grid-table th.qaa-sort-on .qaa-sorter i.down{border-top-color:#1677ff;}',
      '.qaa-grid-table td{padding:12px 16px;border-bottom:1px solid #f0f0f0;color:rgba(0,0,0,0.88);white-space:nowrap;}',
      '.qaa-grid-table tbody tr:hover td{background:#fafafa;}',
      '.qaa-ellipsis{max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.qaa-link{color:#1677ff;cursor:pointer;background:none;border:none;padding:0;font-size:14px;margin-right:12px;}',
      '.qaa-link:hover{color:#4096ff;}',
      '.qaa-link:disabled{color:rgba(0,0,0,0.25);cursor:not-allowed;}',
      '.qaa-empty-row td{text-align:center;padding:32px 0;color:rgba(0,0,0,0.25);}',
      /* 分页 */
      '.qaa-pagination{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:16px 0 0;font-size:14px;color:rgba(0,0,0,0.88);}',
      '.qaa-pagination .qaa-page-btn{min-width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #d9d9d9;border-radius:6px;background:#fff;cursor:pointer;padding:0 8px;}',
      '.qaa-pagination .qaa-page-btn:hover{color:#2885ff;border-color:#2885ff;}',
      '.qaa-pagination .qaa-page-btn.qaa-page-active{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.qaa-pagination .qaa-page-btn:disabled{color:rgba(0,0,0,0.25);cursor:not-allowed;background:#fff;border-color:#d9d9d9;}',
      '.qaa-pagination select{height:32px;border:1px solid #d9d9d9;border-radius:6px;padding:0 8px;font-size:14px;background:#fff;}',
      '.qaa-total-text{margin-right:8px;color:rgba(0,0,0,0.65);}'
    ];
    var el = document.createElement('style');
    el.id = 'qaaStyles';
    el.textContent = css.join('\n');
    document.head.appendChild(el);
  }

  // ==================== 坐席多选下拉（对齐 antd Select multiple） ====================
  function qaaRenderSeatSelect(page) {
    var wrap = page.querySelector('#qaaSeatSelect');
    if (!wrap) return;
    var selected = qaaState.params.seatIds;
    var tags = selected.map(function (acc) {
      var s = qaaSeats.find(function (x) { return x.account === acc; });
      return '<span class="qaa-tag">' + qaaEsc(s ? s.name : acc) + '<i class="qaa-tag-close" data-acc="' + acc + '">✕</i></span>';
    }).join('');
    wrap.innerHTML = tags + (selected.length ? '' : '<span class="qaa-placeholder">请选择坐席</span>') +
      '<span class="qaa-arrow">▾</span>';

    wrap.querySelectorAll('.qaa-tag-close').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var acc = el.getAttribute('data-acc');
        qaaState.params.seatIds = qaaState.params.seatIds.filter(function (x) { return x !== acc; });
        qaaRenderSeatSelect(page);
      });
    });
  }

  function qaaOpenSeatDropdown(page, anchor) {
    var old = document.querySelector('.qaa-select-dropdown');
    if (old) { old.remove(); return; }
    var dd = document.createElement('div');
    dd.className = 'qaa-select-dropdown';
    var rect = anchor.getBoundingClientRect();
    dd.style.left = Math.min(rect.left, window.innerWidth - 296) + 'px';
    dd.style.top = (rect.bottom + 4) + 'px';
    var html = '<input class="qaa-select-search" id="qaaSeatSearch" placeholder="请输入坐席名称" />';
    qaaSeats.forEach(function (s) {
      html += '<div class="qaa-opt" data-acc="' + s.account + '" data-name="' + qaaEsc(s.name) + '">' +
        '<span class="qaa-checkbox' + (qaaState.params.seatIds.indexOf(s.account) >= 0 ? ' qaa-checked' : '') + '">✓</span>' +
        '<span class="qaa-opt-label">' + qaaEsc(s.name) + '（' + s.account + '）</span></div>';
    });
    dd.innerHTML = html;
    document.body.appendChild(dd);

    dd.querySelector('#qaaSeatSearch').addEventListener('input', function () {
      var kw = this.value.trim();
      dd.querySelectorAll('.qaa-opt').forEach(function (o) {
        o.style.display = (!kw || o.getAttribute('data-name').indexOf(kw) >= 0 || o.getAttribute('data-acc').indexOf(kw) >= 0) ? '' : 'none';
      });
    });
    dd.querySelectorAll('.qaa-opt').forEach(function (o) {
      o.addEventListener('click', function () {
        var acc = o.getAttribute('data-acc');
        var idx = qaaState.params.seatIds.indexOf(acc);
        if (idx >= 0) qaaState.params.seatIds.splice(idx, 1);
        else qaaState.params.seatIds.push(acc);
        var cb = o.querySelector('.qaa-checkbox');
        cb.classList.toggle('qaa-checked');
        qaaRenderSeatSelect(page);
        dd.querySelector('#qaaSeatSearch').focus();
      });
    });
    setTimeout(function () {
      document.addEventListener('click', function close(ev) {
        if (!ev.target.closest('.qaa-select-dropdown') && !ev.target.closest('#qaaSeatSelect')) {
          dd.remove();
          document.removeEventListener('click', close);
        }
      });
    }, 0);
  }

  // ==================== 表格渲染 ====================
  function qaaRenderTable(page) {
    var rows = qaaQueryRows();
    var total = rows.length;
    var totalPages = Math.max(1, Math.ceil(total / qaaState.pageSize));
    if (qaaState.page > totalPages) qaaState.page = totalPages;
    var start = (qaaState.page - 1) * qaaState.pageSize;
    var pageRows = rows.slice(start, start + qaaState.pageSize);

    function sortIcon(key) {
      var on = qaaState.sort.key === key;
      return '<span class="qaa-sorter' + (on ? ' qaa-sort-on' : '') + '" data-sort="' + key + '">' +
        '<i class="up' + (on && qaaState.sort.dir === 'asc' ? ' qaa-sort-on' : '') + '"></i>' +
        '<i class="down' + (on && qaaState.sort.dir === 'desc' ? ' qaa-sort-on' : '') + '"></i></span>';
    }

    var html = '<div class="qaa-table-wrap"><div class="qaa-table-scroll" style="overflow:auto"><table class="qaa-grid-table"><thead><tr>' +
      '<th>序号</th><th>坐席名称</th>' +
      '<th>申诉细项个数' + sortIcon('appealCnt') + '</th>' +
      '<th>申诉内容</th><th>回复内容</th>' +
      '<th>申诉时间' + sortIcon('appealDate') + '</th>' +
      '<th>回复时间' + sortIcon('replyDate') + '</th>' +
      '<th>操作</th></tr></thead><tbody>';
    if (!pageRows.length) {
      html += '<tr class="qaa-empty-row"><td colspan="8">暂无数据</td></tr>';
    } else {
      pageRows.forEach(function (r, i) {
        var replied = !!r.replyText;
        html += '<tr>' +
          '<td>' + (start + i + 1) + '</td>' +
          '<td>' + qaaEsc(r.seatName) + '</td>' +
          '<td>' + r.appealCnt + '</td>' +
          '<td><div class="qaa-ellipsis" title="' + qaaEsc(r.appealText) + '">' + qaaEsc(r.appealText) + '</div></td>' +
          '<td><div class="qaa-ellipsis" title="' + qaaEsc(r.replyText || '-') + '">' + (r.replyText ? qaaEsc(r.replyText) : '-') + '</div></td>' +
          '<td>' + qaaEsc(r.appealDate) + '</td>' +
          '<td>' + (r.replyDate ? qaaEsc(r.replyDate) : '-') + '</td>' +
          '<td><button class="qaa-link" data-act="review" data-id="' + r.id + '"' + (replied ? ' disabled title="该申诉已回复"' : '') + '>审核</button>' +
          '<button class="qaa-link" data-act="detail" data-id="' + r.id + '">详情</button></td>' +
          '</tr>';
      });
    }
    html += '</tbody></table></div>';

    // 分页
    html += '<div class="qaa-pagination prototype-pagination"><span class="qaa-total-text prototype-pagination-summary">共 ' + total + ' 条记录，当前第 ' + qaaState.page + ' / ' + totalPages + ' 页</span><div class="prototype-pagination-controls">' +
      '<select class="prototype-pagination-select" id="qaaPageSize" aria-label="每页显示条数">' +
      [5, 10, 20, 50].map(function (size) { return '<option value="' + size + '"' + (qaaState.pageSize === size ? ' selected' : '') + '>每页 ' + size + ' 条</option>'; }).join('') + '</select>' +
      '<button type="button" class="qaa-page-btn prototype-pagination-arrow" data-pg="prev" aria-label="上一页"' + (qaaState.page <= 1 ? ' disabled' : '') + '><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>' +
      '<select class="prototype-pagination-select" id="qaaPageSelect" aria-label="选择页码">' + Array.from({ length: totalPages }, function (_, index) { var p = index + 1; return '<option value="' + p + '"' + (p === qaaState.page ? ' selected' : '') + '>第 ' + p + ' 页</option>'; }).join('') + '</select>' +
      '<button type="button" class="qaa-page-btn prototype-pagination-arrow" data-pg="next" aria-label="下一页"' + (qaaState.page >= totalPages ? ' disabled' : '') + '><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button></div></div>';

    var tableWrap = page.querySelector('#qaaTableBody');
    tableWrap.innerHTML = html;

    // 排序
    tableWrap.querySelectorAll('[data-sort]').forEach(function (el) {
      el.parentElement.addEventListener('click', function () {
        var key = el.getAttribute('data-sort');
        if (qaaState.sort.key === key) {
          qaaState.sort.dir = qaaState.sort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          qaaState.sort = { key: key, dir: 'desc' };
        }
        qaaRenderTable(page);
      });
    });
    // 分页
    tableWrap.querySelectorAll('[data-pg]').forEach(function (el) {
      el.addEventListener('click', function () {
        var v = el.getAttribute('data-pg');
        var totalPages2 = Math.max(1, Math.ceil(qaaQueryRows().length / qaaState.pageSize));
        if (v === 'prev') qaaState.page = Math.max(1, qaaState.page - 1);
        else if (v === 'next') qaaState.page = Math.min(totalPages2, qaaState.page + 1);
        else qaaState.page = +v;
        qaaRenderTable(page);
      });
    });
    tableWrap.querySelector('#qaaPageSize').addEventListener('change', function () {
      qaaState.pageSize = +this.value;
      qaaState.page = 1;
      qaaRenderTable(page);
    });
    tableWrap.querySelector('#qaaPageSelect').addEventListener('change', function () {
      qaaState.page = Math.min(Math.max(1, +this.value || 1), Math.max(1, Math.ceil(qaaQueryRows().length / qaaState.pageSize)));
      qaaRenderTable(page);
    });
    // 操作
    tableWrap.querySelectorAll('[data-act]').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = +el.getAttribute('data-id');
        var row = qaaState.allRows.find(function (r) { return r.id === id; });
        if (!row) return;
        var act = el.getAttribute('data-act');
        if (act === 'review') {
          if (row.replyText) { qaaToast('该申诉已回复，不可再审核', 'warn'); return; }
          qaaOpenAuditDrawer(row, 'review');
        } else {
          qaaOpenAuditDrawer(row, 'query');
        }
      });
    });
  }

  // ==================== 页面主渲染 ====================
  function renderQualityAppealPage() {
    qaaEnsureStyles();
    var page = document.getElementById('qualityAppealPage');
    if (!page) return;
    if (!qaaState.allRows.length) qaaState.allRows = qaaBuildAppealRows();

    page.innerHTML =
      '<div class="qaa-main">' +
        '<div class="qaa-card">' +
          '<div class="qaa-search"><div class="qaa-search-form">' +
            '<div class="qaa-form-item"><span class="qaa-form-label">坐席</span><div class="qaa-select-multiple" id="qaaSeatSelect"></div></div>' +
            '<div class="qaa-form-item"><span class="qaa-form-label">申诉时间</span>' +
              '<input type="date" class="qaa-input" id="qaaAppealStart" />' +
              '<span class="qaa-date-sep">~</span>' +
              '<input type="date" class="qaa-input" id="qaaAppealEnd" /></div>' +
            '<div class="qaa-form-item"><span class="qaa-form-label">回复时间</span>' +
              '<input type="date" class="qaa-input" id="qaaReplyStart" />' +
              '<span class="qaa-date-sep">~</span>' +
              '<input type="date" class="qaa-input" id="qaaReplyEnd" /></div>' +
            '<div class="qaa-search-actions">' +
              '<button class="qaa-btn" id="qaaResetBtn">重 置</button>' +
              '<button class="qaa-btn qaa-btn-primary" id="qaaQueryBtn">查 询</button>' +
            '</div>' +
          '</div></div>' +
          '<div id="qaaTableBody"></div>' +
        '</div>' +
      '</div>';

    // 初始化筛选值
    var aStart = page.querySelector('#qaaAppealStart'), aEnd = page.querySelector('#qaaAppealEnd');
    var rStart = page.querySelector('#qaaReplyStart'), rEnd = page.querySelector('#qaaReplyEnd');
    if (qaaState.params.appealDate) { aStart.value = qaaState.params.appealDate[0]; aEnd.value = qaaState.params.appealDate[1]; }
    if (qaaState.params.replyDate) { rStart.value = qaaState.params.replyDate[0]; rEnd.value = qaaState.params.replyDate[1]; }

    qaaRenderSeatSelect(page);
    page.querySelector('#qaaSeatSelect').addEventListener('click', function () {
      qaaOpenSeatDropdown(page, this);
    });
    page.querySelector('#qaaQueryBtn').addEventListener('click', function () {
      qaaState.params.appealDate = aStart.value && aEnd.value ? [aStart.value, aEnd.value] : (aStart.value || aEnd.value ? [aStart.value || aEnd.value, aEnd.value || aStart.value] : null);
      qaaState.params.replyDate = rStart.value && rEnd.value ? [rStart.value, rEnd.value] : (rStart.value || rEnd.value ? [rStart.value || rEnd.value, rEnd.value || rStart.value] : null);
      qaaState.page = 1;
      qaaRenderTable(page);
    });
    page.querySelector('#qaaResetBtn').addEventListener('click', function () {
      qaaState.params = { seatIds: [], appealDate: null, replyDate: null };
      qaaState.sort = { key: '', dir: '' };
      qaaState.page = 1;
      aStart.value = aEnd.value = rStart.value = rEnd.value = '';
      qaaRenderSeatSelect(page);
      qaaRenderTable(page);
    });

    qaaRenderTable(page);
  }

  // ==================== 抽屉样式（Tabs/合规红线/申诉表单/Switch） ====================
  function qaaEnsureDrawerStyles() {
    if (document.getElementById('qaaDrawerStyles')) return;
    var css = [
      /* 抽屉顶部 Tabs（antd Tabs size=middle，marginBottom:10） */
      '.qaa-modal-tabs{display:flex;align-items:center;gap:32px;border-bottom:1px solid #f0f0f0;margin-bottom:10px;}',
      '.qaa-modal-tab{position:relative;padding:12px 0;font-size:14px;line-height:20px;color:rgba(0,0,0,0.88);cursor:pointer;background:none;border:none;font-family:inherit;}',
      '.qaa-modal-tab:hover{color:#1677ff;}',
      '.qaa-modal-tab.qaa-modal-tab-active{color:#1677ff;font-weight:600;}',
      '.qaa-modal-tab.qaa-modal-tab-active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:#1677ff;}',
      /* antd Switch（默认22px / small 16px） */
      '.qaa-switch{display:inline-flex;align-items:center;height:22px;min-width:44px;padding:0 4px;border-radius:11px;background:rgba(0,0,0,0.25);cursor:pointer;transition:all .2s;position:relative;color:#fff;font-size:12px;user-select:none;justify-content:flex-end;white-space:nowrap;}',
      '.qaa-switch.qaa-switch-on{background:#1677ff;justify-content:flex-start;}',
      '.qaa-switch .qaa-switch-handle{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:all .2s;}',
      '.qaa-switch.qaa-switch-on .qaa-switch-handle{left:calc(100% - 20px);}',
      '.qaa-switch.qaa-switch-disabled{cursor:not-allowed;opacity:.45;}',
      '.qaa-switch-sm{height:16px;min-width:40px;border-radius:8px;font-size:10px;padding:0 3px;}',
      '.qaa-switch-sm .qaa-switch-handle{width:12px;height:12px;}',
      '.qaa-switch-sm.qaa-switch-on .qaa-switch-handle{left:calc(100% - 14px);}',
      /* 合规红线（ComplianceRedLine，对齐 qro_shared.css） */
      '.qaa-cmp{background:#ffffff;border:1px solid #e6e6e6;border-radius:12px;overflow:hidden;}',
      '.qaa-cmp-head{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #e6e6e6;cursor:pointer;user-select:none;}',
      '.qaa-cmp-title{flex:1 1;color:#262626;font-size:18px;font-weight:700;line-height:24px;}',
      '.qaa-cmp-appeal{color:#1c69d4;font-size:14px;font-weight:700;line-height:22px;}',
      '.qaa-panel{border-bottom:1px solid #e6e6e6;}',
      '.qaa-panel:last-child{border-bottom:none;}',
      '.qaa-panel-header{display:flex;align-items:center;gap:8px;padding:16px 24px;cursor:pointer;user-select:none;}',
      '.qaa-panel-title{flex:1 1 auto;color:#262626;font-size:16px;font-weight:700;line-height:22px;}',
      '.qaa-panel-score{color:#dc2626;font-size:13px;font-weight:700;line-height:22px;margin-right:8px;}',
      '.qaa-panel-body{padding:16px 24px;background:#fafafa;}',
      '.qaa-panel-red .qaa-panel-header{background:#fff1f0;}',
      '.qaa-panel-red .qaa-panel-title{color:#dc2626;}',
      '.qaa-panel-red .qaa-panel-body{background:#fff1f0;}',
      '.qaa-icon-red{color:#dc2626;font-size:16px;flex:none;font-style:normal;}',
      '.qaa-icon-warn{color:#f59e0b;font-size:16px;flex:none;font-style:normal;}',
      '.qaa-arrow{color:#9a9a9a;font-size:12px;transition:transform .2s ease;transform:rotate(0deg);margin-left:12px;flex:none;display:inline-block;}',
      '.qaa-arrow-open{transform:rotate(90deg);}',
      '.qaa-red-item{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px dashed #ffccc7;}',
      '.qaa-red-item:last-child{border-bottom:none;padding-bottom:0;}',
      '.qaa-red-num{flex:0 0 16px;width:16px;height:16px;border-radius:9999px;background:#dc2626;color:#ffffff;font-size:10px;font-weight:700;line-height:16px;text-align:center;margin-top:3px;}',
      '.qaa-red-content{flex:1 1 auto;min-width:0;}',
      '.qaa-red-appeal{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding-top:2px;}',
      '.qaa-red-type{color:#262626;font-size:14px;font-weight:700;line-height:22px;}',
      '.qaa-red-evidence{margin-top:4px;color:#dc2626;font-size:14px;font-weight:400;line-height:22px;}',
      '.qaa-tag-danger{display:inline-block;background:#fff1f0;color:#dc2626;border:1px solid #ffccc7;font-weight:700;border-radius:4px;padding:0 7px;font-size:12px;line-height:20px;white-space:nowrap;}',
      '.qaa-text-danger{color:#dc2626;font-weight:400;}',
      '.qaa-text-success{color:#22c55e;font-weight:400;}',
      '.qaa-score-danger{color:#dc2626;font-weight:700;}',
      '.qaa-score-limit{color:#8c8c8c;font-size:13px;white-space:nowrap;}',
      '.qaa-appeal-cell{display:flex;align-items:center;gap:8px;}',
      '.qaa-status-pending{color:#fa8c16;font-size:13px;font-weight:500;white-space:nowrap;}',
      '.qaa-status-pass{color:#00ce86;font-size:13px;font-weight:500;white-space:nowrap;}',
      '.qaa-status-reject{color:#dc2626;font-size:13px;font-weight:500;white-space:nowrap;}',
      '.qaa-cmp-table{width:100%;border-collapse:collapse;font-size:14px;background:transparent;}',
      '.qaa-cmp-table th{background:transparent;color:#6b6b6b;font-weight:400;font-size:13px;letter-spacing:0;border-bottom:1px solid #e6e6e6;padding:10px 12px;text-align:left;white-space:nowrap;}',
      '.qaa-cmp-table td{background:transparent;color:#3c3c3c;border-bottom:1px solid #f0f0f0;padding:12px;line-height:22px;text-align:left;}',
      '.qaa-cmp-table tbody tr:last-child td{border-bottom:none;}',
      '.qaa-cmp-table tbody tr:hover td{background:#f7f7f7;}',
      /* 申诉表单（AppealFormNew，对齐 antd Form 水平布局） */
      '.qaa-af-form{padding:4px 0 0;}',
      '.qaa-af-row{display:flex;align-items:flex-start;margin-bottom:8px;}',
      '.qaa-af-label{flex:none;width:96px;text-align:right;padding-right:8px;font-size:14px;color:rgba(0,0,0,0.88);line-height:32px;}',
      '.qaa-af-label em{color:#ff4d4f;font-style:normal;margin-right:4px;}',
      '.qaa-af-control{flex:1;position:relative;}',
      '.qaa-af-textarea{width:100%;box-sizing:border-box;min-height:88px;padding:4px 11px;font-size:14px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;color:rgba(0,0,0,0.88);outline:none;resize:vertical;font-family:inherit;transition:border-color .2s;}',
      '.qaa-af-textarea:focus{border-color:#2885ff;box-shadow:0 0 0 2px rgba(40,133,255,0.1);}',
      '.qaa-af-count{font-size:12px;color:rgba(0,0,0,0.45);margin-top:4px;text-align:right;}',
      '.qaa-af-error{display:none;font-size:12px;color:#ff4d4f;line-height:20px;margin-top:2px;}',
      '.qaa-af-invalid .qaa-af-textarea{border-color:#ff4d4f;}',
      '.qaa-af-invalid .qaa-af-error{display:block;}',
      '.qaa-af-submit{display:flex;justify-content:center;margin:8px 0 10px;}',
      /* query 模式（Descriptions 逐行展示） */
      '.qaa-af-view{margin:20px 0;}',
      '.qaa-af-view-item{display:flex;padding:8px 0;border-bottom:1px solid #f1f1f1;font-size:14px;line-height:22px;}',
      '.qaa-af-view-item:last-child{border-bottom:none;}',
      '.qaa-af-view-label{width:120px;flex:none;color:rgba(0,0,0,0.45);}',
      '.qaa-af-view-content{flex:1;color:rgba(0,0,0,0.88);word-break:break-all;}'
    ];
    var el = document.createElement('style');
    el.id = 'qaaDrawerStyles';
    el.textContent = css.join('\n');
    document.head.appendChild(el);
  }

  // ==================== Switch HTML（对齐 antd Switch） ====================
  function qaaSwitchHtml(small, on, text, attrs, disabled) {
    return '<span class="qaa-switch' + (small ? ' qaa-switch-sm' : '') + (on ? ' qaa-switch-on' : '') +
      (disabled ? ' qaa-switch-disabled' : '') + '"' + (attrs || '') + '><span class="qaa-switch-handle"></span>' + text + '</span>';
  }

  // ==================== 合规红线演示数据（detailType 2/3/4/5） ====================
  var qaaRedLineTypes = ['辱骂或贬低客户', '向客户承诺不确定权益', '泄露其他客户信息', '诱导客户提供虚假信息'];
  var qaaRedEvidences = ['这个价格我私下再给您申请额外的礼品', '您放心，别人拿不到这个折扣', '上一个客户也是这种情况我都给办了', '您先随便填个信息，其他我来处理'];
  var qaaForbiddenCats = ['绝对化用语', '贬低竞品用语', '夸大宣传', '违规承诺收益'];
  var qaaForbiddenWords = ['全网最低', '没有之一', '绝对超值', '百分之百省钱', '肯定没问题', '秒杀同级'];
  var qaaForbiddenCtx = ['咱们这个价格是全网最低的，您现在不订就亏了', '这个配置同级别没有之一，遥遥领先', '现在下订绝对超值，闭眼买就行', '跟着我买这台车百分之百省钱', '您走我的渠道肯定没问题，包在我身上'];
  var qaaProductModels = ['N7', 'ARION', '天籁', '探陆', '轩逸'];
  var qaaProductItems = ['续航里程', '快充时间', '整车质保', '置换补贴', '电机功率'];
  var qaaProductCorrects = ['CLTC 635km', '30分钟30%-80%', '整车6年/15万公里', '至高15000元', '200kW'];
  var qaaProductAnswers = ['CLTC 700km', '20分钟充满', '终身质保', '至高30000元', '350kW'];
  var qaaDispatchItems = ['权益告知确认', '风险提示告知', '客户信息核实'];

  function qaaCmpStatus(seed, mode) {
    var r = qaaRnd(seed);
    if (mode === 'review') return r < 0.7 ? 1 : 0;
    return r < 0.3 ? 1 : (r < 0.7 ? 2 : 3);
  }

  function qaaBuildCompliance(seedKey, mode) {
    var d = { redLines: [], forbiddenWords: [], productKnowledge: [], violationDispatch: [], appealCount: 0, appealedCount: 0 };
    var i, s;
    var redN = qaaInt(seedKey + '_rn', 0, 2);
    for (i = 0; i < redN; i++) {
      s = seedKey + '_r' + i;
      var st = qaaCmpStatus(s + '_st', mode);
      d.redLines.push({
        detailId: 'RL' + (9100 + i), id: i + 1,
        type: qaaRedLineTypes[qaaPick(s + '_t', qaaRedLineTypes.length)],
        evidence: qaaRedEvidences[qaaPick(s + '_e', qaaRedEvidences.length)],
        appealStatus: st, canAppeal: st === 0 || st === 3
      });
    }
    var fbN = qaaInt(seedKey + '_fn', 0, 3);
    for (i = 0; i < fbN; i++) {
      s = seedKey + '_f' + i;
      var wIdx = qaaPick(s + '_w', qaaForbiddenWords.length);
      st = qaaCmpStatus(s + '_st', mode);
      d.forbiddenWords.push({
        detailId: 'FW' + (9200 + i),
        category: qaaForbiddenCats[qaaPick(s + '_c', qaaForbiddenCats.length)],
        keyword: qaaForbiddenWords[wIdx],
        time: ('0' + qaaInt(s + '_h', 0, 2)).slice(-2) + ':' + ('0' + qaaInt(s + '_m', 10, 58)).slice(-2),
        context: qaaForbiddenCtx[wIdx],
        score: qaaInt(s + '_sc', 1, 5),
        deductLimit: qaaInt(s + '_dl', 10, 20),
        appealStatus: st, canAppeal: st === 0 || st === 3
      });
    }
    var pkN = qaaInt(seedKey + '_pn', 0, 2);
    for (i = 0; i < pkN; i++) {
      s = seedKey + '_p' + i;
      var itIdx = qaaPick(s + '_it', qaaProductItems.length);
      st = qaaCmpStatus(s + '_st', mode);
      d.productKnowledge.push({
        detailId: 'PK' + (9300 + i),
        model: qaaProductModels[qaaPick(s + '_m', qaaProductModels.length)],
        item: qaaProductItems[itIdx],
        correct: qaaProductCorrects[itIdx],
        answer: qaaProductAnswers[itIdx],
        score: qaaInt(s + '_sc', 1, 3),
        appealStatus: st, canAppeal: st === 0 || st === 3
      });
    }
    var dpN = qaaInt(seedKey + '_dn', 0, 2);
    for (i = 0; i < dpN; i++) {
      s = seedKey + '_d' + i;
      st = qaaCmpStatus(s + '_st', mode);
      d.violationDispatch.push({
        detailId: 'VD' + (9400 + i),
        item: qaaDispatchItems[qaaPick(s + '_i', qaaDispatchItems.length)],
        content: '通话中需完成该下发项的标准告知',
        unsatisfied: '坐席未按标准话术完成该项告知',
        result: '未通过',
        appealStatus: st, canAppeal: st === 0 || st === 3
      });
    }
    // 审核模式保证至少一条申诉中（让通过开关可见）
    if (mode === 'review') {
      var all = d.redLines.concat(d.forbiddenWords, d.productKnowledge, d.violationDispatch);
      if (all.length && !all.some(function (x) { return x.appealStatus === 1; })) {
        all[qaaInt(seedKey + '_force', 0, all.length - 1)].appealStatus = 1;
      }
    }
    d.appealedCount = 0; d.appealCount = 0;
    all2(d);
    function all2(dd) {
      [].concat(dd.redLines, dd.forbiddenWords, dd.productKnowledge, dd.violationDispatch).forEach(function (x) {
        if (x.appealStatus >= 1) dd.appealedCount++;
        if ((x.appealStatus === 0 || x.appealStatus === 3) && x.canAppeal) dd.appealCount++;
      });
    }
    return d;
  }

  // ==================== 申诉视角的质检得分数据（review/query 模式） ====================
  // 基于 31 的 qrnBuildScoreAnalyse 结果做申诉态后处理：
  // review：前 appealCnt 个可申诉细项置为申诉中（isAppeal=true, isPass=null）
  // query ：混合申诉中/审核通过/审核不通过，并重算各级计数
  function qaaBuildAppealScore(row, mode) {
    var S = window.qrnAppealShared;
    var sd = JSON.parse(JSON.stringify(S.buildScoreAnalyse(row.seedKey)));
    var targets = [];
    sd.forEach(function (f) {
      f.secondSorts.forEach(function (sec) {
        sec.thirdSorts.forEach(function (t) {
          if (t.deductScore > 0) targets.push(t);
          t.isAppeal = false; t.isPass = t.deductScore === 0 ? true : null;
          t.lastIsPass = null; t.isAppealFront = false; t.isPassFront = false;
        });
      });
    });
    var n = Math.min(row.appealCnt || 1, targets.length);
    for (var i = 0; i < n; i++) {
      var t = targets[i];
      t.isAppeal = true; t.isPass = null; t.lastIsPass = null;
      if (mode === 'query') {
        var st = qaaInt(row.seedKey + '_qs' + i, 0, 9);
        if (st >= 4) {
          t.isAppeal = false;
          if (st < 8) { t.isPass = true; t.lastIsPass = true; }
          else { t.isPass = false; t.lastIsPass = false; }
        }
      }
    }
    sd.forEach(function (f) {
      var can = 0, inA = 0, ap = 0;
      f.secondSorts.forEach(function (sec) {
        var c2 = 0, i2 = 0, a2 = 0;
        sec.thirdSorts.forEach(function (t) {
          if (t.canAppeal && !t.isAppeal && t.lastIsPass == null) c2++;
          if (t.isAppeal) i2++;
          if (t.isAppeal || t.lastIsPass != null) a2++;
        });
        sec.canAppealCount = c2; sec.inAppealCount = i2; sec.appealCount = a2;
        can += c2; inA += i2; ap += a2;
      });
      f.canAppealCount = can; f.inAppealCount = inA; f.appealCount = ap;
    });
    return sd;
  }

  // ==================== 基础信息行（对话标签 Tab 左栏，对齐 BaseInfoComponent 字段） ====================
  function qaaBuildBaseRow(row) {
    var sk = row.seedKey + '_base';
    var clueSources = ['直播线索', '官网表单', '活动留资', '企微咨询', '电话咨询'];
    var clueTypes = ['首次咨询', '再次咨询', '试驾预约', '订单线索'];
    var tel = '138' + String(qaaInt(sk + '_tel', 1000, 9999));
    var ft = qaaInt(sk + '_ft', 1, 6);
    var ad = new Date(row.appealDate.replace(/-/g, '/'));
    var firstD = new Date(ad.getTime() - qaaInt(sk + '_fd', 3, 20) * 86400000);
    var lastD = new Date(ad.getTime() - qaaInt(sk + '_ld', 0, 2) * 86400000);
    return {
      hdClueId: row.hdClueId, custName: row.custName, custTel: tel,
      clueType: clueTypes[qaaPick(sk + '_ct', clueTypes.length)],
      clueSource: clueSources[qaaPick(sk + '_cs', clueSources.length)],
      rchannelName: 'R' + qaaInt(sk + '_rc', 100, 999),
      seriesName: row.seriesName, seatName: row.seatName,
      followTimes: ft,
      callDuration: qaaInt(sk + '_cdm', 1, 12) + '分' + qaaInt(sk + '_cds', 0, 59) + '秒',
      firstReviewTime: qaaFmtDateTime(firstD),
      lastReviewTime: qaaFmtDateTime(lastD)
    };
  }

  // ==================== 回访记录（review/query 徽标用 inAppealCount） ====================
  function qaaBuildRecords(row, mode) {
    var S = window.qrnAppealShared;
    var recs = JSON.parse(JSON.stringify(S.buildReviewRecords(row.seedKey, row)));
    if (mode === 'review' && recs.length && recs[0].calls.length) {
      var c0 = recs[0].calls[0];
      c0.inAppealCount = Math.max(1, c0.inAppealCount || 0);
    }
    recs.forEach(function (r) {
      r.inAppealCount = r.calls.reduce(function (a, c) { return a + (c.inAppealCount || 0); }, 0);
      r.canAppealCount = r.calls.reduce(function (a, c) { return a + (c.canAppealCount || 0); }, 0);
    });
    return recs;
  }

  // ==================== VideoComponent HTML（申诉模式徽标） ====================
  function qaaVideoHtml(ctx) {
    var html = '<div class="qrn-vc-wrap">';
    html += '<div class="qrn-vc-top"><div class="qrn-first-tabs-inner">';
    ctx.records.forEach(function (rec, i) {
      var badge = rec.inAppealCount > 0 ? '<div class="qrn-first-tabs-badge">' + rec.inAppealCount + '</div>' : '';
      html += '<div class="qrn-first-tabs-item' + (ctx.firstTab === i ? ' qrn-first-active' : '') + '" data-ft="' + i + '">' +
        '<div style="padding-right:4px">回访记录' + (i + 1) + '</div>' + badge + '</div>';
    });
    var allBadge = ctx.records.reduce(function (a, r) { return a + r.inAppealCount; }, 0);
    html += '<div class="qrn-first-tabs-item' + (ctx.firstTab === -1 ? ' qrn-first-active' : '') + '" data-ft="-1">' +
      '<div style="padding-right:4px">全部回访</div>' + (allBadge > 0 ? '<div class="qrn-first-tabs-badge">' + allBadge + '</div>' : '') + '</div>';
    html += '</div><div class="qrn-second-tabs-wrap"><div class="qrn-second-tabs-inner">';
    ctx.curCalls.forEach(function (call, j) {
      var badge = call.inAppealCount > 0 ? '<div class="qrn-second-tabs-badge">' + call.inAppealCount + '</div>' : '';
      html += '<div class="qrn-second-tabs-item' + (ctx.secondTab === j ? ' qrn-second-active' : '') + '" data-st="' + j + '">' +
        '<div style="padding-right:4px">通话记录' + (j + 1) + '</div>' + badge + '</div>';
    });
    html += '</div></div></div>';
    html += '<div class="qrn-vc-bottom"><audio controls style="outline:none;flex:1"></audio>' +
      '<a class="qrn-link" style="margin-left:12px" data-audio="1">点击播放录音</a></div>';
    html += '</div>';
    return html;
  }

  // ==================== 客服规范表格（TableComponentNew 申诉模式） ====================
  function qaaTableStatus(t) {
    if (t.isAppeal && !t.isAppealFront) return { text: '申诉中', color: t.isPass === true ? '#00CE86' : '#D92D21' };
    if (!t.isAppeal && t.lastIsPass === false && !t.isPassFront) return { text: '审核不通过', color: t.isPass === true ? '#00CE86' : '#D92D21' };
    if (!t.isAppeal && t.lastIsPass === true && !t.isPassFront) return { text: '审核通过', color: t.isPass === true ? '#00CE86' : '#D92D21' };
    return null;
  }

  function qaaTableHtml(ctx) {
    var sd = ctx.scoreAnalyse;
    var totalAppeal = sd.reduce(function (a, f) { return a + f.appealCount; }, 0);
    var totalIn = sd.reduce(function (a, f) { return a + f.inAppealCount; }, 0);
    var useIn = totalIn > 0;
    var cur = sd[ctx.tFirstTab] || sd[0];
    var html = '<div class="qrn-card"><div class="qrn-card-head"><span class="qrn-card-title"> 客服规范</span>' +
      '<span class="qrn-card-extra"><div class="qrn-vc-appeal-count" style="margin-bottom:0">已申诉细项：<span style="font-weight:bold;margin-right:12px">' + totalAppeal + '个</span></div></span></div>';
    html += '<div class="qrn-card-body">';
    html += '<div class="qrn-cardtabs">';
    sd.forEach(function (f, i) {
      var cnt = useIn ? f.inAppealCount : f.appealCount;
      html += '<div class="qrn-cardtabs-item' + (i === ctx.tFirstTab ? ' qrn-cardtabs-active' : '') + '" data-tf="' + i + '">' +
        qaaEsc(f.firstSortName) + (cnt > 0 ? '<span class="qrn-cardtabs-badge">' + cnt + '</span>' : '') + '</div>';
    });
    html += '</div>';
    html += '<div class="qrn-second-tabs-wrap"><div class="qrn-second-tabs-inner">';
    if (cur) {
      cur.secondSorts.forEach(function (sec, j) {
        var cnt = useIn ? sec.inAppealCount : sec.appealCount;
        html += '<div class="qrn-second-tabs-item' + (j === ctx.tSecondTab ? ' qrn-second-active' : '') + '" data-ts="' + j + '">' +
          '<div style="padding-right:4px">' + qaaEsc(sec.secondSortName) + '</div>' +
          (cnt > 0 ? '<div class="qrn-second-tabs-badge">' + cnt + '</div>' : '') + '</div>';
      });
    }
    html += '</div></div>';
    var rows = cur && cur.secondSorts[ctx.tSecondTab] ? cur.secondSorts[ctx.tSecondTab].thirdSorts : [];
    if (rows.length) {
      html += '<table class="qrn-custom-table"><tbody>';
      rows.forEach(function (t) {
        var st = qaaTableStatus(t);
        var statusText = st ? '<span style="color:' + st.color + '">' + st.text + '</span>' : '';
        var sw = '';
        if (ctx.mode === 'review' && t.isAppeal) {
          sw = qaaSwitchHtml(false, t.isPass !== false, '通过', ' data-rsw="1" data-t="' + t.thirdSortCode + '"');
        }
        html += '<tr class="qrn-ct-row' + (t.canAppeal ? ' qrn-ct-row-error' : '') + '">' +
          '<td class="qrn-ct-col">' + qaaEsc(t.thirdSortName) + '</td>' +
          '<td class="qrn-ct-col" style="width:370px">' + qaaEsc(t.thirdSortDesc) + '</td>' +
          '<td class="qrn-ct-col"><div class="qrn-ct-status">' + statusText +
          (t.triggerShowFlag ? '<span class="qrn-label-trigger">触发</span>' : '<span class="qrn-label-no-trigger">未触发</span>') +
          sw + '</div></td></tr>';
      });
      html += '</tbody></table>';
    } else {
      html += '<div class="qrn-empty">此类目下无申诉项</div>';
    }
    html += '</div></div>';
    return html;
  }

  // ==================== 合规红线（ComplianceRedLine） ====================
  function qaaAppealCellHtml(item, ctx) {
    if (item.appealStatus === 1) {
      if (ctx.mode === 'review') {
        var on = ctx.cmpReviews[item.detailId] !== false;
        return '<div class="qaa-appeal-cell"><span class="qaa-status-pending">申诉中</span>' +
          qaaSwitchHtml(true, on, on ? '通过' : '不通过', ' data-csw="' + item.detailId + '"') + '</div>';
      }
      return '<div class="qaa-appeal-cell"><span class="qaa-status-pending">申诉中</span></div>';
    }
    if (item.appealStatus === 2) return '<span class="qaa-status-pass">申诉通过</span>';
    if (item.appealStatus === 3) {
      return '<span class="qaa-status-reject">申诉驳回</span>' +
        qaaSwitchHtml(true, false, '申诉', '', true);
    }
    return '<div class="qaa-appeal-cell">' + qaaSwitchHtml(true, false, '申诉', '', true) + '</div>';
  }

  function qaaCmpTableHtml(cols, rows, ctx) {
    if (!rows.length) return '';
    var html = '<table class="qaa-cmp-table"><thead><tr>';
    cols.forEach(function (c) { html += '<th>' + c[0] + '</th>'; });
    html += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr>';
      cols.forEach(function (c) {
        var v = r[c[1]];
        var cell;
        if (c[2] === 'tag') cell = '<span class="qaa-tag-danger">' + qaaEsc(v) + '</span>';
        else if (c[2] === 'danger') cell = '<span class="qaa-text-danger">' + qaaEsc(v) + '</span>';
        else if (c[2] === 'success') cell = '<span class="qaa-text-success">' + qaaEsc(v) + '</span>';
        else if (c[2] === 'score') cell = '<span class="qaa-score-danger">' + qaaEsc(v) + '</span>';
        else if (c[2] === 'limit') cell = '<span class="qaa-score-limit">' + (v != null ? '此类最多扣分 ' + v + '分' : '-') + '</span>';
        else if (c[2] === 'appeal') cell = qaaAppealCellHtml(r, ctx);
        else cell = qaaEsc(v);
        html += '<td>' + cell + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  function qaaPanelHtml(key, red, icon, title, scoreHtml, bodyHtml, collapsed) {
    return '<div class="qaa-panel' + (red ? ' qaa-panel-red' : '') + '">' +
      '<div class="qaa-panel-header" data-cpan="' + key + '">' +
      '<i class="' + (red ? 'qaa-icon-red' : 'qaa-icon-warn') + '">' + icon + '</i>' +
      '<span class="qaa-panel-title">' + title + '</span>' + scoreHtml +
      '<span class="qaa-arrow' + (collapsed ? '' : ' qaa-arrow-open') + '">›</span></div>' +
      (collapsed ? '' : '<div class="qaa-panel-body">' + bodyHtml + '</div>') + '</div>';
  }

  function qaaComplianceHtml(ctx) {
    var d = ctx.compliance;
    var col = ctx.cmpCollapsed;
    var html = '<div class="qaa-cmp">';
    html += '<div class="qaa-cmp-head" data-csec="1"><span class="qaa-cmp-title">合规及红线</span>' +
      '<span class="qaa-cmp-appeal">已申诉项: ' + d.appealedCount + '</span>' +
      '<span class="qaa-arrow' + (col.section ? '' : ' qaa-arrow-open') + '">›</span></div>';
    if (!col.section) {
      var redBody = '';
      d.redLines.forEach(function (item) {
        redBody += '<div class="qaa-red-item">' +
          '<span class="qaa-red-num">' + item.id + '</span>' +
          '<div class="qaa-red-content"><div class="qaa-red-type">' + qaaEsc(item.type) + '</div>' +
          '<div class="qaa-red-evidence">「' + qaaEsc(item.evidence) + '」</div></div>' +
          '<div class="qaa-red-appeal">' + qaaAppealCellHtml(item, ctx) + '</div></div>';
      });
      html += qaaPanelHtml('redLine', true, '!', '触发红线总分为0 (' + d.redLines.length + '项)', '', redBody, col.redLine);
      var fbScore = d.forbiddenWords.reduce(function (a, o) { return a + o.score; }, 0);
      html += qaaPanelHtml('forbidden', false, '!', '外呼服务禁语检测',
        d.forbiddenWords.length > 0 ? '<span class="qaa-panel-score">扣分&nbsp;' + fbScore + '</span>' : '',
        qaaCmpTableHtml([['禁语类别', 'category', 'tag'], ['命中关键词', 'keyword', 'danger'], ['出现时间', 'time'], ['上下文', 'context'], ['扣分', 'score', 'score'], ['扣分上限', 'deductLimit', 'limit'], ['申诉', '', 'appeal']], d.forbiddenWords, ctx),
        col.forbidden);
      var pkScore = d.productKnowledge.reduce(function (a, o) { return a + o.score; }, 0);
      html += qaaPanelHtml('product', false, '!', '产品知识检测',
        d.productKnowledge.length > 0 ? '<span class="qaa-panel-score">扣分&nbsp;' + pkScore + '</span>' : '',
        qaaCmpTableHtml([['车型', 'model', 'tag'], ['检测知识项', 'item', 'danger'], ['正确答案', 'correct', 'success'], ['坐席答案', 'answer', 'danger'], ['扣分', 'score', 'score'], ['申诉', '', 'appeal']], d.productKnowledge, ctx),
        col.product);
      html += qaaPanelHtml('dispatch', false, '!', '违规下发检测',
        d.violationDispatch.length > 0 ? '<span class="qaa-panel-score">总分清零 · 可申诉</span>' : '',
        qaaCmpTableHtml([['下发项', 'item', 'tag'], ['检测内容', 'content'], ['未满足下发内容', 'unsatisfied', 'danger'], ['判定', 'result', 'score'], ['申诉', '', 'appeal']], d.violationDispatch, ctx),
        col.dispatch);
    }
    html += '</div>';
    return html;
  }

  // ==================== 申诉表单（AppealFormNew 对齐） ====================
  // review：Form「回复内容」TextArea(rows4/maxLength500/showCount/required) + 居中「提 交」
  // query ：Descriptions 逐行（申诉内容/提交时间/回复内容/提交时间——生产源码两处时间标签均为“提交时间”）
  function qaaAppealFormHtml(ctx) {
    if (ctx.mode === 'review') {
      return '<div class="qaa-af-form">' +
        '<div class="qaa-af-row" id="qaaAfRow">' +
          '<div class="qaa-af-label"><em>*</em>回复内容</div>' +
          '<div class="qaa-af-control">' +
            '<textarea class="qaa-af-textarea" id="qaaAfText" maxlength="500"></textarea>' +
            '<div class="qaa-af-count"><span id="qaaAfCount">0</span>&nbsp;/&nbsp;500</div>' +
            '<div class="qaa-af-error">请填写申诉内容</div>' +
          '</div>' +
        '</div>' +
        '<div class="qaa-af-submit"><button type="button" class="qaa-btn qaa-btn-primary" id="qaaAfSubmit">提 交</button></div>' +
      '</div>';
    }
    var r = ctx.row;
    function item(label, val) {
      return '<div class="qaa-af-view-item"><div class="qaa-af-view-label">' + label + '</div>' +
        '<div class="qaa-af-view-content">' + qaaEsc(val || '-') + '</div></div>';
    }
    return '<div class="qaa-af-view">' +
      item('申诉内容', r.appealText) +
      item('提交时间', r.appealDate) +
      item('回复内容', r.replyText) +
      item('提交时间', r.replyDate) +
    '</div>';
  }

  // 抽屉内 qrn-card 容器基础样式（仅作用于申诉抽屉，不影响已验证的质检看板）
  // 对齐生产 main___aTPau .ant-card-bordered / .ant-card-head 样式
  function qaaEnsureAuditCardStyles() {
    if (document.getElementById('qaaAuditCardStyles')) return;
    var css = [
      '.qaa-audit .qrn-card{background:#fff;border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px 0 rgba(0,0,0,0.05);}',
      '.qaa-audit .qrn-card .qrn-card-head{background:rgba(0,0,0,0.02);}',
      '.qaa-audit .qrn-card-body{padding:16px;}'
    ];
    var el = document.createElement('style');
    el.id = 'qaaAuditCardStyles';
    el.textContent = css.join('\n');
    document.head.appendChild(el);
  }

  // ==================== 审核抽屉（QualityCheckDetailModal 对齐） ====================
  var qaaAuditCtx = null;

  // 员工质检 Tab（AiAnalysis index.jsx）：视频→得分公式→雷达→会话记录→合规红线→客服规范→申诉表单
  function qaaStaffPanelHtml(ctx) {
    var S = window.qrnAppealShared;
    var html = '<div class="qaa-video-slot">' + qaaVideoHtml(ctx) + '</div>';
    html += S.aiFormulaHtml(ctx.formula);
    html += S.aiRadarHtml(ctx);
    html += '<div style="height:20px"></div>';
    html += '<div class="qrn-ai-top"><div class="qrn-ai-right">' +
      S.aiChatHtml(ctx.sentences, '当前通话会话记录', true) + '</div></div>';
    html += '<div style="height:20px"></div>';
    html += '<div id="qaaCmpSlot">' + qaaComplianceHtml(ctx) + '</div>';
    html += '<div style="height:20px"></div>';
    html += '<div id="qaaTableSlot">' + qaaTableHtml(ctx) + '</div>';
    html += '<div style="height:20px"></div>';
    html += qaaAppealFormHtml(ctx);
    return html;
  }

  // 对话标签 Tab（AiAnalysis index1.jsx）：视频→会话记录（右）+ 基础信息（左）
  function qaaChatPanelHtml(ctx) {
    var S = window.qrnAppealShared;
    var html = '<div class="qaa-video-slot">' + qaaVideoHtml(ctx) + '</div>';
    html += '<div style="height:20px"></div>';
    html += '<div class="qrn-ai-top">' +
      '<div class="qrn-ai-right">' + S.aiChatHtml(ctx.sentences, '会话记录', true) + '</div>' +
      '<div style="flex:20px 0 0"></div>' +
      '<div class="qrn-ai-left">' + S.baseInfoHtml(ctx.baseRow) + '</div>' +
    '</div>';
    return html;
  }

  function qaaRenderAuditBody(drawer) {
    var ctx = qaaAuditCtx;
    var body = drawer.querySelector('#qaaAuditBody');
    var html = '<div class="qaa-modal-tabs">' +
      '<button type="button" class="qaa-modal-tab' + (ctx.drawerTab === 'staff' ? ' qaa-modal-tab-active' : '') + '" data-dt="staff">员工质检</button>' +
      '<button type="button" class="qaa-modal-tab' + (ctx.drawerTab === 'chat' ? ' qaa-modal-tab-active' : '') + '" data-dt="chat">对话标签</button>' +
    '</div>';
    html += '<div id="qaaTabStaff" style="display:' + (ctx.drawerTab === 'staff' ? 'block' : 'none') + '">' + qaaStaffPanelHtml(ctx) + '</div>';
    html += '<div id="qaaTabChat" style="display:' + (ctx.drawerTab === 'chat' ? 'block' : 'none') + '">' + qaaChatPanelHtml(ctx) + '</div>';
    body.innerHTML = html;
    qaaDrawAuditRadar(body);
  }

  function qaaDrawAuditRadar(body) {
    var ctx = qaaAuditCtx;
    var S = window.qrnAppealShared;
    var chartBox = body.querySelector('#qrnAiRadarChart');
    if (!chartBox) return;
    var canvas = document.createElement('canvas');
    chartBox.appendChild(canvas);
    var indicators = ctx.scoreAnalyse.map(function (f) {
      return { title: f.firstSortName, sub: f.score + '分' };
    });
    var values = ctx.scoreAnalyse.map(function (f) { return f.score; });
    S.drawRadar(canvas, indicators, values, { height: 460 });
  }

  function qaaRefreshVideoSlots(body) {
    var ctx = qaaAuditCtx;
    body.querySelectorAll('.qaa-video-slot').forEach(function (slot) {
      slot.innerHTML = qaaVideoHtml(ctx);
    });
  }

  function qaaFindThird(ctx, code) {
    var found = null;
    ctx.scoreAnalyse.forEach(function (f) {
      f.secondSorts.forEach(function (sec) {
        sec.thirdSorts.forEach(function (t) {
          if (t.thirdSortCode === code) found = t;
        });
      });
    });
    return found;
  }

  // 事件绑定：全部走事件委托（部分区域重渲染后无需重复绑定）
  function qaaBindAuditEvents(drawer) {
    var ctx = qaaAuditCtx;
    var body = drawer.querySelector('#qaaAuditBody');

    body.addEventListener('click', function (e) {
      var el;
      // 顶部双 Tab：仅切换显示，保留两 Tab 状态与表单输入
      if ((el = e.target.closest('[data-dt]'))) {
        ctx.drawerTab = el.getAttribute('data-dt');
        body.querySelectorAll('.qaa-modal-tab').forEach(function (t) {
          t.classList.toggle('qaa-modal-tab-active', t.getAttribute('data-dt') === ctx.drawerTab);
        });
        body.querySelector('#qaaTabStaff').style.display = ctx.drawerTab === 'staff' ? 'block' : 'none';
        body.querySelector('#qaaTabChat').style.display = ctx.drawerTab === 'chat' ? 'block' : 'none';
        return;
      }
      if ((el = e.target.closest('[data-audio]'))) {
        qaaToast('演示环境无真实录音文件');
        return;
      }
      if ((el = e.target.closest('.qrn-export-button'))) {
        qaaToast('录音文本导出任务已提交（演示）');
        return;
      }
      // 视频组件 一级/二级 tab（两 Tab 内同步）
      if ((el = e.target.closest('[data-ft]'))) {
        ctx.firstTab = +el.getAttribute('data-ft');
        ctx.secondTab = 0;
        ctx.curCalls = ctx.firstTab === -1
          ? ctx.records.reduce(function (a, r) { return a.concat(r.calls); }, [])
          : ctx.records[ctx.firstTab].calls;
        qaaRefreshVideoSlots(body);
        return;
      }
      if ((el = e.target.closest('[data-st]'))) {
        ctx.secondTab = +el.getAttribute('data-st');
        qaaRefreshVideoSlots(body);
        return;
      }
      // 客服规范 一级/二级 tab
      if ((el = e.target.closest('[data-tf]'))) {
        ctx.tFirstTab = +el.getAttribute('data-tf');
        ctx.tSecondTab = 0;
        body.querySelector('#qaaTableSlot').innerHTML = qaaTableHtml(ctx);
        return;
      }
      if ((el = e.target.closest('[data-ts]'))) {
        ctx.tSecondTab = +el.getAttribute('data-ts');
        body.querySelector('#qaaTableSlot').innerHTML = qaaTableHtml(ctx);
        return;
      }
      // 合规红线 折叠
      if ((el = e.target.closest('[data-csec]'))) {
        ctx.cmpCollapsed.section = !ctx.cmpCollapsed.section;
        body.querySelector('#qaaCmpSlot').innerHTML = qaaComplianceHtml(ctx);
        return;
      }
      if ((el = e.target.closest('[data-cpan]'))) {
        var key = el.getAttribute('data-cpan');
        ctx.cmpCollapsed[key] = !ctx.cmpCollapsed[key];
        body.querySelector('#qaaCmpSlot').innerHTML = qaaComplianceHtml(ctx);
        return;
      }
      // 合规红线审核开关（通过/不通过，默认通过）
      if ((el = e.target.closest('[data-csw]'))) {
        var cid = el.getAttribute('data-csw');
        var cur = ctx.cmpReviews[cid] !== false;
        ctx.cmpReviews[cid] = !cur;
        el.classList.toggle('qaa-switch-on', !cur);
        el.innerHTML = '<span class="qaa-switch-handle"></span>' + (!cur ? '通过' : '不通过');
        return;
      }
      // 客服规范审核开关（文案恒为“通过”）
      if ((el = e.target.closest('[data-rsw]'))) {
        var t = qaaFindThird(ctx, el.getAttribute('data-t'));
        if (t) {
          var next = t.isPass === false;
          t.isPass = next;
          t.isPassFront = true;
          el.classList.toggle('qaa-switch-on', next);
        }
        return;
      }
      if ((el = e.target.closest('#qaaAfSubmit'))) {
        qaaSubmitReview(drawer);
        return;
      }
    });

    body.addEventListener('input', function (e) {
      if (e.target.id === 'qaaAfText') {
        var cnt = body.querySelector('#qaaAfCount');
        if (cnt) cnt.textContent = e.target.value.length;
        var row = body.querySelector('#qaaAfRow');
        if (row && e.target.value.trim()) row.classList.remove('qaa-af-invalid');
      }
    });
  }

  // 提交审核（对齐生产 createReview + updateIsPassForAppeals 兜底 + reload）
  function qaaSubmitReview(drawer) {
    var ctx = qaaAuditCtx;
    var body = drawer.querySelector('#qaaAuditBody');
    var ta = body.querySelector('#qaaAfText');
    var row = body.querySelector('#qaaAfRow');
    if (!ta || !row) return;
    var val = ta.value.trim();
    if (!val) {
      row.classList.add('qaa-af-invalid');
      return;
    }
    row.classList.remove('qaa-af-invalid');
    // 兜底：未操作的申诉中细项默认通过
    ctx.scoreAnalyse.forEach(function (f) {
      f.secondSorts.forEach(function (sec) {
        sec.thirdSorts.forEach(function (t) {
          if (t.isAppeal === true && t.isPass == null) t.isPass = true;
        });
      });
    });
    ctx.row.replyText = val;
    ctx.row.replyDate = qaaFmtDateTime(new Date());
    window.qrnAppealShared.closeDrawer();
    qaaToast('操作成功');
    var page = document.getElementById('qualityAppealPage');
    if (page) qaaRenderTable(page);
  }

  // ==================== 抽屉入口 ====================
  function qaaOpenAuditDrawer(row, mode) {
    var S = window.qrnAppealShared;
    if (!S) { qaaToast('质检看板共享组件未加载', 'error'); return; }
    qaaEnsureDrawerStyles();
    qaaEnsureAuditCardStyles();
    S.ensureStyles();
    var seedKey = row.seedKey;
    var sentences = S.getChatSentences(seedKey).map(function (s, i) {
      s.time = S.chatTime(seedKey, i);
      return s;
    });
    var compliance = qaaBuildCompliance(seedKey, mode);
    var ctx = {
      row: row, mode: mode, seedKey: seedKey,
      sentences: sentences,
      records: qaaBuildRecords(row, mode),
      scoreAnalyse: qaaBuildAppealScore(row, mode),
      compliance: compliance,
      baseRow: qaaBuildBaseRow(row),
      firstTab: -1, secondTab: 0,
      tFirstTab: 0, tSecondTab: 0,
      drawerTab: 'staff',
      // 折叠默认：有数据展开、无数据折叠
      cmpCollapsed: {
        section: false,
        redLine: !compliance.redLines.length,
        forbidden: !compliance.forbiddenWords.length,
        product: !compliance.productKnowledge.length,
        dispatch: !compliance.violationDispatch.length
      },
      cmpReviews: {}
    };
    ctx.formula = S.buildFormula(seedKey, ctx.scoreAnalyse);
    ctx.curCalls = ctx.records.reduce(function (a, r) { return a.concat(r.calls); }, []);
    qaaAuditCtx = ctx;
    var drawer = S.openDrawer({
      title: mode === 'query' ? '质检申诉审核详情' : '质检申诉审核',
      body: '<div class="qaa-audit" id="qaaAuditBody"></div>'
    });
    qaaRenderAuditBody(drawer);
    qaaBindAuditEvents(drawer);
  }

  // ==================== 模块注册 ====================
  window.renderQualityAppealPage = renderQualityAppealPage;
})();
