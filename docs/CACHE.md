# Apex 缓存策略（永久方案）

## 一、三条铁律

### 铁律 1 · HTML 永不缓存
所有 .html 及其 clean URL（/sweet / /privacy / /terms / /status / /announcements）必须 Cache-Control: no-store。
CF Pages 会把 /sweet.html 308 到 /sweet，两者都要写进 _headers。

### 铁律 2 · CSS/JS 用内容 hash 做身份
所有 /src/ 引用必须：以 /src/ 开头（带前导斜杠）；由 scripts/hash-assets.mjs 在 build 时自动加 ?v=<8位sha256>。
满足后 /src/* 可设 immutable（一年缓存），因为内容变 → hash 变 → URL 变。

### 铁律 3 · Service Worker 只是过渡
sw.js 目前是自杀版（清缓存 + 注销），仅用于清理老设备缓存。确认所有活跃设备升级后，删除 sw.js 与 block-01.js 里的注册逻辑。

## 二、日常开发流程
- 改 CSS/JS：push 即生效，无需手改版本号
- 改 HTML：引用写 /src/... 前导斜杠，push 即生效

## 三、CI 自检
scripts/check-cache-refs.sh 扫描 dist/*.html，任何 /src/ 引用缺 ?v= 就报错退出。

## 四、排错清单
1. curl -sL https://apextop.cc.cd/<path> | grep -oE "\?v=[a-f0-9]+"
2. curl -sI https://apextop.cc.cd/<path> 查看 cache-control
3. CF 控制台 Caching → Purge Everything（最后手段）
4. 手机浏览器设置 → 清除网站数据

## 五、改造记录（2026-10-05）
- _headers: /src/* 从 no-cache 改 immutable；补齐 9 个 clean URL no-store
- sweet.html: src/ 改 /src/ 前导斜杠
- 新增 scripts/check-cache-refs.sh
- 新增本文档
