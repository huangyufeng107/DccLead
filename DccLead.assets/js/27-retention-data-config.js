/* ==========================================================================
   滞留数据配置 (原【统计报表-总部培育报表-AI外呼重拨看板】迁移至【培育策略-AI外呼配置】)
   视觉与交互重构：将【数据看板】与【规则配置】严格拆分为两个独立的专业业务版块
   ========================================================================== */

let retentionMockData = [
  { id: 1, cbCode: 'CB20260916001', leadId: 'PYXS202605280001', name: '王先生', phone: '18677776666', round: '第 2 轮', nextTime: '2026-09-16 16:30', rule: '并发滞留重拨', status: '待重拨' },
  { id: 2, cbCode: 'CB20260916002', leadId: 'PYXS202605270093', name: '陈女士', phone: '13911112222', round: '第 1 轮', nextTime: '2026-09-16 17:00', rule: '重推任务重拨', status: '重拨中' },
  { id: 3, cbCode: 'CB20260916003', leadId: 'PYXS202605260045', name: '刘先生', phone: '18911118888', round: '第 3 轮', nextTime: '2026-09-16 17:30', rule: '超出外呼时间重拨', status: '待重拨' },
  { id: 4, cbCode: 'CB20260916004', leadId: 'PYXS202605250118', name: '孙女士', phone: '13722229999', round: '第 2 轮', nextTime: '2026-09-17 09:30', rule: '并发滞留重拨', status: '待重拨' },
  { id: 5, cbCode: 'CB20260916005', leadId: 'PYXS202605240076', name: '周先生', phone: '13633330000', round: '第 3 轮', nextTime: '2026-09-16 15:45', rule: '重推任务重拨', status: '重拨中' }
];

let retentionActiveDays = [1, 2, 3, 4, 5]; // 默认周一至周五
let retentionTimeSlots = [
  { id: 1, start: '09:00', end: '12:00', isEditing: false },
  { id: 2, start: '14:00', end: '18:00', isEditing: false }
];
let isRetentionSettingEditing = false;
let isRetentionEmailEditing = false;

function renderRetentionDataConfigSummary() {
  return `
    <div class="summary-strip">
      <div class="summary-card">
        <div class="summary-label">重拨任务总数</div>
        <div class="summary-value" id="retentionTotalSummary">1,286</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">已重拨数量</div>
        <div class="summary-value" style="color:#2563eb" id="retentionDialedSummary">1,042</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">重拨接通率</div>
        <div class="summary-value" style="color:#10b981" id="retentionRateSummary">61.4%</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">待重拨滞留</div>
        <div class="summary-value" style="color:#f59e0b" id="retentionPendingSummary">244</div>
      </div>
    </div>
  `;
}

function renderRetentionDataConfigPage() {
  const page = document.getElementById('retentionDataConfigPage');
  if (!page) return;

  page.innerHTML = `
    <style>
      /* 滞留数据配置 - 视觉样式 */
      .retention-section-card {
        background: #fff;
        border-radius: 8px;
        padding: 20px 24px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        margin-bottom: 20px;
      }
      .retention-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 14px;
        border-bottom: 1px solid #f1f5f9;
        margin-bottom: 16px;
      }
      .retention-section-title-box {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .retention-section-tag {
        font-size: 12px;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: 4px;
      }
      .retention-section-tag.blue {
        background: #eff6ff;
        color: #1d4ed8;
        border: 1px solid #dbeafe;
      }
      .retention-section-tag.purple {
        background: #faf5ff;
        color: #7e22ce;
        border: 1px solid #f3e8ff;
      }
      .retention-section-tag.emerald {
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #d1fae5;
      }

      /* 范围选择器 */
      .retention-range-picker {
        display: inline-flex;
        align-items: center;
        height: 32px;
        padding: 0 10px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        background: #fff;
        transition: all 0.2s ease-in-out;
        box-sizing: border-box;
      }
      .retention-range-picker:hover {
        border-color: #4096ff;
      }
      .retention-range-picker:focus-within {
        border-color: #1677ff;
        box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.15);
      }
      .retention-range-picker input[type="date"] {
        width: 100px !important;
        height: 28px !important;
        line-height: 28px !important;
        border: none !important;
        outline: none !important;
        background: transparent !important;
        box-shadow: none !important;
        font-size: 13px !important;
        color: #1e293b !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
        padding: 0 !important;
        margin: 0 !important;
        cursor: pointer !important;
        text-align: center !important;
        -webkit-appearance: none !important;
      }
      .retention-range-picker input[type="date"]::-webkit-calendar-picker-indicator {
        display: none !important;
        -webkit-appearance: none !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
      }
      .retention-range-picker input[type="date"]::-webkit-inner-spin-button {
        display: none !important;
        -webkit-appearance: none !important;
      }
      .retention-range-separator {
        color: #8c8c8c;
        font-size: 13px;
        padding: 0 6px;
        user-select: none;
      }
      .retention-calendar-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #8c8c8c;
        margin-left: 6px;
        cursor: pointer;
        transition: color 0.2s;
      }
      .retention-calendar-icon:hover {
        color: #1677ff;
      }

      /* 统一表单控件 */
      .retention-filter-input {
        height: 32px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 13px;
        color: #1e293b;
        outline: none;
        transition: all 0.2s;
        box-sizing: border-box;
      }
      .retention-filter-input:hover { border-color: #4096ff; }
      .retention-filter-input:focus {
        border-color: #1677ff;
        box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.15);
      }
      .retention-filter-select {
        height: 32px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 13px;
        color: #1e293b;
        outline: none;
        background-color: #fff;
        transition: all 0.2s;
        box-sizing: border-box;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238c8c8c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: calc(100% - 8px) center;
        padding: 0 26px 0 10px;
      }
      .retention-filter-select:hover { border-color: #4096ff; }
      .retention-filter-select:focus {
        border-color: #1677ff;
        box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.15);
      }

      /* 快捷日期胶囊 */
      .btn-retention-range {
        height: 32px;
        padding: 0 14px;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        background: #fff;
        border: 1px solid #d9d9d9;
        color: #334155;
      }
      .btn-retention-range:hover:not(.active) {
        color: #0052cc;
        border-color: #0052cc;
      }
      .btn-retention-range.active {
        background: #0052cc;
        border-color: #0052cc;
        color: #fff;
        font-weight: 500;
      }

      /* 实体填充色主操作按钮（完全对齐截图深蓝交互风格，悬停加深为 #003595） */
      .btn-retention-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        padding: 0 20px;
        background: #004ac6;
        border: 1px solid #004ac6;
        color: #fff;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        user-select: none;
        white-space: nowrap;
      }
      .btn-retention-primary:hover {
        background: #003595;
        border-color: #003595;
        color: #fff;
      }
      .btn-retention-primary:active {
        background: #002566;
        border-color: #002566;
      }

      /* 白底灰边框实体次级按钮（完全对齐全局系统的默认与悬停效果） */
      .btn-retention-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        padding: 0 16px;
        background: #ffffff;
        border: 1px solid #c3c6d6;
        color: #434654;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
        user-select: none;
        white-space: nowrap;
      }
      .btn-retention-secondary:hover {
        background: #f3f3fd;
        border-color: #737685;
        color: #191b23;
      }
      .btn-retention-secondary:active {
        background: #ededf8;
        border-color: #545f73;
        color: #191b23;
      }

      /* 星期选择胶囊 */
      .retention-day-capsule {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 5px 14px;
        border-radius: 4px;
        font-size: 13px;
        cursor: default;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        color: #64748b;
        transition: all 0.2s;
        user-select: none;
      }
      .retention-day-capsule.active {
        background: #eff6ff;
        border-color: #93c5fd;
        color: #1d4ed8;
        font-weight: 600;
      }
      .retention-day-capsule.editable {
        cursor: pointer;
      }
      .retention-day-capsule.editable:hover {
        border-color: #3b82f6;
      }

      /* 时段设置行与控件（完全匹配用户设计原型与平台规范） */
      .retention-slot-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .retention-slot-label {
        font-size: 13px;
        font-weight: 500;
        color: #1e293b;
        width: 46px;
        flex-shrink: 0;
        line-height: 32px;
      }
      .retention-time-box {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        padding: 0 10px;
        height: 32px;
        box-sizing: border-box;
        transition: all 0.2s;
        cursor: pointer;
      }
      .retention-time-box.readonly {
        background: #f8fafc;
        border-color: #e2e8f0;
        cursor: default;
      }
      .retention-time-box:not(.readonly):hover {
        border-color: #004ac6;
      }
      .retention-time-box:not(.readonly):focus-within {
        border-color: #004ac6;
        box-shadow: 0 0 0 2px rgba(0, 74, 198, 0.15);
      }

      /* 针对 input[type="time"] 的强覆盖，消除外部通用样式造成的双重边框与背景色干扰 */
      .retention-slot-row input[type="time"].retention-time-input,
      .retention-time-box input[type="time"] {
        min-height: unset !important;
        height: 28px !important;
        line-height: 28px !important;
        border: none !important;
        border-radius: 0 !important;
        background: transparent !important;
        background-color: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        outline: none !important;
        font-size: 13px !important;
        color: #1e293b !important;
        width: 62px !important;
        font-family: inherit !important;
        text-align: center !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        cursor: pointer !important;
      }
      .retention-slot-row input[type="time"].retention-time-input::-webkit-calendar-picker-indicator,
      .retention-time-box input[type="time"]::-webkit-calendar-picker-indicator {
        display: none !important;
        -webkit-appearance: none !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .retention-slot-row input[type="time"].retention-time-input::-webkit-inner-spin-button,
      .retention-slot-row input[type="time"].retention-time-input::-webkit-clear-button {
        display: none !important;
        -webkit-appearance: none !important;
      }
      .retention-slot-row input[type="time"].retention-time-input:focus,
      .retention-time-box input[type="time"]:focus {
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
        background-color: transparent !important;
      }
      .retention-slot-row input[type="time"].retention-time-input:disabled,
      .retention-time-box input[type="time"]:disabled {
        color: #475569 !important;
        cursor: default !important;
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        opacity: 1 !important;
      }

      .retention-slot-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .btn-slot-save {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        padding: 0 16px;
        background: #004ac6;
        border: 1px solid #004ac6;
        color: #fff;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        outline: none;
      }
      .btn-slot-save:hover {
        background: #003595;
        border-color: #003595;
      }
      .btn-slot-save:active {
        background: #002566;
        border-color: #002566;
      }
      .btn-slot-edit {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        padding: 0 16px;
        background: #004ac6;
        border: 1px solid #004ac6;
        color: #fff;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        outline: none;
      }
      .btn-slot-edit:hover {
        background: #003595;
        border-color: #003595;
      }
      .btn-slot-edit:active {
        background: #002566;
        border-color: #002566;
      }
      .btn-slot-delete {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        padding: 0 16px;
        background: #ffffff;
        border: 1px solid #c3c6d6;
        color: #434654;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        outline: none;
      }
      .btn-slot-delete:hover {
        background: #f3f3fd;
        border-color: #737685;
        color: #191b23;
      }
      .btn-slot-delete:active {
        background: #ededf8;
        border-color: #545f73;
        color: #191b23;
      }
      .btn-slot-delete:disabled {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
        color: #cbd5e1 !important;
        cursor: not-allowed !important;
      }
      .btn-slot-add {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        padding: 0 16px;
        background: #004ac6;
        border: 1px solid #004ac6;
        color: #fff;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        outline: none;
      }
      .btn-slot-add:hover {
        background: #003595;
        border-color: #003595;
      }
      .btn-slot-add:active {
        background: #002566;
        border-color: #002566;
      }
      .btn-slot-add:disabled {
        background: #f1f5f9 !important;
        border-color: #e2e8f0 !important;
        color: #94a3b8 !important;
        cursor: not-allowed !important;
        box-shadow: none !important;
      }
    </style>

    <div class="page-hero">
      <div>
        <div class="page-title">滞留数据配置</div>
        <div class="page-desc">配置滞留线索与AI外呼重拨策略、派发时段及日报邮件推送对象，实时监控滞留数据重拨执行与接通转化看板。</div>
      </div>
    </div>

    <!-- ==================== 版块一：数据看板（筛选查询 + 核心指标卡片） ==================== -->
    <section class="retention-section-card" aria-label="数据看板版块">
      <div class="retention-section-header">
        <div class="retention-section-title-box">
          <div style="width:4px; height:16px; background:#1677ff; border-radius:2px;"></div>
          <h3 style="margin:0; font-size:15px; font-weight:700; color:#0f172a;">数据看板 · 重拨监控</h3>
          <span class="retention-section-tag blue">统计透视</span>
        </div>
        <div style="font-size:12px; color:#64748b;">
          数据刷新时间：<span style="font-family:monospace; color:#334155;">2026-09-17 10:30</span>
        </div>
      </div>

      <!-- 筛选查询工具栏 -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; padding-bottom:16px; border-bottom:1px solid #f8fafc;">
        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          <!-- 快捷日期选择胶囊 -->
          <div style="display:flex; gap:6px; align-items:center;">
            <button type="button" id="btnRetentionYesterday" class="btn-retention-range" onclick="selectRetentionDateRange(1, this)">昨天</button>
            <button type="button" id="btnRetentionLast7" class="btn-retention-range active" onclick="selectRetentionDateRange(7, this)">前7天</button>
            <button type="button" id="btnRetentionLast30" class="btn-retention-range" onclick="selectRetentionDateRange(30, this)">前30天</button>
          </div>

          <!-- 精准日期范围选择器 -->
          <div class="retention-range-picker" id="retentionDateRangeWrapper">
            <input type="date" id="retentionStartDate" value="2026-09-09" title="开始日期" onclick="try{this.showPicker()}catch(e){}" />
            <span class="retention-range-separator">~</span>
            <input type="date" id="retentionEndDate" value="2026-09-15" title="结束日期" onclick="try{this.showPicker()}catch(e){}" />
            <span class="retention-calendar-icon" onclick="try{document.getElementById('retentionStartDate').showPicker()}catch(e){}" title="点击选择日期">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </span>
          </div>

          <!-- SMARTCODE 搜索框 -->
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:13px; font-weight:500; color:#334155; white-space:nowrap;">SMARTCODE:</span>
            <input id="retentionSmartCode" class="retention-filter-input" placeholder="请输入" style="width:150px; padding:0 10px;" />
          </div>

          <!-- R渠道 下拉框 -->
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:13px; font-weight:500; color:#334155; white-space:nowrap;">R渠道:</span>
            <select id="retentionRChannel" class="retention-filter-select" style="width:145px;">
              <option value="">请选择</option>
              <option value="R1-官网预约">R1-官网预约</option>
              <option value="R2-垂媒引流">R2-垂媒引流</option>
              <option value="R3-车展留资">R3-车展留资</option>
              <option value="R6-总部新媒体">R6-总部新媒体</option>
            </select>
          </div>
        </div>

        <!-- 筛选操作按钮（样式完全对齐截图2） -->
        <div style="display:flex; align-items:center; gap:10px;">
          <button type="button" class="btn-retention-secondary" onclick="resetRetentionFilter()">重置</button>
          <button type="button" class="btn-retention-primary" onclick="applyRetentionFilter()">查询</button>
          <button type="button" class="btn-retention-secondary" onclick="exportRetentionData()">导出数据</button>
        </div>
      </div>

      <!-- 4个重拨指标卡片 -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; margin-top:18px;">
        <div style="background:#f8fafc; border:1px solid #f1f5f9; border-radius:6px; padding:16px 18px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; color:#64748b; font-weight:500;">重拨任务总数</span>
            <span style="font-size:12px; color:#94a3b8;">累计下发</span>
          </div>
          <div style="font-size:26px; font-weight:700; color:#0f172a; margin-top:8px;" id="valTotalCb">1,286</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">较上周期 <span style="color:#10b981; font-weight:600;">+8.3% ↑</span></div>
        </div>

        <div style="background:#f8fafc; border:1px solid #f1f5f9; border-radius:6px; padding:16px 18px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; color:#64748b; font-weight:500;">已重拨数量</span>
            <span style="font-size:12px; color:#2563eb; background:#eff6ff; padding:1px 6px; border-radius:3px;">执行率 81.0%</span>
          </div>
          <div style="font-size:26px; font-weight:700; color:#2563eb; margin-top:8px;" id="valDialedCb">1,042</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">有效触达任务完成数</div>
        </div>

        <div style="background:#f8fafc; border:1px solid #f1f5f9; border-radius:6px; padding:16px 18px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; color:#64748b; font-weight:500;">重拨已接通数量</span>
            <span style="font-size:12px; color:#059669; background:#ecfdf5; padding:1px 6px; border-radius:3px;">接通率 75.7%</span>
          </div>
          <div style="font-size:26px; font-weight:700; color:#10b981; margin-top:8px;" id="valConnectedCb">789</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">AI外呼成功建联线索</div>
        </div>

        <div style="background:#f8fafc; border:1px solid #f1f5f9; border-radius:6px; padding:16px 18px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; color:#64748b; font-weight:500;">待重拨数量</span>
            <span style="font-size:12px; color:#d97706; background:#fef3c7; padding:1px 6px; border-radius:3px;">队列中 19.0%</span>
          </div>
          <div style="font-size:26px; font-weight:700; color:#f59e0b; margin-top:8px;" id="valPendingCb">244</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">待按时段轮巡重拨执行</div>
        </div>
      </div>
    </section>

    <!-- ==================== 版块二：规则配置（策略设置 + 日报邮件对象） ==================== -->
    <section class="retention-section-card" aria-label="规则配置版块">
      <div class="retention-section-header">
        <div class="retention-section-title-box">
          <div style="width:4px; height:16px; background:#7c3aed; border-radius:2px;"></div>
          <h3 style="margin:0; font-size:15px; font-weight:700; color:#0f172a;">规则配置 · 策略与推送</h3>
          <span class="retention-section-tag purple">策略中心</span>
        </div>
        <div style="font-size:12px; color:#64748b;">
          配置修改后实时下发至调度引擎生效
        </div>
      </div>

      <!-- 双卡片网格布局：策略设置 + 邮件推送 -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
        <!-- 规则配置子项 1: 滞留数据处理设置（包含重拨数据） -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:18px 20px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <h4 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">滞留数据处理设置（包含重拨数据）</h4>
                <span class="retention-section-tag emerald">运行周期</span>
              </div>
              <button type="button" id="retentionSettingEditBtn" style="height:28px; padding:0 14px; background:#004ac6; border:none; color:#fff; border-radius:4px; font-size:12px; cursor:pointer; font-weight:500; transition:all 0.2s;" onmouseover="this.style.background='#003595'" onmouseout="this.style.background='#004ac6'" onclick="toggleRetentionSettingEdit()">编辑</button>
            </div>

            <div style="font-size:12px; color:#64748b; margin-bottom:10px;">
              请选择系统允许自动处理滞留线索与执行AI重拨任务的周排程：
            </div>

            <!-- 星期选择胶囊组 -->
            <div id="retentionWeekdayContainer" style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:16px;">
              ${[
                { day: 1, label: '周一' },
                { day: 2, label: '周二' },
                { day: 3, label: '周三' },
                { day: 4, label: '周四' },
                { day: 5, label: '周五' },
                { day: 6, label: '周六' },
                { day: 7, label: '周日' }
              ].map(item => `
                <div class="retention-day-capsule ${retentionActiveDays.includes(item.day) ? 'active' : ''}" 
                     data-day="${item.day}" 
                     onclick="toggleRetentionDay(${item.day})">
                  ${item.label}
                </div>
              `).join('')}
            </div>

            <!-- 时段配置区域（时段一、时段二... 完全对齐截图视觉） -->
            <div style="border-top:1px solid #e2e8f0; padding-top:14px; margin-bottom:14px;">
              <div style="font-size:12px; color:#64748b; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <span>配置允许执行滞留处理与AI外呼重拨的时间段：</span>
                <span style="color:#94a3b8; font-size:11px;">后续时段须晚于前序时段</span>
              </div>
              <div id="retentionTimeSlotsContainer">
                ${renderRetentionTimeSlotsHtml()}
              </div>
            </div>
          </div>

          <div style="color:#64748b; font-size:12px; background:#fff; border:1px dashed #cbd5e1; padding:8px 12px; border-radius:6px; display:flex; align-items:center; gap:6px;">
            <span style="font-size:14px;">💡</span>
            <span>建议根据冰兰外呼类型时段设置，即晚于冰兰外呼类型推送时间。</span>
          </div>
        </div>

        <!-- 规则配置子项 2: 滞留处理日报邮件对象 -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:18px 20px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <h4 style="margin:0; font-size:14px; font-weight:700; color:#1e293b;">滞留处理日报邮件对象</h4>
                <span class="retention-section-tag purple">推送通知</span>
              </div>
              <button type="button" id="retentionEmailEditBtn" style="height:28px; padding:0 14px; background:#004ac6; border:none; color:#fff; border-radius:4px; font-size:12px; cursor:pointer; font-weight:500; transition:all 0.2s;" onmouseover="this.style.background='#003595'" onmouseout="this.style.background='#004ac6'" onclick="toggleRetentionEmailEdit()">编辑</button>
            </div>

            <div style="font-size:12px; color:#64748b; margin-bottom:10px;">
              每日 09:00 系统自动汇总前一日滞留处理与重拨看板数据，并推送到以下邮箱：
            </div>

            <div>
              <textarea id="retentionEmailRecipients" class="retention-filter-input" readonly placeholder="请输入接收日报的邮箱地址，多个邮箱使用分号(;)隔开" style="width:100%; height:62px; padding:8px 12px; font-size:13px; line-height:1.5; resize:none; background:#fff; font-family:inherit;">dcc-ops@nissan.com.cn; nurture-monitor@nissan.com.cn;</textarea>
            </div>
          </div>

          <div style="color:#64748b; font-size:12px; margin-top:8px; display:flex; justify-content:space-between; align-items:center;">
            <span>支持配置多个企业邮箱接收人</span>
            <span style="color:#94a3b8;">已配置 2 个对象</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 版块三：滞留与重拨任务明细列表 ==================== -->
    <section class="retention-section-card" style="padding:0; overflow:hidden;" aria-label="滞留与重拨任务明细版块">
      <div class="retention-section-header" style="border-bottom:1px solid #e2e8f0; margin-bottom:0; padding:14px 18px;">
        <div class="retention-section-title">
          <div class="retention-section-title-bar" style="background:#0284c7;"></div>
          <span>滞留与重拨任务明细</span>
          <span class="retention-section-tag" style="background:#e0f2fe; color:#0369a1; border-color:#bae6fd;">任务明细</span>
          <span style="font-size:12px; font-weight:normal; color:#64748b; margin-left:4px;">(支持实时跟踪重拨轮次与执行状态)</span>
        </div>
        <div style="font-size:12px; color:#64748b;">共 ${retentionMockData.length} 条记录</div>
      </div>
      <div style="overflow-x:auto;">
        <table class="data-table" style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; color:#334155; font-weight:600;">
              <th style="padding:12px 14px;">#</th>
              <th style="padding:12px 12px;">重拨任务编码</th>
              <th style="padding:12px 12px;">培育线索编码</th>
              <th style="padding:12px 12px;">客户信息</th>
              <th style="padding:12px 12px;">当前轮次</th>
              <th style="padding:12px 12px;">计划重拨时间</th>
              <th style="padding:12px 14px;">重拨策略规则</th>
              <th style="padding:12px 14px;">最终状态</th>
            </tr>
          </thead>
          <tbody>
            ${retentionMockData.map((item, idx) => {
              const maskedPhone = item.phone ? item.phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') : '—';
              return `
                <tr style="border-bottom:1px solid #f1f5f9; color:#334155;">
                  <td style="padding:12px 14px; color:#64748b;">${idx + 1}</td>
                  <td style="padding:12px 12px; font-family:monospace; color:#2563eb; font-weight:700;">${item.cbCode}</td>
                  <td style="padding:12px 12px; font-family:monospace; color:#475569;">${item.leadId}</td>
                  <td style="padding:10px 12px;">
                    <div class="list-customer-cell">
                      <div class="list-customer-name" style="font-size:13px; font-weight:600; color:#1e293b;">${item.name}</div>
                      <div class="list-customer-phone" style="font-size:12px; color:#64748b; font-family:monospace; margin-top:2px;">${maskedPhone}</div>
                    </div>
                  </td>
                  <td style="padding:12px 12px; font-weight:700; color:#d97706;">${item.round}</td>
                  <td style="padding:12px 12px; color:#2563eb; font-weight:600;">${item.nextTime}</td>
                  <td style="padding:12px 14px; color:#4f46e5; font-weight:500;">${item.rule}</td>
                  <td style="padding:12px 14px;"><span style="padding:3px 10px; border-radius:4px; font-size:12px; font-weight:500; background:${item.status==='重拨中'?'#dbeafe':'#fef3c7'}; color:${item.status==='重拨中'?'#1e40af':'#92400e'}; border:1px solid ${item.status==='重拨中'?'#bfdbfe':'#fde68a'};">${item.status}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span>共 ${retentionMockData.length} 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="retentionPageSize" aria-label="每页显示条数">
            <option value="5">每页 5 条</option>
            <option value="10" selected>每页 10 条</option>
            <option value="20">每页 20 条</option>
            <option value="50">每页 50 条</option>
          </select>
          <button class="page-btn disabled" type="button" disabled aria-label="上一页">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <select class="hit-page-size" id="retentionPageSelect" aria-label="跳转页码">
            <option value="1" selected>第 1 页</option>
          </select>
          <button class="page-btn disabled" type="button" disabled aria-label="下一页">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </section>
  `;
}

function selectRetentionDateRange(days, btn) {
  document.querySelectorAll('.btn-retention-range').forEach(b => {
    b.classList.remove('active');
  });
  if (btn) {
    btn.classList.add('active');
  }

  const end = new Date(2026, 8, 15);
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));

  const sInput = document.getElementById('retentionStartDate');
  const eInput = document.getElementById('retentionEndDate');
  if (sInput) sInput.value = start.toISOString().slice(0, 10);
  if (eInput) eInput.value = end.toISOString().slice(0, 10);

  if (typeof showToast === 'function') {
    showToast(`已切换至【${days === 1 ? '昨天' : '前' + days + '天'}】滞留重拨数据看板`, true);
  }
}

function applyRetentionFilter() {
  if (typeof showToast === 'function') {
    showToast('【滞留数据配置】筛选条件已更新，看板数据已刷新', true);
  }
}

function resetRetentionFilter() {
  const smartCode = document.getElementById('retentionSmartCode');
  const channel = document.getElementById('retentionRChannel');
  if (smartCode) smartCode.value = '';
  if (channel) channel.value = '';

  const defaultBtn = document.getElementById('btnRetentionLast7');
  if (defaultBtn) selectRetentionDateRange(7, defaultBtn);

  if (typeof showToast === 'function') {
    showToast('【滞留数据配置】筛选条件已重置为默认', true);
  }
}

function exportRetentionData() {
  if (typeof showToast === 'function') {
    showToast('正在导出【滞留与重拨任务明细_2026-09-09_2026-09-15.xlsx】...', true);
  }
}

function getSlotChineseNum(num) {
  const cnNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  return cnNums[num - 1] || num;
}

function syncRetentionTimeSlotsFromDom() {
  retentionTimeSlots.forEach(slot => {
    const sInput = document.getElementById(`slotStart_${slot.id}`);
    const eInput = document.getElementById(`slotEnd_${slot.id}`);
    if (sInput && sInput.value) slot.start = sInput.value;
    if (eInput && eInput.value) slot.end = eInput.value;
  });
}

function updateRetentionSlotValue(id, field, value) {
  const slot = retentionTimeSlots.find(s => s.id === id);
  if (slot) {
    slot[field] = value;
  }
}

function openRetentionTimePicker(inputId) {
  if (!isRetentionSettingEditing) return;
  const input = document.getElementById(inputId);
  if (!input) return;
  try {
    input.showPicker();
  } catch (err) {
    input.focus();
  }
}

function renderRetentionTimeSlotsHtml() {
  const isCardEditing = !!isRetentionSettingEditing;
  return `
    <div class="retention-slots-list">
      ${retentionTimeSlots.map((slot, index) => {
        const slotNo = index + 1;
        const cnSlot = getSlotChineseNum(slotNo);
        return `
          <div class="retention-slot-row ${isCardEditing ? 'editing' : ''}" id="retentionSlotRow_${slot.id}">
            <div class="retention-slot-label">时段${cnSlot}</div>
            
            <div class="retention-time-box ${isCardEditing ? '' : 'readonly'}" onclick="${isCardEditing ? `openRetentionTimePicker('slotStart_${slot.id}')` : ''}">
              <input type="time" class="retention-time-input" id="slotStart_${slot.id}" value="${slot.start || ''}" ${isCardEditing ? '' : 'disabled'} onclick="${isCardEditing ? `openRetentionTimePicker('slotStart_${slot.id}')` : ''}" oninput="updateRetentionSlotValue(${slot.id}, 'start', this.value)" onchange="updateRetentionSlotValue(${slot.id}, 'start', this.value)" />
              <span style="color:#8c8c8c; margin-left:6px; display:inline-flex; align-items:center; flex-shrink:0; cursor:${isCardEditing ? 'pointer' : 'default'};" onclick="${isCardEditing ? `openRetentionTimePicker('slotStart_${slot.id}')` : ''}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>
            </div>

            <span style="color:#64748b; font-size:13px; font-weight:500; user-select:none;">-</span>

            <div class="retention-time-box ${isCardEditing ? '' : 'readonly'}" onclick="${isCardEditing ? `openRetentionTimePicker('slotEnd_${slot.id}')` : ''}">
              <input type="time" class="retention-time-input" id="slotEnd_${slot.id}" value="${slot.end || ''}" ${isCardEditing ? '' : 'disabled'} onclick="${isCardEditing ? `openRetentionTimePicker('slotEnd_${slot.id}')` : ''}" oninput="updateRetentionSlotValue(${slot.id}, 'end', this.value)" onchange="updateRetentionSlotValue(${slot.id}, 'end', this.value)" />
              <span style="color:#8c8c8c; margin-left:6px; display:inline-flex; align-items:center; flex-shrink:0; cursor:${isCardEditing ? 'pointer' : 'default'};" onclick="${isCardEditing ? `openRetentionTimePicker('slotEnd_${slot.id}')` : ''}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>
            </div>

            <div class="retention-slot-actions">
              <button type="button" class="btn-slot-delete" ${isCardEditing ? '' : 'disabled'} onclick="deleteRetentionTimeSlot(${slot.id})" title="${isCardEditing ? '删除此时段' : '请先点击右上角【编辑】开启配置'}">删除</button>
            </div>
          </div>
        `;
      }).join('')}
      <div style="margin-left: 58px; margin-top: 4px;">
        <button type="button" class="btn-slot-add" ${isCardEditing ? '' : 'disabled'} onclick="addRetentionTimeSlot()" title="${isCardEditing ? '添加新时段' : '请先点击右上角【编辑】开启配置'}">添加</button>
      </div>
    </div>
  `;
}

function refreshRetentionTimeSlots() {
  const container = document.getElementById('retentionTimeSlotsContainer');
  if (container) {
    container.innerHTML = renderRetentionTimeSlotsHtml();
  }
}

function editRetentionTimeSlot(id) {
  // 若未开启卡片编辑，点击时段编辑自动开启全局编辑态
  if (!isRetentionSettingEditing) {
    toggleRetentionSettingEdit();
  }
  const startInput = document.getElementById(`slotStart_${id}`);
  if (startInput) startInput.focus();
}

function saveRetentionTimeSlot(id) {
  toggleRetentionSettingEdit();
}

function deleteRetentionTimeSlot(id) {
  if (!isRetentionSettingEditing) {
    if (typeof showToast === 'function') {
      showToast('当前处于查看状态，请先点击右上角【编辑】开启配置', false);
    }
    return;
  }
  if (retentionTimeSlots.length <= 1) {
    if (typeof showToast === 'function') showToast('至少保留一个允许执行时段', false);
    return;
  }
  syncRetentionTimeSlotsFromDom();
  const idx = retentionTimeSlots.findIndex(s => s.id === id);
  if (idx >= 0) {
    retentionTimeSlots.splice(idx, 1);
    refreshRetentionTimeSlots();
    if (typeof showToast === 'function') showToast('时段已删除，配置完成后请点击右上角【保存配置】', true);
  }
}

function addRetentionTimeSlot() {
  if (!isRetentionSettingEditing) {
    if (typeof showToast === 'function') {
      showToast('当前处于查看状态，请先点击右上角【编辑】开启配置', false);
    }
    return;
  }
  syncRetentionTimeSlotsFromDom();
  const newId = Date.now();
  let defaultStart = '19:00';
  let defaultEnd = '21:00';
  if (retentionTimeSlots.length > 0) {
    const last = retentionTimeSlots[retentionTimeSlots.length - 1];
    if (last.end && last.end < '22:00') {
      const [h, m] = last.end.split(':').map(Number);
      const nextH = Math.min(h + 1, 22);
      const endH = Math.min(nextH + 2, 23);
      defaultStart = `${String(nextH).padStart(2, '0')}:00`;
      defaultEnd = `${String(endH).padStart(2, '0')}:00`;
    }
  }
  retentionTimeSlots.push({
    id: newId,
    start: defaultStart,
    end: defaultEnd
  });
  refreshRetentionTimeSlots();
  const startInput = document.getElementById(`slotStart_${newId}`);
  if (startInput) startInput.focus();
  if (typeof showToast === 'function') showToast('已添加新时段，配置完成后请点击右上角【保存配置】', true);
}

function toggleRetentionDay(day) {
  if (!isRetentionSettingEditing) return;
  const idx = retentionActiveDays.indexOf(day);
  if (idx >= 0) {
    retentionActiveDays.splice(idx, 1);
  } else {
    retentionActiveDays.push(day);
  }
  updateRetentionDayCapsules();
}

function updateRetentionDayCapsules() {
  const capsules = document.querySelectorAll('.retention-day-capsule');
  capsules.forEach(el => {
    const day = parseInt(el.dataset.day, 10);
    el.classList.toggle('active', retentionActiveDays.includes(day));
    el.classList.toggle('editable', isRetentionSettingEditing);
  });
}

function toggleRetentionSettingEdit() {
  const btn = document.getElementById('retentionSettingEditBtn');
  if (!btn) return;

  if (!isRetentionSettingEditing) {
    // 切换至编辑模式
    isRetentionSettingEditing = true;
    btn.textContent = '保存配置';
    updateRetentionDayCapsules();
    refreshRetentionTimeSlots();
    if (typeof showToast === 'function') {
      showToast('已开启【滞留数据处理设置】编辑模式，可修改排程与执行时段', true);
    }
  } else {
    // 准备保存：先校验周排程
    if (retentionActiveDays.length === 0) {
      if (typeof showToast === 'function') showToast('请至少选择一个允许运行的排程日期（周一至周日）', false);
      return;
    }
    // 同步并校验所有时段合法性
    syncRetentionTimeSlotsFromDom();
    for (let i = 0; i < retentionTimeSlots.length; i++) {
      const slot = retentionTimeSlots[i];
      const cnNo = getSlotChineseNum(i + 1);
      if (!slot.start || !slot.end) {
        if (typeof showToast === 'function') showToast(`请完整填写时段${cnNo}的开始时间与结束时间`, false);
        return;
      }
      if (slot.start >= slot.end) {
        if (typeof showToast === 'function') showToast(`时段${cnNo}结束时间（${slot.end}）必须晚于开始时间（${slot.start}）`, false);
        return;
      }
    }

    // 保存成功，切换回查看态
    isRetentionSettingEditing = false;
    btn.textContent = '编辑';
    updateRetentionDayCapsules();
    refreshRetentionTimeSlots();
    if (typeof showToast === 'function') {
      showToast('【滞留数据处理设置】周排程与时段配置已成功保存生效！', true);
    }
  }
}

function toggleRetentionEmailEdit() {
  const btn = document.getElementById('retentionEmailEditBtn');
  const input = document.getElementById('retentionEmailRecipients');
  if (!btn) return;
  isRetentionEmailEditing = !isRetentionEmailEditing;
  if (input) input.readOnly = !isRetentionEmailEditing;

  if (isRetentionEmailEditing) {
    btn.textContent = '保存配置';
    btn.style.background = '#004ac6';
    if (input) input.focus();
    if (typeof showToast === 'function') showToast('已开启【滞留处理日报邮件对象】编辑模式', true);
  } else {
    btn.textContent = '编辑';
    btn.style.background = '#004ac6';
    if (typeof showToast === 'function') showToast('【滞留处理日报邮件对象】已成功保存！', true);
  }
}

// 挂载至 window，确保全局可访问
window.renderRetentionDataConfigPage = renderRetentionDataConfigPage;
window.selectRetentionDateRange = selectRetentionDateRange;
window.applyRetentionFilter = applyRetentionFilter;
window.resetRetentionFilter = resetRetentionFilter;
window.exportRetentionData = exportRetentionData;
window.toggleRetentionDay = toggleRetentionDay;
window.toggleRetentionSettingEdit = toggleRetentionSettingEdit;
window.toggleRetentionEmailEdit = toggleRetentionEmailEdit;
window.renderRetentionTimeSlotsHtml = renderRetentionTimeSlotsHtml;
window.editRetentionTimeSlot = editRetentionTimeSlot;
window.saveRetentionTimeSlot = saveRetentionTimeSlot;
window.deleteRetentionTimeSlot = deleteRetentionTimeSlot;
window.addRetentionTimeSlot = addRetentionTimeSlot;

// 保持历史兼容方法别名
window.renderOpsHqCallBackDashboard = renderRetentionDataConfigPage;
window.selectOpsHqCbDateRange = selectRetentionDateRange;
window.applyOpsHqCallBackFilter = applyRetentionFilter;
window.resetOpsHqCallBackFilter = resetRetentionFilter;
window.exportOpsHqCallBackData = exportRetentionData;
window.toggleOpsHqRetentionSettingEdit = toggleRetentionSettingEdit;
window.toggleOpsHqRetentionEmailEdit = toggleRetentionEmailEdit;
