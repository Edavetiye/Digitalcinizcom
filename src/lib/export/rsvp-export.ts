import ExcelJS from "exceljs";
import { formatDateTimeTR } from "@/lib/utils/date";

export interface ExportRsvpRow {
  couple: string;
  attending: boolean;
  full_name: string;
  guest_count: number;
  guest_names: string[];
  note: string | null;
  created_at: string;
}

const HEADERS = [
  "Davetiye",
  "Durum",
  "Ad Soyad",
  "Kişi Sayısı",
  "Beraber Gelenler",
  "Not",
  "Tarih",
] as const;

function toCells(r: ExportRsvpRow): (string | number)[] {
  return [
    r.couple,
    r.attending ? "Katılıyor" : "Katılmıyor",
    r.full_name,
    r.attending ? r.guest_count : "",
    r.guest_names.join(", "),
    r.note ?? "",
    formatDateTimeTR(r.created_at),
  ];
}

/** CSV üretir. Excel'in Türkçe karakterleri doğru açması için UTF-8 BOM eklenir. */
export function buildRsvpCsv(rows: ExportRsvpRow[]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /["\n,;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [HEADERS.join(",")];
  for (const r of rows) lines.push(toCells(r).map(esc).join(","));
  return "﻿" + lines.join("\r\n");
}

/** Excel (.xlsx) çalışma kitabı üretir. */
export async function buildRsvpXlsx(rows: ExportRsvpRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("RSVP");

  ws.addRow([...HEADERS]);
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).alignment = { vertical: "middle" };

  for (const r of rows) ws.addRow(toCells(r));

  ws.columns.forEach((col, i) => {
    col.width = [28, 12, 22, 12, 30, 30, 18][i] ?? 18;
  });

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
