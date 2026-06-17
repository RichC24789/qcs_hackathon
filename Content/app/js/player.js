/*
 * Animation player engine.
 * Turns an { title, durationSeconds, steps[], endFrame } topic into a timed,
 * captioned, icon-driven step sequence. CSS does the motion; this just sequences it.
 *
 * Frames:  intro (-1)  →  step 0..n-1  →  end (n)
 */
(function () {
  'use strict';

  var INTRO_MS = 4000;

  var el = {
    stage: document.getElementById('stage'),
    progress: document.getElementById('progressFill'),
    stepper: document.getElementById('stepper'),
    live: document.getElementById('live'),
    title: document.getElementById('topicTitle'),
    meta: document.getElementById('topicMeta'),
    play: document.getElementById('btnPlay'),
    prev: document.getElementById('btnPrev'),
    next: document.getElementById('btnNext'),
    replay: document.getElementById('btnReplay')
  };

  var state = {
    data: null,
    steps: [],
    index: -1,
    playing: false,
    elapsedInStep: 0,
    lastNow: 0,
    stepMs: 8000,
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  var rafId = null;

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function isIntro() { return state.index === -1; }
  function isEnd() { return state.index === state.steps.length; }
  function limitMs() { return isIntro() ? INTRO_MS : state.stepMs; }

  // ---------- card builders ----------
  function card(kind, inner) {
    var node = document.createElement('article');
    node.className = 'card card--' + kind;
    node.setAttribute('data-state', 'enter-right');
    node.innerHTML = inner;
    return node;
  }

  function iconBlock(step, number) {
    var ico = window.resolveStepIcon ? window.resolveStepIcon(step) : null;
    return '<div class="step-icon">' + (ico || '<span class="step-icon__num">' + number + '</span>') + '</div>';
  }

  function buildIntro() {
    var hero = (window.CARE_ICONS && window.CARE_ICONS.droplet) || '';
    return card('intro',
      '<div class="step-icon step-icon--hero">' + hero + '</div>' +
      '<h2 class="card__label">' + esc(state.data.title) + '</h2>' +
      '<p class="card__caption">' + state.steps.length + ' steps · about ' + state.data.durationSeconds + ' seconds</p>' +
      '<p class="card__hint">Starts automatically — or press play.</p>');
  }

  function buildStep(i) {
    var s = state.steps[i];
    return card('step',
      '<span class="card__count">Step ' + (i + 1) + ' of ' + state.steps.length + '</span>' +
      iconBlock(s, i + 1) +
      '<h2 class="card__label">' + esc(s.label) + '</h2>' +
      '<p class="card__caption">' + esc(s.caption) + '</p>');
  }

  function buildEnd() {
    var check = (window.CARE_ICONS && window.CARE_ICONS.check) || '';
    return card('end',
      '<div class="step-icon step-icon--hero">' + check + '</div>' +
      '<p class="card__caption card__caption--lead">' + esc(state.data.endFrame) + '</p>' +
      '<button class="card__cta" type="button" data-action="replay">Watch again</button>');
  }

  // ---------- rendering ----------
  function swapCard(node, direction) {
    var old = el.stage.querySelector('.card');
    el.stage.appendChild(node);

    if (state.reduced) {
      if (old) old.remove();
      node.setAttribute('data-state', 'active');
      return;
    }
    node.setAttribute('data-state', direction >= 0 ? 'enter-right' : 'enter-left');
    requestAnimationFrame(function () {
      node.setAttribute('data-state', 'active');
      if (old) {
        old.setAttribute('data-state', direction >= 0 ? 'exit-left' : 'exit-right');
        old.addEventListener('transitionend', function () { old.remove(); }, { once: true });
        setTimeout(function () { if (old.parentNode) old.remove(); }, 600);
      }
    });
  }

  function render(direction) {
    var node = isIntro() ? buildIntro() : isEnd() ? buildEnd() : buildStep(state.index);
    swapCard(node, direction || 1);
    updateStepper();
    updatePlayButton();
    if (isIntro()) el.live.textContent = '';
    else el.live.textContent = isEnd() ? state.data.endFrame : state.steps[state.index].label;
  }

  function setProgress(p) { el.progress.style.transform = 'scaleX(' + clamp(p, 0, 1) + ')'; }

  function buildStepper() {
    el.stepper.innerHTML = '';
    for (var i = 0; i < state.steps.length; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot';
      b.textContent = String(i + 1);
      b.setAttribute('data-step', String(i));
      b.setAttribute('aria-label', 'Go to step ' + (i + 1));
      el.stepper.appendChild(b);
    }
  }

  function updateStepper() {
    var dots = el.stepper.children;
    for (var i = 0; i < dots.length; i++) {
      var active = state.index === i;
      var done = state.index > i;
      dots[i].classList.toggle('is-active', active);
      dots[i].classList.toggle('is-done', done);
      if (active) dots[i].setAttribute('aria-current', 'step');
      else dots[i].removeAttribute('aria-current');
    }
  }

  function updatePlayButton() {
    var playing = state.playing && !isEnd();
    el.play.textContent = playing ? '❚❚' : '►';
    el.play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  // ---------- engine ----------
  function loop(now) {
    if (!state.playing) return;
    var dt = now - state.lastNow;
    state.lastNow = now;
    state.elapsedInStep += dt;
    setProgress(state.elapsedInStep / limitMs());

    if (state.elapsedInStep >= limitMs()) {
      if (isEnd()) { pause(); setProgress(1); return; }
      goTo(state.index + 1, true);
      if (isEnd()) { pause(); setProgress(1); return; } // reached the end frame → hold here
    }
    rafId = requestAnimationFrame(loop);
  }

  function goTo(index, fromAuto) {
    var next = clamp(index, -1, state.steps.length);
    var direction = next >= state.index ? 1 : -1;
    state.index = next;
    state.elapsedInStep = 0;
    state.lastNow = performance.now();
    if (!fromAuto) pause();
    render(direction);
    setProgress(isEnd() ? 1 : 0);
  }

  function play() {
    if (state.reduced) return;
    if (isEnd()) goTo(-1, true);
    state.playing = true;
    state.lastNow = performance.now();
    updatePlayButton();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function pause() {
    state.playing = false;
    cancelAnimationFrame(rafId);
    updatePlayButton();
  }

  function toggle() { state.playing && !isEnd() ? pause() : play(); }
  function replay() { goTo(-1, true); play(); }

  // ---------- reduced-motion: static stacked list ----------
  function renderStatic() {
    var html = '<div class="static">' +
      '<p class="card__count">' + state.steps.length + ' steps</p>';
    for (var i = 0; i < state.steps.length; i++) {
      var s = state.steps[i];
      html += '<div class="static-step">' +
        '<div class="static-step__icon">' + iconBlock(s, i + 1) + '</div>' +
        '<div><span class="static-step__num">Step ' + (i + 1) + '</span>' +
        '<h2 class="card__label">' + esc(s.label) + '</h2>' +
        '<p class="card__caption">' + esc(s.caption) + '</p></div></div>';
    }
    html += '<p class="static-end">' + esc(state.data.endFrame) + '</p></div>';
    el.stage.innerHTML = html;
  }

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ---------- wiring ----------
  function bind() {
    el.play.addEventListener('click', toggle);
    el.next.addEventListener('click', function () { goTo(state.index + 1, false); });
    el.prev.addEventListener('click', function () { goTo(state.index - 1, false); });
    el.replay.addEventListener('click', replay);

    el.stepper.addEventListener('click', function (e) {
      var dot = e.target.closest('.dot');
      if (dot) goTo(parseInt(dot.getAttribute('data-step'), 10), false);
    });

    el.stage.addEventListener('click', function (e) {
      if (e.target.closest('[data-action="replay"]')) replay();
    });

    document.addEventListener('keydown', function (e) {
      var k = e.key.toLowerCase();
      if (e.key === ' ' || k === 'k') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight') goTo(state.index + 1, false);
      else if (e.key === 'ArrowLeft') goTo(state.index - 1, false);
      else if (k === 'r') replay();
      else if (/^[1-9]$/.test(e.key)) {
        var i = parseInt(e.key, 10) - 1;
        if (i < state.steps.length) goTo(i, false);
      }
    });
  }

  async function init() {
    var key = new URLSearchParams(location.search).get('topic') || window.DEFAULT_TOPIC;
    var data;
    try {
      data = await window.loadTopic(key);
    } catch (err) {
      el.stage.innerHTML = '<div class="card card--error"><p class="card__caption">' + esc(err.message) + '</p></div>';
      return;
    }

    state.data = data;
    state.steps = data.steps || [];
    state.stepMs = clamp(Math.round((data.durationSeconds * 1000) / Math.max(1, state.steps.length)), 6000, 9000);

    el.title.textContent = data.title;
    el.meta.textContent = data.source ? 'Source: ' + data.source : '';
    document.title = 'Care animation — ' + data.title;

    buildStepper();
    bind();

    if (state.reduced) {
      document.body.classList.add('is-reduced');
      renderStatic();
      return;
    }

    goTo(-1, true);
    play();
  }

  init();
})();
