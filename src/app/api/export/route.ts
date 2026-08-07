import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildRsvpCsv,
  buildRsvpXlsx,
  type ExportRsvpRow,
} from "@/lib/export/rsvp-export";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
  const invitationFilter = searchParams.get("invitation");

  // RLS: yalnızca kullanıcının kendi kayıtları döner.
  let query = supabase
    .from("rsvps")
    .select(
      "invitation_id, full_name, attending, guest_count, guest_names, note, created_at",
    )
    .order("created_at", { ascending: false });
  if (invitationFilter) {
    query = query.eq("invitation_id", invitationFilter);
  }

  const [{ data: rsvps, error }, { data: invitations }] = await Promise.all([
    query,
    supabase.from("invitations").select("id, bride_name, groom_name"),
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const coupleMap = new Map(
    (invitations ?? []).map((i) => [
      i.id,
      [i.bride_name, i.groom_name].filter(Boolean).join(" & ") || "-",
    ]),
  );

  const rows: ExportRsvpRow[] = (rsvps ?? []).map((r) => ({
    couple: coupleMap.get(r.invitation_id) ?? "-",
    attending: r.attending,
    full_name: r.full_name,
    guest_count: r.guest_count,
    guest_names: r.guest_names,
    note: r.note,
    created_at: r.created_at,
  }));

  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "xlsx") {
    const buffer = await buildRsvpXlsx(rows);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="rsvp-${stamp}.xlsx"`,
      },
    });
  }

  const csv = buildRsvpCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvp-${stamp}.csv"`,
    },
  });
}
