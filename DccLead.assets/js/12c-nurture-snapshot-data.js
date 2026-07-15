function getLeadSmartCodeProfile(lead) {
  const mediaType = lead.mediaType || (lead.leadSource && lead.leadSource.includes('官网') ? '自有渠道' : '外部媒体');
  const bigMediaName = lead.bigMediaName || (lead.leadSource && ['懂车帝', '汽车之家', '抖音直播'].some(name => lead.leadSource.includes(name)) ? lead.leadSource.replace('直播', '') : '东风日产官方');
  const mediaName = lead.mediaName || lead.leadSource;
  const landingPlatform = lead.landingPlatform || (lead.leadSource && lead.leadSource.includes('小程序') ? '微信小程序' : 'DCC培育 · SaaS平台');
  return {
    channelCode: lead.channelCode || channelCodeOptions[0],
    landingPlatform,
    mediaType,
    bigMediaName,
    mediaName,
    projectName: lead.projectName || 'DCC培育项目',
    scheduleName: lead.scheduleName || `${lead.intentSeries || '全车系'}培育投放排期`,
    deliveryTypeName: lead.deliveryTypeName || '效果投放',
    seriesName: lead.seriesName || lead.intentSeries,
    deliveryCompanyName: lead.deliveryCompanyName || '东风日产乘用车公司',
    terminalTypeName: lead.terminalTypeName || 'PC/H5',
    trafficTypeName: lead.trafficTypeName || '自然流量',
    customerSourceName: lead.customerSourceName || lead.leadSource,
    leadType: lead.leadType
  };
}

function getLeadDetailGroups(lead) {
  const smartCodeProfile = getLeadSmartCodeProfile(lead);
  return [
    {
      title: '基础信息',
      items: [
        { label: '客户姓名', value: detailValue(lead.customerName) },
        { label: '性别', value: detailValue(lead.gender) },
        { label: '电话号码', value: detailValue(lead.phone) },
        { label: '备用电话', value: detailValue(lead.backupPhone) },
        { label: '微信号', value: detailValue(lead.wechatId || `wx_${lead.phone.replace(/[^0-9]/g, '').slice(-4)}`) },
        { label: 'IP地址归属地', value: detailValue(lead.ipLocation) },
        { label: '购车方式', value: detailValue(lead.purchaseMethod) },
        { label: '计划购买时间', value: detailValue(lead.plannedPurchaseTime) },
        { label: '预计到店时间', value: detailValue(lead.expectedArrivalTime || '待确认') }
      ]
    },
    {
      title: '首次信息',
      items: [
        { label: '首次线索来源', value: detailValue(lead.firstLeadSource || lead.leadSource) },
        { label: '首次线索状态', value: detailValue(lead.firstLeadStatus || lead.status) },
        { label: '首次意向级别', value: detailValue(lead.firstIntentLevel || lead.intentLevel) }
      ]
    },
    {
      title: '线索信息',
      items: [
        { label: '线索类型', value: detailValue(lead.leadType) },
        { label: '线索来源', value: detailValue(lead.leadSource) },
        { label: '意向级别', value: formatLeadValueText(lead, 'intentLevel') },
        { label: '意向车系', value: detailValue(lead.intentSeries) },
        { label: '意向车型', value: detailValue(lead.intentModel || `${lead.intentSeries || 'N6'} 智驾版`) },
        { label: '意向专营店', value: detailValue(lead.dealer) },
        { label: '线索状态', value: formatLeadValueText(lead, 'status') },
        { label: '异常原因', value: detailValue(lead.abnormalCode) },
        { label: '内饰颜色', value: detailValue(lead.interiorColor || '黑色') },
        { label: '外观颜色', value: detailValue(lead.exteriorColor || '珠光白') },
        { label: '留资时间', value: detailValue(lead.createdAt) },
        { label: '计划邀约时间', value: detailValue(lead.plannedInviteTime || '待排期') },
        { label: '跟进人员ID', value: detailValue(lead.followUserId || 'DCC-EMP-001') },
        { label: '线索描述', value: detailValue(lead.description || `${lead.customerName}关注${lead.intentSeries}，当前线索状态为${lead.status}`) },
        { label: '线索备注', value: detailValue(lead.remark || '请按培育节奏跟进客户意向变化') },
        { label: '总部线索ID', value: detailValue(lead.headquarterLeadId || `HQ${lead.sourceLeadId || lead.leadCode}`) },
        { label: '培育线索编码', value: detailValue(lead.leadCode) },
        { label: '来源线索ID', value: detailValue(lead.sourceLeadId) }
      ]
    },
    {
      title: '企微信息',
      items: [
        { label: '添加好友来源', value: detailValue(lead.wecomFriendSource || '外呼邀约') },
        { label: '添加渠道', value: detailValue(lead.wecomChannel || '官方企业微信') },
        { label: '企微员工userid', value: detailValue(lead.wecomUserId || 'ww_dcc_001') },
        { label: '企微添加时间', value: detailValue(lead.wecomAddTime || '待添加') },
        { label: '企微删除时间', value: detailValue(lead.wecomDeleteTime || '—') }
      ]
    },
    {
      title: '投放信息',
      items: [
        { label: 'SmartCode', value: detailValue(lead.smartCode) },
        { label: '渠道编码', value: detailValue(smartCodeProfile.channelCode) },
        { label: '落地平台', value: detailValue(smartCodeProfile.landingPlatform) },
        { label: '媒体类型', value: detailValue(smartCodeProfile.mediaType) },
        { label: '大媒体', value: detailValue(smartCodeProfile.bigMediaName) },
        { label: '媒体名称', value: detailValue(smartCodeProfile.mediaName) },
        { label: '大项目', value: detailValue(smartCodeProfile.projectName) },
        { label: '排期名称', value: detailValue(smartCodeProfile.scheduleName) },
        { label: '投放类型', value: detailValue(smartCodeProfile.deliveryTypeName) },
        { label: '车系名称', value: detailValue(smartCodeProfile.seriesName) },
        { label: '投放公司', value: detailValue(smartCodeProfile.deliveryCompanyName) },
        { label: '终端类型', value: detailValue(smartCodeProfile.terminalTypeName) },
        { label: '流量类型', value: detailValue(smartCodeProfile.trafficTypeName) },
        { label: '客户来源', value: detailValue(smartCodeProfile.customerSourceName) },
        { label: '线索类型', value: detailValue(smartCodeProfile.leadType) }
      ]
    },
    {
      title: '其他信息',
      items: [
        { label: '最新留资车系', value: detailValue(lead.latestSeries) },
        { label: '中止培育线索', value: formatFlagTextWithUpdatedAt(lead.stopNurtureLead || (lead.status === '无效' ? '是' : '否'), lead.stopNurtureLeadUpdatedAt || `${lead.createdAt} 09:45:00`) }
      ]
    }
  ];
}

function getLeadTaskInitializations(lead) {
  const smartCodeProfile = getLeadSmartCodeProfile(lead);
  const taskSeeds = lead.taskInitializations || [
    {
      taskCode: `PYRW${lead.createdAt.replace(/-/g, '')}0031`,
      createdAt: `${lead.createdAt} 09:30:00`,
      scenarioType: 'manual-success',
      systemStatus: '已处理',
      status: lead.status,
      intentLevel: lead.intentLevel,
      abnormalCode: lead.abnormalCode,
      initialLeadSource: '场景一：NEV线索中台',
      initialDealer: lead.dealer,
      channelCode: smartCodeProfile.channelCode,
      deliveryTypeName: smartCodeProfile.deliveryTypeName,
      scheduleName: smartCodeProfile.scheduleName
    },
    {
      taskCode: `PYRW${lead.createdAt.replace(/-/g, '')}0086`,
      createdAt: `${lead.createdAt} 15:45:00`,
      scenarioType: 'ai-redial-manual',
      systemStatus: '已处理',
      status: lead.status === '培育中' ? '待培育' : lead.status,
      intentLevel: lead.intentLevel === 'A' ? 'B' : lead.intentLevel,
      abnormalCode: '—',
      initialLeadSource: '场景二：888888-私域挖掘',
      initialDealer: lead.dealer,
      channelCode: channelCodeOptions[1],
      deliveryTypeName: '再营销投放',
      scheduleName: `${lead.intentSeries || '全车系'}二次培育排期`
    },
    {
      taskCode: `PYRW${lead.createdAt.replace(/-/g, '')}0128`,
      createdAt: `${lead.createdAt} 17:10:00`,
      scenarioType: 'ai-redial-ai-finish',
      systemStatus: '已处理',
      status: lead.status,
      intentLevel: lead.intentLevel,
      abnormalCode: lead.abnormalCode,
      initialLeadSource: '场景三：999999-线索挖掘',
      initialDealer: lead.dealer,
      channelCode: channelCodeOptions[2],
      deliveryTypeName: 'AI培育投放',
      scheduleName: `${lead.intentSeries || '全车系'}AI重推排期`
    }
  ];

  return normalizeTaskSystemStatuses(taskSeeds).map((task, index) => {
    const taskProfile = { ...smartCodeProfile, ...task };
    const assignmentSnapshot = task.assignmentSnapshot || createTaskAssignmentSnapshot(lead, task, taskProfile, index);
    const workorderSnapshot = task.workorderSnapshot || createTaskWorkorderSnapshot(lead, task, assignmentSnapshot, index);
    return {
      taskCode: task.taskCode,
      createdAt: task.createdAt || `${lead.createdAt} 09:30:00`,
      systemStatus: task.systemStatus || '已处理',
      assignmentSnapshot,
      workorderSnapshot,
      groups: [
        {
          title: '初始化线索快照',
          items: [
            { label: '意向车系', value: detailValue(task.initialIntentSeries || lead.intentSeries) },
            { label: '意向专营店', value: detailValue(task.initialDealer || lead.dealer) },
            { label: '线索状态', value: detailValue(task.status || lead.status) },
            { label: '异常原因', value: detailValue(task.abnormalCode || lead.abnormalCode) },
            { label: '意向级别', value: detailValue(task.intentLevel || lead.intentLevel) },
            { label: '初始化线索来源', value: detailValue(task.initialLeadSource || lead.leadSource) },
            { label: '留资未满线索', value: formatFlagTextWithUpdatedAt(task.isResourceUnfilled || lead.isResourceUnfilled || (lead.status === '无效' ? '是' : '否'), task.resourceUnfilledUpdatedAt || lead.resourceUnfilledUpdatedAt || `${lead.createdAt} 10:18:00`) },
            { label: '门店冷线索', value: formatFlagTextWithUpdatedAt(task.isDealerColdLead || lead.isDealerColdLead || (lead.status === '待培育' ? '是' : '否'), task.dealerColdLeadUpdatedAt || lead.dealerColdLeadUpdatedAt || `${lead.createdAt} 14:30:00`) },
            { label: '总部冷线索', value: formatFlagTextWithUpdatedAt(task.isHeadquarterColdLead || lead.isHeadquarterColdLead || (lead.status === '无效' ? '是' : '否'), task.headquarterColdLeadUpdatedAt || lead.headquarterColdLeadUpdatedAt || `${lead.createdAt} 16:45:00`) },
            { label: '人工外呼无人接', value: formatFlagTextWithUpdatedAt(task.manualCallNoAnswer || lead.manualCallNoAnswer || (lead.status === '待培育' ? '是' : '否'), task.manualCallNoAnswerUpdatedAt || lead.manualCallNoAnswerUpdatedAt || `${lead.createdAt} 17:20:00`) },
            { label: '三无忧线索', value: formatFlagTextWithUpdatedAt(task.isWorryFreeLead || lead.isWorryFreeLead || (task.scenarioType === 'ai-redial-ai-finish' ? '是' : '否'), task.worryFreeLeadUpdatedAt || lead.worryFreeLeadUpdatedAt || `${lead.createdAt} 18:00:00`) }
          ]
        },
        {
          title: '初始化投放快照',
          items: [
            { label: 'smartCode', value: detailValue(task.smartCode || lead.smartCode) },
            { label: '渠道编码', value: detailValue(taskProfile.channelCode) },
            { label: '落地平台', value: detailValue(taskProfile.landingPlatform) },
            { label: '媒体类型', value: detailValue(taskProfile.mediaType) },
            { label: '大媒体', value: detailValue(taskProfile.bigMediaName) },
            { label: '媒体名称', value: detailValue(taskProfile.mediaName) },
            { label: '大项目', value: detailValue(taskProfile.projectName) },
            { label: '排期名称', value: detailValue(taskProfile.scheduleName) },
            { label: '投放类型', value: detailValue(taskProfile.deliveryTypeName) },
            { label: '车系名称', value: detailValue(taskProfile.seriesName) },
            { label: '投放公司', value: detailValue(taskProfile.deliveryCompanyName) },
            { label: '终端类型', value: detailValue(taskProfile.terminalTypeName) },
            { label: '流量类型', value: detailValue(taskProfile.trafficTypeName) },
            { label: '客户来源', value: detailValue(taskProfile.customerSourceName) },
            { label: '线索类型', value: detailValue(task.leadType || lead.leadType) }
          ]
        }
      ]
    };
  });
}

function getLeadUpstreamSyncLogs(lead, tasks) {
  const sortedTasks = sortTasksByCreatedAtDesc(tasks);
  const oldestTask = sortedTasks[sortedTasks.length - 1];
  const latestTask = sortedTasks[0];
  const headquarterLeadId = lead.headquarterLeadId || `HQ${lead.sourceLeadId || lead.leadCode}`;
  const makePayload = (syncNo, syncTime, extra = {}) => JSON.stringify({
    syncNo,
    syncTime,
    headquarterLeadId,
    sourceLeadId: lead.sourceLeadId,
    manufacturerLeadCode: lead.manufacturerLeadCode || `FAC${lead.createdAt.replace(/-/g, '')}${String(syncNo).padStart(3, '0')}`,
    customerName: lead.customerName,
    phone: lead.phone,
    intentSeries: extra.intentSeries || lead.intentSeries,
    intentLevel: extra.intentLevel || lead.intentLevel,
    dealerCode: lead.dealerCode,
    dealerName: lead.dealer,
    leadStatus: extra.leadStatus || lead.status,
    upstreamEvent: extra.upstreamEvent || '总部线索同步',
    rawAction: extra.rawAction || 'UPSERT'
  }, null, 2);

  return [
    {
      syncTime: `${lead.createdAt} 09:12:18`,
      headquarterLeadId,
      processResult: '创建培育任务',
      converted: '是',
      taskCode: oldestTask?.taskCode || '—',
      reason: '入库时未发现跟进中的培育任务，系统按规则创建新的培育任务。',
      payload: makePayload(1, `${lead.createdAt} 09:12:18`, { upstreamEvent: '首次同步' })
    },
    {
      syncTime: `${lead.createdAt} 14:26:35`,
      headquarterLeadId,
      processResult: '仅记录接入数据',
      converted: '否',
      taskCode: '—',
      reason: `入库时存在跟进中的培育任务 ${oldestTask?.taskCode || '—'}，为避免干扰现有任务线，本次接入仅记录追溯数据，不创建新培育任务。`,
      payload: makePayload(2, `${lead.createdAt} 14:26:35`, {
        leadStatus: '跟进中',
        upstreamEvent: '重复同步',
        rawAction: 'TRACE_ONLY'
      })
    },
    {
      syncTime: `${lead.createdAt} 17:10:00`,
      headquarterLeadId,
      processResult: '创建新的培育任务',
      converted: '是',
      taskCode: latestTask?.taskCode || '—',
      reason: '入库时未发现跟进中的培育任务，系统按最新接收数据创建新的培育任务。',
      payload: makePayload(3, `${lead.createdAt} 17:10:00`, {
        intentLevel: latestTask?.intentLevel || lead.intentLevel,
        leadStatus: latestTask?.status || lead.status,
        upstreamEvent: '再次同步后转化任务'
      })
    }
  ].sort((a, b) => String(b.syncTime || '').localeCompare(String(a.syncTime || ''), 'zh-CN', { numeric: true }));
}

function createTaskAssignmentSnapshot(lead, task, taskProfile, index) {
  const scenarioType = task.scenarioType || (index === 0 ? 'manual-success' : 'ai-redial-manual');
  const isManualScenario = scenarioType === 'manual-success';
  const aiCallType = isManualScenario ? '人工外呼' : '一知冷线索';
  const communicationMethod = isManualScenario ? '人工客服跟进' : 'AI智能外呼';
  const finalChannel = isManualScenario ? '分配给人工客服' : '分配给AI客服';
  const agentLeadStatus = task.status || lead.status || '培育中';
  const agentLeadReason = task.abnormalCode && task.abnormalCode !== '—' ? task.abnormalCode : (isManualScenario ? '人工跟进待确认' : '无法联系');
  const ratioEnabled = isManualScenario ? '否' : '是';
  const ratio = isManualScenario ? '' : '50%';
  const intentSeries = lead.intentSeries || taskProfile.seriesName || 'N7';
  const dealer = lead.dealer || '东风日产专营店';
  const smartCode = task.smartCode || lead.smartCode || '112233';
  const city = lead.intentCity || lead.ipLocation || '广州市';
  const channelCode = taskProfile.channelCode || channelCodeOptions[0];
  const matchedConfigurator = '线索分配规则';
  const matchedDimension = isManualScenario ? '渠道编码条件' : 'SC条件';
  const nextNode = {
    '是否按比例': ratioEnabled,
    '外呼类型': aiCallType,
    '占用比例': ratio,
    ...(!isManualScenario ? { '推送时间': '星期一/星期二 09:00~18:00' } : {})
  };
  const configuratorRules = [
    { node: '线索分配规则 · 意向门店条件', dimension: '意向门店条件', conditions: [`意向门店 = ${dealer}`, `意向车系 = ${intentSeries}`, `线索状态 = ${agentLeadStatus}`] },
    { node: '线索分配规则 · 车系条件', dimension: '车系条件', conditions: [`意向车系 = ${intentSeries}`] },
    { node: '线索分配规则 · SC条件', dimension: 'SC条件', conditions: [`SmartCode = ${smartCode}`, `意向车系 = ${intentSeries}`, `意向城市 = ${city}`] },
    { node: '线索分配规则 · 大项目名条件', dimension: '大项目名条件', conditions: [`大项目 = ${taskProfile.projectName || 'DCC培育项目'}`, `意向车系 = ${intentSeries}`] },
    { node: '线索分配规则 · 渠道编码条件', dimension: '渠道编码条件', conditions: [`渠道编码 = ${channelCode}`, `意向车系 = ${intentSeries}`] },
    { node: '线索分配规则 · 线索状态条件', dimension: '线索状态条件', conditions: [`线索状态 = ${agentLeadStatus}`, `意向车系 = ${intentSeries}`] }
  ];
  const matchedIndex = configuratorRules.findIndex(rule => rule.dimension === matchedDimension);

  return {
    finalChannel,
    matchedConfigurator,
    matchedDimension,
    communicationMethod,
    aiCallType,
    agentLeadStatus,
    agentLeadReason,
    systemStatus: task.systemStatus || '已处理',
    rules: configuratorRules.map((rule, ruleIndex) => ({
      ...rule,
      matched: rule.dimension === matchedDimension,
      status: rule.dimension === matchedDimension ? '最终命中' : (ruleIndex < matchedIndex ? '未命中' : '未执行'),
      next: rule.dimension === matchedDimension ? nextNode : {}
    }))
  };
}

function createTaskWorkorderSnapshot(lead, task, assignmentSnapshot, index) {
  const isAiTask = assignmentSnapshot?.communicationMethod === 'AI智能外呼';
  const dateKey = (lead.createdAt || '2026-05-28').replace(/-/g, '');
  const suffix = String(index + 1).padStart(3, '0');
  const baseCode = `HF${dateKey}${suffix}`;
  const baseIntentLevel = task.intentLevel || lead.intentLevel;
  const createPayload = (round, method, outboundType, systemCode, callId, status, createdAtOverride, result = {}) => JSON.stringify({
    messageType: 'CALL_BILL_RETURN',
    cultivateTaskCode: task.taskCode,
    callbackWorkorderCode: `${baseCode}${round}`,
    communicationMethod: method,
    outboundType,
    outboundSystemCode: systemCode,
    callId,
    syncStatus: status,
    callBillSyncTime: result.callBillSyncTime || createdAtOverride || `${lead.createdAt} ${round === 1 ? '10:18:36' : round === 2 ? '15:32:22' : '11:46:28'}`,
    callStatus: result.callStatus || (callId && callId !== '—' ? '已接通' : '待返回'),
    customerIntentLevel: result.customerIntentLevel || baseIntentLevel || '—',
    outboundTags: result.outboundTags || [],
    recordingUrl: result.recordingUrl || '—',
    recordingText: result.recordingText || '—',
    leadCode: lead.leadCode,
    phone: lead.phone
  }, null, 2);

  const scenarioType = task.scenarioType || (isAiTask ? 'ai-redial-manual' : 'manual-success');
  const makeManualOrder = (round, options = {}) => {
    const systemCode = `MANUAL-OUT-${dateKey}-${suffix}${round > 1 ? `-${round}` : ''}`;
    const actualTime = options.actualSyncTime || `${lead.createdAt} ${round === 1 ? '16:03:12' : '15:32:22'}`;
    const callStatus = options.callStatus || '人工客服跟进';
    const syncStatus = options.syncStatus || '同步成功';
    return {
      contactRound: round,
      callbackWorkorderCode: `${baseCode}${round}`,
      isAiRedialTask: options.isAiRedialTask || '否',
      stopTask: options.stopTask || '否',
      taskAbnormalReason: options.taskAbnormalReason || '转人工客服跟进',
      communicationMethod: '人工客服跟进',
      outboundType: '人工外呼',
      smartCode: task.smartCode || lead.smartCode || taskProfile.smartCode || '—',
      expectedPushTime: options.expectedPushTime || `${lead.createdAt} ${round === 1 ? '16:00:00' : '15:30:00'}`,
      syncStatus,
      actualSyncTime: actualTime,
      outboundSystemCode: systemCode,
      callId: '—',
      callBillSyncTime: '—',
      callStatus,
      willingAddWecom: '待确认',
      wecomId: '待确认',
      customerIntentLevel: baseIntentLevel,
      outboundTags: options.outboundTags || ['人工跟进'],
      recordingUrl: '—',
      recordingText: options.recordingText || '人工客服跟进，外呼结果由人工坐席回填。',
      recordingDialogue: [],
      outboundResponsePayload: createPayload(round, '人工客服跟进', '人工外呼', systemCode, '—', syncStatus, actualTime, {
        callBillSyncTime: '—',
        callStatus,
        customerIntentLevel: baseIntentLevel,
        outboundTags: options.outboundTags || ['人工跟进'],
        recordingText: options.recordingText || '人工客服跟进，外呼结果由人工坐席回填。'
      }),
      postCallSnapshot: createPostCallSnapshot(lead, task, assignmentSnapshot, {
        round,
        callbackWorkorderCode: `${baseCode}${round}`,
        communicationMethod: '人工客服跟进',
        outboundType: '人工外呼',
        actualSyncTime: actualTime,
        callStatus,
        tags: options.outboundTags || ['人工跟进'],
        nextFlow: '人工客服跟进',
        matchedRules: [],
        leadDispatchPath: options.leadDispatchPath
      })
    };
  };
  const makeAiOrder = (round, options = {}) => {
    const callId = options.callId || `CALL-${dateKey}-${String(1284 + index + round * 137).padStart(7, '0')}`;
    const systemCode = `AI-OUT-${dateKey}-${suffix}${round > 1 ? `-R${round - 1}` : ''}`;
    const actualTime = options.actualSyncTime || `${lead.createdAt} ${round === 1 ? '09:42:18' : '11:10:12'}`;
    const billTime = options.callBillSyncTime || `${lead.createdAt} ${round === 1 ? '10:18:36' : '11:46:28'}`;
    const callStatus = options.callStatus || '已接通';
    const tags = options.outboundTags || ['高意向', '愿意加微', '需试驾'];
    const matchedRules = options.matchedRules || [];
    const recordingText = options.recordingText || '客户表示近期仍在关注车型，愿意了解门店活动和试驾安排，并同意添加企业微信继续沟通。';
    return {
      contactRound: round,
      callbackWorkorderCode: `${baseCode}${round}`,
      isAiRedialTask: options.isAiRedialTask || '否',
      stopTask: options.stopTask || '否',
      taskAbnormalReason: options.taskAbnormalReason || '—',
      communicationMethod: 'AI智能外呼',
      outboundType: '一知冷线索',
      smartCode: task.smartCode || lead.smartCode || taskProfile.smartCode || '—',
      expectedPushTime: options.expectedPushTime || `${lead.createdAt} ${round === 1 ? '09:40:00' : '11:08:00'}`,
      syncStatus: '同步成功',
      actualSyncTime: actualTime,
      outboundSystemCode: systemCode,
      callId,
      callBillSyncTime: billTime,
      callStatus,
      willingAddWecom: options.willingAddWecom || '是',
      wecomId: options.wecomId || (lead.wechatId || `wx_${lead.phone.replace(/[^0-9]/g, '').slice(-4)}`),
      customerIntentLevel: baseIntentLevel,
      outboundTags: tags,
      recordingUrl: `https://recording.example.com/${callId}.mp3`,
      recordingText,
      recordingDialogue: options.recordingDialogue || [
        { role: 'agent', speaker: '电销顾问', text: '您好，我是东风日产厂家顾问，这边和您确认一下近期关注车型的情况。' },
        { role: 'customer', speaker: '客户', text: callStatus === '已接通' ? '我还在了解，可以发一下门店活动。' : '暂未接听。' },
        { role: 'agent', speaker: '系统提示', text: callStatus === '已接通' ? '客户表达继续了解意愿，进入后续处理。' : '本次未形成有效建联，进入重推判断。' }
      ],
      outboundResponsePayload: createPayload(round, 'AI智能外呼', '一知冷线索', systemCode, callId, '同步成功', billTime, {
        callBillSyncTime: billTime,
        callStatus,
        customerIntentLevel: baseIntentLevel,
        outboundTags: tags,
        recordingUrl: `https://recording.example.com/${callId}.mp3`,
        recordingText
      }),
      postCallSnapshot: createPostCallSnapshot(lead, task, assignmentSnapshot, {
        round,
        callbackWorkorderCode: `${baseCode}${round}`,
        communicationMethod: 'AI智能外呼',
        outboundType: '一知冷线索',
        actualSyncTime: actualTime,
        callStatus,
        tags,
        nextFlow: options.nextFlow || '下发门店并发送新线索短信',
        matchedRules,
        leadDispatchPath: options.leadDispatchPath
      })
    };
  };

  let workorders;
  if (scenarioType === 'manual-success') {
    workorders = [
      makeManualOrder(1, {
        stopTask: '否',
        taskAbnormalReason: '—',
        callStatus: '人工客服跟进',
        outboundTags: ['人工跟进'],
        recordingText: '人工客服已接收任务并完成跟进结果回填。'
      })
    ];
  } else if (scenarioType === 'ai-redial-manual') {
    workorders = [
      makeAiOrder(1, {
        callStatus: '客户未接听',
        willingAddWecom: '否',
        wecomId: '—',
        outboundTags: ['未接通', 'AI重推', '需转人工'],
        taskAbnormalReason: '命中重推规则，转人工客服跟进',
        recordingText: '本次AI外呼未接通，系统命中重推规则，后续转人工客服跟进。',
        nextFlow: '人工客服跟进 / 人工外呼',
        matchedRules: ['通话状态配置', '外呼重推配置']
      }),
      makeManualOrder(2, {
        isAiRedialTask: '是',
        taskAbnormalReason: 'AI重推未接通，转人工客服跟进',
        callStatus: '人工客服跟进',
        outboundTags: ['人工跟进'],
        recordingText: '人工客服承接AI重推后的跟进任务。'
      })
    ];
  } else {
    workorders = [
      makeAiOrder(1, {
        callStatus: '客户未接听',
        willingAddWecom: '否',
        wecomId: '—',
        outboundTags: ['未接通', 'AI重推'],
        taskAbnormalReason: '命中重推规则，创建第二次AI建联',
        recordingText: '首次AI外呼未接通，系统命中重推规则，创建第二次AI建联。',
        nextFlow: 'AI智能外呼 / 一知冷线索',
        matchedRules: ['通话状态配置', '外呼重推配置']
      }),
      makeAiOrder(2, {
        isAiRedialTask: '是',
        callStatus: '已接通',
        outboundTags: ['高意向', '有购车意向'],
        recordingText: '客户已接通并表达购车意向，系统下发新线索短信并同步到NEV线索中台。',
        nextFlow: '下发门店并发送新线索短信',
        leadDispatchPath: '下发到NEV线索中台',
        matchedRules: ['短信下发配置', '外呼标签配置器', '线索下发配置']
      })
    ];
  }

  return { workorders };
}

function createPostCallSnapshot(lead, task, assignmentSnapshot, context) {
  const isConnected = context.callStatus === '已接通';
  const isManual = context.communicationMethod === '人工客服跟进';
  const hasRule = ruleName => (context.matchedRules || []).includes(ruleName);
  const redialHit = hasRule('外呼重推配置');
  const redialPolicy = {
    leadStatus: context.round === 2 ? '资金不足' : (task.status || lead.status || '培育中'),
    abnormalReason: context.round === 2 ? '待培育' : (task.abnormalCode && task.abnormalCode !== '—' ? task.abnormalCode : '无法联系'),
    intentLevel: context.round === 2 ? 'H' : (task.intentLevel || lead.intentLevel || 'A'),
    nextNode: context.nextFlow,
    totalRedialTimes: isManual ? '—' : '3次',
    usedRedialTimes: isManual ? '—' : `${Math.min(Math.max(context.round - 1, 0), 2)}次`,
    redialInterval: isManual ? '—' : '24小时'
  };
  const nextRedialAt = redialHit ? getNextRedialAt(context.actualSyncTime, redialPolicy.redialInterval) : '';
  const redialPending = nextRedialAt ? isFutureDateTime(nextRedialAt) : false;
  const [nextCommunicationMethod, nextOutboundType] = String(context.nextFlow || `${context.communicationMethod} / ${context.outboundType}`)
    .split('/')
    .map(item => item.trim());
  const baseConditions = [`外呼类型 = ${context.outboundType}`, `通话状态 = ${context.callStatus}`];
  const highIntentConditions = [
    ...baseConditions,
    '包含外呼标签：高意向/有购车意向',
    '不包含外呼标签：老年人',
    '通话时长 > 30秒'
  ];
  const outboundTagConditions = [
    ...baseConditions,
    '包含外呼标签：高意向/有购车意向',
    '不包含外呼标签：老年人'
  ];
  const redialConditions = [
    `外呼类型 = ${context.outboundType}`,
    `线索状态 = ${redialPolicy.leadStatus}`,
    `异常原因 = ${redialPolicy.abnormalReason}`,
    `通话状态 = ${context.callStatus}`,
    `外呼标签 = ${(context.tags || []).join('/') || '—'}`,
    `意向级别 = ${redialPolicy.intentLevel}`,
    '重推次数 = 4次',
    `重推间隙 = ${redialPolicy.redialInterval}`
  ];
  const smsSummary = hasRule('短信下发配置') ? '短信：下发新线索短信' : (isManual ? '短信：未执行' : '短信：不下发');
  const leadDispatchPath = context.leadDispatchPath || '下发到人工客服跟进';
  const hasVendorLeadSync = hasRule('线索下发配置') || hasRule('通话状态配置');
  const vendorSyncPayload = hasVendorLeadSync
    ? createVendorLeadSyncPayload(lead, task, assignmentSnapshot, context, redialPolicy)
    : '';
  const pathSummary = hasRule('线索下发配置')
    ? `线索：${leadDispatchPath}，无意向/无法联系/L`
    : (hasRule('通话状态配置') ? '通话状态：关机，待培育/无法联系/H' : (isManual ? '通话状态：未执行' : '线索：暂不下发'));
  const rules = [
    {
      name: '短信下发配置',
      status: hasRule('短信下发配置') ? '符合条件' : (isManual ? '未执行' : '未命中'),
      conditions: [...baseConditions, '包含外呼标签：有购车意向/意向度高'],
      next: hasRule('短信下发配置') ? ['下发短信 = 是', '短信模板 = 新线索短信'] : ['不下发短信']
    },
    {
      name: '外呼标签配置器',
      status: hasRule('外呼标签配置器') ? '符合条件' : (isManual ? '未执行' : '未命中'),
      conditions: outboundTagConditions,
      next: hasRule('外呼标签配置器') ? ['进入线索下发配置判断'] : ['进入重推/人工跟进判断']
    },
    {
      name: '通话状态配置',
      status: hasRule('通话状态配置') ? '符合条件' : (isManual ? '未执行' : '未命中'),
      conditions: baseConditions,
      next: hasRule('通话状态配置')
        ? ['线索状态更新 = 待培育', '异常原因更新 = 无法联系', '意向级别更新 = H']
        : ['保持当前线索状态']
    },
    {
      name: '线索下发配置',
      status: hasRule('线索下发配置') ? '符合条件' : (isManual ? '未执行' : '未命中'),
      conditions: highIntentConditions,
      next: hasRule('线索下发配置')
        ? [`线索下发路径 = ${leadDispatchPath}`, '线索状态更新 = 无意向', '异常原因更新 = 无法联系', '意向级别更新 = L']
        : ['暂不下发线索']
    },
    {
      name: '外呼重推配置',
      status: hasRule('外呼重推配置') ? '符合条件' : (isManual ? '未执行' : '未命中'),
      conditions: redialConditions,
      next: hasRule('外呼重推配置')
        ? [`创建第${context.round + 1}次建联`, `预计建联时间 = ${nextRedialAt || '待计算'}`, `培育沟通方式 = ${nextCommunicationMethod || context.communicationMethod}`, `外呼类型 = ${nextOutboundType || context.outboundType}`]
        : ['不创建重推工单']
    }
  ];
  return {
    finalAction: `${smsSummary}；${pathSummary}`,
    nextFlow: context.nextFlow,
    communicationMethod: context.communicationMethod,
    aiCallType: context.outboundType,
    smartCode: task.smartCode || lead.smartCode || '—',
    taskLeadSnapshot: {
      leadStatus: redialPolicy.leadStatus,
      abnormalReason: redialPolicy.abnormalReason,
      intentLevel: redialPolicy.intentLevel,
      smartCode: task.smartCode || lead.smartCode || '—'
    },
    callStatus: context.callStatus,
    outboundTagsText: isConnected ? '高意向/有购车意向' : ((context.tags || []).join('/') || '—'),
    redialText: isManual ? '人工跟进，不参与AI重推' : `已用 ${redialPolicy.usedRedialTimes} / ${redialPolicy.totalRedialTimes}`,
    pushTime: isManual ? '按人工坐席排班' : '星期一/星期二 09:00~18:00',
    redialHit,
    nextRedialAt,
    redialStatusLabel: redialHit ? (redialPending ? '待重推' : '已到重推时间') : '',
    redialStatusClass: redialHit ? (redialPending ? 'orange' : 'green') : '',
    redialNotice: redialHit ? `系统将于 ${nextRedialAt || '待计算'} 创建第${context.round + 1}次建联，建联方式为 ${context.nextFlow || `${context.communicationMethod} / ${context.outboundType}`}。` : '',
    redialPolicy,
    vendorSyncPayload,
    rules
  };
}

function createVendorLeadSyncPayload(lead, task, assignmentSnapshot, context, redialPolicy) {
  const leadDispatchPath = context.leadDispatchPath || '下发到人工客服跟进';
  const targetSystem = leadDispatchPath === '下发到NEV线索中台' ? 'NEV线索中台' : '总部培育客服';
  return JSON.stringify({
    messageType: 'NEV_LEAD_SYNC',
    syncScene: '建联后线索数据同步',
    targetSystem,
    leadDispatchPath,
    cultivateLeadCode: lead.leadCode,
    cultivateTaskCode: task.taskCode,
    callbackWorkorderCode: context.callbackWorkorderCode,
    sourceLeadId: lead.sourceLeadId,
    headquarterLeadId: lead.headquarterLeadId || `HQ${lead.sourceLeadId || lead.leadCode}`,
    customerName: lead.customerName,
    phone: lead.phone,
    intentSeries: lead.intentSeries,
    intentDealer: lead.dealer,
    leadStatus: '无意向',
    abnormalReason: '无法联系',
    intentLevel: 'L',
    communicationMethod: context.communicationMethod,
    outboundType: context.outboundType,
    callStatus: context.callStatus,
    outboundTags: context.tags || [],
    agentLeadStatus: redialPolicy.leadStatus,
    agentLeadReason: redialPolicy.abnormalReason,
    assignmentConfigurator: assignmentSnapshot?.matchedConfigurator || '—',
    syncTime: context.actualSyncTime,
    operator: 'SYSTEM'
  }, null, 2);
}

function getNextRedialAt(baseTime, intervalText) {
  if (!baseTime || baseTime === '—') return '';
  const baseDate = parseLocalDateTime(baseTime);
  if (!baseDate) return '';
  const hours = Number(String(intervalText || '').match(/\d+/)?.[0] || 0);
  if (!hours) return formatDateTime(baseDate);
  const nextDate = new Date(baseDate.getTime() + hours * 60 * 60 * 1000);
  return formatDateTime(nextDate);
}

function isFutureDateTime(value) {
  const date = parseLocalDateTime(value);
  return date ? date.getTime() > Date.now() : false;
}

function parseLocalDateTime(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;
  const [, year, month, day, hour, minute, second = '0'] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
}

function formatDateTime(date) {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function renderInlineText(tags) {
  return (tags || []).join(' / ') || '—';
}

function normalizeTaskSystemStatuses(tasks) {
  const normalized = tasks.map(task => ({
    ...task,
    systemStatus: task.systemStatus === '处理中' ? '处理中' : '已处理'
  }));
  const processingTasks = normalized
    .filter(task => task.systemStatus === '处理中')
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''), 'zh-CN', { numeric: true }));
  const keepProcessingTaskCode = processingTasks[0]?.taskCode || '';
  return normalized.map(task => ({
    ...task,
    systemStatus: task.systemStatus === '处理中' && task.taskCode === keepProcessingTaskCode ? '处理中' : '已处理'
  }));
}

