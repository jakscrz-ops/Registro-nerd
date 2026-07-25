self.addEventListener('install', (event) => {
  console.log('Service Worker instalado!');
});

self.addEventListener('fetch', (event) => {
  // Mantem o funcionamento normal da internet
});
