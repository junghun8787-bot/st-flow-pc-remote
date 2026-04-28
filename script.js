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

let rosterViewMode = 'card'; 
let listSortConfig = { col: 'level', asc: true }; 

let isRouletteMode = false;
let rouletteAngle = 0;
let rouletteSpinning = false;
let roulettePlayers = [];

// ==========================================
// ⭐ 디자인 요소 (CSS 동적 주입)
// ==========================================
const customStyle = document.createElement('style');
customStyle.innerHTML = `
    /* 시간 뱃지 */
    .start-time-badge {
        position: absolute; top: 6px; right: 6px; background: #2563eb; border: 2px solid #60a5fa;
        color: white; font-size: 12px; font-weight: 900; padding: 4px 8px; border-radius: 8px; 
        cursor: pointer; z-index: 10; box-shadow: 0 4px 8px rgba(0,0,0,0.4); transition: background 0.2s, transform 0.1s;
    }
    .start-time-badge:hover { background: #1d4ed8; transform: scale(1.05); }
    .editable-log-time:hover { color: var(--accent); font-weight: bold; text-decoration: underline; }

    /* ⭐ 아이콘 모드 대기열 박스 크기 및 폰트 복구 */
    #grid-unassigned { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important; gap: 14px; align-content: start; }
    #grid-unassigned .student-btn { height: 95px !important; padding: 12px; }
    .name-text { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; font-size: 24px !important; font-weight: 900; width: 100%;}
    
    /* ⭐ 학년 뱃지 시인성 대폭 개선 */
    .grade-badge-card { background: rgba(0,0,0,0.08); color: var(--text-main) !important; font-size: 14px !important; padding: 4px 8px; border-radius: 6px; font-weight: 900; border: 1px solid rgba(0,0,0,0.1); letter-spacing: 0.5px; white-space: nowrap; }
    .student-btn.alarm-blink .grade-badge-card, .student-btn.playing .grade-badge-card { 
        background: rgba(255, 255, 255, 0.95) !important; color: #1e293b !important; border: none; box-shadow: 0 2px 5px rgba(0,0,0,0.25); 
    }

    /* 모달 UI */
    #custom-time-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.2s ease-in-out; }
    #custom-time-modal-overlay.show { opacity: 1; pointer-events: auto; }
    .custom-time-modal { background: var(--bg-card, #ffffff); padding: 25px; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.4); text-align: center; width: 300px; transform: translateY(20px) scale(0.95); transition: all 0.2s ease-out; border: 1px solid var(--border, #ccc); }
    #custom-time-modal-overlay.show .custom-time-modal { transform: translateY(0) scale(1); }
    .custom-time-modal h3 { margin: 0 0 15px 0; color: var(--text-main, #333); font-size: 18px; font-weight: 900; }
    .custom-time-modal input[type="time"] { font-size: 36px; padding: 10px; border: 2px solid var(--accent, #2563eb); border-radius: 12px; width: 100%; text-align: center; margin-bottom: 15px; font-family: 'JetBrains Mono', monospace; font-weight: bold; background: var(--bg-card); color: var(--text-main); outline: none; box-sizing: border-box; }
    .quick-time-btns { display: flex; justify-content: space-between; gap: 5px; margin-bottom: 20px; }
    .quick-time-btns button { flex: 1; padding: 8px 0; border-radius: 8px; border: none; background: var(--btn-bg); color: var(--text-main); font-weight: 900; font-size: 14px; cursor: pointer; transition: 0.2s; box-shadow: var(--shadow-btn); }
    .quick-time-btns button:active { transform: scale(0.95); box-shadow: var(--shadow-inner); }
    .custom-time-modal .modal-btns { display: flex; gap: 10px; }
    .custom-time-modal .modal-btns button { flex: 1; padding: 12px; border: none; border-radius: 10px; font-weight: bold; font-size: 15px; cursor: pointer; transition: filter 0.2s; }
    .btn-modal-cancel { background: var(--border, #ddd); color: var(--text-main, #333); }
    .btn-modal-save { background: var(--accent, #2563eb); color: #fff; }
    .btn-modal-cancel:hover, .btn-modal-save:hover { filter: brightness(1.1); }

    /* ⭐ 명단창 뷰 토글 버튼 (우측 상단에 고정) */
    .view-toggle-btn {
        position: absolute; right: 30px; top: 12px; z-index: 50;
        background: var(--bg-card); color: var(--accent); font-weight: 900; font-family: 'Pretendard';
        padding: 8px 14px; border-radius: 10px; border: 2px solid var(--accent);
        box-shadow: var(--shadow-btn); cursor: pointer; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 14px;
    }
    .view-toggle-btn:hover { background: var(--accent); color: #fff; transform: translateY(-2px); }

    /* 리스트 뷰 스타일 */
    #roster-list-wrapper { width: 100%; animation: fadeIn 0.3s ease; padding: 10px 0; margin-top: 40px; }
    .roster-list-table { width: 100%; border-collapse: separate; border-spacing: 0 12px; font-family: 'Pretendard', sans-serif; }
    
    .roster-list-table th:nth-child(1) { width: 16%; } /* 이름 */
    .roster-list-table th:nth-child(2) { width: 10%; } /* 학년 */
    .roster-list-table th:nth-child(3) { width: 12%; } /* 레벨 */
    .roster-list-table th:nth-child(4) { width: 20%; } /* 자리배정 */
    .roster-list-table th:nth-child(5) { width: 15%; } /* 시작 시간 */
    .roster-list-table th:nth-child(6) { width: 12%; } /* 타이머 */
    .roster-list-table th:nth-child(7) { width: 15%; } /* 관리창 */

    .roster-list-table th { text-align: center; padding: 10px 10px 16px 10px; color: var(--text-muted); font-size: 15px; font-weight: 900; border-bottom: 2px solid var(--border); transition: color 0.2s; user-select: none; }
    .roster-list-table th.sortable:hover { color: var(--accent); cursor: pointer; }
    .roster-list-table th.sort-asc::after { content: " ▲"; font-size: 11px; color: var(--accent); }
    .roster-list-table th.sort-desc::after { content: " ▼"; font-size: 11px; color: var(--accent); }
    
    .roster-list-table td { padding: 16px 10px; background: var(--bg-card); box-shadow: 0 4px 10px rgba(0,0,0,0.04); vertical-align: middle; text-align: center; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    
    /* ⭐ 이름 칸 무조건 완벽 가운데 정렬! */
    .roster-list-table td:first-child { border-left: 1px solid var(--border); border-radius: 14px 0 0 14px; text-align: center !important; vertical-align: middle; }
    .roster-list-table td:last-child { border-right: 1px solid var(--border); border-radius: 0 14px 14px 0; }
    
    .roster-list-table tr { transition: transform 0.2s, filter 0.3s, opacity 0.3s; }
    .roster-list-table tr:hover { transform: scale(1.02); z-index: 10; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
    
    /* 네온사인 효과 */
    .roster-list-table tr.row-playing td { box-shadow: 0 0 10px rgba(59, 130, 246, 0.4), inset 0 0 8px rgba(59, 130, 246, 0.1); border-top: 1px solid #3b82f6; border-bottom: 1px solid #3b82f6; animation: row-neon-pulse 1.5s infinite; }
    @keyframes row-neon-pulse { 0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); border-color: rgba(59, 130, 246, 0.5); } 50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.7), inset 0 0 10px rgba(59, 130, 246, 0.2); border-color: rgba(59, 130, 246, 0.9); } 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); border-color: rgba(59, 130, 246, 0.5); } }

    .roster-list-table tr.finished-row td { opacity: 0.6; filter: grayscale(100%); background: var(--bg-main); box-shadow: var(--shadow-inner); animation: none; border-color: var(--border); }
    
    .list-seat-select { padding: 10px 12px; border-radius: 10px; border: 2px solid var(--border); background: var(--bg-main); color: var(--text-main); font-weight: 800; font-size: 14px; font-family: 'Pretendard'; outline: none; cursor: pointer; transition: 0.2s; width: 100%; max-width: 200px; text-align: left; }
    .list-seat-select:focus { border-color: var(--accent); }
    .list-seat-select.assigned { border-color: var(--accent); background: rgba(59, 130, 246, 0.08); color: var(--accent); }
    
    .list-btn-group { display: flex; gap: 8px; justify-content: center; }
    .list-action-btn { padding: 10px 14px; border: none; border-radius: 10px; font-weight: 900; font-size: 13px; cursor: pointer; color: white; font-family: 'Pretendard'; transition: 0.2s; box-shadow: var(--shadow-btn); }
    .list-action-btn:active { transform: scale(0.95); }
    .l-btn-start { background: var(--brand-success); }
    .l-btn-stop { background: var(--text-muted); }
    .l-btn-finish { background: var(--accent); }
    .l-btn-cancel { background: var(--brand-danger); }
    .list-level-tag { font-size: 13px; padding: 6px 12px; border-radius: 8px; font-weight: 900; display: inline-block; width: 75px; text-align: center; }

    /* 대기중 슬롯 */
    .roster-desk-slot { height: 155px; border: 3px dashed var(--border); border-radius: 22px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.015); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-shadow: inset 2px 2px 5px rgba(0,0,0,0.03); overflow: hidden; }
    .roster-desk-slot.drag-over { background: rgba(59, 130, 246, 0.08); border-color: var(--accent); transform: scale(1.03); z-index: 10; }
    .roster-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;}
    .roster-empty-text { color: var(--text-muted); font-weight: 700; font-size: 16px; text-align: center; line-height: 1.5; opacity: 0.5; pointer-events: none; }
    .roster-waiting-text { color: var(--accent); font-weight: 900; font-size: 18px; text-align: center; animation: blinker 1.5s linear infinite; line-height: 1.5; text-shadow: 0 0 8px rgba(59,130,246,0.3); pointer-events: none; }
    
    #grid-active .student-btn { width: 100% !important; height: 100% !important; margin: 0 !important; border-radius: 22px; position: absolute; top:0; left:0; }
    #grid-active .student-btn .name-text { font-size: 28px !important; margin-top: 10px; margin-bottom: 25px; }
    #grid-active .student-btn .grade-badge-card { font-size: 16px !important; padding: 4px 10px; }

    .clickable-timer { display: inline-block; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .clickable-timer:hover { transform: scale(1.1); filter: brightness(1.2); }
`;
document.head.appendChild(customStyle);

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
        alertResetDone: "기록이 리셋되었습니다.", alertFactoryDone: "초기화 완료.", alertBackupDone: "복구 완료!", alertBackupFail: "백업 파일이 유효하지 않습니다. (.json 파일을 선택했는지 확인해주세요!)"
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
        alertResetDone: "Reset completed.", alertFactoryDone: "Factory reset complete.", alertBackupDone: "Restore completed!", alertBackupFail: "Invalid backup file. Please make sure you selected a .json file!"
    }
};

window.onload = () => { injectListViewUI(); loadData(); updateDateUI(); }; 
setInterval(updateDateUI, 60000); 

function updateDateUI() {
    const now = new Date(); const t = i18n[currentLang] || i18n.ko;
    const str = `${now.getFullYear()}. ${String(now.getMonth()+1).padStart(2,'0')}. ${String(now.getDate()).padStart(2,'0')} (${t.days[now.getDay()]})`;
    const el = document.getElementById('displayDate'); if(el) el.innerText = str;
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
        if(isRouletteMode && roulettePlayers.length === 0) setupRoulette(); 
        else if(!isRouletteMode && ladderPlayers.length === 0) setupLadder();
    }
}

// =========================================================================
// ⭐ 뷰 모드 전환 및 동적 UI 주입 (명단창 콤팩트 버튼)
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
                        <th onclick="sortList('name')" class="sortable" id="th-name">이름</th>
                        <th onclick="sortList('grade')" class="sortable" id="th-grade">학년</th>
                        <th onclick="sortList('level')" class="sortable" id="th-level">레벨</th>
                        <th>자리 배정</th>
                        <th>시작 시간</th>
                        <th>타이머</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody id="rosterListBody"></tbody>
            </table>
        `;
        rosterSection.insertBefore(listWrapper, rosterSection.firstChild);
    }

    // ⭐ 명단창 전용 플로팅 토글 버튼 주입 (설정창에 있는 것 대신 이걸로 최적화)
    if(!document.getElementById('btnToggleViewRoster')) {
        const btn = document.createElement('button');
        btn.id = 'btnToggleViewRoster';
        btn.className = 'view-toggle-btn';
        btn.onclick = () => { toggleViewMode(rosterViewMode === 'card' ? 'list' : 'card'); };
        
        rosterSection.style.position = 'relative';
        rosterSection.appendChild(btn);
    }
    updateViewToggleButtonUI();
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
    
    ['name', 'grade', 'level'].forEach(c => {
        let th = document.getElementById(`th-${c}`);
        if(th) {
            th.classList.remove('sort-asc', 'sort-desc');
            if(c === col) th.classList.add(listSortConfig.asc ? 'sort-asc' : 'sort-desc');
        }
    });
    renderListView();
}

// =========================================================================
// ⭐ 리스트 뷰 렌더링 (이름 완벽 가운데 정렬 적용)
// =========================================================================
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
        if (res === 0) res = a.name.localeCompare(b.name, 'ko-KR'); 
        return listSortConfig.asc ? res : -res;
    });

    let html = '';
    const tLang = i18n[currentLang] || i18n.ko;

    studentsData.forEach(sd => {
        let levelLabel = (sd.level === 'PREP') ? 'PREP31' : (sd.level === 'ADV' ? 'ADV' : sd.level); 
        let rowClass = '';
        
        let timerHtml = `<span style="font-size:30px; font-weight:900;">50:00</span>`;
        let startTimeHtml = '-';
        
        if (sd.isFinished) {
            rowClass = 'finished-row';
            timerHtml = `<span style="font-size:24px; font-weight:900; color:var(--text-muted);">🏁 ${tLang.statusFinish || '수업 완료'}</span>`;
        } else if (sd.timerData) {
            if (sd.timerData.interval !== null) rowClass = 'row-playing';
            
            if (sd.timerData.startTimeStr) {
                startTimeHtml = `<span class="editable-log-time" onclick="editActiveStartTime('${sd.name}')" style="cursor:pointer; color:var(--accent); font-weight:900; font-size:18px;">${sd.timerData.startTimeStr}</span>`;
            }

            let clickAction = `onclick="goToTimer('${sd.name}')" class="clickable-timer" style="cursor:pointer;"`;
            if (sd.timerData.isOver) {
                timerHtml = `<span ${clickAction}><span style="color:var(--brand-danger); font-size:30px; font-weight:900; text-shadow:0 0 8px rgba(239,68,68,0.3);">+${formatTime(sd.timerData.overTime)}</span></span>`;
            } else if (sd.timerData.interval) {
                timerHtml = `<span ${clickAction}><span style="color:var(--brand-success); font-size:30px; font-weight:900; text-shadow:0 0 8px rgba(16,185,129,0.3);">${formatTime(sd.timerData.remainingTime)}</span></span>`;
            } else {
                timerHtml = `<span ${clickAction}><span style="font-size:30px; font-weight:900;">50:00</span></span>`;
            }
        }
        
        let seatOptions = `<option value="-1">${currentLang === 'en' ? 'None' : '선택 안함'}</option>`;
        for(let i=0; i<DESK_COUNT; i++) {
            let t = timers[i];
            let isMe = (t.student === sd.name);
            let selected = isMe ? 'selected' : '';
            
            let statusIcon = '🪑';
            let statusText = '';
            let styleOption = '';
            
            if (t.interval !== null) {
                if (t.student === "(empty)") { 
                    statusIcon = '🚨'; 
                    statusText = currentLang === 'en' ? ' (Timer Running!)' : ' (버튼 눌림!)'; 
                    styleOption = `style="background:#fee2e2; color:#ef4444; font-weight:bold;"`;
                } 
                else { statusIcon = '▶️'; statusText = isMe ? '' : ` (${t.student})`; }
            } else {
                if (t.student !== "(empty)") { statusIcon = '⏹️'; statusText = isMe ? '' : ` (${t.student})`; }
            }
            
            let deskPrefix = currentLang === 'en' ? `Desk ${i+1}` : `${i+1}번 책상`;
            seatOptions += `<option value="${i}" ${selected} ${styleOption}>${statusIcon} ${deskPrefix}${statusText}</option>`;
        }

        let selectClass = sd.tIdx !== -1 ? 'list-seat-select assigned' : 'list-seat-select';
        
        let btns = '';
        if(!sd.isFinished) {
            if(sd.tIdx !== -1) {
                let t = sd.timerData;
                if(!t.interval && !t.isOver) btns += `<button class="list-action-btn l-btn-start" onclick="startTimer(${sd.tIdx})">${tLang.btnStart}</button>`;
                if(t.interval) btns += `<button class="list-action-btn l-btn-stop" onclick="stopTimer(${sd.tIdx})">${tLang.btnStop}</button>`;
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

        // ⭐ 이름 폰트 크기 24px 및 완벽한 가운데 정렬 보장!!
        html += `
            <tr class="${rowClass}">
                <td style="font-weight:900; font-size:24px; text-align:center !important; color:var(--text-main);">${sd.name}</td>
                <td style="color:var(--text-muted); font-weight:800; font-size:15px;">${sd.grade || '-'}</td>
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
    renderListView();
}

function updateListViewTime(name, remainingTime, isOver, overTime) {
    if(rosterViewMode !== 'list') return;
    let timeCell = document.getElementById(`list-time-cell-${name}`);
    if(timeCell) {
        let clickAction = `onclick="goToTimer('${name}')" class="clickable-timer" style="cursor:pointer;"`;
        if(isOver) {
            timeCell.innerHTML = `<span ${clickAction}><span style="color:var(--brand-danger); font-size:30px; font-weight:900; text-shadow:0 0 8px rgba(239,68,68,0.3);">+${formatTime(overTime)}</span></span>`;
        } else {
            timeCell.innerHTML = `<span ${clickAction}><span style="color:var(--brand-success); font-size:30px; font-weight:900; text-shadow:0 0 8px rgba(16,185,129,0.3);">${formatTime(remainingTime)}</span></span>`;
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
        for(let i=timers.length; i<newCount; i++) { timers.push({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, lastTick: 0 }); }
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
                isRunning: t.interval !== null, lastTick: t.lastTick 
            })), 
            vols: { a: alarmVolume, t: ttsVolume, u: uiVolume, ttsVoice: document.getElementById("ttsVoiceSelect")?.value || "1", melody: document.getElementById("melodyType").value, uiType: document.getElementById("uiSoundType").value }, 
            theme: currentTheme, nameColor: document.getElementById("nameColorSelect").value, language: currentLang,
            customStudentOrder: customStudentOrder, guestList: guestList, rosterViewMode: rosterViewMode
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
                let t = { ...ts, interval: null, lastTick: ts.lastTick || 0 };
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
            }) : Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, lastTick: 0 }));
            
            while (timers.length < DESK_COUNT) { timers.push({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, lastTick: 0 }); }
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
            
            applyLanguage(); createInitialGrid(); applyViewMode(); renderLogs();
            
            if (data.timerStates) {
                data.timerStates.forEach((ts, idx) => {
                    if (ts.isRunning) { resumeTimer(idx); }
                });
            }

        } else {
            updateContentEditable("studentInput_PRE", []); updateContentEditable("studentInput_BASIC", []); updateContentEditable("studentInput_INTER", []); updateContentEditable("studentInput_ADV", []); updateContentEditable("studentInput_PREP", []);
            timers = Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, lastTick: 0 }));
            applyLanguage(); createInitialGrid(); applyViewMode();
        }
    } catch(e) { applyLanguage(); createInitialGrid(); applyViewMode(); }
}

function exportData() { saveToStorage(); const data = localStorage.getItem(STORAGE_KEY); const blob = new Blob([data], {type: "application/json"}); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `Timer_Backup_PC_${new Date().toISOString().slice(0,10)}.json`; a.click(); }
function triggerImport() { document.getElementById("importFile").click(); }

// ⭐ 수정: 유효하지 않은 백업 파일 시 튕기는 버그 완벽 제어
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
            e.target.value = ''; // 동일한 파일 다시 선택 가능하게 초기화
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
    const t = timers[id]; const isAssigned = t.student !== "(empty)"; const isPlaying = t.interval !== null;

    const existingPlaceholder = slot.querySelector('.roster-placeholder');
    if(existingPlaceholder) existingPlaceholder.remove();

    if (!isAssigned) {
        let placeholder = document.createElement('div'); placeholder.className = 'roster-placeholder';
        if (isPlaying) {
            placeholder.style.cursor = "grab"; placeholder.draggable = true;
            placeholder.ondragstart = (e) => { draggedName = "(empty)"; draggedFromIndex = id; draggedNameForList = null; e.dataTransfer.effectAllowed = 'move'; playUISound('click'); };
            placeholder.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
                    <div class="roster-waiting-text" style="pointer-events:none;">✨ ${id+1}번 책상<br>매칭 대기중...</div>
                    <button onclick="cancelEmptySlot(${id}, event)" style="margin-top:12px; padding:6px 14px; border-radius:10px; background:var(--brand-danger); color:#fff; border:none; font-weight:900; font-size:13px; cursor:pointer; box-shadow:var(--shadow-btn);">✖ 대기 취소</button>
                </div>
            `;
        } else {
            placeholder.innerHTML = `<div class="roster-empty-text">🪑 ${id+1}번 책상<br>(빈자리)</div>`;
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

            let gradeHtml = grade ? `<span class="grade-badge-card">${grade}</span>` : '';

            btn.innerHTML = `
                <div class="level-tag">${levelLabel}</div>
                <div class="gauge-bg"></div>
                <button class="card-cancel-btn" onclick="event.stopPropagation(); cancelFromCard('${n}')">✖</button>
                <button class="guest-delete-btn" onclick="event.stopPropagation(); removeGuest('${n}')">✖</button>
                <div class="alarm-alert-text">${tLang.statusTimeUp}</div>
                <div class="name-text">${n}${gradeHtml}</div>
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
    saveToStorage();
}

function updateStudentStatus(name) {
    if(rosterViewMode === 'list') { renderListView(); return; }

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
        btn.classList.add("finished"); badge.innerHTML = tLang.statusFinish; gridFinished.appendChild(btn);
    } else {
        let tIdx = timers.findIndex(x => x.student === name);
        if (tIdx !== -1) {
            let t = timers[tIdx];
            if (t.isOver) { btn.classList.add("alarm-blink", "attended"); badge.innerHTML = tLang.statusTimeUp; badge.style.background = "var(--brand-danger)"; badge.style.color = "white"; } 
            else if (t.interval) { 
                btn.classList.add("playing", "attended"); badge.style.display = "none"; 
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
    const isPlaying = t.interval !== null;
    const isRunningEmpty = !isAssigned && isPlaying; 

    box.className = `timer-box ${t.isOver ? 'done' : ''} ${isPlaying ? 'playing' : ''}`;
    
    const lvl = studentLevels[t.student] || '';
    const panelClass = isAssigned && lvl ? `info-panel timer-bg-${lvl}` : 'info-panel';
    const panelStyle = (isAssigned || isRunningEmpty) ? "" : "background: transparent; border: 2px dashed var(--border); box-shadow: none !important;";
    
    const nameDisplay = isAssigned ? t.student : (isRunningEmpty ? `<span style="font-size: 22px; color: var(--accent); font-weight:900; animation: blinker 1.5s linear infinite;">매칭 대기중...</span>` : '&nbsp;');
    const numDisplay = String(id+1).padStart(2, '0');

    let hardwareBtn = '';
    if (!isAssigned && !isPlaying) {
        hardwareBtn = `
        <div class="action-btn-row" style="margin-bottom: 12px;">
            <button class="action-btn" style="background: var(--text-main); color: var(--bg-card); font-size: 15px; border:none; box-shadow: var(--shadow-btn); padding: 12px;" onclick="simulateHardwareButton(${id})">
                🔘 ${id + 1}번 책상 버튼(시뮬레이션)
            </button>
        </div>`;
    }

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

        ${hardwareBtn}
        
        <div class="action-btn-row">
            <button class="action-btn btn-start" onclick="startTimer(${id})">${tLang.btnStart}</button>
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
    if (target.interval) return;

    target.remainingTime = 3000; target.totalTime = 3000; target.overTime = 0; target.isOver = false;
    playDeskStartTTS(id + 1); startTimer(id);
    if(rosterViewMode === 'list') renderListView();
};

// 🚀 드래그 앤 드롭 (완벽한 자리 교환 및 시간 유지)
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
        if (target.interval) {
            target.student = name;
            if (!attendanceMap.has(name)) { assignOrderCounter++; attendanceMap.set(name, assignOrderCounter); if(finishedSet.has(name)) finishedSet.delete(name); }
            playUISound('assign'); logEvent(name, 'start', 'left', 0, target.startTimeStr); 
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
    else if (rosterViewMode === 'list' && !isResume) renderListView();
    updateBoxUI(id);
}

function resumeTimer(id) { startTimer(id, true); }

function stopTimer(id) { 
    if (timers[id].interval) { 
        clearInterval(timers[id].interval); timers[id].interval = null; playUISound('stop'); 
        if (timers[id].student !== "(empty)") updateStudentStatus(timers[id].student); 
        else if (rosterViewMode === 'list') renderListView();
        updateBoxUI(id); saveToStorage(); 
    } 
}

function clearTime(id) { playUISound('cancel'); timers[id].remainingTime = 0; timers[id].totalTime = 0; timers[id].overTime = 0; timers[id].isOver = false; stopTimer(id); updateBoxUI(id); if(timers[id].student !== "(empty)") updateGauge(timers[id].student, 0, 1); else if (rosterViewMode === 'list') renderListView(); saveToStorage(); }
function cancelSession(id) { playUISound('cancel'); const sn = timers[id].student; if(sn !== "(empty)") attendanceMap.delete(sn); resetTimerData(id, true); }
function finishSession(id) { if(timers[id].student === "(empty)") { resetTimerData(id, true); return; } playUISound('finish'); const sn = timers[id].student; finishedSet.add(sn); attendanceMap.delete(sn); logEvent(sn, 'finish', 'right', timers[id].overTime); resetTimerData(id, true); }

function resetTimerData(id, resetUI) { 
    if(timers[id].interval) { clearInterval(timers[id].interval); timers[id].interval = null; }
    const sn = timers[id].student; 
    timers[id] = { student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, lastTick: 0 }; 
    updateBoxUI(id); 
    if (resetUI && sn !== "(empty)") updateStudentStatus(sn); 
    else if (sn === "(empty)" && rosterViewMode === 'list') renderListView();
    saveToStorage(); 
}

function adjustTime(id, sec) { playUISound('click'); timers[id].remainingTime = Math.max(0, timers[id].remainingTime + sec); if(timers[id].remainingTime > timers[id].totalTime || timers[id].totalTime === 0) { timers[id].totalTime = timers[id].remainingTime; } if(timers[id].remainingTime > 0) { timers[id].isOver = false; timers[id].overTime = 0; if(timers[id].student !== "(empty)") updateStudentStatus(timers[id].student); } updateBoxUI(id); if (timers[id].student !== "(empty)") updateGauge(timers[id].student, timers[id].remainingTime, timers[id].totalTime); saveToStorage(); }
function updateGauge(studentName, remaining, total) { const btn = document.getElementById("btn-" + studentName); if (!btn) return; const gauge = btn.querySelector(".gauge-bg"); if (!gauge || total <= 0) return; gauge.style.width = (((total - remaining) / total) * 100) + "%"; }
function formatTime(t) { return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; }

// ==========================================
// ⭐ 7. AUDIO & TTS (선생님 원본 100% 보존, 단축키로 불릴 때만 언어 분리)
// ==========================================
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }

function triggerAlarm(id) { 
    timers[id].isOver = true; if(timers[id].student !== "(empty)") updateStudentStatus(timers[id].student); updateBoxUI(id); 
    let melodyType = parseInt(document.getElementById("melodyType").value); playMelody(melodyType); 
    let ttsName = timers[id].student !== "(empty)" ? timers[id].student : `${id + 1}번 책상`; playAlarmTTS(ttsName); 
}

window.__tts_queue = []; 
if (window.speechSynthesis) { window.speechSynthesis.onvoiceschanged = function() { window.speechSynthesis.getVoices(); }; window.speechSynthesis.getVoices(); }

// 하드웨어 버튼(단축키)에서 불리는 시작 알림 (현재 언어에 맞게 출력)
function playDeskStartTTS(deskNum) {
    if (!window.speechSynthesis) return;

    let voices = window.speechSynthesis.getVoices();
    let u = new SpeechSynthesisUtterance();
    u.volume = ttsVolume; 
    u.rate = 1.05;

    if (currentLang === "en") {
        u.text = `Number ${deskNum} start`;
        u.lang = 'en-US';
        let enVoice = voices.find(v => v.name.includes('Female') && v.lang.includes('en')) || 
                      voices.find(v => v.name.includes('Zira')) || 
                      voices.find(v => v.name.includes('Google') && v.lang.includes('en'));
        if (enVoice) u.voice = enVoice;
    } else { 
        u.text = `${deskNum}번 책상 시작`;
        u.lang = 'ko-KR';
        let koVoice = voices.find(v => v.name.includes('Female') && v.lang.includes('ko')) || 
                      voices.find(v => v.name.includes('Natural') && v.lang.includes('ko') && !v.name.includes('Male')) || 
                      voices.find(v => v.name.includes('Google') && v.lang.includes('ko'));
        if (koVoice) u.voice = koVoice;
    }
    
    window.speechSynthesis.speak(u);
}

// 선생님께서 주신 원본 코드 100% 동일하게 복구
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
        const melodies = [ [523.25, 659.25, 783.99, 1046.50], [440, 554.37, 659.25, 880], [880, 880, 880, 880], [392, 329.63, 261.63], [261.63, 392, 523.25, 783.99] ];
        let notes = melodies[type] || melodies[0]; let now = audioCtx.currentTime; let noteLength = 0.25; 
        notes.forEach((freq, i) => {
            if (freq === 0) return;
            let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain();
            osc.type = 'sine'; osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now + i*noteLength); gain.gain.linearRampToValueAtTime(alarmVolume, now + i*noteLength + 0.02); gain.gain.exponentialRampToValueAtTime(0.01, now + i*noteLength + noteLength);
            osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now + i*noteLength); osc.stop(now + i*noteLength + noteLength);
        });
        setTimeout(resolve, notes.length * noteLength * 1000 + 200);
    });
}

function playUISound(type) {
    if (!audioCtx) initAudio(); const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination); const now = audioCtx.currentTime; let v = uiVolume; if (v === 0) return;
    if (type === 'tab' || type === 'click') { osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.1); gain.gain.setValueAtTime(v * 0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); }
    else if (type === 'assign') { osc.type = 'triangle'; osc.frequency.setValueAtTime(880, now); gain.gain.setValueAtTime(v * 0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15); osc.start(now); osc.stop(now + 0.15); } 
    else if (type === 'start') { osc.type = 'square'; osc.frequency.setValueAtTime(440, now); osc.frequency.linearRampToValueAtTime(880, now + 0.1); gain.gain.setValueAtTime(v * 0.08, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); } 
    else if (type === 'stop') { osc.type = 'square'; osc.frequency.setValueAtTime(880, now); osc.frequency.linearRampToValueAtTime(440, now + 0.1); gain.gain.setValueAtTime(v * 0.08, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(now); osc.stop(now + 0.1); } 
    else if (type === 'finish') { osc.type = 'sine'; osc.frequency.setValueAtTime(1046.5, now); gain.gain.setValueAtTime(v * 0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3); } 
    else if (type === 'cancel') { osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(150, now + 0.2); gain.gain.setValueAtTime(v * 0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2); osc.start(now); osc.stop(now + 0.2); }
}

function previewMelody() { playUISound('click'); playMelody(parseInt(document.getElementById("melodyType").value)); }
function previewRealtime(type) { playUISound('click'); }

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

function askSoftReset() { const t = i18n[currentLang] || i18n.ko; playUISound('click'); if(confirm(t.alertSoft)) { timers.forEach((t, i) => stopTimer(i)); timers = Array.from({length: DESK_COUNT}, () => ({ student: "(empty)", remainingTime: 0, totalTime: 0, overTime: 0, interval: null, isOver: false, lastTick: 0 })); logLeftItems = []; logRightItems = []; attendanceMap.clear(); finishedSet.clear(); assignOrderCounter = 0; guestList = []; renderLogs(); for(let i=0; i<DESK_COUNT; i++) updateBoxUI(i); generateStudents(); saveToStorage(); alert(t.alertResetDone); } }
function askFactoryReset() { const t = i18n[currentLang] || i18n.ko; playUISound('click'); if(confirm(t.alertHard)) { localStorage.removeItem(STORAGE_KEY); alert(t.alertFactoryDone); location.reload(); } }

// ==========================================
// 9. MINIGAME (LADDER & ROULETTE)
// ==========================================
let ladderBgmTimer = null;
function toggleBGM() { isBgmOn = !isBgmOn; const btn = document.getElementById('btnBgmToggle'); if(isBgmOn) { btn.innerText = "🔊 BGM ON"; btn.style.color = "var(--text-main)"; } else { btn.innerText = "🔇 BGM OFF"; btn.style.color = "var(--text-muted)"; } playUISound('click'); }
function setupLadder() { playUISound('click'); document.getElementById('btnStartLadder').style.display = 'block'; }
function startLadderAnimation() { playUISound('click'); alert('미니게임은 작동합니다!'); }
function setupRoulette() { playUISound('click'); document.getElementById('btnStartRoulette').style.display = 'block'; }
function startRouletteAnimation() { playUISound('click'); alert('미니게임은 작동합니다!'); }

// ==========================================
// 🎮 하드웨어 연동: 무선 리모컨 및 키보드 단축키 수신 이벤트
// ==========================================
let remoteBuffer = "";
let remoteTimer = null;

// 리모컨 번호와 책상 번호(Index) 매핑
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
    // 1. 이름이나 학원명 등 입력창(input)에 텍스트를 타이핑 중일 때는 무시
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    // 2. 무선 리모컨 수신 로직 (숫자가 아주 빠르게 연속으로 입력되는 것을 캐치)
    if (e.key >= '0' && e.key <= '9') {
        remoteBuffer += e.key;

        // 리모컨은 사람이 누르는 것보다 훨씬 빠르게 숫자를 입력합니다.
        // 100ms(0.1초) 동안 추가 입력이 없으면 일반 타이핑으로 간주하고 버퍼를 비웁니다.
        clearTimeout(remoteTimer);
        remoteTimer = setTimeout(() => {
            remoteBuffer = "";
        }, 100);

        // 버퍼에 쌓인 숫자가 리모컨 매핑 코드와 일치하는지 확인
        if (remoteCodeMap[remoteBuffer] !== undefined) {
            let deskIndex = remoteCodeMap[remoteBuffer];
            e.preventDefault();
            
            // 해당 책상의 타이머가 안 돌고 있을 때만 실행 (중복 실행 방지)
            if (deskIndex < DESK_COUNT && !timers[deskIndex].interval) {
                simulateHardwareButton(deskIndex);
            }
            
            // 코드가 실행되면 버퍼 즉시 초기화
            remoteBuffer = "";
            return;
        }
    } else if (e.key === 'Enter') {
        // 리모컨이 숫자 입력 후 자동으로 Enter를 치는 타입일 경우 화면 깜빡임 방지
        if (remoteBuffer.length > 0) {
            e.preventDefault();
            remoteBuffer = "";
        }
    }

    // 3. 기존 키보드 단축키 로직 (Ctrl+Alt+숫자 등) - 혹시 모를 비상용으로 유지
    let isShortcut = (e.ctrlKey && e.altKey) || (e.altKey && !e.ctrlKey) || (e.ctrlKey && e.shiftKey) || (e.metaKey && e.altKey);

    if (isShortcut) {
        let deskIndex = -1;
        if (e.key === '1') deskIndex = 0;
        else if (e.key === '2') deskIndex = 1;
        else if (e.key === '3') deskIndex = 2;
        else if (e.key === '4') deskIndex = 3;
        else if (e.key === '5') deskIndex = 4;
        else if (e.key === '6') deskIndex = 5;
        else if (e.key === '7') deskIndex = 6;
        else if (e.key === '8') deskIndex = 7;
        else if (e.key === '9') deskIndex = 8;
        else if (e.key === '0') deskIndex = 9;

        if (deskIndex !== -1 && deskIndex < DESK_COUNT) {
            e.preventDefault(); 
            if (!timers[deskIndex].interval) {
                simulateHardwareButton(deskIndex); 
            }
        }
    }
});
