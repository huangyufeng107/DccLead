// ===== 质检管理模块 - 旧质检看板（对齐现网 qualityReportOld 生产构建） =====
// 页面结构：筛选区 → 总览卡 → 员工质检（雷达图+细项拆解）→ 数据趋势折线图
//          → 员工诊断列表 → 线索诊断列表（详情抽屉 AiAnalysis + 检核弹窗）
// 对齐规则：纯静态原型，确定性伪随机演示数据，不依赖后端 API。

(function () {
  'use strict';

  // ==================== 样式注入（对齐生产 p__NEV__Sale__NEV__qualityReportOld.chunk.css） ====================
  var QRO_STYLE_ID = 'qroStylesheet';
  function qroEnsureStyles() {
    if (document.getElementById(QRO_STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = QRO_STYLE_ID;
    style.textContent = [
      /* 主容器（.main___2iB2C） */
      '.qro-main{padding:24px 20px;background-color:#f0f2f5;min-height:100%;}',
      /* 筛选区（.top___1PrpJ） */
      '.qro-top{margin-bottom:24px;padding:16px 32px;background-color:#fff;border-radius:12px;}',
      '.qro-top .qro-row{display:flex;}',
      '.qro-top .qro-left{flex:1 1;}',
      '.qro-top .qro-form-row{display:flex;flex-wrap:wrap;gap:0 20px;margin-bottom:8px;}',
      '.qro-top .qro-form-item{display:flex;align-items:center;margin-bottom:8px;}',
      '.qro-top .qro-form-label{color:rgba(0,0,0,0.88);font-size:14px;line-height:22px;margin-right:8px;white-space:nowrap;}',
      /* antd 按钮 */
      '.qro-btn{display:inline-flex;align-items:center;justify-content:center;height:32px;padding:4px 15px;font-size:14px;border-radius:6px;border:1px solid #d9d9d9;background:#fff;color:rgba(0,0,0,0.88);cursor:pointer;transition:all .2s;white-space:nowrap;}',
      '.qro-btn:hover{border-color:#2885ff;color:#2885ff;}',
      '.qro-btn-primary{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.qro-btn-primary:hover{background:#4096ff;border-color:#4096ff;color:#fff;}',
      /* antd solid RadioGroup 按钮 */
      '.qro-radio-group{display:inline-flex;}',
      '.qro-radio-btn{padding:0 15px;height:32px;line-height:30px;font-size:14px;border:1px solid #d9d9d9;border-left-width:0;background:#fff;color:rgba(0,0,0,0.88);cursor:pointer;transition:all .2s;white-space:nowrap;}',
      '.qro-radio-btn:first-child{border-left-width:1px;border-radius:6px 0 0 6px;}',
      '.qro-radio-btn:last-child{border-radius:0 6px 6px 0;}',
      '.qro-radio-btn:hover{color:#2885ff;}',
      '.qro-radio-btn.qro-radio-checked{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.qro-radio-btn.qro-radio-checked + .qro-radio-btn{border-left-color:#1677ff;}',
      '.qro-radio-group-sm .qro-radio-btn{height:24px;line-height:22px;padding:0 11px;font-size:13px;border-radius:4px;}',
      '.qro-radio-group-sm .qro-radio-btn:first-child{border-radius:4px 0 0 4px;}',
      '.qro-radio-group-sm .qro-radio-btn:last-child{border-radius:0 4px 4px 0;}',
      /* 日期/下拉输入 */
      '.qro-input{height:32px;padding:4px 11px;font-size:14px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;color:rgba(0,0,0,0.88);outline:none;transition:border-color .2s;}',
      '.qro-input:focus{border-color:#2885ff;box-shadow:0 0 0 2px rgba(40,133,255,0.1);}',
      '.qro-select-multiple{min-height:32px;min-width:200px;padding:2px 4px;display:flex;flex-wrap:wrap;gap:2px;align-items:center;border:1px solid #d9d9d9;border-radius:6px;background:#fff;cursor:pointer;transition:border-color .2s;}',
      '.qro-select-multiple:hover,.qro-select-multiple.qro-focused{border-color:#2885ff;}',
      '.qro-select-multiple .qro-placeholder{color:rgba(0,0,0,0.25);font-size:14px;padding:0 7px;}',
      '.qro-select-multiple .qro-tag{display:inline-flex;align-items:center;max-width:100%;height:24px;padding:0 7px;font-size:12px;background:rgba(0,0,0,0.06);border-radius:4px;color:rgba(0,0,0,0.88);}',
      '.qro-select-multiple .qro-tag .qro-tag-close{margin-left:4px;font-style:normal;color:rgba(0,0,0,0.45);cursor:pointer;}',
      '.qro-select-multiple .qro-tag .qro-tag-close:hover{color:rgba(0,0,0,0.88);}',
      '.qro-select-multiple .qro-tag-rest{height:24px;padding:0 7px;font-size:12px;background:rgba(0,0,0,0.06);border-radius:4px;color:rgba(0,0,0,0.45);}',
      /* 总览区（.overView___2Ltrt） */
      '.qro-overview{margin-bottom:24px;padding:24px 32px;display:grid;grid-template-columns:repeat(4,1fr);grid-gap:24px;min-height:52px;background-color:#fff;border-radius:12px;}',
      '.qro-overview-item{padding:16px;background-color:#f6f8fa;border-radius:4px;}',
      '.qro-overview .qro-info{display:flex;align-items:center;}',
      '.qro-overview .qro-info img{margin-right:16px;width:64px;height:64px;border-radius:50%;object-fit:cover;}',
      '.qro-overview .qro-info .qro-name{font-size:18px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;}',
      '.qro-overview .qro-ov-title{margin-bottom:8px;color:#667085;font-size:12px;display:flex;align-items:center;}',
      '.qro-overview .qro-content{display:flex;align-items:end;justify-content:space-between;}',
      '.qro-overview .qro-num{margin-right:4px;color:#1c2939;font-size:32px;font-weight:500;}',
      '.qro-overview .qro-num-blue{color:#2885ff;background-color:#e2eafb;}',
      '.qro-overview .qro-num-green{color:#019855;background-color:#ecfdf3;}',
      '.qro-overview .qro-text{font-size:12px;}',
      '.qro-overview .qro-percen{margin-left:4px;padding:0 6px;line-height:1.5em;border-radius:2em;}',
      /* 白底卡片（.wrap___3gtOC / .wrap___Rz_m7） */
      '.qro-wrap{margin-bottom:24px;background-color:#fff;border-radius:12px;}',
      '.qro-header{padding:0 32px;display:flex;align-items:center;justify-content:space-between;height:56px;border-bottom:1px solid #e8e8e8;}',
      '.qro-header .qro-title{position:relative;padding-left:6px;font-size:16px;font-weight:500;}',
      '.qro-cascader{margin-right:12px;width:300px;}',
      '.qro-table-pad{padding:0 32px 24px;}',
      /* 员工质检 双栏（.row___3Ruxq / .box___8vhpi） */
      '.qro-box-row{display:grid;grid-template-columns:repeat(2,1fr);grid-gap:12px;}',
      '.qro-box{display:flex;flex-direction:column;padding:16px;}',
      '.qro-box .qro-box-title{margin-bottom:12px;font-size:14px;font-weight:500;}',
      '.qro-box .qro-active-tab{font-weight:bold;}',
      '.qro-box .qro-inactive-tab{color:rgba(0,0,0,0.45);cursor:pointer;}',
      '.qro-box .qro-inactive-tab:hover{color:rgba(0,0,0,0.65);}',
      '.qro-box .qro-tabs{margin:12px 0;display:flex;align-items:center;flex-wrap:wrap;}',
      '.qro-box .qro-tabs .qro-tab-split{width:1px;height:14px;background:#d9d9d9;margin:0 12px;}',
      '.qro-box .qro-progress-wrap{flex:1 1;display:flex;flex-direction:column;justify-content:center;}',
      '.qro-box .qro-progress{margin-bottom:22px;display:flex;align-items:center;}',
      '.qro-box .qro-progress:last-child{margin-bottom:0;}',
      '.qro-box .qro-progress-title{margin-right:10px;flex:none;width:148px;text-align:right;font-size:12px;}',
      '.qro-progress-bar{flex:1;height:12px;background:rgba(0,0,0,0.06);border-radius:6px;overflow:hidden;position:relative;}',
      '.qro-progress-inner{height:100%;background:#1677ff;border-radius:6px;transition:width .3s;}',
      '.qro-progress-text{position:absolute;right:8px;top:0;line-height:12px;font-size:12px;color:rgba(0,0,0,0.88);}',
      /* 折线图容器（.chartWrap___El5OG） */
      '.qro-chart-wrap{width:100%;height:392px;padding:12px;margin:0 0 20px;position:relative;}',
      /* 表格（antd Table middle 对齐） */
      '.qro-grid-table{width:100%;border-collapse:collapse;font-size:14px;}',
      '.qro-grid-table th{background:#fafafa;padding:12px 16px;text-align:left;font-weight:600;color:rgba(0,0,0,0.88);border-bottom:1px solid #f0f0f0;white-space:nowrap;position:relative;}',
      '.qro-grid-table th .qro-sorter{display:inline-flex;flex-direction:column;margin-left:4px;cursor:pointer;vertical-align:middle;}',
      '.qro-grid-table th .qro-sorter i{border-left:4px solid transparent;border-right:4px solid transparent;display:block;width:0;height:0;}',
      '.qro-grid-table th .qro-sorter i.up{border-bottom:5px solid #bfbfbf;margin-bottom:2px;}',
      '.qro-grid-table th .qro-sorter i.down{border-top:5px solid #bfbfbf;margin-top:2px;}',
      '.qro-grid-table th .qro-sorter.on i.up{border-bottom-color:#1677ff;}',
      '.qro-grid-table th .qro-sorter.on i.down{border-top-color:#1677ff;}',
      '.qro-grid-table td{padding:12px 16px;border-bottom:1px solid #f0f0f0;color:rgba(0,0,0,0.88);white-space:nowrap;}',
      '.qro-grid-table tbody tr:hover td{background:#fafafa;}',
      '.qro-table-scroll{overflow:auto;}',
      '.qro-cell-blue{color:#1677ff;font-weight:bold;}',
      '.qro-link{color:#1677ff;cursor:pointer;background:none;border:none;padding:0;font-size:14px;margin-right:8px;}',
      '.qro-link:hover{color:#4096ff;}',
      '.qro-link-btn{display:inline-flex;align-items:center;color:#1677ff;cursor:pointer;background:none;border:none;font-size:14px;padding:4px 8px;}',
      '.qro-link-btn:hover{color:#4096ff;}',
      '.qro-link-btn svg{margin-right:4px;}',
      /* 分页（antd 风格） */
      '.qro-pagination{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:16px 0 0;font-size:14px;color:rgba(0,0,0,0.88);}',
      '.qro-pagination .qro-page-btn{min-width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #d9d9d9;border-radius:6px;background:#fff;cursor:pointer;padding:0 8px;}',
      '.qro-pagination .qro-page-btn:hover{color:#2885ff;border-color:#2885ff;}',
      '.qro-pagination .qro-page-btn.qro-page-active{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.qro-pagination .qro-page-btn:disabled{color:rgba(0,0,0,0.25);cursor:not-allowed;background:#fff;border-color:#d9d9d9;}',
      '.qro-pagination select{height:32px;border:1px solid #d9d9d9;border-radius:6px;padding:0 8px;font-size:14px;background:#fff;}',
      /* 树形选择器（TreeSelect 对齐） */
      '.qro-treeselect{position:relative;display:inline-flex;align-items:center;min-height:32px;width:300px;padding:1px 4px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;cursor:pointer;flex-wrap:wrap;gap:2px;transition:border-color .2s;font-size:14px;}',
      '.qro-treeselect:hover{border-color:#2885ff;}',
      '.qro-treeselect.qro-focused{border-color:#2885ff;box-shadow:0 0 0 2px rgba(40,133,255,0.1);}',
      '.qro-treeselect .qro-placeholder{color:rgba(0,0,0,0.25);padding:0 7px;}',
      '.qro-treeselect .qro-tag{display:inline-flex;align-items:center;max-width:120px;height:22px;padding:0 7px;font-size:12px;background:rgba(0,0,0,0.06);border-radius:4px;}',
      '.qro-treeselect .qro-tag-rest{height:22px;padding:0 7px;font-size:12px;background:rgba(0,0,0,0.06);border-radius:4px;color:rgba(0,0,0,0.45);}',
      '.qro-treeselect .qro-arrow{margin-left:auto;color:rgba(0,0,0,0.25);padding:0 7px;}',
      '.qro-tree-dropdown{position:fixed;z-index:11000;width:300px;max-width:300px;background:#fff;border-radius:8px;box-shadow:0 6px 16px 0 rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:4px;max-height:320px;overflow:auto;font-size:14px;}',
      '.qro-tree-search{width:calc(100% - 4px);height:28px;margin:2px 0 6px;padding:0 7px;border:1px solid #d9d9d9;border-radius:4px;outline:none;font-size:14px;box-sizing:border-box;}',
      '.qro-tree-node{display:flex;align-items:center;height:30px;padding:0 8px;cursor:pointer;border-radius:4px;user-select:none;}',
      '.qro-tree-node:hover{background:rgba(0,0,0,0.03);}',
      '.qro-tree-node .qro-tree-switcher{width:16px;color:rgba(0,0,0,0.45);font-size:10px;flex:none;display:inline-flex;justify-content:center;}',
      '.qro-tree-checkbox{width:16px;height:16px;border:1px solid #d9d9d9;border-radius:4px;margin-right:8px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:#fff;transition:all .2s;}',
      '.qro-tree-checkbox.qro-checked{background:#1677ff;border-color:#1677ff;}',
      '.qro-tree-checkbox.qro-checked::after{content:"";width:5px;height:9px;border:solid #fff;border-width:0 1.5px 1.5px 0;transform:rotate(45deg);margin-top:-2px;}',
      '.qro-tree-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      /* 详情抽屉 / 检核抽屉（antd Drawer） */
      '.qro-drawer-mask{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.45);}',
      '.qro-drawer{position:fixed;top:0;right:0;bottom:0;z-index:10001;background:#fff;box-shadow:-6px 0 16px rgba(0,0,0,0.08);display:flex;flex-direction:column;animation:qroDrawerIn .25s ease;}',
      '@keyframes qroDrawerIn{from{transform:translateX(100%);}to{transform:translateX(0);}}',
      '.qro-drawer-header{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:16px;color:rgba(0,0,0,0.88);}',
      '.qro-drawer-close{background:none;border:none;font-size:16px;cursor:pointer;color:rgba(0,0,0,0.45);padding:4px;line-height:1;}',
      '.qro-drawer-close:hover{color:rgba(0,0,0,0.88);}',
      '.qro-drawer-body{flex:1;overflow:auto;padding:16px 24px;background:#fff;}',
      '.qro-drawer-footer{padding:10px 16px;border-top:1px solid #f0f0f0;text-align:right;background:#fff;}',
      /* AiAnalysis 内部（.main___DFSdz 等，对齐共享 chunk） */
      '.qro-ai-chat-main{overflow:auto;height:418px;font-size:0;padding:25px 20px 20px 20px;background:#ebedf0;border-radius:8px;}',
      '.qro-sales-wrap{display:flex;text-align:right;align-items:flex-start;padding-left:40px;justify-content:flex-end;margin-left:40px;}',
      '.qro-customer-wrap{display:flex;text-align:right;align-items:flex-start;justify-content:flex-start;margin-right:40px;}',
      '.qro-sales-text-wrap{display:inline-flex;flex:1 0;justify-content:flex-end;margin-right:10px;flex-direction:column;align-items:flex-end;}',
      '.qro-sales-text-inner{display:inline-flex;padding:6px 16px;background:#c7e8ff;border-radius:16px 16px 0px 16px;}',
      '.qro-customer-text-wrap{display:inline-flex;flex:1 0;margin-left:10px;flex-direction:column;align-items:flex-start;}',
      '.qro-customer-text-inner{display:inline-flex;padding:6px 16px;background:#ffffff;border:1px solid #ecebeb;border-radius:16px 16px 16px 0px;}',
      '.qro-chat-text{font-size:14px;font-weight:bold;text-align:left;color:#000000;line-height:1.2;}',
      '.qro-icon-sales{width:32px;height:32px;color:#fff;font-size:16px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;background:#4a9cf7;border-radius:8px;flex-shrink:0;flex-grow:0;}',
      '.qro-icon-customer{width:32px;height:32px;color:#fff;font-size:16px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;background:#00ce86;border-radius:8px;flex-shrink:0;flex-grow:0;}',
      '.qro-time-text{font-size:12px;color:#7a7a7a;line-height:14px;}',
      '.qro-export-button{display:flex;align-items:center;font-size:14px;line-height:22px;color:#1890ff;cursor:pointer;}',
      /* 视频组件 tabs（.first-tabs-item / .second-tabs-item） */
      '.qro-vc-wrap{position:relative;background:#ffffff;border-radius:8px;border:1px solid #f0f0f0;box-shadow:0px 2px 6px 0px rgba(0,0,0,0.05);padding:0;margin:20px 0 20px;}',
      '.qro-vc-top{padding:20px 20px 16px 20px;border-bottom:1px solid #ededee;}',
      '.qro-vc-bottom{padding:20px;background:rgba(0,0,0,0.02);}',
      '.qro-vc-appeal-count{display:inline-flex;align-items:center;height:36px;padding:0 24px;background:#fff0e3;border-radius:8px;font-size:14px;color:rgba(1,18,58,0.6);line-height:20px;margin-bottom:15px;}',
      '.qro-first-tabs-inner{display:flex;flex-wrap:wrap;}',
      '.qro-first-tabs-item{position:relative;display:flex;align-items:center;justify-content:center;width:105px;height:36px;font-size:14px;text-align:center;color:#1c1e23;line-height:20px;background:linear-gradient(180deg,#ffffff,#ffffff);border:1px solid #dcdfe6;border-radius:8px;margin-right:15px;margin-bottom:15px;cursor:pointer;}',
      '.qro-first-tabs-item.qro-first-active{color:#2885ff;background:rgba(61,118,240,0.05);border:1px solid #2885ff;}',
      '.qro-first-tabs-item:hover{color:#2885ff;background:rgba(61,118,240,0.05);border:1px solid #2885ff;}',
      '.qro-first-tabs-badge{box-sizing:border-box;position:absolute;top:-11px;right:-11px;display:flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 2px;background:#fff0e3;border:1px solid #ffffff;border-radius:50%;font-size:12px;text-align:center;color:#01123a;line-height:17px;}',
      '.qro-second-tabs-wrap{display:flex;flex-wrap:wrap;margin-bottom:-12px;}',
      '.qro-second-tabs-item{position:relative;display:flex;align-items:center;justify-content:center;padding:6px 12px;font-size:14px;text-align:center;color:#a4a5a7;line-height:20px;border-radius:8px;margin-right:12px;margin-bottom:12px;cursor:pointer;}',
      '.qro-second-tabs-item.qro-second-active{color:#020814;background:rgba(46,48,56,0.05);border-radius:4px;font-weight:bold;}',
      '.qro-second-tabs-item:hover{color:#020814;background:rgba(46,48,56,0.05);border-radius:4px;}',
      '.qro-second-tabs-badge{box-sizing:border-box;position:absolute;top:-9px;right:-9px;display:flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 2px;background:#ff4d4f;border:1px solid #ffffff;border-radius:50%;font-size:12px;text-align:center;color:#fff;line-height:17px;}',
      '.qro-no-ai-tips{display:inline-flex;align-items:center;height:36px;padding:0 24px;background:#fff0e3;border-radius:8px;font-size:14px;color:rgba(1,18,58,0.6);line-height:20px;margin:20px 20px 0px 20px;}',
      /* 得分公式（.scoreFormula___H_bC7） */
      '.qro-score-formula{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:20px 0;padding:16px 24px;background:#fafafa;border:1px solid #e6e6e6;border-radius:12px;font-size:14px;}',
      '.qro-score-formula .qro-sf-label{color:#3c3c3c;font-size:14px;font-weight:400;line-height:22px;white-space:nowrap;}',
      '.qro-score-formula .qro-sf-label-bold{color:#262626;font-size:14px;font-weight:700;line-height:22px;white-space:nowrap;}',
      '.qro-score-formula .qro-sf-value{color:#1c69d4;font-size:16px;font-weight:700;line-height:22px;white-space:nowrap;}',
      '.qro-score-formula .qro-sf-value-danger{color:#dc2626;font-size:16px;font-weight:700;line-height:22px;white-space:nowrap;}',
      '.qro-score-formula .qro-sf-value-total{color:#1c69d4;font-size:18px;font-weight:700;line-height:22px;white-space:nowrap;}',
      '.qro-score-formula .qro-sf-operator{color:#3c3c3c;font-size:14px;line-height:22px;}',
      /* antd Card 简化 */
      '.qro-card{background:#fff;border:1px solid #f0f0f0;border-radius:8px;margin:20px 0;overflow:hidden;}',
      '.qro-card-head{display:flex;align-items:center;justify-content:space-between;min-height:48px;padding:0 16px;font-weight:600;font-size:16px;color:rgba(0,0,0,0.88);border-bottom:1px solid #f0f0f0;}',
      '.qro-card-head .qro-card-extra{font-weight:400;font-size:14px;display:flex;align-items:center;}',
      '.qro-card-head .qro-card-extra .qro-card-extra-num{font-weight:bold;margin-right:12px;}',
      '.qro-card-body{padding:16px;}',
      /* 标签明细（.label___2K0zQ） */
      '.qro-label-group{padding:16px;}',
      '.qro-label-item{display:inline-block;font-size:14px;text-align:center;color:#01123a;line-height:20px;padding:6px 20px;height:32px;background:#f4f9ff;border-radius:4px;box-shadow:0px 2px 6px 0px rgba(0,0,0,0.05);margin:8px;box-sizing:border-box;}',
      /* descriptions（基本信息） */
      '.qro-desc-view{padding:0 16px;}',
      '.qro-desc-title{display:flex;align-items:center;height:36px;padding-left:16px;background:rgba(0,0,0,0.02);border-bottom:1px solid #f1f1f1;font-weight:600;font-size:14px;color:rgba(0,0,0,0.88);}',
      '.qro-desc-item{display:flex;padding:8px 0;border-bottom:1px solid #f1f1f1;font-size:14px;}',
      '.qro-desc-item:last-child{border-bottom:none;}',
      '.qro-desc-item-label{width:120px;color:rgba(0,0,0,0.45);flex:none;}',
      '.qro-desc-item-content{flex:1;color:rgba(0,0,0,0.88);}',
      /* Switch */
      '.qro-switch{display:inline-flex;align-items:center;height:22px;min-width:44px;padding:0 6px 0 2px;border-radius:11px;background:rgba(0,0,0,0.25);cursor:pointer;transition:all .2s;position:relative;justify-content:flex-end;color:#fff;font-size:12px;}',
      '.qro-switch.qro-switch-on{background:#1677ff;}',
      '.qro-switch.qro-switch-on .qro-switch-handle{left:22px;}',
      '.qro-switch .qro-switch-handle{position:absolute;left:2px;top:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:all .2s;}',
      /* 建议（优势✅ / 弱项❌） */
      '.qro-suggest-block{padding:12px 16px;border-radius:8px;font-size:14px;line-height:22px;color:rgba(0,0,0,0.88);}',
      '.qro-suggest-block pre{margin:0;white-space:pre-wrap;font-family:inherit;}',
      /* 表单 */
      '.qro-form-item{display:flex;align-items:flex-start;margin-bottom:16px;}',
      '.qro-form-item .qro-form-label{width:100px;flex:none;text-align:right;padding-right:8px;color:rgba(0,0,0,0.88);font-size:14px;line-height:32px;}',
      '.qro-form-item .qro-form-label.qro-required::before{content:"*";color:#ff4d4f;margin-right:4px;}',
      '.qro-form-item .qro-form-control{flex:1;}',
      '.qro-form-item textarea{width:100%;min-height:88px;padding:4px 11px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;outline:none;resize:vertical;font-family:inherit;box-sizing:border-box;}',
      '.qro-form-item textarea:focus{border-color:#2885ff;}',
      '.qro-form-item input[type=text]{width:100%;height:32px;padding:4px 11px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;outline:none;box-sizing:border-box;}',
      '.qro-form-item input[type=text]:focus{border-color:#2885ff;}',
      '.qro-radio-line{display:inline-flex;align-items:center;height:32px;font-size:14px;cursor:pointer;margin-right:24px;}',
      '.qro-radio-line .qro-radio-dot{width:16px;height:16px;border:1px solid #d9d9d9;border-radius:50%;margin-right:8px;position:relative;background:#fff;flex:none;}',
      '.qro-radio-line.qro-radio-checked .qro-radio-dot{border-color:#1677ff;}',
      '.qro-radio-line.qro-radio-checked .qro-radio-dot::after{content:"";position:absolute;left:3px;top:3px;width:8px;height:8px;border-radius:50%;background:#1677ff;}',
      /* 空态 */
      '.qro-empty{padding:32px 0;text-align:center;color:rgba(0,0,0,0.25);font-size:14px;}',
      /* tooltip icon */
      '.qro-tip-icon{display:inline-flex;margin-left:4px;color:rgba(0,0,0,0.45);cursor:help;position:relative;}',
      '.qro-tip-icon:hover .qro-tip-pop{display:block;}',
      '.qro-tip-pop{display:none;position:absolute;top:22px;left:0;z-index:20;max-width:280px;padding:6px 8px;background:rgba(0,0,0,0.85);border-radius:4px;color:#fff;font-size:12px;line-height:20px;white-space:normal;text-align:left;font-weight:400;}',
      /* toast */
      '.qro-toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:12000;padding:9px 16px;background:#fff;border-radius:8px;box-shadow:0 6px 16px rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);font-size:14px;color:rgba(0,0,0,0.88);display:flex;align-items:center;}',
      '.qro-toast .qro-toast-dot{width:8px;height:8px;border-radius:50%;margin-right:8px;}',
      /* 线索表格搜索区 */
      '.qro-search-bar{display:flex;flex-wrap:wrap;gap:8px 16px;padding:16px 32px 0;}',
      '.qro-search-bar .qro-search-item{display:flex;align-items:center;font-size:14px;}',
      '.qro-search-bar .qro-search-label{color:rgba(0,0,0,0.88);margin-right:8px;white-space:nowrap;}',
      '.qro-search-bar select{height:32px;min-width:120px;border:1px solid #d9d9d9;border-radius:6px;padding:0 8px;font-size:14px;background:#fff;outline:none;}',
      '.qro-search-bar select:focus{border-color:#2885ff;}',
      /* 响应式 */
      '@media (max-width: 1200px){.qro-overview{grid-template-columns:repeat(2,1fr);}.qro-box-row{grid-template-columns:1fr;}}',
      '@media (max-width: 800px){.qro-overview{grid-template-columns:1fr;padding:16px;}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ==================== 确定性伪随机工具 ====================
  function qroRnd(seed) {
    var h = 5381;
    for (var i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) % 100003;
    var x = Math.sin(h + 1) * 10000;
    return x - Math.floor(x);
  }
  function qroInt(seed, min, max) { return Math.floor(qroRnd(seed) * (max - min + 1)) + min; }
  function qroFixed(seed, min, max, digits) { return +(qroRnd(seed) * (max - min) + min).toFixed(digits == null ? 2 : digits); }

  // ==================== 质检模型（对齐 qcConfig 三级结构） ====================
  var qroQualityMode = [
    {
      firstSortCode: 'FS001', firstSortName: '客服规范', firstSortPercent: 40,
      secondSorts: [
        { secondSortCode: 'SS001', secondSortName: '服务禁语', thirdSorts: [
          { thirdSortCode: 'TS001', thirdSortName: '辱骂客户', thirdSortDesc: '通话中出现辱骂、贬低客户的用语' },
          { thirdSortCode: 'TS002', thirdSortName: '不文明用语', thirdSortDesc: '通话中出现不文明、不礼貌的口头用语' },
          { thirdSortCode: 'TS003', thirdSortName: '服务忌语', thirdSortDesc: '使用"不知道""不归我管"等服务禁语' }
        ] },
        { secondSortCode: 'SS002', secondSortName: '服务态度', thirdSorts: [
          { thirdSortCode: 'TS004', thirdSortName: '语气生硬', thirdSortDesc: '与客户沟通时语气冷淡、生硬' },
          { thirdSortCode: 'TS005', thirdSortName: '缺乏耐心', thirdSortDesc: '客户反复询问时表现出不耐烦' }
        ] }
      ]
    },
    {
      firstSortCode: 'FS002', firstSortName: '专业能力', firstSortPercent: 25,
      secondSorts: [
        { secondSortCode: 'SS003', secondSortName: '产品知识', thirdSorts: [
          { thirdSortCode: 'TS006', thirdSortName: '车型配置讲解错误', thirdSortDesc: '向客户讲解车型配置、参数时出现错误' },
          { thirdSortCode: 'TS007', thirdSortName: '价格政策解读错误', thirdSortDesc: '向客户解读价格、金融政策时出现错误' }
        ] },
        { secondSortCode: 'SS004', secondSortName: '竞品应对', thirdSorts: [
          { thirdSortCode: 'TS008', thirdSortName: '贬低竞品', thirdSortDesc: '通过贬低竞品车型引导客户' },
          { thirdSortCode: 'TS009', thirdSortName: '竞品参数错误', thirdSortDesc: '向客户介绍竞品参数时出现错误' }
        ] }
      ]
    },
    {
      firstSortCode: 'FS003', firstSortName: '流程规范', firstSortPercent: 20,
      secondSorts: [
        { secondSortCode: 'SS005', secondSortName: '开场规范', thirdSorts: [
          { thirdSortCode: 'TS010', thirdSortName: '未自报家门', thirdSortDesc: '开场未说明所属经销商及本人身份' },
          { thirdSortCode: 'TS011', thirdSortName: '未说明来意', thirdSortDesc: '开场未说明本次外呼的目的' }
        ] },
        { secondSortCode: 'SS006', secondSortName: '结束规范', thirdSorts: [
          { thirdSortCode: 'TS012', thirdSortName: '未确认后续安排', thirdSortDesc: '结束前未与客户确认下次跟进安排' },
          { thirdSortCode: 'TS013', thirdSortName: '未礼貌结束', thirdSortDesc: '通话结束时未使用礼貌结束语' }
        ] }
      ]
    },
    {
      firstSortCode: 'FS004', firstSortName: '信息安全', firstSortPercent: 15,
      secondSorts: [
        { secondSortCode: 'SS007', secondSortName: '客户信息', thirdSorts: [
          { thirdSortCode: 'TS014', thirdSortName: '泄露客户隐私', thirdSortDesc: '向无关方透露客户个人信息' },
          { thirdSortCode: 'TS015', thirdSortName: '违规索取信息', thirdSortDesc: '向客户索取与业务无关的个人信息' }
        ] },
        { secondSortCode: 'SS008', secondSortName: '合规红线', thirdSorts: [
          { thirdSortCode: 'TS016', thirdSortName: '违规承诺', thirdSortDesc: '向客户做出无法兑现的承诺' },
          { thirdSortCode: 'TS017', thirdSortName: '夸大宣传', thirdSortDesc: '夸大车型性能、权益或优惠' }
        ] }
      ]
    }
  ];

  // 全部节点扁平列表（含父节点），供树形选择/动态列使用
  function qroAllModeNodes() {
    var nodes = [];
    qroQualityMode.forEach(function (first) {
      nodes.push({ value: first.firstSortCode, label: first.firstSortName });
      first.secondSorts.forEach(function (second) {
        nodes.push({ value: second.secondSortCode, label: second.secondSortName });
        second.thirdSorts.forEach(function (third) {
          nodes.push({ value: third.thirdSortCode, label: third.thirdSortName });
        });
      });
    });
    return nodes;
  }

  // ==================== 演示数据生成（对齐 API 返回结构） ====================
  // queryQualtyOverview：[{name, score, scorePre, remark}]
  function qroGetOverview(params) {
    var seed = (params.startTime || '') + (params.endTime || '') + (params.seatIds || '') + (params.seriesCodes || '');
    var defs = [
      { name: '线索总量', remark: '筛选时间内接收到的新增线索总量', base: 8600, digits: 0 },
      { name: '诊断线索总量', remark: '筛选时间内完成AI质检诊断的线索总量', base: 7420, digits: 0 },
      { name: '质检均分', remark: '筛选时间内全部诊断线索的质检总分平均值（满分100分）', base: 86.5, digits: 1 },
      { name: '平均通话时长', remark: '筛选时间内诊断线索的平均单次通话时长（单位：秒）', base: 128, digits: 0 }
    ];
    return defs.map(function (d, i) {
      var v = qroFixed(seed + '_ov' + i, d.base * 0.85, d.base * 1.12, d.digits);
      var pre = qroFixed(seed + '_ovpre' + i, -8.5, 12.6, 1);
      return { name: d.name, score: (d.digits === 0 ? Math.round(v) : v), scorePre: pre, remark: d.remark };
    });
  }

  // queryQualtySorce：一级分类 weightedScore → score = weightedScore/firstSortPercent*100
  function qroGetSorce(params) {
    var seed = (params.startTime || '') + (params.endTime || '') + (params.seatIds || '') + (params.seriesCodes || '');
    return qroQualityMode.map(function (first) {
      var weighted = qroFixed(seed + '_sc_' + first.firstSortCode, first.firstSortPercent * 0.62, first.firstSortPercent * 0.97, 2);
      var secondSorts = first.secondSorts.map(function (second) {
        var sw = qroFixed(seed + '_sc_' + first.firstSortCode + '_' + second.secondSortCode, 0, first.firstSortPercent * 0.55, 2);
        var thirdSorts = second.thirdSorts.map(function (third) {
          var tw = qroFixed(seed + '_sc_' + third.thirdSortCode, 0, first.firstSortPercent * 0.3, 2);
          var tp = qroFixed(seed + '_tp_' + third.thirdSortCode, 4, 12, 1);
          return { thirdSortCode: third.thirdSortCode, thirdSortName: third.thirdSortName, thirdSortDesc: third.thirdSortDesc, weightedScore: tw, thirdSortPercent: tp };
        });
        var sp = qroFixed(seed + '_sp_' + second.secondSortCode, 8, 20, 1);
        return { secondSortCode: second.secondSortCode, secondSortName: second.secondSortName, weightedScore: sw, secondSortPercent: sp, thirdSorts: thirdSorts };
      });
      return {
        firstSortCode: first.firstSortCode, firstSortName: first.firstSortName,
        weightedScore: weighted, firstSortPercent: first.firstSortPercent,
        score: Math.ceil(weighted / first.firstSortPercent * 100 * 100) / 100,
        secondSorts: secondSorts
      };
    });
  }

  // queryQualtyTrend：[{date, weightedScore, qcConfigDtos}]
  function qroGetTrend(params, dateType) {
    var seed = (params.startTime || '') + (params.endTime || '') + '_t' + dateType;
    var start = params.startTime ? new Date(params.startTime.replace(/-/g, '/')) : new Date();
    var end = params.endTime ? new Date(params.endTime.replace(/-/g, '/')) : new Date();
    var dates = [];
    if (dateType === 1) {
      var d = new Date(start);
      while (d <= end) {
        dates.push(d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2));
        d.setDate(d.getDate() + 1);
      }
    } else {
      var bucket = dateType === 2 ? 7 : 30;
      var cursor = new Date(start);
      while (cursor <= end) {
        dates.push(cursor.getFullYear() + '-' + ('0' + (cursor.getMonth() + 1)).slice(-2) + (dateType === 2 ? '-' + ('0' + cursor.getDate()).slice(-2) : ''));
        cursor.setDate(cursor.getDate() + bucket);
      }
    }
    return dates.map(function (date) {
      var total = qroFixed(seed + date + '_total', 72, 95, 2);
      var qcConfigDtos = qroQualityMode.map(function (first) {
        return {
          firstSortCode: first.firstSortCode, weightedScore: qroFixed(seed + date + '_' + first.firstSortCode, first.firstSortPercent * 0.6, first.firstSortPercent * 0.97, 2),
          secondSorts: first.secondSorts.map(function (second) {
            return { secondSortCode: second.secondSortCode, weightedScore: qroFixed(seed + date + '_' + second.secondSortCode, 0, first.firstSortPercent * 0.5, 2), thirdSorts: [] };
          })
        };
      });
      return { date: date, weightedScore: total, qcConfigDtos: qcConfigDtos };
    });
  }

  // 坐席数据（复用排班模块账号体系）
  var qroSeats = [
    { account: '1005641', name: '张伟' }, { account: '1005642', name: '李娜' },
    { account: '1005643', name: '王强' }, { account: '1005644', name: '刘芳' },
    { account: '1005645', name: '陈明' }, { account: '1005646', name: '赵丽' },
    { account: '1005647', name: '孙鹏' }, { account: '1005648', name: '周婷' }
  ];

  // queryQualtyStuff：每坐席行数据（对齐可见列）
  function qroGetStuffRows(params) {
    var seed = (params.startTime || '') + (params.endTime || '') + (params.seatIds || '') + (params.seriesCodes || '');
    var seatFilter = (params.seatIds || '').split(',').filter(Boolean);
    var seats = seatFilter.length ? qroSeats.filter(function (s) { return seatFilter.indexOf(s.account) >= 0; }) : qroSeats;
    return seats.map(function (seat) {
      var dial = qroInt(seed + seat.account + '_dial', 180, 520);
      var conn = Math.round(dial * qroFixed(seed + seat.account + '_rate', 0.45, 0.82, 2));
      var avgSec = qroInt(seed + seat.account + '_avg', 45, 260);
      var avgTxt = Math.floor(avgSec / 60) + "'" + ('0' + (avgSec % 60)).slice(-2) + '"';
      var validRate = qroFixed(seed + seat.account + '_valid', 35, 92, 2) + '%';
      var diag = qroInt(seed + seat.account + '_diag', Math.round(conn * 0.4), conn);
      var scoreMap = {};
      var total = 0;
      qroQualityMode.forEach(function (first) {
        scoreMap[first.firstSortCode] = qroFixed(seed + seat.account + '_s_' + first.firstSortCode, first.firstSortPercent * 0.6, first.firstSortPercent * 0.98, 2);
        total += scoreMap[first.firstSortCode];
        first.secondSorts.forEach(function (second) {
          scoreMap[second.secondSortCode] = qroFixed(seed + seat.account + '_s_' + second.secondSortCode, 0, first.firstSortPercent * 0.55, 2);
          second.thirdSorts.forEach(function (third) {
            scoreMap[third.thirdSortCode] = qroFixed(seed + seat.account + '_s_' + third.thirdSortCode, 0, 6, 2);
          });
        });
      });
      return {
        seatName: seat.name, connCount: conn, dialCount: dial, avgDuration: avgTxt,
        validRate: validRate, diagCount: diag, scoreMap: scoreMap, totalScore: total.toFixed(2)
      };
    });
  }

  // 字典（对齐 dictOptPullDownList）
  var qroSourceDict = [
    { code: 'SRC001', name: '懂车帝' }, { code: 'SRC002', name: '汽车之家' }, { code: 'SRC003', name: '易车网' },
    { code: 'SRC004', name: '抖音' }, { code: 'SRC005', name: '官网留资' }, { code: 'SRC006', name: '垂直媒体' }
  ];
  var qroSeriesOptions = [
    { value: 'ARIA', label: 'ARIYA艾睿雅' }, { value: 'SYLPHY', label: '轩逸' }, { value: 'QASHQAI', label: '逍客' },
    { value: 'TEANA', label: '天籁' }, { value: 'XTRAIL', label: '奇骏' }, { value: 'PATHFINDER', label: '探陆' }
  ];
  var qroClueTypes = ['首次咨询', '再次咨询', '试驾预约', '订单线索'];

  // queryQualtyClue：rows + records
  function qroGetClueRows(params) {
    var seed = (params.startTime || '') + (params.endTime || '') + (params.seatIds || '') + (params.seriesCodes || '');
    var total = 57;
    var list = [];
    for (var i = 0; i < total; i++) {
      var id = 'HD2026' + ('000' + (1000 + i)).slice(-7);
      var seat = qroSeats[qroInt(seed + id + '_seat', 0, qroSeats.length - 1)];
      var series = qroSeriesOptions[qroInt(seed + id + '_series', 0, qroSeriesOptions.length - 1)];
      var follow = qroInt(seed + id + '_follow', 1, 6);
      var durSec = qroInt(seed + id + '_dur', 60, 2100);
      var scoreMap = {};
      var t = 0;
      qroQualityMode.forEach(function (first) {
        scoreMap[first.firstSortCode] = qroFixed(seed + id + '_s_' + first.firstSortCode, first.firstSortPercent * 0.58, first.firstSortPercent * 0.99, 1);
        t += scoreMap[first.firstSortCode];
        first.secondSorts.forEach(function (second) { scoreMap[second.secondSortCode] = qroFixed(seed + id + '_s_' + second.secondSortCode, 0, first.firstSortPercent * 0.5, 1); });
      });
      var day1 = qroInt(seed + id + '_d1', 1, 8);
      var day2 = qroInt(seed + id + '_d2', 1, 6);
      list.push({
        hdClueId: id,
        custName: ['王先生', '李女士', '张先生', '刘女士', '陈先生', '杨女士', '赵先生', '周女士'][qroInt(seed + id + '_cust', 0, 7)],
        custTel: '1' + ['35', '36', '37', '38', '39'][qroInt(seed + id + '_tel1', 0, 4)] + '****' + ('000' + qroInt(seed + id + '_tel2', 100, 999)).slice(-4),
        clueType: qroClueTypes[qroInt(seed + id + '_type', 0, qroClueTypes.length - 1)],
        clueSource: qroSourceDict[qroInt(seed + id + '_src', 0, qroSourceDict.length - 1)].code,
        rchannelName: ['R1-懂车帝留资', 'R2-汽车之家留资', 'R3-官网表单', 'R4-活动报名'][qroInt(seed + id + '_rch', 0, 3)],
        seriesName: series.label,
        seatName: seat.name,
        appealCnt: qroInt(seed + id + '_appeal', 0, 5),
        firstReviewTime: '2026-10-' + ('0' + day1).slice(-2) + ' ' + ('0' + qroInt(seed + id + '_h1', 9, 18)).slice(-2) + ':' + ('0' + qroInt(seed + id + '_m1', 0, 59)).slice(-2),
        lastReviewTime: '2026-10-' + ('0' + (day1 + day2)).slice(-2) + ' ' + ('0' + qroInt(seed + id + '_h2', 9, 20)).slice(-2) + ':' + ('0' + qroInt(seed + id + '_m2', 0, 59)).slice(-2),
        followTimes: follow,
        callDuration: Math.floor(durSec / 60) + '分' + (durSec % 60) + '秒',
        isCheck: qroRnd(seed + id + '_chk') > 0.7,
        scoreMap: scoreMap, propertyScoreList: [t.toFixed(1)],
        seedKey: seed + id
      });
    }
    return { rows: list, records: list.length };
  }

  // 会话记录（对齐 transTextJson.Sentences：SpeakerId 1销售 2客户）
  function qroGetChatSentences(seedKey) {
    var salesLines = [
      '您好，这里是东风日产ARIYA艾睿雅体验中心，我是您的专属顾问，请问您现在方便接听电话吗？',
      '好的，您之前在懂车帝上留资咨询了ARIYA艾睿雅这款车型，想跟您同步一下近期的试驾活动。',
      'ARIYA艾睿雅目前有两驱和四驱版本可选，CLTC续航最高可以达到623公里，满足日常通勤和周末出游都没有问题。',
      '本月我们有厂家直补的活动，下定可以享受金融贴息，首付最低15%起，您有兴趣可以到店详细聊聊。',
      '嗯，您说的充电问题不用担心，现在购车会赠送家用充电桩和安装服务，公共充电也很方便。',
      '好的，那我跟您约到店试驾的时间，您看这周六上午或者下午哪个时间更方便？',
      '没问题，我这边先帮您预约周六上午10点，试驾前我会再跟您电话确认，感谢您的接听，祝您生活愉快。'
    ];
    var custLines = [
      '你好，你说，我大概有十分钟时间。',
      '对，我前段时间看过这个车，续航是多少来着？',
      '623公里还可以，那冬天开空调会掉多少？',
      '现在买有什么优惠吗？我比较关心落地价。',
      '充电桩是免费送的吗？装在自己车位要另外收费吗？',
      '周六上午可以，你们店在哪个位置？我导航过去。',
      '行，那就先这样，到时候我过去试驾一下再定。'
    ];
    var out = [];
    var n = qroInt(seedKey + '_chatn', 8, 12);
    for (var i = 0; i < n; i++) {
      var isSales = i % 2 === 0;
      out.push({ SpeakerId: isSales ? '1' : '2', Text: (isSales ? salesLines : custLines)[Math.floor(i / 2) % 7] });
    }
    return out;
  }

  // 结论标签（对齐 conclusion 二维数组分组，DescComponent items {key,value}）
  function qroGetConclusion(seedKey) {
    return [
      [
        { key: '意向等级', value: 'A级（高意向）' },
        { key: '试驾安排', value: '本周六上午到店试驾' },
        { key: '关注车型', value: 'ARIYA艾睿雅 四驱长续航版' }
      ],
      [
        { key: '核心关注点', value: '续航里程、落地价格、充电设施' },
        { key: '金融方案', value: '关注首付比例与厂家贴息政策' }
      ],
      [
        { key: '竞品对比', value: '特斯拉Model Y、比亚迪宋PLUS EV' },
        { key: '主要异议', value: '冬季续航衰减、二手车保值率' }
      ]
    ];
  }

  // ==================== Toast（对齐 antd message） ====================
  function qroToast(text, type) {
    var old = document.querySelector('.qro-toast');
    if (old) old.remove();
    var el = document.createElement('div');
    el.className = 'qro-toast';
    var color = type === 'warn' ? '#faad14' : type === 'error' ? '#ff4d4f' : '#52c41a';
    el.innerHTML = '<span class="qro-toast-dot" style="background:' + color + '"></span>' + qroEsc(text);
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2400);
  }

  function qroEsc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ==================== 树形选择器（对齐 antd TreeSelect treeCheckable + treeCheckStrictly） ====================
  // treeData: [{title,value,children:[]}]；onChange(values) values 为 {value,label} 数组（labelInValue 形态）
  function qroTreeSelectCreate(opts) {
    var root = document.createElement('div');
    root.className = 'qro-treeselect';
    root.tabIndex = 0;
    var dropdown = document.createElement('div');
    dropdown.className = 'qro-tree-dropdown';
    dropdown.style.display = 'none';
    var state = {
      values: opts.value || [],           // [{value,label}]
      treeData: opts.treeData || [],
      expanded: {},                        // value -> true
      keyword: '',
      onTagRemove: opts.onTagRemove || null
    };
    state.treeData.forEach(function (n) { state.expanded[n.value] = true; qroTreeAllChildren(n).forEach(function (c) { state.expanded[c.value] = true; }); });

    function qroTreeAllChildren(node) {
      var out = [];
      (node.children || []).forEach(function (c) {
        out.push(c);
        out = out.concat(qroTreeAllChildren(c));
      });
      return out;
    }
    function qroTreeFind(nodes, value) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].value === value) return nodes[i];
        var hit = qroTreeFind(nodes[i].children || [], value);
        if (hit) return hit;
      }
      return null;
    }
    function qroTreeFlatten(nodes) {
      var out = [];
      nodes.forEach(function (n) {
        out.push({ title: n.title, value: n.value });
        out = out.concat(qroTreeFlatten(n.children || []));
      });
      return out;
    }

    function selectedValues() { return state.values.map(function (v) { return v.value; }); }

    function commitChange(newValues, suppress) {
      state.values = newValues;
      renderTags();
      if (!suppress) opts.onChange(newValues);
    }

    function toggleCheck(value) {
      var has = selectedValues().indexOf(value) >= 0;
      // 全选节点的特殊规则由 opts.onBeforeChange 处理
      var next = state.values.slice();
      if (has) {
        next = next.filter(function (v) { return v.value !== value; });
      } else {
        var node = qroTreeFind(state.treeData, value);
        if (node) next.push({ value: node.value, label: node.title });
      }
      if (opts.onBeforeChange) {
        var res = opts.onBeforeChange(next, state.values);
        if (res === false) return;
        next = res || next;
      }
      commitChange(next);
    }

    function matchFilter(node, parents) {
      if (!state.keyword) return { show: true, parents: parents };
      var kw = state.keyword.toLowerCase();
      if ((node.title || '').toLowerCase().indexOf(kw) >= 0) return { show: true, parents: parents };
      var childHit = false;
      (node.children || []).forEach(function (c) {
        if (matchFilter(c, parents.concat(node)).show) childHit = true;
      });
      return { show: childHit, parents: parents };
    }

    function renderDropdown() {
      var html = '<input class="qro-tree-search" placeholder="请输入关键字" />';
      html += '<div class="qro-tree-list"></div>';
      dropdown.innerHTML = html;
      var listEl = dropdown.querySelector('.qro-tree-list');
      var sel = selectedValues();

      function renderNodes(nodes, depth) {
        nodes.forEach(function (node) {
          var m = matchFilter(node, []);
          if (!m.show) return;
          var children = node.children || [];
          var hasChildren = children.length > 0;
          var expanded = state.expanded[node.value] !== false;
          if (state.keyword) expanded = true;
          var checked = sel.indexOf(node.value) >= 0;
          var row = document.createElement('div');
          row.className = 'qro-tree-node';
          row.style.paddingLeft = (8 + depth * 18) + 'px';
          row.innerHTML =
            '<span class="qro-tree-switcher">' + (hasChildren ? (expanded ? '▾' : '▸') : '') + '</span>' +
            '<span class="qro-tree-checkbox' + (checked ? ' qro-checked' : '') + '"></span>' +
            '<span class="qro-tree-label" title="' + qroEsc(node.title) + '">' + qroEsc(node.title) + '</span>';
          if (hasChildren) {
            row.querySelector('.qro-tree-switcher').addEventListener('click', function (e) {
              e.stopPropagation();
              state.expanded[node.value] = !expanded;
              renderDropdown();
            });
          }
          row.addEventListener('click', function () { toggleCheck(node.value); });
          listEl.appendChild(row);
          if (hasChildren && expanded) renderNodes(children, depth + 1);
        });
      }
      renderNodes(state.treeData, 0);
      dropdown.querySelector('.qro-tree-search').addEventListener('input', function (e) {
        state.keyword = e.target.value.trim();
        renderDropdown();
        var inp = dropdown.querySelector('.qro-tree-search');
        inp.value = state.keyword;
        inp.focus();
      });
    }

    function renderTags() {
      var html = '';
      var vals = state.values;
      if (!vals.length) {
        html = '<span class="qro-placeholder">' + qroEsc(opts.placeholder || '请选择') + '</span>';
      } else {
        var show = vals.slice(0, 2);
        show.forEach(function (v) {
          html += '<span class="qro-tag" data-v="' + qroEsc(v.value) + '">' + qroEsc(v.label) + '<i class="qro-tag-close">×</i></span>';
        });
        if (vals.length > 2) html += '<span class="qro-tag-rest">+' + (vals.length - 2) + '...</span>';
      }
      html += '<span class="qro-arrow">▾</span>';
      root.innerHTML = html;
      root.querySelectorAll('.qro-tag .qro-tag-close').forEach(function (close) {
        close.addEventListener('click', function (e) {
          e.stopPropagation();
          var v = close.parentNode.getAttribute('data-v');
          toggleCheck(v);
        });
      });
    }

    function openDropdown() {
      if (dropdown.style.display !== 'none') return;
      state.keyword = '';
      renderDropdown();
      dropdown.style.display = 'block';
      var rect = root.getBoundingClientRect();
      var top = rect.bottom + 4;
      if (top + 340 > window.innerHeight) top = Math.max(8, rect.top - 324);
      dropdown.style.top = top + 'px';
      dropdown.style.left = Math.min(rect.left, window.innerWidth - 308) + 'px';
      root.classList.add('qro-focused');
      setTimeout(function () { dropdown.querySelector('.qro-tree-search')?.focus(); }, 0);
    }
    function closeDropdown() {
      dropdown.style.display = 'none';
      root.classList.remove('qro-focused');
    }

    root.addEventListener('click', function (e) {
      if (e.target.closest('.qro-tag-close')) return;
      if (dropdown.style.display === 'none') openDropdown(); else closeDropdown();
    });
    document.addEventListener('click', function (e) {
      if (!root.contains(e.target) && !dropdown.contains(e.target)) closeDropdown();
    });

    renderTags();
    return {
      root: root,
      dropdown: dropdown,
      getValues: function () { return state.values.slice(); },
      setValues: function (vals) { commitChange(vals, true); },
      setTreeData: function (treeData) {
        state.treeData = treeData;
        state.treeData.forEach(function (n) { state.expanded[n.value] = true; qroTreeAllChildren(n).forEach(function (c) { state.expanded[c.value] = true; }); });
        if (dropdown.style.display !== 'none') renderDropdown();
      }
    };
  }

  // 质检模型 → 树数据（全选 + 质检总分 + 模型层级，对齐 convertQualityModeToTreeData）
  function qroBuildModeTree() {
    var firstChildren = qroQualityMode.map(function (first) {
      return {
        title: first.firstSortName, value: first.firstSortCode, key: first.firstSortCode,
        children: first.secondSorts.map(function (second) {
          return {
            title: second.secondSortName, value: second.secondSortCode, key: second.secondSortCode,
            children: second.thirdSorts.map(function (third) {
              return { title: third.thirdSortName, value: third.thirdSortCode, key: third.thirdSortCode, children: [] };
            })
          };
        })
      };
    });
    return [
      { title: '全选', value: 'selectAll', key: 'selectAll', children: [] },
      { title: '质检总分', value: '质检总分', key: '质检总分', children: firstChildren }
    ];
  }

  // 全选/必选规则（对齐坐席表/线索表 onChange）
  function qroTreeGuard(requireTotal) {
    return function (next, prev) {
      var hasSelectAll = next.some(function (i) { return i.value === 'selectAll'; });
      var hadSelectAll = prev.some(function (i) { return i.value === 'selectAll'; });
      if (hasSelectAll && !hadSelectAll) {
        var all = [{ value: 'selectAll', label: '全选' }, { value: '质检总分', label: '质检总分' }];
        qroTreeFlattenForGuard(qroBuildModeTree()).forEach(function (n) {
          if (n.value !== 'selectAll' && n.value !== '质检总分') all.push({ value: n.value, label: n.label });
        });
        return all;
      }
      if (!hasSelectAll && hadSelectAll) {
        return [{ value: '质检总分', label: '质检总分' }];
      }
      if (requireTotal && !next.some(function (i) { return i.value === '质检总分'; })) {
        qroToast('"质检总分"为必选项，不能取消选择', 'warn');
        return false;
      }
      if (next.length === 0) {
        qroToast('至少需要保留一个诊断项', 'warn');
        return false;
      }
      return next;
    };
  }
  // 折线图版（质检总分非必选）
  function qroTreeGuardLine() {
    return function (next, prev) {
      var hasSelectAll = next.some(function (i) { return i.value === 'selectAll'; });
      var hadSelectAll = prev.some(function (i) { return i.value === 'selectAll'; });
      if (hasSelectAll && !hadSelectAll) {
        var all = [{ value: 'selectAll', label: '全选' }];
        qroTreeFlattenForGuard(qroBuildModeTree()).forEach(function (n) {
          if (n.value !== 'selectAll') all.push({ value: n.value, label: n.label });
        });
        return all;
      }
      if (!hasSelectAll && hadSelectAll) {
        return [{ value: '质检总分', label: '质检总分' }];
      }
      if (next.length === 0) {
        qroToast('至少需要保留一个诊断项', 'warn');
        return false;
      }
      return next;
    };
  }
  function qroTreeFlattenForGuard(nodes) {
    var out = [];
    nodes.forEach(function (n) {
      if (n.value !== 'selectAll') out.push({ value: n.value, label: n.title });
      out = out.concat(qroTreeFlattenForGuard(n.children || []));
    });
    return out;
  }

  // ==================== 原生 canvas 雷达图（对齐 echarts radar 配置） ====================
  function qroDrawRadar(canvas, indicators, values, opts) {
    opts = opts || {};
    var cssW = canvas.parentNode ? canvas.parentNode.clientWidth || 400 : 400;
    var cssH = opts.height || 320;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var cx = cssW / 2, cy = cssH * 0.55; // center ['50%','55%']
    var radius = Math.min(cssH * 0.55, cssW / 2 - 80) * 0.86; // radius 70% 留出标签空间
    var n = indicators.length;
    if (!n) return;
    var maxV = 100;

    var angle = function (i) { return -Math.PI / 2 + i * 2 * Math.PI / n; };

    // 分割线（4 层）+ 轴线
    ctx.strokeStyle = '#e6e8eb';
    ctx.lineWidth = 1;
    for (var ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var a = angle(i % n);
        var r = radius * ring / 4;
        var x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (var i2 = 0; i2 < n; i2++) {
      var a2 = angle(i2);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(a2), cy + radius * Math.sin(a2));
      ctx.stroke();
    }

    // 数据区域（areaStyle rgba(40,133,255,0.20)）
    ctx.beginPath();
    for (var i3 = 0; i3 <= n; i3++) {
      var idx = i3 % n;
      var a3 = angle(idx);
      var r3 = radius * Math.min(Math.max(values[idx] / maxV, 0), 1);
      var x3 = cx + r3 * Math.cos(a3), y3 = cy + r3 * Math.sin(a3);
      if (i3 === 0) ctx.moveTo(x3, y3); else ctx.lineTo(x3, y3);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(40,133,255,0.20)';
    ctx.fill();
    ctx.strokeStyle = '#2885ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 数据点（itemStyle #2885ff）
    for (var i4 = 0; i4 < n; i4++) {
      var a4 = angle(i4);
      var r4 = radius * Math.min(Math.max(values[i4] / maxV, 0), 1);
      var x4 = cx + r4 * Math.cos(a4), y4 = cy + r4 * Math.sin(a4);
      ctx.beginPath();
      ctx.arc(x4, y4, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#2885ff';
      ctx.fill();
    }

    // 指标名称（两行富文本：分类名 16px bold + "100分" 15px，色 #01123A）
    ctx.textAlign = 'center';
    for (var i5 = 0; i5 < n; i5++) {
      var a5 = angle(i5);
      var lx = cx + (radius + 14) * Math.cos(a5);
      var ly = cy + (radius + 14) * Math.sin(a5);
      ctx.fillStyle = '#01123A';
      ctx.font = 'bold 15px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textBaseline = 'bottom';
      ctx.fillText(indicators[i5].title, lx, ly);
      ctx.font = '14px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(indicators[i5].sub, lx, ly + 2);
    }
  }

  // ==================== 原生 canvas 折线图（对齐 echarts line 配置） ====================
  var QRO_LINE_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
  function qroDrawLineChart(canvas, xLabels, seriesArr, opts) {
    opts = opts || {};
    var cssW = canvas.parentNode ? canvas.parentNode.clientWidth || 800 : 800;
    var cssH = opts.height || 340;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var padL = 46, padR = 16, padT = 40, padB = 30;
    var plotW = cssW - padL - padR, plotH = cssH - padT - padB;

    // 计算最大值
    var maxV = 0, minV = Infinity;
    seriesArr.forEach(function (s) { s.data.forEach(function (v) { if (v > maxV) maxV = v; if (v < minV) minV = v; }); });
    if (!isFinite(minV)) { minV = 0; maxV = 100; }
    if (maxV === minV) maxV = minV + 10;
    var range = maxV - minV;
    maxV = maxV + range * 0.1;
    minV = Math.max(0, minV - range * 0.1);

    var n = xLabels.length;
    var xAt = function (i) { return padL + (n <= 1 ? plotW / 2 : plotW * i / (n - 1)); };
    var yAt = function (v) { return padT + plotH - plotH * (v - minV) / (maxV - minV); };

    // 网格 + y 轴刻度（5 段）
    ctx.strokeStyle = '#e6e8eb';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.font = '12px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (var g = 0; g <= 5; g++) {
      var gv = minV + (maxV - minV) * g / 5;
      var gy = yAt(gv);
      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(cssW - padR, gy);
      ctx.stroke();
      ctx.fillText(Math.round(gv * 10) / 10, padL - 6, gy);
    }

    // x 轴标签
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var step = Math.ceil(n / Math.max(1, Math.floor(plotW / 80)));
    for (var i = 0; i < n; i += step) {
      ctx.fillText(xLabels[i], xAt(i), padT + plotH + 8);
    }

    // legend 右上（scroll 型，超出省略）
    ctx.textBaseline = 'middle';
    var lx = cssW - padR;
    var legendSlots = Math.max(1, Math.floor((cssW - padL - padR) / 96));
    seriesArr.slice(0, legendSlots).forEach(function (s, si) {
      var color = QRO_LINE_COLORS[si % QRO_LINE_COLORS.length];
      var text = s.name;
      ctx.font = '12px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
      var tw = ctx.measureText(text).width;
      lx -= tw;
      ctx.fillStyle = color;
      ctx.fillRect(lx, padT - 20, 20, 3);
      ctx.fillStyle = '#666';
      ctx.fillText(text, lx + 24, padT - 18);
      lx -= 32;
    });
    if (seriesArr.length > legendSlots) {
      ctx.fillStyle = '#999';
      ctx.fillText('…', lx - 4, padT - 18);
    }

    // 平滑折线（smooth 贝塞尔近似）
    seriesArr.forEach(function (s, si) {
      var color = QRO_LINE_COLORS[si % QRO_LINE_COLORS.length];
      var pts = s.data.map(function (v, i) { return { x: xAt(i), y: yAt(v) }; });
      ctx.beginPath();
      pts.forEach(function (p, i) {
        if (i === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          var prev = pts[i - 1];
          var cxp = (prev.x + p.x) / 2;
          ctx.bezierCurveTo(cxp, prev.y, cxp, p.y, p.x, p.y);
        }
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      pts.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    // hover 竖线 + 浮层
    canvas.onmousemove = function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var idx = Math.round((mx - padL) / (n <= 1 ? 1 : (plotW / (n - 1))));
      if (idx < 0 || idx >= n) { canvas.onmouseout(); return; }
      ctx.clearRect(0, 0, cssW, cssH);
      qroDrawLineChart(canvas, xLabels, seriesArr, opts);
      var hx = xAt(idx);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(hx, padT);
      ctx.lineTo(hx, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      seriesArr.forEach(function (s, si) {
        var color = QRO_LINE_COLORS[si % QRO_LINE_COLORS.length];
        var py = yAt(s.data[idx]);
        ctx.beginPath();
        ctx.arc(hx, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      // tooltip
      var lines = [xLabels[idx]].concat(seriesArr.map(function (s, si) {
        return QRO_LINE_COLORS[si % QRO_LINE_COLORS.length] + '|' + s.name + ': ' + s.data[idx];
      }));
      ctx.font = '12px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
      var w = 0;
      lines.forEach(function (l) { w = Math.max(w, ctx.measureText(l.split('|')[1] || l).width); });
      w += 28;
      var h = lines.length * 20 + 12;
      var tx = hx + 12, ty = padT + 4;
      if (tx + w > cssW - padR) tx = hx - w - 12;
      ctx.fillStyle = 'rgba(255,255,255,0.96)';
      ctx.strokeStyle = '#e6e8eb';
      qroRoundRect(ctx, tx, ty, w, h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.textAlign = 'left';
      lines.forEach(function (l, li) {
        if (l.indexOf('|') >= 0) {
          var parts = l.split('|');
          ctx.fillStyle = parts[0];
          ctx.beginPath();
          ctx.arc(tx + 10, ty + 14 + li * 20, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#666';
          ctx.fillText(parts[1], tx + 18, ty + 14 + li * 20);
        } else {
          ctx.fillStyle = 'rgba(0,0,0,0.88)';
          ctx.font = '600 12px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
          ctx.fillText(l, tx + 8, ty + 14);
          ctx.font = '12px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
        }
      });
    };
    canvas.onmouseout = function () {
      qroDrawLineChart(canvas, xLabels, seriesArr, opts);
    };
  }

  function qroRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ==================== 页面状态 ====================
  var qroState = {
    params: { startTime: '', endTime: '', seatIds: '', seriesCodes: '' },
    dateType: 7,
    curFirstSortCode: '',
    curSecondSortCode: '',
    trendDateType: 1,
    workerValue: [{ value: '质检总分', label: '质检总分' }],
    clueValue: [{ value: '质检总分', label: '质检总分' }],
    workerPage: 1,
    workerPageSize: 10,
    workerSort: null,
    cluePage: 1,
    cluePageSize: 10,
    clueSearch: {},
    clueChecked: {},
    seriesSelected: [],
    seatSelected: []
  };

  function qroFmtDate(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function qroDateRange(days) {
    var end = new Date(); end.setDate(end.getDate() - 1);
    var start = new Date(); start.setDate(start.getDate() - days);
    return [qroFmtDate(start), qroFmtDate(end)];
  }

  // ==================== 页面主渲染 ====================
  function renderQualityReportOldPage() {
    qroEnsureStyles();
    var page = document.getElementById('qualityReportOldPage');
    if (!page) return;
    var initRange = qroDateRange(7);
    qroState.params.startTime = initRange[0] + ' 00:00:00';
    qroState.params.endTime = initRange[1] + ' 23:59:59';

    page.innerHTML =
      '<div class="qro-main">' +
        // ===== 筛选区（.top）=====
        '<div class="qro-top"><div class="qro-row"><div class="qro-left">' +
          '<div class="qro-form-row">' +
            '<div class="qro-form-item" id="qroDateTypeWrap"></div>' +
            '<div class="qro-form-item"><span class="qro-form-label">日期</span>' +
              '<input type="date" class="qro-input" id="qroStartDate" value="' + initRange[0] + '" />' +
              '<span style="padding:0 4px">~</span>' +
              '<input type="date" class="qro-input" id="qroEndDate" value="' + initRange[1] + '" /></div>' +
          '</div>' +
          '<div class="qro-form-row">' +
            '<div class="qro-form-item"><span class="qro-form-label">车系</span><div id="qroSeriesSelect"></div></div>' +
            '<div class="qro-form-item"><span class="qro-form-label">坐席账号</span><div id="qroSeatSelect"></div></div>' +
          '</div>' +
        '</div>' +
        '<div style="margin-top:6px">' +
          '<button class="qro-btn" id="qroResetBtn" style="margin-right:12px">重置</button>' +
          '<button class="qro-btn qro-btn-primary" id="qroQueryBtn">查询</button>' +
        '</div></div></div>' +
        // ===== 总览区 =====
        '<div class="qro-overview" id="qroOverview"></div>' +
        // ===== 员工质检 =====
        '<div class="qro-wrap"><div class="qro-header"><div class="qro-title">员工质检</div></div>' +
          '<div class="qro-box-row" style="padding:16px">' +
            '<div class="qro-box" style="background:#fafafa">' +
              '<div class="qro-box-title">质检得分</div>' +
              '<div style="height:360px;position:relative"><div id="qroRadarChart" style="width:100%;height:100%"></div></div>' +
            '</div>' +
            '<div class="qro-box" style="background:#fafafa">' +
              '<div class="qro-box-title">细项拆解</div>' +
              '<div id="qroFirstSortRadio"></div>' +
              '<div class="qro-tabs" id="qroSecondTabs"></div>' +
              '<div class="qro-progress-wrap" id="qroProgressWrap"></div>' +
            '</div>' +
          '</div></div>' +
        // ===== 数据趋势 =====
        '<div class="qro-wrap"><div class="qro-header">' +
          '<div class="qro-title">数据趋势</div>' +
          '<div style="display:flex;align-items:center">' +
            '<div id="qroTrendTree"></div>' +
            '<div class="qro-radio-group" id="qroTrendDateType" style="margin-left:12px">' +
              '<span class="qro-radio-btn qro-radio-checked" data-v="1">天</span>' +
              '<span class="qro-radio-btn" data-v="2">周</span>' +
              '<span class="qro-radio-btn" data-v="3">月</span>' +
            '</div>' +
          '</div></div>' +
          '<div class="qro-chart-wrap"><canvas id="qroTrendChart"></canvas></div></div>' +
        // ===== 员工诊断列表 =====
        '<div class="qro-wrap"><div class="qro-header">' +
          '<div class="qro-title">员工诊断列表</div>' +
          '<div style="display:flex;align-items:center">' +
            '<div id="qroWorkerTree"></div>' +
            '<button class="qro-link-btn" id="qroWorkerExport"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>导出数据</button>' +
          '</div></div>' +
          '<div class="qro-table-pad"><div class="qro-table-scroll" id="qroWorkerTableWrap"></div></div></div>' +
        // ===== 线索诊断列表 =====
        '<div class="qro-wrap">' +
          '<div class="qro-header"><div class="qro-title">线索诊断列表</div>' +
            '<div style="display:flex;align-items:center">' +
              '<button class="qro-link-btn" id="qroClueExport"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>导出数据</button>' +
              '<button class="qro-link-btn" id="qroClueExportDetail"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>导出质检明细</button>' +
            '</div></div>' +
          '<div class="qro-search-bar" id="qroClueSearchBar"></div>' +
          '<div class="qro-table-pad" style="padding-top:16px"><div class="qro-table-scroll" id="qroClueTableWrap"></div></div>' +
        '</div>' +
        '<div style="height:10px"></div>' +
      '</div>';

    qroInitTopFilters();
    qroInitTrendSection();
    qroInitWorkerSection();
    qroInitClueSection();
    qroRefreshOverview();
    qroRefreshSorce();
  }

  // ==================== 筛选区 ====================
  function qroInitTopFilters() {
    var wrap = document.getElementById('qroDateTypeWrap');
    wrap.innerHTML = '<div class="qro-radio-group">' +
      [ { v: 1, l: '昨天' }, { v: 7, l: '前7天' }, { v: 30, l: '前30天' } ].map(function (o) {
        return '<span class="qro-radio-btn' + (o.v === qroState.dateType ? ' qro-radio-checked' : '') + '" data-v="' + o.v + '">' + o.l + '</span>';
      }).join('') + '</div>';
    wrap.querySelectorAll('.qro-radio-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        wrap.querySelectorAll('.qro-radio-btn').forEach(function (b) { b.classList.remove('qro-radio-checked'); });
        btn.classList.add('qro-radio-checked');
        var days = +btn.getAttribute('data-v');
        qroState.dateType = days;
        var range = qroDateRange(days);
        document.getElementById('qroStartDate').value = range[0];
        document.getElementById('qroEndDate').value = range[1];
      });
    });
    [document.getElementById('qroStartDate'), document.getElementById('qroEndDate')].forEach(function (inp) {
      inp.addEventListener('change', function () {
        var wrapBtns = document.querySelectorAll('#qroDateTypeWrap .qro-radio-btn');
        wrapBtns.forEach(function (b) { b.classList.remove('qro-radio-checked'); });
      });
    });

    // 车系多选（对齐 Select multiple tag）
    qroInitMultiSelect('qroSeriesSelect', qroSeriesOptions, qroState.seriesSelected, function (vals) {
      qroState.seriesSelected = vals;
    }, '车系筛选');

    // 坐席账号多选（对齐 ProFormCascader：坐席名(账号)）
    var seatOpts = qroSeats.map(function (s) { return { value: s.account, label: s.name + '(' + s.account + ')' }; });
    qroInitMultiSelect('qroSeatSelect', seatOpts, qroState.seatSelected, function (vals) {
      qroState.seatSelected = vals;
    }, '请选择');

    document.getElementById('qroResetBtn').addEventListener('click', function () {
      var range = qroDateRange(7);
      qroState.dateType = 7;
      qroState.seriesSelected = [];
      qroState.seatSelected = [];
      document.getElementById('qroStartDate').value = range[0];
      document.getElementById('qroEndDate').value = range[1];
      document.querySelectorAll('#qroDateTypeWrap .qro-radio-btn').forEach(function (b) {
        b.classList.toggle('qro-radio-checked', b.getAttribute('data-v') === '7');
      });
      document.getElementById('qroSeriesSelect').innerHTML = '';
      document.getElementById('qroSeatSelect').innerHTML = '';
      qroInitMultiSelect('qroSeriesSelect', qroSeriesOptions, [], function (vals) { qroState.seriesSelected = vals; }, '车系筛选');
      qroInitMultiSelect('qroSeatSelect', seatOpts, [], function (vals) { qroState.seatSelected = vals; }, '请选择');
      qroApplyParams();
    });
    document.getElementById('qroQueryBtn').addEventListener('click', qroApplyParams);
  }

  function qroApplyParams() {
    var s = document.getElementById('qroStartDate').value;
    var e = document.getElementById('qroEndDate').value;
    qroState.params = {
      startTime: (s || qroDateRange(7)[0]) + ' 00:00:00',
      endTime: (e || qroDateRange(7)[1]) + ' 23:59:59',
      seatIds: qroState.seatSelected.join(','),
      seriesCodes: qroState.seriesSelected.join(',')
    };
    qroRefreshOverview();
    qroRefreshSorce();
    qroRenderTrendChart();
    qroState.workerPage = 1;
    qroRenderWorkerTable();
    qroState.cluePage = 1;
    qroRenderClueTable();
  }

  // 多选下拉（tag 形态，对齐 antd Select multiple maxTagCount responsive）
  function qroInitMultiSelect(containerId, options, initial, onChange, placeholder) {
    var host = document.getElementById(containerId);
    var selected = (initial || []).slice();
    var open = false;

    function render() {
      var tags = selected.map(function (v) {
        var opt = options.find(function (o) { return o.value === v; });
        return '<span class="qro-tag" data-v="' + qroEsc(v) + '">' + qroEsc(opt ? opt.label : v) + '<i class="qro-tag-close">×</i></span>';
      }).join('');
      host.innerHTML = '<div class="qro-select-multiple' + (open ? ' qro-focused' : '') + '" style="min-width:220px">' +
        (selected.length ? tags : '<span class="qro-placeholder">' + qroEsc(placeholder || '请选择') + '</span>') +
        '<span style="margin-left:auto;color:rgba(0,0,0,0.25);padding:0 7px">▾</span></div>' +
        '<div class="qro-tree-dropdown" style="' + (open ? '' : 'display:none;') + '"></div>';
      var box = host.querySelector('.qro-select-multiple');
      var dd = host.querySelector('.qro-tree-dropdown');
      dd.innerHTML = options.map(function (o) {
        var on = selected.indexOf(o.value) >= 0;
        return '<div class="qro-tree-node" data-v="' + qroEsc(o.value) + '"><span class="qro-tree-checkbox' + (on ? ' qro-checked' : '') + '"></span><span class="qro-tree-label">' + qroEsc(o.label) + '</span></div>';
      }).join('');
      dd.querySelectorAll('.qro-tree-node').forEach(function (row) {
        row.addEventListener('click', function (e) {
          if (e.target.closest('.qro-tag-close')) return;
          var v = row.getAttribute('data-v');
          var idx = selected.indexOf(v);
          if (idx >= 0) selected.splice(idx, 1); else selected.push(v);
          onChange(selected.slice());
          render();
          var dd2 = host.querySelector('.qro-tree-dropdown');
          dd2.style.display = 'block';
          dd2.style.position = 'relative';
          dd2.style.width = '100%';
          host.querySelector('.qro-select-multiple').classList.add('qro-focused');
        });
      });
      box.addEventListener('click', function (e) {
        if (e.target.closest('.qro-tag-close')) {
          var v = e.target.closest('.qro-tag').getAttribute('data-v');
          selected = selected.filter(function (x) { return x !== v; });
          onChange(selected.slice());
          render();
          return;
        }
        open = !open;
        render();
        if (open) {
          var dd3 = host.querySelector('.qro-tree-dropdown');
          dd3.style.display = 'block';
          dd3.style.position = 'relative';
          dd3.style.width = '100%';
          host.querySelector('.qro-select-multiple').classList.add('qro-focused');
        }
      });
    }
    render();
    document.addEventListener('click', function (e) {
      if (!host.contains(e.target)) {
        open = false;
        var dd = host.querySelector('.qro-tree-dropdown');
        var box = host.querySelector('.qro-select-multiple');
        if (dd) dd.style.display = 'none';
        if (box) box.classList.remove('qro-focused');
      }
    });
  }

  // ==================== 总览区 ====================
  function qroRefreshOverview() {
    var el = document.getElementById('qroOverview');
    if (!el) return;
    var data = qroGetOverview(qroState.params);
    var seatNames = '全部坐席';
    if (qroState.params.seatIds) {
      seatNames = qroState.params.seatIds.split(',').map(function (id) {
        var seat = qroSeats.find(function (s) { return s.account === id; });
        return seat ? seat.name : '';
      }).filter(Boolean).join('    ');
    }
    var html = '<div class="qro-info">' +
      '<img src="' + qroAvatarDataUrl() + '" alt="" />' +
      '<div class="qro-name">' + qroEsc(seatNames) + '</div></div>';
    data.forEach(function (item) {
      var up = item.scorePre >= 0;
      html += '<div class="qro-overview-item">' +
        '<div class="qro-ov-title"><span>' + qroEsc(item.name) + '</span>' +
          '<span class="qro-tip-icon">?<span class="qro-tip-pop">' + qroEsc(item.remark) + '</span></span></div>' +
        '<div class="qro-content"><span class="qro-num">' + item.score + '</span>' +
          '<span class="qro-text">环比<span class="qro-percen ' + (up ? 'qro-num-blue' : 'qro-num-green') + '">' + (up ? '▲  ' : '▼  ') + item.scorePre + '%</span></span></div>' +
      '</div>';
    });
    el.innerHTML = html;
  }

  function qroAvatarDataUrl() {
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#e2eafb"/><circle cx="32" cy="25" r="11" fill="#2885ff"/><path d="M10 58c2-13 10-20 22-20s20 7 22 20z" fill="#2885ff"/></svg>');
  }

  // ==================== 员工质检（雷达图 + 细项拆解） ====================
  function qroRefreshSorce() {
    var sorce = qroGetSorce(qroState.params);
    if (!qroState.curFirstSortCode || !sorce.some(function (s) { return s.firstSortCode === qroState.curFirstSortCode; })) {
      qroState.curFirstSortCode = sorce.length ? sorce[0].firstSortCode : '';
    }
    qroState.curSecondSortCode = '';

    // 雷达图
    var radarHost = document.getElementById('qroRadarChart');
    if (radarHost) {
      var canvas = radarHost.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        radarHost.innerHTML = '';
        radarHost.appendChild(canvas);
      }
      var indicators = sorce.map(function (s) { return { title: s.firstSortName, sub: s.score + '分' }; });
      var values = sorce.map(function (s) { return s.score; });
      qroDrawRadar(canvas, indicators, values, { height: 350 });
    }

    // 一级分类按钮（RadioGroup small solid）
    var radioEl = document.getElementById('qroFirstSortRadio');
    radioEl.innerHTML = '<div class="qro-radio-group qro-radio-group-sm">' + sorce.map(function (s) {
      return '<span class="qro-radio-btn' + (s.firstSortCode === qroState.curFirstSortCode ? ' qro-radio-checked' : '') + '" data-v="' + s.firstSortCode + '">' + qroEsc(s.firstSortName) + '</span>';
    }).join('') + '</div>';
    radioEl.querySelectorAll('.qro-radio-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        qroState.curFirstSortCode = btn.getAttribute('data-v');
        qroState.curSecondSortCode = '';
        qroRefreshSorce();
      });
    });

    // 二级分类 tabs（全部 + 二级，竖线分隔）
    var cur = sorce.find(function (s) { return s.firstSortCode === qroState.curFirstSortCode; });
    var seconds = cur ? cur.secondSorts : [];
    var tabsEl = document.getElementById('qroSecondTabs');
    var tabsHtml = '<span class="' + (qroState.curSecondSortCode === '' ? 'qro-active-tab' : 'qro-inactive-tab') + '" data-v="">全部</span>';
    seconds.forEach(function (sec, i) {
      if (i > 0 || qroState.curSecondSortCode !== '') tabsHtml += '<span class="qro-tab-split"></span>';
      tabsHtml += '<span class="' + (sec.secondSortCode === qroState.curSecondSortCode ? 'qro-active-tab' : 'qro-inactive-tab') + '" data-v="' + sec.secondSortCode + '">' + qroEsc(sec.secondSortName) + '</span>';
    });
    tabsEl.innerHTML = tabsHtml;
    tabsEl.querySelectorAll('span[data-v]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        qroState.curSecondSortCode = tab.getAttribute('data-v');
        qroRefreshSorce();
      });
    });

    // 三级细项进度条（percent = weightedScore/thirdSortPercent*100，"x分"）
    var items = [];
    if (!qroState.curSecondSortCode) {
      seconds.forEach(function (sec) { items = items.concat(sec.thirdSorts || []); });
    } else {
      var sec2 = seconds.find(function (x) { return x.secondSortCode === qroState.curSecondSortCode; });
      items = sec2 ? (sec2.thirdSorts || []) : [];
    }
    var progEl = document.getElementById('qroProgressWrap');
    progEl.innerHTML = items.length ? items.map(function (item) {
      var percent = Math.ceil(item.weightedScore / item.thirdSortPercent * 100 * 100) / 100;
      percent = Math.min(percent, 100);
      return '<div class="qro-progress"><div class="qro-progress-title" title="' + qroEsc(item.thirdSortDesc || '') + '">' + qroEsc(item.thirdSortName) + '</div>' +
        '<div class="qro-progress-bar"><div class="qro-progress-inner" style="width:' + percent + '%"></div>' +
        '<span class="qro-progress-text">' + percent + '分</span></div></div>';
    }).join('') : '<div class="qro-empty">暂无数据</div>';
  }

  // ==================== 数据趋势 ====================
  function qroInitTrendSection() {
    var treeHost = document.getElementById('qroTrendTree');
    var ts = qroTreeSelectCreate({
      treeData: qroBuildModeTree(),
      value: [{ value: '质检总分', label: '质检总分' }],
      placeholder: '请选择诊断项',
      onChange: function (vals) {
        qroRenderTrendChart();
      },
      onBeforeChange: qroTreeGuardLine()
    });
    treeHost.appendChild(ts.root);
    document.body.appendChild(ts.dropdown);
    qroState.trendTree = ts;

    document.querySelectorAll('#qroTrendDateType .qro-radio-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#qroTrendDateType .qro-radio-btn').forEach(function (b) { b.classList.remove('qro-radio-checked'); });
        btn.classList.add('qro-radio-checked');
        qroState.trendDateType = +btn.getAttribute('data-v');
        qroRenderTrendChart();
      });
    });
    qroRenderTrendChart();
  }

  function qroRenderTrendChart() {
    var canvas = document.getElementById('qroTrendChart');
    if (!canvas || !qroState.trendTree) return;
    var trend = qroGetTrend(qroState.params, qroState.trendDateType);
    var xLabels = trend.map(function (t) { return t.date; });
    var seriesArr = qroState.trendTree.getValues()
      .filter(function (v) { return v.value !== 'selectAll'; })
      .map(function (v) {
        var data = trend.map(function (t) {
          if (v.value === '质检总分') return t.weightedScore || 0;
          for (var i = 0; i < t.qcConfigDtos.length; i++) {
            var first = t.qcConfigDtos[i];
            if (first.firstSortCode === v.value) return first.weightedScore || 0;
            for (var j = 0; j < (first.secondSorts || []).length; j++) {
              var second = first.secondSorts[j];
              if (second.secondSortCode === v.value) return second.weightedScore || 0;
            }
          }
          return 0;
        });
        return { name: v.label, data: data };
      });
    if (!seriesArr.length) {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    qroDrawLineChart(canvas, xLabels, seriesArr, { height: 360 });
  }

  // ==================== 员工诊断列表 ====================
  function qroInitWorkerSection() {
    var treeHost = document.getElementById('qroWorkerTree');
    var ws = qroTreeSelectCreate({
      treeData: qroBuildModeTree(),
      value: [{ value: '质检总分', label: '质检总分' }],
      placeholder: '请选择诊断项',
      onChange: function (vals) { qroState.workerPage = 1; qroRenderWorkerTable(); },
      onBeforeChange: qroTreeGuard(true)
    });
    treeHost.appendChild(ws.root);
    document.body.appendChild(ws.dropdown);
    qroState.workerTree = ws;

    document.getElementById('qroWorkerExport').addEventListener('click', function () {
      qroToast('员工诊断列表_' + Date.now() + '.xlsx 导出成功', 'success');
    });
    qroRenderWorkerTable();
  }

  function qroWorkerColumns() {
    var fixed = [
      { title: '坐席名称', dataIndex: 'seatName', width: 100, fixed: true },
      { title: '接通线索总量', dataIndex: 'connCount', width: 120, fixed: true },
      { title: '拨打线索总量', dataIndex: 'dialCount', width: 120, fixed: true },
      { title: '平均通话时长', dataIndex: 'avgDuration', sorter: true },
      { title: '有效通话率', dataIndex: 'validRate', sorter: true },
      { title: '诊断线索总量', dataIndex: 'diagCount', sorter: true }
    ];
    var flat = qroTreeFlattenForGuard(qroBuildModeTree());
    var selected = qroState.workerTree ? qroState.workerTree.getValues().filter(function (v) { return v.value !== 'selectAll'; }).map(function (v) { return v.value; }) : ['质检总分'];
    var dyn = flat.filter(function (node) {
      return node.value === '质检总分' || selected.indexOf(node.value) >= 0;
    }).map(function (node) {
      return { title: node.label, dataIndex: node.value, sorter: true, dynamic: true, total: node.value === '质检总分' };
    });
    return fixed.concat(dyn);
  }

  function qroWorkerCellValue(row, col) {
    if (col.dataIndex === '质检总分') return row.totalScore;
    if (col.dynamic) return row.scoreMap[col.dataIndex] != null ? row.scoreMap[col.dataIndex] : '-';
    return row[col.dataIndex];
  }

  function qroRenderWorkerTable() {
    var wrap = document.getElementById('qroWorkerTableWrap');
    if (!wrap) return;
    var rows = qroGetStuffRows(qroState.params);
    var cols = qroWorkerColumns();

    // 排序
    if (qroState.workerSort) {
      var col = cols.find(function (c) { return c.dataIndex === qroState.workerSort; });
      rows = rows.slice().sort(function (a, b) {
        var av = parseFloat(qroWorkerCellValue(a, col)) || 0;
        var bv = parseFloat(qroWorkerCellValue(b, col)) || 0;
        return av - bv;
      });
    }
    // 分页
    var total = rows.length;
    var pages = Math.max(1, Math.ceil(total / qroState.workerPageSize));
    if (qroState.workerPage > pages) qroState.workerPage = pages;
    var pageRows = rows.slice((qroState.workerPage - 1) * qroState.workerPageSize, qroState.workerPage * qroState.workerPageSize);

    var html = '<table class="qro-grid-table"><thead><tr>';
    cols.forEach(function (c) {
      var sorter = c.sorter ? '<span class="qro-sorter' + (qroState.workerSort === c.dataIndex ? ' on' : '') + '" data-k="' + c.dataIndex + '"><i class="up"></i><i class="down"></i></span>' : '';
      html += '<th' + (c.width ? ' style="min-width:' + c.width + 'px"' : '') + '>' + qroEsc(c.title) + sorter + '</th>';
    });
    html += '</tr></thead><tbody>';
    pageRows.forEach(function (row) {
      html += '<tr>';
      cols.forEach(function (c) {
        var val = qroWorkerCellValue(row, c);
        var style = c.total ? ' class="qro-cell-blue"' : '';
        html += '<td' + style + '>' + qroEsc(val) + '</td>';
      });
      html += '</tr>';
    });
    if (!pageRows.length) html += '<tr><td colspan="' + cols.length + '"><div class="qro-empty">暂无数据</div></td></tr>';
    html += '</tbody></table>';
    html += qroPaginationHtml('worker', total, qroState.workerPage, qroState.workerPageSize);
    wrap.innerHTML = html;

    wrap.querySelectorAll('.qro-sorter').forEach(function (s) {
      s.addEventListener('click', function () {
        var k = s.getAttribute('data-k');
        qroState.workerSort = qroState.workerSort === k ? null : k;
        qroRenderWorkerTable();
      });
    });
    qroBindPagination('worker', wrap, function (page, size) {
      qroState.workerPage = page;
      qroState.workerPageSize = size;
      qroRenderWorkerTable();
    });
  }

  // ==================== 分页组件（对齐 antd Pagination） ====================
  function qroPaginationHtml(ns, total, page, pageSize) {
    var pages = Math.max(1, Math.ceil(total / pageSize));
    var btns = '';
    var addBtn = function (p, text, active, disabled) {
      btns += '<button class="qro-page-btn' + (active ? ' qro-page-active' : '') + '" data-p="' + p + '"' + (disabled ? ' disabled' : '') + '>' + (text || p) + '</button>';
    };
    addBtn(page - 1, '‹', false, page <= 1);
    var start = Math.max(1, page - 2), end = Math.min(pages, page + 2);
    if (start > 1) { addBtn(1); if (start > 2) btns += '<span style="color:rgba(0,0,0,0.25)">…</span>'; }
    for (var p = start; p <= end; p++) addBtn(p, null, p === page);
    if (end < pages) { if (end < pages - 1) btns += '<span style="color:rgba(0,0,0,0.25)">…</span>'; addBtn(pages); }
    addBtn(page + 1, '›', false, page >= pages);
    var from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    var to = Math.min(page * pageSize, total);
    return '<div class="qro-pagination">' +
      '<span style="margin-right:8px">' + from + '-' + to + ' 共' + total + '条</span>' + btns +
      '<select data-size><option value="10"' + (pageSize === 10 ? ' selected' : '') + '>10 条/页</option><option value="20"' + (pageSize === 20 ? ' selected' : '') + '>20 条/页</option><option value="50"' + (pageSize === 50 ? ' selected' : '') + '>50 条/页</option></select>' +
      '</div>';
  }

  function qroBindPagination(ns, wrap, onChange) {
    wrap.querySelectorAll('.qro-page-btn:not(:disabled)').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = +btn.getAttribute('data-p');
        if (p >= 1) onChange(p, null);
      });
    });
    wrap.querySelectorAll('.qro-pagination select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        onChange(1, +sel.value);
      });
    });
  }

  // ==================== 线索诊断列表（ClueTabel 对齐） ====================
  function qroInitClueSection() {
    var bar = document.getElementById('qroClueSearchBar');
    var typeOpts = qroClueTypes.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
    var sourceOpts = qroSourceDict.map(function (d) { return '<option value="' + d.code + '">' + d.name + '</option>'; }).join('');
    var rchOpts = ['R1-懂车帝留资', 'R2-汽车之家留资', 'R3-官网表单', 'R4-活动报名'].map(function (r) { return '<option value="' + r + '">' + r + '</option>'; }).join('');
    bar.innerHTML =
      '<div class="qro-search-item"><span class="qro-search-label">线索编码</span><input type="text" class="qro-input" id="qroClueSId" placeholder="请输入" style="width:150px" /></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">客户姓名</span><input type="text" class="qro-input" id="qroClueSName" placeholder="请输入" style="width:110px" /></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">联系电话</span><input type="text" class="qro-input" id="qroClueSTel" placeholder="请输入" style="width:140px" /></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">线索类型</span><select id="qroClueSType"><option value="">全部</option>' + typeOpts + '</select></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">线索来源</span><select id="qroClueSSource"><option value="">全部</option>' + sourceOpts + '</select></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">线索R渠道</span><select id="qroClueSRch"><option value="">全部</option>' + rchOpts + '</select></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">坐席名称</span><input type="text" class="qro-input" id="qroClueSSeat" placeholder="请输入" style="width:110px" /></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">经销商名称</span><input type="text" class="qro-input" id="qroClueSDealer" placeholder="请输入" style="width:160px" /></div>' +
      '<div class="qro-search-item"><span class="qro-search-label">诊断项</span><div id="qroClueTree"></div></div>';

    var fields = { hdClueId: 'qroClueSId', custName: 'qroClueSName', custTel: 'qroClueSTel', clueType: 'qroClueSType', clueSource: 'qroClueSSource', rchannelName: 'qroClueSRch', seatName: 'qroClueSSeat', dealerName: 'qroClueSDealer' };
    Object.keys(fields).forEach(function (k) {
      var el = document.getElementById(fields[k]);
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () {
        qroState.clueSearch[k] = el.value.trim();
        qroState.cluePage = 1;
        qroRenderClueTable();
      });
    });

    var ts = qroTreeSelectCreate({
      treeData: qroBuildModeTree(),
      value: qroState.clueValue,
      placeholder: '请选择',
      onChange: function (vals) {
        qroState.clueValue = vals;
        qroState.cluePage = 1;
        qroRenderClueTable();
      },
      onBeforeChange: qroTreeGuard(true)
    });
    document.getElementById('qroClueTree').appendChild(ts.root);
    document.body.appendChild(ts.dropdown);
    qroState.clueTree = ts;

    document.getElementById('qroClueExport').addEventListener('click', function () {
      qroToast('线索诊断列表_' + Date.now() + '.xlsx 导出成功', 'success');
    });
    document.getElementById('qroClueExportDetail').addEventListener('click', function () {
      qroToast('质检明细_' + Date.now() + '.xlsx 导出成功', 'success');
    });
    qroRenderClueTable();
  }

  function qroClueColumns() {
    var cols = [
      { title: '序号', key: 'index', align: 'center', width: 60 },
      { title: '线索编码', dataIndex: 'hdClueId', width: 130 },
      { title: '客户姓名', dataIndex: 'custName', width: 90 },
      { title: '联系电话', dataIndex: 'custTel', width: 120 },
      { title: '线索类型', dataIndex: 'clueType', align: 'center', width: 90 },
      { title: '线索来源', dataIndex: 'clueSource', align: 'center', width: 90 },
      { title: '线索R渠道', dataIndex: 'rchannelName', align: 'center', width: 130 },
      { title: '车系', dataIndex: 'seriesName', width: 110 },
      { title: '坐席名称', dataIndex: 'seatName', width: 90 },
      { title: '申诉细项个数', dataIndex: 'appealCnt', sorter: true, align: 'right', width: 110 },
      { title: '首次通话时间', dataIndex: 'firstReviewTime', sorter: true, width: 140 },
      { title: '末次通话时间', dataIndex: 'lastReviewTime', sorter: true, width: 140 },
      { title: '通话次数', dataIndex: 'followTimes', sorter: true, align: 'right', width: 90 },
      { title: '通话总时长', dataIndex: 'callDuration', sorter: true, align: 'right', width: 100 }
    ];
    var selected = qroState.clueValue.filter(function (v) { return v.value !== 'selectAll'; });
    selected.forEach(function (item) {
      cols.push({ title: item.label, dataIndex: item.value, sorter: true, dynamic: true, total: item.label === '质检总分' });
    });
    cols.push({ title: '操作', key: 'action', width: 130 });
    return cols;
  }

  function qroClueCellValue(row, col) {
    if (col.key === 'index') return '';
    if (col.dataIndex === '质检总分') return row.propertyScoreList[0];
    if (col.dynamic) return row.scoreMap[col.dataIndex] != null ? row.scoreMap[col.dataIndex] : '-';
    if (col.dataIndex === 'clueSource') {
      var dict = qroSourceDict.find(function (d) { return d.code === row.clueSource; });
      return dict ? dict.name : row.clueSource;
    }
    return row[col.dataIndex];
  }

  function qroClueSortValue(row, col) {
    if (col.dataIndex === '质检总分') return parseFloat(row.propertyScoreList[0]) || 0;
    if (col.dynamic) return parseFloat(row.scoreMap[col.dataIndex]) || 0;
    if (col.dataIndex === 'callDuration') {
      var m = /(\d+)分(\d+)秒/.exec(row.callDuration);
      return m ? +m[1] * 60 + +m[2] : 0;
    }
    var v = row[col.dataIndex];
    return typeof v === 'number' ? v : parseFloat(v) || 0;
  }

  function qroFilterClueRows(rows) {
    var s = qroState.clueSearch;
    return rows.filter(function (row) {
      if (s.hdClueId && row.hdClueId.indexOf(s.hdClueId) < 0) return false;
      if (s.custName && row.custName.indexOf(s.custName) < 0) return false;
      if (s.custTel && row.custTel.indexOf(s.custTel) < 0) return false;
      if (s.clueType && row.clueType !== s.clueType) return false;
      if (s.clueSource && row.clueSource !== s.clueSource) return false;
      if (s.rchannelName && row.rchannelName !== s.rchannelName) return false;
      if (s.seatName && row.seatName.indexOf(s.seatName) < 0) return false;
      if (s.dealerName && row.dealerName && row.dealerName.indexOf(s.dealerName) < 0) return false;
      return true;
    });
  }

  function qroRenderClueTable() {
    var wrap = document.getElementById('qroClueTableWrap');
    if (!wrap) return;
    var data = qroGetClueRows(qroState.params);
    var rows = qroFilterClueRows(data.rows);
    rows.forEach(function (row) { row.isCheck = qroState.clueChecked[row.hdClueId] || row.isCheck; });
    var cols = qroClueColumns();

    if (qroState.clueSort) {
      var col = cols.find(function (c) { return c.dataIndex === qroState.clueSort; });
      if (col) {
        rows = rows.slice().sort(function (a, b) {
          return qroClueSortValue(a, col) - qroClueSortValue(b, col);
        });
      }
    }

    var total = rows.length;
    var pages = Math.max(1, Math.ceil(total / qroState.cluePageSize));
    if (qroState.cluePage > pages) qroState.cluePage = pages;
    var pageRows = rows.slice((qroState.cluePage - 1) * qroState.cluePageSize, qroState.cluePage * qroState.cluePageSize);

    var html = '<table class="qro-grid-table"><thead><tr>';
    cols.forEach(function (c) {
      var sorter = c.sorter ? '<span class="qro-sorter' + (qroState.clueSort === c.dataIndex ? ' on' : '') + '" data-k="' + c.dataIndex + '"><i class="up"></i><i class="down"></i></span>' : '';
      html += '<th' + (c.width ? ' style="min-width:' + c.width + 'px"' : '') + (c.align ? ' class="qro-th-' + c.align + '"' : '') + '>' + qroEsc(c.title) + sorter + '</th>';
    });
    html += '</tr></thead><tbody>';
    pageRows.forEach(function (row, ri) {
      html += '<tr>';
      cols.forEach(function (c) {
        if (c.key === 'index') {
          html += '<td style="text-align:center">' + ((qroState.cluePage - 1) * qroState.cluePageSize + ri + 1) + '</td>';
        } else if (c.key === 'action') {
          html += '<td class="qro-td-nowrap">' +
            '<a class="qro-link" data-act="detail" data-id="' + qroEsc(row.hdClueId) + '">详情</a>' +
            '<a class="qro-link" data-act="check" data-id="' + qroEsc(row.hdClueId) + '">' + (row.isCheck ? '重新检核' : '检核') + '</a></td>';
        } else {
          var val = qroClueCellValue(row, c);
          var style = '';
          if (c.total) style = ' class="qro-cell-blue"';
          else if (c.align === 'center') style = ' style="text-align:center"';
          else if (c.align === 'right') style = ' style="text-align:right"';
          html += '<td' + style + '>' + qroEsc(val) + '</td>';
        }
      });
      html += '</tr>';
    });
    if (!pageRows.length) html += '<tr><td colspan="' + cols.length + '"><div class="qro-empty">暂无数据</div></td></tr>';
    html += '</tbody></table>';
    html += qroPaginationHtml('clue', total, qroState.cluePage, qroState.cluePageSize);
    wrap.innerHTML = html;

    wrap.querySelectorAll('.qro-sorter').forEach(function (s) {
      s.addEventListener('click', function () {
        var k = s.getAttribute('data-k');
        qroState.clueSort = qroState.clueSort === k ? null : k;
        qroRenderClueTable();
      });
    });
    wrap.querySelectorAll('a[data-act]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var id = a.getAttribute('data-id');
        var row = qroGetClueRows(qroState.params).rows.find(function (r) { return r.hdClueId === id; });
        if (!row) return;
        if (a.getAttribute('data-act') === 'detail') qroOpenDetailDrawer(row);
        else qroOpenEditForm(row);
      });
    });
    qroBindPagination('clue', wrap, function (page, size) {
      qroState.cluePage = page;
      qroState.cluePageSize = size;
      qroRenderClueTable();
    });
  }

  // ==================== AiAnalysis / EditForm 补充样式 ====================
  var QRO_AI_STYLE_ID = 'qroAiStylesheet';
  function qroEnsureAiStyles() {
    if (document.getElementById(QRO_AI_STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = QRO_AI_STYLE_ID;
    style.textContent = [
      /* 模型诊断标题行（title-wrap___3cDYG） */
      '.qro-ai-title-wrap{display:flex;align-items:center;margin-bottom:20px;}',
      '.qro-ai-title-line{width:4px;height:16px;background:#2885ff;border-radius:2px;margin-right:10px;}',
      '.qro-ai-title-text{color:rgba(0,0,0,0.88);font-weight:600;font-size:16px;line-height:1;}',
      '.qro-ai-title-sub{color:rgba(0,0,0,0.65);font-size:13px;margin-left:8px;}',
      /* 指标项得分（score-total-wrap___363Io / score-total___1F75b） */
      '.qro-ai-score-total-wrap{display:flex;justify-content:center;margin:-40px 0 20px;}',
      '.qro-ai-score-total{display:inline-flex;align-items:center;justify-content:center;font-size:18px;font-weight:bold;text-align:left;color:#01123a;width:240px;height:44px;background:#f6f8fa;border-radius:16px;}',
      '.qro-ai-score-total .qro-ai-score-num{color:#2885ff;font-size:28px;margin-left:6px;}',
      '.qro-ai-tip-icon{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;margin-right:5px;border:1px solid rgba(0,0,0,0.45);border-radius:50%;font-size:12px;color:rgba(0,0,0,0.45);cursor:pointer;position:relative;}',
      '.qro-ai-tip-pop{position:absolute;left:22px;top:-30px;z-index:30;background:#fff;box-shadow:0 6px 16px rgba(0,0,0,0.08);border:1px solid #f0f0f0;border-radius:8px;padding:10px 8px;color:#01123a;font-size:13px;font-weight:400;width:220px;display:none;text-align:left;line-height:20px;}',
      '.qro-ai-tip-pop .qro-ai-tip-row{display:flex;justify-content:space-between;}',
      '.qro-ai-tip-icon:hover .qro-ai-tip-pop{display:block;}',
      /* 雷达区三分类标签（label___3vYa4 / label-active___1w8la） */
      '.qro-ai-radar-row{display:flex;align-items:center;justify-content:center;}',
      '.qro-ai-radar-side{flex:0 0 250px;margin-top:-80px;}',
      '.qro-ai-radar-side .qro-ai-rls{display:flex;flex-wrap:wrap;}',
      '.qro-ai-rl{box-sizing:border-box;min-width:114px;height:28px;padding:3px 8px;font-size:14px;text-align:center;color:#666666;background:#d9d9d9;line-height:22px;border-radius:6px;margin:4px;}',
      '.qro-ai-rl.qro-ai-rl-on{color:#ffffff;background:#2885ff;}',
      '.qro-ai-radar-toplabels{display:flex;flex-wrap:wrap;justify-content:center;}',
      '.qro-ai-radar-chart{flex-basis:560px;flex-shrink:0;flex-grow:0;width:560px;height:460px;}',
      /* AiAnalysis 会话区（top___2xqxr / right___14v59） */
      '.qro-ai-top{display:flex;height:520px;margin:0;}',
      '.qro-ai-top .qro-ai-right{flex:1 0;overflow:hidden;}',
      '.qro-ai-top .qro-ai-right .qro-card{height:100%;margin:0;}',
      '.qro-ai-top .qro-ai-right .qro-card .qro-card-body{height:100%;overflow:hidden;padding:0;}',
      '.qro-ai-top .qro-ai-left{overflow:auto;flex:1 0;}',
      '.qro-ai-top .qro-ai-left .qro-card{height:100%;margin:0;}',
      '.qro-ai-top .qro-ai-left .qro-card .qro-card-body{height:460px;overflow:auto;padding:0;}',
      '.qro-ai-chat-box{overflow:auto;height:100%;}',
      '.qro-ai-chat-main{overflow:auto;height:468px;font-size:0;padding:25px 20px 20px 20px;background:#ebedf0;border-radius:8px;}',
      '.qro-ai-chat-main .qro-time-text{font-size:12px;color:#7a7a7a;line-height:14px;padding:4px 0 15px 42px;}',
      '.qro-ai-chat-main .qro-time-text.qro-time-right{text-align:right;padding:4px 42px 15px 0;}',
      /* 评分表格（custom-table___26fBc） */
      '.qro-custom-table{width:100%;border-spacing:0;}',
      '.qro-custom-table .qro-ct-row{height:55px;font-size:13px;color:#101010;line-height:20px;border-bottom:1px solid #f0f0f0;}',
      '.qro-custom-table .qro-ct-row:hover{background-color:#fafafa;}',
      '.qro-custom-table .qro-ct-col{font-size:13px;color:#101010;line-height:20px;padding:0 16px;vertical-align:middle;}',
      '.qro-custom-table .qro-ct-row:nth-child(even){background-color:#fbfcfd;}',
      '.qro-custom-table .qro-ct-row.qro-ct-row-error{background-color:#fdf6f5 !important;}',
      '.qro-custom-table .qro-ct-row.qro-ct-row-error:hover{background-color:#fdf6f5 !important;}',
      /* 触发/未触发胶囊（label-trigger___3YoV2 / label-no-trigger___2nElo） */
      '.qro-label-trigger{display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;text-align:center;color:#2885ff;line-height:20px;width:64px;height:32px;background:#e2eafb;border-radius:16px;}',
      '.qro-label-no-trigger{display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;text-align:center;color:#ff9500;line-height:20px;width:64px;height:32px;background:#fffaeb;border-radius:16px;}',
      '.qro-ct-status{display:inline-flex;align-items:center;gap:8px;}',
      '.qro-ct-status-text{font-size:13px;}',
      /* antd Tabs type=card（客服规范一级 tab） */
      '.qro-cardtabs{display:flex;flex-wrap:wrap;border-bottom:1px solid #f0f0f0;margin:0 -16px 16px;padding:0 16px;}',
      '.qro-cardtabs-item{position:relative;display:inline-flex;align-items:center;padding:12px 16px;margin-bottom:-1px;font-size:14px;color:rgba(0,0,0,0.88);line-height:20px;background:#fafafa;border:1px solid #f0f0f0;border-bottom:none;border-radius:8px 8px 0 0;margin-right:4px;cursor:pointer;}',
      '.qro-cardtabs-item.qro-cardtabs-active{background:#fff;color:#1677ff;font-weight:600;border-top:2px solid #1677ff;padding-top:11px;}',
      '.qro-cardtabs-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;margin-left:6px;background:#ff4d4f;border-radius:9px;font-size:12px;color:#fff;line-height:17px;}',
      /* Descriptions 标签明细（检核弹窗 .left） */
      '.qro-desc-module{padding:0 0 8px;}',
      '.qro-desc-module .qro-desc-grid{display:grid;grid-template-columns:1fr 1fr;}',
      '.qro-desc-item{display:flex;padding:8px 16px;border-bottom:1px solid #f1f1f1;font-size:14px;line-height:22px;}',
      '.qro-desc-item .qro-desc-item-label{flex:0 0 40%;color:rgba(0,0,0,0.45);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.qro-desc-item .qro-desc-item-content{flex:1;color:rgba(0,0,0,0.88);word-break:break-all;}',
      /* 检核表单 */
      '.qro-ef-form{padding:16px 0;}',
      '.qro-ef-row{display:flex;align-items:flex-start;margin-bottom:16px;}',
      '.qro-ef-label{flex:0 0 110px;text-align:right;padding-right:8px;font-size:14px;color:rgba(0,0,0,0.88);line-height:32px;height:32px;}',
      '.qro-ef-label em{color:#ff4d4f;font-style:normal;margin-right:4px;}',
      '.qro-ef-control{flex:1;position:relative;}',
      '.qro-ef-error{position:absolute;left:0;top:34px;font-size:12px;color:#ff4d4f;line-height:20px;display:none;}',
      '.qro-ef-row.qro-ef-invalid .qro-ef-error{display:block;}',
      '.qro-ef-row.qro-ef-invalid .qro-input,.qro-ef-row.qro-ef-invalid .qro-textarea{border-color:#ff4d4f;}',
      '.qro-textarea{width:100%;box-sizing:border-box;min-height:88px;padding:4px 11px;font-size:14px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;color:rgba(0,0,0,0.88);outline:none;resize:vertical;font-family:inherit;}',
      '.qro-textarea:focus{border-color:#2885ff;box-shadow:0 0 0 2px rgba(40,133,255,0.1);}',
      '.qro-ef-count{position:absolute;right:8px;bottom:-20px;font-size:12px;color:rgba(0,0,0,0.45);}',
      /* DrawerForm 底部按钮（对齐 antd 抽屉 footer） */
      '.qro-drawer-footer .qro-btn{margin-left:8px;}',
      '@keyframes qroFadeIn{from{opacity:0}to{opacity:1}}',
      '.qro-drawer-mask{animation:qroFadeIn .2s ease;}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ==================== AiAnalysis 演示数据构建 ====================
  // 对齐 scoreAnalyse：firstSort → secondSorts → thirdSorts（triggerShowFlag/canAppeal/isAppeal/isPass/deductScore）
  function qroBuildScoreAnalyse(seedKey) {
    return qroQualityMode.map(function (first) {
      var canFirst = 0, inFirst = 0, appealFirst = 0;
      var secondSorts = first.secondSorts.map(function (second) {
        var canSec = 0, inSec = 0, appealSec = 0;
        var thirdSorts = second.thirdSorts.map(function (third) {
          var s = seedKey + '_t_' + third.thirdSortCode;
          var deduct = qroRnd(s + '_d') > 0.72 ? qroFixed(s + '_dv', 1, 5, 1) : 0;
          var status = qroInt(s + '_st', 0, 19);
          var appealStatus = deduct > 0 && status > 13 ? (status > 17 ? 1 : (status > 15 ? 2 : 3)) : 0;
          var canAppeal = deduct > 0 && (appealStatus === 0 || appealStatus === 3);
          if (canAppeal) canSec++;
          if (appealStatus === 1) inSec++;
          if (appealStatus >= 1) appealSec++;
          return {
            thirdSortCode: third.thirdSortCode,
            thirdSortName: third.thirdSortName,
            thirdSortDesc: third.thirdSortDesc,
            triggerShowFlag: deduct > 0,
            deductScore: deduct,
            canAppeal: canAppeal,
            isAppeal: appealStatus >= 1,
            isPass: deduct === 0 ? true : null,
            lastIsPass: appealStatus === 2 ? true : (appealStatus === 3 ? false : null)
          };
        });
        canFirst += canSec; inFirst += inSec; appealFirst += appealSec;
        return {
          secondSortCode: second.secondSortCode,
          secondSortName: second.secondSortName,
          canAppealCount: canSec, inAppealCount: inSec, appealCount: appealSec,
          thirdSorts: thirdSorts
        };
      });
      return {
        firstSortCode: first.firstSortCode,
        firstSortName: first.firstSortName,
        firstSortPercent: first.firstSortPercent,
        score: qroFixed(seedKey + '_fs_' + first.firstSortCode, first.firstSortPercent * 0.6, first.firstSortPercent * 0.98, 1),
        canAppealCount: canFirst, inAppealCount: inFirst, appealCount: appealFirst,
        secondSorts: secondSorts
      };
    });
  }

  // 对齐 formulaData：{baseScore, deductions:[{label,value}], totalScore, inspectionScore}
  function qroBuildFormula(seedKey, scoreAnalyse) {
    var deductions = [];
    var total = 100;
    scoreAnalyse.forEach(function (first) {
      first.secondSorts.forEach(function (sec) {
        sec.thirdSorts.forEach(function (t) {
          if (t.deductScore > 0) {
            deductions.push({ label: t.thirdSortName, value: t.deductScore });
            total -= t.deductScore;
          }
        });
      });
    });
    total = Math.max(0, +total.toFixed(1));
    return { baseScore: 100, deductions: deductions, totalScore: total, inspectionScore: total };
  }

  // 对齐 reviewRecords：回访记录列表（每条含多路通话）
  function qroBuildReviewRecords(seedKey, row) {
    var n = qroInt(seedKey + '_rvn', 1, 3);
    var list = [];
    for (var i = 0; i < n; i++) {
      var calls = [];
      var callN = qroInt(seedKey + '_rv' + i + '_cn', 1, 3);
      for (var j = 0; j < callN; j++) {
        var cs = seedKey + '_rv' + i + '_c' + j;
        calls.push({
          id: (row ? row.hdClueId : 'HD') + '-R' + (i + 1) + '-' + (j + 1),
          canAppealCount: qroInt(cs + '_ca', 0, 3),
          inAppealCount: qroInt(cs + '_ia', 0, 2)
        });
      }
      list.push({ id: (row ? row.hdClueId : 'HD') + '-R' + (i + 1), canAppealCount: calls.reduce(function (a, c) { return a + c.canAppealCount; }, 0), calls: calls });
    }
    return list;
  }

  // 会话时间戳（对齐 addMillisecondsToDate 展示 HH:mm:ss）
  function qroChatTime(seedKey, i) {
    var base = 9 * 3600 + qroInt(seedKey + '_ct0', 0, 20000);
    var sec = base + qroInt(seedKey + '_ct' + i, 4, 30) * (i + 1);
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
  }

  // ==================== 抽屉框架（对齐 antd Drawer） ====================
  function qroCloseDrawer() {
    var mask = document.querySelector('.qro-drawer-mask');
    var drawer = document.querySelector('.qro-drawer');
    if (mask) mask.remove();
    if (drawer) drawer.remove();
    document.body.style.overflow = '';
  }

  function qroOpenDrawer(opts) {
    qroCloseDrawer();
    qroEnsureAiStyles();
    var mask = document.createElement('div');
    mask.className = 'qro-drawer-mask';
    mask.addEventListener('click', function () { if (opts.maskClosable !== false) qroCloseDrawer(); });
    var drawer = document.createElement('div');
    drawer.className = 'qro-drawer';
    var width = opts.width || Math.max(1120, Math.round(window.innerWidth * 0.85));
    drawer.style.width = width + 'px';
    drawer.style.maxWidth = '100vw';
    var html = '<div class="qro-drawer-header"><span>' + qroEsc(opts.title || '') + '</span>' +
      '<button class="qro-drawer-close" title="关闭">✕</button></div>' +
      '<div class="qro-drawer-body">' + (opts.body || '') + '</div>';
    if (opts.footer) html += '<div class="qro-drawer-footer">' + opts.footer + '</div>';
    drawer.innerHTML = html;
    document.body.appendChild(mask);
    document.body.appendChild(drawer);
    document.body.style.overflow = 'hidden';
    drawer.querySelector('.qro-drawer-close').addEventListener('click', qroCloseDrawer);
    if (opts.onMount) opts.onMount(drawer);
    return drawer;
  }

  // ==================== 详情抽屉（AiAnalysis，appealOperate=false 查看模式） ====================
  var qroDetailCtx = null;

  // VideoComponent：一级tab（回访记录）+ 二级tab（通话记录）+ audio
  function qroAiVideoHtml(ctx) {
    var html = '<div class="qro-vc-wrap">';
    html += '<div class="qro-vc-top"><div class="qro-first-tabs-inner">';
    ctx.records.forEach(function (rec, i) {
      var badge = rec.canAppealCount > 0 ? '<div class="qro-first-tabs-badge">' + rec.canAppealCount + '</div>' : '';
      html += '<div class="qro-first-tabs-item' + (ctx.firstTab === i ? ' qro-first-active' : '') + '" data-ft="' + i + '">' +
        '<div style="padding-right:4px">回访记录' + (i + 1) + '</div>' + badge + '</div>';
    });
    var allBadge = ctx.records.reduce(function (a, r) { return a + r.canAppealCount; }, 0);
    html += '<div class="qro-first-tabs-item' + (ctx.firstTab === -1 ? ' qro-first-active' : '') + '" data-ft="-1">' +
      '<div style="padding-right:4px">全部回访</div>' + (allBadge > 0 ? '<div class="qro-first-tabs-badge">' + allBadge + '</div>' : '') + '</div>';
    html += '</div><div class="qro-second-tabs-wrap"><div class="qro-second-tabs-inner">';
    ctx.curCalls.forEach(function (call, j) {
      var badge = call.canAppealCount > 0 ? '<div class="qro-second-tabs-badge">' + call.canAppealCount + '</div>' : '';
      html += '<div class="qro-second-tabs-item' + (ctx.secondTab === j ? ' qro-second-active' : '') + '" data-st="' + j + '">' +
        '<div style="padding-right:4px">通话记录' + (j + 1) + '</div>' + badge + '</div>';
    });
    html += '</div></div></div>';
    html += '<div class="qro-vc-bottom"><audio controls style="outline:none;flex:1"></audio>' +
      '<a class="qro-link" style="margin-left:12px" id="qroAiOpenAudio">点击播放录音</a></div>';
    html += '</div>';
    return html;
  }

  // ScoreFormula：满分基准 100 - 扣分项… = 质检总分
  function qroAiFormulaHtml(formula) {
    var html = '<div class="qro-score-formula">';
    html += '<span class="qro-sf-label">满分基准</span><span class="qro-sf-value">' + formula.baseScore + '</span>';
    formula.deductions.forEach(function (d) {
      html += '<span class="qro-sf-operator">-</span><span class="qro-sf-label">' + qroEsc(d.label) + '</span><span class="qro-sf-value-danger">' + d.value + '</span>';
    });
    html += '<span class="qro-sf-operator">=</span><span class="qro-sf-label-bold">质检总分</span><span class="qro-sf-value-total">' + formula.totalScore + '</span>';
    html += '</div>';
    return html;
  }

  // RadarComponent：Card 员工质检 → 模型诊断 + 指标项得分 + 三列标签 + 雷达图
  function qroAiRadarHtml(ctx) {
    var sd = ctx.scoreAnalyse;
    var tipRows = sd.map(function (f) {
      return '<div class="qro-ai-tip-row"><div>' + qroEsc(f.firstSortName) + '</div><div>' + f.firstSortPercent + '%</div></div>';
    }).join('');
    function labels(idx) {
      var out = '';
      if (sd[idx]) {
        sd[idx].secondSorts.forEach(function (sec) {
          sec.thirdSorts.forEach(function (t) {
            out += '<div class="qro-ai-rl' + (t.triggerShowFlag ? ' qro-ai-rl-on' : '') + '">' + qroEsc(t.thirdSortName) + '</div>';
          });
        });
      }
      return out;
    }
    var html = '<div class="qro-card"><div class="qro-card-head"><span class="qro-card-title">员工质检</span></div><div class="qro-card-body">';
    html += '<div class="qro-ai-title-wrap"><div class="qro-ai-title-line"></div><div class="qro-ai-title-text">模型诊断</div>' +
      '<span class="qro-ai-title-sub">蓝色为得分项，灰色为未完成项</span></div>';
    html += '<div class="qro-ai-radar-toplabels">' + labels(0) + '</div>';
    html += '<div class="qro-ai-score-total-wrap"><div class="qro-ai-score-total">' +
      '<span class="qro-ai-tip-icon">?<div class="qro-ai-tip-pop"><div style="margin-bottom:8px">质检总分是加权之后的分数，具体权重占比为：</div>' + tipRows + '</div></span>' +
      '<span>指标项得分</span>&nbsp;&nbsp;<span class="qro-ai-score-num">' + ctx.formula.inspectionScore + '</span></div></div>';
    html += '<div class="qro-ai-radar-row">' +
      '<div class="qro-ai-radar-side"><div class="qro-ai-rls">' + labels(1) + '</div></div>' +
      '<div class="qro-ai-radar-chart" id="qroAiRadarChart"></div>' +
      '<div class="qro-ai-radar-side"><div class="qro-ai-rls">' + labels(2) + '</div></div>' +
      '</div>';
    html += '</div></div>';
    return html;
  }

  // ChatComponent：当前通话会话记录（SpeakerId 1销售 2客户）
  function qroAiChatHtml(sentences, title, showExport) {
    var html = '<div class="qro-card"><div class="qro-card-head"><span class="qro-card-title">' + qroEsc(title) + '</span>';
    if (showExport) {
      html += '<span class="qro-card-extra"><span class="qro-export-button" id="qroAiExportText">导出录音文本</span></span>';
    }
    html += '</div><div class="qro-card-body"><div class="qro-ai-chat-box"><div class="qro-ai-chat-main">';
    sentences.forEach(function (s, i) {
      var time = '<span class="qro-time-text' + (s.SpeakerId === '1' ? ' qro-time-right' : '') + '">' + s.time + '</span>';
      if (s.SpeakerId === '2') {
        html += '<div class="qro-customer-wrap"><div class="qro-icon-wrap"><div class="qro-icon-customer">客</div></div>' +
          '<div class="qro-customer-text-wrap"><div class="qro-customer-text-inner"><div class="qro-chat-text">' + qroEsc(s.Text) + '</div></div></div></div>' + time;
      } else {
        html += '<div class="qro-sales-wrap"><div class="qro-sales-text-wrap"><div class="qro-sales-text-inner"><div class="qro-chat-text">' + qroEsc(s.Text) + '</div></div></div>' +
          '<div class="qro-icon-wrap"><div class="qro-icon-sales">销</div></div></div>' + time;
      }
    });
    html += '</div></div></div></div>';
    return html;
  }

  // TableComponentNew：Card 客服规范 → 可申诉细项 + 一级/二级tab + custom-table
  function qroAiTableHtml(ctx) {
    var sd = ctx.scoreAnalyse;
    var totalCan = sd.reduce(function (a, f) { return a + f.canAppealCount; }, 0);
    var cur = sd[ctx.tFirstTab] || sd[0];
    var html = '<div class="qro-card"><div class="qro-card-head"><span class="qro-card-title"> 客服规范</span>' +
      '<span class="qro-card-extra"><div class="qro-vc-appeal-count" style="margin-bottom:0">可申诉细项：<span style="font-weight:bold;margin-right:12px">' + totalCan + '个</span></div></span></div>';
    html += '<div class="qro-card-body">';
    // 一级 antd Tabs type=card
    html += '<div class="qro-cardtabs">';
    sd.forEach(function (f, i) {
      html += '<div class="qro-cardtabs-item' + (i === ctx.tFirstTab ? ' qro-cardtabs-active' : '') + '" data-tf="' + i + '">' +
        qroEsc(f.firstSortName) + (f.canAppealCount > 0 ? '<span class="qro-cardtabs-badge">' + f.canAppealCount + '</span>' : '') + '</div>';
    });
    html += '</div>';
    // 二级 tab
    html += '<div class="qro-second-tabs-wrap"><div class="qro-second-tabs-inner">';
    if (cur) {
      cur.secondSorts.forEach(function (sec, j) {
        html += '<div class="qro-second-tabs-item' + (j === ctx.tSecondTab ? ' qro-second-active' : '') + '" data-ts="' + j + '">' +
          '<div style="padding-right:4px">' + qroEsc(sec.secondSortName) + '</div>' +
          (sec.canAppealCount > 0 ? '<div class="qro-second-tabs-badge">' + sec.canAppealCount + '</div>' : '') + '</div>';
      });
    }
    html += '</div></div>';
    // 表格
    var rows = cur && cur.secondSorts[ctx.tSecondTab] ? cur.secondSorts[ctx.tSecondTab].thirdSorts : [];
    if (rows.length) {
      html += '<table class="qro-custom-table"><tbody>';
      rows.forEach(function (t) {
        var statusText = '';
        if (t.isAppeal) statusText = '<span style="color:' + (t.isPass === false ? '#D92D21' : '#00CE86') + '">' + (t.isPass === false ? '审核不通过' : '审核通过') + '</span>';
        html += '<tr class="qro-ct-row' + (t.canAppeal ? ' qro-ct-row-error' : '') + '">' +
          '<td class="qro-ct-col">' + qroEsc(t.thirdSortName) + '</td>' +
          '<td class="qro-ct-col" style="width:370px">' + qroEsc(t.thirdSortDesc) + '</td>' +
          '<td class="qro-ct-col"><div class="qro-ct-status">' + statusText +
          (t.triggerShowFlag ? '<span class="qro-label-trigger">触发</span>' : '<span class="qro-label-no-trigger">未触发</span>') +
          '</div></td></tr>';
      });
      html += '</tbody></table>';
    } else {
      html += '<div class="qro-empty">此类目下无申诉项</div>';
    }
    html += '</div></div>';
    return html;
  }

  function qroOpenDetailDrawer(row) {
    var seedKey = row.seedKey || row.hdClueId;
    var sentences = qroGetChatSentences(seedKey).map(function (s, i) {
      s.time = qroChatTime(seedKey, i);
      return s;
    });
    var ctx = {
      row: row, seedKey: seedKey, sentences: sentences,
      records: qroBuildReviewRecords(seedKey, row),
      scoreAnalyse: qroBuildScoreAnalyse(seedKey),
      firstTab: -1, secondTab: 0,
      tFirstTab: 0, tSecondTab: 0
    };
    ctx.formula = qroBuildFormula(seedKey, ctx.scoreAnalyse);
    ctx.curCalls = ctx.firstTab === -1
      ? ctx.records.reduce(function (a, r) { return a.concat(r.calls); }, [])
      : ctx.records[ctx.firstTab].calls;
    qroDetailCtx = ctx;

    var drawer = qroOpenDrawer({
      title: '诊断详情',
      body: '<div id="qroAiBody"></div>'
    });
    qroRenderDetailBody(drawer);
  }

  function qroRenderDetailBody(drawer) {
    var ctx = qroDetailCtx;
    if (!ctx) return;
    var body = drawer.querySelector('#qroAiBody');
    var html = qroAiVideoHtml(ctx);
    html += qroAiFormulaHtml(ctx.formula);
    html += qroAiRadarHtml(ctx);
    html += '<div style="height:20px"></div>';
    html += '<div class="qro-ai-top"><div class="qro-ai-right">' + qroAiChatHtml(ctx.sentences, '当前通话会话记录', true) + '</div></div>';
    html += '<div style="height:20px"></div>';
    html += qroAiTableHtml(ctx);
    body.innerHTML = html;

    // 一级/二级 tab（回访记录）
    body.querySelectorAll('[data-ft]').forEach(function (el) {
      el.addEventListener('click', function () {
        var ft = +el.getAttribute('data-ft');
        ctx.firstTab = ft; ctx.secondTab = 0;
        ctx.curCalls = ft === -1
          ? ctx.records.reduce(function (a, r) { return a.concat(r.calls); }, [])
          : ctx.records[ft].calls;
        qroRenderDetailBody(drawer);
      });
    });
    body.querySelectorAll('[data-st]').forEach(function (el) {
      el.addEventListener('click', function () {
        ctx.secondTab = +el.getAttribute('data-st');
        qroRenderDetailBody(drawer);
      });
    });
    // 表格一级/二级 tab
    body.querySelectorAll('[data-tf]').forEach(function (el) {
      el.addEventListener('click', function () {
        ctx.tFirstTab = +el.getAttribute('data-tf'); ctx.tSecondTab = 0;
        qroRenderDetailBody(drawer);
      });
    });
    body.querySelectorAll('[data-ts]').forEach(function (el) {
      el.addEventListener('click', function () {
        ctx.tSecondTab = +el.getAttribute('data-ts');
        qroRenderDetailBody(drawer);
      });
    });
    // 导出录音文本（原型模拟）
    var exp = body.querySelector('#qroAiExportText');
    if (exp) exp.addEventListener('click', function () { qroToast('录音文本导出任务已提交（演示）'); });
    var open = body.querySelector('#qroAiOpenAudio');
    if (open) open.addEventListener('click', function () { qroToast('演示环境无真实录音文件'); });
    // 雷达图
    var chartBox = body.querySelector('#qroAiRadarChart');
    if (chartBox) {
      var canvas = document.createElement('canvas');
      chartBox.appendChild(canvas);
      var indicators = ctx.scoreAnalyse.map(function (f) {
        return { title: f.firstSortName, sub: f.score + '分' };
      });
      var values = ctx.scoreAnalyse.map(function (f) { return f.score; });
      qroDrawRadar(canvas, indicators, values, { height: 460 });
    }
  }

  // ==================== 检核弹窗（EditForm DrawerForm 检核质量标签） ====================
  function qroOpenEditForm(row) {
    var seedKey = row.seedKey || row.hdClueId;
    var sentences = qroGetChatSentences(seedKey).map(function (s, i) {
      s.time = qroChatTime(seedKey, i);
      return s;
    });
    var conclusion = qroGetConclusion(seedKey);

    // 标签明细（BaseInfoComponent → DescComponent：二维数组分组 Descriptions column=2）
    var descHtml = '<div class="qro-card"><div class="qro-card-head"><span class="qro-card-title">标签明细</span></div>' +
      '<div class="qro-card-body" style="padding:0">';
    conclusion.forEach(function (group) {
      descHtml += '<div class="qro-desc-module"><div class="qro-desc-grid">';
      group.forEach(function (item) {
        descHtml += '<div class="qro-desc-item"><div class="qro-desc-item-label">' + qroEsc(item.key) + '</div>' +
          '<div class="qro-desc-item-content">' + qroEsc(item.value) + '</div></div>';
      });
      descHtml += '</div></div>';
    });
    descHtml += '</div></div>';

    var formHtml =
      '<div class="qro-vc-wrap" style="margin:0"><div class="qro-vc-bottom"><audio controls style="outline:none;flex:1"></audio>' +
      '<a class="qro-link" style="margin-left:12px" id="qroEfOpenAudio">点击播放录音</a></div></div>' +
      '<div style="height:20px"></div>' +
      '<div class="qro-ai-top">' +
        '<div class="qro-ai-right">' + qroAiChatHtml(sentences, '会话记录', false) + '</div>' +
        '<div style="flex:20px 0 0"></div>' +
        '<div class="qro-ai-left">' + descHtml + '</div>' +
      '</div>' +
      '<div style="height:20px"></div>' +
      '<div class="qro-card"><div class="qro-card-body">' +
        '<div class="qro-ef-form">' +
          '<div class="qro-ef-row" id="qroEfPassRow"><div class="qro-ef-label"><em>*</em>是否检核通过</div>' +
            '<div class="qro-ef-control">' +
              '<label class="qro-radio-btn" style="border-radius:6px;margin-right:8px;cursor:pointer"><input type="radio" name="qroEfPass" value="1" style="margin-right:6px">是</label>' +
              '<label class="qro-radio-btn" style="border-radius:6px;cursor:pointer"><input type="radio" name="qroEfPass" value="0" style="margin-right:6px">否</label>' +
              '<div class="qro-ef-error">请选择是否检核通过</div>' +
            '</div></div>' +
          '<div class="qro-ef-row" id="qroEfReasonRow"><div class="qro-ef-label"><em>*</em>原因</div>' +
            '<div class="qro-ef-control"><textarea class="qro-textarea" id="qroEfReason" maxlength="500" placeholder="请输入原因"></textarea>' +
            '<span class="qro-ef-count" id="qroEfCount">0/500</span>' +
            '<div class="qro-ef-error">请输入原因</div></div></div>' +
          '<div class="qro-ef-row" id="qroEfInspectorRow"><div class="qro-ef-label"><em>*</em>检核人</div>' +
            '<div class="qro-ef-control"><input class="qro-input" id="qroEfInspector" style="width:100%;box-sizing:border-box" placeholder="请输入检核人" />' +
            '<div class="qro-ef-error">请输入检核人</div></div></div>' +
        '</div>' +
      '</div></div>';

    var drawer = qroOpenDrawer({
      title: '检核质量标签',
      body: formHtml,
      footer: '<button class="qro-btn" id="qroEfCancel">取消</button><button class="qro-btn qro-btn-primary" id="qroEfSubmit">提 交</button>'
    });

    var reason = drawer.querySelector('#qroEfReason');
    reason.addEventListener('input', function () {
      drawer.querySelector('#qroEfCount').textContent = reason.value.length + '/500';
    });
    drawer.querySelector('#qroEfOpenAudio').addEventListener('click', function () { qroToast('演示环境无真实录音文件'); });
    drawer.querySelector('#qroEfCancel').addEventListener('click', qroCloseDrawer);

    function qroEfValidate() {
      var ok = true;
      var passRow = drawer.querySelector('#qroEfPassRow');
      var passChecked = drawer.querySelector('input[name="qroEfPass"]:checked');
      passRow.classList.toggle('qro-ef-invalid', !passChecked);
      if (!passChecked) ok = false;
      var reasonRow = drawer.querySelector('#qroEfReasonRow');
      var reasonOk = !!reason.value.trim();
      reasonRow.classList.toggle('qro-ef-invalid', !reasonOk);
      if (!reasonOk) ok = false;
      var insRow = drawer.querySelector('#qroEfInspectorRow');
      var insOk = !!drawer.querySelector('#qroEfInspector').value.trim();
      insRow.classList.toggle('qro-ef-invalid', !insOk);
      if (!insOk) ok = false;
      return ok;
    }

    drawer.querySelector('#qroEfSubmit').addEventListener('click', function () {
      if (!qroEfValidate()) return;
      row.isCheck = true;
      qroState.clueChecked[row.hdClueId] = true;
      qroCloseDrawer();
      qroToast('操作成功');
      qroRenderClueTable();
    });
  }

  // ==================== 模块注册 ====================
  window.renderQualityReportOldPage = renderQualityReportOldPage;
})();
