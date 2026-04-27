/* ==========================================================================
   exhibition-loader.js — завантажувач окремої виставки з JSON-файлу
   --------------------------------------------------------------------------
   Сторінка exhibition-detail.html?id=dara-korniy-2025 завантажує файл
   assets/data/exhibitions/dara-korniy-2025.json і рендерить його вміст
   у заздалегідь підготовані контейнери HTML-шаблону.

   Структура JSON описана в assets/data/exhibitions/_template.json
   ========================================================================== */

(function () {
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const loadingEl = document.getElementById('loading-state');

    if (!id) {
      showError('Не вказано ідентифікатор виставки');
      return;
    }

    try {
      const res = await fetch(`assets/data/exhibitions/${id}.json`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      render(data);
      if (loadingEl) loadingEl.style.display = 'none';
    } catch (err) {
      console.error('exhibition-loader:', err);
      showError('Не вдалося завантажити виставку');
    }
  }


  function render(data) {
    // Заголовок сторінки
    document.title = `${data.title} | Наукова бібліотека ДНУ`;

    // Hero-банер
    setText('crumb-title', data.title);
    setText('exhibition-title', data.title);
    setText('exhibition-subtitle', data.subtitle || '');
    setText('exhibition-date', formatDate(data.date));

    // Епіграфи
    const epigraphsEl = document.getElementById('epigraphs');
    if (epigraphsEl && data.epigraphs && data.epigraphs.length) {
      epigraphsEl.innerHTML = data.epigraphs.map(renderEpigraph).join('');
    }

    // Біографія автора
    const authorEl = document.getElementById('author-block');
    if (authorEl && (data.authorBio || data.authorPhoto)) {
      authorEl.innerHTML = renderAuthorBlock(data);
    }

    // Секції з книгами
    const sectionsEl = document.getElementById('sections');
    if (sectionsEl && data.sections && data.sections.length) {
      sectionsEl.innerHTML = data.sections.map(renderSection).join('');
    }

    // Підпис
    const compiledEl = document.getElementById('compiled-by');
    if (compiledEl && data.compiledBy) {
      compiledEl.innerHTML = `
        <div class="flex justify-end not-italic mt-4">
          <div class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-l-4 border-dnublue-light rounded-r-lg shadow-sm">
            <span class="text-gray-600 text-[13.5px]">Виставку підготувала:</span>
            <strong class="font-bold text-dnublue-dark text-[14px]">${escapeHtml(data.compiledBy)}</strong>
          </div>
        </div>
      `;
    }
  }


  // ── Рендерери частин ──────────────────────────────────────────────────

  function renderEpigraph(ep) {
    const align = ep.align === 'right'  ? 'text-right'
                : ep.align === 'left'   ? 'text-left'
                : 'text-center';
    const author = ep.author
      ? `<footer class="mt-3 text-sm text-gray-500 not-italic">— ${escapeHtml(ep.author)}</footer>`
      : '';
    return `
      <blockquote class="quote-block border-l-0 pl-0 py-4 mb-5 italic text-gray-700 text-[16px] leading-relaxed ${align}">
        <div class="whitespace-pre-line">${escapeHtml(ep.text)}</div>
        ${author}
      </blockquote>`;
  }

  function renderAuthorBlock(data) {
    if (!data.authorBio && !data.authorPhoto) return '';

    const align = data.authorBioAlign === 'center' ? 'text-center' : '';
    const bio = data.authorBio
      ? `<div class="article-body ${align}">${paragraphize(data.authorBio)}</div>`
      : '';

    if (data.authorPhoto) {
      // З фото — бокова колонка
      return `
        <div class="flex flex-col sm:flex-row gap-6 items-start mb-10">
          <div class="shrink-0 w-32 h-40 sm:w-40 sm:h-52 rounded overflow-hidden bg-gray-100 shadow-md">
            <img src="${data.authorPhoto}" alt="Фото автора" class="w-full h-full object-cover" onerror="this.style.display='none'">
          </div>
          ${bio}
        </div>`;
    } else {
      // Тільки текст — без рамки, просто потік
      return `<div class="mb-10">${bio}</div>`;
    }
  }

  function renderSection(section) {
    // підтримуємо і "title" (старий формат) і "heading" (новий)
    const headingText = section.heading || section.title;
    const heading = headingText
      ? `<h2 class="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-6 mt-12 border-b border-gray-200 pb-3">${escapeHtml(headingText)}</h2>`
      : '';
    // Епіграф всередині секції
    const sectionEpigraph = section.epigraph
      ? renderEpigraph(section.epigraph)
      : '';
    const intro = section.intro
      ? `<div class="article-body mb-6">${paragraphize(section.intro)}</div>`
      : '';
    const books = (section.books || []).map(renderBook).join('');
    return heading + sectionEpigraph + intro + `<div class="space-y-5">${books}</div>`;
  }

function renderBook(book) {
    const cover = book.cover
      ? `<div class="shrink-0 w-28 sm:w-36">
           <img src="${book.cover}" alt="${escapeHtml(book.title || '')}" class="w-full rounded border border-gray-200 shadow-sm" onerror="this.style.display='none'">
         </div>`
      : '';
    const author = book.author
      ? `<div class="text-[14px] font-semibold text-gray-600 mb-1">${escapeHtml(book.author)}</div>`
      : '';
    const title = book.title
      ? `<div class="font-serif font-bold text-[17px] text-gray-900 mb-2 leading-snug">${escapeHtml(book.title)}</div>`
      : '';
    const imprint = book.imprint
      ? `<div class="text-[13px] text-gray-500 italic">${escapeHtml(book.imprint)}</div>`
      : '';
      
    // Змінено класи: прибрано border-t та pt-3, додано відступ mt-4
    const desc = book.description
      ? `<div class="mt-4 text-[14.5px] text-gray-700 leading-relaxed">${paragraphize(book.description)}</div>`
      : '';

    // Змінено структуру: ${desc} тепер знаходиться всередині <div class="flex-grow">
    return `
      <article class="bg-white rounded-lg border border-gray-200 p-5">
        <div class="flex flex-col sm:flex-row gap-6 items-start">
          ${cover}
          <div class="flex-grow">
            ${author}
            ${title}
            ${imprint}
            ${desc}
          </div>
        </div>
      </article>`;
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
    // Розбиваємо на абзаци по подвійному переносу
    return t.split(/\n\n+/).filter(p => p.trim())
            // ТУТ ЗМІНА: Замінюємо поодинокі \n на звичайний пробіл, а не на <br>
            .map(p => `<p>${escapeHtml(p.trim()).replace(/\n/g, ' ')}</p>`)
            .join('');
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(raw) {
    if (!raw) return '';
    const s = String(raw);
    if (!s.includes('-') && !s.includes('T')) return s;
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    const months = ['Січня','Лютого','Березня','Квітня','Травня','Червня',
                    'Липня','Серпня','Вересня','Жовтня','Листопада','Грудня'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function showError(msg) {
    const loadingEl = document.getElementById('loading-state');
    if (loadingEl) {
      loadingEl.innerHTML = `
        <div class="py-10 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <h3 class="text-lg font-medium text-gray-900">${escapeHtml(msg)}</h3>
          <p class="mt-2 text-sm text-gray-500">
            <a href="virt.html" class="text-dnublue-light hover:underline">← Повернутися до списку виставок</a>
          </p>
        </div>`;
    }
  }
})();