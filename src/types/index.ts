// Re-export database types
export * from "./database";

// UI Types
export type RentalStatus = "pending" | "approved" | "rejected" | "cancelled" | "rented" | "returned";

export type ItemCondition = "new" | "like_new" | "good" | "fair";

export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  distance?: number;
  condition?: ItemCondition[];
  availableFrom?: string;
  availableTo?: string;
  sortBy?: "distance" | "price_low" | "price_high" | "newest" | "rating";
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Form types
export interface CreateItemForm {
  title: string;
  description: string;
  category_id: string;
  images: File[];
  rent_price_per_day: number;
  security_deposit: number;
  condition: ItemCondition;
  availability_start: string;
  availability_end?: string;
  pickup_location_lat: number;
  pickup_location_lng: number;
  pickup_location_name: string;
  pickup_instructions?: string;
  min_rental_days: number;
  max_rental_days?: number;
}

export interface RentalRequestForm {
  item_id: string;
  start_date: string;
  end_date: string;
  message?: string;
}

export interface ReviewForm {
  rental_request_id: string;
  rating: number;
  comment?: string;
}
