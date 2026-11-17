'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import AuthModal from './AuthModal';

export default function Navigation() {
  const { user: authUser, loading, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="border-b border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-white">컬렉터</Link>
          
          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">홈</Link>
            <Link href="/collections" className="text-gray-300 hover:text-white transition-colors">마이 컬렉션</Link>
            <Link href="/explore" className="text-gray-300 hover:text-white transition-colors">컬렉션</Link>
            <Link href="/community" className="text-gray-300 hover:text-white transition-colors">커뮤니티</Link>
            <Link href="#" className="text-gray-300 hover:text-white transition-colors">마켓</Link>
            {authUser && isAdmin && (
              <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition-colors">관리자</Link>
            )}
          </nav>

          {/* 데스크톱 로그인/로그아웃 */}
          <div className="hidden sm:block">
            {loading ? (
              <div className="w-16 h-8 bg-gray-800 rounded-lg animate-pulse"></div>
            ) : authUser ? (
              <div className="flex items-center space-x-2 lg:space-x-4">
                <span className="text-gray-300 text-sm lg:text-base hidden lg:block">안녕하세요, {authUser.email}</span>
                <button 
                  onClick={() => signOut()}
                  className="bg-gray-800 text-white px-3 lg:px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm lg:text-base"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-white text-black px-3 lg:px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm lg:text-base"
              >
                로그인
              </button>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden text-white text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {isMobileMenuOpen ? '×' : '☰'}
          </button>
        </div>

        {/* 모바일 네비게이션 */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 mt-4 pt-4 border-t border-gray-800' : 'max-h-0'
        }`}>
          <nav className="flex flex-col space-y-3">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors py-2">홈</Link>
            <Link href="/collections" className="text-gray-300 hover:text-white transition-colors py-2">마이 컬렉션</Link>
            <Link href="/explore" className="text-gray-300 hover:text-white transition-colors py-2">컬렉션</Link>
            <Link href="/community" className="text-gray-300 hover:text-white transition-colors py-2">커뮤니티</Link>
            <Link href="#" className="text-gray-300 hover:text-white transition-colors py-2">마켓</Link>
            {authUser && isAdmin && (
              <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition-colors py-2">관리자</Link>
            )}
            
            {/* 모바일 로그인/로그아웃 */}
            <div className="pt-3 border-t border-gray-800">
              {loading ? (
                <div className="w-full h-12 bg-gray-800 rounded-lg animate-pulse"></div>
              ) : authUser ? (
                <div className="space-y-3">
                  <div className="text-gray-300 text-sm">안녕하세요, {authUser.email}</div>
                  <button 
                    onClick={() => signOut()}
                    className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  로그인
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}