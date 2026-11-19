(function () {
  const dialog = document.getElementById('flow-viewer');
  const viewport = dialog.querySelector('.flow-viewer-viewport');
  const canvas = dialog.querySelector('.flow-viewer-canvas');
  const title = document.getElementById('flow-viewer-title');
  const scaleLabel = document.getElementById('flow-viewer-scale');
  const zoomIn = dialog.querySelector('[data-viewer-action="in"]');
  const zoomOut = dialog.querySelector('[data-viewer-action="out"]');
  const minScale = 0.02;
  const maxScale = 3;
  let active;
  let drag;
  let dragged = false;
  let enteredFullscreen = false;

  function setScale(scale, center = false) {
    const before = canvas.getBoundingClientRect();
    const frame = viewport.getBoundingClientRect();
    const x = frame.left + viewport.clientWidth / 2;
    const y = frame.top + viewport.clientHeight / 2;
    active.scale = Math.min(maxScale, Math.max(minScale, scale));
    canvas.style.width = active.width * active.scale + 'px';
    scaleLabel.value = Math.round(active.scale * 100) + '%';
    zoomIn.disabled = active.scale >= maxScale;
    zoomOut.disabled = active.scale <= minScale;
    if (center) {
      const after = canvas.getBoundingClientRect();
      const ratio = after.width / before.width;
      viewport.scrollLeft += after.left + (x - before.left) * ratio - x;
      viewport.scrollTop += after.top + (y - before.top) * ratio - y;
    } else {
      viewport.scrollTo(0, 0);
    }
  }

  function fit(whole) {
    const inset = 32; // Total padding around the canvas.
    const widthScale = (viewport.clientWidth - inset) / active.width;
    const heightScale = whole ? (viewport.clientHeight - inset) / active.height : 1;
    setScale(Math.min(1, widthScale, heightScale));
  }

  function close() {
    if (!active) return;
    const {svg, placeholder, trigger, originalScroll} = active;
    active = null;
    drag = null;
    enteredFullscreen = false;
    viewport.classList.remove('is-dragging');
    placeholder.replaceWith(svg);
    // Let the document handle links inside the restored SVG.
    dialog.close();
    svg.closest('.diagram-wrap').scrollLeft = originalScroll;
    if (document.fullscreenElement === dialog) {
      document.exitFullscreen().catch(() => {});
    }
    trigger.focus({preventScroll: true});
  }

  function open(svg, trigger, name) {
    const {width, height} = svg.viewBox.baseVal;
    const originalScroll = svg.closest('.diagram-wrap').scrollLeft;
    const placeholder = document.createElement('div');
    const bounds = svg.getBoundingClientRect();
    placeholder.style.width = bounds.width + 'px';
    placeholder.style.height = bounds.height + 'px';
    svg.replaceWith(placeholder);
    active = {svg, placeholder, trigger, width, height, scale: 1, originalScroll};
    dragged = false;
    title.textContent = name;
    canvas.append(svg);
    dialog.showModal();
    fit(false);
    if (document.fullscreenEnabled && dialog.requestFullscreen) {
      dialog.requestFullscreen().then(() => {
        if (active?.svg === svg) {
          enteredFullscreen = true;
          fit(false);
        } else if (document.fullscreenElement === dialog) {
          document.exitFullscreen().catch(() => {});
        }
      }).catch(() => {
        // The dialog still fills the document when native fullscreen is unavailable.
      });
    }
  }

  const refresh = new Map();
  const observer = new MutationObserver(records => {
    const changed = new Set(records.map(record => record.target.closest('.diagram-wrap')));
    changed.forEach(wrapper => refresh.get(wrapper)?.());
  });
  document.querySelectorAll('main .diagram-wrap').forEach(wrapper => {
    const section = wrapper.closest('.card');
    const name = section?.querySelector('summary, h2')?.textContent.trim() || '流程图';
    const toolbar = document.createElement('div');
    toolbar.className = 'flow-diagram-actions';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.textContent = '全屏查看';
    trigger.setAttribute('aria-label', '全屏查看：' + name);
    trigger.setAttribute('aria-haspopup', 'dialog');
    const graphic = () => wrapper.querySelector('svg[viewBox]');
    const updateButton = () => { trigger.disabled = !graphic(); };
    trigger.addEventListener('click', () => {
      const svg = graphic();
      if (svg) open(svg, trigger, name);
    });
    toolbar.append(trigger);
    wrapper.before(toolbar);
    updateButton();
    refresh.set(wrapper, updateButton);
    observer.observe(wrapper, {childList: true, subtree: true});
  });

  dialog.addEventListener('click', event => {
    if (!active) return;
    const action = event.target.closest('[data-viewer-action]')?.dataset.viewerAction;
    if (action === 'out') setScale(active.scale / 1.25, true);
    if (action === 'in') setScale(active.scale * 1.25, true);
    if (action === 'fit') fit(true);
    if (action === 'actual') setScale(1, true);
    if (action === 'close' || event.target.closest('svg a')) close();
  });
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    close();
  });
  document.addEventListener('fullscreenchange', () => {
    if (enteredFullscreen && document.fullscreenElement !== dialog) close();
  });

  viewport.addEventListener('pointerdown', event => {
    dragged = false;
    if (event.button !== 0 || event.pointerType !== 'mouse' || !canvas.contains(event.target)) return;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY,
      left: viewport.scrollLeft, top: viewport.scrollTop};
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!dragged && Math.hypot(dx, dy) < 5) return;
    if (!dragged) {
      dragged = true;
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-dragging');
    }
    viewport.scrollTo(drag.left - dx, drag.top - dy);
    event.preventDefault();
  });
  function endDrag(event) {
    if (event.pointerId !== drag?.id) return;
    drag = null;
    viewport.classList.remove('is-dragging');
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', endDrag);
  viewport.addEventListener('pointerleave', event => {
    if (!dragged) endDrag(event);
  });
  viewport.addEventListener('click', event => {
    if (!dragged || !event.detail) return;
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  }, true);
})();
