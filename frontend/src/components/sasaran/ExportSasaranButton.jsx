import React, { useState } from "react";
import { Download } from "lucide-react";
import wargaService from "../../services/wargaService";

export default function ExportSasaranButton({ params = {}, themeColor = "#2b2e4a" }) {
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const extractBlob = (response) => {
    if (response instanceof Blob) return response;
    if (response?.data instanceof Blob) return response.data;
    return null;
  };

  const readBlobError = async (error) => {
    const candidate = error?.data instanceof Blob ? error.data : error?.response?.data instanceof Blob ? error.response.data : null;
    if (!candidate) return null;
    try {
      const text = await candidate.text();
      const parsed = JSON.parse(text);
      return parsed?.message || parsed?.error || null;
    } catch {
      return null;
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);
    setErrorMessage("");

    try {
      const response = await wargaService.exportWargaExcel(params);
      const blob = extractBlob(response);

      if (!blob) {
        throw new Error("Backend tidak mengembalikan file Excel.");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "data-sasaran.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      const backendMessage = await readBlobError(error);
      setErrorMessage(backendMessage || error?.message || "Export data sasaran gagal.");
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
