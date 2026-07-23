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
        };
        Update: {
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
