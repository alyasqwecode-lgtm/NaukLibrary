/* ==========================================================================
   main.js — спільна логіка меню для всіх сторінок сайту
   --------------------------------------------------------------------------
   Обов'язки:
     1. Мобільне меню (відкрити / закрити).
     2. Розгортання dropdown'ів у мобільному меню по тапу.
     3. Автоматична підсвітка активної сторінки у меню:
        - додає .nav-item-active до <a> активного пункту в dropdown;
        - додає .nav-group-active до батьківського <li> (група в навбарі).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Мобільне меню: відкрити / закрити ──
  const btn  = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');

  if (btn && menu) {
    btn.addEventListener('click', () => {
      const isHidden = menu.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!isHidden));
    });
  }

  // ── Dropdown у мобільному меню: тап по групі відкриває список ──
  document.querySelectorAll('.menu-group').forEach(group => {
    const link = group.querySelector('a');
    if (!link) return;
    link.addEventListener('click', (e) => {
      if (window.innerWidth < 1024) {
        e.preventDefault();
        group.classList.toggle('active');
      }
    });
  });

  // ── Підсвітка активної сторінки ──
  // Поточна сторінка визначається за останнім сегментом URL.
  const page = window.location.pathname.split('/').pop() || 'index.html';

  // 1. Підсвічуємо пункт у dropdown (desktop і mobile одночасно)
  document.querySelectorAll('.menu-dropdown a, #mobile-menu .menu-dropdown a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href && href === page) {
      a.classList.add('nav-item-active');
      const group = a.closest('.menu-group');
      if (group) group.classList.add('nav-group-active');
    }
  });

  // 2. Підсвічуємо прямі посилання в меню (напр. "Контакти")
  document.querySelectorAll('nav > ul > li > a, #mobile-menu > ul > li > a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href && href === page) {
      a.closest('li').classList.add('nav-group-active');
    }
  });
});
