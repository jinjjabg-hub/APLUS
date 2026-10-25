# 에이쁠종합청소 홈페이지 (시안)

**목적**: 청소는 결과를 미리 볼 수 없는 서비스라서, 이 홈페이지는 고객의 불안을 덜고 견적 문의까지 이어지게 만드는 것을 목표로 합니다. 광고비 없이 지역 검색(네이버·구글)과 AI 검색에서 문의를 받는 구조입니다.

## 3줄 사용법
1. **열어보기**: `npm run preview`를 실행한 뒤 `preview/index.html`을 더블클릭합니다. 서버로 보려면 `npm run serve`를 실행하고 http://localhost:4000 에 접속합니다.
2. **수정하기**: 업체 정보는 `site.config.mjs`, 서비스 문구·요금·FAQ는 `src/content.mjs`, 색은 `src/assets/style.css` 맨 위에서 고칩니다. 채울 항목은 `TODO.md`에 있습니다.
3. **배포하기**: main 브랜치에 올라가면 GitHub Actions가 자동으로 점검하고 https://jinjjabg-hub.github.io/APLUS/ 에 배포합니다. 다른 곳에 올리려면 `npm run build`로 생긴 `dist/` 폴더를 https://app.netlify.com/drop 에 끌어다 놓으면 됩니다.

## 디자인 기준
- 첫 화면 전체를 영상으로 채우고, 그 위에 명조체 제목 한 줄만 둡니다.
- 카드 나열 대신 큰 글씨 목록, 실제 종이 검수표, 전후 비교 슬라이더, 큰 숫자 요금으로 구성했습니다.
- 글꼴: 제목 Noto Serif KR(명조), 본문 Pretendard(사이트에 직접 포함, WOFF2)
- 색: 짙은 녹흑 #0B1513, 청록 #0F6B62, 금색 포인트 #D99A2B, 카카오 노랑
- 시안 속 AI 생성 사진과 확인되지 않은 인증 문구는 쓰지 않았습니다(`TODO.md` C항목).

## 첫 화면 영상 넣는 법
1. 현장에서 가로로 10~20초 찍습니다. 예: 창틀 흡진, 스팀 세척, 정돈된 거실을 천천히 패닝. 사람 얼굴이 나오면 동의를 받으세요.
2. `npm run video -- 원본파일.mp4 3 12`를 실행합니다. 3초부터 12초 분량을 자동으로 잘라 압축합니다.
   - 결과: `src/assets/hero.mp4`(PC, 약 1~2MB), `hero-m.mp4`(모바일 세로), `hero-poster.webp`(첫 장면)
3. git에 올리면 자동으로 배포됩니다. 영상 파일이 없으면 영상 대신 어두운 배경이 천천히 움직입니다.

## 왜 순수 HTML인가
설치할 것이 없고(Node만 있으면 됨), 결과물이 정적 파일이라 어떤 호스팅에도 올라갑니다. 서버 비용과 유지보수 부담이 없습니다.

## 폴더 구조
```
site.config.mjs     업체 정보 (여기만 고치면 전체 반영)
src/content.mjs     서비스·약속·진행과정·FAQ 문구
src/pages.mjs       페이지 구성
src/layout.mjs      SEO 메타태그, 헤더/푸터, 견적 폼
src/assets/         CSS, JS, 아이콘, OG 이미지
scripts/            build(빌드) · check(링크·용량 점검) · serve(미리보기) · make-og(OG 이미지)
```

## 명령어
| 명령 | 하는 일 |
|---|---|
| `npm run build` | `dist/` 생성 (배포용) |
| `npm run preview` | `preview/` 생성 (더블클릭으로 열 수 있는 버전) |
| `npm run serve` | 빌드 후 http://localhost:4000 에서 미리보기 |
| `npm run check` | 빌드 후 깨진 링크 점검 + 페이지 용량 측정 |
| `npm run og` | 업체명·지역을 바꾼 뒤 공유 이미지(og.jpg)를 다시 생성 (Playwright 필요) |

## 견적 폼 접수 방식
서비스 → 공간 → 일정 → 연락처, 4단계로 진행됩니다. 마지막 단계에서 입력 내용이 정리된 문장으로 만들어집니다.
- **카카오톡으로 보내기**: 내용을 자동으로 복사한 뒤 카카오톡 채널 대화창을 엽니다. 고객이 붙여넣기만 하면 접수됩니다.
- **문자로 보내기**: 휴대폰 문자앱에 내용이 미리 채워진 상태로 열립니다.
- 구글 시트에 자동으로 쌓이게 하려면 나중에 Google Apps Script를 연결하면 됩니다(서버 불필요).

## 사진 넣는 법
1. 사진을 WebP 형식(가로 800px 이하, 장당 150KB 이하)으로 변환합니다. 무료 도구: https://squoosh.app
2. `src/assets/photos/`에 저장합니다. 예: `move-in-kitchen-before.webp`
3. `src/layout.mjs`의 `photoSlots`에서 `<div class="slot">...</div>` 부분을 아래 코드로 바꿉니다.
   `<img src="/assets/photos/move-in-kitchen-before.webp" alt="입주청소 전 주방 상부장" width="800" height="600" loading="lazy">`
4. 첫 화면에 영상을 넣는 경우: MP4(H.264) 720p, 10초 이내, 2MB 이하로 압축하고 `muted playsinline` 속성을 넣습니다.

## 오픈 전 체크
- [ ] `TODO.md`의 A~C 항목 채우기
- [ ] `site.config.mjs`에서 `draft: false`로 변경 (시안 띠 제거, 검색 노출 허용)
- [ ] `npm run og`로 공유 이미지 다시 만들기
- [ ] 도메인 연결 후 www 주소 → www 없는 주소로 리다이렉트 확인
  - Netlify: `dist/_redirects`가 자동으로 처리합니다
  - Cloudflare Pages: 대시보드 → Rules → Redirect Rules에서 `www.도메인/*` → `https://도메인/${1}` (301)로 설정
- [ ] 네이버 서치어드바이저·구글 서치콘솔에 사이트 등록 → 인증 코드를 `site.config.mjs`에 입력 → sitemap.xml 제출
- [ ] 네이버 스마트플레이스·구글 비즈니스 프로필 등록 (지역 검색 노출에 가장 큰 영향)
