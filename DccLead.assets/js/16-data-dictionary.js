// ===== 数据字典管理（原型交互） =====

const DICTIONARY_TYPES = [
  { code: 'BLACKLIST_REASON', name: '黑名单原因', scope: '全局共享', description: '新增黑名单策略、用户黑名单共用', count: 5, importable: false },
  { code: 'BLACKLIST_DURATION', name: '黑名单封禁期限', scope: '全局共享', description: '黑名单策略与用户黑名单共用', count: 5, importable: false },
  { code: 'OUTBOUND_SYSTEM', name: '外呼系统', scope: '业务字典', description: '外呼平台来源及相关配置共用', count: 3, importable: false },
  { code: 'OUTBOUND_TYPE', name: '外呼类型', scope: '业务字典', description: '按所属外呼系统关联维护', count: 8, importable: false },
  { code: 'OUTBOUND_TAG', name: '外呼标签', scope: '业务字典', description: '新增线索下发配置的“包含标签”与“不包含标签”共用', count: 30 },
  { code: 'CROWD_PACKAGE_TAG', name: '人群包标签', scope: '数据字段', description: '留资未满“人群包与SmartCode映射”的人群包标签选项', count: 10 },
  { code: 'CONTACT_STATUS', name: '接触状态', scope: '业务字典', description: '新增未接通激活配置的“接触状态”选项共用', count: 8, importable: false },
  { code: 'RETURN_VISIT_RESULT', name: '回访结果', scope: '业务字典', description: '新增总部冷线索配置的“回访结果”选项共用', count: 9, importable: false },
  { code: 'INTENT_SERIES', name: '意向车系', scope: '业务字典', description: '未接通激活配置、总部冷线索配置的车系选项共用', count: 8 },
  { code: 'PRECALL_SKILL_GROUP', name: '预外呼技能组', scope: '业务字典', description: '新增推送预外呼配置的“工作时段技能组”选项共用', count: 3 },
  { code: 'PRECALL_CALL_STATUS', name: '预外呼通话状态', scope: '业务字典', description: '新增回访工单配置的“预外呼通话状态”选项共用', count: 9, importable: false },
  { code: 'CALL_STATUS', name: '通话状态', scope: '业务字典', description: '新增通话状态配置的“通话状态”下拉项共用', count: 8, importable: false },
  { code: 'ABNORMAL_REASON', name: '异常原因', scope: '业务字典', description: '通话状态配置的“异常原因”下拉项共用', count: 21 },
  { code: 'INTENT_LEVEL', name: '意向级别', scope: '业务字典', description: '通话状态配置的“意向级别”下拉项共用', count: 7, importable: false },
  { code: 'INITIAL_LEAD_STATUS', name: '线索状态', scope: '业务字典', description: '初始线索状态、首次线索状态等字段共用', count: 8, importable: false }
];

const DICTIONARY_ITEMS = {
  BLACKLIST_REASON: [
    { code: 'FREQUENT_COMPLAINT', name: '频繁投诉打扰', order: 10, status: '启用', refs: 18, description: '客户明确投诉外呼频率或要求停止联系' },
    { code: 'STRONG_REJECTION', name: '主观强拒绝（要求停拨）', order: 20, status: '启用', refs: 9, description: '客户明确表达拒绝继续外呼' },
    { code: 'PURCHASED_CAR', name: '客观已购车/已下订', order: 30, status: '启用', refs: 7, description: '客户已购车或已下订，不再需要外呼' },
    { code: 'INVALID_PHONE', name: '空号停机异常', order: 40, status: '启用', refs: 5, description: '运营商或外呼结果返回空号、停机' },
    { code: 'OTHER_REASON', name: '其它原因', order: 99, status: '启用', refs: 2, description: '需同时填写详细原因' }
  ],
  BLACKLIST_DURATION: [
    { code: 'PERMANENT', name: '永久封禁', order: 10, status: '启用', refs: 22, description: '命中后永久停止外呼任务' },
    { code: 'DAYS_30', name: '临时封禁 - 30天', order: 20, status: '启用', refs: 12, description: '30 天后自动解除' },
    { code: 'DAYS_60', name: '临时封禁 - 60天', order: 30, status: '启用', refs: 8, description: '60 天后自动解除' },
    { code: 'DAYS_90', name: '临时封禁 - 90天', order: 40, status: '启用', refs: 6, description: '90 天后自动解除' },
    { code: 'DAYS_180', name: '临时封禁 - 180天', order: 50, status: '停用', refs: 1, description: '历史策略仍保留，新增时不可选择' }
  ],
  OUTBOUND_SYSTEM: [
    { code: 'YIZHI', name: '一知', order: 10, status: '启用', refs: 6, description: '一知外呼系统' },
    { code: 'BINGLAN', name: '冰兰', order: 20, status: '启用', refs: 4, description: '冰兰外呼系统' },
    { code: 'KDXF', name: '科大', order: 30, status: '启用', refs: 5, description: '科大讯飞外呼系统' }
  ],
  OUTBOUND_TYPE: [
    { code: 'KDXF_COLD', name: '科大讯飞-冷线索', outboundSystem: '科大', order: 10, status: '启用', refs: 6, description: '外部外呼系统映射值' },
    { code: 'KDXF_UNFILLED', name: '科大讯飞-留资未满', outboundSystem: '科大', order: 20, status: '启用', refs: 4, description: '外部外呼系统映射值' },
    { code: 'YIZHI_COLD', name: '一知-冷线索', outboundSystem: '一知', order: 30, status: '启用', refs: 3, description: '外部外呼系统映射值' },
    { code: 'YIZHI_COLD_LLM', name: '一知-冷线索（大模型）', outboundSystem: '一知', order: 40, status: '启用', refs: 2, description: '外部外呼系统映射值' },
    { code: 'BINGLAN_NEW', name: '冰兰-新线索', outboundSystem: '冰兰', order: 50, status: '启用', refs: 5, description: '外部外呼系统映射值' },
    { code: 'BINGLAN_EXISTING', name: '冰兰-保客', outboundSystem: '冰兰', order: 60, status: '启用', refs: 4, description: '外部外呼系统映射值' },
    { code: 'YIZHI_NEV_LLM', name: '一知-大模型NEV新线索', outboundSystem: '一知', order: 70, status: '启用', refs: 3, description: '外部外呼系统映射值' },
    { code: 'YIZHI_EXISTING', name: '一知-保客', outboundSystem: '一知', order: 80, status: '启用', refs: 2, description: '外部外呼系统映射值' }
  ],
  OUTBOUND_TAG: [
    { code: 'PURCHASE_INTENT', name: '有购车意向', order: 10, status: '启用', refs: 8, description: '线索下发配置包含标签' },
    { code: 'VISIT_AGREED', name: '同意到店', order: 20, status: '启用', refs: 8, description: '线索下发配置包含标签' },
    { code: 'PROMOTION', name: '优惠活动', order: 30, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'FINANCE_POLICY', name: '金融政策', order: 40, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'TRADE_IN_POLICY', name: '置换政策', order: 50, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'FIRST_BUY', name: '首购', order: 60, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'REPLACE_BUY', name: '换购', order: 70, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'ADDITIONAL_BUY', name: '增购', order: 80, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'CASH', name: '全款', order: 90, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'LOAN', name: '贷款', order: 100, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'PRICE', name: '价格', order: 110, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'DELIVERY_TIME', name: '交付时间', order: 120, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'ENERGY', name: '能耗', order: 130, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'THREE_ELECTRIC', name: '三电', order: 140, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'ADVISOR_AGREED', name: '同意顾问联系', order: 150, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'COLOR', name: '颜色', order: 160, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'WECHAT_AGREED', name: '同意添加企微', order: 170, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'PURCHASED', name: '已购车', order: 180, status: '启用', refs: 8, description: '线索下发配置包含标签' },
    { code: 'VISITED', name: '已到店', order: 190, status: '启用', refs: 8, description: '线索下发配置包含标签' },
    { code: 'ORDERED', name: '已下订', order: 200, status: '启用', refs: 8, description: '线索下发配置包含标签' },
    { code: 'DND_ANNOYED', name: '拒绝打扰\\厌烦', order: 210, status: '启用', refs: 8, description: '线索下发配置包含标签' },
    { code: 'VOICEMAIL', name: '语音信箱', order: 220, status: '启用', refs: 6, description: '线索下发配置包含标签' },
    { code: 'ELDERLY', name: '老年人', order: 230, status: '启用', refs: 6, description: '线索下发配置包含标签' },
    { code: 'QUICK_HANGUP', name: '接通秒挂', order: 240, status: '启用', refs: 2, description: '线索下发配置包含标签' },
    { code: 'NO_TAG', name: '接通无标签', order: 250, status: '启用', refs: 2, description: '线索下发配置包含标签' },
    { code: 'CONTACT_LATER', name: '下次联系', order: 260, status: '启用', refs: 2, description: '线索下发配置包含标签' },
    { code: 'NO_PURCHASE_INTENT', name: '无购车意向', order: 270, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'NO_VISIT', name: '不同意到店', order: 280, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'NO_WECHAT', name: '不同意添加企微', order: 290, status: '启用', refs: 4, description: '线索下发配置包含标签' },
    { code: 'NO_ADVISOR', name: '不同意顾问联系', order: 300, status: '启用', refs: 4, description: '线索下发配置包含标签' }
  ],
  CROWD_PACKAGE_TAG: [
    { code: 'N6_HIGH_INTENT_GZ', name: 'N6高意向-广州', order: 10, status: '启用', refs: 1, description: '留资未满人群包标签' },
    { code: 'SYLPHY_PRIVATE_DOMAIN', name: '轩逸私域唤醒', order: 20, status: '启用', refs: 1, description: '留资未满人群包标签' },
    { code: 'LIVE_STREAM_COMPLETION', name: '直播留资补全', order: 30, status: '启用', refs: 1, description: '留资未满人群包标签' },
    { code: 'X_TRAIL_TEST_DRIVE', name: '奇骏试驾召回', order: 40, status: '启用', refs: 1, description: '留资未满人群包标签' },
    { code: 'DUPLICATE_LEAD', name: '重复留资识别', order: 50, status: '启用', refs: 1, description: '留资未满人群包标签' },
    { code: 'TEANA_STORE_VISIT', name: '天籁到店邀约', order: 60, status: '启用', refs: 1, description: '留资未满人群包标签' },
    { code: 'QASHQAI_REPLACEMENT', name: '逍客置换意向', order: 70, status: '启用', refs: 1, description: '留资未满人群包标签' },
    { code: 'TIIDA_FIRST_BUY', name: '骐达首购意向', order: 80, status: '启用', refs: 0, description: '留资未满人群包标签' },
    { code: 'KICKS_RENEWAL', name: '劲客焕新意向', order: 90, status: '启用', refs: 0, description: '留资未满人群包标签' },
    { code: 'PATHFINDER_FAMILY', name: '探陆家庭出行', order: 100, status: '启用', refs: 0, description: '留资未满人群包标签' }
  ],
  CONTACT_STATUS: [
    { code: 'CONNECTED', name: '正常接通', order: 10, status: '启用', refs: 4, description: '未接通激活配置接触状态' },
    { code: 'NO_ANSWER', name: '无人接听', order: 20, status: '启用', refs: 8, description: '未接通激活配置接触状态' },
    { code: 'WECHAT_FOLLOW_UP', name: '企微跟进', order: 30, status: '启用', refs: 2, description: '未接通激活配置接触状态' },
    { code: 'CUSTOMER_REJECTED', name: '客户拒绝', order: 40, status: '启用', refs: 2, description: '未接通激活配置接触状态' },
    { code: 'BUSY_SECRETARY', name: '忙音/秘书台', order: 50, status: '启用', refs: 1, description: '未接通激活配置接触状态' },
    { code: 'EMPTY_NUMBER', name: '空号', order: 60, status: '启用', refs: 1, description: '未接通激活配置接触状态' },
    { code: 'SUSPENDED', name: '停机', order: 70, status: '启用', refs: 1, description: '未接通激活配置接触状态' },
    { code: 'POWERED_OFF', name: '关机', order: 80, status: '启用', refs: 1, description: '未接通激活配置接触状态' }
  ],
  RETURN_VISIT_RESULT: [
    { code: 'NEXT_FOLLOW_UP', name: '下次回访', order: 10, status: '启用', refs: 6, description: '总部冷线索配置回访结果' },
    { code: 'TEST_DRIVE_SCHEDULE', name: '试驾排程下发', order: 20, status: '启用', refs: 3, description: '总部冷线索配置回访结果' },
    { code: 'TEST_DRIVE_LEAD', name: '试驾线索下发', order: 30, status: '启用', refs: 3, description: '总部冷线索配置回访结果' },
    { code: 'INTENT_LEAD', name: '意向线索下发', order: 40, status: '启用', refs: 4, description: '总部冷线索配置回访结果' },
    { code: 'NO_ANSWER_DISPATCH', name: '无人接听下发', order: 50, status: '启用', refs: 2, description: '总部冷线索配置回访结果' },
    { code: 'DORMANT_UNREACHABLE', name: '休眠失联', order: 60, status: '启用', refs: 5, description: '总部冷线索配置回访结果' },
    { code: 'DORMANT_NOT_PURCHASED', name: '休眠未购', order: 70, status: '启用', refs: 5, description: '总部冷线索配置回访结果' },
    { code: 'INVALID_CLOSED', name: '无效结案', order: 80, status: '启用', refs: 2, description: '总部冷线索配置回访结果' },
    { code: 'LOST', name: '战败', order: 90, status: '启用', refs: 2, description: '总部冷线索配置回访结果' }
  ],
  INTENT_SERIES: [
    { code: 'N6', name: 'N6', order: 10, status: '启用', refs: 5, description: '未接通激活配置回访车系' },
    { code: 'SYLPHY', name: '轩逸', order: 20, status: '启用', refs: 3, description: '未接通激活配置回访车系' },
    { code: 'TEANA', name: '天籁', order: 30, status: '启用', refs: 2, description: '未接通激活配置回访车系' },
    { code: 'QASHQAI', name: '逍客', order: 40, status: '启用', refs: 2, description: '未接通激活配置回访车系' },
    { code: 'X_TRAIL', name: '奇骏', order: 50, status: '启用', refs: 2, description: '未接通激活配置回访车系' },
    { code: 'ARIYA', name: 'ARIYA', order: 60, status: '启用', refs: 1, description: '未接通激活配置回访车系' },
    { code: 'PATHFINDER', name: '探陆', order: 70, status: '启用', refs: 1, description: '未接通激活配置回访车系' },
    { code: 'OTHER_SERIES', name: '其他车系', order: 80, status: '启用', refs: 0, description: '未接通激活配置回访车系' }
  ],
  PRECALL_SKILL_GROUP: [
    { code: 'SKILL_GROUP_A', name: '技能组A', order: 10, status: '启用', refs: 4, description: '推送预外呼配置工作时段技能组' },
    { code: 'SKILL_GROUP_B', name: '技能组B', order: 20, status: '启用', refs: 3, description: '推送预外呼配置工作时段技能组' },
    { code: 'SKILL_GROUP_C', name: '技能组C', order: 30, status: '启用', refs: 2, description: '推送预外呼配置工作时段技能组' }
  ],
  PRECALL_CALL_STATUS: [
    { code: 'EMPTY_NUMBER', name: '空号', order: 10, status: '启用', refs: 2, description: '回访工单配置预外呼通话状态' },
    { code: 'SUSPENDED', name: '停机', order: 20, status: '启用', refs: 1, description: '回访工单配置预外呼通话状态' },
    { code: 'BUSY', name: '忙音', order: 30, status: '启用', refs: 1, description: '回访工单配置预外呼通话状态' },
    { code: 'OUT_OF_SERVICE', name: '不在服务区', order: 40, status: '启用', refs: 0, description: '回访工单配置预外呼通话状态' },
    { code: 'NO_ANSWER', name: '无人接听', order: 50, status: '启用', refs: 5, description: '回访工单配置预外呼通话状态' },
    { code: 'POWERED_OFF', name: '关机', order: 60, status: '启用', refs: 1, description: '回访工单配置预外呼通话状态' },
    { code: 'AGENT_NO_ANSWER', name: '坐席未接', order: 70, status: '启用', refs: 0, description: '回访工单配置预外呼通话状态' },
    { code: 'LINE_REJECTED', name: '线路拒呼', order: 80, status: '启用', refs: 0, description: '回访工单配置预外呼通话状态' },
    { code: 'LINE_NOT_CALLED', name: '线路未呼', order: 90, status: '启用', refs: 0, description: '回访工单配置预外呼通话状态' }
  ],
  CALL_STATUS: [
    { code: 'NO_ANSWER', name: '2-无人接听', order: 10, status: '启用', refs: 14, description: '话单回传通话状态' },
    { code: 'BUSY', name: '3-占线', order: 20, status: '启用', refs: 9, description: '话单回传通话状态' },
    { code: 'REJECTED', name: '4-拒接', order: 30, status: '启用', refs: 11, description: '话单回传通话状态' },
    { code: 'EMPTY_NUMBER', name: '5-空号', order: 40, status: '启用', refs: 6, description: '话单回传通话状态' },
    { code: 'POWERED_OFF', name: '6-关机', order: 50, status: '启用', refs: 8, description: '话单回传通话状态' },
    { code: 'SUSPENDED', name: '7-停机', order: 60, status: '启用', refs: 5, description: '话单回传通话状态' },
    { code: 'ARREARS', name: '8-欠费', order: 70, status: '启用', refs: 3, description: '话单回传通话状态' },
    { code: 'UNREACHABLE', name: '9-无法接通', order: 80, status: '启用', refs: 12, description: '话单回传通话状态' }
  ],
  ABNORMAL_REASON: [
    { code: 'NO_FUNDS', name: '资金不足', order: 10, status: '启用', refs: 3, description: '默认适用于可编辑的线索状态' },
    { code: 'NO_PURCHASE_SIX_MONTHS', name: '半年内不购车', order: 20, status: '启用', refs: 2, description: '默认适用于可编辑的线索状态' },
    { code: 'FAMILY_DISAGREES', name: '家人不同意', order: 30, status: '启用', refs: 1, description: '默认适用于可编辑的线索状态' },
    { code: 'CREDIT_REJECTED', name: '征信不通过', order: 40, status: '启用', refs: 1, description: '默认适用于可编辑的线索状态' },
    { code: 'NO_LICENSE', name: '驾照没考到', order: 50, status: '启用', refs: 0, description: '默认适用于可编辑的线索状态' },
    { code: 'COMPETITOR', name: '关注竞品车型', order: 60, status: '启用', refs: 2, description: '默认适用于可编辑的线索状态' },
    { code: 'UNREACHABLE_3D', name: '三天四次无法接通', order: 70, status: '启用', refs: 5, description: '默认适用于可编辑的线索状态' },
    { code: 'DO_NOT_CONTACT', name: '用户要求不联系', order: 80, status: '启用', refs: 4, description: '默认适用于可编辑的线索状态' },
    { code: 'BLACKLISTED', name: '被拉黑', order: 90, status: '启用', refs: 3, description: '默认适用于可编辑的线索状态' },
    { code: 'LONG_WAIT', name: '等待期长', order: 100, status: '启用', refs: 1, description: '默认适用于可编辑的线索状态' },
    { code: 'PRICE', name: '价格因素', order: 110, status: '启用', refs: 2, description: '默认适用于可编辑的线索状态' },
    { code: 'BRAND', name: '品牌偏好', order: 120, status: '启用', refs: 1, description: '默认适用于可编辑的线索状态' },
    { code: 'FINANCE', name: '金融方案', order: 130, status: '启用', refs: 1, description: '默认适用于可编辑的线索状态' },
    { code: 'PRODUCT', name: '产品设计和配置', order: 140, status: '启用', refs: 1, description: '默认适用于可编辑的线索状态' },
    { code: 'SERVICE', name: '服务不满', order: 150, status: '启用', refs: 1, description: '默认适用于可编辑的线索状态' },
    { code: 'EMPTY_NUMBER', name: '明确空号', order: 160, status: '启用', refs: 2, description: '默认适用于可编辑的线索状态' },
    { code: 'WRONG_NUMBER', name: '错号', order: 170, status: '启用', refs: 0, description: '默认适用于可编辑的线索状态' },
    { code: 'PHONE_SUSPENDED', name: '停机', order: 180, status: '启用', refs: 1, description: '默认适用于可编辑的线索状态' },
    { code: 'OTHER_DORMANT_NOT_PURCHASED', name: '其他', order: 190, status: '启用', refs: 2, description: '适用于总部_休眠未购' },
    { code: 'OTHER_DORMANT_UNREACHABLE', name: '其他', order: 200, status: '启用', refs: 2, description: '适用于总部_休眠失联' },
    { code: 'OTHER_LOST', name: '其他', order: 210, status: '启用', refs: 2, description: '适用于总部_战败' }
  ],
  INTENT_LEVEL: [
    { code: 'H', name: 'H - H(高意向)', order: 10, status: '启用', refs: 6, description: '高意向线索可选' },
    { code: 'A', name: 'A - A(一周内买车)', order: 20, status: '启用', refs: 8, description: '高意向线索可选' },
    { code: 'B', name: 'B - B(计划三个月内买车)', order: 30, status: '启用', refs: 12, description: '高意向线索可选' },
    { code: 'C', name: 'C - C(计划三个月后买车)', order: 40, status: '启用', refs: 8, description: '高意向线索可选' },
    { code: 'F', name: 'F - F(战败)', order: 50, status: '启用', refs: 5, description: '线索状态为战败时系统自动写入' },
    { code: 'L', name: 'L - L(休眠)', order: 60, status: '启用', refs: 9, description: '线索状态为休眠时系统自动写入' },
    { code: 'N', name: 'N - N(阶段性战败)', order: 70, status: '启用', refs: 4, description: '阶段性战败时系统自动写入' }
  ],
  INITIAL_LEAD_STATUS: [
    { code: 'HQ_HIGH_INTENT', name: '总部_高意向', order: 10, status: '启用', refs: 14, description: '总部高意向线索状态' },
    { code: 'HQ_DORMANT_NOT_PURCHASED', name: '总部_休眠未购', order: 20, status: '启用', refs: 9, description: '休眠未购线索状态' },
    { code: 'HQ_DORMANT_UNREACHABLE', name: '总部_休眠失联', order: 30, status: '启用', refs: 8, description: '休眠失联线索状态' },
    { code: 'HQ_LOST', name: '总部_战败', order: 40, status: '启用', refs: 6, description: '战败线索状态' },
    { code: 'HQ_TEMP_LOST', name: '总部_暂败', order: 50, status: '启用', refs: 2, description: '暂败线索状态' },
    { code: 'HQ_STAGE_LOST', name: '总部_阶段性战败', order: 60, status: '启用', refs: 5, description: '阶段性战败线索状态' },
    { code: 'HQ_INVALID', name: '总部_无效', order: 70, status: '启用', refs: 4, description: '无效线索状态' },
    { code: 'HQ_REMOTE', name: '总部_异地', order: 80, status: '启用', refs: 1, description: '异地线索状态' }
  ]
};

function syncDictionaryBackedConfiguratorOptions() {
  if (typeof configuratorOptions !== 'undefined') {
    configuratorOptions.returnVisitOrderContactStatus = (DICTIONARY_ITEMS.PRECALL_CALL_STATUS || [])
      .filter(item => item.status === '启用')
      .sort((a, b) => a.order - b.order)
      .map(item => item.name);
  }
  if (typeof resourceUnfilledCrowdPackageTagFieldValues !== 'undefined') {
    const enabledCrowdTags = (DICTIONARY_ITEMS.CROWD_PACKAGE_TAG || [])
      .filter(item => item.status === '启用')
      .sort((a, b) => a.order - b.order)
      .map(item => item.name);
    resourceUnfilledCrowdPackageTagFieldValues.splice(0, resourceUnfilledCrowdPackageTagFieldValues.length, ...enabledCrowdTags);
  }
}

syncDictionaryBackedConfiguratorOptions();

const ABNORMAL_REASON_LEAD_STATUS_MAP = {
  NO_FUNDS: ['总部_休眠未购'], NO_PURCHASE_SIX_MONTHS: ['总部_休眠未购'], FAMILY_DISAGREES: ['总部_休眠未购'], CREDIT_REJECTED: ['总部_休眠未购'], NO_LICENSE: ['总部_休眠未购'], COMPETITOR: ['总部_休眠未购'],
  UNREACHABLE_3D: ['总部_休眠失联'], DO_NOT_CONTACT: ['总部_休眠失联'], BLACKLISTED: ['总部_休眠失联'],
  LONG_WAIT: ['总部_战败'], PRICE: ['总部_战败'], BRAND: ['总部_战败'], FINANCE: ['总部_战败'], PRODUCT: ['总部_战败'], SERVICE: ['总部_战败'],
  EMPTY_NUMBER: ['总部_无效'], WRONG_NUMBER: ['总部_无效'], PHONE_SUSPENDED: ['总部_无效'],
  OTHER_DORMANT_NOT_PURCHASED: ['总部_休眠未购'], OTHER_DORMANT_UNREACHABLE: ['总部_休眠失联'], OTHER_LOST: ['总部_战败']
};

function getAbnormalReasonApplicableLeadStatuses(item) {
  return item?.applicableLeadStatuses || ABNORMAL_REASON_LEAD_STATUS_MAP[item?.code] || [];
}

function getOutboundTypeOutboundSystem(item) {
  return item?.outboundSystem || '';
}

let selectedDictionaryCode = 'BLACKLIST_REASON';
let dictionaryKeyword = '';
let dictionaryStatusFilter = '';
let dictionaryImportState = { step: 1, fileName: '', mode: 'create', rows: [], validatedRows: [], result: { created: 0, updated: 0, failed: 0 } };

function dictionaryEscape(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function getSelectedDictionaryType() {
  return DICTIONARY_TYPES.find(item => item.code === selectedDictionaryCode) || DICTIONARY_TYPES[0];
}

function renderDictionaryManager() {
  const container = document.getElementById('dictionaryManager');
  if (!container) return;
  const type = getSelectedDictionaryType();
  const allItems = DICTIONARY_ITEMS[type.code] || [];
  const items = allItems.filter(item => {
    const haystack = `${item.code} ${item.name} ${item.description}`.toLowerCase();
    return (!dictionaryKeyword || haystack.includes(dictionaryKeyword.toLowerCase())) && (!dictionaryStatusFilter || item.status === dictionaryStatusFilter);
  });
  const isAbnormalReasonDictionary = type.code === 'ABNORMAL_REASON';
  const isOutboundTypeDictionary = type.code === 'OUTBOUND_TYPE';
  const relationHeader = isAbnormalReasonDictionary ? '<th>适用线索状态</th>' : (isOutboundTypeDictionary ? '<th>所属外呼系统</th>' : '');
  const relationCell = item => {
    if (isAbnormalReasonDictionary) return `<td class="dictionary-relation">${getAbnormalReasonApplicableLeadStatuses(item).map(status => `<span>${dictionaryEscape(status)}</span>`).join('') || '<span class="dictionary-empty">未配置</span>'}</td>`;
    if (isOutboundTypeDictionary) return `<td><span class="dictionary-system-tag">${dictionaryEscape(getOutboundTypeOutboundSystem(item) || '未配置')}</span></td>`;
    return '';
  };
  container.innerHTML = `
    <div class="dictionary-hero">
      <div><div class="settings-section-title" style="margin:0">数据字典管理</div><div class="dictionary-hero-desc">统一维护可配置业务枚举。编码创建后不可修改；已被业务数据引用的字典项仅支持停用或替换。</div></div>
      <div class="dictionary-hero-badges"><span>共 ${DICTIONARY_TYPES.length} 个字典</span><span>${DICTIONARY_TYPES.reduce((sum, item) => sum + item.count, 0)} 个字典项</span></div>
    </div>
    <div class="dictionary-layout">
      <aside class="dictionary-type-panel">
        <div class="dictionary-side-title">字典分类</div>
        ${DICTIONARY_TYPES.map(item => `<button type="button" class="dictionary-type-item ${item.code === type.code ? 'active' : ''}" data-ui-action="dictionary-select-type" data-dictionary-code="${item.code}"><span><b>${dictionaryEscape(item.name)}</b><small>${dictionaryEscape(item.scope)} · ${item.count} 项</small></span><span class="dictionary-chevron">›</span></button>`).join('')}
      </aside>
      <section class="dictionary-content-panel">
        <div class="dictionary-title-row"><div><div class="dictionary-title">${dictionaryEscape(type.name)}</div><div class="dictionary-subtitle">${dictionaryEscape(type.description)}</div></div><div class="dictionary-title-actions">${type.importable === false ? '' : '<button class="btn-secondary" type="button" data-ui-action="dictionary-import-open">导入数据</button><button class="btn-secondary" type="button" data-ui-action="dictionary-export-items">导出数据</button>'}<button class="btn-add" type="button" onclick="openDictionaryItemModal()">新增数据</button></div></div>
        ${renderPolicyRuleNote('dictionaryRuleNote', '停用后，历史数据仍保留原值；新增或编辑业务数据时不可再选择该字典项。', { style: 'margin-top:16px' })}
        <div class="dictionary-filter-row unified-filter-query" id="dictionaryFilterQuery"><input class="form-input" value="${dictionaryEscape(dictionaryKeyword)}" placeholder="搜索编码、名称或说明" data-ui-action="dictionary-filter-keyword" /><select class="filter-select" data-ui-action="dictionary-filter-status"><option value="">全部状态</option><option value="启用" ${dictionaryStatusFilter === '启用' ? 'selected' : ''}>启用</option><option value="停用" ${dictionaryStatusFilter === '停用' ? 'selected' : ''}>停用</option></select><button class="btn-secondary" type="button" data-ui-action="dictionary-filter-reset">重置</button></div>
        <div class="dictionary-table-wrap"><table class="dictionary-table"><thead><tr><th>字典项编码</th><th>显示名称</th><th>说明</th>${relationHeader}<th>排序</th><th>引用情况</th><th>状态</th><th>操作</th></tr></thead><tbody>${items.length ? items.map(item => `<tr><td><code>${dictionaryEscape(item.code)}</code></td><td><strong>${dictionaryEscape(item.name)}</strong></td><td class="dictionary-desc">${dictionaryEscape(item.description)}</td>${relationCell(item)}<td>${item.order}</td><td>${item.refs ? `<span class="dictionary-ref">被 ${item.refs} 处引用</span>` : '<span class="dictionary-empty">未被引用</span>'}</td><td><span class="dictionary-status ${item.status === '启用' ? 'on' : 'off'}">● ${item.status}</span></td><td><div class="action-btns"><button class="action-btn edit" type="button" onclick="openDictionaryItemModal('${item.code}')">编辑</button><button class="action-btn ${item.status === '启用' ? 'delete' : 'view'}" type="button" onclick="toggleDictionaryItem('${item.code}')">${item.status === '启用' ? '停用' : '启用'}</button><button class="action-btn delete" type="button" onclick="deleteDictionaryItem('${item.code}')">删除</button></div></td></tr>`).join('') : `<tr><td colspan="${(isAbnormalReasonDictionary || isOutboundTypeDictionary) ? 8 : 7}"><div class="empty-state">暂无匹配的字典项</div></td></tr>`}</tbody></table></div>
      </section>
    </div>`;
  schedulePolicyRuleNoteAutoHide('dictionaryRuleNote');
  mountFilterQueryPanel('dictionaryFilterQuery');
}

function selectDictionaryType(code) { selectedDictionaryCode = code; dictionaryKeyword = ''; dictionaryStatusFilter = ''; renderDictionaryManager(); }
function filterDictionaryItems(value) { dictionaryKeyword = value; renderDictionaryManager(); }
function filterDictionaryStatus(value) { dictionaryStatusFilter = value; renderDictionaryManager(); }
function resetDictionaryFilters() { dictionaryKeyword = ''; dictionaryStatusFilter = ''; renderDictionaryManager(); }

registerUiAction('dictionary-select-type', target => selectDictionaryType(target.dataset.dictionaryCode));
registerUiAction('dictionary-filter-keyword', target => filterDictionaryItems(target.value));
registerUiAction('dictionary-filter-status', target => filterDictionaryStatus(target.value));
registerUiAction('dictionary-filter-reset', resetDictionaryFilters);

function getDictionaryItem(code) { return (DICTIONARY_ITEMS[selectedDictionaryCode] || []).find(item => item.code === code); }

function openDictionaryItemModal(code = '') {
  const item = code ? getDictionaryItem(code) : null;
  const type = getSelectedDictionaryType();
  const isAbnormalReasonDictionary = type.code === 'ABNORMAL_REASON';
  const isOutboundTypeDictionary = type.code === 'OUTBOUND_TYPE';
  const selectedLeadStatuses = getAbnormalReasonApplicableLeadStatuses(item);
  const leadStatusItems = (DICTIONARY_ITEMS.INITIAL_LEAD_STATUS || []).filter(status => status.status === '启用').sort((a, b) => a.order - b.order);
  const outboundSystems = (DICTIONARY_ITEMS.OUTBOUND_SYSTEM || []).filter(system => system.status === '启用').sort((a, b) => a.order - b.order);
  const relationField = isAbnormalReasonDictionary ? `<div class="form-group"><div class="form-label">适用线索状态 <span class="required">*</span></div><select class="form-input" id="dictionaryItemApplicableLeadStatus"><option value="">请选择</option>${leadStatusItems.map(status => `<option value="${dictionaryEscape(status.name)}" ${selectedLeadStatuses.includes(status.name) ? 'selected' : ''}>${dictionaryEscape(status.name)}</option>`).join('')}</select><div class="form-hint">单选。新增通话状态配置选择线索状态后，仅展示与该状态关联的异常原因。</div></div>` : '';
  const outboundSystemField = isOutboundTypeDictionary ? `<div class="form-group"><div class="form-label">所属外呼系统 <span class="required">*</span></div><select class="form-input" id="dictionaryItemOutboundSystem"><option value="">请选择</option>${outboundSystems.map(system => `<option value="${dictionaryEscape(system.name)}" ${getOutboundTypeOutboundSystem(item) === system.name ? 'selected' : ''}>${dictionaryEscape(system.name)}</option>`).join('')}</select><div class="form-hint">单选。外呼类型将归属到所选外呼系统，用于后续联动筛选。</div></div>` : '';
  let modal = document.getElementById('dictionaryItemModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'dictionaryItemModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `<div class="modal dictionary-item-modal"><div class="modal-header"><div class="modal-title">${item ? '编辑字典项' : '新增字典项'}</div><button class="modal-close" type="button" onclick="closeDictionaryItemModal()">×</button></div><div class="modal-body"><div class="dictionary-modal-type">所属字典：<b>${dictionaryEscape(type.name)}</b><span>${dictionaryEscape(type.scope)}</span></div><div class="form-group"><div class="form-label">字典项编码 <span class="required">*</span></div><input class="form-input" id="dictionaryItemCode" value="${dictionaryEscape(item?.code || '')}" placeholder="例：FREQUENT_COMPLAINT" ${item ? 'disabled' : ''}><div class="form-hint">编码保存后不可修改，用于系统和历史数据识别。</div></div><div class="form-group"><div class="form-label">显示名称 <span class="required">*</span></div><input class="form-input" id="dictionaryItemName" value="${dictionaryEscape(item?.name || '')}" placeholder="请输入显示名称"></div>${relationField}${outboundSystemField}<div class="form-group"><div class="form-label">排序</div><input class="form-input" id="dictionaryItemOrder" type="number" min="1" value="${item?.order || 99}"><div class="form-hint">数字越小，页面下拉列表中越靠前。</div></div><div class="form-group"><div class="form-label">说明</div><textarea class="form-textarea" id="dictionaryItemDesc" placeholder="请输入使用说明">${dictionaryEscape(item?.description || '')}</textarea></div>${item?.refs ? `<div class="dictionary-reference-warning">该字典项已被 ${item.refs} 处业务数据或规则引用。可修改名称、排序或停用；如需移除，请先替换引用关系。</div>` : ''}</div><div class="modal-footer"><button class="btn-secondary" type="button" onclick="closeDictionaryItemModal()">取消</button><button class="btn-primary" type="button" onclick="saveDictionaryItem('${code}')">保存</button></div></div>`;
  modal.classList.add('show');
}

function closeDictionaryItemModal() { document.getElementById('dictionaryItemModal')?.classList.remove('show'); }

function saveDictionaryItem(existingCode = '') {
  const code = document.getElementById('dictionaryItemCode')?.value.trim().toUpperCase();
  const name = document.getElementById('dictionaryItemName')?.value.trim();
  const order = Number(document.getElementById('dictionaryItemOrder')?.value) || 99;
  const description = document.getElementById('dictionaryItemDesc')?.value.trim() || '—';
  const applicableLeadStatuses = selectedDictionaryCode === 'ABNORMAL_REASON'
    ? [document.getElementById('dictionaryItemApplicableLeadStatus')?.value || ''].filter(Boolean)
    : [];
  const outboundSystem = selectedDictionaryCode === 'OUTBOUND_TYPE'
    ? document.getElementById('dictionaryItemOutboundSystem')?.value || ''
    : '';
  if (!code || !/^[A-Z][A-Z0-9_]*$/.test(code)) { showToast('请输入由大写字母、数字或下划线组成的字典项编码', false); return; }
  if (!name) { showToast('请输入显示名称', false); return; }
  if (selectedDictionaryCode === 'ABNORMAL_REASON' && !applicableLeadStatuses.length) { showToast('请至少选择一个适用线索状态', false); return; }
  if (selectedDictionaryCode === 'OUTBOUND_TYPE' && !outboundSystem) { showToast('请选择所属外呼系统', false); return; }
  const items = DICTIONARY_ITEMS[selectedDictionaryCode] || (DICTIONARY_ITEMS[selectedDictionaryCode] = []);
  if (existingCode) {
    const item = getDictionaryItem(existingCode);
    if (!item) return;
    Object.assign(item, { name, order, description, ...(selectedDictionaryCode === 'ABNORMAL_REASON' ? { applicableLeadStatuses } : {}), ...(selectedDictionaryCode === 'OUTBOUND_TYPE' ? { outboundSystem } : {}) });
    showToast('字典项已保存', true);
  } else {
    if (items.some(item => item.code === code)) { showToast('字典项编码已存在', false); return; }
    items.push({ code, name, order, description, status: '启用', refs: 0, ...(selectedDictionaryCode === 'ABNORMAL_REASON' ? { applicableLeadStatuses } : {}), ...(selectedDictionaryCode === 'OUTBOUND_TYPE' ? { outboundSystem } : {}) });
    const type = DICTIONARY_TYPES.find(item => item.code === selectedDictionaryCode);
    if (type) type.count = items.length;
    showToast('字典项已新增', true);
  }
  items.sort((a, b) => a.order - b.order);
  syncDictionaryBackedConfiguratorOptions();
  closeDictionaryItemModal();
  renderDictionaryManager();
}

function toggleDictionaryItem(code) {
  const item = getDictionaryItem(code);
  if (!item) return;
  const nextStatus = item.status === '启用' ? '停用' : '启用';
  if (!confirm(`确认${nextStatus}字典项「${item.name}」？${nextStatus === '停用' ? '停用后仅影响新增和编辑，不影响历史数据。' : ''}`)) return;
  item.status = nextStatus;
  syncDictionaryBackedConfiguratorOptions();
  showToast(`字典项已${nextStatus}`, true);
  renderDictionaryManager();
}

function deleteDictionaryItem(code) {
  const item = getDictionaryItem(code);
  if (!item) return;
  if (item.refs) { showToast(`该字典项已被 ${item.refs} 处业务数据或规则引用，请使用停用或替换方式处理`, false); return; }
  if (!confirm(`确认删除未被引用的字典项「${item.name}」？`)) return;
  DICTIONARY_ITEMS[selectedDictionaryCode] = DICTIONARY_ITEMS[selectedDictionaryCode].filter(row => row.code !== code);
  const type = DICTIONARY_TYPES.find(row => row.code === selectedDictionaryCode);
  if (type) type.count = DICTIONARY_ITEMS[selectedDictionaryCode].length;
  syncDictionaryBackedConfiguratorOptions();
  showToast('字典项已删除', true);
  renderDictionaryManager();
}

function getDictionaryRelationLabel(typeCode = selectedDictionaryCode) {
  if (typeCode === 'ABNORMAL_REASON') return '适用线索状态';
  if (typeCode === 'OUTBOUND_TYPE') return '所属外呼系统';
  return '';
}

function getDictionaryItemRelationValue(item, typeCode = selectedDictionaryCode) {
  if (typeCode === 'ABNORMAL_REASON') return getAbnormalReasonApplicableLeadStatuses(item).join('、');
  if (typeCode === 'OUTBOUND_TYPE') return getOutboundTypeOutboundSystem(item);
  return '';
}

function getDictionaryImportColumns(typeCode = selectedDictionaryCode) {
  const relationLabel = getDictionaryRelationLabel(typeCode);
  return ['字典项编码', '显示名称', '排序', '状态', '说明', ...(relationLabel ? ['关联对象'] : [])];
}

function exportDictionaryItems() {
  const type = getSelectedDictionaryType();
  const relationLabel = getDictionaryRelationLabel(type.code);
  const columns = ['字典项编码', '显示名称', '排序', '状态', '说明', ...(relationLabel ? [relationLabel] : []), '引用次数'];
  const rows = (DICTIONARY_ITEMS[type.code] || []).sort((a, b) => a.order - b.order).map(item => [item.code, item.name, item.order, item.status, item.description || '', ...(relationLabel ? [getDictionaryItemRelationValue(item, type.code)] : []), item.refs || 0]);
  downloadExcelWorkbookFile(`${type.name}字典数据.xlsx`, [{ name: type.name, columns, rows }], `${type.name}字典数据已导出`);
}

registerUiAction('dictionary-export-items', exportDictionaryItems);

function openDictionaryImportWizard() {
  const type = getSelectedDictionaryType();
  if (type.importable === false) { showToast('该系统级字典不支持批量导入，请通过接口同步或单项维护', false); return; }
  dictionaryImportState = { step: 1, fileName: '', mode: 'create', rows: [], validatedRows: [], result: { created: 0, updated: 0, failed: 0 } };
  let modal = document.getElementById('dictionaryImportModal');
  if (!modal) { modal = document.createElement('div'); modal.id = 'dictionaryImportModal'; modal.className = 'modal-overlay'; document.body.appendChild(modal); }
  modal.innerHTML = `<div class="modal assignment-import-modal"><div class="modal-header"><div class="modal-title" id="dictionaryImportTitle">导入${dictionaryEscape(type.name)}</div><button class="modal-close" type="button" onclick="closeDictionaryImportWizard()">✕</button></div><div class="modal-body" id="dictionaryImportBody"></div><div class="modal-footer" id="dictionaryImportFooter"></div></div>`;
  modal.classList.add('show');
  renderDictionaryImportWizard();
}

registerUiAction('dictionary-import-open', openDictionaryImportWizard);

function closeDictionaryImportWizard() { document.getElementById('dictionaryImportModal')?.classList.remove('show'); }

function renderDictionaryImportWizard() {
  const body = document.getElementById('dictionaryImportBody');
  const footer = document.getElementById('dictionaryImportFooter');
  if (!body || !footer) return;
  body.innerHTML = `${renderDictionaryImportSteps()}${dictionaryImportState.step === 1 ? renderDictionaryImportUpload() : ''}${dictionaryImportState.step === 2 ? renderDictionaryImportPreview() : ''}${dictionaryImportState.step === 3 ? renderDictionaryImportComplete() : ''}`;
  footer.innerHTML = renderDictionaryImportFooter();
}

function renderDictionaryImportSteps() {
  return `<div class="assignment-import-steps">${[['Step1', '上传文件'], ['Step2', '数据预览'], ['Step3', '导入完成']].map((item, index) => { const no = index + 1; return `<div class="assignment-import-step ${no === dictionaryImportState.step ? 'active' : no < dictionaryImportState.step ? 'done' : ''}"><div class="assignment-import-step-index">${item[0]}</div><div class="assignment-import-step-title">${item[1]}</div></div>`; }).join('')}</div>`;
}

function renderDictionaryImportUpload() {
  const type = getSelectedDictionaryType();
  const relationLabel = getDictionaryRelationLabel();
  return `<div class="assignment-import-panel"><div class="assignment-import-tip">Step1 操作说明：下载模板了解格式要求 → 按模板填写 → 上传Excel文件。导入将校验编码、状态和${relationLabel || '字典项'}合法性；不会删除现有数据。</div><div class="dictionary-import-mode"><span>导入方式：</span><label><input type="radio" name="dictionaryImportMode" value="create" ${dictionaryImportState.mode === 'create' ? 'checked' : ''} onchange="setDictionaryImportMode(this.value)"> 新增</label><label><input type="radio" name="dictionaryImportMode" value="upsert" ${dictionaryImportState.mode === 'upsert' ? 'checked' : ''} onchange="setDictionaryImportMode(this.value)"> 新增或更新</label></div><div class="action-btns" style="margin-bottom:12px;"><button class="btn-secondary" type="button" data-ui-action="dictionary-import-download-template">下载模板</button></div><label class="assignment-import-upload"><input id="dictionaryImportFile" type="file" accept=".xls,.xlsx,.xml,.csv,.tsv,.txt" onchange="handleDictionaryImportFile(this.files && this.files[0])"><div><strong>上传Excel文件</strong><span>支持模板导出的 .xls 文件，也兼容 CSV/TSV 文本文件</span></div></label><div class="assignment-import-file">${dictionaryImportState.fileName ? `已选择：${dictionaryEscape(dictionaryImportState.fileName)}` : ''}</div><div class="series-form-hint">当前字典组：${dictionaryEscape(type.name)}；字段：${getDictionaryImportColumns().join('、')}。</div></div>`;
}

function renderDictionaryImportPreview() {
  const columns = getDictionaryImportColumns();
  const rows = dictionaryImportState.validatedRows;
  const pass = rows.filter(row => row.valid).length;
  return `<div class="assignment-import-panel"><div class="assignment-import-summary"><div class="assignment-import-stat"><div class="assignment-import-stat-label">解析总数</div><div class="assignment-import-stat-value">${rows.length}</div></div><div class="assignment-import-stat"><div class="assignment-import-stat-label">校验通过</div><div class="assignment-import-stat-value">${pass}</div></div><div class="assignment-import-stat"><div class="assignment-import-stat-label">校验失败</div><div class="assignment-import-stat-value">${rows.length - pass}</div></div></div><div class="assignment-import-preview"><table class="data-table"><thead><tr><th style="width:64px">行号</th>${columns.map(column => `<th>${dictionaryEscape(column)}</th>`).join('')}<th style="width:180px">校验结果</th></tr></thead><tbody>${rows.map(row => `<tr><td>${row.rowNo}</td>${columns.map(column => `<td>${dictionaryEscape(row.data[column] || '—')}</td>`).join('')}<td>${row.valid ? `<span class="assignment-import-pass">${row.action === 'update' ? '更新' : '新增'}</span>` : `<div class="assignment-import-error">${row.errors.map(dictionaryEscape).join('<br>')}</div>`}</td></tr>`).join('') || `<tr><td colspan="${columns.length + 2}"><div class="empty-state">暂无可预览数据</div></td></tr>`}</tbody></table></div></div>`;
}

function renderDictionaryImportComplete() {
  const result = dictionaryImportState.result;
  return `<div class="assignment-import-complete"><div class="assignment-import-complete-title" style="font-size:18px;font-weight:bold;text-align:center;margin-bottom:8px;color:#52c41a;">导入完成</div><div class="assignment-import-complete-desc" style="text-align:center;color:#64748b;">新增 <strong>${result.created}</strong> 项，更新 <strong>${result.updated}</strong> 项，失败 <strong>${result.failed}</strong> 项。</div></div>`;
}

function renderDictionaryImportFooter() {
  const pass = dictionaryImportState.validatedRows.filter(row => row.valid).length;
  if (dictionaryImportState.step === 1) return `<button class="btn-cancel" type="button" onclick="closeDictionaryImportWizard()">取消</button><button class="btn-save" type="button" ${dictionaryImportState.validatedRows.length ? '' : 'disabled'} onclick="goDictionaryImportPreview()">下一步</button>`;
  if (dictionaryImportState.step === 2) return `<button class="btn-cancel" type="button" onclick="backDictionaryImportUpload()">上一步</button><button class="btn-save" type="button" ${pass ? '' : 'disabled'} onclick="confirmDictionaryImport()">确认导入</button>`;
  return `<button class="btn-save" type="button" onclick="closeDictionaryImportWizard()">完成</button>`;
}

function setDictionaryImportMode(mode) { dictionaryImportState.mode = mode; if (dictionaryImportState.rows.length) dictionaryImportState.validatedRows = validateDictionaryImportRows(dictionaryImportState.rows); renderDictionaryImportWizard(); }

function downloadDictionaryImportTemplate() {
  const type = getSelectedDictionaryType();
  const columns = getDictionaryImportColumns().map(column => ['字典项编码', '显示名称', '状态'].includes(column) ? `${column}*` : column);
  const relationValue = type.code === 'ABNORMAL_REASON' ? '总部_休眠未购' : type.code === 'OUTBOUND_TYPE' ? '一知' : '';
  const row = ['SAMPLE_CODE', '示例字典项', '99', '启用', '请填写使用说明', ...(getDictionaryRelationLabel() ? [relationValue] : [])];
  downloadExcelWorkbookFile(`${type.name}字典导入模板.xls`, [{ name: '导入数据', columns, rows: [row] }, { name: '填写说明', columns: ['字段', '说明'], rows: [['字典项编码', '必填，使用大写字母、数字和下划线；保存后不可修改'], ['显示名称', '必填，页面展示名称'], ['排序', '选填，数值越小越靠前'], ['状态', '必填，仅支持启用、停用'], ['说明', '选填'], ...(getDictionaryRelationLabel() ? [['关联对象', `${getDictionaryRelationLabel()}，必填`]] : [])] }], `${type.name}字典导入模板已下载`);
}

registerUiAction('dictionary-import-download-template', downloadDictionaryImportTemplate);

function handleDictionaryImportFile(file) {
  if (!file) return;
  dictionaryImportState.fileName = file.name;
  if (/\.xlsx$/i.test(file.name)) { dictionaryImportState.rows = []; dictionaryImportState.validatedRows = []; showToast('当前原型请使用下载模板保存的 .xls 文件上传', false); renderDictionaryImportWizard(); return; }
  const reader = new FileReader();
  reader.onload = event => { dictionaryImportState.rows = parseDictionaryImportRows(String(event.target.result || ''), file.name); dictionaryImportState.validatedRows = validateDictionaryImportRows(dictionaryImportState.rows); showToast(dictionaryImportState.validatedRows.length ? `已解析 ${dictionaryImportState.validatedRows.length} 条数据` : '未解析到可导入的数据行，请检查模板内容', !!dictionaryImportState.validatedRows.length); renderDictionaryImportWizard(); };
  reader.onerror = () => showToast('文件读取失败，请重新上传', false);
  reader.readAsText(file, 'utf-8');
}

function parseDictionaryImportRows(text, fileName) {
  let matrix = [];
  if (text.includes('<Workbook')) { const doc = new DOMParser().parseFromString(text, 'text/xml'); matrix = Array.from(doc.getElementsByTagName('Row')).map(row => Array.from(row.getElementsByTagName('Cell')).map(cell => cell.textContent.trim())); }
  else { const delimiter = /\.tsv$/i.test(fileName) ? '\t' : ','; matrix = text.split(/\r?\n/).filter(Boolean).map(line => line.split(delimiter).map(cell => cell.trim())); }
  const columns = getDictionaryImportColumns();
  const headerIndex = matrix.findIndex(row => row.map(cell => String(cell).replace(/\*/g, '').trim()).includes('字典项编码') && row.map(cell => String(cell).replace(/\*/g, '').trim()).includes('显示名称'));
  if (headerIndex < 0) return [];
  const header = matrix[headerIndex].map(cell => String(cell).replace(/\*/g, '').trim());
  return matrix.slice(headerIndex + 1).filter(row => row.some(Boolean)).map((row, index) => ({ rowNo: headerIndex + index + 2, data: Object.fromEntries(columns.map(column => [column, row[header.indexOf(column)] || ''])) }));
}

function validateDictionaryImportRows(rows) {
  const typeCode = selectedDictionaryCode;
  const relationLabel = getDictionaryRelationLabel(typeCode);
  const existing = DICTIONARY_ITEMS[typeCode] || [];
  const codes = new Set();
  const referenceOptions = typeCode === 'ABNORMAL_REASON' ? (DICTIONARY_ITEMS.INITIAL_LEAD_STATUS || []).map(item => item.name) : typeCode === 'OUTBOUND_TYPE' ? (DICTIONARY_ITEMS.OUTBOUND_SYSTEM || []).map(item => item.name) : [];
  return rows.map(row => { const data = row.data; const code = String(data['字典项编码'] || '').trim().toUpperCase(); const errors = []; if (!/^[A-Z][A-Z0-9_]*$/.test(code)) errors.push('字典项编码格式不正确'); if (!data['显示名称'].trim()) errors.push('显示名称必填'); if (!['启用', '停用'].includes(data['状态'].trim())) errors.push('状态仅支持：启用、停用'); if (codes.has(code)) errors.push('导入文件内字典项编码重复'); codes.add(code); const exists = existing.some(item => item.code === code); if (exists && dictionaryImportState.mode === 'create') errors.push('字典项编码已存在，请使用“新增或更新”'); if (relationLabel && !referenceOptions.includes(data['关联对象'].trim())) errors.push(`${relationLabel}无效或未填写`); return { ...row, data: { ...data, '字典项编码': code }, action: exists ? 'update' : 'create', valid: !errors.length, errors }; });
}

function goDictionaryImportPreview() { dictionaryImportState.step = 2; renderDictionaryImportWizard(); }
function backDictionaryImportUpload() { dictionaryImportState.step = 1; renderDictionaryImportWizard(); }

function confirmDictionaryImport() {
  const typeCode = selectedDictionaryCode;
  const items = DICTIONARY_ITEMS[typeCode] || (DICTIONARY_ITEMS[typeCode] = []);
  let created = 0; let updated = 0;
  dictionaryImportState.validatedRows.filter(row => row.valid).forEach(row => { const data = row.data; const code = data['字典项编码']; const relation = data['关联对象'].trim(); const patch = { code, name: data['显示名称'].trim(), order: Number(data['排序']) || 99, status: data['状态'].trim(), description: data['说明'].trim() || '—', ...(typeCode === 'ABNORMAL_REASON' ? { applicableLeadStatuses: [relation] } : {}), ...(typeCode === 'OUTBOUND_TYPE' ? { outboundSystem: relation } : {}) }; const current = items.find(item => item.code === code); if (current) { Object.assign(current, patch); updated += 1; } else { items.push({ ...patch, refs: 0 }); created += 1; } });
  items.sort((a, b) => a.order - b.order);
  const type = DICTIONARY_TYPES.find(item => item.code === typeCode); if (type) type.count = items.length;
  syncDictionaryBackedConfiguratorOptions();
  dictionaryImportState.result = { created, updated, failed: dictionaryImportState.validatedRows.length - created - updated };
  dictionaryImportState.step = 3;
  renderDictionaryManager();
  renderDictionaryImportWizard();
}
