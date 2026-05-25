// ==========================================
// 1. APP STATE, I18N & VARIABLES
// ==========================================
const STORAGE_KEY = "samsung_timer_v44_ARCHITECTURE"; 
let DESK_COUNT = 10; 
let timers = [];
let audioCtx = null; 

let draggedName = null; 
let draggedFromIndex = null; 
let draggedNameForList = null; 

let attendanceMap = new Map(); 
let finishedSet = new Set(); 
let assignOrderCounter = 0; 

let studentMasterList = []; 
let studentLevels = {}; 
let studentGrades = {}; 
let studentTimes = {}; 
let studentModifiers = {}; 

let studentHistory = {}; 
let academyHolidays = [];

let customStudentOrder = []; 
let guestList = []; 

let academyName = "향촌삼성영어학원"; 
let className = "Maple Classroom";

let alarmVolume = 0.5; 
let ttsVolume = 0.8; 
let uiVolume = 0.5; 
let currentTheme = "1";
let currentLang = 'ko'; 
let currentFontFamily = "'Pretendard', sans-serif"; 

let rosterViewMode = 'card'; 
let listSortConfig = { col: 'level', asc: true }; 

// ⭐ 리모컨 번호를 저장할 배열
let deskRemoteCodes = ["7893409", "8965601", "5141409", "7498145", "7441889", "7144865", "10551201", "8559585", "8189857", "2677665"];

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

const krHolidays = {
    // 📌 매년 반복되는 고정 공휴일 (연도 생략)
    "01-01": "신정", "03-01": "삼일절", "05-05": "어린이날", "06-06": "현충일",
    "08-15": "광복절", "10-03": "개천절", "10-09": "한글날", "12-25": "기독탄신일",

    // 📌 2024년 (올해)
    "2024-02-09": "설연휴", "2024-02-10": "설날", "2024-02-11": "설연휴", "2024-02-12": "대체공휴일",
    "2024-04-10": "국회의원선거", "2024-05-06": "대체공휴일", "2024-05-15": "부처님오신날",
    "2024-09-16": "추석연휴", "2024-09-17": "추석", "2024-09-18": "추석연휴",

    // 📌 2025년
    "2025-01-28": "설연휴", "2025-01-29": "설날", "2025-01-30": "설연휴",
    "2025-03-03": "대체공휴일", "2025-05-05": "부처님오신날", "2025-05-06": "대체공휴일",
    "2025-10-05": "추석연휴", "2025-10-06": "추석", "2025-10-07": "추석연휴", "2025-10-08": "대체공휴일",

    // 📌 2026년
    "2026-02-16": "설연휴", "2026-02-17": "설날", "2026-02-18": "설연휴",
    "2026-03-02": "대체공휴일", "2026-05-24": "부처님오신날", "2026-05-25": "대체공휴일", 
    "2026-06-03": "지방선거", "2026-08-17": "대체공휴일", 
    "2026-09-24": "추석연휴", "2026-09-25": "추석", "2026-09-26": "추석연휴",

    // 📌 2027년
    "2027-02-06": "설연휴", "2027-02-07": "설날", "2027-02-08": "설연휴", "2027-02-09": "대체공휴일",
    "2027-03-03": "대통령선거", "2027-05-13": "부처님오신날", 
    "2027-08-16": "대체공휴일", "2027-09-14": "추석연휴", "2027-09-15": "추석", "2027-09-16": "추석연휴", 
    "2027-10-04": "대체공휴일", "2027-10-11": "대체공휴일",

    // 📌 2028년
    "2028-01-26": "설연휴", "2028-01-27": "설날", "2028-01-28": "설연휴",
    "2028-04-12": "국회의원선거", "2028-05-02": "부처님오신날", 
    "2028-10-02": "추석연휴", "2028-10-03": "추석", "2028-10-04": "추석연휴", "2028-10-05": "대체공휴일",

    // 📌 2029년
    "2029-02-12": "설연휴", "2029-02-13": "설날", "2029-02-14": "설연휴",
    "2029-05-20": "부처님오신날", 
    "2029-09-21": "추석연휴", "2029-09-22": "추석", "2029-09-23": "추석연휴", "2029-09-24": "대체공휴일",

    // 📌 2030년
    "2030-02-02": "설연휴", "2030-02-03": "설날", "2030-02-04": "설연휴", 
    "2030-05-06": "대체공휴일", "2030-05-09": "부처님오신날", 
    "2030-06-12": "지방선거", 
    "2030-09-11": "추석연휴", "2030-09-12": "추석", "2030-09-13": "추석연휴"
};

const i18n = {
    ko: {
        nav1: "학생 명단", nav2: "타이머", nav3: "학생 기록", nav4: "설정", nav5: "미니 게임",
        rosterMgt: "학생 명단 관리", saveRoster: "💾 명단 저장하기",
        placeholder: "이름 입력",
        acadInfo: "학원 정보 및 디스플레이", acadName: "학원 이름", className: "반 이름",
        timerCount: "⏱️ 타이머 개수 설정", colorTheme: "색상 테마 (30종)", nameColor: "이름 색상 (10종)",
        audioSetup: "오디오 및 효과음 설정", alarmMelody: "알람 멜로디", uiSound: "UI 클릭음", ttsVoice: "🗣️ TTS 음성 안내",
        volAlarm: "🔊 알람 볼륨", volTTS: "🗣️ 음성 볼륨", volUI: "🖱️ 클릭 볼륨",
        sysCtrl: "시스템 백업 및 초기화", backupCreate: "📦 백업 파일 저장 (.json)", backupRestore: "📂 백업 파일 불러오기 (.json)",
        softReset: "🔄 타이머 및 로그 초기화", hardReset: "⚠️ 모든 설정 공장 초기화",
        btnStart: "시작", btnStop: "정지", btnCancel: "취소", btnFinish: "수업 완료", btnClear: "초기화",
        statusAssign: "✔ 자리배정", statusPlaying: "▶️ 수업 중", statusTimeUp: "🔔 시간 종료", statusFinish: "🏁 완료",
        quickStart: "▶️ 시작", quickFinish: "🏁 종료",
        grpWait: "⏳ 반 학생들 (대기중)", grpActive: "▶️ 수업 중 (진행중)", grpFinish: "🏁 수업 완료 (종료됨)",
        langText: "🌐 Language / 언어",
        days: ['일', '월', '화', '수', '목', '금', '토'],
        alertSoft: "타이머 기록과 출결 로그만 초기화합니다.\n진행하시겠습니까?",
        alertHard: "⚠️ 경고 ⚠️\n모든 설정이 초기화됩니다.\n정말 공장 초기화하시겠습니까?",
        alertResetDone: "기록이 리셋되었습니다.", alertFactoryDone: "초기화 완료.", alertBackupDone: "복구 완료!", alertBackupFail: "백업 파일이 유효하지 않습니다.",
        dashTitle: "📋 현황판", dashTotal: "전체", dashWait: "대기", dashActive: "수업 중", dashFinish: "종료"
    },
    en: {
        nav1: "STUDENTS", nav2: "TIMER", nav3: "HISTORY", nav4: "SETTING", nav5: "MINI GAME",
        rosterMgt: "ROSTER MANAGEMENT", saveRoster: "💾 SAVE ROSTER DATA",
        placeholder: "Name",
        acadInfo: "ACADEMY INFO & DISPLAY", acadName: "Academy Name", className: "Class Name",
        timerCount: "⏱️ Timer Dashboard Count", colorTheme: "Color Theme (30 Colors)", nameColor: "Name Color",
        audioSetup: "AUDIO SETUP", alarmMelody: "Alarm Melody", uiSound: "UI Click Sound", ttsVoice: "🗣️ TTS Voice Assistant",
        volAlarm: "🔊 Alarm Volume", volTTS: "🗣️ Voice Volume", volUI: "🖱️ Click Volume",
        sysCtrl: "SYSTEM CONTROL", backupCreate: "📦 CREATE BACKUP (.json)", backupRestore: "📂 RESTORE BACKUP (.json)",
        softReset: "🔄 Soft Reset (Timers & Logs)", hardReset: "⚠️ Hard Reset (Factory Reset)",
        btnStart: "START", btnStop: "STOP", btnCancel: "CANCEL", btnFinish: "FINISH LESSON", btnClear: "CLR",
        statusAssign: "✔ Assigned", statusPlaying: "▶️ Playing", statusTimeUp: "🔔 Time Up", statusFinish: "🏁 Finished",
        quickStart: "▶️ START", quickFinish: "🏁 FINISH",
        grpWait: "⏳ Students List", grpActive: "▶️ In Class", grpFinish: "🏁 FINISHED",
        langText: "🌐 Language / 언어",
        days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        alertSoft: "This will reset timers and logs only.\nProceed?",
        alertHard: "⚠️ WARNING ⚠️\nAll settings will be reset.\nAre you sure?",
        alertResetDone: "Reset completed.", alertFactoryDone: "Factory reset complete.", alertBackupDone: "Restore completed!", alertBackupFail: "Invalid backup file.",
        dashTitle: "📋 Dashboard", dashTotal: "Total", dashWait: "Wait", dashActive: "Active", dashFinish: "Done"
    }
};

// ==========================================
// 2. 디자인 요소 (CSS 동적 주입)
// ==========================================
const customStyle = document.createElement('style');
customStyle.innerHTML = `
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@600;900&family=Gowun+Dodum&family=Jua&family=Do+Hyeon&family=Noto+Serif+KR:wght@600;900&display=swap');
    @font-face { font-family: 'GmarketSans'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff'); font-weight: 700; font-style: normal; }
    @font-face { font-family: 'SUIT'; src: url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT-Bold.woff2') format('woff2'); font-weight: 700; font-style: normal; }
    @font-face { font-family: 'Cafe24Ssurround'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.1/Cafe24Ssurround.woff') format('woff'); font-weight: normal; font-style: normal; }
    @font-face { font-family: 'Hahmlet'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2110@1.0/Hahmlet-Bold.woff2') format('woff2'); font-weight: 700; font-style: normal; }

    body { font-family: var(--app-font, 'Pretendard', sans-serif); }

    .mod-badge-container { display:flex; gap:6px; justify-content:center; align-items:center; margin-bottom:6px; flex-wrap:wrap; z-index:10; }
    .mod-badge { font-size:12px; font-weight:900; padding:4px 8px; border-radius:6px; cursor:pointer; font-family:'Pretendard'; box-shadow:0 2px 4px rgba(0,0,0,0.15); transition:0.2s; white-space:nowrap; }
    .mod-badge:hover { transform:scale(1.1); text-decoration:line-through; opacity:0.8; }
    .mod-badge.coupon { background:#f59e0b; color:#fff; border:1px solid #d97706; }
    .mod-badge.penalty { background:#ef4444; color:#fff; border:1px solid #b91c1c; }
    .card-mod-container { position:absolute; bottom:12px; left:12px; display:flex; flex-direction:column; gap:6px; z-index:10; }
    #grid-finished .student-btn.finished .card-mod-container { opacity: 0.5; pointer-events: none; }

    .settings-roster-table { width: 100%; border-collapse: collapse; min-width: 650px; font-family: 'Pretendard', sans-serif; }
    .settings-roster-table th { background: var(--bg-main); padding: 10px; font-weight: 900; color: var(--text-main); border-bottom: 2px solid var(--border); text-align: center; font-size: 15px; }
    .settings-roster-table td { padding: 4px 6px; border-bottom: 1px solid var(--border); text-align: center; vertical-align: middle; }
    .settings-roster-input { width: 100%; padding: 10px 8px; border: 2px solid var(--border); border-radius: 8px; font-family: 'Pretendard', sans-serif; font-weight: 800; text-align: center; font-size: 16px; box-sizing: border-box; transition: 0.2s; }
    .settings-roster-input:focus { outline: none; border-color: var(--accent); background: #eff6ff; }
    .settings-roster-select { width: 100%; padding: 10px 8px; border: 2px solid var(--border); border-radius: 8px; font-family: 'Pretendard', sans-serif; font-weight: 900; text-align: center; font-size: 15px; box-sizing: border-box; cursor: pointer; transition: 0.2s; }
    .btn-delete-row { background: var(--brand-danger); color: white; border: none; border-radius: 8px; padding: 10px 12px; cursor: pointer; font-weight: 900; font-size: 14px; box-shadow: var(--shadow-btn); transition: 0.2s; white-space: nowrap; }
    .btn-delete-row:hover { transform: scale(1.05); }

    .card-badge-group { position: absolute; top: 10px; left: 10px; display: flex; align-items: center; gap: 6px; z-index: 5; pointer-events: none; }
    .new-level-pill { font-size: 13px; font-weight: 900; padding: 4px 10px; border-radius: 8px; font-family: 'Montserrat', 'Pretendard', sans-serif; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: inline-block; }
    .card-grade-badge { font-size: 13px !important; font-weight: 800; color: var(--text-muted); background: rgba(255,255,255,0.9); padding: 4px 10px; border-radius: 8px; font-family: 'Pretendard', sans-serif !important; letter-spacing: 0.5px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    #grid-active .student-btn .card-badge-group { top: 14px; left: 14px; }
    #grid-active .student-btn .new-level-pill, #grid-active .student-btn .card-grade-badge { font-size: 15px !important; padding: 6px 12px; }
    #grid-finished .student-btn.finished .card-badge-group { opacity: 0.5; }
    .level-color-PRE { background: var(--selena-yellow); color: #000; } .level-color-BASIC { background: var(--selena-pink); color: #fff; } .level-color-INTER { background: var(--selena-orange); color: #fff; } .level-color-ADV { background: var(--selena-cyan); color: #fff; } .level-color-PREP { background: var(--selena-brown); color: #fff; } .level-color-GUEST { background: #94a3b8; color: #fff; }

    #mainHeader { position: relative; }
    .header-dashboard-box { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.9); border: 2px solid var(--border, #e2e8f0); padding: 6px 16px; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); backdrop-filter: blur(8px); z-index: 100; font-family: 'Pretendard', sans-serif; }
    .hd-title { font-size: 15px; font-weight: 900; color: var(--accent); white-space: nowrap; padding-right: 10px; border-right: 2px solid var(--border); }
    .hd-items-container { display: flex; gap: 8px; }
    .hd-item { display: flex; align-items: baseline; gap: 6px; background: #ffffff; border-radius: 8px; padding: 4px 10px; min-width: 50px; justify-content: center; }
    .hd-label { font-size: 12px; font-weight: 800; opacity: 0.7; color: var(--text-main, #334155); }
    .hd-count { font-size: 18px; font-weight: 900; color: var(--text-main, #0f172a); letter-spacing: -0.5px; }
    .hd-item.hd-wait { background: #fffbeb; } .hd-item.hd-wait .hd-count { color: #d97706; }
    .hd-item.hd-active { background: #eff6ff; } .hd-item.hd-active .hd-count { color: #2563eb; }
    .hd-item.hd-finish { background: #f0fdf4; } .hd-item.hd-finish .hd-count { color: #16a34a; }

    .start-time-badge { position: absolute; top: 6px; right: 6px; background: #2563eb; border: 2px solid #60a5fa; color: white; font-size: 14px; font-weight: 900; padding: 6px 10px; border-radius: 8px; cursor: pointer; z-index: 10; box-shadow: 0 4px 8px rgba(0,0,0,0.4); transition: background 0.2s, transform 0.1s; }
    .start-time-badge:hover { background: #1d4ed8; transform: scale(1.05); }

    #grid-unassigned { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important; gap: 14px; align-content: start; }
    #grid-unassigned .student-btn { height: 110px !important; padding: 12px; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }

    .name-text { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; font-family: var(--app-font, 'Pretendard', sans-serif) !important; font-weight: 900; width: 100%; letter-spacing: -0.5px; margin-top: 20px; z-index: 2; position: relative; color: var(--custom-name-color, #0f172a) !important; text-shadow: -1px -1px 0 rgba(255,255,255,0.8), 1px -1px 0 rgba(255,255,255,0.8), -1px 1px 0 rgba(255,255,255,0.8), 1px 1px 0 rgba(255,255,255,0.8), 0 3px 6px rgba(0,0,0,0.2) !important; }
    #grid-unassigned .student-btn .name-text { font-size: 38px !important; margin-top: 15px; }
    #grid-active .student-btn .name-text { font-size: 48px !important; margin-top: 25px; }
    #grid-finished .student-btn.finished .name-text { font-size: 38px !important; color: var(--text-muted) !important; opacity: 1 !important; margin-top: 0; }

    #grid-active .student-btn { width: 100% !important; height: 100% !important; margin: 0 !important; border-radius: 22px; position: absolute; top:0; left:0; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }

    @keyframes active-card-neon { 0% { box-shadow: 0 0 10px #3b82f6, inset 0 0 10px #3b82f6; border-color: #3b82f6; transform: scale(1); } 50% { box-shadow: 0 0 30px #2563eb, inset 0 0 20px #2563eb; border-color: #2563eb; transform: scale(1.02); } 100% { box-shadow: 0 0 10px #3b82f6, inset 0 0 10px #3b82f6; border-color: #3b82f6; transform: scale(1); } }
    #grid-active .student-btn.playing { border: 4px solid #3b82f6 !important; animation: active-card-neon 1.5s infinite ease-in-out !important; background: linear-gradient(145deg, #ffffff, #eff6ff) !important; z-index: 5; }
    #grid-finished .student-btn.finished { opacity: 0.6 !important; filter: grayscale(100%) !important; background: var(--bg-main) !important; border: 2px dashed var(--border) !important; display: flex !important; flex-direction: column !important; justify-content: center !important; overflow: hidden; }

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
    #view-roster { position: relative; padding-top: 55px; }
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
    .l-btn-start { background: var(--brand-success); } .l-btn-stop { background: var(--text-muted); } .l-btn-finish { background: var(--accent); } .l-btn-cancel { background: var(--brand-danger); }
    .list-level-tag { font-size: 15px; padding: 8px 14px; border-radius: 8px; font-weight: 900; display: inline-block; width: 90px; text-align: center; }
    .roster-desk-slot { height: 165px; border: 3px dashed var(--border); border-radius: 22px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.015); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-shadow: inset 2px 2px 5px rgba(0,0,0,0.03); overflow: hidden; }
    .roster-desk-slot.drag-over { background: rgba(59, 130, 246, 0.08); border-color: var(--accent); transform: scale(1.03); z-index: 10; }
    .roster-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;}
    .css-desk { display: flex; flex-direction: column; align-items: center; justify-content: center; transition: 0.2s; }
    .desk-top { width: 90px; height: 50px; background: #e2e8f0; border-radius: 10px; border-bottom: 5px solid #cbd5e1; display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; box-shadow: inset 0 2px 4px rgba(255,255,255,0.7), 0 4px 6px rgba(0,0,0,0.05); transition: 0.2s; }
    .desk-num { font-size: 22px; font-weight: 900; color: #94a3b8; font-family: 'JetBrains Mono', monospace; transition: 0.2s; }
    .desk-chair { width: 40px; height: 20px; background: #cbd5e1; border-radius: 8px 8px 15px 15px; margin-top: -8px; z-index: 1; border-bottom: 3px solid #94a3b8; transition: 0.2s; }
    .roster-empty-text { color: var(--text-muted); font-weight: 700; font-size: 16px; text-align: center; opacity: 0.5; pointer-events: none; margin-top: 10px; font-family: 'Pretendard'; }
    .roster-waiting-text { color: var(--accent); font-weight: 900; font-size: 18px; text-align: center; animation: blinker 1.5s linear infinite; text-shadow: 0 0 8px rgba(59,130,246,0.3); pointer-events: none; margin-bottom: 8px; font-family: 'Pretendard'; }
    .clickable-timer { display: inline-block; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); } .clickable-timer:hover { transform: scale(1.1); filter: brightness(1.2); }

    /* ⭐ 학생 기록 캘린더 */
    #view-history { padding: 20px; font-family: var(--app-font, 'Pretendard', sans-serif); display: none; }
    #view-history.active { display: block; }
    .history-container { display: flex; gap: 20px; height: calc(100vh - 120px); min-height: 600px; position: relative; }
    .history-sidebar { width: 280px; background: var(--bg-card); border-radius: 16px; border: 2px solid var(--border); padding: 15px; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .history-sidebar h3 { margin-top: 0; padding-bottom: 10px; border-bottom: 2px solid var(--border); color: var(--text-main); font-weight: 900; }
    .history-student-item { padding: 14px 12px; border-bottom: 1px solid var(--border); cursor: pointer; font-weight: 800; font-size: 16px; border-radius: 8px; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center; }
    .history-student-item:hover { background: rgba(37,99,235,0.05); color: var(--accent); transform: translateX(5px); }
    .history-student-item.active { background: var(--accent); color: white; border-color: var(--accent); box-shadow: 0 4px 10px rgba(37,99,235,0.3); transform: translateX(5px); }
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
    .cal-record-summary { font-size: 16px; font-weight: 900; color: #059669; margin-top: auto; line-height: 1.4; }
    .cal-record-mods { font-size: 12px; color: var(--brand-danger); }
    .cal-note-preview { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 4px 6px; border-radius: 6px; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 700; border: 1px solid #e2e8f0; max-width: 100%; box-sizing: border-box; display: block; }

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

    /* ⭐ 게임 전용 버튼 및 캔버스 레이아웃 */
    .game-start-btn { margin-top: 25px; padding: 18px 40px; font-size: 26px; font-weight: 900; background: var(--accent); color: white; border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 8px 20px rgba(37,99,235,0.4); transition: 0.2s; font-family: var(--app-font); }
    .game-start-btn:hover { transform: translateY(-5px) scale(1.05); box-shadow: 0 12px 25px rgba(37,99,235,0.6); }
    .active-game-tab { background: var(--accent) !important; color: white !important; transform: scale(1.05); }
`;
document.head.appendChild(customStyle);

window.onload = () => { 
    injectHistoryUI(); 
    injectGameUI(); 
    injectSettingsRosterUI(); 
    injectHeaderDashboard(); 
    injectListViewUI(); 
    injectFontSettingUI(); 
    injectRemoteSettingUI(); 
    loadData(); 
    updateDateUI(); 
}; 

setInterval(() => {
    updateDateUI();
    if(rosterViewMode === 'list') { renderListView(); } 
    else { finishedSet.forEach(name => { updateStudentStatus(name); }); }
}, 60000); 

function updateDateUI() {
    const now = new Date(); const t = i18n[currentLang] || i18n.ko;
    const str = `${now.getFullYear()}. ${String(now.getMonth()+1).padStart(2,'0')}. ${String(now.getDate()).padStart(2,'0')} (${t.days[now.getDay()]})`;
    const el = document.getElementById('displayDate'); if(el) el.innerText = str;
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

// =========================================================================
// ⭐ 3. 미니게임 화면 및 로직 (ST Flow 이전 버전 감성 복구)
// =========================================================================
function injectGameUI() {
    const gameView = document.getElementById('view-game');
    if (gameView) {
        gameView.innerHTML = `
            <div class="game-container" style="text-align: center; padding: 30px; background: var(--bg-card); border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); min-height: 600px;">
                <div style="margin-bottom: 30px; display: flex; justify-content: center; align-items: center; gap: 15px;">
                    <button id="tabRoulette" class="admin-btn active-game-tab" onclick="switchGameMode('roulette')" style="padding: 15px 30px; font-size: 20px; border-radius:12px;">🎯 복불복 룰렛</button>
                    <button id="tabLadder" class="admin-btn" onclick="switchGameMode('ladder')" style="padding: 15px 30px; font-size: 20px; border-radius:12px;">🪜 운명의 사다리</button>
                    <button id="btnBgmToggle" class="admin-btn" onclick="toggleBGM()" style="padding: 15px 20px; font-size: 16px; border-radius:12px; background: var(--bg-main); color: var(--text-main);">🔊 BGM ON</button>
                </div>

                <div id="roulette-game-area" style="position: relative; display: block;">
                    <canvas id="rouletteCanvas" width="600" height="600" style="background:#fff; border-radius:50%; box-shadow:0 10px 40px rgba(0,0,0,0.15); margin:0 auto; display:block;"></canvas>
                    <button id="btnStartRoulette" class="game-start-btn" onclick="startRouletteAnimation()" style="display:none; margin: 25px auto 0;">🎡 룰렛 돌리기 시작!</button>
                </div>

                <div id="ladder-game-area" style="position: relative; display: none; width: 100%; height: 600px; max-width: 800px; margin: 0 auto;">
                    <canvas id="ladderCanvas" width="800" height="600" style="background:#fff; border-radius:20px; border: 4px solid var(--border); box-shadow:0 10px 40px rgba(0,0,0,0.1); display:block; width: 100%; height: 100%;"></canvas>
                    <button id="btnStartLadder" class="game-start-btn" onclick="startLadderAnimation()" style="display:none; margin: 25px auto 0;">🚀 사다리 타기 시작!</button>
                </div>

                <div id="gameResult" style="margin-top: 30px; font-size: 38px; font-weight: 900; min-height: 60px; color: var(--text-main);"></div>
            </div>
        `;
    }
}

window.toggleBGM = function() {
    isBgmOn = !isBgmOn;
    const btn = document.getElementById('btnBgmToggle');
    if(isBgmOn) {
        btn.innerText = "🔊 BGM ON";
        btn.style.color = "var(--text-main)";
    } else {
        btn.innerText = "🔇 BGM OFF";
        btn.style.color = "var(--text-muted)";
    }
    playUISound('click');

    if (isGameAnimating) {
        // 이미 진행 중인 게임이 있다면 알맞은 BGM을 켭니다
        if (isBgmOn) startFunBGM(isRouletteMode ? 'roulette' : 'ladder');
        else stopFunBGM();
    }
}

window.switchGameMode = function(mode) {
    playUISound('click');
    document.getElementById('gameResult').innerHTML = "";
    if(mode === 'ladder') {
        isRouletteMode = false;
        document.getElementById('ladder-game-area').style.display = 'block';
        document.getElementById('roulette-game-area').style.display = 'none';
        document.getElementById('tabLadder').classList.add('active-game-tab');
        document.getElementById('tabRoulette').classList.remove('active-game-tab');
        setupLadder();
    } else {
        isRouletteMode = true;
        document.getElementById('ladder-game-area').style.display = 'none';
        document.getElementById('roulette-game-area').style.display = 'block';
        document.getElementById('tabRoulette').classList.add('active-game-tab');
        document.getElementById('tabLadder').classList.remove('active-game-tab');
        setupRoulette();
    }
};

window.startFunBGM = function(type) {
    if(!isBgmOn) return;
    initAudio();
    let tick = 0;
    // 룰렛: 빰빰빰빰 올라가는 긴장감 넘치는 서커스톤
    const notesRoulette = [392, 493, 587, 783]; 
    // 사다리: 통통 튀는 레트로 8비트 아르페지오
    const notesLadder = [523, 659, 783, 1046, 783, 659]; 
    const notes = type === 'roulette' ? notesRoulette : notesLadder;
    const speed = type === 'roulette' ? 120 : 130;

    ladderBgmTimer = setInterval(() => {
        if(!audioCtx) return;
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = notes[tick % notes.length];
        gain.gain.setValueAtTime(uiVolume * 0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (speed/1000) * 0.8);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + (speed/1000) * 0.8);
        tick++;
    }, speed); 
}

window.stopFunBGM = function() {
    if(ladderBgmTimer) { clearInterval(ladderBgmTimer); ladderBgmTimer = null; }
}

window.playDrumroll = function(durationMs, callback) {
    if(!isBgmOn || !audioCtx) { setTimeout(callback, durationMs); return; }
    let elapsed = 0;
    let interval = 45; 
    let drumTimer = setInterval(() => {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100 + (elapsed/durationMs)*150, audioCtx.currentTime);
        gain.gain.setValueAtTime(uiVolume * 0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.04);
        
        elapsed += interval;
        if(elapsed >= durationMs) {
            clearInterval(drumTimer);
            if(callback) callback();
        }
    }, interval);
}

window.setupLadder = function() {
    playUISound('click');
    if(animReq) { cancelAnimationFrame(animReq); animReq = null; }
    stopFunBGM();
    isGameAnimating = false;

    const canvas = document.getElementById('ladderCanvas');
    const ctx = canvas.getContext('2d');
    
    ladderPlayers = timers.filter(t => t.student !== "(empty)").map(t => t.student);
    document.getElementById('gameResult').innerHTML = "";
    
    const btnStart = document.getElementById('btnStartLadder');
    btnStart.innerText = "🚀 사다리 타기 시작!";
    btnStart.style.display = 'none';

    if(ladderPlayers.length < 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted');
        ctx.font = "bold 20px Pretendard";
        ctx.textAlign = "center";
        ctx.fillText("최소 2명 이상의 수업 중인 학생이 필요합니다.", canvas.width/2, canvas.height/2);
        return;
    }

    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    generateLadderData();
    isResultRevealed = false; 
    drawStaticLadder();
    
    const w = canvas.width; const spacing = w / ladderPlayers.length;
    ctx.globalAlpha = 1.0;
    for(let p=0; p<ladderPlayers.length; p++) {
        let curX = (p + 0.5) * spacing;
        let curY = 40;
        ctx.fillStyle = ladderColors[p % ladderColors.length];
        let boxW = 54, boxH = 28;
        ctx.beginPath();
        if(ctx.roundRect) ctx.roundRect(curX - boxW/2, curY - boxH/2, boxW, boxH, 8);
        else ctx.rect(curX - boxW/2, curY - boxH/2, boxW, boxH);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "900 13px Pretendard";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let shortName = ladderPlayers[p].length > 4 ? ladderPlayers[p].substring(0,3)+".." : ladderPlayers[p];
        ctx.fillText(shortName, curX, curY);
    }
    
    btnStart.style.display = 'block';
}

function generateLadderData() {
    ladderRungs = [];
    const cols = ladderPlayers.length;
    targetWinnerIndex = Math.floor(Math.random() * cols);
    
    const h = document.getElementById('ladderCanvas').height;
    const ySteps = Math.floor(Math.random() * 10) + 25; 
    const yGap = (h - 120) / ySteps;
    
    for(let i=1; i<ySteps; i++) {
        let baseY = 60 + (i * yGap);
        let usedCols = new Set();
        let numRungs = Math.floor(Math.random() * cols) + 1;
        
        for(let j=0; j<numRungs; j++) {
            let c = Math.floor(Math.random() * (cols - 1));
            if(!usedCols.has(c) && !usedCols.has(c+1)) {
                usedCols.add(c);
                usedCols.add(c+1);
                
                // ⭐ 대각선을 제거하고 양쪽 높이를 완벽히 동일하게 맞춰 중복 버그 해결
                let yPos = baseY + (Math.random() * 14 - 7);
                ladderRungs.push({col: c, yLeft: yPos, yRight: yPos});
            }
        }
    }
    ladderRungs.sort((a,b) => a.yLeft - b.yLeft);
}

function drawStaticLadder() {
    const canvas = document.getElementById('ladderCanvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width; const h = canvas.height;
    const cols = ladderPlayers.length;
    const spacing = w / cols;
    
    ctx.clearRect(0, 0, w, h);
    
    const lineColor = getComputedStyle(document.body).getPropertyValue('--border').trim();
    const accentColor = getComputedStyle(document.body).getPropertyValue('--accent').trim();

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    
    // 1. 기본 세로선만 그리고, 가로선(사다리 뼈대)은 그리지 않고 숨깁니다.
    ctx.strokeStyle = lineColor;
    for(let i=0; i<cols; i++) {
        let x = (i + 0.5) * spacing;
        ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, h - 40); ctx.stroke();
    }
    
    ctx.font = "bold 20px Pretendard";
    ctx.textAlign = "center";
    
    // 2. 물음표(?)로 가리던 로직을 지우고, 시작부터 당첨/꽝을 항상 보여줍니다.
    for(let i=0; i<cols; i++) {
        let x = (i + 0.5) * spacing;
        if(i === targetWinnerIndex) {
            ctx.fillStyle = accentColor; 
            ctx.fillText("🎁 당첨", x, h - 15);
        } else {
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted').trim();
            ctx.fillText("꽝", x, h - 15);
        }
    }
}

window.startLadderAnimation = function() {
    playUISound('click');
    startFunBGM('ladder'); 
    
    document.getElementById('btnStartLadder').style.display = 'none';
    document.getElementById('gameResult').innerHTML = "<span style='color:var(--text-muted);'>결과를 향해 내려갑니다...👀</span>";
    
    isResultRevealed = false; 
    isGameAnimating = true;
    
    if(animReq) cancelAnimationFrame(animReq);
    
    const canvas = document.getElementById('ladderCanvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width; const h = canvas.height;
    const cols = ladderPlayers.length;
    const spacing = w / cols;
    const brandDanger = getComputedStyle(document.body).getPropertyValue('--brand-danger').trim() || '#ef4444';
    
    let colEvents = Array.from({length: cols}, () => []);
    ladderRungs.forEach(r => {
        colEvents[r.col].push({ yMe: r.yLeft, yTarget: r.yRight, targetCol: r.col + 1 });
        colEvents[r.col + 1].push({ yMe: r.yRight, yTarget: r.yLeft, targetCol: r.col });
    });
    colEvents.forEach(events => events.sort((a,b) => a.yMe - b.yMe));

    let paths = []; 
    for(let p=0; p<cols; p++) {
        let curCol = p; let curY = 40; let path = [{x: (curCol + 0.5) * spacing, y: curY}];
        while(true) {
            let nextEvent = colEvents[curCol].find(e => e.yMe > curY + 0.5);
            if(!nextEvent) { path.push({x: (curCol + 0.5) * spacing, y: h - 40}); break; }
            path.push({x: (curCol + 0.5) * spacing, y: nextEvent.yMe});
            curCol = nextEvent.targetCol; curY = nextEvent.yTarget;
            path.push({x: (curCol + 0.5) * spacing, y: curY});
        }
        paths.push({ nodes: path, finalCol: curCol, color: ladderColors[p % ladderColors.length] });
    }
    
    let progress = 0; 
    const speed = 1.5; 
    
    paths.forEach(p => {
        let totalLen = 0;
        for(let i=0; i<p.nodes.length-1; i++) {
            let dx = p.nodes[i+1].x - p.nodes[i].x; let dy = p.nodes[i+1].y - p.nodes[i].y;
            totalLen += Math.sqrt(dx*dx + dy*dy);
        }
        p.totalLen = totalLen;
    });
    
    let maxLen = Math.max(...paths.map(p => p.totalLen));
    
    function drawPathsAndIcons(prog) {
        ctx.lineWidth = 6; ctx.lineJoin = "round";
        for(let p=0; p<cols; p++) {
            let pathObj = paths[p]; let drawnLen = 0;
            ctx.strokeStyle = pathObj.color; ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.moveTo(pathObj.nodes[0].x, pathObj.nodes[0].y);
            for(let i=0; i<pathObj.nodes.length-1; i++) {
                let dx = pathObj.nodes[i+1].x - pathObj.nodes[i].x; let dy = pathObj.nodes[i+1].y - pathObj.nodes[i].y;
                let segLen = Math.sqrt(dx*dx + dy*dy);
                if(drawnLen + segLen < prog) {
                    ctx.lineTo(pathObj.nodes[i+1].x, pathObj.nodes[i+1].y); drawnLen += segLen;
                } else {
                    let remain = prog - drawnLen; let ratio = remain / segLen;
                    ctx.lineTo(pathObj.nodes[i].x + dx*ratio, pathObj.nodes[i].y + dy*ratio); break;
                }
            }
            ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
        for(let p=0; p<cols; p++) {
            let pathObj = paths[p];
            let currentProg = Math.min(prog, pathObj.totalLen);
            let curX = pathObj.nodes[0].x, curY = pathObj.nodes[0].y; let drawn = 0;
            for(let i=0; i<pathObj.nodes.length-1; i++) {
                let dx = pathObj.nodes[i+1].x - pathObj.nodes[i].x; let dy = pathObj.nodes[i+1].y - pathObj.nodes[i].y;
                let seg = Math.sqrt(dx*dx + dy*dy);
                if(drawn + seg >= currentProg) {
                    let ratio = (currentProg - drawn) / seg;
                    curX = pathObj.nodes[i].x + dx*ratio; curY = pathObj.nodes[i].y + dy*ratio; break;
                }
                drawn += seg; curX = pathObj.nodes[i+1].x; curY = pathObj.nodes[i+1].y;
            }
            
            ctx.fillStyle = pathObj.color;
            let boxW = 54, boxH = 28;
            ctx.beginPath();
            if(ctx.roundRect) ctx.roundRect(curX - boxW/2, curY - boxH/2, boxW, boxH, 8);
            else ctx.rect(curX - boxW/2, curY - boxH/2, boxW, boxH);
            ctx.fill();
            
            ctx.fillStyle = "#fff"; ctx.font = "900 13px Pretendard";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            let shortName = ladderPlayers[p].length > 4 ? ladderPlayers[p].substring(0,3)+".." : ladderPlayers[p];
            ctx.fillText(shortName, curX, curY);
        }
    }
    
    function drawFrame() {
        drawStaticLadder(); 
        progress += speed;
        drawPathsAndIcons(progress);
        
        if(progress < maxLen) {
            animReq = requestAnimationFrame(drawFrame);
        } else {
            isGameAnimating = false; 
            stopFunBGM(); 
            
            drawStaticLadder();
            drawPathsAndIcons(maxLen);
            
            document.getElementById('gameResult').innerHTML = "<span style='color:var(--text-muted);'>결과 발표... 두구두구두구! 🥁</span>";
            
            playDrumroll(2500, () => {
                isResultRevealed = true;
                drawStaticLadder();
                drawPathsAndIcons(maxLen);
                
                let winnerPathObj = paths.find(p => p.finalCol === targetWinnerIndex);
                if(winnerPathObj) {
                    ctx.strokeStyle = brandDanger; ctx.lineWidth = 12; ctx.beginPath();
                    ctx.moveTo(winnerPathObj.nodes[0].x, winnerPathObj.nodes[0].y);
                    for(let i=0; i<winnerPathObj.nodes.length-1; i++) {
                        ctx.lineTo(winnerPathObj.nodes[i+1].x, winnerPathObj.nodes[i+1].y);
                    }
                    ctx.stroke();
                }

                let realWinnerName = "";
                for(let p=0; p<cols; p++) {
                    if(paths[p].finalCol === targetWinnerIndex) { realWinnerName = ladderPlayers[p]; break; }
                }
                
                playUISound('finish');
                document.getElementById('gameResult').innerHTML = `🎉 축하합니다! <span style="color:var(--brand-danger)">${realWinnerName}</span> 학생이 당첨되었습니다! 🎉`;
            });
        }
    }
    
    animReq = requestAnimationFrame(drawFrame);
}

window.setupRoulette = function() {
    playUISound('click');
    if(animReq) { cancelAnimationFrame(animReq); animReq = null; }
    stopFunBGM();
    rouletteSpinning = false;
    isGameAnimating = false;
    
    roulettePlayers = timers.filter(t => t.student !== "(empty)").map(t => t.student);
    document.getElementById('gameResult').innerHTML = "";
    
    const btnStart = document.getElementById('btnStartRoulette');
    btnStart.innerText = "🎡 룰렛 돌리기 시작!";
    btnStart.style.display = 'none';

    const canvas = document.getElementById('rouletteCanvas');
    const ctx = canvas.getContext('2d');
    
    if(roulettePlayers.length < 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted');
        ctx.font = "bold 20px Pretendard";
        ctx.textAlign = "center";
        ctx.fillText("최소 2명 이상의 수업 중인 학생이 필요합니다.", canvas.width/2, canvas.height/2);
        return;
    }

    rouletteAngle = 0;
    drawRoulette(rouletteAngle);
    btnStart.style.display = 'block';
}

function drawRoulette(angle) {
    const canvas = document.getElementById('rouletteCanvas');
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    const cx = cw / 2;
    const cy = ch / 2;
    const radius = Math.min(cw, ch) / 2 - 25;

    ctx.clearRect(0, 0, cw, ch);

    const numSlices = roulettePlayers.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    for(let i = 0; i < numSlices; i++) {
        const startAngle = angle + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = ladderColors[i % ladderColors.length];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px Pretendard";
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 4;
        ctx.fillText(roulettePlayers[i], radius - 20, 0);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, 2 * Math.PI);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-card') || '#fff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent') || '#2563eb';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - radius - 15);
    ctx.lineTo(cx + 18, cy - radius - 15);
    ctx.lineTo(cx, cy - radius + 20);
    ctx.closePath();
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--brand-danger') || '#ef4444';
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
}

window.startRouletteAnimation = function() {
    if(rouletteSpinning) return;
    playUISound('start');
    startFunBGM('roulette'); 
    
    document.getElementById('btnStartRoulette').style.display = 'none';
    document.getElementById('gameResult').innerHTML = "결과 확인 중...👀";
    rouletteSpinning = true;
    isGameAnimating = true;
    
    if(animReq) cancelAnimationFrame(animReq);

    let speed = Math.random() * 0.2 + 0.4; 
    const friction = 0.993; 
    
    function spin() {
        rouletteAngle += speed;
        drawRoulette(rouletteAngle);
        speed *= friction;

        if(speed > 0.002) {
            animReq = requestAnimationFrame(spin);
        } else {
            rouletteSpinning = false;
            isGameAnimating = false;
            stopFunBGM(); 
            
            const numSlices = roulettePlayers.length;
            const sliceAngle = (2 * Math.PI) / numSlices;
            
            let offsetAngle = ((3 * Math.PI / 2) - rouletteAngle) % (2 * Math.PI);
            if(offsetAngle < 0) offsetAngle += 2 * Math.PI;
            
            const winningIndex = Math.floor(offsetAngle / sliceAngle);
            const winnerName = roulettePlayers[winningIndex];

            playUISound('finish');
            document.getElementById('gameResult').innerHTML = `🎉 축하합니다! <span style="color:var(--brand-danger)">${winnerName}</span> 학생이 당첨되었습니다! 🎉`;

            const btnStart = document.getElementById('btnStartRoulette');
            btnStart.innerText = "🎬 다시 돌리기";
            btnStart.style.display = 'block';
        }
    }
    spin();
}

// =========================================================================
// ⭐ 설정창 '명단 관리' 테이블 
// =========================================================================
window.updateSelectColor = function(selectEl) {
    const val = selectEl.value;
    let bg = '#ffffff', color = '#000000';
    if(val === 'PRE') { bg = 'var(--selena-yellow)'; color = '#000'; }
    else if(val === 'BASIC') { bg = 'var(--selena-pink)'; color = '#fff'; }
    else if(val === 'INTER') { bg = 'var(--selena-orange)'; color = '#fff'; }
    else if(val === 'ADV') { bg = 'var(--selena-cyan)'; color = '#fff'; }
    else if(val === 'PREP') { bg = 'var(--selena-brown)'; color = '#fff'; }
    selectEl.style.backgroundColor = bg; selectEl.style.color = color;
};

function injectSettingsRosterUI() {
    const settingsCards = document.querySelectorAll('.settings-card');
    let rosterCard = null;
    settingsCards.forEach(card => { if(card.innerHTML.includes('학생 명단 관리') || card.innerHTML.includes('ROSTER MANAGEMENT')) rosterCard = card; });

    if(rosterCard) {
        rosterCard.style.maxWidth = "100%";
        rosterCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                <h3 data-i18n="rosterMgt">📋 학생 명단 관리 (통합 목록)</h3>
                <button class="admin-btn btn-3d" onclick="addSettingsStudentRow()" style="margin:0; width:auto; padding:12px 20px; font-size:16px; font-weight:900; background:var(--brand-success); color:#fff;">➕ 새로운 학생 추가</button>
            </div>
            <div style="overflow-x: auto; max-height: 450px; overflow-y: auto; border: 2px solid var(--border); border-radius: 12px; background:var(--bg-card);">
                <table class="settings-roster-table" id="settingsRosterTable">
                    <thead style="position: sticky; top: 0; z-index: 2; background: var(--bg-main); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <tr>
                            <th style="width: 15%;">이름</th>
                            <th style="width: 15%;">학년</th>
                            <th style="width: 25%;">레벨</th>
                            <th style="width: 15%;">수업시간(분)</th>
                            <th style="width: 15%;">생일(MM-DD)</th>
                            <th style="width: 15%;">관리</th>
                        </tr>
                    </thead>
                    <tbody id="settingsRosterBody"></tbody>
                </table>
            </div>
            <button class="admin-btn btn-3d primary" onclick="saveSettingsRoster()" style="margin-top: 20px; width: 100%; font-size: 20px; font-weight: 900; padding: 18px;" data-i18n="saveRoster">💾 작성한 명단 전체 저장 및 적용하기</button>
        `;
    }
}

function renderSettingsRoster() {
    const tbody = document.getElementById('settingsRosterBody'); if(!tbody) return; tbody.innerHTML = '';
    if(studentMasterList.length === 0) { addSettingsStudentRow(); return; }
    studentMasterList.forEach(st => { tbody.insertAdjacentHTML('beforeend', createStudentRowHTML(st.name, st.grade, st.level, st.time, st.birthday)); });
    tbody.querySelectorAll('select').forEach(sel => updateSelectColor(sel));
}

function createStudentRowHTML(name = '', grade = '', level = 'PRE', time = 50, birthday = '') {
    return `
        <tr>
            <td><input type="text" class="settings-roster-input" value="${name}" placeholder="이름"></td>
            <td><input type="text" class="settings-roster-input" value="${grade}" placeholder="학년"></td>
            <td>
                <select class="settings-roster-select" onchange="updateSelectColor(this)">
                    <option value="PRE" ${level==='PRE'?'selected':''}>PRE</option>
                    <option value="BASIC" ${level==='BASIC'?'selected':''}>BASIC</option>
                    <option value="INTER" ${level==='INTER'?'selected':''}>INTER</option>
                    <option value="ADV" ${level==='ADV'?'selected':''}>ADV</option>
                    <option value="PREP" ${level==='PREP'?'selected':''}>PREP31</option>
                </select>
            </td>
            <td><input type="number" class="settings-roster-input" value="${time}" min="1" max="300"></td>
            <td><input type="text" class="settings-roster-input" value="${birthday}" placeholder="04-23"></td>
            <td><button class="btn-delete-row" onclick="deleteSettingsStudentRow(this)">삭제</button></td>
        </tr>
    `;
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
        const birthday = inputs[3] ? inputs[3].value.trim() : '';
        if(name) { studentMasterList.push({name, grade, level, time, birthday}); }
    });
    saveToStorage(); generateStudents(); renderHistorySidebar(); alert("학생 명단이 성공적으로 저장되었습니다!");
};

// =========================================================================
// ⭐ 히스토리 기록 (HISTORY) 시스템 UI 
// =========================================================================
function injectHistoryUI() {
    const logTabBtn = document.querySelector('.nav-tab[onclick*="log"]');
    if (logTabBtn) {
        logTabBtn.setAttribute('onclick', "switchView('history')");
        logTabBtn.innerHTML = `<span class="nav-icon">📅</span><span class="nav-text" data-i18n="nav3">학생 기록</span>`; 
        logTabBtn.style.fontFamily = "var(--app-font, 'Pretendard', sans-serif)";
    }

    const oldLogView = document.getElementById('view-log');
    if (oldLogView) {
        oldLogView.id = 'view-history';
        oldLogView.className = 'view-section';
        oldLogView.innerHTML = `
            <div class="history-container">
                <div class="history-sidebar">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h3>👥 원생 목록</h3>
                    </div>
                    <div id="historyStudentList"></div>
                </div>
                <div class="history-content">
                    <div class="calendar-header">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <button class="cal-nav-btn" onclick="changeHistoryMonth(-1)">◀ 이전</button>
                            <h2 id="historyMonthTitle">2026년 5월</h2>
                            <button class="cal-nav-btn" onclick="changeHistoryMonth(1)">다음 ▶</button>
                        </div>
                        <button class="btn-danger-outline" onclick="deleteHistoryAll()" style="padding: 8px 16px;">🚨 이 학생 전체 기록 삭제</button>
                    </div>
                    
                    <div class="cal-grid-header">
                        <div class="cal-day-header" style="color:#ef4444;">일</div>
                        <div class="cal-day-header">월</div>
                        <div class="cal-day-header">화</div>
                        <div class="cal-day-header">수</div>
                        <div class="cal-day-header">목</div>
                        <div class="cal-day-header">금</div>
                        <div class="cal-day-header" style="color:#3b82f6;">토</div>
                    </div>
                    <div class="cal-grid" id="historyCalGrid"></div>
                    
                    <div class="history-detail-popup" id="historyDetailPopup">
                        <button class="popup-close-btn" onclick="closeHistoryDetail()">✖</button>
                        <div class="detail-title">📅 <span id="detailDateText">날짜 선택됨</span></div>
                        <div style="display:flex; gap: 8px; margin-bottom:15px; flex-wrap:wrap;">
                            <button id="btnToggleAcadHoliday" class="btn-acad-holiday" onclick="toggleAcademyHoliday()">🏝️ 학원 휴무일로 지정</button>
                            <button id="btnDeleteDay" class="btn-danger-outline" onclick="deleteHistoryDate()">🗑️ 이 날짜만 리셋</button>
                        </div>
                        <div class="detail-stats">
                            <div class="detail-stat-item">⏱️ 총 학습<br><span id="detailTotalMins" style="color:var(--accent); font-size:20px; display:block; margin-top:5px;">0</span>분</div>
                            <div class="detail-stat-item">🎟️ 쿠폰<br><span id="detailCoupons" style="color:#f59e0b; font-size:20px; display:block; margin-top:5px;">0</span>개</div>
                            <div class="detail-stat-item">🚨 벌칙<br><span id="detailPenalties" style="color:var(--brand-danger); font-size:20px; display:block; margin-top:5px;">0</span>개</div>
                        </div>
                        <textarea id="detailNoteInput" class="detail-textarea" placeholder="특이사항(비고)을 입력하세요..."></textarea>
                        <button class="detail-save-btn" onclick="saveHistoryNote()">💾 메모 저장 및 닫기</button>
                        <div style="clear:both;"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

function renderHistorySidebar() {
    const listEl = document.getElementById('historyStudentList'); if(!listEl) return;
    listEl.innerHTML = '';
    
    studentMasterList.forEach(st => {
        const item = document.createElement('div');
        item.className = 'history-student-item';
        if (currentHistoryStudent === st.name) item.classList.add('active');
        
        let crown = isTodayBirthday(st.birthday) ? " 👑" : "";
        item.innerHTML = `<span>${st.name}${crown}</span> <span style="font-size:12px; color:var(--text-muted);">${st.level}</span>`;
        item.onclick = () => { selectHistoryStudent(st.name); };
        listEl.appendChild(item);
    });
}

window.selectHistoryStudent = function(name) {
    playUISound('click');
    currentHistoryStudent = name;
    closeHistoryDetail();
    renderHistorySidebar();
    renderHistoryCalendar();
}

window.changeHistoryMonth = function(delta) {
    playUISound('click');
    currentHistoryMonth += delta;
    if (currentHistoryMonth > 11) { currentHistoryMonth = 0; currentHistoryYear++; }
    else if (currentHistoryMonth < 0) { currentHistoryMonth = 11; currentHistoryYear--; }
    closeHistoryDetail();
    renderHistoryCalendar();
}

window.closeHistoryDetail = function() {
    const popup = document.getElementById('historyDetailPopup');
    if(popup) popup.classList.remove('active');
    currentSelectedDate = null;
    renderHistoryCalendar(); 
};

function renderHistoryCalendar() {
    const gridEl = document.getElementById('historyCalGrid');
    const titleEl = document.getElementById('historyMonthTitle');
    if(!gridEl || !titleEl) return;
    
    titleEl.innerText = `${currentHistoryYear}년 ${currentHistoryMonth + 1}월 - ${currentHistoryStudent ? currentHistoryStudent : '학생을 선택하세요'}`;
    gridEl.innerHTML = '';
    
    if(!currentHistoryStudent) return; 
    
    const firstDay = new Date(currentHistoryYear, currentHistoryMonth, 1).getDay();
    const daysInMonth = new Date(currentHistoryYear, currentHistoryMonth + 1, 0).getDate();
    
    for(let i=0; i<firstDay; i++) {
        let empty = document.createElement('div'); empty.className = 'cal-day empty-cell'; gridEl.appendChild(empty);
    }
    
    const studentData = studentHistory[currentHistoryStudent] || {};
    
    for(let i=1; i<=daysInMonth; i++) {
        const dateStr = `${currentHistoryYear}-${String(currentHistoryMonth+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const mmddStr = `${String(currentHistoryMonth+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const record = studentData[dateStr];
        
        const dayOfWeek = new Date(currentHistoryYear, currentHistoryMonth, i).getDay();
        const isSunday = dayOfWeek === 0;
        const isSaturday = dayOfWeek === 6;
        
        const holidayName = krHolidays[dateStr] || krHolidays[mmddStr];
        const isAcadHoliday = academyHolidays.includes(dateStr);
        
        const dayEl = document.createElement('div');
        dayEl.className = 'cal-day';
        if(isSunday || holidayName) dayEl.classList.add('is-holiday');
        if(isSaturday) dayEl.classList.add('is-saturday');
        if(currentSelectedDate === dateStr) dayEl.classList.add('active');
        if(record && record.totalMinutes > 0) dayEl.classList.add('has-record');
        
        let dateHtml = `<div class="cal-date-num">${i}`;
        if(holidayName) dateHtml += `<span class="holiday-label">${holidayName}</span>`;
        if(isAcadHoliday) dateHtml += `<span class="acad-holiday-label">휴무</span>`;
        dateHtml += `</div>`;
        
        let contentHtml = dateHtml;
        
        if(record && record.totalMinutes > 0) {
            contentHtml += `<div class="cal-record-summary">${record.totalMinutes}분 학습</div>`;
            let mods = [];
            if(record.coupon > 0) mods.push(`🎟️${record.coupon}`);
            if(record.penalty > 0) mods.push(`🚨${record.penalty}`);
            if(mods.length > 0) contentHtml += `<div class="cal-record-mods">${mods.join(' ')}</div>`;
            
            if(record.note) {
                let shortNote = record.note.length > 8 ? record.note.substring(0, 8) + '...' : record.note;
                contentHtml += `<div class="cal-note-preview" title="${record.note}">📝 ${shortNote}</div>`;
            }
        } else if (isAcadHoliday) {
            contentHtml += `<div style="margin-top:auto; text-align:center; font-size:28px; opacity:0.8;">🏝️</div>`;
        }
        
        dayEl.innerHTML = contentHtml;
        dayEl.onclick = () => { selectHistoryDate(dateStr, record); };
        gridEl.appendChild(dayEl);
    }
}

window.selectHistoryDate = function(dateStr, record) {
    playUISound('click');
    currentSelectedDate = dateStr;
    renderHistoryCalendar(); 
    
    const popup = document.getElementById('historyDetailPopup');
    popup.classList.add('active');
    document.getElementById('detailDateText').innerText = `${dateStr} 상세 기록`;
    
    const btnAcad = document.getElementById('btnToggleAcadHoliday');
    if(academyHolidays.includes(dateStr)) {
        btnAcad.innerText = "✖ 휴무일 해제";
        btnAcad.style.background = "#ef4444";
    } else {
        btnAcad.innerText = "🏝️ 휴무일 지정";
        btnAcad.style.background = "#8b5cf6";
    }
    
    if(record) {
        document.getElementById('detailTotalMins').innerText = record.totalMinutes;
        document.getElementById('detailCoupons').innerText = record.coupon;
        document.getElementById('detailPenalties').innerText = record.penalty;
        document.getElementById('detailNoteInput').value = record.note || "";
        document.getElementById('btnDeleteDay').style.display = "inline-block";
    } else {
        document.getElementById('detailTotalMins').innerText = "0";
        document.getElementById('detailCoupons').innerText = "0";
        document.getElementById('detailPenalties').innerText = "0";
        document.getElementById('detailNoteInput').value = "";
        document.getElementById('btnDeleteDay').style.display = "none"; 
    }
}

window.saveHistoryNote = function() {
    if(!currentHistoryStudent || !currentSelectedDate) return;
    playUISound('finish');
    if(!studentHistory[currentHistoryStudent]) studentHistory[currentHistoryStudent] = {};
    if(!studentHistory[currentHistoryStudent][currentSelectedDate]) {
        studentHistory[currentHistoryStudent][currentSelectedDate] = { totalMinutes: 0, coupon: 0, penalty: 0, note: "" };
    }
    studentHistory[currentHistoryStudent][currentSelectedDate].note = document.getElementById('detailNoteInput').value.trim();
    saveToStorage(); closeHistoryDetail(); 
}

window.deleteHistoryDate = function() {
    if(!currentHistoryStudent || !currentSelectedDate) return;
    playUISound('cancel');
    if(confirm(`[${currentSelectedDate}] 이 날짜의 기록을 정말 삭제하시겠습니까?`)) {
        if(studentHistory[currentHistoryStudent] && studentHistory[currentHistoryStudent][currentSelectedDate]) {
            delete studentHistory[currentHistoryStudent][currentSelectedDate];
            saveToStorage(); closeHistoryDetail(); 
        }
    }
};

window.deleteHistoryAll = function() {
    if(!currentHistoryStudent) return;
    playUISound('cancel');
    if(confirm(`⚠️ 경고!\n[${currentHistoryStudent}] 학생의 "모든 누적 기록"을 영구적으로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
        delete studentHistory[currentHistoryStudent];
        saveToStorage(); closeHistoryDetail(); renderHistoryCalendar();
    }
};

window.toggleAcademyHoliday = function() {
    if(!currentSelectedDate) return;
    playUISound('click');
    const idx = academyHolidays.indexOf(currentSelectedDate);
    if(idx > -1) { academyHolidays.splice(idx, 1); } 
    else { academyHolidays.push(currentSelectedDate); }
    saveToStorage();
    selectHistoryDate(currentSelectedDate, studentHistory[currentHistoryStudent]?.[currentSelectedDate]);
};

// =========================================================================
// 공통 UI/기능 (리모컨 추가 및 오디오 볼륨 연동)
// =========================================================================
function injectRemoteSettingUI() {
    const settingsCards = document.querySelectorAll('.settings-card');
    let targetCard = null;
    settingsCards.forEach(card => { 
        if(card.innerHTML.includes('학원 정보 및 디스플레이') || card.innerHTML.includes('ACADEMY INFO')) targetCard = card; 
    });

    if (targetCard && !document.getElementById('remoteSelectRow')) {
        const row = document.createElement('div'); 
        row.id = 'remoteSelectRow'; 
        row.className = 'settings-row';
        row.style.background = 'var(--bg-main)'; row.style.padding = '15px'; row.style.borderRadius = '16px'; row.style.border = '1px solid var(--border)'; row.style.marginBottom = '25px';
        
        let inputsHtml = `<span class="settings-label">📡 무선 리모컨 고유번호 설정 (1~10번 책상)</span><div style="display:grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 10px;">`;
        for(let i=0; i<10; i++) {
            inputsHtml += `<div><label style="font-size:12px; font-weight:bold; color:var(--text-muted);">${i+1}번 책상</label><input type="text" id="remoteCodeInput_${i}" class="settings-input" style="width:100%; padding:8px; text-align:center; font-size:14px; box-sizing:border-box;" placeholder="번호 입력" onchange="saveRemoteCodes()"></div>`;
        }
        inputsHtml += `</div>`;
        row.innerHTML = inputsHtml;
        targetCard.appendChild(row);
    }
}

window.saveRemoteCodes = function() {
    for(let i=0; i<10; i++) {
        let el = document.getElementById(`remoteCodeInput_${i}`);
        if(el && el.value) deskRemoteCodes[i] = el.value.trim();
    }
    saveToStorage();
    playUISound('click');
}

function injectHeaderDashboard() {
    const mainHeader = document.getElementById('mainHeader');
    if(mainHeader && !document.getElementById('header-dashboard')) {
        const dashboard = document.createElement('div');
        dashboard.id = 'header-dashboard'; dashboard.className = 'header-dashboard-box';
        let t = i18n[currentLang] || i18n.ko;
        dashboard.innerHTML = `
            <div class="hd-title" data-i18n="dashTitle">${t.dashTitle}</div>
            <div class="hd-items-container">
                <div class="hd-item hd-total"><span class="hd-label" data-i18n="dashTotal">${t.dashTotal}</span><span class="hd-count" id="hd-total">0</span></div>
                <div class="hd-item hd-wait"><span class="hd-label" data-i18n="dashWait">${t.dashWait}</span><span class="hd-count" id="hd-wait">0</span></div>
                <div class="hd-item hd-active"><span class="hd-label" data-i18n="dashActive">${t.dashActive}</span><span class="hd-count" id="hd-active">0</span></div>
                <div class="hd-item hd-finish"><span class="hd-label" data-i18n="dashFinish">${t.dashFinish}</span><span class="hd-count" id="hd-finish">0</span></div>
            </div>
        `;
        mainHeader.insertBefore(dashboard, mainHeader.firstChild);
    }
}

function updateRosterCounts() {
    const total = allNames.length; const finished = finishedSet.size; let active = 0;
    timers.forEach(t => { if(t.student !== "(empty)") active++; });
    const waiting = total - finished - active;
    if(document.getElementById('hd-total')) document.getElementById('hd-total').innerText = total;
    if(document.getElementById('hd-wait')) document.getElementById('hd-wait').innerText = waiting;
    if(document.getElementById('hd-active')) document.getElementById('hd-active').innerText = active;
    if(document.getElementById('hd-finish')) document.getElementById('hd-finish').innerText = finished;
}

function changeLanguage() { currentLang = document.getElementById("langSelect").value; saveToStorage(); applyLanguage(); const dashBox = document.getElementById('header-dashboard'); if(dashBox) { dashBox.remove(); injectHeaderDashboard(); updateRosterCounts(); } }
function applyLanguage() { const t = i18n[currentLang] || i18n.ko; document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = t[el.getAttribute("data-i18n")]; }); updateDateUI(); generateStudents(); for (let i = 0; i < DESK_COUNT; i++) updateBoxUI(i); }

window.switchView = function(view) {
    playUISound('tab');
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    
    if(document.getElementById(`view-${view}`)) document.getElementById(`view-${view}`).classList.add('active');
    const tabBtn = document.querySelector(`.nav-tab[onclick*='${view}']`);
    if(tabBtn) tabBtn.classList.add('active');
    
    if(view === 'settings') renderSettingsRoster(); 
    if(view === 'history') { closeHistoryDetail(); renderHistorySidebar(); } 
    if(view === 'game') { if(isRouletteMode) setupRoulette(); else setupLadder(); }
}

function injectFontSettingUI() {
    const settingsCards = document.querySelectorAll('.settings-card'); let acadCard = null;
    settingsCards.forEach(card => { if(card.innerHTML.includes('학원 정보 및 디스플레이') || card.innerHTML.includes('ACADEMY INFO')) acadCard = card; });
    if (acadCard && !document.getElementById('fontSelectRow')) {
        const row = document.createElement('div'); row.id = 'fontSelectRow'; row.className = 'settings-row';
        row.style.background = 'var(--bg-main)'; row.style.padding = '15px'; row.style.borderRadius = '16px'; row.style.border = '1px solid var(--border)'; row.style.marginBottom = '25px';
        row.innerHTML = `
            <span class="settings-label">🔤 시스템 글꼴 (폰트) 선택</span>
            <select id="fontSelect" class="settings-input" onchange="changeFontFamily(); playUISound('click');">
                <option value="'Pretendard', sans-serif">1. 프리텐다드 (세련/모던/기본)</option>
                <option value="'Noto Sans KR', sans-serif">2. 본고딕 (깔끔/정갈)</option>
                <option value="'Noto Serif KR', serif">3. 본명조 (고급/클래식)</option>
                <option value="'Gowun Dodum', sans-serif">4. 고운돋움 (단정/감성적)</option>
                <option value="'SUIT', sans-serif">5. SUIT (스포티/스타일리시)</option>
                <option value="'GmarketSans', sans-serif">6. 지마켓 산스 (힙/엣지)</option>
                <option value="'Hahmlet', serif">7. 함렛 (트렌디/레트로)</option>
                <option value="'Jua', sans-serif">8. 배민 주아체 (둥글/귀여운)</option>
                <option value="'Do Hyeon', sans-serif">9. 배민 도현체 (볼드/강렬한)</option>
                <option value="'Cafe24Ssurround', sans-serif">10. 카페24 써라운드 (발랄/개성)</option>
            </select>
        `;
        if (acadCard.children.length > 2) acadCard.insertBefore(row, acadCard.children[2]); else acadCard.appendChild(row);
    }
}

window.changeFontFamily = function() {
    const select = document.getElementById("fontSelect"); if(!select) return; currentFontFamily = select.value;
    document.documentElement.style.setProperty('--app-font', currentFontFamily); document.body.style.fontFamily = currentFontFamily;
    saveToStorage(); if(rosterViewMode === 'list') renderListView(); else generateStudents(); 
};

function injectListViewUI() {
    const rosterSection = document.getElementById('view-roster'); if(!rosterSection) return;
    if(!document.getElementById('roster-list-wrapper')) {
        const listWrapper = document.createElement('div'); listWrapper.id = 'roster-list-wrapper'; listWrapper.style.display = 'none';
        listWrapper.innerHTML = `
            <table class="roster-list-table">
                <thead>
                    <tr>
                        <th onclick="sortList('name')" class="sortable" id="th-name" style="width: 10%;">이름</th>
                        <th onclick="sortList('grade')" class="sortable" id="th-grade" style="width: 8%;">학년</th>
                        <th onclick="sortList('level')" class="sortable" id="th-level" style="width: 10%;">레벨</th>
                        <th onclick="sortList('seat')" class="sortable" id="th-seat" style="width: 20%;">자리 배정</th>
                        <th onclick="sortList('startTime')" class="sortable" id="th-startTime" style="width: 13%;">시작 시간</th>
                        <th onclick="sortList('time')" class="sortable" id="th-time" style="width: 12%;">타이머</th>
                        <th style="width: 27%;">관리</th>
                    </tr>
                </thead>
                <tbody id="rosterListBody"></tbody>
            </table>
        `;
        rosterSection.insertBefore(listWrapper, rosterSection.firstChild);
    }
    if(!document.getElementById('btnToggleViewRoster')) {
        const btn = document.createElement('button'); btn.id = 'btnToggleViewRoster'; btn.className = 'view-toggle-btn';
        btn.onclick = () => { toggleViewMode(rosterViewMode === 'card' ? 'list' : 'card'); }; rosterSection.appendChild(btn);
    }
    updateViewToggleButtonUI();
}

function updateViewToggleButtonUI() { const btn = document.getElementById('btnToggleViewRoster'); if(btn) btn.innerHTML = rosterViewMode === 'card' ? '🗂️ 리스트 뷰' : '🎴 아이콘 뷰'; }
window.toggleViewMode = function(mode) { playUISound('click'); rosterViewMode = mode; saveToStorage(); applyViewMode(); };

function applyViewMode() {
    const cardWrapper = document.querySelector('.roster-columns-wrapper'); const listWrapper = document.getElementById('roster-list-wrapper');
    if(!cardWrapper || !listWrapper) return;
    if (rosterViewMode === 'list') { cardWrapper.style.display = 'none'; listWrapper.style.display = 'block'; renderListView(); } 
    else { cardWrapper.style.display = 'grid'; listWrapper.style.display = 'none'; generateStudents(); }
    updateViewToggleButtonUI();
}

const gradeMap = {'초1':1, '초등학교1학년':1, '초등1':1, '초2':2, '초등학교2학년':2, '초등2':2, '초3':3, '초등학교3학년':3, '초등3':3, '초4':4, '초등학교4학년':4, '초등4':4, '초5':5, '초등학교5학년':5, '초등5':5, '초6':6, '초등학교6학년':6, '초등6':6, '중1':7, '중학교1학년':7, '중등1':7, '중2':8, '중학교2학년':8, '중등2':8, '중3':9, '중학교3학년':9, '중등3':9, '고1':10, '고등학교1학년':10, '고등1':10, '고2':11, '고등학교2학년':11, '고등2':11, '고3':12, '고등학교3학년':12, '고등3':12};
function getGradeWeight(g) { return gradeMap[g.replace(/\s+/g,'')] || 99; }
const levelMap = {'PRE':1, 'BASIC':2, 'INTER':3, 'ADV':4, 'PREP':5, 'GUEST':6};
function getLevelWeight(l) { return levelMap[l] || 99; }

window.sortList = function(col) {
    playUISound('click'); if (listSortConfig.col === col) { listSortConfig.asc = !listSortConfig.asc; } else { listSortConfig.col = col; listSortConfig.asc = true; }
    ['name', 'grade', 'level', 'seat', 'startTime', 'time'].forEach(c => { let th = document.getElementById(`th-${c}`); if(th) { th.classList.remove('sort-asc', 'sort-desc'); if(c === col) th.classList.add(listSortConfig.asc ? 'sort-asc' : 'sort-desc'); } }); renderListView();
}

function renderListView() {
    if(rosterViewMode !== 'list') return;
    const tbody = document.getElementById('rosterListBody'); if(!tbody) return;

    let studentsData = allNames.map(name => {
        const lvl = studentLevels[name] || ''; const grade = studentGrades[name] || '';
        const tIdx = timers.findIndex(t => t.student === name); const t = tIdx !== -1 ? timers[tIdx] : null;
        const isFinished = finishedSet.has(name);
        
        const studentInfo = studentMasterList.find(s => s.name === name);
        const isBday = studentInfo ? isTodayBirthday(studentInfo.birthday) : false;

        return { name, grade, level: lvl, tIdx, isFinished, timerData: t, isBday };
    });

    studentsData.sort((a, b) => { let res = 0; if (listSortConfig.col === 'name') res = a.name.localeCompare(b.name, 'ko-KR'); else if (listSortConfig.col === 'grade') res = getGradeWeight(a.grade) - getGradeWeight(b.grade); else if (listSortConfig.col === 'level') res = getLevelWeight(a.level) - getLevelWeight(b.level); else if (listSortConfig.col === 'seat') { let sA = a.tIdx === -1 ? 99 : a.tIdx; let sB = b.tIdx === -1 ? 99 : b.tIdx; res = sA - sB; } else if (listSortConfig.col === 'startTime') { let ta = (a.timerData && a.timerData.startTimeStr) ? a.timerData.startTimeStr : '99:99'; let tb = (b.timerData && b.timerData.startTimeStr) ? b.timerData.startTimeStr : '99:99'; res = ta.localeCompare(tb); } else if (listSortConfig.col === 'time') { let timeA = 999999, timeB = 999999; if(a.timerData) { timeA = a.timerData.isOver ? -a.timerData.overTime : a.timerData.remainingTime; } if(b.timerData) { timeB = b.timerData.isOver ? -b.timerData.overTime : b.timerData.remainingTime; } res = timeA - timeB; } if (res === 0) res = a.name.localeCompare(b.name, 'ko-KR'); return listSortConfig.asc ? res : -res; });

    let html = ''; const tLang = i18n[currentLang] || i18n.ko;

    studentsData.forEach(sd => {
        let levelLabel = (sd.level === 'PREP') ? 'PREP31' : (sd.level === 'ADV' ? 'ADV' : sd.level); 
        let rowClass = ''; let customMins = studentTimes[sd.name] || 50;
        let timerHtml = `<span style="font-size:32px; font-weight:900;">${String(customMins).padStart(2,'0')}:00</span>`; let startTimeHtml = '-';
        
        if (sd.isFinished) {
            rowClass = 'finished-row'; timerHtml = `<span style="font-size:20px; font-weight:900; color:var(--text-muted); background: rgba(0,0,0,0.05); padding: 6px 12px; border-radius: 8px;">🏁 수업 완료</span>`;
        } else if (sd.timerData) {
            if (sd.timerData.interval !== null || sd.timerData.isPaused) rowClass = 'row-playing';
            if (sd.timerData.startTimeStr) startTimeHtml = `<span class="editable-log-time" onclick="editActiveStartTime('${sd.name}')" style="cursor:pointer; color:var(--accent); font-weight:900; font-size:22px;">${sd.timerData.startTimeStr}</span>`;
            let clickAction = `onclick="goToTimer('${sd.name}')" class="clickable-timer" style="cursor:pointer;"`;
            if (sd.timerData.isOver) { timerHtml = `<span ${clickAction}><span style="color:var(--brand-danger); font-size:32px; font-weight:900; text-shadow:0 0 8px rgba(239,68,68,0.3);">+${formatTime(sd.timerData.overTime)}</span></span>`; } 
            else if (sd.timerData.interval || sd.timerData.isPaused) { let timeStr = formatTime(sd.timerData.remainingTime); if (sd.timerData.isPaused) timeStr = `⏸️ ${timeStr}`; timerHtml = `<span ${clickAction}><span style="color:var(--brand-success); font-size:32px; font-weight:900; text-shadow:0 0 8px rgba(16,185,129,0.3);">${timeStr}</span></span>`; } 
            else { timerHtml = `<span ${clickAction}><span style="font-size:32px; font-weight:900;">${String(customMins).padStart(2,'0')}:00</span></span>`; }
        }
        
        let seatOptions = `<option value="-1" ${sd.tIdx === -1 ? 'selected' : ''}>자리 미 배정</option>`;
        for(let i=0; i<DESK_COUNT; i++) {
            let t = timers[i]; let isMe = (t.student === sd.name); let selected = isMe ? 'selected' : '';
            let statusIcon = '🪑'; let statusText = ''; let styleOption = '';
            if (t.interval !== null || t.isPaused) { if (t.student === "(empty)") { statusIcon = '🚨'; statusText = ' (버튼 눌림!)'; styleOption = `style="background:#fee2e2; color:#ef4444; font-weight:bold;"`; } else { statusIcon = t.isPaused ? '⏸️' : '▶️'; statusText = isMe ? '' : ` (${t.student})`; } } else { if (t.student !== "(empty)") { statusIcon = '⏹️'; statusText = isMe ? '' : ` (${t.student})`; } }
            seatOptions += `<option value="${i}" ${selected} style="${styleOption}">${statusIcon} ${i+1}번 책상${statusText}</option>`;
        }

        let selectClass = sd.tIdx !== -1 ? 'list-seat-select assigned' : 'list-seat-select';
        let btns = '';
        if(!sd.isFinished) {
            if(sd.tIdx !== -1) { let t = sd.timerData; if(!t.interval && !t.isOver && !t.isPaused) btns += `<button class="list-action-btn l-btn-start" onclick="startTimer(${sd.tIdx})">${tLang.btnStart}</button>`; else if(t.isPaused) btns += `<button class="list-action-btn l-btn-start" onclick="resumeTimer(${sd.tIdx})">▶️ 재개</button>`; if(t.interval || t.isPaused) btns += `<button class="list-action-btn l-btn-stop" onclick="stopTimer(${sd.tIdx})">${tLang.btnStop}</button>`; btns += `<button class="list-action-btn l-btn-finish" onclick="finishSession(${sd.tIdx})">${tLang.btnFinish}</button>`; btns += `<button class="list-action-btn l-btn-cancel" onclick="cancelSession(${sd.tIdx})">${tLang.btnCancel}</button>`; } else { if (sd.level === 'GUEST') btns += `<button class="list-action-btn l-btn-cancel" onclick="removeGuest('${sd.name}')">✖ 삭제</button>`; }
        } else { btns += `<button class="list-action-btn l-btn-cancel" onclick="finishedSet.delete('${sd.name}'); applyViewMode();">🔄 대기열 복구</button>`; }

        let lvlColor = '#94a3b8'; if(sd.level==='PRE') lvlColor='var(--selena-yellow)'; else if(sd.level==='BASIC') lvlColor='var(--selena-pink)'; else if(sd.level==='INTER') lvlColor='var(--selena-orange)'; else if(sd.level==='ADV') lvlColor='var(--selena-cyan)'; else if(sd.level==='PREP') lvlColor='var(--selena-brown)';
        let lvlFontColor = sd.level==='PRE' ? '#000' : '#fff';

        let mods = studentModifiers[sd.name] || {coupon:0, penalty:0}; let listMods = '';
        if(mods.coupon > 0) listMods += `<span class="mod-badge coupon" onclick="removeModifier('${sd.name}', 'coupon', event)">🎟️x${mods.coupon}</span>`;
        if(mods.penalty > 0) listMods += `<span class="mod-badge penalty" onclick="removeModifier('${sd.name}', 'penalty', event)">🚨x${mods.penalty}</span>`;

        html += `
            <tr class="${rowClass}">
                <td style="font-weight:900; font-size:24px; text-align:center !important; color:var(--text-main); font-family: var(--app-font, 'Pretendard', sans-serif);">
                    ${sd.isBday ? '👑 ' : ''}${sd.name}
                    ${listMods ? `<div style="display:flex; justify-content:center; gap:4px; margin-top:6px;">${listMods}</div>` : ''}
                </td>
                <td style="color:var(--text-muted); font-weight:800; font-size:18px;"><span class="list-grade-badge">${sd.grade || '-'}</span></td>
                <td><span class="list-level-tag" style="background:${lvlColor}; color:${lvlFontColor};">${levelLabel}</span></td>
                <td><select class="${selectClass}" onchange="changeSeatFromList('${sd.name}', this.value)" ${sd.isFinished ? 'disabled' : ''}>${seatOptions}</select></td>
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

function updateCustomNames() { academyName = document.getElementById('inputAcademyName').value || "향촌삼성영어학원"; className = document.getElementById('inputClassName').value || "Maple Classroom"; document.getElementById('displayAcademyName').innerText = academyName; document.getElementById('displayClassName').innerText = className; saveToStorage(); }
function changeNameColor() { const val = document.getElementById("nameColorSelect").value; const root = document.documentElement; if (val === 'black') { root.style.setProperty('--custom-name-color', '#000000'); } else if (val === 'white') { root.style.setProperty('--custom-name-color', '#ffffff'); } else { root.style.setProperty('--custom-name-color', '#0f172a'); } saveToStorage(); }
function changeTheme() { currentTheme = document.getElementById("themeSelect").value; document.body.className = "theme-" + currentTheme; saveToStorage(); }

// ⭐ 오디오 볼륨 설정 시 미리듣기(Preview) 기능 연결
function updateVolumes() { 
    alarmVolume = document.getElementById('volAlarm').value / 100; 
    ttsVolume = document.getElementById('volTTS').value / 100; 
    uiVolume = document.getElementById('volUI').value / 100; 
    saveToStorage(); 
}

function changeDeskCount() { const newCount = parseInt(document.getElementById("deskCountSelect").value); if(newCount < timers.length) { for(let i=newCount; i<timers.length; i++) { if(timers[i].student !== "(empty)") { if(!confirm(`타이머 ${newCount+1}번 이상에 배치된 학생이 있습니다. 강제 취소됩니다.`)) { document.getElementById("deskCountSelect").value = DESK_COUNT; return; } break; } } for(let i=newCount; i<timers.length; i++) { stopTimer(i); if(timers[i].student !== "(empty)") { attendanceMap.delete(timers[i].student); updateStudentStatus(timers[i].student); } } timers.length = newCount; } else if(newCount > timers.length) { for(let i=timers.length; i<newCount; i++) { timers.push({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 }); } } DESK_COUNT = newCount; createInitialGrid(); generateStudents(); saveToStorage(); }

function saveToStorage() {
    try {
        const data = { 
            deskCount: DESK_COUNT, academyName: academyName, className: className, 
            studentMasterList: studentMasterList, studentModifiers: studentModifiers, 
            studentHistory: studentHistory, academyHolidays: academyHolidays, 
            attendance: Array.from(attendanceMap.entries()), finishedSet: Array.from(finishedSet), assignOrderCounter: assignOrderCounter, 
            timerStates: timers.map(t => ({ student: t.student, remainingTime: t.remainingTime, totalTime: t.totalTime, overTime: t.overTime, isOver: t.isOver, startTimeStr: t.startTimeStr, isRunning: t.interval !== null, isPaused: t.isPaused || false, lastTick: t.lastTick })), 
            vols: { a: alarmVolume, t: ttsVolume, u: uiVolume, ttsVoice: document.getElementById("ttsVoiceSelect")?.value || "1", melody: document.getElementById("melodyType")?.value || "0", uiType: document.getElementById("uiSoundType")?.value || "0" }, 
            theme: currentTheme, nameColor: document.getElementById("nameColorSelect")?.value || "default", language: currentLang, fontFamily: currentFontFamily, 
            customStudentOrder: customStudentOrder, guestList: guestList, rosterViewMode: rosterViewMode,
            deskRemoteCodes: deskRemoteCodes 
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); updateRosterCounts(); 
    } catch(e) {}
}

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved); 
            if(data.studentHistory) studentHistory = data.studentHistory;
            if(data.academyHolidays) academyHolidays = data.academyHolidays; 
            if(data.language) { currentLang = data.language; document.getElementById("langSelect").value = currentLang; }
            if(data.deskCount) { DESK_COUNT = data.deskCount; document.getElementById("deskCountSelect").value = DESK_COUNT; }
            if(data.rosterViewMode) { rosterViewMode = data.rosterViewMode; }
            if(data.studentModifiers) { studentModifiers = data.studentModifiers; } else { studentModifiers = {}; }
            if(data.fontFamily) { currentFontFamily = data.fontFamily; document.documentElement.style.setProperty('--app-font', currentFontFamily); document.body.style.fontFamily = currentFontFamily; const fontSelectEl = document.getElementById("fontSelect"); if (fontSelectEl) fontSelectEl.value = currentFontFamily; }

            customStudentOrder = data.customStudentOrder || []; guestList = data.guestList || [];
            academyName = data.academyName || "향촌삼성영어학원"; className = data.className || "Maple Classroom";
            document.getElementById('inputAcademyName').value = academyName; document.getElementById('inputClassName').value = className;
            document.getElementById('displayAcademyName').innerText = academyName; document.getElementById('displayClassName').innerText = className; 
            
            if(data.deskRemoteCodes) { deskRemoteCodes = data.deskRemoteCodes; }
            for(let i=0; i<10; i++) {
                let el = document.getElementById(`remoteCodeInput_${i}`);
                if(el && deskRemoteCodes[i]) el.value = deskRemoteCodes[i];
            }

            if (data.studentMasterList) { studentMasterList = data.studentMasterList; } 
            renderSettingsRoster(); 
            
            attendanceMap = new Map(data.attendance || []); finishedSet = new Set(data.finishedSet || []); assignOrderCounter = data.assignOrderCounter || 0; 
            
            timers = data.timerStates ? data.timerStates.map(ts => {
                let t = { ...ts, interval: null, isPaused: ts.isPaused || false, lastTick: ts.lastTick || 0 };
                if (ts.isRunning && t.lastTick > 0) { const now = Date.now(); const delta = Math.floor((now - t.lastTick) / 1000); if (delta > 0) { if (t.remainingTime >= delta) { t.remainingTime -= delta; } else { t.overTime += (delta - t.remainingTime); t.remainingTime = 0; } } t.lastTick = now - ((now - t.lastTick) % 1000); } return t;
            }) : Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 }));
            
            while (timers.length < DESK_COUNT) { timers.push({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 }); }
            if (timers.length > DESK_COUNT) { timers.length = DESK_COUNT; }

            if(data.vols) { alarmVolume = data.vols.a; ttsVolume = data.vols.t; uiVolume = data.vols.u !== undefined ? data.vols.u : 0.5; document.getElementById("volAlarm").value = data.vols.a * 100; document.getElementById("volTTS").value = data.vols.t * 100; document.getElementById("volUI").value = uiVolume * 100; }
            if(data.theme) { currentTheme = data.theme; document.getElementById("themeSelect").value = currentTheme; document.body.className = "theme-" + currentTheme; }
            
            applyLanguage(); createInitialGrid(); applyViewMode(); updateRosterCounts();
            if (data.timerStates) { data.timerStates.forEach((ts, idx) => { if (ts.isRunning) { resumeTimer(idx); } }); }
        } else {
            studentMasterList = []; studentModifiers = {}; renderSettingsRoster(); timers = Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 })); applyLanguage(); createInitialGrid(); applyViewMode(); updateRosterCounts();
        }
    } catch(e) {}
}

function exportData() { saveToStorage(); const data = localStorage.getItem(STORAGE_KEY); const blob = new Blob([data], {type: "application/json"}); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `Timer_Backup_PC_${new Date().toISOString().slice(0,10)}.json`; a.click(); }
function triggerImport() { document.getElementById("importFile").click(); }
function importData(e) { const t = i18n[currentLang] || i18n.ko; const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(evt) { try { const json = JSON.parse(evt.target.result); localStorage.setItem(STORAGE_KEY, JSON.stringify(json)); alert("복구 완료!"); location.reload(); } catch(err) { alert("유효하지 않은 백업입니다."); } finally { e.target.value = ''; } }; reader.readAsText(file); }

window.quickStart = function(name) { let tIdx = timers.findIndex(t => t.student === name); if (tIdx !== -1) startTimer(tIdx); };
window.quickFinish = function(name) { let tIdx = timers.findIndex(t => t.student === name); if (tIdx !== -1) finishSession(tIdx); };

function addGuest() { 
    const input = document.getElementById('guestNameInput'); const name = input.value.trim(); if (!name) return; 
    if (studentLevels[name] || guestList.includes(name)) { alert("이미 명단에 있습니다."); return; } 
    guestList.push(name); customStudentOrder.push(name); studentLevels[name] = 'GUEST'; studentTimes[name] = 50; input.value = ''; playUISound('click'); generateStudents(); 
}
window.removeGuest = function(name) { if(confirm(`게스트 삭제?`)) { guestList = guestList.filter(g => g !== name); customStudentOrder = customStudentOrder.filter(g => g !== name); if(finishedSet.has(name)) finishedSet.delete(name); playUISound('cancel'); generateStudents(); } };
window.cancelFromCard = function(name) { let tIdx = timers.findIndex(t => t.student === name); if (tIdx !== -1) cancelSession(tIdx); };

window.applyModifier = function(id, type) {
    playUISound('click'); let target = timers[id]; let name = target.student; if(name === "(empty)") return;
    if(!studentModifiers[name]) studentModifiers[name] = { coupon: 0, penalty: 0 };
    if(type === 'coupon') { studentModifiers[name].coupon++; target.remainingTime = Math.max(0, target.remainingTime - 300); if(target.remainingTime > 0) { target.isOver = false; target.overTime = 0; } } 
    else if(type === 'penalty') { studentModifiers[name].penalty++; target.remainingTime += 300; if(target.totalTime < target.remainingTime) target.totalTime = target.remainingTime; if(target.remainingTime > 0) { target.isOver = false; target.overTime = 0; } }
    updateBoxUI(id); updateStudentStatus(name); if (rosterViewMode === 'list') renderListView(); updateGauge(name, target.remainingTime, target.totalTime); saveToStorage();
};
window.removeModifier = function(name, type, event) {
    if(event) event.stopPropagation(); playUISound('cancel'); if(!studentModifiers[name] || studentModifiers[name][type] <= 0) return;
    studentModifiers[name][type]--; let tIdx = timers.findIndex(t => t.student === name);
    if(tIdx !== -1) { let target = timers[tIdx]; if(type === 'coupon') { target.remainingTime += 300; if(target.totalTime < target.remainingTime) target.totalTime = target.remainingTime; } else if(type === 'penalty') { target.remainingTime = Math.max(0, target.remainingTime - 300); } updateBoxUI(tIdx); updateGauge(name, target.remainingTime, target.totalTime); }
    updateStudentStatus(name); if (rosterViewMode === 'list') renderListView(); saveToStorage();
};

function initRosterSlots() {
    const gridActive = document.getElementById("grid-active"); if(!gridActive) return; gridActive.innerHTML = "";
    for(let i=0; i<DESK_COUNT; i++) { let slot = document.createElement("div"); slot.id = `roster-desk-${i}`; slot.className = "roster-desk-slot"; slot.ondragenter = (e) => { e.preventDefault(); slot.classList.add("drag-over"); }; slot.ondragover = (e) => { e.preventDefault(); slot.classList.add("drag-over"); }; slot.ondragleave = (e) => { slot.classList.remove("drag-over"); }; slot.ondrop = (e) => { e.preventDefault(); slot.classList.remove("drag-over"); handleDropOnTimer(draggedName, i, draggedFromIndex); }; gridActive.appendChild(slot); }
}
window.cancelEmptySlot = function(id, e) { if(e) e.stopPropagation(); playUISound('cancel'); resetTimerData(id, true); };
function updateRosterSlotUI(id) {
    if(rosterViewMode === 'list') return; const slot = document.getElementById(`roster-desk-${id}`); if(!slot) return;
    const t = timers[id]; const isAssigned = t.student !== "(empty)"; const isPlaying = t.interval !== null || t.isPaused;
    const existingPlaceholder = slot.querySelector('.roster-placeholder'); if(existingPlaceholder) existingPlaceholder.remove();
    if (!isAssigned) {
        let placeholder = document.createElement('div'); placeholder.className = 'roster-placeholder';
        if (isPlaying) { placeholder.style.cursor = "grab"; placeholder.draggable = true; placeholder.ondragstart = (e) => { draggedName = "(empty)"; draggedFromIndex = id; e.dataTransfer.effectAllowed = 'move'; playUISound('click'); }; placeholder.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; width:100%;"><div class="roster-waiting-text">✨ 매칭 대기중...</div><div class="css-desk" style="opacity: 0.8;"><div class="desk-top" style="background:#dbeafe; border-color:#93c5fd;"><span class="desk-num" style="color:#2563eb;">${id+1}</span></div><div class="desk-chair" style="background:#bfdbfe; border-color:#60a5fa;"></div></div><button onclick="cancelEmptySlot(${id}, event)" style="margin-top:12px; padding:6px 14px; border-radius:10px; background:var(--brand-danger); color:#fff; border:none; font-weight:900; font-size:13px; cursor:pointer;">✖ 대기 취소</button></div>`; } 
        else { placeholder.innerHTML = `<div class="css-desk"><div class="desk-top"><span class="desk-num">${id+1}</span></div><div class="desk-chair"></div></div><div class="roster-empty-text">빈자리</div>`; }
        slot.appendChild(placeholder);
    }
}

let allNames = []; 

function generateStudents() {
    studentLevels = {}; studentGrades = {}; studentTimes = {};
    const tLang = i18n[currentLang] || i18n.ko; let rawNames = [];

    studentMasterList.forEach(st => { studentLevels[st.name] = st.level; studentGrades[st.name] = st.grade; studentTimes[st.name] = st.time; rawNames.push(st.name); });
    guestList.forEach(n => { rawNames.push(n); studentTimes[n] = 50; });
    let newOrder = []; customStudentOrder.forEach(name => { if(rawNames.includes(name)) newOrder.push(name); }); rawNames.forEach(name => { if(!newOrder.includes(name)) newOrder.push(name); });
    customStudentOrder = newOrder; allNames = customStudentOrder;

    if (rosterViewMode === 'list') { renderListView(); } else {
        document.getElementById("grid-unassigned").innerHTML = ""; initRosterSlots(); document.getElementById("grid-finished").innerHTML = "";
        allNames.forEach((n, index) => {
            const lvl = studentLevels[n]; const grade = studentGrades[n];
            const btn = document.createElement("button"); btn.id = "btn-" + n; 
            let levelLabel = (lvl === 'PREP') ? 'PREP31' : (lvl === 'ADV' ? 'ADV' : lvl); if(lvl === 'GUEST') levelLabel = 'GUEST';
            
            const studentInfo = studentMasterList.find(s => s.name === n);
            const isBday = studentInfo ? isTodayBirthday(studentInfo.birthday) : false;
            let displayBday = isBday ? "👑 " : "";

            btn.innerHTML = `<div class="gauge-bg"></div><button class="card-cancel-btn" onclick="event.stopPropagation(); cancelFromCard('${n}')">✖</button><button class="guest-delete-btn" onclick="event.stopPropagation(); removeGuest('${n}')">✖</button><div class="alarm-alert-text">${tLang.statusTimeUp}</div><div class="card-badge-group"><div class="new-level-pill level-color-${lvl}">${levelLabel}</div>${grade ? `<div class="card-grade-badge">${grade}</div>` : ''}</div><div class="name-text">${displayBday}${n}</div><div class="quick-controls"><button class="quick-btn q-start" onclick="event.stopPropagation(); quickStart('${n}')">${tLang.quickStart}</button><button class="quick-btn q-finish" onclick="event.stopPropagation(); quickFinish('${n}')">${tLang.quickFinish}</button></div>`;
            btn.draggable = true; btn.style.order = index;
            btn.ondragstart = (e) => { draggedName = n; draggedNameForList = n; let tIdx = timers.findIndex(t => t.student === n); draggedFromIndex = tIdx !== -1 ? tIdx : null; e.dataTransfer.effectAllowed = 'move'; playUISound('click'); };
            btn.ondragenter = (e) => { e.preventDefault(); btn.classList.add("drag-over"); }; btn.ondragover = (e) => { e.preventDefault(); btn.classList.add("drag-over"); }; btn.ondragleave = (e) => { btn.classList.remove("drag-over"); };
            btn.ondrop = (e) => { e.preventDefault(); btn.classList.remove("drag-over"); if (draggedFromIndex !== null) return; if (draggedNameForList && draggedNameForList !== n) { let i1 = customStudentOrder.indexOf(draggedNameForList); let i2 = customStudentOrder.indexOf(n); if (i1 > -1 && i2 > -1) { let temp = customStudentOrder[i1]; customStudentOrder[i1] = customStudentOrder[i2]; customStudentOrder[i2] = temp; playUISound('click'); generateStudents(); } } };
            btn.onclick = () => { btn.classList.add("clicked"); setTimeout(() => btn.classList.remove("clicked"), 150); if (attendanceMap.has(n)) { goToTimer(n); } else { if (finishedSet.has(n)) finishedSet.delete(n); const emptyIdx = timers.findIndex(t => t.student === "(empty)"); if (emptyIdx !== -1) handleDropOnTimer(n, emptyIdx, null); } };
            document.getElementById("grid-unassigned").appendChild(btn); updateStudentStatus(n);
        });
    }
    timers.forEach((t, idx) => { if(t.student !== "(empty)") updateGauge(t.student, t.remainingTime, t.totalTime); updateBoxUI(idx); }); 
    updateRosterCounts(); saveToStorage();
}

function updateStudentStatus(name) {
    if(rosterViewMode === 'list') return; 
    const tLang = i18n[currentLang] || i18n.ko; const btn = document.getElementById("btn-" + name); if (!btn) return; const lvl = studentLevels[name] || '';
    btn.className = `student-btn level-${lvl}`; 
    let badge = btn.querySelector(".status-badge"); if (!badge) { badge = document.createElement("div"); badge.className = "status-badge"; btn.appendChild(badge); } badge.style.background = ""; badge.style.color = ""; badge.style.display = ""; 
    let timeBadge = btn.querySelector(".start-time-badge"); if (!timeBadge) { timeBadge = document.createElement("div"); timeBadge.className = "start-time-badge"; btn.appendChild(timeBadge); } timeBadge.style.display = "none"; 
    
    let modContainer = btn.querySelector('.card-mod-container'); if(!modContainer) { modContainer = document.createElement('div'); modContainer.className = 'card-mod-container'; btn.appendChild(modContainer); }
    let mods = studentModifiers[name] || {coupon:0, penalty:0}; let modHtml = '';
    if(mods.coupon > 0) modHtml += `<span class="mod-badge coupon" onclick="removeModifier('${name}', 'coupon', event)">🎟️ x${mods.coupon}</span>`;
    if(mods.penalty > 0) modHtml += `<span class="mod-badge penalty" onclick="removeModifier('${name}', 'penalty', event)">🚨 x${mods.penalty}</span>`;
    modContainer.innerHTML = modHtml;

    const gridUnassigned = document.getElementById("grid-unassigned"); const gridFinished = document.getElementById("grid-finished");
    if (finishedSet.has(name)) { 
        btn.classList.add("finished"); badge.style.display = "none"; gridFinished.appendChild(btn);
    } else {
        let tIdx = timers.findIndex(x => x.student === name);
        if (tIdx !== -1) {
            let t = timers[tIdx];
            if (t.isOver) { btn.classList.add("alarm-blink", "attended"); badge.innerHTML = tLang.statusTimeUp; badge.style.background = "var(--brand-danger)"; } 
            else if (t.interval || t.isPaused) { btn.classList.add("playing", "attended"); badge.style.display = "none"; if (t.isPaused) { badge.innerHTML = "⏸️ 정지"; badge.style.background = "var(--text-muted)"; badge.style.display = "block"; } if(t.startTimeStr) { timeBadge.innerHTML = `⏰ ${t.startTimeStr}`; timeBadge.style.display = "block"; timeBadge.onclick = (e) => { e.stopPropagation(); editActiveStartTime(name); }; } } 
            else { btn.classList.add("attended"); badge.innerHTML = tLang.statusAssign; badge.style.background = "var(--brand-success)"; }
            let slot = document.getElementById(`roster-desk-${tIdx}`); if(slot) slot.appendChild(btn);
        } else { badge.remove(); timeBadge.remove(); gridUnassigned.appendChild(btn); }
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
window.editActiveStartTime = function(name) { let tIdx = timers.findIndex(t => t.student === name); if(tIdx === -1) return; let t = timers[tIdx]; showTimePrompt(`[${name}] 시작 시간 수정`, t.startTimeStr, function(newTime) { t.startTimeStr = newTime; updateStudentStatus(name); saveToStorage(); }); };

function createInitialGrid() {
    const grid = document.getElementById("grid"); grid.innerHTML = "";
    for (let i = 0; i < DESK_COUNT; i++) { const box = document.createElement("div"); box.id = `box-${i}`; box.className = "timer-box"; box.ondragenter = (e) => { e.preventDefault(); box.classList.add("drag-over"); }; box.ondragover = (e) => { e.preventDefault(); box.classList.add("drag-over"); }; box.ondragleave = (e) => { box.classList.remove("drag-over"); }; box.ondrop = (e) => { e.preventDefault(); box.classList.remove("drag-over"); handleDropOnTimer(draggedName, i, draggedFromIndex); }; grid.appendChild(box); updateBoxUI(i); }
}

function updateBoxUI(id) {
    const tLang = i18n[currentLang] || i18n.ko; const t = timers[id]; const box = document.getElementById(`box-${id}`); if (!box) return;
    const isAssigned = t.student !== "(empty)"; const isPlaying = t.interval !== null || t.isPaused; const isRunningEmpty = !isAssigned && isPlaying; 
    box.className = `timer-box ${t.isOver ? 'done' : ''} ${isPlaying ? 'playing' : ''}`;
    const lvl = studentLevels[t.student] || ''; const panelClass = isAssigned && lvl ? `info-panel timer-bg-${lvl}` : 'info-panel';
    const panelStyle = (isAssigned || isRunningEmpty) ? "" : "background: transparent; border: 2px dashed var(--border); box-shadow: none !important;";
    const nameDisplay = isAssigned ? `<span style="font-family: var(--app-font, 'Pretendard', sans-serif);">${t.student}</span>` : (isRunningEmpty ? `<span style="font-size: 22px; color: var(--accent); font-weight:900; animation: blinker 1.5s linear infinite;">매칭 대기중...</span>` : '&nbsp;');
    const numDisplay = String(id+1).padStart(2, '0');

    let cancelWaitingBtn = ''; if (isRunningEmpty) { cancelWaitingBtn = `<div class="action-btn-row" style="margin-top: -15px; margin-bottom: 15px;"><button class="action-btn" style="background: var(--brand-danger); color: white; font-size: 14px; border:none; padding: 10px;" onclick="resetTimerData(${id}, true); playUISound('cancel');">✖ 대기 취소</button></div>`; }

    let mods = studentModifiers[t.student] || {coupon:0, penalty:0}; let boxModHtml = '';
    if (mods.coupon > 0) boxModHtml += `<span class="mod-badge coupon" onclick="removeModifier('${t.student}', 'coupon', event)">🎟️ x${mods.coupon}</span>`;
    if (mods.penalty > 0) boxModHtml += `<span class="mod-badge penalty" onclick="removeModifier('${t.student}', 'penalty', event)">🚨 x${mods.penalty}</span>`;
    let boxModContainer = boxModHtml ? `<div class="mod-badge-container">${boxModHtml}</div>` : '';

    let extraBtnRow = isAssigned ? `<div class="action-btn-row" style="margin-top:-5px; margin-bottom:8px; gap:8px;"><button class="action-btn" style="background:#f59e0b; color:white; padding:8px; border:none; font-size:13px;" onclick="applyModifier(${id}, 'coupon')">🎟️ 5분 일찍</button><button class="action-btn" style="background:#ef4444; color:white; padding:8px; border:none; font-size:13px;" onclick="applyModifier(${id}, 'penalty')">🚨 5분 추가</button></div>` : '';

    box.innerHTML = `<div class="desk-id" style="opacity: ${(isAssigned || isRunningEmpty) ? '1' : '0.4'}">${numDisplay}</div><div class="${panelClass}" draggable="${isAssigned || isRunningEmpty}" style="${panelStyle}"><div class="student-name-display" ${isAssigned ? `style="cursor:pointer;" onclick="playUISound('tab'); switchView('roster');"` : ''}>${nameDisplay}</div>${boxModContainer}<div class="time-display" id="display-${id}" style="visibility: ${(isAssigned || isRunningEmpty) ? 'visible' : 'hidden'}">${t.isOver ? '+'+formatTime(t.overTime) : formatTime(t.remainingTime)}</div></div>${cancelWaitingBtn}${extraBtnRow}<div class="time-controls"><button class="time-btn btn-3d-sm" onclick="adjustTime(${id}, 3000)">+50</button><button class="time-btn btn-3d-sm" onclick="adjustTime(${id}, 600)">+10</button><button class="time-btn btn-3d-sm" onclick="adjustTime(${id}, 300)">+05</button><button class="time-btn btn-3d-sm" onclick="adjustTime(${id}, 60)">+01</button><button class="time-btn btn-3d-sm minus" onclick="adjustTime(${id}, -600)">-10</button><button class="time-btn btn-3d-sm minus" onclick="adjustTime(${id}, -300)">-05</button><button class="time-btn btn-3d-sm minus" onclick="adjustTime(${id}, -60)">-01</button><button class="time-btn btn-3d-sm clear" onclick="clearTime(${id})">${tLang.btnClear}</button></div><div class="action-btn-row"><button class="action-btn btn-start" onclick="startTimer(${id})">${t.isPaused ? '▶️ 재개' : tLang.btnStart}</button></div><div class="action-btn-row"><button class="action-btn btn-stop" onclick="stopTimer(${id})">${tLang.btnStop}</button><button class="action-btn btn-cancel" onclick="cancelSession(${id})">${tLang.btnCancel}</button></div><div class="action-btn-row"><button class="action-btn btn-finish" onclick="finishSession(${id})">${tLang.btnFinish}</button></div>`;
    const infoPanel = box.querySelector('.info-panel'); infoPanel.ondragstart = (e) => { if(isAssigned || isRunningEmpty) { draggedName = isAssigned ? t.student : "(empty)"; draggedFromIndex = id; e.dataTransfer.effectAllowed = 'move'; } else { e.preventDefault(); } };
    if(rosterViewMode === 'card') updateRosterSlotUI(id); 
}

window.simulateHardwareButton = function(id) {
    playUISound('click'); const target = timers[id]; if (target.interval || target.isPaused) return;
    let customTime = 3000; 
    if (target.student !== "(empty)") {
        customTime = (studentTimes[target.student] || 50) * 60;
        let mods = studentModifiers[target.student];
        if(mods) { customTime -= (mods.coupon * 300); customTime += (mods.penalty * 300); if(customTime < 0) customTime = 0; }
    }
    target.remainingTime = customTime; target.totalTime = customTime; target.overTime = 0; target.isOver = false;
    playDeskStartTTS(id + 1); startTimer(id); if(rosterViewMode === 'list') renderListView();
};

function handleDropOnTimer(name, targetIdx, fromIdx) {
    if (fromIdx === targetIdx) return;
    if (name !== "(empty)") { let alreadyIdx = timers.findIndex(t => t.student === name); if (alreadyIdx !== -1 && alreadyIdx !== targetIdx && alreadyIdx !== fromIdx) { resetTimerData(alreadyIdx, false); } }

    if (fromIdx !== null) {
        let tFrom = timers[fromIdx]; let tTarget = timers[targetIdx];
        let fromRunning = tFrom.interval !== null; let targetRunning = tTarget.interval !== null;
        if (fromRunning) { clearInterval(tFrom.interval); tFrom.interval = null; } if (targetRunning) { clearInterval(tTarget.interval); tTarget.interval = null; }
        let tempFrom = { ...tFrom }; let tempTarget = { ...tTarget }; timers[targetIdx] = tempFrom; timers[fromIdx] = tempTarget;
        updateBoxUI(fromIdx); updateBoxUI(targetIdx); 
        if (timers[fromIdx].student !== "(empty)") updateStudentStatus(timers[fromIdx].student); 
        if (timers[targetIdx].student !== "(empty)") updateStudentStatus(timers[targetIdx].student); 
        playUISound('assign'); if (fromRunning) startTimer(targetIdx, true); if (targetRunning) startTimer(fromIdx, true);
    } else {
        const target = timers[targetIdx];
        let customTime = (studentTimes[name] || 50) * 60;
        let mods = studentModifiers[name]; if(mods) { customTime -= (mods.coupon * 300); customTime += (mods.penalty * 300); if(customTime < 0) customTime = 0; }
        if (target.interval || target.isPaused) {
            target.student = name; target.remainingTime = customTime; target.totalTime = customTime; target.overTime = 0; target.isOver = false;
            document.getElementById(`display-${targetIdx}`).innerText = formatTime(target.remainingTime);
            if (!attendanceMap.has(name)) { assignOrderCounter++; attendanceMap.set(name, assignOrderCounter); if(finishedSet.has(name)) finishedSet.delete(name); }
            playUISound('assign'); 
            updateBoxUI(targetIdx); updateStudentStatus(name); updateGauge(name, target.remainingTime, target.totalTime);
        } else {
            target.student = name; target.remainingTime = customTime; target.totalTime = customTime;
            if (!attendanceMap.has(name)) { assignOrderCounter++; attendanceMap.set(name, assignOrderCounter); if(finishedSet.has(name)) finishedSet.delete(name); }
            playUISound('assign'); updateBoxUI(targetIdx); updateStudentStatus(name); updateGauge(name, customTime, customTime);
        }
    }
    saveToStorage();
}

function startTimer(id, isResume = false) {
    const target = timers[id]; if (target.interval) return; target.isPaused = false; 
    if (!isResume) { initAudio(); playUISound('start'); const now = new Date(); const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`; target.startTimeStr = timeStr; }
    target.lastTick = Date.now();
    target.interval = setInterval(() => {
        const nowTick = Date.now(); const delta = Math.floor((nowTick - target.lastTick) / 1000);
        if (delta >= 1) {
            target.lastTick = nowTick - ((nowTick - target.lastTick) % 1000);
            if (target.remainingTime > 0) { target.remainingTime = Math.max(0, target.remainingTime - delta); if (target.student !== "(empty)") updateGauge(target.student, target.remainingTime, target.totalTime); document.getElementById(`display-${id}`).innerText = formatTime(target.remainingTime); updateListViewTime(target.student, target.remainingTime, false, 0); if (target.remainingTime === 0 && !target.isOver) triggerAlarm(id); } 
            else { if (!target.isOver) triggerAlarm(id); target.overTime += delta; document.getElementById(`display-${id}`).innerText = "+" + formatTime(target.overTime); updateListViewTime(target.student, 0, true, target.overTime); if (target.overTime >= 300) { finishSession(id); } }
            saveToStorage(); 
        }
    }, 250);
    if (target.student !== "(empty)") updateStudentStatus(target.student); if (rosterViewMode === 'list') renderListView(); updateBoxUI(id);
}

function resumeTimer(id) { startTimer(id, true); }
function stopTimer(id) { if (timers[id].interval) { clearInterval(timers[id].interval); timers[id].interval = null; timers[id].isPaused = true; playUISound('stop'); if (timers[id].student !== "(empty)") updateStudentStatus(timers[id].student); if (rosterViewMode === 'list') renderListView(); updateBoxUI(id); saveToStorage(); } }
function clearTime(id) { playUISound('cancel'); timers[id].remainingTime = 0; timers[id].totalTime = 0; timers[id].overTime = 0; timers[id].isOver = false; timers[id].isPaused = false; stopTimer(id); updateBoxUI(id); if(timers[id].student !== "(empty)") updateGauge(timers[id].student, 0, 1); if (rosterViewMode === 'list') renderListView(); saveToStorage(); }
function cancelSession(id) { playUISound('cancel'); const sn = timers[id].student; if(sn !== "(empty)") attendanceMap.delete(sn); resetTimerData(id, true); }

function finishSession(id) { 
    if(timers[id].student === "(empty)") { resetTimerData(id, true); return; } 
    playUISound('finish'); 
    
    const sn = timers[id].student; 
    const t = timers[id];
    const actualSeconds = t.totalTime - t.remainingTime + t.overTime;
    const actualMinutes = Math.floor(actualSeconds / 60);
    const mods = studentModifiers[sn] || { coupon: 0, penalty: 0 };
    
    const now = new Date();
    const dateKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    
    if(!studentHistory[sn]) studentHistory[sn] = {};
    if(!studentHistory[sn][dateKey]) {
        studentHistory[sn][dateKey] = { totalMinutes: 0, coupon: 0, penalty: 0, note: "" };
    }
    studentHistory[sn][dateKey].totalMinutes += actualMinutes;
    studentHistory[sn][dateKey].coupon += mods.coupon;
    studentHistory[sn][dateKey].penalty += mods.penalty;
    
    finishedSet.add(sn); 
    attendanceMap.delete(sn); 
    
    if(currentHistoryStudent === sn && document.getElementById('view-history').classList.contains('active')) {
        renderHistoryCalendar();
    }
    
    resetTimerData(id, true); 
}

function resetTimerData(id, resetUI) { if(timers[id].interval) { clearInterval(timers[id].interval); timers[id].interval = null; } const sn = timers[id].student; timers[id] = { student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 }; updateBoxUI(id); if (resetUI && sn !== "(empty)") updateStudentStatus(sn); if (rosterViewMode === 'list') renderListView(); saveToStorage(); }
function adjustTime(id, sec) { playUISound('click'); timers[id].remainingTime = Math.max(0, timers[id].remainingTime + sec); if(timers[id].remainingTime > timers[id].totalTime || timers[id].totalTime === 0) { timers[id].totalTime = timers[id].remainingTime; } if(timers[id].remainingTime > 0) { timers[id].isOver = false; timers[id].overTime = 0; if(timers[id].student !== "(empty)") updateStudentStatus(timers[id].student); } updateBoxUI(id); if (timers[id].student !== "(empty)") updateGauge(timers[id].student, timers[id].remainingTime, timers[id].totalTime); saveToStorage(); }
function updateGauge(studentName, remaining, total) { const btn = document.getElementById("btn-" + studentName); if (!btn) return; const gauge = btn.querySelector(".gauge-bg"); if (!gauge || total <= 0) return; gauge.style.width = (((total - remaining) / total) * 100) + "%"; }
function formatTime(t) { return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; }

// ==========================================
// ⭐ 4. 오디오 & 미리듣기 기능 완벽 복구
// ==========================================
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function triggerAlarm(id) { timers[id].isOver = true; if(timers[id].student !== "(empty)") updateStudentStatus(timers[id].student); updateBoxUI(id); let melodyType = parseInt(document.getElementById("melodyType")?.value || "0"); playMelody(melodyType); let ttsName = timers[id].student !== "(empty)" ? timers[id].student : `${id + 1}번 책상`; playAlarmTTS(ttsName); }

window.__tts_queue = []; let __is_tts_playing = false; 
if (window.speechSynthesis) { window.speechSynthesis.onvoiceschanged = function() { window.speechSynthesis.getVoices(); }; window.speechSynthesis.getVoices(); }
function processTTSQueue() { if (__is_tts_playing || window.__tts_queue.length === 0) return; __is_tts_playing = true; let task = window.__tts_queue.shift(); task().then(() => { __is_tts_playing = false; processTTSQueue(); }); }
function playDeskStartTTS(deskNum) { if (!window.speechSynthesis) return; let voices = window.speechSynthesis.getVoices(); let u = new SpeechSynthesisUtterance(); u.volume = ttsVolume; u.rate = 1.05; u.text = `Desk number ${deskNum} start`; u.lang = 'en-US'; let enVoice = voices.find(v => v.name.includes('Female') && v.lang.includes('en')) || voices.find(v => v.name.includes('Zira')) || voices.find(v => v.name.includes('Google') && v.lang.includes('en')); if (enVoice) u.voice = enVoice; window.speechSynthesis.speak(u); }

function playAlarmTTS(studentName) { return new Promise(resolve => { const voiceType = document.getElementById("ttsVoiceSelect")?.value || "1"; if (voiceType === "0" || !window.speechSynthesis) return resolve(); window.__tts_queue.push(() => new Promise(taskResolve => { let voices = window.speechSynthesis.getVoices(); if (voices.length === 0) { setTimeout(() => { resolve(); taskResolve(); }, 100); return; } window.speechSynthesis.cancel(); const getKoVoice = () => voices.find(v => v.name.includes('Google') && v.lang.includes('ko')) || voices.find(v => v.name.includes('Natural') && v.lang.includes('ko')) || voices.find(v => v.lang.includes('ko')); const getEnVoice = () => voices.find(v => v.name === 'Google US English') || voices.find(v => v.lang.includes('en-US')) || voices.find(v => v.lang.includes('en')); let u1, u2; let isFinished = false; let fallbackTimer = setTimeout(() => { finalize(); }, 5000); const finalize = () => { if(!isFinished) { isFinished = true; clearTimeout(fallbackTimer); resolve(); taskResolve(); } }; if (voiceType === "1") { u1 = new SpeechSynthesisUtterance(`${studentName}! ${studentName}!`); u1.volume = ttsVolume; u1.rate = 1.05; u1.pitch = 1.1; u1.lang = 'ko-KR'; let koVoice = getKoVoice(); if (koVoice) u1.voice = koVoice; u1.onend = finalize; u1.onerror = finalize; window.speechSynthesis.speak(u1); } else if (voiceType === "2" || voiceType === "3") { u1 = new SpeechSynthesisUtterance(`${studentName}!`); u1.volume = ttsVolume; u1.rate = 1.05; u1.pitch = 1.1; u1.lang = 'ko-KR'; let koVoice = getKoVoice(); if (koVoice) u1.voice = koVoice; let phrase = voiceType === "2" ? "Let's go home!" : "Time's up! It's time to go home!"; u2 = new SpeechSynthesisUtterance(phrase); u2.volume = ttsVolume; u2.rate = 1.05; u2.pitch = 1.1; u2.lang = 'en-US'; let enVoice = getEnVoice(); if (enVoice) u2.voice = enVoice; u2.onend = finalize; u2.onerror = finalize; window.speechSynthesis.speak(u1); window.speechSynthesis.speak(u2); } else { finalize(); } })); processTTSQueue(); }); }

function playMelody(type) { return new Promise(resolve => { initAudio(); const melodies = [ [523.25, 659.25, 783.99, 1046.50], [440, 554.37, 659.25, 880], [880, 880, 880, 880], [392, 329.63, 261.63], [261.63, 392, 523.25, 783.99], [1046.5, 0, 1046.5, 0, 1046.5] ]; let notes = melodies[type] || melodies[0]; let now = audioCtx.currentTime; let noteLength = 0.25; notes.forEach((freq, i) => { if (freq === 0) return; let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain(); osc.type = 'sine'; osc.frequency.value = freq; gain.gain.setValueAtTime(0, now + i*noteLength); gain.gain.linearRampToValueAtTime(alarmVolume, now + i*noteLength + 0.02); gain.gain.exponentialRampToValueAtTime(0.01, now + i*noteLength + noteLength); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now + i*noteLength); osc.stop(now + i*noteLength + noteLength); }); setTimeout(resolve, notes.length * noteLength * 1000 + 200); }); }

function playUISound(type) { if (!audioCtx) initAudio(); const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination); const now = audioCtx.currentTime; let v = uiVolume; if (v === 0) return; if (type === 'tab' || type === 'click') { let st = parseInt(document.getElementById('uiSoundType')?.value) || 0; if(st === 0) { osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.1); gain.gain.setValueAtTime(v * 0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); } } else if (type === 'assign') { osc.type = 'triangle'; osc.frequency.setValueAtTime(880, now); gain.gain.setValueAtTime(v * 0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15); osc.start(now); osc.stop(now + 0.15); } else if (type === 'start') { osc.type = 'square'; osc.frequency.setValueAtTime(440, now); osc.frequency.linearRampToValueAtTime(880, now + 0.1); gain.gain.setValueAtTime(v * 0.08, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); } else if (type === 'stop') { osc.type = 'square'; osc.frequency.setValueAtTime(880, now); osc.frequency.linearRampToValueAtTime(440, now + 0.1); gain.gain.setValueAtTime(v * 0.08, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); } else if (type === 'finish') { osc.type = 'sine'; osc.frequency.setValueAtTime(1046.5, now); gain.gain.setValueAtTime(v * 0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3); } else if (type === 'cancel') { osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(150, now + 0.2); gain.gain.setValueAtTime(v * 0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); osc.start(now); osc.stop(now + 0.2); } }

// ⭐ 미리듣기 함수 연결 부분
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
            let osc = audioCtx.createOscillator(); 
            let gain = audioCtx.createGain(); 
            osc.type = 'sine'; 
            osc.frequency.value = 880; 
            gain.gain.setValueAtTime(alarmVolume, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.connect(gain); 
            gain.connect(audioCtx.destination); 
            osc.start(audioCtx.currentTime); 
            osc.stop(audioCtx.currentTime + 0.1); 
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

function askSoftReset() { const t = i18n[currentLang] || i18n.ko; playUISound('click'); if(confirm(t.alertSoft)) { timers.forEach((t, i) => stopTimer(i)); timers = Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 })); attendanceMap.clear(); finishedSet.clear(); assignOrderCounter = 0; guestList = []; studentModifiers = {}; for(let i=0; i<DESK_COUNT; i++) updateBoxUI(i); generateStudents(); saveToStorage(); alert(t.alertResetDone); } }
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
        remoteTimer = setTimeout(() => { remoteBuffer = ""; }, 100);
        
        let deskIndex = deskRemoteCodes.indexOf(remoteBuffer);
        
        if (deskIndex !== -1) {
            e.preventDefault();
            if (deskIndex < DESK_COUNT && !timers[deskIndex].interval && !timers[deskIndex].isPaused) { 
                simulateHardwareButton(deskIndex); 
            }
            remoteBuffer = ""; 
            return;
        }
    } else if (e.key === 'Enter') { 
        if (remoteBuffer.length > 0) { e.preventDefault(); remoteBuffer = ""; } 
    }
});
