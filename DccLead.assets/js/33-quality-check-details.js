// ===== 质检管理模块 - 质检明细（对齐生产 qualityCheckDetails 页面） =====
// 页面结构：筛选区（坐席/质检日期/通话时长/通话完整性/质检总分/是否优秀案例/线索编码/车系/是否质检/质检等级）
//          → 细项树选择器 + 导出Excel/导出质检明细 → 明细表格（固定列+大类得分列+细项动态列+指标列）
//          → 详情抽屉（质检明细详情，appeal 发起模式：可申诉细项「申诉」开关、合规红线可勾选）
// 对齐规则：纯静态原型，确定性伪随机演示数据，不依赖后端 API。
// 结构对齐生产 chunk p__NEV__Sale__NEV__qualityCheckDetails（20261019 下载源码）。

(function () {
  'use strict';

  // ==================== 确定性伪随机工具 ====================
  function qcdRnd(seed) {
    var h = 5381;
    for (var i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) % 100003;
    var x = Math.sin(h + 1) * 10000;
    return x - Math.floor(x);
  }
  function qcdInt(seed, min, max) { return Math.floor(qcdRnd(seed) * (max - min + 1)) + min; }
  function qcdFixed(seed, min, max, digits) { return +(qcdRnd(seed) * (max - min) + min).toFixed(digits == null ? 2 : digits); }
  function qcdPick(seed, len) { return Math.floor(qcdRnd(seed) * len) % len; }

  function qcdEsc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function qcdFmtDate(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function qcdFmtDateTime(d) {
    return qcdFmtDate(d) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
  }

  function qcdToast(text, type) {
    var old = document.querySelector('.qcd-toast');
    if (old) old.remove();
    var el = document.createElement('div');
    el.className = 'qcd-toast';
    var color = type === 'warn' ? '#faad14' : type === 'error' ? '#ff4d4f' : '#52c41a';
    el.setAttribute('style', 'position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:30000;padding:8px 20px;border-radius:4px;background:#fff;box-shadow:0 3px 12px rgba(0,0,0,0.15);font-size:14px;color:' + color + ';pointer-events:none;');
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2400);
  }

  // ==================== 基础数据 ====================
  // 坐席（按组分级联：坐席组 → 坐席）
  var qcdSeatGroups = [
    {
      groupName: '电销一组',
      seats: [
        { account: '1005641', name: '张伟' }, { account: '1005642', name: '李娜' },
        { account: '1005643', name: '王强' }
      ]
    },
    {
      groupName: '电销二组',
      seats: [
        { account: '1005644', name: '刘芳' }, { account: '1005645', name: '陈明' },
        { account: '1005646', name: '赵丽' }
      ]
    },
    {
      groupName: '电销三组',
      seats: [
        { account: '1005647', name: '孙鹏' }, { account: '1005648', name: '周婷' }
      ]
    }
  ];
  var qcdAllSeats = qcdSeatGroups.reduce(function (a, g) { return a.concat(g.seats); }, []);

  var qcdSeriesNames = ['N7', 'ARION', '天籁', '探陆', '轩逸'];

  var qcdNotReasons = ['通话时长不足30秒', '系统重复质检', '无有效语音内容', '录音损坏无法质检'];

  // ==================== 质检模型树（大类→小类→细项，与质检看板同一模型体系） ====================
  var qcdModelTree = [
    {
      code: 'FS001', name: '销售引导及话术标准', percent: 35,
      seconds: [
        { code: 'SS001', name: '开场白', thirds: [{ code: 'TS001', name: '报品牌+自我介绍' }] },
        { code: 'SS002', name: '留资信息确认', thirds: [{ code: 'TS002', name: '确认留资意愿' }] },
        { code: 'SS003', name: '需求分析', thirds: [
          { code: 'TS003', name: '问购车用途' }, { code: 'TS004', name: '问购车方式' },
          { code: 'TS005', name: '问购车时间' }, { code: 'TS006', name: '问客户城市' }
        ] },
        { code: 'SS004', name: '邀请试驾排程', thirds: [{ code: 'TS007', name: '主动邀请到店试驾' }] },
        { code: 'SS005', name: '姓氏确认', thirds: [{ code: 'TS008', name: '确认客户姓氏' }] },
        { code: 'SS006', name: '邀请添加企业微信', thirds: [{ code: 'TS009', name: '添加客户微信' }] },
        { code: 'SS007', name: '礼貌结束', thirds: [{ code: 'TS010', name: '礼貌结束通话' }] },
        { code: 'SS008', name: '产品介绍', thirds: [{ code: 'TS011', name: '介绍车型卖点' }] },
        { code: 'SS009', name: '权益介绍', thirds: [{ code: 'TS012', name: '介绍购车权益' }] }
      ]
    },
    {
      code: 'FS002', name: '应对技巧', percent: 20,
      seconds: [
        { code: 'SS010', name: '异议处理', thirds: [
          { code: 'TS013', name: '价格异议应对' }, { code: 'TS014', name: '竞品对比应对' }
        ] },
        { code: 'SS011', name: '需求引导', thirds: [
          { code: 'TS015', name: '引导到店' }, { code: 'TS016', name: '引导留资' }
        ] }
      ]
    },
    {
      code: 'FS003', name: '服务态度', percent: 20,
      seconds: [
        { code: 'SS012', name: '服务热情', thirds: [
          { code: 'TS017', name: '主动问候' }, { code: 'TS018', name: '耐心解答' }
        ] },
        { code: 'SS013', name: '情绪管理', thirds: [
          { code: 'TS019', name: '语气平和' }, { code: 'TS020', name: '安抚客户' }
        ] }
      ]
    },
    {
      code: 'FS004', name: '通话行为', percent: 25,
      seconds: [
        { code: 'SS014', name: '表述清晰', thirds: [
          { code: 'TS021', name: '口齿清楚' }, { code: 'TS022', name: '语速适中' }
        ] },
        { code: 'SS015', name: '通话规范', thirds: [
          { code: 'TS023', name: '无长时间静音' }, { code: 'TS024', name: '无打断客户' }
        ] }
      ]
    }
  ];

  // 全部细项（叶子）列表
  var qcdAllThirds = [];
  qcdModelTree.forEach(function (f) {
    f.seconds.forEach(function (s) { s.thirds.forEach(function (t) { qcdAllThirds.push(t); }); });
  });

  // 大类列表（固定4列）
  var qcdCategories = qcdModelTree.map(function (f) { return { code: f.code, name: f.name, percent: f.percent }; });
  var QCD_CAT_COLORS = ['#5B8FF9', '#61DDAA', '#F6BD16', '#E8684A'];

  // ==================== 明细行数据（对齐 getQualityCheckList 返回 rows） ====================
  // 行字段：id/taskCode/seedKey/seatName/seatAccount/seatGroup/recordId/hdClueId/carSeries/
  //        inspectionEnable/inspectionNotReason/completeFlag/callDuration/callTime/redLineFlag/
  //        dimensionScore/categoryScores{}/itemScores[]/sensitiveDeduct/knowledgeDeduct/
  //        violationSendFlag/qcLevel/excellentCaseFlag/finalScore
  function qcdBuildRows() {
    var rows = [];
    var total = 60;
    for (var i = 0; i < total; i++) {
      var sk = 'QCD_ROW_' + i;
      var seat = qcdAllSeats[qcdPick(sk + '_seat', qcdAllSeats.length)];
      var group = qcdSeatGroups.find(function (g) { return g.seats.indexOf(seat) >= 0; });
      var enable = qcdRnd(sk + '_en') < 0.92;
      var redLine = enable && qcdRnd(sk + '_rl') < 0.06;
      var violation = enable && !redLine && qcdRnd(sk + '_vd') < 0.05;
      var sensD = enable ? qcdPick(sk + '_sens', 10) < 3 ? qcdInt(sk + '_sensv', 1, 10) : 0 : 0;
      var knowD = enable ? qcdPick(sk + '_know', 10) < 3 ? qcdInt(sk + '_knowv', 1, 10) : 0 : 0;
      // 细项得分：dimensionScore = 100 - 敏感词扣分 - 产品知识扣分（细项指标维度满分100）
      var dimScore = 100 - sensD - knowD;
      var finalScore = redLine || violation ? 0 : dimScore;
      var qcLevel = finalScore >= 91 ? 1 : finalScore >= 80 ? 2 : 3;
      // 大类得分：按权重拆分
      var catScores = {};
      var used = 0;
      qcdCategories.forEach(function (c, ci) {
        var v;
        if (ci === qcdCategories.length - 1) v = dimScore - used;
        else { v = Math.round(dimScore * c.percent / 100); used += v; }
        catScores[c.code] = v;
      });
      // 细项得分：触发项按大类分摊，未触发 0
      var itemScores = [];
      qcdAllThirds.forEach(function (t) {
        var trig = qcdRnd(sk + '_tr_' + t.code) < 0.62;
        itemScores.push({ itemCode: t.code, triggerFlag: trig ? 1 : 0, score: 0 });
      });
      // 分摊各类得分到触发细项
      qcdModelTree.forEach(function (f) {
        var pool = itemScores.filter(function (it) {
          return f.seconds.some(function (s) { return s.thirds.some(function (t) { return t.code === it.itemCode; }); }) && it.triggerFlag === 1;
        });
        var totalC = catScores[f.code] || 0;
        if (pool.length) {
          var acc = 0;
          pool.forEach(function (p, pi) {
            var v = pi === pool.length - 1 ? totalC - acc : Math.round(totalC / pool.length);
            acc += v;
            p.score = Math.max(0, v);
          });
        }
      });
      // 通话时间：30% 今天（默认筛选今天有数据），70% 近 1-29 天
      var ct = new Date();
      ct.setDate(ct.getDate() - (qcdRnd(sk + '_cto') < 0.3 ? 0 : 1 + qcdInt(sk + '_ct', 0, 28)));
      ct.setHours(qcdInt(sk + '_cth', 9, 18), qcdInt(sk + '_ctm', 0, 59), qcdInt(sk + '_cts', 0, 59), 0);
      // 完整性：质检时 1/0；不质检时 2-不完整 / 0-置空
      var complete;
      if (enable) complete = qcdRnd(sk + '_cf') < 0.9 ? 1 : 0;
      else complete = qcdRnd(sk + '_cf') < 0.6 ? 2 : 0;
      rows.push({
        id: 30001 + i,
        taskCode: 'TASK' + (783100 + i * 7),
        seedKey: sk,
        seatName: seat.name,
        seatAccount: seat.account,
        seatGroup: group ? group.groupName : '',
        recordId: 'CD' + (68200 + i * 13),
        hdClueId: 'HD' + (20510 + i * 11),
        carSeries: qcdSeriesNames[qcdPick(sk + '_ser', qcdSeriesNames.length)],
        inspectionEnable: enable ? 1 : 0,
        inspectionNotReason: enable ? '' : qcdNotReasons[qcdPick(sk + '_nr', qcdNotReasons.length)],
        completeFlag: complete,
        callDuration: qcdInt(sk + '_dur', 35, 620),
        callTime: qcdFmtDateTime(ct),
        redLineFlag: redLine ? 1 : 0,
        dimensionScore: enable ? dimScore : null,
        categoryScores: enable ? catScores : null,
        itemScores: enable ? itemScores : null,
        sensitiveDeduct: enable ? sensD : null,
        knowledgeDeduct: enable ? knowD : null,
        violationSendFlag: violation ? 1 : 0,
        qcLevel: enable ? qcLevel : null,
        excellentCaseFlag: enable && !redLine && !violation && qcdRnd(sk + '_ex') < 0.1 ? 1 : 0,
        finalScore: enable ? finalScore : null
      });
    }
    return rows;
  }

  // ==================== 页面状态 ====================
  var qcdState = {
    params: {
      seatIds: [], dateRange: null,
      durationMin: '', durationMax: '', completeFlag: '',
      scoreMin: '', scoreMax: '', excellentCaseFlag: '',
      hdClueId: '', carSeries: '', inspectionEnable: '', qcLevel: ''
    },
    selectedItems: [],  // 勾选细项（叶子）
    page: 1, pageSize: 20,
    allRows: []
  };

  // 过滤 + 分页（对齐 buildBackendParams 参数逻辑；生产列表无排序配置）
  function qcdQueryRows() {
    var p = qcdState.params;
    var rows = qcdState.allRows.filter(function (r) {
      if (p.seatIds.length && p.seatIds.indexOf(r.seatAccount) < 0) return false;
      if (p.dateRange) {
        var t = r.callTime.slice(0, 10);
        if (t < p.dateRange[0] || t > p.dateRange[1]) return false;
      }
      if (p.durationMin !== '' && r.callDuration < +p.durationMin) return false;
      if (p.durationMax !== '' && r.callDuration > +p.durationMax) return false;
      if (p.completeFlag !== '' && String(r.completeFlag === 2 ? 0 : r.completeFlag) !== String(p.completeFlag)) return false;
      if (p.excellentCaseFlag !== '' && String(r.excellentCaseFlag) !== String(p.excellentCaseFlag)) return false;
      if (p.inspectionEnable !== '' && String(r.inspectionEnable) !== String(p.inspectionEnable)) return false;
      if (p.qcLevel !== '') {
        if (!r.qcLevel || String(r.qcLevel) !== String(p.qcLevel)) return false;
      }
      if (p.scoreMin !== '' || p.scoreMax !== '') {
        if (r.finalScore == null) return false;
        if (p.scoreMin !== '' && r.finalScore < +p.scoreMin) return false;
        if (p.scoreMax !== '' && r.finalScore > +p.scoreMax) return false;
      }
      if (p.hdClueId && r.hdClueId.toLowerCase().indexOf(String(p.hdClueId).toLowerCase()) < 0) return false;
      if (p.carSeries && r.carSeries !== p.carSeries) return false;
      return true;
    });
    return rows;
  }

  // ==================== 页面样式（对齐 ProTable + antd Tag 视觉） ====================
  function qcdEnsureStyles() {
    if (document.getElementById('qcdStyles')) return;
    var css = [
      '.qcd-main{padding:24px 20px;background-color:#f0f2f5;min-height:100%;}',
      '.qcd-card{background-color:#fff;border-radius:12px;}',
      /* 筛选区 */
      '.qcd-search{padding:16px 16px 0;}',
      '.qcd-search-form{display:flex;flex-wrap:wrap;gap:16px 24px;align-items:flex-start;}',
      '.qcd-form-item{display:flex;align-items:flex-start;}',
      '.qcd-form-label{flex:none;line-height:32px;font-size:14px;color:rgba(0,0,0,0.88);margin-right:8px;white-space:nowrap;}',
      '.qcd-input,.qcd-select{height:32px;padding:4px 11px;font-size:14px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;color:rgba(0,0,0,0.88);outline:none;transition:border-color .2s;box-sizing:border-box;}',
      '.qcd-input:focus,.qcd-select:focus{border-color:#2885ff;box-shadow:0 0 0 2px rgba(40,133,255,0.1);}',
      '.qcd-num{width:88px;}',
      '.qcd-date-sep{line-height:32px;padding:0 4px;color:rgba(0,0,0,0.45);}',
      /* 坐席级联多选（antd Cascader multiple 对齐） */
      '.qcd-seat-select{min-height:32px;min-width:220px;max-width:360px;padding:2px 4px;display:flex;flex-wrap:wrap;gap:2px;align-items:center;border:1px solid #d9d9d9;border-radius:6px;background:#fff;cursor:pointer;transition:border-color .2s;}',
      '.qcd-seat-select:hover{border-color:#2885ff;}',
      '.qcd-seat-select .qcd-placeholder{color:rgba(0,0,0,0.25);font-size:14px;padding:0 7px;line-height:28px;}',
      '.qcd-seat-select .qcd-tag{display:inline-flex;align-items:center;max-width:100%;height:24px;padding:0 7px;font-size:12px;background:rgba(0,0,0,0.06);border-radius:4px;color:rgba(0,0,0,0.88);}',
      '.qcd-seat-select .qcd-tag .qcd-tag-close{margin-left:4px;font-style:normal;color:rgba(0,0,0,0.45);cursor:pointer;}',
      '.qcd-seat-select .qcd-tag .qcd-tag-close:hover{color:rgba(0,0,0,0.88);}',
      '.qcd-seat-select .qcd-arrow{margin-left:auto;color:rgba(0,0,0,0.25);padding:0 7px;}',
      '.qcd-select-dropdown{position:fixed;z-index:11000;width:280px;background:#fff;border-radius:8px;box-shadow:0 6px 16px 0 rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:4px;max-height:320px;overflow:auto;font-size:14px;}',
      '.qcd-select-search{width:calc(100% - 4px);height:28px;margin:2px 0 6px;padding:0 7px;border:1px solid #d9d9d9;border-radius:4px;outline:none;font-size:14px;box-sizing:border-box;}',
      '.qcd-group-title{padding:6px 8px 2px;font-size:12px;color:rgba(0,0,0,0.45);}',
      '.qcd-opt{display:flex;align-items:center;height:30px;padding:0 8px;cursor:pointer;border-radius:4px;}',
      '.qcd-opt:hover{background:rgba(0,0,0,0.03);}',
      '.qcd-opt .qcd-checkbox{width:16px;height:16px;border:1px solid #d9d9d9;border-radius:4px;margin-right:8px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:#fff;transition:all .2s;font-size:12px;color:#fff;}',
      '.qcd-opt .qcd-checkbox.qcd-checked{background:#1677ff;border-color:#1677ff;}',
      '.qcd-opt .qcd-opt-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      /* 按钮 */
      '.qcd-btn{display:inline-flex;align-items:center;justify-content:center;height:32px;padding:4px 15px;font-size:14px;border-radius:6px;border:1px solid #d9d9d9;background:#fff;color:rgba(0,0,0,0.88);cursor:pointer;transition:all .2s;white-space:nowrap;gap:6px;}',
      '.qcd-btn:hover{color:#2885ff;border-color:#2885ff;}',
      '.qcd-btn-primary{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.qcd-btn-primary:hover{background:#4096ff;border-color:#4096ff;color:#fff;}',
      '.qcd-btn .qcd-btn-icon{font-size:14px;line-height:1;}',
      '.qcd-search-actions{display:flex;gap:8px;margin-left:auto;padding-bottom:16px;}',
      /* 第二行：细项树选择器 + 导出 */
      '.qcd-toolbar{display:flex;justify-content:space-between;align-items:center;width:100%;padding:12px 24px;box-sizing:border-box;}',
      '.qcd-toolbar-left,.qcd-toolbar-right{display:flex;align-items:center;gap:8px;}',
      '.qcd-tree-select{min-width:200px;min-height:32px;padding:2px 4px;display:flex;flex-wrap:wrap;gap:2px;align-items:center;border:1px solid #d9d9d9;border-radius:6px;background:#fff;cursor:pointer;transition:border-color .2s;max-width:520px;}',
      '.qcd-tree-select:hover{border-color:#2885ff;}',
      '.qcd-tree-select .qcd-placeholder{color:rgba(0,0,0,0.25);font-size:14px;padding:0 7px;line-height:28px;}',
      '.qcd-tree-select .qcd-tag{display:inline-flex;align-items:center;max-width:100%;height:24px;padding:0 7px;font-size:12px;background:rgba(0,0,0,0.06);border-radius:4px;color:rgba(0,0,0,0.88);}',
      '.qcd-tree-select .qcd-tag .qcd-tag-close{margin-left:4px;font-style:normal;color:rgba(0,0,0,0.45);cursor:pointer;}',
      '.qcd-tree-select .qcd-tag .qcd-tag-close:hover{color:rgba(0,0,0,0.88);}',
      '.qcd-tree-select .qcd-arrow{margin-left:auto;color:rgba(0,0,0,0.25);padding:0 7px;}',
      '.qcd-tree-dropdown{position:fixed;z-index:11000;width:340px;max-height:360px;overflow:auto;background:#fff;border-radius:8px;box-shadow:0 6px 16px 0 rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:4px;font-size:14px;}',
      '.qcd-tree-node{display:flex;align-items:center;height:30px;padding:0 8px;cursor:pointer;border-radius:4px;gap:8px;}',
      '.qcd-tree-node:hover{background:rgba(0,0,0,0.03);}',
      '.qcd-tree-node .qcd-checkbox{width:16px;height:16px;border:1px solid #d9d9d9;border-radius:4px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:#fff;transition:all .2s;font-size:12px;color:#fff;}',
      '.qcd-tree-node .qcd-checkbox.qcd-checked{background:#1677ff;border-color:#1677ff;}',
      '.qcd-tree-node .qcd-checkbox.qcd-half{background:#fff;border-color:#1677ff;color:#1677ff;}',
      '.qcd-tree-children{margin-left:24px;}',
      '.qcd-tree-footer{display:flex;justify-content:space-between;padding:8px 12px;border-top:1px solid #f0f0f0;margin-top:4px;position:sticky;bottom:-4px;background:#fff;}',
      '.qcd-tree-footer a{color:#1677ff;cursor:pointer;font-size:14px;}',
      '.qcd-tree-footer a:hover{color:#4096ff;}',
      /* 表格 */
      '.qcd-table-wrap{padding:0 16px 16px;}',
      '.qcd-table-scroll{overflow:auto;}',
      '.qcd-grid-table{width:100%;border-collapse:collapse;font-size:14px;table-layout:auto;}',
      '.qcd-grid-table th{background:#fafafa;padding:12px 12px;text-align:center;font-weight:600;color:rgba(0,0,0,0.88);border-bottom:1px solid #f0f0f0;border-right:1px solid #f0f0f0;white-space:nowrap;position:sticky;top:0;z-index:2;}',
      '.qcd-grid-table td{padding:12px 12px;border-bottom:1px solid #f0f0f0;border-right:1px solid #f0f0f0;color:rgba(0,0,0,0.88);white-space:nowrap;text-align:center;}',
      '.qcd-grid-table tbody tr:hover td{background:#fafafa;}',
      '.qcd-col-fixed-left{position:sticky;left:0;background:#fff;z-index:1;}',
      '.qcd-grid-table thead .qcd-col-fixed-left{z-index:3;background:#fafafa;}',
      '.qcd-grid-table tbody tr:hover .qcd-col-fixed-left{background:#fafafa;}',
      '.qcd-col-fixed-right{position:sticky;right:0;background:#fff;z-index:1;}',
      '.qcd-grid-table thead .qcd-col-fixed-right{z-index:3;background:#fafafa;}',
      '.qcd-grid-table tbody tr:hover .qcd-col-fixed-right{background:#fafafa;}',
      '.qcd-ellipsis{max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.qcd-placeholder{color:#bfbfbf;}',
      '.qcd-text-danger{color:#ff4d4f;}',
      '.qcd-link{color:#1677ff;cursor:pointer;background:none;border:none;padding:0;font-size:14px;}',
      '.qcd-link:hover{color:#4096ff;}',
      '.qcd-empty-row td{text-align:center;padding:32px 0;color:rgba(0,0,0,0.25);}',
      /* antd Tag 对齐 */
      '.qcd-tag{display:inline-flex;align-items:center;height:22px;padding:0 7px;font-size:12px;border-radius:4px;border:1px solid;white-space:nowrap;line-height:20px;}',
      '.qcd-tag-blue{color:#1677ff;background:#e6f4ff;border-color:#91caff;}',
      '.qcd-tag-default{color:rgba(0,0,0,0.65);background:#fafafa;border-color:#d9d9d9;}',
      '.qcd-tag-green{color:#389e0d;background:#f6ffed;border-color:#b7eb8f;}',
      '.qcd-tag-red{color:#ff4d4f;background:#fff2f0;border-color:#ffccc7;}',
      '.qcd-tag-score{border-radius:12px;min-width:40px;text-align:center;justify-content:center;}',
      /* 分页 */
      '.qcd-pagination{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:16px 0 0;font-size:14px;color:rgba(0,0,0,0.88);}',
      '.qcd-pagination .qcd-page-btn{min-width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #d9d9d9;border-radius:6px;background:#fff;cursor:pointer;padding:0 8px;}',
      '.qcd-pagination .qcd-page-btn:hover{color:#2885ff;border-color:#2885ff;}',
      '.qcd-pagination .qcd-page-btn.qcd-page-active{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.qcd-pagination .qcd-page-btn:disabled{color:rgba(0,0,0,0.25);cursor:not-allowed;background:#fff;border-color:#d9d9d9;}',
      '.qcd-pagination select{height:32px;border:1px solid #d9d9d9;border-radius:6px;padding:0 8px;font-size:14px;background:#fff;}',
      '.qcd-total-text{margin-right:8px;color:rgba(0,0,0,0.65);}'
    ];
    var el = document.createElement('style');
    el.id = 'qcdStyles';
    el.textContent = css.join('\n');
    document.head.appendChild(el);
  }

  // ==================== 坐席级联多选下拉 ====================
  function qcdRenderSeatSelect(page) {
    var wrap = page.querySelector('#qcdSeatSelect');
    if (!wrap) return;
    var selected = qcdState.params.seatIds;
    var tags = selected.map(function (acc) {
      var s = qcdAllSeats.find(function (x) { return x.account === acc; });
      return '<span class="qcd-tag">' + qcdEsc(s ? s.name : acc) + '<i class="qcd-tag-close" data-acc="' + acc + '">✕</i></span>';
    }).join('');
    wrap.innerHTML = tags + (selected.length ? '' : '<span class="qcd-placeholder">请选择</span>') +
      '<span class="qcd-arrow">▾</span>';
    wrap.querySelectorAll('.qcd-tag-close').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var acc = el.getAttribute('data-acc');
        qcdState.params.seatIds = qcdState.params.seatIds.filter(function (x) { return x !== acc; });
        qcdRenderSeatSelect(page);
      });
    });
  }

  function qcdOpenSeatDropdown(page, anchor) {
    var old = document.querySelector('.qcd-select-dropdown');
    if (old) { old.remove(); return; }
    var dd = document.createElement('div');
    dd.className = 'qcd-select-dropdown';
    var rect = anchor.getBoundingClientRect();
    dd.style.left = Math.min(rect.left, window.innerWidth - 296) + 'px';
    dd.style.top = (rect.bottom + 4) + 'px';
    var html = '<input class="qcd-select-search" id="qcdSeatSearch" placeholder="请输入坐席名称" />';
    qcdSeatGroups.forEach(function (g) {
      html += '<div class="qcd-group-title">' + qcdEsc(g.groupName) + '</div>';
      g.seats.forEach(function (s) {
        html += '<div class="qcd-opt" data-acc="' + s.account + '" data-name="' + qcdEsc(s.name) + '">' +
          '<span class="qcd-checkbox' + (qcdState.params.seatIds.indexOf(s.account) >= 0 ? ' qcd-checked' : '') + '">✓</span>' +
          '<span class="qcd-opt-label">' + qcdEsc(s.name) + '（' + s.account + '）</span></div>';
      });
    });
    dd.innerHTML = html;
    document.body.appendChild(dd);
    dd.querySelector('#qcdSeatSearch').addEventListener('input', function () {
      var kw = this.value.trim();
      dd.querySelectorAll('.qcd-opt').forEach(function (o) {
        o.style.display = (!kw || o.getAttribute('data-name').indexOf(kw) >= 0 || o.getAttribute('data-acc').indexOf(kw) >= 0) ? '' : 'none';
      });
    });
    dd.querySelectorAll('.qcd-opt').forEach(function (o) {
      o.addEventListener('click', function () {
        var acc = o.getAttribute('data-acc');
        var idx = qcdState.params.seatIds.indexOf(acc);
        if (idx >= 0) qcdState.params.seatIds.splice(idx, 1);
        else qcdState.params.seatIds.push(acc);
        var cb = o.querySelector('.qcd-checkbox');
        cb.classList.toggle('qcd-checked');
        qcdRenderSeatSelect(page);
        dd.querySelector('#qcdSeatSearch').focus();
      });
    });
    setTimeout(function () {
      document.addEventListener('click', function close(ev) {
        if (!ev.target.closest('.qcd-select-dropdown') && !ev.target.closest('#qcdSeatSelect')) {
          dd.remove();
          document.removeEventListener('click', close);
        }
      });
    }, 0);
  }

  // ==================== 细项树选择器（TreeSelect treeCheckable SHOW_CHILD 对齐） ====================
  // 勾选状态：叶子 code 集合；父级全选/半选由叶子推导
  function qcdLeafChildren(node) {
    var out = [];
    (node.seconds || []).forEach(function (s) {
      (s.thirds || []).forEach(function (t) { out.push(t.code); });
    });
    return out;
  }

  function qcdSecondLeaves(sec) { return (sec.thirds || []).map(function (t) { return t.code; }); }

  function qcdAllLeafCodes() {
    return qcdModelTree.reduce(function (a, f) { return a.concat(qcdLeafChildren(f)); }, []);
  }

  function qcdRenderTreeSelect(page) {
    var wrap = page.querySelector('#qcdTreeSelect');
    if (!wrap) return;
    var sel = qcdState.selectedItems;
    var showTags = sel.slice(0, 2).map(function (code) {
      var t = qcdAllThirds.find(function (x) { return x.code === code; });
      return '<span class="qcd-tag">' + qcdEsc(t ? t.name : code) + '<i class="qcd-tag-close" data-code="' + code + '">✕</i></span>';
    }).join('');
    if (sel.length > 2) showTags += '<span class="qcd-tag">+' + (sel.length - 2) + '...</span>';
    wrap.innerHTML = (sel.length ? showTags : '<span class="qcd-placeholder">请选择质检细项</span>') +
      '<span class="qcd-arrow">▾</span>';
    wrap.querySelectorAll('.qcd-tag-close').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var code = el.getAttribute('data-code');
        qcdState.selectedItems = qcdState.selectedItems.filter(function (x) { return x !== code; });
        qcdRenderTreeSelect(page);
        qcdRenderTable(page);
      });
    });
  }

  function qcdTreeNodeHtml(page) {
    var sel = qcdState.selectedItems;
    function checkboxState(leaves) {
      var cnt = leaves.filter(function (c) { return sel.indexOf(c) >= 0; }).length;
      if (cnt === 0) return '';
      return cnt === leaves.length ? ' qcd-checked' : ' qcd-half';
    }
    var html = '';
    qcdModelTree.forEach(function (f) {
      var fLeaves = qcdLeafChildren(f);
      html += '<div class="qcd-tree-node" data-tlevel="1" data-code="' + f.code + '">' +
        '<span class="qcd-checkbox' + checkboxState(fLeaves) + '">' + (checkboxState(fLeaves) === ' qcd-checked' ? '✓' : (checkboxState(fLeaves) === ' qcd-half' ? '−' : '')) + '</span>' +
        '<span>' + qcdEsc(f.name) + '</span></div>';
      html += '<div class="qcd-tree-children">';
      f.seconds.forEach(function (s) {
        var sLeaves = qcdSecondLeaves(s);
        html += '<div class="qcd-tree-node" data-tlevel="2" data-code="' + s.code + '">' +
          '<span class="qcd-checkbox' + checkboxState(sLeaves) + '">' + (checkboxState(sLeaves) === ' qcd-checked' ? '✓' : (checkboxState(sLeaves) === ' qcd-half' ? '−' : '')) + '</span>' +
          '<span>' + qcdEsc(s.name) + '</span></div>';
        html += '<div class="qcd-tree-children">';
        s.thirds.forEach(function (t) {
          var on = sel.indexOf(t.code) >= 0;
          html += '<div class="qcd-tree-node" data-tlevel="3" data-code="' + t.code + '">' +
            '<span class="qcd-checkbox' + (on ? ' qcd-checked' : '') + '">' + (on ? '✓' : '') + '</span>' +
            '<span>' + qcdEsc(t.name) + '</span></div>';
        });
        html += '</div>';
      });
      html += '</div>';
    });
    html += '<div class="qcd-tree-footer"><a data-tact="all">全选</a><a data-tact="clear">清空</a></div>';
    return html;
  }

  function qcdOpenTreeDropdown(page, anchor) {
    var old = document.querySelector('.qcd-tree-dropdown');
    if (old) { old.remove(); return; }
    var dd = document.createElement('div');
    dd.className = 'qcd-tree-dropdown';
    var rect = anchor.getBoundingClientRect();
    dd.style.left = Math.min(rect.left, window.innerWidth - 356) + 'px';
    dd.style.top = (rect.bottom + 4) + 'px';
    dd.innerHTML = qcdTreeNodeHtml(page);
    document.body.appendChild(dd);

    dd.addEventListener('click', function (e) {
      var node = e.target.closest('[data-tlevel]');
      if (node) {
        var level = +node.getAttribute('data-tlevel');
        var code = node.getAttribute('data-code');
        var leaves = [];
        if (level === 1) {
          var f = qcdModelTree.find(function (x) { return x.code === code; });
          leaves = f ? qcdLeafChildren(f) : [];
        } else if (level === 2) {
          qcdModelTree.forEach(function (x) {
            x.seconds.forEach(function (s) { if (s.code === code) leaves = qcdSecondLeaves(s); });
          });
        } else leaves = [code];
        var allOn = leaves.every(function (c) { return qcdState.selectedItems.indexOf(c) >= 0; });
        if (allOn) {
          qcdState.selectedItems = qcdState.selectedItems.filter(function (c) { return leaves.indexOf(c) < 0; });
        } else {
          leaves.forEach(function (c) { if (qcdState.selectedItems.indexOf(c) < 0) qcdState.selectedItems.push(c); });
        }
        dd.innerHTML = qcdTreeNodeHtml(page);
        qcdRenderTreeSelect(page);
        qcdRenderTable(page);
        return;
      }
      var act = e.target.closest('[data-tact]');
      if (act) {
        var a = act.getAttribute('data-tact');
        qcdState.selectedItems = a === 'all' ? qcdAllLeafCodes() : [];
        dd.innerHTML = qcdTreeNodeHtml(page);
        qcdRenderTreeSelect(page);
        qcdRenderTable(page);
      }
    });
    setTimeout(function () {
      document.addEventListener('click', function close(ev) {
        if (!ev.target.closest('.qcd-tree-dropdown') && !ev.target.closest('#qcdTreeSelect')) {
          dd.remove();
          document.removeEventListener('click', close);
        }
      });
    }, 0);
  }

  // ==================== 表格渲染 ====================
  // Tag 渲染辅助（对齐生产 renderBool/renderViolation/renderRedLine/renderComplete/renderLevel）
  var QCD_PH = '<span class="qcd-placeholder">—</span>';

  function qcdTagBool(v) {
    return v === 1 ? '<span class="qcd-tag qcd-tag-blue">是</span>' : '<span class="qcd-tag qcd-tag-default">否</span>';
  }
  function qcdTagViolation(v) {
    return v === 1 ? '<span class="qcd-tag qcd-tag-red">是</span>' : '<span class="qcd-tag qcd-tag-default">否</span>';
  }
  function qcdTagRedLine(v) {
    return v === 1 ? '<span class="qcd-tag qcd-tag-red">触发</span>' : '<span class="qcd-tag qcd-tag-default">未触发</span>';
  }
  function qcdTagComplete(v) {
    return v === 1 ? '<span class="qcd-tag qcd-tag-green">完整</span>' : '<span class="qcd-tag qcd-tag-red">不完整</span>';
  }
  function qcdTagLevel(v) {
    if (!v) return QCD_PH;
    var map = { 1: ['qcd-tag-green', '优秀'], 2: ['qcd-tag-blue', '合格'], 3: ['qcd-tag-red', '不合格'] };
    var cfg = map[v];
    return cfg ? '<span class="qcd-tag ' + cfg[0] + '">' + cfg[1] + '</span>' : QCD_PH;
  }
  function qcdTagScore(r) {
    if (r.inspectionEnable !== 1) return QCD_PH;
    var zero = r.redLineFlag === 1 || r.violationSendFlag === 1;
    var cls = zero ? 'qcd-tag-red' : (r.qcLevel === 1 ? 'qcd-tag-green' : r.qcLevel === 2 ? 'qcd-tag-blue' : 'qcd-tag-red');
    return '<span class="qcd-tag qcd-tag-score ' + cls + '">' + r.finalScore + '</span>';
  }
  function qcdDeduct(v) {
    return Number(v) > 0 ? '<span class="qcd-text-danger">-' + v + '</span>' : '0';
  }

  function qcdRenderTable(page) {
    var rows = qcdQueryRows();
    var total = rows.length;
    var totalPages = Math.max(1, Math.ceil(total / qcdState.pageSize));
    if (qcdState.page > totalPages) qcdState.page = totalPages;
    var start = (qcdState.page - 1) * qcdState.pageSize;
    var pageRows = rows.slice(start, start + qcdState.pageSize);

    // 动态列：勾选细项（叶子）按模型顺序排列
    var dynItems = qcdAllThirds.filter(function (t) {
      return qcdState.selectedItems.indexOf(t.code) >= 0;
    });

    var html = '<div class="qcd-table-scroll"><table class="qcd-grid-table"><thead><tr>' +
      '<th class="qcd-col-fixed-left" style="min-width:110px">坐席名称</th>' +
      '<th class="qcd-col-fixed-left" style="min-width:90px">坐席组</th>' +
      '<th class="qcd-col-fixed-left" style="min-width:180px">通话ID</th>' +
      '<th style="min-width:150px">线索编码</th>' +
      '<th style="min-width:100px">车系</th>' +
      '<th style="min-width:100px">是否质检</th>' +
      '<th style="min-width:130px">不质检原因</th>' +
      '<th style="min-width:110px">通话完整性</th>' +
      '<th style="min-width:110px">通话时长(s)</th>' +
      '<th style="min-width:170px">通话时间</th>' +
      '<th style="min-width:120px">是否触发红线</th>';
    // 大类聚合列（固定4列，彩色标题）
    qcdCategories.forEach(function (c, ci) {
      html += '<th style="min-width:130px"><span style="color:' + QCD_CAT_COLORS[ci % QCD_CAT_COLORS.length] + '">' + qcdEsc(c.name) + '(得分)</span></th>';
    });
    // 细项动态列（绿色标题）
    dynItems.forEach(function (t) {
      html += '<th style="min-width:110px"><span style="color:#7eb783">' + qcdEsc(t.name) + '(得分)</span></th>';
    });
    html += '<th style="min-width:110px">细项指标分</th>' +
      '<th style="min-width:110px">敏感词扣分</th>' +
      '<th style="min-width:120px">产品知识扣分</th>' +
      '<th style="min-width:110px">是否违规下发</th>' +
      '<th style="min-width:100px">质检等级</th>' +
      '<th style="min-width:110px">是否优秀案例</th>' +
      '<th class="qcd-col-fixed-right" style="min-width:100px">质检总分</th>' +
      '<th class="qcd-col-fixed-right" style="min-width:80px">操作</th>' +
      '</tr></thead><tbody>';
    if (!pageRows.length) {
      var colspan = 11 + qcdCategories.length + dynItems.length + 8;
      html += '<tr class="qcd-empty-row"><td colspan="' + colspan + '">暂无数据</td></tr>';
    } else {
      pageRows.forEach(function (r) {
        html += '<tr>' +
          '<td class="qcd-col-fixed-left">' + qcdEsc(r.seatName) + '</td>' +
          '<td class="qcd-col-fixed-left">' + qcdEsc(r.seatGroup) + '</td>' +
          '<td class="qcd-col-fixed-left"><div class="qcd-ellipsis" title="' + qcdEsc(r.recordId) + '">' + qcdEsc(r.recordId) + '</div></td>' +
          '<td><div class="qcd-ellipsis" title="' + qcdEsc(r.hdClueId) + '">' + qcdEsc(r.hdClueId) + '</div></td>' +
          '<td>' + qcdEsc(r.carSeries) + '</td>' +
          '<td>' + qcdTagBool(r.inspectionEnable) + '</td>' +
          '<td>' + (r.inspectionNotReason ? qcdEsc(r.inspectionNotReason) : QCD_PH) + '</td>';
        // 完整性：质检时 1/0；不质检时 2-不完整红Tag / 0-—
        if (r.inspectionEnable === 1) html += '<td>' + qcdTagComplete(r.completeFlag) + '</td>';
        else if (r.completeFlag === 2) html += '<td><span class="qcd-tag qcd-tag-red">不完整</span></td>';
        else html += '<td>' + QCD_PH + '</td>';
        html += '<td>' + r.callDuration + '</td>' +
          '<td>' + qcdEsc(r.callTime) + '</td>';
        // 红线列：不质检显示 —
        html += '<td>' + (r.inspectionEnable === 1 ? qcdTagRedLine(r.redLineFlag) : QCD_PH) + '</td>';
        // 大类得分
        qcdCategories.forEach(function (c, ci) {
          if (r.inspectionEnable !== 1 || !r.categoryScores) { html += '<td>' + QCD_PH + '</td>'; return; }
          var v = r.categoryScores[c.code];
          html += '<td>' + (v != null ? '<span style="color:' + QCD_CAT_COLORS[ci % QCD_CAT_COLORS.length] + '">' + v + '</span>' : QCD_PH) + '</td>';
        });
        // 细项动态列
        dynItems.forEach(function (t) {
          if (r.inspectionEnable !== 1 || !r.itemScores) { html += '<td>' + QCD_PH + '</td>'; return; }
          var found = r.itemScores.find(function (x) { return x.itemCode === t.code; });
          html += '<td>' + (!found ? QCD_PH : (found.triggerFlag === 1 ? '<span>' + found.score + '</span>' : String(found.score))) + '</td>';
        });
        // 指标列
        html += '<td>' + (r.inspectionEnable === 1 ? r.dimensionScore : QCD_PH) + '</td>';
        html += '<td>' + (r.inspectionEnable === 1 ? qcdDeduct(r.sensitiveDeduct) : QCD_PH) + '</td>';
        html += '<td>' + (r.inspectionEnable === 1 ? qcdDeduct(r.knowledgeDeduct) : QCD_PH) + '</td>';
        html += '<td>' + (r.inspectionEnable === 1 ? qcdTagViolation(r.violationSendFlag) : QCD_PH) + '</td>';
        html += '<td>' + (r.inspectionEnable === 1 ? qcdTagLevel(r.qcLevel) : QCD_PH) + '</td>';
        html += '<td>' + (r.inspectionEnable === 1 ? qcdTagBool(r.excellentCaseFlag) : QCD_PH) + '</td>';
        html += '<td class="qcd-col-fixed-right">' + qcdTagScore(r) + '</td>';
        html += '<td class="qcd-col-fixed-right"><button class="qcd-btn qcd-btn-primary" style="height:24px;padding:0 7px;font-size:12px;border-radius:4px" data-act="detail" data-id="' + r.id + '">详情</button></td>';
        html += '</tr>';
      });
    }
    html += '</tbody></table></div>';

    // 分页
    html += '<div class="qcd-pagination prototype-pagination"><span class="qcd-total-text prototype-pagination-summary">共 ' + total + ' 条记录，当前第 ' + qcdState.page + ' / ' + totalPages + ' 页</span><div class="prototype-pagination-controls">' +
      '<select class="prototype-pagination-select" id="qcdPageSize" aria-label="每页显示条数">' +
      [5, 10, 20, 50, 100].map(function (size) { return '<option value="' + size + '"' + (qcdState.pageSize === size ? ' selected' : '') + '>每页 ' + size + ' 条</option>'; }).join('') + '</select>' +
      '<button type="button" class="qcd-page-btn prototype-pagination-arrow" data-pg="prev" aria-label="上一页"' + (qcdState.page <= 1 ? ' disabled' : '') + '><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>' +
      '<select class="prototype-pagination-select" id="qcdPageSelect" aria-label="选择页码">' + Array.from({ length: totalPages }, function (_, index) { var p = index + 1; return '<option value="' + p + '"' + (p === qcdState.page ? ' selected' : '') + '>第 ' + p + ' 页</option>'; }).join('') + '</select>' +
      '<button type="button" class="qcd-page-btn prototype-pagination-arrow" data-pg="next" aria-label="下一页"' + (qcdState.page >= totalPages ? ' disabled' : '') + '><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button></div></div>';

    var tableWrap = page.querySelector('#qcdTableBody');
    tableWrap.innerHTML = html;

    // 分页事件
    tableWrap.querySelectorAll('[data-pg]').forEach(function (el) {
      el.addEventListener('click', function () {
        var v = el.getAttribute('data-pg');
        var totalPages2 = Math.max(1, Math.ceil(qcdQueryRows().length / qcdState.pageSize));
        if (v === 'prev') qcdState.page = Math.max(1, qcdState.page - 1);
        else if (v === 'next') qcdState.page = Math.min(totalPages2, qcdState.page + 1);
        else qcdState.page = +v;
        qcdRenderTable(page);
      });
    });
    tableWrap.querySelector('#qcdPageSize').addEventListener('change', function () {
      qcdState.pageSize = +this.value;
      qcdState.page = 1;
      qcdRenderTable(page);
    });
    tableWrap.querySelector('#qcdPageSelect').addEventListener('change', function () {
      qcdState.page = Math.min(Math.max(1, +this.value || 1), Math.max(1, Math.ceil(qcdQueryRows().length / qcdState.pageSize)));
      qcdRenderTable(page);
    });
    // 详情
    tableWrap.querySelectorAll('[data-act="detail"]').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = +el.getAttribute('data-id');
        var row = qcdState.allRows.find(function (r) { return r.id === id; });
        if (row) qcdOpenDetailDrawer(row);
      });
    });
  }

  // ==================== 页面主渲染 ====================
  function renderQualityCheckDetailsPage() {
    qcdEnsureStyles();
    var page = document.getElementById('qualityCheckDetailsPage');
    if (!page) return;
    if (!qcdState.allRows.length) qcdState.allRows = qcdBuildRows();
    // 质检日期默认今天（对齐生产初始 dateRange: [今天, 今天]）
    if (!qcdState.params.dateRange) {
      var today = qcdFmtDate(new Date());
      qcdState.params.dateRange = [today, today];
    }

    function optHtml(list, cur) {
      return list.map(function (o) {
        return '<option value="' + o[0] + '"' + (String(cur) === String(o[0]) ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('');
    }

    page.innerHTML =
      '<div class="qcd-main">' +
        '<div class="qcd-card">' +
          '<div class="qcd-search"><div class="qcd-search-form">' +
            '<div class="qcd-form-item"><span class="qcd-form-label">坐席名称</span><div class="qcd-seat-select" id="qcdSeatSelect"></div></div>' +
            '<div class="qcd-form-item"><span class="qcd-form-label">质检日期</span>' +
              '<input type="date" class="qcd-input" id="qcdDateStart" />' +
              '<span class="qcd-date-sep">~</span>' +
              '<input type="date" class="qcd-input" id="qcdDateEnd" /></div>' +
            '<div class="qcd-form-item"><span class="qcd-form-label">通话时长（秒）</span>' +
              '<input type="number" class="qcd-input qcd-num" id="qcdDurMin" placeholder="最小值" />' +
              '<span class="qcd-date-sep">~</span>' +
              '<input type="number" class="qcd-input qcd-num" id="qcdDurMax" placeholder="最大值" /></div>' +
            '<div class="qcd-form-item"><span class="qcd-form-label">通话完整性</span>' +
              '<select class="qcd-select" id="qcdComplete"><option value="">请选择</option>' +
                '<option value="1">是（完整）</option><option value="0">否（不完整）</option></select></div>' +
            '<div class="qcd-form-item"><span class="qcd-form-label">质检总分</span>' +
              '<input type="number" class="qcd-input qcd-num" id="qcdScoreMin" placeholder="最小值" />' +
              '<span class="qcd-date-sep">~</span>' +
              '<input type="number" class="qcd-input qcd-num" id="qcdScoreMax" placeholder="最大值" /></div>' +
            '<div class="qcd-form-item"><span class="qcd-form-label">是否优秀案例</span>' +
              '<select class="qcd-select" id="qcdExcellent"><option value="">请选择</option>' +
                '<option value="1">是</option><option value="0">否</option></select></div>' +
            '<div class="qcd-form-item"><span class="qcd-form-label">线索编码</span>' +
              '<input type="text" class="qcd-input" id="qcdClueId" placeholder="请输入" /></div>' +
            '<div class="qcd-form-item"><span class="qcd-form-label">车系</span>' +
              '<select class="qcd-select" id="qcdSeries"><option value="">请选择</option>' +
                optHtml(qcdSeriesNames.map(function (n) { return [n, n]; }), '') + '</select></div>' +
            '<div class="qcd-form-item"><span class="qcd-form-label">是否质检</span>' +
              '<select class="qcd-select" id="qcdEnabled"><option value="">请选择</option>' +
                '<option value="1">是</option><option value="0">否</option></select></div>' +
            '<div class="qcd-form-item"><span class="qcd-form-label">质检等级</span>' +
              '<select class="qcd-select" id="qcdLevel"><option value="">请选择</option>' +
                '<option value="1">优秀(91-100)</option><option value="2">合格(80-90)</option><option value="3">不合格(&lt;80)</option></select></div>' +
            '<div class="qcd-search-actions">' +
              '<button class="qcd-btn" id="qcdResetBtn">重 置</button>' +
              '<button class="qcd-btn qcd-btn-primary" id="qcdQueryBtn">查 询</button>' +
            '</div>' +
          '</div></div>' +
          '<div class="qcd-toolbar">' +
            '<div class="qcd-toolbar-left"><div class="qcd-tree-select" id="qcdTreeSelect"></div></div>' +
            '<div class="qcd-toolbar-right">' +
              '<button class="qcd-btn" id="qcdExportExcel"><span class="qcd-btn-icon">⤓</span>导出Excel</button>' +
              '<button class="qcd-btn qcd-btn-primary" id="qcdExportDetail"><span class="qcd-btn-icon">⤓</span>导出质检明细</button>' +
            '</div>' +
          '</div>' +
          '<div id="qcdTableBody"></div>' +
        '</div>' +
      '</div>';

    // 初始化筛选值
    var p = qcdState.params;
    var dS = page.querySelector('#qcdDateStart'), dE = page.querySelector('#qcdDateEnd');
    dS.value = p.dateRange ? p.dateRange[0] : '';
    dE.value = p.dateRange ? p.dateRange[1] : '';
    page.querySelector('#qcdDurMin').value = p.durationMin;
    page.querySelector('#qcdDurMax').value = p.durationMax;
    page.querySelector('#qcdComplete').value = p.completeFlag;
    page.querySelector('#qcdScoreMin').value = p.scoreMin;
    page.querySelector('#qcdScoreMax').value = p.scoreMax;
    page.querySelector('#qcdExcellent').value = p.excellentCaseFlag;
    page.querySelector('#qcdClueId').value = p.hdClueId;
    page.querySelector('#qcdSeries').value = p.carSeries;
    page.querySelector('#qcdEnabled').value = p.inspectionEnable;
    page.querySelector('#qcdLevel').value = p.qcLevel;

    // 坐席多选
    qcdRenderSeatSelect(page);
    page.querySelector('#qcdSeatSelect').addEventListener('click', function () {
      qcdOpenSeatDropdown(page, this);
    });
    // 细项树选择器
    qcdRenderTreeSelect(page);
    page.querySelector('#qcdTreeSelect').addEventListener('click', function () {
      qcdOpenTreeDropdown(page, this);
    });
    // 查询
    page.querySelector('#qcdQueryBtn').addEventListener('click', function () {
      var durMin = page.querySelector('#qcdDurMin').value;
      var durMax = page.querySelector('#qcdDurMax').value;
      if (durMin !== '' && durMax !== '' && Number(durMin) > Number(durMax)) {
        qcdToast('通话时长最小值不能大于最大值', 'warn');
        return;
      }
      var sMin = page.querySelector('#qcdScoreMin').value;
      var sMax = page.querySelector('#qcdScoreMax').value;
      if (sMin !== '' && sMax !== '' && Number(sMin) > Number(sMax)) {
        qcdToast('质检总分最小值不能大于最大值', 'warn');
        return;
      }
      qcdState.params.dateRange = dS.value && dE.value ? [dS.value, dE.value] : (dS.value || dE.value ? [dS.value || dE.value, dE.value || dS.value] : null);
      qcdState.params.durationMin = durMin;
      qcdState.params.durationMax = durMax;
      qcdState.params.completeFlag = page.querySelector('#qcdComplete').value;
      qcdState.params.scoreMin = sMin;
      qcdState.params.scoreMax = sMax;
      qcdState.params.excellentCaseFlag = page.querySelector('#qcdExcellent').value;
      qcdState.params.hdClueId = page.querySelector('#qcdClueId').value.trim();
      qcdState.params.carSeries = page.querySelector('#qcdSeries').value;
      qcdState.params.inspectionEnable = page.querySelector('#qcdEnabled').value;
      qcdState.params.qcLevel = page.querySelector('#qcdLevel').value;
      qcdState.page = 1;
      qcdRenderTable(page);
    });
    // 重置（对齐生产：日期回今天 + 清空细项）
    page.querySelector('#qcdResetBtn').addEventListener('click', function () {
      var today = qcdFmtDate(new Date());
      qcdState.params = {
        seatIds: [], dateRange: [today, today],
        durationMin: '', durationMax: '', completeFlag: '',
        scoreMin: '', scoreMax: '', excellentCaseFlag: '',
        hdClueId: '', carSeries: '', inspectionEnable: '', qcLevel: ''
      };
      qcdState.selectedItems = [];
      qcdState.page = 1;
      dS.value = today; dE.value = today;
      page.querySelector('#qcdDurMin').value = '';
      page.querySelector('#qcdDurMax').value = '';
      page.querySelector('#qcdComplete').value = '';
      page.querySelector('#qcdScoreMin').value = '';
      page.querySelector('#qcdScoreMax').value = '';
      page.querySelector('#qcdExcellent').value = '';
      page.querySelector('#qcdClueId').value = '';
      page.querySelector('#qcdSeries').value = '';
      page.querySelector('#qcdEnabled').value = '';
      page.querySelector('#qcdLevel').value = '';
      qcdRenderSeatSelect(page);
      qcdRenderTreeSelect(page);
      qcdRenderTable(page);
    });
    // 导出（纯静态模拟）
    page.querySelector('#qcdExportExcel').addEventListener('click', function () {
      qcdToast('导出成功，文件已开始下载');
    });
    page.querySelector('#qcdExportDetail').addEventListener('click', function () {
      qcdToast('导出成功，文件已开始下载');
    });

    qcdRenderTable(page);
  }

  // ==================== 抽屉样式（Tabs/合规红线/Switch，对齐 32 体系，qcd 前缀独立注入） ====================
  function qcdEnsureDrawerStyles() {
    if (document.getElementById('qcdDrawerStyles')) return;
    var css = [
      '.qcd-modal-tabs{display:flex;align-items:center;gap:32px;border-bottom:1px solid #f0f0f0;margin-bottom:10px;}',
      '.qcd-modal-tab{position:relative;padding:12px 0;font-size:14px;line-height:20px;color:rgba(0,0,0,0.88);cursor:pointer;background:none;border:none;font-family:inherit;}',
      '.qcd-modal-tab:hover{color:#1677ff;}',
      '.qcd-modal-tab.qcd-modal-tab-active{color:#1677ff;font-weight:600;}',
      '.qcd-modal-tab.qcd-modal-tab-active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:#1677ff;}',
      '.qcd-switch{display:inline-flex;align-items:center;height:22px;min-width:44px;padding:0 4px;border-radius:11px;background:rgba(0,0,0,0.25);cursor:pointer;transition:all .2s;position:relative;color:#fff;font-size:12px;user-select:none;justify-content:flex-end;white-space:nowrap;}',
      '.qcd-switch.qcd-switch-on{background:#1677ff;justify-content:flex-start;}',
      '.qcd-switch .qcd-switch-handle{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:all .2s;}',
      '.qcd-switch.qcd-switch-on .qcd-switch-handle{left:calc(100% - 20px);}',
      '.qcd-switch.qcd-switch-disabled{cursor:not-allowed;opacity:.45;}',
      '.qcd-switch-sm{height:16px;min-width:40px;border-radius:8px;font-size:10px;padding:0 3px;}',
      '.qcd-switch-sm .qcd-switch-handle{width:12px;height:12px;}',
      '.qcd-switch-sm.qcd-switch-on .qcd-switch-handle{left:calc(100% - 14px);}',
      /* 合规红线 */
      '.qcd-cmp{background:#ffffff;border:1px solid #e6e6e6;border-radius:12px;overflow:hidden;}',
      '.qcd-cmp-head{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #e6e6e6;cursor:pointer;user-select:none;}',
      '.qcd-cmp-title{flex:1 1;color:#262626;font-size:18px;font-weight:700;line-height:24px;}',
      '.qcd-cmp-appeal{color:#1c69d4;font-size:14px;font-weight:700;line-height:22px;}',
      '.qcd-panel{border-bottom:1px solid #e6e6e6;}',
      '.qcd-panel:last-child{border-bottom:none;}',
      '.qcd-panel-header{display:flex;align-items:center;gap:8px;padding:16px 24px;cursor:pointer;user-select:none;}',
      '.qcd-panel-title{flex:1 1 auto;color:#262626;font-size:16px;font-weight:700;line-height:22px;}',
      '.qcd-panel-score{color:#dc2626;font-size:13px;font-weight:700;line-height:22px;margin-right:8px;}',
      '.qcd-panel-body{padding:16px 24px;background:#fafafa;}',
      '.qcd-panel-red .qcd-panel-header{background:#fff1f0;}',
      '.qcd-panel-red .qcd-panel-title{color:#dc2626;}',
      '.qcd-panel-red .qcd-panel-body{background:#fff1f0;}',
      '.qcd-icon-red{color:#dc2626;font-size:16px;flex:none;font-style:normal;}',
      '.qcd-icon-warn{color:#f59e0b;font-size:16px;flex:none;font-style:normal;}',
      '.qcd-arrow{color:#9a9a9a;font-size:12px;transition:transform .2s ease;transform:rotate(0deg);margin-left:12px;flex:none;display:inline-block;}',
      '.qcd-arrow-open{transform:rotate(90deg);}',
      '.qcd-red-item{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px dashed #ffccc7;}',
      '.qcd-red-item:last-child{border-bottom:none;padding-bottom:0;}',
      '.qcd-red-num{flex:0 0 16px;width:16px;height:16px;border-radius:9999px;background:#dc2626;color:#ffffff;font-size:10px;font-weight:700;line-height:16px;text-align:center;margin-top:3px;}',
      '.qcd-red-content{flex:1 1 auto;min-width:0;}',
      '.qcd-red-appeal{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding-top:2px;}',
      '.qcd-red-type{color:#262626;font-size:14px;font-weight:700;line-height:22px;}',
      '.qcd-red-evidence{margin-top:4px;color:#dc2626;font-size:14px;font-weight:400;line-height:22px;}',
      '.qcd-tag-danger{display:inline-block;background:#fff1f0;color:#dc2626;border:1px solid #ffccc7;font-weight:700;border-radius:4px;padding:0 7px;font-size:12px;line-height:20px;white-space:nowrap;}',
      '.qcd-text-danger{color:#dc2626;font-weight:400;}',
      '.qcd-text-success{color:#22c55e;font-weight:400;}',
      '.qcd-score-danger{color:#dc2626;font-weight:700;}',
      '.qcd-score-limit{color:#8c8c8c;font-size:13px;white-space:nowrap;}',
      '.qcd-appeal-cell{display:flex;align-items:center;gap:8px;}',
      '.qcd-status-pending{color:#fa8c16;font-size:13px;font-weight:500;white-space:nowrap;}',
      '.qcd-status-pass{color:#00ce86;font-size:13px;font-weight:500;white-space:nowrap;}',
      '.qcd-status-reject{color:#dc2626;font-size:13px;font-weight:500;white-space:nowrap;}',
      '.qcd-cmp-table{width:100%;border-collapse:collapse;font-size:14px;background:transparent;}',
      '.qcd-cmp-table th{background:transparent;color:#6b6b6b;font-weight:400;font-size:13px;letter-spacing:0;border-bottom:1px solid #e6e6e6;padding:10px 12px;text-align:left;white-space:nowrap;}',
      '.qcd-cmp-table td{background:transparent;color:#3c3c3c;border-bottom:1px solid #f0f0f0;padding:12px;line-height:22px;text-align:left;}',
      '.qcd-cmp-table tbody tr:last-child td{border-bottom:none;}',
      '.qcd-cmp-table tbody tr:hover td{background:#f7f7f7;}',
      /* 抽屉内 qrn-card 容器基础样式（同 32，仅作用于明细抽屉） */
      '.qcd-audit .qrn-card{background:#fff;border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;box-shadow:0 2px 6px 0 rgba(0,0,0,0.05);}',
      '.qcd-audit .qrn-card .qrn-card-head{background:rgba(0,0,0,0.02);}',
      '.qcd-audit .qrn-card-body{padding:16px;}'
    ];
    var el = document.createElement('style');
    el.id = 'qcdDrawerStyles';
    el.textContent = css.join('\n');
    document.head.appendChild(el);
  }

  // ==================== Switch HTML ====================
  function qcdSwitchHtml(small, on, text, attrs, disabled) {
    return '<span class="qcd-switch' + (small ? ' qcd-switch-sm' : '') + (on ? ' qcd-switch-on' : '') +
      (disabled ? ' qcd-switch-disabled' : '') + '"' + (attrs || '') + '><span class="qcd-switch-handle"></span>' + text + '</span>';
  }

  // ==================== 合规红线数据（appeal 发起视角：多数未申诉，部分申诉中/已处理） ====================
  var qcdRedLineTypes = ['辱骂或贬低客户', '向客户承诺不确定权益', '泄露其他客户信息', '诱导客户提供虚假信息'];
  var qcdRedEvidences = ['这个价格我私下再给您申请额外的礼品', '您放心，别人拿不到这个折扣', '上一个客户也是这种情况我都给办了', '您先随便填个信息，其他我来处理'];
  var qcdForbiddenCats = ['绝对化用语', '贬低竞品用语', '夸大宣传', '违规承诺收益'];
  var qcdForbiddenWords = ['全网最低', '没有之一', '绝对超值', '百分之百省钱', '肯定没问题', '秒杀同级'];
  var qcdForbiddenCtx = ['咱们这个价格是全网最低的，您现在不订就亏了', '这个配置同级别没有之一，遥遥领先', '现在下订绝对超值，闭眼买就行', '跟着我买这台车百分之百省钱', '您走我的渠道肯定没问题，包在我身上'];
  var qcdProductModels = ['N7', 'ARION', '天籁', '探陆', '轩逸'];
  var qcdProductItems = ['续航里程', '快充时间', '整车质保', '置换补贴', '电机功率'];
  var qcdProductCorrects = ['CLTC 635km', '30分钟30%-80%', '整车6年/15万公里', '至高15000元', '200kW'];
  var qcdProductAnswers = ['CLTC 700km', '20分钟充满', '终身质保', '至高30000元', '350kW'];
  var qcdDispatchItems = ['权益告知确认', '风险提示告知', '客户信息核实'];

  function qcdCmpStatus(seed) {
    // 发起方视角：55% 未申诉可申诉，20% 申诉中，15% 已通过，10% 已驳回
    var r = qcdRnd(seed);
    return r < 0.55 ? 0 : (r < 0.75 ? 1 : (r < 0.9 ? 2 : 3));
  }

  function qcdBuildCompliance(seedKey) {
    var d = { redLines: [], forbiddenWords: [], productKnowledge: [], violationDispatch: [], appealedCount: 0 };
    var i, s, st;
    var redN = qcdInt(seedKey + '_rn', 0, 2);
    for (i = 0; i < redN; i++) {
      s = seedKey + '_r' + i;
      st = qcdCmpStatus(s + '_st');
      d.redLines.push({
        detailId: 'RL' + (9500 + i), id: i + 1,
        type: qcdRedLineTypes[qcdPick(s + '_t', qcdRedLineTypes.length)],
        evidence: qcdRedEvidences[qcdPick(s + '_e', qcdRedEvidences.length)],
        appealStatus: st, canAppeal: st === 0 || st === 3
      });
    }
    var fbN = qcdInt(seedKey + '_fn', 0, 3);
    for (i = 0; i < fbN; i++) {
      s = seedKey + '_f' + i;
      var wIdx = qcdPick(s + '_w', qcdForbiddenWords.length);
      st = qcdCmpStatus(s + '_st');
      d.forbiddenWords.push({
        detailId: 'FW' + (9600 + i),
        category: qcdForbiddenCats[qcdPick(s + '_c', qcdForbiddenCats.length)],
        keyword: qcdForbiddenWords[wIdx],
        time: ('0' + qcdInt(s + '_h', 0, 2)).slice(-2) + ':' + ('0' + qcdInt(s + '_m', 10, 58)).slice(-2),
        context: qcdForbiddenCtx[wIdx],
        score: qcdInt(s + '_sc', 1, 5),
        deductLimit: qcdInt(s + '_dl', 10, 20),
        appealStatus: st, canAppeal: st === 0 || st === 3
      });
    }
    var pkN = qcdInt(seedKey + '_pn', 0, 2);
    for (i = 0; i < pkN; i++) {
      s = seedKey + '_p' + i;
      var itIdx = qcdPick(s + '_it', qcdProductItems.length);
      st = qcdCmpStatus(s + '_st');
      d.productKnowledge.push({
        detailId: 'PK' + (9700 + i),
        model: qcdProductModels[qcdPick(s + '_m', qcdProductModels.length)],
        item: qcdProductItems[itIdx],
        correct: qcdProductCorrects[itIdx],
        answer: qcdProductAnswers[itIdx],
        score: qcdInt(s + '_sc', 1, 3),
        appealStatus: st, canAppeal: st === 0 || st === 3
      });
    }
    var dpN = qcdInt(seedKey + '_dn', 0, 2);
    for (i = 0; i < dpN; i++) {
      s = seedKey + '_d' + i;
      st = qcdCmpStatus(s + '_st');
      d.violationDispatch.push({
        detailId: 'VD' + (9800 + i),
        item: qcdDispatchItems[qcdPick(s + '_i', qcdDispatchItems.length)],
        content: '通话中需完成该下发项的标准告知',
        unsatisfied: '坐席未按标准话术完成该项告知',
        result: '未通过',
        appealStatus: st, canAppeal: st === 0 || st === 3
      });
    }
    [].concat(d.redLines, d.forbiddenWords, d.productKnowledge, d.violationDispatch).forEach(function (x) {
      if (x.appealStatus >= 1) d.appealedCount++;
    });
    return d;
  }

  // ==================== 质检得分数据（appeal 发起视角） ====================
  // 基于 31 的 buildScoreAnalyse：扣分细项 canAppeal；种子决定 1-5 个细项申诉中(isAppeal)
  function qcdBuildScore(row) {
    var S = window.qrnAppealShared;
    var sd = JSON.parse(JSON.stringify(S.buildScoreAnalyse(row.seedKey)));
    var targets = [];
    sd.forEach(function (f) {
      f.secondSorts.forEach(function (sec) {
        sec.thirdSorts.forEach(function (t) {
          if (t.deductScore > 0) targets.push(t);
          t.isAppeal = false; t.isAppealFront = false;
          t.lastIsPass = null; t.isPass = t.deductScore === 0 ? true : null; t.isPassFront = false;
        });
      });
    });
    var n = Math.min(qcdInt(row.seedKey + '_ac', 1, 5), targets.length);
    for (var i = 0; i < n; i++) {
      targets[i].isAppeal = true;
    }
    sd.forEach(function (f) {
      var can = 0, inA = 0, ap = 0;
      f.secondSorts.forEach(function (sec) {
        var c2 = 0, i2 = 0, a2 = 0;
        sec.thirdSorts.forEach(function (t) {
          if (t.canAppeal && !t.isAppeal) c2++;
          if (t.isAppeal) i2++;
          if (t.isAppeal) a2++;
        });
        sec.canAppealCount = c2; sec.inAppealCount = i2; sec.appealCount = a2;
        can += c2; inA += i2; ap += a2;
      });
      f.canAppealCount = can; f.inAppealCount = inA; f.appealCount = ap;
    });
    return sd;
  }

  // ==================== 基础信息行（对话标签 Tab 左栏） ====================
  function qcdBuildBaseRow(row) {
    var sk = row.seedKey + '_base';
    var clueSources = ['直播线索', '官网表单', '活动留资', '企微咨询', '电话咨询'];
    var clueTypes = ['首次咨询', '再次咨询', '试驾预约', '订单线索'];
    var tel = '138' + String(qcdInt(sk + '_tel', 1000, 9999));
    var ad = new Date(row.callTime.replace(/-/g, '/'));
    var firstD = new Date(ad.getTime() - qcdInt(sk + '_fd', 3, 20) * 86400000);
    var lastD = new Date(ad.getTime() - qcdInt(sk + '_ld', 0, 2) * 86400000);
    return {
      hdClueId: row.hdClueId,
      custName: ['王先生', '李女士', '陈先生', '刘女士', '杨先生', '赵女士', '黄先生', '周女士'][qcdPick(sk + '_cn', 8)],
      custTel: tel,
      clueType: clueTypes[qcdPick(sk + '_ct', clueTypes.length)],
      clueSource: clueSources[qcdPick(sk + '_cs', clueSources.length)],
      rchannelName: 'R' + qcdInt(sk + '_rc', 100, 999),
      seriesName: row.carSeries, seatName: row.seatName,
      followTimes: qcdInt(sk + '_ft', 1, 6),
      callDuration: Math.floor(row.callDuration / 60) + '分' + (row.callDuration % 60) + '秒',
      firstReviewTime: qcdFmtDateTime(firstD),
      lastReviewTime: qcdFmtDateTime(lastD)
    };
  }

  // ==================== 回访记录（appeal 模式徽标 inAppealCount） ====================
  function qcdBuildRecords(row) {
    var S = window.qrnAppealShared;
    var recs = JSON.parse(JSON.stringify(S.buildReviewRecords(row.seedKey, row)));
    recs.forEach(function (r) {
      r.inAppealCount = r.calls.reduce(function (a, c) { return a + (c.inAppealCount || 0); }, 0);
      r.canAppealCount = r.calls.reduce(function (a, c) { return a + (c.canAppealCount || 0); }, 0);
    });
    return recs;
  }

  // ==================== VideoComponent HTML（inAppealCount 徽标） ====================
  function qcdVideoHtml(ctx) {
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

  // ==================== 客服规范表格（appeal 模式：canAppeal 细项「申诉」开关） ====================
  function qcdTableStatus(t) {
    if (t.isAppeal && !t.isAppealFront) return { text: '申诉中', color: '#D92D21' };
    if (!t.isAppeal && t.lastIsPass === false && !t.isPassFront) return { text: '审核不通过', color: '#D92D21' };
    if (!t.isAppeal && t.lastIsPass === true && !t.isPassFront) return { text: '审核通过', color: '#00CE86' };
    return null;
  }

  function qcdTableHtml(ctx) {
    var sd = ctx.scoreAnalyse;
    var totalAppeal = sd.reduce(function (a, f) { return a + f.appealCount; }, 0);
    var totalIn = sd.reduce(function (a, f) { return a + f.inAppealCount; }, 0);
    var useIn = totalIn > 0;
    var cur = sd[ctx.tFirstTab] || sd[0];
    var html = '<div class="qrn-card"><div class="qrn-card-head"><span class="qcd-card-title"> 客服规范</span>' +
      '<span class="qrn-card-extra"><div class="qrn-vc-appeal-count" style="margin-bottom:0">已申诉细项：<span style="font-weight:bold;margin-right:12px">' + totalAppeal + '个</span></div></span></div>';
    html += '<div class="qrn-card-body">';
    html += '<div class="qrn-cardtabs">';
    sd.forEach(function (f, i) {
      var cnt = useIn ? f.inAppealCount : f.appealCount;
      html += '<div class="qrn-cardtabs-item' + (i === ctx.tFirstTab ? ' qrn-cardtabs-active' : '') + '" data-tf="' + i + '">' +
        qcdEsc(f.firstSortName) + (cnt > 0 ? '<span class="qrn-cardtabs-badge">' + cnt + '</span>' : '') + '</div>';
    });
    html += '</div>';
    html += '<div class="qrn-second-tabs-wrap"><div class="qrn-second-tabs-inner">';
    if (cur) {
      cur.secondSorts.forEach(function (sec, j) {
        var cnt = useIn ? sec.inAppealCount : sec.appealCount;
        html += '<div class="qrn-second-tabs-item' + (j === ctx.tSecondTab ? ' qrn-second-active' : '') + '" data-ts="' + j + '">' +
          '<div style="padding-right:4px">' + qcdEsc(sec.secondSortName) + '</div>' +
          (cnt > 0 ? '<div class="qrn-second-tabs-badge">' + cnt + '</div>' : '') + '</div>';
      });
    }
    html += '</div></div>';
    var rows = cur && cur.secondSorts[ctx.tSecondTab] ? cur.secondSorts[ctx.tSecondTab].thirdSorts : [];
    if (rows.length) {
      html += '<table class="qrn-custom-table"><tbody>';
      rows.forEach(function (t) {
        var st = qcdTableStatus(t);
        var statusText = st ? '<span style="color:' + st.color + '">' + st.text + '</span>' : '';
        var sw = '';
        if (t.canAppeal) {
          sw = qcdSwitchHtml(false, t.isAppeal === true, '申诉', ' data-asw="1" data-t="' + t.thirdSortCode + '"');
        }
        html += '<tr class="qrn-ct-row' + (t.canAppeal ? ' qrn-ct-row-error' : '') + '">' +
          '<td class="qrn-ct-col">' + qcdEsc(t.thirdSortName) + '</td>' +
          '<td class="qrn-ct-col" style="width:370px">' + qcdEsc(t.thirdSortDesc) + '</td>' +
          '<td class="qrn-ct-col"><div class="qrn-ct-status">' + statusText +
          (t.triggerShowFlag ? '<span class="qrn-label-trigger">触发</span>' : '<span class="qrn-label-no-trigger">未触发</span>') +
          sw + '</div></td></tr>';
      });
      html += '</tbody></table>';
    } else {
      html += '<div class="qrn-empty">此类目下暂无细项</div>';
    }
    html += '</div></div>';
    return html;
  }

  // ==================== 合规红线（appeal 模式：可申诉项可勾选「申诉」） ====================
  function qcdAppealCellHtml(item, ctx) {
    if (item.appealStatus === 1) {
      return '<div class="qcd-appeal-cell"><span class="qcd-status-pending">申诉中</span></div>';
    }
    if (item.appealStatus === 2) return '<span class="qcd-status-pass">申诉通过</span>';
    var checked = !!ctx.cmpChecked[item.detailId];
    if (item.appealStatus === 3) {
      return '<span class="qcd-status-reject">申诉驳回</span>' +
        qcdSwitchHtml(true, checked, '申诉', item.canAppeal ? ' data-csw="' + item.detailId + '"' : '', !item.canAppeal);
    }
    return '<div class="qcd-appeal-cell">' +
      qcdSwitchHtml(true, checked, '申诉', item.canAppeal ? ' data-csw="' + item.detailId + '"' : '', !item.canAppeal) + '</div>';
  }

  function qcdCmpTableHtml(cols, rows, ctx) {
    if (!rows.length) return '';
    var html = '<table class="qcd-cmp-table"><thead><tr>';
    cols.forEach(function (c) { html += '<th>' + c[0] + '</th>'; });
    html += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr>';
      cols.forEach(function (c) {
        var v = r[c[1]];
        var cell;
        if (c[2] === 'tag') cell = '<span class="qcd-tag-danger">' + qcdEsc(v) + '</span>';
        else if (c[2] === 'danger') cell = '<span class="qcd-text-danger">' + qcdEsc(v) + '</span>';
        else if (c[2] === 'success') cell = '<span class="qcd-text-success">' + qcdEsc(v) + '</span>';
        else if (c[2] === 'score') cell = '<span class="qcd-score-danger">' + qcdEsc(v) + '</span>';
        else if (c[2] === 'limit') cell = '<span class="qcd-score-limit">' + (v != null ? '此类最多扣分 ' + v + '分' : '-') + '</span>';
        else if (c[2] === 'appeal') cell = qcdAppealCellHtml(r, ctx);
        else cell = qcdEsc(v);
        html += '<td>' + cell + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  function qcdPanelHtml(key, red, icon, title, scoreHtml, bodyHtml, collapsed) {
    return '<div class="qcd-panel' + (red ? ' qcd-panel-red' : '') + '">' +
      '<div class="qcd-panel-header" data-cpan="' + key + '">' +
      '<i class="' + (red ? 'qcd-icon-red' : 'qcd-icon-warn') + '">' + icon + '</i>' +
      '<span class="qcd-panel-title">' + title + '</span>' + scoreHtml +
      '<span class="qcd-arrow' + (collapsed ? '' : ' qcd-arrow-open') + '">›</span></div>' +
      (collapsed ? '' : '<div class="qcd-panel-body">' + bodyHtml + '</div>') + '</div>';
  }

  function qcdComplianceHtml(ctx) {
    var d = ctx.compliance;
    var col = ctx.cmpCollapsed;
    var html = '<div class="qcd-cmp">';
    html += '<div class="qcd-cmp-head" data-csec="1"><span class="qcd-cmp-title">合规及红线</span>' +
      '<span class="qcd-cmp-appeal">已申诉项: ' + d.appealedCount + '</span>' +
      '<span class="qcd-arrow' + (col.section ? '' : ' qcd-arrow-open') + '">›</span></div>';
    if (!col.section) {
      var redBody = '';
      d.redLines.forEach(function (item) {
        redBody += '<div class="qcd-red-item">' +
          '<span class="qcd-red-num">' + item.id + '</span>' +
          '<div class="qcd-red-content"><div class="qcd-red-type">' + qcdEsc(item.type) + '</div>' +
          '<div class="qcd-red-evidence">「' + qcdEsc(item.evidence) + '」</div></div>' +
          '<div class="qcd-red-appeal">' + qcdAppealCellHtml(item, ctx) + '</div></div>';
      });
      html += qcdPanelHtml('redLine', true, '!', '触发红线总分为0 (' + d.redLines.length + '项)', '', redBody, col.redLine);
      var fbScore = d.forbiddenWords.reduce(function (a, o) { return a + o.score; }, 0);
      html += qcdPanelHtml('forbidden', false, '!', '外呼服务禁语检测',
        d.forbiddenWords.length > 0 ? '<span class="qcd-panel-score">扣分&nbsp;' + fbScore + '</span>' : '',
        qcdCmpTableHtml([['禁语类别', 'category', 'tag'], ['命中关键词', 'keyword', 'danger'], ['出现时间', 'time'], ['上下文', 'context'], ['扣分', 'score', 'score'], ['扣分上限', 'deductLimit', 'limit'], ['申诉', '', 'appeal']], d.forbiddenWords, ctx),
        col.forbidden);
      var pkScore = d.productKnowledge.reduce(function (a, o) { return a + o.score; }, 0);
      html += qcdPanelHtml('product', false, '!', '产品知识检测',
        d.productKnowledge.length > 0 ? '<span class="qcd-panel-score">扣分&nbsp;' + pkScore + '</span>' : '',
        qcdCmpTableHtml([['车型', 'model', 'tag'], ['检测知识项', 'item', 'danger'], ['正确答案', 'correct', 'success'], ['坐席答案', 'answer', 'danger'], ['扣分', 'score', 'score'], ['申诉', '', 'appeal']], d.productKnowledge, ctx),
        col.product);
      html += qcdPanelHtml('dispatch', false, '!', '违规下发检测',
        d.violationDispatch.length > 0 ? '<span class="qcd-panel-score">总分清零 · 可申诉</span>' : '',
        qcdCmpTableHtml([['下发项', 'item', 'tag'], ['检测内容', 'content'], ['未满足下发内容', 'unsatisfied', 'danger'], ['判定', 'result', 'score'], ['申诉', '', 'appeal']], d.violationDispatch, ctx),
        col.dispatch);
    }
    html += '</div>';
    return html;
  }

  // ==================== 详情抽屉（质检明细详情，appeal 发起模式） ====================
  var qcdDetailCtx = null;

  // 员工质检 Tab：视频→得分公式→雷达→会话记录→合规红线→客服规范
  // （申诉表单仅电销专员角色显示，当前主管角色不渲染）
  function qcdStaffPanelHtml(ctx) {
    var S = window.qrnAppealShared;
    var html = '<div class="qcd-video-slot">' + qcdVideoHtml(ctx) + '</div>';
    html += S.aiFormulaHtml(ctx.formula);
    html += S.aiRadarHtml(ctx);
    html += '<div style="height:20px"></div>';
    html += '<div class="qrn-ai-top"><div class="qrn-ai-right">' +
      S.aiChatHtml(ctx.sentences, '当前通话会话记录', true) + '</div></div>';
    html += '<div style="height:20px"></div>';
    html += '<div id="qcdCmpSlot">' + qcdComplianceHtml(ctx) + '</div>';
    html += '<div style="height:20px"></div>';
    html += '<div id="qcdTableSlot">' + qcdTableHtml(ctx) + '</div>';
    return html;
  }

  // 对话标签 Tab：视频→会话记录（右）+ 基础信息（左）
  function qcdChatPanelHtml(ctx) {
    var S = window.qrnAppealShared;
    var html = '<div class="qcd-video-slot">' + qcdVideoHtml(ctx) + '</div>';
    html += '<div style="height:20px"></div>';
    html += '<div class="qrn-ai-top">' +
      '<div class="qrn-ai-right">' + S.aiChatHtml(ctx.sentences, '会话记录', true) + '</div>' +
      '<div style="flex:20px 0 0"></div>' +
      '<div class="qrn-ai-left">' + S.baseInfoHtml(ctx.baseRow) + '</div>' +
    '</div>';
    return html;
  }

  function qcdRenderDetailBody(drawer) {
    var ctx = qcdDetailCtx;
    if (!ctx) return;
    var S = window.qrnAppealShared;
    var body = drawer.querySelector('#qcdDetailBody');
    var html = '<div class="qcd-modal-tabs">' +
      '<button type="button" class="qcd-modal-tab' + (ctx.drawerTab === 'staff' ? ' qcd-modal-tab-active' : '') + '" data-dt="staff">员工质检</button>' +
      '<button type="button" class="qcd-modal-tab' + (ctx.drawerTab === 'chat' ? ' qcd-modal-tab-active' : '') + '" data-dt="chat">对话标签</button></div>';
    html += '<div id="qcdTabStaff" style="display:' + (ctx.drawerTab === 'staff' ? 'block' : 'none') + '">' + qcdStaffPanelHtml(ctx) + '</div>';
    html += '<div id="qcdTabChat" style="display:' + (ctx.drawerTab === 'chat' ? 'block' : 'none') + '">' + qcdChatPanelHtml(ctx) + '</div>';
    body.innerHTML = html;
    S.drawRadar(body, ctx);
  }

  function qcdRefreshVideoSlots(body) {
    var ctx = qcdDetailCtx;
    body.querySelectorAll('.qcd-video-slot').forEach(function (slot) {
      slot.innerHTML = qcdVideoHtml(ctx);
    });
  }

  function qcdFindThird(ctx, code) {
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

  // 事件绑定（事件委托，区域重渲染后无需重复绑定）
  function qcdBindDetailEvents(drawer) {
    var ctx = qcdDetailCtx;
    var body = drawer.querySelector('#qcdDetailBody');

    body.addEventListener('click', function (e) {
      var el;
      // 顶部双 Tab
      if ((el = e.target.closest('[data-dt]'))) {
        ctx.drawerTab = el.getAttribute('data-dt');
        body.querySelectorAll('.qcd-modal-tab').forEach(function (t) {
          t.classList.toggle('qcd-modal-tab-active', t.getAttribute('data-dt') === ctx.drawerTab);
        });
        body.querySelector('#qcdTabStaff').style.display = ctx.drawerTab === 'staff' ? 'block' : 'none';
        body.querySelector('#qcdTabChat').style.display = ctx.drawerTab === 'chat' ? 'block' : 'none';
        return;
      }
      if ((el = e.target.closest('[data-audio]'))) {
        qcdToast('演示环境无真实录音文件');
        return;
      }
      if ((el = e.target.closest('.qrn-export-button'))) {
        qcdToast('录音文本导出任务已提交（演示）');
        return;
      }
      // 视频组件 一级/二级 tab（两 Tab 内同步）
      if ((el = e.target.closest('[data-ft]'))) {
        ctx.firstTab = +el.getAttribute('data-ft');
        ctx.secondTab = 0;
        ctx.curCalls = ctx.firstTab === -1
          ? ctx.records.reduce(function (a, r) { return a.concat(r.calls); }, [])
          : ctx.records[ctx.firstTab].calls;
        qcdRefreshVideoSlots(body);
        return;
      }
      if ((el = e.target.closest('[data-st]'))) {
        ctx.secondTab = +el.getAttribute('data-st');
        qcdRefreshVideoSlots(body);
        return;
      }
      // 客服规范 一级/二级 tab
      if ((el = e.target.closest('[data-tf]'))) {
        ctx.tFirstTab = +el.getAttribute('data-tf');
        ctx.tSecondTab = 0;
        body.querySelector('#qcdTableSlot').innerHTML = qcdTableHtml(ctx);
        return;
      }
      if ((el = e.target.closest('[data-ts]'))) {
        ctx.tSecondTab = +el.getAttribute('data-ts');
        body.querySelector('#qcdTableSlot').innerHTML = qcdTableHtml(ctx);
        return;
      }
      // 合规红线 折叠
      if ((el = e.target.closest('[data-csec]'))) {
        ctx.cmpCollapsed.section = !ctx.cmpCollapsed.section;
        body.querySelector('#qcdCmpSlot').innerHTML = qcdComplianceHtml(ctx);
        return;
      }
      if ((el = e.target.closest('[data-cpan]'))) {
        var key = el.getAttribute('data-cpan');
        ctx.cmpCollapsed[key] = !ctx.cmpCollapsed[key];
        body.querySelector('#qcdCmpSlot').innerHTML = qcdComplianceHtml(ctx);
        return;
      }
      // 合规红线申诉开关（可申诉项勾选，appeal 模式核心交互）
      if ((el = e.target.closest('[data-csw]'))) {
        var cid = el.getAttribute('data-csw');
        var next = !ctx.cmpChecked[cid];
        ctx.cmpChecked[cid] = next;
        el.classList.toggle('qcd-switch-on', next);
        el.innerHTML = '<span class="qcd-switch-handle"></span>申诉';
        return;
      }
      // 客服规范申诉开关（canAppeal 细项，切换 isAppeal）
      if ((el = e.target.closest('[data-asw]'))) {
        var t = qcdFindThird(ctx, el.getAttribute('data-t'));
        if (t) {
          var next2 = t.isAppeal !== true;
          t.isAppeal = next2;
          t.isAppealFront = true;
          el.classList.toggle('qcd-switch-on', next2);
        }
        return;
      }
    });
  }

  // ==================== 抽屉入口 ====================
  function qcdOpenDetailDrawer(row) {
    var S = window.qrnAppealShared;
    if (!S) { qcdToast('质检看板共享组件未加载', 'error'); return; }
    qcdEnsureDrawerStyles();
    S.ensureStyles();
    var seedKey = row.seedKey;
    var sentences = S.getChatSentences(seedKey).map(function (s, i) {
      s.time = S.chatTime(seedKey, i);
      return s;
    });
    var compliance = qcdBuildCompliance(seedKey);
    var scoreAnalyse = qcdBuildScore(row);
    var ctx = {
      row: row, seedKey: seedKey, sentences: sentences,
      records: qcdBuildRecords(row),
      scoreAnalyse: scoreAnalyse,
      compliance: compliance,
      baseRow: qcdBuildBaseRow(row),
      firstTab: -1, secondTab: 0,
      tFirstTab: 0, tSecondTab: 0,
      drawerTab: 'staff',
      cmpCollapsed: {
        section: false,
        redLine: !compliance.redLines.length,
        forbidden: !compliance.forbiddenWords.length,
        product: !compliance.productKnowledge.length,
        dispatch: !compliance.violationDispatch.length
      },
      cmpChecked: {}
    };
    ctx.formula = S.buildFormula(seedKey, scoreAnalyse);
    ctx.curCalls = ctx.records.reduce(function (a, r) { return a.concat(r.calls); }, []);
    qcdDetailCtx = ctx;
    var drawer = S.openDrawer({
      title: '质检明细详情',
      body: '<div class="qcd-audit" id="qcdDetailBody"></div>'
    });
    qcdRenderDetailBody(drawer);
    qcdBindDetailEvents(drawer);
  }

  // ==================== 模块注册 ====================
  window.renderQualityCheckDetailsPage = renderQualityCheckDetailsPage;
})();
