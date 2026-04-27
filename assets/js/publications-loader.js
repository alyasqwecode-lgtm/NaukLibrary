/* ==========================================================================
   publications-loader.js — завантажувач видань ДНУ з JSON-файлу
   --------------------------------------------------------------------------
   Завантажує assets/data/publications.json, рендерить картки з пошуком
   і фільтром за галуззю. Реалізує ту саму логіку, що була раніше inline
   у vudanyaDNU.html — тільки дані тепер окремо.
   ========================================================================== */

(function () {
  let publications = [];

  async function init() {
    const container    = document.getElementById('publicationsContainer');
    const searchInput  = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const emptyState   = document.getElementById('emptyState');

    if (!container) return;

    // Завантажуємо JSON
    try {
      const res = await fetch('assets/data/publications.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      publications = await res.json();
    } catch (err) {
      console.error('publications-loader:', err);
      container.innerHTML =
        '<div class="col-span-full text-center text-red-500 py-6 font-semibold bg-white rounded-lg border border-gray-200">' +
        'Не вдалося завантажити перелік видань.' +
        '</div>';
      return;
    }

    function renderCards() {
      container.innerHTML = '';
      const searchTerm  = (searchInput  ? searchInput.value  : '').toLowerCase();
      const selectedCat = categoryFilter ? categoryFilter.value : 'all';
      let count = 0;

      publications.forEach(pub => {
        if (selectedCat !== 'all' && pub.cat !== selectedCat) return;
        if (!String(pub.title || '').toLowerCase().includes(searchTerm)) return;

        count++;

        let issuesHtml = '';
        const years = Object.keys(pub.issues || {}).sort((a, b) => b - a);

        years.forEach(year => {
          const issuesArray = pub.issues[year];
          let issueLinks = '';

          if (Array.isArray(issuesArray)) {
            issueLinks = issuesArray.map(item =>
              `<a href="${item.url}" target="_blank" class="text-gray-600 hover:text-dnublue-light hover:underline transition-colors" title="Перейти до видання">${item.name}</a>`
            ).join(', ');
          } else {
            issueLinks = `<span class="text-gray-600">${issuesArray}</span>`;
          }

          issuesHtml += `
            <div class="flex items-baseline gap-2 mt-2 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <span class="inline-block px-1.5 py-0.5 bg-gray-200/70 text-gray-700 rounded text-[11.5px] font-bold shrink-0 shadow-sm">${year}</span>
              <span class="text-[13px] leading-tight">${issueLinks}</span>
            </div>`;
        });

        const titleHtml = pub.url
          ? `<a href="${pub.url}" target="_blank" class="hover:text-dnublue-light hover:underline transition-colors" title="Перейти до журналу">${pub.title}</a>`
          : pub.title;

        const card = document.createElement('div');
        card.className = 'pub-card bg-white border border-gray-200 rounded overflow-hidden flex flex-col h-full';
        card.innerHTML = `
          <div class="bg-gray-50 px-5 py-3 border-b border-gray-200">
            <span class="text-[11px] font-bold text-dnublue-light uppercase tracking-widest">${pub.type}</span>
          </div>
          <div class="p-5 flex-grow flex flex-col">
            <h2 class="text-[16px] font-bold text-gray-900 leading-snug mb-4">${titleHtml}</h2>
            <div class="mt-auto pt-4">
              <details class="group bg-gray-50 border border-gray-200 rounded transition-all duration-300">
                <summary class="flex items-center justify-between p-3 cursor-pointer select-none outline-none">
                  <div class="flex items-center gap-2.5 text-gray-800 font-semibold text-[13.5px]">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                    Розгорнути архів випусків
                  </div>
                  <svg class="w-4 h-4 text-gray-500 transition-transform duration-300 group-open:-rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </summary>
                <div class="p-4 pt-1 bg-white border-t border-gray-100">${issuesHtml}</div>
              </details>
            </div>
          </div>`;
        container.appendChild(card);
      });

      if (emptyState) {
        if (count === 0) emptyState.classList.remove('hidden');
        else             emptyState.classList.add('hidden');
      }
    }

    if (searchInput)    searchInput.addEventListener('input', renderCards);
    if (categoryFilter) categoryFilter.addEventListener('change', renderCards);

    renderCards();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
