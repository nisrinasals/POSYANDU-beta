import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  User,
  UserPlus,
  UserCheck,
  Heart,
  HeartPulse,
  X,
  LayoutGrid,
  Info,
  ShieldCheck,
  CheckCircle2,
  Baby,
  GraduationCap,
  Users,
  Activity,
  Calendar,
  Stethoscope,
  Building2
} from 'lucide-react';
import { Modal, Button } from 'react-bootstrap';
import { initialSasaranList, daftarPosyandu2026, posyanduList } from '../../data/mockData';
import { wargaService, kehamilanService } from '../../services';
import { mapBackendWargaToFrontend, formatIndoDate, formatUsiaByCategory } from '../../utils/dataMappers';
import { validateNik, formatNikInput, validatePhone, formatPhoneInput, validateBirthDate, validateCategoryAge } from '../../utils/validators';
import { useNotification } from '../../context/NotificationContext';
import SearchablePosyanduSelect from '../../components/common/SearchablePosyanduSelect';
import DetailSasaranModal from '../../components/sasaran/DetailSasaranModal';

export default function DataSasaranPage({ 
  globalSasaranList: sasaranList = [], 
  setGlobalSasaranList: setSasaranList = () => {},
  globalPemeriksaanData = {},
  onNavigate = () => {},
  initialCategoryFilter = 'Semua Kategori',
  setCategoryFilterParam = () => {},
  onRefreshData = () => {}
}) {
  const { showSuccess, showWarning } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [kategoriFilter, setKategoriFilter] = useState(
    initialCategoryFilter && initialCategoryFilter !== 'Semua Kategori' && initialCategoryFilter !== 'all' 
      ? initialCategoryFilter 
      : 'Semua Kategori'
  );

  useEffect(() => {
    if (initialCategoryFilter && initialCategoryFilter !== 'Semua Kategori' && initialCategoryFilter !== 'all') {
      setKategoriFilter(initialCategoryFilter);
    }
  }, [initialCategoryFilter]);

  // Modal Visibility States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // 'Ibu Hamil' | 'Bayi' | 'Standard'
  const [showCategoryFormModal, setShowCategoryFormModal] = useState(false);
  
  // Mutasi Flow Modals (Step 1, Verification, & Step 2)
  const [showMutasiCheckModal, setShowMutasiCheckModal] = useState(false);
  const [showMutasiVerifyModal, setShowMutasiVerifyModal] = useState(false);
  const [showMutasiFormModal, setShowMutasiFormModal] = useState(false);

  // Detail & Edit Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSasaran, setSelectedSasaran] = useState(null);



  // 1. Form State for 3 Variasi Form Sasaran (Bumil, Bayi, Standar + Status Menyusui)
  const [categoryForm, setCategoryForm] = useState({
    // Umum / Standar (Gambar 1)
    nama: '',
    nik: '',
    tglLahir: '',
    namaIbu: '',
    namaAyah: '',
    gender: '',
    noHp: '',
    statusPernikahan: '',
    pekerjaan: '',
    posyandu: '',
    alamat: '',
    status: 'Aktif',
    // Khusus Nifas / Menyusui (Gambar 1 + Status Menyusui)
    statusMenyusui: '',
    // Khusus Bumil (Gambar 2)
    hpht: '',
    hpl: '',
    anakKe: '',
    jarakAnak: '',
    tglPersalinan: '',
    statusPersalinan: '',
    caraPersalinan: '',
    bb: '',
    tb: '',
    bbl: '',
    pbl: ''
  });

  // 2. Form State for Mutasi Flow (Image 3 & 4)
  const [mutasiCheckForm, setMutasiCheckForm] = useState({
    nama: '',
    nik: '',
    namaIbu: '',
    alamatAsal: '',
    posyanduAsal: '',
    tglLahir: '',
    gender: 'Perempuan',
    statusPernikahan: 'Menikah',
    pekerjaan: 'Ibu Rumah Tangga',
    noHp: ''
  });

  // State & Helper untuk Live Autocomplete & Autofill Sasaran Bumil dari Warga Terdaftar (Dewasa / Usekrem)
  const [showNamaSuggestions, setShowNamaSuggestions] = useState(false);
  const [isBumilAutofilled, setIsBumilAutofilled] = useState(false);
  const [autofillCategoryLabel, setAutofillCategoryLabel] = useState('');

  // Daftar warga perempuan yang sudah terdaftar di database Posyandu (Dewasa, Usekrem, dll.)
  const calonBumilList = useMemo(() => {
    return (sasaranList || []).filter(s => {
      if (!s) return false;
      const isFemale = (s.gender === 'Perempuan' || s.gender === 'P');
      const isNotCurrentlyBumil = s.kategori !== 'Bumil' && s.subKategori !== 'bumil';
      return isFemale && isNotCurrentlyBumil;
    });
  }, [sasaranList]);

  // Saran nama yang cocok saat mengetik di input Nama
  const matchingNamaSuggestions = useMemo(() => {
    if (!categoryForm.nama || categoryForm.nama.trim().length < 2) return [];
    const q = categoryForm.nama.trim().toLowerCase();
    return calonBumilList.filter(w => 
      w.nama && w.nama.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [calonBumilList, categoryForm.nama]);

  const handleSelectCitizenForBumil = (w) => {
    let formattedTgl = w.tglLahir || '';
    if (formattedTgl && formattedTgl.includes('-')) {
      const parts = formattedTgl.split('-');
      if (parts[2].length === 4) {
        formattedTgl = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    setCategoryForm(prev => ({
      ...prev,
      nama: w.nama || '',
      nik: w.nik || '',
      tglLahir: formattedTgl || prev.tglLahir,
      noHp: w.noHp || w.telepon || prev.noHp,
      alamat: w.alamat || prev.alamat,
      namaAyah: w.namaSuami || w.namaAyah || prev.namaAyah,
      tb: w.tb || prev.tb,
      bb: w.bb || prev.bb,
      statusPernikahan: w.statusPernikahan || 'Menikah',
      status: w.status || 'Aktif',
      posyandu: w.posyandu || prev.posyandu
    }));
    setShowNamaSuggestions(false);
    setIsBumilAutofilled(true);
    setAutofillCategoryLabel(w.kategori || 'Warga Terdaftar');
  };

  const handleNamaBumilChange = (val) => {
    setCategoryForm(prev => ({ ...prev, nama: val }));
    if (val.trim().length >= 2) {
      setShowNamaSuggestions(true);
      const exact = calonBumilList.find(w => w.nama && w.nama.trim().toLowerCase() === val.trim().toLowerCase());
      if (exact) {
        handleSelectCitizenForBumil(exact);
      } else {
        setIsBumilAutofilled(false);
      }
    } else {
      setShowNamaSuggestions(false);
      setIsBumilAutofilled(false);
    }
  };

  const handleNikBumilChange = (val) => {
    const formatted = formatNikInput(val);
    setCategoryForm(prev => ({ ...prev, nik: formatted }));
    if (formatted.length === 16) {
      const match = calonBumilList.find(w => w.nik === formatted);
      if (match) {
        handleSelectCitizenForBumil(match);
      }
    }
  };

  const [mutasiForm, setMutasiForm] = useState({
    nama: '',
    tglLahir: '',
    nik: '',
    namaIbu: '',
    gender: '',
    noHp: '',
    statusPernikahan: '',
    pekerjaan: '',
    posyandu: '',
    alamatAsal: '',
    posyanduAsal: '',
    alamatDomisiliBaru: '',
    status: 'Aktif'
  });

  // 9 Kategori Posyandu ILP Data (Sesuai Sidebar Pemeriksaan)
  const klasterList = [
    {
      id: 'bumil',
      title: 'Bumil',
      sub: 'Masa Kehamilan',
      icon: <Heart className="text-danger" size={24} />,
      kategoriLabel: 'Bumil'
    },
    {
      id: 'nifas',
      title: 'Nifas/Menyusui',
      sub: 'Pasca Bersalin & Masa Menyusui',
      icon: <Users className="text-primary" size={24} />,
      kategoriLabel: 'Nifas/Menyusui'
    },
    {
      id: 'bayi-0-11',
      title: 'Bayi 0–11 Bln',
      sub: '0 – 11 Bulan',
      icon: <Baby className="text-info" size={24} />,
      kategoriLabel: 'Bayi 0–11 Bln'
    },
    {
      id: 'balita-12-59',
      title: 'Balita 12–59 Bln',
      sub: '12 – 59 Bulan',
      icon: <Baby className="text-success" size={24} />,
      kategoriLabel: 'Balita 12–59 Bln'
    },
    {
      id: 'apras-60-72',
      title: 'Apras 60–72 Bln',
      sub: 'Anak Pra Sekolah (60 – 72 Bulan)',
      icon: <GraduationCap className="text-warning" size={24} />,
      kategoriLabel: 'Apras 60–72 Bln'
    },
    {
      id: 'usekrem-6-14',
      title: 'Usekrem 6–14 Thn',
      sub: 'Usia Sekolah / SD – SMP',
      icon: <GraduationCap className="text-primary" size={24} />,
      kategoriLabel: 'Usekrem 6–14 Thn'
    },
    {
      id: 'usekrem-15-18',
      title: 'Usekrem 15–18 Thn',
      sub: 'Usia Remaja (15 – 18 Thn)',
      icon: <Activity className="text-danger" size={24} />,
      kategoriLabel: 'Usekrem 15–18 Thn'
    },
    {
      id: 'dewasa',
      title: 'Dewasa',
      sub: 'Usia Produktif 19 – 59 Thn',
      icon: <Users className="text-secondary" size={24} />,
      kategoriLabel: 'Dewasa'
    },
    {
      id: 'lansia',
      title: 'Lansia',
      sub: 'Usia Lanjut ≥ 60 Thn',
      icon: <Calendar className="text-dark" size={24} />,
      kategoriLabel: 'Lansia'
    }
  ];

  // Dynamic Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter Logic
  const filteredData = (sasaranList || []).filter(item => {
    if (!item) return false;
    const matchesSearch = 
      (item.nama || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (item.nik || '').includes(searchQuery || '') ||
      (item.keteranganIbuSuami && item.keteranganIbuSuami.toLowerCase().includes((searchQuery || '').toLowerCase()));

    const matchesStatus = 
      statusFilter === 'Semua Status' || 
      item.status === statusFilter;

    const normItemKat = (item.kategori || '').toLowerCase().replace(/[–—]/g, '-').trim();
    const normFilterKat = (kategoriFilter || '').toLowerCase().replace(/[–—]/g, '-').trim();
    const matchesKategori = 
      kategoriFilter === 'Semua Kategori' || 
      normItemKat === normFilterKat ||
      normItemKat.includes(normFilterKat) ||
      normFilterKat.includes(normItemKat);

    return matchesSearch && matchesStatus && matchesKategori;
  });

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, kategoriFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Handle click on Klaster Card (Image 1)
  const handleSelectKlaster = (klaster) => {
    setShowNamaSuggestions(false);
    setIsBumilAutofilled(false);
    setAutofillCategoryLabel('');
    setSelectedCategory(klaster);
    setShowCategoryModal(false);
    setShowCategoryFormModal(true);
    const isFemale = klaster.id === 'bumil' || klaster.id === 'nifas';
    setCategoryForm({
      nama: '',
      nik: '',
      tglLahir: '',
      namaIbu: '',
      namaAyah: '',
      gender: isFemale ? 'Perempuan' : '',
      noHp: '',
      statusPernikahan: '',
      pekerjaan: '',
      posyandu: '',
      alamat: '',
      status: 'Aktif',
      statusMenyusui: '',
      hpht: '',
      hpl: '',
      anakKe: '',
      jarakAnak: '',
      tglPersalinan: '',
      statusPersalinan: '',
      caraPersalinan: '',
      bb: '',
      tb: '',
      bbl: '',
      pbl: '',
      riwayatKeluarga: [],
      riwayatDiriSendiri: [],
      perilakuBerisikoUsekrem: [],
      perilakuBerisikoDewasa: {
        merokok: '',
        tinggiGula: '',
        tinggiGaram: '',
        tinggiLemak: ''
      }
    });
  };

  // Submit Handler Form Sasaran (3 Bentuk: Bumil, Bayi, Standar + Status Menyusui)
  const handleCategoryFormSubmit = async (e) => {
    e.preventDefault();

    // 1. Validasi Nama (Wajib minimal 2 karakter)
    if (!categoryForm.nama || categoryForm.nama.trim().length < 2) {
      showWarning("Validasi Nama", "Nama lengkap sasaran wajib diisi minimal 2 karakter.");
      return;
    }

    // 2. Validasi NIK (Wajib 16 digit angka)
    const nikValidation = validateNik(categoryForm.nik);
    if (!nikValidation.isValid) {
      showWarning("Validasi NIK", nikValidation.message);
      return;
    }

    // 3. Validasi Tanggal Lahir (Wajib diisi & tidak boleh masa depan)
    if (!categoryForm.tglLahir) {
      showWarning("Validasi Tanggal Lahir", "Tanggal lahir sasaran wajib diisi.");
      return;
    }
    const birthValidation = validateBirthDate(categoryForm.tglLahir);
    if (!birthValidation.isValid) {
      showWarning("Validasi Tanggal Lahir", birthValidation.message);
      return;
    }

    const katId = selectedCategory?.id || 'dewasa';

    // Validasi Kesesuaian Kategori vs Usia
    const ageCategoryValidation = validateCategoryAge(katId, categoryForm.tglLahir, categoryForm.gender);
    if (!ageCategoryValidation.isValid) {
      showWarning("Kategori Sasaran Tidak Sesuai", ageCategoryValidation.message);
      return;
    }

    // 4. Validasi Alamat (Wajib diisi)
    if (!categoryForm.alamat || categoryForm.alamat.trim().length < 3) {
      showWarning("Validasi Alamat", "Alamat domisili sasaran wajib diisi minimal 3 karakter.");
      return;
    }

    // 5. Validasi Nomor Telepon (Opsional, tapi jika diisi harus valid)
    if (categoryForm.noHp) {
      const phoneValidation = validatePhone(categoryForm.noHp);
      if (!phoneValidation.isValid) {
        showWarning("Validasi Nomor Telepon", phoneValidation.message);
        return;
      }
    }

    const isChild = ['bayi-0-11', 'balita-12-59', 'balita', 'apras-60-72', 'apras', 'usekrem-6-14'].some(k => katId.includes(k));

    // 6. Validasi Khusus Anak: Nama Ibu atau Nama Ayah wajib ada
    if (isChild && !categoryForm.namaIbu?.trim() && !categoryForm.namaAyah?.trim()) {
      showWarning("Validasi Orang Tua", "Untuk sasaran anak/balita, mohon isi minimal Nama Ibu atau Nama Ayah.");
      return;
    }

    // 7. Validasi Khusus Ibu Hamil: HPHT wajib diisi, sedangkan HPL nullable / opsional
    if (katId === 'bumil' && !categoryForm.hpht) {
      showWarning("Validasi Ibu Hamil", "HPHT (Hari Pertama Haid Terakhir) wajib diisi untuk sasaran Ibu Hamil.");
      return;
    }
    const isUsekrem = ['usekrem-6-14', 'usekrem-15-18'].some(k => katId.includes(k));
    const isDewasaOrLansia = ['dewasa', 'lansia'].some(k => katId.includes(k));
    const isFemale = katId === 'bumil' || katId === 'nifas';

    // Normalisasi status pernikahan (Backend: 'menikah' | 'tidak_menikah')
    let statusPernikahanBackend = 'tidak_menikah';
    const rawPernikahan = (categoryForm.statusPernikahan || '').toLowerCase();
    if (rawPernikahan.includes('menikah') && !rawPernikahan.includes('belum') && !rawPernikahan.includes('tidak')) {
      statusPernikahanBackend = 'menikah';
    } else if (rawPernikahan.includes('kawin') && !rawPernikahan.includes('belum')) {
      statusPernikahanBackend = 'menikah';
    }

    // Tanggal lahir default jika kosong
    let tglLahirFormatted = categoryForm.tglLahir;
    if (!tglLahirFormatted) {
      if (katId === 'lansia') {
        tglLahirFormatted = '1960-01-01';
      } else if (isDewasaOrLansia) {
        tglLahirFormatted = '1995-01-01';
      } else {
        tglLahirFormatted = new Date().toISOString().split('T')[0];
      }
    }

    // Jenis Kelamin Backend: 'L' | 'P'
    const genderBackend = (categoryForm.gender === 'Perempuan' || categoryForm.gender === 'P' || isFemale) ? 'P' : 'L';

    let ket = '';
    if (katId === 'bumil' || katId === 'nifas') {
      ket = categoryForm.namaAyah ? `Suami: ${categoryForm.namaAyah}` : (categoryForm.namaSuami ? `Suami: ${categoryForm.namaSuami}` : '');
    } else if (['dewasa', 'lansia'].includes(katId)) {
      ket = '-';
    } else if (categoryForm.namaIbu) {
      ket = `Ibu: ${categoryForm.namaIbu}`;
    } else if (categoryForm.namaAyah) {
      ket = `Ayah: ${categoryForm.namaAyah}`;
    }

    const payload = {
      nik: nikValidation.cleanValue,
      nama_lengkap: categoryForm.nama.trim(),
      jenis_kelamin: genderBackend,
      tanggal_lahir: tglLahirFormatted,
      alamat: categoryForm.alamat || 'Wilayah Posyandu Melati',
      telepon: categoryForm.noHp || '-',
      nama_ibu: isDewasaOrLansia ? null : (categoryForm.namaIbu || null),
      nama_ayah: isDewasaOrLansia ? null : (categoryForm.namaAyah || null),
      status_perkawinan: statusPernikahanBackend,
      pekerjaan: isChild ? null : (categoryForm.pekerjaan || null),
      status_domisili: 'aktif',
      posyandu_id: 1
    };

    // Cek apakah NIK ini sudah ada di database / sasaranList
    const existingWarga = sasaranList.find(s => s.nik === nikValidation.cleanValue);

    // KASUS 1: Jika warga sudah ada dan form yang diisi adalah BUMIL atau NIFAS (Peralihan Dewasa -> Bumil)
    if (existingWarga && (katId === 'bumil' || katId === 'nifas')) {
      try {
        // 1. Update data profil warga (nama suami, telepon, alamat, status nikah)
        await wargaService.updateWarga(existingWarga.id, {
          nama_lengkap: categoryForm.nama.trim(),
          telepon: categoryForm.noHp || existingWarga.noHp,
          alamat: categoryForm.alamat || existingWarga.alamat,
          status_perkawinan: 'menikah'
        });

        // 2. Buat profil kehamilan baru di backend
        const kehamilanPayload = {
          warga_id: parseInt(existingWarga.id, 10),
          hpht: categoryForm.hpht || new Date().toISOString().split('T')[0],
          hpl: categoryForm.hpl || null,
          nama_suami: categoryForm.namaAyah || categoryForm.namaSuami || null,
          anak_ke: categoryForm.anakKe ? parseInt(categoryForm.anakKe, 10) : 1,
          jarak_anak_sebelum_bulan: categoryForm.jarakAnak ? parseInt(categoryForm.jarakAnak, 10) : null,
          status_kehamilan: katId === 'nifas' ? 'nifas' : 'hamil',
          is_menyusui: katId === 'nifas'
        };
        await kehamilanService.createKehamilan(kehamilanPayload);

        // 3. Update sasaran di state frontend
        const updatedItem = {
          ...existingWarga,
          nama: categoryForm.nama.trim(),
          kategori: katId === 'nifas' ? 'Nifas/Menyusui' : 'Bumil',
          subKategori: katId,
          namaSuami: categoryForm.namaAyah || categoryForm.namaSuami || existingWarga.namaSuami,
          keteranganIbuSuami: `Suami: ${categoryForm.namaAyah || categoryForm.namaSuami || existingWarga.namaSuami || '-'}`,
          hpht: categoryForm.hpht,
          hpl: categoryForm.hpl,
          anakKe: categoryForm.anakKe,
          jarakAnak: categoryForm.jarakAnak,
          noHp: categoryForm.noHp || existingWarga.noHp,
          alamat: categoryForm.alamat || existingWarga.alamat
        };

        setSasaranList([updatedItem, ...sasaranList.filter(s => s.nik !== existingWarga.nik)]);
        setShowCategoryFormModal(false);
        showSuccess(
          "Peralihan ke Ibu Hamil Berhasil",
          `Sasaran atas nama "${updatedItem.nama}" yang sebelumnya tercatat sebagai Dewasa berhasil dialihkan statusnya menjadi sasaran Ibu Hamil (Bumil).`
        );
        onRefreshData?.();
        return;
      } catch (err) {
        console.error('Gagal daftarkan kehamilan warga yang ada:', err);
        showWarning("Gagal Mendaftarkan Kehamilan", err.message || "Gagal memperbarui status kehamilan warga.");
        return;
      }
    }

    try {
      const res = await wargaService.createWarga(payload);
      let createdItem = null;
      if (res?.data) {
        createdItem = mapBackendWargaToFrontend(res.data);
      }
      
      if (!createdItem) {
        createdItem = {
          id: sasaranList.length + 1,
          nama: categoryForm.nama,
          keteranganIbuSuami: ket,
          namaIbu: categoryForm.namaIbu,
          namaAyah: categoryForm.namaAyah,
          nik: nikValidation.cleanValue,
          tglLahir: tglLahirFormatted,
          kategori: selectedCategory?.kategoriLabel || 'Dewasa',
          subKategori: katId,
          gender: genderBackend === 'P' ? 'Perempuan' : 'Laki-laki',
          status: 'Aktif',
          posyandu: categoryForm.posyandu || 'Posyandu Melati',
          noHp: categoryForm.noHp || '',
          alamat: categoryForm.alamat || '',
          statusPernikahan: categoryForm.statusPernikahan || 'Menikah',
          pekerjaan: categoryForm.pekerjaan || ''
        };
      }

      // Jika klaster bumil / nifas, buat juga profil kehamilannya
      if (katId === 'bumil' || katId === 'nifas') {
        try {
          await kehamilanService.createKehamilan({
            warga_id: parseInt(createdItem.id, 10),
            hpht: categoryForm.hpht || new Date().toISOString().split('T')[0],
            hpl: categoryForm.hpl || null,
            nama_suami: categoryForm.namaAyah || categoryForm.namaSuami || null,
            anak_ke: categoryForm.anakKe ? parseInt(categoryForm.anakKe, 10) : 1,
            jarak_anak_sebelum_bulan: categoryForm.jarakAnak ? parseInt(categoryForm.jarakAnak, 10) : null,
            status_kehamilan: katId === 'nifas' ? 'nifas' : 'hamil',
            is_menyusui: katId === 'nifas'
          });
        } catch (e) {
          console.warn('Profil kehamilan auto-create notice:', e);
        }
      }

      setSasaranList([createdItem, ...sasaranList.filter(s => s.nik !== createdItem.nik)]);
      setShowCategoryFormModal(false);
      showSuccess("Data Sasaran Tersimpan", `Berhasil menyimpan data sasaran [${selectedCategory?.title || "Warga"}] atas nama "${createdItem.nama}" ke database.`);
      onRefreshData?.();
    } catch (err) {
      console.error('Gagal simpan sasaran:', err);
      // Fallback jika NIK ternyata sudah ada di DB dan form adalah Bumil/Nifas
      if ((katId === 'bumil' || katId === 'nifas') && err.message && err.message.toLowerCase().includes('sudah terdaftar')) {
        try {
          const listRes = await wargaService.getWargaList({ search: nikValidation.cleanValue });
          const found = (listRes?.data?.items || listRes?.data || []).find(w => w.nik === nikValidation.cleanValue);
          if (found) {
            await kehamilanService.createKehamilan({
              warga_id: parseInt(found.id, 10),
              hpht: categoryForm.hpht || new Date().toISOString().split('T')[0],
              hpl: categoryForm.hpl || null,
              nama_suami: categoryForm.namaAyah || categoryForm.namaSuami || null,
              anak_ke: categoryForm.anakKe ? parseInt(categoryForm.anakKe, 10) : 1,
              jarak_anak_sebelum_bulan: categoryForm.jarakAnak ? parseInt(categoryForm.jarakAnak, 10) : null,
              status_kehamilan: katId === 'nifas' ? 'nifas' : 'hamil',
              is_menyusui: katId === 'nifas'
            });
            setShowCategoryFormModal(false);
            showSuccess(
              "Peralihan ke Ibu Hamil Berhasil",
              `Sasaran atas nama "${found.nama_lengkap}" berhasil dialihkan statusnya menjadi sasaran Ibu Hamil (Bumil).`
            );
            onRefreshData?.();
            return;
          }
        } catch (e2) {
          console.error('Fallback update kehamilan error:', e2);
        }
      }

      showWarning(
        "Gagal Menyimpan ke Database",
        err.message || "Gagal menyimpan data ke database server."
      );
    }
  };

  // Handle Mutasi Cek Data Submit (Step 1 -> Step 1.5 Verification)
  const handleMutasiCheckSubmit = (e) => {
    e.preventDefault();
    const nikValidation = validateNik(mutasiCheckForm.nik);
    if (!nikValidation.isValid) {
      showWarning("Validasi NIK Mutasi", nikValidation.message);
      return;
    }

    // Cari apakah ada data warga yang cocok atau gunakan data default realistis
    const foundWarga = sasaranList.find(w => w.nik === mutasiCheckForm.nik || w.nama?.toLowerCase() === mutasiCheckForm.nama?.toLowerCase());
    
    setMutasiCheckForm({
      ...mutasiCheckForm,
      nama: mutasiCheckForm.nama || foundWarga?.nama || 'Salsa Dilla',
      nik: mutasiCheckForm.nik || foundWarga?.nik || '32010101010999',
      namaIbu: mutasiCheckForm.namaIbu || foundWarga?.namaIbu || 'Kiya',
      alamatAsal: foundWarga?.alamat || 'Jl. Melati No. 12, RW 04, Desa Sukamaju',
      posyanduAsal: foundWarga?.posyandu || 'Posyandu Melati RW 04',
      tglLahir: foundWarga?.tglLahir || '1998-05-14',
      gender: foundWarga?.gender || 'Perempuan',
      statusPernikahan: foundWarga?.statusPernikahan || 'Menikah',
      pekerjaan: foundWarga?.pekerjaan || 'Ibu Rumah Tangga',
      noHp: foundWarga?.noHp || '081234567890'
    });

    // Proceed to Step 1.5: Verification confirmation modal
    setShowMutasiCheckModal(false);
    setShowMutasiVerifyModal(true);
  };

  // Handle Mutasi Verification Confirmed (Step 1.5 -> Step 2 Mutasi Form)
  const handleConfirmMutasiVerification = () => {
    setShowMutasiVerifyModal(false);
    setMutasiForm({
      ...mutasiForm,
      nama: mutasiCheckForm.nama || '',
      nik: mutasiCheckForm.nik || '',
      namaIbu: mutasiCheckForm.namaIbu || '',
      alamatAsal: mutasiCheckForm.alamatAsal || 'Jl. Melati No. 12, RW 04, Desa Sukamaju',
      posyanduAsal: mutasiCheckForm.posyanduAsal || 'Posyandu Melati RW 04',
      tglLahir: mutasiCheckForm.tglLahir || '1998-05-14',
      gender: mutasiCheckForm.gender || 'Perempuan',
      statusPernikahan: mutasiCheckForm.statusPernikahan || 'Menikah',
      pekerjaan: mutasiCheckForm.pekerjaan || 'Ibu Rumah Tangga',
      noHp: mutasiCheckForm.noHp || '081234567890',
      alamatDomisiliBaru: '',
      status: 'Aktif'
    });
    setShowMutasiFormModal(true);
  };

  // Handle Mutasi Final Save Submit (Image 4)
  const handleMutasiSaveSubmit = async (e) => {
    e.preventDefault();

    const nikValidation = validateNik(mutasiForm.nik);
    if (!nikValidation.isValid) {
      showWarning("Validasi NIK Mutasi", nikValidation.message);
      return;
    }

    const genderBackend = (mutasiForm.gender === 'Perempuan' || mutasiForm.gender === 'P') ? 'P' : 'L';
    const payload = {
      nik: nikValidation.cleanValue,
      nama_lengkap: (mutasiForm.nama || 'Sasaran Mutasi').trim(),
      jenis_kelamin: genderBackend,
      tanggal_lahir: mutasiForm.tglLahir || '1995-01-01',
      alamat: mutasiForm.alamatDomisiliBaru || mutasiForm.alamatAsal || 'Wilayah Posyandu Melati',
      telepon: mutasiForm.noHp || '-',
      nama_ibu: mutasiForm.namaIbu || null,
      status_perkawinan: (mutasiForm.statusPernikahan || '').toLowerCase().includes('menikah') ? 'menikah' : 'tidak_menikah',
      pekerjaan: mutasiForm.pekerjaan || null,
      status_domisili: 'aktif',
      posyandu_id: 1
    };

    try {
      const res = await wargaService.createWarga(payload);
      let createdItem = null;
      if (res?.data) {
        createdItem = mapBackendWargaToFrontend(res.data);
      }
      if (!createdItem) {
        createdItem = {
          id: sasaranList.length + 1,
          nama: mutasiForm.nama,
          keteranganIbuSuami: 'Sasaran Mutasi Domisili',
          nik: nikValidation.cleanValue,
          tglLahir: mutasiForm.tglLahir || '1995-01-01',
          kategori: 'Dewasa',
          gender: genderBackend === 'P' ? 'Perempuan' : 'Laki-laki',
          status: 'Aktif',
          posyandu: mutasiForm.posyandu || 'Posyandu Melati',
          noHp: mutasiForm.noHp,
          alamat: mutasiForm.alamatDomisiliBaru
        };
      }
      setSasaranList([createdItem, ...sasaranList.filter(s => s.nik !== createdItem.nik)]);
      setShowMutasiFormModal(false);
      showSuccess("Mutasi Berhasil", `Sasaran mutasi domisili atas nama "${createdItem.nama}" berhasil disimpan ke database.`);
      onRefreshData?.();
    } catch (err) {
      console.error('Gagal simpan sasaran mutasi:', err);
      showWarning(
        "Gagal Menyimpan Mutasi",
        err.message || "Gagal menyimpan data mutasi ke database server."
      );
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (selectedSasaran?.nik) {
      const nikValidation = validateNik(selectedSasaran.nik);
      if (!nikValidation.isValid) {
        showWarning("Validasi NIK", nikValidation.message);
        return;
      }
    }

    if (selectedSasaran?.id) {
      try {
        const isMenikah = (selectedSasaran.statusPernikahan || '').toLowerCase().includes('menikah') && !(selectedSasaran.statusPernikahan || '').toLowerCase().includes('belum');
        const updatePayload = {
          nik: selectedSasaran.nik,
          nama_lengkap: selectedSasaran.nama,
          jenis_kelamin: (selectedSasaran.gender === 'Perempuan' || selectedSasaran.gender === 'P') ? 'P' : 'L',
          tanggal_lahir: selectedSasaran.tglLahir,
          alamat: selectedSasaran.alamat,
          telepon: selectedSasaran.noHp || '-',
          nama_ibu: selectedSasaran.namaIbu || null,
          nama_ayah: selectedSasaran.namaAyah || null,
          status_perkawinan: isMenikah ? 'menikah' : 'tidak_menikah',
          pekerjaan: selectedSasaran.pekerjaan || null,
          status_domisili: (selectedSasaran.status || 'aktif').toLowerCase() === 'non-aktif' ? 'pindah' : 'aktif'
        };

        const res = await wargaService.updateWarga(selectedSasaran.id, updatePayload);
        
        let updatedItem = null;
        if (res?.data) {
          const mappedFromBackend = mapBackendWargaToFrontend(res.data);
          updatedItem = {
            ...mappedFromBackend,
            ...selectedSasaran,
            usia: formatUsiaByCategory(selectedSasaran.tglLahir, selectedSasaran.subKategori || selectedSasaran.kategori),
            status: selectedSasaran.status || 'Aktif',
            statusPernikahan: selectedSasaran.statusPernikahan || (isMenikah ? 'Menikah' : 'Belum Menikah'),
            keteranganIbuSuami: selectedSasaran.namaIbu 
              ? `Ibu: ${selectedSasaran.namaIbu}` 
              : (selectedSasaran.namaSuami 
                  ? `Suami: ${selectedSasaran.namaSuami}` 
                  : (selectedSasaran.namaAyah ? `Ayah: ${selectedSasaran.namaAyah}` : selectedSasaran.keteranganIbuSuami))
          };
        } else {
          updatedItem = {
            ...selectedSasaran,
            usia: formatUsiaByCategory(selectedSasaran.tglLahir, selectedSasaran.subKategori || selectedSasaran.kategori),
            keteranganIbuSuami: selectedSasaran.namaIbu 
              ? `Ibu: ${selectedSasaran.namaIbu}` 
              : (selectedSasaran.namaSuami 
                  ? `Suami: ${selectedSasaran.namaSuami}` 
                  : (selectedSasaran.namaAyah ? `Ayah: ${selectedSasaran.namaAyah}` : selectedSasaran.keteranganIbuSuami))
          };
        }

        setSasaranList(prev => (Array.isArray(prev) ? prev : sasaranList).map(item => String(item.id) === String(selectedSasaran.id) ? { ...item, ...updatedItem } : item));
        setSelectedSasaran(updatedItem);
        setShowEditModal(false);
        showSuccess("Pembaruan Berhasil", `Data sasaran "${selectedSasaran?.nama || "Warga"}" berhasil diperbarui.`);
        onRefreshData?.();
      } catch (err) {
        console.error('Backend edit warga error:', err);
        showWarning("Gagal Memperbarui Sasaran", err.message || "Gagal memperbarui data di server.");
      }
    }
  };

  return (
    <div>
      {/* Top Action Bar: 2 Main Buttons (Mutasi & Tambah Sasaran 9 Kategori) */}
      <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mb-3">
        {/* Tombol 1: Sasaran Mutasi */}
        <button 
          className="btn btn-dark-custom btn-top-action shadow-xs"
          onClick={() => setShowMutasiCheckModal(true)}
        >
          <UserCheck size={16} />
          <span>Tambah Sasaran Mutasi</span>
        </button>

        {/* Tombol 2: Tambah Sasaran (7 Klaster / 9 Kategori) */}
        <button 
          className="btn btn-dark-custom btn-top-action shadow-xs"
          onClick={() => setShowCategoryModal(true)}
        >
          <UserPlus size={16} />
          <span>Tambah Sasaran</span>
        </button>
      </div>

      {/* Main Table Container Card */}
      <div className="card card-custom p-4">
        {/* Search & Filter Bar */}
        <div className="row g-3 mb-4 align-items-center">
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
              <input 
                type="text" 
                className="form-control form-control-custom ps-5 bg-light"
                placeholder="Cari Nama / NIK / No. KK" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select 
              className="form-select form-select-custom bg-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select 
              className="form-select form-select-custom bg-light"
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
            >
              <option value="Semua Kategori">Semua Kategori</option>
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

          <div className="col-12 col-md-1">
            <button className="btn btn-outline-dark text-dark fw-bold w-100 d-flex align-items-center justify-content-center gap-1 py-2 rounded-3 bg-white border">
              <Filter size={16} className="text-dark" />
              <span className="d-none d-md-inline text-dark">Filter</span>
            </button>
          </div>
        </div>

        {/* Data Sasaran Table */}
        <div className="table-responsive">
          <table className="table table-custom align-middle">
            <thead>
              <tr className="text-muted small text-uppercase fw-bold border-bottom">
                <th style={{ width: '50px' }} className="ps-4 py-3 text-center">NO</th>
                <th className="py-3" style={{ minWidth: '180px' }}>NAMA LENGKAP / NIK</th>
                <th className="py-3 text-center" style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>TANGGAL LAHIR</th>
                <th className="py-3" style={{ minWidth: '140px' }}>KATEGORI</th>
                <th className="py-3 text-center" style={{ minWidth: '120px' }}>JENIS KELAMIN</th>
                <th className="py-3 text-center" style={{ minWidth: '100px' }}>STATUS</th>
                <th className="pe-4 py-3 text-center" style={{ minWidth: '160px' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={item.id}>
                    <td className="ps-4 text-center fw-semibold text-secondary">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td>
                      <div className="fw-bold text-dark mb-0">{item.nama}</div>
                      <div className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>{item.nik}</div>
                    </td>
                    <td className="text-center text-secondary small text-nowrap">{formatIndoDate(item.tglLahir)}</td>
                    <td>
                      <div className="fw-semibold text-dark mb-0">{item.kategori}</div>
                    </td>
                    <td className="text-center text-secondary">{item.gender}</td>
                    <td className="text-center">
                      {item.status === 'Aktif' ? (
                        <span className="badge-status-aktif d-inline-flex align-items-center">
                          Aktif
                        </span>
                      ) : (
                        <span className="badge-status-nonaktif d-inline-flex align-items-center">
                          Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="text-center text-nowrap">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <button 
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 shadow-none"
                          title="Lihat Detail Sasaran"
                          onClick={() => {
                            setSelectedSasaran(item);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye size={14} />
                          <span>Detail</span>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-pink d-inline-flex align-items-center gap-1.5 shadow-none"
                          title="Edit Data Sasaran"
                          onClick={() => {
                            const normalized = {
                              ...item,
                              riwayatKeluarga: Array.isArray(item.riwayatKeluarga) ? item.riwayatKeluarga : (typeof item.riwayatKeluarga === 'string' && item.riwayatKeluarga ? [item.riwayatKeluarga] : []),
                              riwayatDiriSendiri: Array.isArray(item.riwayatDiriSendiri) ? item.riwayatDiriSendiri : (typeof item.riwayatDiriSendiri === 'string' && item.riwayatDiriSendiri ? [item.riwayatDiriSendiri] : []),
                              perilakuBerisiko: typeof item.perilakuBerisiko === 'object' && item.perilakuBerisiko !== null && !Array.isArray(item.perilakuBerisiko)
                                ? item.perilakuBerisiko
                                : {
                                    merokok: 'Tidak',
                                    tinggiGula: 'Tidak',
                                    tinggiGaram: 'Tidak',
                                    tinggiLemak: 'Tidak',
                                    ...(Array.isArray(item.perilakuBerisiko) ? { items: item.perilakuBerisiko } : {})
                                  }
                            };
                            setSelectedSasaran(normalized);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    Tidak ditemukan data sasaran yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between pt-3 border-top mt-3 text-muted small gap-3">
          <div>
            Menampilkan <span className="fw-semibold text-dark">{filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> s/d <span className="fw-semibold text-dark">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="fw-semibold text-dark">{filteredData.length}</span> sasaran
          </div>
          <div className="d-flex align-items-center gap-1">
            <button 
              className="btn btn-sm btn-light border p-1 rounded-2" 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`btn btn-sm px-3 py-1 me-1 ${currentPage === page ? 'btn-primary-custom fw-bold' : 'btn-light border'}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className="btn btn-sm btn-light border p-1 rounded-2"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              title="Halaman Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>


      {/* ========================================================================= */}
      {/* MODAL 1: PILIH KATEGORI SASARAN (7 Klaster Posyandu ILP) - Image 1 */}
      {/* ========================================================================= */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered size="lg">
        <div className="p-4 bg-white rounded-4 border-0">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 bg-dark text-white rounded-3">
                <LayoutGrid size={22} />
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-dark">Pilih Kategori Sasaran</h4>
                <p className="text-muted small mb-0">Silakan pilih kategori sasaran yang ingin didaftarkan</p>
              </div>
            </div>
            <button className="btn border-0 text-muted" onClick={() => setShowCategoryModal(false)}>
              <X size={22} />
            </button>
          </div>

          {/* Banner Info ILP */}
          <div className="d-flex align-items-center gap-2 p-3 mb-4 rounded-3 border bg-light text-dark fw-medium small">
            <ShieldCheck size={18} className="text-primary" />
            <span>Pilih salah satu dari 9 kategori siklus hidup posyandu</span>
          </div>

          {/* Grid 7 Klaster Cards (Image 1) */}
          <div className="row g-3 mb-4">
            {klasterList.map((item) => (
              <div key={item.id} className="col-12 col-md-6">
                <div 
                  className="modal-role-card d-flex align-items-center gap-3 p-3 bg-white border rounded-3"
                  onClick={() => handleSelectKlaster(item)}
                >
                  <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-center">
                    {item.icon}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">{item.title}</h6>
                    <span className="text-muted small">{item.sub}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex align-items-center justify-content-between pt-3 border-top text-muted small">
            <div className="d-flex align-items-center gap-2">
              <Info size={16} />
              <span>Pilih salah satu klaster sasaran untuk membuka form pendaftaran</span>
            </div>
            <button className="btn btn-secondary px-4 py-2" onClick={() => setShowCategoryModal(false)}>
              Batal
            </button>
          </div>
        </div>
      </Modal>


      {/* ========================================================================= */}
      {/* MODAL 2: FORM TAMBAH SASARAN PER KATEGORI (Image 2, Image 5, & Image 4) */}
      {/* ========================================================================= */}
      {selectedCategory && (
        <Modal show={showCategoryFormModal} onHide={() => setShowCategoryFormModal(false)} centered size="lg">
          <form onSubmit={handleCategoryFormSubmit}>
            <div className="p-4 bg-white rounded-4 border-0">
              <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-3">
                <div className="p-2 bg-dark text-white rounded-3">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h4 className="fw-bold mb-0 text-dark">
                    {selectedCategory.id === 'bumil'
                      ? 'Tambah Sasaran Ibu Hamil'
                      : selectedCategory.id === 'bayi-0-11' || selectedCategory.id.includes('bayi')
                      ? 'Tambah Sasaran Bayi'
                      : `Tambah Sasaran ${selectedCategory.id === 'nifas' ? 'Nifas/Menyusui' : selectedCategory.title}`}
                  </h4>
                  <p className="text-muted small mb-0">Pencatatan data sasaran baru</p>
                </div>
              </div>

              {/* ========================================== */}
              {/* VARIASI 1: IBU HAMIL (GAMBAR 2 - ORIGINAL) */}
              {/* ========================================== */}
              {selectedCategory.id === 'bumil' ? (
                <div className="row g-3 mb-4">
                  {/* Kolom Kiri */}
                  <div className="col-md-6">
                    {/* Input Nama Lengkap dengan Smart Autocomplete & Autofill */}
                    <div className="mb-3 position-relative">
                      <label className="form-label fw-medium small mb-1">Nama Lengkap</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        placeholder="Masukkan nama lengkap"
                        value={categoryForm.nama}
                        autoComplete="off"
                        onChange={(e) => handleNamaBumilChange(e.target.value)}
                        onFocus={() => {
                          if (categoryForm.nama && categoryForm.nama.trim().length >= 2) {
                            setShowNamaSuggestions(true);
                          }
                        }}
                        required
                      />

                      {/* Dropdown Live Suggestions jika nama cocok dengan data backend (Dewasa/Usekrem) */}
                      {showNamaSuggestions && matchingNamaSuggestions.length > 0 && (
                        <div 
                          className="position-absolute w-100 bg-white border rounded-3 shadow-lg p-1.5 z-3 mt-1"
                          style={{ maxHeight: '220px', overflowY: 'auto', overflowX: 'hidden' }}
                        >
                          <div className="px-2 py-1 text-muted small border-bottom mb-1 text-start" style={{ fontSize: '0.72rem' }}>
                            Warga terdaftar ditemukan (Klik untuk isi data otomatis):
                          </div>
                          {matchingNamaSuggestions.map(w => (
                            <div
                              key={w.id}
                              role="button"
                              className="d-flex flex-column text-start p-2 rounded-2 mb-1 border-0"
                              style={{ 
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                backgroundColor: '#f8fafc',
                                transition: 'background-color 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                              onMouseDown={() => handleSelectCitizenForBumil(w)}
                            >
                              <div 
                                className="fw-bold text-dark small text-start" 
                                style={{ textAlign: 'left', wordBreak: 'break-word', lineHeight: '1.25' }}
                              >
                                {w.nama}
                              </div>
                              <div 
                                className="text-muted d-flex align-items-center gap-1.5 mt-0.5 text-start" 
                                style={{ fontSize: '0.72rem', textAlign: 'left', color: '#64748b' }}
                              >
                                <span className="font-monospace text-slate-500">{w.nik}</span>
                                <span style={{ color: '#cbd5e1' }}>•</span>
                                <span className="text-secondary fw-normal" style={{ fontSize: '0.72rem' }}>
                                  {w.kategori || 'Dewasa'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label fw-medium small mb-0">Nomor Induk Kependudukan (NIK)</label>
                        <span className={`small ${categoryForm.nik?.length === 16 ? 'text-success fw-bold' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                          {categoryForm.nik?.length || 0}/16 Digit
                        </span>
                      </div>
                      <input 
                        type="text" 
                        maxLength={16}
                        className={`form-control form-control-custom ${categoryForm.nik && categoryForm.nik.length !== 16 ? 'is-invalid' : ''}`}
                        placeholder="Masukkan 16 digit NIK"
                        value={categoryForm.nik}
                        onChange={(e) => handleNikBumilChange(e.target.value)}
                        required
                      />
                      {categoryForm.nik && categoryForm.nik.length !== 16 && (
                        <div className="invalid-feedback" style={{ fontSize: '0.74rem' }}>
                          NIK harus 16 digit angka (kurang {16 - categoryForm.nik.length} digit lagi).
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Tanggal Lahir</label>
                      <input 
                        type="date" 
                        max={new Date().toISOString().split('T')[0]}
                        className="form-control form-control-custom"
                        value={categoryForm.tglLahir}
                        onChange={(e) => setCategoryForm({ ...categoryForm, tglLahir: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nomor Telepon / WhatsApp</label>
                      <input 
                        type="text" 
                        maxLength={15}
                        className="form-control form-control-custom"
                        placeholder="0812xxxxxxxx"
                        value={categoryForm.noHp}
                        onChange={(e) => setCategoryForm({ ...categoryForm, noHp: formatPhoneInput(e.target.value) })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">HPHT (Hari Pertama Haid Terakhir)</label>
                      <input 
                        type="date" 
                        className="form-control form-control-custom"
                        value={categoryForm.hpht}
                        onChange={(e) => setCategoryForm({ ...categoryForm, hpht: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">HPL</label>
                      <input 
                        type="date" 
                        className="form-control form-control-custom"
                        value={categoryForm.hpl}
                        onChange={(e) => setCategoryForm({ ...categoryForm, hpl: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label fw-medium small mb-1">BB Sebelum Hamil</label>
                          <div className="input-group">
                            <input 
                              type="number" 
                              step="0.1" 
                              className="form-control form-control-custom"
                              placeholder="50.0"
                              value={categoryForm.bb}
                              onChange={(e) => setCategoryForm({ ...categoryForm, bb: e.target.value })}
                            />
                            <span className="input-group-text bg-white border text-muted small">kg</span>
                          </div>
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-medium small mb-1">Tinggi Badan (TB)</label>
                          <div className="input-group">
                            <input 
                              type="number" 
                              step="0.1" 
                              className="form-control form-control-custom"
                              placeholder="155.0"
                              value={categoryForm.tb}
                              onChange={(e) => setCategoryForm({ ...categoryForm, tb: e.target.value })}
                            />
                            <span className="input-group-text bg-white border text-muted small">cm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nama Suami / Ayah</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        placeholder="Masukkan nama suami/ayah"
                        value={categoryForm.namaAyah}
                        onChange={(e) => setCategoryForm({ ...categoryForm, namaAyah: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Anak ke-</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        placeholder="Contoh: 1"
                        value={categoryForm.anakKe}
                        onChange={(e) => setCategoryForm({ ...categoryForm, anakKe: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Jarak anak sebelumnya</label>
                      <select 
                        className="form-select form-select-custom"
                        value={categoryForm.jarakAnak}
                        onChange={(e) => setCategoryForm({ ...categoryForm, jarakAnak: e.target.value })}
                      >
                        <option value="Anak Pertama">Anak Pertama</option>
                        <option value="< 2 Thn">&lt; 2 Thn</option>
                        <option value="2 - 5 Thn">2 - 5 Thn</option>
                        <option value="> 5 Thn">&gt; 5 Thn</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Status Sasaran</label>
                      <select 
                        className="form-select form-select-custom"
                        value={categoryForm.status}
                        onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Non-Aktif">Non-Aktif</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Alamat Domisili</label>
                      <textarea 
                        className="form-control form-control-custom"
                        rows="2"
                        placeholder="Masukkan alamat domisili"
                        value={categoryForm.alamat}
                        onChange={(e) => setCategoryForm({ ...categoryForm, alamat: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : selectedCategory.id === 'bayi-0-11' || selectedCategory.id.includes('bayi') ? (
                /* ========================================== */
                /* VARIASI 2: BAYI 0-11 BULAN (GAMBAR 3)      */
                /* ========================================== */
                <div className="row g-3 mb-4">
                  {/* Kolom Kiri */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nama Lengkap</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        placeholder="Masukkan nama lengkap"
                        value={categoryForm.nama}
                        onChange={(e) => setCategoryForm({ ...categoryForm, nama: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label fw-medium small mb-0">Nomor Induk Kependudukan (NIK)</label>
                        <span className={`small ${categoryForm.nik?.length === 16 ? 'text-success fw-bold' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                          {categoryForm.nik?.length || 0}/16 Digit
                        </span>
                      </div>
                      <input 
                        type="text" 
                        maxLength={16}
                        className={`form-control form-control-custom ${categoryForm.nik && categoryForm.nik.length !== 16 ? 'is-invalid' : ''}`}
                        placeholder="Masukkan 16 digit NIK"
                        value={categoryForm.nik}
                        onChange={(e) => setCategoryForm({ ...categoryForm, nik: formatNikInput(e.target.value) })}
                        required
                      />
                      {categoryForm.nik && categoryForm.nik.length !== 16 && (
                        <div className="invalid-feedback" style={{ fontSize: '0.74rem' }}>
                          NIK harus 16 digit angka (kurang {16 - categoryForm.nik.length} digit lagi).
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Jenis Kelamin</label>
                      <select 
                        className="form-select form-select-custom"
                        value={categoryForm.gender}
                        onChange={(e) => setCategoryForm({ ...categoryForm, gender: e.target.value })}
                      >
                        <option value="">pilih jenis kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label fw-medium small mb-1">Berat Lahir (BBL)</label>
                          <input 
                            type="number" step="0.1" 
                            className="form-control form-control-custom"
                            placeholder="BBL (kg)"
                            value={categoryForm.bbl !== undefined && categoryForm.bbl !== '' ? categoryForm.bbl : categoryForm.bb}
                            onChange={(e) => setCategoryForm({ ...categoryForm, bbl: e.target.value, bb: e.target.value })}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-medium small mb-1">Panjang Lahir (PBL)</label>
                          <input 
                            type="number" step="0.1" 
                            className="form-control form-control-custom"
                            placeholder="PBL (cm)"
                            value={categoryForm.pbl !== undefined && categoryForm.pbl !== '' ? categoryForm.pbl : categoryForm.tb}
                            onChange={(e) => setCategoryForm({ ...categoryForm, pbl: e.target.value, tb: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Status Sasaran</label>
                      <select 
                        className="form-select form-select-custom"
                        value={categoryForm.status}
                        onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Non-Aktif">Non-Aktif</option>
                      </select>
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Tanggal Lahir</label>
                      <input 
                        type="date" 
                        className="form-control form-control-custom"
                        value={categoryForm.tglLahir}
                        onChange={(e) => setCategoryForm({ ...categoryForm, tglLahir: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nama Ibu</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        placeholder="Masukkan nama ibu"
                        value={categoryForm.namaIbu}
                        onChange={(e) => setCategoryForm({ ...categoryForm, namaIbu: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nama Ayah</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        placeholder="Masukkan nama ayah"
                        value={categoryForm.namaAyah}
                        onChange={(e) => setCategoryForm({ ...categoryForm, namaAyah: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Alamat Domisili</label>
                      <textarea 
                        className="form-control form-control-custom"
                        rows="3"
                        placeholder="Masukkan alamat domisili"
                        value={categoryForm.alamat}
                        onChange={(e) => setCategoryForm({ ...categoryForm, alamat: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* VARIASI 3: STANDAR (GAMBAR 1) + KHUSUS NIFAS/MENYUSUI DITAMBAH 1 FIELD    */
                /* ========================================================================= */
                <div className="row g-3 mb-4">
                  {/* Kolom Kiri */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nama Lengkap</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        placeholder="Masukkan nama lengkap"
                        value={categoryForm.nama}
                        onChange={(e) => setCategoryForm({ ...categoryForm, nama: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label fw-medium small mb-0">Nomor Induk Kependudukan (NIK)</label>
                        <span className={`small ${categoryForm.nik?.length === 16 ? 'text-success fw-bold' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                          {categoryForm.nik?.length || 0}/16 Digit
                        </span>
                      </div>
                      <input 
                        type="text" 
                        maxLength={16}
                        className={`form-control form-control-custom ${categoryForm.nik && categoryForm.nik.length !== 16 ? 'is-invalid' : ''}`}
                        placeholder="Masukkan 16 digit NIK"
                        value={categoryForm.nik}
                        onChange={(e) => setCategoryForm({ ...categoryForm, nik: formatNikInput(e.target.value) })}
                        required
                      />
                      {categoryForm.nik && categoryForm.nik.length !== 16 && (
                        <div className="invalid-feedback" style={{ fontSize: '0.74rem' }}>
                          NIK harus 16 digit angka (kurang {16 - categoryForm.nik.length} digit lagi).
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Jenis Kelamin</label>
                      <select 
                        className="form-select form-select-custom"
                        value={categoryForm.gender}
                        onChange={(e) => setCategoryForm({ ...categoryForm, gender: e.target.value })}
                      >
                        <option value="">pilih jenis kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    {/* Status Pernikahan & Pekerjaan (Dihapus untuk balita, apras, dan usekrem 6-14) */}
                    {!['balita-12-59', 'balita', 'apras-60-72', 'apras', 'usekrem-6-14'].some(k => selectedCategory.id.includes(k)) && (
                      <>
                        <div className="mb-3">
                          <label className="form-label fw-medium small mb-1">Status Pernikahan</label>
                          <select 
                            className="form-select form-select-custom"
                            value={categoryForm.statusPernikahan}
                            onChange={(e) => setCategoryForm({ ...categoryForm, statusPernikahan: e.target.value })}
                          >
                            <option value="Belum Menikah">Belum Menikah</option>
                            <option value="Menikah">Menikah</option>
                            <option value="Cerai Hidup">Cerai Hidup</option>
                            <option value="Cerai Mati">Cerai Mati</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-medium small mb-1">Pekerjaan</label>
                          <select 
                            className="form-select form-select-custom"
                            value={categoryForm.pekerjaan}
                            onChange={(e) => setCategoryForm({ ...categoryForm, pekerjaan: e.target.value })}
                          >
                            <option value="">Pilih pekerjaan</option>
                            <option value="Tidak Bekerja / Pelajar">Tidak Bekerja / Pelajar</option>
                            <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                            <option value="Karyawan Swasta">Karyawan Swasta</option>
                            <option value="PNS / TNI / POLRI">PNS / TNI / POLRI</option>
                            <option value="Wiraswasta / Pedagang">Wiraswasta / Pedagang</option>
                            <option value="Petani / Buruh">Petani / Buruh</option>
                            <option value="Pensiunan">Pensiunan</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* KHUSUS NIFAS / MENYUSUI: DITAMBAHKAN SATU FIELD STATUS MENYUSUI */}
                    {selectedCategory.id === 'nifas' && (
                      <div className="mb-3">
                        <label className="form-label fw-bold text-primary small mb-1">Status Menyusui</label>
                        <select 
                          className="form-select form-select-custom border-primary"
                          value={categoryForm.statusMenyusui}
                          onChange={(e) => setCategoryForm({ ...categoryForm, statusMenyusui: e.target.value })}
                        >
                          <option value="Masih Menyusui">Masih Menyusui</option>
                          <option value="Sudah Tidak Menyusui">Sudah Tidak Menyusui</option>
                        </select>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Status Sasaran</label>
                      <select 
                        className="form-select form-select-custom"
                        value={categoryForm.status}
                        onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Non-Aktif">Non-Aktif</option>
                      </select>
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Tanggal Lahir</label>
                      <input 
                        type="date" 
                        max={new Date().toISOString().split('T')[0]}
                        className="form-control form-control-custom"
                        value={categoryForm.tglLahir}
                        onChange={(e) => setCategoryForm({ ...categoryForm, tglLahir: e.target.value })}
                        required
                      />
                    </div>

                    {!['dewasa', 'lansia'].includes(selectedCategory.id) && (
                      <div className="mb-3">
                        <label className="form-label fw-medium small mb-1">
                          Nama Ibu
                        </label>
                        <input 
                          type="text" 
                          className="form-control form-control-custom"
                          placeholder="Masukkan nama ibu"
                          value={categoryForm.namaIbu}
                          onChange={(e) => setCategoryForm({ ...categoryForm, namaIbu: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nomor Telepon / WhatsApp</label>
                      <input 
                        type="text" 
                        maxLength={15}
                        className="form-control form-control-custom"
                        placeholder="0812xxxxxxxx"
                        value={categoryForm.noHp}
                        onChange={(e) => setCategoryForm({ ...categoryForm, noHp: formatPhoneInput(e.target.value) })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Alamat Domisili</label>
                      <textarea 
                        className="form-control form-control-custom"
                        rows="3"
                        placeholder="Masukkan alamat domisili"
                        value={categoryForm.alamat}
                        onChange={(e) => setCategoryForm({ ...categoryForm, alamat: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  {/* KHUSUS USEKREM 6-14 & USEKREM 15-18: RIWAYAT KELUARGA & PERILAKU BERISIKO DIRI */}
                  {['usekrem-6-14', 'usekrem-15-18'].includes(selectedCategory.id) && (
                    <div className="col-12 mt-3">
                      <div className="card border shadow-sm rounded-4 overflow-hidden bg-white mb-2">
                        <div className="card-header bg-light bg-opacity-75 border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <Activity size={18} style={{ color: '#be123c' }} />
                            <span className="fw-bold text-dark fs-6">Skrining Riwayat Penyakit &amp; Perilaku Berisiko</span>
                          </div>
                          <span className="badge bg-white border text-secondary fw-medium px-2.5 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>
                            Kemenkes RI
                          </span>
                        </div>

                        <div className="card-body p-4">
                          {/* 1. Riwayat Keluarga */}
                          <div className="mb-4 pb-4 border-bottom">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div>
                                <span className="fw-bold text-dark fs-6 d-block mb-1">Riwayat Penyakit Keluarga</span>
                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Pilih jika ada anggota keluarga kandung yang memiliki riwayat penyakit</span>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-sm py-1.5 px-3 rounded-pill border transition-all"
                                style={
                                  categoryForm.riwayatKeluarga?.includes('Tidak Ada')
                                    ? { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 600, fontSize: '0.75rem' }
                                    : { backgroundColor: '#ffffff', color: '#64748b', borderColor: '#cbd5e1', fontSize: '0.75rem' }
                                }
                                onClick={() => setCategoryForm({ 
                                  ...categoryForm, 
                                  riwayatKeluarga: categoryForm.riwayatKeluarga?.includes('Tidak Ada') ? [] : ['Tidak Ada'] 
                                })}
                              >
                                {categoryForm.riwayatKeluarga?.includes('Tidak Ada') ? '✓ Tidak Ada Riwayat' : 'Tidak Ada Riwayat'}
                              </button>
                            </div>
                            <div className="d-flex flex-wrap gap-2 pt-1">
                              {[
                                { key: 'Hipertensi', label: 'a. Hipertensi' },
                                { key: 'DM', label: 'b. DM' },
                                { key: 'Stroke', label: 'c. Stroke' },
                                { key: 'Jantung', label: 'd. Jantung' },
                                { key: 'Asma', label: 'e. Asma' },
                                { key: 'Kanker', label: 'f. Kanker' },
                                { key: 'Kolesterol Tinggi', label: 'g. Kolesterol Tinggi' }
                              ].map(({ key, label }) => {
                                const isSelected = categoryForm.riwayatKeluarga?.includes(key);
                                return (
                                  <button
                                    type="button"
                                    key={key}
                                    className="btn btn-sm rounded-pill px-3.5 py-1.5 border transition-all"
                                    style={
                                      isSelected
                                        ? { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', fontWeight: 600, fontSize: '0.8rem' }
                                        : { backgroundColor: '#ffffff', color: '#334155', borderColor: '#e2e8f0', fontSize: '0.8rem' }
                                    }
                                    onClick={() => {
                                      const cur = (categoryForm.riwayatKeluarga || []).filter(x => x !== 'Tidak Ada');
                                      const next = cur.includes(key) ? cur.filter(x => x !== key) : [...cur, key];
                                      setCategoryForm({ ...categoryForm, riwayatKeluarga: next });
                                    }}
                                  >
                                    {isSelected ? '✓ ' : ''}{label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. Perilaku Berisiko Diri */}
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div>
                                <span className="fw-bold text-dark fs-6 d-block mb-1">Perilaku Berisiko Diri</span>
                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Pilih jika sasaran memiliki riwayat penyakit atau faktor risiko</span>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-sm py-1.5 px-3 rounded-pill border transition-all"
                                style={
                                  categoryForm.perilakuBerisikoUsekrem?.includes('Tidak Ada')
                                    ? { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 600, fontSize: '0.75rem' }
                                    : { backgroundColor: '#ffffff', color: '#64748b', borderColor: '#cbd5e1', fontSize: '0.75rem' }
                                }
                                onClick={() => setCategoryForm({ 
                                  ...categoryForm, 
                                  perilakuBerisikoUsekrem: categoryForm.perilakuBerisikoUsekrem?.includes('Tidak Ada') ? [] : ['Tidak Ada'] 
                                })}
                              >
                                {categoryForm.perilakuBerisikoUsekrem?.includes('Tidak Ada') ? '✓ Tidak Ada' : 'Tidak Ada'}
                              </button>
                            </div>
                            <div className="d-flex flex-wrap gap-2 pt-1">
                              {[
                                { key: 'Hipertensi', label: 'a. Hipertensi' },
                                { key: 'DM', label: 'b. DM' },
                                { key: 'Stroke', label: 'c. Stroke' },
                                { key: 'Jantung', label: 'd. Jantung' },
                                { key: 'Asma', label: 'e. Asma' },
                                { key: 'Kanker', label: 'f. Kanker' },
                                { key: 'Kolesterol Tinggi', label: 'g. Kolesterol Tinggi' }
                              ].map(({ key, label }) => {
                                const isSelected = categoryForm.perilakuBerisikoUsekrem?.includes(key);
                                return (
                                  <button
                                    type="button"
                                    key={key}
                                    className="btn btn-sm rounded-pill px-3.5 py-1.5 border transition-all"
                                    style={
                                      isSelected
                                        ? { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', fontWeight: 600, fontSize: '0.8rem' }
                                        : { backgroundColor: '#ffffff', color: '#334155', borderColor: '#e2e8f0', fontSize: '0.8rem' }
                                    }
                                    onClick={() => {
                                      const cur = (categoryForm.perilakuBerisikoUsekrem || []).filter(x => x !== 'Tidak Ada');
                                      const next = cur.includes(key) ? cur.filter(x => x !== key) : [...cur, key];
                                      setCategoryForm({ ...categoryForm, perilakuBerisikoUsekrem: next });
                                    }}
                                  >
                                    {isSelected ? '✓ ' : ''}{label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KHUSUS DEWASA & LANSIA: RIWAYAT KELUARGA, RIWAYAT DIRI SENDIRI & PERILAKU BERISIKO DIRI SENDIRI */}
                  {['dewasa', 'lansia'].includes(selectedCategory.id) && (
                    <div className="col-12 mt-3">
                      <div className="card border shadow-sm rounded-4 overflow-hidden bg-white mb-2">
                        <div className="card-header bg-light bg-opacity-75 border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <Activity size={18} style={{ color: '#be123c' }} />
                            <span className="fw-bold text-dark fs-6">Skrining Riwayat Penyakit &amp; Perilaku Berisiko</span>
                          </div>
                          <span className="badge bg-white border text-secondary fw-medium px-2.5 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>
                            Kemenkes RI
                          </span>
                        </div>

                        <div className="card-body p-4">
                          {/* 1. Riwayat Keluarga */}
                          <div className="mb-4 pb-4 border-bottom">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div>
                                <span className="fw-bold text-dark fs-6 d-block mb-1">Riwayat Penyakit Keluarga</span>
                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Pilih jika ada anggota keluarga kandung yang memiliki riwayat penyakit</span>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-sm py-1.5 px-3 rounded-pill border transition-all"
                                style={
                                  categoryForm.riwayatKeluarga?.includes('Tidak Ada')
                                    ? { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 600, fontSize: '0.75rem' }
                                    : { backgroundColor: '#ffffff', color: '#64748b', borderColor: '#cbd5e1', fontSize: '0.75rem' }
                                }
                                onClick={() => setCategoryForm({ 
                                  ...categoryForm, 
                                  riwayatKeluarga: categoryForm.riwayatKeluarga?.includes('Tidak Ada') ? [] : ['Tidak Ada'] 
                                })}
                              >
                                {categoryForm.riwayatKeluarga?.includes('Tidak Ada') ? '✓ Tidak Ada Riwayat' : 'Tidak Ada Riwayat'}
                              </button>
                            </div>
                            <div className="d-flex flex-wrap gap-2 pt-1">
                              {[
                                { key: 'Hipertensi', label: 'a. Hipertensi' },
                                { key: 'DM', label: 'b. DM' },
                                { key: 'Stroke', label: 'c. Stroke' },
                                { key: 'Jantung', label: 'd. Jantung' },
                                { key: 'Asma', label: 'e. Asma' }
                              ].map(({ key, label }) => {
                                const isSelected = categoryForm.riwayatKeluarga?.includes(key);
                                return (
                                  <button
                                    type="button"
                                    key={key}
                                    className="btn btn-sm rounded-pill px-3.5 py-1.5 border transition-all"
                                    style={
                                      isSelected
                                        ? { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', fontWeight: 600, fontSize: '0.8rem' }
                                        : { backgroundColor: '#ffffff', color: '#334155', borderColor: '#e2e8f0', fontSize: '0.8rem' }
                                    }
                                    onClick={() => {
                                      const cur = (categoryForm.riwayatKeluarga || []).filter(x => x !== 'Tidak Ada');
                                      const next = cur.includes(key) ? cur.filter(x => x !== key) : [...cur, key];
                                      setCategoryForm({ ...categoryForm, riwayatKeluarga: next });
                                    }}
                                  >
                                    {isSelected ? '✓ ' : ''}{label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. Riwayat Diri Sendiri */}
                          <div className="mb-4 pb-4 border-bottom">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div>
                                <span className="fw-bold text-dark fs-6 d-block mb-1">Riwayat Penyakit Diri Sendiri</span>
                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Pilih jika sasaran pernah/sedang didiagnosis riwayat penyakit</span>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-sm py-1.5 px-3 rounded-pill border transition-all"
                                style={
                                  categoryForm.riwayatDiriSendiri?.includes('Tidak Ada')
                                    ? { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 600, fontSize: '0.75rem' }
                                    : { backgroundColor: '#ffffff', color: '#64748b', borderColor: '#cbd5e1', fontSize: '0.75rem' }
                                }
                                onClick={() => setCategoryForm({ 
                                  ...categoryForm, 
                                  riwayatDiriSendiri: categoryForm.riwayatDiriSendiri?.includes('Tidak Ada') ? [] : ['Tidak Ada'] 
                                })}
                              >
                                {categoryForm.riwayatDiriSendiri?.includes('Tidak Ada') ? '✓ Tidak Ada Riwayat' : 'Tidak Ada Riwayat'}
                              </button>
                            </div>
                            <div className="d-flex flex-wrap gap-2 pt-1">
                              {[
                                { key: 'Hipertensi', label: 'a. Hipertensi' },
                                { key: 'DM', label: 'b. DM' },
                                { key: 'Stroke', label: 'c. Stroke' },
                                { key: 'Jantung', label: 'd. Jantung' },
                                { key: 'Asma', label: 'e. Asma' }
                              ].map(({ key, label }) => {
                                const isSelected = categoryForm.riwayatDiriSendiri?.includes(key);
                                return (
                                  <button
                                    type="button"
                                    key={key}
                                    className="btn btn-sm rounded-pill px-3.5 py-1.5 border transition-all"
                                    style={
                                      isSelected
                                        ? { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', fontWeight: 600, fontSize: '0.8rem' }
                                        : { backgroundColor: '#ffffff', color: '#334155', borderColor: '#e2e8f0', fontSize: '0.8rem' }
                                    }
                                    onClick={() => {
                                      const cur = (categoryForm.riwayatDiriSendiri || []).filter(x => x !== 'Tidak Ada');
                                      const next = cur.includes(key) ? cur.filter(x => x !== key) : [...cur, key];
                                      setCategoryForm({ ...categoryForm, riwayatDiriSendiri: next });
                                    }}
                                  >
                                    {isSelected ? '✓ ' : ''}{label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 3. Perilaku Berisiko Diri Sendiri */}
                          <div className="pt-1">
                            <div className="mb-3">
                              <span className="fw-bold text-dark fs-6 d-block mb-1">Perilaku Berisiko Diri Sendiri</span>
                              <span className="text-muted" style={{ fontSize: '0.78rem' }}>Evaluasi faktor risiko pola konsumsi &amp; kebiasaan harian</span>
                            </div>
                            <div className="row g-3">
                              {[
                                { key: 'merokok', label: 'a. Merokok' },
                                { key: 'tinggiGula', label: 'b. Konsumsi Tinggi Gula' },
                                { key: 'tinggiGaram', label: 'c. Konsumsi Tinggi Garam' },
                                { key: 'tinggiLemak', label: 'd. Konsumsi Tinggi Lemak' }
                              ].map(({ key, label }) => {
                                const val = categoryForm.perilakuBerisikoDewasa?.[key] || 'Tidak';
                                return (
                                  <div className="col-12 col-md-6" key={key}>
                                    <div 
                                      className="p-3 px-3.5 rounded-3 d-flex align-items-center justify-content-between h-100 transition-all"
                                      style={{
                                        backgroundColor: val === 'Ya' ? '#fff1f2' : '#f8fafc',
                                        border: val === 'Ya' ? '1px solid #fecdd3' : '1px solid #e2e8f0'
                                      }}
                                    >
                                      <span className="text-dark fw-medium pe-2" style={{ fontSize: '0.85rem' }}>{label}</span>
                                      <div className="btn-group btn-group-sm rounded-pill p-0.5 bg-white border flex-shrink-0" role="group">
                                        <button
                                          type="button"
                                          className="btn btn-sm px-3 py-1 rounded-pill border-0 transition-all"
                                          style={
                                            val === 'Ya'
                                              ? { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 600, fontSize: '0.75rem', minWidth: '46px' }
                                              : { backgroundColor: 'transparent', color: '#64748b', fontSize: '0.75rem', minWidth: '46px' }
                                          }
                                          onClick={() => setCategoryForm({
                                            ...categoryForm,
                                            perilakuBerisikoDewasa: {
                                              ...(categoryForm.perilakuBerisikoDewasa || {}),
                                              [key]: 'Ya'
                                            }
                                          })}
                                        >
                                          Ya
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm px-3 py-1 rounded-pill border-0 transition-all"
                                          style={
                                            val === 'Tidak'
                                              ? { backgroundColor: '#e2e8f0', color: '#334155', fontWeight: 600, fontSize: '0.75rem', minWidth: '46px' }
                                              : { backgroundColor: 'transparent', color: '#64748b', fontSize: '0.75rem', minWidth: '46px' }
                                          }
                                          onClick={() => setCategoryForm({
                                            ...categoryForm,
                                            perilakuBerisikoDewasa: {
                                              ...(categoryForm.perilakuBerisikoDewasa || {}),
                                              [key]: 'Tidak'
                                            }
                                          })}
                                        >
                                          Tidak
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <button type="button" className="btn btn-light border px-4 py-2 fw-semibold" onClick={() => setShowCategoryFormModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-dark-custom text-white px-4 py-2 fw-semibold">
                  Simpan
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}


      {/* ========================================================================= */}
      {/* MODAL 3: STEP 1 - SASARAN MUTASI (CEK DATA) */}
      {/* ========================================================================= */}
      <Modal show={showMutasiCheckModal} onHide={() => setShowMutasiCheckModal(false)} centered>
        <form onSubmit={handleMutasiCheckSubmit}>
          <div className="p-4 bg-white rounded-4 border-0">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-light text-dark rounded-3 border">
                  <UserCheck size={22} />
                </div>
                <div>
                  <h4 className="fw-bold mb-0 text-dark">Sasaran Mutasi</h4>
                  <p className="text-muted small mb-0">Pencatatan data sasaran baru</p>
                </div>
              </div>
              <button type="button" className="btn border-0 text-muted" onClick={() => setShowMutasiCheckModal(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium small mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                className="form-control form-control-custom"
                placeholder="Masukkan nama lengkap"
                value={mutasiCheckForm.nama}
                onChange={(e) => setMutasiCheckForm({ ...mutasiCheckForm, nama: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label fw-medium small mb-0">Nomor Induk Kependudukan (NIK)</label>
                <span className={`small ${mutasiCheckForm.nik?.length === 16 ? 'text-success fw-bold' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                  {mutasiCheckForm.nik?.length || 0}/16 Digit
                </span>
              </div>
              <input 
                type="text" 
                maxLength={16}
                className={`form-control form-control-custom ${mutasiCheckForm.nik && mutasiCheckForm.nik.length !== 16 ? 'is-invalid' : ''}`}
                placeholder="Masukkan 16 digit NIK"
                value={mutasiCheckForm.nik}
                onChange={(e) => setMutasiCheckForm({ ...mutasiCheckForm, nik: formatNikInput(e.target.value) })}
                required
              />
              {mutasiCheckForm.nik && mutasiCheckForm.nik.length !== 16 && (
                <div className="invalid-feedback" style={{ fontSize: '0.74rem' }}>
                  NIK harus 16 digit angka (kurang {16 - mutasiCheckForm.nik.length} digit lagi).
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium small mb-1">Nama Ibu</label>
              <input 
                type="text" 
                className="form-control form-control-custom"
                placeholder="Masukkan nama ibu kandung"
                value={mutasiCheckForm.namaIbu}
                onChange={(e) => setMutasiCheckForm({ ...mutasiCheckForm, namaIbu: e.target.value })}
                required
              />
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <button type="button" className="btn btn-secondary px-4 py-2" onClick={() => setShowMutasiCheckModal(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-dark-custom px-4 py-2">
                Cek Data
              </button>
            </div>
          </div>
        </form>
      </Modal>


      {/* ========================================================================= */}
      {/* MODAL 3.5: STEP 1.5 - VERIFIKASI DATA SEBELUM MUTASI */}
      {/* ========================================================================= */}
      <Modal show={showMutasiVerifyModal} onHide={() => setShowMutasiVerifyModal(false)} centered>
        <div className="p-4 bg-white rounded-4 border-0">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 bg-success-subtle text-success rounded-3 border border-success-subtle">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-dark">Hasil Verifikasi Kependudukan</h5>
                <p className="text-muted small mb-0">Konfirmasi data warga sebelum mutasi</p>
              </div>
            </div>
            <button type="button" className="btn border-0 text-muted" onClick={() => setShowMutasiVerifyModal(false)}>
              <X size={22} />
            </button>
          </div>

          <div className="p-3 bg-light rounded-3 border mb-4">
            <div className="row g-2.5 small">
              <div className="col-12 pb-2 border-bottom">
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Nama Lengkap</span>
                <span className="fw-bold text-dark fs-6">{mutasiCheckForm.nama || '-'}</span>
              </div>
              <div className="col-6 pt-1">
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>NIK</span>
                <span className="fw-bold font-monospace text-dark">{mutasiCheckForm.nik || '-'}</span>
              </div>
              <div className="col-6 pt-1">
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Nama Ibu Kandung</span>
                <span className="fw-bold text-dark">{mutasiCheckForm.namaIbu || '-'}</span>
              </div>
              <div className="col-12 pt-2 border-top">
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Alamat</span>
                <span className="fw-semibold text-dark">{mutasiCheckForm.alamat || mutasiCheckForm.alamatAsal || 'Jl. Melati No. 12, RW 04, Desa Sukamaju'}</span>
              </div>
              <div className="col-12 pt-2 border-top">
                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Posyandu Sebelum Mutasi</span>
                <span className="fw-semibold text-dark">{mutasiCheckForm.posyanduAsal || 'Posyandu Melati RW 04'}</span>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button 
              type="button" 
              className="btn btn-outline-secondary px-3 py-2" 
              onClick={() => {
                setShowMutasiVerifyModal(false);
                setShowMutasiCheckModal(true);
              }}
            >
              Cek Ulang
            </button>
            <button 
              type="button" 
              className="btn btn-dark-custom px-4 py-2 fw-semibold text-white"
              style={{ backgroundColor: '#2b2e4a', borderColor: '#2b2e4a' }}
              onClick={handleConfirmMutasiVerification}
            >
              Lanjutkan
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: STEP 2 - TAMBAH SASARAN MUTASI (SESUAI GAMBAR FORM ASLI) */}
      {/* ========================================================================= */}
      <Modal show={showMutasiFormModal} onHide={() => setShowMutasiFormModal(false)} centered size="lg">
        <form onSubmit={handleMutasiSaveSubmit}>
          <div className="p-4 bg-white rounded-4 border-0">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-dark text-white rounded-3">
                  <UserCheck size={22} />
                </div>
                <div>
                  <h4 className="fw-bold mb-0 text-dark">Tambah Sasaran Mutasi</h4>
                  <p className="text-muted small mb-0">Pencatatan data sasaran baru</p>
                </div>
              </div>
              <button type="button" className="btn border-0 text-muted" onClick={() => setShowMutasiFormModal(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="row g-3 mb-4">
              {/* Kolom Kiri */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-medium small mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    className="form-control form-control-custom"
                    value={mutasiForm.nama}
                    onChange={(e) => setMutasiForm({ ...mutasiForm, nama: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-medium small mb-0">Nomor Induk Kependudukan (NIK)</label>
                    <span className={`small ${mutasiForm.nik?.length === 16 ? 'text-success fw-bold' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                      {mutasiForm.nik?.length || 0}/16 Digit
                    </span>
                  </div>
                  <input 
                    type="text" 
                    maxLength={16}
                    className="form-control form-control-custom font-monospace"
                    value={mutasiForm.nik}
                    onChange={(e) => setMutasiForm({ ...mutasiForm, nik: formatNikInput(e.target.value) })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium small mb-1">Jenis Kelamin</label>
                  <select 
                    className="form-select form-select-custom"
                    value={mutasiForm.gender}
                    onChange={(e) => setMutasiForm({ ...mutasiForm, gender: e.target.value })}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium small mb-1">Status Pernikahan</label>
                  <input 
                    type="text" 
                    className="form-control form-control-custom"
                    value={mutasiForm.statusPernikahan}
                    onChange={(e) => setMutasiForm({ ...mutasiForm, statusPernikahan: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium small mb-1">Pekerjaan</label>
                  <input 
                    type="text" 
                    className="form-control form-control-custom"
                    value={mutasiForm.pekerjaan}
                    onChange={(e) => setMutasiForm({ ...mutasiForm, pekerjaan: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium small mb-1">Status Sasaran</label>
                  <select 
                    className="form-select form-select-custom"
                    value={mutasiForm.status}
                    onChange={(e) => setMutasiForm({ ...mutasiForm, status: e.target.value })}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-medium small mb-1">Tanggal Lahir</label>
                  <input 
                    type="date" 
                    max={new Date().toISOString().split('T')[0]}
                    className="form-control form-control-custom"
                    value={mutasiForm.tglLahir}
                    onChange={(e) => setMutasiForm({ ...mutasiForm, tglLahir: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium small mb-1">Nama Ibu</label>
                  <input 
                    type="text" 
                    className="form-control form-control-custom"
                    value={mutasiForm.namaIbu}
                    onChange={(e) => setMutasiForm({ ...mutasiForm, namaIbu: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium small mb-1">Nomor Telepon / WhatsApp</label>
                  <input 
                    type="text" 
                    maxLength={15}
                    className="form-control form-control-custom"
                    placeholder="0812xxxxxxxx"
                    value={mutasiForm.noHp}
                    onChange={(e) => setMutasiForm({ ...mutasiForm, noHp: formatPhoneInput(e.target.value) })}
                  />
                </div>

                {/* Alamat Domisili Baru (Sesuai gambar, tanpa teks pink dan tanpa teks dukcapil) */}
                <div className="mb-3">
                  <label className="form-label fw-medium small mb-1">
                    Alamat Domisili Baru
                  </label>
                  <textarea 
                    className="form-control form-control-custom"
                    rows="6"
                    placeholder="Masukkan alamat domisili baru..."
                    value={mutasiForm.alamatDomisiliBaru}
                    onChange={(e) => setMutasiForm({ ...mutasiForm, alamatDomisiliBaru: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <button type="button" className="btn btn-secondary px-4 py-2" onClick={() => setShowMutasiFormModal(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-dark-custom px-5 py-2">
                Simpan
              </button>
            </div>
          </div>
        </form>
      </Modal>


      {/* Harmonized Detail Modal */}
      {showDetailModal && selectedSasaran && (
        <DetailSasaranModal 
          show={showDetailModal} 
          onClose={() => setShowDetailModal(false)} 
          onHide={() => setShowDetailModal(false)} 
          selectedSasaran={selectedSasaran} 
          theme="kader"
          themeColor="#2b2e4a" 
        />
      )}

      {/* Edit Modal */}
      {selectedSasaran && showEditModal && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
          <form onSubmit={handleEditSubmit}>
            <div className="p-4 bg-white rounded-4 border-0">
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-dark text-white rounded-3">
                    <Edit size={22} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0 text-dark">Edit Data Sasaran [{selectedSasaran.kategori}]</h4>
                    <p className="text-muted small mb-0">Perbarui informasi data sasaran sesuai pendaftaran</p>
                  </div>
                </div>
                <button type="button" className="btn border-0 text-muted" onClick={() => setShowEditModal(false)}>
                  <X size={22} />
                </button>
              </div>

              {/* PERCABANGAN 3 VARIASI FORM EDIT SESUAI GAMBAR 1, 2, 3 */}

              {/* 1. EDIT IBU HAMIL (GAMBAR 2) */}
              {selectedSasaran.kategori?.toLowerCase().includes('bumil') ? (
                <div className="row g-3 mb-4">
                  {/* Kolom Kiri */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nama Lengkap</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        value={selectedSasaran.nama || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, nama: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label fw-medium small mb-0">Nomor Induk Kependudukan (NIK)</label>
                        <span className={`small ${selectedSasaran.nik?.length === 16 ? 'text-success fw-bold' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                          {selectedSasaran.nik?.length || 0}/16 Digit
                        </span>
                      </div>
                      <input 
                        type="text" 
                        maxLength={16}
                        className={`form-control form-control-custom ${selectedSasaran.nik && selectedSasaran.nik.length !== 16 ? 'is-invalid' : ''}`}
                        placeholder="Masukkan 16 digit NIK"
                        value={selectedSasaran.nik || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, nik: formatNikInput(e.target.value) })}
                      />
                      {selectedSasaran.nik && selectedSasaran.nik.length !== 16 && (
                        <div className="invalid-feedback" style={{ fontSize: '0.74rem' }}>
                          NIK harus 16 digit angka (kurang {16 - selectedSasaran.nik.length} digit lagi).
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Tanggal Lahir</label>
                      <input 
                        type="date" 
                        max={new Date().toISOString().split('T')[0]}
                        className="form-control form-control-custom"
                        value={selectedSasaran.tglLahir || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, tglLahir: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nomor Telepon / WhatsApp</label>
                      <input 
                        type="text" 
                        maxLength={15}
                        className="form-control form-control-custom"
                        placeholder="0812xxxxxxxx"
                        value={selectedSasaran.noHp || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, noHp: formatPhoneInput(e.target.value) })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">HPHT (Hari Pertama Haid Terakhir)</label>
                      <input 
                        type="date" 
                        className="form-control form-control-custom"
                        value={selectedSasaran.hpht || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, hpht: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">HPL</label>
                      <input 
                        type="date" 
                        className="form-control form-control-custom"
                        value={selectedSasaran.hpl || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, hpl: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label fw-medium small mb-1">BB Sblm Hamil</label>
                          <div className="input-group">
                            <input 
                              type="number" 
                              step="0.1" 
                              className="form-control form-control-custom"
                              placeholder="50.0"
                              value={selectedSasaran.bb ? String(selectedSasaran.bb).replace(/[^0-9.]/g, '') : ''}
                              onChange={(e) => setSelectedSasaran({ ...selectedSasaran, bb: e.target.value })}
                            />
                            <span className="input-group-text bg-white border text-muted small">kg</span>
                          </div>
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-medium small mb-1">Tinggi Badan (TB)</label>
                          <div className="input-group">
                            <input 
                              type="number" 
                              step="0.1" 
                              className="form-control form-control-custom"
                              placeholder="155.0"
                              value={selectedSasaran.tb ? String(selectedSasaran.tb).replace(/[^0-9.]/g, '') : ''}
                              onChange={(e) => setSelectedSasaran({ ...selectedSasaran, tb: e.target.value })}
                            />
                            <span className="input-group-text bg-white border text-muted small">cm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nama Ayah / Suami</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        value={selectedSasaran.namaAyah || selectedSasaran.namaSuami || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, namaAyah: e.target.value, namaSuami: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Anak ke-</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        value={selectedSasaran.anakKe || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, anakKe: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Jarak anak sebelumnya</label>
                      <select 
                        className="form-select form-select-custom"
                        value={selectedSasaran.jarakAnak || 'Anak Pertama'}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, jarakAnak: e.target.value })}
                      >
                        <option value="Anak Pertama">Anak Pertama</option>
                        <option value="< 2 Thn">&lt; 2 Thn</option>
                        <option value="2 - 5 Thn">2 - 5 Thn</option>
                        <option value="> 5 Thn">&gt; 5 Thn</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Tanggal Persalinan</label>
                      <input 
                        type="date" 
                        className="form-control form-control-custom"
                        value={selectedSasaran.tglPersalinan || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, tglPersalinan: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Status Sasaran</label>
                      <select 
                        className="form-select form-select-custom"
                        value={selectedSasaran.status || 'Aktif'}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, status: e.target.value })}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Non-Aktif">Non-Aktif</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Alamat Domisili</label>
                      <textarea 
                        className="form-control form-control-custom"
                        rows="2"
                        value={selectedSasaran.alamat || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, alamat: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : selectedSasaran.kategori?.toLowerCase().includes('bayi') ? (
                /* 2. EDIT BAYI 0-11 BULAN (GAMBAR 3) */
                <div className="row g-3 mb-4">
                  {/* Kolom Kiri */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nama Lengkap</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        value={selectedSasaran.nama || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, nama: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label fw-medium small mb-0">Nomor Induk Kependudukan (NIK)</label>
                        <span className={`small ${selectedSasaran.nik?.length === 16 ? 'text-success fw-bold' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                          {selectedSasaran.nik?.length || 0}/16 Digit
                        </span>
                      </div>
                      <input 
                        type="text" 
                        maxLength={16}
                        className={`form-control form-control-custom ${selectedSasaran.nik && selectedSasaran.nik.length !== 16 ? 'is-invalid' : ''}`}
                        placeholder="Masukkan 16 digit NIK"
                        value={selectedSasaran.nik || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, nik: formatNikInput(e.target.value) })}
                      />
                      {selectedSasaran.nik && selectedSasaran.nik.length !== 16 && (
                        <div className="invalid-feedback" style={{ fontSize: '0.74rem' }}>
                          NIK harus 16 digit angka (kurang {16 - selectedSasaran.nik.length} digit lagi).
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Jenis Kelamin</label>
                      <select 
                        className="form-select form-select-custom"
                        value={selectedSasaran.gender || 'Perempuan'}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, gender: e.target.value })}
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label fw-medium small mb-1">Berat Lahir (BBL)</label>
                          <input 
                            type="number" step="0.1" 
                            className="form-control form-control-custom"
                            placeholder="BBL (kg)"
                            value={selectedSasaran.bbl ? selectedSasaran.bbl.toString().replace(/[^0-9.]/g, '') : (selectedSasaran.bb || '')}
                            onChange={(e) => setSelectedSasaran({ ...selectedSasaran, bbl: e.target.value, bb: e.target.value })}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-medium small mb-1">Panjang Lahir (PBL)</label>
                          <input 
                            type="number" step="0.1" 
                            className="form-control form-control-custom"
                            placeholder="PBL (cm)"
                            value={selectedSasaran.pbl ? selectedSasaran.pbl.toString().replace(/[^0-9.]/g, '') : (selectedSasaran.tb || '')}
                            onChange={(e) => setSelectedSasaran({ ...selectedSasaran, pbl: e.target.value, tb: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Status Sasaran</label>
                      <select 
                        className="form-select form-select-custom"
                        value={selectedSasaran.status || 'Aktif'}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, status: e.target.value })}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Non-Aktif">Non-Aktif</option>
                      </select>
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Tanggal Lahir</label>
                      <input 
                        type="date" 
                        max={new Date().toISOString().split('T')[0]}
                        className="form-control form-control-custom"
                        value={selectedSasaran.tglLahir || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, tglLahir: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nama Ibu</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        value={selectedSasaran.namaIbu || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, namaIbu: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nama Ayah</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        value={selectedSasaran.namaAyah || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, namaAyah: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Alamat Domisili</label>
                      <textarea 
                        className="form-control form-control-custom"
                        rows="3"
                        value={selectedSasaran.alamat || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, alamat: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : (
                /* 3. EDIT STANDAR (GAMBAR 1) + KHUSUS NIFAS MENYUSUI DITAMBAHKAN STATUS MENYUSUI */
                <div className="row g-3 mb-4">
                  {/* Kolom Kiri */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nama Lengkap</label>
                      <input 
                        type="text" 
                        className="form-control form-control-custom"
                        value={selectedSasaran.nama || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, nama: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label fw-medium small mb-0">Nomor Induk Kependudukan (NIK)</label>
                        <span className={`small ${selectedSasaran.nik?.length === 16 ? 'text-success fw-bold' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                          {selectedSasaran.nik?.length || 0}/16 Digit
                        </span>
                      </div>
                      <input 
                        type="text" 
                        maxLength={16}
                        className={`form-control form-control-custom ${selectedSasaran.nik && selectedSasaran.nik.length !== 16 ? 'is-invalid' : ''}`}
                        placeholder="Masukkan 16 digit NIK"
                        value={selectedSasaran.nik || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, nik: formatNikInput(e.target.value) })}
                      />
                      {selectedSasaran.nik && selectedSasaran.nik.length !== 16 && (
                        <div className="invalid-feedback" style={{ fontSize: '0.74rem' }}>
                          NIK harus 16 digit angka (kurang {16 - selectedSasaran.nik.length} digit lagi).
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Jenis Kelamin</label>
                      <select 
                        className="form-select form-select-custom"
                        value={selectedSasaran.gender || 'Perempuan'}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, gender: e.target.value })}
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    {/* Status Pernikahan & Pekerjaan (Dihapus untuk balita, apras, dan usekrem 6-14) */}
                    {!['balita-12-59', 'balita', 'apras', 'apras-60-72', 'usekrem-6-14'].some(k => (selectedSasaran.kategori || '').toLowerCase().includes(k) || (selectedSasaran.subKategori || '').toLowerCase().includes(k)) && (
                      <>
                        <div className="mb-3">
                          <label className="form-label fw-medium small mb-1">Status Pernikahan</label>
                          <select 
                            className="form-select form-select-custom"
                            value={selectedSasaran.statusPernikahan || 'Belum Menikah'}
                            onChange={(e) => setSelectedSasaran({ ...selectedSasaran, statusPernikahan: e.target.value })}
                          >
                            <option value="Belum Menikah">Belum Menikah</option>
                            <option value="Menikah">Menikah</option>
                            <option value="Cerai Hidup">Cerai Hidup</option>
                            <option value="Cerai Mati">Cerai Mati</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-medium small mb-1">Pekerjaan</label>
                          <select 
                            className="form-select form-select-custom"
                            value={selectedSasaran.pekerjaan || ''}
                            onChange={(e) => setSelectedSasaran({ ...selectedSasaran, pekerjaan: e.target.value })}
                          >
                            <option value="">Pilih pekerjaan</option>
                            <option value="Tidak Bekerja / Pelajar">Tidak Bekerja / Pelajar</option>
                            <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                            <option value="Karyawan Swasta">Karyawan Swasta</option>
                            <option value="PNS / TNI / POLRI">PNS / TNI / POLRI</option>
                            <option value="Wiraswasta / Pedagang">Wiraswasta / Pedagang</option>
                            <option value="Petani / Buruh">Petani / Buruh</option>
                            <option value="Pensiunan">Pensiunan</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* KHUSUS NIFAS / MENYUSUI: DITAMBAHKAN SATU FIELD STATUS MENYUSUI */}
                    {selectedSasaran.kategori?.toLowerCase().includes('nifas') && (
                      <div className="mb-3">
                        <label className="form-label fw-bold text-primary small mb-1">Status Menyusui</label>
                        <select 
                          className="form-select form-select-custom border-primary"
                          value={selectedSasaran.statusMenyusui || 'Masih Menyusui'}
                          onChange={(e) => setSelectedSasaran({ ...selectedSasaran, statusMenyusui: e.target.value })}
                        >
                          <option value="Masih Menyusui">Masih Menyusui</option>
                          <option value="Sudah Tidak Menyusui">Sudah Tidak Menyusui</option>
                        </select>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Status Sasaran</label>
                      <select 
                        className="form-select form-select-custom"
                        value={selectedSasaran.status || 'Aktif'}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, status: e.target.value })}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Non-Aktif">Non-Aktif</option>
                      </select>
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Tanggal Lahir</label>
                      <input 
                        type="date" 
                        max={new Date().toISOString().split('T')[0]}
                        className="form-control form-control-custom"
                        value={selectedSasaran.tglLahir || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, tglLahir: e.target.value })}
                        required
                      />
                    </div>
                    {!['dewasa', 'lansia'].some(k => (selectedSasaran.kategori || '').toLowerCase().includes(k) || (selectedSasaran.subKategori || '').toLowerCase().includes(k)) && (
                      <div className="mb-3">
                        <label className="form-label fw-medium small mb-1">Nama Ibu</label>
                        <input 
                          type="text" 
                          className="form-control form-control-custom"
                          value={selectedSasaran.namaIbu || ''}
                          onChange={(e) => setSelectedSasaran({ ...selectedSasaran, namaIbu: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Nomor Telepon / WhatsApp</label>
                      <input 
                        type="text" 
                        maxLength={15}
                        className="form-control form-control-custom"
                        placeholder="0812xxxxxxxx"
                        value={selectedSasaran.noHp || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, noHp: formatPhoneInput(e.target.value) })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-medium small mb-1">Alamat Domisili</label>
                      <textarea 
                        className="form-control form-control-custom"
                        rows="3"
                        value={selectedSasaran.alamat || ''}
                        onChange={(e) => setSelectedSasaran({ ...selectedSasaran, alamat: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  {/* KHUSUS USEKREM 6-14 & USEKREM 15-18: EDIT RIWAYAT KELUARGA & PERILAKU BERISIKO */}
                  {['usekrem-6-14', 'usekrem-15-18', 'usekrem', 'remaja'].some(k => (selectedSasaran.kategori || '').toLowerCase().includes(k) || (selectedSasaran.subKategori || '').toLowerCase().includes(k)) && (
                    <div className="col-12 mt-3">
                      <div className="card border shadow-sm rounded-4 overflow-hidden bg-white mb-2">
                        <div className="card-header bg-light bg-opacity-75 border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <Activity size={18} style={{ color: '#be123c' }} />
                            <span className="fw-bold text-dark fs-6">Skrining Riwayat Penyakit &amp; Perilaku Berisiko</span>
                          </div>
                          <span className="badge bg-white border text-secondary fw-medium px-2.5 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>
                            Kemenkes RI
                          </span>
                        </div>

                        <div className="card-body p-4">
                          {/* 1. Riwayat Keluarga */}
                          <div className="mb-4 pb-4 border-bottom">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div>
                                <span className="fw-bold text-dark fs-6 d-block mb-1">Riwayat Penyakit Keluarga</span>
                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Pilih jika ada anggota keluarga kandung yang memiliki riwayat penyakit</span>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-sm py-1.5 px-3 rounded-pill border transition-all"
                                style={
                                  (Array.isArray(selectedSasaran.riwayatKeluarga) ? selectedSasaran.riwayatKeluarga : []).includes('Tidak Ada')
                                    ? { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 600, fontSize: '0.75rem' }
                                    : { backgroundColor: '#ffffff', color: '#64748b', borderColor: '#cbd5e1', fontSize: '0.75rem' }
                                }
                                onClick={() => setSelectedSasaran({ 
                                  ...selectedSasaran, 
                                  riwayatKeluarga: (Array.isArray(selectedSasaran.riwayatKeluarga) ? selectedSasaran.riwayatKeluarga : []).includes('Tidak Ada') ? [] : ['Tidak Ada'] 
                                })}
                              >
                                {(Array.isArray(selectedSasaran.riwayatKeluarga) ? selectedSasaran.riwayatKeluarga : []).includes('Tidak Ada') ? '✓ Tidak Ada Riwayat' : 'Tidak Ada Riwayat'}
                              </button>
                            </div>
                            <div className="d-flex flex-wrap gap-2 pt-1">
                              {[
                                { key: 'Hipertensi', label: 'a. Hipertensi' },
                                { key: 'DM', label: 'b. DM' },
                                { key: 'Stroke', label: 'c. Stroke' },
                                { key: 'Jantung', label: 'd. Jantung' },
                                { key: 'Asma', label: 'e. Asma' },
                                { key: 'Kanker', label: 'f. Kanker' },
                                { key: 'Kolesterol Tinggi', label: 'g. Kolesterol Tinggi' }
                              ].map(({ key, label }) => {
                                const isSelected = (Array.isArray(selectedSasaran.riwayatKeluarga) ? selectedSasaran.riwayatKeluarga : []).includes(key);
                                return (
                                  <button
                                    type="button"
                                    key={key}
                                    className="btn btn-sm rounded-pill px-3.5 py-1.5 border transition-all"
                                    style={
                                      isSelected
                                        ? { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', fontWeight: 600, fontSize: '0.8rem' }
                                        : { backgroundColor: '#ffffff', color: '#334155', borderColor: '#e2e8f0', fontSize: '0.8rem' }
                                    }
                                    onClick={() => {
                                      const cur = (Array.isArray(selectedSasaran.riwayatKeluarga) ? selectedSasaran.riwayatKeluarga : []).filter(x => x !== 'Tidak Ada');
                                      const next = cur.includes(key) ? cur.filter(x => x !== key) : [...cur, key];
                                      setSelectedSasaran({ ...selectedSasaran, riwayatKeluarga: next });
                                    }}
                                  >
                                    {isSelected ? '✓ ' : ''}{label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. Perilaku Berisiko Diri */}
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div>
                                <span className="fw-bold text-dark fs-6 d-block mb-1">Perilaku Berisiko Diri</span>
                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Pilih jika sasaran memiliki riwayat penyakit atau faktor risiko</span>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-sm py-1.5 px-3 rounded-pill border transition-all"
                                style={
                                  (Array.isArray(selectedSasaran.perilakuBerisiko) ? selectedSasaran.perilakuBerisiko : []).includes('Tidak Ada')
                                    ? { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 600, fontSize: '0.75rem' }
                                    : { backgroundColor: '#ffffff', color: '#64748b', borderColor: '#cbd5e1', fontSize: '0.75rem' }
                                }
                                onClick={() => setSelectedSasaran({ 
                                  ...selectedSasaran, 
                                  perilakuBerisiko: (Array.isArray(selectedSasaran.perilakuBerisiko) ? selectedSasaran.perilakuBerisiko : []).includes('Tidak Ada') ? [] : ['Tidak Ada'] 
                                })}
                              >
                                {(Array.isArray(selectedSasaran.perilakuBerisiko) ? selectedSasaran.perilakuBerisiko : []).includes('Tidak Ada') ? '✓ Tidak Ada' : 'Tidak Ada'}
                              </button>
                            </div>
                            <div className="d-flex flex-wrap gap-2 pt-1">
                              {[
                                { key: 'Hipertensi', label: 'a. Hipertensi' },
                                { key: 'DM', label: 'b. DM' },
                                { key: 'Stroke', label: 'c. Stroke' },
                                { key: 'Jantung', label: 'd. Jantung' },
                                { key: 'Asma', label: 'e. Asma' },
                                { key: 'Kanker', label: 'f. Kanker' },
                                { key: 'Kolesterol Tinggi', label: 'g. Kolesterol Tinggi' }
                              ].map(({ key, label }) => {
                                const isSelected = (Array.isArray(selectedSasaran.perilakuBerisiko) ? selectedSasaran.perilakuBerisiko : []).includes(key);
                                return (
                                  <button
                                    type="button"
                                    key={key}
                                    className="btn btn-sm rounded-pill px-3.5 py-1.5 border transition-all"
                                    style={
                                      isSelected
                                        ? { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', fontWeight: 600, fontSize: '0.8rem' }
                                        : { backgroundColor: '#ffffff', color: '#334155', borderColor: '#e2e8f0', fontSize: '0.8rem' }
                                    }
                                    onClick={() => {
                                      const cur = (Array.isArray(selectedSasaran.perilakuBerisiko) ? selectedSasaran.perilakuBerisiko : []).filter(x => x !== 'Tidak Ada');
                                      const next = cur.includes(key) ? cur.filter(x => x !== key) : [...cur, key];
                                      setSelectedSasaran({ ...selectedSasaran, perilakuBerisiko: next });
                                    }}
                                  >
                                    {isSelected ? '✓ ' : ''}{label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KHUSUS DEWASA & LANSIA: EDIT RIWAYAT KELUARGA, DIRI SENDIRI & PERILAKU BERISIKO */}
                  {['dewasa', 'lansia'].some(k => (selectedSasaran.kategori || '').toLowerCase().includes(k) || (selectedSasaran.subKategori || '').toLowerCase().includes(k)) && (
                    <div className="col-12 mt-3">
                      <div className="card border shadow-sm rounded-4 overflow-hidden bg-white mb-2">
                        <div className="card-header bg-light bg-opacity-75 border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <Activity size={18} style={{ color: '#be123c' }} />
                            <span className="fw-bold text-dark fs-6">Skrining Riwayat Penyakit &amp; Perilaku Berisiko</span>
                          </div>
                          <span className="badge bg-white border text-secondary fw-medium px-2.5 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>
                            Kemenkes RI
                          </span>
                        </div>

                        <div className="card-body p-4">
                          {/* 1. Riwayat Keluarga */}
                          <div className="mb-4 pb-4 border-bottom">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div>
                                <span className="fw-bold text-dark fs-6 d-block mb-1">Riwayat Penyakit Keluarga</span>
                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Pilih jika ada anggota keluarga kandung yang memiliki riwayat penyakit</span>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-sm py-1.5 px-3 rounded-pill border transition-all"
                                style={
                                  (Array.isArray(selectedSasaran.riwayatKeluarga) ? selectedSasaran.riwayatKeluarga : []).includes('Tidak Ada')
                                    ? { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 600, fontSize: '0.75rem' }
                                    : { backgroundColor: '#ffffff', color: '#64748b', borderColor: '#cbd5e1', fontSize: '0.75rem' }
                                }
                                onClick={() => setSelectedSasaran({ 
                                  ...selectedSasaran, 
                                  riwayatKeluarga: (Array.isArray(selectedSasaran.riwayatKeluarga) ? selectedSasaran.riwayatKeluarga : []).includes('Tidak Ada') ? [] : ['Tidak Ada'] 
                                })}
                              >
                                {(Array.isArray(selectedSasaran.riwayatKeluarga) ? selectedSasaran.riwayatKeluarga : []).includes('Tidak Ada') ? '✓ Tidak Ada Riwayat' : 'Tidak Ada Riwayat'}
                              </button>
                            </div>
                            <div className="d-flex flex-wrap gap-2 pt-1">
                              {[
                                { key: 'Hipertensi', label: 'a. Hipertensi' },
                                { key: 'DM', label: 'b. DM' },
                                { key: 'Stroke', label: 'c. Stroke' },
                                { key: 'Jantung', label: 'd. Jantung' },
                                { key: 'Asma', label: 'e. Asma' }
                              ].map(({ key, label }) => {
                                const isSelected = (Array.isArray(selectedSasaran.riwayatKeluarga) ? selectedSasaran.riwayatKeluarga : []).includes(key);
                                return (
                                  <button
                                    type="button"
                                    key={key}
                                    className="btn btn-sm rounded-pill px-3.5 py-1.5 border transition-all"
                                    style={
                                      isSelected
                                        ? { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', fontWeight: 600, fontSize: '0.8rem' }
                                        : { backgroundColor: '#ffffff', color: '#334155', borderColor: '#e2e8f0', fontSize: '0.8rem' }
                                    }
                                    onClick={() => {
                                      const cur = (Array.isArray(selectedSasaran.riwayatKeluarga) ? selectedSasaran.riwayatKeluarga : []).filter(x => x !== 'Tidak Ada');
                                      const next = cur.includes(key) ? cur.filter(x => x !== key) : [...cur, key];
                                      setSelectedSasaran({ ...selectedSasaran, riwayatKeluarga: next });
                                    }}
                                  >
                                    {isSelected ? '✓ ' : ''}{label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. Riwayat Diri Sendiri */}
                          <div className="mb-4 pb-4 border-bottom">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div>
                                <span className="fw-bold text-dark fs-6 d-block mb-1">Riwayat Penyakit Diri Sendiri</span>
                                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Pilih jika sasaran pernah/sedang didiagnosis riwayat penyakit</span>
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-sm py-1.5 px-3 rounded-pill border transition-all"
                                style={
                                  (Array.isArray(selectedSasaran.riwayatDiriSendiri) ? selectedSasaran.riwayatDiriSendiri : []).includes('Tidak Ada')
                                    ? { backgroundColor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', fontWeight: 600, fontSize: '0.75rem' }
                                    : { backgroundColor: '#ffffff', color: '#64748b', borderColor: '#cbd5e1', fontSize: '0.75rem' }
                                }
                                onClick={() => setSelectedSasaran({ 
                                  ...selectedSasaran, 
                                  riwayatDiriSendiri: (Array.isArray(selectedSasaran.riwayatDiriSendiri) ? selectedSasaran.riwayatDiriSendiri : []).includes('Tidak Ada') ? [] : ['Tidak Ada'] 
                                })}
                              >
                                {(Array.isArray(selectedSasaran.riwayatDiriSendiri) ? selectedSasaran.riwayatDiriSendiri : []).includes('Tidak Ada') ? '✓ Tidak Ada Riwayat' : 'Tidak Ada Riwayat'}
                              </button>
                            </div>
                            <div className="d-flex flex-wrap gap-2 pt-1">
                              {[
                                { key: 'Hipertensi', label: 'a. Hipertensi' },
                                { key: 'DM', label: 'b. DM' },
                                { key: 'Stroke', label: 'c. Stroke' },
                                { key: 'Jantung', label: 'd. Jantung' },
                                { key: 'Asma', label: 'e. Asma' }
                              ].map(({ key, label }) => {
                                const isSelected = (Array.isArray(selectedSasaran.riwayatDiriSendiri) ? selectedSasaran.riwayatDiriSendiri : []).includes(key);
                                return (
                                  <button
                                    type="button"
                                    key={key}
                                    className="btn btn-sm rounded-pill px-3.5 py-1.5 border transition-all"
                                    style={
                                      isSelected
                                        ? { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5', fontWeight: 600, fontSize: '0.8rem' }
                                        : { backgroundColor: '#ffffff', color: '#334155', borderColor: '#e2e8f0', fontSize: '0.8rem' }
                                    }
                                    onClick={() => {
                                      const cur = (Array.isArray(selectedSasaran.riwayatDiriSendiri) ? selectedSasaran.riwayatDiriSendiri : []).filter(x => x !== 'Tidak Ada');
                                      const next = cur.includes(key) ? cur.filter(x => x !== key) : [...cur, key];
                                      setSelectedSasaran({ ...selectedSasaran, riwayatDiriSendiri: next });
                                    }}
                                  >
                                    {isSelected ? '✓ ' : ''}{label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 3. Perilaku Berisiko Diri Sendiri */}
                          <div className="pt-1">
                            <div className="mb-3">
                              <span className="fw-bold text-dark fs-6 d-block mb-1">Perilaku Berisiko Diri Sendiri</span>
                              <span className="text-muted" style={{ fontSize: '0.78rem' }}>Evaluasi faktor risiko pola konsumsi &amp; kebiasaan harian</span>
                            </div>
                            <div className="row g-3">
                              {[
                                { key: 'merokok', label: 'a. Merokok' },
                                { key: 'tinggiGula', label: 'b. Konsumsi Tinggi Gula' },
                                { key: 'tinggiGaram', label: 'c. Konsumsi Tinggi Garam' },
                                { key: 'tinggiLemak', label: 'd. Konsumsi Tinggi Lemak' }
                              ].map(({ key, label }) => {
                                const val = typeof selectedSasaran.perilakuBerisiko === 'object' && selectedSasaran.perilakuBerisiko?.[key] ? selectedSasaran.perilakuBerisiko[key] : 'Tidak';
                                return (
                                  <div className="col-12 col-md-6" key={key}>
                                    <div 
                                      className="p-3 px-3.5 rounded-3 d-flex align-items-center justify-content-between h-100 transition-all"
                                      style={{
                                        backgroundColor: val === 'Ya' ? '#fff1f2' : '#f8fafc',
                                        border: val === 'Ya' ? '1px solid #fecdd3' : '1px solid #e2e8f0'
                                      }}
                                    >
                                      <span className="text-dark fw-medium pe-2" style={{ fontSize: '0.85rem' }}>{label}</span>
                                      <div className="btn-group btn-group-sm rounded-pill p-0.5 bg-white border flex-shrink-0" role="group">
                                        <button
                                          type="button"
                                          className="btn btn-sm px-3 py-1 rounded-pill border-0 transition-all"
                                          style={
                                            val === 'Ya'
                                              ? { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 600, fontSize: '0.75rem', minWidth: '46px' }
                                              : { backgroundColor: 'transparent', color: '#64748b', fontSize: '0.75rem', minWidth: '46px' }
                                          }
                                          onClick={() => setSelectedSasaran({
                                            ...selectedSasaran,
                                            perilakuBerisiko: {
                                              ...(typeof selectedSasaran.perilakuBerisiko === 'object' ? selectedSasaran.perilakuBerisiko : {}),
                                              [key]: 'Ya'
                                            }
                                          })}
                                        >
                                          Ya
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm px-3 py-1 rounded-pill border-0 transition-all"
                                          style={
                                            val === 'Tidak'
                                              ? { backgroundColor: '#e2e8f0', color: '#334155', fontWeight: 600, fontSize: '0.75rem', minWidth: '46px' }
                                              : { backgroundColor: 'transparent', color: '#64748b', fontSize: '0.75rem', minWidth: '46px' }
                                          }
                                          onClick={() => setSelectedSasaran({
                                            ...selectedSasaran,
                                            perilakuBerisiko: {
                                              ...(typeof selectedSasaran.perilakuBerisiko === 'object' ? selectedSasaran.perilakuBerisiko : {}),
                                              [key]: 'Tidak'
                                            }
                                          })}
                                        >
                                          Tidak
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Button variant="light" className="border px-4 py-2 fw-semibold" onClick={() => setShowEditModal(false)}>Batal</Button>
                <Button type="submit" className="btn btn-dark-custom text-white px-4 py-2 fw-semibold">Simpan Perubahan</Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
