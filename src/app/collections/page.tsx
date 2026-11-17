'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import AddCollectionModal, { EditableUserCollection } from '@/components/AddCollectionModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Navigation from '@/components/Navigation';

type Category = Database['public']['Tables']['categories']['Row'];
type Collectible = Database['public']['Tables']['collectibles']['Row'];
type UserCollection = Database['public']['Tables']['user_collections']['Row'] & {
  collectibles: Collectible;
};

export default function CollectionsPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<EditableUserCollection | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<UserCollection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // 삭제 확인을 위한 상태 추가 (선택적: 더 나은 UI를 위해 모달 사용 가능)
  // const [showDeleteConfirm, setShowDeleteConfirm] = useState<UserCollection | null>(null);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (data) setCategories(data);
  };

  const fetchUserCollections = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data } = await supabase
      .from('user_collections')
      .select(`
        *,
        collectibles (*)
      `)
      .eq('user_id', user.id);
    
    if (data) setCollections(data as UserCollection[]);
    setLoading(false);
  };

  const openDeleteModal = (collection: UserCollection) => {
    setCollectionToDelete(collection);
  };

  const confirmDeleteCollection = async () => {
    if (!user || !collectionToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('user_collections')
        .delete()
        .eq('id', collectionToDelete.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting collection:', error);
        alert(`컬렉션 삭제 중 오류가 발생했습니다: ${error.message}`);
      } else {
        alert('컬렉션이 성공적으로 삭제되었습니다.');
        fetchUserCollections();
      }
    } catch (e) {
      console.error('Exception during deletion:', e);
      alert('컬렉션 삭제 중 예외가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setCollectionToDelete(null); // 모달 닫기
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserCollections();
    }
  }, [user]);

  const filteredCollections = selectedCategory === 'all' 
    ? collections 
    : collections.filter(c => c.collectibles.category_id === selectedCategory);

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-400">컬렉션을 관리하려면 먼저 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">내 컬렉션</h1>
          <p className="text-gray-400 mt-2">소중한 컬렉션을 관리하고 공유하세요</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 카테고리 필터 */}
          <aside className="lg:w-64">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
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

            <div className="mt-6">
              <button 
                onClick={() => setShowAddModal(true)}
                className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                + 새 컬렉션 추가
              </button>
            </div>
          </aside>

          {/* 컬렉션 그리드 */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">로딩 중...</div>
              </div>
            ) : filteredCollections.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">아직 컬렉션이 없습니다</h3>
                <p className="text-gray-400">첫 번째 컬렉션을 추가해보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors"
                  >
                    <div className="aspect-square bg-gray-800 flex items-center justify-center">
                      {collection.collectibles.image_urls && collection.collectibles.image_urls[0] ? (
                        <img
                          src={collection.collectibles.image_urls[0]}
                          alt={collection.collectibles.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl">📦</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold mb-1">{collection.collectibles.name}</h4>
                      {collection.collectibles.brand && (
                        <p className="text-sm text-gray-400 mb-2">{collection.collectibles.brand}</p>
                      )}
                      <div className="flex items-center justify-between">
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
                        <span className="text-sm text-gray-400">{collection.condition}</span>
                      </div>
                      {collection.purchase_price && (
                        <div className="mt-2 text-sm text-gray-300">
                          구매가: ₩{collection.purchase_price.toLocaleString()}
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${collection.is_public ? 'bg-green-600 text-green-100' : 'bg-gray-600 text-gray-300'}`}>
                          {collection.is_public ? '공개' : '비공개'}
                        </span>
                        <div className="space-x-2">
                          <button 
                            onClick={() => setEditingCollection(collection as EditableUserCollection)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                          >
                            수정
                          </button>
                          <button 
                            onClick={() => openDeleteModal(collection)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm ml-2"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <AddCollectionModal 
        isOpen={showAddModal || !!editingCollection}
        onClose={() => {
          setShowAddModal(false);
          setEditingCollection(null);
        }}
        onSuccess={() => {
          fetchUserCollections(); // 목록 새로고침
          setShowAddModal(false);
          setEditingCollection(null);
        }}
        collectionToEdit={editingCollection}
      />

      {collectionToDelete && (
        <DeleteConfirmModal
          isOpen={!!collectionToDelete}
          onClose={() => setCollectionToDelete(null)}
          onConfirm={confirmDeleteCollection}
          itemName={collectionToDelete.collectibles.name}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}