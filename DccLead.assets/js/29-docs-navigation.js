(() => {
  'use strict';
  // The document-center "new window" action opens the product prototype alone.
  if (new URLSearchParams(window.location.search).get('standalone') === '1') return;
  if (document.getElementById('dccDocsHeader')) return;
  const tabs = [
    ['prototype', '产品原型', './DccLead.html'],
    ['requirements', '需求说明', 'DccLead.assets/docs/需求说明/index.html?v=20261103-prototype-entry'],
    ['blueprint', '系统蓝图', 'DccLead.assets/docs/核心文档/DccLead_系统蓝图.html?v=20261026-v29-integrated'],
    ['manual', '功能文档', 'DccLead.assets/docs/核心文档/DccLead_功能文档.html?v=20261102-acceptance'],
    ['interaction', '页面交互图', 'DccLead.assets/docs/核心文档/DccLead_交互流程图.html?v=20261026-v29-integrated'],
    ['sequence', '业务流程图', 'DccLead.assets/docs/核心文档/DccLead_业务流程图.html?v=20261102-confirmed-closeout'],
    ['features', '功能点清单', 'DccLead.assets/docs/核心文档/DccLead_功能清单.html?v=20261030-v30'],
    ['versions', '版本号日志', 'DccLead.assets/docs/核心文档/DccLead_版本日志.html?v=20261030-v30']
  ];
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
  document.body.prepend(header, view);
  document.body.classList.add('dcc-docs-ready');
  const resize = () => document.documentElement.style.setProperty('--dcc-docs-header-height', `${header.getBoundingClientRect().height}px`);
  new ResizeObserver(resize).observe(header);
  resize();
  const frames = new Map();
  let current = 'prototype';
  let prototypeScroll = 0;
  function select(id) {
    const entry = tabs.find(tab => tab[0] === id) || tabs[0];
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
    const refresh = header.querySelector('.dcc-docs-refresh');
    refresh.disabled = false;
    refresh.title = '重新加载当前内容';
    header.querySelector('#dccDocsNewWindow').href = key === 'prototype' ? './DccLead.html?standalone=1' : path;
    if (key === 'prototype') { window.scrollTo(0, prototypeScroll); return; }
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
  // 每次重新打开或刷新入口文件都回到产品原型；当前会话内仍可切换其他文档。
  if (location.hash !== '#dcc-prototype') history.replaceState(null, '', '#dcc-prototype');
  const fromHash = () => select(location.hash.startsWith('#dcc-') ? location.hash.slice(5) : 'prototype');
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
    const url = new URL(tabs.find(tab => tab[0] === current)[2], location.href);
    url.searchParams.set('_refresh', Date.now());
    frames.get(current).src = url.href;
  });
  window.addEventListener('popstate', fromHash);
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
