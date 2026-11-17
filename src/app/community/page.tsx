'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import CreatePostModal from '@/components/CreatePostModal';
import Navigation from '@/components/Navigation';

type Post = Database['public']['Tables']['posts']['Row'] & {
  profiles: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  categories: {
    name: string;
  } | null;
};

type Category = Database['public']['Tables']['categories']['Row'];

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPostType, setSelectedPostType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (data) setCategories(data);
  };

  const fetchPosts = async () => {
    setLoading(true);
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles (display_name, username, avatar_url),
        categories (name)
      `)
      .order('created_at', { ascending: false });

    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    if (selectedPostType !== 'all') {
      query = query.eq('post_type', selectedPostType);
    }

    const { data } = await query;
    
    if (data) setPosts(data as Post[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, selectedPostType]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return '방금 전';
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'discussion': return '토론';
      case 'showcase': return '자랑';
      case 'question': return '질문';
      case 'trade': return '교환';
      case 'sale': return '판매';
      default: return type;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'discussion': return 'bg-blue-600';
      case 'showcase': return 'bg-purple-600';
      case 'question': return 'bg-green-600';
      case 'trade': return 'bg-orange-600';
      case 'sale': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">커뮤니티</h1>
              <p className="text-gray-400 mt-2">수집가들과 소통하고 정보를 공유하세요</p>
            </div>
            {user && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                글 작성
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 필터 사이드바 */}
          <aside className="lg:w-64">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
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

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">게시글 유형</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: '전체' },
                  { value: 'discussion', label: '토론' },
                  { value: 'showcase', label: '자랑' },
                  { value: 'question', label: '질문' },
                  { value: 'trade', label: '교환' },
                  { value: 'sale', label: '판매' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedPostType(type.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedPostType === type.value
                        ? 'bg-white text-black'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 게시글 목록 */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">로딩 중...</div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2">아직 게시글이 없습니다</h3>
                <p className="text-gray-400">첫 번째 게시글을 작성해보세요!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                          {post.profiles.avatar_url ? (
                            <img
                              src={post.profiles.avatar_url}
                              alt="Profile"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {(post.profiles.display_name || post.profiles.username || 'User')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {post.profiles.display_name || post.profiles.username || '익명'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatDate(post.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getPostTypeColor(post.post_type)}`}>
                          {getPostTypeLabel(post.post_type)}
                        </span>
                        {post.categories && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300">
                            {post.categories.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>

                    {post.image_urls && post.image_urls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        {post.image_urls.slice(0, 4).map((url, index) => (
                          <div
                            key={index}
                            className="aspect-square bg-gray-800 rounded-lg overflow-hidden"
                          >
                            <img
                              src={url}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <span>👁</span>
                          <span>{post.view_count}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>❤️</span>
                          <span>{post.like_count}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>💬</span>
                          <span>{post.comment_count}</span>
                        </span>
                      </div>
                      {post.is_pinned && (
                        <span className="text-yellow-400 text-xs">📌 고정</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchPosts}
      />
    </div>
  );
}