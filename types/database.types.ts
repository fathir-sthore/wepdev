export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          role: "user" | "developer" | "admin";
          bio: string | null;
          theme_preference: "dark" | "light" | "system";
          language_preference: "id" | "en";
          email_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "developer" | "admin";
          bio?: string | null;
          theme_preference?: "dark" | "light" | "system";
          language_preference?: "id" | "en";
          email_notifications?: boolean;
        };
        Update: {
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: "user" | "developer" | "admin";
          theme_preference?: "dark" | "light" | "system";
          language_preference?: "id" | "en";
          email_notifications?: boolean;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          script_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          script_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          script_id?: string;
        };
        Relationships: [];
      };
      downloads: {
        Row: {
          id: string;
          user_id: string | null;
          script_id: string;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          script_id: string;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          script_id?: string;
          ip_hash?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          description?: string | null;
          sort_order?: number;
        };
        Update: {
          name?: string;
          slug?: string;
          icon?: string | null;
          description?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      scripts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          short_description: string;
          description: string;
          developer_id: string;
          category_id: string | null;
          version: string;
          programming_language: string | null;
          framework: string | null;
          license: string | null;
          file_path: string | null;
          file_size_bytes: number | null;
          checksum_sha256: string | null;
          password_zip: string | null;
          thumbnail_path: string | null;
          screenshot_paths: string[];
          documentation_path: string | null;
          video_url: string | null;
          github_url: string | null;
          website_url: string | null;
          changelog: string | null;
          is_premium: boolean;
          price: number;
          status: "draft" | "published" | "archived";
          view_count: number;
          download_count: number;
          favorite_count: number;
          rating_avg: number;
          rating_count: number;
          stock: number | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          short_description: string;
          description: string;
          developer_id: string;
          category_id?: string | null;
          version?: string;
          programming_language?: string | null;
          framework?: string | null;
          license?: string | null;
          file_path?: string | null;
          file_size_bytes?: number | null;
          checksum_sha256?: string | null;
          password_zip?: string | null;
          thumbnail_path?: string | null;
          screenshot_paths?: string[];
          documentation_path?: string | null;
          video_url?: string | null;
          github_url?: string | null;
          website_url?: string | null;
          changelog?: string | null;
          is_premium?: boolean;
          price?: number;
          stock?: number | null;
          status?: "draft" | "published" | "archived";
          published_at?: string | null;
        };
        Update: {
          slug?: string;
          title?: string;
          short_description?: string;
          description?: string;
          category_id?: string | null;
          version?: string;
          programming_language?: string | null;
          framework?: string | null;
          license?: string | null;
          file_path?: string | null;
          file_size_bytes?: number | null;
          checksum_sha256?: string | null;
          password_zip?: string | null;
          thumbnail_path?: string | null;
          screenshot_paths?: string[];
          documentation_path?: string | null;
          video_url?: string | null;
          github_url?: string | null;
          website_url?: string | null;
          changelog?: string | null;
          is_premium?: boolean;
          price?: number;
          stock?: number | null;
          status?: "draft" | "published" | "archived";
          published_at?: string | null;
        };
        Relationships: [];
      };
      script_tags: {
        Row: {
          script_id: string;
          tag_id: string;
        };
        Insert: {
          script_id: string;
          tag_id: string;
        };
        Update: {
          script_id?: string;
          tag_id?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          script_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          script_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          script_id: string;
          user_id: string | null;
          reason: string;
          details: string | null;
          status: "open" | "reviewed" | "dismissed";
          created_at: string;
        };
        Insert: {
          id?: string;
          script_id: string;
          user_id?: string | null;
          reason: string;
          details?: string | null;
          status?: "open" | "reviewed" | "dismissed";
        };
        Update: {
          status?: "open" | "reviewed" | "dismissed";
        };
        Relationships: [];
      };
      code_snippets: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          title: string;
          description: string | null;
          language: string;
          content: string;
          file_name: string | null;
          view_count: number;
          rating_avg: number;
          rating_count: number;
          status: "published" | "hidden";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          title: string;
          description?: string | null;
          language: string;
          content: string;
          file_name?: string | null;
          status?: "published" | "hidden";
        };
        Update: {
          slug?: string;
          title?: string;
          description?: string | null;
          language?: string;
          content?: string;
          file_name?: string | null;
          status?: "published" | "hidden";
        };
        Relationships: [];
      };
      code_snippet_comments: {
        Row: {
          id: string;
          snippet_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          snippet_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
        Relationships: [];
      };
      code_snippet_reports: {
        Row: {
          id: string;
          snippet_id: string;
          user_id: string | null;
          reason: string;
          details: string | null;
          status: "open" | "reviewed" | "dismissed";
          created_at: string;
        };
        Insert: {
          id?: string;
          snippet_id: string;
          user_id?: string | null;
          reason: string;
          details?: string | null;
          status?: "open" | "reviewed" | "dismissed";
        };
        Update: {
          status?: "open" | "reviewed" | "dismissed";
        };
        Relationships: [];
      };
      banners: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          image_path: string | null;
          link_url: string | null;
          category_id: string | null;
          status: "draft" | "published";
          start_date: string | null;
          end_date: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string | null;
          description?: string | null;
          image_path?: string | null;
          link_url?: string | null;
          category_id?: string | null;
          status?: "draft" | "published";
          start_date?: string | null;
          end_date?: string | null;
          sort_order?: number;
        };
        Update: {
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          image_path?: string | null;
          link_url?: string | null;
          category_id?: string | null;
          status?: "draft" | "published";
          start_date?: string | null;
          end_date?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      login_history: {
        Row: {
          id: string;
          user_id: string;
          method: string;
          ip_hash: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          method: string;
          ip_hash?: string | null;
          user_agent?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          link_url: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message?: string | null;
          link_url?: string | null;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
        };
        Relationships: [];
      };
      storage_logs: {
        Row: {
          id: string;
          action: "upload" | "download" | "delete" | "copy" | "move" | "multipart_complete" | "multipart_abort";
          object_key: string;
          size_bytes: number | null;
          status: "success" | "error";
          error_message: string | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: "upload" | "download" | "delete" | "copy" | "move" | "multipart_complete" | "multipart_abort";
          object_key: string;
          size_bytes?: number | null;
          status: "success" | "error";
          error_message?: string | null;
          user_id?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          script_id: string;
          order_id: string;
          payment_method: string;
          amount: number;
          fee: number | null;
          total_payment: number | null;
          qr_string: string | null;
          status: "pending" | "completed" | "failed" | "expired" | "cancelled";
          expires_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          script_id: string;
          order_id: string;
          payment_method?: string;
          amount: number;
          fee?: number | null;
          total_payment?: number | null;
          qr_string?: string | null;
          status?: "pending" | "completed" | "failed" | "expired" | "cancelled";
          expires_at?: string | null;
        };
        Update: {
          status?: "pending" | "completed" | "failed" | "expired" | "cancelled";
          fee?: number | null;
          total_payment?: number | null;
          qr_string?: string | null;
          expires_at?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      views: {
        Row: {
          id: string;
          script_id: string;
          user_id: string | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          script_id: string;
          user_id?: string | null;
          ip_hash?: string | null;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      decrement_script_stock: {
        Args: { p_script_id: string };
        Returns: void;
      };
      increment_snippet_view_count: {
        Args: { p_snippet_id: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
