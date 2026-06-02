# ST Flow v5.5.0

영어학원 수업 운영을 위한 **타이머 · 출결 · 학생 기록** 웹 앱(PWA)입니다.

## 주요 기능

- **투데이 플로우** — 등원 대기 / 수업 중 / 수업 완료 명단 관리 (드래그 앤 드롭)
- **타이머** — 최대 15개 좌석, 알람·TTS 음성 안내
- **학생 기록** — 월간 개인 기록, 주간 출결, 일일 마감 보고서, 명단 관리
- **설정** — 30종 테마, 백업/복원, 공장 초기화
- **미니 게임** — 룰렛, 사다리 타기

## 실행 방법

별도 빌드 없이 정적 파일로 실행합니다.

### 로컬에서 테스트

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

브라우저에서 `http://localhost:8080` 접속

### GitHub Pages 배포

1. 저장소 Settings → Pages → Source: `main` 브랜치, `/ (root)` 선택
2. `https://<username>.github.io/<repo-name>/` 에서 접속

> Service Worker와 PWA는 **HTTPS** 또는 **localhost** 환경에서 동작합니다.

## 파일 구조

```
├── index.html      # 메인 HTML
├── script.js       # 앱 로직
├── style.css       # 스타일 (30종 테마)
├── sw.js           # Service Worker (오프라인 캐시)
├── manifest.json   # PWA 매니페스트
└── logo.png        # 앱 아이콘
```

## 데이터 저장

모든 설정·명단·기록은 브라우저 **localStorage**에 저장됩니다.  
설정 → **백업 파일 저장 (.json)** 으로 정기 백업을 권장합니다.

## 기술 스택

- Vanilla HTML / CSS / JavaScript
- Web Audio API (알람·효과음)
- Speech Synthesis API (TTS)
- PWA (manifest + Service Worker)

## 라이선스

Designed & Developed by **Tony (ShinJungHoon)**
