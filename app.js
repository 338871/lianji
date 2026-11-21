(function () {
  'use strict';

  const STORAGE_KEY = 'lianji.workouts.v1';
  const EXTRAS_KEY = 'lianji.extras.v1';
  const SETTINGS_KEY = 'lianji.settings.v1';
  const EDITOR_LIGHT_KEY = 'lianji.editorLight.v1';
  const NOTE_KEY = 'lianji.note.v1';
  const PART_NOTES_KEY = 'lianji.partNotes.v1';
  const POEMS_KEY = 'lianji.poems.v1';
  const POEMS_MIGRATION_KEY = 'lianji.poems.noDongfang.v1';
  const DATA_VIEW_KEY = 'lianji.dataView.v1';
  const WEIGHTS_V2_KEY = 'lianji.weights.v2';
  const MEDIA_DB = 'lianji.media.v1';
  const MEDIA_STORE = 'photos';
  const MAX_PHOTOS = 5;
  const PIE_COLORS = Object.freeze([
    '#0071e3', '#34c759', '#ff9500', '#af52de', '#ff2d55', '#00c7be',
    '#5856d6', '#ffd60a', '#ff3b30', '#8e8e93', '#5ac8fa', '#a2845e'
  ]);
  const MONTH_COLORS = Object.freeze(['#5aa9d6', '#c99700', '#e56b9f']);
  function monthColor(monthIndex) {
    return MONTH_COLORS[((monthIndex % MONTH_COLORS.length) + MONTH_COLORS.length) % MONTH_COLORS.length];
  }
  const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const DEFAULT_POEMS = Object.freeze([
    '自信人生二百年，会当水击三千里',
    '海到尽头天作岸，山登绝顶我为峰',
    '立志欲坚不欲锐，成功在久不在速',
    '踏遍青山人未老，风景这边独好',
    '今日长缨在手，何时缚住苍龙',
    '已是悬崖百丈冰，犹有花枝俏'
  ]);
  const DEFAULT_SETTINGS = Object.freeze({
    theme: 'light',
    accent: 'blue',
    weekStart: 'monday',
    noteColor: '#ff3b30',
    imageColor: '#ffd60a',
    editorColor: '#8fd3ff',
    recordMark: 'bar',
    photoQuality: 'compressed',
    fontSize: 'small',
    haptics: true,
    partLabels: {},
    customParts: [],
    partOrder: [],
    weights: {
      chest: 5,
      shoulders: 3,
      back: 5,
      legs: 5,
      triceps: 2,
      biceps: 2,
      abs: 2,
      cardio: 3
    }
  });
  const ACCENTS = Object.freeze([
    {
      id: 'blue', name: '蓝色', swatch: '#0071e3',
      accent: '#0071e3', deep: '#0066cc', rgb: '0, 113, 227',
      darkAccent: '#0a84ff', darkDeep: '#409cff', darkRgb: '10, 132, 255',
      darkInk: '#ffffff'
    },
    {
      id: 'graphite', name: '石墨', swatch: '#48484a',
      accent: '#1d1d1f', deep: '#000000', rgb: '29, 29, 31',
      darkAccent: '#d2d2d7', darkDeep: '#f5f5f7', darkRgb: '210, 210, 215'
    },
    {
      id: 'green', name: '绿色', swatch: '#34c759',
      accent: '#248a3d', deep: '#1c7030', rgb: '36, 138, 61',
      darkAccent: '#30d158', darkDeep: '#4ade80', darkRgb: '48, 209, 88'
    },
    {
      id: 'orange', name: '橙色', swatch: '#ff9500',
      accent: '#c93400', deep: '#a52a00', rgb: '201, 52, 0',
      darkAccent: '#ff9f0a', darkDeep: '#ffb340', darkRgb: '255, 159, 10'
    },
    {
      id: 'purple', name: '紫色', swatch: '#af52de',
      accent: '#8944ab', deep: '#6f358b', rgb: '137, 68, 171',
      darkAccent: '#bf5af2', darkDeep: '#d38df5', darkRgb: '191, 90, 242'
    },
    {
      id: 'pink', name: '粉红', swatch: '#ff2d55',
      accent: '#d7003a', deep: '#b0002f', rgb: '215, 0, 58',
      darkAccent: '#ff375f', darkDeep: '#ff6b89', darkRgb: '255, 55, 95'
    },
    {
      id: 'lightblue', name: '浅蓝', swatch: '#8fd3ff',
      accent: '#3a9ed9', deep: '#2b7fa8', rgb: '58, 158, 217',
      darkAccent: '#8fd3ff', darkDeep: '#b5e2ff', darkRgb: '143, 211, 255',
      darkInk: '#1d1d1f'
    },
    {
      id: 'gray', name: '灰色', swatch: '#8e8e93',
      accent: '#6c6c70', deep: '#555559', rgb: '108, 108, 112',
      darkAccent: '#aeaeb2', darkDeep: '#c7c7cc', darkRgb: '174, 174, 178'
    }
  ]);
  const ACCENT_BY_ID = new Map(ACCENTS.map(function (accent) { return [accent.id, accent]; }));
  const DOT_COLORS = Object.freeze([
    { value: '#ff3b30', name: '红色' },
    { value: '#ff9500', name: '橙色' },
    { value: '#ffd60a', name: '黄色' },
    { value: '#34c759', name: '绿色' },
    { value: '#00c7be', name: '青色' },
    { value: '#0071e3', name: '蓝色' },
    { value: '#8fd3ff', name: '浅蓝' },
    { value: '#5856d6', name: '靛蓝' },
    { value: '#af52de', name: '紫色' },
    { value: '#ff2d55', name: '粉红' },
    { value: '#8e8e93', name: '灰色' }
  ]);
  const DOT_COLOR_MAP = new Map(DOT_COLORS.map(function (color) { return [color.value, color] }));
  const PANEL_COLORS = Object.freeze([
    { value: '#8fd3ff', name: '浅蓝' },
    { value: '#1d1d1f', name: '石墨' },
    { value: '#3a3a3c', name: '深灰' },
    { value: '#8e8e93', name: '灰色' },
    { value: '#0a4f7a', name: '深蓝' },
    { value: '#ff8fab', name: '粉红' },
    { value: '#30d158', name: '绿色' },
    { value: '#ff9f0a', name: '橙色' },
    { value: '#bf5af2', name: '紫色' },
    { value: '#ff453a', name: '红色' }
  ]);
  const PANEL_COLOR_MAP = new Map(PANEL_COLORS.map(function (color) { return [color.value, color]; }));
  const DEFAULT_WEIGHTS = Object.freeze({
    chest: 4.5,
    shoulders: 4.5,
    back: 5,
    legs: 5,
    triceps: 2,
    biceps: 2,
    abs: 2.5,
    cardio: 3
  });
  const BASE_PARTS = Object.freeze([
    { id: 'chest', label: '胸', short: '胸', en: 'CHEST', weight: 4.5 },
    { id: 'shoulders', label: '肩', short: '肩', en: 'SHOULDER', weight: 4.5 },
    { id: 'back', label: '背', short: '背', en: 'BACK', weight: 5 },
    { id: 'legs', label: '腿', short: '腿', en: 'LEGS', weight: 5 },
    { id: 'triceps', label: '三头', short: '三头', en: 'TRICEPS', weight: 2 },
    { id: 'biceps', label: '二头', short: '二头', en: 'BICEPS', weight: 2 },
    { id: 'abs', label: '腹', short: '腹', en: 'ABS', weight: 2.5 },
    { id: 'cardio', label: '有氧', short: '氧', en: 'CARDIO', weight: 3 }
  ]);
  const LEGACY_PART_MAP = Object.freeze({
    glutes: 'legs',
    arms: 'biceps',
    core: 'abs'
  });
  let partCatalog = BASE_PARTS.slice();
  let partById = new Map(partCatalog.map(function (part) { return [part.id, part]; }));
  let partOrder = new Map(partCatalog.map(function (part, index) { return [part.id, index]; }));
  const params = new URLSearchParams(window.location.search);

  let storageBlocked = false;

  const els = {
    settingsBtn: document.getElementById('settingsBtn'),
    monthTitleBtn: document.getElementById('monthTitleBtn'),
    monthView: document.getElementById('monthView'),
    yearView: document.getElementById('yearView'),
    yearTitle: document.getElementById('yearTitle'),
    yearGrid: document.getElementById('yearGrid'),
    yearFilter: document.getElementById('yearFilter'),
    yearFilterBtn: document.getElementById('yearFilterBtn'),
    yearFilterCount: document.getElementById('yearFilterCount'),
    yearFilterPopover: document.getElementById('yearFilterPopover'),
    yearFilterDone: document.getElementById('yearFilterDone'),
    closeYearBtn: document.getElementById('closeYearBtn'),
    prevYear: document.getElementById('prevYear'),
    nextYear: document.getElementById('nextYear'),
    monthNum: document.getElementById('monthNum'),
    yearBtn: document.getElementById('yearBtn'),
    monthCount: document.getElementById('monthCount'),
    monthSummaryBtn: document.getElementById('monthSummaryBtn'),
    statsSheet: document.getElementById('statsSheet'),
    closeStats: document.getElementById('closeStats'),
    statsPeriodSegment: document.getElementById('statsPeriodSegment'),
    statsCaption: document.getElementById('statsCaption'),
    statsList: document.getElementById('statsList'),
    curveView: document.getElementById('curveView'),
    curveMain: document.getElementById('curveMain'),
    curveTitle: document.getElementById('curveTitle'),
    curveTitleBtn: document.getElementById('curveTitleBtn'),
    curveOverview: document.getElementById('curveOverview'),
    curveOverviewBack: document.getElementById('curveOverviewBack'),
    curveOverviewYear: document.getElementById('curveOverviewYear'),
    curveOverviewGrid: document.getElementById('curveOverviewGrid'),
    curveOverviewPrevYear: document.getElementById('curveOverviewPrevYear'),
    curveOverviewNextYear: document.getElementById('curveOverviewNextYear'),
    partPiePeriod: document.getElementById('partPiePeriod'),
    pieChart: document.getElementById('pieChart'),
    pieMonthBtn: document.getElementById('pieMonthBtn'),
    pieMonthPopover: document.getElementById('pieMonthPopover'),
    pieMonthYear: document.getElementById('pieMonthYear'),
    piePrevYear: document.getElementById('piePrevYear'),
    pieNextYear: document.getElementById('pieNextYear'),
    pieMonthGrid: document.getElementById('pieMonthGrid'),
    pieMonthDone: document.getElementById('pieMonthDone'),
    pieRange: document.getElementById('pieRange'),
    timelineRange: document.getElementById('timelineRange'),
    timelineTableHead: document.getElementById('timelineTableHead'),
    timelineTableFoot: document.getElementById('timelineTableFoot'),
    timelineTableBody: document.getElementById('timelineTableBody'),
    timelineCaption: document.getElementById('timelineCaption'),
    timelineEmpty: document.getElementById('timelineEmpty'),
    pieTotal: document.getElementById('pieTotal'),
    pieCaption: document.getElementById('pieCaption'),
    curveSettingsBtn: document.getElementById('curveSettingsBtn'),
    curvePeriodSegment: document.getElementById('curvePeriodSegment'),
    curveRangeLabel: document.getElementById('curveRangeLabel'),
    curveMonthBtn: document.getElementById('curveMonthBtn'),
    curveMonthLabel: document.getElementById('curveMonthLabel'),
    curveMonthPopover: document.getElementById('curveMonthPopover'),
    curvePickerYear: document.getElementById('curvePickerYear'),
    curveMonthGrid: document.getElementById('curveMonthGrid'),
    curveMonthDone: document.getElementById('curveMonthDone'),
    curvePrevYear: document.getElementById('curvePrevYear'),
    curveNextYear: document.getElementById('curveNextYear'),
    curveMonthGroups: document.getElementById('curveMonthGroups'),
    curveChart: document.getElementById('curveChart'),
    curveEmpty: document.getElementById('curveEmpty'),
    curveLegend: document.getElementById('curveLegend'),
    curveTip: document.getElementById('curveTip'),
    profileView: document.getElementById('profileView'),
    profileSettingsBtn: document.getElementById('profileSettingsBtn'),
    metricTotal: document.getElementById('metricTotal'),
    metricMonth: document.getElementById('metricMonth'),
    metricYear: document.getElementById('metricYear'),
    metricRecent: document.getElementById('metricRecent'),
    profileParts: document.getElementById('profileParts'),
    profileRecent: document.getElementById('profileRecent'),
    profilePhotoCount: document.getElementById('profilePhotoCount'),
    profilePhotoToggle: document.getElementById('profilePhotoToggle'),
    photoGallerySheet: document.getElementById('photoGallerySheet'),
    photoGalleryClose: document.getElementById('photoGalleryClose'),
    profilePhotoPrevMonth: document.getElementById('profilePhotoPrevMonth'),
    profilePhotoNextMonth: document.getElementById('profilePhotoNextMonth'),
    profilePhotoMonthBtn: document.getElementById('profilePhotoMonthBtn'),
    profilePhotoMonths: document.getElementById('profilePhotoMonths'),
    profilePhotoGroups: document.getElementById('profilePhotoGroups'),
    profilePhotoEmpty: document.getElementById('profilePhotoEmpty'),
    profileRecentCount: document.getElementById('profileRecentCount'),
    partNotesToggle: document.getElementById('partNotesToggle'),
    partNotesSummary: document.getElementById('partNotesSummary'),
    partNotesPreview: document.getElementById('partNotesPreview'),
    partNotesSheet: document.getElementById('partNotesSheet'),
    partNotesClose: document.getElementById('partNotesClose'),
    partNotesList: document.getElementById('partNotesList'),
    poemEditEntry: document.getElementById('poemEditEntry'),
    poemEntryCount: document.getElementById('poemEntryCount'),
    poemEditorSheet: document.getElementById('poemEditorSheet'),
    poemEditorClose: document.getElementById('poemEditorClose'),
    poemList: document.getElementById('poemList'),
    poemAddBtn: document.getElementById('poemAddBtn'),
    poemResetBtn: document.getElementById('poemResetBtn'),
    profileNoteInput: document.getElementById('profileNoteInput'),
    viewSwitch: document.getElementById('viewSwitch'),
    calendarCard: document.getElementById('calendarCard'),
    weekdays: document.getElementById('weekdays'),
    calendarGrid: document.getElementById('calendarGrid'),
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),
    todayEyebrow: document.getElementById('todayEyebrow'),
    todayTitle: document.getElementById('todayTitle'),
    todayMeta: document.getElementById('todayMeta'),
    todayActionIcon: document.getElementById('todayActionIcon'),
    todayActionText: document.getElementById('todayActionText'),
    logTodayBtn: document.getElementById('logTodayBtn'),
    sheetBackdrop: document.getElementById('sheetBackdrop'),
    entrySheet: document.getElementById('entrySheet'),
    settingsSheet: document.getElementById('settingsSheet'),
    closeSheet: document.getElementById('closeSheet'),
    closeSettings: document.getElementById('closeSettings'),
    sheetDateText: document.getElementById('sheetDateText'),
    sheetTodayBadge: document.getElementById('sheetTodayBadge'),
    sheetTitle: document.getElementById('sheetTitle'),
    partGrid: document.getElementById('partGrid'),
    partEditBtn: document.getElementById('partEditBtn'),
    partEditor: document.getElementById('partEditor'),
    partEditorList: document.getElementById('partEditorList'),
    addPartBtn: document.getElementById('addPartBtn'),
    dayDetail: document.getElementById('dayDetail'),
    dayDetailNote: document.getElementById('dayDetailNote'),
    dayPhotos: document.getElementById('dayPhotos'),
    noteInput: document.getElementById('noteInput'),
    noteCount: document.getElementById('noteCount'),
    photoInput: document.getElementById('photoInput'),
    photoAddBtn: document.getElementById('photoAddBtn'),
    photoGrid: document.getElementById('photoGrid'),
    photoCount: document.getElementById('photoCount'),
    selectionText: document.getElementById('selectionText'),
    clearBtn: document.getElementById('clearBtn'),
    saveBtn: document.getElementById('saveBtn'),
    accentSwatches: document.getElementById('accentSwatches'),
    accentLabel: document.getElementById('accentLabel'),
    themeSegment: document.getElementById('themeSegment'),
    weekSegment: document.getElementById('weekSegment'),
    noteColorSwatches: document.getElementById('noteColorSwatches'),
    noteColorLabel: document.getElementById('noteColorLabel'),
    imageColorSwatches: document.getElementById('imageColorSwatches'),
    imageColorLabel: document.getElementById('imageColorLabel'),
    editorColorSwatches: document.getElementById('editorColorSwatches'),
    editorColorLabel: document.getElementById('editorColorLabel'),
    photoQualitySegment: document.getElementById('photoQualitySegment'),
    fontSizeSegment: document.getElementById('fontSizeSegment'),
    fontSizeLabel: document.getElementById('fontSizeLabel'),
    photoQualityLabel: document.getElementById('photoQualityLabel'),
    markSegment: document.getElementById('markSegment'),
    weightsToggle: document.getElementById('weightsToggle'),
    weightEditor: document.getElementById('weightEditor'),
    weightEditorList: document.getElementById('weightEditorList'),
    resetWeights: document.getElementById('resetWeights'),
    exportBackupBtn: document.getElementById('exportBackupBtn'),
    importBackupBtn: document.getElementById('importBackupBtn'),
    importBackupInput: document.getElementById('importBackupInput'),
    storageUsage: document.getElementById('storageUsage'),
    clearAllDataBtn: document.getElementById('clearAllDataBtn'),
    hapticsSwitch: document.getElementById('hapticsSwitch'),
    aboutLink: document.getElementById('aboutLink'),
    aboutSheet: document.getElementById('aboutSheet'),
    aboutClose: document.getElementById('aboutClose'),
    aboutGithub: document.getElementById('aboutGithub'),
    resetSettings: document.getElementById('resetSettings'),
    metaTheme: document.querySelector('meta[name="theme-color"]'),
    photoViewer: document.getElementById('photoViewer'),
    photoViewerClose: document.getElementById('photoViewerClose'),
    photoViewerPrev: document.getElementById('photoViewerPrev'),
    photoViewerNext: document.getElementById('photoViewerNext'),
    photoViewerImg: document.getElementById('photoViewerImg'),
    photoViewerCaption: document.getElementById('photoViewerCaption'),
    toast: document.getElementById('toast'),
    toastText: document.getElementById('toastText'),
    toastAction: document.getElementById('toastAction')
  };

  function loadDataView() {
    const fallback = {
      curvePeriod: 'month',
      curveDate: startOfMonth(new Date()),
      curveYear: new Date().getFullYear(),
      pieRange: '30',
      pieYear: new Date().getFullYear(),
      pieMonth: new Date().getMonth(),
      timelineRange: '30'
    };
    try {
      const raw = window.localStorage.getItem(DATA_VIEW_KEY);
      if (!raw) return fallback;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return fallback;
      if (data.curvePeriod === 'month' || data.curvePeriod === '30' || data.curvePeriod === 'year') {
        fallback.curvePeriod = data.curvePeriod;
      }
      if (typeof data.curveMonth === 'string' && /^\d{4}-\d{2}$/.test(data.curveMonth)) {
        const parts = data.curveMonth.split('-').map(Number);
        if (parts[1] >= 1 && parts[1] <= 12) fallback.curveDate = new Date(parts[0], parts[1] - 1, 1);
      }
      if (Number.isInteger(data.curveYear) && data.curveYear >= 1970 && data.curveYear <= 2100) {
        fallback.curveYear = data.curveYear;
      }
      if (data.pieRange === '30' || data.pieRange === '90' || data.pieRange === '365' || data.pieRange === 'month') {
        fallback.pieRange = data.pieRange;
      }
      if (Number.isInteger(data.pieYear) && data.pieYear >= 1970 && data.pieYear <= 2100) {
        fallback.pieYear = data.pieYear;
      }
      if (Number.isInteger(data.pieMonth) && data.pieMonth >= 0 && data.pieMonth <= 11) {
        fallback.pieMonth = data.pieMonth;
      }
      if (data.timelineRange === '30' || data.timelineRange === 'month') {
        fallback.timelineRange = data.timelineRange;
      }
      return fallback;
    } catch (error) {
      return fallback;
    }
  }

  const INITIAL_DATA_VIEW = loadDataView();

  function persistDataView() {
    try {
      const month = state.curveDate.getFullYear() + '-' + String(state.curveDate.getMonth() + 1).padStart(2, '0');
      window.localStorage.setItem(DATA_VIEW_KEY, JSON.stringify({
        curvePeriod: state.curvePeriod,
        curveMonth: month,
        curveYear: state.curveYear,
        pieRange: state.pieRange,
        pieYear: state.pieYear,
        pieMonth: state.pieMonth,
        timelineRange: state.timelineRange
      }));
    } catch (error) {
      // View memory is optional.
    }
  }

  const state = {
    viewDate: startOfMonth(new Date()),
    yearViewYear: new Date().getFullYear(),
    yearFilter: new Set(),
    curveDate: INITIAL_DATA_VIEW.curveDate,
    curveYear: INITIAL_DATA_VIEW.curveYear,
    curveOverviewYear: new Date().getFullYear(),
    pieYear: INITIAL_DATA_VIEW.pieYear,
    pieMonth: INITIAL_DATA_VIEW.pieMonth,
    piePickerYear: INITIAL_DATA_VIEW.pieYear,
    pieRange: INITIAL_DATA_VIEW.pieRange,
    timelineRange: INITIAL_DATA_VIEW.timelineRange,
    profilePhotoMonth: startOfMonth(new Date()),
    profilePhotoUrls: [],
    profilePhotoToken: 0,
    profileNote: loadProfileNote(),
    partNotes: loadPartNotes(),
    poems: loadPoems(),
    todayPoem: '',
    openPartNoteId: null,
    profileNoteTimer: 0,
    curvePeriod: INITIAL_DATA_VIEW.curvePeriod,
    curvePickerYear: INITIAL_DATA_VIEW.curveDate.getFullYear(),
    mainView: 'calendar',
    statsPeriod: 'month',
    settings: loadSettings(),
    workouts: {},
    extras: {},
    detailDateKey: dateKey(new Date()),
    selectedDateKey: null,
    lastCalendarTap: { key: '', at: 0 },
    draft: new Set(),
    draftNote: '',
    draftPhotos: [],
    returnFocus: null,
    returnFocusDateKey: null,
    activePanel: null,
    dayPhotoToken: 0,
    viewerPhotos: [],
    viewerIndex: 0,
    viewerReturnFocus: null,
    hideTimer: 0,
    focusTimer: 0,
    photoCleanupTimer: 0,
    toastTimer: 0,
    toastAction: null,
    isDemo: params.has('demo'),
    lastTodayKey: dateKey(new Date()),
    swipeStart: null,
    suppressClick: false,
    curveSwipeStart: null,
    curveSuppressClick: false
  };

  refreshPartCatalog();
  state.workouts = loadWorkouts();
  state.extras = loadExtras();

  if (state.isDemo) {
    state.workouts = Object.assign(buildDemoWorkouts(), state.workouts);
  }

  const photoUrlCache = new Map();
  let mediaDbPromise = null;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function dateKey(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function fromKey(key) {
    const pieces = key.split('-').map(Number);
    return new Date(pieces[0], pieces[1] - 1, pieces[2]);
  }

  function addDays(date, days) {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    next.setDate(next.getDate() + days);
    return next;
  }

  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function normalizeWorkout(ids) {
    return Array.from(new Set(ids.map(function (id) { return LEGACY_PART_MAP[id] || id; })))
      .filter(function (id) { return partById.has(id); })
      .sort(function (a, b) { return partOrder.get(a) - partOrder.get(b); });
  }

  function replaceContent(element, fragment) {
    while (element.firstChild) element.removeChild(element.firstChild);
    element.appendChild(fragment);
  }

  function dataUrlToBlob(dataUrl) {
    const pieces = String(dataUrl).split(',');
    if (pieces.length !== 2) throw new Error('invalid data url');
    const meta = pieces[0].match(/^data:([^;]+);base64$/);
    if (!meta) throw new Error('invalid data url');
    const binary = window.atob(pieces[1]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new Blob([bytes], { type: meta[1] });
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(reader.error || new Error('read failed')); };
      reader.readAsDataURL(blob);
    });
  }

  function openMediaDb() {
    if (mediaDbPromise) return mediaDbPromise;
    mediaDbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const request = window.indexedDB.open(MEDIA_DB, 1);
      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains(MEDIA_STORE)) {
          const store = db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
        }
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error || new Error('db open failed')); };
    });
    return mediaDbPromise;
  }

  function mediaPut(record) {
    return openMediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        const tx = db.transaction(MEDIA_STORE, 'readwrite');
        tx.objectStore(MEDIA_STORE).put(record);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error || new Error('put failed')); };
        tx.onabort = function () { reject(tx.error || new Error('put aborted')); };
      });
    });
  }

  function mediaGet(id) {
    return openMediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        const tx = db.transaction(MEDIA_STORE, 'readonly');
        const request = tx.objectStore(MEDIA_STORE).get(id);
        request.onsuccess = function () { resolve(request.result || null); };
        request.onerror = function () { reject(request.error || new Error('get failed')); };
      });
    });
  }

  function mediaDelete(id) {
    return openMediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        const tx = db.transaction(MEDIA_STORE, 'readwrite');
        tx.objectStore(MEDIA_STORE).delete(id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error || new Error('delete failed')); };
      });
    });
  }

  function mediaClear() {
    return openMediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        const tx = db.transaction(MEDIA_STORE, 'readwrite');
        tx.objectStore(MEDIA_STORE).clear();
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error || new Error('clear failed')); };
      });
    });
  }

  function mediaGetAll() {
    return openMediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        const tx = db.transaction(MEDIA_STORE, 'readonly');
        const request = tx.objectStore(MEDIA_STORE).getAll();
        request.onsuccess = function () { resolve(request.result || []); };
        request.onerror = function () { reject(request.error || new Error('get all failed')); };
      });
    });
  }

  function releasePhotoUrl(id) {
    const url = photoUrlCache.get(id);
    if (url) {
      window.URL.revokeObjectURL(url);
      photoUrlCache.delete(id);
    }
  }

  function photoUrl(id, blob) {
    if (photoUrlCache.has(id)) return photoUrlCache.get(id);
    const url = window.URL.createObjectURL(blob);
    photoUrlCache.set(id, url);
    return url;
  }

  function photoMetas(extras) {
    return Array.isArray(extras.photos) ? extras.photos : [];
  }

  function extrasHasPhoto(extras) {
    return photoMetas(extras).length > 0 || Boolean(extras.image);
  }

  async function migrateLegacyPhotos() {
    let changed = false;
    const keys = Object.keys(state.extras);
    for (const key of keys) {
      const extras = state.extras[key];
      if (!extras || !extras.image || extras.image.indexOf('data:image/') !== 0) continue;
      try {
        const blob = dataUrlToBlob(extras.image);
        const id = 'legacy_' + key.replace(/-/g, '') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
        await mediaPut({ id: id, date: key, blob: blob, type: blob.type || 'image/jpeg', createdAt: Date.now() });
        extras.photos = [{ id: id, type: blob.type || 'image/jpeg' }];
        delete extras.image;
        changed = true;
      } catch (error) {
        // Leave the legacy data in place if the migration fails.
      }
    }
    if (changed) {
      persistExtras();
      renderAll();
    }
  }

  function loadWorkouts() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
      const clean = {};
      Object.keys(data).forEach(function (key) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !Array.isArray(data[key])) return;
        const parsedDate = fromKey(key);
        if (Number.isNaN(parsedDate.getTime()) || dateKey(parsedDate) !== key) return;
        const parts = normalizeWorkout(data[key]);
        if (parts.length) clean[key] = parts;
      });
      return clean;
    } catch (error) {
      storageBlocked = true;
      return {};
    }
  }

  function cleanPartLabel(value) {
    return typeof value === 'string' ? value.trim().slice(0, 8) : '';
  }

  function loadProfileNote() {
    try {
      return (window.localStorage.getItem(NOTE_KEY) || '').slice(0, 1000);
    } catch (error) {
      return '';
    }
  }
  function resizeProfileNote() {
    if (!els.profileNoteInput) return;
    els.profileNoteInput.style.height = 'auto';
    els.profileNoteInput.style.height = '68px';
  }
  function persistProfileNote() {
    try {
      window.localStorage.setItem(NOTE_KEY, state.profileNote);
      return true;
    } catch (error) {
      return false;
    }
  }
  function loadPartNotes() {
    try {
      const raw = window.localStorage.getItem(PART_NOTES_KEY);
      console.log('LOADNOTES', raw);
      if (!raw) return {};
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
      const notes = {};
      Object.keys(data).forEach(function (id) {
        if (typeof data[id] !== 'string') return;
        const text = data[id].slice(0, 200).trim();
        if (text) notes[id] = text;
      });
      return notes;
    } catch (error) {
      return {};
    }
  }

  function cleanPoems(list) {
    if (!Array.isArray(list)) return [];
    return list.map(function (item) {
      return typeof item === 'string' ? item.trim().slice(0, 80) : '';
    }).filter(Boolean);
  }

  function loadPoems() {
    try {
      const raw = window.localStorage.getItem(POEMS_KEY);
      let list = raw === null ? DEFAULT_POEMS.slice() : cleanPoems(JSON.parse(raw));
      if (!window.localStorage.getItem(POEMS_MIGRATION_KEY)) {
        const filtered = list.filter(function (poem) { return poem !== '东方欲晓，莫道君行早'; });
        if (filtered.length !== list.length) {
          list = filtered;
          window.localStorage.setItem(POEMS_KEY, JSON.stringify(list));
        }
        window.localStorage.setItem(POEMS_MIGRATION_KEY, '1');
      }
      return list;
    } catch (error) {
      return DEFAULT_POEMS.slice();
    }
  }

  function persistPoems() {
    try {
      window.localStorage.setItem(POEMS_KEY, JSON.stringify(cleanPoems(state.poems)));
      return true;
    } catch (error) {
      return false;
    }
  }

  function pickTodayPoem() {
    const poems = cleanPoems(state.poems);
    if (!poems.length) {
      state.todayPoem = '';
      return '';
    }
    if (state.todayPoem && poems.indexOf(state.todayPoem) >= 0) return state.todayPoem;
    const pool = poems.filter(function (item) { return item !== state.todayPoem; });
    const source = pool.length ? pool : poems;
    state.todayPoem = source[Math.floor(Math.random() * source.length)];
    return state.todayPoem;
  }

  function persistPartNotes() {
    try {
      if (Object.keys(state.partNotes).length) {
        window.localStorage.setItem(PART_NOTES_KEY, JSON.stringify(state.partNotes));
      } else {
        window.localStorage.removeItem(PART_NOTES_KEY);
    window.localStorage.removeItem(POEMS_KEY);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function loadSettings() {
    const settings = Object.assign({}, DEFAULT_SETTINGS, {
      partLabels: {},
      customParts: [],
      weights: Object.assign({}, DEFAULT_WEIGHTS)
    });
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (!raw) return settings;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) return settings;
      if (data.theme === 'light' || data.theme === 'dark' || data.theme === 'auto') settings.theme = data.theme;
      if (typeof data.accent === 'string' && ACCENT_BY_ID.has(data.accent)) settings.accent = data.accent;
      if (data.weekStart === 'monday' || data.weekStart === 'sunday') settings.weekStart = data.weekStart;
      if (typeof data.noteColor === 'string' && DOT_COLOR_MAP.has(data.noteColor)) settings.noteColor = data.noteColor;
      if (typeof data.imageColor === 'string' && DOT_COLOR_MAP.has(data.imageColor)) settings.imageColor = data.imageColor;
      if (typeof data.editorColor === 'string' && PANEL_COLOR_MAP.has(data.editorColor)) settings.editorColor = data.editorColor;
      if (data.recordMark === 'bar' || data.recordMark === 'dot') settings.recordMark = data.recordMark;
      if (data.photoQuality === 'compressed' || data.photoQuality === 'original') settings.photoQuality = data.photoQuality;
      if (data.fontSize === 'small' || data.fontSize === 'medium' || data.fontSize === 'large') settings.fontSize = data.fontSize;
      if (typeof data.haptics === 'boolean') settings.haptics = data.haptics;

      if (data.partLabels && typeof data.partLabels === 'object' && !Array.isArray(data.partLabels)) {
        BASE_PARTS.forEach(function (part) {
          const label = cleanPartLabel(data.partLabels[part.id]);
          if (label) settings.partLabels[part.id] = label;
        });
      }

      if (data.weights && typeof data.weights === 'object' && !Array.isArray(data.weights)) {
        BASE_PARTS.forEach(function (part) {
          const value = Number(data.weights[part.id]);
          if (Number.isFinite(value) && Math.round(value * 2) === value * 2 && value >= 1 && value <= 9) settings.weights[part.id] = value;
        });
      }

      if (Array.isArray(data.customParts)) {
        const seen = new Set();
        data.customParts.slice(0, 20).forEach(function (item) {
          if (!item || typeof item !== 'object') return;
          const id = typeof item.id === 'string' ? item.id : '';
          const label = cleanPartLabel(item.label);
          const weight = Number(item.weight);
          if (!/^custom_[a-z0-9]+$/.test(id) || seen.has(id) || !label) return;
          if (!Number.isFinite(weight) || Math.round(weight * 2) !== weight * 2 || weight < 1 || weight > 9) return;
          seen.add(id);
          settings.customParts.push({ id: id, label: label, weight: weight });
        });
      }

      const allowed = new Set(BASE_PARTS.map(function (part) { return part.id; }));
      settings.customParts.forEach(function (part) { allowed.add(part.id); });
      const defaultOrder = BASE_PARTS.map(function (part) { return part.id; })
        .concat(settings.customParts.map(function (part) { return part.id; }));
      const savedOrder = Array.isArray(data.partOrder) ? data.partOrder : [];
      const seenOrder = new Set();
      settings.partOrder = savedOrder.filter(function (id) {
        if (typeof id !== 'string' || !allowed.has(id) || seenOrder.has(id)) return false;
        seenOrder.add(id);
        return true;
      });
      defaultOrder.forEach(function (id) {
        if (!seenOrder.has(id)) settings.partOrder.push(id);
      });

      if (!window.localStorage.getItem(WEIGHTS_V2_KEY)) {
        const oldWeights = {
          chest: 5, shoulders: 3, back: 5, legs: 5,
          triceps: 2, biceps: 2, abs: 2, cardio: 3
        };
        const usesOldDefaults = Object.keys(oldWeights).every(function (id) {
          return Number(settings.weights[id]) === oldWeights[id];
        });
        if (usesOldDefaults) {
          Object.keys(DEFAULT_WEIGHTS).forEach(function (id) {
            settings.weights[id] = DEFAULT_WEIGHTS[id];
          });
        }
        window.localStorage.setItem(WEIGHTS_V2_KEY, '1');
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      }

      if (!window.localStorage.getItem(EDITOR_LIGHT_KEY)) {
        if (settings.editorColor === '#1d1d1f') settings.editorColor = '#8fd3ff';
        window.localStorage.setItem(EDITOR_LIGHT_KEY, '1');
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      }

      return settings;
    } catch (error) {
      return settings;
    }
  }

  function refreshPartCatalog() {
    const labels = state.settings.partLabels || {};
    const weights = state.settings.weights || {};
    const builtins = BASE_PARTS.map(function (part) {
      const label = labels[part.id] || part.label;
      return {
        id: part.id,
        label: label,
        short: label === part.label ? part.short : label.slice(0, 2),
        en: part.en,
        weight: weights[part.id] || part.weight,
        custom: false
      };
    });
    const customs = (state.settings.customParts || []).map(function (part) {
      return {
        id: part.id,
        label: part.label,
        short: part.label.slice(0, 2),
        en: '',
        weight: part.weight,
        custom: true
      };
    });
    const all = builtins.concat(customs);
    const byId = new Map(all.map(function (part) { return [part.id, part]; }));
    const order = Array.isArray(state.settings.partOrder) ? state.settings.partOrder.slice() : [];
    const seen = new Set();
    const orderedIds = order.filter(function (id) {
      if (!byId.has(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    all.forEach(function (part) {
      if (!seen.has(part.id)) orderedIds.push(part.id);
    });
    state.settings.partOrder = orderedIds;
    partCatalog = orderedIds.map(function (id) { return byId.get(id); });
    partById = new Map(partCatalog.map(function (part) { return [part.id, part]; }));
    partOrder = new Map(partCatalog.map(function (part, index) { return [part.id, index]; }));
  }

  function getPart(id) {
    return partById.get(id) || null;
  }

  function loadExtras() {
    try {
      const raw = window.localStorage.getItem(EXTRAS_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
      const clean = {};
      Object.keys(data).forEach(function (key) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !data[key] || typeof data[key] !== 'object') return;
        const parsedDate = fromKey(key);
        if (Number.isNaN(parsedDate.getTime()) || dateKey(parsedDate) !== key) return;
        const note = typeof data[key].note === 'string' ? data[key].note.trim().slice(0, 300) : '';
        const photos = Array.isArray(data[key].photos)
          ? data[key].photos.slice(0, MAX_PHOTOS).filter(function (item) {
            return item && typeof item.id === 'string' && /^[a-z0-9_]+$/i.test(item.id);
          }).map(function (item) {
            return {
              id: item.id,
              type: typeof item.type === 'string' && item.type.indexOf('image/') === 0 ? item.type : 'image/jpeg'
            };
          })
          : [];
        const image = typeof data[key].image === 'string' && data[key].image.indexOf('data:image/') === 0
          ? data[key].image
          : '';
        if (note || photos.length || image) clean[key] = { note: note, photos: photos, image: image };
      });
      return clean;
    } catch (error) {
      return {};
    }
  }

  function persistSettings() {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
      return true;
    } catch (error) {
      return false;
    }
  }

  function persistExtras() {
    if (state.isDemo) return false;
    try {
      window.localStorage.setItem(EXTRAS_KEY, JSON.stringify(state.extras));
      return true;
    } catch (error) {
      return false;
    }
  }

  function persist() {
    if (state.isDemo) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.workouts));
      storageBlocked = false;
      return true;
    } catch (error) {
      storageBlocked = true;
      return false;
    }
  }

  function buildDemoWorkouts() {
    const today = new Date();
    const samples = [
      [-17, ['chest', 'shoulders']],
      [-15, ['back', 'biceps']],
      [-12, ['legs', 'triceps']],
      [-10, ['chest', 'biceps']],
      [-8, ['back', 'abs']],
      [-6, ['legs', 'cardio']],
      [-4, ['chest', 'shoulders']],
      [-2, ['back', 'biceps']],
      [-1, ['legs', 'abs']],
      [0, ['chest', 'shoulders']]
    ];
    const demo = {};
    samples.forEach(function (sample) {
      demo[dateKey(addDays(today, sample[0]))] = normalizeWorkout(sample[1]);
    });
    return demo;
  }

  function getParts(key) {
    return state.workouts[key] || [];
  }

  function getExtras(key) {
    return state.extras[key] || { note: '', photos: [], image: '' };
  }

  function hasEntry(key) {
    const extras = getExtras(key);
    return getParts(key).length > 0 || Boolean(extras.note) || extrasHasPhoto(extras);
  }

  function monthWorkoutCount(year, month) {
    const totalDays = new Date(year, month + 1, 0).getDate();
    let count = 0;
    for (let day = 1; day <= totalDays; day += 1) {
      if (getParts(dateKey(new Date(year, month, day))).length) count += 1;
    }
    return count;
  }

  function formatMonthDate(date) {
    return (date.getMonth() + 1) + '月' + date.getDate() + '日';
  }

  function formatSheetDate(date) {
    return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日 · ' + WEEKDAYS[date.getDay()];
  }

  function preferredDuration() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300;
  }

  function currentAccent() {
    return ACCENT_BY_ID.get(state.settings.accent) || ACCENTS[0];
  }

  function effectiveTheme() {
    if (state.settings.theme === 'auto') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return state.settings.theme === 'dark' ? 'dark' : 'light';
  }

  function contrastInk(hex) {
    const clean = hex.replace('#', '');
    const channels = [0, 2, 4].map(function (offset) {
      const value = parseInt(clean.slice(offset, offset + 2), 16) / 255;
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    const whiteContrast = 1.05 / (luminance + 0.05);
    const blackContrast = (luminance + 0.05) / 0.05;
    return whiteContrast >= blackContrast ? '#ffffff' : '#1d1d1f';
  }

  function applyAppearance() {
    const theme = effectiveTheme();
    const dark = theme === 'dark';
    const accent = currentAccent();
    const root = document.documentElement;
    const accentColor = dark ? accent.darkAccent : accent.accent;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-font-size', state.settings.fontSize || 'small');
    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--accent-deep', dark ? accent.darkDeep : accent.deep);
    root.style.setProperty('--accent-rgb', dark ? accent.darkRgb : accent.rgb);
    root.style.setProperty('--accent-soft', 'rgba(' + (dark ? accent.darkRgb : accent.rgb) + ', 0.12)');
    root.style.setProperty('--accent-ink', dark && accent.darkInk ? accent.darkInk : contrastInk(accentColor));
    root.style.setProperty('--note-dot', state.settings.noteColor);
    root.style.setProperty('--image-dot', state.settings.imageColor);
    const editorColor = state.settings.editorColor;
    const editorInk = contrastInk(editorColor);
    root.style.setProperty('--editor-bg', editorColor);
    root.style.setProperty('--editor-ink', editorInk);
    root.style.setProperty('--editor-muted', editorInk === '#1d1d1f' ? 'rgba(29, 29, 31, 0.64)' : 'rgba(255, 255, 255, 0.68)');

    const canvas = window.getComputedStyle(root).getPropertyValue('--bg').trim() || (dark ? '#000000' : '#f5f5f7');
    if (els.metaTheme) els.metaTheme.setAttribute('content', canvas);

    if (window.LianjiAndroid && typeof window.LianjiAndroid.setSystemBars === 'function') {
      try {
        window.LianjiAndroid.setSystemBars(accentColor, canvas, dark);
      } catch (error) {
        // The browser build has no native bridge.
      }
    }
  }

  function haptic(duration) {
    if (!state.settings.haptics || !navigator.vibrate) return;
    try {
      navigator.vibrate(duration || 8);
    } catch (error) {
      // Vibration can be unavailable in some WebViews.
    }
  }

  function renderAccentSwatches() {
    const fragment = document.createDocumentFragment();
    ACCENTS.forEach(function (accent) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'swatch';
      button.dataset.accent = accent.id;
      button.style.setProperty('--swatch', accent.swatch);
      button.setAttribute('aria-label', accent.name + '主题色');
      button.setAttribute('title', accent.name);
      fragment.appendChild(button);
    });
    replaceContent(els.accentSwatches, fragment);
  }

  function renderColorSwatches(container, settingKey, palette) {
    const fragment = document.createDocumentFragment();
    palette.forEach(function (color) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dot-swatch';
      button.dataset.color = color.value;
      button.dataset.colorSetting = settingKey;
      button.style.setProperty('--swatch', color.value);
      button.setAttribute('aria-label', color.name);
      button.setAttribute('title', color.name);
      fragment.appendChild(button);
    });
    replaceContent(container, fragment);
  }

  function renderDotColorSwatches() {
    renderColorSwatches(els.noteColorSwatches, 'noteColor', DOT_COLORS);
    renderColorSwatches(els.imageColorSwatches, 'imageColor', DOT_COLORS);
    renderColorSwatches(els.editorColorSwatches, 'editorColor', PANEL_COLORS);
  }

  function syncSettingsControls() {
    els.accentLabel.textContent = currentAccent().name;
    const noteColor = DOT_COLOR_MAP.get(state.settings.noteColor) || DOT_COLORS[0];
    const imageColor = DOT_COLOR_MAP.get(state.settings.imageColor) || DOT_COLORS[2];
    const editorColor = PANEL_COLOR_MAP.get(state.settings.editorColor) || PANEL_COLORS[0];
    els.noteColorLabel.textContent = noteColor.name;
    els.imageColorLabel.textContent = imageColor.name;
    els.editorColorLabel.textContent = editorColor.name;

    Array.from(els.accentSwatches.children).forEach(function (button) {
      button.setAttribute('aria-pressed', button.dataset.accent === state.settings.accent ? 'true' : 'false');
    });
    [els.themeSegment, els.weekSegment, els.markSegment, els.photoQualitySegment, els.fontSizeSegment].forEach(function (group) {
      group.querySelectorAll('button[data-setting]').forEach(function (button) {
        button.setAttribute('aria-pressed', state.settings[button.dataset.setting] === button.dataset.value ? 'true' : 'false');
      });
    });
    [els.noteColorSwatches, els.imageColorSwatches, els.editorColorSwatches].forEach(function (container) {
      Array.from(container.children).forEach(function (button) {
        const key = button.dataset.colorSetting;
        button.setAttribute('aria-pressed', state.settings[key] === button.dataset.color ? 'true' : 'false');
      });
    });
    els.hapticsSwitch.setAttribute('aria-checked', state.settings.haptics ? 'true' : 'false');
    els.photoQualityLabel.textContent = state.settings.photoQuality === 'original' ? '原图高清' : '压缩';
    els.fontSizeLabel.textContent = state.settings.fontSize === 'large' ? '大' : state.settings.fontSize === 'medium' ? '中' : '小';
  }

  function changeSetting(key, value) {
    if (key === 'haptics') {
      state.settings.haptics = value === true || value === 'true';
      persistSettings();
      syncSettingsControls();
      if (state.settings.haptics) haptic(11);
      return;
    }

    if (key === 'noteColor' || key === 'imageColor') {
      if (!DOT_COLOR_MAP.has(value)) return;
      state.settings[key] = value;
      persistSettings();
      applyAppearance();
      syncSettingsControls();
      haptic(6);
      return;
    }

    if (key === 'editorColor') {
      if (!PANEL_COLOR_MAP.has(value)) return;
      state.settings.editorColor = value;
      persistSettings();
      applyAppearance();
      syncSettingsControls();
      haptic(6);
      return;
    }

    if (key === 'fontSize') {
      if (value !== 'small' && value !== 'medium' && value !== 'large') return;
      state.settings.fontSize = value;
      persistSettings();
      applyAppearance();
      syncSettingsControls();
      haptic(6);
      return;
    }

    if (key === 'photoQuality') {
      if (value !== 'compressed' && value !== 'original') return;
      state.settings.photoQuality = value;
      persistSettings();
      syncSettingsControls();
      haptic(6);
      return;
    }

    if (key !== 'theme' && key !== 'accent' && key !== 'weekStart' && key !== 'recordMark') return;
    state.settings[key] = value;
    persistSettings();

    if (key === 'theme' || key === 'accent') applyAppearance();
    if (key === 'weekStart') renderAll();
    if (key === 'recordMark' && !els.yearView.hidden) renderYearView();
    syncSettingsControls();
    haptic(6);
  }

  function renderWeightEditor() {
    const fragment = document.createDocumentFragment();
    partCatalog.forEach(function (part) {
      const row = document.createElement('div');
      row.className = 'weight-row';
      row.dataset.part = part.id;

      const label = document.createElement('span');
      label.className = 'weight-row-label';
      label.textContent = part.label;
      row.appendChild(label);

      const controls = document.createElement('span');
      controls.className = 'weight-stepper';

      const minus = document.createElement('button');
      minus.type = 'button';
      minus.dataset.weightDelta = '-0.5';
      minus.dataset.part = part.id;
      minus.textContent = '−';
      minus.setAttribute('aria-label', '降低' + part.label + '权重');
      controls.appendChild(minus);

      const value = document.createElement('b');
      value.textContent = String(part.weight);
      value.setAttribute('aria-label', part.label + '权重 ' + part.weight);
      controls.appendChild(value);

      const plus = document.createElement('button');
      plus.type = 'button';
      plus.dataset.weightDelta = '0.5';
      plus.dataset.part = part.id;
      plus.textContent = '+';
      plus.setAttribute('aria-label', '提高' + part.label + '权重');
      controls.appendChild(plus);

      row.appendChild(controls);
      fragment.appendChild(row);
    });
    replaceContent(els.weightEditorList, fragment);
  }

  function setPartWeight(id, delta) {
    const part = getPart(id);
    if (!part) return;
    const next = Math.round(Math.min(9, Math.max(1, part.weight + delta)) * 2) / 2;
    if (next === part.weight) return;
    if (part.custom) {
      const custom = state.settings.customParts.find(function (item) { return item.id === id; });
      if (custom) custom.weight = next;
    } else {
      state.settings.weights[id] = next;
    }
    persistSettings();
    refreshPartCatalog();
    renderWeightEditor();
    renderPartChips();
    if (!els.curveView.hidden) renderCurve();
    haptic(5);
  }

  function resetWeights() {
    state.settings.weights = Object.assign({}, DEFAULT_WEIGHTS);
    state.settings.customParts.forEach(function (part) { part.weight = 2; });
    persistSettings();
    refreshPartCatalog();
    renderWeightEditor();
    renderPartChips();
    if (!els.curveView.hidden) renderCurve();
    haptic(8);
  }

  function resetSettings() {
    const preservedLabels = Object.assign({}, state.settings.partLabels);
    const preservedCustoms = state.settings.customParts.map(function (part) {
      return { id: part.id, label: part.label, weight: 2 };
    });
    const preservedOrder = state.settings.partOrder.slice();
    state.settings = Object.assign({}, DEFAULT_SETTINGS, {
      partLabels: preservedLabels,
      customParts: preservedCustoms,
      partOrder: preservedOrder,
      weights: Object.assign({}, DEFAULT_WEIGHTS)
    });
    refreshPartCatalog();
    persistSettings();
    applyAppearance();
    syncSettingsControls();
    renderPartChips();
    renderWeightEditor();
    renderAll();
    if (!els.yearView.hidden) {
      renderYearFilter();
      renderYearView();
    }
    haptic(10);
    showToast('已恢复默认设置');
  }

  function renderAll() {
    const now = new Date();
    state.lastTodayKey = dateKey(now);
    renderMonth(now);
    renderCalendar(now);
    renderDayPanel();
    if (!els.yearView.hidden) renderYearView();
    if (!els.curveView.hidden) renderCurve();
    if (!els.profileView.hidden) renderProfile();
  }

  function renderMonth(now) {
    const year = state.viewDate.getFullYear();
    const month = state.viewDate.getMonth();
    els.monthNum.textContent = String(month + 1);
    els.yearBtn.textContent = String(year);
    els.yearBtn.setAttribute('aria-label', '查看 ' + year + ' 年总览');
    const monthTotal = monthWorkoutCount(year, month);
    els.monthCount.textContent = String(monthTotal);
    els.monthSummaryBtn.setAttribute('aria-label', '本月训练 ' + monthTotal + ' 天，查看训练统计');
  }

  function weekdayOrder() {
    return state.settings.weekStart === 'sunday'
      ? [0, 1, 2, 3, 4, 5, 6]
      : [1, 2, 3, 4, 5, 6, 0];
  }

  function renderWeekdays() {
    const order = weekdayOrder();
    const labels = ['日', '一', '二', '三', '四', '五', '六'];
    const fragment = document.createDocumentFragment();
    order.forEach(function (day) {
      const item = document.createElement('span');
      item.className = 'weekday' + (day === 0 ? ' is-sun' : '');
      item.textContent = labels[day];
      fragment.appendChild(item);
    });
    replaceContent(els.weekdays, fragment);
  }

  function renderCalendar(now) {
    const year = state.viewDate.getFullYear();
    const month = state.viewDate.getMonth();
    const todayK = dateKey(now);
    const first = new Date(year, month, 1);
    const weekStartIndex = state.settings.weekStart === 'sunday' ? 0 : 1;
    const offset = (first.getDay() - weekStartIndex + 7) % 7;
    const gridStart = addDays(first, -offset);
    const fragment = document.createDocumentFragment();
    const monthCells = [];
    renderWeekdays();

    for (let index = 0; index < 42; index += 1) {
      const date = addDays(gridStart, index);
      const inMonth = date.getMonth() === month;
      if (!inMonth) {
        const key = dateKey(date);
        const parts = getParts(key);
        const extras = getExtras(key);
        const hasNote = Boolean(extras.note);
        const hasImage = extrasHasPhoto(extras);
        const outside = document.createElement('span');
        outside.className = 'day-cell is-outside' + (parts.length ? ' has-log' : '');
        outside.dataset.date = key;
        outside.setAttribute('aria-hidden', 'true');
        const outsideNumber = document.createElement('span');
        outsideNumber.className = 'day-number';
        outsideNumber.textContent = String(date.getDate());
        outside.appendChild(outsideNumber);

        if (hasNote || hasImage) {
          const badges = document.createElement('span');
          badges.className = 'day-badges';
          if (hasNote) {
            const noteDot = document.createElement('i');
            noteDot.className = 'day-badge is-note';
            badges.appendChild(noteDot);
          }
          if (hasImage) {
            const imageDot = document.createElement('i');
            imageDot.className = 'day-badge is-image';
            badges.appendChild(imageDot);
          }
          outside.appendChild(badges);
        }

        if (parts.length) {
          const tags = document.createElement('span');
          tags.className = 'day-tags';
          const visibleParts = parts.length <= 4 ? parts : parts.slice(0, 3);
          visibleParts.forEach(function (id) {
            const part = getPart(id);
            const tag = document.createElement('span');
            tag.className = 'day-tag';
            tag.textContent = part ? part.short : '';
            tags.appendChild(tag);
          });
          if (parts.length > 4) {
            const more = document.createElement('span');
            more.className = 'day-tag is-more';
            more.textContent = '+' + (parts.length - 3);
            tags.appendChild(more);
          }
          outside.appendChild(tags);
        }
        fragment.appendChild(outside);
        continue;
      }

      const key = dateKey(date);
      const parts = getParts(key);
      const extras = getExtras(key);
      const hasNote = Boolean(extras.note);
      const hasImage = extrasHasPhoto(extras);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'day-cell';
      cell.dataset.date = key;
      cell.tabIndex = -1;

      if (key === todayK) {
        cell.classList.add('is-today');
        cell.setAttribute('aria-current', 'date');
      }
      if (key === state.detailDateKey) cell.classList.add('is-selected');
      if (parts.length) cell.classList.add('has-log');

      const partLabels = parts.map(function (id) {
        const part = getPart(id);
        return part ? part.label : '';
      }).filter(Boolean);
      const markers = [];
      if (hasNote) markers.push('有便签');
      if (hasImage) markers.push('有照片');
      const labelPrefix = key === todayK ? '今天，' : '';
      cell.setAttribute(
        'aria-label',
        labelPrefix + formatMonthDate(date) + ' ' + WEEKDAYS[date.getDay()] +
          (parts.length ? '，训练部位：' + partLabels.join('、') : '，无训练记录') +
          (markers.length ? '，' + markers.join('，') : '')
      );

      const number = document.createElement('span');
      number.className = 'day-number';
      number.textContent = String(date.getDate());
      cell.appendChild(number);

      if (hasNote || hasImage) {
        const badges = document.createElement('span');
        badges.className = 'day-badges';
        badges.setAttribute('aria-hidden', 'true');
        if (hasNote) {
          const noteDot = document.createElement('i');
          noteDot.className = 'day-badge is-note';
          badges.appendChild(noteDot);
        }
        if (hasImage) {
          const imageDot = document.createElement('i');
          imageDot.className = 'day-badge is-image';
          badges.appendChild(imageDot);
        }
        cell.appendChild(badges);
      }

      if (parts.length) {
        const tags = document.createElement('span');
        tags.className = 'day-tags';
        tags.setAttribute('aria-hidden', 'true');
        const visibleParts = parts.length <= 4 ? parts : parts.slice(0, 3);
        visibleParts.forEach(function (id) {
          const part = getPart(id);
          const tag = document.createElement('span');
          tag.className = 'day-tag';
          tag.textContent = part ? part.short : '';
          tags.appendChild(tag);
        });
        if (parts.length > 4) {
          const more = document.createElement('span');
          more.className = 'day-tag is-more';
          more.textContent = '+' + (parts.length - 3);
          tags.appendChild(more);
        }
        cell.appendChild(tags);
      }

      monthCells.push(cell);
      fragment.appendChild(cell);
    }

    replaceContent(els.calendarGrid, fragment);

    let rovingCell = monthCells.find(function (cell) { return cell.dataset.date === todayK; });
    if (!rovingCell) rovingCell = monthCells[0];
    if (rovingCell) rovingCell.tabIndex = 0;
  }

  function renderDayPanel() {
    const key = state.detailDateKey;
    const date = fromKey(key);
    const todayK = dateKey(new Date());
    const isToday = key === todayK;
    const parts = getParts(key);
    const extras = getExtras(key);
    const labels = parts.map(function (id) {
      const part = getPart(id);
      return part ? part.label : '';
    }).filter(Boolean);
    const hasExtras = Boolean(extras.note) || extrasHasPhoto(extras);

    els.todayEyebrow.textContent = (isToday ? '今天 · ' : '') + formatMonthDate(date) + ' ' + WEEKDAYS[date.getDay()];
    els.todayTitle.textContent = labels.length
      ? labels.join(' · ')
      : (isToday ? '今天还没有训练' : '这一天还没有训练');
    els.todayTitle.classList.toggle('is-empty', labels.length === 0);
    els.todayMeta.hidden = false;
    els.todayMeta.classList.remove('is-poem');
    if (labels.length) {
      els.todayMeta.textContent = (isToday ? '今天' : '这一天') + '已记录 ' + labels.length + ' 个部位';
    } else if (hasExtras) {
      els.todayMeta.textContent = (isToday ? '今天' : '这一天') + '有记录，点右侧查看';
    } else if (isToday) {
      const poem = pickTodayPoem();
      els.todayMeta.textContent = poem;
      els.todayMeta.hidden = !poem;
      els.todayMeta.classList.toggle('is-poem', Boolean(poem));
    } else {
      els.todayMeta.textContent = '这一天还没有记录';
    }
    els.todayActionText.textContent = labels.length || hasExtras ? '编辑' : '记录';
    els.todayActionIcon.hidden = labels.length > 0 || hasExtras;
    els.logTodayBtn.setAttribute('aria-label',
      (labels.length || hasExtras ? '编辑 ' : '记录 ') + formatMonthDate(date) + ' 的训练');

    const note = extras.note.trim();
    const metas = photoMetas(extras);
    const hasPhotos = metas.length > 0 || Boolean(extras.image);
    els.dayDetail.hidden = !note && !hasPhotos;
    els.dayDetailNote.hidden = !note;
    els.dayDetailNote.textContent = note;
    state.dayPhotoToken += 1;
    renderDayPhotos(key, metas, extras.image, state.dayPhotoToken);
  }

  async function renderDayPhotos(key, metas, legacyImage, token) {
    els.dayPhotos.hidden = true;
    replaceContent(els.dayPhotos, document.createDocumentFragment());
    const items = [];
    if (legacyImage) {
      items.push({ url: legacyImage, caption: formatMonthDate(fromKey(key)) });
    }
    for (const meta of metas) {
      try {
        const record = await mediaGet(meta.id);
        if (record && record.blob) {
          items.push({ url: photoUrl(meta.id, record.blob), caption: formatMonthDate(fromKey(key)) });
        }
      } catch (error) {
        // Ignore a missing photo.
      }
    }
    if (token !== state.dayPhotoToken || state.detailDateKey !== key) return;

    const fragment = document.createDocumentFragment();
    items.forEach(function (item, index) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'day-photo-btn';
      button.setAttribute('aria-label', '查看照片 ' + (index + 1));
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = '';
      button.appendChild(img);
      button.addEventListener('click', function () { openPhotoViewer(items, index); });
      fragment.appendChild(button);
    });
    replaceContent(els.dayPhotos, fragment);
    els.dayPhotos.className = 'day-photos' + (items.length === 1 ? ' is-single' : '');
    els.dayPhotos.hidden = items.length === 0;
    if (!els.dayDetailNote.textContent && items.length === 0) els.dayDetail.hidden = true;
  }

  function ensureDetailDateInView() {
    const detail = fromKey(state.detailDateKey);
    if (detail.getFullYear() === state.viewDate.getFullYear() && detail.getMonth() === state.viewDate.getMonth()) return;
    const today = new Date();
    state.detailDateKey = today.getFullYear() === state.viewDate.getFullYear() && today.getMonth() === state.viewDate.getMonth()
      ? dateKey(today)
      : dateKey(new Date(state.viewDate.getFullYear(), state.viewDate.getMonth(), 1));
  }

  function selectCalendarDate(key) {
    state.detailDateKey = key;
    els.calendarGrid.querySelectorAll('.day-cell[data-date]').forEach(function (cell) {
      cell.classList.toggle('is-selected', cell.dataset.date === key);
    });
    renderDayPanel();
  }

  function renderYearFilter() {
    const fragment = document.createDocumentFragment();
    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'filter-chip';
    all.dataset.part = 'all';
    all.textContent = '全部';
    all.setAttribute('aria-pressed', state.yearFilter.size === 0 ? 'true' : 'false');
    fragment.appendChild(all);

    partCatalog.forEach(function (part) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'filter-chip';
      chip.dataset.part = part.id;
      chip.textContent = part.label;
      chip.setAttribute('aria-pressed', state.yearFilter.has(part.id) ? 'true' : 'false');
      fragment.appendChild(chip);
    });
    replaceContent(els.yearFilter, fragment);

    const count = state.yearFilter.size;
    els.yearFilterCount.textContent = String(count);
    els.yearFilterCount.hidden = count === 0;
    els.yearFilterBtn.classList.toggle('is-active', count > 0);
  }

  function openYearFilter() {
    if (!els.yearFilterPopover.hidden) return;
    els.yearFilterPopover.hidden = false;
    els.yearFilterBtn.setAttribute('aria-expanded', 'true');
    renderYearFilter();
  }

  function closeYearFilter() {
    if (els.yearFilterPopover.hidden) return;
    els.yearFilterPopover.hidden = true;
    els.yearFilterBtn.setAttribute('aria-expanded', 'false');
  }

  function renderYearView() {
    const year = state.yearViewYear;
    const todayK = dateKey(new Date());
    const order = weekdayOrder();
    const labels = ['日', '一', '二', '三', '四', '五', '六'];
    const startIndex = order[0];
    const recordMark = state.settings.recordMark === 'dot' ? 'dot' : 'bar';
    const filterActive = state.yearFilter.size > 0;
    els.yearTitle.textContent = String(year);
    const fragment = document.createDocumentFragment();

    for (let month = 0; month < 12; month += 1) {
      const monthButton = document.createElement('button');
      monthButton.type = 'button';
      monthButton.className = 'year-month';
      monthButton.dataset.month = String(month);
      const isCurrent = month === state.viewDate.getMonth() && year === state.viewDate.getFullYear();
      if (isCurrent) monthButton.classList.add('is-current');
      const trainingDays = monthWorkoutCount(year, month);
      monthButton.setAttribute('aria-label', year + '年' + (month + 1) + '月，训练 ' + trainingDays + ' 天，点击查看');

      const title = document.createElement('span');
      title.className = 'year-month-title';
      title.textContent = (month + 1) + '月';
      monthButton.appendChild(title);

      const weekdays = document.createElement('span');
      weekdays.className = 'year-weekdays';
      weekdays.setAttribute('aria-hidden', 'true');
      order.forEach(function (day) {
        const item = document.createElement('span');
        item.textContent = labels[day];
        weekdays.appendChild(item);
      });
      monthButton.appendChild(weekdays);

      const days = document.createElement('span');
      days.className = 'year-days';
      days.setAttribute('aria-hidden', 'true');
      const first = new Date(year, month, 1);
      const offset = (first.getDay() - startIndex + 7) % 7;
      const totalDays = new Date(year, month + 1, 0).getDate();
      const totalCells = Math.ceil((offset + totalDays) / 7) * 7;

      for (let index = 0; index < totalCells; index += 1) {
        const dayNumber = index - offset + 1;
        if (dayNumber < 1 || dayNumber > totalDays) {
          const blank = document.createElement('span');
          blank.className = 'year-day is-blank';
          days.appendChild(blank);
          continue;
        }

        const date = new Date(year, month, dayNumber);
        const key = dateKey(date);
        const parts = getParts(key);
        const matches = parts.some(function (id) { return state.yearFilter.has(id); });
        const cell = document.createElement('span');
        cell.className = 'year-day';
        if (key === todayK) cell.classList.add('is-today');
        if (parts.length) cell.classList.add('has-training');
        if (filterActive && !matches) cell.classList.add('is-filtered');

        const number = document.createElement('span');
        number.className = 'year-day-number';
        number.textContent = String(dayNumber);
        cell.appendChild(number);

        if (parts.length) {
          const marks = document.createElement('span');
          marks.className = 'year-marks';
          parts.forEach(function () {
            const mark = document.createElement('i');
            mark.className = 'year-mark is-' + recordMark;
            marks.appendChild(mark);
          });
          cell.appendChild(marks);
        }
        days.appendChild(cell);
      }

      monthButton.appendChild(days);
      fragment.appendChild(monthButton);
    }

    replaceContent(els.yearGrid, fragment);
  }

  function openYearView() {
    if (!els.yearView.hidden) return;
    state.yearViewYear = state.viewDate.getFullYear();
    state.yearFilter = new Set();
    els.yearFilterPopover.hidden = true;
    els.yearFilterBtn.setAttribute('aria-expanded', 'false');
    els.monthView.hidden = true;
    els.curveView.hidden = true;
    els.yearView.hidden = false;
    els.viewSwitch.hidden = true;
    renderYearFilter();
    renderYearView();
    window.scrollTo(0, 0);
    els.closeYearBtn.focus({ preventScroll: true });
  }

  function closeYearView() {
    if (els.yearView.hidden) return;
    closeYearFilter();
    els.yearView.hidden = true;
    els.monthView.hidden = false;
    els.viewSwitch.hidden = false;
    window.scrollTo(0, 0);
    els.monthTitleBtn.focus({ preventScroll: true });
  }

  function selectYearMonth(month) {
    state.viewDate = new Date(state.yearViewYear, month, 1);
    ensureDetailDateInView();
    closeYearView();
    renderAll();
    window.scrollTo(0, 0);
  }

  function shiftYear(delta) {
    state.yearViewYear += delta;
    renderYearView();
    window.scrollTo(0, 0);
  }

  function buildDailySeries(startDate, count) {
    const historyStart = addDays(startDate, -4);
    const series = [];
    const active = new Map();
    const factors = [0, 0.78, 0.54, 0.26];

    for (let index = 0; index < count + 4; index += 1) {
      const date = addDays(historyStart, index);
      const key = dateKey(date);
      const todayParts = getParts(key);
      const todaySet = new Set(todayParts);

      active.forEach(function (state, id) {
        if (todaySet.has(id)) return;
        state.rest += 1;
        if (state.rest >= 4) {
          active.delete(id);
        } else {
          state.value = state.weight * factors[state.rest];
        }
      });

      let session = 0;
      todayParts.forEach(function (id) {
        const part = getPart(id);
        if (!part) return;
        session += part.weight;
        active.set(id, { weight: part.weight, rest: 0, value: part.weight });
      });

      let residual = 0;
      active.forEach(function (state) { residual += state.value; });

      if (index >= 4) {
        series.push({
          date: date,
          key: key,
          session: session,
          residual: residual,
          parts: todayParts.slice()
        });
      }
    }
    return series;
  }

  function formatScore(value) {
    if (!value) return '0';
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  function smoothPath(points) {
    if (!points.length) return '';
    if (points.length < 3) {
      return points.map(function (point, index) {
        return (index ? 'L' : 'M') + point.x.toFixed(1) + ',' + point.y.toFixed(1);
      }).join(' ');
    }

    const slopes = [];
    for (let index = 0; index < points.length - 1; index += 1) {
      const dx = points[index + 1].x - points[index].x || 1;
      slopes.push((points[index + 1].y - points[index].y) / dx);
    }

    const tangents = points.map(function (_, index) {
      if (index === 0) return slopes[0] || 0;
      if (index === points.length - 1) return slopes[slopes.length - 1] || 0;
      const before = slopes[index - 1] || 0;
      const after = slopes[index] || 0;
      if (before * after <= 0) return 0;
      const average = (before + after) / 2;
      const limit = 3 * Math.min(Math.abs(before), Math.abs(after));
      return Math.sign(average) * Math.min(Math.abs(average), limit);
    });

    let path = 'M' + points[0].x.toFixed(1) + ',' + points[0].y.toFixed(1);
    for (let index = 0; index < points.length - 1; index += 1) {
      const p0 = points[index];
      const p1 = points[index + 1];
      const dx = (p1.x - p0.x) / 3;
      path += ' C' + (p0.x + dx).toFixed(1) + ',' + (p0.y + tangents[index] * dx).toFixed(1) +
        ' ' + (p1.x - dx).toFixed(1) + ',' + (p1.y - tangents[index + 1] * dx).toFixed(1) +
        ' ' + p1.x.toFixed(1) + ',' + p1.y.toFixed(1);
    }
    return path;
  }

  function monthGroupsForSeries(series) {
    const groups = [];
    series.forEach(function (item) {
      const date = item.date;
      const key = date.getFullYear() + '-' + date.getMonth();
      const last = groups[groups.length - 1];
      if (last && last.key === key) {
        last.count += 1;
      } else {
        groups.push({ key: key, label: (date.getMonth() + 1) + '月', month: date.getMonth(), count: 1 });
      }
    });
    return groups;
  }

  function monthCurveData(year, month) {
    const start = new Date(year, month, 1);
    const days = new Date(year, month + 1, 0).getDate();
    const series = buildDailySeries(start, days);
    const bars = series.map(function (item) { return item.session; });
    const line = series.map(function (item) { return item.residual; });
    const maxValue = Math.max.apply(null, bars.concat(line).concat([0]));
    const labels = Array.from({ length: days }, function (_, index) {
      return { index: index, text: String(index + 1) };
    });
    return {
      chartType: 'month',
      bars: bars,
      line: line,
      series: series,
      labels: labels,
      monthGroups: monthGroupsForSeries(series),
      trainingDays: series.filter(function (item) { return item.parts.length > 0; }).length,
      title: (month + 1) + '月',
      kicker: year + ' · 训练数据',
      range: (month + 1) + '月1日 - ' + (month + 1) + '月' + days + '日',
      axisMax: Math.max(5, Math.ceil(maxValue * 1.12))
    };
  }

  function curveData() {
    if (state.curvePeriod === 'year') {
      const year = state.curveYear;
      const start = new Date(year, 0, 1);
      const days = Math.floor((new Date(year + 1, 0, 1) - start) / 86400000);
      const series = buildDailySeries(start, days);
      const monthly = new Array(12).fill(0);
      series.forEach(function (item) { monthly[item.date.getMonth()] += item.session; });
      return {
        chartType: 'year',
        bars: monthly,
        line: [],
        series: series,
        labels: monthly.map(function (_, index) { return { index: index, text: String(index + 1) }; }),
        monthGroups: [],
        trainingDays: series.filter(function (item) { return item.parts.length > 0; }).length,
        title: String(year),
        kicker: '训练数据',
        range: year + '年 · 每月训练量',
        axisMax: Math.max(5, Math.ceil(Math.max.apply(null, monthly.concat([0])) * 1.12))
      };
    }

    if (state.curvePeriod === '30') {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
      const series = buildDailySeries(start, 30);
      const bars = series.map(function (item) { return item.session; });
      const line = series.map(function (item) { return item.residual; });
      const maxValue = Math.max.apply(null, bars.concat(line).concat([0]));
      const labels = Array.from({ length: 30 }, function (_, index) {
        return { index: index, text: String(series[index].date.getDate()) };
      });
      const end = series[series.length - 1].date;
      const kicker = start.getFullYear() === end.getFullYear()
        ? start.getFullYear() + ' · 训练数据'
        : start.getFullYear() + '-' + end.getFullYear() + ' · 训练数据';
      return {
        chartType: 'days',
        bars: bars,
        line: line,
        series: series,
        labels: labels,
        monthGroups: monthGroupsForSeries(series),
        trainingDays: series.filter(function (item) { return item.parts.length > 0; }).length,
        title: '近30天',
        kicker: kicker,
        range: (start.getMonth() + 1) + '月' + start.getDate() + '日 - ' +
          (end.getMonth() + 1) + '月' + end.getDate() + '日',
        axisMax: Math.max(5, Math.ceil(maxValue * 1.12))
      };
    }

    return monthCurveData(state.curveDate.getFullYear(), state.curveDate.getMonth());
  }

  function monthDayLabel(index) {
    const date = state.curveDate;
    return (date.getMonth() + 1) + '月' + (index + 1) + '日';
  }

  function renderCurveChart(data) {
    const width = 340;
    const height = 210;
    const left = 30;
    const right = 8;
    const top = 12;
    const bottom = 28;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;
    const count = data.bars.length;
    const isDaily = data.chartType !== 'year';
    const barSlot = chartWidth / count;
    const barWidth = Math.max(3, Math.min(10, barSlot * 0.52));
    const x = function (index) { return left + (index + 0.5) * barSlot; };
    const y = function (value) { return top + chartHeight - (value / data.axisMax) * chartHeight; };

    let grid = '';
    [0, 0.5, 1].forEach(function (ratio) {
      const lineY = top + chartHeight - chartHeight * ratio;
      grid += '<line class="curve-grid-line" x1="' + left + '" y1="' + lineY + '" x2="' + (width - right) + '" y2="' + lineY + '"/>';
      grid += '<text class="curve-axis-text" x="0" y="' + (lineY + 2.5) + '">' +
        formatScore(data.axisMax * ratio) + '</text>';
    });

    let bars = '';
    data.bars.forEach(function (value, index) {
      const barHeight = value > 0 ? Math.max(1.5, (value / data.axisMax) * chartHeight) : 0;
      bars += '<rect class="curve-bar" data-curve-index="' + index + '" x="' + (x(index) - barWidth / 2).toFixed(1) +
        '" y="' + (top + chartHeight - barHeight).toFixed(1) + '" width="' + barWidth.toFixed(1) +
        '" height="' + barHeight.toFixed(1) + '" rx="' + (barWidth / 2).toFixed(1) + '"/>';
    });

    let residualLine = '';
    let residualArea = '';
    if (isDaily && data.line.some(function (value) { return value > 0; })) {
      const points = data.line.map(function (value, index) {
        return { x: x(index), y: y(value) };
      });
      const linePath = smoothPath(points);
      residualLine = '<path class="curve-line" d="' + linePath + '"/>';
      residualArea = '<path class="curve-area" d="' + linePath + ' L' +
        x(count - 1).toFixed(1) + ',' + (top + chartHeight) + ' L' +
        x(0).toFixed(1) + ',' + (top + chartHeight) + ' Z"/>';
    }

    let xLabels = '';
    data.labels.forEach(function (label, index) {
      const labelY = isDaily && index % 2 === 1 ? height - 10.5 : height - 8;
      const className = isDaily ? 'curve-axis-text is-day-label' : 'curve-axis-text';
      const color = data.chartType === 'days' && data.series[index] ? monthColor(data.series[index].date.getMonth()) : '';
      xLabels += '<text class="' + className + '" text-anchor="middle" x="' + x(label.index).toFixed(1) +
        '" y="' + labelY + '"' + (color ? ' style="fill:' + color + '"' : '') + '>' + label.text + '</text>';
    });

    const today = new Date();
    let nowIndex = -1;
    if (data.chartType === 'days') {
      nowIndex = count - 1;
    } else if (data.chartType === 'month' && today.getFullYear() === state.curveDate.getFullYear() &&
      today.getMonth() === state.curveDate.getMonth()) {
      nowIndex = today.getDate() - 1;
    } else if (data.chartType === 'year' && today.getFullYear() === state.curveYear) {
      nowIndex = today.getMonth();
    }
    let nowMark = '';
    if (nowIndex >= 0 && nowIndex < count) {
      nowMark += '<line class="curve-now-line" x1="' + x(nowIndex).toFixed(1) + '" y1="' + top +
        '" x2="' + x(nowIndex).toFixed(1) + '" y2="' + (top + chartHeight) + '"/>';
      if (isDaily && data.line[nowIndex] !== undefined) {
        nowMark += '<circle class="curve-now-dot" cx="' + x(nowIndex).toFixed(1) + '" cy="' +
          y(data.line[nowIndex]).toFixed(1) + '" r="4"/>';
      }
    }

    let hits = '';
    data.bars.forEach(function (_, index) {
      hits += '<rect class="curve-hit" data-curve-index="' + index + '" x="' + (left + index * barSlot).toFixed(1) +
        '" y="' + top + '" width="' + barSlot.toFixed(1) + '" height="' + chartHeight + '"/>';
    });

    els.curveChart.innerHTML =
      '<defs><linearGradient id="curveArea" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" style="stop-color:var(--accent);stop-opacity:0.16"/>' +
      '<stop offset="100%" style="stop-color:var(--accent);stop-opacity:0"/>' +
      '</linearGradient></defs>' +
      grid + nowMark + bars + residualArea + residualLine + xLabels + hits;
    els.curveChart.dataset.values = data.line.length
      ? data.line.map(function (value) { return value.toFixed(2); }).join(',')
      : data.bars.map(function (value) { return value.toFixed(2); }).join(',');
    els.curveChart.dataset.bars = data.bars.map(function (value) { return value.toFixed(2); }).join(',');
    els.curveChart.setAttribute('aria-label', data.range + '，训练 ' + data.trainingDays + ' 天');

    const groups = data.monthGroups || [];
    els.curveMonthGroups.hidden = !groups.length;
    els.curveMonthGroups.innerHTML = groups.map(function (group) {
      const color = data.chartType === 'days' ? ' style="color:' + monthColor(group.month) + '"' : '';
      return '<span class="curve-month-group" style="flex-grow:' + group.count + '">' +
        '<span class="curve-month-label"' + color + '>' + group.label + '</span></span>';
    }).join('');

    els.curveChart.querySelectorAll('[data-curve-index]').forEach(function (node) {
      node.addEventListener('click', function () {
        if (state.curveSuppressClick) return;
        const index = Number(node.dataset.curveIndex);
        if (!isDaily) {
          if (data.bars[index] > 0) {
            state.curveDate = new Date(state.curveYear, index, 1);
            state.curvePeriod = 'month';
            renderCurve();
          }
          return;
        }
        const item = data.series[index];
        if (!item) return;
        els.curveChart.querySelectorAll('.curve-bar.is-selected').forEach(function (bar) { bar.classList.remove('is-selected'); });
        const bar = els.curveChart.querySelector('.curve-bar[data-curve-index="' + index + '"]');
        if (bar) bar.classList.add('is-selected');
        const labels = item.parts.map(function (id) {
          const part = getPart(id);
          return part ? part.label : '';
        }).filter(Boolean);
        const itemDate = item.date;
        els.curveTip.textContent = (itemDate.getMonth() + 1) + '月' + itemDate.getDate() + '日 · ' +
          (labels.length ? labels.join('、') : '没有训练') +
          ' · 训练 ' + formatScore(item.session) + ' / 残留 ' + formatScore(item.residual);
        els.curveTip.classList.add('is-visible');
      });
    });
  }

  function piePickerYear() {
    return state.piePickerYear;
  }

  function renderPieMonthPicker() {
    const year = piePickerYear();
    els.pieMonthYear.textContent = year + '年';
    const fragment = document.createDocumentFragment();
    for (let month = 0; month < 12; month += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pie-month-chip';
      button.dataset.month = String(month);
      button.textContent = (month + 1) + '月';
      const active = year === state.pieYear && month === state.pieMonth;
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      fragment.appendChild(button);
    }
    replaceContent(els.pieMonthGrid, fragment);
  }

  function openPieMonthPicker() {
    if (state.pieRange !== 'month') return;
    if (!els.pieMonthPopover.hidden) return;
    state.piePickerYear = state.pieYear;
    renderPieMonthPicker();
    els.pieMonthPopover.hidden = false;
    els.pieMonthBtn.setAttribute('aria-expanded', 'true');
  }

  function closePieMonthPicker() {
    if (els.pieMonthPopover.hidden) return;
    els.pieMonthPopover.hidden = true;
    els.pieMonthBtn.setAttribute('aria-expanded', 'false');
  }

  function piePoint(cx, cy, radius, angle) {
    const radians = angle * Math.PI / 180;
    return { x: cx + Math.cos(radians) * radius, y: cy + Math.sin(radians) * radius };
  }

  function pieDonutPath(cx, cy, outer, inner, start, end) {
    const p0 = piePoint(cx, cy, outer, start);
    const p1 = piePoint(cx, cy, outer, end);
    const p2 = piePoint(cx, cy, inner, end);
    const p3 = piePoint(cx, cy, inner, start);
    const large = end - start > 180 ? 1 : 0;
    return 'M' + p0.x.toFixed(2) + ',' + p0.y.toFixed(2) +
      ' A' + outer + ',' + outer + ' 0 ' + large + ' 1 ' + p1.x.toFixed(2) + ',' + p1.y.toFixed(2) +
      ' L' + p2.x.toFixed(2) + ',' + p2.y.toFixed(2) +
      ' A' + inner + ',' + inner + ' 0 ' + large + ' 0 ' + p3.x.toFixed(2) + ',' + p3.y.toFixed(2) + ' Z';
  }

  function escapeXml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function pieLabel(value) {
    const characters = Array.from(String(value));
    return characters.length > 4 ? characters.slice(0, 4).join('') + '…' : characters.join('');
  }

  function piePercentText(percent) {
    return (percent < 10 ? percent.toFixed(1) : String(Math.round(percent))) + '%';
  }

  function renderPartPie() {
    const year = state.pieYear;
    const month = state.pieMonth;
    const range = state.pieRange;
    const isMonth = range === 'month';
    const today = new Date();
    let start;
    let end;
    let periodText;
    if (isMonth) {
      start = year + '-' + String(month + 1).padStart(2, '0') + '-01';
      end = dateKey(new Date(year, month + 1, 0));
      periodText = (month + 1) + '月';
    } else {
      const days = Number(range);
      const first = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1));
      start = dateKey(first);
      end = dateKey(today);
      periodText = range === '30' ? '近30天' : range === '90' ? '近90天' : '近1年';
    }
    const counts = new Map();
    const trainingDays = new Set();

    Object.keys(state.workouts).forEach(function (key) {
      if (key < start || key > end) return;
      const parts = state.workouts[key] || [];
      if (!parts.length) return;
      trainingDays.add(key);
      parts.forEach(function (id) {
        if (getPart(id)) counts.set(id, (counts.get(id) || 0) + 1);
      });
    });

    const allRows = partCatalog.map(function (part, index) {
      return {
        id: part.id,
        label: part.label,
        count: counts.get(part.id) || 0,
        color: PIE_COLORS[index % PIE_COLORS.length],
        order: index
      };
    }).filter(function (row) { return row.count > 0; })
      .sort(function (a, b) { return b.count - a.count || a.order - b.order; });

    const total = allRows.reduce(function (sum, row) { return sum + row.count; }, 0);
    let rows = allRows;
    let merged = false;
    if (allRows.length > 8) {
      const rest = allRows.slice(7);
      rows = allRows.slice(0, 7).concat([{
        id: 'other',
        label: '其他',
        count: rest.reduce(function (sum, row) { return sum + row.count; }, 0),
        color: '#8e8e93',
        order: 99
      }]);
      merged = true;
    }

    els.partPiePeriod.textContent = periodText;
    els.pieMonthBtn.disabled = !isMonth;
    els.pieMonthBtn.querySelector('.pie-month-caret').hidden = !isMonth;
    els.pieMonthBtn.setAttribute('aria-label', isMonth ? '选择月份，当前 ' + periodText : '统计范围 ' + periodText);
    els.pieRange.querySelectorAll('.pie-range-btn').forEach(function (button) {
      button.setAttribute('aria-pressed', button.dataset.range === range ? 'true' : 'false');
    });
    els.pieTotal.textContent = String(total);
    els.pieChart.setAttribute('aria-label', periodText + '部位占比，共 ' + total + ' 次');

    const cx = 180;
    const cy = 125;
    const outer = 78;
    const inner = 52;
    let svg = '<circle class="pie-track" cx="' + cx + '" cy="' + cy + '" r="' + ((outer + inner) / 2) +
      '" fill="none" stroke="var(--fill)" stroke-width="' + (outer - inner) + '"/>';

    if (rows.length === 1) {
      svg += '<circle class="pie-segment" cx="' + cx + '" cy="' + cy + '" r="' + ((outer + inner) / 2) +
        '" fill="none" stroke="' + rows[0].color + '" stroke-width="' + (outer - inner) + '"/>';
    } else {
      let angle = -90;
      rows.forEach(function (row) {
        const sweep = total ? (row.count / total) * 360 : 0;
        const gap = Math.min(1.4, sweep * 0.18);
        const segmentStart = angle + gap / 2;
        const segmentEnd = angle + sweep - gap / 2;
        if (segmentEnd > segmentStart) {
          svg += '<path class="pie-segment" d="' + pieDonutPath(cx, cy, outer, inner, segmentStart, segmentEnd) +
            '" fill="' + row.color + '"/>';
        }
        angle += sweep;
      });
    }

    const callouts = [];
    let angle = -90;
    rows.forEach(function (row) {
      const sweep = total ? (row.count / total) * 360 : 0;
      const middle = angle + sweep / 2;
      const radians = middle * Math.PI / 180;
      const percent = total ? (row.count / total) * 100 : 0;
      callouts.push({
        row: row,
        percent: percent,
        side: Math.cos(radians) >= 0 ? 'right' : 'left',
        startX: cx + Math.cos(radians) * (outer + 1),
        startY: cy + Math.sin(radians) * (outer + 1),
        labelY: Math.max(18, Math.min(232, cy + Math.sin(radians) * 96))
      });
      angle += sweep;
    });

    ['left', 'right'].forEach(function (side) {
      const sideLabels = callouts.filter(function (item) { return item.side === side; })
        .sort(function (a, b) { return a.labelY - b.labelY; });
      sideLabels.forEach(function (item, index) {
        item.labelY = Math.max(item.labelY, 18 + index * 28);
      });
      for (let index = sideLabels.length - 1; index >= 0; index -= 1) {
        itemClamp(sideLabels, index);
      }
      sideLabels.forEach(function (item, index) {
        if (index) item.labelY = Math.max(item.labelY, sideLabels[index - 1].labelY + 28);
      });
    });

    function itemClamp(items, index) {
      const maxY = 232 - (items.length - 1 - index) * 28;
      items[index].labelY = Math.min(items[index].labelY, maxY);
    }

    callouts.forEach(function (item) {
      const textX = item.side === 'right' ? 276 : 84;
      const anchor = item.side === 'right' ? 'start' : 'end';
      const lineEndX = item.side === 'right' ? 264 : 96;
      const detail = item.row.count + ' 次 · ' + piePercentText(item.percent);
      const distance = Math.hypot(textX - item.startX, item.labelY + 5 - item.startY);
      const leader = distance > 46
        ? '<line class="pie-leader" x1="' + item.startX.toFixed(2) + '" y1="' + item.startY.toFixed(2) +
          '" x2="' + lineEndX + '" y2="' + (item.labelY + 4).toFixed(2) + '"/>'
        : '';
      svg += '<g class="pie-callout">' + leader +
        '<text class="pie-label-name" x="' + textX + '" y="' + item.labelY.toFixed(2) + '" text-anchor="' + anchor + '">' +
        escapeXml(pieLabel(item.row.label)) + '</text>' +
        '<text class="pie-label-detail" x="' + textX + '" y="' + (item.labelY + 12).toFixed(2) +
        '" text-anchor="' + anchor + '">' + escapeXml(detail) + '</text>' +
        '</g>';
    });

    els.pieChart.innerHTML = svg;
    els.pieCaption.textContent = trainingDays.size + ' 天 · 共 ' + total + ' 次' + (merged ? ' · 小项合并为其他' : '');
  }

  function renderTimeline() {
    const today = new Date();
    const isMonth = state.timelineRange === 'month';
    const start = isMonth
      ? new Date(today.getFullYear(), today.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
    const end = isMonth
      ? new Date(today.getFullYear(), today.getMonth() + 1, 0)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startKey = dateKey(start);
    const endKey = dateKey(end);
    const trained = new Set();

    Object.keys(state.workouts).forEach(function (key) {
      if (key < startKey || key > endKey) return;
      (state.workouts[key] || []).forEach(function (id) {
        if (getPart(id)) trained.add(id);
      });
    });

    const rows = partCatalog.filter(function (part) { return trained.has(part.id); });
    const totalDays = Math.round((end - start) / 86400000) + 1;
    const dates = [];
    for (let offset = 0; offset < totalDays; offset += 1) {
      dates.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset));
    }

    const headRow = document.createElement('tr');
    const partHead = document.createElement('th');
    partHead.className = 'timeline-part-head';
    partHead.scope = 'col';
    partHead.textContent = '部位';
    headRow.appendChild(partHead);
    dates.forEach(function (date, index) {
      const key = dateKey(date);
      const th = document.createElement('th');
      th.scope = 'col';
      th.className = 'timeline-date-head' + (key === dateKey(today) ? ' is-today' : '');
      if (!isMonth) th.style.color = monthColor(date.getMonth());
      const number = document.createElement('span');
      number.className = 'timeline-date-number' + (index % 2 === 1 ? ' is-staggered' : '');
      number.textContent = String(date.getDate());
      th.appendChild(number);
      headRow.appendChild(th);
    });
    replaceContent(els.timelineTableHead, headRow);

    if (!rows.length) {
      replaceContent(els.timelineTableBody, document.createDocumentFragment());
      replaceContent(els.timelineTableFoot, document.createDocumentFragment());
      els.timelineEmpty.hidden = false;
      els.timelineCaption.textContent = (isMonth ? '本月' : '近30天') + ' · 今天在最右';
      updateTimelineRangeButtons();
      return;
    }

    const body = document.createDocumentFragment();
    rows.forEach(function (part) {
      const index = partCatalog.findIndex(function (item) { return item.id === part.id; });
      const tr = document.createElement('tr');
      const name = document.createElement('th');
      name.scope = 'row';
      name.className = 'timeline-part-row';
      const dot = document.createElement('span');
      dot.className = 'timeline-row-dot';
      dot.style.background = PIE_COLORS[Math.max(0, index) % PIE_COLORS.length];
      const label = document.createElement('span');
      label.textContent = part.label;
      name.appendChild(dot);
      name.appendChild(label);
      tr.appendChild(name);
      dates.forEach(function (date) {
        const key = dateKey(date);
        const td = document.createElement('td');
        const ids = (state.workouts[key] || []);
        if (ids.indexOf(part.id) >= 0) {
          const square = document.createElement('span');
          square.className = 'timeline-cell-square';
          square.style.background = PIE_COLORS[Math.max(0, index) % PIE_COLORS.length];
          td.appendChild(square);
        }
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    replaceContent(els.timelineTableBody, body);

    const footRow = document.createElement('tr');
    const footHead = document.createElement('th');
    footHead.className = 'timeline-foot-head';
    footRow.appendChild(footHead);
    let groupStart = 0;
    while (groupStart < dates.length) {
      const month = dates[groupStart].getMonth();
      let groupEnd = groupStart;
      while (groupEnd + 1 < dates.length && dates[groupEnd + 1].getMonth() === month) {
        groupEnd += 1;
      }
      const cell = document.createElement('td');
      cell.colSpan = groupEnd - groupStart + 1;
      cell.className = 'timeline-month-label-cell';
      if (!isMonth) cell.style.color = monthColor(month);
      cell.textContent = (month + 1) + '月';
      footRow.appendChild(cell);
      groupStart = groupEnd + 1;
    }
    replaceContent(els.timelineTableFoot, footRow);

    els.timelineEmpty.hidden = true;
    els.timelineCaption.textContent = (isMonth ? '本月' : '近30天') + ' · 今天在最右';
    updateTimelineRangeButtons();
  }

  function updateTimelineRangeButtons() {
    els.timelineRange.querySelectorAll('button').forEach(function (button) {
      button.setAttribute('aria-pressed', button.dataset.range === state.timelineRange ? 'true' : 'false');
    });
  }

  function renderCurveMonthPicker() {
    const year = state.curvePickerYear;
    els.curvePickerYear.textContent = year + '年';
    const fragment = document.createDocumentFragment();
    for (let month = 0; month < 12; month += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pie-month-chip';
      button.dataset.month = String(month);
      button.textContent = (month + 1) + '月';
      const active = year === state.curveDate.getFullYear() && month === state.curveDate.getMonth();
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      fragment.appendChild(button);
    }
    replaceContent(els.curveMonthGrid, fragment);
  }

  function openCurveMonthPicker() {
    if (state.curvePeriod !== 'month') return;
    if (!els.curveMonthPopover.hidden) return;
    state.curvePickerYear = state.curveDate.getFullYear();
    renderCurveMonthPicker();
    els.curveMonthPopover.hidden = false;
    els.curveMonthBtn.setAttribute('aria-expanded', 'true');
  }

  function closeCurveMonthPicker() {
    if (els.curveMonthPopover.hidden) return;
    els.curveMonthPopover.hidden = true;
    els.curveMonthBtn.setAttribute('aria-expanded', 'false');
  }

  function renderCurve() {
    closePieMonthPicker();
    closeCurveMonthPicker();
    const data = curveData();
    const peak = Math.max.apply(null, data.bars.concat(data.line).concat([0]));
    els.curveTitle.textContent = '训练数据';
    els.curveRangeLabel.textContent = data.range;
    const monthView = data.chartType === 'month';
    els.curveRangeLabel.hidden = monthView;
    els.curveMonthBtn.disabled = !monthView;
    els.curveMonthLabel.textContent = monthView
      ? (state.curveDate.getMonth() + 1) + '月'
      : data.chartType === 'days' ? '近30天' : state.curveYear + '年';
    const curveCaret = els.curveMonthBtn.querySelector('.curve-month-caret');
    if (curveCaret) curveCaret.hidden = !monthView;
    els.curveMonthBtn.setAttribute('aria-label',
      monthView ? '切换月份，当前 ' + (state.curveDate.getMonth() + 1) + '月' : '当前范围 ' + els.curveMonthLabel.textContent);
    els.curveEmpty.hidden = peak > 0;
    els.curveLegend.textContent = data.chartType !== 'year' ? '柱：当天训练 · 线：残留' : '柱：每月训练总量';
    els.curveTip.classList.remove('is-visible');
    els.curveTip.textContent = data.chartType === 'days'
      ? '近30天 · 点击长柱查看当天'
      : data.chartType === 'month'
        ? '左右滑动切换月份 · 点击长柱查看当天'
        : '左右滑动切换年份 · 点柱子查看该月';
    els.curveTip.classList.add('is-visible');
    els.curvePeriodSegment.querySelectorAll('button').forEach(function (button) {
      button.setAttribute('aria-pressed', button.dataset.period === state.curvePeriod ? 'true' : 'false');
    });
    renderCurveChart(data);
    renderPartPie();
    renderTimeline();
    persistDataView();
  }

  function renderCurveOverview() {
    const year = state.curveOverviewYear;
    els.curveOverviewYear.textContent = String(year);
    const months = Array.from({ length: 12 }, function (_, index) {
      return monthCurveData(year, index);
    });
    const allLines = [].concat.apply([], months.map(function (month) { return month.line; }));
    const globalMax = Math.max.apply(null, allLines.concat([1]));
    const fragment = document.createDocumentFragment();

    months.forEach(function (data, month) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'curve-month-card';
      card.dataset.month = String(month);
      const current = year === state.curveDate.getFullYear() && month === state.curveDate.getMonth();
      if (current) card.classList.add('is-current');
      card.setAttribute('aria-label', year + '年' + (month + 1) + '月，训练 ' + data.trainingDays + ' 天，查看当月曲线');

      const title = document.createElement('span');
      title.className = 'curve-month-title';
      title.textContent = (month + 1) + '月';
      card.appendChild(title);

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 120 54');
      svg.setAttribute('class', 'curve-month-chart');
      svg.setAttribute('aria-hidden', 'true');
      const points = data.line.map(function (value, index) {
        return {
          x: 2 + (index / Math.max(1, data.line.length - 1)) * 116,
          y: 46 - (value / globalMax) * 38
        };
      });
      const line = smoothPath(points);
      const area = points.length
        ? line + ' L118,48 L2,48 Z'
        : '';
      svg.innerHTML = '<path class="mini-area" d="' + area + '"/>' +
        '<path class="mini-line" d="' + line + '"/>';
      card.appendChild(svg);

      const meta = document.createElement('span');
      meta.className = 'curve-month-meta';
      meta.textContent = data.trainingDays + ' 天';
      card.appendChild(meta);
      fragment.appendChild(card);
    });

    replaceContent(els.curveOverviewGrid, fragment);
  }

  function openCurveOverview() {
    if (!els.curveOverview.hidden) return;
    closePieMonthPicker();
    state.curveOverviewYear = state.curvePeriod === 'year' ? state.curveYear : state.curveDate.getFullYear();
    els.curveMain.hidden = true;
    els.curveOverview.hidden = false;
    renderCurveOverview();
    window.scrollTo(0, 0);
    els.curveOverviewBack.focus({ preventScroll: true });
  }

  function closeCurveOverview() {
    if (els.curveOverview.hidden) return;
    els.curveOverview.hidden = true;
    els.curveMain.hidden = false;
    renderCurve();
    window.scrollTo(0, 0);
    els.curveTitleBtn.focus({ preventScroll: true });
  }

  function shiftCurvePeriod(delta) {
    if (state.curvePeriod === '30') return;
    if (state.curvePeriod === 'year') {
      state.curveYear += delta;
    } else {
      state.curveDate = new Date(state.curveDate.getFullYear(), state.curveDate.getMonth() + delta, 1);
      state.curveYear = state.curveDate.getFullYear();
    }
    renderCurve();
  }


  function parseDateKey(key) {
    const parts = key.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function trainingKeys() {
    return Object.keys(state.workouts).filter(function (key) {
      return (state.workouts[key] || []).length > 0;
    }).sort();
  }

  function profileDateLabel(key) {
    const date = parseDateKey(key);
    const today = new Date();
    const prefix = date.getFullYear() === today.getFullYear() ? '' : date.getFullYear() + '年';
    return prefix + (date.getMonth() + 1) + '月' + date.getDate() + '日';
  }

  function clearProfilePhotoUrls() {
    state.profilePhotoUrls.forEach(function (url) {
      window.URL.revokeObjectURL(url);
    });
    state.profilePhotoUrls = [];
  }

  function profilePhotoMonthPrefix(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
  }

  function latestPhotoMonth() {
    const keys = Object.keys(state.extras).filter(function (key) {
      return photoMetas(state.extras[key] || {}).length > 0;
    }).sort();
    if (!keys.length) return null;
    const date = parseDateKey(keys[keys.length - 1]);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function renderProfilePhotoMonthPicker() {
    const year = state.profilePhotoMonth.getFullYear();
    const fragment = document.createDocumentFragment();
    for (let month = 0; month < 12; month += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'profile-photo-month-chip';
      button.dataset.month = String(month);
      button.textContent = (month + 1) + '月';
      const active = year === state.profilePhotoMonth.getFullYear() &&
        month === state.profilePhotoMonth.getMonth();
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      fragment.appendChild(button);
    }
    replaceContent(els.profilePhotoMonths, fragment);
  }

  async function renderProfilePhotos() {
    const token = ++state.profilePhotoToken;
    clearProfilePhotoUrls();
    const allPhotoDates = Object.keys(state.extras).filter(function (key) {
      return photoMetas(state.extras[key] || {}).length > 0;
    });
    const total = allPhotoDates.reduce(function (sum, key) {
      return sum + photoMetas(state.extras[key] || {}).length;
    }, 0);
    const open = !els.photoGallerySheet.hidden;
    els.profilePhotoCount.textContent = total ? total + ' 张' : '0 张';

    if (!open) {
      replaceContent(els.profilePhotoGroups, document.createDocumentFragment());
      els.profilePhotoEmpty.hidden = true;
      els.profilePhotoMonths.hidden = true;
      els.profilePhotoMonthBtn.setAttribute('aria-expanded', 'false');
      clearProfilePhotoUrls();
      return;
    }

    const month = state.profilePhotoMonth;
    const prefix = profilePhotoMonthPrefix(month);
    els.profilePhotoMonthBtn.textContent = month.getFullYear() + '年' + (month.getMonth() + 1) + '月';
    renderProfilePhotoMonthPicker();

    const dates = allPhotoDates.filter(function (key) {
      return key.indexOf(prefix + '-') === 0;
    }).sort().reverse();
    if (!dates.length) {
      replaceContent(els.profilePhotoGroups, document.createDocumentFragment());
      els.profilePhotoEmpty.hidden = false;
      els.profilePhotoEmpty.textContent = '这个月还没有照片。';
      return;
    }

    const metas = [];
    dates.forEach(function (key) {
      photoMetas(state.extras[key] || {}).forEach(function (meta) {
        metas.push({ id: meta.id, date: key });
      });
    });
    const records = await Promise.all(metas.map(function (meta) {
      return mediaGet(meta.id).catch(function () { return null; });
    }));
    if (token !== state.profilePhotoToken) return;

    const items = [];
    const urls = [];
    const byDate = new Map();
    records.forEach(function (record, index) {
      if (!record || !record.blob) return;
      const meta = metas[index];
      const url = window.URL.createObjectURL(record.blob);
      const item = { url: url, caption: profileDateLabel(meta.date) };
      urls.push(url);
      items.push(item);
      if (!byDate.has(meta.date)) byDate.set(meta.date, []);
      byDate.get(meta.date).push(item);
    });
    state.profilePhotoUrls = urls;

    const groups = document.createDocumentFragment();
    dates.forEach(function (key) {
      const photos = byDate.get(key) || [];
      if (!photos.length) return;
      const group = document.createElement('section');
      group.className = 'profile-photo-group';
      const head = document.createElement('h3');
      head.className = 'profile-photo-date-heading';
      head.textContent = profileDateLabel(key);
      const count = document.createElement('span');
      count.textContent = photos.length + ' 张';
      head.appendChild(count);
      group.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'profile-photo-grid';
      photos.forEach(function (item) {
        const index = items.indexOf(item);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'profile-photo-thumb';
        button.setAttribute('aria-label', item.caption + ' 第 ' + (index + 1) + ' 张');
        const image = document.createElement('img');
        image.src = item.url;
        image.alt = '';
        image.loading = 'lazy';
        button.appendChild(image);
        button.addEventListener('click', function () {
          openPhotoViewer(items, index);
        });
        grid.appendChild(button);
      });
      group.appendChild(grid);
      groups.appendChild(group);
    });
    replaceContent(els.profilePhotoGroups, groups);
    els.profilePhotoEmpty.hidden = items.length > 0;
    els.profilePhotoEmpty.textContent = items.length ? '' : '这个月的照片读取失败。';
  }

  function partNoteText(id) {
    return state.partNotes[id] || '';
  }

  function renderPartNotesPreview() {
    const entries = partCatalog.map(function (part, index) {
      return {
        part: part,
        color: PIE_COLORS[index % PIE_COLORS.length],
        text: partNoteText(part.id)
      };
    }).filter(function (item) { return item.text; });

    if (!entries.length) {
      els.partNotesSummary.textContent = '记录每个部位的训练感受';
      els.partNotesPreview.hidden = true;
      replaceContent(els.partNotesPreview, document.createDocumentFragment());
      return;
    }

    els.partNotesSummary.textContent = entries.length + ' 个部位已记录';
    els.partNotesPreview.hidden = false;
    const fragment = document.createDocumentFragment();
    entries.forEach(function (entry) {
      const row = document.createElement('div');
      row.className = 'part-notes-preview-row';
      const head = document.createElement('div');
      head.className = 'part-notes-preview-head';
      const dot = document.createElement('span');
      dot.className = 'part-notes-dot';
      dot.style.background = entry.color;
      const name = document.createElement('span');
      name.className = 'part-notes-preview-name';
      name.textContent = entry.part.label;
      head.appendChild(dot);
      head.appendChild(name);
      const text = document.createElement('p');
      text.className = 'part-notes-preview-text';
      text.textContent = entry.text;
      row.appendChild(head);
      row.appendChild(text);
      fragment.appendChild(row);
    });
    replaceContent(els.partNotesPreview, fragment);
  }

  function renderPartNotesSheet() {
    const fragment = document.createDocumentFragment();
    partCatalog.forEach(function (part, index) {
      const text = partNoteText(part.id);
      const isOpen = state.openPartNoteId === part.id;
      const item = document.createElement('section');
      item.className = 'part-note-item' + (isOpen ? ' is-open' : '');
      item.dataset.part = part.id;

      const head = document.createElement('button');
      head.type = 'button';
      head.className = 'part-note-head';
      head.dataset.part = part.id;
      head.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const dot = document.createElement('span');
      dot.className = 'part-notes-dot';
      dot.style.background = PIE_COLORS[index % PIE_COLORS.length];
      const copy = document.createElement('span');
      copy.className = 'part-note-head-copy';
      const name = document.createElement('span');
      name.className = 'part-note-name';
      name.textContent = part.label;
      const preview = document.createElement('span');
      preview.className = 'part-note-preview';
      preview.textContent = text || '添加记录';
      if (!text) preview.classList.add('is-empty');
      copy.appendChild(name);
      copy.appendChild(preview);
      const caret = document.createElement('span');
      caret.className = 'part-note-caret';
      head.appendChild(dot);
      head.appendChild(copy);
      head.appendChild(caret);
      item.appendChild(head);

      if (isOpen) {
        const editor = document.createElement('div');
        editor.className = 'part-note-editor';
        const input = document.createElement('textarea');
        input.className = 'part-note-input';
        input.maxLength = 200;
        input.rows = 4;
        input.placeholder = '写下这个部位的训练感受，最多200字';
        input.value = text;
        const foot = document.createElement('div');
        foot.className = 'part-note-foot';
        const count = document.createElement('span');
        count.className = 'part-note-count';
        count.textContent = text.length + '/200';
        const done = document.createElement('button');
        done.type = 'button';
        done.className = 'part-note-done';
        done.textContent = '完成';
        foot.appendChild(count);
        foot.appendChild(done);
        editor.appendChild(input);
        editor.appendChild(foot);
        item.appendChild(editor);
      }
      fragment.appendChild(item);
    });
    replaceContent(els.partNotesList, fragment);
    if (state.openPartNoteId) {
      window.requestAnimationFrame(function () {
        const input = els.partNotesList.querySelector('.part-note-item.is-open .part-note-input');
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      });
    }
  }

  function openPartNotes() {
    state.openPartNoteId = null;
    renderPartNotesSheet();
    els.partNotesSheet.hidden = false;
    document.body.classList.add('part-notes-open');
    els.partNotesSheet.focus();
  }

  function closePartNotes() {
    state.openPartNoteId = null;
    els.partNotesSheet.hidden = true;
    document.body.classList.remove('part-notes-open');
    renderPartNotesPreview();
  }

  function togglePartNote(id) {
    if (state.openPartNoteId === id) state.openPartNoteId = null;
    else state.openPartNoteId = id;
    renderPartNotesSheet();
    haptic(4);
  }

  function renderProfile() {
    const now = new Date();
    const todayKey = dateKey(now);
    const monthPrefix = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const keys = trainingKeys();
    const keySet = new Set(keys);

    let monthDays = 0;
    let yearDays = 0;
    let recentDays = 0;
    const recentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    const last30StartKey = dateKey(recentStart);
    keys.forEach(function (key) {
      if (key.startsWith(monthPrefix)) monthDays += 1;
      if (key.startsWith(String(now.getFullYear()))) yearDays += 1;
      if (key >= last30StartKey && key <= todayKey) recentDays += 1;
    });

    els.metricTotal.textContent = String(keys.length);
    els.metricMonth.textContent = String(monthDays);
    els.metricYear.textContent = String(yearDays);
    els.metricRecent.textContent = String(recentDays);

    const stats = new Map();
    keys.forEach(function (key) {
      (state.workouts[key] || []).forEach(function (id) {
        if (!getPart(id)) return;
        if (!stats.has(id)) stats.set(id, { total: 0, month: 0, last: '' });
        const item = stats.get(id);
        item.total += 1;
        if (key.startsWith(monthPrefix)) item.month += 1;
        if (!item.last || key > item.last) item.last = key;
      });
    });

    const partRows = partCatalog.map(function (part, index) {
      return {
        part: part,
        color: PIE_COLORS[index % PIE_COLORS.length],
        stats: stats.get(part.id) || { total: 0, month: 0, last: '' }
      };
    }).filter(function (row) { return row.stats.total > 0; })
      .sort(function (a, b) { return b.stats.total - a.stats.total; });

    const partsFragment = document.createDocumentFragment();
    partRows.forEach(function (row) {
      const item = document.createElement('div');
      item.className = 'profile-part-row';
      const dot = document.createElement('span');
      dot.className = 'profile-part-dot';
      dot.style.background = row.color;
      item.appendChild(dot);
      const name = document.createElement('span');
      name.className = 'profile-part-name';
      name.textContent = row.part.label;
      item.appendChild(name);
      const meta = document.createElement('span');
      meta.className = 'profile-part-meta';
      meta.textContent = '总 ' + row.stats.total + ' 次 · 本月 ' + row.stats.month + ' 次';
      item.appendChild(meta);
      const last = document.createElement('span');
      last.className = 'profile-part-last';
      if (row.stats.last) {
        const lastDate = document.createElement('span');
        lastDate.textContent = '上次 ' + profileDateLabel(row.stats.last);
        const days = Math.max(0, Math.floor((now - parseDateKey(row.stats.last)) / 86400000));
        const daysNode = document.createElement('span');
        daysNode.className = 'profile-part-days';
        daysNode.textContent = '距今 ' + days + ' 天';
        last.appendChild(lastDate);
        last.appendChild(daysNode);
      } else {
        last.textContent = '还没练过';
      }
      item.appendChild(last);
      partsFragment.appendChild(item);
    });
    if (!partRows.length) {
      const empty = document.createElement('p');
      empty.className = 'profile-empty';
      empty.textContent = '还没有训练记录，先去日历记一次吧。';
      partsFragment.appendChild(empty);
    }
    replaceContent(els.profileParts, partsFragment);

    const recentStartKey = dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    const recentKeys = keys.filter(function (key) {
      return key >= recentStartKey && key <= todayKey;
    }).reverse();
    const recentFragment = document.createDocumentFragment();
    recentKeys.forEach(function (key) {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'profile-recent-row';
      row.dataset.date = key;
      const date = parseDateKey(key);
      const dateNode = document.createElement('span');
      dateNode.className = 'profile-recent-date';
      dateNode.textContent = (date.getMonth() + 1) + '月' + date.getDate() + '日';
      row.appendChild(dateNode);
      const parts = document.createElement('span');
      parts.className = 'profile-recent-parts';
      const labels = (state.workouts[key] || []).map(function (id) {
        const part = getPart(id);
        return part ? part.label : '';
      }).filter(Boolean);
      labels.slice(0, 3).forEach(function (label) {
        const tag = document.createElement('span');
        tag.className = 'profile-recent-tag';
        tag.textContent = label;
        parts.appendChild(tag);
      });
      if (labels.length > 3) {
        const more = document.createElement('span');
        more.className = 'profile-recent-tag';
        more.textContent = '+' + (labels.length - 3);
        parts.appendChild(more);
      }
      row.appendChild(parts);
      const marks = document.createElement('span');
      marks.className = 'profile-recent-marks';
      const extras = state.extras[key] || {};
      if (extras.note) {
        const note = document.createElement('span');
        note.className = 'profile-mark note';
        marks.appendChild(note);
      }
      if (photoMetas(extras).length) {
        const photo = document.createElement('span');
        photo.className = 'profile-mark photo';
        marks.appendChild(photo);
      }
      row.appendChild(marks);
      recentFragment.appendChild(row);
    });
    if (!recentKeys.length) {
      const empty = document.createElement('p');
      empty.className = 'profile-empty';
      empty.textContent = '最近 7 天还没有训练。';
      recentFragment.appendChild(empty);
    }
    replaceContent(els.profileRecent, recentFragment);
    els.profileRecentCount.textContent = '近 7 天 · ' + recentKeys.length + ' 天';
    els.profileNoteInput.value = state.profileNote;
    resizeProfileNote();
    renderProfilePhotos();
    renderPartNotesPreview();
    updateStorageUsage();
  }

  function setMainView(view) {
    state.mainView = view;
    els.curveOverview.hidden = true;
    els.curveMain.hidden = false;
    els.pieMonthPopover.hidden = true;
    els.pieMonthBtn.setAttribute('aria-expanded', 'false');
    els.profileView.hidden = view !== 'profile';
    if (view !== 'profile') clearProfilePhotoUrls();
    if (view === 'curve') {
      els.monthView.hidden = true;
      els.yearView.hidden = true;
      els.curveView.hidden = false;
      els.viewSwitch.hidden = false;
      renderCurve();
    } else if (view === 'profile') {
      els.monthView.hidden = true;
      els.yearView.hidden = true;
      els.curveView.hidden = true;
      els.viewSwitch.hidden = false;
      renderProfile();
    } else {
      els.curveView.hidden = true;
      els.yearView.hidden = true;
      els.monthView.hidden = false;
      els.viewSwitch.hidden = false;
      renderAll();
    }
    els.viewSwitch.querySelectorAll('.view-switch-btn').forEach(function (button) {
      button.setAttribute('aria-pressed', button.dataset.view === view ? 'true' : 'false');
    });
    window.scrollTo(0, 0);
  }

  function setPartEditorOpen(open) {
    els.partEditor.hidden = !open;
    els.partEditBtn.textContent = open ? '完成' : '编辑部位';
    els.partEditBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) renderPartEditor();
  }

  function renderPartEditor() {
    const fragment = document.createDocumentFragment();
    partCatalog.forEach(function (part, index) {
      const row = document.createElement('div');
      row.className = 'part-editor-row';
      row.dataset.part = part.id;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'part-name-input';
      input.maxLength = 8;
      input.value = part.label;
      input.dataset.part = part.id;
      input.setAttribute('aria-label', part.label + '名称');
      row.appendChild(input);

      const actions = document.createElement('span');
      actions.className = 'part-row-actions';

      const up = document.createElement('button');
      up.type = 'button';
      up.className = 'part-row-btn';
      up.dataset.partAction = 'up';
      up.dataset.part = part.id;
      up.textContent = '↑';
      up.disabled = index === 0;
      up.setAttribute('aria-label', '上移' + part.label);
      actions.appendChild(up);

      const down = document.createElement('button');
      down.type = 'button';
      down.className = 'part-row-btn';
      down.dataset.partAction = 'down';
      down.dataset.part = part.id;
      down.textContent = '↓';
      down.disabled = index === partCatalog.length - 1;
      down.setAttribute('aria-label', '下移' + part.label);
      actions.appendChild(down);

      if (part.custom) {
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'part-row-btn is-delete';
        remove.dataset.partAction = 'delete';
        remove.dataset.part = part.id;
        remove.textContent = '×';
        remove.setAttribute('aria-label', '删除' + part.label);
        actions.appendChild(remove);
      } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'part-row-placeholder';
        actions.appendChild(placeholder);
      }

      row.appendChild(actions);
      fragment.appendChild(row);
    });
    replaceContent(els.partEditorList, fragment);
  }

  function commitPartLabel(id, value) {
    const part = getPart(id);
    if (!part) return;
    const label = cleanPartLabel(value);
    if (!label) {
      renderPartEditor();
      return;
    }
    if (part.custom) {
      const custom = state.settings.customParts.find(function (item) { return item.id === id; });
      if (custom) custom.label = label;
    } else {
      state.settings.partLabels[id] = label;
    }
    persistSettings();
    refreshPartCatalog();
    renderPartChips();
    renderPartEditor();
    renderAll();
    haptic(5);
  }

  function addCustomPart() {
    if (state.settings.customParts.length >= 20) return;
    const id = 'custom_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    state.settings.customParts.push({ id: id, label: '新部位', weight: 2 });
    state.settings.partOrder.push(id);
    refreshPartCatalog();
    persistSettings();
    renderPartChips();
    renderPartEditor();
    renderAll();
    const input = els.partEditorList.querySelector('input[data-part="' + id + '"]');
    if (input) {
      input.focus();
      input.select();
    }
    haptic(6);
  }

  function sortAllWorkouts() {
    Object.keys(state.workouts).forEach(function (key) {
      const sorted = state.workouts[key]
        .filter(function (id) { return partById.has(id); })
        .sort(function (a, b) { return partOrder.get(a) - partOrder.get(b); });
      if (sorted.length) state.workouts[key] = sorted;
      else delete state.workouts[key];
    });
    persist();
  }

  function movePart(id, delta) {
    const index = state.settings.partOrder.indexOf(id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= state.settings.partOrder.length) return;
    const order = state.settings.partOrder.slice();
    const temp = order[index];
    order[index] = order[target];
    order[target] = temp;
    state.settings.partOrder = order;
    refreshPartCatalog();
    persistSettings();
    sortAllWorkouts();
    renderPartChips();
    renderPartEditor();
    renderWeightEditor();
    renderAll();
    if (!els.yearView.hidden) {
      renderYearFilter();
      renderYearView();
    }
    haptic(5);
  }

  function deleteCustomPart(id) {
    const part = getPart(id);
    if (!part || !part.custom) return;
    if (!window.confirm('删除「' + part.label + '」？已有记录里的这个部位也会一并删除。')) return;
    state.settings.customParts = state.settings.customParts.filter(function (item) { return item.id !== id; });
    state.settings.partOrder = state.settings.partOrder.filter(function (item) { return item !== id; });
    if (state.partNotes[id]) {
      delete state.partNotes[id];
      persistPartNotes();
    }
    if (state.draft) state.draft.delete(id);
    state.yearFilter.delete(id);
    Object.keys(state.workouts).forEach(function (key) {
      const next = state.workouts[key].filter(function (item) { return item !== id; });
      if (next.length) state.workouts[key] = next;
      else delete state.workouts[key];
    });
    refreshPartCatalog();
    persistSettings();
    persist();
    renderPartChips();
    renderPartEditor();
    renderWeightEditor();
    updateSheetFooter();
    renderAll();
    if (!els.yearView.hidden) {
      renderYearFilter();
      renderYearView();
    }
    haptic(7);
    showToast('已删除部位「' + part.label + '」');
  }

  function renderPartChips() {
    const fragment = document.createDocumentFragment();
    partCatalog.forEach(function (part) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'part-chip';
      chip.dataset.part = part.id;
      chip.setAttribute('aria-pressed', state.draft.has(part.id) ? 'true' : 'false');
      chip.setAttribute('aria-label', part.label);

      const character = document.createElement('span');
      character.className = 'part-char';
      character.textContent = part.label;

      chip.appendChild(character);
      fragment.appendChild(chip);
    });
    replaceContent(els.partGrid, fragment);
  }

  function updateNoteCount() {
    els.noteCount.textContent = state.draftNote.length + '/300';
  }

  function updatePhotoUI() {
    const fragment = document.createDocumentFragment();
    const items = [];
    state.draftPhotos.forEach(function (photo, index) {
      if (!photo.url) {
        const placeholder = document.createElement('span');
        placeholder.className = 'photo-thumb is-loading';
        fragment.appendChild(placeholder);
        return;
      }
      items.push({ url: photo.url, caption: formatMonthDate(fromKey(state.selectedDateKey || state.detailDateKey)) });
      const thumb = document.createElement('span');
      thumb.className = 'photo-thumb';

      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'photo-open';
      open.setAttribute('aria-label', '查看照片 ' + (index + 1));
      const img = document.createElement('img');
      img.src = photo.url;
      img.alt = '';
      open.appendChild(img);
      const itemIndex = items.length - 1;
      open.addEventListener('click', function () { openPhotoViewer(items, itemIndex); });
      thumb.appendChild(open);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'photo-remove';
      remove.dataset.photoRemove = String(index);
      remove.setAttribute('aria-label', '删除照片 ' + (index + 1));
      remove.textContent = '×';
      thumb.appendChild(remove);
      fragment.appendChild(thumb);
    });
    replaceContent(els.photoGrid, fragment);
    els.photoCount.textContent = state.draftPhotos.length + '/' + MAX_PHOTOS;
    els.photoAddBtn.hidden = state.draftPhotos.length >= MAX_PHOTOS;
    els.photoInput.value = '';
  }

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        const image = new Image();
        image.onerror = reject;
        image.onload = function () {
          const maxEdge = 900;
          const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          let data = canvas.toDataURL('image/jpeg', 0.72);
          if (data.length > 650000) {
            canvas.width = Math.max(1, Math.round(canvas.width * 0.72));
            canvas.height = Math.max(1, Math.round(canvas.height * 0.72));
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            data = canvas.toDataURL('image/jpeg', 0.6);
          }
          resolve(data);
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoFiles(files) {
    const list = Array.from(files || []).filter(function (file) { return /^image\//.test(file.type); });
    if (!list.length) {
      showToast('请选择图片文件');
      return;
    }
    const slots = MAX_PHOTOS - state.draftPhotos.length;
    if (slots <= 0) {
      showToast('一天最多放 ' + MAX_PHOTOS + ' 张照片');
      return;
    }
    els.photoAddBtn.disabled = true;
    for (const file of list.slice(0, slots)) {
      try {
        const keepOriginal = state.settings.photoQuality === 'original' &&
          /^image\/(jpeg|png|webp|gif)$/.test(file.type);
        let blob;
        if (keepOriginal) {
          blob = file;
        } else {
          const data = await compressImage(file);
          blob = dataUrlToBlob(data);
        }
        const id = 'photo_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        state.draftPhotos.push({
          id: id,
          type: blob.type || file.type || 'image/jpeg',
          blob: blob,
          url: window.URL.createObjectURL(blob),
          existing: false
        });
        updatePhotoUI();
      } catch (error) {
        showToast('图片读取失败，请换一张试试');
      }
    }
    updatePhotoUI();
    updateSheetFooter();
    els.photoAddBtn.disabled = false;
    els.photoInput.value = '';
    haptic(8);
  }

  async function hydrateDraftPhotos() {
    let changed = false;
    for (const photo of state.draftPhotos) {
      if (!photo.existing || photo.url) continue;
      try {
        const record = await mediaGet(photo.id);
        if (record && record.blob) {
          photo.blob = record.blob;
          photo.url = photoUrl(photo.id, record.blob);
          photo.type = record.type || photo.type;
          changed = true;
        }
      } catch (error) {
        // Leave the placeholder if the photo is missing.
      }
    }
    if (changed) updatePhotoUI();
  }

  function removeDraftPhoto(index) {
    const photo = state.draftPhotos[index];
    if (!photo) return;
    if (!photo.existing && photo.url) window.URL.revokeObjectURL(photo.url);
    state.draftPhotos.splice(index, 1);
    updatePhotoUI();
    updateSheetFooter();
    haptic(5);
  }

  function renderPhotoViewer() {
    const items = state.viewerPhotos;
    if (!items.length) return;
    const index = Math.max(0, Math.min(state.viewerIndex, items.length - 1));
    state.viewerIndex = index;
    els.photoViewerImg.src = items[index].url;
    els.photoViewerImg.alt = items[index].caption || '训练照片';
    els.photoViewerCaption.textContent = (items[index].caption ? items[index].caption + ' · ' : '') +
      (index + 1) + '/' + items.length;
    const multiple = items.length > 1;
    els.photoViewerPrev.hidden = !multiple;
    els.photoViewerNext.hidden = !multiple;
  }

  function openPhotoViewer(items, index) {
    if (!items || !items.length) return;
    state.viewerPhotos = items;
    state.viewerIndex = index || 0;
    state.viewerReturnFocus = document.activeElement;
    els.photoViewer.hidden = false;
    document.body.classList.add('photo-viewer-open');
    renderPhotoViewer();
    els.photoViewerClose.focus({ preventScroll: true });
  }

  function closePhotoViewer() {
    if (els.photoViewer.hidden) return;
    els.photoViewer.hidden = true;
    els.photoViewerImg.removeAttribute('src');
    document.body.classList.remove('photo-viewer-open');
    const target = state.viewerReturnFocus;
    state.viewerPhotos = [];
    state.viewerIndex = 0;
    if (target && target.isConnected && typeof target.focus === 'function') target.focus({ preventScroll: true });
  }

  function stepPhotoViewer(delta) {
    if (els.photoViewer.hidden || state.viewerPhotos.length < 2) return;
    const count = state.viewerPhotos.length;
    state.viewerIndex = (state.viewerIndex + delta + count) % count;
    renderPhotoViewer();
  }

  function updateSheetFooter() {
    const count = state.draft.size;
    const bits = [];
    if (count) bits.push('已选 ' + count + ' 个部位');
    if (state.draftNote.trim()) bits.push('便签');
    if (state.draftPhotos.length) bits.push('照片');
    els.selectionText.textContent = bits.length ? bits.join(' · ') : '可多选';
    els.saveBtn.disabled = bits.length === 0;
    updateNoteCount();
  }

  function presentPanel(panel) {
    window.clearTimeout(state.hideTimer);
    window.clearTimeout(state.focusTimer);

    [els.entrySheet, els.settingsSheet, els.statsSheet].forEach(function (item) {
      if (item === panel) return;
      item.hidden = true;
      item.classList.remove('is-open');
    });

    state.activePanel = panel;
    els.sheetBackdrop.hidden = false;
    panel.hidden = false;
    document.body.classList.add('sheet-open');
    void panel.offsetHeight;

    window.requestAnimationFrame(function () {
      els.sheetBackdrop.classList.add('is-open');
      panel.classList.add('is-open');
    });

    state.focusTimer = window.setTimeout(function () {
      panel.focus({ preventScroll: true });
    }, 30);
  }

  function openSheet(key) {
    if (!key) return;
    setPartEditorOpen(false);

    const date = fromKey(key);
    const todayK = dateKey(new Date());
    const existingParts = getParts(key);
    const existingExtras = getExtras(key);
    const existing = hasEntry(key);

    state.selectedDateKey = key;
    state.draft = new Set(existingParts);
    state.draftNote = existingExtras.note || '';
    state.draftPhotos = photoMetas(existingExtras).map(function (meta) {
      return { id: meta.id, type: meta.type, existing: true, url: '' };
    });
    if (existingExtras.image) {
      state.draftPhotos.push({
        id: 'legacy_' + key.replace(/-/g, ''),
        type: 'image/jpeg',
        existing: true,
        legacy: true,
        url: existingExtras.image
      });
    }
    state.returnFocus = document.activeElement;
    state.returnFocusDateKey = document.activeElement && document.activeElement.dataset
      ? document.activeElement.dataset.date || null
      : null;

    els.sheetDateText.textContent = formatSheetDate(date);
    els.sheetTodayBadge.hidden = key !== todayK;
    els.sheetTitle.textContent = '练了哪些部位？';
    els.clearBtn.hidden = !existing;
    els.saveBtn.textContent = existing ? '保存修改' : '保存记录';
    els.noteInput.value = state.draftNote;

    renderPartChips();
    updatePhotoUI();
    hydrateDraftPhotos();
    updateSheetFooter();
    presentPanel(els.entrySheet);
  }

  function formatStatDate(key) {
    const date = fromKey(key);
    const now = new Date();
    if (key === dateKey(now)) return '今天';
    if (date.getFullYear() === now.getFullYear()) return (date.getMonth() + 1) + '月' + date.getDate() + '日';
    return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
  }

  function renderStats() {
    const year = state.viewDate.getFullYear();
    const month = state.viewDate.getMonth();
    const isYear = state.statsPeriod === 'year';
    const start = isYear ? year + '-01-01' : year + '-' + pad(month + 1) + '-01';
    const end = isYear ? year + '-12-31' : dateKey(new Date(year, month + 1, 0));
    const counts = new Map();
    partCatalog.forEach(function (part) { counts.set(part.id, 0); });
    const trainingDays = new Set();

    Object.keys(state.workouts).forEach(function (key) {
      if (key < start || key > end) return;
      const parts = state.workouts[key] || [];
      if (!parts.length) return;
      trainingDays.add(key);
      parts.forEach(function (id) {
        if (counts.has(id)) counts.set(id, counts.get(id) + 1);
      });
    });

    const todayK = dateKey(new Date());
    const lastTrained = new Map();
    Object.keys(state.workouts).sort().forEach(function (key) {
      if (key > todayK) return;
      (state.workouts[key] || []).forEach(function (id) {
        lastTrained.set(id, key);
      });
    });

    els.statsCaption.textContent = isYear
      ? year + '年 · 训练 ' + trainingDays.size + ' 天'
      : year + '年' + (month + 1) + '月 · 训练 ' + trainingDays.size + ' 天';
    els.statsPeriodSegment.querySelectorAll('button').forEach(function (button) {
      button.setAttribute('aria-pressed', button.dataset.period === state.statsPeriod ? 'true' : 'false');
    });

    const fragment = document.createDocumentFragment();
    partCatalog.forEach(function (part) {
      const row = document.createElement('div');
      row.className = 'stats-row';
      row.dataset.part = part.id;
      const count = counts.get(part.id) || 0;
      if (!count) row.classList.add('is-empty');

      const name = document.createElement('span');
      name.className = 'stats-name';
      name.textContent = part.label;
      row.appendChild(name);

      const times = document.createElement('span');
      times.className = 'stats-times';
      const value = document.createElement('b');
      value.textContent = String(count);
      times.appendChild(value);
      const unit = document.createElement('span');
      unit.textContent = '次';
      times.appendChild(unit);
      row.appendChild(times);

      const last = document.createElement('span');
      last.className = 'stats-last';
      last.textContent = lastTrained.has(part.id) ? '上次 ' + formatStatDate(lastTrained.get(part.id)) : '还没练过';
      row.appendChild(last);

      fragment.appendChild(row);
    });
    replaceContent(els.statsList, fragment);
  }

  function formatBytes(bytes) {
    if (!bytes || bytes < 1024) return (bytes || 0) + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  async function updateStorageUsage() {
    if (!els.storageUsage) return;
    let photos = 0;
    Object.keys(state.extras).forEach(function (key) {
      const extras = state.extras[key];
      photos += photoMetas(extras).length + (extras.image ? 1 : 0);
    });
    let usage = '';
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        if (estimate && typeof estimate.usage === 'number') usage = formatBytes(estimate.usage) + ' · ';
      }
    } catch (error) {
      // Storage estimate is optional.
    }
    const text = '照片 ' + photos + ' 张 · ' + (usage ? '占用 ' + usage.replace(/ · $/, '') : '本机存储');
    if (els.storageUsage) els.storageUsage.textContent = text;
  }

  function backupFilename() {
    const now = new Date();
    const pad2 = function (value) { return String(value).padStart(2, '0'); };
    return 'TrainingLog-backup-' + now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate()) +
      '-' + pad2(now.getHours()) + pad2(now.getMinutes()) + '.json';
  }

  async function buildBackup() {
    await migrateLegacyPhotos();
    const media = {};
    const extras = {};
    for (const key of Object.keys(state.extras)) {
      const item = state.extras[key];
      const photos = [];
      for (const meta of photoMetas(item)) {
        try {
          const record = await mediaGet(meta.id);
          if (record && record.blob) {
            media[meta.id] = { type: record.type || meta.type || 'image/jpeg', data: await blobToDataUrl(record.blob) };
            photos.push({ id: meta.id, type: record.type || meta.type || 'image/jpeg' });
          }
        } catch (error) {
          // Skip missing media but keep the rest of the backup.
        }
      }
      if (item.note || photos.length) extras[key] = { note: item.note || '', photos: photos };
    }
    return {
      app: '训练记录',
      format: 'lianji-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: state.settings,
      workouts: state.workouts,
      extras: extras,
      media: media,
      partNotes: state.partNotes,
      poems: state.poems,
      note: state.profileNote
    };
  }

  async function exportBackup() {
    els.exportBackupBtn.disabled = true;
    const original = els.exportBackupBtn.textContent;
    els.exportBackupBtn.textContent = '生成中…';
    try {
      const backup = await buildBackup();
      const json = JSON.stringify(backup);
      const filename = backupFilename();
      if (window.LianjiAndroid && typeof window.LianjiAndroid.saveBackup === 'function') {
        window.LianjiAndroid.saveBackup(filename, json);
        showToast('请选择备份保存位置');
      } else {
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(function () { window.URL.revokeObjectURL(url); }, 1500);
        showToast('备份已导出');
      }
      updateStorageUsage();
    } catch (error) {
      showToast('备份生成失败，请稍后再试');
    } finally {
      els.exportBackupBtn.disabled = false;
      els.exportBackupBtn.textContent = original;
    }
  }

  function parseBackup(text) {
    const data = JSON.parse(text);
    if (!data || data.format !== 'lianji-backup' || data.version !== 1) throw new Error('invalid backup');
    if (!data.settings || !data.workouts || !data.extras || !data.media) throw new Error('invalid backup');
    return data;
  }

  async function applyBackup(data) {
    await mediaClear();
    photoUrlCache.forEach(function (url) { window.URL.revokeObjectURL(url); });
    photoUrlCache.clear();

    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.workouts));
    window.localStorage.setItem(EXTRAS_KEY, JSON.stringify(data.extras));

    for (const id of Object.keys(data.media)) {
      const item = data.media[id];
      if (!item || typeof item.data !== 'string') continue;
      try {
        const blob = dataUrlToBlob(item.data);
        await mediaPut({ id: id, date: '', blob: blob, type: item.type || blob.type || 'image/jpeg', createdAt: Date.now() });
      } catch (error) {
        // Skip malformed media records.
      }
    }

    state.settings = loadSettings();
    state.profileNote = typeof data.note === 'string' ? data.note.slice(0, 1000) : '';
    window.localStorage.setItem(NOTE_KEY, state.profileNote);
    state.partNotes = {};
    if (data.partNotes && typeof data.partNotes === 'object' && !Array.isArray(data.partNotes)) {
      Object.keys(data.partNotes).forEach(function (id) {
        if (typeof data.partNotes[id] !== 'string') return;
        const text = data.partNotes[id].slice(0, 200).trim();
        if (text) state.partNotes[id] = text;
      });
    }
    persistPartNotes();
    state.poems = Array.isArray(data.poems) ? cleanPoems(data.poems) : DEFAULT_POEMS.slice();
    if (!state.poems.length && !Array.isArray(data.poems)) state.poems = DEFAULT_POEMS.slice();
    persistPoems();
    state.todayPoem = '';
    refreshPartCatalog();
    state.workouts = loadWorkouts();
    state.extras = loadExtras();
    state.detailDateKey = dateKey(new Date());
    state.selectedDateKey = null;
    applyAppearance();
    syncSettingsControls();
    renderPartChips();
    renderWeightEditor();
    renderAll();
    renderPoemSettings();
    renderPoemEntry();
    updateStorageUsage();
    showToast('备份已恢复');
  }

  async function handleBackupFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const data = parseBackup(text);
      if (!window.confirm('导入备份会覆盖当前所有记录、便签、照片和设置，继续吗？')) return;
      await applyBackup(data);
    } catch (error) {
      showToast('备份文件无效');
    } finally {
      els.importBackupInput.value = '';
    }
  }

  async function clearAllData() {
    if (!window.confirm('确定清空所有记录、便签、照片和设置？此操作不能撤销。')) return;
    if (!window.confirm('再确认一次：全部数据都会删除。')) return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(EXTRAS_KEY);
    window.localStorage.removeItem(SETTINGS_KEY);
    window.localStorage.removeItem(NOTE_KEY);
    window.localStorage.removeItem(PART_NOTES_KEY);
    window.localStorage.removeItem(POEMS_KEY);
    try { await mediaClear(); } catch (error) { /* ignore */ }
    photoUrlCache.forEach(function (url) { window.URL.revokeObjectURL(url); });
    photoUrlCache.clear();
    state.workouts = {};
    state.extras = {};
    state.profileNote = '';
    state.settings = Object.assign({}, DEFAULT_SETTINGS, {
      partLabels: {},
      customParts: [],
      partOrder: [],
      weights: Object.assign({}, DEFAULT_WEIGHTS)
    });
    refreshPartCatalog();
    state.detailDateKey = dateKey(new Date());
    state.selectedDateKey = null;
    persistSettings();
    applyAppearance();
    syncSettingsControls();
    renderPartChips();
    renderWeightEditor();
    renderAll();
    renderPoemSettings();
    renderPoemEntry();
    updateStorageUsage();
    haptic(8);
    showToast('本机数据已清空');
  }

  function openStats() {
    state.returnFocus = document.activeElement || els.monthSummaryBtn;
    state.returnFocusDateKey = null;
    state.statsPeriod = 'month';
    els.statsSheet.scrollTop = 0;
    renderStats();
    presentPanel(els.statsSheet);
  }

  function openAbout() {
    els.aboutSheet.hidden = false;
    document.body.classList.add('about-open');
    els.aboutClose.focus({ preventScroll: true });
  }

  function closeAbout() {
    if (els.aboutSheet.hidden) return;
    els.aboutSheet.hidden = true;
    document.body.classList.remove('about-open');
    if (els.aboutLink && els.aboutLink.isConnected) {
      els.aboutLink.focus({ preventScroll: true });
    }
  }

  function renderPoemSettings() {
    const fragment = document.createDocumentFragment();
    state.poems.forEach(function (poem, index) {
      const row = document.createElement('div');
      row.className = 'poem-row';
      row.dataset.index = String(index);
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'poem-input';
      input.maxLength = 80;
      input.value = poem;
      input.dataset.index = String(index);
      input.setAttribute('aria-label', '第' + (index + 1) + '句诗');
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'poem-delete';
      remove.dataset.index = String(index);
      remove.textContent = '×';
      remove.setAttribute('aria-label', '删除第' + (index + 1) + '句诗');
      row.appendChild(input);
      row.appendChild(remove);
      fragment.appendChild(row);
    });
    replaceContent(els.poemList, fragment);
  }

  function refreshPoemDisplay() {
    state.todayPoem = '';
    if (!els.monthView.hidden) renderDayPanel();
  }

  function renderPoemEntry() {
    const count = cleanPoems(state.poems).length;
    els.poemEntryCount.textContent = count + ' 句';
  }

  function openPoemEditor() {
    state.poems = cleanPoems(state.poems);
    persistPoems();
    renderPoemEntry();
    renderPoemSettings();
    els.poemEditorSheet.hidden = false;
    els.poemEditorSheet.scrollTop = 0;
    document.body.classList.add('poem-editor-open');
    els.poemEditorSheet.focus();
  }

  function closePoemEditor() {
    els.poemEditorSheet.hidden = true;
    document.body.classList.remove('poem-editor-open');
    renderPoemEntry();
    els.poemEditEntry.focus();
  }

  function openSettings() {

    state.returnFocus = document.activeElement || els.settingsBtn;
    state.returnFocusDateKey = null;
    syncSettingsControls();
    state.poems = cleanPoems(state.poems);
    renderPoemEntry();
    els.settingsSheet.scrollTop = 0;
    updateStorageUsage();
    presentPanel(els.settingsSheet);
  }

  function restoreFocus() {
    const dateCell = state.returnFocusDateKey
      ? document.querySelector('.day-cell[data-date="' + state.returnFocusDateKey + '"]')
      : null;
    const previous = state.returnFocus;
    const canRestorePrevious = previous && previous.isConnected && previous !== document.body &&
      typeof previous.focus === 'function';
    const target = canRestorePrevious ? previous : dateCell || els.logTodayBtn;
    if (target) target.focus({ preventScroll: true });
  }

  function closeActivePanel() {
    const panel = state.activePanel;
    if (!panel) return;
    if (panel === els.entrySheet) {
      state.draftPhotos.forEach(function (photo) {
        if (!photo.existing && photo.url) window.URL.revokeObjectURL(photo.url);
      });
      state.draftPhotos = [];
    }
    const duration = preferredDuration();
    els.sheetBackdrop.classList.remove('is-open');
    panel.classList.remove('is-open');
    document.body.classList.remove('sheet-open');

    window.clearTimeout(state.hideTimer);
    window.clearTimeout(state.focusTimer);
    state.hideTimer = window.setTimeout(function () {
      panel.hidden = true;
      els.sheetBackdrop.hidden = true;
      restoreFocus();
    }, duration);

    state.activePanel = null;
    state.selectedDateKey = null;
  }

  function showToast(message, options) {
    const settings = options || {};
    window.clearTimeout(state.toastTimer);
    els.toastText.textContent = message;
    state.toastAction = null;

    if (settings.actionLabel && typeof settings.action === 'function') {
      els.toastAction.hidden = false;
      els.toastAction.textContent = settings.actionLabel;
      state.toastAction = settings.action;
    } else {
      els.toastAction.hidden = true;
      els.toastAction.textContent = '';
    }

    els.toast.classList.add('is-visible');
    state.toastTimer = window.setTimeout(function () {
      hideToast();
    }, settings.duration || 2800);
  }

  function hideToast() {
    window.clearTimeout(state.toastTimer);
    els.toast.classList.remove('is-visible');
    state.toastAction = null;
  }

  function updateToday() {
    const nextKey = dateKey(new Date());
    if (nextKey === state.lastTodayKey) return;
    if (state.detailDateKey === state.lastTodayKey) state.detailDateKey = nextKey;
    renderAll();
  }

  function shiftMonth(delta) {
    state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() + delta, 1);
    ensureDetailDateInView();
    renderAll();
  }

  async function saveEntry() {
    const key = state.selectedDateKey;
    if (!key) return;
    const parts = partCatalog.map(function (part) { return part.id; }).filter(function (id) {
      return state.draft.has(id);
    });
    const note = state.draftNote.trim();
    if (!parts.length && !note && !state.draftPhotos.length) return;

    els.saveBtn.disabled = true;
    els.saveBtn.textContent = '保存中…';
    const hadEntry = hasEntry(key);
    let mediaFailed = false;
    const keptPhotos = [];

    for (const photo of state.draftPhotos) {
      let id = photo.id;
      let type = photo.type || 'image/jpeg';
      try {
        if (photo.legacy && photo.url) {
          const blob = dataUrlToBlob(photo.url);
          id = 'photo_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          type = blob.type || 'image/jpeg';
          await mediaPut({ id: id, date: key, blob: blob, type: type, createdAt: Date.now() });
        } else if (!photo.existing && photo.blob) {
          await mediaPut({ id: id, date: key, blob: photo.blob, type: type, createdAt: Date.now() });
        }
        keptPhotos.push({ id: id, type: type });
      } catch (error) {
        mediaFailed = true;
      }
    }

    const oldMetas = photoMetas(getExtras(key));
    const keptIds = new Set(keptPhotos.map(function (photo) { return photo.id; }));
    for (const meta of oldMetas) {
      if (keptIds.has(meta.id)) continue;
      releasePhotoUrl(meta.id);
      try { await mediaDelete(meta.id); } catch (error) { /* ignore */ }
    }

    if (parts.length) state.workouts[key] = parts;
    else delete state.workouts[key];

    if (note || keptPhotos.length) state.extras[key] = { note: note, photos: keptPhotos, image: '' };
    else delete state.extras[key];

    const savedParts = persist();
    const savedExtras = persistExtras();
    els.saveBtn.disabled = false;
    els.saveBtn.textContent = hadEntry ? '保存修改' : '保存记录';
    if (mediaFailed) {
      showToast('部分照片未能保存，请重试');
      return;
    }
    closeActivePanel();
    renderAll();
    updateStorageUsage();
    haptic(12);

    if (state.isDemo) {
      showToast('示例预览 · 更改不会写入本机', { duration: 3200 });
    } else if (savedParts && savedExtras) {
      showToast(hadEntry ? '记录已更新' : '记录已保存');
    } else {
      showToast(!savedExtras ? '照片或便签未能写入本机' : '记录未能写入本机', { duration: 3600 });
    }
  }

  function clearEntry() {
    const key = state.selectedDateKey;
    if (!key) return;
    if (!hasEntry(key)) return;
    const previousParts = getParts(key).slice();
    const previousExtras = Object.assign({}, getExtras(key));
    previousExtras.photos = photoMetas(previousExtras).slice();
    const oldMetas = previousExtras.photos.slice();

    delete state.workouts[key];
    delete state.extras[key];
    const savedParts = persist();
    const savedExtras = persistExtras();
    closeActivePanel();
    renderAll();

    if (state.isDemo) {
      showToast('示例预览 · 更改不会写入本机', { duration: 3200 });
      return;
    }

    if (savedParts && savedExtras) {
      window.clearTimeout(state.photoCleanupTimer);
      state.photoCleanupTimer = window.setTimeout(function () {
        oldMetas.forEach(function (meta) {
          releasePhotoUrl(meta.id);
          mediaDelete(meta.id).catch(function () {});
        });
      }, 6000);
      showToast('已清空这天的记录', {
        actionLabel: '撤销',
        duration: 5000,
        action: function () {
          window.clearTimeout(state.photoCleanupTimer);
          if (previousParts.length) state.workouts[key] = previousParts;
          if (previousExtras.note || previousExtras.photos.length) state.extras[key] = previousExtras;
          persist();
          persistExtras();
          renderAll();
          showToast('记录已恢复');
        }
      });
    } else {
      showToast('记录未写入本机', { duration: 3600 });
    }
  }

  function moveCalendarFocus(event) {
    const cell = event.target.closest ? event.target.closest('.day-cell[data-date]') : null;
    if (!cell) return;

    let delta = 0;
    if (event.key === 'ArrowLeft') delta = -1;
    else if (event.key === 'ArrowRight') delta = 1;
    else if (event.key === 'ArrowUp') delta = -7;
    else if (event.key === 'ArrowDown') delta = 7;
    if (!delta) return;

    event.preventDefault();
    const targetDate = addDays(fromKey(cell.dataset.date), delta);
    const targetKey = dateKey(targetDate);

    if (targetDate.getMonth() !== state.viewDate.getMonth() || targetDate.getFullYear() !== state.viewDate.getFullYear()) {
      state.viewDate = startOfMonth(targetDate);
      state.detailDateKey = targetKey;
      renderAll();
    }

    const target = els.calendarGrid.querySelector('.day-cell[data-date="' + targetKey + '"]');
    if (!target) return;
    els.calendarGrid.querySelectorAll('.day-cell').forEach(function (item) { item.tabIndex = -1; });
    target.tabIndex = 0;
    target.focus({ preventScroll: true });
  }

  els.prevMonth.addEventListener('click', function () { shiftMonth(-1); });
  els.nextMonth.addEventListener('click', function () { shiftMonth(1); });
  els.monthTitleBtn.addEventListener('click', openYearView);
  els.yearBtn.addEventListener('click', openYearView);
  els.closeYearBtn.addEventListener('click', closeYearView);
  els.prevYear.addEventListener('click', function () { shiftYear(-1); });
  els.nextYear.addEventListener('click', function () { shiftYear(1); });
  els.yearGrid.addEventListener('click', function (event) {
    const month = event.target.closest ? event.target.closest('.year-month') : null;
    if (!month) return;
    selectYearMonth(Number(month.dataset.month));
  });
  els.yearFilter.addEventListener('click', function (event) {
    const chip = event.target.closest ? event.target.closest('.filter-chip') : null;
    if (!chip) return;
    if (chip.dataset.part === 'all') {
      state.yearFilter = new Set();
    } else if (state.yearFilter.has(chip.dataset.part)) {
      state.yearFilter.delete(chip.dataset.part);
    } else {
      state.yearFilter.add(chip.dataset.part);
    }
    renderYearFilter();
    renderYearView();
    haptic(5);
  });
  els.yearFilterBtn.addEventListener('click', function () {
    if (els.yearFilterPopover.hidden) openYearFilter();
    else closeYearFilter();
  });
  els.yearFilterDone.addEventListener('click', closeYearFilter);
  document.addEventListener('pointerdown', function (event) {
    if (!els.pieMonthPopover.hidden &&
      !els.pieMonthPopover.contains(event.target) &&
      !els.pieMonthBtn.contains(event.target)) {
      closePieMonthPicker();
    }
    if (els.yearFilterPopover.hidden) return;
    if (els.yearFilterPopover.contains(event.target) || els.yearFilterBtn.contains(event.target)) return;
    closeYearFilter();
  });
  els.viewSwitch.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('.view-switch-btn') : null;
    if (!button) return;
    setMainView(button.dataset.view);
    haptic(6);
  });
  els.curveSettingsBtn.addEventListener('click', openSettings);
  els.profileNoteInput.addEventListener('input', function () {
    const value = els.profileNoteInput.value.slice(0, 1000);
    if (els.profileNoteInput.value !== value) els.profileNoteInput.value = value;
    state.profileNote = value;
    resizeProfileNote();
    window.clearTimeout(state.profileNoteTimer);
    state.profileNoteTimer = window.setTimeout(function () {
      persistProfileNote();
    }, 350);
  });
  els.profileNoteInput.addEventListener('blur', function () {
    window.clearTimeout(state.profileNoteTimer);
    persistProfileNote();
  });  els.profileSettingsBtn.addEventListener('click', openSettings);
  els.partNotesToggle.addEventListener('click', openPartNotes);
  els.partNotesPreview.addEventListener('click', openPartNotes);
  els.partNotesClose.addEventListener('click', closePartNotes);
  els.partNotesList.addEventListener('click', function (event) {
    const done = event.target.closest ? event.target.closest('.part-note-done') : null;
    if (done) {
      const item = done.closest('.part-note-item');
      if (item) {
        const id = item.dataset.part;
        const text = (state.partNotes[id] || '').trim();
        if (text) state.partNotes[id] = text;
        else delete state.partNotes[id];
        persistPartNotes();
        state.openPartNoteId = null;
        renderPartNotesSheet();
        renderPartNotesPreview();
        haptic(5);
      }
      return;
    }
    const head = event.target.closest ? event.target.closest('.part-note-head') : null;
    if (head) togglePartNote(head.dataset.part);
  });
  els.partNotesList.addEventListener('input', function (event) {
    const input = event.target.closest ? event.target.closest('.part-note-input') : null;
    if (!input) return;
    const item = input.closest('.part-note-item');
    if (!item) return;
    const id = item.dataset.part;
    let text = input.value.slice(0, 200);
    if (input.value !== text) input.value = text;
    if (text) state.partNotes[id] = text;
    else delete state.partNotes[id];
    const count = item.querySelector('.part-note-count');
    if (count) count.textContent = text.length + '/200';
    persistPartNotes();
    renderPartNotesPreview();
  });
  function openPhotoGallery() {
    if (!els.photoGallerySheet.hidden) return;
    const prefix = profilePhotoMonthPrefix(state.profilePhotoMonth);
    const hasCurrent = Object.keys(state.extras).some(function (key) {
      return key.indexOf(prefix + '-') === 0 && photoMetas(state.extras[key] || {}).length > 0;
    });
    if (!hasCurrent) {
      const latest = latestPhotoMonth();
      if (latest) state.profilePhotoMonth = latest;
    }
    els.photoGallerySheet.hidden = false;
    document.body.classList.add('photo-gallery-open');
    els.profilePhotoToggle.setAttribute('aria-expanded', 'true');
    els.profilePhotoMonths.hidden = true;
    els.profilePhotoMonthBtn.setAttribute('aria-expanded', 'false');
    renderProfilePhotos();
    els.photoGalleryClose.focus({ preventScroll: true });
    haptic(5);
  }

  function closePhotoGallery() {
    if (els.photoGallerySheet.hidden) return;
    els.photoGallerySheet.hidden = true;
    document.body.classList.remove('photo-gallery-open');
    els.profilePhotoToggle.setAttribute('aria-expanded', 'false');
    clearProfilePhotoUrls();
    renderProfilePhotos();
    els.profilePhotoToggle.focus({ preventScroll: true });
  }

  els.profilePhotoToggle.addEventListener('click', openPhotoGallery);
  els.photoGalleryClose.addEventListener('click', closePhotoGallery);
  els.profilePhotoMonthBtn.addEventListener('click', function () {
    const opening = els.profilePhotoMonths.hidden;
    if (opening) renderProfilePhotoMonthPicker();
    els.profilePhotoMonths.hidden = !opening;
    els.profilePhotoMonthBtn.setAttribute('aria-expanded', opening ? 'true' : 'false');
  });
  els.profilePhotoMonths.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('.profile-photo-month-chip') : null;
    if (!button) return;
    state.profilePhotoMonth = new Date(state.profilePhotoMonth.getFullYear(), Number(button.dataset.month), 1);
    els.profilePhotoMonths.hidden = true;
    els.profilePhotoMonthBtn.setAttribute('aria-expanded', 'false');
    renderProfilePhotos();
    haptic(5);
  });
  els.profilePhotoPrevMonth.addEventListener('click', function () {
    state.profilePhotoMonth = new Date(state.profilePhotoMonth.getFullYear(), state.profilePhotoMonth.getMonth() - 1, 1);
    els.profilePhotoMonths.hidden = true;
    renderProfilePhotos();
    haptic(5);
  });
  els.profilePhotoNextMonth.addEventListener('click', function () {
    state.profilePhotoMonth = new Date(state.profilePhotoMonth.getFullYear(), state.profilePhotoMonth.getMonth() + 1, 1);
    els.profilePhotoMonths.hidden = true;
    renderProfilePhotos();
    haptic(5);
  });
  els.profileRecent.addEventListener('click', function (event) {
    const row = event.target.closest ? event.target.closest('.profile-recent-row') : null;
    if (!row || !row.dataset.date) return;
    const key = row.dataset.date;
    state.viewDate = startOfMonth(parseDateKey(key));
    setMainView('calendar');
    selectCalendarDate(key);
    haptic(6);
  });
  els.curveTitleBtn.addEventListener('click', openCurveOverview);
  els.curveOverviewBack.addEventListener('click', closeCurveOverview);
  els.curveOverviewPrevYear.addEventListener('click', function () {
    state.curveOverviewYear -= 1;
    renderCurveOverview();
    haptic(5);
  });
  els.curveOverviewNextYear.addEventListener('click', function () {
    state.curveOverviewYear += 1;
    renderCurveOverview();
    haptic(5);
  });
  els.timelineRange.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('button[data-range]') : null;
    if (!button) return;
    state.timelineRange = button.dataset.range;
    renderTimeline();
    persistDataView();
    haptic(5);
  });  els.curveMonthBtn.addEventListener('click', function () {
    if (els.curveMonthBtn.disabled) return;
    if (els.curveMonthPopover.hidden) openCurveMonthPicker();
    else closeCurveMonthPicker();
  });
  els.curveMonthDone.addEventListener('click', closeCurveMonthPicker);
  els.curvePrevYear.addEventListener('click', function () {
    state.curvePickerYear -= 1;
    renderCurveMonthPicker();
    haptic(4);
  });
  els.curveNextYear.addEventListener('click', function () {
    state.curvePickerYear += 1;
    renderCurveMonthPicker();
    haptic(4);
  });
  els.curveMonthGrid.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('.pie-month-chip') : null;
    if (!button) return;
    state.curveDate = new Date(state.curvePickerYear, Number(button.dataset.month), 1);
    state.curveYear = state.curvePickerYear;
    state.curvePeriod = 'month';
    closeCurveMonthPicker();
    renderCurve();
    haptic(5);
  });
  els.piePrevYear.addEventListener('click', function () {
    state.piePickerYear -= 1;
    renderPieMonthPicker();
    haptic(4);
  });
  els.pieNextYear.addEventListener('click', function () {
    state.piePickerYear += 1;
    renderPieMonthPicker();
    haptic(4);
  });
  els.pieRange.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('.pie-range-btn') : null;
    if (!button) return;
    state.pieRange = button.dataset.range;
    closePieMonthPicker();
    renderPartPie();
    persistDataView();
    haptic(5);
  });
  els.pieMonthBtn.addEventListener('click', function () {
    if (els.pieMonthBtn.disabled) return;
    if (els.pieMonthPopover.hidden) openPieMonthPicker();
    else closePieMonthPicker();
  });
  els.pieMonthDone.addEventListener('click', closePieMonthPicker);
  els.pieMonthGrid.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('.pie-month-chip') : null;
    if (!button) return;
    state.pieYear = piePickerYear();
    state.pieMonth = Number(button.dataset.month);
    state.pieRange = 'month';
    closePieMonthPicker();
    renderPartPie();
    persistDataView();
    haptic(5);
  });
  els.curveOverviewGrid.addEventListener('click', function (event) {
    const card = event.target.closest ? event.target.closest('.curve-month-card') : null;
    if (!card) return;
    const year = state.curveOverviewYear;
    state.curveDate = new Date(year, Number(card.dataset.month), 1);
    state.curveYear = year;
    state.curvePeriod = 'month';
    closeCurveOverview();
    haptic(5);
  });
  els.curvePeriodSegment.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('button[data-period]') : null;
    if (!button) return;
    state.curvePeriod = button.dataset.period;
    if (state.curvePeriod === 'year') state.curveYear = state.curveDate.getFullYear();
    renderCurve();
    haptic(5);
  });
  els.curveChart.addEventListener('pointerdown', function (event) {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    state.curveSwipeStart = { x: event.clientX, y: event.clientY };
  });
  els.curveChart.addEventListener('pointerup', function (event) {
    if (!state.curveSwipeStart) return;
    const deltaX = event.clientX - state.curveSwipeStart.x;
    const deltaY = event.clientY - state.curveSwipeStart.y;
    state.curveSwipeStart = null;
    if (Math.abs(deltaX) > 54 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      state.curveSuppressClick = true;
      shiftCurvePeriod(deltaX < 0 ? 1 : -1);
      window.setTimeout(function () { state.curveSuppressClick = false; }, 360);
    }
  });
  els.curveChart.addEventListener('pointercancel', function () { state.curveSwipeStart = null; });
  els.logTodayBtn.addEventListener('click', function () { openSheet(state.detailDateKey); });

  els.calendarGrid.addEventListener('click', function (event) {
    if (state.suppressClick) {
      event.preventDefault();
      return;
    }
    const cell = event.target.closest ? event.target.closest('.day-cell[data-date]') : null;
    if (!cell) return;
    const key = cell.dataset.date;
    const now = Date.now();
    if (state.lastCalendarTap.key === key && now - state.lastCalendarTap.at <= 340) {
      state.lastCalendarTap = { key: '', at: 0 };
      openSheet(key);
      return;
    }
    state.lastCalendarTap = { key: key, at: now };
    els.calendarGrid.querySelectorAll('.day-cell').forEach(function (item) { item.tabIndex = -1; });
    cell.tabIndex = 0;
    selectCalendarDate(key);
  });

  els.calendarGrid.addEventListener('keydown', moveCalendarFocus);

  els.calendarCard.addEventListener('pointerdown', function (event) {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    state.swipeStart = { x: event.clientX, y: event.clientY };
  });

  els.calendarCard.addEventListener('pointerup', function (event) {
    if (!state.swipeStart) return;
    const deltaX = event.clientX - state.swipeStart.x;
    const deltaY = event.clientY - state.swipeStart.y;
    state.swipeStart = null;
    if (Math.abs(deltaX) > 54 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      state.suppressClick = true;
      shiftMonth(deltaX < 0 ? 1 : -1);
      window.setTimeout(function () { state.suppressClick = false; }, 350);
    }
  });

  els.calendarCard.addEventListener('pointercancel', function () {
    state.swipeStart = null;
  });

  els.partGrid.addEventListener('click', function (event) {
    const chip = event.target.closest ? event.target.closest('.part-chip') : null;
    if (!chip) return;
    const id = chip.dataset.part;
    if (state.draft.has(id)) state.draft.delete(id);
    else state.draft.add(id);
    chip.setAttribute('aria-pressed', state.draft.has(id) ? 'true' : 'false');
    updateSheetFooter();
    haptic(6);
  });

  els.noteInput.addEventListener('input', function () {
    state.draftNote = els.noteInput.value.slice(0, 300);
    updateSheetFooter();
  });

  els.photoAddBtn.addEventListener('click', function () {
    els.photoInput.click();
  });

  els.photoGrid.addEventListener('click', function (event) {
    const remove = event.target.closest ? event.target.closest('button[data-photo-remove]') : null;
    if (!remove) return;
    removeDraftPhoto(Number(remove.dataset.photoRemove));
  });

  els.photoInput.addEventListener('change', function () {
    handlePhotoFiles(els.photoInput.files);
  });

  els.photoViewerClose.addEventListener('click', closePhotoViewer);
  els.photoViewerPrev.addEventListener('click', function () { stepPhotoViewer(-1); });
  els.photoViewerNext.addEventListener('click', function () { stepPhotoViewer(1); });
  els.photoViewer.addEventListener('click', function (event) {
    if (event.target === els.photoViewer) closePhotoViewer();
  });

  els.poemList.addEventListener('input', function (event) {
    const input = event.target.closest ? event.target.closest('.poem-input') : null;
    if (!input) return;
    const index = Number(input.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= state.poems.length) return;
    let value = input.value.slice(0, 80);
    if (input.value !== value) input.value = value;
    state.poems[index] = value;
    persistPoems();
    renderPoemEntry();
    refreshPoemDisplay();
  });
  els.poemList.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('.poem-delete') : null;
    if (!button) return;
    const index = Number(button.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= state.poems.length) return;
    state.poems.splice(index, 1);
    persistPoems();
    renderPoemSettings();
    renderPoemEntry();
    refreshPoemDisplay();
    haptic(5);
  });
  els.poemAddBtn.addEventListener('click', function () {
    state.poems.push('');
    persistPoems();
    renderPoemSettings();
    renderPoemEntry();
    refreshPoemDisplay();
    window.requestAnimationFrame(function () {
      const inputs = els.poemList.querySelectorAll('.poem-input');
      const last = inputs[inputs.length - 1];
      if (last) {
        last.focus();
        last.scrollIntoView({ block: 'nearest' });
      }
    });
    haptic(4);
  });
  els.poemResetBtn.addEventListener('click', function () {
    state.poems = DEFAULT_POEMS.slice();
    persistPoems();
    renderPoemSettings();
    renderPoemEntry();
    refreshPoemDisplay();
    haptic(5);
  });
  els.poemEditEntry.addEventListener('click', openPoemEditor);
  els.poemEditorClose.addEventListener('click', closePoemEditor);
  els.settingsBtn.addEventListener('click', openSettings);
  els.closeSheet.addEventListener('click', closeActivePanel);
  els.closeSettings.addEventListener('click', closeActivePanel);
  els.closeStats.addEventListener('click', closeActivePanel);
  els.sheetBackdrop.addEventListener('click', closeActivePanel);
  els.saveBtn.addEventListener('click', saveEntry);
  els.clearBtn.addEventListener('click', clearEntry);
  els.monthSummaryBtn.addEventListener('click', openStats);
  els.statsPeriodSegment.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('button[data-period]') : null;
    if (!button) return;
    state.statsPeriod = button.dataset.period;
    renderStats();
    haptic(5);
  });

  els.accentSwatches.addEventListener('click', function (event) {
    const swatch = event.target.closest ? event.target.closest('.swatch') : null;
    if (swatch) changeSetting('accent', swatch.dataset.accent);
  });

  [els.noteColorSwatches, els.imageColorSwatches, els.editorColorSwatches].forEach(function (container) {
    container.addEventListener('click', function (event) {
      const swatch = event.target.closest ? event.target.closest('.dot-swatch') : null;
      if (swatch) changeSetting(swatch.dataset.colorSetting, swatch.dataset.color);
    });
  });

  [els.themeSegment, els.weekSegment, els.markSegment, els.photoQualitySegment, els.fontSizeSegment].forEach(function (group) {
    group.addEventListener('click', function (event) {
      const button = event.target.closest ? event.target.closest('button[data-setting]') : null;
      if (button) changeSetting(button.dataset.setting, button.dataset.value);
    });
  });

  els.weightsToggle.addEventListener('click', function () {
    const open = els.weightEditor.hidden;
    els.weightEditor.hidden = !open;
    els.weightsToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    els.weightsToggle.textContent = open ? '收起' : '调整权重';
    if (open) renderWeightEditor();
  });

  els.weightEditorList.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('button[data-weight-delta]') : null;
    if (!button) return;
    setPartWeight(button.dataset.part, Number(button.dataset.weightDelta));
  });

  els.resetWeights.addEventListener('click', resetWeights);

  els.hapticsSwitch.addEventListener('click', function () {
    changeSetting('haptics', !state.settings.haptics);
  });

  els.partEditBtn.addEventListener('click', function () {
    setPartEditorOpen(els.partEditor.hidden);
  });

  els.partEditorList.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('button[data-part-action]') : null;
    if (!button) return;
    const action = button.dataset.partAction;
    const id = button.dataset.part;
    if (action === 'up') movePart(id, -1);
    else if (action === 'down') movePart(id, 1);
    else if (action === 'delete') deleteCustomPart(id);
  });

  els.partEditorList.addEventListener('change', function (event) {
    const input = event.target.closest ? event.target.closest('.part-name-input') : null;
    if (input) commitPartLabel(input.dataset.part, input.value);
  });

  els.partEditorList.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && event.target.classList.contains('part-name-input')) {
      event.preventDefault();
      event.target.blur();
    }
  });

  els.addPartBtn.addEventListener('click', addCustomPart);

  els.aboutLink.addEventListener('click', openAbout);
  els.aboutClose.addEventListener('click', closeAbout);
  els.aboutGithub.addEventListener('click', function (event) {
    event.preventDefault();
    const url = els.aboutGithub.href;
    if (window.LianjiAndroid && typeof window.LianjiAndroid.openExternal === 'function') {
      window.LianjiAndroid.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener');
    }
  });
  els.resetSettings.addEventListener('click', resetSettings);
  els.exportBackupBtn.addEventListener('click', exportBackup);
  els.importBackupBtn.addEventListener('click', function () { els.importBackupInput.click(); });
  els.importBackupInput.addEventListener('change', function () {
    handleBackupFile(els.importBackupInput.files && els.importBackupInput.files[0]);
  });
  els.clearAllDataBtn.addEventListener('click', clearAllData);

  els.toastAction.addEventListener('click', function () {
    const action = state.toastAction;
    hideToast();
    if (action) action();
  });

  document.addEventListener('keydown', function (event) {
    if (!els.photoViewer.hidden) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePhotoViewer();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stepPhotoViewer(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepPhotoViewer(1);
      }
      return;
    }
    const panel = state.activePanel;
    if (!panel) {
      if (event.key === 'Escape') {
        if (!els.yearView.hidden) {
          event.preventDefault();
          if (!els.yearFilterPopover.hidden) closeYearFilter();
          else closeYearView();
        } else if (!els.curveView.hidden && !els.pieMonthPopover.hidden) {
          event.preventDefault();
          closePieMonthPicker();
        } else if (!els.curveView.hidden && !els.curveOverview.hidden) {
          event.preventDefault();
          closeCurveOverview();
        } else if (!els.curveView.hidden) {
          event.preventDefault();
          setMainView('calendar');
        } else if (!els.photoGallerySheet.hidden) {
          event.preventDefault();
          closePhotoGallery();
        } else if (!els.profileView.hidden) {
          event.preventDefault();
          setMainView('calendar');
        }
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      if (!els.aboutSheet.hidden) closeAbout();
      else closeActivePanel();
      return;
    }

    if (!els.aboutSheet.hidden) {
      if (event.key === 'Tab') {
        event.preventDefault();
        els.aboutClose.focus({ preventScroll: true });
      }
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = Array.from(panel.querySelectorAll('button:not([disabled]):not([hidden]), input:not([disabled])'))
      .filter(function (item) { return item.offsetParent !== null; });
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (document.activeElement === panel) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (!panel.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') updateToday();
  });

  window.addEventListener('storage', function (event) {
    if (event.key === SETTINGS_KEY) {
      state.settings = loadSettings();
      applyAppearance();
      syncSettingsControls();
      renderAll();
      return;
    }
    if (event.key === EXTRAS_KEY) {
      state.extras = loadExtras();
      renderAll();
      return;
    }
    if (event.key !== STORAGE_KEY) return;
    const loaded = loadWorkouts();
    state.workouts = state.isDemo ? Object.assign(buildDemoWorkouts(), loaded) : loaded;
    renderAll();
  });

  if (window.matchMedia) {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onSchemeChange = function () {
      if (state.settings.theme === 'auto') applyAppearance();
    };
    if (typeof darkQuery.addEventListener === 'function') darkQuery.addEventListener('change', onSchemeChange);
    else if (typeof darkQuery.addListener === 'function') darkQuery.addListener(onSchemeChange);
  }

  window.__lianjiBack = function () {
    if (!els.photoViewer.hidden) {
      closePhotoViewer();
      return true;
    }
    if (!els.poemEditorSheet.hidden) {
      closePoemEditor();
      return true;
    }
    if (!els.aboutSheet.hidden) {
      closeAbout();
      return true;
    }
    if (!els.photoGallerySheet.hidden) {
      closePhotoGallery();
      return true;
    }
    if (state.activePanel) {
      closeActivePanel();
      return true;
    }
    if (!els.yearView.hidden) {
      if (!els.yearFilterPopover.hidden) {
        closeYearFilter();
      } else {
        closeYearView();
      }
      return true;
    }
    if (!els.curveView.hidden) {
      if (!els.curveMonthPopover.hidden) closeCurveMonthPicker();
      else if (!els.pieMonthPopover.hidden) closePieMonthPicker();
      else if (!els.curveOverview.hidden) closeCurveOverview();
      else setMainView('calendar');
      return true;
    }
    if (!els.profileView.hidden) {
      setMainView('calendar');
      return true;
    }
    return false;
  };

  function scheduleMidnightRefresh() {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
    window.setTimeout(function () {
      updateToday();
      scheduleMidnightRefresh();
    }, Math.max(1000, nextMidnight.getTime() - now.getTime()));
  }

  renderAccentSwatches();
  renderDotColorSwatches();
  applyAppearance();
  syncSettingsControls();
  renderAll();
  scheduleMidnightRefresh();

  if (params.get('action') === 'today') {
    state.detailDateKey = dateKey(new Date());
    renderAll();
  }

  migrateLegacyPhotos().catch(function () {});
  updateStorageUsage();

  if ('serviceWorker' in navigator && /^https?:$/.test(window.location.protocol) && !window.LianjiAndroid) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    });
  }
})();
