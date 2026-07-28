"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, FileDown } from "lucide-react";

type Row = {
  order_id: string;
  buyer: string;
  script: string;
  amount: number;
  status: string;
  created_at: string;
};

async function fetchAllRows(supabase: ReturnType<typeof createClient>): Promise<Row[]> {
  const { data: purchases } = await supabase
    .from("purchases")
    .select("*")
    .order("created_at", { ascending: false });

  if (!purchases || purchases.length === 0) return [];

  const scriptIds = [...new Set(purchases.map((p) => p.script_id))];
  const userIds = [...new Set(purchases.map((p) => p.user_id))];

  const [{ data: scripts }, { data: users }] = await Promise.all([
    supabase.from("scripts").select("id, title").in("id", scriptIds),
    supabase.from("profiles").select("id, username").in("id", userIds),
  ]);

  const scriptMap = new Map((scripts ?? []).map((s) => [s.id, s.title]));
  const userMap = new Map((users ?? []).map((u) => [u.id, u.username]));

  return purchases.map((p) => ({
    order_id: p.order_id,
    buyer: userMap.get(p.user_id) ?? p.user_id,
    script: scriptMap.get(p.script_id) ?? p.script_id,
    amount: p.total_payment ?? p.amount,
    status: p.status,
    created_at: new Date(p.created_at).toLocaleString("id-ID"),
  }));
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function TransactionExportButtons() {
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);

  async function exportCsv() {
    setLoading("csv");
    const rows = await fetchAllRows(supabase);
    const header = "Order ID,Buyer,Script,Amount,Status,Date\n";
    const body = rows
      .map((r) => [r.order_id, r.buyer, `"${r.script}"`, r.amount, r.status, r.created_at].join(","))
      .join("\n");
    downloadBlob(new Blob([header + body], { type: "text/csv" }), "transactions.csv");
    setLoading(null);
  }

  async function exportExcel() {
    setLoading("xlsx");
    const rows = await fetchAllRows(supabase);
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    downloadBlob(new Blob([buf], { type: "application/octet-stream" }), "transactions.xlsx");
    setLoading(null);
  }

  async function exportPdf() {
    setLoading("pdf");
    const rows = await fetchAllRows(supabase);
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Fathir Sthore — Transaction History", 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [["Order ID", "Buyer", "Script", "Amount", "Status", "Date"]],
      body: rows.map((r) => [r.order_id, r.buyer, r.script, `Rp ${r.amount.toLocaleString("id-ID")}`, r.status, r.created_at]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [242, 179, 61] },
    });
    doc.save("transactions.pdf");
    setLoading(null);
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportCsv} disabled={loading !== null}>
        <FileDown size={14} /> {loading === "csv" ? "..." : "CSV"}
      </Button>
      <Button variant="outline" size="sm" onClick={exportExcel} disabled={loading !== null}>
        <FileSpreadsheet size={14} /> {loading === "xlsx" ? "..." : "Excel"}
      </Button>
      <Button variant="outline" size="sm" onClick={exportPdf} disabled={loading !== null}>
        <FileText size={14} /> {loading === "pdf" ? "..." : "PDF"}
      </Button>
    </div>
  );
}
