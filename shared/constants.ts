// 브랜드
export const BRANDS = ["하우파파", "누씨오"] as const;

// 카테고리
export const CATEGORIES = [
  "토너패드",
  "앰플",
  "크림",
  "세럼",
  "로션",
  "클렌저",
  "미스트",
  "스킨"
] as const;

// 제조사
export const MANUFACTURERS = ["한국콜마", "코스맥스"] as const;

export type Brand = typeof BRANDS[number];
export type Category = typeof CATEGORIES[number];
export type Manufacturer = typeof MANUFACTURERS[number];
