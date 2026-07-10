/* ── Helpers ─────────────────────────────────── */
const $ = id => document.getElementById(id);

function toArabicNum(n) {
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

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
    localStorage.setItem(`attendance_${storedPeriodKey}`, oldAttendance);
    localStorage.setItem(`holidays_${storedPeriodKey}`, oldHolidays);
  }
  // نبدأ بيانات الفترة الجديدة (نسترجعها لو كانت موجودة مسبقًا)
  const savedAttendance = localStorage.getItem(`attendance_${period.key}`) || '[]';
  const savedHolidays = localStorage.getItem(`holidays_${period.key}`) || '[]';
  localStorage.setItem('attendance', savedAttendance);
  localStorage.setItem('holidays', savedHolidays);
  localStorage.setItem('periodKey', period.key);
}

let attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
let holidays = JSON.parse(localStorage.getItem('holidays') || '[]');
let rate = +(localStorage.getItem('rate') || 225);
let deduction = +(localStorage.getItem('deduction') || 0);

$('dailyRate').value = rate;
$('deductionInput').value = deduction;

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
  if (holidays.includes(key)) {
    showToast('اليوم إجازة رسمية، لا يمكن تسجيل الحضور', true);
    return;
  }
  if (attendance.includes(key)) {
    showToast('تم تسجيل اليوم بالفعل ✓', true);
    return;
  }
  attendance.push(key);
  save();
  showToast('تم تسجيل الحضور ✓');
  render();
}

function removeToday() {
  const key = todayKey();
  if (attendance.includes(key)) {
    attendance = attendance.filter(k => k !== key);
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
  holidays.push(key);
  save();
  showToast('تم تسجيل اليوم كإجازة رسمية ✓');
  render();
}

function saveSelectedDays() {
  if (selectedPastDays.length === 0) return;
  selectedPastDays.forEach(key => {
    if (!attendance.includes(key)) attendance.push(key);
  });
  selectedPastDays = [];
  save();
  render();
  showToast('تم تسجيل الأيام المحددة بنجاح ✓');
}

function cancelSelectedDays() {
  // يلغي فقط أيام الحضور من القائمة (ليس الإجازات)
  const presentOnly = selectedDaysToCancel.filter(k => !holidays.includes(k));
  if (presentOnly.length === 0) return;
  attendance = attendance.filter(k => !presentOnly.includes(k));
  selectedDaysToCancel = selectedDaysToCancel.filter(k => holidays.includes(k));
  save();
  render();
  showToast('تم إلغاء حضور الأيام المحددة ✓');
}

/* ── وظيفة تسجيل إجازة رسمية (كانت مفقودة!) ── */
function markSelectedAsHoliday() {
  // ضم الأيام المختارة للتسجيل + أيام الحضور المختارة للإلغاء
  const selected = [...selectedPastDays, ...selectedDaysToCancel];

  if (selected.length === 0) return;

  selected.forEach(key => {
    // احذف من الحضور إن وجد
    attendance = attendance.filter(k => k !== key);

    // أضف للإجازات إن لم تكن موجودة
    if (!holidays.includes(key)) {
      holidays.push(key);
    }
  });

  selectedPastDays = [];
  selectedDaysToCancel = [];

  save();
  render();
  showToast('تم تحويل الأيام المحددة إلى إجازة رسمية ✓');
}

/* ── إلغاء إجازات رسمية محددة ─────────────────── */
function cancelSelectedHolidays() {
  if (selectedDaysToCancel.length === 0) return;
  holidays = holidays.filter(k => !selectedDaysToCancel.includes(k));
  selectedDaysToCancel = [];
  save();
  render();
  showToast('تم إلغاء الإجازات المحددة ✓');
}

function saveSettings() {
  rate = Math.max(1, +$('dailyRate').value || 225);
  deduction = Math.max(0, +$('deductionInput').value || 0);
  localStorage.setItem('rate', rate);
  localStorage.setItem('deduction', deduction);
  showToast('تم حفظ الإعدادات ✓');
  render();
}

function save() {
  localStorage.setItem('attendance', JSON.stringify(attendance));
  localStorage.setItem('holidays', JSON.stringify(holidays));
  // احفظ نسخة مرتبطة بالفترة أيضًا
  localStorage.setItem(`attendance_${period.key}`, JSON.stringify(attendance));
  localStorage.setItem(`holidays_${period.key}`, JSON.stringify(holidays));
}

/* ── حساب أيام الغياب على الشهر كله ──────────── */
function getAbsentDays() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const todayK = todayKey(); // key اليوم الحالي كـ string
  let absent = 0;
  const cur = new Date(y, m, 1);
  while (true) {
    const key = dateToKey(cur);
    if (key >= todayK) break; // لا نحسب اليوم الحالي أو ما بعده
    const dow = cur.getDay();
    if (dow !== 5 && dow !== 6 && !holidays.includes(key) && !attendance.includes(key)) {
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

  const net = Math.max(0, attendanceInPeriod.length * rate - deduction);

  // ── التعديل هنا: حساب الأيام المتبقية لنهاية الفترة الحالية ──
  // نلغي توقيت الساعات لتكون الحسبة دقيقة بالأيام
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfPeriodEnd = new Date(period.end.getFullYear(), period.end.getMonth(), period.end.getDate());

  // الفارق بالملي ثانية مقسوم على عدد ملي ثواني اليوم الواحد
  let daysLeft = Math.ceil((startOfPeriodEnd - startOfToday) / 86400000);

  // إذا كنا وصلنا لنهاية الفترة أو تخطيناها (لحالات الأمان) نجعلها 0
  if (daysLeft < 0) daysLeft = 0;

  const elapsed = now - period.start;
  const total = period.end - period.start + 86400000;
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));

  const absentDays = getAbsentDays();

  // Hero
  $('salary').textContent = toArabicNum(net.toLocaleString('ar-EG'));

  // Stats
  $('daysCount').textContent = toArabicNum(attendanceInPeriod.length);
  $('remainingDays').textContent = toArabicNum(daysLeft); // سيعرض الأيام المتبقية المحدثة
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

  buildCalendar();
}

/* ── Calendar ────────────────────────────────── */
function buildCalendar() {
  const cal = $('calendar');
  cal.innerHTML = '';

  // إعادة تهيئة التحديدات عند إعادة البناء
  selectedPastDays = [];
  selectedDaysToCancel = [];

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const days = new Date(y, m + 1, 0).getDate();

  const firstDay = new Date(y, m, 1).getDay();
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'day';
    cal.appendChild(blank);
  }

  for (let d = 1; d <= days; d++) {
    const date = new Date(y, m, d);
    const key = dateToKey(date);
    const todayD = now.getDate();
    const isToday = d === todayD;
    const isWeekend = date.getDay() === 5 || date.getDay() === 6;
    const isPresent = attendance.includes(key);
    const isHoliday = holidays.includes(key);
    // المستقبل: رقم اليوم أكبر من اليوم الحالي (مقارنة بالأرقام فقط لا بالوقت)
    const isFuture = d > todayD;

    const cell = document.createElement('div');
    cell.textContent = toArabicNum(d);

    let cls = 'day';
    if (isHoliday) {
      cls += ' holiday';
    } else if (isPresent) {
      cls += ' present';
    } else if (isWeekend) {
      cls += ' weekend';
    } else if (isFuture) {
      cls += ' future';
    } else if (!isToday) {
      cls += ' absent';
    }
    if (isToday) cls += ' today';

    cell.className = cls;

    // ── منطق النقر ────────────────────────────
    cell.onclick = () => {
      if (isFuture) return showToast('لا يمكن تحديد يوم في المستقبل', true);
      if (isWeekend) return showToast('الجمعة والسبت إجازة أسبوعية', true);
      if (isToday) return showToast('استخدم الأزرار أعلاه للتعامل مع اليوم الحالي', true);

      if (isHoliday) {
        // تحديد / إلغاء تحديد إجازة رسمية
        if (selectedDaysToCancel.includes(key)) {
          selectedDaysToCancel = selectedDaysToCancel.filter(k => k !== key);
          cell.classList.remove('selected-cancel');
        } else {
          selectedDaysToCancel.push(key);
          cell.classList.add('selected-cancel');
        }
        updateActionButtons();
        return;
      }

      if (isPresent) {
        // يوم حضور → قائمة الإلغاء
        if (selectedDaysToCancel.includes(key)) {
          selectedDaysToCancel = selectedDaysToCancel.filter(k => k !== key);
          cell.classList.remove('selected-cancel');
        } else {
          selectedDaysToCancel.push(key);
          cell.classList.add('selected-cancel');
        }
      } else {
        // يوم غياب → قائمة التسجيل
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

  // أيام في قائمة الإلغاء: إجازات أو حضور
  const hasHolidaySelected = selectedDaysToCancel.some(k => holidays.includes(k));
  const hasPresentSelected = selectedDaysToCancel.some(k => !holidays.includes(k));

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

  // التعديل هنا فقط
  show(btnHoliday, hasAbsentSelected || hasPresentSelected, 'flex');

  show(btnCancelHol, hasHolidaySelected, 'flex');
}

/* ── Init ────────────────────────────────────── */
render();
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
