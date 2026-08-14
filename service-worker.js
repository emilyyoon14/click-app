// 아주 단순한 서비스 워커예요. PWA로 "설치 가능"해지려면 서비스 워커가 하나 필요해서 만든 거예요.
// 지금은 캐싱 로직 없이 그냥 네트워크로 그대로 요청을 넘겨줘요 (offline 지원은 나중에 필요하면 추가하면 돼요).

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
