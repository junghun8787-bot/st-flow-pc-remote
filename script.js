// ==========================================
// 1. APP STATE, I18N & VARIABLES
// ==========================================
const STORAGE_KEY = "samsung_timer_v44_ARCHITECTURE"; // ST Flow 2로 완전 초기화 원할 시 "ST_FLOW_2_ARCHITECTURE" 로 변경
let DESK_COUNT = 10; 
let timers = [];
let audioCtx = null; 

let draggedName = null; 
let draggedFromIndex = null; 
let draggedFromAbsent = false;
let draggedNameForList = null; 

let attendanceMap = new Map(); 
let finishedSet = new Set(); 
let finishedTimerSnapshot = {}; // 수업완료 시 타이머 상태 보존 (복귀·시간 연장용)
let absentSet = new Set(); // ⭐ 결석 및 휴원 학생 관리용 Set 추가
let assignOrderCounter = 0; 

let studentMasterList = []; 
let studentLevels = {}; 
let studentGrades = {}; 
let studentTimes = {}; 
let studentModifiers = {}; 

let studentHistory = {}; 
let deskSeatLog = {}; // 날짜별 책상 이용 기록 { "YYYY-MM-DD": [{ deskIdx, student, start, end, status }] }
let academyHolidays = [];
let studentRegularOffs = {}; // ⭐ 매주 정규 휴무 요일 저장 { "학생이름": [0, 1] } (0=일, 1=월...)

let customStudentOrder = []; 
let guestList = [];
let guestGrades = {}; // 게스트 학년 (명단과 별도 저장)

const NAME_COLOR_MAP = {
    dark: { color: '#0f172a', shadow: 'none' },
    white: { color: '#ffffff', shadow: '0 1px 4px rgba(0,0,0,0.45)' },
    black: { color: '#000000', shadow: '1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff' },
    yellow: { color: '#facc15', shadow: '0 0 10px rgba(250,204,21,0.55)' },
    pink: { color: '#f9a8d4', shadow: '0 0 8px rgba(249,168,212,0.45)' },
    cyan: { color: '#67e8f9', shadow: '0 0 8px rgba(103,232,249,0.45)' },
    green: { color: '#6ee7b7', shadow: '0 0 8px rgba(110,231,183,0.45)' },
    orange: { color: '#fb923c', shadow: '0 0 8px rgba(251,146,60,0.45)' },
    purple: { color: '#c4b5fd', shadow: '0 0 8px rgba(196,181,253,0.45)' },
    gold: { color: '#fbbf24', shadow: '0 0 10px rgba(251,191,36,0.55)' }
};

const REMOTE_CODE_DEFAULTS = ["7893409", "8965601", "5141409", "7498145", "7441889", "7144865", "10551201", "8559585", "8189857", "2677665"];
const REMOTE_BUFFER_MS = 1200;
const STORAGE_SAVE_DEBOUNCE_MS = 2000;
let saveToStorageTimer = null;
let storageSaveFailedShown = false;

let dayClosedDate = null;
let operationalDate = null; 

let academyName = "향촌삼성영어학원"; 
let className = "Maple Classroom";

const ALARM_GRACE_SECONDS = 600;
const DEFAULT_WEEKLY_MINUTES = 250;
const MEMO_POPUP_DURATION_MS = 5000;
const activeMemoPopups = new Map();

let alarmVolume = 0.5; 
let ttsVolume = 0.8; 
let uiVolume = 0.5; 
let currentTheme = "1";
let currentLang = 'ko'; 
let currentFontFamily = "'Pretendard', sans-serif"; 

let rosterViewMode = 'card';
/** 수업중 책상 UI: integrated=타이머 결합 | pill=간단 알약 카드 */
let activeDeskUIMode = 'integrated';
let listSortConfig = { col: 'level', asc: true };
let waitSortConfig = { col: 'custom', asc: true };

/** 조작 방식: auto = 터치 기기는 탭, PC는 드래그 | drag | tap */
let interactionMode = 'auto';
let tapSelectedName = null; 

// ⭐ 리모컨 번호를 저장할 배열 (책상 수에 맞춰 ensureDeskRemoteCodesLength로 확장)
let deskRemoteCodes = [...REMOTE_CODE_DEFAULTS];

// ⭐ 미니게임 상태 변수 
let isRouletteMode = true;
let rouletteAngle = 0;
let rouletteSpinning = false;
let roulettePlayers = [];

let ladderPlayers = [];
let ladderRungs = [];
let targetWinnerIndex = -1;
let animReq;
let isResultRevealed = false; 
let isGameAnimating = false;
const ladderColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1', '#14b8a6', '#d946ef', '#eab308', '#0ea5e9', '#f43f5e'];
let isBgmOn = true;
let ladderBgmTimer = null;

// 달력 상태 관리
let currentHistoryStudent = null;
let currentHistoryYear = new Date().getFullYear();
let currentHistoryMonth = new Date().getMonth(); 
let currentSelectedDate = null;

// ⭐ 주간/일일 뷰 및 사이드바 상태 관리
let historyViewMode = 'monthly'; 
let currentWeeklyDate = new Date();
let weeklySortConfig = { col: 'name', asc: true }; 
let historySidebarSortConfig = { col: 'name', asc: true }; 
let statsPeriodMode = 'weekly';
let statsChartMode = 'rate';
let currentStatsMonth = new Date().getMonth();
let currentStatsYear = new Date().getFullYear();
let timerLastPersistAt = 0;
const TIMER_PERSIST_INTERVAL_MS = 8000;

const krHolidays = {
    "01-01":"신정", "03-01":"삼일절", "05-05":"어린이날", "06-06":"현충일", "08-15":"광복절", "10-03":"개천절", "10-09":"한글날", "12-25":"기독탄신일",
    "2024-02-09":"설연휴", "2024-02-10":"설날", "2024-02-11":"설연휴", "2024-02-12":"대체공휴일", "2024-04-10":"국회의원선거", "2024-05-06":"대체공휴일", "2024-05-15":"부처님오신날", "2024-09-16":"추석연휴", "2024-09-17":"추석", "2024-09-18":"추석연휴",
    "2025-01-28":"설연휴", "2025-01-29":"설날", "2025-01-30":"설연휴", "2025-03-03":"대체공휴일", "2025-05-05":"부처님오신날", "2025-05-06":"대체공휴일", "2025-10-05":"추석연휴", "2025-10-06":"추석", "2025-10-07":"추석연휴", "2025-10-08":"대체공휴일",
    "2026-02-16":"설연휴", "2026-02-17":"설날", "2026-02-18":"설연휴", "2026-03-02":"대체공휴일", "2026-05-24":"부처님오신날", "2026-05-25":"대체공휴일", "2026-06-03":"지방선거", "2026-08-17":"대체공휴일", "2026-09-24":"추석연휴", "2026-09-25":"추석", "2026-09-26":"추석연휴"
};

const i18n = {
    ko: { interactionMode: "👆 명단 조작 방식", interactionAuto: "자동 (태블릿=탭 배정, PC=드래그)", interactionDrag: "드래그 (PC 방식)", interactionTap: "탭 배정 (태블릿·터치)", tapHintIdle: "학생 카드를 탭해 선택한 뒤, 자리·영역을 탭하세요", tapHintSelected: "선택됨 — 자리·대기·휴원 영역을 탭하세요 (다시 탭하면 해제)", nav1: "투데이 플로우", nav2: "타이머", nav3: "학생 기록", nav4: "설정", nav5: "미니 게임", rosterMgt: "학생 명단 관리", waitSortLabel: "정렬", waitSortCustom: "기본", waitSortName: "이름", waitSortGrade: "학년", waitSortLevel: "레벨", dsWaiting: "⏳ 등원 대기 학생들", dsAttended: "✔️ 출석 학생들", dsOffAbsent: "🚫 휴원 또는 결석 학생들", endClassDay: "수업종료", saveRoster: "💾 명단 저장하기", placeholder: "이름 입력", acadInfo: "학원 정보 및 디스플레이", acadName: "학원 이름", className: "반 이름", timerCount: "⏱️ 타이머 개수 설정", colorTheme: "색상 테마 (30종)", nameColor: "이름 색상 (10종)", audioSetup: "오디오 및 효과음 설정", alarmMelody: "알람 멜로디", uiSound: "UI 클릭음", ttsVoice: "🗣️ TTS 음성 안내", volAlarm: "🔊 알람 볼륨", volTTS: "🗣️ 음성 볼륨", volUI: "🖱️ 클릭 볼륨", sysCtrl: "시스템 백업 및 초기화", backupCreate: "📦 백업 파일 저장 (.json)", backupRestore: "📂 백업 파일 불러오기 (.json)", softReset: "🔄 타이머 및 로그 초기화", hardReset: "⚠️ 모든 설정 공장 초기화", btnStart: "시작", btnStop: "정지", btnCancel: "취소", btnFinish: "수업 완료", btnClear: "초기화", statusAssign: "✔ 자리배정", statusPlaying: "▶️ 수업 중", statusTimeUp: "🔔 시간 종료", statusFinish: "🏁 완료", quickStart: "▶️ 시작", quickFinish: "🏁 종료", grpWait: "⏳ 오늘 등원 대기 명단", grpActive: "▶️ 수업 중 (진행중)", grpFinish: "🏁 수업 완료 (종료됨)", emptyDesk: "빈 책상", langText: "🌐 Language / 언어", days: ['일', '월', '화', '수', '목', '금', '토'], alertSoft: "타이머 기록과 출결 로그만 초기화합니다.\n진행하시겠습니까?", alertHard: "⚠️ 경고 ⚠️\n모든 설정이 초기화됩니다.\n정말 공장 초기화하시겠습니까?", alertResetDone: "기록이 리셋되었습니다.", alertFactoryDone: "초기화 완료.", alertBackupDone: "복구 완료!", alertBackupFail: "백업 파일이 유효하지 않습니다.", dashTitle: "📋 현황판", dashTotal: "전체", dashWait: "대기", dashActive: "수업 중", dashFinish: "종료", dashAbsent: "휴원/결석" },
    en: { interactionMode: "👆 Roster control", interactionAuto: "Auto (tablet=tap, PC=drag)", interactionDrag: "Drag (desktop)", interactionTap: "Tap to assign (touch)", tapHintIdle: "Tap a student, then tap a seat or zone", tapHintSelected: "Selected — tap seat/wait/absent zone (tap again to cancel)", nav1: "Today Flow", nav2: "TIMER", nav3: "HISTORY", nav4: "SETTING", nav5: "MINI GAME", rosterMgt: "ROSTER MANAGEMENT", waitSortLabel: "Sort", waitSortCustom: "Default", waitSortName: "Name", waitSortGrade: "Grade", waitSortLevel: "Level", dsWaiting: "⏳ Waiting List", dsAttended: "✔️ Attended", dsOffAbsent: "🚫 Off / Absent", endClassDay: "End Class", saveRoster: "💾 SAVE ROSTER DATA", placeholder: "Name", acadInfo: "ACADEMY INFO & DISPLAY", acadName: "Academy Name", className: "Class Name", timerCount: "⏱️ Timer Dashboard Count", colorTheme: "Color Theme (30 Colors)", nameColor: "Name Color", audioSetup: "AUDIO SETUP", alarmMelody: "Alarm Melody", uiSound: "UI Click Sound", ttsVoice: "🗣️ TTS Voice Assistant", volAlarm: "🔊 Alarm Volume", volTTS: "🗣️ Voice Volume", volUI: "🖱️ Click Volume", sysCtrl: "SYSTEM CONTROL", backupCreate: "📦 CREATE BACKUP (.json)", backupRestore: "📂 RESTORE BACKUP (.json)", softReset: "🔄 Soft Reset (Timers & Logs)", hardReset: "⚠️ Hard Reset (Factory Reset)", btnStart: "START", btnStop: "STOP", btnCancel: "CANCEL", btnFinish: "FINISH LESSON", btnClear: "CLR", statusAssign: "✔ Assigned", statusPlaying: "▶️ Playing", statusTimeUp: "🔔 Time Up", statusFinish: "🏁 Finished", quickStart: "▶️ START", quickFinish: "🏁 FINISH", grpWait: "⏳ Waiting List", grpActive: "▶️ In Class", grpFinish: "🏁 FINISHED", emptyDesk: "Empty Desk", langText: "🌐 Language / 언어", days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], alertSoft: "This will reset timers and logs only.\nProceed?", alertHard: "⚠️ WARNING ⚠️\nAll settings will be reset.\nAre you sure?", alertResetDone: "Reset completed.", alertFactoryDone: "Factory reset complete.", alertBackupDone: "Restore completed!", alertBackupFail: "Invalid backup file.", dashTitle: "📋 Dashboard", dashTotal: "Total", dashWait: "Wait", dashActive: "Active", dashFinish: "Done", dashAbsent: "Off/Absent" }
};

// ==========================================
// 2. 디자인 요소 (CSS 동적 주입)
// ==========================================
const customStyle = document.createElement('style');
customStyle.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@600;900&family=Gowun+Dodum&family=Jua&family=Do+Hyeon&family=Noto+Serif+KR:wght@600;900&display=swap');
    @font-face { font-family: 'GmarketSans'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff'); font-weight: 700; font-style: normal; }
    @font-face { font-family: 'SUIT'; src: url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT-Bold.woff2') format('woff2'); font-weight: 700; font-style: normal; }
    @font-face { font-family: 'Cafe24Ssurround'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Cafe24Ssurround.woff') format('woff'); font-weight: normal; font-style: normal; }
    @font-face { font-family: 'Hahmlet'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2110@1.0/Hahmlet-Bold.woff2') format('woff2'); font-weight: 700; font-style: normal; }

    body { font-family: var(--app-font, 'Pretendard', sans-serif); }
    .student-btn, .info-panel { touch-action: none !important; }

    .mod-badge-container { display:flex; gap:6px; justify-content:center; align-items:center; margin-bottom:6px; flex-wrap:wrap; z-index:10; }
    .mod-badge { font-size:12px; font-weight:900; padding:4px 8px; border-radius:6px; cursor:pointer; font-family:'Pretendard'; box-shadow:0 2px 4px rgba(0,0,0,0.15); transition:0.2s; white-space:nowrap; }
    .mod-badge:hover { transform:scale(1.1); text-decoration:line-through; opacity:0.8; }
    .mod-badge.coupon { background:#f59e0b; color:#fff; border:1px solid #d97706; }
    .mod-badge.penalty { background:#ef4444; color:#fff; border:1px solid #b91c1c; }
    .mod-badge.warn { background:#fb923c; color:#fff; border:1px solid #ea580c; }
    .card-mod-container { position:absolute; bottom:12px; left:12px; display:flex; flex-direction:column; gap:6px; z-index:10; }
    #grid-finished .student-btn.finished { opacity: 0.5; pointer-events: none; }

    /* ⭐ 설정창 테이블 정렬 기능 추가 CSS */
    .settings-roster-table { width: 100%; border-collapse: collapse; min-width: 650px; font-family: 'Pretendard', sans-serif; }
    .settings-roster-table th { background: var(--bg-main); padding: 10px; font-weight: 900; color: var(--text-main); border-bottom: 2px solid var(--border); text-align: center; font-size: 15px; }
    .settings-roster-table th.sortable:hover { color: var(--accent); cursor: pointer; }
    .settings-roster-table th.sort-asc::after { content: " ▲"; font-size: 11px; color: var(--accent); }
    .settings-roster-table th.sort-desc::after { content: " ▼"; font-size: 11px; color: var(--accent); }
    .settings-roster-table td { padding: 4px 6px; border-bottom: 1px solid var(--border); text-align: center; vertical-align: middle; }
    .settings-roster-input { width: 100%; padding: 10px 8px; border: 2px solid var(--border); border-radius: 8px; font-family: 'Pretendard', sans-serif; font-weight: 800; text-align: center; font-size: 16px; box-sizing: border-box; transition: 0.2s; }
    .settings-roster-input:focus { outline: none; border-color: var(--accent); background: #eff6ff; }
    .settings-roster-select { width: 100%; padding: 10px 8px; border: 2px solid var(--border); border-radius: 8px; font-family: 'Pretendard', sans-serif; font-weight: 900; text-align: center; font-size: 15px; box-sizing: border-box; cursor: pointer; transition: 0.2s; }
    .btn-delete-row { background: var(--brand-danger); color: white; border: none; border-radius: 8px; padding: 10px 12px; cursor: pointer; font-weight: 900; font-size: 14px; box-shadow: var(--shadow-btn); transition: 0.2s; white-space: nowrap; }
    .btn-delete-row:hover { transform: scale(1.05); }

    /* ⭐ 뱃지(레벨/학년) 그룹 레이아웃 */
    .card-badge-group { position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px; z-index: 5; pointer-events: none; }
    .new-level-pill { font-size: 13px; font-weight: 900; padding: 4px 10px; border-radius: 8px; font-family: 'Montserrat', 'Pretendard', sans-serif; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: inline-block; }
    .card-grade-badge { font-size: 13px !important; font-weight: 800; color: var(--text-muted); background: rgba(255,255,255,0.9); padding: 4px 10px; border-radius: 8px; font-family: 'Pretendard', sans-serif !important; letter-spacing: 0.5px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .level-color-PRE { background: var(--selena-yellow); color: #000; } .level-color-BASIC { background: var(--selena-pink); color: #fff; } .level-color-INTER { background: var(--selena-orange); color: #fff; } .level-color-ADV { background: var(--selena-cyan); color: #fff; } .level-color-PREP { background: var(--selena-brown); color: #fff; } .level-color-GUEST { background: #94a3b8; color: #fff; }

    #mainHeader { position: relative; }
    .header-dashboard-box { position: absolute; left: 14px; top: 56%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: stretch; gap: 6px; background: rgba(255, 255, 255, 0.92); border: 2px solid var(--border, #e2e8f0); padding: 10px 14px; border-radius: 14px; box-shadow: 0 3px 10px rgba(0,0,0,0.07); backdrop-filter: blur(8px); z-index: 100; font-family: 'Pretendard', sans-serif; max-width: 520px; min-width: 360px; box-sizing: border-box; }
    .hd-top-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
    .hd-academy-name { font-size: 14px; font-weight: 800; color: var(--text-muted, #64748b); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; letter-spacing: -0.2px; }
    .hd-date-display { font-size: 14px; font-weight: 700; color: var(--text-muted, #64748b); white-space: nowrap; flex-shrink: 0; letter-spacing: -0.2px; }
    .hd-dashboard-row { display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; }
    .hd-title { font-size: 15px; font-weight: 900; color: var(--accent); white-space: nowrap; padding-right: 8px; border-right: 2px solid var(--border); flex-shrink: 0; }
    .hd-items-container { display: flex; gap: 4px; flex-wrap: nowrap; flex: 1; min-width: 0; }
    .hd-item { display: flex; align-items: baseline; gap: 4px; background: #ffffff; border-radius: 8px; padding: 4px 8px; min-width: 0; justify-content: center; flex-shrink: 0; }
    .hd-label { font-size: 13px; font-weight: 800; opacity: 0.75; color: var(--text-main, #334155); white-space: nowrap; }
    .hd-count { font-size: 20px; font-weight: 900; color: var(--text-main, #0f172a); letter-spacing: -0.5px; }
    .hd-item.hd-wait { background: #fffbeb; } .hd-item.hd-wait .hd-count { color: #d97706; }
    .hd-item.hd-active { background: #eff6ff; } .hd-item.hd-active .hd-count { color: #2563eb; }
    .hd-item.hd-finish { background: #f0fdf4; } .hd-item.hd-finish .hd-count { color: #16a34a; }
    .hd-item.hd-absent { background: #f1f5f9; } .hd-item.hd-absent .hd-count { color: #64748b; }

    .start-time-badge { position: absolute; top: 6px; right: 6px; background: #2563eb; border: 2px solid #60a5fa; color: white; font-size: 14px; font-weight: 900; padding: 6px 10px; border-radius: 8px; cursor: pointer; z-index: 10; box-shadow: 0 4px 8px rgba(0,0,0,0.4); transition: background 0.2s, transform 0.1s; }
    .start-time-badge:hover { background: #1d4ed8; transform: scale(1.05); }

    /* ⭐ 명단창(Roster) 3단 레이아웃 */
    .custom-roster-layout { display: grid !important; grid-template-columns: 420px 1fr !important; grid-template-rows: minmax(0, 1fr) minmax(240px, 34vh) !important; gap: 12px !important; align-items: stretch !important; max-width: 100% !important; min-height: calc(100vh - 120px) !important; max-height: none !important; padding: 8px 4px 20px 4px; overflow: visible !important; box-sizing: border-box; }
    .custom-roster-layout .roster-column { min-height: 0 !important; padding: 12px 16px 18px 16px !important; box-sizing: border-box; overflow: visible !important; }
    .custom-col-wait { grid-column: 1 / 2 !important; grid-row: 1 / 3 !important; max-width: 420px !important; width: 100% !important; height: 100%; min-height: 0; max-height: none; display: flex; flex-direction: column; overflow: visible !important; margin: 0 !important; flex: none !important; }
    .custom-col-active { grid-column: 2 / 3 !important; grid-row: 1 / 2 !important; width: 100% !important; max-width: 100% !important; flex: none !important; margin: 0 !important; overflow: visible !important; min-height: 0; }
    .custom-col-finish { grid-column: 2 / 3 !important; grid-row: 2 / 3 !important; width: 100% !important; max-width: 100% !important; flex: none !important; margin: 0 !important; min-height: 240px !important; max-height: none !important; overflow: visible !important; background: rgba(248, 250, 252, 0.92) !important; border-radius: 16px !important; box-shadow: var(--shadow-pop), inset 0 1px 0 rgba(255,255,255,0.8); border: 2px solid rgba(255,255,255,0.5); display: flex !important; flex-direction: column !important; }
    .custom-col-finish #bottom-split-container { flex: 1; min-height: 0; }
    .custom-col-active .group-title, .custom-col-finish .group-title { margin-bottom: 8px !important; padding-bottom: 8px !important; font-size: 18px !important; }

    .custom-col-wait .guest-input-container { flex-shrink: 0; margin-bottom: 8px; }
    .custom-col-wait .group-title { flex-shrink: 0; }
    .wait-sort-bar { display: flex; align-items: center; gap: 4px; flex-shrink: 0; margin-bottom: 8px; padding: 6px 8px; background: rgba(255,255,255,0.7); border-radius: 10px; border: 1px solid var(--border); }
    .wait-sort-label { font-size: 12px; font-weight: 900; color: var(--text-muted); margin-right: 4px; white-space: nowrap; }
    .wait-sort-th { cursor: pointer; font-size: 12px; font-weight: 900; color: var(--text-muted); transition: 0.2s; user-select: none; padding: 4px 8px; border-radius: 6px; flex: 1; text-align: center; }
    .wait-sort-th:hover { color: var(--accent); background: rgba(59,130,246,0.08); }
    .wait-sort-th.sort-asc::after { content: " ▲"; font-size: 10px; color: var(--accent); }
    .wait-sort-th.sort-desc::after { content: " ▼"; font-size: 10px; color: var(--accent); }
    .wait-sort-th.active-sort { color: var(--accent); background: rgba(59,130,246,0.1); }
    #grid-unassigned { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; flex: 1 1 0 !important; min-height: 0 !important; overflow-y: auto !important; overflow-x: hidden; padding-right: 5px; align-content: flex-start; margin: 0 !important; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
    #grid-unassigned::-webkit-scrollbar { width: 8px; }
    #grid-unassigned::-webkit-scrollbar-track { background: transparent; }
    #grid-unassigned::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
    #grid-absent::-webkit-scrollbar, #grid-finished::-webkit-scrollbar { width: 8px; }
    #grid-absent::-webkit-scrollbar-thumb, #grid-finished::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
    
    #grid-unassigned .student-btn.wait-student-card { width: 100% !important; height: 68px !important; min-height: 68px !important; padding: 8px 12px 8px 10px !important; display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: flex-start !important; gap: 14px !important; border-radius: 14px !important; flex-shrink: 0; margin: 0 !important; overflow: hidden !important; border: 3px solid transparent !important; color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.12) !important; filter: none !important; opacity: 1 !important; transition: transform 0.2s, box-shadow 0.2s, filter 0.2s !important; font-family: var(--app-font, 'Pretendard', sans-serif); }
    #grid-unassigned .student-btn.wait-student-card:hover { transform: translateY(-2px) !important; filter: brightness(1.02) !important; box-shadow: 0 6px 18px rgba(0,0,0,0.1) !important; }
    #grid-unassigned .student-btn.wait-student-card:active { transform: translateY(0) scale(0.98) !important; }
    #grid-unassigned .student-btn.wait-student-card.drag-over { transform: scale(1.03) !important; outline: 3px solid rgba(255,255,255,0.75) !important; outline-offset: 1px !important; z-index: 10 !important; }
    #grid-unassigned .student-btn.wait-student-card.wait-lvl-PRE { background: linear-gradient(145deg, #fffbeb, #fef3c7) !important; border-color: #fde68a !important; box-shadow: 0 3px 10px rgba(250, 204, 21, 0.14) !important; color: #92400e; }
    #grid-unassigned .student-btn.wait-student-card.wait-lvl-BASIC { background: linear-gradient(145deg, #fdf2f8, #fce7f3) !important; border-color: #f9a8d4 !important; box-shadow: 0 3px 10px rgba(244, 114, 182, 0.14) !important; color: #9d174d; }
    #grid-unassigned .student-btn.wait-student-card.wait-lvl-INTER { background: linear-gradient(145deg, #fff7ed, #ffedd5) !important; border-color: #fdba74 !important; box-shadow: 0 3px 10px rgba(251, 146, 60, 0.14) !important; color: #9a3412; }
    #grid-unassigned .student-btn.wait-student-card.wait-lvl-ADV { background: linear-gradient(145deg, #f0f9ff, #e0f2fe) !important; border-color: #7dd3fc !important; box-shadow: 0 3px 10px rgba(56, 189, 248, 0.14) !important; color: #075985; }
    #grid-unassigned .student-btn.wait-student-card.wait-lvl-PREP { background: linear-gradient(145deg, #faf5f2, #efebe9) !important; border-color: #d7ccc8 !important; box-shadow: 0 3px 10px rgba(161, 136, 127, 0.14) !important; color: #5d4037; }
    #grid-unassigned .student-btn.wait-student-card.wait-lvl-GUEST { background: linear-gradient(145deg, #f8fafc, #f1f5f9) !important; border-color: #cbd5e1 !important; box-shadow: 0 3px 10px rgba(148, 163, 184, 0.14) !important; color: #475569; }
    #grid-unassigned .student-btn.wait-student-card .gauge-bg { display: none !important; }
    #grid-unassigned .student-btn.wait-student-card .card-badge-group { position: relative !important; top: 0 !important; left: 0 !important; margin: 0 !important; display: flex !important; flex-direction: column !important; align-items: center !important; gap: 0 !important; flex-shrink: 0; width: 38px; min-width: 38px; }
    #grid-unassigned .student-btn.wait-student-card .new-level-pill { width: 38px !important; height: 38px !important; padding: 0 !important; margin: 0 !important; border-radius: 10px !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 10px !important; font-weight: 900 !important; font-family: 'Montserrat', 'Pretendard', sans-serif !important; letter-spacing: -0.02em !important; line-height: 1 !important; background: rgba(255,255,255,0.55) !important; border: 2px solid rgba(255,255,255,0.75) !important; color: inherit !important; box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important; text-shadow: none !important; -webkit-font-smoothing: antialiased; }
    #grid-unassigned .student-btn.wait-student-card .card-grade-badge { display: none !important; }
    #grid-unassigned .student-btn.wait-student-card .wait-name-wrap { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding-left: 6px; }
    #grid-unassigned .student-btn.wait-student-card .name-text { margin: 0 !important; font-size: 28px !important; font-weight: 900 !important; font-family: var(--app-font, 'Pretendard', sans-serif) !important; flex: none; width: 100%; text-align: left; padding: 0 !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; color: var(--custom-name-color) !important; text-shadow: var(--custom-name-shadow) !important; letter-spacing: 1px !important; line-height: 1.1 !important; -webkit-font-smoothing: antialiased; transition: color 0.3s, text-shadow 0.3s; }
    #grid-unassigned .student-btn.wait-student-card .card-mod-container { position: relative !important; bottom: 0 !important; left: 0 !important; flex-direction: row !important; flex-shrink: 0; margin-right: 0; gap: 4px; }
    #grid-unassigned .student-btn.wait-student-card .mod-badge { padding: 3px 5px !important; font-size: 10px !important; }
    #grid-unassigned .student-btn.wait-student-card .quick-controls { position: absolute !important; right: 6px !important; top: 50% !important; transform: translateY(-50%) !important; width: auto !important; height: auto !important; background: rgba(255,255,255,0.96) !important; flex-direction: row !important; gap: 4px !important; padding: 4px !important; border-radius: 10px !important; opacity: 0; transition: opacity 0.2s; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.18); border: 1px solid rgba(148, 163, 184, 0.3); z-index: 20; }
    #grid-unassigned .student-btn.wait-student-card:hover .quick-controls { opacity: 1; }
    #grid-unassigned .student-btn.wait-student-card .quick-btn { padding: 6px 10px !important; font-size: 13px !important; }

    #grid-active { display: grid !important; grid-template-columns: repeat(5, 1fr) !important; gap: 10px !important; margin: 0 !important; align-content: start !important; }
    body.roster-desk-pill #grid-active .roster-desk-slot:not(.slot-waiting-match) { height: clamp(178px, calc((100vh - 310px) / 2), 196px) !important; min-height: 178px !important; max-height: 196px !important; }
    body.roster-desk-integrated #grid-active .roster-desk-slot:not(.slot-waiting-match):not(.has-student) { height: clamp(260px, calc((100vh - 260px) / 2), 320px) !important; min-height: 260px !important; max-height: 320px !important; }
    .roster-desk-slot { height: clamp(260px, calc((100vh - 260px) / 2), 320px) !important; min-height: 260px !important; max-height: 320px !important; }
    .roster-desk-slot.slot-waiting-match { min-height: 168px !important; height: 168px !important; max-height: 172px !important; }
    .roster-desk-slot.slot-waiting-match .roster-waiting-text { font-size: 14px; line-height: 1.25; margin-bottom: 6px; flex-shrink: 0; }
    .roster-desk-slot.slot-waiting-match .roster-placeholder { padding: 4px 2px; box-sizing: border-box; }
    /* 투데이 플로우 수업중 — 단일 통합 칸 */
    .roster-desk-slot.has-student { height: auto !important; min-height: 0 !important; max-height: none !important; display: flex !important; flex-direction: column !important; align-items: stretch !important; justify-content: stretch !important; padding: 0 !important; overflow: hidden !important; border-style: solid !important; border-width: 2px !important; background: transparent !important; border-radius: 16px !important; transition: border-color 0.25s, box-shadow 0.25s; }
    body.roster-desk-integrated #grid-active .roster-desk-slot.has-student { height: clamp(260px, calc((100vh - 260px) / 2), 320px) !important; min-height: clamp(260px, calc((100vh - 260px) / 2), 320px) !important; max-height: clamp(260px, calc((100vh - 260px) / 2), 320px) !important; }
    .roster-desk-slot.has-student.rdp-paused { border-color: #94a3b8 !important; box-shadow: 0 2px 10px rgba(100,116,139,0.12); }
    .roster-desk-slot.has-student.rdp-over { border-color: var(--brand-danger) !important; box-shadow: 0 4px 18px rgba(239,68,68,0.2); animation: modern-alarm-glow 1.2s infinite cubic-bezier(0.4, 0, 0.2, 1) !important; }
    @keyframes rdp-neon-breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.88; } }
    .roster-desk-slot.has-student.rdp-playing.rdp-lvl-PRE { border-color: #e6c200 !important; box-shadow: 0 0 8px rgba(255,215,0,0.7), 0 0 22px rgba(255,215,0,0.48), 0 0 40px rgba(255,215,0,0.28) !important; animation: rdp-neon-breathe 2.4s ease-in-out infinite; }
    .roster-desk-slot.has-student.rdp-playing.rdp-lvl-BASIC { border-color: #ff00a3 !important; box-shadow: 0 0 8px rgba(255,0,163,0.65), 0 0 22px rgba(255,0,163,0.45), 0 0 40px rgba(255,0,163,0.26) !important; animation: rdp-neon-breathe 2.4s ease-in-out infinite; }
    .roster-desk-slot.has-student.rdp-playing.rdp-lvl-INTER { border-color: #f0701f !important; box-shadow: 0 0 8px rgba(240,112,31,0.68), 0 0 22px rgba(240,112,31,0.46), 0 0 40px rgba(240,112,31,0.27) !important; animation: rdp-neon-breathe 2.4s ease-in-out infinite; }
    .roster-desk-slot.has-student.rdp-playing.rdp-lvl-ADV { border-color: #21c7fa !important; box-shadow: 0 0 8px rgba(33,199,250,0.68), 0 0 22px rgba(33,199,250,0.46), 0 0 40px rgba(33,199,250,0.27) !important; animation: rdp-neon-breathe 2.4s ease-in-out infinite; }
    .roster-desk-slot.has-student.rdp-playing.rdp-lvl-PREP { border-color: #8d6e63 !important; box-shadow: 0 0 8px rgba(121,85,72,0.62), 0 0 22px rgba(121,85,72,0.42), 0 0 40px rgba(121,85,72,0.24) !important; animation: rdp-neon-breathe 2.4s ease-in-out infinite; }
    .roster-desk-slot.has-student.rdp-playing.rdp-lvl-GUEST { border-color: #94a3b8 !important; box-shadow: 0 0 8px rgba(148,163,184,0.58), 0 0 22px rgba(148,163,184,0.38), 0 0 40px rgba(148,163,184,0.22) !important; animation: rdp-neon-breathe 2.4s ease-in-out infinite; }
    .roster-desk-slot.has-student.rdp-playing:not([class*="rdp-lvl-"]) { border-color: #3b82f6 !important; box-shadow: 0 4px 18px rgba(59,130,246,0.18); }
    #grid-active .roster-desk-slot.has-student .student-btn.active-desk-card { width: 100% !important; height: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 4px 9px 8px !important; position: relative !important; top: auto !important; left: auto !important; display: flex !important; flex-direction: column !important; align-items: stretch !important; justify-content: space-between !important; gap: 2px !important; border-radius: 14px !important; border: none !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.45) !important; overflow: hidden !important; cursor: grab; animation: none !important; transform: none !important; flex: 1; box-sizing: border-box; transition: background 0.4s ease, box-shadow 0.3s ease; }
    #grid-active .roster-desk-slot.has-student.rdp-playing.rdp-lvl-PRE .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(255,215,0,0.48) 0%, rgba(255,215,0,0.22) 50%, rgba(255,248,210,0.32) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-playing.rdp-lvl-BASIC .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(255,0,163,0.38) 0%, rgba(255,0,163,0.16) 50%, rgba(255,220,245,0.28) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-playing.rdp-lvl-INTER .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(240,112,31,0.4) 0%, rgba(240,112,31,0.17) 50%, rgba(255,235,215,0.28) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-playing.rdp-lvl-ADV .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(33,199,250,0.42) 0%, rgba(33,199,250,0.18) 50%, rgba(220,245,255,0.3) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-playing.rdp-lvl-PREP .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(121,85,72,0.36) 0%, rgba(121,85,72,0.14) 50%, rgba(245,235,230,0.28) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-playing.rdp-lvl-GUEST .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(148,163,184,0.38) 0%, rgba(148,163,184,0.15) 50%, rgba(241,245,249,0.3) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-playing:not([class*="rdp-lvl-"]) .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.08) 50%, rgba(239,246,255,0.35) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-paused.rdp-lvl-PRE .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(255,215,0,0.32) 0%, rgba(255,215,0,0.1) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-paused.rdp-lvl-BASIC .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(255,0,163,0.26) 0%, rgba(255,0,163,0.07) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-paused.rdp-lvl-INTER .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(240,112,31,0.28) 0%, rgba(240,112,31,0.08) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-paused.rdp-lvl-ADV .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(33,199,250,0.3) 0%, rgba(33,199,250,0.1) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-paused.rdp-lvl-PREP .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(121,85,72,0.24) 0%, rgba(121,85,72,0.07) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-paused.rdp-lvl-GUEST .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(148,163,184,0.28) 0%, rgba(148,163,184,0.08) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-paused:not([class*="rdp-lvl-"]) .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(248,250,252,0.95) 0%, rgba(241,245,249,0.85) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-over .student-btn.active-desk-card { background: linear-gradient(165deg, rgba(254,226,226,0.55) 0%, rgba(255,245,245,0.4) 100%) !important; }
    #grid-active .roster-desk-slot.has-student.rdp-over .student-btn.active-desk-card .adc-name { color: var(--brand-danger) !important; }
    .active-desk-card .adc-header { display: flex; align-items: center; gap: 6px; flex-shrink: 0; width: 100%; padding-top: 8px; }
    .active-desk-card .adc-desk-num { font-family: 'Montserrat', 'Pretendard', sans-serif; font-size: 10px; font-weight: 800; color: var(--text-muted); background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 6px; flex-shrink: 0; letter-spacing: 0.5px; }
    .active-desk-card .adc-name-wrap { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; padding: 12px 4px 6px; }
    .active-desk-card .adc-name { font-size: 24px; font-weight: 900; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--custom-name-color); letter-spacing: 0.08em; min-width: 0; line-height: 1.12; pointer-events: none; font-family: 'GmarketSans', 'SUIT', var(--app-font, 'Pretendard', sans-serif); text-shadow: var(--custom-name-shadow), 0 1px 0 rgba(255,255,255,0.92), 0 2px 0 rgba(203,213,225,0.55), 0 4px 0 rgba(148,163,184,0.28), 0 6px 14px rgba(15,23,42,0.18), 0 -1px 0 rgba(0,0,0,0.06); -webkit-font-smoothing: antialiased; }
    .active-desk-card .adc-top-block { flex-shrink: 0; display: flex; flex-direction: column; width: 100%; }
    .active-desk-card .adc-controls { flex-shrink: 0; display: flex; flex-direction: column; gap: 5px; width: 100%; padding-bottom: 1px; }
    body.roster-desk-pill #grid-active .roster-desk-slot.has-student { height: clamp(178px, calc((100vh - 310px) / 2), 196px) !important; min-height: 178px !important; max-height: 196px !important; padding: 0 !important; border-style: dashed !important; border-width: 3px !important; overflow: hidden !important; }
    body.roster-desk-pill #grid-active .roster-desk-slot.has-student .student-btn.pill-desk-card { width: 100% !important; height: 100% !important; border-radius: 20px !important; position: relative !important; top: auto !important; left: auto !important; display: flex !important; flex-direction: column !important; align-items: stretch !important; justify-content: flex-start !important; padding: 6px 10px 10px !important; gap: 0 !important; box-sizing: border-box !important; animation: none !important; transform: none !important; }
    body.roster-desk-pill #grid-active .student-btn.pill-desk-card.playing { animation: none !important; transform: none !important; border-width: 3px !important; }
    body.roster-desk-pill .pill-desk-card .pill-top-bar { display: flex; justify-content: space-between; align-items: center; width: 100%; flex-shrink: 0; min-height: 30px; padding: 0 2px; position: relative; z-index: 12; }
    body.roster-desk-pill .pill-desk-card .card-cancel-btn { position: static !important; display: flex !important; width: 28px; height: 28px; flex-shrink: 0; margin: 0; }
    body.roster-desk-pill .pill-desk-card .pill-start-time { position: static !important; display: none; font-size: 14px; font-weight: 900; padding: 6px 10px; margin: 0; flex-shrink: 0; cursor: pointer; border-radius: 8px; background: #2563eb; border: 2px solid #60a5fa; color: #fff; font-family: 'Montserrat', 'Pretendard', sans-serif; box-shadow: 0 4px 8px rgba(0,0,0,0.25); font-variant-numeric: tabular-nums; }
    body.roster-desk-pill .pill-desk-card .pill-start-time:hover { background: #1d4ed8; }
    body.roster-desk-pill .pill-desk-card .pill-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 0; padding: 0 6px; }
    body.roster-desk-pill .pill-desk-card .pill-mod-row { display: flex; justify-content: center; align-items: center; gap: 5px; min-height: 24px; max-height: 28px; flex-shrink: 0; margin: 4px 0 0; padding: 0 4px; overflow: hidden; }
    body.roster-desk-pill .pill-desk-card .pill-mod-row:empty { min-height: 0; max-height: 0; margin: 0; visibility: hidden; }
    body.roster-desk-pill .pill-desk-card .pill-mod-row .mod-badge { position: static; font-size: 11px; padding: 3px 8px; margin: 0; box-shadow: 0 1px 4px rgba(0,0,0,0.12); }
    body.roster-desk-pill .pill-desk-card .card-mod-container { display: none !important; }
    body.roster-desk-pill .pill-desk-card .card-badge-group { display: none !important; }
    body.roster-desk-pill .pill-desk-card .status-badge { display: none !important; }
    body.roster-desk-pill .pill-desk-card .name-text { margin: 0 !important; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 44px !important; line-height: 1.06; padding: 0 4px; min-height: 0; width: 100%; }
    body.roster-desk-pill .pill-desk-card.playing .name-text { font-size: 48px !important; }
    body.roster-desk-pill .pill-desk-card.alarm-blink .name-text { font-size: 42px !important; }
    body.roster-desk-pill .pill-desk-card .quick-controls { position: static !important; display: flex !important; width: 100%; padding: 0; margin: 0; flex-shrink: 0; }
    body.roster-desk-pill .pill-desk-card .gauge-bg { display: block !important; border-radius: 20px 0 0 20px; overflow: hidden; transition: width 0.75s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.06); opacity: 0.95; }
    body.roster-desk-pill .pill-desk-card .gauge-bg::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.08) 42%, rgba(0,0,0,0.06) 100%); pointer-events: none; }
    body.roster-desk-pill .pill-desk-card .gauge-bg::after { content: ''; position: absolute; top: 0; right: 0; width: 36px; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55)); pointer-events: none; border-radius: 0 20px 20px 0; }
    body.roster-desk-pill .pill-desk-card.playing .gauge-bg.gauge-active { animation: pill-gauge-shimmer 2.8s ease-in-out infinite; }
    @keyframes pill-gauge-shimmer { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.08); } }
    body.roster-desk-pill .pill-desk-card.level-PRE .gauge-bg { background: linear-gradient(135deg, rgba(255,215,0,0.92) 0%, rgba(234,179,8,0.78) 100%) !important; }
    body.roster-desk-pill .pill-desk-card.level-BASIC .gauge-bg { background: linear-gradient(135deg, rgba(255,0,163,0.82) 0%, rgba(219,39,119,0.72) 100%) !important; }
    body.roster-desk-pill .pill-desk-card.level-INTER .gauge-bg { background: linear-gradient(135deg, rgba(240,112,31,0.84) 0%, rgba(234,88,12,0.74) 100%) !important; }
    body.roster-desk-pill .pill-desk-card.level-ADV .gauge-bg { background: linear-gradient(135deg, rgba(33,199,250,0.86) 0%, rgba(14,165,233,0.76) 100%) !important; }
    body.roster-desk-pill .pill-desk-card.level-PREP .gauge-bg { background: linear-gradient(135deg, rgba(121,85,72,0.82) 0%, rgba(93,64,55,0.72) 100%) !important; }
    body.roster-desk-pill .pill-desk-card.level-GUEST .gauge-bg { background: linear-gradient(135deg, rgba(148,163,184,0.84) 0%, rgba(100,116,139,0.74) 100%) !important; }
    .active-desk-card .adc-cancel { width: 24px; height: 24px; border: none; border-radius: 8px; background: rgba(239,68,68,0.12); color: var(--brand-danger); font-size: 11px; font-weight: 900; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 0; line-height: 1; transition: 0.15s; }
    .active-desk-card .adc-cancel:hover { background: var(--brand-danger); color: #fff; }
    .active-desk-card .adc-time-block { flex-shrink: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; width: 100%; padding: 0 0 2px; }
    .active-desk-card .adc-start-time { font-size: 15px; font-weight: 900; color: #fff; cursor: pointer; flex-shrink: 0; padding: 6px 12px; line-height: 1.2; border-radius: 8px; background: #2563eb; border: 2px solid #60a5fa; font-family: 'Montserrat', 'Pretendard', sans-serif; font-variant-numeric: tabular-nums; min-width: 72px; text-align: center; align-self: flex-start; margin-top: 2px; box-shadow: 0 4px 8px rgba(0,0,0,0.25); }
    .active-desk-card .adc-start-time.placeholder { color: var(--text-muted); background: rgba(0,0,0,0.03); border-color: transparent; cursor: default; font-weight: 700; font-size: 11px; box-shadow: none; }
    .active-desk-card .adc-start-time:not(.placeholder):hover { background: #1d4ed8; }
    .active-desk-card .adc-time { font-family: 'Montserrat', 'Pretendard', sans-serif; font-size: 44px; font-weight: 800; text-align: right; line-height: 1; letter-spacing: -0.04em; color: var(--time-color); flex: 1; min-width: 0; pointer-events: none; font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1; align-self: flex-start; margin-top: -2px; }
    .active-desk-card .adc-time.rdp-time-running { color: #059669; }
    .active-desk-card .adc-time.rdp-time-paused { color: var(--text-muted); }
    .active-desk-card .adc-time.rdp-time-over { color: var(--brand-danger); }
    .active-desk-card .adc-status-badges { display: flex; justify-content: center; align-items: center; gap: 6px; flex-wrap: nowrap; flex-shrink: 0; min-height: 26px; margin: 3px 0 5px; overflow: visible; }
    .active-desk-card .adc-status-badges:empty { visibility: hidden; min-height: 0; margin: 0; }
    .active-desk-card .adc-badge { font-size: 12px; font-weight: 900; padding: 4px 11px; border-radius: 999px; white-space: nowrap; font-family: 'Pretendard', sans-serif; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.14); letter-spacing: 0.02em; }
    .active-desk-card .adc-badge.praise { background: linear-gradient(145deg, #fde047, #fbbf24); color: #713f12; border: 1.5px solid #eab308; }
    .active-desk-card .adc-badge.warn { background: linear-gradient(145deg, #fdba74, #fb923c); color: #7c2d12; border: 1.5px solid #f97316; }
    .active-desk-card .adc-badge.penalty-applied { background: linear-gradient(145deg, #fca5a5, #f87171); color: #7f1d1d; border: 1.5px solid #ef4444; }
    .active-desk-card .adc-row { display: flex; gap: 5px; width: 100%; flex-shrink: 0; }
    .active-desk-card .adc-praise-btn { flex: 1; padding: 10px 2px; border: none; border-radius: 9px; font-weight: 800; font-size: 12px; cursor: pointer; color: #92400e; background: linear-gradient(145deg, #fef3c7, #fde68a); font-family: 'Pretendard', sans-serif; box-shadow: 0 2px 6px rgba(245,158,11,0.2); transition: 0.15s; }
    .active-desk-card .adc-penalty-btn { flex: 1; padding: 10px 2px; border: none; border-radius: 9px; font-weight: 800; font-size: 12px; cursor: pointer; color: #7f1d1d; background: linear-gradient(145deg, #fecaca, #fca5a5); font-family: 'Pretendard', sans-serif; box-shadow: 0 2px 6px rgba(239,68,68,0.2); transition: 0.15s; }
    .active-desk-card .adc-time-btn { flex: 1; padding: 9px 0; border: none; border-radius: 8px; font-weight: 800; font-size: 12px; cursor: pointer; background: rgba(255,255,255,0.85); color: var(--text-main); box-shadow: 0 1px 4px rgba(0,0,0,0.08); font-family: 'Montserrat', monospace; border: 1px solid rgba(0,0,0,0.06); transition: 0.15s; }
    .active-desk-card .adc-time-btn.minus { color: var(--brand-danger); }
    .active-desk-card .adc-act-btn { flex: 1; padding: 12px 2px; border: none; border-radius: 10px; font-weight: 900; font-size: 13px; cursor: pointer; color: #fff; font-family: 'Pretendard', sans-serif; white-space: nowrap; transition: 0.15s; letter-spacing: 0.02em; }
    .active-desk-card .adc-act-btn.btn-play { background: linear-gradient(145deg, #34d399, #059669); box-shadow: 0 3px 8px rgba(16,185,129,0.28); }
    .active-desk-card .adc-act-btn.btn-pause { background: linear-gradient(145deg, #94a3b8, #64748b); box-shadow: 0 3px 8px rgba(100,116,139,0.25); }
    .active-desk-card .adc-act-btn.btn-finish { background: linear-gradient(145deg, #60a5fa, #2563eb); box-shadow: 0 3px 8px rgba(37,99,235,0.28); }
    .active-desk-card .adc-praise-btn:active, .active-desk-card .adc-penalty-btn:active, .active-desk-card .adc-time-btn:active, .active-desk-card .adc-act-btn:active, .active-desk-card .adc-cancel:active { transform: scale(0.96); }
    .active-desk-card.alarm-blink .adc-time { color: var(--brand-danger) !important; }
    .active-desk-card.alarm-blink .adc-name { color: var(--brand-danger) !important; }
    #grid-active .student-btn:not(.active-desk-card) { width: 100% !important; height: 100% !important; margin: 0 !important; border-radius: 18px; position: absolute; top:0; left:0; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }

    #grid-finished { display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 10px !important; margin: 0 !important; }
    #grid-finished .student-btn { width: auto !important; height: 55px !important; padding: 8px 20px !important; flex-direction: row !important; border-radius: 12px !important; display: inline-flex !important; align-items: center; justify-content: center; position: relative !important; margin: 0 !important; }
    #grid-finished .student-btn .name-text { font-size: 20px !important; margin: 0 !important; }
    #grid-finished .student-btn .card-badge-group { display: none !important; }
    #grid-finished .student-btn.finished { opacity: 0.6 !important; filter: grayscale(100%) !important; background: var(--bg-main) !important; border: 2px dashed var(--border) !important; overflow: hidden; cursor: pointer !important; pointer-events: auto !important; }
    #grid-finished .student-btn .quick-controls { display: none !important; }
    #grid-finished .student-btn .card-cancel-btn,
    #grid-finished .student-btn .guest-delete-btn,
    #grid-finished .student-btn .card-mod-container,
    #grid-finished .student-btn .status-badge,
    #grid-finished .student-btn .start-time-badge,
    #grid-finished .student-btn .alarm-alert-text { display: none !important; }
    #grid-finished .student-btn .name-text { pointer-events: auto !important; cursor: pointer !important; }

    @keyframes active-card-neon { 0% { box-shadow: 0 0 10px #3b82f6, inset 0 0 10px #3b82f6; border-color: #3b82f6; transform: scale(1); } 50% { box-shadow: 0 0 30px #2563eb, inset 0 0 20px #2563eb; border-color: #2563eb; transform: scale(1.02); } 100% { box-shadow: 0 0 10px #3b82f6, inset 0 0 10px #3b82f6; border-color: #3b82f6; transform: scale(1); } }

    /* 모달 */
    #custom-time-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.2s ease-in-out; }
    #custom-time-modal-overlay.show { opacity: 1; pointer-events: auto; }
    .custom-time-modal { background: var(--bg-card, #ffffff); padding: 35px; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.4); text-align: center; width: 360px; transform: translateY(20px) scale(0.95); transition: all 0.2s ease-out; border: 1px solid var(--border, #ccc); }
    #custom-time-modal-overlay.show .custom-time-modal { transform: translateY(0) scale(1); }
    .custom-time-modal h3 { margin: 0 0 20px 0; color: var(--text-main, #333); font-size: 20px; font-weight: 900; }
    .custom-time-modal input[type="time"] { font-size: 42px; padding: 15px; border: 3px solid var(--accent, #2563eb); border-radius: 12px; width: 100%; text-align: center; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; font-weight: bold; background: var(--bg-card); outline: none; box-sizing: border-box; }
    .custom-time-modal input[type="time"]::-webkit-calendar-picker-indicator { display: none; }
    .quick-time-btns { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 25px; } .quick-time-btns button { flex: 1; padding: 12px 0; border-radius: 8px; border: none; background: var(--btn-bg); color: var(--text-main); font-weight: 900; font-size: 15px; cursor: pointer; transition: 0.2s; box-shadow: var(--shadow-btn); } .quick-time-btns button:active { transform: scale(0.95); box-shadow: var(--shadow-inner); }
    .custom-time-modal .modal-btns { display: flex; gap: 10px; } .custom-time-modal .modal-btns button { flex: 1; padding: 14px; border: none; border-radius: 10px; font-weight: bold; font-size: 16px; cursor: pointer; transition: filter 0.2s; } .btn-modal-cancel { background: var(--border, #ddd); color: var(--text-main, #333); } .btn-modal-save { background: var(--accent, #2563eb); color: #fff; } .btn-modal-cancel:hover, .btn-modal-save:hover { filter: brightness(1.1); }

    /* 리스트 뷰 */
    #view-roster { position: relative; padding: 55px 8px 28px 8px; min-height: calc(100vh - 56px); max-height: none; overflow: visible; box-sizing: border-box; }
    #view-roster.view-roster-list-mode { height: auto; max-height: none; min-height: calc(100vh - 56px); overflow: visible; padding-bottom: 48px; }
    #view-roster.view-roster-list-mode #roster-list-wrapper { width: 100%; height: auto; max-height: none; overflow-x: auto; overflow-y: visible; padding: 10px 0 60px 0; animation: fadeIn 0.3s ease; }
    .view-toggle-btn { position: absolute; right: 20px; top: 10px; z-index: 50; background: var(--bg-card); color: var(--accent); font-weight: 900; font-family: 'Pretendard'; padding: 10px 16px; border-radius: 10px; border: 2px solid var(--accent); box-shadow: var(--shadow-btn); cursor: pointer; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); font-size: 14px; }
    .view-toggle-btn:hover { background: var(--accent); color: #fff; transform: translateY(-2px); box-shadow: 0 6px 12px rgba(37, 99, 235, 0.2); }
    #roster-list-wrapper { width: 100%; animation: fadeIn 0.3s ease; padding: 10px 0; overflow-x: auto;}
    .roster-list-table { width: 100%; border-collapse: separate; border-spacing: 0 12px; min-width: 1100px; }
    .roster-list-table th { position: relative; text-align: center; padding: 10px 10px 16px 10px; color: var(--text-muted); font-size: 16px; font-weight: 900; border-bottom: 2px solid var(--border); transition: color 0.2s; user-select: none; }
    .roster-list-table th.sortable:hover { color: var(--accent); cursor: pointer; }
    .roster-list-table th.sort-asc::after { content: " ▲"; font-size: 11px; color: var(--accent); } .roster-list-table th.sort-desc::after { content: " ▼"; font-size: 11px; color: var(--accent); }
    .roster-list-table td { font-family: var(--app-font, 'Pretendard', sans-serif); padding: 18px 10px; background: var(--bg-card); box-shadow: 0 4px 10px rgba(0,0,0,0.04); vertical-align: middle; text-align: center; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .roster-list-table td:first-child { border-left: 1px solid var(--border); border-radius: 14px 0 0 14px; text-align: center !important; vertical-align: middle; } .roster-list-table td:last-child { border-right: 1px solid var(--border); border-radius: 0 14px 14px 0; }
    .roster-list-table tr { transition: all 0.2s ease; }
    .roster-list-table tr:hover td { transform: translateY(-3px); z-index: 10; position: relative; box-shadow: 0 8px 16px rgba(0,0,0,0.08); background: rgba(255, 255, 255, 0.98); }
    .roster-list-table tr.row-playing td { box-shadow: 0 0 10px rgba(59, 130, 246, 0.4), inset 0 0 8px rgba(59, 130, 246, 0.1); border-top: 1px solid #3b82f6; border-bottom: 1px solid #3b82f6; animation: row-neon-pulse 1.5s infinite alternate; }
    .roster-list-table tr.finished-row td { opacity: 0.8; background: #f8fafc; box-shadow: inset 0 0 10px rgba(0,0,0,0.02); animation: none; border-color: #cbd5e1; }
    .list-seat-select { padding: 12px 14px; border-radius: 10px; border: 2px solid var(--border); background: var(--bg-main); color: var(--text-main); font-weight: 800; font-size: 16px; font-family: 'Pretendard'; outline: none; cursor: pointer; transition: 0.2s; width: 100%; max-width: 250px; text-align: center; text-align-last: center; }
    .list-seat-select:focus { border-color: var(--accent); } .list-seat-select.assigned { border-color: var(--accent); background: rgba(59, 130, 246, 0.08); color: var(--accent); } 
    .list-btn-group { display: flex; gap: 8px; justify-content: center; }
    .list-action-btn { padding: 12px 16px; border: none; border-radius: 10px; font-weight: 900; font-size: 14px; cursor: pointer; color: white; font-family: 'Pretendard'; transition: 0.2s; box-shadow: var(--shadow-btn); white-space: nowrap; } .list-action-btn:active { transform: scale(0.95); }
    .l-btn-start { background: var(--brand-success); } .l-btn-stop { background: var(--text-muted); } .l-btn-finish { background: var(--accent); } .l-btn-cancel { background: var(--brand-danger); } .l-btn-absent { background: #64748b; }
    .roster-list-table tr.absent-row td { opacity: 0.85; background: #f1f5f9; border-color: #94a3b8; }
    .list-level-tag { font-size: 15px; padding: 8px 14px; border-radius: 8px; font-weight: 900; display: inline-block; width: 90px; text-align: center; }
    .roster-desk-slot { height: clamp(136px, calc((100vh - 340px) / 2), 160px); min-height: 136px; max-height: 160px; border: 3px dashed var(--border); border-radius: 18px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.015); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-shadow: inset 2px 2px 5px rgba(0,0,0,0.03); overflow: hidden; }
    .roster-desk-slot.drag-over { background: rgba(59, 130, 246, 0.08); border-color: var(--accent); transform: scale(1.02); z-index: 10; }
    .roster-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;}
    .css-desk { display: flex; flex-direction: column; align-items: center; justify-content: center; transition: 0.2s; }
    .desk-top { width: 102px; height: 56px; background: #e2e8f0; border-radius: 10px; border-bottom: 5px solid #cbd5e1; display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; box-shadow: inset 0 2px 4px rgba(255,255,255,0.7), 0 4px 6px rgba(0,0,0,0.05); transition: 0.2s; }
    .desk-num { font-size: 25px; font-weight: 900; color: #94a3b8; font-family: 'JetBrains Mono', monospace; transition: 0.2s; }
    .desk-chair { width: 48px; height: 23px; background: #cbd5e1; border-radius: 8px 8px 15px 15px; margin-top: -8px; z-index: 1; border-bottom: 3px solid #94a3b8; transition: 0.2s; }
    .roster-desk-slot:not(:has(.student-btn)) .desk-top { width: 116px; height: 64px; }
    .roster-desk-slot:not(:has(.student-btn)) .desk-num { font-size: 30px; color: #64748b; }
    .roster-desk-slot:not(:has(.student-btn)) .desk-chair { width: 56px; height: 26px; }
    .roster-empty-text { color: var(--text-muted); font-weight: 700; font-size: 15px; text-align: center; opacity: 0.65; pointer-events: none; margin-top: 8px; font-family: 'Pretendard'; }
    .roster-waiting-text { color: var(--accent); font-weight: 900; font-size: 15px; text-align: center; animation: blinker 1.5s linear infinite; text-shadow: 0 0 8px rgba(59,130,246,0.3); pointer-events: none; margin-bottom: 6px; font-family: 'Pretendard'; line-height: 1.25; white-space: nowrap; }
    .clickable-timer { display: inline-block; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); } .clickable-timer:hover { transform: scale(1.1); filter: brightness(1.2); }

    /* 상세 기록 팝업 스타일 */
    .history-detail-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bg-card, #ffffff); padding: 25px 30px; border-radius: 16px; box-shadow: 0 15px 40px rgba(0,0,0,0.25); border: 2px solid var(--accent); z-index: 9999; width: 450px; max-width: 90vw; display: none; font-family: var(--app-font, 'Pretendard', sans-serif); }
    .history-detail-popup.active { display: block; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .popup-close-btn { position: absolute; top: 15px; right: 15px; background: transparent; border: none; font-size: 20px; font-weight:900; cursor: pointer; color: var(--text-muted); transition: 0.2s; }
    .popup-close-btn:hover { color: var(--brand-danger); transform: scale(1.1); }
    @keyframes popIn { 0% { opacity: 0; transform: translate(-50%, -45%) scale(0.95); } 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
    .detail-title { font-size: 18px; font-weight: 900; color: var(--text-main); display:flex; align-items:center; gap: 10px; margin-bottom: 15px; }
    .detail-stats { display: flex; gap: 15px; margin-bottom: 15px; }
    .detail-stat-item { background: #f8fafc; padding: 10px 15px; border-radius: 8px; border: 1px solid var(--border); font-weight: bold; flex: 1; text-align: center; font-size: 15px; }
    .detail-textarea { width: 100%; height: 80px; padding: 12px; border-radius: 8px; border: 2px solid var(--border); font-family: var(--app-font, 'Pretendard', sans-serif); font-size: 14px; resize: none; margin-bottom: 10px; box-sizing: border-box; transition: 0.2s; }
    .detail-textarea:focus { border-color: var(--accent); outline: none; }
    .detail-save-btn { background: var(--accent); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 900; font-size: 15px; cursor: pointer; float: right; transition: 0.2s; }
    .detail-save-btn:hover { background: #1d4ed8; transform: translateY(-2px); }
    .btn-danger-outline { border: 2px solid #ef4444; color: #ef4444; background: transparent; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 900; font-size:14px; transition: 0.2s; }
    .btn-danger-outline:hover { background: #ef4444; color: #fff; transform: translateY(-2px); }
    .btn-acad-holiday { background: #8b5cf6; color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 900; font-size:14px; transition: 0.2s; box-shadow: 0 2px 4px rgba(139,92,246,0.3); }
    .btn-acad-holiday:hover { background: #7c3aed; transform: translateY(-2px); }

    /* ⭐ 쉬는날 지정 CSS */
    .btn-no-class { background: #64748b; color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 900; font-size:14px; transition: 0.2s; box-shadow: 0 2px 4px rgba(100,116,139,0.3); }
    .btn-no-class:hover { background: #475569; transform: translateY(-2px); }
    .btn-reg-off { background: #0891b2; color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 900; font-size:14px; transition: 0.2s; box-shadow: 0 2px 4px rgba(8,145,178,0.3); }
    .btn-reg-off:hover { background: #0e7490; transform: translateY(-2px); }
    
    .is-no-class { background: repeating-linear-gradient(45deg, #ffffff, #ffffff 10px, #f1f5f9 10px, #f1f5f9 20px) !important; border-color: #e2e8f0 !important; }
    .no-class-label { font-size: 11px; color: #64748b; background: #e2e8f0; padding: 2px 5px; border-radius: 4px; margin-left: 6px; white-space:nowrap; }
    .reg-off-label { font-size: 11px; color: #0284c7; background: #e0f2fe; padding: 2px 5px; border-radius: 4px; margin-left: 6px; white-space:nowrap; }

    /* ⭐ 미니게임 UI */
    .game-container { text-align: center; padding: 18px 22px 26px; background: var(--bg-card); border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); min-height: 680px; display: flex; flex-direction: row; align-items: stretch; gap: 0; }
    .game-sidebar { flex-shrink: 0; width: 108px; display: flex; flex-direction: column; gap: 6px; padding: 4px 14px 4px 4px; border-right: 2px solid var(--border); margin-right: 18px; }
    .game-sidebar .admin-btn { padding: 9px 8px; font-size: 12px; border-radius: 8px; font-weight: 800; line-height: 1.35; width: 100%; box-sizing: border-box; }
    .game-sidebar .active-game-tab { transform: none; }
    .game-sidebar #btnBgmToggle { margin-top: auto; font-size: 11px !important; padding: 8px 6px !important; }
    .game-main { flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 0; }
    .game-stage { position: relative; width: 100%; max-width: 980px; margin: 0 auto; flex-shrink: 0; }
    #roulette-game-area .game-canvas-wrap { display: flex; justify-content: center; align-items: center; padding: 8px 0; }
    #rouletteCanvas { background: #fff; border-radius: 50%; box-shadow: 0 12px 40px rgba(0,0,0,0.12), inset 0 0 0 6px rgba(255,255,255,0.9); display: block; max-width: min(620px, 88vw); height: auto; }
    #ladder-game-area .game-canvas-wrap { width: 100%; height: min(720px, calc(100vh - 240px)); min-height: 600px; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); border-radius: 20px; border: 2px solid var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8); overflow: hidden; }
    #ladderCanvas { display: block; width: 100%; height: 100%; }
    .game-result-banner { width: 100%; max-width: 720px; min-height: 72px; margin: 20px auto 0; padding: 16px 24px; font-size: clamp(22px, 3.5vw, 34px); font-weight: 900; color: var(--text-main); text-align: center; font-family: var(--app-font); border-radius: 16px; transition: all 0.35s ease; box-sizing: border-box; display: flex; align-items: center; justify-content: center; line-height: 1.35; }
    .game-result-banner.is-waiting { color: var(--text-muted); font-size: clamp(16px, 2.5vw, 22px); font-weight: 700; background: var(--bg-main); border: 2px dashed var(--border); }
    .game-result-banner.is-winner { background: linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.12)); border: 2px solid rgba(239,68,68,0.25); color: var(--text-main); animation: gameResultPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 8px 24px rgba(239,68,68,0.12); }
    .game-result-banner.is-winner .winner-name { color: var(--brand-danger); font-size: 1.15em; letter-spacing: -0.02em; }
    @keyframes gameResultPop { 0% { transform: scale(0.92); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    .game-controls { width: 100%; max-width: 720px; min-height: 64px; margin-top: 16px; display: flex; justify-content: center; align-items: center; gap: 12px; flex-shrink: 0; }
    .game-start-btn { padding: 16px 36px; font-size: clamp(18px, 2.5vw, 22px); font-weight: 900; background: linear-gradient(135deg, var(--accent), #1d4ed8); color: white; border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 8px 20px rgba(37,99,235,0.35); transition: 0.2s; font-family: var(--app-font); white-space: nowrap; }
    .game-start-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(37,99,235,0.45); }
    .game-start-btn.is-replay { background: var(--bg-main); color: var(--text-main); border: 2px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.06); font-size: clamp(15px, 2vw, 18px); padding: 12px 28px; }
    .game-start-btn.is-replay:hover { border-color: var(--accent); color: var(--accent); box-shadow: 0 6px 16px rgba(37,99,235,0.15); transform: translateY(-2px); }
    .active-game-tab { background: var(--accent) !important; color: white !important; transform: scale(1.05); }

    @keyframes bday-glow { 0% { box-shadow: 0 0 15px #ff007f, inset 0 0 10px #ff007f; border-color: #ff007f; } 33% { box-shadow: 0 0 15px #007fff, inset 0 0 10px #007fff; border-color: #007fff; } 66% { box-shadow: 0 0 15px #00ff7f, inset 0 0 10px #00ff7f; border-color: #00ff7f; } 100% { box-shadow: 0 0 15px #ff007f, inset 0 0 10px #ff007f; border-color: #ff007f; } }
    .bday-card { animation: bday-glow 3s infinite linear !important; border: 4px solid #ff007f !important; position: relative; }
    .bday-card::after { content: '🎉'; position: absolute; top: -16px; left: -16px; font-size: 36px; z-index: 50; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); animation: bday-bounce 0.8s infinite alternate ease-in-out; }
    @keyframes bday-bounce { from { transform: translateY(0) rotate(-10deg) scale(1); } to { transform: translateY(-8px) rotate(15deg) scale(1.1); } }

    /* ⭐ 생일 축하 연출 */
    #birthday-celebration-root { position: fixed; inset: 0; pointer-events: none; z-index: 9998; opacity: 0; visibility: hidden; transition: opacity 0.45s ease, visibility 0.45s; }
    #birthday-celebration-root.active { opacity: 1; visibility: visible; }
    #birthday-fireworks-canvas { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 9997; pointer-events: none; }
    .birthday-celebration-msg { position: fixed; top: 10%; left: 50%; transform: translateX(-50%); font-size: clamp(28px, 5.5vw, 64px); font-weight: 900; font-family: 'Montserrat', 'Pretendard', sans-serif; color: #ff007f; text-align: center; white-space: nowrap; text-shadow: 0 4px 24px rgba(255,0,127,0.45), 0 0 40px rgba(255,215,0,0.35); z-index: 9999; animation: birthday-text-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1); letter-spacing: 0.5px; }
    @keyframes birthday-text-pop { 0% { transform: translateX(-50%) scale(0.4); opacity: 0; } 100% { transform: translateX(-50%) scale(1); opacity: 1; } }
    @keyframes birthday-banner-pulse { 0%, 100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.04); } }
    .birthday-desk-banner { position: absolute; top: -52px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #ff007f, #ffd700); color: #fff; font-size: clamp(14px, 1.6vw, 22px); font-weight: 900; padding: 8px 18px; border-radius: 999px; white-space: nowrap; box-shadow: 0 8px 24px rgba(255,0,127,0.35); z-index: 20; animation: birthday-banner-pulse 1.2s infinite ease-in-out; pointer-events: none; }
    .timer-box.birthday-celebrating { z-index: 15; }
    .roster-desk-slot.birthday-celebrating .birthday-desk-banner { top: -46px; font-size: 13px; padding: 6px 14px; }

    /* ⭐ 학생 기록: 탭 전환 및 캘린더/사이드바 뷰 CSS */
    .history-sidebar { width: 320px; background: var(--bg-card); border-radius: 16px; border: 2px solid var(--border); padding: 15px; display: flex; flex-direction: column; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .history-sidebar h3 { margin-top: 0; padding-bottom: 10px; border-bottom: 2px solid var(--border); color: var(--text-main); font-weight: 900; }
    
    .sidebar-th { cursor: pointer; font-size: 13px; font-weight: 900; color: var(--text-muted); transition: 0.2s; user-select: none; text-align: center; }
    .sidebar-th:hover { color: var(--accent); }
    .sidebar-th.sort-asc::after { content: " ▲"; font-size: 10px; color: var(--accent); }
    .sidebar-th.sort-desc::after { content: " ▼"; font-size: 10px; color: var(--accent); }
    .history-sidebar-header-row { display: grid; grid-template-columns: 1fr 52px 58px; align-items: center; column-gap: 6px; border-bottom: 2px solid var(--border); padding-bottom: 8px; margin-bottom: 6px; }
    
    .history-student-item { padding: 11px 8px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s, color 0.2s, box-shadow 0.2s; display: grid; grid-template-columns: 1fr 52px 58px; align-items: center; column-gap: 6px; border-radius: 8px; text-align: center; }
    .history-student-item:hover { background: rgba(37,99,235,0.05); color: var(--accent); }
    .history-student-item.active { background: var(--accent); color: white; border-color: var(--accent); box-shadow: 0 4px 10px rgba(37,99,235,0.3); }
    .history-student-item .s-name { font-weight: 900; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; min-width: 0; }
    .history-student-item .s-grade { text-align: center; font-size: 12px; font-weight: 800; opacity: 0.85; }
    .history-student-item .s-level { text-align: center; font-size: 11px; font-weight: 900; padding: 3px 4px; background: rgba(0,0,0,0.05); border-radius: 4px; box-sizing: border-box; }
    .history-student-item.active .s-level { background: rgba(255,255,255,0.2); }
    
    .history-content { flex: 1; background: var(--bg-card); border-radius: 16px; border: 2px solid var(--border); padding: 25px; display: flex; flex-direction: column; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; }
    .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .calendar-header h2 { margin: 0; font-size: 24px; font-weight: 900; color: var(--accent); }
    .cal-nav-btn { background: var(--bg-main); border: 2px solid var(--border); font-size: 18px; padding: 8px 16px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: 0.2s; }
    .cal-nav-btn:hover { background: var(--accent); color: white; border-color: var(--accent); }
    .cal-grid-header { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 8px; padding-right: 5px; }
    .cal-day-header { text-align: center; font-weight: 900; padding: 8px 0; border-bottom: 3px solid var(--border); color: var(--text-muted); font-size: 15px; display: flex; justify-content: center; align-items: center; }
    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; flex: 1; overflow-y: auto; padding-right: 5px; align-content: start; }
    .cal-day { border: 2px solid var(--border); border-radius: 10px; padding: 10px; cursor: pointer; transition: all 0.2s; display:flex; flex-direction:column; background: #fff; min-height: 100px; }
    .cal-day:hover { border-color: var(--accent); transform: scale(1.02); box-shadow: 0 4px 8px rgba(0,0,0,0.05); z-index:2; position:relative; }
    .cal-day.active { border-color: var(--accent); background: rgba(37,99,235,0.05); box-shadow: inset 0 0 0 2px var(--accent); }
    .cal-day.has-record { background: #f0fdf4; border-color: #86efac; }
    .cal-day.empty-cell { background: transparent; border: none; cursor: default; pointer-events: none; }
    .cal-day.is-holiday .cal-date-num { color: #ef4444; }
    .cal-day.is-saturday .cal-date-num { color: #3b82f6; }
    .holiday-label { font-size: 11px; color: #ef4444; font-weight: bold; margin-left: 6px; background: #fee2e2; padding: 2px 5px; border-radius: 4px; white-space:nowrap;}
    .acad-holiday-label { font-size: 11px; color: #fff; background: #8b5cf6; padding: 2px 5px; border-radius: 4px; margin-left: 6px; white-space:nowrap;}
    .cal-date-num { font-weight: 900; font-size: 16px; color: var(--text-main); margin-bottom: 6px; display:flex; align-items:center; }
    .cal-record-summary { font-size: 18px; font-weight: 900; color: #059669; margin-top: 8px; line-height: 1.3; flex-shrink: 0; }
    .cal-record-mins { font-size: 20px; font-weight: 900; color: #059669; margin-top: 8px; line-height: 1.2; flex-shrink: 0; letter-spacing: -0.3px; }
    .cal-record-mods { font-size: 12px; color: var(--brand-danger); }
    .cal-note-preview { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 4px 6px; border-radius: 6px; margin-top: auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 700; border: 1px solid #e2e8f0; max-width: 100%; box-sizing: border-box; display: block; }
    
    .history-top-bar { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding: 14px 16px; background: var(--bg-card); border: 2px solid var(--border); border-radius: 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.04); }
    .history-tab-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 22px; border-radius: 14px; border: 3px solid transparent; cursor: pointer; transition: 0.2s; font-family: var(--app-font); color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.12); white-space: nowrap; }
    .history-tab-btn .ht-icon { font-size: 34px; line-height: 1; flex-shrink: 0; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2)); }
    .history-tab-btn .ht-title { font-size: 19px; font-weight: 900; line-height: 1.15; letter-spacing: -0.02em; text-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .history-tab-btn:not(.active) { opacity: 0.78; filter: saturate(0.9); }
    .history-tab-btn:hover { opacity: 1 !important; filter: saturate(1.05) brightness(1.04); transform: translateY(-2px); }
    .history-tab-btn.active { opacity: 1; filter: none; transform: scale(1.04); box-shadow: 0 8px 22px rgba(0,0,0,0.2); outline: 3px solid rgba(255,255,255,0.6); outline-offset: 1px; }
    .history-tab-btn.ht-monthly { background: linear-gradient(145deg, #3b82f6, #1d4ed8); border-color: #1e40af; }
    .history-tab-btn.ht-monthly.active { box-shadow: 0 8px 24px rgba(37,99,235,0.45); }
    .history-tab-btn.ht-weekly { background: linear-gradient(145deg, #06b6d4, #0e7490); border-color: #155e75; }
    .history-tab-btn.ht-weekly.active { box-shadow: 0 8px 24px rgba(6,182,212,0.4); }
    .history-tab-btn.ht-desklog { background: linear-gradient(145deg, #818cf8, #4f46e5); border-color: #4338ca; }
    .history-tab-btn.ht-desklog.active { box-shadow: 0 8px 24px rgba(99,102,241,0.42); }
    .history-tab-btn.ht-roster { background: linear-gradient(145deg, #fbbf24, #d97706); border-color: #b45309; }
    .history-tab-btn.ht-roster.active { box-shadow: 0 8px 24px rgba(245,158,11,0.42); }
    .history-tab-btn.ht-daily { background: linear-gradient(145deg, #34d399, #059669); border-color: #047857; }
    .history-tab-btn.ht-daily.active { box-shadow: 0 8px 24px rgba(16,185,129,0.45); }
    .history-tab-divider { width: 3px; height: 48px; background: linear-gradient(180deg, transparent, var(--border), transparent); margin: 0 2px; border-radius: 3px; flex-shrink: 0; }
    .history-view-hint { font-size: 14px; color: var(--text-muted); font-weight: 700; margin: 0 0 14px 0; padding: 11px 14px; background: rgba(0,0,0,0.03); border-left: 4px solid var(--border); border-radius: 0 10px 10px 0; line-height: 1.55; flex-shrink: 0; }
    .history-view-hint.hint-monthly { border-left-color: #3b82f6; }
    .history-view-hint.hint-weekly { border-left-color: #06b6d4; }
    .history-view-hint.hint-desklog { border-left-color: #6366f1; }
    .history-view-hint.hint-roster { border-left-color: #f59e0b; }
    .history-view-hint.hint-daily { border-left-color: #10b981; }
    .daily-header-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; }
    .daily-date-nav { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .daily-close-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: 14px 18px; margin-bottom: 16px; background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(124,58,237,0.06)); border: 2px solid rgba(16,185,129,0.25); border-radius: 14px; }
    .daily-close-label { font-size: 16px; font-weight: 900; color: #047857; white-space: nowrap; }
    .daily-close-btns { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .daily-close-btns .export-btn { position: static; margin: 0; }
    
    .monthly-history-container, #weekly-history-container, #daily-history-container, #roster-history-container { display: none; height: calc(100vh - 180px); min-height: 600px; position: relative; width: 100%; }
    .monthly-history-container.active { display: flex; gap: 20px; }
    #roster-history-container.active { display: flex; flex-direction: column; background: var(--bg-card); border-radius: 16px; border: 2px solid var(--border); padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); box-sizing: border-box; overflow: hidden; min-height: calc(100vh - 150px); height: calc(100vh - 150px); }
    #roster-history-container .roster-table-scroll { overflow-x: auto; flex: 1 1 auto; min-height: 560px; max-height: calc(100vh - 280px); overflow-y: auto; border: 2px solid var(--border); border-radius: 12px; background: var(--bg-card); }
    #roster-history-container .settings-roster-table td { padding: 4px 6px; }
    #roster-history-container .settings-roster-table th { font-size: 16px; padding: 12px 8px; }
    #roster-history-container .settings-roster-input { padding: 10px 8px; font-size: 18px; }
    #roster-history-container .settings-roster-select { font-size: 17px; padding: 10px 8px; }
    #roster-history-container .settings-roster-table td:nth-child(1) .settings-roster-input,
    #roster-history-container .settings-roster-table td:nth-child(2) .settings-roster-input { font-size: 20px; font-weight: 900; }
    .btn-end-class-day { background: linear-gradient(135deg, #7c3aed, #5b21b6) !important; color: #fff !important; border: none !important; padding: 12px 24px !important; font-size: 17px !important; font-weight: 900 !important; border-radius: 12px !important; cursor: pointer; box-shadow: 0 6px 16px rgba(124,58,237,0.35); white-space: nowrap; font-family: var(--app-font, 'Pretendard', sans-serif); transition: 0.2s; }
    .btn-end-class-day:hover { transform: translateY(-2px); filter: brightness(1.08); }
    .ds-card.ds-waiting .ds-header span:first-child { color: #d97706; }
    #weekly-history-container.active { display: flex; background: var(--bg-card); border-radius: 16px; border: 2px solid var(--border); padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); flex-direction: column; box-sizing: border-box; }
    #daily-history-container.active { display: flex; background: var(--bg-card); border-radius: 16px; border: 2px solid var(--border); padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); flex-direction: column; box-sizing: border-box; }
    #desklog-history-container { display: none; height: calc(100vh - 180px); min-height: 600px; position: relative; width: 100%; }
    #desklog-history-container.active { display: flex; background: var(--bg-card); border-radius: 16px; border: 2px solid var(--border); padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); flex-direction: column; box-sizing: border-box; overflow: hidden; }
    .desklog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; overflow-y: auto; flex: 1; padding: 4px; align-content: start; }
    .desklog-card { background: var(--bg-main); border: 2px solid var(--border); border-radius: 14px; padding: 12px; display: flex; flex-direction: column; min-height: 120px; max-height: 300px; overflow: hidden; }
    .desklog-card-header { font-size: 17px; font-weight: 900; color: var(--accent); margin-bottom: 8px; padding-bottom: 8px; border-bottom: 2px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-shrink: 0; min-width: 0; }
    .desklog-card-header .desklog-count { font-size: 11px; font-weight: 800; color: var(--text-muted); background: var(--bg-card); padding: 3px 8px; border-radius: 999px; border: 1px solid var(--border); flex-shrink: 0; }
    .desklog-card-header .desklog-now { font-size: 11px; font-weight: 800; color: #059669; background: rgba(16,185,129,0.12); padding: 3px 8px; border-radius: 999px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 1; min-width: 0; }
    .desklog-card-body { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; padding-right: 2px; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
    .desklog-card-body::-webkit-scrollbar { width: 5px; }
    .desklog-card-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
    .desklog-entry { padding: 8px 10px; border-radius: 10px; margin-bottom: 6px; background: var(--bg-card); border-left: 4px solid var(--border); font-size: 13px; line-height: 1.45; }
    .desklog-entry:last-child { margin-bottom: 0; }
    .desklog-entry.active { border-left-color: var(--accent); background: rgba(59,130,246,0.06); }
    .desklog-entry.finished { border-left-color: #10b981; }
    .desklog-entry.cancelled { border-left-color: var(--text-muted); opacity: 0.75; }
    .desklog-entry .dl-name { font-weight: 900; font-size: 15px; color: var(--text-main); display: block; margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .desklog-entry .dl-time { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--text-muted); font-size: 12px; word-break: break-all; }
    .desklog-entry .dl-status { font-size: 11px; font-weight: 800; margin-top: 4px; }
    .desklog-card.has-many .desklog-entry { padding: 5px 8px; margin-bottom: 4px; line-height: 1.3; }
    .desklog-card.has-many .desklog-entry .dl-name { font-size: 13px; margin-bottom: 1px; }
    .desklog-card.has-many .desklog-entry .dl-time { font-size: 11px; }
    .desklog-card.has-many .desklog-entry .dl-status { font-size: 10px; margin-top: 2px; }
    .desklog-empty { color: var(--text-muted); font-size: 13px; font-weight: 700; opacity: 0.6; text-align: center; padding: 20px 8px; }
    
    /* ⭐ 일일 마감 보고서 전용 CSS (이름 태그 형식) */
    .daily-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; flex: 1; align-items: stretch; margin-top: 20px; min-height: 0; }
    .ds-card { background: #f8fafc; border: 2px solid var(--border); border-radius: 16px; display: flex; flex-direction: column; padding: 20px; overflow: hidden; }
    .ds-header { font-size: 20px; font-weight: 900; margin-bottom: 15px; padding-bottom: 12px; border-bottom: 2px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
    .ds-list { display: flex; flex-wrap: wrap; gap: 10px; overflow-y: auto; align-content: flex-start; padding-bottom: 10px; }
    .ds-item { display: inline-flex; align-items: center; padding: 8px 16px; background: #fff; border-radius: 30px; font-size: 18px; font-weight: 900; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05); color: #1e293b; transition: transform 0.2s; }
    .ds-item:hover { transform: translateY(-2px); }

    .export-btn { background: #10b981; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 900; font-size: 15px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px rgba(16,185,129,0.2); font-family: var(--app-font); position: absolute; right: 0; }
    .export-btn:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 6px 14px rgba(16,185,129,0.3); }

    /* ⭐ 주간 전체 출결 뷰 특화 CSS (고급형 진한 사선 적용) */
    .weekly-table-wrapper { flex: 1; overflow-y: auto; overflow-x: auto; margin-top: 15px; border-radius: 12px; border: 2px solid #cbd5e1; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    .weekly-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 2280px; table-layout: fixed; }
    .weekly-table th { background: #f1f5f9; font-weight: 900; color: #0f172a; font-size: 16px; text-align: center; border-right: 1px solid #cbd5e1; border-bottom: 3px solid #94a3b8; margin: 0; }
    .weekly-table th.main-date-th { position: sticky; top: 0; z-index: 10; height: 46px; box-sizing: border-box; font-size: 15px !important; padding: 6px 4px !important; }
    .weekly-table th.sub-th { position: sticky; top: 46px; z-index: 10; height: 36px; font-size: 13px !important; color: #475569; background: #f8fafc; border-bottom: 2px solid #cbd5e1; box-sizing: border-box; padding: 6px 4px !important; }
    .weekly-table th.sub-th-min { min-width: 54px; width: 54px; }
    .weekly-edit-cell { padding: 5px 3px !important; vertical-align: middle !important; overflow: hidden; }
    .weekly-time-input { width: 100%; max-width: none; min-width: 0; padding: 5px 3px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-weight: 700; font-family: 'JetBrains Mono', monospace; text-align: center; background: #fff; cursor: pointer; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; }
    .weekly-time-input:hover { border-color: var(--accent); }
    .weekly-time-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25); }
    .weekly-time-input.weekly-time-edited { background: #eff6ff; border-color: #93c5fd; }
    .weekly-time-empty { color: #94a3b8; font-weight: 700; font-size: 14px; padding: 8px 4px !important; }
    .fixed-col-name { position: sticky; left: 0; z-index: 12; background: #f8fafc; border-right: 1px solid #cbd5e1; width: 118px; min-width: 118px; max-width: 118px; }
    .fixed-col-grade { position: sticky; left: 118px; z-index: 12; background: #f8fafc; border-right: 3px solid #94a3b8 !important; box-shadow: 3px 0 6px rgba(0,0,0,0.05); width: 68px; min-width: 68px; max-width: 68px; }
    .weekly-table td { padding: 10px 5px; text-align: center; vertical-align: middle; background: #fff; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #e2e8f0; transition: background 0.1s; overflow: hidden; }
    .weekly-table tr:hover td { background: #f1f5f9; }
    .col-divider { border-right: 2px solid #94a3b8 !important; }
    .weekly-name-cell { font-size: 22px !important; font-weight: 900 !important; color: #0f172a; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 10px 8px !important; }
    .weekly-grade-cell { font-size: 16px !important; color: #475569; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .weekly-time-cell { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #1e293b; }
    .time-empty { color: #cbd5e1; font-weight: 400; font-size: 16px !important; }
    .weekly-table th.sortable { transition: color 0.2s; user-select: none; cursor: pointer; }
    .weekly-table th.sortable:hover { color: var(--accent); }
    .weekly-table th.sort-asc::after { content: " ▲"; font-size: 12px; color: var(--accent); }
    .weekly-table th.sort-desc::after { content: " ▼"; font-size: 12px; color: var(--accent); }
    .today-header-top { border-top: 4px solid var(--accent) !important; background: #e0f2fe !important; color: #0284c7 !important; }
    .today-start-cell { border-left: 3px solid var(--accent) !important; background: rgba(56, 189, 248, 0.05); }
    .today-end-cell { border-right: 3px solid var(--accent) !important; background: rgba(56, 189, 248, 0.05); }
    
    /* ⭐ 진해진 휴무일 사선(빗금) 패턴 */
    .weekly-no-class-cell { background: repeating-linear-gradient(45deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.08) 10px, rgba(0,0,0,0.08) 20px) !important; }
    .weekly-min-cell { font-size: 14px !important; font-family: 'JetBrains Mono', monospace; font-weight: 900; color: #059669; padding: 8px 3px !important; white-space: nowrap; }
    .weekly-summary-total { font-size: 17px !important; font-weight: 900; color: #0f172a; background: #f0fdf4; white-space: nowrap; }
    .weekly-summary-target { font-size: 15px !important; font-weight: 800; color: #475569; background: #f8fafc; white-space: nowrap; }
    .weekly-summary-remain { font-size: 14px !important; font-weight: 900; white-space: nowrap; line-height: 1.3; }
    .weekly-summary-remain.need { color: #d97706; background: #fffbeb; }
    .weekly-summary-remain.done { color: #16a34a; background: #f0fdf4; }
    .weekly-summary-remain.over { color: #2563eb; background: #eff6ff; }
    .weekly-summary-praise { font-size: 15px !important; font-weight: 900; color: #b45309; background: #fffbeb; white-space: nowrap; }
    .weekly-summary-penalty { font-size: 15px !important; font-weight: 900; color: #b91c1c; background: #fef2f2; white-space: nowrap; }
    .weekly-table th.summary-th { background: #e0f2fe; color: #0369a1; font-size: 15px !important; }
    .monthly-mod-summary { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
    .monthly-mod-pill { flex: 1; min-width: 140px; padding: 10px 14px; border-radius: 12px; font-weight: 800; font-size: 14px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .monthly-mod-pill.praise { background: linear-gradient(145deg, #fef3c7, #fde68a); color: #92400e; border: 1.5px solid #fbbf24; }
    .monthly-mod-pill.penalty { background: linear-gradient(145deg, #fecaca, #fca5a5); color: #7f1d1d; border: 1.5px solid #f87171; }
    .monthly-mod-pill strong { display: block; font-size: 22px; margin-top: 4px; font-family: 'Montserrat', 'Pretendard', sans-serif; }
    #student-memo-toast-root { position: fixed; inset: 0; pointer-events: none; z-index: 10000; overflow: visible; }
    .student-memo-anchor-popup { position: fixed; transform: translate(-50%, calc(-100% - 8px)); max-width: min(300px, 44vw); min-width: 120px; background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #fff; padding: 11px 14px; border-radius: 12px; box-shadow: 0 8px 26px rgba(37,99,235,0.5); border: 2px solid rgba(255,255,255,0.28); font-family: var(--app-font, 'Pretendard', sans-serif); opacity: 0; transition: opacity 0.28s ease, transform 0.28s ease; pointer-events: none; z-index: 10001; }
    .student-memo-anchor-popup.visible { opacity: 1; transform: translate(-50%, calc(-100% - 12px)); animation: memoToastPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .student-memo-anchor-popup .memo-toast-title { font-size: 11px; font-weight: 900; margin-bottom: 5px; letter-spacing: 0.02em; opacity: 0.88; }
    .student-memo-anchor-popup .memo-toast-body { font-size: 14px; font-weight: 700; line-height: 1.45; white-space: pre-wrap; word-break: break-word; max-height: 110px; overflow-y: auto; }
    .student-memo-anchor-popup::after { content: ''; position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); border: 7px solid transparent; border-top-color: #2563eb; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.12)); }
    @keyframes memoToastPop { 0% { transform: translate(-50%, calc(-100% - 4px)) scale(0.92); opacity: 0; } 100% { transform: translate(-50%, calc(-100% - 12px)) scale(1); opacity: 1; } }

    #stats-history-container { display: none; height: calc(100vh - 180px); min-height: 600px; position: relative; width: 100%; }
    #stats-history-container.active { display: flex; flex-direction: column; background: var(--bg-card); border-radius: 16px; border: 2px solid var(--border); padding: 20px 22px 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); box-sizing: border-box; overflow: hidden; gap: 14px; }
    .stats-control-panel { display: flex; flex-direction: column; gap: 0; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; flex-shrink: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.9); }
    .stats-toolbar-row { display: flex; align-items: center; gap: 14px; padding: 12px 16px; flex-wrap: wrap; border-bottom: 1px solid rgba(226,232,240,0.9); }
    .stats-toolbar-row:last-child { border-bottom: none; }
    .stats-toolbar-row.stats-toolbar-period { justify-content: space-between; }
    .stats-toolbar-group { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .stats-toolbar-label { font-size: 12px; font-weight: 900; color: #64748b; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; min-width: 36px; }
    .stats-segmented { display: inline-flex; align-items: stretch; border: 2px solid var(--border); border-radius: 10px; overflow: hidden; background: #fff; flex-shrink: 0; }
    .stats-segmented .stats-period-btn { margin: 0; border: none; border-radius: 0; border-right: 1px solid var(--border); padding: 9px 16px; font-size: 14px; font-weight: 900; box-shadow: none; white-space: nowrap; }
    .stats-segmented .stats-period-btn:last-child { border-right: none; }
    .stats-segmented .stats-period-btn.active { background: var(--accent); color: #fff; box-shadow: none; }
    .stats-metric-segmented { flex: 1; min-width: 0; display: grid !important; grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .stats-metric-segmented .stats-period-btn { border-right: 1px solid var(--border) !important; padding: 9px 8px; font-size: 13px; text-align: center; }
    .stats-metric-segmented .stats-period-btn:nth-child(4n) { border-right: none !important; }
    .stats-nav-group { flex: 1; justify-content: center; min-width: 280px; }
    .stats-nav-inner { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: nowrap; width: 100%; }
    .stats-nav-title { margin: 0; font-size: 17px; font-weight: 900; color: #7c3aed; white-space: nowrap; min-width: 140px; text-align: center; font-family: 'Montserrat', 'Pretendard', sans-serif; letter-spacing: -0.02em; }
    .stats-nav-group .cal-nav-btn { padding: 8px 12px; font-size: 13px; font-weight: 800; white-space: nowrap; flex-shrink: 0; }
    .stats-nav-group .cal-nav-btn.stats-nav-today { background: #7c3aed; color: #fff; border-color: #7c3aed; }
    .stats-period-btn { padding: 12px 22px; border-radius: 12px; border: 2px solid var(--border); background: var(--bg-main); font-weight: 900; font-size: 16px; cursor: pointer; font-family: var(--app-font); transition: 0.2s; }
    .stats-period-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
    .stats-segmented .stats-period-btn.active { box-shadow: none; }
    .stats-charts-grid { display: block; flex: 1; min-height: 0; overflow: hidden; }
    .stats-card { background: var(--bg-main); border: 2px solid var(--border); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; min-height: 420px; height: 100%; box-sizing: border-box; }
    .stats-xy-chart-wrap { flex: 1; min-height: 400px; overflow-x: auto; overflow-y: hidden; padding: 4px 0; }
    .stats-xy-chart { height: 400px; display: block; font-family: var(--app-font, 'Pretendard', sans-serif); }
    .stats-xy-chart .axis-label { font-size: 12px; font-weight: 800; fill: #64748b; }
    .stats-xy-chart .bar-label { font-size: 13px; font-weight: 900; fill: #1e293b; }
    .stats-xy-chart .bar-value { font-size: 11px; font-weight: 900; fill: #475569; }
    .stats-card-title { font-size: 20px; font-weight: 900; color: var(--text-main); margin: 0 0 6px 0; display: flex; align-items: center; gap: 8px; }
    .stats-card-sub { font-size: 13px; font-weight: 700; color: var(--text-muted); margin: 0 0 16px 0; }
    .stats-bar-list { display: flex; flex-direction: column; gap: 10px; flex: 1; overflow-y: auto; padding-right: 4px; }
    .stats-bar-row { display: grid; grid-template-columns: 72px 1fr 58px; gap: 10px; align-items: center; }
    .stats-bar-name { font-size: 14px; font-weight: 900; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: right; }
    .stats-bar-track { height: 22px; background: #e2e8f0; border-radius: 999px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.08); }
    .stats-bar-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; min-width: 2px; }
    .stats-bar-fill.rate { background: linear-gradient(90deg, #34d399, #059669); }
    .stats-bar-fill.mins { background: linear-gradient(90deg, #60a5fa, #2563eb); }
    .stats-bar-fill.praise { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
    .stats-bar-fill.penalty { background: linear-gradient(90deg, #f87171, #ef4444); }
    .stats-bar-val { font-size: 13px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--text-main); text-align: right; }
    .stats-summary-row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; padding: 12px 16px 14px; background: rgba(248,250,252,0.6); }
    .stats-summary-pill { background: #fff; border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; font-size: 12px; font-weight: 800; color: var(--text-muted); text-align: center; line-height: 1.35; min-width: 0; }
    .stats-summary-pill strong { display: block; color: var(--accent); font-size: 15px; margin: 4px 0 0 0; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .history-tab-btn.ht-stats { background: linear-gradient(145deg, #a78bfa, #7c3aed); border-color: #6d28d9; }
    .history-tab-btn.ht-stats.active { box-shadow: 0 8px 24px rgba(124,58,237,0.42); }
    .history-view-hint.hint-stats { border-left-color: #8b5cf6; margin-bottom: 0; }
    @media screen and (max-width: 1200px) {
        .stats-metric-segmented { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .stats-metric-segmented .stats-period-btn { border-bottom: 1px solid var(--border) !important; }
        .stats-metric-segmented .stats-period-btn:nth-child(2n) { border-right: none !important; }
        .stats-metric-segmented .stats-period-btn:nth-child(n+3) { border-bottom: none !important; }
        .stats-summary-row { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .stats-toolbar-row.stats-toolbar-period { flex-direction: column; align-items: stretch; }
        .stats-nav-group { min-width: 0; }
    }
    @media screen and (max-width: 768px) {
        .stats-summary-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .stats-nav-title { font-size: 14px; min-width: 100px; }
    }
    @media screen and (max-width: 1366px) { .stats-xy-chart-wrap { min-height: 360px; } }

    /* ⭐ 결석/휴원 및 분할 레이아웃 추가 CSS */
    .bottom-split-container { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; height: 100%; align-items: stretch; flex: 1; min-height: 0; }
    .split-box { background: rgba(255,255,255,0.85); border-radius: 12px; padding: 10px 12px; border: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.04); height: 100%; min-height: 0; max-height: none; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
    .split-title { font-size: 14px; font-weight: 900; margin-bottom: 8px; display: flex; align-items: center; padding-bottom: 6px; border-bottom: 2px dashed var(--border); flex-shrink: 0; }
    #grid-absent, #grid-finished { flex: 1 1 0 !important; min-height: 0 !important; max-height: none; overflow-y: auto !important; overflow-x: hidden; align-content: flex-start; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
    
    #grid-absent { display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 10px !important; margin: 0 !important; align-content: flex-start; flex: 1; }
    #grid-absent .student-btn { width: auto !important; height: 55px !important; padding: 8px 20px !important; flex-direction: row !important; border-radius: 12px !important; display: inline-flex !important; align-items: center; justify-content: center; position: relative !important; margin: 0 !important; }
    #grid-absent .student-btn .name-text { font-size: 20px !important; margin: 0 !important; }
    #grid-absent .student-btn .card-badge-group { display: none !important; }
    #grid-absent .student-btn .quick-controls { display: none !important; }
    #grid-absent .student-btn.absent { opacity: 0.6 !important; background: #e2e8f0 !important; border: 2px dashed #94a3b8 !important; overflow: hidden; filter: grayscale(100%); }
    .split-box.drag-over-zone, #grid-unassigned.drag-over-zone { outline: 3px dashed var(--accent); outline-offset: 4px; background: rgba(59, 130, 246, 0.06); border-radius: 16px; }
    #grid-absent.drag-over-zone { outline: 3px dashed #64748b; outline-offset: 4px; background: rgba(100, 116, 139, 0.08); border-radius: 12px; min-height: 60px; }

    /* =========================================================
       ⭐ 태블릿 최적화 (반응형)
       ========================================================= */
    /* ⭐ 탭 배정 모드 (태블릿) */
    body.mode-tap-assign .student-btn { cursor: pointer; touch-action: manipulation; }
    body.mode-tap-assign #grid-unassigned,
    body.mode-tap-assign #grid-absent,
    body.mode-tap-assign #grid-finished { touch-action: pan-y; }
    body.mode-tap-assign .student-btn.tap-selected {
        outline: 4px solid var(--accent) !important;
        outline-offset: 3px;
        box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.25), var(--shadow-pop) !important;
        transform: scale(1.03);
        z-index: 30;
    }
    body.mode-tap-assign .roster-desk-slot.tap-drop-ready {
        outline: 3px dashed var(--accent);
        outline-offset: 2px;
        background: rgba(59, 130, 246, 0.06);
        animation: tap-desk-pulse 1.2s ease-in-out infinite;
    }
    @keyframes tap-desk-pulse { 0%, 100% { box-shadow: inset 0 0 0 0 rgba(59,130,246,0.15); } 50% { box-shadow: inset 0 0 0 4px rgba(59,130,246,0.2); } }
    body.mode-tap-assign .tap-zone-ready { outline: 3px dashed var(--accent); outline-offset: 4px; }
    #tap-assign-hint {
        position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%);
        z-index: 9000; max-width: min(520px, 92vw); padding: 12px 20px;
        background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #fff;
        font-weight: 900; font-size: 15px; text-align: center; border-radius: 999px;
        box-shadow: 0 8px 28px rgba(37, 99, 235, 0.45);
        pointer-events: none; opacity: 0; visibility: hidden; transition: opacity 0.25s, visibility 0.25s;
        font-family: var(--app-font, 'Pretendard', sans-serif);
    }
    #tap-assign-hint.visible { opacity: 1; visibility: visible; }
    #tap-assign-hint.has-selection { background: linear-gradient(135deg, #059669, #10b981); box-shadow: 0 8px 28px rgba(16, 185, 129, 0.4); }

    @media screen and (max-width: 1366px) {
        .custom-roster-layout { grid-template-columns: 320px 1fr !important; gap: 12px !important; }
        .custom-col-wait { max-width: 320px !important; max-height: none !important; }
        .custom-roster-layout { grid-template-rows: minmax(0, 1fr) minmax(210px, 36vh) !important; min-height: calc(100vh - 92px) !important; }
        #grid-unassigned { grid-template-columns: 1fr !important; } 
        #grid-unassigned .student-btn.wait-student-card { height: 62px !important; padding: 7px 10px !important; gap: 12px !important; }
        #grid-unassigned .student-btn.wait-student-card .new-level-pill { width: 34px !important; height: 34px !important; font-size: 9px !important; }
        #grid-unassigned .student-btn.wait-student-card .card-badge-group { width: 34px; min-width: 34px; }
        #grid-unassigned .student-btn.wait-student-card .wait-name-wrap { padding-left: 4px; }
        #grid-unassigned .student-btn.wait-student-card .name-text { font-size: 24px !important; letter-spacing: 0.6px !important; }
        #grid-unassigned .student-btn.wait-student-card .quick-btn { padding: 4px 8px !important; font-size: 11px !important; }
        #grid-active { gap: 8px !important; }
        .roster-desk-slot:not(.slot-waiting-match) { height: clamp(178px, calc((100vh - 310px) / 2), 196px) !important; min-height: 178px !important; max-height: 196px !important; }
        body.roster-desk-integrated .roster-desk-slot:not(.slot-waiting-match):not(.has-student) { height: clamp(240px, calc((100vh - 270px) / 2), 300px) !important; min-height: 240px !important; max-height: 300px !important; }
        body.roster-desk-integrated .roster-desk-slot.has-student { height: clamp(240px, calc((100vh - 270px) / 2), 300px) !important; min-height: 240px !important; max-height: 300px !important; }
        .roster-desk-slot.slot-waiting-match { min-height: 152px !important; height: 152px !important; max-height: 156px !important; }
        .roster-desk-slot:not(:has(.student-btn)) .desk-top { width: 104px; height: 58px; }
        .roster-desk-slot:not(:has(.student-btn)) .desk-num { font-size: 26px; }
        .active-desk-card .adc-name { font-size: 15px !important; }
        .active-desk-card .adc-time { font-size: 34px !important; }
        .active-desk-card .adc-praise-btn, .active-desk-card .adc-penalty-btn { font-size: 9px !important; }
        .active-desk-card .adc-time-btn, .active-desk-card .adc-act-btn { font-size: 9px !important; padding: 6px 0 !important; }
        .custom-col-finish { min-height: 210px !important; max-height: none !important; }
        .split-box { min-height: 160px !important; }
        #grid-absent, #grid-finished { min-height: 110px !important; }
        .timer-grid { gap: 10px !important; padding: 10px !important; }
        .timer-box { padding: 10px !important; }
        .time-display { font-size: 40px !important; }
        .action-btn-row { margin-bottom: 5px !important; }
        .action-btn { padding: 10px !important; font-size: 14px !important; }
        .time-btn { padding: 6px 2px !important; font-size: 11px !important; }
        .header-dashboard-box { transform: translateY(-50%) scale(0.92); transform-origin: left center; max-width: 380px !important; min-width: 280px !important; }
        .class-main-title { font-size: 42px !important; }
        .sidebar { padding-top: 40px !important; }
        #weekly-history-container, #daily-history-container { padding: 15px !important; }
        .history-top-bar { gap: 8px !important; padding: 10px !important; }
        .history-tab-btn { width: 100% !important; padding: 14px 16px !important; justify-content: flex-start !important; }
        .history-tab-btn .ht-icon { font-size: 30px !important; }
        .history-tab-btn .ht-title { font-size: 17px !important; }
        .history-tab-divider { display: none; }
        .daily-close-bar { flex-direction: column; align-items: stretch; text-align: center; }
        .daily-close-btns { justify-content: center; }
        .weekly-name-cell { font-size: 18px !important; }
        .weekly-time-input { font-size: 12px !important; }
        .weekly-table { min-width: 1900px !important; }
        .daily-summary-grid { grid-template-columns: 1fr !important; overflow-y: auto; }
        .ds-card { max-height: none; }
    }
`;
document.head.appendChild(customStyle);

// =========================================================================
// ⭐ 태블릿 터치 드래그 앤 드롭 (Polyfill) 활성화
// =========================================================================
window.addEventListener('DOMContentLoaded', () => {
    injectTapAssignHint();
    const unlockAudio = () => { initAudio(); };
    document.addEventListener('click', unlockAudio, { passive: true });
    document.addEventListener('touchstart', unlockAudio, { passive: true });
    document.addEventListener('keydown', unlockAudio, { passive: true });
});

window.onload = () => { 
    injectHistoryUI(); 
    injectGameUI(); 
    injectHeaderDashboard(); 
    injectBirthdayCelebrationUI();
    injectDeskModeToggleUI(); 
    injectFontSettingUI(); 
    injectInteractionModeUI();
    injectRemoteSettingUI(); 
    loadData(); 
    updateDateUI();
    updateNavTooltips();
    setTimeout(applyCustomRosterLayout, 500);
    registerServiceWorker();
};

window.addEventListener('beforeunload', () => {
    if (saveToStorageTimer) saveToStorage();
});

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}

setInterval(() => { updateDateUI(); }, 60000);

function updateDateUI() {
    const now = new Date(); const t = i18n[currentLang] || i18n.ko;
    const str = `${now.getFullYear()}. ${String(now.getMonth()+1).padStart(2,'0')}. ${String(now.getDate()).padStart(2,'0')} (${t.days[now.getDay()]})`;
    const hdDate = document.getElementById('hd-date'); if(hdDate) hdDate.innerText = str;
}

function isTodayBirthday(birthdayStr) {
    if(!birthdayStr) return false;
    const today = new Date();
    const mm = today.getMonth() + 1;
    const dd = today.getDate();
    const match = birthdayStr.match(/(\d+)[-/](\d+)/);
    if(match) { return parseInt(match[1]) === mm && parseInt(match[2]) === dd; }
    return false;
}

let birthdayFireworksRAF = null;
const HAPPY_BIRTHDAY_MELODY = [
    [392, 0.4], [392, 0.4], [440, 0.8], [392, 0.8], [523, 0.8], [494, 1.6],
    [392, 0.4], [392, 0.4], [440, 0.8], [392, 0.8], [587, 0.8], [523, 1.6],
    [392, 0.4], [392, 0.4], [784, 0.8], [659, 0.8], [523, 0.8], [494, 0.8], [440, 1.6],
    [698, 0.4], [698, 0.4], [659, 0.8], [523, 0.8], [587, 0.8], [523, 1.6]
];

function injectBirthdayCelebrationUI() {
    if (document.getElementById('birthday-celebration-root')) return;
    const root = document.createElement('div');
    root.id = 'birthday-celebration-root';
    root.innerHTML = `<canvas id="birthday-fireworks-canvas"></canvas><div class="birthday-celebration-msg" id="birthday-celebration-msg"></div>`;
    document.body.appendChild(root);
}

function stopBirthdayFireworks() {
    if (birthdayFireworksRAF) { cancelAnimationFrame(birthdayFireworksRAF); birthdayFireworksRAF = null; }
    const canvas = document.getElementById('birthday-fireworks-canvas');
    if (canvas) { const ctx = canvas.getContext('2d'); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

function startBirthdayFireworks() {
    const canvas = document.getElementById('birthday-fireworks-canvas');
    if (!canvas) return;
    stopBirthdayFireworks();
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    let frame = 0;
    const maxFrames = 720;
    const colors = ['#ff007f', '#ffd700', '#00ff7f', '#007fff', '#ff4500', '#da70d6', '#ff69b4'];

    const spawnBurst = (x, y) => {
        for (let i = 0; i < 36; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 7;
            particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 55 + Math.random() * 35, color: colors[Math.floor(Math.random() * colors.length)], size: 2 + Math.random() * 3.5, gravity: 0.04 + Math.random() * 0.03 });
        }
    };

    const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (frame % 22 === 0) spawnBurst(Math.random() * canvas.width, 40 + Math.random() * canvas.height * 0.45);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.life -= 1;
            if (p.life <= 0) { particles.splice(i, 1); continue; }
            ctx.globalAlpha = Math.min(1, p.life / 35);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        frame++;
        if (frame < maxFrames) birthdayFireworksRAF = requestAnimationFrame(loop);
        else stopBirthdayFireworks();
    };
    loop();
}

function playHappyBirthdayMelody() {
    initAudio();
    if (!audioCtx) return;
    const peakVol = Math.min(1, alarmVolume * 0.5);
    let startTime = audioCtx.currentTime;
    HAPPY_BIRTHDAY_MELODY.forEach(([freq, duration]) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(peakVol, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
        startTime += duration;
    });
}

function showDeskBirthdayBanner(deskId, studentName) {
    if (deskId === null || deskId === undefined || deskId < 0) return;
    const bannerText = `🎂 ${studentName} Happy Birthday! 🎂`;
    const box = document.getElementById(`box-${deskId}`);
    if (box) {
        box.classList.add('birthday-celebrating');
        let banner = box.querySelector('.birthday-desk-banner');
        if (!banner) { banner = document.createElement('div'); banner.className = 'birthday-desk-banner'; box.appendChild(banner); }
        banner.textContent = bannerText;
    }
    const slot = document.getElementById(`roster-desk-${deskId}`);
    if (slot) {
        slot.classList.add('birthday-celebrating');
        let slotBanner = slot.querySelector('.birthday-desk-banner');
        if (!slotBanner) { slotBanner = document.createElement('div'); slotBanner.className = 'birthday-desk-banner'; slot.appendChild(slotBanner); }
        slotBanner.textContent = bannerText;
    }
}

function clearDeskBirthdayBanner(deskId) {
    if (deskId === null || deskId === undefined || deskId < 0) return;
    const box = document.getElementById(`box-${deskId}`);
    if (box) { box.classList.remove('birthday-celebrating'); box.querySelector('.birthday-desk-banner')?.remove(); }
    const slot = document.getElementById(`roster-desk-${deskId}`);
    if (slot) { slot.classList.remove('birthday-celebrating'); slot.querySelector('.birthday-desk-banner')?.remove(); }
}

function showBirthdayCelebration(studentName, deskId) {
    injectBirthdayCelebrationUI();
    const root = document.getElementById('birthday-celebration-root');
    const msgEl = document.getElementById('birthday-celebration-msg');
    if (!root || !msgEl) return;
    msgEl.textContent = `🎂 ${studentName} Happy Birthday! 🎂`;
    root.classList.add('active');
    startBirthdayFireworks();
    playHappyBirthdayMelody();
    showDeskBirthdayBanner(deskId, studentName);
    setTimeout(() => {
        root.classList.remove('active');
        clearDeskBirthdayBanner(deskId);
    }, 12000);
}

function maybeTriggerBirthdayCelebration(studentName, deskId) {
    if (!studentName || studentName === '(empty)') return;
    const info = studentMasterList.find(s => s.name === studentName);
    if (!info || !isTodayBirthday(info.birthday)) return;
    showBirthdayCelebration(studentName, deskId);
}

function updateHeaderTitle() {
    const el = document.getElementById('displayClassName');
    if (el) el.innerText = className || 'Maple Classroom';
}

function updateWaitSortUI() {
    ['custom', 'name', 'grade', 'level'].forEach(c => {
        const th = document.getElementById(`ws-${c}`);
        if (!th) return;
        th.classList.remove('sort-asc', 'sort-desc', 'active-sort');
        if (c === waitSortConfig.col) {
            th.classList.add('active-sort');
            if (c !== 'custom') th.classList.add(waitSortConfig.asc ? 'sort-asc' : 'sort-desc');
        }
    });
}

window.sortWaitList = function(col) {
    playUISound('click');
    if (waitSortConfig.col === col) {
        if (col !== 'custom') waitSortConfig.asc = !waitSortConfig.asc;
    } else {
        waitSortConfig.col = col;
        waitSortConfig.asc = true;
    }
    updateWaitSortUI();
    saveToStorage();
    if (rosterViewMode !== 'list') generateStudents();
};

function getSortedWaitNames(names) {
    if (waitSortConfig.col === 'custom') return [...names];
    const sorted = [...names];
    sorted.sort((a, b) => {
        let res = 0;
        if (waitSortConfig.col === 'name') res = a.localeCompare(b, 'ko-KR');
        else if (waitSortConfig.col === 'grade') res = getGradeWeight(studentGrades[a] || '') - getGradeWeight(studentGrades[b] || '');
        else if (waitSortConfig.col === 'level') res = getLevelWeight(studentLevels[a] || 'GUEST') - getLevelWeight(studentLevels[b] || 'GUEST');
        if (res === 0) res = a.localeCompare(b, 'ko-KR');
        return waitSortConfig.asc ? res : -res;
    });
    return sorted;
}

// =========================================================================
// ⭐ 명단창 3단 레이아웃 개편 및 로직
// =========================================================================
function applyCustomRosterLayout() {
    const gridU = document.getElementById("grid-unassigned");
    const gridA = document.getElementById("grid-active");
    const gridF = document.getElementById("grid-finished");
    
    updateHeaderTitle();

    if(gridU && gridA && gridF) {
        const colU = gridU.parentElement;
        const colA = gridA.parentElement;
        const colF = gridF.parentElement;
        const wrapper = colU.parentElement;
        if(wrapper) {
            wrapper.classList.add('custom-roster-layout');
            colU.classList.add('custom-col-wait');
            colA.classList.add('custom-col-active');
            colF.classList.add('custom-col-finish');

            if (!document.getElementById('wait-sort-bar')) {
                const sortBar = document.createElement('div');
                sortBar.id = 'wait-sort-bar';
                sortBar.className = 'wait-sort-bar';
                sortBar.innerHTML = `
                    <span class="wait-sort-label" data-i18n="waitSortLabel">정렬</span>
                    <div class="wait-sort-th" onclick="sortWaitList('custom')" id="ws-custom" data-i18n="waitSortCustom">기본</div>
                    <div class="wait-sort-th" onclick="sortWaitList('name')" id="ws-name" data-i18n="waitSortName">이름</div>
                    <div class="wait-sort-th" onclick="sortWaitList('grade')" id="ws-grade" data-i18n="waitSortGrade">학년</div>
                    <div class="wait-sort-th" onclick="sortWaitList('level')" id="ws-level" data-i18n="waitSortLevel">레벨</div>
                `;
                const guestInput = colU.querySelector('.guest-input-container');
                if (guestInput) colU.insertBefore(sortBar, guestInput.nextSibling);
                else colU.insertBefore(sortBar, gridU);
                updateWaitSortUI();
                const t = i18n[currentLang] || i18n.ko;
                sortBar.querySelectorAll('[data-i18n]').forEach(el => { if (t[el.getAttribute('data-i18n')]) el.innerHTML = t[el.getAttribute('data-i18n')]; });
            }
            
            // ⭐ 하단 창 분할 (결석/휴원 vs 수업 완료)
            if (!document.getElementById('bottom-split-container')) {
                const splitContainer = document.createElement('div');
                splitContainer.id = 'bottom-split-container';
                splitContainer.className = 'bottom-split-container';

                const absentBox = document.createElement('div');
                absentBox.className = 'split-box';
                absentBox.innerHTML = '<div class="split-title" style="color: #64748b;">🚫 오늘 휴원</div><div id="grid-absent"></div>';

                const finishBox = document.createElement('div');
                finishBox.className = 'split-box';
                finishBox.innerHTML = '<div class="split-title" style="color: var(--brand-success);">🏁 오늘 수업 완료</div>';
                
                // 기존 완료창의 원래 제목 텍스트 숨기기
                const oldFinishTitle = colF.querySelector('h2, .section-title, [data-i18n="grpFinish"]');
                if (oldFinishTitle) oldFinishTitle.style.display = 'none';

                finishBox.appendChild(gridF); // 기존 grid-finished 이동
                splitContainer.appendChild(absentBox);
                splitContainer.appendChild(finishBox);
                colF.appendChild(splitContainer);
            }
            setupRosterDropZones();
        }
    }
}

function clearDragState() {
    draggedName = null;
    draggedFromIndex = null;
    draggedFromAbsent = false;
    draggedNameForList = null;
}

function isCoarsePointerDevice() {
    try {
        if (window.matchMedia('(pointer: coarse)').matches) return true;
        if (window.matchMedia('(hover: none)').matches) return true;
    } catch (e) {}
    return ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

function isTapAssignMode() {
    if (interactionMode === 'tap') return true;
    if (interactionMode === 'drag') return false;
    return isCoarsePointerDevice();
}

function initTouchDragPolyfill() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouch || isTapAssignMode() || !window.MobileDragDrop || window.__stflowDragPolyfilled) return;
    MobileDragDrop.polyfill({
        dragImageTranslateOverride: MobileDragDrop.scrollBehaviourDragImageTranslateOverride,
        holdToDrag: 500
    });
    window.__stflowDragPolyfilled = true;
    window.addEventListener('touchmove', function() {}, { passive: false });
}

function injectTapAssignHint() {
    if (document.getElementById('tap-assign-hint')) return;
    const el = document.createElement('div');
    el.id = 'tap-assign-hint';
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
}

function updateTapAssignHint() {
    const el = document.getElementById('tap-assign-hint');
    if (!el) return;
    const t = i18n[currentLang] || i18n.ko;
    if (!isTapAssignMode() || rosterViewMode === 'list') {
        el.classList.remove('visible', 'has-selection');
        return;
    }
    el.classList.add('visible');
    if (tapSelectedName) {
        el.classList.add('has-selection');
        el.textContent = `「${tapSelectedName}」 ${t.tapHintSelected}`;
    } else {
        el.classList.remove('has-selection');
        el.textContent = t.tapHintIdle;
    }
}

function clearTapSelection() {
    if (tapSelectedName) {
        const btn = document.getElementById('btn-' + tapSelectedName);
        if (btn) btn.classList.remove('tap-selected');
    }
    tapSelectedName = null;
    document.querySelectorAll('.roster-desk-slot.tap-drop-ready').forEach(el => el.classList.remove('tap-drop-ready'));
    document.querySelectorAll('.tap-zone-ready').forEach(el => el.classList.remove('tap-zone-ready'));
    updateTapAssignHint();
}

function selectStudentForTap(name) {
    clearTapSelection();
    tapSelectedName = name;
    const btn = document.getElementById('btn-' + name);
    if (btn) btn.classList.add('tap-selected');
    document.querySelectorAll('.roster-desk-slot').forEach(el => el.classList.add('tap-drop-ready'));
    ['grid-unassigned', 'grid-absent', 'grid-finished'].forEach(id => {
        const z = document.getElementById(id);
        if (z) z.classList.add('tap-zone-ready');
    });
    const waitCol = document.querySelector('.custom-col-wait');
    if (waitCol) waitCol.classList.add('tap-zone-ready');
    playUISound('click');
    updateTapAssignHint();
}

function applyInteractionModeBodyClass() {
    document.body.classList.toggle('mode-tap-assign', isTapAssignMode());
    initTouchDragPolyfill();
    updateTapAssignHint();
}

function injectInteractionModeUI() {
    const settingsCards = document.querySelectorAll('.settings-card');
    let acadCard = null;
    settingsCards.forEach(card => {
        if (card.innerHTML.includes('학원 정보 및 디스플레이') || card.innerHTML.includes('ACADEMY INFO')) acadCard = card;
    });
    if (acadCard && !document.getElementById('interactionModeRow')) {
        const row = document.createElement('div');
        row.id = 'interactionModeRow';
        row.className = 'settings-row';
        row.style.cssText = 'background:var(--bg-main); padding:15px; border-radius:16px; border:1px solid var(--border); margin-bottom:25px;';
        row.innerHTML = `
            <span class="settings-label" data-i18n="interactionMode">👆 명단 조작 방식</span>
            <select id="interactionModeSelect" class="settings-input" onchange="changeInteractionMode(); playUISound('click');">
                <option value="auto" data-i18n-opt="interactionAuto">자동 (태블릿=탭 배정, PC=드래그)</option>
                <option value="drag" data-i18n-opt="interactionDrag">드래그 (PC 방식)</option>
                <option value="tap" data-i18n-opt="interactionTap">탭 배정 (태블릿·터치)</option>
            </select>
            <p id="interactionModeDesc" style="margin:10px 0 0; font-size:13px; font-weight:700; color:var(--text-muted); line-height:1.45;"></p>`;
        const deskRow = document.getElementById('deskCountSelect')?.closest('.settings-row');
        if (deskRow && deskRow.parentElement === acadCard) acadCard.insertBefore(row, deskRow);
        else if (acadCard.children.length > 2) acadCard.insertBefore(row, acadCard.children[2]);
        else acadCard.appendChild(row);
    }
    const sel = document.getElementById('interactionModeSelect');
    if (sel) sel.value = interactionMode;
    updateInteractionModeDesc();
}

function updateInteractionModeDesc() {
    const desc = document.getElementById('interactionModeDesc');
    if (!desc) return;
    const t = i18n[currentLang] || i18n.ko;
    if (interactionMode === 'tap') {
        desc.textContent = currentLang === 'en'
            ? 'Tap a student, then tap a desk or zone. List view uses buttons.'
            : '학생 카드를 탭해 선택한 뒤, 원하는 자리·대기·휴원 영역을 탭합니다.';
    } else if (interactionMode === 'drag') {
        desc.textContent = currentLang === 'en'
            ? 'Drag cards to desks (desktop style).'
            : '카드를 끌어다 자리에 놓는 PC 방식입니다.';
    } else {
        desc.textContent = isTapAssignMode()
            ? (currentLang === 'en' ? 'Auto: tap mode is ON on this device.' : '자동: 이 기기에서는 탭 배정 모드가 적용됩니다.')
            : (currentLang === 'en' ? 'Auto: drag mode is ON on this device.' : '자동: 이 기기에서는 드래그 모드가 적용됩니다.');
    }
}

window.changeInteractionMode = function() {
    const sel = document.getElementById('interactionModeSelect');
    if (!sel) return;
    interactionMode = sel.value;
    clearTapSelection();
    applyInteractionModeBodyClass();
    updateInteractionModeDesc();
    saveToStorage();
    if (rosterViewMode === 'list') renderListView();
    else generateStudents();
    for (let i = 0; i < DESK_COUNT; i++) updateBoxUI(i);
};

window.handleStudentCardTap = function(name, e) {
    if (e && e.target.closest('.card-cancel-btn, .guest-delete-btn, .quick-btn, .mod-badge')) return;

    if (finishedSet.has(name)) {
        restoreFinishedToClass(name);
        return;
    }
    if (absentSet.has(name)) {
        restoreFromAbsent(name);
        return;
    }

    if (!isTapAssignMode()) {
        const btn = document.getElementById('btn-' + name);
        if (btn) { btn.classList.add('clicked'); setTimeout(() => btn.classList.remove('clicked'), 150); }
        return;
    }

    if (tapSelectedName === name) {
        clearTapSelection();
        return;
    }
    selectStudentForTap(name);
};

window.handleTapOnDesk = function(deskIdx) {
    if (!isTapAssignMode() || !tapSelectedName) return;
    const fromIdx = timers.findIndex(t => t.student === tapSelectedName);
    handleDropOnTimer(tapSelectedName, deskIdx, fromIdx !== -1 ? fromIdx : null);
    clearTapSelection();
};

window.handleTapOnWaitZone = function() {
    if (!isTapAssignMode() || !tapSelectedName) return;
    const name = tapSelectedName;
    if (absentSet.has(name)) {
        restoreFromAbsent(name);
        clearTapSelection();
        return;
    }
    const fromIdx = timers.findIndex(t => t.student === name);
    if (fromIdx !== -1) cancelSession(fromIdx);
    clearTapSelection();
};

window.handleTapOnAbsentZone = function() {
    if (!isTapAssignMode() || !tapSelectedName) return;
    if (!absentSet.has(tapSelectedName)) markAbsent(tapSelectedName);
    clearTapSelection();
};

function bindTapZoneClick(el, handler) {
    if (!el || el.dataset.tapZoneBound) return;
    el.dataset.tapZoneBound = '1';
    el.addEventListener('click', (e) => {
        if (!isTapAssignMode()) return;
        if (e.target.closest('button, .quick-btn, .card-cancel-btn, select, input, .mod-badge')) return;
        handler();
    });
}

function setupRosterDropZones() {
    const gridAbsent = document.getElementById('grid-absent');
    const absentBox = gridAbsent ? gridAbsent.closest('.split-box') : null;
    const gridUnassigned = document.getElementById('grid-unassigned');
    const waitCol = document.querySelector('.custom-col-wait');

    const bindAbsentDrop = (el) => {
        if (!el || el.dataset.absentDropBound) return;
        el.dataset.absentDropBound = '1';
        el.ondragenter = (e) => { e.preventDefault(); el.classList.add('drag-over-zone'); };
        el.ondragover = (e) => { e.preventDefault(); el.classList.add('drag-over-zone'); };
        el.ondragleave = (e) => { if (!el.contains(e.relatedTarget)) el.classList.remove('drag-over-zone'); };
        el.ondrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            el.classList.remove('drag-over-zone');
            if (draggedName && draggedName !== '(empty)' && !absentSet.has(draggedName)) markAbsent(draggedName);
            clearDragState();
        };
    };

    const bindWaitRestoreDrop = (el) => {
        if (!el || el.dataset.waitDropBound) return;
        el.dataset.waitDropBound = '1';
        el.ondragenter = (e) => { if (!draggedFromAbsent) return; e.preventDefault(); el.classList.add('drag-over-zone'); };
        el.ondragover = (e) => { if (!draggedFromAbsent) return; e.preventDefault(); el.classList.add('drag-over-zone'); };
        el.ondragleave = (e) => { if (!el.contains(e.relatedTarget)) el.classList.remove('drag-over-zone'); };
        el.ondrop = (e) => {
            if (!draggedFromAbsent || !draggedName) return;
            e.preventDefault();
            e.stopPropagation();
            el.classList.remove('drag-over-zone');
            restoreFromAbsent(draggedName);
            clearDragState();
        };
    };

    bindAbsentDrop(absentBox);
    bindAbsentDrop(gridAbsent);
    bindWaitRestoreDrop(gridUnassigned);
    bindWaitRestoreDrop(waitCol);

    const gridFinished = document.getElementById('grid-finished');
    if (gridFinished && !gridFinished.dataset.finishedClickBound) {
        gridFinished.dataset.finishedClickBound = '1';
        gridFinished.addEventListener('click', (e) => {
            const card = e.target.closest('.student-btn');
            if (!card || !card.id || !card.id.startsWith('btn-')) return;
            if (e.target.closest('.card-cancel-btn, .guest-delete-btn, .quick-btn')) return;
            const studentName = card.id.replace('btn-', '');
            if (finishedSet.has(studentName)) {
                e.preventDefault();
                e.stopPropagation();
                restoreFinishedToClass(studentName);
            }
        });
    }

    bindTapZoneClick(gridUnassigned, handleTapOnWaitZone);
    bindTapZoneClick(waitCol, handleTapOnWaitZone);
    bindTapZoneClick(gridAbsent, handleTapOnAbsentZone);
    bindTapZoneClick(absentBox, handleTapOnAbsentZone);
}

// =========================================================================
// ⭐ 3. 미니게임 화면 및 로직
// =========================================================================
function setGameResult(html, state) {
    const el = document.getElementById('gameResult');
    if (!el) return;
    el.className = 'game-result-banner' + (state ? ' ' + state : '');
    el.innerHTML = html;
}

function showGameButton(btnId, text, isReplay) {
    const btnLadder = document.getElementById('btnStartLadder');
    const btnRoulette = document.getElementById('btnStartRoulette');
    if (btnLadder) { btnLadder.style.display = 'none'; btnLadder.classList.remove('is-replay'); }
    if (btnRoulette) { btnRoulette.style.display = 'none'; btnRoulette.classList.remove('is-replay'); }
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.innerText = text;
    btn.style.display = 'inline-flex';
    btn.classList.toggle('is-replay', !!isReplay);
}

function hideAllGameButtons() {
    ['btnStartLadder', 'btnStartRoulette'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = 'none';
    });
}

function fitCanvasFont(ctx, text, maxWidth, maxSize, minSize, weight) {
    let size = maxSize;
    while (size >= minSize) {
        ctx.font = `${weight} ${size}px Pretendard, sans-serif`;
        if (ctx.measureText(text).width <= maxWidth) return size;
        size -= 1;
    }
    return minSize;
}

function truncateName(name, maxLen) {
    if (name.length <= maxLen) return name;
    return name.substring(0, maxLen - 1) + '…';
}

function getLadderLayout(cols, w, h) {
    const topPad = 64, bottomPad = 58;
    const spacing = w / cols;
    const maxBoxW = Math.min(110, spacing * 0.85);
    const boxW = Math.max(58, maxBoxW);
    const boxH = Math.max(36, Math.min(50, boxW * 0.48));
    const nameFont = Math.max(14, Math.min(22, Math.floor(spacing * 0.24)));
    return { topPad, bottomPad, spacing, boxW, boxH, nameFont, ladderTop: topPad + boxH / 2 + 10, ladderBottom: h - bottomPad };
}

function buildLadderPaths(cols, spacing, ladderTop, ladderBottom) {
    let colEvents = Array.from({length: cols}, () => []);
    ladderRungs.forEach(r => {
        colEvents[r.col].push({ yMe: r.yLeft, yTarget: r.yRight, targetCol: r.col + 1 });
        colEvents[r.col + 1].push({ yMe: r.yRight, yTarget: r.yLeft, targetCol: r.col });
    });
    colEvents.forEach(events => events.sort((a,b) => a.yMe - b.yMe));
    let paths = [];
    for (let p = 0; p < cols; p++) {
        let curCol = p, curY = ladderTop;
        let path = [{ x: (curCol + 0.5) * spacing, y: curY }];
        while (true) {
            let nextEvent = colEvents[curCol].find(e => e.yMe > curY + 0.5);
            if (!nextEvent) {
                path.push({ x: (curCol + 0.5) * spacing, y: ladderBottom });
                break;
            }
            path.push({ x: (curCol + 0.5) * spacing, y: nextEvent.yMe });
            curCol = nextEvent.targetCol;
            curY = nextEvent.yTarget;
            path.push({ x: (curCol + 0.5) * spacing, y: curY });
        }
        paths.push({ nodes: path, finalCol: curCol, color: ladderColors[p % ladderColors.length] });
    }
    paths.forEach(p => {
        let totalLen = 0;
        for (let i = 0; i < p.nodes.length - 1; i++) {
            let dx = p.nodes[i+1].x - p.nodes[i].x, dy = p.nodes[i+1].y - p.nodes[i].y;
            totalLen += Math.sqrt(dx * dx + dy * dy);
        }
        p.totalLen = totalLen;
    });
    return paths;
}

function getPointOnPath(nodes, dist) {
    let drawn = 0;
    for (let i = 0; i < nodes.length - 1; i++) {
        let dx = nodes[i+1].x - nodes[i].x, dy = nodes[i+1].y - nodes[i].y;
        let seg = Math.sqrt(dx * dx + dy * dy);
        if (drawn + seg >= dist) {
            let ratio = seg > 0 ? (dist - drawn) / seg : 0;
            return { x: nodes[i].x + dx * ratio, y: nodes[i].y + dy * ratio };
        }
        drawn += seg;
    }
    return nodes[nodes.length - 1];
}

function strokePathToDist(ctx, nodes, dist) {
    let drawnLen = 0;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 0; i < nodes.length - 1; i++) {
        let dx = nodes[i+1].x - nodes[i].x, dy = nodes[i+1].y - nodes[i].y;
        let segLen = Math.sqrt(dx * dx + dy * dy);
        if (drawnLen + segLen < dist) {
            ctx.lineTo(nodes[i+1].x, nodes[i+1].y);
            drawnLen += segLen;
        } else {
            let ratio = segLen > 0 ? (dist - drawnLen) / segLen : 0;
            ctx.lineTo(nodes[i].x + dx * ratio, nodes[i].y + dy * ratio);
            break;
        }
    }
    ctx.stroke();
}

function drawLadderNameBadge(ctx, x, y, name, color, layout) {
    const { boxW, boxH, nameFont } = layout;
    const displayName = truncateName(name, boxW > 70 ? 6 : 5);
    const fontSize = fitCanvasFont(ctx, displayName, boxW - 14, nameFont, 12, 900);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    const grad = ctx.createLinearGradient(x - boxW/2, y - boxH/2, x + boxW/2, y + boxH/2);
    grad.addColorStop(0, color); grad.addColorStop(1, shadeColor(color, -18));
    ctx.fillStyle = grad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - boxW/2, y - boxH/2, boxW, boxH, 10);
    else ctx.rect(x - boxW/2, y - boxH/2, boxW, boxH);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#fff';
    ctx.font = `900 ${fontSize}px Pretendard, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(displayName, x, y + 0.5);
    ctx.restore();
}

function shadeColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
    const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function injectGameUI() {
    const gameView = document.getElementById('view-game');
    if (gameView) {
        gameView.innerHTML = `
            <div class="game-container">
                <div class="game-sidebar">
                    <button id="tabRoulette" class="admin-btn active-game-tab" onclick="switchGameMode('roulette')">🎯<br>룰렛</button>
                    <button id="tabLadder" class="admin-btn" onclick="switchGameMode('ladder')">🪜<br>사다리</button>
                    <button id="btnBgmToggle" class="admin-btn" onclick="toggleBGM()" style="background: var(--bg-main); color: var(--text-main);">🔊 BGM</button>
                </div>
                <div class="game-main">
                    <div id="roulette-game-area" class="game-stage">
                        <div class="game-canvas-wrap">
                            <canvas id="rouletteCanvas" width="620" height="620"></canvas>
                        </div>
                    </div>
                    <div id="ladder-game-area" class="game-stage" style="display: none;">
                        <div class="game-canvas-wrap">
                            <canvas id="ladderCanvas" width="960" height="720"></canvas>
                        </div>
                    </div>
                    <div id="gameResult" class="game-result-banner"></div>
                    <div class="game-controls">
                        <button id="btnStartRoulette" class="game-start-btn" onclick="startRouletteAnimation()" style="display:none;">🎡 룰렛 돌리기 시작!</button>
                        <button id="btnStartLadder" class="game-start-btn" onclick="startLadderAnimation()" style="display:none;">🚀 사다리 타기 시작!</button>
                    </div>
                </div>
            </div>
        `;
    }
}

window.toggleBGM = function() {
    isBgmOn = !isBgmOn;
    const btn = document.getElementById('btnBgmToggle');
    if(isBgmOn) { btn.innerText = "🔊 BGM"; btn.style.color = "var(--text-main)"; }
    else { btn.innerText = "🔇 OFF"; btn.style.color = "var(--text-muted)"; }
    playUISound('click');
    if (isGameAnimating) { if (isBgmOn) startFunBGM(isRouletteMode ? 'roulette' : 'ladder'); else stopFunBGM(); }
}

window.switchGameMode = function(mode) {
    playUISound('click'); setGameResult('', '');
    if(mode === 'ladder') {
        isRouletteMode = false;
        document.getElementById('ladder-game-area').style.display = 'block'; document.getElementById('roulette-game-area').style.display = 'none';
        document.getElementById('tabLadder').classList.add('active-game-tab'); document.getElementById('tabRoulette').classList.remove('active-game-tab');
        setupLadder();
    } else {
        isRouletteMode = true;
        document.getElementById('ladder-game-area').style.display = 'none'; document.getElementById('roulette-game-area').style.display = 'block';
        document.getElementById('tabRoulette').classList.add('active-game-tab'); document.getElementById('tabLadder').classList.remove('active-game-tab');
        setupRoulette();
    }
};

window.startFunBGM = function(type) {
    if(!isBgmOn) return; initAudio(); let tick = 0;
    const notesRoulette = [392, 493, 587, 783]; const notesLadder = [523, 659, 783, 1046, 783, 659]; 
    const notes = type === 'roulette' ? notesRoulette : notesLadder; const speed = type === 'roulette' ? 185 : 130;
    ladderBgmTimer = setInterval(() => {
        if(!audioCtx) return; let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain(); osc.type = 'square'; osc.frequency.value = notes[tick % notes.length];
        gain.gain.setValueAtTime(uiVolume * 0.08, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (speed/1000) * 0.8);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + (speed/1000) * 0.8); tick++;
    }, speed); 
}

window.stopFunBGM = function() { if(ladderBgmTimer) { clearInterval(ladderBgmTimer); ladderBgmTimer = null; } }

window.playDrumroll = function(durationMs, callback) {
    if(!isBgmOn || !audioCtx) { setTimeout(callback, durationMs); return; }
    let elapsed = 0; let interval = 45; 
    let drumTimer = setInterval(() => {
        let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain(); osc.type = 'triangle';
        osc.frequency.setValueAtTime(100 + (elapsed/durationMs)*150, audioCtx.currentTime); gain.gain.setValueAtTime(uiVolume * 0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04); osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.04); elapsed += interval;
        if(elapsed >= durationMs) { clearInterval(drumTimer); if(callback) callback(); }
    }, interval);
}

window.setupLadder = function() {
    playUISound('click'); if(animReq) { cancelAnimationFrame(animReq); animReq = null; }
    stopFunBGM(); isGameAnimating = false;
    const canvas = document.getElementById('ladderCanvas'); const ctx = canvas.getContext('2d');
    ladderPlayers = timers.filter(t => t.student !== "(empty)").map(t => t.student);
    setGameResult('', ''); hideAllGameButtons();

    if(ladderPlayers.length < 2) {
        const wrap = canvas.parentElement;
        canvas.width = wrap.clientWidth; canvas.height = wrap.clientHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted');
        ctx.font = "bold 18px Pretendard, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("최소 2명 이상의 수업 중인 학생이 필요합니다.", canvas.width/2, canvas.height/2);
        return;
    }
    const container = canvas.parentElement; canvas.width = container.clientWidth; canvas.height = container.clientHeight;
    generateLadderData(); isResultRevealed = false; drawStaticLadder(true);
    showGameButton('btnStartLadder', '🚀 사다리 타기 시작!', false);
}

function generateLadderData() {
    ladderRungs = [];
    const cols = ladderPlayers.length;
    targetWinnerIndex = Math.floor(Math.random() * cols);
    const canvas = document.getElementById('ladderCanvas');
    const layout = getLadderLayout(cols, canvas.width, canvas.height);
    const rowCount = Math.max(36, Math.min(52, Math.floor((layout.ladderBottom - layout.ladderTop) / 13)));
    const rowGap = (layout.ladderBottom - layout.ladderTop) / rowCount;
    const colLastRow = new Array(cols).fill(-999);

    for (let row = 1; row < rowCount; row++) {
        const baseY = layout.ladderTop + row * rowGap;
        const blocked = new Set();
        const candidates = [];
        for (let c = 0; c < cols - 1; c++) {
            if (colLastRow[c] >= row - 1 || colLastRow[c + 1] >= row - 1) continue;
            if (Math.random() < 0.58) candidates.push(c);
        }
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }
        for (const c of candidates) {
            if (blocked.has(c) || blocked.has(c + 1)) continue;
            blocked.add(c); blocked.add(c + 1);
            const wave = (Math.random() - 0.5) * Math.min(10, rowGap * 0.4);
            ladderRungs.push({ col: c, yLeft: baseY + wave, yRight: baseY - wave * 0.65 });
            colLastRow[c] = row;
            colLastRow[c + 1] = row;
        }
        if (row % 4 === 0 && !ladderRungs.some(r => Math.abs(r.yLeft - baseY) < rowGap * 0.55)) {
            for (let attempt = 0; attempt < 20; attempt++) {
                const c = Math.floor(Math.random() * (cols - 1));
                if (colLastRow[c] < row - 1 && colLastRow[c + 1] < row - 1) {
                    const wave = (Math.random() - 0.5) * 6;
                    ladderRungs.push({ col: c, yLeft: baseY + wave, yRight: baseY - wave * 0.5 });
                    colLastRow[c] = row; colLastRow[c + 1] = row;
                    break;
                }
            }
        }
    }
    ladderRungs.sort((a, b) => a.yLeft - b.yLeft);
}

function drawStaticLadder(drawTopNames) {
    const canvas = document.getElementById('ladderCanvas'); const ctx = canvas.getContext('2d');
    const w = canvas.width; const h = canvas.height; const cols = ladderPlayers.length; const layout = getLadderLayout(cols, w, h);
    const { spacing, ladderTop, ladderBottom } = layout;
    ctx.clearRect(0, 0, w, h);
    const lineColor = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#cbd5e1';
    const accentColor = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#2563eb';
    const mutedColor = getComputedStyle(document.body).getPropertyValue('--text-muted').trim() || '#64748b';

    ctx.lineCap = "round";
    ctx.lineWidth = 4; ctx.strokeStyle = lineColor;
    for(let i=0; i<cols; i++) {
        let x = (i + 0.5) * spacing;
        ctx.beginPath(); ctx.moveTo(x, ladderTop); ctx.lineTo(x, ladderBottom); ctx.stroke();
    }
    ctx.lineWidth = 6; ctx.strokeStyle = '#64748b';
    ladderRungs.forEach(r => {
        let x1 = (r.col + 0.5) * spacing, x2 = (r.col + 1.5) * spacing;
        ctx.beginPath(); ctx.moveTo(x1, r.yLeft); ctx.lineTo(x2, r.yRight); ctx.stroke();
    });

    const bottomFont = Math.max(14, Math.min(18, Math.floor(spacing * 0.2)));
    for(let i=0; i<cols; i++) {
        let x = (i + 0.5) * spacing;
        if(i === targetWinnerIndex) {
            ctx.save();
            ctx.font = `900 ${bottomFont}px Pretendard, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            const pillW = Math.min(spacing * 0.78, 72), pillH = 30;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(x - pillW/2, ladderBottom + 10, pillW, pillH, 15);
            else ctx.rect(x - pillW/2, ladderBottom + 10, pillW, pillH);
            ctx.fillStyle = 'rgba(37,99,235,0.12)'; ctx.fill();
            ctx.fillStyle = accentColor;
            ctx.fillText('🎁 당첨', x, ladderBottom + 25);
            ctx.restore();
        } else {
            ctx.fillStyle = mutedColor; ctx.font = `700 ${bottomFont - 1}px Pretendard, sans-serif`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText('꽝', x, ladderBottom + 25);
        }
    }

    if (drawTopNames) {
        for(let p=0; p<cols; p++) {
            drawLadderNameBadge(ctx, (p + 0.5) * spacing, layout.topPad + layout.boxH / 2, ladderPlayers[p], ladderColors[p % ladderColors.length], layout);
        }
    }
}

window.startLadderAnimation = function() {
    playUISound('click'); startFunBGM('ladder');
    hideAllGameButtons(); setGameResult('결과를 향해 내려갑니다... 👀', 'is-waiting');
    isResultRevealed = false; isGameAnimating = true; if(animReq) cancelAnimationFrame(animReq);

    const canvas = document.getElementById('ladderCanvas'); const ctx = canvas.getContext('2d');
    const cols = ladderPlayers.length;
    const layout = getLadderLayout(cols, canvas.width, canvas.height);
    const brandDanger = getComputedStyle(document.body).getPropertyValue('--brand-danger').trim() || '#ef4444';
    const paths = buildLadderPaths(cols, layout.spacing, layout.ladderTop, layout.ladderBottom);
    const maxLen = Math.max(...paths.map(p => p.totalLen));
    const LADDER_SPEED = 1.5;
    const LADDER_STAGGER = 24;
    let frame = 0;

    function drawPathsAndIcons() {
        ctx.lineWidth = 8; ctx.lineJoin = "round"; ctx.lineCap = "round";
        for (let p = 0; p < cols; p++) {
            const pathProg = Math.max(0, (frame - p * LADDER_STAGGER)) * LADDER_SPEED;
            if (pathProg <= 0) continue;
            const pathObj = paths[p];
            ctx.strokeStyle = pathObj.color; ctx.globalAlpha = 0.6;
            strokePathToDist(ctx, pathObj.nodes, Math.min(pathProg, pathObj.totalLen));
        }

        ctx.globalAlpha = 1.0;
        for (let p = 0; p < cols; p++) {
            const pathProg = Math.max(0, (frame - p * LADDER_STAGGER)) * LADDER_SPEED;
            if (pathProg <= 0) continue;
            const pathObj = paths[p];
            const currentProg = Math.min(pathProg, pathObj.totalLen);
            const pt = getPointOnPath(pathObj.nodes, currentProg);
            const isHidden = (!isResultRevealed) && (currentProg > pathObj.totalLen * 0.88);
            if (isHidden) {
                ctx.save();
                ctx.fillStyle = pathObj.color; ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 4;
                ctx.beginPath(); ctx.arc(pt.x, pt.y, 18, 0, Math.PI * 2); ctx.fill();
                ctx.shadowColor = 'transparent';
                ctx.fillStyle = '#fff'; ctx.font = '900 20px Pretendard, sans-serif';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', pt.x, pt.y);
                ctx.restore();
            } else {
                drawLadderNameBadge(ctx, pt.x, pt.y, ladderPlayers[p], pathObj.color, layout);
            }
        }
    }

    function drawFrame() {
        drawStaticLadder(true);
        drawPathsAndIcons();
        frame++;
        const totalFrames = maxLen / LADDER_SPEED + LADDER_STAGGER * cols;
        if (frame < totalFrames) {
            animReq = requestAnimationFrame(drawFrame);
        } else {
            isGameAnimating = false; stopFunBGM();
            drawStaticLadder(false); drawPathsAndIcons();
            setGameResult('결과 발표... 두구두구두구! 🥁', 'is-waiting');
            playDrumroll(2800, () => {
                isResultRevealed = true;
                drawStaticLadder(false);
                for (let p = 0; p < cols; p++) {
                    const pathObj = paths[p];
                    const pt = getPointOnPath(pathObj.nodes, pathObj.totalLen);
                    drawLadderNameBadge(ctx, pt.x, pt.y, ladderPlayers[p], pathObj.color, layout);
                }
                let winnerPathObj = paths.find(p => p.finalCol === targetWinnerIndex);
                if (winnerPathObj) {
                    ctx.save(); ctx.strokeStyle = brandDanger; ctx.lineWidth = 12; ctx.globalAlpha = 0.9;
                    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
                    ctx.beginPath(); ctx.moveTo(winnerPathObj.nodes[0].x, winnerPathObj.nodes[0].y);
                    for (let i = 0; i < winnerPathObj.nodes.length - 1; i++) {
                        ctx.lineTo(winnerPathObj.nodes[i+1].x, winnerPathObj.nodes[i+1].y);
                    }
                    ctx.stroke(); ctx.restore();
                }
                let realWinnerName = "";
                for (let p = 0; p < cols; p++) {
                    if (paths[p].finalCol === targetWinnerIndex) { realWinnerName = ladderPlayers[p]; break; }
                }
                playUISound('finish');
                setGameResult(`🎉 축하합니다! <span class="winner-name">${realWinnerName}</span> 학생이 당첨! 🎉`, 'is-winner');
                showGameButton('btnStartLadder', '🎬 다시 보기', true);
            });
        }
    }
    animReq = requestAnimationFrame(drawFrame);
}

window.setupRoulette = function() {
    playUISound('click'); if(animReq) { cancelAnimationFrame(animReq); animReq = null; }
    stopFunBGM(); rouletteSpinning = false; isGameAnimating = false;
    roulettePlayers = timers.filter(t => t.student !== "(empty)").map(t => t.student);
    setGameResult('', ''); hideAllGameButtons();
    const canvas = document.getElementById('rouletteCanvas'); const ctx = canvas.getContext('2d');
    const wrap = canvas.parentElement;
    const size = Math.min(620, wrap ? wrap.clientWidth - 16 : 620);
    canvas.width = size; canvas.height = size;
    if(roulettePlayers.length < 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted');
        ctx.font = "bold 18px Pretendard, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("최소 2명 이상의 수업 중인 학생이 필요합니다.", canvas.width/2, canvas.height/2);
        return;
    }
    rouletteAngle = 0; drawRoulette(rouletteAngle, -1);
    showGameButton('btnStartRoulette', '🎡 룰렛 돌리기 시작!', false);
}

function drawRoulette(angle, highlightIndex) {
    const canvas = document.getElementById('rouletteCanvas'); const ctx = canvas.getContext('2d');
    const cw = canvas.width; const ch = canvas.height; const cx = cw / 2; const cy = ch / 2;
    const outerR = Math.min(cw, ch) / 2 - 8;
    const radius = outerR - 14;
    ctx.clearRect(0, 0, cw, ch);
    const numSlices = roulettePlayers.length; const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
    ctx.fillStyle = '#e2e8f0'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#cbd5e1'; ctx.stroke();
    ctx.restore();

    for(let i = 0; i < numSlices; i++) {
        const startAngle = angle + i * sliceAngle; const endAngle = startAngle + sliceAngle;
        const isWinner = highlightIndex === i;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, startAngle, endAngle); ctx.closePath();
        const baseColor = ladderColors[i % ladderColors.length];
        ctx.fillStyle = isWinner ? shadeColor(baseColor, 12) : baseColor;
        ctx.fill();
        ctx.lineWidth = isWinner ? 3 : 2;
        ctx.strokeStyle = isWinner ? '#fff' : 'rgba(255,255,255,0.85)';
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + sliceAngle / 2);
        const name = roulettePlayers[i];
        const maxTextW = radius - 36;
        const fontSize = fitCanvasFont(ctx, name, maxTextW, Math.min(22, Math.max(14, Math.floor(radius / numSlices * 0.55))), 12, '900');
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${fontSize}px Pretendard, sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 1;
        ctx.fillText(truncateName(name, fontSize >= 18 ? 8 : 6), radius - 18, 0);
        ctx.restore();
    }

    ctx.beginPath(); ctx.arc(cx, cy, Math.max(28, radius * 0.12), 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(28, radius * 0.12));
    hubGrad.addColorStop(0, '#ffffff'); hubGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = hubGrad; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent') || '#2563eb'; ctx.stroke();

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - outerR + 6);
    ctx.lineTo(cx + 16, cy - outerR + 6);
    ctx.lineTo(cx, cy - outerR + 34);
    ctx.closePath();
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--brand-danger') || '#ef4444';
    ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.restore();
}

window.startRouletteAnimation = function() {
    if(rouletteSpinning) return;
    playUISound('start'); startFunBGM('roulette');
    hideAllGameButtons(); setGameResult('룰렛이 돌아가고 있어요... 🎡', 'is-waiting');
    rouletteSpinning = true; isGameAnimating = true; if(animReq) cancelAnimationFrame(animReq);

    let speed = Math.random() * 0.05 + 0.08;
    let totalRotation = 0;
    let lastTickSlice = -1;
    let msgPhase = 0;
    const minRotation = Math.PI * 18;

    function getFriction(spd) {
        if (spd > 0.09) return 0.997;
        if (spd > 0.045) return 0.994;
        if (spd > 0.022) return 0.990;
        if (spd > 0.010) return 0.985;
        if (spd > 0.004) return 0.978;
        if (spd > 0.0015) return 0.970;
        return 0.948;
    }

    function finishRoulette() {
        rouletteSpinning = false; isGameAnimating = false; stopFunBGM();
        const numSlices = roulettePlayers.length;
        const sliceAngle = (2 * Math.PI) / numSlices;
        let offsetAngle = ((3 * Math.PI / 2) - rouletteAngle) % (2 * Math.PI);
        if (offsetAngle < 0) offsetAngle += 2 * Math.PI;
        const winningIndex = Math.floor(offsetAngle / sliceAngle);
        const winnerName = roulettePlayers[winningIndex];
        drawRoulette(rouletteAngle, winningIndex);
        playUISound('finish');
        setGameResult(`🎉 축하합니다! <span class="winner-name">${winnerName}</span> 학생이 당첨! 🎉`, 'is-winner');
        showGameButton('btnStartRoulette', '🎬 다시 돌리기', true);
    }

    function spin() {
        rouletteAngle += speed;
        totalRotation += speed;
        drawRoulette(rouletteAngle, -1);

        const numSlices = roulettePlayers.length;
        const sliceAngle = (2 * Math.PI) / numSlices;
        let offsetAngle = ((3 * Math.PI / 2) - rouletteAngle) % (2 * Math.PI);
        if (offsetAngle < 0) offsetAngle += 2 * Math.PI;
        const curSlice = Math.floor(offsetAngle / sliceAngle);

        if (speed < 0.07 && curSlice !== lastTickSlice) {
            lastTickSlice = curSlice;
            playUISound('click');
        }

        speed *= getFriction(speed);

        if (speed < 0.04 && msgPhase < 1) { msgPhase = 1; setGameResult('점점 느려지고 있어요... 🎡', 'is-waiting'); }
        if (speed < 0.015 && msgPhase < 2) { msgPhase = 2; setGameResult('두구두구... 과연 누구?! 😱', 'is-waiting'); }
        if (speed < 0.005 && msgPhase < 3) { msgPhase = 3; setGameResult('🥁 거의 다 왔어요!!', 'is-waiting'); }
        if (speed < 0.0018 && msgPhase < 4) { msgPhase = 4; setGameResult('🏁 마지막 한 칸...!!', 'is-waiting'); }

        if (totalRotation < minRotation && speed < 0.0025) speed = 0.0025;

        if (speed > 0.00035) {
            animReq = requestAnimationFrame(spin);
        } else {
            finishRoulette();
        }
    }
    spin();
}

// =========================================================================
// ⭐ 설정창 '명단 관리' 테이블 
// =========================================================================
window.settingsSortConfig = { col: '', asc: true };

window.sortSettingsRoster = function(col) {
    playUISound('click');
    const tbody = document.getElementById('settingsRosterBody'); 
    const rows = tbody.querySelectorAll('tr');
    let tempRoster = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input'); const select = row.querySelector('select');
        const name = inputs[0]?.value.trim(); const grade = inputs[1]?.value.trim();
        const level = select?.value; const time = parseInt(inputs[2]?.value) || 50; 
        const weeklyMinutes = parseInt(inputs[3]?.value) || DEFAULT_WEEKLY_MINUTES;
        const birthday = inputs[4] ? inputs[4].value.trim() : '';
        if(name) { tempRoster.push({name, grade, level, time, birthday, weeklyMinutes}); }
    });
    studentMasterList = tempRoster;

    if (settingsSortConfig.col === col) { settingsSortConfig.asc = !settingsSortConfig.asc; } 
    else { settingsSortConfig.col = col; settingsSortConfig.asc = true; }

    studentMasterList.sort((a, b) => {
        let res = 0;
        if (col === 'name') res = a.name.localeCompare(b.name, 'ko-KR');
        else if (col === 'grade') res = getGradeWeight(a.grade) - getGradeWeight(b.grade);
        else if (col === 'level') res = getLevelWeight(a.level) - getLevelWeight(b.level);
        if (res === 0) res = a.name.localeCompare(b.name, 'ko-KR');
        return settingsSortConfig.asc ? res : -res;
    });

    renderSettingsRoster();
    ['name', 'grade', 'level'].forEach(c => { 
        let th = document.getElementById(`th-set-${c}`); 
        if(th) { 
            th.classList.remove('sort-asc', 'sort-desc'); 
            if(c === settingsSortConfig.col) th.classList.add(settingsSortConfig.asc ? 'sort-asc' : 'sort-desc'); 
        } 
    });
};

window.updateSelectColor = function(selectEl) {
    const val = selectEl.value; let bg = '#ffffff', color = '#000000';
    if(val === 'PRE') { bg = 'var(--selena-yellow)'; color = '#000'; } else if(val === 'BASIC') { bg = 'var(--selena-pink)'; color = '#fff'; } else if(val === 'INTER') { bg = 'var(--selena-orange)'; color = '#fff'; } else if(val === 'ADV') { bg = 'var(--selena-cyan)'; color = '#fff'; } else if(val === 'PREP') { bg = 'var(--selena-brown)'; color = '#fff'; }
    selectEl.style.backgroundColor = bg; selectEl.style.color = color;
};

function injectSettingsRosterUI() {
    const container = document.getElementById('roster-history-container');
    if(!container || container.dataset.rosterInjected) return;
    container.dataset.rosterInjected = '1';
    container.innerHTML = `
        <p class="history-view-hint hint-roster">학생 이름·학년·레벨·수업시간·생일을 편집합니다. 변경 후 반드시 하단의 저장 버튼을 눌러야 적용됩니다.</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px; flex-shrink: 0;">
            <h3 style="margin:0; font-size:22px; font-weight:900;" data-i18n="rosterMgt">📋 학생 명단 관리</h3>
            <button class="admin-btn btn-3d" onclick="addSettingsStudentRow()" style="margin:0; width:auto; padding:12px 20px; font-size:16px; font-weight:900; background:var(--brand-success); color:#fff;">➕ 새로운 학생 추가</button>
        </div>
        <div class="roster-table-scroll">
            <table class="settings-roster-table" id="settingsRosterTable">
                <thead style="position: sticky; top: 0; z-index: 2; background: var(--bg-main); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <tr>
                        <th onclick="sortSettingsRoster('name')" class="sortable" id="th-set-name" style="width: 13%;">이름</th>
                        <th onclick="sortSettingsRoster('grade')" class="sortable" id="th-set-grade" style="width: 12%;">학년</th>
                        <th onclick="sortSettingsRoster('level')" class="sortable" id="th-set-level" style="width: 18%;">레벨</th>
                        <th style="width: 11%;">수업시간(분)</th>
                        <th style="width: 13%;">주간목표(분)</th>
                        <th style="width: 13%;">생일(MM-DD)</th>
                        <th style="width: 12%;">관리</th>
                    </tr>
                </thead>
                <tbody id="settingsRosterBody"></tbody>
            </table>
        </div>
        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px; flex-shrink: 0;">
            <button class="admin-btn btn-3d primary" onclick="saveSettingsRoster()" style="width: auto; padding: 16px 40px; font-size: 18px; font-weight: 900;" data-i18n="saveRoster">💾 작성한 명단 전체 저장 및 적용하기</button>
            <button class="admin-btn btn-3d" onclick="switchView('roster');" style="width: auto; padding: 16px 40px; background: var(--bg-card); color: var(--text-main); border: 2px solid var(--border); font-size: 16px; font-weight: 900;">📋 투데이 플로우 창으로 가기</button>
        </div>
    `;
}

function renderSettingsRoster() {
    const tbody = document.getElementById('settingsRosterBody'); if(!tbody) return; tbody.innerHTML = '';
    if(studentMasterList.length === 0) { addSettingsStudentRow(); return; }
    studentMasterList.forEach(st => { tbody.insertAdjacentHTML('beforeend', createStudentRowHTML(st.name, st.grade, st.level, st.time, st.birthday, st.weeklyMinutes)); });
    tbody.querySelectorAll('select').forEach(sel => updateSelectColor(sel));
}

function createStudentRowHTML(name = '', grade = '', level = 'PRE', time = 50, birthday = '', weeklyMinutes = DEFAULT_WEEKLY_MINUTES) {
    const weekMins = weeklyMinutes || DEFAULT_WEEKLY_MINUTES;
    return `<tr>
        <td><input type="text" class="settings-roster-input" value="${name}" placeholder="이름"></td>
        <td><input type="text" class="settings-roster-input" value="${grade}" placeholder="학년"></td>
        <td><select class="settings-roster-select" onchange="updateSelectColor(this)"><option value="PRE" ${level==='PRE'?'selected':''}>PRE</option><option value="BASIC" ${level==='BASIC'?'selected':''}>BASIC</option><option value="INTER" ${level==='INTER'?'selected':''}>INTER</option><option value="ADV" ${level==='ADV'?'selected':''}>ADV</option><option value="PREP" ${level==='PREP'?'selected':''}>PREP31</option></select></td>
        <td><input type="number" class="settings-roster-input" value="${time}" min="1" max="300"></td>
        <td><input type="number" class="settings-roster-input" value="${weekMins}" min="1" max="2000" title="한 주 총 수업 목표(분)"></td>
        <td><input type="text" class="settings-roster-input" value="${birthday}" placeholder="04-23"></td>
        <td><button class="btn-delete-row" onclick="deleteSettingsStudentRow(this)">삭제</button></td>
    </tr>`;
}

window.addSettingsStudentRow = function() {
    const tbody = document.getElementById('settingsRosterBody');
    if(tbody) { tbody.insertAdjacentHTML('afterbegin', createStudentRowHTML()); let newSelect = tbody.querySelector('select'); if(newSelect) updateSelectColor(newSelect); playUISound('click'); }
};
window.deleteSettingsStudentRow = function(btn) { if(confirm("이 학생을 명단에서 삭제하시겠습니까?")) { btn.closest('tr').remove(); playUISound('cancel'); } };

window.saveSettingsRoster = function() {
    playUISound('finish');
    const tbody = document.getElementById('settingsRosterBody'); const rows = tbody.querySelectorAll('tr');
    studentMasterList = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input'); const select = row.querySelector('select');
        const name = inputs[0].value.trim(); const grade = inputs[1].value.trim();
        const level = select.value; const time = parseInt(inputs[2].value) || 50; 
        const weeklyMinutes = parseInt(inputs[3].value) || DEFAULT_WEEKLY_MINUTES;
        const birthday = inputs[4] ? inputs[4].value.trim() : '';
        if(name) { studentMasterList.push({name, grade, level, time, birthday, weeklyMinutes}); }
    });
    saveToStorage(); generateStudents(); renderHistorySidebar(); alert("학생 명단이 성공적으로 저장되었습니다!");
};

// =========================================================================
// ⭐ 히스토리 기록 (HISTORY) 시스템 UI 
// =========================================================================
function injectHistoryUI() {
    const historyTabBtn = document.querySelector('.nav-tab[onclick*="history"]') || document.querySelector('.nav-tab[onclick*="log"]');
    if (historyTabBtn) {
        historyTabBtn.setAttribute('onclick', "switchView('history')");
        historyTabBtn.innerHTML = `<span class="nav-icon">📅</span><span class="nav-text" data-i18n="nav3">학생 기록</span>`;
        historyTabBtn.style.fontFamily = "var(--app-font, 'Pretendard', sans-serif)";
    }

    const historyView = document.getElementById('view-history') || document.getElementById('view-log');
    if (historyView) {
        historyView.id = 'view-history';
        historyView.className = 'view-section';
        historyView.innerHTML = `
            <div class="history-top-bar">
                <button id="tab-history-monthly" class="history-tab-btn ht-monthly active" onclick="switchHistoryMode('monthly')"><span class="ht-icon">👤</span><span class="ht-title">월간 개인 기록</span></button>
                <button id="tab-history-weekly" class="history-tab-btn ht-weekly" onclick="switchHistoryMode('weekly')"><span class="ht-icon">🗓️</span><span class="ht-title">주간 전체 출결</span></button>
                <button id="tab-history-stats" class="history-tab-btn ht-stats" onclick="switchHistoryMode('stats')"><span class="ht-icon">📈</span><span class="ht-title">통계 그래프</span></button>
                <button id="tab-history-desklog" class="history-tab-btn ht-desklog" onclick="switchHistoryMode('desklog')"><span class="ht-icon">🪑</span><span class="ht-title">책상 이용 기록</span></button>
                <button id="tab-history-roster" class="history-tab-btn ht-roster" onclick="switchHistoryMode('roster')"><span class="ht-icon">📋</span><span class="ht-title">학생 명단 관리</span></button>
                <div class="history-tab-divider" aria-hidden="true"></div>
                <button id="tab-history-daily" class="history-tab-btn ht-daily" onclick="switchHistoryMode('daily')"><span class="ht-icon">📊</span><span class="ht-title">일일 마감 보고서</span></button>
            </div>

            <div id="monthly-history-container" class="monthly-history-container active">
                <div class="history-sidebar">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h3>👥 원생 목록</h3>
                    </div>
                    <div class="history-sidebar-header-row">
                        <div class="sidebar-th" onclick="sortHistorySidebar('name')" id="sb-th-name">이름</div>
                        <div class="sidebar-th" onclick="sortHistorySidebar('grade')" id="sb-th-grade">학년</div>
                        <div class="sidebar-th" onclick="sortHistorySidebar('level')" id="sb-th-level">레벨</div>
                    </div>
                    <div id="historyStudentList" style="overflow-y:auto; flex:1;"></div>
                </div>
                <div class="history-content">
                    <p class="history-view-hint hint-monthly">왼쪽 목록에서 학생을 선택하면, 달력에서 날짜별 학습시간·출결·칭찬·벌점·메모를 확인할 수 있습니다.</p>
                    <div class="calendar-header" style="position: relative;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <button class="cal-nav-btn" onclick="changeHistoryMonth(-1)">◀ 이전</button>
                            <h2 id="historyMonthTitle">2026년 5월</h2>
                            <button class="cal-nav-btn" onclick="changeHistoryMonth(1)">다음 ▶</button>
                            <button class="cal-nav-btn" onclick="goToTodayHistory()" style="background:var(--accent); color:white; border-color:var(--accent); margin-left:5px;">오늘</button>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button class="btn-danger-outline" onclick="deleteHistoryAll()" style="padding: 8px 12px; font-size:13px;">🚨 전체 기록 삭제</button>
                            <button class="export-btn" onclick="exportMonthlyToExcel()" style="position: static; padding: 8px 12px; font-size:13px;">💾 엑셀 저장</button>
                        </div>
                    </div>
                    <div class="monthly-mod-summary" id="monthlyModSummary" style="display:none;"></div>
                    <div class="cal-grid-header">
                        <div class="cal-day-header" style="color:#ef4444;">일</div><div class="cal-day-header">월</div><div class="cal-day-header">화</div><div class="cal-day-header">수</div><div class="cal-day-header">목</div><div class="cal-day-header">금</div><div class="cal-day-header" style="color:#3b82f6;">토</div>
                    </div>
                    <div class="cal-grid" id="historyCalGrid"></div>
                    
                    <div class="history-detail-popup" id="historyDetailPopup">
                        <button class="popup-close-btn" onclick="closeHistoryDetail()">✖</button>
                        <div class="detail-title">📅 <span id="detailDateText">날짜 선택됨</span></div>
                        <div style="display:flex; gap: 8px; margin-bottom:15px; flex-wrap:wrap;">
                            <button id="btnToggleAcadHoliday" class="btn-acad-holiday" onclick="toggleAcademyHoliday()">🏝️ 학원 휴무</button>
                            <button id="btnToggleTempOff" class="btn-no-class" onclick="toggleTempOffDay()">🚫 하루 결석/휴무</button>
                            <button id="btnToggleRegOff" class="btn-reg-off" onclick="toggleRegOffDay()">📅 매주 이 요일 휴무</button>
                            <button id="btnDeleteDay" class="btn-danger-outline" onclick="deleteHistoryDate()">🗑️ 리셋</button>
                        </div>
                        <div class="detail-stats" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                            <div class="detail-stat-item">⏱️ 총 학습<br><span id="detailTotalMins" style="color:var(--accent); font-size:20px; display:block; margin-top:5px;">0</span>분</div>
                            <div class="detail-stat-item">⏰ 출결 시간<br><span id="detailTimeLogs" style="color:var(--text-main); font-size:14px; display:block; margin-top:5px; font-family:'JetBrains Mono';">-</span></div>
                            <div class="detail-stat-item">😊 칭찬<br><span id="detailCoupons" style="color:#f59e0b; font-size:20px; display:block; margin-top:5px;">0</span>회</div>
                            <div class="detail-stat-item">😠 벌점<br><span id="detailPenalties" style="color:var(--brand-danger); font-size:20px; display:block; margin-top:5px;">0</span>회</div>
                        </div>
                        <textarea id="detailNoteInput" class="detail-textarea" placeholder="특이사항(비고)을 입력하세요..."></textarea>
                        <p id="detailLeaveHint" class="history-view-hint" style="display:none; margin: -8px 0 12px 0; padding: 10px 12px; font-size: 13px; border-left-color: #64748b;">🚫 휴원일에는 아래 메모란에 <strong>휴원 사유</strong>를 적어 주세요.</p>
                        <button class="detail-save-btn" onclick="saveHistoryNote()">💾 메모 저장 및 닫기</button>
                        <div style="clear:both;"></div>
                    </div>
                </div>
            </div>

            <div id="weekly-history-container">
                <p class="history-view-hint hint-weekly">모든 학생의 주간 출결을 한 표에서 확인합니다. 수업 시작~종료·학습 분·칭찬·벌점은 타이머가 자동 기록하며, 월~금 합계와 주간 목표(기본 250분)를 비교해 부족·초과 분을 확인할 수 있습니다.</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; position: relative;">
                    <div style="display:flex; align-items:center; gap:10px; margin: 0 auto;">
                        <button class="cal-nav-btn" onclick="changeWeeklyDate(-7)">◀ 이전 주</button>
                        <h2 id="weeklyTitle" style="margin: 0; font-size: 24px; font-weight: 900; color: var(--accent);">2026.05.18 ~ 2026.05.24</h2>
                        <button class="cal-nav-btn" onclick="changeWeeklyDate(7)">다음 주 ▶</button>
                        <button class="cal-nav-btn" onclick="goToThisWeek()" style="background:var(--accent); color:white; border-color:var(--accent); margin-left:5px;">이번 주</button>
                    </div>
                    <button class="export-btn" onclick="exportWeeklyToExcel()">💾 이 주간 표 엑셀 저장</button>
                </div>
                <div class="weekly-table-wrapper">
                    <table class="weekly-table">
                        <thead id="weeklyTableHead"></thead>
                        <tbody id="weeklyTableBody"></tbody>
                    </table>
                </div>
            </div>

            <div id="stats-history-container">
                <p class="history-view-hint hint-stats">주간·월간 출석율, 학습시간, 칭찬·벌점 순위를 그래프로 한눈에 비교합니다.</p>
                <div class="stats-control-panel">
                    <div class="stats-toolbar-row stats-toolbar-period">
                        <div class="stats-toolbar-group">
                            <span class="stats-toolbar-label">기간</span>
                            <div class="stats-segmented">
                                <button id="stats-btn-weekly" class="stats-period-btn active" onclick="switchStatsPeriod('weekly')">📅 주간</button>
                                <button id="stats-btn-monthly" class="stats-period-btn" onclick="switchStatsPeriod('monthly')">🗓️ 월간</button>
                            </div>
                        </div>
                        <div class="stats-toolbar-group stats-nav-group" id="statsNavRow"></div>
                    </div>
                    <div class="stats-toolbar-row stats-toolbar-metric">
                        <span class="stats-toolbar-label">순위</span>
                        <div class="stats-segmented stats-metric-segmented">
                            <button id="stats-btn-rate" class="stats-period-btn active" onclick="switchStatsMetric('rate')">📊 출석율</button>
                            <button id="stats-btn-mins" class="stats-period-btn" onclick="switchStatsMetric('mins')">⏱️ 학습시간</button>
                            <button id="stats-btn-praise" class="stats-period-btn" onclick="switchStatsMetric('praise')">😊 칭찬</button>
                            <button id="stats-btn-penalty" class="stats-period-btn" onclick="switchStatsMetric('penalty')">😠 벌점</button>
                        </div>
                    </div>
                    <div class="stats-summary-row" id="statsSummaryRow"></div>
                </div>
                <div class="stats-charts-grid" id="statsChartsGrid"></div>
            </div>
            
            <div id="daily-history-container">
                <p class="history-view-hint hint-daily">오늘 등원·출석·휴원 현황을 확인하고, 수업이 끝나면 아래에서 메모장 저장 또는 수업종료를 진행하세요.</p>
                <div class="daily-header-row">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 900; color: #059669;">📊 일일 마감 보고서</h2>
                    <div class="daily-date-nav">
                        <input type="date" id="dailySummaryDate" class="settings-input" style="width:160px; font-size:16px; padding:6px 12px; font-family:'Pretendard';" onchange="renderDailySummary()">
                        <button class="cal-nav-btn" onclick="ensureDailySummaryDate(true); renderDailySummary();" style="background:var(--accent); color:white; border-color:var(--accent);">오늘 보기</button>
                    </div>
                </div>
                <div class="daily-close-bar">
                    <span class="daily-close-label">🏁 오늘 수업 마감</span>
                    <div class="daily-close-btns">
                        <button class="export-btn" onclick="exportDailySummaryToTxt()">📝 메모장 저장 (.txt)</button>
                        <button id="btnEndClassDay" class="btn-end-class-day btn-3d" onclick="endClassDay()">🏁 수업종료</button>
                    </div>
                </div>
                <div class="daily-summary-grid">
                    <div class="ds-card ds-waiting">
                        <div class="ds-header"><span data-i18n="dsWaiting">⏳ 등원 대기 학생들</span> <span id="ds-waiting-count" style="font-size:28px;">0</span></div>
                        <div class="ds-list" id="ds-waiting-list"></div>
                    </div>
                    <div class="ds-card ds-attended">
                        <div class="ds-header"><span data-i18n="dsAttended" style="color:#059669;">✔️ 출석 학생들</span> <span id="ds-attended-count" style="font-size:28px;">0</span></div>
                        <div class="ds-list" id="ds-attended-list"></div>
                    </div>
                    <div class="ds-card ds-off">
                        <div class="ds-header"><span data-i18n="dsOffAbsent" style="color:#64748b;">🚫 휴원 또는 결석 학생들</span> <span id="ds-offabsent-count" style="font-size:28px;">0</span></div>
                        <div class="ds-list" id="ds-offabsent-list"></div>
                    </div>
                </div>
            </div>

            <div id="roster-history-container"></div>

            <div id="desklog-history-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 12px;">
                    <div style="display:flex; align-items:center; gap:15px; flex-wrap: wrap;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: 900; color: #4f46e5;">🪑 책상 이용 기록</h2>
                        <input type="date" id="deskLogDate" class="settings-input" style="width:160px; font-size:16px; padding:6px 12px; font-family:'Pretendard';" onchange="renderDeskSeatLog()">
                        <button class="cal-nav-btn" onclick="ensureDeskLogDate(true); renderDeskSeatLog();" style="background:#4f46e5; color:white; border-color:#4f46e5;">오늘 보기</button>
                    </div>
                </div>
                <p class="history-view-hint hint-desklog">책상별로 누가 몇 시에 앉아서 수업을 시작·종료했는지 확인합니다. 시작 버튼 시각과 완료·취소 시각이 자동 기록됩니다.</p>
                <div class="desklog-grid" id="deskLogGrid"></div>
            </div>
        `;
    }
    injectSettingsRosterUI();
}

// ⭐ 사이드바 명단 정렬 기능
window.sortHistorySidebar = function(col) {
    playUISound('click');
    if (historySidebarSortConfig.col === col) {
        historySidebarSortConfig.asc = !historySidebarSortConfig.asc;
    } else {
        historySidebarSortConfig.col = col;
        historySidebarSortConfig.asc = true;
    }
    renderHistorySidebar();
};

function renderHistorySidebar() {
    const listEl = document.getElementById('historyStudentList'); if(!listEl) return;
    
    // 헤더 정렬 아이콘 업데이트
    ['name', 'grade', 'level'].forEach(c => {
        let th = document.getElementById(`sb-th-${c}`);
        if(th) {
            th.classList.remove('sort-asc', 'sort-desc');
            if (c === historySidebarSortConfig.col) th.classList.add(historySidebarSortConfig.asc ? 'sort-asc' : 'sort-desc');
        }
    });

    let students = studentMasterList.map(st => ({ name: st.name, grade: st.grade || '', level: st.level || 'GUEST', birthday: st.birthday }));
    
    students.sort((a, b) => {
        let res = 0;
        if(historySidebarSortConfig.col === 'name') res = a.name.localeCompare(b.name, 'ko-KR');
        else if(historySidebarSortConfig.col === 'grade') res = getGradeWeight(a.grade) - getGradeWeight(b.grade);
        else if(historySidebarSortConfig.col === 'level') res = getLevelWeight(a.level) - getLevelWeight(b.level);
        if(res === 0) res = a.name.localeCompare(b.name, 'ko-KR');
        return historySidebarSortConfig.asc ? res : -res;
    });

    listEl.innerHTML = '';
    students.forEach(st => {
        const item = document.createElement('div'); 
        item.className = 'history-student-item';
        if (currentHistoryStudent === st.name) item.classList.add('active');
        
        let crown = isTodayBirthday(st.birthday) ? " <span style='font-size:12px;'>🎉</span>" : "";
        let levelLabel = (st.level === 'PREP') ? 'PREP31' : (st.level === 'ADV' ? 'ADV' : st.level);
        
        item.innerHTML = `
            <div class="s-name">${st.name}${crown}</div>
            <div class="s-grade">${st.grade || '-'}</div>
            <div class="s-level">${levelLabel}</div>
        `;
        item.onclick = () => { selectHistoryStudent(st.name); }; 
        listEl.appendChild(item);
    });
}

window.selectHistoryStudent = function(name) { playUISound('click'); currentHistoryStudent = name; closeHistoryDetail(); renderHistorySidebar(); renderHistoryCalendar(); }
window.changeHistoryMonth = function(delta) { playUISound('click'); currentHistoryMonth += delta; if (currentHistoryMonth > 11) { currentHistoryMonth = 0; currentHistoryYear++; } else if (currentHistoryMonth < 0) { currentHistoryMonth = 11; currentHistoryYear--; } closeHistoryDetail(); renderHistoryCalendar(); }
window.goToTodayHistory = function() {
    playUISound('click'); const now = new Date(); currentHistoryYear = now.getFullYear(); currentHistoryMonth = now.getMonth();
    const popup = document.getElementById('historyDetailPopup'); if(popup) popup.classList.remove('active');
    if (currentHistoryStudent) { currentSelectedDate = `${currentHistoryYear}-${String(currentHistoryMonth + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; } else { currentSelectedDate = null; } renderHistoryCalendar();
};

window.closeHistoryDetail = function() { const popup = document.getElementById('historyDetailPopup'); if(popup) popup.classList.remove('active'); currentSelectedDate = null; renderHistoryCalendar(); };

function getDayRecordMinutes(record) {
    if (!record) return 0;
    const stored = Number(record.totalMinutes) || 0;
    if (stored > 0) return stored;
    if (record.timeLogs && record.timeLogs.length > 0) {
        const ext = extractStartEnd(record.timeLogs);
        const start = parseTypedTimeInput(formatWeeklyTimeInputValue(ext.start));
        const end = parseTypedTimeInput(formatWeeklyTimeInputValue(ext.end));
        if (start && end) return calcMinutesFromTimeRange(start, end);
    }
    return 0;
}

function renderHistoryCalendar() {
    const gridEl = document.getElementById('historyCalGrid'); const titleEl = document.getElementById('historyMonthTitle'); const summaryEl = document.getElementById('monthlyModSummary'); if(!gridEl || !titleEl) return;
    titleEl.innerText = `${currentHistoryYear}년 ${currentHistoryMonth + 1}월 - ${currentHistoryStudent ? currentHistoryStudent : '학생을 선택하세요'}`; gridEl.innerHTML = '';
    if (summaryEl) {
        if (!currentHistoryStudent) { summaryEl.style.display = 'none'; summaryEl.innerHTML = ''; }
        else {
            const studentData = studentHistory[currentHistoryStudent] || {};
            let monthCoupons = 0, monthPenalties = 0;
            const daysInMonth = new Date(currentHistoryYear, currentHistoryMonth + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const dateStr = `${currentHistoryYear}-${String(currentHistoryMonth+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
                const rec = studentData[dateStr];
                if (rec) { monthCoupons += rec.coupon || 0; monthPenalties += rec.penalty || 0; }
            }
            summaryEl.style.display = 'flex';
            summaryEl.innerHTML = `
                <div class="monthly-mod-pill praise">😊 이번 달 칭찬<strong>${monthCoupons}회</strong></div>
                <div class="monthly-mod-pill penalty">😠 이번 달 벌점<strong>${monthPenalties}회</strong></div>`;
        }
    }
    if(!currentHistoryStudent) return; 
    
    const firstDay = new Date(currentHistoryYear, currentHistoryMonth, 1).getDay(); const daysInMonth = new Date(currentHistoryYear, currentHistoryMonth + 1, 0).getDate();
    for(let i=0; i<firstDay; i++) { let empty = document.createElement('div'); empty.className = 'cal-day empty-cell'; gridEl.appendChild(empty); }
    const studentData = studentHistory[currentHistoryStudent] || {};
    
    const studentInfo = studentMasterList.find(s => s.name === currentHistoryStudent);
    let bMonth = -1, bDay = -1;
    if (studentInfo && studentInfo.birthday) {
        const match = studentInfo.birthday.match(/(\d+)[-/](\d+)/);
        if(match) { bMonth = parseInt(match[1]); bDay = parseInt(match[2]); }
    }

    let regOffs = studentRegularOffs[currentHistoryStudent] || [];

    for(let i=1; i<=daysInMonth; i++) {
        const dateStr = `${currentHistoryYear}-${String(currentHistoryMonth+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const mmddStr = `${String(currentHistoryMonth+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const record = studentData[dateStr];
        const dayMins = getDayRecordMinutes(record);
        const dayOfWeek = new Date(currentHistoryYear, currentHistoryMonth, i).getDay();
        const isSunday = dayOfWeek === 0; const isSaturday = dayOfWeek === 6;
        const holidayName = krHolidays[dateStr] || krHolidays[mmddStr]; const isAcadHoliday = academyHolidays.includes(dateStr);
        const isBdayCell = (bMonth === currentHistoryMonth + 1 && bDay === i);
        
        let isRegOff = regOffs.includes(dayOfWeek);
        
        const dayEl = document.createElement('div'); dayEl.className = 'cal-day';
        if(isSunday || holidayName) dayEl.classList.add('is-holiday'); if(isSaturday) dayEl.classList.add('is-saturday');
        if(currentSelectedDate === dateStr) dayEl.classList.add('active');
        if(dayMins > 0 || (record && record.timeLogs && record.timeLogs.length > 0)) dayEl.classList.add('has-record');
        
        if((record && record.isNoClassDay) || isRegOff) dayEl.classList.add('is-no-class');

        if(isBdayCell) { dayEl.style.borderColor = "#ff007f"; dayEl.style.boxShadow = "inset 0 0 10px rgba(255,0,127,0.1)"; }
        
        let dateHtml = `<div class="cal-date-num">${i}`;
        if(isBdayCell) dateHtml += `<span class="holiday-label" style="background:#fce7f3; color:#db2777; border: 1px solid #fbcfe8;">🎂 생일</span>`;
        if(holidayName) dateHtml += `<span class="holiday-label">${holidayName}</span>`; 
        if(isAcadHoliday) dateHtml += `<span class="acad-holiday-label">휴무</span>`; 
        
        if (!isAcadHoliday) {
            if (isRegOff) dateHtml += `<span class="reg-off-label">정규휴무</span>`;
            else if (record && record.isNoClassDay) dateHtml += `<span class="no-class-label">휴원</span>`;
        }
        
        dateHtml += `</div>`;
        let contentHtml = dateHtml;
        
        if(record && (dayMins > 0 || (record.timeLogs && record.timeLogs.length > 0) || record.coupon > 0 || record.warnings > 0 || record.penalty > 0)) {
            if (dayMins > 0) contentHtml += `<div class="cal-record-mins">${dayMins}분 학습</div>`;
            else if (record.timeLogs && record.timeLogs.length > 0) contentHtml += `<div class="cal-record-summary" style="color:var(--accent); font-size:16px;">출결 기록</div>`;
            else contentHtml += `<div class="cal-record-summary" style="color:var(--accent); font-size:14px;">칭찬·벌점 기록</div>`;
            if (record.timeLogs && record.timeLogs.length > 0) { contentHtml += `<div style="font-size:11px; color:#64748b; font-weight:bold; margin-top:4px; background:#e2e8f0; border-radius:4px; padding:2px 4px; font-family:'JetBrains Mono', monospace;">${record.timeLogs.join('<br>')}</div>`; }
            let mods = []; if(record.coupon > 0) mods.push(`😊${record.coupon}`); if(record.penalty > 0) mods.push(`😠${record.penalty}`);
            if(mods.length > 0) contentHtml += `<div class="cal-record-mods">${mods.join(' ')}</div>`;
        } else if (isAcadHoliday) { 
            contentHtml += `<div style="margin-top:auto; text-align:center; font-size:28px; opacity:0.8;">🏝️</div>`; 
        } else if (record && record.isNoClassDay) {
            contentHtml += `<div class="cal-record-summary" style="color:#64748b; font-weight:900;">🚫 휴원</div>`;
        }
        
        if(record && record.note) { 
            let shortNote = record.note.length > 10 ? record.note.substring(0, 10) + '...' : record.note; 
            contentHtml += `<div class="cal-note-preview" title="${record.note}" style="margin-top:auto;">📝 ${shortNote}</div>`; 
        }
        
        dayEl.innerHTML = contentHtml; dayEl.onclick = () => { selectHistoryDate(dateStr, record); }; gridEl.appendChild(dayEl);
    }
}

window.selectHistoryDate = function(dateStr, record) {
    playUISound('click'); currentSelectedDate = dateStr; renderHistoryCalendar(); 
    const popup = document.getElementById('historyDetailPopup'); popup.classList.add('active'); document.getElementById('detailDateText').innerText = `${dateStr} 상세 기록`;
    const btnAcad = document.getElementById('btnToggleAcadHoliday');
    if(academyHolidays.includes(dateStr)) { btnAcad.innerText = "✖ 학원휴무 해제"; btnAcad.style.background = "#ef4444"; } 
    else { btnAcad.innerText = "🏝️ 학원휴무 지정"; btnAcad.style.background = "#8b5cf6"; }
    
    const btnTempOff = document.getElementById('btnToggleTempOff');
    const leaveHint = document.getElementById('detailLeaveHint');
    const noteInput = document.getElementById('detailNoteInput');
    if(record && record.isNoClassDay) {
        btnTempOff.innerText = "🔄 임시 휴무 취소"; btnTempOff.style.background = "#3b82f6";
        if (leaveHint) leaveHint.style.display = 'block';
        if (noteInput) noteInput.placeholder = '휴원 사유를 입력하세요';
    } else {
        btnTempOff.innerText = "🚫 하루 결석/휴무"; btnTempOff.style.background = "#64748b";
        if (leaveHint) leaveHint.style.display = 'none';
        if (noteInput) noteInput.placeholder = '특이사항(비고)을 입력하세요...';
    }
    
    const btnRegOff = document.getElementById('btnToggleRegOff');
    const dayOfWeek = new Date(dateStr).getDay();
    const weekDays = ['일','월','화','수','목','금','토'];
    let regOffs = studentRegularOffs[currentHistoryStudent] || [];
    if(regOffs.includes(dayOfWeek)) {
        btnRegOff.innerText = `🔄 매주 ${weekDays[dayOfWeek]}요일 휴무 해제`; btnRegOff.style.background = "#3b82f6";
    } else {
        btnRegOff.innerText = `📅 매주 ${weekDays[dayOfWeek]}요일 휴무 지정`; btnRegOff.style.background = "#0891b2";
    }

    if(record) {
        document.getElementById('detailTotalMins').innerText = getDayRecordMinutes(record);
        document.getElementById('detailCoupons').innerText = record.coupon || 0;
        document.getElementById('detailPenalties').innerText = record.penalty || 0;
        document.getElementById('detailTimeLogs').innerHTML = (record.timeLogs && record.timeLogs.length > 0) ? record.timeLogs.join('<br>') : '-';
        document.getElementById('detailNoteInput').value = record.note || ""; document.getElementById('btnDeleteDay').style.display = "inline-block";
    } else {
        document.getElementById('detailTotalMins').innerText = "0"; document.getElementById('detailCoupons').innerText = "0"; document.getElementById('detailPenalties').innerText = "0";
        document.getElementById('detailTimeLogs').innerHTML = "-";
        document.getElementById('detailNoteInput').value = ""; document.getElementById('btnDeleteDay').style.display = "none"; 
    }
}

window.toggleTempOffDay = function() {
    if(!currentHistoryStudent || !currentSelectedDate) return; playUISound('click');
    let rec = ensureHistoryRecord(currentHistoryStudent, currentSelectedDate);
    rec.isNoClassDay = !rec.isNoClassDay;

    const today = getTodayDateKey();
    if (currentSelectedDate === today) {
        const name = currentHistoryStudent;
        if (rec.isNoClassDay) {
            let tIdx = timers.findIndex(t => t.student === name);
            if (tIdx !== -1) cancelSession(tIdx);
            if (finishedSet.has(name)) finishedSet.delete(name);
            absentSet.add(name);
            updateStudentStatus(name);
            updateRosterCounts();
            if (rosterViewMode === 'list') renderListView();
        } else {
            absentSet.delete(name);
            updateStudentStatus(name);
            updateRosterCounts();
            if (rosterViewMode === 'list') renderListView();
        }
    }

    saveToStorage(); selectHistoryDate(currentSelectedDate, rec);
    if (historyViewMode === 'weekly') renderWeeklyTable();
    if (historyViewMode === 'stats') renderStatsCharts();
    if (historyViewMode === 'daily') renderDailySummary();
};

window.toggleRegOffDay = function() {
    if(!currentHistoryStudent || !currentSelectedDate) return; playUISound('click');
    const dayOfWeek = new Date(currentSelectedDate).getDay();
    if(!studentRegularOffs[currentHistoryStudent]) studentRegularOffs[currentHistoryStudent] = [];
    
    const idx = studentRegularOffs[currentHistoryStudent].indexOf(dayOfWeek);
    if(idx > -1) studentRegularOffs[currentHistoryStudent].splice(idx, 1);
    else studentRegularOffs[currentHistoryStudent].push(dayOfWeek);
    
    saveToStorage(); selectHistoryDate(currentSelectedDate, studentHistory[currentHistoryStudent]?.[currentSelectedDate]);
};

window.saveHistoryNote = function() {
    if(!currentHistoryStudent || !currentSelectedDate) return; playUISound('finish');
    const rec = ensureHistoryRecord(currentHistoryStudent, currentSelectedDate);
    rec.note = document.getElementById('detailNoteInput').value.trim();
    saveToStorage(); closeHistoryDetail(); 
}

window.deleteHistoryDate = function() {
    if(!currentHistoryStudent || !currentSelectedDate) return; playUISound('cancel');
    if(confirm(`[${currentSelectedDate}] 이 날짜의 기록을 정말 삭제하시겠습니까?`)) {
        if(studentHistory[currentHistoryStudent] && studentHistory[currentHistoryStudent][currentSelectedDate]) {
            const wasTodayOff = studentHistory[currentHistoryStudent][currentSelectedDate].isNoClassDay;
            delete studentHistory[currentHistoryStudent][currentSelectedDate];
            if (wasTodayOff && currentSelectedDate === getTodayDateKey()) {
                absentSet.delete(currentHistoryStudent);
                updateStudentStatus(currentHistoryStudent);
                updateRosterCounts();
                if (rosterViewMode === 'list') renderListView();
            }
            saveToStorage(); closeHistoryDetail();
            if (historyViewMode === 'weekly') renderWeeklyTable();
            if (historyViewMode === 'daily') renderDailySummary();
        }
    }
};

window.deleteHistoryAll = function() {
    if(!currentHistoryStudent) return; playUISound('cancel');
    if(confirm(`⚠️ 경고!\n[${currentHistoryStudent}] 학생의 "모든 누적 기록"을 영구적으로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) { delete studentHistory[currentHistoryStudent]; saveToStorage(); closeHistoryDetail(); renderHistoryCalendar(); }
};

window.toggleAcademyHoliday = function() {
    if(!currentSelectedDate) return; playUISound('click'); const idx = academyHolidays.indexOf(currentSelectedDate);
    if(idx > -1) { academyHolidays.splice(idx, 1); } else { academyHolidays.push(currentSelectedDate); } saveToStorage();
    selectHistoryDate(currentSelectedDate, studentHistory[currentHistoryStudent]?.[currentSelectedDate]);
};

// =========================================================================
// 공통 UI/기능
// =========================================================================
function ensureDeskRemoteCodesLength(count) {
    while (deskRemoteCodes.length < count) {
        const idx = deskRemoteCodes.length;
        deskRemoteCodes.push(REMOTE_CODE_DEFAULTS[idx] || '');
    }
}

function saveRemoteCodesFromUI() {
    ensureDeskRemoteCodesLength(DESK_COUNT);
    for (let i = 0; i < DESK_COUNT; i++) {
        const el = document.getElementById(`remoteCodeInput_${i}`);
        if (el) deskRemoteCodes[i] = el.value.trim();
    }
}

function renderRemoteCodeInputs() {
    const grid = document.getElementById('remoteCodesGrid');
    const label = document.getElementById('remoteSelectLabel');
    if (!grid) return;
    ensureDeskRemoteCodesLength(DESK_COUNT);
    if (label) label.textContent = `📡 무선 리모컨 고유번호 설정 (1~${DESK_COUNT}번 책상)`;
    grid.innerHTML = '';
    for (let i = 0; i < DESK_COUNT; i++) {
        const wrap = document.createElement('div');
        wrap.innerHTML = `<label style="font-size:12px; font-weight:bold; color:var(--text-muted);">${i + 1}번 책상</label><input type="text" id="remoteCodeInput_${i}" class="settings-input" style="width:100%; padding:8px; text-align:center; font-size:14px; box-sizing:border-box;" placeholder="번호 입력" onchange="saveRemoteCodes()" value="${(deskRemoteCodes[i] || '').replace(/"/g, '&quot;')}">`;
        grid.appendChild(wrap);
    }
}

function injectRemoteSettingUI() {
    const settingsCards = document.querySelectorAll('.settings-card'); let targetCard = null;
    settingsCards.forEach(card => { if(card.innerHTML.includes('학원 정보 및 디스플레이') || card.innerHTML.includes('ACADEMY INFO')) targetCard = card; });
    if (targetCard && !document.getElementById('remoteSelectRow')) {
        const row = document.createElement('div'); row.id = 'remoteSelectRow'; row.className = 'settings-row'; row.style.background = 'var(--bg-main)'; row.style.padding = '15px'; row.style.borderRadius = '16px'; row.style.border = '1px solid var(--border)'; row.style.marginBottom = '25px';
        row.innerHTML = `<span class="settings-label" id="remoteSelectLabel">📡 무선 리모컨 고유번호 설정</span><div id="remoteCodesGrid" style="display:grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 10px;"></div>`;
        targetCard.appendChild(row);
    }
    renderRemoteCodeInputs();
}

window.saveRemoteCodes = function() {
    saveRemoteCodesFromUI();
    saveToStorage();
    playUISound('click');
}

function injectHeaderDashboard() {
    const mainHeader = document.getElementById('mainHeader');
    if(mainHeader && !document.getElementById('header-dashboard')) {
        const dashboard = document.createElement('div'); dashboard.id = 'header-dashboard'; dashboard.className = 'header-dashboard-box'; let t = i18n[currentLang] || i18n.ko;
        dashboard.innerHTML = `
            <div class="hd-top-row">
                <span class="hd-academy-name" id="displayAcademyName">${academyName || '향촌삼성영어학원'}</span>
                <span class="hd-date-display" id="hd-date"></span>
            </div>
            <div class="hd-dashboard-row">
                <div class="hd-title" data-i18n="dashTitle">${t.dashTitle}</div>
                <div class="hd-items-container">
                    <div class="hd-item hd-total"><span class="hd-label" data-i18n="dashTotal">${t.dashTotal}</span><span class="hd-count" id="hd-total">0</span></div>
                    <div class="hd-item hd-wait"><span class="hd-label" data-i18n="dashWait">${t.dashWait}</span><span class="hd-count" id="hd-wait">0</span></div>
                    <div class="hd-item hd-active"><span class="hd-label" data-i18n="dashActive">${t.dashActive}</span><span class="hd-count" id="hd-active">0</span></div>
                    <div class="hd-item hd-finish"><span class="hd-label" data-i18n="dashFinish">${t.dashFinish}</span><span class="hd-count" id="hd-finish">0</span></div>
                    <div class="hd-item hd-absent"><span class="hd-label" data-i18n="dashAbsent">${t.dashAbsent}</span><span class="hd-count" id="hd-absent">0</span></div>
                </div>
            </div>
        `;
        mainHeader.insertBefore(dashboard, mainHeader.firstChild);
        updateDateUI();
    }
}

function updateNavTooltips() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        const textEl = tab.querySelector('.nav-text');
        if (textEl) tab.setAttribute('data-tooltip', textEl.textContent.trim());
    });
}

function getAllStudentNames() {
    if (allNames.length) return allNames;
    const raw = [];
    studentMasterList.forEach(st => raw.push(st.name));
    guestList.forEach(n => raw.push(n));
    return raw;
}

function updateRosterCounts() {
    const names = getAllStudentNames();
    const total = names.length; const finished = finishedSet.size; const absent = absentSet.size; let active = 0; timers.forEach(t => { if(t.student !== "(empty)") active++; }); 
    const waiting = Math.max(0, total - finished - active - absent);
    if(document.getElementById('hd-total')) document.getElementById('hd-total').innerText = total;
    if(document.getElementById('hd-wait')) document.getElementById('hd-wait').innerText = waiting;
    if(document.getElementById('hd-active')) document.getElementById('hd-active').innerText = active;
    if(document.getElementById('hd-finish')) document.getElementById('hd-finish').innerText = finished;
    if(document.getElementById('hd-absent')) document.getElementById('hd-absent').innerText = absent;
}

function changeLanguage() { currentLang = document.getElementById("langSelect").value; saveToStorage(); applyLanguage(); const dashBox = document.getElementById('header-dashboard'); if(dashBox) { dashBox.remove(); injectHeaderDashboard(); updateRosterCounts(); updateCustomNames(); } updateWaitSortUI(); updateInteractionModeDesc(); updateTapAssignHint(); }
function applyLanguage() { const t = i18n[currentLang] || i18n.ko; document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = t[el.getAttribute("data-i18n")]; }); document.querySelectorAll('[data-i18n-opt]').forEach(el => { const key = el.getAttribute('data-i18n-opt'); if (t[key]) el.textContent = t[key]; }); updateNavTooltips(); updateDateUI(); updateHeaderTitle(); updateEndClassDayButton(); generateStudents(); for (let i = 0; i < DESK_COUNT; i++) updateBoxUI(i); }

window.switchView = function(view) {
    if (view === 'log') view = 'history';
    playUISound('tab');
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active')); document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const viewEl = document.getElementById(`view-${view}`);
    if (viewEl) viewEl.classList.add('active');
    const tabBtn = document.querySelector(`.nav-tab[onclick*='${view}']`) || document.querySelector(`.nav-tab[onclick*='log']`);
    if (tabBtn) tabBtn.classList.add('active');
    updateHeaderTitle();
    
    if(view === 'history') { 
        closeHistoryDetail(); 
        if(historyViewMode === 'roster') {
            renderSettingsRoster();
        } else if(historyViewMode === 'daily') {
            ensureDailySummaryDate(true);
            renderDailySummary();
        } else if(historyViewMode === 'weekly') {
            renderWeeklyTable();
        } else if(historyViewMode === 'stats') {
            renderStatsCharts();
        } else if(historyViewMode === 'desklog') {
            ensureDeskLogDate(true);
            renderDeskSeatLog();
        } else {
            renderHistorySidebar(); renderHistoryCalendar(); 
        }
    } 
    if(view === 'game') { if(isRouletteMode) setupRoulette(); else setupLadder(); }
    if (view === 'roster') updateTapAssignHint();
}

function injectFontSettingUI() {
    const settingsCards = document.querySelectorAll('.settings-card'); let acadCard = null; settingsCards.forEach(card => { if(card.innerHTML.includes('학원 정보 및 디스플레이') || card.innerHTML.includes('ACADEMY INFO')) acadCard = card; });
    if (acadCard && !document.getElementById('fontSelectRow')) {
        const row = document.createElement('div'); row.id = 'fontSelectRow'; row.className = 'settings-row'; row.style.background = 'var(--bg-main)'; row.style.padding = '15px'; row.style.borderRadius = '16px'; row.style.border = '1px solid var(--border)'; row.style.marginBottom = '25px';
        row.innerHTML = `<span class="settings-label">🔤 시스템 글꼴 (폰트) 선택</span><select id="fontSelect" class="settings-input" onchange="changeFontFamily(); playUISound('click');"><option value="'Pretendard', sans-serif">1. 프리텐다드 (세련/모던/기본)</option><option value="'Noto Sans KR', sans-serif">2. 본고딕 (깔끔/정갈)</option><option value="'Noto Serif KR', serif">3. 본명조 (고급/클래식)</option><option value="'Gowun Dodum', sans-serif">4. 고운돋움 (단정/감성적)</option><option value="'SUIT', sans-serif">5. SUIT (스포티/스타일리시)</option><option value="'GmarketSans', sans-serif">6. 지마켓 산스 (힙/엣지)</option><option value="'Hahmlet', serif">7. 함렛 (트렌디/레트로)</option><option value="'Jua', sans-serif">8. 배민 주아체 (둥글/귀여운)</option><option value="'Do Hyeon', sans-serif">9. 배민 도현체 (볼드/강렬한)</option><option value="'Cafe24Ssurround', sans-serif">10. 카페24 써라운드 (발랄/개성)</option></select>`;
        if (acadCard.children.length > 2) acadCard.insertBefore(row, acadCard.children[2]); else acadCard.appendChild(row);
    }
}

window.changeFontFamily = function() { const select = document.getElementById("fontSelect"); if(!select) return; currentFontFamily = select.value; document.documentElement.style.setProperty('--app-font', currentFontFamily); document.body.style.fontFamily = currentFontFamily; saveToStorage(); if(rosterViewMode === 'list') renderListView(); else generateStudents(); };

function injectDeskModeToggleUI() {
    const rosterSection = document.getElementById('view-roster'); if(!rosterSection) return;
    const listWrapper = document.getElementById('roster-list-wrapper');
    if (listWrapper) listWrapper.style.display = 'none';
    if(!document.getElementById('btnToggleDeskUIMode')) {
        const btn = document.createElement('button');
        btn.id = 'btnToggleDeskUIMode';
        btn.className = 'view-toggle-btn';
        btn.onclick = () => toggleDeskUIMode();
        rosterSection.appendChild(btn);
    }
    updateDeskModeToggleButtonUI();
    applyDeskUIModeBodyClass();
}

function updateDeskModeToggleButtonUI() {
    const btn = document.getElementById('btnToggleDeskUIMode');
    if (!btn) return;
    btn.innerHTML = activeDeskUIMode === 'integrated' ? '💊 간단 카드' : '⏱️ 타이머 결합';
    btn.title = activeDeskUIMode === 'integrated' ? '수업중 카드를 간단한 알약 형태로 전환' : '수업중 카드에 타이머·칭찬·벌점 결합';
}

function applyDeskUIModeBodyClass() {
    document.body.classList.toggle('roster-desk-pill', activeDeskUIMode === 'pill');
    document.body.classList.toggle('roster-desk-integrated', activeDeskUIMode === 'integrated');
}

window.toggleDeskUIMode = function() {
    playUISound('click');
    activeDeskUIMode = activeDeskUIMode === 'integrated' ? 'pill' : 'integrated';
    applyDeskUIModeBodyClass();
    updateDeskModeToggleButtonUI();
    for (let i = 0; i < DESK_COUNT; i++) updateRosterSlotUI(i);
    timers.forEach((t, i) => { if (t.student !== "(empty)") updateStudentStatus(t.student); });
    saveToStorage();
};

function applyViewMode() {
    const cardWrapper = document.querySelector('.custom-roster-layout') || document.querySelector('.roster-columns-wrapper');
    const listWrapper = document.getElementById('roster-list-wrapper');
    const rosterView = document.getElementById('view-roster');
    if (cardWrapper) cardWrapper.style.setProperty('display', 'grid', 'important');
    if (listWrapper) listWrapper.style.display = 'none';
    if (rosterView) rosterView.classList.remove('view-roster-list-mode');
    rosterViewMode = 'card';
    generateStudents();
    updateDeskModeToggleButtonUI();
    applyDeskUIModeBodyClass();
}

const gradeMap = {'초1':1, '초등학교1학년':1, '초등1':1, '초2':2, '초등학교2학년':2, '초등2':2, '초3':3, '초등학교3학년':3, '초등3':3, '초4':4, '초등학교4학년':4, '초등4':4, '초5':5, '초등학교5학년':5, '초등5':5, '초6':6, '초등학교6학년':6, '초등6':6, '중1':7, '중학교1학년':7, '중등1':7, '중2':8, '중학교2학년':8, '중등2':8, '중3':9, '중학교3학년':9, '중등3':9, '고1':10, '고등학교1학년':10, '고등1':10, '고2':11, '고등학교2학년':11, '고등2':11, '고3':12, '고등학교3학년':12, '고등3':12};
function getGradeWeight(g) {
    if (!g || !String(g).trim()) return 99;
    const normalized = String(g).replace(/\s+/g, '');
    if (gradeMap[normalized] !== undefined) return gradeMap[normalized];
    const elem = normalized.match(/초(?:등|등학교)?(\d)/);
    if (elem) return Math.min(6, Math.max(1, parseInt(elem[1], 10) || 99));
    const mid = normalized.match(/중(?:등|등학교)?(\d)/);
    if (mid) return 6 + Math.min(3, Math.max(1, parseInt(mid[1], 10) || 0));
    const high = normalized.match(/고(?:등|등학교)?(\d)/);
    if (high) return 9 + Math.min(3, Math.max(1, parseInt(high[1], 10) || 0));
    const onlyNum = normalized.match(/^(\d{1,2})학년?$/);
    if (onlyNum) return Math.min(12, Math.max(1, parseInt(onlyNum[1], 10) || 99));
    return 99;
}
const levelMap = {'PRE':1, 'BASIC':2, 'INTER':3, 'ADV':4, 'PREP':5, 'GUEST':6};
function getLevelWeight(l) { return levelMap[l] || 99; }
const WAIT_LEVEL_SHORT = { PRE: 'PRE', BASIC: 'BA', INTER: 'IN', ADV: 'AD', PREP: 'PREP', GUEST: 'GST' };
function getWaitLevelShortLabel(lvl) { return WAIT_LEVEL_SHORT[lvl] || lvl || ''; }
function clearWaitLevelClasses(btn) {
    if (!btn) return;
    btn.classList.remove('wait-student-card');
    Object.keys(WAIT_LEVEL_SHORT).forEach(l => btn.classList.remove(`wait-lvl-${l}`));
}
function applyWaitStudentCardClasses(btn, lvl) {
    clearWaitLevelClasses(btn);
    if (!btn || !lvl) return;
    btn.classList.add('wait-student-card', `wait-lvl-${lvl}`);
}

window.sortList = function(col) { playUISound('click'); if (listSortConfig.col === col) { listSortConfig.asc = !listSortConfig.asc; } else { listSortConfig.col = col; listSortConfig.asc = true; } ['name', 'grade', 'level', 'seat', 'startTime', 'time'].forEach(c => { let th = document.getElementById(`th-${c}`); if(th) { th.classList.remove('sort-asc', 'sort-desc'); if(c === col) th.classList.add(listSortConfig.asc ? 'sort-asc' : 'sort-desc'); } }); renderListView(); }

function renderListView() {
    if(rosterViewMode !== 'list') return; const tbody = document.getElementById('rosterListBody'); if(!tbody) return;
    let studentsData = allNames.map(name => {
        const lvl = studentLevels[name] || ''; const grade = studentGrades[name] || '';
        const tIdx = timers.findIndex(t => t.student === name); const t = tIdx !== -1 ? timers[tIdx] : null;
        const isFinished = finishedSet.has(name);
        const isAbsent = absentSet.has(name); // 추가됨
        const studentInfo = studentMasterList.find(s => s.name === name);
        const isBday = studentInfo ? isTodayBirthday(studentInfo.birthday) : false;
        return { name, grade, level: lvl, tIdx, isFinished, isAbsent, timerData: t, isBday };
    });

    const listRowPriority = (sd) => sd.isAbsent ? 2 : (sd.isFinished ? 1 : 0);
    studentsData.sort((a, b) => {
        const pDiff = listRowPriority(a) - listRowPriority(b);
        if (pDiff !== 0) return pDiff;
        let res = 0;
        if (listSortConfig.col === 'name') res = a.name.localeCompare(b.name, 'ko-KR');
        else if (listSortConfig.col === 'grade') res = getGradeWeight(a.grade) - getGradeWeight(b.grade);
        else if (listSortConfig.col === 'level') res = getLevelWeight(a.level) - getLevelWeight(b.level);
        else if (listSortConfig.col === 'seat') { let sA = a.tIdx === -1 ? 99 : a.tIdx; let sB = b.tIdx === -1 ? 99 : b.tIdx; res = sA - sB; }
        else if (listSortConfig.col === 'startTime') { let ta = (a.timerData && a.timerData.startTimeStr) ? a.timerData.startTimeStr : '99:99'; let tb = (b.timerData && b.timerData.startTimeStr) ? b.timerData.startTimeStr : '99:99'; res = ta.localeCompare(tb); }
        else if (listSortConfig.col === 'time') { let timeA = 999999, timeB = 999999; if(a.timerData) { timeA = a.timerData.isOver ? -a.timerData.overTime : a.timerData.remainingTime; } if(b.timerData) { timeB = b.timerData.isOver ? -b.timerData.overTime : b.timerData.remainingTime; } res = timeA - timeB; }
        if (res === 0) res = a.name.localeCompare(b.name, 'ko-KR');
        return listSortConfig.asc ? res : -res;
    });

    let html = ''; const tLang = i18n[currentLang] || i18n.ko;
    studentsData.forEach(sd => {
        let levelLabel = (sd.level === 'PREP') ? 'PREP31' : (sd.level === 'ADV' ? 'ADV' : sd.level); let rowClass = ''; let customMins = studentTimes[sd.name] || 50; let timerHtml = `<span style="font-size:32px; font-weight:900;">${String(customMins).padStart(2,'0')}:00</span>`; let startTimeHtml = '-';
        if (sd.isAbsent) { 
            rowClass = 'absent-row finished-row'; timerHtml = `<span style="font-size:20px; font-weight:900; color:#fff; background: #64748b; padding: 6px 12px; border-radius: 8px;">🚫 휴원</span>`; 
        } else if (sd.isFinished) { 
            rowClass = 'finished-row'; timerHtml = `<span style="font-size:20px; font-weight:900; color:var(--text-muted); background: rgba(0,0,0,0.05); padding: 6px 12px; border-radius: 8px;">🏁 수업 완료</span>`; 
        } 
        else if (sd.timerData) {
            if (sd.timerData.interval !== null || sd.timerData.isPaused) rowClass = 'row-playing';
            if (sd.timerData.startTimeStr) startTimeHtml = `<span class="editable-log-time" onclick="editActiveStartTime('${sd.name}')" style="cursor:pointer; color:var(--accent); font-weight:900; font-size:22px;">${sd.timerData.startTimeStr}</span>`;
            let clickAction = `onclick="goToTimer('${sd.name}')" class="clickable-timer" style="cursor:pointer;"`;
            if (sd.timerData.isOver) { timerHtml = `<span ${clickAction}><span style="color:var(--brand-danger); font-size:32px; font-weight:900; text-shadow:0 0 8px rgba(239,68,68,0.3);">+${formatTime(sd.timerData.overTime)}</span></span>`; } 
            else if (sd.timerData.interval || sd.timerData.isPaused) { let timeStr = formatTime(sd.timerData.remainingTime); if (sd.timerData.isPaused) timeStr = `⏸️ ${timeStr}`; timerHtml = `<span ${clickAction}><span style="color:var(--brand-success); font-size:32px; font-weight:900; text-shadow:0 0 8px rgba(16,185,129,0.3);">${timeStr}</span></span>`; } 
            else { timerHtml = `<span ${clickAction}><span style="font-size:32px; font-weight:900;">${String(customMins).padStart(2,'0')}:00</span></span>`; }
        }
        
        let seatOptions = `<option value="-1" ${sd.tIdx === -1 ? 'selected' : ''}>자리 미 배정</option>`;
        for(let i=0; i<DESK_COUNT; i++) {
            let t = timers[i]; let isMe = (t.student === sd.name); let selected = isMe ? 'selected' : ''; let statusIcon = '🪑'; let statusText = ''; let styleOption = '';
            if (t.interval !== null || t.isPaused) { if (t.student === "(empty)") { statusIcon = '🚨'; statusText = ' (버튼 눌림!)'; styleOption = `style="background:#fee2e2; color:#ef4444; font-weight:bold;"`; } else { statusIcon = t.isPaused ? '⏸️' : '▶️'; statusText = isMe ? '' : ` (${t.student})`; } } else { if (t.student !== "(empty)") { statusIcon = '⏹️'; statusText = isMe ? '' : ` (${t.student})`; } }
            seatOptions += `<option value="${i}" ${selected} style="${styleOption}">${statusIcon} ${i+1}번 책상${statusText}</option>`;
        }

        let selectClass = sd.tIdx !== -1 ? 'list-seat-select assigned' : 'list-seat-select'; let btns = '';
        if(!sd.isFinished && !sd.isAbsent) {
            btns += `<button class="list-action-btn l-btn-absent" onclick="markAbsent('${sd.name}')">휴원</button>`;
            if(sd.tIdx !== -1) { let t = sd.timerData; if(!t.interval && !t.isOver && !t.isPaused) btns += `<button class="list-action-btn l-btn-start" onclick="startTimer(${sd.tIdx})">${tLang.btnStart}</button>`; else if(t.isPaused) btns += `<button class="list-action-btn l-btn-start" onclick="resumeTimer(${sd.tIdx})">▶️ 재개</button>`; if(t.interval || t.isPaused) btns += `<button class="list-action-btn l-btn-stop" onclick="stopTimer(${sd.tIdx})">${tLang.btnStop}</button>`; btns += `<button class="list-action-btn l-btn-finish" onclick="finishSession(${sd.tIdx})">${tLang.btnFinish}</button>`; btns += `<button class="list-action-btn l-btn-cancel" onclick="cancelSession(${sd.tIdx})">${tLang.btnCancel}</button>`; } else { if (sd.level === 'GUEST') btns += `<button class="list-action-btn l-btn-cancel" onclick="removeGuest('${sd.name}')">✖ 삭제</button>`; }
        } else {
            if (sd.isFinished) btns += `<button class="list-action-btn l-btn-start" onclick="restoreFinishedToClass('${sd.name}')">▶️ 수업중 복귀</button>`;
            else btns += `<button class="list-action-btn l-btn-cancel" onclick="restoreToWaiting('${sd.name}')">🔄 대기열 복구</button>`;
        }

        let lvlColor = '#94a3b8'; if(sd.level==='PRE') lvlColor='var(--selena-yellow)'; else if(sd.level==='BASIC') lvlColor='var(--selena-pink)'; else if(sd.level==='INTER') lvlColor='var(--selena-orange)'; else if(sd.level==='ADV') lvlColor='var(--selena-cyan)'; else if(sd.level==='PREP') lvlColor='var(--selena-brown)';
        let lvlFontColor = sd.level==='PRE' ? '#000' : '#fff';
        let mods = studentModifiers[sd.name] || {coupon:0, penalty:0}; let listMods = '';
        if(mods.coupon > 0) listMods += `<span class="mod-badge coupon" onclick="removeModifier('${sd.name}', 'coupon', event)">🎟️x${mods.coupon}</span>`;
        if(mods.penalty > 0) listMods += `<span class="mod-badge penalty" onclick="removeModifier('${sd.name}', 'penalty', event)">🚨x${mods.penalty}</span>`;

        let bdayIcon = sd.isBday ? '<span style="font-size:22px; animation: bday-bounce 0.8s infinite alternate ease-in-out; display:inline-block; margin-right:6px;">🎉</span>' : '';
        let statusTag = sd.isAbsent ? '<div style="font-size:13px;font-weight:900;color:#64748b;margin-top:4px;">🚫 휴원</div>' : (sd.isFinished ? '<div style="font-size:13px;font-weight:900;color:var(--text-muted);margin-top:4px;">🏁 수업 완료</div>' : '');

        html += `
            <tr class="${rowClass}">
                <td style="font-weight:900; font-size:24px; text-align:center !important; color:var(--text-main); font-family: var(--app-font, 'Pretendard', sans-serif);">
                    ${bdayIcon}${sd.name}${statusTag}
                    ${listMods ? `<div style="display:flex; justify-content:center; gap:4px; margin-top:6px;">${listMods}</div>` : ''}
                </td>
                <td style="color:var(--text-muted); font-weight:800; font-size:18px;"><span class="list-grade-badge">${sd.grade || '-'}</span></td>
                <td><span class="list-level-tag" style="background:${lvlColor}; color:${lvlFontColor};">${levelLabel}</span></td>
                <td><select class="${selectClass}" onchange="changeSeatFromList('${sd.name}', this.value)" ${(sd.isFinished || sd.isAbsent) ? 'disabled' : ''}>${seatOptions}</select></td>
                <td style="font-family:'JetBrains Mono';">${startTimeHtml}</td>
                <td id="list-time-cell-${sd.name}" style="font-family:'JetBrains Mono';">${timerHtml}</td>
                <td><div class="list-btn-group">${btns}</div></td>
            </tr>
        `;
    });
    tbody.innerHTML = html; 
}

window.changeSeatFromList = function(name, newIdxStr) { let newIdx = parseInt(newIdxStr); let oldIdx = timers.findIndex(t => t.student === name); if(newIdx === oldIdx) return; if(newIdx === -1) { if(oldIdx !== -1) cancelSession(oldIdx); } else { handleDropOnTimer(name, newIdx, oldIdx !== -1 ? oldIdx : null); } if (rosterViewMode === 'list') renderListView(); }
function updateListViewTime(name, remainingTime, isOver, overTime) { if(rosterViewMode !== 'list') return; let timeCell = document.getElementById(`list-time-cell-${name}`); if(timeCell) { let tIdx = timers.findIndex(t => t.student === name); let isPaused = (tIdx !== -1 && timers[tIdx].isPaused); let clickAction = `onclick="goToTimer('${name}')" class="clickable-timer" style="cursor:pointer;"`; if(isOver) { timeCell.innerHTML = `<span ${clickAction}><span style="color:var(--brand-danger); font-size:32px; font-weight:900;">+${formatTime(overTime)}</span></span>`; } else { let timeStr = formatTime(remainingTime); if(isPaused) timeStr = `⏸️ ${timeStr}`; timeCell.innerHTML = `<span ${clickAction}><span style="color:var(--brand-success); font-size:32px; font-weight:900;">${timeStr}</span></span>`; } } }

window.goToTimer = function(name) { let tIdx = timers.findIndex(t => t.student === name); if (tIdx !== -1) { playUISound('click'); switchView('timer'); setTimeout(() => { const box = document.getElementById(`box-${tIdx}`); if(box) { box.scrollIntoView({behavior: 'smooth', block: 'center'}); box.style.transform = 'scale(1.08)'; box.style.boxShadow = '0 0 0 4px var(--accent)'; setTimeout(() => { box.style.transform = ''; box.style.boxShadow = ''; }, 1500); } }, 300); } };

function updateCustomNames() { academyName = document.getElementById('inputAcademyName').value || "향촌삼성영어학원"; className = document.getElementById('inputClassName').value || "Maple Classroom"; document.getElementById('displayAcademyName').innerText = academyName; updateHeaderTitle(); updateEndClassDayButton(); saveToStorage(); }

function applyNameColor(val) {
    const preset = NAME_COLOR_MAP[val] || NAME_COLOR_MAP.black;
    const root = document.documentElement;
    root.style.setProperty('--custom-name-color', preset.color);
    root.style.setProperty('--custom-name-shadow', preset.shadow);
}

function changeNameColor() {
    applyNameColor(document.getElementById("nameColorSelect")?.value || 'black');
    saveToStorage();
}

function applyPersistedAudioSettings(vols) {
    if (!vols) return;
    if (vols.a !== undefined) { alarmVolume = vols.a; const el = document.getElementById("volAlarm"); if (el) el.value = vols.a * 100; }
    if (vols.t !== undefined) { ttsVolume = vols.t; const el = document.getElementById("volTTS"); if (el) el.value = vols.t * 100; }
    if (vols.u !== undefined) { uiVolume = vols.u; const el = document.getElementById("volUI"); if (el) el.value = vols.u * 100; }
    const melodyEl = document.getElementById("melodyType");
    if (melodyEl && vols.melody !== undefined) melodyEl.value = String(vols.melody);
    const uiEl = document.getElementById("uiSoundType");
    if (uiEl && vols.uiType !== undefined) uiEl.value = String(vols.uiType);
    const ttsEl = document.getElementById("ttsVoiceSelect");
    if (ttsEl && vols.ttsVoice !== undefined) ttsEl.value = String(vols.ttsVoice);
}

function changeTheme() { currentTheme = document.getElementById("themeSelect").value; document.body.className = "theme-" + currentTheme; saveToStorage(); }

function updateVolumes() { alarmVolume = document.getElementById('volAlarm').value / 100; ttsVolume = document.getElementById('volTTS').value / 100; uiVolume = document.getElementById('volUI').value / 100; saveToStorage(); }

function changeDeskCount() { const newCount = parseInt(document.getElementById("deskCountSelect").value); if(newCount < timers.length) { for(let i=newCount; i<timers.length; i++) { if(timers[i].student !== "(empty)") { if(!confirm(`타이머 ${newCount+1}번 이상에 배치된 학생이 있습니다. 강제 취소됩니다.`)) { document.getElementById("deskCountSelect").value = DESK_COUNT; return; } break; } } for(let i=newCount; i<timers.length; i++) { stopTimer(i); if(timers[i].student !== "(empty)") { attendanceMap.delete(timers[i].student); updateStudentStatus(timers[i].student); } } timers.length = newCount; } else if(newCount > timers.length) { for(let i=timers.length; i<newCount; i++) { timers.push({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 }); } } DESK_COUNT = newCount; ensureDeskRemoteCodesLength(DESK_COUNT); createInitialGrid(); generateStudents(); renderRemoteCodeInputs(); saveToStorage(); }

function buildStoragePayload() {
    saveRemoteCodesFromUI();
    return {
        deskCount: DESK_COUNT, academyName: academyName, className: className,
        studentMasterList: studentMasterList, studentModifiers: studentModifiers,
        studentHistory: studentHistory, deskSeatLog: deskSeatLog, academyHolidays: academyHolidays, studentRegularOffs: studentRegularOffs,
        attendance: Array.from(attendanceMap.entries()), finishedSet: Array.from(finishedSet), absentSet: Array.from(absentSet), assignOrderCounter: assignOrderCounter,
        timerStates: timers.map(t => ({ student: t.student, remainingTime: t.remainingTime, totalTime: t.totalTime, overTime: t.overTime, isOver: t.isOver, startTimeStr: t.startTimeStr, isRunning: t.interval !== null, isPaused: t.isPaused || false, lastTick: t.lastTick })),
        vols: { a: alarmVolume, t: ttsVolume, u: uiVolume, ttsVoice: document.getElementById("ttsVoiceSelect")?.value || "1", melody: document.getElementById("melodyType")?.value || "0", uiType: document.getElementById("uiSoundType")?.value || "0" },
        theme: currentTheme, nameColor: document.getElementById("nameColorSelect")?.value || "black", language: currentLang, fontFamily: currentFontFamily,
        customStudentOrder: customStudentOrder, guestList: guestList, guestGrades: guestGrades, rosterViewMode: rosterViewMode, activeDeskUIMode: activeDeskUIMode, waitSortConfig: waitSortConfig, interactionMode: interactionMode,
        dayClosedDate: dayClosedDate, operationalDate: operationalDate,
        deskRemoteCodes: deskRemoteCodes.slice(0, DESK_COUNT), finishedTimerSnapshot: finishedTimerSnapshot
    };
}

function persistToStorage(skipRosterCounts) {
    const data = buildStoragePayload();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (!skipRosterCounts) updateRosterCounts();
}

function maybePersistRunningTimers() {
    const now = Date.now();
    if (now - timerLastPersistAt < TIMER_PERSIST_INTERVAL_MS) return;
    timerLastPersistAt = now;
    saveToStorage(false, true);
}

function saveToStorage(immediate, skipRosterCounts) {
    if (immediate === false) {
        if (saveToStorageTimer) clearTimeout(saveToStorageTimer);
        saveToStorageTimer = setTimeout(() => {
            saveToStorageTimer = null;
            try { persistToStorage(skipRosterCounts); } catch (e) { handleStorageSaveError(e); }
        }, STORAGE_SAVE_DEBOUNCE_MS);
        return;
    }
    if (saveToStorageTimer) { clearTimeout(saveToStorageTimer); saveToStorageTimer = null; }
    try { persistToStorage(skipRosterCounts); } catch (e) { handleStorageSaveError(e); }
}

function handleStorageSaveError(err) {
    console.error('ST Flow: localStorage save failed', err);
    if (storageSaveFailedShown) return;
    storageSaveFailedShown = true;
    const t = i18n[currentLang] || i18n.ko;
    alert(currentLang === 'en'
        ? 'Could not save data (storage may be full). Please export a backup.'
        : '데이터를 저장하지 못했습니다(용량 부족 가능). 설정에서 백업을 권장합니다.');
}

function validateBackupData(json) {
    if (!json || typeof json !== 'object' || Array.isArray(json)) return false;
    if (!Array.isArray(json.studentMasterList)) return false;
    if (json.timerStates !== undefined && !Array.isArray(json.timerStates)) return false;
    if (json.studentHistory !== undefined && (typeof json.studentHistory !== 'object' || Array.isArray(json.studentHistory))) return false;
    if (json.guestList !== undefined && !Array.isArray(json.guestList)) return false;
    return true;
}

function applyElapsedTimeToTimerState(t, wasRunning) {
    if (!wasRunning || !t.lastTick) return;
    const now = Date.now();
    const delta = Math.floor((now - t.lastTick) / 1000);
    if (delta <= 0) return;
    if (t.remainingTime >= delta) {
        t.remainingTime -= delta;
    } else {
        t.overTime = (t.overTime || 0) + (delta - t.remainingTime);
        t.remainingTime = 0;
        t.isOver = true;
    }
    t.lastTick = now - ((now - t.lastTick) % 1000);
}

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved); 
            if(data.studentHistory) {
                studentHistory = data.studentHistory;
                Object.keys(studentHistory).forEach(name => {
                    Object.keys(studentHistory[name] || {}).forEach(dateKey => {
                        const rec = studentHistory[name][dateKey];
                        if (rec && rec.warnings === undefined) rec.warnings = 0;
                    });
                });
            }
            if(data.deskSeatLog) deskSeatLog = data.deskSeatLog; else deskSeatLog = {};
            if(data.academyHolidays) academyHolidays = data.academyHolidays; 
            if(data.studentRegularOffs) studentRegularOffs = data.studentRegularOffs; else studentRegularOffs = {};
            if(data.language) { currentLang = data.language; document.getElementById("langSelect").value = currentLang; }
            if(data.deskCount) { DESK_COUNT = data.deskCount; document.getElementById("deskCountSelect").value = DESK_COUNT; }
            if(data.rosterViewMode && data.rosterViewMode !== 'list') rosterViewMode = data.rosterViewMode;
            else rosterViewMode = 'card';
            if (data.activeDeskUIMode === 'pill' || data.activeDeskUIMode === 'integrated') activeDeskUIMode = data.activeDeskUIMode;
            applyDeskUIModeBodyClass();
            if(data.waitSortConfig) { waitSortConfig = data.waitSortConfig; }
            if (data.interactionMode) interactionMode = data.interactionMode;
            const interactionSel = document.getElementById('interactionModeSelect');
            if (interactionSel) interactionSel.value = interactionMode;
            applyInteractionModeBodyClass();
            updateInteractionModeDesc();
            let dayTransitionReset = false;
            const todayKey = getTodayDateKey();
            operationalDate = data.operationalDate || todayKey;
            dayClosedDate = data.dayClosedDate || null;
            if (operationalDate !== todayKey) {
                dayTransitionReset = true;
                operationalDate = todayKey;
                dayClosedDate = null;
            }
            if(data.studentModifiers) {
                studentModifiers = data.studentModifiers;
                Object.keys(studentModifiers).forEach(n => {
                    if (studentModifiers[n] && studentModifiers[n].warnings === undefined) studentModifiers[n].warnings = 0;
                });
            } else { studentModifiers = {}; }
            if(data.fontFamily) { currentFontFamily = data.fontFamily; document.documentElement.style.setProperty('--app-font', currentFontFamily); document.body.style.fontFamily = currentFontFamily; const fontSelectEl = document.getElementById("fontSelect"); if (fontSelectEl) fontSelectEl.value = currentFontFamily; }

            customStudentOrder = data.customStudentOrder || []; guestList = data.guestList || [];
            guestGrades = (data.guestGrades && typeof data.guestGrades === 'object') ? data.guestGrades : {};
            academyName = data.academyName || "향촌삼성영어학원"; className = data.className || "Maple Classroom";
            document.getElementById('inputAcademyName').value = academyName; document.getElementById('inputClassName').value = className;
            document.getElementById('displayAcademyName').innerText = academyName; updateHeaderTitle(); 
            
            if(data.deskRemoteCodes && Array.isArray(data.deskRemoteCodes)) { deskRemoteCodes = data.deskRemoteCodes; }
            ensureDeskRemoteCodesLength(DESK_COUNT);
            renderRemoteCodeInputs();

            if (data.studentMasterList) {
                studentMasterList = data.studentMasterList.map(st => ({
                    ...st,
                    weeklyMinutes: (st.weeklyMinutes > 0) ? st.weeklyMinutes : DEFAULT_WEEKLY_MINUTES
                }));
            }
            renderSettingsRoster(); 
            
            attendanceMap = new Map(data.attendance || []); finishedSet = new Set(data.finishedSet || []); absentSet = new Set(data.absentSet || []); assignOrderCounter = data.assignOrderCounter || 0;
            if (data.finishedTimerSnapshot) finishedTimerSnapshot = data.finishedTimerSnapshot; else finishedTimerSnapshot = {}; 
            
            timers = data.timerStates ? data.timerStates.map(ts => {
                let t = { ...ts, interval: null, isPaused: ts.isPaused || false, lastTick: ts.lastTick || 0, overTime: ts.overTime || 0 };
                applyElapsedTimeToTimerState(t, ts.isRunning);
                if (t.remainingTime === 0 && (t.overTime > 0 || ts.isOver)) t.isOver = true;
                return t;
            }) : Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 }));
            
            while (timers.length < DESK_COUNT) { timers.push({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 }); }
            if (timers.length > DESK_COUNT) { timers.length = DESK_COUNT; }

            applyPersistedAudioSettings(data.vols);
            if(data.theme) { currentTheme = data.theme; document.getElementById("themeSelect").value = currentTheme; document.body.className = "theme-" + currentTheme; }
            const nameColorVal = data.nameColor || 'black';
            const nameColorSelect = document.getElementById("nameColorSelect");
            if (nameColorSelect) nameColorSelect.value = nameColorVal;
            applyNameColor(nameColorVal);
            
            syncFinishedTimerDeskState();
            if (dayTransitionReset) resetOperationalState(false);
            applyLanguage(); createInitialGrid(); applyViewMode(); syncTodayAbsentFromHistory(); updateRosterCounts(); updateWaitSortUI(); syncDailySummaryReport();
            if (data.timerStates) { data.timerStates.forEach((ts, idx) => { if (ts.isRunning && !ts.isPaused) { resumeTimer(idx); } }); }
        } else {
            studentMasterList = []; studentModifiers = {}; guestGrades = {}; renderSettingsRoster(); timers = Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 })); applyNameColor('black'); applyInteractionModeBodyClass(); applyLanguage(); createInitialGrid(); applyViewMode(); updateRosterCounts();
        }
    } catch(e) {
        console.error('ST Flow: loadData failed', e);
        alert(currentLang === 'en' ? 'Failed to load saved data.' : '저장된 데이터를 불러오지 못했습니다.');
    }
}

function exportData() {
    if (saveToStorageTimer) { clearTimeout(saveToStorageTimer); saveToStorageTimer = null; }
    const data = buildStoragePayload();
    data.backupVersion = 2;
    data.backupExportedAt = new Date().toISOString();
    const historyCount = Object.keys(studentHistory).reduce((sum, name) => sum + Object.keys(studentHistory[name] || {}).length, 0);
    data.backupMeta = {
        studentCount: studentMasterList.length,
        historyRecordCount: historyCount,
        deskLogDays: Object.keys(deskSeatLog).length
    };
    const dateStr = new Date().toISOString().slice(0, 10);
    const safeClass = (className || 'class').replace(/[\\/:*?"<>|]/g, '_');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `STFlow_백업_${dateStr}_${safeClass}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}

function triggerImport() { document.getElementById("importFile").click(); }
function importData(e) {
    const t = i18n[currentLang] || i18n.ko;
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const json = JSON.parse(evt.target.result);
            if (!validateBackupData(json)) { alert(t.alertBackupFail); return; }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
            alert(t.alertBackupDone);
            location.reload();
        } catch (err) {
            alert(t.alertBackupFail);
        } finally {
            e.target.value = '';
        }
    };
    reader.readAsText(file);
}

function getStudentLessonDuration(name) {
    let customTime = (studentTimes[name] || 50) * 60;
    let mods = studentModifiers[name];
    if (mods) { customTime -= (mods.coupon * 300); customTime += (mods.penalty * 300); if (customTime < 0) customTime = 0; }
    return customTime;
}

function applyFinishedTimeExtension(target, name) {
    if (!finishedTimerSnapshot[name]) return false;
    const snap = finishedTimerSnapshot[name];
    const addTime = getStudentLessonDuration(name);
    target.remainingTime = snap.remainingTime + addTime;
    target.totalTime = snap.totalTime + addTime;
    target.overTime = snap.overTime;
    if (target.remainingTime > 0) target.isOver = false;
    delete finishedTimerSnapshot[name];
    return true;
}

window.quickStart = function(name) {
    let tIdx = timers.findIndex(t => t.student === name);
    if (tIdx === -1) return;
    const target = timers[tIdx];
    if (finishedTimerSnapshot[name]) applyFinishedTimeExtension(target, name);
    startTimer(tIdx);
    updateBoxUI(tIdx);
    if (target.student !== "(empty)") updateGauge(target.student, target.remainingTime, target.totalTime);
    saveToStorage();
};
window.quickFinish = function(name) { let tIdx = timers.findIndex(t => t.student === name); if (tIdx !== -1) finishSession(tIdx); };

function addGuest() {
    const input = document.getElementById('guestNameInput');
    const gradeInput = document.getElementById('guestGradeInput');
    const name = input.value.trim();
    if (!name) return;
    if (studentLevels[name] || guestList.includes(name) || studentMasterList.some(s => s.name === name)) {
        alert(currentLang === 'en' ? 'Already on the roster.' : '이미 명단에 있습니다.');
        return;
    }
    const grade = gradeInput ? gradeInput.value.trim() : '';
    guestList.push(name);
    customStudentOrder.push(name);
    studentLevels[name] = 'GUEST';
    studentTimes[name] = 50;
    if (grade) guestGrades[name] = grade;
    input.value = '';
    if (gradeInput) gradeInput.value = '';
    playUISound('click');
    saveToStorage();
    generateStudents();
}
window.removeGuest = function(name) {
    if(confirm(currentLang === 'en' ? `Remove guest "${name}"?` : `게스트 "${name}" 삭제?`)) {
        guestList = guestList.filter(g => g !== name);
        customStudentOrder = customStudentOrder.filter(g => g !== name);
        delete guestGrades[name];
        if(finishedSet.has(name)) finishedSet.delete(name);
        playUISound('cancel');
        saveToStorage();
        generateStudents();
    }
};
window.cancelFromCard = function(name) { let tIdx = timers.findIndex(t => t.student === name); if (tIdx !== -1) cancelSession(tIdx); };

window.applyModifier = function(id, type) {
    playUISound('click'); let target = timers[id]; let name = target.student; if(name === "(empty)") return;
    if(!studentModifiers[name]) studentModifiers[name] = { coupon: 0, penalty: 0, warnings: 0 };
    if(type === 'coupon') { studentModifiers[name].coupon++; target.remainingTime = Math.max(0, target.remainingTime - 300); if(target.remainingTime > 0) { target.isOver = false; target.overTime = 0; } recordModifierToHistory(name, 'coupon'); } 
    else if(type === 'penalty') {
        studentModifiers[name].penalty++;
        if (target.isOver) {
            absorbOvertimeIntoTotal(target);
            target.remainingTime = 300;
            target.totalTime += 300;
        } else {
            target.remainingTime += 300;
            if(target.totalTime < target.remainingTime) target.totalTime = target.remainingTime;
            if(target.remainingTime > 0) { target.isOver = false; target.overTime = 0; }
        }
        recordModifierToHistory(name, 'penalty');
    }
    updateBoxUI(id); updateStudentStatus(name); if (rosterViewMode === 'list') renderListView(); updateGauge(name, target.remainingTime, target.totalTime); saveToStorage();
};
window.applyPraise = function(id) { applyModifier(id, 'coupon'); };
window.applyPenalty = function(id) { applyModifier(id, 'penalty'); };
window.toggleDeskTimer = function(id) {
    initAudio();
    const t = timers[id];
    if (t.interval) stopTimer(id);
    else if (t.isPaused) resumeTimer(id);
    else startTimer(id);
};
window.removeModifier = function(name, type, event) {
    if(event) event.stopPropagation(); playUISound('cancel'); if(!studentModifiers[name] || studentModifiers[name][type] <= 0) return;
    studentModifiers[name][type]--;
    const rec = ensureHistoryRecord(name, getTodayDateKey());
    if (type === 'coupon' && rec.coupon > 0) rec.coupon--;
    else if (type === 'penalty' && rec.penalty > 0) rec.penalty--;
    let tIdx = timers.findIndex(t => t.student === name);
    if(tIdx !== -1) { let target = timers[tIdx]; if(type === 'coupon') { target.remainingTime += 300; if(target.totalTime < target.remainingTime) target.totalTime = target.remainingTime; } else if(type === 'penalty') { target.remainingTime = Math.max(0, target.remainingTime - 300); } updateBoxUI(tIdx); updateGauge(name, target.remainingTime, target.totalTime); }
    updateStudentStatus(name); if (rosterViewMode === 'list') renderListView(); saveToStorage();
};

function initRosterSlots(forceReset) {
    const gridActive = document.getElementById("grid-active"); if(!gridActive) return;
    if (!forceReset && gridActive.children.length === DESK_COUNT) return;
    gridActive.innerHTML = "";
    for (let i = 0; i < DESK_COUNT; i++) {
        const slot = document.createElement("div");
        slot.id = `roster-desk-${i}`;
        slot.className = "roster-desk-slot";
        slot.ondragenter = (e) => { e.preventDefault(); slot.classList.add("drag-over"); };
        slot.ondragover = (e) => { e.preventDefault(); slot.classList.add("drag-over"); };
        slot.ondragleave = () => { slot.classList.remove("drag-over"); };
        slot.ondrop = (e) => {
            e.preventDefault();
            slot.classList.remove("drag-over");
            if (isTapAssignMode()) return;
            handleDropOnTimer(draggedName, i, draggedFromIndex);
        };
        slot.addEventListener('click', (e) => {
            if (!isTapAssignMode()) return;
            if (e.target.closest('button')) return;
            handleTapOnDesk(i);
        });
        gridActive.appendChild(slot);
    }
}
window.cancelEmptySlot = function(id, e) { if(e) e.stopPropagation(); playUISound('cancel'); resetTimerData(id, true); };

function updateRosterTimeDisplay(id) {
    const el = document.getElementById(`roster-display-${id}`);
    if (!el) return;
    const t = timers[id];
    const timeStr = t.isOver ? '+' + formatTime(t.overTime) : formatTime(t.remainingTime);
    el.textContent = timeStr;
    el.classList.toggle('rdp-time-over', t.isOver);
    el.classList.toggle('rdp-time-running', t.interval !== null && !t.isOver);
    el.classList.toggle('rdp-time-paused', t.isPaused && !t.isOver);
}

function updateIntegratedStartTimeDisplay(id) {
    const t = timers[id];
    if (!t || t.student === "(empty)") return;
    const btn = document.getElementById('btn-' + t.student);
    if (!btn) return;
    const el = btn.querySelector('.adc-start-time');
    if (!el) return;
    const name = t.student;
    if (t.startTimeStr) {
        el.className = 'adc-start-time';
        el.innerHTML = `⏰ ${t.startTimeStr}`;
        el.onclick = (e) => { e.stopPropagation(); editActiveStartTime(name); };
    } else {
        el.className = 'adc-start-time placeholder';
        el.innerHTML = '시작전';
        el.onclick = null;
    }
}

function syncDeskSlotLevelClass(slot, lvl) {
    if (!slot) return;
    ['PRE', 'BASIC', 'INTER', 'ADV', 'PREP', 'GUEST'].forEach(l => slot.classList.remove('rdp-lvl-' + l));
    if (lvl && ['PRE', 'BASIC', 'INTER', 'ADV', 'PREP', 'GUEST'].includes(lvl)) slot.classList.add('rdp-lvl-' + lvl);
}

function updateIntegratedDeskSlotState(id) {
    const slot = document.getElementById(`roster-desk-${id}`);
    const t = timers[id];
    if (!slot || !t || t.student === "(empty)") return;
    const isPlaying = t.interval !== null;
    slot.classList.toggle('rdp-playing', isPlaying);
    slot.classList.toggle('rdp-paused', t.isPaused && !t.isOver);
    slot.classList.toggle('rdp-over', t.isOver);
    syncDeskSlotLevelClass(slot, studentLevels[t.student] || '');
    const btn = document.getElementById('btn-' + t.student);
    if (!btn) return;
    let stateClass = 'attended';
    if (t.isOver) stateClass = 'alarm-blink';
    else if (isPlaying || t.isPaused) stateClass = 'playing attended';
    const lvl = studentLevels[t.student] || '';
    const studentInfo = studentMasterList.find(s => s.name === t.student);
    const isBday = studentInfo ? isTodayBirthday(studentInfo.birthday) : false;
    btn.className = `student-btn level-${lvl} active-desk-card ${stateClass}${isBday ? ' bday-card' : ''}`;
}

function updateDeskCardAfterTimerChange(id) {
    const t = timers[id];
    if (!t || t.student === "(empty)") return;
    if (activeDeskUIMode === 'integrated') {
        updateIntegratedDeskSlotState(id);
        updateRosterTimeDisplay(id);
        updateIntegratedStartTimeDisplay(id);
    } else {
        renderSimpleDeskCard(id);
        updateGauge(t.student, t.remainingTime, t.totalTime);
    }
}

function renderDeskStudentCard(id) {
    if (activeDeskUIMode === 'pill') renderSimpleDeskCard(id);
    else renderActiveDeskCard(id);
}

function renderSimpleDeskCard(id) {
    if (rosterViewMode === 'list') return;
    const slot = document.getElementById(`roster-desk-${id}`);
    const t = timers[id];
    if (!slot || !t || t.student === "(empty)") return;
    const name = t.student;
    const btn = document.getElementById('btn-' + name);
    if (!btn) return;
    const lvl = studentLevels[name] || '';
    const tLang = i18n[currentLang] || i18n.ko;
    const studentInfo = studentMasterList.find(s => s.name === name);
    const isBday = studentInfo ? isTodayBirthday(studentInfo.birthday) : false;

    slot.classList.remove('rdp-playing', 'rdp-paused', 'rdp-over');
    slot.classList.add('has-student');
    slot.querySelectorAll('.roster-placeholder').forEach(el => el.remove());
    syncDeskSlotLevelClass(slot, lvl);

    let stateClass = 'attended';
    if (t.isOver) stateClass = 'alarm-blink';
    else if (t.interval || t.isPaused) stateClass = 'playing attended';
    btn.className = `student-btn level-${lvl} pill-desk-card ${stateClass}${isBday ? ' bday-card' : ''}`;

    if (!btn.querySelector('.pill-top-bar')) {
        btn.innerHTML = `<div class="gauge-bg"></div><button class="guest-delete-btn" onclick="event.stopPropagation(); removeGuest('${name}')">✖</button><div class="alarm-alert-text">${tLang.statusTimeUp}</div><div class="pill-top-bar"><button type="button" class="card-cancel-btn" onclick="event.stopPropagation(); cancelFromCard('${name}')">✖</button><div class="pill-start-time start-time-badge"></div></div><div class="pill-center"><div class="name-text">${name}</div><div class="pill-mod-row"></div></div><div class="quick-controls"><button class="quick-btn q-start" onclick="event.stopPropagation(); quickStart('${name}')">${tLang.quickStart}</button><button class="quick-btn q-finish" onclick="event.stopPropagation(); quickFinish('${name}')">${tLang.quickFinish}</button></div>`;
        const useTap = isTapAssignMode();
        btn.draggable = !useTap;
        if (!useTap) {
            btn.ondragstart = (e) => {
                if (e.target.closest('.card-cancel-btn, .quick-btn, .mod-badge, .start-time-badge')) { e.preventDefault(); return; }
                draggedName = name; draggedNameForList = name; draggedFromAbsent = absentSet.has(name); draggedFromIndex = id;
                e.dataTransfer.effectAllowed = 'move'; playUISound('click');
            };
            btn.ondragend = () => { clearDragState(); };
        } else { btn.ondragstart = null; }
        btn.onclick = (e) => { if (e.target.closest('button, .mod-badge, .start-time-badge')) return; handleStudentCardTap(name, e); };
    }

    let timeBadge = btn.querySelector('.pill-start-time');
    if (timeBadge) {
        timeBadge.style.display = 'none';
        if (t.startTimeStr) {
            timeBadge.innerHTML = `⏰ ${t.startTimeStr}`;
            timeBadge.style.display = 'block';
            timeBadge.onclick = (e) => { e.stopPropagation(); editActiveStartTime(name); };
        }
    }
    const statusBadge = btn.querySelector('.status-badge');
    if (statusBadge) statusBadge.style.display = 'none';

    let modRow = btn.querySelector('.pill-mod-row');
    if (!modRow) return;
    const mods = studentModifiers[name] || { coupon: 0, penalty: 0, warnings: 0 };
    let modHtml = '';
    if (mods.coupon > 0) modHtml += `<span class="mod-badge coupon" onclick="removeModifier('${name}', 'coupon', event)">😊 x${mods.coupon}</span>`;
    if (mods.penalty > 0) modHtml += `<span class="mod-badge penalty" onclick="removeModifier('${name}', 'penalty', event)">😠 x${mods.penalty}</span>`;
    modRow.innerHTML = modHtml;

    const oldModContainer = btn.querySelector('.card-mod-container');
    if (oldModContainer) oldModContainer.remove();

    if (slot.querySelector('.student-btn') !== btn) {
        slot.querySelectorAll('.student-btn').forEach(el => { if (el !== btn) el.remove(); });
        slot.appendChild(btn);
    }
    updateGauge(name, t.remainingTime, t.totalTime);
}

function renderActiveDeskCard(id) {
    if (rosterViewMode === 'list' || activeDeskUIMode === 'pill') return;
    const slot = document.getElementById(`roster-desk-${id}`);
    const t = timers[id];
    if (!slot || !t) return;
    const name = t.student;
    if (name === "(empty)") {
        slot.classList.remove('has-student', 'rdp-playing', 'rdp-paused', 'rdp-over');
        syncDeskSlotLevelClass(slot, '');
        return;
    }
    const btn = document.getElementById('btn-' + name);
    if (!btn) return;

    const lvl = studentLevels[name] || '';
    const tLang = i18n[currentLang] || i18n.ko;
    const isPlaying = t.interval !== null;
    const studentInfo = studentMasterList.find(s => s.name === name);
    const isBday = studentInfo ? isTodayBirthday(studentInfo.birthday) : false;
    const mods = studentModifiers[name] || { coupon: 0, penalty: 0, warnings: 0 };

    slot.classList.add('has-student');
    slot.querySelectorAll('.roster-placeholder').forEach(el => el.remove());
    slot.classList.toggle('rdp-playing', isPlaying);
    slot.classList.toggle('rdp-paused', t.isPaused && !t.isOver);
    slot.classList.toggle('rdp-over', t.isOver);
    syncDeskSlotLevelClass(slot, lvl);

    let stateClass = 'attended';
    if (t.isOver) stateClass = 'alarm-blink';
    else if (isPlaying || t.isPaused) stateClass = 'playing attended';

    btn.className = `student-btn level-${lvl} active-desk-card ${stateClass}${isBday ? ' bday-card' : ''}`;

    let statusBadgeHtml = '';
    if (mods.coupon > 0) statusBadgeHtml += `<span class="adc-badge praise">😊 x${mods.coupon}</span>`;
    if (mods.penalty > 0) statusBadgeHtml += `<span class="adc-badge penalty-applied">😠 x${mods.penalty}</span>`;

    let playBtnLabel, playBtnClass;
    if (isPlaying) {
        playBtnLabel = '⏸ 정지';
        playBtnClass = 'btn-pause';
    } else if (t.isPaused) {
        playBtnLabel = '▶ 재개';
        playBtnClass = 'btn-play';
    } else {
        playBtnLabel = `▶ ${tLang.btnStart}`;
        playBtnClass = 'btn-play';
    }

    const startTimeHtml = t.startTimeStr
        ? `<div class="adc-start-time" onclick="event.stopPropagation(); editActiveStartTime('${name}')">⏰ ${t.startTimeStr}</div>`
        : `<div class="adc-start-time placeholder">시작전</div>`;
    const deskNum = String(id + 1).padStart(2, '0');

    btn.innerHTML = `
        <div class="adc-top-block">
            <div class="adc-header">
                <span class="adc-desk-num">${deskNum}</span>
                <div class="adc-name-wrap"><span class="adc-name name-text">${name}</span></div>
                <button type="button" class="adc-cancel" onclick="event.stopPropagation(); cancelFromCard('${name}')">✖</button>
            </div>
            <div class="adc-time-block">
                ${startTimeHtml}
                <div class="adc-time" id="roster-display-${id}"></div>
            </div>
            <div class="adc-status-badges">${statusBadgeHtml}</div>
        </div>
        <div class="adc-controls">
            <div class="adc-row">
                <button type="button" class="adc-praise-btn" onclick="event.stopPropagation(); applyPraise(${id})">😊 칭찬</button>
                <button type="button" class="adc-penalty-btn" onclick="event.stopPropagation(); applyPenalty(${id})">😠 벌점</button>
            </div>
            <div class="adc-row">
                <button type="button" class="adc-time-btn" onclick="event.stopPropagation(); adjustTime(${id}, 300)">+05</button>
                <button type="button" class="adc-time-btn" onclick="event.stopPropagation(); adjustTime(${id}, 60)">+01</button>
                <button type="button" class="adc-time-btn minus" onclick="event.stopPropagation(); adjustTime(${id}, -300)">-05</button>
                <button type="button" class="adc-time-btn minus" onclick="event.stopPropagation(); adjustTime(${id}, -60)">-01</button>
            </div>
            <div class="adc-row">
                <button type="button" class="adc-act-btn ${playBtnClass}" onclick="event.stopPropagation(); toggleDeskTimer(${id})">${playBtnLabel}</button>
                <button type="button" class="adc-act-btn btn-finish" onclick="event.stopPropagation(); finishSession(${id})">${tLang.btnFinish}</button>
            </div>
        </div>`;

    const useTap = isTapAssignMode();
    btn.draggable = !useTap;
    if (!useTap) {
        btn.ondragstart = (e) => {
            if (e.target.closest('.adc-cancel, .adc-praise-btn, .adc-penalty-btn, .adc-time-btn, .adc-act-btn, .adc-start-time, .adc-badge')) { e.preventDefault(); return; }
            draggedName = name;
            draggedNameForList = name;
            draggedFromAbsent = absentSet.has(name);
            draggedFromIndex = id;
            e.dataTransfer.effectAllowed = 'move';
            playUISound('click');
        };
        btn.ondragend = () => { clearDragState(); };
    } else {
        btn.ondragstart = null;
    }
    btn.onclick = (e) => { if (e.target.closest('button, .adc-start-time, .mod-badge')) return; handleStudentCardTap(name, e); };

    if (slot.querySelector('.student-btn') !== btn) {
        slot.querySelectorAll('.student-btn').forEach(el => { if (el !== btn) el.remove(); });
        slot.appendChild(btn);
    }
    updateRosterTimeDisplay(id);
}

function updateRosterSlotUI(id) {
    if(rosterViewMode === 'list') return; const slot = document.getElementById(`roster-desk-${id}`); if(!slot) return;
    const t = timers[id]; const isAssigned = t.student !== "(empty)"; const isPlaying = t.interval !== null || t.isPaused;
    slot.querySelectorAll('.roster-placeholder').forEach(el => el.remove());
    slot.classList.remove('slot-waiting-match');
    if (isAssigned) {
        renderDeskStudentCard(id);
        return;
    }
    slot.classList.remove('has-student', 'rdp-playing', 'rdp-paused', 'rdp-over');
    syncDeskSlotLevelClass(slot, '');
    slot.querySelectorAll('.student-btn').forEach(el => el.remove());
    let placeholder = document.createElement('div'); placeholder.className = 'roster-placeholder';
    if (isPlaying) {
        slot.classList.add('slot-waiting-match');
        placeholder.style.cursor = isTapAssignMode() ? "pointer" : "grab";
        placeholder.draggable = !isTapAssignMode();
        if (!isTapAssignMode()) {
            placeholder.ondragstart = (e) => { draggedName = "(empty)"; draggedFromIndex = id; e.dataTransfer.effectAllowed = 'move'; playUISound('click'); };
        }
        placeholder.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%; gap:4px;"><div class="roster-waiting-text">✨ 매칭 대기중...</div><div class="css-desk" style="opacity: 0.8; flex-shrink:0;"><div class="desk-top" style="background:#dbeafe; border-color:#93c5fd;"><span class="desk-num" style="color:#2563eb;">${id+1}</span></div><div class="desk-chair" style="background:#bfdbfe; border-color:#60a5fa;"></div></div><button onclick="cancelEmptySlot(${id}, event)" style="margin-top:4px; padding:5px 12px; border-radius:10px; background:var(--brand-danger); color:#fff; border:none; font-weight:900; font-size:12px; cursor:pointer; flex-shrink:0;">✖ 대기 취소</button></div>`;
    } else {
        const emptyLabel = (i18n[currentLang] || i18n.ko).emptyDesk || '빈 책상';
        placeholder.innerHTML = `<div class="css-desk"><div class="desk-top"><span class="desk-num">${id+1}</span></div><div class="desk-chair"></div></div><div class="roster-empty-text">${emptyLabel}</div>`;
    }
    slot.appendChild(placeholder);
}

let allNames = []; 

function getTodayDateKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getStudentWeeklyTarget(name) {
    const info = studentMasterList.find(s => s.name === name);
    return (info && info.weeklyMinutes > 0) ? info.weeklyMinutes : DEFAULT_WEEKLY_MINUTES;
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function findStudentMemoAnchor(studentName) {
    const card = document.getElementById('btn-' + studentName);
    if (card) {
        const nameText = card.querySelector('.name-text');
        const target = nameText || card;
        if (target.getBoundingClientRect().width > 0) return target;
    }
    const tIdx = timers.findIndex(t => t.student === studentName);
    if (tIdx !== -1) {
        const box = document.getElementById('box-' + tIdx);
        const nameEl = box?.querySelector('.student-name-display');
        if (nameEl && nameEl.getBoundingClientRect().width > 0) return nameEl;
    }
    const listRows = document.querySelectorAll('#rosterListBody tr');
    for (const row of listRows) {
        const td = row.querySelector('td');
        if (!td) continue;
        const raw = td.innerText.replace(/🎉/g, '').trim().split('\n')[0].trim();
        if (raw === studentName) return td;
    }
    return null;
}

function positionMemoPopup(popup, anchor) {
    const rect = anchor.getBoundingClientRect();
    const centerX = Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 80);
    const topY = Math.max(rect.top, 12);
    popup.style.left = centerX + 'px';
    popup.style.top = topY + 'px';
}

function removeMemoPopup(studentName) {
    const item = activeMemoPopups.get(studentName);
    if (!item) return;
    clearTimeout(item.timer);
    item.el.classList.remove('visible');
    setTimeout(() => { if (item.el.parentNode) item.el.remove(); }, 300);
    activeMemoPopups.delete(studentName);
}

function showStudentDayMemoPopup(studentName) {
    if (!studentName || studentName === '(empty)') return;
    const note = studentHistory[studentName]?.[getTodayDateKey()]?.note?.trim();
    if (!note) return;

    const now = Date.now();
    const lastShown = activeMemoPopups.get(studentName);
    if (lastShown && now - lastShown.shownAt < 1500) return;

    const placePopup = () => {
        const anchor = findStudentMemoAnchor(studentName);
        if (!anchor) return false;

        let root = document.getElementById('student-memo-toast-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'student-memo-toast-root';
            document.body.appendChild(root);
        }

        let item = activeMemoPopups.get(studentName);
        if (item) {
            clearTimeout(item.timer);
            item.el.querySelector('.memo-toast-body').innerHTML = escapeHtml(note);
            positionMemoPopup(item.el, anchor);
            item.timer = setTimeout(() => removeMemoPopup(studentName), MEMO_POPUP_DURATION_MS);
            item.shownAt = now;
            item.el.classList.add('visible');
            return true;
        }

        const popup = document.createElement('div');
        popup.className = 'student-memo-anchor-popup';
        popup.innerHTML = `<div class="memo-toast-title">📝 오늘의 메모</div><div class="memo-toast-body">${escapeHtml(note)}</div>`;
        root.appendChild(popup);
        positionMemoPopup(popup, anchor);
        requestAnimationFrame(() => popup.classList.add('visible'));

        const timer = setTimeout(() => removeMemoPopup(studentName), MEMO_POPUP_DURATION_MS);
        activeMemoPopups.set(studentName, { el: popup, timer, shownAt: now, anchor });
        return true;
    };

    if (!placePopup()) {
        setTimeout(() => placePopup(), 120);
    }
}

function getBillableLessonSeconds(t) {
    const taught = Math.max(0, (t.totalTime || 0) - (t.remainingTime || 0));
    return taught + (t.overTime || 0);
}

function absorbOvertimeIntoTotal(t) {
    if (!t.isOver) return;
    if ((t.overTime || 0) > 0) {
        t.totalTime = (t.totalTime || 0) + t.overTime;
        t.overTime = 0;
    }
    t.isOver = false;
    t.remainingTime = 0;
}

function formatNowTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}

function getDeskLogSessions(dateKey) {
    if (!deskSeatLog[dateKey]) deskSeatLog[dateKey] = [];
    return deskSeatLog[dateKey];
}

function findActiveStudentDeskLog(dateKey, student) {
    const sessions = getDeskLogSessions(dateKey);
    for (let i = sessions.length - 1; i >= 0; i--) {
        const s = sessions[i];
        if (s.student === student && !s.end && s.status === 'active') return s;
    }
    return null;
}

function syncActiveDeskLogDeskIdx(student, deskIdx) {
    const entry = findActiveStudentDeskLog(getTodayDateKey(), student);
    if (entry) entry.deskIdx = deskIdx;
}

function recordDeskSessionStart(deskIdx, studentName, startOverride) {
    if (studentName === '(empty)') return;
    const dateKey = getTodayDateKey();
    if (findActiveStudentDeskLog(dateKey, studentName)) return;
    const start = startOverride || formatNowTime();
    getDeskLogSessions(dateKey).push({ deskIdx, student: studentName, start, end: null, status: 'active' });
    if (historyViewMode === 'desklog') renderDeskSeatLog();
}

function recordDeskSessionEnd(deskIdx, studentName, endTimeStr) {
    const entry = findActiveStudentDeskLog(getTodayDateKey(), studentName);
    if (entry) { entry.end = endTimeStr; entry.status = 'finished'; entry.deskIdx = deskIdx; }
    if (historyViewMode === 'desklog') renderDeskSeatLog();
}

function recordDeskSessionCancel(deskIdx, studentName) {
    const entry = findActiveStudentDeskLog(getTodayDateKey(), studentName);
    if (entry) {
        entry.end = formatNowTime();
        entry.status = 'cancelled';
        entry.deskIdx = deskIdx;
    }
    if (historyViewMode === 'desklog') renderDeskSeatLog();
}

function ensureDeskLogDate(forceToday) {
    const el = document.getElementById('deskLogDate');
    if (!el) return getTodayDateKey();
    if (forceToday || !el.value) el.value = getTodayDateKey();
    return el.value;
}

window.renderDeskSeatLog = function() {
    const grid = document.getElementById('deskLogGrid');
    if (!grid) return;
    const dateKey = ensureDeskLogDate(false);
    const sessions = deskSeatLog[dateKey] || [];
    const isKo = currentLang !== 'en';
    const emptyLabel = (i18n[currentLang] || i18n.ko).emptyDesk || '빈 책상';
    const isToday = dateKey === getTodayDateKey();

    let html = '';
    for (let i = 0; i < DESK_COUNT; i++) {
        const deskSessions = sessions.filter(s => s.deskIdx === i);
        const currentTimer = isToday ? timers[i] : null;
        const isLive = currentTimer && currentTimer.student !== '(empty)' && (currentTimer.interval || currentTimer.isPaused || currentTimer.startTimeStr);
        const liveName = isLive ? currentTimer.student : null;

        let entriesHtml = '';
        if (deskSessions.length === 0) {
            entriesHtml = `<div class="desklog-empty">${emptyLabel}</div>`;
        } else {
            deskSessions.forEach(s => {
                let statusText = '', statusColor = 'var(--text-muted)';
                if (s.status === 'active') { statusText = isKo ? '▶️ 수업 중' : '▶️ In class'; statusColor = 'var(--accent)'; }
                else if (s.status === 'finished') { statusText = isKo ? '✔️ 수업 완료' : '✔️ Finished'; statusColor = '#059669'; }
                else if (s.status === 'cancelled') { statusText = isKo ? '✖️ 취소됨' : '✖️ Cancelled'; statusColor = 'var(--text-muted)'; }
                const endStr = s.end || (isKo ? '진행 중' : 'ongoing');
                entriesHtml += `<div class="desklog-entry ${s.status}"><span class="dl-name">${s.student}</span><span class="dl-time">${s.start} ~ ${endStr}</span><span class="dl-status" style="color:${statusColor};">${statusText}</span></div>`;
            });
        }

        const manyClass = deskSessions.length > 4 ? ' has-many' : '';
        const countBadge = deskSessions.length > 0 ? `<span class="desklog-count">${deskSessions.length}${isKo ? '명' : ''}</span>` : '';
        const nowBadge = (isLive && liveName) ? `<span class="desklog-now" title="${liveName}">${isKo ? '현재' : 'NOW'}: ${liveName}</span>` : '';
        html += `<div class="desklog-card${manyClass}"><div class="desklog-card-header"><span>${i + 1}${isKo ? '번 책상' : ' Desk'}</span><span style="display:flex;align-items:center;gap:6px;min-width:0;flex-shrink:1;">${countBadge}${nowBadge}</span></div><div class="desklog-card-body">${entriesHtml}</div></div>`;
    }
    grid.innerHTML = html;
};

function ensureDailySummaryDate(forceToday) {
    const el = document.getElementById('dailySummaryDate');
    if (!el) return getTodayDateKey();
    if (forceToday || !el.value) el.value = getTodayDateKey();
    return el.value;
}

function syncDailySummaryReport() {
    if (!document.getElementById('dailySummaryDate')) return;
    ensureDailySummaryDate(false);
    renderDailySummary();
}

function resetOperationalState(updateUI) {
    if (updateUI !== false) playUISound('finish');
    timers.forEach((t, i) => { if (t.interval) { clearInterval(t.interval); t.interval = null; } });
    attendanceMap.clear();
    finishedSet.clear();
    absentSet.clear();
    finishedTimerSnapshot = {};
    assignOrderCounter = 0;
    guestList = [];
    studentModifiers = {};
    timers = Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0, startTimeStr: '' }));
    for (let i = 0; i < DESK_COUNT; i++) updateBoxUI(i);
    if (updateUI !== false) {
        generateStudents();
        updateRosterCounts();
    }
}

window.endClassDay = function() {
    const today = getTodayDateKey();
    const label = className || 'Maple Classroom';
    const msg = `"${label}" 오늘 수업을 마감하시겠습니까?\n\n✔ 오늘 출석·휴원 기록은 그대로 유지됩니다.\n✔ 등원 대기 명단이 복귀됩니다.\n✔ 늦게 온 학생 수업 후 다시 마감할 수 있습니다.`;
    if (!confirm(msg)) return;
    resetOperationalState(false);
    dayClosedDate = today;
    operationalDate = today;
    generateStudents();
    updateRosterCounts();
    saveToStorage();
    renderDailySummary();
    playUISound('finish');
    alert(`"${label}" 수업 마감이 완료되었습니다.\n내일(또는 다음 등원)을 위한 대기 명단이 준비되었습니다.`);
};

function updateEndClassDayButton() {
    const btn = document.getElementById('btnEndClassDay');
    if (!btn) return;
    const t = i18n[currentLang] || i18n.ko;
    const label = className || 'Maple Classroom';
    btn.innerHTML = `🏁 ${label} ${t.endClassDay || '수업종료'}`;
}

function ensureHistoryRecord(name, dateKey) {
    if (!studentHistory[name]) studentHistory[name] = {};
    if (!studentHistory[name][dateKey]) {
        studentHistory[name][dateKey] = { totalMinutes: 0, coupon: 0, penalty: 0, warnings: 0, note: "", timeLogs: [], isNoClassDay: false };
    }
    if (studentHistory[name][dateKey].warnings === undefined) studentHistory[name][dateKey].warnings = 0;
    return studentHistory[name][dateKey];
}

function recordModifierToHistory(name, type) {
    const rec = ensureHistoryRecord(name, getTodayDateKey());
    if (type === 'coupon') rec.coupon = (rec.coupon || 0) + 1;
    else if (type === 'penalty') rec.penalty = (rec.penalty || 0) + 1;
    refreshHistoryViewsIfOpen();
}

function recordWarningToHistory(name) {
    const rec = ensureHistoryRecord(name, getTodayDateKey());
    rec.warnings = (rec.warnings || 0) + 1;
    refreshHistoryViewsIfOpen();
}

function timeStrToMinutes(hhmm) {
    if (!hhmm) return 0;
    const [h, m] = String(hhmm).split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return 0;
    return h * 60 + m;
}

function applyStartTimeDeltaToTimer(t, oldStr, newStr) {
    if (!oldStr || !newStr || oldStr === newStr) return;
    const deltaMin = timeStrToMinutes(oldStr) - timeStrToMinutes(newStr);
    if (deltaMin === 0) return;
    const deltaSec = deltaMin * 60;

    if (t.isOver) {
        t.overTime = Math.max(0, t.overTime + deltaSec);
        if (t.overTime === 0) { t.isOver = false; t.remainingTime = 0; }
    } else {
        const next = t.remainingTime - deltaSec;
        if (next <= 0) {
            t.remainingTime = 0;
            t.isOver = true;
            t.overTime = Math.max(0, -next);
        } else {
            t.remainingTime = next;
            t.isOver = false;
            t.overTime = 0;
        }
    }
}

function setStudentNoClassDay(name, dateKey, isOff) {
    const rec = ensureHistoryRecord(name, dateKey);
    rec.isNoClassDay = isOff;
}

function isStudentAbsentOnDate(name, dateKey) {
    const record = studentHistory[name]?.[dateKey];
    return !!(record && record.isNoClassDay);
}

function syncFinishedTimerDeskState() {
    finishedSet.forEach(name => {
        if (!finishedTimerSnapshot[name]) {
            finishedTimerSnapshot[name] = { remainingTime: 0, totalTime: 0, overTime: 0, isOver: false, startTimeStr: '', lastDeskIdx: -1 };
        }
        timers.forEach((t, idx) => {
            if (t.student !== name) return;
            if (t.interval) { clearInterval(t.interval); t.interval = null; }
            timers[idx] = { student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0, startTimeStr: '' };
        });
    });
}

function isDeskFreeForRestore(idx, name) {
    if (idx < 0 || idx >= DESK_COUNT) return false;
    const t = timers[idx];
    return t.student === "(empty)" || t.student === name;
}

function findDeskForFinishedRestore(name) {
    let existingIdx = timers.findIndex(t => t.student === name);
    if (existingIdx !== -1) return existingIdx;

    const preferred = finishedTimerSnapshot[name]?.lastDeskIdx;
    if (isDeskFreeForRestore(preferred, name)) return preferred;

    for (let i = 0; i < DESK_COUNT; i++) {
        if (timers[i].student === "(empty)") return i;
    }
    return -1;
}

function syncTodayAbsentFromHistory() {
    const today = getTodayDateKey();
    absentSet.forEach(name => {
        if (!isStudentAbsentOnDate(name, today)) setStudentNoClassDay(name, today, true);
    });
    if (dayClosedDate !== today) {
        getAllStudentNames().forEach(name => {
            if (!isStudentAbsentOnDate(name, today)) return;
            let tIdx = timers.findIndex(t => t.student === name);
            if (tIdx !== -1) cancelSession(tIdx);
            if (finishedSet.has(name)) finishedSet.delete(name);
            absentSet.add(name);
        });
    }
    applyRosterStatuses();
}

function applyRosterStatuses() {
    if (rosterViewMode === 'list') return;
    getAllStudentNames().forEach(name => updateStudentStatus(name));
}

function refreshHistoryViewsIfOpen() {
    const historyView = document.getElementById('view-history');
    if (!historyView || !historyView.classList.contains('active')) return;
    if (historyViewMode === 'monthly' && currentHistoryStudent) renderHistoryCalendar();
    else if (historyViewMode === 'weekly') renderWeeklyTable();
    else if (historyViewMode === 'stats') renderStatsCharts();
    else if (historyViewMode === 'daily') renderDailySummary();
    else if (historyViewMode === 'desklog') renderDeskSeatLog();
}

// ⭐ 휴원 처리 (드래그 또는 리스트 뷰 버튼) — 오늘 기록(studentHistory)과 동기화
window.markAbsent = function(name) {
    playUISound('click');
    let tIdx = timers.findIndex(t => t.student === name);
    if (tIdx !== -1) cancelSession(tIdx); 
    
    if (finishedSet.has(name)) finishedSet.delete(name);
    setStudentNoClassDay(name, getTodayDateKey(), true);
    absentSet.add(name);
    
    updateStudentStatus(name);
    updateRosterCounts();
    if (rosterViewMode === 'list') renderListView();
    refreshHistoryViewsIfOpen();
    syncDailySummaryReport();
    saveToStorage();
};

window.restoreFromAbsent = function(name) {
    if (!absentSet.has(name) && !isStudentAbsentOnDate(name, getTodayDateKey())) return;
    playUISound('click');
    setStudentNoClassDay(name, getTodayDateKey(), false);
    absentSet.delete(name);
    updateStudentStatus(name);
    updateRosterCounts();
    if (rosterViewMode === 'list') renderListView();
    refreshHistoryViewsIfOpen();
    syncDailySummaryReport();
    saveToStorage();
};

window.restoreToWaiting = function(name) {
    playUISound('click');
    setStudentNoClassDay(name, getTodayDateKey(), false);
    absentSet.delete(name);
    finishedSet.delete(name);
    delete finishedTimerSnapshot[name];
    updateStudentStatus(name);
    updateRosterCounts();
    if (rosterViewMode === 'list') renderListView();
    else generateStudents();
    refreshHistoryViewsIfOpen();
    saveToStorage();
};

window.restoreFinishedToClass = function(name) {
    if (!name || !finishedSet.has(name)) return;
    playUISound('click');
    finishedSet.delete(name);

    const deskIdx = findDeskForFinishedRestore(name);
    if (deskIdx === -1) {
        finishedSet.add(name);
        alert('빈 자리가 없습니다. 수업 중 자리를 비운 뒤 다시 시도해 주세요.');
        updateStudentStatus(name);
        saveToStorage();
        return;
    }

    timers.forEach((t, idx) => {
        if (idx !== deskIdx && t.student === name) {
            if (t.interval) { clearInterval(t.interval); t.interval = null; }
            timers[idx] = { student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0, startTimeStr: '' };
            updateBoxUI(idx);
            updateRosterSlotUI(idx);
        }
    });

    const snap = finishedTimerSnapshot[name] || { remainingTime: 0, totalTime: 0, overTime: 0, isOver: false, startTimeStr: '', lastDeskIdx: deskIdx };
    const t = timers[deskIdx];
    if (t.interval) { clearInterval(t.interval); t.interval = null; }
    t.student = name;
    t.remainingTime = snap.remainingTime;
    t.totalTime = snap.totalTime;
    t.overTime = snap.overTime;
    t.isOver = snap.isOver;
    t.isPaused = false;
    t.lastTick = 0;
    t.startTimeStr = snap.startTimeStr || '';
    finishedTimerSnapshot[name] = { ...snap, lastDeskIdx: deskIdx };

    if (!attendanceMap.has(name)) { assignOrderCounter++; attendanceMap.set(name, assignOrderCounter); }

    updateBoxUI(deskIdx);
    updateRosterSlotUI(deskIdx);
    updateStudentStatus(name);
    updateGauge(name, t.remainingTime, t.totalTime);
    updateRosterCounts();
    if (rosterViewMode === 'list') renderListView();
    refreshHistoryViewsIfOpen();
    saveToStorage();
};

function configureStudentCard(btn, n, index, tLang, lvl) {
    const levelShort = getWaitLevelShortLabel(lvl);
    btn.className = `student-btn wait-student-card wait-lvl-${lvl} level-${lvl}`;
    btn.innerHTML = `<div class="gauge-bg"></div><button class="card-cancel-btn" onclick="event.stopPropagation(); cancelFromCard('${n}')">✖</button><button class="guest-delete-btn" onclick="event.stopPropagation(); removeGuest('${n}')">✖</button><div class="alarm-alert-text">${tLang.statusTimeUp}</div><div class="card-badge-group"><div class="new-level-pill level-color-${lvl}">${levelShort}</div></div><div class="wait-name-wrap"><div class="name-text">${n}</div></div><div class="quick-controls"><button class="quick-btn q-start" onclick="event.stopPropagation(); quickStart('${n}')">${tLang.quickStart}</button><button class="quick-btn q-finish" onclick="event.stopPropagation(); quickFinish('${n}')">${tLang.quickFinish}</button></div>`;
    const useTap = isTapAssignMode();
    btn.draggable = !useTap;
    btn.style.order = index;
    if (!useTap) {
        btn.ondragstart = (e) => { draggedName = n; draggedNameForList = n; draggedFromAbsent = absentSet.has(n); let tIdx = timers.findIndex(t => t.student === n); draggedFromIndex = tIdx !== -1 ? tIdx : null; e.dataTransfer.effectAllowed = 'move'; playUISound('click'); };
        btn.ondragend = () => { clearDragState(); };
        btn.ondragenter = (e) => { e.preventDefault(); btn.classList.add("drag-over"); };
        btn.ondragover = (e) => { e.preventDefault(); btn.classList.add("drag-over"); };
        btn.ondragleave = () => { btn.classList.remove("drag-over"); };
        btn.ondrop = (e) => {
            e.preventDefault(); btn.classList.remove("drag-over");
            if (draggedFromAbsent && draggedName) { restoreFromAbsent(draggedName); clearDragState(); return; }
            if (draggedFromIndex !== null) return;
            if (waitSortConfig.col === 'custom' && draggedNameForList && draggedNameForList !== n) { let i1 = customStudentOrder.indexOf(draggedNameForList); let i2 = customStudentOrder.indexOf(n); if (i1 > -1 && i2 > -1) { let temp = customStudentOrder[i1]; customStudentOrder[i1] = customStudentOrder[i2]; customStudentOrder[i2] = temp; playUISound('click'); generateStudents(); } }
            clearDragState();
        };
    } else {
        btn.ondragstart = null;
        btn.ondrop = null;
    }
    btn.onclick = (e) => handleStudentCardTap(n, e);
}

function generateStudents() {
    studentLevels = {}; studentGrades = {}; studentTimes = {};
    const tLang = i18n[currentLang] || i18n.ko; let rawNames = [];

    studentMasterList.forEach(st => { studentLevels[st.name] = st.level; studentGrades[st.name] = st.grade; studentTimes[st.name] = st.time; rawNames.push(st.name); });
    guestList.forEach(n => {
        rawNames.push(n);
        studentTimes[n] = 50;
        if (guestGrades[n]) studentGrades[n] = guestGrades[n];
    });
    let newOrder = []; customStudentOrder.forEach(name => { if(rawNames.includes(name)) newOrder.push(name); }); rawNames.forEach(name => { if(!newOrder.includes(name)) newOrder.push(name); });
    customStudentOrder = newOrder; allNames = customStudentOrder;

    if (rosterViewMode === 'list') { renderListView(); } else {
        const existingCards = new Map();
        document.querySelectorAll('.student-btn[id^="btn-"]').forEach(btn => {
            existingCards.set(btn.id.replace('btn-', ''), btn);
        });

        document.getElementById("grid-unassigned").innerHTML = "";
        initRosterSlots();
        document.getElementById("grid-finished").innerHTML = "";

        const gridAbsent = document.getElementById("grid-absent");
        if(gridAbsent) gridAbsent.innerHTML = "";

        const waitFrag = document.createDocumentFragment();
        getSortedWaitNames(allNames).forEach((n, index) => {
            const lvl = studentLevels[n];
            let btn = existingCards.get(n);
            if (!btn) {
                btn = document.createElement("button");
                btn.id = "btn-" + n;
            } else {
                existingCards.delete(n);
            }
            configureStudentCard(btn, n, index, tLang, lvl);
            waitFrag.appendChild(btn);
        });
        existingCards.forEach(btn => btn.remove());

        document.getElementById("grid-unassigned").appendChild(waitFrag);
        getSortedWaitNames(allNames).forEach(n => updateStudentStatus(n));
        for (let i = 0; i < DESK_COUNT; i++) updateRosterSlotUI(i);
        setupRosterDropZones();
        if (tapSelectedName && document.getElementById('btn-' + tapSelectedName)) {
            selectStudentForTap(tapSelectedName);
        } else {
            updateTapAssignHint();
        }
    }
    timers.forEach((t, idx) => { if(t.student !== "(empty)") updateGauge(t.student, t.remainingTime, t.totalTime); updateBoxUI(idx); }); 
    updateRosterCounts();
}

function updateStudentStatus(name) {
    if(rosterViewMode === 'list') return; 
    const tLang = i18n[currentLang] || i18n.ko; const btn = document.getElementById("btn-" + name); if (!btn) return; const lvl = studentLevels[name] || '';

    const gridUnassigned = document.getElementById("grid-unassigned"); 
    const gridFinished = document.getElementById("grid-finished");
    const gridAbsent = document.getElementById("grid-absent"); 

    if (absentSet.has(name)) {
        clearWaitLevelClasses(btn);
        btn.className = `student-btn absent level-${lvl}`;
        btn.innerHTML = `<div class="name-text">${name}</div>`;
        btn.draggable = false;
        if(gridAbsent) gridAbsent.appendChild(btn);
    } else if (finishedSet.has(name)) {
        clearWaitLevelClasses(btn);
        btn.className = `student-btn finished level-${lvl}`;
        btn.innerHTML = `<div class="name-text">${name}</div>`;
        btn.draggable = false;
        if (gridFinished) gridFinished.appendChild(btn);
    } else {
        let tIdx = timers.findIndex(x => x.student === name);
        if (tIdx !== -1) {
            updateRosterSlotUI(tIdx);
        } else {
            const idx = Math.max(0, customStudentOrder.indexOf(name));
            configureStudentCard(btn, name, idx, tLang, lvl);
            gridUnassigned.appendChild(btn);
        }
    }
}

let timePromptCallback = null;
function showTimePrompt(title, defaultTime, callback) {
    playUISound('click'); let overlay = document.getElementById('custom-time-modal-overlay');
    if (!overlay) { overlay = document.createElement('div'); overlay.id = 'custom-time-modal-overlay'; overlay.onclick = (e) => { if(e.target === overlay) closeTimePrompt(false); }; overlay.innerHTML = `<div class="custom-time-modal"><h3 id="time-modal-title">시간 수정</h3><input type="time" id="time-modal-input" required><div class="quick-time-btns"><button type="button" onclick="addTimeModalMin(-5)">-5분</button><button type="button" onclick="addTimeModalMin(-1)">-1분</button><button type="button" onclick="addTimeModalMin(1)">+1분</button><button type="button" onclick="addTimeModalMin(5)">+5분</button></div><div class="modal-btns"><button type="button" class="btn-modal-cancel" onclick="closeTimePrompt(false)">취소</button><button type="button" class="btn-modal-save" onclick="closeTimePrompt(true)">저장</button></div></div>`; document.body.appendChild(overlay); }
    document.getElementById('time-modal-title').innerText = title; if(!defaultTime) { const now = new Date(); defaultTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`; } document.getElementById('time-modal-input').value = defaultTime; timePromptCallback = callback; requestAnimationFrame(() => { overlay.classList.add('show'); });
}
window.addTimeModalMin = function(minToAdd) { const input = document.getElementById('time-modal-input'); if(!input.value) return; let [hh, mm] = input.value.split(':').map(Number); let date = new Date(); date.setHours(hh); date.setMinutes(mm + minToAdd); input.value = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`; playUISound('click'); }
window.closeTimePrompt = function(isSave) { const overlay = document.getElementById('custom-time-modal-overlay'); overlay.classList.remove('show'); playUISound('click'); if (isSave) { const newTime = document.getElementById('time-modal-input').value; if (timePromptCallback && newTime) timePromptCallback(newTime); } timePromptCallback = null; }
window.editActiveStartTime = function(name) { let tIdx = timers.findIndex(t => t.student === name); if(tIdx === -1) return; let t = timers[tIdx]; showTimePrompt(`[${name}] 시작 시간 수정`, t.startTimeStr, function(newTime) { const oldTime = t.startTimeStr; t.startTimeStr = newTime; const logEntry = findActiveStudentDeskLog(getTodayDateKey(), name); if (logEntry) logEntry.start = newTime; if (oldTime && newTime && oldTime !== newTime) { applyStartTimeDeltaToTimer(t, oldTime, newTime); updateBoxUI(tIdx); updateDeskCardAfterTimerChange(tIdx); if (t.student !== "(empty)") updateGauge(t.student, t.remainingTime, t.totalTime); } else { updateStudentStatus(name); } if (historyViewMode === 'desklog') renderDeskSeatLog(); saveToStorage(); }); };

function createInitialGrid() {
    const grid = document.getElementById("grid"); grid.innerHTML = "";
    for (let i = 0; i < DESK_COUNT; i++) { const box = document.createElement("div"); box.id = `box-${i}`; box.className = "timer-box"; box.ondragenter = (e) => { e.preventDefault(); box.classList.add("drag-over"); }; box.ondragover = (e) => { e.preventDefault(); box.classList.add("drag-over"); }; box.ondragleave = (e) => { box.classList.remove("drag-over"); }; box.ondrop = (e) => { e.preventDefault(); box.classList.remove("drag-over"); handleDropOnTimer(draggedName, i, draggedFromIndex); }; grid.appendChild(box); updateBoxUI(i); }
}

function updateBoxUI(id) {
    const tLang = i18n[currentLang] || i18n.ko; const t = timers[id]; const box = document.getElementById(`box-${id}`); if (!box) return;
    const isAssigned = t.student !== "(empty)"; const isPlaying = t.interval !== null || t.isPaused; const isRunningEmpty = !isAssigned && isPlaying; 
    
    let isBday = false;
    if (isAssigned) {
        const studentInfo = studentMasterList.find(s => s.name === t.student);
        isBday = studentInfo ? isTodayBirthday(studentInfo.birthday) : false;
    }
    box.className = `timer-box ${t.isOver ? 'done' : ''} ${isPlaying ? 'playing' : ''} ${isBday ? 'bday-card' : ''}`;
    
    const lvl = studentLevels[t.student] || ''; const panelClass = isAssigned && lvl ? `info-panel timer-bg-${lvl}` : 'info-panel';
    const panelStyle = (isAssigned || isRunningEmpty) ? "" : "background: transparent; border: 2px dashed var(--border); box-shadow: none !important;";
    const nameDisplay = isAssigned ? `<span style="font-family: var(--app-font, 'Pretendard', sans-serif);">${t.student}</span>` : (isRunningEmpty ? `<span style="font-size: 22px; color: var(--accent); font-weight:900; animation: blinker 1.5s linear infinite;">매칭 대기중...</span>` : '&nbsp;');
    const numDisplay = String(id+1).padStart(2, '0');

    let cancelWaitingBtn = ''; if (isRunningEmpty) { cancelWaitingBtn = `<div class="action-btn-row" style="margin-top: -15px; margin-bottom: 15px;"><button class="action-btn" style="background: var(--brand-danger); color: white; font-size: 14px; border:none; padding: 10px;" onclick="resetTimerData(${id}, true); playUISound('cancel');">✖ 대기 취소</button></div>`; }

    let mods = studentModifiers[t.student] || {coupon:0, penalty:0}; let boxModHtml = '';
    if (mods.coupon > 0) boxModHtml += `<span class="mod-badge coupon" onclick="removeModifier('${t.student}', 'coupon', event)">😊 x${mods.coupon}</span>`;
    if (mods.penalty > 0) boxModHtml += `<span class="mod-badge penalty" onclick="removeModifier('${t.student}', 'penalty', event)">😠 x${mods.penalty}</span>`;
    let boxModContainer = boxModHtml ? `<div class="mod-badge-container">${boxModHtml}</div>` : '';

    let extraBtnRow = isAssigned ? `<div class="action-btn-row" style="margin-top:-5px; margin-bottom:8px; gap:8px;"><button class="action-btn" style="background:#f59e0b; color:white; padding:8px; border:none; font-size:13px;" onclick="applyModifier(${id}, 'coupon')">😊 칭찬</button><button class="action-btn" style="background:#ef4444; color:white; padding:8px; border:none; font-size:13px;" onclick="applyModifier(${id}, 'penalty')">😠 벌점</button></div>` : '';

    const panelDraggable = (isAssigned || isRunningEmpty) && !isTapAssignMode();
    box.innerHTML = `<div class="desk-id" style="opacity: ${(isAssigned || isRunningEmpty) ? '1' : '0.4'}">${numDisplay}</div><div class="${panelClass}" draggable="${panelDraggable}" style="${panelStyle}"><div class="student-name-display" ${isAssigned ? `style="cursor:pointer;" onclick="playUISound('tab'); switchView('roster');"` : ''}>${nameDisplay}</div>${boxModContainer}<div class="time-display" id="display-${id}" style="visibility: ${(isAssigned || isRunningEmpty) ? 'visible' : 'hidden'}">${t.isOver ? '+'+formatTime(t.overTime) : formatTime(t.remainingTime)}</div></div>${cancelWaitingBtn}${extraBtnRow}<div class="time-controls"><button class="time-btn btn-3d-sm" onclick="adjustTime(${id}, 3000)">+50</button><button class="time-btn btn-3d-sm" onclick="adjustTime(${id}, 600)">+10</button><button class="time-btn btn-3d-sm" onclick="adjustTime(${id}, 300)">+05</button><button class="time-btn btn-3d-sm" onclick="adjustTime(${id}, 60)">+01</button><button class="time-btn btn-3d-sm minus" onclick="adjustTime(${id}, -600)">-10</button><button class="time-btn btn-3d-sm minus" onclick="adjustTime(${id}, -300)">-05</button><button class="time-btn btn-3d-sm minus" onclick="adjustTime(${id}, -60)">-01</button><button class="time-btn btn-3d-sm clear" onclick="clearTime(${id})">${tLang.btnClear}</button></div><div class="action-btn-row"><button class="action-btn btn-start" onclick="startTimer(${id})">${t.isPaused ? '▶️ 재개' : tLang.btnStart}</button></div><div class="action-btn-row"><button class="action-btn btn-stop" onclick="stopTimer(${id})">${tLang.btnStop}</button><button class="action-btn btn-cancel" onclick="cancelSession(${id})">${tLang.btnCancel}</button></div><div class="action-btn-row"><button class="action-btn btn-finish" onclick="finishSession(${id})">${tLang.btnFinish}</button></div>`;
    const infoPanel = box.querySelector('.info-panel');
    if (panelDraggable) {
        infoPanel.ondragstart = (e) => { if(isAssigned || isRunningEmpty) { draggedName = isAssigned ? t.student : "(empty)"; draggedFromIndex = id; draggedFromAbsent = isAssigned && absentSet.has(t.student); e.dataTransfer.effectAllowed = 'move'; } else { e.preventDefault(); } };
    } else {
        infoPanel.ondragstart = null;
    }
}

window.simulateHardwareButton = function(id) {
    playUISound('click');
    const target = timers[id];
    if (target.interval) return;
    if (target.isPaused) {
        startTimer(id, true);
        if (rosterViewMode === 'list') renderListView();
        saveToStorage();
        return;
    }

    const isEmpty = target.student === "(empty)";
    const isWaitingMatch = isEmpty && (target.totalTime > 0 || target.remainingTime > 0);

    if (isWaitingMatch) {
        if (target.totalTime <= 0) { target.remainingTime = 3000; target.totalTime = 3000; }
        target.overTime = 0; target.isOver = false;
        playDeskStartTTS(id + 1);
        startTimer(id);
        if (rosterViewMode === 'list') renderListView();
        saveToStorage();
        return;
    }

    if (!isEmpty) {
        const name = target.student;
        if (finishedTimerSnapshot[name]) {
            applyFinishedTimeExtension(target, name);
        } else if (target.totalTime <= 0 && target.remainingTime <= 0) {
            const customTime = getStudentLessonDuration(name);
            target.remainingTime = customTime;
            target.totalTime = customTime;
            target.overTime = 0;
            target.isOver = false;
        }
        if (!attendanceMap.has(name)) { assignOrderCounter++; attendanceMap.set(name, assignOrderCounter); }
        playStudentClassStartTTS(name);
        startTimer(id);
        updateBoxUI(id);
        if (target.student !== "(empty)") updateGauge(target.student, target.remainingTime, target.totalTime);
        if (rosterViewMode === 'list') renderListView();
        saveToStorage();
        return;
    }

    target.remainingTime = 3000;
    target.totalTime = 3000;
    target.overTime = 0;
    target.isOver = false;
    playDeskStartTTS(id + 1);
    startTimer(id);
    if (rosterViewMode === 'list') renderListView();
    saveToStorage();
};

function handleDropOnTimer(name, targetIdx, fromIdx) {
    if (fromIdx === targetIdx) return;
    let clearedIdx = -1;
    if (name !== "(empty)") { let alreadyIdx = timers.findIndex(t => t.student === name); if (alreadyIdx !== -1 && alreadyIdx !== targetIdx && alreadyIdx !== fromIdx) { resetTimerData(alreadyIdx, false); clearedIdx = alreadyIdx; } }

    if (fromIdx !== null) {
        let tFrom = timers[fromIdx]; let tTarget = timers[targetIdx];
        let fromRunning = tFrom.interval !== null; let targetRunning = tTarget.interval !== null;
        if (fromRunning) { clearInterval(tFrom.interval); tFrom.interval = null; } if (targetRunning) { clearInterval(tTarget.interval); tTarget.interval = null; }
        let tempFrom = { ...tFrom }; let tempTarget = { ...tTarget }; timers[targetIdx] = tempFrom; timers[fromIdx] = tempTarget;
        updateBoxUI(fromIdx); updateBoxUI(targetIdx); 
        if (timers[fromIdx].student !== "(empty)") { updateStudentStatus(timers[fromIdx].student); syncActiveDeskLogDeskIdx(timers[fromIdx].student, fromIdx); }
        if (timers[targetIdx].student !== "(empty)") { updateStudentStatus(timers[targetIdx].student); syncActiveDeskLogDeskIdx(timers[targetIdx].student, targetIdx); }
        playUISound('assign'); if (fromRunning) startTimer(targetIdx, true); if (targetRunning) startTimer(fromIdx, true);
        if (rosterViewMode !== 'list') { updateRosterSlotUI(fromIdx); updateRosterSlotUI(targetIdx); }
    } else {
        const target = timers[targetIdx];
        let customTime = (studentTimes[name] || 50) * 60;
        let mods = studentModifiers[name]; if(mods) { customTime -= (mods.coupon * 300); customTime += (mods.penalty * 300); if(customTime < 0) customTime = 0; }
        
        if (target.interval || target.isPaused) {
            let elapsedTime = target.isOver ? (target.totalTime + target.overTime) : (target.totalTime - target.remainingTime);
            target.student = name;
            target.totalTime = customTime; 
            let newRemaining = customTime - elapsedTime;
            
            if (newRemaining <= 0) {
                target.isOver = true; target.overTime = Math.abs(newRemaining); target.remainingTime = 0;
            } else {
                target.isOver = false; target.overTime = 0; target.remainingTime = newRemaining;
            }
            
            document.getElementById(`display-${targetIdx}`).innerText = target.isOver ? '+'+formatTime(target.overTime) : formatTime(target.remainingTime);
            updateRosterTimeDisplay(targetIdx);
            if (!attendanceMap.has(name)) { assignOrderCounter++; attendanceMap.set(name, assignOrderCounter); if(finishedSet.has(name)) finishedSet.delete(name); }
            playUISound('assign'); 
            updateBoxUI(targetIdx); updateStudentStatus(name); updateGauge(name, target.remainingTime, target.totalTime);
            if (target.startTimeStr) recordDeskSessionStart(targetIdx, name, target.startTimeStr);
            maybeTriggerBirthdayCelebration(name, targetIdx);
        } else {
            target.student = name; target.remainingTime = customTime; target.totalTime = customTime; target.overTime = 0; target.isOver = false;
            if (!attendanceMap.has(name)) { assignOrderCounter++; attendanceMap.set(name, assignOrderCounter); if(finishedSet.has(name)) finishedSet.delete(name); }
            playUISound('assign'); updateBoxUI(targetIdx); updateStudentStatus(name); updateGauge(name, customTime, customTime);
        }
        if (rosterViewMode !== 'list') updateRosterSlotUI(targetIdx);
    }
    if (clearedIdx !== -1 && rosterViewMode !== 'list') updateRosterSlotUI(clearedIdx);
    if (name && name !== "(empty)") showStudentDayMemoPopup(name);
    saveToStorage();
}

function startTimer(id, isResume = false) {
    const target = timers[id]; if (target.interval) return; target.isPaused = false;
    if (!isResume && target.student !== "(empty)" && finishedTimerSnapshot[target.student]) {
        applyFinishedTimeExtension(target, target.student);
        updateBoxUI(id);
    }
    if (!isResume) { initAudio(); playUISound('start'); const now = new Date(); const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`; if (!target.startTimeStr) target.startTimeStr = timeStr; if (target.student !== "(empty)") recordDeskSessionStart(id, target.student, target.startTimeStr); }
    target.lastTick = Date.now();
    timerLastPersistAt = Date.now();
    target.interval = setInterval(() => {
        const nowTick = Date.now(); const delta = Math.floor((nowTick - target.lastTick) / 1000);
        if (delta >= 1) {
            target.lastTick = nowTick - ((nowTick - target.lastTick) % 1000);
            const displayEl = document.getElementById(`display-${id}`);
            if (target.remainingTime > 0) {
                target.remainingTime = Math.max(0, target.remainingTime - delta);
                if (target.student !== "(empty)") updateGauge(target.student, target.remainingTime, target.totalTime);
                if (displayEl) displayEl.innerText = formatTime(target.remainingTime);
                updateDeskCardAfterTimerChange(id);
                if (rosterViewMode === 'list') updateListViewTime(target.student, target.remainingTime, false, 0);
                if (target.remainingTime === 0 && !target.isOver) triggerAlarm(id);
            } else {
                if (!target.isOver) triggerAlarm(id);
                target.overTime += delta;
                if (displayEl) displayEl.innerText = "+" + formatTime(target.overTime);
                updateDeskCardAfterTimerChange(id);
                if (rosterViewMode === 'list') updateListViewTime(target.student, 0, true, target.overTime);
                if (target.overTime >= ALARM_GRACE_SECONDS) { finishSession(id); return; }
            }
            maybePersistRunningTimers();
        }
    }, 250);
    if (target.student !== "(empty)") updateStudentStatus(target.student);
    if (rosterViewMode === 'list') renderListView();
    updateBoxUI(id);
    if (rosterViewMode !== 'list') {
        if (target.student === "(empty)") updateRosterSlotUI(id);
        else if (activeDeskUIMode === 'integrated') updateIntegratedStartTimeDisplay(id);
    }
    if (!isResume && target.student !== "(empty)") {
        maybeTriggerBirthdayCelebration(target.student, id);
        showStudentDayMemoPopup(target.student);
    }
}

function resumeTimer(id) { startTimer(id, true); }
function stopTimer(id) { if (timers[id].interval) { clearInterval(timers[id].interval); timers[id].interval = null; timers[id].isPaused = true; playUISound('stop'); if (timers[id].student !== "(empty)") updateStudentStatus(timers[id].student); if (rosterViewMode !== 'list' && timers[id].student === "(empty)") updateRosterSlotUI(id); if (rosterViewMode === 'list') renderListView(); updateBoxUI(id); saveToStorage(); } else if (saveToStorageTimer) { saveToStorage(); } }
function clearTime(id) { playUISound('cancel'); timers[id].remainingTime = 0; timers[id].totalTime = 0; timers[id].overTime = 0; timers[id].isOver = false; timers[id].isPaused = false; stopTimer(id); updateBoxUI(id); if(timers[id].student !== "(empty)") updateGauge(timers[id].student, 0, 1); if (rosterViewMode === 'list') renderListView(); saveToStorage(); }
function cancelSession(id) { playUISound('cancel'); const sn = timers[id].student; if(sn !== "(empty)") { if (timers[id].startTimeStr) recordDeskSessionCancel(id, sn); attendanceMap.delete(sn); } resetTimerData(id, true); }

function finishSession(id) { 
    if(timers[id].student === "(empty)") { resetTimerData(id, true); return; } 
    playUISound('finish'); 
    
    const sn = timers[id].student; 
    const t = timers[id];
    const actualSeconds = getBillableLessonSeconds(t);
    const actualMinutes = Math.floor(actualSeconds / 60);
    const mods = studentModifiers[sn] || { coupon: 0, penalty: 0 };
    
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const rec = ensureHistoryRecord(sn, dateKey);
    
    const startT = t.startTimeStr || '?-?';
    const endT = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    recordDeskSessionEnd(id, sn, endT);
    if (!rec.timeLogs) rec.timeLogs = [];
    rec.timeLogs.push(`[${startT} ~ ${endT}]`);

    rec.totalMinutes += actualMinutes;
    rec.sessionFinished = true;
    
    finishedTimerSnapshot[sn] = {
        remainingTime: t.remainingTime,
        totalTime: t.totalTime,
        overTime: t.overTime,
        isOver: t.isOver,
        startTimeStr: t.startTimeStr || '',
        lastDeskIdx: id
    };

    finishedSet.add(sn); 
    attendanceMap.delete(sn); 
    
    if(currentHistoryStudent === sn && document.getElementById('view-history').classList.contains('active') && historyViewMode === 'monthly') {
        renderHistoryCalendar();
    }
    
    resetTimerData(id, true);
    refreshHistoryViewsIfOpen();
    updateRosterCounts();
    syncDailySummaryReport();
}

function resetTimerData(id, resetUI) { if(timers[id].interval) { clearInterval(timers[id].interval); timers[id].interval = null; } const sn = timers[id].student; if (sn !== "(empty)" && !finishedSet.has(sn)) delete finishedTimerSnapshot[sn]; timers[id] = { student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0, startTimeStr: undefined }; updateBoxUI(id); if (resetUI && sn !== "(empty)") updateStudentStatus(sn); if (rosterViewMode !== 'list') updateRosterSlotUI(id); if (rosterViewMode === 'list') renderListView(); saveToStorage(); }
function adjustTime(id, sec) { playUISound('click'); const t = timers[id]; if (t.isOver && sec > 0) { absorbOvertimeIntoTotal(t); t.remainingTime = sec; t.totalTime += sec; } else if (t.isOver && sec < 0) { t.overTime = Math.max(0, t.overTime + sec); } else { t.remainingTime = Math.max(0, t.remainingTime + sec); if(t.remainingTime > t.totalTime || t.totalTime === 0) { t.totalTime = t.remainingTime; } if(t.remainingTime > 0) { t.isOver = false; t.overTime = 0; } } updateBoxUI(id); updateDeskCardAfterTimerChange(id); if (t.student !== "(empty)") updateGauge(t.student, t.remainingTime, t.totalTime); saveToStorage(); }
function updateGauge(studentName, remaining, total) { const btn = document.getElementById("btn-" + studentName); if (!btn) return; const gauge = btn.querySelector(".gauge-bg"); if (!gauge || total <= 0) return; if (btn.classList.contains('active-desk-card')) { gauge.style.width = "0%"; return; } const pct = Math.max(0, Math.min(100, ((total - remaining) / total) * 100)); gauge.style.display = ''; gauge.style.width = pct + "%"; gauge.classList.toggle('gauge-active', pct > 0 && pct < 100 && (btn.classList.contains('playing') || btn.classList.contains('pill-desk-card'))); }
function formatTime(t) { return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; }

// ==========================================
// 4. 오디오 & 미리듣기 기능
// ==========================================
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
}
function ensureAudioReady() {
    initAudio();
    return audioCtx && audioCtx.state === 'running';
}
function triggerAlarm(id) { initAudio(); timers[id].isOver = true; if(timers[id].student !== "(empty)") updateStudentStatus(timers[id].student); updateBoxUI(id); let melodyType = parseInt(document.getElementById("melodyType")?.value || "0"); playMelody(melodyType); let ttsName = timers[id].student !== "(empty)" ? timers[id].student : `${id + 1}번 책상`; playAlarmTTS(ttsName); }

window.__tts_queue = []; let __is_tts_playing = false; 
if (window.speechSynthesis) { window.speechSynthesis.onvoiceschanged = function() { window.speechSynthesis.getVoices(); }; window.speechSynthesis.getVoices(); }
function processTTSQueue() { if (__is_tts_playing || window.__tts_queue.length === 0) return; __is_tts_playing = true; let task = window.__tts_queue.shift(); task().then(() => { __is_tts_playing = false; processTTSQueue(); }); }
function getTTSKoFemaleVoice(voices) {
    return voices.find(v => v.lang.includes('ko') && (v.name.includes('Female') || v.name.includes('여성') || v.name.includes('Natural') || v.name.includes('SunHi') || v.name.includes('Heami')))
        || voices.find(v => v.name.includes('Google') && v.lang.includes('ko'))
        || voices.find(v => v.lang.includes('ko'));
}

function getTTSEnFemaleVoice(voices) {
    return voices.find(v => v.lang.includes('en') && (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Jenny')))
        || voices.find(v => v.name === 'Google US English')
        || voices.find(v => v.lang.includes('en-US'))
        || voices.find(v => v.lang.includes('en'));
}

function playDeskStartTTS(deskNum) { 
    if (!window.speechSynthesis) return; 
    let voices = window.speechSynthesis.getVoices(); 
    let u = new SpeechSynthesisUtterance(); 
    u.volume = ttsVolume; 
    u.rate = 0.9; 
    u.text = `Number, ${deskNum}!!, start.`; 
    u.lang = 'en-US'; 
    let enVoice = getTTSEnFemaleVoice(voices);
    if (enVoice) u.voice = enVoice; 
    window.speechSynthesis.speak(u); 
}

function playStudentClassStartTTS(studentName) {
    if (!window.speechSynthesis || !studentName) return;
    window.__tts_queue.push(() => new Promise(resolve => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) { resolve(); return; }
        const u1 = new SpeechSynthesisUtterance(studentName);
        u1.lang = 'ko-KR';
        u1.volume = ttsVolume;
        u1.rate = 1.0;
        u1.pitch = 1.1;
        const koVoice = getTTSKoFemaleVoice(voices);
        if (koVoice) u1.voice = koVoice;

        const u2 = new SpeechSynthesisUtterance('class starting');
        u2.lang = 'en-US';
        u2.volume = ttsVolume;
        u2.rate = 0.95;
        u2.pitch = 1.0;
        const enVoice = getTTSEnFemaleVoice(voices);
        if (enVoice) u2.voice = enVoice;

        let done = false;
        const finalize = () => { if (!done) { done = true; resolve(); } };
        u2.onend = finalize;
        u2.onerror = finalize;
        u1.onend = () => { window.speechSynthesis.speak(u2); };
        u1.onerror = finalize;
        window.speechSynthesis.speak(u1);
        setTimeout(finalize, 8000);
    }));
    processTTSQueue();
}

function playAlarmTTS(studentName) { return new Promise(resolve => { const voiceType = document.getElementById("ttsVoiceSelect")?.value || "1"; if (voiceType === "0" || !window.speechSynthesis) return resolve(); window.__tts_queue.push(() => new Promise(taskResolve => { let voices = window.speechSynthesis.getVoices(); if (voices.length === 0) { setTimeout(() => { resolve(); taskResolve(); }, 100); return; } window.speechSynthesis.cancel(); const getKoVoice = () => voices.find(v => v.name.includes('Google') && v.lang.includes('ko')) || voices.find(v => v.name.includes('Natural') && v.lang.includes('ko')) || voices.find(v => v.lang.includes('ko')); const getEnVoice = () => voices.find(v => v.name === 'Google US English') || voices.find(v => v.lang.includes('en-US')) || voices.find(v => v.lang.includes('en')); let u1, u2; let isFinished = false; let fallbackTimer = setTimeout(() => { finalize(); }, 5000); const finalize = () => { if(!isFinished) { isFinished = true; clearTimeout(fallbackTimer); resolve(); taskResolve(); } }; if (voiceType === "1") { u1 = new SpeechSynthesisUtterance(`${studentName}! ${studentName}!`); u1.volume = ttsVolume; u1.rate = 1.05; u1.pitch = 1.1; u1.lang = 'ko-KR'; let koVoice = getKoVoice(); if (koVoice) u1.voice = koVoice; u1.onend = finalize; u1.onerror = finalize; window.speechSynthesis.speak(u1); } else if (voiceType === "2") { u1 = new SpeechSynthesisUtterance(`${studentName}!`); u1.volume = ttsVolume; u1.rate = 1.05; u1.pitch = 1.1; u1.lang = 'ko-KR'; let koVoice = getKoVoice(); if (koVoice) u1.voice = koVoice; u2 = new SpeechSynthesisUtterance("Let's go home!"); u2.volume = ttsVolume; u2.rate = 1.05; u2.pitch = 1.1; u2.lang = 'en-US'; let enVoice = getEnVoice(); if (enVoice) u2.voice = enVoice; u2.onend = finalize; u2.onerror = finalize; window.speechSynthesis.speak(u1); window.speechSynthesis.speak(u2); } else { finalize(); } })); processTTSQueue(); }); }

function playMelody(type) { 
    return new Promise(resolve => { 
        initAudio();
        if (!audioCtx || audioCtx.state === 'closed') { resolve(); return; }
        if (audioCtx.state === 'suspended') { audioCtx.resume().catch(() => {}); }
        const melodies = [ 
            [523.25, 659.25, 783.99, 1046.50], [440, 554.37, 659.25, 880], [880, 880, 880, 880], [392, 329.63, 261.63], [261.63, 392, 523.25, 783.99], 
            [1046.5, 0, 1046.5, 0, 1046.5], [1046.5, 1174.66, 1318.51, 1567.98], [130.81, 196.00], [587.33, 739.99, 880], [440, 349.23, 523.25, 493.88], 
            [659.25, 523.25, 659.25, 523.25], [392, 440, 493.88, 523.25, 587.33], [1046.5, 783.99, 523.25], [440, 440, 0, 440, 440], [523.25, 392, 329.63, 261.63], 
            [880, 659.25, 880, 659.25], [261.63, 329.63, 392, 523.25, 659.25], [783.99, 587.33, 440, 349.23], [1046.5, 1046.5, 1046.5, 1046.5, 1046.5], [523.25, 659.25, 587.33, 698.46, 659.25, 783.99],
            [330, 261, 293, 196, 0, 196, 293, 330, 261], [659, 622, 659, 622, 659, 494, 587, 523, 440], [523, 659, 784, 1046], [392, 330, 0, 392, 330], [1046, 0, 1046, 0, 1046, 0, 1046, 0, 1046] 
        ]; 
        let notes = melodies[type] || melodies[0]; 
        let now = audioCtx.currentTime; 
        let noteLength = 0.25; 
        if(type === 2 || type === 5 || type === 13 || type === 18 || type === 24) noteLength = 0.15;
        if(type === 20 || type === 21 || type === 22) noteLength = 0.35;
        
        notes.forEach((freq, i) => { 
            if (freq === 0) return; 
            let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain(); 
            osc.type = (type === 2 || type === 9 || type === 18 || type === 24) ? 'square' : 'sine'; 
            osc.frequency.value = freq; 
            gain.gain.setValueAtTime(0, now + i*noteLength); 
            gain.gain.linearRampToValueAtTime(alarmVolume, now + i*noteLength + 0.02); 
            gain.gain.exponentialRampToValueAtTime(0.01, now + i*noteLength + noteLength); 
            osc.connect(gain); gain.connect(audioCtx.destination); 
            osc.start(now + i*noteLength); osc.stop(now + i*noteLength + noteLength); 
        }); 
        setTimeout(resolve, notes.length * noteLength * 1000 + 200); 
    }); 
}

function playUISound(type) { 
    initAudio();
    if (!audioCtx || audioCtx.state === 'closed') return;
    if (audioCtx.state === 'suspended') { audioCtx.resume().catch(() => {}); }
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination); const now = audioCtx.currentTime; let v = uiVolume; if (v === 0) return; 
    
    if (type === 'tab' || type === 'click') { 
        let st = parseInt(document.getElementById('uiSoundType')?.value) || 0; 
        if(st === 0) { osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.1); gain.gain.setValueAtTime(v * 0.28, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); } 
        else if(st === 1) { osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(450, now + 0.05); gain.gain.setValueAtTime(v * 0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05); osc.start(now); osc.stop(now + 0.05); }
        else if(st === 2) { osc.type = 'triangle'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(1000, now + 0.03); gain.gain.setValueAtTime(v * 0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03); osc.start(now); osc.stop(now + 0.03); }
        else if(st === 3) { osc.type = 'sine'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(150, now + 0.1); gain.gain.setValueAtTime(v * 0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); }
        else if(st === 4) { osc.type = 'square'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(1000, now + 0.08); gain.gain.setValueAtTime(v * 0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08); osc.start(now); osc.stop(now + 0.08); }
        else if(st === 5) { osc.type = 'sine'; osc.frequency.setValueAtTime(2000, now); osc.frequency.exponentialRampToValueAtTime(2500, now + 0.02); gain.gain.setValueAtTime(v * 0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02); osc.start(now); osc.stop(now + 0.02); }
        else if(st === 6) { osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(200, now + 0.06); gain.gain.setValueAtTime(v * 0.25, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06); osc.start(now); osc.stop(now + 0.06); }
        else if(st === 7) { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(850, now + 0.1); gain.gain.setValueAtTime(v * 0.08, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); }
        else if(st === 8) { osc.type = 'sine'; osc.frequency.setValueAtTime(500, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.15); gain.gain.setValueAtTime(v * 0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15); osc.start(now); osc.stop(now + 0.15); }
        else if(st === 9) { osc.type = 'sine'; osc.frequency.setValueAtTime(1500, now); osc.frequency.exponentialRampToValueAtTime(1800, now + 0.2); gain.gain.setValueAtTime(v * 0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); osc.start(now); osc.stop(now + 0.2); }
    } 
    else if (type === 'assign') { osc.type = 'triangle'; osc.frequency.setValueAtTime(880, now); gain.gain.setValueAtTime(v * 0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15); osc.start(now); osc.stop(now + 0.15); } 
    else if (type === 'start') { osc.type = 'square'; osc.frequency.setValueAtTime(440, now); osc.frequency.linearRampToValueAtTime(880, now + 0.1); gain.gain.setValueAtTime(v * 0.18, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); } 
    else if (type === 'stop') { osc.type = 'square'; osc.frequency.setValueAtTime(880, now); osc.frequency.linearRampToValueAtTime(440, now + 0.1); gain.gain.setValueAtTime(v * 0.18, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); } 
    else if (type === 'finish') { osc.type = 'sine'; osc.frequency.setValueAtTime(1046.5, now); gain.gain.setValueAtTime(v * 0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3); } 
    else if (type === 'cancel') { osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(150, now + 0.2); gain.gain.setValueAtTime(v * 0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); osc.start(now); osc.stop(now + 0.2); } 
}

let lastTestTime = 0; 
let ttsTimeout = null;

window.previewMelody = function() { 
    playUISound('click'); 
    let melodyType = parseInt(document.getElementById("melodyType").value || "0"); 
    playMelody(melodyType); 
};

window.previewRealtime = function(type) {
    const now = Date.now();
    if (type === 'alarm') { 
        if (now - lastTestTime > 150) { 
            lastTestTime = now; 
            initAudio(); 
            let melodyType = parseInt(document.getElementById("melodyType").value || "0"); 
            playMelody(melodyType); 
        } 
    } 
    else if (type === 'ui') { 
        if (now - lastTestTime > 150) { 
            lastTestTime = now; 
            playUISound('click'); 
        } 
    } 
    else if (type === 'tts') { 
        clearTimeout(ttsTimeout); 
        ttsTimeout = setTimeout(() => { 
            playAlarmTTS("테스트"); 
        }, 300); 
    }
};

function askSoftReset() { const t = i18n[currentLang] || i18n.ko; playUISound('click'); if(confirm(t.alertSoft)) { timers.forEach((t, i) => stopTimer(i)); timers = Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 })); attendanceMap.clear(); finishedSet.clear(); absentSet.clear(); finishedTimerSnapshot = {}; assignOrderCounter = 0; studentModifiers = {}; for(let i=0; i<DESK_COUNT; i++) updateBoxUI(i); generateStudents(); saveToStorage(); alert(t.alertResetDone); } }
function askFactoryReset() { const t = i18n[currentLang] || i18n.ko; playUISound('click'); if(confirm(t.alertHard)) { localStorage.removeItem(STORAGE_KEY); alert(t.alertFactoryDone); location.reload(); } }

// =========================================================================
// ⭐ 리모컨 입력 감지 로직
// =========================================================================
let remoteBuffer = ""; 
let remoteTimer = null;

window.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    
    if (e.key >= '0' && e.key <= '9') {
        remoteBuffer += e.key; 
        clearTimeout(remoteTimer); 
        remoteTimer = setTimeout(() => { remoteBuffer = ""; }, REMOTE_BUFFER_MS);
        
        const deskIndex = deskRemoteCodes.findIndex((code, idx) => idx < DESK_COUNT && code && code === remoteBuffer);
        
        if (deskIndex !== -1) {
            e.preventDefault();
            if (deskIndex < DESK_COUNT && !timers[deskIndex].interval) {
                simulateHardwareButton(deskIndex);
            }
            remoteBuffer = "";
            return;
        }
    } else if (e.key === 'Enter') { 
        if (remoteBuffer.length > 0) { e.preventDefault(); remoteBuffer = ""; } 
    }
});

// =========================================================================
// ⭐ 학생 기록 (월간/주간/일일 마감 보고서 및 엑셀 다운로드)
// =========================================================================

window.switchHistoryMode = function(mode) {
    playUISound('tab');
    historyViewMode = mode;
    
    document.getElementById('tab-history-monthly').classList.remove('active');
    document.getElementById('tab-history-weekly').classList.remove('active');
    document.getElementById('tab-history-daily').classList.remove('active');
    document.getElementById('tab-history-roster').classList.remove('active');
    document.getElementById('tab-history-desklog').classList.remove('active');
    document.getElementById('tab-history-stats')?.classList.remove('active');
    document.getElementById(`tab-history-${mode}`)?.classList.add('active');

    document.getElementById('monthly-history-container').classList.remove('active');
    document.getElementById('weekly-history-container').classList.remove('active');
    document.getElementById('daily-history-container').classList.remove('active');
    document.getElementById('roster-history-container').classList.remove('active');
    document.getElementById('desklog-history-container').classList.remove('active');
    document.getElementById('stats-history-container')?.classList.remove('active');

    if (mode === 'monthly') {
        document.getElementById('monthly-history-container').classList.add('active');
        renderHistorySidebar();
        renderHistoryCalendar();
    } else if (mode === 'weekly') {
        document.getElementById('weekly-history-container').classList.add('active');
        renderWeeklyTable();
    } else if (mode === 'stats') {
        document.getElementById('stats-history-container').classList.add('active');
        renderStatsCharts();
    } else if (mode === 'daily') {
        document.getElementById('daily-history-container').classList.add('active');
        ensureDailySummaryDate(true);
        renderDailySummary();
    } else if (mode === 'roster') {
        document.getElementById('roster-history-container').classList.add('active');
        renderSettingsRoster();
    } else if (mode === 'desklog') {
        document.getElementById('desklog-history-container').classList.add('active');
        ensureDeskLogDate(true);
        renderDeskSeatLog();
    }
}

function buildDailySummaryData(targetDate) {
    if (!targetDate) return null;
    const dayOfWeek = new Date(targetDate + 'T12:00:00').getDay();
    const isAcadHoliday = academyHolidays.includes(targetDate);
    const todayKey = getTodayDateKey();
    const isToday = targetDate === todayKey;
    const waiting = [], attended = [], offAbsent = [];
    const absentByReason = {};
    const tempLeave = [];

    const nameSet = new Set(getAllStudentNames());
    if (isToday) {
        finishedSet.forEach(n => nameSet.add(n));
        absentSet.forEach(n => nameSet.add(n));
    }
    Object.keys(studentHistory).forEach(name => {
        if (studentHistory[name] && studentHistory[name][targetDate]) nameSet.add(name);
    });

    const sortedNames = [...nameSet].sort((a, b) => a.localeCompare(b, 'ko-KR'));

    sortedNames.forEach(name => {
        const record = studentHistory[name]?.[targetDate];
        const hasClassRecord = !!(record && (
            record.totalMinutes > 0 ||
            record.sessionFinished ||
            (record.timeLogs && record.timeLogs.length > 0)
        ));
        const isOffFromHistory = !!(record && record.isNoClassDay);
        const isOffLive = isToday && absentSet.has(name);
        const isAttendedLive = isToday && finishedSet.has(name);
        const isRegOff = studentRegularOffs[name]?.includes(dayOfWeek);

        if (hasClassRecord || isAttendedLive) {
            attended.push(name);
        } else if (isOffFromHistory || isOffLive) {
            const note = record?.note?.trim() || '';
            tempLeave.push({ name, note });
            offAbsent.push({ name, label: '휴원' });
        } else if (isAcadHoliday) {
            offAbsent.push({ name, label: '휴무' });
        } else if (isRegOff) {
            const label = getWeeklyScheduleLabel(name) || '정규휴무';
            if (!absentByReason[label]) absentByReason[label] = [];
            absentByReason[label].push(name);
            offAbsent.push({ name, label });
        } else {
            waiting.push(name);
            if (!absentByReason['미등원']) absentByReason['미등원'] = [];
            absentByReason['미등원'].push(name);
        }
    });

    return { waiting, attended, offAbsent, dayOfWeek, absentByReason, tempLeave };
}

// ⭐ 일일 마감 보고서 렌더링 함수
window.renderDailySummary = function() {
    const targetDate = ensureDailySummaryDate(false);
    if (!targetDate) return;
    const data = buildDailySummaryData(targetDate);
    if (!data) return;

    updateEndClassDayButton();

    const waitCountEl = document.getElementById('ds-waiting-count');
    const attendCountEl = document.getElementById('ds-attended-count');
    const offCountEl = document.getElementById('ds-offabsent-count');
    const waitListEl = document.getElementById('ds-waiting-list');
    const attendListEl = document.getElementById('ds-attended-list');
    const offListEl = document.getElementById('ds-offabsent-list');
    if (!waitCountEl || !attendCountEl || !offCountEl || !waitListEl || !attendListEl || !offListEl) return;

    waitCountEl.innerText = data.waiting.length + '명';
    attendCountEl.innerText = data.attended.length + '명';
    offCountEl.innerText = data.offAbsent.length + '명';

    waitListEl.innerHTML = data.waiting.length
        ? data.waiting.map(name => `<div class="ds-item" style="border: 2px solid #f59e0b; color:#92400e; background:#fef3c7;">${name}</div>`).join('')
        : '<div style="color:#94a3b8; font-weight:700; padding:8px;">(없음)</div>';
    attendListEl.innerHTML = data.attended.length
        ? data.attended.map(name => `<div class="ds-item" style="border: 2px solid #10b981; color:#065f46; background:#d1fae5;">${name}</div>`).join('')
        : '<div style="color:#94a3b8; font-weight:700; padding:8px;">(없음)</div>';
    offListEl.innerHTML = data.offAbsent.length
        ? data.offAbsent.map(item => {
            const label = item.label ? `<span style="font-size:12px; opacity:0.85; margin-left:6px;">${item.label}</span>` : '';
            return `<div class="ds-item" style="border: 2px solid #94a3b8; color:#334155; background:#f1f5f9;">${item.name}${label}</div>`;
        }).join('')
        : '<div style="color:#94a3b8; font-weight:700; padding:8px;">(없음)</div>';
}

function htmlAttrEsc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function formatWeeklyTimeInputValue(val) {
    if (!val || val === '-' || val === '?') return '';
    const m = String(val).match(/(\d{1,2}):(\d{2})/);
    if (!m) return '';
    return `${String(parseInt(m[1], 10)).padStart(2, '0')}:${m[2]}`;
}

function parseTypedTimeInput(raw) {
    if (!raw || !String(raw).trim()) return null;
    let s = String(raw).trim().replace(/[.\s]/g, ':');
    const digitsOnly = s.replace(/\D/g, '');
    if (/^\d{3,4}$/.test(digitsOnly)) {
        if (digitsOnly.length === 3) s = `0${digitsOnly[0]}:${digitsOnly.slice(1)}`;
        else s = `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2)}`;
    }
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (h < 0 || h > 23 || min < 0 || min > 59) return null;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function calcMinutesFromTimeRange(startHHMM, endHHMM) {
    if (!startHHMM || !endHHMM) return 0;
    const [sh, sm] = startHHMM.split(':').map(Number);
    const [eh, em] = endHHMM.split(':').map(Number);
    if ([sh, sm, eh, em].some(n => Number.isNaN(n))) return 0;
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    return Math.max(0, mins);
}

function hasTimerTimeLog(record) {
    return !!(record && record.timeLogs && record.timeLogs.length > 0);
}

function buildWeeklyTimeTextInput(name, dateKey, field, value, isEdited) {
    const v = formatWeeklyTimeInputValue(value);
    const editedCls = isEdited ? ' weekly-time-edited' : '';
    const label = field === 'start' ? '시작' : '종료';
    return `<input type="text" inputmode="numeric" class="weekly-time-input${editedCls}" value="${htmlAttrEsc(v)}" ` +
        `placeholder="14:30" maxlength="5" autocomplete="off" ` +
        `data-name="${htmlAttrEsc(name)}" data-date="${dateKey}" data-field="${field}" ` +
        `onblur="saveWeeklyTimeEdit(this)" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" ` +
        `title="타이머 기록 ${label} 시간 수정 (1430 또는 14:30)">`;
}

window.saveWeeklyTimeEdit = function(inputEl) {
    if (!inputEl) return;
    const name = inputEl.dataset.name;
    const dateKey = inputEl.dataset.date;
    const row = inputEl.closest('tr');
    if (!name || !dateKey || !row) return;

    const rec = studentHistory[name]?.[dateKey];
    if (!hasTimerTimeLog(rec)) {
        renderWeeklyTable();
        return;
    }

    const startInput = row.querySelector(`input.weekly-time-input[data-field="start"][data-date="${dateKey}"]`);
    const endInput = row.querySelector(`input.weekly-time-input[data-field="end"][data-date="${dateKey}"]`);
    if (!startInput || !endInput) return;

    const prev = extractStartEnd(rec.timeLogs);
    const startParsed = parseTypedTimeInput(startInput.value);
    const endParsed = parseTypedTimeInput(endInput.value);

    if (!startParsed || !endParsed) {
        alert('시간 형식이 올바르지 않습니다.\n예: 1430, 930, 14:30');
        startInput.value = formatWeeklyTimeInputValue(prev.start);
        endInput.value = formatWeeklyTimeInputValue(prev.end);
        return;
    }

    if (startParsed === formatWeeklyTimeInputValue(prev.start) && endParsed === formatWeeklyTimeInputValue(prev.end)) {
        return;
    }

    playUISound('click');
    rec.timeLogs = [`[${startParsed} ~ ${endParsed}]`];
    rec.totalMinutes = calcMinutesFromTimeRange(startParsed, endParsed);
    rec.timeEditedByTeacher = true;

    saveToStorage();
    refreshHistoryViewsIfOpen();

    if (currentHistoryStudent === name && currentSelectedDate === dateKey) {
        selectHistoryDate(dateKey, rec);
    }

    renderWeeklyTable();
};

window.exportDailySummaryToTxt = function() {
    const targetDate = ensureDailySummaryDate(false);
    if (!targetDate) { alert('날짜를 선택해 주세요.'); return; }
    playUISound('click');
    const data = buildDailySummaryData(targetDate);
    if (!data) return;

    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date(targetDate + 'T12:00:00');
    const dateLabel = `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${daysEn[data.dayOfWeek]})`;
    const classLabel = className || 'Maple Classroom';
    const attendedLine = data.attended.length ? data.attended.join(', ') + ',' : '(없음)';

    const absentCount = Object.values(data.absentByReason).reduce((sum, arr) => sum + arr.length, 0);
    const absentLines = formatDailyAbsentLines(data.absentByReason);
    const tempLeaveLines = data.tempLeave.map(item => {
        return item.note ? `${item.name} (${item.note})` : item.name;
    });

    const lines = [
        `📚  ${academyName || 'MAPLE classroom'} (${classLabel})`,
        `📅 Date : ${dateLabel}`,
        '',
        `Attended(${data.attended.length}명)`,
        attendedLine,
        '',
        `2. 결석(${absentCount}명)`,
        ...(absentLines.length ? absentLines : ['(없음)']),
        '',
        '3. 임시휴원',
        ...(tempLeaveLines.length ? tempLeaveLines : ['(없음)'])
    ];

    const safeClass = (className || 'class').replace(/[\\/:*?"<>|]/g, '_');
    downloadTextFile(lines.join('\r\n'), `마감_${targetDate}_${safeClass}.txt`);
};

function getWeeklyScheduleLabel(name) {
    const n = getStudentExpectedWeekdays(name);
    if (n >= 5) return null;
    return `주${n}회`;
}

function formatDailyAbsentLines(absentByReason) {
    const reasons = Object.keys(absentByReason).sort((a, b) => {
        if (a === '미등원') return -1;
        if (b === '미등원') return 1;
        return a.localeCompare(b, 'ko-KR');
    });
    return reasons.map(reason => {
        const names = absentByReason[reason];
        return `${names.join(', ')} - ${reason}`;
    });
}

function downloadTextFile(textContent, fileName) {
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function getMonday(d) {
    let date = new Date(d);
    let day = date.getDay();
    let diff = date.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(date.setDate(diff));
}

function formatDateKeyFromDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isWeekdayMonFri(dayOfWeek) {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
}

function isStudentAttendedOnRecord(record) {
    if (!record) return false;
    return record.totalMinutes > 0 || record.sessionFinished || (record.timeLogs && record.timeLogs.length > 0);
}

function isExpectedSchoolDayForStudent(name, dateKey, dayOfWeek) {
    if (!isWeekdayMonFri(dayOfWeek)) return false;
    if (academyHolidays.includes(dateKey)) return false;
    if (studentRegularOffs[name]?.includes(dayOfWeek)) return false;
    return true;
}

function getStudentExpectedWeekdays(name) {
    const regOffs = studentRegularOffs[name] || [];
    let count = 0;
    for (let d = 1; d <= 5; d++) {
        if (!regOffs.includes(d)) count++;
    }
    return count;
}

function computeStudentStatsInRange(startDate, endDate) {
    const results = [];
    const names = studentMasterList.map(s => s.name);
    names.forEach(name => {
        let expectedDays = 0;
        let attendedDays = 0;
        let totalMinutes = 0;
        let totalCoupons = 0;
        let totalPenalties = 0;
        const weeklyTarget = getStudentWeeklyTarget(name);
        const expectedWeekdays = getStudentExpectedWeekdays(name);
        const history = studentHistory[name] || {};
        const cursor = new Date(startDate);
        while (cursor <= endDate) {
            const dateKey = formatDateKeyFromDate(cursor);
            const dow = cursor.getDay();
            const record = history[dateKey];
            if (isExpectedSchoolDayForStudent(name, dateKey, dow)) {
                if (!(record && record.isNoClassDay)) {
                    expectedDays++;
                    if (isStudentAttendedOnRecord(record)) attendedDays++;
                }
            }
            if (isWeekdayMonFri(dow) && record) {
                const mins = getDayRecordMinutes(record);
                if (mins > 0) totalMinutes += mins;
                totalCoupons += record.coupon || 0;
                totalPenalties += record.penalty || 0;
            }
            cursor.setDate(cursor.getDate() + 1);
        }
        const periodTarget = expectedWeekdays > 0
            ? Math.round(weeklyTarget * (expectedDays / expectedWeekdays))
            : 0;
        const attendanceRate = periodTarget > 0
            ? Math.min(100, Math.round((totalMinutes / periodTarget) * 100))
            : 0;
        results.push({ name, grade: studentMasterList.find(s => s.name === name)?.grade || '', expectedDays, expectedWeekdays, attendedDays, attendanceRate, totalMinutes, totalCoupons, totalPenalties, periodTarget, weeklyTarget });
    });
    return results;
}

function buildStatsXYChart(items, valueKey, maxVal, suffix, barColor, yLabel) {
    if (!items.length) return '<p style="color:var(--text-muted); font-weight:700; text-align:center; margin:auto;">표시할 데이터가 없습니다.</p>';
    const barSlot = 56;
    const W = Math.max(640, items.length * barSlot + 100);
    const H = 400;
    const padL = 56, padB = 110, padT = 28, padR = 24;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const barW = Math.min(44, barSlot - 12);
    const gap = items.length > 1 ? (chartW - barW * items.length) / (items.length - 1) : 0;
    const safeMax = maxVal > 0 ? maxVal : 1;

    let gridLines = '';
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
        const val = Math.round(safeMax * i / tickCount);
        const y = padT + chartH - (chartH * i / tickCount);
        gridLines += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`;
        gridLines += `<text x="${padL - 10}" y="${y + 5}" text-anchor="end" class="axis-label">${val}${suffix === '%' ? '%' : ''}</text>`;
    }

    let bars = '';
    items.forEach((item, i) => {
        const val = item[valueKey];
        const barH = Math.max(0, (val / safeMax) * chartH);
        const x = padL + i * (barW + gap);
        const y = padT + chartH - barH;
        const displayVal = suffix === '%' ? `${val}%` : `${val}${suffix}`;
        const labelY = padT + chartH + 14;
        const labelX = x + barW / 2;
        bars += `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(barH, val > 0 ? 2 : 0)}" fill="${barColor}" rx="4" opacity="0.92"><title>${escapeHtml(item.name)}: ${displayVal}</title></rect>`;
        if (val > 0) bars += `<text x="${labelX}" y="${y - 8}" text-anchor="middle" class="bar-value">${displayVal}</text>`;
        bars += `<text x="${labelX}" y="${labelY}" text-anchor="end" class="bar-label" transform="rotate(-40 ${labelX} ${labelY})">${escapeHtml(item.name)}</text>`;
    });

    const axes = `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + chartH}" stroke="#94a3b8" stroke-width="2"/>
        <line x1="${padL}" y1="${padT + chartH}" x2="${W - padR}" y2="${padT + chartH}" stroke="#94a3b8" stroke-width="2"/>
        <text x="${padL + chartW / 2}" y="${H - 6}" text-anchor="middle" class="axis-label">학생 (${items.length}명)</text>
        <text x="16" y="${padT + chartH / 2}" text-anchor="middle" class="axis-label" transform="rotate(-90 16 ${padT + chartH / 2})">${escapeHtml(yLabel)}</text>`;

    return `<div class="stats-xy-chart-wrap"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="stats-xy-chart">${gridLines}${axes}${bars}</svg></div>`;
}

function buildStatsBarRows(items, valueKey, maxVal, suffix, fillClass) {
    if (!items.length) return '<p style="color:var(--text-muted); font-weight:700; text-align:center; margin:auto;">표시할 데이터가 없습니다.</p>';
    return items.map(item => {
        const val = item[valueKey];
        const pct = maxVal > 0 ? Math.max(2, Math.round((val / maxVal) * 100)) : 0;
        const display = suffix === '%' ? `${val}%` : `${val}${suffix}`;
        return `<div class="stats-bar-row">
            <span class="stats-bar-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
            <div class="stats-bar-track"><div class="stats-bar-fill ${fillClass}" style="width:${pct}%"></div></div>
            <span class="stats-bar-val">${display}</span>
        </div>`;
    }).join('');
}

window.switchStatsPeriod = function(period) {
    playUISound('click');
    statsPeriodMode = period;
    document.getElementById('stats-btn-weekly')?.classList.toggle('active', period === 'weekly');
    document.getElementById('stats-btn-monthly')?.classList.toggle('active', period === 'monthly');
    renderStatsCharts();
};

window.switchStatsMetric = function(metric) {
    playUISound('click');
    if (metric === 'warn') metric = 'penalty';
    statsChartMode = metric;
    document.getElementById('stats-btn-rate')?.classList.toggle('active', metric === 'rate');
    document.getElementById('stats-btn-mins')?.classList.toggle('active', metric === 'mins');
    document.getElementById('stats-btn-praise')?.classList.toggle('active', metric === 'praise');
    document.getElementById('stats-btn-penalty')?.classList.toggle('active', metric === 'penalty');
    renderStatsCharts();
};

window.changeStatsMonth = function(delta) {
    playUISound('click');
    currentStatsMonth += delta;
    if (currentStatsMonth > 11) { currentStatsMonth = 0; currentStatsYear++; }
    else if (currentStatsMonth < 0) { currentStatsMonth = 11; currentStatsYear--; }
    renderStatsCharts();
};

window.goToThisStatsMonth = function() {
    playUISound('click');
    const now = new Date();
    currentStatsMonth = now.getMonth();
    currentStatsYear = now.getFullYear();
    renderStatsCharts();
};

window.renderStatsCharts = function() {
    const navEl = document.getElementById('statsNavRow');
    const summaryEl = document.getElementById('statsSummaryRow');
    const gridEl = document.getElementById('statsChartsGrid');
    if (!navEl || !summaryEl || !gridEl) return;
    if (statsChartMode === 'warn') statsChartMode = 'penalty';

    let startDate, endDate, periodLabel;
    if (statsPeriodMode === 'weekly') {
        const monday = getMonday(currentWeeklyDate);
        startDate = new Date(monday);
        endDate = new Date(monday);
        endDate.setDate(monday.getDate() + 6);
        const startStr = `${startDate.getFullYear()}.${String(startDate.getMonth()+1).padStart(2,'0')}.${String(startDate.getDate()).padStart(2,'0')}`;
        const endStr = `${endDate.getFullYear()}.${String(endDate.getMonth()+1).padStart(2,'0')}.${String(endDate.getDate()).padStart(2,'0')}`;
        periodLabel = `${startStr} ~ ${endStr}`;
        navEl.innerHTML = `
            <div class="stats-nav-inner">
                <button class="cal-nav-btn" onclick="changeWeeklyDate(-7); renderStatsCharts();">◀ 이전</button>
                <h2 class="stats-nav-title">${periodLabel}</h2>
                <button class="cal-nav-btn" onclick="changeWeeklyDate(7); renderStatsCharts();">다음 ▶</button>
                <button class="cal-nav-btn stats-nav-today" onclick="goToThisWeek(); renderStatsCharts();">이번 주</button>
            </div>`;
    } else {
        startDate = new Date(currentStatsYear, currentStatsMonth, 1);
        endDate = new Date(currentStatsYear, currentStatsMonth + 1, 0);
        periodLabel = `${currentStatsYear}년 ${currentStatsMonth + 1}월`;
        navEl.innerHTML = `
            <div class="stats-nav-inner">
                <button class="cal-nav-btn" onclick="changeStatsMonth(-1)">◀ 이전</button>
                <h2 class="stats-nav-title">${periodLabel}</h2>
                <button class="cal-nav-btn" onclick="changeStatsMonth(1)">다음 ▶</button>
                <button class="cal-nav-btn stats-nav-today" onclick="goToThisStatsMonth()">이번 달</button>
            </div>`;
    }

    const stats = computeStudentStatsInRange(startDate, endDate);
    const byRate = [...stats].filter(s => s.expectedWeekdays > 0 && s.periodTarget > 0).sort((a, b) => b.attendanceRate - a.attendanceRate || b.totalMinutes - a.totalMinutes);
    const byMins = [...stats].sort((a, b) => b.totalMinutes - a.totalMinutes || b.attendanceRate - a.attendanceRate);
    const byPraise = [...stats].filter(s => s.totalCoupons > 0).sort((a, b) => b.totalCoupons - a.totalCoupons || a.name.localeCompare(b.name, 'ko-KR'));
    const byPenalty = [...stats].filter(s => s.totalPenalties > 0).sort((a, b) => b.totalPenalties - a.totalPenalties || a.name.localeCompare(b.name, 'ko-KR'));
    const maxRate = byRate.length ? byRate[0].attendanceRate : 100;
    const maxMins = byMins.length ? Math.max(byMins[0].totalMinutes, 1) : 1;
    const maxPraise = byPraise.length ? byPraise[0].totalCoupons : 1;
    const maxPenalty = byPenalty.length ? byPenalty[0].totalPenalties : 1;
    const avgRate = byRate.length ? Math.round(byRate.reduce((s, x) => s + x.attendanceRate, 0) / byRate.length) : 0;
    const topMins = byMins[0];
    const topPraise = byPraise[0];
    const topPenalty = byPenalty[0];

    summaryEl.innerHTML = `
        <div class="stats-summary-pill">평균 출석율<strong>${avgRate}%</strong></div>
        <div class="stats-summary-pill">학습 1위<strong>${topMins && topMins.totalMinutes > 0 ? topMins.name + ' ' + topMins.totalMinutes + '분' : '-'}</strong></div>
        <div class="stats-summary-pill">출석 1위<strong>${byRate[0] ? byRate[0].name + ' ' + byRate[0].attendanceRate + '%' : '-'}</strong></div>
        <div class="stats-summary-pill">칭찬 1위<strong>${topPraise ? topPraise.name + ' ' + topPraise.totalCoupons + '회' : '-'}</strong></div>
        <div class="stats-summary-pill">벌점 1위<strong>${topPenalty ? topPenalty.name + ' ' + topPenalty.totalPenalties + '회' : '-'}</strong></div>`;

    let chartItems, chartMax, chartTitle, chartSub, valueKey, suffix, barColor;
    if (statsChartMode === 'mins') {
        chartItems = byMins; chartMax = maxMins; valueKey = 'totalMinutes'; suffix = '분'; barColor = '#2563eb';
        chartTitle = '⏱️ 학습시간 순위'; chartSub = '월~금 누적 수업 분 (많을수록 상위)';
    } else if (statsChartMode === 'praise') {
        chartItems = byPraise; chartMax = maxPraise; valueKey = 'totalCoupons'; suffix = '회'; barColor = '#f59e0b';
        chartTitle = '😊 칭찬 순위'; chartSub = '기간 내 칭찬 받은 횟수';
    } else if (statsChartMode === 'penalty') {
        chartItems = byPenalty; chartMax = maxPenalty; valueKey = 'totalPenalties'; suffix = '회'; barColor = '#ef4444';
        chartTitle = '😠 벌점 순위'; chartSub = '기간 내 벌점 받은 횟수';
    } else {
        chartItems = byRate; chartMax = maxRate; valueKey = 'attendanceRate'; suffix = '%'; barColor = '#059669';
        chartTitle = '📊 출석율 순위';
        chartSub = '학생별 주간 목표(분)·정규 휴무·학원 휴무를 반영한 기간 목표 대비 달성률 (100% = 목표 분 충족)';
    }

    gridEl.innerHTML = `
        <div class="stats-card">
            <h3 class="stats-card-title">${chartTitle}</h3>
            <p class="stats-card-sub">${chartSub}</p>
            ${buildStatsXYChart(
                chartItems,
                valueKey,
                chartMax,
                suffix,
                barColor,
                chartTitle
            )}
        </div>`;
};

window.changeWeeklyDate = function(days) {
    playUISound('click');
    currentWeeklyDate.setDate(currentWeeklyDate.getDate() + days);
    renderWeeklyTable();
}

window.goToThisWeek = function() {
    playUISound('click');
    currentWeeklyDate = new Date();
    renderWeeklyTable();
}

window.sortWeekly = function(col) {
    playUISound('click');
    if(weeklySortConfig.col === col) {
        weeklySortConfig.asc = !weeklySortConfig.asc;
    } else {
        weeklySortConfig.col = col;
        weeklySortConfig.asc = true;
    }
    renderWeeklyTable();
}

function extractStartEnd(logs) {
    if (!logs || logs.length === 0) return { start: '-', end: '-' };
    let start = '-', end = '-';
    let firstMatch = logs[0].match(/\[(.*?)\s*~\s*(.*?)\]/);
    if (firstMatch) start = firstMatch[1].trim();
    let lastMatch = logs[logs.length - 1].match(/\[(.*?)\s*~\s*(.*?)\]/);
    if (lastMatch) end = lastMatch[2].trim();
    return { start, end };
}

window.renderWeeklyTable = function() {
    let monday = getMonday(currentWeeklyDate);
    let days = [];
    let weekDaysKr = ['월', '화', '수', '목', '금', '토', '일'];
    
    for(let i=0; i<7; i++) {
        let tempDate = new Date(monday);
        tempDate.setDate(monday.getDate() + i);
        days.push(tempDate);
    }
    
    let startStr = `${days[0].getFullYear()}.${String(days[0].getMonth()+1).padStart(2,'0')}.${String(days[0].getDate()).padStart(2,'0')}`;
    let endStr = `${days[6].getFullYear()}.${String(days[6].getMonth()+1).padStart(2,'0')}.${String(days[6].getDate()).padStart(2,'0')}`;
    document.getElementById('weeklyTitle').innerText = `${startStr} ~ ${endStr}`;
    
    let studentsData = allNames.map(name => {
        let info = studentMasterList.find(s => s.name === name) || {};
        return { name: name, grade: info.grade || '' };
    });

    studentsData.sort((a, b) => {
        let res = 0;
        if(weeklySortConfig.col === 'name') {
            res = a.name.localeCompare(b.name, 'ko-KR');
        } else if(weeklySortConfig.col === 'grade') {
            res = getGradeWeight(a.grade) - getGradeWeight(b.grade);
        }
        if(res === 0) res = a.name.localeCompare(b.name, 'ko-KR');
        return weeklySortConfig.asc ? res : -res;
    });

    let nameSortClass = weeklySortConfig.col === 'name' ? (weeklySortConfig.asc ? 'sort-asc' : 'sort-desc') : '';
    let gradeSortClass = weeklySortConfig.col === 'grade' ? (weeklySortConfig.asc ? 'sort-asc' : 'sort-desc') : '';

    let todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;

    let theadHtml = `<tr>
        <th rowspan="2" onclick="sortWeekly('name')" class="main-date-th fixed-col-name sortable ${nameSortClass}" style="z-index:15;">이름</th>
        <th rowspan="2" onclick="sortWeekly('grade')" class="main-date-th fixed-col-grade sortable ${gradeSortClass}" style="z-index:15;">학년</th>
    `;
    let subHeadHtml = `<tr>`;

    days.forEach((d, idx) => {
        let dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        let isToday = (dateKey === todayStr);
        let isWeekend = (idx === 5) ? 'color:#3b82f6;' : (idx === 6 ? 'color:#ef4444;' : '');
        
        let todayTopClass = isToday ? 'today-header-top' : '';
        let todayStartClass = isToday ? 'today-start-cell' : '';
        let todayEndClass = isToday ? 'today-end-cell' : '';
        
        theadHtml += `<th colspan="3" class="main-date-th col-divider ${todayTopClass} ${todayStartClass} ${todayEndClass}" style="${isWeekend}">
            ${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} (${weekDaysKr[idx]})
        </th>`;
        
        subHeadHtml += `
            <th class="sub-th ${todayStartClass}">시작</th>
            <th class="sub-th">종료</th>
            <th class="sub-th sub-th-min col-divider ${todayEndClass}">분</th>
        `;
    });
    theadHtml += `
        <th colspan="5" class="main-date-th summary-th col-divider">주간 (월~금)</th>
    </tr>`;
    subHeadHtml += `
        <th class="sub-th summary-th">합계</th>
        <th class="sub-th summary-th">목표</th>
        <th class="sub-th summary-th">잔여/초과</th>
        <th class="sub-th summary-th">😊칭찬</th>
        <th class="sub-th summary-th col-divider">😠벌점</th>
    </tr>`;
    theadHtml += subHeadHtml;
    document.getElementById('weeklyTableHead').innerHTML = theadHtml;

    const weeklyTable = document.querySelector('.weekly-table');
    if (weeklyTable) {
        let colgroup = weeklyTable.querySelector('colgroup');
        if (!colgroup) {
            colgroup = document.createElement('colgroup');
            weeklyTable.insertBefore(colgroup, weeklyTable.firstChild);
        }
        let cols = '<col style="width:118px"><col style="width:68px">';
        for (let i = 0; i < 7; i++) cols += '<col style="width:82px"><col style="width:82px"><col style="width:54px">';
        cols += '<col style="width:72px"><col style="width:68px"><col style="width:96px"><col style="width:58px"><col style="width:58px">';
        colgroup.innerHTML = cols;
    }
    
    let tbodyHtml = '';
    
    studentsData.forEach((sd, sIdx) => {
        let isLastRow = (sIdx === studentsData.length - 1);
        let weekTotalMins = 0;
        let weekTotalCoupons = 0;
        let weekTotalPenalties = 0;
        
        tbodyHtml += `<tr>`;
        tbodyHtml += `<td class="weekly-name-cell fixed-col-name" style="z-index:4;">${sd.name}</td>`;
        tbodyHtml += `<td class="weekly-grade-cell fixed-col-grade" style="z-index:4;">${sd.grade || '-'}</td>`;
        
        days.forEach((d, dayIdx) => {
            let dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            let isToday = (dateKey === todayStr);
            
            let todayStartClass = isToday ? 'today-start-cell' : '';
            let todayEndClass = isToday ? 'today-end-cell' : '';
            let todayBottomClass = (isToday && isLastRow) ? 'border-bottom: 4px solid var(--accent) !important;' : '';

            let record = (studentHistory[sd.name] && studentHistory[sd.name][dateKey]) ? studentHistory[sd.name][dateKey] : null;
            let isRegOff = studentRegularOffs[sd.name]?.includes(d.getDay());
            const dayMins = (record && record.totalMinutes > 0) ? record.totalMinutes : 0;
            if (dayIdx < 5) {
                weekTotalMins += dayMins;
                if (record) {
                    weekTotalCoupons += record.coupon || 0;
                    weekTotalPenalties += record.penalty || 0;
                }
            }
            
            let noClassClass = ((record && record.isNoClassDay) || isRegOff) ? 'weekly-no-class-cell' : '';
            
            if (academyHolidays.includes(dateKey)) {
                tbodyHtml += `<td colspan="3" class="col-divider ${todayStartClass} ${todayEndClass}" style="background:#f8fafc; color:#8b5cf6; font-weight:900; font-size:16px; text-align:center; letter-spacing: 5px; ${todayBottomClass}">🏝️ 휴무</td>`;
                return; 
            }
            if (record && record.isNoClassDay) {
                tbodyHtml += `<td colspan="3" class="col-divider ${todayStartClass} ${todayEndClass} ${noClassClass}" style="background:#f1f5f9; color:#64748b; font-weight:900; font-size:15px; text-align:center; ${todayBottomClass}">🚫 휴원</td>`;
                return;
            }

            const hasLog = hasTimerTimeLog(record);
            if (hasLog) {
                const ext = extractStartEnd(record.timeLogs);
                const isEdited = !!(record.timeEditedByTeacher || record.manuallyEdited);
                const cellStyle = 'weekly-time-cell';
                tbodyHtml += `<td class="weekly-edit-cell ${cellStyle} ${todayStartClass} ${noClassClass}" style="${todayBottomClass}">${buildWeeklyTimeTextInput(sd.name, dateKey, 'start', ext.start, isEdited)}</td>`;
                tbodyHtml += `<td class="weekly-edit-cell ${cellStyle} ${noClassClass}" style="${todayBottomClass}">${buildWeeklyTimeTextInput(sd.name, dateKey, 'end', ext.end, isEdited)}</td>`;
                tbodyHtml += `<td class="weekly-min-cell col-divider ${todayEndClass} ${noClassClass}" style="${todayBottomClass}">${dayMins > 0 ? dayMins + '분' : '-'}</td>`;
            } else {
                tbodyHtml += `<td class="time-empty ${todayStartClass} ${noClassClass} weekly-time-empty" style="${todayBottomClass}">-</td>`;
                tbodyHtml += `<td class="time-empty ${noClassClass} weekly-time-empty" style="${todayBottomClass}">-</td>`;
                tbodyHtml += `<td class="time-empty col-divider ${todayEndClass} ${noClassClass} weekly-time-empty" style="${todayBottomClass}">${dayMins > 0 ? dayMins + '분' : '-'}</td>`;
            }
        });

        const weekTarget = getStudentWeeklyTarget(sd.name);
        const weekDiff = weekTarget - weekTotalMins;
        let remainHtml = '';
        let remainClass = 'weekly-summary-remain done';
        if (weekDiff > 0) {
            remainHtml = `${weekDiff}분 부족`;
            remainClass = 'weekly-summary-remain need';
        } else if (weekDiff < 0) {
            remainHtml = `${Math.abs(weekDiff)}분 초과`;
            remainClass = 'weekly-summary-remain over';
        } else {
            remainHtml = '완료';
        }

        tbodyHtml += `<td class="weekly-summary-total col-divider">${weekTotalMins}분</td>`;
        tbodyHtml += `<td class="weekly-summary-target">${weekTarget}분</td>`;
        tbodyHtml += `<td class="${remainClass}">${remainHtml}</td>`;
        tbodyHtml += `<td class="weekly-summary-praise">${weekTotalCoupons > 0 ? weekTotalCoupons + '회' : '-'}</td>`;
        tbodyHtml += `<td class="weekly-summary-penalty col-divider">${weekTotalPenalties > 0 ? weekTotalPenalties + '회' : '-'}</td>`;
        tbodyHtml += `</tr>`;
    });
    
    document.getElementById('weeklyTableBody').innerHTML = tbodyHtml;
}


// =========================================================================
// ⭐ 엑셀 (CSV) 내보내기 기능
// =========================================================================

function downloadCSV(csvContent, fileName) {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 1. 월간 뷰: 현재 선택된 학생의 현재 달 기록 내보내기
window.exportMonthlyToExcel = function() {
    if (!currentHistoryStudent) { alert("학생을 먼저 선택해 주세요."); return; }
    playUISound('click');
    
    let csvData = ["날짜,요일,총학습시간(분),출결로그,칭찬,벌점,비고"]; 
    const daysInMonth = new Date(currentHistoryYear, currentHistoryMonth + 1, 0).getDate();
    const daysArr = ['일', '월', '화', '수', '목', '금', '토'];
    const studentData = studentHistory[currentHistoryStudent] || {};
    let regOffs = studentRegularOffs[currentHistoryStudent] || [];

    for (let i = 1; i <= daysInMonth; i++) {
        let dateStr = `${currentHistoryYear}-${String(currentHistoryMonth+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        let dayOfWeek = new Date(currentHistoryYear, currentHistoryMonth, i).getDay();
        let record = studentData[dateStr];
        
        let row = [];
        row.push(dateStr); 
        row.push(daysArr[dayOfWeek]); 
        
        if (record && (record.totalMinutes > 0 || record.coupon > 0 || record.penalty > 0 || (record.timeLogs && record.timeLogs.length > 0))) {
            row.push(record.totalMinutes || 0);
            let logStr = (record.timeLogs && record.timeLogs.length > 0) ? record.timeLogs.join(" / ") : "-";
            row.push(`"${logStr}"`); 
            row.push(record.coupon || 0);
            row.push(record.penalty || 0);
            let noteStr = record.note ? record.note.replace(/\n/g, " ") : "";
            row.push(`"${noteStr}"`);
        } else if (academyHolidays.includes(dateStr)) {
            row.push(0, "학원 휴무일", 0, 0, "");
        } else if (record && record.isNoClassDay) {
            row.push(0, "휴원", 0, 0, "");
        } else if (regOffs.includes(dayOfWeek)) {
            row.push(0, "정규휴무", 0, 0, "");
        } else {
            row.push(0, "-", 0, 0, "");
        }
        csvData.push(row.join(","));
    }

    let fileName = `${currentHistoryStudent}_${currentHistoryYear}년_${currentHistoryMonth+1}월_기록.csv`;
    downloadCSV(csvData.join("\n"), fileName);
}

// 2. 주간 뷰: 분리된 시작/종료 시간에 맞춰 엑셀 내보내기
window.exportWeeklyToExcel = function() {
    playUISound('click');
    
    let monday = getMonday(currentWeeklyDate);
    let days = [];
    let weekDaysKr = ['월', '화', '수', '목', '금', '토', '일'];
    
    let headerRow1 = ["이름", "학년"];
    let headerRow2 = ["", ""]; 
    
    for(let i=0; i<7; i++) {
        let tempDate = new Date(monday);
        tempDate.setDate(monday.getDate() + i);
        days.push(tempDate);
        
        let dateStr = `${String(tempDate.getMonth()+1).padStart(2,'0')}.${String(tempDate.getDate()).padStart(2,'0')} (${weekDaysKr[i]})`;
        headerRow1.push(dateStr, "", "");
        headerRow2.push("시작", "종료", "분");
    }
    headerRow1.push("주간합계(월~금)", "", "", "", "");
    headerRow2.push("합계", "목표", "잔여/초과", "칭찬", "벌점");
    
    let csvData = [headerRow1.join(","), headerRow2.join(",")];

    let studentsData = allNames.map(name => {
        let info = studentMasterList.find(s => s.name === name) || {};
        return { name: name, grade: info.grade || '' };
    });

    studentsData.sort((a, b) => {
        let res = 0;
        if(weeklySortConfig.col === 'name') res = a.name.localeCompare(b.name, 'ko-KR');
        else if(weeklySortConfig.col === 'grade') res = getGradeWeight(a.grade) - getGradeWeight(b.grade);
        if(res === 0) res = a.name.localeCompare(b.name, 'ko-KR');
        return weeklySortConfig.asc ? res : -res;
    });

    studentsData.forEach(sd => {
        let row = [sd.name, sd.grade];
        let weekTotalMins = 0;
        let weekTotalCoupons = 0;
        let weekTotalPenalties = 0;
        days.forEach((d, dayIdx) => {
            let dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            let record = (studentHistory[sd.name] && studentHistory[sd.name][dateKey]) ? studentHistory[sd.name][dateKey] : null;
            let isRegOff = studentRegularOffs[sd.name]?.includes(d.getDay());
            const dayMins = (record && record.totalMinutes > 0) ? record.totalMinutes : 0;
            if (dayIdx < 5) {
                weekTotalMins += dayMins;
                if (record) {
                    weekTotalCoupons += record.coupon || 0;
                    weekTotalPenalties += record.penalty || 0;
                }
            }
            
            if (record && record.timeLogs && record.timeLogs.length > 0) {
                let ext = extractStartEnd(record.timeLogs);
                row.push(`"${ext.start}"`, `"${ext.end}"`, dayMins);
            } else if (academyHolidays.includes(dateKey)) {
                row.push("휴무", "", 0);
            } else if (record && record.isNoClassDay) {
                row.push("휴원", "", 0);
            } else if (isRegOff) {
                row.push("정규휴무", "", 0);
            } else {
                row.push("-", "-", dayMins > 0 ? dayMins : 0);
            }
        });
        const weekTarget = getStudentWeeklyTarget(sd.name);
        const weekDiff = weekTarget - weekTotalMins;
        let remainLabel = weekDiff > 0 ? `${weekDiff}분 부족` : (weekDiff < 0 ? `${Math.abs(weekDiff)}분 초과` : '완료');
        row.push(weekTotalMins, weekTarget, `"${remainLabel}"`, weekTotalCoupons, weekTotalPenalties);
        csvData.push(row.join(","));
    });
    
    let startStr = `${days[0].getFullYear()}${String(days[0].getMonth()+1).padStart(2,'0')}${String(days[0].getDate()).padStart(2,'0')}`;
    let fileName = `주간출결표_${startStr}_시작주.csv`;
    downloadCSV(csvData.join("\n"), fileName);
}