/* ==========================================================================
   renderers.js — Чисті функції-рендерери (item → HTML-рядок)
   --------------------------------------------------------------------------
   Тут тільки шаблони. Ніяких fetch, localStorage чи пагінації — ці речі
   робить sheets-loader.js. Кожна функція приймає один об'єкт з Google Sheets
   і повертає HTML.
   ========================================================================== */

// ── Спільні утиліти ─────────────────────────────────────────────────────

/** ISO-дата → "DD.MM.YYYY" */
function formatDate(raw) {
  if (!raw) return '';
  const s = String(raw);
  if (!s.includes('T')) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

/** Бере першу картинку з полів imageUrl/image/images та нормалізує шлях */
function resolveImage(item, fallback = 'assets/img/ui/logo.jpg') {
  let img = item.imageUrl || item.image || '';
  if (!img && item.images) img = String(item.images).split(',')[0].trim();
  if (!img) return fallback;
  return normalizeImagePath(img);
}

/** Нормалізація шляху картинки (\ → /, pictures/ → assets/img/ тощо) */
function normalizeImagePath(src) {
  let s = String(src).replace(/\\/g, '/');
  if (s.startsWith('pictures/')) s = s.replace('pictures/', 'assets/img/');
  if (!s.includes('/') && !s.startsWith('http')) s = 'assets/img/' + s;
  return s;
}

/** Повертає масив нормалізованих URL з рядка-переліку "a.jpg, b.jpg" */
function parseImageList(raw) {
  if (!raw || !String(raw).trim()) return [];
  return String(raw)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(normalizeImagePath);
}


// ── Картка новини (index.html, news.html) ───────────────────────────────
function renderNewsCard(item) {
  const date  = formatDate(item.date);
  const img   = resolveImage(item);
  const short = item.shortDescription || item.short || '';
  const href  = `news-detail.html?id=${encodeURIComponent(item.id)}`;

  return `
    <article class="group news-card relative flex flex-col sm:flex-row bg-white rounded-lg border border-gray-200 p-4 gap-5 sm:items-center hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer">
      <div class="w-full sm:w-[240px] sm:h-[160px] shrink-0 overflow-hidden rounded-md bg-gray-100">
        <img src="${img}" alt="${item.title || ''}" class="w-full h-full object-cover" onerror="this.src='assets/img/ui/logo.jpg'">
      </div>
      <div class="flex flex-col justify-center py-1 w-full">
        <div>
          <time class="text-[11px] uppercase tracking-widest text-gray-400 font-semibold block mb-2">${date}</time>
          <h3 class="font-serif font-bold text-[17px] text-gray-900 mb-2 leading-snug">${item.title || ''}</h3>
          <p class="text-[13.5px] text-gray-500 line-clamp-2 leading-relaxed">${short}</p>
        </div>
        <div class="mt-4">
          <a href="${href}" class="after:absolute after:inset-0 text-dnublue-light font-bold text-[14px] flex items-center gap-1 group-hover:underline transition-all duration-300">
            Читати далі
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </article>`;
}


// ── Картка донора (donors.html) ─────────────────────────────────────────
// Підтримує: timeline-dot, клікабельний title, [ФОТО]-плейсхолдер,
// готовий HTML у полі short, окреме поле full.
function renderDonorCard(item) {
  const date = formatDate(item.date);

  // 1. Форматування тексту
  let safeShort = item.short ? String(item.short).replace(/\\/g, '/') : '';
  let safeFull  = item.full  ? String(item.full).replace(/\\/g, '/')  : '';

  let formattedText = safeShort;
  if (safeShort && !safeShort.trim().startsWith('<')) {
    formattedText = safeShort.split('\n')
      .map(p => p.trim() ? `<p class="text-[15px] text-gray-800 mb-3">${p}</p>` : '')
      .join('');
  }

  // 2. Галерея зображень
  let imagesHtml = '';
  const imgArray = parseImageList(item.images);
  if (imgArray.length > 0) {
    const cols = imgArray.length >= 4 ? 'sm:grid-cols-4'
               : imgArray.length > 1  ? 'sm:grid-cols-2'
               : 'grid-cols-1';
    const imgs = imgArray.map(src => `
      <div class="aspect-[2/3] rounded-lg shadow-sm overflow-hidden bg-gray-100 border border-gray-200">
        <img src="${src}" class="w-full h-full object-cover">
      </div>`).join('');
    imagesHtml = `<div class="grid grid-cols-2 ${cols} gap-4 my-5">${imgs}</div>`;
  }

  // 3. Заголовок (клікабельний, якщо є повний контент)
  const hasFullContent = safeFull && safeFull.trim() !== '';
  const titleHtml = hasFullContent
    ? `<a href="donor-detail.html?id=${encodeURIComponent(item.id)}" class="block text-xl font-bold text-red-800 leading-snug mb-3 group-hover:text-dnublue-dark group-hover:underline cursor-pointer transition-colors">${item.title || ''}</a>`
    : `<h3 class="text-xl font-bold text-red-800 leading-snug mb-3 group-hover:text-dnublue-dark transition-colors">${item.title || ''}</h3>`;

  // 4. Вставка галереї в позицію [ФОТО] або в кінець
  const finalContent = formattedText.includes('[ФОТО]')
    ? formattedText.replace('[ФОТО]', imagesHtml)
    : formattedText + imagesHtml;

  const contentToShow = safeShort
    ? `<div>${finalContent}</div>`
    : `<div class="donor-content text-gray-800 text-[15px] space-y-3 mb-5">${safeFull}</div>`;

  return `
    <article class="timeline-item group relative pl-8 md:pl-12 cursor-pointer">
      <div class="timeline-dot absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-gray-300 ring-4 ring-white group-hover:scale-125 group-hover:bg-dnublue-dark transition-all"></div>
      <div class="text-[12px] font-bold text-gray-400 tracking-widest uppercase mb-1">${date}</div>
      ${titleHtml}
      ${contentToShow}
    </article>`;
}


// ── Деталь новини (news-detail.html) ────────────────────────────────────
// Ці функції НЕ передаються у loadSheet — це окремі рендерери, які
// використовує findInSheet() або ручний код.

/** HTML для "шапки" під хлібними крихтами на сторінці деталі */
function renderNewsDetailHeader(item) {
  const date = formatDate(item.date);
  return `
    <h1 class="page-title">${item.title || ''}</h1>
    <div class="page-divider"></div>
    <p class="page-subtitle">${date}</p>`;
}

/** HTML для тіла статті на сторінці деталі */
function renderNewsDetailArticle(item) {
  // Hero-зображення
  let heroImageHtml = '';
  let first = item.imageUrl || item.image || '';
  if (!first && item.images) first = String(item.images).split(',')[0].trim();
  if (first) {
    const src = normalizeImagePath(first);
    heroImageHtml = `
      <div class="w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-lg mb-8 shadow-sm bg-gray-100 ring-1 ring-black/5">
        <img src="${src}" alt="${item.title || ''}" class="w-full h-full object-cover" onerror="this.style.display='none';">
      </div>`;
  }

  // Тіло статті
  let full = item.full || item.fullContent || item.short || '';
  if (full) full = String(full).replace(/\\/g, '/');
  if (full && !full.trim().startsWith('<')) {
    full = full.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
  }

  return `
    <div class="w-full">
      ${heroImageHtml}
      <div class="article-body">${full}</div>
    </div>`;
}


// ── Експорт у глобальну область ─────────────────────────────────────────
window.renderNewsCard          = renderNewsCard;
window.renderDonorCard         = renderDonorCard;
window.renderNewsDetailHeader  = renderNewsDetailHeader;
window.renderNewsDetailArticle = renderNewsDetailArticle;


// ── Картка року надходжень (newnadhod.html) ─────────────────────────────
// Отримує { key: 2025, items: [{year, month, fileUrl}, ...] } від loadSheet з groupBy
function renderArrivalYearCard(group) {
  const monthsHtml = group.items.map(item => {
    const href = item.fileUrl || '#';
    const target = item.fileUrl ? ' target="_blank"' : '';
    return `<a href="${href}"${target} class="month-tag inline-block px-3.5 py-1.5 border rounded text-[13px] font-semibold">${item.month}</a>`;
  }).join('');

  return `
    <div class="year-card bg-white border border-gray-200 rounded p-6 shadow-sm flex flex-col h-full">
      <div class="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <h2 class="text-2xl font-bold text-gray-800">${group.key} рік</h2>
      </div>
      <div class="flex flex-wrap gap-2.5">${monthsHtml}</div>
    </div>`;
}


// ── Картка року виставок (virt.html, старий дизайн по роках) ────────────
// Отримує { key: 2025, items: [{title, year, url, jsonFile, ...}, ...] }
// Поля Google Sheets: id, title, year, date (опц.), thumbUrl (опц.), jsonFile (або url)
function renderExhibitionYearCard(group) {
  const itemsHtml = group.items.map(item => {
    const title = item.title || '';
    // Пріоритет: jsonFile → exhibition-detail.html?id=... | url → пряме посилання | інакше #
    let href;
    if (item.jsonFile) {
      href = `exhibition-detail.html?id=${encodeURIComponent(item.jsonFile)}`;
    } else if (item.url) {
      href = item.url;
    } else {
      href = '#';
    }
    const isExternal = item.url && !item.jsonFile;
    const target = isExternal ? ' target="_blank" rel="noopener"' : '';
    return `
      <li class="flex items-start gap-2 group">
        <svg class="w-4 h-4 mt-1 shrink-0 text-dnublue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
        </svg>
        <a href="${href}"${target} class="text-[15px] text-gray-700 hover:text-dnublue-dark hover:underline leading-snug transition-colors">${title}</a>
      </li>`;
  }).join('');

  return `
    <div class="exhibition-year-card bg-white border border-gray-200 rounded p-6 shadow-sm flex flex-col h-full">
      <div class="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <h2 class="text-2xl font-bold text-gray-800">${group.key} рік</h2>
      </div>
      <ul class="space-y-3">${itemsHtml}</ul>
    </div>`;
}


window.renderArrivalYearCard    = renderArrivalYearCard;
window.renderExhibitionYearCard = renderExhibitionYearCard;
