'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import Navigation from '@/components/Navigation';

type Category = Database['public']['Tables']['categories']['Row'];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth(); // authLoading 추가
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: false,
    sort_order: 0
  });

  useEffect(() => {
    console.log('AdminPage: useEffect triggered. User:', !!user, 'AuthLoading:', authLoading, 'AdminLoading:', adminLoading, 'IsAdmin:', isAdmin);

    // 인증 로딩 중이거나 어드민 상태 로딩 중이면 대기
    if (authLoading || adminLoading) {
      console.log('AdminPage: Auth or Admin status is loading. Waiting...');
      return;
    }

    // 이 시점에서 authLoading과 adminLoading은 모두 false입니다.
    if (!user) {
      console.log('AdminPage: No user logged in (auth and admin checks complete). Redirecting to login.');
      alert('로그인이 필요합니다.');
      // window.location.href = '/login'; // 실제 로그인 페이지로 리디렉션하세요.
      return;
    }

    // 이 시점에서 authLoading, adminLoading은 false이고, user는 존재합니다.
    if (!isAdmin) {
      console.log('AdminPage: User is not admin (auth and admin checks complete). Redirecting to home. User email:', user.email);
      alert('관리자 권한이 필요합니다.');
      // window.location.href = '/'; // 실제 홈페이지로 리디렉션하세요.
      return;
    }

    // 모든 검사를 통과한 경우 (authLoading false, adminLoading false, user 존재, isAdmin true)
    console.log('AdminPage: Access granted. Fetching categories. User email:', user.email);
    fetchCategories();

  }, [user, isAdmin, authLoading, adminLoading]); // authLoading을 의존성 배열에 추가

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');
    
    if (data) setCategories(data);
    setLoading(false);
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        is_active: category.is_active,
        sort_order: category.sort_order
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        is_active: false,
        sort_order: categories.length
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // 수정
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            is_active: formData.is_active,
            sort_order: formData.sort_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        alert('카테고리가 수정되었습니다.');
      } else {
        // 추가
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            is_active: formData.is_active,
            sort_order: formData.sort_order
          });
        
        if (error) throw error;
        alert('카테고리가 추가되었습니다.');
      }
      
      closeModal();
      fetchCategories();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);
      
      if (error) throw error;
      alert('카테고리가 삭제되었습니다.');
      fetchCategories();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          is_active: !category.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id);
      
      if (error) throw error;
      fetchCategories();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-400">관리자 페이지에 접근하려면 먼저 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">관리자 페이지</h1>
              <p className="text-gray-400 mt-2">카테고리 관리</p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              + 새 카테고리
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">로딩 중...</div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sm:px-6 sm:py-4 sm:text-sm">이름</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sm:px-6 sm:py-4 sm:text-sm">슬러그</th>
                  <th className="hidden px-3 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider md:table-cell sm:px-6 sm:py-4 sm:text-sm">설명</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider sm:px-6 sm:py-4 sm:text-sm">상태</th>
                  <th className="hidden px-3 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider lg:table-cell sm:px-6 sm:py-4 sm:text-sm">순서</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider sm:px-6 sm:py-4 sm:text-sm">액션</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t border-gray-800">
                    <td className="px-3 py-2 whitespace-normal break-words text-sm font-medium text-white sm:px-6 sm:py-4 sm:text-base">{category.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-400 sm:px-6 sm:py-4 sm:text-base">{category.slug}</td>
                    <td className="hidden px-3 py-2 text-sm text-gray-400 md:table-cell sm:px-6 sm:py-4 sm:text-base max-w-xs truncate">
                      {category.description || '-'}
                    </td>
                    <td className="px-3 py-2 text-center sm:px-6 sm:py-4">
                      <button
                        onClick={() => toggleActive(category)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          category.is_active
                            ? 'bg-green-600 text-green-100'
                            : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {category.is_active ? '활성' : '비활성'}
                      </button>
                    </td>
                    <td className="hidden px-3 py-2 text-center text-sm text-gray-400 lg:table-cell sm:px-6 sm:py-4 sm:text-base">
                      {category.sort_order}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openModal(category)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-md border border-gray-800">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingCategory ? '카테고리 수정' : '새 카테고리 추가'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    카테고리 이름 *
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
                    슬러그 *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                    placeholder="ex) figures, vinyl-records"
                    required
                  />
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
                    정렬 순서
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-300">
                    활성화
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    {editingCategory ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}