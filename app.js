/* RMLUR STORE — storefront logic (no build step, no framework) */
document.addEventListener('DOMContentLoaded', () => {
  const products = window.PRODUCTS || [];
  const hotspotMap = window.HERO_HOTSPOTS || {};

  const heroHotspots = document.getElementById('hero-hotspots');
  const tapeGrid = document.getElementById('tape-grid');
  const emptyState = document.getElementById('empty-state');
  const audio = document.getElementById('preview-audio');
  const playerBar = document.getElementById('player-bar');
  const pbPlay = document.getElementById('pb-play');
  const pbStop = document.getElementById('pb-stop');
  const pbTitle = document.getElementById('pb-title');
  const pbBuy = document.getElementById('pb-buy');
  const pbProgress = document.getElementById('pb-progress');
  const pbWave = document.getElementById('pb-wave');
  const waveCtx = pbWave ? pbWave.getContext('2d') : null;

  const hcCard = document.getElementById('hotspot-card');
  const hcClose = document.getElementById('hc-close');
  const hcType = document.getElementById('hc-type');
  const hcTitle = document.getElementById('hc-title');
  const hcSub = document.getElementById('hc-sub');
  const hcData = document.getElementById('hc-data');
  const hcPlay = document.getElementById('hc-play');
  const hcPrice = document.getElementById('hc-price');
  const hcBuy = document.getElementById('hc-buy');

  let currentId = null;
  let filter = 'all';

  /* ---------- safeStop: never interrupt play() ---------- */
  let playPromise = Promise.resolve();
  async function safeStop() {
    try { await playPromise; } catch (_) {}
    audio.pause();
  }
  async function safePlay(src) {
    await safeStop();
    if (src && audio.src !== src) audio.src = src;
    ensureVisualizer();
    playPromise = audio.play();
    try { await playPromise; } catch (_) {}
    startWave();
  }

  /* ---------- pixel LCD waveform, driven by Web Audio ---------- */
  let audioCtx = null, analyser = null, waveData = null, waveRAF = null;
  function ensureVisualizer() {
    if (audioCtx || !waveCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      waveData = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (_) { /* visualizer is optional, playback still works without it */ }
  }
  function drawWave() {
    if (!waveCtx) return;
    const w = pbWave.width, h = pbWave.height;
    waveCtx.clearRect(0, 0, w, h);
    if (analyser && !audio.paused) {
      analyser.getByteFrequencyData(waveData);
    }
    const bars = 16;
    const gap = 2;
    const barW = Math.floor((w - gap * (bars - 1)) / bars);
    for (let i = 0; i < bars; i++) {
      let v = 6;
      if (analyser && !audio.paused) {
        const idx = Math.floor((i / bars) * waveData.length);
        v = Math.max(3, Math.round((waveData[idx] / 255) * h));
      }
      const x = i * (barW + gap);
      const y = h - v;
      waveCtx.fillStyle = '#8fe0d2';
      waveCtx.fillRect(x, y, barW, v);
    }
    waveRAF = requestAnimationFrame(drawWave);
  }
  function startWave() {
    if (!waveRAF) drawWave();
  }
  function stopWave() {
    if (waveRAF) { cancelAnimationFrame(waveRAF); waveRAF = null; }
    if (waveCtx) waveCtx.clearRect(0, 0, pbWave.width, pbWave.height);
  }

  function dataBits(p) {
    const bits = [];
    if (p.bpm) bits.push(p.bpm + ' BPM');
    if (p.key) bits.push(p.key);
    if (p.tags && p.tags.length) bits.push(p.tags[0]);
    return bits.join(' ▪ ');
  }

  /* ---------- hero hotspots ---------- */
  function renderHotspots() {
    heroHotspots.innerHTML = '';
    products.forEach(p => {
      const pos = hotspotMap[p.hotspot];
      if (!pos) return;
      const el = document.createElement('div');
      el.className = 'hotspot' + (p.hotspot === 'tape' ? ' tape-spot' : '');
      el.style.left = pos.left + '%';
      el.style.top = pos.top + '%';
      el.style.width = pos.width + '%';
      el.style.height = pos.height + '%';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', 'Preview ' + p.title);
      el.addEventListener('click', () => openHotspotCard(p));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openHotspotCard(p); });
      heroHotspots.appendChild(el);
    });
  }

  function openHotspotCard(p) {
    hcType.textContent = p.type === 'kit' ? 'DRUM KIT' : 'BEAT';
    hcTitle.textContent = p.title;
    hcSub.textContent = p.subtitle || '';
    const bits = dataBits(p);
    hcData.style.display = bits ? 'inline-block' : 'none';
    hcData.textContent = bits;
    hcPrice.textContent = '$' + p.price.toFixed(2);
    hcBuy.href = p.stripeLink;
    hcPlay.dataset.id = p.id;
    hcCard.hidden = false;
    hcCard.dataset.id = p.id;
    syncHcPlayLabel();
  }
  hcClose.addEventListener('click', () => { hcCard.hidden = true; });
  hcPlay.addEventListener('click', async () => {
    const id = hcCard.dataset.id;
    const p = products.find(x => x.id === id);
    if (!p) return;
    await togglePreview(p);
    syncHcPlayLabel();
  });
  function syncHcPlayLabel() {
    const playing = currentId === hcCard.dataset.id && !audio.paused;
    hcPlay.textContent = playing ? '■ pause' : '► preview';
  }

  /* ---------- shop grid ---------- */
  function renderGrid() {
    const items = products.filter(p => filter === 'all' || p.type === filter);
    tapeGrid.innerHTML = '';
    emptyState.hidden = items.length > 0;

    items.forEach(p => {
      const card = document.createElement('article');
      card.className = 'tape-card';
      card.dataset.id = p.id;
      const bits = dataBits(p);

      card.innerHTML = `
        <div class="tc-cover">
          <img src="${p.cover}" alt="${p.title} cover art" loading="lazy"
               onerror="this.remove(); this.parentElement.insertAdjacentHTML('afterbegin','<div class=&quot;cover-fallback&quot;>RMLUR<br>deux SEXES</div>')">
          <button class="tc-play" aria-label="Preview ${p.title}">►</button>
        </div>
        <div class="tc-type">${p.type === 'kit' ? 'DRUM KIT' : 'BEAT'}</div>
        <div class="tc-title">${p.title}</div>
        <div class="tc-sub">${p.subtitle || ''}</div>
        ${bits ? `<span class="tc-data">${bits}</span>` : ''}
        <div class="tc-foot">
          <span class="tc-price">$${p.price.toFixed(2)}</span>
          <a class="buy-btn" href="${p.stripeLink}" target="_blank" rel="noopener">BUY</a>
        </div>`;

      card.querySelector('.tc-play').addEventListener('click', () => togglePreview(p));
      tapeGrid.appendChild(card);
    });
    markPlaying();
  }

  function markPlaying() {
    document.querySelectorAll('.tape-card').forEach(el => {
      el.classList.toggle('playing', el.dataset.id === currentId && !audio.paused);
    });
    playerBar.classList.toggle('paused', audio.paused);
    if (audio.paused) stopWave();
    syncHcPlayLabel();
  }

  /* ---------- preview player ---------- */
  async function togglePreview(p) {
    if (currentId === p.id && !audio.paused) {
      await safeStop();
    } else {
      currentId = p.id;
      pbTitle.textContent = `${p.title} — ${p.subtitle || (p.type === 'kit' ? 'drum kit' : 'beat')}`;
      pbBuy.href = p.stripeLink;
      playerBar.hidden = false;
      await safePlay(p.preview);
    }
    markPlaying();
  }

  pbPlay.addEventListener('click', async () => {
    if (!currentId) return;
    if (audio.paused) await safePlay();
    else await safeStop();
    markPlaying();
  });
  pbStop.addEventListener('click', async () => {
    await safeStop();
    audio.currentTime = 0;
    markPlaying();
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) pbProgress.style.width = (audio.currentTime / audio.duration * 100) + '%';
  });
  audio.addEventListener('ended', () => { pbProgress.style.width = '0%'; markPlaying(); });

  /* ---------- filter tabs ---------- */
  document.querySelectorAll('.tab[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid();
    });
  });

  renderHotspots();
  renderLcdHotspot();
  renderGrid();

  /* ---------- LCD screen — click to jump straight to the shop ---------- */
  function renderLcdHotspot() {
    const pos = hotspotMap['lcd'];
    if (!pos) return;
    const el = document.createElement('div');
    el.className = 'hotspot lcd-hotspot';
    el.style.left = pos.left + '%';
    el.style.top = pos.top + '%';
    el.style.width = pos.width + '%';
    el.style.height = pos.height + '%';
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Jump to the shop');
    el.innerHTML = '<span class="lcd-marquee">► SHOP BEATS ► SHOP KITS ► </span>';
    const jump = () => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
    el.addEventListener('click', jump);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') jump(); });
    heroHotspots.appendChild(el);
  }
});
