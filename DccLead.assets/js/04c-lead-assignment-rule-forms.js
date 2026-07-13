function openLeadAssignmentRuleModal(mode, id = null) {
  const dimension = getLeadAssignmentDimension();
  const rule = id ? dimension.rules.find(item => item.id === id) : null;
  editingLeadAssignmentRuleId = mode === 'edit' ? id : null;
  const ruleLabel = getLeadAssignmentRuleLabel(dimension);
  const titleMap = { add: `新增${ruleLabel}`, edit: `编辑${ruleLabel}`, view: `查看${ruleLabel}` };
  document.getElementById('leadDispatchRuleModalTitle').textContent = titleMap[mode] || ruleLabel;
  document.getElementById('leadDispatchRuleModalBody').innerHTML = mode === 'view'
    ? renderLeadAssignmentRuleDetail(rule, dimension)
    : renderLeadAssignmentRuleForm(rule || getDefaultLeadAssignmentRule(dimension), dimension);
  document.getElementById('leadDispatchRuleModalFooter').innerHTML = mode === 'view'
    ? `<button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">关闭</button>`
    : `
      <button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">取消</button>
      <button class="btn-save" type="button" onclick="saveLeadAssignmentRule()">保存</button>
  `;
  document.getElementById('leadDispatchRuleModal').classList.add('show');
  if (['sc', 'project', 'channel', 'dealer'].includes(dimension.key) && mode !== 'view') filterProjectNameOptions();
  if (dimension.key === 'lead-status' && mode !== 'view') syncAssignmentLeadStatusReasons();
  if (dimension.key === 'sc' && mode !== 'view' && document.getElementById('smartCodePushTimeSlots')) initSmartCodePushTimeControls();
}

function getDefaultLeadAssignmentRule(dimension) {
  const prefixMap = { series: 'CAR', sc: 'SC', project: 'PROJ', channel: 'CH', 'lead-status': 'LS', dealer: 'DLR' };
  const prefix = prefixMap[dimension.key] || 'RULE';
  return {
    id: `${prefix}-${String(dimension.rules.length + 1).padStart(3, '0')}`,
    name: '',
    keyValue: '',
    callTypes: [],
    condition: '',
    action: '',
    ratio: '不按比例',
    allocationMode: 'single',
    allocations: [{ channel: '', percent: 100 }],
    useAllocationPolicy: '否',
    allocationPolicyId: '',
    sort: dimension.rules.length + 1,
    status: '启用',
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };
}

function renderLeadAssignmentRuleDetail(rule, dimension) {
  if (!rule) return '<div class="empty-state">未找到线索分配规则</div>';
  if (isCompactAssignmentDimension(dimension)) return renderCompactAssignmentRuleDetail(rule, dimension);
  return `
    <div class="rule-detail-layout">
      <div class="rule-detail-section">
        <div class="rule-detail-title">基础信息</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">配置维度</div><div class="rule-detail-value">${detailValue(dimension.name)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">策略名称</div><div class="rule-detail-value">${detailValue(rule.name)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">排序</div><div class="rule-detail-value">P${detailValue(rule.sort)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">状态</div><div class="rule-detail-value">${detailValue(rule.status)}</div></div>
        </div>
      </div>
      <div class="rule-detail-section">
        <div class="rule-detail-title">匹配条件</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">配置内容</div><div class="rule-detail-value">${detailValue(rule.keyValue)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">外呼类型</div><div class="rule-detail-value">${(rule.callTypes || []).join('、') || '—'}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">匹配条件</div><div class="rule-detail-value">${detailValue(rule.condition)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">数据来源</div><div class="rule-detail-value">${detailValue(dimension.source)}</div></div>
        </div>
      </div>
      <div class="rule-detail-section">
        <div class="rule-detail-title">执行动作</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">分配动作</div><div class="rule-detail-value">${detailValue(rule.action)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">比例/评级</div><div class="rule-detail-value">${detailValue(rule.ratio)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">更新时间</div><div class="rule-detail-value">${detailValue(rule.updatedAt)}</div></div>
        </div>
      </div>
    </div>
  `;
}

function renderLeadAssignmentRuleForm(rule, dimension) {
  if (isCompactAssignmentDimension(dimension)) return renderCompactAssignmentRuleForm(rule, dimension);
  return `
    <div class="section-heading">基础信息</div>
    <div class="form-group">
      <div class="form-label">配置维度</div>
      <input class="form-input" value="${escapeAttr(dimension.name)}" disabled />
      <div class="form-hint">字段范围：${dimension.fields}</div>
    </div>
    <div class="form-group">
      <div class="form-label">策略名称 <span class="required">*</span></div>
      <input class="form-input" id="assignmentFormName" value="${escapeAttr(rule.name || '')}" placeholder="例：N6车系优先培育" />
    </div>
    <div class="form-group">
      <div class="form-label">排序 <span class="required">*</span></div>
      <input class="form-input" id="assignmentFormSort" type="number" min="1" max="99" value="${escapeAttr(rule.sort || '')}" placeholder="数字越小越优先" />
    </div>
    <div class="form-group">
      <div class="form-label">配置内容 <span class="required">*</span></div>
      <input class="form-input" id="assignmentFormKeyValue" value="${escapeAttr(rule.keyValue || '')}" placeholder="填写${dimension.name}对应内容" />
      <div class="form-hint">数据来源：${dimension.source}</div>
    </div>

    <div class="section-heading">匹配条件</div>
    <div class="form-group">
      <div class="form-label">外呼类型 <span class="required">*</span></div>
      <textarea class="form-input" id="assignmentFormCallTypes" rows="2" placeholder="多个值用逗号分隔">${escapeAttr((rule.callTypes || []).join('，'))}</textarea>
    </div>
    <div class="form-group">
      <div class="form-label">匹配条件 <span class="required">*</span></div>
      <textarea class="form-input" id="assignmentFormCondition" rows="3" placeholder="例：意向车系=N6">${escapeAttr(rule.condition || '')}</textarea>
    </div>

    <div class="section-heading">执行动作</div>
    <div class="form-group">
      <div class="form-label">分配动作 <span class="required">*</span></div>
      <select class="form-input" id="assignmentFormAction">
        ${['分配AI智能外呼', '分配人工客服跟进', '分配专项人工团队', '暂不分配'].map(action => `<option value="${action}" ${rule.action === action ? 'selected' : ''}>${action}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <div class="form-label">比例/评级</div>
      <input class="form-input" id="assignmentFormRatio" value="${escapeAttr(rule.ratio || '')}" placeholder="例：是，70% / 评级后执行 / 否" />
    </div>
    <div class="form-group">
      <div class="form-label">状态</div>
      <select class="form-input" id="assignmentFormStatus">
        ${['启用', '停用'].map(status => `<option value="${status}" ${rule.status === status ? 'selected' : ''}>${status}</option>`).join('')}
      </select>
    </div>
  `;
}

const seriesIntentOptions = ['N6', '轩逸', '天籁', '逍客', '奇骏', 'ARIYA', '探陆', '其他车系'];
const assignmentSmartCodeOptions = ['SC-N6-0891', 'SC-GZ-2026', 'SC-SY-0234', 'SC-XK-7712', 'SC-QJ-5520', 'SC-TL-4219', 'SC-OLD-001'];
const assignmentCityGroups = [
  { province: '广东省', cities: ['广州', '深圳'] },
  { province: '浙江省', cities: ['杭州'] },
  { province: '上海市', cities: ['上海'] },
  { province: '四川省', cities: ['成都'] }
];
const assignmentCityOptions = assignmentCityGroups.flatMap(group => group.cities);
const assignmentProvinceOptions = ['广东省', '浙江省', '上海市', '四川省'];
const projectNameOptions = ['新能源专项', '置换活动', 'DCC培育项目', '高意向培育', '保客激活', '金融置换专项'];
const assignmentChannelCodeOptions = ['R1', 'R2', 'R3', 'R4', 'R5', '未知渠道'];
const assignmentLeadStatusOptions = ['总部_高意向', '总部_休眠未购', '总部_休眠失联', '总部_战败', '总部_暂败', '总部_阶段性战败', '总部_无效', '总部_异地'];
const assignmentLeadStatusReasonMap = {
  '总部_休眠未购': ['资金不足', '半年内不购车', '家人不同意', '征信不通过', '驾照没考到', '关注竞品车型', '其他'],
  '总部_休眠失联': ['三天四次无法接通', '用户要求不联系', '被拉黑'],
  '总部_战败': ['等待期长', '价格因素', '品牌偏好', '金融方案', '产品设计和配置', '服务不满', '其他'],
  '总部_无效': ['明确空号', '错号', '停机']
};
const assignmentDealerOptions = ['广州白云日产', '深圳南山日产', '杭州东风日产滨江店', '上海东风日产浦东店', '成都东风日产高新店', '无意向门店'];
const assignmentOutboundChannels = unifiedPolicyCallTypeOptions;
const assignmentPushWeekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const precallAttributeConfigs = {
  '渠道编码': { label: '渠道编码', options: assignmentChannelCodeOptions },
  'SmartCode': { label: 'SmartCode', options: assignmentSmartCodeOptions },
  '大项目名': { label: '大项目名', options: projectNameOptions },
  '线索状态': { label: '线索状态', options: assignmentLeadStatusOptions }
};

function getDefaultAssignmentOutboundChannel(index = 0) {
  return assignmentOutboundChannels[index] || '';
}

function getDefaultAssignmentAllocationRows() {
  return assignmentOutboundChannels.length > 1
    ? [{ channel: '', percent: 40 }, { channel: '', percent: 60 }]
    : [{ channel: '', percent: 100 }];
}

function normalizeAssignmentCallType(value) {
  if (!value) return '';
  if (assignmentOutboundChannels.includes(value)) return value;
  if (value.includes('冰兰')) return '冰兰-新线索';
  if (value.includes('一知') && value.includes('大模型')) return '一知-冷线索（大模型）';
  if (value.includes('一知')) return '一知-冷线索';
  if (value.includes('科大讯飞')) return '科大讯飞-冷线索';
  if (value.includes('人工') || value.includes('机器人') || value.includes('预测') || value.includes('IVR') || value.includes('AI')) return getDefaultAssignmentOutboundChannel();
  return value;
}

function getCompactAssignmentConfig(dimension) {
  if (dimension.key === 'sc') {
    return {
      valueLabel: 'SmartCode',
      inputName: 'assignmentSmartCodeValue',
      valuesKey: 'scValues',
      options: assignmentSmartCodeOptions,
      example: '广州N6-SC定向培育',
      conditionPrefix: 'SmartCode',
      emptyToast: '请选择SmartCode'
    };
  }
  if (dimension.key === 'project') {
    return {
      valueLabel: '大项目名',
      inputName: 'assignmentProjectValue',
      valuesKey: 'projectValues',
      options: projectNameOptions,
      example: '新能源专项项目',
      conditionPrefix: '大项目名',
      emptyToast: '请选择大项目名'
    };
  }
  if (dimension.key === 'channel') {
    return {
      valueLabel: '渠道编码',
      inputName: 'assignmentChannelValue',
      valuesKey: 'channelValues',
      options: assignmentChannelCodeOptions,
      example: 'R1渠道新线索AI外呼',
      conditionPrefix: '渠道编码',
      emptyToast: '请选择渠道编码'
    };
  }
  if (dimension.key === 'lead-status') {
    return {
      valueLabel: '线索状态',
      inputName: 'assignmentLeadStatusValue',
      valuesKey: 'leadStatusValues',
      options: assignmentLeadStatusOptions,
      example: '待培育线索进入AI',
      conditionPrefix: '线索状态',
      emptyToast: '请选择线索状态'
    };
  }
  if (dimension.key === 'dealer') {
    return {
      valueLabel: '意向门店',
      inputName: 'assignmentDealerValue',
      valuesKey: 'dealerValues',
      options: assignmentDealerOptions,
      example: '有意向门店优先人工',
      conditionPrefix: '意向门店',
      emptyToast: '请选择意向门店'
    };
  }
  return {
    valueLabel: '意向车系',
    inputName: 'assignmentSeriesValue',
    valuesKey: 'seriesValues',
    options: seriesIntentOptions,
    example: 'N6车系优先培育',
    conditionPrefix: '意向车系',
    emptyToast: '请选择意向车系'
  };
}

function getCompactAssignmentSelectedValues(rule, dimension) {
  const config = getCompactAssignmentConfig(dimension);
  const source = rule[config.valuesKey] || rule.keyValue || '';
  return String(source).split(/[、,，/]/).map(item => item.trim()).filter(Boolean);
}

function renderClampedCellText(value) {
  return `<div class="rule-cell-clamp" title="${escapeAttr(value || '')}">${escapeHtml(value || '—')}</div>`;
}

function renderCompactConditionCell(rule, dimension) {
  if (hasRelatedSeriesCondition(dimension)) {
    const config = getCompactAssignmentConfig(dimension);
    const selectedValues = getCompactAssignmentSelectedValues(rule, dimension);
    const seriesValues = getCompactSelectedSeries(rule, dimension);
    const leadStatusValues = dimension.key === 'dealer' ? getDealerSelectedLeadStatuses(rule) : [];
    const leadStatusReasonValues = dimension.key === 'lead-status' ? getLeadStatusReasonValues(rule) : [];
    const title = [
      `${config.valueLabel}=${selectedValues.join('、') || '—'}`,
      ...(dimension.key === 'lead-status' ? [`异常原因=${leadStatusReasonValues.join('、') || '不限'}`] : []),
      `意向车系=${seriesValues.join('、') || '不限'}`,
      ...(dimension.key === 'dealer' ? [`线索状态=${leadStatusValues.join('、') || '不限'}`] : [])
    ].join(' / ');
    return `
      <div class="rule-condition-cell" title="${escapeAttr(title)}">
        <div class="rule-condition-line"><strong>${config.valueLabel}：</strong>${escapeHtml(selectedValues.join('、') || '—')}</div>
        ${dimension.key === 'lead-status' ? `<div class="rule-condition-line"><strong>异常原因：</strong>${escapeHtml(leadStatusReasonValues.join('、') || '不限')}</div>` : ''}
        <div class="rule-condition-line"><strong>车系：</strong>${escapeHtml(seriesValues.join('、') || '不限')}</div>
        ${dimension.key === 'dealer' ? `<div class="rule-condition-line"><strong>线索状态：</strong>${escapeHtml(leadStatusValues.join('、') || '不限')}</div>` : ''}
      </div>
    `;
  }
  if (dimension.key === 'series') {
    return `
      <div class="rule-condition-cell" title="${escapeAttr(rule.condition || '')}">
        <div class="rule-condition-line"><strong>车系：</strong>${escapeHtml(getCompactAssignmentSelectedValues(rule, dimension).join('、') || '—')}</div>
      </div>
    `;
  }
  return renderClampedCellText(rule.condition);
}

function renderDetailValueTags(values = []) {
  const list = (values || []).filter(Boolean);
  if (!list.length) return '—';
  return `<div class="rule-detail-tags">${list.map(value => `<span class="rule-chip blue">${escapeHtml(value)}</span>`).join('')}</div>`;
}

function getCompactSelectedSeries(rule, dimension) {
  const source = dimension.key === 'sc'
    ? rule.scSeriesValues || ''
    : dimension.key === 'project'
    ? rule.projectSeriesValues || ''
    : dimension.key === 'channel'
      ? rule.channelSeriesValues || ''
      : dimension.key === 'lead-status'
        ? rule.leadStatusSeriesValues || ''
        : dimension.key === 'dealer'
          ? rule.dealerSeriesValues || ''
          : '';
  if (Array.isArray(source)) return source;
  return String(source).split(/[、,，/]/).map(item => item.trim()).filter(Boolean);
}

function getDealerSelectedLeadStatuses(rule) {
  const source = rule.dealerLeadStatusValues || '';
  if (Array.isArray(source)) return source;
  return String(source).split(/[、,，/]/).map(item => item.trim()).filter(Boolean);
}

function getLeadStatusReasonValues(rule) {
  const source = rule.leadStatusReasonValues || '';
  if (Array.isArray(source)) return source;
  return String(source).split(/[、,，/]/).map(item => item.trim()).filter(Boolean);
}

function getLeadStatusReasonOptions(statuses = []) {
  return [...new Set((statuses || []).flatMap(status => assignmentLeadStatusReasonMap[status] || []))];
}

function renderLeadStatusReasonGroups(statuses = [], selectedReasons = [], name = 'assignmentLeadStatusReasonValue') {
  return (statuses || [])
    .filter(status => assignmentLeadStatusReasonMap[status]?.length)
    .map(status => `
      <div class="lead-status-reason-group">
        <div class="lead-status-reason-title">${escapeHtml(status)}</div>
        <div class="lead-status-reason-options">
          ${assignmentLeadStatusReasonMap[status].map(reason => `
            <label class="series-series-option">
              <input type="checkbox" name="${escapeAttr(name)}" value="${escapeAttr(reason)}" ${selectedReasons.includes(reason) ? 'checked' : ''} />
              <span>${escapeHtml(reason)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');
}

function syncAssignmentLeadStatusReasons() {
  const group = document.getElementById('assignmentLeadStatusReasonGroup');
  const list = document.getElementById('assignmentLeadStatusReasonList');
  if (!group || !list) return;
  const selectedStatuses = Array.from(document.querySelectorAll('input[name="assignmentLeadStatusValue"]:checked')).map(input => input.value);
  const selectedReasons = Array.from(document.querySelectorAll('input[name="assignmentLeadStatusReasonValue"]:checked')).map(input => input.value);
  const options = getLeadStatusReasonOptions(selectedStatuses);
  group.style.display = options.length ? '' : 'none';
  list.innerHTML = renderLeadStatusReasonGroups(selectedStatuses, selectedReasons);
}

function getSmartCodePushTime(rule) {
  const pushTime = rule.pushTime || {};
  const days = Array.isArray(pushTime.days) ? pushTime.days : [];
  const slots = Array.isArray(pushTime.slots) ? pushTime.slots : [];
  const normalizedSlots = slots.map(slot => ({
    start: slot?.start || '',
    end: slot?.end || ''
  }));
  while (normalizedSlots.length < 2) normalizedSlots.push({ start: '', end: '' });
  return {
    days,
    slots: normalizedSlots
  };
}

function renderSmartCodePushTimeText(rule) {
  const pushTime = getSmartCodePushTime(rule);
  const slotText = pushTime.slots
    .filter(slot => slot.start && slot.end)
    .map((slot, index) => `时段${index + 1} ${slot.start}-${slot.end}`)
    .join('；');
  if (!pushTime.days.length && !slotText) return '不限';
  return `${pushTime.days.join('、') || '未选星期'}${slotText ? ` / ${slotText}` : ''}`;
}

function renderSmartCodePushTimeSlot(slot = {}, index = 0, total = 1) {
  const rowNo = index + 1;
  return `
    <div class="push-time-slot smart-code-push-slot" data-slot-index="${rowNo}">
      <div class="push-time-slot-label">时段${rowNo}</div>
      <input class="form-input time-input smart-code-push-start" type="time" step="60" list="smartCodeTimeOptions" value="${escapeAttr(slot.start || '')}" oninput="syncSmartCodePushTime()" onchange="syncSmartCodePushTime()" />
      <div class="push-time-separator">-</div>
      <input class="form-input time-input smart-code-push-end" type="time" step="60" list="smartCodeTimeOptions" value="${escapeAttr(slot.end || '')}" oninput="syncSmartCodePushTime()" onchange="syncSmartCodePushTime()" />
      <button class="push-time-remove" type="button" onclick="removeSmartCodePushTimeSlot(this)" style="${total <= 1 ? 'visibility:hidden' : ''}">删除</button>
    </div>
  `;
}

function hasPushTimeValue(pushTime = {}) {
  return Boolean((pushTime.days || []).length || (pushTime.slots || []).some(slot => slot?.start || slot?.end));
}

function renderSmartCodePushTimePanel(pushTime = {}) {
  const isExpanded = hasPushTimeValue(pushTime);
  return `
    <div class="push-time-inline optional-push-time smart-code-push-time-config" data-expanded="${isExpanded}">
      <div class="optional-push-time-header">
        <div class="optional-push-time-title">推送时间 <span class="optional-push-time-tag">选填</span></div>
        <button class="optional-push-time-toggle" type="button" onclick="toggleOptionalPushTime(this)">${isExpanded ? '收起配置' : '配置推送时间'}</button>
      </div>
      <div class="optional-push-time-body" ${isExpanded ? '' : 'hidden'}>
        <div class="push-time-days">
          ${assignmentPushWeekdays.map(day => `
            <label class="push-time-day">
              <input type="checkbox" name="smartCodePushDay" value="${day}" ${pushTime.days.includes(day) ? 'checked' : ''} />
              <span>${day}</span>
            </label>
          `).join('')}
        </div>
        <div class="push-time-slots">
          <div id="smartCodePushTimeSlots">
            ${pushTime.slots.map((slot, index) => renderSmartCodePushTimeSlot(slot, index, pushTime.slots.length)).join('')}
          </div>
          <button class="push-time-add" type="button" onclick="addSmartCodePushTimeSlot()">新增时段</button>
          <div class="push-time-warning" id="smartCodePushTimeHint"></div>
          <datalist id="smartCodeTimeOptions">
            ${getSmartCodeTimeOptions().map(time => `<option value="${time}"></option>`).join('')}
          </datalist>
        </div>
        <div class="series-form-hint">选填；可自由选择时间，后续时间点必须晚于前一个已设置时间点，保存时会校验顺序。</div>
      </div>
    </div>
  `;
}

function getSeriesAllocation(rule) {
  if (rule.allocations?.length) return rule.allocations;
  if (rule.allocationMode === 'ratio' || /%/.test(rule.ratio || '')) {
    return [
      { channel: normalizeAssignmentCallType(rule.action), percent: 100 }
    ];
  }
  return [{ channel: normalizeAssignmentCallType(rule.action) || normalizeAssignmentCallType(rule.callTypes?.[0]), percent: 100 }];
}

function getSeriesAllocationMode(rule) {
  if (rule.allocationMode) return rule.allocationMode;
  return /%/.test(rule.ratio || '') ? 'ratio' : 'single';
}

function isTemplateAllocationMode(rule = {}) {
  return ['policy', 'policy-city'].includes(rule.allocationMode) || (rule.useAllocationPolicy === '是' && !!rule.allocationPolicyId);
}

function getAssignmentAllocationMode(rule = {}) {
  if (isTemplateAllocationMode(rule)) return 'ratio';
  return getSeriesAllocationMode(rule);
}

function renderCompactAssignmentRuleDetail(rule, dimension) {
  const config = getCompactAssignmentConfig(dimension);
  const selectedValues = getCompactAssignmentSelectedValues(rule, dimension);
  const relatedSeriesValues = hasRelatedSeriesCondition(dimension) ? getCompactSelectedSeries(rule, dimension) : [];
  const dealerLeadStatusValues = dimension.key === 'dealer' ? getDealerSelectedLeadStatuses(rule) : [];
  const leadStatusReasonValues = dimension.key === 'lead-status' ? getLeadStatusReasonValues(rule) : [];
  const smartCodePushTime = dimension.key === 'sc' ? getSmartCodePushTime(rule) : { days: [], slots: [{ start: '', end: '' }, { start: '', end: '' }] };
  const mode = getAssignmentAllocationMode(rule);
  const allocations = getSeriesAllocation(rule);
  const allocationText = mode === 'ratio'
    ? allocations.map(item => `${item.channel} ${item.percent}%`).join('，')
    : `全部分配给${allocations[0]?.channel || '—'}`;
  const useAllocationPolicy = mode === 'ratio' ? (rule.useAllocationPolicy || (rule.allocationPolicyId ? '是' : '否')) : '否';
  const allocationPolicy = mode === 'ratio' ? getAllocationPolicyById(rule.allocationPolicyId) : null;
  const isRatio = mode === 'ratio';
  const allocationPolicyDisplay = useAllocationPolicy !== '是'
    ? '未接入'
    : allocationPolicy
      ? `<div>${escapeHtml(allocationPolicy.name)}</div><div class="allocation-policy-reference-id">策略ID：${escapeHtml(allocationPolicy.id)}</div>`
      : '比例配置已停用/不存在';
  return `
    <div class="rule-detail-layout">
      <div class="rule-detail-section">
        <div class="rule-detail-title">基础信息</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">配置维度</div><div class="rule-detail-value">${detailValue(dimension.name)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">策略名称</div><div class="rule-detail-value">${detailValue(rule.name)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">状态</div><div class="rule-detail-value">${detailValue(rule.status)}</div></div>
        </div>
      </div>
      <div class="rule-detail-section">
        <div class="rule-detail-title">匹配条件</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">${config.valueLabel}</div><div class="rule-detail-value">${renderDetailValueTags(selectedValues)}</div></div>
          ${dimension.key === 'lead-status' ? `<div class="rule-detail-field"><div class="rule-detail-label">异常原因</div><div class="rule-detail-value">${leadStatusReasonValues.length ? renderDetailValueTags(leadStatusReasonValues) : '不限'}</div></div>` : ''}
          ${hasRelatedSeriesCondition(dimension) ? `<div class="rule-detail-field"><div class="rule-detail-label">意向车系</div><div class="rule-detail-value">${relatedSeriesValues.length ? renderDetailValueTags(relatedSeriesValues) : '不限'}</div></div>` : ''}
          ${dimension.key === 'dealer' ? `<div class="rule-detail-field"><div class="rule-detail-label">线索状态</div><div class="rule-detail-value">${dealerLeadStatusValues.length ? renderDetailValueTags(dealerLeadStatusValues) : '不限'}</div></div>` : ''}
        </div>
      </div>
      <div class="rule-detail-section">
        <div class="rule-detail-title">分配动作</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">是否按比例</div><div class="rule-detail-value">${isRatio ? '是' : '否'}</div></div>
          ${isRatio
            ? `
              <div class="rule-detail-field"><div class="rule-detail-label">分配比例配置</div><div class="rule-detail-value">${allocationPolicyDisplay}</div></div>
              <div class="rule-detail-field wide"><div class="rule-detail-label">模板规则</div><div class="rule-detail-value">${detailValue(allocationPolicy ? getAllocationPolicySummary(allocationPolicy) : rule.action)}</div></div>
            `
            : `
              <div class="rule-detail-field"><div class="rule-detail-label">外呼类型</div><div class="rule-detail-value">${detailValue(allocationText)}</div></div>
              ${dimension.key === 'sc' ? `<div class="rule-detail-field"><div class="rule-detail-label">推送时间</div><div class="rule-detail-value">${detailValue(renderSmartCodePushTimeText(rule))}</div></div>` : ''}
            `}
        </div>
      </div>
    </div>
  `;
}

function renderSmartCodeValueInput(selectedValues = [], inputMode = 'picker') {
  const manualValue = selectedValues.join('\n');
  return `
    <div class="smart-code-input-mode">
      <div class="form-label">录入方式</div>
      <div class="series-mode-toggle">
        <button class="duration-tab ${inputMode === 'picker' ? 'active' : ''}" type="button" id="smartCodePickerMode" onclick="switchSmartCodeInputMode('picker')">下拉勾选</button>
        <button class="duration-tab ${inputMode === 'manual' ? 'active' : ''}" type="button" id="smartCodeManualMode" onclick="switchSmartCodeInputMode('manual')">手动输入</button>
      </div>
    </div>
    <div id="smartCodePickerInputPanel" style="${inputMode === 'manual' ? 'display:none' : ''}">
      <div class="tag-picker project-name-picker">
        <button class="tag-picker-trigger placeholder" id="projectNameTrigger" type="button" onclick="toggleProjectNamePicker()">请选择SmartCode</button>
        <div class="tag-picker-panel" id="projectNamePanel">
          <div class="tag-picker-toolbar">
            <span id="projectNameSelectedCount">已选 ${selectedValues.length} / ${assignmentSmartCodeOptions.length}</span>
            <div class="tag-picker-actions">
              <button class="tag-picker-action" type="button" onclick="selectAllProjectNameOptions()">全选</button>
              <button class="tag-picker-action" type="button" onclick="clearProjectNameOptions()">清空</button>
            </div>
          </div>
          <div class="tag-picker-search">
            <input type="search" id="projectNameSearchInput" placeholder="搜索SmartCode" oninput="filterProjectNameOptions(this.value)" />
          </div>
          <div class="tag-picker-list" id="projectNameList">
            ${assignmentSmartCodeOptions.map(item => `
              <label class="tag-option" data-project-option="${escapeAttr(item)}">
                <input type="checkbox" name="assignmentSmartCodeValue" value="${item}" ${selectedValues.includes(item) ? 'checked' : ''} onchange="toggleProjectNameOption(this)" />
                ${item}
              </label>
            `).join('')}
          </div>
          <div class="tag-picker-empty" id="projectNameSearchEmpty">暂无匹配的SmartCode</div>
        </div>
      </div>
    </div>
    <div id="smartCodeManualInputPanel" style="${inputMode === 'manual' ? '' : 'display:none'}">
      <textarea class="form-input assignment-manual-textarea" id="assignmentSmartCodeManualInput" rows="4" placeholder="可一次粘贴多个 SmartCode，支持换行、逗号、分号或空格分隔">${escapeHtml(manualValue)}</textarea>
      <div class="series-form-hint">保存时会自动拆分并去重；不在下拉选项中的 SmartCode 也可直接录入。</div>
    </div>
  `;
}

function renderProjectNameValueInput(selectedValues = [], inputMode = 'picker') {
  const manualValue = selectedValues.join('\n');
  return `
    <div class="smart-code-input-mode">
      <div class="form-label">录入方式</div>
      <div class="series-mode-toggle">
        <button class="duration-tab ${inputMode === 'picker' ? 'active' : ''}" type="button" id="projectNamePickerMode" onclick="switchProjectNameInputMode('picker')">下拉勾选</button>
        <button class="duration-tab ${inputMode === 'manual' ? 'active' : ''}" type="button" id="projectNameManualMode" onclick="switchProjectNameInputMode('manual')">手动输入</button>
      </div>
    </div>
    <div id="projectNamePickerInputPanel" style="${inputMode === 'manual' ? 'display:none' : ''}">
      <div class="tag-picker project-name-picker">
        <button class="tag-picker-trigger placeholder" id="projectNameTrigger" type="button" onclick="toggleProjectNamePicker()">请选择大项目名</button>
        <div class="tag-picker-panel" id="projectNamePanel">
          <div class="tag-picker-toolbar">
            <span id="projectNameSelectedCount">已选 ${selectedValues.length} / ${projectNameOptions.length}</span>
            <div class="tag-picker-actions">
              <button class="tag-picker-action" type="button" onclick="selectAllProjectNameOptions()">全选</button>
              <button class="tag-picker-action" type="button" onclick="clearProjectNameOptions()">清空</button>
            </div>
          </div>
          <div class="tag-picker-search">
            <input type="search" id="projectNameSearchInput" placeholder="搜索大项目名" oninput="filterProjectNameOptions(this.value)" />
          </div>
          <div class="tag-picker-list" id="projectNameList">
            ${projectNameOptions.map(item => `
              <label class="tag-option" data-project-option="${escapeAttr(item)}">
                <input type="checkbox" name="assignmentProjectValue" value="${item}" ${selectedValues.includes(item) ? 'checked' : ''} onchange="toggleProjectNameOption(this)" />
                ${item}
              </label>
            `).join('')}
          </div>
          <div class="tag-picker-empty" id="projectNameSearchEmpty">暂无匹配的大项目名</div>
        </div>
      </div>
    </div>
    <div id="projectNameManualInputPanel" style="${inputMode === 'manual' ? '' : 'display:none'}">
      <textarea class="form-input assignment-manual-textarea" id="assignmentProjectNameManualInput" rows="4" placeholder="可一次粘贴多个大项目名，支持换行、逗号、分号或空格分隔">${escapeHtml(manualValue)}</textarea>
      <div class="series-form-hint">保存时会自动拆分并去重；不在下拉选项中的大项目名也可直接录入。</div>
    </div>
  `;
}

function renderDealerValueInput(selectedValues = [], inputMode = 'picker') {
  const manualValue = selectedValues.join('\n');
  return `
    <div class="smart-code-input-mode">
      <div class="form-label">录入方式</div>
      <div class="series-mode-toggle">
        <button class="duration-tab ${inputMode === 'picker' ? 'active' : ''}" type="button" id="dealerPickerMode" onclick="switchDealerInputMode('picker')">下拉勾选</button>
        <button class="duration-tab ${inputMode === 'manual' ? 'active' : ''}" type="button" id="dealerManualMode" onclick="switchDealerInputMode('manual')">手动输入</button>
      </div>
    </div>
    <div id="dealerPickerInputPanel" style="${inputMode === 'manual' ? 'display:none' : ''}">
      <div class="tag-picker project-name-picker">
        <button class="tag-picker-trigger placeholder" id="projectNameTrigger" type="button" onclick="toggleProjectNamePicker()">请选择意向门店</button>
        <div class="tag-picker-panel" id="projectNamePanel">
          <div class="tag-picker-toolbar">
            <span id="projectNameSelectedCount">已选 ${selectedValues.length} / ${assignmentDealerOptions.length}</span>
            <div class="tag-picker-actions">
              <button class="tag-picker-action" type="button" onclick="selectAllProjectNameOptions()">全选</button>
              <button class="tag-picker-action" type="button" onclick="clearProjectNameOptions()">清空</button>
            </div>
          </div>
          <div class="tag-picker-search">
            <input type="search" id="projectNameSearchInput" placeholder="搜索意向门店" oninput="filterProjectNameOptions(this.value)" />
          </div>
          <div class="tag-picker-list" id="projectNameList">
            ${assignmentDealerOptions.map(item => `
              <label class="tag-option" data-project-option="${escapeAttr(item)}">
                <input type="checkbox" name="assignmentDealerValue" value="${item}" ${selectedValues.includes(item) ? 'checked' : ''} onchange="toggleProjectNameOption(this)" />
                ${item}
              </label>
            `).join('')}
          </div>
          <div class="tag-picker-empty" id="projectNameSearchEmpty">暂无匹配的意向门店</div>
        </div>
      </div>
    </div>
    <div id="dealerManualInputPanel" style="${inputMode === 'manual' ? '' : 'display:none'}">
      <textarea class="form-input assignment-manual-textarea" id="assignmentDealerManualInput" rows="4" placeholder="可一次粘贴多个意向门店编码，支持换行、逗号、分号或空格分隔">${escapeHtml(manualValue)}</textarea>
      <div class="series-form-hint">保存时会自动拆分并去重；不在下拉选项中的意向门店也可直接录入。</div>
    </div>
  `;
}

function renderCompactAssignmentRuleForm(rule, dimension) {
  const config = getCompactAssignmentConfig(dimension);
  const selectedValues = getCompactAssignmentSelectedValues(rule, dimension);
  const relatedSeriesValues = hasRelatedSeriesCondition(dimension) ? getCompactSelectedSeries(rule, dimension) : [];
  const dealerLeadStatusValues = dimension.key === 'dealer' ? getDealerSelectedLeadStatuses(rule) : [];
  const leadStatusReasonValues = dimension.key === 'lead-status' ? getLeadStatusReasonValues(rule) : [];
  const leadStatusReasonOptions = dimension.key === 'lead-status' ? getLeadStatusReasonOptions(selectedValues) : [];
  const smartCodePushTime = dimension.key === 'sc' ? getSmartCodePushTime(rule) : { days: [], slots: [{ start: '', end: '' }, { start: '', end: '' }] };
  const mode = getAssignmentAllocationMode(rule);
  const allocations = getSeriesAllocation(rule);
  const singleChannel = assignmentOutboundChannels.includes(allocations[0]?.channel) ? allocations[0].channel : '';
  const useAllocationPolicy = rule.useAllocationPolicy || (rule.allocationPolicyId ? '是' : '否');
  const selectedAllocationPolicyId = rule.allocationPolicyId || '';
  const smartCodeInputMode = rule.smartCodeInputMode === 'manual' ? 'manual' : 'picker';
  const projectNameInputMode = rule.projectNameInputMode === 'manual' ? 'manual' : 'picker';
  const dealerInputMode = rule.dealerInputMode === 'manual' ? 'manual' : 'picker';
  const smartCodeMode = dimension.key === 'sc'
    ? (rule.allocationMode === 'single' && useAllocationPolicy !== '是' ? 'single' : 'ratio')
    : mode;
  const actionSection = `
      <section class="series-form-section">
        <div class="series-section-title">分配动作</div>
        <div class="series-action-box">
          ${dimension.key === 'sc' ? `
            <div class="form-group">
              <div class="form-label">是否按比例 <span class="required">*</span></div>
              <div class="series-mode-toggle">
                <button class="duration-tab ${smartCodeMode === 'single' ? 'active' : ''}" type="button" id="seriesAllocationSingleTab" onclick="switchSeriesAllocationMode(this, 'single')">不按比例</button>
                <button class="duration-tab ${smartCodeMode === 'ratio' ? 'active' : ''}" type="button" id="seriesAllocationRatioTab" onclick="switchSeriesAllocationMode(this, 'ratio')">按比例</button>
              </div>
            </div>
            <div class="form-group" id="seriesSingleAllocation" style="${smartCodeMode === 'ratio' ? 'display:none' : ''}">
              <div class="form-label">外呼类型 <span class="required">*</span></div>
              ${renderAssignmentSingleChannelPicker(singleChannel)}
              <div class="series-form-hint">不按比例时，命中线索全部分配给该外呼类型。</div>
              ${renderSmartCodePushTimePanel(smartCodePushTime)}
            </div>
            <div class="form-group" id="seriesRatioAllocation" style="${smartCodeMode === 'single' ? 'display:none' : ''}">
              <div class="form-label">分配比例配置 <span class="required">*</span></div>
              <select class="form-input" id="assignmentAllocationPolicyId">
                <option value="">请选择分配比例配置</option>
                ${leadAllocationPolicies.filter(policy => policy.status === '启用' || policy.id === selectedAllocationPolicyId).map(policy => `<option value="${policy.id}" ${selectedAllocationPolicyId === policy.id ? 'selected' : ''}>${policy.name}${policy.status === '停用' ? '（停用）' : ''}</option>`).join('')}
              </select>
              <div class="series-form-hint">按比例时仅通过“分配比例配置”承接比例配置，不在当前 SmartCode 规则内重复维护。</div>
            </div>
          ` : `
          <div class="form-group">
            <div class="form-label">是否按比例 <span class="required">*</span></div>
            <div class="series-mode-toggle">
              <button class="duration-tab ${mode === 'single' ? 'active' : ''}" type="button" id="seriesAllocationSingleTab" onclick="switchSeriesAllocationMode(this, 'single')">不按比例</button>
              <button class="duration-tab ${mode === 'ratio' ? 'active' : ''}" type="button" id="seriesAllocationRatioTab" onclick="switchSeriesAllocationMode(this, 'ratio')">按比例</button>
            </div>
          </div>
          <div class="form-group" id="seriesSingleAllocation" style="${mode === 'ratio' ? 'display:none' : ''}">
            <div class="form-label">外呼类型 <span class="required">*</span></div>
            ${renderAssignmentSingleChannelPicker(singleChannel)}
            <div class="series-form-hint">不按比例时，命中线索全部分配给该外呼类型</div>
          </div>
          <div class="form-group" id="seriesRatioAllocation" style="${mode === 'single' ? 'display:none' : ''}">
            <div class="form-label">分配比例配置 <span class="required">*</span></div>
            <select class="form-input" id="assignmentAllocationPolicyId">
              <option value="">请选择分配比例配置</option>
              ${leadAllocationPolicies.filter(policy => policy.status === '启用' || policy.id === selectedAllocationPolicyId).map(policy => `<option value="${policy.id}" ${selectedAllocationPolicyId === policy.id ? 'selected' : ''}>${policy.name}${policy.status === '停用' ? '（停用）' : ''}</option>`).join('')}
            </select>
            <div class="series-form-hint">按比例时仅通过“分配比例配置”承接比例配置，不在当前${dimension.name}规则内重复维护。</div>
          </div>
          `}
        </div>
      </section>
  `;
  return `
    <div class="series-assignment-form">
      <section class="series-form-section">
        <div class="series-section-title">基础信息</div>
        <div class="series-form-grid">
          <div class="form-group wide">
            <div class="form-label">策略名称 <span class="required">*</span></div>
            <input class="form-input" id="assignmentFormName" value="${escapeAttr(rule.name || '')}" placeholder="例：${config.example}" />
          </div>
          <div class="form-group">
            <div class="form-label">配置维度</div>
            <input class="form-input" value="${escapeAttr(dimension.name)}" disabled />
          </div>
          <div class="form-group">
            <div class="form-label">状态</div>
            <select class="form-input" id="assignmentFormStatus">
              ${['启用', '停用'].map(status => `<option value="${status}" ${rule.status === status ? 'selected' : ''}>${status}</option>`).join('')}
            </select>
          </div>
        </div>
      </section>

      <section class="series-form-section">
        <div class="series-section-title">匹配条件</div>
        ${hasRelatedSeriesCondition(dimension) ? `
          <div class="form-group">
            <div class="form-label">意向车系</div>
            <div class="series-select-panel">
              <div class="series-series-grid">
                ${seriesIntentOptions.map(item => `
                  <label class="series-series-option">
                    <input type="checkbox" name="assignmentRelatedSeriesValue" value="${item}" ${relatedSeriesValues.includes(item) ? 'checked' : ''} />
                    <span>${item}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="series-form-hint">可与${config.valueLabel}组合判断；不选择表示不限意向车系</div>
          </div>
        ` : ''}
        ${dimension.key === 'dealer' ? `
          <div class="form-group">
            <div class="form-label">线索状态</div>
            <div class="series-select-panel">
              <div class="series-series-grid">
                ${assignmentLeadStatusOptions.map(item => `
                  <label class="series-series-option">
                    <input type="checkbox" name="assignmentDealerLeadStatusValue" value="${item}" ${dealerLeadStatusValues.includes(item) ? 'checked' : ''} />
                    <span>${item}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="series-form-hint">可与${config.valueLabel}组合判断；不选择表示不限线索状态</div>
          </div>
        ` : ''}
        <div class="form-group">
          <div class="form-label">${config.valueLabel} <span class="required">*</span></div>
          ${dimension.key === 'sc' ? renderSmartCodeValueInput(selectedValues, smartCodeInputMode) : dimension.key === 'project' ? renderProjectNameValueInput(selectedValues, projectNameInputMode) : dimension.key === 'dealer' ? renderDealerValueInput(selectedValues, dealerInputMode) : dimension.key === 'channel' ? `
            <div class="tag-picker project-name-picker">
              <button class="tag-picker-trigger placeholder" id="projectNameTrigger" type="button" onclick="toggleProjectNamePicker()">请选择${config.valueLabel}</button>
              <div class="tag-picker-panel" id="projectNamePanel">
                <div class="tag-picker-toolbar">
                  <span id="projectNameSelectedCount">已选 ${selectedValues.length} / ${config.options.length}</span>
                  <div class="tag-picker-actions">
                    <button class="tag-picker-action" type="button" onclick="selectAllProjectNameOptions()">全选</button>
                    <button class="tag-picker-action" type="button" onclick="clearProjectNameOptions()">清空</button>
                  </div>
                </div>
                <div class="tag-picker-search">
                  <input type="search" id="projectNameSearchInput" placeholder="搜索${config.valueLabel}" oninput="filterProjectNameOptions(this.value)" />
                </div>
                <div class="tag-picker-list" id="projectNameList">
                  ${config.options.map(item => `
                    <label class="tag-option" data-project-option="${escapeAttr(item)}">
                      <input type="checkbox" name="${config.inputName}" value="${item}" ${selectedValues.includes(item) ? 'checked' : ''} onchange="toggleProjectNameOption(this)" />
                      ${item}
                    </label>
                  `).join('')}
                </div>
                <div class="tag-picker-empty" id="projectNameSearchEmpty">暂无匹配的${config.valueLabel}</div>
              </div>
            </div>
          ` : `
            <div class="series-select-panel">
              <div class="series-series-grid">
                ${config.options.map(item => `
                  <label class="series-series-option">
                    <input type="checkbox" name="${config.inputName}" value="${item}" ${selectedValues.includes(item) ? 'checked' : ''} ${dimension.key === 'lead-status' ? 'onchange="syncAssignmentLeadStatusReasons()"' : ''} />
                    <span>${item}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `}
        </div>
        ${dimension.key === 'lead-status' ? `
          <div class="form-group" id="assignmentLeadStatusReasonGroup" style="${leadStatusReasonOptions.length ? '' : 'display:none'}">
            <div class="form-label">异常原因 <span class="required">*</span></div>
            <div class="series-select-panel">
              <div class="lead-status-reason-groups" id="assignmentLeadStatusReasonList">
                ${renderLeadStatusReasonGroups(selectedValues, leadStatusReasonValues)}
              </div>
            </div>
            <div class="series-form-hint">异常原因会按已选择的线索状态分组展示。</div>
          </div>
        ` : ''}
      </section>

      ${actionSection}
    </div>
  `;
}

