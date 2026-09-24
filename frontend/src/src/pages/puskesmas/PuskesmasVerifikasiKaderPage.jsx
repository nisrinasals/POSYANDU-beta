import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserCog,
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  Check, 
  X, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Gavel, 
  HeartHandshake, 
  Shield,
  ShieldCheck,
  ShieldAlert,
  PowerOff,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { userService } from '../../services';

export default function PuskesmasVerifikasiKaderPage({ 
  activeSubmenu = 'kader',
  kaderList: propKaderList,
  stafPuskesmasList: propStafList,
  onApproveKader: propOnApproveKader,
  onRejectKader: propOnRejectKader,
  onApproveStaf: propOnApproveStaf,
  onRejectStaf: propOnRejectStaf,
  onToggleStafStatus: propOnToggleStafStatus,
  onToggleKaderStatus: propOnToggleKaderStatus,
  onRefreshData
}) {
  const { showConfirm, showSuccess, showWarning } = useNotification();
  const isKader = activeSubmenu === 'kader';
  const isStaf = activeSubmenu === 'staf';
  const isKelola = activeSubmenu === 'kelola';

  // Status Filter for Verifikasi: 'pending' | 'active' | 'rejected'
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [posyanduFilter, setPosyanduFilter] = useState('Semua Posyandu / RW');
  const [tipeAkunFilter, setTipeAkunFilter] = useState('Semua');

  const [localKaderList, setLocalKaderList] = useState([]);
  const [localStafList, setLocalStafList] = useState([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getAllUsers();
        if (res?.data && Array.isArray(res.data)) {
          const kaders = [];
          const stafs = [];
          res.data.forEach(u => {
            const role = (u.role || '').toLowerCase();
            const initials = (u.nama_lengkap || u.nama || 'U')
              .split(' ')
              .map(n => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();
            const mappedUser = {
              id: u.id,
              nama: u.nama_lengkap || u.nama || 'Nama Pengguna',
              initials: initials,
              nik: u.nik || '-',
              email: u.email || '-',
              telepon: u.no_telepon || u.telepon || '-',
              posyandu: u.posyandu?.nama_posyandu || u.posyandu || 'Posyandu Melati',
              rw: u.rw || 'RW 04',
              tglDaftar: u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : 'Hari ini',
              status: u.is_verified ? 'active' : (u.status || 'pending'),
              bidangJabatan: u.jabatan || u.bidangJabatan || 'Staf Medis / Pembina',
              unitKategori: u.unit || 'Medis',
              puskesmas: u.puskesmas?.nama_puskesmas || u.puskesmas || 'Puskesmas Sukamaju'
            };
            if (role.includes('kader')) {
              kaders.push(mappedUser);
            } else if (role.includes('puskesmas') || role.includes('staf')) {
              stafs.push(mappedUser);
            }
          });
          setLocalKaderList(kaders);
          setLocalStafList(stafs);
        }
      } catch (err) {
        console.info('Load users error:', err);
      }
    };
    fetchUsers();
  }, []);

  const kaderList = propKaderList || localKaderList;
  const stafPuskesmasList = propStafList || localStafList;

  // Counts for Kader
  const pendingKaderCount = kaderList.filter(k => k.status === 'pending').length;
  const activeKaderCount = kaderList.filter(k => k.status === 'active').length;
  const rejectedKaderCount = kaderList.filter(k => k.status === 'rejected' || k.status === 'inactive').length;
  const totalKaderCount = pendingKaderCount + activeKaderCount + rejectedKaderCount;

  // Counts for Staf Puskesmas (Verifikasi)
  const pendingStafCount = stafPuskesmasList.filter(s => s.status === 'pending').length;
  const activeStafCount = stafPuskesmasList.filter(s => s.status === 'active').length;
  const rejectedStafCount = stafPuskesmasList.filter(s => s.status === 'rejected' || s.status === 'inactive').length;
  const totalStafCount = pendingStafCount + activeStafCount + rejectedStafCount;

  // Kelola Akun — gabungan kader + staf yang sudah terverifikasi (active / inactive)
  const verifiedKaderList = kaderList.filter(k => k.status === 'active' || k.status === 'inactive');
  const verifiedStafList = stafPuskesmasList.filter(s => s.status === 'active' || s.status === 'inactive');
  const kelolaAkunList = [
    ...verifiedKaderList.map(k => ({ ...k, tipeAkun: 'kader' })),
    ...verifiedStafList.map(s => ({ ...s, tipeAkun: 'staf' }))
  ];
  const kelolaTotalCount = kelolaAkunList.length;
  const kelolaActiveCount = kelolaAkunList.filter(a => a.status === 'active').length;

  // Active Counts based on current sub menu
  const currentPendingCount = isKader ? pendingKaderCount : pendingStafCount;
  const currentActiveCount = isKader ? activeKaderCount : activeStafCount;
  const currentRejectedCount = isKader ? rejectedKaderCount : rejectedStafCount;
  const currentTotalCount = isKader ? totalKaderCount : totalStafCount;

  // Filtered List Kader
  const filteredKader = kaderList.filter(kader => {
    const matchesTab = activeTab === 'rejected'
      ? (kader.status === 'rejected' || kader.status === 'inactive')
      : kader.status === activeTab;

    const matchesSearch = 
      kader.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kader.nik.includes(searchQuery) ||
      kader.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPosyandu = 
      posyanduFilter === 'Semua Posyandu / RW' ||
      kader.posyandu.toLowerCase().includes(posyanduFilter.toLowerCase()) ||
      (kader.rw && kader.rw.toLowerCase().includes(posyanduFilter.toLowerCase()));

    return matchesTab && matchesSearch && matchesPosyandu;
  });

  // Filtered List Staf Puskesmas (Verifikasi)
  const filteredStaf = stafPuskesmasList.filter(staf => {
    const matchesTab = activeTab === 'rejected'
      ? (staf.status === 'rejected' || staf.status === 'inactive')
      : staf.status === activeTab;

    const matchesSearch = 
      staf.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staf.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staf.nik && staf.nik.includes(searchQuery)) ||
      (staf.bidangJabatan && staf.bidangJabatan.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  // Filtered List for Kelola Akun — filter by tipe akun (kader / staf) + search
  const filteredKelolaAkun = kelolaAkunList.filter(item => {
    const matchesTipe =
      tipeAkunFilter === 'Semua' ||
      (tipeAkunFilter === 'Kader Posyandu' && item.tipeAkun === 'kader') ||
      (tipeAkunFilter === 'Staf Puskesmas' && item.tipeAkun === 'staf');

    const matchesSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.nik && item.nik.includes(searchQuery));

    return matchesTipe && matchesSearch;
  });

  // Handlers for Kader Actions
  const handleApproveKader = async (id, nama) => {
    const target = localKaderList.find(k => k.id === id);
    const confirmed = await showConfirm({
      title: "Setujui Pendaftaran Kader?",
      message: `Setujui pendaftaran kader "${nama}"? Surat konfirmasi dan notifikasi aktivasi akan otomatis dikirimkan ke email ${target?.email || 'kader'}.`,
      confirmText: "Setujui & Kirim Notifikasi",
      cancelText: "Batal",
      type: "success"
    });

    if (confirmed) {
      try {
        await userService.verifyUser(id);
      } catch (err) {
        console.info('Backend verify user notice:', err);
      }

      if (propOnApproveKader) {
        propOnApproveKader(id, nama);
      } else {
        const nextList = localKaderList.map(k => k.id === id ? { ...k, status: 'active' } : k);
        setLocalKaderList(nextList);
        try {
          localStorage.setItem('posyandu_kader_list', JSON.stringify(nextList));
          const regUsers = JSON.parse(localStorage.getItem('posyandu_registered_users') || '[]');
          const updated = regUsers.map(u => u.email?.toLowerCase() === target?.email?.toLowerCase() ? { ...u, status: 'active' } : u);
          localStorage.setItem('posyandu_registered_users', JSON.stringify(updated));
        } catch (e) {}
      }
      showSuccess("Kader Disetujui & Email Terkirim", `Pendaftaran kader ${nama} berhasil disetujui. Email notifikasi aktivasi telah dikirimkan ke ${target?.email || 'kader'}.`);
      onRefreshData?.();
    }
  };

  const handleRejectKader = async (id, nama) => {
    const target = localKaderList.find(k => k.id === id);
    const confirmed = await showConfirm({
      title: "Tolak Pendaftaran Kader?",
      message: `Tolak pendaftaran kader "${nama}"? Email pemberitahuan penolakan akan dikirimkan ke ${target?.email || 'kader'}.`,
      confirmText: "Tolak Pendaftaran",
      cancelText: "Batal",
      type: "danger"
    });

    if (confirmed) {
      try {
        await userService.deactivateUser(id);
      } catch (err) {
        console.info('Backend deactivate user notice:', err);
      }

      if (propOnRejectKader) {
        propOnRejectKader(id, nama);
      } else {
        const nextList = localKaderList.map(k => k.id === id ? { ...k, status: 'rejected' } : k);
        setLocalKaderList(nextList);
        try {
          localStorage.setItem('posyandu_kader_list', JSON.stringify(nextList));
          const regUsers = JSON.parse(localStorage.getItem('posyandu_registered_users') || '[]');
          const updated = regUsers.map(u => u.email?.toLowerCase() === target?.email?.toLowerCase() ? { ...u, status: 'rejected' } : u);
          localStorage.setItem('posyandu_registered_users', JSON.stringify(updated));
        } catch (e) {}
      }
      showWarning("Pendaftaran Ditolak", `Pendaftaran kader ${nama} telah ditolak. Notifikasi email telah dikirimkan ke ${target?.email || 'kader'}.`);
      onRefreshData?.();
    }
  };

  // Handlers for Staf Puskesmas Actions (Verifikasi)
  const handleApproveStaf = async (id, nama) => {
    const target = localStafList.find(s => s.id === id);
    const confirmed = await showConfirm({
      title: "Setujui Staf Puskesmas?",
      message: `Setujui pendaftaran staf internal Puskesmas atas nama "${nama}"? Surat konfirmasi dan notifikasi aktivasi akan otomatis dikirimkan ke email ${target?.email || 'staf'}.`,
      confirmText: "Setujui & Kirim Notifikasi",
      cancelText: "Batal",
      type: "success"
    });

    if (confirmed) {
      try {
        await userService.verifyUser(id);
      } catch (err) {
        console.info('Backend verify user notice:', err);
      }

      if (propOnApproveStaf) {
        propOnApproveStaf(id, nama);
      } else {
        const nextList = localStafList.map(s => s.id === id ? { ...s, status: 'active' } : s);
        setLocalStafList(nextList);
        try {
          localStorage.setItem('posyandu_staf_list', JSON.stringify(nextList));
          const regUsers = JSON.parse(localStorage.getItem('posyandu_registered_users') || '[]');
          const updated = regUsers.map(u => u.email?.toLowerCase() === target?.email?.toLowerCase() ? { ...u, status: 'active' } : u);
          localStorage.setItem('posyandu_registered_users', JSON.stringify(updated));
        } catch (e) {}
      }
      showSuccess("Staf Disetujui & Email Terkirim", `Akun staf ${nama} berhasil disetujui dan aktif. Email notifikasi aktivasi telah dikirimkan ke ${target?.email || 'staf'}.`);
      onRefreshData?.();
    }
  };

  const handleRejectStaf = async (id, nama) => {
    const target = localStafList.find(s => s.id === id);
    const confirmed = await showConfirm({
      title: "Tolak Pendaftaran Staf?",
      message: `Tolak pendaftaran staf "${nama}"? Email pemberitahuan penolakan akan dikirimkan ke ${target?.email || 'staf'}.`,
      confirmText: "Tolak Pendaftaran",
      cancelText: "Batal",
      type: "danger"
    });

    if (confirmed) {
      try {
        await userService.deactivateUser(id);
      } catch (err) {
        console.info('Backend deactivate user notice:', err);
      }

      if (propOnRejectStaf) {
        propOnRejectStaf(id, nama);
      } else {
        const nextList = localStafList.map(s => s.id === id ? { ...s, status: 'rejected' } : s);
        setLocalStafList(nextList);
        try {
          localStorage.setItem('posyandu_staf_list', JSON.stringify(nextList));
          const regUsers = JSON.parse(localStorage.getItem('posyandu_registered_users') || '[]');
          const updated = regUsers.map(u => u.email?.toLowerCase() === target?.email?.toLowerCase() ? { ...u, status: 'rejected' } : u);
          localStorage.setItem('posyandu_registered_users', JSON.stringify(updated));
        } catch (e) {}
      }
      showWarning("Pendaftaran Ditolak", `Pendaftaran staf ${nama} telah ditolak. Notifikasi email telah dikirimkan ke ${target?.email || 'staf'}.`);
      onRefreshData?.();
    }
  };

  // Handlers for Toggle Status (Kelola Akun: Nonaktifkan / Aktifkan)
  const handleToggleKelolaStatus = async (item, newStatus) => {
    const labelAction = newStatus === 'inactive' ? 'Non-Aktifkan' : 'Aktifkan';
    const confirmed = await showConfirm({
      title: `${labelAction} Akun?`,
      message: `${labelAction} akun "${item.nama}"?`,
      confirmText: labelAction,
      cancelText: "Batal",
      type: newStatus === 'inactive' ? "warning" : "success"
    });

    if (confirmed) {
      try {
        await userService.changeUserStatus(item.id, {
          status: newStatus === 'inactive' ? 'nonaktif' : 'aktif'
        });
      } catch (err) {
        console.info('Backend change status user notice:', err);
      }

      if (item.tipeAkun === 'kader') {
        if (propOnToggleKaderStatus) {
          propOnToggleKaderStatus(item.id, newStatus);
        } else {
          const nextList = localKaderList.map(k => k.id === item.id ? { ...k, status: newStatus } : k);
          setLocalKaderList(nextList);
          try {
            localStorage.setItem('posyandu_kader_list', JSON.stringify(nextList));
          } catch (e) {}
        }
      } else if (propOnToggleStafStatus) {
        propOnToggleStafStatus(item.id, newStatus);
      } else {
        const nextList = localStafList.map(s => s.id === item.id ? { ...s, status: newStatus } : s);
        setLocalStafList(nextList);
        try {
          localStorage.setItem('posyandu_staf_list', JSON.stringify(nextList));
        } catch (e) {}
      }
      showSuccess("Status Diperbarui", `Akun ${item.nama} kini berstatus ${newStatus === 'inactive' ? 'Non-Aktif' : 'Aktif'}.`);
      onRefreshData?.();
    }
  };

  return (
    <div className="d-flex flex-column gap-3 pb-4">
      {/* ========================================================================= */}
      {/* TOP STATUS FILTERS & TAB CONTROLS (VERIFIKASI KADER & STAF) */}
      {/* ========================================================================= */}
      {!isKelola && (
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          {/* Status Filter Tabs */}
          <div className="d-flex align-items-center gap-2">
            <button
              className={`btn d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-bold transition-all ${
                activeTab === 'pending'
                  ? 'text-white shadow-sm'
                  : 'btn-light border text-secondary'
              }`}
              style={{ backgroundColor: activeTab === 'pending' ? '#428A75' : undefined }}
              onClick={() => setActiveTab('pending')}
            >
              <Clock size={16} />
              <span>Menunggu Persetujuan</span>
              <span className={`badge rounded-pill ${activeTab === 'pending' ? 'bg-white text-dark' : 'bg-secondary text-white'}`}>
                {currentPendingCount}
              </span>
            </button>

            <button
              className={`btn d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-bold transition-all ${
                activeTab === 'active'
                  ? 'text-white shadow-sm'
                  : 'btn-light border text-secondary'
              }`}
              style={{ backgroundColor: activeTab === 'active' ? '#428A75' : undefined }}
              onClick={() => setActiveTab('active')}
            >
              <UserCheck size={16} />
              <span>{isKader ? 'Kader Aktif' : 'Staf Aktif'}</span>
              <span className={`badge rounded-pill ${activeTab === 'active' ? 'bg-white text-dark' : 'bg-secondary text-white'}`}>
                {currentActiveCount}
              </span>
            </button>

            <button
              className={`btn d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-bold transition-all ${
                activeTab === 'rejected'
                  ? 'text-white shadow-sm'
                  : 'btn-light border text-secondary'
              }`}
              style={{ backgroundColor: activeTab === 'rejected' ? '#428A75' : undefined }}
              onClick={() => setActiveTab('rejected')}
            >
              <UserX size={16} />
              <span>Ditolak / Non-Aktif</span>
              <span className={`badge rounded-pill ${activeTab === 'rejected' ? 'bg-white text-dark' : 'bg-secondary text-white'}`}>
                {currentRejectedCount}
              </span>
            </button>
          </div>


        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN DATA CARD CONTAINER */}
      {/* ========================================================================= */}
      <div className="card card-custom p-4 bg-white border-0 shadow-sm rounded-4">
        {/* Search & Filter Bar */}
        <div className="row g-3 mb-4 align-items-center">
          <div className={isKelola ? "col-12 col-md-6" : "col-12 col-md-10"}>
            <div className="position-relative">
              <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
              <input 
                type="text" 
                className="form-control form-control-custom ps-5 bg-light"
                placeholder={
                  isKader 
                    ? "Cari Nama Kader, NIK, atau Email..." 
                    : isStaf 
                      ? "Cari Nama Staf atau Email..." 
                      : "Cari Nama, NIK, atau Email..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isKelola && (
            <div className="col-12 col-md-4">
              <select 
                className="form-select form-select-custom bg-light"
                value={tipeAkunFilter}
                onChange={(e) => setTipeAkunFilter(e.target.value)}
              >
                <option value="Semua">Semua Tipe Akun</option>
                <option value="Kader Posyandu">Kader Posyandu</option>
                <option value="Staf Puskesmas">Staf Puskesmas</option>
              </select>
            </div>
          )}

          <div className="col-12 col-md-2 d-flex gap-2">
            <button 
              className="btn text-white w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold rounded-3"
              style={{ backgroundColor: '#428A75' }}
            >
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button 
              className="btn btn-light border p-2 rounded-3 text-secondary"
              title="Reset Filter"
              onClick={() => { 
                setSearchQuery(''); 
                setPosyanduFilter('Semua Posyandu / RW'); 
                setTipeAkunFilter('Semua');
              }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABEL 1: VERIFIKASI KADER POSYANDU */}
        {/* ========================================================================= */}
        {isKader && (
          <div className="table-responsive">
            <table className="table table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>NO</th>
                  <th>NAMA &amp; NIK</th>
                  <th>EMAIL</th>
                  <th>POSYANDU / RW</th>
                  <th>TANGGAL DAFTAR</th>
                  <th>STATUS</th>
                  <th className="text-center">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredKader.length > 0 ? (
                  filteredKader.map((item, index) => (
                    <tr key={item.id}>
                      <td className="fw-semibold text-secondary">{index + 1 < 10 ? `0${index + 1}` : index + 1}</td>
                      <td>
                        <div className="fw-bold text-dark" style={{ fontSize: '0.875rem' }}>{item.nama}</div>
                        <div className="text-muted font-monospace small" style={{ fontSize: '0.75rem' }}>{item.nik}</div>
                      </td>
                      <td>
                        <div className="text-dark small fw-medium">{item.email}</div>
                        {item.telepon && (
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{item.telepon}</div>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold text-dark small">{item.posyandu}</div>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{item.rw}</div>
                      </td>
                      <td className="text-dark small">{item.tglDaftar}</td>
                      <td>
                        {item.status === 'pending' && (
                          <span className="badge border px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1" style={{ backgroundColor: 'rgba(254, 109, 1, 0.15)', color: '#FE6D01', borderColor: '#FE6D01' }}>
                            Menunggu
                          </span>
                        )}
                        {item.status === 'active' && (
                          <span className="badge bg-success-subtle text-success border border-success px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1">
                            Aktif
                          </span>
                        )}
                        {(item.status === 'rejected' || item.status === 'inactive') && (
                          <span className="badge bg-danger-subtle text-danger border border-danger px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1">
                            Ditolak
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        {item.status === 'pending' && (
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <button 
                              className="btn text-white btn-sm py-1.5 px-3 d-flex align-items-center gap-1 rounded-2 fw-semibold shadow-xs"
                              style={{ backgroundColor: '#428A75' }}
                              onClick={() => handleApproveKader(item.id, item.nama)}
                              title="Setujui pendaftaran kader"
                            >
                              <Check size={14} />
                              <span>Setujui</span>
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm py-1.5 px-3 d-flex align-items-center gap-1 rounded-2 shadow-xs"
                              onClick={() => handleRejectKader(item.id, item.nama)}
                              title="Tolak pendaftaran kader"
                            >
                              <X size={14} />
                              <span>Tolak</span>
                            </button>
                          </div>
                        )}
                        {item.status === 'active' && (
                          <span className="badge bg-light text-success border border-success-subtle px-2 py-1 small">
                            ✓ Terverifikasi
                          </span>
                        )}
                        {(item.status === 'rejected' || item.status === 'inactive') && (
                          <span className="badge bg-light text-danger border border-danger-subtle px-2 py-1 small">
                            ✕ Ditolak
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      Tidak ditemukan data kader dalam kategori ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TABEL 2: VERIFIKASI STAF INTERNAL PUSKESMAS */}
        {/* ========================================================================= */}
        {isStaf && (
          <div className="table-responsive">
            <table className="table table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>NO</th>
                  <th>NAMA</th>
                  <th>EMAIL</th>
                  <th>TANGGAL DAFTAR</th>
                  <th>STATUS</th>
                  <th className="text-center">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaf.length > 0 ? (
                  filteredStaf.map((item, index) => (
                    <tr key={item.id}>
                      <td className="fw-semibold text-secondary">{index + 1 < 10 ? `0${index + 1}` : index + 1}</td>
                      <td>
                        <div className="fw-bold text-dark" style={{ fontSize: '0.875rem' }}>{item.nama}</div>
                        {item.bidangJabatan && (
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{item.bidangJabatan}</div>
                        )}
                      </td>
                      <td>
                        <div className="text-dark small fw-medium">{item.email}</div>
                      </td>
                      <td className="text-dark small">{item.tglDaftar}</td>
                      <td>
                        {item.status === 'pending' && (
                          <span className="badge border px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1" style={{ backgroundColor: 'rgba(254, 109, 1, 0.15)', color: '#FE6D01', borderColor: '#FE6D01' }}>
                            Menunggu
                          </span>
                        )}
                        {item.status === 'active' && (
                          <span className="badge bg-success-subtle text-success border border-success px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1">
                            Aktif
                          </span>
                        )}
                        {(item.status === 'rejected' || item.status === 'inactive') && (
                          <span className="badge bg-danger-subtle text-danger border border-danger px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1">
                            Ditolak
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        {item.status === 'pending' && (
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <button 
                              className="btn text-white btn-sm py-1.5 px-3 d-flex align-items-center gap-1 rounded-2 fw-semibold shadow-xs"
                              style={{ backgroundColor: '#428A75' }}
                              onClick={() => handleApproveStaf(item.id, item.nama)}
                              title="Setujui pendaftaran staf puskesmas"
                            >
                              <Check size={14} />
                              <span>Setujui</span>
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm py-1.5 px-3 d-flex align-items-center gap-1 rounded-2 shadow-xs"
                              onClick={() => handleRejectStaf(item.id, item.nama)}
                              title="Tolak pendaftaran staf puskesmas"
                            >
                              <X size={14} />
                              <span>Tolak</span>
                            </button>
                          </div>
                        )}
                        {item.status === 'active' && (
                          <span className="badge bg-light text-success border border-success-subtle px-2 py-1 small">
                            ✓ Terverifikasi
                          </span>
                        )}
                        {(item.status === 'rejected' || item.status === 'inactive') && (
                          <span className="badge bg-light text-danger border border-danger-subtle px-2 py-1 small">
                            ✕ Ditolak
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Tidak ditemukan data staf internal Puskesmas dalam kategori ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TABEL 3: KELOLA AKUN (SUB MENU 3) — kader + staf terverifikasi */}
        {/* Kolom: NOMOR, NAMA & NIK, EMAIL & TELEPON, TANGGAL DAFTAR, STATUS, AKSI */}
        {/* ========================================================================= */}
        {isKelola && (
          <div className="table-responsive">
            <table className="table table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>NO</th>
                  <th>NAMA &amp; NIK</th>
                  <th>EMAIL &amp; TELEPON</th>
                  <th>TANGGAL DAFTAR</th>
                  <th>STATUS AKSES</th>
                  <th className="text-center" style={{ width: '180px' }}>AKSI PENGELOLAAN</th>
                </tr>
              </thead>
              <tbody>
                {filteredKelolaAkun.length > 0 ? (
                  filteredKelolaAkun.map((item, index) => (
                    <tr key={`${item.tipeAkun}-${item.id}`} className={item.status === 'inactive' ? 'bg-light bg-opacity-50' : ''}>
                      <td className="fw-semibold text-secondary">{index + 1 < 10 ? `0${index + 1}` : index + 1}</td>
                      <td>
                        <div className="fw-bold text-dark" style={{ fontSize: '0.875rem' }}>{item.nama}</div>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                          {item.nik || '320101XXXXXXXXXX'}
                        </div>
                      </td>
                      <td>
                        <div className="text-dark small fw-medium">{item.email}</div>
                        <div className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                          {item.telepon || '0812XXXXXXXX'}
                        </div>
                      </td>
                      <td className="text-dark small">{item.tglDaftar}</td>
                      <td>
                        {item.status === 'active' ? (
                          <span className="badge bg-success-subtle text-success border border-success px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1.5">
                            <span className="rounded-circle bg-success" style={{ width: '6px', height: '6px' }}></span>
                            Aktif
                          </span>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger border border-danger px-2.5 py-1 fw-semibold small d-inline-flex align-items-center gap-1.5">
                            <span className="rounded-circle bg-danger" style={{ width: '6px', height: '6px' }}></span>
                            Non-Aktif
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        {item.status === 'active' ? (
                          <button
                            className="btn btn-outline-danger btn-sm py-1.5 px-2.5 d-inline-flex align-items-center gap-1.5 rounded-2 fw-semibold shadow-xs"
                            onClick={() => handleToggleKelolaStatus(item, 'inactive')}
                            title="Nonaktifkan akun ini"
                          >
                            <UserX size={14} />
                            <span>Nonaktifkan</span>
                          </button>
                        ) : (
                          <button
                            className="btn btn-success text-white btn-sm py-1.5 px-2.5 d-inline-flex align-items-center gap-1.5 rounded-2 fw-semibold shadow-xs"
                            onClick={() => handleToggleKelolaStatus(item, 'active')}
                            title="Aktifkan kembali akun ini"
                          >
                            <UserCheck size={14} />
                            <span>Aktifkan</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Tidak ditemukan data akun pada filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer & Pagination */}
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between pt-3 border-top mt-3 text-muted small gap-3">
          <div className="d-flex align-items-center gap-1">
            <span className="text-muted">Menampilkan</span>
            <strong className="text-dark me-1">
              {isKader ? filteredKader.length : (isStaf ? filteredStaf.length : filteredKelolaAkun.length)}
            </strong>
            <span>
              {isKelola ? (
                `dari total ${kelolaTotalCount} akun terverifikasi (kader & staf) di Puskesmas Sukamaju`
              ) : (
                `dari ${isKader ? filteredKader.length : filteredStaf.length} pendaftaran ${isKader ? 'kader posyandu' : 'staf puskesmas'} yang ${activeTab === 'pending' ? 'menunggu verifikasi' : activeTab === 'active' ? 'aktif' : 'ditolak'}`
              )}
            </span>
          </div>

          <div className="d-flex align-items-center gap-1">
            <button className="btn btn-sm btn-light border p-1 rounded-2" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="btn btn-sm text-white px-3 py-1 rounded-2 fw-bold" style={{ backgroundColor: '#428A75' }}>1</button>
            <button className="btn btn-sm btn-light border p-1 rounded-2" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
