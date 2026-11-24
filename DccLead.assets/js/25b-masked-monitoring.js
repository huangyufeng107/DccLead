(() => {
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const thresholds = { firstWarning: 30 * minute, firstOverdue: 2 * hour, idle: day, expiry: day, urgentExpiry: 2 * hour };
  const types = {
    first: '首跟超时', waiting: '待首跟提醒', callback: '回访逾期', idle: '长时间未跟进',
    expiry: '即将失效', expired: '隐私号已失效', blocked: '取号异常'
  };
  const timestamp = value => /^\d{4}-\d{2}-\d{2} \d{2}:/.test(value || '')
    ? Date.parse(value.replace(' ', 'T') + '+08:00') : Date.parse(value);

  function followupTimes(row) {
    const history = row.manualFollowupHistory || (row.manualFollowup ? [row.manualFollowup] : []);
    const visits = history.filter(visit => visit.contactStatus && visit.contactStatus !== 'not_called')
      .map(visit => timestamp(visit.visitedAt)).filter(Number.isFinite);
    const first = [timestamp(row.firstFollowupAt), ...visits].filter(Number.isFinite);
    return {first: first.length ? Math.min(...first) : NaN, last: visits.length ? Math.max(...visits) : NaN};
  }

  function task(row, now, privacyStatus) {
    const assigned = timestamp(row.assignedAt);
    const ready = timestamp(row.privacy?.availableAt);
    const expiry = timestamp(row.privacy?.expiresAtRaw || row.privacy?.expiresAt);
    const state = Number.isFinite(expiry) && expiry <= now ? 'expired' : privacyStatus;
    const {first, last} = followupTimes(row);
    const start = Number.isFinite(assigned) && Number.isFinite(ready) ? Math.max(assigned, ready) : NaN;
    const latency = Number.isFinite(first) && Number.isFinite(start) ? Math.max(0, first - start) : NaN;
    const task = {row, now, state, assigned, start, latency, first, last, expiry, alerts: []};
    if (row.followupComplete || ['pending', 'timed_out', 'passed'].includes(row.followupVerification?.status)) return task;
    const add = (type, priority, at) => task.alerts.push({type, priority, at});
    if (state === 'expired') add('expired', 0, expiry);
    if (['failed', 'timeout', 'not_received'].includes(state)) add('blocked', 1);
    if (state !== 'available') return task;

    if (Number.isFinite(expiry) && expiry - now <= thresholds.expiry) {
      add('expiry', expiry - now <= thresholds.urgentExpiry ? 0 : 2, expiry);
    }
    const planned = timestamp(row.manualFollowup?.nextVisitAt);
    if (Number.isFinite(planned)) {
      if (planned <= now) add('callback', 1, planned);
    } else if (!Number.isFinite(first) && Number.isFinite(start)) {
      if (now - start >= thresholds.firstOverdue) add('first', 1, start + thresholds.firstOverdue);
      else if (now - start >= thresholds.firstWarning) add('waiting', 3, start + thresholds.firstWarning);
    } else if (Number.isFinite(last) && now - last >= thresholds.idle) {
      add('idle', 2, last + thresholds.idle);
    }
    return task;
  }

  function efficiency(tasks, now, dayOf) {
    const today = dayOf(now);
    const cohort = tasks.filter(item => Number.isFinite(item.start) && item.start <= now && dayOf(item.start) === today);
    const eligible = cohort.filter(item => Number.isFinite(item.latency) || now - item.start >= thresholds.firstWarning);
    const times = cohort.map(item => item.latency).filter(Number.isFinite).sort((a, b) => a - b);
    const middle = Math.floor(times.length / 2);
    return {
      rate: eligible.length ? Math.round(100 * eligible.filter(item => item.latency <= thresholds.firstWarning).length / eligible.length) : null,
      sample: eligible.length,
      median: times.length ? (times[middle] + times[Math.floor((times.length - 1) / 2)]) / 2 : NaN,
      awaiting: tasks.filter(item => !item.row.followupComplete && !Number.isFinite(item.first) && item.state === 'available').length,
      alerts: tasks.filter(item => item.alerts.length).length
    };
  }

  function duration(ms) {
    if (!Number.isFinite(ms)) return '—';
    const minutes = Math.floor(Math.abs(ms) / minute);
    const hours = Math.floor(minutes / 60);
    if (hours >= 24) return Math.floor(hours / 24) + ' 天 ' + hours % 24 + ' 小时';
    if (hours) return hours + ' 小时 ' + minutes % 60 + ' 分';
    return minutes ? minutes + ' 分钟' : '不足 1 分钟';
  }

  window.maskedMonitoring = { task, efficiency, types, duration };
})();
