import React, { useState, useMemo } from "react";
import { Download, Search, Users, CheckCircle, Clock, AlertTriangle, Filter, Calendar, Eye, Edit, FileText, Printer } from "lucide-react";
import { pemeriksaanService } from "../../services";
import DetailRekapModal, { resolve5StepDetails } from "../../components/pemeriksaan/DetailRekapModal";
import ExportRekapModal from "../../components/pemeriksaan/ExportRekapModal";
import { formatAgeFromMonths, formatDateId } from "../../utils/dataMappers";

export default function RekapPemeriksaanPage({ onNavigate, globalSasaranList = [], setGlobalSasaranList, globalPemeriksaanData = {}, setGlobalPemeriksaanData }) {
  const [selectedMonthNum, setSelectedMonthNum] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("Semua");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori (Semua Siklus)");

  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [selectedExamDetail, setSelectedExamDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const getDateOnly = (value) => {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    const text = String(value || "");
    const isoMatch = text.match(/^\d{4}-\d{2}-\d{2}/);
    if (isoMatch) return isoMatch[0];

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
  };

  const getAgeText = (birthDate, referenceDate = new Date(), category = "") => {
    const birthDateOnly = getDateOnly(birthDate);
    const referenceDateOnly = getDateOnly(referenceDate);
    if (!birthDateOnly || !referenceDateOnly) return "";

    const birth = new Date(`${birthDateOnly}T00:00:00Z`);
    const reference = new Date(`${referenceDateOnly}T00:00:00Z`);
    if (Number.isNaN(birth.getTime()) || Number.isNaN(reference.getTime())) return "";

    let months = (reference.getUTCFullYear() - birth.getUTCFullYear()) * 12 + reference.getUTCMonth() - birth.getUTCMonth();

    if (reference.getUTCDate() < birth.getUTCDate()) months -= 1;
    if (months < 0) return "";

    return formatAgeFromMonths(months, category);
  };

  const allRekapList = useMemo(() => {
    if (!globalSasaranList || globalSasaranList.length === 0) return [];

    return globalSasaranList
      .map((s) => {
        if (!s) return null;
        const exam = (globalPemeriksaanData && (globalPemeriksaanData[s.id] || globalPemeriksaanData[String(s.id)] || globalPemeriksaanData[s.nik] || globalPemeriksaanData[`exam_${s.id}`])) || s.exam || null;
        const resolved = resolve5StepDetails(s, exam) || {};
        const isExamined = s.statusPemeriksaan === "Sudah" || s.status === "Sudah" || resolved.isExamined || !!exam;

        return {
          ...resolved,
          id: s.id,
          idSasaran: s.idSasaran || "",
          nama: s.nama || "",
          nik: s.nik || "",
          kategori: s.kategori || "",
          subKategori: s.subKategori || "",
          subText: formatAgeFromMonths(exam?.usia_bulan, s.subKategori || s.kategori) || getAgeText(s.tglLahir, exam?.tanggal || new Date(), s.subKategori || s.kategori) || s.usia || "",
          tglLahir: s.tglLahir || "",
          gender: s.gender || "",
          keteranganKeluarga: s.keteranganIbuSuami || s.namaIbu || s.namaAyah || "",
          tglPeriksa: resolved.tglPeriksa || s.tglPeriksa || "",
          pemeriksaanId: exam?.id || resolved?.idPemeriksaan || null,
          status: isExamined ? "Sudah" : "Belum",
        };
      })
      .filter(Boolean)
      .filter((item) => item.status === "Sudah");
  }, [globalSasaranList, globalPemeriksaanData]);

  const filteredList = useMemo(() => {
    return (allRekapList || []).filter((item) => {
      if (!item) return false;
      const matchSearch = (item.nama || "").toLowerCase().includes((searchTerm || "").toLowerCase()) || (item.nik || "").includes(searchTerm || "");

      let matchCat = true;
      if (selectedCategory !== "Semua Kategori (Semua Siklus)") {
        const itemKat = (item.kategori || "").toLowerCase();
        const itemSubKat = (item.subKategori || "").toLowerCase();
        const targetCat = (selectedCategory || "").toLowerCase();
        matchCat = itemKat.includes(targetCat) || itemSubKat.includes(targetCat) || targetCat.includes(itemKat);
      }

      let matchMonthYear = true;
      if (selectedMonthNum !== "Semua" || selectedYear !== "Semua") {
        if (!item.tglPeriksa || item.tglPeriksa === "-") {
          matchMonthYear = false;
        } else {
          const cleanStr = String(item.tglPeriksa).trim().replace(/\//g, "-");
          const parts = cleanStr.split("-");
          let itemMonth = "";
          let itemYear = "";

          if (parts.length === 3) {
            if (parts[0].length === 4) {
              itemYear = parts[0];
              itemMonth = parts[1].padStart(2, "0");
            } else {
              itemMonth = parts[1].padStart(2, "0");
              itemYear = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            }
          }

          if (selectedMonthNum !== "Semua" && itemMonth && itemMonth !== selectedMonthNum) {
            matchMonthYear = false;
          }
          if (selectedYear !== "Semua" && itemYear && itemYear !== selectedYear) {
            matchMonthYear = false;
          }
        }
      }

      return matchSearch && matchCat && matchMonthYear;
    });
  }, [allRekapList, searchTerm, selectedCategory, selectedMonthNum, selectedYear]);

  const handleOpenDetail = async (citizen) => {
    setSelectedCitizen(citizen);
    setSelectedExamDetail(null);

    const pemeriksaanId = citizen?.pemeriksaanId;
    if (!pemeriksaanId) {
      setIsLoadingDetail(false);
      return;
    }

    setIsLoadingDetail(true);

    try {
      const response = await pemeriksaanService.getPemeriksaanById(pemeriksaanId);
      const detail = response?.data || response || null;
      setSelectedExamDetail(detail);
    } catch (error) {
      console.error("Gagal mengambil detail pemeriksaan:", error);
      setSelectedExamDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedCitizen(null);
    setSelectedExamDetail(null);
    setIsLoadingDetail(false);
  };

  const handlePeriksaClick = (subKategori, wargaId) => {
    if (onNavigate) {
      onNavigate("pemeriksaan", subKategori, { wargaId });
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-dark-custom btn-top-action shadow-xs" onClick={() => setIsExportModalOpen(true)} title="Export Laporan Rekapitulasi ke Excel">
          <Download size={16} /> <span>Export Excel</span>
        </button>
      </div>

      <div className="card card-custom p-3 mb-4 bg-white border-0 shadow-sm rounded-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-sm-6 col-md-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted px-2">
                <Calendar size={14} />
              </span>
              <select className="form-select bg-light border-start-0 text-dark fw-semibold small py-2" value={selectedMonthNum} onChange={(e) => setSelectedMonthNum(e.target.value)} title="Pilih Bulan Periksa">
                <option value="Semua">Semua Bulan</option>
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
                <option value="05">Mei</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-2">
            <select className="form-select bg-light text-dark fw-semibold small py-2" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} title="Pilih Tahun Periksa">
              <option value="Semua">Semua Tahun</option>
              {[
                ...new Set(
                  Object.values(globalPemeriksaanData || {})
                    .map((exam) => String(exam?.tanggal || "").slice(0, 4))
                    .filter((year) => /^\d{4}$/.test(year)),
                ),
              ]
                .sort((a, b) => Number(b) - Number(a))
                .map((year) => (
                  <option key={year} value={year}>
                    Tahun {year}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted px-2">
                <Search size={14} />
              </span>
              <input type="text" className="form-control bg-light border-start-0 text-dark small py-2" placeholder="Cari Nama / NIK..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <select className="form-select bg-light text-dark small py-2" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="Semua Kategori (Semua Siklus)">Semua Kategori</option>
              <option value="Bumil">Bumil</option>
              <option value="Nifas/Menyusui">Nifas/Menyusui</option>
              <option value="Bayi 0–11 Bln">Bayi 0–11 Bln</option>
              <option value="Balita 12–59 Bln">Balita 12–59 Bln</option>
              <option value="Apras 60–72 Bln">Apras 60–72 Bln</option>
              <option value="Usekrem 6–14 Thn">Usekrem 6–14 Thn</option>
              <option value="Usekrem 15–18 Thn">Usekrem 15–18 Thn</option>
              <option value="Dewasa">Dewasa</option>
              <option value="Lansia">Lansia</option>
            </select>
          </div>
        </div>
      </div>

      <div className="alert bg-white border border-light-subtle rounded-3 p-3 mb-4 shadow-xs d-flex align-items-center gap-2">
        <span className="text-muted fs-5">ⓘ</span>
        <span className="text-secondary small mb-0">
          Seluruh data klinis spesifik langkah 1-5 dapat dilihat lengkap dalam <strong>satu halaman detail</strong> melalui tombol Lihat Detail.
        </span>
      </div>

      <div className="card card-custom p-0 bg-white border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase fw-bold border-bottom">
                <th className="ps-4 py-3 text-center" style={{ width: "60px" }}>
                  NO
                </th>
                <th className="py-3" style={{ minWidth: "180px" }}>
                  NAMA LENGKAP / NIK
                </th>
                <th className="py-3" style={{ minWidth: "140px" }}>
                  KATEGORI
                </th>
                <th className="py-3" style={{ minWidth: "150px", whiteSpace: "nowrap" }}>
                  USIA
                </th>
                <th className="py-3" style={{ minWidth: "160px", whiteSpace: "nowrap" }}>
                  TANGGAL PEMERIKSAAN
                </th>
                <th className="pe-4 py-3 text-center" style={{ width: "130px" }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    Tidak ada data pemeriksaan yang sesuai dengan filter bulan ({selectedMonthNum}) / tahun ({selectedYear}) yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredList.map((row, idx) => (
                  <tr key={row.id} className="border-bottom">
                    <td className="ps-4 text-center fw-medium text-muted small">{idx + 1}</td>
                    <td>
                      <div className="fw-bold text-dark mb-0">{row.nama}</div>
                      <div className="text-muted font-monospace" style={{ fontSize: "0.78rem" }}>
                        {row.nik}
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark mb-0">{row.kategori}</div>
                    </td>
                    <td className="text-dark fw-medium text-nowrap">{row.subText || row.usia || "-"}</td>
                    <td className="text-secondary small text-nowrap">{formatDateId(row.tglPeriksa)}</td>
                    <td className="pe-4 text-center text-nowrap">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none" onClick={() => handleOpenDetail(row)} title="Lihat Detail Hasil 5 Langkah">
                          <Eye size={14} /> <span>Detail</span>
                        </button>
                        <button className="btn btn-sm btn-outline-pink d-inline-flex align-items-center gap-1.5 shadow-none" onClick={() => onNavigate("pemeriksaan", row.subKategori, { wargaId: row.id })} title="Edit Data Pemeriksaan">
                          <Edit size={14} /> <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-light-subtle d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 border-top">
          <span className="text-muted small">
            Menampilkan {filteredList.length} dari {allRekapList.length} sasaran
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className="page-item disabled">
                <span className="page-link">&lt;</span>
              </li>
              <li className="page-item active">
                <span className="page-link bg-dark border-dark">1</span>
              </li>
              <li className="page-item">
                <span className="page-link text-dark">2</span>
              </li>
              <li className="page-item">
                <span className="page-link text-dark">3</span>
              </li>
              <li className="page-item">
                <span className="page-link text-dark">&gt;</span>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {selectedCitizen && (
        <DetailRekapModal
          citizen={selectedCitizen}
          examData={selectedExamDetail}
          isLoading={isLoadingDetail}
          onClose={handleCloseDetail}
          theme="kader"
          onEdit={(citizen) => {
            handleCloseDetail();
            onNavigate("pemeriksaan", citizen.subKategori, { wargaId: citizen.id });
          }}
        />
      )}

      <ExportRekapModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentCategory={selectedCategory}
        currentYear={selectedYear}
        globalSasaranList={globalSasaranList}
        globalPemeriksaanData={globalPemeriksaanData}
        filteredList={filteredList}
      />
    </div>
  );
}
