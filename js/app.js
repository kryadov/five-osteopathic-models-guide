// Osteopathic Models Guide — RU/EN static SPA
// All content and logic lives client-side; progress persisted in localStorage.

// ===== Utilities =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const LS_KEY = 'osteo5_state_v1';

const defaultState = () => ({
  lang: 'ru',
  fontLarge: false,
  models: {
    bioMech: { status: 'inprogress', unlocked: true, lastScore: 0, mistakes: [] },
    respCirc: { status: 'locked', unlocked: false, lastScore: 0, mistakes: [] },
    neuro: { status: 'locked', unlocked: false, lastScore: 0, mistakes: [] },
    metab: { status: 'locked', unlocked: false, lastScore: 0, mistakes: [] },
    biopsych: { status: 'locked', unlocked: false, lastScore: 0, mistakes: [] },
  },
  finalQuiz: { bestScore: 0 },
});

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed, models: { ...defaultState().models, ...(parsed.models || {}) } };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function resetProgress(confirmText) {
  if (confirm(confirmText)) {
    state = defaultState();
    saveState();
    navigate('#/');
  }
}

// ===== I18N =====
const t = {
  ru: {
    title: 'Руководство по 5 остеопатическим моделям ВОЗ',
    disclaimer: 'Дисклеймер: материал носит образовательный характер и не заменяет консультацию врача.',
    home_intro: 'Добро пожаловать! Изучайте пять остеопатических моделей шаг за шагом и закрепляйте знания в тестах.',
    get_started: 'К моделям',
    home: 'Главная',
    models: 'Модели',
    learn: 'Обучение',
    quiz: 'Тест',
    result: 'Результат',
    review: 'Повторение',
    final_quiz: 'Итоговый квиз',
    start_quiz: 'Начать тест',
    start_review: 'Начать повторение',
    continue: 'Далее',
    retry: 'Повторить тест',
    back_to_models: 'К списку моделей',
    locked: 'закрыт',
    inprogress: 'в процессе',
    mastered: 'освоен',
    unlocked_next: 'Следующая модель разблокирована!',
    need_80: 'Нужно ≥80% для разблокировки следующей модели.',
    score: 'Баллы',
    of: 'из',
    export: 'Экспорт',
    import: 'Импорт',
    import_success: 'Прогресс импортирован.',
    confirm_reset: 'Сбросить весь прогресс?',
    reset: 'Сбросить прогресс',
    lang_btn: 'RU',
    font_btn: 'A↕',
    question: 'Вопрос',
    your_answer: 'Ваш ответ',
    explanation: 'Пояснение',
    correct: 'Верно',
    incorrect: 'Неверно',
    submit: 'Ответить',
    next: 'Следующий',
    finish: 'Завершить',
    review_done: 'Ошибочных вопросов больше нет. Отлично!',
    final_quiz_title: 'Итоговый квиз по всем моделям',
    start: 'Начать',
  },
  en: {
    title: 'Guide to the Five Osteopathic Models (WHO)',
    disclaimer: 'Disclaimer: educational material only; not a substitute for medical advice.',
    home_intro: 'Welcome! Learn the five osteopathic models step by step and reinforce knowledge with quizzes.',
    get_started: 'Go to Models',
    home: 'Home',
    models: 'Models',
    learn: 'Learn',
    quiz: 'Quiz',
    result: 'Result',
    review: 'Review',
    final_quiz: 'Final Quiz',
    start_quiz: 'Start Quiz',
    start_review: 'Start Review',
    continue: 'Continue',
    retry: 'Retry Quiz',
    back_to_models: 'Back to Models',
    locked: 'locked',
    inprogress: 'in progress',
    mastered: 'mastered',
    unlocked_next: 'Next model unlocked!',
    need_80: 'You need ≥80% to unlock the next model.',
    score: 'Score',
    of: 'of',
    export: 'Export',
    import: 'Import',
    import_success: 'Progress imported.',
    confirm_reset: 'Reset all progress?',
    reset: 'Reset Progress',
    lang_btn: 'EN',
    font_btn: 'A↕',
    question: 'Question',
    your_answer: 'Your answer',
    explanation: 'Explanation',
    correct: 'Correct',
    incorrect: 'Incorrect',
    submit: 'Submit',
    next: 'Next',
    finish: 'Finish',
    review_done: 'No incorrect questions remain. Great job!',
    final_quiz_title: 'Final quiz across all models',
    start: 'Start',
  },
};

function tr(key) { return t[state.lang][key] || key; }

// ===== Data: Models & Quizzes =====
// Schema for question:
// { id, type: 'mcq'|'tf'|'match'|'order'|'case', prompt: {ru,en}, options?, answer, pairs?, order?, explain: {ru,en} }

const Models = [
  {
    id: 'bioMech',
    title: { ru: 'Биомеханическая', en: 'Biomechanical' },
    icon: svgIcon('M'),
    essence: {
      ru: 'Фокус на структуре и движении тканей, суставах и мышцах; функция следует за структурой.',
      en: 'Focuses on structure and tissue motion, joints and muscles; function follows structure.',
    },
    goal: {
      ru: 'Восстановить оптимальную биомеханику для улучшения функции и уменьшения боли.',
      en: 'Restore optimal biomechanics to improve function and reduce pain.',
    },
    keys: {
      ru: 'Фасции, мышцы, суставы, осанка, кинематические цепи.',
      en: 'Fascia, muscles, joints, posture, kinematic chains.',
    },
    example: {
      ru: 'Коррекция дисфункции крестцово-подвздошного сустава для снятия боли в пояснице.',
      en: 'Correcting sacroiliac dysfunction to relieve low back pain.',
    },
    mnemonic: { ru: 'СТРУКТУРА → ДВИЖЕНИЕ → ФУНКЦИЯ', en: 'STRUCTURE → MOTION → FUNCTION' },
    quiz: []
  },
  {
    id: 'respCirc',
    title: { ru: 'Респираторно‑циркуляторная', en: 'Respiratory-Circulatory' },
    icon: svgIcon('R'),
    essence: {
      ru: 'Поддержание дыхания, циркуляции крови и лимфы для трофики и иммунитета.',
      en: 'Supports respiration, blood and lymph circulation for trophic support and immunity.',
    },
    goal: {
      ru: 'Оптимизировать дыхание и жидкости организма для заживления и гомеостаза.',
      en: 'Optimize breathing and body fluids for healing and homeostasis.',
    },
    keys: {
      ru: 'Диафрагмы, венозный/лимфатический отток, дыхательная помпа.',
      en: 'Diaphragms, venous/lymphatic drainage, respiratory pump.',
    },
    example: {
      ru: 'Улучшение подвижности грудной клетки для повышения толерантности к нагрузке.',
      en: 'Improving chest mobility to increase exercise tolerance.',
    },
    mnemonic: { ru: 'ДЫХАНИЕ + ПОТОКИ = ПИТАНИЕ', en: 'BREATH + FLOW = NOURISH' },
    quiz: []
  },
  {
    id: 'neuro',
    title: { ru: 'Нейрологическая', en: 'Neurological' },
    icon: svgIcon('N'),
    essence: {
      ru: 'Регуляция через ЦНС, периферические нервы и рефлексы; баланс симпато‑парасимпато.',
      en: 'Regulation via CNS, peripheral nerves and reflexes; balancing sympathetic/parasympathetic.',
    },
    goal: {
      ru: 'Оптимизировать нейромодуляцию боли, тонуса, осанки и вегетативного баланса.',
      en: 'Optimize neuromodulation of pain, tone, posture and autonomic balance.',
    },
    keys: {
      ru: 'Вегетатика, сомато‑висцеральные и висцеро‑соматические рефлексы.',
      en: 'ANS, somato-visceral and viscero-somatic reflexes.',
    },
    example: {
      ru: 'Работа с подзатылочными мышцами для снижения головной боли напряжения.',
      en: 'Suboccipital release to reduce tension-type headaches.',
    },
    mnemonic: { ru: 'НЕРВ → РЕФЛЕКС → РЕГУЛЯЦИЯ', en: 'NERVE → REFLEX → REGULATION' },
    quiz: []
  },
  {
    id: 'metab',
    title: { ru: 'Метаболическая/Энергетическая', en: 'Metabolic/Energy' },
    icon: svgIcon('E'),
    essence: {
      ru: 'Ресурсы организма: питание, сон, стресс, эндокринная и иммунная системы.',
      en: 'Body resources: nutrition, sleep, stress, endocrine and immune systems.',
    },
    goal: {
      ru: 'Поддержать адаптацию и восстановление через образ жизни и системную регуляцию.',
      en: 'Support adaptation and recovery through lifestyle and systemic regulation.',
    },
    keys: {
      ru: 'Гомеостаз, воспаление, энергия, восстановление.',
      en: 'Homeostasis, inflammation, energy, recovery.',
    },
    example: {
      ru: 'Рекомендации по сну и активности при хронической боли.',
      en: 'Sleep and activity advice for chronic pain.',
    },
    mnemonic: { ru: 'РЕСУРСЫ → АДАПТАЦИЯ', en: 'RESOURCES → ADAPTATION' },
    quiz: []
  },
  {
    id: 'biopsych',
    title: { ru: 'Биопсихосоциальная', en: 'Biopsychosocial' },
    icon: svgIcon('B'),
    essence: {
      ru: 'Взаимосвязь биологических, психологических и социальных факторов.',
      en: 'Interplay of biological, psychological and social factors.',
    },
    goal: {
      ru: 'Снизить воздействие «жёлтых флагов», повысить самоэффективность и участие пациента.',
      en: 'Reduce yellow flags, increase self-efficacy and patient engagement.',
    },
    keys: {
      ru: 'Коммуникация, цели пациента, ожидания, контекст.',
      en: 'Communication, patient goals, expectations, context.',
    },
    example: {
      ru: 'Обучение пациента при неспецифической боли в спине и постепенное возвращение к активности.',
      en: 'Patient education in non-specific low back pain and graded activity.',
    },
    mnemonic: { ru: 'ЧЕЛОВЕК В ЦЕЛОМ', en: 'THE PERSON AS A WHOLE' },
    quiz: []
  },
];

// Generate quizzes content
initQuizzes();

function initQuizzes() {
  // For brevity, define 10 questions per model with varied types.
  // Each ID prefixed by model id.
  setQuiz('bioMech', [
    mcq('bm1', trPrompt('Биомеханическая модель прежде всего фокусируется на...', 'The biomechanical model primarily focuses on...'),
        [trOpt('структуре и движении тканей', 'structure and tissue motion'), trOpt('уровне глюкозы в крови', 'blood glucose level'), trOpt('социальной поддержке', 'social support')], [0],
        trExplain('Структура и движение — основа модели.', 'Structure and motion are central.')),
    tf('bm2', trPrompt('Фраза «функция следует за структурой» относится к биомеханической модели.', 'The phrase "function follows structure" relates to the biomechanical model.'), true,
       trExplain('Это ключевой принцип модели.', 'A key principle of the model.')),
    order('bm3', trPrompt('Расположите этапы клинического мышления:', 'Order the clinical reasoning steps:'),
          [trOpt('оценка движения', 'motion assessment'), trOpt('выявление дисфункции', 'identify dysfunction'), trOpt('выбор техники', 'choose technique'), trOpt('переоценка', 're-assessment')],
          [0,1,2,3], trExplain('Последовательность: оценка → дисфункция → техника → переоценка.', 'Sequence: assessment → dysfunction → technique → re-assessment.')),
    match('bm4', trPrompt('Соотнесите структуру и пример техники:', 'Match structure to example technique:'),
          [trOpt('фасция', 'fascia'), trOpt('сустав', 'joint'), trOpt('мышца', 'muscle')],
          [trOpt('миофасциальный релиз', 'myofascial release'), trOpt('трастация (HVLA)', 'thrust (HVLA)'), trOpt('постизометрическая релаксация', 'post-isometric relaxation')],
          {0:0,1:1,2:2}, trExplain('Фасция→MFR, сустав→HVLA, мышца→PIR.', 'Fascia→MFR, joint→HVLA, muscle→PIR.')),
    caseQ('bm5', trPrompt('Пациент с болью в пояснице после длительного сидения. Какой регион оцените в первую очередь?', 'Low back pain after prolonged sitting. Which region assess first?'),
          [trOpt('таз и крестцово‑подвздошный сустав', 'pelvis and SI joint'), trOpt('кисть', 'hand'), trOpt('стопа', 'foot')], [0],
          trExplain('Чаще вовлечены тазовые и поясничные структуры.', 'Pelvic and lumbar structures commonly involved.')),
    mcq('bm6', trPrompt('Какая цепь описывает влияние стопы на колено и таз?', 'Which chain describes foot influencing knee and pelvis?'),
        [trOpt('кинетическая', 'kinetic'), trOpt('метаболическая', 'metabolic'), trOpt('социальная', 'social')], [0],
        trExplain('Кинетическая/кинематическая цепь.', 'Kinetic/kinematic chain.')),
    tf('bm7', trPrompt('Постизометрическая релаксация — чисто пассивная техника без участия пациента.', 'Post-isometric relaxation is purely passive without patient effort.'), false,
       trExplain('Требует мягкого сокращения пациента.', 'Requires gentle patient contraction.')),
    mcq('bm8', trPrompt('HVLA чаще всего направлена на...', 'HVLA is most often directed at...'),
        [trOpt('мышечный спазм', 'muscle spasm'), trOpt('суставную дисфункцию', 'joint dysfunction'), trOpt('лимфатический застой', 'lymphatic stasis')], [1],
        trExplain('Цель — восстановление подвижности сустава.', 'Targeting joint mobility.')),
    match('bm9', trPrompt('Соотнесите термин и определение:', 'Match term and definition:'),
          [trOpt('барьер ткани', 'tissue barrier'), trOpt('энд‑фил', 'end-feel')],
          [trOpt('ощущение на границе движения', 'feel at motion limit'), trOpt('сопротивление в ткани', 'resistance in tissue')],
          {0:1,1:0}, trExplain('Барьер—сопротивление; энд‑фил—ощущение на конце движения.', 'Barrier=resistance; end-feel=feel at end.')),
    tf('bm10', trPrompt('Переоценка после техники — опциональный шаг.', 'Re-assessment after technique is optional.'), false,
       trExplain('Всегда переоценивайте, чтобы подтвердить эффект.', 'Always re-assess to confirm effect.')),
  ]);

  setQuiz('respCirc', [
    mcq('rc1', trPrompt('Главная роль диафрагм в данной модели —', 'Main role of diaphragms in this model is'),
        [trOpt('стабилизация колена', 'knee stabilization'), trOpt('насосная функция для жидкостей', 'pumping body fluids'), trOpt('регуляция настроения', 'mood regulation')], [1],
        trExplain('Диафрагмы способствуют венозному/лимфатическому оттоку.', 'They aid venous/lymphatic return.')),
    tf('rc2', trPrompt('Улучшение дыхания может ускорить заживление тканей.', 'Improving breathing can speed up tissue healing.'), true, trExplain('Лучший газообмен и перфузия.', 'Better gas exchange and perfusion.')),
    match('rc3', trPrompt('Соотнесите структуру и эффект:', 'Match structure and effect:'),
          [trOpt('Грудная клетка', 'Thorax'), trOpt('Печень', 'Liver'), trOpt('Стопы', 'Feet')],
          [trOpt('венозный дренаж', 'venous drainage'), trOpt('лимфатический возврат', 'lymphatic return'), trOpt('дыхательный объём', 'tidal volume')],
          {0:2,1:1,2:0}, trExplain('Грудная клетка→объём, печень→лимфа, стопы→венозный насос.', 'Thorax→volume, liver→lymph, feet→venous pump.')),
    order('rc4', trPrompt('Последовательность работы с диафрагмами:', 'Order: working through diaphragms'),
          [trOpt('пелвик диафрагма', 'pelvic diaphragm'), trOpt('торакальная', 'thoracic'), trOpt('цервикальная', 'cervical'), trOpt('краниальная', 'cranial')],
          [0,1,2,3], trExplain('От нижней к верхней — часто удобнее.', 'Often convenient: bottom-up.')),
    mcq('rc5', trPrompt('Какой показатель напрямую отражает дыхательную эффективность?', 'Which directly reflects respiratory efficiency?'),
        [trOpt('ЧСС', 'HR'), trOpt('SpO2', 'SpO2'), trOpt('ИМТ', 'BMI')], [1], trExplain('Насыщение кислородом.', 'Oxygen saturation.')),
    tf('rc6', trPrompt('Лимфатический отёк не связан с респираторно‑циркуляторной моделью.', 'Lymphatic edema is unrelated to the resp-circ model.'), false, trExplain('Напротив, это ключевая тема.', 'It is central to the model.')),
    caseQ('rc7', trPrompt('Пациент после ОРВИ, усталость. Что приоритетно?', 'Post-viral fatigue. Priority?'),
          [trOpt('Работа с грудной клеткой и дыханием', 'Thorax and breathing'), trOpt('Изолированная HVLA на шее', 'Isolated cervical HVLA'), trOpt('Массаж стоп', 'Foot massage')], [0],
          trExplain('Поддержка дыхания и циркуляции поможет восстановлению.', 'Support respiration and circulation.')),
    mcq('rc8', trPrompt('Какой знак укажет на нарушение грудного дыхания?', 'Which sign suggests impaired thoracic breathing?'),
        [trOpt('Парадоксальное дыхание', 'Paradoxical breathing'), trOpt('Норма ЧДД', 'Normal RR'), trOpt('Тёплые кисти', 'Warm hands')], [0],
        trExplain('Парадоксальное движение — признак дисфункции.', 'Paradoxical motion indicates dysfunction.')),
    match('rc9', trPrompt('Соотнесите насос и систему:', 'Match pump and system:'),
          [trOpt('мышечный насос', 'muscle pump'), trOpt('дыхательный насос', 'respiratory pump')],
          [trOpt('венозная система', 'venous system'), trOpt('газообмен', 'gas exchange')], {0:0,1:1},
          trExplain('Мышцы→вены; дыхание→газообмен и лимфа.', 'Muscles→veins; breathing→gas exchange and lymph.')),
    tf('rc10', trPrompt('Повышение подвижности ребер не влияет на вентиляцию.', 'Rib mobility does not affect ventilation.'), false,
       trExplain('Подвижность влияет на вентиляцию напрямую.', 'Mobility directly affects ventilation.')),
  ]);

  setQuiz('neuro', [
    mcq('n1', trPrompt('Какая система регулирует «бей или беги»?', 'Which system regulates "fight or flight"?'),
        [trOpt('симпатическая', 'sympathetic'), trOpt('парасимпатическая', 'parasympathetic'), trOpt('эндокринная', 'endocrine')], [0],
        trExplain('Симпатический отдел ВНС.', 'Sympathetic ANS.')),
    tf('n2', trPrompt('Соматовисцеральные рефлексы — влияние органов на мышцы.', 'Somato-visceral reflexes are viscera to muscles.'), false,
       trExplain('Это наоборот; здесь мышцы→внутренние органы.', 'Opposite; somato-visceral is somatic→viscera.')),
    match('n3', trPrompt('Соотнесите отдел и эффект:', 'Match division and effect:'),
          [trOpt('симпатическая', 'sympathetic'), trOpt('парасимпатическая', 'parasympathetic')],
          [trOpt('учащение пульса', 'increased HR'), trOpt('усиление перистальтики', 'enhanced peristalsis')], {0:0,1:1},
          trExplain('Симпато→HR; парасимпато→перистальтика.', 'Symp→HR; parasymp→peristalsis.')),
    order('n4', trPrompt('Шаги нейромодуляции боли:', 'Steps of pain neuromodulation:'),
          [trOpt('оценка триггеров', 'assess triggers'), trOpt('влияние на рефлексы', 'modulate reflexes'), trOpt('тренировка контроля', 'train control')],
          [0,1,2], trExplain('Сначала оценка, затем вмешательство, затем тренировка.', 'Assess → intervene → train.')),
    caseQ('n5', trPrompt('Головная боль напряжения. С чего начнёте?', 'Tension-type headache. Where to start?'),
          [trOpt('подзатылочные мышцы', 'suboccipitals'), trOpt('поясничная фасция', 'lumbar fascia'), trOpt('тазобедренный сустав', 'hip joint')], [0],
          trExplain('Часто вовлечено краниоцервикальное соединение.', 'Cranio-cervical junction often involved.')),
    mcq('n6', trPrompt('Какой тест отражает вегетативный баланс?', 'Which reflects autonomic balance?'),
        [trOpt('вариабельность сердечного ритма', 'heart rate variability'), trOpt('рост ногтей', 'nail growth'), trOpt('цвет глаз', 'eye color')], [0],
        trExplain('HRV — валидный показатель ВНС.', 'HRV is a valid ANS metric.')),
    tf('n7', trPrompt('«Висцеро‑соматический рефлекс» — влияние органов на мышцы.', 'Viscero-somatic reflex is viscera to muscles.'), true,
       trExplain('Да, это определение.', 'Yes, by definition.')),
    match('n8', trPrompt('Соотнесите нерв и область:', 'Match nerve and area:'),
          [trOpt('блуждающий', 'vagus'), trOpt('седалищный', 'sciatic')],
          [trOpt('брюшные органы', 'abdominal viscera'), trOpt('задняя поверхность бедра', 'posterior thigh')], {0:0,1:1},
          trExplain('Vagus→внутренние органы; sciatic→нога.', 'Vagus→viscera; sciatic→leg.')),
    mcq('n9', trPrompt('Какой приём помогает снизить тонус через Гольджи рецепторы?', 'Which reduces tone via Golgi receptors?'),
        [trOpt('сдавление-растяжение', 'compress-decompress'), trOpt('тендонный релиз', 'tendon release'), trOpt('метод Паппа', 'Papp method')], [1],
        trExplain('Давление на сухожилие активирует органы Гольджи.', 'Tendon pressure activates Golgi organs.')),
    tf('n10', trPrompt('Баланс симпато/парасимпато не влияет на сон.', 'Symp/parasymp balance does not affect sleep.'), false,
       trExplain('Влияет напрямую.', 'It directly affects sleep.')),
  ]);

  setQuiz('metab', [
    mcq('e1', trPrompt('Что напрямую повышает восстановление?', 'What directly improves recovery?'),
        [trOpt('качественный сон', 'quality sleep'), trOpt('скроллинг ночью', 'nighttime scrolling'), trOpt('обезвоживание', 'dehydration')], [0],
        trExplain('Сон — ключ к восстановлению.', 'Sleep is key to recovery.')),
    tf('e2', trPrompt('Хронический стресс не влияет на воспаление.', 'Chronic stress does not affect inflammation.'), false, trExplain('Повышает провоспалительную активность.', 'It increases pro-inflammatory activity.')),
    match('e3', trPrompt('Соотнесите фактор и систему:', 'Match factor and system:'),
          [trOpt('сон', 'sleep'), trOpt('рацион', 'diet'), trOpt('активность', 'activity')],
          [trOpt('гормональная регуляция', 'hormonal regulation'), trOpt('энергетический баланс', 'energy balance'), trOpt('нейропластичность', 'neuroplasticity')],
          {0:0,1:1,2:2}, trExplain('Сон→гормоны; рацион→энергия; активность→нейропластичность.', 'Sleep→hormones; diet→energy; activity→neuroplasticity.')),
    order('e4', trPrompt('Шаги изменения поведения:', 'Behavior change steps:'),
          [trOpt('осведомлённость', 'awareness'), trOpt('малые цели', 'small goals'), trOpt('поддержка', 'support')], [0,1,2],
          trExplain('Осознание→цели→поддержка.', 'Awareness→goals→support.')),
    caseQ('e5', trPrompt('Пациент с утомляемостью. Ваш совет?', 'Fatigue complaint. Your advice?'),
          [trOpt('регулярный сон и гидратация', 'regular sleep and hydration'), trOpt('отмена всех нагрузок', 'no activity at all'), trOpt('только витамины', 'vitamins only')], [0],
          trExplain('Базовые привычки — фундамент.', 'Basics first.')),
    mcq('e6', trPrompt('Какой маркер отражает системное воспаление?', 'Which marker reflects systemic inflammation?'),
        [trOpt('СРБ', 'CRP'), trOpt('HbA1c', 'HbA1c'), trOpt('Na+', 'Na+')], [0], trExplain('С-реактивный белок.', 'C-reactive protein.')),
    tf('e7', trPrompt('Гидратация влияет на вязкость крови.', 'Hydration affects blood viscosity.'), true, trExplain('Да, через объём плазмы.', 'Yes, via plasma volume.')),
    match('e8', trPrompt('Соотнесите рекомендацию и эффект:', 'Match advice and effect:'),
          [trOpt('30 мин ходьбы', '30 min walk'), trOpt('свет гигиена сна', 'light sleep hygiene')],
          [trOpt('улучшение чувствительности к инсулину', 'better insulin sensitivity'), trOpt('синхронизация циркадных ритмов', 'circadian alignment')],
          {0:0,1:1}, trExplain('Активность→инсулин; свет→ритмы.', 'Activity→insulin; light→rhythms.')),
    mcq('e9', trPrompt('Какой компонент питания критически важен для восстановления тканей?', 'Which dietary component is critical for tissue repair?'),
        [trOpt('белок', 'protein'), trOpt('чистый сахар', 'pure sugar'), trOpt('трансжиры', 'trans fats')], [0], trExplain('Белок — строительный материал.', 'Protein is building material.')),
    tf('e10', trPrompt('Полное отсутствие активности всегда полезно при хронической боли.', 'Complete inactivity is always beneficial in chronic pain.'), false,
       trExplain('Дозированная активность обычно лучше.', 'Graded activity is usually better.')),
  ]);

  setQuiz('biopsych', [
    mcq('b1', trPrompt('Что НЕ относится к жёлтым флагам?', 'Which is NOT a yellow flag?'),
        [trOpt('катастрофизация', 'catastrophizing'), trOpt('избегающее поведение', 'avoidance behavior'), trOpt('адекватные ожидания', 'adequate expectations')], [2],
        trExplain('Адекватные ожидания — это хорошо.', 'Adequate expectations are positive.')),
    tf('b2', trPrompt('Коммуникация — часть лечения.', 'Communication is part of the treatment.'), true, trExplain('Влияет на мотивацию и участие.', 'Affects motivation and engagement.')),
    match('b3', trPrompt('Соотнесите подход и эффект:', 'Match approach and effect:'),
          [trOpt('мотивационное интервьюирование', 'motivational interviewing'), trOpt('градуированная активность', 'graded activity')],
          [trOpt('повышение вовлечённости', 'increase engagement'), trOpt('снижение страха движения', 'reduce fear of movement')], {0:0,1:1},
          trExplain('MI→вовлечённость; GA→снижение страха.', 'MI→engagement; GA→fear reduction.')),
    order('b4', trPrompt('Шаги установки цели:', 'Goal setting steps:'),
          [trOpt('SMART‑формулировка', 'SMART wording'), trOpt('совместный выбор', 'shared choice'), trOpt('отслеживание', 'tracking')], [1,0,2],
          trExplain('Сначала выбор, затем SMART, затем отслеживание.', 'Shared choice→SMART→tracking.')),
    caseQ('b5', trPrompt('Пациент боится рецидива. Что важно?', 'Patient fears relapse. What matters?'),
          [trOpt('план самопомощи', 'self-management plan'), trOpt('запрет диалога', 'avoid dialogue'), trOpt('игнорирование', 'ignore')], [0],
          trExplain('План повышает самоэффективность.', 'Plan increases self-efficacy.')),
    mcq('b6', trPrompt('Какое утверждение про ожидания верно?', 'Which statement about expectations is true?'),
        [trOpt('не влияют на исход', 'do not affect outcomes'), trOpt('могут улучшать результаты', 'can improve outcomes'), trOpt('всегда вредны', 'always harmful')], [1],
        trExplain('Позитивные ожидания — ресурс.', 'Positive expectations help.')),
    tf('b7', trPrompt('Социальная поддержка ускоряет восстановление.', 'Social support speeds recovery.'), true, trExplain('Снижает стресс, улучшает соблюдение.', 'Reduces stress, improves adherence.')),
    match('b8', trPrompt('Соотнесите барьер и стратегию:', 'Match barrier and strategy:'),
          [trOpt('низкая мотивация', 'low motivation'), trOpt('страх боли', 'fear of pain')],
          [trOpt('малые шаги', 'small steps'), trOpt('образование и экспозиция', 'education and exposure')], {0:0,1:1},
          trExplain('Малые шаги для мотивации; образование+экспозиция против страха.', 'Small steps for motivation; education+exposure for fear.')),
    mcq('b9', trPrompt('Что лучше описывает подход модели?', 'Which best describes the model approach?'),
        [trOpt('только структура', 'structure only'), trOpt('только лекарства', 'medications only'), trOpt('комплексный взгляд', 'holistic view')], [2],
        trExplain('Учитываются био‑, психо‑ и социальные факторы.', 'Considers bio, psycho and social factors.')),
    tf('b10', trPrompt('Участие пациента в выборе целей не влияет на исход.', 'Patient involvement in goal choice does not affect outcomes.'), false,
       trExplain('Совместные цели улучшают приверженность.', 'Shared goals improve adherence.')),
  ]);

  // Final quiz: pick 10 across models (2 from each of first four, 2 from last)
}

function setQuiz(modelId, items) {
  const m = Models.find(m => m.id === modelId);
  if (m) m.quiz = items;
}

// ===== Question Builders =====
function trPrompt(ru, en) { return { ru, en }; }
function trExplain(ru, en) { return { ru, en }; }
function trOpt(ru, en) { return { ru, en }; }

function mcq(id, prompt, options, answerIdxs, explain) {
  return { id, type: 'mcq', prompt, options, answer: answerIdxs, explain };
}
function tfQ(id, prompt, answerBool, explain) { return { id, type: 'tf', prompt, answer: answerBool, explain }; }
function tf(id, prompt, answerBool, explain) { return tfQ(id, prompt, answerBool, explain); }
function match(id, prompt, left, right, mapObj, explain) {
  return { id, type: 'match', prompt, left, right, map: mapObj, explain };
}
function order(id, prompt, items, correctOrderIdx, explain) {
  return { id, type: 'order', prompt, items, correct: correctOrderIdx, explain };
}
function caseQ(id, prompt, options, answerIdxs, explain) {
  return { id, type: 'case', prompt, options, answer: answerIdxs, explain };
}

// ===== Icons (mini infographics) =====
function svgIcon(letter) {
  // Simple inline SVG badge
  const color = '#2563eb';
  return `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <rect x="1" y="1" width="38" height="38" rx="8" fill="#f3f4f6" stroke="#e5e7eb" />
    <circle cx="20" cy="20" r="10" fill="${color}" opacity="0.15" />
    <text x="20" y="24" text-anchor="middle" font-family="Segoe UI, Arial" font-size="16" fill="${color}" font-weight="700">${letter}</text>
  </svg>`;
}

// ===== Routing =====
const routes = {
  '#/': renderHome,
  '#/models': renderModels,
  '#/learn': renderLearn,
  '#/quiz': renderQuiz,
  '#/result': renderResult,
  '#/review': renderReview,
  '#/final': renderFinalIntro,
  '#/final-quiz': renderFinalQuiz,
};

function navigate(hash) {
  if (location.hash !== hash) location.hash = hash;
  else onRouteChange();
}

window.addEventListener('hashchange', onRouteChange);

function onRouteChange() {
  localizeChrome();
  const [base, param] = parseHash(location.hash);
  const view = routes[base] || renderHome;
  view(param);
  updateProgressBar();
  $('#app')?.focus();
}

function parseHash(h) {
  const parts = h.replace(/^#/, '').split('/').filter(Boolean); // e.g., ["quiz","bioMech"]
  const base = '#/' + (parts[0] || '');
  const param = parts[1] || '';
  return [base, param];
}

// ===== Rendering =====
function renderHome() {
  $('#app').innerHTML = `
    <section class="card">
      <h2 class="section-title">${tr('title')}</h2>
      <p>${tr('home_intro')}</p>
      <div class="toolbar">
        <button class="btn primary" onclick="navigate('#/models')">${tr('get_started')}</button>
        <button class="btn" onclick="resetProgress('${tr('confirm_reset')}')">${tr('reset')}</button>
        <button class="btn" onclick="navigate('#/final')">${tr('final_quiz')}</button>
      </div>
    </section>
  `;
}

function renderModels() {
  const cards = Models.map((m, idx) => {
    const ms = state.models[m.id];
    const statusLabel = tr(ms.status);
    const statusDot = ms.status === 'mastered' ? 's-mastered' : (ms.status === 'inprogress' ? 's-inprogress' : 's-locked');
    const locked = !ms.unlocked;
    const btns = locked ? '' : `
      <div class="toolbar">
        <button class="btn" onclick="navigate('#/learn/${m.id}')">${tr('learn')}</button>
        <button class="btn primary" onclick="navigate('#/quiz/${m.id}')">${tr('quiz')}</button>
        ${ms.mistakes && ms.mistakes.length ? `<button class="btn" onclick="navigate('#/review/${m.id}')">${tr('review')} (${ms.mistakes.length})</button>` : ''}
      </div>`;
    return `
      <div class="model-card ${locked ? 'locked':''}" role="region" aria-labelledby="m_${m.id}">
        <div class="iconbox" aria-hidden="true">${m.icon}</div>
        <div>
          <div id="m_${m.id}" class="section-title">${m.title[state.lang]}</div>
          <div class="muted">${m.essence[state.lang]}</div>
          <div class="small status"><span class="status-dot ${statusDot}"></span>${statusLabel} ${ms.lastScore ? `· ${tr('score')}: ${ms.lastScore}%` : ''}</div>
          ${btns}
        </div>
      </div>
    `;
  }).join('');

  $('#app').innerHTML = `
    <section class="grid">
      ${cards}
      <div class="card">
        <div class="toolbar">
          <button class="btn" onclick="navigate('#/')">${tr('home')}</button>
          <button class="btn" onclick="navigate('#/final')">${tr('final_quiz')}</button>
        </div>
      </div>
    </section>
  `;
}

function renderLearn(modelId) {
  const m = Models.find(x => x.id === modelId) || Models[0];
  const s = `
    <section class="learn-section">
      <div class="card learn-row"><h4>${tr('learn')}</h4><div>${m.essence[state.lang]}</div></div>
      <div class="card learn-row"><h4>${lbl('goal')}</h4><div>${m.goal[state.lang]}</div></div>
      <div class="card learn-row"><h4>${lbl('keys')}</h4><div>${m.keys[state.lang]}</div></div>
      <div class="card learn-row"><h4>${lbl('example')}</h4><div>${m.example[state.lang]}</div></div>
      <div class="card learn-row"><h4>${lbl('mnemonic')}</h4><div>${m.mnemonic[state.lang]}</div></div>
      <div class="toolbar">
        <button class="btn" onclick="navigate('#/models')">${tr('back_to_models')}</button>
        <button class="btn primary" onclick="navigate('#/quiz/${m.id}')">${tr('start_quiz')}</button>
      </div>
    </section>`;
  $('#app').innerHTML = s;
}

function lbl(k){
  const map = {
    goal: {ru:'Цель', en:'Goal'}, keys:{ru:'Ключевые структуры', en:'Key structures'}, example:{ru:'Пример', en:'Example'}, mnemonic:{ru:'Мнемоника', en:'Mnemonic'}
  };
  return map[k][state.lang];
}

// Quiz Engine
function renderQuiz(modelId) {
  const m = Models.find(x => x.id === modelId) || Models[0];
  const questions = m.quiz;
  let qi = 0;
  let correct = 0;
  let mistakes = [];

  function draw() {
    const q = questions[qi];
    $('#app').innerHTML = quizCard(m, q, qi + 1, questions.length, onSubmit, onNext, false);
  }

  function onSubmit(q, user) {
    const ok = checkAnswer(q, user);
    if (ok) correct++; else mistakes.push(q.id);
    showFeedback(q, user, ok, qi + 1 === questions.length);
  }

  function onNext() {
    qi++;
    if (qi < questions.length) draw();
    else finish();
  }

  function finish() {
    const score = Math.round((correct / questions.length) * 100);
    const ms = state.models[m.id];
    ms.lastScore = score;
    ms.mistakes = Array.from(new Set([...(ms.mistakes||[]), ...mistakes]));
    ms.status = score >= 80 ? 'mastered' : 'inprogress';
    if (score >= 80) unlockNext(m.id);
    saveState();
    navigate(`#/result/${m.id}`);
  }

  draw();
}

function unlockNext(modelId) {
  const idx = Models.findIndex(m => m.id === modelId);
  if (idx >= 0 && idx < Models.length - 1) {
    const nextId = Models[idx + 1].id;
    state.models[nextId].unlocked = true;
    if (state.models[nextId].status === 'locked') state.models[nextId].status = 'inprogress';
  }
}

function renderResult(modelId) {
  const m = Models.find(x => x.id === modelId) || Models[0];
  const ms = state.models[m.id];
  const unlockedMsg = (ms.lastScore >= 80) ? `<div class="feedback ok">${tr('unlocked_next')}</div>` : `<div class="feedback err">${tr('need_80')}</div>`;
  $('#app').innerHTML = `
    <section class="card result">
      <h3>${m.title[state.lang]} — ${tr('result')}</h3>
      <div>${tr('score')}: <strong>${ms.lastScore}%</strong></div>
      ${unlockedMsg}
      <div class="toolbar">
        <button class="btn primary" onclick="navigate('#/quiz/${m.id}')">${tr('retry')}</button>
        ${ms.mistakes?.length ? `<button class="btn" onclick="navigate('#/review/${m.id}')">${tr('start_review')} (${ms.mistakes.length})</button>` : ''}
        <button class="btn" onclick="navigate('#/models')">${tr('back_to_models')}</button>
      </div>
    </section>
  `;
}

function renderReview(modelId) {
  const m = Models.find(x => x.id === modelId) || Models[0];
  const pool = m.quiz.filter(q => (state.models[m.id].mistakes || []).includes(q.id));
  if (!pool.length) {
    $('#app').innerHTML = `<section class="card"><p>${tr('review_done')}</p><div class="toolbar"><button class="btn" onclick="navigate('#/models')">${tr('back_to_models')}</button></div></section>`;
    return;
  }
  let qi = 0; let left = [...pool]; let correctCount = 0;

  function draw() {
    const q = left[qi];
    $('#app').innerHTML = quizCard(m, q, qi + 1, left.length, onSubmit, onNext, true);
  }
  function onSubmit(q, user){
    const ok = checkAnswer(q, user);
    if (ok) correctCount++;
    showFeedback(q, user, ok, qi + 1 === left.length);
    if (ok) {
      // remove from mistakes permanently
      const arr = state.models[m.id].mistakes || [];
      state.models[m.id].mistakes = arr.filter(x => x !== q.id);
      saveState();
    }
  }
  function onNext(){
    qi++;
    if (qi < left.length) draw(); else renderReview(m.id);
  }
  draw();
}

// Final quiz
function renderFinalIntro(){
  const mastered = Object.values(state.models).filter(m => m.status === 'mastered').length;
  $('#app').innerHTML = `
    <section class="card">
      <h3>${tr('final_quiz_title')}</h3>
      <p>${mastered}/5 ${tr('mastered')}</p>
      <div class="toolbar">
        <button class="btn primary" onclick="navigate('#/final-quiz')">${tr('start')}</button>
        <button class="btn" onclick="navigate('#/models')">${tr('back_to_models')}</button>
      </div>
    </section>
  `;
}

function renderFinalQuiz(){
  // pick 10 questions: 2 per model
  const bank = Models.flatMap(m => m.quiz.slice(0,2));
  const questions = shuffle(bank).slice(0,10);
  let qi=0, correct=0;
  function draw(){
    const q = questions[qi];
    $('#app').innerHTML = quizCard({title:{[state.lang]:tr('final_quiz')}}, q, qi+1, questions.length, onSubmit, onNext, false);
  }
  function onSubmit(q, user){ const ok = checkAnswer(q, user); if (ok) correct++; showFeedback(q,user,ok, qi+1===questions.length); }
  function onNext(){ qi++; if (qi<questions.length) draw(); else finish(); }
  function finish(){ const score = Math.round(correct/questions.length*100); state.finalQuiz.bestScore = Math.max(state.finalQuiz.bestScore||0, score); saveState(); $('#app').innerHTML = `
    <section class="card result">
      <h3>${tr('final_quiz')}</h3>
      <div>${tr('score')}: <strong>${score}%</strong>${state.finalQuiz.bestScore? ` · best ${state.finalQuiz.bestScore}%`:''}</div>
      <div class="toolbar"><button class="btn primary" onclick="navigate('#/final-quiz')">${tr('retry')}</button><button class="btn" onclick="navigate('#/models')">${tr('back_to_models')}</button></div>
    </section>`; }
  draw();
}

// ===== Quiz UI helpers =====
function quizCard(model, q, n, total, onSubmit, onNext, isReview){
  const header = `<div class="card"><div class="small muted">${model.title?.[state.lang]||''}</div><div class="q-title">${tr('question')} ${n}/${total}</div><div>${q.prompt[state.lang]}</div></div>`;
  const body = questionBody(q);
  const actions = `<div class="toolbar"><button id="submitBtn" class="btn primary">${tr('submit')}</button></div>`;
  const wrap = `<section class="quiz">${header}<div class="q-card">${body}${actions}<div id="feedback"></div></div><div id="nav"></div></section>`;
  setTimeout(() => {
    $('#submitBtn').addEventListener('click', () => {
      const user = collectAnswer(q);
      if (user === null || user === undefined || (Array.isArray(user) && user.length===0)) return; // require selection
      onSubmit(q, user);
    });
  }, 0);
  // attach next handler on nav after render
  setTimeout(()=>{
    const nav = $('#nav');
    nav.addEventListener('click', (e)=>{
      const btn = e.target.closest('#nextBtn');
      if (!btn) return;
      onNext();
    });
  },0);
  return wrap;
}

function questionBody(q){
  switch(q.type){
    case 'mcq':
    case 'case':
      return `<div class="options">${q.options.map((o,i)=>`<label class="option"><input type="checkbox" name="opt" value="${i}"> <span>${o[state.lang]}</span></label>`).join('')}</div>`;
    case 'tf':
      return `<div class="options">
        <label class="option"><input type="radio" name="tf" value="true"> ${state.lang==='ru'?'Верно':'True'}</label>
        <label class="option"><input type="radio" name="tf" value="false"> ${state.lang==='ru'?'Неверно':'False'}</label>
      </div>`;
    case 'match':
      return `<div class="pairs">${q.left.map((l,i)=>`<div class="pair"><div>${l[state.lang]}</div><select data-left="${i}"><option value="">—</option>${q.right.map((r,ri)=>`<option value="${ri}">${r[state.lang]}</option>`).join('')}</select></div>`).join('')}</div>`;
    case 'order':
      return `<ol class="ordered">${q.items.map((it,i)=>`<li data-idx="${i}"><span>${it[state.lang]}</span><span class="moves"><button class="btn" data-m="up" type="button">↑</button><button class="btn" data-m="down" type="button">↓</button></span></li>`).join('')}</ol>`;
  }
}

function collectAnswer(q){
  switch(q.type){
    case 'mcq':
    case 'case':{
      const checks = $$('input[name="opt"]:checked');
      if (!checks.length) return null; return checks.map(c=>parseInt(c.value));
    }
    case 'tf':{
      const picked = $('input[name="tf"]:checked');
      if (!picked) return null; return picked.value === 'true';
    }
    case 'match':{
      const sels = $$('select[data-left]');
      if (sels.some(s=>!s.value)) return null; return Object.fromEntries(sels.map(s=>[s.getAttribute('data-left'), parseInt(s.value)]));
    }
    case 'order':{
      // allow users to reorder via buttons; attach handlers if not attached
      if (!collectAnswer._bound) {
        collectAnswer._bound = true;
        $$('.ordered [data-m]').forEach(btn=>btn.addEventListener('click', (e)=>{
          const li = e.target.closest('li');
          if (!li) return; const ol = li.parentElement; const dir = e.target.getAttribute('data-m');
          if (dir==='up' && li.previousElementSibling) ol.insertBefore(li, li.previousElementSibling);
          if (dir==='down' && li.nextElementSibling) ol.insertBefore(li.nextElementSibling, li);
        }));
      }
      const order = $$('.ordered li').map((li)=>parseInt(li.getAttribute('data-idx')));
      return order;
    }
  }
}

function checkAnswer(q, user){
  switch(q.type){
    case 'mcq':
    case 'case':
      return setsEqual(new Set(user), new Set(q.answer));
    case 'tf':
      return user === q.answer;
    case 'match':
      return Object.keys(q.map).every(k => parseInt(user[k]) === q.map[k]);
    case 'order':
      return user.every((idx, pos) => idx === q.correct[pos]);
  }
}

function setsEqual(a, b){
  if (a.size !== b.size) return false; for (const x of a) if (!b.has(x)) return false; return true;
}

function showFeedback(q, user, ok, isLast){
  // Mark selections
  if (q.type==='mcq' || q.type==='case'){
    $$('input[name="opt"]').forEach((inp,i)=>{
      const label = inp.closest('.option');
      const correct = q.answer.includes(i);
      label.classList.toggle('correct', correct);
      if (inp.checked && !correct) label.classList.add('incorrect');
      inp.disabled = true;
    });
  }
  if (q.type==='tf'){
    $$('input[name="tf"]').forEach(inp=>inp.disabled = true);
  }
  if (q.type==='match'){
    $$('select[data-left]').forEach(sel=>sel.disabled = true);
  }
  if (q.type==='order'){
    $$('.ordered [data-m]').forEach(btn=>btn.disabled = true);
  }
  const fb = $('#feedback');
  fb.innerHTML = `<div class="feedback ${ok?'ok':'err'}">${ok?tr('correct'):tr('incorrect')}</div><div class="small">${tr('explanation')}: ${q.explain[state.lang]}</div>`;
  const nav = $('#nav');
  nav.innerHTML = `<div class="toolbar"><button id="nextBtn" class="btn">${isLast?tr('finish'):tr('next')}</button></div>`;
  $('#nextBtn').focus();
}

// ===== Progress bar =====
function updateProgressBar(){
  const mastered = Object.values(state.models).filter(m => m.status === 'mastered').length;
  const percent = Math.round(mastered / Models.length * 100);
  $('#progressFill').style.width = percent + '%';
}

// ===== Localization of chrome (header/footer) =====
function localizeChrome(){
  $('#appTitle').textContent = tr('title');
  $('#disclaimer').textContent = tr('disclaimer');
  $('#langToggle').textContent = tr('lang_btn');
  const ex = $('#exportLabel'); if (ex) ex.textContent = tr('export');
  const im = $('#importLabel'); if (im) im.textContent = tr('import');
}

// ===== Export/Import =====
function exportProgress(){
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'osteo5-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file){
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      // Basic validation
      if (!obj || !obj.models) throw new Error('Invalid');
      state = { ...defaultState(), ...obj, models: { ...defaultState().models, ...(obj.models||{}) } };
      saveState();
      alert(tr('import_success'));
      onRouteChange();
    } catch (e) {
      alert('Invalid JSON');
    }
  };
  reader.readAsText(file);
}

// ===== Header controls =====
function initChrome(){
  $('#langToggle').addEventListener('click', ()=>{
    state.lang = state.lang === 'ru' ? 'en' : 'ru';
    document.documentElement.lang = state.lang;
    saveState();
    onRouteChange();
  });
  $('#fontToggle').addEventListener('click', ()=>{
    state.fontLarge = !state.fontLarge;
    document.body.classList.toggle('large-font', state.fontLarge);
    saveState();
  });
  $('#exportBtn').addEventListener('click', exportProgress);
  $('#importFile').addEventListener('change', (e)=>{
    const f = e.target.files[0]; if (f) importProgress(f);
    e.target.value = '';
  });
}

// ===== Utils =====
function shuffle(arr){
  const a = [...arr]; for (let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a;
}

// ===== Startup =====
function hydrate(){
  document.documentElement.lang = state.lang;
  document.body.classList.toggle('large-font', state.fontLarge);
  initChrome();
  onRouteChange();
}

window.navigate = navigate; // for inline onclick
window.resetProgress = resetProgress;

document.addEventListener('DOMContentLoaded', hydrate);
