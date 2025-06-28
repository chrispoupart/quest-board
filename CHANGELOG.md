## [2.1.0](https://github.com/chrispoupart/quest-board/compare/v2.0.3...v2.1.0) (2025-06-28)

### Features

* **auth:** 🔒️ update OAuth flow to handle tokens ([d118308](https://github.com/chrispoupart/quest-board/commit/d1183086fa207687044749ec14e7ed3ea045579d))

## [2.0.3](https://github.com/chrispoupart/quest-board/compare/v2.0.2...v2.0.3) (2025-06-28)

### Bug Fixes

* **authService:** 🔒️ update login redirect URL ([861cd09](https://github.com/chrispoupart/quest-board/commit/861cd0972d55bcb4c91e5a72e4d5e39bb219d86a))

## [2.0.2](https://github.com/chrispoupart/quest-board/compare/v2.0.1...v2.0.2) (2025-06-28)

### Bug Fixes

* **routes:** 🚚 Update auth routes path from '/api' to '/api/auth' ([184d0a4](https://github.com/chrispoupart/quest-board/commit/184d0a4c419beac8935bb59a8acbde84d21155d5))

## [2.0.1](https://github.com/chrispoupart/quest-board/compare/v2.0.0...v2.0.1) (2025-06-28)

### Bug Fixes

* **routes:** 🚚 Change auth route path from '/auth' to '/api' ([21cebf5](https://github.com/chrispoupart/quest-board/commit/21cebf5dc832569f5de4192e96369e27edbd1f91))

## [2.0.0](https://github.com/chrispoupart/quest-board/compare/v1.8.0...v2.0.0) (2025-06-28)

### ⚠ BREAKING CHANGES

* **auth:** 🏗️ migrate from client-side to server-side OAuth flow

### Features

* **auth:** 🏗️ Implement OAuth flow with redirect-based authentication ([e2516fc](https://github.com/chrispoupart/quest-board/commit/e2516fcfe212945db11f780a6bbd2c56cb89f263))
* **auth:** 🏗️ migrate from client-side to server-side OAuth flow ([f926c9d](https://github.com/chrispoupart/quest-board/commit/f926c9df66f0ce9c2fe13cfe29d7a9f3b0d377e8))

## [1.8.0](https://github.com/chrispoupart/quest-board/compare/v1.7.0...v1.8.0) (2025-06-28)

### Features

* **auth:** 🔐 add runtime environment configuration for Google login ([ac86205](https://github.com/chrispoupart/quest-board/commit/ac86205317a3b4f8dfc8b51572c55406e8cc880d))

## [1.7.0](https://github.com/chrispoupart/quest-board/compare/v1.6.1...v1.7.0) (2025-06-28)

### Features

* **frontend:** 🔊 redirect nginx logs to stdout/stderr for containerization ([1eb3ce3](https://github.com/chrispoupart/quest-board/commit/1eb3ce34a97fb1b7c6a67f86720b985dfbc17d6d))

## [1.6.1](https://github.com/chrispoupart/quest-board/compare/v1.6.0...v1.6.1) (2025-06-28)

### Bug Fixes

* **frontend:** 🔨 update nginx config handling in Dockerfile ([2da2676](https://github.com/chrispoupart/quest-board/commit/2da2676a19bde18d5bb9b14542bb72374e29374c))

## [1.6.1](https://github.com/chrispoupart/quest-board/compare/v1.6.0...v1.6.1) (2025-06-28)

### Bug Fixes

* **frontend:** 🔨 update nginx config handling in Dockerfile ([2da2676](https://github.com/chrispoupart/quest-board/commit/2da2676a19bde18d5bb9b14542bb72374e29374c))

## [1.6.0](https://github.com/chrispoupart/quest-board/compare/v1.5.1...v1.6.0) (2025-06-28)

### Features

* **backend:** 🔒️ add non-root user to Dockerfile ([5cacc5b](https://github.com/chrispoupart/quest-board/commit/5cacc5b7a7d3bcc3b6010ae6cca872e9ade41d0a))

## [1.5.1](https://github.com/chrispoupart/quest-board/compare/v1.5.0...v1.5.1) (2025-06-28)

### Bug Fixes

* **backend:** 🔨 update start script path in package.json ([aa8001b](https://github.com/chrispoupart/quest-board/commit/aa8001b9e63e4bf6c67bb2e6deab13844299d41f))
* **backend:** 🚚 update main entry point path in package.json ([6e58699](https://github.com/chrispoupart/quest-board/commit/6e586993275238cb419d9d33da0ea1ab003270bc))

## [1.5.0](https://github.com/chrispoupart/quest-board/compare/v1.4.0...v1.5.0) (2025-06-27)

### Features

* **jobService:** ➕ start scheduled task in node-cron v4 ([02eb54d](https://github.com/chrispoupart/quest-board/commit/02eb54dcc53f530ec8b33d72f91f0e9ee1791e18))

## [1.4.0](https://github.com/chrispoupart/quest-board/compare/v1.3.0...v1.4.0) (2025-06-27)

### Features

* **frontend:** ⚡️ optimize build with manual chunks ([969faeb](https://github.com/chrispoupart/quest-board/commit/969faeb47eba189d02e00c742d437f00c3271589))
* **frontend:** ➕ add alias for @radix-ui/react-tabs ([16e907c](https://github.com/chrispoupart/quest-board/commit/16e907caa3490915515276d3e513b0c7f444304f))
* **frontend:** ➕ add Tailwind CSS Vite plugin ([03e05f8](https://github.com/chrispoupart/quest-board/commit/03e05f8988e04f7e02ef99208af44697caf3e219))
* **frontend:** ➕ add terser dependency ([60a8c6e](https://github.com/chrispoupart/quest-board/commit/60a8c6ea0e563d14b179c6a05862586b8406cd29))

### Bug Fixes

* try vite build before tsc ([1db7129](https://github.com/chrispoupart/quest-board/commit/1db71296386894a5f2c53f24250e35db6f14c4ca))

## [1.3.0](https://github.com/chrispoupart/quest-board/compare/v1.2.0...v1.3.0) (2025-06-27)

### Features

* **backend:** 🛂 add endpoint to get user skill level for admin ([8c665f7](https://github.com/chrispoupart/quest-board/commit/8c665f71eacf1814879bd0434538715900271885))
* **CharacterSheet:** 🏷️ add previousAvatarUrl state for cleanup ([b8876ed](https://github.com/chrispoupart/quest-board/commit/b8876ed58fd1cc6eb494fd3e0ab157b327bce6cb))
* **CharacterSheet:** 💄 add avatar upload with validation ([4720e5b](https://github.com/chrispoupart/quest-board/commit/4720e5b3a7653b3e7f12251ca629ab27cce884b3))
* **questController:** 🧑‍💻 add atomic quest creation with skills ([8e996bf](https://github.com/chrispoupart/quest-board/commit/8e996bf5badeef9947faa840a3bab1592f64d851))
* **skill:** ➕ add endpoint to get user's skill level ([2218b46](https://github.com/chrispoupart/quest-board/commit/2218b469d5648af216ce34c9f409de115f2fba30))
* **skills:** ➕ add endpoint to get available skills ([5462790](https://github.com/chrispoupart/quest-board/commit/5462790ec7c431b780abfc9fca169849574518a8))
* **skills:** 🗃️ add skills system with database and API integration ([f42efa9](https://github.com/chrispoupart/quest-board/commit/f42efa94976c231bcd913482304ab36b026af658))

### Bug Fixes

* **CharacterSheet:** 🩹 stop upload on invalid image selection ([b3625e5](https://github.com/chrispoupart/quest-board/commit/b3625e569a0903f5ef447a293661397d4634b88a))
* **questController:** 🔒️ add skill validation for quest claims ([26fef4e](https://github.com/chrispoupart/quest-board/commit/26fef4eb4d0442d74ed1d77a0a2bc4a6943c5b92))

## [1.2.0](https://github.com/chrispoupart/quest-board/compare/v1.1.0...v1.2.0) (2025-06-27)

### Features

* **frontend:** ➕ add build dependencies to Dockerfile ([854b828](https://github.com/chrispoupart/quest-board/commit/854b828b5a17a2ec14fe7dd0a0d239ace16ea2d6))

## [1.1.0](https://github.com/chrispoupart/quest-board/compare/v1.0.0...v1.1.0) (2025-06-27)

### Features

* **backend:** 🏗️ implement multi-stage Docker build for production ([b0f4bd1](https://github.com/chrispoupart/quest-board/commit/b0f4bd189df6beec61dc7451969b85b25bf6ec40))

## 1.0.0 (2025-06-27)

### Features

* **admin:** 🛂 add admin panel with role management ([b8695b1](https://github.com/chrispoupart/quest-board/commit/b8695b1b47bb120812d7a9f71c8e966bdcb0ed3f))
* **auth:** 🛂 add Google OAuth2 login and token refresh ([2ef8cf3](https://github.com/chrispoupart/quest-board/commit/2ef8cf399003d4a551e1a2a511937022f2e54b52))
* **backend:** ✨ add pagination and filtering to quest retrieval ([4acf326](https://github.com/chrispoupart/quest-board/commit/4acf3264561b4458f9d77943ce487176151a6ee1))
* **backend:** 🔒️ update Node.js to version 20 for security ([51e7d6a](https://github.com/chrispoupart/quest-board/commit/51e7d6afb146777dad2f9c28fd4b2ffbb6ea5e11))
* **ci:** add build and semantic release workflows ([c3e4c27](https://github.com/chrispoupart/quest-board/commit/c3e4c27e2c4b0afc53c18caff4791360d169f770))
* **containers:** 🧱 add production docker setup ([cf5c37f](https://github.com/chrispoupart/quest-board/commit/cf5c37f30f17255d7d7030a60daa9ad97a1c2c02))
* **dashboard:** 🎉 add dashboard controller and routes ([bb79255](https://github.com/chrispoupart/quest-board/commit/bb79255c5e3a49476bc3091d4c42c205f699a492))
* **dashboard:** 💄 add new dashboard component with enhanced UI ([d5331df](https://github.com/chrispoupart/quest-board/commit/d5331dfd8bb3d70104bfe933d4a2db381e5c44b2))
* **dashboard:** 💬 update quest status ([c42ef10](https://github.com/chrispoupart/quest-board/commit/c42ef10d0aa847191ea3bdfff64f82beaf01413c))
* **frontend:** 🎉 add initial setup for Quest Board app ([6baa525](https://github.com/chrispoupart/quest-board/commit/6baa5250cf73572655f39c5438d9bc989f192894))
* initialize project with backend and frontend setup ([766197f](https://github.com/chrispoupart/quest-board/commit/766197f93409f75acff72896e9bd7129179b4420))
* **jobs:** 🧑‍💻 add job management and scheduling system ([10e580d](https://github.com/chrispoupart/quest-board/commit/10e580db5f4942df50871d72f714b0a60b294514))
* **quest-board:** 💄 add quest details modal for improved UX ([cc002ac](https://github.com/chrispoupart/quest-board/commit/cc002acd31f66b0fc80e876b10b7ef41fa5286f5))
* **quests:** 🗃️ add repeat functionality with cooldown support ([3b25a22](https://github.com/chrispoupart/quest-board/commit/3b25a22bd1e00293f80eff4f9ab715c84ef02a35))
* **quests:** 🧑‍💻 implement quest controller and routes ([b1e7029](https://github.com/chrispoupart/quest-board/commit/b1e7029615b8fe7aaedb54150c4f61822d14b257))
* **store:** 💄 add store functionality with UI components ([3840bbb](https://github.com/chrispoupart/quest-board/commit/3840bbb78193aaab3eb87b286fe0070c67a65efe))
* **ui:** 💄 add quest board component with fantasy theme ([13224a2](https://github.com/chrispoupart/quest-board/commit/13224a20fec7cd03c81ef08ad3d74473682e8177))
* **users:** 🗃️ add character customization and experience system ([b9ce3a1](https://github.com/chrispoupart/quest-board/commit/b9ce3a15e411461c729d7280d369b7dfb9d2d230))
* **users:** 🛂 add user management and authentication ([34e749d](https://github.com/chrispoupart/quest-board/commit/34e749d24d84333fe7968c6cb943f3e2aabb29da))

### Bug Fixes

* **userController:** 🏷️ update level calculation logic ([6611e51](https://github.com/chrispoupart/quest-board/commit/6611e51b9c975743b398cd60922233da4f6bc52c))
