/* ── Helpers ─────────────────────────────────── */
const $ = id => document.getElementById(id);

// قراءة آمنة من localStorage: لو البيانات تالفة بنرجع القيمة الافتراضية بدل ما التطبيق يقف
function readJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    if (v === null || typeof v !== typeof fallback) return fallback;
    if (Array.isArray(fallback) !== Array.isArray(v)) return fallback;
    return v;
  } catch (e) {
    return fallback;
  }
}

function toArabicNum(n) {
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

/* ── View Transition helper (لتنعيم تبديل الوضع الليلي/النهاري وشكل الواجهة) */
function withViewTransition(fn) {
  if (document.startViewTransition) {
    document.startViewTransition(fn);
  } else {
    fn();
  }
}

/* ── Welcome Modal + مودال التحديثات الجديدة (تظهر مرة واحدة بس) ───── */
const WELCOME_SEEN_KEY = 'designIntroSeen_v4';
const UPDATE_SEEN_KEY = 'updateNoticeSeen_v8';

function closeWelcomeModal() {
  const overlay = $('welcomeOverlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  localStorage.setItem(WELCOME_SEEN_KEY, '1');
}

function maybeShowUpdateNotice() {
  const overlay = $('updateOverlay');
  if (!overlay || localStorage.getItem(UPDATE_SEEN_KEY)) return;
  overlay.classList.add('visible');
}

function closeUpdateNotice() {
  const overlay = $('updateOverlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  localStorage.setItem(UPDATE_SEEN_KEY, '1');
}

(function initWelcomeModal() {
  const overlay = $('welcomeOverlay');
  if (!overlay) return;

  if (!localStorage.getItem(WELCOME_SEEN_KEY)) {
    // مستخدم جديد تمامًا: بيشوف التطبيق بكل مميزاته الحالية من أول لحظة،
    // فمفيش داعي إنه يشوف مودال "إضافات جديدة" كمان علطول بعدها — بنعتبره
    // شافه ضمنيًا ومنعرضهوش تاني، عشان منضايقوش بمودالين ورا بعض.
    try { localStorage.setItem(UPDATE_SEEN_KEY, '1'); } catch (e) {}
    overlay.classList.add('visible');
  } else {
    // مستخدم قديم استخدم التطبيق قبل كده: يستاهل يشوف ملخص الإضافات
    // الجديدة اللي فاتته، فده اللي بيظهرله (لوحده، من غير مودال الترحيب).
    setTimeout(maybeShowUpdateNotice, 320);
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeWelcomeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) closeWelcomeModal();
  });
})();

(function initUpdateNoticeModal() {
  const overlay = $('updateOverlay');
  if (!overlay) return;

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeUpdateNotice();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) closeUpdateNotice();
  });
})();

/* ── Theme Toggle (Dark / Light) ──────────────── */
function applyThemeUI(theme) {
  const btn = $('themeToggle');
  const label = $('themeLabel');
  if (btn) btn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
  if (label) label.textContent = theme === 'dark' ? 'ليلي' : 'فاتح';
}

function toggleTheme() {
  withViewTransition(() => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    applyThemeUI(next);
  });
}

applyThemeUI(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

/* ── Design Toggle (كلاسيك / عصري) ──────────────── */
function applyDesignUI(design) {
  const btn = $('designToggle');
  const label = $('designLabel');
  if (btn) btn.setAttribute('aria-checked', design === 'new' ? 'true' : 'false');
  if (label) label.textContent = design === 'new' ? 'عصري' : 'كلاسيك';
}

function toggleDesign() {
  withViewTransition(() => {
    const root = document.documentElement;
    const current = root.getAttribute('data-design') === 'new' ? 'new' : 'old';
    const next = current === 'new' ? 'old' : 'new';
    root.setAttribute('data-design', next);
    try { localStorage.setItem('design', next); } catch (e) {}
    applyDesignUI(next);
  });
}

applyDesignUI(document.documentElement.getAttribute('data-design') === 'new' ? 'new' : 'old');

/* ── قائمة إعدادات المظهر المنسدلة (شكل الواجهة / الوضع الليلي / اللون) ── */
(function initSettingsMenu() {
  const wrap = $('settingsMenuWrap');
  const trigger = $('settingsTriggerBtn');
  const menu = $('settingsMenu');
  if (!wrap || !trigger || !menu) return;

  window.toggleSettingsMenu = function () {
    const isOpen = wrap.classList.toggle('open');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  };

  function closeMenu() {
    if (!wrap.classList.contains('open')) return;
    wrap.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  }

  document.addEventListener('click', function (e) {
    if (!wrap.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ── الألوان المخصصة (Accent Color) ───────────── */
const ACCENT_KEY = 'accentColor';
const DEFAULT_ACCENT = '#1D9E75';

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s; const l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function shade(hex, deltaL) {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.min(96, Math.max(4, l + deltaL)));
}

function withAlpha(hex, alphaPct) {
  const a = Math.round(alphaPct * 2.55).toString(16).padStart(2, '0');
  return hex + a;
}

function applyAccentColor(hex) {
  if (!hex) return;
  const s = document.documentElement.style;
  s.setProperty('--accent', hex);
  s.setProperty('--accent-dark', shade(hex, -14));
  s.setProperty('--accent-dim', withAlpha(hex, 9));
  s.setProperty('--accent-ring', withAlpha(hex, 19));

  s.setProperty('--present', hex);
  s.setProperty('--present-dark', shade(hex, -12));
  s.setProperty('--present-ink', shade(hex, -20));
  s.setProperty('--present-ring', withAlpha(hex, 25));
  s.setProperty('--present-dim', withAlpha(hex, 14));
}

function resetAccentColor() {
  const s = document.documentElement.style;
  ['--accent', '--accent-dark', '--accent-dim', '--accent-ring',
   '--present', '--present-dark', '--present-ink', '--present-ring', '--present-dim']
    .forEach(v => s.removeProperty(v));
  try { localStorage.removeItem(ACCENT_KEY); } catch (e) {}
  const input = $('accentColorInput');
  if (input) input.value = DEFAULT_ACCENT;
  showToast('تم استعادة اللون الافتراضي ✓');
}

(function initAccentColor() {
  let saved = null;
  try { saved = localStorage.getItem(ACCENT_KEY); } catch (e) {}
  const input = $('accentColorInput');
  if (saved) {
    applyAccentColor(saved);
    if (input) input.value = saved;
  } else if (input) {
    input.value = DEFAULT_ACCENT;
  }
  if (input) {
    input.addEventListener('input', () => {
      applyAccentColor(input.value);
      try { localStorage.setItem(ACCENT_KEY, input.value); } catch (e) {}
    });
  }

  const swatch = $('accentSwatch');
  if (swatch) {
    swatch.addEventListener('dblclick', (e) => {
      e.preventDefault();
      resetAccentColor();
    });
  }
})();

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dateToKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

let selectedPastDays = [];
let selectedDaysToCancel = [];

/* ── Period: 1–15 or 16–end of month ─────────── */
function getPeriod(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  if (d <= 15) {
    return {
      key: `${y}-${m + 1}-A`,
      start: new Date(y, m, 1),
      end: new Date(y, m, 15),
    };
  } else {
    return {
      key: `${y}-${m + 1}-B`,
      start: new Date(y, m, 16),
      end: new Date(y, m + 1, 0),
    };
  }
}

/* ── State ───────────────────────────────────── */
const period = getPeriod();

// احتفظ بالبيانات لكل فترة منفصلة بدل المسح
const storedPeriodKey = localStorage.getItem('periodKey');
if (storedPeriodKey !== period.key) {
  // نحتفظ بالبيانات السابقة تحت مفتاح الفترة القديمة
  if (storedPeriodKey) {
    const oldAttendance = localStorage.getItem('attendance') || '[]';
    const oldHolidays = localStorage.getItem('holidays') || '[]';
    const oldLateDays = localStorage.getItem('lateDays') || '{}';
    const oldOvertimeHours = localStorage.getItem('overtimeHours') || '{}';
    localStorage.setItem(`attendance_${storedPeriodKey}`, oldAttendance);
    localStorage.setItem(`holidays_${storedPeriodKey}`, oldHolidays);
    localStorage.setItem(`lateDays_${storedPeriodKey}`, oldLateDays);
    localStorage.setItem(`overtimeHours_${storedPeriodKey}`, oldOvertimeHours);
  }
  // نبدأ بيانات الفترة الجديدة (نسترجعها لو كانت موجودة مسبقًا)
  const savedAttendance = localStorage.getItem(`attendance_${period.key}`) || '[]';
  const savedHolidays = localStorage.getItem(`holidays_${period.key}`) || '[]';
  const savedLateDays = localStorage.getItem(`lateDays_${period.key}`) || '{}';
  const savedOvertimeHours = localStorage.getItem(`overtimeHours_${period.key}`) || '{}';
  localStorage.setItem('attendance', savedAttendance);
  localStorage.setItem('holidays', savedHolidays);
  localStorage.setItem('lateDays', savedLateDays);
  localStorage.setItem('overtimeHours', savedOvertimeHours);
  localStorage.setItem('periodKey', period.key);
}

let attendance = readJSON('attendance', []);
let holidays = readJSON('holidays', []);
// lateDays: خريطة { 'yyyy-m-d': 0.25 | 0.5 } لأيام الحضور المتأخرة ونسبة الخصم منها
let lateDays = readJSON('lateDays', {});
// overtimeHours: خريطة { 'yyyy-m-d': عدد الساعات } لأيام فيها عمل إضافي بمكافأة
let overtimeHours = readJSON('overtimeHours', {});
let rate = +(localStorage.getItem('rate') || 225);
let deduction = +(localStorage.getItem('deduction') || 0);
let overtimeRate = +(localStorage.getItem('overtimeRate') || 0);

/* ── العملة ──────────────────────────────────── */
const CURRENCIES = {
  EGP: 'جنيه', SAR: 'ريال سعودي', AED: 'درهم إماراتي',
  USD: 'دولار', KWD: 'دينار كويتي', QAR: 'ريال قطري'
};
let currency = localStorage.getItem('currency') || 'EGP';

function applyCurrencyUI() {
  const label = CURRENCIES[currency] || CURRENCIES.EGP;
  document.querySelectorAll('.currency-unit').forEach(el => { el.textContent = label; });
  const sel = $('currencySelect');
  if (sel && sel.value !== currency) sel.value = currency;
}

/* ── Helpers: التعامل مع بيانات كل فترة بشكل صحيح ── */
function periodKeyForDate(date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return d <= 15 ? `${y}-${m + 1}-A` : `${y}-${m + 1}-B`;
}

function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function periodKeyForKey(key) {
  return periodKeyForDate(keyToDate(key));
}

function getStoredPeriodData(key) {
  return {
    attendance: readJSON(`attendance_${key}`, []),
    holidays: readJSON(`holidays_${key}`, []),
    lateDays: readJSON(`lateDays_${key}`, {}),
    overtimeHours: readJSON(`overtimeHours_${key}`, {}),
  };
}

// يحفظ بيانات فترة معيّنة، ويحدّث المتغيرات الحالية لو كانت هي الفترة الشغالة
function setStoredPeriodData(key, att, hol, late, ot) {
  late = late || {};
  ot = ot || {};
  localStorage.setItem(`attendance_${key}`, JSON.stringify(att));
  localStorage.setItem(`holidays_${key}`, JSON.stringify(hol));
  localStorage.setItem(`lateDays_${key}`, JSON.stringify(late));
  localStorage.setItem(`overtimeHours_${key}`, JSON.stringify(ot));
  if (key === period.key) {
    attendance = att;
    holidays = hol;
    lateDays = late;
    overtimeHours = ot;
    localStorage.setItem('attendance', JSON.stringify(att));
    localStorage.setItem('holidays', JSON.stringify(hol));
    localStorage.setItem('lateDays', JSON.stringify(late));
    localStorage.setItem('overtimeHours', JSON.stringify(ot));
  }
}

// هل مفتاح يوم معين مسجل كإجازة رسمية؟ (بيرجع لبيانات فترته الصحيحة أيًا كان الشهر المعروض)
function isKeyHoliday(key) {
  const pk = periodKeyForKey(key);
  const hol = pk === period.key ? holidays : getStoredPeriodData(pk).holidays;
  return hol.includes(key);
}

// دمج بيانات فترتي الشهر (A و B) معًا — بيقبل سنة/شهر اختياريين لدعم تصفح الشهور
function getMonthAttendance(y, m) {
  const now = new Date();
  if (y === undefined) y = now.getFullYear();
  if (m === undefined) m = now.getMonth();
  const keyA = `${y}-${m + 1}-A`;
  const keyB = `${y}-${m + 1}-B`;
  const dataA = keyA === period.key ? attendance : getStoredPeriodData(keyA).attendance;
  const dataB = keyB === period.key ? attendance : getStoredPeriodData(keyB).attendance;
  return [...new Set([...dataA, ...dataB])];
}

function getMonthHolidays(y, m) {
  const now = new Date();
  if (y === undefined) y = now.getFullYear();
  if (m === undefined) m = now.getMonth();
  const keyA = `${y}-${m + 1}-A`;
  const keyB = `${y}-${m + 1}-B`;
  const dataA = keyA === period.key ? holidays : getStoredPeriodData(keyA).holidays;
  const dataB = keyB === period.key ? holidays : getStoredPeriodData(keyB).holidays;
  return [...new Set([...dataA, ...dataB])];
}

function getMonthLateDays(y, m) {
  const now = new Date();
  if (y === undefined) y = now.getFullYear();
  if (m === undefined) m = now.getMonth();
  const keyA = `${y}-${m + 1}-A`;
  const keyB = `${y}-${m + 1}-B`;
  const dataA = keyA === period.key ? lateDays : getStoredPeriodData(keyA).lateDays;
  const dataB = keyB === period.key ? lateDays : getStoredPeriodData(keyB).lateDays;
  return { ...dataA, ...dataB };
}

function getMonthOvertimeHours(y, m) {
  const now = new Date();
  if (y === undefined) y = now.getFullYear();
  if (m === undefined) m = now.getMonth();
  const keyA = `${y}-${m + 1}-A`;
  const keyB = `${y}-${m + 1}-B`;
  const dataA = keyA === period.key ? overtimeHours : getStoredPeriodData(keyA).overtimeHours;
  const dataB = keyB === period.key ? overtimeHours : getStoredPeriodData(keyB).overtimeHours;
  return { ...dataA, ...dataB };
}

$('dailyRate').value = rate;
$('deductionInput').value = deduction;
if ($('overtimeRateInput')) $('overtimeRateInput').value = overtimeRate;

/* ── Toast ───────────────────────────────────── */
let toastTimer = null;

function showToast(text, isError = false) {
  const el = $('message');
  el.textContent = text;
  el.className = 'toast visible' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3000);
}

/* ── Actions ─────────────────────────────────── */
function markAttendance() {
  const now = new Date();
  if (now.getDay() === 5 || now.getDay() === 6) {
    showToast('الجمعة والسبت إجازة أسبوعية', true);
    return;
  }
  const key = todayKey();
  if (attendance.includes(key)) {
    showToast('تم تسجيل اليوم بالفعل ✓', true);
    return;
  }
  // بدل التسجيل المباشر: نسأل هل الحضور كامل ولا فيه تأخير أو عمل إضافي
  openLatenessModal([key], 'today');
}

function removeToday() {
  const key = todayKey();
  if (attendance.includes(key)) {
    attendance = attendance.filter(k => k !== key);
    delete lateDays[key];
    delete overtimeHours[key];
    save();
    showToast('تم إلغاء حضور اليوم');
    render();
    return;
  }
  if (holidays.includes(key)) {
    holidays = holidays.filter(k => k !== key);
    save();
    showToast('تم إلغاء إجازة اليوم');
    render();
    return;
  }
  showToast('لا يوجد تسجيل لليوم', true);
}

/* ── تسجيل اليوم كإجازة رسمية فورًا ───────────── */
function markTodayAsHoliday() {
  const now = new Date();
  if (now.getDay() === 5 || now.getDay() === 6) {
    showToast('الجمعة والسبت إجازة أسبوعية بالفعل', true);
    return;
  }
  const key = todayKey();
  if (holidays.includes(key)) {
    showToast('تم تسجيل اليوم كإجازة بالفعل ✓', true);
    return;
  }
  attendance = attendance.filter(k => k !== key);
  delete lateDays[key];
  delete overtimeHours[key];
  holidays.push(key);
  save();
  showToast('تم تسجيل اليوم كإجازة رسمية ✓');
  render();
}

/* ── مودال اختيار نوع الحضور (كامل / متأخر / عمل إضافي) ───── */
let pendingAttendanceKeys = [];
let pendingAttendanceContext = null; // 'today' | 'bulk'

function openLatenessModal(keys, context) {
  pendingAttendanceKeys = keys;
  pendingAttendanceContext = context;
  const overlay = $('latenessOverlay');
  if (overlay) overlay.classList.add('visible');
}

function closeLatenessModal() {
  const overlay = $('latenessOverlay');
  if (overlay) overlay.classList.remove('visible');
  const otRow = $('overtimeInputRow');
  if (otRow) otRow.classList.remove('visible');
  pendingAttendanceKeys = [];
  pendingAttendanceContext = null;
}

// يسجل الأيام الممرّرة كحضور، ويضبط نسبة خصم التأخير أو ساعات العمل الإضافي، أو يمسحهم لو حضور كامل
function commitAttendance(keys, fraction, otHours) {
  const groups = {};
  keys.forEach(key => {
    const pk = periodKeyForKey(key);
    (groups[pk] = groups[pk] || []).push(key);
  });
  Object.entries(groups).forEach(([pk, ks]) => {
    const data = pk === period.key
      ? { attendance: [...attendance], holidays: [...holidays], lateDays: { ...lateDays }, overtimeHours: { ...overtimeHours } }
      : getStoredPeriodData(pk);
    ks.forEach(k => {
      // لو اليوم كان مسجل كإجازة رسمية، نلغي الإجازة عشان نقدر نسجله حضور
      data.holidays = data.holidays.filter(h => h !== k);
      if (!data.attendance.includes(k)) data.attendance.push(k);
      if (fraction) {
        data.lateDays[k] = fraction;
      } else {
        delete data.lateDays[k];
      }
      if (otHours && otHours > 0) {
        data.overtimeHours[k] = otHours;
      } else {
        delete data.overtimeHours[k];
      }
    });
    setStoredPeriodData(pk, data.attendance, data.holidays, data.lateDays, data.overtimeHours);
  });
}

function confirmAttendanceType(fraction, otHours) {
  const keys = pendingAttendanceKeys;
  const context = pendingAttendanceContext;
  if (!keys || keys.length === 0) {
    closeLatenessModal();
    return;
  }
  commitAttendance(keys, fraction, otHours);
  closeLatenessModal();

  let msg;
  if (otHours && otHours > 0) {
    msg = `تم تسجيل ${toArabicNum(otHours)} ساعة عمل إضافي ✓`;
  } else if (fraction) {
    msg = context === 'today' ? 'تم تسجيل الحضور (متأخر) ✓' : 'تم تسجيل الأيام المحددة (متأخر) ✓';
  } else {
    msg = context === 'today' ? 'تم تسجيل الحضور ✓' : 'تم تسجيل الأيام المحددة بنجاح ✓';
  }
  if (context !== 'today') selectedPastDays = [];
  showToast(msg);
  render();
}

(function initLatenessModal() {
  const overlay = $('latenessOverlay');
  if (!overlay) return;

  const fullBtn = $('latenessFullBtn');
  const quarterBtn = $('latenessQuarterBtn');
  const halfBtn = $('latenessHalfBtn');
  const overtimeBtn = $('latenessOvertimeBtn');
  const overtimeRow = $('overtimeInputRow');
  const overtimeInput = $('overtimeHoursInput');
  const overtimeConfirmBtn = $('overtimeConfirmBtn');

  if (fullBtn) fullBtn.addEventListener('click', () => confirmAttendanceType(null));
  if (quarterBtn) quarterBtn.addEventListener('click', () => confirmAttendanceType(0.25));
  if (halfBtn) halfBtn.addEventListener('click', () => confirmAttendanceType(0.5));

  if (overtimeBtn && overtimeRow) {
    overtimeBtn.addEventListener('click', () => {
      const isOpen = overtimeRow.classList.toggle('visible');
      if (isOpen && overtimeInput) {
        overtimeInput.value = overtimeInput.value || '1';
        overtimeInput.focus();
      }
    });
  }

  if (overtimeConfirmBtn) {
    overtimeConfirmBtn.addEventListener('click', () => {
      const hrs = Math.max(0.5, +(overtimeInput && overtimeInput.value) || 1);
      confirmAttendanceType(null, hrs);
    });
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLatenessModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) closeLatenessModal();
  });
})();

function saveSelectedDays() {
  if (selectedPastDays.length === 0) return;
  // نسأل هل الأيام المحددة حضور كامل ولا فيها تأخير أو عمل إضافي قبل الحفظ
  openLatenessModal([...selectedPastDays], 'bulk');
}

function cancelSelectedDays() {
  // يلغي فقط أيام الحضور من القائمة (ليس الإجازات)
  const presentOnly = selectedDaysToCancel.filter(k => !isKeyHoliday(k));
  if (presentOnly.length === 0) return;

  const groups = {};
  presentOnly.forEach(key => {
    const pk = periodKeyForKey(key);
    (groups[pk] = groups[pk] || []).push(key);
  });
  Object.entries(groups).forEach(([pk, keys]) => {
    const data = pk === period.key
      ? { attendance: [...attendance], holidays: [...holidays], lateDays: { ...lateDays }, overtimeHours: { ...overtimeHours } }
      : getStoredPeriodData(pk);
    data.attendance = data.attendance.filter(k => !keys.includes(k));
    keys.forEach(k => { delete data.lateDays[k]; delete data.overtimeHours[k]; });
    setStoredPeriodData(pk, data.attendance, data.holidays, data.lateDays, data.overtimeHours);
  });

  selectedDaysToCancel = selectedDaysToCancel.filter(k => isKeyHoliday(k));
  render();
  showToast('تم إلغاء حضور الأيام المحددة ✓');
}

/* ── وظيفة تسجيل إجازة رسمية ── */
function markSelectedAsHoliday() {
  // ضم الأيام المختارة للتسجيل + أيام الحضور المختارة للإلغاء
  const selected = [...selectedPastDays, ...selectedDaysToCancel];

  if (selected.length === 0) return;

  const groups = {};
  selected.forEach(key => {
    const pk = periodKeyForKey(key);
    (groups[pk] = groups[pk] || []).push(key);
  });

  Object.entries(groups).forEach(([pk, keys]) => {
    const data = pk === period.key
      ? { attendance: [...attendance], holidays: [...holidays], lateDays: { ...lateDays }, overtimeHours: { ...overtimeHours } }
      : getStoredPeriodData(pk);

    keys.forEach(key => {
      data.attendance = data.attendance.filter(k => k !== key);
      delete data.lateDays[key];
      delete data.overtimeHours[key];
      if (!data.holidays.includes(key)) data.holidays.push(key);
    });

    setStoredPeriodData(pk, data.attendance, data.holidays, data.lateDays, data.overtimeHours);
  });

  selectedPastDays = [];
  selectedDaysToCancel = [];

  render();
  showToast('تم تحويل الأيام المحددة إلى إجازة رسمية ✓');
}

/* ── إلغاء إجازات رسمية محددة ─────────────────── */
function cancelSelectedHolidays() {
  if (selectedDaysToCancel.length === 0) return;

  const groups = {};
  selectedDaysToCancel.forEach(key => {
    const pk = periodKeyForKey(key);
    (groups[pk] = groups[pk] || []).push(key);
  });
  Object.entries(groups).forEach(([pk, keys]) => {
    const data = pk === period.key
      ? { attendance: [...attendance], holidays: [...holidays], lateDays: { ...lateDays }, overtimeHours: { ...overtimeHours } }
      : getStoredPeriodData(pk);
    data.holidays = data.holidays.filter(k => !keys.includes(k));
    setStoredPeriodData(pk, data.attendance, data.holidays, data.lateDays, data.overtimeHours);
  });

  selectedDaysToCancel = [];
  render();
  showToast('تم إلغاء الإجازات المحددة ✓');
}

function saveSettings() {
  rate = Math.max(1, +$('dailyRate').value || 225);
  deduction = Math.max(0, +$('deductionInput').value || 0);
  overtimeRate = Math.max(0, +($('overtimeRateInput') ? $('overtimeRateInput').value : 0) || 0);
  if ($('currencySelect')) currency = $('currencySelect').value;

  localStorage.setItem('rate', rate);
  localStorage.setItem('deduction', deduction);
  localStorage.setItem('overtimeRate', overtimeRate);
  localStorage.setItem('currency', currency);

  showToast('تم حفظ الإعدادات ✓');
  render();
}

function save() {
  localStorage.setItem('attendance', JSON.stringify(attendance));
  localStorage.setItem('holidays', JSON.stringify(holidays));
  localStorage.setItem('lateDays', JSON.stringify(lateDays));
  localStorage.setItem('overtimeHours', JSON.stringify(overtimeHours));
  // احفظ نسخة مرتبطة بالفترة أيضًا
  localStorage.setItem(`attendance_${period.key}`, JSON.stringify(attendance));
  localStorage.setItem(`holidays_${period.key}`, JSON.stringify(holidays));
  localStorage.setItem(`lateDays_${period.key}`, JSON.stringify(lateDays));
  localStorage.setItem(`overtimeHours_${period.key}`, JSON.stringify(overtimeHours));
}

/* ── حساب أيام الغياب على الشهر كله ──────────── */
function getAbsentDays() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const todayK = todayKey();
  const monthAttendance = getMonthAttendance();
  const monthHolidays = getMonthHolidays();
  let absent = 0;
  const cur = new Date(y, m, 1);
  while (true) {
    const key = dateToKey(cur);
    if (key >= todayK) break;
    const dow = cur.getDay();
    if (dow !== 5 && dow !== 6 && !monthHolidays.includes(key) && !monthAttendance.includes(key)) {
      absent++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return absent;
}

/* ── Render ──────────────────────────────────── */
function render() {
  const now = new Date();

  // احسب أيام الحضور ضمن الشهر الحالي كله (مقارنة string لتفادي مشاكل UTC)
  const periodStartKey = dateToKey(period.start);
  const periodEndKey = dateToKey(period.end);
  const attendanceInPeriod = attendance.filter(k => k >= periodStartKey && k <= periodEndKey);

  // خصم التأخير + مكافأة العمل الإضافي ضمن الفترة الحالية
  let lateDeduction = 0;
  let overtimeBonus = 0;
  attendanceInPeriod.forEach(k => {
    const frac = lateDays[k];
    if (frac) lateDeduction += rate * frac;
    const oh = overtimeHours[k];
    if (oh) overtimeBonus += oh * overtimeRate;
  });

  const net = Math.max(0, attendanceInPeriod.length * rate - lateDeduction - deduction + overtimeBonus);

  // حساب الأيام المتبقية لنهاية الفترة الحالية
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfPeriodEnd = new Date(period.end.getFullYear(), period.end.getMonth(), period.end.getDate());
  let daysLeft = Math.ceil((startOfPeriodEnd - startOfToday) / 86400000);
  if (daysLeft < 0) daysLeft = 0;

  const elapsed = now - period.start;
  const total = period.end - period.start + 86400000;
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));

  const absentDays = getAbsentDays();

  // Hero
  $('salary').textContent = toArabicNum(net.toLocaleString('ar-EG'));

  // Stats
  $('daysCount').textContent = toArabicNum(attendanceInPeriod.length);
  $('remainingDays').textContent = toArabicNum(daysLeft);
  $('absentDays').textContent = toArabicNum(absentDays);

  // Period text
  const fmt = d => d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
  $('periodText').textContent = `${fmt(period.start)} — ${fmt(period.end)}`;

  // Progress
  $('progressFill').style.width = pct.toFixed(1) + '%';
  $('progressPct').textContent = toArabicNum(Math.round(pct)) + '٪';

  // Header date
  $('headerDate').textContent = now.toLocaleDateString('ar-EG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  applyCurrencyUI();
  buildCalendar();
}

/* ── Calendar (مع دعم التنقل بين الشهور) ──────── */
let viewedYear = new Date().getFullYear();
let viewedMonth = new Date().getMonth();

function navigateMonth(delta) {
  const now = new Date();
  let y = viewedYear, m = viewedMonth + delta;
  if (m < 0) { m = 11; y--; }
  if (m > 11) { m = 0; y++; }
  // امنع التنقل لشهر في المستقبل
  if (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth())) return;
  viewedYear = y;
  viewedMonth = m;
  buildCalendar();
}

function buildCalendar() {
  const cal = $('calendar');
  cal.innerHTML = '';

  // إعادة تهيئة التحديدات عند إعادة البناء
  selectedPastDays = [];
  selectedDaysToCancel = [];

  const now = new Date();
  const y = viewedYear;
  const m = viewedMonth;
  const days = new Date(y, m + 1, 0).getDate();
  const isCurrentMonth = y === now.getFullYear() && m === now.getMonth();

  // تحديث عنوان الشهر وحالة زر "التالي"
  const titleEl = $('calMonthTitle');
  if (titleEl) {
    titleEl.textContent = new Date(y, m, 1).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
  }
  const nextBtn = $('calNextBtn');
  if (nextBtn) nextBtn.disabled = isCurrentMonth;

  const firstDay = new Date(y, m, 1).getDay();
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'day day-blank';
    blank.setAttribute('aria-hidden', 'true');
    cal.appendChild(blank);
  }

  // بيانات الشهر المعروض كله (الفترتين A و B مجتمعتين)
  const monthAttendance = getMonthAttendance(y, m);
  const monthHolidays = getMonthHolidays(y, m);
  const monthLateDays = getMonthLateDays(y, m);
  const monthOvertime = getMonthOvertimeHours(y, m);

  for (let d = 1; d <= days; d++) {
    const date = new Date(y, m, d);
    const key = dateToKey(date);
    const isToday = isCurrentMonth && d === now.getDate();
    const isWeekend = date.getDay() === 5 || date.getDay() === 6;
    const isPresent = monthAttendance.includes(key);
    const isHoliday = monthHolidays.includes(key);
    const lateFraction = isPresent ? monthLateDays[key] : null;
    const otHours = isPresent ? monthOvertime[key] : null;
    const isFuture = isCurrentMonth
      ? d > now.getDate()
      : (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth()));

    const cell = document.createElement('div');
    cell.textContent = toArabicNum(d);

    let cls = 'day';
    if (isHoliday) {
      cls += ' holiday';
    } else if (isPresent) {
      cls += ' present';
      if (lateFraction) cls += ' late';
      if (otHours) cls += ' overtime';
    } else if (isWeekend) {
      cls += ' weekend';
    } else if (isFuture) {
      cls += ' future';
    } else if (!isToday) {
      cls += ' absent';
    }
    if (isToday) cls += ' today';

    cell.className = cls;

    if (lateFraction) {
      const badge = document.createElement('span');
      badge.className = 'day-badge';
      badge.textContent = lateFraction === 0.5 ? '½' : '¼';
      cell.appendChild(badge);
      cell.title = lateFraction === 0.5 ? 'متأخر — خصم نص يوم' : 'متأخر — خصم ربع يوم';
    } else if (otHours) {
      const badge = document.createElement('span');
      badge.className = 'day-badge day-badge-overtime';
      badge.textContent = '+' + toArabicNum(otHours);
      cell.appendChild(badge);
      cell.title = `عمل إضافي — ${toArabicNum(otHours)} ساعة`;
    }

    // ── منطق النقر ────────────────────────────
    cell.onclick = () => {
      if (isFuture) return showToast('لا يمكن تحديد يوم في المستقبل', true);
      if (isWeekend) return showToast('الجمعة والسبت إجازة أسبوعية', true);
      if (isToday) return showToast('استخدم الأزرار أعلاه للتعامل مع اليوم الحالي', true);

      if (isHoliday) {
        if (selectedDaysToCancel.includes(key)) {
          selectedDaysToCancel = selectedDaysToCancel.filter(k => k !== key);
          selectedPastDays = selectedPastDays.filter(k => k !== key);
          cell.classList.remove('selected-cancel');
        } else {
          selectedDaysToCancel.push(key);
          selectedPastDays.push(key);
          cell.classList.add('selected-cancel');
        }
        updateActionButtons();
        return;
      }

      if (isPresent) {
        if (selectedDaysToCancel.includes(key)) {
          selectedDaysToCancel = selectedDaysToCancel.filter(k => k !== key);
          cell.classList.remove('selected-cancel');
        } else {
          selectedDaysToCancel.push(key);
          cell.classList.add('selected-cancel');
        }
      } else {
        if (selectedPastDays.includes(key)) {
          selectedPastDays = selectedPastDays.filter(k => k !== key);
          cell.classList.remove('selected');
        } else {
          selectedPastDays.push(key);
          cell.classList.add('selected');
        }
      }

      updateActionButtons();
    };

    cal.appendChild(cell);
  }

  updateActionButtons();
}

/* ── تحديث أزرار الإجراءات ─────────────────────── */
function updateActionButtons() {
  const btnSave = $('btnSaveSelected');
  const btnCancel = $('btnCancelSelected');
  const btnHoliday = $('btnMarkHoliday');
  const btnCancelHol = $('btnCancelHolidays');

  const hasAbsentSelected = selectedPastDays.length > 0;
  const hasHolidaySelected = selectedDaysToCancel.some(k => isKeyHoliday(k));
  const hasPresentSelected = selectedDaysToCancel.some(k => !isKeyHoliday(k));
  const hasNonHolidayAbsentSelected = selectedPastDays.some(k => !isKeyHoliday(k));

  const show = (el, visible, type = 'flex') => {
    if (!el) return;
    const wasHidden = el.style.display === 'none' || el.style.display === '';
    el.style.display = visible ? type : 'none';
    if (visible && wasHidden) {
      el.removeEventListener('click', addRipple);
      el.addEventListener('click', addRipple);
    }
  };

  show(btnSave, hasAbsentSelected, 'block');
  show(btnCancel, hasPresentSelected, 'flex');
  show(btnHoliday, hasNonHolidayAbsentSelected || hasPresentSelected, 'flex');
  show(btnCancelHol, hasHolidaySelected, 'flex');
}

/* ── تقرير الأداء الشامل (آخر 6 أشهر) ─────────── */
function computeMonthSummary(year, monthIdx) {
  const now = new Date();
  const isCurrent = year === now.getFullYear() && monthIdx === now.getMonth();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const cutoffDay = isCurrent ? now.getDate() : daysInMonth + 1; // نهاية غير شاملة

  const monthAttendance = getMonthAttendance(year, monthIdx);
  const monthHolidays = getMonthHolidays(year, monthIdx);
  const monthLate = getMonthLateDays(year, monthIdx);
  const monthOT = getMonthOvertimeHours(year, monthIdx);

  let present = 0, absent = 0, holidaysCount = 0, lateDeduction = 0, overtimeBonus = 0;

  for (let d = 1; d < cutoffDay; d++) {
    const date = new Date(year, monthIdx, d);
    const key = dateToKey(date);
    const dow = date.getDay();
    if (dow === 5 || dow === 6) continue;
    if (monthHolidays.includes(key)) { holidaysCount++; continue; }
    if (monthAttendance.includes(key)) {
      present++;
      if (monthLate[key]) lateDeduction += rate * monthLate[key];
      if (monthOT[key]) overtimeBonus += monthOT[key] * overtimeRate;
    } else {
      absent++;
    }
  }

  const net = Math.max(0, present * rate - lateDeduction + overtimeBonus);
  return { year, monthIdx, present, absent, holidaysCount, overtimeBonus, net };
}

function openReportModal() {
  const overlay = $('reportOverlay');
  const list = $('reportList');
  if (!overlay || !list) return;
  list.innerHTML = '';

  const now = new Date();
  const months = [];
  for (let i = 0; i < 6; i++) {
    let m = now.getMonth() - i, y = now.getFullYear();
    while (m < 0) { m += 12; y--; }
    months.push(computeMonthSummary(y, m));
  }

  const maxPresent = Math.max(1, ...months.map(mm => mm.present));
  const totalNet = months.reduce((s, mm) => s + mm.net, 0);
  const totalPresent = months.reduce((s, mm) => s + mm.present, 0);
  const totalAbsent = months.reduce((s, mm) => s + mm.absent, 0);
  const unitLabel = CURRENCIES[currency] || CURRENCIES.EGP;

  months.forEach(mm => {
    const row = document.createElement('div');
    row.className = 'report-month-card';
    const barPct = Math.round((mm.present / maxPresent) * 100);
    const monthName = new Date(mm.year, mm.monthIdx, 1).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
    row.innerHTML = `
      <div class="report-month-head">
        <span class="report-month-name">${monthName}</span>
        <span class="report-month-net">${toArabicNum(Math.round(mm.net).toLocaleString('ar-EG'))} ${unitLabel}</span>
      </div>
      <div class="report-bar-track"><div class="report-bar-fill" style="width:${barPct}%"></div></div>
      <div class="report-month-stats">
        <span>حضور ${toArabicNum(mm.present)}</span>
        <span>غياب ${toArabicNum(mm.absent)}</span>
        <span>إجازات ${toArabicNum(mm.holidaysCount)}</span>
        ${mm.overtimeBonus > 0 ? `<span class="report-ot">إضافي +${toArabicNum(Math.round(mm.overtimeBonus))}</span>` : ''}
      </div>
    `;
    list.appendChild(row);
  });

  const totalsEl = $('reportTotals');
  if (totalsEl) {
    totalsEl.innerHTML = `
      <span class="report-totals-label">إجمالي آخر ٦ أشهر</span>
      <strong class="report-totals-amount">${toArabicNum(Math.round(totalNet).toLocaleString('ar-EG'))} ${unitLabel}</strong>
      <span class="report-totals-sub">${toArabicNum(totalPresent)} يوم حضور · ${toArabicNum(totalAbsent)} يوم غياب</span>
    `;
  }

  overlay.classList.add('visible');
}

function closeReportModal() {
  const overlay = $('reportOverlay');
  if (overlay) overlay.classList.remove('visible');
}

(function initReportModal() {
  const overlay = $('reportOverlay');
  if (!overlay) return;
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeReportModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) closeReportModal();
  });
})();

/* ── Skeleton Loading ──────────────────────────── */
function revealApp() {
  const skeleton = $('appSkeleton');
  const content = $('appContent');
  if (skeleton) skeleton.classList.add('hidden');
  if (content) content.classList.add('ready');
}

/* ── Init ────────────────────────────────────── */
render();
requestAnimationFrame(() => setTimeout(revealApp, 240));

/* ── Ripple Effect ───────────────────────────── */
function addRipple(e) {
  const btn = e.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const radius = diameter / 2;
  const rect = btn.getBoundingClientRect();
  circle.style.cssText = `
    width: ${diameter}px;
    height: ${diameter}px;
    left: ${e.clientX - rect.left - radius}px;
    top: ${e.clientY - rect.top - radius}px;
  `;
  circle.classList.add('ripple');
  const existing = btn.querySelector('.ripple');
  if (existing) existing.remove();
  btn.appendChild(circle);
}

document.querySelectorAll('.btn-attend, .btn-cancel, .btn-save, .btn-holiday').forEach(btn => {
  btn.addEventListener('click', addRipple);
});

/* ── Greeting: اسم شخصي قابل للتعديل فوق الهيدر ───────────────── */
const GREETING_NAME_KEY = 'greetingUserName';

function timeGreetingPrefix() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'صباح الخير يا';
  if (h >= 12 && h < 17) return 'أهلاً يا';
  if (h >= 17 && h < 21) return 'مساء الخير يا';
  return 'أهلاً يا';
}

(function initGreeting() {
  const prefixEl = $('greetingPrefix');
  const displayEl = $('greetingNameDisplay');
  const inputEl = $('greetingNameInput');
  if (!displayEl || !inputEl) return;

  if (prefixEl) prefixEl.textContent = timeGreetingPrefix();

  let currentName = '';
  try { currentName = (localStorage.getItem(GREETING_NAME_KEY) || '').trim(); } catch (e) {}

  function renderName(name) {
    if (name) {
      displayEl.textContent = name;
      displayEl.classList.remove('is-placeholder');
    } else {
      displayEl.textContent = 'اسمك هنا';
      displayEl.classList.add('is-placeholder');
    }
  }

  function enterEditMode() {
    inputEl.value = currentName;
    displayEl.style.display = 'none';
    inputEl.style.display = '';
    inputEl.focus();
    inputEl.select();
  }

  function saveAndExitEditMode() {
    const value = inputEl.value.trim().slice(0, 20);
    currentName = value;
    try { localStorage.setItem(GREETING_NAME_KEY, value); } catch (e) {}
    renderName(currentName);
    inputEl.style.display = 'none';
    displayEl.style.display = '';
  }

  renderName(currentName);

  displayEl.addEventListener('click', enterEditMode);
  displayEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      enterEditMode();
    }
  });

  inputEl.addEventListener('blur', saveAndExitEditMode);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputEl.blur();
    } else if (e.key === 'Escape') {
      inputEl.value = currentName;
      inputEl.blur();
    }
  });
})();

/* ── رقم السجل: أرقام فقط وبحد أقصى ٦ خانات ─────────────────── */
const WORK_RECORD_KEY = 'greetingWorkRecord';
const WORK_RECORD_MAX = 6;

// بيحوّل الأرقام العربية/الفارسية لأرقام إنجليزية، وبيشيل أي حاجة مش رقم
function cleanRecordDigits(str) {
  return String(str == null ? '' : str)
    .replace(/[\u0660-\u0669]/g, d => d.charCodeAt(0) - 0x0660)
    .replace(/[\u06F0-\u06F9]/g, d => d.charCodeAt(0) - 0x06F0)
    .replace(/\D/g, '');
}

(function initWorkRecord() {
  const boxEl = $('workRecord');
  const displayEl = $('workRecordDisplay');
  const inputEl = $('workRecordInput');
  const hintEl = $('workRecordHint');
  if (!boxEl || !displayEl || !inputEl) return;

  // القيمة المحفوظة (بأرقام إنجليزي) — وأي قيمة قديمة فيها حروف بتتنضف أوتوماتيك
  let stored = '';
  try { stored = localStorage.getItem(WORK_RECORD_KEY) || ''; } catch (e) {}
  let currentValue = cleanRecordDigits(stored).slice(0, WORK_RECORD_MAX);
  if (currentValue !== stored) {
    try {
      if (currentValue) localStorage.setItem(WORK_RECORD_KEY, currentValue);
      else localStorage.removeItem(WORK_RECORD_KEY);
    } catch (e) {}
  }

  let editing = false;
  let hintTimer = null;

  function showHint(text) {
    if (!hintEl) return;
    hintEl.textContent = text;
    hintEl.classList.add('show');
    boxEl.classList.remove('is-invalid');
    void boxEl.offsetWidth; // إعادة تشغيل حركة الاهتزاز
    boxEl.classList.add('is-invalid');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(hideHint, 1800);
  }

  function hideHint() {
    clearTimeout(hintTimer);
    if (hintEl) hintEl.classList.remove('show');
    boxEl.classList.remove('is-invalid');
  }

  function renderValue(value) {
    if (value) {
      displayEl.textContent = toArabicNum(value);
      displayEl.classList.remove('is-placeholder');
    } else {
      displayEl.textContent = 'أضف رقمك';
      displayEl.classList.add('is-placeholder');
    }
  }

  function enterEditMode() {
    if (editing) return;
    editing = true;
    inputEl.value = toArabicNum(currentValue);
    displayEl.style.display = 'none';
    inputEl.style.display = '';
    boxEl.classList.add('is-editing');
    inputEl.focus();
    inputEl.select();
  }

  function saveAndExitEditMode() {
    if (!editing) return;
    editing = false;
    const value = cleanRecordDigits(inputEl.value).slice(0, WORK_RECORD_MAX);
    currentValue = value;
    try {
      if (value) localStorage.setItem(WORK_RECORD_KEY, value);
      else localStorage.removeItem(WORK_RECORD_KEY);
    } catch (e) {}
    renderValue(currentValue);
    inputEl.style.display = 'none';
    displayEl.style.display = '';
    boxEl.classList.remove('is-editing');
    hideHint();
  }

  // بيفلتر اللي المستخدم كتبه (أو لزقه) ويحافظ على مكان المؤشر
  function sanitizeInput() {
    const raw = inputEl.value;
    const caret = inputEl.selectionStart == null ? raw.length : inputEl.selectionStart;
    const digitsBeforeCaret = cleanRecordDigits(raw.slice(0, caret)).length;

    let digits = cleanRecordDigits(raw);
    const hadInvalid = digits.length < raw.replace(/\s/g, '').length;
    const overflow = digits.length > WORK_RECORD_MAX;
    if (overflow) digits = digits.slice(0, WORK_RECORD_MAX);

    const shown = toArabicNum(digits);
    if (inputEl.value !== shown) {
      inputEl.value = shown;
      const pos = Math.min(digitsBeforeCaret, digits.length);
      try { inputEl.setSelectionRange(pos, pos); } catch (e) {}
    }

    if (hadInvalid) showHint('أرقام فقط');
    else if (overflow) showHint('الحد الأقصى ' + toArabicNum(WORK_RECORD_MAX) + ' أرقام');
  }

  renderValue(currentValue);

  // الشارة كلها قابلة للضغط (مساحة لمس أكبر على الموبايل)
  boxEl.addEventListener('click', function (e) {
    if (e.target === inputEl) return;
    enterEditMode();
  });
  displayEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      enterEditMode();
    }
  });

  inputEl.addEventListener('input', sanitizeInput);
  inputEl.addEventListener('blur', saveAndExitEditMode);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputEl.blur();
    } else if (e.key === 'Escape') {
      inputEl.value = toArabicNum(currentValue);
      inputEl.blur();
    }
  });
})();
