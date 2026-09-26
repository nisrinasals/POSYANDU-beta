import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Check, 
  Search, 
  Building2 
} from 'lucide-react';
import { imunisasiService } from '../../services';

// Daftar Jenis Vaksin / Imunisasi
export const VAKSIN_LIST = [
  { id: 'hb0', name: 'Hepatitis B (<24 Jam / HB 0)' },
  { id: 'bcg', name: 'BCG' },
  { id: 'polio1', name: 'Polio Tetes 1 (OPV 1)' },
  { id: 'polio2', name: 'Polio Tetes 2 (OPV 2)' },
  { id: 'polio3', name: 'Polio Tetes 3 (OPV 3)' },
  { id: 'polio4', name: 'Polio Tetes 4 (OPV 4)' },
  { id: 'ipv1', name: 'Polio Suntik 1 (IPV 1)' },
  { id: 'ipv2', name: 'Polio Suntik 2 (IPV 2)' },
  { id: 'dpthbhib1', name: 'DPT-HB-Hib 1' },
  { id: 'dpthbhib2', name: 'DPT-HB-Hib 2' },
  { id: 'dpthbhib3', name: 'DPT-HB-Hib 3' },
  { id: 'dpthbhib_lanjutan', name: 'DPT-HB-Hib Lanjutan (Booster)' },
  { id: 'pcv1', name: 'PCV 1' },
  { id: 'pcv2', name: 'PCV 2' },
  { id: 'pcv3', name: 'PCV 3 (Lanjutan)' },
  { id: 'rv1', name: 'Rotavirus (RV) 1' },
  { id: 'rv2', name: 'Rotavirus (RV) 2' },
  { id: 'rv3', name: 'Rotavirus (RV) 3' },
  { id: 'mr', name: 'Campak - Rubella (MR)' },
  { id: 'mr_lanjutan', name: 'Campak - Rubella (MR) Lanjutan' },
  { id: 'je', name: 'Japanese Encephalitis (JE)' }
];

/**
 * Komponen Sederhana: Checklist Daftar Jenis Imunisasi & Riwayat
 */
export default function ImunisasiTableHistory({
  wargaId = null,
  tempatImunisasi = 'Posyandu',
  namaRsImunisasi = '',
  onChangeTempat = () => {},
  onChangeNamaRs = () => {},
  selectedImunisasiList = [],
  onUpdateImunisasiList = () => {},
  existingHistory = []
}) {
  const [historyData, setHistoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [manualForm, setManualForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    tempat: 'Posyandu',
    noBatch: ''
  });

  // Fetch riwayat imunisasi dari backend API berdasarkan wargaId
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (!wargaId) {
        setHistoryData(existingHistory || []);
        return;
      }
      try {
        const res = await imunisasiService.getImunisasiByWarga(wargaId);
        if (isMounted) {
          if (res?.data && Array.isArray(res.data)) {
            setHistoryData(res.data);
          } else {
            setHistoryData(existingHistory || []);
          }
        }
      } catch (err) {
        if (isMounted) setHistoryData(existingHistory || []);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, [wargaId, existingHistory]);

  // Petakan riwayat dari database
  const historyMap = useMemo(() => {
    const map = {};
    (historyData || []).forEach(item => {
      if (!item) return;
      const rawName = (item.jenis_imunisasi || item.jenisImunisasi || '').toLowerCase().trim();
      const matched = VAKSIN_LIST.find(v => {
        const vName = v.name.toLowerCase().trim();
        const vId = v.id.toLowerCase().trim();
        return rawName === vName || rawName === vId || rawName.includes(vId) || (vName.includes('mr') && rawName.includes('mr')) || (vName.includes('dpt') && rawName.includes('dpt'));
      });
      const key = matched ? matched.id : rawName;
      map[key] = {
        id: item.id,
        nama: item.jenis_imunisasi || item.jenisImunisasi,
        tanggal: item.tanggal_imunisasi || item.tanggalImunisasi || item.tanggal || '-',
        tempat: item.tempat || 'Posyandu',
        noBatch: item.no_batch || item.noBatch || ''
      };
    });
    return map;
  }, [historyData]);

  // Toggle checklist imunisasi
  const handleToggleVaccine = (v) => {
    const isHistory = !!historyMap[v.id];
    if (isHistory) {
      const hist = historyMap[v.id];
      setEditingVaccine(v);
      setManualForm({
        tanggal: hist.tanggal !== '-' ? hist.tanggal : new Date().toISOString().split('T')[0],
        tempat: hist.tempat || 'Posyandu',
        noBatch: hist.noBatch || ''
      });
      return;
    }

    const isCheckedToday = selectedImunisasiList.some(item => 
      (typeof item === 'string' ? item === v.name : item.id === v.id)
    );

    let updated = [];
    if (isCheckedToday) {
      updated = selectedImunisasiList.filter(item => 
        (typeof item === 'string' ? item !== v.name : item.id !== v.id)
      );
    } else {
      updated = [
        ...selectedImunisasiList,
        {
          id: v.id,
          name: v.name,
          tanggal: new Date().toISOString().split('T')[0],
          tempat: tempatImunisasi || 'Posyandu',
          namaRs: namaRsImunisasi || '',
          noBatch: ''
        }
      ];
    }
    onUpdateImunisasiList(updated);
  };

  // Simpan / Edit data riwayat manual
  const handleSaveManualRecord = (e) => {
    e.preventDefault();
    if (!editingVaccine) return;

    const newRecord = {
      warga_id: wargaId,
      jenis_imunisasi: editingVaccine.name,
      tanggal_imunisasi: manualForm.tanggal,
      tempat: manualForm.tempat,
      no_batch: manualForm.noBatch
    };

    setHistoryData(prev => [
      ...prev.filter(item => (item.jenis_imunisasi || item.jenisImunisasi) !== editingVaccine.name),
      newRecord
    ]);
    setEditingVaccine(null);
  };

  // Hapus riwayat vaksin
  const handleRemoveHistory = (vaccineId, vaccineName) => {
    setHistoryData(prev => prev.filter(item => {
      const name = item.jenis_imunisasi || item.jenisImunisasi;
      return name !== vaccineName && item.id !== vaccineId;
    }));
  };

  // Hitung total selesai
  const totalCompleted = useMemo(() => {
    return VAKSIN_LIST.filter(v => {
      const isHistory = !!historyMap[v.id];
      const isToday = selectedImunisasiList.some(item => (typeof item === 'string' ? item === v.name : item.id === v.id));
      return isHistory || isToday;
    }).length;
  }, [historyMap, selectedImunisasiList]);

  // Filter pencarian
  const filteredVaccines = useMemo(() => {
    if (!searchTerm.trim()) return VAKSIN_LIST;
    const term = searchTerm.toLowerCase();
    return VAKSIN_LIST.filter(v => v.name.toLowerCase().includes(term));
  }, [searchTerm]);

  return (
    <div className="card card-custom p-3 bg-white border-0 shadow-sm mb-3" style={{ borderRadius: '12px' }}>
      {/* Header Ringkas */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-2 mb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <ShieldCheck className="text-primary" size={18} />
          <span className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>Imunisasi &amp; Riwayat Vaksin</span>
          <span className="badge bg-light text-primary border rounded-pill px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
            {totalCompleted} / {VAKSIN_LIST.length} Selesai
          </span>
        </div>

        {/* Input Faskes & Search */}
        <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
          <div className="d-flex align-items-center gap-1">
            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Tempat:</span>
            <select 
              className="form-select form-select-sm py-0.5 px-2 rounded-2"
              style={{ fontSize: '0.78rem', width: 'auto' }}
              value={tempatImunisasi || 'Posyandu'}
              onChange={(e) => onChangeTempat(e.target.value)}
            >
              <option value="Posyandu">Posyandu</option>
              <option value="Puskesmas">Puskesmas</option>
              <option value="Rumah Sakit">RS</option>
              <option value="Klinik / Praktik Mandiri">Klinik</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <input
            type="text"
            className="form-control form-control-sm py-0.5 px-2 bg-light border-0 rounded-2"
            style={{ fontSize: '0.78rem', width: '130px' }}
            placeholder="Cari vaksin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid List Vaksin Tanpa Label Bulan */}
      <div 
        className="row g-1.5 overflow-y-auto pe-1" 
        style={{ maxHeight: '250px', fontSize: '0.8rem' }}
      >
        {filteredVaccines.map((v) => {
          const history = historyMap[v.id];
          const hasHistory = !!history;
          const isCheckedToday = selectedImunisasiList.some(item => 
            (typeof item === 'string' ? item === v.name : item.id === v.id)
          );
          const isChecked = hasHistory || isCheckedToday;

          return (
            <div key={v.id} className="col-md-6">
              <div 
                onClick={() => handleToggleVaccine(v)}
                className={`p-2 rounded-2 border d-flex align-items-center justify-content-between gap-2 user-select-none transition-all ${
                  hasHistory 
                    ? 'bg-success-subtle bg-opacity-30 border-success-subtle' 
                    : isCheckedToday 
                      ? 'bg-primary-subtle bg-opacity-40 border-primary-subtle' 
                      : 'bg-light bg-opacity-50 border-light-subtle hover-bg-light'
                }`}
                style={{ cursor: 'pointer' }}
              >
                {/* Checkbox & Nama Vaksin */}
                <div className="d-flex align-items-center gap-2 overflow-hidden">
                  <input
                    type="checkbox"
                    className="form-check-input mt-0 flex-shrink-0"
                    style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                    checked={isChecked}
                    onChange={() => {}}
                  />
                  <span className={`text-truncate ${isChecked ? 'fw-bold text-dark' : 'text-secondary'}`} title={v.name}>
                    {v.name}
                  </span>
                </div>

                {/* Status Keterangan */}
                <div className="flex-shrink-0 ms-1 text-end" style={{ fontSize: '0.7rem' }}>
                  {hasHistory ? (
                    <span className="text-success fw-bold d-inline-flex align-items-center gap-0.5">
                      ✓ {history.tanggal !== '-' ? history.tanggal : 'Sudah'}
                    </span>
                  ) : isCheckedToday ? (
                    <span className="badge bg-primary text-white px-1.5 py-0.5 rounded-pill" style={{ fontSize: '0.65rem' }}>
                      Hari Ini
                    </span>
                  ) : (
                    <span className="text-muted" style={{ fontSize: '0.68rem' }}>
                      Belum
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Edit / Info Riwayat */}
      {editingVaccine && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '380px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header py-2.5 px-3 border-bottom">
                <span className="modal-title fw-bold text-dark small">Riwayat: {editingVaccine.name}</span>
                <button
                  type="button"
                  className="btn-close btn-sm"
                  onClick={() => setEditingVaccine(null)}
                />
              </div>

              <form onSubmit={handleSaveManualRecord}>
                <div className="modal-body p-3 small">
                  <div className="mb-2">
                    <label className="form-label text-muted mb-0.5" style={{ fontSize: '0.75rem' }}>Tanggal Pemberian:</label>
                    <input
                      type="date"
                      required
                      className="form-control form-control-sm"
                      value={manualForm.tanggal}
                      onChange={(e) => setManualForm({ ...manualForm, tanggal: e.target.value })}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label text-muted mb-0.5" style={{ fontSize: '0.75rem' }}>Tempat / Faskes:</label>
                    <select
                      className="form-select form-select-sm"
                      value={manualForm.tempat}
                      onChange={(e) => setManualForm({ ...manualForm, tempat: e.target.value })}
                    >
                      <option value="Posyandu">Posyandu</option>
                      <option value="Puskesmas">Puskesmas</option>
                      <option value="Rumah Sakit">Rumah Sakit</option>
                      <option value="Klinik / Praktik Mandiri">Klinik</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="mb-1">
                    <label className="form-label text-muted mb-0.5" style={{ fontSize: '0.75rem' }}>No. Batch (Opsional):</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Contoh: B123"
                      value={manualForm.noBatch}
                      onChange={(e) => setManualForm({ ...manualForm, noBatch: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer py-2 px-3 bg-light border-top d-flex justify-content-between">
                  {historyMap[editingVaccine.id] ? (
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-danger px-2 py-1 rounded-pill"
                      style={{ fontSize: '0.72rem' }}
                      onClick={() => {
                        handleRemoveHistory(editingVaccine.id, editingVaccine.name);
                        setEditingVaccine(null);
                      }}
                    >
                      Hapus
                    </button>
                  ) : <div></div>}

                  <div className="d-flex align-items-center gap-1.5">
                    <button
                      type="button"
                      className="btn btn-sm btn-light border px-2.5 py-1 rounded-pill"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setEditingVaccine(null)}
                    >
                      Tutup
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary px-3 py-1 rounded-pill fw-bold"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
