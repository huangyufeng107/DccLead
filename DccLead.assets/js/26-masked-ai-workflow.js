/* 抖音掩码 AI 本地演示。状态和回执只保存在当前浏览器会话。 */
const maskedAiDemo = (() => {
  const actions = {
    new: [['dispatch', '派发首轮']],
    sent: [['receipt', '模拟接单回执']],
    missing: [['retry', '补发原子任务']],
    ready: [['call', '模拟外呼结果'], ['stop', '请求停拨']],
    verify: [['verify', '模拟临时池核验']],
    redial: [['dispatch', '派发计划重推'], ['stop', '取消计划重推']],
    stop: [['stopReceipt', '核对停拨回执']],
    stopped: [['return', '提交无号码退回']],
    returning: [['returnReceipt', '核对临时池接收回执']]
  };
  const choices = {
    receipt: { accepted: '已接单', missing: '确认未接单', unknown: '仍无法确认', rejected: '供应商拒收' },
    call: { candidate: '正常接通并取得候选号', unanswered: '无人接听', noNumber: '已接通但未取得号码', refused: '客户拒绝继续联系' },
    verify: { passed: '核验通过', failed: '明确核验不通过', unknown: '核验仍无结果' },
    finish: { '需人工跟进': '需人工跟进', '无需人工跟进': '无需人工跟进' },
    stopReceipt: { accepted: '确认已停止', unknown: '停拨结果仍待确认' },
    returnReceipt: { accepted: '确认已接收', unknown: '接收结果仍待确认' }
  };
  const state = () => ({
    phase: 'new', time: '13:30', notifications: [], retries: 0, doNotContact: false
  });
  const minutes = text => /^([01]\d|2[0-3]):[0-5]\d$/.test(text)
    ? Number(text.slice(0, 2)) * 60 + Number(text.slice(3)) : NaN;
  const hhmm = minute => String(Math.floor(minute / 60)).padStart(2, '0') + ':' + String(minute % 60).padStart(2, '0');
  const duration = value => (parseInt(value, 10) || 0) * (value.endsWith('天') ? 1440 : value.endsWith('小时') ? 60 : 1);
  const lastRound = item => item.rounds.at(-1);
  const deadline = item => minutes(item.expiry.slice(11, 16));

  function move(item, phase, status, result, exception = '') {
    item.flow.phase = phase;
    Object.assign(item, { status, result, exception });
  }

  function record(item, result) {
    item.events.push([item.flow.time, result]);
  }

  function available(item) {
    const flow = item.flow;
    const pending = flow.notifications.filter(event => !event.acknowledged)
      .map(event => ['ack:' + event.version, '确认接收 · ' + event.label]);
    if (['done', 'human'].includes(flow.phase)) return pending;
    const current = [...(actions[flow.phase] || [])];
    if (item.handoffTag && flow.phase === 'stopped' && lastRound(item)?.call && !flow.completedAt && !flow.doNotContact && !flow.verified) {
      current.unshift(['finish', '接收 AI 结束话单与标签']);
    }
    return [['advance', '推进演示时间'], ...current, ...pending];
  }

  function clock(item, time) {
    const flow = item.flow;
    const expiredAt = deadline(item);
    const now = minutes(time);
    flow.time = time;
    if (['done', 'human'].includes(flow.phase)) return;
    if (!item.rounds.length) {
      if (flow.phase === 'new' && now >= expiredAt) {
        flow.blockedAtExpiry = true;
        move(item, 'stopped', '主管待处理', '隐私号已失效，首轮任务未派发', '到期拦截');
        record(item, item.result);
      }
      return;
    }
    for (const [version, at, label] of [
      [1, expiredAt - 30, '隐私号即将失效'], [2, expiredAt, '隐私号已失效']
    ]) {
      if (now >= at && !flow.notifications.some(event => event.version === version)) {
        flow.notifications.push({ version, id: item.taskCode + '-privacy-' + version, label, time: hhmm(at), acknowledged: false });
        record(item, '发布「' + label + '」订阅事件');
      }
    }
    if (now < expiredAt || flow.expiryHandled) return;
    flow.expiryHandled = true;
    if (['ready', 'sent'].includes(flow.phase)) {
      flow.blockedAtExpiry = true;
      move(item, 'stop', '停拨待确认', '到期禁拨，等待供应商确认取消待拨任务', '停拨待确认');
    } else if (flow.phase === 'redial' || flow.phase === 'missing') {
      flow.blockedAtExpiry = true;
      move(item, 'stopped', '主管待处理', '隐私号已失效，计划外呼已取消', '到期拦截');
    } else if (flow.phase === 'verify') {
      record(item, '隐私号已失效，已提交候选继续核验');
      return;
    } else return;
    record(item, item.result);
  }

  function schedule(item, policy, title) {
    const used = item.rounds.filter(entry => entry.retry).length;
    const round = lastRound(item);
    const plan = policy ? Math.max(minutes(item.flow.time) + duration(policy.pushDelay),
      minutes(round.at) + duration(policy.redialInterval)) : Infinity;
    if (policy && used < parseInt(policy.redialCount, 10) && plan < deadline(item)) {
      item.flow.plannedAt = plan;
      move(item, 'redial', '待重推', '命中「' + title + '」，计划 ' + hhmm(plan) + ' 派发下一轮');
      return;
    }
    const reason = !policy ? '无启用的匹配重推配置' : used >= parseInt(policy.redialCount, 10)
      ? '重推次数已用尽' : '重推时间达到隐私号截止';
    const blockedByTime = Boolean(policy && used < parseInt(policy.redialCount, 10) && plan >= deadline(item));
    if (blockedByTime) item.flow.blockedAtExpiry = true;
    move(item, 'stopped', '主管待处理', reason + '，未创建后续子任务',
      blockedByTime ? '到期拦截' : '未取得号码');
  }

  function step(item, action, time, value, policies, context) {
    const flow = item.flow;
    const now = minutes(time);
    if (!Number.isFinite(now) || now < minutes(flow.time)) return '演示时间不能早于上一操作。';
    if (!available(item).some(([key]) => key === action)) return '当前状态不支持该操作。';
    if ((['receipt', 'retry', 'call', 'stopReceipt', 'finish'].includes(action) && context !== lastRound(item)?.id) ||
        (action === 'verify' && context !== lastRound(item)?.candidateId) ||
        (action === 'returnReceipt' && context !== flow.returnId)) return '回执关联标识已变更，旧回执未更新当前任务。';
    const options = choices[action];
    if (options && !Object.hasOwn(options, value)) return '请选择有效的回执或通话结果。';

    clock(item, time);
    if (action === 'advance') return '';
    if (!available(item).some(([key]) => key === action)) return '状态已随演示时间更新，请按当前状态处理。';
    const round = lastRound(item);

    if (action.startsWith('ack:')) {
      const version = Number(action.slice(4));
      const event = flow.notifications.find(entry => entry.version === version);
      event.acknowledged = true;
      record(item, '供应商确认接收「' + event.label + '」' +
        (version < flow.notifications.at(-1).version ? '，仍以最新失效状态为准' : ''));
      return '';
    }

    switch (action) {
      case 'dispatch': {
        if (now >= deadline(item)) return '隐私号已失效，无法派发。';
        if (flow.phase === 'redial' && now < flow.plannedAt) return '尚未到达重推计划时间。';
        const id = item.taskCode + '-' + String(item.rounds.length + 1).padStart(2, '0');
        item.rounds.push({ id, receipt: '待确认', dispatchedAt: time, retry: flow.phase === 'redial' });
        move(item, 'sent', '接单待核对', '已派发 ' + id + '，等待模拟供应商接单回执', '接单待核对');
        break;
      }
      case 'receipt':
        if (value === 'unknown') {
          item.result = '接单结果仍待核对，禁止补发';
        } else if (value === 'accepted') {
          round.receipt = '已接单';
          move(item, 'ready', '待外呼', '已收到供应商接单回执');
        } else {
          round.receipt = choices.receipt[value];
          move(item, value === 'missing' ? 'missing' : 'stopped', value === 'missing' ? '待补发' : '主管待处理', round.receipt,
            value === 'missing' ? '确认未接单' : '供应商拒收');
        }
        break;
      case 'retry':
        if (now >= deadline(item)) return '隐私号已失效，无法补发。';
        flow.retries += 1;
        round.receipt = '待确认';
        move(item, 'sent', '接单待核对', '已按原子任务号 ' + round.id + ' 补发，等待模拟接单回执', '接单待核对');
        break;
      case 'call':
        if (now >= deadline(item)) return '隐私号已失效，无法拨号。';
        Object.assign(round, { call: round.id + '-CALL', at: time, contact: choices.call[value] });
        if (value === 'candidate') {
          Object.assign(round, { candidateId: round.id + '-CANDIDATE', candidate: '139****4588', verification: '核验中' });
          item.verification = '核验中';
          move(item, 'verify', '核验中', '本轮候选号已送临时池，暂停待拨与重拨');
        } else if (value === 'refused') {
          flow.doNotContact = true;
          move(item, 'stop', '停拨待确认', '已记录客户拒绝继续联系，等待停拨回执', '停拨待确认');
        } else if (value === 'unanswered' && policies.unanswered) {
          schedule(item, policies.unanswered, '无人接听');
        } else {
          move(item, 'stopped', '主管待处理', choices.call[value] + '，可核对下一处理方', '未取得号码');
        }
        break;
      case 'verify':
        if (value === 'unknown') {
          item.result = '临时池核验仍无结果，保留原候选提交';
        } else if (value === 'passed') {
          round.verification = item.verification = '核验通过';
          flow.verified = true;
          move(item, 'done', '已完成', '临时池核验通过，DCC 结案；合格回传继续独立核对', '回传待核对');
        } else {
          round.verification = item.verification = '核验不通过';
          schedule(item, policies.verification, '掩码核验不通过');
        }
        break;
      case 'stop':
        if (flow.phase === 'redial') {
          move(item, 'stopped', '主管待处理', '未派发的计划重推已取消');
        } else {
          move(item, 'stop', '停拨待确认', '停拨指令已提交，等待模拟供应商确认', '停拨待确认');
        }
        break;
      case 'stopReceipt':
        if (value === 'accepted') {
          move(item, 'stopped', '已停拨', '供应商确认已停止待拨与重拨');
        } else {
          item.result = '停拨回执仍待核对，人工暂不可接手';
        }
        break;
      case 'finish':
        round.tag = value;
        flow.completedAt = `${item.date} ${time}:00`;
        record(item, 'AI 外呼结束，收到话单标签「' + value + '」');
        if (value === item.handoffTag && now < deadline(item)) {
          flow.manualOrder = { taskId: item.manualTaskId, generatedAt: `${item.date} ${time}:01` };
          move(item, 'human', '转人工待分配', '话单标签命中，已生成人工工单');
        } else {
          move(item, 'stopped', '主管待处理', now >= deadline(item) ? '隐私号已到期，待确认后续去向' : '标签未命中转人工规则');
        }
        break;
      case 'return':
        flow.returnId = item.taskCode + '-RETURN';
        move(item, 'returning', '退回待核对', '已提交无号码退回，等待临时池接收回执' +
          (flow.doNotContact ? '，随单保留拒绝联系限制' : ''), '退回待核对');
        break;
      case 'returnReceipt':
        if (value === 'accepted') {
          item.returned = true;
          move(item, 'done', '已完成', '临时池确认接收无号码退回，DCC 结案');
        } else {
          item.result = '临时池接收结果仍待核对，任务继续保留';
        }
        break;
    }
    record(item, item.result);
    return '';
  }

  function dispatchFields(item) {
    return {
      dccTaskId: item.taskCode,
      aiTaskId: lastRound(item)?.id || item.taskCode + '-01',
      privacyBindingId: item.taskCode + '-PRIVACY',
      relayReference: 'DEMO-RELAY-008',
      privacyExpiresAt: item.expiry.replace(' ', 'T') + '+08:00'
    };
  }

  return { state, choices, available, step, dispatchFields };
})();
