/* ==========================================================================
   i18n.js — перемикання мови: Українська ↔ English
   --------------------------------------------------------------------------
   Перекладаються тільки:
     - Навігаційне меню (desktop + mobile)
     - Заголовок і підзаголовок бібліотеки у шапці
     - Назви сторінок (<title> і <h1 class="page-title">)
     - Хлібні крихти (загальні частини)
     - Кнопки/мітки форм

   Підключення: <script src="assets/js/i18n.js"></script>
   Викликається автоматично при завантаженні сторінки.
   ========================================================================== */

const I18N = {

  uk: {
    // ── Шапка ────────────────────────────────────────────────
    'header.name':          'Наукова бібліотека',
    'header.univ':          'Дніпровського національного університету',
    'header.contact':       'Всі питання і запити приймаємо тут: librarydnu@gmail.com',
    'header.contact_short': 'librarydnu@gmail.com',

    // ── Меню: групи ──────────────────────────────────────────
    'nav.about':        'Про бібліотеку',
    'nav.students':     'Студентам',
    'nav.researchers':  'Науковцям',
    'nav.resources':    'Ресурси',
    'nav.life':         'Життя бібліотеки',
    'nav.contacts':     'Контакти',

    // ── Меню: Про бібліотеку ─────────────────────────────────
    'nav.history':      'Історія бібліотеки',
    'nav.rules':        'Правила користування',
    'nav.funds':        'Фонди наукової бібліотеки ДНУ',
    'nav.nauk':         'Науково-методична діяльність',

    // ── Меню: Студентам ──────────────────────────────────────
    'nav.integrity':    'Положення про академ. доброчесність',
    'nav.plagiarism':   'Антиплагіат (StrikePlagiarism)',
    'nav.tour3d':       'Віртуальна екскурсія 3D',
    'nav.liblnk':       'Бібліотека',

    // ── Меню: Науковцям ──────────────────────────────────────
    'nav.ai':           'Штучний інтелект і вигадані джерела',
    'nav.sources':      'Про використання джерел інформації',
    'nav.openscience':  'Політика відкритої науки',

    // ── Меню: Ресурси ────────────────────────────────────────
    'nav.catalog':      'Електронний каталог',
    'nav.repository':   'Репозиторій ДНУ',
    'nav.publdnu':      'Видання ДНУ',
    'nav.elresukr':     'Електронні ресурси України',
    'nav.elressvit':    'Електронні ресурси світу',

    // ── Меню: Життя бібліотеки ───────────────────────────────
    'nav.news':         'Новини',
    'nav.arrivals':     'Нові надходження',
    'nav.exhibitions':  'Віртуальні виставки',
    'nav.newsfromlib':  'Новини з книгосховища',
    'nav.leisure':      'Наше дозвілля',
    'nav.donors':       'Дарувальники',
    'nav.libnewspaper': 'Бібліотека у ЗМІ',

    // ── Хлібні крихти (загальні) ─────────────────────────────
    'bc.home':          'Головна',
    'bc.about':         'Про бібліотеку',
    'bc.students':      'Студентам',
    'bc.researchers':   'Науковцям',
    'bc.resources':     'Ресурси',
    'bc.life':          'Життя бібліотеки',

    // ── Заголовки сторінок ───────────────────────────────────
    'page.index':         'Наукова бібліотека ДНУ ім. Олеся Гончара',
    'page.history':       'Історія бібліотеки',
    'page.rules':         'Правила користування',
    'page.founds':        'Фонди наукової бібліотеки ДНУ',
    'page.nauk':          'Науково-методична діяльність',
    'page.eks3d':         'Віртуальна екскурсія 3D',
    'page.contact':       'Контакти',
    'page.catalog':       'Електронний каталог',
    'page.vudanya':       'Видання ДНУ',
    'page.elresukr':      'Електронні ресурси України',
    'page.elressvit':     'Електронні ресурси світу',
    'page.news':          'Останні новини',
    'page.newnadhod':     'Нові надходження',
    'page.virt':          'Віртуальні виставки',
    'page.newsfromlib':   'Новини з книгосховища',
    'page.leisure':       'Наше дозвілля',
    'page.donors':        'Дарувальники',
    'page.libnewspaper':  'Бібліотека у ЗМІ',
  },

  en: {
    // ── Header ───────────────────────────────────────────────
    'header.name':          'Academic Library',
    'header.univ':          'of Dnipro National University',
    'header.contact':       'All enquiries: librarydnu@gmail.com',
    'header.contact_short': 'librarydnu@gmail.com',

    // ── Nav groups ───────────────────────────────────────────
    'nav.about':        'About the Library',
    'nav.students':     'For Students',
    'nav.researchers':  'For Researchers',
    'nav.resources':    'Resources',
    'nav.life':         'Library Life',
    'nav.contacts':     'Contacts',

    // ── About the Library ────────────────────────────────────
    'nav.history':      'Library History',
    'nav.rules':        'Library Rules',
    'nav.funds':        'Library Collections',
    'nav.nauk':         'Research & Methodology',

    // ── For Students ─────────────────────────────────────────
    'nav.integrity':    'Academic Integrity Policy',
    'nav.plagiarism':   'Anti-Plagiarism (StrikePlagiarism)',
    'nav.tour3d':       '3D Virtual Tour',
    'nav.liblnk':       'Library',

    // ── For Researchers ──────────────────────────────────────
    'nav.ai':           'AI and Fictional Sources',
    'nav.sources':      'Information Sources Policy',
    'nav.openscience':  'Open Science Policy',

    // ── Resources ────────────────────────────────────────────
    'nav.catalog':      'Electronic Catalog',
    'nav.repository':   'DNU Repository',
    'nav.publdnu':      'DNU Publications',
    'nav.elresukr':     'Ukrainian E-Resources',
    'nav.elressvit':    'World E-Resources',

    // ── Library Life ─────────────────────────────────────────
    'nav.news':         'News',
    'nav.arrivals':     'New Arrivals',
    'nav.exhibitions':  'Virtual Exhibitions',
    'nav.newsfromlib':  'News from the Stacks',
    'nav.leisure':      'Our Leisure',
    'nav.donors':       'Donors',
    'nav.libnewspaper': 'Library in Media',

    // ── Breadcrumbs ──────────────────────────────────────────
    'bc.home':          'Home',
    'bc.about':         'About the Library',
    'bc.students':      'For Students',
    'bc.researchers':   'For Researchers',
    'bc.resources':     'Resources',
    'bc.life':          'Library Life',

    // ── Page titles ──────────────────────────────────────────
    'page.index':         'DNU Academic Library',
    'page.history':       'Library History',
    'page.rules':         'Library Rules',
    'page.founds':        'Library Collections',
    'page.nauk':          'Research & Methodology',
    'page.eks3d':         '3D Virtual Tour',
    'page.contact':       'Contacts',
    'page.catalog':       'Electronic Catalog',
    'page.vudanya':       'DNU Publications',
    'page.elresukr':      'Ukrainian E-Resources',
    'page.elressvit':     'World E-Resources',
    'page.news':          'Latest News',
    'page.newnadhod':     'New Arrivals',
    'page.virt':          'Virtual Exhibitions',
    'page.newsfromlib':   'News from the Stacks',
    'page.leisure':       'Our Leisure',
    'page.donors':        'Donors',
    'page.libnewspaper':  'Library in Media',
  }
};

// ── Застосування перекладу ────────────────────────────────────────────────
function i18nApply(lang) {
  const t = I18N[lang] || I18N.uk;

  // Замінюємо текст усіх елементів з data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      el.textContent = t[key];
    }
  });

  // Заголовок <title> через data-i18n-title на <body>
  const pageKey = document.body.getAttribute('data-i18n-title');
  if (pageKey && t[pageKey]) {
    document.title = t[pageKey] + ' | НБ ДНУ';
  }

  // Підсвітка активного прапора
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    const isActive = btn.getAttribute('data-lang-btn') === lang;
    btn.classList.toggle('opacity-100', isActive);
    btn.classList.toggle('opacity-40',  !isActive);
    btn.classList.toggle('grayscale',   !isActive);
    btn.classList.toggle('grayscale-0', isActive);
  });

  // Запам'ятовуємо вибір
  try { localStorage.setItem('siteLanguage', lang); } catch(e) {}
}

// ── Публічна функція для кнопок ──────────────────────────────────────────
window.switchLang = function(lang) {
  i18nApply(lang);
};

// ── Ініціалізація при завантаженні ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  let saved = 'uk';
  try { saved = localStorage.getItem('siteLanguage') || 'uk'; } catch(e) {}
  i18nApply(saved);
});
