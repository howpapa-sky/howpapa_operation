// 프로젝트 분류 체계 타입 정의

export interface ProjectCategory {
  main: string;
  sub?: string;
  detail?: string;
}

// 대분류
export const MAIN_CATEGORIES = [
  '인플루언서 협업',
  '발주',
  '제품 출시',
  '상세페이지 제작',
  '기타',
] as const;

export type MainCategory = typeof MAIN_CATEGORIES[number];

// 중분류 (대분류별)
export const SUB_CATEGORIES: Record<MainCategory, string[]> = {
  '인플루언서 협업': ['공구 운영', '인플루언서 마케팅'],
  '발주': [],
  '제품 출시': ['샘플링', '부자재 선정'],
  '상세페이지 제작': [],
  '기타': [],
};

// 소분류 (중분류별)
export const DETAIL_CATEGORIES: Record<string, string[]> = {
  '공구 운영': [],
  '인플루언서 마케팅': ['시딩', '유가 광고'],
  '샘플링': ['신제품', '리뉴얼'],
  '부자재 선정': ['용기', '라벨', '단상자', '기타'],
};

// 프로젝트 유형별 추가 필드 정의
export interface ProjectAdditionalFields {
  // 공구 운영
  product_name?: string;
  seller_name?: string;
  sales_cycle?: string;
  commission_rate?: string;
  settlement_status?: boolean;
  
  // 인플루언서 마케팅 (시딩, 유가 광고)
  influencer_name?: string;
  follower_count?: number;
  
  // 유가 광고
  ad_fee?: number;
  
  // 발주
  order_quantity?: number;
  subsidiary_company?: string;
  supply_type?: string;
  
  // 부자재 선정
  moq?: number;
}

// 프로젝트 유형별 필요한 필드 정의
export const REQUIRED_FIELDS_BY_CATEGORY: Record<string, string[]> = {
  '공구 운영': ['product_name', 'seller_name', 'sales_cycle', 'commission_rate', 'settlement_status'],
  '시딩': ['product_name', 'influencer_name', 'follower_count'],
  '유가 광고': ['product_name', 'influencer_name', 'follower_count', 'ad_fee'],
  '발주': ['product_name', 'order_quantity', 'manufacturer', 'subsidiary_company', 'supply_type'],
  '신제품': ['product_name', 'manufacturer'],
  '리뉴얼': ['product_name', 'manufacturer'],
  '용기': ['product_name', 'manufacturer', 'moq'],
  '라벨': ['product_name', 'manufacturer', 'moq'],
  '단상자': ['product_name', 'manufacturer', 'moq'],
  '상세페이지 제작': ['product_name', 'manufacturer'],
};

// 필드 레이블 정의
export const FIELD_LABELS: Record<string, string> = {
  product_name: '진행 제품',
  seller_name: '공구 셀러',
  sales_cycle: '판매 주기',
  commission_rate: '판매 수수료',
  settlement_status: '정산 여부',
  influencer_name: '인플루언서명',
  follower_count: '팔로워 수',
  ad_fee: '원고료',
  order_quantity: '발주 수량',
  manufacturer: '제조사',
  subsidiary_company: '부자재 업체명',
  supply_type: '턴키/사급 여부',
  moq: 'MOQ',
};

// 분류 경로 생성 함수
export function getCategoryPath(category: ProjectCategory): string {
  const parts = [category.main];
  if (category.sub) parts.push(category.sub);
  if (category.detail) parts.push(category.detail);
  return parts.join(' > ');
}

// 필요한 필드 목록 가져오기
export function getRequiredFields(category: ProjectCategory): string[] {
  // 소분류가 있으면 소분류 기준
  if (category.detail && REQUIRED_FIELDS_BY_CATEGORY[category.detail]) {
    return REQUIRED_FIELDS_BY_CATEGORY[category.detail];
  }
  // 중분류가 있으면 중분류 기준
  if (category.sub && REQUIRED_FIELDS_BY_CATEGORY[category.sub]) {
    return REQUIRED_FIELDS_BY_CATEGORY[category.sub];
  }
  // 대분류 기준
  if (REQUIRED_FIELDS_BY_CATEGORY[category.main]) {
    return REQUIRED_FIELDS_BY_CATEGORY[category.main];
  }
  return [];
}
