import React, { useState } from "react";
import { Download } from "lucide-react";
import wargaService from "../../services/wargaService";

export default function ExportSasaranButton({ params = {}, themeColor = "#2b2e4a" }) {
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDownload = async () => {
    setIsExporting(true);
    setErrorMessage("");
    try {
      const blob = await wargaService.exportWargaExcel(params);
      if (!(blob instanceof Blob)) throw new Error("Backend tidak mengembalikan file Excel.");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "data-sasaran.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error?.message || "Export data sasaran gagal.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="d-inline-flex flex-column align-items-end gap-1">
      <button type="button" className="btn btn-outline-dark d-inline-flex align-items-center gap-2 shadow-xs" onClick={handleDownload} disabled={isExporting} style={{ borderColor: themeColor }}>
        <Download size={16} />
        {isExporting ? "Mengambil data..." : "Export Sasaran"}
      </button>
      {errorMessage && <span className="text-danger small">{errorMessage}</span>}
    </div>
  );
}
