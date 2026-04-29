// ==========================================
// 1. APP STATE, I18N & VARIABLES
// ==========================================
const STORAGE_KEY = "samsung_timer_v36_ARCHITECTURE"; 
let DESK_COUNT = 10; 
let timers = [];
let audioCtx = null; 

let draggedName = null; 
let draggedFromIndex = null; 
let draggedNameForList = null; 

let attendanceMap = new Map(); 
let finishedSet = new Set(); 
let assignOrderCounter = 0; 
let studentLevels = {}; 
let studentGrades = {}; 
let customStudentOrder = []; 
let guestList = []; 

let logLeftItems = []; 
let logRightItems = []; 

let academyName = "향촌삼성영어학원"; 
let className = "Maple Classroom";

let alarmVolume = 0.5; 
let ttsVolume = 0.8; 
let uiVolume = 0.5; 
let currentTheme = "1";
let currentLang = 'ko'; 
let currentFontFamily = "'Pretendard', sans-serif"; // 폰트 기본값

let rosterViewMode = 'card'; 
let listSortConfig = { col: 'level', asc: true }; 

// 📌 미니게임 모드 상태
let isRouletteMode = false;
let rouletteAngle = 0;
let rouletteSpinning = false;
let roulettePlayers = [];

const i18n = {
    ko: {
        nav1: "학생 명단", nav2: "타이머", nav3: "출석/종료 기록", nav4: "설정", nav5: "미니 게임",
        logStart: "▶️ 시작 기록 (START)", logFinish: "🏁 종료 및 완료 (FINISH)", exportLog: "💾 수업 로그 내보내기 (.txt)",
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
        logStartWord: "시작", logFinishWord: "완료", logCancelWord: "취소",
        quickStart: "▶️ 시작", quickFinish: "🏁 종료",
        grpWait: "⏳ 반 학생들 (대기중)", grpActive: "▶️ 수업 중 (진행중)", grpFinish: "🏁 수업 완료 (종료됨)",
        noRecords: "기록 없음", langText: "🌐 Language / 언어",
        days: ['일', '월', '화', '수', '목', '금', '토'],
        alertSoft: "타이머 기록과 출결 로그만 초기화합니다.\n진행하시겠습니까?",
        alertHard: "⚠️ 경고 ⚠️\n모든 설정이 초기화됩니다.\n정말 공장 초기화하시겠습니까?",
        alertResetDone: "기록이 리셋되었습니다.", alertFactoryDone: "초기화 완료.", alertBackupDone: "복구 완료!", alertBackupFail: "백업 파일이 유효하지 않습니다.",
        dashTitle: "📋 현황판", dashTotal: "전체", dashWait: "대기", dashActive: "수업 중", dashFinish: "종료"
    },
    en: {
        nav1: "STUDENTS", nav2: "TIMER", nav3: "LOG", nav4: "SETTING", nav5: "MINI GAME",
        logStart: "▶️ START LOG", logFinish: "🏁 FINISH LOG", exportLog: "💾 EXPORT LESSON LOG (.txt)",
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
        logStartWord: "Started", logFinishWord: "Finished", logCancelWord: "Canceled",
        quickStart: "▶️ START", quickFinish: "🏁 FINISH",
        grpWait: "⏳ Students List", grpActive: "▶️ In Class", grpFinish: "🏁 FINISHED",
        noRecords: "No Records", langText: "🌐 Language / 언어",
        days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        alertSoft: "This will reset timers and logs only.\nProceed?",
        alertHard: "⚠️ WARNING ⚠️\nAll settings will be reset.\nAre you sure?",
        alertResetDone: "Reset completed.", alertFactoryDone: "Factory reset complete.", alertBackupDone: "Restore completed!", alertBackupFail: "Invalid backup file.",
        dashTitle: "📋 Dashboard", dashTotal: "Total", dashWait: "Wait", dashActive: "Active", dashFinish: "Done"
    }
};

// ==========================================
// ⭐ 디자인 요소 (CSS 동적 주입) & 웹 폰트 임포트
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

    /* 상단 스마트 현황판 좌측 정렬 */
    #mainHeader { position: relative; }
    .header-dashboard-box {
        position: absolute; left: 20px; top: 50%; transform: translateY(-50%);
        display: flex; align-items: center; gap: 12px;
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid var(--border, #e2e8f0);
        padding: 6px 16px; border-radius: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        backdrop-filter: blur(8px);
        z-index: 100;
        font-family: 'Pretendard', sans-serif;
    }
    .hd-title { font-size: 15px; font-weight: 900; color: var(--accent); white-space: nowrap; padding-right: 10px; border-right: 2px solid var(--border); }
    .hd-items-container { display: flex; gap: 8px; }
    .hd-item {
        display: flex; align-items: baseline; gap: 6px;
        background: #ffffff; border-radius: 8px; padding: 4px 10px;
        min-width: 50px; justify-content: center;
    }
    .hd-label { font-size: 12px; font-weight: 800; opacity: 0.7; color: var(--text-main, #334155); }
    .hd-count { font-size: 18px; font-weight: 900; color: var(--text-main, #0f172a); letter-spacing: -0.5px; }
    
    .hd-item.hd-wait { background: #fffbeb; } .hd-item.hd-wait .hd-count { color: #d97706; }
    .hd-item.hd-active { background: #eff6ff; } .hd-item.hd-active .hd-count { color: #2563eb; }
    .hd-item.hd-finish { background: #f0fdf4; } .hd-item.hd-finish .hd-count { color: #16a34a; }

    /* 시간 뱃지 */
    .start-time-badge {
        position: absolute; top: 6px; right: 6px; background: #2563eb; border: 2px solid #60a5fa;
        color: white; font-size: 14px; font-weight: 900; padding: 6px 10px; border-radius: 8px; 
        cursor: pointer; z-index: 10; box-shadow: 0 4px 8px rgba(0,0,0,0.4); transition: background 0.2s, transform 0.1s;
    }
    .start-time-badge:hover { background: #1d4ed8; transform: scale(1.05); }
    .editable-log-time:hover { color: var(--accent); font-weight: bold; text-decoration: underline; }

    /* 대기열 박스 크기 */
    #grid-unassigned { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important; gap: 14px; align-content: start; }
    #grid-unassigned .student-btn { height: 110px !important; padding: 12px; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
    
    /* ⭐ 2번 요청: 워터마크 농도 진하게 상향 */
    .level-watermark {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        font-size: 65px;
        font-weight: 900;
        color: var(--text-main);
        opacity: 0.12; /* 0.05 -> 0.12 로 진하게 상향 */
        z-index: 0;
        pointer-events: none;
        white-space: nowrap;
        user-select: none;
        font-family: 'JetBrains Mono', 'Pretendard', sans-serif;
    }
    #grid-active .student-btn .level-watermark { font-size: 95px; opacity: 0.10; } /* 0.03 -> 0.10 */
    #grid-finished .student-btn .level-watermark { font-size: 65px; opacity: 0.08; } /* 0.02 -> 0.08 */

    /* ⭐ 3번 요청: 이름이 묻히지 않게 화이트 아웃라인(테두리)과 글로우 효과 추가 */
    .name-text { 
        display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; 
        font-family: var(--app-font, 'Pretendard', sans-serif) !important; 
        font-weight: 900; width: 100%;
        letter-spacing: -0.5px;
        margin-top: 10px; 
        z-index: 2; position: relative;
        color: var(--custom-name-color, #0f172a) !important;
        /* 이름이 진한 워터마크 위에서 또렷이 보이도록 강력한 하얀색 테두리와 그림자 */
        text-shadow: 
            -1px -1px 0 rgba(255,255,255,0.8), 
             1px -1px 0 rgba(255,255,255,0.8), 
            -1px  1px 0 rgba(255,255,255,0.8), 
             1px  1px 0 rgba(255,255,255,0.8), 
             0 3px 6px rgba(0,0,0,0.2) !important;
    }
    #grid-unassigned .student-btn .name-text { font-size: 38px !important; margin-bottom: 2px; }
    #grid-active .student-btn .name-text { font-size: 48px !important; margin-top: 10px; margin-bottom: 20px; }
    #grid-finished .student-btn.finished .name-text { font-size: 38px !important; color: var(--text-muted) !important; opacity: 1 !important; margin-top: 0; }

    /* 학년 뱃지 */
    .card-grade-badge {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 13px !important;
        font-weight: 800;
        color: var(--text-muted);
        background: rgba(255,255,255,0.7);
        padding: 3px 10px;
        border-radius: 12px;
        z-index: 2;
        font-family: 'Pretendard', sans-serif !important;
        letter-spacing: 0.5px;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    #grid-active .student-btn .card-grade-badge {
        top: 14px;
        font-size: 15px !important;
        background: rgba(255, 255, 255, 0.9);
        color: #2563eb;
    }
    #grid-finished .student-btn.finished .card-grade-badge { opacity: 0.5 !important; }

    /* 수업 중 창 아이콘 */
    #grid-active .student-btn { width: 100% !important; height: 100% !important; margin: 0 !important; border-radius: 22px; position: absolute; top:0; left:0; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }

    /* 아이콘 모드 수업 중 네온사인 */
    @keyframes active-card-neon {
        0% { box-shadow: 0 0 10px #3b82f6, inset 0 0 10px #3b82f6; border-color: #3b82f6; transform: scale(1); }
        50% { box-shadow: 0 0 30px #2563eb, inset 0 0 20px #2563eb; border-color: #2563eb; transform: scale(1.02); }
        100% { box-shadow: 0 0 10px #3b82f6, inset 0 0 10px #3b82f6; border-color: #3b82f6; transform: scale(1); }
    }
    #grid-active .student-btn.playing {
        border: 4px solid #3b82f6 !important;
        animation: active-card-neon 1.5s infinite ease-in-out !important;
        background: linear-gradient(145deg, #ffffff, #eff6ff) !important;
        z-index: 5;
    }

    /* 아이콘 모드 수업 종료 박스 */
    #grid-finished .student-btn.finished {
        opacity: 0.6 !important; filter: grayscale(100%) !important; background: var(--bg-main) !important;
        border: 2px dashed var(--border) !important; box-shadow: inset 0 0 10px rgba(0,0,0,0.05) !important;
        display: flex !important; flex-direction: column !important; justify-content: center !important; overflow: hidden;
    }
    #grid-finished .student-btn.finished .status-badge { display: none !important; }

    /* 시간 수정 모달 UI */
    #custom-time-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.2s ease-in-out; }
    #custom-time-modal-overlay.show { opacity: 1; pointer-events: auto; }
    .custom-time-modal { background: var(--bg-card, #ffffff); padding: 35px; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.4); text-align: center; width: 360px; transform: translateY(20px) scale(0.95); transition: all 0.2s ease-out; border: 1px solid var(--border, #ccc); }
    #custom-time-modal-overlay.show .custom-time-modal { transform: translateY(0) scale(1); }
    .custom-time-modal h3 { margin: 0 0 20px 0; color: var(--text-main, #333); font-size: 20px; font-weight: 900; }
    .custom-time-modal input[type="time"] { font-size: 42px; padding: 15px; border: 3px solid var(--accent, #2563eb); border-radius: 12px; width: 100%; text-align: center; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; font-weight: bold; background: var(--bg-card); color: var(--text-main); outline: none; box-sizing: border-box; }
    .custom-time-modal input[type="time"]::-webkit-calendar-picker-indicator { display: none; }
    .quick-time-btns { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 25px; }
    .quick-time-btns button { flex: 1; padding: 12px 0; border-radius: 8px; border: none; background: var(--btn-bg); color: var(--text-main); font-weight: 900; font-size: 15px; cursor: pointer; transition: 0.2s; box-shadow: var(--shadow-btn); }
    .quick-time-btns button:active { transform: scale(0.95); box-shadow: var(--shadow-inner); }
    .custom-time-modal .modal-btns { display: flex; gap: 10px; }
    .custom-time-modal .modal-btns button { flex: 1; padding: 14px; border: none; border-radius: 10px; font-weight: bold; font-size: 16px; cursor: pointer; transition: filter 0.2s; }
    .btn-modal-cancel { background: var(--border, #ddd); color: var(--text-main, #333); }
    .btn-modal-save { background: var(--accent, #2563eb); color: #fff; }
    .btn-modal-cancel:hover, .btn-modal-save:hover { filter: brightness(1.1); }

    /* ⭐ 1번 요청: 모드 변환 버튼 안전한 우측 영역 복구 */
    #view-roster { position: relative; padding-top: 55px; }
    .view-toggle-btn { position: absolute; right: 20px; top: 10px; z-index: 50; background: var(--bg-card); color: var(--accent); font-weight: 900; font-family: 'Pretendard'; padding: 10px 16px; border-radius: 10px; border: 2px solid var(--accent); box-shadow: var(--shadow-btn); cursor: pointer; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); font-size: 14px; }
    .view-toggle-btn:hover { background: var(--accent); color: #fff; transform: translateY(-2px); box-shadow: 0 6px 12px rgba(37, 99, 235, 0.2); }

    /* 리스트 뷰 테이블 */
    #roster-list-wrapper { width: 100%; animation: fadeIn 0.3s ease; padding: 10px 0; overflow-x: auto;}
    .roster-list-table { 
        width: 100%; 
        border-collapse: separate; 
        border-spacing: 0 12px; 
        min-width: 1100px;
    }
    
    .roster-list-table th { position: relative; text-align: center; padding: 10px 10px 16px 10px; color: var(--text-muted); font-size: 16px; font-weight: 900; border-bottom: 2px solid var(--border); transition: color 0.2s; user-select: none; }
    .roster-list-table th.sortable:hover { color: var(--accent); cursor: pointer; }
    .roster-list-table th.sort-asc::after { content: " ▲"; font-size: 11px; color: var(--accent); }
    .roster-list-table th.sort-desc::after { content: " ▼"; font-size: 11px; color: var(--accent); }
    
    .col-resizer {
        position: absolute; right: -4px; top: 0; width: 8px; height: 100%; 
        cursor: col-resize; user-select: none; background: transparent; z-index: 10;
        transition: background 0.2s;
    }
    .col-resizer:hover, .col-resizer.resizing { background: var(--accent); opacity: 0.8; }

    .roster-list-table td { font-family: var(--app-font, 'Pretendard', sans-serif); padding: 18px 10px; background: var(--bg-card); box-shadow: 0 4px 10px rgba(0,0,0,0.04); vertical-align: middle; text-align: center; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .roster-list-table td:first-child { border-left: 1px solid var(--border); border-radius: 14px 0 0 14px; text-align: center !important; vertical-align: middle; }
    .roster-list-table td:last-child { border-right: 1px solid var(--border); border-radius: 0 14px 14px 0; }
    
    .roster-list-table tr { transition: transform 0.2s, filter 0.3s, opacity 0.3s; }
    .roster-list-table tr:hover { transform: scale(1.02); z-index: 10; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
    
    .roster-list-table tr.row-playing td { box-shadow: 0 0 10px rgba(59, 130, 246, 0.4), inset 0 0 8px rgba(59, 130, 246, 0.1); border-top: 1px solid #3b82f6; border-bottom: 1px solid #3b82f6; animation: row-neon-pulse 1.5s infinite alternate; }
    @keyframes row-neon-pulse { 0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); border-color: rgba(59, 130, 246, 0.5); } 100% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.8), inset 0 0 10px rgba(59, 130, 246, 0.3); border-color: rgba(59, 130, 246, 1); } }

    .roster-list-table tr.finished-row td { opacity: 0.8; background: #f8fafc; box-shadow: inset 0 0 10px rgba(0,0,0,0.02); animation: none; border-color: #cbd5e1; }
    
    /* 리스트 뷰 내부 버튼 및 드롭다운 */
    .list-seat-select { padding: 12px 14px; border-radius: 10px; border: 2px solid var(--border); background: var(--bg-main); color: var(--text-main); font-weight: 800; font-size: 16px; font-family: 'Pretendard'; outline: none; cursor: pointer; transition: 0.2s; width: 100%; max-width: 250px; text-align: left; }
    .list-seat-select:focus { border-color: var(--accent); }
    .list-seat-select.assigned { border-color: var(--accent); background: rgba(59, 130, 246, 0.08); color: var(--accent); }
    .list-seat-select option { font-size: 16px; padding: 10px; }

    .list-btn-group { display: flex; gap: 8px; justify-content: center; }
    .list-action-btn { padding: 12px 16px; border: none; border-radius: 10px; font-weight: 900; font-size: 14px; cursor: pointer; color: white; font-family: 'Pretendard'; transition: 0.2s; box-shadow: var(--shadow-btn); }
    .list-action-btn:active { transform: scale(0.95); }
    .l-btn-start { background: var(--brand-success); }
    .l-btn-stop { background: var(--text-muted); }
    .l-btn-finish { background: var(--accent); }
    .l-btn-cancel { background: var(--brand-danger); }
    .list-level-tag { font-size: 15px; padding: 8px 14px; border-radius: 8px; font-weight: 900; display: inline-block; width: 90px; text-align: center; }

    /* 대기중 슬롯 책상 디자인 */
    .roster-desk-slot { height: 165px; border: 3px dashed var(--border); border-radius: 22px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.015); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-shadow: inset 2px 2px 5px rgba(0,0,0,0.03); overflow: hidden; }
    .roster-desk-slot.drag-over { background: rgba(59, 130, 246, 0.08); border-color: var(--accent); transform: scale(1.03); z-index: 10; }
    .roster-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;}
    
    .css-desk { display: flex; flex-direction: column; align-items: center; justify-content: center; transition: 0.2s; }
    .desk-top { width: 90px; height: 50px; background: #e2e8f0; border-radius: 10px; border-bottom: 5px solid #cbd5e1; display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; box-shadow: inset 0 2px 4px rgba(255,255,255,0.7), 0 4px 6px rgba(0,0,0,0.05); transition: 0.2s; }
    .desk-num { font-size: 22px; font-weight: 900; color: #94a3b8; font-family: 'JetBrains Mono', monospace; transition: 0.2s; }
    .desk-chair { width: 40px; height: 20px; background: #cbd5e1; border-radius: 8px 8px 15px 15px; margin-top: -8px; z-index: 1; border-bottom: 3px solid #94a3b8; transition: 0.2s; }
    
    .roster-desk-slot.drag-over .desk-top { background: #dbeafe; border-color: #93c5fd; transform: scale(1.05); }
    .roster-desk-slot.drag-over .desk-chair { background: #bfdbfe; border-color: #60a5fa; transform: scale(1.05); }
    .roster-desk-slot.drag-over .desk-num { color: #2563eb; }

    .roster-empty-text { color: var(--text-muted); font-weight: 700; font-size: 16px; text-align: center; line-height: 1.5; opacity: 0.5; pointer-events: none; margin-top: 10px; font-family: 'Pretendard'; }
    .roster-waiting-text { color: var(--accent); font-weight: 900; font-size: 18px; text-align: center; animation: blinker 1.5s linear infinite; line-height: 1.5; text-shadow: 0 0 8px rgba(59,130,246,0.3); pointer-events: none; margin-bottom: 8px; font-family: 'Pretendard'; }
    
    .clickable-timer { display: inline-block; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .clickable-timer:hover { transform: scale(1.1); filter: brightness(1.2); }
`;
document.head.appendChild(customStyle);

window.onload = () => { 
    injectHeaderDashboard(); 
    injectListViewUI(); 
    injectFontSettingUI(); 
    loadData(); 
    updateDateUI(); 
}; 

// 매 1분마다 시간 업데이트 및 수업 종료 시간 동기화
setInterval(() => {
    updateDateUI();
    if(rosterViewMode === 'list') {
        renderListView();
    } else {
        finishedSet.forEach(name => {
            updateStudentStatus(name);
        });
    }
}, 60000); 

function updateDateUI() {
    const now = new Date(); const t = i18n[currentLang] || i18n.ko;
    const str = `${now.getFullYear()}. ${String(now.getMonth()+1).padStart(2,'0')}. ${String(now.getDate()).padStart(2,'0')} (${t.days[now.getDay()]})`;
    const el = document.getElementById('displayDate'); if(el) el.innerText = str;
}

// 상단 스마트 현황판 (좌측 고정 박스화)
function injectHeaderDashboard() {
    const mainHeader = document.getElementById('mainHeader');
    if(mainHeader && !document.getElementById('header-dashboard')) {
        const dashboard = document.createElement('div');
        dashboard.id = 'header-dashboard';
        dashboard.className = 'header-dashboard-box';
        
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
    const total = allNames.length;
    const finished = finishedSet.size;
    let active = 0;
    timers.forEach(t => {
        if(t.student !== "(empty)") active++;
    });
    const waiting = total - finished - active;

    const elTotal = document.getElementById('hd-total');
    const elWait = document.getElementById('hd-wait');
    const elActive = document.getElementById('hd-active');
    const elFinish = document.getElementById('hd-finish');

    if(elTotal) elTotal.innerText = total;
    if(elWait) elWait.innerText = waiting;
    if(elActive) elActive.innerText = active;
    if(elFinish) elFinish.innerText = finished;
}

function changeLanguage() { 
    currentLang = document.getElementById("langSelect").value; 
    saveToStorage(); 
    applyLanguage(); 
}

function applyLanguage() {
    const t = i18n[currentLang] || i18n.ko;
    document.querySelectorAll("[data-i18n]").forEach(el => { el.innerText = t[el.getAttribute("data-i18n")]; });
    document.querySelectorAll(".editable-roster").forEach(el => { el.setAttribute("data-placeholder", t.placeholder); });
    updateDateUI(); generateStudents(); 
    for (let i = 0; i < DESK_COUNT; i++) updateBoxUI(i);
    renderLogs(); 
}

function switchView(view) {
    playUISound('tab');
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    document.querySelector(`.nav-tab[onclick*='${view}']`).classList.add('active');
    
    if(view === 'game') { 
        if(isRouletteMode) {
            setupRoulette();
        } else {
            setupLadder();
        }
    }
}

window.switchGameMode = function(mode) {
    playUISound('tab');
    document.getElementById('gameResult').innerHTML = "";
    if (mode === 'ladder') {
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

// =========================================================================
// ⭐ 설정창 폰트(글꼴) 선택 UI (10종)
// =========================================================================
function injectFontSettingUI() {
    const settingsCards = document.querySelectorAll('.settings-card');
    let acadCard = null;
    settingsCards.forEach(card => {
        if(card.innerHTML.includes('학원 정보 및 디스플레이') || card.innerHTML.includes('ACADEMY INFO')) {
            acadCard = card;
        }
    });
    
    if (acadCard && !document.getElementById('fontSelectRow')) {
        const row = document.createElement('div');
        row.id = 'fontSelectRow';
        row.className = 'settings-row';
        row.style.background = 'var(--bg-main)';
        row.style.padding = '15px';
        row.style.borderRadius = '16px';
        row.style.border = '1px solid var(--border)';
        row.style.marginBottom = '25px';
        
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
        
        if (acadCard.children.length > 2) {
            acadCard.insertBefore(row, acadCard.children[2]);
        } else {
            acadCard.appendChild(row);
        }
    }
}

window.changeFontFamily = function() {
    const select = document.getElementById("fontSelect");
    if(!select) return;
    currentFontFamily = select.value;
    document.documentElement.style.setProperty('--app-font', currentFontFamily);
    document.body.style.fontFamily = currentFontFamily;
    saveToStorage();
    if(rosterViewMode === 'list') renderListView();
    else generateStudents(); 
};

// =========================================================================
// ⭐ 리스트 뷰 및 안전한 엑셀 컬럼 리사이징
// =========================================================================
function injectListViewUI() {
    const rosterSection = document.getElementById('view-roster');
    if(!rosterSection) return;

    if(!document.getElementById('roster-list-wrapper')) {
        const listWrapper = document.createElement('div');
        listWrapper.id = 'roster-list-wrapper';
        listWrapper.style.display = 'none';
        
        listWrapper.innerHTML = `
            <table class="roster-list-table">
                <thead>
                    <tr>
                        <th onclick="sortList('name')" class="sortable" id="th-name" style="width: 15%;">이름</th>
                        <th onclick="sortList('grade')" class="sortable" id="th-grade" style="width: 10%;">학년</th>
                        <th onclick="sortList('level')" class="sortable" id="th-level" style="width: 12%;">레벨</th>
                        <th onclick="sortList('seat')" class="sortable" id="th-seat" style="width: 25%;">자리 배정</th>
                        <th onclick="sortList('startTime')" class="sortable" id="th-startTime" style="width: 13%;">시작 시간</th>
                        <th onclick="sortList('time')" class="sortable" id="th-time" style="width: 12%;">타이머</th>
                        <th style="width: 13%;">관리</th>
                    </tr>
                </thead>
                <tbody id="rosterListBody"></tbody>
            </table>
        `;
        rosterSection.insertBefore(listWrapper, rosterSection.firstChild);
    }

    if(!document.getElementById('btnToggleViewRoster')) {
        const btn = document.createElement('button');
        btn.id = 'btnToggleViewRoster';
        btn.className = 'view-toggle-btn';
        btn.onclick = () => { toggleViewMode(rosterViewMode === 'card' ? 'list' : 'card'); };
        
        rosterSection.appendChild(btn);
    }
    updateViewToggleButtonUI();
}

function makeColumnsResizable() {
    const table = document.querySelector('.roster-list-table');
    if(!table) return;
    
    const thElms = table.querySelectorAll('th');
    thElms.forEach((th, idx) => {
        if (idx === thElms.length - 1) return; 

        if (th.querySelector('.col-resizer')) return; 
        
        const resizer = document.createElement('div');
        resizer.className = 'col-resizer';
        th.appendChild(resizer);
        
        let startX, startWidth;
        resizer.addEventListener('mousedown', function(e) {
            startX = e.pageX;
            startWidth = th.offsetWidth;
            resizer.classList.add('resizing');
            
            thElms.forEach(header => {
                if (!header.style.width || header.style.width.includes('%')) {
                    header.style.width = header.offsetWidth + 'px';
                }
            });

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.stopPropagation();
            e.preventDefault();
        });
        
        function onMouseMove(e) {
            const newWidth = Math.max(50, startWidth + (e.pageX - startX));
            th.style.width = newWidth + 'px';
        }
        
        function onMouseUp() {
            resizer.classList.remove('resizing');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    });
}

function updateViewToggleButtonUI() {
    const btn = document.getElementById('btnToggleViewRoster');
    if(btn) {
        btn.innerHTML = rosterViewMode === 'card' ? '🗂️ 리스트 뷰' : '🎴 아이콘 뷰';
    }
}

window.toggleViewMode = function(mode) {
    playUISound('click');
    rosterViewMode = mode;
    saveToStorage();
    applyViewMode();
};

function applyViewMode() {
    const cardWrapper = document.querySelector('.roster-columns-wrapper');
    const listWrapper = document.getElementById('roster-list-wrapper');
    
    if(!cardWrapper || !listWrapper) return;

    if (rosterViewMode === 'list') {
        cardWrapper.style.display = 'none';
        listWrapper.style.display = 'block';
        renderListView();
    } else {
        cardWrapper.style.display = 'grid';
        listWrapper.style.display = 'none';
        generateStudents();
    }
    updateViewToggleButtonUI();
}

const gradeMap = {'초1':1, '초등학교1학년':1, '초등1':1, '초2':2, '초등학교2학년':2, '초등2':2, '초3':3, '초등학교3학년':3, '초등3':3, '초4':4, '초등학교4학년':4, '초등4':4, '초5':5, '초등학교5학년':5, '초등5':5, '초6':6, '초등학교6학년':6, '초등6':6, '중1':7, '중학교1학년':7, '중등1':7, '중2':8, '중학교2학년':8, '중등2':8, '중3':9, '중학교3학년':9, '중등3':9, '고1':10, '고등학교1학년':10, '고등1':10, '고2':11, '고등학교2학년':11, '고등2':11, '고3':12, '고등학교3학년':12, '고등3':12};
function getGradeWeight(g) { return gradeMap[g.replace(/\s+/g,'')] || 99; }
const levelMap = {'PRE':1, 'BASIC':2, 'INTER':3, 'ADV':4, 'PREP':5, 'GUEST':6};
function getLevelWeight(l) { return levelMap[l] || 99; }

window.sortList = function(col) {
    playUISound('click');
    if (listSortConfig.col === col) { listSortConfig.asc = !listSortConfig.asc; } 
    else { listSortConfig.col = col; listSortConfig.asc = true; }
    
    ['name', 'grade', 'level', 'seat', 'startTime', 'time'].forEach(c => {
        let th = document.getElementById(`th-${c}`);
        if(th) {
            th.classList.remove('sort-asc', 'sort-desc');
            if(c === col) th.classList.add(listSortConfig.asc ? 'sort-asc' : 'sort-desc');
        }
    });
    renderListView();
}

function renderListView() {
    if(rosterViewMode !== 'list') return;
    const tbody = document.getElementById('rosterListBody');
    if(!tbody) return;

    let studentsData = allNames.map(name => {
        const lvl = studentLevels[name] || '';
        const grade = studentGrades[name] || '';
        const tIdx = timers.findIndex(t => t.student === name);
        const t = tIdx !== -1 ? timers[tIdx] : null;
        const isFinished = finishedSet.has(name);
        
        return { name, grade, level: lvl, tIdx, isFinished, timerData: t };
    });

    studentsData.sort((a, b) => {
        let res = 0;
        if (listSortConfig.col === 'name') res = a.name.localeCompare(b.name, 'ko-KR');
        else if (listSortConfig.col === 'grade') res = getGradeWeight(a.grade) - getGradeWeight(b.grade);
        else if (listSortConfig.col === 'level') res = getLevelWeight(a.level) - getLevelWeight(b.level);
        else if (listSortConfig.col === 'seat') {
            let sA = a.tIdx === -1 ? 99 : a.tIdx;
            let sB = b.tIdx === -1 ? 99 : b.tIdx;
            res = sA - sB;
        }
        else if (listSortConfig.col === 'startTime') {
            let ta = (a.timerData && a.timerData.startTimeStr) ? a.timerData.startTimeStr : '99:99';
            let tb = (b.timerData && b.timerData.startTimeStr) ? b.timerData.startTimeStr : '99:99';
            res = ta.localeCompare(tb);
        }
        else if (listSortConfig.col === 'time') {
            let timeA = 999999, timeB = 999999;
            if(a.timerData) { timeA = a.timerData.isOver ? -a.timerData.overTime : a.timerData.remainingTime; }
            if(b.timerData) { timeB = b.timerData.isOver ? -b.timerData.overTime : b.timerData.remainingTime; }
            res = timeA - timeB;
        }
        
        if (res === 0) res = a.name.localeCompare(b.name, 'ko-KR'); 
        return listSortConfig.asc ? res : -res;
    });

    let html = '';
    const tLang = i18n[currentLang] || i18n.ko;

    studentsData.forEach(sd => {
        let levelLabel = (sd.level === 'PREP') ? 'PREP31' : (sd.level === 'ADV' ? 'ADV' : sd.level); 
        let rowClass = '';
        
        let timerHtml = `<span style="font-size:32px; font-weight:900;">50:00</span>`;
        let startTimeHtml = '-';
        
        if (sd.isFinished) {
            rowClass = 'finished-row';
            
            let elapsedStr = "수업 완료";
            let finishLog = logRightItems.find(item => item.student === sd.name && item.type === 'finish');
            if(finishLog) {
                let [fH, fM] = finishLog.time.split(':').map(Number);
                let now = new Date();
                let cH = now.getHours(); let cM = now.getMinutes();
                let diff = (cH * 60 + cM) - (fH * 60 + fM);
                if(diff < 0) diff += 24 * 60; 
                
                if (diff === 0) elapsedStr = "방금 종료";
                else if (diff < 60) elapsedStr = `종료 후 ${diff}분`;
                else elapsedStr = `종료 후 ${Math.floor(diff/60)}시간 ${diff%60}분`;
            }

            timerHtml = `<span style="font-size:20px; font-weight:900; color:var(--text-muted); background: rgba(0,0,0,0.05); padding: 6px 12px; border-radius: 8px;">🏁 ${elapsedStr}</span>`;
        } else if (sd.timerData) {
            if (sd.timerData.interval !== null || sd.timerData.isPaused) rowClass = 'row-playing';
            
            if (sd.timerData.startTimeStr) {
                startTimeHtml = `<span class="editable-log-time" onclick="editActiveStartTime('${sd.name}')" style="cursor:pointer; color:var(--accent); font-weight:900; font-size:22px;">${sd.timerData.startTimeStr}</span>`;
            }

            let clickAction = `onclick="goToTimer('${sd.name}')" class="clickable-timer" style="cursor:pointer;"`;
            if (sd.timerData.isOver) {
                timerHtml = `<span ${clickAction}><span style="color:var(--brand-danger); font-size:32px; font-weight:900; text-shadow:0 0 8px rgba(239,68,68,0.3);">+${formatTime(sd.timerData.overTime)}</span></span>`;
            } else if (sd.timerData.interval || sd.timerData.isPaused) {
                let timeStr = formatTime(sd.timerData.remainingTime);
                if (sd.timerData.isPaused) timeStr = `⏸️ ${timeStr}`;
                timerHtml = `<span ${clickAction}><span style="color:var(--brand-success); font-size:32px; font-weight:900; text-shadow:0 0 8px rgba(16,185,129,0.3);">${timeStr}</span></span>`;
            } else {
                timerHtml = `<span ${clickAction}><span style="font-size:32px; font-weight:900;">50:00</span></span>`;
            }
        }
        
        let seatOptions = `<option value="-1">${currentLang === 'en' ? 'Unassigned' : '자리 미 배정'}</option>`;
        for(let i=0; i<DESK_COUNT; i++) {
            let t = timers[i];
            let isMe = (t.student === sd.name);
            let selected = isMe ? 'selected' : '';
            
            let statusIcon = '🪑';
            let statusText = '';
            let styleOption = '';
            
            if (t.interval !== null || t.isPaused) {
                if (t.student === "(empty)") { 
                    statusIcon = '🚨'; 
                    statusText = currentLang === 'en' ? ' (Timer Running!)' : ' (버튼 눌림!)'; 
                    styleOption = `style="background:#fee2e2; color:#ef4444; font-weight:bold;"`;
                } 
                else { statusIcon = t.isPaused ? '⏸️' : '▶️'; statusText = isMe ? '' : ` (${t.student})`; }
            } else {
                if (t.student !== "(empty)") { statusIcon = '⏹️'; statusText = isMe ? '' : ` (${t.student})`; }
            }
            
            let deskPrefix = currentLang === 'en' ? `Desk ${i+1}` : `${i+1}번 책상`;
            seatOptions += `<option value="${i}" selected="${selected}" styleOption="${styleOption}">${statusIcon} ${deskPrefix}${statusText}</option>`;
        }

        let selectClass = sd.tIdx !== -1 ? 'list-seat-select assigned' : 'list-seat-select';
        
        let btns = '';
        if(!sd.isFinished) {
            if(sd.tIdx !== -1) {
                let t = sd.timerData;
                if(!t.interval && !t.isOver && !t.isPaused) btns += `<button class="list-action-btn l-btn-start" onclick="startTimer(${sd.tIdx})">${tLang.btnStart}</button>`;
                else if(t.isPaused) btns += `<button class="list-action-btn l-btn-start" onclick="resumeTimer(${sd.tIdx})">▶️ 재개</button>`;
                
                if(t.interval || t.isPaused) btns += `<button class="list-action-btn l-btn-stop" onclick="stopTimer(${sd.tIdx})">${tLang.btnStop}</button>`;
                
                btns += `<button class="list-action-btn l-btn-finish" onclick="finishSession(${sd.tIdx})">${tLang.btnFinish}</button>`;
                btns += `<button class="list-action-btn l-btn-cancel" onclick="cancelSession(${sd.tIdx})">${tLang.btnCancel}</button>`;
            } else {
                if (sd.level === 'GUEST') btns += `<button class="list-action-btn l-btn-cancel" onclick="removeGuest('${sd.name}')">✖ ${currentLang === 'en' ? 'Delete' : '삭제'}</button>`;
            }
        } else {
            btns += `<button class="list-action-btn l-btn-cancel" onclick="finishedSet.delete('${sd.name}'); applyViewMode();">🔄 ${currentLang === 'en' ? 'Restore' : '대기열 복구'}</button>`;
        }

        let lvlColor = '#94a3b8';
        if(sd.level==='PRE') lvlColor='var(--selena-yellow)'; else if(sd.level==='BASIC') lvlColor='var(--selena-pink)'; else if(sd.level==='INTER') lvlColor='var(--selena-orange)'; else if(sd.level==='ADV') lvlColor='var(--selena-cyan)'; else if(sd.level==='PREP') lvlColor='var(--selena-brown)';
        let lvlFontColor = sd.level==='PRE' ? '#000' : '#fff';

        html += `
            <tr class="${rowClass}">
                <td style="font-weight:900; font-size:26px; text-align:center !important; color:var(--text-main); font-family: var(--app-font, 'Pretendard', sans-serif);">${sd.name}</td>
                <td style="color:var(--text-muted); font-weight:800; font-size:18px;"><span class="list-grade-badge">${sd.grade || '-'}</span></td>
                <td><span class="list-level-tag" style="background:${lvlColor}; color:${lvlFontColor};">${levelLabel}</span></td>
                <td>
                    <select class="${selectClass}" onchange="changeSeatFromList('${sd.name}', this.value)" ${sd.isFinished ? 'disabled' : ''}>
                        ${seatOptions}
                    </select>
                </td>
                <td style="font-family:'JetBrains Mono';">${startTimeHtml}</td>
                <td id="list-time-cell-${sd.name}" style="font-family:'JetBrains Mono';">${timerHtml}</td>
                <td><div class="list-btn-group">${btns}</div></td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
    makeColumnsResizable(); 
}

window.changeSeatFromList = function(name, newIdxStr) {
    playUISound('click');
    let newIdx = parseInt(newIdxStr);
    let oldIdx = timers.findIndex(t => t.student === name);
    if(newIdx === oldIdx) return;
    
    if(newIdx === -1) {
        if(oldIdx !== -1) cancelSession(oldIdx);
    } else {
        handleDropOnTimer(name, newIdx, oldIdx !== -1 ? oldIdx : null);
    }
    if (rosterViewMode === 'list') renderListView();
}

function updateListViewTime(name, remainingTime, isOver, overTime) {
    if(rosterViewMode !== 'list') return;
    let timeCell = document.getElementById(`list-time-cell-${name}`);
    if(timeCell) {
        let tIdx = timers.findIndex(t => t.student === name);
        let isPaused = (tIdx !== -1 && timers[tIdx].isPaused);
        
        let clickAction = `onclick="goToTimer('${name}')" class="clickable-timer" style="cursor:pointer;"`;
        if(isOver) {
            timeCell.innerHTML = `<span ${clickAction}><span style="color:var(--brand-danger); font-size:32px; font-weight:900; text-shadow:0 0 8px rgba(239,68,68,0.3);">+${formatTime(overTime)}</span></span>`;
        } else {
            let timeStr = formatTime(remainingTime);
            if(isPaused) timeStr = `⏸️ ${timeStr}`;
            timeCell.innerHTML = `<span ${clickAction}><span style="color:var(--brand-success); font-size:32px; font-weight:900; text-shadow:0 0 8px rgba(16,185,129,0.3);">${timeStr}</span></span>`;
        }
    }
}

window.goToTimer = function(name) {
    let tIdx = timers.findIndex(t => t.student === name);
    if (tIdx !== -1) {
        playUISound('click'); switchView('timer');
        setTimeout(() => {
            const box = document.getElementById(`box-${tIdx}`);
            if(box) {
                box.scrollIntoView({behavior: 'smooth', block: 'center'});
                box.style.transform = 'scale(1.08) translateZ(0)';
                box.style.boxShadow = '0 0 0 4px var(--accent), 0 15px 30px rgba(0,0,0,0.2)';
                setTimeout(() => { box.style.transform = ''; box.style.boxShadow = ''; }, 1500);
            }
        }, 300);
    }
};

// ==========================================
// 스토리지, 기본 세팅 관련 함수
// ==========================================
function updateCustomNames() {
    academyName = document.getElementById('inputAcademyName').value || "향촌삼성영어학원";
    className = document.getElementById('inputClassName').value || "Maple Classroom";
    document.getElementById('displayAcademyName').innerText = academyName;
    document.getElementById('displayClassName').innerText = className;
    saveToStorage();
}

function changeNameColor() {
    const val = document.getElementById("nameColorSelect").value; const root = document.documentElement;
    const shadowDark = '0 2px 4px rgba(0,0,0,0.8)'; const shadowLight = '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 2px 5px rgba(255,255,255,0.8)';
    if (val === 'black') { root.style.setProperty('--custom-name-color', '#000000'); root.style.setProperty('--custom-name-shadow', shadowLight); } 
    else if (val === 'white') { root.style.setProperty('--custom-name-color', '#ffffff'); root.style.setProperty('--custom-name-shadow', shadowDark); } 
    else if (val === 'yellow') { root.style.setProperty('--custom-name-color', '#fde047'); root.style.setProperty('--custom-name-shadow', shadowDark); } 
    else if (val === 'pink') { root.style.setProperty('--custom-name-color', '#fbcfe8'); root.style.setProperty('--custom-name-shadow', shadowDark); }
    else if (val === 'cyan') { root.style.setProperty('--custom-name-color', '#67e8f9'); root.style.setProperty('--custom-name-shadow', shadowDark); }
    else if (val === 'green') { root.style.setProperty('--custom-name-color', '#6ee7b7'); root.style.setProperty('--custom-name-shadow', shadowDark); }
    else if (val === 'orange') { root.style.setProperty('--custom-name-color', '#fb923c'); root.style.setProperty('--custom-name-shadow', shadowDark); }
    else if (val === 'purple') { root.style.setProperty('--custom-name-color', '#d8b4fe'); root.style.setProperty('--custom-name-shadow', shadowDark); }
    else if (val === 'gold') { root.style.setProperty('--custom-name-color', '#fbbf24'); root.style.setProperty('--custom-name-shadow', shadowDark); }
    else { root.style.setProperty('--custom-name-color', '#0f172a'); root.style.setProperty('--custom-name-shadow', 'none'); }
    saveToStorage();
}

function changeTheme() { currentTheme = document.getElementById("themeSelect").value; document.body.className = "theme-" + currentTheme; saveToStorage(); }
function updateVolumes() { alarmVolume = document.getElementById('volAlarm').value / 100; ttsVolume = document.getElementById('volTTS').value / 100; uiVolume = document.getElementById('volUI').value / 100; saveToStorage(); }

function changeDeskCount() {
    const newCount = parseInt(document.getElementById("deskCountSelect").value);
    if(newCount < timers.length) {
        for(let i=newCount; i<timers.length; i++) {
            if(timers[i].student !== "(empty)") {
                if(!confirm(`타이머 ${newCount+1}번 이상에 배치된 학생이 있습니다. 그래도 타이머를 줄이시겠습니까? (해당 학생은 취소됩니다.)`)) {
                    document.getElementById("deskCountSelect").value = DESK_COUNT; return;
                }
                break;
            }
        }
        for(let i=newCount; i<timers.length; i++) { stopTimer(i); if(timers[i].student !== "(empty)") { attendanceMap.delete(timers[i].student); updateStudentStatus(timers[i].student); } }
        timers.length = newCount;
    } else if(newCount > timers.length) {
        for(let i=timers.length; i<newCount; i++) { timers.push({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 }); }
    }
    DESK_COUNT = newCount; createInitialGrid(); generateStudents(); saveToStorage();
}

function saveToStorage() {
    try {
        const studentsObj = {};
        ['PRE', 'BASIC', 'INTER', 'ADV', 'PREP'].forEach(lvl => {
            studentsObj[lvl] = {
                names: getNamesFromContentEditable("studentInput_" + lvl),
                grades: getNamesFromContentEditable("gradeInput_" + lvl)
            };
        });

        const data = { 
            deskCount: DESK_COUNT, academyName: academyName, className: className, students: studentsObj, logLeftItems: logLeftItems, logRightItems: logRightItems, 
            attendance: Array.from(attendanceMap.entries()), finishedSet: Array.from(finishedSet), assignOrderCounter: assignOrderCounter, 
            timerStates: timers.map(t => ({ 
                student: t.student, remainingTime: t.remainingTime, totalTime: t.totalTime, overTime: t.overTime, isOver: t.isOver, startTimeStr: t.startTimeStr,
                isRunning: t.interval !== null, isPaused: t.isPaused || false, lastTick: t.lastTick 
            })), 
            vols: { a: alarmVolume, t: ttsVolume, u: uiVolume, ttsVoice: document.getElementById("ttsVoiceSelect")?.value || "1", melody: document.getElementById("melodyType").value, uiType: document.getElementById("uiSoundType").value }, 
            theme: currentTheme, nameColor: document.getElementById("nameColorSelect").value, language: currentLang,
            fontFamily: currentFontFamily, 
            customStudentOrder: customStudentOrder, guestList: guestList, rosterViewMode: rosterViewMode
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        updateRosterCounts(); // 변경될 때마다 카운트 현황판 동기화
    } catch(e) {}
}

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved); 
            if(data.language) { currentLang = data.language; document.getElementById("langSelect").value = currentLang; }
            if(data.deskCount) { DESK_COUNT = data.deskCount; document.getElementById("deskCountSelect").value = DESK_COUNT; }
            if(data.rosterViewMode) { rosterViewMode = data.rosterViewMode; }
            
            if(data.fontFamily) { 
                currentFontFamily = data.fontFamily; 
                document.documentElement.style.setProperty('--app-font', currentFontFamily);
                document.body.style.fontFamily = currentFontFamily;
                const fontSelectEl = document.getElementById("fontSelect");
                if (fontSelectEl) fontSelectEl.value = currentFontFamily;
            }

            customStudentOrder = data.customStudentOrder || []; guestList = data.guestList || [];
            academyName = data.academyName || "향촌삼성영어학원"; className = data.className || "Maple Classroom";
            document.getElementById('inputAcademyName').value = academyName; document.getElementById('inputClassName').value = className;
            document.getElementById('displayAcademyName').innerText = academyName; document.getElementById('displayClassName').innerText = className; 
            
            if (data.students) { 
                ['PRE', 'BASIC', 'INTER', 'ADV', 'PREP'].forEach(lvl => {
                    if(data.students[lvl]) {
                        if (Array.isArray(data.students[lvl].names)) {
                            updateContentEditable("studentInput_" + lvl, data.students[lvl].names);
                            updateContentEditable("gradeInput_" + lvl, data.students[lvl].grades || []);
                        } else {
                            let legacyStr = (typeof data.students[lvl] === 'string') ? data.students[lvl] : '';
                            updateContentEditable("studentInput_" + lvl, legacyStr.split('\n').filter(s=>s.trim()));
                            updateContentEditable("gradeInput_" + lvl, []);
                        }
                    }
                });
            }
            
            logLeftItems = data.logLeftItems || []; logRightItems = data.logRightItems || []; 
            attendanceMap = new Map(data.attendance || []); finishedSet = new Set(data.finishedSet || []); assignOrderCounter = data.assignOrderCounter || 0; 
            
            timers = data.timerStates ? data.timerStates.map(ts => {
                let t = { ...ts, interval: null, isPaused: ts.isPaused || false, lastTick: ts.lastTick || 0 };
                if (ts.isRunning && t.lastTick > 0) {
                    const now = Date.now();
                    const delta = Math.floor((now - t.lastTick) / 1000); 
                    if (delta > 0) {
                        if (t.remainingTime >= delta) {
                            t.remainingTime -= delta;
                        } else {
                            t.overTime += (delta - t.remainingTime);
                            t.remainingTime = 0;
                        }
                    }
                    t.lastTick = now - ((now - t.lastTick) % 1000); 
                }
                return t;
            }) : Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 }));
            
            while (timers.length < DESK_COUNT) { timers.push({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 }); }
            if (timers.length > DESK_COUNT) { timers.length = DESK_COUNT; }

            if(data.vols) { 
                alarmVolume = data.vols.a; ttsVolume = data.vols.t; uiVolume = data.vols.u !== undefined ? data.vols.u : 0.5; 
                document.getElementById("volAlarm").value = data.vols.a * 100; document.getElementById("volTTS").value = data.vols.t * 100; document.getElementById("volUI").value = uiVolume * 100; 
                if(data.vols.ttsVoice !== undefined && document.getElementById("ttsVoiceSelect")) document.getElementById("ttsVoiceSelect").value = data.vols.ttsVoice; 
                if(data.vols.melody) document.getElementById("melodyType").value = data.vols.melody; 
                if(data.vols.uiType) document.getElementById("uiSoundType").value = data.vols.uiType; 
            }
            if(data.theme) { currentTheme = data.theme; document.getElementById("themeSelect").value = currentTheme; document.body.className = "theme-" + currentTheme; }
            if(data.nameColor) { document.getElementById("nameColorSelect").value = data.nameColor; changeNameColor(); }
            
            applyLanguage(); createInitialGrid(); applyViewMode(); renderLogs(); updateRosterCounts();
            
            if (data.timerStates) {
                data.timerStates.forEach((ts, idx) => {
                    if (ts.isRunning) { resumeTimer(idx); }
                });
            }

        } else {
            updateContentEditable("studentInput_PRE", []); updateContentEditable("studentInput_BASIC", []); updateContentEditable("studentInput_INTER", []); updateContentEditable("studentInput_ADV", []); updateContentEditable("studentInput_PREP", []);
            timers = Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 }));
            applyLanguage(); createInitialGrid(); applyViewMode(); updateRosterCounts();
        }
    } catch(e) { applyLanguage(); createInitialGrid(); applyViewMode(); updateRosterCounts(); }
}

function exportData() { saveToStorage(); const data = localStorage.getItem(STORAGE_KEY); const blob = new Blob([data], {type: "application/json"}); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `Timer_Backup_PC_${new Date().toISOString().slice(0,10)}.json`; a.click(); }
function triggerImport() { document.getElementById("importFile").click(); }

function importData(e) { 
    const t = i18n[currentLang] || i18n.ko; 
    const file = e.target.files[0]; 
    if (!file) return; 
    const reader = new FileReader(); 
    reader.onload = function(evt) { 
        try { 
            const json = JSON.parse(evt.target.result); 
            if(typeof json !== 'object' || (!json.timers && !json.deskCount)) throw new Error("Invalid Format");
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json)); 
            alert(t.alertBackupDone || "복구 완료!"); 
            location.reload(); 
        } catch(err) { 
            alert(t.alertBackupFail || "백업 파일이 유효하지 않습니다. (.json 파일을 선택했는지 다시 한번 확인해주세요!)"); 
        } finally {
            e.target.value = ''; 
        }
    }; 
    reader.readAsText(file); 
}

function getNamesFromContentEditable(id) { const el = document.getElementById(id); if(!el) return []; let html = el.innerHTML; html = html.replace(/<div[^>]*>/gi, '\n').replace(/<\/div>/gi, '\n').replace(/<p[^>]*>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<br\s*[\/]?>/gi, '\n'); let text = html.replace(/<[^>]+>/g, ''); return text.split(/\n/).map(s => s.trim()).filter(s => s !== ""); }
function updateContentEditable(id, arr) { const el = document.getElementById(id); if(el) el.innerHTML = arr.map(name => `<div>${name}</div>`).join(''); }

window.quickStart = function(name) { let tIdx = timers.findIndex(t => t.student === name); if (tIdx !== -1) startTimer(tIdx); };
window.quickFinish = function(name) { let tIdx = timers.findIndex(t => t.student === name); if (tIdx !== -1) finishSession(tIdx); };

function addGuest() { 
    const input = document.getElementById('guestNameInput'); 
    const gradeInp = document.getElementById('guestGradeInput');
    const name = input.value.trim(); const grade = gradeInp ? gradeInp.value.trim() : '';
    if (!name) return; 
    if (studentLevels[name] || guestList.includes(name)) { alert("이미 명단에 있는 이름입니다."); return; } 
    guestList.push(name); customStudentOrder.push(name); 
    studentLevels[name] = 'GUEST'; studentGrades[name] = grade;
    input.value = ''; if(gradeInp) gradeInp.value = ''; playUISound('click'); generateStudents(); 
}
window.removeGuest = function(name) { if(confirm(`게스트 '${name}' 학생을 삭제하시겠습니까?`)) { guestList = guestList.filter(g => g !== name); customStudentOrder = customStudentOrder.filter(g => g !== name); if(finishedSet.has(name)) finishedSet.delete(name); playUISound('cancel'); generateStudents(); } };
window.cancelFromCard = function(name) { let tIdx = timers.findIndex(t => t.student === name); if (tIdx !== -1) cancelSession(tIdx); };

// =========================================================================
// 🚀 학생 명단, 슬롯 생성 및 렌더링 로직
// =========================================================================
function initRosterSlots() {
    const gridActive = document.getElementById("grid-active");
    if(!gridActive) return;
    gridActive.innerHTML = "";
    
    for(let i=0; i<DESK_COUNT; i++) {
        let slot = document.createElement("div"); slot.id = `roster-desk-${i}`; slot.className = "roster-desk-slot";
        slot.ondragenter = (e) => { e.preventDefault(); slot.classList.add("drag-over"); };
        slot.ondragover = (e) => { e.preventDefault(); slot.classList.add("drag-over"); };
        slot.ondragleave = (e) => { slot.classList.remove("drag-over"); };
        slot.ondrop = (e) => { e.preventDefault(); slot.classList.remove("drag-over"); handleDropOnTimer(draggedName, i, draggedFromIndex); };
        gridActive.appendChild(slot);
    }
}

window.cancelEmptySlot = function(id, e) {
    if(e) e.stopPropagation();
    playUISound('cancel');
    resetTimerData(id, true);
};

function updateRosterSlotUI(id) {
    if(rosterViewMode === 'list') return; 
    
    const slot = document.getElementById(`roster-desk-${id}`); if(!slot) return;
    const t = timers[id]; const isAssigned = t.student !== "(empty)"; const isPlaying = t.interval !== null || t.isPaused;

    const existingPlaceholder = slot.querySelector('.roster-placeholder');
    if(existingPlaceholder) existingPlaceholder.remove();

    if (!isAssigned) {
        let placeholder = document.createElement('div'); placeholder.className = 'roster-placeholder';
        if (isPlaying) {
            placeholder.style.cursor = "grab"; placeholder.draggable = true;
            placeholder.ondragstart = (e) => { draggedName = "(empty)"; draggedFromIndex = id; draggedNameForList = null; e.dataTransfer.effectAllowed = 'move'; playUISound('click'); };
            placeholder.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
                    <div class="roster-waiting-text" style="pointer-events:none; margin-bottom:8px;">✨ 매칭 대기중...</div>
                    <div class="css-desk" style="opacity: 0.8;">
                        <div class="desk-top" style="background:#dbeafe; border-color:#93c5fd;"><span class="desk-num" style="color:#2563eb;">${id+1}</span></div>
                        <div class="desk-chair" style="background:#bfdbfe; border-color:#60a5fa;"></div>
                    </div>
                    <button onclick="cancelEmptySlot(${id}, event)" style="margin-top:12px; padding:6px 14px; border-radius:10px; background:var(--brand-danger); color:#fff; border:none; font-weight:900; font-size:13px; cursor:pointer; box-shadow:var(--shadow-btn);">✖ 대기 취소</button>
                </div>
            `;
        } else {
            placeholder.innerHTML = `
                <div class="css-desk">
                    <div class="desk-top"><span class="desk-num">${id+1}</span></div>
                    <div class="desk-chair"></div>
                </div>
                <div class="roster-empty-text" style="margin-top: 10px;">빈자리</div>
            `;
        }
        slot.appendChild(placeholder);
    }
}

let allNames = []; 

function generateStudents() {
    studentLevels = {}; studentGrades = {};
    const levels = ['PRE', 'BASIC', 'INTER', 'ADV', 'PREP']; const tLang = i18n[currentLang] || i18n.ko; let rawNames = [];

    levels.forEach(lvl => { 
        const names = getNamesFromContentEditable("studentInput_" + lvl); 
        const grades = getNamesFromContentEditable("gradeInput_" + lvl); 
        names.forEach((n, idx) => { 
            studentLevels[n] = lvl; studentGrades[n] = grades[idx] || ''; rawNames.push(n); 
        }); 
    });
    guestList.forEach(n => { rawNames.push(n); });

    let newOrder = [];
    customStudentOrder.forEach(name => { if(rawNames.includes(name)) newOrder.push(name); });
    rawNames.forEach(name => { if(!newOrder.includes(name)) newOrder.push(name); });
    customStudentOrder = newOrder; allNames = customStudentOrder;

    if (rosterViewMode === 'list') {
        renderListView();
    } else {
        document.getElementById("grid-unassigned").innerHTML = ""; initRosterSlots(); document.getElementById("grid-finished").innerHTML = "";

        allNames.forEach((n, index) => {
            const lvl = studentLevels[n]; const grade = studentGrades[n];
            const btn = document.createElement("button"); btn.id = "btn-" + n; 
            let levelLabel = (lvl === 'PREP') ? 'PREP31' : (lvl === 'ADV' ? 'ADV' : lvl); 
            if(lvl === 'GUEST') levelLabel = 'GUEST';

            let gradeHtml = grade ? `<div class="card-grade-badge">${grade}</div>` : '';

            // ⭐ 레벨 태그 없애고 배경 워터마크로 대체 완료
            btn.innerHTML = `
                <div class="gauge-bg"></div>
                <div class="level-watermark">${levelLabel}</div>
                <button class="card-cancel-btn" onclick="event.stopPropagation(); cancelFromCard('${n}')">✖</button>
                <button class="guest-delete-btn" onclick="event.stopPropagation(); removeGuest('${n}')">✖</button>
                <div class="alarm-alert-text">${tLang.statusTimeUp}</div>
                ${gradeHtml}
                <div class="name-text">${n}</div>
                <div class="quick-controls">
                    <button class="quick-btn q-start" onclick="event.stopPropagation(); quickStart('${n}')">${tLang.quickStart}</button>
                    <button class="quick-btn q-finish" onclick="event.stopPropagation(); quickFinish('${n}')">${tLang.quickFinish}</button>
                </div>
            `;
            btn.draggable = true; btn.style.order = index;

            btn.ondragstart = (e) => { 
                draggedName = n; draggedNameForList = n; 
                let tIdx = timers.findIndex(t => t.student === n); draggedFromIndex = tIdx !== -1 ? tIdx : null; 
                e.dataTransfer.effectAllowed = 'move'; playUISound('click'); 
            };
            btn.ondragenter = (e) => { e.preventDefault(); btn.classList.add("drag-over"); };
            btn.ondragover = (e) => { e.preventDefault(); btn.classList.add("drag-over"); };
            btn.ondragleave = (e) => { btn.classList.remove("drag-over"); };
            
            btn.ondrop = (e) => {
                e.preventDefault(); btn.classList.remove("drag-over");
                if (draggedFromIndex !== null) return; 
                if (draggedNameForList && draggedNameForList !== n) {
                    let i1 = customStudentOrder.indexOf(draggedNameForList); let i2 = customStudentOrder.indexOf(n);
                    if (i1 > -1 && i2 > -1) { let temp = customStudentOrder[i1]; customStudentOrder[i1] = customStudentOrder[i2]; customStudentOrder[i2] = temp; playUISound('click'); generateStudents(); }
                }
            };

            btn.onclick = () => { 
                btn.classList.add("clicked"); setTimeout(() => btn.classList.remove("clicked"), 150);
                if (attendanceMap.has(n)) { goToTimer(n); } 
                else { 
                    if (finishedSet.has(n)) finishedSet.delete(n); 
                    const emptyIdx = timers.findIndex(t => t.student === "(empty)"); 
                    if (emptyIdx !== -1) handleDropOnTimer(n, emptyIdx, null); 
                }
            };
            
            document.getElementById("grid-unassigned").appendChild(btn); 
            updateStudentStatus(n);
        });
    }
    
    timers.forEach((t, idx) => { 
        if(t.student !== "(empty)") updateGauge(t.student, t.remainingTime, t.totalTime); 
        updateBoxUI(idx); 
    }); 
    updateRosterCounts();
    saveToStorage();
}

function updateStudentStatus(name) {
    if(rosterViewMode === 'list') return; 

    const tLang = i18n[currentLang] || i18n.ko; const btn = document.getElementById("btn-" + name); if (!btn) return; const lvl = studentLevels[name] || '';
    btn.className = `student-btn level-${lvl}`; 
    
    let badge = btn.querySelector(".status-badge");
    if (!badge) { badge = document.createElement("div"); badge.className = "status-badge"; btn.appendChild(badge); }
    badge.style.background = ""; badge.style.color = ""; badge.style.display = ""; 
    
    let timeBadge = btn.querySelector(".start-time-badge");
    if (!timeBadge) { 
        timeBadge = document.createElement("div"); timeBadge.className = "start-time-badge"; timeBadge.title = "클릭하여 시작 시간 수정";
        btn.appendChild(timeBadge); 
    }
    timeBadge.style.display = "none"; 

    const gridUnassigned = document.getElementById("grid-unassigned"); const gridFinished = document.getElementById("grid-finished");

    if (finishedSet.has(name)) { 
        btn.classList.add("finished"); 
        badge.style.display = "none"; 
        
        let elapsedStr = "수업 완료";
        let finishLog = logRightItems.find(item => item.student === name && item.type === 'finish');
        if(finishLog) {
            let [fH, fM] = finishLog.time.split(':').map(Number);
            let now = new Date();
            let cH = now.getHours(); let cM = now.getMinutes();
            let diff = (cH * 60 + cM) - (fH * 60 + fM);
            if(diff < 0) diff += 24 * 60; 
            
            if (diff === 0) elapsedStr = "방금 전";
            else if (diff < 60) elapsedStr = `${diff}분 전`;
            else elapsedStr = `${Math.floor(diff/60)}시간 전`;
        }

        let existingElapsed = btn.querySelector('.elapsed-tag');
        if(existingElapsed) {
            existingElapsed.innerText = elapsedStr;
        } else {
            let elapsedTag = document.createElement("div");
            elapsedTag.className = "elapsed-tag";
            elapsedTag.innerText = elapsedStr;
            elapsedTag.style.position = "absolute";
            elapsedTag.style.bottom = "8px";
            elapsedTag.style.right = "8px";
            elapsedTag.style.fontSize = "13px";
            elapsedTag.style.fontWeight = "800";
            elapsedTag.style.color = "var(--text-muted)";
            elapsedTag.style.background = "rgba(0,0,0,0.06)";
            elapsedTag.style.padding = "3px 8px";
            elapsedTag.style.borderRadius = "6px";
            btn.appendChild(elapsedTag);
        }

        gridFinished.appendChild(btn);
    } else {
        let tIdx = timers.findIndex(x => x.student === name);
        let elapsedTag = btn.querySelector('.elapsed-tag');
        if(elapsedTag) elapsedTag.remove();

        if (tIdx !== -1) {
            let t = timers[tIdx];
            if (t.isOver) { 
                btn.classList.add("alarm-blink", "attended"); badge.innerHTML = tLang.statusTimeUp; badge.style.background = "var(--brand-danger)"; badge.style.color = "white"; 
            } else if (t.interval || t.isPaused) { 
                btn.classList.add("playing", "attended"); badge.style.display = "none"; 
                
                if (t.isPaused) {
                    badge.innerHTML = currentLang === 'en' ? "⏸️ Paused" : "⏸️ 일시정지";
                    badge.style.background = "var(--text-muted)";
                    badge.style.color = "white";
                    badge.style.display = "block";
                }
                
                if(t.startTimeStr) { timeBadge.innerHTML = `⏰ ${t.startTimeStr}`; timeBadge.style.display = "block"; timeBadge.onclick = (e) => { e.stopPropagation(); editActiveStartTime(name); }; }
            } else { btn.classList.add("attended"); badge.innerHTML = tLang.statusAssign; badge.style.background = "var(--brand-success)"; badge.style.color = "white"; }
            let slot = document.getElementById(`roster-desk-${tIdx}`); if(slot) slot.appendChild(btn);
        } else { badge.remove(); timeBadge.remove(); gridUnassigned.appendChild(btn); }
    }
}

// ⭐ 모달 시간 수정
let timePromptCallback = null;
function showTimePrompt(title, defaultTime, callback) {
    playUISound('click'); let overlay = document.getElementById('custom-time-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div'); overlay.id = 'custom-time-modal-overlay';
        overlay.onclick = (e) => { if(e.target === overlay) closeTimePrompt(false); };
        overlay.innerHTML = `
            <div class="custom-time-modal">
                <h3 id="time-modal-title">시간 수정</h3>
                <input type="time" id="time-modal-input" required>
                <div class="quick-time-btns">
                    <button type="button" onclick="addTimeModalMin(-5)">-5분</button>
                    <button type="button" onclick="addTimeModalMin(-1)">-1분</button>
                    <button type="button" onclick="addTimeModalMin(1)">+1분</button>
                    <button type="button" onclick="addTimeModalMin(5)">+5분</button>
                </div>
                <div class="modal-btns">
                    <button type="button" class="btn-modal-cancel" onclick="closeTimePrompt(false)">취소</button>
                    <button type="button" class="btn-modal-save" onclick="closeTimePrompt(true)">저장</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
    }
    document.getElementById('time-modal-title').innerText = title;
    if(!defaultTime) { const now = new Date(); defaultTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`; }
    document.getElementById('time-modal-input').value = defaultTime;
    timePromptCallback = callback;
    requestAnimationFrame(() => { overlay.classList.add('show'); });
}

window.addTimeModalMin = function(minToAdd) {
    const input = document.getElementById('time-modal-input');
    if(!input.value) return;
    let [hh, mm] = input.value.split(':').map(Number);
    let date = new Date(); date.setHours(hh); date.setMinutes(mm + minToAdd);
    input.value = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
    playUISound('click');
}

window.closeTimePrompt = function(isSave) {
    const overlay = document.getElementById('custom-time-modal-overlay'); overlay.classList.remove('show'); playUISound('click');
    if (isSave) { const newTime = document.getElementById('time-modal-input').value; if (timePromptCallback && newTime) timePromptCallback(newTime); }
    timePromptCallback = null;
}

window.editActiveStartTime = function(name) {
    let tIdx = timers.findIndex(t => t.student === name); if(tIdx === -1) return; let t = timers[tIdx];
    showTimePrompt(`[${name}] 시작 시간 수정`, t.startTimeStr, function(newTime) {
        t.startTimeStr = newTime; 
        let logItem = logLeftItems.find(item => item.student === name && item.type === 'start');
        if(logItem) { logItem.time = newTime; renderLogs(); }
        updateStudentStatus(name); saveToStorage();
    });
};

function createInitialGrid() {
    const grid = document.getElementById("grid"); grid.innerHTML = "";
    for (let i = 0; i < DESK_COUNT; i++) {
        const box = document.createElement("div"); box.id = `box-${i}`; box.className = "timer-box";
        box.ondragenter = (e) => { e.preventDefault(); box.classList.add("drag-over"); };
        box.ondragover = (e) => { e.preventDefault(); box.classList.add("drag-over"); };
        box.ondragleave = (e) => { box.classList.remove("drag-over"); };
        box.ondrop = (e) => { e.preventDefault(); box.classList.remove("drag-over"); handleDropOnTimer(draggedName, i, draggedFromIndex); };
        grid.appendChild(box); updateBoxUI(i);
    }
}

// 🚀 타이머 창 개별 Box 업데이트
function updateBoxUI(id) {
    const tLang = i18n[currentLang] || i18n.ko;
    const t = timers[id]; const box = document.getElementById(`box-${id}`); if (!box) return;
    
    const isAssigned = t.student !== "(empty)";
    const isPlaying = t.interval !== null || t.isPaused;
    const isRunningEmpty = !isAssigned && isPlaying; 

    box.className = `timer-box ${t.isOver ? 'done' : ''} ${isPlaying ? 'playing' : ''}`;
    
    const lvl = studentLevels[t.student] || '';
    const panelClass = isAssigned && lvl ? `info-panel timer-bg-${lvl}` : 'info-panel';
    const panelStyle = (isAssigned || isRunningEmpty) ? "" : "background: transparent; border: 2px dashed var(--border); box-shadow: none !important;";
    
    const nameDisplay = isAssigned ? `<span style="font-family: var(--app-font, 'Pretendard', sans-serif);">${t.student}</span>` : (isRunningEmpty ? `<span style="font-size: 22px; color: var(--accent); font-weight:900; animation: blinker 1.5s linear infinite;">매칭 대기중...</span>` : '&nbsp;');
    const numDisplay = String(id+1).padStart(2, '0');

    let cancelWaitingBtn = '';
    if (isRunningEmpty) {
        cancelWaitingBtn = `
        <div class="action-btn-row" style="margin-top: -15px; margin-bottom: 15px;">
            <button class="action-btn" style="background: var(--brand-danger); color: white; font-size: 14px; border:none; padding: 10px;" onclick="resetTimerData(${id}, true); playUISound('cancel');">
                ✖ 대기 취소
            </button>
        </div>`;
    }

    box.innerHTML = `
        <div class="desk-id" style="opacity: ${(isAssigned || isRunningEmpty) ? '1' : '0.4'}">${numDisplay}</div>
        <div class="${panelClass}" draggable="${isAssigned || isRunningEmpty}" style="${panelStyle}">
            <div class="student-name-display" ${isAssigned ? `style="cursor:pointer;" onclick="playUISound('tab'); switchView('roster');"` : ''}>${nameDisplay}</div>
            <div class="time-display" id="display-${id}" style="visibility: ${(isAssigned || isRunningEmpty) ? 'visible' : 'hidden'}">${t.isOver ? '+'+formatTime(t.overTime) : formatTime(t.remainingTime)}</div>
        </div>
        
        ${cancelWaitingBtn}

        <div class="time-controls">
            <button class="time-btn btn-3d-sm" onclick="adjustTime(${id}, 3000)">+50</button>
            <button class="time-btn btn-3d-sm" onclick="adjustTime(${id}, 600)">+10</button>
            <button class="time-btn btn-3d-sm" onclick="adjustTime(${id}, 300)">+05</button>
            <button class="time-btn btn-3d-sm" onclick="adjustTime(${id}, 60)">+01</button>
            <button class="time-btn btn-3d-sm minus" onclick="adjustTime(${id}, -600)">-10</button>
            <button class="time-btn btn-3d-sm minus" onclick="adjustTime(${id}, -300)">-05</button>
            <button class="time-btn btn-3d-sm minus" onclick="adjustTime(${id}, -60)">-01</button>
            <button class="time-btn btn-3d-sm clear" onclick="clearTime(${id})">${tLang.btnClear}</button>
        </div>
        
        <div class="action-btn-row">
            <button class="action-btn btn-start" onclick="startTimer(${id})">${t.isPaused ? '▶️ 재개' : tLang.btnStart}</button>
        </div>
        
        <div class="action-btn-row">
            <button class="action-btn btn-stop" onclick="stopTimer(${id})">${tLang.btnStop}</button>
            <button class="action-btn btn-cancel" onclick="cancelSession(${id})">${tLang.btnCancel}</button>
        </div>
        
        <div class="action-btn-row">
            <button class="action-btn btn-finish" onclick="finishSession(${id})">${tLang.btnFinish}</button>
        </div>
    `;
    
    const infoPanel = box.querySelector('.info-panel');
    infoPanel.ondragstart = (e) => { 
        if(isAssigned || isRunningEmpty) { 
            draggedName = isAssigned ? t.student : "(empty)"; 
            draggedFromIndex = id; draggedNameForList = null; e.dataTransfer.effectAllowed = 'move'; 
        } else { e.preventDefault(); } 
    };
    
    if(rosterViewMode === 'card') updateRosterSlotUI(id); 
}

window.simulateHardwareButton = function(id) {
    playUISound('click');
    const target = timers[id];
    if (target.interval || target.isPaused) return;

    target.remainingTime = 3000; target.totalTime = 3000; target.overTime = 0; target.isOver = false;
    playDeskStartTTS(id + 1); startTimer(id);
    if(rosterViewMode === 'list') renderListView();
};

function handleDropOnTimer(name, targetIdx, fromIdx) {
    if (fromIdx === targetIdx) return;

    if (name !== "(empty)") {
        let alreadyIdx = timers.findIndex(t => t.student === name);
        if (alreadyIdx !== -1 && alreadyIdx !== targetIdx && alreadyIdx !== fromIdx) { resetTimerData(alreadyIdx, false); }
    }

    if (fromIdx !== null) {
        let tFrom = timers[fromIdx]; let tTarget = timers[targetIdx];
        let fromRunning = tFrom.interval !== null; let targetRunning = tTarget.interval !== null;

        if (fromRunning) { clearInterval(tFrom.interval); tFrom.interval = null; }
        if (targetRunning) { clearInterval(tTarget.interval); tTarget.interval = null; }

        let tempFrom = { ...tFrom }; let tempTarget = { ...tTarget };
        timers[targetIdx] = tempFrom; timers[fromIdx] = tempTarget;

        updateBoxUI(fromIdx); updateBoxUI(targetIdx); 
        if (timers[fromIdx].student !== "(empty)") updateStudentStatus(timers[fromIdx].student); 
        if (timers[targetIdx].student !== "(empty)") updateStudentStatus(timers[targetIdx].student); 
        
        playUISound('assign');
        if (fromRunning) startTimer(targetIdx, true);
        if (targetRunning) startTimer(fromIdx, true);

    } else {
        const target = timers[targetIdx];
        if (target.interval || target.isPaused) {
            target.student = name;
            if (!attendanceMap.has(name)) { assignOrderCounter++; attendanceMap.set(name, assignOrderCounter); if(finishedSet.has(name)) finishedSet.delete(name); }
            playUISound('assign'); 
            logEvent(name, 'start', 'left', 0, target.startTimeStr); 
            updateBoxUI(targetIdx); updateStudentStatus(name); updateGauge(name, target.remainingTime, target.totalTime);
        } else {
            target.student = name; target.remainingTime = 3000; target.totalTime = 3000;
            if (!attendanceMap.has(name)) { assignOrderCounter++; attendanceMap.set(name, assignOrderCounter); if(finishedSet.has(name)) finishedSet.delete(name); }
            playUISound('assign'); updateBoxUI(targetIdx); updateStudentStatus(name); updateGauge(name, 3000, 3000);
        }
    }
    saveToStorage();
}

function startTimer(id, isResume = false) {
    const target = timers[id]; 
    if (target.interval) return; 
    
    target.isPaused = false; 

    if (!isResume) {
        initAudio(); playUISound('start'); 
        const now = new Date(); const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        target.startTimeStr = timeStr;
        if(target.student !== "(empty)") { logEvent(target.student, 'start', 'left', 0, timeStr); }
    }
    
    target.lastTick = Date.now();
    target.interval = setInterval(() => {
        const nowTick = Date.now(); const delta = Math.floor((nowTick - target.lastTick) / 1000);
        if (delta >= 1) {
            target.lastTick = nowTick - ((nowTick - target.lastTick) % 1000);
            if (target.remainingTime > 0) {
                target.remainingTime = Math.max(0, target.remainingTime - delta); 
                if (target.student !== "(empty)") updateGauge(target.student, target.remainingTime, target.totalTime); 
                document.getElementById(`display-${id}`).innerText = formatTime(target.remainingTime);
                updateListViewTime(target.student, target.remainingTime, false, 0); 
                if (target.remainingTime === 0 && !target.isOver) triggerAlarm(id);
            } else {
                if (!target.isOver) triggerAlarm(id); 
                target.overTime += delta; document.getElementById(`display-${id}`).innerText = "+" + formatTime(target.overTime);
                updateListViewTime(target.student, 0, true, target.overTime); 
                if (target.overTime >= 300) { finishSession(id); }
            }
            saveToStorage(); 
        }
    }, 250);
    
    if (target.student !== "(empty)") updateStudentStatus(target.student); 
    if (rosterViewMode === 'list') renderListView();
    updateBoxUI(id);
}

function resumeTimer(id) { startTimer(id, true); }

function stopTimer(id) { 
    if (timers[id].interval) { 
        clearInterval(timers[id].interval); timers[id].interval = null; 
        timers[id].isPaused = true; 
        playUISound('stop'); 
        if (timers[id].student !== "(empty)") updateStudentStatus(timers[id].student); 
        if (rosterViewMode === 'list') renderListView();
        updateBoxUI(id); saveToStorage(); 
    } 
}

function clearTime(id) { playUISound('cancel'); timers[id].remainingTime = 0; timers[id].totalTime = 0; timers[id].overTime = 0; timers[id].isOver = false; timers[id].isPaused = false; stopTimer(id); updateBoxUI(id); if(timers[id].student !== "(empty)") updateGauge(timers[id].student, 0, 1); if (rosterViewMode === 'list') renderListView(); saveToStorage(); }
function cancelSession(id) { playUISound('cancel'); const sn = timers[id].student; if(sn !== "(empty)") attendanceMap.delete(sn); resetTimerData(id, true); }
function finishSession(id) { if(timers[id].student === "(empty)") { resetTimerData(id, true); return; } playUISound('finish'); const sn = timers[id].student; finishedSet.add(sn); attendanceMap.delete(sn); logEvent(sn, 'finish', 'right', timers[id].overTime); resetTimerData(id, true); }

function resetTimerData(id, resetUI) { 
    if(timers[id].interval) { clearInterval(timers[id].interval); timers[id].interval = null; }
    const sn = timers[id].student; 
    timers[id] = { student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 }; 
    updateBoxUI(id); 
    if (resetUI && sn !== "(empty)") updateStudentStatus(sn); 
    if (rosterViewMode === 'list') renderListView();
    saveToStorage(); 
}

function adjustTime(id, sec) { playUISound('click'); timers[id].remainingTime = Math.max(0, timers[id].remainingTime + sec); if(timers[id].remainingTime > timers[id].totalTime || timers[id].totalTime === 0) { timers[id].totalTime = timers[id].remainingTime; } if(timers[id].remainingTime > 0) { timers[id].isOver = false; timers[id].overTime = 0; if(timers[id].student !== "(empty)") updateStudentStatus(timers[id].student); } updateBoxUI(id); if (timers[id].student !== "(empty)") updateGauge(timers[id].student, timers[id].remainingTime, timers[id].totalTime); saveToStorage(); }
function updateGauge(studentName, remaining, total) { const btn = document.getElementById("btn-" + studentName); if (!btn) return; const gauge = btn.querySelector(".gauge-bg"); if (!gauge || total <= 0) return; gauge.style.width = (((total - remaining) / total) * 100) + "%"; }
function formatTime(t) { return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; }

// ==========================================
// 7. AUDIO & TTS
// ==========================================
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }

function triggerAlarm(id) { 
    timers[id].isOver = true; if(timers[id].student !== "(empty)") updateStudentStatus(timers[id].student); updateBoxUI(id); 
    let melodyType = parseInt(document.getElementById("melodyType").value); playMelody(melodyType); 
    let ttsName = timers[id].student !== "(empty)" ? timers[id].student : `${id + 1}번 책상`; playAlarmTTS(ttsName); 
}

window.__tts_queue = []; 
if (window.speechSynthesis) { window.speechSynthesis.onvoiceschanged = function() { window.speechSynthesis.getVoices(); }; window.speechSynthesis.getVoices(); }

function playDeskStartTTS(deskNum) {
    if (!window.speechSynthesis) return;
    let voices = window.speechSynthesis.getVoices();
    let u = new SpeechSynthesisUtterance();
    u.volume = ttsVolume; u.rate = 1.05;

    u.text = `Desk number ${deskNum} start`;
    u.lang = 'en-US';
    let enVoice = voices.find(v => v.name.includes('Female') && v.lang.includes('en')) || voices.find(v => v.name.includes('Zira')) || voices.find(v => v.name.includes('Google') && v.lang.includes('en'));
    if (enVoice) u.voice = enVoice;

    window.speechSynthesis.speak(u);
}

function playAlarmTTS(studentName) {
    return new Promise(resolve => {
        const voiceType = document.getElementById("ttsVoiceSelect").value;
        if (voiceType === "0" || !window.speechSynthesis) return resolve();
        let voices = window.speechSynthesis.getVoices(); 
        if (voices.length === 0) { setTimeout(() => playAlarmTTS(studentName).then(resolve), 100); return; }
        window.speechSynthesis.cancel(); 

        const getKoVoice = () => voices.find(v => v.name.includes('Google') && v.lang.includes('ko')) || voices.find(v => v.name.includes('Natural') && v.lang.includes('ko')) || voices.find(v => v.lang.includes('ko'));
        const getEnVoice = () => voices.find(v => v.name === 'Google US English') || voices.find(v => v.lang.includes('en-US')) || voices.find(v => v.lang.includes('en'));

        if (voiceType === "1") { 
            let u = new SpeechSynthesisUtterance(`${studentName}! ${studentName}!`); 
            u.volume = ttsVolume; u.rate = 1.05; u.pitch = 1.1; u.lang = 'ko-KR'; 
            let koVoice = getKoVoice(); if (koVoice) u.voice = koVoice; 
            u.onend = resolve; u.onerror = resolve; window.speechSynthesis.speak(u);
        } else if (voiceType === "2" || voiceType === "3") { 
            let u1 = new SpeechSynthesisUtterance(`${studentName}!`); u1.volume = ttsVolume; u1.rate = 1.05; u1.pitch = 1.1; u1.lang = 'ko-KR';
            let koVoice = getKoVoice(); if (koVoice) u1.voice = koVoice;
            let phrase = voiceType === "2" ? "Let's go home!" : "Time's up! It's time to go home!";
            let u2 = new SpeechSynthesisUtterance(phrase); u2.volume = ttsVolume; u2.rate = 1.05; u2.pitch = 1.1; u2.lang = 'en-US';
            let enVoice = getEnVoice(); if (enVoice) u2.voice = enVoice;
            u2.onend = resolve; u2.onerror = resolve; 
            window.speechSynthesis.speak(u1); window.speechSynthesis.speak(u2);
        }
    });
}

function playMelody(type) {
    return new Promise(resolve => {
        initAudio();
        const melodies = [ [523.25, 659.25, 783.99, 1046.50], [440, 554.37, 659.25, 880], [880, 880, 880, 880], [392, 329.63, 261.63], [261.63, 392, 523.25, 783.99], [1046.5, 0, 1046.5, 0, 1046.5], [1046.5, 1174.66, 1318.51, 1567.98], [130.81, 196.00], [587.33, 739.99, 880], [440, 349.23, 523.25, 493.88], [659.25, 523.25, 659.25, 523.25], [392, 440, 493.88, 523.25, 587.33], [1046.5, 783.99, 523.25], [440, 440, 0, 440, 440], [523.25, 392, 329.63, 261.63], [880, 659.25, 880, 659.25], [261.63, 329.63, 392, 523.25, 659.25], [783.99, 587.33, 440, 349.23], [1046.5, 1046.5, 1046.5, 1046.5, 1046.5], [523.25, 659.25, 587.33, 698.46, 659.25, 783.99], [330, 261, 293, 196, 0, 196, 293, 330, 261], [659, 622, 659, 622, 659, 494, 587, 523, 440], [523, 659, 784, 1046], [392, 330, 0, 392, 330], [1046, 0, 1046, 0, 1046, 0, 1046, 0, 1046] ];
        let notes = melodies[type] || melodies[0]; let now = audioCtx.currentTime; let noteLength = 0.25; 
        if(type === 2 || type === 5 || type === 13 || type === 18 || type === 24) noteLength = 0.15;
        if(type === 20 || type === 21 || type === 22) noteLength = 0.35;
        notes.forEach((freq, i) => {
            if (freq === 0) return;
            let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain();
            osc.type = (type === 2 || type === 9 || type === 18 || type === 24) ? 'square' : 'sine'; osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now + i*noteLength); gain.gain.linearRampToValueAtTime(alarmVolume, now + i*noteLength + 0.02); gain.gain.exponentialRampToValueAtTime(0.01, now + i*noteLength + noteLength);
            osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now + i*noteLength); osc.stop(now + i*noteLength + noteLength);
        });
        setTimeout(resolve, notes.length * noteLength * 1000 + 200);
    });
}

function playUISound(type) {
    if (!audioCtx) initAudio(); const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination); const now = audioCtx.currentTime; let v = uiVolume; if (v === 0) return;
    if (type === 'tab' || type === 'click') {
        let st = parseInt(document.getElementById('uiSoundType')?.value) || 0;
        if(st === 0) { osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.1); gain.gain.setValueAtTime(v * 0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); }
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
    else if (type === 'start') { osc.type = 'square'; osc.frequency.setValueAtTime(440, now); osc.frequency.linearRampToValueAtTime(880, now + 0.1); gain.gain.setValueAtTime(v * 0.08, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); } 
    else if (type === 'stop') { osc.type = 'square'; osc.frequency.setValueAtTime(880, now); osc.frequency.linearRampToValueAtTime(440, now + 0.1); gain.gain.setValueAtTime(v * 0.08, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); } 
    else if (type === 'finish') { osc.type = 'sine'; osc.frequency.setValueAtTime(1046.5, now); gain.gain.setValueAtTime(v * 0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3); } 
    else if (type === 'cancel') { osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(150, now + 0.2); gain.gain.setValueAtTime(v * 0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); osc.start(now); osc.stop(now + 0.2); }
}

let lastTestTime = 0; let ttsTimeout = null;
function previewMelody() { playUISound('click'); let melodyType = parseInt(document.getElementById("melodyType").value); playMelody(melodyType); }
function previewRealtime(type) {
    const now = Date.now();
    if (type === 'alarm') { if (now - lastTestTime > 150) { lastTestTime = now; initAudio(); let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain(); osc.type = 'sine'; osc.frequency.value = 880; gain.gain.value = alarmVolume; osc.connect(gain); gain.connect(audioCtx.destination); osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 0.1); } } 
    else if (type === 'ui') { if (now - lastTestTime > 150) { lastTestTime = now; playUISound('click'); } } 
    else if (type === 'tts') { clearTimeout(ttsTimeout); ttsTimeout = setTimeout(() => { playAlarmTTS("Test"); }, 300); }
}

// ==========================================
// 8. LOGGING & UTILITIES
// ==========================================
function logEvent(student, type, side, overTime = 0, forceTime = null) {
    const now = new Date(); const timeStr = forceTime || `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const obj = { time: timeStr, student: student, type: type, overTime: overTime };
    if (side === 'left') logLeftItems.unshift(obj); else logRightItems.unshift(obj);
    renderLogs(); saveToStorage();
}

function renderLogs() { 
    const t = i18n[currentLang] || i18n.ko;
    const renderItem = (item, index, side) => {
        if (typeof item === 'string') return `<div style="margin-bottom:8px; border-bottom:1px solid var(--border); padding-bottom:5px;">${item}</div>`;
        let actionText = "";
        if (item.type === 'start') actionText = `▶️ ${item.student} ${t.logStartWord}`;
        else if (item.type === 'finish') { const extraStr = item.overTime > 0 ? ` (+${formatTime(item.overTime)})` : ""; actionText = `🏁 ${item.student} ${t.logFinishWord}${extraStr}`; }
        else if (item.type === 'game') actionText = `🎉 <span style="color:var(--accent); font-weight:900;">[이벤트 당첨] ${item.student}</span>`;
        return `<div style="margin-bottom:8px; border-bottom:1px solid var(--border); padding-bottom:5px;">[<span class="editable-log-time" onclick="editLogTime('${side}', ${index})" style="cursor:pointer; text-decoration:underline;" title="클릭하여 시간 수정">${item.time}</span>] ${actionText}</div>`;
    };
    document.getElementById("log-left").innerHTML = logLeftItems.map((item, idx) => renderItem(item, idx, 'left')).join(''); 
    document.getElementById("log-right").innerHTML = logRightItems.map((item, idx) => renderItem(item, idx, 'right')).join(''); 
}

window.editLogTime = function(side, index) {
    const list = (side === 'left') ? logLeftItems : logRightItems; const item = list[index]; if (!item || typeof item === 'string') return;
    let title = item.type === 'start' ? `[${item.student}] 시작 시간 수정` : `[${item.student}] 종료 시간 수정`;
    showTimePrompt(title, item.time, function(newTime) {
        item.time = newTime;
        if(item.type === 'start') { let tIdx = timers.findIndex(t => t.student === item.student); if(tIdx !== -1) timers[tIdx].startTimeStr = newTime; updateStudentStatus(item.student); }
        renderLogs(); saveToStorage();
    });
};

function saveLogAction() { 
    const t = i18n[currentLang] || i18n.ko; const now = new Date(); const dateString = `${now.getFullYear()}. ${now.getMonth()+1}. ${now.getDate()} (${t.days[now.getDay()]})`;
    const formatLogTxt = (item) => {
        if(typeof item === 'string') return item; let actionText = "";
        if (item.type === 'start') actionText = `▶️ ${item.student} ${t.logStartWord}`; else if (item.type === 'finish') actionText = `🏁 ${item.student} ${t.logFinishWord}${item.overTime > 0 ? ' (+'+formatTime(item.overTime)+')' : ''}`; else if (item.type === 'game') actionText = `🎉 [이벤트 당첨] ${item.student}`;
        return `[${item.time}] ${actionText}`;
    };
    const leftTxt = logLeftItems.length > 0 ? logLeftItems.map(formatLogTxt).join('\n') : t.noRecords;
    const rightTxt = logRightItems.length > 0 ? logRightItems.map(formatLogTxt).join('\n') : t.noRecords;
    const logText = `=========================================\n🏫 Academy : ${academyName}\n📚 Class : ${className}\n📅 Date : ${dateString}\n=========================================\n\n--- ▶️ START ---\n${leftTxt}\n\n--- 🏁 FINISH ---\n${rightTxt}\n`;
    const blob = new Blob([logText], {type:'text/plain'}); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${academyName}_${className}_LOG.txt`; a.click(); 
}

function askSoftReset() { const t = i18n[currentLang] || i18n.ko; playUISound('click'); if(confirm(t.alertSoft)) { timers.forEach((t, i) => stopTimer(i)); timers = Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, isPaused: false, lastTick: 0 })); logLeftItems = []; logRightItems = []; attendanceMap.clear(); finishedSet.clear(); assignOrderCounter = 0; guestList = []; renderLogs(); for(let i=0; i<DESK_COUNT; i++) updateBoxUI(i); generateStudents(); saveToStorage(); alert(t.alertResetDone); } }
function askFactoryReset() { const t = i18n[currentLang] || i18n.ko; playUISound('click'); if(confirm(t.alertHard)) { localStorage.removeItem(STORAGE_KEY); alert(t.alertFactoryDone); location.reload(); } }

// ==========================================
// 9. LADDER & ROULETTE GAME LOGIC
// ==========================================
let ladderPlayers = [];
let ladderRungs = [];
let targetWinnerIndex = -1;
let animReq;
let isResultRevealed = false; 
let isGameAnimating = false;

const ladderColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1', '#14b8a6', '#d946ef', '#eab308', '#0ea5e9', '#f43f5e'];

let isBgmOn = true;
let ladderBgmTimer = null;

function toggleBGM() {
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
        if (isBgmOn) startLadderBGM();
        else stopLadderBGM();
    }
}

function startLadderBGM() {
    if(!isBgmOn) return;
    initAudio();
    let tick = 0;
    const notes = [523.25, 659.25, 783.99, 587.33, 659.25, 523.25]; 
    ladderBgmTimer = setInterval(() => {
        if(!audioCtx) return;
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = notes[tick % notes.length];
        gain.gain.setValueAtTime(uiVolume * 0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
        tick++;
    }, 150); 
}

function stopLadderBGM() {
    if(ladderBgmTimer) {
        clearInterval(ladderBgmTimer);
        ladderBgmTimer = null;
    }
}

function setupLadder() {
    playUISound('click');
    
    if(animReq) {
        cancelAnimationFrame(animReq);
        animReq = null;
    }
    stopLadderBGM();
    isGameAnimating = false;

    const canvas = document.getElementById('ladderCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ladderPlayers = timers.filter(t => t.student !== "(empty)").map(t => t.student);
    document.getElementById('gameResult').innerHTML = "";
    
    const btnStart = document.getElementById('btnStartLadder');
    btnStart.innerText = "🚀 사다리 타기 시작!";
    btnStart.onclick = startLadderAnimation;
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
    
    btnStart.style.display = 'block';
}

function generateLadderData() {
    ladderRungs = [];
    const cols = ladderPlayers.length;
    targetWinnerIndex = Math.floor(Math.random() * cols);
    
    const h = document.getElementById('ladderCanvas').height;
    const ySteps = Math.floor(Math.random() * 6) + 12; 
    const yGap = (h - 120) / ySteps;
    
    for(let i=1; i<ySteps; i++) {
        let baseY = 60 + (i * yGap);
        let usedCols = new Set();
        let numRungs = Math.floor(Math.random() * (cols / 1.5)) + 1;
        
        for(let j=0; j<numRungs; j++) {
            let c = Math.floor(Math.random() * (cols - 1));
            if(!usedCols.has(c) && !usedCols.has(c+1)) {
                usedCols.add(c);
                usedCols.add(c+1);
                
                let isDiagonal = Math.random() < 0.45; 
                let tilt = Math.random() * 40 - 20; 
                let yLeft = baseY + (Math.random() * 10 - 5);
                let yRight = isDiagonal ? (yLeft + tilt) : yLeft;
                
                ladderRungs.push({col: c, yLeft: yLeft, yRight: yRight});
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
    
    const lineColor = getComputedStyle(document.body).getPropertyValue('--border').trim() || "#cbd5e1";
    const accentColor = getComputedStyle(document.body).getPropertyValue('--accent').trim() || "#2563eb";

    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    
    ctx.strokeStyle = lineColor;
    for(let i=0; i<cols; i++) {
        let x = (i + 0.5) * spacing;
        ctx.beginPath();
        ctx.moveTo(x, 40);
        ctx.lineTo(x, h - 40);
        ctx.stroke();
    }
    
    for(let i=0; i<ladderRungs.length; i++) {
        let r = ladderRungs[i];
        let x1 = (r.col + 0.5) * spacing;
        let x2 = (r.col + 1.5) * spacing;
        ctx.beginPath();
        ctx.moveTo(x1, r.yLeft);
        ctx.lineTo(x2, r.yRight);
        ctx.stroke();
    }
    
    ctx.font = `bold 42px var(--app-font, 'Pretendard', sans-serif)`;
    ctx.textAlign = "center";
    for(let i=0; i<cols; i++) {
        let x = (i + 0.5) * spacing;
        ctx.fillStyle = ladderColors[i % ladderColors.length];
        ctx.fillText(ladderPlayers[i], x, 35);
    }
    
    ctx.font = `bold 42px var(--app-font, 'Pretendard', sans-serif)`;
    for(let i=0; i<cols; i++) {
        let x = (i + 0.5) * spacing;
        if(!isResultRevealed) {
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted').trim() || "#94a3b8";
            ctx.fillText("?", x, h - 10);
        } else {
            if(i === targetWinnerIndex) {
                ctx.fillStyle = accentColor;
                ctx.fillText("🎁 당첨", x, h - 10);
            } else {
                ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted').trim() || "#94a3b8";
                ctx.fillText("꽝", x, h - 10);
            }
        }
    }
}

function startLadderAnimation() {
    playUISound('click');
    startLadderBGM(); 
    
    document.getElementById('btnStartLadder').style.display = 'none';
    document.getElementById('gameResult').innerHTML = "결과 확인 중...👀";
    isResultRevealed = true; 
    isGameAnimating = true;
    
    if(animReq) cancelAnimationFrame(animReq);
    
    const canvas = document.getElementById('ladderCanvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width; const h = canvas.height;
    const cols = ladderPlayers.length;
    const spacing = w / cols;
    const brandDanger = getComputedStyle(document.body).getPropertyValue('--brand-danger').trim() || "#ef4444";
    
    let colEvents = Array.from({length: cols}, () => []);
    ladderRungs.forEach(r => {
        colEvents[r.col].push({ yMe: r.yLeft, yTarget: r.yRight, targetCol: r.col + 1 });
        colEvents[r.col + 1].push({ yMe: r.yRight, yTarget: r.yLeft, targetCol: r.col });
    });
    colEvents.forEach(events => events.sort((a,b) => a.yMe - b.yMe));

    let paths = []; 
    for(let p=0; p<cols; p++) {
        let curCol = p;
        let curY = 40;
        let path = [{x: (curCol + 0.5) * spacing, y: curY}];
        
        while(true) {
            let nextEvent = colEvents[curCol].find(e => e.yMe > curY + 0.5);
            if(!nextEvent) {
                path.push({x: (curCol + 0.5) * spacing, y: h - 40});
                break;
            }
            path.push({x: (curCol + 0.5) * spacing, y: nextEvent.yMe});
            curCol = nextEvent.targetCol;
            curY = nextEvent.yTarget;
            path.push({x: (curCol + 0.5) * spacing, y: curY});
        }
        
        paths.push({ 
            nodes: path, 
            finalCol: curCol, 
            color: ladderColors[p % ladderColors.length] 
        });
    }
    
    let progress = 0; 
    const speed = 2.0; 
    
    paths.forEach(p => {
        let totalLen = 0;
        for(let i=0; i<p.nodes.length-1; i++) {
            let dx = p.nodes[i+1].x - p.nodes[i].x;
            let dy = p.nodes[i+1].y - p.nodes[i].y;
            totalLen += Math.sqrt(dx*dx + dy*dy);
        }
        p.totalLen = totalLen;
    });
    
    let maxLen = Math.max(...paths.map(p => p.totalLen));
    let isReplay = document.getElementById('btnStartLadder').innerText === "🎬 다시 보기";
    
    function drawFrame() {
        drawStaticLadder(); 
        progress += speed;
        
        ctx.lineWidth = 6;
        ctx.lineJoin = "round";
        
        for(let p=0; p<cols; p++) {
            let pathObj = paths[p];
            let drawnLen = 0;
            
            ctx.strokeStyle = pathObj.color;
            ctx.globalAlpha = 0.8;
            
            ctx.beginPath();
            ctx.moveTo(pathObj.nodes[0].x, pathObj.nodes[0].y);
            
            for(let i=0; i<pathObj.nodes.length-1; i++) {
                let dx = pathObj.nodes[i+1].x - pathObj.nodes[i].x;
                let dy = pathObj.nodes[i+1].y - pathObj.nodes[i].y;
                let segLen = Math.sqrt(dx*dx + dy*dy);
                
                if(drawnLen + segLen < progress) {
                    ctx.lineTo(pathObj.nodes[i+1].x, pathObj.nodes[i+1].y);
                    drawnLen += segLen;
                } else {
                    let remain = progress - drawnLen;
                    let ratio = remain / segLen;
                    ctx.lineTo(pathObj.nodes[i].x + dx*ratio, pathObj.nodes[i].y + dy*ratio);
                    drawnLen = progress;
                    break;
                }
            }
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
        
        if(progress < maxLen) {
            animReq = requestAnimationFrame(drawFrame);
        } else {
            isGameAnimating = false; 
            stopLadderBGM(); 
            
            let winnerPathObj = paths.find(p => p.finalCol === targetWinnerIndex);
            if(winnerPathObj) {
                ctx.strokeStyle = brandDanger; 
                ctx.lineWidth = 12;
                ctx.beginPath();
                ctx.moveTo(winnerPathObj.nodes[0].x, winnerPathObj.nodes[0].y);
                for(let i=0; i<winnerPathObj.nodes.length-1; i++) {
                    ctx.lineTo(winnerPathObj.nodes[i+1].x, winnerPathObj.nodes[i+1].y);
                }
                ctx.stroke();
            }

            let realWinnerName = "";
            for(let p=0; p<cols; p++) {
                if(paths[p].finalCol === targetWinnerIndex) {
                    realWinnerName = ladderPlayers[p];
                    break;
                }
            }
            
            playUISound('finish');
            document.getElementById('gameResult').innerHTML = `🎉 축하합니다! <span style="color:var(--brand-danger)">${realWinnerName}</span> 학생이 당첨되었습니다! 🎉`;
            
            if(!isReplay) {
                logEvent(realWinnerName, 'game', 'right');
            }
            
            const btnStart = document.getElementById('btnStartLadder');
            btnStart.innerText = "🎬 다시 보기";
            btnStart.onclick = startLadderAnimation;
            btnStart.style.display = 'block';
        }
    }
    
    animReq = requestAnimationFrame(drawFrame);
}

function setupRoulette() {
    playUISound('click');
    if(animReq) { cancelAnimationFrame(animReq); animReq = null; }
    stopLadderBGM();
    rouletteSpinning = false;
    isGameAnimating = false;
    
    roulettePlayers = timers.filter(t => t.student !== "(empty)").map(t => t.student);
    document.getElementById('gameResult').innerHTML = "";
    
    const btnStart = document.getElementById('btnStartRoulette');
    btnStart.innerText = "🎡 룰렛 돌리기 시작!";
    btnStart.onclick = startRouletteAnimation;
    btnStart.style.display = 'none';

    const canvas = document.getElementById('rouletteCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if(roulettePlayers.length < 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted') || "#94a3b8";
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
        ctx.font = `bold 60px var(--app-font, 'Pretendard', sans-serif)`;
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 4;
        ctx.fillText(roulettePlayers[i], radius - 20, 0);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, 2 * Math.PI);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-card') || "#fff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent') || "#2563eb";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - radius - 15);
    ctx.lineTo(cx + 18, cy - radius - 15);
    ctx.lineTo(cx, cy - radius + 20);
    ctx.closePath();
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--brand-danger') || "#ef4444";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
}

function startRouletteAnimation() {
    if(rouletteSpinning) return;
    playUISound('start');
    startLadderBGM(); 
    
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
            stopLadderBGM();
            
            const numSlices = roulettePlayers.length;
            const sliceAngle = (2 * Math.PI) / numSlices;
            
            let offsetAngle = ((3 * Math.PI / 2) - rouletteAngle) % (2 * Math.PI);
            if(offsetAngle < 0) offsetAngle += 2 * Math.PI;
            
            const winningIndex = Math.floor(offsetAngle / sliceAngle);
            const winnerName = roulettePlayers[winningIndex];

            playUISound('finish');
            document.getElementById('gameResult').innerHTML = `🎉 축하합니다! <span style="color:var(--brand-danger)">${winnerName}</span> 학생이 당첨되었습니다! 🎉`;
            
            let isReplay = document.getElementById('btnStartRoulette').innerText === "🎬 다시 돌리기";
            if(!isReplay) {
                logEvent(winnerName, 'game', 'right');
            }

            const btnStart = document.getElementById('btnStartRoulette');
            btnStart.innerText = "🎬 다시 돌리기";
            btnStart.onclick = startRouletteAnimation;
            btnStart.style.display = 'block';
        }
    }
    spin();
}

// ==========================================
// 🎮 하드웨어 연동: 무선 리모컨 및 키보드 단축키 수신 이벤트
// ==========================================
let remoteBuffer = "";
let remoteTimer = null;

const remoteCodeMap = {
    "7893409": 0,  // 1번 책상
    "8965601": 1,  // 2번 책상
    "5141409": 2,  // 3번 책상
    "7498145": 3,  // 4번 책상
    "7441889": 4,  // 5번 책상
    "7144865": 5,  // 6번 책상
    "10551201": 6, // 7번 책상
    "8559585": 7,  // 8번 책상
    "8189857": 8,  // 9번 책상
    "2677665": 9   // 10번 책상
};

window.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    if (e.key >= '0' && e.key <= '9') {
        remoteBuffer += e.key;
        clearTimeout(remoteTimer);
        remoteTimer = setTimeout(() => { remoteBuffer = ""; }, 100);

        if (remoteCodeMap[remoteBuffer] !== undefined) {
            let deskIndex = remoteCodeMap[remoteBuffer];
            e.preventDefault();
            if (deskIndex < DESK_COUNT && !timers[deskIndex].interval && !timers[deskIndex].isPaused) {
                simulateHardwareButton(deskIndex);
            }
            remoteBuffer = ""; return;
        }
    } else if (e.key === 'Enter') {
        if (remoteBuffer.length > 0) { e.preventDefault(); remoteBuffer = ""; }
    }

    let isShortcut = (e.ctrlKey && e.altKey) || (e.altKey && !e.ctrlKey) || (e.ctrlKey && e.shiftKey) || (e.metaKey && e.altKey);

    if (isShortcut) {
        let deskIndex = -1;
        if (e.key === '1') deskIndex = 0; else if (e.key === '2') deskIndex = 1; else if (e.key === '3') deskIndex = 2; else if (e.key === '4') deskIndex = 3; else if (e.key === '5') deskIndex = 4; else if (e.key === '6') deskIndex = 5; else if (e.key === '7') deskIndex = 6; else if (e.key === '8') deskIndex = 7; else if (e.key === '9') deskIndex = 8; else if (e.key === '0') deskIndex = 9;

        if (deskIndex !== -1 && deskIndex < DESK_COUNT) {
            e.preventDefault(); 
            if (!timers[deskIndex].interval && !timers[deskIndex].isPaused) { simulateHardwareButton(deskIndex); }
        }
    }
});
