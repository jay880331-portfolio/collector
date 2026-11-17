-- 관리자 기능을 위한 테이블 수정

-- profiles 테이블에 is_admin 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 관리자 계정 설정을 위한 함수 (Supabase에서 실행)
-- 이 함수는 특정 이메일을 관리자로 설정합니다
CREATE OR REPLACE FUNCTION set_admin_user(user_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET is_admin = true 
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- admin@collector.com을 관리자로 설정
-- 이 사용자가 회원가입한 후에 실행해야 함