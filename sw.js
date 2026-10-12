// ST確認 － service worker
// 役割は「インストールできるアプリ」にすることと、電波が弱くても画面だけは開けるようにすること。
// ST検索の結果(script.google.com への問い合わせ)は覚えない。毎回その場で調べる。

const CACHE = 'st-kakunin-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 自分のページの部品だけ:まずネットから取り、だめなら覚えておいたものを使う
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        // 共有で開いたときの ?text=… は付けずに覚える(JANごとに控えが増えないように)
        if (res.ok) caches.open(CACHE).then(c => c.put(url.origin + url.pathname, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
