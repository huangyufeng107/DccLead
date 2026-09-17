/**
 * DCC培育平台 - 运营报表 (100% 完整复刻版)
 * 包含 8 大核心子报表模块：
 * 1. 总部培育报表 (renderOpsHqNurtureReportPage)
 * 2. 录音列表 (renderOpsRecordingListPage)
 * 3. 批量下发 (renderOpsBatchDispatchPage)
 * 4. 总部NEV日报 (renderOpsHqNevDailyPage)
 * 5. AI渠道质量日报 (renderOpsAiChannelQualityDailyPage)
 * 6. 人工坐席工单 (renderOpsManualWorkordersPage)
 * 7. 坐席业绩看板 (renderOpsSeatDashboard)
 * 8. 下载列表 (renderOpsDownloadListPage)
 */

/* ==================== 1. 总部培育报表 模块 ==================== */
let opsHqNurtureActiveTab = 'callTaskDetail';
let opsHqNurtureFilter = {
  keyword: '',
  followStatus: '',
  assignType: '',
  agentAccount: '',
  seriesCode: '',
  startDate: '2026-08-01',
  endDate: '2026-09-16'
};

const opsHqNurtureMockData = [
  { index: 1, taskId: 'TASK20260916001', leadId: 'CLUE1883735719', channelR: 'R6-总部新媒体', customerName: '张先生', phone: '13812345678', intentSeries: '2026款探陆', latestSeries: '2026款探陆 旗舰版', followStatus: '跟进中', followCount: 4, taskType: '人工外呼', initialStatus: '培育中', initialLevel: 'H', assignType: '首次分配', assignTime: '2026-09-16 09:30:00', agentAccount: '电销D组张敏', store: '广州天河专营店', notes: '客户关注置换补贴及金融0息政策，预约本周六试驾。' },
  { index: 2, taskId: 'TASK20260916002', leadId: 'CLUE1883735720', channelR: 'R1-官网预约', customerName: '李女士', phone: '15988889999', intentSeries: 'N6', latestSeries: 'N6 智驾版', followStatus: '已完成', followCount: 6, taskType: '预外呼', initialStatus: '待分配', initialLevel: 'A', assignType: '首次分配', assignTime: '2026-09-16 10:15:20', agentAccount: '电销A组李雷', store: '上海浦东专营店', notes: '已协助下发意向专营店到店试驾，下发编号 DF2026091609.' },
  { index: 3, taskId: 'TASK20260916003', leadId: 'CLUE1883735721', channelR: 'R3-车展留资', customerName: '王先生', phone: '18677776666', intentSeries: 'N7', latestSeries: 'N7 旗舰款', followStatus: '待跟进', followCount: 1, taskType: '人工外呼', initialStatus: '待跟进', initialLevel: 'B', assignType: '重新分配', assignTime: '2026-09-16 11:00:15', agentAccount: '电销B组王五', store: '北京朝阳专营店', notes: '原坐席请假，系统重分至王五，计划今天下午二次外呼。' },
  { index: 4, taskId: 'TASK20260916004', leadId: 'CLUE1883735722', channelR: 'R2-垂媒引流', customerName: '赵先生', phone: '13566665555', intentSeries: 'NX8', latestSeries: 'NX8 豪华版', followStatus: '已完成', followCount: 5, taskType: '预外呼', initialStatus: '培育中', initialLevel: 'H', assignType: '首次分配', assignTime: '2026-09-16 13:20:00', agentAccount: '电销C组赵六', store: '深圳福田专营店', notes: '客户对比竞品汉EV，重点沟通三电终身质保权益。' },
  { index: 5, taskId: 'TASK20260916005', leadId: 'CLUE1883735723', channelR: 'R6-总部新媒体', customerName: '陈女士', phone: '13911112222', intentSeries: '轩逸', latestSeries: '轩逸 超混电驱', followStatus: '暂缓', followCount: 2, taskType: '人工外呼', initialStatus: '暂缓', initialLevel: 'C', assignType: '首次分配', assignTime: '2026-09-16 14:45:00', agentAccount: '电销D组张敏', store: '成都高新专营店', notes: '客户出差中，约定下周一再回访。' }
];

function renderOpsHqFilterFields(tabKey) {
  if (tabKey === 'infoNotFullDetail') {
    return `
      <!-- 留资未满任务明细 4列全网格筛选条件 (28项字段 1:1 对齐) -->
      <!-- 第 1 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        任务编码：
        <input class="form-input" id="hqFilterNfTaskCode" placeholder="请输入任务编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        线索编码：
        <input class="form-input" id="hqFilterNfLeadCode" placeholder="请输入线索编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        客户姓名：
        <input class="form-input" id="hqFilterNfCustName" placeholder="请输入客户姓名" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        联系电话：
        <input class="form-input" id="hqFilterNfCustTel" placeholder="请输入联系电话" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>

      <!-- 第 2 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        线索R渠道：
        <select class="form-input" id="hqFilterNfChannel" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部渠道</option>
          <option value="R1-官网预约">R1-官网预约</option>
          <option value="R2-垂媒引流">R2-垂媒引流</option>
          <option value="R3-车展留资">R3-车展留资</option>
          <option value="R6-总部新媒体">R6-总部新媒体</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        意向车系：
        <select class="form-input" id="hqFilterNfSeries" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部车系</option>
          <option value="2026款探陆">2026款探陆</option>
          <option value="N6">N6</option>
          <option value="N7">N7</option>
          <option value="NX8">NX8</option>
          <option value="轩逸">轩逸</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        最新意向车系：
        <select class="form-input" id="hqFilterNfLatestSeries" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="探陆 380T 旗舰版">探陆 380T 旗舰版</option>
          <option value="N6 550km 智驭版">N6 550km 智驭版</option>
          <option value="N7 620km 激光雷达版">N7 620km 激光雷达版</option>
          <option value="NX8 旗舰四驱版">NX8 旗舰四驱版</option>
          <option value="轩逸 超混电驱 双擎版">轩逸 超混电驱 双擎版</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        跟进状态：
        <select class="form-input" id="hqFilterNfFollowStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部状态</option>
          <option value="跟进中">跟进中</option>
          <option value="已完成">已完成</option>
          <option value="待跟进">待跟进</option>
          <option value="暂缓">暂缓</option>
        </select>
      </label>

      <!-- 第 3 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        任务类型：
        <select class="form-input" id="hqFilterNfTaskType" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部类型</option>
          <option value="人工外呼">人工外呼</option>
          <option value="AI智能外呼">AI智能外呼</option>
          <option value="预外呼">预外呼</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        初始线索状态：
        <select class="form-input" id="hqFilterNfInitClueStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="待分配">待分配</option>
          <option value="待跟进">待跟进</option>
          <option value="培育中">培育中</option>
          <option value="暂缓">暂缓</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        初始意向级别：
        <select class="form-input" id="hqFilterNfInitLevel" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">请选择</option>
          ${['H', 'A', 'B', 'C', 'L', 'F', 'Z', 'O', 'T', 'D'].map(lvl => `<option value="${lvl}">${lvl}级</option>`).join('')}
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        最新意向级别：
        <select class="form-input" id="hqFilterNfLatestLevel" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">请选择</option>
          ${['H', 'A', 'B', 'C', 'L', 'F', 'Z', 'O', 'T', 'D'].map(lvl => `<option value="${lvl}">${lvl}级</option>`).join('')}
        </select>
      </label>

      <!-- 第 4 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        分配类型：
        <select class="form-input" id="hqFilterNfAssignType" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="首次分配">首次分配</option>
          <option value="重新分配">重新分配</option>
          <option value="自动分配">自动分配</option>
          <option value="手动分配">手动分配</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        分配账号：
        <input class="form-input" id="hqFilterNfAssignAccount" placeholder="请输入坐席工号/姓名" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        分配时间：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-16" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        最新跟进时间：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-16" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>

      <!-- 第 5 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        接收时间：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-16" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        计划下次回访时间：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-30" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        最新接触状态：
        <select class="form-input" id="hqFilterNfTouchStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="用户接通">用户接通</option>
          <option value="无人接听">无人接听</option>
          <option value="忙音/拒接">忙音/拒接</option>
          <option value="关机/停机">关机/停机</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        最新回访结果：
        <select class="form-input" id="hqFilterNfReturnResult" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部结果</option>
          <option value="成功补全信息并预约试驾">成功补全信息并预约试驾</option>
          <option value="补全姓名车系-意向推进">补全姓名车系-意向推进</option>
          <option value="仅补全电话-待二次回访">仅补全电话-待二次回访</option>
          <option value="预约到店试驾">预约到店试驾</option>
          <option value="客户暂无购车意愿">客户暂无购车意愿</option>
        </select>
      </label>

      <!-- 第 6 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        是否逾期：
        <select class="form-input" id="hqFilterNfIsOverdue" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="是">是</option>
          <option value="否">否</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        超期状态：
        <select class="form-input" id="hqFilterNfOverdueStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="正常">正常</option>
          <option value="临期">临期</option>
          <option value="超期">超期</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        及时首触：
        <select class="form-input" id="hqFilterNfPromptFirstTouch" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="是">是</option>
          <option value="否">否</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        人工手动下发：
        <select class="form-input" id="hqFilterNfManualDispatch" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="是">是</option>
          <option value="否">否</option>
        </select>
      </label>

      <!-- 第 7 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        推送到预外呼状态：
        <select class="form-input" id="hqFilterNfPushPreCall" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="已收到外呼反馈">已收到外呼反馈</option>
          <option value="待推送">待推送</option>
          <option value="推送中">推送中</option>
          <option value="推送失败">推送失败</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        试驾排程：
        <select class="form-input" id="hqFilterNfTestDriveScheduled" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="已预约">已预约</option>
          <option value="未预约">未预约</option>
          <option value="排程下发">排程下发</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        初始线索来源：
        <select class="form-input" id="hqFilterNfInitialSource" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部来源</option>
          <option value="抖音留资表单">抖音留资表单</option>
          <option value="微信公众号">微信公众号</option>
          <option value="官网预约页">官网预约页</option>
          <option value="车展扫码">车展扫码</option>
          <option value="懂车帝App">懂车帝App</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        线索来源平台：
        <select class="form-input" id="hqFilterNfLeadPlatform" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部平台</option>
          <option value="总部新媒体平台">总部新媒体平台</option>
          <option value="东风日产官网">东风日产官网</option>
          <option value="车展营销系统">车展营销系统</option>
          <option value="懂车帝平台">懂车帝平台</option>
        </select>
      </label>
    `;
  }

  if (tabKey === 'messageRecord') {
    return `
      <!-- 短信记录 4列全网格筛选条件 (10项字段与业务定义 1:1 精确对齐) -->
      <!-- 第 1 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        任务编码：
        <input class="form-input" id="hqFilterMsgTaskCode" placeholder="请输入任务编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        发送手机：
        <input class="form-input" id="hqFilterMsgPhone" placeholder="请输入发送手机号" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        引用模版名称：
        <select class="form-input" id="hqFilterMsgTemplate" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部模版</option>
          <option value="预约到店试驾确认模板">预约到店试驾确认模板</option>
          <option value="试驾邀约关怀模板">试驾邀约关怀模板</option>
          <option value="未接通关怀短信模板">未接通关怀短信模板</option>
          <option value="置换补贴专项优惠模板">置换补贴专项优惠模板</option>
          <option value="试驾满意度回访模板">试驾满意度回访模板</option>
          <option value="新车上市品鉴权益模板">新车上市品鉴权益模板</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        发送状态：
        <select class="form-input" id="hqFilterMsgSendStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部状态</option>
          <option value="发送成功">发送成功</option>
          <option value="发送失败">发送失败</option>
          <option value="发送中">发送中</option>
          <option value="待发送">待发送</option>
        </select>
      </label>

      <!-- 第 2 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        发送坐席账号：
        <select class="form-input" id="hqFilterMsgAgent" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部坐席</option>
          <option value="电销A组-李雷">电销A组-李雷 (HQ_AGENT_02)</option>
          <option value="电销B组-王五">电销B组-王五 (HQ_AGENT_03)</option>
          <option value="电销C组-赵六">电销C组-赵六 (HQ_AGENT_04)</option>
          <option value="电销D组-张敏">电销D组-张敏 (HQ_AGENT_01)</option>
          <option value="系统自动推送">系统自动推送 (SYS_AUTO)</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        回复状态：
        <select class="form-input" id="hqFilterMsgReplyStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="已回复">已回复</option>
          <option value="未回复">未回复</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        创建时间：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-16" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        发送时间：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-16" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>

      <!-- 第 3 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        回复时间：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-16" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500; grid-column:span 2;">
        短信内容关键字：
        <input class="form-input" id="hqFilterMsgContentKey" placeholder="请输入短信正文关键字模糊匹配" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <div></div>
    `;
  }

  if (tabKey === 'testDriveDetail') {
    return `
      <!-- 预约试驾明细 4列全网格筛选条件 (32项字段 1:1 对齐) -->
      <!-- 第 1 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        预约试驾编码：
        <input class="form-input" id="hqFilterTdCode" placeholder="请输入预约试驾编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        预约单号：
        <input class="form-input" id="hqFilterBookingNo" placeholder="请输入预约单号" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        客户姓名：
        <input class="form-input" id="hqFilterCustName" placeholder="请输入客户姓名" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        联系电话：
        <input class="form-input" id="hqFilterCustTel" placeholder="请输入联系电话" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>

      <!-- 第 2 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        试驾专营店：
        <select class="form-input" id="hqFilterTdStore" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部专营店</option>
          <option value="广州天河专营店">广州天河专营店</option>
          <option value="上海浦东专营店">上海浦东专营店</option>
          <option value="北京朝阳专营店">北京朝阳专营店</option>
          <option value="深圳福田专营店">深圳福田专营店</option>
          <option value="成都高新专营店">成都高新专营店</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        试驾车系：
        <select class="form-input" id="hqFilterTdSeries" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部车系</option>
          <option value="2026款探陆">2026款探陆</option>
          <option value="N6">N6</option>
          <option value="N7">N7</option>
          <option value="NX8">NX8</option>
          <option value="轩逸">轩逸</option>
          <option value="天籁">天籁</option>
          <option value="奇骏">奇骏</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        试驾类型：
        <select class="form-input" id="hqFilterDriveType" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部类型</option>
          <option value="普通到店试驾">普通到店试驾</option>
          <option value="店内深度试驾">店内深度试驾</option>
          <option value="上门试驾">上门试驾</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        预约试驾日期：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-30" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>

      <!-- 第 3 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        人工任务编码：
        <input class="form-input" id="hqFilterManualTaskCode" placeholder="请输入人工任务编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        培育线索编码：
        <input class="form-input" id="hqFilterClueCode" placeholder="请输入培育线索编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        试驾排程编码：
        <input class="form-input" id="hqFilterScheduleCode" placeholder="请输入试驾排程编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        最新留资车系：
        <select class="form-input" id="hqFilterTdLastSeries" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">请选择</option>
          <option value="探陆 380T 旗舰版">探陆 380T 旗舰版</option>
          <option value="N6 550km 智驭版">N6 550km 智驭版</option>
          <option value="N7 620km 激光雷达版">N7 620km 激光雷达版</option>
          <option value="NX8 旗舰四驱版">NX8 旗舰四驱版</option>
          <option value="轩逸 超混电驱 双擎版">轩逸 超混电驱 双擎版</option>
        </select>
      </label>

      <!-- 第 4 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        试驾状态：
        <select class="form-input" id="hqFilterDriveStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部状态</option>
          <option value="待履约">待履约</option>
          <option value="已履约">已履约</option>
          <option value="已取消">已取消</option>
          <option value="履约中">履约中</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        是否重排：
        <select class="form-input" id="hqFilterIsRescheduled" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="是">是</option>
          <option value="否">否</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        重排日期：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-30" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        重排车系：
        <select class="form-input" id="hqFilterRescheduleSeries" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部车系</option>
          <option value="2026款探陆">2026款探陆</option>
          <option value="N6">N6</option>
          <option value="N7">N7</option>
          <option value="NX8">NX8</option>
        </select>
      </label>

      <!-- 第 5 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        排程提交时间：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-16" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        试驾排程创建时间：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-16" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        是否逾期取消：
        <select class="form-input" id="hqFilterIsOverdueCancel" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="是">是</option>
          <option value="否">否</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        取消标签：
        <select class="form-input" id="hqFilterCancelTag" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="时间冲突">时间冲突</option>
          <option value="临时出差">临时出差</option>
          <option value="距离过远">距离过远</option>
          <option value="竞品已购">竞品已购</option>
          <option value="暂无购车意愿">暂无购车意愿</option>
        </select>
      </label>

      <!-- 第 6 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        跟进顾问：
        <input class="form-input" id="hqFilterAdvisor" placeholder="请输入销售顾问姓名" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        门店是否跟进：
        <select class="form-input" id="hqFilterIsStoreFollowed" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="是">是</option>
          <option value="否">否</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        门店跟进状态：
        <select class="form-input" id="hqFilterStoreFollowStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="待联系">待联系</option>
          <option value="已联系邀约">已联系邀约</option>
          <option value="重排已确认">重排已确认</option>
          <option value="已接待试驾">已接待试驾</option>
          <option value="已取消试驾">已取消试驾</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        门店跟进时间：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-16" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>

      <!-- 第 7 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        当前线索最新状态：
        <select class="form-input" id="hqFilterCurrentLeadStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部状态</option>
          <option value="待分配">待分配</option>
          <option value="培育中">培育中</option>
          <option value="待到店试驾">待到店试驾</option>
          <option value="已到店试驾">已到店试驾</option>
          <option value="已试驾洽谈中">已试驾洽谈中</option>
          <option value="已战败">已战败</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        最新门店跟进时间：
        <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
          <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
          <span style="color:#94a3b8; font-size:12px;">→</span>
          <input class="form-input" type="date" value="2026-09-16" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        </div>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        坐席账号：
        <input class="form-input" id="hqFilterAgentAccount" placeholder="请输入坐席账号" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        总部是否跟进：
        <select class="form-input" id="hqFilterIsHqFollowed" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="是">是</option>
          <option value="否">否</option>
        </select>
      </label>

      <!-- 第 8 行 (4列) -->
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        接触状态：
        <select class="form-input" id="hqFilterContactStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部状态</option>
          <option value="成功接通">成功接通</option>
          <option value="无人接听">无人接听</option>
          <option value="拒接">拒接</option>
          <option value="关机/停机">关机/停机</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        电销回访初始状态：
        <select class="form-input" id="hqFilterTeleInitialStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部</option>
          <option value="待联系">待联系</option>
          <option value="已派单">已派单</option>
          <option value="培育中">培育中</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        回访结果：
        <select class="form-input" id="hqFilterVisitResult" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部结果</option>
          <option value="意向高-推进购车订金">意向高-推进购车订金</option>
          <option value="深度意向-申请专属礼包">深度意向-申请专属礼包</option>
          <option value="重排确认">重排确认</option>
          <option value="预约取消-待节后跟进">预约取消-待节后跟进</option>
        </select>
      </label>
      <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
        试驾回访跟进状态：
        <select class="form-input" id="hqFilterDriveVisitFollowStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
          <option value="">全部状态</option>
          <option value="已办结">已办结</option>
          <option value="跟进中">跟进中</option>
          <option value="待处理">待处理</option>
        </select>
      </label>
    `;
  }

  // 默认渲染 AI外呼任务明细 25项筛选条件
  return `
    <!-- 第 1 行 -->
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      <span><span style="color:#ef4444; font-weight:bold;">*</span>更新时间：</span>
      <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
        <input class="form-input" type="date" value="${opsHqNurtureFilter.startDate || '2026-08-01'}" id="hqFilterStartDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        <span style="color:#94a3b8; font-size:12px;">→</span>
        <input class="form-input" type="date" value="${opsHqNurtureFilter.endDate || '2026-09-16'}" id="hqFilterEndDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
      </div>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      任务编码：
      <input class="form-input" id="hqFilterTaskCode" placeholder="请输入" value="${opsHqNurtureFilter.keyword || ''}" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      培育线索编码：
      <input class="form-input" id="hqFilterClueCode" placeholder="请输入" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      线索R渠道：
      <select class="form-input" id="hqFilterRChannel" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="R1-官网预约">R1-官网预约</option>
        <option value="R2-垂媒引流">R2-垂媒引流</option>
        <option value="R3-车展留资">R3-车展留资</option>
        <option value="R6-总部新媒体">R6-总部新媒体</option>
      </select>
    </label>

    <!-- 第 2 行 -->
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      客户姓名：
      <input class="form-input" id="hqFilterCustName" placeholder="请输入" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      联系电话：
      <input class="form-input" id="hqFilterCustTel" placeholder="请输入" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      意向车系：
      <select class="form-input" id="hqFilterSeries" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        ${['2026款探陆', 'N6', 'N7', 'NX8', '轩逸'].map(v => `<option value="${v}" ${opsHqNurtureFilter.seriesCode === v ? 'selected' : ''}>${v}</option>`).join('')}
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      最新留资车系：
      <select class="form-input" id="hqFilterLastSeries" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="探陆 380T 旗舰版">探陆 380T 旗舰版</option>
        <option value="N6 550km 智驭版">N6 550km 智驭版</option>
        <option value="N7 620km 旗舰版">N7 620km 旗舰版</option>
        <option value="NX8 豪华版">NX8 豪华版</option>
        <option value="轩逸 超混电驱">轩逸 超混电驱</option>
      </select>
    </label>

    <!-- 第 3 行 -->
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      最新线索状态：
      <select class="form-input" id="hqFilterFollowStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        ${['跟进中', '已完成', '待跟进', '暂缓'].map(v => `<option value="${v}" ${opsHqNurtureFilter.followStatus === v ? 'selected' : ''}>${v}</option>`).join('')}
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      最新意向级别：
      <select class="form-input" id="hqFilterLastLevel" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        ${['H', 'A', 'B', 'C', 'L', 'F', 'Z', 'O', 'T', 'D'].map(lvl => `<option value="${lvl}">${lvl}级</option>`).join('')}
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      首次线索状态：
      <select class="form-input" id="hqFilterInitialClueStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="待分配">待分配</option>
        <option value="待跟进">待跟进</option>
        <option value="培育中">培育中</option>
        <option value="暂缓">暂缓</option>
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      首次意向级别：
      <select class="form-input" id="hqFilterInitialLevel" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        ${['H', 'A', 'B', 'C', 'L', 'F', 'Z', 'O', 'T', 'D'].map(lvl => `<option value="${lvl}">${lvl}级</option>`).join('')}
      </select>
    </label>

    <!-- 第 4 行 -->
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      首次线索来源：
      <select class="form-input" id="hqFilterFirstSource" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="抖音直播间">抖音直播间</option>
        <option value="官微小程序">官微小程序</option>
        <option value="车展扫码">车展扫码</option>
        <option value="懂车帝App">懂车帝App</option>
        <option value="小红书">小红书</option>
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      培育沟通方式：
      <select class="form-input" id="hqFilterNurtureCommMode" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="AI智能外呼">AI智能外呼</option>
        <option value="人工客服外呼">人工客服外呼</option>
        <option value="预外呼触达">预外呼触达</option>
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      外呼类型：
      <select class="form-input" id="hqFilterTaskType" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="1">AI智能外呼</option>
        <option value="2">人工外呼</option>
        <option value="3">预外呼</option>
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      同步外呼系统状态：
      <select class="form-input" id="hqFilterSyncCallStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="1">已同步</option>
        <option value="2">处理中</option>
        <option value="3">同步成功</option>
        <option value="4">同步失败</option>
      </select>
    </label>

    <!-- 第 5 行 -->
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      是否逾期：
      <select class="form-input" id="hqFilterIsOverdue" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="1">是</option>
        <option value="0">否</option>
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      超期状态：
      <select class="form-input" id="hqFilterOverdueStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="1">临期</option>
        <option value="2">超期</option>
        <option value="0">正常</option>
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      人工手动下发：
      <select class="form-input" id="hqFilterManualDispatch" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="1">是</option>
        <option value="0">否</option>
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      人工手动下发更新时间：
      <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
        <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        <span style="color:#94a3b8; font-size:12px;">→</span>
        <input class="form-input" type="date" value="2026-09-16" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
      </div>
    </label>

    <!-- 第 6 行 -->
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      人工外呼无人接通场景：
      <select class="form-input" id="hqFilterNoConnectScene" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="1">忙音/拒接</option>
        <option value="2">关机</option>
        <option value="3">空号/停机</option>
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      初始线索来源：
      <select class="form-input" id="hqFilterInitialSource" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="微信公众号">微信公众号</option>
        <option value="官网预约页">官网预约页</option>
        <option value="车展扫码">车展扫码</option>
        <option value="汽车之家API">汽车之家API</option>
        <option value="抖音留资表单">抖音留资表单</option>
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      是否留资未满：
      <select class="form-input" id="hqFilterIsInfoNotFull" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="1">是</option>
        <option value="0">否</option>
      </select>
    </label>
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      线索来源平台：
      <select class="form-input" id="hqFilterLeadPlatform" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
        <option value="">请选择</option>
        <option value="总部新媒体平台">总部新媒体平台</option>
        <option value="东风日产官网">东风日产官网</option>
        <option value="车展营销系统">车展营销系统</option>
        <option value="懂车帝平台">懂车帝平台</option>
      </select>
    </label>

    <!-- 第 7 行 -->
    <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
      回访记录更新时间：
      <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
        <input class="form-input" type="date" value="2026-09-01" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
        <span style="color:#94a3b8; font-size:12px;">→</span>
        <input class="form-input" type="date" value="2026-09-16" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
      </div>
    </label>
  `;
}

function renderOpsHqNurtureReportPage() {
  const container = document.getElementById('opsHqNurtureReportPage');
  if (!container) return;
  const isManualAppointmentLeadEntry = container.dataset.appointmentSourceEntry === 'manual';
  const isManualTestDriveLeadEntry = isManualAppointmentLeadEntry && opsHqNurtureActiveTab === 'testDriveDetail';

  const tabs = [
    { key: 'callTaskDetail', label: '人工外呼任务明细' },
    { key: 'aiCallTaskDetail', label: 'AI外呼任务明细' },
    { key: 'testDriveDetail', label: '人工坐席预约明细' },
    { key: 'infoNotFullDetail', label: '留资未满任务明细' },
    { key: 'messageRecord', label: '短信记录' }
  ];

  const currentTabObj = tabs.find(t => t.key === opsHqNurtureActiveTab) || tabs[0];

  let filterFieldCountDesc = '25项字段与原型截图 1:1 精确对齐';
  if (opsHqNurtureActiveTab === 'testDriveDetail') {
    filterFieldCountDesc = '32项字段与业务定义 1:1 精确对齐';
  } else if (opsHqNurtureActiveTab === 'infoNotFullDetail') {
    filterFieldCountDesc = '28项字段与业务定义 1:1 精确对齐';
  } else if (opsHqNurtureActiveTab === 'messageRecord') {
    filterFieldCountDesc = '10项短信字段与业务定义 1:1 精确对齐';
  }

  container.innerHTML = `
    <div class="mw-report-container" style="padding:16px;">
      ${isManualAppointmentLeadEntry ? '' : `
      <nav class="mw-sub-tabs" style="display:flex; gap:8px; border-bottom:1px solid #e2e8f0; margin-bottom:16px; padding-bottom:12px; overflow-x:auto;">
        ${tabs.map(tab => `
          <button type="button" class="btn-sub-tab ${opsHqNurtureActiveTab === tab.key ? 'active' : ''}" 
                  style="padding:8px 18px; border:none; background:${opsHqNurtureActiveTab === tab.key ? '#2563eb' : '#f8fafc'}; color:${opsHqNurtureActiveTab === tab.key ? '#fff' : '#475569'}; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px; white-space:nowrap;"
                  onclick="switchOpsHqNurtureTab('${tab.key}')">
            ${tab.label}
          </button>
        `).join('')}
      </nav>`}

      <section class="mw-report-filter-card ${isManualTestDriveLeadEntry ? 'appointment-manual-filter' : ''}" style="background:#fff; border-radius:10px; padding:16px; margin-bottom:16px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="font-weight:700; font-size:14px; color:#0f172a; display:flex; align-items:center; gap:8px;">
            <span>筛选查询</span>
            <span class="hq-filter-field-count" style="font-size:12px; font-weight:normal; color:#64748b;">(${filterFieldCountDesc})</span>
          </div>
          <button type="button" style="border:none; background:none; color:#2563eb; font-size:12px; cursor:pointer; font-weight:600;" onclick="toggleOpsHqAdvancedFilter()">
            <span id="hqAdvancedFilterText">${isManualTestDriveLeadEntry ? '更多筛选　展开' : '收起 ∧'}</span>
          </button>
        </div>

        <!-- 4列全网格筛选条件区域 (根据当前子报表动态渲染 1:1 字段) -->
        <div id="hqAdvancedFilterBox" style="display:block;">
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px 16px;">
            ${renderOpsHqFilterFields(opsHqNurtureActiveTab)}
          </div>
        </div>

        <!-- 筛选操作按钮行 (与原型截图右下角按钮组 1:1 完全一致) -->
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
          <button type="button" style="height:32px; padding:0 18px; background:#fff; border:1px solid #d9d9d9; color:#1e293b; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="resetOpsHqNurtureFilter()">重置</button>
          <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="applyOpsHqNurtureFilter()">查询</button>
          <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="exportOpsHqNurtureReport()">导出</button>
          <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="renderOpsHqNurtureReportPage()">刷新</button>
          <button class="hq-filter-secondary-toggle" type="button" style="height:32px; padding:0 8px; border:none; background:none; color:#2563eb; font-size:13px; cursor:pointer; font-weight:600;" onclick="toggleOpsHqAdvancedFilter()">
            <span id="hqAdvancedFilterTextNav">收起 ∧</span>
          </button>
        </div>
      </section>

      ${opsHqNurtureActiveTab === 'testDriveDetail' ? '' : `
      <section class="mw-report-summary" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:16px; margin-bottom:16px;">
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">总培育任务数</span>
          <div style="font-size:24px; font-weight:800; color:#0f172a; margin-top:6px;">256 <small style="font-size:12px; font-weight:normal; color:#64748b;">单</small></div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">人工外呼完成率</span>
          <div style="font-size:24px; font-weight:800; color:#1677ff; margin-top:6px;">71.1%</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">AI外呼成功接通</span>
          <div style="font-size:24px; font-weight:800; color:#52c41a; margin-top:6px;">45 <small style="font-size:12px; font-weight:normal; color:#64748b;">单</small></div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">预约到店试驾</span>
          <div style="font-size:24px; font-weight:800; color:#fa8c16; margin-top:6px;">28 <small style="font-size:12px; font-weight:normal; color:#64748b;">人</small></div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">专营店下发成功</span>
          <div style="font-size:24px; font-weight:800; color:#722ed1; margin-top:6px;">112 <small style="font-size:12px; font-weight:normal; color:#64748b;">单</small></div>
        </div>
      </section>`}

      <section class="mw-report-table-card ${isManualTestDriveLeadEntry ? 'appointment-manual-list' : ''}" style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        ${isManualTestDriveLeadEntry ? '' : `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="margin:0; font-size:16px; font-weight:700; color:#0f172a;">${currentTabObj.label}</h3>
          <span style="font-size:12px; color:#94a3b8;">共 5 条记录</span>
        </div>
        `}
        <div style="overflow-x:auto;">
          ${renderSpecificOpsHqNurtureTable(opsHqNurtureActiveTab)}
        </div>
      </section>
    </div>
  `;

  if (isManualTestDriveLeadEntry) arrangeManualTestDriveFilter(container);
}

function arrangeManualTestDriveFilter(container) {
  const filterCard = container.querySelector('.appointment-manual-filter');
  const filterBox = filterCard && filterCard.querySelector('#hqAdvancedFilterBox');
  const header = filterCard && filterCard.firstElementChild;
  const moreButton = header && header.querySelector('button[onclick="toggleOpsHqAdvancedFilter()"]');
  if (!filterBox || !moreButton) return;

  moreButton.classList.add('hq-manual-more-filter');
  filterBox.insertAdjacentElement('afterend', moreButton);
}

function renderSpecificOpsHqNurtureTable(tabKey) {
  if (tabKey === 'aiCallTaskDetail') {
    const data = opsAiCallTaskMockData;
    return `
      <section class="mw-report-summary" style="margin-bottom:16px; display:flex; gap:16px; background:#f8fafc; padding:12px 16px; border-radius:8px; border:1px solid #e2e8f0;">
        <div style="flex:1;"><span>总AI外呼任务</span><strong style="font-size:18px; color:#0f172a;">128<small style="font-size:12px; font-weight:normal;"> 单</small></strong></div>
        <div style="flex:1;"><span>外呼接通率</span><strong style="font-size:18px; color:#059669;">82%<small style="font-size:12px; font-weight:normal;"> (105单接通)</small></strong></div>
        <div style="flex:1;"><span>高意向转化数</span><strong style="font-size:18px; color:#2563eb;">42<small style="font-size:12px; font-weight:normal;"> 单 (32.8%)</small></strong></div>
        <div style="flex:1;"><span>平均交互轮次</span><strong style="font-size:18px; color:#7c3aed;">5.4<small style="font-size:12px; font-weight:normal;"> 轮</small></strong></div>
        <div style="flex:1;"><span>成功邀约到店</span><strong style="font-size:18px; color:#ea580c;">28<small style="font-size:12px; font-weight:normal;"> 单</small></strong></div>
      </section>

      <div class="mw-report-table-toolbar" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">AI外呼任务明细 (共 ${data.length} 条记录)</h4>
        <div style="display:flex; gap:8px;">
          <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;" onclick="if(typeof showToast==='function') showToast('正在导出【AI外呼任务明细】数据...', true);">导出数据</button>
          <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>实际拨打时间</option><option>交互轮次</option></select>
          <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>降序</option><option>升序</option></select>
          <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;">字段显示</button>
        </div>
      </div>

      <div class="mw-report-table-scroll" style="overflow-x:auto;">
        <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; white-space:nowrap;">
          <thead>
            <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0; color:#334155; font-weight:600;">
              <th style="padding:10px 8px;">序号</th>
              <th style="padding:10px 8px;">任务编码</th>
              <th style="padding:10px 8px;">培育线索编码</th>
              <th style="padding:10px 8px;">线索R渠道</th>
              <th style="padding:10px 8px;">客户姓名</th>
              <th style="padding:10px 8px;">联系电话</th>
              <th style="padding:10px 8px;">意向车系</th>
              <th style="padding:10px 8px;">最新留资车系</th>
              <th style="padding:10px 8px;">意向专营店</th>
              <th style="padding:10px 8px;">最新线索状态</th>
              <th style="padding:10px 8px;">最新意向级别</th>
              <th style="padding:10px 8px;">SMARTCODE</th>
              <th style="padding:10px 8px;">首次线索状态</th>
              <th style="padding:10px 8px;">首次意向级别</th>
              <th style="padding:10px 8px;">首次线索来源</th>
              <th style="padding:10px 8px;">培育沟通方式</th>
              <th style="padding:10px 8px;">外呼类型</th>
              <th style="padding:10px 8px;">同步外呼系统状态</th>
              <th style="padding:10px 8px;">同步外呼系统时间</th>
              <th style="padding:10px 8px;">人工客服外呼编码</th>
              <th style="padding:10px 8px;">AI智能外呼编码</th>
              <th style="padding:10px 8px;">AI外呼通话ID</th>
              <th style="padding:10px 8px;">更新时间</th>
              <th style="padding:10px 8px;">是否逾期</th>
              <th style="padding:10px 8px;">超期状态</th>
              <th style="padding:10px 8px;">及时首触</th>
              <th style="padding:10px 8px;">人工手动下发</th>
              <th style="padding:10px 8px;">人工手动下发更新时间</th>
              <th style="padding:10px 8px;">人工外呼无人接通场景</th>
              <th style="padding:10px 8px;">初始线索来源</th>
              <th style="padding:10px 8px;">是否留资未满</th>
              <th style="padding:10px 8px;">线索来源平台</th>
              <th style="padding:10px 8px;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr style="border-bottom:1px solid #f1f5f9; color:#334155;">
                <td style="padding:10px 8px; color:#64748b;">${item.index}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#2563eb; font-weight:700;">${item.taskCode}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.leadId}</td>
                <td style="padding:10px 8px;">${item.channelR}</td>
                <td style="padding:10px 8px; font-weight:600;">${item.customerName}</td>
                <td style="padding:10px 8px; font-family:monospace;">${item.phone}</td>
                <td style="padding:10px 8px;">${item.intentSeries}</td>
                <td style="padding:10px 8px;">${item.latestSeries}</td>
                <td style="padding:10px 8px;">${item.intentStore || '广州天河专营店'}</td>
                <td style="padding:10px 8px;"><span style="padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; background:${item.latestLeadStatus === '已完成' ? '#dcfce7' : '#fef3c7'}; color:${item.latestLeadStatus === '已完成' ? '#166534' : '#92400e'};">${item.latestLeadStatus || '跟进中'}</span></td>
                <td style="padding:10px 8px; text-align:center; font-weight:700; color:#2563eb;">${item.latestLevel}级</td>
                <td style="padding:10px 8px; font-family:monospace; color:#64748b;">${item.smartCode || 'SMC2026091688'}</td>
                <td style="padding:10px 8px;">${item.firstLeadStatus || '待分配'}</td>
                <td style="padding:10px 8px; text-align:center;">${item.firstLevel || 'B'}级</td>
                <td style="padding:10px 8px;">${item.firstLeadSource || '抖音直播间'}</td>
                <td style="padding:10px 8px;">${item.nurtureCommMode || 'AI智能外呼'}</td>
                <td style="padding:10px 8px;">${item.callType || '自动外呼'}</td>
                <td style="padding:10px 8px;"><span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#dcfce7; color:#166534;">${item.syncCallStatus || '同步成功'}</span></td>
                <td style="padding:10px 8px; color:#64748b;">${item.syncCallTime || item.actualCallTime}</td>
                <td style="padding:10px 8px; font-family:monospace;">${item.agentCallCode || 'OBC2026091601'}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#6366f1; font-weight:700;">${item.aiCallCode || 'AIC2026091601'}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.aiCallId || 'CALL9823719283'}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.latestFollowTime}</td>
                <td style="padding:10px 8px; text-align:center;">${item.isOverdue}</td>
                <td style="padding:10px 8px;">${item.overdueStatus}</td>
                <td style="padding:10px 8px; text-align:center;">${item.promptFirstTouch}</td>
                <td style="padding:10px 8px;">${item.manualDispatch || '否'}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.manualDispatchTime || '-'}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.manualUnconnectedScene || '无'}</td>
                <td style="padding:10px 8px;">${item.leadSource}</td>
                <td style="padding:10px 8px; text-align:center;">${item.isInfoIncomplete}</td>
                <td style="padding:10px 8px;">${item.leadPlatform || '总部新媒体平台'}</td>
                <td style="padding:10px 8px;">
                  <button class="mw-detail-link" type="button" style="border:none; background:none; color:#2563eb; font-weight:600; cursor:pointer;" onclick="openOpsAiCallWorkorderDetailModal('${item.taskCode}')">详情</button>
                  <button type="button" style="border:none; background:none; color:#059669; font-weight:600; cursor:pointer; margin-left:6px;" onclick="openOpsAiCallWorkorderDetailModal('${item.taskCode}'); switchOpsAiCallWorkorderDetailTab('${item.taskCode}', 'aiCall');">听录音</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <footer class="mw-report-pagination" style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#64748b;">
        <span>共 ${data.length} 条记录，当前第 1 / 1 页</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>每页 10 条</option></select>
          <button type="button" style="height:28px; padding:0 8px;" disabled>‹</button>
          <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>第 1 页</option></select>
          <button type="button" style="height:28px; padding:0 8px;" disabled>›</button>
        </div>
      </footer>
    `;
  }

  if (tabKey === 'testDriveDetail') {
    const data = typeof opsTestDriveMockData !== 'undefined' ? opsTestDriveMockData : [];
    return `
      <div class="mw-report-table-toolbar" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">人工坐席预约明细 (共 ${data.length} 条记录)</h4>
        <div style="display:flex; gap:8px;">
          <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;" onclick="if(typeof showToast==='function') showToast('正在导出【预约试驾明细】数据...', true);">导出数据</button>
          <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>预约试驾日期</option><option>排程提交时间</option></select>
          <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>降序</option><option>升序</option></select>
          <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;">字段显示</button>
        </div>
      </div>

      <div class="mw-report-table-scroll" style="overflow-x:auto;">
        <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; white-space:nowrap;">
          <thead>
            <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0; color:#334155; font-weight:600;">
              <th style="padding:10px 8px;">序号</th>
              <th style="padding:10px 8px;">预约试驾编码</th>
              <th style="padding:10px 8px;">人工任务编码</th>
              <th style="padding:10px 8px;">培育线索编码</th>
              <th style="padding:10px 8px;">试驾排程编码</th>
              <th style="padding:10px 8px;">预约单号</th>
              <th style="padding:10px 8px;">客户姓名</th>
              <th style="padding:10px 8px;">联系电话</th>
              <th style="padding:10px 8px;">试驾类型</th>
              <th style="padding:10px 8px;">试驾专营店</th>
              <th style="padding:10px 8px;">试驾车系</th>
              <th style="padding:10px 8px;">试驾车辆</th>
              <th style="padding:10px 8px;">预约试驾日期</th>
              <th style="padding:10px 8px;">试驾时间段</th>
              <th style="padding:10px 8px;">排程提交时间</th>
              <th style="padding:10px 8px;">试驾排程创建时间</th>
              <th style="padding:10px 8px;">是否重排</th>
              <th style="padding:10px 8px;">重排日期</th>
              <th style="padding:10px 8px;">重排时间段</th>
              <th style="padding:10px 8px;">重排车系编码</th>
              <th style="padding:10px 8px;">重排车系名称</th>
              <th style="padding:10px 8px;">试驾状态更新时间</th>
              <th style="padding:10px 8px;">跟进顾问</th>
              <th style="padding:10px 8px;">试驾状态</th>
              <th style="padding:10px 8px;">取消原因</th>
              <th style="padding:10px 8px;">取消标签</th>
              <th style="padding:10px 8px;">是否逾期取消</th>
              <th style="padding:10px 8px;">门店是否跟进</th>
              <th style="padding:10px 8px;">门店跟进时间</th>
              <th style="padding:10px 8px;">门店跟进状态</th>
              <th style="padding:10px 8px;">门店回访描述</th>
              <th style="padding:10px 8px;">最新留资车系</th>
              <th style="padding:10px 8px;">门店线索跟进总次数</th>
              <th style="padding:10px 8px;">当前线索最新状态</th>
              <th style="padding:10px 8px;">最新门店跟进时间</th>
              <th style="padding:10px 8px;">最新门店回访描述</th>
              <th style="padding:10px 8px;">任务跟进时间</th>
              <th style="padding:10px 8px;">试驾排程下发-回访描述</th>
              <th style="padding:10px 8px;">接触状态</th>
              <th style="padding:10px 8px;">坐席账号</th>
              <th style="padding:10px 8px;">总部是否跟进</th>
              <th style="padding:10px 8px;">电销回访初始状态</th>
              <th style="padding:10px 8px;">电销任务激活时间</th>
              <th style="padding:10px 8px;">未履约原因</th>
              <th style="padding:10px 8px;">回访-提交时间</th>
              <th style="padding:10px 8px;">回访-接触状态</th>
              <th style="padding:10px 8px;">回访结果</th>
              <th style="padding:10px 8px;">试驾任务跟进-回访描述</th>
              <th style="padding:10px 8px;">试驾回访跟进状态</th>
              <th style="padding:10px 8px;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr style="border-bottom:1px solid #f1f5f9; color:#334155;">
                <td style="padding:10px 8px; color:#64748b;">${item.index}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#2563eb; font-weight:700;">${item.testDriveCode}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.manualTaskCode}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.leadCode}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#7c3aed;">${item.scheduleCode}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#0f172a; font-weight:600;">${item.bookingNo}</td>
                <td style="padding:10px 8px; font-weight:600;">${item.customerName}</td>
                <td style="padding:10px 8px; font-family:monospace;">${item.phone}</td>
                <td style="padding:10px 8px;"><span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#eff6ff; color:#1e40af;">${item.driveType}</span></td>
                <td style="padding:10px 8px; font-weight:600;">${item.driveStore}</td>
                <td style="padding:10px 8px;">${item.driveSeries}</td>
                <td style="padding:10px 8px;">${item.driveVehicle}</td>
                <td style="padding:10px 8px; color:#2563eb; font-weight:600;">${item.bookingDate}</td>
                <td style="padding:10px 8px;">${item.driveTimeSlot}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.scheduleSubmitTime}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.scheduleCreateTime}</td>
                <td style="padding:10px 8px; text-align:center;">
                  <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.isRescheduled === '是' ? '#fef3c7' : '#f1f5f9'}; color:${item.isRescheduled === '是' ? '#92400e' : '#64748b'};">${item.isRescheduled}</span>
                </td>
                <td style="padding:10px 8px; color:#64748b;">${item.rescheduleDate}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.rescheduleTimeSlot}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#64748b;">${item.rescheduleSeriesCode}</td>
                <td style="padding:10px 8px;">${item.rescheduleSeriesName}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.statusUpdateTime}</td>
                <td style="padding:10px 8px;">${item.followAdvisor}</td>
                <td style="padding:10px 8px;">
                  <span style="padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; background:${item.driveStatus === '已履约' ? '#dcfce7' : item.driveStatus === '待履约' ? '#fef3c7' : '#fee2e2'}; color:${item.driveStatus === '已履约' ? '#166534' : item.driveStatus === '待履约' ? '#92400e' : '#991b1b'};">${item.driveStatus}</span>
                </td>
                <td style="padding:10px 8px; color:#64748b;">${item.cancelReason}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.cancelTag}</td>
                <td style="padding:10px 8px; text-align:center;">${item.isOverdueCancel}</td>
                <td style="padding:10px 8px; text-align:center;">${item.isStoreFollowed}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.storeFollowTime}</td>
                <td style="padding:10px 8px;">${item.storeFollowStatus}</td>
                <td style="padding:10px 8px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.storeVisitDesc}">${item.storeVisitDesc}</td>
                <td style="padding:10px 8px;">${item.latestRetainedSeries}</td>
                <td style="padding:10px 8px; text-align:center;">${item.storeFollowTotalCount}</td>
                <td style="padding:10px 8px;"><span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#f0fdf4; color:#15803d;">${item.currentLeadLatestStatus}</span></td>
                <td style="padding:10px 8px; color:#64748b;">${item.latestStoreFollowTime}</td>
                <td style="padding:10px 8px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.latestStoreVisitDesc}">${item.latestStoreVisitDesc}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.taskFollowTime}</td>
                <td style="padding:10px 8px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.scheduleDispatchVisitDesc}">${item.scheduleDispatchVisitDesc}</td>
                <td style="padding:10px 8px;"><span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#dcfce7; color:#166534;">${item.contactStatus}</span></td>
                <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.agentAccount}</td>
                <td style="padding:10px 8px; text-align:center;">${item.isHqFollowed}</td>
                <td style="padding:10px 8px;">${item.teleInitialStatus}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.teleTaskActiveTime}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.unfulfilledReason}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.visitSubmitTime}</td>
                <td style="padding:10px 8px;">${item.visitContactStatus}</td>
                <td style="padding:10px 8px; font-weight:600; color:#2563eb;">${item.visitResult}</td>
                <td style="padding:10px 8px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.taskFollowVisitDesc}">${item.taskFollowVisitDesc}</td>
                <td style="padding:10px 8px;"><span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#f1f5f9; color:#475569;">${item.driveVisitFollowStatus}</span></td>
                <td style="padding:10px 8px;">
                  <button class="mw-detail-link" type="button" style="border:none; background:none; color:#2563eb; font-weight:600; cursor:pointer;" onclick="openOpsTestDriveDetailModal('${item.testDriveCode}')">详情</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <footer class="mw-report-pagination" style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#64748b;">
        <span>共 ${data.length} 条记录，当前第 1 / 1 页</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>每页 10 条</option></select>
          <button type="button" style="height:28px; padding:0 8px;" disabled>‹</button>
          <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>第 1 页</option></select>
          <button type="button" style="height:28px; padding:0 8px;" disabled>›</button>
        </div>
      </footer>
    `;
  }

  if (tabKey === 'infoNotFullDetail') {
    const data = typeof opsInfoNotFullMockData !== 'undefined' ? opsInfoNotFullMockData : [];
    return `
      <section class="mw-report-summary" style="margin-bottom:16px; display:flex; gap:16px; background:#f8fafc; padding:12px 16px; border-radius:8px; border:1px solid #e2e8f0;">
        <div style="flex:1;"><span>留资未满任务数</span><strong style="font-size:18px; color:#0f172a;">52<small style="font-size:12px; font-weight:normal;"> 单</small></strong></div>
        <div style="flex:1;"><span>补全转化达标率</span><strong style="font-size:18px; color:#059669;">69.2%<small style="font-size:12px; font-weight:normal;"> (36单补全)</small></strong></div>
        <div style="flex:1;"><span>待人工补全跟进</span><strong style="font-size:18px; color:#2563eb;">11<small style="font-size:12px; font-weight:normal;"> 单</small></strong></div>
        <div style="flex:1;"><span>及时首触达标率</span><strong style="font-size:18px; color:#7c3aed;">96.2%<small style="font-size:12px; font-weight:normal;"> (50单)</small></strong></div>
        <div style="flex:1;"><span>超期未处理任务</span><strong style="font-size:18px; color:#ea580c;">2<small style="font-size:12px; font-weight:normal;"> 单</small></strong></div>
      </section>

      <div class="mw-report-table-toolbar" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">留资未满任务明细 (共 ${data.length} 条记录)</h4>
        <div style="display:flex; gap:8px;">
          <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;" onclick="if(typeof showToast==='function') showToast('正在导出【留资未满任务明细】数据...', true);">导出数据</button>
          <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>接收时间</option><option>最新跟进时间</option><option>分配时间</option></select>
          <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>降序</option><option>升序</option></select>
          <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;">字段显示</button>
        </div>
      </div>

      <div class="mw-report-table-scroll" style="overflow-x:auto;">
        <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; white-space:nowrap;">
          <thead>
            <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0; color:#334155; font-weight:600;">
              <th style="padding:10px 8px;">序号</th>
              <th style="padding:10px 8px;">任务编码</th>
              <th style="padding:10px 8px;">线索编码</th>
              <th style="padding:10px 8px;">线索R渠道</th>
              <th style="padding:10px 8px;">客户姓名</th>
              <th style="padding:10px 8px;">联系电话</th>
              <th style="padding:10px 8px;">意向车系</th>
              <th style="padding:10px 8px;">最新意向车系</th>
              <th style="padding:10px 8px;">跟进状态</th>
              <th style="padding:10px 8px;">跟进次数</th>
              <th style="padding:10px 8px;">任务类型</th>
              <th style="padding:10px 8px;">初始线索状态</th>
              <th style="padding:10px 8px;">初始意向级别</th>
              <th style="padding:10px 8px;">分配类型</th>
              <th style="padding:10px 8px;">分配时间</th>
              <th style="padding:10px 8px;">分配账号</th>
              <th style="padding:10px 8px;">分配账号名称</th>
              <th style="padding:10px 8px;">分配规则</th>
              <th style="padding:10px 8px;">最新回访结果</th>
              <th style="padding:10px 8px;">最新接触状态</th>
              <th style="padding:10px 8px;">最新意向级别</th>
              <th style="padding:10px 8px;">最新线索结果原因</th>
              <th style="padding:10px 8px;">计划下次回访时间</th>
              <th style="padding:10px 8px;">接收时间</th>
              <th style="padding:10px 8px;">最新跟进时间</th>
              <th style="padding:10px 8px;">是否逾期</th>
              <th style="padding:10px 8px;">超期状态</th>
              <th style="padding:10px 8px;">及时首触</th>
              <th style="padding:10px 8px;">人工手动下发</th>
              <th style="padding:10px 8px;">人工手动下发更新时间</th>
              <th style="padding:10px 8px;">人工外呼无人接通场景</th>
              <th style="padding:10px 8px;">推送到预外呼状态</th>
              <th style="padding:10px 8px;">试驾排程</th>
              <th style="padding:10px 8px;">初始线索来源</th>
              <th style="padding:10px 8px;">线索来源平台</th>
              <th style="padding:10px 8px;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr style="border-bottom:1px solid #f1f5f9; color:#334155;">
                <td style="padding:10px 8px; color:#64748b;">${item.index}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#2563eb; font-weight:700;">${item.taskCode}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.leadCode}</td>
                <td style="padding:10px 8px;">${item.channelR}</td>
                <td style="padding:10px 8px; font-weight:600;">${item.customerName}</td>
                <td style="padding:10px 8px; font-family:monospace;">${item.phone}</td>
                <td style="padding:10px 8px;">${item.intentSeries}</td>
                <td style="padding:10px 8px; color:#0284c7; font-weight:500;">${item.latestIntentSeries}</td>
                <td style="padding:10px 8px;">
                  <span style="padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; background:${item.followStatus === '已完成' ? '#dcfce7' : item.followStatus === '跟进中' ? '#e0f2fe' : item.followStatus === '待跟进' ? '#fef3c7' : '#f1f5f9'}; color:${item.followStatus === '已完成' ? '#166534' : item.followStatus === '跟进中' ? '#0369a1' : item.followStatus === '待跟进' ? '#92400e' : '#475569'};">${item.followStatus}</span>
                </td>
                <td style="padding:10px 8px; text-align:center; font-weight:600;">${item.followCount}</td>
                <td style="padding:10px 8px;">
                  <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#eff6ff; color:#1e40af;">${item.taskType}</span>
                </td>
                <td style="padding:10px 8px;">${item.initialLeadStatus}</td>
                <td style="padding:10px 8px; text-align:center;">
                  <span style="padding:2px 6px; border-radius:4px; font-size:11px; font-weight:700; background:#fef3c7; color:#92400e;">${item.initialIntentLevel}</span>
                </td>
                <td style="padding:10px 8px;">${item.assignType}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.assignTime}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.assignAccount}</td>
                <td style="padding:10px 8px; font-weight:500;">${item.assignAccountName}</td>
                <td style="padding:10px 8px; color:#4f46e5;">${item.assignRule}</td>
                <td style="padding:10px 8px; font-weight:600; color:#2563eb;">${item.latestVisitResult}</td>
                <td style="padding:10px 8px;">
                  <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.latestContactStatus === '已接通' ? '#dcfce7' : item.latestContactStatus === '无人接听' ? '#fee2e2' : '#f1f5f9'}; color:${item.latestContactStatus === '已接通' ? '#166534' : item.latestContactStatus === '无人接听' ? '#991b1b' : '#475569'};">${item.latestContactStatus}</span>
                </td>
                <td style="padding:10px 8px; text-align:center;">
                  <span style="padding:2px 6px; border-radius:4px; font-size:11px; font-weight:700; background:${item.latestIntentLevel === 'H' ? '#fee2e2' : item.latestIntentLevel === 'A' ? '#fef3c7' : '#eff6ff'}; color:${item.latestIntentLevel === 'H' ? '#991b1b' : item.latestIntentLevel === 'A' ? '#92400e' : '#1e40af'};">${item.latestIntentLevel}</span>
                </td>
                <td style="padding:10px 8px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.latestLeadResultReason}">${item.latestLeadResultReason}</td>
                <td style="padding:10px 8px; color:#2563eb; font-weight:500;">${item.planNextVisitTime}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.receiveTime}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.latestFollowTime}</td>
                <td style="padding:10px 8px; text-align:center;">
                  <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.isOverdue === '是' ? '#fee2e2' : '#f1f5f9'}; color:${item.isOverdue === '是' ? '#991b1b' : '#64748b'};">${item.isOverdue}</span>
                </td>
                <td style="padding:10px 8px;">
                  <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.overdueStatus === '正常时效' ? '#f0fdf4' : '#fef2f2'}; color:${item.overdueStatus === '正常时效' ? '#15803d' : '#b91c1c'};">${item.overdueStatus}</span>
                </td>
                <td style="padding:10px 8px;">
                  <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.timelyFirstTouch.includes('达标') ? '#dcfce7' : '#fee2e2'}; color:${item.timelyFirstTouch.includes('达标') ? '#166534' : '#991b1b'};">${item.timelyFirstTouch}</span>
                </td>
                <td style="padding:10px 8px; text-align:center;">${item.manualDispatch}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.manualDispatchUpdateTime}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.noAnswerScene}</td>
                <td style="padding:10px 8px;">
                  <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.pushPreCallStatus === '已推送' ? '#eff6ff' : '#f8fafc'}; color:${item.pushPreCallStatus === '已推送' ? '#1d4ed8' : '#64748b'};">${item.pushPreCallStatus}</span>
                </td>
                <td style="padding:10px 8px;">
                  <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.testDriveSchedule === '已生成排程' ? '#ecfdf5' : '#f1f5f9'}; color:${item.testDriveSchedule === '已生成排程' ? '#047857' : '#64748b'};">${item.testDriveSchedule}</span>
                </td>
                <td style="padding:10px 8px;">${item.initialLeadSource}</td>
                <td style="padding:10px 8px; font-weight:500;">${item.leadSourcePlatform}</td>
                <td style="padding:10px 8px;">
                  <button class="mw-detail-link" type="button" style="border:none; background:none; color:#2563eb; font-weight:600; cursor:pointer;" onclick="openOpsInfoNotFullDetailModal('${item.taskCode}')">详情</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <footer class="mw-report-pagination" style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#64748b;">
        <span>共 ${data.length} 条记录，当前第 1 / 1 页</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>每页 10 条</option></select>
          <button type="button" style="height:28px; padding:0 8px;" disabled>‹</button>
          <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>第 1 页</option></select>
          <button type="button" style="height:28px; padding:0 8px;" disabled>›</button>
        </div>
      </footer>
    `;
  }

  if (tabKey === 'messageRecord') {
    const data = typeof opsMessageRecordMockData !== 'undefined' ? opsMessageRecordMockData : [];
    return `
      <section class="mw-report-summary" style="margin-bottom:16px; display:flex; gap:16px; background:#f8fafc; padding:12px 16px; border-radius:8px; border:1px solid #e2e8f0;">
        <div style="flex:1;"><span>发送短信总数</span><strong style="font-size:18px; color:#0f172a;">1,480<small style="font-size:12px; font-weight:normal;"> 条</small></strong></div>
        <div style="flex:1;"><span>发送成功率</span><strong style="font-size:18px; color:#059669;">98.2%<small style="font-size:12px; font-weight:normal;"> (1,453条送达)</small></strong></div>
        <div style="flex:1;"><span>客户有效回复数</span><strong style="font-size:18px; color:#2563eb;">326<small style="font-size:12px; font-weight:normal;"> 条 (22.4%)</small></strong></div>
        <div style="flex:1;"><span>试驾邀约转化</span><strong style="font-size:18px; color:#7c3aed;">92<small style="font-size:12px; font-weight:normal;"> 单成功预约</small></strong></div>
        <div style="flex:1;"><span>发送异常待跟进</span><strong style="font-size:18px; color:#ea580c;">27<small style="font-size:12px; font-weight:normal;"> 条失败</small></strong></div>
      </section>

      <div class="mw-report-table-toolbar" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">短信记录 (共 ${data.length} 条记录)</h4>
        <div style="display:flex; gap:8px;">
          <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;" onclick="if(typeof showToast==='function') showToast('正在导出【短信记录】数据...', true);">导出数据</button>
          <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>发送时间</option><option>创建时间</option><option>回复时间</option></select>
          <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>降序</option><option>升序</option></select>
          <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;">字段显示</button>
        </div>
      </div>

      <div class="mw-report-table-scroll" style="overflow-x:auto;">
        <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; white-space:nowrap;">
          <thead>
            <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0; color:#334155; font-weight:600;">
              <th style="padding:10px 8px;">序号</th>
              <th style="padding:10px 8px;">发送手机</th>
              <th style="padding:10px 8px;">任务编码</th>
              <th style="padding:10px 8px;">引用模版名称</th>
              <th style="padding:10px 8px;">短信内容</th>
              <th style="padding:10px 8px;">发送状态</th>
              <th style="padding:10px 8px;">创建时间</th>
              <th style="padding:10px 8px;">发送时间</th>
              <th style="padding:10px 8px;">发送坐席账号</th>
              <th style="padding:10px 8px;">回复内容</th>
              <th style="padding:10px 8px;">回复时间</th>
              <th style="padding:10px 8px;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr style="border-bottom:1px solid #f1f5f9; color:#334155;">
                <td style="padding:10px 8px; color:#64748b;">${item.index}</td>
                <td style="padding:10px 8px; font-family:monospace; font-weight:600; color:#0f172a;">${item.phone}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#2563eb; font-weight:700;">${item.taskCode}</td>
                <td style="padding:10px 8px; font-weight:600; color:#4f46e5;">${item.templateName}</td>
                <td style="padding:10px 8px; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.content}">${item.content}</td>
                <td style="padding:10px 8px;">
                  <span style="padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; background:${item.sendStatus === '发送成功' ? '#dcfce7' : item.sendStatus === '发送中' ? '#e0f2fe' : '#fee2e2'}; color:${item.sendStatus === '发送成功' ? '#166534' : item.sendStatus === '发送中' ? '#0369a1' : '#991b1b'};">${item.sendStatus}</span>
                </td>
                <td style="padding:10px 8px; color:#64748b;">${item.createTime}</td>
                <td style="padding:10px 8px; color:#64748b;">${item.sendTime}</td>
                <td style="padding:10px 8px; font-family:monospace; color:#334155;">${item.agentAccount}</td>
                <td style="padding:10px 8px; max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:${item.replyContent === '-' ? '#94a3b8' : '#047857'}; font-weight:${item.replyContent === '-' ? 'normal' : '500'};" title="${item.replyContent}">
                  ${item.replyContent}
                </td>
                <td style="padding:10px 8px; color:${item.replyTime === '-' ? '#94a3b8' : '#2563eb'}; font-family:monospace;">${item.replyTime}</td>
                <td style="padding:10px 8px;">
                  <button class="mw-detail-link" type="button" style="border:none; background:none; color:#2563eb; font-weight:600; cursor:pointer;" onclick="openOpsMessageRecordDetailModal('${item.msgId}')">详情</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <footer class="mw-report-pagination" style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#64748b;">
        <span>共 ${data.length} 条记录，当前第 1 / 1 页</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>每页 10 条</option></select>
          <button type="button" style="height:28px; padding:0 8px;" disabled>‹</button>
          <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>第 1 页</option></select>
          <button type="button" style="height:28px; padding:0 8px;" disabled>›</button>
        </div>
      </footer>
    `;
  }

  if (tabKey === 'callTaskDetail') {
    const data = [
      {
        id: 1, taskCode: 'TASK20260916001', clueCode: 'HDCLUE1883735719', rChannel: 'R6-总部新媒体', custName: '张先生', phone: '13812345678',
        series: '2026款探陆', latestSeries: '探陆 380T 旗舰版', followStatus: '跟进中', followCount: 4, taskType: '人工外呼', initialClueStatus: '培育中',
        initialLevel: 'H级', assignType: '首次分配', assignTime: '2026-09-16 09:30:00', agentAccount: '电销D组张敏', assignRule: '按当前负载优先分配',
        lastReturnResult: '下次回访', lastTouchStatus: '正常接通', lastLevel: 'H级', lastResultReason: '关注购车补贴', nextReviewTime: '2026-09-18 10:00',
        receiveTime: '2026-09-16 09:15:00', lastFollowTime: '2026-09-16 09:45:12', isOverdue: '否', overdueStatus: '正常', timelyFirstTouch: '是',
        manualDispatch: '否', manualDispatchTime: '-', noConnectScene: '否', pushPreCallStatus: '已同步', driveSchedule: '是',
        initialClueSource: '微信公众号', isInfoNotFull: '否', newTaskType: '首次线索任务', taskExpReason: '-'
      },
      {
        id: 2, taskCode: 'TASK20260916002', clueCode: 'HDCLUE1883735720', rChannel: 'R1-官网预约', custName: '李女士', phone: '15988889999',
        series: 'N6', latestSeries: 'N6 550km 智驭版', followStatus: '已完成', followCount: 6, taskType: '预外呼', initialClueStatus: '待分配',
        initialLevel: 'A级', assignType: '首次分配', assignTime: '2026-09-16 10:15:20', agentAccount: '电销A组李雷', assignRule: '按当日接待优先分配',
        lastReturnResult: '试驾线索下发', lastTouchStatus: '正常接通', lastLevel: 'A级', lastResultReason: '已约专营店试驾', nextReviewTime: '-',
        receiveTime: '2026-09-16 10:00:00', lastFollowTime: '2026-09-16 10:20:45', isOverdue: '否', overdueStatus: '正常', timelyFirstTouch: '是',
        manualDispatch: '是', manualDispatchTime: '2026-09-16 10:22:00', noConnectScene: '否', pushPreCallStatus: '已收到反馈', driveSchedule: '是',
        initialClueSource: '官网预约页', isInfoNotFull: '否', newTaskType: '首次线索任务', taskExpReason: '-'
      },
      {
        id: 3, taskCode: 'TASK20260916003', clueCode: 'HDCLUE1883735721', rChannel: 'R3-车展留资', custName: '王先生', phone: '18677776666',
        series: 'N7', latestSeries: 'N7 620km 旗舰版', followStatus: '待跟进', followCount: 1, taskType: '人工外呼', initialClueStatus: '待跟进',
        initialLevel: 'B级', assignType: '二次分配', assignTime: '2026-09-16 11:00:15', agentAccount: '电销B组王五', assignRule: '随机分配',
        lastReturnResult: '无人接听下发', lastTouchStatus: '无人接听', lastLevel: 'B级', lastResultReason: '手机响铃无人接听', nextReviewTime: '2026-09-16 16:00',
        receiveTime: '2026-09-16 10:50:00', lastFollowTime: '2026-09-16 11:05:00', isOverdue: '是', overdueStatus: '临期', timelyFirstTouch: '否',
        manualDispatch: '否', manualDispatchTime: '-', noConnectScene: '是', pushPreCallStatus: '处理中', driveSchedule: '否',
        initialClueSource: '车展扫码', isInfoNotFull: '否', newTaskType: '重复线索任务', taskExpReason: '-'
      },
      {
        id: 4, taskCode: 'TASK20260916004', clueCode: 'HDCLUE1883735722', rChannel: 'R2-垂媒引流', custName: '赵先生', phone: '13566665555',
        series: 'NX8', latestSeries: 'NX8 豪华版', followStatus: '已完成', followCount: 5, taskType: '预外呼', initialClueStatus: '培育中',
        initialLevel: 'H级', assignType: '首次分配', assignTime: '2026-09-16 13:20:00', agentAccount: '电销C组赵六', assignRule: '按业绩排名优先分配',
        lastReturnResult: '意向线索下发', lastTouchStatus: '正常接通', lastLevel: 'H级', lastResultReason: '对比竞品汉EV后下发', nextReviewTime: '-',
        receiveTime: '2026-09-16 13:00:00', lastFollowTime: '2026-09-16 13:25:30', isOverdue: '否', overdueStatus: '正常', timelyFirstTouch: '是',
        manualDispatch: '否', manualDispatchTime: '-', noConnectScene: '否', pushPreCallStatus: '已同步', driveSchedule: '是',
        initialClueSource: '汽车之家API', isInfoNotFull: '否', newTaskType: '首次线索任务', taskExpReason: '-'
      },
      {
        id: 5, taskCode: 'TASK20260916005', clueCode: 'HDCLUE1883735723', rChannel: 'R6-总部新媒体', custName: '陈女士', phone: '13911112222',
        series: '轩逸', latestSeries: '轩逸 超混电驱', followStatus: '暂缓', followCount: 2, taskType: '人工外呼', initialClueStatus: '暂缓',
        initialLevel: 'C级', assignType: '首次分配', assignTime: '2026-09-16 14:45:00', agentAccount: '电销D组张敏', assignRule: '人工分配',
        lastReturnResult: '下次回访', lastTouchStatus: '忙音/出差', lastLevel: 'C级', lastResultReason: '客户出差约定下周回访', nextReviewTime: '2026-09-22 09:30',
        receiveTime: '2026-09-16 14:30:00', lastFollowTime: '2026-09-16 14:50:00', isOverdue: '否', overdueStatus: '正常', timelyFirstTouch: '是',
        manualDispatch: '否', manualDispatchTime: '-', noConnectScene: '否', pushPreCallStatus: '同步失败', driveSchedule: '否',
        initialClueSource: '抖音留资表单', isInfoNotFull: '是', newTaskType: '首次线索任务', taskExpReason: '手机关机拦截'
      }
    ];
    return `
      <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; white-space:nowrap;">
        <thead>
          <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0; color:#334155; font-weight:600;">
            <th style="padding:10px 8px;">序号</th>
            <th style="padding:10px 8px;">任务编码</th>
            <th style="padding:10px 8px;">线索编码</th>
            <th style="padding:10px 8px;">线索R渠道</th>
            <th style="padding:10px 8px;">客户姓名</th>
            <th style="padding:10px 8px;">联系电话</th>
            <th style="padding:10px 8px;">意向车系</th>
            <th style="padding:10px 8px;">最新留资车系</th>
            <th style="padding:10px 8px;">跟进状态</th>
            <th style="padding:10px 8px;">跟进次数</th>
            <th style="padding:10px 8px;">任务类型</th>
            <th style="padding:10px 8px;">初始线索状态</th>
            <th style="padding:10px 8px;">初始意向级别</th>
            <th style="padding:10px 8px;">分配类型</th>
            <th style="padding:10px 8px;">分配时间</th>
            <th style="padding:10px 8px;">坐席账号</th>
            <th style="padding:10px 8px;">分配规则</th>
            <th style="padding:10px 8px;">最新回访结果</th>
            <th style="padding:10px 8px;">最新接触状态</th>
            <th style="padding:10px 8px;">最新意向级别</th>
            <th style="padding:10px 8px;">最新线索结果原因</th>
            <th style="padding:10px 8px;">计划下次回访时间</th>
            <th style="padding:10px 8px;">接收时间</th>
            <th style="padding:10px 8px;">最新跟进时间</th>
            <th style="padding:10px 8px;">是否逾期</th>
            <th style="padding:10px 8px;">超期状态</th>
            <th style="padding:10px 8px;">及时首触</th>
            <th style="padding:10px 8px;">人工手动下发</th>
            <th style="padding:10px 8px;">人工手动下发更新时间</th>
            <th style="padding:10px 8px;">人工外呼无人接通场景</th>
            <th style="padding:10px 8px;">推送到预外呼状态</th>
            <th style="padding:10px 8px;">试驾排程</th>
            <th style="padding:10px 8px;">初始线索来源</th>
            <th style="padding:10px 8px;">是否留资未满</th>
            <th style="padding:10px 8px;">新任务类型</th>
            <th style="padding:10px 8px;">任务异常原因</th>
            <th style="padding:10px 8px; sticky:right; background:#f1f5f9;">操作</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr style="border-bottom:1px solid #f1f5f9; color:#334155;">
              <td style="padding:10px 8px; color:#64748b;">${item.id}</td>
              <td style="padding:10px 8px; font-family:monospace; color:#2563eb; font-weight:700; cursor:pointer;" onclick="openOpsWorkorderDetailModal('${item.taskCode}')">${item.taskCode}</td>
              <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.clueCode}</td>
              <td style="padding:10px 8px;">${item.rChannel}</td>
              <td style="padding:10px 8px; font-weight:600; color:#0f172a;">${item.custName}</td>
              <td style="padding:10px 8px; font-family:monospace;">${item.phone}</td>
              <td style="padding:10px 8px;">${item.series}</td>
              <td style="padding:10px 8px;">${item.latestSeries}</td>
              <td style="padding:10px 8px;"><span style="padding:2px 8px; border-radius:4px; font-size:12px; font-weight:500; background:${item.followStatus==='已完成'?'#dcfce7':item.followStatus==='跟进中'?'#dbeafe':item.followStatus==='待跟进'?'#fef3c7':'#f3f4f6'}; color:${item.followStatus==='已完成'?'#166534':item.followStatus==='跟进中'?'#1e40af':item.followStatus==='待跟进'?'#92400e':'#4b5563'};">${item.followStatus}</span></td>
              <td style="padding:10px 8px; font-weight:700;">${item.followCount}</td>
              <td style="padding:10px 8px;">${item.taskType}</td>
              <td style="padding:10px 8px;">${item.initialClueStatus}</td>
              <td style="padding:10px 8px; color:#be123c; font-weight:700;">${item.initialLevel}</td>
              <td style="padding:10px 8px;">${item.assignType}</td>
              <td style="padding:10px 8px; color:#64748b;">${item.assignTime}</td>
              <td style="padding:10px 8px;">${item.agentAccount}</td>
              <td style="padding:10px 8px; color:#64748b;">${item.assignRule}</td>
              <td style="padding:10px 8px; color:#2563eb; font-weight:600;">${item.lastReturnResult}</td>
              <td style="padding:10px 8px;">${item.lastTouchStatus}</td>
              <td style="padding:10px 8px; color:#be123c; font-weight:700;">${item.lastLevel}</td>
              <td style="padding:10px 8px; color:#64748b;">${item.lastResultReason}</td>
              <td style="padding:10px 8px; color:#64748b;">${item.nextReviewTime}</td>
              <td style="padding:10px 8px; color:#64748b;">${item.receiveTime}</td>
              <td style="padding:10px 8px; color:#64748b;">${item.lastFollowTime}</td>
              <td style="padding:10px 8px; color:${item.isOverdue==='是'?'#dc2626':'#166534'}; font-weight:700;">${item.isOverdue}</td>
              <td style="padding:10px 8px;"><span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.overdueStatus==='超期'?'#fee2e2':item.overdueStatus==='临期'?'#fef3c7':'#f1f5f9'}; color:${item.overdueStatus==='超期'?'#991b1b':item.overdueStatus==='临期'?'#92400e':'#475569'};">${item.overdueStatus}</span></td>
              <td style="padding:10px 8px;">${item.timelyFirstTouch}</td>
              <td style="padding:10px 8px;">${item.manualDispatch}</td>
              <td style="padding:10px 8px; color:#64748b;">${item.manualDispatchTime}</td>
              <td style="padding:10px 8px;">${item.noConnectScene}</td>
              <td style="padding:10px 8px; color:#4f46e5; font-weight:600;">${item.pushPreCallStatus}</td>
              <td style="padding:10px 8px;">${item.driveSchedule}</td>
              <td style="padding:10px 8px;">${item.initialClueSource}</td>
              <td style="padding:10px 8px;">${item.isInfoNotFull}</td>
              <td style="padding:10px 8px;">${item.newTaskType}</td>
              <td style="padding:10px 8px; color:#be123c;">${item.taskExpReason}</td>
              <td style="padding:10px 8px; sticky:right; background:#fff;"><button class="btn-link" style="color:#2563eb; border:none; background:none; cursor:pointer; font-weight:600;" onclick="openOpsWorkorderDetailModal('${item.taskCode}')">详情</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Default: qualityLabelDetail or others
  const data = [
    { index: 1, taskId: 'TASK20260916001', leadId: 'CLUE1883735719', channelR: 'R6-总部新媒体', customerName: '张先生', phone: '13812345678', intentSeries: '2026款探陆', latestSeries: '2026款探陆 旗舰版', followStatus: '跟进中', followCount: 4, taskType: '人工外呼', initialLevel: 'H', assignTime: '2026-09-16 09:30:00', agentAccount: '电销D组张敏' },
    { index: 2, taskId: 'TASK20260916002', leadId: 'CLUE1883735720', channelR: 'R1-官网预约', customerName: '李女士', phone: '15988889999', intentSeries: 'N6', latestSeries: 'N6 智驾版', followStatus: '已完成', followCount: 6, taskType: '预外呼', initialLevel: 'A', assignTime: '2026-09-16 10:15:20', agentAccount: '电销A组李雷' },
    { index: 3, taskId: 'TASK20260916003', leadId: 'CLUE1883735721', channelR: 'R3-车展留资', customerName: '王先生', phone: '18677776666', intentSeries: 'N7', latestSeries: 'N7 旗舰款', followStatus: '待跟进', followCount: 1, taskType: '人工外呼', initialLevel: 'B', assignTime: '2026-09-16 11:00:15', agentAccount: '电销B组王五' },
    { index: 4, taskId: 'TASK20260916004', leadId: 'CLUE1883735722', channelR: 'R2-垂媒引流', customerName: '赵先生', phone: '13566665555', intentSeries: 'NX8', latestSeries: 'NX8 豪华版', followStatus: '已完成', followCount: 5, taskType: '预外呼', initialLevel: 'H', assignTime: '2026-09-16 13:20:00', agentAccount: '电销C组赵六' },
    { index: 5, taskId: 'TASK20260916005', leadId: 'CLUE1883735723', channelR: 'R6-总部新媒体', customerName: '陈女士', phone: '13911112222', intentSeries: '轩逸', latestSeries: '轩逸 超混电驱', followStatus: '暂缓', followCount: 2, taskType: '人工外呼', initialLevel: 'C', assignTime: '2026-09-16 14:45:00', agentAccount: '电销D组张敏' }
  ];
  return `
    <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
      <thead>
        <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0; color:#334155; font-weight:600;">
          <th style="padding:12px 10px;">序号</th><th style="padding:12px 10px;">任务编码</th><th style="padding:12px 10px;">培育线索ID</th><th style="padding:12px 10px;">线索渠道</th><th style="padding:12px 10px;">客户姓名</th><th style="padding:12px 10px;">联系电话</th><th style="padding:12px 10px;">意向车系</th><th style="padding:12px 10px;">最新留资车系</th><th style="padding:12px 10px;">跟进状态</th><th style="padding:12px 10px;">跟进次数</th><th style="padding:12px 10px;">任务类型</th><th style="padding:12px 10px;">初始级别</th><th style="padding:12px 10px;">分配时间</th><th style="padding:12px 10px;">坐席账号</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(item => `
          <tr style="border-bottom:1px solid #f1f5f9; color:#334155;">
            <td style="padding:12px 10px; color:#64748b;">${item.index}</td>
            <td style="padding:12px 10px; font-family:monospace; color:#2563eb; font-weight:700; cursor:pointer;" onclick="openOpsWorkorderDetailModal('${item.taskId}')">${item.taskId}</td>
            <td style="padding:12px 10px; font-family:monospace; color:#475569;">${item.leadId}</td>
            <td style="padding:12px 10px;">${item.channelR}</td>
            <td style="padding:12px 10px; font-weight:600; color:#0f172a;">${item.customerName}</td>
            <td style="padding:12px 10px; font-family:monospace;">${item.phone}</td>
            <td style="padding:12px 10px;">${item.intentSeries}</td>
            <td style="padding:12px 10px;">${item.latestSeries}</td>
            <td style="padding:12px 10px;"><span style="padding:2px 8px; border-radius:4px; font-size:12px; font-weight:500; background:${item.followStatus==='已完成'?'#dcfce7':item.followStatus==='跟进中'?'#dbeafe':item.followStatus==='待跟进'?'#fef3c7':'#f3f4f6'}; color:${item.followStatus==='已完成'?'#166534':item.followStatus==='跟进中'?'#1e40af':item.followStatus==='待跟进'?'#92400e':'#4b5563'};">${item.followStatus}</span></td>
            <td style="padding:12px 10px; font-weight:700;">${item.followCount}</td>
            <td style="padding:12px 10px;">${item.taskType}</td>
            <td style="padding:12px 10px; color:#be123c; font-weight:700;">${item.initialLevel}级</td>
            <td style="padding:12px 10px; color:#64748b; font-size:12px;">${item.assignTime}</td>
            <td style="padding:12px 10px;">${item.agentAccount}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function switchOpsHqNurtureTab(key) {
  opsHqNurtureActiveTab = key;
  renderOpsHqNurtureReportPage();
}

// 复用总部人工预约明细的数据与渲染，不复制为新的线索数据集。
function openManualTestDriveAppointmentLeadPage() {
  if (typeof hideLeadPages === 'function') hideLeadPages();
  if (typeof setStrategyConfigTabsVisible === 'function') setStrategyConfigTabsVisible(false);
  if (typeof setManualAiConfigTabsVisible === 'function') setManualAiConfigTabsVisible(false);
  if (typeof setExcellentConfigManageTabsVisible === 'function') setExcellentConfigManageTabsVisible(false);
  if (typeof setLeadDispatchAuditTabsVisible === 'function') setLeadDispatchAuditTabsVisible(false);
  document.querySelector('nav[aria-label="培育策略三级菜单"]')?.classList.add('hidden');
  document.querySelector('.leads-nav')?.classList.remove('show');
  document.querySelector('.test-drive-nav')?.classList.add('show');
  document.querySelector('.reports-nav')?.classList.remove('show');
  document.querySelector('.ops-nav')?.classList.remove('show');
  if (typeof setSidebarActiveByName === 'function') setSidebarActiveByName('试驾排程');
  if (typeof setPageName === 'function') setPageName('NEV培育 / 试驾排程 / 人工坐席预约线索');
  if (typeof setPolicyContentVisible === 'function') setPolicyContentVisible(false);
  document.getElementById('designStage')?.classList.remove('show');

  const container = document.getElementById('opsHqNurtureReportPage');
  if (!container) return;
  container.dataset.appointmentSourceEntry = 'manual';
  if (typeof setTestDriveNavActive === 'function') setTestDriveNavActive('manual');
  opsHqNurtureActiveTab = 'testDriveDetail';
  container.classList.add('show');
  renderOpsHqNurtureReportPage();
}

function applyOpsHqNurtureFilter() {
  opsHqNurtureFilter.keyword = document.getElementById('hqFilterKeyword')?.value || document.getElementById('hqFilterTdCode')?.value || '';
  opsHqNurtureFilter.followStatus = document.getElementById('hqFilterFollowStatus')?.value || document.getElementById('hqFilterDriveStatus')?.value || '';
  opsHqNurtureFilter.agentAccount = document.getElementById('hqFilterAgent')?.value || document.getElementById('hqFilterAgentAccount')?.value || '';
  opsHqNurtureFilter.seriesCode = document.getElementById('hqFilterSeries')?.value || document.getElementById('hqFilterTdSeries')?.value || '';
  renderOpsHqNurtureReportPage();
  if (typeof showToast === 'function') {
    if (opsHqNurtureActiveTab === 'testDriveDetail') {
      showToast('【预约试驾明细】筛选查询已执行，已精准匹配排程数据', true);
    } else if (opsHqNurtureActiveTab === 'infoNotFullDetail') {
      showToast('【留资未满任务明细】筛选查询已执行，已对齐28项查询条件', true);
    } else if (opsHqNurtureActiveTab === 'messageRecord') {
      showToast('【短信记录】筛选查询已执行，已对齐10项短信查询条件', true);
    } else {
      showToast('培育报表筛选条件已更新', true);
    }
  }
}

function resetOpsHqNurtureFilter() {
  opsHqNurtureFilter = { keyword: '', followStatus: '', assignType: '', agentAccount: '', seriesCode: '', startDate: '2026-08-01', endDate: '2026-09-16' };
  renderOpsHqNurtureReportPage();
  if (typeof showToast === 'function') showToast('筛选条件已重置为默认范围', true);
}

function toggleOpsHqAdvancedFilter() {
  const reportPage = document.getElementById('opsHqNurtureReportPage');
  const manualFilterGrid = reportPage && reportPage.dataset.appointmentSourceEntry === 'manual'
    ? document.querySelector('#hqAdvancedFilterBox > div')
    : null;
  if (manualFilterGrid) {
    const expanded = manualFilterGrid.classList.toggle('show-advanced-fields');
    const label = expanded ? '更多筛选　收起' : '更多筛选　展开';
    const text = document.getElementById('hqAdvancedFilterText');
    const navText = document.getElementById('hqAdvancedFilterTextNav');
    if (text) text.textContent = label;
    if (navText) navText.textContent = label;
    return;
  }
  const box = document.getElementById('hqAdvancedFilterBox');
  const text = document.getElementById('hqAdvancedFilterText');
  if (!box) return;
  if (box.style.display === 'none' || !box.style.display) {
    box.style.display = 'block';
    if (text) text.textContent = '收起高级筛选 ▴';
  } else {
    box.style.display = 'none';
    if (text) text.textContent = '展开高级筛选 ▾';
  }
}

function exportOpsHqNurtureReport() {
  if (typeof showToast === 'function') showToast('正在生成【总部培育任务明细表_2026-09-16.xlsx】...', true);
}


/* ==================== 2. 录音列表 模块 ==================== */
let opsRecordingActiveTab = 'all'; // 'all' | 'ai' | 'manual'
let opsRecordingFilter = {
  taskCode: '',
  leadCode: '',
  phone: '',
  customerName: '',
  callType: '',
  seat: '',
  callStatus: '',
  duration: '',
  series: '',
  qcStatus: '',
  hangupSide: '',
  startDate: '2026-09-01',
  endDate: '2026-09-16'
};

const opsRecordingMockData = [
  {
    id: 1,
    recId: 'REC20260916001',
    taskCode: 'TASK20260916001',
    leadId: 'CLUE1883735719',
    customerName: '张敏捷',
    phone: '138****5678',
    callType: '人工客服外呼',
    seatAccount: '电销D组-张敏',
    callerNumber: '020-88886666',
    callTime: '2026-09-16 09:35:12',
    endTime: '2026-09-16 09:37:34',
    duration: 142,
    durationText: '02分22秒',
    statusName: '已接通',
    intentSeries: '2026款探陆',
    hangupSide: '客户挂断',
    qcStatus: '质检合格',
    transcript: [
      { speaker: '坐席 (张敏)', time: '00:03', text: '您好，张敏捷先生！这里是东风日产官方客户培育中心，看到您在官方小程序咨询了2026款探陆。' },
      { speaker: '客户', time: '00:12', text: '对的，我想了解下置换补贴和现在的贷款免息政策具体是怎么算的。' },
      { speaker: '坐席 (张敏)', time: '00:20', text: '探陆目前针对老车主置换可享至高12000元国家及厂家双重置换补贴，同时提供2年0息或5年超长低息分期金融方案。' },
      { speaker: '客户', time: '00:45', text: '那周末去广州天河店试驾有现车吗？' },
      { speaker: '坐席 (张敏)', time: '01:02', text: '天河店有探陆380T旗舰版四驱试驾车，我可以先为您预约周六上午10点，届时安排金牌顾问李强接待您。' },
      { speaker: '客户', time: '02:10', text: '好的，那麻烦帮我排个程，周六我直接过去。' },
      { speaker: '坐席 (张敏)', time: '02:18', text: '好的，稍后排程确认短信将发送给您，祝您生活愉快，再见！' }
    ]
  },
  {
    id: 2,
    recId: 'REC20260916002',
    taskCode: 'TASK20260916002',
    leadId: 'CLUE1883735720',
    customerName: '李思媛',
    phone: '159****9999',
    callType: '人工客服外呼',
    seatAccount: '电销A组-李雷',
    callerNumber: '021-68885555',
    callTime: '2026-09-16 10:20:45',
    endTime: '2026-09-16 10:22:13',
    duration: 88,
    durationText: '01分28秒',
    statusName: '已接通',
    intentSeries: 'N6',
    hangupSide: '坐席挂断',
    qcStatus: '质检合格',
    transcript: [
      { speaker: '坐席 (李雷)', time: '00:02', text: '您好，请问是李思媛女士吗？我是东风日产纯电专属客服李雷。' },
      { speaker: '客户', time: '00:10', text: '是的，你们N6的550km智驾版本续航在冬天打折厉害吗？' },
      { speaker: '坐席 (李雷)', time: '00:18', text: 'N6搭载了新一代全温域高效热泵空调系统，即使在北方低温环境下，实测续航保持率也能达到75%以上。' },
      { speaker: '客户', time: '00:50', text: '了解了，那我在上海浦东，可以预约到店试驾吗？' },
      { speaker: '坐席 (李雷)', time: '01:10', text: '完全可以，浦东专营店随时支持试驾体验，已为您录入专属试驾邀约。' }
    ]
  },
  {
    id: 3,
    recId: 'REC20260916003',
    taskCode: 'TASK20260916003',
    leadId: 'CLUE1883735721',
    customerName: '王建国',
    phone: '186****6666',
    callType: 'AI智能外呼',
    seatAccount: 'AI呼叫机器人-01',
    callerNumber: '010-89991111',
    callTime: '2026-09-16 11:05:00',
    endTime: '2026-09-16 11:05:45',
    duration: 45,
    durationText: '00分45秒',
    statusName: '已接通',
    intentSeries: 'N7',
    hangupSide: '客户挂断',
    qcStatus: '质检合格',
    transcript: [
      { speaker: 'AI机器人', time: '00:02', text: '您好，王先生！我是东风日产智能AI助理，关注到您近期在车展了解过N7激光雷达版。' },
      { speaker: '客户', time: '00:15', text: '我现在在开会，暂时不方便接电话，下午再说吧。' },
      { speaker: 'AI机器人', time: '00:26', text: '好的，打扰您了！稍后我们通过短信将N7最新权益发送给您，祝您工作顺利！' }
    ]
  },
  {
    id: 4,
    recId: 'REC20260916004',
    taskCode: 'TASK20260916004',
    leadId: 'CLUE1883735722',
    customerName: '赵海峰',
    phone: '135****5555',
    callType: '预外呼',
    seatAccount: '电销C组-赵六',
    callerNumber: '0755-82223333',
    callTime: '2026-09-16 13:25:30',
    endTime: '2026-09-16 13:29:00',
    duration: 210,
    durationText: '03分30秒',
    statusName: '已接通',
    intentSeries: 'NX8',
    hangupSide: '客户挂断',
    qcStatus: '质检合格',
    transcript: [
      { speaker: '坐席 (赵六)', time: '00:03', text: '赵先生您好！我是东风日产电销中心赵六，您在汽车之家关注的全新NX8四驱旗舰版已到店。' },
      { speaker: '客户', time: '00:20', text: '你们这款车和比亚迪唐EV对比优势在哪？' },
      { speaker: '坐席 (赵六)', time: '00:35', text: 'NX8在日产大沙发舒适性底盘调校、静音座舱与合资安全碰撞测试中具备显著优势，特别适合家庭长途自驾。' },
      { speaker: '客户', time: '02:00', text: '听起来不错，深圳福田店有车试驾吗？我周天去看看。' },
      { speaker: '坐席 (赵六)', time: '02:40', text: '有的赵先生，已为您锁定周日上午11点福田店的VIP试驾通道！' }
    ]
  },
  {
    id: 5,
    recId: 'REC20260916005',
    taskCode: 'TASK20260916005',
    leadId: 'CLUE1883735723',
    customerName: '陈雅莉',
    phone: '139****2222',
    callType: '人工客服外呼',
    seatAccount: '电销D组-张敏',
    callerNumber: '028-86667777',
    callTime: '2026-09-16 14:45:10',
    endTime: '2026-09-16 14:46:12',
    duration: 62,
    durationText: '01分02秒',
    statusName: '已接通',
    intentSeries: '轩逸',
    hangupSide: '客户挂断',
    qcStatus: '质检预警',
    transcript: [
      { speaker: '坐席 (张敏)', time: '00:03', text: '陈女士您好，这里是东风日产客户关怀中心，请问您对轩逸超混电驱车型还有意向吗？' },
      { speaker: '客户', time: '00:15', text: '你们价格怎么天天变啊，我之前看优惠两万，现在店里又说只有一万五？' },
      { speaker: '坐席 (张敏)', time: '00:30', text: '非常理解您的顾虑，厂家政策确实会有按月微调，但我这边可以为您向总部申请保留老车主特惠礼包。' }
    ]
  },
  {
    id: 6,
    recId: 'REC20260916006',
    taskCode: 'TASK20260916006',
    leadId: 'CLUE1883735724',
    customerName: '刘志远',
    phone: '189****8888',
    callType: 'AI智能外呼',
    seatAccount: 'AI呼叫机器人-02',
    callerNumber: '020-88886666',
    callTime: '2026-09-16 15:10:00',
    endTime: '2026-09-16 15:10:25',
    duration: 25,
    durationText: '00分25秒',
    statusName: '无人接听',
    intentSeries: '2026款探陆',
    hangupSide: '系统超时',
    qcStatus: '未转写',
    transcript: []
  }
];

const opsAiRecordingMockData = [
  {
    id: 1,
    hqClueId: 'HQ_CLUE_1883735719',
    hqNurtureLeadCode: 'PY20260916001',
    hqAiVisitCode: 'AIRV20260916001',
    callType: 'AI智能外呼',
    callId: 'CALL_AI_982371901',
    phone: '13812345678',
    callTag: '高意向A级',
    wechat: 'wx_zhangw98',
    callStartTime: '2026-09-16 10:20:15',
    callEndTime: '2026-09-16 10:21:47',
    recordGenTime: '2026-09-16 10:21:50',
    durationSec: 92,
    callStatus: '已接通',
    syncTime: '2026-09-16 10:22:05',
    createTime: '2026-09-16 10:19:50',
    creator: 'AI智能外呼调度引擎',
    customerName: '张敏捷',
    taskCode: 'TASK20260916001',
    transcript: [
      { speaker: 'AI语音机器人', time: '10:20:15', text: '您好！请问是张敏捷先生吗？我是东风日产总部客户关怀中心的智能助手小妮。' },
      { speaker: '客户', time: '10:20:20', text: '对，我是，有什么事吗？' },
      { speaker: 'AI语音机器人', time: '10:20:23', text: '看到您之前了解过2026款探陆，目前本月有8000元置换置顶补贴以及2年0息政策，想了解下您近期是否有到店试驾打算？' },
      { speaker: '客户', time: '10:20:35', text: '政策还可以，我这周末刚好有空，可以去天河专营店看看实车。' },
      { speaker: 'AI语音机器人', time: '10:20:42', text: '太好了！已为您预约本周六广州天河专营店专属试驾体验，稍后专属顾问会通过企业微信联系您，祝您生活愉快！' }
    ]
  },
  {
    id: 2,
    hqClueId: 'HQ_CLUE_1883735720',
    hqNurtureLeadCode: 'PY20260916002',
    hqAiVisitCode: 'AIRV20260916002',
    callType: 'AI重播外呼',
    callId: 'CALL_AI_982371902',
    phone: '15988889999',
    callTag: '高意向H级',
    wechat: 'li_na_gz',
    callStartTime: '2026-09-16 11:05:00',
    callEndTime: '2026-09-16 11:07:05',
    recordGenTime: '2026-09-16 11:07:08',
    durationSec: 125,
    callStatus: '已接通',
    syncTime: '2026-09-16 11:07:20',
    createTime: '2026-09-16 11:04:30',
    creator: 'AI智能外呼调度引擎',
    customerName: '李思媛',
    taskCode: 'TASK20260916002',
    transcript: [
      { speaker: 'AI语音机器人', time: '11:05:00', text: '您好李女士！东风日产智能中心为您回访，关于您预约的全新纯电轿跑N6试驾。' },
      { speaker: '客户', time: '11:05:08', text: '你好，N6续航和智驾辅助系统到店可以实测吗？' },
      { speaker: 'AI语音机器人', time: '11:05:14', text: '可以的李女士，目前到店试驾车配备了高阶高速领航辅助NOP系统，随时可以体验。' }
    ]
  },
  {
    id: 3,
    hqClueId: 'HQ_CLUE_1883735721',
    hqNurtureLeadCode: 'PY20260916003',
    hqAiVisitCode: 'AIRV20260916003',
    callType: 'AI首次回访',
    callId: 'CALL_AI_982371903',
    phone: '18677776666',
    callTag: '无人接听',
    wechat: '-',
    callStartTime: '2026-09-16 11:30:10',
    callEndTime: '2026-09-16 11:30:35',
    recordGenTime: '2026-09-16 11:30:36',
    durationSec: 0,
    callStatus: '无人接听',
    syncTime: '2026-09-16 11:30:45',
    createTime: '2026-09-16 11:29:55',
    creator: '系统自动重拨任务',
    customerName: '王强',
    taskCode: 'TASK20260916003',
    transcript: []
  },
  {
    id: 4,
    hqClueId: 'HQ_CLUE_1883735722',
    hqNurtureLeadCode: 'PY20260916004',
    hqAiVisitCode: 'AIRV20260916004',
    callType: 'AI预约关怀',
    callId: 'CALL_AI_982371904',
    phone: '13566665555',
    callTag: '邀约试驾成功',
    wechat: 'wx_zhaojun',
    callStartTime: '2026-09-16 14:15:20',
    callEndTime: '2026-09-16 14:17:35',
    recordGenTime: '2026-09-16 14:17:38',
    durationSec: 135,
    callStatus: '已接通',
    syncTime: '2026-09-16 14:18:00',
    createTime: '2026-09-16 14:14:40',
    creator: 'AI智能外呼调度引擎',
    customerName: '赵军',
    taskCode: 'TASK20260916004',
    transcript: [
      { speaker: 'AI语音机器人', time: '14:15:20', text: '您好赵先生！这里是东风日产总部智能服务，关于您关注的新款探陆。' },
      { speaker: '客户', time: '14:15:28', text: '优惠政策还有吗？' },
      { speaker: 'AI语音机器人', time: '14:15:32', text: '本周下订赠送专属露营套装并享终身基础保养，您看为您预约明天上午还是下午到店？' },
      { speaker: '客户', time: '14:15:45', text: '明天上午10点吧。' }
    ]
  },
  {
    id: 5,
    hqClueId: 'HQ_CLUE_1883735723',
    hqNurtureLeadCode: 'PY20260916005',
    hqAiVisitCode: 'AIRV20260916005',
    callType: 'AI首次回访',
    callId: 'CALL_AI_982371905',
    phone: '13911112222',
    callTag: '客户拒接',
    wechat: '-',
    callStartTime: '2026-09-16 15:10:00',
    callEndTime: '2026-09-16 15:10:08',
    recordGenTime: '2026-09-16 15:10:10',
    durationSec: 8,
    callStatus: '客户拒接',
    syncTime: '2026-09-16 15:10:20',
    createTime: '2026-09-16 15:09:30',
    creator: 'AI智能外呼调度引擎',
    customerName: '陈丽',
    taskCode: 'TASK20260916005',
    transcript: [
      { speaker: 'AI语音机器人', time: '15:10:00', text: '您好陈女士！东风日产智能中心为您回访...' },
      { speaker: '客户', time: '15:10:04', text: '开会呢，别打了。（挂断）' }
    ]
  },
  {
    id: 6,
    hqClueId: 'HQ_CLUE_1883735724',
    hqNurtureLeadCode: 'PY20260916006',
    hqAiVisitCode: 'AIRV20260916006',
    callType: 'AI智能外呼',
    callId: 'CALL_AI_982371906',
    phone: '18922223333',
    callTag: '高意向A级',
    wechat: 'sun_ming_dcc',
    callStartTime: '2026-09-16 16:00:15',
    callEndTime: '2026-09-16 16:01:45',
    recordGenTime: '2026-09-16 16:01:48',
    durationSec: 90,
    callStatus: '已接通',
    syncTime: '2026-09-16 16:02:00',
    createTime: '2026-09-16 15:59:40',
    creator: 'AI智能外呼调度引擎',
    customerName: '孙明',
    taskCode: 'TASK20260916006',
    transcript: [
      { speaker: 'AI语音机器人', time: '16:00:15', text: '您好孙先生！东风日产智能中心关于新能源旗舰车系N7给您致电。' },
      { speaker: '客户', time: '16:00:22', text: 'N7激光雷达版现车什么时候能交付？' },
      { speaker: 'AI语音机器人', time: '16:00:26', text: '首批锁单预计15个工作日内交付，当前下定还可获赠3年免费智驾体验包。' }
    ]
  }
];

const opsManualRecordingMockData = [
  {
    id: 1,
    hqClueId: 'HQ_CLUE_1883735719',
    phone: '13812345678',
    seatAccount: '电销D组-张敏',
    taskCode: 'TASK20260916001',
    recordTime: '2026-09-16 09:35:12',
    durationText: '02分22秒',
    durationSec: 142,
    createTime: '2026-09-16 09:37:35',
    customerName: '张敏捷',
    transcript: [
      { speaker: '坐席 (张敏)', time: '00:03', text: '您好，张敏捷先生！这里是东风日产官方客户培育中心，看到您在官方小程序咨询了2026款探陆。' },
      { speaker: '客户', time: '00:12', text: '对的，我想了解下置换补贴和现在的贷款免息政策具体是怎么算的。' },
      { speaker: '坐席 (张敏)', time: '00:20', text: '探陆目前针对老车主置换可享至高12000元国家及厂家双重置换补贴，同时提供2年0息或5年超长低息分期金融方案。' },
      { speaker: '客户', time: '00:45', text: '那周末去广州天河店试驾有现车吗？' },
      { speaker: '坐席 (张敏)', time: '01:02', text: '天河店有探陆380T旗舰版四驱试驾车，我可以先为您预约周六上午10点，届时安排金牌顾问李强接待您。' },
      { speaker: '客户', time: '02:10', text: '好的，那麻烦帮我排个程，周六我直接过去。' },
      { speaker: '坐席 (张敏)', time: '02:18', text: '好的，稍后排程确认短信将发送给您，祝您生活愉快，再见！' }
    ]
  },
  {
    id: 2,
    hqClueId: 'HQ_CLUE_1883735720',
    phone: '15988889999',
    seatAccount: '电销A组-李雷',
    taskCode: 'TASK20260916002',
    recordTime: '2026-09-16 10:20:45',
    durationText: '01分28秒',
    durationSec: 88,
    createTime: '2026-09-16 10:22:15',
    customerName: '李思媛',
    transcript: [
      { speaker: '坐席 (李雷)', time: '00:02', text: '您好李女士，东风日产专属客服李雷，关于纯电N6试驾体验与您确认下。' },
      { speaker: '客户', time: '00:10', text: '你好，N6后排空间和智驾辅助在上海浦东店能体验到吗？' },
      { speaker: '坐席 (李雷)', time: '00:18', text: '完全可以的，浦东店配备专属城市智能辅助试驾路线，已为您安排好接待。' }
    ]
  },
  {
    id: 3,
    hqClueId: 'HQ_CLUE_1883735721',
    phone: '18677776666',
    seatAccount: '电销B组-王五',
    taskCode: 'TASK20260916003',
    recordTime: '2026-09-16 11:15:30',
    durationText: '00分18秒',
    durationSec: 18,
    createTime: '2026-09-16 11:15:50',
    customerName: '王强',
    transcript: [
      { speaker: '坐席 (王五)', time: '00:02', text: '您好王先生，东风日产北京朝阳店跟进回访...' },
      { speaker: '客户', time: '00:08', text: '正在开车，稍后再联系吧。（挂机）' }
    ]
  },
  {
    id: 4,
    hqClueId: 'HQ_CLUE_1883735722',
    phone: '13566665555',
    seatAccount: '电销C组-赵六',
    taskCode: 'TASK20260916004',
    recordTime: '2026-09-16 13:40:10',
    durationText: '03分12秒',
    durationSec: 192,
    createTime: '2026-09-16 13:43:25',
    customerName: '赵军',
    transcript: [
      { speaker: '坐席 (赵六)', time: '00:03', text: '赵先生您好，东风日产深圳福田店客服赵六，为您解答NX8新车上市权益。' },
      { speaker: '客户', time: '00:15', text: 'NX8豪华版和旗舰四驱版的差价主要在哪些配置上？' },
      { speaker: '坐席 (赵六)', time: '00:25', text: '旗舰版多了前后双电机智能电四驱、HUD抬头显示以及BOSE音响系统，现阶段订车可享免费升级轮毂权益。' }
    ]
  },
  {
    id: 5,
    hqClueId: 'HQ_CLUE_1883735723',
    phone: '13911112222',
    seatAccount: '电销D组-张敏',
    taskCode: 'TASK20260916005',
    recordTime: '2026-09-16 14:50:20',
    durationText: '00分45秒',
    durationSec: 45,
    createTime: '2026-09-16 14:51:08',
    customerName: '陈丽',
    transcript: [
      { speaker: '坐席 (张敏)', time: '00:02', text: '您好陈女士，东风日产成都高新店回访，关于轩逸超混电驱。' },
      { speaker: '客户', time: '00:12', text: '下周我出差回成都再联系你们，目前还在外地。' }
    ]
  },
  {
    id: 6,
    hqClueId: 'HQ_CLUE_1883735725',
    phone: '17700001111',
    seatAccount: '电销A组-李雷',
    taskCode: 'TASK20260916007',
    recordTime: '2026-09-16 16:15:00',
    durationText: '01分55秒',
    durationSec: 115,
    createTime: '2026-09-16 16:17:00',
    customerName: '周建国',
    transcript: [
      { speaker: '坐席 (李雷)', time: '00:03', text: '您好周先生，东风日产官方客服为您回访，关于您在天猫旗舰店留资的天籁。' },
      { speaker: '客户', time: '00:15', text: '我想置换老款天籁，旧车能直接抵扣首付吗？' },
      { speaker: '坐席 (李雷)', time: '00:25', text: '完全可以的周先生，专营店提供免费二手车评估，旧车残值可直接抵扣新车首付款并叠加老车主补贴。' }
    ]
  }
];

function renderOpsRecordingListPage() {
  const container = document.getElementById('opsRecordingListPage');
  if (!container) return;

  // 如果处于 AI 外呼录音 Tab，渲染专用的 AI 外呼录音界面（17个业务字段 + 1个操作列，14个筛选查询字段）
  if (opsRecordingActiveTab === 'ai') {
    renderOpsAiRecordingPage(container);
    return;
  }

  // 如果处于 人工客服录音 Tab，渲染专用的人工客服录音界面（8个业务字段 + 1个操作列，7个筛选查询字段）
  if (opsRecordingActiveTab === 'manual') {
    renderOpsManualRecordingPage(container);
    return;
  }

  const filteredData = opsRecordingMockData;

  container.innerHTML = `
    <div class="mw-report-container" style="padding:16px;">
      <!-- 子 Tab 导航栏 -->
      <nav class="mw-sub-tabs" style="display:flex; gap:8px; border-bottom:1px solid #e2e8f0; margin-bottom:16px; padding-bottom:12px;">
        <button type="button" class="btn-sub-tab ${opsRecordingActiveTab==='all'?'active':''}" 
                style="padding:8px 18px; border:none; background:${opsRecordingActiveTab==='all'?'#2563eb':'#f8fafc'}; color:${opsRecordingActiveTab==='all'?'#fff':'#475569'}; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsRecordingActiveTab='all'; renderOpsRecordingListPage();">全部录音</button>
        <button type="button" class="btn-sub-tab ${opsRecordingActiveTab==='ai'?'active':''}" 
                style="padding:8px 18px; border:none; background:${opsRecordingActiveTab==='ai'?'#2563eb':'#f8fafc'}; color:${opsRecordingActiveTab==='ai'?'#fff':'#475569'}; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsRecordingActiveTab='ai'; renderOpsRecordingListPage();">AI外呼录音</button>
        <button type="button" class="btn-sub-tab ${opsRecordingActiveTab==='manual'?'active':''}" 
                style="padding:8px 18px; border:none; background:${opsRecordingActiveTab==='manual'?'#2563eb':'#f8fafc'}; color:${opsRecordingActiveTab==='manual'?'#fff':'#475569'}; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsRecordingActiveTab='manual'; renderOpsRecordingListPage();">人工客服录音</button>
      </nav>

      <!-- 5个核心指标汇总卡片 -->
      <section class="mw-report-summary" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:16px; margin-bottom:16px;">
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">录音总文件数</span>
          <div style="font-size:24px; font-weight:800; color:#0f172a; margin-top:6px;">2,460 <small style="font-size:12px; font-weight:normal; color:#64748b;">条</small></div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">通话接通率</span>
          <div style="font-size:24px; font-weight:800; color:#1677ff; margin-top:6px;">84.5%</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">平均通话时长</span>
          <div style="font-size:24px; font-weight:800; color:#52c41a; margin-top:6px;">01分48秒</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">文本转写覆盖率</span>
          <div style="font-size:24px; font-weight:800; color:#722ed1; margin-top:6px;">96.8%</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">质检合规率</span>
          <div style="font-size:24px; font-weight:800; color:#fa8c16; margin-top:6px;">98.6%</div>
        </div>
      </section>

      <!-- 筛选查询卡片 (12项标准业务条件，4列网格排布) -->
      <section class="mw-report-filter-card" style="background:#fff; border-radius:10px; padding:16px; margin-bottom:16px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="font-weight:700; font-size:14px; color:#0f172a; display:flex; align-items:center; gap:8px;">
            <span>录音筛选查询</span>
            <span style="font-size:12px; font-weight:normal; color:#64748b;">(12项字段与呼叫中心业务标准 1:1 精确对齐)</span>
          </div>
          <button type="button" style="border:none; background:none; color:#2563eb; font-size:12px; cursor:pointer; font-weight:600;" onclick="toggleOpsRecordingAdvancedFilter()">
            <span id="recAdvancedFilterText">收起 ∧</span>
          </button>
        </div>

        <div id="recAdvancedFilterBox" style="display:block;">
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px 16px;">
            <!-- 第 1 行 (4列) -->
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              任务编码：
              <input class="form-input" id="recFilterTaskCode" placeholder="请输入任务编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              培育线索编码：
              <input class="form-input" id="recFilterLeadCode" placeholder="请输入线索编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              客户电话：
              <input class="form-input" id="recFilterPhone" placeholder="请输入手机号或后四位" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              客户姓名：
              <input class="form-input" id="recFilterCustName" placeholder="请输入客户姓名" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>

            <!-- 第 2 行 (4列) -->
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              外呼类型：
              <select class="form-input" id="recFilterCallType" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部类型</option>
                <option value="AI智能外呼">AI智能外呼</option>
                <option value="人工客服外呼">人工客服外呼</option>
                <option value="预外呼">预外呼</option>
              </select>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              坐席账号/机器人：
              <select class="form-input" id="recFilterSeat" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部坐席/机器人</option>
                <option value="电销A组-李雷">电销A组-李雷</option>
                <option value="电销B组-王五">电销B组-王五</option>
                <option value="电销C组-赵六">电销C组-赵六</option>
                <option value="电销D组-张敏">电销D组-张敏</option>
                <option value="AI呼叫机器人-01">AI呼叫机器人-01</option>
                <option value="AI呼叫机器人-02">AI呼叫机器人-02</option>
              </select>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              通话接通状态：
              <select class="form-input" id="recFilterCallStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部状态</option>
                <option value="已接通">已接通</option>
                <option value="无人接听">无人接听</option>
                <option value="客户忙挂断">客户忙挂断</option>
                <option value="关机/停机">关机/停机</option>
                <option value="空号">空号</option>
              </select>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              通话时长区间：
              <select class="form-input" id="recFilterDuration" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部时长</option>
                <option value="0-15">0 - 15秒 (瞬挂/振铃异常)</option>
                <option value="15-60">15 - 60秒 (短沟通)</option>
                <option value="60-180">1 - 3分钟 (标准深度沟通)</option>
                <option value="180+">3分钟以上 (高意向详谈)</option>
              </select>
            </label>

            <!-- 第 3 行 (4列) -->
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              意向车系：
              <select class="form-input" id="recFilterSeries" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部车系</option>
                <option value="2026款探陆">2026款探陆</option>
                <option value="N6">N6</option>
                <option value="N7">N7</option>
                <option value="NX8">NX8</option>
                <option value="轩逸">轩逸</option>
              </select>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              质检与转写状态：
              <select class="form-input" id="recFilterQcStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部状态</option>
                <option value="质检合格">质检合格</option>
                <option value="质检预警">质检预警</option>
                <option value="未转写">未转写</option>
              </select>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              挂机方类型：
              <select class="form-input" id="recFilterHangupSide" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部</option>
                <option value="客户挂断">客户挂断</option>
                <option value="坐席挂断">坐席挂断</option>
                <option value="系统超时">系统超时</option>
              </select>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              呼叫时间范围：
              <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
                <input class="form-input" type="date" value="2026-09-01" id="recStartDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
                <span style="color:#94a3b8; font-size:12px;">→</span>
                <input class="form-input" type="date" value="2026-09-16" id="recEndDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
              </div>
            </label>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
          <button type="button" style="height:32px; padding:0 18px; background:#fff; border:1px solid #d9d9d9; color:#1e293b; border-radius:4px; font-size:13px; cursor:pointer;" onclick="resetOpsRecordingFilter()">重置</button>
          <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="applyOpsRecordingFilter()">查询</button>
          <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="if(typeof showToast==='function') showToast('正在批量打包导出选定条件的录音文件(ZIP)...', true);">批量导出录音</button>
          <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="renderOpsRecordingListPage()">刷新</button>
        </div>
      </section>

      <!-- 录音数据表格 (16项标准业务字段 + 1项操作列，共 17 列) -->
      <section class="mw-report-table-card" style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div class="mw-report-table-toolbar" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">录音列表 (共 ${filteredData.length} 条记录)</h4>
          <div style="display:flex; gap:8px;">
            <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;" onclick="if(typeof showToast==='function') showToast('正在导出录音列表数据清单...', true);">导出表格清单</button>
            <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>呼叫开始时间</option><option>通话时长</option></select>
            <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>降序</option><option>升序</option></select>
            <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;">字段显示</button>
          </div>
        </div>

        <div class="mw-report-table-scroll" style="overflow-x:auto;">
          <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; white-space:nowrap;">
            <thead>
              <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0; color:#334155; font-weight:600;">
                <th style="padding:10px 8px;">序号</th>
                <th style="padding:10px 8px;">录音流水号</th>
                <th style="padding:10px 8px;">任务编码</th>
                <th style="padding:10px 8px;">培育线索编码</th>
                <th style="padding:10px 8px;">客户姓名</th>
                <th style="padding:10px 8px;">客户电话</th>
                <th style="padding:10px 8px;">外呼类型</th>
                <th style="padding:10px 8px;">外呼坐席账号</th>
                <th style="padding:10px 8px;">主叫外显号</th>
                <th style="padding:10px 8px;">呼叫开始时间</th>
                <th style="padding:10px 8px;">呼叫结束时间</th>
                <th style="padding:10px 8px;">通话时长</th>
                <th style="padding:10px 8px;">通话结果</th>
                <th style="padding:10px 8px;">意向车系</th>
                <th style="padding:10px 8px;">挂断方</th>
                <th style="padding:10px 8px;">转写与质检状态</th>
                <th style="padding:10px 8px;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(item => `
                <tr style="border-bottom:1px solid #f1f5f9; color:#334155;">
                  <td style="padding:10px 8px; color:#64748b;">${item.id}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#2563eb; font-weight:700;">${item.recId}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.taskCode}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.leadId}</td>
                  <td style="padding:10px 8px; font-weight:600; color:#0f172a;">${item.customerName}</td>
                  <td style="padding:10px 8px; font-family:monospace;">${item.phone}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.callType.includes('AI') ? '#eff6ff' : '#f0fdf4'}; color:${item.callType.includes('AI') ? '#1d4ed8' : '#15803d'};">${item.callType}</span>
                  </td>
                  <td style="padding:10px 8px; font-weight:500;">${item.seatAccount}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#64748b;">${item.callerNumber}</td>
                  <td style="padding:10px 8px; color:#0f172a;">${item.callTime}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.endTime}</td>
                  <td style="padding:10px 8px; font-weight:700; color:#059669;">${item.durationText}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; background:${item.statusName==='已接通'?'#dcfce7':'#fee2e2'}; color:${item.statusName==='已接通'?'#166534':'#991b1b'};">${item.statusName}</span>
                  </td>
                  <td style="padding:10px 8px; font-weight:500;">${item.intentSeries}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.hangupSide}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.qcStatus==='质检合格'?'#ecfdf5':item.qcStatus==='质检预警'?'#fef2f2':'#f1f5f9'}; color:${item.qcStatus==='质检合格'?'#047857':item.qcStatus==='质检预警'?'#b91c1c':'#64748b'};">${item.qcStatus}</span>
                  </td>
                  <td style="padding:10px 8px; white-space:nowrap;">
                    <button type="button" style="color:#2563eb; border:none; background:none; cursor:pointer; font-weight:600; margin-right:6px;" onclick="openOpsAudioPlayerModal('${item.phone}', '${item.durationText}', '${item.recId}', '${item.customerName}')">🎵 试听</button>
                    <button type="button" style="color:#7c3aed; border:none; background:none; cursor:pointer; font-weight:600; margin-right:6px;" onclick="openOpsAudioTranscriptModal('${item.recId}')">📄 文本</button>
                    <button type="button" style="color:#059669; border:none; background:none; cursor:pointer; font-weight:600; margin-right:6px;" onclick="if(typeof showToast==='function') showToast('录音文件 ${item.recId}.wav 开始下载...', true)">💾 下载</button>
                    <button type="button" style="color:#64748b; border:none; background:none; cursor:pointer; font-weight:500;" onclick="openOpsWorkorderDetailModal('${item.taskCode}')">工单</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <footer class="mw-report-pagination" style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#64748b;">
          <span>共 ${filteredData.length} 条记录，当前第 1 / 1 页</span>
          <div style="display:flex; gap:6px; align-items:center;">
            <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>每页 10 条</option></select>
            <button type="button" style="height:28px; padding:0 8px;" disabled>‹</button>
            <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>第 1 页</option></select>
            <button type="button" style="height:28px; padding:0 8px;" disabled>›</button>
          </div>
        </footer>
      </section>
    </div>
  `;
}

/* ==================== AI外呼录音 专用渲染函数 (17个业务字段 + 1个操作列，14项筛选查询条件) ==================== */
function renderOpsAiRecordingPage(container) {
  const data = opsAiRecordingMockData;

  container.innerHTML = `
    <div class="mw-report-container" style="padding:16px;">
      <!-- 子 Tab 导航栏 -->
      <nav class="mw-sub-tabs" style="display:flex; gap:8px; border-bottom:1px solid #e2e8f0; margin-bottom:16px; padding-bottom:12px;">
        <button type="button" class="btn-sub-tab ${opsRecordingActiveTab==='all'?'active':''}" 
                style="padding:8px 18px; border:none; background:${opsRecordingActiveTab==='all'?'#2563eb':'#f8fafc'}; color:${opsRecordingActiveTab==='all'?'#fff':'#475569'}; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsRecordingActiveTab='all'; renderOpsRecordingListPage();">全部录音</button>
        <button type="button" class="btn-sub-tab ${opsRecordingActiveTab==='ai'?'active':''}" 
                style="padding:8px 18px; border:none; background:${opsRecordingActiveTab==='ai'?'#2563eb':'#f8fafc'}; color:${opsRecordingActiveTab==='ai'?'#fff':'#475569'}; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsRecordingActiveTab='ai'; renderOpsRecordingListPage();">AI外呼录音</button>
        <button type="button" class="btn-sub-tab ${opsRecordingActiveTab==='manual'?'active':''}" 
                style="padding:8px 18px; border:none; background:${opsRecordingActiveTab==='manual'?'#2563eb':'#f8fafc'}; color:${opsRecordingActiveTab==='manual'?'#fff':'#475569'}; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsRecordingActiveTab='manual'; renderOpsRecordingListPage();">人工客服录音</button>
      </nav>

      <!-- 5个AI外呼专属核心指标汇总卡片 -->
      <section class="mw-report-summary" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:16px; margin-bottom:16px;">
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">AI外呼录音总数</span>
          <div style="font-size:24px; font-weight:800; color:#0f172a; margin-top:6px;">1,280 <small style="font-size:12px; font-weight:normal; color:#64748b;">条</small></div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">AI外呼接通率</span>
          <div style="font-size:24px; font-weight:800; color:#1677ff; margin-top:6px;">81.6%</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">平均通话时长</span>
          <div style="font-size:24px; font-weight:800; color:#52c41a; margin-top:6px;">88 秒</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">高意向识别数</span>
          <div style="font-size:24px; font-weight:800; color:#722ed1; margin-top:6px;">396 <small style="font-size:12px; font-weight:normal; color:#64748b;">单 (30.9%)</small></div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">试驾邀约成功</span>
          <div style="font-size:24px; font-weight:800; color:#fa8c16; margin-top:6px;">142 <small style="font-size:12px; font-weight:normal; color:#64748b;">单</small></div>
        </div>
      </section>

      <!-- AI外呼录音筛选查询卡片 (14项精准业务条件，4列网格排布) -->
      <section class="mw-report-filter-card" style="background:#fff; border-radius:10px; padding:16px; margin-bottom:16px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="font-weight:700; font-size:14px; color:#0f172a; display:flex; align-items:center; gap:8px;">
            <span>AI外呼录音筛选查询</span>
            <span style="font-size:12px; font-weight:normal; color:#64748b;">(14项字段与AI智能呼叫中心标准 1:1 精确对齐)</span>
          </div>
          <button type="button" style="border:none; background:none; color:#2563eb; font-size:12px; cursor:pointer; font-weight:600;" onclick="toggleOpsRecordingAdvancedFilter()">
            <span id="recAdvancedFilterText">收起 ∧</span>
          </button>
        </div>

        <div id="recAdvancedFilterBox" style="display:block;">
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px 16px;">
            <!-- 第 1 行 (4列)：线索编码与电话 -->
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              总部培育线索编码：
              <input class="form-input" id="recAiFilterLeadCode" placeholder="请输入总部培育线索编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              总部线索ID：
              <input class="form-input" id="recAiFilterClueId" placeholder="请输入总部线索ID" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              总部培育线索AI回访编码：
              <input class="form-input" id="recAiFilterVisitCode" placeholder="请输入AI回访编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              电话号码：
              <input class="form-input" id="recAiFilterPhone" placeholder="请输入手机号或后四位" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>

            <!-- 第 2 行 (4列)：通话ID与外呼属性 -->
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              通话ID：
              <input class="form-input" id="recAiFilterCallId" placeholder="请输入通话流水ID" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              外呼类型：
              <select class="form-input" id="recAiFilterCallType" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部类型</option>
                <option value="AI智能外呼">AI智能外呼</option>
                <option value="AI首次回访">AI首次回访</option>
                <option value="AI重播外呼">AI重播外呼</option>
                <option value="AI预约关怀">AI预约关怀</option>
              </select>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              通话状态：
              <select class="form-input" id="recAiFilterCallStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部状态</option>
                <option value="已接通">已接通</option>
                <option value="无人接听">无人接听</option>
                <option value="客户拒接">客户拒接</option>
                <option value="占线">占线</option>
                <option value="关机/停机">关机/停机</option>
                <option value="空号">空号</option>
              </select>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              通话标签：
              <select class="form-input" id="recAiFilterCallTag" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部标签</option>
                <option value="高意向H级">高意向H级</option>
                <option value="高意向A级">高意向A级</option>
                <option value="邀约试驾成功">邀约试驾成功</option>
                <option value="待人工跟进">待人工跟进</option>
                <option value="客户拒接">客户拒接</option>
                <option value="无人接听">无人接听</option>
              </select>
            </label>

            <!-- 第 3 行 (4列)：时长、微信号与时间 -->
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              微信号：
              <input class="form-input" id="recAiFilterWechat" placeholder="请输入客户微信号" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              通话时长(秒)：
              <select class="form-input" id="recAiFilterDuration" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部时长</option>
                <option value="0">0秒 (未接通)</option>
                <option value="1-10">1-10秒 (秒挂/拒接)</option>
                <option value="11-30">11-30秒 (短沟通)</option>
                <option value="31-60">31-60秒 (常规沟通)</option>
                <option value="61-180">61-180秒 (深度意向沟通)</option>
                <option value="180+">180秒以上 (高粘性意向)</option>
              </select>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              创建操作者：
              <select class="form-input" id="recAiFilterCreator" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部操作者</option>
                <option value="AI智能外呼调度引擎">AI智能外呼调度引擎</option>
                <option value="系统自动重拨任务">系统自动重拨任务</option>
                <option value="admin">admin</option>
                <option value="运营调度员">运营调度员</option>
              </select>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              通话开始时间：
              <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
                <input class="form-input" type="date" value="2026-09-01" id="recAiStartDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
                <span style="color:#94a3b8; font-size:12px;">→</span>
                <input class="form-input" type="date" value="2026-09-16" id="recAiEndDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
              </div>
            </label>

            <!-- 第 4 行 (4列)：同步与创建时间 -->
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              外呼结果同步时间：
              <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
                <input class="form-input" type="date" value="2026-09-01" id="recAiSyncStartDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
                <span style="color:#94a3b8; font-size:12px;">→</span>
                <input class="form-input" type="date" value="2026-09-16" id="recAiSyncEndDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
              </div>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              创建时间：
              <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
                <input class="form-input" type="date" value="2026-09-01" id="recAiCreateStartDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
                <span style="color:#94a3b8; font-size:12px;">→</span>
                <input class="form-input" type="date" value="2026-09-16" id="recAiCreateEndDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
              </div>
            </label>
            <div style="display:flex; align-items:flex-end;">
              <!-- 占位占满栅格平衡 -->
            </div>
            <div style="display:flex; align-items:flex-end;">
              <!-- 占位占满栅格平衡 -->
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
          <button type="button" style="height:32px; padding:0 18px; background:#fff; border:1px solid #d9d9d9; color:#1e293b; border-radius:4px; font-size:13px; cursor:pointer;" onclick="resetOpsAiRecordingFilter()">重置</button>
          <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="applyOpsAiRecordingFilter()">查询</button>
          <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="if(typeof showToast==='function') showToast('正在打包导出AI外呼录音音频文件(ZIP)...', true);">批量导出录音</button>
          <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="renderOpsRecordingListPage()">刷新</button>
        </div>
      </section>

      <!-- AI外呼录音数据表格 (严格对齐 17 项标准业务字段 + 1 项操作列，共 18 列) -->
      <section class="mw-report-table-card" style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div class="mw-report-table-toolbar" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">AI外呼录音列表 (共 ${data.length} 条记录)</h4>
          <div style="display:flex; gap:8px;">
            <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;" onclick="if(typeof showToast==='function') showToast('正在导出【AI外呼录音】数据清单...', true);">导出表格清单</button>
            <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>通话开始时间</option><option>通话时长(秒)</option><option>创建时间</option></select>
            <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>降序</option><option>升序</option></select>
            <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;">字段显示</button>
          </div>
        </div>

        <div class="mw-report-table-scroll" style="overflow-x:auto;">
          <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; white-space:nowrap;">
            <thead>
              <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0; color:#334155; font-weight:600;">
                <th style="padding:10px 8px;">序号</th>
                <th style="padding:10px 8px;">总部线索ID</th>
                <th style="padding:10px 8px;">总部培育线索编码</th>
                <th style="padding:10px 8px;">总部培育线索AI回访编码</th>
                <th style="padding:10px 8px;">外呼类型</th>
                <th style="padding:10px 8px;">通话ID</th>
                <th style="padding:10px 8px;">电话号码</th>
                <th style="padding:10px 8px;">通话标签</th>
                <th style="padding:10px 8px;">微信号</th>
                <th style="padding:10px 8px;">通话开始时间</th>
                <th style="padding:10px 8px;">通话结束时间</th>
                <th style="padding:10px 8px;">通话记录生成时间</th>
                <th style="padding:10px 8px; text-align:right;">通话时长(秒)</th>
                <th style="padding:10px 8px;">通话状态</th>
                <th style="padding:10px 8px;">外呼结果同步时间</th>
                <th style="padding:10px 8px;">创建时间</th>
                <th style="padding:10px 8px;">创建操作者</th>
                <th style="padding:10px 8px; text-align:center;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr style="border-bottom:1px solid #f1f5f9; color:#334155;">
                  <td style="padding:10px 8px; color:#64748b;">${item.id}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.hqClueId}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#2563eb; font-weight:700;">${item.hqNurtureLeadCode}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#6366f1; font-weight:600;">${item.hqAiVisitCode}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#eff6ff; color:#1d4ed8; font-weight:500;">${item.callType}</span>
                  </td>
                  <td style="padding:10px 8px; font-family:monospace; color:#0f172a; font-weight:600;">${item.callId}</td>
                  <td style="padding:10px 8px; font-family:monospace;">${item.phone}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.callTag.includes('高意向')?'#ecfdf5':item.callTag.includes('成功')?'#eff6ff':item.callTag.includes('拒接')?'#fef2f2':'#f1f5f9'}; color:${item.callTag.includes('高意向')?'#047857':item.callTag.includes('成功')?'#1d4ed8':item.callTag.includes('拒接')?'#b91c1c':'#475569'}; font-weight:600;">${item.callTag}</span>
                  </td>
                  <td style="padding:10px 8px; font-family:monospace; color:${item.wechat !== '-' ? '#0f172a' : '#94a3b8'};">${item.wechat}</td>
                  <td style="padding:10px 8px; color:#0f172a;">${item.callStartTime}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.callEndTime}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.recordGenTime}</td>
                  <td style="padding:10px 8px; text-align:right; font-weight:700; color:${item.durationSec > 0 ? '#059669' : '#94a3b8'}; font-family:monospace;">${item.durationSec}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; background:${item.callStatus==='已接通'?'#dcfce7':item.callStatus==='无人接听'?'#fee2e2':'#fef3c7'}; color:${item.callStatus==='已接通'?'#166534':item.callStatus==='无人接听'?'#991b1b':'#92400e'};">${item.callStatus}</span>
                  </td>
                  <td style="padding:10px 8px; color:#64748b;">${item.syncTime}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.createTime}</td>
                  <td style="padding:10px 8px; font-weight:500; color:#334155;">${item.creator}</td>
                  <td style="padding:10px 8px; white-space:nowrap; text-align:center;">
                    <button type="button" style="color:#2563eb; border:none; background:none; cursor:pointer; font-weight:600; margin-right:6px;" onclick="openOpsAudioPlayerModal('${item.phone}', '${item.durationSec}秒', '${item.callId}', '${item.customerName}')">🎵 试听</button>
                    <button type="button" style="color:#7c3aed; border:none; background:none; cursor:pointer; font-weight:600; margin-right:6px;" onclick="openOpsAudioTranscriptModal('${item.callId}')">📄 文本</button>
                    <button type="button" style="color:#059669; border:none; background:none; cursor:pointer; font-weight:600; margin-right:6px;" onclick="if(typeof showToast==='function') showToast('AI外呼录音文件 ${item.callId}.wav 开始下载...', true)">💾 下载</button>
                    <button type="button" style="color:#64748b; border:none; background:none; cursor:pointer; font-weight:500;" onclick="openOpsAiCallWorkorderDetailModal('${item.taskCode}')">工单</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <footer class="mw-report-pagination" style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#64748b;">
          <span>共 ${data.length} 条记录，当前第 1 / 1 页</span>
          <div style="display:flex; gap:6px; align-items:center;">
            <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>每页 10 条</option></select>
            <button type="button" style="height:28px; padding:0 8px;" disabled>‹</button>
            <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>第 1 页</option></select>
            <button type="button" style="height:28px; padding:0 8px;" disabled>›</button>
          </div>
        </footer>
      </section>
    </div>
  `;
}

function applyOpsAiRecordingFilter() {
  if (typeof showToast === 'function') {
    showToast('【AI外呼录音】筛选条件已更新，已按通话ID与线索标签精准检索', true);
  }
  renderOpsRecordingListPage();
}

function resetOpsAiRecordingFilter() {
  const fields = ['recAiFilterLeadCode', 'recAiFilterClueId', 'recAiFilterVisitCode', 'recAiFilterPhone', 'recAiFilterCallId', 'recAiFilterCallType', 'recAiFilterCallStatus', 'recAiFilterCallTag', 'recAiFilterWechat', 'recAiFilterDuration', 'recAiFilterCreator'];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = '';
  });
  if (typeof showToast === 'function') {
    showToast('AI外呼录音筛选条件已重置为默认', true);
  }
  renderOpsRecordingListPage();
}

/* ==================== 人工客服录音 专用渲染函数 (8个业务字段 + 1个操作列，7项筛选查询条件) ==================== */
function renderOpsManualRecordingPage(container) {
  const data = opsManualRecordingMockData;

  container.innerHTML = `
    <div class="mw-report-container" style="padding:16px;">
      <!-- 子 Tab 导航栏 -->
      <nav class="mw-sub-tabs" style="display:flex; gap:8px; border-bottom:1px solid #e2e8f0; margin-bottom:16px; padding-bottom:12px;">
        <button type="button" class="btn-sub-tab ${opsRecordingActiveTab==='all'?'active':''}" 
                style="padding:8px 18px; border:none; background:${opsRecordingActiveTab==='all'?'#2563eb':'#f8fafc'}; color:${opsRecordingActiveTab==='all'?'#fff':'#475569'}; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsRecordingActiveTab='all'; renderOpsRecordingListPage();">全部录音</button>
        <button type="button" class="btn-sub-tab ${opsRecordingActiveTab==='ai'?'active':''}" 
                style="padding:8px 18px; border:none; background:${opsRecordingActiveTab==='ai'?'#2563eb':'#f8fafc'}; color:${opsRecordingActiveTab==='ai'?'#fff':'#475569'}; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsRecordingActiveTab='ai'; renderOpsRecordingListPage();">AI外呼录音</button>
        <button type="button" class="btn-sub-tab ${opsRecordingActiveTab==='manual'?'active':''}" 
                style="padding:8px 18px; border:none; background:${opsRecordingActiveTab==='manual'?'#2563eb':'#f8fafc'}; color:${opsRecordingActiveTab==='manual'?'#fff':'#475569'}; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsRecordingActiveTab='manual'; renderOpsRecordingListPage();">人工客服录音</button>
      </nav>

      <!-- 5个人工客服专属核心指标汇总卡片 -->
      <section class="mw-report-summary" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:16px; margin-bottom:16px;">
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">坐席录音总数</span>
          <div style="font-size:24px; font-weight:800; color:#0f172a; margin-top:6px;">1,180 <small style="font-size:12px; font-weight:normal; color:#64748b;">条</small></div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">人工接通率</span>
          <div style="font-size:24px; font-weight:800; color:#1677ff; margin-top:6px;">87.2%</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">平均通话时长</span>
          <div style="font-size:24px; font-weight:800; color:#52c41a; margin-top:6px;">01分56秒</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">质检达标率</span>
          <div style="font-size:24px; font-weight:800; color:#722ed1; margin-top:6px;">98.6%</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span style="font-size:12px; color:#64748b;">试驾成功邀约</span>
          <div style="font-size:24px; font-weight:800; color:#fa8c16; margin-top:6px;">218 <small style="font-size:12px; font-weight:normal; color:#64748b;">单</small></div>
        </div>
      </section>

      <!-- 人工客服录音筛选查询卡片 (7项标准业务条件，4列网格排布) -->
      <section class="mw-report-filter-card" style="background:#fff; border-radius:10px; padding:16px; margin-bottom:16px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="font-weight:700; font-size:14px; color:#0f172a; display:flex; align-items:center; gap:8px;">
            <span>人工客服录音筛选查询</span>
            <span style="font-size:12px; font-weight:normal; color:#64748b;">(7项字段与人工坐席业务标准 1:1 精确对齐)</span>
          </div>
          <button type="button" style="border:none; background:none; color:#2563eb; font-size:12px; cursor:pointer; font-weight:600;" onclick="toggleOpsRecordingAdvancedFilter()">
            <span id="recAdvancedFilterText">收起 ∧</span>
          </button>
        </div>

        <div id="recAdvancedFilterBox" style="display:block;">
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px 16px;">
            <!-- 第 1 行 (4列)：任务、线索、电话、坐席 -->
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              任务编码：
              <input class="form-input" id="recManualFilterTaskCode" placeholder="请输入任务编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              总部线索ID：
              <input class="form-input" id="recManualFilterClueId" placeholder="请输入总部线索ID" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              电话号码：
              <input class="form-input" id="recManualFilterPhone" placeholder="请输入手机号或后四位" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              坐席账号：
              <select class="form-input" id="recManualFilterSeat" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部坐席</option>
                <option value="电销A组-李雷">电销A组-李雷</option>
                <option value="电销B组-王五">电销B组-王五</option>
                <option value="电销C组-赵六">电销C组-赵六</option>
                <option value="电销D组-张敏">电销D组-张敏</option>
              </select>
            </label>

            <!-- 第 2 行 (4列)：时长、录音时间、创建时间、按钮区 -->
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              通话时长：
              <select class="form-input" id="recManualFilterDuration" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
                <option value="">全部时长</option>
                <option value="0-15">0 - 15秒 (瞬挂/振铃异常)</option>
                <option value="15-60">15 - 60秒 (短沟通)</option>
                <option value="60-180">1 - 3分钟 (标准深度沟通)</option>
                <option value="180+">3分钟以上 (高意向详谈)</option>
              </select>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              录音时间：
              <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
                <input class="form-input" type="date" value="2026-09-01" id="recManualStartDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
                <span style="color:#94a3b8; font-size:12px;">→</span>
                <input class="form-input" type="date" value="2026-09-16" id="recManualEndDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
              </div>
            </label>
            <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
              创建时间：
              <div style="display:flex; gap:4px; margin-top:6px; align-items:center;">
                <input class="form-input" type="date" value="2026-09-01" id="recManualCreateStartDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
                <span style="color:#94a3b8; font-size:12px;">→</span>
                <input class="form-input" type="date" value="2026-09-16" id="recManualCreateEndDate" style="height:32px; padding:2px 8px; font-size:12px; border:1px solid #d9d9d9; border-radius:4px; width:46%;" />
              </div>
            </label>
            <div style="display:flex; align-items:flex-end;">
              <!-- 占位平衡栅格 -->
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
          <button type="button" style="height:32px; padding:0 18px; background:#fff; border:1px solid #d9d9d9; color:#1e293b; border-radius:4px; font-size:13px; cursor:pointer;" onclick="resetOpsManualRecordingFilter()">重置</button>
          <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="applyOpsManualRecordingFilter()">查询</button>
          <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="if(typeof showToast==='function') showToast('正在批量导出人工客服录音文件(ZIP)...', true);">批量导出录音</button>
          <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="renderOpsRecordingListPage()">刷新</button>
        </div>
      </section>

      <!-- 人工客服录音数据表格 (严格对齐 8 项标准业务字段 + 1 项操作列，共 9 列) -->
      <section class="mw-report-table-card" style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div class="mw-report-table-toolbar" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">人工客服录音列表 (共 ${data.length} 条记录)</h4>
          <div style="display:flex; gap:8px;">
            <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;" onclick="if(typeof showToast==='function') showToast('正在导出【人工客服录音】数据清单...', true);">导出表格清单</button>
            <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>录音时间</option><option>通话时长</option><option>创建时间</option></select>
            <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>降序</option><option>升序</option></select>
            <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;">字段显示</button>
          </div>
        </div>

        <div class="mw-report-table-scroll" style="overflow-x:auto;">
          <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; white-space:nowrap;">
            <thead>
              <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0; color:#334155; font-weight:600;">
                <th style="padding:10px 8px;">序号</th>
                <th style="padding:10px 8px;">总部线索ID</th>
                <th style="padding:10px 8px;">电话号码</th>
                <th style="padding:10px 8px;">坐席账号</th>
                <th style="padding:10px 8px;">任务编码</th>
                <th style="padding:10px 8px;">录音时间</th>
                <th style="padding:10px 8px;">通话时长</th>
                <th style="padding:10px 8px;">创建时间</th>
                <th style="padding:10px 8px; text-align:center;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr style="border-bottom:1px solid #f1f5f9; color:#334155;">
                  <td style="padding:10px 8px; color:#64748b;">${item.id}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.hqClueId}</td>
                  <td style="padding:10px 8px; font-family:monospace; font-weight:600; color:#0f172a;">${item.phone}</td>
                  <td style="padding:10px 8px; font-weight:500;">${item.seatAccount}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#2563eb; font-weight:700;">${item.taskCode}</td>
                  <td style="padding:10px 8px; color:#0f172a;">${item.recordTime}</td>
                  <td style="padding:10px 8px; font-weight:700; color:#059669;">${item.durationText}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.createTime}</td>
                  <td style="padding:10px 8px; white-space:nowrap; text-align:center;">
                    <button type="button" style="color:#2563eb; border:none; background:none; cursor:pointer; font-weight:600; margin-right:6px;" onclick="openOpsAudioPlayerModal('${item.phone}', '${item.durationText}', '${item.taskCode}', '${item.customerName}')">🎵 试听</button>
                    <button type="button" style="color:#7c3aed; border:none; background:none; cursor:pointer; font-weight:600; margin-right:6px;" onclick="openOpsAudioTranscriptModal('${item.taskCode}')">📄 文本</button>
                    <button type="button" style="color:#059669; border:none; background:none; cursor:pointer; font-weight:600; margin-right:6px;" onclick="if(typeof showToast==='function') showToast('人工客服录音文件 ${item.taskCode}.wav 开始下载...', true)">💾 下载</button>
                    <button type="button" style="color:#64748b; border:none; background:none; cursor:pointer; font-weight:500;" onclick="openOpsWorkorderDetailModal('${item.taskCode}')">工单</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <footer class="mw-report-pagination" style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#64748b;">
          <span>共 ${data.length} 条记录，当前第 1 / 1 页</span>
          <div style="display:flex; gap:6px; align-items:center;">
            <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>每页 10 条</option></select>
            <button type="button" style="height:28px; padding:0 8px;" disabled>‹</button>
            <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>第 1 页</option></select>
            <button type="button" style="height:28px; padding:0 8px;" disabled>›</button>
          </div>
        </footer>
      </section>
    </div>
  `;
}

function applyOpsManualRecordingFilter() {
  if (typeof showToast === 'function') {
    showToast('【人工客服录音】筛选条件已更新，已精准检索坐席通话录音', true);
  }
  renderOpsRecordingListPage();
}

function resetOpsManualRecordingFilter() {
  const fields = ['recManualFilterTaskCode', 'recManualFilterClueId', 'recManualFilterPhone', 'recManualFilterSeat', 'recManualFilterDuration'];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = '';
  });
  if (typeof showToast === 'function') {
    showToast('人工客服录音筛选条件已重置为默认', true);
  }
  renderOpsRecordingListPage();
}

function toggleOpsRecordingAdvancedFilter() {
  const box = document.getElementById('recAdvancedFilterBox');
  const text = document.getElementById('recAdvancedFilterText');
  if (!box) return;
  if (box.style.display === 'none' || !box.style.display) {
    box.style.display = 'block';
    if (text) text.textContent = '收起 ∧';
  } else {
    box.style.display = 'none';
    if (text) text.textContent = '展开 ∨';
  }
}

function applyOpsRecordingFilter() {
  if (typeof showToast === 'function') {
    showToast('【录音列表】筛选条件已更新，已精准检索录音数据', true);
  }
  renderOpsRecordingListPage();
}

function resetOpsRecordingFilter() {
  const fields = ['recFilterTaskCode', 'recFilterLeadCode', 'recFilterPhone', 'recFilterCustName', 'recFilterCallType', 'recFilterSeat', 'recFilterCallStatus', 'recFilterDuration', 'recFilterSeries', 'recFilterQcStatus', 'recFilterHangupSide'];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = '';
  });
  if (typeof showToast === 'function') {
    showToast('录音筛选条件已重置为默认', true);
  }
  renderOpsRecordingListPage();
}

/* ==================== 录音试听弹窗 (带波形、倍速、精准时间与播放控制) ==================== */
function openOpsAudioPlayerModal(phone, durationText, recId, custName) {
  let modal = document.getElementById('opsAudioModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'opsAudioModal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:#fff; width:480px; max-width:94vw; border-radius:14px; padding:24px; box-shadow:0 20px 40px rgba(0,0,0,0.2); position:relative; margin:15vh auto; font-family:sans-serif;">
      <div style="font-size:16px; font-weight:800; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:10px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>🎧 在线试听呼叫录音</span>
          <span style="font-size:11px; padding:2px 6px; border-radius:4px; background:#eff6ff; color:#1d4ed8; font-family:monospace;">${recId}</span>
        </div>
        <button style="border:none; background:none; font-size:20px; line-height:1; cursor:pointer; color:#64748b;" onclick="document.getElementById('opsAudioModal').classList.remove('show')">✕</button>
      </div>

      <div style="background:#f8fafc; border-radius:10px; padding:18px; text-align:center; margin-bottom:16px; border:1px solid #e2e8f0;">
        <div style="display:flex; justify-content:space-between; font-size:12px; color:#64748b; margin-bottom:8px;">
          <span>客户: <strong style="color:#0f172a;">${custName}</strong> (${phone})</span>
          <span>采样率: 8000Hz 16bit</span>
        </div>

        <div style="font-size:26px; font-weight:800; color:#2563eb; margin:10px 0; font-family:monospace;">00:14 / ${durationText}</div>

        <!-- 模拟音频波形动画进度条 -->
        <div style="display:flex; align-items:flex-end; justify-content:center; gap:3px; height:36px; margin:12px 0;">
          ${Array.from({length: 32}).map((_, i) => {
            const h = Math.max(6, Math.sin(i * 0.4) * 28 + Math.cos(i * 0.2) * 8);
            const active = i < 10;
            return `<span style="width:4px; height:${h}px; border-radius:2px; background:${active ? '#2563eb' : '#cbd5e1'};"></span>`;
          }).join('')}
        </div>

        <div style="height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden; margin-bottom:14px; position:relative; cursor:pointer;">
          <div style="width:28%; height:100%; background:#2563eb;"></div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:8px;">
            <button type="button" style="padding:4px 8px; border:1px solid #d9d9d9; border-radius:4px; background:#fff; font-size:11px; cursor:pointer;" onclick="if(typeof showToast==='function') showToast('已切换为 1.0x 正常倍速', true)">1.0x</button>
            <button type="button" style="padding:4px 8px; border:1px solid #2563eb; border-radius:4px; background:#eff6ff; color:#1d4ed8; font-size:11px; font-weight:600; cursor:pointer;" onclick="if(typeof showToast==='function') showToast('已切换为 1.5x 倍速播放', true)">1.5x</button>
            <button type="button" style="padding:4px 8px; border:1px solid #d9d9d9; border-radius:4px; background:#fff; font-size:11px; cursor:pointer;" onclick="if(typeof showToast==='function') showToast('已切换为 2.0x 倍速播放', true)">2.0x</button>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn-blue-primary" type="button" style="padding:6px 18px; font-size:12px;" onclick="if(typeof showToast==='function') showToast('播放/暂停切换', true)">▶ 播放</button>
            <button class="btn-outline-blue" type="button" style="padding:6px 14px; font-size:12px;" onclick="if(typeof showToast==='function') showToast('已重头播放录音', true)">↺ 重播</button>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center;">
        <button type="button" style="border:none; background:none; color:#7c3aed; font-size:12px; cursor:pointer; font-weight:600;" onclick="document.getElementById('opsAudioModal').classList.remove('show'); openOpsAudioTranscriptModal('${recId}');">查看完整文本转写 ➔</button>
        <button class="btn-secondary" type="button" style="padding:6px 16px; font-size:12px;" onclick="document.getElementById('opsAudioModal').classList.remove('show')">关闭窗口</button>
      </div>
    </div>
  `;
  modal.classList.add('show');
}

/* ==================== 录音转写文本抽屉/弹窗 ==================== */
function openOpsAudioTranscriptModal(recId) {
  let item = opsRecordingMockData.find(d => d.recId === recId || d.taskCode === recId);
  if (!item && typeof opsAiRecordingMockData !== 'undefined') {
    item = opsAiRecordingMockData.find(d => d.callId === recId || d.hqAiVisitCode === recId || d.taskCode === recId);
  }
  if (!item && typeof opsManualRecordingMockData !== 'undefined') {
    item = opsManualRecordingMockData.find(d => d.taskCode === recId || d.hqClueId === recId);
  }
  if (!item) item = opsRecordingMockData[0];

  const recCode = item.recId || item.callId || item.hqAiVisitCode;
  const qcBadge = item.qcStatus || item.callTag || '质检合格';
  const custName = item.customerName || '客户';
  const phone = item.phone;
  const seatDesc = item.seatAccount || item.creator || 'AI智能外呼机器人';
  const durationDesc = item.durationText || (item.durationSec ? item.durationSec + '秒' : '00秒');
  const intentDesc = item.intentSeries || item.callTag || '意向跟进';

  let modal = document.getElementById('opsTranscriptModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'opsTranscriptModal';
    modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.45); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(2px);';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:#fff; width:680px; max-width:96vw; max-height:88vh; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); display:flex; flex-direction:column; overflow:hidden;">
      <header style="padding:16px 20px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; background:#eff6ff; color:#2563eb; font-weight:bold;">📄</span>
          <h3 style="margin:0; font-size:15px; font-weight:700; color:#0f172a;">通话录音转写文本 - ${recCode}</h3>
          <span style="padding:2px 8px; border-radius:4px; font-size:11px; background:#dcfce7; color:#166534; font-weight:600;">${qcBadge}</span>
        </div>
        <button type="button" style="border:none; background:none; font-size:20px; line-height:1; cursor:pointer; color:#64748b;" onclick="closeOpsAudioTranscriptModal()">✕</button>
      </header>

      <div style="padding:14px 20px; background:#f1f5f9; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:12px; color:#475569;">
        <span>客户：<strong style="color:#0f172a;">${custName}</strong> (${phone})</span>
        <span>坐席/引擎：<strong>${seatDesc}</strong></span>
        <span>时长：<strong style="color:#059669;">${durationDesc}</strong></span>
        <span>标签/车系：<strong>${intentDesc}</strong></span>
      </div>

      <div style="padding:20px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:14px; font-size:13px;">
        ${item.transcript && item.transcript.length > 0 ? item.transcript.map(line => `
          <div style="display:flex; flex-direction:column; align-items:${line.speaker.includes('客户') ? 'flex-start' : 'flex-end'};">
            <div style="font-size:11px; color:#64748b; margin-bottom:4px; display:flex; gap:6px;">
              <span>${line.speaker}</span>
              <span>${line.time}</span>
            </div>
            <div style="max-width:82%; padding:10px 14px; border-radius:${line.speaker.includes('客户') ? '4px 12px 12px 12px' : '12px 4px 12px 12px'}; background:${line.speaker.includes('客户') ? '#f8fafc' : '#eff6ff'}; color:#1e293b; border:1px solid ${line.speaker.includes('客户') ? '#e2e8f0' : '#bfdbfe'}; line-height:1.5;">
              ${line.text}
            </div>
          </div>
        `).join('') : `
          <div style="text-align:center; padding:40px; color:#94a3b8;">该通话记录暂无转写文本或未接通。</div>
        `}
      </div>

      <footer style="padding:12px 20px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
        <span style="font-size:12px; color:#64748b;">ASR语音识别准确率: 98.4%</span>
        <div style="display:flex; gap:10px;">
          <button type="button" style="height:30px; padding:0 14px; background:#fff; border:1px solid #d9d9d9; border-radius:4px; font-size:12px; cursor:pointer;" onclick="if(typeof showToast==='function') showToast('已成功复制对话转写全文', true)">复制全文</button>
          <button type="button" style="height:30px; padding:0 14px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:12px; cursor:pointer;" onclick="closeOpsAudioTranscriptModal()">关闭</button>
        </div>
      </footer>
    </div>
  `;
  modal.style.display = 'flex';
}

function closeOpsAudioTranscriptModal() {
  const modal = document.getElementById('opsTranscriptModal');
  if (modal) modal.style.display = 'none';
}

window.openOpsAudioPlayerModal = openOpsAudioPlayerModal;
window.openOpsAudioTranscriptModal = openOpsAudioTranscriptModal;
window.closeOpsAudioTranscriptModal = closeOpsAudioTranscriptModal;
window.toggleOpsRecordingAdvancedFilter = toggleOpsRecordingAdvancedFilter;
window.applyOpsRecordingFilter = applyOpsRecordingFilter;
window.resetOpsRecordingFilter = resetOpsRecordingFilter;
window.applyOpsAiRecordingFilter = applyOpsAiRecordingFilter;
window.resetOpsAiRecordingFilter = resetOpsAiRecordingFilter;
window.applyOpsManualRecordingFilter = applyOpsManualRecordingFilter;
window.resetOpsManualRecordingFilter = resetOpsManualRecordingFilter;
window.opsRecordingMockData = opsRecordingMockData;
window.opsAiRecordingMockData = opsAiRecordingMockData;
window.opsManualRecordingMockData = opsManualRecordingMockData;



/* ==================== 3. 批量下发 模块 ==================== */
let opsBatchActiveTab = '1';
let opsBatchSelectedKeys = [];
let opsBatchAdvancedFilterExpanded = false;

/* 批量下发-人工客服 34项标准全量业务字段模拟数据 */
const opsBatchManualMockData = [
  {
    index: 1,
    taskCode: 'TASK20260916001',
    leadCode: 'CLUE1883735719',
    customerName: '张敏华',
    phone: '13812345678',
    intentSeries: '2026款探陆',
    latestSeries: '探陆 旗舰版',
    store: '广州东风日产天河店',
    taskType: '人工外呼',
    latestLeadStatus: '培育中',
    firstLeadStatus: '新分配',
    initialLeadStatus: '待分配',
    latestLevel: 'H',
    channelR: 'R6-总部新媒体',
    scMediaName: '抖音信息流广告',
    scProjectName: '秋季新能源超级品牌季',
    scLandingPlatform: '官方快闪留资页',
    smartCode: 'SMART-GZ-0089',
    latestVisitResult: '预约试驾',
    latestContactStatus: '已接通',
    manualTaskAbortStatus: '正常执行',
    assignTime: '2026-09-16 09:30:00',
    receiveTime: '2026-09-16 09:31:15',
    latestFollowTime: '2026-09-16 10:20:00',
    abnormalReason: '-',
    latestBatchStatus: '待下发',
    latestBatchTime: '-',
    agentAccount: '电销D组张敏',
    unconnectedScene: '无',
    batchSystemStatus: '正常就绪',
    pushPreCallStatus: '未推送',
    initialLeadSource: '线上集客',
    followStatus: '跟进中',
    followCount: 3
  },
  {
    index: 2,
    taskCode: 'TASK20260916002',
    leadCode: 'CLUE1883735720',
    customerName: '李思涵',
    phone: '15988889999',
    intentSeries: 'N6',
    latestSeries: 'N6 智驾版',
    store: '上海东风日产浦东店',
    taskType: '人工回访',
    latestLeadStatus: '已下发',
    firstLeadStatus: '已回访',
    initialLeadStatus: '培育中',
    latestLevel: 'A',
    channelR: 'R1-官网预约',
    scMediaName: '百度SEM品牌专区',
    scProjectName: '纯电N6科技预订季',
    scLandingPlatform: '日产官网直达页',
    smartCode: 'SMART-SH-0012',
    latestVisitResult: '继续跟进',
    latestContactStatus: '已接通',
    manualTaskAbortStatus: '正常执行',
    assignTime: '2026-09-16 10:15:20',
    receiveTime: '2026-09-16 10:16:02',
    latestFollowTime: '2026-09-16 11:05:40',
    abnormalReason: '-',
    latestBatchStatus: '已下发',
    latestBatchTime: '2026-09-16 11:20:00',
    agentAccount: '电销A组李雷',
    unconnectedScene: '无',
    batchSystemStatus: '已同步完成',
    pushPreCallStatus: '已推送',
    initialLeadSource: '品牌官网',
    followStatus: '已完成',
    followCount: 5
  },
  {
    index: 3,
    taskCode: 'TASK20260916003',
    leadCode: 'CLUE1883735721',
    customerName: '王振华',
    phone: '18677776666',
    intentSeries: 'N7',
    latestSeries: 'N7 旗舰款',
    store: '北京东风日产朝阳店',
    taskType: '人工外呼',
    latestLeadStatus: '待分配',
    firstLeadStatus: '外呼未接',
    initialLeadStatus: '待分配',
    latestLevel: 'B',
    channelR: 'R3-车展留资',
    scMediaName: '北京国际车展展台',
    scProjectName: '2026智享纯电新体验',
    scLandingPlatform: '展台微信二维码留资',
    smartCode: 'SMART-BJ-0056',
    latestVisitResult: '暂无意向',
    latestContactStatus: '忙音挂断',
    manualTaskAbortStatus: '未中止',
    assignTime: '2026-09-16 11:00:15',
    receiveTime: '2026-09-16 11:02:10',
    latestFollowTime: '2026-09-16 11:30:15',
    abnormalReason: '专营店接单配额超限(DF403)',
    latestBatchStatus: '下发失败',
    latestBatchTime: '2026-09-16 11:45:00',
    agentAccount: '电销B组王五',
    unconnectedScene: '连续2次忙音',
    batchSystemStatus: '排队重试中',
    pushPreCallStatus: '无需推送',
    initialLeadSource: '线下活动',
    followStatus: '待跟进',
    followCount: 1
  },
  {
    index: 4,
    taskCode: 'TASK20260916004',
    leadCode: 'CLUE1883735722',
    customerName: '赵晨阳',
    phone: '13566665555',
    intentSeries: 'NX8',
    latestSeries: 'NX8 豪华版',
    store: '深圳东风日产福田店',
    taskType: '人工外呼',
    latestLeadStatus: '培育中',
    firstLeadStatus: '新分配',
    initialLeadStatus: '培育中',
    latestLevel: 'H',
    channelR: 'R2-垂媒引流',
    scMediaName: '汽车之家车系页',
    scProjectName: '大五座SUV选购专场',
    scLandingPlatform: '汽车之家APP活动弹窗',
    smartCode: 'SMART-SZ-0034',
    latestVisitResult: '意向强烈',
    latestContactStatus: '已接通',
    manualTaskAbortStatus: '正常执行',
    assignTime: '2026-09-16 13:20:00',
    receiveTime: '2026-09-16 13:21:05',
    latestFollowTime: '2026-09-16 13:50:20',
    abnormalReason: '-',
    latestBatchStatus: '下发中',
    latestBatchTime: '2026-09-16 14:00:00',
    agentAccount: '电销C组赵六',
    unconnectedScene: '无',
    batchSystemStatus: '传输中',
    pushPreCallStatus: '推送中',
    initialLeadSource: '垂媒线索',
    followStatus: '跟进中',
    followCount: 4
  },
  {
    index: 5,
    taskCode: 'TASK20260916005',
    leadCode: 'CLUE1883735723',
    customerName: '陈丽雯',
    phone: '13911112222',
    intentSeries: '天籁',
    latestSeries: '天籁 2.0T尊享版',
    store: '成都东风日产高新店',
    taskType: '试驾下发',
    latestLeadStatus: '已下发',
    firstLeadStatus: '新分配',
    initialLeadStatus: '待分配',
    latestLevel: 'C',
    channelR: 'R6-总部新媒体',
    scMediaName: '快手短视频留资',
    scProjectName: '舒适旗舰限时置换礼',
    scLandingPlatform: '快手信息流聚合页',
    smartCode: 'SMART-CD-0091',
    latestVisitResult: '暂缓跟进',
    latestContactStatus: '无人接听',
    manualTaskAbortStatus: '未中止',
    assignTime: '2026-09-16 14:45:00',
    receiveTime: '2026-09-16 14:46:12',
    latestFollowTime: '2026-09-16 15:10:00',
    abnormalReason: '专营店服务区域不匹配',
    latestBatchStatus: '待下发',
    latestBatchTime: '-',
    agentAccount: '电销D组张敏',
    unconnectedScene: '首次无人接听转预外呼',
    batchSystemStatus: '待重新触发',
    pushPreCallStatus: '未推送',
    initialLeadSource: '新媒体集客',
    followStatus: '暂缓',
    followCount: 2
  }
];

const opsBatchMockData = opsBatchManualMockData;

/* 批量下发-AI外呼 26项标准全量业务字段模拟数据 */
let opsBatchAiSelectedKeys = [];
let opsBatchAiAdvancedFilterExpanded = false;

const opsBatchAiMockData = [
  {
    index: 1,
    taskCode: 'AI20260916001',
    leadCode: 'CLUE1883735719',
    customerName: '张敏华',
    phone: '13812345678',
    intentSeries: '2026款探陆',
    latestSeries: '探陆 旗舰版',
    store: '广州东风日产天河店',
    callType: 'AI外呼',
    latestLeadStatus: '培育中',
    firstLeadStatus: '已回访',
    initialLeadStatus: '待分配',
    latestLevel: 'H',
    channelR: 'R6-总部新媒体',
    scMediaName: '抖音信息流广告',
    scProjectName: '秋季新能源超级品牌季',
    scLandingPlatform: '官方快闪留资页',
    smartCode: 'SMART-AI-0089',
    abortAiTaskStatus: '未中止',
    receiveTime: '2026-09-16 09:31:15',
    aiCallTag: '高意向-预约试驾',
    abnormalReason: '-',
    latestBatchStatus: '待下发',
    latestBatchTime: '-',
    unconnectedScene: '无',
    batchSystemStatus: '正常就绪'
  },
  {
    index: 2,
    taskCode: 'AI20260916002',
    leadCode: 'CLUE1883735720',
    customerName: '李思涵',
    phone: '15988889999',
    intentSeries: 'N6',
    latestSeries: 'N6 智驾版',
    store: '上海东风日产浦东店',
    callType: 'AI回访',
    latestLeadStatus: '已下发',
    firstLeadStatus: '新分配',
    initialLeadStatus: '培育中',
    latestLevel: 'A',
    channelR: 'R1-官网预约',
    scMediaName: '百度SEM品牌专区',
    scProjectName: '纯电N6科技预订季',
    scLandingPlatform: '日产官网直达页',
    smartCode: 'SMART-AI-0012',
    abortAiTaskStatus: '未中止',
    receiveTime: '2026-09-16 10:16:02',
    aiCallTag: '已接通-邀约成功',
    abnormalReason: '-',
    latestBatchStatus: '已下发',
    latestBatchTime: '2026-09-16 11:20:00',
    unconnectedScene: '无',
    batchSystemStatus: '已同步完成'
  },
  {
    index: 3,
    taskCode: 'AI20260916003',
    leadCode: 'CLUE1883735721',
    customerName: '王振华',
    phone: '18677776666',
    intentSeries: 'N7',
    latestSeries: 'N7 旗舰款',
    store: '北京东风日产朝阳店',
    callType: 'AI外呼',
    latestLeadStatus: '待分配',
    firstLeadStatus: '外呼未接',
    initialLeadStatus: '待分配',
    latestLevel: 'B',
    channelR: 'R3-车展留资',
    scMediaName: '北京国际车展展台',
    scProjectName: '2026智享纯电新体验',
    scLandingPlatform: '展台微信二维码留资',
    smartCode: 'SMART-AI-0056',
    abortAiTaskStatus: '规则中止',
    receiveTime: '2026-09-16 11:02:10',
    aiCallTag: '未接通-忙音',
    abnormalReason: '专营店接单配额超限(DF403)',
    latestBatchStatus: '下发失败',
    latestBatchTime: '2026-09-16 11:45:00',
    unconnectedScene: '连续2次忙音',
    batchSystemStatus: '排队重试中'
  },
  {
    index: 4,
    taskCode: 'AI20260916004',
    leadCode: 'CLUE1883735722',
    customerName: '赵晨阳',
    phone: '13566665555',
    intentSeries: 'NX8',
    latestSeries: 'NX8 豪华版',
    store: '深圳东风日产福田店',
    callType: '批量AI直呼',
    latestLeadStatus: '培育中',
    firstLeadStatus: '新分配',
    initialLeadStatus: '培育中',
    latestLevel: 'H',
    channelR: 'R2-垂媒引流',
    scMediaName: '汽车之家车系页',
    scProjectName: '大五座SUV选购专场',
    scLandingPlatform: '汽车之家APP活动弹窗',
    smartCode: 'SMART-AI-0034',
    abortAiTaskStatus: '未中止',
    receiveTime: '2026-09-16 13:21:05',
    aiCallTag: '高意向-对比竞品',
    abnormalReason: '-',
    latestBatchStatus: '下发中',
    latestBatchTime: '2026-09-16 14:00:00',
    unconnectedScene: '无',
    batchSystemStatus: '传输中'
  },
  {
    index: 5,
    taskCode: 'AI20260916005',
    leadCode: 'CLUE1883735723',
    customerName: '陈丽雯',
    phone: '13911112222',
    intentSeries: '天籁',
    latestSeries: '天籁 2.0T尊享版',
    store: '成都东风日产高新店',
    callType: 'AI外呼',
    latestLeadStatus: '待跟进',
    firstLeadStatus: '新分配',
    initialLeadStatus: '待分配',
    latestLevel: 'C',
    channelR: 'R6-总部新媒体',
    scMediaName: '快手短视频留资',
    scProjectName: '舒适旗舰限时置换礼',
    scLandingPlatform: '快手信息流聚合页',
    smartCode: 'SMART-AI-0091',
    abortAiTaskStatus: '未中止',
    receiveTime: '2026-09-16 14:46:12',
    aiCallTag: '未接通-无人接听',
    abnormalReason: '专营店服务区域不匹配',
    latestBatchStatus: '待下发',
    latestBatchTime: '-',
    unconnectedScene: '首次无人接听转预外呼',
    batchSystemStatus: '待重新触发'
  }
];

function renderOpsBatchDispatchPage() {
  const container = document.getElementById('opsBatchDispatchPage');
  if (!container) return;

  if (opsBatchActiveTab === '2') {
    return renderOpsBatchAiDispatchPage(container);
  }

  const data = opsBatchManualMockData;
  const selectedCount = opsBatchSelectedKeys.length;

  container.innerHTML = `
    <div class="mw-report-container" style="padding:16px;">
      <!-- 子 Tab 导航栏 -->
      <nav class="mw-sub-tabs" style="display:flex; gap:8px; border-bottom:1px solid #e2e8f0; margin-bottom:16px; padding-bottom:12px;">
        <button type="button" class="btn-sub-tab ${opsBatchActiveTab==='1'?'active':''}" 
                style="padding:8px 18px; border:none; background:${opsBatchActiveTab==='1'?'#2563eb':'#f8fafc'}; color:${opsBatchActiveTab==='1'?'#fff':'#475569'}; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsBatchActiveTab='1'; renderOpsBatchDispatchPage();">批量下发 - 人工客服</button>
        <button type="button" class="btn-sub-tab ${opsBatchActiveTab==='2'?'active':''}" 
                style="padding:8px 18px; border:none; background:${opsBatchActiveTab==='2'?'#2563eb':'#f8fafc'}; color:${opsBatchActiveTab==='2'?'#fff':'#475569'}; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsBatchActiveTab='2'; renderOpsBatchDispatchPage();">批量下发 - AI外呼</button>
      </nav>

      <!-- 5大核心下发业务指标汇总卡片 -->
      <section class="mw-report-summary" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:16px; margin-bottom:16px;">
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">待下发线索总数</div>
          <div style="font-size:22px; font-weight:700; color:#2563eb;">1,286 <span style="font-size:12px; font-weight:normal; color:#64748b;">条</span></div>
          <div style="font-size:11px; color:#059669; margin-top:4px;">H/A级高意向占 68.5%</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">今日已下发总数</div>
          <div style="font-size:22px; font-weight:700; color:#059669;">432 <span style="font-size:12px; font-weight:normal; color:#64748b;">条</span></div>
          <div style="font-size:11px; color:#64748b; margin-top:4px;">成功率 98.6%</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">专营店接单确认率</div>
          <div style="font-size:22px; font-weight:700; color:#0891b2;">92.4%</div>
          <div style="font-size:11px; color:#059669; margin-top:4px;">环比昨日 +2.8%</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">平均下发处理时效</div>
          <div style="font-size:22px; font-weight:700; color:#7c3aed;">14.5 <span style="font-size:12px; font-weight:normal; color:#64748b;">分钟</span></div>
          <div style="font-size:11px; color:#64748b; margin-top:4px;">优于标准SLA(30分)</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">下发后试驾邀约率</div>
          <div style="font-size:22px; font-weight:700; color:#ea580c;">36.8%</div>
          <div style="font-size:11px; color:#059669; margin-top:4px;">达成既定培育考核线</div>
        </div>
      </section>

      <!-- 批量下发-人工客服 筛选查询条件 (严格对齐 30 项业务筛选字段：前12项基础 + 后18项高级可折叠) -->
      <section class="mw-report-filter-card" style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; margin-bottom:16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px 16px;">
          <!-- 第 1 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            任务编码
            <input class="form-input" id="opsBatchFilterTaskCode" placeholder="请输入任务编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            培育线索编码
            <input class="form-input" id="opsBatchFilterLeadCode" placeholder="请输入培育线索编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            客户姓名
            <input class="form-input" id="opsBatchFilterCustName" placeholder="请输入客户姓名" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            联系电话
            <input class="form-input" id="opsBatchFilterPhone" placeholder="请输入联系电话" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
          </label>

          <!-- 第 2 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            意向车系
            <select class="form-input" id="opsBatchFilterIntentSeries" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>2026款探陆</option>
              <option>N6</option>
              <option>N7</option>
              <option>NX8</option>
              <option>天籁</option>
              <option>轩逸</option>
              <option>逍客</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            最新留资车系
            <select class="form-input" id="opsBatchFilterLatestSeries" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>探陆 旗舰版</option>
              <option>N6 智驾版</option>
              <option>N7 旗舰款</option>
              <option>NX8 豪华版</option>
              <option>天籁 2.0T尊享版</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            意向专营店
            <select class="form-input" id="opsBatchFilterStore" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>广州东风日产天河店</option>
              <option>深圳东风日产福田店</option>
              <option>上海东风日产浦东店</option>
              <option>北京东风日产朝阳店</option>
              <option>成都东风日产高新店</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            最新线索状态
            <select class="form-input" id="opsBatchFilterLeadStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>培育中</option>
              <option>已下发</option>
              <option>待分配</option>
              <option>待跟进</option>
              <option>已战败</option>
            </select>
          </label>

          <!-- 第 3 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            首次线索状态
            <select class="form-input" id="opsBatchFilterFirstStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>新分配</option>
              <option>已回访</option>
              <option>外呼未接</option>
              <option>待分配</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            初始线索状态
            <select class="form-input" id="opsBatchFilterInitialStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>待分配</option>
              <option>培育中</option>
              <option>新线索</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            最新意向级别
            <select class="form-input" id="opsBatchFilterLevel" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>H级 (极高)</option>
              <option>A级 (高)</option>
              <option>B级 (中)</option>
              <option>C级 (低)</option>
              <option>F级 (战败/无效)</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            过滤无效专营店
            <select class="form-input" id="opsBatchFilterFilterInvalidStore" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option value="1">是 (仅有效专营店)</option>
              <option value="0">否 (包含已休眠/停业专营店)</option>
            </select>
          </label>
        </div>

        <!-- 高级筛选折叠区 (后 18 项：包含 R渠道、SC大项目、异常原因及非、接收时间、跟进次数等) -->
        <div id="opsBatchAdvancedFilterBox" style="display:${opsBatchAdvancedFilterExpanded ? 'grid' : 'none'}; grid-template-columns:repeat(4, 1fr); gap:12px 16px; margin-top:12px; padding-top:12px; border-top:1px dashed #e2e8f0;">
          <!-- 第 4 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            R渠道
            <select class="form-input" id="opsBatchFilterChannelR" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>R1-官网预约</option>
              <option>R2-垂媒引流</option>
              <option>R3-车展留资</option>
              <option>R6-总部新媒体</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            SC媒体名称
            <select class="form-input" id="opsBatchFilterScMedia" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>抖音信息流广告</option>
              <option>百度SEM品牌专区</option>
              <option>腾讯微信广告</option>
              <option>快手短视频留资</option>
              <option>汽车之家车系页</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            SC大项目名
            <select class="form-input" id="opsBatchFilterScProject" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>秋季新能源超级品牌季</option>
              <option>纯电N6科技预订季</option>
              <option>2026智享纯电新体验</option>
              <option>大五座SUV选购专场</option>
              <option>舒适旗舰限时置换礼</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            SC落地平台
            <select class="form-input" id="opsBatchFilterScPlatform" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>官方快闪留资页</option>
              <option>日产官网直达页</option>
              <option>展台微信二维码留资</option>
              <option>汽车之家APP活动弹窗</option>
              <option>快手信息流聚合页</option>
            </select>
          </label>

          <!-- 第 5 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            smartCode
            <input class="form-input" id="opsBatchFilterSmartCode" placeholder="请输入smartCode代码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            最新回访结果
            <select class="form-input" id="opsBatchFilterVisitResult" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>预约试驾</option>
              <option>意向强烈</option>
              <option>继续跟进</option>
              <option>对比竞品</option>
              <option>暂无意向</option>
              <option>暂缓跟进</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            最新接触状态
            <select class="form-input" id="opsBatchFilterContactStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>已接通</option>
              <option>无人接听</option>
              <option>忙音挂断</option>
              <option>客户拒接</option>
              <option>空号/停机</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            异常原因
            <select class="form-input" id="opsBatchFilterAbnormalReason" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>专营店接单配额超限(DF403)</option>
              <option>专营店服务区域不匹配</option>
              <option>电话号码格式错误</option>
              <option>重复下发冲突</option>
              <option>专营店未配置坐席</option>
            </select>
          </label>

          <!-- 第 6 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            异常原因非
            <select class="form-input" id="opsBatchFilterAbnormalReasonNot" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择排除的异常原因</option>
              <option>专营店接单配额超限(DF403)</option>
              <option>专营店服务区域不匹配</option>
              <option>电话号码格式错误</option>
              <option>重复下发冲突</option>
              <option>专营店未配置坐席</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            最新批量下发状态
            <select class="form-input" id="opsBatchFilterBatchStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>待下发</option>
              <option>下发中</option>
              <option>已下发</option>
              <option>下发失败</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            坐席账号
            <select class="form-input" id="opsBatchFilterAgentAccount" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>电销D组张敏</option>
              <option>电销A组李雷</option>
              <option>电销B组王五</option>
              <option>电销C组赵六</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            接收时间
            <div style="display:flex; gap:4px; align-items:center; margin-top:6px;">
              <input class="form-input" type="date" id="opsBatchFilterReceiveStart" value="2026-09-01" style="height:32px; font-size:12px; padding:2px 6px; flex:1;" />
              <span style="color:#94a3b8;">~</span>
              <input class="form-input" type="date" id="opsBatchFilterReceiveEnd" value="2026-09-16" style="height:32px; font-size:12px; padding:2px 6px; flex:1;" />
            </div>
          </label>

          <!-- 第 7 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            人工外呼无人接通场景
            <select class="form-input" id="opsBatchFilterUnconnectedScene" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>无</option>
              <option>首次无人接听转预外呼</option>
              <option>连续2次忙音</option>
              <option>关机占线</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            批量下发系统状态
            <select class="form-input" id="opsBatchFilterSystemStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>正常就绪</option>
              <option>已同步完成</option>
              <option>传输中</option>
              <option>排队重试中</option>
              <option>待重新触发</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            推送到预外呼状态
            <select class="form-input" id="opsBatchFilterPushStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>未推送</option>
              <option>推送中</option>
              <option>已推送</option>
              <option>无需推送</option>
              <option>推送失败</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            初始线索来源
            <select class="form-input" id="opsBatchFilterInitialSource" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>线上集客</option>
              <option>品牌官网</option>
              <option>线下活动</option>
              <option>垂媒线索</option>
              <option>新媒体集客</option>
            </select>
          </label>

          <!-- 第 8 行 (2项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            跟进状态
            <select class="form-input" id="opsBatchFilterFollowStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>跟进中</option>
              <option>已完成</option>
              <option>待跟进</option>
              <option>暂缓</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            跟进次数
            <input class="form-input" type="number" id="opsBatchFilterFollowCount" placeholder="请输入跟进次数" min="0" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
          </label>
        </div>

        <!-- 筛选操作按钮条 -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
          <button type="button" id="opsBatchToggleAdvancedBtn" style="border:none; background:none; color:#2563eb; font-size:13px; cursor:pointer; font-weight:500;" onclick="toggleOpsBatchAdvancedFilter()">
            <span id="opsBatchAdvancedFilterText">${opsBatchAdvancedFilterExpanded ? '收起高级筛选 ▲' : '展开高级筛选 ▼'}</span>
          </button>
          <div style="display:flex; gap:8px;">
            <button type="button" style="height:32px; padding:0 18px; background:#fff; border:1px solid #d9d9d9; color:#1e293b; border-radius:4px; font-size:13px; cursor:pointer;" onclick="resetOpsBatchFilter()">重置</button>
            <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="applyOpsBatchFilter()">查询</button>
            <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="if(typeof showToast==='function') showToast('正在导出符合筛选条件的批量下发线索清单...', true);">批量导出数据</button>
            <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="renderOpsBatchDispatchPage()">刷新</button>
          </div>
        </div>
      </section>

      <!-- 批量下发操作工具栏与全量 34 列标准业务数据表格 -->
      <section class="mw-report-table-card" style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div class="mw-report-table-toolbar" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:12px; align-items:center;">
            <button class="btn-blue-primary" type="button" style="padding:7px 18px; font-size:13px; display:flex; align-items:center; gap:6px;" onclick="openOpsBatchDispatchModal()">
              <span>⚡ 批量下发至专营店</span>
            </button>
            <button class="btn-outline-blue" type="button" style="padding:7px 16px; font-size:13px; display:flex; align-items:center; gap:6px;" onclick="openOpsBatchLogModal()">
              <span>📋 查看下发日志</span>
            </button>
            <span id="opsBatchSelectedCounter" style="font-size:13px; color:#475569; font-weight:500; background:#f8fafc; padding:4px 10px; border-radius:4px; border:1px solid #e2e8f0;">
              已勾选当前 <strong id="opsBatchSelectedCountNum" style="color:#2563eb;">${selectedCount}</strong> / ${data.length} 项线索
            </span>
          </div>
          <div style="display:flex; gap:8px;">
            <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>分配时间</option><option>最新跟进时间</option><option>最新批量下发时间</option></select>
            <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>降序</option><option>升序</option></select>
            <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;" onclick="if(typeof showToast==='function') showToast('当前已按34项核心字段完整呈现', true)">字段显示</button>
          </div>
        </div>

        <div class="mw-report-table-scroll" style="overflow-x:auto;">
          <!-- 批量下发-人工客服 表格：严格对齐 34 项标准业务字段 + 1项复选框列 + 1项操作列，共 36 列 -->
          <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; white-space:nowrap;">
            <thead>
              <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0; color:#334155; font-weight:600;">
                <th style="padding:10px 8px; text-align:center;"><input type="checkbox" id="opsBatchMasterCheckbox" onchange="toggleAllOpsBatch(this)" ${selectedCount === data.length && data.length > 0 ? 'checked' : ''} /></th>
                <th style="padding:10px 8px;">序号</th>
                <th style="padding:10px 8px;">任务编码</th>
                <th style="padding:10px 8px;">培育线索编码</th>
                <th style="padding:10px 8px;">客户姓名</th>
                <th style="padding:10px 8px;">联系电话</th>
                <th style="padding:10px 8px;">意向车系</th>
                <th style="padding:10px 8px;">最新留资车系</th>
                <th style="padding:10px 8px;">意向专营店</th>
                <th style="padding:10px 8px;">任务类型</th>
                <th style="padding:10px 8px;">最新线索状态</th>
                <th style="padding:10px 8px;">首次线索状态</th>
                <th style="padding:10px 8px;">初始线索状态</th>
                <th style="padding:10px 8px;">最新意向级别</th>
                <th style="padding:10px 8px;">R渠道</th>
                <th style="padding:10px 8px;">SC媒体名称</th>
                <th style="padding:10px 8px;">SC大项目名</th>
                <th style="padding:10px 8px;">SC落地平台</th>
                <th style="padding:10px 8px;">smartCode</th>
                <th style="padding:10px 8px;">最新回访结果</th>
                <th style="padding:10px 8px;">最新接触状态</th>
                <th style="padding:10px 8px;">人工任务中止状态</th>
                <th style="padding:10px 8px;">分配时间</th>
                <th style="padding:10px 8px;">接收时间</th>
                <th style="padding:10px 8px;">最新跟进时间</th>
                <th style="padding:10px 8px;">异常原因</th>
                <th style="padding:10px 8px;">最新批量下发状态</th>
                <th style="padding:10px 8px;">最新批量下发时间</th>
                <th style="padding:10px 8px;">坐席账号</th>
                <th style="padding:10px 8px;">人工外呼无人接通场景</th>
                <th style="padding:10px 8px;">批量下发系统状态</th>
                <th style="padding:10px 8px;">推送到预外呼状态</th>
                <th style="padding:10px 8px;">初始线索来源</th>
                <th style="padding:10px 8px;">跟进状态</th>
                <th style="padding:10px 8px; text-align:right;">跟进次数</th>
                <th style="padding:10px 8px; text-align:center;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr style="border-bottom:1px solid #f1f5f9; color:#334155; background:${opsBatchSelectedKeys.includes(item.index) ? '#f0fdf4' : 'transparent'};">
                  <td style="padding:10px 8px; text-align:center;">
                    <input type="checkbox" class="ops-batch-row-checkbox" value="${item.index}" ${opsBatchSelectedKeys.includes(item.index) ? 'checked' : ''} onchange="toggleOpsBatchRow(${item.index})" />
                  </td>
                  <td style="padding:10px 8px; color:#64748b;">${item.index}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#2563eb; font-weight:700;">${item.taskCode}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.leadCode}</td>
                  <td style="padding:10px 8px; font-weight:700; color:#0f172a;">${item.customerName}</td>
                  <td style="padding:10px 8px; font-family:monospace;">${item.phone}</td>
                  <td style="padding:10px 8px;">${item.intentSeries}</td>
                  <td style="padding:10px 8px; color:#475569;">${item.latestSeries}</td>
                  <td style="padding:10px 8px; font-weight:600; color:#0f172a;">${item.store}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#eff6ff; color:#1d4ed8; font-weight:500;">${item.taskType}</span>
                  </td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; background:#dbeafe; color:#1e40af;">${item.latestLeadStatus}</span>
                  </td>
                  <td style="padding:10px 8px; color:#64748b;">${item.firstLeadStatus}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.initialLeadStatus}</td>
                  <td style="padding:10px 8px;">
                    <span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700; background:${item.latestLevel==='H'?'#fee2e2':item.latestLevel==='A'?'#ffedd5':item.latestLevel==='B'?'#e0f2fe':'#f1f5f9'}; color:${item.latestLevel==='H'?'#b91c1c':item.latestLevel==='A'?'#c2410c':item.latestLevel==='B'?'#0369a1':'#475569'};">${item.latestLevel}级</span>
                  </td>
                  <td style="padding:10px 8px; color:#475569;">${item.channelR}</td>
                  <td style="padding:10px 8px;">${item.scMediaName}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.scProjectName}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.scLandingPlatform}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.smartCode}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.latestVisitResult.includes('试驾')?'#ecfdf5':item.latestVisitResult.includes('强烈')?'#fef2f2':'#f8fafc'}; color:${item.latestVisitResult.includes('试驾')?'#047857':item.latestVisitResult.includes('强烈')?'#b91c1c':'#334155'}; font-weight:600;">${item.latestVisitResult}</span>
                  </td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.latestContactStatus==='已接通'?'#dcfce7':item.latestContactStatus==='忙音挂断'?'#fee2e2':'#fef3c7'}; color:${item.latestContactStatus==='已接通'?'#166534':item.latestContactStatus==='忙音挂断'?'#991b1b':'#92400e'}; font-weight:600;">${item.latestContactStatus}</span>
                  </td>
                  <td style="padding:10px 8px; color:${item.manualTaskAbortStatus==='正常执行'?'#059669':'#b91c1c'}; font-weight:500;">${item.manualTaskAbortStatus}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.assignTime}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.receiveTime}</td>
                  <td style="padding:10px 8px; color:#0f172a;">${item.latestFollowTime}</td>
                  <td style="padding:10px 8px; color:${item.abnormalReason!=='-'?'#b91c1c':'#94a3b8'}; font-weight:${item.abnormalReason!=='-'?'600':'normal'};">${item.abnormalReason}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; background:${item.latestBatchStatus==='已下发'?'#dcfce7':item.latestBatchStatus==='待下发'?'#fef3c7':item.latestBatchStatus==='下发中'?'#e0f2fe':'#fee2e2'}; color:${item.latestBatchStatus==='已下发'?'#166534':item.latestBatchStatus==='待下发'?'#92400e':item.latestBatchStatus==='下发中'?'#0369a1':'#991b1b'};">${item.latestBatchStatus}</span>
                  </td>
                  <td style="padding:10px 8px; color:#64748b;">${item.latestBatchTime}</td>
                  <td style="padding:10px 8px; font-weight:500; color:#334155;">${item.agentAccount}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.unconnectedScene}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#f1f5f9; color:#475569; font-weight:500;">${item.batchSystemStatus}</span>
                  </td>
                  <td style="padding:10px 8px; color:#64748b;">${item.pushPreCallStatus}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.initialLeadSource}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.followStatus==='已完成'?'#ecfdf5':item.followStatus==='跟进中'?'#eff6ff':'#f8fafc'}; color:${item.followStatus==='已完成'?'#047857':item.followStatus==='跟进中'?'#1d4ed8':'#475569'}; font-weight:500;">${item.followStatus}</span>
                  </td>
                  <td style="padding:10px 8px; text-align:right; font-weight:700; color:#0f172a; font-family:monospace;">${item.followCount}</td>
                  <td style="padding:10px 8px; white-space:nowrap; text-align:center;">
                    <button type="button" style="color:#2563eb; border:none; background:none; cursor:pointer; font-weight:700; margin-right:8px;" onclick="openOpsBatchDispatchModal('${item.taskCode}')">⚡ 手动下发</button>
                    <button type="button" style="color:#0f172a; border:none; background:none; cursor:pointer; font-weight:600;" onclick="openOpsBatchManualDetailModal(${item.index})">详情</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <footer class="mw-report-pagination" style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#64748b;">
          <span>共 ${data.length} 条记录，当前第 1 / 1 页</span>
          <div style="display:flex; gap:6px; align-items:center;">
            <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>每页 10 条</option><option>每页 20 条</option><option>每页 50 条</option></select>
            <button class="btn-outline-blue" style="height:28px; padding:0 8px; font-size:12px;" disabled>上一页</button>
            <button class="btn-outline-blue" style="height:28px; padding:0 8px; font-size:12px; background:#2563eb; color:#fff;">1</button>
            <button class="btn-outline-blue" style="height:28px; padding:0 8px; font-size:12px;" disabled>下一页</button>
          </div>
        </footer>
      </section>
    </div>
  `;
}

/* 切换批量下发高级筛选展开/折叠 */
function toggleOpsBatchAdvancedFilter() {
  opsBatchAdvancedFilterExpanded = !opsBatchAdvancedFilterExpanded;
  const box = document.getElementById('opsBatchAdvancedFilterBox');
  const text = document.getElementById('opsBatchAdvancedFilterText');
  if (box) box.style.display = opsBatchAdvancedFilterExpanded ? 'grid' : 'none';
  if (text) text.innerText = opsBatchAdvancedFilterExpanded ? '收起高级筛选 ▲' : '展开高级筛选 ▼';
}

/* 批量下发筛选应用 */
function applyOpsBatchFilter() {
  if (typeof showToast === 'function') {
    showToast('【批量下发-人工客服】筛选条件已更新，已按业务维度刷新清单', true);
  }
  renderOpsBatchDispatchPage();
}

/* 批量下发筛选重置 (完整重置全部 30 项业务筛选字段) */
function resetOpsBatchFilter() {
  const fields = [
    'opsBatchFilterTaskCode', 'opsBatchFilterLeadCode', 'opsBatchFilterCustName', 'opsBatchFilterPhone',
    'opsBatchFilterIntentSeries', 'opsBatchFilterLatestSeries', 'opsBatchFilterStore', 'opsBatchFilterLeadStatus',
    'opsBatchFilterFirstStatus', 'opsBatchFilterInitialStatus', 'opsBatchFilterLevel', 'opsBatchFilterFilterInvalidStore',
    'opsBatchFilterChannelR', 'opsBatchFilterScMedia', 'opsBatchFilterScProject', 'opsBatchFilterScPlatform',
    'opsBatchFilterSmartCode', 'opsBatchFilterVisitResult', 'opsBatchFilterContactStatus', 'opsBatchFilterAbnormalReason',
    'opsBatchFilterAbnormalReasonNot', 'opsBatchFilterBatchStatus', 'opsBatchFilterAgentAccount',
    'opsBatchFilterUnconnectedScene', 'opsBatchFilterSystemStatus', 'opsBatchFilterPushStatus',
    'opsBatchFilterInitialSource', 'opsBatchFilterFollowStatus', 'opsBatchFilterFollowCount'
  ];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = '';
  });
  const recStart = document.getElementById('opsBatchFilterReceiveStart');
  if (recStart) recStart.value = '2026-09-01';
  const recEnd = document.getElementById('opsBatchFilterReceiveEnd');
  if (recEnd) recEnd.value = '2026-09-16';

  if (typeof showToast === 'function') {
    showToast('批量下发 30 项筛选条件已重置为默认', true);
  }
  renderOpsBatchDispatchPage();
}

/* 全选/反选操作 */
function toggleAllOpsBatch(masterCheckbox) {
  if (masterCheckbox.checked) {
    opsBatchSelectedKeys = opsBatchManualMockData.map(d => d.index);
  } else {
    opsBatchSelectedKeys = [];
  }
  renderOpsBatchDispatchPage();
}

/* 单行勾选/取消 */
function toggleOpsBatchRow(id) {
  const idx = opsBatchSelectedKeys.indexOf(id);
  if (idx > -1) {
    opsBatchSelectedKeys.splice(idx, 1);
  } else {
    opsBatchSelectedKeys.push(id);
  }
  renderOpsBatchDispatchPage();
}

/* 查看 34 个字段完整线索详情弹窗 */
function openOpsBatchManualDetailModal(id) {
  const item = opsBatchManualMockData.find(d => d.index === id) || opsBatchManualMockData[0];
  let modal = document.getElementById('opsBatchDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'opsBatchDetailModal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:#fff; width:820px; max-width:95vw; border-radius:14px; padding:24px; box-shadow:0 20px 40px rgba(0,0,0,0.2); margin:5vh auto; max-height:90vh; overflow-y:auto;">
      <div style="font-size:16px; font-weight:800; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
        <span style="display:flex; align-items:center; gap:8px;">
          <span>📋 批量下发线索详情</span>
          <span style="font-family:monospace; color:#2563eb; font-size:14px;">${item.taskCode}</span>
          <span style="padding:2px 8px; border-radius:4px; font-size:11px; background:#dbeafe; color:#1e40af;">${item.latestBatchStatus}</span>
        </span>
        <button style="border:none; background:none; font-size:18px; cursor:pointer;" onclick="document.getElementById('opsBatchDetailModal').classList.remove('show')">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- 分组 1: 客户与线索基础属性 -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px;">
          <h5 style="margin:0 0 10px 0; font-size:13px; font-weight:700; color:#1e293b;">1. 客户与线索基础属性</h5>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px 12px; font-size:12px;">
            <div><span style="color:#64748b;">客户姓名：</span><strong style="color:#0f172a;">${item.customerName}</strong></div>
            <div><span style="color:#64748b;">联系电话：</span><strong style="font-family:monospace; color:#0f172a;">${item.phone}</strong></div>
            <div><span style="color:#64748b;">培育线索编码：</span><span style="font-family:monospace;">${item.leadCode}</span></div>
            <div><span style="color:#64748b;">初始线索来源：</span><span>${item.initialLeadSource}</span></div>
            <div><span style="color:#64748b;">R渠道：</span><span>${item.channelR}</span></div>
            <div><span style="color:#64748b;">smartCode：</span><span style="font-family:monospace;">${item.smartCode}</span></div>
          </div>
        </div>

        <!-- 分组 2: 车型意向与留资专营店 -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px;">
          <h5 style="margin:0 0 10px 0; font-size:13px; font-weight:700; color:#1e293b;">2. 车型意向与推广平台</h5>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px 12px; font-size:12px;">
            <div><span style="color:#64748b;">意向车系：</span><strong>${item.intentSeries}</strong></div>
            <div><span style="color:#64748b;">最新留资车系：</span><strong>${item.latestSeries}</strong></div>
            <div><span style="color:#64748b;">意向专营店：</span><strong style="color:#2563eb;">${item.store}</strong></div>
            <div><span style="color:#64748b;">SC媒体名称：</span><span>${item.scMediaName}</span></div>
            <div><span style="color:#64748b;">SC大项目名：</span><span>${item.scProjectName}</span></div>
            <div><span style="color:#64748b;">SC落地平台：</span><span>${item.scLandingPlatform}</span></div>
          </div>
        </div>

        <!-- 分组 3: 培育跟进与接触状态 -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px;">
          <h5 style="margin:0 0 10px 0; font-size:13px; font-weight:700; color:#1e293b;">3. 培育跟进与接触状态</h5>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px 12px; font-size:12px;">
            <div><span style="color:#64748b;">任务类型：</span><span>${item.taskType}</span></div>
            <div><span style="color:#64748b;">跟进状态：</span><strong>${item.followStatus}</strong></div>
            <div><span style="color:#64748b;">跟进次数：</span><strong>${item.followCount} 次</strong></div>
            <div><span style="color:#64748b;">最新接触状态：</span><strong style="color:#059669;">${item.latestContactStatus}</strong></div>
            <div><span style="color:#64748b;">最新回访结果：</span><strong style="color:#2563eb;">${item.latestVisitResult}</strong></div>
            <div><span style="color:#64748b;">人工任务中止状态：</span><span>${item.manualTaskAbortStatus}</span></div>
            <div><span style="color:#64748b;">人工外呼无人接通场景：</span><span>${item.unconnectedScene}</span></div>
            <div><span style="color:#64748b;">坐席账号：</span><span>${item.agentAccount}</span></div>
            <div><span style="color:#64748b;">推送到预外呼状态：</span><span>${item.pushPreCallStatus}</span></div>
          </div>
        </div>

        <!-- 分组 4: 下发流转与时效轨迹 -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px;">
          <h5 style="margin:0 0 10px 0; font-size:13px; font-weight:700; color:#1e293b;">4. 批量下发流转与时效轨迹</h5>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px 12px; font-size:12px;">
            <div><span style="color:#64748b;">最新批量下发状态：</span><strong style="color:#2563eb;">${item.latestBatchStatus}</strong></div>
            <div><span style="color:#64748b;">批量下发系统状态：</span><span>${item.batchSystemStatus}</span></div>
            <div><span style="color:#64748b;">异常原因：</span><span style="color:${item.abnormalReason!=='-'?'#b91c1c':'#64748b'};">${item.abnormalReason}</span></div>
            <div><span style="color:#64748b;">首次线索状态：</span><span>${item.firstLeadStatus}</span></div>
            <div><span style="color:#64748b;">初始线索状态：</span><span>${item.initialLeadStatus}</span></div>
            <div><span style="color:#64748b;">最新线索状态：</span><span>${item.latestLeadStatus}</span></div>
            <div><span style="color:#64748b;">最新意向级别：</span><strong style="color:#b91c1c;">${item.latestLevel}级</strong></div>
            <div><span style="color:#64748b;">分配时间：</span><span>${item.assignTime}</span></div>
            <div><span style="color:#64748b;">接收时间：</span><span>${item.receiveTime}</span></div>
            <div><span style="color:#64748b;">最新跟进时间：</span><span>${item.latestFollowTime}</span></div>
            <div><span style="color:#64748b;">最新批量下发时间：</span><span>${item.latestBatchTime}</span></div>
          </div>
        </div>
      </div>

      <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn-secondary" type="button" onclick="document.getElementById('opsBatchDetailModal').classList.remove('show')">关闭</button>
        <button class="btn-blue-primary" type="button" onclick="document.getElementById('opsBatchDetailModal').classList.remove('show'); openOpsBatchDispatchModal('${item.taskCode}')">⚡ 手动下发该线索</button>
      </div>
    </div>
  `;
}

/* ==================== 批量下发 - AI外呼 专用渲染模块 (26项业务字段 + 27项筛选查询字段) ==================== */
function renderOpsBatchAiDispatchPage(container) {
  const data = opsBatchAiMockData;
  const selectedCount = opsBatchAiSelectedKeys.length;

  container.innerHTML = `
    <div class="mw-report-container" style="padding:16px;">
      <!-- 子 Tab 导航栏 -->
      <nav class="mw-sub-tabs" style="display:flex; gap:8px; border-bottom:1px solid #e2e8f0; margin-bottom:16px; padding-bottom:12px;">
        <button type="button" class="btn-sub-tab" 
                style="padding:8px 18px; border:none; background:#f8fafc; color:#475569; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsBatchActiveTab='1'; renderOpsBatchDispatchPage();">批量下发 - 人工客服</button>
        <button type="button" class="btn-sub-tab active" 
                style="padding:8px 18px; border:none; background:#2563eb; color:#fff; font-weight:600; border-radius:6px; cursor:pointer; font-size:13px;" 
                onclick="opsBatchActiveTab='2'; renderOpsBatchDispatchPage();">批量下发 - AI外呼</button>
      </nav>

      <!-- 5大核心AI下发业务指标汇总卡片 -->
      <section class="mw-report-summary" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:16px; margin-bottom:16px;">
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">待下发AI线索总数</div>
          <div style="font-size:22px; font-weight:700; color:#2563eb;">2,418 <span style="font-size:12px; font-weight:normal; color:#64748b;">条</span></div>
          <div style="font-size:11px; color:#059669; margin-top:4px;">意向就绪度 72.4%</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">今日AI外呼下发</div>
          <div style="font-size:22px; font-weight:700; color:#059669;">856 <span style="font-size:12px; font-weight:normal; color:#64748b;">条</span></div>
          <div style="font-size:11px; color:#64748b; margin-top:4px;">下发成功率 99.2%</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">AI外呼接通率</div>
          <div style="font-size:22px; font-weight:700; color:#0891b2;">64.8%</div>
          <div style="font-size:11px; color:#059669; margin-top:4px;">有效通话时长 85s</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">专营店自动接单率</div>
          <div style="font-size:22px; font-weight:700; color:#7c3aed;">94.1%</div>
          <div style="font-size:11px; color:#64748b; margin-top:4px;">平均流转时效 8.2m</div>
        </div>
        <div style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">AI下发后到店试驾率</div>
          <div style="font-size:22px; font-weight:700; color:#ea580c;">29.5%</div>
          <div style="font-size:11px; color:#059669; margin-top:4px;">环比上周 +3.1%</div>
        </div>
      </section>

      <!-- 批量下发-AI外呼 筛选查询条件 (对齐 27 项业务筛选字段：前12项基础 + 后15项高级可折叠) -->
      <section class="mw-report-filter-card" style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; margin-bottom:16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px 16px;">
          <!-- 第 1 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            接收时间
            <div style="display:flex; gap:4px; align-items:center; margin-top:6px;">
              <input class="form-input" type="date" id="opsBatchAiFilterReceiveStart" value="2026-09-09" style="height:32px; font-size:12px; padding:2px 6px; flex:1;" />
              <span style="color:#94a3b8;">~</span>
              <input class="form-input" type="date" id="opsBatchAiFilterReceiveEnd" value="2026-09-16" style="height:32px; font-size:12px; padding:2px 6px; flex:1;" />
            </div>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            任务编码
            <input class="form-input" id="opsBatchAiFilterTaskCode" placeholder="请输入任务编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            培育线索编码
            <input class="form-input" id="opsBatchAiFilterLeadCode" placeholder="请输入培育线索编码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            最新通话状态
            <select class="form-input" id="opsBatchAiFilterCallStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>已接通</option>
              <option>无人接听</option>
              <option>忙音挂断</option>
              <option>客户拒接</option>
              <option>空号/停机</option>
            </select>
          </label>

          <!-- 第 2 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            客户姓名
            <input class="form-input" id="opsBatchAiFilterCustName" placeholder="请输入客户姓名" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            联系电话
            <input class="form-input" id="opsBatchAiFilterPhone" placeholder="请输入联系电话" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            意向车系
            <select class="form-input" id="opsBatchAiFilterIntentSeries" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>2026款探陆</option>
              <option>N6</option>
              <option>N7</option>
              <option>NX8</option>
              <option>天籁</option>
              <option>轩逸</option>
              <option>逍客</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            最新留资车系
            <select class="form-input" id="opsBatchAiFilterLatestSeries" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>探陆 旗舰版</option>
              <option>N6 智驾版</option>
              <option>N7 旗舰款</option>
              <option>NX8 豪华版</option>
              <option>天籁 2.0T尊享版</option>
            </select>
          </label>

          <!-- 第 3 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            意向专营店
            <select class="form-input" id="opsBatchAiFilterStore" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>广州东风日产天河店</option>
              <option>深圳东风日产福田店</option>
              <option>上海东风日产浦东店</option>
              <option>北京东风日产朝阳店</option>
              <option>成都东风日产高新店</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            外呼类型
            <select class="form-input" id="opsBatchAiFilterCallType" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>AI外呼</option>
              <option>AI回访</option>
              <option>预外呼</option>
              <option>批量AI直呼</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            最新线索状态
            <select class="form-input" id="opsBatchAiFilterLeadStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>培育中</option>
              <option>已下发</option>
              <option>待分配</option>
              <option>待跟进</option>
              <option>已战败</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            首次线索状态
            <select class="form-input" id="opsBatchAiFilterFirstStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>新分配</option>
              <option>已回访</option>
              <option>外呼未接</option>
              <option>待分配</option>
            </select>
          </label>
        </div>

        <!-- 高级筛选折叠区 (后 15 项，包含初始线索状态、无效专营店过滤、无容量满份额门店过滤等) -->
        <div id="opsBatchAiAdvancedFilterBox" style="display:${opsBatchAiAdvancedFilterExpanded ? 'grid' : 'none'}; grid-template-columns:repeat(4, 1fr); gap:12px 16px; margin-top:12px; padding-top:12px; border-top:1px dashed #e2e8f0;">
          <!-- 第 4 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            初始线索状态
            <select class="form-input" id="opsBatchAiFilterInitialStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>待分配</option>
              <option>培育中</option>
              <option>新线索</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            最新意向级别
            <select class="form-input" id="opsBatchAiFilterLevel" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>H级 (极高)</option>
              <option>A级 (高)</option>
              <option>B级 (中)</option>
              <option>C级 (低)</option>
              <option>F级 (战败/无效)</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            过滤无效专营店
            <select class="form-input" id="opsBatchAiFilterFilterInvalidStore" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option value="1">是 (仅有效专营店)</option>
              <option value="0">否 (包含已休眠/停业专营店)</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            R渠道
            <select class="form-input" id="opsBatchAiFilterChannelR" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>R1-官网预约</option>
              <option>R2-垂媒引流</option>
              <option>R3-车展留资</option>
              <option>R6-总部新媒体</option>
            </select>
          </label>

          <!-- 第 5 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            SC媒体名称
            <select class="form-input" id="opsBatchAiFilterScMedia" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>抖音信息流广告</option>
              <option>百度SEM品牌专区</option>
              <option>腾讯微信广告</option>
              <option>快手短视频留资</option>
              <option>汽车之家车系页</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            SC大项目名
            <select class="form-input" id="opsBatchAiFilterScProject" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>秋季新能源超级品牌季</option>
              <option>纯电N6科技预订季</option>
              <option>2026智享纯电新体验</option>
              <option>大五座SUV选购专场</option>
              <option>舒适旗舰限时置换礼</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            SC落地平台
            <select class="form-input" id="opsBatchAiFilterScPlatform" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>官方快闪留资页</option>
              <option>日产官网直达页</option>
              <option>展台微信二维码留资</option>
              <option>汽车之家APP活动弹窗</option>
              <option>快手信息流聚合页</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            smartCode
            <input class="form-input" id="opsBatchAiFilterSmartCode" placeholder="请输入smartCode代码" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px;" />
          </label>

          <!-- 第 6 行 (4项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            批量下发异常原因
            <select class="form-input" id="opsBatchAiFilterAbnormalReason" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>专营店接单配额超限(DF403)</option>
              <option>专营店服务区域不匹配</option>
              <option>专营店满额挂起</option>
              <option>电话号码格式错误</option>
              <option>重复下发冲突</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            最新批量下发状态
            <select class="form-input" id="opsBatchAiFilterBatchStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>待下发</option>
              <option>下发中</option>
              <option>已下发</option>
              <option>下发失败</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            过滤无容量满份额门店
            <select class="form-input" id="opsBatchAiFilterFilterFullStore" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option value="1">是 (自动过滤容量超限/满配额专营店)</option>
              <option value="0">否 (包含全部门店)</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            人工外呼无人接通场景
            <select class="form-input" id="opsBatchAiFilterUnconnectedScene" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>无</option>
              <option>首次无人接听转预外呼</option>
              <option>连续2次忙音</option>
              <option>关机占线</option>
            </select>
          </label>

          <!-- 第 7 行 (3项) -->
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            批量下发系统状态
            <select class="form-input" id="opsBatchAiFilterSystemStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>正常就绪</option>
              <option>已同步完成</option>
              <option>传输中</option>
              <option>排队重试中</option>
              <option>待重新触发</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            AI外呼标签接通状态
            <select class="form-input" id="opsBatchAiFilterAiTagStatus" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>高意向-预约试驾</option>
              <option>已接通-邀约成功</option>
              <option>高意向-对比竞品</option>
              <option>未接通-拒接</option>
              <option>未接通-忙音</option>
              <option>未接通-无人接听</option>
              <option>未接通-空号/停机</option>
            </select>
          </label>
          <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
            初始线索来源
            <select class="form-input" id="opsBatchAiFilterInitialSource" style="margin-top:6px; height:32px; padding:4px 11px; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; background:#fff;">
              <option value="">请选择</option>
              <option>线上集客</option>
              <option>品牌官网</option>
              <option>线下活动</option>
              <option>垂媒线索</option>
              <option>新媒体集客</option>
            </select>
          </label>
        </div>

        <!-- 筛选操作按钮条 -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
          <button type="button" id="opsBatchAiToggleAdvancedBtn" style="border:none; background:none; color:#2563eb; font-size:13px; cursor:pointer; font-weight:500;" onclick="toggleOpsBatchAiAdvancedFilter()">
            <span id="opsBatchAiAdvancedFilterText">${opsBatchAiAdvancedFilterExpanded ? '收起高级筛选 ▲' : '展开高级筛选 ▼'}</span>
          </button>
          <div style="display:flex; gap:8px;">
            <button type="button" style="height:32px; padding:0 18px; background:#fff; border:1px solid #d9d9d9; color:#1e293b; border-radius:4px; font-size:13px; cursor:pointer;" onclick="resetOpsBatchAiFilter()">重置</button>
            <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="applyOpsBatchAiFilter()">查询</button>
            <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="if(typeof showToast==='function') showToast('正在导出符合筛选条件的AI外呼下发线索清单...', true);">批量导出数据</button>
            <button type="button" style="height:32px; padding:0 18px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer; font-weight:500;" onclick="renderOpsBatchDispatchPage()">刷新</button>
          </div>
        </div>
      </section>

      <!-- 批量下发操作工具栏与全量 26 列标准业务数据表格 (共 28 列) -->
      <section class="mw-report-table-card" style="background:#fff; border-radius:10px; padding:16px; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div class="mw-report-table-toolbar" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:12px; align-items:center;">
            <button class="btn-blue-primary" type="button" style="padding:7px 18px; font-size:13px; display:flex; align-items:center; gap:6px;" onclick="openOpsBatchDispatchModal()">
              <span>⚡ 批量下发至专营店</span>
            </button>
            <button class="btn-outline-blue" type="button" style="padding:7px 16px; font-size:13px; display:flex; align-items:center; gap:6px;" onclick="openOpsBatchLogModal()">
              <span>📋 查看下发日志</span>
            </button>
            <span id="opsBatchAiSelectedCounter" style="font-size:13px; color:#475569; font-weight:500; background:#f8fafc; padding:4px 10px; border-radius:4px; border:1px solid #e2e8f0;">
              已勾选当前 <strong id="opsBatchAiSelectedCountNum" style="color:#2563eb;">${selectedCount}</strong> / ${data.length} 项线索
            </span>
          </div>
          <div style="display:flex; gap:8px;">
            <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>接收时间</option><option>最新批量下发时间</option></select>
            <select class="form-input" style="height:30px; padding:2px 8px; font-size:12px;"><option>降序</option><option>升序</option></select>
            <button class="btn-outline-blue" type="button" style="padding:4px 12px; font-size:12px;" onclick="if(typeof showToast==='function') showToast('当前已按26项AI外呼核心字段完整呈现', true)">字段显示</button>
          </div>
        </div>

        <div class="mw-report-table-scroll" style="overflow-x:auto;">
          <!-- 批量下发-AI外呼 表格：严格对齐 26 项标准业务字段 + 1项复选框列 + 1项操作列，共 28 列 -->
          <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; white-space:nowrap;">
            <thead>
              <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0; color:#334155; font-weight:600;">
                <th style="padding:10px 8px; text-align:center;"><input type="checkbox" id="opsBatchAiMasterCheckbox" onchange="toggleAllOpsBatchAi(this)" ${selectedCount === data.length && data.length > 0 ? 'checked' : ''} /></th>
                <th style="padding:10px 8px;">序号</th>
                <th style="padding:10px 8px;">任务编码</th>
                <th style="padding:10px 8px;">培育线索编码</th>
                <th style="padding:10px 8px;">客户姓名</th>
                <th style="padding:10px 8px;">联系电话</th>
                <th style="padding:10px 8px;">意向车系</th>
                <th style="padding:10px 8px;">最新留资车系</th>
                <th style="padding:10px 8px;">意向专营店</th>
                <th style="padding:10px 8px;">外呼类型</th>
                <th style="padding:10px 8px;">最新线索状态</th>
                <th style="padding:10px 8px;">首次线索状态</th>
                <th style="padding:10px 8px;">初始线索状态</th>
                <th style="padding:10px 8px;">最新意向级别</th>
                <th style="padding:10px 8px;">R渠道</th>
                <th style="padding:10px 8px;">SC媒体名称</th>
                <th style="padding:10px 8px;">SC大项目名</th>
                <th style="padding:10px 8px;">SC落地平台</th>
                <th style="padding:10px 8px;">smartCode</th>
                <th style="padding:10px 8px;">中止AI外呼任务</th>
                <th style="padding:10px 8px;">接收时间</th>
                <th style="padding:10px 8px;">AI外呼标签</th>
                <th style="padding:10px 8px;">批量下发异常原因</th>
                <th style="padding:10px 8px;">最新批量下发状态</th>
                <th style="padding:10px 8px;">最新批量下发时间</th>
                <th style="padding:10px 8px;">人工外呼无人接通场景</th>
                <th style="padding:10px 8px;">批量下发系统状态</th>
                <th style="padding:10px 8px; text-align:center;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr style="border-bottom:1px solid #f1f5f9; color:#334155; background:${opsBatchAiSelectedKeys.includes(item.index) ? '#f0fdf4' : 'transparent'};">
                  <td style="padding:10px 8px; text-align:center;">
                    <input type="checkbox" class="ops-batch-ai-row-checkbox" value="${item.index}" ${opsBatchAiSelectedKeys.includes(item.index) ? 'checked' : ''} onchange="toggleOpsBatchAiRow(${item.index})" />
                  </td>
                  <td style="padding:10px 8px; color:#64748b;">${item.index}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#2563eb; font-weight:700;">${item.taskCode}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.leadCode}</td>
                  <td style="padding:10px 8px; font-weight:700; color:#0f172a;">${item.customerName}</td>
                  <td style="padding:10px 8px; font-family:monospace;">${item.phone}</td>
                  <td style="padding:10px 8px;">${item.intentSeries}</td>
                  <td style="padding:10px 8px; color:#475569;">${item.latestSeries}</td>
                  <td style="padding:10px 8px; font-weight:600; color:#0f172a;">${item.store}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#eff6ff; color:#1d4ed8; font-weight:500;">${item.callType}</span>
                  </td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; background:#dbeafe; color:#1e40af;">${item.latestLeadStatus}</span>
                  </td>
                  <td style="padding:10px 8px; color:#64748b;">${item.firstLeadStatus}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.initialLeadStatus}</td>
                  <td style="padding:10px 8px;">
                    <span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700; background:${item.latestLevel==='H'?'#fee2e2':item.latestLevel==='A'?'#ffedd5':item.latestLevel==='B'?'#e0f2fe':'#f1f5f9'}; color:${item.latestLevel==='H'?'#b91c1c':item.latestLevel==='A'?'#c2410c':item.latestLevel==='B'?'#0369a1':'#475569'};">${item.latestLevel}级</span>
                  </td>
                  <td style="padding:10px 8px; color:#475569;">${item.channelR}</td>
                  <td style="padding:10px 8px;">${item.scMediaName}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.scProjectName}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.scLandingPlatform}</td>
                  <td style="padding:10px 8px; font-family:monospace; color:#475569;">${item.smartCode}</td>
                  <td style="padding:10px 8px; color:${item.abortAiTaskStatus==='未中止'?'#059669':'#b91c1c'}; font-weight:500;">${item.abortAiTaskStatus}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.receiveTime}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:${item.aiCallTag.includes('高意向')?'#ecfdf5':item.aiCallTag.includes('邀约')?'#eff6ff':item.aiCallTag.includes('拒接')?'#fee2e2':'#f8fafc'}; color:${item.aiCallTag.includes('高意向')?'#047857':item.aiCallTag.includes('邀约')?'#1d4ed8':item.aiCallTag.includes('拒接')?'#b91c1c':'#334155'}; font-weight:600;">${item.aiCallTag}</span>
                  </td>
                  <td style="padding:10px 8px; color:${item.abnormalReason!=='-'?'#b91c1c':'#94a3b8'}; font-weight:${item.abnormalReason!=='-'?'600':'normal'};">${item.abnormalReason}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; background:${item.latestBatchStatus==='已下发'?'#dcfce7':item.latestBatchStatus==='待下发'?'#fef3c7':item.latestBatchStatus==='下发中'?'#e0f2fe':'#fee2e2'}; color:${item.latestBatchStatus==='已下发'?'#166534':item.latestBatchStatus==='待下发'?'#92400e':item.latestBatchStatus==='下发中'?'#0369a1':'#991b1b'};">${item.latestBatchStatus}</span>
                  </td>
                  <td style="padding:10px 8px; color:#64748b;">${item.latestBatchTime}</td>
                  <td style="padding:10px 8px; color:#64748b;">${item.unconnectedScene}</td>
                  <td style="padding:10px 8px;">
                    <span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#f1f5f9; color:#475569; font-weight:500;">${item.batchSystemStatus}</span>
                  </td>
                  <td style="padding:10px 8px; white-space:nowrap; text-align:center;">
                    <button type="button" style="color:#2563eb; border:none; background:none; cursor:pointer; font-weight:700; margin-right:8px;" onclick="openOpsBatchDispatchModal('${item.taskCode}')">⚡ 手动下发</button>
                    <button type="button" style="color:#0f172a; border:none; background:none; cursor:pointer; font-weight:600;" onclick="openOpsBatchAiDetailModal(${item.index})">详情</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <footer class="mw-report-pagination" style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#64748b;">
          <span>共 ${data.length} 条记录，当前第 1 / 1 页</span>
          <div style="display:flex; gap:6px; align-items:center;">
            <select class="form-input" style="height:28px; padding:2px 6px; font-size:12px;"><option>每页 10 条</option><option>每页 20 条</option><option>每页 50 条</option></select>
            <button class="btn-outline-blue" style="height:28px; padding:0 8px; font-size:12px;" disabled>上一页</button>
            <button class="btn-outline-blue" style="height:28px; padding:0 8px; font-size:12px; background:#2563eb; color:#fff;">1</button>
            <button class="btn-outline-blue" style="height:28px; padding:0 8px; font-size:12px;" disabled>下一页</button>
          </div>
        </footer>
      </section>
    </div>
  `;
}

/* 切换批量下发-AI外呼高级筛选展开/折叠 */
function toggleOpsBatchAiAdvancedFilter() {
  opsBatchAiAdvancedFilterExpanded = !opsBatchAiAdvancedFilterExpanded;
  const box = document.getElementById('opsBatchAiAdvancedFilterBox');
  const text = document.getElementById('opsBatchAiAdvancedFilterText');
  if (box) box.style.display = opsBatchAiAdvancedFilterExpanded ? 'grid' : 'none';
  if (text) text.innerText = opsBatchAiAdvancedFilterExpanded ? '收起高级筛选 ▲' : '展开高级筛选 ▼';
}

/* 批量下发-AI外呼筛选应用 */
function applyOpsBatchAiFilter() {
  if (typeof showToast === 'function') {
    showToast('【批量下发-AI外呼】筛选条件已更新，已按通话与下发状态刷新清单', true);
  }
  renderOpsBatchDispatchPage();
}

/* 批量下发-AI外呼筛选重置 (重置全部 27 项字段) */
function resetOpsBatchAiFilter() {
  const fields = [
    'opsBatchAiFilterTaskCode', 'opsBatchAiFilterLeadCode', 'opsBatchAiFilterCallStatus', 'opsBatchAiFilterCustName',
    'opsBatchAiFilterPhone', 'opsBatchAiFilterIntentSeries', 'opsBatchAiFilterLatestSeries', 'opsBatchAiFilterStore',
    'opsBatchAiFilterCallType', 'opsBatchAiFilterLeadStatus', 'opsBatchAiFilterFirstStatus', 'opsBatchAiFilterInitialStatus',
    'opsBatchAiFilterLevel', 'opsBatchAiFilterFilterInvalidStore', 'opsBatchAiFilterChannelR', 'opsBatchAiFilterScMedia',
    'opsBatchAiFilterScProject', 'opsBatchAiFilterScPlatform', 'opsBatchAiFilterSmartCode', 'opsBatchAiFilterAbnormalReason',
    'opsBatchAiFilterBatchStatus', 'opsBatchAiFilterFilterFullStore', 'opsBatchAiFilterUnconnectedScene',
    'opsBatchAiFilterSystemStatus', 'opsBatchAiFilterAiTagStatus', 'opsBatchAiFilterInitialSource'
  ];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el) el.value = '';
  });
  const recStart = document.getElementById('opsBatchAiFilterReceiveStart');
  if (recStart) recStart.value = '2026-09-09';
  const recEnd = document.getElementById('opsBatchAiFilterReceiveEnd');
  if (recEnd) recEnd.value = '2026-09-16';

  if (typeof showToast === 'function') {
    showToast('批量下发-AI外呼 27项筛选条件已重置为默认', true);
  }
  renderOpsBatchDispatchPage();
}

/* AI外呼全选/反选操作 */
function toggleAllOpsBatchAi(masterCheckbox) {
  if (masterCheckbox.checked) {
    opsBatchAiSelectedKeys = opsBatchAiMockData.map(d => d.index);
  } else {
    opsBatchAiSelectedKeys = [];
  }
  renderOpsBatchDispatchPage();
}

/* AI外呼单行勾选/取消 */
function toggleOpsBatchAiRow(id) {
  const idx = opsBatchAiSelectedKeys.indexOf(id);
  if (idx > -1) {
    opsBatchAiSelectedKeys.splice(idx, 1);
  } else {
    opsBatchAiSelectedKeys.push(id);
  }
  renderOpsBatchDispatchPage();
}

/* 查看 26 个字段完整AI外呼线索详情弹窗 */
function openOpsBatchAiDetailModal(id) {
  const item = opsBatchAiMockData.find(d => d.index === id) || opsBatchAiMockData[0];
  let modal = document.getElementById('opsBatchAiDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'opsBatchAiDetailModal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:#fff; width:820px; max-width:95vw; border-radius:14px; padding:24px; box-shadow:0 20px 40px rgba(0,0,0,0.2); margin:5vh auto; max-height:90vh; overflow-y:auto;">
      <div style="font-size:16px; font-weight:800; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
        <span style="display:flex; align-items:center; gap:8px;">
          <span>🤖 批量下发-AI外呼线索详情</span>
          <span style="font-family:monospace; color:#2563eb; font-size:14px;">${item.taskCode}</span>
          <span style="padding:2px 8px; border-radius:4px; font-size:11px; background:#dbeafe; color:#1e40af;">${item.latestBatchStatus}</span>
        </span>
        <button style="border:none; background:none; font-size:18px; cursor:pointer;" onclick="document.getElementById('opsBatchAiDetailModal').classList.remove('show')">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- 分组 1: 客户与线索属性 -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px;">
          <h5 style="margin:0 0 10px 0; font-size:13px; font-weight:700; color:#1e293b;">1. 客户与线索属性</h5>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px 12px; font-size:12px;">
            <div><span style="color:#64748b;">客户姓名：</span><strong style="color:#0f172a;">${item.customerName}</strong></div>
            <div><span style="color:#64748b;">联系电话：</span><strong style="font-family:monospace; color:#0f172a;">${item.phone}</strong></div>
            <div><span style="color:#64748b;">培育线索编码：</span><span style="font-family:monospace;">${item.leadCode}</span></div>
            <div><span style="color:#64748b;">外呼类型：</span><strong style="color:#2563eb;">${item.callType}</strong></div>
            <div><span style="color:#64748b;">R渠道：</span><span>${item.channelR}</span></div>
            <div><span style="color:#64748b;">smartCode：</span><span style="font-family:monospace;">${item.smartCode}</span></div>
          </div>
        </div>

        <!-- 分组 2: 意向车系与渠道投放 -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px;">
          <h5 style="margin:0 0 10px 0; font-size:13px; font-weight:700; color:#1e293b;">2. 意向车系与渠道投放</h5>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px 12px; font-size:12px;">
            <div><span style="color:#64748b;">意向车系：</span><strong>${item.intentSeries}</strong></div>
            <div><span style="color:#64748b;">最新留资车系：</span><strong>${item.latestSeries}</strong></div>
            <div><span style="color:#64748b;">意向专营店：</span><strong style="color:#2563eb;">${item.store}</strong></div>
            <div><span style="color:#64748b;">SC媒体名称：</span><span>${item.scMediaName}</span></div>
            <div><span style="color:#64748b;">SC大项目名：</span><span>${item.scProjectName}</span></div>
            <div><span style="color:#64748b;">SC落地平台：</span><span>${item.scLandingPlatform}</span></div>
          </div>
        </div>

        <!-- 分组 3: AI外呼与无人接通场景 -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px;">
          <h5 style="margin:0 0 10px 0; font-size:13px; font-weight:700; color:#1e293b;">3. AI外呼与无人接通场景</h5>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px 12px; font-size:12px;">
            <div><span style="color:#64748b;">中止AI外呼任务：</span><strong style="color:${item.abortAiTaskStatus==='未中止'?'#059669':'#b91c1c'};">${item.abortAiTaskStatus}</strong></div>
            <div><span style="color:#64748b;">AI外呼标签：</span><span style="padding:2px 6px; border-radius:4px; font-size:11px; background:#eff6ff; color:#1d4ed8; font-weight:600;">${item.aiCallTag}</span></div>
            <div><span style="color:#64748b;">人工外呼无人接通场景：</span><span>${item.unconnectedScene}</span></div>
            <div><span style="color:#64748b;">接收时间：</span><span>${item.receiveTime}</span></div>
            <div><span style="color:#64748b;">最新意向级别：</span><strong style="color:#b91c1c;">${item.latestLevel}级</strong></div>
            <div><span style="color:#64748b;">最新线索状态：</span><span>${item.latestLeadStatus}</span></div>
          </div>
        </div>

        <!-- 分组 4: 批量下发状态与异常流转 -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px;">
          <h5 style="margin:0 0 10px 0; font-size:13px; font-weight:700; color:#1e293b;">4. 批量下发状态与异常流转</h5>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px 12px; font-size:12px;">
            <div><span style="color:#64748b;">最新批量下发状态：</span><strong style="color:#2563eb;">${item.latestBatchStatus}</strong></div>
            <div><span style="color:#64748b;">最新批量下发时间：</span><span>${item.latestBatchTime}</span></div>
            <div><span style="color:#64748b;">批量下发系统状态：</span><span>${item.batchSystemStatus}</span></div>
            <div><span style="color:#64748b;">批量下发异常原因：</span><span style="color:${item.abnormalReason!=='-'?'#b91c1c':'#64748b'}; font-weight:${item.abnormalReason!=='-'?'600':'normal'};">${item.abnormalReason}</span></div>
            <div><span style="color:#64748b;">首次线索状态：</span><span>${item.firstLeadStatus}</span></div>
            <div><span style="color:#64748b;">初始线索状态：</span><span>${item.initialLeadStatus}</span></div>
          </div>
        </div>
      </div>

      <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn-secondary" type="button" onclick="document.getElementById('opsBatchAiDetailModal').classList.remove('show')">关闭</button>
        <button class="btn-blue-primary" type="button" onclick="document.getElementById('opsBatchAiDetailModal').classList.remove('show'); openOpsBatchDispatchModal('${item.taskCode}')">⚡ 手动下发该线索</button>
      </div>
    </div>
  `;
  modal.classList.add('show');
}



function openOpsBatchDispatchModal(taskCode) {
  let modal = document.getElementById('opsBatchDispatchModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'opsBatchDispatchModal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:#fff; width:540px; border-radius:14px; padding:24px; box-shadow:0 20px 40px rgba(0,0,0,0.2); margin:10vh auto;">
      <div style="font-size:16px; font-weight:800; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <span>🚀 批量下发至专营店 ${taskCode ? `(${taskCode})` : ''}</span>
        <button style="border:none; background:none; font-size:18px; cursor:pointer;" onclick="document.getElementById('opsBatchDispatchModal').classList.remove('show')">✕</button>
      </div>
      <form onsubmit="event.preventDefault(); document.getElementById('opsBatchDispatchModal').classList.remove('show'); if(typeof showToast==='function') showToast('下发指令提交成功，后台异步推送中！', true);">
        <div style="display:flex; flex-direction:column; gap:14px;">
          <label style="font-size:13px; font-weight:700; color:#334155;">
            目标下发专营店
            <select class="form-input" style="margin-top:6px;"><option>广州东风日产天河店 (DF202601)</option><option>深圳东风日产福田店 (DF202602)</option><option>上海东风日产浦东店 (DF202603)</option></select>
          </label>
          <label style="font-size:13px; font-weight:700; color:#334155;">
            下发配额与上限
            <input class="form-input" type="number" value="50" style="margin-top:6px;" placeholder="单次最大下发笔数" />
          </label>
          <label style="font-size:13px; font-weight:700; color:#334155;">
            自动路由规则
            <select class="form-input" style="margin-top:6px;"><option>按客户归属地优先匹配专营店</option><option>按专营店接单负载平均分配</option></select>
          </label>
          <label style="font-size:13px; font-weight:700; color:#334155;">
            下发备注说明
            <textarea class="form-input" rows="3" style="margin-top:6px;" placeholder="请输入下发备注，专营店接单员可见..."></textarea>
          </label>
        </div>
        <div style="margin-top:20px; text-align:right; display:flex; justify-content:flex-end; gap:12px;">
          <button class="btn-secondary" type="button" onclick="document.getElementById('opsBatchDispatchModal').classList.remove('show')">取消</button>
          <button class="btn-save" type="submit">确认提交下发</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add('show');
}

function openOpsBatchLogModal() {
  let modal = document.getElementById('opsBatchLogModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'opsBatchLogModal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:#fff; width:680px; border-radius:14px; padding:24px; box-shadow:0 20px 40px rgba(0,0,0,0.2); margin:10vh auto;">
      <div style="font-size:16px; font-weight:800; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <span>📋 批量下发操作日志</span>
        <button style="border:none; background:none; font-size:18px; cursor:pointer;" onclick="document.getElementById('opsBatchLogModal').classList.remove('show')">✕</button>
      </div>
      <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:13px;">
        <thead>
          <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left;">
            <th style="padding:10px;">操作时间</th><th style="padding:10px;">操作人</th><th style="padding:10px;">下发笔数</th><th style="padding:10px;">目标专营店</th><th style="padding:10px;">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; color:#64748b;">2026-09-16 14:20:00</td><td style="padding:10px; font-weight:700;">电销主管(张敏)</td><td style="padding:10px; font-weight:700; color:#2563eb;">12 笔</td><td style="padding:10px;">广州天河专营店</td><td style="padding:10px; color:#059669; font-weight:700;">成功</td></tr>
          <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; color:#64748b;">2026-09-16 11:05:00</td><td style="padding:10px; font-weight:700;">系统自动路由</td><td style="padding:10px; font-weight:700; color:#2563eb;">45 笔</td><td style="padding:10px;">上海浦东专营店</td><td style="padding:10px; color:#059669; font-weight:700;">成功</td></tr>
        </tbody>
      </table>
      <div style="margin-top:20px; text-align:right;">
        <button class="btn-secondary" type="button" onclick="document.getElementById('opsBatchLogModal').classList.remove('show')">关闭</button>
      </div>
    </div>
  `;
  modal.classList.add('show');
}


/* ==================== 4. 总部NEV日报 模块 ==================== */
let opsNevDailyActiveTab = 'dailyExecutionReport';
let opsNevDailyDate = '2026-09-15';

function renderOpsHqNevDailyPage() {
  const container = document.getElementById('opsHqNevDailyPage');
  if (!container) return;

  const tabs = [
    { key: 'dailyExecutionReport', label: '每日执行日报' },
    { key: 'monthlyNevLeadReport', label: '总部NEV线索月报' },
    { key: 'modelDailyReport', label: '车型日报' },
    { key: 'modelMonthlySummary', label: '各月车型汇总' }
  ];

  container.innerHTML = `
    <div style="padding:16px;">
      <section style="background:#fff; border-radius:12px; padding:16px; margin-bottom:16px; border:1px solid #e2e8f0; display:flex; justify-space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-weight:700; font-size:14px; color:#1e293b;">统计日期：</span>
          <input class="form-input" type="date" value="${opsNevDailyDate}" onchange="opsNevDailyDate=this.value; if(typeof showToast==='function') showToast('日期已切换至 '+this.value, true);" />
        </div>
        <div style="display:flex; gap:12px;">
          <button class="btn-blue-primary" type="button" style="padding:8px 20px;" onclick="openOpsEmailDrawer('NEV日报')">✉️ 发送邮件</button>
          <button class="btn-outline-blue" type="button" style="padding:8px 20px;" onclick="if(typeof showToast==='function') showToast('创建导出任务【总部NEV日报_${opsNevDailyDate}.xlsx】成功！', true)">📊 导出Excel</button>
        </div>
      </section>

      <nav style="display:flex; gap:8px; margin-bottom:16px; border-bottom:2px solid #e2e8f0; padding-bottom:6px;">
        ${tabs.map(t => `
          <button type="button" style="padding:8px 18px; border:none; background:${opsNevDailyActiveTab===t.key?'#2563eb':'transparent'}; color:${opsNevDailyActiveTab===t.key?'#fff':'#64748b'}; font-weight:700; border-radius:6px; cursor:pointer;" onclick="opsNevDailyActiveTab='${t.key}'; renderOpsHqNevDailyPage();">${t.label}</button>
        `).join('')}
      </nav>

      <main style="background:#fff; border-radius:12px; padding:20px; border:1px solid #e2e8f0;">
        <div style="margin-bottom:20px;">
          <h3 style="margin:0 0 12px 0; font-size:16px; font-weight:800; color:#0f172a;">📊 NEV 培育核心执行指标大盘 (${opsNevDailyDate})</h3>
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px;">
            <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe); border-radius:10px; padding:16px; border:1px solid #bfdbfe;">
              <span style="font-size:12px; color:#1e40af; font-weight:700;">当日新增留资线索</span>
              <div style="font-size:26px; font-weight:900; color:#1e3a8a; margin-top:6px;">1,420 <small style="font-size:12px;">条</small></div>
              <span style="font-size:11px; color:#3b82f6;">较昨日 +12.4% ↑</span>
            </div>
            <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5); border-radius:10px; padding:16px; border:1px solid #a7f3d0;">
              <span style="font-size:12px; color:#065f46; font-weight:700;">24H 及时首触率</span>
              <div style="font-size:26px; font-weight:900; color:#064e3b; margin-top:6px;">94.8%</div>
              <span style="font-size:11px; color:#10b981;">高水准维持中 ✓</span>
            </div>
            <div style="background:linear-gradient(135deg,#fff7ed,#ffedd5); border-radius:10px; padding:16px; border:1px solid #fed7aa;">
              <span style="font-size:12px; color:#9a3412; font-weight:700;">试驾预约到店率</span>
              <div style="font-size:26px; font-weight:900; color:#7c2d12; margin-top:6px;">38.5%</div>
              <span style="font-size:11px; color:#f97316;">较上周 +3.1% ↑</span>
            </div>
            <div style="background:linear-gradient(135deg,#f3e8ff,#e9d5ff); border-radius:10px; padding:16px; border:1px solid #ddd6fe;">
              <span style="font-size:12px; color:#6b21a8; font-weight:700;">下发到店成功率</span>
              <div style="font-size:26px; font-weight:900; color:#581c87; margin-top:6px;">82.1%</div>
              <span style="font-size:11px; color:#8b5cf6;">目标完成率 102%</span>
            </div>
          </div>
        </div>

        <div>
          <h4 style="font-size:14px; font-weight:800; color:#334155; margin-bottom:10px;">各大区/专营店执行数据分布</h4>
          <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left;">
                <th style="padding:10px;">大区 / 专营店</th><th style="padding:10px;">分配任务</th><th style="padding:10px;">已跟进</th><th style="padding:10px;">首触及时数</th><th style="padding:10px;">预约试驾</th><th style="padding:10px;">试驾率</th><th style="padding:10px;">下发到店</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:700;">华南大区 - 广州天河店</td><td style="padding:10px;">320</td><td style="padding:10px; color:#2563eb; font-weight:700;">310</td><td style="padding:10px;">305</td><td style="padding:10px;">125</td><td style="padding:10px; color:#059669; font-weight:700;">40.3%</td><td style="padding:10px;">98</td></tr>
              <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:700;">华东大区 - 上海浦东店</td><td style="padding:10px;">280</td><td style="padding:10px; color:#2563eb; font-weight:700;">275</td><td style="padding:10px;">268</td><td style="padding:10px;">110</td><td style="padding:10px; color:#059669; font-weight:700;">40.0%</td><td style="padding:10px;">85</td></tr>
              <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:700;">华北大区 - 北京朝阳店</td><td style="padding:10px;">240</td><td style="padding:10px; color:#2563eb; font-weight:700;">230</td><td style="padding:10px;">220</td><td style="padding:10px;">85</td><td style="padding:10px; color:#059669; font-weight:700;">37.0%</td><td style="padding:10px;">72</td></tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `;
}

function openOpsEmailDrawer(title) {
  let drawer = document.getElementById('opsEmailDrawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'opsEmailDrawer';
    drawer.className = 'modal-backdrop';
    document.body.appendChild(drawer);
  }
  drawer.innerHTML = `
    <div style="background:#fff; width:480px; height:100vh; position:fixed; right:0; top:0; padding:24px; box-shadow:-10px 0 30px rgba(0,0,0,0.15); display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <div style="font-size:16px; font-weight:800; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
          <span>✉️ 发送【${title}】邮件推送</span>
          <button style="border:none; background:none; font-size:18px; cursor:pointer;" onclick="document.getElementById('opsEmailDrawer').classList.remove('show')">✕</button>
        </div>
        <form onsubmit="event.preventDefault(); document.getElementById('opsEmailDrawer').classList.remove('show'); if(typeof showToast==='function') showToast('邮件已成功推送至指定邮箱！', true);">
          <div style="display:flex; flex-direction:column; gap:14px;">
            <label style="font-size:13px; font-weight:700;">收件人邮箱 <input class="form-input" placeholder="输入收件人邮箱，多个用逗号隔开" value="dcc-management@dongfeng-nissan.com.cn" style="margin-top:4px;" /></label>
            <label style="font-size:13px; font-weight:700;">邮件主题 <input class="form-input" value="【DCC培育】${title} - ${opsNevDailyDate}" style="margin-top:4px;" /></label>
            <label style="font-size:13px; font-weight:700;">附加快照附件 <input type="checkbox" checked style="margin-right:6px;" />自动拼接日报快照图 (combinedReport.png)</label>
            <label style="font-size:13px; font-weight:700;">邮件正文说明 <textarea class="form-input" rows="4" style="margin-top:4px;">各位领导，这是今日最新总部NEV日报与执行数据全景，请查收！</textarea></label>
          </div>
          <div style="margin-top:24px; text-align:right;">
            <button class="btn-save" type="submit">立即发送</button>
          </div>
        </form>
      </div>
    </div>
  `;
  drawer.classList.add('show');
}


/* ==================== 5. AI渠道质量日报 模块 ==================== */
let opsAiQualityActiveTab = 'qualityDailyReport';

function renderOpsAiChannelQualityDailyPage() {
  const container = document.getElementById('opsAiChannelQualityDailyPage');
  if (!container) return;

  const tabs = [
    { key: 'qualityDailyReport', label: 'AI渠道质量日报' },
    { key: 'errorDailyReport', label: '异常情况日报' },
    { key: 'errorDailyList', label: '异常情况明细清单' }
  ];

  container.innerHTML = `
    <div style="padding:16px;">
      <section style="background:#fff; border-radius:12px; padding:16px; margin-bottom:16px; border:1px solid #e2e8f0;">
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:12px;">
          <label style="font-size:12px; color:#64748b;">统计日期范围<div><input class="form-input" type="date" value="2026-09-09" style="width:48%; display:inline-block;" /> ~ <input class="form-input" type="date" value="2026-09-16" style="width:48%; display:inline-block;" /></div></label>
          <label style="font-size:12px; color:#64748b;">R渠道<select class="form-input" style="margin-top:4px;"><option>全部渠道</option><option>R1-官网预约</option><option>R2-垂媒引流</option><option>R6-总部新媒体</option></select></label>
          <label style="font-size:12px; color:#64748b;">大项目名<select class="form-input" style="margin-top:4px;"><option>全部大项目</option><option>探陆首发项目</option><option>N7预售项目</option></select></label>
          <label style="font-size:12px; color:#64748b;">培育类型<select class="form-input" style="margin-top:4px;"><option>全部类型</option><option>AI外呼</option><option>人工客服</option></select></label>
          <div style="display:flex; align-items:flex-end; gap:8px;">
            <button class="btn-blue-primary" type="button" style="padding:8px 18px;" onclick="if(typeof showToast==='function') showToast('AI渠道质量查询成功', true)">查询</button>
            <button class="btn-outline-blue" type="button" style="padding:8px 18px;" onclick="openOpsEmailDrawer('AI渠道质量日报')">✉️ 发送邮件</button>
            <button class="btn-outline-blue" type="button" style="padding:8px 18px;" onclick="if(typeof showToast==='function') showToast('正在导出AI渠道质量日报...', true)">📊 导出Excel</button>
          </div>
        </div>
      </section>

      <nav style="display:flex; gap:8px; margin-bottom:16px; border-bottom:2px solid #e2e8f0; padding-bottom:6px;">
        ${tabs.map(t => `
          <button type="button" style="padding:8px 18px; border:none; background:${opsAiQualityActiveTab===t.key?'#2563eb':'transparent'}; color:${opsAiQualityActiveTab===t.key?'#fff':'#64748b'}; font-weight:700; border-radius:6px; cursor:pointer;" onclick="opsAiQualityActiveTab='${t.key}'; renderOpsAiChannelQualityDailyPage();">${t.label}</button>
        `).join('')}
      </nav>

      <main style="background:#fff; border-radius:12px; padding:20px; border:1px solid #e2e8f0;">
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:20px;">
          <div style="background:#f8fafc; border-radius:10px; padding:16px; border:1px solid #e2e8f0;">
            <span style="font-size:12px; color:#64748b;">AI 平均接通率</span>
            <div style="font-size:24px; font-weight:800; color:#2563eb; margin-top:4px;">68.4%</div>
            <span style="font-size:11px; color:#64748b;">高接通渠道：R1官网 (82%)</span>
          </div>
          <div style="background:#f8fafc; border-radius:10px; padding:16px; border:1px solid #e2e8f0;">
            <span style="font-size:12px; color:#64748b;">意向识别准确率</span>
            <div style="font-size:24px; font-weight:800; color:#059669; margin-top:4px;">92.1%</div>
            <span style="font-size:11px; color:#64748b;">H级/A级分类模型</span>
          </div>
          <div style="background:#f8fafc; border-radius:10px; padding:16px; border:1px solid #e2e8f0;">
            <span style="font-size:12px; color:#64748b;">平均沟通轮次</span>
            <div style="font-size:24px; font-weight:800; color:#7c3aed; margin-top:4px;">5.8 轮</div>
            <span style="font-size:11px; color:#64748b;">平均时长 85秒/单</span>
          </div>
        </div>

        <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left;">
              <th style="padding:10px;">R渠道名称</th><th style="padding:10px;">呼叫总量</th><th style="padding:10px;">成功接通</th><th style="padding:10px;">接通率</th><th style="padding:10px;">识别H/A级</th><th style="padding:10px;">质量评分</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:700;">R1-官网预约</td><td style="padding:10px;">1,200</td><td style="padding:10px;">984</td><td style="padding:10px; color:#059669; font-weight:700;">82.0%</td><td style="padding:10px;">420</td><td style="padding:10px; color:#2563eb; font-weight:700;">95.5 分</td></tr>
            <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:700;">R6-总部新媒体</td><td style="padding:10px;">2,500</td><td style="padding:10px;">1,725</td><td style="padding:10px; color:#059669; font-weight:700;">69.0%</td><td style="padding:10px;">680</td><td style="padding:10px; color:#2563eb; font-weight:700;">91.0 分</td></tr>
            <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px; font-weight:700;">R2-垂媒引流</td><td style="padding:10px;">1,800</td><td style="padding:10px;">1,080</td><td style="padding:10px; color:#d97706; font-weight:700;">60.0%</td><td style="padding:10px;">310</td><td style="padding:10px; color:#2563eb; font-weight:700;">86.2 分</td></tr>
          </tbody>
        </table>
      </main>
    </div>
  `;
}


/* ==================== 8. 下载列表 模块 ==================== */
function renderOpsDownloadListPage() {
  const container = document.getElementById('opsDownloadListPage');
  if (!container) return;

  const downloadMockData = [
    { id: 1, type: '外呼任务明细表', creator: '电销主管(张敏)', submitTime: '2026-09-16 14:30:12', status: 1, statusName: '成功', filename: '外呼任务明细表_2026-09-16.xlsx' },
    { id: 2, type: '录音列表导出', creator: '电销主管(张敏)', submitTime: '2026-09-16 11:20:00', status: 1, statusName: '成功', filename: '录音列表导出_2026-09-16.zip' },
    { id: 3, type: '总部NEV日报数据', creator: '系统自动生成', submitTime: '2026-09-16 09:00:00', status: 1, statusName: '成功', filename: '总部NEV日报_2026-09-15.xlsx' },
    { id: 4, type: 'AI渠道质量日报', creator: '电销主管(张敏)', submitTime: '2026-09-16 15:45:00', status: 2, statusName: '进行中', filename: '生成中...' },
    { id: 5, type: '批量下发日志汇总', creator: '系统管理员', submitTime: '2026-09-15 18:00:00', status: 0, statusName: '失败', filename: '导出超时未生成' }
  ];

  container.innerHTML = `
    <div style="padding:16px;">
      <section style="background:#fff; border-radius:12px; padding:16px; margin-bottom:16px; border:1px solid #e2e8f0;">
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:12px;">
          <label style="font-size:12px; color:#64748b;">文件类型<select class="form-input" style="margin-top:4px;"><option>全部类型</option><option>外呼任务明细表</option><option>录音列表导出</option><option>总部NEV日报数据</option></select></label>
          <label style="font-size:12px; color:#64748b;">提交时间范围<div><input class="form-input" type="date" value="2026-09-09" style="width:48%; display:inline-block;" /> ~ <input class="form-input" type="date" value="2026-09-16" style="width:48%; display:inline-block;" /></div></label>
          <div style="display:flex; align-items:flex-end; gap:8px;">
            <button class="btn-blue-primary" type="button" style="padding:8px 18px;" onclick="if(typeof showToast==='function') showToast('列表已更新', true)">查询</button>
            <button class="btn-outline-blue" type="button" style="padding:8px 18px;" onclick="renderOpsDownloadListPage()">🔄 刷新列表</button>
          </div>
        </div>
      </section>

      <section style="background:#fff; border-radius:12px; padding:16px; border:1px solid #e2e8f0;">
        <table class="mw-report-table" style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; text-align:left;">
              <th style="padding:10px;">序号</th><th style="padding:10px;">文件类型</th><th style="padding:10px;">创建人</th><th style="padding:10px;">提交时间</th><th style="padding:10px;">生成状态</th><th style="padding:10px;">操作 (点击下载)</th>
            </tr>
          </thead>
          <tbody>
            ${downloadMockData.map(item => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px;">${item.id}</td>
                <td style="padding:10px; font-weight:700;">${item.type}</td>
                <td style="padding:10px;">${item.creator}</td>
                <td style="padding:10px; color:#64748b;">${item.submitTime}</td>
                <td style="padding:10px;">
                  <span style="padding:2px 8px; border-radius:4px; font-size:12px; background:${item.status===1?'#dcfce7':item.status===2?'#dbeafe':'#ffe4e6'}; color:${item.status===1?'#166534':item.status===2?'#1e40af':'#9f1239'};">
                    ${item.statusName}
                  </span>
                </td>
                <td style="padding:10px;">
                  ${item.status === 1 ? `
                    <button type="button" style="color:#2563eb; border:none; background:none; cursor:pointer; font-weight:700;" onclick="if(typeof showToast==='function') showToast('开始下载文件【${item.filename}】...', true)">💾 ${item.filename}</button>
                  ` : item.status === 2 ? `
                    <span style="color:#64748b; font-size:12px;">⏳ 正在生成...</span>
                  ` : `
                    <span style="color:#9f1239; font-size:12px;">生成失败</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>
    </div>
  `;
}


/* ==================== 6. 人工坐席工单 模块 ==================== */
const opsManualWorkordersMockData = [
  { index: 1, taskId: '2026080100000000001', leadId: '1883735719848067112', channelR: 'R6-总部新媒体', customerName: '用户', phone: '18874369548', intentSeries: '2026款探陆', latestSeries: '2026款探陆', followStatus: '已完成', followCount: 5, taskType: '预外呼', initialStatus: '培育中', initialLevel: 'H', assignType: '首次分配', assignTime: '2026-08-01 00:00:10', agentAccount: '电销D组张敏', store: '广州东风日产天河店', city: '广州', notes: '客户已确认本周六预约到店试驾，关注置换补贴。' },
  { index: 2, taskId: '2026080100000000002', leadId: '1883735719848067115', channelR: 'R1-官网预约', customerName: '陈先生', phone: '15899998888', intentSeries: 'N6', latestSeries: 'N6 智驾版', followStatus: '跟进中', followCount: 3, taskType: '预测外呼', initialStatus: '培育中', initialLevel: 'H', assignType: '超时转接', assignTime: '2026-08-01 09:15:30', agentAccount: '电销A组李雷', store: '广州东风日产天河店', city: '广州', notes: '原坐席超时未跟进，自动转接后已联系，发送选配手册。' },
  { index: 3, taskId: '2026080100000000003', leadId: '1883735719848067120', channelR: 'R3-车展留资', customerName: '赵女士', phone: '18511112222', intentSeries: 'N7', latestSeries: 'N7 旗舰款', followStatus: '待跟进', followCount: 1, taskType: '预外呼', initialStatus: '待分配', initialLevel: 'A', assignType: '首次分配', assignTime: '2026-08-01 10:30:00', agentAccount: '电销D组张敏', store: '上海东风日产浦东店', city: '上海', notes: '关注三电终身质保与首发权益。' }
];

let opsManualWorkordersFilter = { startDate: '2026-08-01', endDate: '2026-08-26', keyword: '', followStatus: '', assignType: '', agentAccount: '' };
let opsManualWorkorderDetailTab = 'detail';
let opsActiveManualWorkorderDetailId = '';

function renderOpsManualWorkordersPage() {
  const container = document.getElementById('opsManualWorkordersPage');
  if (!container) return;

  const filteredTasks = opsManualWorkordersMockData.filter(item => {
    const assignDate = item.assignTime.slice(0, 10);
    if (opsManualWorkordersFilter.startDate && assignDate < opsManualWorkordersFilter.startDate) return false;
    if (opsManualWorkordersFilter.endDate && assignDate > opsManualWorkordersFilter.endDate) return false;
    if (opsManualWorkordersFilter.keyword) {
      const kw = opsManualWorkordersFilter.keyword.trim().toLowerCase();
      const match = item.taskId.toLowerCase().includes(kw) || item.leadId.toLowerCase().includes(kw) || item.customerName.toLowerCase().includes(kw) || item.phone.includes(kw);
      if (!match) return false;
    }
    if (opsManualWorkordersFilter.followStatus && item.followStatus !== opsManualWorkordersFilter.followStatus) return false;
    if (opsManualWorkordersFilter.assignType && item.assignType !== opsManualWorkordersFilter.assignType) return false;
    if (opsManualWorkordersFilter.agentAccount && !item.agentAccount.includes(opsManualWorkordersFilter.agentAccount)) return false;
    return true;
  });

  const statusClass = status => ({ '已完成': 'done', '跟进中': 'progress', '待跟进': 'pending', '暂缓': 'paused' }[status] || 'paused');
  container.innerHTML = `
    <section class="mw-report-filter-card">
      <div class="mw-report-filter-title">筛选查询</div>
      <div class="mw-report-filter-grid">
        <label>人工回访工单<input class="form-input" id="mwFilterKeyword" placeholder="请输入工单、线索编码、客户或电话" value="${opsManualWorkordersFilter.keyword}" /></label>
        <label>跟进状态<select class="form-input" id="mwFilterFollowStatus"><option value="">全部</option>${['已完成', '跟进中', '待跟进', '暂缓'].map(value => `<option value="${value}" ${opsManualWorkordersFilter.followStatus === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
        <label>分配类型<select class="form-input" id="mwFilterAssignType"><option value="">全部</option>${['首次分配', '重新分配', '超时转接'].map(value => `<option value="${value}" ${opsManualWorkordersFilter.assignType === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
        <label>坐席账号<select class="form-input" id="mwFilterAgent"><option value="">全部坐席</option>${[['张敏','电销D组张敏'],['李雷','电销A组李雷'],['王五','电销B组王五'],['赵六','电销C组赵六']].map(([value, label]) => `<option value="${value}" ${opsManualWorkordersFilter.agentAccount === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
        <div class="mw-report-filter-actions"><button class="btn-blue-primary" type="button" onclick="applyOpsManualWorkordersFilter()">查询</button><button class="btn-outline-blue" type="button" onclick="resetOpsManualWorkordersFilter()">重置</button></div>
      </div>
      <div class="mw-report-filter-more"><label>分配时间<div><input class="form-input" type="date" value="${opsManualWorkordersFilter.startDate}" id="mwFilterStartDate" /><span>至</span><input class="form-input" type="date" value="${opsManualWorkordersFilter.endDate}" id="mwFilterEndDate" /></div></label></div>
    </section>

    <section class="mw-report-summary" aria-label="工单统计摘要">
      <div><span>总派发工单</span><strong>128<small> 单</small></strong></div><div><span>已跟进完成</span><strong class="success">105<small> 单（82%）</small></strong></div><div><span>待跟进工单</span><strong class="warning">15<small> 单</small></strong></div><div><span>平均跟进次数</span><strong class="primary">3.4<small> 次/单</small></strong></div><div><span>超时转接比例</span><strong class="danger">3.1%</strong></div>
    </section>

    <section class="mw-report-table-card">
      <div class="mw-report-table-toolbar"><h2>人工坐席工单</h2><div><button class="btn-outline-blue" type="button" onclick="exportOpsManualWorkordersReport()">导出数据</button><select class="form-input" aria-label="排序字段"><option>分配时间</option></select><select class="form-input" aria-label="排序方向"><option>降序</option><option>升序</option></select><button class="btn-outline-blue" type="button">字段显示</button></div></div>
      <div class="mw-report-table-scroll"><table class="mw-report-table">
        <thead>
          <tr><th>序号</th><th>人工回访工单</th><th>培育线索编码</th><th>线索渠道</th><th>客户姓名</th><th>联系电话</th><th>意向车系</th><th>最新留资车系</th><th>跟进状态</th><th>跟进次数</th><th>任务类型</th><th>初始线索状态</th><th>初始意向级别</th><th>分配类型</th><th>分配时间 ↓</th><th>坐席账号</th><th>操作</th></tr>
        </thead>
        <tbody>
          ${filteredTasks.length ? filteredTasks.map(item => `
            <tr><td>${item.index}</td><td class="mono">${item.taskId}</td><td class="mono">${item.leadId}</td><td>${item.channelR}</td><td class="customer">${item.customerName}</td><td class="mono">${item.phone}</td><td>${item.intentSeries}</td><td>${item.latestSeries}</td><td><span class="mw-status ${statusClass(item.followStatus)}">${item.followStatus}</span></td><td class="center strong">${item.followCount}</td><td>${item.taskType}</td><td>${item.initialStatus}</td><td class="center level">${item.initialLevel}</td><td class="${item.assignType === '超时转接' ? 'assign-alert' : ''}">${item.assignType}</td><td class="muted">${item.assignTime}</td><td>${item.agentAccount}</td><td><button class="mw-detail-link" type="button" onclick="openOpsWorkorderDetailModal('${item.taskId}')">详情</button></td></tr>
          `).join('') : `
            <tr><td colspan="17" class="empty">暂无符合条件的人工坐席工单数据</td></tr>
          `}
        </tbody>
      </table></div>
      <footer class="mw-report-pagination"><span>共 ${filteredTasks.length} 条记录，当前第 1 / 1 页</span><div><select class="form-input"><option>每页 10 条</option></select><button type="button" disabled>‹</button><select class="form-input"><option>第 1 页</option></select><button type="button" disabled>›</button></div></footer>
    </section>
  `;
}

function applyOpsManualWorkordersFilter() {
  opsManualWorkordersFilter.startDate = document.getElementById('mwFilterStartDate')?.value || '';
  opsManualWorkordersFilter.endDate = document.getElementById('mwFilterEndDate')?.value || '';
  opsManualWorkordersFilter.keyword = document.getElementById('mwFilterKeyword')?.value || '';
  opsManualWorkordersFilter.followStatus = document.getElementById('mwFilterFollowStatus')?.value || '';
  opsManualWorkordersFilter.assignType = document.getElementById('mwFilterAssignType')?.value || '';
  opsManualWorkordersFilter.agentAccount = document.getElementById('mwFilterAgent')?.value || '';
  renderOpsManualWorkordersPage();
  if (typeof showToast === 'function') showToast('工单筛选条件已生效', true);
}

function resetOpsManualWorkordersFilter() {
  opsManualWorkordersFilter = { startDate: '2026-08-01', endDate: '2026-08-26', keyword: '', followStatus: '', assignType: '', agentAccount: '' };
  renderOpsManualWorkordersPage();
  if (typeof showToast === 'function') showToast('筛选条件已重置', true);
}

function exportOpsManualWorkordersReport() {
  if (typeof showToast === 'function') showToast('正在导出【人工坐席工单】报表 (CSV)...', true);
}

function showOpsManualWorkorderDetailPage(taskId) {
  const item = opsManualWorkordersMockData.find(d => d.taskId === taskId) || opsManualWorkordersMockData[0];
  opsActiveManualWorkorderDetailId = item.taskId;
  opsManualWorkorderDetailTab = 'detail';
  document.querySelector('nav[aria-label="培育策略三级菜单"]')?.classList.add('hidden');
  document.querySelector('.leads-nav')?.classList.remove('show');
  document.querySelector('.reports-nav')?.classList.add('show');
  if (typeof setReportsNavActive === 'function') setReportsNavActive('人工坐席工单');
  if (typeof setSidebarActiveByName === 'function') setSidebarActiveByName('统计报表');
  if (typeof hideLeadPages === 'function') hideLeadPages();
  document.getElementById('designStage')?.classList.remove('show');
  if (typeof setPageName === 'function') setPageName('业务模块 / 统计报表 / 人工坐席工单 / 工单详情');
  renderOpsManualWorkorderDetailPage(item);
  document.getElementById('opsManualWorkorderDetailPage')?.classList.add('show');
}

function renderOpsManualWorkorderDetailPage(item) {
  const page = document.getElementById('opsManualWorkorderDetailPage');
  if (!page) return;
  page.innerHTML = `
    <div class="detail-page-header mw-workorder-detail-header"><div><div class="detail-page-title">查看人工坐席工单</div><div class="detail-page-subtitle">业务模块 / 统计报表 / 人工坐席工单 / ${item.taskId}</div></div><div class="lead-toolbar-right"><button class="btn-secondary" type="button" onclick="showOpsReportPage('人工坐席工单')">返回列表</button></div></div>
    <section class="mw-workorder-detail-summary"><div><span>人工回访工单</span><strong>${item.taskId}</strong></div><div><span>跟进状态</span><strong class="${item.followStatus === '已完成' ? 'success' : 'primary'}">${item.followStatus}</strong></div><div><span>客户信息</span><strong>${item.customerName} ${item.phone}</strong></div><div><span>意向车系</span><strong>${item.intentSeries}</strong></div><div><span>分配时间</span><strong>${item.assignTime}</strong></div><div><span>坐席账号</span><strong>${item.agentAccount}</strong></div></section>
    <section class="mw-workorder-detail-content">${renderOpsManualWorkorderDetailContent(item)}</section>
  `;
}

function openOpsWorkorderDetailModal(taskId) {
  showOpsManualWorkorderDetailPage(taskId);
}

function switchOpsManualWorkorderDetailTab(taskId, tab) {
  const item = opsManualWorkordersMockData.find(d => d.taskId === taskId) || opsManualWorkordersMockData[0];
  opsManualWorkorderDetailTab = tab;
  if (document.getElementById('opsManualWorkorderDetailPage')?.classList.contains('show')) {
    renderOpsManualWorkorderDetailPage(item);
  }
}

function renderOpsManualWorkorderDetailContent(item) {
  const tabs = [
    ['detail', '任务详情'],
    ['quality', '员工质检'],
    ['tags', '对话标签'],
    ['aiCall', 'AI外呼录音'],
    ['timeline', '时光轴']
  ];

  // 1. 顶部 Tab 导航条 (与 Ant Design Drawer 顶部页签样式 1:1 对齐)
  const tabsHeaderHtml = `
    <div style="display:flex; gap:28px; border-bottom:1px solid #e2e8f0; margin-bottom:20px; padding:0 12px; background:#fff;">
      ${tabs.map(([key, label]) => `
        <button type="button" 
                style="padding:12px 4px; border:none; background:none; font-size:14px; font-weight:${opsManualWorkorderDetailTab === key ? '700' : '400'}; color:${opsManualWorkorderDetailTab === key ? '#2563eb' : '#475569'}; border-bottom:${opsManualWorkorderDetailTab === key ? '3px solid #2563eb' : '3px solid transparent'}; cursor:pointer; transition:all 0.2s;"
                onclick="switchOpsManualWorkorderDetailTab('${item.taskId}', '${key}')">
          ${label}
        </button>
      `).join('')}
    </div>
  `;

  // 2. 数据准备与分类面板 HTML 填充
  let bodyContent = '';

  const ratingByLevel = { H: { text: '高', score: 80, color: '#be123c' }, A: { text: '中', score: 68, color: '#d97706' }, B: { text: '中', score: 65, color: '#d97706' }, C: { text: '低', score: 45, color: '#2563eb' } };
  const rating = ratingByLevel[item.initialLevel] || ratingByLevel.H;
  const ratingTags = {
    basic: [['年龄段', '25-35岁'], ['职业', '企业管理人员'], ['预测婚否', '已婚'], ['预测是否有孩', '有'], ['预测消费水平', '中高'], ['预测收入水平', '中高'], ['预测人生阶段', '家庭成长期'], ['预测人生关键节点', '换购期'], ['预测是否有车', '是'], ['预测有车品牌', '日产'], ['有车品牌等级', '合资'], ['职业_外部', '企业管理'], ['常住城市等级', '新一线'], ['城市组合', item.city || '广州'], ['区县组合', '天河区'], ['最新车品牌', '日产'], ['最新车车系', item.intentSeries || '轩逸'], ['预测手机品牌', '华为'], ['预测性别', '男'], ['预测学历', '本科']],
    interaction: [['最近一次留资距今天数', '5天'], ['有效留资次数', '3次'], ['最近一次试驾距今天数', '3天'], ['最近一次到店距今天数', '3天'], ['试驾次数', '1次'], ['到店次数', '2次']],
    preference: [['近三月平台访问次数', '28次'], ['融合兴趣标签(30天)', '科技数码']],
    purchase: [['预约到店日期', '2026-09-18'], ['预计用车时间', '1个月内'], ['品牌认知', '高'], ['购车预算', '16-20万'], ['关注竞品', '比亚迪宋PLUS'], ['购车关注点', '智能化'], ['购车顾虑点', '保值率'], ['用车场景', '家庭出游'], ['购买形态', '换购'], ['付款方式', '贷款']]
  };
  const renderRatingGroup = (title, values) => `<section class="rating-feature-group" style="margin-top:12px;"><div class="rating-feature-heading" style="font-weight:700; color:#334155; margin-bottom:8px;"><h6>${title}</h6></div><div class="rating-feature-tags" style="display:flex; flex-wrap:wrap; gap:8px;">${values.map(([label, value]) => `<span style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-size:12px;"><em style="color:#64748b; margin-right:4px; font-style:normal;">${label}:</em><strong style="color:#0f172a;">${value}</strong></span>`).join('')}</div></section>`;
  const ratingContent = `<div class="nurture-rating-panel mw-rating-panel" style="padding:16px; background:#fff; border-radius:8px;"><div class="rating-result-label" style="font-size:14px; font-weight:700; margin-bottom:12px;">对话标签与意向预评</div><div class="rating-score-strip" style="display:flex; align-items:center; gap:12px; margin-bottom:16px;"><strong class="rating-level" style="color:${rating.color}; font-size:20px;">${rating.text}级意向</strong><strong class="rating-score" style="font-size:24px; font-weight:800;">${rating.score}<small style="font-size:12px;">分</small></strong></div><section class="rating-summary-block" style="background:#f8fafc; padding:12px; border-radius:6px; margin-bottom:16px;"><h5 style="margin:0 0 6px 0; font-size:13px; font-weight:700;">预评小结</h5><div class="rating-summary-copy" style="font-size:13px; color:#334155;">当前评为<strong>${rating.text}等级</strong>：计划<strong>1个月内</strong>购车，关注<strong>${item.intentSeries || '探陆'}</strong>，预算<strong>16-20万</strong>；已产生<strong>${item.followCount || 4}次</strong>跟进，建议重点围绕到店试驾与补贴政策推进。</div></section><section class="rating-features-block"><h5 style="margin:0 0 8px 0; font-size:13px; font-weight:700;">客户特征标签</h5>${renderRatingGroup('基础画像', ratingTags.basic)}${renderRatingGroup('互动表现', ratingTags.interaction)}${renderRatingGroup('兴趣偏好', ratingTags.preference)}${renderRatingGroup('购车需求', ratingTags.purchase)}</section></div>`;

  if (opsManualWorkorderDetailTab === 'quality') {
    bodyContent = `<section class="mw-detail-pane" style="padding:16px; background:#fff; border-radius:8px;">
      <div class="mw-quality-score" style="display:flex; align-items:center; gap:16px; margin-bottom:20px; padding:16px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px;">
        <span style="font-size:14px; color:#166534; font-weight:600;">本次质检得分</span>
        <strong style="font-size:32px; font-weight:800; color:#15803d;">92<small style="font-size:14px;"> 分</small></strong>
        <span style="padding:2px 10px; background:#22c55e; color:#fff; font-size:12px; border-radius:12px; font-weight:700;">质检通过</span>
      </div>
      <div class="mw-quality-list" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-bottom:16px;">
        <div style="background:#f8fafc; padding:12px; border-radius:6px; display:flex; justify-content:space-between;"><span>开场及身份确认</span><b style="color:#16a34a;">合规</b></div>
        <div style="background:#f8fafc; padding:12px; border-radius:6px; display:flex; justify-content:space-between;"><span>需求信息确认</span><b style="color:#16a34a;">完整</b></div>
        <div style="background:#f8fafc; padding:12px; border-radius:6px; display:flex; justify-content:space-between;"><span>产品与权益介绍</span><b style="color:#16a34a;">准确</b></div>
        <div style="background:#f8fafc; padding:12px; border-radius:6px; display:flex; justify-content:space-between;"><span>服务规范与结束语</span><b style="color:#16a34a;">合规</b></div>
      </div>
      <p class="mw-detail-note" style="color:#475569; font-size:13px; line-height:1.6; background:#f1f5f9; padding:12px; border-radius:6px;"><strong>质检评语：</strong> 坐席话术标准规范，开场自我介绍清晰，成功引导客户确认下次回访时间与意向车系试驾要点。</p>
    </section>`;
  } else if (opsManualWorkorderDetailTab === 'tags') {
    bodyContent = ratingContent;
  } else if (opsManualWorkorderDetailTab === 'aiCall') {
    bodyContent = `<section class="mw-detail-pane" style="padding:16px; background:#fff; border-radius:8px;">
      <h4 style="margin:0 0 12px 0; font-size:14px; font-weight:700; color:#0f172a;">AI 外呼通话录音及转写明细</h4>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:16px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <div><span style="font-weight:700; font-size:13px; color:#0f172a;">通话时长: 1分25秒</span> <span style="font-size:12px; color:#64748b; margin-left:12px;">对话轮次: 6轮</span></div>
          <span style="padding:2px 8px; background:#dbeafe; color:#1e40af; font-size:12px; border-radius:4px; font-weight:600;">科大讯飞AI语音引擎</span>
        </div>
        <audio controls style="width:100%; margin-bottom:12px;">
          <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg">
          您的浏览器不支持音频播放。
        </audio>
      </div>
      <div style="font-size:13px; font-weight:700; color:#0f172a; margin-bottom:8px;">对话文字转写：</div>
      <div style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto; padding:12px; background:#fafafa; border:1px solid #f1f5f9; border-radius:6px;">
        <div style="display:flex; gap:8px;"><strong style="color:#2563eb; min-width:48px;">AI坐席:</strong><span>您好！请问是${item.customerName || 'su测试1'}吗？这边是东风日产总部客户服务中心。</span></div>
        <div style="display:flex; gap:8px;"><strong style="color:#059669; min-width:48px;">客户:</strong><span>是的，是我。</span></div>
        <div style="display:flex; gap:8px;"><strong style="color:#2563eb; min-width:48px;">AI坐席:</strong><span>注意到您近期关注了${item.intentSeries || 'NX8'}，目前新车提供置换补贴与置换礼包，请问您方便预约本周去专营店试驾体验吗？</span></div>
        <div style="display:flex; gap:8px;"><strong style="color:#059669; min-width:48px;">客户:</strong><span>可以的，本周六下午有空。</span></div>
        <div style="display:flex; gap:8px;"><strong style="color:#2563eb; min-width:48px;">AI坐席:</strong><span>好的，已为您记录预约意向，稍后将安排专属电销顾问与您联系确认，祝您生活愉快！</span></div>
      </div>
    </section>`;
  } else if (opsManualWorkorderDetailTab === 'timeline') {
    bodyContent = `<section class="mw-detail-pane" style="padding:16px; background:#fff; border-radius:8px;">
      <h4 style="margin:0 0 16px 0; font-size:14px; font-weight:700; color:#0f172a;">全旅程线索时光轴 (Timeline)</h4>
      <div class="mw-workorder-timeline" style="border-left:2px solid #e2e8f0; padding-left:16px; margin-left:8px; display:flex; flex-direction:column; gap:16px;">
        <div style="position:relative;">
          <i style="position:absolute; left:-23px; top:4px; width:12px; height:12px; border-radius:50%; background:#2563eb;"></i>
          <time style="font-size:12px; color:#64748b;">${item.assignTime || '2026-09-08 16:49:19'}</time>
          <div style="font-size:13px; font-weight:700; color:#0f172a; margin-top:2px;">线索分配成功</div>
          <div style="font-size:12px; color:#475569;">系统根据【按当前负载优先分配】规则，分配至坐席 ${item.agentAccount || 'dfn_cip_ob_nev_lc'}</div>
        </div>
        <div style="position:relative;">
          <i style="position:absolute; left:-23px; top:4px; width:12px; height:12px; border-radius:50%; background:#16a34a;"></i>
          <time style="font-size:12px; color:#64748b;">2026-09-08 16:52:46</time>
          <div style="font-size:13px; font-weight:700; color:#0f172a; margin-top:2px;">人工外呼完成并提交记录</div>
          <div style="font-size:12px; color:#475569;">接触状态: 无人接听 | 最新回访结果: 下次回访 | 意向级别: E级</div>
        </div>
        <div style="position:relative;">
          <i style="position:absolute; left:-23px; top:4px; width:12px; height:12px; border-radius:50%; background:#eab308;"></i>
          <time style="font-size:12px; color:#64748b;">2026-09-08 16:53:43</time>
          <div style="font-size:13px; font-weight:700; color:#0f172a; margin-top:2px;">计划下次回访节点</div>
          <div style="font-size:12px; color:#475569;">系统预定提醒回访</div>
        </div>
      </div>
    </section>`;
  } else {
    // Default 'detail' Tab (任务详情): 包含完全对齐 media_1789525222159.png 的 3 列网格与灰色分类标题栏
    bodyContent = `
      <div style="background:#fff; padding:20px; border-radius:8px; font-size:13px; color:#334155;">
        
        <!-- 任务编码标题 -->
        <div style="font-size:16px; font-weight:800; color:#0f172a; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
          <span>任务编码：</span>
          <span>${item.taskId || '20260908164900000005'}</span>
        </div>

        <!-- 区域 1: 任务详情 3列网格 -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px 24px; margin-bottom:20px;">
          <div><span style="color:#64748b;">接收时间：</span><span>${item.assignTime || '2026-09-08 16:49:19'}</span></div>
          <div><span style="color:#64748b;">跟进状态：</span><span>${item.followStatus || '智能填单审核中'}</span></div>
          <div><span style="color:#64748b;">跟进次数：</span><span>${item.followCount || 2}</span></div>

          <div><span style="color:#64748b;">最新跟进时间：</span><span>2026-09-08 16:52:46</span></div>
          <div><span style="color:#64748b;">计划下次回访时间：</span><span>2026-09-08 16:53:43</span></div>
          <div><span style="color:#64748b;">是否逾期：</span><span>否</span></div>

          <div><span style="color:#64748b;">最新回访结果：</span><span>下次回访</span></div>
          <div><span style="color:#64748b;">最新线索结果原因：</span><span></span></div>
          <div><span style="color:#64748b;">初始意向级别：</span><span>A</span></div>

          <div><span style="color:#64748b;">最新意向级别：</span><span>E</span></div>
          <div><span style="color:#64748b;">线索R渠道：</span><span>R3-天网行动</span></div>
          <div><span style="color:#64748b;">媒体名称：</span><span>百度有驾</span></div>

          <div><span style="color:#64748b;">大项目名：</span><span>东风日产-总部-2025-2029-新能源小程序-预约试驾</span></div>
          <div><span style="color:#64748b;">初始线索状态：</span><span>培育中</span></div>
          <div><span style="color:#64748b;">人工手动下发：</span><span>-</span></div>

          <div><span style="color:#64748b;">人工手动下发更新时间：</span><span>-</span></div>
          <div><span style="color:#64748b;">人工外呼无人接通场景：</span><span>否</span></div>
          <div><span style="color:#64748b;">推送到预外呼状态：</span><span>已收到外呼反馈</span></div>

          <div><span style="color:#64748b;">试驾排程试点线索：</span><span>否</span></div>
          <div><span style="color:#64748b;">新任务类型：</span><span>首次线索任务</span></div>
          <div><span style="color:#64748b;">任务异常原因：</span><span></span></div>

          <div><span style="color:#64748b;">培育次数-AI：</span><span>-</span></div>
          <div><span style="color:#64748b;">培育次数-人工：</span><span>-</span></div>
        </div>

        <!-- 区域 2: 线索记录 灰色分界头 + 3列网格 -->
        <div style="background:#f1f5f9; padding:6px 12px; font-weight:700; font-size:14px; color:#0f172a; margin-bottom:14px; border-radius:2px;">线索记录</div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px 24px; margin-bottom:20px;">
          <div><span style="color:#64748b;">培育线索编码：</span><span>${item.leadId || '1808390868654300036867'}</span></div>
          <div><span style="color:#64748b;">联系电话：</span><span>${item.phone || '15054288636'}</span></div>
          <div><span style="color:#64748b;">客户姓名：</span><span>${item.customerName || 'su测试1'}</span></div>

          <div><span style="color:#64748b;">性别：</span><span>男</span></div>
          <div><span style="color:#64748b;">备用电话：</span><span>13609779076</span></div>
          <div><span style="color:#64748b;">意向门店：</span><span>id:H2901-广州风日</span></div>

          <div><span style="color:#64748b;">意向级别：</span><span>计划一个月内买车</span></div>
          <div><span style="color:#64748b;">意向车辆：</span><span>${item.intentSeries || 'NX8'} - NX8</span></div>
          <div><span style="color:#64748b;">最新留资车系：</span><span>-</span></div>

          <div><span style="color:#64748b;">留资时间：</span><span>2026-01-14 17:30:00</span></div>
          <div><span style="color:#64748b;">线索类型：</span><span>线索类型名称</span></div>
          <div><span style="color:#64748b;">线索来源：</span><span>DNDC-车巴巴</span></div>

          <div><span style="color:#64748b;">用户微信号：</span><span></span></div>
          <div><span style="color:#64748b;">线索描述：</span><span>测试</span></div>
          <div><span style="color:#64748b;">IP归属地：</span><span>广东广州</span></div>

          <div><span style="color:#64748b;">SC：</span><span>C2025-51382-9599-617-2623061</span></div>
          <div><span style="color:#64748b;">线索备注：</span><span>测试</span></div>
          <div><span style="color:#64748b;">线索状态：</span><span>培育中</span></div>

          <div><span style="color:#64748b;">保客车型：</span><span>444</span></div>
        </div>

        <!-- 区域 3: 分配信息 灰色分界头 -->
        <div style="background:#f1f5f9; padding:6px 12px; font-weight:700; font-size:14px; color:#0f172a; margin-bottom:14px; border-radius:2px;">分配信息</div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px 24px; margin-bottom:20px; font-size:13px;">
          <div><span style="color:#64748b;">分配账号：</span><span>dfn_cip_ob_nev_lc</span></div>
          <div><span style="color:#64748b;">分配账号名称：</span><span>${item.agentAccount || '电销D组张敏'}</span></div>
          <div><span style="color:#64748b;">分配时间：</span><span>${item.assignTime || '2026-09-08 16:49:19'}</span></div>
          <div><span style="color:#64748b;">分配规则：</span><span>按当前负载优先分配</span></div>
        </div>

        <!-- 区域 4: 回访记录1 灰色分界头 + 3列网格 -->
        <div style="background:#f1f5f9; padding:6px 12px; font-weight:700; font-size:14px; color:#0f172a; margin-bottom:14px; border-radius:2px;">回访记录1</div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px 24px; font-size:13px;">
          <div><span style="color:#64748b;">创建时间：</span><span>2026-09-08 16:52:46</span></div>
          <div><span style="color:#64748b;">提交状态：</span><span>已提交</span></div>
          <div><span style="color:#64748b;">提交时间：</span><span>2026-09-08 16:52:46</span></div>

          <div><span style="color:#64748b;">沟通方式：</span><span>人工外呼-官方号</span></div>
          <div><span style="color:#64748b;">接触状态：</span><span>无人接听</span></div>
          <div><span style="color:#64748b;">回访结果：</span><span>下次回访</span></div>

          <div><span style="color:#64748b;">意向级别：</span><span>E</span></div>
          <div><span style="color:#64748b;">客户性别：</span><span>男</span></div>
          <div><span style="color:#64748b;">计划下次回访时间：</span><span>2026-09-08 16:53:43</span></div>

          <div><span style="color:#64748b;">下发门店：</span><span></span></div>
          <div><span style="color:#64748b;">意向车辆：</span><span>id:-</span></div>
          <div><span style="color:#64748b;">购车方式：</span><span></span></div>

          <div><span style="color:#64748b;">计划购买时间：</span><span></span></div>
          <div><span style="color:#64748b;">备用电话：</span><span></span></div>
          <div><span style="color:#64748b;">预计到店时间：</span><span></span></div>

          <div><span style="color:#64748b;">添加企微：</span><span>不同意</span></div>
          <div><span style="color:#64748b;">结果原因：</span><span></span></div>
          <div><span style="color:#64748b;">提交人：</span><span>dfn_cip_ob_nev_lc@default-NEV线秀总部培育人工外呼2</span></div>
        </div>

      </div>
    `;
  }

  return tabsHeaderHtml + bodyContent;
}


/* ==================== 7. 坐席业绩看板 模块 ==================== */
const opsSdN=['黄思云:B','刘华美:C','李燕幸:C','李文朗:C','黎静文:A','徐伟振:C','文颖诗:C','廖欢:B','朱晓贤:B','徐敏华:C','张美凤:B','符婷:B','高金燕:A','侯三妹:A','朱伟杰:C','黄学全:B','廖伟杰:A','刘丝丝:C','张诗韵:B','卢秋兰:C','王国豪:A','孙茜:B','陶冰:B','林立锋:C','潘婷婷:C','蒲师师:A','邝美兰:A','钟梓萱:A','萧婉仪:A','冯明煜:A','杨磊盼:B','卢梓玮:B','谢欣婷:B','陈豪:A','毕纭嘉:C','韦春燕:C','余静娴:B','王欣彤:A','王桂如:C','李壁妤:B','关思惠:C','郑小巧:A','曾永红:B','张华锋:C','刘丽娟:B','黄玉梅:B','戴文浩:A','陈蔓欣:A','黄子薇:A','邱燕儿:C','唐馨:B','黎翠娟:A','陈小燕:A','林冰:B','谭晓莹:A','朱佳佳:A','林楚龙:B','田紫叶:B','杨志宏:C','陈丽媛:C','陈树彬:A','巫润佳:C','刘正聪:C','冯泳怡:B'].map((x,i)=>{let [name,g]=x.split(':');return{name,g:g+'组',code:'佳佳'+(i+1),t:145+i%8*6,w:28+i%7*3,wd:4+i%3}});
const opsSdDays=['2026-09-01','2026-09-02','2026-09-03','2026-09-04','2026-09-05','2026-09-06','2026-09-07'],opsSdG=['A组','B组','C组'];let opsSdF={1:{s:opsSdDays[6],sh:9,e:opsSdDays[6],eh:11},2:{s:opsSdDays[0],sh:0,e:opsSdDays[6],eh:23}};
const opsSdDur=x=>{x=Math.round(x);return x<60?x+'秒':Math.floor(x/60)+'分'+(x%60?x%60+'秒':'')},opsSdTag=g=>g==='A组'?'a':g==='B组'?'b':'c';

function opsSdCalc(f){
  let ds=opsSdDays.filter(x=>x>=f.s&&x<=f.e),r=opsSdN.map((x,i)=>({...x,p:0,c:0,task:0}));
  ds.forEach((d,di)=>r.forEach((x,i)=>{for(let h=9;h<19;h++){if(d===f.s&&h<f.sh||d===f.e&&h>f.eh||d===opsSdDays[6]&&i>=40)continue;let n=(i*7+di*11+h*3)%17;x.p+=n>12?3:n>8?2:n>5?1:0;x.c+=n>2?70+n*37:0;x.task+=n>4?1+n%3:0}}));
  if(ds.length===1&&f.s===opsSdDays[6]&&f.sh===9&&f.eh===11){
    const cfg={'A组':{p:[8,7,6,5,4,4,3,3,2,2,2,1,1,0],c:[52.25,40,35,30,28,25,22,20,18,15,8,4,2,1.7]},'B组':{p:[9,6,5,4,3,3,2,2,1,1,1,0,0,0],c:[61.3,50,42,35,30,25,22,18,14,10,6,3,1,.73]},'C组':{p:[9,8,7,7,6,5,4,3,3,0,0,0],c:[60,55,50,45,40,38,35,32,25,18,10,8.48]}};
    r.forEach(x=>{x.p=0;x.c=0;x.task=0});
    opsSdG.forEach(g=>{const a=r.filter(x=>x.g===g),q=cfg[g];q.p.forEach((v,i)=>{a[i].p=v;a[i].c=Math.round(q.c[i]*60);a[i].task=1})});
  }
  r.forEach(x=>{x.active=x.p||x.c||x.task;x.eff=Math.round(x.w/x.wd)*ds.length;x.cp=x.eff?x.p/x.eff*100:0});
  let gs=opsSdG.map(g=>{let a=r.filter(x=>x.g===g);return{g,a,p:a.reduce((s,x)=>s+x.p,0),c:a.reduce((s,x)=>s+x.c,0),t:a.reduce((s,x)=>s+Math.round(x.t/30)*ds.length,0)}});
  return{r,gs,on:r.filter(x=>x.active),off:r.filter(x=>!x.active),ds};
}
const opsSdSort=(a,k,t)=>[...a].sort((x,y)=>y[k]-x[k]||y[t]-x[t]||x.name.localeCompare(y.name,'zh-CN'));
function opsSdSelect(id,k,v,hrs){let a=hrs?[...Array(24).keys()]:opsSdDays;return '<select id="opsSd'+id+k+'">'+a.map(x=>'<option '+(x==v?'selected':'')+' value="'+x+'">'+(hrs?x+'点':x)+'</option>').join('')+'</select>'}
function opsSdBars(a,k,col){let m=Math.max(...a.map(x=>x[k]),1);return '<div class="sd-bars">'+a.map(x=>'<div><b>'+x[k]+'</b><i style="height:'+Math.max(3,x[k]/m*190)+'px;background:'+(x[k]?col:'#d9d9d9')+'"></i><span>'+x.name+'</span></div>').join('')+'</div>'}
function opsSdTable(g){let a=opsSdSort(g.a,'p','c'),call=opsSdSort(g.a,'c','p');return '<div class="grp '+opsSdTag(g.g)+'"><b>▶ '+g.g+'</b><span>'+g.a.length+'人（休息 '+g.a.filter(x=>!x.active).length+' 人）· 排程 '+g.p+' 批 · 通话 '+opsSdDur(g.c)+' · 人均排程 '+(g.p/g.a.length).toFixed(2)+' 批</span></div><table><thead><tr><th>#</th><th>姓名</th><th>佳佳代码</th><th>排程量（批）</th><th>目标排程量(日)</th><th>完成度</th><th>组内排程排名</th><th>通话时长</th><th>组内通话排名</th><th>备注</th></tr></thead><tbody>'+a.map((x,i)=>'<tr><td>'+ (i+1)+'</td><td><b>'+x.name+'</b></td><td><em>'+x.code+'</em></td><td class="pc">'+x.p+'</td><td class="pc">'+x.eff+'</td><td>'+x.cp.toFixed(1)+'%</td><td>第 '+(i+1)+' 名</td><td class="call">'+(x.c?opsSdDur(x.c):'—')+'</td><td>第 '+(call.indexOf(x)+1)+' 名</td><td>'+(!x.active?'休息':'')+'</td></tr>').join('')+'</tbody></table>'}
function opsSdTop(a,k,t,blue){return opsSdSort(a,k,t).filter(x=>x[k]>0).slice(0,10).map((x,i)=>'<tr><td>'+(['🥇','🥈','🥉'][i]||i+1)+'</td><td><b>'+x.name+'</b></td><td>'+x.g+'</td><td class="'+(blue?'pc':'call')+'">'+(blue?x.p+'批':opsSdDur(x.c))+'</td><td class="'+(blue?'call':'pc')+'">'+(blue?opsSdDur(x.c):x.p+'批')+'</td></tr>').join('')}

function opsSdPanel(id,title,orange){
  let f=opsSdF[id],d=opsSdCalc(f),p=d.r.reduce((s,x)=>s+x.p,0),c=d.r.reduce((s,x)=>s+x.c,0),t=d.gs.reduce((s,x)=>s+x.t,0);
  return '<section class="major"><div class="major-title '+(orange?'month':'')+'">'+title+'</div><div class="filter">开始日期 '+opsSdSelect(id,'s',f.s)+' 开始小时 '+opsSdSelect(id,'sh',f.sh,1)+' 结束日期 '+opsSdSelect(id,'e',f.e)+' 结束小时 '+opsSdSelect(id,'eh',f.eh,1)+' <button onclick="applyOpsSeatDashboardFilter('+id+')">应用筛选</button><strong>当前时段：'+f.s+f.sh+'点 ～ '+f.e+f.eh+'点（覆盖 '+d.ds.length+' 天，'+d.on.length+' 人在岗）</strong></div><p class="note">数据时点：'+f.s+f.sh+'点 ～ '+f.e+f.eh+'点　|　指标：排程量 + 通话时长　|　完成度=排程量/目标</p><div class="kpis"><div><small>总排程量</small><b>'+p+' <i>批</i></b><span>试驾排程下发 + 试驾线索下发</span></div><div><small>总通话时长</small><b>'+opsSdDur(c)+'</b><span>'+c+'秒 · 累计外呼通话</span></div><div><small>参与小组</small><b>3 <i>组</i></b><span>A组 / B组 / C组</span></div><div><small>休息员工</small><b>'+d.off.length+' <i>人</i></b><span>本时段无回访记录 = 休</span></div></div><div class="box"><h3>一、各小组业绩汇总</h3><table><thead><tr><th>小组</th><th>员工人数</th><th>排程量（批）</th><th>目标排程量(日)</th><th>完成度</th><th>通话时长</th><th>人均排程</th><th>人均通话</th></tr></thead><tbody>'+d.gs.map(g=>'<tr><td>'+g.g+'</td><td>'+g.a.length+'人</td><td class="pc">'+g.p+'</td><td class="pc">'+g.t+'</td><td>'+ (g.p/g.t*100).toFixed(1)+'%</td><td class="call">'+opsSdDur(g.c)+'</td><td>'+ (g.p/g.a.length).toFixed(2)+'</td><td>'+opsSdDur(g.c/g.a.length)+'</td></tr>').join('')+'<tr class="sum"><td>合计</td><td>64人</td><td class="pc">'+p+'</td><td class="pc">'+t+'</td><td>'+ (p/t*100).toFixed(1)+'%</td><td class="call">'+opsSdDur(c)+'</td><td>'+ (p/64).toFixed(2)+'</td><td>'+opsSdDur(c/64)+'</td></tr></tbody></table></div><div class="box"><h3>二、上班全员业绩分布（共 '+d.on.length+' 人在岗）</h3><h4 class="center">上班全员 排程量（单位：批）</h4>'+opsSdBars(opsSdSort(d.on,'p','c'),'p','#1677ff')+'<h4 class="center">上班全员 通话时长（单位：分钟）</h4>'+opsSdBars(opsSdSort(d.on,'c','p').map(x=>({...x,c:Math.round(x.c/60)})),'c','#52c41a')+'</div><div class="box"><h3>三、员工明细业绩（按 A组 → B组 → C组）</h3>'+d.gs.map(opsSdTable).join('')+'</div><div class="box"><h3>四、全员双指标榜单 TOP 10</h3><div class="charts"><table><caption>🥇 排程量 TOP 10（批）</caption><thead><tr><th>排名</th><th>姓名</th><th>小组</th><th>排程量</th><th>通话时长</th></tr></thead><tbody>'+opsSdTop(d.r,'p','c',1)+'</tbody></table><table><caption>🥇 通话时长 TOP 10</caption><thead><tr><th>排名</th><th>姓名</th><th>小组</th><th>通话时长</th><th>排程量</th></tr></thead><tbody>'+opsSdTop(d.r,'c','p',0)+'</tbody></table></div></div></section>';
}

function renderOpsSeatDashboard(){
  let p=document.getElementById('opsSeatDashboardPage');
  if(!p)return;
  p.innerHTML='<main class="sd" style="padding:16px;"><header><h1>🏆 坐席业绩看板（全员晾晒）</h1><p>数据生成日期：2026-09-16　|　覆盖 64 名坐席 A/B/C 三组业绩排名、通话时长与排程下发量全景图。</p></header>'+opsSdPanel(1,'时段业绩大盘（A/B/C 三组）')+'</main>';
}

function applyOpsSeatDashboardFilter(id){
  let s=document.getElementById('opsSd'+id+'s').value,sh=parseInt(document.getElementById('opsSd'+id+'sh').value,10),e=document.getElementById('opsSd'+id+'e').value,eh=parseInt(document.getElementById('opsSd'+id+'eh').value,10);
  if(s>e||s===e&&sh>eh){ if(typeof showToast==='function') showToast('开始时间不能晚于结束时间', true); return; }
  opsSdF[id]={s,sh,e,eh}; renderOpsSeatDashboard();
  if(typeof showToast==='function') showToast('坐席业绩看板筛选已刷新', true);
}


/* 暴露所有渲染方法至全局 window */
window.renderOpsHqNurtureReportPage = renderOpsHqNurtureReportPage;
window.openManualTestDriveAppointmentLeadPage = openManualTestDriveAppointmentLeadPage;
window.renderOpsRecordingListPage = renderOpsRecordingListPage;
window.renderOpsBatchDispatchPage = renderOpsBatchDispatchPage;
window.openOpsBatchDispatchModal = openOpsBatchDispatchModal;
window.openOpsBatchLogModal = openOpsBatchLogModal;
window.openOpsBatchManualDetailModal = openOpsBatchManualDetailModal;
window.toggleOpsBatchAdvancedFilter = toggleOpsBatchAdvancedFilter;
window.applyOpsBatchFilter = applyOpsBatchFilter;
window.resetOpsBatchFilter = resetOpsBatchFilter;
window.toggleAllOpsBatch = toggleAllOpsBatch;
window.toggleOpsBatchRow = toggleOpsBatchRow;
window.renderOpsBatchAiDispatchPage = renderOpsBatchAiDispatchPage;
window.openOpsBatchAiDetailModal = openOpsBatchAiDetailModal;
window.toggleOpsBatchAiAdvancedFilter = toggleOpsBatchAiAdvancedFilter;
window.applyOpsBatchAiFilter = applyOpsBatchAiFilter;
window.resetOpsBatchAiFilter = resetOpsBatchAiFilter;
window.toggleAllOpsBatchAi = toggleAllOpsBatchAi;
window.toggleOpsBatchAiRow = toggleOpsBatchAiRow;
window.renderOpsHqNevDailyPage = renderOpsHqNevDailyPage;
window.renderOpsAiChannelQualityDailyPage = renderOpsAiChannelQualityDailyPage;
window.renderOpsManualWorkordersPage = renderOpsManualWorkordersPage;
window.renderOpsSeatDashboard = renderOpsSeatDashboard;
window.renderOpsDownloadListPage = renderOpsDownloadListPage;

/* ==================== AI外呼任务明细 详情抽屉模块 ==================== */
let opsAiCallWorkorderDetailTab = 'detail';
let opsActiveAiCallWorkorderDetailId = '';

const opsAiCallTaskMockData = [
  {
    index: 1,
    taskCode: 'AI20260916001',
    leadId: 'CLUE1883735719',
    channelR: 'R6-总部新媒体',
    customerName: '张先生',
    phone: '13812345678',
    intentSeries: '2026款探陆',
    latestSeries: '探陆 380T 四驱旗舰版',
    callResult: '已接通-高意向',
    hangupReason: '客户主动挂断',
    callCount: 1,
    rounds: 6,
    duration: 85,
    taskType: 'AI外呼',
    initialStatus: '待分配',
    initialLevel: 'B',
    latestLevel: 'H',
    assignType: '自动分配',
    assignTime: '2026-09-16 09:30:00',
    robotEngine: '科大讯飞AI外呼引擎-01',
    returnResult: '试驾排程下发',
    touchStatus: '用户接通',
    plannedCallTime: '2026-09-16 09:32:00',
    actualCallTime: '2026-09-16 09:32:10',
    latestFollowTime: '2026-09-16 09:33:35',
    isOverdue: '否',
    overdueStatus: '正常发呼',
    promptFirstTouch: '是',
    testDriveScheduled: '已预约(本周六到店)',
    pushPreCallStatus: '推送成功',
    intentTags: '置换补贴, 试驾邀约, 5000金',
    leadSource: '抖音官方直播间',
    isInfoIncomplete: '否',
    exceptionReason: '无异常',
    qualityScore: 98,
    dialogue: [
      { speaker: 'AI机器人', text: '您好，我是东风日产厂家智能顾问，请问您最近关注的2026款探陆，是在考虑置换旧车还是首次购车呢？', time: '09:32:12' },
      { speaker: '客户', text: '嗯，我想把手里的旧车换掉，探陆置换补贴有多少？', tag: '置换意向', time: '09:32:20' },
      { speaker: 'AI机器人', text: '探陆目前尊享最高10000元超级置换补贴，并且支持首付2成起的0息金融政策。您本周六方便到店试驾体验吗？', time: '09:32:32' },
      { speaker: '客户', text: '周六上午十点吧，你们在天河有店吗？', tag: '预约意向', time: '09:32:45' },
      { speaker: 'AI机器人', text: '有的，天河专营店位于天河区黄埔大道。已经为您预约本周六上午10点的探陆试驾，地址和专属顾问电话已发送至您的手机，感谢您的接听！', time: '09:33:10' }
    ]
  },
  {
    index: 2,
    taskCode: 'AI20260916002',
    leadId: 'CLUE1883735720',
    channelR: 'R1-官网预约',
    customerName: '李女士',
    phone: '15988889999',
    intentSeries: 'N6',
    latestSeries: 'N6 550km 智驭版',
    callResult: '已接通-中意向',
    hangupReason: 'AI完成问答挂断',
    callCount: 2,
    rounds: 4,
    duration: 42,
    taskType: 'AI外呼',
    initialStatus: '培育中',
    initialLevel: 'C',
    latestLevel: 'A',
    assignType: '首次分配',
    assignTime: '2026-09-16 10:15:20',
    robotEngine: '冰兰AI外呼引擎-02',
    returnResult: '下次回访',
    touchStatus: '用户接通',
    plannedCallTime: '2026-09-16 10:17:30',
    actualCallTime: '2026-09-16 10:18:00',
    latestFollowTime: '2026-09-16 10:18:42',
    isOverdue: '否',
    overdueStatus: '正常发呼',
    promptFirstTouch: '是',
    testDriveScheduled: '未预约',
    pushPreCallStatus: '推送成功',
    intentTags: '价格咨询, 纯电续航',
    leadSource: '官微小程序',
    isInfoIncomplete: '否',
    exceptionReason: '无异常',
    qualityScore: 95,
    dialogue: [
      { speaker: 'AI机器人', text: '您好，我是东风日产客服，看到您关注了全新纯电N6，目前官方大促优惠3万元，想问下您看重续航还是智驾？', time: '10:18:02' },
      { speaker: '客户', text: '我主要看续航，标称550km实际能跑多少？', tag: '续航询问', time: '10:18:15' },
      { speaker: 'AI机器人', text: 'N6采用全新全固态技术电池包，日常城市及高速综合续航达成率超85%，冬天也有热泵空调加持。', time: '10:18:28' },
      { speaker: '客户', text: '行，我先了解一下，资料发我手机吧。', tag: '资料索取', time: '10:18:38' }
    ]
  },
  {
    index: 3,
    taskCode: 'AI20260916003',
    leadId: 'CLUE1883735721',
    channelR: 'R3-车展留资',
    customerName: '王先生',
    phone: '18677776666',
    intentSeries: 'N7',
    latestSeries: 'N7 620km 旗舰版',
    callResult: '未接通-占线',
    hangupReason: '用户忙线拒接',
    callCount: 1,
    rounds: 0,
    duration: 0,
    taskType: 'AI外呼',
    initialStatus: '待跟进',
    initialLevel: 'B',
    latestLevel: 'B',
    assignType: '重新分配',
    assignTime: '2026-09-16 11:00:15',
    robotEngine: '一知智能外呼引擎-03',
    returnResult: '无人接听下发',
    touchStatus: '忙音/拒接',
    plannedCallTime: '2026-09-16 11:02:00',
    actualCallTime: '2026-09-16 11:02:45',
    latestFollowTime: '2026-09-16 11:02:45',
    isOverdue: '否',
    overdueStatus: '正常发呼',
    promptFirstTouch: '否',
    testDriveScheduled: '未预约',
    pushPreCallStatus: '待重试',
    intentTags: '无',
    leadSource: '广州车展扫码',
    isInfoIncomplete: '否',
    exceptionReason: '用户忙线未建联',
    qualityScore: 80,
    dialogue: []
  },
  {
    index: 4,
    taskCode: 'AI20260916004',
    leadId: 'CLUE1883735722',
    channelR: 'R2-垂媒引流',
    customerName: '赵先生',
    phone: '13566665555',
    intentSeries: 'NX8',
    latestSeries: 'NX8 豪华版',
    callResult: '已接通-邀约到店',
    hangupReason: '客户同意到店',
    callCount: 1,
    rounds: 8,
    duration: 118,
    taskType: 'AI外呼',
    initialStatus: '培育中',
    initialLevel: 'A',
    latestLevel: 'H',
    assignType: '首次分配',
    assignTime: '2026-09-16 13:20:00',
    robotEngine: '科大讯飞AI外呼引擎-02',
    returnResult: '意向线索下发',
    touchStatus: '用户接通',
    plannedCallTime: '2026-09-16 13:21:40',
    actualCallTime: '2026-09-16 13:22:15',
    latestFollowTime: '2026-09-16 13:24:13',
    isOverdue: '否',
    overdueStatus: '正常发呼',
    promptFirstTouch: '是',
    testDriveScheduled: '到店洽谈',
    pushPreCallStatus: '成功',
    intentTags: '竞品对比, 三电质保',
    leadSource: '懂车帝App',
    isInfoIncomplete: '否',
    exceptionReason: '无异常',
    qualityScore: 99,
    dialogue: [
      { speaker: 'AI机器人', text: '您好，我是东风日产厂家顾问，看到您在懂车帝浏览了NX8，请问您对NX8的豪华座椅和三电质保感兴趣吗？', time: '13:22:18' },
      { speaker: '客户', text: '我正在对比比亚迪唐，你们的整车质保怎么算？', tag: '竞品对比', time: '13:22:30' },
      { speaker: 'AI机器人', text: '东风日产NX8提供首任车主终身三电质保和8年/16万公里整车质保，力度超越同级竞品！', time: '13:22:45' },
      { speaker: '客户', text: '那挺好的，周日我可以抽空去深圳福田店试一下。', tag: '邀约成功', time: '13:23:05' }
    ]
  },
  {
    index: 5,
    taskCode: 'AI20260916005',
    leadId: 'CLUE1883735723',
    channelR: 'R6-总部新媒体',
    customerName: '陈女士',
    phone: '13911112222',
    intentSeries: '轩逸',
    latestSeries: '轩逸 超混电驱',
    callResult: '未接通-关机',
    hangupReason: '手机关机',
    callCount: 2,
    rounds: 0,
    duration: 0,
    taskType: 'AI外呼',
    initialStatus: '暂缓',
    initialLevel: 'C',
    latestLevel: 'C',
    assignType: '首次分配',
    assignTime: '2026-09-16 14:45:00',
    robotEngine: '冰兰AI外呼引擎-01',
    returnResult: '休眠失联',
    touchStatus: '关机',
    plannedCallTime: '2026-09-16 14:46:00',
    actualCallTime: '2026-09-16 14:46:20',
    latestFollowTime: '2026-09-16 14:46:20',
    isOverdue: '是',
    overdueStatus: '呼叫超期',
    promptFirstTouch: '否',
    testDriveScheduled: '未预约',
    pushPreCallStatus: '终止',
    intentTags: '无',
    leadSource: '小红书',
    isInfoIncomplete: '是',
    exceptionReason: '手机关机无法接触',
    qualityScore: 70,
    dialogue: []
  }
];

function showOpsAiCallWorkorderDetailPage(taskCode) {
  const item = opsAiCallTaskMockData.find(d => d.taskCode === taskCode) || opsAiCallTaskMockData[0];
  opsActiveAiCallWorkorderDetailId = item.taskCode;
  opsAiCallWorkorderDetailTab = 'detail';
  document.querySelector('nav[aria-label="培育策略三级菜单"]')?.classList.add('hidden');
  document.querySelector('.leads-nav')?.classList.remove('show');
  document.querySelector('.reports-nav')?.classList.add('show');
  if (typeof setReportsNavActive === 'function') setReportsNavActive('总部培育报表');
  if (typeof setSidebarActiveByName === 'function') setSidebarActiveByName('统计报表');
  if (typeof hideLeadPages === 'function') hideLeadPages();
  document.getElementById('designStage')?.classList.remove('show');
  if (typeof setPageName === 'function') setPageName('业务模块 / 统计报表 / 总部培育报表 / AI外呼工单详情');
  renderOpsAiCallWorkorderDetailPage(item);
  document.getElementById('opsAiCallWorkorderDetailPage')?.classList.add('show');
}

function openOpsAiCallWorkorderDetailModal(taskCode) {
  showOpsAiCallWorkorderDetailPage(taskCode);
}

function switchOpsAiCallWorkorderDetailTab(taskCode, tab) {
  const item = opsAiCallTaskMockData.find(d => d.taskCode === taskCode) || opsAiCallTaskMockData[0];
  opsAiCallWorkorderDetailTab = tab;
  if (document.getElementById('opsAiCallWorkorderDetailPage')?.classList.contains('show')) {
    renderOpsAiCallWorkorderDetailPage(item);
  }
}

function renderOpsAiCallWorkorderDetailPage(item) {
  const page = document.getElementById('opsAiCallWorkorderDetailPage');
  if (!page) return;
  page.innerHTML = `
    <div class="detail-page-header mw-workorder-detail-header">
      <div>
        <div class="detail-page-title">查看AI外呼任务工单</div>
        <div class="detail-page-subtitle">业务模块 / 统计报表 / 总部培育报表 / AI外呼任务明细 / ${item.taskCode}</div>
      </div>
      <div class="lead-toolbar-right">
        <button class="btn-secondary" type="button" onclick="showOpsReportPage('总部培育报表')">返回列表</button>
      </div>
    </div>
    <section class="mw-workorder-detail-summary" style="margin-bottom:16px;">
      <div><span>AI任务编码</span><strong>${item.taskCode}</strong></div>
      <div><span>外呼结果</span><strong class="${item.callResult.includes('已接通') ? 'success' : 'danger'}">${item.callResult}</strong></div>
      <div><span>客户姓名/电话</span><strong>${item.customerName} ${item.phone}</strong></div>
      <div><span>意向车系</span><strong>${item.intentSeries}</strong></div>
      <div><span>AI机器人引擎</span><strong>${item.robotEngine}</strong></div>
      <div><span>通话时长/轮次</span><strong>${item.duration}秒 / ${item.rounds}轮</strong></div>
    </section>
    <section class="mw-workorder-detail-content">${renderOpsAiCallWorkorderDetailContent(item)}</section>
  `;
}

function renderOpsAiCallWorkorderDetailContent(item) {
  const tabs = [
    ['detail', '任务详情'],
    ['aiCall', 'AI外呼录音'],
    ['tags', '对话标签'],
    ['quality', '员工质检'],
    ['timeline', '时光轴']
  ];

  const tabsHeaderHtml = `
    <div style="display:flex; gap:28px; border-bottom:1px solid #e2e8f0; margin-bottom:20px; padding:0 12px; background:#fff;">
      ${tabs.map(([key, label]) => `
        <button type="button" 
                style="padding:12px 4px; border:none; background:none; font-size:14px; font-weight:${opsAiCallWorkorderDetailTab === key ? '700' : '400'}; color:${opsAiCallWorkorderDetailTab === key ? '#2563eb' : '#475569'}; border-bottom:${opsAiCallWorkorderDetailTab === key ? '3px solid #2563eb' : '3px solid transparent'}; cursor:pointer; transition:all 0.2s;"
                onclick="switchOpsAiCallWorkorderDetailTab('${item.taskCode}', '${key}')">
          ${label}
        </button>
      `).join('')}
    </div>
  `;

  let bodyContent = '';
  if (opsAiCallWorkorderDetailTab === 'detail') {
    bodyContent = `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <div style="background:#fff; border-radius:8px; border:1px solid #e2e8f0; overflow:hidden;">
          <div style="background:#f1f5f9; padding:10px 16px; font-weight:700; color:#334155; font-size:14px; border-bottom:1px solid #e2e8f0;">
            1. 线索记录
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; padding:16px; font-size:13px;">
            <div><span style="color:#64748b;">AI任务编码：</span><strong>${item.taskCode}</strong></div>
            <div><span style="color:#64748b;">培育线索编码：</span><strong>${item.leadId}</strong></div>
            <div><span style="color:#64748b;">线索R渠道：</span><strong>${item.channelR}</strong></div>
            <div><span style="color:#64748b;">客户姓名：</span><strong>${item.customerName}</strong></div>
            <div><span style="color:#64748b;">联系电话：</span><strong>${item.phone}</strong></div>
            <div><span style="color:#64748b;">意向车系：</span><strong>${item.intentSeries}</strong></div>
            <div><span style="color:#64748b;">最新留资车系：</span><strong>${item.latestSeries}</strong></div>
            <div><span style="color:#64748b;">初始线索状态：</span><strong>${item.initialStatus}</strong></div>
            <div><span style="color:#64748b;">初始意向级别：</span><strong>${item.initialLevel}级</strong></div>
            <div><span style="color:#64748b;">最新意向级别：</span><strong style="color:#2563eb;">${item.latestLevel}级</strong></div>
            <div><span style="color:#64748b;">线索来源：</span><strong>${item.leadSource}</strong></div>
            <div><span style="color:#64748b;">信息是否未满：</span><strong>${item.isInfoIncomplete}</strong></div>
          </div>
        </div>

        <div style="background:#fff; border-radius:8px; border:1px solid #e2e8f0; overflow:hidden;">
          <div style="background:#f1f5f9; padding:10px 16px; font-weight:700; color:#334155; font-size:14px; border-bottom:1px solid #e2e8f0;">
            2. AI外呼与执行记录
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; padding:16px; font-size:13px;">
            <div><span style="color:#64748b;">机器人账号引擎：</span><strong style="color:#6366f1;">${item.robotEngine}</strong></div>
            <div><span style="color:#64748b;">AI外呼结果：</span><strong style="color:#059669;">${item.callResult}</strong></div>
            <div><span style="color:#64748b;">挂断原因：</span><strong>${item.hangupReason}</strong></div>
            <div><span style="color:#64748b;">拨打次数：</span><strong>${item.callCount} 次</strong></div>
            <div><span style="color:#64748b;">交互轮次：</span><strong>${item.rounds} 轮</strong></div>
            <div><span style="color:#64748b;">通话时长：</span><strong>${item.duration} 秒</strong></div>
            <div><span style="color:#64748b;">计划拨打时间：</span><strong>${item.plannedCallTime}</strong></div>
            <div><span style="color:#64748b;">实际拨打时间：</span><strong>${item.actualCallTime}</strong></div>
            <div><span style="color:#64748b;">最新跟进时间：</span><strong>${item.latestFollowTime}</strong></div>
          </div>
        </div>

        <div style="background:#fff; border-radius:8px; border:1px solid #e2e8f0; overflow:hidden;">
          <div style="background:#f1f5f9; padding:10px 16px; font-weight:700; color:#334155; font-size:14px; border-bottom:1px solid #e2e8f0;">
            3. 分配与排程信息
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; padding:16px; font-size:13px;">
            <div><span style="color:#64748b;">分配类型：</span><strong>${item.assignType}</strong></div>
            <div><span style="color:#64748b;">分配时间：</span><strong>${item.assignTime}</strong></div>
            <div><span style="color:#64748b;">是否逾期：</span><strong>${item.isOverdue}</strong></div>
            <div><span style="color:#64748b;">超期状态：</span><strong>${item.overdueStatus}</strong></div>
            <div><span style="color:#64748b;">及时首触：</span><strong>${item.promptFirstTouch}</strong></div>
            <div><span style="color:#64748b;">试驾排程：</span><strong style="color:#2563eb;">${item.testDriveScheduled}</strong></div>
            <div><span style="color:#64748b;">推送到预外呼状态：</span><strong>${item.pushPreCallStatus}</strong></div>
            <div><span style="color:#64748b;">识别意向标签：</span><strong>${item.intentTags}</strong></div>
            <div><span style="color:#64748b;">任务异常原因：</span><strong>${item.exceptionReason}</strong></div>
          </div>
        </div>
      </div>
    `;
  } else if (opsAiCallWorkorderDetailTab === 'aiCall') {
    bodyContent = `
      <div style="background:#fff; border-radius:8px; border:1px solid #e2e8f0; padding:20px;">
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:16px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:16px;">
            <button class="btn-blue-primary" type="button" style="width:40px; height:40px; border-radius:50%; padding:0; display:flex; align-items:center; justify-content:center; font-size:18px;" onclick="if(typeof showToast==='function') showToast('播放AI外呼原声音频...', true);">▶</button>
            <div>
              <div style="font-weight:700; color:#0f172a;">AI外呼通话录音 (${item.taskCode}.mp3)</div>
              <div style="font-size:12px; color:#64748b; margin-top:2px;">交互轮次: ${item.rounds} 轮 ｜ 通话时长: ${item.duration}秒 ｜ 外呼引擎: ${item.robotEngine}</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:12px; font-family:monospace; color:#475569;">00:42 / 01:25</span>
            <button class="btn-outline-blue" type="button" style="padding:4px 10px; font-size:12px;" onclick="if(typeof showToast==='function') showToast('已下载录音音频', true);">下载音频</button>
          </div>
        </div>

        <div style="font-weight:700; color:#1e293b; margin-bottom:12px; font-size:14px;">语音转写文本及意向识别轨迹：</div>
        <div style="display:flex; flex-direction:column; gap:12px; max-height:400px; overflow-y:auto; padding-right:8px;">
          ${item.dialogue && item.dialogue.length ? item.dialogue.map(msg => `
            <div style="display:flex; flex-direction:column; align-items:${msg.speaker === '客户' ? 'flex-end' : 'flex-start'};">
              <div style="font-size:11px; color:#94a3b8; margin-bottom:2px;">${msg.speaker} · ${msg.time}</div>
              <div style="max-width:75%; padding:10px 14px; border-radius:8px; font-size:13px; line-height:1.5; background:${msg.speaker === '客户' ? '#eff6ff' : '#f1f5f9'}; color:${msg.speaker === '客户' ? '#1e40af' : '#334155'}; border:${msg.speaker === '客户' ? '1px solid #bfdbfe' : '1px solid #e2e8f0'};">
                ${msg.text}
                ${msg.tag ? `<span style="display:inline-block; margin-left:8px; padding:2px 6px; background:#dcfce7; color:#166534; border-radius:4px; font-size:11px; font-weight:700;">${msg.tag}</span>` : ''}
              </div>
            </div>
          `).join('') : '<div style="text-align:center; padding:30px; color:#94a3b8;">未建联或无语音对话记录</div>'}
        </div>
      </div>
    `;
  } else if (opsAiCallWorkorderDetailTab === 'tags') {
    bodyContent = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="background:#fff; border-radius:8px; border:1px solid #e2e8f0; padding:16px;">
          <h4 style="margin:0 0 12px 0; font-size:14px; font-weight:700; color:#1e293b;">AI智能分析与意向提取</h4>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; font-size:13px;">
            <div style="background:#f8fafc; padding:12px; border-radius:6px; border:1px solid #e2e8f0;">
              <div style="color:#64748b; font-size:12px;">购买意向预测度</div>
              <div style="font-size:20px; font-weight:700; color:#059669; margin-top:4px;">${item.latestLevel === 'H' ? '92% (极高)' : '75% (较高)'}</div>
            </div>
            <div style="background:#f8fafc; padding:12px; border-radius:6px; border:1px solid #e2e8f0;">
              <div style="color:#64748b; font-size:12px;">客户情绪偏向</div>
              <div style="font-size:20px; font-weight:700; color:#2563eb; margin-top:4px;">积极沟通 / 试驾意向</div>
            </div>
            <div style="background:#f8fafc; padding:12px; border-radius:6px; border:1px solid #e2e8f0;">
              <div style="color:#64748b; font-size:12px;">关注核心卖点</div>
              <div style="font-size:13px; font-weight:700; color:#7c3aed; margin-top:6px;">置换补贴 / 空间配置 / 0息贷款</div>
            </div>
          </div>
        </div>
        <div style="background:#fff; border-radius:8px; border:1px solid #e2e8f0; padding:16px;">
          <h4 style="margin:0 0 12px 0; font-size:14px; font-weight:700; color:#1e293b;">识别标签集合</h4>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${(item.intentTags || '置换补贴, 试驾邀约').split(',').map(tag => `
              <span style="padding:6px 12px; background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; border-radius:16px; font-size:12px; font-weight:600;">🏷️ ${tag.trim()}</span>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  } else if (opsAiCallWorkorderDetailTab === 'quality') {
    bodyContent = `
      <div style="background:#fff; border-radius:8px; border:1px solid #e2e8f0; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:12px; margin-bottom:16px;">
          <div>
            <h4 style="margin:0; font-size:15px; font-weight:700; color:#0f172a;">AI外呼质量检测评估</h4>
            <div style="font-size:12px; color:#64748b; margin-top:2px;">评估引擎：Automated Quality Inspection V2.4</div>
          </div>
          <div style="font-size:24px; font-weight:800; color:#059669;">${item.qualityScore || 95}<small style="font-size:14px; font-weight: normal;"> 分 (优秀)</small></div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; font-size:13px;">
          <div style="padding:10px; background:#f8fafc; border-radius:6px; display:flex; justify-content:space-between;"><span>话术开场白规范：</span><strong style="color:#059669;">✅ 已达标</strong></div>
          <div style="padding:10px; background:#f8fafc; border-radius:6px; display:flex; justify-content:space-between;"><span>意向车系确认：</span><strong style="color:#059669;">✅ 已确认 (${item.intentSeries})</strong></div>
          <div style="padding:10px; background:#f8fafc; border-radius:6px; display:flex; justify-content:space-between;"><span>试驾邀约引导：</span><strong style="color:#059669;">✅ 成功引发</strong></div>
          <div style="padding:10px; background:#f8fafc; border-radius:6px; display:flex; justify-content:space-between;"><span>抢话打断控制：</span><strong style="color:#059669;">✅ 零打断 (合规)</strong></div>
        </div>
      </div>
    `;
  } else if (opsAiCallWorkorderDetailTab === 'timeline') {
    bodyContent = `
      <div style="background:#fff; border-radius:8px; border:1px solid #e2e8f0; padding:20px;">
        <div style="display:flex; flex-direction:column; gap:16px; border-left:2px solid #cbd5e1; padding-left:16px; margin-left:8px;">
          <div style="position:relative;">
            <div style="position:absolute; left:-23px; top:2px; width:12px; height:12px; border-radius:50%; background:#2563eb;"></div>
            <div style="font-weight:700; font-size:13px; color:#0f172a;">${item.assignTime}</div>
            <div style="font-size:12px; color:#475569; margin-top:2px;">线索进入AI外呼池，完成系统规则校验并自动下发至机器人引擎</div>
          </div>
          <div style="position:relative;">
            <div style="position:absolute; left:-23px; top:2px; width:12px; height:12px; border-radius:50%; background:#059669;"></div>
            <div style="font-weight:700; font-size:13px; color:#0f172a;">${item.actualCallTime}</div>
            <div style="font-size:12px; color:#475569; margin-top:2px;">AI机器人 (${item.robotEngine}) 发起外呼，客户成功接通并完成 ${item.rounds} 轮交互</div>
          </div>
          <div style="position:relative;">
            <div style="position:absolute; left:-23px; top:2px; width:12px; height:12px; border-radius:50%; background:#7c3aed;"></div>
            <div style="font-weight:700; font-size:13px; color:#0f172a;">${item.latestFollowTime}</div>
            <div style="font-size:12px; color:#475569; margin-top:2px;">AI识别客户具有强烈购买及试驾意向，线索意向级别升至 ${item.latestLevel} 级，下发试驾排程单</div>
          </div>
        </div>
      </div>
    `;
  }

  return tabsHeaderHtml + bodyContent;
}

window.showOpsAiCallWorkorderDetailPage = showOpsAiCallWorkorderDetailPage;
window.openOpsAiCallWorkorderDetailModal = openOpsAiCallWorkorderDetailModal;
window.switchOpsAiCallWorkorderDetailTab = switchOpsAiCallWorkorderDetailTab;

/* ==================== 预约试驾明细 数据与详情抽屉模块 ==================== */
const opsTestDriveMockData = [
  {
    index: 1,
    testDriveCode: 'TD20260916001',
    manualTaskCode: 'MT20260916001',
    leadCode: 'CLUE1883735719',
    scheduleCode: 'SCH20260916001',
    bookingNo: 'BK882910291',
    customerName: '张先生',
    phone: '13812345678',
    driveType: '店内深度试驾',
    driveStore: '广州天河专营店',
    driveSeries: '2026款探陆',
    driveVehicle: '探陆 380T 四驱旗舰版',
    bookingDate: '2026-09-20',
    driveTimeSlot: '10:00-11:30',
    scheduleSubmitTime: '2026-09-16 10:20:15',
    scheduleCreateTime: '2026-09-16 10:22:00',
    isRescheduled: '否',
    rescheduleDate: '-',
    rescheduleTimeSlot: '-',
    rescheduleSeriesCode: '-',
    rescheduleSeriesName: '-',
    statusUpdateTime: '2026-09-16 15:30:20',
    followAdvisor: '陈伟(资深顾问)',
    driveStatus: '已履约',
    cancelReason: '-',
    cancelTag: '-',
    isOverdueCancel: '否',
    isStoreFollowed: '是',
    storeFollowTime: '2026-09-16 11:30:00',
    storeFollowStatus: '已联系邀约',
    storeVisitDesc: '客户确认按时到店，已安排展车与试驾路线',
    latestRetainedSeries: '2026款探陆',
    storeFollowTotalCount: '3次',
    currentLeadLatestStatus: '已到店试驾',
    latestStoreFollowTime: '2026-09-16 14:20:00',
    latestStoreVisitDesc: '试驾体验良好，客户对空间和四驱性能非常满意',
    taskFollowTime: '2026-09-16 10:45:00',
    scheduleDispatchVisitDesc: '已成功下发至天河专营店试驾排程系统',
    contactStatus: '成功接通',
    agentAccount: 'seat_gz_01',
    isHqFollowed: '是',
    teleInitialStatus: '待联系',
    teleTaskActiveTime: '2026-09-16 09:40:00',
    unfulfilledReason: '-',
    visitSubmitTime: '2026-09-16 16:00:00',
    visitContactStatus: '已触达',
    visitResult: '意向高-推进购车订金',
    taskFollowVisitDesc: '客户反馈试驾静音与动力表现超出预期，本周末二次到店谈价',
    driveVisitFollowStatus: '已办结'
  },
  {
    index: 2,
    testDriveCode: 'TD20260916002',
    manualTaskCode: 'MT20260916002',
    leadCode: 'CLUE1883735720',
    scheduleCode: 'SCH20260916002',
    bookingNo: 'BK882910292',
    customerName: '李女士',
    phone: '15988889999',
    driveType: '普通到店试驾',
    driveStore: '上海浦东专营店',
    driveSeries: 'N6',
    driveVehicle: 'N6 550km 智驭版',
    bookingDate: '2026-09-21',
    driveTimeSlot: '15:00-16:00',
    scheduleSubmitTime: '2026-09-16 11:05:00',
    scheduleCreateTime: '2026-09-16 11:08:20',
    isRescheduled: '是',
    rescheduleDate: '2026-09-23',
    rescheduleTimeSlot: '14:00-15:00',
    rescheduleSeriesCode: 'SER_N6_2026',
    rescheduleSeriesName: 'N6 600km 激光雷达版',
    statusUpdateTime: '2026-09-16 16:10:00',
    followAdvisor: '林悦(销售主管)',
    driveStatus: '待履约',
    cancelReason: '-',
    cancelTag: '-',
    isOverdueCancel: '否',
    isStoreFollowed: '是',
    storeFollowTime: '2026-09-16 13:00:00',
    storeFollowStatus: '重排已确认',
    storeVisitDesc: '客户改期至周三下午，已调配顶配试驾车',
    latestRetainedSeries: 'N6',
    storeFollowTotalCount: '2次',
    currentLeadLatestStatus: '待到店试驾',
    latestStoreFollowTime: '2026-09-16 16:10:00',
    latestStoreVisitDesc: '微信发送排程确认单及门店电子导航',
    taskFollowTime: '2026-09-16 11:30:00',
    scheduleDispatchVisitDesc: '排程重排指令已同步至浦东专营店系统',
    contactStatus: '成功接通',
    agentAccount: 'seat_sh_03',
    isHqFollowed: '是',
    teleInitialStatus: '待联系',
    teleTaskActiveTime: '2026-09-16 10:15:00',
    unfulfilledReason: '-',
    visitSubmitTime: '2026-09-16 16:30:00',
    visitContactStatus: '已触达',
    visitResult: '重排确认-意向较强',
    taskFollowVisitDesc: '客户因出差申请后延两天，已妥善更新试驾日程',
    driveVisitFollowStatus: '跟进中'
  },
  {
    index: 3,
    testDriveCode: 'TD20260916003',
    manualTaskCode: 'MT20260916003',
    leadCode: 'CLUE1883735721',
    scheduleCode: 'SCH20260916003',
    bookingNo: 'BK882910293',
    customerName: '王先生',
    phone: '18677776666',
    driveType: '店内深度试驾',
    driveStore: '北京朝阳专营店',
    driveSeries: 'N7',
    driveVehicle: 'N7 620km 激光雷达版',
    bookingDate: '2026-09-19',
    driveTimeSlot: '11:30-12:30',
    scheduleSubmitTime: '2026-09-16 09:10:20',
    scheduleCreateTime: '2026-09-16 09:12:00',
    isRescheduled: '否',
    rescheduleDate: '-',
    rescheduleTimeSlot: '-',
    rescheduleSeriesCode: '-',
    rescheduleSeriesName: '-',
    statusUpdateTime: '2026-09-16 12:00:00',
    followAdvisor: '周浩(产品专家)',
    driveStatus: '已履约',
    cancelReason: '-',
    cancelTag: '-',
    isOverdueCancel: '否',
    isStoreFollowed: '是',
    storeFollowTime: '2026-09-16 10:00:00',
    storeFollowStatus: '已接待试驾',
    storeVisitDesc: '客户现场试驾30分钟，体验高速NOA领航辅助',
    latestRetainedSeries: 'N7',
    storeFollowTotalCount: '4次',
    currentLeadLatestStatus: '已试驾洽谈中',
    latestStoreFollowTime: '2026-09-16 12:00:00',
    latestStoreVisitDesc: '已出具按揭金融购车预算方案',
    taskFollowTime: '2026-09-16 09:30:00',
    scheduleDispatchVisitDesc: '排程系统下发成功，朝阳店前台已接单',
    contactStatus: '成功接通',
    agentAccount: 'seat_bj_02',
    isHqFollowed: '是',
    teleInitialStatus: '待联系',
    teleTaskActiveTime: '2026-09-16 08:50:00',
    unfulfilledReason: '-',
    visitSubmitTime: '2026-09-16 12:15:00',
    visitContactStatus: '已触达',
    visitResult: '深度意向-申请专属礼包',
    taskFollowVisitDesc: '用户对智驾辅助功能极度认可，正在申请限时购车权益',
    driveVisitFollowStatus: '已办结'
  },
  {
    index: 4,
    testDriveCode: 'TD20260916004',
    manualTaskCode: 'MT20260916004',
    leadCode: 'CLUE1883735722',
    scheduleCode: 'SCH20260916004',
    bookingNo: 'BK882910294',
    customerName: '赵先生',
    phone: '13566665555',
    driveType: '上门试驾',
    driveStore: '深圳福田专营店',
    driveSeries: 'NX8',
    driveVehicle: 'NX8 旗舰四驱版',
    bookingDate: '2026-09-22',
    driveTimeSlot: '14:00-15:30',
    scheduleSubmitTime: '2026-09-16 14:15:30',
    scheduleCreateTime: '2026-09-16 14:18:00',
    isRescheduled: '否',
    rescheduleDate: '-',
    rescheduleTimeSlot: '-',
    rescheduleSeriesCode: '-',
    rescheduleSeriesName: '-',
    statusUpdateTime: '2026-09-16 15:45:00',
    followAdvisor: '黄晓(高级顾问)',
    driveStatus: '待履约',
    cancelReason: '-',
    cancelTag: '-',
    isOverdueCancel: '否',
    isStoreFollowed: '是',
    storeFollowTime: '2026-09-16 15:00:00',
    storeFollowStatus: '已排期上门',
    storeVisitDesc: '已与客户确认上门试驾地址为福田CBD写字楼',
    latestRetainedSeries: 'NX8',
    storeFollowTotalCount: '1次',
    currentLeadLatestStatus: '待上门试驾',
    latestStoreFollowTime: '2026-09-16 15:45:00',
    latestStoreVisitDesc: '试驾车辆电量及保险手续已核验齐备',
    taskFollowTime: '2026-09-16 14:30:00',
    scheduleDispatchVisitDesc: '上门试驾特殊排程已下发至福田店专人跟进',
    contactStatus: '成功接通',
    agentAccount: 'seat_sz_05',
    isHqFollowed: '否',
    teleInitialStatus: '待联系',
    teleTaskActiveTime: '2026-09-16 14:00:00',
    unfulfilledReason: '-',
    visitSubmitTime: '2026-09-16 15:50:00',
    visitContactStatus: '已触达',
    visitResult: '等待上门履约',
    taskFollowVisitDesc: '客户工作繁忙，偏好工作日下午上门试驾，已协调店长特批',
    driveVisitFollowStatus: '跟进中'
  },
  {
    index: 5,
    testDriveCode: 'TD20260916005',
    manualTaskCode: 'MT20260916005',
    leadCode: 'CLUE1883735723',
    scheduleCode: 'SCH20260916005',
    bookingNo: 'BK882910295',
    customerName: '陈女士',
    phone: '13911112222',
    driveType: '普通到店试驾',
    driveStore: '成都高新专营店',
    driveSeries: '轩逸',
    driveVehicle: '轩逸 超混电驱 双擎版',
    bookingDate: '2026-09-18',
    driveTimeSlot: '16:30-17:30',
    scheduleSubmitTime: '2026-09-15 11:20:00',
    scheduleCreateTime: '2026-09-15 11:23:10',
    isRescheduled: '否',
    rescheduleDate: '-',
    rescheduleTimeSlot: '-',
    rescheduleSeriesCode: '-',
    rescheduleSeriesName: '-',
    statusUpdateTime: '2026-09-16 09:30:00',
    followAdvisor: '刘洋',
    driveStatus: '已取消',
    cancelReason: '客户行程变动临时出差',
    cancelTag: '客户时间冲突',
    isOverdueCancel: '否',
    isStoreFollowed: '是',
    storeFollowTime: '2026-09-16 09:10:00',
    storeFollowStatus: '已取消试驾',
    storeVisitDesc: '客户表示国庆后再行安排到店',
    latestRetainedSeries: '轩逸',
    storeFollowTotalCount: '2次',
    currentLeadLatestStatus: '预约取消待重新邀约',
    latestStoreFollowTime: '2026-09-16 09:30:00',
    latestStoreVisitDesc: '已保留意向权益，节后继续跟进回访',
    taskFollowTime: '2026-09-15 11:40:00',
    scheduleDispatchVisitDesc: '已同步取消试驾排程，释放车辆资源',
    contactStatus: '成功接通',
    agentAccount: 'seat_cd_02',
    isHqFollowed: '是',
    teleInitialStatus: '待联系',
    teleTaskActiveTime: '2026-09-15 11:00:00',
    unfulfilledReason: '客户临时异地出差无法履约',
    visitSubmitTime: '2026-09-16 09:35:00',
    visitContactStatus: '已触达',
    visitResult: '预约取消-待节后跟进',
    taskFollowVisitDesc: '客户取消本次预约，意向仍在，已标记国庆节后首日回访',
    driveVisitFollowStatus: '已办结'
  }
];

function openOpsTestDriveDetailModal(testDriveCode) {
  const item = opsTestDriveMockData.find(d => d.testDriveCode === testDriveCode) || opsTestDriveMockData[0];
  let modalEl = document.getElementById('opsTestDriveDetailModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'opsTestDriveDetailModal';
    modalEl.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.45); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(2px);';
    document.body.appendChild(modalEl);
  }
  
  modalEl.innerHTML = `
    <div style="background:#fff; width:940px; max-width:96vw; max-height:92vh; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); display:flex; flex-direction:column; overflow:hidden;">
      <header style="padding:16px 20px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; background:#eff6ff; color:#2563eb; font-weight:bold;">🚗</span>
          <h3 style="margin:0; font-size:16px; font-weight:700; color:#0f172a;">查看预约试驾详情 - ${item.testDriveCode}</h3>
          <span style="padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600; background:${item.driveStatus === '已履约' ? '#dcfce7' : item.driveStatus === '待履约' ? '#fef3c7' : '#fee2e2'}; color:${item.driveStatus === '已履约' ? '#166534' : item.driveStatus === '待履约' ? '#92400e' : '#991b1b'};">${item.driveStatus}</span>
        </div>
        <button type="button" style="border:none; background:none; font-size:20px; line-height:1; cursor:pointer; color:#64748b; padding:4px;" onclick="closeOpsTestDriveDetailModal()">✕</button>
      </header>

      <div style="padding:20px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:20px; font-size:13px; color:#334155;">
        <!-- 分组 1: 预约核心信息 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#2563eb; border-radius:2px; display:inline-block;"></span>
            试驾预约核心信息
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div><span style="color:#64748b;">预约试驾编码：</span><strong style="font-family:monospace; color:#2563eb;">${item.testDriveCode}</strong></div>
            <div><span style="color:#64748b;">人工任务编码：</span><span style="font-family:monospace;">${item.manualTaskCode}</span></div>
            <div><span style="color:#64748b;">培育线索编码：</span><span style="font-family:monospace;">${item.leadCode}</span></div>
            <div><span style="color:#64748b;">试驾排程编码：</span><span style="font-family:monospace; color:#7c3aed;">${item.scheduleCode}</span></div>
            <div><span style="color:#64748b;">预约单号：</span><strong style="font-family:monospace;">${item.bookingNo}</strong></div>
            <div><span style="color:#64748b;">试驾类型：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:#eff6ff; color:#1e40af;">${item.driveType}</span></div>
            <div><span style="color:#64748b;">客户姓名：</span><strong style="color:#0f172a;">${item.customerName}</strong></div>
            <div><span style="color:#64748b;">联系电话：</span><span style="font-family:monospace;">${item.phone}</span></div>
            <div><span style="color:#64748b;">试驾专营店：</span><strong style="color:#0f172a;">${item.driveStore}</strong></div>
            <div><span style="color:#64748b;">试驾车系：</span>${item.driveSeries}</div>
            <div><span style="color:#64748b;">试驾车辆：</span>${item.driveVehicle}</div>
            <div><span style="color:#64748b;">跟进顾问：</span>${item.followAdvisor}</div>
            <div><span style="color:#64748b;">预约试驾日期：</span><strong style="color:#2563eb;">${item.bookingDate}</strong></div>
            <div><span style="color:#64748b;">试驾时间段：</span>${item.driveTimeSlot}</div>
            <div><span style="color:#64748b;">试驾状态：</span>${item.driveStatus}</div>
          </div>
        </div>

        <!-- 分组 2: 排程与重排详情 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#7c3aed; border-radius:2px; display:inline-block;"></span>
            排程提交与重排详情
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div><span style="color:#64748b;">排程提交时间：</span>${item.scheduleSubmitTime}</div>
            <div><span style="color:#64748b;">试驾排程创建时间：</span>${item.scheduleCreateTime}</div>
            <div><span style="color:#64748b;">是否重排：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:${item.isRescheduled === '是' ? '#fef3c7' : '#f1f5f9'}; color:${item.isRescheduled === '是' ? '#92400e' : '#64748b'};">${item.isRescheduled}</span></div>
            <div><span style="color:#64748b;">重排日期：</span>${item.rescheduleDate}</div>
            <div><span style="color:#64748b;">重排时间段：</span>${item.rescheduleTimeSlot}</div>
            <div><span style="color:#64748b;">试驾状态更新时间：</span>${item.statusUpdateTime}</div>
            <div><span style="color:#64748b;">重排车系编码：</span>${item.rescheduleSeriesCode}</div>
            <div><span style="color:#64748b;">重排车系名称：</span>${item.rescheduleSeriesName}</div>
            <div><span style="color:#64748b;">最新留资车系：</span>${item.latestRetainedSeries}</div>
          </div>
        </div>

        <!-- 分组 3: 取消与异常分析 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#ea580c; border-radius:2px; display:inline-block;"></span>
            取消原因与履约异常
          </div>
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div><span style="color:#64748b;">取消原因：</span>${item.cancelReason}</div>
            <div><span style="color:#64748b;">取消标签：</span>${item.cancelTag}</div>
            <div><span style="color:#64748b;">是否逾期取消：</span>${item.isOverdueCancel}</div>
            <div><span style="color:#64748b;">未履约原因：</span>${item.unfulfilledReason}</div>
          </div>
        </div>

        <!-- 分组 4: 门店跟进与回访描述 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#059669; border-radius:2px; display:inline-block;"></span>
            门店跟进与回访记录
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div><span style="color:#64748b;">门店是否跟进：</span>${item.isStoreFollowed}</div>
            <div><span style="color:#64748b;">门店跟进时间：</span>${item.storeFollowTime}</div>
            <div><span style="color:#64748b;">门店跟进状态：</span>${item.storeFollowStatus}</div>
            <div style="grid-column:span 3;"><span style="color:#64748b;">门店回访描述：</span>${item.storeVisitDesc}</div>
            <div><span style="color:#64748b;">门店线索跟进总次数：</span>${item.storeFollowTotalCount}</div>
            <div><span style="color:#64748b;">当前线索最新状态：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:#f0fdf4; color:#15803d;">${item.currentLeadLatestStatus}</span></div>
            <div><span style="color:#64748b;">最新门店跟进时间：</span>${item.latestStoreFollowTime}</div>
            <div style="grid-column:span 3;"><span style="color:#64748b;">最新门店回访描述：</span>${item.latestStoreVisitDesc}</div>
          </div>
        </div>

        <!-- 分组 5: 总部电销与任务回访 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#0284c7; border-radius:2px; display:inline-block;"></span>
            总部电销与任务回访记录
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div><span style="color:#64748b;">接触状态：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:#dcfce7; color:#166534;">${item.contactStatus}</span></div>
            <div><span style="color:#64748b;">坐席账号：</span>${item.agentAccount}</div>
            <div><span style="color:#64748b;">总部是否跟进：</span>${item.isHqFollowed}</div>
            <div><span style="color:#64748b;">电销回访初始状态：</span>${item.teleInitialStatus}</div>
            <div><span style="color:#64748b;">电销任务激活时间：</span>${item.teleTaskActiveTime}</div>
            <div><span style="color:#64748b;">任务跟进时间：</span>${item.taskFollowTime}</div>
            <div style="grid-column:span 3;"><span style="color:#64748b;">试驾排程下发-回访描述：</span>${item.scheduleDispatchVisitDesc}</div>
            <div><span style="color:#64748b;">回访-提交时间：</span>${item.visitSubmitTime}</div>
            <div><span style="color:#64748b;">回访-接触状态：</span>${item.visitContactStatus}</div>
            <div><span style="color:#64748b;">回访结果：</span><strong style="color:#2563eb;">${item.visitResult}</strong></div>
            <div style="grid-column:span 3;"><span style="color:#64748b;">试驾任务跟进-回访描述：</span>${item.taskFollowVisitDesc}</div>
            <div><span style="color:#64748b;">试驾回访跟进状态：</span>${item.driveVisitFollowStatus}</div>
          </div>
        </div>
      </div>

      <footer style="padding:14px 20px; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:10px; background:#f8fafc;">
        <button type="button" style="height:32px; padding:0 16px; background:#fff; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; cursor:pointer;" onclick="closeOpsTestDriveDetailModal()">关闭</button>
        <button type="button" style="height:32px; padding:0 16px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer;" onclick="if(typeof showToast==='function') showToast('已成功复制预约试驾单号：' + '${item.testDriveCode}', true);">复制单号</button>
      </footer>
    </div>
  `;
  modalEl.style.display = 'flex';
}

function closeOpsTestDriveDetailModal() {
  const modalEl = document.getElementById('opsTestDriveDetailModal');
  if (modalEl) modalEl.style.display = 'none';
}

window.opsTestDriveMockData = opsTestDriveMockData;
window.openOpsTestDriveDetailModal = openOpsTestDriveDetailModal;
window.closeOpsTestDriveDetailModal = closeOpsTestDriveDetailModal;

/* ==================== 留资未满任务明细 Mock数据与详情弹窗 ==================== */
const opsInfoNotFullMockData = [
  {
    index: 1,
    taskCode: 'NF20260916001',
    leadCode: 'CLUE1883735730',
    channelR: 'R6-总部新媒体',
    customerName: '张敏捷',
    phone: '138****5678',
    intentSeries: '2026款探陆',
    latestIntentSeries: '2026款探陆 380T旗舰版',
    followStatus: '跟进中',
    followCount: 3,
    taskType: '人工外呼',
    initialLeadStatus: '待补全',
    initialIntentLevel: 'H',
    assignType: '首次分配',
    assignTime: '2026-09-16 08:30:00',
    assignAccount: 'HQ_AGENT_01',
    assignAccountName: '电销D组-张敏',
    assignRule: '留资未满兜底补全分配规则',
    latestVisitResult: '信息补全沟通中',
    latestContactStatus: '已接通',
    latestIntentLevel: 'H',
    latestLeadResultReason: '客户补充了常驻城市广州与置换旧车意向',
    planNextVisitTime: '2026-09-17 10:00',
    receiveTime: '2026-09-16 08:35:10',
    latestFollowTime: '2026-09-16 09:40:22',
    isOverdue: '否',
    overdueStatus: '正常时效',
    timelyFirstTouch: '达标(12min)',
    manualDispatch: '是',
    manualDispatchUpdateTime: '2026-09-16 09:50:00',
    noAnswerScene: '已振铃接听',
    pushPreCallStatus: '无需推送',
    testDriveSchedule: '已生成排程',
    initialLeadSource: '抖音信息流广告',
    leadSourcePlatform: '巨量引擎'
  },
  {
    index: 2,
    taskCode: 'NF20260916002',
    leadCode: 'CLUE1883735731',
    channelR: 'R2-垂媒引流',
    customerName: '李思媛',
    phone: '159****9999',
    intentSeries: 'N6',
    latestIntentSeries: 'N6 550km智驾版',
    followStatus: '已完成',
    followCount: 5,
    taskType: '人工外呼',
    initialLeadStatus: '待补全',
    initialIntentLevel: 'A',
    assignType: '首次分配',
    assignTime: '2026-09-16 09:15:00',
    assignAccount: 'HQ_AGENT_02',
    assignAccountName: '电销A组-李雷',
    assignRule: '纯电专属培育分配规则',
    latestVisitResult: '补全成功并邀约试驾',
    latestContactStatus: '已接通',
    latestIntentLevel: 'H',
    latestLeadResultReason: '补全了联系人真名及意向专营店浦东店',
    planNextVisitTime: '2026-09-18 14:30',
    receiveTime: '2026-09-16 09:20:00',
    latestFollowTime: '2026-09-16 10:05:40',
    isOverdue: '否',
    overdueStatus: '正常时效',
    timelyFirstTouch: '达标(8min)',
    manualDispatch: '是',
    manualDispatchUpdateTime: '2026-09-16 10:15:00',
    noAnswerScene: '已振铃接听',
    pushPreCallStatus: '已推送',
    testDriveSchedule: '已生成排程',
    initialLeadSource: '汽车之家车系页',
    leadSourcePlatform: '汽车之家'
  },
  {
    index: 3,
    taskCode: 'NF20260916003',
    leadCode: 'CLUE1883735732',
    channelR: 'R1-官网预约',
    customerName: '王建国',
    phone: '186****6666',
    intentSeries: 'N7',
    latestIntentSeries: 'N7 620km激光雷达版',
    followStatus: '待跟进',
    followCount: 1,
    taskType: '人工外呼',
    initialLeadStatus: '待分配',
    initialIntentLevel: 'B',
    assignType: '重新分配',
    assignTime: '2026-09-16 10:40:00',
    assignAccount: 'HQ_AGENT_03',
    assignAccountName: '电销B组-王五',
    assignRule: '座席空闲轮询规则',
    latestVisitResult: '未接通-待重呼',
    latestContactStatus: '无人接听',
    latestIntentLevel: 'B',
    latestLeadResultReason: '首次致电响铃超时，缺少购车预算与分期偏好',
    planNextVisitTime: '2026-09-16 15:30',
    receiveTime: '2026-09-16 10:42:15',
    latestFollowTime: '2026-09-16 11:10:00',
    isOverdue: '否',
    overdueStatus: '正常时效',
    timelyFirstTouch: '达标(18min)',
    manualDispatch: '否',
    manualDispatchUpdateTime: '-',
    noAnswerScene: '连续响铃超时30秒',
    pushPreCallStatus: '待推送',
    testDriveSchedule: '未生成',
    initialLeadSource: '东风日产官网移动端',
    leadSourcePlatform: '官方微信小程序'
  },
  {
    index: 4,
    taskCode: 'NF20260916004',
    leadCode: 'CLUE1883735733',
    channelR: 'R3-车展留资',
    customerName: '赵海峰',
    phone: '135****5555',
    intentSeries: 'NX8',
    latestIntentSeries: 'NX8 旗舰四驱版',
    followStatus: '已完成',
    followCount: 4,
    taskType: '人工外呼',
    initialLeadStatus: '培育中',
    initialIntentLevel: 'H',
    assignType: '首次分配',
    assignTime: '2026-09-16 11:20:00',
    assignAccount: 'HQ_AGENT_04',
    assignAccountName: '电销C组-赵六',
    assignRule: '展会留资高优规则',
    latestVisitResult: '补全成功-流转门店',
    latestContactStatus: '已接通',
    latestIntentLevel: 'H',
    latestLeadResultReason: '已补齐意向专营店深圳福田店与提车时间要求',
    planNextVisitTime: '2026-09-17 11:00',
    receiveTime: '2026-09-16 11:22:00',
    latestFollowTime: '2026-09-16 11:45:10',
    isOverdue: '否',
    overdueStatus: '正常时效',
    timelyFirstTouch: '达标(5min)',
    manualDispatch: '是',
    manualDispatchUpdateTime: '2026-09-16 11:50:00',
    noAnswerScene: '已振铃接听',
    pushPreCallStatus: '无需推送',
    testDriveSchedule: '已生成排程',
    initialLeadSource: '车展现场二维码互动',
    leadSourcePlatform: '车展现场物料'
  },
  {
    index: 5,
    taskCode: 'NF20260916005',
    leadCode: 'CLUE1883735734',
    channelR: 'R6-总部新媒体',
    customerName: '陈雅莉',
    phone: '139****2222',
    intentSeries: '轩逸',
    latestIntentSeries: '轩逸 超混电驱 双擎版',
    followStatus: '跟进中',
    followCount: 2,
    taskType: '人工外呼',
    initialLeadStatus: '待补全',
    initialIntentLevel: 'C',
    assignType: '首次分配',
    assignTime: '2026-09-16 14:10:00',
    assignAccount: 'HQ_AGENT_01',
    assignAccountName: '电销D组-张敏',
    assignRule: '留资未满兜底补全分配规则',
    latestVisitResult: '信息核对中',
    latestContactStatus: '已接通',
    latestIntentLevel: 'B',
    latestLeadResultReason: '用户表示在开会，只补全了省市，预算需二次联系',
    planNextVisitTime: '2026-09-16 17:30',
    receiveTime: '2026-09-16 14:12:00',
    latestFollowTime: '2026-09-16 14:35:18',
    isOverdue: '否',
    overdueStatus: '正常时效',
    timelyFirstTouch: '达标(15min)',
    manualDispatch: '否',
    manualDispatchUpdateTime: '-',
    noAnswerScene: '已振铃接听',
    pushPreCallStatus: '待推送',
    testDriveSchedule: '未生成',
    initialLeadSource: '微信视频号直播间',
    leadSourcePlatform: '腾讯微信生态'
  }
];

function openOpsInfoNotFullDetailModal(taskCode) {
  const item = opsInfoNotFullMockData.find(d => d.taskCode === taskCode) || opsInfoNotFullMockData[0];
  let modalEl = document.getElementById('opsInfoNotFullDetailModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'opsInfoNotFullDetailModal';
    modalEl.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.45); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(2px);';
    document.body.appendChild(modalEl);
  }

  modalEl.innerHTML = `
    <div style="background:#fff; width:960px; max-width:96vw; max-height:92vh; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); display:flex; flex-direction:column; overflow:hidden;">
      <header style="padding:16px 20px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; background:#fef3c7; color:#d97706; font-weight:bold;">📋</span>
          <h3 style="margin:0; font-size:16px; font-weight:700; color:#0f172a;">留资未满任务详情 - ${item.taskCode}</h3>
          <span style="padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600; background:${item.followStatus === '已完成' ? '#dcfce7' : item.followStatus === '跟进中' ? '#e0f2fe' : '#fef3c7'}; color:${item.followStatus === '已完成' ? '#166534' : item.followStatus === '跟进中' ? '#0369a1' : '#92400e'};">${item.followStatus}</span>
          <span style="padding:2px 6px; border-radius:4px; font-size:12px; font-weight:700; background:#fee2e2; color:#991b1b;">意向${item.latestIntentLevel}级</span>
        </div>
        <button type="button" style="border:none; background:none; font-size:20px; line-height:1; cursor:pointer; color:#64748b; padding:4px;" onclick="closeOpsInfoNotFullDetailModal()">✕</button>
      </header>

      <div style="padding:20px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:20px; font-size:13px; color:#334155;">
        <!-- 分组 1: 任务与线索核心信息 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#2563eb; border-radius:2px; display:inline-block;"></span>
            任务与线索核心信息
          </div>
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div><span style="color:#64748b;">任务编码：</span><strong style="font-family:monospace; color:#2563eb;">${item.taskCode}</strong></div>
            <div><span style="color:#64748b;">线索编码：</span><span style="font-family:monospace; color:#475569;">${item.leadCode}</span></div>
            <div><span style="color:#64748b;">线索R渠道：</span>${item.channelR}</div>
            <div><span style="color:#64748b;">任务类型：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:#eff6ff; color:#1e40af;">${item.taskType}</span></div>
            <div><span style="color:#64748b;">客户姓名：</span><strong style="color:#0f172a;">${item.customerName}</strong></div>
            <div><span style="color:#64748b;">联系电话：</span><span style="font-family:monospace;">${item.phone}</span></div>
            <div><span style="color:#64748b;">意向车系：</span>${item.intentSeries}</div>
            <div><span style="color:#64748b;">最新意向车系：</span><strong style="color:#0284c7;">${item.latestIntentSeries}</strong></div>
            <div><span style="color:#64748b;">初始线索状态：</span>${item.initialLeadStatus}</div>
            <div><span style="color:#64748b;">初始意向级别：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; font-weight:700; background:#fef3c7; color:#92400e;">${item.initialIntentLevel}级</span></div>
            <div><span style="color:#64748b;">跟进次数：</span><strong style="color:#0f172a;">${item.followCount} 次</strong></div>
            <div><span style="color:#64748b;">跟进状态：</span>${item.followStatus}</div>
          </div>
        </div>

        <!-- 分组 2: 分配与流转属性 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#7c3aed; border-radius:2px; display:inline-block;"></span>
            分配流转与规则配置
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div><span style="color:#64748b;">分配类型：</span>${item.assignType}</div>
            <div><span style="color:#64748b;">分配时间：</span>${item.assignTime}</div>
            <div><span style="color:#64748b;">分配规则：</span><span style="color:#4f46e5; font-weight:500;">${item.assignRule}</span></div>
            <div><span style="color:#64748b;">分配账号：</span><span style="font-family:monospace;">${item.assignAccount}</span></div>
            <div><span style="color:#64748b;">分配账号名称：</span><strong style="color:#0f172a;">${item.assignAccountName}</strong></div>
            <div><span style="color:#64748b;">接收时间：</span>${item.receiveTime}</div>
          </div>
        </div>

        <!-- 分组 3: 回访、接触与意向判定 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#059669; border-radius:2px; display:inline-block;"></span>
            回访沟通与线索转化记录
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div><span style="color:#64748b;">最新回访结果：</span><strong style="color:#2563eb;">${item.latestVisitResult}</strong></div>
            <div><span style="color:#64748b;">最新接触状态：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:${item.latestContactStatus === '已接通' ? '#dcfce7' : '#fee2e2'}; color:${item.latestContactStatus === '已接通' ? '#166534' : '#991b1b'};">${item.latestContactStatus}</span></div>
            <div><span style="color:#64748b;">最新意向级别：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; font-weight:700; background:#fee2e2; color:#991b1b;">${item.latestIntentLevel}级</span></div>
            <div style="grid-column:span 3;"><span style="color:#64748b;">最新线索结果原因：</span><strong style="color:#0f172a;">${item.latestLeadResultReason}</strong></div>
            <div><span style="color:#64748b;">计划下次回访时间：</span><strong style="color:#2563eb;">${item.planNextVisitTime}</strong></div>
            <div><span style="color:#64748b;">最新跟进时间：</span>${item.latestFollowTime}</div>
            <div><span style="color:#64748b;">试驾排程：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:${item.testDriveSchedule === '已生成排程' ? '#ecfdf5' : '#f1f5f9'}; color:${item.testDriveSchedule === '已生成排程' ? '#047857' : '#64748b'};">${item.testDriveSchedule}</span></div>
          </div>
        </div>

        <!-- 分组 4: 履约、逾期与首触监控 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#ea580c; border-radius:2px; display:inline-block;"></span>
            时效监控、首触与无人接通场景
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div><span style="color:#64748b;">是否逾期：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:${item.isOverdue === '是' ? '#fee2e2' : '#f1f5f9'}; color:${item.isOverdue === '是' ? '#991b1b' : '#64748b'};">${item.isOverdue}</span></div>
            <div><span style="color:#64748b;">超期状态：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:${item.overdueStatus === '正常时效' ? '#f0fdf4' : '#fef2f2'}; color:${item.overdueStatus === '正常时效' ? '#15803d' : '#b91c1c'};">${item.overdueStatus}</span></div>
            <div><span style="color:#64748b;">及时首触：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:${item.timelyFirstTouch.includes('达标') ? '#dcfce7' : '#fee2e2'}; color:${item.timelyFirstTouch.includes('达标') ? '#166534' : '#991b1b'};">${item.timelyFirstTouch}</span></div>
            <div><span style="color:#64748b;">人工手动下发：</span>${item.manualDispatch}</div>
            <div><span style="color:#64748b;">人工手动下发更新时间：</span>${item.manualDispatchUpdateTime}</div>
            <div><span style="color:#64748b;">人工外呼无人接通场景：</span>${item.noAnswerScene}</div>
          </div>
        </div>

        <!-- 分组 5: 渠道归因与外呼联动 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#0284c7; border-radius:2px; display:inline-block;"></span>
            来源归因与预外呼协同
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div><span style="color:#64748b;">推送到预外呼状态：</span><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:${item.pushPreCallStatus === '已推送' ? '#eff6ff' : '#f8fafc'}; color:${item.pushPreCallStatus === '已推送' ? '#1d4ed8' : '#64748b'};">${item.pushPreCallStatus}</span></div>
            <div><span style="color:#64748b;">初始线索来源：</span>${item.initialLeadSource}</div>
            <div><span style="color:#64748b;">线索来源平台：</span><strong style="color:#0f172a;">${item.leadSourcePlatform}</strong></div>
          </div>
        </div>
      </div>

      <footer style="padding:14px 20px; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:10px; background:#f8fafc;">
        <button type="button" style="height:32px; padding:0 16px; background:#fff; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; cursor:pointer;" onclick="closeOpsInfoNotFullDetailModal()">关闭</button>
        <button type="button" style="height:32px; padding:0 16px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer;" onclick="if(typeof showToast==='function') showToast('已成功复制留资未满任务单号：' + '${item.taskCode}', true);">复制单号</button>
      </footer>
    </div>
  `;
  modalEl.style.display = 'flex';
}

function closeOpsInfoNotFullDetailModal() {
  const modalEl = document.getElementById('opsInfoNotFullDetailModal');
  if (modalEl) modalEl.style.display = 'none';
}

window.opsInfoNotFullMockData = opsInfoNotFullMockData;
window.openOpsInfoNotFullDetailModal = openOpsInfoNotFullDetailModal;
window.closeOpsInfoNotFullDetailModal = closeOpsInfoNotFullDetailModal;

/* ==================== 短信记录 Mock数据与详情弹窗 ==================== */
const opsMessageRecordMockData = [
  {
    index: 1,
    msgId: 'MSG20260916001',
    phone: '138****5678',
    taskCode: 'TASK20260916001',
    templateName: '预约到店试驾确认模板',
    content: '【东风日产】尊敬的张敏捷先生，您预约的2026款探陆试驾已排程成功，时间：本周六 10:00，地点：广州天河专营店（天河区黄埔大道西668号），顾问李强将为您接待，详询020-88886666。如需调整时间可直接回复本短信。退订回T',
    sendStatus: '发送成功',
    createTime: '2026-09-16 09:30:15',
    sendTime: '2026-09-16 09:30:18',
    agentAccount: '电销D组-张敏 (HQ_AGENT_01)',
    replyContent: '好的，已收到，周六上午10点准时到店试驾。',
    replyTime: '2026-09-16 09:42:08'
  },
  {
    index: 2,
    msgId: 'MSG20260916002',
    phone: '159****9999',
    taskCode: 'TASK20260916002',
    templateName: '试驾邀约关怀模板',
    content: '【东风日产】尊敬的李思媛女士，诚邀您体验N6 550km智驾版，尊享首任车主三电终身质保及专属到店体验礼一份。点击链接快速预约您的专属试驾时段：nissan.cn/t/N6Drive。退订回T',
    sendStatus: '发送成功',
    createTime: '2026-09-16 10:15:02',
    sendTime: '2026-09-16 10:15:05',
    agentAccount: '电销A组-李雷 (HQ_AGENT_02)',
    replyContent: '能安排周末下午上门试驾吗？我们在张江高科附近。',
    replyTime: '2026-09-16 10:28:40'
  },
  {
    index: 3,
    msgId: 'MSG20260916003',
    phone: '186****6666',
    taskCode: 'TASK20260916003',
    templateName: '未接通关怀短信模板',
    content: '【东风日产】尊敬的王建国先生，刚才总部客服致电为您解答N7车型权益，未能与您取得联系。我们稍后将再次致电，您也可直接回复方便接听电话的时间段。感谢您的关注！退订回T',
    sendStatus: '发送成功',
    createTime: '2026-09-16 11:00:20',
    sendTime: '2026-09-16 11:00:23',
    agentAccount: '电销B组-王五 (HQ_AGENT_03)',
    replyContent: '刚才在开会，下午三点半之后再打过来吧。',
    replyTime: '2026-09-16 11:15:30'
  },
  {
    index: 4,
    msgId: 'MSG20260916004',
    phone: '135****5555',
    taskCode: 'TASK20260916004',
    templateName: '置换补贴专项优惠模板',
    content: '【东风日产】尊敬的赵海峰先生，您关注的全新NX8尊享至高12000元国家及厂家置换双重补贴，本月订车额外赠送全车隔热防爆膜及3年免费保养。点击查阅置换评估方案：nissan.cn/t/NX8Subsidy。退订回T',
    sendStatus: '发送失败',
    createTime: '2026-09-16 13:20:00',
    sendTime: '2026-09-16 13:20:05',
    agentAccount: '电销C组-赵六 (HQ_AGENT_04)',
    replyContent: '-',
    replyTime: '-'
  },
  {
    index: 5,
    msgId: 'MSG20260916005',
    phone: '139****2222',
    taskCode: 'TASK20260916005',
    templateName: '试驾满意度回访模板',
    content: '【东风日产】尊敬的陈雅莉女士，感谢您体验全新轩逸超混电驱车型。为了给您提供更好的服务，诚邀您对本次试驾顾问的服务进行评价：满意请回复1，一般请回复2，不满意请回复3。祝您生活愉快！退订回T',
    sendStatus: '发送成功',
    createTime: '2026-09-16 14:45:10',
    sendTime: '2026-09-16 14:45:13',
    agentAccount: '电销D组-张敏 (HQ_AGENT_01)',
    replyContent: '1，顾问讲解很细致专业，体验不错！',
    replyTime: '2026-09-16 14:52:19'
  }
];

function openOpsMessageRecordDetailModal(msgId) {
  const item = opsMessageRecordMockData.find(d => d.msgId === msgId) || opsMessageRecordMockData[0];
  let modalEl = document.getElementById('opsMessageRecordDetailModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'opsMessageRecordDetailModal';
    modalEl.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(15,23,42,0.45); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(2px);';
    document.body.appendChild(modalEl);
  }

  modalEl.innerHTML = `
    <div style="background:#fff; width:820px; max-width:96vw; max-height:90vh; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); display:flex; flex-direction:column; overflow:hidden;">
      <header style="padding:16px 20px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; background:#eff6ff; color:#2563eb; font-weight:bold;">✉️</span>
          <h3 style="margin:0; font-size:16px; font-weight:700; color:#0f172a;">短信发送详情 - ${item.msgId}</h3>
          <span style="padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600; background:${item.sendStatus === '发送成功' ? '#dcfce7' : item.sendStatus === '发送中' ? '#e0f2fe' : '#fee2e2'}; color:${item.sendStatus === '发送成功' ? '#166534' : item.sendStatus === '发送中' ? '#0369a1' : '#991b1b'};">${item.sendStatus}</span>
        </div>
        <button type="button" style="border:none; background:none; font-size:20px; line-height:1; cursor:pointer; color:#64748b; padding:4px;" onclick="closeOpsMessageRecordDetailModal()">✕</button>
      </header>

      <div style="padding:20px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:18px; font-size:13px; color:#334155;">
        <!-- 分组 1: 基本发送信息 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#2563eb; border-radius:2px; display:inline-block;"></span>
            基本发送信息
          </div>
          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div><span style="color:#64748b;">发送手机：</span><strong style="font-family:monospace; color:#0f172a; font-size:14px;">${item.phone}</strong></div>
            <div><span style="color:#64748b;">任务编码：</span><strong style="font-family:monospace; color:#2563eb;">${item.taskCode}</strong></div>
            <div><span style="color:#64748b;">发送坐席账号：</span><span style="font-weight:500;">${item.agentAccount}</span></div>
            <div><span style="color:#64748b;">引用模版名称：</span><strong style="color:#4f46e5;">${item.templateName}</strong></div>
          </div>
        </div>

        <!-- 分组 2: 模版与短信内容详情 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#7c3aed; border-radius:2px; display:inline-block;"></span>
            短信正文内容
          </div>
          <div style="background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0; line-height:1.6; color:#1e293b;">
            ${item.content}
            <div style="margin-top:10px; font-size:11px; color:#94a3b8; display:flex; justify-content:space-between; border-top:1px dashed #e2e8f0; padding-top:8px;">
              <span>计费计费条数：1 条（长度：${item.content.length} 字符）</span>
              <span>通道类型：东风日产官方验证/通知通道 (1069)</span>
            </div>
          </div>
        </div>

        <!-- 分组 3: 发送时效与运营商状态 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#059669; border-radius:2px; display:inline-block;"></span>
            发送时效与运营商回执
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div><span style="color:#64748b;">创建时间：</span>${item.createTime}</div>
            <div><span style="color:#64748b;">发送时间：</span><strong style="color:#0f172a;">${item.sendTime}</strong></div>
            <div><span style="color:#64748b;">网关回执：</span><span style="font-family:monospace; color:${item.sendStatus === '发送成功' ? '#166534' : '#991b1b'};">${item.sendStatus === '发送成功' ? 'DELIVRD (手机终端成功接收)' : 'UNDELIV (用户关机/信号中断)'}</span></div>
          </div>
        </div>

        <!-- 分组 4: 客户互动与回复记录 -->
        <div>
          <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
            <span style="width:3px; height:14px; background:#ea580c; border-radius:2px; display:inline-block;"></span>
            客户回复内容与互动时间
          </div>
          <div style="background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:12px;">
              <span style="color:#64748b;">回复时间：<strong style="color:#2563eb; font-family:monospace;">${item.replyTime}</strong></span>
              <span style="padding:2px 8px; border-radius:4px; font-size:11px; background:${item.replyContent === '-' ? '#f1f5f9' : '#ecfdf5'}; color:${item.replyContent === '-' ? '#64748b' : '#047857'}; font-weight:600;">${item.replyContent === '-' ? '未回复' : '已收到回复'}</span>
            </div>
            <div style="font-size:13px; font-weight:${item.replyContent === '-' ? 'normal' : '500'}; color:${item.replyContent === '-' ? '#94a3b8' : '#047857'}; background:#fff; padding:10px 12px; border-radius:6px; border:1px solid #e2e8f0;">
              ${item.replyContent === '-' ? '暂无客户上行回复内容' : item.replyContent}
            </div>
          </div>
        </div>
      </div>

      <footer style="padding:14px 20px; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:10px; background:#f8fafc;">
        <button type="button" style="height:32px; padding:0 16px; background:#fff; border:1px solid #d9d9d9; border-radius:4px; font-size:13px; cursor:pointer;" onclick="closeOpsMessageRecordDetailModal()">关闭</button>
        <button type="button" style="height:32px; padding:0 16px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; cursor:pointer;" onclick="if(typeof showToast==='function') showToast('已成功复制短信内容！', true);">复制短信内容</button>
      </footer>
    </div>
  `;
  modalEl.style.display = 'flex';
}

function closeOpsMessageRecordDetailModal() {
  const modalEl = document.getElementById('opsMessageRecordDetailModal');
  if (modalEl) modalEl.style.display = 'none';
}

window.opsMessageRecordMockData = opsMessageRecordMockData;
window.openOpsMessageRecordDetailModal = openOpsMessageRecordDetailModal;
window.closeOpsMessageRecordDetailModal = closeOpsMessageRecordDetailModal;
