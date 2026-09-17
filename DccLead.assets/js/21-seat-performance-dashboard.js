/* WorkBuddy 业绩晾晒报告的本地复刻；64 人、A/B/C 三组模拟数据。 */
const sdN=['黄思云:B','刘华美:C','李燕幸:C','李文朗:C','黎静文:A','徐伟振:C','文颖诗:C','廖欢:B','朱晓贤:B','徐敏华:C','张美凤:B','符婷:B','高金燕:A','侯三妹:A','朱伟杰:C','黄学全:B','廖伟杰:A','刘丝丝:C','张诗韵:B','卢秋兰:C','王国豪:A','孙茜:B','陶冰:B','林立锋:C','潘婷婷:C','蒲师师:A','邝美兰:A','钟梓萱:A','萧婉仪:A','冯明煜:A','杨磊盼:B','卢梓玮:B','谢欣婷:B','陈豪:A','毕纭嘉:C','韦春燕:C','余静娴:B','王欣彤:A','王桂如:C','李壁妤:B','关思惠:C','郑小巧:A','曾永红:B','张华锋:C','刘丽娟:B','黄玉梅:B','戴文浩:A','陈蔓欣:A','黄子薇:A','邱燕儿:C','唐馨:B','黎翠娟:A','陈小燕:A','林冰:B','谭晓莹:A','朱佳佳:A','林楚龙:B','田紫叶:B','杨志宏:C','陈丽媛:C','陈树彬:A','巫润佳:C','刘正聪:C','冯泳怡:B'].map((x,i)=>{let [name,g]=x.split(':');return{name,g:g+'组',code:'佳佳'+(i+1),t:145+i%8*6,w:28+i%7*3,wd:4+i%3}});
const sdDays=['2026-09-01','2026-09-02','2026-09-03','2026-09-04','2026-09-05','2026-09-06','2026-09-07'],sdG=['A组','B组','C组'],sdDonutVisible={1:[true,true,true],2:[true,true,true]};let sdF={1:{s:sdDays[6],sh:9,e:sdDays[6],eh:11},2:{s:sdDays[0],sh:0,e:sdDays[6],eh:23}};
const sdDur=x=>{x=Math.round(x);return x<60?x+'秒':Math.floor(x/60)+'分'+(x%60?x%60+'秒':'')},sdTag=g=>g==='A组'?'a':g==='B组'?'b':'c';
// 业绩报表的排班模拟数据：用于计算“在岗人数”，不再以是否产生业绩记录作为在岗依据。
const sdShiftRoster=sdDays.reduce((result,day)=>{
  result[day]=sdN.filter(seat=>{
    if(day!==sdDays[sdDays.length-1])return true;
    const groupIndex=sdN.filter(item=>item.g===seat.g).findIndex(item=>item.name===seat.name);
    return groupIndex<(seat.g==='C组'?12:14);
  }).map(seat=>({name:seat.name,start:9,end:19}));
  return result;
},{});
function sdScheduledNames(f){
  const names=new Set();
  Object.entries(sdShiftRoster).forEach(([day,shifts])=>{
    if(day<f.s||day>f.e)return;
    shifts.forEach(shift=>{
      const startsAtBoundary=day===f.s&&shift.end<=f.sh;
      const endsAtBoundary=day===f.e&&shift.start>f.eh;
      if(!startsAtBoundary&&!endsAtBoundary)names.add(shift.name);
    });
  });
  return names;
}
function sdCalc(f){let ds=sdDays.filter(x=>x>=f.s&&x<=f.e),r=sdN.map((x,i)=>({...x,p:0,c:0,task:0}));ds.forEach((d,di)=>r.forEach((x,i)=>{for(let h=9;h<19;h++){if(d===f.s&&h<f.sh||d===f.e&&h>f.eh||d===sdDays[6]&&i>=40)continue;let n=(i*7+di*11+h*3)%17;x.p+=n>12?3:n>8?2:n>5?1:0;x.c+=n>2?70+n*37:0;x.task+=n>4?1+n%3:0}}));if(ds.length===1&&f.s===sdDays[6]&&f.sh===9&&f.eh===11){const cfg={'A组':{p:[8,7,6,5,4,4,3,3,2,2,2,1,1,0],c:[52.25,40,35,30,28,25,22,20,18,15,8,4,2,1.7]},'B组':{p:[9,6,5,4,3,3,2,2,1,1,1,0,0,0],c:[61.3,50,42,35,30,25,22,18,14,10,6,3,1,.73]},'C组':{p:[9,8,7,7,6,5,4,3,3,0,0,0],c:[60,55,50,45,40,38,35,32,25,18,10,8.48]}};r.forEach(x=>{x.p=0;x.c=0;x.task=0});sdG.forEach(g=>{const a=r.filter(x=>x.g===g),q=cfg[g];q.p.forEach((v,i)=>{a[i].p=v;a[i].c=Math.round(q.c[i]*60);a[i].task=1})})}r.forEach(x=>{x.active=x.p||x.c||x.task;x.eff=Math.round(x.w/x.wd)*ds.length;x.cp=x.eff?x.p/x.eff*100:0});let gs=sdG.map(g=>{let a=r.filter(x=>x.g===g);return{g,a,p:a.reduce((s,x)=>s+x.p,0),c:a.reduce((s,x)=>s+x.c,0),t:a.reduce((s,x)=>s+Math.round(x.t/30)*ds.length,0)}});return{r,gs,on:r.filter(x=>x.active),off:r.filter(x=>!x.active),ds}}
const sdCalcByReport=sdCalc;
sdCalc=function(f){
  const result=sdCalcByReport(f),scheduled=sdScheduledNames(f);
  result.on=result.r.filter(seat=>scheduled.has(seat.name));
  result.off=result.r.filter(seat=>!scheduled.has(seat.name));
  return result;
};
const sdSort=(a,k,t)=>[...a].sort((x,y)=>y[k]-x[k]||y[t]-x[t]||x.name.localeCompare(y.name,'zh-CN'));
function sdSelect(id,k,v,hrs){let a=hrs?[...Array(24).keys()]:sdDays;return '<select id="sd'+id+k+'">'+a.map(x=>'<option '+(x==v?'selected':'')+' value="'+x+'">'+(hrs?x+'点':x)+'</option>').join('')+'</select>'}
function sdBars(a,k,col){let m=Math.max(...a.map(x=>x[k]),1);return '<div class="sd-bars">'+a.map(x=>'<div><b>'+x[k]+'</b><i style="height:'+Math.max(3,x[k]/m*190)+'px;background:'+(x[k]?col:'#d9d9d9')+'"></i><span>'+x.name+'</span></div>').join('')+'</div>'}
function sdRestSeatSummary(data,filter){
  const defaultRange=filter.s==='2026-09-07'&&filter.e==='2026-09-07'&&filter.sh===9&&filter.eh===11&&data.off.length===24;
  const defaultNames='黄思云 (小妮)、刘华美 (佳佳Z)、李文朗 (李文朗)、黎静文 (佳佳S)、徐敏华 (佳佳E)、张美凤 (佳佳L)、符婷 (佳佳K)、朱伟杰 (佳佳R)、廖伟杰 (佳佳T)、王国豪 (佳佳17)、陶冰 (佳佳20)、潘婷婷 (佳佳24)、杨磊盼 (佳佳F)、谢欣婷 (佳佳49)、关思惠 (晓晓)、曾永红 (佳佳68)、张华锋 (佳佳69)、刘丽娟 (佳佳70)、戴文浩 (佳佳N)、黄子薇 (佳佳H)、邱燕儿 (佳佳Y)、黎翠娟 (佳佳10)、朱佳佳 (佳佳35)、冯泳怡 (佳佳45)';
  const names=defaultRange?defaultNames:data.off.map(seat=>seat.name+' ('+seat.code+')').join('、');
  const content=names||'当前筛选时段暂无休息坐席人员。';
  return '<div class="sd-rest-note"><b>📌 休息员工（'+data.off.length+' 人）：</b>'+content+'</div>';
}
function sdTable(g){let a=sdSort(g.a,'p','c'),call=sdSort(g.a,'c','p');return '<div class="grp '+sdTag(g.g)+'"><b>▶ '+g.g+'</b><span>'+g.a.length+'人（休息 '+g.a.filter(x=>!x.active).length+' 人）· 排程 '+g.p+' 批 · 通话 '+sdDur(g.c)+' · 人均排程 '+(g.p/g.a.length).toFixed(2)+' 批</span></div><table><thead><tr><th>#</th><th>姓名</th><th>佳佳代码</th><th>排程量（批）</th><th>目标排程量(日)</th><th>完成度</th><th>组内排程排名</th><th>通话时长</th><th>组内通话排名</th><th>备注</th></tr></thead><tbody>'+a.map((x,i)=>'<tr><td>'+ (i+1)+'</td><td><b>'+x.name+'</b></td><td><em>'+x.code+'</em></td><td class="pc">'+x.p+'</td><td class="pc">'+x.eff+'</td><td>'+x.cp.toFixed(1)+'%</td><td>第 '+(i+1)+' 名</td><td class="call">'+(x.c?sdDur(x.c):'—')+'</td><td>第 '+(call.indexOf(x)+1)+' 名</td><td>'+(!x.active?'休息':'')+'</td></tr>').join('')+'</tbody></table>'}
function sdTop(a,k,t,blue){return sdSort(a,k,t).filter(x=>x[k]>0).slice(0,10).map((x,i)=>'<tr><td>'+(['🥇','🥈','🥉'][i]||i+1)+'</td><td><b>'+x.name+'</b></td><td>'+x.g+'</td><td class="'+(blue?'pc':'call')+'">'+(blue?x.p+'批':sdDur(x.c))+'</td><td class="'+(blue?'call':'pc')+'">'+(blue?sdDur(x.c):x.p+'批')+'</td></tr>').join('')}
function sdPanel(id,title,orange){let f=sdF[id],d=sdCalc(f),p=d.r.reduce((s,x)=>s+x.p,0),c=d.r.reduce((s,x)=>s+x.c,0),t=d.gs.reduce((s,x)=>s+x.t,0);return '<section class="major"><div class="major-title '+(orange?'month':'')+'">'+title+'</div><div class="filter">开始日期 '+sdSelect(id,'s',f.s)+' 开始小时 '+sdSelect(id,'sh',f.sh,1)+' 结束日期 '+sdSelect(id,'e',f.e)+' 结束小时 '+sdSelect(id,'eh',f.eh,1)+' <button onclick="applySeatDashboardFilter('+id+')">应用筛选</button><strong>当前时段：'+f.s+f.sh+'点 ～ '+f.e+f.eh+'点（覆盖 '+d.ds.length+' 天，'+d.on.length+' 人在岗）</strong></div><p class="note">数据时点：'+f.s+f.sh+'点 ～ '+f.e+f.eh+'点　|　指标：排程量 + 通话时长（口径与既有报表一致）　|　目标按覆盖天数累加；完成度=排程量/目标</p><div class="kpis"><div><small>总排程量</small><b>'+p+' <i>批</i></b><span>试驾排程下发 + 试驾线索下发</span></div><div><small>总通话时长</small><b>'+sdDur(c)+'</b><span>'+c+'秒 · 累计外呼通话</span></div><div><small>参与小组</small><b>3 <i>组</i></b><span>A组 / B组 / C组</span></div><div><small>休息员工</small><b>'+d.off.length+' <i>人</i></b><span>本时段无回访记录 = 休</span></div></div><div class="box"><h3>一、各小组业绩汇总</h3><table><thead><tr><th>小组</th><th>员工人数</th><th>排程量（批）</th><th>目标排程量(日)</th><th>完成度</th><th>通话时长</th><th>人均排程</th><th>人均通话</th></tr></thead><tbody>'+d.gs.map(g=>'<tr><td>'+g.g+'</td><td>'+g.a.length+'人</td><td class="pc">'+g.p+'</td><td class="pc">'+g.t+'</td><td>'+ (g.p/g.t*100).toFixed(1)+'%</td><td class="call">'+sdDur(g.c)+'</td><td>'+ (g.p/g.a.length).toFixed(2)+'</td><td>'+sdDur(g.c/g.a.length)+'</td></tr>').join('')+'<tr class="sum"><td>合计</td><td>64人</td><td class="pc">'+p+'</td><td class="pc">'+t+'</td><td>'+ (p/t*100).toFixed(1)+'%</td><td class="call">'+sdDur(c)+'</td><td>'+ (p/64).toFixed(2)+'</td><td>'+sdDur(c/64)+'</td></tr></tbody></table><h4>▎各小组冠军速览</h4><table><thead><tr><th>小组</th><th>排程量冠军</th><th>通话时长冠军</th><th>组排程量</th><th>组通话</th></tr></thead><tbody>'+d.gs.map(g=>{let x=sdSort(g.a,'p','c')[0],y=sdSort(g.a,'c','p')[0];return '<tr><td>'+g.g+'</td><td>🥇 '+x.name+'（'+x.p+'批）</td><td>🥇 '+y.name+'（'+sdDur(y.c)+'）</td><td class="pc">'+g.p+'批</td><td class="call">'+sdDur(g.c)+'</td></tr>'}).join('')+'</tbody></table></div><div class="box"><h3>二、小组业绩对比</h3><div class="charts"><div><h4>小组：排程量(批) vs 通话时长(分钟)</h4>'+d.gs.map(g=>'<p>'+g.g+' <i style="width:'+g.p/Math.max(...d.gs.map(z=>z.p))*55+'%"></i><b>'+g.p+'批</b> <em>'+Math.round(g.c/60)+'分</em></p>').join('')+'</div><div class="pie"><h4>小组通话时长占比</h4><b>通话<br>'+Math.round(c/60)+'分</b><p>A组 / B组 / C组</p></div></div></div><div class="box"><h3>三、上班全员业绩分布（共 '+d.on.length+' 人在岗，已剔除休息 '+d.off.length+' 人）</h3><p>🟦 有排程　⬜ 零排程（需关注）　按数值从高到低有序排列</p><h4 class="center">上班全员 排程量（单位：批）</h4>'+sdBars(sdSort(d.on,'p','c'),'p','#1677ff')+'<h4 class="center">上班全员 通话时长（单位：分钟）</h4>'+sdBars(sdSort(d.on,'c','p').map(x=>({...x,c:Math.round(x.c/60)})),'c','#52c41a')+'</div><div class="box"><h3>四、员工明细业绩（按 A组 → B组 → C组）</h3>'+d.gs.map(sdTable).join('')+'</div><div class="box"><h3>五、全员双指标榜单 TOP 10</h3><div class="charts"><table><caption>🥇 排程量 TOP 10（批）</caption><thead><tr><th>排名</th><th>姓名</th><th>小组</th><th>排程量</th><th>通话时长</th></tr></thead><tbody>'+sdTop(d.r,'p','c',1)+'</tbody></table><table><caption>🥇 通话时长 TOP 10</caption><thead><tr><th>排名</th><th>姓名</th><th>小组</th><th>通话时长</th><th>排程量</th></tr></thead><tbody>'+sdTop(d.r,'c','p',0)+'</tbody></table></div></div></section>'}
function renderSeatPerformanceDashboard(){let p=document.getElementById('seatPerformanceDashboardPage');if(!p)return;p.innerHTML='<main class="sd"><header><h1>🏆 业绩晾晒报告</h1><p>生成日期：2026-09-07　|　两个板块可各自独立筛选「开始日期+小时 ～ 结束日期+小时」，所有指标与图表实时联动。　|　口径：排程量=回访结果∈{试驾排程下发,试驾线索下发}；通话=仅接通且时长累加；仅64人；按创建时间过滤。</p></header><aside>⚠️ <b>数据范围说明：</b>当前本地模拟数据覆盖 <b>2026-09-01 ～ 2026-09-07</b>（小时级，按日叠加）。<br>📌 <b>目标口径：</b>个人目标=周排程量÷该周有效上班天数；小组目标=月度目标÷30；按筛选覆盖天数累加。</aside>'+sdPanel(1,'第一大点　时段业绩（可筛选）')+sdPanel(2,'第二大点　时段业绩（可筛选）',1)+'</main>';if(!document.getElementById('sdcss'))document.head.insertAdjacentHTML('beforeend','<style id="sdcss">#seatPerformanceDashboardPage .sd{background:#f5f6fa;padding:24px;font-family:Microsoft YaHei;color:#222}#seatPerformanceDashboardPage .sd>header,#seatPerformanceDashboardPage .major{background:#fff;border-radius:14px;padding:24px 28px;box-shadow:0 2px 12px #0000000d;margin-bottom:18px}#seatPerformanceDashboardPage .sd h1{font-size:22px}#seatPerformanceDashboardPage .sd header p,#seatPerformanceDashboardPage .sd .note{font-size:13px;color:#888;line-height:1.6}#seatPerformanceDashboardPage .sd aside{background:#fff7e6;border:1px solid #ffd591;border-radius:10px;padding:12px 16px;color:#874d00;font-size:13px;margin-bottom:16px}#seatPerformanceDashboardPage .major{padding:22px 26px}#seatPerformanceDashboardPage .major-title{font-size:19px;font-weight:800;color:#fff;background:linear-gradient(90deg,#1677ff,#4096ff);padding:14px 20px;border-radius:10px}#seatPerformanceDashboardPage .major-title.month{background:linear-gradient(90deg,#fa8c16,#ffa940)}#seatPerformanceDashboardPage .filter{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:#f0f5ff;border:1px solid #d6e4ff;border-radius:10px;padding:12px 16px;margin:12px 0}#seatPerformanceDashboardPage .filter select{padding:5px 8px;border:1px solid #c9d6ea;border-radius:6px}#seatPerformanceDashboardPage .filter button{background:#1677ff;color:#fff;border:0;border-radius:6px;padding:7px 16px;font-weight:700}#seatPerformanceDashboardPage .filter strong{margin-left:auto;color:#1677ff;font-size:13px}#seatPerformanceDashboardPage .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:14px 0 18px}#seatPerformanceDashboardPage .kpis div,#seatPerformanceDashboardPage .box{border:1px solid #eef0f5;border-radius:10px;padding:18px;background:#fff}#seatPerformanceDashboardPage .kpis small,#seatPerformanceDashboardPage .kpis span{display:block;color:#888;font-size:12px}#seatPerformanceDashboardPage .kpis b{display:block;font-size:26px;margin:6px 0;color:#1a1a2e}#seatPerformanceDashboardPage .kpis i{font-size:14px;color:#999;font-style:normal}#seatPerformanceDashboardPage .box{margin-bottom:18px}#seatPerformanceDashboardPage .box h3{border-left:4px solid #1677ff;padding-left:10px;font-size:16px}#seatPerformanceDashboardPage .box h4{margin:16px 0 7px}#seatPerformanceDashboardPage .sd table{width:100%;border-collapse:collapse;font-size:13px}#seatPerformanceDashboardPage .sd th{background:#f0f3fa;padding:10px 8px}#seatPerformanceDashboardPage .sd td{text-align:center;padding:9px 8px;border-bottom:1px solid #eef0f5}#seatPerformanceDashboardPage .sd .pc{color:#1677ff;font-weight:700}#seatPerformanceDashboardPage .sd .call{color:#52c41a;font-weight:700}#seatPerformanceDashboardPage .sd .sum{background:#f7faff;font-weight:700}#seatPerformanceDashboardPage .sd .charts{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px}#seatPerformanceDashboardPage .sd .charts>div{border:1px solid #f0f2f5;border-radius:8px;padding:16px;min-height:250px}#seatPerformanceDashboardPage .sd .charts h4{text-align:center}#seatPerformanceDashboardPage .sd .charts i{display:inline-block;height:18px;background:#1677ff;border-radius:3px;vertical-align:middle;margin:0 8px}#seatPerformanceDashboardPage .sd .charts em{color:#52c41a;font-style:normal;font-weight:bold}#seatPerformanceDashboardPage .sd .pie{display:grid;place-items:center;background:radial-gradient(circle,#fff 0 32%,transparent 33%),conic-gradient(#1677ff 0 35%,#52c41a 35% 67%,#722ed1 67%);background-size:160px 160px;background-position:center 54px;background-repeat:no-repeat}#seatPerformanceDashboardPage .sd .pie b{text-align:center;font-size:14px}#seatPerformanceDashboardPage .sd .sd-bars{height:255px;display:flex;align-items:flex-end;gap:4px;border-bottom:1px solid #ddd;overflow:hidden}#seatPerformanceDashboardPage .sd .sd-bars div{height:100%;min-width:20px;flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}#seatPerformanceDashboardPage .sd .sd-bars b{font-size:10px}#seatPerformanceDashboardPage .sd .sd-bars i{width:75%;border-radius:4px 4px 0 0}#seatPerformanceDashboardPage .sd .sd-bars span{font-size:10px;white-space:nowrap;transform:rotate(-48deg);transform-origin:top left;margin:8px 0 -20px 12px}#seatPerformanceDashboardPage .sd .center{text-align:center}#seatPerformanceDashboardPage .sd .grp{color:#fff;margin:18px 0 10px;padding:9px 14px;border-radius:6px;display:flex;justify-content:space-between}#seatPerformanceDashboardPage .sd .grp.a{background:#1677ff}#seatPerformanceDashboardPage .sd .grp.b{background:#52c41a}#seatPerformanceDashboardPage .sd .grp.c{background:#722ed1}#seatPerformanceDashboardPage .sd caption{font-weight:700;color:#1677ff;padding:8px}@media(max-width:900px){#seatPerformanceDashboardPage .kpis,#seatPerformanceDashboardPage .sd .charts{grid-template-columns:1fr}#seatPerformanceDashboardPage .sd{padding:12px}#seatPerformanceDashboardPage .filter strong{margin-left:0;width:100%}}</style>')}
const sdPanelBase=sdPanel;
sdPanel=function(id,title,orange){
  const chart='<div class="box"><h3>二、小组业绩对比</h3><div class="sd-chart-grid"><div class="sd-chart-cell"><canvas data-sd-chart="bar" data-panel="'+id+'"></canvas></div><div class="sd-chart-cell"><canvas data-sd-chart="donut" data-panel="'+id+'"></canvas></div></div></div>';
  const d=sdCalc(sdF[id]);
  const f=sdF[id],sh=String(f.sh).padStart(2,'0'),eh=String(f.eh).padStart(2,'0'),range=f.s===f.e?f.s+' '+sh+'点 ～ '+eh+'点':f.s+' '+sh+'点 ～ '+f.e+' '+eh+'点';
  const scopeNote='<p class="note">数据时点：'+range+'　|　指标：排程量、通话时长、试驾量、锁单量　|　目标口径：目标排程量(日) = 周排程量 ÷ 该周有效上班天数（个人）／组月目标 ÷ 30（小组），按覆盖天数累加。完成度 = 排程量 ÷ 目标</p>';
  const restNote=sdRestSeatSummary(d,f);
  const distribution='<div class="box"><h3>三、上班全员业绩分布（共 '+d.on.length+' 人在岗，已剔除休息 '+d.off.length+' 人）</h3><div class="sd-dist-legend"><span><i class="has"></i>有排程</span><span><i class="zero"></i>零排程（需关注）</span><span>按数值从高到低有序排列</span></div><div class="sd-dist-chart"><canvas data-sd-chart="schedule" data-panel="'+id+'"></canvas></div><div class="sd-dist-divider"></div><div class="sd-dist-chart"><canvas data-sd-chart="calls" data-panel="'+id+'"></canvas></div></div>';
  const details='<div class="box"><h3>四、员工明细业绩（按 A组 → B组 → C组）</h3><div class="sd-detail-legend"><span><i class="schedule"></i>排程量</span><span><i class="duration"></i>通话时长</span><span>🥇 🥈 🥉 = 组内前三</span></div>'+restNote;
  return sdPanelBase(id,title,orange)
    .replace('<section class="major">','<section class="major sd-panel sd-panel-'+id+'">')
    .replace(/<p class="note">数据时点：[\s\S]*?<\/p>/,scopeNote)
    .replace(/<div class="box"><h3>二、小组业绩对比<\/h3>[\s\S]*?(?=<div class="box"><h3>三、上班全员业绩分布)/,chart)
    .replace(/<div class="box"><h3>三、上班全员业绩分布[\s\S]*?(?=<div class="box"><h3>四、员工明细业绩)/,distribution)
    .replace('<div class="box"><h3>四、员工明细业绩（按 A组 → B组 → C组）</h3>',details);
}
function sdCanvas(canvas){const box=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);const x=canvas.getContext('2d');x.scale(dpr,dpr);x.font='13px Microsoft YaHei';return{x,w:box.width,h:box.height}}
function sdNiceMax(v,step){return Math.max(step,Math.ceil(v/step)*step)}
function sdDrawBar(canvas,d){const {x,w,h}=sdCanvas(canvas),L=66,R=64,T=92,B=48,pw=w-L-R,ph=h-T-B,maxP=sdNiceMax(Math.max(...d.gs.map(g=>g.p)),10),mins=d.gs.map(g=>Math.round(g.c/6)/10),maxC=sdNiceMax(Math.max(...mins),100);x.clearRect(0,0,w,h);x.fillStyle='#333';x.font='700 15px Microsoft YaHei';x.textAlign='center';x.fillText('小组：排程量(批) vs 通话时长(分钟)',w/2,26);x.font='13px Microsoft YaHei';x.fillStyle='#1677ff';x.fillRect(w/2-122,48,34,18);x.fillStyle='#444';x.textAlign='left';x.fillText('排程量(批)',w/2-80,62);x.fillStyle='#52c41a';x.fillRect(w/2+26,48,34,18);x.fillStyle='#444';x.fillText('通话时长(分钟)',w/2+68,62);x.strokeStyle='#e5eaf2';x.lineWidth=1;for(let i=0;i<=5;i++){let yy=T+ph-i*ph/5;x.beginPath();x.moveTo(L,yy);x.lineTo(w-R,yy);x.stroke();x.fillStyle='#667085';x.textAlign='right';x.fillText(Math.round(maxP*i/5),L-12,yy+4);x.textAlign='left';x.fillText(Math.round(maxC*i/5),w-R+10,yy+4)}x.fillStyle='#667085';x.textAlign='left';x.fillText('排程量(批)',18,T-20);x.textAlign='right';x.fillText('通话(分钟)',w-10,T-20);const groupW=pw/3,bw=Math.min(64,groupW*.28);d.gs.forEach((g,i)=>{let cx=L+groupW*(i+.5),bh=g.p/maxP*ph,ch=mins[i]/maxC*ph;x.fillStyle='#1677ff';x.beginPath();x.roundRect(cx-bw-3,T+ph-bh,bw,bh,[5,5,0,0]);x.fill();x.fillStyle='#52c41a';x.beginPath();x.roundRect(cx+3,T+ph-ch,bw,ch,[5,5,0,0]);x.fill();x.font='700 13px Microsoft YaHei';x.fillStyle='#333';x.textAlign='center';x.fillText(g.p+' 批',cx-bw/2-3,T+ph-bh-9);x.fillText(mins[i]+' 分',cx+bw/2+3,T+ph-ch-9);x.font='700 14px Microsoft YaHei';x.fillStyle='#667085';x.fillText(g.g,cx,h-16)});x.strokeStyle='#667085';x.beginPath();x.moveTo(L,T+ph);x.lineTo(w-R,T+ph);x.stroke()}
function sdBindBarHover(canvas,d){const parent=canvas.parentElement;if(!parent)return;parent.style.position='relative';let shade=parent.querySelector('.sd-axis-hover'),tip=parent.querySelector('.sd-chart-tip');if(!shade){shade=document.createElement('div');shade.className='sd-axis-hover';parent.appendChild(shade)}if(!tip){tip=document.createElement('div');tip.className='sd-chart-tip';parent.appendChild(tip)}if(!document.getElementById('sd-hover-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-hover-css">.sd-axis-hover{display:none;position:absolute;top:104px;bottom:60px;background:rgba(148,163,184,.10);pointer-events:none}.sd-chart-tip{display:none;position:absolute;z-index:5;min-width:230px;padding:14px 16px;background:rgba(255,255,255,.97);border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 6px 20px rgba(15,23,42,.18);pointer-events:none;color:#555;font-size:14px}.sd-chart-tip strong{display:block;font-size:16px;margin-bottom:10px}.sd-chart-tip p{display:grid;grid-template-columns:18px 1fr auto;gap:7px;align-items:center;margin:7px 0}.sd-chart-tip i{width:13px;height:13px;border-radius:50%}.sd-chart-tip b{font-size:16px}.sd-chart-cell canvas[data-sd-chart="bar"]{cursor:crosshair}</style>');canvas.onmousemove=e=>{const r=canvas.getBoundingClientRect(),px=e.clientX-r.left,L=66,R=64,pw=r.width-L-R,slot=pw/3,idx=Math.floor((px-L)/slot);if(idx<0||idx>2||e.clientY-r.top<82||e.clientY-r.top>r.height-42){shade.style.display=tip.style.display='none';return}const g=d.gs[idx],mins=Math.round(g.c/6)/10;shade.style.display='block';shade.style.left=(L+idx*slot+12)+'px';shade.style.width=slot+'px';tip.innerHTML='<strong>'+g.g+'</strong><p><i style="background:#1677ff"></i><span>排程量(批)</span><b>'+g.p+'</b></p><p><i style="background:#52c41a"></i><span>通话时长(分钟)</span><b>'+mins+'</b></p>';tip.style.display='block';let left=e.clientX-r.left+18,top=e.clientY-r.top-105;left=Math.min(Math.max(12,left),r.width-252);top=Math.min(Math.max(84,top),r.height-132);tip.style.left=left+'px';tip.style.top=top+'px'};canvas.onmouseleave=()=>{shade.style.display=tip.style.display='none'}}
function sdDrawDonut(canvas,d){const {x,w,h}=sdCanvas(canvas),vals=d.gs.map(g=>g.c/60),visible=sdDonutVisible[canvas.dataset.panel]||[true,true,true],total=vals.reduce((s,v,i)=>s+(visible[i]?v:0),0),colors=['#1677ff','#52c41a','#722ed1'],cx=w/2,cy=190,r=Math.min(112,w*.2),inner=r*.62;x.clearRect(0,0,w,h);x.fillStyle='#333';x.font='700 15px Microsoft YaHei';x.textAlign='center';x.fillText('小组通话时长占比',cx,27);let a=-Math.PI/2;if(total){vals.forEach((v,i)=>{if(!visible[i])return;let da=v/total*Math.PI*2;x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,r,a,a+da);x.closePath();x.fillStyle=colors[i];x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();let mid=a+da/2,ex=cx+Math.cos(mid)*(r+12),ey=cy+Math.sin(mid)*(r+12),right=Math.cos(mid)>=0,tx=ex+(right?44:-44);x.strokeStyle=colors[i];x.lineWidth=1.5;x.beginPath();x.moveTo(cx+Math.cos(mid)*r,cy+Math.sin(mid)*r);x.lineTo(ex,ey);x.lineTo(tx,ey);x.stroke();x.fillStyle='#333';x.font='13px Microsoft YaHei';x.textAlign=right?'left':'right';x.fillText(d.gs[i].g,tx+(right?7:-7),ey-3);x.fillText((Math.round(v*10)/10)+'分 ('+(v/total*100).toFixed(2)+'%)',tx+(right?7:-7),ey+15);a+=da})}else{x.strokeStyle='#eeeeee';x.lineWidth=r-inner;x.beginPath();x.arc(cx,cy,(r+inner)/2,0,Math.PI*2);x.stroke()}x.beginPath();x.arc(cx,cy,inner,0,Math.PI*2);x.fillStyle='#fff';x.fill();const ly=h-26,start=cx-110;d.gs.forEach((g,i)=>{let xx=start+i*105;x.fillStyle=visible[i]?colors[i]:'#c9c9c9';x.beginPath();x.roundRect(xx,ly-12,28,16,4);x.fill();x.fillStyle=visible[i]?'#444':'#bfbfbf';x.font='13px Microsoft YaHei';x.textAlign='left';x.fillText(g.g,xx+37,ly+1)})}
function sdBindDonutHover(canvas,d){const parent=canvas.parentElement;if(!parent)return;parent.style.position='relative';let tip=parent.querySelector('.sd-donut-tip');if(!tip){tip=document.createElement('div');tip.className='sd-donut-tip';parent.appendChild(tip)}if(!document.getElementById('sd-donut-hover-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-donut-hover-css">.sd-donut-tip{display:none;position:absolute;z-index:6;min-width:236px;padding:14px 18px;background:rgba(255,255,255,.98);border:1px solid #722ed1;border-radius:7px;box-shadow:0 6px 20px rgba(15,23,42,.16);pointer-events:none;color:#666;font-size:15px;line-height:1.55}.sd-donut-tip strong{display:block;margin-bottom:3px;color:#555;font-size:17px;font-weight:500}.sd-donut-tip span{display:block;white-space:nowrap;font-size:16px}</style>');const colors=['#1677ff','#52c41a','#722ed1'],vals=d.gs.map(g=>g.c/60),panel=canvas.dataset.panel,legendHit=(px,py,w,h)=>{const ly=h-26,start=w/2-110;if(py<ly-23||py>ly+12)return-1;for(let i=0;i<3;i++){const xx=start+i*105;if(px>=xx-8&&px<=xx+91)return i}return-1};canvas.onmousemove=e=>{const box=canvas.getBoundingClientRect(),px=e.clientX-box.left,py=e.clientY-box.top,li=legendHit(px,py,box.width,box.height);if(li>=0){tip.style.display='none';canvas.style.cursor='pointer';return}const visible=sdDonutVisible[panel]||[true,true,true],total=vals.reduce((s,v,i)=>s+(visible[i]?v:0),0),cx=box.width/2,cy=190,r=Math.min(112,box.width*.2),inner=r*.62,dist=Math.hypot(px-cx,py-cy);if(!total||dist<inner||dist>r){tip.style.display='none';canvas.style.cursor='default';return}let angle=Math.atan2(py-cy,px-cx)+Math.PI/2;if(angle<0)angle+=Math.PI*2;let acc=0,idx=-1;for(let i=0;i<vals.length;i++){if(!visible[i])continue;const span=vals[i]/total*Math.PI*2;if(angle>=acc&&angle<acc+span){idx=i;break}acc+=span}if(idx<0){tip.style.display='none';canvas.style.cursor='default';return}const v=vals[idx],pct=(v/total*100).toFixed(2),minutes=Math.round(v*10)/10;tip.innerHTML='<strong>'+d.gs[idx].g+'</strong><span>'+minutes+' 分钟 ('+pct+'%)</span>';tip.style.borderColor=colors[idx];tip.style.display='block';canvas.style.cursor='pointer';let left=px+18,top=py-55;left=Math.min(Math.max(12,left),box.width-276);top=Math.min(Math.max(44,top),box.height-96);tip.style.left=left+'px';tip.style.top=top+'px'};canvas.onclick=e=>{const box=canvas.getBoundingClientRect(),idx=legendHit(e.clientX-box.left,e.clientY-box.top,box.width,box.height);if(idx<0)return;sdDonutVisible[panel][idx]=!sdDonutVisible[panel][idx];tip.style.display='none';sdDrawDonut(canvas,d)};canvas.onmouseleave=()=>{tip.style.display='none';canvas.style.cursor='default'}}
function sdDrawSchedule(canvas,d){const {x,w,h}=sdCanvas(canvas),a=sdSort(d.on,'p','c'),L=72,R=28,T=86,B=95,pw=w-L-R,ph=h-T-B,max=sdNiceMax(Math.max(...a.map(v=>v.p)),2),avg=a.reduce((s,v)=>s+v.p,0)/Math.max(1,a.length),slot=pw/a.length,bw=Math.min(28,slot*.68);x.clearRect(0,0,w,h);x.fillStyle='#333';x.font='700 15px Microsoft YaHei';x.textAlign='center';x.fillText('上班全员 排程量（单位：批）',w/2,25);x.fillStyle='#888';x.font='12px Microsoft YaHei';x.fillText('共 '+a.length+' 人在岗 · 按排程量从高到低排列 · 灰色 = 零排程',w/2,49);x.fillStyle='#666';x.textAlign='left';x.fillText('排程量(批)',18,T-12);for(let i=0;i<=5;i++){let yy=T+ph-i*ph/5;x.strokeStyle='#edf0f4';x.beginPath();x.moveTo(L,yy);x.lineTo(w-R,yy);x.stroke();x.fillStyle='#687280';x.textAlign='right';x.fillText((max*i/5).toFixed(max<10?1:0).replace('.0',''),L-12,yy+4)}a.forEach((v,i)=>{let cx=L+slot*(i+.5),bh=v.p/max*ph;x.fillStyle=v.p?'#1677ff':'#d9d9d9';x.beginPath();x.roundRect(cx-bw/2,T+ph-bh,bw,Math.max(v.p?4:2,bh),[4,4,0,0]);x.fill();if(v.p){x.fillStyle='#333';x.font='700 10px Microsoft YaHei';x.textAlign='center';x.fillText(v.p,cx,T+ph-bh-7)}x.save();x.translate(cx+4,T+ph+13);x.rotate(-Math.PI/4);x.fillStyle='#555';x.font='10px Microsoft YaHei';x.textAlign='right';x.fillText(v.name,0,0);x.restore()});let ay=T+ph-avg/max*ph;x.strokeStyle='#fa8c16';x.setLineDash([8,5]);x.lineWidth=1.6;x.beginPath();x.moveTo(L,ay);x.lineTo(w-R,ay);x.stroke();x.setLineDash([]);x.fillStyle='#fa8c16';x.font='12px Microsoft YaHei';x.textAlign='right';x.fillText('人均 '+avg.toFixed(2)+' 批',w-R-5,ay-8);x.strokeStyle='#667085';x.beginPath();x.moveTo(L,T+ph);x.lineTo(w-R,T+ph);x.stroke()}
function sdBindScheduleHover(canvas,d){const parent=canvas.parentElement;if(!parent)return;parent.style.position='relative';let shade=parent.querySelector('.sd-person-hover'),tip=parent.querySelector('.sd-person-tip');if(!shade){shade=document.createElement('div');shade.className='sd-person-hover';parent.appendChild(shade)}if(!tip){tip=document.createElement('div');tip.className='sd-person-tip';parent.appendChild(tip)}if(!document.getElementById('sd-person-hover-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-person-hover-css">.sd-person-hover{display:none;position:absolute;z-index:2;top:86px;bottom:78px;background:rgba(22,119,255,.07);border-radius:4px;pointer-events:none}.sd-person-tip{display:none;position:absolute;z-index:8;min-width:220px;padding:12px 15px;background:rgba(255,255,255,.98);border:1px solid #d9d9d9;border-radius:5px;box-shadow:0 6px 18px rgba(15,23,42,.18);pointer-events:none;color:#666;font-size:14px;line-height:1.65}.sd-person-tip strong{color:#555;font-size:15px}.sd-person-tip .sd-person-meta{margin-left:7px;color:#666}.sd-person-tip p{margin:1px 0}.sd-person-tip .sd-person-count{color:#1677ff;font-weight:700}.sd-dist-chart canvas[data-sd-chart="schedule"]{cursor:crosshair}</style>');const a=sdScheduleRank(d.on);canvas.onmousemove=e=>{const box=canvas.getBoundingClientRect(),px=e.clientX-box.left,py=e.clientY-box.top,L=72,R=28,T=86,B=95,pw=box.width-L-R,slot=pw/a.length,idx=Math.floor((px-L)/slot);if(idx<0||idx>=a.length||py<T||py>box.height-B+62){shade.style.display=tip.style.display='none';return}const v=a[idx];shade.style.display='block';shade.style.left=(L+idx*slot)+'px';shade.style.width=Math.max(12,slot)+'px';tip.innerHTML='<div><strong>'+v.name+'</strong><span class="sd-person-meta">('+v.g+' / '+v.code+')</span></div><p>排程量： <span class="sd-person-count">'+v.p+' 批</span></p><p>通话时长： '+(v.c?sdDur(v.c):'0秒')+'</p>';tip.style.display='block';let left=px+16,top=py-82;left=Math.min(Math.max(12,left),box.width-270);top=Math.min(Math.max(60,top),box.height-130);tip.style.left=left+'px';tip.style.top=top+'px'};canvas.onmouseleave=()=>{shade.style.display=tip.style.display='none'}}
function sdDrawCalls(canvas,d){
  const {x,w,h}=sdCanvas(canvas),a=sdSort(d.on,'c','p'),L=72,R=28,T=86,B=95,pw=w-L-R,ph=h-T-B,vals=a.map(v=>v.c/60),rawMax=Math.max(...vals,1),max=rawMax<=70?70:sdNiceMax(rawMax,200),ticks=rawMax<=70?7:5,avg=vals.reduce((s,v)=>s+v,0)/Math.max(1,a.length),slot=pw/Math.max(1,a.length-1),pts=vals.map((v,i)=>({x:L+i*slot,y:T+ph-v/max*ph}));
  x.clearRect(0,0,w,h);x.fillStyle='#333';x.font='700 15px Microsoft YaHei';x.textAlign='center';x.fillText('上班全员 通话时长（单位：分钟）',w/2,25);x.fillStyle='#888';x.font='12px Microsoft YaHei';x.fillText('共 '+a.length+' 人在岗 · 按时长从高到低排列',w/2,49);x.fillStyle='#666';x.textAlign='left';x.fillText('通话(分钟)',18,T-12);
  for(let i=0;i<=ticks;i++){let yy=T+ph-i*ph/ticks;x.strokeStyle='#edf0f4';x.lineWidth=1;x.beginPath();x.moveTo(L,yy);x.lineTo(w-R,yy);x.stroke();x.fillStyle='#687280';x.textAlign='right';x.fillText(Math.round(max*i/ticks),L-12,yy+4)}
  const curve=()=>{x.beginPath();x.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length-1;i++){let mx=(pts[i].x+pts[i+1].x)/2,my=(pts[i].y+pts[i+1].y)/2;x.quadraticCurveTo(pts[i].x,pts[i].y,mx,my)}x.lineTo(pts.at(-1).x,pts.at(-1).y)};
  curve();x.lineTo(pts.at(-1).x,T+ph);x.lineTo(pts[0].x,T+ph);x.closePath();let grad=x.createLinearGradient(0,T,0,T+ph);grad.addColorStop(0,'rgba(82,196,26,.30)');grad.addColorStop(1,'rgba(82,196,26,.02)');x.fillStyle=grad;x.fill();curve();x.strokeStyle='#52c41a';x.lineWidth=3;x.stroke();
  pts.forEach((p,i)=>{x.fillStyle='#52c41a';x.beginPath();x.arc(p.x,p.y,3,0,Math.PI*2);x.fill();x.save();x.translate(p.x+4,T+ph+13);x.rotate(-Math.PI/4);x.fillStyle='#555';x.font='10px Microsoft YaHei';x.textAlign='right';x.fillText(a[i].name,0,0);x.restore()});
  let ay=T+ph-avg/max*ph;x.strokeStyle='#fa8c16';x.setLineDash([8,5]);x.lineWidth=1.6;x.beginPath();x.moveTo(L,ay);x.lineTo(w-R,ay);x.stroke();x.setLineDash([]);x.fillStyle='#fa8c16';x.font='12px Microsoft YaHei';x.textAlign='right';x.fillText('人均 '+avg.toFixed(1)+' 分',w-R-5,ay-8);
  const maxP=pts[0],minI=vals.findIndex(v=>v===Math.min(...vals)),minP=pts[minI];x.fillStyle='#fa541c';x.beginPath();x.arc(maxP.x,maxP.y-36,25,0,Math.PI*2);x.fill();x.beginPath();x.moveTo(maxP.x-7,maxP.y-13);x.lineTo(maxP.x+7,maxP.y-13);x.lineTo(maxP.x,maxP.y-3);x.fill();x.fillStyle='#fff';x.font='700 11px Microsoft YaHei';x.textAlign='center';x.fillText('最高',maxP.x,maxP.y-40);x.fillText(vals[0].toFixed(1)+'分',maxP.x,maxP.y-27);x.fillStyle='#8c8c8c';x.beginPath();x.arc(minP.x,minP.y-35,24,0,Math.PI*2);x.fill();x.beginPath();x.moveTo(minP.x-7,minP.y-13);x.lineTo(minP.x+7,minP.y-13);x.lineTo(minP.x,minP.y-3);x.fill();x.fillStyle='#333';x.fillText('最低',minP.x,minP.y-39);x.fillText(Math.round(vals[minI]*10)/10+'分',minP.x,minP.y-26);x.strokeStyle='#667085';x.beginPath();x.moveTo(L,T+ph);x.lineTo(w-R,T+ph);x.stroke()
}
function sdBindCallsHover(canvas,d){const parent=canvas.parentElement;if(!parent)return;parent.style.position='relative';let guide=parent.querySelector('.sd-call-guide'),tip=parent.querySelector('.sd-call-tip');if(!guide){guide=document.createElement('div');guide.className='sd-call-guide';parent.appendChild(guide)}if(!tip){tip=document.createElement('div');tip.className='sd-call-tip';parent.appendChild(tip)}if(!document.getElementById('sd-call-hover-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-call-hover-css">.sd-call-guide{display:none;position:absolute;z-index:2;top:86px;bottom:95px;border-left:1px dashed #b8c2cc;pointer-events:none}.sd-call-tip{display:none;position:absolute;z-index:8;min-width:224px;padding:12px 15px;background:rgba(255,255,255,.98);border:1px solid #d9d9d9;border-radius:5px;box-shadow:0 6px 18px rgba(15,23,42,.18);pointer-events:none;color:#666;font-size:14px;line-height:1.65}.sd-call-tip strong{color:#555;font-size:15px}.sd-call-tip .sd-call-meta{margin-left:7px;color:#666}.sd-call-tip p{margin:1px 0}.sd-call-tip .sd-call-value{color:#52c41a;font-weight:700}.sd-dist-chart canvas[data-sd-chart="calls"]{cursor:crosshair}</style>');const a=sdCallRank(d.on);canvas.onmousemove=e=>{const box=canvas.getBoundingClientRect(),px=e.clientX-box.left,py=e.clientY-box.top,L=72,R=28,T=86,B=95,pw=box.width-L-R,slot=pw/Math.max(1,a.length-1),idx=Math.round((px-L)/slot);if(idx<0||idx>=a.length||px<L-slot/2||px>box.width-R+slot/2||py<T||py>box.height-B+62){guide.style.display=tip.style.display='none';return}const v=a[idx],pointX=L+idx*slot,minutes=Math.round(v.c/6)/10;guide.style.display='block';guide.style.left=pointX+'px';tip.innerHTML='<div><strong>'+v.name+'</strong><span class="sd-call-meta">('+v.g+' / '+v.code+')</span></div><p>通话时长： <span class="sd-call-value">'+minutes+' 分钟</span></p><p>排程量： '+v.p+' 批</p>';tip.style.display='block';let left=pointX+16,top=py-72;left=Math.min(Math.max(12,left),box.width-274);top=Math.min(Math.max(60,top),box.height-132);tip.style.left=left+'px';tip.style.top=top+'px'};canvas.onmouseleave=()=>{guide.style.display=tip.style.display='none'}}
function sdDrawCharts(targetPanelId){
  document.querySelectorAll('#seatPerformanceDashboardPage canvas[data-sd-chart]').forEach(c=>{
    if(targetPanelId && String(c.dataset.panel) !== String(targetPanelId)) return;
    const panel=c.closest('.sd-panel');
    if(panel&&panel.classList.contains('is-collapsed'))return;
    const r=c.getBoundingClientRect();
    if(r.width<=40||r.height<=40)return;
    const d=sdCalc(sdF[c.dataset.panel]),k=c.dataset.sdChart;
    if(k==='bar'){sdDrawBar(c,d);sdBindBarHover(c,d)}
    else if(k==='donut'){sdDrawDonut(c,d);sdBindDonutHover(c,d)}
    else if(k==='schedule'){sdDrawSchedule(c,d);sdBindScheduleHover(c,d)}
    else{sdDrawCalls(c,d);sdBindCallsHover(c,d)}
  });
}

// 图表标签避让：柱状图标签与图例分区，环图标签为三组预留固定位置，避免数值相互覆盖。
function sdDrawBar(canvas,d){
  const {x,w,h}=sdCanvas(canvas),L=66,R=64,T=118,B=48,pw=w-L-R,ph=h-T-B;
  const maxP=sdNiceMax(Math.max(...d.gs.map(g=>g.p)),10),mins=d.gs.map(g=>Math.round(g.c/6)/10),maxC=sdNiceMax(Math.max(...mins),100);
  x.clearRect(0,0,w,h);x.fillStyle='#253754';x.font='700 15px Microsoft YaHei';x.textAlign='center';x.fillText('小组：排程量(批) vs 通话时长(分钟)',w/2,26);
  x.font='13px Microsoft YaHei';x.fillStyle='#2f64b9';x.fillRect(w/2-122,48,34,18);x.fillStyle='#52637c';x.textAlign='left';x.fillText('排程量(批)',w/2-80,62);x.fillStyle='#2f8066';x.fillRect(w/2+26,48,34,18);x.fillStyle='#52637c';x.fillText('通话时长(分钟)',w/2+68,62);
  x.strokeStyle='#e5eaf2';x.lineWidth=1;for(let i=0;i<=5;i++){const yy=T+ph-i*ph/5;x.beginPath();x.moveTo(L,yy);x.lineTo(w-R,yy);x.stroke();x.fillStyle='#718198';x.textAlign='right';x.fillText(Math.round(maxP*i/5),L-12,yy+4);x.textAlign='left';x.fillText(Math.round(maxC*i/5),w-R+10,yy+4)}
  x.fillStyle='#718198';x.textAlign='left';x.fillText('排程量(批)',18,T-18);x.textAlign='right';x.fillText('通话(分钟)',w-10,T-18);
  const groupW=pw/3,bw=Math.min(64,groupW*.28);d.gs.forEach((g,i)=>{const cx=L+groupW*(i+.5),bh=g.p/maxP*ph,ch=mins[i]/maxC*ph,scheduleLabel=g.p+'批',callLabel=mins[i]+'分',fitsInside=bw>=58&&bh>=30&&ch>=30;x.fillStyle='#2f64b9';x.beginPath();x.roundRect(cx-bw-3,T+ph-bh,bw,bh,[5,5,0,0]);x.fill();x.fillStyle='#2f8066';x.beginPath();x.roundRect(cx+3,T+ph-ch,bw,ch,[5,5,0,0]);x.fill();x.font='700 12px Microsoft YaHei';x.textAlign='center';if(fitsInside){x.fillStyle='#fff';x.fillText(scheduleLabel,cx-bw/2-3,T+ph-bh+19);x.fillText(callLabel,cx+bw/2+3,T+ph-ch+19)}else{x.fillStyle='#334155';x.fillText(scheduleLabel,cx-bw/2-3,Math.max(T+17,T+ph-bh-8));x.fillText(callLabel,cx+bw/2+3,Math.max(T+31,T+ph-ch-8))}x.font='700 14px Microsoft YaHei';x.fillStyle='#64748b';x.fillText(g.g,cx,h-16)});
  x.strokeStyle='#718198';x.beginPath();x.moveTo(L,T+ph);x.lineTo(w-R,T+ph);x.stroke();
}
function sdDrawDonut(canvas,d){
  const {x,w,h}=sdCanvas(canvas),vals=d.gs.map(g=>g.c/60),visible=sdDonutVisible[canvas.dataset.panel]||[true,true,true],total=vals.reduce((sum,value)=>sum+value,0),colors=['#2f64b9','#5c7fa3','#8aa1ba'],cx=w/2,cy=164,r=Math.min(94,w*.18),inner=r*.62;
  x.clearRect(0,0,w,h);x.fillStyle='#253754';x.font='700 15px Microsoft YaHei';x.textAlign='center';x.fillText('小组通话时长占比',cx,27);
  let angle=-Math.PI/2;if(total){vals.forEach((value,index)=>{const span=value/total*Math.PI*2;if(visible[index]){x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,r,angle,angle+span);x.closePath();x.fillStyle=colors[index];x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke()}angle+=span})}else{x.strokeStyle='#e7edf4';x.lineWidth=r-inner;x.beginPath();x.arc(cx,cy,(r+inner)/2,0,Math.PI*2);x.stroke()}
  x.beginPath();x.arc(cx,cy,inner,0,Math.PI*2);x.fillStyle='#fff';x.fill();x.fillStyle='#52637c';x.font='700 13px Microsoft YaHei';x.textAlign='center';x.fillText('通话总时长',cx,cy-4);x.font='700 17px Microsoft YaHei';x.fillStyle='#253754';x.fillText(Math.round(total)+' 分',cx,cy+20);
  const labels=[{x:cx+r+58,y:112,align:'left'},{x:cx+10,y:294,align:'center'},{x:cx-r-58,y:150,align:'right'}];d.gs.forEach((g,index)=>{if(!visible[index])return;const label=labels[index],value=Math.round(vals[index]*10)/10,pct=total?(vals[index]/total*100).toFixed(2):'0.00';x.strokeStyle=colors[index];x.lineWidth=1.5;x.beginPath();if(index===1){x.moveTo(cx,cy+r);x.lineTo(cx,278);x.lineTo(label.x,278)}else{const side=index===0?1:-1;x.moveTo(cx+side*r*.82,cy+(index===0?-r*.5:r*.1));x.lineTo(label.x-side*14,label.y-4);x.lineTo(label.x-side*4,label.y-4)}x.stroke();x.fillStyle='#334155';x.font='13px Microsoft YaHei';x.textAlign=label.align;x.fillText(g.g,label.x,label.y);x.fillText(value+'分（'+pct+'%）',label.x,label.y+18)});
  const ly=h-26,start=cx-110;d.gs.forEach((g,index)=>{const xx=start+index*105;x.fillStyle=visible[index]?colors[index]:'#c9d1dc';x.beginPath();x.roundRect(xx,ly-12,28,16,4);x.fill();x.fillStyle=visible[index]?'#52637c':'#9aa7b8';x.font='13px Microsoft YaHei';x.textAlign='left';x.fillText(g.g,xx+37,ly+1)});
}
function sdBindDonutHover(canvas,d){
  const parent=canvas.parentElement;if(!parent)return;parent.style.position='relative';let tip=parent.querySelector('.sd-donut-tip');if(!tip){tip=document.createElement('div');tip.className='sd-donut-tip';parent.appendChild(tip)}
  if(!document.getElementById('sd-donut-final-hover-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-donut-final-hover-css">#seatPerformanceDashboardPage .sd-donut-tip{display:none;position:absolute;z-index:12;min-width:172px;padding:11px 14px;border:1px solid #2f64b9;border-radius:6px;background:rgba(255,255,255,.98);box-shadow:0 6px 18px rgba(15,23,42,.18);color:#52637c;font-size:13px;line-height:1.5;pointer-events:none}#seatPerformanceDashboardPage .sd-donut-tip strong{display:block;margin-bottom:2px;color:#334155;font-size:14px;font-weight:600}#seatPerformanceDashboardPage .sd-donut-tip span{display:block;white-space:nowrap;color:#52637c;font-size:13px}</style>');
  const colors=['#2f64b9','#5c7fa3','#8aa1ba'],vals=d.gs.map(g=>g.c/60),panel=canvas.dataset.panel;
  const legendHit=(px,py,w,h)=>{const ly=h-26,start=w/2-110;if(py<ly-23||py>ly+12)return-1;for(let i=0;i<3;i++){const xx=start+i*105;if(px>=xx-8&&px<=xx+91)return i}return-1};
  canvas.onmousemove=e=>{const box=canvas.getBoundingClientRect(),px=e.clientX-box.left,py=e.clientY-box.top,legendIndex=legendHit(px,py,box.width,box.height);if(legendIndex>=0){tip.style.display='none';canvas.style.cursor='pointer';return}const visible=sdDonutVisible[panel]||[true,true,true],total=vals.reduce((sum,value)=>sum+value,0),cx=box.width/2,cy=164,r=Math.min(94,box.width*.18),inner=r*.62,dist=Math.hypot(px-cx,py-cy);if(!total||dist<inner||dist>r){tip.style.display='none';canvas.style.cursor='default';return}let angle=Math.atan2(py-cy,px-cx)+Math.PI/2;if(angle<0)angle+=Math.PI*2;let accumulated=0,index=-1;for(let i=0;i<vals.length;i++){const span=vals[i]/total*Math.PI*2;if(visible[i]&&angle>=accumulated&&angle<accumulated+span){index=i;break}accumulated+=span}if(index<0){tip.style.display='none';return}const value=vals[index],pct=(value/total*100).toFixed(2);tip.innerHTML='<strong>'+d.gs[index].g+'</strong><span>'+Math.round(value*10)/10+' 分钟（'+pct+'%）</span>';tip.style.borderColor=colors[index];tip.style.display='block';let left=px+18,top=py-55;left=Math.min(Math.max(12,left),box.width-276);top=Math.min(Math.max(44,top),box.height-96);tip.style.left=left+'px';tip.style.top=top+'px';canvas.style.cursor='pointer'};
  canvas.onclick=e=>{const box=canvas.getBoundingClientRect(),index=legendHit(e.clientX-box.left,e.clientY-box.top,box.width,box.height);if(index<0)return;sdDonutVisible[panel][index]=!sdDonutVisible[panel][index];tip.style.display='none';sdDrawDonut(canvas,d)};canvas.onmouseleave=()=>{tip.style.display='none';canvas.style.cursor='default'};
}
function sdDrawSchedule(canvas,d){
  const {x,w,h}=sdCanvas(canvas),a=sdScheduleRank(d.on),L=72,R=28,T=86,B=95,pw=w-L-R,ph=h-T-B,max=sdNiceMax(Math.max(...a.map(v=>v.p)),2),avg=a.reduce((sum,value)=>sum+value.p,0)/Math.max(1,a.length),slot=pw/Math.max(1,a.length),bw=Math.min(28,slot*.68),labelStep=Math.max(1,Math.ceil(a.length/16));
  if(!a.length){x.clearRect(0,0,w,h);x.fillStyle='#718198';x.font='14px Microsoft YaHei';x.textAlign='center';x.fillText('当前筛选时段暂无排班人员',w/2,h/2);return}
  x.clearRect(0,0,w,h);x.fillStyle='#253754';x.font='700 15px Microsoft YaHei';x.textAlign='center';x.fillText('上班全员 排程量（单位：批）',w/2,25);x.fillStyle='#718198';x.font='12px Microsoft YaHei';x.fillText('共 '+a.length+' 人在岗 · 按排程量从高到低排列 · 悬停查看完整人员与数值',w/2,49);x.fillStyle='#64748b';x.textAlign='left';x.fillText('排程量(批)',18,T-12);
  for(let i=0;i<=5;i++){const yy=T+ph-i*ph/5;x.strokeStyle='#edf0f4';x.beginPath();x.moveTo(L,yy);x.lineTo(w-R,yy);x.stroke();x.fillStyle='#718198';x.textAlign='right';x.fillText((max*i/5).toFixed(max<10?1:0).replace('.0',''),L-12,yy+4)}
  a.forEach((value,index)=>{const cx=L+slot*(index+.5),bh=value.p/max*ph;x.fillStyle=value.p?'#2f64b9':'#cbd5e1';x.beginPath();x.roundRect(cx-bw/2,T+ph-bh,bw,Math.max(value.p?4:2,bh),[4,4,0,0]);x.fill();if(value.p){x.fillStyle='#334155';x.font='700 10px Microsoft YaHei';x.textAlign='center';x.fillText(value.p,cx,T+ph-bh-7)}if(index%labelStep===0||index===a.length-1){x.save();x.translate(cx+4,T+ph+13);x.rotate(-Math.PI/4);x.fillStyle='#64748b';x.font='10px Microsoft YaHei';x.textAlign='right';x.fillText(value.name,0,0);x.restore()}});
  const averageY=T+ph-avg/max*ph;x.strokeStyle='#c38a32';x.setLineDash([7,5]);x.lineWidth=1.4;x.beginPath();x.moveTo(L,averageY);x.lineTo(w-R,averageY);x.stroke();x.setLineDash([]);x.fillStyle='#9a6f28';x.font='12px Microsoft YaHei';x.textAlign='right';x.fillText('人均 '+avg.toFixed(2)+' 批',w-R-5,averageY-8);x.strokeStyle='#718198';x.beginPath();x.moveTo(L,T+ph);x.lineTo(w-R,T+ph);x.stroke();
}
function sdDrawCalls(canvas,d){
  const {x,w,h}=sdCanvas(canvas),a=sdCallRank(d.on),L=72,R=28,T=86,B=95,pw=w-L-R,ph=h-T-B,vals=a.map(value=>value.c/60),rawMax=Math.max(...vals,1),max=rawMax<=70?70:sdNiceMax(rawMax,200),ticks=rawMax<=70?7:5,avg=vals.reduce((sum,value)=>sum+value,0)/Math.max(1,a.length),slot=pw/Math.max(1,a.length-1),pts=vals.map((value,index)=>({x:L+index*slot,y:T+ph-value/max*ph})),labelStep=Math.max(1,Math.ceil(a.length/16));
  if(!a.length){x.clearRect(0,0,w,h);x.fillStyle='#718198';x.font='14px Microsoft YaHei';x.textAlign='center';x.fillText('当前筛选时段暂无排班人员',w/2,h/2);return}
  x.clearRect(0,0,w,h);x.fillStyle='#253754';x.font='700 15px Microsoft YaHei';x.textAlign='center';x.fillText('上班全员 通话时长（单位：分钟）',w/2,25);x.fillStyle='#718198';x.font='12px Microsoft YaHei';x.fillText('共 '+a.length+' 人在岗 · 按时长从高到低排列 · 悬停查看完整人员与数值',w/2,49);x.fillStyle='#64748b';x.textAlign='left';x.fillText('通话(分钟)',18,T-12);
  for(let i=0;i<=ticks;i++){const yy=T+ph-i*ph/ticks;x.strokeStyle='#edf0f4';x.lineWidth=1;x.beginPath();x.moveTo(L,yy);x.lineTo(w-R,yy);x.stroke();x.fillStyle='#718198';x.textAlign='right';x.fillText(Math.round(max*i/ticks),L-12,yy+4)}
  const curve=()=>{x.beginPath();x.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length-1;i++){const middleX=(pts[i].x+pts[i+1].x)/2,middleY=(pts[i].y+pts[i+1].y)/2;x.quadraticCurveTo(pts[i].x,pts[i].y,middleX,middleY)}x.lineTo(pts.at(-1).x,pts.at(-1).y)};curve();x.lineTo(pts.at(-1).x,T+ph);x.lineTo(pts[0].x,T+ph);x.closePath();const gradient=x.createLinearGradient(0,T,0,T+ph);gradient.addColorStop(0,'rgba(47,128,102,.28)');gradient.addColorStop(1,'rgba(47,128,102,.02)');x.fillStyle=gradient;x.fill();curve();x.strokeStyle='#2f8066';x.lineWidth=3;x.stroke();
  pts.forEach((point,index)=>{x.fillStyle='#2f8066';x.beginPath();x.arc(point.x,point.y,3,0,Math.PI*2);x.fill();if(index%labelStep===0||index===a.length-1){x.save();x.translate(point.x+4,T+ph+13);x.rotate(-Math.PI/4);x.fillStyle='#64748b';x.font='10px Microsoft YaHei';x.textAlign='right';x.fillText(a[index].name,0,0);x.restore()}});
  const averageY=T+ph-avg/max*ph;x.strokeStyle='#c38a32';x.setLineDash([7,5]);x.lineWidth=1.4;x.beginPath();x.moveTo(L,averageY);x.lineTo(w-R,averageY);x.stroke();x.setLineDash([]);x.fillStyle='#9a6f28';x.font='12px Microsoft YaHei';x.textAlign='right';x.fillText('人均 '+avg.toFixed(1)+' 分',w-R-5,averageY-8);
  const topPoint=pts[0],bottomIndex=vals.findIndex(value=>value===Math.min(...vals)),bottomPoint=pts[bottomIndex];x.font='700 11px Microsoft YaHei';x.textAlign='left';x.fillStyle='#2f8066';x.fillText('最高 '+vals[0].toFixed(1)+' 分',Math.min(topPoint.x+8,w-100),Math.max(T+16,topPoint.y-8));x.fillStyle='#718198';x.fillText('最低 '+(Math.round(vals[bottomIndex]*10)/10)+' 分',Math.min(bottomPoint.x+8,w-100),Math.min(T+ph-8,Math.max(T+16,bottomPoint.y-8)));x.strokeStyle='#718198';x.beginPath();x.moveTo(L,T+ph);x.lineTo(w-R,T+ph);x.stroke();
}
const renderSeatPerformanceDashboardBase=renderSeatPerformanceDashboard;
let sdReportIntroExpanded=false;
function sdCompactReportIntro(root){const header=root?.querySelector('header'),intro=header?.querySelector('p');if(!header||!intro)return;if(!intro.dataset.full)intro.dataset.full=intro.innerHTML;const full=intro.dataset.full,cut=full.indexOf('<br>'),summary=cut<0?full:full.slice(0,cut),detail=cut<0?'':full.slice(cut);intro.className='sd-report-intro'+(sdReportIntroExpanded?' is-expanded':'');intro.innerHTML='<span class="sd-report-intro-summary">'+summary+'</span><span class="sd-report-intro-detail">'+detail+'</span>';header.querySelector('.sd-report-intro-toggle')?.remove();header.insertAdjacentHTML('beforeend','<button type="button" class="sd-report-intro-toggle" onclick="toggleSdReportIntro()">'+(sdReportIntroExpanded?'收起说明':'展开口径说明')+'</button>')}
function toggleSdReportIntro(){sdReportIntroExpanded=!sdReportIntroExpanded;sdCompactReportIntro(document.querySelector('#seatPerformanceDashboardPage .sd'))}
renderSeatPerformanceDashboard=function(){
  renderSeatPerformanceDashboardBase();
  const reportIntro=document.querySelector('#seatPerformanceDashboardPage .sd > header p');
  if(reportIntro)reportIntro.innerHTML='两个板块互不影响，均可单独选择「开始日期＋小时 ～ 结束日期＋小时」；筛选一变，相关指标与图表会同步更新。<br><b>口径说明：</b><br>· <b>排程量</b>：回访结果为「试驾排程下发」或「试驾线索下发」的记录；<br>· <b>通话</b>：仅统计已接通的通话，时长累加计算。<br>· <b>目标排程量（日）</b>：小组按“月度目标 ÷ 30”计算；个人按“周排程量 ÷ 该周有效上班天数”计算，结果按 0.5 向上取整。<br>· <b>目标累计</b>：按筛选覆盖的天数累加。<br>· <b>完成度</b>：排程量 ÷ 目标。';
  document.querySelectorAll('#seatPerformanceDashboardPage .filter strong').forEach((item,index)=>{
    const filter=sdF[index+1],data=sdCalc(filter),startHour=String(filter.sh).padStart(2,'0'),endHour=String(filter.eh).padStart(2,'0');
    const range=filter.s===filter.e?filter.s+' '+startHour+'点 ～ '+endHour+'点':filter.s+' '+startHour+'点 ～ '+filter.e+' '+endHour+'点';
    item.textContent='当前时段：'+range+'（覆盖 '+data.ds.length+' 天，'+data.on.length+' 人在岗）';
  });
  const medals=['🥇','🥈','🥉'];
  document.querySelectorAll('#seatPerformanceDashboardPage .grp + table tbody').forEach(body=>{
    [...body.rows].forEach((row,index)=>{
      if(index>2)return;
      [6,8].forEach(column=>{
        const cell=row.cells[column];
        if(cell)cell.innerHTML='<span class="sd-rank-medal" aria-label="组内第 '+(index+1)+' 名">'+medals[index]+'</span>'+cell.textContent;
      });
    });
  });
  const note=document.querySelector('#seatPerformanceDashboardPage .sd > aside');
  if(note)note.remove();
  let visual=document.getElementById('sd-visual-upgrade-css');
  const visualCss=`
    #seatPerformanceDashboardPage .sd{--sd-blue:#2f64b9;--sd-blue-soft:#edf3fb;--sd-ink:#1e2b3d;--sd-muted:#6c7b93;--sd-line:#e4eaf2;--sd-bg:#f5f7fa;background:var(--sd-bg);padding:28px 32px 44px;font-family:"Microsoft YaHei","PingFang SC",sans-serif;color:var(--sd-ink)}
    #seatPerformanceDashboardPage .sd>header{position:relative;overflow:hidden;margin-bottom:16px;padding:30px 34px 28px;border:1px solid #dce7fb;border-radius:16px;background:linear-gradient(115deg,#fff 0%,#f5f9ff 100%);box-shadow:0 8px 24px rgba(42,82,150,.06)}
    #seatPerformanceDashboardPage .sd>header:after{content:"";position:absolute;right:-68px;top:-98px;width:300px;height:300px;border:42px solid rgba(36,107,254,.07);border-radius:50%}
    #seatPerformanceDashboardPage .sd h1{position:relative;z-index:1;margin:0 0 10px;font-size:26px;line-height:1.35;letter-spacing:.2px;color:#17233b}
    #seatPerformanceDashboardPage .sd header p{position:relative;z-index:1;max-width:1120px;margin:0;color:#64748b;font-size:13px;line-height:1.85}
    #seatPerformanceDashboardPage .sd>aside{margin:0 0 18px;padding:13px 18px;border:1px solid #f5d9a7;border-left:4px solid #f3a52f;border-radius:10px;background:#fffaf0;color:#795318;box-shadow:none;line-height:1.75}
    #seatPerformanceDashboardPage .sd .major{margin:0 0 22px;padding:0;overflow:hidden;border:1px solid var(--sd-line);border-radius:16px;background:#fff;box-shadow:0 8px 26px rgba(37,56,88,.055)}
    #seatPerformanceDashboardPage .sd .major-title{padding:18px 26px;border-radius:0;background:linear-gradient(100deg,#315f9f,#527daf);font-size:18px;letter-spacing:.2px;box-shadow:none}
    #seatPerformanceDashboardPage .sd .major-title.month{background:linear-gradient(100deg,#315f9f,#527daf)}
    #seatPerformanceDashboardPage .sd .filter{display:grid;grid-template-columns:auto minmax(124px,1fr) auto minmax(88px,130px) auto minmax(124px,1fr) auto minmax(88px,130px) auto;gap:10px;align-items:center;margin:20px 24px 0;padding:14px 16px;border:1px solid #dbe7fa;border-radius:12px;background:#f7faff;color:#52627b;font-weight:700;font-size:13px}
    #seatPerformanceDashboardPage .sd .filter select{width:100%;height:34px;padding:0 28px 0 10px;border:1px solid #cdd9ed;border-radius:7px;background:#fff;color:#334155;font-weight:500;outline:none;transition:.18s}
    #seatPerformanceDashboardPage .sd .filter select:hover,#seatPerformanceDashboardPage .sd .filter select:focus{border-color:var(--sd-blue);box-shadow:0 0 0 3px rgba(36,107,254,.11)}
    #seatPerformanceDashboardPage .sd .filter button{height:34px;padding:0 16px;border-radius:7px;background:var(--sd-blue);box-shadow:0 3px 8px rgba(36,107,254,.2);transition:.18s}
    #seatPerformanceDashboardPage .sd .filter button:hover{background:#1558e8;transform:translateY(-1px)}
    #seatPerformanceDashboardPage .sd .filter strong{grid-column:1/-1;margin:0;padding-top:11px;border-top:1px dashed #d6e2f5;color:#246bfe;font-size:12px;font-weight:700}
    #seatPerformanceDashboardPage .sd .note{margin:12px 26px 0;color:#7a889d;font-size:12px;line-height:1.75}
    #seatPerformanceDashboardPage .sd .kpis{margin:18px 24px 22px;gap:12px}
    #seatPerformanceDashboardPage .sd .kpis>div{position:relative;min-height:126px;padding:18px 18px 16px;overflow:hidden;border:1px solid #e6edf8;border-radius:12px;background:linear-gradient(145deg,#fff,#fbfdff);box-shadow:none;transition:.2s}
    #seatPerformanceDashboardPage .sd .kpis>div:before{content:"";position:absolute;left:0;top:0;width:100%;height:3px;background:#2f64b9}
    #seatPerformanceDashboardPage .sd .kpis>div:nth-child(2):before{background:#4e78a9}#seatPerformanceDashboardPage .sd .kpis>div:nth-child(3):before{background:#6b84a5}#seatPerformanceDashboardPage .sd .kpis>div:nth-child(4):before{background:#8b99aa}
    #seatPerformanceDashboardPage .sd .kpis>div:hover{transform:translateY(-2px);border-color:#cfe0ff;box-shadow:0 8px 18px rgba(47,93,170,.09)}
    #seatPerformanceDashboardPage .sd .kpis small{color:#718198;font-weight:700;font-size:12px}#seatPerformanceDashboardPage .sd .kpis b{margin:8px 0 6px;font-size:28px;letter-spacing:.2px;color:#17233b}#seatPerformanceDashboardPage .sd .kpis span{color:#94a0b1;font-size:12px}#seatPerformanceDashboardPage .sd .kpis i{color:#718198;font-size:13px}
    #seatPerformanceDashboardPage .sd .box{margin:0 24px 18px;padding:20px 22px;border:1px solid #e8edf5;border-radius:12px;background:#fff;box-shadow:none}
    #seatPerformanceDashboardPage .sd .box h3{margin:0 0 18px;padding-left:11px;border-left:4px solid var(--sd-blue);color:#253754;font-size:16px;line-height:1.3}#seatPerformanceDashboardPage .sd .box h4{color:#52637c}
    #seatPerformanceDashboardPage .sd table{overflow:hidden;border:1px solid #e9eef5;border-radius:8px;font-size:13px;color:#43536b}
    #seatPerformanceDashboardPage .sd th{padding:11px 9px;border-bottom:1px solid #dfe7f2;background:#f3f7fc;color:#60718a;font-weight:700;white-space:nowrap}
    #seatPerformanceDashboardPage .sd td{padding:10px 9px;border-bottom:1px solid #eef2f7;white-space:nowrap}#seatPerformanceDashboardPage .sd table tbody tr:nth-child(even){background:#fbfcfe}#seatPerformanceDashboardPage .sd table tbody tr:hover{background:#f2f7ff}#seatPerformanceDashboardPage .sd table tbody tr:last-child td{border-bottom:0}
    #seatPerformanceDashboardPage .sd .pc{color:#2f64b9}#seatPerformanceDashboardPage .sd .call{color:#287b5b}#seatPerformanceDashboardPage .sd .sum{background:#f0f5fb!important;color:#263b57}#seatPerformanceDashboardPage .sd .sum td{font-weight:800}
    #seatPerformanceDashboardPage .sd .sd-rank-medal{display:inline-block;margin-right:4px;font-size:13px;line-height:1;vertical-align:-1px}
    #seatPerformanceDashboardPage .sd .charts{gap:16px}#seatPerformanceDashboardPage .sd .charts>div,#seatPerformanceDashboardPage .sd .sd-chart-cell{border-color:#e6edf5;border-radius:10px;background:#fcfdff}#seatPerformanceDashboardPage .sd .sd-chart-cell{padding:14px}
    #seatPerformanceDashboardPage .sd .sd-dist-legend,#seatPerformanceDashboardPage .sd .sd-detail-legend{gap:16px;margin:10px 0 18px;padding:10px 12px;border-radius:8px;background:#f8fafc;color:#738198}#seatPerformanceDashboardPage .sd .sd-rest-note{border-color:#dfe7f1;background:#f8fafc;color:#65758b}
    #seatPerformanceDashboardPage .sd .grp{margin:20px 0 10px;padding:12px 16px;border:0;border-radius:8px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.22)}#seatPerformanceDashboardPage .sd .grp span{opacity:.92}#seatPerformanceDashboardPage .sd .grp.a{background:#315f9f}#seatPerformanceDashboardPage .sd .grp.b{background:#4e718d}#seatPerformanceDashboardPage .sd .grp.c{background:#687d96}
    #seatPerformanceDashboardPage .sd caption{padding:12px;background:#f7faff;color:#2f64b9}#seatPerformanceDashboardPage .sd .sd-panel-2 .major-title{background:linear-gradient(100deg,#315f9f,#527daf)}
    @media(max-width:1180px){#seatPerformanceDashboardPage .sd .filter{grid-template-columns:auto minmax(105px,1fr) auto minmax(82px,110px) auto;gap:8px}#seatPerformanceDashboardPage .sd .filter strong{grid-column:1/-1}#seatPerformanceDashboardPage .sd .kpis{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:760px){#seatPerformanceDashboardPage .sd{padding:14px}#seatPerformanceDashboardPage .sd>header{padding:22px 20px}#seatPerformanceDashboardPage .sd h1{font-size:21px}#seatPerformanceDashboardPage .sd .filter{display:flex;align-items:center;margin:14px 14px 0}#seatPerformanceDashboardPage .sd .filter select{width:auto;flex:1;min-width:104px}#seatPerformanceDashboardPage .sd .filter strong{width:100%}#seatPerformanceDashboardPage .sd .kpis,#seatPerformanceDashboardPage .sd .box{margin-left:14px;margin-right:14px}#seatPerformanceDashboardPage .sd .kpis{grid-template-columns:1fr}#seatPerformanceDashboardPage .sd .box{overflow-x:auto}#seatPerformanceDashboardPage .sd .charts,#seatPerformanceDashboardPage .sd .sd-chart-grid{grid-template-columns:1fr}}
  `;
  if(visual)visual.textContent=visualCss;else document.head.insertAdjacentHTML('beforeend','<style id="sd-visual-upgrade-css">'+visualCss+'</style>');
  if(!document.getElementById('sd-report-intro-collapse-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-report-intro-collapse-css">#seatPerformanceDashboardPage .sd>header{padding-right:210px}#seatPerformanceDashboardPage .sd .sd-report-intro-detail{display:none}#seatPerformanceDashboardPage .sd .sd-report-intro.is-expanded .sd-report-intro-detail{display:inline}#seatPerformanceDashboardPage .sd .sd-report-intro-toggle{position:absolute;z-index:2;top:28px;right:34px;height:34px;padding:0 13px;border:1px solid #c8d9f1;border-radius:7px;background:#fff;color:#315f9f;font:700 13px "Microsoft YaHei","PingFang SC",sans-serif;cursor:pointer;transition:border-color .18s,background .18s,box-shadow .18s}#seatPerformanceDashboardPage .sd .sd-report-intro-toggle:hover{border-color:#89abe0;background:#f4f8ff;box-shadow:0 3px 9px rgba(47,100,185,.12)}@media(max-width:760px){#seatPerformanceDashboardPage .sd>header{padding-right:20px;padding-bottom:68px}#seatPerformanceDashboardPage .sd .sd-report-intro-toggle{top:auto;right:20px;bottom:20px}}</style>');
  if(!document.getElementById('sd-report-type-system-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-report-type-system-css">#seatPerformanceDashboardPage .sd{font-family:"Microsoft YaHei","PingFang SC",sans-serif;font-synthesis:none;color:#43536b}#seatPerformanceDashboardPage .sd :is(p,span,small,td,th,em,select,button,option,input){font-family:"Microsoft YaHei","PingFang SC",sans-serif;font-style:normal}#seatPerformanceDashboardPage .sd :is(p,td,.note,.sd-under-caption,.sd-under-note,.sd-under-kpis span,.sd-under-averages span){font-weight:400}#seatPerformanceDashboardPage .sd :is(h1,.major-title,.sd-under-title,.box h3,.sd-under-box h3,th,.filter,.sd-under-filter,strong){font-weight:700}#seatPerformanceDashboardPage .sd :is(.kpis b,.sd-under-kpis b,.sd-under-averages b,.pc,.call,.sd-under-critical,.sd-under-active){font-weight:700}#seatPerformanceDashboardPage .sd :is(.kpis small,.sd-under-kpis small,.sd-under-averages small,.note,.sd-under-caption){color:#718198}#seatPerformanceDashboardPage .sd :is(.kpis span,.sd-under-kpis span,.sd-under-averages span){color:#94a0b1}#seatPerformanceDashboardPage .sd td{font-size:13px;line-height:1.55}#seatPerformanceDashboardPage .sd th{font-size:13px;line-height:1.45}#seatPerformanceDashboardPage .sd .major-title,#seatPerformanceDashboardPage .sd .sd-under-title{font-weight:700}#seatPerformanceDashboardPage .sd .sd-under-group span{font-weight:400}#seatPerformanceDashboardPage .sd .sd-under-status{font-style:normal;font-weight:700}</style>');
  if(!document.getElementById('sd-report-group-type-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-report-group-type-css">#seatPerformanceDashboardPage .sd :is(.grp,.sd-under-group){min-height:54px;padding:13px 16px;font-family:"Microsoft YaHei","PingFang SC",sans-serif}#seatPerformanceDashboardPage .sd :is(.grp b,.sd-under-group b){font-size:16px;font-weight:700;font-style:normal;line-height:1.4}#seatPerformanceDashboardPage .sd :is(.grp span,.sd-under-group span){font-family:"Microsoft YaHei","PingFang SC",sans-serif;font-size:14px;font-weight:700;font-style:normal;line-height:1.4;color:#fff;opacity:.92;letter-spacing:0;white-space:nowrap}</style>');
  if(!document.getElementById('sd-performance-filter-consistency-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-performance-filter-consistency-css">#seatPerformanceDashboardPage .sd .major .filter{display:flex;align-items:center;gap:10px;min-height:62px;padding:12px 16px;border-color:#d7e4f7;background:linear-gradient(90deg,#f8fbff,#f4f8fd)}#seatPerformanceDashboardPage .sd .major .filter select{flex:0 0 108px;width:108px}#seatPerformanceDashboardPage .sd .major .filter select:nth-of-type(1),#seatPerformanceDashboardPage .sd .major .filter select:nth-of-type(3){flex-basis:180px;width:180px}#seatPerformanceDashboardPage .sd .major .filter strong{flex:0 0 auto;width:auto;margin-left:6px;padding:0 0 0 14px;border:0;border-left:1px solid #d6e2f2;color:#315f9f;white-space:nowrap;line-height:34px}#seatPerformanceDashboardPage .sd .major .filter button:active{transform:translateY(1px);box-shadow:none}@media(max-width:1180px){#seatPerformanceDashboardPage .sd .major .filter strong{margin-left:0;flex-basis:100%;border-left:0;padding-left:0;line-height:1.5}}@media(max-width:760px){#seatPerformanceDashboardPage .sd .major .filter select,#seatPerformanceDashboardPage .sd .major .filter select:nth-of-type(1),#seatPerformanceDashboardPage .sd .major .filter select:nth-of-type(3){flex:1 1 110px;width:auto}#seatPerformanceDashboardPage .sd .major .filter strong{width:100%}}</style>');
  if(!document.getElementById('sd-chart-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-chart-css">.sd-chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px}.sd-chart-cell{height:390px;border:1px solid #f0f2f5;border-radius:8px;padding:12px;background:#fff}.sd-chart-cell canvas,.sd-dist-chart canvas{display:block;width:100%;height:100%}.sd-dist-legend,.sd-detail-legend{display:flex;align-items:center;gap:18px;margin:12px 0 20px;color:#666;font-size:13px}.sd-dist-legend span,.sd-detail-legend span{display:flex;align-items:center;gap:7px}.sd-dist-legend i,.sd-detail-legend i{width:16px;height:16px;border-radius:4px}.sd-dist-legend .has,.sd-detail-legend .schedule{background:#1677ff}.sd-dist-legend .zero{background:#d9d9d9}.sd-detail-legend .duration{background:#52c41a}.sd-dist-chart{height:430px;width:100%}.sd-dist-divider{height:1px;background:#eef0f5;margin:18px 0}.sd-rest-note{margin-top:18px;padding:13px 16px;border:1px solid #d9e0ea;border-radius:9px;background:#f5f7fa;color:#666;font-size:13px;line-height:1.8}.sd-rest-note b{font-weight:700;color:#666}.sd-detail-legend+.grp{margin-top:0}.sd .grp{min-height:54px;padding:13px 20px;align-items:center;border-radius:8px;font-size:17px}.sd .grp span{font-size:14px;font-weight:600}.sd .grp.a{background:linear-gradient(90deg,#1677ff,#4096ff)}.sd .grp.b{background:linear-gradient(90deg,#52c41a,#73d13d)}.sd .grp.c{background:linear-gradient(90deg,#722ed1,#9254de)}@media(max-width:900px){.sd-chart-grid{grid-template-columns:1fr}.sd-chart-cell{height:360px}.sd-dist-chart{height:380px}}</style>');
  requestAnimationFrame(sdDrawCharts);
}
function applySeatDashboardFilter(id){let f=sdF[id];f.s=document.getElementById('sd'+id+'s').value;f.sh=+document.getElementById('sd'+id+'sh').value;f.e=document.getElementById('sd'+id+'e').value;f.eh=+document.getElementById('sd'+id+'eh').value;if(f.s>f.e||(f.s===f.e&&f.sh>f.eh))return alert('结束时间不能早于开始时间');renderSeatPerformanceDashboard()}

/* 业务报告：留资未满报告。所有统计均限定为“留资未满任务”关联的回访记录。 */
let sdBusinessTab='performance';
let sdUnderF={s:sdDays[6],sh:0,e:sdDays[6],eh:23};
let sdUnderF2={mode:'all',s:sdDays[0],sh:0,e:sdDays[6],eh:23};
const sdUnderTag=g=>g==='A组'?'a':g==='B组'?'b':'c';
function sdUnderCalc(f){
  const days=sdDays.filter(day=>day>=f.s&&day<=f.e);
  const people=sdN.map((seat,index)=>({...seat,under:0,activation:0,plan:0,call:0,tasks:new Set()}));
  days.forEach((day,dayIndex)=>people.forEach((seat,index)=>{
    for(let hour=9;hour<19;hour++){
      if((day===f.s&&hour<f.sh)||(day===f.e&&hour>f.eh)||(day===sdDays[6]&&index>=40))continue;
      const seed=(index*13+dayIndex*17+hour*5)%23;
      if(seed<11)continue;
      seat.under+=1;
      seat.tasks.add(day+'-'+Math.floor(hour/3)+'-'+index);
      if(seed>=15)seat.activation+=1;
      if(seed>=18)seat.plan+=1;
      if(seed%4!==0)seat.call+=65+seed*31;
    }
  }));
  people.forEach(seat=>seat.task=seat.tasks.size);
  const involved=people.filter(seat=>seat.task>0||seat.under>0);
  const groups=sdG.map(g=>{const rows=involved.filter(seat=>seat.g===g).sort((a,b)=>b.under-a.under||b.activation-a.activation||b.plan-a.plan||a.name.localeCompare(b.name,'zh-CN'));return{g,rows,under:rows.reduce((sum,row)=>sum+row.under,0),task:rows.reduce((sum,row)=>sum+row.task,0),plan:rows.reduce((sum,row)=>sum+row.plan,0),activation:rows.reduce((sum,row)=>sum+row.activation,0),call:rows.reduce((sum,row)=>sum+row.call,0)}});
  const total={under:groups.reduce((sum,g)=>sum+g.under,0),task:groups.reduce((sum,g)=>sum+g.task,0),plan:groups.reduce((sum,g)=>sum+g.plan,0),activation:groups.reduce((sum,g)=>sum+g.activation,0),call:groups.reduce((sum,g)=>sum+g.call,0),people:involved.length};
  return{days,people,involved,groups,total};
}
function sdUnderRange(f){const start=String(f.sh).padStart(2,'0'),end=String(f.eh).padStart(2,'0');return f.s===f.e?f.s+' '+start+'点 ～ '+end+'点':f.s+' '+start+'点 ～ '+f.e+' '+end+'点'}
function sdUnderSelect(key,value,hours){const list=hours?[...Array(24).keys()]:sdDays;return '<select id="sdu'+key+'">'+list.map(item=>'<option value="'+item+'" '+(item==value?'selected':'')+'>'+ (hours?String(item).padStart(2,'0')+'点':item)+'</option>').join('')+'</select>'}
function sdUnderRow(row,index){return '<tr><td>'+ (index+1)+'</td><td><b>'+row.name+'</b></td><td><em>'+row.code+'</em></td><td>'+row.task+'</td><td class="sd-under-critical">'+row.under+'</td><td class="pc">'+row.plan+'</td><td class="sd-under-active">'+row.activation+'</td><td class="call">'+sdDur(row.call)+'</td><td><span class="sd-under-status">未满标</span></td></tr>'}
function sdUnderGroup(group){if(!group.rows.length)return '<div class="sd-under-group '+sdUnderTag(group.g)+'"><b>'+group.g+'</b><span>当前筛选时段暂无留资未满任务记录</span></div>';return '<div class="sd-under-group '+sdUnderTag(group.g)+'"><b>'+group.g+'</b><span>留资未满 '+group.under+' 条 · 任务 '+group.task+' 条 · 排程 '+group.plan+' 批 · 激活 '+group.activation+' 批 · 通话 '+sdDur(group.call)+'</span></div><div class="sd-under-table"><table><thead><tr><th>#</th><th>姓名</th><th>佳佳代码</th><th>任务数</th><th>留资未满数</th><th>排程量(批)</th><th>激活量(批)</th><th>通话时长</th><th>状态</th></tr></thead><tbody>'+group.rows.map(sdUnderRow).join('')+'</tbody></table></div>'}
function sdUnderContent(data,total){return '<div class="sd-under-note">本筛选条件下共 <b>'+total.under+'</b> 条留资未满回访记录，涉及 <b>'+total.people+'</b> 名员工。</div><div class="sd-under-kpis"><div><small>留资未满总数</small><b>'+total.under+' <i>条</i></b><span>按回访记录，不去重</span></div><div><small>涉及员工数</small><b>'+total.people+' <i>人</i></b><span>任务数 ＞ 0 或留资未满数 ＞ 0</span></div><div><small>总排程量</small><b>'+total.plan+' <i>批</i></b><span>试驾排程 / 试驾线索下发</span></div><div><small>总激活量</small><b>'+total.activation+' <i>批</i></b><span>含排程类与意向线索下发</span></div><div><small>总通话时长</small><b>'+sdDur(total.call)+'</b><span>仅已接通记录</span></div></div><div class="sd-under-box"><h3>一、留资未满员工明细（按 A组 → B组 → C组）</h3>'+data.groups.map(sdUnderGroup).join('')+'</div><div class="sd-under-box"><h3>二、留资未满数 / 激活量 / 排程量分布</h3>'+renderSdUnderDistribution(data)+'</div><div class="sd-under-box"><h3>三、各小组指标汇总对比</h3><div class="sd-under-table"><table><thead><tr><th>小组</th><th>涉及人数</th><th>留资未满数</th><th>任务数</th><th>排程量(批)</th><th>激活量(批)</th><th>通话时长</th></tr></thead><tbody>'+data.groups.map(group=>'<tr><td>'+group.g+'</td><td>'+group.rows.length+' 人</td><td class="sd-under-critical">'+group.under+'</td><td>'+group.task+'</td><td class="pc">'+group.plan+'</td><td class="sd-under-active">'+group.activation+'</td><td class="call">'+sdDur(group.call)+'</td></tr>').join('')+'<tr class="sum"><td>合计</td><td>'+total.people+' 人</td><td class="sd-under-critical">'+total.under+'</td><td>'+total.task+'</td><td class="pc">'+total.plan+'</td><td class="sd-under-active">'+total.activation+'</td><td class="call">'+sdDur(total.call)+'</td></tr></tbody></table></div></div><div class="sd-under-box"><h3>四、通话时长与人均分析</h3><div class="sd-under-averages"><div><small>总通话时长</small><b>'+sdDur(total.call)+'</b><span>仅统计已接通记录</span></div><div><small>人均通话时长</small><b>'+sdDur(total.call/Math.max(1,total.people))+'</b><span>'+total.people+' 名参与员工</span></div><div><small>人均激活量</small><b>'+(total.activation/Math.max(1,total.people)).toFixed(1)+' 批</b><span>按参与员工计算</span></div><div><small>人均留资未满</small><b>'+(total.under/Math.max(1,total.people)).toFixed(1)+' 条</b><span>按参与员工计算</span></div></div></div>'}
let sdUnderFirstPanelCollapsed=false;
function toggleSdUnderFirstPanel(){
  sdUnderFirstPanelCollapsed=!sdUnderFirstPanelCollapsed;
  const panel=document.querySelector('#seatPerformanceDashboardPage .sd-under-panel-1');
  if(!panel)return;
  panel.classList.toggle('is-collapsed',sdUnderFirstPanelCollapsed);
  panel.querySelectorAll(':scope > :not(.sd-under-title)').forEach(node=>node.hidden=sdUnderFirstPanelCollapsed);
  const btn=panel.querySelector('.sd-under-panel-toggle-btn');
  if(btn)btn.innerHTML=sdUnderFirstPanelCollapsed?'点击展开 ∨':'点击收起 ∧';
  const badge=panel.querySelector('.sd-under-panel-collapsed-badge');
  if(badge)badge.style.display=sdUnderFirstPanelCollapsed?'inline-block':'none';
}
let sdUnderSecondPanelCollapsed=true;
function toggleSdUnderSecondPanel(){
  sdUnderSecondPanelCollapsed=!sdUnderSecondPanelCollapsed;
  const panel=document.querySelector('#seatPerformanceDashboardPage .sd-under-panel-2');
  if(!panel)return;
  panel.classList.toggle('is-collapsed',sdUnderSecondPanelCollapsed);
  panel.querySelectorAll(':scope > :not(.sd-under-title)').forEach(node=>node.hidden=sdUnderSecondPanelCollapsed);
  const btn=panel.querySelector('.sd-under-panel-toggle-btn');
  if(btn)btn.innerHTML=sdUnderSecondPanelCollapsed?'点击展开 ∨':'点击收起 ∧';
  const badge=panel.querySelector('.sd-under-panel-collapsed-badge');
  if(badge)badge.style.display=sdUnderSecondPanelCollapsed?'inline-block':'none';
}

function sdUnderSecondPanel(){const f=sdUnderF2,all=f.mode==='all',data=sdUnderCalc(f),total=data.total,range=all?'全部9月 '+String(f.sh).padStart(2,'0')+'点 ～ '+String(f.eh).padStart(2,'0')+'点':sdUnderRange(f),mode='<select id="sdu2mode" onchange="changeSdUnderSecondMode()"><option value="single" '+(f.mode==='single'?'selected':'')+'>单日</option><option value="range" '+(f.mode==='range'?'selected':'')+'>区间</option><option value="all" '+(all?'selected':'')+'>全部(9月)</option></select>',dates=all?'':f.mode==='single'?'<span>日期</span>'+sdUnderSelect('2s',f.s):'<span>开始日期</span>'+sdUnderSelect('2s',f.s)+'<span>结束日期</span>'+sdUnderSelect('2e',f.e);const isCollapsed=sdUnderSecondPanelCollapsed;return '<section class="sd-under-panel sd-under-panel-2 '+(isCollapsed?'is-collapsed':'')+'"><div class="sd-under-title" onclick="toggleSdUnderSecondPanel()" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;"><div><span>第二大点　当月业绩（可筛选）</span><span class="sd-under-panel-collapsed-badge" style="display:'+(isCollapsed?'inline-block':'none')+';margin-left:10px;font-size:12px;font-weight:400;background:rgba(255,255,255,.22);padding:2px 10px;border-radius:12px;">已收起 · 点击展开查阅</span></div><button type="button" class="sd-under-panel-toggle-btn" onclick="event.stopPropagation();toggleSdUnderSecondPanel()" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.45);color:#fff;border-radius:6px;padding:4px 12px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;">'+(isCollapsed?'点击展开 ∨':'点击收起 ∧')+'</button></div><div class="sd-under-filter sd-under-filter-2"><span>日期模式</span>'+mode+dates+'<span>时段</span>'+sdUnderSelect('2sh',f.sh,true)+'<span>～</span>'+sdUnderSelect('2eh',f.eh,true)+'<button type="button" onclick="applySdUnderSecondFilter()">应用筛选</button><strong>当前：'+range+'（覆盖 '+data.days.length+' 天，涉及 '+total.people+' 名员工）</strong></div>'+sdUnderContent(data,total)+'</section>'}
function renderSdUnderDistribution(data){
  const rows=[...data.involved].sort((a,b)=>b.under-a.under||b.activation-a.activation||b.plan-a.plan||a.name.localeCompare(b.name,'zh-CN'));
  const max=Math.max(1,...rows.flatMap(row=>[row.under,row.activation,row.plan]));
  const bar=(type,value)=>'<div class="sd-under-vbar '+type+'" style="height:'+Math.max(value?5:0,value/max*100)+'%" title="'+value+'"><b>'+value+'</b></div>';
  return '<style id="sd-under-column-chart-css">#seatPerformanceDashboardPage .sd-under-column-scroll{position:relative;overflow-x:auto;padding:6px 2px 10px}#seatPerformanceDashboardPage .sd-under-column-chart{display:grid;align-items:end;gap:8px;min-width:'+Math.max(660,rows.length*92)+'px;height:366px;padding:28px 12px 0;border-bottom:1px solid #97a6ba;background:repeating-linear-gradient(to top,#fff 0,#fff 64px,#edf1f6 65px,#fff 66px)}#seatPerformanceDashboardPage .sd-under-column-item{display:grid;grid-template-rows:270px 46px;min-width:0;cursor:crosshair;border-radius:7px;transition:background .18s}#seatPerformanceDashboardPage .sd-under-column-item.is-hover{background:rgba(47,100,185,.06)}#seatPerformanceDashboardPage .sd-under-column-bars{display:flex;align-items:flex-end;justify-content:center;gap:5px;height:270px;padding:0 5px}#seatPerformanceDashboardPage .sd-under-vbar{position:relative;width:18px;min-height:0;border-radius:5px 5px 0 0;transition:filter .18s,transform .18s}#seatPerformanceDashboardPage .sd-under-column-item.is-hover .sd-under-vbar{filter:brightness(.94);transform:translateY(-2px)}#seatPerformanceDashboardPage .sd-under-vbar b{position:absolute;left:50%;bottom:calc(100% + 5px);transform:translateX(-50%);color:#52637c;font:700 11px "Microsoft YaHei";white-space:nowrap}#seatPerformanceDashboardPage .sd-under-vbar.under{background:#c67a3b}#seatPerformanceDashboardPage .sd-under-vbar.activation{background:#7053b6}#seatPerformanceDashboardPage .sd-under-vbar.plan{background:#2f64b9}#seatPerformanceDashboardPage .sd-under-vname{overflow:hidden;padding-top:8px;color:#64748b;font-size:12px;text-align:center;white-space:nowrap;text-overflow:ellipsis;transform:rotate(-38deg);transform-origin:top center}#seatPerformanceDashboardPage .sd-under-tooltip{display:none;position:absolute;z-index:8;min-width:210px;padding:13px 15px;border:1px solid #dde6f1;border-radius:9px;background:rgba(255,255,255,.98);box-shadow:0 8px 22px rgba(31,47,71,.18);color:#52637c;font-size:13px;line-height:1.7;pointer-events:none}#seatPerformanceDashboardPage .sd-under-tooltip strong{display:block;margin-bottom:4px;color:#253754;font-size:15px}#seatPerformanceDashboardPage .sd-under-tooltip p{display:grid;grid-template-columns:10px 1fr auto;gap:7px;align-items:center;margin:2px 0}#seatPerformanceDashboardPage .sd-under-tooltip i{width:8px;height:8px;border-radius:50%}#seatPerformanceDashboardPage .sd-under-tooltip b{color:#253754}@media(max-width:760px){#seatPerformanceDashboardPage .sd-under-column-chart{height:328px;padding-top:24px}#seatPerformanceDashboardPage .sd-under-column-item{grid-template-rows:236px 42px}#seatPerformanceDashboardPage .sd-under-column-bars{height:236px}}</style><div class="sd-under-chart"><div class="sd-under-chart-legend"><span><i class="under"></i>留资未满数（条）</span><span><i class="activation"></i>激活量（批）</span><span><i class="plan"></i>排程量（批）</span><small>按留资未满数降序；人员较多时横向滚动查看。</small></div><div class="sd-under-column-scroll"><div class="sd-under-column-chart" style="grid-template-columns:repeat('+rows.length+',minmax(84px,1fr))">'+rows.map(row=>'<div class="sd-under-column-item" data-name="'+row.name+'" data-group="'+row.g+'" data-under="'+row.under+'" data-activation="'+row.activation+'" data-plan="'+row.plan+'"><div class="sd-under-column-bars">'+bar('under',row.under)+bar('activation',row.activation)+bar('plan',row.plan)+'</div><div class="sd-under-vname">'+row.name+'</div></div>').join('')+'</div><div class="sd-under-tooltip"></div></div></div>'
}
function sdBindUnderChartHover(){
  document.querySelectorAll('#seatPerformanceDashboardPage .sd-under-column-scroll').forEach(scroll=>{
    const tip=scroll.querySelector('.sd-under-tooltip');if(!tip)return;
    const hide=()=>{tip.style.display='none';scroll.querySelectorAll('.is-hover').forEach(item=>item.classList.remove('is-hover'))};
    const place=(item,event)=>{
      item.classList.add('is-hover');
      tip.innerHTML='<strong>'+item.dataset.name+'（'+item.dataset.group+'）</strong><p><i style="background:#c67a3b"></i><span>留资未满</span><b>'+item.dataset.under+' 条</b></p><p><i style="background:#7053b6"></i><span>激活量</span><b>'+item.dataset.activation+' 批</b></p><p><i style="background:#2f64b9"></i><span>排程量</span><b>'+item.dataset.plan+' 批</b></p>';
      tip.style.display='block';
      const box=scroll.getBoundingClientRect(),maxLeft=Math.max(12,scroll.clientWidth-230),maxTop=Math.max(12,scroll.clientHeight-142);
      tip.style.left=Math.min(Math.max(12,event.clientX-box.left+16),maxLeft)+'px';
      tip.style.top=Math.min(Math.max(12,event.clientY-box.top-112),maxTop)+'px';
    };
    scroll.querySelectorAll('.sd-under-column-item').forEach(item=>{
      item.onmouseenter=event=>place(item,event);
      item.onmousemove=event=>place(item,event);
      item.onmouseleave=hide;
    });
    scroll.onmouseleave=hide;
  });
}
function renderSdUnderReport(){
  const page=document.getElementById('seatPerformanceDashboardPage'),root=page?.querySelector('.sd');if(!root)return;
  if(!document.getElementById('sd-under-average-card-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-under-average-card-css">#seatPerformanceDashboardPage .sd-under-averages{grid-template-columns:repeat(4,1fr)}#seatPerformanceDashboardPage .sd-under-averages>div{border-left:4px solid #2f8066}#seatPerformanceDashboardPage .sd-under-averages>div:nth-child(2){border-left-color:#2f64b9}#seatPerformanceDashboardPage .sd-under-averages>div:nth-child(3){border-left-color:#7053b6}#seatPerformanceDashboardPage .sd-under-averages>div:nth-child(4){border-left-color:#c67a3b}#seatPerformanceDashboardPage .sd-under-caption{margin:16px 22px -4px;color:#7b8798;font-size:13px;line-height:1.6}#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter span:nth-of-type(3),#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) #sdue{display:none}#seatPerformanceDashboardPage .sd-under-panel-2 .sd-under-title{background:linear-gradient(100deg,#496896,#687d96)}#seatPerformanceDashboardPage .sd-under-panel.is-collapsed{padding-bottom:0}#seatPerformanceDashboardPage .sd-under-panel.is-collapsed>:not(.sd-under-title){display:none!important}@media(max-width:1180px){#seatPerformanceDashboardPage .sd-under-averages{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){#seatPerformanceDashboardPage .sd-under-averages{grid-template-columns:1fr}}</style>');
  if(!document.getElementById('sd-under-filter-consistency-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-under-filter-consistency-css">#seatPerformanceDashboardPage .sd-under-filter-2{display:flex;align-items:center;gap:10px}#seatPerformanceDashboardPage .sd-under-filter-2 select{flex:0 0 108px;width:108px}#seatPerformanceDashboardPage .sd-under-filter-2 #sdu2mode{flex-basis:180px;width:180px}#seatPerformanceDashboardPage .sd-under-filter-2 #sdu2s,#seatPerformanceDashboardPage .sd-under-filter-2 #sdu2e{flex-basis:144px;width:144px}#seatPerformanceDashboardPage .sd-under-filter-2 button{flex:0 0 auto}#seatPerformanceDashboardPage .sd-under-filter-2 strong{flex-basis:100%;width:100%}@media(max-width:760px){#seatPerformanceDashboardPage .sd-under-filter-2 select,#seatPerformanceDashboardPage .sd-under-filter-2 #sdu2mode,#seatPerformanceDashboardPage .sd-under-filter-2 #sdu2s,#seatPerformanceDashboardPage .sd-under-filter-2 #sdu2e{flex:1 1 110px;width:auto}}</style>');
  if(!document.getElementById('sd-under-filter-interaction-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-under-filter-interaction-css">#seatPerformanceDashboardPage .sd-under-filter-2{min-height:62px;padding:12px 16px;border-color:#d7e4f7;background:linear-gradient(90deg,#f8fbff,#f4f8fd)}#seatPerformanceDashboardPage .sd-under-filter-2 strong{flex:0 0 auto;width:auto;margin-left:6px;padding:0 0 0 14px;border:0;border-left:1px solid #d6e2f2;color:#315f9f;white-space:nowrap;line-height:34px}#seatPerformanceDashboardPage .sd-under-filter-2 select{transition:border-color .18s,box-shadow .18s;background:#fff}#seatPerformanceDashboardPage .sd-under-filter-2 select:hover{border-color:#8caee0}#seatPerformanceDashboardPage .sd-under-filter-2 select:focus{outline:0;border-color:#2f64b9;box-shadow:0 0 0 3px rgba(47,100,185,.12)}#seatPerformanceDashboardPage .sd-under-filter-2 button{transition:background .18s,transform .18s,box-shadow .18s}#seatPerformanceDashboardPage .sd-under-filter-2 button:hover{background:#24579f;box-shadow:0 3px 8px rgba(47,100,185,.22)}#seatPerformanceDashboardPage .sd-under-filter-2 button:active{transform:translateY(1px);box-shadow:none}@media(max-width:1180px){#seatPerformanceDashboardPage .sd-under-filter-2 strong{margin-left:0;flex-basis:100%;border-left:0;padding-left:0;line-height:1.5}}@media(max-width:760px){#seatPerformanceDashboardPage .sd-under-filter-2 strong{width:100%}}</style>');
  if(!document.getElementById('sd-under-first-filter-interaction-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-under-first-filter-interaction-css">#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter{display:flex;align-items:center;gap:10px;min-height:62px;padding:12px 16px;border-color:#d7e4f7;background:linear-gradient(90deg,#f8fbff,#f4f8fd)}#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter select{flex:0 0 108px;width:108px;transition:border-color .18s,box-shadow .18s;background:#fff}#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter #sdus{flex-basis:180px;width:180px}#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter select:hover{border-color:#8caee0}#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter select:focus{outline:0;border-color:#2f64b9;box-shadow:0 0 0 3px rgba(47,100,185,.12)}#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter button{flex:0 0 auto;transition:background .18s,transform .18s,box-shadow .18s}#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter button:hover{background:#24579f;box-shadow:0 3px 8px rgba(47,100,185,.22)}#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter button:active{transform:translateY(1px);box-shadow:none}#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter strong{flex:0 0 auto;width:auto;margin-left:6px;padding:0 0 0 14px;border:0;border-left:1px solid #d6e2f2;color:#315f9f;white-space:nowrap;line-height:34px}@media(max-width:1180px){#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter strong{margin-left:0;flex-basis:100%;border-left:0;padding-left:0;line-height:1.5}}@media(max-width:760px){#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter select,#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter #sdus{flex:1 1 110px;width:auto}#seatPerformanceDashboardPage .sd-under-panel:not(.sd-under-panel-2) .sd-under-filter strong{width:100%}}</style>');
  if(!document.getElementById('sd-under-panel-radius-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-under-panel-radius-css">#seatPerformanceDashboardPage .sd-under-panel{overflow:hidden}#seatPerformanceDashboardPage .sd-under-panel .sd-under-title{border-radius:0}</style>');
  const f=sdUnderF,data=sdUnderCalc(f),total=data.total,range=sdUnderRange(f),header=root.querySelector('header');
  root.querySelectorAll('.major').forEach(section=>section.remove());
  if(header){header.querySelector('h1').textContent='业务报告';header.querySelector('p').innerHTML='<b>留资未满报告</b>仅统计关联“留资未满任务”的回访记录。支持单独选择「开始日期＋小时 ～ 结束日期＋小时」；筛选条件变化后，相关指标、明细及分布会同步更新。<br><br><b>口径说明：</b><br>· <b>留资未满数</b>：按回访记录逐条计数，不去重。一条回访记录，只要其对应任务（按任务编码）属于留资未满，即计 1；同一任务多次回访会重复计入。<br>· <b>任务数</b>：仅在员工维度按任务编码去重。<br>· <b>激活量</b>：包含排程类结果，即回访结果属于「试驾排程下发、试驾线索下发、意向线索下发」的记录数，单位为批。<br>· <b>排程量</b>：回访结果属于「试驾排程下发、试驾线索下发」的记录数，单位为批。<br>· <b>通话时长</b>：仅统计通话结果为“接通”的记录，通话时长按逗号拆分后累加，单位为秒；且仅统计当前筛选条件内的数据。<br><br><b>留资未满任务</b>：指任务信息表中「是否留资未满」＝“是”的任务。<br><br><b>筛选范围：</b><br>· 第一大点：按所选日期＋小时区间筛选；<br>· 第二大点：按所选日期＋小时区间筛选（默认展示全部 9 月）。'}
  const isFirstCollapsed=sdUnderFirstPanelCollapsed;
  root.insertAdjacentHTML('beforeend','<section class="sd-under-panel sd-under-panel-1 '+(isFirstCollapsed?'is-collapsed':'')+'"><div class="sd-under-title" onclick="toggleSdUnderFirstPanel()" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;"><div><span>第一大点　日期业绩（可筛选）</span><span class="sd-under-panel-collapsed-badge" style="display:'+(isFirstCollapsed?'inline-block':'none')+';margin-left:10px;font-size:12px;font-weight:400;background:rgba(255,255,255,.22);padding:2px 10px;border-radius:12px;">已收起 · 点击展开查阅</span></div><button type="button" class="sd-under-panel-toggle-btn" onclick="event.stopPropagation();toggleSdUnderFirstPanel()" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.45);color:#fff;border-radius:6px;padding:4px 12px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;">'+(isFirstCollapsed?'点击展开 ∨':'点击收起 ∧')+'</button></div><div class="sd-under-filter"><span>开始日期</span>'+sdUnderSelect('s',f.s)+'<span>开始小时</span>'+sdUnderSelect('sh',f.sh,true)+'<span>结束日期</span>'+sdUnderSelect('e',f.e)+'<span>结束小时</span>'+sdUnderSelect('eh',f.eh,true)+'<button type="button" onclick="applySdUnderFilter()">应用筛选</button><strong>当前时段：'+range+'（覆盖 '+data.days.length+' 天，涉及 '+total.people+' 名员工）</strong></div><div class="sd-under-note">本筛选条件下共 <b>'+total.under+'</b> 条留资未满回访记录，涉及 <b>'+total.people+'</b> 名员工。</div><div class="sd-under-kpis"><div><small>留资未满总数</small><b>'+total.under+' <i>条</i></b><span>按回访记录，不去重</span></div><div><small>涉及员工数</small><b>'+total.people+' <i>人</i></b><span>任务数 ＞ 0 或留资未满数 ＞ 0</span></div><div><small>总排程量</small><b>'+total.plan+' <i>批</i></b><span>试驾排程 / 试驾线索下发</span></div><div><small>总激活量</small><b>'+total.activation+' <i>批</i></b><span>含排程类与意向线索下发</span></div><div><small>总通话时长</small><b>'+sdDur(total.call)+'</b><span>仅已接通记录</span></div></div><div class="sd-under-box"><h3>一、留资未满员工明细（按 A组 → B组 → C组）</h3>'+data.groups.map(sdUnderGroup).join('')+'</div><div class="sd-under-box"><h3>二、留资未满数 / 激活量 / 排程量分布</h3>'+renderSdUnderDistribution(data)+'</div><div class="sd-under-box"><h3>三、各小组指标汇总对比</h3><div class="sd-under-table"><table><thead><tr><th>小组</th><th>涉及人数</th><th>留资未满数</th><th>任务数</th><th>排程量(批)</th><th>激活量(批)</th><th>通话时长</th></tr></thead><tbody>'+data.groups.map(group=>'<tr><td>'+group.g+'</td><td>'+group.rows.length+' 人</td><td class="sd-under-critical">'+group.under+'</td><td>'+group.task+'</td><td class="pc">'+group.plan+'</td><td class="sd-under-active">'+group.activation+'</td><td class="call">'+sdDur(group.call)+'</td></tr>').join('')+'<tr class="sum"><td>合计</td><td>'+total.people+' 人</td><td class="sd-under-critical">'+total.under+'</td><td>'+total.task+'</td><td class="pc">'+total.plan+'</td><td class="sd-under-active">'+total.activation+'</td><td class="call">'+sdDur(total.call)+'</td></tr></tbody></table></div></div><div class="sd-under-box"><h3>四、通话时长与人均分析</h3><div class="sd-under-averages"><div><small>总通话时长</small><b>'+sdDur(total.call)+'</b><span>仅统计已接通记录</span></div><div><small>人均通话时长</small><b>'+sdDur(total.call/Math.max(1,total.people))+'</b><span>'+total.people+' 名参与员工</span></div><div><small>人均激活量</small><b>'+(total.activation/Math.max(1,total.people)).toFixed(1)+' 批</b><span>按参与员工计算</span></div><div><small>人均留资未满</small><b>'+(total.under/Math.max(1,total.people)).toFixed(1)+' 条</b><span>按参与员工计算</span></div></div></div></section>');
  root.insertAdjacentHTML('beforeend',sdUnderSecondPanel());
  requestAnimationFrame(sdBindUnderChartHover);
}
function applySdUnderFilter(){const f=sdUnderF;f.s=document.getElementById('sdus').value;f.sh=+document.getElementById('sdush').value;f.e=f.s;f.eh=+document.getElementById('sdueh').value;if(f.sh>f.eh)return alert('结束时间不能早于开始时间');renderSeatPerformanceDashboard()}
function changeSdUnderSecondMode(){const f=sdUnderF2;f.mode=document.getElementById('sdu2mode').value;if(f.mode==='all'){f.s=sdDays[0];f.e=sdDays[sdDays.length-1]}else if(f.mode==='single')f.e=f.s;renderSeatPerformanceDashboard()}
function applySdUnderSecondFilter(){const f=sdUnderF2;f.mode=document.getElementById('sdu2mode').value;if(f.mode!=='all'){f.s=document.getElementById('sdu2s').value;f.e=f.mode==='single'?f.s:document.getElementById('sdu2e').value}else{f.s=sdDays[0];f.e=sdDays[sdDays.length-1]}f.sh=+document.getElementById('sdu2sh').value;f.eh=+document.getElementById('sdu2eh').value;if(f.s>f.e||(f.s===f.e&&f.sh>f.eh))return alert('结束时间不能早于开始时间');renderSeatPerformanceDashboard()}
function switchSdBusinessTab(tab){sdBusinessTab=tab;renderSeatPerformanceDashboard()}
const renderSeatPerformanceDashboardWithBusinessTabs=renderSeatPerformanceDashboard;
renderSeatPerformanceDashboard=function(){
  renderSeatPerformanceDashboardWithBusinessTabs();
  const root=document.querySelector('#seatPerformanceDashboardPage .sd'),header=root?.querySelector('header');if(!root||!header)return;
  header.querySelector('h1').textContent='业务报告';
  header.insertAdjacentHTML('afterend','<nav class="sd-report-tabs" aria-label="业务报告类型"><button type="button" class="'+(sdBusinessTab==='performance'?'active':'')+'" onclick="switchSdBusinessTab(\'performance\')">业绩晾晒报告</button><button type="button" class="'+(sdBusinessTab==='underfilled'?'active':'')+'" onclick="switchSdBusinessTab(\'underfilled\')">留资未满报告</button></nav>');
  if(sdBusinessTab==='underfilled')renderSdUnderReport();
  sdCompactReportIntro(root);
  if(!document.getElementById('sd-under-report-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-under-report-css">#seatPerformanceDashboardPage .sd-report-tabs{display:flex;gap:8px;margin:0 0 16px;padding:6px;border:1px solid #dfe7f2;border-radius:11px;background:#fff;box-shadow:0 4px 12px rgba(37,56,88,.04)}#seatPerformanceDashboardPage .sd-report-tabs button{height:36px;padding:0 18px;border:0;border-radius:7px;background:transparent;color:#64748b;font:700 14px "Microsoft YaHei";cursor:pointer}#seatPerformanceDashboardPage .sd-report-tabs button:hover{background:#f1f5fb;color:#315f9f}#seatPerformanceDashboardPage .sd-report-tabs button.active{background:#edf3fb;color:#2f64b9;box-shadow:inset 0 0 0 1px #cfe0f6}.sd-under-panel{margin:0 0 22px;padding:0 24px 24px;border:1px solid #e4eaf2;border-radius:16px;background:#fff;box-shadow:0 8px 26px rgba(37,56,88,.055)}.sd-under-title{margin:0 -24px;padding:18px 26px;color:#fff;background:linear-gradient(100deg,#315f9f,#527daf);font-size:18px;font-weight:800}.sd-under-filter{display:grid;grid-template-columns:auto minmax(124px,1fr) auto 108px auto minmax(124px,1fr) auto 108px auto;gap:10px;align-items:center;margin:20px 0 0;padding:14px 16px;border:1px solid #dbe7fa;border-radius:12px;background:#f7faff;color:#52627b;font-size:13px;font-weight:700}.sd-under-filter select{height:34px;padding:0 10px;border:1px solid #cdd9ed;border-radius:7px;background:#fff;color:#334155}.sd-under-filter button{height:34px;padding:0 16px;border:0;border-radius:7px;background:#2f64b9;color:#fff;font-weight:700;cursor:pointer}.sd-under-filter strong{grid-column:1/-1;padding-top:11px;border-top:1px dashed #d6e2f5;color:#2f64b9;font-size:12px}.sd-under-note{margin:16px 0;padding:11px 14px;border:1px solid #d7eadc;border-radius:9px;background:#f6fbf6;color:#4a7658;font-size:13px}.sd-under-note b{color:#2f8066}.sd-under-kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:18px}.sd-under-kpis>div,.sd-under-averages>div{position:relative;min-height:118px;padding:17px;border:1px solid #e6edf5;border-radius:11px;background:#fcfdff}.sd-under-kpis>div:before{content:"";position:absolute;top:0;left:0;width:100%;height:3px;background:#315f9f}.sd-under-kpis>div:nth-child(1):before{background:#c67a3b}.sd-under-kpis>div:nth-child(4):before{background:#596f90}.sd-under-kpis>div:nth-child(5):before{background:#2f8066}.sd-under-kpis small,.sd-under-averages small{display:block;color:#718198;font-size:12px;font-weight:700}.sd-under-kpis b,.sd-under-averages b{display:block;margin:8px 0 6px;color:#1e2b3d;font-size:25px}.sd-under-kpis i{color:#718198;font-size:13px;font-style:normal}.sd-under-kpis span,.sd-under-averages span{color:#94a0b1;font-size:12px}.sd-under-box{margin-bottom:18px;padding:20px 22px;border:1px solid #e8edf5;border-radius:12px}.sd-under-box h3{margin:0 0 18px;padding-left:11px;border-left:4px solid #2f64b9;color:#253754;font-size:16px}.sd-under-group{display:flex;justify-content:space-between;align-items:center;margin:16px 0 8px;padding:11px 14px;border-radius:8px;color:#fff}.sd-under-group b{font-size:16px}.sd-under-group span{font-size:13px}.sd-under-group.a{background:#315f9f}.sd-under-group.b{background:#4e718d}.sd-under-group.c{background:#687d96}.sd-under-table{overflow:auto;border:1px solid #e9eef5;border-radius:8px}.sd-under-table table{width:100%;border-collapse:collapse;font-size:13px;color:#43536b}.sd-under-table th{padding:11px 9px;background:#f3f7fc;color:#60718a;white-space:nowrap}.sd-under-table td{padding:10px 9px;text-align:center;white-space:nowrap;border-top:1px solid #eef2f7}.sd-under-table tbody tr:nth-child(even){background:#fbfcfe}.sd-under-table tbody tr:hover{background:#f2f7ff}.sd-under-critical{color:#b6622c;font-weight:800}.sd-under-active{color:#496896;font-weight:800}.sd-under-status{padding:3px 7px;border:1px solid #ead3c7;border-radius:5px;background:#fff8f4;color:#a55838;font-size:12px;font-weight:700}.sd-under-chart-legend{display:flex;flex-wrap:wrap;align-items:center;gap:16px;margin-bottom:14px;padding:10px 12px;border-radius:8px;background:#f8fafc;color:#738198;font-size:13px}.sd-under-chart-legend span{display:flex;gap:6px;align-items:center}.sd-under-chart-legend i{width:12px;height:12px;border-radius:3px}.sd-under-chart-legend .under{background:#c67a3b}.sd-under-chart-legend .activation{background:#596f90}.sd-under-chart-legend .plan{background:#2f64b9}.sd-under-chart-legend small{margin-left:auto;color:#94a0b1}.sd-under-bars{display:grid;gap:7px;max-height:520px;overflow:auto;padding-right:6px}.sd-under-bar-row{display:grid;grid-template-columns:72px 1fr;gap:10px;align-items:center;min-height:20px}.sd-under-bar-name{overflow:hidden;color:#64748b;font-size:12px;white-space:nowrap;text-overflow:ellipsis}.sd-under-bar-tracks{position:relative;height:18px}.sd-under-bar-tracks i{position:absolute;left:0;height:5px;min-width:2px;border-radius:3px}.sd-under-bar-tracks i:after{content:attr(data-value);position:absolute;right:-24px;top:-5px;color:#52637c;font-size:10px;font-style:normal}.sd-under-bar-tracks .under{top:0;background:#c67a3b}.sd-under-bar-tracks .activation{top:6px;background:#596f90}.sd-under-bar-tracks .plan{top:12px;background:#2f64b9}.sd-under-averages{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}@media(max-width:1180px){.sd-under-filter{grid-template-columns:auto minmax(100px,1fr) auto 92px auto}.sd-under-kpis{grid-template-columns:repeat(3,1fr)}}@media(max-width:760px){.sd-report-tabs{overflow:auto}.sd-under-panel{padding:0 14px 14px}.sd-under-title{margin:0 -14px}.sd-under-filter{display:flex;flex-wrap:wrap}.sd-under-filter select{flex:1;min-width:110px}.sd-under-filter strong{width:100%}.sd-under-kpis,.sd-under-averages{grid-template-columns:1fr}.sd-under-group{align-items:flex-start;flex-direction:column;gap:5px}.sd-under-chart-legend small{width:100%;margin-left:0}}</style>');
}

/* 报表配置：与统计报表同一工作区内打开，首期落地全报表共用的人员、坐席与小组映射。 */
let sdReportConfigOpen=false;
let sdReportConfigTab='mapping';
let sdMappingKeyword='';
let sdMappingGroup='all';
let sdMappingStatus='all';
let sdMappingEditId=null;
let sdMappings=[
  {id:1,name:'卢美兰',account:'RiChan13',vcp:'nev004',group:'A组',start:'2026-09-01',end:'长期',status:'启用',updated:'张敏 · 2026-09-01 09:10'},
  {id:2,name:'侯三妹',account:'QiChen003',vcp:'nev005',group:'A组',start:'2026-09-01',end:'长期',status:'启用',updated:'张敏 · 2026-09-01 09:08'},
  {id:3,name:'唐馨',account:'9901131541',vcp:'DFNEC08',group:'B组',start:'2026-09-01',end:'长期',status:'启用',updated:'张敏 · 2026-09-01 09:05'},
  {id:4,name:'黄美云',account:'lihx',vcp:'—',group:'B组',start:'2026-09-01',end:'长期',status:'启用',updated:'张敏 · 2026-09-01 09:03'},
  {id:5,name:'王欣彤',account:'9901131525',vcp:'—',group:'C组',start:'2026-08-15',end:'长期',status:'启用',updated:'张敏 · 2026-08-15 16:30'},
  {id:6,name:'陈豪',account:'d41d8cd98f00b204e9800998ecf8427e',vcp:'DFNEC08',group:'C组',start:'2026-08-01',end:'2026-08-31',status:'停用',updated:'张敏 · 2026-09-01 08:50'},
  {id:7,name:'微信销售客服',account:'xiaoshou2',vcp:'—',group:'未映射',start:'—',end:'—',status:'启用',updated:'待配置'},
  {id:8,name:'小妮',account:'xiaoni2',vcp:'—',group:'未映射',start:'—',end:'—',status:'启用',updated:'待配置'},
  {id:9,name:'晓晓',account:'xiaoxiao',vcp:'—',group:'未映射',start:'—',end:'—',status:'启用',updated:'待配置'}
];
function sdConfigCss(){
  if(document.getElementById('sd-report-config-css'))return;
  document.head.insertAdjacentHTML('beforeend','<style id="sd-report-config-css">#seatPerformanceDashboardPage .sd-config{min-height:calc(100vh - 112px);padding:28px 32px 44px;background:#f5f7fa;font-family:"Microsoft YaHei","PingFang SC",sans-serif;color:#253754}#seatPerformanceDashboardPage .sd-config-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:18px;padding:26px 30px;border:1px solid #dce7fb;border-radius:16px;background:linear-gradient(115deg,#fff,#f5f9ff);box-shadow:0 8px 24px rgba(42,82,150,.06)}#seatPerformanceDashboardPage .sd-config-crumb{margin-bottom:9px;color:#72829a;font-size:13px}#seatPerformanceDashboardPage .sd-config h1{margin:0;color:#17233b;font-size:25px;line-height:1.35}#seatPerformanceDashboardPage .sd-config-head p{margin:8px 0 0;color:#6c7b93;font-size:13px;line-height:1.7}.sd-btn,#seatPerformanceDashboardPage .sd-btn{height:36px;padding:0 14px;border:1px solid #c9d9ee;border-radius:7px;background:#fff;color:#315f9f;font:700 13px "Microsoft YaHei";cursor:pointer;white-space:nowrap;transition:.18s;outline:0}.sd-btn:hover,#seatPerformanceDashboardPage .sd-btn:hover{border-color:#7fa5dd;background:#f4f8ff}.sd-btn.primary,#seatPerformanceDashboardPage .sd-btn.primary{border-color:#2f64b9;background:#2f64b9;color:#fff;box-shadow:0 3px 8px rgba(47,100,185,.18)}.sd-btn.primary:hover,#seatPerformanceDashboardPage .sd-btn.primary:hover{background:#24579f}#seatPerformanceDashboardPage .sd-config-layout{display:grid;grid-template-columns:236px minmax(0,1fr);gap:18px}#seatPerformanceDashboardPage .sd-config-menu,#seatPerformanceDashboardPage .sd-config-main{border:1px solid #e2eaf4;border-radius:14px;background:#fff;box-shadow:0 6px 20px rgba(37,56,88,.04)}#seatPerformanceDashboardPage .sd-config-menu{padding:12px}#seatPerformanceDashboardPage .sd-config-menu small{display:block;padding:8px 10px 10px;color:#92a0b3;font-size:12px;font-weight:700}#seatPerformanceDashboardPage .sd-config-menu button{display:flex;align-items:center;width:100%;min-height:42px;margin:3px 0;padding:0 11px;border:0;border-radius:8px;background:transparent;color:#53647c;text-align:left;font:700 14px "Microsoft YaHei";cursor:pointer}#seatPerformanceDashboardPage .sd-config-menu button:hover{background:#f4f7fb;color:#315f9f}#seatPerformanceDashboardPage .sd-config-menu button.active{background:#edf3fb;color:#2f64b9;box-shadow:inset 0 0 0 1px #cfe0f6}#seatPerformanceDashboardPage .sd-config-menu button span{margin-left:auto;color:#9aa9bc;font-size:12px;font-weight:400}#seatPerformanceDashboardPage .sd-config-main{min-width:0;padding:24px}#seatPerformanceDashboardPage .sd-config-main h2{margin:0;color:#253754;font-size:19px}#seatPerformanceDashboardPage .sd-config-desc{margin:8px 0 20px;color:#718198;font-size:13px;line-height:1.7}#seatPerformanceDashboardPage .sd-config-alert{display:flex;gap:10px;align-items:flex-start;margin-bottom:16px;padding:12px 14px;border:1px solid #d5e5fb;border-radius:9px;background:#f5f9ff;color:#506783;font-size:13px;line-height:1.65}#seatPerformanceDashboardPage .sd-config-alert b{color:#2f64b9}#seatPerformanceDashboardPage .sd-config-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:16px 0}#seatPerformanceDashboardPage .sd-config-toolbar input,#seatPerformanceDashboardPage .sd-config-toolbar select,.sd-map-form input,.sd-map-form select{height:36px;box-sizing:border-box;padding:0 10px;border:1px solid #cdd9ed;border-radius:7px;background:#fff;color:#334155;font:13px "Microsoft YaHei";outline:0}.sd-map-form input[readonly]{background:#f8fafc;color:#64748b;border-color:#e2e8f0;cursor:not-allowed}#seatPerformanceDashboardPage .sd-config-toolbar input{width:240px}#seatPerformanceDashboardPage .sd-config-toolbar input:focus,#seatPerformanceDashboardPage .sd-config-toolbar select:focus,.sd-map-form input:focus,.sd-map-form select:focus{border-color:#2f64b9;box-shadow:0 0 0 3px rgba(47,100,185,.11)}#seatPerformanceDashboardPage .sd-config-toolbar .sd-btn:first-of-type{margin-left:auto}#seatPerformanceDashboardPage .sd-config-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 18px}#seatPerformanceDashboardPage .sd-config-stat{padding:15px 16px;border:1px solid #e6edf5;border-radius:10px;background:#fcfdff}#seatPerformanceDashboardPage .sd-config-stat small{display:block;color:#718198;font-size:12px;font-weight:700}#seatPerformanceDashboardPage .sd-config-stat b{display:block;margin-top:6px;color:#1e2b3d;font-size:23px}#seatPerformanceDashboardPage .sd-config-stat.warning b{color:#b6622c}#seatPerformanceDashboardPage .sd-map-table{overflow:auto;border:1px solid #e5ebf4;border-radius:10px}#seatPerformanceDashboardPage .sd-map-table table{width:100%;min-width:900px;border-collapse:collapse;font-size:13px}#seatPerformanceDashboardPage .sd-map-table th{padding:12px 10px;background:#f3f7fc;color:#60718a;font-weight:700;white-space:nowrap;text-align:left}#seatPerformanceDashboardPage .sd-map-table td{padding:12px 10px;border-top:1px solid #eef2f7;color:#46566e;vertical-align:middle}#seatPerformanceDashboardPage .sd-map-table tbody tr:hover{background:#f8fbff}#seatPerformanceDashboardPage .sd-map-name{display:block;color:#2a3b56;font-weight:700}#seatPerformanceDashboardPage .sd-map-id{display:block;margin-top:3px;color:#92a0b3;font-size:12px}#seatPerformanceDashboardPage .sd-codes{color:#315f9f;font-weight:700}.sd-map-status{display:inline-block;padding:3px 8px;border-radius:99px;font-size:12px;font-weight:700}.sd-map-status.on{background:#eff8f3;color:#2f8066}.sd-map-status.off{background:#f5f6f8;color:#7b8798}.sd-table-actions{display:flex;gap:6px}.sd-table-actions button{height:28px;padding:0 8px;border:0;border-radius:5px;background:#edf3fb;color:#2f64b9;font:700 12px "Microsoft YaHei";cursor:pointer}.sd-table-actions button.mute{background:#f4f6f8;color:#67778e}#seatPerformanceDashboardPage .sd-config-footer{display:flex;justify-content:space-between;align-items:center;margin-top:14px;color:#8190a3;font-size:12px}.sd-config-placeholder{padding:24px;border:1px dashed #d4dfed;border-radius:10px;background:#fbfcfe;color:#62738a;line-height:1.8}.sd-config-placeholder b{color:#2f64b9}.sd-map-modal{position:fixed;z-index:10005;inset:0;display:grid;place-items:center;padding:20px;background:rgba(24,39,63,.38);font-family:"Microsoft YaHei","PingFang SC",sans-serif}.sd-map-dialog{width:min(580px,100%);border-radius:14px;background:#fff;box-shadow:0 18px 48px rgba(13,31,58,.28);overflow:hidden}.sd-map-dialog-head{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid #e7edf5;color:#253754;font-size:17px;font-weight:700}.sd-map-dialog-head button{border:0;background:transparent;color:#7f8da0;font-size:24px;cursor:pointer}.sd-map-form{display:grid;grid-template-columns:1fr 1fr;gap:15px;padding:22px}.sd-map-form label{display:grid;gap:7px;color:#55657b;font-size:13px;font-weight:700}.sd-map-form label.full{grid-column:1/-1}.sd-map-form input,.sd-map-form select{width:100%}.sd-map-dialog-foot{display:flex;justify-content:flex-end;gap:8px;padding:14px 22px;border-top:1px solid #e7edf5;background:#fafcff}@media(max-width:980px){#seatPerformanceDashboardPage .sd-config-layout{grid-template-columns:1fr}#seatPerformanceDashboardPage .sd-config-menu{display:flex;overflow:auto;padding:8px}#seatPerformanceDashboardPage .sd-config-menu small{display:none}#seatPerformanceDashboardPage .sd-config-menu button{flex:0 0 auto;width:auto}.sd-config-stats{grid-template-columns:repeat(2,1fr)}}@media(max-width:640px){#seatPerformanceDashboardPage .sd-config{padding:14px}#seatPerformanceDashboardPage .sd-config-head{padding:20px;flex-direction:column}#seatPerformanceDashboardPage .sd-config-main{padding:16px}.sd-config-stats{grid-template-columns:1fr 1fr}#seatPerformanceDashboardPage .sd-config-toolbar input{width:100%}#seatPerformanceDashboardPage .sd-config-toolbar .sd-btn:first-of-type{margin-left:0}.sd-map-form{grid-template-columns:1fr}}</style>');
}
function sdMappingRows(){
  const key=sdMappingKeyword.trim().toLowerCase();
  return sdMappings.filter(row=>(sdMappingGroup==='all'||row.group===sdMappingGroup)&&(sdMappingStatus==='all'||row.status===sdMappingStatus)&&(!key||[row.name,row.account,row.vcp].join(' ').toLowerCase().includes(key)));
}
function sdRenderMapping(){
  const rows=sdMappingRows(),enabled=sdMappings.filter(row=>row.status==='启用').length,unmapped=sdMappings.filter(row=>row.group==='未映射').length,mapped=sdMappings.length-unmapped;
  return '<h2>坐席与小组映射</h2><p class="sd-config-desc">坐席名称、坐席帐号及 VCP 帐号均引用“坐席管理”数据。本页只维护其所属小组、状态、生效日期与失效日期。</p><div class="sd-config-alert">ℹ️ <span><b>引用与匹配规则：</b>坐席主数据由“坐席管理”统一维护；本页不新增、不修改坐席帐号。报表按回访发生时间匹配有效的小组关系，未映射小组的坐席不会进入分组报表。</span></div><div class="sd-config-stats"><div class="sd-config-stat"><small>引用坐席总数</small><b>'+sdMappings.length+' 个</b></div><div class="sd-config-stat"><small>已映射小组坐席</small><b>'+mapped+' 个</b></div><div class="sd-config-stat"><small>当前覆盖小组</small><b>3 个</b></div><div class="sd-config-stat warning"><small>未映射小组坐席</small><b>'+unmapped+' 个</b></div></div><div class="sd-config-toolbar"><input id="sdMapKeyword" value="'+sdMappingKeyword+'" placeholder="搜索坐席名称、坐席帐号或 VCP 帐号"><select id="sdMapGroup"><option value="all" '+(sdMappingGroup==='all'?'selected':'')+'>全部小组</option><option value="A组" '+(sdMappingGroup==='A组'?'selected':'')+'>A组</option><option value="B组" '+(sdMappingGroup==='B组'?'selected':'')+'>B组</option><option value="C组" '+(sdMappingGroup==='C组'?'selected':'')+'>C组</option><option value="未映射" '+(sdMappingGroup==='未映射'?'selected':'')+'>未映射小组</option></select><select id="sdMapStatus"><option value="all" '+(sdMappingStatus==='all'?'selected':'')+'>全部状态</option><option value="启用" '+(sdMappingStatus==='启用'?'selected':'')+'>启用</option><option value="停用" '+(sdMappingStatus==='停用'?'selected':'')+'>停用</option></select><button class="sd-btn" type="button" onclick="sdApplyMappingFilter()">查询</button><button class="sd-btn" type="button" onclick="sdFilterUnmappedGroups()">未映射小组（'+unmapped+'）</button><button class="sd-btn primary" type="button" onclick="sdOpenMappingModal()">关联坐席</button></div><div class="sd-map-table"><table><thead><tr><th>坐席名称</th><th>坐席帐号</th><th>VCP 帐号</th><th>所属小组</th><th>生效日期</th><th>失效日期</th><th>状态</th><th>最近更新</th><th>操作</th></tr></thead><tbody>'+rows.map(row=>'<tr><td><span class="sd-map-name">'+row.name+'</span></td><td>'+row.account+'</td><td class="sd-codes">'+row.vcp+'</td><td>'+row.group+'</td><td>'+row.start+'</td><td>'+row.end+'</td><td><span class="sd-map-status '+(row.status==='启用'?'on':'off')+'">'+row.status+'</span></td><td>'+row.updated+'</td><td><div class="sd-table-actions"><button type="button" onclick="sdOpenMappingModal('+row.id+')">编辑</button><button type="button" class="mute" onclick="sdToggleMapping('+row.id+')">'+(row.status==='启用'?'停用':'启用')+'</button></div></td></tr>').join('')+'</tbody></table></div><div class="sd-config-footer"><span>共 '+rows.length+' 个引用坐席</span><span>小组、状态与有效期变更将记录操作人、时间与变更前后内容</span></div>';
}
let sdTargetKeyword='';
let sdTargetGroup='all';
let sdTargetStatus='all';
let sdTargetEditId=null;
let sdTargetSeatId=null;
let sdTargets=[
  {id:1,seatId:1,weekly:110,monthly:440,start:'2026-09-01',end:'长期',status:'启用',updated:'张敏 · 2026-09-01 09:12'},
  {id:2,seatId:2,weekly:105,monthly:420,start:'2026-09-01',end:'长期',status:'启用',updated:'张敏 · 2026-09-01 09:12'},
  {id:3,seatId:3,weekly:100,monthly:400,start:'2026-09-01',end:'长期',status:'启用',updated:'张敏 · 2026-09-01 09:12'},
  {id:4,seatId:4,weekly:95,monthly:380,start:'2026-09-01',end:'长期',status:'启用',updated:'张敏 · 2026-09-01 09:12'},
  {id:5,seatId:5,weekly:100,monthly:400,start:'2026-09-01',end:'长期',status:'启用',updated:'张敏 · 2026-09-01 09:12'},
  {id:6,seatId:6,weekly:90,monthly:360,start:'2026-08-01',end:'2026-08-31',status:'停用',updated:'张敏 · 2026-09-01 08:52'}
];
function sdTargetSeat(target){return sdMappings.find(row=>row.id===target.seatId)}
function sdTargetRows(){const key=sdTargetKeyword.trim().toLowerCase();return sdMappings.filter(seat=>seat.group!=='未映射').map(seat=>{const target=sdTargets.find(item=>item.seatId===seat.id);return target||{id:0,seatId:seat.id,weekly:'—',monthly:'—',start:'—',end:'—',status:'未配置',updated:'待维护',missing:true}}).filter(target=>{const seat=sdTargetSeat(target);return seat&&(sdTargetGroup==='all'||seat.group===sdTargetGroup)&&(sdTargetStatus==='all'||target.status===sdTargetStatus)&&(!key||[seat.name,seat.account,seat.vcp].join(' ').toLowerCase().includes(key))})}
function sdRenderTargets(){
  if(!document.getElementById('sd-target-help-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-target-help-css">#seatPerformanceDashboardPage .sd-config-title-row{display:flex;align-items:center;gap:8px}#seatPerformanceDashboardPage .sd-info-icon{display:grid;place-items:center;width:19px;height:19px;padding:0;border:1px solid #9cb8de;border-radius:50%;background:#f4f8ff;color:#2f64b9;font:700 12px Georgia,serif;cursor:pointer}#seatPerformanceDashboardPage .sd-info-icon:hover{border-color:#2f64b9;background:#eaf2ff}.sd-target-help{max-width:600px}.sd-target-help-body{padding:20px 22px;color:#55657b;font-size:14px;line-height:1.8}.sd-target-help-body p{margin:0 0 14px}.sd-target-help-body h3{margin:16px 0 7px;color:#2c3d58;font-size:14px}.sd-target-help-body ol{margin:0 0 16px;padding-left:22px}.sd-target-help-body strong{color:#2f64b9}.sd-target-help-example{padding:13px 15px;border:1px solid #dbe7fa;border-radius:8px;background:#f6f9fe;color:#596b84}.sd-target-help-example b{display:block;margin-bottom:3px;color:#2f64b9}</style>');
  const rows=sdTargetRows(),active=sdTargets.filter(item=>item.status==='启用').length,weekly=sdTargets.filter(item=>item.status==='启用').reduce((sum,item)=>sum+item.weekly,0),monthly=sdTargets.filter(item=>item.status==='启用').reduce((sum,item)=>sum+item.monthly,0);
  return '<div class="sd-config-title-row"><h2>业绩目标配置</h2><button class="sd-info-icon" type="button" aria-label="查看目标规则生效日期说明" onclick="sdShowTargetValidityHelp()">i</button></div><p class="sd-config-desc">按坐席成员维护业绩目标参数，坐席和所属小组引用“坐席与小组映射”。有效上班天数引用现有“排班管理”数据，留资未满报告不读取本配置。</p><div class="sd-config-alert">ℹ️ <span><b>操作说明：</b>直接在下方列表中找到对应坐席，点击“编辑”维护其目标参数。未配置目标的坐席同样会展示在列表中，便于集中处理。</span></div><div class="sd-config-stats"><div class="sd-config-stat"><small>启用目标规则</small><b>'+active+' 条</b></div><div class="sd-config-stat"><small>本周目标排程量</small><b>'+weekly+' 批</b></div><div class="sd-config-stat"><small>当月目标排程量</small><b>'+monthly+' 批</b></div><div class="sd-config-stat warning"><small>未配置目标坐席</small><b>'+sdMappings.filter(row=>row.group!=='未映射'&&!sdTargets.some(item=>item.seatId===row.id&&item.status==='启用')).length+' 个</b></div></div><div class="sd-config-toolbar"><input id="sdTargetKeyword" value="'+sdTargetKeyword+'" placeholder="搜索坐席名称、坐席帐号或 VCP 帐号"><select id="sdTargetGroup"><option value="all" '+(sdTargetGroup==='all'?'selected':'')+'>全部小组</option><option value="A组" '+(sdTargetGroup==='A组'?'selected':'')+'>A组</option><option value="B组" '+(sdTargetGroup==='B组'?'selected':'')+'>B组</option><option value="C组" '+(sdTargetGroup==='C组'?'selected':'')+'>C组</option></select><select id="sdTargetStatus"><option value="all" '+(sdTargetStatus==='all'?'selected':'')+'>全部状态</option><option value="启用" '+(sdTargetStatus==='启用'?'selected':'')+'>启用</option><option value="停用" '+(sdTargetStatus==='停用'?'selected':'')+'>停用</option><option value="未配置" '+(sdTargetStatus==='未配置'?'selected':'')+'>未配置</option></select><button class="sd-btn" type="button" onclick="sdApplyTargetFilter()">查询</button></div><div class="sd-map-table"><table><thead><tr><th>坐席名称</th><th>坐席帐号</th><th>所属小组</th><th>周排程量</th><th>月度目标（兜底）</th><th>生效日期</th><th>失效日期</th><th>状态</th><th>最近更新</th><th>操作</th></tr></thead><tbody>'+rows.map(target=>{const seat=sdTargetSeat(target),missing=target.missing;return '<tr><td><span class="sd-map-name">'+seat.name+'</span></td><td>'+seat.account+'</td><td>'+seat.group+'</td><td class="sd-codes">'+(missing?'—':target.weekly+' 批')+'</td><td>'+(missing?'—':target.monthly+' 批')+'</td><td>'+target.start+'</td><td>'+target.end+'</td><td><span class="sd-map-status '+(target.status==='启用'?'on':'off')+'">'+target.status+'</span></td><td>'+target.updated+'</td><td><div class="sd-table-actions"><button type="button" onclick="sdOpenTargetModal('+target.id+','+target.seatId+')">编辑</button>'+(!missing?'<button type="button" class="mute" onclick="sdToggleTarget('+target.id+')">'+(target.status==='启用'?'停用':'启用')+'</button>':'')+'</div></td></tr>'}).join('')+'</tbody></table></div><div class="sd-config-footer"><span>共 '+rows.length+' 名已映射坐席</span><span>目标变更将从生效日期起参与报表计算</span></div>';
}
function sdApplyTargetFilter(){sdTargetKeyword=document.getElementById('sdTargetKeyword').value;sdTargetGroup=document.getElementById('sdTargetGroup').value;sdTargetStatus=document.getElementById('sdTargetStatus').value;renderSdReportConfiguration()}
function sdRefreshTargetList(){sdApplyTargetFilter()}
function sdFilterUnconfiguredTargets(){sdTargetKeyword='';sdTargetGroup='all';sdTargetStatus='未配置';renderSdReportConfiguration()}
function sdToggleTarget(id){const target=sdTargets.find(item=>item.id===id);if(!target)return;target.status=target.status==='启用'?'停用':'启用';target.updated='张敏 · 2026-09-10 14:35';renderSdReportConfiguration()}
function sdPositiveInteger(input){input.value=input.value.replace(/[^\d]/g,'').replace(/^0+/,'')}
function sdOpenTargetModal(id,seatId){sdConfigCss();sdApplyConfigVisualAlignment();const target=id?sdTargets.find(item=>item.id===id):null,seat=target?sdTargetSeat(target):sdMappings.find(row=>row.id===seatId);if(!seat)return;sdTargetEditId=id||null;sdTargetSeatId=seat.id;const item=target||{weekly:'',monthly:'',start:'2026-09-10',end:'长期',status:'启用'},end=String(item.end||'长期').trim(),isLong=end==='长期';document.querySelector('.sd-map-modal')?.remove();document.body.insertAdjacentHTML('beforeend','<div class="sd-map-modal" role="dialog" aria-modal="true"><div class="sd-map-dialog"><div class="sd-map-dialog-head"><span>编辑目标参数</span><button type="button" onclick="sdCloseMappingModal()">×</button></div><div class="sd-map-form"><label>坐席名称<input value="'+seat.name+'" readonly></label><label>所属小组<input value="'+seat.group+'" readonly></label><label>周排程量（批）<i style="color:#dc2626;font-style:normal">*</i><input id="sdTargetWeekly" type="text" inputmode="numeric" pattern="[1-9][0-9]*" maxlength="6" value="'+item.weekly+'" placeholder="请输入正整数" oninput="sdPositiveInteger(this)" required aria-required="true"></label><label>月度目标（批）<i style="color:#dc2626;font-style:normal">*</i><input id="sdTargetMonthly" type="text" inputmode="numeric" pattern="[1-9][0-9]*" maxlength="6" value="'+item.monthly+'" placeholder="请输入正整数" oninput="sdPositiveInteger(this)" required aria-required="true"></label><label>生效日期 <i style="color:#dc2626;font-style:normal">*</i><input id="sdTargetStart" type="date" value="'+item.start+'" required aria-required="true"></label><label>有效期 <i style="color:#dc2626;font-style:normal">*</i><select id="sdTargetEndMode" onchange="sdChangeTargetEndMode()" required aria-required="true"><option value="长期" '+(isLong?'selected':'')+'>长期有效</option><option value="指定日期" '+(!isLong?'selected':'')+'>指定失效日期</option></select></label><label id="sdTargetEndDateWrap" class="full" style="display:'+(isLong?'none':'grid')+'">失效日期 <i style="color:#dc2626;font-style:normal">*</i><input id="sdTargetEndDate" type="date" min="'+item.start+'" value="'+(isLong?'':end)+'" '+(isLong?'disabled':'')+'></label><label class="full">状态<select id="sdTargetState"><option '+(item.status==='启用'?'selected':'')+'>启用</option><option '+(item.status==='停用'?'selected':'')+'>停用</option></select></label></div><div class="sd-map-dialog-foot"><button class="sd-btn" type="button" onclick="sdCloseMappingModal()">取消</button><button class="sd-btn primary" type="button" onclick="sdSaveTarget()">保存</button></div></div></div>');}
function sdChangeTargetEndMode(){const specified=document.getElementById('sdTargetEndMode').value==='指定日期',wrap=document.getElementById('sdTargetEndDateWrap'),date=document.getElementById('sdTargetEndDate'),start=document.getElementById('sdTargetStart');if(!wrap||!date)return;wrap.style.display=specified?'grid':'none';date.disabled=!specified;if(specified){date.min=start?.value||'';if(!date.value)date.value=start?.value||''}}
function sdSaveTarget(){const weeklyValue=document.getElementById('sdTargetWeekly').value.trim(),monthlyValue=document.getElementById('sdTargetMonthly').value.trim(),positiveInteger=value=>/^[1-9]\d*$/.test(value),weekly=weeklyValue?+weeklyValue:0,monthly=monthlyValue?+monthlyValue:0,start=document.getElementById('sdTargetStart').value,endMode=document.getElementById('sdTargetEndMode').value,end=endMode==='长期'?'长期':document.getElementById('sdTargetEndDate').value;if(!positiveInteger(weeklyValue)||!positiveInteger(monthlyValue))return alert('周排程量和月度目标均为必填正整数。');if(!start||!endMode)return alert('请完整填写必填项：生效日期和有效期。');if(!end)return alert('请选择失效日期。');if(end!=='长期'&&end<start)return alert('失效日期不能早于生效日期。');const item={weekly,monthly,start,end,status:document.getElementById('sdTargetState').value,updated:'张敏 · 2026-09-10 14:35'};if(sdTargetEditId){Object.assign(sdTargets.find(row=>row.id===sdTargetEditId),item)}else{item.id=Math.max(0,...sdTargets.map(row=>row.id))+1;item.seatId=sdTargetSeatId;sdTargets.unshift(item)}sdCloseMappingModal();renderSdReportConfiguration()}
function sdShowTargetValidityHelp(){document.querySelector('.sd-map-modal')?.remove();document.body.insertAdjacentHTML('beforeend','<div class="sd-map-modal" role="dialog" aria-modal="true"><div class="sd-map-dialog sd-target-help"><div class="sd-map-dialog-head"><span>目标规则的生效与失效日期</span><button type="button" onclick="sdCloseMappingModal()">×</button></div><div class="sd-target-help-body"><p>这两个日期用于保留目标参数的历史版本，确保历史报表不会因后来调整目标而变化。</p><h3>什么时候需要设置？</h3><p>当坐席的周排程量或月度目标发生调整时，请结束旧规则，并新增一条新规则：</p><ol><li>旧规则的<strong>失效日期</strong>填调整日前一天；</li><li>新规则的<strong>生效日期</strong>填调整当天；</li><li>目标未调整时，失效日期保持“长期”。</li></ol><div class="sd-target-help-example"><b>示例</b><br>9 月 1 日至 15 日，周排程量为 110 批；9 月 16 日起调整为 130 批。<br>查询 9 月上半月仍按 110 批计算，查询 9 月 16 日后按 130 批计算。</div></div><div class="sd-map-dialog-foot"><button class="sd-btn primary" type="button" onclick="sdCloseMappingModal()">我知道了</button></div></div></div>')}
let sdMetricDefinitionTab='performance';
function sdMetricRows(rows){return '<div class="sd-metric-table"><table><thead><tr><th>指标</th><th>统计口径</th></tr></thead><tbody>'+rows.map(row=>'<tr><td><b>'+row[0]+'</b></td><td>'+row[1]+'</td></tr>').join('')+'</tbody></table></div>'}
function sdRenderMetricDefinitions(){
  if(!document.getElementById('sd-metric-definition-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-metric-definition-css">#seatPerformanceDashboardPage .sd-metric-tabs{display:flex;gap:8px;margin:18px 0}.sd-metric-tabs button{height:34px;padding:0 14px;border:1px solid #d4e0f0;border-radius:7px;background:#fff;color:#64748b;font:700 13px "Microsoft YaHei";cursor:pointer}.sd-metric-tabs button.active{border-color:#c9dcf7;background:#edf3fb;color:#2f64b9}.sd-metric-intro{margin:0 0 16px;padding:13px 15px;border:1px solid #dbe7fa;border-radius:9px;background:#f7faff;color:#5d6e85;font-size:13px;line-height:1.75}.sd-metric-intro b{color:#2f64b9}.sd-metric-section{margin:16px 0;padding:18px 20px;border:1px solid #e5ebf4;border-radius:10px;background:#fff}.sd-metric-section h3{margin:0 0 12px;padding-left:10px;border-left:4px solid #2f64b9;color:#293b57;font-size:15px}.sd-metric-section ul{margin:0;padding-left:20px;color:#576880;font-size:13px;line-height:1.9}.sd-metric-table{overflow:auto;border:1px solid #e7edf5;border-radius:8px}.sd-metric-table table{width:100%;border-collapse:collapse;font-size:13px}.sd-metric-table th{padding:11px 12px;background:#f3f7fc;color:#60718a;text-align:left}.sd-metric-table td{padding:11px 12px;border-top:1px solid #edf1f6;color:#52637c;line-height:1.65;vertical-align:top}.sd-metric-table td:first-child{width:180px;color:#2c3d58;white-space:nowrap}.sd-metric-source{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.sd-metric-source div{padding:13px;border:1px solid #e5ebf4;border-radius:8px;background:#fbfcfe;color:#66778e;font-size:12px;line-height:1.6}.sd-metric-source b{display:block;margin-bottom:4px;color:#315f9f;font-size:13px}@media(max-width:760px){.sd-metric-source{grid-template-columns:1fr}.sd-metric-table td:first-child{width:auto;white-space:normal}}</style>');
  const performance=sdMetricDefinitionTab==='performance';
  const body=performance?'<div class="sd-metric-intro"><b>适用报告：业绩晾晒报告。</b>两个板块可分别选择日期与小时区间；筛选条件变化并应用后，指标、表格与图表同步刷新。</div><div class="sd-metric-section"><h3>统计范围与人员归属</h3><ul><li>按回访记录发生时间筛选，起止时间均包含在内；跨天范围按覆盖自然日累计。</li><li>坐席按当时有效的“坐席与小组映射”归属 A组、B组或 C组；未映射小组的坐席不进入正式汇总。</li><li>在岗与休息人员、有效上班天数引用 DCC 既有排班管理数据。</li></ul></div><div class="sd-metric-section"><h3>核心指标</h3>'+sdMetricRows([['排程量','回访结果为「试驾排程下发」或「试驾线索下发」的记录数，单位为批。'],['通话时长','仅统计已接通记录的通话时长，按秒累计。'],['个人目标','优先按“周排程量 ÷ 当周有效上班天数”计算日目标，按 0.5 向上取整；未配置周目标时，以“个人月度目标 ÷ 30”兜底。'],['小组目标','当期有效个人月度目标汇总后计算；日目标按“组月目标 ÷ 30”并按覆盖天数累计。'],['完成度','排程量 ÷ 当前筛选期目标 × 100%；目标未配置或为 0 时展示“—”。']])+'</div><div class="sd-metric-section"><h3>展示与排序边界</h3><ul><li>小组固定展示 A组、B组、C组；员工明细按排程量、通话时长、完成度依次排序。</li><li>榜单只纳入对应指标大于 0 的员工；并列时按另一业务指标与完成度依次破局。</li></ul></div>':'<div class="sd-metric-intro"><b>适用报告：留资未满报告。</b>仅统计关联“留资未满任务”的回访记录；筛选条件变化并应用后，指标、明细与分布同步刷新。</div><div class="sd-metric-section"><h3>统计范围与任务识别</h3><ul><li>留资未满任务指任务信息表中“是否留资未满”＝“是”的任务。</li><li>仅统计所选日期＋小时区间内、关联留资未满任务的回访记录。</li><li>坐席归属按当时有效的“坐席与小组映射”匹配；该报告不读取业绩目标配置。</li></ul></div><div class="sd-metric-section"><h3>核心指标</h3>'+sdMetricRows([['留资未满数','按回访记录逐条计数，不去重；同一任务多次回访会重复计入。'],['任务数','仅在员工维度按任务编码去重。'],['排程量','回访结果为「试驾排程下发」或「试驾线索下发」的记录数，单位为批。'],['激活量','回访结果为「试驾排程下发」「试驾线索下发」「意向线索下发」的记录数；包含排程类结果。'],['通话时长','仅统计通话结果为“接通”的记录，通话时长按逗号拆分后累加，单位为秒。'],['人均指标','人均通话时长、激活量、留资未满数的分母均为当前筛选范围内的涉及员工数。']])+'</div><div class="sd-metric-section"><h3>关键边界</h3><ul><li>“留资未满总数”反映回访频次总和，不等同于去重后的任务数量。</li><li>人员分布按留资未满数、激活量、排程量依次排序；小组汇总按 A组、B组、C组展示。</li></ul></div>';
  return '<div class="sd-config-title-row"><h2>指标口径说明</h2></div><p class="sd-config-desc">依据《时段业绩看板指标说明》与《留资未满业绩报告指标说明》生成，仅供查看，不提供维护操作。</p><div class="sd-metric-tabs"><button class="'+(performance?'active':'')+'" type="button" onclick="switchSdMetricDefinitionTab(\'performance\')">业绩晾晒报告</button><button class="'+(!performance?'active':'')+'" type="button" onclick="switchSdMetricDefinitionTab(\'underfilled\')">留资未满报告</button></div>'+body+'<div class="sd-metric-section"><h3>数据来源</h3><div class="sd-metric-source"><div><b>回访记录</b>回访结果、通话结果、通话时长及记录发生时间。</div><div><b>任务信息</b>任务编码及“是否留资未满”标识。</div><div><b>系统基础数据</b>坐席管理、坐席与小组映射、排班管理及业绩目标配置。</div></div></div>';
}
function switchSdMetricDefinitionTab(tab){sdMetricDefinitionTab=tab;renderSdReportConfiguration()}
function sdConfigPlaceholder(title,detail){return '<h2>'+title+'</h2><p class="sd-config-desc">此配置与报表计算共享同一套生效日期与操作审计规则。</p><div class="sd-config-placeholder"><b>下一步配置范围</b><br>'+detail+'</div>'}
function sdNormalizeConfigToolbar(){
  const toolbar=document.querySelector('#seatPerformanceDashboardPage .sd-config-toolbar');if(!toolbar)return;
  const removeByText=text=>[...toolbar.querySelectorAll('button')].filter(button=>button.textContent.trim()===text).forEach(button=>button.remove());
  if(sdReportConfigTab==='mapping'){
    removeByText('查询');removeByText('关联坐席');
    const keyword=toolbar.querySelector('#sdMapKeyword'),group=toolbar.querySelector('#sdMapGroup'),status=toolbar.querySelector('#sdMapStatus');
    if(keyword){keyword.onblur=sdApplyMappingFilter;keyword.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();sdApplyMappingFilter()}}}
    if(group)group.onchange=sdApplyMappingFilter;if(status)status.onchange=sdApplyMappingFilter;
    if(!toolbar.querySelector('.sd-list-refresh'))toolbar.insertAdjacentHTML('beforeend','<button class="sd-btn primary sd-list-refresh" type="button" onclick="sdRefreshMappingList()">↻ 刷新</button>');
  }else if(sdReportConfigTab==='target'){
    removeByText('查询');
    const keyword=toolbar.querySelector('#sdTargetKeyword'),group=toolbar.querySelector('#sdTargetGroup'),status=toolbar.querySelector('#sdTargetStatus');
    if(keyword){keyword.onblur=sdApplyTargetFilter;keyword.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();sdApplyTargetFilter()}}}
    if(group)group.onchange=sdApplyTargetFilter;if(status)status.onchange=sdApplyTargetFilter;
    const missing=sdMappings.filter(row=>row.group!=='未映射'&&!sdTargets.some(item=>item.seatId===row.id&&item.status==='启用')).length;
    if(!toolbar.querySelector('.sd-target-unconfigured'))toolbar.insertAdjacentHTML('beforeend','<button class="sd-btn sd-target-unconfigured" type="button" onclick="sdFilterUnconfiguredTargets()">未配置目标（'+missing+'）</button>');
    if(!toolbar.querySelector('.sd-list-refresh'))toolbar.insertAdjacentHTML('beforeend','<button class="sd-btn primary sd-list-refresh" type="button" onclick="sdRefreshTargetList()">↻ 刷新</button>');
  }
}
function sdApplyConfigVisualAlignment(){
  if(document.getElementById('sd-config-global-alignment-css'))return;
  document.head.insertAdjacentHTML('beforeend','<style id="sd-config-global-alignment-css">/* 对齐 DCC 管理页的表单、表格和弹窗规范，不引入独立视觉体系。 */#seatPerformanceDashboardPage .sd-config{padding:20px 24px 32px;background:#f6f8fb;color:#334155}#seatPerformanceDashboardPage .sd-config-head{margin-bottom:14px;padding:22px 24px;border-color:#dfe7f1;border-radius:10px;background:#fff;box-shadow:none}#seatPerformanceDashboardPage .sd-config h1{font-size:22px;color:#1e293b}#seatPerformanceDashboardPage .sd-config-crumb{margin-bottom:6px;color:#64748b;font-size:12px}#seatPerformanceDashboardPage .sd-config-head p,#seatPerformanceDashboardPage .sd-config-desc{color:#64748b;font-size:13px;line-height:1.65}.sd-btn,#seatPerformanceDashboardPage .sd-btn{height:32px;padding:0 14px;border-radius:6px;border:1px solid #d5deea;background:#fff;color:#475569;font:500 13px "Microsoft YaHei",sans-serif;cursor:pointer;white-space:nowrap;transition:.18s;outline:0}.sd-btn:hover,#seatPerformanceDashboardPage .sd-btn:hover{border-color:#94a3b8;color:#1e293b;background:#f8fafc}.sd-btn.primary,#seatPerformanceDashboardPage .sd-btn.primary{border-color:#2563eb;background:#2563eb;color:#fff;box-shadow:none}.sd-btn.primary:hover,#seatPerformanceDashboardPage .sd-btn.primary:hover{background:#1d4ed8;border-color:#1d4ed8}#seatPerformanceDashboardPage .sd-config-layout{gap:14px;grid-template-columns:220px minmax(0,1fr)}#seatPerformanceDashboardPage .sd-config-menu,#seatPerformanceDashboardPage .sd-config-main{border-color:#e1e8f1;border-radius:10px;box-shadow:none}#seatPerformanceDashboardPage .sd-config-menu{padding:10px}#seatPerformanceDashboardPage .sd-config-menu small{padding:8px 10px;color:#94a3b8}#seatPerformanceDashboardPage .sd-config-menu button{min-height:38px;margin:2px 0;border-radius:6px;color:#475569;font-size:13px}#seatPerformanceDashboardPage .sd-config-menu button.active{background:#eff6ff;color:#2563eb;box-shadow:inset 0 0 0 1px #bfdbfe}#seatPerformanceDashboardPage .sd-config-main{padding:20px}#seatPerformanceDashboardPage .sd-config-main h2{font-size:18px;color:#1e293b}#seatPerformanceDashboardPage .sd-config-alert{margin-bottom:14px;padding:10px 12px;border-color:#dbe7f7;border-radius:8px;background:#f5f9ff;color:#52637c;font-size:13px}#seatPerformanceDashboardPage .sd-config-toolbar{gap:8px;margin:14px 0}#seatPerformanceDashboardPage .sd-config-toolbar input,#seatPerformanceDashboardPage .sd-config-toolbar select,.sd-map-form input,.sd-map-form select{height:34px;box-sizing:border-box;padding:0 10px;border:1px solid #cfd8e3;border-radius:4px;background:#fff;color:#334155;font:13px "Microsoft YaHei",sans-serif;outline:0}.sd-map-form input[readonly]{background:#f8fafc;color:#64748b;border-color:#e2e8f0;cursor:not-allowed}.sd-map-form input:focus,.sd-map-form select:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}#seatPerformanceDashboardPage .sd-config-toolbar input{width:260px}#seatPerformanceDashboardPage .sd-config-stats{gap:10px;margin-bottom:14px}#seatPerformanceDashboardPage .sd-config-stat{padding:13px 14px;border-color:#e2e8f0;border-radius:8px;background:#fff}#seatPerformanceDashboardPage .sd-config-stat small{color:#64748b;font-size:12px}#seatPerformanceDashboardPage .sd-config-stat b{margin-top:5px;color:#1e293b;font-size:22px}#seatPerformanceDashboardPage .sd-map-table{border-color:#e2e8f0;border-radius:8px}#seatPerformanceDashboardPage .sd-map-table table{font-size:13px}#seatPerformanceDashboardPage .sd-map-table th{padding:11px 12px;background:#f3f6fa;color:#64748b;text-align:center}#seatPerformanceDashboardPage .sd-map-table td{padding:11px 12px;color:#475569;text-align:center}#seatPerformanceDashboardPage .sd-map-table td:first-child{color:#334155}#seatPerformanceDashboardPage .sd-map-name{color:#334155;font-weight:700}#seatPerformanceDashboardPage .sd-map-table tbody tr:hover{background:#f8fbff}#seatPerformanceDashboardPage .sd-map-status{min-height:24px;padding:2px 8px;background:#ecfdf5!important;color:#059669!important;font-size:12px;line-height:20px}#seatPerformanceDashboardPage .sd-map-status.off{background:#f1f5f9!important;color:#64748b!important}#seatPerformanceDashboardPage .sd-table-actions{justify-content:center;gap:5px}#seatPerformanceDashboardPage .sd-table-actions button{height:28px;padding:0 8px;border-radius:4px;background:#eff6ff;color:#2563eb;font-size:12px}#seatPerformanceDashboardPage .sd-table-actions button.mute{background:#f1f5f9;color:#64748b}#seatPerformanceDashboardPage .sd-config-footer{margin-top:12px;color:#64748b;font-size:12px}.sd-map-modal{position:fixed;z-index:10005;inset:0;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.45);font-family:"Microsoft YaHei","PingFang SC",sans-serif}.sd-map-dialog{width:min(640px,100%);border-radius:10px;background:#fff;box-shadow:0 18px 42px rgba(15,23,42,.18);overflow:hidden}.sd-map-dialog-head{display:flex;justify-content:space-between;align-items:center;min-height:54px;padding:0 20px;border-bottom:1px solid #e5eaf1;color:#1e293b;font-size:16px;font-weight:700}.sd-map-dialog-head button{border:0;background:transparent;color:#64748b;font-size:22px;cursor:pointer;padding:0 4px;line-height:1}.sd-map-dialog-head button:hover{color:#1e293b}.sd-map-form{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:20px}.sd-map-form label{display:grid;gap:6px;color:#475569;font-size:13px;font-weight:600}.sd-map-form label.full{grid-column:1/-1}.sd-map-form input,.sd-map-form select{width:100%;height:34px;box-sizing:border-box;padding:0 10px;border:1px solid #cfd8e3;border-radius:4px;background:#fff;color:#334155;font:13px "Microsoft YaHei",sans-serif;outline:0}.sd-map-form input[readonly]{background:#f8fafc;color:#64748b;border-color:#e2e8f0;cursor:not-allowed}.sd-map-dialog-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 20px;border-top:1px solid #e5eaf1;background:#fafcff}@media(max-width:980px){#seatPerformanceDashboardPage .sd-config-layout{grid-template-columns:1fr}}@media(max-width:640px){#seatPerformanceDashboardPage .sd-config{padding:12px}#seatPerformanceDashboardPage .sd-config-head{padding:18px}#seatPerformanceDashboardPage .sd-config-main{padding:14px}#seatPerformanceDashboardPage .sd-config-toolbar input{width:100%}}</style>');
}
function renderSdReportConfiguration(){
  const page=document.getElementById('seatPerformanceDashboardPage');if(!page)return;sdConfigCss();sdApplyConfigVisualAlignment();
  const content=sdReportConfigTab==='target'?sdRenderTargets():sdRenderMapping();
  page.innerHTML='<main class="sd-config"><header class="sd-config-head"><div><div class="sd-config-crumb">统计报表 / 坐席业绩看板 / 报表配置</div><h1>报表配置</h1><p>统一维护报表计算依赖的人员映射、目标及数据口径；排班数据直接引用 DCC 的“排班管理”。</p></div><button class="sd-btn" type="button" onclick="closeSdReportConfiguration()">← 返回业务报告</button></header><div class="sd-config-layout"><aside class="sd-config-menu"><small>报表基础配置</small><button class="'+(sdReportConfigTab==='mapping'?'active':'')+'" onclick="switchSdReportConfigTab(\'mapping\')">坐席与小组映射 <span>必配</span></button><button class="'+(sdReportConfigTab==='target'?'active':'')+'" onclick="switchSdReportConfigTab(\'target\')">业绩目标配置 <span>必配</span></button></aside><section class="sd-config-main">'+content+'</section></div></main>';
  sdNormalizeConfigToolbar();
}
function openSdReportConfiguration(){sdReportConfigOpen=true;renderSeatPerformanceDashboard()}
function closeSdReportConfiguration(){sdReportConfigOpen=false;renderSeatPerformanceDashboard()}
function switchSdReportConfigTab(tab){sdReportConfigTab=tab;renderSdReportConfiguration()}
function sdApplyMappingFilter(){sdMappingKeyword=document.getElementById('sdMapKeyword').value;sdMappingGroup=document.getElementById('sdMapGroup').value;sdMappingStatus=document.getElementById('sdMapStatus').value;renderSdReportConfiguration()}
function sdRefreshMappingList(){sdApplyMappingFilter()}
function sdFilterUnmappedGroups(){sdMappingGroup='未映射';sdMappingStatus='all';sdMappingKeyword='';renderSdReportConfiguration()}
function sdToggleMapping(id){const row=sdMappings.find(item=>item.id===id);if(!row)return;row.status=row.status==='启用'?'停用':'启用';row.updated='张敏 · 2026-09-10 14:20';renderSdReportConfiguration()}
function sdOpenMappingModal(id){
  sdConfigCss();sdApplyConfigVisualAlignment();
  sdMappingEditId=id||null;const source=sdMappings.filter(item=>item.group==='未映射'),row=id?sdMappings.find(item=>item.id===id):source[0];if(!row){alert('当前没有待关联的坐席。');return}
  const ref=id?'':'<label class="full">引用坐席管理数据<select id="sdSeatSource" onchange="sdFillSeatSource()">'+source.map(item=>'<option value="'+item.id+'">'+item.name+'（'+item.account+'）</option>').join('')+'</select></label>';
  const start=row.start==='—'?'2026-09-10':row.start,end=row.end==='—'?'长期':String(row.end).trim(),isLong=end==='长期';
  document.querySelector('.sd-map-modal')?.remove();document.body.insertAdjacentHTML('beforeend','<div class="sd-map-modal" role="dialog" aria-modal="true"><div class="sd-map-dialog"><div class="sd-map-dialog-head"><span>'+ (id?'维护坐席映射':'关联坐席')+'</span><button type="button" onclick="sdCloseMappingModal()">×</button></div><div class="sd-map-form">'+ref+'<label>坐席名称<input id="sdEditName" value="'+row.name+'" readonly></label><label>坐席帐号<input id="sdEditAccount" value="'+row.account+'" readonly></label><label class="full">VCP 帐号<input id="sdEditVcp" value="'+row.vcp+'" readonly></label><label>所属小组 <i style="color:#dc2626;font-style:normal">*</i><select id="sdEditGroup" required aria-required="true"><option value="A组" '+(row.group==='A组'?'selected':'')+'>A组</option><option value="B组" '+(row.group==='B组'?'selected':'')+'>B组</option><option value="C组" '+(row.group==='C组'?'selected':'')+'>C组</option></select></label><label>状态<select id="sdEditStatus"><option '+(row.status==='启用'?'selected':'')+'>启用</option><option '+(row.status==='停用'?'selected':'')+'>停用</option></select></label><label>生效日期 <i style="color:#dc2626;font-style:normal">*</i><input id="sdEditStart" type="date" value="'+start+'" required aria-required="true"></label><label>有效期 <i style="color:#dc2626;font-style:normal">*</i><select id="sdEditEndMode" onchange="sdChangeMappingEndMode()" required aria-required="true"><option value="长期" '+(isLong?'selected':'')+'>长期有效</option><option value="指定日期" '+(!isLong?'selected':'')+'>指定失效日期</option></select></label><label id="sdEditEndDateWrap" class="full" style="display:'+(isLong?'none':'grid')+'">失效日期 <i style="color:#dc2626;font-style:normal">*</i><input id="sdEditEndDate" type="date" min="'+start+'" value="'+(isLong?'':end)+'" '+(isLong?'disabled':'')+'></label></div><div class="sd-map-dialog-foot"><button class="sd-btn" type="button" onclick="sdCloseMappingModal()">取消</button><button class="sd-btn primary" type="button" onclick="sdSaveMapping()">保存</button></div></div></div>');
}
function sdFillSeatSource(){const row=sdMappings.find(item=>item.id===+document.getElementById('sdSeatSource').value);if(!row)return;document.getElementById('sdEditName').value=row.name;document.getElementById('sdEditAccount').value=row.account;document.getElementById('sdEditVcp').value=row.vcp}
function sdCloseMappingModal(){document.querySelector('.sd-map-modal')?.remove()}
function sdChangeMappingEndMode(){const specified=document.getElementById('sdEditEndMode').value==='指定日期',wrap=document.getElementById('sdEditEndDateWrap'),date=document.getElementById('sdEditEndDate'),start=document.getElementById('sdEditStart');if(!wrap||!date)return;wrap.style.display=specified?'grid':'none';date.disabled=!specified;if(specified){date.min=start?.value||'';if(!date.value)date.value=start?.value||''}}
function sdSaveMapping(){const group=document.getElementById('sdEditGroup').value,start=document.getElementById('sdEditStart').value,endMode=document.getElementById('sdEditEndMode').value,end=endMode==='长期'?'长期':document.getElementById('sdEditEndDate').value;if(!group||!start||!endMode)return alert('请完整填写必填项：所属小组、生效日期和有效期。');if(!end)return alert('请选择失效日期。');if(end!=='长期'&&end<start)return alert('失效日期不能早于生效日期。');const sourceId=sdMappingEditId||+document.getElementById('sdSeatSource').value,row=sdMappings.find(item=>item.id===sourceId);if(!row)return;Object.assign(row,{group,start,end,status:document.getElementById('sdEditStatus').value,updated:'张敏 · 2026-09-10 14:20'});sdCloseMappingModal();renderSdReportConfiguration()}

const renderSeatPerformanceDashboardWithConfigEntry=renderSeatPerformanceDashboard;
renderSeatPerformanceDashboard=function(){
  if(sdReportConfigOpen){renderSdReportConfiguration();return;}
  renderSeatPerformanceDashboardWithConfigEntry();
  const tabs=document.querySelector('#seatPerformanceDashboardPage .sd-report-tabs');
  if(tabs&&!tabs.querySelector('.sd-report-config-trigger'))tabs.insertAdjacentHTML('beforeend','<button type="button" class="sd-report-config-trigger" onclick="openSdReportConfiguration()">⚙ 报表配置</button>');
  if(!document.getElementById('sd-report-config-trigger-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-report-config-trigger-css">#seatPerformanceDashboardPage .sd-report-tabs .sd-report-config-trigger{margin-left:auto;border:1px solid #c9d9ee;background:#fff;color:#315f9f}#seatPerformanceDashboardPage .sd-report-tabs .sd-report-config-trigger:hover{border-color:#7fa5dd;background:#f4f8ff}@media(max-width:760px){#seatPerformanceDashboardPage .sd-report-tabs .sd-report-config-trigger{margin-left:0}}</style>');
}

/* 试驾量、锁单量：与排程/通话共用相同的日期＋小时筛选及人员归属。 */
const sdCalcBeforeOutcomeMetrics=sdCalc;
sdCalc=function(filter){
  const data=sdCalcBeforeOutcomeMetrics(filter);
  data.r.forEach((seat,index)=>{
    let drive=0,locked=0;
    data.ds.forEach((day,dayIndex)=>{
      for(let hour=9;hour<19;hour++){
        if((day===filter.s&&hour<filter.sh)||(day===filter.e&&hour>filter.eh)||(day===sdDays[6]&&index>=40))continue;
        const seed=(index*11+dayIndex*7+hour*5)%19;
        if(seed>=9)drive+=seed>=16?2:1;
        if(seed>=15&&(index+dayIndex+hour)%3===0)locked+=1;
      }
    });
    seat.drive=drive;
    seat.locked=locked;
  });
  data.on=data.r.filter(seat=>seat.p>0||seat.c>0||seat.task>0);
  data.off=data.r.filter(seat=>!data.on.includes(seat));
  data.r.forEach(seat=>{seat.onDuty=data.on.includes(seat)});
  data.gs.forEach(group=>{
    group.drive=group.a.reduce((sum,seat)=>sum+seat.drive,0);
    group.locked=group.a.reduce((sum,seat)=>sum+seat.locked,0);
    group.activeCount=group.a.filter(seat=>seat.onDuty).length;
  });
  return data;
};

sdTable=function(group){
  const rows=sdSort(group.a,'p','c');
  const callRank=sdSort(group.a,'c','p');
  const active=Math.max(1,group.activeCount||0);
  return '<div class="grp '+sdTag(group.g)+'"><b>▶ '+group.g+'</b><span>'+group.a.length+'人（休息 '+(group.a.length-(group.activeCount||0))+' 人）· 排程 '+group.p+' 批 · 通话 '+sdDur(group.c)+' · 试驾 '+group.drive+' 批 · 锁单 '+group.locked+' 台/单 · 人均排程 '+(group.p/active).toFixed(2)+' 批 · 人均试驾 '+(group.drive/active).toFixed(2)+' 批 · 人均锁单 '+(group.locked/active).toFixed(2)+' 台/单</span></div><table><thead><tr><th>#</th><th>姓名</th><th>佳佳代码</th><th>排程量（批）</th><th>目标排程量(日)</th><th>完成度</th><th>组内排程排名</th><th>通话时长</th><th>组内通话排名</th><th>试驾量（批）</th><th>锁单量（台/单）</th><th>备注</th></tr></thead><tbody>'+rows.map((seat,index)=>'<tr><td>'+(index+1)+'</td><td><b>'+seat.name+'</b></td><td><em>'+seat.code+'</em></td><td class="pc">'+seat.p+'</td><td class="pc">'+seat.eff+'</td><td>'+seat.cp.toFixed(1)+'%</td><td>第 '+(index+1)+' 名</td><td class="call">'+(seat.c?sdDur(seat.c):'—')+'</td><td>第 '+(callRank.indexOf(seat)+1)+' 名</td><td class="sd-drive">'+seat.drive+'</td><td class="sd-locked">'+seat.locked+'</td><td>'+(!seat.onDuty?'休息':'')+'</td></tr>').join('')+'</tbody></table>';
};

function sdOutcomeRank(rows,metric,tie,primaryUnit,secondaryLabel,secondaryUnit){
  return sdSort(rows,metric,tie).filter(seat=>seat[metric]>0).slice(0,10).map((seat,index)=>'<tr><td>'+(['🥇','🥈','🥉'][index]||index+1)+'</td><td><b>'+seat.name+'</b></td><td>'+seat.g+'</td><td class="'+(metric==='locked'?'sd-locked':'sd-drive')+'">'+seat[metric]+primaryUnit+'</td><td class="pc">'+seat[tie]+secondaryUnit+'</td></tr>').join('');
}
function sdOutcomeSummary(data){
  const totalDrive=data.r.reduce((sum,seat)=>sum+seat.drive,0),totalLocked=data.r.reduce((sum,seat)=>sum+seat.locked,0),active=Math.max(1,data.on.length),target=data.gs.reduce((sum,group)=>sum+group.t,0),schedule=data.r.reduce((sum,seat)=>sum+seat.p,0),calls=data.r.reduce((sum,seat)=>sum+seat.c,0);
  const groupRows=data.gs.map(group=>{const people=Math.max(1,group.activeCount);return '<tr><td>'+group.g+'</td><td>'+group.a.length+'人</td><td class="pc">'+group.p+'</td><td class="pc">'+group.t+'</td><td>'+(group.t?(group.p/group.t*100).toFixed(1):'—')+'%</td><td class="call">'+sdDur(group.c)+'</td><td class="sd-drive">'+group.drive+'</td><td class="sd-locked">'+group.locked+'</td><td>'+(group.p/people).toFixed(2)+'</td><td>'+sdDur(group.c/people)+'</td><td>'+(group.drive/people).toFixed(2)+'</td><td>'+(group.locked/people).toFixed(2)+'</td></tr>'}).join('');
  const champions=data.gs.map(group=>{const scheduleChampion=sdSort(group.a,'p','c')[0],callChampion=sdSort(group.a,'c','p')[0];return '<tr><td>'+group.g+'</td><td>🥇 '+scheduleChampion.name+'（'+scheduleChampion.p+'批）</td><td>🥇 '+callChampion.name+'（'+sdDur(callChampion.c)+'）</td><td class="pc">'+group.p+'批</td><td class="call">'+sdDur(group.c)+'</td></tr>'}).join('');
  return '<div class="box"><h3>一、各小组业绩汇总</h3><table><thead><tr><th>小组</th><th>员工人数</th><th>排程量（批）</th><th>目标排程量(日)</th><th>完成度</th><th>通话时长</th><th>试驾量（批）</th><th>锁单量（台/单）</th><th>人均排程</th><th>人均通话</th><th>人均试驾</th><th>人均锁单</th></tr></thead><tbody>'+groupRows+'<tr class="sum"><td>合计</td><td>'+data.r.length+'人</td><td class="pc">'+schedule+'</td><td class="pc">'+target+'</td><td>'+(target?(schedule/target*100).toFixed(1):'—')+'%</td><td class="call">'+sdDur(calls)+'</td><td class="sd-drive">'+totalDrive+'</td><td class="sd-locked">'+totalLocked+'</td><td>'+(schedule/active).toFixed(2)+'</td><td>'+sdDur(calls/active)+'</td><td>'+(totalDrive/active).toFixed(2)+'</td><td>'+(totalLocked/active).toFixed(2)+'</td></tr></tbody></table><h4>▎各小组冠军速览</h4><table><thead><tr><th>小组</th><th>排程量冠军</th><th>通话时长冠军</th><th>组排程量</th><th>组通话</th></tr></thead><tbody>'+champions+'</tbody></table></div>';
}
function sdOutcomeRankings(data){
  return '<div class="box"><h3>五、全员多指标榜单 TOP 10</h3><div class="charts sd-outcome-ranks"><table><caption>🥇 排程量 TOP 10（批）</caption><thead><tr><th>排名</th><th>姓名</th><th>小组</th><th>排程量</th><th>通话时长</th></tr></thead><tbody>'+sdTop(data.r,'p','c',1)+'</tbody></table><table><caption>🥇 通话时长 TOP 10</caption><thead><tr><th>排名</th><th>姓名</th><th>小组</th><th>通话时长</th><th>排程量</th></tr></thead><tbody>'+sdTop(data.r,'c','p',0)+'</tbody></table><table><caption>🥇 试驾量 TOP 10（批）</caption><thead><tr><th>排名</th><th>姓名</th><th>小组</th><th>试驾量</th><th>排程量</th></tr></thead><tbody>'+sdOutcomeRank(data.r,'drive','p','批','排程量','批')+'</tbody></table><table><caption>🥇 锁单量 TOP 10（台/单）</caption><thead><tr><th>排名</th><th>姓名</th><th>小组</th><th>锁单量</th><th>试驾量</th></tr></thead><tbody>'+sdOutcomeRank(data.r,'locked','drive','台/单','试驾量','批')+'</tbody></table></div></div>';
}
function sdOutcomeKpis(data){
  const schedule=data.r.reduce((sum,seat)=>sum+seat.p,0),calls=data.r.reduce((sum,seat)=>sum+seat.c,0),drive=data.r.reduce((sum,seat)=>sum+seat.drive,0),locked=data.r.reduce((sum,seat)=>sum+seat.locked,0);
  return '<div class="kpis sd-outcome-kpis"><div><small>总排程量</small><b>'+schedule+' <i>批</i></b><span>试驾排程下发 + 试驾线索下发</span></div><div><small>总通话时长</small><b>'+sdDur(calls)+'</b><span>'+calls+' 秒 · 仅累计有效接通</span></div><div><small>总试驾量</small><b>'+drive+' <i>批</i></b><span>试驾下发或已完成到店试驾</span></div><div><small>总锁单量</small><b>'+locked+' <i>台/单</i></b><span>下发或跟进转化为大定锁单</span></div><div><small>参与小组</small><b>3 <i>组</i></b><span>A组 / B组 / C组</span></div><div><small>休息员工</small><b>'+data.off.length+' <i>人</i></b><span>本时段未排班或轮休员工</span></div><div><small>当前时段在岗人数</small><b>'+data.on.length+' <i>人</i></b><span>当前有效映射员工总数 − 休息员工数</span></div></div>';
}

const sdPanelBeforeOutcomeMetrics=sdPanel;
sdPanel=function(id,title,orange){
  const data=sdCalc(sdF[id]);
  return sdPanelBeforeOutcomeMetrics(id,title,orange)
    .replace('指标：排程量 + 通话时长（口径与既有报表一致）','指标：排程量、通话时长、试驾量、锁单量（口径与既有报表一致）')
    .replace(/<div class="kpis">[\s\S]*?(?=<div class="box"><h3>一、各小组业绩汇总)/,sdOutcomeKpis(data))
    .replace(/<div class="box"><h3>一、各小组业绩汇总<\/h3>[\s\S]*?(?=<div class="box"><h3>二、小组业绩对比)/,sdOutcomeSummary(data))
    .replace(/<div class="box"><h3>五、全员双指标榜单 TOP 10<\/h3>[\s\S]*?<\/section>$/,sdOutcomeRankings(data)+'</section>');
};

const sdRenderMetricDefinitionsBeforeOutcomeMetrics=sdRenderMetricDefinitions;
sdRenderMetricDefinitions=function(){
  const content=sdRenderMetricDefinitionsBeforeOutcomeMetrics();
  if(sdMetricDefinitionTab!=='performance')return content;
  return content
    .replace('<tr><td><b>通话时长</b></td><td>仅统计已接通记录的通话时长，按秒累计。</td></tr>','<tr><td><b>通话时长</b></td><td>仅统计已接通记录的通话时长，按秒累计。</td></tr><tr><td><b>试驾量</b></td><td>回访结果属于试驾下发或已完成到店试驾的记录数，单位为批。</td></tr><tr><td><b>锁单量</b></td><td>下发或跟进转化为大定锁单的记录数，单位为台/单。</td></tr>')
    .replace('小组固定展示 A组、B组、C组；员工明细按排程量、通话时长、完成度依次排序。','小组固定展示 A组、B组、C组；员工明细同时展示排程量、通话时长、试驾量、锁单量及各项人均指标。')
    .replace('榜单只纳入对应指标大于 0 的员工；并列时按另一业务指标与完成度依次破局。','排程、通话、试驾、锁单榜单均只纳入对应指标大于 0 的员工；试驾并列按排程量破局，锁单并列按试驾量、排程量破局。');
};

const renderSeatPerformanceDashboardBeforeOutcomeMetrics=renderSeatPerformanceDashboard;
renderSeatPerformanceDashboard=function(){
  renderSeatPerformanceDashboardBeforeOutcomeMetrics();
  if(sdReportConfigOpen)return;
  const intro=document.querySelector('#seatPerformanceDashboardPage .sd > header p');
  if(intro){
    intro.innerHTML='两个板块互不影响，均可单独选择「开始日期＋小时 ～ 结束日期＋小时」；筛选一变，相关指标与图表会同步更新。<br><b>口径说明：</b><br>· <b>排程量</b>：回访结果为「试驾排程下发」或「试驾线索下发」的记录；<br>· <b>通话</b>：仅统计已接通的通话，时长累加计算。<br>· <b>试驾量</b>：回访结果属于试驾下发或已完成到店试驾的记录数，单位为批。<br>· <b>锁单量</b>：下发或跟进转化为大定锁单的记录数，单位为台/单。<br>· <b>目标排程量（日）</b>：小组按“月度目标 ÷ 30”计算；个人按“周排程量 ÷ 该周有效上班天数”计算，结果按 0.5 向上取整。<br>· <b>目标累计</b>：按筛选覆盖的天数累加。<br>· <b>完成度</b>：排程量 ÷ 目标。';
    sdCompactReportIntro(document.querySelector('#seatPerformanceDashboardPage .sd'));
  }
  if(!document.getElementById('sd-outcome-metrics-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-outcome-metrics-css">#seatPerformanceDashboardPage .sd .sd-drive{color:#6d4cc7;font-weight:700}#seatPerformanceDashboardPage .sd .sd-locked{color:#b45309;font-weight:700}#seatPerformanceDashboardPage .sd .sd-outcome-ranks{grid-template-columns:repeat(2,minmax(0,1fr))}@media(max-width:900px){#seatPerformanceDashboardPage .sd .sd-outcome-ranks{grid-template-columns:1fr}}</style>');
};

/* 每日两王：以自然日结算，不受两个时段筛选器影响。 */
let sdHonorRange='7';
function sdHonorDailyRecords(){
  return sdDays.map(day=>{
    const data=sdCalc({s:day,sh:0,e:day,eh:23});
    const sales=sdSort(data.r,'p','c')[0],worker=sdSort(data.r,'c','p')[0];
    return {day,sales,worker,double:sales&&worker&&sales.name===worker.name};
  }).reverse();
}
function sdHonorMedal(row){
  if(row.sales&&row.worker)return '<span class="sd-honor-tag dual">👑💪 双料王者</span>';
  return row.sales?'<span class="sd-honor-tag sale">👑 金牌销冠</span>':'<span class="sd-honor-tag work">💪 敬业劳模</span>';
}
function sdHonorContent(){
  const history=sdHonorDailyRecords(),today=history[0],aggregate=new Map();
  history.forEach(record=>{
    [[record.sales,'sales'],[record.worker,'worker']].forEach(([seat,type])=>{
      if(!seat)return;
      const item=aggregate.get(seat.name)||{name:seat.name,g:seat.g,sales:0,worker:0,double:0,last:record.day};
      item[type]++;if(record.double)item.double++;if(record.day>item.last)item.last=record.day;aggregate.set(seat.name,item);
    });
  });
  const ranking=[...aggregate.values()].sort((a,b)=>(b.sales+b.worker)-(a.sales+a.worker)||b.double-a.double||b.sales-a.sales||b.last.localeCompare(a.last)).slice(0,10);
  const count=sdHonorRange==='7'?7:history.length;
  const visibleHistory=history.slice(0,count);
  const doubleCount=history.filter(record=>record.double).length;
  const todaySales=today.sales,todayWorker=today.worker;
  return '<section class="sd-honor"><div class="sd-honor-heading"><div><h2>八、每日两王 · 荣誉榜与历史公示</h2><p>按自然日结算，以每日“销冠王”和“劳模王”记录个人荣誉；与上方两个时段筛选独立。</p></div><span class="sd-honor-date">今日结算：'+today.day+'</span></div><div class="sd-honor-today"><div class="sd-crown-card sales"><div class="sd-crown-kicker">今日双王 · TODAY / 销冠王</div><div class="sd-crown-main"><span class="sd-crown-icon">👑</span><div><b>'+todaySales.name+'</b><span>'+todaySales.g+' · '+todaySales.code+'</span></div></div><div class="sd-crown-value">'+todaySales.p+' <small>批排程量</small></div><p>按当日排程量评选 · 并列依次按有效排程率、意向线索下发破局</p></div><div class="sd-crown-card worker"><div class="sd-crown-kicker">今日双王 · TODAY / 劳模王</div><div class="sd-crown-main"><span class="sd-crown-icon">💪</span><div><b>'+todayWorker.name+'</b><span>'+todayWorker.g+' · '+todayWorker.code+'</span></div></div><div class="sd-crown-value">'+sdDur(todayWorker.c)+' <small>有效通话</small></div><p>按当日有效通话时长评选 · 并列依次按排程量、有效排程率破局</p></div><div class="sd-crown-side"><span>双料王者</span><b>'+ (today.double?'👑💪 '+todaySales.name:'—') +'</b><small>'+ (today.double?'今日同时获得两项王座':'今日两项王座由不同员工获得') +'</small></div></div><div class="sd-honor-summary"><div><small>公示天数</small><b>'+history.length+' <i>天</i></b><span>已结算自然日</span></div><div><small>上榜人数</small><b>'+aggregate.size+' <i>人</i></b><span>至少获得 1 次王座</span></div><div><small>双冠次数</small><b>'+doubleCount+' <i>次</i></b><span>同人同日获得双王</span></div></div><div class="sd-honor-grid"><div class="sd-honor-box"><div class="sd-honor-box-head"><h3>累计荣誉榜 TOP</h3><span>按累计上榜次数排序</span></div><table><thead><tr><th>排名</th><th>员工</th><th>小组</th><th>销冠王</th><th>劳模王</th><th>双冠</th><th>荣誉称号</th></tr></thead><tbody>'+ranking.map((row,index)=>'<tr><td>'+(['🥇','🥈','🥉'][index]||index+1)+'</td><td><b>'+row.name+'</b></td><td>'+row.g+'</td><td>'+row.sales+' 次</td><td>'+row.worker+' 次</td><td>'+row.double+' 次</td><td>'+sdHonorMedal(row)+'</td></tr>').join('')+'</tbody></table></div><div class="sd-honor-box"><div class="sd-honor-box-head"><h3>往期公示 HISTORY</h3><div class="sd-honor-range"><button class="'+(sdHonorRange==='7'?'active':'')+'" onclick="switchSdHonorRange(\'7\')">近 7 天</button><button class="'+(sdHonorRange==='30'?'active':'')+'" onclick="switchSdHonorRange(\'30\')">近 30 天</button><button class="'+(sdHonorRange==='month'?'active':'')+'" onclick="switchSdHonorRange(\'month\')">当月</button></div></div><table><thead><tr><th>公示日期</th><th>销冠王</th><th>劳模王</th><th>双料</th></tr></thead><tbody>'+visibleHistory.map(record=>'<tr><td>'+record.day+'</td><td><b>👑 '+record.sales.name+'</b><br><span>'+record.sales.p+' 批排程</span></td><td><b>💪 '+record.worker.name+'</b><br><span>'+sdDur(record.worker.c)+'</span></td><td>'+ (record.double?'👑💪':'—') +'</td></tr>').join('')+'</tbody></table><p class="sd-honor-history-note">原型当前提供 '+history.length+' 天的本地模拟公示数据；近 30 天与当月会展示当前可用记录。</p></div></div></section>';
}
function switchSdHonorRange(range){sdHonorRange=range;renderSeatPerformanceDashboard()}

const renderSeatPerformanceDashboardBeforeHonor=renderSeatPerformanceDashboard;
renderSeatPerformanceDashboard=function(){
  renderSeatPerformanceDashboardBeforeHonor();
  /* 每日两王模块已按页面需求移除，不再插入任何荣誉榜或历史公示内容。 */
  return;
  const root=document.querySelector('#seatPerformanceDashboardPage .sd');
  if(!root)return;
  root.querySelector('.sd-honor')?.remove();
  root.insertAdjacentHTML('beforeend',sdHonorContent());
  if(!document.getElementById('sd-honor-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-honor-css">#seatPerformanceDashboardPage .sd .sd-honor{margin-top:26px;padding:26px 24px;border:1px solid #e4eaf3;border-radius:16px;background:linear-gradient(145deg,#fff,#f8fbff);box-shadow:0 8px 26px rgba(37,56,88,.045)}#seatPerformanceDashboardPage .sd .sd-honor-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid #e7edf5}#seatPerformanceDashboardPage .sd .sd-honor-heading h2{margin:0 0 7px;padding-left:11px;border-left:4px solid #2f64b9;color:#253754;font-size:19px;line-height:1.35}#seatPerformanceDashboardPage .sd .sd-honor-heading p{margin:0;color:#718198;font-size:13px}#seatPerformanceDashboardPage .sd .sd-honor-date{flex:0 0 auto;padding:7px 10px;border:1px solid #d9e6f7;border-radius:7px;background:#f4f8fd;color:#315f9f;font-size:12px;font-weight:700}.sd-honor-today{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:18px}.sd-crown-card,.sd-crown-side{min-height:166px;padding:18px;border:1px solid #e5ebf4;border-radius:12px;background:#fff}.sd-crown-card{position:relative;overflow:hidden}.sd-crown-card:after{content:"";position:absolute;right:-24px;bottom:-42px;width:112px;height:112px;border:20px solid rgba(47,100,185,.06);border-radius:50%}.sd-crown-card.worker:after{border-color:rgba(47,128,102,.07)}.sd-crown-kicker{position:relative;z-index:1;color:#7b8aa1;font-size:11px;font-weight:800;letter-spacing:.7px}.sd-crown-main{position:relative;z-index:1;display:flex;align-items:center;gap:10px;margin:12px 0 8px}.sd-crown-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#f3f7fc;font-size:23px}.sd-crown-main b{display:block;color:#293b57;font-size:19px}.sd-crown-main span{display:block;margin-top:2px;color:#718198;font-size:12px}.sd-crown-value{position:relative;z-index:1;color:#2f64b9;font-size:23px;font-weight:800}.sd-crown-card.worker .sd-crown-value{color:#2f8066}.sd-crown-value small{font-size:12px;font-weight:600}.sd-crown-card p{position:relative;z-index:1;margin:8px 0 0;color:#8794a7;font-size:11px;line-height:1.55}.sd-crown-side{display:flex;flex-direction:column;justify-content:center;background:linear-gradient(145deg,#fffaf0,#fff)}.sd-crown-side span{color:#a26a16;font-size:12px;font-weight:700}.sd-crown-side b{margin:8px 0;color:#795318;font-size:17px}.sd-crown-side small{color:#9a7b47;font-size:12px;line-height:1.55}.sd-honor-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:14px 0}.sd-honor-summary>div{padding:14px 16px;border:1px solid #e6edf6;border-radius:10px;background:#fff}.sd-honor-summary small,.sd-honor-summary span{display:block;color:#7b8aa1;font-size:12px}.sd-honor-summary b{display:block;margin:5px 0;color:#253754;font-size:23px}.sd-honor-summary i{color:#718198;font-size:12px;font-style:normal}.sd-honor-grid{display:grid;grid-template-columns:1.15fr 1fr;gap:14px}.sd-honor-box{overflow:hidden;border:1px solid #e5ebf4;border-radius:11px;background:#fff}.sd-honor-box-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:15px 16px;border-bottom:1px solid #e8eef5;background:#fbfcfe}.sd-honor-box-head h3{margin:0;padding-left:9px;border-left:3px solid #2f64b9;color:#31415b;font-size:14px}.sd-honor-box-head>span,.sd-honor-history-note{color:#8794a7;font-size:11px}.sd-honor-box table{border:0!important}.sd-honor-box th{padding:9px 8px!important}.sd-honor-box td{padding:9px 8px!important}.sd-honor-box td span{color:#8794a7;font-size:11px}.sd-honor-tag{display:inline-block;padding:3px 6px;border-radius:5px;font-size:11px;font-weight:700;white-space:nowrap}.sd-honor-tag.dual{background:#fff4dc;color:#a66305}.sd-honor-tag.sale{background:#eef5ff;color:#2f64b9}.sd-honor-tag.work{background:#edf9f4;color:#2f8066}.sd-honor-range{display:flex;gap:4px}.sd-honor-range button{height:26px;padding:0 7px;border:1px solid #dbe4f0;border-radius:5px;background:#fff;color:#718198;font:600 11px "Microsoft YaHei";cursor:pointer}.sd-honor-range button.active{border-color:#9dbbe4;background:#edf4ff;color:#2f64b9}.sd-honor-history-note{margin:10px 12px 12px;line-height:1.55}@media(max-width:1050px){.sd-honor-today{grid-template-columns:1fr 1fr}.sd-crown-side{grid-column:1/-1;min-height:auto;flex-direction:row;align-items:center;gap:12px}.sd-crown-side b{margin:0}.sd-honor-grid{grid-template-columns:1fr}}@media(max-width:680px){#seatPerformanceDashboardPage .sd .sd-honor{padding:18px 14px}.sd-honor-heading{flex-direction:column}.sd-honor-today,.sd-honor-summary{grid-template-columns:1fr}.sd-crown-side{grid-column:auto;align-items:flex-start;flex-direction:column;gap:0}.sd-crown-side b{margin:8px 0}.sd-honor-box{overflow-x:auto}}</style>');
};

/* 指标说明 2026-09 更新：将业务口径补齐到坐席业务看板的可视化数据中。 */
const sdCalcBeforeMetricRefinement=sdCalc;
sdCalc=function(filter){
  const data=sdCalcBeforeMetricRefinement(filter);
  data.r.forEach((seat,index)=>{
    // 模拟来源字段：已分配任务量、意向下发、当日外呼任务量和企微添加，用于榜单破局与每日两王口径。
    // 已分配任务量：已分配到员工任务池的任务，含被终止任务；按任务编码去重并按任务分配日期归属。
    seat.allocatedTask=Math.max(0,Number(seat.task)||0);
    seat.intent=Math.max(0,Math.floor(seat.p/2)+(index%3));
    // 有效排程率 = 排程量 ÷ 已分配任务量；分母为 0 时按 0 处理，避免无任务数据参与破局。
    seat.scheduleRate=seat.allocatedTask?seat.p/seat.allocatedTask:0;
    // 当日外呼任务量：人工培育已分配的任务量，按任务编码去重，并按任务生成日期随筛选维度联动汇总。
    seat.outbound=Math.max(0,Number(seat.task)||0);
    seat.wechatAdded=Math.min(seat.outbound,Math.floor(seat.outbound*(.28+(index%4)*.07)));
    seat.wechatRate=seat.outbound?seat.wechatAdded/seat.outbound:0;
  });
  return data;
};
function sdScheduleRank(rows){return [...rows].sort((a,b)=>b.p-a.p||b.scheduleRate-a.scheduleRate||b.intent-a.intent||a.name.localeCompare(b.name,'zh-CN'))}
function sdCallRank(rows){return [...rows].sort((a,b)=>b.c-a.c||b.outbound-a.outbound||b.scheduleRate-a.scheduleRate||a.name.localeCompare(b.name,'zh-CN'))}
function sdLaborRank(rows){return [...rows].sort((a,b)=>b.c-a.c||b.outbound-a.outbound||b.wechatRate-a.wechatRate||a.name.localeCompare(b.name,'zh-CN'))}
function sdDriveRank(rows){return [...rows].sort((a,b)=>b.drive-a.drive||b.p-a.p||b.scheduleRate-a.scheduleRate||a.name.localeCompare(b.name,'zh-CN'))}
function sdLockRank(rows){return [...rows].sort((a,b)=>b.locked-a.locked||b.drive-a.drive||b.p-a.p||a.name.localeCompare(b.name,'zh-CN'))}
function sdSalesKingRank(rows){return [...rows].sort((a,b)=>b.salesKing-a.salesKing||b.p-a.p||b.scheduleRate-a.scheduleRate||b.intent-a.intent||a.name.localeCompare(b.name,'zh-CN'))}
function sdLaborKingRank(rows){return [...rows].sort((a,b)=>b.laborKing-a.laborKing||b.c-a.c||b.outbound-a.outbound||b.wechatRate-a.wechatRate||a.name.localeCompare(b.name,'zh-CN'))}

const sdUnderCalcBeforeOutcomeExpansion=sdUnderCalc;
sdUnderCalc=function(filter){
  const data=sdUnderCalcBeforeOutcomeExpansion(filter);
  data.people.forEach((seat,index)=>{
    let drive=0,locked=0;
    data.days.forEach((day,dayIndex)=>{
      for(let hour=9;hour<19;hour++){
        if((day===filter.s&&hour<filter.sh)||(day===filter.e&&hour>filter.eh)||(day===sdDays[6]&&index>=40))continue;
        const seed=(index*17+dayIndex*11+hour*7)%29;
        if(seed>=16)drive+=seed>=25?2:1;
        if(seed>=23&&(index+dayIndex+hour)%3===0)locked+=1;
      }
    });
    seat.drive=drive;seat.locked=locked;
  });
  data.groups.forEach(group=>{
    group.rows.sort((a,b)=>b.under-a.under||b.activation-a.activation||b.plan-a.plan||b.drive-a.drive||b.locked-a.locked||a.name.localeCompare(b.name,'zh-CN'));
    group.drive=group.rows.reduce((sum,row)=>sum+row.drive,0);
    group.locked=group.rows.reduce((sum,row)=>sum+row.locked,0);
  });
  data.total.drive=data.groups.reduce((sum,group)=>sum+group.drive,0);
  data.total.locked=data.groups.reduce((sum,group)=>sum+group.locked,0);
  return data;
};
sdUnderRow=function(row,index){return '<tr><td>'+(index+1)+'</td><td><b>'+row.name+'</b></td><td><em>'+row.code+'</em></td><td>'+row.task+'</td><td class="sd-under-critical">'+row.under+'</td><td class="pc">'+row.plan+'</td><td class="sd-under-active">'+row.activation+'</td><td class="sd-drive">'+row.drive+'</td><td class="sd-locked">'+row.locked+'</td><td class="call">'+sdDur(row.call)+'</td><td><span class="sd-under-status">未满标</span></td></tr>'};
sdUnderGroup=function(group){
  if(!group.rows.length)return '<div class="sd-under-group '+sdUnderTag(group.g)+'"><b>'+group.g+'</b><span>当前筛选时段暂无留资未满任务记录</span></div>';
  return '<div class="sd-under-group '+sdUnderTag(group.g)+'"><b>'+group.g+'</b><span>留资未满 '+group.under+' 条 · 任务 '+group.task+' 条 · 排程 '+group.plan+' 批 · 激活 '+group.activation+' 批 · 试驾 '+group.drive+' 批 · 锁单 '+group.locked+' 台/单 · 通话 '+sdDur(group.call)+'</span></div><div class="sd-under-table"><table><thead><tr><th>#</th><th>姓名</th><th>佳佳代码</th><th>任务数</th><th>留资未满数</th><th>排程量(批)</th><th>激活量(批)</th><th>试驾量(批)</th><th>锁单量(台/单)</th><th>通话时长</th><th>状态</th></tr></thead><tbody>'+group.rows.map(sdUnderRow).join('')+'</tbody></table></div>';
};
const sdUnderContentBeforeOutcomeExpansion=sdUnderContent;
sdUnderContent=function(data,total){
  return sdUnderContentBeforeOutcomeExpansion(data,total)
    .replace('</div><div class="sd-under-box"><h3>一、','<div><small>总试驾量</small><b>'+total.drive+' <i>批</i></b><span>试驾下发或已完成到店试驾</span></div><div><small>总锁单量</small><b>'+total.locked+' <i>台/单</i></b><span>下发或跟进转化为大定锁单</span></div></div><div class="sd-under-box"><h3>一、')
    .replace('二、留资未满数 / 激活量 / 排程量分布','二、留资未满数 / 激活量 / 排程量 / 试驾量 / 锁单量分布')
    .replace(/<\/div><\/div>$/, '<div><small>人均试驾量</small><b>'+(total.drive/Math.max(1,total.people)).toFixed(1)+' 批</b><span>按参与员工计算</span></div><div><small>人均锁单量</small><b>'+(total.locked/Math.max(1,total.people)).toFixed(1)+' 台/单</b><span>按参与员工计算</span></div></div></div>');
};
const renderSdUnderDistributionBeforeOutcomeExpansion=renderSdUnderDistribution;
renderSdUnderDistribution=function(data){
  const value=(row,key)=>Number.isFinite(Number(row[key]))?Number(row[key]):0;
  const rows=[...data.involved].map(row=>({...row,under:value(row,'under'),activation:value(row,'activation'),plan:value(row,'plan'),drive:value(row,'drive'),locked:value(row,'locked')})).sort((a,b)=>b.under-a.under||b.activation-a.activation||b.plan-a.plan||b.drive-a.drive||b.locked-a.locked||a.name.localeCompare(b.name,'zh-CN'));
  const max=Math.max(1,...rows.flatMap(row=>[row.under,row.activation,row.plan,row.drive,row.locked]));
  const bar=(type,amount)=>'<div class="sd-under-vbar '+type+'" style="height:'+Math.max(amount?5:0,amount/max*100)+'%" title="'+amount+'"><b>'+amount+'</b></div>';
  const style='<style id="sd-under-outcome-chart-css">#seatPerformanceDashboardPage .sd-under-vbar.drive{background:#5b47b7}#seatPerformanceDashboardPage .sd-under-vbar.locked{background:#bd6a22}#seatPerformanceDashboardPage .sd-under-chart-legend .drive{background:#5b47b7}#seatPerformanceDashboardPage .sd-under-chart-legend .locked{background:#bd6a22}#seatPerformanceDashboardPage .sd-under-five-metrics{min-width:760px;height:414px;padding:34px 14px 0;background:repeating-linear-gradient(to top,#fff 0,#fff 70px,#edf1f6 71px,#fff 72px)}#seatPerformanceDashboardPage .sd-under-five-metrics .sd-under-column-item{grid-template-rows:294px 54px;min-width:0}#seatPerformanceDashboardPage .sd-under-five-metrics .sd-under-column-bars{height:294px;gap:5px;padding:0 10px}#seatPerformanceDashboardPage .sd-under-five-metrics .sd-under-vbar{flex:0 0 17px;width:17px}#seatPerformanceDashboardPage .sd-under-five-metrics .sd-under-vbar b{font-size:10px}#seatPerformanceDashboardPage .sd-under-five-metrics .sd-under-vname{padding-top:10px}#seatPerformanceDashboardPage .sd-under-empty{padding:38px 18px;border:1px dashed #d8e2ef;border-radius:8px;background:#fbfcfe;color:#718198;text-align:center;font-size:13px}@media(max-width:760px){#seatPerformanceDashboardPage .sd-under-five-metrics{height:370px;padding-top:30px}#seatPerformanceDashboardPage .sd-under-five-metrics .sd-under-column-item{grid-template-rows:258px 48px}#seatPerformanceDashboardPage .sd-under-five-metrics .sd-under-column-bars{height:258px}}</style>';
  const legend='<div class="sd-under-chart-legend"><span><i class="under"></i>留资未满数（条）</span><span><i class="activation"></i>激活量（批）</span><span><i class="plan"></i>排程量（批）</span><span><i class="drive"></i>试驾量（批）</span><span><i class="locked"></i>锁单量（台/单）</span><small>按留资未满、激活、排程、试驾、锁单依次排序；人员较多时可横向滚动查看。</small></div>';
  if(!rows.length)return style+'<div class="sd-under-chart">'+legend+'<div class="sd-under-empty">当前筛选时段暂无可展示的留资未满数据</div></div>';
  const columnWidth=142,chartWidth=Math.max(760,rows.length*columnWidth);
  return style+'<div class="sd-under-chart">'+legend+'<div class="sd-under-column-scroll"><div class="sd-under-column-chart sd-under-five-metrics" style="min-width:'+chartWidth+'px;grid-template-columns:repeat('+rows.length+',minmax('+columnWidth+'px,1fr))">'+rows.map(row=>'<div class="sd-under-column-item" data-name="'+row.name+'" data-group="'+row.g+'" data-under="'+row.under+'" data-activation="'+row.activation+'" data-plan="'+row.plan+'" data-drive="'+row.drive+'" data-locked="'+row.locked+'"><div class="sd-under-column-bars">'+bar('under',row.under)+bar('activation',row.activation)+bar('plan',row.plan)+bar('drive',row.drive)+bar('locked',row.locked)+'</div><div class="sd-under-vname">'+row.name+'</div></div>').join('')+'</div><div class="sd-under-tooltip"></div></div></div>';
};
const sdBindUnderChartHoverBeforeOutcomeExpansion=sdBindUnderChartHover;
sdBindUnderChartHover=function(){
  document.querySelectorAll('#seatPerformanceDashboardPage .sd-under-column-scroll').forEach(scroll=>{
    const tip=scroll.querySelector('.sd-under-tooltip');if(!tip)return;
    const hide=()=>{tip.style.display='none';scroll.querySelectorAll('.is-hover').forEach(item=>item.classList.remove('is-hover'))};
    const renderTip=(item,event)=>{item.classList.add('is-hover');tip.innerHTML='<strong>'+item.dataset.name+'（'+item.dataset.group+'）</strong><p><i style="background:#c67a3b"></i><span>留资未满</span><b>'+item.dataset.under+' 条</b></p><p><i style="background:#7053b6"></i><span>激活量</span><b>'+item.dataset.activation+' 批</b></p><p><i style="background:#2f64b9"></i><span>排程量</span><b>'+item.dataset.plan+' 批</b></p><p><i style="background:#5b47b7"></i><span>试驾量</span><b>'+item.dataset.drive+' 批</b></p><p><i style="background:#bd6a22"></i><span>锁单量</span><b>'+item.dataset.locked+' 台/单</b></p>';tip.style.display='block';const box=scroll.getBoundingClientRect(),maxLeft=Math.max(12,scroll.clientWidth-232),maxTop=Math.max(12,scroll.clientHeight-192);tip.style.left=Math.min(Math.max(12,event.clientX-box.left+16),maxLeft)+'px';tip.style.top=Math.min(Math.max(12,event.clientY-box.top-150),maxTop)+'px'};
    scroll.querySelectorAll('.sd-under-column-item').forEach(item=>{item.onmouseenter=event=>renderTip(item,event);item.onmousemove=event=>renderTip(item,event);item.onmouseleave=hide});
    scroll.onmouseleave=hide;
  });
};

/* 最终生效层：放在历史兼容实现之后，确保配置联动不会被旧版展示函数覆盖。 */
(()=>{
  sdTable=function(group){
    const rows=sdScheduleRank(group.a),calls=sdCallRank(group.a),honors=typeof sdHonorCounts==='function'?sdHonorCounts():new Map(),active=group.activeCount||0;
    const average=active?(group.p/active).toFixed(2)+' 批':'—';
    return '<div class="grp '+sdTag(group.g)+'"><b>▶ '+group.g+'</b><span>'+group.a.length+'人（休息 '+(group.a.length-active)+' 人）· 排程 '+group.p+' 批 · 通话 '+sdDur(group.c)+' · 试驾 '+group.drive+' 批 · 锁单 '+group.locked+' 台/单 · 人均排程 '+average+'</span></div><table><thead><tr><th>#</th><th>姓名</th><th>佳佳代码</th><th>排程量（批）</th><th>目标排程量(日)</th><th>完成度</th><th>组内排程排名</th><th>通话时长</th><th>组内通话排名</th><th>试驾量（批）</th><th>锁单量（台/单）</th><th>月累销冠王次数</th><th>月累劳模王次数</th><th>备注</th></tr></thead><tbody>'+rows.map((seat,index)=>{const honor=honors.get(seat.name)||{sales:0,worker:0};return '<tr><td>'+(index+1)+'</td><td><b>'+seat.name+'</b></td><td><em>'+seat.code+'</em></td><td class="pc">'+seat.p+'</td><td class="pc">'+(seat.targetConfigured?seat.eff:'未配置')+'</td><td>'+(seat.targetConfigured?seat.cp.toFixed(1)+'%':'—')+'</td><td>第 '+(index+1)+' 名</td><td class="call">'+(seat.c?sdDur(seat.c):'—')+'</td><td>第 '+(calls.indexOf(seat)+1)+' 名</td><td class="sd-drive">'+seat.drive+'</td><td class="sd-locked">'+seat.locked+'</td><td>'+honor.sales+' 次</td><td>'+honor.worker+' 次</td><td>'+(!seat.onDuty?'休息':'')+'</td></tr>';}).join('')+'</tbody></table>';
  };

  const underReportWithQuality=renderSdUnderReport;
  renderSdUnderReport=function(){
    underReportWithQuality();
    const root=document.querySelector('#seatPerformanceDashboardPage .sd');if(!root)return;
    const quality=sdUnderCalc(sdUnderF).quality;
    root.querySelectorAll('.sd-under-panel').forEach(panel=>{
      panel.querySelector('.sd-data-quality')?.remove();
      const filter=panel.querySelector('.sd-under-filter');
      if(filter)filter.insertAdjacentHTML('afterend',sdDataQualityNotice(quality,false));
    });
  };

  // 让调用函数在 onclick 场景下稳定可用。
  window.sdOpenDataQualityMapping=sdOpenDataQualityMapping;
  window.sdOpenTargetDataQuality=sdOpenTargetDataQuality;
  const renderWithFinalConfigurationCopy=renderSeatPerformanceDashboard;
  renderSeatPerformanceDashboard=function(){
    renderWithFinalConfigurationCopy();
    if(sdReportConfigOpen||sdBusinessTab!=='performance')return;
    const root=document.querySelector('#seatPerformanceDashboardPage .sd'),intro=root?.querySelector('header p');
    if(!intro)return;
    intro.innerHTML='两个板块互不影响，均可单独选择「开始日期＋小时 ～ 结束日期＋小时」；筛选变化后，指标、图表和明细同步更新。<br><b>归属与目标口径：</b><br>· <b>人员归属</b>：按坐席当前最新有效的小组关系汇总；调组后，历史业绩同步归入最新小组。<br>· <b>个人目标</b>：按目标配置的周排程量及排班有效工作日，随筛选日期逐日累计。<br>· <b>小组目标</b>：组内个人月度目标汇总后 ÷ 30，按 0.5 向上取整为日目标，再按覆盖天数累计；不单独录入。<br>· <b>缺失目标</b>：不使用默认目标补算；目标显示“未配置”，完成度显示“—”。<br>· <b>完成度</b>：排程量 ÷ 有效目标。';
    sdCompactReportIntro(root);
  };
  renderSeatPerformanceDashboard();
})();

/* 累计荣誉字段统一为当前命名，并按“劳模王、销冠王”顺序展示。 */
const sdTableBeforeCumulativeTerminology=sdTable;
sdTable=function(group){
  return sdTableBeforeCumulativeTerminology(group)
    .replace('<th>月累销冠王次数</th><th>月累劳模王次数</th>','<th>累计劳模王次数</th><th>累计销冠王次数</th>')
    .replace(/<td>(\d+) 次<\/td><td>(\d+) 次<\/td><td>/g,'<td>$2 次</td><td>$1 次</td><td>');
};
/* 业绩晾晒 / 留资未满报告：展示名称由“锁单”统一调整为“交车”。
   保持内部字段 locked 与既有统计逻辑不变，避免将一次文案调整扩大为数据口径变更。 */
(function(){
  const sdRenderSeatPerformanceDashboard=renderSeatPerformanceDashboard;
  const isEmployeeReport=node=>node.parentElement?.closest('.sd-employee-report');
  const renameText=text=>text
    .replaceAll('锁单量','交车量')
    .replaceAll('人均锁单','人均交车')
    .replaceAll('锁单','交车')
    .replace(/第一大点\s*时段业绩（可筛选）/g,'第一大点 新线索（可筛选）')
    .replace(/第二大点\s*时段业绩（可筛选）/g,'第二大点 全量线索（可筛选）');
  const applyDeliveryLabels=()=>{
    const root=document.querySelector('#seatPerformanceDashboardPage .sd');
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(!isEmployeeReport(node)&&node.nodeValue.includes('锁单'))nodes.push(node);
    }
    nodes.forEach(node=>{node.nodeValue=renameText(node.nodeValue)});
    root.querySelectorAll('[aria-label],[title]').forEach(node=>{
      if(isEmployeeReport(node))return;
      ['aria-label','title'].forEach(attribute=>{
        const value=node.getAttribute(attribute);
        if(value?.includes('锁单'))node.setAttribute(attribute,renameText(value));
      });
    });
  };
  window.sdApplyDeliveryLabels=applyDeliveryLabels;
  renderSeatPerformanceDashboard=function(){
    sdRenderSeatPerformanceDashboard.apply(this,arguments);
    applyDeliveryLabels();
  };
})();
renderSeatPerformanceDashboard();

/* 图表画布在页面切换时可能先以 display:none 挂载，首次绘制会得到 0 × 0 的尺寸。
   仅在容器完成布局后绘制，并在尺寸变化时重新绘制，避免保留空白画布。 */
(function () {
  let drawFrame = 0;
  let retryTimer = 0;
  let resizeObserver;

  function getDashboardCanvases(panelId) {
    const selector = panelId 
      ? '#seatPerformanceDashboardPage .sd-panel-' + panelId + ' canvas[data-sd-chart]'
      : '#seatPerformanceDashboardPage canvas[data-sd-chart]';
    return Array.from(document.querySelectorAll(selector));
  }

  function isCanvasInCollapsedPanel(canvas) {
    const panel = canvas.closest('.sd-panel');
    return !!(panel && panel.classList.contains('is-collapsed'));
  }

  function canvasHasPaint(canvas) {
    if (!canvas.width || !canvas.height) return false;
    try {
      const sample = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      for (let index = 3; index < sample.length; index += 32) {
        if (sample[index] !== 0) return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  function renderDashboardSvgFallback(canvas, data) {
    const host = canvas.parentElement;
    if (!host || host.querySelector('.sd-chart-svg-fallback')) return;
    const type = canvas.dataset.sdChart;
    const width = 1000, height = 360, left = 58, right = 28, top = 56, bottom = 54;
    const chartWidth = width - left - right, chartHeight = height - top - bottom;
    const esc = value => String(value).replace(/[&<>]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char]);
    const axis = Array.from({ length: 5 }, (_, index) => {
      const y = top + chartHeight * index / 4;
      return '<line x1="' + left + '" y1="' + y + '" x2="' + (width - right) + '" y2="' + y + '" stroke="#e7edf4"/>';
    }).join('');
    let content = '<text x="' + (width / 2) + '" y="26" text-anchor="middle" fill="#253754" font-size="15" font-weight="700">';

    if (type === 'bar') {
      const max = Math.max(1, ...data.gs.map(group => Math.max(group.p, group.c / 60)));
      const slot = chartWidth / data.gs.length;
      content += '小组业绩对比</text>' + axis + data.gs.map((group, index) => {
        const base = left + slot * index + slot / 2;
        const scheduleHeight = group.p / max * chartHeight;
        const callHeight = group.c / 60 / max * chartHeight;
        return '<rect x="' + (base - 36) + '" y="' + (top + chartHeight - scheduleHeight) + '" width="28" height="' + scheduleHeight + '" rx="4" fill="#2f64b9"/>'
          + '<rect x="' + (base + 8) + '" y="' + (top + chartHeight - callHeight) + '" width="28" height="' + callHeight + '" rx="4" fill="#2f8066"/>'
          + '<text x="' + base + '" y="' + (height - 20) + '" text-anchor="middle" fill="#52637c" font-size="13">' + esc(group.g) + '</text>';
      }).join('');
    } else if (type === 'donut') {
      const values = data.gs.map(group => group.c / 60);
      const total = values.reduce((sum, value) => sum + value, 0) || 1;
      let offset = 0;
      const colors = ['#2f64b9', '#2f8066', '#8aa1ba'];
      content += '小组通话时长占比</text><g transform="rotate(-90 500 190)">' + values.map((value, index) => {
        const length = value / total * 565;
        const dash = length + ' ' + (565 - length);
        const item = '<circle cx="500" cy="190" r="90" fill="none" stroke="' + colors[index] + '" stroke-width="48" stroke-dasharray="' + dash + '" stroke-dashoffset="-' + offset + '"/>';
        offset += length;
        return item;
      }).join('') + '</g><text x="500" y="185" text-anchor="middle" fill="#718198" font-size="13">通话总时长</text><text x="500" y="208" text-anchor="middle" fill="#253754" font-size="18" font-weight="700">' + Math.round(total) + ' 分</text>'
        + data.gs.map((group, index) => '<rect x="' + (330 + index * 120) + '" y="330" width="12" height="12" rx="2" fill="' + colors[index] + '"/><text x="' + (350 + index * 120) + '" y="341" fill="#52637c" font-size="12">' + esc(group.g) + '</text>').join('');
    } else {
      const isSchedule = type === 'schedule';
      const rows = sdSort(data.on, isSchedule ? 'p' : 'c', isSchedule ? 'c' : 'p');
      const values = rows.map(row => isSchedule ? row.p : row.c / 60);
      const max = Math.max(1, ...values);
      const slot = chartWidth / Math.max(1, rows.length);
      const points = values.map((value, index) => (left + slot * (index + .5)) + ',' + (top + chartHeight - value / max * chartHeight));
      content += (isSchedule ? '上班全员排程量分布' : '上班全员通话时长分布') + '</text>' + axis;
      if (isSchedule) {
        content += values.map((value, index) => {
          const barHeight = Math.max(value ? 3 : 1, value / max * chartHeight);
          return '<rect x="' + (left + slot * index + Math.max(1, slot * .18)) + '" y="' + (top + chartHeight - barHeight) + '" width="' + Math.max(2, slot * .64) + '" height="' + barHeight + '" rx="2" fill="' + (value ? '#2f64b9' : '#cbd5e1') + '"/>';
        }).join('');
      } else {
        content += '<polyline points="' + points.join(' ') + '" fill="none" stroke="#2f8066" stroke-width="3"/>' + points.map(point => {
          const pair = point.split(',');
          return '<circle cx="' + pair[0] + '" cy="' + pair[1] + '" r="2.5" fill="#2f8066"/>';
        }).join('');
      }
      content += '<text x="' + left + '" y="' + (height - 18) + '" fill="#718198" font-size="12">共 ' + rows.length + ' 人在岗，按数值从高到低排列</text>';
    }

    host.style.position = 'relative';
    canvas.style.display = 'none';
    host.insertAdjacentHTML('beforeend', '<svg class="sd-chart-svg-fallback" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="none" aria-label="业绩图表" style="display:block;width:100%;height:100%;font-family:Microsoft YaHei, PingFang SC, sans-serif;background:#fff">' + content + '</svg>');
  }

  function drawSingleCanvasSafely(canvas) {
    if (isCanvasInCollapsedPanel(canvas)) return false;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 40 || rect.height <= 40) return false;

    const host = canvas.parentElement;
    if (host) {
      host.querySelectorAll('.sd-chart-svg-fallback').forEach(el => el.remove());
    }
    canvas.style.display = '';

    const data = sdCalc(sdF[canvas.dataset.panel]);
    try {
      switch (canvas.dataset.sdChart) {
        case 'bar':
          sdDrawBar(canvas, data);
          sdBindBarHover(canvas, data);
          break;
        case 'donut':
          sdDrawDonut(canvas, data);
          sdBindDonutHover(canvas, data);
          break;
        case 'schedule':
          sdDrawSchedule(canvas, data);
          sdBindScheduleHover(canvas, data);
          break;
        default:
          sdDrawCalls(canvas, data);
          sdBindCallsHover(canvas, data);
      }
    } catch (error) {
      console.error('业绩看板图表绘制失败：' + canvas.dataset.sdChart, error);
    }
    if (!canvasHasPaint(canvas)) {
      renderDashboardSvgFallback(canvas, data);
    }
    return true;
  }

  function drawDashboardChartsSafely(targetPanelId) {
    getDashboardCanvases(targetPanelId).forEach(canvas => {
      drawSingleCanvasSafely(canvas);
    });
  }

  function scheduleDashboardChartDraw(retryCount, targetPanelId) {
    window.cancelAnimationFrame(drawFrame);
    window.clearTimeout(retryTimer);
    drawFrame = window.requestAnimationFrame(() => {
      const canvases = getDashboardCanvases(targetPanelId).filter(canvas => !isCanvasInCollapsedPanel(canvas));
      const pendingCanvases = canvases.filter(canvas => {
        const rect = canvas.getBoundingClientRect();
        return rect.width <= 40 || rect.height <= 40;
      });

      drawDashboardChartsSafely(targetPanelId);

      if (pendingCanvases.length > 0 && (retryCount || 0) < 16) {
        retryTimer = window.setTimeout(() => scheduleDashboardChartDraw((retryCount || 0) + 1, targetPanelId), 60);
      }
    });
  }

  window.refreshSeatPerformanceCharts = function (panelId) {
    scheduleDashboardChartDraw(0, panelId);
  };

  // 统一所有后续渲染入口，确保先完成 DOM 可见性与尺寸计算，再画图。
  const renderDashboardBeforeChartRecovery = renderSeatPerformanceDashboard;
  renderSeatPerformanceDashboard = function () {
    const result = renderDashboardBeforeChartRecovery.apply(this, arguments);
    scheduleDashboardChartDraw(0);
    return result;
  };

  window.addEventListener('resize', () => scheduleDashboardChartDraw(0));
  window.addEventListener('pageshow', () => scheduleDashboardChartDraw(0));

  const page = document.getElementById('seatPerformanceDashboardPage');
  if (page && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => scheduleDashboardChartDraw(0));
    resizeObserver.observe(page);
  }

  scheduleDashboardChartDraw(0);
})();

/* 业务报告导出：所有登录用户均可导出当前页面已展示的明细数据。 */
function sdCsvCell(value){
  const text=String(value==null?'':value);
  return '"'+text.replace(/"/g,'""')+'"';
}
function sdDownloadCsv(filename,headers,rows){
  const content='\ufeff'+[headers].concat(rows).map(row=>row.map(sdCsvCell).join(',')).join('\r\n');
  const link=document.createElement('a');
  link.href=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8;'}));
  link.download=filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(link.href),0);
}
function sdPerformanceExportRows(panelId){
  return [panelId].flatMap(id=>{
    const filter=sdF[id],data=sdCalc(filter);
    const range=filter.s+' '+String(filter.sh).padStart(2,'0')+'点 ～ '+filter.e+' '+String(filter.eh).padStart(2,'0')+'点';
    return data.r.map(seat=>[
      '第'+id+'大点',range,seat.name,seat.code,seat.g,seat.p,seat.eff,
      seat.eff?(seat.p/seat.eff*100).toFixed(1)+'%':'—',sdDur(seat.c),seat.drive||0,seat.locked||0,seat.onDuty===false?'休息':'在岗'
    ]);
  });
}
function sdExportPerformanceReport(panelId){
  sdDownloadCsv('业绩晾晒报告_第'+panelId+'大点_员工明细.csv',['报表板块','筛选时间','员工','佳佳代码','小组','排程量（批）','目标排程量','完成度','通话时长','试驾量（批）','锁单量（台/单）','状态'],sdPerformanceExportRows(panelId));
}
function sdUnderfilledExportRows(panelId){
  const source=panelId===1?[[sdUnderF,'第一大点']]:[[sdUnderF2,'第二大点']];
  return source.flatMap(([filter,panel])=>{
    const data=sdUnderCalc(filter),range=sdUnderRange(filter);
    return data.involved.map(seat=>[
      panel,range,seat.name,seat.code,seat.g,seat.task,seat.under,seat.plan,seat.activation,sdDur(seat.call),'未满标'
    ]);
  });
}
function sdExportUnderfilledReport(panelId){
  sdDownloadCsv('留资未满报告_第'+panelId+'大点_员工明细.csv',['报表板块','筛选时间','员工','佳佳代码','小组','任务数','留资未满数','排程量（批）','激活量（批）','通话时长','状态'],sdUnderfilledExportRows(panelId));
}
window.sdExportPerformanceReport=sdExportPerformanceReport;
window.sdExportUnderfilledReport=sdExportUnderfilledReport;
const renderSeatPerformanceDashboardBeforeReportExport=renderSeatPerformanceDashboard;
renderSeatPerformanceDashboard=function(){
  renderSeatPerformanceDashboardBeforeReportExport();
  if(!document.getElementById('sd-report-export-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-report-export-css">#seatPerformanceDashboardPage .sd-report-tabs .sd-report-export{margin-left:auto;border:1px solid #2f64b9;background:#2f64b9;color:#fff}#seatPerformanceDashboardPage .sd-report-tabs .sd-report-export:hover{background:#24579f;color:#fff}@media(max-width:760px){#seatPerformanceDashboardPage .sd-report-tabs .sd-report-export{margin-left:0}}</style>');
};
renderSeatPerformanceDashboard();

function sdAttachReportExportButton(){
  if(typeof sdReportConfigOpen==='undefined'||sdReportConfigOpen||!['performance','underfilled'].includes(sdBusinessTab))return;
  const root=document.querySelector('#seatPerformanceDashboardPage .sd');
  if(!root)return;
  const addButton=(title,id,handler)=>{
    if(!title||title.querySelector('.sd-report-export'))return;
    const button=document.createElement('button');
    button.type='button';button.className='sd-report-export';button.textContent='导出明细 CSV';
    button.onclick=event=>{event.stopPropagation();handler(id);};
    const collapse=title.querySelector('.sd-major-panel-toggle-btn,.sd-under-panel-toggle-btn');
    if(collapse)title.insertBefore(button,collapse);else title.appendChild(button);
  };
  if(sdBusinessTab==='performance'){
    root.querySelectorAll('.sd-panel').forEach((panel,index)=>addButton(panel.querySelector('.major-title'),index+1,sdExportPerformanceReport));
  }else{
    root.querySelectorAll('.sd-under-panel').forEach((panel,index)=>addButton(panel.querySelector('.sd-under-title'),index+1,sdExportUnderfilledReport));
  }
  if(!document.getElementById('sd-report-panel-export-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-report-panel-export-css">#seatPerformanceDashboardPage .sd .major-title,#seatPerformanceDashboardPage .sd .sd-under-title{display:flex;align-items:center;gap:12px}#seatPerformanceDashboardPage .sd .sd-report-export{flex:0 0 auto;height:30px;margin-left:auto;padding:0 11px;border:1px solid rgba(255,255,255,.58);border-radius:6px;background:rgba(255,255,255,.12);color:#fff;font:700 12px "Microsoft YaHei","PingFang SC",sans-serif;cursor:pointer}#seatPerformanceDashboardPage .sd .sd-report-export:hover{border-color:#fff;background:rgba(255,255,255,.24)}@media(max-width:760px){#seatPerformanceDashboardPage .sd .sd-report-export{padding:0 8px;font-size:11px}}</style>');
}
/* 本文件有多层历史渲染覆盖；延迟至全部覆盖注册完成后再挂载导出入口。 */
setTimeout(()=>setTimeout(()=>{
  const renderSeatPerformanceDashboardFinal=renderSeatPerformanceDashboard;
  renderSeatPerformanceDashboard=function(){
    renderSeatPerformanceDashboardFinal();
    sdAttachReportExportButton();
  };
  renderSeatPerformanceDashboard();
},0),0);

/* 报表配置列表：映射与目标配置均按筛选结果分页，避免坐席增多后拉长页面。 */
(() => {
  const pageSize=10;
  const currentPage={mapping:1,target:1};
  const ensurePaginationStyle=()=>{
    if(document.getElementById('sd-config-pagination-css'))return;
    document.head.insertAdjacentHTML('beforeend','<style id="sd-config-pagination-css">#seatPerformanceDashboardPage .sd-config-pagination{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:14px;color:#64748b;font-size:12px}#seatPerformanceDashboardPage .sd-config-pagination .sd-page-summary{margin-right:auto}#seatPerformanceDashboardPage .sd-config-pagination button{min-width:30px;height:30px;padding:0 9px;border:1px solid #d6e0ec;border-radius:5px;background:#fff;color:#475569;font:500 12px "Microsoft YaHei",sans-serif;cursor:pointer}#seatPerformanceDashboardPage .sd-config-pagination button:hover:not(:disabled){border-color:#93b5e8;color:#2563eb;background:#f5f9ff}#seatPerformanceDashboardPage .sd-config-pagination button:disabled{cursor:not-allowed;color:#b1bdcb;background:#f8fafc}#seatPerformanceDashboardPage .sd-config-pagination .sd-page-current{min-width:74px;text-align:center;color:#334155;font-weight:600}@media(max-width:640px){#seatPerformanceDashboardPage .sd-config-pagination{flex-wrap:wrap;justify-content:center}#seatPerformanceDashboardPage .sd-config-pagination .sd-page-summary{width:100%;margin-right:0;text-align:center}}</style>');
  };
  const paginateMarkup=(markup,key,unit)=>{
    const wrapper=document.createElement('div');
    wrapper.innerHTML=markup;
    const body=wrapper.querySelector('.sd-map-table tbody');
    if(!body)return markup;
    const rows=[...body.rows],total=rows.length,pages=Math.max(1,Math.ceil(total/pageSize));
    currentPage[key]=Math.min(Math.max(1,currentPage[key]),pages);
    const start=(currentPage[key]-1)*pageSize,end=Math.min(start+pageSize,total);
    rows.forEach((row,index)=>{if(index<start||index>=end)row.remove();});
    const footer=wrapper.querySelector('.sd-config-footer');
    const footerSummary=footer?.querySelector('span');
    if(footerSummary)footerSummary.remove();
    footer?.querySelectorAll('span').forEach(item=>{if(item.textContent.includes('小组、状态与有效期变更将记录操作人、时间与变更前后内容'))item.remove();});
    if(footer)footer.style.justifyContent='flex-end';
    ensurePaginationStyle();
    const table=wrapper.querySelector('.sd-map-table');
    table.insertAdjacentHTML('afterend','<div class="sd-config-pagination"><span class="sd-page-summary">共 '+total+' '+unit+'，显示 '+(total?start+1:0)+'–'+end+'</span><button type="button" onclick="sdChangeConfigPage(\''+key+'\','+(currentPage[key]-1)+')" '+(currentPage[key]===1?'disabled':'')+'>上一页</button><span class="sd-page-current">第 '+currentPage[key]+' / '+pages+' 页</span><button type="button" onclick="sdChangeConfigPage(\''+key+'\','+(currentPage[key]+1)+')" '+(currentPage[key]===pages?'disabled':'')+'>下一页</button></div>');
    return wrapper.innerHTML;
  };
  window.sdChangeConfigPage=(key,page)=>{currentPage[key]=page;renderSdReportConfiguration();};
  const previousRenderMapping=sdRenderMapping;
  sdRenderMapping=()=>paginateMarkup(previousRenderMapping(),'mapping','个引用坐席');
  const previousRenderTargets=sdRenderTargets;
  sdRenderTargets=()=>paginateMarkup(previousRenderTargets(),'target','名已映射坐席');
  const previousApplyMappingFilter=sdApplyMappingFilter;
  sdApplyMappingFilter=()=>{currentPage.mapping=1;previousApplyMappingFilter();};
  const previousFilterUnmappedGroups=sdFilterUnmappedGroups;
  sdFilterUnmappedGroups=()=>{currentPage.mapping=1;previousFilterUnmappedGroups();};
  const previousApplyTargetFilter=sdApplyTargetFilter;
  sdApplyTargetFilter=()=>{currentPage.target=1;previousApplyTargetFilter();};
  const previousFilterUnconfiguredTargets=sdFilterUnconfiguredTargets;
  sdFilterUnconfiguredTargets=()=>{currentPage.target=1;previousFilterUnconfiguredTargets();};
})();

/* 员工维度报告：后端转化链路保持节点、箭头与比率各自独立，窄屏时横向查看。 */
(()=>{
  const applyConversionFlowLayout=()=>{
    if(document.getElementById('sd-employee-conversion-flow-css'))return;
    document.head.insertAdjacentHTML('beforeend','<style id="sd-employee-conversion-flow-css">#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel{gap:26px;padding:20px 28px 24px;overflow-x:auto;scrollbar-color:#c4d0e2 transparent;scrollbar-width:thin}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel-step{box-sizing:border-box;min-width:140px;flex:1 0 140px;padding-right:2px}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel-label{min-height:44px}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel-step>i{min-width:44px;height:12px}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel-step>em{right:-18px;bottom:auto;top:49px;display:grid;place-items:center;width:18px;height:18px;color:#8da0b7;font-size:20px;line-height:1}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-rate-row{grid-template-columns:repeat(6,minmax(148px,1fr));overflow-x:auto;scrollbar-color:#c4d0e2 transparent;scrollbar-width:thin}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-rate-row span{box-sizing:border-box;min-width:148px;padding:12px 14px;white-space:nowrap}@media(max-width:860px){#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel{padding-right:18px;padding-left:18px;gap:22px}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel-step{min-width:132px;flex-basis:132px}}</style>');
  };
  setTimeout(applyConversionFlowLayout,0);
})();

/* 员工明细中的休息坐席汇总，沿用报告内的提醒色并随筛选结果更新。 */
if(!document.getElementById('sd-rest-seat-summary-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-rest-seat-summary-css">#seatPerformanceDashboardPage .sd .sd-rest-note{margin:18px 0 0;padding:16px 18px;border:1px solid #ffd09a;border-left:6px solid #ff8a1f;border-radius:10px;background:#fff4e5;color:#a83d12;font-size:14px;font-weight:600;line-height:1.85;box-shadow:0 8px 18px rgba(204,110,34,.08)}#seatPerformanceDashboardPage .sd .sd-rest-note b{margin-right:6px;color:#a83d12;font-size:16px;font-weight:800}</style>');
renderSeatPerformanceDashboard();

/* 员工维度报告：作为坐席业务看板的第三个业务报告页签，复用当前报表数据与筛选交互。 */
let sdEmployeeDimensionF={s:sdDays[0],e:sdDays[6],group:'all',keyword:''};
function sdEmployeeDimensionData(){
  const f={s:sdEmployeeDimensionF.s,sh:0,e:sdEmployeeDimensionF.e,eh:23};
  const base=sdCalc(f);
  const keyword=sdEmployeeDimensionF.keyword.trim().toLowerCase();
  const rows=base.r.map((seat,index)=>{
    const task=Math.max(0,Math.round((seat.task||0)*1.35)+(index%3));
    const unallocated=task?index%3:0;
    const allocated=Math.max(0,task-unallocated);
    const processed=Math.min(allocated,Math.max(0,Math.round(allocated*.72)+(index%2)));
    const follow=Math.min(processed,Math.max(0,processed-(index%4===0?1:0)));
    const connected=seat.c>0?Math.max(1,Math.round((seat.c/150)+(index%3))):0;
    const intention=Math.max(0,Math.round(task*.34)+(index%2));
    const testLead=Math.max(0,Math.round((seat.drive||0)*.7));
    const scheduled=Math.max(0,seat.drive||0);
    const orders=Math.max(0,seat.locked||0);
    return {...seat,task,allocated,unallocated,processed,pending:Math.max(0,allocated-processed),follow,connected,intention,testLead,scheduled,orders,locked:seat.locked||0,sales:Math.max(0,Math.floor((seat.locked||0)*.6))};
  }).filter(row=>(sdEmployeeDimensionF.group==='all'||row.g===sdEmployeeDimensionF.group)&&(!keyword||[row.name,row.code,row.g].join(' ').toLowerCase().includes(keyword)));
  const total=rows.reduce((sum,row)=>({task:sum.task+row.task,allocated:sum.allocated+row.allocated,connected:sum.connected+row.connected,scheduled:sum.scheduled+row.scheduled,locked:sum.locked+row.locked}),{task:0,allocated:0,connected:0,scheduled:0,locked:0});
  return {rows,total,days:base.ds.length};
}
function sdEmployeeDimensionSelectGroup(){
  return typeof sdSeatGroupOptions==='function'?sdSeatGroupOptions(sdEmployeeDimensionF.group,true,false):'<option value="all">全部小组</option><option value="A组">A组</option><option value="B组">B组</option><option value="C组">C组</option>';
}
function sdApplyEmployeeDimensionFilter(){
  const start=document.getElementById('sdEmployeeStart'),end=document.getElementById('sdEmployeeEnd'),group=document.getElementById('sdEmployeeGroup'),keyword=document.getElementById('sdEmployeeKeyword');
  if(!start||!end||!group||!keyword)return;
  if(start.value>end.value){alert('结束日期不能早于开始日期');return;}
  sdEmployeeDimensionF={s:start.value,e:end.value,group:group.value,keyword:keyword.value};
  renderSeatPerformanceDashboard();
}
function renderSdEmployeeDimensionReport(){
  const root=document.querySelector('#seatPerformanceDashboardPage .sd');
  if(!root)return;
  const header=root.querySelector('header');
  if(header){
    header.querySelector('h1').textContent='员工维度报告';
    header.querySelector('p').innerHTML='按员工查看任务承接、跟进过程、客户分层与后端转化表现。支持按日期、小组及员工筛选；任务类指标按任务生成日期统计，后端转化指标为 <b>T+1</b> 数据。';
  }
  root.querySelectorAll('.sd-employee-report').forEach(node=>node.remove());
  const data=sdEmployeeDimensionData(),rows=data.rows;
  const rate=(a,b)=>b?(a/b*100).toFixed(1)+'%':'—';
  const ordered=[...rows].sort((a,b)=>b.task-a.task||b.scheduled-a.scheduled||a.name.localeCompare(b.name,'zh-CN'));
  const taskRows=ordered.map(row=>'<tr><td><b>'+row.name+'</b></td><td>'+row.g+'</td><td>'+row.task+'</td><td>'+row.allocated+'</td><td>'+row.unallocated+'</td><td>'+row.processed+'</td><td>'+row.pending+'</td><td>'+rate(row.follow,row.task)+'</td><td>'+row.connected+'</td><td>'+sdDur(row.c)+'</td><td>'+row.p+'</td></tr>').join('');
  const conversionRows=ordered.map(row=>'<tr><td><b>'+row.name+'</b></td><td>'+row.g+'</td><td>'+row.intention+'</td><td>'+rate(row.intention,row.task)+'</td><td>'+row.testLead+'</td><td>'+row.scheduled+'</td><td>'+row.drive+'</td><td>'+row.orders+'</td><td>'+row.locked+'</td><td>'+row.sales+'</td></tr>').join('');
  const empty='<tr><td colspan="11" class="sd-employee-empty">当前筛选条件下暂无员工数据</td></tr>';
  const section='<section class="sd-employee-report"><div class="sd-employee-filter"><label>开始日期 <select id="sdEmployeeStart">'+sdDays.map(day=>'<option value="'+day+'" '+(day===sdEmployeeDimensionF.s?'selected':'')+'>'+day+'</option>').join('')+'</select></label><label>结束日期 <select id="sdEmployeeEnd">'+sdDays.map(day=>'<option value="'+day+'" '+(day===sdEmployeeDimensionF.e?'selected':'')+'>'+day+'</option>').join('')+'</select></label><label>所属小组 <select id="sdEmployeeGroup">'+sdEmployeeDimensionSelectGroup()+'</select></label><label class="sd-employee-keyword">员工搜索 <input id="sdEmployeeKeyword" value="'+sdConfigEsc(sdEmployeeDimensionF.keyword)+'" placeholder="姓名或佳佳代码"></label><button type="button" onclick="sdApplyEmployeeDimensionFilter()">应用筛选</button><strong>当前：'+sdEmployeeDimensionF.s+' ～ '+sdEmployeeDimensionF.e+'（覆盖 '+data.days+' 天，'+rows.length+' 名员工）</strong></div><div class="sd-employee-note"><b>口径提示：</b>员工调组后，历史业绩归入当前最新有效小组；任务、过程指标按筛选日期联动更新，后端转化仅展示 T+1 已回传数据。</div><div class="sd-employee-kpis"><div><small>外呼任务量</small><b>'+data.total.task+' <i>条</i></b><span>已分配与待分配任务之和</span></div><div><small>已分配任务量</small><b>'+data.total.allocated+' <i>条</i></b><span>已进入员工承接范围</span></div><div><small>有效接通量</small><b>'+data.total.connected+' <i>次</i></b><span>按有效通话口径汇总</span></div><div><small>试驾量</small><b>'+data.total.scheduled+' <i>批</i></b><span>试驾线索或试驾排程下发</span></div><div><small>锁单量</small><b>'+data.total.locked+' <i>台/单</i></b><span>后端转化 T+1 数据</span></div></div><div class="sd-employee-box"><h3>一、任务与跟进过程</h3><p>任务类指标按任务生成日期统计；“当日跟进率”＝当日跟进任务量 ÷ 外呼任务量。</p><div class="sd-employee-table"><table><thead><tr><th>员工</th><th>小组</th><th>外呼任务</th><th>已分配</th><th>待分配</th><th>继续跟进已处理</th><th>继续跟进待处理</th><th>当日跟进率</th><th>有效接通</th><th>通话时长</th><th>排程量</th></tr></thead><tbody>'+(taskRows||empty)+'</tbody></table></div></div><div class="sd-employee-box"><h3>二、客户分层与后端转化 <span>T+1</span></h3><p>客户分层按任务生成日期统计；到店、试驾、订单、锁单与成交在后端数据回传后展示。</p><div class="sd-employee-table"><table><thead><tr><th>员工</th><th>小组</th><th>意向客户</th><th>意向占比</th><th>试驾线索下发</th><th>试驾排程</th><th>已试驾</th><th>订单</th><th>锁单</th><th>成交</th></tr></thead><tbody>'+(conversionRows||'<tr><td colspan="10" class="sd-employee-empty">当前筛选条件下暂无员工数据</td></tr>')+'</tbody></table></div></div><div class="sd-employee-formula"><b>数据对账：</b><span>外呼任务量 = 已分配任务量 + 待分配任务量</span><span>继续跟进已处理量 + 继续跟进待处理量 = 继续跟进任务量</span></div></section>';
  const nav=root.querySelector('.sd-report-tabs');
  if(nav)nav.insertAdjacentHTML('afterend',section);else root.insertAdjacentHTML('beforeend',section);
  if(!document.getElementById('sd-employee-dimension-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-employee-dimension-css">#seatPerformanceDashboardPage .sd .sd-employee-report{margin-top:18px;padding:22px 26px;border-radius:14px;background:#fff;box-shadow:0 2px 12px #0000000d}#seatPerformanceDashboardPage .sd .sd-employee-filter{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;border:1px solid #d7e4f7;border-radius:10px;background:linear-gradient(90deg,#f8fbff,#f4f8fd);font-size:13px;font-weight:700}#seatPerformanceDashboardPage .sd .sd-employee-filter label{display:flex;align-items:center;gap:7px;white-space:nowrap}#seatPerformanceDashboardPage .sd .sd-employee-filter select,#seatPerformanceDashboardPage .sd .sd-employee-filter input{height:32px;box-sizing:border-box;padding:0 9px;border:1px solid #c9d6ea;border-radius:6px;background:#fff;color:#43536b;font:13px "Microsoft YaHei"}#seatPerformanceDashboardPage .sd .sd-employee-filter input{width:150px}#seatPerformanceDashboardPage .sd .sd-employee-filter button{height:32px;padding:0 15px;border:0;border-radius:6px;background:#2f64b9;color:#fff;font:700 13px "Microsoft YaHei";cursor:pointer}#seatPerformanceDashboardPage .sd .sd-employee-filter strong{margin-left:auto;padding-left:13px;border-left:1px solid #d6e2f2;color:#315f9f;font-size:12px;white-space:nowrap}#seatPerformanceDashboardPage .sd .sd-employee-note{margin:14px 0;padding:11px 13px;border:1px solid #dbe8f8;border-radius:8px;background:#f7faff;color:#61728c;font-size:12px;line-height:1.65}#seatPerformanceDashboardPage .sd .sd-employee-note b{color:#315f9f}#seatPerformanceDashboardPage .sd .sd-employee-kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:14px 0 18px}#seatPerformanceDashboardPage .sd .sd-employee-kpis>div{min-height:104px;padding:15px;border:1px solid #e3eaf3;border-radius:10px;background:#fff;box-shadow:inset 0 3px 0 #315f9f}#seatPerformanceDashboardPage .sd .sd-employee-kpis small,#seatPerformanceDashboardPage .sd .sd-employee-kpis span{display:block;color:#7a899d;font-size:12px}#seatPerformanceDashboardPage .sd .sd-employee-kpis b{display:block;margin:7px 0;color:#263a57;font-size:25px}#seatPerformanceDashboardPage .sd .sd-employee-kpis i{font-size:13px;font-style:normal;color:#7b8aa1}#seatPerformanceDashboardPage .sd .sd-employee-box{margin:18px 0;border:1px solid #e3eaf3;border-radius:10px;overflow:hidden;background:#fff}#seatPerformanceDashboardPage .sd .sd-employee-box h3{margin:0;padding:14px 16px;border-bottom:1px solid #e7edf5;border-left:4px solid #2f64b9;background:#fbfcfe;color:#31415b;font-size:15px}#seatPerformanceDashboardPage .sd .sd-employee-box h3 span{margin-left:7px;color:#a26a16;font-size:11px}#seatPerformanceDashboardPage .sd .sd-employee-box>p{margin:0;padding:9px 16px;background:#fff;color:#7a899d;font-size:12px}#seatPerformanceDashboardPage .sd .sd-employee-table{overflow-x:auto}#seatPerformanceDashboardPage .sd .sd-employee-table table{min-width:1040px}#seatPerformanceDashboardPage .sd .sd-employee-table th{padding:10px 8px;background:#f2f6fc;color:#596b84}#seatPerformanceDashboardPage .sd .sd-employee-table td{padding:10px 8px;text-align:center;border-bottom:1px solid #eef2f6;color:#4d5f77}#seatPerformanceDashboardPage .sd .sd-employee-empty{padding:32px!important;color:#8794a7!important}#seatPerformanceDashboardPage .sd .sd-employee-formula{display:flex;gap:12px;flex-wrap:wrap;padding:11px 13px;border:1px dashed #cbd9ea;border-radius:8px;background:#fbfcfe;color:#65758b;font-size:12px}#seatPerformanceDashboardPage .sd .sd-employee-formula b{color:#315f9f}#seatPerformanceDashboardPage .sd .sd-employee-formula span{padding-left:12px;border-left:1px solid #dbe4ef}@media(max-width:1180px){#seatPerformanceDashboardPage .sd .sd-employee-kpis{grid-template-columns:repeat(3,1fr)}#seatPerformanceDashboardPage .sd .sd-employee-filter strong{margin-left:0;flex-basis:100%;border-left:0;padding-left:0}}@media(max-width:760px){#seatPerformanceDashboardPage .sd .sd-employee-report{padding:16px 14px}#seatPerformanceDashboardPage .sd .sd-employee-kpis{grid-template-columns:1fr}#seatPerformanceDashboardPage .sd .sd-employee-filter label,#seatPerformanceDashboardPage .sd .sd-employee-keyword{width:100%;justify-content:space-between}#seatPerformanceDashboardPage .sd .sd-employee-filter select,#seatPerformanceDashboardPage .sd .sd-employee-filter input{width:68%}#seatPerformanceDashboardPage .sd .sd-employee-filter button{width:100%}#seatPerformanceDashboardPage .sd .sd-employee-formula{flex-direction:column}#seatPerformanceDashboardPage .sd .sd-employee-formula span{padding-left:0;border-left:0}}</style>');
}
const renderSeatPerformanceDashboardBeforeEmployeeDimensionTab=renderSeatPerformanceDashboard;
renderSeatPerformanceDashboard=function(){
  renderSeatPerformanceDashboardBeforeEmployeeDimensionTab();
  if(sdReportConfigOpen)return;
  const root=document.querySelector('#seatPerformanceDashboardPage .sd');
  if(!root)return;
  const nav=root.querySelector('.sd-report-tabs');
  if(nav)nav.innerHTML='<button type="button" class="'+(sdBusinessTab==='performance'?'active':'')+'" onclick="switchSdBusinessTab(\'performance\')">业绩晾晒报告</button><button type="button" class="'+(sdBusinessTab==='underfilled'?'active':'')+'" onclick="switchSdBusinessTab(\'underfilled\')">留资未满报告</button><button type="button" class="'+(sdBusinessTab==='employee'?'active':'')+'" onclick="switchSdBusinessTab(\'employee\')">员工维度报告</button><button type="button" class="sd-report-config-trigger" onclick="openSdReportConfiguration()">⚙ 报表配置</button>';
  if(sdBusinessTab==='employee')renderSdEmployeeDimensionReport();
};
window.sdApplyEmployeeDimensionFilter=sdApplyEmployeeDimensionFilter;
renderSeatPerformanceDashboard();

/* 兼容历史渲染层：在脚本全部加载后再挂载第三个页签。 */
setTimeout(()=>{
  const renderSdUnderReportWithConsistentAverages=renderSdUnderReport;
  renderSdUnderReport=function(){
    renderSdUnderReportWithConsistentAverages();
    const root=document.querySelector('#seatPerformanceDashboardPage .sd');
    if(!root)return;
    root.querySelectorAll('.sd-under-panel').forEach(panel=>{
      const averages=panel.querySelector('.sd-under-averages');
      if(!averages||averages.children.length>=6)return;
      const data=panel.classList.contains('sd-under-panel-2')?sdUnderCalc(sdUnderF2):sdUnderCalc(sdUnderF);
      const total=data.total,people=Math.max(1,total.people);
      averages.insertAdjacentHTML('beforeend','<div><small>人均试驾量</small><b>'+(total.drive/people).toFixed(1)+' 批</b><span>按参与员工计算</span></div><div><small>人均锁单量</small><b>'+(total.locked/people).toFixed(1)+' 台/单</b><span>按参与员工计算</span></div>');
    });
    if(!document.getElementById('sd-under-average-card-outcome-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-under-average-card-outcome-css">#seatPerformanceDashboardPage .sd-under-averages>div:nth-child(5){border-left-color:#4e718d}#seatPerformanceDashboardPage .sd-under-averages>div:nth-child(6){border-left-color:#b06f32}</style>');
  };
  const renderSeatPerformanceDashboardWithEmployeeDimensionTab=renderSeatPerformanceDashboard;
  renderSeatPerformanceDashboard=function(){
    renderSeatPerformanceDashboardWithEmployeeDimensionTab();
    if(sdReportConfigOpen)return;
    const root=document.querySelector('#seatPerformanceDashboardPage .sd');
    if(!root)return;
    const nav=root.querySelector('.sd-report-tabs');
    if(nav)nav.innerHTML='<button type="button" class="'+(sdBusinessTab==='performance'?'active':'')+'" onclick="switchSdBusinessTab(\'performance\')">业绩晾晒报告</button><button type="button" class="'+(sdBusinessTab==='underfilled'?'active':'')+'" onclick="switchSdBusinessTab(\'underfilled\')">留资未满报告</button><button type="button" class="'+(sdBusinessTab==='employee'?'active':'')+'" onclick="switchSdBusinessTab(\'employee\')">员工维度报告</button><button type="button" class="sd-report-config-trigger" onclick="openSdReportConfiguration()">⚙ 报表配置</button>';
    if(sdBusinessTab==='employee')renderSdEmployeeDimensionReport();
  };
  renderSeatPerformanceDashboard();
},0);

/* 所属小组统一由“数据字典管理”维护，报表配置只引用启用项。 */
(function sdRegisterSeatGroupDictionary(){
  if(typeof DICTIONARY_TYPES==='undefined'||typeof DICTIONARY_ITEMS==='undefined')return;
  if(!DICTIONARY_TYPES.some(item=>item.code==='SEAT_GROUP')){
    DICTIONARY_TYPES.push({code:'SEAT_GROUP',name:'坐席所属小组',scope:'报表配置',description:'坐席与小组映射、业绩目标配置的所属小组下拉项共用',count:3});
  }
  if(!Array.isArray(DICTIONARY_ITEMS.SEAT_GROUP)){
    DICTIONARY_ITEMS.SEAT_GROUP=[
      {code:'SEAT_GROUP_A',name:'A组',order:10,status:'启用',refs:2,description:'坐席业绩报表所属小组'},
      {code:'SEAT_GROUP_B',name:'B组',order:20,status:'启用',refs:2,description:'坐席业绩报表所属小组'},
      {code:'SEAT_GROUP_C',name:'C组',order:30,status:'启用',refs:2,description:'坐席业绩报表所属小组'}
    ];
  }
})();
function sdSeatGroupDictionaryItems(includeDisabled){
  if(typeof DICTIONARY_ITEMS==='undefined'||!Array.isArray(DICTIONARY_ITEMS.SEAT_GROUP))return [];
  return DICTIONARY_ITEMS.SEAT_GROUP.filter(item=>includeDisabled||item.status==='启用').sort((a,b)=>(a.order||0)-(b.order||0));
}
function sdSeatGroupOptions(selected,withAll,withUnmapped){
  const selectedValue=String(selected||'');
  const enabled=sdSeatGroupDictionaryItems(false);
  const selectedItem=sdSeatGroupDictionaryItems(true).find(item=>item.name===selectedValue);
  const items=selectedItem&&selectedItem.status!=='启用'&&!enabled.some(item=>item.name===selectedValue)?enabled.concat([selectedItem]):enabled;
  let html=withAll?'<option value="all" '+(selectedValue==='all'?'selected':'')+'>全部小组</option>':'';
  html+=items.map(item=>'<option value="'+sdConfigEsc(item.name)+'" '+(item.name===selectedValue?'selected':'')+'>'+sdConfigEsc(item.name)+(item.status!=='启用'?'（已停用）':'')+'</option>').join('');
  if(withUnmapped)html+='<option value="未映射" '+(selectedValue==='未映射'?'selected':'')+'>未映射小组</option>';
  return html;
}
function sdApplySeatGroupDictionaryOptions(){
  const mapping=document.getElementById('sdMapGroup');
  if(mapping){mapping.innerHTML=sdSeatGroupOptions(sdMappingGroup,true,true);mapping.onchange=sdApplyMappingFilter;}
  const target=document.getElementById('sdTargetGroup');
  if(target){target.innerHTML=sdSeatGroupOptions(sdTargetGroup,true,false);target.onchange=sdApplyTargetFilter;}
  const stats=[...document.querySelectorAll('#seatPerformanceDashboardPage .sd-config-stat')];
  const groupStat=stats.find(item=>item.querySelector('small')?.textContent.trim()==='当前覆盖小组');
  if(groupStat){const count=new Set(sdMappings.filter(row=>row.group&&row.group!=='未映射').map(row=>row.group)).size;const value=groupStat.querySelector('b');if(value)value.textContent=count+' 个';}
}
const renderSdReportConfigurationWithSeatGroupDictionary=renderSdReportConfiguration;
renderSdReportConfiguration=function(){
  renderSdReportConfigurationWithSeatGroupDictionary();
  sdApplySeatGroupDictionaryOptions();
};
const sdOpenMappingModalWithSeatGroupDictionary=sdOpenMappingModal;
sdOpenMappingModal=function(id){
  sdOpenMappingModalWithSeatGroupDictionary(id);
  const select=document.getElementById('sdEditGroup');
  if(!select)return;
  const current=select.value;
  select.innerHTML=sdSeatGroupOptions(current,false,false);
};

/* 导入模板和校验与字典项同步，避免出现页面与批量维护口径不一致。 */
const sdConfigImportSchemaWithSeatGroupDictionary=sdConfigImportSchema;
sdConfigImportSchema=function(type){
  const schema=sdConfigImportSchemaWithSeatGroupDictionary(type);
  if(schema.type==='mapping'){
    const names=sdSeatGroupDictionaryItems(false).map(item=>item.name).join('、')||'请先在数据字典维护';
    schema.guide=schema.guide.map(row=>row[0]==='所属小组'?[row[0],row[1],'填写“数据字典管理 - 坐席所属小组”中启用的字典项。',names]:row);
  }
  return schema;
};
const sdValidateConfigImportRowsWithSeatGroupDictionary=sdValidateConfigImportRows;
sdValidateConfigImportRows=function(rows){
  const result=sdValidateConfigImportRowsWithSeatGroupDictionary(rows);
  if(sdConfigImportState.type!=='mapping')return result;
  const validGroups=sdSeatGroupDictionaryItems(false).map(item=>item.name);
  return result.map(row=>{
    row.errors=(row.errors||[]).filter(error=>error!=='所属小组仅支持 A组、B组、C组');
    const group=String(row.data['所属小组']||'').trim();
    if(group&&!validGroups.includes(group))row.errors.push(validGroups.length?'所属小组必须为“坐席所属小组”字典中的启用项':'请先在数据字典管理中维护并启用“坐席所属小组”');
    row.valid=!row.errors.length;
    return row;
  });
};
const sdDownloadConfigImportTemplateWithSeatGroupDictionary=sdDownloadConfigImportTemplate;
sdDownloadConfigImportTemplate=function(){
  const mapping=sdMappings.find(row=>sdSeatGroupDictionaryItems(false).some(item=>item.name===row.group))||sdMappings[0];
  if(mapping&&sdConfigImportState.type==='mapping'){
    const schema=sdConfigImportSchema('mapping');
    sdConfigDownload(`${schema.shortTitle}导入模板.xls`,schema.columns,[[mapping.account,mapping.group,mapping.status,mapping.start,mapping.end==='长期'?'长期有效':mapping.end]],`${schema.shortTitle}导入模板已下载`);
    return;
  }
  sdDownloadConfigImportTemplateWithSeatGroupDictionary();
};
window.sdOpenMappingModal=sdOpenMappingModal;
window.sdDownloadConfigImportTemplate=sdDownloadConfigImportTemplate;
if(typeof sdReportConfigOpen!=='undefined'&&sdReportConfigOpen)renderSdReportConfiguration();

/* 报表配置：沿用线索分配规则的导入/导出维护方式。 */
let sdConfigImportState={type:'mapping',step:1,fileName:'',validatedRows:[],result:{success:0,failed:0}};

function sdConfigImportSchema(type){
  const mapping=type==='mapping';
  return mapping?{
    type:'mapping',title:'导入坐席与小组映射',shortTitle:'坐席与小组映射',
    columns:['坐席帐号','所属小组','状态','生效日期','有效期'],
    required:['坐席帐号','所属小组','生效日期','有效期'],
    guide:[
      ['坐席帐号','必填','引用 DCC「坐席管理」中的坐席帐号，用于匹配已有坐席；不会新增或修改坐席主数据。','RiChan13'],
      ['所属小组','必填','填写当前归属的小组。','A组、B组、C组'],
      ['状态','选填','不填写时保持当前状态。','启用、停用'],
      ['生效日期','必填','该坐席归属小组开始生效的日期。','2026-09-01'],
      ['有效期','必填','填写“长期有效”，或填写指定失效日期。','长期有效、2026-12-31']
    ]
  }:{
    type:'target',title:'导入业绩目标配置',shortTitle:'业绩目标配置',
    columns:['坐席帐号','周排程量（批）','月度目标（批）','状态','生效日期','有效期'],
    required:['坐席帐号','周排程量（批）','月度目标（批）','生效日期','有效期'],
    guide:[
      ['坐席帐号','必填','引用 DCC「坐席管理」中的坐席帐号，用于匹配已有坐席。','RiChan13'],
      ['周排程量（批）','必填','仅支持输入正整数。','110'],
      ['月度目标（批）','必填','仅支持输入正整数。','440'],
      ['状态','选填','不填写时默认启用。','启用、停用'],
      ['生效日期','必填','该目标开始参与报表计算的日期。','2026-09-01'],
      ['有效期','必填','填写“长期有效”，或填写指定失效日期。','长期有效、2026-12-31']
    ]
  };
}

function sdConfigEsc(value){
  return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function sdConfigToast(message,success){
  if(typeof showToast==='function') showToast(message,success);
  else window.alert(message);
}
function sdConfigDate(value){
  const text=String(value||'').trim().replace(/\//g,'-');
  return /^\d{4}-\d{2}-\d{2}$/.test(text)?text:'';
}
function sdConfigPeriod(value){
  const text=String(value||'').trim();
  if(/^(长期|长期有效|永久|无期限)$/.test(text)) return '长期';
  return sdConfigDate(text);
}
function sdConfigDownload(filename,columns,rows,message){
  const content='\ufeff'+[columns].concat(rows).map(row=>row.map(value=>String(value==null?'':value).replace(/[\t\r\n]/g,' ')).join('\t')).join('\n');
  const link=document.createElement('a');
  link.href=URL.createObjectURL(new Blob([content],{type:'application/vnd.ms-excel;charset=utf-8'}));
  link.download=filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(()=>URL.revokeObjectURL(link.href),0);
  sdConfigToast(message,true);
}
function sdDownloadConfigImportTemplate(){
  const schema=sdConfigImportSchema(sdConfigImportState.type);
  const mapping=sdMappings[0]||{};
  const target=(sdTargets||[]).find(item=>item.seatId===mapping.id)||{};
  const sample=schema.type==='mapping'
    ? [mapping.account||'RiChan13',mapping.group||'A组',mapping.status||'启用',mapping.start||'2026-09-01',mapping.end==='长期'?'长期有效':(mapping.end||'长期有效')]
    : [mapping.account||'RiChan13',target.weekly||110,target.monthly||440,target.status||'启用',target.start||'2026-09-01',target.end==='长期'?'长期有效':(target.end||'长期有效')];
  sdConfigDownload(`${schema.shortTitle}导入模板.xls`,schema.columns,[sample],`${schema.shortTitle}导入模板已下载`);
}
function sdExportConfigData(type){
  const schema=sdConfigImportSchema(type);
  const rows=type==='mapping'?sdMappingRows().map(row=>[
    row.account,row.group==='未映射'?'':row.group,row.status,row.start||'',row.end==='长期'?'长期有效':(row.end||'')
  ]):sdTargetRows().map(target=>{
    const row=sdTargetSeat(target)||{};
    return [row.account||'',target.missing?'':target.weekly||'',target.missing?'':target.monthly||'',target.missing?'':target.status||'',target.missing?'':target.start||'',target.missing?'':(target.end==='长期'?'长期有效':(target.end||''))];
  });
  sdConfigDownload(`${schema.shortTitle}导出数据.xls`,schema.columns,rows,`已导出当前筛选的 ${rows.length} 条${schema.shortTitle}数据`);
}

function sdOpenConfigImportWizard(type){
  sdConfigImportState={type:type==='target'?'target':'mapping',step:1,fileName:'',validatedRows:[],result:{success:0,failed:0}};
  const existing=document.getElementById('sdConfigImportModal');
  if(existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend','<div class="modal-overlay show" id="sdConfigImportModal"><div class="modal assignment-import-modal"><div class="modal-header"><div class="modal-title" id="sdConfigImportTitle"></div><button class="modal-close" type="button" onclick="sdCloseConfigImportWizard()">×</button></div><div class="modal-body" id="sdConfigImportBody"></div><div class="modal-footer" id="sdConfigImportFooter"></div></div></div>');
  sdRenderConfigImportWizard();
}
function sdCloseConfigImportWizard(){
  const modal=document.getElementById('sdConfigImportModal');
  if(modal) modal.remove();
  if(typeof renderSdReportConfiguration==='function') renderSdReportConfiguration();
}
function sdRenderConfigImportWizard(){
  const schema=sdConfigImportSchema(sdConfigImportState.type);
  const body=document.getElementById('sdConfigImportBody'),footer=document.getElementById('sdConfigImportFooter');
  if(!body||!footer) return;
  document.getElementById('sdConfigImportTitle').textContent=schema.title;
  const step=sdConfigImportState.step;
  const steps=['上传文件','数据预览','导入完成'];
  const renderedSteps='<div class="assignment-import-steps">'+steps.map((item,index)=>'<div class="assignment-import-step '+(index+1===step?'active':index+1<step?'done':'')+'"><div class="assignment-import-step-index">Step'+(index+1)+'</div><div class="assignment-import-step-title">'+item+'</div></div>').join('')+'</div>';
  if(step===1){
    body.innerHTML=renderedSteps+'<div class="assignment-import-panel"><div class="assignment-import-tip">导入仅更新本页可维护字段。坐席名称、坐席帐号及 VCP 帐号均引用「坐席管理」数据，不会被新增或覆盖。</div><div class="action-btns"><button class="btn-secondary" type="button" onclick="sdDownloadConfigImportTemplate()">下载模板</button></div><label class="assignment-import-upload"><input type="file" accept=".xls,.csv,.tsv,.txt" onchange="sdHandleConfigImportFile(this.files&&this.files[0])"><div><strong>上传导入文件</strong><span>支持使用模板导出的 .xls 文件，也兼容 CSV/TSV 文本文件</span></div></label><div class="assignment-import-file">'+(sdConfigImportState.fileName?'已选择：'+sdConfigEsc(sdConfigImportState.fileName):'')+'</div></div>';
    footer.innerHTML='<button class="btn-cancel" type="button" onclick="sdCloseConfigImportWizard()">取消</button><button class="btn-save" type="button" '+(sdConfigImportState.validatedRows.length?'':'disabled')+' onclick="sdGoConfigImportPreview()">下一步</button>';
    return;
  }
  if(step===2){
    const rows=sdConfigImportState.validatedRows,pass=rows.filter(row=>row.valid).length;
    body.innerHTML=renderedSteps+'<div class="assignment-import-panel"><div class="assignment-import-summary"><div class="assignment-import-stat"><div class="assignment-import-stat-label">解析总数</div><div class="assignment-import-stat-value">'+rows.length+'</div></div><div class="assignment-import-stat"><div class="assignment-import-stat-label">校验通过</div><div class="assignment-import-stat-value">'+pass+'</div></div><div class="assignment-import-stat"><div class="assignment-import-stat-label">校验失败</div><div class="assignment-import-stat-value">'+(rows.length-pass)+'</div></div></div><div class="assignment-import-preview"><table class="data-table"><thead><tr><th>行号</th>'+schema.columns.map(item=>'<th>'+item+'</th>').join('')+'<th>校验结果</th></tr></thead><tbody>'+(rows.length?rows.map(row=>'<tr><td>'+row.rowNo+'</td>'+schema.columns.map(column=>'<td>'+sdConfigEsc(row.data[column]||'—')+'</td>').join('')+'<td>'+(row.valid?'<span class="assignment-import-pass">通过</span>':'<div class="assignment-import-error">'+row.errors.map(sdConfigEsc).join('<br>')+'</div>')+'</td></tr>').join(''):'<tr><td colspan="'+(schema.columns.length+2)+'"><div class="empty-state">暂无可预览数据</div></td></tr>')+'</tbody></table></div></div>';
    footer.innerHTML='<button class="btn-cancel" type="button" onclick="sdBackConfigImportUpload()">上一步</button><button class="btn-save" type="button" '+(pass?'':'disabled')+' onclick="sdConfirmConfigImport()">确认导入</button>';
    return;
  }
  const result=sdConfigImportState.result;
  body.innerHTML=renderedSteps+'<div class="assignment-import-complete"><div class="assignment-import-complete-title">导入完成</div><div class="assignment-import-complete-desc">成功 '+result.success+' 条，失败 '+result.failed+' 条；成功数据已写入当前'+schema.shortTitle+'。</div><div class="assignment-import-summary"><div class="assignment-import-stat"><div class="assignment-import-stat-label">成功</div><div class="assignment-import-stat-value">'+result.success+'</div></div><div class="assignment-import-stat"><div class="assignment-import-stat-label">失败</div><div class="assignment-import-stat-value">'+result.failed+'</div></div></div></div>';
  footer.innerHTML='<button class="btn-save" type="button" onclick="sdCloseConfigImportWizard()">完成</button>';
}
function sdParseConfigImportRows(text){
  const schema=sdConfigImportSchema(sdConfigImportState.type);
  const lines=String(text||'').replace(/\r/g,'').split('\n').filter(line=>line.trim());
  if(!lines.length) return [];
  const delimiter=lines.some(line=>line.includes('\t'))?'\t':',';
  const normalize=value=>String(value||'').replace(/^\ufeff/,'').replace(/\*/g,'').replace(/\s/g,'').trim();
  const columns=schema.columns.map(normalize);
  const headerIndex=lines.findIndex(line=>{
    const head=line.split(delimiter).map(normalize);
    return columns.every(column=>head.includes(column));
  });
  if(headerIndex<0) return [];
  const header=lines[headerIndex].split(delimiter).map(normalize);
  return lines.slice(headerIndex+1).map((line,index)=>{
    const cells=line.split(delimiter).map(cell=>cell.trim());
    const data={}; schema.columns.forEach((column,columnIndex)=>data[column]=cells[header.indexOf(columns[columnIndex])]||'');
    return {rowNo:headerIndex+index+2,data};
  }).filter(row=>Object.values(row.data).some(Boolean));
}
function sdValidateConfigImportRows(rows){
  const schema=sdConfigImportSchema(sdConfigImportState.type);
  return rows.map(row=>{
    const data=row.data,errors=[];
    schema.required.forEach(field=>{if(!String(data[field]||'').trim()) errors.push(field+'为必填项');});
    const seat=(sdMappings||[]).find(item=>String(item.account).trim()===String(data['坐席帐号']||'').trim());
    if(data['坐席帐号']&&!seat) errors.push('未找到对应的坐席帐号');
    const status=data['状态']?String(data['状态']).trim():'';
    if(status&&!['启用','停用'].includes(status)) errors.push('状态仅支持“启用”或“停用”');
    const start=sdConfigDate(data['生效日期']);
    if(data['生效日期']&&!start) errors.push('生效日期格式应为 YYYY-MM-DD');
    const end=sdConfigPeriod(data['有效期']);
    if(data['有效期']&&!end) errors.push('有效期应为“长期有效”或 YYYY-MM-DD');
    if(start&&end&&end!=='长期'&&end<start) errors.push('指定失效日期不能早于生效日期');
    if(schema.type==='mapping'){
      if(data['所属小组']&&!['A组','B组','C组'].includes(String(data['所属小组']).trim())) errors.push('所属小组仅支持 A组、B组、C组');
    }else{
      if(seat&&seat.group==='未映射') errors.push('该坐席尚未关联小组，不能配置目标');
      ['周排程量（批）','月度目标（批）'].forEach(field=>{if(data[field]&&!/^[1-9]\d*$/.test(String(data[field]).trim())) errors.push(field+'仅支持正整数');});
    }
    return Object.assign(row,{seat,start,end,status,valid:!errors.length,errors});
  });
}
function sdHandleConfigImportFile(file){
  if(!file) return;
  sdConfigImportState.fileName=file.name;
  const reader=new FileReader();
  reader.onload=event=>{
    sdConfigImportState.validatedRows=sdValidateConfigImportRows(sdParseConfigImportRows(event.target.result));
    sdConfigToast(sdConfigImportState.validatedRows.length?'已解析 '+sdConfigImportState.validatedRows.length+' 条数据':'未解析到可导入的数据行，请使用下载模板填写',!!sdConfigImportState.validatedRows.length);
    sdRenderConfigImportWizard();
  };
  reader.onerror=()=>sdConfigToast('文件读取失败，请重新上传',false);
  reader.readAsText(file,'utf-8');
}
function sdGoConfigImportPreview(){sdConfigImportState.step=2;sdRenderConfigImportWizard();}
function sdBackConfigImportUpload(){sdConfigImportState.step=1;sdRenderConfigImportWizard();}
function sdConfirmConfigImport(){
  const validRows=sdConfigImportState.validatedRows.filter(row=>row.valid),schema=sdConfigImportSchema(sdConfigImportState.type);
  validRows.forEach(item=>{
    const updated='批量导入 · 2026-09-11 10:00';
    if(schema.type==='mapping') Object.assign(item.seat,{group:String(item.data['所属小组']).trim(),status:item.status||item.seat.status,start:item.start,end:item.end,updated});
    else {
      let target=(sdTargets||[]).find(row=>row.seatId===item.seat.id);
      const values={weekly:Number(item.data['周排程量（批）']),monthly:Number(item.data['月度目标（批）']),status:item.status||'启用',start:item.start,end:item.end,updated};
      if(target) Object.assign(target,values);
      else {const nextId=Math.max(0,...(sdTargets||[]).map(row=>Number(row.id)||0))+1;sdTargets.push(Object.assign({id:nextId,seatId:item.seat.id},values));}
    }
  });
  sdConfigImportState.result={success:validRows.length,failed:sdConfigImportState.validatedRows.length-validRows.length};
  sdConfigImportState.step=3;sdRenderConfigImportWizard();
}

/* 原页面保留自动筛选与刷新，新增导入、导出并放在刷新操作前。 */
const sdNormalizeConfigToolbarWithDataTransfer=sdNormalizeConfigToolbar;
sdNormalizeConfigToolbar=function(){
  sdNormalizeConfigToolbarWithDataTransfer();
  const toolbar=document.querySelector('#seatPerformanceDashboardPage .sd-config-toolbar');
  if(!toolbar||toolbar.querySelector('.sd-config-import')) return;
  const type=sdReportConfigTab==='target'?'target':'mapping';
  const actions='<button class="sd-btn sd-config-import" type="button" onclick="sdOpenConfigImportWizard(\''+type+'\')">导入数据</button><button class="sd-btn sd-config-export" type="button" onclick="sdExportConfigData(\''+type+'\')">导出数据</button>';
  const refresh=toolbar.querySelector('.sd-list-refresh');
  if(refresh) refresh.insertAdjacentHTML('beforebegin',actions); else toolbar.insertAdjacentHTML('beforeend',actions);
};
window.sdOpenConfigImportWizard=sdOpenConfigImportWizard;
window.sdCloseConfigImportWizard=sdCloseConfigImportWizard;
window.sdDownloadConfigImportTemplate=sdDownloadConfigImportTemplate;
window.sdHandleConfigImportFile=sdHandleConfigImportFile;
window.sdGoConfigImportPreview=sdGoConfigImportPreview;
window.sdBackConfigImportUpload=sdBackConfigImportUpload;
window.sdConfirmConfigImport=sdConfirmConfigImport;
window.sdExportConfigData=sdExportConfigData;
if(typeof sdReportConfigOpen!=='undefined'&&sdReportConfigOpen) renderSdReportConfiguration();

/*
 * 报表配置与业务数据联动（2026-09）：
 * - 坐席以“当前最新有效映射”为准，调组后历史数据一并归入最新小组；
 * - 目标按筛选日期逐日校验，不以模拟默认值替代缺失配置；
 * - 本地模拟坐席作为“坐席管理”引用数据补齐，便于完整演示配置驱动报表。
 */
const sdConfigReportDate='2026-09-11';
let sdMappingQualityFilter=false;

function sdRuntimeIsActive(row,date=sdConfigReportDate){
  return !!row&&row.status==='启用'&&row.group!=='未映射'&&row.start&&row.start!=='—'&&row.start<=date&&(row.end==='长期'||(row.end&&row.end>=date));
}
function sdRuntimeLatest(items){
  return [...items].sort((a,b)=>String(b.start||'').localeCompare(String(a.start||''))||String(b.updated||'').localeCompare(String(a.updated||''))||b.id-a.id)[0]||null;
}
function sdRuntimeMappingForSeat(seat){
  const matches=sdMappings.filter(row=>row.name===seat.name||row.account===seat.code);
  return sdRuntimeLatest(matches.filter(row=>sdRuntimeIsActive(row)));
}
function sdRuntimeTargetForDay(mappingId,day){
  return sdRuntimeLatest(sdTargets.filter(row=>row.seatId===mappingId&&row.status==='启用'&&row.start&&row.start<=day&&(row.end==='长期'||row.end>=day)));
}
function sdRuntimeDailyTarget(seat,target){
  const weekly=Number(target?.weekly);
  const monthly=Number(target?.monthly);
  const base=Number.isFinite(weekly)&&weekly>0?weekly/Math.max(1,Number(seat.wd)||5):(Number.isFinite(monthly)&&monthly>0?monthly/30:NaN);
  return Number.isFinite(base)&&base>0?Math.ceil(base*2)/2:null;
}
function sdEnsureReportConfigurationSource(){
  sdN.forEach((seat,index)=>{
    if(sdMappings.some(row=>row.name===seat.name||row.account===seat.code))return;
    const id=Math.max(0,...sdMappings.map(row=>row.id))+1;
    sdMappings.push({id,name:seat.name,account:seat.code,vcp:'—',group:seat.g,start:'2026-09-01',end:'长期',status:'启用',updated:'系统引用 · 初始同步'});
    // 预置的“坐席管理”样例目标用于完整演示；真实缺失目标仍会被标记为未配置。
    if(index!==0&&index!==1){
      sdTargets.push({id:Math.max(0,...sdTargets.map(row=>row.id))+1,seatId:id,weekly:Math.max(1,seat.w*4),monthly:Math.max(1,seat.w*16),start:'2026-09-01',end:'长期',status:'启用',updated:'系统引用 · 初始同步'});
    }
  });
}
sdEnsureReportConfigurationSource();

const sdCalcBeforeConfigurationLinkage=sdCalc;
sdCalc=function(filter){
  const raw=sdCalcBeforeConfigurationLinkage(filter);
  const source=raw.r;
  const excluded=[];
  const rows=[];
  source.forEach(seat=>{
    const mapping=sdRuntimeMappingForSeat(seat);
    if(!mapping){excluded.push(seat);return;}
    const row={...seat,g:mapping.group,mappingId:mapping.id,mapping:mapping};
    const dailyTargets=raw.ds.map(day=>sdRuntimeDailyTarget(row,sdRuntimeTargetForDay(mapping.id,day)));
    row.targetConfigured=dailyTargets.length>0&&dailyTargets.every(value=>value!==null);
    row.eff=row.targetConfigured?dailyTargets.reduce((sum,value)=>sum+value,0):null;
    row.cp=row.targetConfigured&&row.eff>0?row.p/row.eff*100:null;
    rows.push(row);
  });
  const groups=sdG.map(g=>{
    const members=rows.filter(row=>row.g===g);
    const dailyGroupTargets=raw.ds.map(day=>{
      const monthlyTargets=members.map(row=>Number(sdRuntimeTargetForDay(row.mappingId,day)?.monthly));
      if(!monthlyTargets.length||monthlyTargets.some(value=>!Number.isFinite(value)||value<=0))return null;
      return Math.ceil((monthlyTargets.reduce((sum,value)=>sum+value,0)/30)*2)/2;
    });
    const targetConfigured=members.length>0&&dailyGroupTargets.every(value=>value!==null);
    const group={g,a:members,p:members.reduce((sum,row)=>sum+row.p,0),c:members.reduce((sum,row)=>sum+row.c,0),drive:members.reduce((sum,row)=>sum+row.drive,0),locked:members.reduce((sum,row)=>sum+row.locked,0),activeCount:members.filter(row=>row.onDuty).length};
    group.targetConfigured=targetConfigured;
    group.t=targetConfigured?dailyGroupTargets.reduce((sum,value)=>sum+value,0):null;
    group.cp=targetConfigured&&group.t>0?group.p/group.t*100:null;
    return group;
  });
  const unmappedRecordCount=excluded.reduce((sum,row)=>sum+Math.max(0,row.task||0,row.p||0,row.drive||0,row.locked||0),0);
  const targetMissing=rows.filter(row=>!row.targetConfigured);
  return {...raw,r:rows,gs:groups,on:rows.filter(row=>row.onDuty),off:rows.filter(row=>!row.onDuty),quality:{unmappedSeats:excluded,unmappedRecordCount,targetMissingSeats:targetMissing}};
};

const sdUnderCalcBeforeConfigurationLinkage=sdUnderCalc;
sdUnderCalc=function(filter){
  const raw=sdUnderCalcBeforeConfigurationLinkage(filter);
  const excluded=[];
  const people=[];
  raw.people.forEach(seat=>{
    const mapping=sdRuntimeMappingForSeat(seat);
    if(!mapping){excluded.push(seat);return;}
    people.push({...seat,g:mapping.group,mappingId:mapping.id});
  });
  const involved=people.filter(seat=>seat.task>0||seat.under>0);
  const groups=sdG.map(g=>{
    const rows=involved.filter(seat=>seat.g===g).sort((a,b)=>b.under-a.under||b.activation-a.activation||b.plan-a.plan||b.drive-a.drive||b.locked-a.locked||a.name.localeCompare(b.name,'zh-CN'));
    return {g,rows,under:rows.reduce((sum,row)=>sum+row.under,0),task:rows.reduce((sum,row)=>sum+row.task,0),plan:rows.reduce((sum,row)=>sum+row.plan,0),activation:rows.reduce((sum,row)=>sum+row.activation,0),call:rows.reduce((sum,row)=>sum+row.call,0),drive:rows.reduce((sum,row)=>sum+row.drive,0),locked:rows.reduce((sum,row)=>sum+row.locked,0)};
  });
  const total={under:groups.reduce((sum,g)=>sum+g.under,0),task:groups.reduce((sum,g)=>sum+g.task,0),plan:groups.reduce((sum,g)=>sum+g.plan,0),activation:groups.reduce((sum,g)=>sum+g.activation,0),call:groups.reduce((sum,g)=>sum+g.call,0),drive:groups.reduce((sum,g)=>sum+g.drive,0),locked:groups.reduce((sum,g)=>sum+g.locked,0),people:involved.length};
  return {...raw,people,involved,groups,total,quality:{unmappedSeats:excluded,unmappedRecordCount:excluded.reduce((sum,row)=>sum+Math.max(0,row.task||0,row.under||0),0)}};
};

/* 指标目标缺失不再以默认值补算；总计仅在全部成员均有有效目标时给出完成度。 */
sdTable=function(group){
  const rows=sdScheduleRank(group.a),calls=sdCallRank(group.a),active=group.activeCount||0;
  const perActive=value=>active?value/active:null;
  return '<div class="grp '+sdTag(group.g)+'"><b>▶ '+group.g+'</b><span>'+group.a.length+'人（休息 '+(group.a.length-active)+' 人）· 排程 '+group.p+' 批 · 通话 '+sdDur(group.c)+' · 试驾 '+group.drive+' 批 · 锁单 '+group.locked+' 台/单 · 人均排程 '+(perActive(group.p)===null?'—':perActive(group.p).toFixed(2)+' 批')+'</span></div><table><thead><tr><th>#</th><th>姓名</th><th>佳佳代码</th><th>排程量（批）</th><th>目标排程量(日)</th><th>完成度</th><th>组内排程排名</th><th>通话时长</th><th>组内通话排名</th><th>试驾量（批）</th><th>锁单量（台/单）</th><th>备注</th></tr></thead><tbody>'+rows.map((seat,index)=>'<tr><td>'+(index+1)+'</td><td><b>'+seat.name+'</b></td><td><em>'+seat.code+'</em></td><td class="pc">'+seat.p+'</td><td class="pc">'+(seat.targetConfigured?seat.eff:'未配置')+'</td><td>'+(seat.targetConfigured?seat.cp.toFixed(1)+'%':'—')+'</td><td>第 '+(index+1)+' 名</td><td class="call">'+(seat.c?sdDur(seat.c):'—')+'</td><td>第 '+(calls.indexOf(seat)+1)+' 名</td><td class="sd-drive">'+seat.drive+'</td><td class="sd-locked">'+seat.locked+'</td><td>'+(!seat.onDuty?'休息':'')+'</td></tr>').join('')+'</tbody></table>';
};
sdOutcomeSummary=function(data){
  const totalDrive=data.r.reduce((sum,row)=>sum+row.drive,0),totalLocked=data.r.reduce((sum,row)=>sum+row.locked,0),schedule=data.r.reduce((sum,row)=>sum+row.p,0),calls=data.r.reduce((sum,row)=>sum+row.c,0),active=data.on.length;
  const allTargetConfigured=data.gs.every(group=>group.targetConfigured);
  const totalTarget=allTargetConfigured?data.gs.reduce((sum,group)=>sum+group.t,0):null;
  const avg=(value)=>active?(value/active).toFixed(2):'—';
  const groupRows=data.gs.map(group=>{const count=group.activeCount;return '<tr><td>'+group.g+'</td><td>'+group.a.length+'人</td><td class="pc">'+group.p+'</td><td class="pc">'+(group.targetConfigured?group.t:'未配置')+'</td><td>'+(group.targetConfigured?group.cp.toFixed(1)+'%':'—')+'</td><td class="call">'+sdDur(group.c)+'</td><td class="sd-drive">'+group.drive+'</td><td class="sd-locked">'+group.locked+'</td><td>'+(count?(group.p/count).toFixed(2):'—')+'</td><td>'+(count?sdDur(group.c/count):'—')+'</td><td>'+(count?(group.drive/count).toFixed(2):'—')+'</td><td>'+(count?(group.locked/count).toFixed(2):'—')+'</td></tr>';}).join('');
  const champions=data.gs.map(group=>{const scheduleChampion=sdScheduleRank(group.a).find(row=>row.p>0),callChampion=sdCallRank(group.a).find(row=>row.c>0);return '<tr><td>'+group.g+'</td><td>'+(scheduleChampion?'🥇 '+scheduleChampion.name+'（'+scheduleChampion.p+'批）':'暂无')+'</td><td>'+(callChampion?'🥇 '+callChampion.name+'（'+sdDur(callChampion.c)+'）':'暂无')+'</td><td class="pc">'+group.p+'批</td><td class="call">'+sdDur(group.c)+'</td></tr>';}).join('');
  return '<div class="box"><h3>一、各小组业绩汇总</h3><table><thead><tr><th>小组</th><th>员工人数</th><th>排程量（批）</th><th>目标排程量(日)</th><th>完成度</th><th>通话时长</th><th>试驾量（批）</th><th>锁单量（台/单）</th><th>人均排程</th><th>人均通话</th><th>人均试驾</th><th>人均锁单</th></tr></thead><tbody>'+groupRows+'<tr class="sum"><td>合计</td><td>'+data.r.length+'人</td><td class="pc">'+schedule+'</td><td class="pc">'+(allTargetConfigured?totalTarget:'未配置')+'</td><td>'+(allTargetConfigured?(schedule/totalTarget*100).toFixed(1)+'%':'—')+'</td><td class="call">'+sdDur(calls)+'</td><td class="sd-drive">'+totalDrive+'</td><td class="sd-locked">'+totalLocked+'</td><td>'+avg(schedule)+'</td><td>'+(active?sdDur(calls/active):'—')+'</td><td>'+avg(totalDrive)+'</td><td>'+avg(totalLocked)+'</td></tr></tbody></table><h4>▎各小组冠军速览</h4><table><thead><tr><th>小组</th><th>排程量冠军</th><th>通话时长冠军</th><th>组排程量</th><th>组通话</th></tr></thead><tbody>'+champions+'</tbody></table></div>';
};

/* 并列规则统一应用到人员图、明细、榜单和每日评选。 */
const sdDrawScheduleBeforeTieBreak=sdDrawSchedule;
sdDrawSchedule=function(canvas,data){
  const copy={...data,on:sdScheduleRank(data.on)};
  return sdDrawScheduleBeforeTieBreak(canvas,copy);
};
const sdDrawCallsBeforeTieBreak=sdDrawCalls;
sdDrawCalls=function(canvas,data){
  const copy={...data,on:sdCallRank(data.on)};
  return sdDrawCallsBeforeTieBreak(canvas,copy);
};
const sdBindScheduleHoverBeforeTieBreak=sdBindScheduleHover;
sdBindScheduleHover=function(canvas,data){return sdBindScheduleHoverBeforeTieBreak(canvas,{...data,on:sdScheduleRank(data.on)});};
const sdBindCallsHoverBeforeTieBreak=sdBindCallsHover;
sdBindCallsHover=function(canvas,data){return sdBindCallsHoverBeforeTieBreak(canvas,{...data,on:sdCallRank(data.on)});};

/* 将数据质量处理落到可执行入口：先处理坐席有效映射，再补齐缺失目标。 */
function sdDataQualityNotice(quality,includeTargets){
  const mappingCount=quality.unmappedSeats.length,mappingRecords=quality.unmappedRecordCount||0,targetCount=includeTargets?(quality.targetMissingSeats||[]).length:0;
  if(!mappingCount&&!targetCount)return '';
  const mappingText=mappingCount?'有 <b>'+mappingCount+'</b> 名坐席因未映射、停用或已失效未纳入本报告（涉及 '+mappingRecords+' 条统计数据）。':'';
  const targetText=targetCount?'有 <b>'+targetCount+'</b> 名坐席缺少覆盖当前筛选日期的有效目标，目标显示“未配置”、完成度显示“—”。':'';
  return '<div class="sd-data-quality">⚠️ <span><b>数据完整性提示：</b>'+mappingText+targetText+'</span><div>'+(mappingCount?'<button type="button" onclick="sdOpenDataQualityMapping()">处理坐席映射</button>':'')+(targetCount?'<button type="button" onclick="sdOpenTargetDataQuality()">补齐目标配置</button>':'')+'</div></div>';
}
function sdOpenDataQualityMapping(){sdReportConfigOpen=true;sdReportConfigTab='mapping';sdMappingQualityFilter=true;sdMappingGroup='all';sdMappingStatus='all';sdMappingKeyword='';renderSeatPerformanceDashboard();}
function sdOpenTargetDataQuality(){sdReportConfigOpen=true;sdReportConfigTab='target';sdTargetStatus='未配置';sdTargetGroup='all';sdTargetKeyword='';renderSeatPerformanceDashboard();}
const sdMappingRowsBeforeQualityFilter=sdMappingRows;
sdMappingRows=function(){const rows=sdMappingRowsBeforeQualityFilter();return sdMappingQualityFilter?rows.filter(row=>!sdRuntimeIsActive(row)):rows;};
const sdRenderMappingBeforeQualityCopy=sdRenderMapping;
sdRenderMapping=function(){
  const html=sdRenderMappingBeforeQualityCopy().replace('报表按回访发生时间匹配有效的小组关系，未映射小组的坐席不会进入分组报表。','报表按坐席当前最新有效的小组关系汇总；调组后，历史业绩会同步归入最新小组。未映射、停用或已失效的坐席不会进入分组报表。');
  return sdMappingQualityFilter?html.replace('</p><div class="sd-config-alert">','</p><div class="sd-config-alert">⚠️ <span><b>待处理坐席：</b>当前仅展示未映射、已停用或已失效的映射记录；完成维护后，可返回报告自动复算。</span></div><div class="sd-config-alert">'):html;
};
sdTargetRows=function(){
  const key=sdTargetKeyword.trim().toLowerCase();
  return sdMappings.filter(seat=>seat.group!=='未映射').map(seat=>{
    const target=sdRuntimeTargetForDay(seat.id,sdConfigReportDate);
    return target||{id:0,seatId:seat.id,weekly:'—',monthly:'—',start:'—',end:'—',status:'未配置',updated:'待维护',missing:true};
  }).filter(target=>{const seat=sdTargetSeat(target);return seat&&(sdTargetGroup==='all'||seat.group===sdTargetGroup)&&(sdTargetStatus==='all'||target.status===sdTargetStatus)&&(!key||[seat.name,seat.account,seat.vcp].join(' ').toLowerCase().includes(key));});
};

const renderSdUnderReportBeforeQualityNotice=renderSdUnderReport;
renderSdUnderReport=function(){
  renderSdUnderReportBeforeQualityNotice();
  const root=document.querySelector('#seatPerformanceDashboardPage .sd');if(!root)return;
  const quality=sdUnderCalc(sdUnderF).quality;
  root.querySelectorAll('.sd-under-panel').forEach(panel=>{
    panel.querySelector('.sd-data-quality')?.remove();
    const filter=panel.querySelector('.sd-under-filter');
    if(filter)filter.insertAdjacentHTML('afterend',sdDataQualityNotice(quality,false));
  });
};
const renderSeatPerformanceDashboardBeforeConfigurationQuality=renderSeatPerformanceDashboard;
renderSeatPerformanceDashboard=function(){
  renderSeatPerformanceDashboardBeforeConfigurationQuality();
  if(sdReportConfigOpen)return;
  const root=document.querySelector('#seatPerformanceDashboardPage .sd');if(!root)return;
  if(sdBusinessTab==='performance')root.querySelectorAll('.sd-panel').forEach((panel,index)=>{
    panel.querySelector('.sd-data-quality')?.remove();
    const filter=panel.querySelector('.filter');
    if(filter)filter.insertAdjacentHTML('afterend',sdDataQualityNotice(sdCalc(sdF[index+1]).quality,true));
  });
  if(!document.getElementById('sd-data-quality-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-data-quality-css">#seatPerformanceDashboardPage .sd-data-quality{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0 0;padding:10px 13px;border:1px solid #f1d3a7;border-radius:8px;background:#fffaf1;color:#8b642b;font-size:12px;line-height:1.6}#seatPerformanceDashboardPage .sd .sd-panel>.sd-data-quality{margin:14px 24px 0}#seatPerformanceDashboardPage .sd .sd-under-panel>.sd-data-quality{margin:14px 0 0}#seatPerformanceDashboardPage .sd-data-quality b{color:#a65e18}#seatPerformanceDashboardPage .sd-data-quality div{display:flex;gap:7px;flex:0 0 auto}#seatPerformanceDashboardPage .sd-data-quality button{height:28px;padding:0 9px;border:1px solid #dcb77d;border-radius:5px;background:#fff;color:#936523;font:700 12px "Microsoft YaHei";cursor:pointer}#seatPerformanceDashboardPage .sd-data-quality button:hover{background:#fff4df}@media(max-width:760px){#seatPerformanceDashboardPage .sd .sd-panel>.sd-data-quality{margin:14px 14px 0}#seatPerformanceDashboardPage .sd-data-quality{align-items:flex-start;flex-direction:column}#seatPerformanceDashboardPage .sd-data-quality div{flex-wrap:wrap}}</style>');
};

/* 初次进入页面即使用联动计算结果。 */
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>renderSeatPerformanceDashboard());else renderSeatPerformanceDashboard();
const renderSdUnderReportBeforeOutcomeExpansion=renderSdUnderReport;
renderSdUnderReport=function(){
  renderSdUnderReportBeforeOutcomeExpansion();
  const root=document.querySelector('#seatPerformanceDashboardPage .sd');if(!root)return;
  const addKpis=(panel,data)=>{const kpis=panel?.querySelector('.sd-under-kpis');if(!kpis||kpis.dataset.outcomes)return;kpis.dataset.outcomes='1';kpis.insertAdjacentHTML('beforeend','<div><small>总试驾量</small><b>'+data.total.drive+' <i>批</i></b><span>试驾下发或已完成到店试驾</span></div><div><small>总锁单量</small><b>'+data.total.locked+' <i>台/单</i></b><span>下发或跟进转化为大定锁单</span></div>')};
  addKpis(root.querySelector('.sd-under-panel-1'),sdUnderCalc(sdUnderF));addKpis(root.querySelector('.sd-under-panel-2'),sdUnderCalc(sdUnderF2));
  root.querySelectorAll('.sd-under-box h3').forEach(title=>{if(title.textContent.includes('留资未满数 /'))title.textContent='二、留资未满数 / 激活量 / 排程量 / 试驾量 / 锁单量分布';if(title.textContent.includes('通话时长与人均'))title.textContent='四、通话时长与人均业绩分析'});
  root.querySelectorAll('.sd-under-box table').forEach(table=>{const head=[...table.querySelectorAll('th')].map(cell=>cell.textContent);if(!head.includes('涉及人数')||table.dataset.outcomes)return;table.dataset.outcomes='1';const panel=table.closest('.sd-under-panel'),data=panel?.classList.contains('sd-under-panel-2')?sdUnderCalc(sdUnderF2):sdUnderCalc(sdUnderF);const driveHead=document.createElement('th'),lockHead=document.createElement('th');driveHead.textContent='试驾量(批)';lockHead.textContent='锁单量(台/单)';table.querySelector('thead tr').insertBefore(lockHead,table.querySelector('thead tr').lastElementChild);table.querySelector('thead tr').insertBefore(driveHead,table.querySelector('thead tr').lastElementChild);table.querySelectorAll('tbody tr').forEach(row=>{const name=row.firstElementChild.textContent;const group=data.groups.find(item=>item.g===name);const source=group||data.total;const drive=document.createElement('td'),locked=document.createElement('td');drive.className='sd-drive';locked.className='sd-locked';drive.textContent=source.drive;locked.textContent=source.locked;row.insertBefore(locked,row.lastElementChild);row.insertBefore(drive,row.lastElementChild)})});
};

function sdHonorCounts(){
  const counts=new Map();
  sdHonorDailyRecords().forEach(record=>[[record.sales,'sales'],[record.worker,'worker']].forEach(([seat,type])=>{if(!seat)return;const item=counts.get(seat.name)||{sales:0,worker:0};item[type]++;counts.set(seat.name,item)}));
  return counts;
}
sdTable=function(group){
  const rows=sdScheduleRank(group.a),callRank=sdCallRank(group.a),honors=sdHonorCounts(),active=Math.max(1,group.activeCount||0);
  return '<div class="grp '+sdTag(group.g)+'"><b>▶ '+group.g+'</b><span>'+group.a.length+'人（休息 '+(group.a.length-(group.activeCount||0))+' 人）· 排程 '+group.p+' 批 · 通话 '+sdDur(group.c)+' · 试驾 '+group.drive+' 批 · 锁单 '+group.locked+' 台/单 · 人均排程 '+(group.p/active).toFixed(2)+' 批</span></div><table><thead><tr><th>#</th><th>姓名</th><th>佳佳代码</th><th>排程量（批）</th><th>目标排程量(日)</th><th>完成度</th><th>组内排程排名</th><th>通话时长</th><th>组内通话排名</th><th>试驾量（批）</th><th>锁单量（台/单）</th><th>月累销冠王次数</th><th>月累劳模王次数</th><th>备注</th></tr></thead><tbody>'+rows.map((seat,index)=>{const honor=honors.get(seat.name)||{sales:0,worker:0};return '<tr><td>'+(index+1)+'</td><td><b>'+seat.name+'</b></td><td><em>'+seat.code+'</em></td><td class="pc">'+seat.p+'</td><td class="pc">'+seat.eff+'</td><td>'+seat.cp.toFixed(1)+'%</td><td>第 '+(index+1)+' 名</td><td class="call">'+(seat.c?sdDur(seat.c):'—')+'</td><td>第 '+(callRank.indexOf(seat)+1)+' 名</td><td class="sd-drive">'+seat.drive+'</td><td class="sd-locked">'+seat.locked+'</td><td>'+honor.sales+' 次</td><td>'+honor.worker+' 次</td><td>'+(!seat.onDuty?'休息':'')+'</td></tr>'}).join('')+'</tbody></table>';
};
function sdOutcomeRankTable(rows,title,ranker,metric,unit,aux){
  const labels={p:'排程量（批）',c:'通话时长',drive:'试驾量（批）',locked:'锁单量（台/单）',salesKing:'月累销冠王次数',laborKing:'月累劳模王次数'};
  const list=ranker(rows).filter(seat=>seat[metric]>0).slice(0,10);
  return '<table><caption>🥇 '+title+'</caption><thead><tr><th>排名</th><th>姓名</th><th>小组</th><th>'+labels[metric]+'</th><th>'+aux.label+'</th></tr></thead><tbody>'+list.map((seat,index)=>'<tr><td>'+(['🥇','🥈','🥉'][index]||index+1)+'</td><td><b>'+seat.name+'</b></td><td>'+seat.g+'</td><td>'+seat[metric]+unit+'</td><td>'+aux.value(seat)+'</td></tr>').join('')+'</tbody></table>'
}
sdOutcomeRankings=function(data){
  const counts=sdHonorCounts(),monthly=data.r.map(seat=>({...seat,salesKing:(counts.get(seat.name)||{}).sales||0,laborKing:(counts.get(seat.name)||{}).worker||0}));
  const countRank=(key)=>rows=>[...rows].sort((a,b)=>b[key]-a[key]||b.p-a.p||a.name.localeCompare(b.name,'zh-CN'));
  return '<div class="box"><h3>五、全员多指标榜单 TOP 10</h3><div class="charts sd-outcome-ranks">'+sdOutcomeRankTable(data.r,'排程量 TOP 10（批）',sdScheduleRank,'p',' 批',{label:'有效排程率',value:s=>(s.scheduleRate*100).toFixed(1)+'%'})+sdOutcomeRankTable(data.r,'通话时长 TOP 10',sdCallRank,'c',' 秒',{label:'当日外呼任务量',value:s=>s.outbound+' 通'})+sdOutcomeRankTable(data.r,'试驾量 TOP 10（批）',sdDriveRank,'drive',' 批',{label:'排程量',value:s=>s.p+' 批'})+sdOutcomeRankTable(data.r,'锁单量 TOP 10（台/单）',sdLockRank,'locked',' 台/单',{label:'试驾量',value:s=>s.drive+' 批'})+sdOutcomeRankTable(monthly,'月累销冠王次数 TOP 10',countRank('salesKing'),'salesKing',' 次',{label:'排程量',value:s=>s.p+' 批'})+sdOutcomeRankTable(monthly,'月累劳模王次数 TOP 10',countRank('laborKing'),'laborKing',' 次',{label:'通话时长',value:s=>sdDur(s.c)})+'</div></div>';
};

/* 榜单聚焦模式：一次只查看一个指标，减少同屏条形图造成的压迫感。 */
let sdRankFocusMetric='schedule';
function switchSdRankFocus(metric){sdRankFocusMetric=metric;renderSeatPerformanceDashboard()}
function sdRankFocusConfig(data){
  const counts=sdHonorCounts(),monthly=data.r.map(seat=>({...seat,salesKing:(counts.get(seat.name)||{}).sales||0,laborKing:(counts.get(seat.name)||{}).worker||0}));
  return {
    schedule:{tab:'排程量',title:'排程量 TOP 10',metric:'p',unit:'批',rows:data.r,ranker:sdScheduleRank,rule:'并列时依次按有效排程率、意向线索下发量排序',aux:seat=>'有效排程率 '+(seat.scheduleRate*100).toFixed(1)+'%'},
    call:{tab:'通话时长',title:'通话时长 TOP 10',metric:'c',unit:'秒',rows:data.r,ranker:sdCallRank,rule:'并列时依次按当日外呼任务量、有效排程率排序',aux:seat=>'外呼任务 '+seat.outbound+' 通'},
    drive:{tab:'试驾量',title:'试驾量 TOP 10',metric:'drive',unit:'批',rows:data.r,ranker:sdDriveRank,rule:'并列时依次按排程量、有效排程率排序',aux:seat=>'排程 '+seat.p+' 批'},
    locked:{tab:'锁单量',title:'锁单量 TOP 10',metric:'locked',unit:'台/单',rows:data.r,ranker:sdLockRank,rule:'并列时依次按试驾量、排程量排序',aux:seat=>'试驾 '+seat.drive+' 批'},
    laborKing:{tab:'累计劳模王次数',title:'累计劳模王次数 TOP 10',metric:'laborKing',unit:'次',rows:monthly,ranker:sdLaborKingRank,rule:'同次数时依次按通话时长、外呼量、企微添加率排序',aux:seat=>'通话 '+sdDur(seat.c)},
    salesKing:{tab:'累计销冠王次数',title:'累计销冠王次数 TOP 10',metric:'salesKing',unit:'次',rows:monthly,ranker:sdSalesKingRank,rule:'同次数时依次按排程量、有效排程率、意向线索下发量排序',aux:seat=>'排程 '+seat.p+' 批'}
  };
}
sdOutcomeRankings=function(data){
  const config=sdRankFocusConfig(data),current=config[sdRankFocusMetric]||config.schedule,list=current.ranker(current.rows).filter(seat=>seat[current.metric]>0).slice(0,10),podium=[list[1],list[0],list[2]].filter(Boolean),others=list.slice(3);
  const medal=['🥈','🥇','🥉'];
  const rest=others.length?'<div class="sd-rank-rest">'+others.map((seat,index)=>'<div class="sd-rank-rest-row"><span>'+(index+4)+'</span><b>'+seat.name+'</b><small>'+seat.g+'</small><i></i><strong>'+seat[current.metric]+' '+current.unit+'</strong><em>'+current.aux(seat)+'</em></div>').join('')+'</div>':'';
  return '<div class="box sd-rank-focus-board"><h3>五、全员多指标榜单 TOP 10</h3><p class="sd-rank-focus-intro">选择一个业务指标聚焦查看：前三名以领奖台突出展示，其余排名保留为简洁列表。</p><div class="sd-rank-tabs">'+Object.entries(config).map(([key,item])=>'<button type="button" class="'+(key===sdRankFocusMetric?'active':'')+'" onclick="switchSdRankFocus(\''+key+'\')">'+item.tab+'</button>').join('')+'</div><div class="sd-rank-focus-head"><div><span>当前榜单</span><b>'+current.title+'</b><small>'+current.rule+'</small></div><div class="sd-rank-focus-unit">统计单位<br><b>'+current.unit+'</b></div></div><div class="sd-rank-podium">'+podium.map((seat,index)=>'<div class="sd-podium-card place-'+(index+1)+'"><span class="sd-podium-medal">'+medal[index]+'</span><div class="sd-podium-avatar">'+seat.name.slice(0,1)+'</div><b>'+seat.name+'</b><span>'+seat.g+'</span><strong>'+seat[current.metric]+' <i>'+current.unit+'</i></strong><small>'+current.aux(seat)+'</small><em>TOP '+(index===1?1:index===0?2:3)+'</em></div>').join('')+'</div>'+rest+'<style id="sd-rank-focus-css">#seatPerformanceDashboardPage .sd .sd-rank-focus-board{padding-bottom:22px}.sd-rank-focus-intro{margin:0 0 13px;color:#7b8798;font-size:13px}.sd-rank-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}.sd-rank-tabs button{height:32px;padding:0 14px;border:1px solid #dce6f2;border-radius:7px;background:#fff;color:#667892;font:600 13px "Microsoft YaHei";cursor:pointer;transition:.18s}.sd-rank-tabs button:hover{border-color:#91b2df;color:#2f64b9}.sd-rank-tabs button.active{border-color:#2f64b9;background:#2f64b9;color:#fff;box-shadow:0 3px 8px rgba(47,100,185,.18)}.sd-rank-focus-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:12px;padding:14px 16px;border:1px solid #e1eaf4;border-radius:10px;background:linear-gradient(90deg,#f6f9fe,#fff)}.sd-rank-focus-head span,.sd-rank-focus-head small{display:block;color:#7c8ca3;font-size:12px}.sd-rank-focus-head>b{display:block;margin:3px 0;color:#293b57;font-size:18px}.sd-rank-focus-unit{padding-left:16px;border-left:1px solid #dce6f2;color:#7c8ca3;font-size:11px;text-align:right}.sd-rank-focus-unit b{display:block;margin-top:3px;color:#2f64b9;font-size:16px}.sd-rank-podium{display:grid;grid-template-columns:repeat(3,1fr);align-items:end;gap:12px;padding:10px 0 15px}.sd-podium-card{position:relative;display:flex;min-height:175px;align-items:center;flex-direction:column;justify-content:center;padding:15px 12px;border:1px solid #e2eaf4;border-radius:12px;background:#fff;text-align:center}.sd-podium-card.place-2{min-height:205px;border-color:#b8cef0;background:linear-gradient(160deg,#f5f9ff,#fff);box-shadow:0 7px 18px rgba(47,100,185,.1)}.sd-podium-medal{position:absolute;top:10px;left:11px;font-size:19px}.sd-podium-avatar{display:grid;place-items:center;width:42px;height:42px;margin-bottom:7px;border-radius:50%;background:#edf4ff;color:#2f64b9;font-size:18px;font-weight:800}.place-2 .sd-podium-avatar{width:50px;height:50px;background:#e1edff;font-size:21px}.sd-podium-card>b{color:#293b57;font-size:15px}.sd-podium-card>span:not(.sd-podium-medal){margin-top:3px;color:#8190a5;font-size:12px}.sd-podium-card strong{margin:10px 0 4px;color:#2f64b9;font-size:21px}.sd-podium-card strong i{font-size:12px;font-style:normal}.sd-podium-card small{color:#8290a4;font-size:11px}.sd-podium-card em{position:absolute;right:10px;bottom:8px;color:#b1bdcd;font-size:10px;font-style:normal;font-weight:700}.sd-rank-rest{overflow:hidden;border:1px solid #e2eaf4;border-radius:10px;background:#fff}.sd-rank-rest-row{display:grid;grid-template-columns:30px 78px 42px minmax(30px,1fr) 90px 135px;align-items:center;gap:10px;min-height:42px;padding:0 14px;border-bottom:1px solid #eef2f6}.sd-rank-rest-row:last-child{border-bottom:0}.sd-rank-rest-row>span{color:#8090a5;font-size:13px;font-weight:700;text-align:center}.sd-rank-rest-row>b{color:#394962;font-size:13px}.sd-rank-rest-row small,.sd-rank-rest-row em{color:#8493a7;font-size:12px;font-style:normal}.sd-rank-rest-row>i{height:7px;border-radius:8px;background:#edf2f8}.sd-rank-rest-row strong{color:#2f64b9;font-size:13px;text-align:right}.sd-rank-rest-row em{text-align:right}@media(max-width:720px){.sd-rank-podium{gap:7px}.sd-podium-card{min-height:155px;padding:12px 6px}.sd-podium-card.place-2{min-height:180px}.sd-rank-rest-row{grid-template-columns:24px 60px 30px minmax(10px,1fr) 70px;gap:6px;padding:0 8px}.sd-rank-rest-row em{display:none}.sd-rank-focus-head{padding:12px}.sd-rank-tabs button{padding:0 10px;font-size:12px}}</style></div>';
};
const sdOutcomeRankingsFocusView=sdOutcomeRankings;
sdHonorDailyRecords=function(){return sdDays.map(day=>{const data=sdCalc({s:day,sh:0,e:day,eh:23}),sales=sdScheduleRank(data.r).find(seat=>seat.p>0),worker=sdLaborRank(data.r).find(seat=>seat.c>0);return{day,sales,worker,double:sales&&worker&&sales.name===worker.name}}).reverse()};
sdHonorContent=function(){
  const history=sdHonorDailyRecords(),today=history[0],counts=sdHonorCounts(),allSeats=sdCalc({s:sdDays[0],sh:0,e:sdDays[6],eh:23}).r;
  const ranking=[...counts.entries()].map(([name,value])=>({name,...value,seat:allSeats.find(row=>row.name===name)})).sort((a,b)=>(b.sales+b.worker)-(a.sales+a.worker)||b.sales-a.sales||a.name.localeCompare(b.name,'zh-CN')).slice(0,10),visible=history.slice(0,sdHonorRange==='7'?7:history.length),rate=v=>(v*100).toFixed(1)+'%';
  return '<section class="sd-honor"><div class="sd-honor-heading"><div><h2>八、每日两王 · 荣誉榜与历史公示</h2><p>每日 21:00 截止结算；次日 09:30 公示，09:30–11:30 可申诉。奖励随次月薪资发放，与上方时段筛选独立。</p></div><span class="sd-honor-date">今日结算：'+today.day+'</span></div><div class="sd-honor-today"><div class="sd-crown-card sales"><div class="sd-crown-kicker">今日双王 · 销冠王</div><div class="sd-crown-main"><span class="sd-crown-icon">👑</span><div><b>'+today.sales.name+'</b><span>'+today.sales.g+' · '+today.sales.code+'</span></div></div><div class="sd-crown-value">'+today.sales.p+' <small>批有效排程</small></div><p>有效排程须同时确认意向、经销商、车型与准确到店时间；并列按有效排程率、意向下发量。</p></div><div class="sd-crown-card worker"><div class="sd-crown-kicker">今日双王 · 劳模王</div><div class="sd-crown-main"><span class="sd-crown-icon">💪</span><div><b>'+today.worker.name+'</b><span>'+today.worker.g+' · '+today.worker.code+'</span></div></div><div class="sd-crown-value">'+sdDur(today.worker.c)+' <small>有效通话</small></div><p>并列按当日外呼任务量、企微添加率（已加企微人数 / 已接通人数）依次评选。</p></div><div class="sd-crown-side"><span>双料王者</span><b>'+(today.double?'👑💪 '+today.sales.name:'—')+'</b><small>销冠王与劳模王可由同一人获得</small></div></div><div class="sd-honor-summary"><div><small>结算截止</small><b>21:00</b><span>自然日数据截止</span></div><div><small>公示与申诉</small><b>09:30–11:30</b><span>次日公示后开放申诉</span></div><div><small>奖励发放</small><b>次月</b><span>随薪资统一发放</span></div></div><div class="sd-honor-grid"><div class="sd-honor-box"><div class="sd-honor-box-head"><h3>累计荣誉榜 TOP</h3><span>按当月累计获奖次数</span></div><table><thead><tr><th>排名</th><th>员工</th><th>小组</th><th>销冠王</th><th>劳模王</th><th>荣誉称号</th></tr></thead><tbody>'+ranking.map((row,index)=>'<tr><td>'+(['🥇','🥈','🥉'][index]||index+1)+'</td><td><b>'+row.name+'</b></td><td>'+row.seat.g+'</td><td>'+row.sales+' 次</td><td>'+row.worker+' 次</td><td>'+sdHonorMedal({sales:row.sales,worker:row.worker})+'</td></tr>').join('')+'</tbody></table></div><div class="sd-honor-box"><div class="sd-honor-box-head"><h3>往期公示 HISTORY</h3><div class="sd-honor-range"><button class="'+(sdHonorRange==='7'?'active':'')+'" onclick="switchSdHonorRange(\'7\')">近 7 天</button><button class="'+(sdHonorRange==='30'?'active':'')+'" onclick="switchSdHonorRange(\'30\')">近 30 天</button><button class="'+(sdHonorRange==='month'?'active':'')+'" onclick="switchSdHonorRange(\'month\')">当月</button></div></div><table><thead><tr><th>公示日期</th><th>销冠王</th><th>劳模王</th><th>双料</th></tr></thead><tbody>'+visible.map(record=>'<tr><td>'+record.day+'</td><td><b>👑 '+record.sales.name+'</b><br><span>'+record.sales.p+' 批 · 排程率 '+rate(record.sales.scheduleRate)+'</span></td><td><b>💪 '+record.worker.name+'</b><br><span>'+sdDur(record.worker.c)+' · '+record.worker.outbound+' 通 · 企微率 '+rate(record.worker.wechatRate)+'</span></td><td>'+(record.double?'👑💪':'—')+'</td></tr>').join('')+'</tbody></table><p class="sd-honor-history-note">历史公示保留每日双王、核心评选数据及申诉结果，便于回溯。</p></div></div></section>';
};

/* 全员多指标榜单：以横向条形图呈现，保留名次、数值和关键破局指标。 */
function sdRankChart(rows,title,ranker,metric,label,unit,aux){
  const list=ranker(rows).filter(seat=>seat[metric]>0).slice(0,10),max=Math.max(1,...list.map(seat=>seat[metric]));
  return '<section class="sd-rank-chart"><div class="sd-rank-chart-head"><div><b>'+title+'</b><span>'+label+'排名</span></div><small>'+aux.label+'</small></div><div class="sd-rank-chart-list">'+list.map((seat,index)=>'<div class="sd-rank-chart-row"><span class="sd-rank-no '+(index<3?'top top-'+(index+1):'')+'">'+(['🥇','🥈','🥉'][index]||index+1)+'</span><div class="sd-rank-person"><b>'+seat.name+'</b><span>'+seat.g+'</span></div><div class="sd-rank-bar-wrap"><div class="sd-rank-bar" style="width:'+Math.max(6,seat[metric]/max*100)+'%"><i></i></div></div><div class="sd-rank-value"><b>'+seat[metric]+unit+'</b><span>'+aux.value(seat)+'</span></div></div>').join('')+'</div></section>';
}
sdOutcomeRankings=function(data){
  const counts=sdHonorCounts(),monthly=data.r.map(seat=>({...seat,salesKing:(counts.get(seat.name)||{}).sales||0,laborKing:(counts.get(seat.name)||{}).worker||0}));
  const countRank=key=>rows=>[...rows].sort((a,b)=>b[key]-a[key]||b.p-a.p||a.name.localeCompare(b.name,'zh-CN'));
  return '<div class="box sd-rank-board"><h3>五、全员多指标榜单 TOP 10</h3><p class="sd-rank-intro">各榜单仅展示对应指标大于 0 的员工；横条长度反映同榜单内相对表现，右侧保留关键辅助指标用于理解排名。</p><style id="sd-rank-board-css">#seatPerformanceDashboardPage .sd .sd-rank-board{padding-bottom:20px}#seatPerformanceDashboardPage .sd .sd-rank-intro{margin:0 0 14px;color:#7b8798;font-size:13px;line-height:1.6}.sd-rank-chart-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.sd-rank-chart{overflow:hidden;border:1px solid #e2eaf4;border-radius:10px;background:#fff}.sd-rank-chart-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-bottom:1px solid #e7edf5;background:#f7faff}.sd-rank-chart-head b{display:block;color:#2f64b9;font-size:14px}.sd-rank-chart-head span,.sd-rank-chart-head small{display:block;margin-top:3px;color:#8794a7;font-size:11px}.sd-rank-chart-head small{margin:0;color:#64748b}.sd-rank-chart-list{padding:4px 14px 10px}.sd-rank-chart-row{display:grid;grid-template-columns:27px 62px minmax(72px,1fr) 104px;align-items:center;gap:8px;min-height:37px;border-bottom:1px solid #f0f3f7}.sd-rank-chart-row:last-child{border-bottom:0}.sd-rank-no{color:#7d8ba0;font-size:12px;font-weight:700;text-align:center}.sd-rank-no.top{font-size:15px}.sd-rank-person{min-width:0}.sd-rank-person b{display:block;overflow:hidden;color:#36465f;font-size:13px;white-space:nowrap;text-overflow:ellipsis}.sd-rank-person span{display:block;margin-top:1px;color:#91a0b4;font-size:11px}.sd-rank-bar-wrap{height:9px;overflow:hidden;border-radius:9px;background:#edf2f8}.sd-rank-bar{height:100%;min-width:5px;border-radius:9px;background:linear-gradient(90deg,#77a8ec,#2f64b9);transition:width .24s ease}.sd-rank-chart:nth-child(2n) .sd-rank-bar{background:linear-gradient(90deg,#79c8a9,#2f8066)}.sd-rank-chart:nth-child(3n) .sd-rank-bar{background:linear-gradient(90deg,#b59be2,#7053b6)}.sd-rank-chart:nth-child(4n) .sd-rank-bar{background:linear-gradient(90deg,#edb277,#bd6a22)}.sd-rank-value{text-align:right;white-space:nowrap}.sd-rank-value b{display:block;color:#31415b;font-size:12px}.sd-rank-value span{display:block;margin-top:1px;color:#8794a7;font-size:10px}@media(max-width:1080px){.sd-rank-chart-grid{grid-template-columns:1fr}}@media(max-width:560px){.sd-rank-chart-list{padding:4px 10px 8px}.sd-rank-chart-row{grid-template-columns:23px 50px minmax(40px,1fr) 82px;gap:5px}.sd-rank-value b{font-size:11px}.sd-rank-value span{overflow:hidden;text-overflow:ellipsis}.sd-rank-person b{font-size:12px}}</style><div class="sd-rank-chart-grid">'+sdRankChart(data.r,'排程量 TOP 10',sdScheduleRank,'p','排程量',' 批',{label:'辅助：有效排程率',value:seat=>'排程率 '+(seat.scheduleRate*100).toFixed(1)+'%'})+sdRankChart(data.r,'通话时长 TOP 10',sdCallRank,'c','通话时长',' 秒',{label:'辅助：当日外呼任务量',value:seat=>'外呼任务 '+seat.outbound+' 通'})+sdRankChart(data.r,'试驾量 TOP 10',sdDriveRank,'drive','试驾量',' 批',{label:'辅助：排程量',value:seat=>'排程 '+seat.p+' 批'})+sdRankChart(data.r,'锁单量 TOP 10',sdLockRank,'locked','锁单量',' 台/单',{label:'辅助：试驾量',value:seat=>'试驾 '+seat.drive+' 批'})+sdRankChart(monthly,'月累销冠王次数 TOP 10',countRank('salesKing'),'salesKing','月累销冠王次数',' 次',{label:'辅助：排程量',value:seat=>'排程 '+seat.p+' 批'})+sdRankChart(monthly,'月累劳模王次数 TOP 10',countRank('laborKing'),'laborKing','月累劳模王次数',' 次',{label:'辅助：通话时长',value:seat=>sdDur(seat.c)})+'</div></div>';
};

/* 最终使用聚焦版，保留上方旧实现仅用于随时回滚。 */
sdOutcomeRankings=sdOutcomeRankingsFocusView;

/* 通话时长按秒排序，但在榜单中统一以“分秒”向业务人员展示。 */
const sdOutcomeRankingsBeforeDurationFormat=sdOutcomeRankings;
sdOutcomeRankings=function(data){
  const html=sdOutcomeRankingsBeforeDurationFormat(data);
  if(sdRankFocusMetric!=='call')return html;
  return html
    .replace('<div class="sd-rank-focus-unit">统计单位<br><b>秒</b></div>','<div class="sd-rank-focus-unit">统计单位<br><b>分秒</b></div>')
    .replace(/<strong>(\d+) <i>秒<\/i><\/strong>/g,(_,seconds)=>'<strong>'+sdDur(+seconds)+'</strong>')
    .replace(/<strong>(\d+) 秒<\/strong>/g,(_,seconds)=>'<strong>'+sdDur(+seconds)+'</strong>');
};

/* 弹窗表单采用网格布局，必填标记与字段名称合并为同一行，避免改变控件栅格。 */
function sdNormalizeRequiredLabels(modal){
  modal?.querySelectorAll('.sd-map-form label > i').forEach(mark=>{
    const label=mark.parentElement,textNodes=[...label.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE&&node.textContent.trim());
    if(!textNodes.length)return;
    const title=document.createElement('span');
    title.className='sd-required-field-label';
    title.textContent=textNodes.map(node=>node.textContent.trim()).join(' ')+' ';
    title.append(mark);
    textNodes.forEach(node=>node.remove());
    label.insertBefore(title,label.firstChild);
  });
}
const sdOpenMappingModalBeforeRequiredFields=sdOpenMappingModal;
sdOpenMappingModal=function(id){sdOpenMappingModalBeforeRequiredFields(id);sdNormalizeRequiredLabels(document.querySelector('.sd-map-modal'))};
const sdOpenTargetModalBeforeRequiredFields=sdOpenTargetModal;
sdOpenTargetModal=function(id,seatId){sdOpenTargetModalBeforeRequiredFields(id,seatId);sdNormalizeRequiredLabels(document.querySelector('.sd-map-modal'))};

/* 业绩晾晒报告的两块时段面板可独立收起，避免在长页面中反复滚动。 */
const sdPerformancePanelCollapsed={1:false,2:true};
function toggleSdPerformancePanel(id){
  const panel=document.querySelector('#seatPerformanceDashboardPage .sd .sd-panel-'+id);
  if(!panel)return;
  const collapsed=sdPerformancePanelCollapsed[id]=!sdPerformancePanelCollapsed[id];
  panel.classList.toggle('is-collapsed',collapsed);
  panel.querySelectorAll(':scope > :not(.major-title)').forEach(node=>node.hidden=collapsed);
  const button=panel.querySelector('.sd-major-panel-toggle-btn');
  if(button)button.textContent=collapsed?'点击展开 ∨':'点击收起 ∧';
  const note=panel.querySelector('.sd-major-panel-collapsed-note');
  if(note)note.hidden=!collapsed;
  if (!collapsed) {
    // 展开时立即清理可能残留的隐藏状态与 fallback，并在布局恢复后触发重绘
    panel.querySelectorAll('canvas[data-sd-chart]').forEach(c => {
      c.style.display = '';
      c.parentElement?.querySelectorAll('.sd-chart-svg-fallback').forEach(el => el.remove());
    });
    window.refreshSeatPerformanceCharts?.(id);
    requestAnimationFrame(() => {
      window.refreshSeatPerformanceCharts?.(id);
      requestAnimationFrame(() => window.refreshSeatPerformanceCharts?.(id));
    });
  }
}
const sdPanelBeforeCollapseControl=sdPanel;
sdPanel=function(id,title,orange){
  const panelTitle=id===1?'第一大点　新线索（可筛选）':id===2?'第二大点　全量线索（可筛选）':title;
  const collapsed=!!sdPerformancePanelCollapsed[id];
  const control='<button type="button" class="sd-major-panel-toggle-btn" onclick="event.stopPropagation();toggleSdPerformancePanel('+id+')">'+(collapsed?'点击展开 ∨':'点击收起 ∧')+'</button>';
  const note='<small class="sd-major-panel-collapsed-note"'+(collapsed?'':' hidden')+'>已收起 · 点击展开查阅</small>';
  const style=id===1?'<style id="sd-major-collapse-css">#seatPerformanceDashboardPage .sd .major-title{display:flex;align-items:center;justify-content:space-between;gap:16px;cursor:pointer;user-select:none}#seatPerformanceDashboardPage .sd .major-title>span:first-child{display:flex;align-items:center;gap:10px}.sd-major-panel-toggle-btn{flex:0 0 auto;height:30px;padding:0 12px;border:1px solid rgba(255,255,255,.56);border-radius:7px;background:rgba(255,255,255,.11);color:#fff;font:600 12px "Microsoft YaHei";cursor:pointer}.sd-major-panel-toggle-btn:hover{background:rgba(255,255,255,.2)}.sd-major-panel-collapsed-note{color:rgba(255,255,255,.78);font-size:12px;font-weight:500}.sd .major.is-collapsed{padding-bottom:0}.sd .major.is-collapsed>:not(.major-title){display:none!important}</style>':'';
  return sdPanelBeforeCollapseControl(id,panelTitle,orange)
    .replace('<section class="major sd-panel sd-panel-'+id+'">','<section class="major sd-panel sd-panel-'+id+(collapsed?' is-collapsed':'')+'">')
    .replace(/<div class="major-title([^\"]*)">([\s\S]*?)<\/div>/,'<div class="major-title$1" onclick="toggleSdPerformancePanel('+id+')"><span>$2 '+note+'</span>'+control+'</div>')+style;
};

/* 留资未满五指标：独立 SVG 分组柱状图，避免沿用三指标布局导致柱体重叠。 */
function sdUnderChartNumber(value){const number=Number(value);return Number.isFinite(number)?number:0}
function sdUnderChartAxisMax(value){const step=value<=10?2:value<=30?5:value<=100?10:Math.pow(10,Math.floor(Math.log10(value)));return Math.max(step,Math.ceil(value/step)*step)}
renderSdUnderDistribution=function(data){
  const metrics=[
    {key:'under',label:'留资未满数',unit:'条',color:'#ff4d1a'},
    {key:'activation',label:'激活量',unit:'批',color:'#6d35d8'},
    {key:'plan',label:'排程量',unit:'批',color:'#1677ff'},
    {key:'drive',label:'试驾量',unit:'批',color:'#2f8066'},
    {key:'locked',label:'锁单量',unit:'台/单',color:'#c67a3b'}
  ];
  const rows=[...data.involved].map(row=>{const item={...row};metrics.forEach(metric=>item[metric.key]=sdUnderChartNumber(row[metric.key]));return item}).sort((a,b)=>b.under-a.under||b.activation-a.activation||b.plan-a.plan||b.drive-a.drive||b.locked-a.locked||a.name.localeCompare(b.name,'zh-CN'));
  const style='<style id="sd-under-svg-chart-css">#seatPerformanceDashboardPage .sd-under-svg-title{margin:10px 0 6px;color:#334155;font-size:13px;font-weight:700;text-align:center}#seatPerformanceDashboardPage .sd-under-svg-scroll{overflow-x:auto;padding:4px 0 10px;border:1px solid #e7edf5;border-radius:8px;background:#fff}#seatPerformanceDashboardPage .sd-under-svg-chart{display:block;min-width:760px;font-family:"Microsoft YaHei","PingFang SC",sans-serif}#seatPerformanceDashboardPage .sd-under-svg-chart .grid{stroke:#e8edf4;stroke-width:1}#seatPerformanceDashboardPage .sd-under-svg-chart .axis{stroke:#6b7789;stroke-width:1}#seatPerformanceDashboardPage .sd-under-svg-chart .tick{fill:#748196;font-size:11px}#seatPerformanceDashboardPage .sd-under-svg-chart .axis-title{fill:#64748b;font-size:11px}#seatPerformanceDashboardPage .sd-under-svg-chart .value{font-size:11px;font-weight:700}#seatPerformanceDashboardPage .sd-under-svg-chart .name{fill:#5f6f85;font-size:11px}#seatPerformanceDashboardPage .sd-under-svg-chart .employee{cursor:crosshair}.sd-under-svg-chart .employee .sd-under-svg-hit{fill:transparent;pointer-events:all}.sd-under-svg-chart .employee.is-hover .sd-under-svg-hit{fill:rgba(47,100,185,.08)}.sd-under-svg-chart .employee.is-hover rect:not(.sd-under-svg-hit){filter:brightness(.9)}#seatPerformanceDashboardPage .sd-under-chart-legend{justify-content:center;margin:2px 0 8px}#seatPerformanceDashboardPage .sd-under-chart-legend small{width:100%;margin-left:0;text-align:center}#seatPerformanceDashboardPage .sd-under-svg-empty{padding:42px 16px;border:1px dashed #d9e2ef;border-radius:8px;background:#fbfcfe;color:#718198;text-align:center;font-size:13px}</style>';
  const legend='<div class="sd-under-chart-legend">'+metrics.map(metric=>'<span><i style="background:'+metric.color+'"></i>'+metric.label+'（'+metric.unit+'）</span>').join('')+'<small>按留资未满数降序；悬停柱体可查看该员工的完整五项指标。</small></div>';
  if(!rows.length)return style+'<div class="sd-under-chart">'+legend+'<div class="sd-under-svg-empty">当前筛选时段暂无可展示的留资未满数据</div></div>';
  const maximum=sdUnderChartAxisMax(Math.max(...rows.flatMap(row=>metrics.map(metric=>row[metric.key])))),left=58,right=24,top=62,bottom=78,height=300,svgHeight=top+height+bottom,columnWidth=138,svgWidth=Math.max(760,left+right+rows.length*columnWidth),plotWidth=svgWidth-left-right,groupWidth=plotWidth/rows.length,barWidth=17,gap=5,totalBarWidth=metrics.length*barWidth+(metrics.length-1)*gap;
  const grid=Array.from({length:6},(_,index)=>{const value=maximum*(5-index)/5,y=top+height*index/5;return '<line class="grid" x1="'+left+'" y1="'+y+'" x2="'+(svgWidth-right)+'" y2="'+y+'"/><text class="tick" x="'+(left-10)+'" y="'+(y+4)+'" text-anchor="end">'+(Number.isInteger(value)?value:value.toFixed(1))+'</text>'}).join('');
  const columns=rows.map((row,index)=>{const groupLeft=left+groupWidth*index,start=groupLeft+(groupWidth-totalBarWidth)/2,center=left+groupWidth*(index+.5);const bars=metrics.map((metric,metricIndex)=>{const value=row[metric.key],barHeight=value/maximum*height,x=start+metricIndex*(barWidth+gap),y=top+height-barHeight,labelY=value?Math.max(top+11,y-5):top+height-5;return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+barWidth+'" height="'+barHeight.toFixed(1)+'" rx="3" fill="'+metric.color+'"/><text class="value" x="'+(x+barWidth/2).toFixed(1)+'" y="'+labelY.toFixed(1)+'" text-anchor="middle" fill="'+metric.color+'">'+value+'</text>'}).join('');return '<g class="employee" data-name="'+row.name+'" data-group="'+row.g+'" data-under="'+row.under+'" data-activation="'+row.activation+'" data-plan="'+row.plan+'" data-drive="'+row.drive+'" data-locked="'+row.locked+'"><rect class="sd-under-svg-hit" x="'+groupLeft.toFixed(1)+'" y="'+top+'" width="'+groupWidth.toFixed(1)+'" height="'+(height+48)+'"/>'+bars+'<text class="name" x="'+center.toFixed(1)+'" y="'+(top+height+20)+'" text-anchor="end" transform="rotate(-38 '+center.toFixed(1)+' '+(top+height+20)+')">'+row.name+'</text></g>'}).join('');
  const svg='<svg class="sd-under-svg-chart" width="'+svgWidth+'" height="'+svgHeight+'" viewBox="0 0 '+svgWidth+' '+svgHeight+'" role="img" aria-label="各员工留资未满数、激活量、排程量、试驾量和锁单量分布图"><text class="axis-title" x="14" y="'+(top-18)+'">留资未满（条）</text><text class="axis-title" x="'+(svgWidth-2)+'" y="'+(top-18)+'" text-anchor="end">批次 / 台单</text>'+grid+'<line class="axis" x1="'+left+'" y1="'+(top+height)+'" x2="'+(svgWidth-right)+'" y2="'+(top+height)+'"/>'+columns+'</svg>';
  return style+'<div class="sd-under-chart">'+legend+'<div class="sd-under-svg-title">各员工留资未满数 / 激活量 / 排程量 / 试驾量 / 锁单量（按留资未满数降序）</div><div class="sd-under-svg-scroll">'+svg+'</div></div>';
};

/* 留资未满分布：悬停整个员工分组，展示完整指标卡。 */
function sdUnderSvgTooltip(){
  let tooltip=document.getElementById('sd-under-svg-tooltip');
  if(tooltip)return tooltip;
  document.body.insertAdjacentHTML('beforeend','<div id="sd-under-svg-tooltip" role="status"></div>');
  tooltip=document.getElementById('sd-under-svg-tooltip');
  document.head.insertAdjacentHTML('beforeend','<style id="sd-under-svg-tooltip-css">#sd-under-svg-tooltip{display:none;position:fixed;z-index:10020;min-width:214px;padding:12px 14px;border:1px solid #dbe5f1;border-radius:8px;background:rgba(255,255,255,.98);box-shadow:0 8px 24px rgba(31,53,84,.18);color:#42526a;font-size:12px;line-height:1.5;pointer-events:none}#sd-under-svg-tooltip strong{display:block;margin-bottom:6px;color:#263a57;font-size:14px}#sd-under-svg-tooltip p{display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:6px;margin:3px 0}#sd-under-svg-tooltip i{display:block;width:8px;height:8px;border-radius:2px}#sd-under-svg-tooltip b{color:#2f405a;font-weight:700}</style>');
  return tooltip;
}
sdBindUnderChartHover=function(){
  const tooltip=sdUnderSvgTooltip();
  const hide=()=>{tooltip.style.display='none';document.querySelectorAll('#seatPerformanceDashboardPage .sd-under-svg-chart .employee.is-hover').forEach(item=>item.classList.remove('is-hover'))};
  const metricRows=[['under','留资未满数','条','#ff4d1a'],['activation','激活量','批','#6d35d8'],['plan','排程量','批','#1677ff'],['drive','试驾量','批','#2f8066'],['locked','锁单量','台/单','#c67a3b']];
  document.querySelectorAll('#seatPerformanceDashboardPage .sd-under-svg-chart .employee').forEach(item=>{
    const show=event=>{
      document.querySelectorAll('#seatPerformanceDashboardPage .sd-under-svg-chart .employee.is-hover').forEach(node=>{if(node!==item)node.classList.remove('is-hover')});
      item.classList.add('is-hover');
      tooltip.innerHTML='<strong>'+item.dataset.name+'（'+item.dataset.group+'）</strong>'+metricRows.map(metric=>'<p><i style="background:'+metric[3]+'"></i><span>'+metric[1]+'</span><b>'+item.dataset[metric[0]]+' '+metric[2]+'</b></p>').join('');
      tooltip.style.display='block';
      const width=tooltip.offsetWidth||230,height=tooltip.offsetHeight||170;
      tooltip.style.left=Math.max(12,Math.min(event.clientX+16,window.innerWidth-width-12))+'px';
      tooltip.style.top=Math.max(12,Math.min(event.clientY-88,window.innerHeight-height-12))+'px';
    };
    item.onmouseenter=show;
    item.onmousemove=show;
    item.onmouseleave=hide;
  });
};

/* 报表配置联动最终绑定：必须位于全部历史兼容实现之后。 */
(()=>{
  sdTable=function(group){
    const rows=sdScheduleRank(group.a),calls=sdCallRank(group.a),honors=sdHonorCounts(),active=group.activeCount||0;
    const average=active?(group.p/active).toFixed(2)+' 批':'—';
    return '<div class="grp '+sdTag(group.g)+'"><b>▶ '+group.g+'</b><span>'+group.a.length+'人（休息 '+(group.a.length-active)+' 人）· 排程 '+group.p+' 批 · 通话 '+sdDur(group.c)+' · 试驾 '+group.drive+' 批 · 锁单 '+group.locked+' 台/单 · 人均排程 '+average+'</span></div><table><thead><tr><th>#</th><th>姓名</th><th>佳佳代码</th><th>排程量（批）</th><th>目标排程量(日)</th><th>完成度</th><th>组内排程排名</th><th>通话时长</th><th>组内通话排名</th><th>试驾量（批）</th><th>锁单量（台/单）</th><th>月累销冠王次数</th><th>月累劳模王次数</th><th>备注</th></tr></thead><tbody>'+rows.map((seat,index)=>{const honor=honors.get(seat.name)||{sales:0,worker:0};return '<tr><td>'+(index+1)+'</td><td><b>'+seat.name+'</b></td><td><em>'+seat.code+'</em></td><td class="pc">'+seat.p+'</td><td class="pc">'+(seat.targetConfigured?seat.eff:'未配置')+'</td><td>'+(seat.targetConfigured?seat.cp.toFixed(1)+'%':'—')+'</td><td>第 '+(index+1)+' 名</td><td class="call">'+(seat.c?sdDur(seat.c):'—')+'</td><td>第 '+(calls.indexOf(seat)+1)+' 名</td><td class="sd-drive">'+seat.drive+'</td><td class="sd-locked">'+seat.locked+'</td><td>'+honor.sales+' 次</td><td>'+honor.worker+' 次</td><td>'+(!seat.onDuty?'休息':'')+'</td></tr>';}).join('')+'</tbody></table>';
  };
  const underReportWithFinalQuality=renderSdUnderReport;
  renderSdUnderReport=function(){
    underReportWithFinalQuality();
    const root=document.querySelector('#seatPerformanceDashboardPage .sd');if(!root)return;
    const quality=sdUnderCalc(sdUnderF).quality;
    root.querySelectorAll('.sd-under-panel').forEach(panel=>{
      panel.querySelector('.sd-data-quality')?.remove();
      const filter=panel.querySelector('.sd-under-filter');
      if(filter)filter.insertAdjacentHTML('afterend',sdDataQualityNotice(quality,false));
    });
  };
  window.sdOpenDataQualityMapping=sdOpenDataQualityMapping;
  window.sdOpenTargetDataQuality=sdOpenTargetDataQuality;
  renderSeatPerformanceDashboard();
})();

/* 最终表格文案：累计荣誉统一按“劳模王、销冠王”顺序呈现。 */
const sdTableFinalCumulativeTerminology=sdTable;
sdTable=function(group){
  return sdTableFinalCumulativeTerminology(group)
    .replace('<th>月累销冠王次数</th><th>月累劳模王次数</th>','<th>累计劳模王次数</th><th>累计销冠王次数</th>')
    .replace(/<td>(\d+) 次<\/td><td>(\d+) 次<\/td><td>/g,'<td>$2 次</td><td>$1 次</td><td>');
};
const sdUnderReportWithDeliveryLabels=renderSdUnderReport;
renderSdUnderReport=function(){
  const result=sdUnderReportWithDeliveryLabels.apply(this,arguments);
  window.sdApplyDeliveryLabels?.();
  return result;
};
renderSeatPerformanceDashboard();

/* 员工维度报告 v2：依据《员工维度看板指标说明》重建，以图形化执行分析为主。 */
function sdEmployeeV2Defaults(){
  return {s:sdDays[0],sh:9,e:sdDays[6],eh:18,channel:'all',media:'all',platform:'all',vehicle:'all',group:'all',reflux:'all',underfilled:'all',keyword:''};
}
sdEmployeeDimensionF={...sdEmployeeV2Defaults(),...sdEmployeeDimensionF};
const sdEmployeeV2Rate=(a,b)=>b?(a/b*100):0;
const sdEmployeeV2Number=(value,unit)=>Number.isFinite(value)?value.toFixed(unit==='%'?1:0)+(unit||''):('—');
function sdEmployeeDimensionDataV2(){
  const f=sdEmployeeDimensionF,base=sdCalc({s:f.s,sh:+f.sh,e:f.e,eh:+f.eh});
  const keyword=(f.keyword||'').trim().toLowerCase();
  const rows=base.r.map((seat,index)=>{
    const task=Math.max(0,Math.round((seat.task||0)*1.45)+(index%3));
    const waiting=task?index%3:0,allocated=Math.max(0,task-waiting),reassigned=Math.min(allocated,index%4===0?2:index%3);
    const followTask=Math.min(allocated,Math.max(0,Math.round(allocated*(.36+(index%3)*.04))));
    const followDone=Math.min(followTask,Math.max(0,followTask-(index%5===0?1:0))),followPending=Math.max(0,followTask-followDone);
    const dueFirst=Math.min(task,Math.max(0,Math.round(task*(.7+(index%3)*.05))));
    const sameDay=Math.min(task,Math.max(0,Math.round(task*(.55+(index%4)*.05))));
    const timely20=Math.min(dueFirst,Math.max(0,Math.round(dueFirst*(.54+(index%3)*.04))));
    const timely30=Math.min(dueFirst,Math.max(timely20,Math.round(dueFirst*(.68+(index%3)*.04))));
    const calls=Math.max(task,Math.round((seat.c||0)/72)+task+(index%4));
    const connected=seat.c?Math.min(calls,Math.max(1,Math.round((seat.c||0)/115)+(index%3))):0;
    const effective30=Math.min(task,Math.max(0,Math.round(connected*.78))),effective60=Math.min(effective30,Math.round(connected*.59)),effective90=Math.min(effective60,Math.round(connected*.42));
    const intent=Math.min(task,Math.max(0,Math.round(task*(.26+(index%4)*.025))));
    const testLead=Math.min(intent,Math.max(0,Math.round(intent*.34))),scheduleLead=Math.min(intent,Math.max(testLead,Math.round(intent*.47)));
    const intentLead=Math.min(intent,Math.max(0,Math.round(intent*.28))),noAnswer=Math.max(0,Math.round(task*.12));
    const nurturing=Math.max(0,Math.round(task*.33)),dormant=Math.max(0,Math.round(task*.16)),lost=Math.max(0,Math.round(task*.1)),invalid=Math.max(0,Math.round(task*.07));
    const leads=Math.max(0,task),visit=Math.min(leads,Math.max(0,Math.round(leads*.24))),backendSchedule=Math.min(visit,Math.max(0,Math.round(leads*.17))),drive=Math.min(backendSchedule,Math.max(0,Math.round(leads*.12))),order=Math.min(drive,Math.max(0,Math.round(leads*.075))),locked=Math.min(order,Math.max(0,Math.round(leads*.05))),sales=Math.min(locked,Math.max(0,Math.round(leads*.035)));
    const rChannel=['官网R渠道','私域R渠道','活动R渠道'][index%3],media=['汽车媒体','搜索媒体','社交媒体'][index%3],platform=['H5落地页','小程序','官网'][index%3],vehicle=['N6','天籁','逍客'][index%3];
    return {...seat,task,waiting,allocated,reassigned,followTask,followDone,followPending,dueFirst,sameDay,timely20,timely30,calls,connected,effective30,effective60,effective90,intent,testLead,scheduleLead,intentLead,noAnswer,nurturing,dormant,lost,invalid,leads,visit,backendSchedule,drive,order,locked,sales,rChannel,media,platform,vehicle,reflux:index%5===0,underfilled:index%4===0};
  }).filter(row=>(f.group==='all'||row.g===f.group)&&(f.channel==='all'||row.rChannel===f.channel)&&(f.media==='all'||row.media===f.media)&&(f.platform==='all'||row.platform===f.platform)&&(f.vehicle==='all'||row.vehicle===f.vehicle)&&(f.reflux==='all'||String(row.reflux)===(f.reflux==='yes'?'true':'false'))&&(f.underfilled==='all'||String(row.underfilled)===(f.underfilled==='yes'?'true':'false'))&&(!keyword||[row.name,row.code,row.g].join(' ').toLowerCase().includes(keyword)));
  const fields=['task','waiting','allocated','reassigned','followTask','followDone','followPending','dueFirst','sameDay','timely20','timely30','calls','connected','effective30','effective60','effective90','intent','testLead','scheduleLead','intentLead','noAnswer','nurturing','dormant','lost','invalid','leads','visit','backendSchedule','drive','order','locked','sales'];
  const total=fields.reduce((sum,key)=>{sum[key]=rows.reduce((count,row)=>count+row[key],0);return sum;},{});
  return {rows,total,days:base.ds.length};
}
function sdEmployeeV2Options(values,current,allLabel){return '<option value="all">'+allLabel+'</option>'+values.map(value=>'<option value="'+value+'" '+(current===value?'selected':'')+'>'+value+'</option>').join('')}
function sdEmployeeV2Funnel(items){
  const max=Math.max(1,...items.map(item=>item.value));
  return '<div class="sd-emp-funnel">'+items.map((item,index)=>'<div class="sd-emp-funnel-step"><div class="sd-emp-funnel-label"><span>'+item.label+'</span><b>'+item.value+' '+item.unit+'</b></div><i style="width:'+Math.max(16,item.value/max*100)+'%"></i>'+(index<items.length-1?'<em>›</em>':'')+'</div>').join('')+'</div>';
}
function sdEmployeeV2ThresholdChart(total){
  const values=[{label:'30 秒',value:total.effective30,color:'#2f64b9'},{label:'60 秒',value:total.effective60,color:'#5d79a7'},{label:'90 秒',value:total.effective90,color:'#7f96b8'}],max=Math.max(1,...values.map(item=>item.value));
  return '<div class="sd-emp-thresholds">'+values.map(item=>'<div><span>'+item.label+'有效接通</span><strong>'+item.value+' <small>次</small></strong><i><b style="width:'+item.value/max*100+'%;background:'+item.color+'"></b></i><em>'+sdEmployeeV2Rate(item.value,total.calls).toFixed(1)+'%</em></div>').join('')+'</div>';
}
function sdEmployeeV2TopChart(rows){
  const list=[...rows].sort((a,b)=>b.scheduleLead-a.scheduleLead||b.connected-a.connected||a.name.localeCompare(b.name,'zh-CN')).slice(0,10),max=Math.max(1,...list.map(row=>row.scheduleLead));
  return '<div class="sd-emp-top-chart">'+list.map((row,index)=>'<div><span class="sd-emp-rank">'+(index<3?['🥇','🥈','🥉'][index]:index+1)+'</span><b>'+row.name+'</b><small>'+row.g+'</small><i><em style="width:'+row.scheduleLead/max*100+'%"></em></i><strong>'+row.scheduleLead+' <small>批</small></strong><span class="sd-emp-top-sub">接通 '+row.connected+' 次</span></div>').join('')+'</div>';
}
function sdEmployeeV2Segments(total){
  const items=[['培育中',total.nurturing,'#2f8066'],['休眠',total.dormant,'#8a7aa8'],['战败',total.lost,'#c67a3b'],['无效',total.invalid,'#9aa7b8']],sum=Math.max(1,items.reduce((n,item)=>n+item[1],0));
  return '<div class="sd-emp-segment-bar">'+items.map(item=>'<div style="width:'+(item[1]/sum*100)+'%;background:'+item[2]+'" title="'+item[0]+' '+item[1]+' 条"></div>').join('')+'</div><div class="sd-emp-segment-legend">'+items.map(item=>'<span><i style="background:'+item[2]+'"></i>'+item[0]+' <b>'+item[1]+'</b></span>').join('')+'</div>';
}
function sdEmployeeV2Reset(){sdEmployeeDimensionF=sdEmployeeV2Defaults();renderSeatPerformanceDashboard()}
sdApplyEmployeeDimensionFilter=function(){
  const get=id=>document.getElementById(id)?.value||'';
  const next={s:get('sdEmpStart'),sh:+get('sdEmpStartHour'),e:get('sdEmpEnd'),eh:+get('sdEmpEndHour'),channel:get('sdEmpChannel'),media:get('sdEmpMedia'),platform:get('sdEmpPlatform'),vehicle:get('sdEmpVehicle'),group:get('sdEmpGroup'),reflux:get('sdEmpReflux'),underfilled:get('sdEmpUnderfilled'),keyword:get('sdEmpKeyword')};
  if(!next.s||!next.e||next.s>next.e||(next.s===next.e&&next.sh>next.eh)){alert('结束时间不能早于开始时间');return;}
  sdEmployeeDimensionF=next;renderSeatPerformanceDashboard();
};
window.sdApplyEmployeeDimensionFilter=sdApplyEmployeeDimensionFilter;window.sdEmployeeV2Reset=sdEmployeeV2Reset;
renderSdEmployeeDimensionReport=function(){
  const root=document.querySelector('#seatPerformanceDashboardPage .sd');if(!root)return;
  const header=root.querySelector('header'),f=sdEmployeeDimensionF,data=sdEmployeeDimensionDataV2(),total=data.total,rows=data.rows;
  if(header){header.querySelector('h1').textContent='员工维度报告';header.querySelector('p').innerHTML='聚焦员工任务承接、跟进质量、客户分层与后端转化。任务与话单指标按筛选条件实时计算；后端转化为 <b>T+1</b> 数据。';}
  root.querySelectorAll('.sd-employee-report').forEach(node=>node.remove());
  const rate=(a,b)=>sdEmployeeV2Rate(a,b).toFixed(1)+'%';
  const activeRows=rows.filter(row=>row.task>0),avgCall=total.connected?Math.round(rows.reduce((sum,row)=>sum+row.c,0)/Math.max(1,total.connected)):0;
  const filters='<div class="sd-emp-filters"><div class="sd-emp-filter-grid"><label>开始日期<select id="sdEmpStart">'+sdDays.map(day=>'<option value="'+day+'" '+(f.s===day?'selected':'')+'>'+day+'</option>').join('')+'</select></label><label>开始小时<select id="sdEmpStartHour">'+[...Array(24).keys()].map(hour=>'<option value="'+hour+'" '+(+f.sh===hour?'selected':'')+'>'+String(hour).padStart(2,'0')+'点</option>').join('')+'</select></label><label>结束日期<select id="sdEmpEnd">'+sdDays.map(day=>'<option value="'+day+'" '+(f.e===day?'selected':'')+'>'+day+'</option>').join('')+'</select></label><label>结束小时<select id="sdEmpEndHour">'+[...Array(24).keys()].map(hour=>'<option value="'+hour+'" '+(+f.eh===hour?'selected':'')+'>'+String(hour).padStart(2,'0')+'点</option>').join('')+'</select></label><label>R 渠道<select id="sdEmpChannel">'+sdEmployeeV2Options(['官网R渠道','私域R渠道','活动R渠道'],f.channel,'全部 R 渠道')+'</select></label><label>媒体名称<select id="sdEmpMedia">'+sdEmployeeV2Options(['汽车媒体','搜索媒体','社交媒体'],f.media,'全部媒体')+'</select></label><label>落地平台<select id="sdEmpPlatform">'+sdEmployeeV2Options(['H5落地页','小程序','官网'],f.platform,'全部平台')+'</select></label><label>车系<select id="sdEmpVehicle">'+sdEmployeeV2Options(['N6','天籁','逍客'],f.vehicle,'全部车系')+'</select></label><label>小组<select id="sdEmpGroup">'+sdEmployeeV2Options(['A组','B组','C组'],f.group,'全部小组')+'</select></label><label>是否回流线索<select id="sdEmpReflux">'+sdEmployeeV2Options(['yes','no'],f.reflux,'全部') .replace('>yes<','>是<').replace('>no<','>否<')+'</select></label><label>是否留资未满<select id="sdEmpUnderfilled">'+sdEmployeeV2Options(['yes','no'],f.underfilled,'全部') .replace('>yes<','>是<').replace('>no<','>否<')+'</select></label><label class="sd-emp-search">坐席<input id="sdEmpKeyword" value="'+sdConfigEsc(f.keyword||'')+'" placeholder="坐席名称或佳佳代码"></label></div><div class="sd-emp-filter-actions"><button class="primary" type="button" onclick="sdApplyEmployeeDimensionFilter()">应用筛选</button><button type="button" onclick="sdEmployeeV2Reset()">重置</button><span>当前范围：'+f.s+' '+String(f.sh).padStart(2,'0')+'点 ～ '+f.e+' '+String(f.eh).padStart(2,'0')+'点 · 覆盖 '+data.days+' 天 · '+rows.length+' 名员工</span></div></div>';
  const section='<section class="sd-employee-report sd-employee-v2">'+filters+'<div class="sd-emp-meta"><b>指标范围：</b><span>A 任务</span><span>B 话单</span><span>C / D / E 有效接通阈值</span><span>F 后端转化（T+1）</span><button type="button" onclick="this.parentElement.nextElementSibling.hidden=!this.parentElement.nextElementSibling.hidden">查看口径说明</button></div><div class="sd-emp-rules" hidden><b>口径要点：</b>任务类按任务编码去重；通话类按通话 ID 去重；30 / 60 / 90 秒有效接通分别按对应阈值计算；后端到店、试驾、订单、锁单、成交均按总部培育线索 ID 去重，并以线索量为共同分母。</div><div class="sd-emp-kpis"><div><small>外呼任务量</small><b>'+total.task+'<i>条</i></b><span>任务编码去重</span></div><div><small>已分配任务量</small><b>'+total.allocated+'<i>条</i></b><span>含被终止任务</span></div><div><small>待分配任务量</small><b>'+total.waiting+'<i>条</i></b><span>待进入员工任务池</span></div><div><small>通话接通率</small><b>'+rate(total.connected,total.calls)+'</b><span>'+total.connected+' 次接通 / '+total.calls+' 次外呼</span></div><div><small>30 秒有效外呼率</small><b>'+rate(total.effective30,total.task)+'</b><span>分母为外呼任务量</span></div><div class="t1"><small>线索锁单率</small><b>'+rate(total.locked,total.leads)+'</b><span>T+1 · 锁单 '+total.locked+' 条</span></div></div><div class="sd-emp-grid two"><div class="sd-emp-card"><div class="sd-emp-card-head"><div><h3>一、任务承接与继续跟进</h3><p>按任务编码去重；二次分配以最新分配坐席为准。</p></div><b class="sd-emp-pill">指标 A</b></div>'+sdEmployeeV2Funnel([{label:'外呼任务',value:total.task,unit:'条'},{label:'已分配',value:total.allocated,unit:'条'},{label:'继续跟进',value:total.followTask,unit:'条'},{label:'已处理',value:total.followDone,unit:'条'},{label:'下发试驾排程',value:total.scheduleLead,unit:'批'}])+'<div class="sd-emp-stat-pairs"><span>二次分配 <b>'+total.reassigned+' 条</b></span><span>继续跟进待处理 <b>'+total.followPending+' 条</b></span><span>继续跟进完成率 <b>'+rate(total.followDone,total.followTask)+'</b></span><span>平均跟进次数 <b>'+(total.calls/Math.max(1,total.allocated)).toFixed(1)+' 次</b></span></div></div><div class="sd-emp-card"><div class="sd-emp-card-head"><div><h3>二、首触时效与通话质量</h3><p>首触应在工作日 9:00–12:00、13:30–17:00；均含边界。</p></div><b class="sd-emp-pill">A / B / CDE</b></div><div class="sd-emp-first-touch"><div class="sd-emp-ring" style="--p:'+sdEmployeeV2Rate(total.timely30,total.dueFirst).toFixed(1)+'"><b>'+rate(total.timely30,total.dueFirst)+'</b><span>30 分钟及时率</span></div><div><p><b>应首触量</b><strong>'+total.dueFirst+' 条</strong></p><p><b>当日跟进率</b><strong>'+rate(total.sameDay,total.task)+'</strong></p><p><b>20 分钟及时首触</b><strong>'+total.timely20+' 条 · '+rate(total.timely20,total.dueFirst)+'</strong></p><p><b>当日未跟进</b><strong>'+Math.max(0,total.task-total.sameDay)+' 条</strong></p></div></div>'+sdEmployeeV2ThresholdChart(total)+'<div class="sd-emp-call-foot">已接通电话平均通话时长 <b>'+sdDur(avgCall)+'</b>　·　人日均接通时长 <b>'+sdDur(rows.reduce((sum,row)=>sum+row.c,0)/Math.max(1,activeRows.length*data.days))+'</b>　·　接通任务率 <b>'+rate(total.connected,total.task)+'</b></div></div></div><div class="sd-emp-grid two"><div class="sd-emp-card"><div class="sd-emp-card-head"><div><h3>三、客户分层与下发结构</h3><p>最新回访结果取最新一条记录；任务按任务编码去重。</p></div><b class="sd-emp-pill">指标 A</b></div>'+sdEmployeeV2Segments(total)+'<div class="sd-emp-dispatch"><div><small>意向客户</small><b>'+total.intent+' 条</b><span>占比 '+rate(total.intent,total.task)+'</span></div><div><small>试驾线索下发</small><b>'+total.testLead+' 批</b><span>下发日期统计</span></div><div><small>试驾排程下发</small><b>'+total.scheduleLead+' 批</b><span>下发日期统计</span></div><div><small>意向线索下发</small><b>'+total.intentLead+' 批</b><span>转化率 '+rate(total.intentLead,total.task)+'</span></div><div><small>无人接听下发</small><b>'+total.noAnswer+' 批</b><span>下发日期统计</span></div></div></div><div class="sd-emp-card"><div class="sd-emp-card-head"><div><h3>四、后端转化阶梯</h3><p>人工回访过的线索，按总部培育线索 ID 去重。</p></div><b class="sd-emp-pill t1">指标 F · T+1</b></div>'+sdEmployeeV2Funnel([{label:'线索量',value:total.leads,unit:'条'},{label:'到店',value:total.visit,unit:'条'},{label:'试驾排程',value:total.backendSchedule,unit:'条'},{label:'已试驾',value:total.drive,unit:'条'},{label:'订单',value:total.order,unit:'条'},{label:'锁单',value:total.locked,unit:'条'},{label:'成交',value:total.sales,unit:'条'}])+'<div class="sd-emp-rate-row"><span>到店率 <b>'+rate(total.visit,total.leads)+'</b></span><span>试驾率 <b>'+rate(total.drive,total.leads)+'</b></span><span>订单率 <b>'+rate(total.order,total.leads)+'</b></span><span>成交率 <b>'+rate(total.sales,total.leads)+'</b></span></div></div></div><div class="sd-emp-card sd-emp-rank-card"><div class="sd-emp-card-head"><div><h3>五、员工试驾排程效能 TOP 10</h3><p>按试驾排程下发量降序；并列时依次按有效接通次数、员工姓名排序。</p></div><b class="sd-emp-pill">员工对比</b></div>'+sdEmployeeV2TopChart(rows)+'</div><details class="sd-emp-detail"><summary>查看员工执行明细（'+rows.length+' 人）</summary><div><table><thead><tr><th>员工</th><th>小组</th><th>外呼任务</th><th>当日跟进率</th><th>30 秒有效外呼率</th><th>平均单次接通</th><th>意向客户</th><th>试驾排程下发</th><th>锁单（T+1）</th><th>成交（T+1）</th></tr></thead><tbody>'+(rows.length?[...rows].sort((a,b)=>b.task-a.task||a.name.localeCompare(b.name,'zh-CN')).map(row=>'<tr><td><b>'+row.name+'</b></td><td>'+row.g+'</td><td>'+row.task+'</td><td>'+rate(row.sameDay,row.task)+'</td><td>'+rate(row.effective30,row.task)+'</td><td>'+sdDur(row.connected?Math.round(row.c/row.connected):0)+'</td><td>'+row.intent+'</td><td>'+row.scheduleLead+'</td><td>'+row.locked+'</td><td>'+row.sales+'</td></tr>').join(''):'<tr><td colspan="10" class="sd-emp-empty">当前筛选条件下暂无可展示数据</td></tr>')+'</tbody></table></div></details><div class="sd-emp-check"><b>数据对账：</b><span>外呼任务量 = 已分配任务量 + 待分配任务量</span><span>继续跟进已处理量 + 待处理量 = 继续跟进任务量</span><span>后端各转化率分母均为线索量</span></div></section>';
  const nav=root.querySelector('.sd-report-tabs');if(nav)nav.insertAdjacentHTML('afterend',section);else root.insertAdjacentHTML('beforeend',section);
  if(!document.getElementById('sd-employee-v2-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-employee-v2-css">#seatPerformanceDashboardPage .sd-employee-v2{margin-top:18px;padding:22px 26px;border:1px solid #e4eaf2;border-radius:16px;background:#fff;box-shadow:0 8px 26px rgba(37,56,88,.055);color:#43536b}#seatPerformanceDashboardPage .sd-emp-filters{padding:15px 16px;border:1px solid #dce7f5;border-radius:12px;background:linear-gradient(100deg,#f9fbff,#f4f8fd)}#seatPerformanceDashboardPage .sd-emp-filter-grid{display:grid;grid-template-columns:repeat(6,minmax(120px,1fr));gap:10px}#seatPerformanceDashboardPage .sd-emp-filter-grid label{display:grid;gap:5px;color:#62728a;font-size:12px;font-weight:700}#seatPerformanceDashboardPage .sd-emp-filter-grid select,#seatPerformanceDashboardPage .sd-emp-filter-grid input{width:100%;height:33px;padding:0 9px;border:1px solid #cbd8ea;border-radius:6px;background:#fff;color:#43536b;font:13px "Microsoft YaHei"}#seatPerformanceDashboardPage .sd-emp-filter-actions{display:flex;align-items:center;gap:8px;margin-top:12px}#seatPerformanceDashboardPage .sd-emp-filter-actions button,#seatPerformanceDashboardPage .sd-emp-meta button{height:32px;padding:0 14px;border:1px solid #cbd8ea;border-radius:6px;background:#fff;color:#47627f;font:700 12px "Microsoft YaHei";cursor:pointer}#seatPerformanceDashboardPage .sd-emp-filter-actions .primary{border-color:#2f64b9;background:#2f64b9;color:#fff}#seatPerformanceDashboardPage .sd-emp-filter-actions span{margin-left:auto;color:#6680a0;font-size:12px}#seatPerformanceDashboardPage .sd-emp-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:14px 0 0;padding:10px 12px;border-radius:8px;background:#f8fafc;color:#718198;font-size:12px}#seatPerformanceDashboardPage .sd-emp-meta b{color:#315f9f}#seatPerformanceDashboardPage .sd-emp-meta span{padding:3px 7px;border-radius:4px;background:#eef4fc;color:#55708e;font-weight:700}#seatPerformanceDashboardPage .sd-emp-meta button{height:27px;margin-left:auto;padding:0 8px;font-size:11px}#seatPerformanceDashboardPage .sd-emp-rules{margin-top:8px;padding:10px 12px;border:1px solid #d8e7f7;border-radius:8px;background:#f7fbff;color:#64748b;font-size:12px;line-height:1.65}#seatPerformanceDashboardPage .sd-emp-rules b{color:#315f9f}#seatPerformanceDashboardPage .sd-emp-kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin:16px 0}#seatPerformanceDashboardPage .sd-emp-kpis>div{min-height:108px;padding:15px;border:1px solid #e4ebf4;border-radius:10px;background:#fcfdff;box-shadow:inset 0 3px 0 #315f9f}#seatPerformanceDashboardPage .sd-emp-kpis>div:nth-child(2){box-shadow:inset 0 3px 0 #527daf}#seatPerformanceDashboardPage .sd-emp-kpis>div:nth-child(3){box-shadow:inset 0 3px 0 #7d8fa8}#seatPerformanceDashboardPage .sd-emp-kpis>div:nth-child(4){box-shadow:inset 0 3px 0 #2f8066}#seatPerformanceDashboardPage .sd-emp-kpis>div:nth-child(5){box-shadow:inset 0 3px 0 #6e63aa}#seatPerformanceDashboardPage .sd-emp-kpis>div.t1{box-shadow:inset 0 3px 0 #c67a3b}#seatPerformanceDashboardPage .sd-emp-kpis small,#seatPerformanceDashboardPage .sd-emp-kpis span{display:block;color:#78879a;font-size:12px}#seatPerformanceDashboardPage .sd-emp-kpis b{display:block;margin:7px 0 5px;color:#263a57;font-size:25px;line-height:1.1}#seatPerformanceDashboardPage .sd-emp-kpis i{margin-left:3px;color:#7a899d;font-size:12px;font-style:normal}#seatPerformanceDashboardPage .sd-emp-grid{display:grid;gap:14px;margin:14px 0}#seatPerformanceDashboardPage .sd-emp-grid.two{grid-template-columns:1fr 1fr}#seatPerformanceDashboardPage .sd-emp-card{overflow:hidden;border:1px solid #e3eaf3;border-radius:11px;background:#fff}#seatPerformanceDashboardPage .sd-emp-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:15px 16px;border-bottom:1px solid #e8eef5;background:#fbfcfe}#seatPerformanceDashboardPage .sd-emp-card-head h3{margin:0 0 5px;padding-left:9px;border-left:3px solid #2f64b9;color:#31415b;font-size:15px}#seatPerformanceDashboardPage .sd-emp-card-head p{margin:0;color:#8491a2;font-size:11px;line-height:1.55}#seatPerformanceDashboardPage .sd-emp-pill{flex:0 0 auto;padding:4px 7px;border-radius:5px;background:#edf4ff;color:#315f9f;font-size:11px}#seatPerformanceDashboardPage .sd-emp-pill.t1{background:#fff4e5;color:#ad6b1c}.sd-emp-funnel{display:flex;align-items:center;gap:4px;padding:18px 16px;overflow-x:auto}.sd-emp-funnel-step{position:relative;min-width:72px;flex:1}.sd-emp-funnel-label{display:flex;flex-direction:column;gap:3px;min-height:39px;color:#718198;font-size:11px}.sd-emp-funnel-label b{color:#31415b;font-size:14px}.sd-emp-funnel-step>i{display:block;min-width:16px;height:12px;border-radius:4px;background:linear-gradient(90deg,#315f9f,#80a6da)}.sd-emp-funnel-step>em{position:absolute;right:-1px;bottom:-19px;color:#aab6c6;font-size:22px;font-style:normal}.sd-emp-stat-pairs{display:grid;grid-template-columns:1fr 1fr;gap:0;border-top:1px solid #edf1f6}.sd-emp-stat-pairs span{padding:10px 14px;border-right:1px solid #edf1f6;border-bottom:1px solid #edf1f6;color:#718198;font-size:12px}.sd-emp-stat-pairs b{float:right;color:#31415b}.sd-emp-first-touch{display:grid;grid-template-columns:142px 1fr;gap:16px;align-items:center;padding:16px}.sd-emp-ring{display:grid;place-content:center;width:126px;height:126px;border-radius:50%;background:radial-gradient(circle at center,#fff 0 57%,transparent 58%),conic-gradient(#2f8066 calc(var(--p)*1%),#e8eef4 0)};text-align:center}.sd-emp-ring b{color:#2f8066;font-size:21px}.sd-emp-ring span{margin-top:3px;color:#7d8a9b;font-size:10px}.sd-emp-first-touch p{display:flex;justify-content:space-between;gap:12px;margin:7px 0;color:#718198;font-size:12px}.sd-emp-first-touch strong{color:#31415b}.sd-emp-thresholds{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:0 16px 15px}.sd-emp-thresholds>div{display:grid;gap:5px}.sd-emp-thresholds span{color:#718198;font-size:11px}.sd-emp-thresholds strong{color:#31415b;font-size:18px}.sd-emp-thresholds strong small{font-size:11px}.sd-emp-thresholds i{display:block;height:8px;overflow:hidden;border-radius:99px;background:#eaf0f6}.sd-emp-thresholds i b{display:block;height:100%;border-radius:inherit}.sd-emp-thresholds em{color:#75869b;font-size:11px;font-style:normal}.sd-emp-call-foot{margin:0 16px 16px;padding:10px 11px;border-radius:7px;background:#f7faff;color:#77879b;font-size:11px}.sd-emp-call-foot b{color:#315f9f}.sd-emp-segment-bar{display:flex;height:34px;margin:19px 16px 9px;overflow:hidden;border-radius:7px;background:#edf1f5}.sd-emp-segment-bar div{min-width:5px}.sd-emp-segment-legend{display:flex;flex-wrap:wrap;gap:10px;padding:0 16px 18px}.sd-emp-segment-legend span{display:flex;align-items:center;gap:5px;color:#718198;font-size:11px}.sd-emp-segment-legend i{width:8px;height:8px;border-radius:2px}.sd-emp-segment-legend b{color:#31415b}.sd-emp-dispatch{display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid #edf1f6}.sd-emp-dispatch>div{min-height:82px;padding:12px;border-right:1px solid #edf1f6}.sd-emp-dispatch small,.sd-emp-dispatch span{display:block;color:#7b899a;font-size:10px}.sd-emp-dispatch b{display:block;margin:6px 0 3px;color:#31415b;font-size:16px}.sd-emp-rate-row{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid #edf1f6}.sd-emp-rate-row span{padding:11px 13px;border-right:1px solid #edf1f6;color:#738198;font-size:11px}.sd-emp-rate-row b{float:right;color:#c67a3b}.sd-emp-rank-card{margin:14px 0}.sd-emp-top-chart{padding:10px 16px 16px}.sd-emp-top-chart>div{display:grid;grid-template-columns:28px 74px 38px minmax(100px,1fr) 60px 90px;gap:8px;align-items:center;min-height:31px;border-bottom:1px solid #f0f3f7;color:#4e607a;font-size:12px}.sd-emp-top-chart>div:last-child{border-bottom:0}.sd-emp-rank{font-size:12px}.sd-emp-top-chart b{color:#31415b}.sd-emp-top-chart small,.sd-emp-top-sub{color:#8390a1;font-size:11px}.sd-emp-top-chart i{display:block;height:8px;overflow:hidden;border-radius:99px;background:#edf2f7}.sd-emp-top-chart i em{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#315f9f,#6d94c7)}.sd-emp-top-chart strong{color:#2f64b9;text-align:right}.sd-emp-top-chart strong small{font-weight:400}.sd-emp-detail{margin:14px 0;border:1px solid #e3eaf3;border-radius:10px;background:#fff}.sd-emp-detail summary{padding:14px 16px;color:#315f9f;font-size:13px;font-weight:700;cursor:pointer}.sd-emp-detail>div{overflow:auto;border-top:1px solid #e8eef5}.sd-emp-detail table{width:100%;min-width:960px;border-collapse:collapse;font-size:12px}.sd-emp-detail th{padding:10px 8px;background:#f3f7fc;color:#60718a;white-space:nowrap}.sd-emp-detail td{padding:10px 8px;border-top:1px solid #edf1f6;text-align:center;color:#52647c}.sd-emp-empty{padding:28px!important;color:#8a97a9!important}.sd-emp-check{display:flex;gap:14px;flex-wrap:wrap;padding:11px 13px;border:1px dashed #d1ddeb;border-radius:8px;background:#fbfcfe;color:#718198;font-size:11px}.sd-emp-check b{color:#315f9f}.sd-emp-check span{padding-left:12px;border-left:1px solid #dfe7f0}@media(max-width:1250px){#seatPerformanceDashboardPage .sd-emp-filter-grid{grid-template-columns:repeat(4,minmax(130px,1fr))}#seatPerformanceDashboardPage .sd-emp-kpis{grid-template-columns:repeat(3,1fr)}}@media(max-width:860px){#seatPerformanceDashboardPage .sd-employee-v2{padding:16px 14px}#seatPerformanceDashboardPage .sd-emp-filter-grid{grid-template-columns:repeat(2,minmax(120px,1fr))}#seatPerformanceDashboardPage .sd-emp-grid.two{grid-template-columns:1fr}.sd-emp-dispatch{grid-template-columns:repeat(3,1fr)}}@media(max-width:560px){#seatPerformanceDashboardPage .sd-emp-filter-grid,#seatPerformanceDashboardPage .sd-emp-kpis{grid-template-columns:1fr}.sd-emp-filter-actions{align-items:stretch;flex-direction:column}.sd-emp-filter-actions span{margin-left:0}.sd-emp-meta button{margin-left:0}.sd-emp-first-touch{grid-template-columns:1fr;justify-items:center}.sd-emp-dispatch{grid-template-columns:1fr 1fr}.sd-emp-top-chart>div{grid-template-columns:24px 62px 30px minmax(70px,1fr) 52px}.sd-emp-top-sub{display:none}.sd-emp-check{flex-direction:column}.sd-emp-check span{padding-left:0;border-left:0}}</style>');
};

/* 员工维度报告：只呈现《员工维度看板指标说明》中的筛选维度及 A～F 指标，
   不复用业绩晾晒报告或留资未满报告的页面内容。 */
function sdEmployeeV3Rate(value,total){return total?(value/total*100).toFixed(1)+'%':'—';}
function sdEmployeeV3Title(title,source,description){
  return '<div class="sd-emp-card-head"><div><h3>'+title+'</h3><p>'+description+'</p></div><b class="sd-emp-pill '+(source==='指标 F · T+1'?'t1':'')+'">'+source+'</b></div>';
}
function sdEmployeeV3TaskBars(items){
  const max=Math.max(1,...items.map(item=>item.value));
  return '<div class="sd-emp-v3-bars">'+items.map(item=>'<div><span>'+item.label+'</span><i><em style="width:'+Math.max(item.value?8:0,item.value/max*100)+'%;background:'+item.color+'"></em></i><b>'+item.value+' 条</b></div>').join('')+'</div>';
}
function sdEmployeeV3DetailRows(rows){
  if(!rows.length)return '<tr><td colspan="11" class="sd-emp-empty">当前筛选条件下暂无员工数据</td></tr>';
  return [...rows].sort((a,b)=>b.task-a.task||a.name.localeCompare(b.name,'zh-CN')).map(row=>'<tr><td><b>'+sdConfigEsc(row.name)+'</b></td><td>'+sdConfigEsc(row.g)+'</td><td>'+row.task+'</td><td>'+row.allocated+'</td><td>'+row.followTask+'</td><td>'+sdEmployeeV3Rate(row.followDone,row.followTask)+'</td><td>'+sdEmployeeV3Rate(row.effective30,row.task)+'</td><td>'+row.intent+'</td><td>'+row.scheduleLead+'</td><td>'+row.locked+'</td><td>'+row.sales+'</td></tr>').join('');
}
renderSdEmployeeDimensionReport=function(){
  setTimeout(()=>{
    document.getElementById('sd-employee-conversion-flow-css')?.remove();
    document.head.insertAdjacentHTML('beforeend','<style id="sd-employee-conversion-flow-css">#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel{gap:26px!important;padding:20px 28px 24px!important;overflow-x:auto!important;scrollbar-color:#c4d0e2 transparent;scrollbar-width:thin}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel-step{box-sizing:border-box;min-width:140px!important;flex:1 0 140px!important;padding-right:2px}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel-label{min-height:44px!important}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel-step>i{min-width:44px!important;height:12px!important}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel-step>em{right:-18px!important;bottom:auto!important;top:49px!important;display:grid;place-items:center;width:18px;height:18px;color:#8da0b7;font-size:20px;line-height:1}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-rate-row{grid-template-columns:repeat(6,minmax(148px,1fr))!important;overflow-x:auto!important;scrollbar-color:#c4d0e2 transparent;scrollbar-width:thin}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-rate-row span{box-sizing:border-box;min-width:148px;padding:12px 14px;white-space:nowrap}@media(max-width:860px){#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel{padding-right:18px!important;padding-left:18px!important;gap:22px!important}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-funnel-step{min-width:132px!important;flex-basis:132px!important}}</style>');
    const filterCard=document.querySelector('#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-v3-section-title + .sd-emp-filters');
    if(filterCard)filterCard.style.marginTop='14px';
    document.querySelectorAll('#seatPerformanceDashboardPage .sd-employee-v3 > .sd-emp-card + .sd-emp-card').forEach(card=>{card.style.marginTop='14px';});
  },0);
  const root=document.querySelector('#seatPerformanceDashboardPage .sd');
  if(!root)return;
  /* 基础报表会先完成通用壳渲染；员工页签只保留页头、页签和自己的内容。 */
  root.querySelectorAll(':scope > aside,:scope > .major,:scope > .sd-under-panel,:scope > .sd-employee-report').forEach(node=>node.remove());
  const header=root.querySelector('header');
  if(header){
    header.querySelector('h1').textContent='员工维度报告';
    const intro=header.querySelector('p');
    intro.innerHTML='按日期、时段及 11 项筛选维度查看员工执行数据，任务、话单、有效接通与后端转化分别按对应口径统计。<br><b>使用说明：</b><br>• <b>查询范围</b>：支持查询近 1 年数据，单次查询时间跨度最长为 30 天；时段可按小时粒度筛选。<br>• <b>任务类（指标 A）</b>：按任务编码去重；已分配任务包含被终止任务。<br>• <b>话单与有效接通（指标 B / C / D / E）</b>：通话按通话 ID 去重；30 秒、60 秒、90 秒分别对应不同的有效接通阈值。<br>• <b>后端转化（指标 F）</b>：按总部培育线索 ID 去重，数据为 T+1 更新；所有比率的分母均为线索量。';
    delete intro.dataset.full;
    sdCompactReportIntro(root);
  }
  const f=sdEmployeeDimensionF,data=sdEmployeeDimensionDataV2(),total=data.total,rows=data.rows;
  const rate=(value,base)=>sdEmployeeV3Rate(value,base);
  const duration=seconds=>sdDur(Math.round(seconds||0));
  const avgConnected=total.connected?Math.round(rows.reduce((sum,row)=>sum+(row.c||0),0)/total.connected):0;
  const avgDailyConnected=rows.length&&data.days?Math.round(rows.reduce((sum,row)=>sum+(row.c||0),0)/(rows.length*data.days)):0;
  const filters='<div class="sd-emp-filters"><div class="sd-emp-filter-grid">'
    +'<label>开始日期<select id="sdEmpStart">'+sdDays.map(day=>'<option value="'+day+'" '+(f.s===day?'selected':'')+'>'+day+'</option>').join('')+'</select></label>'
    +'<label>开始小时<select id="sdEmpStartHour">'+[...Array(24).keys()].map(hour=>'<option value="'+hour+'" '+(+f.sh===hour?'selected':'')+'>'+String(hour).padStart(2,'0')+'点</option>').join('')+'</select></label>'
    +'<label>结束日期<select id="sdEmpEnd">'+sdDays.map(day=>'<option value="'+day+'" '+(f.e===day?'selected':'')+'>'+day+'</option>').join('')+'</select></label>'
    +'<label>结束小时<select id="sdEmpEndHour">'+[...Array(24).keys()].map(hour=>'<option value="'+hour+'" '+(+f.eh===hour?'selected':'')+'>'+String(hour).padStart(2,'0')+'点</option>').join('')+'</select></label>'
    +'<label>R 渠道<select id="sdEmpChannel">'+sdEmployeeV2Options(['官网R渠道','私域R渠道','活动R渠道'],f.channel,'全部 R 渠道')+'</select></label>'
    +'<label>媒体名称<select id="sdEmpMedia">'+sdEmployeeV2Options(['汽车媒体','搜索媒体','社交媒体'],f.media,'全部媒体')+'</select></label>'
    +'<label>落地平台<select id="sdEmpPlatform">'+sdEmployeeV2Options(['H5落地页','小程序','官网'],f.platform,'全部平台')+'</select></label>'
    +'<label>坐席 ID / 坐席名称<input id="sdEmpKeyword" value="'+sdConfigEsc(f.keyword||'')+'" placeholder="输入坐席 ID 或名称"></label>'
    +'<label>车系<select id="sdEmpVehicle">'+sdEmployeeV2Options(['N6','天籁','逍客'],f.vehicle,'全部车系')+'</select></label>'
    +'<label>小组<select id="sdEmpGroup">'+sdEmployeeV2Options(['A组','B组','C组'],f.group,'全部小组')+'</select></label>'
    +'<label>是否回流线索<select id="sdEmpReflux">'+sdEmployeeV2Options(['yes','no'],f.reflux,'全部').replace('>yes<','>是<').replace('>no<','>否<')+'</select></label>'
    +'<label>是否留资未满<select id="sdEmpUnderfilled">'+sdEmployeeV2Options(['yes','no'],f.underfilled,'全部').replace('>yes<','>是<').replace('>no<','>否<')+'</select></label>'
    +'</div><div class="sd-emp-filter-actions"><button class="primary" type="button" onclick="sdApplyEmployeeDimensionFilter()">应用筛选</button><button type="button" onclick="sdEmployeeV2Reset()">重置</button><span>当前范围：'+f.s+' '+String(f.sh).padStart(2,'0')+'点 ～ '+f.e+' '+String(f.eh).padStart(2,'0')+'点 · '+rows.length+' 名员工</span></div></div>';
  const section='<section class="sd-employee-report sd-employee-v3"><div class="sd-emp-v3-section-title">一、维度与筛选条件</div>'+filters
    +'<div class="sd-emp-v3-caption">本页仅展示员工维度－执行数据。任务类按任务编码去重，通话类按通话 ID 去重；30 / 60 / 90 秒有效接通按对应阈值统计，后端转化为 T+1 数据。</div>'
    +'<div class="sd-emp-grid two">'
      +'<section class="sd-emp-card">'+sdEmployeeV3Title('二、新增任务','指标 A','按任务编码去重；已分配任务包含被终止任务。')
        +sdEmployeeV3TaskBars([{label:'外呼任务量',value:total.task,color:'#315f9f'},{label:'已分配任务量',value:total.allocated,color:'#527daf'},{label:'待分配任务量',value:total.waiting,color:'#8a98aa'},{label:'二次分配任务量',value:total.reassigned,color:'#7f70b5'}])+'</section>'
      +'<section class="sd-emp-card">'+sdEmployeeV3Title('三、继续跟进任务','指标 A','最新回访结果为“下次回访”的任务；按任务编码去重。')
        +'<div class="sd-emp-first-touch"><div class="sd-emp-ring" style="--p:'+sdEmployeeV2Rate(total.followDone,total.followTask).toFixed(1)+'"><b>'+rate(total.followDone,total.followTask)+'</b><span>当日完成率</span></div><div><p><b>继续跟进任务量</b><strong>'+total.followTask+' 条</strong></p><p><b>已处理量</b><strong>'+total.followDone+' 条</strong></p><p><b>待处理量</b><strong>'+total.followPending+' 条</strong></p><p><b>平均跟进次数</b><strong>'+(total.calls/Math.max(1,total.allocated)).toFixed(1)+' 次</strong></p></div></div></section>'
    +'</div>'
    +'<div class="sd-emp-v3-section-title">四、过程指标</div>'
    +'<div class="sd-emp-grid two">'
      +'<section class="sd-emp-card">'+sdEmployeeV3Title('1. 首触时效','指标 A','应首触时段：工作日 9:00–12:00、13:30–17:00，均含边界。')
        +'<div class="sd-emp-first-touch"><div class="sd-emp-ring" style="--p:'+sdEmployeeV2Rate(total.timely30,total.dueFirst).toFixed(1)+'"><b>'+rate(total.timely30,total.dueFirst)+'</b><span>30 分钟及时率</span></div><div><p><b>应首触量</b><strong>'+total.dueFirst+' 条</strong></p><p><b>当日跟进任务量 / 率</b><strong>'+total.sameDay+' 条 · '+rate(total.sameDay,total.task)+'</strong></p><p><b>20 分钟及时首触量 / 率</b><strong>'+total.timely20+' 条 · '+rate(total.timely20,total.dueFirst)+'</strong></p><p><b>当日未跟进任务量</b><strong>'+Math.max(0,total.task-total.sameDay)+' 条</strong></p></div></div></section>'
      +'<section class="sd-emp-card">'+sdEmployeeV3Title('2. 通话指标','指标 B / C / D / E','通话按通话 ID 去重；接通任务按任务编码去重。')
        +'<div class="sd-emp-thresholds"><div><span>通话接通量 / 率</span><strong>'+total.connected+' <small>次</small></strong><em>'+rate(total.connected,total.calls)+'</em></div><div><span>平均单次接通时长</span><strong>'+duration(avgConnected)+'</strong><em>已接通电话</em></div><div><span>人日均接通时长</span><strong>'+duration(avgDailyConnected)+'</strong><em>坐席日均值</em></div></div>'
        +sdEmployeeV2ThresholdChart(total)
        +'<div class="sd-emp-call-foot">30 / 60 / 90 秒有效外呼率：<b>'+rate(total.effective30,total.task)+'</b>　/　<b>'+rate(total.effective60,total.task)+'</b>　/　<b>'+rate(total.effective90,total.task)+'</b>　·　接通任务量 / 率：<b>'+total.connected+' 条 / '+rate(total.connected,total.task)+'</b>　·　外呼次数 / 跟进频次：<b>'+total.calls+' 次 / '+(total.calls/Math.max(1,total.task)).toFixed(1)+' 次</b></div></section>'
    +'</div>'
    +'<section class="sd-emp-card">'+sdEmployeeV3Title('3. 客户分层与下发','指标 A','最新回访结果取最新一条回访记录；按任务编码去重。')
      +sdEmployeeV2Segments(total)
      +'<div class="sd-emp-dispatch"><div><small>意向客户量</small><b>'+total.intent+' 条</b><span>占比 '+rate(total.intent,total.task)+'</span></div><div><small>试驾线索下发量</small><b>'+total.testLead+' 条</b><span>按下发日期</span></div><div><small>试驾排程下发量</small><b>'+total.scheduleLead+' 条</b><span>按下发日期</span></div><div><small>意向线索下发量</small><b>'+total.intentLead+' 条</b><span>转化率 '+rate(total.intentLead,total.task)+'</span></div><div><small>无人接听下发量</small><b>'+total.noAnswer+' 条</b><span>按下发日期</span></div></div>'
      +'<div class="sd-emp-v3-statuses"><span>培育中 <b>'+total.nurturing+' 条</b></span><span>休眠 <b>'+total.dormant+' 条</b></span><span>战败 <b>'+total.lost+' 条</b></span><span>无效 <b>'+total.invalid+' 条</b></span></div></section>'
    +'<section class="sd-emp-card">'+sdEmployeeV3Title('五、后端转化','指标 F · T+1','人工回访过的线索按总部培育线索 ID 去重；所有比率的分母均为线索量。')
      +sdEmployeeV2Funnel([{label:'线索量',value:total.leads,unit:'条'},{label:'到店量',value:total.visit,unit:'条'},{label:'试驾排程量',value:total.backendSchedule,unit:'条'},{label:'试驾量',value:total.drive,unit:'条'},{label:'订单量',value:total.order,unit:'条'},{label:'锁单量',value:total.locked,unit:'条'},{label:'成交量',value:total.sales,unit:'条'}])
      +'<div class="sd-emp-rate-row"><span>线索到店率 <b>'+rate(total.visit,total.leads)+'</b></span><span>试驾排程率 <b>'+rate(total.backendSchedule,total.leads)+'</b></span><span>试驾率 <b>'+rate(total.drive,total.leads)+'</b></span><span>线索订单率 <b>'+rate(total.order,total.leads)+'</b></span><span>线索锁单率 <b>'+rate(total.locked,total.leads)+'</b></span><span>线索成交率 <b>'+rate(total.sales,total.leads)+'</b></span></div></section>'
    +'<details class="sd-emp-detail"><summary>查看员工执行明细（'+rows.length+' 人）</summary><div><table><thead><tr><th>员工</th><th>小组</th><th>外呼任务量</th><th>已分配任务量</th><th>继续跟进任务量</th><th>继续跟进完成率</th><th>30 秒有效外呼率</th><th>意向客户量</th><th>试驾排程下发量</th><th>锁单量</th><th>成交量</th></tr></thead><tbody>'+sdEmployeeV3DetailRows(rows)+'</tbody></table></div></details>'
    +'<div class="sd-emp-check"><b>对账关系：</b><span>外呼任务量 = 已分配任务量 + 待分配任务量</span><span>继续跟进已处理量 + 待处理量 = 继续跟进任务量</span><span>后端所有比率分母均为线索量</span></div>'
  +'</section>';
  const nav=root.querySelector('.sd-report-tabs');
  if(nav)nav.insertAdjacentHTML('afterend',section);else root.insertAdjacentHTML('beforeend',section);
  if(!document.getElementById('sd-employee-v3-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-employee-v3-css">#seatPerformanceDashboardPage .sd-employee-v3{margin-top:18px;padding:22px 26px;border:1px solid #e4eaf2;border-radius:16px;background:#fff;box-shadow:0 8px 26px rgba(37,56,88,.055);color:#43536b}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-v3-caption{margin:14px 0;padding:11px 13px;border:1px solid #dbe8f8;border-radius:8px;background:#f7faff;color:#61728c;font-size:12px;line-height:1.7}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-v3-section-title{margin:18px 0 0;padding:13px 15px;border-left:4px solid #2f64b9;border-radius:8px;background:#f7faff;color:#31415b;font-size:16px;font-weight:700}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-v3-bars{display:grid;gap:13px;padding:18px 16px}.sd-emp-v3-bars>div{display:grid;grid-template-columns:98px minmax(80px,1fr) 50px;gap:10px;align-items:center;color:#718198;font-size:12px}.sd-emp-v3-bars i{display:block;height:10px;overflow:hidden;border-radius:99px;background:#edf2f7}.sd-emp-v3-bars i em{display:block;height:100%;border-radius:inherit}.sd-emp-v3-bars b{color:#31415b;text-align:right}.sd-emp-v3-statuses{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #edf1f6}.sd-emp-v3-statuses span{padding:11px 14px;border-right:1px solid #edf1f6;color:#738198;font-size:12px}.sd-emp-v3-statuses b{float:right;color:#31415b}@media(max-width:860px){#seatPerformanceDashboardPage .sd-employee-v3{padding:16px 14px}.sd-emp-v3-statuses{grid-template-columns:1fr 1fr}}@media(max-width:560px){.sd-emp-v3-bars>div{grid-template-columns:84px minmax(60px,1fr) 44px}.sd-emp-v3-statuses{grid-template-columns:1fr}}</style>');
  if(!document.getElementById('sd-employee-v3-base-css'))document.head.insertAdjacentHTML('beforeend','<style id="sd-employee-v3-base-css">#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-filters{padding:15px 16px;border:1px solid #dce7f5;border-radius:12px;background:linear-gradient(100deg,#f9fbff,#f4f8fd)}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-filter-grid{display:grid;grid-template-columns:repeat(6,minmax(120px,1fr));gap:10px}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-filter-grid label{display:grid;gap:5px;color:#62728a;font-size:12px;font-weight:700}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-filter-grid select,#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-filter-grid input{width:100%;height:33px;padding:0 9px;border:1px solid #cbd8ea;border-radius:6px;background:#fff;color:#43536b;font:13px "Microsoft YaHei"}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-filter-actions{display:flex;align-items:center;gap:8px;margin-top:12px}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-filter-actions button{height:32px;padding:0 14px;border:1px solid #cbd8ea;border-radius:6px;background:#fff;color:#47627f;font:700 12px "Microsoft YaHei";cursor:pointer}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-filter-actions .primary{border-color:#2f64b9;background:#2f64b9;color:#fff}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-filter-actions span{margin-left:auto;color:#6680a0;font-size:12px}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-grid{display:grid;gap:14px;margin:14px 0}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-grid.two{grid-template-columns:1fr 1fr}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-card{overflow:hidden;border:1px solid #e3eaf3;border-radius:11px;background:#fff}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:15px 16px;border-bottom:1px solid #e8eef5;background:#fbfcfe}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-card-head h3{margin:0 0 5px;padding-left:9px;border-left:3px solid #2f64b9;color:#31415b;font-size:15px}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-card-head p{margin:0;color:#8491a2;font-size:11px;line-height:1.55}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-pill{flex:0 0 auto;padding:4px 7px;border-radius:5px;background:#edf4ff;color:#315f9f;font-size:11px}.sd-employee-v3 .sd-emp-pill.t1{background:#fff4e5;color:#ad6b1c}.sd-employee-v3 .sd-emp-first-touch{display:grid;grid-template-columns:142px 1fr;gap:16px;align-items:center;padding:16px}.sd-employee-v3 .sd-emp-ring{display:grid;place-content:center;width:126px;height:126px;border-radius:50%;background:radial-gradient(circle at center,#fff 0 57%,transparent 58%),conic-gradient(#2f8066 calc(var(--p)*1%),#e8eef4 0);text-align:center}.sd-employee-v3 .sd-emp-ring b{color:#2f8066;font-size:21px}.sd-employee-v3 .sd-emp-ring span{margin-top:3px;color:#7d8a9b;font-size:10px}.sd-employee-v3 .sd-emp-first-touch p{display:flex;justify-content:space-between;gap:12px;margin:7px 0;color:#718198;font-size:12px}.sd-employee-v3 .sd-emp-first-touch strong{color:#31415b}.sd-employee-v3 .sd-emp-thresholds{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px}.sd-employee-v3 .sd-emp-thresholds>div{display:grid;gap:5px}.sd-employee-v3 .sd-emp-thresholds span{color:#718198;font-size:11px}.sd-employee-v3 .sd-emp-thresholds strong{color:#31415b;font-size:18px}.sd-employee-v3 .sd-emp-thresholds strong small{font-size:11px}.sd-employee-v3 .sd-emp-thresholds i{display:block;height:8px;overflow:hidden;border-radius:99px;background:#eaf0f6}.sd-employee-v3 .sd-emp-thresholds i b{display:block;height:100%;border-radius:inherit}.sd-employee-v3 .sd-emp-thresholds em{color:#75869b;font-size:11px;font-style:normal}.sd-employee-v3 .sd-emp-call-foot{margin:0 16px 16px;padding:10px 11px;border-radius:7px;background:#f7faff;color:#77879b;font-size:11px}.sd-employee-v3 .sd-emp-call-foot b{color:#315f9f}.sd-employee-v3 .sd-emp-segment-bar{display:flex;height:34px;margin:19px 16px 9px;overflow:hidden;border-radius:7px;background:#edf1f5}.sd-employee-v3 .sd-emp-segment-bar div{min-width:5px}.sd-employee-v3 .sd-emp-segment-legend{display:flex;flex-wrap:wrap;gap:10px;padding:0 16px 18px}.sd-employee-v3 .sd-emp-segment-legend span{display:flex;align-items:center;gap:5px;color:#718198;font-size:11px}.sd-employee-v3 .sd-emp-segment-legend i{width:8px;height:8px;border-radius:2px}.sd-employee-v3 .sd-emp-segment-legend b{color:#31415b}.sd-employee-v3 .sd-emp-dispatch{display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid #edf1f6}.sd-employee-v3 .sd-emp-dispatch>div{min-height:82px;padding:12px;border-right:1px solid #edf1f6}.sd-employee-v3 .sd-emp-dispatch small,.sd-employee-v3 .sd-emp-dispatch span{display:block;color:#7b899a;font-size:10px}.sd-employee-v3 .sd-emp-dispatch b{display:block;margin:6px 0 3px;color:#31415b;font-size:16px}.sd-employee-v3 .sd-emp-funnel{display:flex;align-items:center;gap:4px;padding:18px 16px;overflow-x:auto}.sd-employee-v3 .sd-emp-funnel-step{position:relative;min-width:72px;flex:1}.sd-employee-v3 .sd-emp-funnel-label{display:flex;flex-direction:column;gap:3px;min-height:39px;color:#718198;font-size:11px}.sd-employee-v3 .sd-emp-funnel-label b{color:#31415b;font-size:14px}.sd-employee-v3 .sd-emp-funnel-step>i{display:block;min-width:16px;height:12px;border-radius:4px;background:linear-gradient(90deg,#315f9f,#80a6da)}.sd-employee-v3 .sd-emp-funnel-step>em{position:absolute;right:-1px;bottom:-19px;color:#aab6c6;font-size:22px;font-style:normal}.sd-employee-v3 .sd-emp-rate-row{display:grid;grid-template-columns:repeat(6,1fr);border-top:1px solid #edf1f6}.sd-employee-v3 .sd-emp-rate-row span{padding:11px 13px;border-right:1px solid #edf1f6;color:#738198;font-size:11px}.sd-employee-v3 .sd-emp-rate-row b{float:right;color:#c67a3b}.sd-employee-v3 .sd-emp-detail{margin:14px 0;border:1px solid #e3eaf3;border-radius:10px;background:#fff}.sd-employee-v3 .sd-emp-detail summary{padding:14px 16px;color:#315f9f;font-size:13px;font-weight:700;cursor:pointer}.sd-employee-v3 .sd-emp-detail>div{overflow:auto;border-top:1px solid #e8eef5}.sd-employee-v3 .sd-emp-detail table{width:100%;min-width:960px;border-collapse:collapse;font-size:12px}.sd-employee-v3 .sd-emp-detail th{padding:10px 8px;background:#f3f7fc;color:#60718a;white-space:nowrap}.sd-employee-v3 .sd-emp-detail td{padding:10px 8px;border-top:1px solid #edf1f6;text-align:center;color:#52647c}.sd-employee-v3 .sd-emp-empty{padding:28px!important;color:#8a97a9!important}.sd-employee-v3 .sd-emp-check{display:flex;gap:14px;flex-wrap:wrap;padding:11px 13px;border:1px dashed #d1ddeb;border-radius:8px;background:#fbfcfe;color:#718198;font-size:11px}.sd-employee-v3 .sd-emp-check b{color:#315f9f}.sd-employee-v3 .sd-emp-check span{padding-left:12px;border-left:1px solid #dfe7f0}@media(max-width:1250px){#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-filter-grid{grid-template-columns:repeat(4,minmax(130px,1fr))}}@media(max-width:860px){#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-filter-grid{grid-template-columns:repeat(2,minmax(120px,1fr))}#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-grid.two{grid-template-columns:1fr}.sd-employee-v3 .sd-emp-dispatch{grid-template-columns:repeat(3,1fr)}.sd-employee-v3 .sd-emp-rate-row{grid-template-columns:repeat(3,1fr)}}@media(max-width:560px){#seatPerformanceDashboardPage .sd-employee-v3 .sd-emp-filter-grid{grid-template-columns:1fr}.sd-employee-v3 .sd-emp-filter-actions{align-items:stretch;flex-direction:column}.sd-employee-v3 .sd-emp-filter-actions span{margin-left:0}.sd-employee-v3 .sd-emp-first-touch{grid-template-columns:1fr;justify-items:center}.sd-employee-v3 .sd-emp-dispatch{grid-template-columns:1fr 1fr}.sd-employee-v3 .sd-emp-rate-row{grid-template-columns:1fr 1fr}.sd-employee-v3 .sd-emp-check{flex-direction:column}.sd-employee-v3 .sd-emp-check span{padding-left:0;border-left:0}}</style>');
};
renderSeatPerformanceDashboard();
