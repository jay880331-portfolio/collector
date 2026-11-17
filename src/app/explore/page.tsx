'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import Navigation from '@/components/Navigation';
import Image from 'next/image';

type Category = Database['public']['Tables']['categories']['Row'];
type Collectible = Database['public']['Tables']['collectibles']['Row'];
// PublicCollection은 user_id를 포함할 수 있지만, 여기서는 일단 UserCollection과 유사하게 정의합니다.
// 필요하다면 profiles 테이블과 조인하여 사용자 정보를 가져올 수 있습니다.
type PublicCollection = Database['public']['Tables']['user_collections']['Row'] & {
  collectibles: Collectible;
  // profiles?: { username?: string | null; avatar_url?: string | null; } | null; // 예시: 사용자 정보
};

export default function ExplorePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [publicCollections, setPublicCollections] = useState<PublicCollection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (data) setCategories(data);
  };

  const fetchPublicCollections = async () => {
    setLoading(true);
    // TODO: profiles 테이블과 조인하여 사용자 정보(예: username)를 가져오는 것을 고려할 수 있습니다.
    // .select('*, collectibles(*), profiles(username, avatar_url)')
    const { data, error } = await supabase
      .from('user_collections')
      .select('*, collectibles(*)')
      .eq('is_public', true)
      .order('created_at', { ascending: false }); // 최신순 정렬

    if (error) {
      console.error('Error fetching public collections:', error);
      setPublicCollections([]);
    } else if (data) {
      setPublicCollections(data as PublicCollection[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchPublicCollections();
  }, []);

  const filteredCollections = selectedCategory === 'all'
    ? publicCollections
    : publicCollections.filter(c => c.collectibles.category_id === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">컬렉션</h1>
          <p className="text-gray-400 mt-2">다른 사용자들의 멋진 컬렉션을 둘러보고 공유하세요.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 카테고리 필터 */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">카테고리</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-white text-black'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  전체
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-white text-black'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 컬렉션 그리드 */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">컬렉션을 불러오는 중...</div>
              </div>
            ) : filteredCollections.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😢</div>
                <h3 className="text-xl font-semibold mb-2">공개된 컬렉션이 없습니다</h3>
                <p className="text-gray-400">아직 탐색할 수 있는 컬렉션이 없네요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors"
                  >
                    <div className="aspect-square bg-gray-800 flex items-center justify-center">
                      {collection.collectibles.image_urls && collection.collectibles.image_urls[0] ? (
                        <Image
                          src={collection.collectibles.image_urls[0]}
                          alt={collection.collectibles.name ?? 'Collection image'}
                          width={300} // 실제 표시될 크기에 맞춰 조정 필요
                          height={300} // 실제 표시될 크기에 맞춰 조정 필요
                          className="w-full h-full object-cover"
                          unoptimized={collection.collectibles.image_urls[0].startsWith('http') ? true : undefined} // 외부 URL인 경우 unoptimized 추가 고려
                        />
                      ) : (
                        <div className="text-4xl">📦</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold mb-1 truncate" title={collection.collectibles.name}>{collection.collectibles.name}</h4>
                      {collection.collectibles.brand && (
                        <p className="text-sm text-gray-400 mb-2 truncate" title={collection.collectibles.brand}>{collection.collectibles.brand}</p>
                      )}
                      {/* 사용자 정보 표시 (선택 사항) */}
                      {/* collection.profiles && (
                        <p className="text-xs text-sky-400 mb-1">By: {collection.profiles.username || 'Unknown User'}</p>
                      ) */}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          collection.collectibles.rarity === 'legendary' ? 'bg-yellow-600 text-yellow-100' :
                          collection.collectibles.rarity === 'epic' ? 'bg-purple-600 text-purple-100' :
                          collection.collectibles.rarity === 'rare' ? 'bg-blue-600 text-blue-100' :
                          collection.collectibles.rarity === 'uncommon' ? 'bg-green-600 text-green-100' :
                          'bg-gray-600 text-gray-100'
                        }`}>
                          {collection.collectibles.rarity === 'legendary' ? '전설' :
                           collection.collectibles.rarity === 'epic' ? '에픽' :
                           collection.collectibles.rarity === 'rare' ? '레어' :
                           collection.collectibles.rarity === 'uncommon' ? '언커먼' : '커먼'}
                        </span>
                        {/* 공개 페이지에서는 소유자의 컨디션 정보는 덜 중요할 수 있음 */}
                        {/* <span className="text-sm text-gray-400">{collection.condition}</span> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
