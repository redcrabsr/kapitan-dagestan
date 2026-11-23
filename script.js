/* =========================================================
   Капитан Дагестан — небольшой JavaScript для лендинга
   Что делает:
   1) открывает/закрывает меню на телефоне;
   2) подставляет выбранный маршрут в форму по кнопке карточки;
   3) проверяет форму и показывает красивое сообщение;
   4) форматирует телефон по маске;
   5) современный календарь: дата по умолчанию — завтра, ввод руками и листание месяцев;
   6) подсвечивает активный пункт меню при прокрутке;
   7) год в подвале — всегда актуальный;
   8) живой главный экран: параллакс, точки маршрутов, появление карточек.
   ========================================================= */

/* ---------- Общие помощники для дат ---------- */
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const pad2 = (number) => String(number).padStart(2, '0');

function formatDate(date) {
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
}

// Принимаем «15.07.2026» (и «15.7.2026»), возвращаем Date или null
function parseDateText(value) {
  const match = String(value).trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const valid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? date : null;
}

let selectedDate = null;
let viewDate = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);


// 1. МЕНЮ НА ТЕЛЕФОНЕ
const burger = document.querySelector('.burger');
const nav = document.getElementById('nav');

if (burger && nav) {
  burger.addEventListener('click', () => {
    const willOpen = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(willOpen));
    burger.setAttribute('aria-label', willOpen ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', willOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      burger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    });
  });
}


// 2. КНОПКА «ЗАБРОНИРОВАТЬ» В КАРТОЧКЕ МАРШРУТА
const routeSelect = document.getElementById('field-route');

document.querySelectorAll('[data-route]').forEach((button) => {
  button.addEventListener('click', () => {
    if (routeSelect) {
      routeSelect.value = button.dataset.route;
      routeSelect.classList.remove('is-invalid');
    }

    const formCard = document.getElementById('booking');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(() => {
      const nameField = document.getElementById('field-name');
      if (nameField) nameField.focus({ preventScroll: true });
    }, 550);
  });
});


// 3. МАСКА ДЛЯ ТЕЛЕФОНА: +7 (999) 123-45-67
const phoneField = document.getElementById('field-phone');

if (phoneField) {
  phoneField.addEventListener('input', () => {
    let digits = phoneField.value.replace(/\D/g, '');

    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    let result = '+7';
    if (digits.length > 1) result += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) result += ')';
    if (digits.length > 4) result += ' ' + digits.slice(4, 7);
    if (digits.length >= 7) result += '-' + digits.slice(7, 9);
    if (digits.length >= 9) result += '-' + digits.slice(9, 11);

    phoneField.value = result;
  });
}


// 4. СОВРЕМЕННЫЙ КАЛЕНДАРЬ В ФОРМЕ ЗАЯВКИ
const dateField = document.getElementById('field-date');
const datepicker = document.getElementById('datepicker');
const datePanel = document.getElementById('datepicker-panel');
const monthLabel = document.getElementById('datepicker-month');
const daysGrid = document.getElementById('datepicker-days');

function renderCalendar() {
  if (!monthLabel || !daysGrid) return;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const label = viewDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  monthLabel.textContent = label.charAt(0).toUpperCase() + label.slice(1);

  daysGrid.innerHTML = '';

  // Понедельник — первый день недели
  const emptyCells = (new Date(year, month, 1).getDay() + 6) % 7;
  for (let i = 0; i < emptyCells; i++) {
    const empty = document.createElement('span');
    empty.className = 'datepicker__empty';
    empty.setAttribute('aria-hidden', 'true');
    daysGrid.appendChild(empty);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const current = new Date(year, month, day);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'datepicker__day';
    button.textContent = String(day);
    button.setAttribute('aria-label', formatDate(current));

    if (current < todayStart) {
      button.disabled = true;
    }
    if (current.getTime() === todayStart.getTime()) {
      button.classList.add('is-today');
    }
    if (selectedDate && current.getTime() === selectedDate.getTime()) {
      button.classList.add('is-selected');
    }

    button.addEventListener('click', () => chooseDate(current));
    daysGrid.appendChild(button);
  }
}

function chooseDate(date) {
  selectedDate = new Date(date);
  if (dateField) {
    dateField.value = formatDate(date);
    dateField.classList.remove('is-invalid');
  }
  viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
  renderCalendar();
  closeCalendar();
}

function openCalendar() {
  if (!datePanel) return;
  datePanel.hidden = false;
  dateField?.setAttribute('aria-expanded', 'true');
  datepicker?.querySelector('.datepicker__toggle')?.setAttribute('aria-expanded', 'true');
  renderCalendar();
}

function closeCalendar() {
  if (!datePanel) return;
  datePanel.hidden = true;
  dateField?.setAttribute('aria-expanded', 'false');
  datepicker?.querySelector('.datepicker__toggle')?.setAttribute('aria-expanded', 'false');
}

function shiftMonth(step) {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + step, 1);
  renderCalendar();
}

if (dateField && datepicker && datePanel) {
  renderCalendar();

  // По умолчанию в поле всегда стоит завтрашняя дата
  const tomorrow = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() + 1);
  chooseDate(tomorrow);

  // Ввод даты руками: «15072026» превращается в «15.07.2026»
  dateField.addEventListener('input', () => {
    let digits = dateField.value.replace(/\D/g, '').slice(0, 8);
    let result = digits.slice(0, 2);
    if (digits.length > 2) result += '.' + digits.slice(2, 4);
    if (digits.length > 4) result += '.' + digits.slice(4, 8);
    dateField.value = result;

    const parsed = parseDateText(result);
    if (parsed) {
      selectedDate = parsed;
      viewDate = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
      renderCalendar();
    }
  });

  dateField.addEventListener('focus', openCalendar);

  datepicker.querySelector('.datepicker__toggle')?.addEventListener('click', () => {
    if (datePanel.hidden) openCalendar(); else closeCalendar();
  });

  datepicker.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => shiftMonth(Number(button.dataset.nav)));
  });

  // Прокрутка колесом мыши листает месяцы
  datePanel.addEventListener('wheel', (event) => {
    event.preventDefault();
    shiftMonth(event.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  // Клик вне календаря закрывает его
  document.addEventListener('click', (event) => {
    if (!datepicker.contains(event.target)) closeCalendar();
  });

  // Escape тоже закрывает
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCalendar();
  });
}


// 5. ПРОВЕРКА ФОРМЫ
const form = document.getElementById('booking-form');
const message = document.getElementById('form-message');

if (form && message) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameField = document.getElementById('field-name');
    const phone = document.getElementById('field-phone');
    const consent = form.elements.consent;

    const errors = [];
    let firstBadField = null;

    const markBad = (field, text) => {
      field.classList.add('is-invalid');
      errors.push(text);
      if (!firstBadField) firstBadField = field;
    };

    [nameField, phone, routeSelect, dateField].forEach((field) => {
      if (field) field.classList.remove('is-invalid');
    });

    if (!nameField.value.trim() || nameField.value.trim().length < 2) {
      markBad(nameField, 'Укажите имя — хотя бы 2 символа.');
    }

    const phoneDigits = phone.value.replace(/\D/g, '');
    if (phoneDigits.length < 11) {
      markBad(phone, 'Введите телефон полностью: 11 цифр.');
    }

    if (!routeSelect.value) {
      markBad(routeSelect, 'Выберите маршрут (или «Хочу свой маршрут»).');
    }

    if (!dateField.value.trim()) {
      markBad(dateField, 'Укажите желаемую дату поездки.');
    } else {
      const chosen = parseDateText(dateField.value);
      if (!chosen) {
        markBad(dateField, 'Введите дату в формате ДД.ММ.ГГГГ.');
      } else if (chosen < todayStart) {
        markBad(dateField, 'Дата не может быть раньше сегодняшней.');
      }
    }

    if (!consent.checked) {
      errors.push('Поставьте галочку согласия на обработку данных.');
      if (!firstBadField) firstBadField = consent;
    }

    if (errors.length > 0) {
      message.className = 'form__message is-error';
      message.textContent = errors[0];
      if (firstBadField) firstBadField.focus({ preventScroll: false });
      return;
    }

    const shortName = nameField.value.trim().split(' ')[0];
    message.className = 'form__message is-success';
    message.textContent = `Спасибо, ${shortName}! Заявка принята — мы свяжемся с вами в ближайшее время.`;
    form.reset();
  });

  // Когда человек начинает исправлять поле — убираем красную рамку
  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => field.classList.remove('is-invalid'));
    field.addEventListener('change', () => field.classList.remove('is-invalid'));
  });

  // После отправки снова подставляем завтрашнюю дату
  form.addEventListener('reset', () => {
    selectedDate = null;
    viewDate = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const nextDay = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() + 1);
    // reset сначала очищает поля, поэтому подставляем дату сразу после него
    setTimeout(() => chooseDate(nextDay), 0);
  });
}


// 6. АКТИВНЫЙ ПУНКТ МЕНЮ ПРИ ПРОКРУТКЕ
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav a');

if ('IntersectionObserver' in window && sections.length && navLinks.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach((section) => observer.observe(section));
}


// 7. ГОД В ПОДВАЛЕ — всегда актуальный
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();


// 8. ЖИВАЯ ОТКРЫТКА В ГЛАВЕ «МИНИ-ИГРА»

// 8.1. Лёгкий параллакс: открытка и свет под ней реагируют на движение мыши
const gameSection = document.querySelector('.section--game');

if (gameSection && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  gameSection.addEventListener('pointermove', (event) => {
    const bounds = gameSection.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;

    gameSection.style.setProperty('--mx', x.toFixed(3));
    gameSection.style.setProperty('--my', y.toFixed(3));
  });

  gameSection.addEventListener('pointerleave', () => {
    gameSection.style.setProperty('--mx', '0');
    gameSection.style.setProperty('--my', '0');
  });
}

// 8.2. Точки на карте переключают подпись под ними
const stagePins = document.querySelectorAll('.stage__pin');
const stageCard = document.getElementById('stage-card');

if (stagePins.length && stageCard) {
  stagePins.forEach((pin) => {
    pin.addEventListener('click', () => {
      stagePins.forEach((other) => other.classList.toggle('is-active', other === pin));

      stageCard.querySelector('.stage__card-num').textContent = pin.dataset.num;
      stageCard.querySelector('strong').textContent = pin.dataset.title;
      stageCard.querySelector('small').textContent = pin.dataset.subtitle;

      stageCard.classList.remove('is-flash');
      void stageCard.offsetWidth; // перезапускаем анимацию подсветки
      stageCard.classList.add('is-flash');
    });
  });
}

// 8.3. Карточки плавно появляются, когда до них долистали
if ('IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.card, .section__head, .routes-subhead');

  if (revealTargets.length) {
    document.body.classList.add('js-reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((target) => {
      target.classList.add('reveal');
      revealObserver.observe(target);
    });
  }
}


// 9. БЕГУЩАЯ СТРОКА БЕЗ РЫВКА
// Две дорожки одинаковой ширины. Сдвигаем ровно на ширину одной —
// вторая оказывается на её месте, и цикл повторяется незаметно.
const ticker = document.querySelector('.hero__ticker');
const tickerTrack = document.getElementById('ticker-track');

if (ticker && tickerTrack) {
  const groups = [...tickerTrack.querySelectorAll('.hero__ticker-group')];

  if (groups.length >= 2) {
    const originalHTML = groups[0].innerHTML;

    const setupTicker = () => {
      // Если одна дорожка уже экрана — повторяем список, чтобы не было пустоты
      groups[0].innerHTML = originalHTML;
      let repeats = 0;
      while (groups[0].scrollWidth < ticker.clientWidth + 40 && repeats < 10) {
        groups[0].insertAdjacentHTML('beforeend', originalHTML);
        repeats += 1;
      }

      const fullHTML = groups[0].innerHTML;
      groups.slice(1).forEach((group) => { group.innerHTML = fullHTML; });

      const oneGroupWidth = groups[0].getBoundingClientRect().width;
      if (oneGroupWidth > 0) {
        tickerTrack.style.setProperty('--ticker-shift', `-${oneGroupWidth}px`);
        // примерная скорость 55 px/с — на широком экране строка не «тормозит»
        tickerTrack.style.animationDuration = `${Math.max(20, Math.round(oneGroupWidth / 55))}s`;
      }
    };

    setupTicker();
    window.addEventListener('resize', setupTicker);
  }
}


// 10. ИНТЕРАКТИВНАЯ ГОРА: ХОРОВОД У ФЛАГА И БАРАШКИ-ПУТЕШЕСТВЕННИКИ
// 15 барашков идут по замкнутому кругу: вниз по склону, по земле, вверх
// по другому склону. Каждый второй — медленнее, некоторые замерли и ждут клика.
// Ещё 5 барашков кружат хоровод вокруг флага на вершине.
const ramStage = document.getElementById('ram-stage');
const ramField = document.getElementById('ram-field');

if (ramStage && ramField) {
  const TRAVELERS = 15;
  const DANCERS = 5;
  const PEAK = { x: 300, y: 158 };
  const GROUND_Y = 425;
  const BASE_X = { 1: 555, '-1': 45 };   // справа и слева у подножия
  const DESCENT = 0.38;                  // доли пути: спуск
  const GROUND = 0.30;                   // доли пути: прогулка по земле
  const ASCENT = 0.32;                   // доли пути: подъём

  let ramCount = 0;
  const makeRam = (className, label, art = '#ram-art') => {
    const el = document.createElement('div');
    el.className = `ram ${className}`.trim();
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', label);
    // Рога — отдельный слой: ровно каждому второму барашку, всего 10 из 20.
    // Остальные получают маленькие розовые ушки.
    const index = ramCount++;
    const headGear = index % 2 === 0
      ? '<use href="#ram-horns"/>'
      : '<use href="#ram-ears-pink"/>';
    el.innerHTML =
      '<div class="ram__hearts" aria-hidden="true"><i>♥</i><i>♥</i><i>♥</i></div>' +
      '<div class="ram__stars" aria-hidden="true"><i>★</i><i>★</i><i>★</i></div>' +
      '<div class="ram__body"><svg class="ram__art" viewBox="0 0 100 100" aria-hidden="true">' +
      `<use href="${art}"/>${headGear}</svg></div>`;
    ramField.appendChild(el);
    return el;
  };

  // Проценты совпадают с viewBox картинки (600×520) — барашки не сбиваются с тропы
  const pctX = (x) => `${(x / 600) * 100}%`;
  const pctY = (y) => `${(y / 520) * 100}%`;

  // Хоровод идёт по эллипсу. чтобы лапки не расходились, барашки распределены
  // по РАВНОЙ ДЛИНЕ ДУГИ, а не по равному углу (на эллипсе это не одно и то же).
  const RING = { x: 300, y: 172, rx: 64, ry: 40 };   // тесный хоровод: барашки стоят плечом к плечу
  const ARC_STEPS = 360;
  const arcLengths = [0];
  for (let i = 1; i <= ARC_STEPS; i += 1) {
    const a0 = ((i - 1) / ARC_STEPS) * Math.PI * 2;
    const a1 = (i / ARC_STEPS) * Math.PI * 2;
    const dx = RING.rx * (Math.cos(a1) - Math.cos(a0));
    const dy = RING.ry * (Math.sin(a1) - Math.sin(a0));
    arcLengths.push(arcLengths[i - 1] + Math.hypot(dx, dy));
  }
  const ringLength = arcLengths[ARC_STEPS];

  const ringPoint = (progress) => {
    const target = (((progress % 1) + 1) % 1) * ringLength;
    let low = 0;
    let high = ARC_STEPS;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (arcLengths[mid] < target) low = mid + 1;
      else high = mid;
    }
    const index = Math.max(1, low);
    const segment = arcLengths[index] - arcLengths[index - 1] || 1;
    const part = (target - arcLengths[index - 1]) / segment;
    const angle = ((index - 1 + part) / ARC_STEPS) * Math.PI * 2;
    return {
      x: RING.x + RING.rx * Math.cos(angle),
      y: RING.y + RING.ry * Math.sin(angle)
    };
  };

  const dancers = [];
  for (let i = 0; i < DANCERS; i += 1) {
    dancers.push({
      el: makeRam('is-dancing', 'Барашек в хороводе у флага', '#ram-dancer-art'),
      progress: i / DANCERS,   // по часовой стрелке
      speed: 0.000065,   // полный круг примерно за 15 секунд
      extra: 0
    });
    // Пританцовывание у каждого со своим сдвигом — хоровод не выглядит кукольным
    dancers[i].el.querySelector('.ram__body').style.animationDelay = `${(-i * 0.13).toFixed(2)}s`;
  }

  const travelers = [];
  for (let i = 0; i < TRAVELERS; i += 1) {
    const slow = i % 2 === 1;    // каждый второй барашек медленнее
    const stuck = i % 5 === 4;   // некоторые совсем замерли
    const traveler = {
      el: makeRam('', stuck ? 'Барашек замер, нажмите, чтобы он пошёл' : 'Нажмите, чтобы ускорить барашка'),
      u: (i / TRAVELERS + 0.02) % 1,
      side: i % 2 === 0 ? 1 : -1,   // с какой стороны начинаем спуск
      slow,
      stuck,
      boostLeft: 0,
      roll: 0
    };
    if (stuck) traveler.el.classList.add('is-stuck');
    travelers.push(traveler);
  }

  const puffAt = (el) => {
    const puff = document.createElement('span');
    puff.className = 'ram__puff';
    puff.style.left = el.style.left;
    puff.style.top = el.style.top;
    ramStage.appendChild(puff);
    puff.addEventListener('animationend', () => puff.remove());
  };

  const flashBoost = (el) => {
    el.classList.add('is-boosted');
    setTimeout(() => el.classList.remove('is-boosted'), 260);
    puffAt(el);
  };

  // Двойной клик по барашку — розовые сердечки над головой на секунду, потом они бледнеют
  let lastRamClick = null;
  const showHearts = (el) => {
    const hearts = el.querySelector('.ram__hearts');
    if (!hearts) return;
    el.classList.remove('is-loved');
    void hearts.offsetWidth;   // перезапуск анимации, если кликнули всё ещё летящие сердечки
    el.classList.add('is-loved');
    setTimeout(() => el.classList.remove('is-loved'), 1600);
  };
  const onRamClick = (el) => {
    const now = performance.now();
    if (lastRamClick && lastRamClick.el === el && now - lastRamClick.time < 500) {
      showHearts(el);
      lastRamClick = null;
    } else {
      lastRamClick = { el, time: now };
    }
  };

  const wakeUp = (r) => {
    if (r.stuck) {
      r.stuck = false;
      r.el.classList.remove('is-stuck');
      r.el.setAttribute('aria-label', 'Нажмите, чтобы ускорить барашка');
      r.boostLeft = 1.2;
    } else {
      r.boostLeft = 2;   // ускорение ровно на пару секунд
    }
    flashBoost(r.el);
  };

  travelers.forEach((r) => {
    const onActivate = () => {
      wakeUp(r);
      onRamClick(r.el);
    };
    r.el.addEventListener('click', onActivate);
    r.el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onActivate();
      }
    });
  });

  dancers.forEach((d) => {
    const onActivate = () => {
      // ускоряется весь хоровод сразу, чтобы барашки не расцепили лапки
      dancers.forEach((other) => { other.extra = 1; });
      dancers.forEach((other) => flashBoost(other.el));
      onRamClick(d.el);
    };
    d.el.addEventListener('click', onActivate);
    d.el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onActivate();
      }
    });
  });

  let lastFrame = performance.now();

  const tick = (now) => {
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    // Хоровод вокруг флага строго по часовой стрелке, с равным шагом по дуге
    dancers.forEach((d) => {
      d.extra = Math.max(0, d.extra - dt * 0.5);
      d.progress += d.speed * (1 + 4 * d.extra) * dt * 1000;
      const point = ringPoint(d.progress);
      const ahead = ringPoint(d.progress + 0.005);
      d.el.style.left = pctX(point.x);
      d.el.style.top = pctY(point.y);
      d.el.style.setProperty('--face', ahead.x >= point.x ? '1' : '-1');
    });

    // Замкнутый маршрут: спуск → земля → подъём по другой стороне
    travelers.forEach((r) => {
      if (r.boostLeft > 0) r.boostLeft = Math.max(0, r.boostLeft - dt);

      if (!r.stuck) {
        const boost = 1 + 2.4 * (r.boostLeft / 2);
        const pace = (r.slow ? 0.026 : 0.047) * boost;
        r.u = (r.u + pace * dt) % 1;
      }

      const { el } = r;
      let x;
      let y;
      let face;
      let phase;
      let descentPart = 0;

      if (r.u < DESCENT) {
        descentPart = r.u / DESCENT;
        x = PEAK.x + (BASE_X[r.side] - PEAK.x) * descentPart;
        y = PEAK.y + (GROUND_Y - PEAK.y) * descentPart;
        face = r.side;
        phase = 'down';
      } else if (r.u < DESCENT + GROUND) {
        const part = (r.u - DESCENT) / GROUND;
        x = BASE_X[r.side] + (BASE_X[-r.side] - BASE_X[r.side]) * part;
        y = GROUND_Y;
        face = -r.side;   // у подножия развернулся к горе и пошёл по земле
        phase = 'ground';
      } else {
        const part = (r.u - DESCENT - GROUND) / ASCENT;
        x = BASE_X[-r.side] + (PEAK.x - BASE_X[-r.side]) * part;
        y = GROUND_Y + (PEAK.y - GROUND_Y) * part;
        face = r.side;    // поднимается уже с другой стороны
        phase = 'up';
      }

      el.style.left = pctX(x);
      el.style.top = pctY(y);
      el.style.setProperty('--face', face);
      el.style.setProperty('--ram-scale', phase === 'up' ? '0.94' : '1');

      el.classList.toggle('is-rolling', phase === 'down' && !r.stuck);
      el.classList.toggle('is-ground', phase === 'ground' && !r.stuck);
      el.classList.toggle('is-climbing', phase === 'up' && !r.stuck);
      // звёздочки только в самом низу падения
      el.classList.toggle('is-dizzy', phase === 'down' && descentPart > 0.7 && !r.stuck);

      if (phase === 'down' && !r.stuck) {
        r.roll = (r.roll + dt * 210) % 360;
      } else {
        r.roll += (0 - r.roll) * Math.min(1, dt * 8);
      }
      el.style.setProperty('--roll', `${r.roll}deg`);
    });

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

/* ---------- 9. АЛЬБОМ-КАТАЛОГ: фото и название, смена по таймеру и по клику ---------- */
const album = document.querySelector('.hero__album');

if (album) {
  const photos = [...album.querySelectorAll('.album__photo')];
  const title = album.querySelector('.album__title');
  const frame = album.querySelector('.album__frame');
  let current = 0;

  const showPhoto = (index) => {
    current = (index + photos.length) % photos.length;
    photos.forEach((photo, i) => photo.classList.toggle('is-active', i === current));
    const active = photos[current];
    if (title && active) title.textContent = active.dataset.title || active.alt;
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (photos.length > 1) {
    if (!reduceMotion) setInterval(() => showPhoto(current + 1), 4500);
    if (frame) frame.addEventListener('click', () => showPhoto(current + 1));
  }

  // Лёгкий наклон рамки и золотой свет, следующий за курсором
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    album.addEventListener('pointermove', (event) => {
      const bounds = album.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;

      album.style.setProperty('--ax', x.toFixed(3));
      album.style.setProperty('--ay', y.toFixed(3));
      album.style.setProperty('--gx', `${((x + 1) * 50).toFixed(1)}%`);
      album.style.setProperty('--gy', `${((y + 1) * 50).toFixed(1)}%`);
    });

    album.addEventListener('pointerleave', () => {
      album.style.setProperty('--ax', '0');
      album.style.setProperty('--ay', '0');
      album.style.setProperty('--gx', '50%');
      album.style.setProperty('--gy', '50%');
    });
  }
}
