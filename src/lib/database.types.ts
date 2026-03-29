export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: string
                    label: string
                    color_bg: string
                    color_text: string
                    created_at: string
                }
                Insert: {
                    id: string
                    label: string
                    color_bg: string
                    color_text: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    label?: string
                    color_bg?: string
                    color_text?: string
                    created_at?: string
                }
                Relationships: []
            }
            schedules: {
                Row: {
                    id: string
                    owner_id: string
                    title: string
                    week_label: string | null
                    date_from: string
                    date_to: string
                    is_shared: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    title: string
                    week_label?: string | null
                    date_from: string
                    date_to: string
                    is_shared?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    title?: string
                    week_label?: string | null
                    date_from?: string
                    date_to?: string
                    is_shared?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            slots: {
                Row: {
                    id: string
                    schedule_id: string
                    category_id: string
                    day: number
                    time_start: string
                    time_end: string
                    label: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    schedule_id: string
                    category_id: string
                    day: number
                    time_start: string
                    time_end: string
                    label: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    schedule_id?: string
                    category_id?: string
                    day?: number
                    time_start?: string
                    time_end?: string
                    label?: string
                    created_at?: string
                }
                Relationships: []
            }
            rules: {
                Row: {
                    id: string
                    schedule_id: string
                    order: number
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    schedule_id: string
                    order?: number
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    schedule_id?: string
                    order?: number
                    content?: string
                    created_at?: string
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
