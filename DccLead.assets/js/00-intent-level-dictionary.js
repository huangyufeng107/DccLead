/* 线索意向级别唯一数据源。页面范围、颜色及历史存值通过适配器保持兼容。 */
window.DccLeadIntent = (() => {
  const definitions = [
    ['H','高意向','#dc2626'], ['A','一周内买车','#ea580c'],
    ['B','计划三个月内买车','#d97706'], ['C','计划三个月后买车','#2563eb'],
    ['E','智能体级别','#6b7280'], ['F','战败','#9ca3af'],
    ['L','休眠','#64748b'], ['N','阶段性战败','#64748b']
  ];
  const items = definitions.map(([code,name,color],index)=>({code,name,color,order:(index+1)*10,status:'启用',refs:1,protected:true,description:'内置线索级别；引用于页面选项或联动规则。'}));
  const profiles = Object.freeze({
    dispatch:['H','A','B','C','F','L','N'], high:['H','A','B','C'],
    task:['H','A','B','C','E','F','L'], taskAudit:['H','A','B','C','E'], conversion:['H','A','B','C','E','F','L','N'],
    report:['H','A','B','C','L','F','Z','O','T','D']
  });
  const legacyValues = new Map(definitions.map(([code,name])=>[code,`${code} - ${code}(${name})`]));
  const codeOf = value => items.find(item=>item.code===value || legacyValues.get(item.code)===value)?.code || '';
  const codes = (profile='conversion') => (Array.isArray(profile)?profile:profiles[profile]||[]).filter(code=>{
    const item=items.find(row=>row.code===code);
    // 报表历史扩展编码的含义未核实，保持原项但不并入主字典。
    return item ? item.status==='启用' : profile==='report';
  });
  const legacy = code => legacyValues.get(code) || code;
  const display = (value,mode='legacy') => {
    const code=codeOf(value), item=items.find(row=>row.code===code);
    if (!item) return value;
    return mode==='code' ? code : `${code} - ${code}(${item.name})`;
  };
  const options = (profile='conversion') => codes(profile).map(code=>({value:code,label:code,color:items.find(item=>item.code===code)?.color||'#64748b'}));
  const values = profile => codes(profile).map(legacy);
  return Object.freeze({items,codes,codeOf,legacy,display,options,values});
})();
