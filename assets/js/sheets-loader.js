/* ==========================================================================
   sheets-loader.js — Універсальний завантажувач з Google Apps Script
   --------------------------------------------------------------------------
   Експортує 2 функції:
     loadSheet(opts)    — завантажити список і відмалювати картки
     findInSheet(opts)  — знайти ОДИН елемент за id (для news-detail)

   Обидві використовують спільний реєстр SHEET_SOURCES і спільний кеш у
   localStorage. Логіка "миттєвий показ з кешу → фонове оновлення з Google"
   реалізована в одному місці.
   ========================================================================== */

// ── Реєстр джерел ───────────────────────────────────────────────────────
// Щоб додати нову таблицю — просто додай запис сюди. Ніде більше правити
// URL не треба.
const SHEET_SOURCES = {
  news: {
    url:      'https://script.google.com/macros/s/AKfycbwYkHxwW7x32QUdDFMPSf71nqnbq99F7hOwiWEU1Ur7VvZJkr8WrE7RfAreTV6zUtIP/exec',
    sheet:    'News',
    cacheKey: 'libraryNewsCache'
  },
  donors: {
    url:      'https://script.google.com/macros/s/AKfycbxkTuhlVbRfe7CKhCIgEWTIDWPdYDtGyX7ulYopnPrHVqMjVhB547tuUQ2nN_5YOx1-/exec',
    sheet:    'Donors',
    cacheKey: 'libraryDonorsCache'
  },
  arrivals: {
    url:      'https://script.google.com/macros/s/AKfycbzlaD98X92gKNmvnFfAQHuri9uR6dvKlZIFEFdLbhKuAm_jkdaI7NCDqv-Oq0CFo2rm/exec',
    sheet:    'nadhod',
    cacheKey: 'libraryArrivalsCache'
  },
  exhibitions: {
    url:      'https://script.google.com/macros/s/AKfycbxBxMLhgyCESd6jRuCh5H53cLOdEj9IvUoF8dS9eTuk_qrvft-hZUSYa_tsDtVDZ-OwEw/exec',
    sheet:    'virt',
    cacheKey: 'libraryExhibitionsCache'
  }
};


// ── Внутрішнє: fetch зі свіжим запитом (без кешу браузера) ──────────────
async function fetchFromSource(src) {
  const url = `${src.url}?sheet=${encodeURIComponent(src.sheet)}&t=${Date.now()}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ── Внутрішнє: читання/запис кешу ───────────────────────────────────────
function readCache(cacheKey) {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function writeCache(cacheKey, data) {
  try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) {}
}


// ── loadSheet: завантажити список і відмалювати картки ──────────────────
/**
 * opts:
 *   source        — ключ у SHEET_SOURCES ('news' | 'donors' | ...)
 *   containerId   — id контейнера для відмалювання
 *   renderer      — функція (item → HTML-рядок)
 *   limit         — показати тільки N, без кнопки "Показати більше"
 *   pageSize      — показати перші N, далі кнопка "+N"
 *   reverse       — перевернути порядок (нові — зверху), за замовчуванням true
 *   groupBy       — ім'я поля для групування; renderer отримує {key, items}
 *   errorMessage  — текст помилки (опц.)
 *
 * limit і pageSize взаємовиключні. Без жодного — показати все.
 */
async function loadSheet(opts) {
  const {
    source,
    containerId,
    renderer,
    limit        = null,
    pageSize     = null,
    reverse      = true,
    groupBy      = null,
    errorMessage = 'Не вдалося завантажити дані. Перевірте з\'єднання.'
  } = opts;

  const src = SHEET_SOURCES[source];
  if (!src) { console.error(`sheets-loader: невідоме джерело "${source}"`); return; }

  const container = document.getElementById(containerId);
  if (!container) return;

  let allData = [];
  let shown   = limit !== null ? limit
              : pageSize !== null ? pageSize
              : Infinity;

  const applyOrder = (d) => reverse ? [...d].reverse() : d;

  // 1. Миттєвий показ з кешу
  const cached = readCache(src.cacheKey);
  if (cached) {
    allData = cached;
    draw();
  }

  // 2. Фонове оновлення з Google
  try {
    const rawFresh = await fetchFromSource(src);
    const fresh    = applyOrder(rawFresh);
    if (JSON.stringify(fresh) !== JSON.stringify(cached)) {
      writeCache(src.cacheKey, fresh);
      allData = fresh;
      draw();
    }
  } catch (err) {
    console.error(`sheets-loader (${source}):`, err);
    if (!cached) {
      container.innerHTML =
        `<div class="text-center text-red-500 py-6 font-semibold bg-white rounded-lg border border-gray-200">${errorMessage}</div>`;
    }
  }

  function draw() {
    let html;

    if (groupBy) {
      // Групуємо масив за значенням поля groupBy
      const groups = {};
      allData.forEach(item => {
        const key = item[groupBy];
        if (!groups[key]) groups[key] = { key, items: [] };
        groups[key].items.push(item);
      });
      const keys = Object.keys(groups).sort((a, b) => reverse ? (b > a ? 1 : -1) : (a > b ? 1 : -1));
      const sliced = (limit !== null || pageSize !== null) ? keys.slice(0, shown) : keys;
      html = sliced.map(k => renderer(groups[k])).join('');
    } else {
      const slice = allData.slice(0, shown);
      html = slice.map(renderer).join('');
    }

    let moreBtn = '';
    const totalCount = groupBy
      ? new Set(allData.map(x => x[groupBy])).size
      : allData.length;
    const hasMore     = shown < totalCount;
    const canPaginate = pageSize !== null;

    if (canPaginate && hasMore) {
      moreBtn = `
        <div class="text-center pt-8">
          <button type="button" data-load-more
            class="bg-indigo-50 text-dnublue-dark font-bold py-2.5 px-6 rounded shadow-sm border border-indigo-100 hover:bg-dnublue-light hover:text-white transition-colors">
            Показати більше
          </button>
        </div>`;
    }

    container.innerHTML = html + moreBtn;

    const btn = container.querySelector('[data-load-more]');
    if (btn) {
      btn.addEventListener('click', () => {
        shown += pageSize;
        draw();
      });
    }
  }
}


// ── findInSheet: знайти ОДИН елемент за id ──────────────────────────────
async function findInSheet(opts) {
  const { source, id, onFound, onNotFound, onError } = opts;

  const src = SHEET_SOURCES[source];
  if (!src) { console.error(`sheets-loader: невідоме джерело "${source}"`); return; }

  if (id === undefined || id === null || id === '') {
    if (onNotFound) onNotFound();
    return;
  }

  const sameId = (a) => String(a.id) === String(id);

  const cached = readCache(src.cacheKey);
  let currentItem = null;
  if (cached) {
    currentItem = cached.find(sameId) || null;
    if (currentItem && onFound) onFound(currentItem);
  }

  try {
    const rawFresh = await fetchFromSource(src);
    if (JSON.stringify(rawFresh) !== JSON.stringify(cached)) {
      writeCache(src.cacheKey, rawFresh);
    }
    const freshItem = rawFresh.find(sameId) || null;

    if (freshItem && JSON.stringify(freshItem) !== JSON.stringify(currentItem)) {
      if (onFound) onFound(freshItem);
    }
    if (!freshItem && !currentItem) {
      if (onNotFound) onNotFound();
    }
  } catch (err) {
    console.error(`sheets-loader findInSheet (${source}):`, err);
    if (!currentItem && onError) onError(err);
  }
}


window.loadSheet    = loadSheet;
window.findInSheet  = findInSheet;
