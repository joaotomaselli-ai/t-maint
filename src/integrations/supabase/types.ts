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
      activity_attachments: {
        Row: {
          activity_id: string
          caption: string | null
          company_id: string
          created_at: string
          id: string
          kind: string
          storage_path: string
          user_id: string
        }
        Insert: {
          activity_id: string
          caption?: string | null
          company_id?: string
          created_at?: string
          id?: string
          kind: string
          storage_path: string
          user_id: string
        }
        Update: {
          activity_id?: string
          caption?: string | null
          company_id?: string
          created_at?: string
          id?: string
          kind?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_attachments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "service_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_technicians: {
        Row: {
          activity_id: string
          company_id: string
          created_at: string
          id: string
          overtime_weekday_hours: number
          overtime_weekend_hours: number
          position: number
          technician_id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          company_id?: string
          created_at?: string
          id?: string
          overtime_weekday_hours?: number
          overtime_weekend_hours?: number
          position: number
          technician_id: string
          user_id: string
        }
        Update: {
          activity_id?: string
          company_id?: string
          created_at?: string
          id?: string
          overtime_weekday_hours?: number
          overtime_weekend_hours?: number
          position?: number
          technician_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_technicians_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "service_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_technicians_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      allowed_emails: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "allowed_emails_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_payments: {
        Row: {
          activity_id: string
          amount: number
          company_id: string
          created_at: string
          id: string
          note: string | null
          paid_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          amount?: number
          company_id?: string
          created_at?: string
          id?: string
          note?: string | null
          paid_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          amount?: number
          company_id?: string
          created_at?: string
          id?: string
          note?: string | null
          paid_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          cnpj: string | null
          company_id: string
          contact: string | null
          created_at: string
          hourly_rate: number
          id: string
          km_rate: number
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          company_id?: string
          contact?: string | null
          created_at?: string
          hourly_rate?: number
          id?: string
          km_rate?: number
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          company_id?: string
          contact?: string | null
          created_at?: string
          hourly_rate?: number
          id?: string
          km_rate?: number
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          cnpj: string | null
          company_id: string | null
          company_name: string
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          phone: string | null
          technician_name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          company_id?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          id: string
          logo_url?: string | null
          phone?: string | null
          technician_name?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          company_id?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          technician_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_reports: {
        Row: {
          client_id: string
          company_id: string
          created_at: string
          date: string
          description: string
          discount_hours: number
          future_replacements: string
          id: string
          km: number
          machine: string
          observation: string | null
          order_number: string
          overtime_weekday_hours: number
          overtime_weekend_hours: number
          requester: string
          service_end: string
          service_start: string
          summary: string
          technician: string
          travel_back_end: string
          travel_back_start: string
          travel_out_end: string
          travel_out_start: string
          type: string
          user_id: string
        }
        Insert: {
          client_id: string
          company_id?: string
          created_at?: string
          date: string
          description?: string
          discount_hours?: number
          future_replacements?: string
          id?: string
          km?: number
          machine?: string
          observation?: string | null
          order_number?: string
          overtime_weekday_hours?: number
          overtime_weekend_hours?: number
          requester?: string
          service_end?: string
          service_start?: string
          summary?: string
          technician?: string
          travel_back_end?: string
          travel_back_start?: string
          travel_out_end?: string
          travel_out_start?: string
          type: string
          user_id: string
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string
          date?: string
          description?: string
          discount_hours?: number
          future_replacements?: string
          id?: string
          km?: number
          machine?: string
          observation?: string | null
          order_number?: string
          overtime_weekday_hours?: number
          overtime_weekend_hours?: number
          requester?: string
          service_end?: string
          service_start?: string
          summary?: string
          technician?: string
          travel_back_end?: string
          travel_back_start?: string
          travel_out_end?: string
          travel_out_start?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      service_sessions: {
        Row: {
          activities_done: string
          activity_id: string
          company_id: string
          created_at: string
          date: string
          discount_hours: number
          id: string
          km: number
          observation: string | null
          overtime_weekday_hours: number
          overtime_weekend_hours: number
          position: number
          service_end: string
          service_start: string
          technician_id: string | null
          travel_back_end: string
          travel_back_start: string
          travel_out_end: string
          travel_out_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activities_done?: string
          activity_id: string
          company_id?: string
          created_at?: string
          date?: string
          discount_hours?: number
          id?: string
          km?: number
          observation?: string | null
          overtime_weekday_hours?: number
          overtime_weekend_hours?: number
          position?: number
          service_end?: string
          service_start?: string
          technician_id?: string | null
          travel_back_end?: string
          travel_back_start?: string
          travel_out_end?: string
          travel_out_start?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activities_done?: string
          activity_id?: string
          company_id?: string
          created_at?: string
          date?: string
          discount_hours?: number
          id?: string
          km?: number
          observation?: string | null
          overtime_weekday_hours?: number
          overtime_weekend_hours?: number
          position?: number
          service_end?: string
          service_start?: string
          technician_id?: string | null
          travel_back_end?: string
          travel_back_start?: string
          travel_out_end?: string
          travel_out_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_sessions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "service_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_payments: {
        Row: {
          activity_id: string
          amount: number
          company_id: string
          created_at: string
          id: string
          note: string | null
          paid_at: string
          technician_id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          amount?: number
          company_id?: string
          created_at?: string
          id?: string
          note?: string | null
          paid_at?: string
          technician_id: string
          user_id: string
        }
        Update: {
          activity_id?: string
          amount?: number
          company_id?: string
          created_at?: string
          id?: string
          note?: string | null
          paid_at?: string
          technician_id?: string
          user_id?: string
        }
        Relationships: []
      }
      technicians: {
        Row: {
          company_id: string
          created_at: string
          hourly_rate: number
          id: string
          km_rate: number
          monthly_fixed_hours: number | null
          name: string
          overtime_weekday_rate: number
          overtime_weekend_rate: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string
          created_at?: string
          hourly_rate?: number
          id?: string
          km_rate?: number
          monthly_fixed_hours?: number | null
          name: string
          overtime_weekday_rate?: number
          overtime_weekend_rate?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          hourly_rate?: number
          id?: string
          km_rate?: number
          monthly_fixed_hours?: number | null
          name?: string
          overtime_weekday_rate?: number
          overtime_weekend_rate?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          allowed_features: string[] | null
          company_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          username: string | null
        }
        Insert: {
          allowed_features?: string[] | null
          company_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          username?: string | null
        }
        Update: {
          allowed_features?: string[] | null
          company_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_company_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_master: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "master" | "admin" | "user"
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
    Enums: {
      app_role: ["master", "admin", "user"],
    },
  },
} as const
