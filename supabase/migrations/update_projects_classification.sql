-- 프로젝트 분류 체계 개편 및 추가 필드

-- 1. 기존 type 컬럼을 category_main으로 변경하고 새로운 분류 컬럼 추가
ALTER TABLE projects 
  RENAME COLUMN type TO category_main;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS category_sub VARCHAR(50),
  ADD COLUMN IF NOT EXISTS category_detail VARCHAR(50);

-- 2. 공구 운영 필드
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS sales_cycle VARCHAR(100),
  ADD COLUMN IF NOT EXISTS commission_rate VARCHAR(50),
  ADD COLUMN IF NOT EXISTS settlement_status BOOLEAN DEFAULT false;

-- 3. 인플루언서 마케팅 필드
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS influencer_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS follower_count INTEGER;

-- 4. 유가 광고 필드
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS ad_fee DECIMAL(15, 2);

-- 5. 발주 필드
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS order_quantity INTEGER,
  ADD COLUMN IF NOT EXISTS subsidiary_company VARCHAR(255),
  ADD COLUMN IF NOT EXISTS supply_type VARCHAR(50);

-- 6. 부자재 선정 필드
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS moq INTEGER;
