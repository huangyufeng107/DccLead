(() => {
  const shanghaiDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', dateStyle: 'short' });
  const shanghaiTime = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'medium' });
  const ago = minutes => shanghaiTime.format(Date.now() - minutes * 60000);
  const fromNow = minutes => new Date(Date.now() + minutes * 60000).toISOString();
  const plannedVisit = days => ({
    contactStatus: 'no_answer', result: 'callback', note: '已安排再次联系。',
    visitedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    nextVisitAt: shanghaiDate.format(Date.now() + 86400000 * days) + 'T14:00:00+08:00'
  });
  const followupSamples = [
    { name: '陈女士（演示）', owner: 'A001', assignedAt: '2026-11-23 09:20:00', series: 'DEMO-NEV-02', intentSeriesName: '新能源车系 B（演示）',
      manualFollowup: plannedVisit(0), privacy: { status: 'timeout', reason: '取号请求超时，需核对原请求结果。' } },
    { name: '何先生（演示）', owner: 'A002', assignedAt: ago(180), series: 'DEMO-NEV-01', intentSeriesName: '新能源车系 A（演示）',
      privacy: { status: 'available', availableAt: fromNow(-180), number: '170****6099', expiresAt: '2027-02-21 08:58:02' } },
    { name: '梁女士（演示）', owner: 'A001', assignedAt: '2026-11-23 09:24:00', series: 'DEMO-NEV-02', intentSeriesName: '新能源车系 B（演示）',
      manualFollowup: plannedVisit(-1), privacy: { status: 'expired', number: '170****6100', expiresAt: '2026-11-23 12:00:00' } },
    { name: '孙女士（演示）', owner: 'A001', assignedAt: ago(45), series: 'DEMO-NEV-01', intentSeriesName: '新能源车系 A（演示）',
      privacy: { status: 'available', availableAt: fromNow(-45), number: '170****6101', expiresAt: '2027-02-21 08:56:00' } },
    { name: '赵先生（演示）', owner: 'A001', assignedAt: '2026-11-23 09:28:00', series: 'DEMO-NEV-02', intentSeriesName: '新能源车系 B（演示）',
      manualFollowup: plannedVisit(2), privacy: { status: 'available', availableAt: '2026-11-23T09:28:00+08:00', number: '170****6102',
        expiresAt: shanghaiTime.format(Date.now() + 90 * 60000), expiresAtRaw: fromNow(90) } }
  ];
  const verificationSamples = [
    ['017', '林女士（核验演示）', 'pending', null, null],
    ['018', '吴先生（核验演示）', 'failed', null, 'invalid_number'],
    ['019', '郑女士（核验演示）', 'passed', 'pending_confirmation', null],
    ['020', '周先生（核验演示）', 'passed', 'accepted', null],
    ['021', '许女士（核验演示）', 'passed', null, null]
  ].map(([id, name, status, callbackStatus, reason]) => {
    const minutes = 25 + Number(id) - 17;
    const submittedAt = fromNow(-minutes);
    const maskedPhone = '138****90' + id.slice(-2);
    const noticeStatus = status === 'passed' ? (id === '019' ? 'pending_confirmation' : 'accepted') : null;
    return {
      id, name, entry: 'E3 日产总部抖音号', channel: 'R4', power: '新能源车', time: '09:30:00',
      status: 'accepted', owner: 'A001', assignedAt: ago(minutes + 20), verificationDemo: true,
      captureTime: ago(minutes + 25), series: 'DEMO-NEV-01', store: 'DEMO-STORE-B',
      privacy: {status: 'available', number: '170****61' + id.slice(-2), availableAt: fromNow(-minutes - 20),
        expiresAt: ago(-1440), expiresAtRaw: fromNow(1440)},
      manualFollowup: {contactStatus: 'connected', result: 'candidate', visitedAt: submittedAt, submittedBy: 'A001', submittedMaskedPhone: maskedPhone,
        intent: {carSeriesId: 'N7', storeId: 'DLR-GD-GZ-001'}},
      followupVerification: {candidateId: 'CAND-DEMO-R4-' + id, maskedPhone,
        submittedAt, carSeriesId: 'N7', storeId: 'DLR-GD-GZ-001', status, callbackStatus, noticeStatus, reason,
        receipt: callbackStatus === 'accepted' ? 'ACK-DEMO-R4-' + id : null},
      followupComplete: status === 'passed'
    };
  });
  const multiVisitIntent = {carSeriesId: 'N7', storeId: 'DLR-GD-GZ-001'};
  const multiVisitMaskedPhone = '138****9022';
  const multiVisitHistory = [
    {contactStatus: 'connected', result: 'candidate', visitedAt: fromNow(-8), submittedBy: 'A001',
      submittedMaskedPhone: multiVisitMaskedPhone, intent: multiVisitIntent,
      note: '客户确认意向为 N7 和广州东风日产天河店，同意提交手机号核验。'},
    {contactStatus: 'connected', result: 'callback', visitedAt: fromNow(-1440), nextVisitAt: fromNow(-8),
      submittedBy: 'A001', intent: multiVisitIntent, note: '客户改看 N7，希望在广州东风日产天河店了解试驾，约定下次回访。'},
    {contactStatus: 'no_answer', result: 'callback', visitedAt: fromNow(-2880), nextVisitAt: fromNow(-1440),
      submittedBy: 'A001', note: '首次外呼无人接听，安排次日再联系。'}
  ];
  const aiHandoffLead = {
    id: '022', original: 'DY-HQ-DEMO-022', name: '刘女士（AI 转人工演示）', entry: 'E3 日产总部抖音号', channel: 'R4', power: '新能源车',
    status: 'accepted', receivedAt: ago(2940), captureTime: ago(2945), series: 'DEMO-NEV-01', intentSeriesName: '新能源车系 A（演示）',
    intentionStore: 'DEMO-STORE-A', store: 'DEMO-STORE-B'
  };
  const multiVisitSample = {
    ...aiHandoffLead, id: '023', name: '刘女士（多次回访演示）', owner: 'A001',
    time: ago(2940).slice(11), assignedAt: ago(2910),
    privacy: {status: 'available', number: '170****6122', availableAt: fromNow(-2940),
      expiresAt: ago(-1440), expiresAtRaw: fromNow(1440)},
    manualFollowup: multiVisitHistory[0], manualFollowupHistory: multiVisitHistory,
    followupVerification: {candidateId: 'CAND-DEMO-R4-023', maskedPhone: multiVisitMaskedPhone,
      submittedAt: multiVisitHistory[0].visitedAt, ...multiVisitIntent, status: 'passed'},
    followupComplete: true
  };
  const headquarters = [
    { id: '005', entry: 'E4 日产店端抖音号', power: '燃油车', channel: 'R10', time: '09:18:20', status: 'failed', store: 'DEMO-STORE-B',
      reason: '总部任务存储暂不可用，未创建任务。' },
    { id: '004', entry: 'E2 广告投放抖音号', power: '新能源车', channel: '', time: '09:16:10', status: 'invalid', store: 'DEMO-STORE-B',
      poolChannel: 'R6', reason: '临时池派单报文缺少渠道编码，未创建任务。' },
    { id: '003', entry: 'E7 启辰抖店官方店', power: '新能源车', channel: 'R11', time: '09:14:30', status: 'recovered',
      name: '林女士（演示）', gender: '女', type: '新车', captureTime: '2026-11-23 09:12:40', intentionStore: 'DEMO-STORE-B',
      privacy: { number: '170****6093', expiresAt: '2027-02-21 09:14:32', status: 'available' },
      series: 'DEMO-NEV-01', intentSeriesName: '新能源车系 A（演示）', store: 'DEMO-STORE-B', reason: '总部已建单，临时池核对后取得原任务编号。' },
    { id: '002', entry: 'E3 日产总部抖音号', power: '新能源车', channel: 'R4', time: '09:10:05', status: 'replayed',
      name: '许先生（演示）', gender: '男', type: '新车', captureTime: '2026-11-23 09:07:36',
      privacy: { status: 'failed', reason: '模拟取号服务明确返回失败。' },
      series: '', store: 'DEMO-STORE-B', reason: '同一入池关联标识重推，沿用原任务。' },
    { id: '001', entry: 'E8 日产新能源经销商', power: '新能源车', channel: 'R6', time: '09:06:12', status: 'accepted',
      name: '周先生（演示）', gender: '男', type: '置换', captureTime: '2026-11-23 09:02:08', intentionStore: 'DEMO-STORE-A',
      privacy: { number: '170****6091', availableAt: fromNow(-25), expiresAt: '2027-02-21 09:06:14', status: 'available' },
      series: 'DEMO-NEV-01', intentSeriesName: '新能源车系 A（演示）', store: 'DEMO-STORE-A', owner: 'A001', assignedAt: ago(25),
      manualFollowup: {contactStatus: 'connected', result: 'candidate', visitedAt: fromNow(-12)} },
    { id: '006', entry: 'E3 日产总部抖音号', power: '新能源车', channel: 'R4', time: '08:45:05', status: 'accepted',
      privacy: { status: 'processing' }, bucket: 'old', previousAgent: 'A002', store: 'DEMO-STORE-B' },
    { id: '007', entry: 'E2 广告投放抖音号', power: '新能源车', channel: 'R6', time: '08:30:12', status: 'accepted',
      privacy: { status: 'expired', number: '170****6097', expiresAt: '2026-11-23 08:00:00' }, bucket: 'overdue', previousAgent: 'A001', store: 'DEMO-STORE-A' },
    ...Array.from({ length: 9 }, (_, index) => ({
      id: String(index + 8).padStart(3, '0'), entry: 'E3 日产总部抖音号', power: '新能源车',
      channel: 'R4', time: '08:' + String(59 - index).padStart(2, '0') + ':00', status: 'accepted', store: 'DEMO-STORE-B',
      ...followupSamples[index]
    })),
    ...verificationSamples,
    multiVisitSample
  ].map(sample => ({
    ...sample, receiver: 'NEV 总部 DCC', original: 'DY-HQ-DEMO-' + (sample.verificationDemo ? 'VERIFY-' : '') + sample.id, association: 'POOL-HQ-DEMO-' + sample.id,
    dispatch: 'DISPATCH-HQ-DEMO-' + sample.id, task: ['invalid', 'failed'].includes(sample.status) ? '' : 'DCC-DY-DEMO-' + sample.id
  }));
  const demoDate = '2026-11-23';
  const smartcodes = { R4: 'DEMO-SC-0401', R6: 'DEMO-SC-0601', R10: 'DEMO-SC-E4', R11: 'DEMO-SC-1101' };

  const stores = [
    {
      id: '101', entry: 'E4 日产店端抖音号', power: '燃油车', channel: 'R10', time: '09:19:20', status: 'accepted',
      store: 'DEMO-STORE-A', intentionStore: 'DEMO-STORE-A', series: 'DEMO-ICE-01', receiver: 'COC'
    },
    {
      id: '102', entry: 'E8 日产新能源经销商', power: '新能源车', channel: 'R6', time: '09:17:10', status: 'accepted',
      store: 'DEMO-STORE-B', intentionStore: 'DEMO-STORE-B', series: 'DEMO-NEV-01', receiver: 'NEV 线索中台'
    }
  ].map(sample => ({
    ...sample, original: 'DY-STORE-DEMO-' + sample.id, association: 'POOL-STORE-DEMO-' + sample.id,
    dispatch: 'DISPATCH-STORE-DEMO-' + sample.id, task: (sample.receiver === 'COC' ? 'COC-' : 'NEV-') + 'DEMO-' + sample.id
  }));
  const phone = row => '*******' + String(3090 + Number(row.id)).slice(-4);
  const smartcode = row => smartcodes[row.poolChannel || row.channel] || 'DEMO-SC-NEV-UNMAPPED';

  window.maskedLeadDemo = { headquarters, stores, aiHandoffLead, date: demoDate, phone, smartcode };
})();
