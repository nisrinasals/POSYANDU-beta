import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Calendar,
  MapPin,
  Building2,
  Home,
  Check,
} from "lucide-react";
import { pemeriksaanService, posyanduService } from "../../services";
import { cleanPuskesmasName, cleanPosyanduName } from "../../utils/dataMappers";
import RekapWorksheetPreview from "./RekapWorksheetPreview";

const CATEGORY_GROUPS = {
  bumil_nifas_menyusui: {
    label: "Ibu Hamil / Nifas / Menyusui",
  },
  bayi_balita_apras: {
    label: "Bayi, Balita dan Apras",
  },
  usia_sekolah_remaja: {
    label: "Anak Usia Sekolah dan Remaja (6–18 Tahun)",
  },
  dewasa_lansia: {
    label: "Usia Dewasa dan Lansia (≥ 19 Tahun)",
  },
  all: {
    label: "Semua Template Rekap (Seluruh Siklus)",
  },
};

export default function ExportRekapModal({
  isOpen,
  onClose,
  currentCategory = "Semua Kategori",
  currentYear = "Semua",
  globalPemeriksaanData = {},
  theme = "kader",
  themeColor = null,
  roleTitle = "",
  initialPosyandu = "",
  user = null,
}) {
  const currentUser = useMemo(() => {
    if (user && typeof user === "object") return user;
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }, [user]);

  const isSA = theme === "sa" || roleTitle?.toLowerCase().includes("super") || currentUser?.roleType === "sa" || currentUser?.role === "sa";
  const isDinkes = !isSA && (theme === "dinkes" || roleTitle?.toLowerCase().includes("dinas") || currentUser?.roleType?.includes("dinkes") || currentUser?.role?.toLowerCase().includes("dinkes"));
  const isPuskesmas = !isSA && !isDinkes && (theme === "puskesmas" || roleTitle?.toLowerCase().includes("puskesmas") || currentUser?.roleType?.includes("puskesmas") || currentUser?.role?.toLowerCase().includes("puskesmas"));
  const primaryColor = isSA ? "#475569" : themeColor || (isDinkes ? "#0f2b5c" : isPuskesmas ? "#3b7d6b" : "#059669");

  const normalizeCategory = (value) => String(value || "").toLowerCase();
  const categoryKey = normalizeCategory(currentCategory);

  const initialCategory = useMemo(() => {
    if (categoryKey.includes("bayi") || categoryKey.includes("balita") || categoryKey.includes("apras")) return "bayi_balita_apras";
    if (categoryKey.includes("remaja") || categoryKey.includes("sekolah") || categoryKey.includes("usekrem")) return "usia_sekolah_remaja";
    if (categoryKey.includes("dewasa") || categoryKey.includes("lansia")) return "dewasa_lansia";
    if (categoryKey.includes("bumil") || categoryKey.includes("nifas") || categoryKey.includes("menyusui")) return "bumil_nifas_menyusui";
    return "all";
  }, [categoryKey]);

  const [selectedFormatCategory, setSelectedFormatCategory] = useState(initialCategory);
  const defaultYear = currentYear === "Semua" ? String(new Date().getFullYear()) : currentYear;
  const [exportYear, setExportYear] = useState(defaultYear);
  const [backendYears, setBackendYears] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Scope & Administrative Area States
  const defaultScope = isDinkes ? "kota" : isPuskesmas ? "puskesmas" : "posyandu";
  const [scopeType, setScopeType] = useState(defaultScope); // "kota" | "puskesmas" | "posyandu"
  const [puskesmasList, setPuskesmasList] = useState([]);
  const [allPosyanduList, setAllPosyanduList] = useState([]);
  const [selectedPuskesmasId, setSelectedPuskesmasId] = useState("all");
  const [selectedPosyanduId, setSelectedPosyanduId] = useState("all");

  // Identifikasi Nama Puskesmas User Login (Otomatis & Terkunci)
  const userPuskesmasName = useMemo(() => {
    if (!isPuskesmas) return "";
    if (currentUser?.puskesmas && typeof currentUser.puskesmas === "string") {
      return cleanPuskesmasName(currentUser.puskesmas);
    }
    if (currentUser?.puskesmas?.nama_puskesmas) {
      return cleanPuskesmasName(currentUser.puskesmas.nama_puskesmas);
    }
    if (currentUser?.instansi && !currentUser.instansi.toLowerCase().includes("dinas")) {
      return cleanPuskesmasName(currentUser.instansi);
    }
    if (roleTitle && !roleTitle.toLowerCase().includes("super") && !roleTitle.toLowerCase().includes("dinas") && !roleTitle.toLowerCase().includes("admin")) {
      return cleanPuskesmasName(roleTitle);
    }
    return "";
  }, [isPuskesmas, currentUser, roleTitle]);

  // Identifikasi ID Puskesmas User Login
  const userPuskesmasId = useMemo(() => {
    if (!isPuskesmas) return null;
    if (currentUser?.puskesmas_id) return String(currentUser.puskesmas_id);
    if (currentUser?.puskesmas?.id) return String(currentUser.puskesmas.id);
    if (puskesmasList.length > 0 && userPuskesmasName) {
      const targetClean = userPuskesmasName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const found = puskesmasList.find((p) => {
        const pkmClean = cleanPuskesmasName(p.nama_puskesmas || p.nama || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return pkmClean === targetClean || pkmClean.includes(targetClean) || targetClean.includes(pkmClean);
      });
      if (found) return String(found.id);
    }
    return null;
  }, [isPuskesmas, currentUser, userPuskesmasName, puskesmasList]);

  // Load Puskesmas and Posyandu master data from backend
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    Promise.allSettled([
      posyanduService.getPublicPuskesmasList().catch(() => ({ data: [] })),
      posyanduService.getAllPosyandu().catch(() => ({ data: [] })),
    ]).then(([pkmRes, posRes]) => {
      const pkms = (Array.isArray(pkmRes?.value?.data) ? pkmRes.value.data : []).sort((a, b) => {
        const nameA = cleanPuskesmasName(a.nama_puskesmas || a.nama || "");
        const nameB = cleanPuskesmasName(b.nama_puskesmas || b.nama || "");
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" });
      });
      const posyandus = (Array.isArray(posRes?.value?.data) ? posRes.value.data : []).sort((a, b) => {
        const nameA = cleanPosyanduName(a.nama_posyandu || a.nama || "");
        const nameB = cleanPosyanduName(b.nama_posyandu || b.nama || "");
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" });
      });
      setPuskesmasList(pkms);
      setAllPosyanduList(posyandus);

      // Pre-select if initialPosyandu provided
      if (initialPosyandu && initialPosyandu !== "Semua Posyandu") {
        const foundPos = posyandus.find(
          (p) => p.nama_posyandu === initialPosyandu || p.nama === initialPosyandu || String(p.id) === String(initialPosyandu)
        );
        if (foundPos) {
          setScopeType("posyandu");
          setSelectedPosyanduId(String(foundPos.id));
          if (foundPos.puskesmas_id) {
            setSelectedPuskesmasId(String(foundPos.puskesmas_id));
          }
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, initialPosyandu]);

  // Reset and initialize when opened
  useEffect(() => {
    if (!isOpen) return;
    setSelectedFormatCategory(initialCategory);
    setExportYear(currentYear === "Semua" ? String(new Date().getFullYear()) : currentYear);
    setShowSuccess(false);
    setErrorMessage("");

    if (theme === "kader" && currentUser?.posyandu) {
      setScopeType("posyandu");
    } else if (isPuskesmas) {
      setScopeType("puskesmas");
      if (userPuskesmasId) {
        setSelectedPuskesmasId(String(userPuskesmasId));
      }
    }
  }, [isOpen, initialCategory, currentYear, theme, isPuskesmas, currentUser, userPuskesmasId]);

  // Sinkronkan selectedPuskesmasId untuk user Puskesmas agar selalu terkunci
  useEffect(() => {
    if (isPuskesmas && userPuskesmasId) {
      setSelectedPuskesmasId(String(userPuskesmasId));
    }
  }, [isPuskesmas, userPuskesmasId]);

  // Load backend years
  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    pemeriksaanService
      .getMonthlyStatistics()
      .then((response) => {
        if (!cancelled) setBackendYears(Array.isArray(response?.data?.years) ? response.data.years : []);
      })
      .catch(() => {
        if (!cancelled) setBackendYears([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const availableYears = useMemo(() => {
    const yearsFromRecords = Object.values(globalPemeriksaanData || {})
      .map((item) => String(item?.tanggal || "").slice(0, 4))
      .filter((year) => /^\d{4}$/.test(year));
    return [...new Set([...yearsFromRecords, ...backendYears, String(new Date().getFullYear())])].sort((a, b) => Number(b) - Number(a));
  }, [backendYears, globalPemeriksaanData]);

  // Filtered Posyandu list: Jika role Puskesmas, HANYA posyandu di bawah naungannya sendiri!
  const availablePosyandus = useMemo(() => {
    let list = [];
    if (isPuskesmas) {
      list = allPosyanduList.filter((pos) => {
        const pkmId = String(pos.puskesmas_id || pos.puskesmas?.id || "");
        if (userPuskesmasId && pkmId === String(userPuskesmasId)) return true;
        if (userPuskesmasName) {
          const pkmName = cleanPuskesmasName(pos.puskesmas?.nama_puskesmas || pos.puskesmas || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const targetClean = userPuskesmasName.toLowerCase().replace(/[^a-z0-9]/g, "");
          return pkmName === targetClean;
        }
        return false;
      });
    } else if (selectedPuskesmasId === "all") {
      list = allPosyanduList;
    } else {
      list = allPosyanduList.filter(
        (pos) => String(pos.puskesmas_id || pos.puskesmas?.id) === String(selectedPuskesmasId)
      );
    }

    return [...list].sort((a, b) => {
      const nameA = cleanPosyanduName(a.nama_posyandu || a.nama || "");
      const nameB = cleanPosyanduName(b.nama_posyandu || b.nama || "");
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" });
    });
  }, [isPuskesmas, userPuskesmasId, userPuskesmasName, selectedPuskesmasId, allPosyanduList]);

  // Otomatis pilih Posyandu pertama jika user memilih scope posyandu
  useEffect(() => {
    if (scopeType === "posyandu" && availablePosyandus.length > 0) {
      const exists = availablePosyandus.some((p) => String(p.id) === String(selectedPosyanduId));
      if (!exists) {
        setSelectedPosyanduId(String(availablePosyandus[0].id));
      }
    }
  }, [scopeType, availablePosyandus, selectedPosyanduId]);

  // Auto-calculated Header Info based on active Scope
  const activeWilayahMeta = useMemo(() => {
    if (scopeType === "kota") {
      return {
        nama: "DINAS KESEHATAN KOTA YOGYAKARTA",
        dusun: "Seluruh Wilayah Kota",
        desa: "Seluruh Kelurahan",
        kecamatan: "Kota Yogyakarta",
        label: "Seluruh Wilayah Kota Yogyakarta (Agregat Semua Puskesmas & Posyandu)",
        badge: "Tingkat Kota",
        posyanduId: null,
      };
    }

    if (scopeType === "puskesmas") {
      const effectivePkmId = isPuskesmas && userPuskesmasId ? userPuskesmasId : selectedPuskesmasId;
      const pkm = puskesmasList.find((p) => String(p.id) === String(effectivePkmId));
      const pkmName = cleanPuskesmasName(pkm?.nama_puskesmas || pkm?.nama || userPuskesmasName || "Puskesmas");
      return {
        nama: `PUSKESMAS ${pkmName.toUpperCase()}`,
        dusun: "Wilayah Kerja Puskesmas",
        desa: "Wilayah Kerja Puskesmas",
        kecamatan: pkm?.kecamatan || "Kota Yogyakarta",
        label: `Puskesmas ${pkmName}`,
        badge: "Tingkat Puskesmas",
        posyanduId: null,
      };
    }

    // scopeType === "posyandu"
    const pos = availablePosyandus.find((p) => String(p.id) === String(selectedPosyanduId)) || allPosyanduList.find((p) => String(p.id) === String(selectedPosyanduId));
    const posName = cleanPosyanduName(pos?.nama_posyandu || pos?.nama || "");
    return {
      nama: posName ? `POSYANDU ${posName.toUpperCase()}` : "POSYANDU",
      dusun: pos?.dusun || "-",
      desa: pos?.desa_kelurahan || "-",
      kecamatan: pos?.kecamatan || "-",
      label: posName || "Posyandu Tertentu",
      badge: "Tingkat Posyandu",
      posyanduId: pos ? pos.id : null,
    };
  }, [scopeType, isPuskesmas, userPuskesmasId, userPuskesmasName, selectedPuskesmasId, selectedPosyanduId, puskesmasList, availablePosyandus, allPosyanduList]);

  if (!isOpen) return null;

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
      const params = {};
      const year = String(exportYear || "").trim();

      if (year) {
        params.start_date = `${year}-01-01`;
        params.end_date = `${year}-12-31`;
      }

      if (selectedFormatCategory !== "all") params.template_rekap = selectedFormatCategory;

      // Pass administrative and scope query params
      if (activeWilayahMeta.posyanduId) {
        params.posyandu_id = activeWilayahMeta.posyanduId;
      }
      params.nama_posyandu = activeWilayahMeta.nama;
      params.dusun = activeWilayahMeta.dusun;
      params.desa_kelurahan = activeWilayahMeta.desa;
      params.kecamatan = activeWilayahMeta.kecamatan;

      const response = await pemeriksaanService.exportPemeriksaanExcel(params);
      const blob = extractBlob(response);

      if (!blob) {
        throw new Error("Backend tidak mengembalikan file Excel.");
      }

      const cleanScopeTitle = activeWilayahMeta.nama.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rekap-pemeriksaan-${selectedFormatCategory}-${cleanScopeTitle}-${year || "semua"}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 2500);
    } catch (error) {
      console.error("Export rekap error:", error);
      const backendMessage = await readBlobError(error);
      setErrorMessage(backendMessage || error?.message || "Export rekapitulasi gagal.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: "min(1250px, 96vw)" }}>
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          {/* Modal Header */}
          <div className="modal-header border-bottom px-4 py-3 bg-light">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 bg-white shadow-xs border" style={{ color: primaryColor }}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark mb-0">Export Rekapitulasi Pemeriksaan (.xlsx)</h5>
                <p className="text-muted small mb-0">
                  Unduh formulir rekapitulasi agregat resmi sesuai regulasi pelayanan kesehatan primer (ILP)
                </p>
              </div>
            </div>
            <button type="button" className="btn-close shadow-none" onClick={onClose} aria-label="Tutup" />
          </div>

          <div className="modal-body px-4 py-4" style={{ maxHeight: "82vh", overflowY: "auto" }}>
            {showSuccess ? (
              <div className="text-center py-5">
                <div className="mx-auto mb-3 text-success p-3 bg-success-subtle rounded-circle d-inline-flex">
                  <CheckCircle2 size={42} />
                </div>
                <h5 className="fw-bold text-dark">File Excel Berhasil Dibuat</h5>
                <p className="text-muted small mb-0">File rekapitulasi pemeriksaan telah selesai diunduh.</p>
              </div>
            ) : (
              <div className="row g-3">
                {/* 1. Template Selector */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold text-dark small d-flex align-items-center gap-2 mb-1">
                    <Layers size={14} style={{ color: primaryColor }} /> Template Format Rekapitulasi
                  </label>
                  <select
                    className="form-select border-2 fw-semibold py-2 text-dark shadow-none"
                    style={{ borderColor: primaryColor }}
                    value={selectedFormatCategory}
                    onChange={(e) => setSelectedFormatCategory(e.target.value)}
                  >
                    {Object.entries(CATEGORY_GROUPS).map(([key, group]) => (
                      <option key={key} value={key}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Tahun Selector */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold text-dark small d-flex align-items-center gap-2 mb-1">
                    <Calendar size={14} style={{ color: primaryColor }} /> Periode Tahun
                  </label>
                  <select
                    className="form-select border-2 fw-semibold py-2 text-dark shadow-none"
                    style={{ borderColor: primaryColor }}
                    value={exportYear}
                    onChange={(e) => setExportYear(e.target.value)}
                  >
                    <option value="">Semua Tahun (Seluruh Riwayat)</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        Tahun {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. SECTION LINGKUP WILAYAH UNDUHAN (Database-Driven, Bebas Dummy) */}
                <div className="col-12 border-top pt-3 mt-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <MapPin size={16} style={{ color: primaryColor }} />
                      <h6 className="fw-bold mb-0 text-dark">Pilihan Lingkup Wilayah Unduhan</h6>
                    </div>
                    <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1 small fw-semibold">
                      {activeWilayahMeta.badge}
                    </span>
                  </div>
                  <p className="text-muted small mb-3">
                    Tentukan cakupan data yang akan diringkas ke dalam dokumen Excel (Agregat Kota, Puskesmas, atau per Posyandu).
                  </p>

                  {/* Scope Selection Cards (Proporsional Kanan-Kiri, Rapi, Tidak Terlalu Lebar) */}
                  <div className="mb-3" style={{ maxWidth: isDinkes ? "820px" : "620px" }}>
                    <div className="row g-2.5">
                      {isDinkes && (
                        <div className="col-12 col-sm-4">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setScopeType("kota");
                              setSelectedPuskesmasId("all");
                              setSelectedPosyanduId("all");
                            }}
                            className="p-3 rounded-3 text-start h-100 transition-all cursor-pointer position-relative d-flex align-items-center gap-3"
                            style={{
                              cursor: "pointer",
                              border: scopeType === "kota" ? `2px solid ${primaryColor}` : "1.5px solid #e2e8f0",
                              backgroundColor: scopeType === "kota" ? "#f8fafc" : "#ffffff",
                              boxShadow: scopeType === "kota" ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
                            }}
                          >
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: scopeType === "kota" ? `${primaryColor}15` : "#f1f5f9",
                                color: scopeType === "kota" ? primaryColor : "#64748b",
                              }}
                            >
                              <Building2 size={18} />
                            </div>
                            <div className="flex-grow-1 pe-2">
                              <div className="fw-bold text-dark" style={{ fontSize: "0.875rem" }}>
                                Seluruh Kota
                              </div>
                              <div className="text-muted" style={{ fontSize: "0.74rem", marginTop: "2px" }}>
                                Agregat se-Kota Yogyakarta
                              </div>
                            </div>
                            {scopeType === "kota" && (
                              <span
                                className="badge rounded-circle p-1 d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ backgroundColor: primaryColor, color: "#fff", width: "18px", height: "18px" }}
                              >
                                <Check size={11} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {(isDinkes || isPuskesmas || isSA) && (
                        <div className={isDinkes ? "col-12 col-sm-4" : "col-12 col-sm-6"}>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setScopeType("puskesmas");
                              if (selectedPuskesmasId === "all" && puskesmasList.length > 0) {
                                setSelectedPuskesmasId(String(puskesmasList[0].id));
                              }
                              setSelectedPosyanduId("all");
                            }}
                            className="p-3 rounded-3 text-start h-100 transition-all cursor-pointer position-relative d-flex align-items-center gap-3"
                            style={{
                              cursor: "pointer",
                              border: scopeType === "puskesmas" ? `2px solid ${primaryColor}` : "1.5px solid #e2e8f0",
                              backgroundColor: scopeType === "puskesmas" ? "#f8fafc" : "#ffffff",
                              boxShadow: scopeType === "puskesmas" ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
                            }}
                          >
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: scopeType === "puskesmas" ? `${primaryColor}15` : "#f1f5f9",
                                color: scopeType === "puskesmas" ? primaryColor : "#64748b",
                              }}
                            >
                              <Building2 size={18} />
                            </div>
                            <div className="flex-grow-1 pe-2">
                              <div className="fw-bold text-dark" style={{ fontSize: "0.875rem" }}>
                                Per Puskesmas
                              </div>
                              <div className="text-muted" style={{ fontSize: "0.74rem", marginTop: "2px" }}>
                                Puskesmas &amp; posyandu binaan
                              </div>
                            </div>
                            {scopeType === "puskesmas" && (
                              <span
                                className="badge rounded-circle p-1 d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ backgroundColor: primaryColor, color: "#fff", width: "18px", height: "18px" }}
                              >
                                <Check size={11} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className={isDinkes ? "col-12 col-sm-4" : (isPuskesmas || isSA) ? "col-12 col-sm-6" : "col-12"}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setScopeType("posyandu");
                            if (selectedPosyanduId === "all" && allPosyanduList.length > 0) {
                              setSelectedPosyanduId(String(allPosyanduList[0].id));
                            }
                          }}
                          className="p-3 rounded-3 text-start h-100 transition-all cursor-pointer position-relative d-flex align-items-center gap-3"
                          style={{
                            cursor: "pointer",
                            border: scopeType === "posyandu" ? `2px solid ${primaryColor}` : "1.5px solid #e2e8f0",
                            backgroundColor: scopeType === "posyandu" ? "#f8fafc" : "#ffffff",
                            boxShadow: scopeType === "posyandu" ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
                          }}
                        >
                          <div
                            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: scopeType === "posyandu" ? `${primaryColor}15` : "#f1f5f9",
                              color: scopeType === "posyandu" ? primaryColor : "#64748b",
                            }}
                          >
                            <Home size={18} />
                          </div>
                          <div className="flex-grow-1 pe-2">
                            <div className="fw-bold text-dark" style={{ fontSize: "0.875rem" }}>
                              Per Posyandu
                            </div>
                            <div className="text-muted" style={{ fontSize: "0.74rem", marginTop: "2px" }}>
                              Rekapitulasi posyandu tunggal
                            </div>
                          </div>
                          {scopeType === "posyandu" && (
                            <span
                              className="badge rounded-circle p-1 d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ backgroundColor: primaryColor, color: "#fff", width: "18px", height: "18px" }}
                            >
                              <Check size={11} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contextual Selector Container based on Scope */}
                  {scopeType === "kota" && (
                    <div className="p-3 rounded-3 border bg-light mb-3" style={{ borderColor: "#e2e8f0" }}>
                      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                          <span className="small text-dark fw-semibold">
                            Merekapitulasi seluruh Puskesmas &amp; Posyandu di wilayah Kota Yogyakarta.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {scopeType === "puskesmas" && (
                    <div className="p-3 rounded-3 border bg-light mb-3" style={{ borderColor: "#e2e8f0" }}>
                      {isPuskesmas ? (
                        <div className="d-flex align-items-center gap-2">
                          <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                          <span className="small text-dark fw-semibold">
                            Merekapitulasi seluruh Posyandu di wilayah binaan <strong>PUSKESMAS {userPuskesmasName ? userPuskesmasName.toUpperCase() : activeWilayahMeta.label.toUpperCase()}</strong>.
                          </span>
                        </div>
                      ) : (
                        <>
                          <label className="form-label small fw-bold text-dark mb-1.5 d-block">Pilih Puskesmas Pembina:</label>
                          <select
                            className="form-select form-select-sm bg-white border fw-semibold text-dark shadow-none"
                            style={{ height: "40px", fontSize: "0.84rem", borderColor: "#cbd5e1", borderRadius: "8px" }}
                            value={selectedPuskesmasId}
                            onChange={(e) => setSelectedPuskesmasId(e.target.value)}
                          >
                            {puskesmasList.map((pkm) => (
                              <option key={pkm.id} value={pkm.id}>
                                {cleanPuskesmasName(pkm.nama_puskesmas || pkm.nama)}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  )}

                  {scopeType === "posyandu" && (
                    <div className="p-3 rounded-3 border bg-light mb-3" style={{ borderColor: "#e2e8f0" }}>
                      <div className="row g-2.5 align-items-end mb-2">
                        {(isDinkes || isSA) && (
                          <div className="col-12 col-md-5">
                            <label className="form-label small fw-bold text-dark mb-1">Filter Puskesmas:</label>
                            <select
                              className="form-select form-select-sm bg-white border fw-semibold text-dark shadow-none"
                              style={{ height: "40px", fontSize: "0.84rem", borderColor: "#cbd5e1", borderRadius: "8px" }}
                              value={selectedPuskesmasId}
                              onChange={(e) => {
                                setSelectedPuskesmasId(e.target.value);
                                setSelectedPosyanduId("all");
                              }}
                            >
                              <option value="all">Semua Puskesmas</option>
                              {puskesmasList.map((pkm) => (
                                <option key={pkm.id} value={pkm.id}>
                                  {cleanPuskesmasName(pkm.nama_puskesmas || pkm.nama)}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className={(isDinkes || isSA) ? "col-12 col-md-7" : "col-12"}>
                          <label className="form-label small fw-bold text-dark mb-1">
                            {isPuskesmas ? `Pilih Posyandu Binaan (Puskesmas ${userPuskesmasName || activeWilayahMeta.label}):` : "Pilih Posyandu:"}
                          </label>
                          <select
                            className="form-select form-select-sm bg-white border fw-semibold text-dark shadow-none"
                            style={{ height: "40px", fontSize: "0.84rem", borderColor: "#cbd5e1", borderRadius: "8px" }}
                            value={selectedPosyanduId}
                            onChange={(e) => setSelectedPosyanduId(e.target.value)}
                            disabled={theme === "kader"}
                          >
                            {availablePosyandus.length === 0 ? (
                              <option value="">Tidak ada posyandu binaan terdaftar</option>
                            ) : (
                              availablePosyandus.map((pos) => (
                                <option key={pos.id} value={pos.id}>
                                  {cleanPosyanduName(pos.nama_posyandu || pos.nama)}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between pt-2.5 mt-2.5 border-top text-muted small" style={{ fontSize: "0.8rem" }}>
                        <span>
                          <strong>Posyandu Terpilih:</strong> {activeWilayahMeta.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Action Buttons */}
                <div className="col-12 d-flex justify-content-end gap-2 pt-2">
                  <button type="button" className="btn btn-light border rounded-3 px-4 shadow-none" onClick={onClose} disabled={isExporting}>
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn text-white rounded-3 px-4 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                    onClick={handleDownload}
                    disabled={isExporting}
                  >
                    <Download size={16} />
                    {isExporting ? "Menyiapkan Data Excel..." : "Export Excel (.xlsx)"}
                  </button>
                </div>

                {/* 5. Live Worksheet Preview Table */}
                <div className="col-12">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small text-muted fw-semibold">Pratinjau Lembar Rekapitulasi (.xlsx)</span>
                    <span className="small text-muted">
                      Menampilkan data riil agregat tahun {exportYear || "semua"}
                    </span>
                  </div>
                  <RekapWorksheetPreview
                    templateRekap={selectedFormatCategory === "all" ? "bumil_nifas_menyusui" : selectedFormatCategory}
                    year={exportYear || "Semua"}
                    theme={theme}
                    roleTitle={roleTitle}
                    posyanduId={activeWilayahMeta.posyanduId}
                  />
                </div>

                {errorMessage && (
                  <div className="col-12">
                    <div className="alert alert-danger small mb-0">{errorMessage}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
