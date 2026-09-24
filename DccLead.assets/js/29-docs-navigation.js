(() => {
  'use strict';
  // The document-center "new window" action opens the product prototype alone.
  if (new URLSearchParams(window.location.search).get('standalone') === '1') return;
  if (document.getElementById('dccDocsHeader')) return;
  const tabs = [
    ['versions', '版本日志', 'DccLead.assets/docs/DccLead_版本日志.html'],
    ['features', '功能清单', 'DccLead.assets/docs/DccLead_功能清单.html'],
    ['prototype', '产品原型', './DccLead.html'],
    ['manual', '功能文档', 'DccLead.assets/docs/DccLead_功能文档.html'],
    ['interaction', '交互流程图', 'DccLead.assets/docs/DccLead_交互流程图.html'],
    ['logic', '逻辑流程图', '']
  ];
  const logicUrl = 'https://www.processon.com/f/6a3100099b73415e9e4ecd14#%E4%B8%89%E6%97%A0%E5%BF%A7%E5%86%B7%E7%BA%BF%E7%B4%A2%E5%90%8C%E6%AD%A5DCC%E5%9F%B9%E8%82%B2';
  const header = document.createElement('header');
  header.id = 'dccDocsHeader';
  header.className = 'dcc-docs-header';
  header.innerHTML = `<div class="dcc-docs-brand"><span class="dcc-docs-logo" aria-hidden="true">D</span><strong>DCC培育 · SaaS平台</strong></div>
    <nav class="dcc-docs-nav" aria-label="文档与产品导航">${tabs.map(([id, label]) => `<a class="dcc-docs-tab" data-docs-tab="${id}" href="#dcc-${id}">${label}</a>`).join('')}</nav>
    <div class="dcc-docs-tools"><button class="dcc-docs-tool dcc-docs-refresh" type="button" title="重新加载当前内容">↻ 刷新内容</button><a class="dcc-docs-tool" id="dccDocsNewWindow" target="_blank" rel="noopener" href="./DccLead.html" title="在新窗口打开当前内容">↗ 新窗口</a></div>`;
  const view = document.createElement('section');
  view.className = 'dcc-docs-view';
  view.hidden = true;
  view.setAttribute('aria-label', '文档内容');
  const logic = document.createElement('div');
  logic.className = 'dcc-docs-logic';
  logic.hidden = true;
  logic.innerHTML = `<h2>三无忧</h2><a href="${logicUrl}" target="_blank" rel="noopener">三无忧冷线索同步DCC培育<small>ProcessOn · 逻辑流程图 ↗</small></a>`;
  view.append(logic);
  document.body.prepend(header, view);
  document.body.classList.add('dcc-docs-ready');
  const resize = () => document.documentElement.style.setProperty('--dcc-docs-header-height', `${header.getBoundingClientRect().height}px`);
  new ResizeObserver(resize).observe(header);
  resize();
  const frames = new Map();
  let current = 'versions';
  let prototypeScroll = 0;
  function select(id) {
    const entry = tabs.find(tab => tab[0] === id) || tabs[2];
    const [key, label, path] = entry;
    if (current === 'prototype' && key !== 'prototype') prototypeScroll = window.scrollY;
    current = key;
    header.querySelectorAll('[data-docs-tab]').forEach(link => {
      if (link.dataset.docsTab === key) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    view.hidden = key === 'prototype';
    document.body.classList.toggle('dcc-docs-viewing', key !== 'prototype');
    frames.forEach(frame => { frame.hidden = true; });
    logic.hidden = key !== 'logic';
    const refresh = header.querySelector('.dcc-docs-refresh');
    refresh.disabled = key === 'logic';
    refresh.title = key === 'logic' ? '逻辑流程图为内置链接，无需刷新' : '重新加载当前内容';
    header.querySelector('#dccDocsNewWindow').href = key === 'logic'
      ? logicUrl
      : (key === 'prototype' ? './DccLead.html?standalone=1' : path);
    if (key === 'prototype') { window.scrollTo(0, prototypeScroll); return; }
    if (key === 'logic') return;
    if (!frames.has(key)) {
      const frame = document.createElement('iframe');
      frame.className = 'dcc-docs-frame';
      frame.title = label;
      frame.src = path;
      view.append(frame);
      frames.set(key, frame);
    }
    frames.get(key).hidden = false;
  }
  // 文档中心默认从版本日志进入；显式锚点仍可切换至任一文档或产品原型。
  const fromHash = () => select(location.hash.startsWith('#dcc-') ? location.hash.slice(5) : 'versions');
  header.querySelector('.dcc-docs-nav').addEventListener('click', event => {
    const link = event.target.closest('[data-docs-tab]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const hash = `#dcc-${link.dataset.docsTab}`;
    if (location.hash !== hash) history.pushState(null, '', hash);
    select(link.dataset.docsTab);
  });
  header.querySelector('.dcc-docs-refresh').addEventListener('click', () => {
    if (current === 'prototype') { location.reload(); return; }
    if (current === 'logic') { select('logic'); return; }
    const url = new URL(tabs.find(tab => tab[0] === current)[2], location.href);
    url.searchParams.set('_refresh', Date.now());
    frames.get(current).src = url.href;
  });
  window.addEventListener('popstate', fromHash);
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
