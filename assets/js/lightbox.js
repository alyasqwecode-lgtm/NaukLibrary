/* ==========================================================================
   lightbox.js — Універсальний lightbox для галерей
   --------------------------------------------------------------------------
   Активується автоматично на будь-якому елементі з атрибутом data-lightbox.
   Усі елементи з однаковим значенням data-lightbox групуються в одну галерею
   зі стрілками "вперед/назад".

   Розмітка:
     <a href="big.jpg" data-lightbox="trip-2018">
       <img src="thumb.jpg">
     </a>
     <a href="big2.jpg" data-lightbox="trip-2018">
       <img src="thumb2.jpg">
     </a>

   Підключення в HTML:
     <script src="assets/js/lightbox.js"></script>

   Гарячі клавіші у відкритому lightbox:
     ← / →   — попереднє / наступне фото
     Esc     — закрити
   ========================================================================== */

(function () {
  let overlay, imgEl, captionEl, prevBtn, nextBtn, closeBtn, counterEl;
  let currentGroup = [];
  let currentIndex = 0;

  function buildOverlay() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.innerHTML = `
      <button type="button" class="lb-close" aria-label="Закрити">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <button type="button" class="lb-prev" aria-label="Попереднє">
        <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <button type="button" class="lb-next" aria-label="Наступне">
        <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
      <div class="lb-stage">
        <img class="lb-img" alt="">
      </div>
      <div class="lb-bottom">
        <div class="lb-counter"></div>
        <div class="lb-caption"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    imgEl     = overlay.querySelector('.lb-img');
    captionEl = overlay.querySelector('.lb-caption');
    counterEl = overlay.querySelector('.lb-counter');
    prevBtn   = overlay.querySelector('.lb-prev');
    nextBtn   = overlay.querySelector('.lb-next');
    closeBtn  = overlay.querySelector('.lb-close');

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click',  () => navigate(-1));
    nextBtn.addEventListener('click',  () => navigate(+1));

    // Клік на overlay (не на кнопках/img) — закрити
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('lb-stage')) close();
    });
  }


  function open(group, index) {
    buildOverlay();
    currentGroup = group;
    currentIndex = index;
    show();
    overlay.classList.add('lb-active');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
  }


  function close() {
    if (!overlay) return;
    overlay.classList.remove('lb-active');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  }


  function navigate(dir) {
    if (!currentGroup.length) return;
    currentIndex = (currentIndex + dir + currentGroup.length) % currentGroup.length;
    show();
  }


  function show() {
    const item = currentGroup[currentIndex];
    imgEl.src = item.href;
    imgEl.alt = item.caption || '';
    captionEl.textContent = item.caption || '';
    counterEl.textContent = `${currentIndex + 1} / ${currentGroup.length}`;
    // показуємо стрілки тільки якщо більше одного фото
    const multi = currentGroup.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';
  }


  function onKey(e) {
    if (e.key === 'Escape')        close();
    else if (e.key === 'ArrowLeft')  navigate(-1);
    else if (e.key === 'ArrowRight') navigate(+1);
  }


  // ── Делегування кліків ───────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-lightbox]');
    if (!link || !link.href) return;
    e.preventDefault();

    const groupName = link.getAttribute('data-lightbox');
    // Збираємо всі елементи з тим самим data-lightbox
    const items = Array.from(document.querySelectorAll(`[data-lightbox="${CSS.escape(groupName)}"]`));
    const group = items.map(a => ({
      href: a.href,
      caption: a.getAttribute('data-caption') || a.querySelector('img')?.alt || ''
    }));
    const index = items.indexOf(link);
    open(group, index);
  });

  // Експорт API (на випадок, коли треба викликати програмно)
  window.Lightbox = { open, close };
})();
