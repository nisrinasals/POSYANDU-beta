import React, { useRef, useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { formatDateId } from "../../utils/dataMappers";

/**
 * Komponen Input Tanggal Format Indonesia (Tanggal / Bulan / Tahun -> DD/MM/YYYY)
 * - Tampilan selalu tanggal/bulan/tahun (DD/MM/YYYY) tanpa terpengaruh bahasa sistem/OS Windows
 * - Dilengkapi tombol ikon kalender interaktif untuk memilih tanggal
 * - Mendukung ketik langsung DD/MM/YYYY dengan auto-masking
 * - Terhubung langsung dengan nilai ISO (YYYY-MM-DD) yang digunakan backend
 */
export default function IndonesianDateInput({
  value = "",
  onChange,
  name,
  id,
  placeholder = "HH/BB/TTTT (Tgl/Bln/Thn)",
  required = false,
  disabled = false,
  className = "form-control form-control-custom",
  max = "",
  min = "",
  style = {},
}) {
  const hiddenDateRef = useRef(null);

  // Ubah ISO string (YYYY-MM-DD) ke tampilan lokal DD/MM/YYYY
  const toDisplay = (isoStr) => {
    if (!isoStr) return "";
    return formatDateId(isoStr);
  };

  const [displayText, setDisplayText] = useState(() => toDisplay(value));

  // Sinkronkan displayText jika prop value berubah dari luar (misal reset form atau load data)
  useEffect(() => {
    setDisplayText(toDisplay(value));
  }, [value]);

  // Handler saat memilih tanggal lewat kalender native popup
  const handleNativePickerChange = (e) => {
    const newIso = e.target.value; // Format: YYYY-MM-DD
    setDisplayText(toDisplay(newIso));
    if (onChange) {
      onChange({
        target: {
          name: name || id || "",
          value: newIso,
        },
      });
    }
  };

  // Handler saat mengetik manual di input DD/MM/YYYY
  const handleManualTextChange = (e) => {
    let raw = e.target.value.replace(/[^0-9/]/g, "");

    // Auto-insert slash bila mengetik angka terus-menerus
    const digitsOnly = raw.replace(/\D/g, "");
    if (digitsOnly.length > 8) {
      raw = digitsOnly.slice(0, 8);
    }

    let formatted = "";
    if (digitsOnly.length > 0) {
      const day = digitsOnly.slice(0, 2);
      formatted = day;
      if (digitsOnly.length >= 3) {
        const month = digitsOnly.slice(2, 4);
        formatted += `/${month}`;
        if (digitsOnly.length >= 5) {
          const year = digitsOnly.slice(4, 8);
          formatted += `/${year}`;
        }
      }
    }

    setDisplayText(formatted);

    // Jika sudah lengkap 10 karakter (DD/MM/YYYY)
    if (formatted.length === 10) {
      const parts = formatted.split("/");
      if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2];

        // Validasi tanggal dasar
        const d = parseInt(day, 10);
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);

        if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
          const iso = `${year}-${month}-${day}`;
          if (onChange) {
            onChange({
              target: {
                name: name || id || "",
                value: iso,
              },
            });
          }
          return;
        }
      }
    } else if (formatted.length === 0) {
      if (onChange) {
        onChange({
          target: {
            name: name || id || "",
            value: "",
          },
        });
      }
    }
  };

  const openCalendar = () => {
    if (disabled) return;
    if (hiddenDateRef.current) {
      try {
        if (typeof hiddenDateRef.current.showPicker === "function") {
          hiddenDateRef.current.showPicker();
        } else {
          hiddenDateRef.current.click();
        }
      } catch (_) {
        hiddenDateRef.current.click();
      }
    }
  };

  // Pastikan nilai ISO yang masuk ke input native valid
  const validIsoValue = typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "";

  return (
    <div className="position-relative d-flex align-items-center" style={{ width: "100%", ...style }}>
      <input
        type="text"
        id={id}
        name={name}
        placeholder={placeholder}
        className={`${className} pe-5`}
        value={displayText}
        onChange={handleManualTextChange}
        disabled={disabled}
        required={required}
        maxLength={10}
        style={{ letterSpacing: "0.02em" }}
      />

      {/* Tombol Kalender di Sebelah Kanan */}
      <button
        type="button"
        tabIndex={-1}
        className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3 d-flex align-items-center justify-content-center border-0 shadow-none"
        style={{ height: "100%", color: "#64748b", cursor: disabled ? "not-allowed" : "pointer" }}
        onClick={openCalendar}
        title="Pilih tanggal dari kalender"
      >
        <Calendar size={17} />
      </button>

      {/* Hidden Native Date Input untuk Memunculkan Picker Pop-up */}
      <input
        ref={hiddenDateRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={validIsoValue}
        onChange={handleNativePickerChange}
        max={max}
        min={min}
        disabled={disabled}
        style={{
          position: "absolute",
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: "none",
          left: "50%",
          bottom: 0,
        }}
      />
    </div>
  );
}
