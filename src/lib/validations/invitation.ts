import { z } from "zod";

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const nullableString = z.preprocess(
  emptyToNull,
  z.string().trim().nullable(),
);

const nullableUrl = z.preprocess(
  emptyToNull,
  z.string().trim().url("Geçerli bir URL girin.").nullable(),
);

export const galleryItemSchema = z.object({
  url: z.string().trim().url(),
  alt: z.string().trim().optional(),
});

export const eventInputSchema = z.object({
  title: z.string().trim().min(1, "Etkinlik başlığı zorunlu."),
  start_time: z.preprocess(emptyToNull, z.string().nullable()),
  description: nullableString,
});

export const linkInputSchema = z.object({
  type: z.enum(["instagram", "website", "whatsapp", "gallery", "maps"]),
  title: nullableString,
  url: z.string().trim().url("Geçerli bir URL girin."),
});

export const invitationInputSchema = z.object({
  id: z.string().uuid().optional(),
  customer_id: z.string().uuid("Müşteri seçilmeli."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug en az 3 karakter olmalı.")
    .regex(/^[a-z0-9-]+$/, "Slug yalnızca küçük harf, rakam ve tire içerebilir."),
  bride_name: nullableString,
  groom_name: nullableString,
  event_date: z.preprocess(emptyToNull, z.string().nullable()),
  event_time: z.preprocess(emptyToNull, z.string().nullable()),
  location_name: nullableString,
  location_address: nullableString,
  location_map_url: nullableUrl,
  cover_image_url: nullableUrl,
  gallery: z.array(galleryItemSchema).default([]),
  music_url: nullableUrl,
  theme: z.string().trim().min(1).default("classic"),
  welcome_text: nullableString,
  story: nullableString,
  dress_code: nullableString,
  countdown_enabled: z.boolean().default(true),
  rsvp_enabled: z.boolean().default(true),
  status: z.enum(["draft", "published"]).default("draft"),
  events: z.array(eventInputSchema).default([]),
  links: z.array(linkInputSchema).default([]),
});

export type InvitationInput = z.infer<typeof invitationInputSchema>;
export type EventInput = z.infer<typeof eventInputSchema>;
export type LinkInput = z.infer<typeof linkInputSchema>;
