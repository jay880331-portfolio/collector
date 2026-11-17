'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';

type Category = {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug, icon_url')
        .eq('is_active', true)
        .order('sort_order')
        .limit(6);
      
      if (data) setCategories(data);
    } catch {
      // Fallback to hardcoded categories if Supabase fails
      setCategories([
        { id: '1', name: '피규어', slug: 'figures' },
        { id: '2', name: 'LP/레코드', slug: 'vinyl-records' },
        { id: '3', name: '트레이딩 카드', slug: 'trading-cards' },
        { id: '4', name: '빈티지 토이', slug: 'vintage-toys' },
        { id: '5', name: '아트 토이', slug: 'art-toys' },
        { id: '6', name: '코인', slug: 'coins' }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <section className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Collector
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            피규어, LP, 트레이딩 카드부터 희귀 아이템까지. 
            당신의 모든 컬렉션을 관리하고 다른 수집가들과 소통하세요.
          </p>
          <button className="bg-white text-black px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-200 transition-colors min-h-[44px] w-full sm:w-auto">
            지금 시작하기
          </button>
        </section>

        <section className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-800">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
              💎
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">희귀도 분석</h3>
            <p className="text-sm sm:text-base text-gray-400">
              AI 기반 희귀도 분석으로 컬렉션의 가치를 정확히 파악하세요.
            </p>
          </div>
          
          <div className="bg-gray-900 p-4 sm:p-6 rounded-xl border border-gray-800">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
              🤝
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">커뮤니티</h3>
            <p className="text-sm sm:text-base text-gray-400">
              전세계 수집가들과 정보를 공유하고 안전하게 거래하세요.
            </p>
          </div>
        </section>

        <section className="bg-gray-900 rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-800">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">인기 카테고리</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-gray-800 p-3 sm:p-4 rounded-lg text-center hover:bg-gray-700 transition-colors cursor-pointer min-h-[80px] sm:min-h-[90px] flex flex-col justify-center">
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎯</div>
                <span className="text-xs sm:text-sm font-medium leading-tight">{category.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 px-4 sm:px-6 py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="text-sm sm:text-base">&copy; 2025 컬렉터. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
