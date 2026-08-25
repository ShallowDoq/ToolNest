(() => {
  const variants = [
    { name: 'Maximum resolution', file: 'maxresdefault.jpg', dimensions: '1280 × 720' },
    { name: 'Standard quality', file: 'sddefault.jpg', dimensions: '640 × 480' },
    { name: 'High quality', file: 'hqdefault.jpg', dimensions: '480 × 360' },
    { name: 'Medium quality', file: 'mqdefault.jpg', dimensions: '320 × 180' },
    { name: 'Default quality', file: 'default.jpg', dimensions: '120 × 90' }
  ];
  const $ = (selector, root = document) => root.querySelector(selector);
  const getVideoId = (value) => {
    if (!value || typeof value !== 'string') return null;
    const input = value.trim();
    let id = null;
    try {
      const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
      const host = url.hostname.replace(/^www\./, '').toLowerCase();
      if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0];
      else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
        if (url.pathname === '/watch') id = url.searchParams.get('v');
        else { const match = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/); if (match) id = match[1]; }
      }
    } catch (_) { return null; }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  };
  window.YouTubeThumbnail = { getVideoId, variants, imageUrl: (id, file) => `https://i.ytimg.com/vi/${id}/${file}` };
  const setMessage = (message, type = '') => { const el = $('#form-message'); if (el) { el.textContent = message; el.className = `form-message ${type}`; } };
  const download = async (url, filename) => {
    try { const response = await fetch(url, { mode: 'cors' }); const blob = await response.blob(); const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename }); link.click(); URL.revokeObjectURL(link.href); return true; }
    catch (_) { window.open(url, '_blank', 'noopener'); return false; }
  };
  const thumbnailCard = (id, variant) => {
    const url = window.YouTubeThumbnail.imageUrl(id, variant.file);
    const card = document.createElement('article'); card.className = 'thumbnail-card';
    card.innerHTML = `<div class="thumbnail-preview"><img src="${url}" loading="lazy" alt="${variant.name} YouTube thumbnail" data-url="${url}"></div><div class="card-body"><div class="card-top"><h3>${variant.name}</h3><span>${variant.dimensions}</span></div><div class="card-actions"><a class="button secondary" href="${url}" target="_blank" rel="noopener">Open image</a><button class="button primary" type="button">Download</button></div></div>`;
    const image = $('img', card), button = $('button', card);
    const unavailable = () => { image.parentElement.classList.add('is-unavailable'); image.alt = `${variant.name} thumbnail unavailable`; button.disabled = true; $('a', card).setAttribute('aria-disabled', 'true'); };
    image.addEventListener('error', unavailable);
    image.addEventListener('load', () => { if (variant.file !== 'default.jpg' && image.naturalWidth <= 120) unavailable(); });
    button.addEventListener('click', async () => { button.textContent = 'Preparing…'; await download(url, `youtube-${id}-${variant.file}`); button.textContent = 'Downloaded ✓'; setTimeout(() => button.textContent = 'Download', 1700); });
    return card;
  };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
    const menu = $('.menu-button'), nav = $('#site-nav');
    if (menu && nav) menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
    const form = $('#thumbnail-form'); if (!form) return;
    const input = $('#youtube-url'), submit = $('button[type="submit"]', form), spinner = $('.button-spinner', submit), grid = $('#thumbnail-grid'), results = $('#results'), empty = $('#empty-state'), viewerLink = $('#viewer-link');
    const showResults = id => { grid.replaceChildren(...variants.map(v => thumbnailCard(id, v))); $('#video-id-label').textContent = `Detected video ID: ${id}`; viewerLink.href = `viewer.html?v=${encodeURIComponent(id)}`; results.hidden = false; empty.hidden = true; results.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    form.addEventListener('submit', event => { event.preventDefault(); const id = getVideoId(input.value); if (!id) { setMessage('Enter a valid YouTube video URL. Check the link and try again.', 'error'); input.setAttribute('aria-invalid', 'true'); input.focus(); return; } input.removeAttribute('aria-invalid'); submit.disabled = true; spinner.hidden = false; submit.querySelector('span').textContent = 'Checking…'; setMessage('Finding available thumbnail images…'); setTimeout(() => { showResults(id); submit.disabled = false; spinner.hidden = true; submit.querySelector('span').textContent = 'Get Thumbnails'; setMessage('Images loaded. Choose a size to open or download.', 'success'); }, 350); });
    $('#paste-button').addEventListener('click', async () => { try { input.value = await navigator.clipboard.readText(); setMessage('Link pasted. Select Get Thumbnails to continue.', 'success'); } catch (_) { setMessage('Clipboard access is unavailable. Paste your link into the field.', 'error'); input.focus(); } });
    document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.example; form.requestSubmit(); }));
  });
})();
