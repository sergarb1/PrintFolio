/* sw.js - Service Worker para PrintFolio */
const CACHE = 'printfolio-v1';
const URLs = [
  '/PrintFolio/',
  '/PrintFolio/index.html',
  '/PrintFolio/css/style.css',
  '/PrintFolio/js/i18n.js',
  '/PrintFolio/js/renderer.js',
  '/PrintFolio/js/export.js',
  '/PrintFolio/js/app.js',
  '/PrintFolio/lib/vue.global.prod.js',
  '/PrintFolio/lib/jspdf.umd.min.js',
  '/PrintFolio/img/favicon.svg',
  '/PrintFolio/img/logo.svg',
  '/PrintFolio/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(URLs))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
