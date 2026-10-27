// ===== 质检管理模块 - 质检看板（新版，对齐生产 qualityReport 页面） =====
// 页面结构：筛选区（日期快捷/日期/车系/坐席账号）→ 总览卡（头像+3项指标带环比）
//          → 员工质检（雷达图+细项拆解）→ 数据趋势折线图
//          → 员工诊断列表 → 线索诊断列表（详情抽屉 AiAnalysis + 检核弹窗）
// 对齐规则：纯静态原型，确定性伪随机演示数据，不依赖后端 API。
// 主结构对齐生产截图与旧质检看板组件体系（v2 重写，替代 v1 推断版）。

(function () {
  'use strict';


  // ==================== 确定性伪随机工具 ====================
  function qrnRnd(seed) {
    var h = 5381;
    for (var i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) % 100003;
    var x = Math.sin(h + 1) * 10000;
    return x - Math.floor(x);
  }
  function qrnInt(seed, min, max) { return Math.floor(qrnRnd(seed) * (max - min + 1)) + min; }
  function qrnFixed(seed, min, max, digits) { return +(qrnRnd(seed) * (max - min) + min).toFixed(digits == null ? 2 : digits); }

  // ==================== Toast（对齐 antd message） ====================
  function qrnToast(text, type) {
    var old = document.querySelector('.qro-toast');
    if (old) old.remove();
    var el = document.createElement('div');
    el.className = 'qro-toast';
    var color = type === 'warn' ? '#faad14' : type === 'error' ? '#ff4d4f' : '#52c41a';
    el.innerHTML = '<span class="qro-toast-dot" style="background:' + color + '"></span>' + qrnEsc(text);
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2400);
  }

  function qrnEsc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function qrnFmtDate(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function qrnDateRange(days) {
    var end = new Date(); end.setDate(end.getDate() - 1);
    var start = new Date(); start.setDate(start.getDate() - days);
    return [qrnFmtDate(start), qrnFmtDate(end)];
  }

  // ==================== 质检模型（对齐生产截图一级Tab顺序与细项拆解） ====================
  var qrnQualityMode = [
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
        { secondSortCode: 'SS014', secondSortName: '通话礼仪', thirdSorts: [
          { thirdSortCode: 'TS021', thirdSortName: '使用礼貌用语', thirdSortDesc: '通话全程使用您好、请、谢谢等礼貌用语' },
          { thirdSortCode: 'TS022', thirdSortName: '语速适中', thirdSortDesc: '语速平稳适中，不含糊、不急促' }
        ] },
        { secondSortCode: 'SS015', secondSortName: '通话规范', thirdSorts: [
          { thirdSortCode: 'TS023', thirdSortName: '无长时间静音', thirdSortDesc: '通话中未出现10秒以上静音' },
          { thirdSortCode: 'TS024', thirdSortName: '无打断客户', thirdSortDesc: '客户讲话时未强行打断' }
        ] }
      ]
    }
  ];


  // 全部节点扁平列表（含父节点），供树形选择/动态列使用
  function qrnAllModeNodes() {
    var nodes = [];
    qrnQualityMode.forEach(function (first) {
      nodes.push({ value: first.firstSortCode, label: first.firstSortName });
      first.secondSorts.forEach(function (second) {
        nodes.push({ value: second.secondSortCode, label: second.secondSortName });
        second.thirdSorts.forEach(function (third) {
          nodes.push({ value: third.thirdSortCode, label: third.thirdSortName });
        });
      });
    });
    return nodes;
  }

  // 坐席数据（复用排班模块账号体系）
  var qrnSeats = [
    { account: '1005641', name: '张伟' }, { account: '1005642', name: '李娜' },
    { account: '1005643', name: '王强' }, { account: '1005644', name: '刘芳' },
    { account: '1005645', name: '陈明' }, { account: '1005646', name: '赵丽' },
    { account: '1005647', name: '孙鹏' }, { account: '1005648', name: '周婷' }
  ];

  // ==================== 演示数据生成（对齐 API 返回结构） ====================
  // queryQualtyOverview：[{name, score, scorePre, remark}]
  function qrnGetOverview(params) {
    var seed = (params.startTime || '') + (params.endTime || '') + (params.seatIds || '') + (params.seriesCodes || '');
    var defs = [
      { name: '线索总量', remark: '筛选时间内接收到的新增线索总量', base: 30320, digits: 0 },
      { name: '诊断线索总量', remark: '筛选时间内完成AI质检诊断的线索总量', base: 5441, digits: 0 },
      { name: '质检均分', remark: '筛选时间内全部诊断线索的质检总分平均值（满分100分）', base: 69.4, digits: 1 }
    ];
    return defs.map(function (d, i) {
      var v = qrnFixed(seed + '_ov' + i, d.base * 0.85, d.base * 1.12, d.digits);
      var pre = qrnFixed(seed + '_ovpre' + i, -8.5, 12.6, 1);
      return { name: d.name, score: (d.digits === 0 ? Math.round(v) : v), scorePre: pre, remark: d.remark };
    });
  }

  // queryQualtySorce：一级分类 weightedScore → score = weightedScore/firstSortPercent*100
  function qrnGetSorce(params) {
    var seed = (params.startTime || '') + (params.endTime || '') + (params.seatIds || '') + (params.seriesCodes || '');
    return qrnQualityMode.map(function (first) {
      var weighted = qrnFixed(seed + '_sc_' + first.firstSortCode, first.firstSortPercent * 0.62, first.firstSortPercent * 0.97, 2);
      var secondSorts = first.secondSorts.map(function (second) {
        var sw = qrnFixed(seed + '_sc_' + first.firstSortCode + '_' + second.secondSortCode, 0, first.firstSortPercent * 0.55, 2);
        var thirdSorts = second.thirdSorts.map(function (third) {
          var tw = qrnFixed(seed + '_sc_' + third.thirdSortCode, 0, first.firstSortPercent * 0.3, 2);
          var tp = qrnFixed(seed + '_tp_' + third.thirdSortCode, 4, 12, 1);
          return { thirdSortCode: third.thirdSortCode, thirdSortName: third.thirdSortName, thirdSortDesc: third.thirdSortDesc, weightedScore: tw, thirdSortPercent: tp };
        });
        var sp = qrnFixed(seed + '_sp_' + second.secondSortCode, 8, 20, 1);
        return { secondSortCode: second.secondSortCode, secondSortName: second.secondSortName, weightedScore: sw, secondSortPercent: sp, thirdSorts: thirdSorts };
      });
      return {
        firstSortCode: first.firstSortCode, firstSortName: first.firstSortName,
        weightedScore: weighted, firstSortPercent: first.firstSortPercent,
        score: Math.ceil(weighted / first.firstSortPercent * 100 * 100) / 100,
        secondSorts: secondSorts
      };
    });
  }

  // 诊断内容及建议：与总览指标/维度得分联动生成（确定性伪随机）
  function qrnGetDiagnosis(params) {
    var seed = (params.startTime || '') + (params.endTime || '') + (params.seatIds || '') + (params.seriesCodes || '');
    var ov = qrnGetOverview(params);
    var sorce = qrnGetSorce(params);
    var sorted = sorce.slice().sort(function (a, b) { return a.score - b.score; });
    var minDim = sorted[0];
    var saleDim = sorce.find(function (s) { return s.firstSortCode === 'FS001'; }) || sorted[1];

    var lowSecs = minDim.secondSorts.slice().sort(function (a, b) { return a.weightedScore - b.weightedScore; }).slice(0, 2);
    var secA = Math.max(1, Math.round(qrnFixed(seed + '_dg_secA', 1, 3, 0)));
    var secB = Math.max(1, Math.round(qrnFixed(seed + '_dg_secB', secA, secA + 3, 0)));
    var secText = secA === secB ? '得分均仅' + secA + '分' : '得分仅' + secA + '分和' + secB + '分';

    var thirds = [];
    saleDim.secondSorts.forEach(function (sec) { thirds = thirds.concat(sec.thirdSorts || []); });
    var lowThirds = thirds.map(function (t) {
      return { name: t.thirdSortName, score: Math.max(1, Math.round(Math.min(t.weightedScore / t.thirdSortPercent * 100, 100))) };
    }).sort(function (a, b) { return a.score - b.score; }).slice(0, 2);

    var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
    var redTimes = Math.max(1, Math.round(qrnFixed(seed + '_dg_red', 1, 6, 0)));
    var banDeduct = qrnFixed(seed + '_dg_ban', 0.2, 0.5, 1);
    var knowDeduct = Math.round(qrnFixed(seed + '_dg_know', 3, 8, 0));

    var content = '本期诊断线索总量' + fmt(ov[1].score) + '，质检均分' + ov[2].score + '分。质检模型中，' +
      minDim.firstSortName + '维度得分最低，仅' + Math.round(minDim.score) + '分，其中' +
      lowSecs[0].secondSortName + '与' + lowSecs[1].secondSortName + secText +
      '，是当前客服最突出的能力短板。' + saleDim.firstSortName + '维度得分' + Math.round(saleDim.score) + '分。' +
      lowThirds[0].name + '与' + lowThirds[1].name + '得分仅' + lowThirds[0].score + '分和' + lowThirds[1].score +
      '分，严重影响销售线索的转化效率。合规方面，服务禁语均扣' + banDeduct + '分，产品知识均扣' + knowDeduct +
      '分，累计触发红线' + redTimes + '次，暴露出产品知识掌握不足及话术规范性漏洞。';

    var advises = [
      '（1）针对' + minDim.firstSortName + '短板，围绕' + lowSecs[0].secondSortName + '、' + lowSecs[1].secondSortName + '场景开设专项培训课程，结合录音案例每周演练并通关考核；',
      '（2）优化销售引导流程，将' + lowThirds[0].name + '、' + lowThirds[1].name + '设为通话必问项，未触发时实时提醒坐席补充询问；',
      '（3）产品知识每日晨考，错题坐席一对一辅导，考核结果纳入月度绩效；',
      '（4）对累计触发红线' + redTimes + '次的坐席开展合规强化培训，并加强录音抽检复盘。'
    ];
    return { content: content, advises: advises };
  }

  // queryQualtyTrend：[{date, weightedScore, qcConfigDtos}]
  function qrnGetTrend(params, dateType) {
    var seed = (params.startTime || '') + (params.endTime || '') + '_t' + dateType;
    var start = params.startTime ? new Date(params.startTime.replace(/-/g, '/')) : new Date();
    var end = params.endTime ? new Date(params.endTime.replace(/-/g, '/')) : new Date();
    var dates = [];
    if (dateType === 1) {
      var d = new Date(start);
      while (d <= end) {
        dates.push(d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2));
        d.setDate(d.getDate() + 1);
      }
    } else {
      var bucket = dateType === 2 ? 7 : 30;
      var cursor = new Date(start);
      while (cursor <= end) {
        dates.push(cursor.getFullYear() + '-' + ('0' + (cursor.getMonth() + 1)).slice(-2) + (dateType === 2 ? '-' + ('0' + cursor.getDate()).slice(-2) : ''));
        cursor.setDate(cursor.getDate() + bucket);
      }
    }
    return dates.map(function (date) {
      var total = qrnFixed(seed + date + '_total', 72, 95, 2);
      var qcConfigDtos = qrnQualityMode.map(function (first) {
        return {
          firstSortCode: first.firstSortCode, weightedScore: qrnFixed(seed + date + '_' + first.firstSortCode, first.firstSortPercent * 0.6, first.firstSortPercent * 0.97, 2),
          secondSorts: first.secondSorts.map(function (second) {
            return { secondSortCode: second.secondSortCode, weightedScore: qrnFixed(seed + date + '_' + second.secondSortCode, 0, first.firstSortPercent * 0.5, 2), thirdSorts: [] };
          })
        };
      });
      return { date: date, weightedScore: total, qcConfigDtos: qcConfigDtos };
    });
  }

  // queryQualtyStuff：每坐席行数据（对齐可见列）
  function qrnGetStuffRows(params) {
    var seed = (params.startTime || '') + (params.endTime || '') + (params.seatIds || '') + (params.seriesCodes || '');
    var seatFilter = (params.seatIds || '').split(',').filter(Boolean);
    var seats = seatFilter.length ? qrnSeats.filter(function (s) { return seatFilter.indexOf(s.account) >= 0; }) : qrnSeats;
    return seats.map(function (seat) {
      var dial = qrnInt(seed + seat.account + '_dial', 180, 520);
      var conn = Math.round(dial * qrnFixed(seed + seat.account + '_rate', 0.45, 0.82, 2));
      var avgSec = qrnInt(seed + seat.account + '_avg', 45, 260);
      var avgTxt = Math.floor(avgSec / 60) + "'" + ('0' + (avgSec % 60)).slice(-2) + '"';
      var validRate = qrnFixed(seed + seat.account + '_valid', 35, 92, 2) + '%';
      var diag = qrnInt(seed + seat.account + '_diag', Math.round(conn * 0.4), conn);
      var scoreMap = {};
      var total = 0;
      qrnQualityMode.forEach(function (first) {
        scoreMap[first.firstSortCode] = qrnFixed(seed + seat.account + '_s_' + first.firstSortCode, first.firstSortPercent * 0.6, first.firstSortPercent * 0.98, 2);
        total += scoreMap[first.firstSortCode];
        first.secondSorts.forEach(function (second) {
          scoreMap[second.secondSortCode] = qrnFixed(seed + seat.account + '_s_' + second.secondSortCode, 0, first.firstSortPercent * 0.55, 2);
          second.thirdSorts.forEach(function (third) {
            scoreMap[third.thirdSortCode] = qrnFixed(seed + seat.account + '_s_' + third.thirdSortCode, 0, 6, 2);
          });
        });
      });
      return {
        seatName: seat.name, connCount: conn, dialCount: dial, avgDuration: avgTxt,
        validRate: validRate, diagCount: diag, scoreMap: scoreMap, totalScore: total.toFixed(2)
      };
    });
  }

  // 字典（对齐 dictOptPullDownList）
  var qrnSourceDict = [
    { code: 'SRC001', name: '懂车帝' }, { code: 'SRC002', name: '汽车之家' }, { code: 'SRC003', name: '易车网' },
    { code: 'SRC004', name: '抖音' }, { code: 'SRC005', name: '官网留资' }, { code: 'SRC006', name: '垂直媒体' }
  ];
  var qrnSeriesOptions = [
    { value: 'ARIA', label: 'ARIYA艾睿雅' }, { value: 'SYLPHY', label: '轩逸' }, { value: 'QASHQAI', label: '逍客' },
    { value: 'TEANA', label: '天籁' }, { value: 'XTRAIL', label: '奇骏' }, { value: 'PATHFINDER', label: '探陆' }
  ];
  var qrnClueTypes = ['首次咨询', '再次咨询', '试驾预约', '订单线索'];

  // queryQualtyClue：rows + records
  function qrnGetClueRows(params) {
    var seed = (params.startTime || '') + (params.endTime || '') + (params.seatIds || '') + (params.seriesCodes || '');
    var total = 57;
    var list = [];
    for (var i = 0; i < total; i++) {
      var id = 'HD2026' + ('000' + (1000 + i)).slice(-7);
      var seat = qrnSeats[qrnInt(seed + id + '_seat', 0, qrnSeats.length - 1)];
      var series = qrnSeriesOptions[qrnInt(seed + id + '_series', 0, qrnSeriesOptions.length - 1)];
      var follow = qrnInt(seed + id + '_follow', 1, 6);
      var durSec = qrnInt(seed + id + '_dur', 60, 2100);
      var scoreMap = {};
      var t = 0;
      qrnQualityMode.forEach(function (first) {
        scoreMap[first.firstSortCode] = qrnFixed(seed + id + '_s_' + first.firstSortCode, first.firstSortPercent * 0.58, first.firstSortPercent * 0.99, 1);
        t += scoreMap[first.firstSortCode];
        first.secondSorts.forEach(function (second) { scoreMap[second.secondSortCode] = qrnFixed(seed + id + '_s_' + second.secondSortCode, 0, first.firstSortPercent * 0.5, 1); });
      });
      var day1 = qrnInt(seed + id + '_d1', 1, 8);
      var day2 = qrnInt(seed + id + '_d2', 1, 6);
      list.push({
        hdClueId: id,
        custName: ['王先生', '李女士', '张先生', '刘女士', '陈先生', '杨女士', '赵先生', '周女士'][qrnInt(seed + id + '_cust', 0, 7)],
        custTel: '1' + ['35', '36', '37', '38', '39'][qrnInt(seed + id + '_tel1', 0, 4)] + '****' + ('000' + qrnInt(seed + id + '_tel2', 100, 999)).slice(-4),
        clueType: qrnClueTypes[qrnInt(seed + id + '_type', 0, qrnClueTypes.length - 1)],
        clueSource: qrnSourceDict[qrnInt(seed + id + '_src', 0, qrnSourceDict.length - 1)].code,
        rchannelName: ['R1-懂车帝留资', 'R2-汽车之家留资', 'R3-官网表单', 'R4-活动报名'][qrnInt(seed + id + '_rch', 0, 3)],
        seriesName: series.label,
        seatName: seat.name,
        appealCnt: qrnInt(seed + id + '_appeal', 0, 5),
        firstReviewTime: '2026-10-' + ('0' + day1).slice(-2) + ' ' + ('0' + qrnInt(seed + id + '_h1', 9, 18)).slice(-2) + ':' + ('0' + qrnInt(seed + id + '_m1', 0, 59)).slice(-2),
        lastReviewTime: '2026-10-' + ('0' + (day1 + day2)).slice(-2) + ' ' + ('0' + qrnInt(seed + id + '_h2', 9, 20)).slice(-2) + ':' + ('0' + qrnInt(seed + id + '_m2', 0, 59)).slice(-2),
        followTimes: follow,
        callDuration: Math.floor(durSec / 60) + '分' + (durSec % 60) + '秒',
        isCheck: qrnRnd(seed + id + '_chk') > 0.7,
        scoreMap: scoreMap, propertyScoreList: [t.toFixed(1)],
        seedKey: seed + id
      });
    }
    return { rows: list, records: list.length };
  }

  function qrnGetChatSentences(seedKey) {
    var customerAsk = [
      '喂，你好，你们是东风日产的吗？', '这个N7现在有什么优惠活动吗？',
      '纯电的续航能跑多少公里？', '充电要多久能充满？',
      '首付多少可以提车？分期有免息的吗？', '你们店在哪个位置，周末可以试驾吗？',
      '这个价格还能再谈吗？', '好的，那我周末过去看看。'
    ];
    var agentReply = [
      '您好，这里是东风日产NEV专线，我是您的专属顾问小婷，很高兴为您服务。',
      '目前N7上市权益非常给力，下订即享2万元购车礼包，包含充电桩免费安装和终身免费基础保养。',
      'N7搭载73度磷酸铁锂电池，CLTC工况续航635公里，日常通勤一周一充完全没问题。',
      '支持快充，30分钟可以从30%充到80%，慢充的话家用充电桩8小时充满。',
      '首付最低15%起，我们有3年0息的金融方案，具体额度看您的征信情况。',
      '我们店在经开区汽车城东风日产NEV中心，周末试驾需要提前预约，我现在帮您登记一个周六下午的试驾名额好吗？',
      '价格方面您放心，到店我会帮您申请最大的权益组合，保证全网底价。',
      '好的张先生，那我先帮您预约周六下午2点，试驾前一天我会再和您确认，感谢您的来电。'
    ];
    var sentences = [];
    var n = qrnInt(seedKey + '_n', 8, 12);
    for (var i = 0; i < n; i++) {
      var isAgent = i % 2 === 1;
      sentences.push({
        speaker: isAgent ? 'AGENT' : 'CUSTOMER',
        text: isAgent ? agentReply[Math.floor(i / 2) % agentReply.length] : customerAsk[Math.floor(i / 2) % customerAsk.length],
        time: '00:' + (i * 9 + qrnInt(seedKey + '_t' + i, 0, 8) < 10 ? '0' + (i * 9) : (i * 9 + qrnInt(seedKey + '_t' + i, 0, 8)))
      });
    }
    return sentences;
  }

  // 质检结论标签（DescComponent 结构）
  function qrnGetConclusion(seedKey) {
    var pool = [
      { key: '开场白规范', value: '已自报家门并说明来意' },
      { key: '产品讲解', value: '车型参数、权益讲解准确完整' },
      { key: '邀约动作', value: '已主动邀约到店试驾并确认时间' },
      { key: '服务禁语', value: '全程未出现服务禁语' },
      { key: '信息核实', value: '已核实客户意向车型与购车时间' },
      { key: '结束语', value: '礼貌结束并确认后续安排' }
    ];
    var out = [];
    var n = qrnInt(seedKey + '_cn', 4, pool.length);
    for (var i = 0; i < n; i++) out.push(pool[i]);
    return out;
  }

  function qrnTreeSelectCreate(opts) {
    var root = document.createElement('div');
    root.className = 'qro-treeselect';
    root.tabIndex = 0;
    var dropdown = document.createElement('div');
    dropdown.className = 'qro-tree-dropdown';
    dropdown.style.display = 'none';
    var state = {
      values: opts.value || [],           // [{value,label}]
      treeData: opts.treeData || [],
      expanded: {},                        // value -> true
      keyword: '',
      onTagRemove: opts.onTagRemove || null
    };
    state.treeData.forEach(function (n) { state.expanded[n.value] = true; qrnTreeAllChildren(n).forEach(function (c) { state.expanded[c.value] = true; }); });

    function qrnTreeAllChildren(node) {
      var out = [];
      (node.children || []).forEach(function (c) {
        out.push(c);
        out = out.concat(qrnTreeAllChildren(c));
      });
      return out;
    }
    function qrnTreeFind(nodes, value) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].value === value) return nodes[i];
        var hit = qrnTreeFind(nodes[i].children || [], value);
        if (hit) return hit;
      }
      return null;
    }
    function qrnTreeFlatten(nodes) {
      var out = [];
      nodes.forEach(function (n) {
        out.push({ title: n.title, value: n.value });
        out = out.concat(qrnTreeFlatten(n.children || []));
      });
      return out;
    }

    function selectedValues() { return state.values.map(function (v) { return v.value; }); }

    function commitChange(newValues, suppress) {
      state.values = newValues;
      renderTags();
      if (!suppress) opts.onChange(newValues);
    }

    function toggleCheck(value) {
      var has = selectedValues().indexOf(value) >= 0;
      // 全选节点的特殊规则由 opts.onBeforeChange 处理
      var next = state.values.slice();
      if (has) {
        next = next.filter(function (v) { return v.value !== value; });
      } else {
        var node = qrnTreeFind(state.treeData, value);
        if (node) next.push({ value: node.value, label: node.title });
      }
      if (opts.onBeforeChange) {
        var res = opts.onBeforeChange(next, state.values);
        if (res === false) return;
        next = res || next;
      }
      commitChange(next);
    }

    function matchFilter(node, parents) {
      if (!state.keyword) return { show: true, parents: parents };
      var kw = state.keyword.toLowerCase();
      if ((node.title || '').toLowerCase().indexOf(kw) >= 0) return { show: true, parents: parents };
      var childHit = false;
      (node.children || []).forEach(function (c) {
        if (matchFilter(c, parents.concat(node)).show) childHit = true;
      });
      return { show: childHit, parents: parents };
    }

    function renderDropdown() {
      var html = '<input class="qro-tree-search" placeholder="请输入关键字" />';
      html += '<div class="qro-tree-list"></div>';
      dropdown.innerHTML = html;
      var listEl = dropdown.querySelector('.qro-tree-list');
      var sel = selectedValues();

      function renderNodes(nodes, depth) {
        nodes.forEach(function (node) {
          var m = matchFilter(node, []);
          if (!m.show) return;
          var children = node.children || [];
          var hasChildren = children.length > 0;
          var expanded = state.expanded[node.value] !== false;
          if (state.keyword) expanded = true;
          var checked = sel.indexOf(node.value) >= 0;
          var row = document.createElement('div');
          row.className = 'qro-tree-node';
          row.style.paddingLeft = (8 + depth * 18) + 'px';
          row.innerHTML =
            '<span class="qro-tree-switcher">' + (hasChildren ? (expanded ? '▾' : '▸') : '') + '</span>' +
            '<span class="qro-tree-checkbox' + (checked ? ' qro-checked' : '') + '"></span>' +
            '<span class="qro-tree-label" title="' + qrnEsc(node.title) + '">' + qrnEsc(node.title) + '</span>';
          if (hasChildren) {
            row.querySelector('.qro-tree-switcher').addEventListener('click', function (e) {
              e.stopPropagation();
              state.expanded[node.value] = !expanded;
              renderDropdown();
            });
          }
          row.addEventListener('click', function () { toggleCheck(node.value); });
          listEl.appendChild(row);
          if (hasChildren && expanded) renderNodes(children, depth + 1);
        });
      }
      renderNodes(state.treeData, 0);
      dropdown.querySelector('.qro-tree-search').addEventListener('input', function (e) {
        state.keyword = e.target.value.trim();
        renderDropdown();
        var inp = dropdown.querySelector('.qro-tree-search');
        inp.value = state.keyword;
        inp.focus();
      });
    }

    function renderTags() {
      var html = '';
      var vals = state.values;
      if (!vals.length) {
        html = '<span class="qro-placeholder">' + qrnEsc(opts.placeholder || '请选择') + '</span>';
      } else {
        var show = vals.slice(0, 2);
        show.forEach(function (v) {
          html += '<span class="qro-tag" data-v="' + qrnEsc(v.value) + '">' + qrnEsc(v.label) + '<i class="qro-tag-close">×</i></span>';
        });
        if (vals.length > 2) html += '<span class="qro-tag-rest">+' + (vals.length - 2) + '...</span>';
      }
      html += '<span class="qro-arrow">▾</span>';
      root.innerHTML = html;
      root.querySelectorAll('.qro-tag .qro-tag-close').forEach(function (close) {
        close.addEventListener('click', function (e) {
          e.stopPropagation();
          var v = close.parentNode.getAttribute('data-v');
          toggleCheck(v);
        });
      });
    }

    function openDropdown() {
      if (dropdown.style.display !== 'none') return;
      state.keyword = '';
      renderDropdown();
      dropdown.style.display = 'block';
      var rect = root.getBoundingClientRect();
      var top = rect.bottom + 4;
      if (top + 340 > window.innerHeight) top = Math.max(8, rect.top - 324);
      dropdown.style.top = top + 'px';
      dropdown.style.left = Math.min(rect.left, window.innerWidth - 308) + 'px';
      root.classList.add('qro-focused');
      setTimeout(function () { dropdown.querySelector('.qro-tree-search')?.focus(); }, 0);
    }
    function closeDropdown() {
      dropdown.style.display = 'none';
      root.classList.remove('qro-focused');
    }

    root.addEventListener('click', function (e) {
      if (e.target.closest('.qro-tag-close')) return;
      if (dropdown.style.display === 'none') openDropdown(); else closeDropdown();
    });
    document.addEventListener('click', function (e) {
      if (!root.contains(e.target) && !dropdown.contains(e.target)) closeDropdown();
    });

    renderTags();
    return {
      root: root,
      dropdown: dropdown,
      getValues: function () { return state.values.slice(); },
      setValues: function (vals) { commitChange(vals, true); },
      setTreeData: function (treeData) {
        state.treeData = treeData;
        state.treeData.forEach(function (n) { state.expanded[n.value] = true; qrnTreeAllChildren(n).forEach(function (c) { state.expanded[c.value] = true; }); });
        if (dropdown.style.display !== 'none') renderDropdown();
      }
    };
  }

  // 质检模型 → 树数据（全选 + 质检总分 + 模型层级，对齐 convertQualityModeToTreeData）
  function qrnBuildModeTree() {
    var firstChildren = qrnQualityMode.map(function (first) {
      return {
        title: first.firstSortName, value: first.firstSortCode, key: first.firstSortCode,
        children: first.secondSorts.map(function (second) {
          return {
            title: second.secondSortName, value: second.secondSortCode, key: second.secondSortCode,
            children: second.thirdSorts.map(function (third) {
              return { title: third.thirdSortName, value: third.thirdSortCode, key: third.thirdSortCode, children: [] };
            })
          };
        })
      };
    });
    return [
      { title: '全选', value: 'selectAll', key: 'selectAll', children: [] },
      { title: '质检总分', value: '质检总分', key: '质检总分', children: firstChildren }
    ];
  }

  // 全选/必选规则（对齐坐席表/线索表 onChange）
  function qrnTreeGuard(requireTotal) {
    return function (next, prev) {
      var hasSelectAll = next.some(function (i) { return i.value === 'selectAll'; });
      var hadSelectAll = prev.some(function (i) { return i.value === 'selectAll'; });
      if (hasSelectAll && !hadSelectAll) {
        var all = [{ value: 'selectAll', label: '全选' }, { value: '质检总分', label: '质检总分' }];
        qrnTreeFlattenForGuard(qrnBuildModeTree()).forEach(function (n) {
          if (n.value !== 'selectAll' && n.value !== '质检总分') all.push({ value: n.value, label: n.label });
        });
        return all;
      }
      if (!hasSelectAll && hadSelectAll) {
        return [{ value: '质检总分', label: '质检总分' }];
      }
      if (requireTotal && !next.some(function (i) { return i.value === '质检总分'; })) {
        qrnToast('"质检总分"为必选项，不能取消选择', 'warn');
        return false;
      }
      if (next.length === 0) {
        qrnToast('至少需要保留一个诊断项', 'warn');
        return false;
      }
      return next;
    };
  }
  // 折线图版（质检总分非必选）
  function qrnTreeGuardLine() {
    return function (next, prev) {
      var hasSelectAll = next.some(function (i) { return i.value === 'selectAll'; });
      var hadSelectAll = prev.some(function (i) { return i.value === 'selectAll'; });
      if (hasSelectAll && !hadSelectAll) {
        var all = [{ value: 'selectAll', label: '全选' }];
        qrnTreeFlattenForGuard(qrnBuildModeTree()).forEach(function (n) {
          if (n.value !== 'selectAll') all.push({ value: n.value, label: n.label });
        });
        return all;
      }
      if (!hasSelectAll && hadSelectAll) {
        return [{ value: '质检总分', label: '质检总分' }];
      }
      if (next.length === 0) {
        qrnToast('至少需要保留一个诊断项', 'warn');
        return false;
      }
      return next;
    };
  }
  function qrnTreeFlattenForGuard(nodes) {
    var out = [];
    nodes.forEach(function (n) {
      if (n.value !== 'selectAll') out.push({ value: n.value, label: n.title });
      out = out.concat(qrnTreeFlattenForGuard(n.children || []));
    });
    return out;
  }

  // ==================== 原生 canvas 雷达图（对齐 echarts radar 配置） ====================
  function qrnDrawRadar(canvas, indicators, values, opts) {
    opts = opts || {};
    var cssW = canvas.parentNode ? canvas.parentNode.clientWidth || 400 : 400;
    var cssH = opts.height || 320;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var cx = cssW / 2, cy = cssH * 0.55; // center ['50%','55%']
    var radius = Math.min(cssH * 0.55, cssW / 2 - 80) * 0.86; // radius 70% 留出标签空间
    var n = indicators.length;
    if (!n) return;
    var maxV = 100;

    var angle = function (i) { return -Math.PI / 2 + i * 2 * Math.PI / n; };

    // 分割线（4 层）+ 轴线
    ctx.strokeStyle = '#e6e8eb';
    ctx.lineWidth = 1;
    for (var ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var a = angle(i % n);
        var r = radius * ring / 4;
        var x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (var i2 = 0; i2 < n; i2++) {
      var a2 = angle(i2);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(a2), cy + radius * Math.sin(a2));
      ctx.stroke();
    }

    // 数据区域（areaStyle rgba(40,133,255,0.20)）
    ctx.beginPath();
    for (var i3 = 0; i3 <= n; i3++) {
      var idx = i3 % n;
      var a3 = angle(idx);
      var r3 = radius * Math.min(Math.max(values[idx] / maxV, 0), 1);
      var x3 = cx + r3 * Math.cos(a3), y3 = cy + r3 * Math.sin(a3);
      if (i3 === 0) ctx.moveTo(x3, y3); else ctx.lineTo(x3, y3);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(40,133,255,0.20)';
    ctx.fill();
    ctx.strokeStyle = '#2885ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 数据点（itemStyle #2885ff）
    for (var i4 = 0; i4 < n; i4++) {
      var a4 = angle(i4);
      var r4 = radius * Math.min(Math.max(values[i4] / maxV, 0), 1);
      var x4 = cx + r4 * Math.cos(a4), y4 = cy + r4 * Math.sin(a4);
      ctx.beginPath();
      ctx.arc(x4, y4, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#2885ff';
      ctx.fill();
    }

    // 指标名称（两行富文本：分类名 16px bold + "100分" 15px，色 #01123A）
    ctx.textAlign = 'center';
    for (var i5 = 0; i5 < n; i5++) {
      var a5 = angle(i5);
      var lx = cx + (radius + 14) * Math.cos(a5);
      var ly = cy + (radius + 14) * Math.sin(a5);
      ctx.fillStyle = '#01123A';
      ctx.font = 'bold 15px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textBaseline = 'bottom';
      ctx.fillText(indicators[i5].title, lx, ly);
      ctx.font = '14px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(indicators[i5].sub, lx, ly + 2);
    }
  }

  // ==================== 原生 canvas 折线图（对齐 echarts line 配置） ====================
  var QRO_LINE_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
  function qrnDrawLineChart(canvas, xLabels, seriesArr, opts) {
    opts = opts || {};
    var cssW = canvas.parentNode ? canvas.parentNode.clientWidth || 800 : 800;
    var cssH = opts.height || 340;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var padL = 46, padR = 16, padT = 40, padB = 30;
    var plotW = cssW - padL - padR, plotH = cssH - padT - padB;

    // 计算最大值
    var maxV = 0, minV = Infinity;
    seriesArr.forEach(function (s) { s.data.forEach(function (v) { if (v > maxV) maxV = v; if (v < minV) minV = v; }); });
    if (!isFinite(minV)) { minV = 0; maxV = 100; }
    if (maxV === minV) maxV = minV + 10;
    var range = maxV - minV;
    maxV = maxV + range * 0.1;
    minV = Math.max(0, minV - range * 0.1);

    var n = xLabels.length;
    var xAt = function (i) { return padL + (n <= 1 ? plotW / 2 : plotW * i / (n - 1)); };
    var yAt = function (v) { return padT + plotH - plotH * (v - minV) / (maxV - minV); };

    // 网格 + y 轴刻度（5 段）
    ctx.strokeStyle = '#e6e8eb';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.font = '12px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (var g = 0; g <= 5; g++) {
      var gv = minV + (maxV - minV) * g / 5;
      var gy = yAt(gv);
      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(cssW - padR, gy);
      ctx.stroke();
      ctx.fillText(Math.round(gv * 10) / 10, padL - 6, gy);
    }

    // x 轴标签
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var step = Math.ceil(n / Math.max(1, Math.floor(plotW / 80)));
    for (var i = 0; i < n; i += step) {
      ctx.fillText(xLabels[i], xAt(i), padT + plotH + 8);
    }

    // legend 右上（scroll 型，超出省略）
    ctx.textBaseline = 'middle';
    var lx = cssW - padR;
    var legendSlots = Math.max(1, Math.floor((cssW - padL - padR) / 96));
    seriesArr.slice(0, legendSlots).forEach(function (s, si) {
      var color = QRO_LINE_COLORS[si % QRO_LINE_COLORS.length];
      var text = s.name;
      ctx.font = '12px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
      var tw = ctx.measureText(text).width;
      lx -= tw;
      ctx.fillStyle = color;
      ctx.fillRect(lx, padT - 20, 20, 3);
      ctx.fillStyle = '#666';
      ctx.fillText(text, lx + 24, padT - 18);
      lx -= 32;
    });
    if (seriesArr.length > legendSlots) {
      ctx.fillStyle = '#999';
      ctx.fillText('…', lx - 4, padT - 18);
    }

    // 平滑折线（smooth 贝塞尔近似）
    seriesArr.forEach(function (s, si) {
      var color = QRO_LINE_COLORS[si % QRO_LINE_COLORS.length];
      var pts = s.data.map(function (v, i) { return { x: xAt(i), y: yAt(v) }; });
      ctx.beginPath();
      pts.forEach(function (p, i) {
        if (i === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          var prev = pts[i - 1];
          var cxp = (prev.x + p.x) / 2;
          ctx.bezierCurveTo(cxp, prev.y, cxp, p.y, p.x, p.y);
        }
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      pts.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    // hover 竖线 + 浮层
    canvas.onmousemove = function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var idx = Math.round((mx - padL) / (n <= 1 ? 1 : (plotW / (n - 1))));
      if (idx < 0 || idx >= n) { canvas.onmouseout(); return; }
      ctx.clearRect(0, 0, cssW, cssH);
      qrnDrawLineChart(canvas, xLabels, seriesArr, opts);
      var hx = xAt(idx);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(hx, padT);
      ctx.lineTo(hx, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      seriesArr.forEach(function (s, si) {
        var color = QRO_LINE_COLORS[si % QRO_LINE_COLORS.length];
        var py = yAt(s.data[idx]);
        ctx.beginPath();
        ctx.arc(hx, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      // tooltip
      var lines = [xLabels[idx]].concat(seriesArr.map(function (s, si) {
        return QRO_LINE_COLORS[si % QRO_LINE_COLORS.length] + '|' + s.name + ': ' + s.data[idx];
      }));
      ctx.font = '12px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
      var w = 0;
      lines.forEach(function (l) { w = Math.max(w, ctx.measureText(l.split('|')[1] || l).width); });
      w += 28;
      var h = lines.length * 20 + 12;
      var tx = hx + 12, ty = padT + 4;
      if (tx + w > cssW - padR) tx = hx - w - 12;
      ctx.fillStyle = 'rgba(255,255,255,0.96)';
      ctx.strokeStyle = '#e6e8eb';
      qrnRoundRect(ctx, tx, ty, w, h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.textAlign = 'left';
      lines.forEach(function (l, li) {
        if (l.indexOf('|') >= 0) {
          var parts = l.split('|');
          ctx.fillStyle = parts[0];
          ctx.beginPath();
          ctx.arc(tx + 10, ty + 14 + li * 20, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#666';
          ctx.fillText(parts[1], tx + 18, ty + 14 + li * 20);
        } else {
          ctx.fillStyle = 'rgba(0,0,0,0.88)';
          ctx.font = '600 12px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
          ctx.fillText(l, tx + 8, ty + 14);
          ctx.font = '12px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
        }
      });
    };
    canvas.onmouseout = function () {
      qrnDrawLineChart(canvas, xLabels, seriesArr, opts);
    };
  }

  function qrnRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ==================== 样式注入（对齐生产 p__NEV__Sale__NEV__qualityReportOld.chunk.css） ====================
  var QRN_STYLE_ID = 'qrnStylesheet31v2';
  function qrnEnsureStyles() {
    if (document.getElementById(QRN_STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = QRN_STYLE_ID;
    style.textContent = [
      /* 主容器（.main___2iB2C） */
      '.qro-main{padding:24px 20px;background-color:#f0f2f5;min-height:100%;}',
      /* 筛选区（.top___1PrpJ） */
      '.qro-top{margin-bottom:24px;padding:16px 32px;background-color:#fff;border-radius:12px;}',
      '.qro-top .qro-row{display:flex;}',
      '.qro-top .qro-left{flex:1 1;}',
      '.qro-top .qro-form-row{display:flex;flex-wrap:wrap;gap:0 20px;margin-bottom:8px;}',
      '.qro-top .qro-form-item{display:flex;align-items:center;margin-bottom:8px;}',
      '.qro-top .qro-form-label{color:rgba(0,0,0,0.88);font-size:14px;line-height:22px;margin-right:8px;white-space:nowrap;}',
      /* antd 按钮 */
      '.qro-btn{display:inline-flex;align-items:center;justify-content:center;height:32px;padding:4px 15px;font-size:14px;border-radius:6px;border:1px solid #d9d9d9;background:#fff;color:rgba(0,0,0,0.88);cursor:pointer;transition:all .2s;white-space:nowrap;}',
      '.qro-btn:hover{border-color:#2885ff;color:#2885ff;}',
      '.qro-btn-primary{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.qro-btn-primary:hover{background:#4096ff;border-color:#4096ff;color:#fff;}',
      /* antd solid RadioGroup 按钮 */
      '.qro-radio-group{display:inline-flex;}',
      '.qro-radio-btn{padding:0 15px;height:32px;line-height:30px;font-size:14px;border:1px solid #d9d9d9;border-left-width:0;background:#fff;color:rgba(0,0,0,0.88);cursor:pointer;transition:all .2s;white-space:nowrap;}',
      '.qro-radio-btn:first-child{border-left-width:1px;border-radius:6px 0 0 6px;}',
      '.qro-radio-btn:last-child{border-radius:0 6px 6px 0;}',
      '.qro-radio-btn:hover{color:#2885ff;}',
      '.qro-radio-btn.qro-radio-checked{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.qro-radio-btn.qro-radio-checked + .qro-radio-btn{border-left-color:#1677ff;}',
      '.qro-radio-group-sm .qro-radio-btn{height:24px;line-height:22px;padding:0 11px;font-size:13px;border-radius:4px;}',
      '.qro-radio-group-sm .qro-radio-btn:first-child{border-radius:4px 0 0 4px;}',
      '.qro-radio-group-sm .qro-radio-btn:last-child{border-radius:0 4px 4px 0;}',
      /* 日期/下拉输入 */
      '.qro-input{height:32px;padding:4px 11px;font-size:14px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;color:rgba(0,0,0,0.88);outline:none;transition:border-color .2s;}',
      '.qro-input:focus{border-color:#2885ff;box-shadow:0 0 0 2px rgba(40,133,255,0.1);}',
      '.qro-select-multiple{min-height:32px;min-width:200px;padding:2px 4px;display:flex;flex-wrap:wrap;gap:2px;align-items:center;border:1px solid #d9d9d9;border-radius:6px;background:#fff;cursor:pointer;transition:border-color .2s;}',
      '.qro-select-multiple:hover,.qro-select-multiple.qro-focused{border-color:#2885ff;}',
      '.qro-select-multiple .qro-placeholder{color:rgba(0,0,0,0.25);font-size:14px;padding:0 7px;}',
      '.qro-select-multiple .qro-tag{display:inline-flex;align-items:center;max-width:100%;height:24px;padding:0 7px;font-size:12px;background:rgba(0,0,0,0.06);border-radius:4px;color:rgba(0,0,0,0.88);}',
      '.qro-select-multiple .qro-tag .qro-tag-close{margin-left:4px;font-style:normal;color:rgba(0,0,0,0.45);cursor:pointer;}',
      '.qro-select-multiple .qro-tag .qro-tag-close:hover{color:rgba(0,0,0,0.88);}',
      '.qro-select-multiple .qro-tag-rest{height:24px;padding:0 7px;font-size:12px;background:rgba(0,0,0,0.06);border-radius:4px;color:rgba(0,0,0,0.45);}',
      /* 总览区（.overView___2Ltrt） */
      '.qro-overview{margin-bottom:24px;padding:24px 32px;display:grid;grid-template-columns:repeat(4,1fr);grid-gap:24px;min-height:52px;background-color:#fff;border-radius:12px;}',
      '.qro-overview-item{padding:16px;background-color:#f6f8fa;border-radius:4px;}',
      '.qro-overview .qro-info{display:flex;align-items:center;}',
      '.qro-overview .qro-info img{margin-right:16px;width:64px;height:64px;border-radius:50%;object-fit:cover;}',
      '.qro-overview .qro-info .qro-name{font-size:18px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;}',
      '.qro-overview .qro-ov-title{margin-bottom:8px;color:#667085;font-size:12px;display:flex;align-items:center;}',
      '.qro-overview .qro-content{display:flex;align-items:end;justify-content:space-between;}',
      '.qro-overview .qro-num{margin-right:4px;color:#1c2939;font-size:32px;font-weight:500;}',
      '.qro-overview .qro-num-blue{color:#2885ff;background-color:#e2eafb;}',
      '.qro-overview .qro-num-green{color:#019855;background-color:#ecfdf3;}',
      '.qro-overview .qro-text{font-size:12px;}',
      '.qro-overview .qro-percen{margin-left:4px;padding:0 6px;line-height:1.5em;border-radius:2em;}',
      '.qro-diagnosis{padding:16px 24px 20px;}',
      '.qro-diag-quote{margin:0;padding:12px 18px;border-left:3px solid #13c2c2;background:#f5fcfc;border-radius:0 6px 6px 0;color:#3e4c5c;font-size:13px;line-height:2;text-align:justify;}',
      '.qro-diag-advise{margin-top:14px;font-size:13px;line-height:2;}',
      '.qro-diag-advise-title{color:#019855;font-weight:600;}',
      '.qro-diag-advise-item{color:#3e4c5c;padding-left:6px;}',
      /* 白底卡片（.wrap___3gtOC / .wrap___Rz_m7） */
      '.qro-wrap{margin-bottom:24px;background-color:#fff;border-radius:12px;}',
      '.qro-header{padding:0 32px;display:flex;align-items:center;justify-content:space-between;height:56px;border-bottom:1px solid #e8e8e8;}',
      '.qro-header .qro-title{position:relative;padding-left:6px;font-size:16px;font-weight:500;}',
      '.qro-cascader{margin-right:12px;width:300px;}',
      '.qro-table-pad{padding:0 32px 24px;}',
      /* 员工质检 双栏（.row___3Ruxq / .box___8vhpi） */
      '.qro-box-row{display:grid;grid-template-columns:repeat(2,1fr);grid-gap:12px;}',
      '.qro-box{display:flex;flex-direction:column;padding:16px;}',
      '.qro-box .qro-box-title{margin-bottom:12px;font-size:14px;font-weight:500;}',
      '.qro-box .qro-active-tab{font-weight:bold;}',
      '.qro-box .qro-inactive-tab{color:rgba(0,0,0,0.45);cursor:pointer;}',
      '.qro-box .qro-inactive-tab:hover{color:rgba(0,0,0,0.65);}',
      '.qro-box .qro-tabs{margin:12px 0;display:flex;align-items:center;flex-wrap:wrap;}',
      '.qro-box .qro-tabs .qro-tab-split{width:1px;height:14px;background:#d9d9d9;margin:0 12px;}',
      '.qro-box .qro-progress-wrap{flex:1 1;display:flex;flex-direction:column;justify-content:center;}',
      '.qro-box .qro-progress{margin-bottom:22px;display:flex;align-items:center;}',
      '.qro-box .qro-progress:last-child{margin-bottom:0;}',
      '.qro-box .qro-progress-title{margin-right:10px;flex:none;width:148px;text-align:right;font-size:12px;}',
      '.qro-progress-bar{flex:1;height:12px;background:rgba(0,0,0,0.06);border-radius:6px;overflow:hidden;position:relative;}',
      '.qro-progress-inner{height:100%;background:#1677ff;border-radius:6px;transition:width .3s;}',
      '.qro-progress-text{position:absolute;right:8px;top:0;line-height:12px;font-size:12px;color:rgba(0,0,0,0.88);}',
      /* 折线图容器（.chartWrap___El5OG） */
      '.qro-chart-wrap{width:100%;height:392px;padding:12px;margin:0 0 20px;position:relative;}',
      /* 表格（antd Table middle 对齐） */
      '.qro-grid-table{width:100%;border-collapse:collapse;font-size:14px;}',
      '.qro-grid-table th{background:#fafafa;padding:12px 16px;text-align:left;font-weight:600;color:rgba(0,0,0,0.88);border-bottom:1px solid #f0f0f0;white-space:nowrap;position:relative;}',
      '.qro-grid-table th .qro-sorter{display:inline-flex;flex-direction:column;margin-left:4px;cursor:pointer;vertical-align:middle;}',
      '.qro-grid-table th .qro-sorter i{border-left:4px solid transparent;border-right:4px solid transparent;display:block;width:0;height:0;}',
      '.qro-grid-table th .qro-sorter i.up{border-bottom:5px solid #bfbfbf;margin-bottom:2px;}',
      '.qro-grid-table th .qro-sorter i.down{border-top:5px solid #bfbfbf;margin-top:2px;}',
      '.qro-grid-table th .qro-sorter.on i.up{border-bottom-color:#1677ff;}',
      '.qro-grid-table th .qro-sorter.on i.down{border-top-color:#1677ff;}',
      '.qro-grid-table td{padding:12px 16px;border-bottom:1px solid #f0f0f0;color:rgba(0,0,0,0.88);white-space:nowrap;}',
      '.qro-grid-table tbody tr:hover td{background:#fafafa;}',
      '.qro-table-scroll{overflow:auto;}',
      '.qro-cell-blue{color:#1677ff;font-weight:bold;}',
      '.qro-link{color:#1677ff;cursor:pointer;background:none;border:none;padding:0;font-size:14px;margin-right:8px;}',
      '.qro-link:hover{color:#4096ff;}',
      '.qro-link-btn{display:inline-flex;align-items:center;color:#1677ff;cursor:pointer;background:none;border:none;font-size:14px;padding:4px 8px;}',
      '.qro-link-btn:hover{color:#4096ff;}',
      '.qro-link-btn svg{margin-right:4px;}',
      /* 分页（antd 风格） */
      '.qro-pagination{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:16px 0 0;font-size:14px;color:rgba(0,0,0,0.88);}',
      '.qro-pagination .qro-page-btn{min-width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #d9d9d9;border-radius:6px;background:#fff;cursor:pointer;padding:0 8px;}',
      '.qro-pagination .qro-page-btn:hover{color:#2885ff;border-color:#2885ff;}',
      '.qro-pagination .qro-page-btn.qro-page-active{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.qro-pagination .qro-page-btn:disabled{color:rgba(0,0,0,0.25);cursor:not-allowed;background:#fff;border-color:#d9d9d9;}',
      '.qro-pagination select{height:32px;border:1px solid #d9d9d9;border-radius:6px;padding:0 8px;font-size:14px;background:#fff;}',
      /* 树形选择器（TreeSelect 对齐） */
      '.qro-treeselect{position:relative;display:inline-flex;align-items:center;min-height:32px;width:300px;padding:1px 4px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;cursor:pointer;flex-wrap:wrap;gap:2px;transition:border-color .2s;font-size:14px;}',
      '.qro-treeselect:hover{border-color:#2885ff;}',
      '.qro-treeselect.qro-focused{border-color:#2885ff;box-shadow:0 0 0 2px rgba(40,133,255,0.1);}',
      '.qro-treeselect .qro-placeholder{color:rgba(0,0,0,0.25);padding:0 7px;}',
      '.qro-treeselect .qro-tag{display:inline-flex;align-items:center;max-width:120px;height:22px;padding:0 7px;font-size:12px;background:rgba(0,0,0,0.06);border-radius:4px;}',
      '.qro-treeselect .qro-tag-rest{height:22px;padding:0 7px;font-size:12px;background:rgba(0,0,0,0.06);border-radius:4px;color:rgba(0,0,0,0.45);}',
      '.qro-treeselect .qro-arrow{margin-left:auto;color:rgba(0,0,0,0.25);padding:0 7px;}',
      '.qro-tree-dropdown{position:fixed;z-index:11000;width:300px;max-width:300px;background:#fff;border-radius:8px;box-shadow:0 6px 16px 0 rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:4px;max-height:320px;overflow:auto;font-size:14px;}',
      '.qro-tree-search{width:calc(100% - 4px);height:28px;margin:2px 0 6px;padding:0 7px;border:1px solid #d9d9d9;border-radius:4px;outline:none;font-size:14px;box-sizing:border-box;}',
      '.qro-tree-node{display:flex;align-items:center;height:30px;padding:0 8px;cursor:pointer;border-radius:4px;user-select:none;}',
      '.qro-tree-node:hover{background:rgba(0,0,0,0.03);}',
      '.qro-tree-node .qro-tree-switcher{width:16px;color:rgba(0,0,0,0.45);font-size:10px;flex:none;display:inline-flex;justify-content:center;}',
      '.qro-tree-checkbox{width:16px;height:16px;border:1px solid #d9d9d9;border-radius:4px;margin-right:8px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:#fff;transition:all .2s;}',
      '.qro-tree-checkbox.qro-checked{background:#1677ff;border-color:#1677ff;}',
      '.qro-tree-checkbox.qro-checked::after{content:"";width:5px;height:9px;border:solid #fff;border-width:0 1.5px 1.5px 0;transform:rotate(45deg);margin-top:-2px;}',
      '.qro-tree-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      /* 详情抽屉 / 检核抽屉（antd Drawer） */
      '.qro-drawer-mask{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.45);}',
      '.qro-drawer{position:fixed;top:0;right:0;bottom:0;z-index:10001;background:#fff;box-shadow:-6px 0 16px rgba(0,0,0,0.08);display:flex;flex-direction:column;animation:qrnDrawerIn .25s ease;}',
      '@keyframes qrnDrawerIn{from{transform:translateX(100%);}to{transform:translateX(0);}}',
      '.qro-drawer-header{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:16px;color:rgba(0,0,0,0.88);}',
      '.qro-drawer-close{background:none;border:none;font-size:16px;cursor:pointer;color:rgba(0,0,0,0.45);padding:4px;line-height:1;}',
      '.qro-drawer-close:hover{color:rgba(0,0,0,0.88);}',
      '.qro-drawer-body{flex:1;overflow:auto;padding:16px 24px;background:#fff;}',
      '.qro-drawer-footer{padding:10px 16px;border-top:1px solid #f0f0f0;text-align:right;background:#fff;}',
      /* AiAnalysis 内部（.main___DFSdz 等，对齐共享 chunk） */
      '.qro-ai-chat-main{overflow:auto;height:418px;font-size:0;padding:25px 20px 20px 20px;background:#ebedf0;border-radius:8px;}',
      '.qro-sales-wrap{display:flex;text-align:right;align-items:flex-start;padding-left:40px;justify-content:flex-end;margin-left:40px;}',
      '.qro-customer-wrap{display:flex;text-align:right;align-items:flex-start;justify-content:flex-start;margin-right:40px;}',
      '.qro-sales-text-wrap{display:inline-flex;flex:1 0;justify-content:flex-end;margin-right:10px;flex-direction:column;align-items:flex-end;}',
      '.qro-sales-text-inner{display:inline-flex;padding:6px 16px;background:#c7e8ff;border-radius:16px 16px 0px 16px;}',
      '.qro-customer-text-wrap{display:inline-flex;flex:1 0;margin-left:10px;flex-direction:column;align-items:flex-start;}',
      '.qro-customer-text-inner{display:inline-flex;padding:6px 16px;background:#ffffff;border:1px solid #ecebeb;border-radius:16px 16px 16px 0px;}',
      '.qro-chat-text{font-size:14px;font-weight:bold;text-align:left;color:#000000;line-height:1.2;}',
      '.qro-icon-sales{width:32px;height:32px;color:#fff;font-size:16px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;background:#4a9cf7;border-radius:8px;flex-shrink:0;flex-grow:0;}',
      '.qro-icon-customer{width:32px;height:32px;color:#fff;font-size:16px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;background:#00ce86;border-radius:8px;flex-shrink:0;flex-grow:0;}',
      '.qro-time-text{font-size:12px;color:#7a7a7a;line-height:14px;}',
      '.qro-export-button{display:flex;align-items:center;font-size:14px;line-height:22px;color:#1890ff;cursor:pointer;}',
      /* 视频组件 tabs（.first-tabs-item / .second-tabs-item） */
      '.qro-vc-wrap{position:relative;background:#ffffff;border-radius:8px;border:1px solid #f0f0f0;box-shadow:0px 2px 6px 0px rgba(0,0,0,0.05);padding:0;margin:20px 0 20px;}',
      '.qro-vc-top{padding:20px 20px 16px 20px;border-bottom:1px solid #ededee;}',
      '.qro-vc-bottom{padding:20px;background:rgba(0,0,0,0.02);}',
      '.qro-vc-appeal-count{display:inline-flex;align-items:center;height:36px;padding:0 24px;background:#fff0e3;border-radius:8px;font-size:14px;color:rgba(1,18,58,0.6);line-height:20px;margin-bottom:15px;}',
      '.qro-first-tabs-inner{display:flex;flex-wrap:wrap;}',
      '.qro-first-tabs-item{position:relative;display:flex;align-items:center;justify-content:center;width:105px;height:36px;font-size:14px;text-align:center;color:#1c1e23;line-height:20px;background:linear-gradient(180deg,#ffffff,#ffffff);border:1px solid #dcdfe6;border-radius:8px;margin-right:15px;margin-bottom:15px;cursor:pointer;}',
      '.qro-first-tabs-item.qro-first-active{color:#2885ff;background:rgba(61,118,240,0.05);border:1px solid #2885ff;}',
      '.qro-first-tabs-item:hover{color:#2885ff;background:rgba(61,118,240,0.05);border:1px solid #2885ff;}',
      '.qro-first-tabs-badge{box-sizing:border-box;position:absolute;top:-11px;right:-11px;display:flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 2px;background:#fff0e3;border:1px solid #ffffff;border-radius:50%;font-size:12px;text-align:center;color:#01123a;line-height:17px;}',
      '.qro-second-tabs-wrap{display:flex;flex-wrap:wrap;margin-bottom:-12px;}',
      '.qro-second-tabs-item{position:relative;display:flex;align-items:center;justify-content:center;padding:6px 12px;font-size:14px;text-align:center;color:#a4a5a7;line-height:20px;border-radius:8px;margin-right:12px;margin-bottom:12px;cursor:pointer;}',
      '.qro-second-tabs-item.qro-second-active{color:#020814;background:rgba(46,48,56,0.05);border-radius:4px;font-weight:bold;}',
      '.qro-second-tabs-item:hover{color:#020814;background:rgba(46,48,56,0.05);border-radius:4px;}',
      '.qro-second-tabs-badge{box-sizing:border-box;position:absolute;top:-9px;right:-9px;display:flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 2px;background:#ff4d4f;border:1px solid #ffffff;border-radius:50%;font-size:12px;text-align:center;color:#fff;line-height:17px;}',
      '.qro-no-ai-tips{display:inline-flex;align-items:center;height:36px;padding:0 24px;background:#fff0e3;border-radius:8px;font-size:14px;color:rgba(1,18,58,0.6);line-height:20px;margin:20px 20px 0px 20px;}',
      /* 得分公式（.scoreFormula___H_bC7） */
      '.qro-score-formula{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:20px 0;padding:16px 24px;background:#fafafa;border:1px solid #e6e6e6;border-radius:12px;font-size:14px;}',
      '.qro-score-formula .qro-sf-label{color:#3c3c3c;font-size:14px;font-weight:400;line-height:22px;white-space:nowrap;}',
      '.qro-score-formula .qro-sf-label-bold{color:#262626;font-size:14px;font-weight:700;line-height:22px;white-space:nowrap;}',
      '.qro-score-formula .qro-sf-value{color:#1c69d4;font-size:16px;font-weight:700;line-height:22px;white-space:nowrap;}',
      '.qro-score-formula .qro-sf-value-danger{color:#dc2626;font-size:16px;font-weight:700;line-height:22px;white-space:nowrap;}',
      '.qro-score-formula .qro-sf-value-total{color:#1c69d4;font-size:18px;font-weight:700;line-height:22px;white-space:nowrap;}',
      '.qro-score-formula .qro-sf-operator{color:#3c3c3c;font-size:14px;line-height:22px;}',
      /* antd Card 简化 */
      '.qro-card{background:#fff;border:1px solid #f0f0f0;border-radius:8px;margin:20px 0;overflow:hidden;}',
      '.qro-card-head{display:flex;align-items:center;justify-content:space-between;min-height:48px;padding:0 16px;font-weight:600;font-size:16px;color:rgba(0,0,0,0.88);border-bottom:1px solid #f0f0f0;}',
      '.qro-card-head .qro-card-extra{font-weight:400;font-size:14px;display:flex;align-items:center;}',
      '.qro-card-head .qro-card-extra .qro-card-extra-num{font-weight:bold;margin-right:12px;}',
      '.qro-card-body{padding:16px;}',
      /* 标签明细（.label___2K0zQ） */
      '.qro-label-group{padding:16px;}',
      '.qro-label-item{display:inline-block;font-size:14px;text-align:center;color:#01123a;line-height:20px;padding:6px 20px;height:32px;background:#f4f9ff;border-radius:4px;box-shadow:0px 2px 6px 0px rgba(0,0,0,0.05);margin:8px;box-sizing:border-box;}',
      /* descriptions（基本信息） */
      '.qro-desc-view{padding:0 16px;}',
      '.qro-desc-title{display:flex;align-items:center;height:36px;padding-left:16px;background:rgba(0,0,0,0.02);border-bottom:1px solid #f1f1f1;font-weight:600;font-size:14px;color:rgba(0,0,0,0.88);}',
      '.qro-desc-item{display:flex;padding:8px 0;border-bottom:1px solid #f1f1f1;font-size:14px;}',
      '.qro-desc-item:last-child{border-bottom:none;}',
      '.qro-desc-item-label{width:120px;color:rgba(0,0,0,0.45);flex:none;}',
      '.qro-desc-item-content{flex:1;color:rgba(0,0,0,0.88);}',
      /* Switch */
      '.qro-switch{display:inline-flex;align-items:center;height:22px;min-width:44px;padding:0 6px 0 2px;border-radius:11px;background:rgba(0,0,0,0.25);cursor:pointer;transition:all .2s;position:relative;justify-content:flex-end;color:#fff;font-size:12px;}',
      '.qro-switch.qro-switch-on{background:#1677ff;}',
      '.qro-switch.qro-switch-on .qro-switch-handle{left:22px;}',
      '.qro-switch .qro-switch-handle{position:absolute;left:2px;top:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:all .2s;}',
      /* 建议（优势✅ / 弱项❌） */
      '.qro-suggest-block{padding:12px 16px;border-radius:8px;font-size:14px;line-height:22px;color:rgba(0,0,0,0.88);}',
      '.qro-suggest-block pre{margin:0;white-space:pre-wrap;font-family:inherit;}',
      /* 表单 */
      '.qro-form-item{display:flex;align-items:flex-start;margin-bottom:16px;}',
      '.qro-form-item .qro-form-label{width:100px;flex:none;text-align:right;padding-right:8px;color:rgba(0,0,0,0.88);font-size:14px;line-height:32px;}',
      '.qro-form-item .qro-form-label.qro-required::before{content:"*";color:#ff4d4f;margin-right:4px;}',
      '.qro-form-item .qro-form-control{flex:1;}',
      '.qro-form-item textarea{width:100%;min-height:88px;padding:4px 11px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;outline:none;resize:vertical;font-family:inherit;box-sizing:border-box;}',
      '.qro-form-item textarea:focus{border-color:#2885ff;}',
      '.qro-form-item input[type=text]{width:100%;height:32px;padding:4px 11px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;outline:none;box-sizing:border-box;}',
      '.qro-form-item input[type=text]:focus{border-color:#2885ff;}',
      '.qro-radio-line{display:inline-flex;align-items:center;height:32px;font-size:14px;cursor:pointer;margin-right:24px;}',
      '.qro-radio-line .qro-radio-dot{width:16px;height:16px;border:1px solid #d9d9d9;border-radius:50%;margin-right:8px;position:relative;background:#fff;flex:none;}',
      '.qro-radio-line.qro-radio-checked .qro-radio-dot{border-color:#1677ff;}',
      '.qro-radio-line.qro-radio-checked .qro-radio-dot::after{content:"";position:absolute;left:3px;top:3px;width:8px;height:8px;border-radius:50%;background:#1677ff;}',
      /* 空态 */
      '.qro-empty{padding:32px 0;text-align:center;color:rgba(0,0,0,0.25);font-size:14px;}',
      /* tooltip icon */
      '.qro-tip-icon{display:inline-flex;margin-left:4px;color:rgba(0,0,0,0.45);cursor:help;position:relative;}',
      '.qro-tip-icon:hover .qro-tip-pop{display:block;}',
      '.qro-tip-pop{display:none;position:absolute;top:22px;left:0;z-index:20;max-width:280px;padding:6px 8px;background:rgba(0,0,0,0.85);border-radius:4px;color:#fff;font-size:12px;line-height:20px;white-space:normal;text-align:left;font-weight:400;}',
      /* toast */
      '.qro-toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:12000;padding:9px 16px;background:#fff;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);font-size:14px;color:rgba(0,0,0,0.88);display:flex;align-items:center;}',
      '.qro-toast .qro-toast-dot{width:8px;height:8px;border-radius:50%;margin-right:8px;}',
      /* 线索表格搜索区 */
      '.qro-search-bar{display:flex;flex-wrap:wrap;gap:8px 16px;padding:16px 32px 0;}',
      '.qro-search-bar .qro-search-item{display:flex;align-items:center;font-size:14px;}',
      '.qro-search-bar .qro-search-label{color:rgba(0,0,0,0.88);margin-right:8px;white-space:nowrap;}',
      '.qro-search-bar select{height:32px;min-width:120px;border:1px solid #d9d9d9;border-radius:6px;padding:0 8px;font-size:14px;background:#fff;outline:none;}',
      '.qro-search-bar select:focus{border-color:#2885ff;}',
      /* 响应式 */
      '@media (max-width: 1200px){.qro-overview{grid-template-columns:repeat(2,1fr);}.qro-box-row{grid-template-columns:1fr;}}',
      '@media (max-width: 800px){.qro-overview{grid-template-columns:1fr;padding:16px;}}',
      '.qrn-link{color:#1677ff;cursor:pointer;background:none;border:none;padding:0;font-size:14px;margin-right:8px;}',
      '.qrn-link:hover{color:#4096ff;}',
      '.qrn-drawer{position:fixed;top:0;right:0;bottom:0;z-index:10001;background:#fff;box-shadow:-6px 0 16px rgba(0,0,0,0.08);display:flex;flex-direction:column;animation:qroDrawerIn .25s ease;}',
      '@keyframes qroDrawerIn{from{transform:translateX(100%);}to{transform:translateX(0);}}',
      '.qrn-drawer-header{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:16px;color:rgba(0,0,0,0.88);}',
      '.qrn-drawer-close{background:none;border:none;font-size:16px;cursor:pointer;color:rgba(0,0,0,0.45);padding:4px;line-height:1;}',
      '.qrn-drawer-close:hover{color:rgba(0,0,0,0.88);}',
      '.qrn-drawer-body{flex:1;overflow:auto;padding:16px 24px;background:#fff;}',
      '.qrn-sales-wrap{display:flex;text-align:right;align-items:flex-start;padding-left:40px;justify-content:flex-end;margin-left:40px;}',
      '.qrn-customer-wrap{display:flex;text-align:right;align-items:flex-start;justify-content:flex-start;margin-right:40px;}',
      '.qrn-sales-text-wrap{display:inline-flex;flex:1 0;justify-content:flex-end;margin-right:10px;flex-direction:column;align-items:flex-end;}',
      '.qrn-sales-text-inner{display:inline-flex;padding:6px 16px;background:#c7e8ff;border-radius:16px 16px 0px 16px;}',
      '.qrn-customer-text-wrap{display:inline-flex;flex:1 0;margin-left:10px;flex-direction:column;align-items:flex-start;}',
      '.qrn-customer-text-inner{display:inline-flex;padding:6px 16px;background:#ffffff;border:1px solid #ecebeb;border-radius:16px 16px 16px 0px;}',
      '.qrn-chat-text{font-size:14px;font-weight:bold;text-align:left;color:#000000;line-height:1.2;}',
      '.qrn-icon-sales{width:32px;height:32px;color:#fff;font-size:16px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;background:#4a9cf7;border-radius:8px;flex-shrink:0;flex-grow:0;}',
      '.qrn-icon-customer{width:32px;height:32px;color:#fff;font-size:16px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;background:#00ce86;border-radius:8px;flex-shrink:0;flex-grow:0;}',
      '.qrn-export-button{display:flex;align-items:center;font-size:14px;line-height:22px;color:#1890ff;cursor:pointer;}',
      '.qrn-vc-wrap{position:relative;background:#ffffff;border-radius:8px;border:1px solid #f0f0f0;box-shadow:0px 2px 6px 0px rgba(0,0,0,0.05);padding:0;margin:20px 0 20px;}',
      '.qrn-vc-top{padding:20px 20px 16px 20px;border-bottom:1px solid #ededee;}',
      '.qrn-vc-bottom{padding:20px;background:rgba(0,0,0,0.02);}',
      '.qrn-vc-appeal-count{display:inline-flex;align-items:center;height:36px;padding:0 24px;background:#fff0e3;border-radius:8px;font-size:14px;color:rgba(1,18,58,0.6);line-height:20px;margin-bottom:15px;}',
      '.qrn-first-tabs-inner{display:flex;flex-wrap:wrap;}',
      '.qrn-first-tabs-item{position:relative;display:flex;align-items:center;justify-content:center;width:105px;height:36px;font-size:14px;text-align:center;color:#1c1e23;line-height:20px;background:linear-gradient(180deg,#ffffff,#ffffff);border:1px solid #dcdfe6;border-radius:8px;margin-right:15px;margin-bottom:15px;cursor:pointer;}',
      '.qrn-first-tabs-item.qrn-first-active{color:#2885ff;background:rgba(61,118,240,0.05);border:1px solid #2885ff;}',
      '.qrn-first-tabs-item:hover{color:#2885ff;background:rgba(61,118,240,0.05);border:1px solid #2885ff;}',
      '.qrn-first-tabs-badge{box-sizing:border-box;position:absolute;top:-11px;right:-11px;display:flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 2px;background:#fff0e3;border:1px solid #ffffff;border-radius:50%;font-size:12px;text-align:center;color:#01123a;line-height:17px;}',
      '.qrn-second-tabs-wrap{display:flex;flex-wrap:wrap;margin-bottom:-12px;}',
      '.qrn-second-tabs-item{position:relative;display:flex;align-items:center;justify-content:center;padding:6px 12px;font-size:14px;text-align:center;color:#a4a5a7;line-height:20px;border-radius:8px;margin-right:12px;margin-bottom:12px;cursor:pointer;}',
      '.qrn-second-tabs-item.qrn-second-active{color:#020814;background:rgba(46,48,56,0.05);border-radius:4px;font-weight:bold;}',
      '.qrn-second-tabs-item:hover{color:#020814;background:rgba(46,48,56,0.05);border-radius:4px;}',
      '.qrn-second-tabs-badge{box-sizing:border-box;position:absolute;top:-9px;right:-9px;display:flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 2px;background:#ff4d4f;border:1px solid #ffffff;border-radius:50%;font-size:12px;text-align:center;color:#fff;line-height:17px;}',
      '.qrn-score-formula{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:20px 0;padding:16px 24px;background:#fafafa;border:1px solid #e6e6e6;border-radius:12px;font-size:14px;}',
      '.qrn-score-formula .qrn-sf-label{color:#3c3c3c;font-size:14px;font-weight:400;line-height:22px;white-space:nowrap;}',
      '.qrn-score-formula .qrn-sf-label-bold{color:#262626;font-size:14px;font-weight:700;line-height:22px;white-space:nowrap;}',
      '.qrn-score-formula .qrn-sf-value{color:#1c69d4;font-size:16px;font-weight:700;line-height:22px;white-space:nowrap;}',
      '.qrn-score-formula .qrn-sf-value-danger{color:#dc2626;font-size:16px;font-weight:700;line-height:22px;white-space:nowrap;}',
      '.qrn-score-formula .qrn-sf-value-total{color:#1c69d4;font-size:18px;font-weight:700;line-height:22px;white-space:nowrap;}',
      '.qrn-score-formula .qrn-sf-operator{color:#3c3c3c;font-size:14px;line-height:22px;}',
      '.qrn-card-head{display:flex;align-items:center;justify-content:space-between;min-height:48px;padding:0 16px;font-weight:600;font-size:16px;color:rgba(0,0,0,0.88);border-bottom:1px solid #f0f0f0;}',
      '.qrn-card-head .qrn-card-extra{font-weight:400;font-size:14px;display:flex;align-items:center;}',
      '.qrn-card-head .qrn-card-extra .qrn-card-extra-num{font-weight:bold;margin-right:12px;}',
      '.qrn-empty{padding:32px 0;text-align:center;color:rgba(0,0,0,0.25);font-size:14px;}',
].join('\n');
    document.head.appendChild(style);
  }

  // ==================== 页面状态 ====================
  var qrnState = {
    params: { startTime: '', endTime: '', seatIds: '', seriesCodes: '' },
    dateType: 7,
    curFirstSortCode: '',
    curSecondSortCode: '',
    trendDateType: 1,
    workerValue: [{ value: '质检总分', label: '质检总分' }],
    clueValue: [{ value: '质检总分', label: '质检总分' }],
    workerPage: 1,
    workerPageSize: 10,
    workerSort: null,
    cluePage: 1,
    cluePageSize: 10,
    clueSearch: {},
    clueChecked: {},
    seriesSelected: [],
    seatSelected: []
  };

  // ==================== 页面主渲染 ====================
  function renderQualityReportPage() {
    qrnEnsureStyles();
    var page = document.getElementById('qualityReportPage');
    if (!page) return;
    var initRange = qrnDateRange(7);
    qrnState.params.startTime = initRange[0] + ' 00:00:00';
    qrnState.params.endTime = initRange[1] + ' 23:59:59';

    page.innerHTML =
      '<div class="qro-main">' +
        // ===== 筛选区（.top）=====
        '<div class="qro-top"><div class="qro-row"><div class="qro-left">' +
          '<div class="qro-form-row">' +
            '<div class="qro-form-item" id="qrnDateTypeWrap"></div>' +
            '<div class="qro-form-item"><span class="qro-form-label">日期</span>' +
              '<input type="date" class="qro-input" id="qrnStartDate" value="' + initRange[0] + '" />' +
              '<span style="padding:0 4px">~</span>' +
              '<input type="date" class="qro-input" id="qrnEndDate" value="' + initRange[1] + '" /></div>' +
          '</div>' +
          '<div class="qro-form-row">' +
            '<div class="qro-form-item"><span class="qro-form-label">车系</span><div id="qrnSeriesSelect"></div></div>' +
            '<div class="qro-form-item"><span class="qro-form-label">坐席账号</span><div id="qrnSeatSelect"></div></div>' +
          '</div>' +
        '</div>' +
        '<div style="margin-top:6px">' +
          '<button class="qro-btn" id="qrnResetBtn" style="margin-right:12px">重置</button>' +
          '<button class="qro-btn qro-btn-primary" id="qrnQueryBtn">查询</button>' +
        '</div></div></div>' +
        // ===== 总览区 =====
        '<div class="qro-overview" id="qrnOverview"></div>' +
        // ===== 诊断内容及建议 =====
        '<div class="qro-wrap"><div class="qro-header"><div class="qro-title">诊断内容及建议</div></div>' +
          '<div class="qro-diagnosis" id="qrnDiagnosis"></div></div>' +
        // ===== 员工质检 =====
        '<div class="qro-wrap"><div class="qro-header"><div class="qro-title">员工质检</div></div>' +
          '<div class="qro-box-row" style="padding:16px">' +
            '<div class="qro-box" style="background:#fafafa">' +
              '<div class="qro-box-title">质检得分</div>' +
              '<div style="height:360px;position:relative"><div id="qrnRadarChart" style="width:100%;height:100%"></div></div>' +
            '</div>' +
            '<div class="qro-box" style="background:#fafafa">' +
              '<div class="qro-box-title">细项拆解</div>' +
              '<div id="qrnFirstSortRadio"></div>' +
              '<div class="qro-tabs" id="qrnSecondTabs"></div>' +
              '<div class="qro-progress-wrap" id="qrnProgressWrap"></div>' +
            '</div>' +
          '</div></div>' +
        // ===== 数据趋势 =====
        '<div class="qro-wrap"><div class="qro-header">' +
          '<div class="qro-title">数据趋势</div>' +
          '<div style="display:flex;align-items:center">' +
            '<div id="qrnTrendTree"></div>' +
            '<div class="qro-radio-group" id="qrnTrendDateType" style="margin-left:12px">' +
              '<span class="qro-radio-btn qro-radio-checked" data-v="1">天</span>' +
              '<span class="qro-radio-btn" data-v="2">周</span>' +
              '<span class="qro-radio-btn" data-v="3">月</span>' +
            '</div>' +
          '</div></div>' +
          '<div class="qro-chart-wrap"><canvas id="qrnTrendChart"></canvas></div></div>' +
        // ===== 员工诊断列表 =====
        '<div class="qro-wrap"><div class="qro-header">' +
          '<div class="qro-title">员工诊断列表</div>' +
          '<div style="display:flex;align-items:center">' +
            '<div id="qrnWorkerTree"></div>' +
            '<button class="qro-link-btn" id="qrnWorkerExport"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>导出数据</button>' +
          '</div></div>' +
          '<div class="qro-table-pad"><div class="qro-table-scroll" id="qrnWorkerTableWrap"></div></div></div>' +
        // ===== 线索诊断列表 =====
        '<div class="qro-wrap">' +
          '<div class="qro-header"><div class="qro-title">线索诊断列表</div>' +
            '<div style="display:flex;align-items:center">' +
              '<button class="qro-link-btn" id="qrnClueExport"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>导出数据</button>' +
              '<button class="qro-link-btn" id="qrnClueExportDetail"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>导出质检明细</button>' +
            '</div></div>' +
          '<div class="qro-search-bar" id="qrnClueSearchBar"></div>' +
          '<div class="qro-table-pad" style="padding-top:16px"><div class="qro-table-scroll" id="qrnClueTableWrap"></div></div>' +
        '</div>' +
        '<div style="height:10px"></div>' +
      '</div>';

    qrnInitTopFilters();
    qrnInitTrendSection();
    qrnInitWorkerSection();
    qrnInitClueSection();
    qrnRefreshOverview();
    qrnRefreshDiagnosis();
    qrnRefreshSorce();
  }

  // ==================== 筛选区 ====================
  function qrnInitTopFilters() {
    var wrap = document.getElementById('qrnDateTypeWrap');
    wrap.innerHTML = '<div class="qro-radio-group">' +
      [ { v: 1, l: '昨天' }, { v: 7, l: '前7天' }, { v: 30, l: '前30天' } ].map(function (o) {
        return '<span class="qro-radio-btn' + (o.v === qrnState.dateType ? ' qro-radio-checked' : '') + '" data-v="' + o.v + '">' + o.l + '</span>';
      }).join('') + '</div>';
    wrap.querySelectorAll('.qro-radio-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        wrap.querySelectorAll('.qro-radio-btn').forEach(function (b) { b.classList.remove('qro-radio-checked'); });
        btn.classList.add('qro-radio-checked');
        var days = +btn.getAttribute('data-v');
        qrnState.dateType = days;
        var range = qrnDateRange(days);
        document.getElementById('qrnStartDate').value = range[0];
        document.getElementById('qrnEndDate').value = range[1];
      });
    });
    [document.getElementById('qrnStartDate'), document.getElementById('qrnEndDate')].forEach(function (inp) {
      inp.addEventListener('change', function () {
        var wrapBtns = document.querySelectorAll('#qrnDateTypeWrap .qro-radio-btn');
        wrapBtns.forEach(function (b) { b.classList.remove('qro-radio-checked'); });
      });
    });

    // 车系多选（对齐 Select multiple tag）
    qrnInitMultiSelect('qrnSeriesSelect', qrnSeriesOptions, qrnState.seriesSelected, function (vals) {
      qrnState.seriesSelected = vals;
    }, '车系筛选');

    // 坐席账号多选（对齐 ProFormCascader：坐席名(账号)）
    var seatOpts = qrnSeats.map(function (s) { return { value: s.account, label: s.name + '(' + s.account + ')' }; });
    qrnInitMultiSelect('qrnSeatSelect', seatOpts, qrnState.seatSelected, function (vals) {
      qrnState.seatSelected = vals;
    }, '请选择');

    document.getElementById('qrnResetBtn').addEventListener('click', function () {
      var range = qrnDateRange(7);
      qrnState.dateType = 7;
      qrnState.seriesSelected = [];
      qrnState.seatSelected = [];
      document.getElementById('qrnStartDate').value = range[0];
      document.getElementById('qrnEndDate').value = range[1];
      document.querySelectorAll('#qrnDateTypeWrap .qro-radio-btn').forEach(function (b) {
        b.classList.toggle('qro-radio-checked', b.getAttribute('data-v') === '7');
      });
      document.getElementById('qrnSeriesSelect').innerHTML = '';
      document.getElementById('qrnSeatSelect').innerHTML = '';
      qrnInitMultiSelect('qrnSeriesSelect', qrnSeriesOptions, [], function (vals) { qrnState.seriesSelected = vals; }, '车系筛选');
      qrnInitMultiSelect('qrnSeatSelect', seatOpts, [], function (vals) { qrnState.seatSelected = vals; }, '请选择');
      qrnApplyParams();
    });
    document.getElementById('qrnQueryBtn').addEventListener('click', qrnApplyParams);
  }

  function qrnApplyParams() {
    var s = document.getElementById('qrnStartDate').value;
    var e = document.getElementById('qrnEndDate').value;
    qrnState.params = {
      startTime: (s || qrnDateRange(7)[0]) + ' 00:00:00',
      endTime: (e || qrnDateRange(7)[1]) + ' 23:59:59',
      seatIds: qrnState.seatSelected.join(','),
      seriesCodes: qrnState.seriesSelected.join(',')
    };
    qrnRefreshOverview();
    qrnRefreshDiagnosis();
    qrnRefreshSorce();
    qrnRenderTrendChart();
    qrnState.workerPage = 1;
    qrnRenderWorkerTable();
    qrnState.cluePage = 1;
    qrnRenderClueTable();
  }

  // 多选下拉（tag 形态，对齐 antd Select multiple maxTagCount responsive）
  function qrnInitMultiSelect(containerId, options, initial, onChange, placeholder) {
    var host = document.getElementById(containerId);
    var selected = (initial || []).slice();
    var open = false;

    function render() {
      var tags = selected.map(function (v) {
        var opt = options.find(function (o) { return o.value === v; });
        return '<span class="qro-tag" data-v="' + qrnEsc(v) + '">' + qrnEsc(opt ? opt.label : v) + '<i class="qro-tag-close">×</i></span>';
      }).join('');
      host.innerHTML = '<div class="qro-select-multiple' + (open ? ' qro-focused' : '') + '" style="min-width:220px">' +
        (selected.length ? tags : '<span class="qro-placeholder">' + qrnEsc(placeholder || '请选择') + '</span>') +
        '<span style="margin-left:auto;color:rgba(0,0,0,0.25);padding:0 7px">▾</span></div>' +
        '<div class="qro-tree-dropdown" style="' + (open ? '' : 'display:none;') + '"></div>';
      var box = host.querySelector('.qro-select-multiple');
      var dd = host.querySelector('.qro-tree-dropdown');
      dd.innerHTML = options.map(function (o) {
        var on = selected.indexOf(o.value) >= 0;
        return '<div class="qro-tree-node" data-v="' + qrnEsc(o.value) + '"><span class="qro-tree-checkbox' + (on ? ' qro-checked' : '') + '"></span><span class="qro-tree-label">' + qrnEsc(o.label) + '</span></div>';
      }).join('');
      dd.querySelectorAll('.qro-tree-node').forEach(function (row) {
        row.addEventListener('click', function (e) {
          if (e.target.closest('.qro-tag-close')) return;
          var v = row.getAttribute('data-v');
          var idx = selected.indexOf(v);
          if (idx >= 0) selected.splice(idx, 1); else selected.push(v);
          onChange(selected.slice());
          render();
          var dd2 = host.querySelector('.qro-tree-dropdown');
          dd2.style.display = 'block';
          dd2.style.position = 'relative';
          dd2.style.width = '100%';
          host.querySelector('.qro-select-multiple').classList.add('qro-focused');
        });
      });
      box.addEventListener('click', function (e) {
        if (e.target.closest('.qro-tag-close')) {
          var v = e.target.closest('.qro-tag').getAttribute('data-v');
          selected = selected.filter(function (x) { return x !== v; });
          onChange(selected.slice());
          render();
          return;
        }
        open = !open;
        render();
        if (open) {
          var dd3 = host.querySelector('.qro-tree-dropdown');
          dd3.style.display = 'block';
          dd3.style.position = 'relative';
          dd3.style.width = '100%';
          host.querySelector('.qro-select-multiple').classList.add('qro-focused');
        }
      });
    }
    render();
    document.addEventListener('click', function (e) {
      if (!host.contains(e.target)) {
        open = false;
        var dd = host.querySelector('.qro-tree-dropdown');
        var box = host.querySelector('.qro-select-multiple');
        if (dd) dd.style.display = 'none';
        if (box) box.classList.remove('qro-focused');
      }
    });
  }

  // ==================== 总览区 ====================
  function qrnRefreshOverview() {
    var el = document.getElementById('qrnOverview');
    if (!el) return;
    var data = qrnGetOverview(qrnState.params);
    var seatNames = '全部坐席';
    if (qrnState.params.seatIds) {
      seatNames = qrnState.params.seatIds.split(',').map(function (id) {
        var seat = qrnSeats.find(function (s) { return s.account === id; });
        return seat ? seat.name : '';
      }).filter(Boolean).join('    ');
    }
    var html = '<div class="qro-info">' +
      '<img src="' + qrnAvatarDataUrl() + '" alt="" />' +
      '<div class="qro-name">' + qrnEsc(seatNames) + '</div></div>';
    data.forEach(function (item) {
      var up = item.scorePre >= 0;
      html += '<div class="qro-overview-item">' +
        '<div class="qro-ov-title"><span>' + qrnEsc(item.name) + '</span>' +
          '<span class="qro-tip-icon">?<span class="qro-tip-pop">' + qrnEsc(item.remark) + '</span></span></div>' +
        '<div class="qro-content"><span class="qro-num">' + item.score + '</span>' +
          '<span class="qro-text">环比<span class="qro-percen ' + (up ? 'qro-num-blue' : 'qro-num-green') + '">' + (up ? '▲  ' : '▼  ') + item.scorePre + '%</span></span></div>' +
      '</div>';
    });
    el.innerHTML = html;
  }

  function qrnAvatarDataUrl() {
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#e2eafb"/><circle cx="32" cy="25" r="11" fill="#2885ff"/><path d="M10 58c2-13 10-20 22-20s20 7 22 20z" fill="#2885ff"/></svg>');
  }

  // ==================== 诊断内容及建议 ====================
  function qrnRefreshDiagnosis() {
    var el = document.getElementById('qrnDiagnosis');
    if (!el) return;
    var d = qrnGetDiagnosis(qrnState.params);
    el.innerHTML = '<div class="qro-diag-quote">' + qrnEsc(d.content) + '</div>' +
      '<div class="qro-diag-advise"><span class="qro-diag-advise-title">改进建议：</span>' +
      d.advises.map(function (a) { return '<div class="qro-diag-advise-item">' + qrnEsc(a) + '</div>'; }).join('') +
      '</div>';
  }

  // ==================== 员工质检（雷达图 + 细项拆解） ====================
  function qrnRefreshSorce() {
    var sorce = qrnGetSorce(qrnState.params);
    if (!qrnState.curFirstSortCode || !sorce.some(function (s) { return s.firstSortCode === qrnState.curFirstSortCode; })) {
      qrnState.curFirstSortCode = sorce.length ? sorce[0].firstSortCode : '';
    }
    qrnState.curSecondSortCode = '';

    // 雷达图
    var radarHost = document.getElementById('qrnRadarChart');
    if (radarHost) {
      var canvas = radarHost.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        radarHost.innerHTML = '';
        radarHost.appendChild(canvas);
      }
      var indicators = sorce.map(function (s) { return { title: s.firstSortName, sub: s.score + '分' }; });
      var values = sorce.map(function (s) { return s.score; });
      qrnDrawRadar(canvas, indicators, values, { height: 350 });
    }

    // 一级分类按钮（RadioGroup small solid）
    var radioEl = document.getElementById('qrnFirstSortRadio');
    radioEl.innerHTML = '<div class="qro-radio-group qro-radio-group-sm">' + sorce.map(function (s) {
      return '<span class="qro-radio-btn' + (s.firstSortCode === qrnState.curFirstSortCode ? ' qro-radio-checked' : '') + '" data-v="' + s.firstSortCode + '">' + qrnEsc(s.firstSortName) + '</span>';
    }).join('') + '</div>';
    radioEl.querySelectorAll('.qro-radio-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        qrnState.curFirstSortCode = btn.getAttribute('data-v');
        qrnState.curSecondSortCode = '';
        qrnRefreshSorce();
      });
    });

    // 二级分类 tabs（全部 + 二级，竖线分隔）
    var cur = sorce.find(function (s) { return s.firstSortCode === qrnState.curFirstSortCode; });
    var seconds = cur ? cur.secondSorts : [];
    var tabsEl = document.getElementById('qrnSecondTabs');
    var tabsHtml = '<span class="' + (qrnState.curSecondSortCode === '' ? 'qro-active-tab' : 'qro-inactive-tab') + '" data-v="">全部</span>';
    seconds.forEach(function (sec, i) {
      if (i > 0 || qrnState.curSecondSortCode !== '') tabsHtml += '<span class="qro-tab-split"></span>';
      tabsHtml += '<span class="' + (sec.secondSortCode === qrnState.curSecondSortCode ? 'qro-active-tab' : 'qro-inactive-tab') + '" data-v="' + sec.secondSortCode + '">' + qrnEsc(sec.secondSortName) + '</span>';
    });
    tabsEl.innerHTML = tabsHtml;
    tabsEl.querySelectorAll('span[data-v]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        qrnState.curSecondSortCode = tab.getAttribute('data-v');
        qrnRefreshSorce();
      });
    });

    // 三级细项进度条（percent = weightedScore/thirdSortPercent*100，"x分"）
    var items = [];
    if (!qrnState.curSecondSortCode) {
      seconds.forEach(function (sec) { items = items.concat(sec.thirdSorts || []); });
    } else {
      var sec2 = seconds.find(function (x) { return x.secondSortCode === qrnState.curSecondSortCode; });
      items = sec2 ? (sec2.thirdSorts || []) : [];
    }
    var progEl = document.getElementById('qrnProgressWrap');
    progEl.innerHTML = items.length ? items.map(function (item) {
      var percent = Math.ceil(item.weightedScore / item.thirdSortPercent * 100 * 100) / 100;
      percent = Math.min(percent, 100);
      return '<div class="qro-progress"><div class="qro-progress-title" title="' + qrnEsc(item.thirdSortDesc || '') + '">' + qrnEsc(item.thirdSortName) + '</div>' +
        '<div class="qro-progress-bar"><div class="qro-progress-inner" style="width:' + percent + '%"></div>' +
        '<span class="qro-progress-text">' + percent + '分</span></div></div>';
    }).join('') : '<div class="qro-empty">暂无数据</div>';
  }

  // ==================== 数据趋势 ====================
  function qrnInitTrendSection() {
    var treeHost = document.getElementById('qrnTrendTree');
    var ts = qrnTreeSelectCreate({
      treeData: qrnBuildModeTree(),
      value: [{ value: '质检总分', label: '质检总分' }],
      placeholder: '请选择诊断项',
      onChange: function (vals) {
        qrnRenderTrendChart();
      },
      onBeforeChange: qrnTreeGuardLine()
    });
    treeHost.appendChild(ts.root);
    document.body.appendChild(ts.dropdown);
    qrnState.trendTree = ts;

    document.querySelectorAll('#qrnTrendDateType .qro-radio-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#qrnTrendDateType .qro-radio-btn').forEach(function (b) { b.classList.remove('qro-radio-checked'); });
        btn.classList.add('qro-radio-checked');
        qrnState.trendDateType = +btn.getAttribute('data-v');
        qrnRenderTrendChart();
      });
    });
    qrnRenderTrendChart();
  }

  function qrnRenderTrendChart() {
    var canvas = document.getElementById('qrnTrendChart');
    if (!canvas || !qrnState.trendTree) return;
    var trend = qrnGetTrend(qrnState.params, qrnState.trendDateType);
    var xLabels = trend.map(function (t) { return t.date; });
    var seriesArr = qrnState.trendTree.getValues()
      .filter(function (v) { return v.value !== 'selectAll'; })
      .map(function (v) {
        var data = trend.map(function (t) {
          if (v.value === '质检总分') return t.weightedScore || 0;
          for (var i = 0; i < t.qcConfigDtos.length; i++) {
            var first = t.qcConfigDtos[i];
            if (first.firstSortCode === v.value) return first.weightedScore || 0;
            for (var j = 0; j < (first.secondSorts || []).length; j++) {
              var second = first.secondSorts[j];
              if (second.secondSortCode === v.value) return second.weightedScore || 0;
            }
          }
          return 0;
        });
        return { name: v.label, data: data };
      });
    if (!seriesArr.length) {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    qrnDrawLineChart(canvas, xLabels, seriesArr, { height: 360 });
  }

  // ==================== 员工诊断列表 ====================
  function qrnInitWorkerSection() {
    var treeHost = document.getElementById('qrnWorkerTree');
    var ws = qrnTreeSelectCreate({
      treeData: qrnBuildModeTree(),
      value: [{ value: '质检总分', label: '质检总分' }],
      placeholder: '请选择诊断项',
      onChange: function (vals) { qrnState.workerPage = 1; qrnRenderWorkerTable(); },
      onBeforeChange: qrnTreeGuard(true)
    });
    treeHost.appendChild(ws.root);
    document.body.appendChild(ws.dropdown);
    qrnState.workerTree = ws;

    document.getElementById('qrnWorkerExport').addEventListener('click', function () {
      qrnToast('员工诊断列表_' + Date.now() + '.xlsx 导出成功', 'success');
    });
    qrnRenderWorkerTable();
  }

  function qrnWorkerColumns() {
    var fixed = [
      { title: '坐席名称', dataIndex: 'seatName', width: 100, fixed: true },
      { title: '接通线索总量', dataIndex: 'connCount', width: 120, fixed: true },
      { title: '拨打线索总量', dataIndex: 'dialCount', width: 120, fixed: true },
      { title: '平均通话时长', dataIndex: 'avgDuration', sorter: true },
      { title: '有效通话率', dataIndex: 'validRate', sorter: true },
      { title: '诊断线索总量', dataIndex: 'diagCount', sorter: true }
    ];
    var flat = qrnTreeFlattenForGuard(qrnBuildModeTree());
    var selected = qrnState.workerTree ? qrnState.workerTree.getValues().filter(function (v) { return v.value !== 'selectAll'; }).map(function (v) { return v.value; }) : ['质检总分'];
    var dyn = flat.filter(function (node) {
      return node.value === '质检总分' || selected.indexOf(node.value) >= 0;
    }).map(function (node) {
      return { title: node.label, dataIndex: node.value, sorter: true, dynamic: true, total: node.value === '质检总分' };
    });
    return fixed.concat(dyn);
  }

  function qrnWorkerCellValue(row, col) {
    if (col.dataIndex === '质检总分') return row.totalScore;
    if (col.dynamic) return row.scoreMap[col.dataIndex] != null ? row.scoreMap[col.dataIndex] : '-';
    return row[col.dataIndex];
  }

  function qrnRenderWorkerTable() {
    var wrap = document.getElementById('qrnWorkerTableWrap');
    if (!wrap) return;
    var rows = qrnGetStuffRows(qrnState.params);
    var cols = qrnWorkerColumns();

    // 排序
    if (qrnState.workerSort) {
      var col = cols.find(function (c) { return c.dataIndex === qrnState.workerSort; });
      rows = rows.slice().sort(function (a, b) {
        var av = parseFloat(qrnWorkerCellValue(a, col)) || 0;
        var bv = parseFloat(qrnWorkerCellValue(b, col)) || 0;
        return av - bv;
      });
    }
    // 分页
    var total = rows.length;
    var pages = Math.max(1, Math.ceil(total / qrnState.workerPageSize));
    if (qrnState.workerPage > pages) qrnState.workerPage = pages;
    var pageRows = rows.slice((qrnState.workerPage - 1) * qrnState.workerPageSize, qrnState.workerPage * qrnState.workerPageSize);

    var html = '<table class="qro-grid-table"><thead><tr>';
    cols.forEach(function (c) {
      var sorter = c.sorter ? '<span class="qro-sorter' + (qrnState.workerSort === c.dataIndex ? ' on' : '') + '" data-k="' + c.dataIndex + '"><i class="up"></i><i class="down"></i></span>' : '';
      html += '<th' + (c.width ? ' style="min-width:' + c.width + 'px"' : '') + '>' + qrnEsc(c.title) + sorter + '</th>';
    });
    html += '</tr></thead><tbody>';
    pageRows.forEach(function (row) {
      html += '<tr>';
      cols.forEach(function (c) {
        var val = qrnWorkerCellValue(row, c);
        var style = c.total ? ' class="qro-cell-blue"' : '';
        html += '<td' + style + '>' + qrnEsc(val) + '</td>';
      });
      html += '</tr>';
    });
    if (!pageRows.length) html += '<tr><td colspan="' + cols.length + '"><div class="qro-empty">暂无数据</div></td></tr>';
    html += '</tbody></table>';
    html += qrnPaginationHtml('worker', total, qrnState.workerPage, qrnState.workerPageSize);
    wrap.innerHTML = html;

    wrap.querySelectorAll('.qro-sorter').forEach(function (s) {
      s.addEventListener('click', function () {
        var k = s.getAttribute('data-k');
        qrnState.workerSort = qrnState.workerSort === k ? null : k;
        qrnRenderWorkerTable();
      });
    });
    qrnBindPagination('worker', wrap, function (page, size) {
      qrnState.workerPage = page;
      qrnState.workerPageSize = size;
      qrnRenderWorkerTable();
    });
  }

  // ==================== 分页组件（对齐 antd Pagination） ====================
  function qrnPaginationHtml(ns, total, page, pageSize) {
    var pages = Math.max(1, Math.ceil(total / pageSize));
    return '<div class="qro-pagination prototype-pagination">' +
      '<span class="prototype-pagination-summary">共 ' + total + ' 条记录，当前第 ' + page + ' / ' + pages + ' 页</span>' +
      '<div class="prototype-pagination-controls">' +
      '<select class="prototype-pagination-select" data-size aria-label="每页显示条数">' +
      [5, 10, 20, 50].map(function (size) { return '<option value="' + size + '"' + (pageSize === size ? ' selected' : '') + '>每页 ' + size + ' 条</option>'; }).join('') + '</select>' +
      '<button type="button" class="qro-page-btn prototype-pagination-arrow" data-p="' + (page - 1) + '" aria-label="上一页"' + (page <= 1 ? ' disabled' : '') + '><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>' +
      '<select class="prototype-pagination-select" data-page aria-label="选择页码">' + Array.from({ length: pages }, function (_, index) { var p = index + 1; return '<option value="' + p + '"' + (p === page ? ' selected' : '') + '>第 ' + p + ' 页</option>'; }).join('') + '</select>' +
      '<button type="button" class="qro-page-btn prototype-pagination-arrow" data-p="' + (page + 1) + '" aria-label="下一页"' + (page >= pages ? ' disabled' : '') + '><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>' +
      '</div></div>';
  }

  function qrnBindPagination(ns, wrap, onChange) {
    wrap.querySelectorAll('.qro-page-btn:not(:disabled)').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = +btn.getAttribute('data-p');
        if (p >= 1) onChange(p, null);
      });
    });
    wrap.querySelectorAll('.qro-pagination select[data-size]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        onChange(1, +sel.value);
      });
    });
    wrap.querySelectorAll('.qro-pagination select[data-page]').forEach(function (sel) {
      sel.addEventListener('change', function () { onChange(+sel.value, null); });
    });
  }

  // ==================== 线索诊断列表（ClueTabel 对齐） ====================
  function qrnInitClueSection() {
    var bar = document.getElementById('qrnClueSearchBar');
    var typeOpts = qrnClueTypes.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
    var sourceOpts = qrnSourceDict.map(function (d) { return '<option value="' + d.code + '">' + d.name + '</option>'; }).join('');
    var rchOpts = ['R1-懂车帝留资', 'R2-汽车之家留资', 'R3-官网表单', 'R4-活动报名'].map(function (r) { return '<option value="' + r + '">' + r + '</option>'; }).join('');
    bar.innerHTML =
      '<div class="qro-search-item"><span class="qro-search-label">线索编码</span><input type="text" class="qro-input" id="qrnClueSId" placeholder="请输入" style="width:150px" /></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">客户姓名</span><input type="text" class="qro-input" id="qrnClueSName" placeholder="请输入" style="width:110px" /></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">联系电话</span><input type="text" class="qro-input" id="qrnClueSTel" placeholder="请输入" style="width:140px" /></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">线索类型</span><select id="qrnClueSType"><option value="">全部</option>' + typeOpts + '</select></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">线索来源</span><select id="qrnClueSSource"><option value="">全部</option>' + sourceOpts + '</select></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">线索R渠道</span><select id="qrnClueSRch"><option value="">全部</option>' + rchOpts + '</select></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">坐席名称</span><input type="text" class="qro-input" id="qrnClueSSeat" placeholder="请输入" style="width:110px" /></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">经销商名称</span><input type="text" class="qro-input" id="qrnClueSDealer" placeholder="请输入" style="width:160px" /></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">诊断项</span><div id="qrnClueTree"></div></div>';

    var fields = { hdClueId: 'qrnClueSId', custName: 'qrnClueSName', custTel: 'qrnClueSTel', clueType: 'qrnClueSType', clueSource: 'qrnClueSSource', rchannelName: 'qrnClueSRch', seatName: 'qrnClueSSeat', dealerName: 'qrnClueSDealer' };
    Object.keys(fields).forEach(function (k) {
      var el = document.getElementById(fields[k]);
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () {
        qrnState.clueSearch[k] = el.value.trim();
        qrnState.cluePage = 1;
        qrnRenderClueTable();
      });
    });

    var ts = qrnTreeSelectCreate({
      treeData: qrnBuildModeTree(),
      value: qrnState.clueValue,
      placeholder: '请选择',
      onChange: function (vals) {
        qrnState.clueValue = vals;
        qrnState.cluePage = 1;
        qrnRenderClueTable();
      },
      onBeforeChange: qrnTreeGuard(true)
    });
    document.getElementById('qrnClueTree').appendChild(ts.root);
    document.body.appendChild(ts.dropdown);
    qrnState.clueTree = ts;

    document.getElementById('qrnClueExport').addEventListener('click', function () {
      qrnToast('线索诊断列表_' + Date.now() + '.xlsx 导出成功', 'success');
    });
    document.getElementById('qrnClueExportDetail').addEventListener('click', function () {
      qrnToast('质检明细_' + Date.now() + '.xlsx 导出成功', 'success');
    });
    qrnRenderClueTable();
  }

  function qrnClueColumns() {
    var cols = [
      { title: '序号', key: 'index', align: 'center', width: 60 },
      { title: '线索编码', dataIndex: 'hdClueId', width: 130 },
      { title: '客户姓名', dataIndex: 'custName', width: 90 },
      { title: '联系电话', dataIndex: 'custTel', width: 120 },
      { title: '线索类型', dataIndex: 'clueType', align: 'center', width: 90 },
      { title: '线索来源', dataIndex: 'clueSource', align: 'center', width: 90 },
      { title: '线索R渠道', dataIndex: 'rchannelName', align: 'center', width: 130 },
      { title: '车系', dataIndex: 'seriesName', width: 110 },
      { title: '坐席名称', dataIndex: 'seatName', width: 90 },
      { title: '申诉细项个数', dataIndex: 'appealCnt', sorter: true, align: 'right', width: 110 },
      { title: '首次通话时间', dataIndex: 'firstReviewTime', sorter: true, width: 140 },
      { title: '末次通话时间', dataIndex: 'lastReviewTime', sorter: true, width: 140 },
      { title: '通话次数', dataIndex: 'followTimes', sorter: true, align: 'right', width: 90 },
      { title: '通话总时长', dataIndex: 'callDuration', sorter: true, align: 'right', width: 100 }
    ];
    var selected = qrnState.clueValue.filter(function (v) { return v.value !== 'selectAll'; });
    selected.forEach(function (item) {
      cols.push({ title: item.label, dataIndex: item.value, sorter: true, dynamic: true, total: item.label === '质检总分' });
    });
    cols.push({ title: '操作', key: 'action', width: 130 });
    return cols;
  }

  function qrnClueCellValue(row, col) {
    if (col.key === 'index') return '';
    if (col.dataIndex === '质检总分') return row.propertyScoreList[0];
    if (col.dynamic) return row.scoreMap[col.dataIndex] != null ? row.scoreMap[col.dataIndex] : '-';
    if (col.dataIndex === 'clueSource') {
      var dict = qrnSourceDict.find(function (d) { return d.code === row.clueSource; });
      return dict ? dict.name : row.clueSource;
    }
    return row[col.dataIndex];
  }

  function qrnClueSortValue(row, col) {
    if (col.dataIndex === '质检总分') return parseFloat(row.propertyScoreList[0]) || 0;
    if (col.dynamic) return parseFloat(row.scoreMap[col.dataIndex]) || 0;
    if (col.dataIndex === 'callDuration') {
      var m = /(\d+)分(\d+)秒/.exec(row.callDuration);
      return m ? +m[1] * 60 + +m[2] : 0;
    }
    var v = row[col.dataIndex];
    return typeof v === 'number' ? v : parseFloat(v) || 0;
  }

  function qrnFilterClueRows(rows) {
    var s = qrnState.clueSearch;
    return rows.filter(function (row) {
      if (s.hdClueId && row.hdClueId.indexOf(s.hdClueId) < 0) return false;
      if (s.custName && row.custName.indexOf(s.custName) < 0) return false;
      if (s.custTel && row.custTel.indexOf(s.custTel) < 0) return false;
      if (s.clueType && row.clueType !== s.clueType) return false;
      if (s.clueSource && row.clueSource !== s.clueSource) return false;
      if (s.rchannelName && row.rchannelName !== s.rchannelName) return false;
      if (s.seatName && row.seatName.indexOf(s.seatName) < 0) return false;
      if (s.dealerName && row.dealerName && row.dealerName.indexOf(s.dealerName) < 0) return false;
      return true;
    });
  }

  function qrnRenderClueTable() {
    var wrap = document.getElementById('qrnClueTableWrap');
    if (!wrap) return;
    var data = qrnGetClueRows(qrnState.params);
    var rows = qrnFilterClueRows(data.rows);
    rows.forEach(function (row) { row.isCheck = qrnState.clueChecked[row.hdClueId] || row.isCheck; });
    var cols = qrnClueColumns();

    if (qrnState.clueSort) {
      var col = cols.find(function (c) { return c.dataIndex === qrnState.clueSort; });
      if (col) {
        rows = rows.slice().sort(function (a, b) {
          return qrnClueSortValue(a, col) - qrnClueSortValue(b, col);
        });
      }
    }

    var total = rows.length;
    var pages = Math.max(1, Math.ceil(total / qrnState.cluePageSize));
    if (qrnState.cluePage > pages) qrnState.cluePage = pages;
    var pageRows = rows.slice((qrnState.cluePage - 1) * qrnState.cluePageSize, qrnState.cluePage * qrnState.cluePageSize);

    var html = '<table class="qro-grid-table"><thead><tr>';
    cols.forEach(function (c) {
      var sorter = c.sorter ? '<span class="qro-sorter' + (qrnState.clueSort === c.dataIndex ? ' on' : '') + '" data-k="' + c.dataIndex + '"><i class="up"></i><i class="down"></i></span>' : '';
      html += '<th' + (c.width ? ' style="min-width:' + c.width + 'px"' : '') + (c.align ? ' class="qro-th-' + c.align + '"' : '') + '>' + qrnEsc(c.title) + sorter + '</th>';
    });
    html += '</tr></thead><tbody>';
    pageRows.forEach(function (row, ri) {
      html += '<tr>';
      cols.forEach(function (c) {
        if (c.key === 'index') {
          html += '<td style="text-align:center">' + ((qrnState.cluePage - 1) * qrnState.cluePageSize + ri + 1) + '</td>';
        } else if (c.key === 'action') {
          html += '<td class="qro-td-nowrap">' +
            '<a class="qro-link" data-act="detail" data-id="' + qrnEsc(row.hdClueId) + '">详情</a>' +
            '<a class="qro-link" data-act="check" data-id="' + qrnEsc(row.hdClueId) + '">' + (row.isCheck ? '重新检核' : '检核') + '</a></td>';
        } else {
          var val = qrnClueCellValue(row, c);
          var style = '';
          if (c.total) style = ' class="qro-cell-blue"';
          else if (c.align === 'center') style = ' style="text-align:center"';
          else if (c.align === 'right') style = ' style="text-align:right"';
          html += '<td' + style + '>' + qrnEsc(val) + '</td>';
        }
      });
      html += '</tr>';
    });
    if (!pageRows.length) html += '<tr><td colspan="' + cols.length + '"><div class="qro-empty">暂无数据</div></td></tr>';
    html += '</tbody></table>';
    html += qrnPaginationHtml('clue', total, qrnState.cluePage, qrnState.cluePageSize);
    wrap.innerHTML = html;

    wrap.querySelectorAll('.qro-sorter').forEach(function (s) {
      s.addEventListener('click', function () {
        var k = s.getAttribute('data-k');
        qrnState.clueSort = qrnState.clueSort === k ? null : k;
        qrnRenderClueTable();
      });
    });
    wrap.querySelectorAll('a[data-act]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var id = a.getAttribute('data-id');
        var row = qrnGetClueRows(qrnState.params).rows.find(function (r) { return r.hdClueId === id; });
        if (!row) return;
        if (a.getAttribute('data-act') === 'detail') qrnOpenDetailDrawer(row);
        else qrnOpenEditForm(row);
      });
    });
    qrnBindPagination('clue', wrap, function (page, size) {
      qrnState.cluePage = page;
      qrnState.cluePageSize = size;
      qrnRenderClueTable();
    });
  }

  var QRN_AI_STYLE_ID = 'qrnAiStylesheet31';
  function qrnEnsureAiStyles() {
    if (document.getElementById(QRN_AI_STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = QRN_AI_STYLE_ID;
    style.textContent = [
      /* 模型诊断标题行（title-wrap___3cDYG） */
      '.qrn-ai-title-wrap{display:flex;align-items:center;margin-bottom:20px;}',
      '.qrn-ai-title-line{width:4px;height:16px;background:#2885ff;border-radius:2px;margin-right:10px;}',
      '.qrn-ai-title-text{color:rgba(0,0,0,0.88);font-weight:600;font-size:16px;line-height:1;}',
      '.qrn-ai-title-sub{color:rgba(0,0,0,0.65);font-size:13px;margin-left:8px;}',
      /* 指标项得分（score-total-wrap___363Io / score-total___1F75b） */
      '.qrn-ai-score-total-wrap{display:flex;justify-content:center;margin:-40px 0 20px;}',
      '.qrn-ai-score-total{display:inline-flex;align-items:center;justify-content:center;font-size:18px;font-weight:bold;text-align:left;color:#01123a;width:240px;height:44px;background:#f6f8fa;border-radius:16px;}',
      '.qrn-ai-score-total .qrn-ai-score-num{color:#2885ff;font-size:28px;margin-left:6px;}',
      '.qrn-ai-tip-icon{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;margin-right:5px;border:1px solid rgba(0,0,0,0.45);border-radius:50%;font-size:12px;color:rgba(0,0,0,0.45);cursor:pointer;position:relative;}',
      '.qrn-ai-tip-pop{position:absolute;left:22px;top:-30px;z-index:30;background:#fff;box-shadow:0 6px 16px rgba(0,0,0,0.08);border:1px solid #f0f0f0;border-radius:8px;padding:10px 8px;color:#01123a;font-size:13px;font-weight:400;width:220px;display:none;text-align:left;line-height:20px;}',
      '.qrn-ai-tip-pop .qrn-ai-tip-row{display:flex;justify-content:space-between;}',
      '.qrn-ai-tip-icon:hover .qrn-ai-tip-pop{display:block;}',
      /* 雷达区三分类标签（label___3vYa4 / label-active___1w8la） */
      '.qrn-ai-radar-row{display:flex;align-items:center;justify-content:center;}',
      '.qrn-ai-radar-side{flex:0 0 250px;margin-top:-80px;}',
      '.qrn-ai-radar-side .qrn-ai-rls{display:flex;flex-wrap:wrap;}',
      '.qrn-ai-rl{box-sizing:border-box;min-width:114px;height:28px;padding:3px 8px;font-size:14px;text-align:center;color:#666666;background:#d9d9d9;line-height:22px;border-radius:6px;margin:4px;}',
      '.qrn-ai-rl.qrn-ai-rl-on{color:#ffffff;background:#2885ff;}',
      '.qrn-ai-radar-toplabels{display:flex;flex-wrap:wrap;justify-content:center;}',
      '.qrn-ai-radar-chart{flex-basis:560px;flex-shrink:0;flex-grow:0;width:560px;height:460px;}',
      /* AiAnalysis 会话区（top___2xqxr / right___14v59） */
      '.qrn-ai-top{display:flex;height:520px;margin:0;}',
      '.qrn-ai-top .qrn-ai-right{flex:1 0;overflow:hidden;}',
      '.qrn-ai-top .qrn-ai-right .qrn-card{height:100%;margin:0;}',
      '.qrn-ai-top .qrn-ai-right .qrn-card .qrn-card-body{height:100%;overflow:hidden;padding:0;}',
      '.qrn-ai-top .qrn-ai-left{overflow:auto;flex:1 0;}',
      '.qrn-ai-top .qrn-ai-left .qrn-card{height:100%;margin:0;}',
      '.qrn-ai-top .qrn-ai-left .qrn-card .qrn-card-body{height:460px;overflow:auto;padding:0;}',
      '.qrn-ai-chat-box{overflow:auto;height:100%;}',
      '.qrn-ai-chat-main{overflow:auto;height:468px;font-size:0;padding:25px 20px 20px 20px;background:#ebedf0;border-radius:8px;}',
      '.qrn-ai-chat-main .qrn-time-text{font-size:12px;color:#7a7a7a;line-height:14px;padding:4px 0 15px 42px;}',
      '.qrn-ai-chat-main .qrn-time-text.qrn-time-right{text-align:right;padding:4px 42px 15px 0;}',
      /* 评分表格（custom-table___26fBc） */
      '.qrn-custom-table{width:100%;border-spacing:0;}',
      '.qrn-custom-table .qrn-ct-row{height:55px;font-size:13px;color:#101010;line-height:20px;border-bottom:1px solid #f0f0f0;}',
      '.qrn-custom-table .qrn-ct-row:hover{background-color:#fafafa;}',
      '.qrn-custom-table .qrn-ct-col{font-size:13px;color:#101010;line-height:20px;padding:0 16px;vertical-align:middle;}',
      '.qrn-custom-table .qrn-ct-row:nth-child(even){background-color:#fbfcfd;}',
      '.qrn-custom-table .qrn-ct-row.qrn-ct-row-error{background-color:#fdf6f5 !important;}',
      '.qrn-custom-table .qrn-ct-row.qrn-ct-row-error:hover{background-color:#fdf6f5 !important;}',
      /* 触发/未触发胶囊（label-trigger___3YoV2 / label-no-trigger___2nElo） */
      '.qrn-label-trigger{display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;text-align:center;color:#2885ff;line-height:20px;width:64px;height:32px;background:#e2eafb;border-radius:16px;}',
      '.qrn-label-no-trigger{display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;text-align:center;color:#ff9500;line-height:20px;width:64px;height:32px;background:#fffaeb;border-radius:16px;}',
      '.qrn-ct-status{display:inline-flex;align-items:center;gap:8px;}',
      '.qrn-ct-status-text{font-size:13px;}',
      /* antd Tabs type=card（客服规范一级 tab） */
      '.qrn-cardtabs{display:flex;flex-wrap:wrap;border-bottom:1px solid #f0f0f0;margin:0 -16px 16px;padding:0 16px;}',
      '.qrn-cardtabs-item{position:relative;display:inline-flex;align-items:center;padding:12px 16px;margin-bottom:-1px;font-size:14px;color:rgba(0,0,0,0.88);line-height:20px;background:#fafafa;border:1px solid #f0f0f0;border-bottom:none;border-radius:8px 8px 0 0;margin-right:4px;cursor:pointer;}',
      '.qrn-cardtabs-item.qrn-cardtabs-active{background:#fff;color:#1677ff;font-weight:600;border-top:2px solid #1677ff;padding-top:11px;}',
      '.qrn-cardtabs-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;margin-left:6px;background:#ff4d4f;border-radius:9px;font-size:12px;color:#fff;line-height:17px;}',
      /* Descriptions 标签明细（检核弹窗 .left） */
      '.qrn-desc-module{padding:0 0 8px;}',
      '.qrn-desc-module .qrn-desc-grid{display:grid;grid-template-columns:1fr 1fr;}',
      '.qrn-desc-item{display:flex;padding:8px 16px;border-bottom:1px solid #f1f1f1;font-size:14px;line-height:22px;}',
      '.qrn-desc-item .qrn-desc-item-label{flex:0 0 40%;color:rgba(0,0,0,0.45);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.qrn-desc-item .qrn-desc-item-content{flex:1;color:rgba(0,0,0,0.88);word-break:break-all;}',
      /* 检核表单 */
      '.qrn-ef-form{padding:16px 0;}',
      '.qrn-ef-row{display:flex;align-items:flex-start;margin-bottom:16px;}',
      '.qrn-ef-label{flex:0 0 110px;text-align:right;padding-right:8px;font-size:14px;color:rgba(0,0,0,0.88);line-height:32px;height:32px;}',
      '.qrn-ef-label em{color:#ff4d4f;font-style:normal;margin-right:4px;}',
      '.qrn-ef-control{flex:1;position:relative;}',
      '.qrn-ef-error{position:absolute;left:0;top:34px;font-size:12px;color:#ff4d4f;line-height:20px;display:none;}',
      '.qrn-ef-row.qrn-ef-invalid .qrn-ef-error{display:block;}',
      '.qrn-ef-row.qrn-ef-invalid .qrn-input,.qrn-ef-row.qrn-ef-invalid .qrn-textarea{border-color:#ff4d4f;}',
      '.qrn-textarea{width:100%;box-sizing:border-box;min-height:88px;padding:4px 11px;font-size:14px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;color:rgba(0,0,0,0.88);outline:none;resize:vertical;font-family:inherit;}',
      '.qrn-textarea:focus{border-color:#2885ff;box-shadow:0 0 0 2px rgba(40,133,255,0.1);}',
      '.qrn-ef-count{position:absolute;right:8px;bottom:-20px;font-size:12px;color:rgba(0,0,0,0.45);}',
      /* DrawerForm 底部按钮（对齐 antd 抽屉 footer） */
      '.qrn-drawer-footer .qrn-btn{margin-left:8px;}',
      '@keyframes qrnFadeIn{from{opacity:0}to{opacity:1}}',
      '.qrn-drawer-mask{animation:qrnFadeIn .2s ease;}',
      '.qrn-drawer-footer .qrn-btn{margin-left:8px;}',
].join('\n');
    document.head.appendChild(style);
  }
  // ==================== AiAnalysis 演示数据构建 ====================
  // 对齐 scoreAnalyse：firstSort → secondSorts → thirdSorts（triggerShowFlag/canAppeal/isAppeal/isPass/deductScore）
  function qrnBuildScoreAnalyse(seedKey) {
    return qrnQualityMode.map(function (first) {
      var canFirst = 0, inFirst = 0, appealFirst = 0;
      var secondSorts = first.secondSorts.map(function (second) {
        var canSec = 0, inSec = 0, appealSec = 0;
        var thirdSorts = second.thirdSorts.map(function (third) {
          var s = seedKey + '_t_' + third.thirdSortCode;
          var deduct = qrnRnd(s + '_d') > 0.72 ? qrnFixed(s + '_dv', 1, 5, 1) : 0;
          var status = qrnInt(s + '_st', 0, 19);
          var appealStatus = deduct > 0 && status > 13 ? (status > 17 ? 1 : (status > 15 ? 2 : 3)) : 0;
          var canAppeal = deduct > 0 && (appealStatus === 0 || appealStatus === 3);
          if (canAppeal) canSec++;
          if (appealStatus === 1) inSec++;
          if (appealStatus >= 1) appealSec++;
          return {
            thirdSortCode: third.thirdSortCode,
            thirdSortName: third.thirdSortName,
            thirdSortDesc: third.thirdSortDesc,
            triggerShowFlag: deduct > 0,
            deductScore: deduct,
            canAppeal: canAppeal,
            isAppeal: appealStatus >= 1,
            isPass: deduct === 0 ? true : null,
            lastIsPass: appealStatus === 2 ? true : (appealStatus === 3 ? false : null)
          };
        });
        canFirst += canSec; inFirst += inSec; appealFirst += appealSec;
        return {
          secondSortCode: second.secondSortCode,
          secondSortName: second.secondSortName,
          canAppealCount: canSec, inAppealCount: inSec, appealCount: appealSec,
          thirdSorts: thirdSorts
        };
      });
      return {
        firstSortCode: first.firstSortCode,
        firstSortName: first.firstSortName,
        firstSortPercent: first.firstSortPercent,
        score: qrnFixed(seedKey + '_fs_' + first.firstSortCode, first.firstSortPercent * 0.6, first.firstSortPercent * 0.98, 1),
        canAppealCount: canFirst, inAppealCount: inFirst, appealCount: appealFirst,
        secondSorts: secondSorts
      };
    });
  }

  // 对齐 formulaData：{baseScore, deductions:[{label,value}], totalScore, inspectionScore}
  function qrnBuildFormula(seedKey, scoreAnalyse) {
    var deductions = [];
    var total = 100;
    scoreAnalyse.forEach(function (first) {
      first.secondSorts.forEach(function (sec) {
        sec.thirdSorts.forEach(function (t) {
          if (t.deductScore > 0) {
            deductions.push({ label: t.thirdSortName, value: t.deductScore });
            total -= t.deductScore;
          }
        });
      });
    });
    total = Math.max(0, +total.toFixed(1));
    return { baseScore: 100, deductions: deductions, totalScore: total, inspectionScore: total };
  }

  // 对齐 reviewRecords：回访记录列表（每条含多路通话）
  function qrnBuildReviewRecords(seedKey, row) {
    var n = qrnInt(seedKey + '_rvn', 1, 3);
    var list = [];
    for (var i = 0; i < n; i++) {
      var calls = [];
      var callN = qrnInt(seedKey + '_rv' + i + '_cn', 1, 3);
      for (var j = 0; j < callN; j++) {
        var cs = seedKey + '_rv' + i + '_c' + j;
        calls.push({
          id: (row ? row.hdClueId : 'HD') + '-R' + (i + 1) + '-' + (j + 1),
          canAppealCount: qrnInt(cs + '_ca', 0, 3),
          inAppealCount: qrnInt(cs + '_ia', 0, 2)
        });
      }
      list.push({ id: (row ? row.hdClueId : 'HD') + '-R' + (i + 1), canAppealCount: calls.reduce(function (a, c) { return a + c.canAppealCount; }, 0), calls: calls });
    }
    return list;
  }

  // 会话时间戳（对齐 addMillisecondsToDate 展示 HH:mm:ss）
  function qrnChatTime(seedKey, i) {
    var base = 9 * 3600 + qrnInt(seedKey + '_ct0', 0, 20000);
    var sec = base + qrnInt(seedKey + '_ct' + i, 4, 30) * (i + 1);
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
  }
  // ==================== 抽屉框架（对齐 antd Drawer） ====================
  function qrnCloseDrawer() {
    var mask = document.querySelector('.qrn-drawer-mask');
    var drawer = document.querySelector('.qrn-drawer');
    if (mask) mask.remove();
    if (drawer) drawer.remove();
    document.body.style.overflow = '';
  }

  function qrnOpenDrawer(opts) {
    qrnCloseDrawer();
    qrnEnsureAiStyles();
    var mask = document.createElement('div');
    mask.className = 'qrn-drawer-mask';
    mask.addEventListener('click', function () { if (opts.maskClosable !== false) qrnCloseDrawer(); });
    var drawer = document.createElement('div');
    drawer.className = 'qrn-drawer';
    var width = opts.width || Math.max(1120, Math.round(window.innerWidth * 0.85));
    drawer.style.width = width + 'px';
    drawer.style.maxWidth = '100vw';
    var html = '<div class="qrn-drawer-header"><span>' + qrnEsc(opts.title || '') + '</span>' +
      '<button class="qrn-drawer-close" title="关闭">✕</button></div>' +
      '<div class="qrn-drawer-body">' + (opts.body || '') + '</div>';
    if (opts.footer) html += '<div class="qrn-drawer-footer">' + opts.footer + '</div>';
    drawer.innerHTML = html;
    document.body.appendChild(mask);
    document.body.appendChild(drawer);
    document.body.style.overflow = 'hidden';
    drawer.querySelector('.qrn-drawer-close').addEventListener('click', qrnCloseDrawer);
    if (opts.onMount) opts.onMount(drawer);
    return drawer;
  }

  // ==================== 详情抽屉（AiAnalysis，appealOperate=false 查看模式） ====================
  var qrnDetailCtx = null;

  // VideoComponent：一级tab（回访记录）+ 二级tab（通话记录）+ audio
  function qrnAiVideoHtml(ctx) {
    var html = '<div class="qrn-vc-wrap">';
    html += '<div class="qrn-vc-top"><div class="qrn-first-tabs-inner">';
    ctx.records.forEach(function (rec, i) {
      var badge = rec.canAppealCount > 0 ? '<div class="qrn-first-tabs-badge">' + rec.canAppealCount + '</div>' : '';
      html += '<div class="qrn-first-tabs-item' + (ctx.firstTab === i ? ' qrn-first-active' : '') + '" data-ft="' + i + '">' +
        '<div style="padding-right:4px">回访记录' + (i + 1) + '</div>' + badge + '</div>';
    });
    var allBadge = ctx.records.reduce(function (a, r) { return a + r.canAppealCount; }, 0);
    html += '<div class="qrn-first-tabs-item' + (ctx.firstTab === -1 ? ' qrn-first-active' : '') + '" data-ft="-1">' +
      '<div style="padding-right:4px">全部回访</div>' + (allBadge > 0 ? '<div class="qrn-first-tabs-badge">' + allBadge + '</div>' : '') + '</div>';
    html += '</div><div class="qrn-second-tabs-wrap"><div class="qrn-second-tabs-inner">';
    ctx.curCalls.forEach(function (call, j) {
      var badge = call.canAppealCount > 0 ? '<div class="qrn-second-tabs-badge">' + call.canAppealCount + '</div>' : '';
      html += '<div class="qrn-second-tabs-item' + (ctx.secondTab === j ? ' qrn-second-active' : '') + '" data-st="' + j + '">' +
        '<div style="padding-right:4px">通话记录' + (j + 1) + '</div>' + badge + '</div>';
    });
    html += '</div></div></div>';
    html += '<div class="qrn-vc-bottom"><audio controls style="outline:none;flex:1"></audio>' +
      '<a class="qrn-link" style="margin-left:12px" id="qrnAiOpenAudio">点击播放录音</a></div>';
    html += '</div>';
    return html;
  }

  // ScoreFormula：满分基准 100 - 扣分项… = 质检总分
  function qrnAiFormulaHtml(formula) {
    var html = '<div class="qrn-score-formula">';
    html += '<span class="qrn-sf-label">满分基准</span><span class="qrn-sf-value">' + formula.baseScore + '</span>';
    formula.deductions.forEach(function (d) {
      html += '<span class="qrn-sf-operator">-</span><span class="qrn-sf-label">' + qrnEsc(d.label) + '</span><span class="qrn-sf-value-danger">' + d.value + '</span>';
    });
    html += '<span class="qrn-sf-operator">=</span><span class="qrn-sf-label-bold">质检总分</span><span class="qrn-sf-value-total">' + formula.totalScore + '</span>';
    html += '</div>';
    return html;
  }

  // RadarComponent：Card 员工质检 → 模型诊断 + 指标项得分 + 三列标签 + 雷达图
  function qrnAiRadarHtml(ctx) {
    var sd = ctx.scoreAnalyse;
    var tipRows = sd.map(function (f) {
      return '<div class="qrn-ai-tip-row"><div>' + qrnEsc(f.firstSortName) + '</div><div>' + f.firstSortPercent + '%</div></div>';
    }).join('');
    function labels(idx) {
      var out = '';
      if (sd[idx]) {
        sd[idx].secondSorts.forEach(function (sec) {
          sec.thirdSorts.forEach(function (t) {
            out += '<div class="qrn-ai-rl' + (t.triggerShowFlag ? ' qrn-ai-rl-on' : '') + '">' + qrnEsc(t.thirdSortName) + '</div>';
          });
        });
      }
      return out;
    }
    var html = '<div class="qrn-card"><div class="qrn-card-head"><span class="qrn-card-title">员工质检</span></div><div class="qrn-card-body">';
    html += '<div class="qrn-ai-title-wrap"><div class="qrn-ai-title-line"></div><div class="qrn-ai-title-text">模型诊断</div>' +
      '<span class="qrn-ai-title-sub">蓝色为得分项，灰色为未完成项</span></div>';
    html += '<div class="qrn-ai-radar-toplabels">' + labels(0) + '</div>';
    html += '<div class="qrn-ai-score-total-wrap"><div class="qrn-ai-score-total">' +
      '<span class="qrn-ai-tip-icon">?<div class="qrn-ai-tip-pop"><div style="margin-bottom:8px">质检总分是加权之后的分数，具体权重占比为：</div>' + tipRows + '</div></span>' +
      '<span>指标项得分</span>&nbsp;&nbsp;<span class="qrn-ai-score-num">' + ctx.formula.inspectionScore + '</span></div></div>';
    html += '<div class="qrn-ai-radar-row">' +
      '<div class="qrn-ai-radar-side"><div class="qrn-ai-rls">' + labels(1) + '</div></div>' +
      '<div class="qrn-ai-radar-chart" id="qrnAiRadarChart"></div>' +
      '<div class="qrn-ai-radar-side"><div class="qrn-ai-rls">' + labels(2) + '</div></div>' +
      '</div>';
    html += '</div></div>';
    return html;
  }

  // ChatComponent：当前通话会话记录（SpeakerId 1销售 2客户）
  function qrnAiChatHtml(sentences, title, showExport) {
    var html = '<div class="qrn-card"><div class="qrn-card-head"><span class="qrn-card-title">' + qrnEsc(title) + '</span>';
    if (showExport) {
      html += '<span class="qrn-card-extra"><span class="qrn-export-button" id="qrnAiExportText">导出录音文本</span></span>';
    }
    html += '</div><div class="qrn-card-body"><div class="qrn-ai-chat-box"><div class="qrn-ai-chat-main">';
    sentences.forEach(function (s, i) {
      var time = '<span class="qrn-time-text' + (s.SpeakerId === '1' ? ' qrn-time-right' : '') + '">' + s.time + '</span>';
      if (s.SpeakerId === '2') {
        html += '<div class="qrn-customer-wrap"><div class="qrn-icon-wrap"><div class="qrn-icon-customer">客</div></div>' +
          '<div class="qrn-customer-text-wrap"><div class="qrn-customer-text-inner"><div class="qrn-chat-text">' + qrnEsc(s.Text) + '</div></div></div></div>' + time;
      } else {
        html += '<div class="qrn-sales-wrap"><div class="qrn-sales-text-wrap"><div class="qrn-sales-text-inner"><div class="qrn-chat-text">' + qrnEsc(s.Text) + '</div></div></div>' +
          '<div class="qrn-icon-wrap"><div class="qrn-icon-sales">销</div></div></div>' + time;
      }
    });
    html += '</div></div></div></div>';
    return html;
  }

  // TableComponentNew：Card 客服规范 → 可申诉细项 + 一级/二级tab + custom-table
  function qrnAiTableHtml(ctx) {
    var sd = ctx.scoreAnalyse;
    var totalCan = sd.reduce(function (a, f) { return a + f.canAppealCount; }, 0);
    var cur = sd[ctx.tFirstTab] || sd[0];
    var html = '<div class="qrn-card"><div class="qrn-card-head"><span class="qrn-card-title"> 客服规范</span>' +
      '<span class="qrn-card-extra"><div class="qrn-vc-appeal-count" style="margin-bottom:0">可申诉细项：<span style="font-weight:bold;margin-right:12px">' + totalCan + '个</span></div></span></div>';
    html += '<div class="qrn-card-body">';
    // 一级 antd Tabs type=card
    html += '<div class="qrn-cardtabs">';
    sd.forEach(function (f, i) {
      html += '<div class="qrn-cardtabs-item' + (i === ctx.tFirstTab ? ' qrn-cardtabs-active' : '') + '" data-tf="' + i + '">' +
        qrnEsc(f.firstSortName) + (f.canAppealCount > 0 ? '<span class="qrn-cardtabs-badge">' + f.canAppealCount + '</span>' : '') + '</div>';
    });
    html += '</div>';
    // 二级 tab
    html += '<div class="qrn-second-tabs-wrap"><div class="qrn-second-tabs-inner">';
    if (cur) {
      cur.secondSorts.forEach(function (sec, j) {
        html += '<div class="qrn-second-tabs-item' + (j === ctx.tSecondTab ? ' qrn-second-active' : '') + '" data-ts="' + j + '">' +
          '<div style="padding-right:4px">' + qrnEsc(sec.secondSortName) + '</div>' +
          (sec.canAppealCount > 0 ? '<div class="qrn-second-tabs-badge">' + sec.canAppealCount + '</div>' : '') + '</div>';
      });
    }
    html += '</div></div>';
    // 表格
    var rows = cur && cur.secondSorts[ctx.tSecondTab] ? cur.secondSorts[ctx.tSecondTab].thirdSorts : [];
    if (rows.length) {
      html += '<table class="qrn-custom-table"><tbody>';
      rows.forEach(function (t) {
        var statusText = '';
        if (t.isAppeal) statusText = '<span style="color:' + (t.isPass === false ? '#D92D21' : '#00CE86') + '">' + (t.isPass === false ? '审核不通过' : '审核通过') + '</span>';
        html += '<tr class="qrn-ct-row' + (t.canAppeal ? ' qrn-ct-row-error' : '') + '">' +
          '<td class="qrn-ct-col">' + qrnEsc(t.thirdSortName) + '</td>' +
          '<td class="qrn-ct-col" style="width:370px">' + qrnEsc(t.thirdSortDesc) + '</td>' +
          '<td class="qrn-ct-col"><div class="qrn-ct-status">' + statusText +
          (t.triggerShowFlag ? '<span class="qrn-label-trigger">触发</span>' : '<span class="qrn-label-no-trigger">未触发</span>') +
          '</div></td></tr>';
      });
      html += '</tbody></table>';
    } else {
      html += '<div class="qrn-empty">此类目下无申诉项</div>';
    }
    html += '</div></div>';
    return html;
  }

  function qrnOpenDetailDrawer(row) {
    var seedKey = row.seedKey || row.hdClueId;
    var sentences = qrnGetChatSentences(seedKey).map(function (s, i) {
      s.time = qrnChatTime(seedKey, i);
      return s;
    });
    var ctx = {
      row: row, seedKey: seedKey, sentences: sentences,
      records: qrnBuildReviewRecords(seedKey, row),
      scoreAnalyse: qrnBuildScoreAnalyse(seedKey),
      firstTab: -1, secondTab: 0,
      tFirstTab: 0, tSecondTab: 0
    };
    ctx.formula = qrnBuildFormula(seedKey, ctx.scoreAnalyse);
    ctx.curCalls = ctx.firstTab === -1
      ? ctx.records.reduce(function (a, r) { return a.concat(r.calls); }, [])
      : ctx.records[ctx.firstTab].calls;
    qrnDetailCtx = ctx;

    var drawer = qrnOpenDrawer({
      title: '质检详情 - ' + row.custName + '（' + row.hdClueId + '）',
      body: '<div id="qrnAiBody"></div>'
    });
    qrnRenderDetailBody(drawer);
  }

  // 基础信息（Descriptions 两列布局，对齐 BaseInfoComponent 结构）
  function qrnBaseInfoHtml(row) {
    var src = qrnSourceDict.find(function (d) { return d.code === row.clueSource; });
    var items = [
      ['线索编码', row.hdClueId], ['客户姓名', row.custName],
      ['联系电话', row.custTel], ['线索类型', row.clueType],
      ['线索来源', src ? src.name : row.clueSource], ['线索R渠道', row.rchannelName],
      ['车系', row.seriesName], ['坐席名称', row.seatName],
      ['通话次数', row.followTimes], ['通话总时长', row.callDuration],
      ['首次通话时间', row.firstReviewTime], ['末次通话时间', row.lastReviewTime]
    ];
    var html = '<div class="qrn-card"><div class="qrn-card-head"><span class="qrn-card-title">基础信息</span></div>' +
      '<div class="qrn-card-body" style="padding:0"><div class="qrn-desc-module">';
    for (var i = 0; i < items.length; i += 2) {
      html += '<div class="qrn-desc-grid">';
      html += '<div class="qrn-desc-item"><div class="qrn-desc-item-label">' + qrnEsc(items[i][0]) + '</div><div class="qrn-desc-item-content">' + qrnEsc(items[i][1]) + '</div></div>';
      if (items[i + 1]) html += '<div class="qrn-desc-item"><div class="qrn-desc-item-label">' + qrnEsc(items[i + 1][0]) + '</div><div class="qrn-desc-item-content">' + qrnEsc(items[i + 1][1]) + '</div></div>';
      html += '</div>';
    }
    html += '</div></div></div>';
    return html;
  }

  function qrnRenderDetailBody(drawer) {
    var ctx = qrnDetailCtx;
    if (!ctx) return;
    var body = drawer.querySelector('#qrnAiBody');
    var html = qrnBaseInfoHtml(ctx.row);
    html += '<div style="height:20px"></div>';
    html += qrnAiVideoHtml(ctx);
    html += qrnAiFormulaHtml(ctx.formula);
    html += qrnAiRadarHtml(ctx);
    html += '<div style="height:20px"></div>';
    html += '<div class="qrn-ai-top"><div class="qrn-ai-right">' + qrnAiChatHtml(ctx.sentences, '当前通话会话记录', true) + '</div></div>';
    html += '<div style="height:20px"></div>';
    html += qrnAiTableHtml(ctx);
    body.innerHTML = html;

    // 一级/二级 tab（回访记录）
    body.querySelectorAll('[data-ft]').forEach(function (el) {
      el.addEventListener('click', function () {
        var ft = +el.getAttribute('data-ft');
        ctx.firstTab = ft; ctx.secondTab = 0;
        ctx.curCalls = ft === -1
          ? ctx.records.reduce(function (a, r) { return a.concat(r.calls); }, [])
          : ctx.records[ft].calls;
        qrnRenderDetailBody(drawer);
      });
    });
    body.querySelectorAll('[data-st]').forEach(function (el) {
      el.addEventListener('click', function () {
        ctx.secondTab = +el.getAttribute('data-st');
        qrnRenderDetailBody(drawer);
      });
    });
    // 表格一级/二级 tab
    body.querySelectorAll('[data-tf]').forEach(function (el) {
      el.addEventListener('click', function () {
        ctx.tFirstTab = +el.getAttribute('data-tf'); ctx.tSecondTab = 0;
        qrnRenderDetailBody(drawer);
      });
    });
    body.querySelectorAll('[data-ts]').forEach(function (el) {
      el.addEventListener('click', function () {
        ctx.tSecondTab = +el.getAttribute('data-ts');
        qrnRenderDetailBody(drawer);
      });
    });
    // 导出录音文本（原型模拟）
    var exp = body.querySelector('#qrnAiExportText');
    if (exp) exp.addEventListener('click', function () { qrnToast('录音文本导出任务已提交（演示）'); });
    var open = body.querySelector('#qrnAiOpenAudio');
    if (open) open.addEventListener('click', function () { qrnToast('演示环境无真实录音文件'); });
    // 雷达图
    var chartBox = body.querySelector('#qrnAiRadarChart');
    if (chartBox) {
      var canvas = document.createElement('canvas');
      chartBox.appendChild(canvas);
      var indicators = ctx.scoreAnalyse.map(function (f) {
        return { title: f.firstSortName, sub: f.score + '分' };
      });
      var values = ctx.scoreAnalyse.map(function (f) { return f.score; });
      qrnDrawRadar(canvas, indicators, values, { height: 460 });
    }
  }

  // ==================== 模块注册 ====================


  // ==================== 检核弹窗（EditForm DrawerForm 检核质量标签） ====================
  function qrnOpenEditForm(row) {
    var seedKey = row.seedKey || row.hdClueId;
    var sentences = qrnGetChatSentences(seedKey).map(function (s, i) {
      s.time = qrnChatTime(seedKey, i);
      return s;
    });
    var conclusion = qrnGetConclusion(seedKey);

    // 标签明细（BaseInfoComponent → DescComponent：二维数组分组 Descriptions column=2）
    var descHtml = '<div class="qrn-card"><div class="qrn-card-head"><span class="qrn-card-title">标签明细</span></div>' +
      '<div class="qrn-card-body" style="padding:0">';
    conclusion.forEach(function (group) {
      descHtml += '<div class="qrn-desc-module"><div class="qrn-desc-grid">';
      group.forEach(function (item) {
        descHtml += '<div class="qrn-desc-item"><div class="qrn-desc-item-label">' + qrnEsc(item.key) + '</div>' +
          '<div class="qrn-desc-item-content">' + qrnEsc(item.value) + '</div></div>';
      });
      descHtml += '</div></div>';
    });
    descHtml += '</div></div>';

    var formHtml =
      '<div class="qrn-vc-wrap" style="margin:0"><div class="qrn-vc-bottom"><audio controls style="outline:none;flex:1"></audio>' +
      '<a class="qro-link" style="margin-left:12px" id="qrnEfOpenAudio">点击播放录音</a></div></div>' +
      '<div style="height:20px"></div>' +
      '<div class="qrn-ai-top">' +
        '<div class="qrn-ai-right">' + qrnAiChatHtml(sentences, '会话记录', false) + '</div>' +
        '<div style="flex:20px 0 0"></div>' +
        '<div class="qrn-ai-left">' + descHtml + '</div>' +
      '</div>' +
      '<div style="height:20px"></div>' +
      '<div class="qrn-card"><div class="qrn-card-body">' +
        '<div class="qrn-ef-form">' +
          '<div class="qrn-ef-row" id="qrnEfPassRow"><div class="qrn-ef-label"><em>*</em>是否检核通过</div>' +
            '<div class="qrn-ef-control">' +
              '<label class="qro-radio-btn" style="border-radius:6px;margin-right:8px;cursor:pointer"><input type="radio" name="qrnEfPass" value="1" style="margin-right:6px">是</label>' +
              '<label class="qro-radio-btn" style="border-radius:6px;cursor:pointer"><input type="radio" name="qrnEfPass" value="0" style="margin-right:6px">否</label>' +
              '<div class="qrn-ef-error">请选择是否检核通过</div>' +
            '</div></div>' +
          '<div class="qrn-ef-row" id="qrnEfReasonRow"><div class="qrn-ef-label"><em>*</em>原因</div>' +
            '<div class="qrn-ef-control"><textarea class="qrn-textarea" id="qrnEfReason" maxlength="500" placeholder="请输入原因"></textarea>' +
            '<span class="qrn-ef-count" id="qrnEfCount">0/500</span>' +
            '<div class="qrn-ef-error">请输入原因</div></div></div>' +
          '<div class="qrn-ef-row" id="qrnEfInspectorRow"><div class="qrn-ef-label"><em>*</em>检核人</div>' +
            '<div class="qrn-ef-control"><input class="qro-input" id="qrnEfInspector" style="width:100%;box-sizing:border-box" placeholder="请输入检核人" />' +
            '<div class="qrn-ef-error">请输入检核人</div></div></div>' +
        '</div>' +
      '</div></div>';

    var drawer = qrnOpenDrawer({
      title: '检核质量标签',
      body: formHtml,
      footer: '<button class="qro-btn" id="qrnEfCancel">取消</button><button class="qro-btn qro-btn-primary" id="qrnEfSubmit">提 交</button>'
    });

    var reason = drawer.querySelector('#qrnEfReason');
    reason.addEventListener('input', function () {
      drawer.querySelector('#qrnEfCount').textContent = reason.value.length + '/500';
    });
    drawer.querySelector('#qrnEfOpenAudio').addEventListener('click', function () { qrnToast('演示环境无真实录音文件'); });
    drawer.querySelector('#qrnEfCancel').addEventListener('click', qrnCloseDrawer);

    function qrnEfValidate() {
      var ok = true;
      var passRow = drawer.querySelector('#qrnEfPassRow');
      var passChecked = drawer.querySelector('input[name="qrnEfPass"]:checked');
      passRow.classList.toggle('qrn-ef-invalid', !passChecked);
      if (!passChecked) ok = false;
      var reasonRow = drawer.querySelector('#qrnEfReasonRow');
      var reasonOk = !!reason.value.trim();
      reasonRow.classList.toggle('qrn-ef-invalid', !reasonOk);
      if (!reasonOk) ok = false;
      var insRow = drawer.querySelector('#qrnEfInspectorRow');
      var insOk = !!drawer.querySelector('#qrnEfInspector').value.trim();
      insRow.classList.toggle('qrn-ef-invalid', !insOk);
      if (!insOk) ok = false;
      return ok;
    }

    drawer.querySelector('#qrnEfSubmit').addEventListener('click', function () {
      if (!qrnEfValidate()) return;
      row.isCheck = true;
      qrnState.clueChecked[row.hdClueId] = true;
      qrnCloseDrawer();
      qrnToast('操作成功');
      qrnRenderClueTable();
    });
  }


  // ==================== 模块注册 ====================
  window.renderQualityReportPage = renderQualityReportPage;

  // 共享 API（供 32-quality-appeal.js 复用抽屉框架/AiAnalysis 组件，纯导出不影响本页逻辑）
  window.qrnAppealShared = {
    ensureStyles: qrnEnsureStyles,
    ensureAiStyles: qrnEnsureAiStyles,
    openDrawer: qrnOpenDrawer,
    closeDrawer: qrnCloseDrawer,
    buildScoreAnalyse: qrnBuildScoreAnalyse,
    buildFormula: qrnBuildFormula,
    buildReviewRecords: qrnBuildReviewRecords,
    getChatSentences: qrnGetChatSentences,
    chatTime: qrnChatTime,
    drawRadar: qrnDrawRadar,
    aiFormulaHtml: qrnAiFormulaHtml,
    aiRadarHtml: qrnAiRadarHtml,
    aiChatHtml: qrnAiChatHtml,
    baseInfoHtml: qrnBaseInfoHtml,
    esc: qrnEsc,
    toast: qrnToast
  };
})();
