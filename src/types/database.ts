export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon_url: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      collectibles: {
        Row: {
          id: string
          category_id: string
          name: string
          brand: string | null
          series: string | null
          release_date: string | null
          rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          estimated_value: number | null
          description: string | null
          specifications: Record<string, unknown> | null
          image_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          brand?: string | null
          series?: string | null
          release_date?: string | null
          rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          estimated_value?: number | null
          description?: string | null
          specifications?: Record<string, unknown> | null
          image_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          brand?: string | null
          series?: string | null
          release_date?: string | null
          rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          estimated_value?: number | null
          description?: string | null
          specifications?: Record<string, unknown> | null
          image_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          website: string | null
          is_collector: boolean
          is_verified: boolean
          is_admin: boolean
          reputation_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          is_collector?: boolean
          is_verified?: boolean
          is_admin?: boolean
          reputation_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          is_collector?: boolean
          is_verified?: boolean
          is_admin?: boolean
          reputation_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_collections: {
        Row: {
          id: string
          user_id: string
          collectible_id: string
          condition: 'mint' | 'near_mint' | 'excellent' | 'good' | 'fair' | 'poor'
          purchase_price: number | null
          purchase_date: string | null
          notes: string | null
          is_for_sale: boolean
          asking_price: number | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          collectible_id: string
          condition?: 'mint' | 'near_mint' | 'excellent' | 'good' | 'fair' | 'poor'
          purchase_price?: number | null
          purchase_date?: string | null
          notes?: string | null
          is_for_sale?: boolean
          asking_price?: number | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          collectible_id?: string
          condition?: 'mint' | 'near_mint' | 'excellent' | 'good' | 'fair' | 'poor'
          purchase_price?: number | null
          purchase_date?: string | null
          notes?: string | null
          is_for_sale?: boolean
          asking_price?: number | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          title: string
          content: string
          post_type: 'discussion' | 'showcase' | 'question' | 'trade' | 'sale'
          image_urls: string[] | null
          is_pinned: boolean
          view_count: number
          like_count: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          title: string
          content: string
          post_type?: 'discussion' | 'showcase' | 'question' | 'trade' | 'sale'
          image_urls?: string[] | null
          is_pinned?: boolean
          view_count?: number
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          title?: string
          content?: string
          post_type?: 'discussion' | 'showcase' | 'question' | 'trade' | 'sale'
          image_urls?: string[] | null
          is_pinned?: boolean
          view_count?: number
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}