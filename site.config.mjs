// ─────────────────────────────────────────────────────────────
// 업체 정보는 이 파일 하나만 고치면 모든 페이지에 반영됩니다.
// [TODO:예시값] 형태는 "아직 실제 정보가 아님"을 뜻합니다.
//   - 화면에는 노란 형광펜으로 표시되고
//   - 빌드할 때 TODO 목록으로 출력됩니다.
// 실제 값으로 바꿀 때는 [TODO: ] 표시까지 지우고 값만 남기세요.
//   예) phone: "[TODO:010-0000-0000]"  →  phone: "051-123-4567"
// ─────────────────────────────────────────────────────────────

export default {
  // 시안 모드: true면 상단에 "시안" 띠가 보이고 검색엔진 수집을 막습니다(noindex).
  // 실제 오픈할 때 반드시 false로 바꾸세요.
  draft: true,

  name: "[TODO:OO클린]",
  // 한 줄 포지셔닝 (메인 첫 화면 제목)
  tagline: "같은 체크리스트, 같은 검수 순서로 끝까지 책임지는 청소",

  // 대표 도메인 (https 포함, 끝에 / 없이). www 없는 주소를 기준으로 합니다.
  domain: "[TODO:https://example.com]",

  phone: "[TODO:010-0000-0000]",
  kakaoChannel: "[TODO:https://pf.kakao.com/_xxxxxx]", // 카카오톡 채널 홈 주소
  hours: "[TODO:매일 08:00~20:00 상담]",

  // 서비스 지역: 시/도 + 구/군 목록
  region: {
    city: "[TODO:부산]",
    districts: ["[TODO:사상구]", "[TODO:북구]", "[TODO:사하구]"],
    note: "[TODO:그 외 지역은 일정에 따라 가능 여부를 안내드려요]",
  },

  // 회사 정보 (전자상거래법상 하단 표시 항목)
  company: {
    owner: "[TODO:대표자명]",
    address: "[TODO:부산광역시 OO구 OO로 00]",
    bizNo: "[TODO:000-00-00000]",
    mailOrderNo: "[TODO:제0000-부산OO-0000호]",
    email: "[TODO:hello@example.com]",
  },

  // 약속 (실제로 지킬 수 있는 내용만 남기세요)
  asDays: "[TODO:3]", // 작업 후 A/S 가능 일수

  // 메인 가격 앵커: 가장 저렴한 시작가
  priceAnchor: "[TODO:OO만원]",

  // 검색엔진 사이트 인증 코드 (각 사이트에서 발급받은 content 값만 넣기)
  verification: {
    naver: "", // [TODO] 네이버 서치어드바이저 → 사이트 등록 → HTML 태그 방식
    google: "", // [TODO] 구글 서치콘솔 → URL 접두어 → HTML 태그 방식
  },

  // 견적 폼 접수 방식: 카카오톡(내용 자동 복사 후 채널 대화창 열기) + 문자
  quote: {
    kakao: true,
    sms: true,
  },
};
