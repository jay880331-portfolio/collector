'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];

type Collectible = Database['public']['Tables']['collectibles']['Row'];
type UserCollectionData = Database['public']['Tables']['user_collections']['Row'];

// CollectionsPage에서 사용하는 타입을 가져오거나 유사하게 정의
export type EditableUserCollection = UserCollectionData & {
  collectibles: Collectible; 
};

interface AddCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  collectionToEdit?: EditableUserCollection | null; // 수정할 컬렉션 데이터
}

export default function AddCollectionModal({ isOpen, onClose, onSuccess, collectionToEdit }: AddCollectionModalProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initialFormDataState = useMemo(() => ({
    name: '',
    brand: '',
    series: '',
    category_id: '',
    rarity: 'common' as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
    condition: 'mint' as 'mint' | 'near_mint' | 'excellent' | 'good' | 'fair' | 'poor',
    purchase_price: '',
    purchase_date: '',
    description: '',
    notes: '',
    is_for_sale: false,
    asking_price: '',
    is_public: true
  }), []);
  const [formData, setFormData] = useState(initialFormDataState);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (collectionToEdit && collectionToEdit.collectibles) {
        // 수정 모드: 폼 데이터 채우기
        setFormData({
          name: collectionToEdit.collectibles.name || '',
          brand: collectionToEdit.collectibles.brand || '',
          series: collectionToEdit.collectibles.series || '',
          category_id: collectionToEdit.collectibles.category_id || '',
          rarity: collectionToEdit.collectibles.rarity || 'common',
          description: collectionToEdit.collectibles.description || '',
          condition: collectionToEdit.condition || 'mint',
          purchase_price: collectionToEdit.purchase_price?.toString() || '',
          purchase_date: collectionToEdit.purchase_date || '',
          notes: collectionToEdit.notes || '',
          is_for_sale: collectionToEdit.is_for_sale || false,
          asking_price: collectionToEdit.asking_price?.toString() || '',
          is_public: collectionToEdit.is_public === undefined ? true : collectionToEdit.is_public,
        });
      } else {
        // 추가 모드: 폼 데이터 초기화
        setFormData(initialFormDataState);
      }
    }
  }, [isOpen, collectionToEdit, initialFormDataState]); // initialFormDataState를 의존성 배열에 추가

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      if (collectionToEdit && collectionToEdit.collectibles) {
        // ----- 수정 모드 -----
        // 1. collectibles 테이블 업데이트
        const { data: updatedCollectible, error: collectibleUpdateError } = await supabase
          .from('collectibles')
          .update({
            name: formData.name,
            brand: formData.brand || null,
            series: formData.series || null,
            category_id: formData.category_id,
            rarity: formData.rarity,
            description: formData.description || null,
          })
          .eq('id', collectionToEdit.collectibles.id)
          .select()
          .single();

        if (collectibleUpdateError) throw collectibleUpdateError;
        if (!updatedCollectible) throw new Error('Collectible not found after update.');

        // 2. user_collections 테이블 업데이트
        const { error: userCollectionUpdateError } = await supabase
          .from('user_collections')
          .update({
            // user_id, collectible_id는 변경하지 않음
            condition: formData.condition,
            purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
            purchase_date: formData.purchase_date || null,
            notes: formData.notes || null,
            is_for_sale: formData.is_for_sale,
            asking_price: formData.asking_price ? parseFloat(formData.asking_price) : null,
            is_public: formData.is_public,
          })
          .eq('id', collectionToEdit.id);
        
        if (userCollectionUpdateError) throw userCollectionUpdateError;

      } else {
        // ----- 추가 모드 -----
        // 1. collectible 생성
        const { data: newCollectible, error: collectibleInsertError } = await supabase
          .from('collectibles')
          .insert({
            name: formData.name,
            brand: formData.brand || null,
            series: formData.series || null,
            category_id: formData.category_id,
            rarity: formData.rarity,
            description: formData.description || null,
          })
          .select()
          .single();

        if (collectibleInsertError) throw collectibleInsertError;
        if (!newCollectible) throw new Error('Failed to create collectible.');

        // 2. 사용자 컬렉션에 추가
        const { error: userCollectionInsertError } = await supabase
          .from('user_collections')
          .insert({
            user_id: user.id,
            collectible_id: newCollectible.id,
            condition: formData.condition,
            purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
            purchase_date: formData.purchase_date || null,
            notes: formData.notes || null,
            is_for_sale: formData.is_for_sale,
            asking_price: formData.asking_price ? parseFloat(formData.asking_price) : null,
            is_public: formData.is_public,
          });

        if (userCollectionInsertError) throw userCollectionInsertError;
      }

      // 폼 리셋 (추가 모드에서만 또는 성공 후 공통으로)
      setFormData(initialFormDataState);

      onSuccess();
      onClose();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {collectionToEdit ? '컬렉션 수정' : '새 컬렉션 추가'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  아이템 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  카테고리 *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  required
                >
                  <option value="">카테고리 선택</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  브랜드
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  시리즈
                </label>
                <input
                  type="text"
                  value={formData.series}
                  onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  희귀도
                </label>
                <select
                  value={formData.rarity}
                  onChange={(e) => setFormData({ ...formData, rarity: e.target.value as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                >
                  <option value="common">커먼</option>
                  <option value="uncommon">언커먼</option>
                  <option value="rare">레어</option>
                  <option value="epic">에픽</option>
                  <option value="legendary">전설</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  상태
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as 'mint' | 'near_mint' | 'excellent' | 'good' | 'fair' | 'poor' })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                >
                  <option value="mint">민트</option>
                  <option value="near_mint">니어민트</option>
                  <option value="excellent">상급</option>
                  <option value="good">중급</option>
                  <option value="fair">하급</option>
                  <option value="poor">파손</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  구매가 (₩)
                </label>
                <input
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  구매일
                </label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                개인 메모
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">공개 컬렉션</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_for_sale}
                  onChange={(e) => setFormData({ ...formData, is_for_sale: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">판매 희망</span>
              </label>
            </div>

            {formData.is_for_sale && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  희망 판매가 (₩)
                </label>
                <input
                  type="number"
                  value={formData.asking_price}
                  onChange={(e) => setFormData({ ...formData, asking_price: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                />
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? (collectionToEdit ? '수정 중...' : '추가 중...') : (collectionToEdit ? '수정하기' : '추가하기')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}