// ============================================================================
// Supabase veritabanı tipleri — supabase/migrations şeması ile birebir eşleşir.
// Bu dosya elle yazılmıştır; şema değişirse burası da güncellenmelidir.
// ============================================================================

export type Plan = "free" | "pro";
export type InvitationStatus = "draft" | "published";
export type LinkType = "instagram" | "website" | "whatsapp" | "gallery" | "maps";

// Galeri öğeleri jsonb dizisi olarak saklanır.
export interface GalleryItem {
  url: string;
  alt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  auth_user_id: string | null;
  plan: Plan;
  created_at: string;
}

export interface Invitation {
  id: string;
  slug: string;
  customer_id: string;
  bride_name: string | null;
  groom_name: string | null;
  event_date: string | null; // date (YYYY-MM-DD)
  event_time: string | null; // time (HH:mm:ss)
  location_name: string | null;
  location_address: string | null;
  location_map_url: string | null;
  cover_image_url: string | null;
  gallery: GalleryItem[];
  music_url: string | null;
  theme: string;
  welcome_text: string | null;
  story: string | null;
  dress_code: string | null;
  countdown_enabled: boolean;
  rsvp_enabled: boolean;
  status: InvitationStatus;
  created_at: string;
  updated_at: string;
}

export interface Rsvp {
  id: string;
  invitation_id: string;
  full_name: string;
  guest_count: number;
  // Beraber gelen kişilerin isimleri (ana kişi hariç). Tam liste: [full_name, ...guest_names]
  guest_names: string[];
  attending: boolean;
  note: string | null;
  created_at: string;
}

export interface EventItem {
  id: string;
  invitation_id: string;
  title: string;
  start_time: string | null;
  description: string | null;
  created_at: string;
}

export interface LinkItem {
  id: string;
  invitation_id: string;
  type: LinkType;
  title: string | null;
  url: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Supabase client'ının generic'i için `Database` tipi.
// Row / Insert / Update ayrımı ile tip güvenliği sağlar.
// ---------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer;
        Insert: Omit<Customer, "id" | "created_at"> &
          Partial<Pick<Customer, "id" | "created_at">>;
        Update: Partial<Omit<Customer, "id" | "created_at">>;
        Relationships: [];
      };
      invitations: {
        Row: Invitation;
        Insert: Omit<Invitation, "id" | "created_at" | "updated_at" | "gallery"> &
          Partial<Pick<Invitation, "id" | "created_at" | "updated_at" | "gallery">>;
        Update: Partial<Omit<Invitation, "id" | "created_at">>;
        Relationships: [];
      };
      rsvps: {
        Row: Rsvp;
        Insert: Omit<Rsvp, "id" | "created_at" | "guest_names"> &
          Partial<Pick<Rsvp, "id" | "created_at" | "guest_names">>;
        Update: Partial<Omit<Rsvp, "id" | "created_at">>;
        Relationships: [];
      };
      events: {
        Row: EventItem;
        Insert: Omit<EventItem, "id" | "created_at"> &
          Partial<Pick<EventItem, "id" | "created_at">>;
        Update: Partial<Omit<EventItem, "id" | "created_at">>;
        Relationships: [];
      };
      links: {
        Row: LinkItem;
        Insert: Omit<LinkItem, "id" | "created_at"> &
          Partial<Pick<LinkItem, "id" | "created_at">>;
        Update: Partial<Omit<LinkItem, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_customer_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
