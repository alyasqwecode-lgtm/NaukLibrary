/* ==========================================================================
   page-loader.js — універсальний завантажувач для author-detail.html і
                    event-detail.html
   --------------------------------------------------------------------------
   Сторінка вказує тип контенту через атрибут на <body> (data-page-type)
   або просто розміщує елементи з відомими id, які цей лоадер заповнить.

   Логіка:
     1. Беремо ?id= з URL
     2. Завантажуємо JSON з assets/data/<type>/<id>.json
     3. Рендеримо секції за порядком, який вказаний у JSON:
        - "text"     → абзаци тексту (підтримка <strong>, <em>, посилань)
        - "portrait" → велике центральне фото (для авторів)
        - "gallery"  → сітка thumbs з lightbox
        - "two-col"  → двоколонкова: [photo|text] або [text|photo]
        - "video-list" → список посилань на відео
        - "books"    → список книг (для авторів — прості пункти або з обкладинками)

     Все це описується одним масивом `sections` у JSON-файлі,
     тому додавання нових типів секцій робиться додаванням однієї функції рендера.
   ========================================================================== */

(function () {
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    const body = document.body;
    const pageType = body.getAttribute('data-page-type'); // 'author' | 'event' | 'nauk' | 'exhibition' | ...
    // Конвенція: assets/data/<type>s/<id>.json (множина), або те ж саме якщо вже з 's'
    const folderMap = {
      author:       'authors',
      event:        'events',
      exhibition:   'exhibitions',
      nauk:         'nauk',
      libnewspaper: 'libnewspaper'
    };
    const dataDir = folderMap[pageType] || pageType;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { showError('Не вказано ідентифікатор'); return; }

    let data;
    try {
      const res = await fetch(`assets/data/${dataDir}/${id}.json`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
    } catch (err) {
      console.error('page-loader:', err);
      showError('Не вдалося завантажити сторінку');
      return;
    }

    render(data, id);
    document.getElementById('loading-state')?.remove();
  }


  function render(data, id) {
    // Заголовок документа
    document.title = `${data.title || ''} | Наукова бібліотека ДНУ`;

    // Шапка під хлібними крихтами
    setText('crumb-title',  data.title || '');
    setText('page-title',   data.title || '');
    if (data.subtitle) setText('page-subtitle', data.subtitle);
    if (data.date)     setText('page-date', formatDate(data.date));

    // Контент-секції
    const main = document.getElementById('content-sections');
    if (!main) return;

    const sections = data.sections || [];
    main.innerHTML = sections.map((s, i) => renderSection(s, id, i)).join('');

    // Підпис автора матеріалу
    if (data.compiledBy) {
      const compiled = document.getElementById('compiled-by');
      if (compiled) {
        compiled.className = 'mt-10 flex items-center gap-3';
        compiled.innerHTML = `
          <svg class="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
          <span class="text-[13px] text-gray-500">Матеріал підготувала <strong class="text-gray-700 font-semibold not-italic">${escapeHtml(data.compiledBy)}</strong></span>`;
      }
    }
  }


  // ── Рендерери секцій ──────────────────────────────────────────────────

  function renderSection(s, pageId, idx) {
    switch (s.type) {
      case 'text':        return renderText(s);
      case 'portrait':    return renderPortrait(s);
      case 'gallery':     return renderGallery(s, pageId, idx);
      case 'two-col':     return renderTwoCol(s, pageId, idx);
      case 'video-list':  return renderVideoList(s);
      case 'books':       return renderBooks(s);
      case 'heading':     return renderHeading(s);
      case 'stats-table': return renderStatsTable(s);
      case 'doc-link':    return renderDocLink(s);
      default:
        console.warn('page-loader: невідомий тип секції', s.type);
        return '';
    }
  }


  // Таблиця статистичних показників
  function renderStatsTable(s) {
    const heading = s.title ? `<h3 class="font-serif font-bold text-xl text-gray-900 mb-4 mt-8">${escapeHtml(s.title)}</h3>` : '';
    const subhead = s.subtitle ? `<p class="text-sm text-gray-500 mb-3">${escapeHtml(s.subtitle)}</p>` : '';
    const rows = (s.rows || []).map(r => `
      <tr class="border-b border-gray-100 last:border-0">
        <td class="py-3 px-4 text-[14px] text-gray-700">${escapeHtml(r.label)}</td>
        <td class="py-3 px-4 text-[15px] font-bold text-dnublue-dark text-right tabular-nums">${escapeHtml(String(r.value))}</td>
      </tr>`).join('');
    const headerCol = s.headerColumn || 'Стан на';
    return `${heading}${subhead}
      <div class="overflow-hidden rounded-lg border border-gray-200 my-6 max-w-2xl">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left py-3 px-4 text-[12px] font-bold uppercase tracking-wider text-gray-600">Назва показника</th>
              <th class="text-right py-3 px-4 text-[12px] font-bold uppercase tracking-wider text-gray-600">${escapeHtml(headerCol)}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }


  // Посилання на документ (RTF, PDF, DOCX)
  function renderDocLink(s) {
    const url = s.url || '#';
    const title = s.title || 'Документ';
    const ext = (url.split('.').pop() || '').toUpperCase().slice(0, 4);
    return `
      <a href="${url}" target="_blank" rel="noopener" class="my-6 flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-dnublue-light transition-all max-w-2xl group">
        <div class="shrink-0 w-12 h-14 bg-dnublue-dark text-white rounded flex items-center justify-center font-bold text-[11px] tracking-tight">${escapeHtml(ext)}</div>
        <div class="flex-grow">
          <div class="font-semibold text-[15px] text-gray-900 group-hover:text-dnublue-dark transition-colors leading-snug">${escapeHtml(title)}</div>
          <div class="text-[12px] text-gray-500 mt-1">Відкрити у новій вкладці</div>
        </div>
        <svg class="w-5 h-5 text-gray-400 shrink-0 group-hover:text-dnublue-dark transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
      </a>`;
  }


  function renderHeading(s) {
    const level = s.level || 2;
    return `<h${level} class="font-serif font-bold text-2xl sm:text-3xl text-gray-900 mt-8 mb-4">${escapeHtml(s.text || '')}</h${level}>`;
  }


  function renderText(s) {
    const html = paragraphize(s.content || '');
    return `<div class="article-body mb-6">${html}</div>`;
  }


  function renderPortrait(s) {
    if (!s.src) return '';
    const caption = s.caption ? `<figcaption class="text-center text-sm text-gray-500 mt-2 italic">${escapeHtml(s.caption)}</figcaption>` : '';
    const lbAttr = s.lightbox === false ? '' : ` data-lightbox="portrait" data-caption="${escapeHtml(s.caption || '')}"`;
    const imgInner = `<img src="${s.src}" alt="${escapeHtml(s.caption || '')}" class="mx-auto rounded shadow-md max-h-[480px]" onerror="this.style.display='none'">`;
    const image = lbAttr
      ? `<a href="${s.src}"${lbAttr}>${imgInner}</a>`
      : imgInner;
    return `<figure class="my-6">${image}${caption}</figure>`;
  }


  function renderGallery(s, pageId, idx) {
    const items = s.items || [];
    if (!items.length) return '';
    const groupName = `${pageId}-gallery-${idx}`;

    const cols = s.columns || 'auto';
    const colClass = cols === 2 ? 'grid-cols-2'
                   : cols === 3 ? 'grid-cols-2 sm:grid-cols-3'
                   : cols === 4 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                   : cols === 5 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
                   : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';

    const aspect = s.aspect || 'portrait'; // 'portrait' | 'landscape' | 'square'
    const aspectClass = aspect === 'landscape' ? 'aspect-[4/3]'
                      : aspect === 'square'    ? 'aspect-square'
                      : 'aspect-[3/4]';

    const cells = items.map((it, i) => {
      const big   = it.src || it;
      const thumb = it.thumb || big;
      const caption = it.caption || '';
      return `
        <a href="${big}" data-lightbox="${groupName}" data-caption="${escapeHtml(caption)}"
           class="block ${aspectClass} overflow-hidden rounded border border-gray-200 bg-gray-100 hover:shadow-md transition-shadow">
          <img src="${thumb}" alt="${escapeHtml(caption)}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" onerror="this.style.opacity='.3'">
        </a>`;
    }).join('');

    const heading = s.title ? `<h3 class="font-serif font-bold text-xl text-gray-900 mb-4 mt-8">${escapeHtml(s.title)}</h3>` : '';
    return `${heading}<div class="grid ${colClass} gap-3 my-6">${cells}</div>`;
  }


  function renderTwoCol(s, pageId, idx) {
    const left  = s.left  || {};
    const right = s.right || {};
    const lh = renderColumnContent(left,  pageId, `${idx}-l`);
    const rh = renderColumnContent(right, pageId, `${idx}-r`);
    const reverse = s.imageSide === 'right' ? 'sm:flex-row-reverse' : '';
    return `<div class="flex flex-col sm:flex-row ${reverse} gap-6 sm:gap-8 my-6 items-start">
      <div class="sm:w-1/3">${lh}</div>
      <div class="sm:w-2/3">${rh}</div>
    </div>`;
  }


  function renderColumnContent(col, pageId, suffix) {
    if (col.image) {
      const lbAttr = col.lightbox === false ? '' : ` data-lightbox="two-col-${pageId}-${suffix}" data-caption="${escapeHtml(col.caption || '')}"`;
      const inner = `<img src="${col.image}" alt="${escapeHtml(col.caption || '')}" class="w-full rounded shadow-sm">`;
      return lbAttr
        ? `<a href="${col.image}"${lbAttr}>${inner}</a>`
        : inner;
    }
    if (col.text) {
      return `<div class="article-body">${paragraphize(col.text)}</div>`;
    }
    if (col.gallery) {
      // вертикальний стовпчик thumbs (як у "Признании в Штрихе")
      const groupName = `two-col-${pageId}-${suffix}`;
      return col.gallery.map(it => {
        const big   = it.src || it;
        const thumb = it.thumb || big;
        return `<a href="${big}" data-lightbox="${groupName}" class="block mb-2 rounded overflow-hidden border border-gray-200 bg-gray-100">
          <img src="${thumb}" class="w-full h-auto" loading="lazy">
        </a>`;
      }).join('');
    }
    return '';
  }


  function renderVideoList(s) {
    const items = s.items || [];
    if (!items.length) return '';
    const links = items.map(v => `
      <a href="${v.url}" target="_blank" rel="noopener" class="flex items-center gap-2 text-dnublue-light hover:text-dnublue-dark hover:underline font-semibold">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-5.197-3.027A1 1 0 008 9v6a1 1 0 001.555.832l5.197-3.027a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        ${escapeHtml(v.title || 'Відео')}
      </a>`).join('');
    const heading = s.title ? `<h3 class="font-serif font-bold text-xl text-gray-900 mb-3 mt-8">${escapeHtml(s.title)}</h3>` : '';
    return `${heading}<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 my-4 bg-gray-50 border border-gray-200 rounded-lg p-5">${links}</div>`;
  }


  function renderBooks(s) {
    const items = s.items || [];
    if (!items.length) return '';
    const heading = s.title ? `<h3 class="font-serif font-bold text-xl text-gray-900 mb-4 mt-8">${escapeHtml(s.title)}</h3>` : '';
    const cards = items.map(book => {
      const cover = book.cover
        ? `<div class="shrink-0 w-24 sm:w-28">
             <img src="${book.cover}" alt="${escapeHtml(book.title || '')}" class="w-full rounded border border-gray-200 shadow-sm">
           </div>`
        : '';
      const author  = book.author  ? `<div class="text-[14px] font-semibold text-gray-600 mb-1">${escapeHtml(book.author)}</div>` : '';
      const title   = book.title   ? `<div class="font-serif font-bold text-[16px] text-gray-900 mb-2 leading-snug">${escapeHtml(book.title)}</div>` : '';
      const imprint = book.imprint ? `<div class="text-[13px] text-gray-500 mb-2 italic">${escapeHtml(book.imprint)}</div>` : '';
      const desc    = book.description ? `<div class="text-[14px] text-gray-700 leading-relaxed">${paragraphize(book.description)}</div>` : '';
      return `<article class="bg-white rounded-lg border border-gray-200 p-4 flex gap-4 mb-3">${cover}<div class="flex-grow min-w-0">${author}${title}${imprint}${desc}</div></article>`;
    }).join('');
    return `${heading}<div class="my-6">${cards}</div>`;
  }


  // ── Утиліти ───────────────────────────────────────────────────────────

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function paragraphize(text) {
    if (!text) return '';
    const t = String(text).trim();
    if (t.startsWith('<')) return t;  // вже HTML
    return t.split(/\n\n+/).filter(p => p.trim())
            .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
            .join('');
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function formatDate(raw) {
    if (!raw) return '';
    const s = String(raw);
    if (!s.includes('-') && !s.includes('T')) return s;
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    const months = ['січня','лютого','березня','квітня','травня','червня',
                    'липня','серпня','вересня','жовтня','листопада','грудня'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function showError(msg) {
    const loadingEl = document.getElementById('loading-state');
    if (loadingEl) {
      const back = document.body.getAttribute('data-page-type') === 'libnewspaper'
        ? 'libnewspaper.html'
        : document.body.getAttribute('data-page-type') === 'event'
          ? 'leisure.html'
          : 'newsfromlib.html';
      loadingEl.innerHTML = `
        <div class="py-10 text-center">
          <h3 class="text-lg font-medium text-gray-900">${escapeHtml(msg)}</h3>
          <p class="mt-2 text-sm text-gray-500">
            <a href="${back}" class="text-dnublue-light hover:underline">← Повернутися</a>
          </p>
        </div>`;
    }
  }
})();
