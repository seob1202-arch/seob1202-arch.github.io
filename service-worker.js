const CACHE_NAME = 'kornect-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './Kornect Logo 192X192.png',
  './Kornect Logo 512X512.png'
];

// 1. 설치 (Install): 기본 리소스 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. 활성화 (Activate): 구버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// 3. 요청 (Fetch): 네트워크 우선, 실패 시 캐시 사용 (Network First, then Cache)
self.addEventListener('fetch', (event) => {
  // 웹 앱 내부 요청만 처리 (외부 API 등은 기본 동작)
  if (event.request.mode !== 'navigate') {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // 최신 버전을 가져왔다면 캐시 업데이트
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // 네트워크 실패(오프라인) 시 캐시된 페이지 반환
        return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('./index.html');
        });
      })
  );
});