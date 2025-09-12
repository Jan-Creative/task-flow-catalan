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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      block_notifications: {
        Row: {
          block_id: string
          created_at: string
          id: string
          message: string
          time: string
          title: string
          updated_at: string
        }
        Insert: {
          block_id: string
          created_at?: string
          id?: string
          message: string
          time: string
          title: string
          updated_at?: string
        }
        Update: {
          block_id?: string
          created_at?: string
          id?: string
          message?: string
          time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          category: string
          challenge_date: string
          color: string
          completed_at: string | null
          created_at: string
          description: string | null
          difficulty: string
          icon: string | null
          id: string
          is_completed: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          challenge_date: string
          color?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          icon?: string | null
          id?: string
          is_completed?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          challenge_date?: string
          color?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string
          icon?: string | null
          id?: string
          is_completed?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_preparations: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean
          notes: string | null
          planned_tasks: Json | null
          preparation_date: string
          priorities: Json | null
          time_blocks: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          planned_tasks?: Json | null
          preparation_date: string
          priorities?: Json | null
          time_blocks?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          planned_tasks?: Json | null
          preparation_date?: string
          priorities?: Json | null
          time_blocks?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_reflections: {
        Row: {
          accomplishments: string[] | null
          created_at: string
          day_rating: number
          energy_level: number
          gratitude_notes: string | null
          id: string
          mood_tags: string[] | null
          notes: string | null
          obstacles: string[] | null
          reflection_date: string
          stress_level: number
          tasks_completed_percentage: number
          tomorrow_focus: string | null
          updated_at: string
          user_id: string
          work_satisfaction: number
        }
        Insert: {
          accomplishments?: string[] | null
          created_at?: string
          day_rating: number
          energy_level: number
          gratitude_notes?: string | null
          id?: string
          mood_tags?: string[] | null
          notes?: string | null
          obstacles?: string[] | null
          reflection_date: string
          stress_level: number
          tasks_completed_percentage?: number
          tomorrow_focus?: string | null
          updated_at?: string
          user_id: string
          work_satisfaction: number
        }
        Update: {
          accomplishments?: string[] | null
          created_at?: string
          day_rating?: number
          energy_level?: number
          gratitude_notes?: string | null
          id?: string
          mood_tags?: string[] | null
          notes?: string | null
          obstacles?: string[] | null
          reflection_date?: string
          stress_level?: number
          tasks_completed_percentage?: number
          tomorrow_focus?: string | null
          updated_at?: string
          user_id?: string
          work_satisfaction?: number
        }
        Relationships: []
      }
      daily_reminder_preferences: {
        Row: {
          created_at: string
          custom_message: string | null
          custom_title: string | null
          days_of_week: number[]
          id: string
          is_enabled: boolean
          last_sent_at: string | null
          reminder_time: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_message?: string | null
          custom_title?: string | null
          days_of_week?: number[]
          id?: string
          is_enabled?: boolean
          last_sent_at?: string | null
          reminder_time?: string
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_message?: string | null
          custom_title?: string | null
          days_of_week?: number[]
          id?: string
          is_enabled?: boolean
          last_sent_at?: string | null
          reminder_time?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string | null
          color: string
          created_at: string
          description: string | null
          end_datetime: string
          id: string
          is_all_day: boolean
          location: string | null
          location_type: string | null
          reminder_time: number | null
          repeat_pattern: string | null
          start_datetime: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string
          created_at?: string
          description?: string | null
          end_datetime: string
          id?: string
          is_all_day?: boolean
          location?: string | null
          location_type?: string | null
          reminder_time?: number | null
          repeat_pattern?: string | null
          start_datetime: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string
          created_at?: string
          description?: string | null
          end_datetime?: string
          id?: string
          is_all_day?: boolean
          location?: string | null
          location_type?: string | null
          reminder_time?: number | null
          repeat_pattern?: string | null
          start_datetime?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      folders: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          is_archived: boolean
          is_starred: boolean
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          is_starred?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          is_starred?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_blocks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_history: {
        Row: {
          created_at: string
          delivery_status: string
          fcm_response: Json | null
          id: string
          message: string
          reminder_id: string | null
          sent_at: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_status?: string
          fcm_response?: Json | null
          id?: string
          message: string
          reminder_id?: string | null
          sent_at?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_status?: string
          fcm_response?: Json | null
          id?: string
          message?: string
          reminder_id?: string | null
          sent_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          custom_notifications: boolean
          deadline_alerts: boolean
          enabled: boolean
          id: string
          notification_sound: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          task_reminders: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_notifications?: boolean
          deadline_alerts?: boolean
          enabled?: boolean
          id?: string
          notification_sound?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          task_reminders?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_notifications?: boolean
          deadline_alerts?: boolean
          enabled?: boolean
          id?: string
          notification_sound?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          task_reminders?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_reminders: {
        Row: {
          block_id: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          scheduled_at: string
          sent_at: string | null
          status: string
          task_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          block_id?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          notification_type?: string
          scheduled_at: string
          sent_at?: string | null
          status?: string
          task_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          block_id?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          task_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reminders_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "notification_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_subscriptions: {
        Row: {
          created_at: string
          device_info: Json | null
          device_type: string
          fcm_token: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          device_type?: string
          fcm_token: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          device_type?: string
          fcm_token?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pomodoro_sessions: {
        Row: {
          break_duration_minutes: number
          completed_at: string | null
          created_at: string
          duration_minutes: number
          id: string
          is_completed: boolean
          session_type: string
          started_at: string
          task_id: string
          updated_at: string
        }
        Insert: {
          break_duration_minutes?: number
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          is_completed?: boolean
          session_type?: string
          started_at?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          break_duration_minutes?: number
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          is_completed?: boolean
          session_type?: string
          started_at?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          color: string
          created_at: string
          dashboard_config: Json | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          objective: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          dashboard_config?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          objective?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          dashboard_config?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          objective?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_definitions: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_system: boolean
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_options: {
        Row: {
          color: string
          created_at: string
          icon: string | null
          id: string
          is_default: boolean
          label: string
          property_id: string
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean
          label: string
          property_id: string
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean
          label?: string
          property_id?: string
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_options_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          archived_at: string
          completed_at: string
          created_at: string
          description: string | null
          folder_color: string | null
          folder_name: string | null
          id: string
          metadata: Json | null
          original_created_at: string
          original_task_id: string
          priority: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string
          completed_at: string
          created_at?: string
          description?: string | null
          folder_color?: string | null
          folder_name?: string | null
          id?: string
          metadata?: Json | null
          original_created_at: string
          original_task_id: string
          priority?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string
          completed_at?: string
          created_at?: string
          description?: string | null
          folder_color?: string | null
          folder_name?: string | null
          id?: string
          metadata?: Json | null
          original_created_at?: string
          original_task_id?: string
          priority?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_properties: {
        Row: {
          created_at: string
          id: string
          option_id: string
          property_id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          property_id: string
          task_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          property_id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_properties_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "property_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_properties_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_subtasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          sort_order: number
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          folder_id: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          folder_id?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          folder_id?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      web_push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          device_info: Json | null
          device_type: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          device_info?: Json | null
          device_type?: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          device_info?: Json | null
          device_type?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_pomodoro_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
