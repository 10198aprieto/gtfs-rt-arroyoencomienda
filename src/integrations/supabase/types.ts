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
      admin_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          meta: Json | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          meta?: Json | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          meta?: Json | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      service_alerts: {
        Row: {
          active: boolean
          cause: string
          created_at: string
          description: string
          effect: string
          ends_at: string | null
          header: string
          id: string
          route_ids: string[]
          starts_at: string
          stop_ids: string[]
          updated_at: string
          url: string | null
        }
        Insert: {
          active?: boolean
          cause?: string
          created_at?: string
          description?: string
          effect?: string
          ends_at?: string | null
          header: string
          id?: string
          route_ids?: string[]
          starts_at?: string
          stop_ids?: string[]
          updated_at?: string
          url?: string | null
        }
        Update: {
          active?: boolean
          cause?: string
          created_at?: string
          description?: string
          effect?: string
          ends_at?: string | null
          header?: string
          id?: string
          route_ids?: string[]
          starts_at?: string
          stop_ids?: string[]
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      telegram_alert_notified: {
        Row: {
          alert_id: string
          chat_id: number
          id: string
          sent_at: string
        }
        Insert: {
          alert_id: string
          chat_id: number
          id?: string
          sent_at?: string
        }
        Update: {
          alert_id?: string
          chat_id?: number
          id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_alert_notified_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "service_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_favorites: {
        Row: {
          alias: string | null
          chat_id: number
          created_at: string
          id: string
          stop_id: string
        }
        Insert: {
          alias?: string | null
          chat_id: number
          created_at?: string
          id?: string
          stop_id: string
        }
        Update: {
          alias?: string | null
          chat_id?: number
          created_at?: string
          id?: string
          stop_id?: string
        }
        Relationships: []
      }
      telegram_processed_updates: {
        Row: {
          processed_at: string
          update_id: number
        }
        Insert: {
          processed_at?: string
          update_id: number
        }
        Update: {
          processed_at?: string
          update_id?: number
        }
        Relationships: []
      }
      telegram_reminders: {
        Row: {
          active: boolean
          chat_id: number
          created_at: string
          hour: number
          id: string
          last_sent_date: string | null
          minute: number
          stop_id: string
          weekdays: number[]
        }
        Insert: {
          active?: boolean
          chat_id: number
          created_at?: string
          hour: number
          id?: string
          last_sent_date?: string | null
          minute: number
          stop_id: string
          weekdays?: number[]
        }
        Update: {
          active?: boolean
          chat_id?: number
          created_at?: string
          hour?: number
          id?: string
          last_sent_date?: string | null
          minute?: number
          stop_id?: string
          weekdays?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "telegram_reminders_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "telegram_users"
            referencedColumns: ["chat_id"]
          },
        ]
      }
      telegram_subscriptions: {
        Row: {
          active: boolean
          chat_id: number
          created_at: string
          id: string
          last_notified_at: string | null
          last_notified_trip_id: string | null
          route_id: string | null
          stop_id: string
          threshold_minutes: number
        }
        Insert: {
          active?: boolean
          chat_id: number
          created_at?: string
          id?: string
          last_notified_at?: string | null
          last_notified_trip_id?: string | null
          route_id?: string | null
          stop_id: string
          threshold_minutes: number
        }
        Update: {
          active?: boolean
          chat_id?: number
          created_at?: string
          id?: string
          last_notified_at?: string | null
          last_notified_trip_id?: string | null
          route_id?: string | null
          stop_id?: string
          threshold_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "telegram_subscriptions_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "telegram_users"
            referencedColumns: ["chat_id"]
          },
        ]
      }
      telegram_users: {
        Row: {
          alerts_opt_in: boolean
          chat_id: number
          created_at: string
          first_name: string | null
          language_code: string | null
          last_seen_at: string
          username: string | null
        }
        Insert: {
          alerts_opt_in?: boolean
          chat_id: number
          created_at?: string
          first_name?: string | null
          language_code?: string | null
          last_seen_at?: string
          username?: string | null
        }
        Update: {
          alerts_opt_in?: boolean
          chat_id?: number
          created_at?: string
          first_name?: string | null
          language_code?: string | null
          last_seen_at?: string
          username?: string | null
        }
        Relationships: []
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
