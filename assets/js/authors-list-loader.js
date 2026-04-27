/* ==========================================================================
   authors-list-loader.js — список авторських колекцій (newsfromlib.html)
   ========================================================================== */

(function () {
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    const container = document.getElementById('authorsContainer');
    if (!container) return;

    try {
      const res = await fetch('assets/data/authors-list.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      render(data, container);
    } catch (err) {
      console.error('authors-list-loader:', err);
      container.innerHTML =
        '<div class="col-span-full text-center text-red-500 py-6 font-semibold bg-white rounded-lg border border-gray-200">' +
        'Не вдалося завантажити перелік авторських колекцій.' +
        '</div>';
    }
  }

  function render(data, container) {
    container.innerHTML = data.map(item => {
      const date = formatDate(item.date);
      const href = `author-detail.html?id=${encodeURIComponent(item.id)}`;
      const photo = item.thumbUrl || 'assets/img/ui/logo.jpg';

      return `
        <a href="${href}" class="author-card group relative bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-all duration-300">
          <div class="aspect-[3/4] overflow-hidden bg-gray-100">
            <img src="${photo}" alt="${escapeHtml(item.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='assets/img/ui/logo.jpg'">
          </div>
          <div class="p-5 flex flex-col flex-grow">
            <time class="text-[11px] uppercase tracking-widest text-gray-400 font-semibold block mb-2">${date}</time>
            <h3 class="font-serif font-bold text-[17px] text-gray-900 mb-2 leading-snug group-hover:text-dnublue-dark transition-colors">${escapeHtml(item.name)}</h3>
            <p class="text-[13.5px] text-gray-500 leading-relaxed flex-grow">${escapeHtml(item.subtitle || '')}</p>
            <div class="mt-3 text-dnublue-light font-bold text-[14px] flex items-center gap-1 group-hover:underline">
              Переглянути колекцію
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        </a>`;
    }).join('');
  }

  function formatDate(raw) {
    if (!raw) return '';
    const s = String(raw);
    if (!s.includes('-') && !s.includes('T')) return s;
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
