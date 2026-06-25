-- ============================================================
-- MIGRATION: Nâng cấp database lên đa nền tảng
-- Chạy trong Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bzagyowswyvmlnrpezcx/editor
-- ============================================================

-- BƯỚC 1: Đổi tên bảng cameras → items
ALTER TABLE cameras RENAME TO items;

-- BƯỚC 2: Thêm cột main_image (ảnh chính sản phẩm)
ALTER TABLE items
ADD COLUMN IF NOT EXISTS main_image TEXT;

-- BƯỚC 3: Kiểm tra kết quả — xem danh sách cột của bảng items
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'items'
ORDER BY ordinal_position;
