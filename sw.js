var CACHE = 'natgas-demand';
var ASSETS = [
  '/Natgas-Supply/',
  '/Natgas-Supply/index.html',
  '/Natgas-Supply/manifest.json'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Network first, fallback to cache
self.addEventListener('fetch', function(e){
  // Skip non-GET and cross-origin API requests (EIA, Yahoo)
  if(e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if(url.origin !== location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(function(res){
        var clone = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return res;
      })
      .catch(function(){
        return caches.match(e.request);
      })
  );
});
