//Started with Wittr project from Udacity
var staticCacheName = 'maps-4';
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    clients.claim().then(caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('maps-') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    }))
  );
});

self.addEventListener('fetch', function(event) {
      var url = new URL(event.request.url);
      if(url.origin!==location.origin){

          event.respondWith(fetch(event.request));
          return;
      }
      //Heavy useage of https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
      event.respondWith(
        caches.match(event.request).then(function(response) {
          return response || fetch(event.request).then(function(response){
              return caches.open(staticCacheName).then(function(cache) {
                   cache.put(event.request, response.clone());
                   return response;
               });
          });
      })
  );
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
