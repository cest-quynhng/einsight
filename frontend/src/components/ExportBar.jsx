import React from "react";
import { exportCsv } from "../api.js";

export default function ExportBar({ data }) {
  if (!data) return null;

  async function handleCsv() {
    try {
      await exportCsv(data);
    } catch (e) {
      alert("Lỗi xuất CSV: " + e.message);
    }
  }

  function handleSheets() {
    alert("Google Sheets export sắp ra mắt — dùng CSV rồi import thẳng vào Sheets.");
  }

  function handlePdf() {
    window.print();
  }

  return (
    <div className="no-print card sticky bottom-4 z-20 mt-2 flex flex-wrap items-center gap-3 p-3">
      <div className="mr-auto text-xs text-slate-500">
        Xuất kết quả về đúng format Google Sheets hiện tại
      </div>
      <button onClick={handleCsv} className="btn-primary">Xuất CSV (tagged)</button>
      <button onClick={handleSheets} className="btn-secondary">Xuất Google Sheets</button>
      <button onClick={handlePdf} className="btn-secondary">Xuất báo cáo PDF</button>
    </div>
  );
}
