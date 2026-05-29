# 🌟 ST Flow (Smart 3D Edition)

**ST Flow**는 학원 및 교실 환경에 최적화된 스마트 학생 관리 및 맞춤형 타이머 솔루션입니다. 직관적인 드래그 앤 드롭 인터페이스, 다이내믹한 3D UI, 그리고 학생들의 출결과 학습 시간을 완벽하게 추적하는 기능까지 하나의 웹 애플리케이션에 모두 담았습니다. 

Designed & Developed by **Tony (ShinJungHoon)**

---

## ✨ 주요 기능 (Key Features)

### 1. 📋 직관적인 학생 명단 관리 (Smart Roster)
* **3단 분할 레이아웃:** [대기 명단] - [수업 중] - [수업 완료 / 휴원]으로 학생의 현재 상태를 한눈에 파악할 수 있습니다.
* **드래그 앤 드롭:** 대기 명단에서 빈자리로 학생 카드를 끌어다 놓기만 하면 즉시 타이머가 시작됩니다.
* **맞춤형 레벨 & 모디파이어:** 학생별 레벨(PRE, BASIC, INTER, ADV, PREP31 등)을 시각적으로 구분하고, 쿠폰(시간 단축) 및 벌칙(시간 연장) 배지를 쉽게 부여할 수 있습니다.
* **뷰 모드 지원:** 아이콘(카드) 뷰와 엑셀 형식의 리스트 뷰를 자유롭게 전환할 수 있습니다.

### 2. ⏰ 다이내믹 스마트 타이머 (Dynamic Timer)
* **개별 맞춤 타이머:** 각 학생의 목표 학습 시간에 맞춰 타이머가 작동하며, 일시정지, 재개, 시간 연장/단축이 자유롭습니다.
* **시각 및 청각 피드백:** 시간이 종료되면 네온 효과와 함께 화면이 깜빡이며, 지정된 알람 멜로디와 함께 TTS(음성 합성)로 학생의 이름을 호명합니다.
* **하드웨어 리모컨 연동:** 1~10번 책상에 무선 리모컨 고유번호를 매핑하여 원격으로 타이머를 제어할 수 있습니다.

### 3. 📊 완벽한 출결 및 학습 기록 (History & Analytics)
* **월간/주간/일일 뷰:** 학생 개인별 월간 학습 기록, 전체 학생의 주간 출결 기록, 그리고 일일 마감 보고서를 한눈에 확인할 수 있습니다.
* **자동 시간 로깅:** 타이머가 시작되고 종료된 시간이 자동으로 기록되며, 교사가 수동으로 보정할 수도 있습니다.
* **엑셀 및 텍스트 내보내기:** 기록된 주간/월간 데이터는 `.csv` 파일로, 일일 마감 보고서는 `.txt` 파일로 쉽게 내보내어 학부모 상담 및 학원 행정에 활용할 수 있습니다.

### 4. 🎲 집중력 향상을 위한 미니 게임 (Mini Games)
* **사다리 타기 & 복불복 룰렛:** 현재 수업 중인 학생들을 대상으로 랜덤 이벤트를 진행할 수 있는 화려한 애니메이션 게임이 내장되어 있습니다. BGM과 드럼롤 사운드가 수업의 활력을 더합니다.

### 5. 🎨 완벽한 커스터마이징 (Customization)
* **30종의 컬러 테마:** 계절 및 브랜드 컬러(Selena Pink 등)를 포함한 30가지 테마를 제공합니다.
* **사운드 제어:** UI 클릭음, 알람 멜로디(25종), TTS 음성 안내 방식을 취향에 맞게 설정할 수 있습니다.
* **폰트 선택:** 시스템 전체의 글꼴을 10가지(Pretendard, 배민 주아체 등) 중에서 선택하여 교실 분위기에 맞출 수 있습니다.

---

## 🚀 시작하기 (Getting Started)

1. **실행 방법:** `index.html` 파일을 최신 웹 브라우저(Chrome, Edge, Safari 권장)에서 엽니다.
2. **앱 설치 (PWA):** 브라우저 주소창 우측의 '앱 설치' 버튼을 클릭하면 데스크톱이나 태블릿에서 독립된 앱처럼 사용할 수 있습니다. (오프라인 캐싱 지원)
3. **초기 설정:** * [설정] 탭으로 이동하여 학원 이름, 반 이름, 사용할 타이머 개수(기본 10개)를 설정합니다.
   * 학생 명단 관리에서 원생들의 이름, 학년, 레벨, 기본 수업 시간을 등록하고 저장합니다.
4. **데이터 백업:** 시스템 제어 메뉴에서 `.json` 파일로 모든 데이터를 안전하게 로컬에 백업하고 복구할 수 있습니다.

---

## 🛠 기술 스택 (Tech Stack)
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Features:** HTML5 Canvas (게임 애니메이션), Web Audio API (사운드 제어), Web Speech API (TTS), Drag and Drop API
* **Storage:** LocalStorage API
* **PWA:** Service Worker (`sw.js`), Web App Manifest

# 🌟 ST Flow (Smart 3D Edition)

**ST Flow** is a highly interactive, smart classroom management system and customizable timer solution tailored for academies and classrooms. It combines a seamless drag-and-drop interface, dynamic 3D UI, and comprehensive attendance and time-tracking analytics into one powerful web application.

Designed & Developed by **Tony (ShinJungHoon)**

---

## ✨ Key Features

### 1. 📋 Smart Roster Management
* **3-Column Layout:** Instantly track student statuses through [Waiting List] - [In Class] - [Finished / Absent] columns.
* **Drag and Drop:** Simply drag a student card from the waiting list to an empty desk slot to instantly start their lesson timer.
* **Custom Levels & Modifiers:** Visually distinguish students by their levels (PRE, BASIC, INTER, ADV, PREP31, etc.) and easily apply 'Coupons' (time reduction) or 'Penalties' (time extension).
* **View Modes:** Toggle seamlessly between an icon-based Card View and a spreadsheet-style List View.

### 2. ⏰ Dynamic Smart Timer
* **Individualized Timers:** Each timer is tailored to the student's specific target lesson duration. Supports pausing, resuming, and manual time adjustments.
* **Visual & Audio Feedback:** When time is up, the UI alerts with a glowing neon effect, plays a customizable alarm melody, and uses TTS (Text-to-Speech) to announce the student's name.
* **Hardware Remote Integration:** Map unique wireless remote control codes to desks 1–10 to control the timers remotely from across the classroom.

### 3. 📊 Comprehensive History & Analytics
* **Monthly/Weekly/Daily Views:** Access individual monthly records, weekly class-wide attendance grids, and daily summary reports at a glance.
* **Auto Time-Logging:** Start and end times are recorded automatically, with the option for teachers to manually edit logs.
* **Data Export:** Easily export weekly and monthly data to `.csv` format, or download the daily summary as a `.txt` file for parent consultations and administrative use.

### 4. 🎲 Engaging Mini-Games
* **Ladder Game & Roulette:** Built-in, animated mini-games designed to select random students currently in class for special events or rewards. Complete with BGM and sound effects to boost classroom engagement.

### 5. 🎨 Ultimate Customization
* **30 Color Themes:** Choose from 30 vibrant themes, including seasonal palettes and brand-specific colors.
* **Audio Setup:** Fully customize UI click sounds, select from 25 alarm melodies, and configure TTS voice assistants (Korean/English).
* **Font Selection:** Match your classroom's vibe by choosing from 10 different web fonts.

---

## 🚀 Getting Started

1. **How to Run:** Open the `index.html` file in any modern web browser (Chrome, Edge, Safari recommended).
2. **Install as App (PWA):** Click the "Install App" icon in the browser's address bar to use ST Flow as a standalone desktop or tablet application with offline support.
3. **Initial Setup:** * Navigate to the [Settings] tab to input your Academy Name, Class Name, and desired number of timers (default is 10).
   * Manage your roster by adding student names, grades, levels, and base lesson durations.
4. **Data Backup:** Safely backup and restore all your classroom data locally via a `.json` file in the System Control menu.

---

## 🛠 Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Features:** HTML5 Canvas (Animations), Web Audio API (Sound generation), Web Speech API (TTS), Drag and Drop API
* **Storage:** LocalStorage API
* **PWA:** Service Worker (`sw.js`), Web App Manifest
