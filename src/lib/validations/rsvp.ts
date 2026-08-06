import { z } from "zod";

export const rsvpSubmitSchema = z
  .object({
    invitation_id: z.string().uuid(),
    attending: z.boolean(),
    full_name: z.string().trim().min(2, "Ad Soyad zorunlu."),
    guest_count: z.coerce.number().int().min(1).max(50).default(1),
    guest_names: z.array(z.string().trim().min(1)).default([]),
    note: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .transform((v) => (v && v.length > 0 ? v : null)),
  })
  .transform((data) => {
    // Katılmıyorsa kişi sayısı ve misafir isimleri anlamsızdır.
    if (!data.attending) {
      return { ...data, guest_count: 1, guest_names: [] as string[] };
    }
    // Beraber gelen isimler en fazla (guest_count - 1) tanedir; boşları at.
    const names = data.guest_names
      .map((n) => n.trim())
      .filter(Boolean)
      .slice(0, Math.max(0, data.guest_count - 1));
    return { ...data, guest_names: names };
  });

export type RsvpSubmitInput = z.infer<typeof rsvpSubmitSchema>;
