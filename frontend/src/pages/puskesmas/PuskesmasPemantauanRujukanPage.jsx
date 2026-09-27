import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Eye,
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  RotateCcw,
  Filter,
  User,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { STANDAR_KATEGORI } from '../../data/mockData';
import { rujukanService } from '../../services';

// Helper to extract true referral reasons from Langkah 4 (Screening) & Langkah 3 (Plotting)
const extractReferralIndikasi = (s, exam) => {
  const reasons = [];
  const details = [];

  const l4 = exam?.langkah4 || exam?.detail_skrining || exam || {};
  const l3 = exam?.langkah3 || {};
  const l2 = exam?.langkah2 || exam || {};
  const kat = (s.kategori || s.kategori_sasaran || exam?.kategori_sasaran || '').toLowerCase();

  if (exam?.alasan_rujukan || exam?.alasanRujukan) {
    const rawReason = exam.alasan_rujukan || exam.alasanRujukan;
    reasons.push(rawReason);
    details.push(rawReason);
  }

  const isTbcRisiko = l4.tbc?.is_tbc_terindikasi || 
    [l4.batukTbc, l4.demamTbc, l4.bbTurunTbc, l4.kontakTbc, l4.lesuTbc, l4.batukBesarTbc, l4.nafsuMakanTbc, l4.bbMenurunTbc, l4.lemahLesuTbc, l4.berkeringatMalamTbc, l4.batukDarahTbc, l4.sesakNafasTbc].some(v => v === 'Ya' || v === true);
  if (isTbcRisiko) {
    reasons.push('Terindikasi Gejala TBC');
    details.push('Ditemukan gejala batuk/demam/penurunan berat badan terindikasi TBC yang memerlukan evaluasi TCM/dahak di Puskesmas.');
  }

  const gd = parseInt(l4.gulaDarah || l4.kadar_gula_darah || exam?.kadar_gula || s.gulaDarah);
  if (!isNaN(gd) && gd >= 200) {
    reasons.push(`Hiperglikemia / GDS Tinggi (${gd} mg/dL)`);
    details.push(`Kadar gula darah sewaktu ${gd} mg/dL (≥ 200 mg/dL) terindikasi diabetes melitus.`);
  } else if (!isNaN(gd) && gd >= 140) {
    reasons.push(`Prediabetes / GDS Meningkat (${gd} mg/dL)`);
    details.push(`Kadar gula darah sewaktu ${gd} mg/dL (140-199 mg/dL) memerlukan pemeriksaan toleransi glukosa.`);
  }

  const kol = parseInt(l4.kolesterol || l4.kadar_kolesterol || exam?.kadar_kolesterol || s.kolesterol);
  if (!isNaN(kol) && kol >= 200) {
    reasons.push(`Hiperkolesterolemia (${kol} mg/dL)`);
    details.push(`Kadar kolesterol total ${kol} mg/dL (≥ 200 mg/dL) memerlukan penanganan profil lipid.`);
  }

  const pumaScore = parseInt(l4.skrining_ppok_puma?.total_skor_puma || l4.pumaScore || l4.puma);
  if (!isNaN(pumaScore) && pumaScore >= 6) {
    reasons.push(`Risiko Tinggi PPOK (Skor PUMA: ${pumaScore})`);
    details.push(`Skor kuesioner PUMA ${pumaScore} (≥ 6) memerlukan pemeriksaan spirometri di Puskesmas.`);
  }

  if (l4.skrining_kesehatan_jiwa?.is_rujukan_jiwa || (l4.skriningJiwa && String(l4.skriningJiwa).toLowerCase().includes('rujuk'))) {
    reasons.push('Indikasi Skrining Kesehatan Jiwa');
    details.push('Hasil skrining kesehatan jiwa menunjukkan gejala distres/masalah emosional yang memerlukan konseling lanjutan.');
  }

  if (l4.mataKanan === 'Gangguan' || l4.mataKiri === 'Gangguan' || l4.telingaKanan === 'Gangguan' || l4.telingaKiri === 'Gangguan') {
    reasons.push('Gangguan Fungsi Indera (Mata / Telinga)');
    details.push('Ditemukan penurunan visus hitung jari atau gangguan pendengaran tes berbisik.');
  }

  const hb = parseFloat(l4.periksaHb || l4.hb || s.hb);
  if (!isNaN(hb) && hb < 12.0) {
    reasons.push(`Anemia (Kadar Hb: ${hb} g/dL)`);
    details.push(`Kadar hemoglobin ${hb} g/dL (< 12 g/dL) terindikasi anemia defisiensi zat besi.`);
  }

  if (l4.skrining_aks_barthel?.is_rujukan_aks || (l4.aksKategori && l4.aksKategori !== 'Mandiri' && l4.aksKategori !== 'Mandiri Penuh')) {
    reasons.push(`Penurunan Kemandirian Fisik (AKS: ${l4.aksKategori || 'Ketergantungan'})`);
    details.push('Skrining AKS Barthel menunjukkan ketergantungan fungsional yang memerlukan pendampingan.');
  }
  if (l4.skilasStatus && !String(l4.skilasStatus).toLowerCase().includes('normal') && !String(l4.skilasStatus).toLowerCase().includes('tidak')) {
    reasons.push(`Penurunan Kapasitas Intrinsik (${l4.skilasStatus})`);
    details.push('Skrining SKILAS mendeteksi penurunan domain kognitif, mobilitas, atau nutrisi.');
  }

  const tensiS = parseInt(l2.tensiSistol || l2.td_sistole || (l2.tensi ? String(l2.tensi).split('/')[0] : 0));
  const tensiD = parseInt(l2.tensiDiastol || l2.td_diastole || (l2.tensi ? String(l2.tensi).split('/')[1] : 0));
  if (tensiS >= 140 || tensiD >= 90) {
    reasons.push(`Risiko Hipertensi (${tensiS}/${tensiD} mmHg)`);
    details.push(`Tekanan darah ${tensiS}/${tensiD} mmHg melebihi batas normal (≥ 140/90 mmHg).`);
  }

  const lila = parseFloat(l2.lila || l2.lila_cm);
  if (!isNaN(lila)) {
    if (kat.includes('bumil') && lila < 23.5) {
      reasons.push(`Kurang Energi Kronis (LiLA: ${lila} cm)`);
      details.push(`LiLA ibu hamil ${lila} cm (< 23.5 cm) berisiko KEK dan memerlukan intervensi gizi & PMT.`);
    } else if (kat.includes('lansia') && lila < 21.5) {
      reasons.push(`Risiko Malnutrisi Lansia (LiLA: ${lila} cm)`);
      details.push(`LiLA lansia ${lila} cm (< 21.5 cm) memerlukan pemantauan status gizi.`);
    }
  }

  const lp = parseFloat(l2.lp || l2.lingkar_perut_cm);
  if (!isNaN(lp) && lp > 90) {
    reasons.push(`Obesitas Sentral (Lingkar Perut: ${lp} cm)`);
    details.push(`Lingkar perut ${lp} cm (> 90 cm) meningkatkan risiko penyakit kardiovaskular.`);
  }

  if (l3.bbU && (l3.bbU.toLowerCase().includes('kurang') || l3.bbU.toLowerCase().includes('buruk') || l3.bbU.toLowerCase().includes('turun'))) {
    reasons.push(`Plotting BB/U Kurang Sesuai Kurva`);
    details.push('Pertumbuhan berat badan menurut usia di bawah standar garis kurva KMS/KIA.');
  }
  if (l3.tbU && (l3.tbU.toLowerCase().includes('pendek') || l3.tbU.toLowerCase().includes('stunted'))) {
    reasons.push(`Terindikasi Stunting (TB/U Pendek)`);
    details.push('Panjang/Tinggi badan menurut usia berada di bawah -2 SD standar baku WHO.');
  }
  if (l3.bbTb && (l3.bbTb.toLowerCase().includes('kurang') || l3.bbTb.toLowerCase().includes('wasted'))) {
    reasons.push(`Gizi Kurang (Wasting: BB/TB < -2 SD)`);
    details.push('Status gizi balita memerlukan rujukan pemberian makanan tambahan pemulihan.');
  }

  if (reasons.length === 0) {
    return {
      masalahBadge: 'Hasil Skrining Memerlukan Tindak Lanjut',
      masalahSub: 'Ditemukan indikasi risiko klinis dari hasil skrining & pengukuran fisik yang memerlukan penanganan di Puskesmas.'
    };
  }

  return {
    masalahBadge: reasons.slice(0, 2).join(' • '),
    masalahSub: details.join(' ')
  };
};

export default function PuskesmasPemantauanRujukanPage({ globalSasaranList = [], globalPemeriksaanData = {} }) {
  // State kehadiran pasien rujukan (id: 'Hadir' | 'Tidak Hadir')
  const [attendanceMap, setAttendanceMap] = useState({});

  const dynamicReferrals = useMemo(() => {
    const list = [];
    if (globalSasaranList && globalSasaranList.length > 0) {
      globalSasaranList.forEach(s => {
        const exam = globalPemeriksaanData?.[s.id] || globalPemeriksaanData?.[String(s.id)];
        const l5 = exam?.langkah5;
        const isReferred = (l5 && (l5.statusRujukan === 'Rujuk ke Puskesmas / Pustu' || (typeof l5.statusRujukan === 'string' && l5.statusRujukan.toLowerCase().includes('rujuk')))) ||
                           (s.statusRujukan && typeof s.statusRujukan === 'string' && s.statusRujukan.toLowerCase().includes('rujuk')) ||
                           exam?.is_perlu_rujukan === true;
        if (isReferred) {
          let formattedAge = '-';
          if (s.usia) {
            formattedAge = String(s.usia).replace(/\s*\(.*?\)/g, '').split('•')[0].trim();
          } else if (s.tglLahir || s.tanggalLahir) {
            const birthDate = s.tglLahir || s.tanggalLahir;
            formattedAge = `${new Date().getFullYear() - new Date(birthDate).getFullYear()} Th`;
          }

          const referralIndikasi = extractReferralIndikasi(s, exam);

          list.push({
            id: `RUJ-POS-${s.id}`,
            no: `0${list.length + 1}`,
            nama: s.nama || s.name || 'Warga Posyandu',
            nik: s.nik || '-',
            kategori: s.kategori || 'Sasaran Posyandu',
            kategoriKey: (s.subKategori || s.kategori || '').toLowerCase().replace(/\s+/g, '-'),
            usia: formattedAge,
            posyandu: s.posyandu || 'Posyandu Melati (RW 04)',
            kader: s.kader || exam?.petugasPemeriksa || 'Kader Dzakiyah Al Zahrani',
            masalahBadge: referralIndikasi.masalahBadge,
            masalahSub: referralIndikasi.masalahSub,
            tglDirujuk: exam?.tglPemeriksaan || exam?.tanggal || '26-09-2026',
            kehadiran: 'Hadir',
            catatanKunjungan: ''
          });
        }
      });
    }
    return list;
  }, [globalSasaranList, globalPemeriksaanData]);

  const referrals = useMemo(() => {
    return dynamicReferrals;
  }, [dynamicReferrals]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosyandu, setSelectedPosyandu] = useState('all');
  const [selectedSiklus, setSelectedSiklus] = useState('all');
  const [selectedKehadiranFilter, setSelectedKehadiranFilter] = useState('all');
  
  // List of Posyandu for dropdown filter
  const availablePosyanduList = useMemo(() => {
    const listFromData = referrals.map(item => item.posyandu ? item.posyandu.split('(')[0].trim() : '').filter(Boolean);
    const standardList = [
      'Posyandu Melati',
      'Posyandu Mawar',
      'Posyandu Kenanga',
      'Posyandu Anggrek',
      'Posyandu Dahlia',
      'Posyandu Cempaka',
      'Posyandu Flamboyan',
      'Posyandu Bougenville',
      'Posyandu Teratai'
    ];
    return Array.from(new Set([...standardList, ...listFromData]));
  }, [referrals]);

  // Modal state
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalKehadiran, setModalKehadiran] = useState('Hadir');
  const [modalCatatan, setModalCatatan] = useState('');

  // Filtered referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter(item => {
      const matchSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.nik.includes(searchTerm) ||
                          item.posyandu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.kader && item.kader.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchPosyandu = selectedPosyandu === 'all' || 
                            (item.posyandu && item.posyandu.toLowerCase().includes(selectedPosyandu.toLowerCase()));

      const matchSiklus = selectedSiklus === 'all' || 
                          item.kategori === selectedSiklus;
      
      const currentAttendance = attendanceMap[item.id]?.kehadiran || 'Hadir';
      const matchKehadiran = selectedKehadiranFilter === 'all' || 
                             currentAttendance === selectedKehadiranFilter;

      return matchSearch && matchPosyandu && matchSiklus && matchKehadiran;
    });
  }, [referrals, searchTerm, selectedPosyandu, selectedSiklus, selectedKehadiranFilter, attendanceMap]);

  const handleQuickKehadiranChange = (id, value) => {
    setAttendanceMap(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        kehadiran: value
      }
    }));
  };

  const handleOpenDetailModal = (item) => {
    setSelectedReferral(item);
    const data = attendanceMap[item.id] || { kehadiran: 'Hadir', catatanKunjungan: '' };
    setModalKehadiran(data.kehadiran || 'Hadir');
    setModalCatatan(data.catatanKunjungan || '');
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedReferral(null);
    setShowDetailModal(false);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!selectedReferral) return;

    setAttendanceMap(prev => ({
      ...prev,
      [selectedReferral.id]: {
        kehadiran: modalKehadiran,
        catatanKunjungan: modalCatatan
      }
    }));
    setShowDetailModal(false);
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setSelectedPosyandu('all');
    setSelectedSiklus('all');
    setSelectedKehadiranFilter('all');
  };

  return (
    <div className="d-flex flex-column gap-3 pb-4">
      {/* Filter and Search Bar Section */}
      <div 
        className="card border-0 bg-white shadow-xs rounded-4 p-4"
        style={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <div className="row g-3 align-items-center">
          {/* Search Bar */}
          <div className="col-12 col-md-4">
            <div className="position-relative">
              <Search size={17} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-75" />
              <input 
                type="text" 
                className="form-control bg-white border border-secondary-subtle ps-5 pe-5 rounded-3 shadow-none text-dark"
                placeholder="Cari Nama / NIK / No. KK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ height: '44px', fontSize: '0.875rem', borderColor: '#d0d5dd', borderRadius: '10px' }}
              />
              {searchTerm && (
                <button 
                  className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 text-muted border-0 p-1" 
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Posyandu Select */}
          <div className="col-12 col-sm-6 col-md-3">
            <select 
              className="form-select bg-white border border-secondary-subtle fw-medium text-dark rounded-3 shadow-none"
              value={selectedPosyandu}
              onChange={(e) => setSelectedPosyandu(e.target.value)}
              style={{ height: '44px', fontSize: '0.85rem', borderColor: '#d0d5dd', borderRadius: '10px' }}
            >
              <option value="all">Semua Posyandu</option>
              {availablePosyanduList.map((pos, idx) => (
                <option key={idx} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          {/* Siklus Hidup Select */}
          <div className="col-12 col-sm-6 col-md-2">
            <select 
              className="form-select bg-white border border-secondary-subtle fw-medium text-dark rounded-3 shadow-none"
              value={selectedSiklus}
              onChange={(e) => setSelectedSiklus(e.target.value)}
              style={{ height: '44px', fontSize: '0.85rem', borderColor: '#d0d5dd', borderRadius: '10px' }}
            >
              <option value="all">Semua Kategori</option>
              {STANDAR_KATEGORI.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Kehadiran */}
          <div className="col-12 col-sm-6 col-md-2">
            <select 
              className="form-select bg-white border border-secondary-subtle fw-medium text-dark rounded-3 shadow-none"
              value={selectedKehadiranFilter}
              onChange={(e) => setSelectedKehadiranFilter(e.target.value)}
              style={{ height: '44px', fontSize: '0.85rem', borderColor: '#d0d5dd', borderRadius: '10px' }}
            >
              <option value="all">Semua Status</option>
              <option value="Hadir">Hadir</option>
              <option value="Tidak Hadir">Tidak Hadir</option>
            </select>
          </div>

          {/* Filter Action Button */}
          <div className="col-12 col-md-1">
            <button 
              type="button"
              className="btn w-100 d-flex align-items-center justify-content-center text-white fw-bold rounded-3 shadow-xs"
              style={{ backgroundColor: '#428A75', height: '44px', fontSize: '0.85rem', borderRadius: '10px' }}
              onClick={handleResetFilter}
              title="Filter / Reset"
            >
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Referral Table Card */}
      <div className="card border-0 shadow-xs rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
            <thead className="bg-light small text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.04em', color: '#334155' }}>
              <tr>
                <th className="ps-4 py-3 text-center fw-bold" style={{ width: '45px' }}>NO</th>
                <th className="py-3 fw-bold" style={{ minWidth: '180px' }}>
                  NAMA LENGKAP<br />/ NIK
                </th>
                <th className="py-3 fw-bold" style={{ minWidth: '130px' }}>KATEGORI</th>
                <th className="py-3 fw-bold" style={{ minWidth: '150px' }}>
                  ASAL<br />POSYANDU
                </th>
                <th className="py-3 text-center fw-bold" style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>
                  TANGGAL<br />DIRUJUK
                </th>
                <th className="py-3 fw-bold" style={{ minWidth: '220px' }}>INDIKASI / MASALAH RUJUKAN</th>
                <th className="py-3 fw-bold" style={{ minWidth: '140px' }}>STATUS HADIR</th>
                <th className="pe-4 py-3 text-center fw-bold" style={{ width: '80px' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.length > 0 ? (
                filteredReferrals.map((item, idx) => {
                  const currentKehadiran = attendanceMap[item.id]?.kehadiran || 'Hadir';

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td className="ps-4 py-3 text-center fw-semibold text-secondary">{idx + 1}</td>
                      <td className="py-3">
                        <div className="fw-bold text-dark mb-0">{item.nama}</div>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>{item.nik}</div>
                      </td>
                      <td className="py-3">
                        <div className="fw-semibold text-dark mb-0">{item.kategori}</div>
                      </td>
                      <td className="py-3">
                        <div className="fw-semibold text-dark">{item.posyandu}</div>
                      </td>
                      <td className="py-3 text-center fw-semibold text-secondary font-monospace" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {item.tglDirujuk}
                      </td>
                      <td className="py-3">
                        <div className="text-danger fw-bold mb-1" style={{ fontSize: '0.78rem' }}>
                          {item.masalahBadge}
                        </div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem', lineHeight: '1.35' }}>
                          {item.masalahSub}
                        </div>
                      </td>
                      
                      {/* Pilihan Hadir / Tidak Hadir */}
                      <td className="py-3">
                        <select
                          className="form-select form-select-sm py-1.5 px-2.5 fw-medium text-dark bg-white border rounded-3"
                          style={{ fontSize: '0.82rem', width: 'auto', minWidth: '115px', borderColor: '#cbd5e1' }}
                          value={currentKehadiran}
                          onChange={(e) => handleQuickKehadiranChange(item.id, e.target.value)}
                        >
                          <option value="Hadir">Hadir</option>
                          <option value="Tidak Hadir">Tidak Hadir</option>
                        </select>
                      </td>

                      <td className="pe-4 py-3 text-center text-nowrap">
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none rounded-3 px-2.5 py-1"
                          onClick={() => handleOpenDetailModal(item)}
                          title="Lihat Detail Rujukan"
                        >
                          <Eye size={14} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Tidak ditemukan data pasien rujukan yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="card-footer bg-light py-3 px-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-2" style={{ fontSize: '0.8rem' }}>
          <div className="text-muted">
            Menampilkan <span className="fw-semibold text-dark">{filteredReferrals.length}</span> dari total <span className="fw-semibold text-dark">{referrals.length}</span> data rujukan
          </div>

          <div className="d-flex align-items-center gap-1">
            <button className="btn btn-sm btn-light border p-1 rounded-2" disabled><ChevronLeft size={15} /></button>
            <button className="btn btn-sm text-white px-2.5 py-0.5 fw-bold rounded-2" style={{ backgroundColor: '#428A75' }}>1</button>
            <button className="btn btn-sm btn-light border p-1 rounded-2" disabled><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>

      {/* Modal Detail Rujukan & Catatan */}
      {showDetailModal && selectedReferral && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060, overflowY: 'auto' }} 
          tabIndex="-1"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseDetailModal();
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable my-4" style={{ maxHeight: '90vh' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden d-flex flex-column" style={{ maxHeight: '90vh' }}>
              
              {/* Modal Header */}
              <div 
                className="modal-header text-white p-3 px-4 d-flex align-items-center justify-content-between flex-shrink-0" 
                style={{ backgroundColor: '#428A75' }}
              >
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-white text-dark fw-bold px-2.5 py-1 rounded-pill" style={{ fontSize: '0.74rem' }}>
                      {selectedReferral.kategori} ({selectedReferral.usia})
                    </span>
                    <span className="badge bg-white bg-opacity-25 text-white px-2.5 py-1 rounded-pill" style={{ fontSize: '0.74rem' }}>
                      Status: {selectedReferral.kehadiran || 'Belum Diperiksa'}
                    </span>
                  </div>
                  <h5 className="modal-title fw-bold text-white mb-0">Detail Informasi Rujukan Pasien</h5>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseDetailModal}
                  aria-label="Tutup"
                ></button>
              </div>

              <form onSubmit={handleSaveModal} className="d-flex flex-column flex-grow-1 overflow-hidden">
                {/* Modal Body with smooth scrolling */}
                <div 
                  className="modal-body p-4 bg-light overflow-y-auto"
                  style={{ maxHeight: 'calc(90vh - 130px)', overflowY: 'auto' }}
                >
                  
                  {/* Card 1: Identitas Pasien Warga */}
                  <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
                    <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                      <User size={18} style={{ color: '#428A75' }} />
                      <span>Identitas Pasien Warga</span>
                    </h6>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            Nomor Induk Kependudukan (NIK)
                          </div>
                          <div className="fw-bold font-monospace text-dark fs-6">
                            {selectedReferral.nik}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            Nama Lengkap Pasien
                          </div>
                          <div className="fw-bold text-dark fs-6">
                            {selectedReferral.nama}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            Kategori &amp; Usia
                          </div>
                          <div className="fw-bold text-dark fs-6">
                            {selectedReferral.kategori} ({selectedReferral.usia})
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            Asal Posyandu
                          </div>
                          <div className="fw-bold text-dark fs-6">
                            {selectedReferral.posyandu}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            Kader yang Merujuk
                          </div>
                          <div className="fw-bold text-dark fs-6">
                            {selectedReferral.kader}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Indikasi Masalah Rujukan */}
                  <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
                    <h6 className="fw-bold text-danger mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                      <AlertTriangle size={18} className="text-danger" />
                      <span>Indikasi Klinis &amp; Masalah Medis Rujukan</span>
                    </h6>
                    
                    <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 mb-3">
                      <div className="fw-bold text-danger fs-6 mb-1">{selectedReferral.masalahBadge}</div>
                      <div className="text-dark small" style={{ lineHeight: '1.5' }}>{selectedReferral.masalahSub}</div>
                    </div>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            Tanggal Pengantar Rujukan
                          </div>
                          <div className="fw-bold text-dark fs-6 font-monospace">
                            {selectedReferral.tglDirujuk}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="p-3 bg-light rounded-3 h-100">
                          <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            Fasilitas Rujukan
                          </div>
                          <div className="fw-bold text-dark fs-6">
                            Puskesmas / Pustu
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Presensi & Catatan Kunjungan Rumah */}
                  <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                    <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                      <ShieldCheck size={18} style={{ color: '#428A75' }} />
                      <span>Presensi &amp; Tindak Lanjut Nakes Puskesmas</span>
                    </h6>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold small text-dark mb-1">Status Kehadiran di Puskesmas</label>
                      <select 
                        className="form-select bg-light border-0 fw-semibold py-2.5 rounded-3"
                        value={modalKehadiran}
                        onChange={(e) => setModalKehadiran(e.target.value)}
                      >
                        <option value="Hadir">Hadir</option>
                        <option value="Tidak Hadir">Tidak Hadir (Perlu Kunjungan Rumah)</option>
                      </select>
                    </div>

                    {modalKehadiran === 'Tidak Hadir' && (
                      <div className="mb-2">
                        <label className="form-label fw-bold small text-danger mb-1">Catatan Kunjungan Rumah (Home Visit)</label>
                        <textarea 
                          rows="3" 
                          className="form-control bg-light border-0 py-2.5 rounded-3"
                          placeholder="Tuliskan alasan ketidakhadiran dan jadwal / catatan kunjungan rumah..."
                          value={modalCatatan}
                          onChange={(e) => setModalCatatan(e.target.value)}
                        ></textarea>
                      </div>
                    )}
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="modal-footer bg-white p-3 px-4 d-flex justify-content-end gap-2 border-top flex-shrink-0">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm px-4 rounded-3 fw-semibold" 
                    onClick={handleCloseDetailModal}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-dark-custom text-white btn-sm px-4 rounded-3 fw-semibold" 
                    style={{ backgroundColor: '#428A75' }}
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
