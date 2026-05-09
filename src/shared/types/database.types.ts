export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          created_at: string
          id: string
          ip: string | null
          kind: string
          metadata: Json | null
          platform: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip?: string | null
          kind: string
          metadata?: Json | null
          platform?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string | null
          kind?: string
          metadata?: Json | null
          platform?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          custom_label: string | null
          expires_at: string | null
          hidden: boolean
          id: string
          last_error: string | null
          last_fetched: string | null
          member_since: string | null
          method: string
          negative_count: number | null
          on_chain_tx_id: string | null
          paused: boolean
          platform: string
          platform_url: string
          platform_user_id: string | null
          positive_count: number | null
          rating_count: number | null
          rating_score: number | null
          show_name: boolean
          show_picture: boolean
          signed_payload: string | null
          tier: string
          user_id: string
          verified_at: string | null
          verified_name: string | null
          verified_picture_url: string | null
          verify_token: string
        }
        Insert: {
          created_at?: string
          custom_label?: string | null
          expires_at?: string | null
          hidden?: boolean
          id?: string
          last_error?: string | null
          last_fetched?: string | null
          member_since?: string | null
          method: string
          negative_count?: number | null
          on_chain_tx_id?: string | null
          paused?: boolean
          platform: string
          platform_url: string
          platform_user_id?: string | null
          positive_count?: number | null
          rating_count?: number | null
          rating_score?: number | null
          show_name?: boolean
          show_picture?: boolean
          signed_payload?: string | null
          tier: string
          user_id: string
          verified_at?: string | null
          verified_name?: string | null
          verified_picture_url?: string | null
          verify_token: string
        }
        Update: {
          created_at?: string
          custom_label?: string | null
          expires_at?: string | null
          hidden?: boolean
          id?: string
          last_error?: string | null
          last_fetched?: string | null
          member_since?: string | null
          method?: string
          negative_count?: number | null
          on_chain_tx_id?: string | null
          paused?: boolean
          platform?: string
          platform_url?: string
          platform_user_id?: string | null
          positive_count?: number | null
          rating_count?: number | null
          rating_score?: number | null
          show_name?: boolean
          show_picture?: boolean
          signed_payload?: string | null
          tier?: string
          user_id?: string
          verified_at?: string | null
          verified_name?: string | null
          verified_picture_url?: string | null
          verify_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      data_exports: {
        Row: {
          exported_at: string
          id: string
          payload_hash: string
          user_id: string
        }
        Insert: {
          exported_at?: string
          id?: string
          payload_hash: string
          user_id: string
        }
        Update: {
          exported_at?: string
          id?: string
          payload_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_exports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          evidence: string | null
          id: string
          reason: string
          reporter_ip: string
          reviewed: boolean
          target_id: string
        }
        Insert: {
          created_at?: string
          evidence?: string | null
          id?: string
          reason: string
          reporter_ip: string
          reviewed?: boolean
          target_id: string
        }
        Update: {
          created_at?: string
          evidence?: string | null
          id?: string
          reason?: string
          reporter_ip?: string
          reviewed?: boolean
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_source: string | null
          created_at: string
          email: string
          id: string
          is_premium: boolean
          name: string | null
          slug: string
          suspended_at: string | null
          wallet_address: string | null
          wallet_verified_at: string | null
        }
        Insert: {
          avatar_source?: string | null
          created_at?: string
          email: string
          id: string
          is_premium?: boolean
          name?: string | null
          slug: string
          suspended_at?: string | null
          wallet_address?: string | null
          wallet_verified_at?: string | null
        }
        Update: {
          avatar_source?: string | null
          created_at?: string
          email?: string
          id?: string
          is_premium?: boolean
          name?: string | null
          slug?: string
          suspended_at?: string | null
          wallet_address?: string | null
          wallet_verified_at?: string | null
        }
        Relationships: []
      }
      wallet_proofs: {
        Row: {
          chain: string
          id: string
          nonce: string
          signature: string
          user_id: string
          verified_at: string
          wallet_address: string
        }
        Insert: {
          chain?: string
          id?: string
          nonce: string
          signature: string
          user_id: string
          verified_at?: string
          wallet_address: string
        }
        Update: {
          chain?: string
          id?: string
          nonce?: string
          signature?: string
          user_id?: string
          verified_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_proofs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
