import React from 'react';
import { 
  User, 
  Activity, 
  Baby, 
  ShieldCheck, 
  HeartPulse
} from 'lucide-react';

export default function DetailSasaranModal({
  show = true,
  onHide,
  onClose,
  selectedSasaran,
  citizen,
  theme = null,
  themeColor = null,
  roleTitle = null,
  onEdit = null
}) {
  if (show === false) return null;
  const target = selectedSasaran || citizen;
  if (!target) return null;

  const handleClose = onClose || onHide || (() => {});

  // Determine portal theme colors aligned with portal web
  const isDinkes = theme === 'dinkes' || (themeColor && themeColor.includes('1e3a8a')) || roleTitle?.toLowerCase().includes('dinas');
  const isPuskesmas = theme === 'puskesmas' || (themeColor && themeColor.includes('428A75')) || roleTitle?.toLowerCase().includes('puskesmas');
  
  const primaryColor = themeColor || (isDinkes ? '#1e3a8a' : isPuskesmas ? '#428A75' : '#2b2e4a');
  const accentColor = isDinkes ? '#1e3a8a' : isPuskesmas ? '#428A75' : '#F25B8E';

  const kategori = (target.kategori || 'Sasaran').trim();
  const katLower = kategori.toLowerCase();
  const isStatusActive = (target.status || 'Aktif').toLowerCase() === 'aktif';

  // Helper boolean flags matching form tambah sasaran categories
  const isBumil = katLower.includes('bumil') || katLower.includes('hamil');
  const isNifas = katLower.includes('nifas') || katLower.includes('menyusui');
  const isBayiBalita = katLower.includes('bayi') || katLower.includes('balita') || katLower.includes('apras') || katLower.includes('anak');
  const isUsekremChild = katLower.includes('usekrem') && katLower.includes('6-14');
  const isDewasaLansia = katLower.includes('dewasa') || katLower.includes('lansia');
  const isRemaja = katLower.includes('remaja') || katLower.includes('usekrem');

  // Apakah sasaran adalah anak (tidak memiliki data status pernikahan & pekerjaan di form)
  const isChild = isBayiBalita || isUsekremChild;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          {/* Modal Header */}
          <div 
            className="modal-header text-white p-3 px-4 d-flex align-items-center justify-content-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-white text-dark fw-bold px-2.5 py-1 rounded-pill" style={{ fontSize: '0.74rem' }}>
                  {kategori}
                </span>
                <span className="badge bg-white bg-opacity-25 text-white px-2.5 py-1 rounded-pill" style={{ fontSize: '0.74rem' }}>
                  {target.gender || (isBumil || isNifas ? 'Perempuan' : 'Laki-laki')}
                </span>
                <span className={`badge px-2.5 py-1 rounded-pill ${isStatusActive ? 'bg-success text-white' : 'bg-danger text-white'}`} style={{ fontSize: '0.74rem' }}>
                  {target.status || 'Aktif'}
                </span>
              </div>
              <h5 className="modal-title fw-bold text-white mb-0">Detail Data Sasaran</h5>
            </div>
            
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose}
              aria-label="Tutup"
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4 bg-light">
            
            {/* SECTION 1: Data Identitas Sasaran */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
              <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                <User size={18} style={{ color: accentColor }} />
                <span>Data Identitas Sasaran ({kategori})</span>
              </h6>
              
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      Nomor Induk Kependudukan (NIK)
                    </div>
                    <div className="fw-bold font-monospace text-dark fs-6" style={{ letterSpacing: '0.02em' }}>
                      {target.nik || '-'}
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      Nama Lengkap Sasaran
                    </div>
                    <div className="fw-bold text-dark fs-6">
                      {target.nama || '-'}
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      Tanggal Lahir
                    </div>
                    <div className="fw-bold text-dark">
                      {target.tglLahir || '-'}
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      Jenis Kelamin
                    </div>
                    <div className="fw-bold text-dark">
                      {target.gender || (isBumil || isNifas ? 'Perempuan' : '-')}
                    </div>
                  </div>
                </div>

                {/* Field Nama Ibu / Keluarga untuk anak / remaja (karena balita ada di section kelahiran, dan dewasa/lansia tidak memerlukan data ini) */}
                {!isBayiBalita && !isBumil && !isDewasaLansia && (
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Nama Ibu Kandung / Keluarga
                      </div>
                      <div className="fw-bold text-dark">
                        {target.namaIbu || target.keteranganKeluarga || target.namaAyah || '-'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Pernikahan & Pekerjaan: Hanya untuk Kategori Remaja 15+, Dewasa, Lansia, Bumil, Nifas */}
                {!isChild && !isBumil && (
                  <>
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          Status Pernikahan
                        </div>
                        <div className="fw-bold text-dark">
                          {target.statusPernikahan || '-'}
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          Pekerjaan
                        </div>
                        <div className="fw-bold text-dark">
                          {target.pekerjaan || '-'}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      Nomor Telepon / WhatsApp
                    </div>
                    <div className="fw-bold text-dark">
                      {target.noHp || '-'}
                    </div>
                  </div>
                </div>

                {target.golDarah && (
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Golongan Darah
                      </div>
                      <div className="fw-bold text-dark">
                        {target.golDarah}
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-12">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      Alamat Domisili
                    </div>
                    <div className="fw-bold text-dark">
                      {target.alamat || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Data Spesifik Kategori */}

            {/* --- IBU HAMIL --- */}
            {isBumil && (
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
                <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                  <HeartPulse size={18} style={{ color: accentColor }} />
                  <span>Informasi Kehamilan (Ibu Hamil)</span>
                </h6>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        HPHT (Hari Pertama Haid Terakhir)
                      </div>
                      <div className="fw-bold text-dark">{target.hpht || target.ibuHamilDetail?.obstetri?.hpht || '-'}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Taksiran Persalinan (HPL)
                      </div>
                      <div className="fw-bold text-dark">{target.hpl || target.ibuHamilDetail?.obstetri?.taksiranPersalinan || '-'}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        BB Sebelum Hamil
                      </div>
                      <div className="fw-bold text-dark">
                        {target.bb ? (String(target.bb).includes('kg') ? target.bb : `${target.bb} kg`) : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Tinggi Badan (TB)
                      </div>
                      <div className="fw-bold text-dark">
                        {target.tb ? (String(target.tb).includes('cm') ? target.tb : `${target.tb} cm`) : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Nama Suami / Ayah
                      </div>
                      <div className="fw-bold text-dark">{target.namaAyah || target.namaSuami || '-'}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Anak ke-
                      </div>
                      <div className="fw-bold text-dark">{target.anakKe || target.ibuHamilDetail?.obstetri?.gravida || '1'}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Jarak Anak Sebelumnya
                      </div>
                      <div className="fw-bold text-dark">{target.jarakAnak || target.ibuHamilDetail?.obstetri?.jarakKehamilan || 'Anak Pertama'}</div>
                    </div>
                  </div>
                  {target.statusPersalinan && (
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          Status Persalinan
                        </div>
                        <div className="fw-bold text-dark">{target.statusPersalinan}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- IBU NIFAS & MENYUSUI (Nama Bayi Dihapus sesuai permintaan) --- */}
            {isNifas && (
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
                <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                  <HeartPulse size={18} style={{ color: accentColor }} />
                  <span>Informasi Masa Nifas &amp; Menyusui</span>
                </h6>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Status Menyusui
                      </div>
                      <div className="fw-bold text-dark">{target.statusMenyusui || 'Masih Menyusui (ASI Eksklusif)'}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Tanggal Persalinan
                      </div>
                      <div className="fw-bold text-dark">{target.tglPersalinan || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- BAYI & BALITA (0 - 59 Bulan / Apras) --- */}
            {isBayiBalita && (
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
                <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                  <Baby size={18} style={{ color: accentColor }} />
                  <span>Informasi Kelahiran &amp; Pertumbuhan Anak</span>
                </h6>
                <div className="row g-3">
                  <div className="col-12 col-sm-6 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.03em', fontWeight: 500 }}>
                        Berat Lahir (BBL)
                      </div>
                      <div className="fs-5 fw-bold text-dark">
                        {target.bbl ? (String(target.bbl).includes('kg') ? target.bbl : `${target.bbl} kg`) : (target.bb ? `${target.bb} kg` : '-')}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.03em', fontWeight: 500 }}>
                        Panjang Lahir (PBL)
                      </div>
                      <div className="fs-5 fw-bold text-dark">
                        {target.pbl ? (String(target.pbl).includes('cm') ? target.pbl : `${target.pbl} cm`) : (target.tb ? `${target.tb} cm` : '-')}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Nama Ibu
                      </div>
                      <div className="fw-bold text-dark">
                        {target.namaIbu || '-'}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Nama Ayah
                      </div>
                      <div className="fw-bold text-dark">
                        {target.namaAyah || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- USEKREM / REMAJA / DEWASA / LANSIA (Skrining Kemenkes) --- */}
            {(isRemaja || isDewasaLansia) && (
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-3 bg-white">
                <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                  <Activity size={18} style={{ color: accentColor }} />
                  <span>Skrining Riwayat Penyakit &amp; Perilaku Berisiko</span>
                </h6>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Riwayat Penyakit Keluarga
                      </div>
                      <div className="fw-bold text-dark">
                        {Array.isArray(target.riwayatKeluarga) && target.riwayatKeluarga.length > 0
                          ? target.riwayatKeluarga.join(', ')
                          : (target.riwayatKeluarga || 'Tidak Ada')}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <div className="text-muted small mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Riwayat Diri Sendiri
                      </div>
                      <div className="fw-bold text-dark">
                        {Array.isArray(target.riwayatDiriSendiri) && target.riwayatDiriSendiri.length > 0
                          ? target.riwayatDiriSendiri.join(', ')
                          : Array.isArray(target.perilakuBerisikoUsekrem) && target.perilakuBerisikoUsekrem.length > 0
                          ? target.perilakuBerisikoUsekrem.join(', ')
                          : (target.riwayatDiriSendiri || target.riwayatPenyakit || 'Tidak Ada')}
                      </div>
                    </div>
                  </div>

                  {/* Skrining Perilaku Berisiko untuk Dewasa / Lansia */}
                  {isDewasaLansia && (
                    <div className="col-12">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <div className="text-muted small mb-2" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          Perilaku Berisiko Diri Sendiri
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          <span className="badge bg-white text-dark border px-3 py-1.5 fw-medium">
                            Merokok: <strong className={typeof target.perilakuBerisikoDewasa === 'object' && target.perilakuBerisikoDewasa?.merokok === 'Ya' ? 'text-danger' : (target.perilakuBerisiko?.merokok === 'Ya' ? 'text-danger' : 'text-success')}>
                              {target.perilakuBerisikoDewasa?.merokok || target.perilakuBerisiko?.merokok || 'Tidak'}
                            </strong>
                          </span>
                          <span className="badge bg-white text-dark border px-3 py-1.5 fw-medium">
                            Tinggi Gula: <strong className={typeof target.perilakuBerisikoDewasa === 'object' && target.perilakuBerisikoDewasa?.tinggiGula === 'Ya' ? 'text-danger' : (target.perilakuBerisiko?.tinggiGula === 'Ya' ? 'text-danger' : 'text-success')}>
                              {target.perilakuBerisikoDewasa?.tinggiGula || target.perilakuBerisiko?.tinggiGula || 'Tidak'}
                            </strong>
                          </span>
                          <span className="badge bg-white text-dark border px-3 py-1.5 fw-medium">
                            Tinggi Garam: <strong className={typeof target.perilakuBerisikoDewasa === 'object' && target.perilakuBerisikoDewasa?.tinggiGaram === 'Ya' ? 'text-danger' : (target.perilakuBerisiko?.tinggiGaram === 'Ya' ? 'text-danger' : 'text-success')}>
                              {target.perilakuBerisikoDewasa?.tinggiGaram || target.perilakuBerisiko?.tinggiGaram || 'Tidak'}
                            </strong>
                          </span>
                          <span className="badge bg-white text-dark border px-3 py-1.5 fw-medium">
                            Tinggi Lemak: <strong className={typeof target.perilakuBerisikoDewasa === 'object' && target.perilakuBerisikoDewasa?.tinggiLemak === 'Ya' ? 'text-danger' : (target.perilakuBerisiko?.tinggiLemak === 'Ya' ? 'text-danger' : 'text-success')}>
                              {target.perilakuBerisikoDewasa?.tinggiLemak || target.perilakuBerisiko?.tinggiLemak || 'Tidak'}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-white p-3 px-4 d-flex justify-content-between align-items-center">
            <div className="text-muted small d-flex align-items-center gap-1.5">
              <ShieldCheck size={16} style={{ color: primaryColor }} />
              <span>Data sasaran tersinkronisasi realtime dengan Sistem Posyandu &amp; Puskesmas</span>
            </div>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-sm px-4 rounded-3" 
              onClick={handleClose}
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
