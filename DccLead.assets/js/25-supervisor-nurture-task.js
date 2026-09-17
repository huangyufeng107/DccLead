/**
 * 24. 主管培育任务 - 分配审核工作台
 * 按照真实系统结构一比一复刻 - 完整筛选条件+展开/收起
 */
(function () {
  'use strict';

  // ==================== 下拉选项数据 ====================
  const CAR_SERIES_OPTIONS = ['Model Y', 'Model 3', 'Model X', 'Model S', '理想L7', '理想L8', '蔚来ET5', '蔚来ES6', '比亚迪汉', '比亚迪海豹', '小鹏G6', '问界M7'];
  const LEAD_SOURCES = ['专营店新建', '搜索引擎', '信息流广告', '自然流量', '老客户推荐', '社群营销', '官网直接访问'];
  const R_CHANNELS = ['R1-百度SEM', 'R2-抖音信息流', 'R3-天网行动', 'R4-微信朋友圈', 'R5-官网SEO', 'R6-小红书', 'R7-懂车帝'];
  const LEAD_LEVELS = ['H', 'A', 'B', 'C'];
  const ASSIGN_RULES = ['自动分配', '平均分配', '能力优先', '就近分配', '随机(按顺序轮流分配)', '智能分配'];
  const DEALERS = ['NEV零售中心F-N2512', '深圳南山中心店', '深圳福田旗舰店', '广州天河体验中心', '东莞南城交付中心', '佛山顺德门店'];
  const TEST_DRIVE_SCHEDULES = ['是', '否'];
  const AGENT_ACCOUNTS = ['A001', 'A002', 'A003', 'A004', 'A005', 'A006', 'A007', 'A008'];
  const AGENT_NAMES = ['张伟', '李娜', '王芳', '刘洋', '陈明', '赵静', '孙磊', '周丽'];
  const YES_NO_OPTIONS = ['是', '否'];
  const FOLLOW_STATUS = ['未跟进', '跟进中', '已成交', '客户放弃'];
  const ASSIGN_STATUS = ['未分配', '已分配', '分配中'];
  const AI_ORDER_STATUS = ['待处理', '处理中', '已完成'];
  const SMART_FILL_STATUS = ['待审核', '审核通过', '审核驳回'];
  const AUDIT_RESULT = ['通过', '驳回', '待审核'];
  const ASSIGN_METHODS = ['自动分配', '人工分配', '智能分配'];
  const AI_CALL_TYPES = ['AI外呼', '人工外呼', '混合外呼'];
  const PAGE_VIEW_RANGES = ['0-10次', '10-30次', '30次以上'];
  const BTN_CLICK_RANGES = ['0-5次', '5-15次', '15次以上'];
  const AUDIT_TIMEOUT = ['未超时', '已超时'];
  const MANUAL_AUDIT = ['是', '否'];
  const PLATFORMS = ['微信', '抖音', '百度', '官网', '懂车帝'];
  const CHANNELS = ['企微加微', '官网留资', '抖音推广', '小程序', '400电话'];
  const CONTACT_STATUSES = ['已接触', '未接触', '无意向', '客户忙', '空号', '关机'];
  const SUBMIT_RESULTS = ['已成交', '待跟进', '客户放弃', '无法联系', '预约试驾', '已邀约到店'];
  const REASONS = ['价格太高', '对比其他品牌', '近期不考虑', '已购其他车型', '需要家人商量', '距离太远', '暂无优惠', '其他'];

  // ==================== 模拟数据生成 ====================
  function randomDate(daysAgo = 30, daysAfter = 0) {
    const d = new Date();
    const offset = (Math.random() * (daysAgo + daysAfter)) - daysAfter;
    d.setDate(d.getDate() - offset);
    return d.toISOString().slice(0, 10);
  }

  function randomDateTime(daysAgo = 30, daysAfter = 0) {
    const d = new Date();
    const offset = (Math.random() * (daysAgo + daysAfter)) - daysAfter;
    d.setDate(d.getDate() - offset);
    d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}:${s}`;
  }

  function randomSmartCode() {
    const year = 2025;
    const part1 = String(Math.floor(Math.random() * 90000) + 10000);
    const part2 = String(Math.floor(Math.random() * 9000) + 1000);
    const part3 = String(Math.floor(Math.random() * 900) + 100);
    const part4 = String(Math.floor(Math.random() * 9000000) + 1000000);
    return `C${year}-${part1}-${part2}-${part3}-${part4}`;
  }

  function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generateAssignData(count, type = 'new', isLz = false) {
    const leadNames = ['张先生', '李女士', '王先生', '刘先生', '陈女士', '赵先生', '孙女士', '周先生', '吴女士', '郑先生'];
    const genders = ['男', '女'];
    const leadTypes = ['贫线索', '新车', '售后', '试驾', '续保', '保养', '置换'];
    const taskPrefix = isLz ? 'LZ' : 'RW';
    const leadPrefix = isLz ? 'LZ' : 'XS';
    const callStatuses = ['未呼叫', '呼叫中', '已接通', '未接通', '空号', '关机', '拒接'];
    const callResults = ['', '', '有意向', '无意向', '待跟进', '预约试驾', '已邀约到店'];
    const provinces = ['广东', '广东', '广东', '浙江', '江苏', '北京', '上海'];
    const cities = ['深圳', '广州', '东莞', '佛山', '杭州', '南京', '北京', '上海'];

    return Array.from({ length: count }, (_, i) => {
      const hasLastFollow = type !== 'new' && Math.random() > 0.3;
      const callCount = hasLastFollow ? Math.floor(Math.random() * 4) + 1 : 0;
      const lastCallStatus = callCount > 0 ? randomItem(callStatuses) : '未呼叫';
      const lastCallResult = lastCallStatus === '已接通' ? randomItem(callResults.slice(2)) : '';
      const priorityLabels = ['高', '中', '低'];
      return {
        id: `${isLz ? 'lz_' : ''}${type}_${Date.now()}_${i}`,
        seq: i + 1,
        taskCode: `${taskPrefix}202609${String(10000 + i).padStart(5, '0')}`,
        leadCode: `${leadPrefix}202609${String(20000 + i).padStart(5, '0')}`,
        lastAgentAccount: hasLastFollow ? randomItem(AGENT_ACCOUNTS) : '',
        lastAgentName: hasLastFollow ? randomItem(AGENT_NAMES) : '',
        leadName: randomItem(leadNames),
        gender: randomItem(genders),
        phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        intentCarSeries: randomItem(CAR_SERIES_OPTIONS),
        latestCaptureCarSeries: randomItem(CAR_SERIES_OPTIONS),
        leadType: randomItem(leadTypes),
        leadSource: randomItem(LEAD_SOURCES),
        smartCode: randomSmartCode(),
        rChannel: randomItem(R_CHANNELS),
        initialIntentLevel: randomItem(LEAD_LEVELS),
        captureTime: randomDateTime(20, type === 'overdue' ? 10 : 0),
        taskReceiveTime: randomDateTime(10, type === 'overdue' ? -3 : 2),
        agentAccount: type === 'new' ? '' : randomItem(AGENT_ACCOUNTS),
        agentName: type === 'new' ? '' : randomItem(AGENT_NAMES),
        assignRule: randomItem(ASSIGN_RULES),
        testDriveSchedule: randomItem(TEST_DRIVE_SCHEDULES),
        intentDealer: randomItem(DEALERS),
        hasLastFollow: hasLastFollow ? '是' : '否',
        // 详情补充字段
        province: randomItem(provinces),
        city: randomItem(cities),
        age: Math.floor(Math.random() * 30) + 25,
        budget: randomItem(['10-15万', '15-20万', '20-25万', '25-35万', '35万以上']),
        purchaseTime: randomItem(['1个月内', '1-3个月', '3-6个月', '半年以上']),
        isTestDrive: randomItem(YES_NO_OPTIONS),
        competitor: randomItem(['特斯拉Model 3', '比亚迪汉', '小鹏P7', '蔚来ET5', '无', '']),
        callCount: callCount,
        lastCallStatus: lastCallStatus,
        lastCallResult: lastCallResult,
        lastCallTime: hasLastFollow ? randomDateTime(5, 0) : '',
        callDuration: hasLastFollow ? Math.floor(Math.random() * 300) + 30 : 0,
        priority: type === 'overdue' ? '高' : randomItem(priorityLabels),
        taskStatus: type === 'overdue' ? '已逾期' : (type === 'new' ? '待分配' : '进行中'),
        remark: hasLastFollow ? randomItem(['客户有意向，需继续跟进', '客户表示近期会到店', '客户对比中，需要优惠信息', '']) : '',
        failReason: lastCallStatus === '未接通' ? randomItem(['无人接听', '占线', '信号不好']) : (lastCallStatus === '空号' ? '号码无效' : ''),
        callRecords: generateCallRecords(callCount, hasLastFollow)
      };
    });
  }

  function generateCallRecords(count, hasLastFollow) {
    if (count === 0) return [];
    const statuses = ['已接通', '未接通', '拒接', '关机'];
    const results = ['有意向', '待跟进', '无意向', '预约试驾', ''];
    const durations = [60, 120, 180, 240, 300, 45, 30, 0, 0];
    const records = [];
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1 && hasLastFollow;
      const status = isLast ? '已接通' : randomItem(statuses);
      records.push({
        time: randomDateTime(10 + i * 2, 0),
        status: status,
        duration: status === '已接通' ? randomItem(durations.slice(0, 5)) : 0,
        result: status === '已接通' ? randomItem(results.slice(0, 4)) : '',
        agent: randomItem(AGENT_NAMES),
        remark: status === '已接通' ? randomItem(['客户询问优惠活动', '客户了解车型配置', '客户表示考虑一下', '客户预约周末到店', '']) : ''
      });
    }
    return records.reverse();
  }

  function generateAuditData(count) {
    const leadNames = ['张先生', '李女士', '王先生', '刘先生', '陈女士', '赵先生', '孙女士', '周先生', '吴女士', '郑先生'];
    const genders = ['男', '女'];
    const leadTypes = ['新车', '售后', '试驾', '续保', '保养', '置换'];
    const descriptions = ['客户表示近期有购车计划，需要进一步跟进', '客户对车型感兴趣，邀约周末到店', '客户暂时不考虑，建议后续回访', '客户已购买其他品牌，标记战败', '客户询问价格和优惠政策', '客户要求发送详细配置资料', '客户对续航里程有疑问', '客户对售后服务比较关心'];

    return Array.from({ length: count }, (_, i) => {
      const hasRemark = Math.random() > 0.4;
      const followCount = Math.floor(Math.random() * 8) + 1;
      return {
        id: `audit_${Date.now()}_${i}`,
        seq: i + 1,
        taskCode: `RW202609${String(10000 + i).padStart(5, '0')}`,
        leadCode: `XS202609${String(20000 + i).padStart(5, '0')}`,
        leadName: randomItem(leadNames),
        gender: randomItem(genders),
        phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        intentCarSeries: randomItem(CAR_SERIES_OPTIONS),
        latestCaptureCarSeries: randomItem(CAR_SERIES_OPTIONS),
        leadType: randomItem(leadTypes),
        leadSource: randomItem(LEAD_SOURCES),
        followCount: followCount,
        submitTime: randomDate(7, 0),
        lastFollowTime: randomDate(3, 0),
        contactStatus: randomItem(CONTACT_STATUSES),
        submitResult: randomItem(SUBMIT_RESULTS),
        submitReason: randomItem(REASONS),
        followDesc: randomItem(descriptions),
        remark: hasRemark ? randomItem(['客户已预约试驾', '需要重点跟进', '客户意向高', '已发送资料', '等待客户回复']) : '',
        assignTime: randomDate(15, 5),
        agentAccount: randomItem(AGENT_ACCOUNTS),
        agentName: randomItem(AGENT_NAMES),
        result: Math.random() > 0.3 ? '待审核' : randomItem(['通过', '驳回'])
      };
    });
  }

  function generateIncompleteData(count) {
    const leadNames = ['张先生', '李女士', '王先生', '刘先生', '陈女士', '赵先生', '孙女士', '周先生', '吴女士', '郑先生'];
    const genders = ['男', '女'];
    const stayDurations = ['2分33秒', '4分50秒', '8分24秒', '15分26秒', '11分0秒', '17分57秒', '16分11秒', '29分15秒', '25分23秒', '6分12秒'];
    const incompleteFields = ['未填写意向车型', '未填写购车预算', '未填写购车时间', '联系方式不完整'];
    const assignStatusList = ['未分配', '已分配'];
    const followStatusList = ['已成交', '客户放弃', '未跟进', '跟进中'];
    const assignMethodList = ['智能分配', '人工分配', '自动分配'];
    const aiCallTypeList = ['人工外呼', 'AI外呼', '混合外呼'];
    const remarkTexts = ['客户多次访问配置页', '高意向客户', '预算明确待跟进', '需要再次联系', ''];
    const platforms = ['官网', 'APP', '小程序', '抖音', '懂车帝', '汽车之家', '微信'];

    return Array.from({ length: count }, (_, i) => {
      const isAssigned = Math.random() > 0.5;
      const followStatus = randomItem(followStatusList);
      const incompleteField = randomItem(incompleteFields);
      const lastFollowed = Math.random() > 0.3;
      return {
        id: `incomplete_${Date.now()}_${i}`,
        seq: i + 1,
        taskCode: `PY202609${String(10000 + i).padStart(5, '0')}`,
        leadCode: `LZ202609${String(20000 + i).padStart(5, '0')}`,
        lastAssignMethod: isAssigned ? randomItem(assignMethodList) : '-',
        lastAiCallType: randomItem(aiCallTypeList),
        lastFollowAgentAccount: lastFollowed ? randomItem(AGENT_ACCOUNTS) : '-',
        lastFollowAgentName: lastFollowed ? randomItem(AGENT_NAMES) : '-',
        leadName: randomItem(leadNames),
        gender: randomItem(genders),
        phone: `137${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        intentCarSeries: randomItem(CAR_SERIES_OPTIONS),
        leadSource: randomItem(LEAD_SOURCES),
        platform: randomItem(platforms),
        smartCode: randomSmartCode(),
        assignStatus: isAssigned ? '已分配' : '未分配',
        captureTime: randomDateOnly(15, 0),
        followStatus: followStatus,
        followCount: Math.floor(Math.random() * 10),
        assignAgentName: isAssigned ? randomItem(AGENT_NAMES) : '-',
        lastFollowTime: lastFollowed && followStatus !== '未跟进' ? randomDateOnly(5, 0) : '-',
        assignTime: isAssigned ? randomDateOnly(10, 0) : '-',
        pageViews30d: Math.floor(Math.random() * 50) + 2,
        btnClicks30d: Math.floor(Math.random() * 20),
        // 额外字段用于详情
        createTime: randomDateOnly(20, 5),
        rChannel: randomItem(R_CHANNELS),
        lastActiveTime: randomDateOnly(5, 0),
        stayDuration: randomItem(stayDurations),
        incompleteField: incompleteField,
        remark: randomItem(remarkTexts),
        age: Math.floor(Math.random() * 30) + 25,
        province: '广东',
        city: randomItem(['深圳', '广州', '东莞', '佛山']),
        budget: randomItem(['10-15万', '15-20万', '20-25万', '25-35万', '35万以上', '']),
        purchaseTime: randomItem(['1个月内', '1-3个月', '3-6个月', '半年以上', '']),
        isTestDrive: randomItem(YES_NO_OPTIONS),
        intentDealer: randomItem(DEALERS),
        initialIntentLevel: randomItem(LEAD_LEVELS),
        latestCaptureCarSeries: randomItem(CAR_SERIES_OPTIONS),
        priority: randomItem(['高', '中', '低'])
      };
    });
  }

  function randomDateOnly(daysAgo = 30, daysAfter = 0) {
    const d = new Date();
    const offset = (Math.random() * (daysAgo + daysAfter)) - daysAfter;
    d.setDate(d.getDate() - offset);
    return d.toISOString().slice(0, 10);
  }

  function generateAiOrderData(count) {
    const leadNames = ['张先生', '李女士', '王先生', '刘先生', '陈女士', '周女士', '吴先生', '郑女士'];
    const transferReasons = ['信息不完整', '客户要求人工', 'AI无法处理', '高意向客户', '投诉建议'];
    const smartFillStatusList = ['审核通过', '审核驳回', '待审核'];
    const auditStatusList = ['待审核', '驳回', '通过'];
    const auditTimeoutList = ['未超时', '已超时'];
    const auditResultList = ['待审核', '通过', '驳回'];
    const orderTypes = ['线索培育', '智能外呼', '信息补全', '预约试驾'];

    return Array.from({ length: count }, (_, i) => {
      const smartFillStatus = randomItem(smartFillStatusList);
      const auditStatus = smartFillStatus === '待审核' ? '待审核' : (smartFillStatus === '审核驳回' ? '驳回' : randomItem(auditStatusList));
      const auditTimeout = Math.random() > 0.4 ? '已超时' : '未超时';
      const auditResult = auditStatus === '待审核' ? '待审核' : randomItem(['通过', '驳回']);
      const hasAuditor = auditStatus !== '待审核';
      return {
        id: `ai_${Date.now()}_${i}`,
        seq: i + 1,
        visitRecordCode: `!6093${String(10000 + i).padStart(4, '0')}`,
        manualTaskCode: `RW202609${String(60000 + i).padStart(5, '0')}`,
        leadCode: `XS202609${String(30000 + i).padStart(5, '0')}`,
        leadName: randomItem(leadNames),
        phone: `136${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        gender: randomItem(['男', '女']),
        intentCarSeries: randomItem(CAR_SERIES_OPTIONS),
        latestCaptureCarSeries: randomItem(CAR_SERIES_OPTIONS),
        intentCarModel: randomItem(CAR_SERIES_OPTIONS),
        smartFillStatus: smartFillStatus,
        agentAccount: randomItem(AGENT_ACCOUNTS),
        agentName: randomItem(AGENT_NAMES),
        auditor: hasAuditor ? randomItem(AGENT_NAMES) : '-',
        createTime: randomDateOnly(10, 0),
        transferReason: randomItem(transferReasons),
        orderType: randomItem(orderTypes),
        auditStatus: auditStatus,
        auditTimeout: auditTimeout,
        auditResult: auditResult,
        remark: randomItem(['需要人工确认信息', '-', '']),
        captureTime: '2026-01-14 17:30:00',
        // 审核详情三栏布局字段
        intentLevel: randomItem(['H', 'A', 'B', 'C', 'E']),
        ipLocation: '广东 广州',
        leadType: 'AI智能体外呼',
        leadSource: 'id:1-DNDC-智能体',
        firstLeadStatus: '培育中',
        firstIntentLevel: 'A',
        followCount: Math.floor(Math.random() * 3),
        leadStatus: '培育中',
        leadDesc: 'AI外呼线索',
        intentDealer: '广州风日',
        purchaseTime: '-',
        purchaseDealer: '-',
        leadRemark: 'AI智能体处理',
        taskCode: `20260909${String(1649000000 + i).padStart(9, '0')}`,
        channelName: 'AI智能体渠道',
        mediaName: '智能外呼',
        bigProjectName: '东风日产-AI智能体外呼-2026',
        isAiCalled: '是',
        vinCode: '-',
        contactStatus: auditStatus !== '待审核' ? randomItem(['正常接通', '未接通', '关机', '空号', '拒接']) : '',
        callResult: auditStatus !== '待审核' ? randomItem(['下次回访', '已成交', '无意向', '待跟进', '预约试驾']) : '',
        backupPhone: '',
        lastVisitTime: '-',
        nextVisitTime: auditStatus !== '待审核' ? '2026-09-12 08:53' : '',
        audioDuration: '0:11',
        audioList: [{ name: '录音1', duration: '0:11', active: true }]
      };
    });
  }

  function generateFillAuditData(count) {
    const leadNames = ['王先生', '陈女士', '李女士', '李先生', '张先生', '周女士', '吴先生', '郑女士', '孙先生', '赵女士'];
    const transferReasons = ['信息不完整', '客户要求人工', 'AI无法处理', '高意向客户', '投诉建议'];
    const smartFillStatusList = ['审核通过', '审核驳回', '待审核'];
    const auditStatusList = ['待审核', '驳回', '通过'];
    const auditTimeoutList = ['未超时', '已超时'];
    const auditResultList = ['待审核', '通过', '驳回'];
    const remarkTexts = ['需要人工确认信息', '-', ''];

    return Array.from({ length: count }, (_, i) => {
      const smartFillStatus = randomItem(smartFillStatusList);
      const auditStatus = smartFillStatus === '待审核' ? '待审核' : (smartFillStatus === '审核驳回' ? '驳回' : randomItem(auditStatusList));
      const auditTimeout = Math.random() > 0.4 ? '已超时' : '未超时';
      const auditResult = auditStatus === '待审核' ? '待审核' : randomItem(['通过', '驳回']);
      const hasAuditor = auditStatus !== '待审核';
      return {
        id: `fill_${Date.now()}_${i}`,
        seq: i + 1,
        visitRecordCode: `!6092${String(10000 + i).padStart(4, '0')}`,
        manualTaskCode: `RW202609${String(50000 + i).padStart(5, '0')}`,
        leadCode: `XS202609${String(20000 + i).padStart(5, '0')}`,
        leadName: randomItem(leadNames),
        phone: `135${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        gender: randomItem(['男', '女']),
        intentCarSeries: randomItem(CAR_SERIES_OPTIONS),
        latestCaptureCarSeries: randomItem(CAR_SERIES_OPTIONS),
        intentCarModel: randomItem(CAR_SERIES_OPTIONS),
        smartFillStatus: smartFillStatus,
        agentAccount: randomItem(AGENT_ACCOUNTS),
        agentName: randomItem(AGENT_NAMES),
        auditor: hasAuditor ? randomItem(AGENT_NAMES) : '-',
        createTime: randomDateOnly(10, 0),
        transferReason: randomItem(transferReasons),
        auditStatus: auditStatus,
        auditTimeout: auditTimeout,
        auditResult: auditResult,
        remark: randomItem(remarkTexts),
        captureTime: '2026-01-14 17:30:00',
        // 审核详情三栏布局字段
        intentLevel: randomItem(['H', 'A', 'B', 'C', 'E']),
        ipLocation: '广东 广州',
        leadType: '线索类型名称',
        leadSource: 'id:1-DNDC-车巴巴',
        firstLeadStatus: '培育中',
        firstIntentLevel: 'A',
        latestIntentCarSeries: '-',
        followCount: Math.floor(Math.random() * 5),
        leadStatus: '培育中',
        leadDesc: '测试',
        intentDealer: '广州风日',
        purchaseTime: '-',
        purchaseDealer: '-',
        leadRemark: '测试',
        taskCode: `20260908${String(1649000000 + i).padStart(9, '0')}`,
        channelName: 'R3-天网行动',
        mediaName: '百度有驾',
        bigProjectName: '东风日产-总部-2025-2029-新能源小程序-预约试驾',
        isAiCalled: '否',
        vinCode: '-',
        // 回访表单
        contactStatus: auditStatus !== '待审核' ? randomItem(['正常接通', '未接通', '关机', '空号', '拒接']) : '',
        callResult: auditStatus !== '待审核' ? randomItem(['下次回访', '已成交', '无意向', '待跟进', '预约试驾']) : '',
        backupPhone: '',
        lastVisitTime: '-',
        nextVisitTime: auditStatus !== '待审核' ? '2026-09-12 08:53' : '',
        // 录音
        audioDuration: '0:11',
        audioList: [{ name: '录音1', duration: '0:11', active: true }]
      };
    });
  }

  // ==================== 页面状态 ====================
  let pageState = {
    mainTab: 'my_task',
    assignSubTab: 'new',
    assignLzSubTab: 'new',
    selectedRows: new Set(),
    currentPage: 1,
    pageSize: 10,
    filterExpanded: {
      assign: false,
      assign_lz: false,
      audit: false,
      incomplete: false,
      ai_order: false,
      fill_audit: false
    },
    assignData: {
      new: generateAssignData(25, 'new'),
      old: generateAssignData(20, 'old'),
      overdue: generateAssignData(15, 'overdue')
    },
    assignLzData: {
      new: generateAssignData(18, 'new', true),
      old: generateAssignData(12, 'old', true),
      overdue: generateAssignData(8, 'overdue', true)
    },
    auditData: generateAuditData(20),
    incompleteData: generateIncompleteData(30),
    aiOrderData: generateAiOrderData(8),
    fillAuditData: generateFillAuditData(25),
    assignFilters: {
      taskCode: '', leadCode: '', phone: '', intentCar: '', latestCar: '',
      leadSource: '', rChannel: '', intentLevel: '', captureStart: '', captureEnd: '',
      receiveStart: '', receiveEnd: '', agent: '', assignRule: '', hasLastFollow: '',
      testDrive: '', dealer: ''
    },
    auditFilters: {
      taskCode: '', leadCode: '', intentCar: '', latestCar: '',
      followCount: '', submitStart: '', submitEnd: '', lastStart: '', lastEnd: '',
      assignStart: '', assignEnd: '', agent: ''
    },
    incompleteFilters: {
      taskCode: '', leadCode: '', phone: '', smartCode: '',
      captureStart: '', captureEnd: '', followCount: '', lastFollowStart: '', lastFollowEnd: '',
      assignStart: '', assignEnd: '', pageViews: '', btnClicks: '',
      assignMethod: '', aiCallType: '', intentCar: '', leadSource: '',
      platform: '', assignStatus: '', followStatus: '', agent: ''
    },
    aiOrderFilters: {
      visitCode: '', manualCode: '', leadName: '', phone: '', auditor: '',
      createStart: '', createEnd: '', intentCar: '', latestCar: '',
      smartStatus: '', agent: '', auditResult: '', isManual: '', timeout: ''
    },
    fillAuditFilters: {
      visitCode: '', manualCode: '', leadName: '', phone: '', auditor: '',
      createStart: '', createEnd: '', intentCar: '', latestCar: '',
      smartStatus: '', agent: '', auditResult: '', timeout: ''
    },
    assignModal: {
      show: false,
      mode: 'all',
      agentFilter: '',
      agents: []
    },
    auditModal: {
      show: false,
      pass: true,
      selectedIds: [],
      remark: ''
    },
    detailModal: {
      show: false,
      tab: '',
      item: null
    }
  };

  const AGENT_LIST = [
    { account: 'A001', name: '张伟', todayReceived: 12, todayPending: 3, online: true },
    { account: 'A002', name: '李娜', todayReceived: 8, todayPending: 5, online: true },
    { account: 'A003', name: '王芳', todayReceived: 15, todayPending: 2, online: true },
    { account: 'A005', name: '陈明', todayReceived: 6, todayPending: 4, online: true },
    { account: 'A007', name: '孙磊', todayReceived: 10, todayPending: 6, online: true },
    { account: 'A008', name: '周丽', todayReceived: 9, todayPending: 1, online: true }
  ];

  // ==================== Tab配置 ====================
  const MAIN_TABS = [
    { key: 'my_task', label: '我的任务', badge: null },
    { key: 'assign', label: '任务分配', badge: null },
    { key: 'assign_lz', label: '任务分配-留资未满', badge: null },
    { key: 'audit', label: '任务审核', badge: null },
    { key: 'incomplete', label: '留资未满', badge: '99+' },
    { key: 'ai_order', label: '智能体工单', badge: '3' },
    { key: 'fill_audit', label: '填单审核', badge: '99+' }
  ];

  const ASSIGN_SUB_TABS = [
    { key: 'new', label: '新任务分配' },
    { key: 'old', label: '旧任务分配' },
    { key: 'overdue', label: '逾期任务分配' }
  ];

  // ==================== 工具函数 ====================
  function getStatusTagClass(status) {
    if (!status) return 'tag-default';
    if (status === '待分配' || status === '待处理' || status === '待审核' || status === '处理中' || status === '待跟进' || status === '未呼叫' || status === '呼叫中' || status === '进行中') return 'tag-warning';
    if (status === '已逾期' || status === '逾期未处理' || status === '驳回' || status === '客户放弃' || status === '无法联系' || status === '空号' || status === '关机' || status === '拒接' || status === '未接通' || status === '高') return 'tag-danger';
    if (status === '通过' || status === '已完成' || status === '已提醒' || status === '已成交' || status === '已接通' || status === '预约试驾' || status === '已邀约到店' || status === '有意向') return 'tag-success';
    if (status === '跟进中' || status === '中') return 'tag-info';
    if (status === '无意向' || status === '低') return 'tag-default';
    return 'tag-default';
  }

  function getPriorityTagClass(priority) {
    if (priority === '高') return 'sd-tag-danger';
    if (priority === '中') return 'sd-tag-warning';
    return 'sd-tag-info';
  }

  function renderTag(text, type) {
    if (!text) return '<span class="is-muted">-</span>';
    let cls = 'sd-tag ';
    if (type) {
      cls += 'sd-tag-' + type;
    } else {
      cls += getStatusTagClass(text).replace('tag-', 'sd-tag-');
    }
    return `<span class="${cls}">${text}</span>`;
  }

  function formatDuration(seconds) {
    if (!seconds) return '-';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}分${s}秒` : `${s}秒`;
  }

  function getCurrentData() {
    const { mainTab, assignSubTab, assignLzSubTab, assignData, assignLzData, auditData, incompleteData, aiOrderData, fillAuditData } = pageState;
    switch (mainTab) {
      case 'assign': return assignData[assignSubTab] || [];
      case 'assign_lz': return assignLzData[assignLzSubTab] || [];
      case 'audit': return auditData;
      case 'incomplete': return incompleteData;
      case 'ai_order': return aiOrderData;
      case 'fill_audit': return fillAuditData;
      default: return [];
    }
  }

  function getCurrentFilters() {
    switch (pageState.mainTab) {
      case 'assign':
      case 'assign_lz':
        return pageState.assignFilters;
      case 'audit': return pageState.auditFilters;
      case 'incomplete': return pageState.incompleteFilters;
      case 'ai_order': return pageState.aiOrderFilters;
      case 'fill_audit': return pageState.fillAuditFilters;
      default: return {};
    }
  }

  function isFilterExpanded() {
    return pageState.filterExpanded[pageState.mainTab] || false;
  }

  function resetCurrentFilters() {
    const emptyFilters = {
      assign: { taskCode: '', leadCode: '', phone: '', intentCar: '', latestCar: '', leadSource: '', rChannel: '', intentLevel: '', captureStart: '', captureEnd: '', receiveStart: '', receiveEnd: '', agent: '', assignRule: '', hasLastFollow: '', testDrive: '', dealer: '' },
      audit: { taskCode: '', leadCode: '', intentCar: '', latestCar: '', followCount: '', submitStart: '', submitEnd: '', lastStart: '', lastEnd: '', assignStart: '', assignEnd: '', agent: '' },
      incomplete: { taskCode: '', leadCode: '', phone: '', smartCode: '', captureStart: '', captureEnd: '', followCount: '', lastFollowStart: '', lastFollowEnd: '', assignStart: '', assignEnd: '', pageViews: '', btnClicks: '', assignMethod: '', aiCallType: '', intentCar: '', leadSource: '', platform: '', assignStatus: '', followStatus: '', agent: '' },
      ai_order: { visitCode: '', manualCode: '', leadName: '', phone: '', auditor: '', createStart: '', createEnd: '', intentCar: '', latestCar: '', smartStatus: '', agent: '', auditResult: '', isManual: '', timeout: '' },
      fill_audit: { visitCode: '', manualCode: '', leadName: '', phone: '', auditor: '', createStart: '', createEnd: '', intentCar: '', latestCar: '', smartStatus: '', agent: '', auditResult: '', timeout: '' }
    };
    const key = pageState.mainTab;
    if (key === 'assign_lz') {
      pageState.assignFilters = { ...emptyFilters.assign };
    } else {
      pageState[`${key}Filters`] = { ...emptyFilters[key] };
    }
    pageState.selectedRows.clear();
  }

  function getFilteredData() {
    const data = getCurrentData();
    const f = getCurrentFilters();

    return data.filter(item => {
      if (pageState.mainTab === 'assign' || pageState.mainTab === 'assign_lz') {
        if (f.taskCode && item.taskCode && !item.taskCode.includes(f.taskCode)) return false;
        if (f.leadCode && item.leadCode && !item.leadCode.includes(f.leadCode)) return false;
        if (f.phone && item.phone && !item.phone.includes(f.phone)) return false;
        if (f.intentCar && item.intentCarSeries && !item.intentCarSeries.includes(f.intentCar)) return false;
        if (f.latestCar && item.latestCaptureCarSeries && !item.latestCaptureCarSeries.includes(f.latestCar)) return false;
        if (f.leadSource && item.leadSource !== f.leadSource) return false;
        if (f.rChannel && item.rChannel !== f.rChannel) return false;
        if (f.intentLevel && item.initialIntentLevel !== f.intentLevel) return false;
        if (f.agent && item.agentAccount && !item.agentAccount.includes(f.agent)) return false;
        if (f.assignRule && item.assignRule !== f.assignRule) return false;
        if (f.hasLastFollow && item.hasLastFollow !== f.hasLastFollow) return false;
        if (f.testDrive && item.testDriveSchedule !== f.testDrive) return false;
        if (f.dealer && item.intentDealer !== f.dealer) return false;
        if (f.captureStart && item.captureTime < f.captureStart) return false;
        if (f.captureEnd && item.captureTime > f.captureEnd) return false;
        if (f.receiveStart && item.taskReceiveTime < f.receiveStart) return false;
        if (f.receiveEnd && item.taskReceiveTime > f.receiveEnd) return false;
        return true;
      }

      if (pageState.mainTab === 'audit') {
        if (f.taskCode && item.taskCode && !item.taskCode.includes(f.taskCode)) return false;
        if (f.leadCode && item.leadCode && !item.leadCode.includes(f.leadCode)) return false;
        if (f.intentCar && item.intentCarSeries && !item.intentCarSeries.includes(f.intentCar)) return false;
        if (f.latestCar && item.latestCaptureCarSeries && !item.latestCaptureCarSeries.includes(f.latestCar)) return false;
        if (f.followCount && String(item.followCount) !== f.followCount) return false;
        if (f.agent && item.agentAccount && !item.agentAccount.includes(f.agent)) return false;
        if (f.submitStart && item.submitTime < f.submitStart) return false;
        if (f.submitEnd && item.submitTime > f.submitEnd) return false;
        if (f.lastStart && item.lastFollowTime < f.lastStart) return false;
        if (f.lastEnd && item.lastFollowTime > f.lastEnd) return false;
        if (f.assignStart && item.assignTime < f.assignStart) return false;
        if (f.assignEnd && item.assignTime > f.assignEnd) return false;
        return true;
      }

      if (pageState.mainTab === 'incomplete') {
        if (f.taskCode && item.taskCode && !item.taskCode.includes(f.taskCode)) return false;
        if (f.leadCode && item.leadCode && !item.leadCode.includes(f.leadCode)) return false;
        if (f.phone && item.phone && !item.phone.includes(f.phone)) return false;
        if (f.smartCode && item.smartCode && !item.smartCode.includes(f.smartCode)) return false;
        if (f.followCount && String(item.followCount) !== f.followCount) return false;
        if (f.intentCar && item.intentCarSeries && !item.intentCarSeries.includes(f.intentCar)) return false;
        if (f.leadSource && item.leadSource !== f.leadSource) return false;
        if (f.assignStatus && item.assignStatus !== f.assignStatus) return false;
        if (f.followStatus && item.followStatus !== f.followStatus) return false;
        if (f.agent && item.agentAccount && !item.agentAccount.includes(f.agent)) return false;
        if (f.assignMethod && item.assignMethod !== f.assignMethod) return false;
        if (f.aiCallType && item.aiCallType !== f.aiCallType) return false;
        if (f.platform && item.platform !== f.platform) return false;
        if (f.pageViews) {
          const [min, max] = f.pageViews.replace('次', '').split('-').map(n => parseInt(n) || (f.pageViews.includes('以上') ? 9999 : 0));
          if (f.pageViews.includes('以上')) { if (item.pageViews < parseInt(f.pageViews)) return false; }
          else if (item.pageViews < min || item.pageViews > max) return false;
        }
        if (f.btnClicks) {
          const [min, max] = f.btnClicks.replace('次', '').split('-').map(n => parseInt(n) || (f.btnClicks.includes('以上') ? 9999 : 0));
          if (f.btnClicks.includes('以上')) { if (item.btnClicks < parseInt(f.btnClicks)) return false; }
          else if (item.btnClicks < min || item.btnClicks > max) return false;
        }
        if (f.captureStart && item.captureTime < f.captureStart) return false;
        if (f.captureEnd && item.captureTime > f.captureEnd) return false;
        if (f.lastFollowStart && item.lastFollowTime < f.lastFollowStart) return false;
        if (f.lastFollowEnd && item.lastFollowTime > f.lastFollowEnd) return false;
        if (f.assignStart && item.assignTime < f.assignStart) return false;
        if (f.assignEnd && item.assignTime > f.assignEnd) return false;
        return true;
      }

      if (pageState.mainTab === 'ai_order') {
        if (f.visitCode && item.visitRecordCode && !item.visitRecordCode.includes(f.visitCode)) return false;
        if (f.manualCode && item.manualTaskCode && !item.manualTaskCode.includes(f.manualCode)) return false;
        if (f.leadName && item.leadName && !item.leadName.includes(f.leadName)) return false;
        if (f.phone && item.phone && !item.phone.includes(f.phone)) return false;
        if (f.auditor && item.auditor && !item.auditor.includes(f.auditor)) return false;
        if (f.intentCar && item.intentCarSeries && !item.intentCarSeries.includes(f.intentCar)) return false;
        if (f.latestCar && item.latestCaptureCarSeries && !item.latestCaptureCarSeries.includes(f.latestCar)) return false;
        if (f.smartStatus && item.smartFillStatus !== f.smartStatus) return false;
        if (f.agent && item.agentAccount && !item.agentAccount.includes(f.agent)) return false;
        if (f.auditResult && item.auditResult !== f.auditResult) return false;
        if (f.isManual && item.isManualAudit !== f.isManual) return false;
        if (f.timeout && item.auditTimeout !== f.timeout) return false;
        if (f.createStart && item.createTime < f.createStart) return false;
        if (f.createEnd && item.createTime > f.createEnd) return false;
        return true;
      }

      if (pageState.mainTab === 'fill_audit') {
        if (f.visitCode && item.visitRecordCode && !item.visitRecordCode.includes(f.visitCode)) return false;
        if (f.manualCode && item.manualTaskCode && !item.manualTaskCode.includes(f.manualCode)) return false;
        if (f.leadName && item.leadName && !item.leadName.includes(f.leadName)) return false;
        if (f.phone && item.phone && !item.phone.includes(f.phone)) return false;
        if (f.auditor && item.auditor && !item.auditor.includes(f.auditor)) return false;
        if (f.intentCar && item.intentCarSeries && !item.intentCarSeries.includes(f.intentCar)) return false;
        if (f.latestCar && item.latestCaptureCarSeries && !item.latestCaptureCarSeries.includes(f.latestCar)) return false;
        if (f.smartStatus && item.smartFillStatus !== f.smartStatus) return false;
        if (f.agent && item.agentAccount && !item.agentAccount.includes(f.agent)) return false;
        if (f.auditResult && item.auditResult !== f.auditResult) return false;
        if (f.timeout && item.auditTimeout !== f.timeout) return false;
        if (f.createStart && item.createTime < f.createStart) return false;
        if (f.createEnd && item.createTime > f.createEnd) return false;
        return true;
      }

      return true;
    });
  }

  // ==================== 渲染辅助函数 ====================
  function renderSelectOptions(options, selectedValue, placeholder = '请选择') {
    let html = `<option value="">${placeholder}</option>`;
    options.forEach(opt => {
      html += `<option value="${opt}" ${selectedValue === opt ? 'selected' : ''}>${opt}</option>`;
    });
    return html;
  }

  function renderDateRange(startId, startVal, endId, endVal) {
    return `
      <div class="sd-date-range">
        <input type="date" class="sd-form-input sd-date-input" id="${startId}" value="${startVal}" placeholder="开始日期">
        <span class="sd-date-sep">~</span>
        <input type="date" class="sd-form-input sd-date-input" id="${endId}" value="${endVal}" placeholder="结束日期">
      </div>
    `;
  }

  function textInput(label, filterKey, val, dataAttr = 'data-filter', placeholder = '请输入', type = 'text') {
    return `
      <div class="sd-filter-item">
        <label>${label}</label>
        <input type="${type}" class="sd-form-input sd-filter-input" ${dataAttr}="${filterKey}" placeholder="${placeholder}" value="${val}">
      </div>
    `;
  }

  function selectInput(label, filterKey, val, options, dataAttr = 'data-filter') {
    return `
      <div class="sd-filter-item">
        <label>${label}</label>
        <select class="sd-form-select sd-filter-select" ${dataAttr}="${filterKey}">
          ${renderSelectOptions(options, val)}
        </select>
      </div>
    `;
  }

  function dateRangeInput(label, startId, startVal, endId, endVal) {
    return `
      <div class="sd-filter-item sd-filter-item-range">
        <label>${label}</label>
        ${renderDateRange(startId, startVal, endId, endVal)}
      </div>
    `;
  }

  // ==================== 筛选栏渲染 ====================
  function renderFilterBar() {
    const expanded = isFilterExpanded();
    const tab = pageState.mainTab;

    let fields = [];
    let actions = '';
    let dataAttr = 'data-filter';
    let f;

    if (tab === 'assign' || tab === 'assign_lz') {
      f = pageState.assignFilters;
      dataAttr = 'data-filter';
      fields = [
        textInput('任务编码：', 'taskCode', f.taskCode, dataAttr),
        textInput('线索编码：', 'leadCode', f.leadCode, dataAttr)
      ];
      actions = `
        <button class="sd-btn sd-btn-default" onclick="window.__nurtureResetFilters()">重置</button>
        <button class="sd-btn sd-btn-primary" onclick="window.__nurtureDoSearch()">查询</button>
        <button class="sd-btn sd-btn-default" onclick="window.__nurtureRefresh()">刷新</button>
      `;
      if (expanded) {
        fields = fields.concat([
          textInput('联系电话：', 'phone', f.phone, dataAttr),
          selectInput('意向车系：', 'intentCar', f.intentCar, CAR_SERIES_OPTIONS, dataAttr),
          selectInput('最新留资车系：', 'latestCar', f.latestCar, CAR_SERIES_OPTIONS, dataAttr),
          selectInput('线索来源：', 'leadSource', f.leadSource, LEAD_SOURCES, dataAttr),
          selectInput('线索R渠道：', 'rChannel', f.rChannel, R_CHANNELS, dataAttr),
          selectInput('初始意向级别：', 'intentLevel', f.intentLevel, LEAD_LEVELS, dataAttr),
          dateRangeInput('留资时间：', 'filterCaptureStart', f.captureStart, 'filterCaptureEnd', f.captureEnd),
          dateRangeInput('任务接收时间：', 'filterReceiveStart', f.receiveStart, 'filterReceiveEnd', f.receiveEnd),
          selectInput('坐席账号：', 'agent', f.agent, AGENT_ACCOUNTS, dataAttr),
          selectInput('分配规则：', 'assignRule', f.assignRule, ASSIGN_RULES, dataAttr),
          selectInput('是否有上次坐席跟进：', 'hasLastFollow', f.hasLastFollow, YES_NO_OPTIONS, dataAttr),
          selectInput('试驾排程：', 'testDrive', f.testDrive, TEST_DRIVE_SCHEDULES, dataAttr),
          selectInput('意向专营店：', 'dealer', f.dealer, DEALERS, dataAttr)
        ]);
      }
    } else if (tab === 'audit') {
      f = pageState.auditFilters;
      dataAttr = 'data-audit-filter';
      fields = [
        textInput('任务编码：', 'taskCode', f.taskCode, dataAttr),
        textInput('线索编码：', 'leadCode', f.leadCode, dataAttr)
      ];
      actions = `
        <button class="sd-btn sd-btn-default" onclick="window.__nurtureResetFilters()">重置</button>
        <button class="sd-btn sd-btn-primary" onclick="window.__nurtureDoSearch()">查询</button>
        <button class="sd-btn sd-btn-default" onclick="window.__nurtureRefresh()">刷新</button>
      `;
      if (expanded) {
        fields = fields.concat([
          selectInput('意向车系：', 'intentCar', f.intentCar, CAR_SERIES_OPTIONS, dataAttr),
          selectInput('最新留资车系：', 'latestCar', f.latestCar, CAR_SERIES_OPTIONS, dataAttr),
          textInput('跟进次数：', 'followCount', f.followCount, dataAttr, '请输入', 'number'),
          dateRangeInput('回访提交时间：', 'auditSubmitStart', f.submitStart, 'auditSubmitEnd', f.submitEnd),
          dateRangeInput('上次回访时间：', 'auditLastStart', f.lastStart, 'auditLastEnd', f.lastEnd),
          dateRangeInput('分配时间：', 'auditAssignStart', f.assignStart, 'auditAssignEnd', f.assignEnd),
          selectInput('坐席账号：', 'agent', f.agent, AGENT_ACCOUNTS, dataAttr)
        ]);
      }
    } else if (tab === 'incomplete') {
      f = pageState.incompleteFilters;
      dataAttr = 'data-inc-filter';
      fields = [
        textInput('培育任务编码：', 'taskCode', f.taskCode, dataAttr),
        textInput('留资未满编码：', 'leadCode', f.leadCode, dataAttr)
      ];
      actions = `
        <button class="sd-btn sd-btn-default" onclick="window.__nurtureResetFilters()">重置</button>
        <button class="sd-btn sd-btn-primary" onclick="window.__nurtureDoSearch()">查询</button>
        <button class="sd-btn sd-btn-default" onclick="window.__nurtureRefresh()">刷新</button>
      `;
      if (expanded) {
        fields = fields.concat([
          selectInput('上次分配方式：', 'assignMethod', f.assignMethod, ASSIGN_METHODS, dataAttr),
          selectInput('上次AI外呼类型：', 'aiCallType', f.aiCallType, AI_CALL_TYPES, dataAttr),
          textInput('联系电话：', 'phone', f.phone, dataAttr),
          selectInput('意向车系：', 'intentCar', f.intentCar, CAR_SERIES_OPTIONS, dataAttr),
          selectInput('线索来源：', 'leadSource', f.leadSource, LEAD_SOURCES, dataAttr),
          selectInput('线索来源平台：', 'platform', f.platform, PLATFORMS, dataAttr),
          textInput('SMARTCODE：', 'smartCode', f.smartCode, dataAttr),
          selectInput('任务分配状态：', 'assignStatus', f.assignStatus, ASSIGN_STATUS, dataAttr),
          dateRangeInput('留资时间：', 'incCaptureStart', f.captureStart, 'incCaptureEnd', f.captureEnd),
          selectInput('跟进状态：', 'followStatus', f.followStatus, FOLLOW_STATUS, dataAttr),
          textInput('跟进次数：', 'followCount', f.followCount, dataAttr, '请输入', 'number'),
          selectInput('分配账号名称：', 'agent', f.agent, AGENT_ACCOUNTS, dataAttr),
          dateRangeInput('最新跟进时间：', 'incLastFollowStart', f.lastFollowStart, 'incLastFollowEnd', f.lastFollowEnd),
          dateRangeInput('分配时间：', 'incAssignStart', f.assignStart, 'incAssignEnd', f.assignEnd),
          selectInput('近30天页面浏览：', 'pageViews', f.pageViews, PAGE_VIEW_RANGES, dataAttr),
          selectInput('近30天按钮点击：', 'btnClicks', f.btnClicks, BTN_CLICK_RANGES, dataAttr)
        ]);
      }
    } else if (tab === 'ai_order') {
      f = pageState.aiOrderFilters;
      dataAttr = 'data-ai-filter';
      fields = [
        textInput('回访记录编码：', 'visitCode', f.visitCode, dataAttr),
        textInput('人工任务编码：', 'manualCode', f.manualCode, dataAttr)
      ];
      actions = `
        <button class="sd-btn sd-btn-default" onclick="window.__nurtureResetFilters()">重置</button>
        <button class="sd-btn sd-btn-primary" onclick="window.__nurtureDoSearch()">查询</button>
        <button class="sd-btn sd-btn-default" onclick="window.__nurtureRefresh()">刷新</button>
      `;
      if (expanded) {
        fields = fields.concat([
          textInput('客户姓名：', 'leadName', f.leadName, dataAttr),
          textInput('联系电话：', 'phone', f.phone, dataAttr),
          selectInput('意向车系：', 'intentCar', f.intentCar, CAR_SERIES_OPTIONS, dataAttr),
          selectInput('最新留资车系：', 'latestCar', f.latestCar, CAR_SERIES_OPTIONS, dataAttr),
          selectInput('智能填单状态：', 'smartStatus', f.smartStatus, SMART_FILL_STATUS, dataAttr),
          selectInput('坐席账号：', 'agent', f.agent, AGENT_ACCOUNTS, dataAttr),
          textInput('审核人员：', 'auditor', f.auditor, dataAttr),
          dateRangeInput('创建时间：', 'aiCreateStart', f.createStart, 'aiCreateEnd', f.createEnd),
          selectInput('回访结果：', 'auditResult', f.auditResult, AUDIT_RESULT, dataAttr),
          selectInput('是否人工审核：', 'isManual', f.isManual, MANUAL_AUDIT, dataAttr),
          selectInput('审核超时：', 'timeout', f.timeout, AUDIT_TIMEOUT, dataAttr)
        ]);
      }
    } else if (tab === 'fill_audit') {
      f = pageState.fillAuditFilters;
      dataAttr = 'data-fill-filter';
      fields = [
        textInput('回访记录编码：', 'visitCode', f.visitCode, dataAttr),
        textInput('人工任务编码：', 'manualCode', f.manualCode, dataAttr)
      ];
      actions = `
        <button class="sd-btn sd-btn-default" onclick="window.__nurtureResetFilters()">重置</button>
        <button class="sd-btn sd-btn-primary" onclick="window.__nurtureDoSearch()">查询</button>
        <button class="sd-btn sd-btn-default" onclick="window.__nurtureRefresh()">刷新</button>
      `;
      if (expanded) {
        fields = fields.concat([
          textInput('客户姓名：', 'leadName', f.leadName, dataAttr),
          textInput('联系电话：', 'phone', f.phone, dataAttr),
          selectInput('意向车系：', 'intentCar', f.intentCar, CAR_SERIES_OPTIONS, dataAttr),
          selectInput('最新留资车系：', 'latestCar', f.latestCar, CAR_SERIES_OPTIONS, dataAttr),
          selectInput('智能填单状态：', 'smartStatus', f.smartStatus, SMART_FILL_STATUS, dataAttr),
          selectInput('坐席账号：', 'agent', f.agent, AGENT_ACCOUNTS, dataAttr),
          textInput('审核人员：', 'auditor', f.auditor, dataAttr),
          dateRangeInput('创建时间：', 'fillCreateStart', f.createStart, 'fillCreateEnd', f.createEnd),
          selectInput('回访结果：', 'auditResult', f.auditResult, AUDIT_RESULT, dataAttr),
          selectInput('审核超时：', 'timeout', f.timeout, AUDIT_TIMEOUT, dataAttr)
        ]);
      }
    }

    return `
      <div class="sd-filter-card">
        <div class="sd-filter-grid ${expanded ? 'expanded' : ''}">
          ${fields.join('')}
          <div class="sd-filter-actions">
            ${actions}
            <button class="sd-btn sd-btn-link sd-filter-toggle" onclick="window.__nurtureToggleFilterExpand()">
              ${expanded ? '收起' : '展开'} <span class="sd-arrow">${expanded ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==================== 子Tab和操作栏 ====================
  function renderSubTabs(currentSubTab, switchFn) {
    if (pageState.mainTab !== 'assign' && pageState.mainTab !== 'assign_lz') return '';
    return `
      <div class="sd-subtabs-wrap">
        <div class="sd-snurture-subtabs">
          ${ASSIGN_SUB_TABS.map(tab => `
            <div class="sd-snurture-subtab ${currentSubTab === tab.key ? 'active' : ''}" onclick="window.${switchFn}('${tab.key}')">
              ${tab.label}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderActionBar() {
    const tab = pageState.mainTab;
    const selectedCount = pageState.selectedRows.size;

    if (tab === 'assign' || tab === 'assign_lz') {
      const subTab = tab === 'assign' ? pageState.assignSubTab : pageState.assignLzSubTab;
      return `
        <div class="sd-action-bar">
          <button class="sd-btn sd-btn-primary" onclick="window.__nurtureBatchAssign('all')">全部分配</button>
          <button class="sd-btn sd-btn-info ${selectedCount === 0 ? 'is-disabled' : ''}" onclick="window.__nurtureBatchAssign('selected')" ${selectedCount === 0 ? 'disabled' : ''}>
            执行分配 ${selectedCount > 0 ? `(${selectedCount})` : ''}
          </button>
          <button class="sd-btn sd-btn-default" onclick="window.__nurtureExport()">导出</button>
        </div>
      `;
    }

    if (tab === 'audit' || tab === 'fill_audit' || tab === 'ai_order') {
      return `
        <div class="sd-action-bar">
          <button class="sd-btn sd-btn-primary ${selectedCount === 0 ? 'is-disabled' : ''}" onclick="window.__nurtureBatchAudit(true)" ${selectedCount === 0 ? 'disabled' : ''}>
            执行审批 ${selectedCount > 0 ? `(${selectedCount})` : ''}
          </button>
          <button class="sd-btn sd-btn-danger ${selectedCount === 0 ? 'is-disabled' : ''}" onclick="window.__nurtureBatchAudit(false)" ${selectedCount === 0 ? 'disabled' : ''}>
            批量驳回
          </button>
          <button class="sd-btn sd-btn-default" onclick="window.__nurtureExport()">导出</button>
        </div>
      `;
    }

    if (tab === 'incomplete') {
      return `
        <div class="sd-action-bar">
          <button class="sd-btn sd-btn-primary" onclick="window.__nurtureBatchAssign('all')">全部分配</button>
          <button class="sd-btn sd-btn-info ${selectedCount === 0 ? 'is-disabled' : ''}" onclick="window.__nurtureBatchAssign('selected')" ${selectedCount === 0 ? 'disabled' : ''}>
            执行分配 ${selectedCount > 0 ? `(${selectedCount})` : ''}
          </button>
          <button class="sd-btn sd-btn-default" onclick="window.__nurtureExport()">导出</button>
        </div>
      `;
    }

    return `
      <div class="sd-action-bar">
        <button class="sd-btn sd-btn-default" onclick="window.__nurtureExport()">导出</button>
      </div>
    `;
  }

  // ==================== 表格渲染 ====================
  function renderAssignTable(data) {
    return `
      <div class="sd-table-wrap">
        <table class="sd-data-table">
          <thead>
            <tr>
              <th style="width: 40px;"><input type="checkbox" onchange="window.__nurtureToggleAll(this.checked)"></th>
              <th style="width: 50px;">序号</th>
              <th>任务编码</th>
              <th>线索编码</th>
              <th>上次跟进坐席账号</th>
              <th>上次跟进坐席名称</th>
              <th>客户姓名</th>
              <th>性别</th>
              <th>联系电话</th>
              <th>意向车系</th>
              <th>最新留资车系</th>
              <th>线索类型</th>
              <th>线索来源</th>
              <th>SMARTCODE</th>
              <th>线索R渠道</th>
              <th>初始意向级别</th>
              <th>留资时间</th>
              <th>任务接收时间</th>
              <th>坐席账号</th>
              <th>分配规则</th>
              <th>试驾排程</th>
              <th>意向专营店</th>
              <th style="width: 150px;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${data.length === 0 ? '<tr><td colspan="23" class="sd-table-empty">暂无数据</td></tr>' : data.map(item => `
              <tr class="${pageState.selectedRows.has(item.id) ? 'is-selected' : ''}">
                <td><input type="checkbox" ${pageState.selectedRows.has(item.id) ? 'checked' : ''} onchange="window.__nurtureToggleRow('${item.id}', this.checked)"></td>
                <td class="is-muted">${item.seq}</td>
                <td class="is-mono">${item.taskCode}</td>
                <td class="is-mono">${item.leadCode}</td>
                <td class="is-mono is-muted">${item.lastAgentAccount || '-'}</td>
                <td>${item.lastAgentName || '<span class="is-muted">-</span>'}</td>
                <td>${item.leadName}</td>
                <td>${item.gender}</td>
                <td class="is-mono">${item.phone}</td>
                <td>${item.intentCarSeries}</td>
                <td>${item.latestCaptureCarSeries}</td>
                <td>${item.leadType}</td>
                <td>${item.leadSource}</td>
                <td class="is-mono is-small">${item.smartCode}</td>
                <td class="is-small">${item.rChannel}</td>
                <td><span class="sd-tag ${item.initialIntentLevel === 'H' ? 'sd-tag-danger' : (item.initialIntentLevel === 'A' ? 'sd-tag-warning' : (item.initialIntentLevel === 'B' ? 'sd-tag-info' : 'sd-tag-default'))}">${item.initialIntentLevel}</span></td>
                <td class="is-small">${item.captureTime}</td>
                <td class="is-small">${item.taskReceiveTime}</td>
                <td class="is-mono">${item.agentAccount || '<span class="is-muted">未分配</span>'}</td>
                <td class="is-small">${item.assignRule}</td>
                <td class="is-small">${item.testDriveSchedule}</td>
                <td class="is-small">${item.intentDealer}</td>
                <td>
                  <button class="sd-btn sd-btn-text" onclick="window.__nurtureViewDetail('${item.id}')">详情</button>
                  <button class="sd-btn sd-btn-text sd-text-primary" onclick="window.__nurtureAssignOne('${item.id}')">分配</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderAuditTable(data) {
    return `
      <div class="sd-table-wrap">
        <table class="sd-data-table">
          <thead>
            <tr>
              <th style="width: 40px;"><input type="checkbox" onchange="window.__nurtureToggleAll(this.checked)"></th>
              <th style="width: 50px;">序号</th>
              <th>任务编码</th>
              <th>线索编码</th>
              <th>客户姓名</th>
              <th>性别</th>
              <th>联系电话</th>
              <th>意向车系</th>
              <th>最新留资车系</th>
              <th>跟进次数</th>
              <th>回访提交时间</th>
              <th>上次回访时间</th>
              <th>接触状态</th>
              <th>提交结果</th>
              <th>战败原因</th>
              <th>跟进描述</th>
              <th>备注</th>
              <th>分配时间</th>
              <th>坐席账号</th>
              <th>坐席名称</th>
              <th>审核状态</th>
              <th style="width: 180px;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${data.length === 0 ? '<tr><td colspan="22" class="sd-table-empty">暂无数据</td></tr>' : data.map(item => `
              <tr class="${pageState.selectedRows.has(item.id) ? 'is-selected' : ''}">
                <td><input type="checkbox" ${pageState.selectedRows.has(item.id) ? 'checked' : ''} onchange="window.__nurtureToggleRow('${item.id}', this.checked)"></td>
                <td class="is-muted">${item.seq}</td>
                <td class="is-mono">${item.taskCode}</td>
                <td class="is-mono">${item.leadCode}</td>
                <td>${item.leadName}</td>
                <td>${item.gender}</td>
                <td class="is-mono">${item.phone}</td>
                <td>${item.intentCarSeries}</td>
                <td>${item.latestCaptureCarSeries}</td>
                <td class="is-center">${item.followCount}</td>
                <td class="is-small">${item.submitTime}</td>
                <td class="is-small">${item.lastFollowTime}</td>
                <td>${item.contactStatus}</td>
                <td><span class="sd-tag ${getStatusTagClass(item.submitResult)}">${item.submitResult}</span></td>
                <td class="is-small">${item.submitReason}</td>
                <td class="is-small" style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.followDesc}">${item.followDesc}</td>
                <td class="is-small">${item.remark || '-'}</td>
                <td class="is-small">${item.assignTime}</td>
                <td class="is-mono">${item.agentAccount}</td>
                <td>${item.agentName}</td>
                <td><span class="sd-tag ${getStatusTagClass(item.result)}">${item.result}</span></td>
                <td>
                  <button class="sd-btn sd-btn-text" onclick="window.__nurtureViewDetail('${item.id}')">详情</button>
                  ${item.result === '待审核' ? `
                    <button class="sd-btn sd-btn-text sd-text-success" onclick="window.__nurtureAuditOne('${item.id}', true)">通过</button>
                    <button class="sd-btn sd-btn-text sd-text-danger" onclick="window.__nurtureAuditOne('${item.id}', false)">驳回</button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderIncompleteTable(data) {
    return `
      <div class="sd-table-wrap">
        <table class="sd-data-table">
          <thead>
            <tr>
              <th style="width: 40px;"><input type="checkbox" onchange="window.__nurtureToggleAll(this.checked)"></th>
              <th style="width: 50px;">序号</th>
              <th>培育任务编码</th>
              <th>留资未满编码</th>
              <th>上次分配方式</th>
              <th>上次AI外呼类型</th>
              <th>上次跟进坐席账号</th>
              <th>上次跟进坐席名称</th>
              <th>客户姓名</th>
              <th>性别</th>
              <th>联系电话</th>
              <th>意向车系</th>
              <th>线索来源</th>
              <th>线索来源平台</th>
              <th>SMARTCODE</th>
              <th>任务分配状态</th>
              <th>留资时间</th>
              <th>跟进状态</th>
              <th class="is-center">跟进次数</th>
              <th>分配账号名称</th>
              <th>最新跟进时间</th>
              <th>分配时间</th>
              <th class="is-center">近30天关键页面浏览次数</th>
              <th class="is-center">近30天关键按钮点击次数</th>
              <th style="width: 120px;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${data.length === 0 ? '<tr><td colspan="25" class="sd-table-empty">暂无数据</td></tr>' : data.map(item => `
              <tr class="${pageState.selectedRows.has(item.id) ? 'is-selected' : ''}">
                <td><input type="checkbox" ${pageState.selectedRows.has(item.id) ? 'checked' : ''} onchange="window.__nurtureToggleRow('${item.id}', this.checked)"></td>
                <td class="is-muted">${item.seq}</td>
                <td class="is-mono">${item.taskCode}</td>
                <td class="is-mono">${item.leadCode}</td>
                <td class="is-small">${item.lastAssignMethod}</td>
                <td class="is-small">${item.lastAiCallType}</td>
                <td class="is-mono ${item.lastFollowAgentAccount === '-' ? 'is-muted' : ''}">${item.lastFollowAgentAccount}</td>
                <td class="${item.lastFollowAgentName === '-' ? 'is-muted' : ''}">${item.lastFollowAgentName}</td>
                <td>${item.leadName}</td>
                <td>${item.gender}</td>
                <td class="is-mono">${item.phone}</td>
                <td>${item.intentCarSeries}</td>
                <td class="is-small">${item.leadSource}</td>
                <td class="is-small">${item.platform}</td>
                <td class="is-mono is-small">${item.smartCode}</td>
                <td><span class="sd-tag ${item.assignStatus === '已分配' ? 'sd-tag-success' : 'sd-tag-warning'}">${item.assignStatus}</span></td>
                <td class="is-small">${item.captureTime}</td>
                <td><span class="sd-tag ${item.followStatus === '已成交' ? 'sd-tag-success' : (item.followStatus === '客户放弃' ? 'sd-tag-danger' : (item.followStatus === '跟进中' ? 'sd-tag-info' : 'sd-tag-default'))}">${item.followStatus}</span></td>
                <td class="is-center">${item.followCount}</td>
                <td class="${item.assignAgentName === '-' ? 'is-muted' : ''}">${item.assignAgentName}</td>
                <td class="is-small ${item.lastFollowTime === '-' ? 'is-muted' : ''}">${item.lastFollowTime}</td>
                <td class="is-small ${item.assignTime === '-' ? 'is-muted' : ''}">${item.assignTime}</td>
                <td class="is-center">${item.pageViews30d}</td>
                <td class="is-center">${item.btnClicks30d}</td>
                <td>
                  <button class="sd-btn sd-btn-text" onclick="window.__nurtureViewDetail('${item.id}')">详情</button>
                  ${item.assignStatus === '未分配' ? `<button class="sd-btn sd-btn-text sd-text-primary" onclick="window.__nurtureAssignOne('${item.id}')">分配</button>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderAiOrderTable(data) {
    return `
      <div class="sd-table-wrap">
        <table class="sd-data-table">
          <thead>
            <tr>
              <th style="width: 40px;"><input type="checkbox" onchange="window.__nurtureToggleAll(this.checked)"></th>
              <th>回访记录编码</th>
              <th>客户姓名</th>
              <th>联系电话</th>
              <th>工单类型</th>
              <th>意向车系</th>
              <th>最新留资车系</th>
              <th>意向车型</th>
              <th>智能填单状态</th>
              <th>处理坐席账号</th>
              <th>处理坐席名称</th>
              <th>审核人员</th>
              <th>创建时间</th>
              <th>转人工原因</th>
              <th>审核状态</th>
              <th>审核超时</th>
              <th>审核结果</th>
              <th>备注</th>
              <th style="width: 150px;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${data.length === 0 ? '<tr><td colspan="19" class="sd-table-empty">暂无数据</td></tr>' : data.map(item => `
              <tr class="${pageState.selectedRows.has(item.id) ? 'is-selected' : ''}">
                <td><input type="checkbox" ${pageState.selectedRows.has(item.id) ? 'checked' : ''} onchange="window.__nurtureToggleRow('${item.id}', this.checked)"></td>
                <td class="is-mono">${item.visitRecordCode}</td>
                <td>${item.leadName}</td>
                <td class="is-mono">${item.phone}</td>
                <td>${item.orderType}</td>
                <td>${item.intentCarSeries}</td>
                <td>${item.latestCaptureCarSeries}</td>
                <td>${item.intentCarModel}</td>
                <td>${renderTag(item.smartFillStatus, item.smartFillStatus === '待审核' ? 'warning' : (item.smartFillStatus === '审核通过' ? 'success' : 'danger'))}</td>
                <td class="is-mono">${item.agentAccount}</td>
                <td>${item.agentName}</td>
                <td>${item.auditor}</td>
                <td class="is-small">${item.createTime}</td>
                <td><span style="color:#e6a23c;">${item.transferReason}</span></td>
                <td>${renderTag(item.auditStatus, item.auditStatus === '待审核' ? 'warning' : (item.auditStatus === '通过' ? 'success' : 'danger'))}</td>
                <td>${renderTag(item.auditTimeout, item.auditTimeout === '未超时' ? 'success' : 'danger')}</td>
                <td>${renderTag(item.auditResult, item.auditResult === '通过' ? 'success' : (item.auditResult === '驳回' ? 'danger' : 'warning'))}</td>
                <td class="is-small">${item.remark || '-'}</td>
                <td>
                  <button class="sd-btn sd-btn-text" onclick="window.__nurtureViewDetail('${item.id}')" style="color:#409eff;">详情</button>
                  ${item.auditStatus === '待审核' ? `
                    <button class="sd-btn sd-btn-text" onclick="window.__nurtureAuditOne('${item.id}', true)" style="color:#67c23a;">通过</button>
                    <button class="sd-btn sd-btn-text" onclick="window.__nurtureAuditOne('${item.id}', false)" style="color:#f56c6c;">驳回</button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderFillAuditTable(data) {
    return `
      <div class="sd-table-wrap">
        <table class="sd-data-table">
          <thead>
            <tr>
              <th style="width: 40px;"><input type="checkbox" onchange="window.__nurtureToggleAll(this.checked)"></th>
              <th>回访记录编码</th>
              <th>客户姓名</th>
              <th>联系电话</th>
              <th>意向车系</th>
              <th>最新留资车系</th>
              <th>意向车型</th>
              <th>智能填单状态</th>
              <th>处理坐席账号</th>
              <th>处理坐席名称</th>
              <th>审核人员</th>
              <th>创建时间</th>
              <th>转人工原因</th>
              <th>审核状态</th>
              <th>审核超时</th>
              <th>审核结果</th>
              <th>备注</th>
              <th style="width: 150px;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${data.length === 0 ? '<tr><td colspan="18" class="sd-table-empty">暂无数据</td></tr>' : data.map(item => `
              <tr class="${pageState.selectedRows.has(item.id) ? 'is-selected' : ''}">
                <td><input type="checkbox" ${pageState.selectedRows.has(item.id) ? 'checked' : ''} onchange="window.__nurtureToggleRow('${item.id}', this.checked)"></td>
                <td class="is-mono">${item.visitRecordCode}</td>
                <td>${item.leadName}</td>
                <td class="is-mono">${item.phone}</td>
                <td>${item.intentCarSeries}</td>
                <td>${item.latestCaptureCarSeries}</td>
                <td>${item.intentCarModel}</td>
                <td><span class="sd-tag ${item.smartFillStatus === '审核通过' ? 'sd-tag-success' : (item.smartFillStatus === '审核驳回' ? 'sd-tag-danger' : 'sd-tag-warning')}">${item.smartFillStatus}</span></td>
                <td class="is-mono">${item.agentAccount}</td>
                <td>${item.agentName}</td>
                <td class="${item.auditor === '-' ? 'is-muted' : ''}">${item.auditor}</td>
                <td class="is-small">${item.createTime}</td>
                <td class="is-small" style="color: #e6a23c;">${item.transferReason}</td>
                <td><span class="sd-tag ${item.auditStatus === '通过' ? 'sd-tag-success' : (item.auditStatus === '驳回' ? 'sd-tag-danger' : 'sd-tag-warning')}">${item.auditStatus}</span></td>
                <td><span class="sd-tag ${item.auditTimeout === '已超时' ? 'sd-tag-danger' : 'sd-tag-success'}">${item.auditTimeout}</span></td>
                <td><span class="sd-tag ${item.auditResult === '通过' ? 'sd-tag-success' : (item.auditResult === '驳回' ? 'sd-tag-danger' : 'sd-tag-warning')}">${item.auditResult}</span></td>
                <td class="is-small">${item.remark || '-'}</td>
                <td>
                  <button class="sd-btn sd-btn-text" onclick="window.__nurtureViewDetail('${item.id}')">详情</button>
                  ${item.auditResult === '待审核' ? `
                    <button class="sd-btn sd-btn-text sd-text-success" onclick="window.__nurtureAuditOne('${item.id}', true)">通过</button>
                    <button class="sd-btn sd-btn-text sd-text-danger" onclick="window.__nurtureAuditOne('${item.id}', false)">驳回</button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==================== 分配弹窗渲染 ====================
  function renderAssignModal() {
    const { mode, agentFilter, agents } = pageState.assignModal;
    const unassignedCount = getCurrentData().filter(i => !i.agentAccount).length;
    const selectedCount = pageState.selectedRows.size;
    const totalCount = mode === 'all' ? unassignedCount : selectedCount;

    const filteredAgents = agentFilter
      ? agents.filter(a => a.account.includes(agentFilter) || a.name.includes(agentFilter))
      : agents;

    return `
      <div class="sd-modal-mask" onclick="window.__nurtureCloseAssignModal(event)">
        <div class="sd-modal-dialog sd-modal-lg" onclick="event.stopPropagation()">
          <div class="sd-modal-header">
            <span class="sd-modal-title">👥 坐席排班</span>
            <span class="sd-modal-close" onclick="window.__nurtureCloseAssignModal()">×</span>
          </div>
          <div class="sd-modal-body">
            <div class="sd-modal-filter">
              <label>坐席账号：</label>
              <input type="text" class="sd-form-input" id="modalAgentFilter" placeholder="请输入" value="${agentFilter}" oninput="window.__nurtureModalFilterAgent(this.value)">
              <button class="sd-btn sd-btn-default" onclick="window.__nurtureModalResetFilter()">重置</button>
              <button class="sd-btn sd-btn-primary" onclick="window.__nurtureModalSearchAgent()">查询</button>
              <div class="sd-modal-count">待分配：<strong>${totalCount}</strong> 条</div>
            </div>
            <div class="sd-modal-table-wrap">
              <table class="sd-data-table">
                <thead>
                  <tr>
                    <th style="width: 60px;">序号</th>
                    <th>坐席账号</th>
                    <th style="width: 120px;">当日已接待量</th>
                    <th style="width: 120px;">当日待接待量</th>
                    <th style="width: 140px;">分配数量</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredAgents.length === 0 ? '<tr><td colspan="5" class="sd-table-empty">暂无数据</td></tr>' : filteredAgents.map((agent, idx) => `
                    <tr>
                      <td class="is-muted">${idx + 1}</td>
                      <td class="is-mono">
                        <span>${agent.account}</span>
                        <span class="is-muted" style="margin-left: 6px; font-size: 12px;">${agent.name}</span>
                        <span class="sd-tag sd-tag-success" style="margin-left: 6px; font-size: 11px;">在线</span>
                      </td>
                      <td class="is-center" style="color: #67c23a; font-weight: 500;">${agent.todayReceived}</td>
                      <td class="is-center" style="color: #e6a23c; font-weight: 500;">${agent.todayPending}</td>
                      <td class="is-center">
                        <input type="number" class="sd-form-input sd-assign-count" min="0" value="${agent.assignCount || 0}"
                               data-account="${agent.account}"
                               oninput="window.__nurtureModalSetAssignCount('${agent.account}', this.value)">
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div class="sd-modal-footer">
            <div class="sd-modal-assigned-count">
              已分配：<strong id="modalAssignedCount">${agents.reduce((s, a) => s + (a.assignCount || 0), 0)}</strong> / ${totalCount} 条
            </div>
            <button class="sd-btn sd-btn-default" onclick="window.__nurtureCloseAssignModal()">取消</button>
            <button class="sd-btn sd-btn-info" onclick="window.__nurtureModalAverageAssign()">⚖️ 平均分配</button>
            <button class="sd-btn sd-btn-primary" onclick="window.__nurtureConfirmAssign()">确定</button>
          </div>
        </div>
      </div>
    `;
  }

  // ==================== 审批弹窗 ====================
  function renderAuditModal() {
    const { pass, selectedIds, remark } = pageState.auditModal;
    const count = selectedIds.length;
    const title = pass ? '审批通过' : '驳回';
    const btnClass = pass ? 'sd-btn-primary' : 'sd-btn-danger';
    const btnText = pass ? '确认通过' : '确认驳回';
    return `
      <div class="sd-modal-overlay" onclick="window.__nurtureCloseAuditModal()">
        <div class="sd-modal sd-modal-sm" onclick="event.stopPropagation()">
          <div class="sd-modal-header">
            <span>${title}</span>
            <span class="sd-modal-close" onclick="window.__nurtureCloseAuditModal()">×</span>
          </div>
          <div class="sd-modal-body">
            <div style="padding:10px 0;">
              <div style="margin-bottom:15px;font-size:14px;color:#606266;">
                您确定要${pass ? '通过' : '驳回'}选中的 <strong style="color:#409EFF;">${count}</strong> 条记录吗？
              </div>
              <div>
                <label style="display:block;margin-bottom:8px;font-size:14px;color:#303133;">审批备注：</label>
                <textarea
                  class="sd-filter-textarea"
                  rows="3"
                  placeholder="请输入审批备注（选填）"
                  oninput="window.__nurtureAuditRemarkChange(this.value)"
                >${remark}</textarea>
              </div>
            </div>
          </div>
          <div class="sd-modal-footer" style="text-align:right;">
            <button class="sd-btn sd-btn-default" onclick="window.__nurtureCloseAuditModal()">取消</button>
            <button class="sd-btn ${btnClass}" onclick="window.__nurtureConfirmAudit()">${btnText}</button>
          </div>
        </div>
      </div>
    `;
  }

  // ==================== 详情弹窗 ====================
  function renderDetailModal() {
    const { tab, item } = pageState.detailModal;
    if (!item) return '';

    let title = '详情';
    let content = '';

    if (tab === 'assign' || tab === 'assign_lz') {
      title = (tab === 'assign_lz' ? '留资未满-' : '') + '人工外呼任务详情';
      const callHistoryHtml = item.callRecords && item.callRecords.length > 0 ? item.callRecords.map(r => `
        <div class="sd-timeline-item">
          <div class="sd-timeline-dot" style="${r.status === '已接通' ? 'background:#67c23a;box-shadow:0 0 0 2px #67c23a;' : (r.status === '未接通' || r.status === '拒接' || r.status === '关机' ? 'background:#f56c6c;box-shadow:0 0 0 2px #f56c6c;' : '')}"></div>
          <div class="sd-timeline-content">
            <div class="sd-timeline-time">${r.time} · 坐席：${r.agent} · ${formatDuration(r.duration)}</div>
            <div class="sd-timeline-text">
              <span style="margin-right:8px;">${renderTag(r.status)}</span>
              ${r.result ? `<span style="margin-right:8px;">${renderTag(r.result)}</span>` : ''}
            </div>
            ${r.remark ? `<div class="sd-timeline-text" style="color:#606266;margin-top:4px;">${r.remark}</div>` : ''}
          </div>
        </div>
      `).join('') : `
        <div style="padding:16px;text-align:center;color:#909399;font-size:13px;">暂无外呼记录</div>
      `;

      content = `
        <!-- 任务头部状态卡片 -->
        <div class="sd-detail-hero">
          <div class="sd-detail-hero-left">
            <div class="sd-detail-hero-title">
              ${renderTag(item.taskStatus)}
              ${renderTag(item.priority, item.priority === '高' ? 'danger' : (item.priority === '中' ? 'warning' : 'info'))}
              <span style="font-size:15px;font-weight:600;color:#303133;margin-left:8px;">${item.leadName} · ${item.gender} · ${item.age}岁</span>
            </div>
            <div class="sd-detail-hero-sub">
              任务编码：<span class="is-mono">${item.taskCode}</span>
              <span style="margin:0 12px;color:#dcdfe6;">|</span>
              线索编码：<span class="is-mono">${item.leadCode}</span>
              <span style="margin:0 12px;color:#dcdfe6;">|</span>
              电话：<span class="is-mono">${item.phone}</span>
            </div>
          </div>
          <div class="sd-detail-hero-right">
            <div class="sd-detail-stat">
              <div class="sd-detail-stat-num">${item.callCount}</div>
              <div class="sd-detail-stat-label">呼叫次数</div>
            </div>
            <div class="sd-detail-stat">
              <div class="sd-detail-stat-num" style="${item.lastCallStatus === '已接通' ? 'color:#67c23a;' : (item.lastCallStatus === '未呼叫' ? 'color:#909399;' : 'color:#e6a23c;')}">${item.callCount > 0 ? item.lastCallStatus : '未呼叫'}</div>
              <div class="sd-detail-stat-label">最近状态</div>
            </div>
          </div>
        </div>

        <div class="sd-detail-section">
          <div class="sd-detail-title">客户基本信息</div>
          <div class="sd-detail-grid">
            <div class="sd-detail-item"><label>客户姓名：</label><span>${item.leadName}</span></div>
            <div class="sd-detail-item"><label>性别：</label><span>${item.gender}</span></div>
            <div class="sd-detail-item"><label>年龄：</label><span>${item.age}岁</span></div>
            <div class="sd-detail-item"><label>联系电话：</label><span class="is-mono">${item.phone}</span></div>
            <div class="sd-detail-item"><label>所在地区：</label><span>${item.province} ${item.city}</span></div>
            <div class="sd-detail-item"><label>线索类型：</label><span>${item.leadType}</span></div>
          </div>
        </div>

        <div class="sd-detail-section">
          <div class="sd-detail-title">意向信息</div>
          <div class="sd-detail-grid">
            <div class="sd-detail-item"><label>意向车系：</label><span>${item.intentCarSeries}</span></div>
            <div class="sd-detail-item"><label>最新留资车系：</label><span>${item.latestCaptureCarSeries}</span></div>
            <div class="sd-detail-item"><label>线索来源：</label><span>${item.leadSource}</span></div>
            <div class="sd-detail-item"><label>线索R渠道：</label><span>${item.rChannel}</span></div>
            <div class="sd-detail-item"><label>SMARTCODE：</label><span class="is-mono">${item.smartCode || '-'}</span></div>
            <div class="sd-detail-item"><label>初始意向级别：</label><span>${renderTag(item.initialIntentLevel, item.initialIntentLevel === 'H' ? 'danger' : (item.initialIntentLevel === 'A' ? 'warning' : 'info'))}</span></div>
            <div class="sd-detail-item"><label>购车预算：</label><span>${item.budget}</span></div>
            <div class="sd-detail-item"><label>预计购车时间：</label><span>${item.purchaseTime}</span></div>
            <div class="sd-detail-item"><label>是否需要试驾：</label><span>${item.isTestDrive}</span></div>
            <div class="sd-detail-item"><label>竞品对比：</label><span>${item.competitor || '无'}</span></div>
          </div>
        </div>

        <div class="sd-detail-section">
          <div class="sd-detail-title">任务分配信息</div>
          <div class="sd-detail-grid">
            <div class="sd-detail-item"><label>任务状态：</label><span>${renderTag(item.taskStatus)}</span></div>
            <div class="sd-detail-item"><label>优先级：</label><span>${renderTag(item.priority, item.priority === '高' ? 'danger' : (item.priority === '中' ? 'warning' : 'info'))}</span></div>
            <div class="sd-detail-item"><label>分配规则：</label><span>${item.assignRule}</span></div>
            <div class="sd-detail-item"><label>分配坐席账号：</label><span class="is-mono">${item.agentAccount || '<span class="is-muted">未分配</span>'}</span></div>
            <div class="sd-detail-item"><label>分配坐席名称：</label><span>${item.agentName || '<span class="is-muted">未分配</span>'}</span></div>
            <div class="sd-detail-item"><label>上次跟进坐席：</label><span>${item.lastAgentName ? item.lastAgentName + '（' + item.lastAgentAccount + '）' : '<span class="is-muted">-</span>'}</span></div>
            <div class="sd-detail-item"><label>意向专营店：</label><span>${item.intentDealer}</span></div>
            <div class="sd-detail-item"><label>试驾排程：</label><span>${item.testDriveSchedule === '是' ? '<span style="color:#67c23a;">是</span>' : '<span style="color:#909399;">否</span>'}</span></div>
          </div>
        </div>

        <div class="sd-detail-section">
          <div class="sd-detail-title">时间信息</div>
          <div class="sd-detail-grid">
            <div class="sd-detail-item"><label>留资时间：</label><span>${item.captureTime}</span></div>
            <div class="sd-detail-item"><label>任务接收时间：</label><span>${item.taskReceiveTime}</span></div>
            <div class="sd-detail-item"><label>最近外呼时间：</label><span>${item.lastCallTime || '<span class="is-muted">未外呼</span>'}</span></div>
            <div class="sd-detail-item"><label>最近通话时长：</label><span>${formatDuration(item.callDuration)}</span></div>
          </div>
        </div>

        ${item.remark ? `
        <div class="sd-detail-section">
          <div class="sd-detail-title">跟进备注</div>
          <div class="sd-detail-form">
            <div class="sd-detail-form-row">
              <label>最新备注：</label>
              <span>${item.remark}</span>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="sd-detail-section">
          <div class="sd-detail-title">外呼记录时间轴（${item.callRecords.length}条）</div>
          <div class="sd-detail-timeline">
            ${callHistoryHtml}
          </div>
        </div>
      `;
    } else if (tab === 'incomplete') {
      title = '留资未满详情';
      content = `
        <!-- 头部状态卡 -->
        <div class="sd-detail-hero">
          <div class="sd-detail-hero-left">
            <div class="sd-detail-hero-title">
              ${renderTag(item.assignStatus, item.assignStatus === '已分配' ? 'success' : 'warning')}
              ${renderTag(item.followStatus, item.followStatus === '已成交' ? 'success' : (item.followStatus === '客户放弃' ? 'danger' : (item.followStatus === '跟进中' ? 'info' : 'default')))}
              <span style="color:#e6a23c;font-size:13px;margin-left:8px;">${item.incompleteField}</span>
              <span style="font-size:15px;font-weight:600;color:#303133;margin-left:8px;">${item.leadName} · ${item.gender} · ${item.age}岁</span>
            </div>
            <div class="sd-detail-hero-sub">
              培育任务编码：<span class="is-mono">${item.taskCode}</span>
              <span style="margin:0 12px;color:#dcdfe6;">|</span>
              留资未满编码：<span class="is-mono">${item.leadCode}</span>
              <span style="margin:0 12px;color:#dcdfe6;">|</span>
              电话：<span class="is-mono">${item.phone}</span>
            </div>
          </div>
          <div class="sd-detail-hero-right">
            <div class="sd-detail-stat">
              <div class="sd-detail-stat-num">${item.pageViews30d}</div>
              <div class="sd-detail-stat-label">30天浏览</div>
            </div>
            <div class="sd-detail-stat">
              <div class="sd-detail-stat-num" style="color:#67c23a;">${item.btnClicks30d}</div>
              <div class="sd-detail-stat-label">30天点击</div>
            </div>
            <div class="sd-detail-stat">
              <div class="sd-detail-stat-num" style="color:#e6a23c;">${item.followCount}</div>
              <div class="sd-detail-stat-label">跟进次数</div>
            </div>
          </div>
        </div>

        <div class="sd-detail-section">
          <div class="sd-detail-title">客户基本信息</div>
          <div class="sd-detail-grid">
            <div class="sd-detail-item"><label>客户姓名：</label><span>${item.leadName}</span></div>
            <div class="sd-detail-item"><label>性别：</label><span>${item.gender}</span></div>
            <div class="sd-detail-item"><label>年龄：</label><span>${item.age}岁</span></div>
            <div class="sd-detail-item"><label>联系电话：</label><span class="is-mono">${item.phone}</span></div>
            <div class="sd-detail-item"><label>所在地区：</label><span>${item.province} ${item.city}</span></div>
            <div class="sd-detail-item"><label>未完善字段：</label><span style="color:#e6a23c;">${item.incompleteField}</span></div>
          </div>
        </div>

        <div class="sd-detail-section">
          <div class="sd-detail-title">线索与意向信息</div>
          <div class="sd-detail-grid">
            <div class="sd-detail-item"><label>意向车系：</label><span>${item.intentCarSeries}</span></div>
            <div class="sd-detail-item"><label>最新留资车系：</label><span>${item.latestCaptureCarSeries}</span></div>
            <div class="sd-detail-item"><label>线索来源：</label><span>${item.leadSource}</span></div>
            <div class="sd-detail-item"><label>线索来源平台：</label><span>${item.platform}</span></div>
            <div class="sd-detail-item"><label>线索R渠道：</label><span>${item.rChannel}</span></div>
            <div class="sd-detail-item"><label>SMARTCODE：</label><span class="is-mono">${item.smartCode || '-'}</span></div>
            <div class="sd-detail-item"><label>初始意向级别：</label><span>${renderTag(item.initialIntentLevel, item.initialIntentLevel === 'H' ? 'danger' : (item.initialIntentLevel === 'A' ? 'warning' : (item.initialIntentLevel === 'B' ? 'info' : 'default')))}</span></div>
            <div class="sd-detail-item"><label>购车预算：</label><span>${item.budget || '-'}</span></div>
            <div class="sd-detail-item"><label>预计购车时间：</label><span>${item.purchaseTime || '-'}</span></div>
            <div class="sd-detail-item"><label>是否需要试驾：</label><span>${item.isTestDrive}</span></div>
            <div class="sd-detail-item"><label>意向专营店：</label><span>${item.intentDealer}</span></div>
            <div class="sd-detail-item"><label>优先级：</label><span>${renderTag(item.priority, item.priority === '高' ? 'danger' : (item.priority === '中' ? 'warning' : 'info'))}</span></div>
          </div>
        </div>

        <div class="sd-detail-section">
          <div class="sd-detail-title">分配与跟进状态</div>
          <div class="sd-detail-grid">
            <div class="sd-detail-item"><label>任务分配状态：</label><span>${renderTag(item.assignStatus, item.assignStatus === '已分配' ? 'success' : 'warning')}</span></div>
            <div class="sd-detail-item"><label>跟进状态：</label><span>${renderTag(item.followStatus, item.followStatus === '已成交' ? 'success' : (item.followStatus === '客户放弃' ? 'danger' : (item.followStatus === '跟进中' ? 'info' : 'default')))}</span></div>
            <div class="sd-detail-item"><label>上次分配方式：</label><span>${item.lastAssignMethod}</span></div>
            <div class="sd-detail-item"><label>上次AI外呼类型：</label><span>${item.lastAiCallType || '-'}</span></div>
            <div class="sd-detail-item"><label>上次跟进坐席账号：</label><span class="is-mono ${item.lastFollowAgentAccount === '-' ? 'is-muted' : ''}">${item.lastFollowAgentAccount}</span></div>
            <div class="sd-detail-item"><label>上次跟进坐席名称：</label><span class="${item.lastFollowAgentName === '-' ? 'is-muted' : ''}">${item.lastFollowAgentName}</span></div>
            <div class="sd-detail-item"><label>分配账号名称：</label><span class="${item.assignAgentName === '-' ? 'is-muted' : ''}">${item.assignAgentName}</span></div>
            <div class="sd-detail-item"><label>跟进次数：</label><span>${item.followCount} 次</span></div>
            <div class="sd-detail-item"><label>近30天关键页面浏览：</label><span>${item.pageViews30d} 次</span></div>
            <div class="sd-detail-item"><label>近30天关键按钮点击：</label><span>${item.btnClicks30d} 次</span></div>
            <div class="sd-detail-item"><label>停留时长：</label><span>${item.stayDuration}</span></div>
            <div class="sd-detail-item"><label>备注：</label><span>${item.remark || '-'}</span></div>
          </div>
        </div>

        <div class="sd-detail-section">
          <div class="sd-detail-title">时间信息</div>
          <div class="sd-detail-grid">
            <div class="sd-detail-item"><label>创建时间：</label><span>${item.createTime}</span></div>
            <div class="sd-detail-item"><label>留资时间：</label><span>${item.captureTime}</span></div>
            <div class="sd-detail-item"><label>最近活跃时间：</label><span>${item.lastActiveTime}</span></div>
            <div class="sd-detail-item"><label>最新跟进时间：</label><span class="${item.lastFollowTime === '-' ? 'is-muted' : ''}">${item.lastFollowTime}</span></div>
            <div class="sd-detail-item"><label>分配时间：</label><span class="${item.assignTime === '-' ? 'is-muted' : ''}">${item.assignTime}</span></div>
          </div>
        </div>

        <div class="sd-detail-section">
          <div class="sd-detail-title">跟进记录时间轴</div>
          <div class="sd-detail-timeline">
            ${item.followCount > 0 && item.lastFollowTime !== '-' ? `
            <div class="sd-timeline-item">
              <div class="sd-timeline-dot" style="background:#67c23a;box-shadow:0 0 0 2px #67c23a;"></div>
              <div class="sd-timeline-content">
                <div class="sd-timeline-time">${item.lastFollowTime} · 坐席：${item.lastFollowAgentName}（${item.lastFollowAgentAccount}）</div>
                <div class="sd-timeline-text">第 ${item.followCount} 次跟进，${item.followStatus === '已成交' ? '客户已成交' : (item.followStatus === '跟进中' ? '跟进中，持续沟通' : (item.followStatus === '客户放弃' ? '客户表示暂不考虑' : '待跟进'))}${item.remark ? '，备注：' + item.remark : ''}</div>
              </div>
            </div>
            ` : ''}
            ${item.assignStatus === '已分配' ? `
            <div class="sd-timeline-item">
              <div class="sd-timeline-dot" style="background:#409eff;box-shadow:0 0 0 2px #409eff;"></div>
              <div class="sd-timeline-content">
                <div class="sd-timeline-time">${item.assignTime}</div>
                <div class="sd-timeline-text">通过【${item.lastAssignMethod}】方式分配给坐席 ${item.assignAgentName}</div>
              </div>
            </div>
            ` : ''}
            <div class="sd-timeline-item">
              <div class="sd-timeline-dot"></div>
              <div class="sd-timeline-content">
                <div class="sd-timeline-time">${item.captureTime}</div>
                <div class="sd-timeline-text">客户在【${item.leadSource}】渠道【${item.platform}】平台浏览${item.intentCarSeries}留下线索，存在【${item.incompleteField}】未完善，纳入留资未满培育</div>
              </div>
            </div>
            <div class="sd-timeline-item">
              <div class="sd-timeline-dot"></div>
              <div class="sd-timeline-content">
                <div class="sd-timeline-time">${item.createTime}</div>
                <div class="sd-timeline-text">留资未满培育任务创建</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (tab === 'ai_order') {
      // 三栏审核工作台，同填单审核
      const isFemale = item.gender === '女';
      content = `
        <div class="sd-audit-col-left">
          ${(item.audioList || [{name:'录音1',duration:'0:11',active:true}]).map(a => `
            <div class="sd-audio-item">
              <div class="sd-audio-item-title">${a.name}</div>
              <div class="sd-audio-player">
                <div class="sd-audio-play-btn">▶</div>
                <span class="sd-audio-time">0:00 / ${a.duration}</span>
                <div class="sd-audio-progress"><div class="sd-audio-progress-bar" style="width:0%"></div></div>
                <span class="sd-audio-volume">🔊</span>
              </div>
              <div class="sd-audio-actions">
                <button class="sd-audio-action-btn sd-audio-action-primary">那个。</button>
                <button class="sd-audio-action-btn">错</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="sd-audit-col-mid">
          <div class="sd-audit-customer-header">
            <span class="sd-audit-customer-name">
              <span style="color:#f56c6c;">●</span>
              ${item.leadName}
              <span class="sd-audit-gender-icon ${isFemale ? 'female' : ''}">${isFemale ? '♀' : '♂'}</span>
              <span style="color:#409eff;cursor:pointer;margin-left:4px;font-size:14px;">✎</span>
            </span>
            <span class="sd-audit-level-tag">意向级别：${item.intentLevel || 'A'}</span>
          </div>

          <div class="sd-audit-section-header">
            <div class="sd-audit-section-title">线索信息</div>
            <div class="sd-audit-section-arrow">∨</div>
          </div>
          <div class="sd-lead-info-grid">
            <div class="sd-lead-info-item"><label>联系电话：</label><span class="is-link">${item.phone}</span><span style="color:#909399;cursor:pointer;margin-left:4px;">⎘</span></div>
            <div class="sd-lead-info-item"><label>IP归属地：</label><span>${item.ipLocation || '广东广州'}</span></div>
            <div class="sd-lead-info-item"><label>线索类型：</label><span>${item.leadType || 'AI智能体外呼'}</span></div>
            <div class="sd-lead-info-item"><label>线索来源：</label><span>${item.leadSource || 'id:1-DNDC-智能体'}</span></div>
            <div class="sd-lead-info-item"><label>首次线索状态：</label><span>${item.firstLeadStatus || '培育中'}</span></div>
            <div class="sd-lead-info-item"><label>首次意向级别：</label><span>${item.firstIntentLevel || 'A'}</span></div>
            <div class="sd-lead-info-item"><label>意向车辆：</label><span>${item.intentCarModel || (item.intentCarSeries + '(CE01) - ' + item.intentCarSeries)}</span></div>
            <div class="sd-lead-info-item"><label>最新意向车系：</label><span>${item.latestCaptureCarSeries || '-'}</span></div>
            <div class="sd-lead-info-item"><label>跟进次数：</label><span>${item.followCount || 0}</span></div>
            <div class="sd-lead-info-item"><label>留资时间：</label><span>${item.captureTime || item.createTime}</span></div>
            <div class="sd-lead-info-item"><label>线索状态：</label><span>${item.leadStatus || '培育中'}</span></div>
            <div class="sd-lead-info-item"><label>线索描述：</label><span>${item.leadDesc || 'AI外呼线索'}</span></div>
            <div class="sd-lead-info-item"><label>意向门店：</label><span>${item.intentDealer || '广州风日'}</span></div>
            <div class="sd-lead-info-item"><label>购车时间：</label><span>${item.purchaseTime || '-'}</span></div>
            <div class="sd-lead-info-item"><label>车系车型：</label><span>${item.intentCarModel || '-'}</span></div>
            <div class="sd-lead-info-item"><label>购车门店：</label><span>${item.purchaseDealer || '-'}</span></div>
            <div class="sd-lead-info-item"><label>VIN码：</label><span>${item.vinCode || '-'}</span></div>
            <div class="sd-lead-info-item"><label>线索备注：</label><span>${item.leadRemark || 'AI智能体处理'}</span></div>
            <div class="sd-lead-info-item"><label>线索编码：</label><span class="is-mono">${item.leadCode}</span></div>
            <div class="sd-lead-info-item"><label>任务编码：</label><span class="is-mono is-link">${item.manualTaskCode || item.visitRecordCode}</span><span style="color:#909399;cursor:pointer;margin-left:4px;">⎘</span></div>
            <div class="sd-lead-info-item"><label>渠道名称：</label><span>${item.channelName || 'AI智能体渠道'}</span></div>
            <div class="sd-lead-info-item"><label>媒体名称：</label><span>${item.mediaName || '智能外呼'}</span></div>
            <div class="sd-lead-info-item"><label>大项目名：</label><span>${item.bigProjectName || '东风日产-AI智能体外呼-2026'}</span></div>
            <div class="sd-lead-info-item"><label>是否AI外呼过：</label><span>${item.isAiCalled || '是'}</span></div>
          </div>

          <div class="sd-audit-section-header" style="border-bottom:1px solid #f0f0f0;">
            <div class="sd-audit-section-title">时光轴</div>
            <div class="sd-audit-section-arrow">›</div>
          </div>

          <div class="sd-audit-section-header" style="cursor:default;">
            <div class="sd-audit-section-title">回访提交</div>
          </div>
          <div class="sd-audit-form-grid">
            <div class="sd-audit-form-item">
              <label class="required">接触状态</label>
              <select class="sd-audit-form-select">
                <option>正常接通</option>
                <option>未接通</option>
                <option>拒接</option>
                <option>关机</option>
                <option>空号</option>
              </select>
            </div>
            <div class="sd-audit-form-item">
              <label>性别</label>
              <select class="sd-audit-form-select">
                <option value="">请选择</option>
                <option ${item.gender === '男' ? 'selected' : ''}>男</option>
                <option ${item.gender === '女' ? 'selected' : ''}>女</option>
              </select>
            </div>
            <div class="sd-audit-form-item">
              <label class="required">回访结果</label>
              <select class="sd-audit-form-select">
                <option>下次回访</option>
                <option>到店预约</option>
                <option>已成交</option>
                <option>战败</option>
              </select>
            </div>
            <div class="sd-audit-form-item">
              <label class="required">意向级别</label>
              <select class="sd-audit-form-select">
                <option>H</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option selected>E</option>
              </select>
            </div>
            <div class="sd-audit-form-item">
              <label>备用电话</label>
              <input type="text" class="sd-audit-form-input" placeholder="请输入">
            </div>
            <div class="sd-audit-form-item">
              <label>上次回访时间</label>
              <input type="text" class="sd-audit-form-input" value="-" readonly>
            </div>
            <div class="sd-audit-form-item">
              <label class="required">下次回访时间</label>
              <input type="text" class="sd-audit-form-input" value="${item.nextVisitTime || '2026-09-12 08:53'}">
            </div>
            <div class="sd-audit-form-item">
              <label>意向车辆</label>
              <select class="sd-audit-form-select">
                <option value="">请选择</option>
                <option>${item.intentCarSeries || item.latestCaptureCarSeries || ''}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="sd-audit-col-right">
          <div style="padding:12px 12px 0;">
            <div class="sd-audit-right-search">
              <input type="text" placeholder="请输入问题">
              <button>搜索</button>
            </div>
          </div>
          <div class="sd-audit-right-tabs">
            <div class="sd-audit-right-tab active">回访记录<span class="sd-tab-badge" style="background:#909399;color:#fff;font-size:10px;padding:1px 5px;border-radius:8px;margin-left:4px;">0</span></div>
            <div class="sd-audit-right-tab">客户档案</div>
            <div class="sd-audit-right-tab">AI画像</div>
            <div class="sd-audit-right-more" style="padding:12px 4px;font-size:16px;">···</div>
          </div>
          <div class="sd-audit-right-content" style="display:flex;align-items:center;justify-content:center;color:#c0c4cc;font-size:13px;">
            暂无回访记录
          </div>
        </div>
      `;
    } else if (tab === 'fill_audit') {
      // 三栏审核工作台，content作为body内容在下方return里特殊处理
      const isFemale = item.gender === '女';
      content = `
        <div class="sd-audit-col-left">
          ${(item.audioList || [{name:'录音1',duration:'0:11',active:true}]).map(a => `
            <div class="sd-audio-item">
              <div class="sd-audio-item-title">${a.name}</div>
              <div class="sd-audio-player">
                <div class="sd-audio-play-btn">▶</div>
                <span class="sd-audio-time">0:00 / ${a.duration}</span>
                <div class="sd-audio-progress"><div class="sd-audio-progress-bar" style="width:0%"></div></div>
                <span class="sd-audio-volume">🔊</span>
              </div>
              <div class="sd-audio-actions">
                <button class="sd-audio-action-btn sd-audio-action-primary">那个。</button>
                <button class="sd-audio-action-btn">错</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="sd-audit-col-mid">
          <!-- 客户头部 -->
          <div class="sd-audit-customer-header">
            <span class="sd-audit-customer-name">
              <span style="color:#f56c6c;">●</span>
              ${item.leadName}
              <span class="sd-audit-gender-icon ${isFemale ? 'female' : ''}">${isFemale ? '♀' : '♂'}</span>
              <span style="color:#409eff;cursor:pointer;margin-left:4px;font-size:14px;">✎</span>
            </span>
            <span class="sd-audit-level-tag">意向级别：${item.intentLevel || 'A'}</span>
          </div>

          <!-- 线索信息 -->
          <div class="sd-audit-section-header">
            <div class="sd-audit-section-title">线索信息</div>
            <div class="sd-audit-section-arrow">∨</div>
          </div>
          <div class="sd-lead-info-grid">
            <div class="sd-lead-info-item"><label>联系电话：</label><span class="is-link">${item.phone}</span><span style="color:#909399;cursor:pointer;margin-left:4px;">⎘</span></div>
            <div class="sd-lead-info-item"><label>IP归属地：</label><span>${item.ipLocation || '广东广州'}</span></div>
            <div class="sd-lead-info-item"><label>线索类型：</label><span>${item.leadType || '线索类型名称'}</span></div>
            <div class="sd-lead-info-item"><label>线索来源：</label><span>${item.leadSource || 'id:1-DNDC-车巴巴'}</span></div>
            <div class="sd-lead-info-item"><label>首次线索状态：</label><span>${item.firstLeadStatus || '培育中'}</span></div>
            <div class="sd-lead-info-item"><label>首次意向级别：</label><span>${item.firstIntentLevel || 'A'}</span></div>
            <div class="sd-lead-info-item"><label>意向车辆：</label><span>${item.intentCarModel || (item.intentCarSeries + '(CE01) - ' + item.intentCarSeries)}</span></div>
            <div class="sd-lead-info-item"><label>最新意向车系：</label><span>${item.latestCaptureCarSeries || '-'}</span></div>
            <div class="sd-lead-info-item"><label>跟进次数：</label><span>${item.followCount || 0}</span></div>
            <div class="sd-lead-info-item"><label>留资时间：</label><span>${item.captureTime || item.createTime}</span></div>
            <div class="sd-lead-info-item"><label>线索状态：</label><span>${item.leadStatus || '培育中'}</span></div>
            <div class="sd-lead-info-item"><label>线索描述：</label><span>${item.leadDesc || '测试'}</span></div>
            <div class="sd-lead-info-item"><label>意向门店：</label><span>${item.intentDealer || '广州风日'}</span></div>
            <div class="sd-lead-info-item"><label>购车时间：</label><span>${item.purchaseTime || '-'}</span></div>
            <div class="sd-lead-info-item"><label>车系车型：</label><span>${item.carModel || '-'}</span></div>
            <div class="sd-lead-info-item"><label>购车门店：</label><span>${item.purchaseDealer || '-'}</span></div>
            <div class="sd-lead-info-item"><label>VIN码：</label><span>${item.vinCode || '-'}</span></div>
            <div class="sd-lead-info-item"><label>线索备注：</label><span>${item.leadRemark || '测试'}</span></div>
            <div class="sd-lead-info-item"><label>线索编码：</label><span class="is-mono">${item.leadCode}</span></div>
            <div class="sd-lead-info-item"><label>任务编码：</label><span class="is-mono is-link">${item.manualTaskCode || item.visitRecordCode}</span><span style="color:#909399;cursor:pointer;margin-left:4px;">⎘</span></div>
            <div class="sd-lead-info-item"><label>渠道名称：</label><span>${item.channelName || 'R3-天网行动'}</span></div>
            <div class="sd-lead-info-item"><label>媒体名称：</label><span>${item.mediaName || '百度有驾'}</span></div>
            <div class="sd-lead-info-item"><label>大项目名：</label><span>${item.bigProjectName || '东风日产-总部-2025-2029-新能源小程序-预约试驾'}</span></div>
            <div class="sd-lead-info-item"><label>是否AI外呼过：</label><span>${item.isAiCalled || '否'}</span></div>
          </div>

          <!-- 时光轴（默认折叠） -->
          <div class="sd-audit-section-header" style="border-bottom:1px solid #f0f0f0;">
            <div class="sd-audit-section-title">时光轴</div>
            <div class="sd-audit-section-arrow">›</div>
          </div>

          <!-- 回访提交表单 -->
          <div class="sd-audit-section-header" style="cursor:default;">
            <div class="sd-audit-section-title">回访提交</div>
          </div>
          <div class="sd-audit-form-grid">
            <div class="sd-audit-form-item">
              <label class="required">接触状态</label>
              <select class="sd-audit-form-select">
                <option>正常接通</option>
                <option>未接通</option>
                <option>拒接</option>
                <option>关机</option>
                <option>空号</option>
              </select>
            </div>
            <div class="sd-audit-form-item">
              <label>性别</label>
              <select class="sd-audit-form-select">
                <option value="">请选择</option>
                <option>男</option>
                <option>女</option>
              </select>
            </div>
            <div class="sd-audit-form-item">
              <label class="required">回访结果</label>
              <select class="sd-audit-form-select">
                <option>下次回访</option>
                <option>到店预约</option>
                <option>已成交</option>
                <option>战败</option>
              </select>
            </div>
            <div class="sd-audit-form-item">
              <label class="required">意向级别</label>
              <select class="sd-audit-form-select">
                <option>H</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option selected>E</option>
              </select>
            </div>
            <div class="sd-audit-form-item">
              <label>备用电话</label>
              <input type="text" class="sd-audit-form-input" placeholder="请输入">
            </div>
            <div class="sd-audit-form-item">
              <label>上次回访时间</label>
              <input type="text" class="sd-audit-form-input" value="-" readonly>
            </div>
            <div class="sd-audit-form-item">
              <label class="required">下次回访时间</label>
              <input type="text" class="sd-audit-form-input" value="${item.nextVisitTime || '2026-09-12 08:53'}">
            </div>
            <div class="sd-audit-form-item">
              <label>意向车辆</label>
              <select class="sd-audit-form-select">
                <option value="">请选择</option>
                <option>${item.intentCarSeries || item.latestCaptureCarSeries || ''}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="sd-audit-col-right">
          <div style="padding:12px 12px 0;">
            <div class="sd-audit-right-search">
              <input type="text" placeholder="请输入问题">
              <button>搜索</button>
            </div>
          </div>
          <div class="sd-audit-right-tabs">
            <div class="sd-audit-right-tab active">回访记录<span class="sd-tab-badge" style="background:#909399;color:#fff;font-size:10px;padding:1px 5px;border-radius:8px;margin-left:4px;">0</span></div>
            <div class="sd-audit-right-tab">客户档案</div>
            <div class="sd-audit-right-tab">AI画像</div>
            <div class="sd-audit-right-more" style="padding:12px 4px;font-size:16px;">···</div>
          </div>
          <div class="sd-audit-right-content" style="display:flex;align-items:center;justify-content:center;color:#c0c4cc;font-size:13px;">
            暂无回访记录
          </div>
        </div>
      `;
    } else if (tab === 'audit') {
      title = '任务审核详情';
      content = `
        <div class="sd-detail-section">
          <div class="sd-detail-title">任务信息</div>
          <div class="sd-detail-grid">
            <div class="sd-detail-item"><label>任务编码：</label><span>${item.taskCode}</span></div>
            <div class="sd-detail-item"><label>线索编码：</label><span>${item.leadCode}</span></div>
            <div class="sd-detail-item"><label>客户姓名：</label><span>${item.leadName}</span></div>
            <div class="sd-detail-item"><label>联系电话：</label><span>${item.phone}</span></div>
            <div class="sd-detail-item"><label>意向车系：</label><span>${item.intentCar}</span></div>
            <div class="sd-detail-item"><label>最新留资车系：</label><span>${item.latestCar}</span></div>
            <div class="sd-detail-item"><label>跟进次数：</label><span>${item.followCount} 次</span></div>
            <div class="sd-detail-item"><label>跟进坐席：</label><span>${item.agent}</span></div>
          </div>
        </div>
        <div class="sd-detail-section">
          <div class="sd-detail-title">时间信息</div>
          <div class="sd-detail-grid">
            <div class="sd-detail-item"><label>回访提交时间：</label><span>${item.submitTime}</span></div>
            <div class="sd-detail-item"><label>上次回访时间：</label><span>${item.lastTime}</span></div>
            <div class="sd-detail-item"><label>分配时间：</label><span>${item.assignTime}</span></div>
          </div>
        </div>
        <div class="sd-detail-section">
          <div class="sd-detail-title">回访内容</div>
          <div class="sd-detail-form">
            <div class="sd-detail-form-row">
              <label>回访结果：</label>
              <span>${renderTag(item.auditResult, item.auditResult === '回访成功' ? 'success' : (item.auditResult === '待回访' ? 'warning' : 'danger'))}</span>
            </div>
            <div class="sd-detail-form-row">
              <label>客户意向：</label>
              <span>B级意向，有意向近期到店看车</span>
            </div>
            <div class="sd-detail-form-row">
              <label>坐席备注：</label>
              <span>客户表示最近有购车计划，已经对比了几款车型，想约时间到店详细了解并试驾。已和客户约好下周三到店。</span>
            </div>
          </div>
        </div>
      `;
    }

    if (tab === 'fill_audit' || tab === 'ai_order') {
      const isAi = tab === 'ai_order';
      return `
        <div class="sd-modal-overlay" onclick="window.__nurtureCloseDetailModal()">
          <div class="sd-modal-xl" onclick="event.stopPropagation()">
            <div class="sd-audit-workbench">
              ${content}
            </div>
            <div class="sd-audit-footer">
              <button class="sd-audit-reject-btn" onclick="window.__nurtureAuditRejectXl('${item.id}', '${tab}')">驳回</button>
              <button class="sd-audit-confirm-btn" onclick="window.__nurtureAuditPassXl('${item.id}', '${tab}')">确定通过</button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="sd-modal-overlay" onclick="window.__nurtureCloseDetailModal()">
        <div class="sd-modal sd-modal-lg" onclick="event.stopPropagation()">
          <div class="sd-modal-header">
            <span>${title}</span>
            <span class="sd-modal-close" onclick="window.__nurtureCloseDetailModal()">×</span>
          </div>
          <div class="sd-modal-body">
            ${content}
          </div>
          <div class="sd-modal-footer" style="text-align:right;">
            <button class="sd-btn sd-btn-default" onclick="window.__nurtureCloseDetailModal()">关闭</button>
          </div>
        </div>
      </div>
    `;
  }

  // ==================== 主内容渲染 ====================
  function getPagedData() {
    const allData = getFilteredData();
    const { currentPage, pageSize } = pageState;
    const total = allData.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) pageState.currentPage = totalPages;
    const start = (pageState.currentPage - 1) * pageSize;
    return {
      data: allData.slice(start, start + pageSize),
      total,
      totalPages,
      start: start + 1,
      end: Math.min(start + pageSize, total)
    };
  }

  function renderPagination(pagedInfo) {
    const { currentPage, pageSize } = pageState;
    const { total, totalPages, start, end } = pagedInfo;
    if (total === 0) return '';

    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return `
      <div class="sd-pagination">
        <div class="sd-pagination-info">共 ${total} 条，显示 ${start}-${end}</div>
        <div class="sd-pagination-btns">
          <button class="sd-page-btn ${currentPage === 1 ? 'is-disabled' : ''}" onclick="window.__nurtureGoPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>
          ${pages.map(p => p === '...'
            ? '<span class="sd-page-ellipsis">...</span>'
            : `<button class="sd-page-btn ${p === currentPage ? 'is-active' : ''}" onclick="window.__nurtureGoPage(${p})">${p}</button>`
          ).join('')}
          <button class="sd-page-btn ${currentPage === totalPages ? 'is-disabled' : ''}" onclick="window.__nurtureGoPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>
          <select class="sd-page-size" onchange="window.__nurtureChangePageSize(this.value)">
            ${[10, 20, 50].map(s => `<option value="${s}" ${pageSize === s ? 'selected' : ''}>${s}条/页</option>`).join('')}
          </select>
        </div>
      </div>
    `;
  }

  function renderTable() {
    const paged = getPagedData();
    const tab = pageState.mainTab;
    let tableHtml = '';
    if (tab === 'assign' || tab === 'assign_lz') tableHtml = renderAssignTable(paged.data);
    else if (tab === 'audit') tableHtml = renderAuditTable(paged.data);
    else if (tab === 'incomplete') tableHtml = renderIncompleteTable(paged.data);
    else if (tab === 'ai_order') tableHtml = renderAiOrderTable(paged.data);
    else if (tab === 'fill_audit') tableHtml = renderFillAuditTable(paged.data);
    return tableHtml + renderPagination(paged);
  }

  function render() {
    const page = document.getElementById('nurtureTaskPage');
    if (!page) return;

    const currentSubTab = pageState.mainTab === 'assign_lz' ? pageState.assignLzSubTab : pageState.assignSubTab;
    const switchFn = pageState.mainTab === 'assign_lz' ? '__switchNurtureAssignLzSubTab' : '__switchNurtureAssignSubTab';

    page.innerHTML = `
      <div class="sd-snurture-tabs-wrap">
        <div class="sd-snurture-tabs">
          ${MAIN_TABS.map(tab => `
            <div class="sd-snurture-tab ${pageState.mainTab === tab.key ? 'active' : ''}" onclick="window.__switchNurtureMainTab('${tab.key}')">
              <span>${tab.label}</span>
              ${tab.badge ? `<span class="sd-tab-badge">${tab.badge}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      ${pageState.mainTab === 'my_task' ? `
        <div id="nurtureMyTaskWorkspace" style="flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden;"></div>
      ` : `
        <div class="sd-snurture-content">
          ${renderFilterBar()}
          ${renderSubTabs(currentSubTab, switchFn)}
          ${renderActionBar()}
          <div class="sd-table-card">
            ${renderTable()}
          </div>
        </div>
        ${pageState.assignModal.show ? renderAssignModal() : ''}
        ${pageState.auditModal.show ? renderAuditModal() : ''}
        ${pageState.detailModal.show ? renderDetailModal() : ''}
      `}
    `;

    if (pageState.mainTab === 'my_task') {
      if (typeof window.renderNurtureTaskPage === 'function') {
        window.renderNurtureTaskPage();
      }
    } else {
      bindFilterEvents();
    }
  }

  // ==================== 事件绑定 ====================
  function bindFilterEvents() {
    const page = document.getElementById('nurtureTaskPage');
    if (!page) return;

    const filterKeys = ['data-filter', 'data-audit-filter', 'data-inc-filter', 'data-ai-filter', 'data-fill-filter'];

    filterKeys.forEach(attr => {
      const inputs = page.querySelectorAll(`[${attr}]`);
      inputs.forEach(input => {
        const key = input.getAttribute(attr);
        const isDate = input.type === 'date';

        if (input.tagName === 'INPUT') {
          input.addEventListener('input', (e) => {
            const f = getCurrentFilters();
            if (f.hasOwnProperty(key)) {
              f[key] = e.target.value;
            }
          });
          input.addEventListener('change', (e) => {
            const f = getCurrentFilters();
            if (f.hasOwnProperty(key)) {
              f[key] = e.target.value;
            }
          });
        } else if (input.tagName === 'SELECT') {
          input.addEventListener('change', (e) => {
            const f = getCurrentFilters();
            if (f.hasOwnProperty(key)) {
              f[key] = e.target.value;
            }
          });
        }
      });
    });

    // 日期范围输入
    const dateInputs = page.querySelectorAll('.sd-date-input');
    dateInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const id = e.target.id;
        const f = getCurrentFilters();
        const dateMap = {
          filterCaptureStart: 'captureStart', filterCaptureEnd: 'captureEnd',
          filterReceiveStart: 'receiveStart', filterReceiveEnd: 'receiveEnd',
          auditSubmitStart: 'submitStart', auditSubmitEnd: 'submitEnd',
          auditLastStart: 'lastStart', auditLastEnd: 'lastEnd',
          auditAssignStart: 'assignStart', auditAssignEnd: 'assignEnd',
          incCaptureStart: 'captureStart', incCaptureEnd: 'captureEnd',
          incLastFollowStart: 'lastFollowStart', incLastFollowEnd: 'lastFollowEnd',
          incAssignStart: 'assignStart', incAssignEnd: 'assignEnd',
          aiCreateStart: 'createStart', aiCreateEnd: 'createEnd',
          fillCreateStart: 'createStart', fillCreateEnd: 'createEnd'
        };
        if (dateMap[id] && f.hasOwnProperty(dateMap[id])) {
          f[dateMap[id]] = e.target.value;
        }
      });
    });
  }

  // ==================== 全局事件函数 ====================
  window.__switchNurtureMainTab = function(key) {
    pageState.mainTab = key;
    pageState.selectedRows.clear();
    pageState.currentPage = 1;
    render();
  };

  window.__switchNurtureAssignSubTab = function(key) {
    pageState.assignSubTab = key;
    pageState.selectedRows.clear();
    pageState.currentPage = 1;
    render();
  };

  window.__switchNurtureAssignLzSubTab = function(key) {
    pageState.assignLzSubTab = key;
    pageState.selectedRows.clear();
    pageState.currentPage = 1;
    render();
  };

  window.__nurtureToggleFilterExpand = function() {
    pageState.filterExpanded[pageState.mainTab] = !pageState.filterExpanded[pageState.mainTab];
    render();
  };

  window.__nurtureResetFilters = function() {
    resetCurrentFilters();
    pageState.currentPage = 1;
    render();
  };

  window.__nurtureDoSearch = function() {
    pageState.selectedRows.clear();
    pageState.currentPage = 1;
    render();
  };

  window.__nurtureRefresh = function() {
    // 重新生成数据
    if (pageState.mainTab === 'assign') {
      pageState.assignData = { new: generateAssignData(25, 'new'), old: generateAssignData(20, 'old'), overdue: generateAssignData(15, 'overdue') };
    } else if (pageState.mainTab === 'assign_lz') {
      pageState.assignLzData = { new: generateAssignData(18, 'new', true), old: generateAssignData(12, 'old', true), overdue: generateAssignData(8, 'overdue', true) };
    } else if (pageState.mainTab === 'audit') {
      pageState.auditData = generateAuditData(20);
    } else if (pageState.mainTab === 'incomplete') {
      pageState.incompleteData = generateIncompleteData(30);
    } else if (pageState.mainTab === 'ai_order') {
      pageState.aiOrderData = generateAiOrderData(8);
    } else if (pageState.mainTab === 'fill_audit') {
      pageState.fillAuditData = generateFillAuditData(25);
    }
    pageState.selectedRows.clear();
    render();
  };

  window.__nurtureToggleAll = function(checked) {
    const data = getFilteredData();
    if (checked) {
      data.forEach(item => pageState.selectedRows.add(item.id));
    } else {
      pageState.selectedRows.clear();
    }
    render();
  };

  window.__nurtureToggleRow = function(id, checked) {
    if (checked) {
      pageState.selectedRows.add(id);
    } else {
      pageState.selectedRows.delete(id);
    }
    render();
  };

  window.__nurtureBatchAssign = function(mode) {
    pageState.assignModal = {
      show: true,
      mode: mode,
      agentFilter: '',
      agents: AGENT_LIST.map(a => ({ ...a, assignCount: 0 }))
    };
    render();
  };

  window.__nurtureAssignOne = function(id) {
    pageState.selectedRows.clear();
    pageState.selectedRows.add(id);
    window.__nurtureBatchAssign('selected');
  };

  window.__nurtureCloseAssignModal = function(e) {
    if (e && e.target !== e.currentTarget) return;
    pageState.assignModal.show = false;
    render();
  };

  window.__nurtureModalFilterAgent = function(val) {
    pageState.assignModal.agentFilter = val;
    render();
  };

  window.__nurtureModalResetFilter = function() {
    pageState.assignModal.agentFilter = '';
    render();
  };

  window.__nurtureModalSearchAgent = function() {
    render();
  };

  window.__nurtureModalSetAssignCount = function(account, val) {
    const agent = pageState.assignModal.agents.find(a => a.account === account);
    if (agent) {
      agent.assignCount = parseInt(val) || 0;
      const countEl = document.getElementById('modalAssignedCount');
      if (countEl) {
        countEl.textContent = pageState.assignModal.agents.reduce((s, a) => s + (a.assignCount || 0), 0);
      }
    }
  };

  window.__nurtureModalAverageAssign = function() {
    const { mode, agents } = pageState.assignModal;
    const unassignedCount = getCurrentData().filter(i => !i.agentAccount).length;
    const selectedCount = pageState.selectedRows.size;
    const total = mode === 'all' ? unassignedCount : selectedCount;
    const avg = Math.floor(total / agents.length);
    const remainder = total % agents.length;
    agents.forEach((a, i) => { a.assignCount = avg + (i < remainder ? 1 : 0); });
    render();
  };

  window.__nurtureConfirmAssign = function() {
    const { mode, agents } = pageState.assignModal;
    const data = getCurrentData();
    let toAssign = mode === 'all' ? data.filter(i => !i.agentAccount) : data.filter(i => pageState.selectedRows.has(i.id));
    let idx = 0;
    agents.forEach(agent => {
      for (let i = 0; i < (agent.assignCount || 0) && idx < toAssign.length; i++) {
        toAssign[idx].agentAccount = agent.account;
        idx++;
      }
    });
    pageState.assignModal.show = false;
    pageState.selectedRows.clear();
    render();
    alert('分配成功！');
  };

  // ==================== 审批弹窗事件 ====================
  window.__nurtureBatchAudit = function(pass) {
    if (pageState.selectedRows.size === 0) {
      alert('请先选择要审核的记录！');
      return;
    }
    pageState.auditModal = {
      show: true,
      pass: pass,
      selectedIds: Array.from(pageState.selectedRows),
      remark: ''
    };
    render();
  };

  window.__nurtureAuditOne = function(id, pass) {
    pageState.auditModal = {
      show: true,
      pass: pass,
      selectedIds: [id],
      remark: ''
    };
    render();
  };

  window.__nurtureCloseAuditModal = function() {
    pageState.auditModal.show = false;
    pageState.auditModal.remark = '';
    render();
  };

  window.__nurtureAuditRemarkChange = function(val) {
    pageState.auditModal.remark = val;
  };

  window.__nurtureConfirmAudit = function() {
    const { pass, selectedIds, remark } = pageState.auditModal;
    const data = getCurrentData();
    const result = pass ? '通过' : '驳回';
    let count = 0;
    data.forEach(item => {
      if (selectedIds.includes(item.id) && (item.result === '待审核' || item.auditResult === '待审核' || item.auditResult === '待回访')) {
        if (item.hasOwnProperty('result')) item.result = result;
        if (item.hasOwnProperty('auditResult')) item.auditResult = pass ? '回访成功' : '回访失败';
        if (item.hasOwnProperty('smartFillStatus')) item.smartFillStatus = pass ? '审核通过' : '审核驳回';
        count++;
      }
    });
    pageState.auditModal.show = false;
    pageState.auditModal.remark = '';
    pageState.selectedRows.clear();
    render();
    alert(`已${result} ${count} 条记录！` + (remark ? `\n备注：${remark}` : ''));
  };

  // ==================== 详情弹窗事件 ====================
  window.__nurtureViewDetail = function(id) {
    const data = getCurrentData();
    const item = data.find(i => i.id === id);
    if (item) {
      pageState.detailModal = {
        show: true,
        tab: pageState.mainTab,
        item: item
      };
      render();
    }
  };

  window.__nurtureCloseDetailModal = function() {
    pageState.detailModal.show = false;
    pageState.detailModal.item = null;
    render();
  };

  window.__nurtureAuditPass = function(id) {
    const list = pageState.fillAuditData;
    const item = list.find(i => i.id == id);
    if (item) {
      item.auditStatus = '通过';
      item.auditResult = '通过';
      item.smartFillStatus = '审核通过';
    }
    pageState.detailModal.show = false;
    pageState.detailModal.item = null;
    render();
    alert('审核通过（原型演示）');
  };

  window.__nurtureAuditPassXl = function(id, tab) {
    const list = tab === 'ai_order' ? pageState.aiOrderData : pageState.fillAuditData;
    const item = list.find(i => i.id == id);
    if (item) {
      item.auditStatus = '通过';
      item.auditResult = '通过';
      item.smartFillStatus = '审核通过';
    }
    pageState.detailModal.show = false;
    pageState.detailModal.item = null;
    render();
    alert('审核通过（原型演示）');
  };

  window.__nurtureAuditRejectXl = function(id, tab) {
    const list = tab === 'ai_order' ? pageState.aiOrderData : pageState.fillAuditData;
    const item = list.find(i => i.id == id);
    if (item) {
      item.auditStatus = '驳回';
      item.auditResult = '驳回';
      item.smartFillStatus = '审核驳回';
    }
    pageState.detailModal.show = false;
    pageState.detailModal.item = null;
    render();
    alert('已驳回（原型演示）');
  };

  window.__nurtureExport = function() {
    alert('导出功能（原型演示）');
  };

  window.__nurtureGoPage = function(page) {
    const paged = getPagedData();
    if (page < 1 || page > paged.totalPages) return;
    pageState.currentPage = page;
    pageState.selectedRows.clear();
    render();
  };

  window.__nurtureChangePageSize = function(size) {
    pageState.pageSize = parseInt(size);
    pageState.currentPage = 1;
    pageState.selectedRows.clear();
    render();
  };

  // ==================== 页面渲染接口 ====================
  window.__renderSupervisorNurturePage = function(targetTab) {
    if (targetTab) {
      pageState.mainTab = targetTab;
      pageState.selectedRows.clear();
      pageState.currentPage = 1;
    }
    render();
  };

  // ==================== 初始化 ====================
  function init() {
    const page = document.getElementById('nurtureTaskPage');
    if (page && page.classList.contains('show')) {
      render();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();