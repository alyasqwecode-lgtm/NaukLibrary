/* ==========================================================================
   toc.js — Sticky-зміст (Table of Contents)
   --------------------------------------------------------------------------
   Підключається тільки на сторінках з довгими статтями:
     - history.html
     - rules.html

   Очікує у розмітці:
     - <aside id="toc-desktop"> з панеллю .toc-panel всередині
     - <button id="toc-toggle-desktop"> для ручного згортання
     - <footer id="footer"> — щоб TOC ховався, коли доскролили донизу

   Якщо жодного з елементів немає — скрипт мовчки завершить роботу.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const tocAside  = document.getElementById('toc-desktop');
  const tocToggle = document.getElementById('toc-toggle-desktop');
  const footer    = document.getElementById('footer');

  if (!tocAside) return;

  let userOverride = false;

  function setAriaToc() {
    if (!tocToggle) return;
    const collapsed = tocAside.classList.contains('toc-collapsed');
    tocToggle.setAttribute('aria-expanded', String(!collapsed));
  }

  // Автоматичне згортання при прокрутці вниз
  function updateTocAuto() {
    const isDesktop = window.innerWidth >= 1024;
    if (!isDesktop) return;

    if (window.scrollY < 120) userOverride = false;

    if (!userOverride) {
      if (window.scrollY > 260) tocAside.classList.add('toc-collapsed');
      else                      tocAside.classList.remove('toc-collapsed');
      setAriaToc();
    }
  }

  // Ручне згортання/розгортання по кліку
  if (tocToggle) {
    tocToggle.addEventListener('click', () => {
      userOverride = true;
      tocAside.classList.toggle('toc-collapsed');
      setAriaToc();
    });
  }

  window.addEventListener('scroll', updateTocAuto, { passive: true });
  window.addEventListener('resize', updateTocAuto);
  updateTocAuto();

  // Сховати TOC біля футера
  if (footer && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) tocAside.classList.add('toc-hidden');
          else                      tocAside.classList.remove('toc-hidden');
        });
      },
      { root: null, threshold: 0, rootMargin: '0px 0px 220px 0px' }
    );
    io.observe(footer);
  }
});
