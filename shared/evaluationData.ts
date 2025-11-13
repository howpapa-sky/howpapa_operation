// 카테고리별 평가 항목 정의
export const EVALUATION_ITEMS_BY_CATEGORY = {
  "토너패드": [
    { name: "겉보습", score1: "금방 날아가 건조함", score3: "중간 유지", score5: "장시간 촉촉함" },
    { name: "속건조 개선", score1: "속건조 개선 X", score3: "어느정도 재워짐", score5: "속건조 개선 O" },
    { name: "마무리감", score1: "끈적이며, 유분 등의 실팜", score3: "살짝 남음", score5: "번들이지 않음" },
    { name: "크기", score1: "작음", score3: "보통", score5: "큼" },
    { name: "밀착력", score1: "가장자리가 쉽게 들뜨고, 잘 떨어짐", score3: "약간 들뜨는 부분이 있으나, 떨어지진 않음", score5: "부드럽게 매끄러움 (자극감 無)" },
    { name: "원단", score1: "거칠음 (자극감 有)", score3: "보통", score5: "부드럽게 매끄러움 (자극감 無)" },
    { name: "두께", score1: "두꺼움", score3: "중간", score5: "얇음" },
    { name: "수분 함량/유지력", score1: "급방 날아가 건조함", score3: "중간 유지", score5: "장시간 촉촉함" },
  ],
  "앰플": [
    { name: "겉보습", score1: "금방 날아가 건조함", score3: "중간 유지", score5: "장시간 촉촉함" },
    { name: "속건조 개선", score1: "속건조 개선 X", score3: "어느정도 재워짐", score5: "속건조 개선 O" },
    { name: "마무리감", score1: "끈적이며, 유분 등의 실팜", score3: "살짝 남음", score5: "번들이지 않음" },
  ],
  "크림": [
    { name: "겉보습", score1: "금방 날아가 건조함", score3: "중간 유지", score5: "장시간 촉촉함" },
    { name: "속건조 개선", score1: "속건조 개선 X", score3: "어느정도 재워짐", score5: "속건조 개선 O" },
    { name: "마무리감", score1: "끈적이며, 유분 등의 실팜", score3: "살짝 남음", score5: "번들이지 않음" },
    { name: "발림성", score1: "뻑뻑함", score3: "보통", score5: "부드러움" },
  ],
  "세럼": [
    { name: "겉보습", score1: "금방 날아가 건조함", score3: "중간 유지", score5: "장시간 촉촉함" },
    { name: "속건조 개선", score1: "속건조 개선 X", score3: "어느정도 재워짐", score5: "속건조 개선 O" },
    { name: "마무리감", score1: "끈적이며, 유분 등의 실팜", score3: "살짝 남음", score5: "번들이지 않음" },
    { name: "흡수력", score1: "느림", score3: "보통", score5: "빠름" },
  ],
  "로션": [
    { name: "겉보습", score1: "금방 날아가 건조함", score3: "중간 유지", score5: "장시간 촉촉함" },
    { name: "속건조 개선", score1: "속건조 개선 X", score3: "어느정도 재워짐", score5: "속건조 개선 O" },
    { name: "마무리감", score1: "끈적이며, 유분 등의 실팜", score3: "살짝 남음", score5: "번들이지 않음" },
    { name: "발림성", score1: "뻑뻑함", score3: "보통", score5: "부드러움" },
  ],
  "클렌저": [
    { name: "세정력", score1: "약함", score3: "보통", score5: "강함" },
    { name: "자극도", score1: "자극 있음", score3: "보통", score5: "자극 없음" },
    { name: "거품력", score1: "약함", score3: "보통", score5: "풍부함" },
  ],
  "미스트": [
    { name: "분사력", score1: "약함", score3: "보통", score5: "강함" },
    { name: "입자 크기", score1: "큼", score3: "보통", score5: "작음 (미세함)" },
    { name: "보습력", score1: "금방 마름", score3: "보통", score5: "오래 유지" },
  ],
  "스킨": [
    { name: "겉보습", score1: "금방 날아가 건조함", score3: "중간 유지", score5: "장시간 촉촉함" },
    { name: "속건조 개선", score1: "속건조 개선 X", score3: "어느정도 재워짐", score5: "속건조 개선 O" },
    { name: "마무리감", score1: "끈적이며, 유분 등의 실팜", score3: "살짝 남음", score5: "번들이지 않음" },
    { name: "흡수력", score1: "느림", score3: "보통", score5: "빠름" },
  ],
} as const;

export type EvaluationCategory = keyof typeof EVALUATION_ITEMS_BY_CATEGORY;
