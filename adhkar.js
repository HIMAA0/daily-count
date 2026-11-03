/* ══════════════════════════════════════════════════════════════════
   بوابة أذكار الصباح
   ──────────────────────────────────────────────────────────────────
   • بتظهر مرة واحدة في اليوم، في أي وقت يفتح فيه المستخدم الموقع.
   • المستخدم بيقرا كل ذكر ويعدّه بالضغط، وزرار الدخول بيفتح لما يخلّصهم كلهم.
   • التقدم بيتحفظ، فلو عمل ريفريش في نص الأذكار مش هيبدأ من الأول.
   • للتجربة في أي وقت: افتح الموقع بالشكل  index.html?adhkar=1
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // علامة إن الملف اتحمّل (index.html بيستخدمها كشبكة أمان لو الملف ناقص)
  window.MORNING_ADHKAR_READY = true;

  const html = document.documentElement;
  const gate = document.getElementById('adhkarGate');
  if (!gate || html.getAttribute('data-adhkar') !== 'pending') return;

  const CFG = window.MORNING_ADHKAR || {};
  const DONE_KEY = CFG.doneKey || 'morningAdhkarDone';
  const PROGRESS_KEY = CFG.progressKey || 'morningAdhkarProgress';
  const NAME_KEY = 'greetingUserName'; // نفس مفتاح الاسم اللي التطبيق بيستخدمه
  const TODAY = CFG.todayKey || dateKey(new Date());

  /* ── الأذكار ─────────────────────────────────────────────────── */
  const ADHKAR = [
    {
      title: 'آية الكرسي', count: 1, source: 'رواه الحاكم',
      text: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ'
    },
    {
      title: 'سورة الإخلاص', count: 3, source: 'رواه أبو داود والترمذي',
      text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ ﴿٤﴾'
    },
    {
      title: 'سورة الفلق', count: 3, source: 'رواه أبو داود والترمذي',
      text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِنْ شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾'
    },
    {
      title: 'سورة الناس', count: 3, source: 'رواه أبو داود والترمذي',
      text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾'
    },
    {
      title: 'أصبحنا وأصبح الملك لله', count: 1, source: 'رواه مسلم',
      text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ'
    },
    {
      title: 'اللهم بك أصبحنا', count: 1, source: 'رواه الترمذي',
      text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ'
    },
    {
      title: 'سيد الاستغفار', count: 1, source: 'رواه البخاري',
      text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ'
    },
    {
      title: 'إشهاد الله على التوحيد', count: 4, source: 'رواه أبو داود',
      text: 'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ'
    },
    {
      title: 'شكر النعمة', count: 1, source: 'رواه أبو داود',
      text: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ'
    },
    {
      title: 'العافية في البدن', count: 3, source: 'رواه أبو داود',
      text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ.\nاللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ'
    },
    {
      title: 'حسبي الله', count: 7, source: 'رواه أبو داود',
      text: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ'
    },
    {
      title: 'الحفظ من الضر', count: 3, source: 'رواه أبو داود والترمذي',
      text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ'
    },
    {
      title: 'الرضا بالله', count: 3, source: 'رواه أبو داود والترمذي',
      text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صلى الله عليه وسلم نَبِيًّا'
    },
    {
      title: 'الاستغاثة بالله', count: 1, source: 'رواه الحاكم',
      text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ'
    },
    {
      title: 'فطرة الإسلام', count: 1, source: 'رواه أحمد',
      text: 'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صلى الله عليه وسلم، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ'
    },
    {
      title: 'التسبيح', count: 100, source: 'رواه مسلم',
      text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ'
    }
  ];

  /* ── Helpers ─────────────────────────────────────────────────── */
  function dateKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function toAr(n) { return String(n).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function repeatLabel(n) {
    if (n === 1) return 'مرة واحدة';
    if (n === 2) return 'مرتان';
    if (n <= 10) return toAr(n) + ' مرات';
    return toAr(n) + ' مرة';
  }

  const $ = function (id) { return document.getElementById(id); };
  const listEl = $('adhkarList');
  const fillEl = $('adhkarFill');
  const progressText = $('adhkarProgressText');
  const enterBtn = $('adhkarEnter');
  const enterLabel = $('adhkarEnterLabel');
  const liveEl = $('adhkarLive');
  const scrollEl = $('adhkarScroll');
  const appEl = document.querySelector('.app');
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const CHECK_SVG = '<svg class="adhkar-check" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

  /* ── الحالة (المتبقي من كل ذكر) + الحفظ ──────────────────────── */
  function loadRemaining() {
    try {
      const saved = JSON.parse(lsGet(PROGRESS_KEY));
      if (saved && saved.date === TODAY && Array.isArray(saved.remaining) &&
          saved.remaining.length === ADHKAR.length &&
          saved.remaining.every(function (n, i) { return Number.isInteger(n) && n >= 0 && n <= ADHKAR[i].count; })) {
        return saved.remaining.slice();
      }
    } catch (e) {}
    return ADHKAR.map(function (d) { return d.count; });
  }
  const remaining = loadRemaining();
  function saveProgress() { lsSet(PROGRESS_KEY, JSON.stringify({ date: TODAY, remaining: remaining })); }

  /* ── الترحيب والتاريخ ───────────────────────────────────────── */
  (function paintHero() {
    const greet = $('adhkarGreeting');
    const name = (lsGet(NAME_KEY) || '').trim();
    if (greet) greet.textContent = name ? 'صباح الخير يا ' + name : 'صباح الخير';
    const dateEl = $('adhkarDate');
    if (dateEl) {
      try {
        dateEl.textContent = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
      } catch (e) { dateEl.textContent = ''; }
    }
  })();

  /* ── بناء الكروت ────────────────────────────────────────────── */
  const cards = ADHKAR.map(function (d, i) {
    const li = document.createElement('li');
    li.className = 'adhkar-card';
    li.dataset.i = i;
    li.innerHTML =
      '<div class="adhkar-card-head">' +
        '<span class="adhkar-card-num">' + toAr(i + 1) + '</span>' +
        '<h2 class="adhkar-card-title">' + d.title + '</h2>' +
        '<span class="adhkar-card-repeat">' + repeatLabel(d.count) + '</span>' +
      '</div>' +
      '<p class="adhkar-card-text">' + d.text + '</p>' +
      '<div class="adhkar-card-foot">' +
        '<span class="adhkar-card-source">' + d.source + '</span>' +
        (d.count > 3 ? '<button type="button" class="adhkar-finish" data-finish>أتممتها</button>' : '') +
        '<button type="button" class="adhkar-counter" data-counter>' +
          '<svg class="adhkar-ring" viewBox="0 0 44 44" aria-hidden="true">' +
            '<circle class="adhkar-ring-bg" cx="22" cy="22" r="19"/>' +
            '<circle class="adhkar-ring-fg" cx="22" cy="22" r="19" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>' +
          '</svg>' +
          '<span class="adhkar-counter-num"></span>' + CHECK_SVG +
        '</button>' +
      '</div>';
    listEl.appendChild(li);
    return li;
  });

  /* ── الرسم ──────────────────────────────────────────────────── */
  function paintCard(i) {
    const d = ADHKAR[i], card = cards[i], rem = remaining[i], done = rem === 0;
    const counter = card.querySelector('[data-counter]');
    card.classList.toggle('is-done', done);
    card.querySelector('.adhkar-counter-num').textContent = toAr(rem);
    card.querySelector('.adhkar-ring-fg').setAttribute('stroke-dashoffset', String(100 - ((d.count - rem) / d.count) * 100));
    counter.setAttribute('aria-label', done
      ? d.title + ': تم'
      : d.title + ': متبقي ' + toAr(rem) + ' من ' + toAr(d.count) + '، اضغط للعد');
    counter.disabled = done;
    const finish = card.querySelector('[data-finish]');
    if (finish) finish.hidden = done;
  }

  function doneCount() { return remaining.filter(function (n) { return n === 0; }).length; }

  function paintSummary() {
    const total = ADHKAR.length, done = doneCount(), all = done === total;
    fillEl.style.width = (done / total * 100) + '%';
    progressText.textContent = all ? 'تقبّل الله منك 🤍' : toAr(done) + ' من ' + toAr(total);
    const wasDisabled = enterBtn.disabled;
    enterBtn.disabled = !all;
    enterLabel.textContent = all ? 'دخول إلى المتابعة اليومية' : 'أكمل الأذكار للدخول';
    enterBtn.classList.toggle('is-ready', all);
    if (all && wasDisabled) {
      enterBtn.classList.remove('ready'); void enterBtn.offsetWidth; enterBtn.classList.add('ready');
    }
    // علّم أول ذكر لسه ما اتمّش كـ "الحالي"
    const cur = remaining.findIndex(function (n) { return n > 0; });
    cards.forEach(function (c, i) { c.classList.toggle('is-current', i === cur); });
  }

  function announce(msg) { if (liveEl) liveEl.textContent = msg; }

  function scrollToNext(from) {
    let next = -1;
    for (let k = 1; k <= ADHKAR.length; k++) {
      const j = (from + k) % ADHKAR.length;
      if (remaining[j] > 0) { next = j; break; }
    }
    if (next < 0) return;
    cards[next].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }

  /* ── التفاعل ────────────────────────────────────────────────── */
  function afterChange(i, bumpEl) {
    paintCard(i);
    paintSummary();
    saveProgress();
    if (bumpEl) { bumpEl.classList.remove('bump'); void bumpEl.offsetWidth; bumpEl.classList.add('bump'); }
    if (navigator.vibrate) { try { navigator.vibrate(remaining[i] === 0 ? 18 : 8); } catch (e) {} }
    if (remaining[i] === 0) {
      announce(doneCount() === ADHKAR.length ? 'أتممت كل الأذكار، يمكنك الدخول الآن' : 'تم: ' + ADHKAR[i].title);
      if (doneCount() < ADHKAR.length) setTimeout(function () { scrollToNext(i); }, 380);
    } else {
      announce('متبقي ' + toAr(remaining[i]));
    }
  }

  listEl.addEventListener('click', function (e) {
    const card = e.target.closest('.adhkar-card');
    if (!card) return;
    const i = +card.dataset.i;
    if (remaining[i] <= 0) return;
    if (e.target.closest('[data-finish]')) {
      remaining[i] = 0;
      afterChange(i, null);
    } else {
      remaining[i] -= 1;
      afterChange(i, card.querySelector('.adhkar-counter'));
    }
  });

  enterBtn.addEventListener('click', function () {
    if (remaining.some(function (n) { return n > 0; })) return;
    lsSet(DONE_KEY, TODAY);
    lsDel(PROGRESS_KEY);
    closeGate();
  });

  function closeGate() {
    if (appEl) appEl.inert = false;
    html.setAttribute('data-adhkar', 'leaving'); // التطبيق يظهر تحت البوابة وهي بتختفي
    gate.classList.add('is-leaving');
    const finish = function () {
      html.removeAttribute('data-adhkar');
      gate.classList.remove('is-leaving');
      window.scrollTo(0, 0);
      window.dispatchEvent(new CustomEvent('adhkar:done'));
    };
    if (reduceMotion) finish(); else setTimeout(finish, 420);
  }

  /* ── تشغيل ─────────────────────────────────────────────────── */
  if (appEl) appEl.inert = true; // مفيش وصول للتطبيق (كيبورد/قارئ شاشة) وهو ورا البوابة
  ADHKAR.forEach(function (_, i) { paintCard(i); });
  paintSummary();
  gate.setAttribute('tabindex', '-1');
  try { gate.focus({ preventScroll: true }); } catch (e) {}

  // لو في تقدم محفوظ من قبل، نوصّل المستخدم لأول ذكر ناقص
  if (doneCount() > 0 && doneCount() < ADHKAR.length) {
    const first = remaining.findIndex(function (n) { return n > 0; });
    setTimeout(function () { cards[first].scrollIntoView({ block: 'center' }); }, 120);
  }
})();
