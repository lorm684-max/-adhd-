const CACHE_NAME = 'duangduang-mobile-v08';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles/main.css',
  './src/lines.js',
  './src/storage.js',
  './src/animations.js',
  './src/state.js',
  './src/calendar.js',
  './src/tasks.js',
  './src/behavior.js',
  './src/ui.js',
  './src/app.js',
  './assets/duangduang/idle.png',
  './assets/duangduang/adhd.png',
  './assets/duangduang/low.png',
  './assets/duangduang/stuck.png',
  './assets/duangduang/anxious.png',
  './assets/duangduang/task.png',
  './assets/duangduang/happy.png',
  './assets/duangduang/failed.png',
  './assets/duangduang/sleep.png',
  './assets/duangduang/smug.png',
  './assets/duangduang/blink_soft.png',
  './assets/duangduang/drag_hang.png',
  './assets/duangduang/pet_happy.png',
  './assets/duangduang/yawn_sleepy.png',
  './assets/duangduang/watch_you.png',
  './assets/duangduang/get_up.png',
  './assets/duangduang/walk_step.png',
  './assets/duangduang/look_back.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
