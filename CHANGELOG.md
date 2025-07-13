## [2.27.0](https://github.com/chrispoupart/quest-board/compare/v2.26.0...v2.27.0) (2025-07-13)

### Features

* **db:** introduce case-insensitive search for quests ([3c1fd5c](https://github.com/chrispoupart/quest-board/commit/3c1fd5ce99c2ed2c301db92cbe7d8a044596007b))

## [2.26.0](https://github.com/chrispoupart/quest-board/compare/v2.25.0...v2.26.0) (2025-07-12)

### Features

* **authorization:** 🛂 add role-based quest filtering ([a081738](https://github.com/chrispoupart/quest-board/commit/a081738932c1d824fb905c6017adb523a4547d97))

## [2.25.0](https://github.com/chrispoupart/quest-board/compare/v2.24.0...v2.25.0) (2025-07-10)

### Features

* **jobs:** 🛂 Add notify-admins-pending-approvals job handler ([4f9e403](https://github.com/chrispoupart/quest-board/commit/4f9e403dfd13144c2448fa398096d42b973404fa))
* **notifications:** 🚩 add scheduled job to notify admins of pending approvals ([96e1b90](https://github.com/chrispoupart/quest-board/commit/96e1b90ddb9d6dd97b6724e2c4bd0b220fbc0387))

### Bug Fixes

* **admin:** 🩹 add fallback options for quest user assignment ([9de1509](https://github.com/chrispoupart/quest-board/commit/9de1509a9ddf17a25a8b9e7258d0ec5671f5dee7))

## [2.24.0](https://github.com/chrispoupart/quest-board/compare/v2.23.0...v2.24.0) (2025-07-10)

### Features

* **quests:** 👔 implement consistent personalizedFor field for user assignment ([06e22ed](https://github.com/chrispoupart/quest-board/commit/06e22ed205e13954315c602fc9544918a7684c3a))

## [2.23.0](https://github.com/chrispoupart/quest-board/compare/v2.22.0...v2.23.0) (2025-07-10)

### Features

* **controllers:** 🚸 add user profile fields to API responses ([6bf4b8a](https://github.com/chrispoupart/quest-board/commit/6bf4b8ae3d1c484be940f0d97bdf907cbbcf0f8f))
* **quest-board:** 💄 add quest age visualization with dots ([942a897](https://github.com/chrispoupart/quest-board/commit/942a8978e6d6c097d504a7fcf1698265a18128c2))

## [2.22.0](https://github.com/chrispoupart/quest-board/compare/v2.21.0...v2.22.0) (2025-07-09)

### Features

* **ci:** 👷 Add Dependabot auto-merge workflow ([c91e961](https://github.com/chrispoupart/quest-board/commit/c91e961da901983aa2e5ca85a17abf3b3c7206fc))
* **quests:** 💄 add due date functionality to quest system ([887f5db](https://github.com/chrispoupart/quest-board/commit/887f5dbdbb3128e0b4017e595f2ec8e20515ab3c))
* **quests:** 🗃️ add due date field and expiration handling ([65cb896](https://github.com/chrispoupart/quest-board/commit/65cb896844d03433704d9134bd43c520eca0754f))
* **ui:** 👤 prioritize character name in user displays ([78f67a1](https://github.com/chrispoupart/quest-board/commit/78f67a1567718dafb247dddb21f1d82c4659c0a3))
* **workflow:** 🚩 Remove condition for Dependabot auto-merge ([01df955](https://github.com/chrispoupart/quest-board/commit/01df955e0866e0c9e0e542bc6406561d1aeac1d7))

### Bug Fixes

* **form:** 🦺 add validation for empty due date strings ([4d8a277](https://github.com/chrispoupart/quest-board/commit/4d8a277d3c774bbed80e7e14ba9e42e82a0c1008))
* **modal:** 🩹 Always set userId to null when not a number in edit mode ([db4adf2](https://github.com/chrispoupart/quest-board/commit/db4adf2705c24f59e90439468d56e570582c81b5))
* **sort:** 🚸 Update dueDate ordering to properly handle null values ([38e1a62](https://github.com/chrispoupart/quest-board/commit/38e1a62d1faa4055652a4304fa28476b8574f4a0))

## [2.21.0](https://github.com/chrispoupart/quest-board/compare/v2.20.0...v2.21.0) (2025-07-06)

### Features

* **dashboard:** 💫 add quest navigation with search pre-population ([cb4e1bb](https://github.com/chrispoupart/quest-board/commit/cb4e1bb843e4494a81c0db274e66045b0bf23896))
* **leaderboard:** 🏷️ add userId to bounty aggregation ([4493b37](https://github.com/chrispoupart/quest-board/commit/4493b37a96f6fc6c95dfd2818b288acd1b0d0b61))
* **notification-system:** enhance otification system ([8bdc6cf](https://github.com/chrispoupart/quest-board/commit/8bdc6cf845493adc3de77ae433d7f85b6b7350a9))
* **swagger:** 🎨 add file extension based on environment ([a11b423](https://github.com/chrispoupart/quest-board/commit/a11b423d7cf5a4aab3562d13831beb0096982c1c))

## [2.20.0](https://github.com/chrispoupart/quest-board/compare/v2.19.2...v2.20.0) (2025-07-05)

### Features

* **admin:** 💄 add Delete button in quest edit form ([8dfc7d5](https://github.com/chrispoupart/quest-board/commit/8dfc7d5f1546a8895cd668b2835f6e558cd548af))
* **admin:** 🚚 Move clone quest button to edit form interface ([68182d7](https://github.com/chrispoupart/quest-board/commit/68182d71ed611c67c4e850b6ad7990a0573eb0e9))
* **api:** 📝 add Swagger documentation for API endpoints ([0f99208](https://github.com/chrispoupart/quest-board/commit/0f99208ade0c31968d05c4fac903de5b728522ba))
* **dashboard:** 📊 integrate dashboardService for user quest stats ([d6a3576](https://github.com/chrispoupart/quest-board/commit/d6a3576b08206af5b365ee9b527a2733edca88a4))

### Bug Fixes

* **admin:** 👽️ update skill requirements API call ([43c1ea6](https://github.com/chrispoupart/quest-board/commit/43c1ea60a6f43544c7421ab0d63b4d2cf6e56f4d))
* **admin:** 🥅 fetch quest skill requirements from API for consistency ([965419b](https://github.com/chrispoupart/quest-board/commit/965419bad05076ff4b0b0bd547a8ef36172accd1))
* **frontend:** 🐛 Refresh skills before showing form ([31b15f8](https://github.com/chrispoupart/quest-board/commit/31b15f8bad433e0042a3f192d8ccfd46388b687a))

## [2.19.2](https://github.com/chrispoupart/quest-board/compare/v2.19.1...v2.19.2) (2025-07-04)

### Performance Improvements

* **search:** ⚡️ Optimize quest search with manual case conversion ([d020ae2](https://github.com/chrispoupart/quest-board/commit/d020ae295b46aa3b6eb06886a851254e900c044f))

## [2.19.1](https://github.com/chrispoupart/quest-board/compare/v2.19.0...v2.19.1) (2025-07-04)

### Bug Fixes

* **api:** 👽️ Update quest approval/rejection to match API changes ([42b6235](https://github.com/chrispoupart/quest-board/commit/42b6235f2c6a88cc4b256502c00bdb45329ea421))
* **search:** 🔍️ Implement case-insensitive search for quest queries ([fb2f53f](https://github.com/chrispoupart/quest-board/commit/fb2f53f866e60bcb052af8ca1c9996712fbaaa8c))
* **search:** 🔍️ remove case insensitive mode from quest search queries ([bf192cf](https://github.com/chrispoupart/quest-board/commit/bf192cf4bf0a36ef8bce254e94502f5c7d53f342))

## [2.19.0](https://github.com/chrispoupart/quest-board/compare/v2.18.0...v2.19.0) (2025-07-04)

### Features

* **quest:** ✨ add rejection reason display for claimed quests ([b64f387](https://github.com/chrispoupart/quest-board/commit/b64f387246e6da6333076c4ba8ee3b8c57f1d8a2))

### Bug Fixes

* **auth:** 🛂 Update user identification from name to ID in quest claims ([d2c183c](https://github.com/chrispoupart/quest-board/commit/d2c183c00d16477f7255044c0c30b0c322ede0cf))
* **quest:** 🚸 Keep rejected quests in CLAIMED state and show rejection reason ([7d0cefb](https://github.com/chrispoupart/quest-board/commit/7d0cefb2a3f1a7183434210e9bef4478e50fc5ef))

## [2.18.0](https://github.com/chrispoupart/quest-board/compare/v2.17.1...v2.18.0) (2025-07-04)

### Features

* **quest:** 🗃️ add group pool and quest rejection reasons ([2327597](https://github.com/chrispoupart/quest-board/commit/23275972af51feded7781d4aa1516261aad8d563))

### Bug Fixes

* **quest-board:** 🩹 Update pending quests status filter to PENDING_APPROVAL ([2475931](https://github.com/chrispoupart/quest-board/commit/2475931a144a389f2e1b87dbfbcd44a54202cad4))

## [2.17.1](https://github.com/chrispoupart/quest-board/compare/v2.17.0...v2.17.1) (2025-07-04)

### Performance Improvements

* **admin:** ⚡️ implement lazy loading for AdminPanel component ([16d8457](https://github.com/chrispoupart/quest-board/commit/16d8457ae34ba901f7211e767143c1761ccd3ae7))

## [2.17.0](https://github.com/chrispoupart/quest-board/compare/v2.16.1...v2.17.0) (2025-07-04)

### Features

* **modal:** 🚸 add quest cloning functionality to QuestEditModal ([3eeecb8](https://github.com/chrispoupart/quest-board/commit/3eeecb8ea0adaa97b1269b4091e105ca50c652a7))
* **quests:** 💄 add quest edit modal for admin and editor users ([900e793](https://github.com/chrispoupart/quest-board/commit/900e79373050ce12316f6ffe2a8ffac1fe5716d1))
* **quests:** 📋 add ability to clone quests for admins and editors ([4bbbe23](https://github.com/chrispoupart/quest-board/commit/4bbbe236d60a628345a22c0cfe2d381978fc6514))
* **ui:** 💄 add claimer information display to quest components ([0ed8466](https://github.com/chrispoupart/quest-board/commit/0ed846618901ed47feb7c9c6016f808d734df7b8))
* **ui:** 💄 display assigned users for quests to admin/editor roles ([122a9aa](https://github.com/chrispoupart/quest-board/commit/122a9aabf84241ea1a93d7bef7b09443377d9a2a))

## [2.16.1](https://github.com/chrispoupart/quest-board/compare/v2.16.0...v2.16.1) (2025-07-03)

### Bug Fixes

* **quest:** 🩹 Use null instead of undefined for userId in quest assignments ([8b3b9c3](https://github.com/chrispoupart/quest-board/commit/8b3b9c362c57efb4453136e90bf5723ce15afd1f))
* **quests:** 👔 user-assigned quests not properly created ([4711ebd](https://github.com/chrispoupart/quest-board/commit/4711ebd31e106c0d8f336815f1329e49ee3f96f8))

## [2.16.0](https://github.com/chrispoupart/quest-board/compare/v2.15.0...v2.16.0) (2025-07-03)

### Features

* **header:** 💄 add Scroll icon to Quest Board logo ([31b73be](https://github.com/chrispoupart/quest-board/commit/31b73beb1281a69bd801758edce2291fbf5b4d27))
* **quest:** 💸 Add bounty bonus when users level up ([fdb55eb](https://github.com/chrispoupart/quest-board/commit/fdb55eb6c4ff9af4a9253c9ac32a8b65b9f80f88))

### Bug Fixes

* **notification:** 🥅 prevent notification errors from breaking main flow ([16abea5](https://github.com/chrispoupart/quest-board/commit/16abea5453fb67707bb8dcf0c12fff24ae19dce9))
* **quest:** 👔 update quest status flow for repeatable and non-repeatable quests ([555e264](https://github.com/chrispoupart/quest-board/commit/555e26429043a9c87a59eaace4dd209696ff4355))
* **quest:** 🧵 implement database transactions for quest operations ([0686990](https://github.com/chrispoupart/quest-board/commit/0686990925315f1ac518050a3667106222a9e4d9))

## [2.15.0](https://github.com/chrispoupart/quest-board/compare/v2.14.0...v2.15.0) (2025-07-03)

### Features

* **quest:** 💸 add bounty bonus reward for user level-up ([7789c87](https://github.com/chrispoupart/quest-board/commit/7789c87548ac8f102fc7a035cf553fa155a4e51f))
* **ui:** 💄 add level and experience progress card to character sheet ([e91feab](https://github.com/chrispoupart/quest-board/commit/e91feabd2ee7b89dfef5d8a0ad417612e41fa27c))

## [2.14.0](https://github.com/chrispoupart/quest-board/compare/v2.13.0...v2.14.0) (2025-07-03)

### Features

* **dashboard:** 🏆 Add monthly leaderboard section ([87fd025](https://github.com/chrispoupart/quest-board/commit/87fd0259f3eb0ed717d6aa5ce30c94129a9cc13c))

### Bug Fixes

* **api:** 👽️ update userService to match new API response structure ([85ed505](https://github.com/chrispoupart/quest-board/commit/85ed5052f8cef7fef13c3adeb998e0c5e25fe89e))

## [2.13.0](https://github.com/chrispoupart/quest-board/compare/v2.12.0...v2.13.0) (2025-07-03)

### Features

* **quests:** 👔 Add personalized quest assignment functionality ([5ebf9b9](https://github.com/chrispoupart/quest-board/commit/5ebf9b953b1fdecb2551c09e6b64bd92de2b0123))
* **quests:** 👔 add personalized quests functionality ([9b678c4](https://github.com/chrispoupart/quest-board/commit/9b678c4d8371de46296bc502c7f1fae32d485814))

## [2.12.0](https://github.com/chrispoupart/quest-board/compare/v2.11.0...v2.12.0) (2025-07-03)

### Features

* **db:** 🗃️ add automated database backup functionality ([98f2e86](https://github.com/chrispoupart/quest-board/commit/98f2e863ccec8422ce0c8153ea06ab7b85f3f5e4))
* **db:** 🗃️ add database backup script and CLI entry point ([1a6ad3d](https://github.com/chrispoupart/quest-board/commit/1a6ad3d9c4501e82593a90106c1e26fd34550ba1))
* **frontend:** 💄 add Leaderboard component with tests ([c82e0e7](https://github.com/chrispoupart/quest-board/commit/c82e0e799ac2a1ae69f78d1f42660b37805f38cf))
* **leaderboard:** 📈 add monthly quest leaderboard endpoint ([f7ef904](https://github.com/chrispoupart/quest-board/commit/f7ef9048cfacbad34f7bd1fe274759de41b083aa))
* **rewards:** ✨ add rewards configuration system for admins ([9a20add](https://github.com/chrispoupart/quest-board/commit/9a20add193be897118e16ee2e0cc8271e679dc39))
* **rewards:** 📈 add collective progress API endpoint for quarterly tracking ([633852b](https://github.com/chrispoupart/quest-board/commit/633852b75cec1407e17e7fa08dae2e3cf0ef9723))
* **rewards:** 🗃️ add reward configuration model and bounty leaderboard ([fe4c381](https://github.com/chrispoupart/quest-board/commit/fe4c381281b5aa8ef3c24888da6e6016834b8286))

### Bug Fixes

* **api:** 🚚 Update API endpoint paths with /api prefix ([f2703cc](https://github.com/chrispoupart/quest-board/commit/f2703cc7c89fd2ca802a355a67ee988f954802c2))
* **db:** 🏗️ improve path resolution for database backup functionality ([d5f17d4](https://github.com/chrispoupart/quest-board/commit/d5f17d4dcf5b7bbb84a0f0366085d649d642273c))
* **rewards:** 🎨 improve default config handling and validation logic ([0752ba3](https://github.com/chrispoupart/quest-board/commit/0752ba32d18734a983a0f6008728eb59385c5443))

## [2.11.0](https://github.com/chrispoupart/quest-board/compare/v2.10.1...v2.11.0) (2025-07-02)

### Features

* **backend:** 🛂 add pagination for admin skill retrieval ([82be10d](https://github.com/chrispoupart/quest-board/commit/82be10da3bd200fc8864d76f5f8dfbc3d2ba503b))

### Bug Fixes

* **userService:** 🩹 fix user data structure in API response ([bf63baa](https://github.com/chrispoupart/quest-board/commit/bf63baa7c2f8ba4476e8da7156f74e4b0ed2fd05))

## [2.10.1](https://github.com/chrispoupart/quest-board/compare/v2.10.0...v2.10.1) (2025-07-02)

### Bug Fixes

* **authService:** 🦺 fix user data extraction from API response ([5351d57](https://github.com/chrispoupart/quest-board/commit/5351d57b9a3f5ace1410c37a0362c6b19fa98702))

## [2.10.0](https://github.com/chrispoupart/quest-board/compare/v2.9.0...v2.10.0) (2025-07-01)

### Features

* **backend:** 🎉 add notification system for user alerts ([7957ea7](https://github.com/chrispoupart/quest-board/commit/7957ea778e993e4ff98d0ed67975c8d259f99cef))
* **notification:** 💄 add notification components and services ([e4e54ef](https://github.com/chrispoupart/quest-board/commit/e4e54ef845421646107df939e56a3a1339cf9bfb))
* **prisma:** 🗃️  add notifications and update transactions schema ([228112f](https://github.com/chrispoupart/quest-board/commit/228112f4ad2566f2c11be79366d3835a42c30897))

### Bug Fixes

* **auth:** 🔒️ implement Google authentication for login ([c8dad30](https://github.com/chrispoupart/quest-board/commit/c8dad30cbfa2abb01a25aa45b7c3fd6b176f2d9e))
* **skillController:** 🔒️ validate skill ID from URL params ([e2542e9](https://github.com/chrispoupart/quest-board/commit/e2542e9bb91e0a36df58e48f0946162d4497eab4))
* **skillController:** 🦺 handle skillId from params or body ([6eb1626](https://github.com/chrispoupart/quest-board/commit/6eb16262bff0b3f995e37f1e329d73da90ef6956))

## [2.9.0](https://github.com/chrispoupart/quest-board/compare/v2.8.0...v2.9.0) (2025-06-30)

### Features

* **frontend:** 🍱 add PWA assets and social media metadata ([f71a2af](https://github.com/chrispoupart/quest-board/commit/f71a2af019857f26af4f9d4e6d6b50a6091e2a42))

## [2.8.0](https://github.com/chrispoupart/quest-board/compare/v2.7.0...v2.8.0) (2025-06-29)

### Features

* **backend:** 🗃️ run migrations before starting the app ([b75d81f](https://github.com/chrispoupart/quest-board/commit/b75d81f3945beb7e67f6601b23c9b9de9213975d))
* **quest-board:** 💄 add mobile dropdown for tab selection ([2bfd476](https://github.com/chrispoupart/quest-board/commit/2bfd47644485fad994618ffa96fe5238a2459a75))
* **quests:** 💄 handle repeatable quest completion status ([08263e6](https://github.com/chrispoupart/quest-board/commit/08263e622ea2dd4161148f4e45079f2afd309ae6))
* **quests:** 🗃️ add quest completion tracking and history retrieval ([787c1a2](https://github.com/chrispoupart/quest-board/commit/787c1a2090051a3c3473db6f109d0611e4f210ee))
* **SkillManagement:** 💄 add skill level inputs and update UI ([9a35e4d](https://github.com/chrispoupart/quest-board/commit/9a35e4d8dcd72ad780f4d87439b65c373796cc8d))

### Bug Fixes

* **quest:** 🩹 prevent duplicate completion display ([376460f](https://github.com/chrispoupart/quest-board/commit/376460ff436f58f7a45a692754a0b1277ccf74ac))

## [2.7.0](https://github.com/chrispoupart/quest-board/compare/v2.6.0...v2.7.0) (2025-06-29)

### Features

* **auth:** make access token expiry configurable and extend session ([6c1e8f1](https://github.com/chrispoupart/quest-board/commit/6c1e8f1dc4dcc0592e30da5fb45f7515242eff78))
* **authService:** 🔐 add refresh token secret validation ([2d282c6](https://github.com/chrispoupart/quest-board/commit/2d282c619f892fa0f5a71f36cc952e398cf991a5))
* **header:** simplify header UI layout ([d3ea882](https://github.com/chrispoupart/quest-board/commit/d3ea8824a7a5280ce64a13b8feed95a96d74bab3))
* **theme:** finish implementing dynamic themes ([ae86448](https://github.com/chrispoupart/quest-board/commit/ae864483baeee7af25d8023dc69998dbc35d27b6))

### Bug Fixes

* **admin:** 💄 add mobile dropdown for admin tabs ([fa0adad](https://github.com/chrispoupart/quest-board/commit/fa0adadc8b1e5088957d402e590abd5ff01fd59d))
* **authService:** add type assertion to jwt sign options ([91df32f](https://github.com/chrispoupart/quest-board/commit/91df32f0bd1a6efecf95e85d6422c011a6252840))
* **authService:** prevent infinite loops in token refresh logic ([7024366](https://github.com/chrispoupart/quest-board/commit/7024366a5eabb9e9d705f013d40b10d50510adea))
* **CharacterSheet:** 🦺 handle updateUser function safely ([87fa0fb](https://github.com/chrispoupart/quest-board/commit/87fa0fbf2acb8837f6ce2e187548ff08490096bb))
* **frontend:** 🔒️ update API proxy to include auth and users ([331d316](https://github.com/chrispoupart/quest-board/commit/331d316ed4bba5602856bcf141dbf27cd4922e9a))
* **frontend:** 🔒️ update nginx config for API proxy handling ([87077b2](https://github.com/chrispoupart/quest-board/commit/87077b2431788dabc781daa517775a77e907db02))
* **frontend:** 🔥 remove trailing slash from proxy_pass URL ([76ed272](https://github.com/chrispoupart/quest-board/commit/76ed272b8ccb225f0269787adf6b07ca9da298f8))
* **frontend:** 🔨 exclude /auth/callback from proxying ([057e812](https://github.com/chrispoupart/quest-board/commit/057e81216c227fd6e1dc69f0b36c40a2fa6d2f35))
* **header:** improve responsive design for navigation ([84e0e56](https://github.com/chrispoupart/quest-board/commit/84e0e56706f41a153bdf0d00fc1b5e1d4b5f7bed))
* **quest-board:** 💄 update border colour for requirement status ([7385d7d](https://github.com/chrispoupart/quest-board/commit/7385d7d8a385d610b3891676ab72a91475bac3cc))
* **ui:** Add font styling to TabsTrigger ([3a5b2af](https://github.com/chrispoupart/quest-board/commit/3a5b2af4a53ef27dbbc436410457d26170a1a367))

## [2.6.0](https://github.com/chrispoupart/quest-board/compare/v2.5.0...v2.6.0) (2025-06-29)

### Features

* **header:** simplify header UI layout ([fd4858c](https://github.com/chrispoupart/quest-board/commit/fd4858c5a7882cd415fdbbc5a53bc92ec57fa190))
* **theme:** finish implementing dynamic themes ([c1f6037](https://github.com/chrispoupart/quest-board/commit/c1f6037b1c27445546bd4727af4ecdd43431f833))

### Bug Fixes

* **admin:** 💄 add mobile dropdown for admin tabs ([875d4ed](https://github.com/chrispoupart/quest-board/commit/875d4ed22b2e5da8a5e5541351eb926c6051208d))
* **CharacterSheet:** 🦺 handle updateUser function safely ([4c13bd1](https://github.com/chrispoupart/quest-board/commit/4c13bd18f4668e1e5b9755594384fbcc08220d3a))
* **frontend:** 🔒️ update API proxy to include auth and users ([d1bfdd6](https://github.com/chrispoupart/quest-board/commit/d1bfdd68459ba70ddcb926d19f7978c3697d75ef))
* **frontend:** 🔒️ update nginx config for API proxy handling ([dd45253](https://github.com/chrispoupart/quest-board/commit/dd45253b47b27648d68f428c74a28c3ca3730ffb))
* **frontend:** 🔥 remove trailing slash from proxy_pass URL ([f2902bf](https://github.com/chrispoupart/quest-board/commit/f2902bf0e49787a23b9c41ec853fa70e2a076ee7))
* **frontend:** 🔨 exclude /auth/callback from proxying ([492830f](https://github.com/chrispoupart/quest-board/commit/492830f71c47c2b5b50a604e8d3af8ce5a41f1e0))
* **header:** improve responsive design for navigation ([5936eeb](https://github.com/chrispoupart/quest-board/commit/5936eebdde559ad19bf1bb2857918c7140cb6164))
* **quest-board:** 💄 update border colour for requirement status ([46e1275](https://github.com/chrispoupart/quest-board/commit/46e12752c703230af52dc84c825ae25778619711))
* **ui:** Add font styling to TabsTrigger ([0b3ccd6](https://github.com/chrispoupart/quest-board/commit/0b3ccd618f45f17d2ab80b8a388851385c0fcf7c))

## [2.5.0](https://github.com/chrispoupart/quest-board/compare/v2.4.1...v2.5.0) (2025-06-29)

### Features

* **theme:** 💄 add theme toggle and context for dynamic theming ([b25c94e](https://github.com/chrispoupart/quest-board/commit/b25c94e64a92439b38d2e08901cbcd3825d0deb3))

### Bug Fixes

* **header:** 💄 add mobile navigation menu ([93590e2](https://github.com/chrispoupart/quest-board/commit/93590e212ec27909565416c17e1557ad491ca5d7))
* **header:** 💄 update character route to profile ([03e74b9](https://github.com/chrispoupart/quest-board/commit/03e74b98811a684c74b9922641788acbab6b0a7d))
* **header:** 💄 update navigation link to quests ([60b77c5](https://github.com/chrispoupart/quest-board/commit/60b77c5eaa3d42f0e6fb591513a21c8c573d564a))
* **quest-board:** 💄 add admin/editor approval buttons for quests ([46c0078](https://github.com/chrispoupart/quest-board/commit/46c0078ac7e23605412501c753f4aa6b3090bd02))
* **store:** 💄 update balance display to use bountyBalance ([5766504](https://github.com/chrispoupart/quest-board/commit/5766504af72c708609371185bceeb76f885aef9c))

## [2.4.1](https://github.com/chrispoupart/quest-board/compare/v2.4.0...v2.4.1) (2025-06-29)

### Bug Fixes

* **ui:** update styles for improved visual consistency ([1f47ec1](https://github.com/chrispoupart/quest-board/commit/1f47ec149a5aff651dde4a035461a75bd265bdbf))

## [2.4.0](https://github.com/chrispoupart/quest-board/compare/v2.3.0...v2.4.0) (2025-06-29)

### Features

* **pagination:** 💄 add pagination to quest management ([dbc0535](https://github.com/chrispoupart/quest-board/commit/dbc0535571a129c00ac53f7dc6c2047567c3ca4b))

## [2.3.0](https://github.com/chrispoupart/quest-board/compare/v2.2.0...v2.3.0) (2025-06-28)

### Features

* **header:** 💄 add responsive mobile navigation menu ([defcac0](https://github.com/chrispoupart/quest-board/commit/defcac074b48a5c2556cc0014db9ca4b7a977ed0))

### Bug Fixes

* **header:** 💄 update UI structure for desktop navigation ([c73bffb](https://github.com/chrispoupart/quest-board/commit/c73bffbad1994d4f2541544c180aa7b4e68b0e6d))

## [2.2.0](https://github.com/chrispoupart/quest-board/compare/v2.1.8...v2.2.0) (2025-06-28)

### Features

* **scripts:** 🔨 update promote-admin script execution method ([d939f6c](https://github.com/chrispoupart/quest-board/commit/d939f6c832a56842ad511f1b75192d686f2d4ec4))
* **scripts:** 🛂 add promote-to-admin script ([2958a37](https://github.com/chrispoupart/quest-board/commit/2958a37f3e02db1a0c8f46cf28ba681327573a84))

### Bug Fixes

* **Dockerfile:** 🚚 update script copy path in Dockerfile ([dbb44a9](https://github.com/chrispoupart/quest-board/commit/dbb44a92ca49e5233feccc4ac77b17906a79b029))

## [2.1.8](https://github.com/chrispoupart/quest-board/compare/v2.1.7...v2.1.8) (2025-06-28)

### Bug Fixes

* **services:** 🎨 update API base URL handling for env ([9ccd180](https://github.com/chrispoupart/quest-board/commit/9ccd180420de0a29ef1439c425a4b22427e56e2b))

## [2.1.7](https://github.com/chrispoupart/quest-board/compare/v2.1.6...v2.1.7) (2025-06-28)

### Bug Fixes

* **frontend:** 🔒️ add auth proxy to nginx config ([8789a87](https://github.com/chrispoupart/quest-board/commit/8789a87d06fe9ca1a530a4b996de3ad1e04c27a0))

## [2.1.6](https://github.com/chrispoupart/quest-board/compare/v2.1.5...v2.1.6) (2025-06-28)

### Bug Fixes

* **frontend:** 🔥 remove redundant API path segment ([0a011ed](https://github.com/chrispoupart/quest-board/commit/0a011edad648846aa674d9e3330d210671dd8aca))

## [2.1.5](https://github.com/chrispoupart/quest-board/compare/v2.1.4...v2.1.5) (2025-06-28)

### Bug Fixes

* **services:** 🔒️ update API base URL logic for environments ([405e549](https://github.com/chrispoupart/quest-board/commit/405e549116dfe126dfc6018d3ad00b566643db60))

## [2.1.4](https://github.com/chrispoupart/quest-board/compare/v2.1.3...v2.1.4) (2025-06-28)

### Bug Fixes

* **authService:** 🔒️ update API endpoints for secure routing ([5e742b0](https://github.com/chrispoupart/quest-board/commit/5e742b0af30d75ace915346a9cf2c5ac25821a76))

## [2.1.3](https://github.com/chrispoupart/quest-board/compare/v2.1.2...v2.1.3) (2025-06-28)

### Bug Fixes

* **auth:** 🚚 update API endpoints and add logging ([5d47f5d](https://github.com/chrispoupart/quest-board/commit/5d47f5d44deadf3aaf7d1dd23884fa3d1ecf26fb))
* **dashboardService:** 🏷️  Update getUserStats return type ([d8bdc00](https://github.com/chrispoupart/quest-board/commit/d8bdc00ad1abdd204756d5a18887ade41e8d166f))
* **dashboardService:** 🩹 update dashboard API endpoint path ([982e2f6](https://github.com/chrispoupart/quest-board/commit/982e2f61e947fed2cfb14120d93431df6f77bdf7))
* **questService:** 👽️ update API endpoint path ([fb7c84f](https://github.com/chrispoupart/quest-board/commit/fb7c84fc93a233c83271684cd6ae23b0c0e95a11))

## [2.1.2](https://github.com/chrispoupart/quest-board/compare/v2.1.1...v2.1.2) (2025-06-28)

### Bug Fixes

* **frontend:** 🔀 update API proxy path in nginx config ([e13fb67](https://github.com/chrispoupart/quest-board/commit/e13fb677df7f52523def8da8a4ca0c30287c3570))

## [2.1.1](https://github.com/chrispoupart/quest-board/compare/v2.1.0...v2.1.1) (2025-06-28)

### Bug Fixes

* **auth:** 🔥 remove AuthCallback component ([aa9c3a0](https://github.com/chrispoupart/quest-board/commit/aa9c3a049f7c1907d3d7cfac2f0cb7f62df441c9))

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
