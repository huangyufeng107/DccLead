const maskedRoutingFields = {
  series: 'series', sc: 'smartcode', project: 'project', channel: 'channel',
  'lead-status': 'leadStatus', dealer: 'dealer'
};

function compileMaskedIntakeRules() {
  const dealerCodes = Object.fromEntries(dealerOptions.map(({code, name}) => [name, code]));
  const allocations = rows => (rows || []).map(({channel, percent}) => ({
    channel, percent: Number(percent)
  }));
  const allocationFor = item => item?.allocationMode === 'score'
    ? { scope: 'score', groups: (item.scoreAllocations || []).map(range => ({
      min: Number(range.minScore), max: Number(range.maxScore), allocations: allocations(range.allocations)
    })), fallback: allocations(item.scoreFallbackAllocations) }
    : { scope: 'none', rows: allocations(item?.allocations) };
  return leadAssignmentDimensions.filter(isCompactAssignmentDimension).flatMap(dimension =>
    dimension.rules.filter(rule => rule.leadScope === 'masked' && rule.status === '启用').map(rule => {
      const values = getCompactAssignmentSelectedValues(rule, dimension);
      const relatedSeries = hasRelatedSeriesCondition(dimension) ? getCompactSelectedSeries(rule, dimension) : [];
      const conditions = { [maskedRoutingFields[dimension.key]]: values };
      if (relatedSeries.length) conditions.series = relatedSeries;
      if (dimension.key === 'dealer') {
        conditions.dealer = [...new Set(values.flatMap(value => dealerCodes[value] ? [value, dealerCodes[value]] : [value]))];
        const statuses = getDealerSelectedLeadStatuses(rule);
        if (statuses.length) conditions.leadStatus = statuses;
      }
      if (dimension.key === 'lead-status') {
        const reasons = getLeadStatusReasonValues(rule);
        if (reasons.length) conditions.reason = reasons;
      }
      const push = dimension.key === 'sc' ? getSmartCodePushTime(rule) : { days: [], slots: [] };
      let allocation = { scope: 'none', rows: allocations(getSeriesAllocation(rule)) };
      let policyId = '';
      if (isTemplateAllocationMode(rule)) {
        const policy = getAllocationPolicyById(rule.allocationPolicyId);
        policyId = rule.allocationPolicyId;
        const scope = getAllocationPolicyScope(policy);
        if (policy?.status !== '启用') allocation = { scope: 'unavailable' };
        else if (['city', 'province', 'district'].includes(scope)) {
          allocation = { scope, groups: (policy.cityAllocations || []).map(item => ({
            values: item.cities?.length ? item.cities : [item.city],
            allocation: allocationFor(item)
          })), fallback: allocationFor(policy.fallbackCityAllocation) };
        } else if (scope === 'score') {
          allocation = allocationFor({ ...policy, allocationMode: 'score' });
        } else allocation = allocationFor(policy);
      }
      return {
        id: rule.id, name: rule.name, dimension: dimension.name, policyId, conditions,
        days: push.days.map(day => assignmentPushWeekdays.indexOf(day)).filter(day => day >= 0),
        slots: push.slots.filter(slot => slot.start && slot.end).map(({start, end}) => [start, end]),
        allocation
      };
    })
  );
}

function evaluateMaskedIntakeRules(rules, lead, timestamp) {
  const matches = rules.filter(rule => {
    if (!Object.entries(rule.conditions).every(([key, values]) => values.includes(lead[key] || ''))) return false;
    if (!rule.days.length && !rule.slots.length) return true;
    const date = new Date(timestamp.replace(' ', 'T') + '+08:00');
    const weekday = (new Date(date.getTime() + 8 * 3600000).getUTCDay() + 6) % 7;
    const time = timestamp.slice(11, 16);
    return (!rule.days.length || rule.days.includes(weekday)) &&
      (!rule.slots.length || rule.slots.some(([start, end]) => start <= time && time < end));
  });
  const allocationRows = allocation => {
    if (allocation.scope === 'none') return allocation.rows;
    if (allocation.scope === 'score') {
      if (!Number.isFinite(lead.score)) return [];
      return (allocation.groups.find(group => group.min <= lead.score && lead.score <= group.max)?.allocations || allocation.fallback);
    }
    const area = lead[allocation.scope];
    if (!area || !allocation.groups) return [];
    const group = allocation.groups.find(item => item.values.some(value =>
      String(value).replace(/市$/, '') === String(area).replace(/市$/, '')));
    return allocationRows(group?.allocation || allocation.fallback);
  };
  const seed = [...lead.association].reduce((hash, char) => (Math.imul(hash, 31) + char.codePointAt(0)) >>> 0, 0);
  const targets = matches.map(rule => {
    const rows = allocationRows(rule.allocation).filter(row => row.percent > 0);
    if (rows.reduce((total, row) => total + row.percent, 0) !== 100) return '';
    let point = seed % 100;
    return rows.find(row => (point -= row.percent) < 0)?.channel || '';
  });
  return resolveMaskedRoutingResult(matches, targets);
}

function resolveMaskedRoutingResult(matches, targets) {
  const rules = matches.map(({id, name, dimension, policyId}) => ({id, name, dimension, policyId}));
  if (!rules.length) return { state: 'unmatched', rules };
  if (targets.some(target => !target)) return { state: 'review', rules };
  if (new Set(targets).size > 1) return { state: 'conflict', rules };
  const [target] = targets;
  if (target === '人工外呼') return { state: 'manual', target, rules };
  if (target === 'AI外呼' || unifiedPolicyCallTypeOptions.includes(target)) return { state: 'ai', target, rules };
  return { state: 'review', rules };
}

async function publishMaskedIntakeRules(button) {
  const feedback = document.getElementById('maskedRoutingPublishStatus');
  button.disabled = true;
  try {
    const session = await fetch('/dcc/workspace/session', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({account: 'supervisor'})
    });
    if (!session.ok) throw new Error('本地联调会话不可用');
    const {token} = await session.json();
    const response = await fetch('/dcc/workspace/routing', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({rules: compileMaskedIntakeRules()})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || '发布失败');
    feedback.textContent = `已发布版本 ${result.version}，共 ${result.ruleCount} 条规则，后续确认接单时生效。`;
  } catch (error) {
    feedback.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

registerUiActionCallback('assignment-publish-masked-routing', publishMaskedIntakeRules);
