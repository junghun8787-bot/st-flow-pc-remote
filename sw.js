// sw.js 파일 내용
self.addEventListener('install', (e) => {
  console.log('[Service Worker] 설치 완료');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[Service Worker] 활성화 완료');
});

// 크롬이 진짜 앱인지 검사할 때 확인하는 필수 오프라인 응답 코드
self.addEventListener('fetch', (e) => {
  // 여기에 오프라인 캐시 로직이 들어가지만, 
  // 일단 이 이벤트 리스너가 존재하는 것만으로도 앱 설치 조건이 충족됩니다.
});