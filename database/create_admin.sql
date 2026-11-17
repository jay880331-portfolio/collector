-- 1단계: profiles 테이블에 is_admin 컬럼 추가 (이미 있다면 무시됨)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2단계: 회원가입 시 자동으로 프로필 생성하는 트리거 수정
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, is_admin)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'display_name',
    CASE 
      WHEN new.email = 'admin@collector.com' THEN true
      WHEN new.email = 'admin@example.com' THEN true
      ELSE false
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3단계: 트리거 생성 (이미 있다면 재생성)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4단계: 기존 사용자가 있다면 관리자 권한 부여
UPDATE profiles 
SET is_admin = true 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('admin@collector.com', 'admin@example.com')
);