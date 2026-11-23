(() => {
  const headquarters = [
    { id: '005', entry: 'E4 日产店端抖音号', power: '燃油车', channel: 'R10', time: '09:18:20', status: 'failed', store: 'DEMO-STORE-B',
      reason: '总部任务存储暂不可用，未创建任务。' },
    { id: '004', entry: 'E2 广告投放抖音号', power: '新能源车', channel: '', time: '09:16:10', status: 'invalid', store: 'DEMO-STORE-B',
      poolChannel: 'R6', reason: '临时池派单报文缺少渠道编码，未创建任务。' },
    { id: '003', entry: 'E7 启辰抖店官方店', power: '新能源车', channel: 'R11', time: '09:14:30', status: 'recovered',
      name: '林女士（演示）', gender: '女', type: '新车', captureTime: '2026-11-23 09:12:40', intentionStore: 'DEMO-STORE-B',
      privacy: { number: '170****6093', expiresAt: '2027-02-21 09:14:32', status: '可用' },
      series: 'DEMO-NEV-01', intentSeriesName: '新能源车系 A（演示）', store: 'DEMO-STORE-B', reason: '总部已建单，临时池核对后取得原任务编号。' },
    { id: '002', entry: 'E3 日产总部抖音号', power: '新能源车', channel: 'R4', time: '09:10:05', status: 'replayed',
      name: '许先生（演示）', gender: '男', type: '新车', captureTime: '2026-11-23 09:07:36',
      privacy: { status: '取号失败' },
      series: '', store: 'DEMO-STORE-B', reason: '同一入池关联标识重推，沿用原任务。' },
    { id: '001', entry: 'E8 日产新能源经销商', power: '新能源车', channel: 'R6', time: '09:06:12', status: 'accepted',
      name: '周先生（演示）', gender: '男', type: '置换', captureTime: '2026-11-23 09:02:08', intentionStore: 'DEMO-STORE-A',
      privacy: { number: '170****6091', expiresAt: '2027-02-21 09:06:14', status: '可用' },
      series: 'DEMO-NEV-01', intentSeriesName: '新能源车系 A（演示）', store: 'DEMO-STORE-A', owner: 'A001', assignedAt: '2026-11-23 09:07:20', followupComplete: true },
    { id: '006', entry: 'E3 日产总部抖音号', power: '新能源车', channel: 'R4', time: '08:45:05', status: 'accepted',
      bucket: 'old', previousAgent: 'A002', store: 'DEMO-STORE-B' },
    { id: '007', entry: 'E2 广告投放抖音号', power: '新能源车', channel: 'R6', time: '08:30:12', status: 'accepted',
      bucket: 'overdue', previousAgent: 'A001', store: 'DEMO-STORE-A' },
    ...Array.from({ length: 9 }, (_, index) => ({
      id: String(index + 8).padStart(3, '0'), entry: 'E3 日产总部抖音号', power: '新能源车',
      channel: 'R4', time: '08:' + String(59 - index).padStart(2, '0') + ':00', status: 'accepted', store: 'DEMO-STORE-B'
    }))
  ].map(sample => ({
    ...sample, receiver: 'NEV 总部 DCC', original: 'DY-HQ-DEMO-' + sample.id, association: 'POOL-HQ-DEMO-' + sample.id,
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

  window.maskedLeadDemo = { headquarters, stores, date: demoDate, phone, smartcode };
})();
