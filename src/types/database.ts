// Supabase Database Types
// This file defines the complete database schema for Rentzy

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          bio: string | null;
          location_lat: number | null;
          location_lng: number | null;
          location_name: string | null;
          rating: number;
          total_reviews: number;
          items_listed: number;
          items_rented: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          location_name?: string | null;
          rating?: number;
          total_reviews?: number;
          items_listed?: number;
          items_rented?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          bio?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          location_name?: string | null;
          rating?: number;
          total_reviews?: number;
          items_listed?: number;
          items_rented?: number;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          description: string | null;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon: string;
          description?: string | null;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          icon?: string;
          description?: string | null;
          parent_id?: string | null;
        };
      };
      items: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          category_id: string;
          images: string[];
          rent_price_per_day: number;
          security_deposit: number;
          condition: "new" | "like_new" | "good" | "fair";
          availability_start: string;
          availability_end: string | null;
          is_available: boolean;
          pickup_location_lat: number;
          pickup_location_lng: number;
          pickup_location_name: string;
          pickup_instructions: string | null;
          min_rental_days: number;
          max_rental_days: number | null;
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          category_id: string;
          images: string[];
          rent_price_per_day: number;
          security_deposit: number;
          condition: "new" | "like_new" | "good" | "fair";
          availability_start: string;
          availability_end?: string | null;
          is_available?: boolean;
          pickup_location_lat: number;
          pickup_location_lng: number;
          pickup_location_name: string;
          pickup_instructions?: string | null;
          min_rental_days?: number;
          max_rental_days?: number | null;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          category_id?: string;
          images?: string[];
          rent_price_per_day?: number;
          security_deposit?: number;
          condition?: "new" | "like_new" | "good" | "fair";
          availability_start?: string;
          availability_end?: string | null;
          is_available?: boolean;
          pickup_location_lat?: number;
          pickup_location_lng?: number;
          pickup_location_name?: string;
          pickup_instructions?: string | null;
          min_rental_days?: number;
          max_rental_days?: number | null;
          views?: number;
          updated_at?: string;
        };
      };
      rental_requests: {
        Row: {
          id: string;
          item_id: string;
          renter_id: string;
          owner_id: string;
          status: "pending" | "approved" | "rejected" | "cancelled" | "rented" | "returned";
          start_date: string;
          end_date: string;
          total_days: number;
          total_price: number;
          security_deposit: number;
          message: string | null;
          owner_response: string | null;
          pickup_time: string | null;
          return_time: string | null;
          actual_return_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          renter_id: string;
          owner_id: string;
          status?: "pending" | "approved" | "rejected" | "cancelled" | "rented" | "returned";
          start_date: string;
          end_date: string;
          total_days: number;
          total_price: number;
          security_deposit: number;
          message?: string | null;
          owner_response?: string | null;
          pickup_time?: string | null;
          return_time?: string | null;
          actual_return_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "approved" | "rejected" | "cancelled" | "rented" | "returned";
          owner_response?: string | null;
          pickup_time?: string | null;
          return_time?: string | null;
          actual_return_date?: string | null;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          item_id: string | null;
          rental_request_id: string | null;
          participant_1: string;
          participant_2: string;
          last_message: string | null;
          last_message_at: string | null;
          unread_count_1: number;
          unread_count_2: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id?: string | null;
          rental_request_id?: string | null;
          participant_1: string;
          participant_2: string;
          last_message?: string | null;
          last_message_at?: string | null;
          unread_count_1?: number;
          unread_count_2?: number;
          created_at?: string;
        };
        Update: {
          last_message?: string | null;
          last_message_at?: string | null;
          unread_count_1?: number;
          unread_count_2?: number;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type: "text" | "image" | "system";
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type?: "text" | "image" | "system";
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
      reviews: {
        Row: {
          id: string;
          rental_request_id: string;
          reviewer_id: string;
          reviewee_id: string;
          item_id: string;
          rating: number;
          comment: string | null;
          review_type: "renter_to_owner" | "owner_to_renter";
          created_at: string;
        };
        Insert: {
          id?: string;
          rental_request_id: string;
          reviewer_id: string;
          reviewee_id: string;
          item_id: string;
          rating: number;
          comment?: string | null;
          review_type: "renter_to_owner" | "owner_to_renter";
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
      };
      saved_items: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          created_at?: string;
        };
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "rental_request" | "request_approved" | "request_rejected" | "item_returned" | "new_message" | "new_review";
          title: string;
          message: string;
          data: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "rental_request" | "request_approved" | "request_rejected" | "item_returned" | "new_message" | "new_review";
          title: string;
          message: string;
          data?: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      nearby_items: {
        Args: {
          lat: number;
          lng: number;
          radius_km: number;
        };
        Returns: {
          id: string;
          distance_km: number;
        }[];
      };
    };
  };
};

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Item = Database["public"]["Tables"]["items"]["Row"];
export type RentalRequest = Database["public"]["Tables"]["rental_requests"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type SavedItem = Database["public"]["Tables"]["saved_items"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

// Extended types with relations
export type ItemWithOwner = Item & {
  owner: Profile;
  category: Category;
};

export type RentalRequestWithDetails = RentalRequest & {
  item: Item;
  renter: Profile;
  owner: Profile;
};

export type ConversationWithParticipants = Conversation & {
  participant_1_profile: Profile;
  participant_2_profile: Profile;
  item?: Item;
};

export type ReviewWithDetails = Review & {
  reviewer: Profile;
  item: Item;
};
