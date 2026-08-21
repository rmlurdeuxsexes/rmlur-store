/* RMLUR STORE — storefront logic (no build step, no framework) */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('pad-grid');
  const emptyState = document.getElementById('empty-state');
  const audio = document.getElementById('preview-audio');
  const playerBar = document.getElementById('player-bar');
  const pbPlay = document.getElementById('pb-play');
  const pbStop = document.getElementById('pb-stop');
  const pbTitle = document.getElementById('pb-title');
  const pbBuy = document.getElementById('pb-buy');
  const pbProgress = document.getElementById('pb-progress');
  const lcdNow = document.getElementById('lcd-now');
  const lcdTime = document.getElementById('lcd-time');

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
    playPromise = audio.play();
    try { await playPromise; } catch (_) {}
  }

  /* ---------- render grid ---------- */
  function render() {
    const items = (window.PRODUCTS || []).filter(p => filter === 'all' || p.type === filter);
    grid.innerHTML = '';
    emptyState.hidden = items.length > 0;

    items.forEach(p => {
      const card = document.createElement('article');
      card.className = 'pad';
      card.dataset.id = p.id;

      const dataBits = [];
      if (p.bpm) dataBits.push(p.bpm + ' BPM');
      if (p.key) dataBits.push(p.key);
      if (p.tags && p.tags.length) dataBits.push(p.tags[0].toUpperCase());

      card.innerHTML = `
        <div class="pad-cover">
          <img src="${p.cover}" alt="${p.title} cover art" loading="lazy"
               onerror="this.remove(); this.parentElement.insertAdjacentHTML('afterbegin','<div class=&quot;cover-fallback&quot;>RMLUR<br>DEUX SEXES</div>')">
          <button class="pad-play" aria-label="Preview ${p.title}">►</button>
        </div>
        <div class="pad-meta">
          <div class="pad-type"><span class="dot">●</span> ${p.type === 'kit' ? 'DRUM KIT' : 'BEAT'}</div>
          <h2 class="pad-title">${p.title}</h2>
          <div class="pad-sub">${p.subtitle || ''}</div>
          ${dataBits.length ? `<span class="pad-data">${dataBits.join(' ▪ ')}</span>` : ''}
        </div>
        <div class="pad-foot">
          <span class="pad-price">$${p.price.toFixed(2)}</span>
          <a class="buy-btn" href="${p.stripeLink}" target="_blank" rel="noopener">BUY</a>
        </div>`;

      card.querySelector('.pad-play').addEventListener('click', () => togglePreview(p, card));
      grid.appendChild(card);
    });
    markPlaying();
  }

  function markPlaying() {
    document.querySelectorAll('.pad').forEach(el => {
      el.classList.toggle('playing', el.dataset.id === currentId && !audio.paused);
    });
  }

  /* ---------- preview player ---------- */
  async function togglePreview(p, card) {
    if (currentId === p.id && !audio.paused) {
      await safeStop();
    } else {
      currentId = p.id;
      pbTitle.textContent = `${p.title} — ${p.subtitle || (p.type === 'kit' ? 'drum kit' : 'beat')}`;
      pbBuy.href = p.stripeLink;
      playerBar.hidden = false;
      lcdNow.textContent = 'PLAY: ' + p.title;
      await safePlay(p.preview);
    }
    markPlaying();
  }

  pbPlay.addEventListener('click', async () => {
    if (!currentId) return;
    if (audio.paused) { await safePlay(); lcdNow.textContent = 'PLAY: ' + titleOf(currentId); }
    else { await safeStop(); lcdNow.textContent = 'PAUSED.'; }
    markPlaying();
  });
  pbStop.addEventListener('click', async () => {
    await safeStop();
    audio.currentTime = 0;
    lcdNow.textContent = 'READY.';
    markPlaying();
  });

  function titleOf(id) {
    const p = (window.PRODUCTS || []).find(x => x.id === id);
    return p ? p.title : '';
  }

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      pbProgress.style.width = (audio.currentTime / audio.duration * 100) + '%';
      const m = Math.floor(audio.currentTime / 60);
      const s = String(Math.floor(audio.currentTime % 60)).padStart(2, '0');
      lcdTime.textContent = `${m}:${s}`;
    }
  });
  audio.addEventListener('ended', () => {
    lcdNow.textContent = 'READY.';
    pbProgress.style.width = '0%';
    markPlaying();
  });

  /* ---------- F-key filters ---------- */
  document.querySelectorAll('.fkey[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      document.querySelectorAll('.fkey').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  render();
});
