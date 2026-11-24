(() => {
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const defaults = {firstWarning: 30, firstOverdue: 120, idle: 1440, expiry: 1440, urgentExpiry: 120};
  const settingsKey = 'dcc.masked-monitoring.settings';
  const validSettings = values => values && Object.keys(defaults).every(key =>
    Number.isSafeInteger(values[key]) && values[key] > 0 && values[key] <= 525600
  ) && values.firstWarning < values.firstOverdue && values.urgentExpiry < values.expiry;

  function settings() {
    try {
      const saved = JSON.parse(localStorage.getItem(settingsKey));
      if (validSettings(saved)) return saved;
    } catch { /* 文件模式可能禁止访问本机存储。 */ }
    return {...defaults};
  }

  function saveSettings(values) {
    if (!validSettings(values)) return false;
    try {
      localStorage.setItem(settingsKey, JSON.stringify(values));
      return true;
    } catch {
      return false;
    }
  }
  const types = {
    first: '首跟超时', waiting: '待首跟提醒', callback: '回访逾期', idle: '长时间未跟进',
    expiry: '即将失效', expired: '隐私号已失效', blocked: '取号异常'
  };
  const timestamp = value => /^\d{4}-\d{2}-\d{2} \d{2}:/.test(value || '')
    ? Date.parse(value.replace(' ', 'T') + '+08:00') : typeof value === 'number' ? value : Date.parse(value);

  // 原型统一演示上海时间 09:00–18:00，正式环境使用实际坐席排班。
  const shanghaiDay = value => Math.floor((value + 8 * hour) / day) * day - 8 * hour;
  const nextShiftStart = value => {
    const start = shanghaiDay(value) + 9 * hour;
    if (value < start) return start;
    return value < start + 9 * hour ? value : start + day;
  };
  const elapsedOnShift = (start, end) => {
    const signedTime = value => {
      const midnight = shanghaiDay(value);
      return (midnight / day) * 9 * hour + Math.min(9 * hour, Math.max(0, value - midnight - 9 * hour));
    };
    return Math.max(0, signedTime(end) - signedTime(start));
  };

  function privacyAlert(row, now, state, limits = settings()) {
    const expiry = timestamp(row.privacy?.expiresAtRaw || row.privacy?.expiresAt);
    if (row.followupComplete) return null;
    if (state === 'expired' || expiry <= now) return {type: 'expired', priority: 0, at: expiry};
    if (state === 'available' && expiry - now <= limits.expiry * minute) {
      return {type: 'expiry', priority: expiry - now <= limits.urgentExpiry * minute ? 0 : 2, at: expiry};
    }
    return null;
  }

  function followupTimes(row) {
    const history = row.manualFollowupHistory || (row.manualFollowup ? [row.manualFollowup] : []);
    const visits = history.filter(visit => visit.contactStatus && visit.contactStatus !== 'not_called')
      .map(visit => timestamp(visit.visitedAt)).filter(Number.isFinite);
    const first = [timestamp(row.firstFollowupAt), ...visits].filter(Number.isFinite);
    return {first: first.length ? Math.min(...first) : NaN, last: visits.length ? Math.max(...visits) : NaN};
  }

  function task(row, now, privacyStatus, limits = settings()) {
    const assigned = timestamp(row.assignedAtRaw || row.assignedAt);
    const ready = timestamp(row.privacy?.availableAt);
    const expiry = timestamp(row.privacy?.expiresAtRaw || row.privacy?.expiresAt);
    const state = Number.isFinite(expiry) && expiry <= now ? 'expired' : privacyStatus;
    const {first, last} = followupTimes(row);
    const start = Number.isFinite(assigned) && Number.isFinite(ready) ? nextShiftStart(Math.max(assigned, ready)) : NaN;
    const latency = Number.isFinite(first) && Number.isFinite(start) ? elapsedOnShift(start, first) : NaN;
    const task = {row, now, state, assigned, start, latency, first, last, expiry, waiting: elapsedOnShift(start, now), alerts: []};
    const privacyRisk = privacyAlert(row, now, state, limits);
    if (privacyRisk) task.alerts.push(privacyRisk);
    if (row.followupComplete || ['pending', 'timed_out', 'passed'].includes(row.followupVerification?.status)) return task;
    const add = (type, priority, at) => task.alerts.push({type, priority, at});
    if (['failed', 'timeout', 'not_received'].includes(state)) add('blocked', 1);
    if (state !== 'available') return task;

    const planned = timestamp(row.manualFollowup?.nextVisitAt);
    if (Number.isFinite(planned)) {
      if (planned <= now) add('callback', 1, planned);
    } else if (!Number.isFinite(first) && Number.isFinite(start)) {
      if (task.waiting >= limits.firstOverdue * minute) add('first', 1, start);
      else if (task.waiting >= limits.firstWarning * minute) add('waiting', 3, start);
    } else if (Number.isFinite(last) && now - last >= limits.idle * minute) {
      add('idle', 2, last + limits.idle * minute);
    }
    return task;
  }

  function efficiency(tasks, now, dayOf, limits = settings()) {
    const today = dayOf(now);
    const cohort = tasks.filter(item => Number.isFinite(item.start) && item.start <= now && dayOf(item.start) === today);
    const eligible = cohort.filter(item => Number.isFinite(item.latency) || item.waiting >= limits.firstWarning * minute);
    const times = cohort.map(item => item.latency).filter(Number.isFinite).sort((a, b) => a - b);
    const middle = Math.floor(times.length / 2);
    return {
      rate: eligible.length ? Math.round(100 * eligible.filter(item => item.latency <= limits.firstWarning * minute).length / eligible.length) : null,
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

  window.maskedMonitoring = { task, efficiency, types, duration, privacyAlert, settings, saveSettings, validSettings, timestamp };
})();
