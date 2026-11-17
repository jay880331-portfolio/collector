import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth(); // authLoading 추가
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // 초기 로딩 상태 true

  const checkAdminStatus = useCallback(async () => {
    if (!user || !user.id || !user.email) {
      // 사용자 정보가 불완전하면 어드민이 아니라고 판단하고 로딩 종료
      setIsAdmin(false);
      setLoading(false);
      console.log('checkAdminStatus: User details incomplete, isAdmin set to false.');
      return;
    }

    setLoading(true); // 실제 비동기 체크 시작 시 로딩 상태 true
    try {
      console.log('checkAdminStatus: Checking for user:', user.email, user.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      console.log('checkAdminStatus: Profile data:', profile, 'Error:', error);

      if (error) {
        console.error('checkAdminStatus: DB query error:', error);
        // 데이터베이스 에러 시 이메일 기반 fallback
        const adminEmails = ['admin@collector.com', 'admin@example.com', 'contact@example.com'];
        const isAdminByEmail = adminEmails.includes(user.email);
        console.log('checkAdminStatus: Fallback email check:', isAdminByEmail);
        setIsAdmin(isAdminByEmail);
      } else {
        // is_admin 값이 true, 'true', 'y', 1 등 다양한 형태로 저장될 수 있으므로 유연하게 처리
        const isAdminByDB = profile?.is_admin === true || 
                            profile?.is_admin === 'true' || 
                            profile?.is_admin === 'y' || 
                            profile?.is_admin === 1;
        console.log("checkAdminStatus: Admin by DB:", isAdminByDB);
        setIsAdmin(isAdminByDB);
      }
    } catch (catchError) {
      console.error('checkAdminStatus: General error:', catchError);
      // 예기치 않은 에러 발생 시 이메일 기반 fallback
      const adminEmails = ['admin@collector.com', 'admin@example.com', 'contact@example.com'];
      const fallbackAdmin = adminEmails.includes(user.email);
      console.log('checkAdminStatus: Catch block fallback check:', fallbackAdmin);
      setIsAdmin(fallbackAdmin);
    } finally {
      setLoading(false); // 모든 처리 완료 후 로딩 상태 false
    }
  }, [user]); // user 객체가 변경될 때마다 checkAdminStatus 함수 재생성

  useEffect(() => {
    console.log('useAdmin useEffect. User:', user ? user.email : 'undefined', 'AuthLoading:', authLoading, 'Current isAdmin:', isAdmin, 'Current loading:', loading);
    if (authLoading) {
      // 인증이 아직 로딩 중이면, 어드민 상태도 로딩 중으로 간주
      setLoading(true);
      return;
    }
    // 이 시점에서는 authLoading은 false
    if (user) {
      setLoading(true); // 사용자 정보가 있으니, 어드민 확인 시작 (명시적으로 로딩 true)
      checkAdminStatus();
    } else {
      // 사용자가 없고 인증 로딩도 끝났으면, 어드민이 아니며 로딩 완료
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user, authLoading, checkAdminStatus, isAdmin, loading]); // isAdmin, loading 추가

  return { isAdmin, loading };
};
