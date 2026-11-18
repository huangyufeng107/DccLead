// 同文档锚点每次点击都重新定位，不能只依赖 URL 的 hashchange。
(() => {
  'use strict';
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download')) return;
    const targetWindow = link.getAttribute('target');
    if (targetWindow && targetWindow !== '_self') return;
    let url, id;
    try {
      url = new URL(link.getAttribute('href'), location.href);
      id = decodeURIComponent(url.hash.slice(1));
    } catch { return; }
    if (!id || url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === 'DETAILS') node.open = true;
    }
    const oldURL = location.href;
    if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    // 即使 hash 没变，也唤起各文档自己的页签、菜单、筛选和大纲定位逻辑。
    window.dispatchEvent(new HashChangeEvent('hashchange', {oldURL, newURL:location.href}));
    requestAnimationFrame(() => target.scrollIntoView({behavior:'instant', block:'start'}));
  });
})();
