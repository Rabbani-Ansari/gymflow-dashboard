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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      diet_assignments: {
        Row: {
          created_at: string
          diet_plan_id: string
          end_date: string
          id: string
          member_id: string
          notify_email: boolean
          notify_sms: boolean
          notify_whatsapp: boolean
          start_date: string
          status: Database["public"]["Enums"]["assignment_status"]
        }
        Insert: {
          created_at?: string
          diet_plan_id: string
          end_date: string
          id?: string
          member_id: string
          notify_email?: boolean
          notify_sms?: boolean
          notify_whatsapp?: boolean
          start_date: string
          status?: Database["public"]["Enums"]["assignment_status"]
        }
        Update: {
          created_at?: string
          diet_plan_id?: string
          end_date?: string
          id?: string
          member_id?: string
          notify_email?: boolean
          notify_sms?: boolean
          notify_whatsapp?: boolean
          start_date?: string
          status?: Database["public"]["Enums"]["assignment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "diet_assignments_diet_plan_id_fkey"
            columns: ["diet_plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diet_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_meals: {
        Row: {
          created_at: string
          diet_plan_id: string
          id: string
          items: Json
          meal_time: Database["public"]["Enums"]["meal_time"]
        }
        Insert: {
          created_at?: string
          diet_plan_id: string
          id?: string
          items?: Json
          meal_time: Database["public"]["Enums"]["meal_time"]
        }
        Update: {
          created_at?: string
          diet_plan_id?: string
          id?: string
          items?: Json
          meal_time?: Database["public"]["Enums"]["meal_time"]
        }
        Relationships: [
          {
            foreignKeyName: "diet_meals_diet_plan_id_fkey"
            columns: ["diet_plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_plans: {
        Row: {
          category: Database["public"]["Enums"]["diet_category"]
          created_at: string
          description: string | null
          diet_goal: Database["public"]["Enums"]["diet_goal"]
          diet_type: Database["public"]["Enums"]["diet_type"]
          duration: number
          id: string
          macros_calories: number
          macros_carbs: number
          macros_fat: number
          macros_protein: number
          name: string
          special_instructions: string | null
          supplements: string[] | null
          target_calories: number
          thumbnail: string | null
          trainer_id: string | null
          updated_at: string
          water_intake: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["diet_category"]
          created_at?: string
          description?: string | null
          diet_goal: Database["public"]["Enums"]["diet_goal"]
          diet_type: Database["public"]["Enums"]["diet_type"]
          duration: number
          id?: string
          macros_calories?: number
          macros_carbs?: number
          macros_fat?: number
          macros_protein?: number
          name: string
          special_instructions?: string | null
          supplements?: string[] | null
          target_calories: number
          thumbnail?: string | null
          trainer_id?: string | null
          updated_at?: string
          water_intake?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["diet_category"]
          created_at?: string
          description?: string | null
          diet_goal?: Database["public"]["Enums"]["diet_goal"]
          diet_type?: Database["public"]["Enums"]["diet_type"]
          duration?: number
          id?: string
          macros_calories?: number
          macros_carbs?: number
          macros_fat?: number
          macros_protein?: number
          name?: string
          special_instructions?: string | null
          supplements?: string[] | null
          target_calories?: number
          thumbnail?: string | null
          trainer_id?: string | null
          updated_at?: string
          water_intake?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      member_attendance: {
        Row: {
          check_in_time: string
          check_out_time: string | null
          created_at: string
          date: string
          id: string
          member_id: string
        }
        Insert: {
          check_in_time: string
          check_out_time?: string | null
          created_at?: string
          date: string
          id?: string
          member_id: string
        }
        Update: {
          check_in_time?: string
          check_out_time?: string | null
          created_at?: string
          date?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_measurements: {
        Row: {
          bmi: number
          body_fat: number | null
          created_at: string
          date: string
          height: number
          id: string
          member_id: string
          weight: number
        }
        Insert: {
          bmi: number
          body_fat?: number | null
          created_at?: string
          date: string
          height: number
          id?: string
          member_id: string
          weight: number
        }
        Update: {
          bmi?: number
          body_fat?: number | null
          created_at?: string
          date?: string
          height?: number
          id?: string
          member_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "member_measurements_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_payments: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          member_id: string
          status: Database["public"]["Enums"]["payment_status"]
          type: Database["public"]["Enums"]["payment_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          description: string
          id?: string
          member_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          type: Database["public"]["Enums"]["payment_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          member_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          type?: Database["public"]["Enums"]["payment_type"]
        }
        Relationships: [
          {
            foreignKeyName: "member_payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          created_at: string
          email: string
          emergency_contact: string | null
          expiry_date: string
          id: string
          name: string
          payment_due: number
          phone: string
          photo: string | null
          plan: string
          start_date: string
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          emergency_contact?: string | null
          expiry_date: string
          id?: string
          name: string
          payment_due?: number
          phone: string
          photo?: string | null
          plan: string
          start_date: string
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          emergency_contact?: string | null
          expiry_date?: string
          id?: string
          name?: string
          payment_due?: number
          phone?: string
          photo?: string | null
          plan?: string
          start_date?: string
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      trainers: {
        Row: {
          created_at: string
          id: string
          name: string
          photo: string | null
          specialization: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          photo?: string | null
          specialization: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          photo?: string | null
          specialization?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workout_assignments: {
        Row: {
          assigned_at: string
          id: string
          member_id: string
          status: Database["public"]["Enums"]["assignment_status"]
          workout_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          member_id: string
          status?: Database["public"]["Enums"]["assignment_status"]
          workout_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          member_id?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_assignments_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          order_index: number
          reps: string
          rest: string
          sets: number
          workout_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          order_index?: number
          reps: string
          rest: string
          sets: number
          workout_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          order_index?: number
          reps?: string
          rest?: string
          sets?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          body_part: Database["public"]["Enums"]["body_part"]
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration: number
          equipment: Database["public"]["Enums"]["equipment_type"]
          id: string
          name: string
          thumbnail: string | null
          trainer_id: string | null
          updated_at: string
          usage_count: number
          video_url: string | null
        }
        Insert: {
          body_part: Database["public"]["Enums"]["body_part"]
          created_at?: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration: number
          equipment: Database["public"]["Enums"]["equipment_type"]
          id?: string
          name: string
          thumbnail?: string | null
          trainer_id?: string | null
          updated_at?: string
          usage_count?: number
          video_url?: string | null
        }
        Update: {
          body_part?: Database["public"]["Enums"]["body_part"]
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration?: number
          equipment?: Database["public"]["Enums"]["equipment_type"]
          id?: string
          name?: string
          thumbnail?: string | null
          trainer_id?: string | null
          updated_at?: string
          usage_count?: number
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "trainer"
      assignment_status: "active" | "completed" | "cancelled"
      body_part:
        | "chest"
        | "back"
        | "legs"
        | "arms"
        | "shoulders"
        | "core"
        | "full-body"
      diet_category: "weight-loss" | "muscle-gain" | "maintenance" | "general"
      diet_goal:
        | "weight-loss"
        | "muscle-gain"
        | "maintenance"
        | "fat-loss"
        | "general-fitness"
      diet_type:
        | "vegetarian"
        | "non-vegetarian"
        | "vegan"
        | "keto"
        | "diabetic"
        | "gluten-free"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      equipment_type: "free-weights" | "machines" | "bodyweight" | "mixed"
      meal_time: "Breakfast" | "Lunch" | "Dinner" | "Snacks"
      member_status: "active" | "expired" | "trial"
      payment_status: "paid" | "pending" | "failed"
      payment_type: "membership" | "pt" | "product"
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
      app_role: ["admin", "trainer"],
      assignment_status: ["active", "completed", "cancelled"],
      body_part: [
        "chest",
        "back",
        "legs",
        "arms",
        "shoulders",
        "core",
        "full-body",
      ],
      diet_category: ["weight-loss", "muscle-gain", "maintenance", "general"],
      diet_goal: [
        "weight-loss",
        "muscle-gain",
        "maintenance",
        "fat-loss",
        "general-fitness",
      ],
      diet_type: [
        "vegetarian",
        "non-vegetarian",
        "vegan",
        "keto",
        "diabetic",
        "gluten-free",
      ],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      equipment_type: ["free-weights", "machines", "bodyweight", "mixed"],
      meal_time: ["Breakfast", "Lunch", "Dinner", "Snacks"],
      member_status: ["active", "expired", "trial"],
      payment_status: ["paid", "pending", "failed"],
      payment_type: ["membership", "pt", "product"],
    },
  },
} as const
