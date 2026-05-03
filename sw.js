/**
 * Service Worker for UG编程助手 PWA
 */

const CACHE_NAME = 'ug-assistant-v2.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/main.css',
  '/css/toolbar.css',
  '/css/panel.css',
  '/css/table.css',
  '/css/form.css',
  '/css/chat.css',
  '/js/app.js',
  '/js/modules/tool-db.js',
  '/js/modules/mach-template.js',
  '/js/modules/smart-rec.js',
  '/js/modules/prog-sheet.js',
  '/js/modules/ai-advisor.js',
  '/js/modules/work-coord.js',
  '/js/modules/settings.js',
  '/js/data/tools.json',
  '/js/data/templates.json',
  '/js/data/materials.json',
  '/js/data/onepass.json'
];

// 安装事件
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 请求拦截
self.addEventListener('fetch', (event) => {
  // 只处理同源请求
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // 返回缓存，同时更新缓存
          event.waitUntil(
            fetch(event.request)
              .then((response) => {
                if (response && response.status === 200) {
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(event.request, response));
                }
              })
              .catch(() => {})
          );
          return cachedResponse;
        }
        
        // 无缓存，从网络获取
        return fetch(event.request)
          .then((response) => {
            // 缓存有效响应
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // 网络失败，返回离线页面
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// 消息处理
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
