export const IMUNISASI_MASTER = [
  "Hepatitis",
  "BCG",
  "Polio Tetes 1",
  "DPT-HB-Hib 1",
  "Polio Tetes 2",
  "Rotavirus (RV)1",
  "PCV 1",
  "DPT-HB-Hib 2",
  "Polio Tetes 3",
  "Rotavirus (RV)2",
  "PCV 2",
  "DPT-HB-Hib 3",
  "Polio Tetes 4",
  "Polio Suntik (IPV)1",
  "Rotavirus (RV)3",
  "Campak-Rubella (MR)",
  "Polio Suntik (IPV)2",
  "Japanese Enchepalatis (JE)",
  "PCV 3",
  "DPT-HB-Hib Lanjutan",
  "Campak-Rubella (MR) Lanjutan",
];

export const TEMPAT_IMUNISASI = ["puskesmas", "klinik", "rs"];

export const emptyImunisasiRows = () =>
  IMUNISASI_MASTER.map((jenis_imunisasi) => ({
    jenis_imunisasi,
    is_diberikan: false,
    tanggal_imunisasi: "",
    tempat: "",
    no_batch: null,
  }));

export const mergeImunisasiRows = (records = []) => {
  const byType = new Map((Array.isArray(records) ? records : []).map((record) => [record.jenis_imunisasi, record]));
  return IMUNISASI_MASTER.map((jenis_imunisasi) => {
    const record = byType.get(jenis_imunisasi);
    return {
      jenis_imunisasi,
      is_diberikan: Boolean(record?.is_diberikan),
      tanggal_imunisasi: record?.is_diberikan ? record?.tanggal_imunisasi || "" : "",
      tempat: record?.is_diberikan ? record?.tempat || "" : "",
      no_batch: record?.no_batch || null,
    };
  });
};
