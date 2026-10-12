// サービスワーカー：電波が無いときでもアプリの画面を表示できるようにする仕組み。
// アプリの画面ファイル（HTML・プログラム・アイコン）を iPhone の中に保存しておく。
// ※ ノートの中身は対象外（ノートはアプリ側で別に保存している）
const CACHE = 'nb-app-v3'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  // 同じサイトのファイルだけ扱う（Dropbox との通信は対象外）
  if (e.request.method !== 'GET' || url.origin !== location.origin) return
  e.respondWith(
    // まずネットから最新を取り、取れなければ保存してある分を使う
    fetch(e.request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, copy))
        return res
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  )
})
