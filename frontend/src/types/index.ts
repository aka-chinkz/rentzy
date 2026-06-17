// User and Auth types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_name: string | null;
  rating: number;
  total_reviews: number;
  items_listed: number;
  items_rented: number;
  created_at: string;
  updated_at: string;
}

// Item types
export type ItemCondition = "new" | "like_new" | "good" | "fair";

export type Category = 
  | "electronics"
  | "sports"
  | "tools"
  | "cameras"
  | "party"
  | "music"
  | "books"
  | "fashion"
  | "other";

export interface Item {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category_id: Category;
  images: string[];
  rent_price_per_day: number;
  security_deposit: number;
  condition: ItemCondition;
  availability_start: string;
  availability_end: string | null;
  pickup_location_lat: number;
  pickup_location_lng: number;
  pickup_location_name: string;
  pickup_instructions: string | null;
  min_rental_days: number;
  max_rental_days: number | null;
  is_available: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface CreateItemForm {
  title: string;
  description: string;
  category_id: string;
  rent_price_per_day: string;
  security_deposit: string;
  condition: ItemCondition | "";
  availability_start: string;
  availability_end: string;
  pickup_location_lat: number | null;
  pickup_location_lng: number | null;
  pickup_location_name: string;
  pickup_instructions: string;
  min_rental_days: string;
  max_rental_days: string;
}

// Rental types
export type RentalStatus = 
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "rented"
  | "returned";

export interface RentalRequest {
  id: string;
  item_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_price: number;
  security_deposit: number;
  status: RentalStatus;
  message: string | null;
  owner_response: string | null;
  actual_return_date: string | null;
  created_at: string;
  updated_at: string;
}

// Message types
export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  item_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count_1: number;
  unread_count_2: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: "text" | "image" | "system";
  is_read: boolean;
  created_at: string;
}

// Review types (API may include flat reviewer_name, reviewer_avatar from JOIN)
export interface Review {
  id: string;
  rental_request_id: string;
  reviewer_id: string;
  reviewee_id: string;
  item_id: string;
  rating: number;
  comment: string | null;
  review_type: "renter_to_owner" | "owner_to_renter";
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string | null;
}

// Notification types
export type NotificationType =
  | "rental_request"
  | "request_approved"
  | "request_rejected"
  | "item_returned"
  | "new_message"
  | "new_review";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any> | null;
  is_read: boolean;
  created_at: string;
}

// Search and Filter types
export interface SearchFilters {
  query: string;
  category: string;
  minPrice?: number;
  maxPrice?: number;
  distance?: number;
  condition?: ItemCondition[];
  sortBy?: "newest" | "price_low" | "price_high" | "distance";
}
