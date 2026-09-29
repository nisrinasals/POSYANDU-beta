import React from "react";
import { IMUNISASI_MASTER, TEMPAT_IMUNISASI } from "../../data/imunisasi";

const TEMPAT_LABEL = {
  puskesmas: "Puskesmas",
  klinik: "Klinik",
  rs: "RS",
};

export default function ImunisasiTableHistory({ rows = [], onChange = () => {} }) {
  const updateRow = (index, changes) => {
    const nextRows = rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...changes } : row));
    onChange(nextRows);
  };

  return (
    <div className="card card-custom p-3 bg-white border-0 shadow-sm mb-3">
      <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-2">
        <div>
          <h6 className="fw-bold mb-1">Imunisasi</h6>
          <small className="text-muted">Tandai imunisasi yang sudah diberikan, lalu lengkapi tanggal dan tempatnya.</small>
        </div>
        <span className="badge bg-light text-primary border">
          {rows.filter((row) => row.is_diberikan).length} / {IMUNISASI_MASTER.length}
        </span>
      </div>
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th style={{ width: "42px" }}>No.</th>
              <th>Jenis imunisasi</th>
              <th style={{ width: "120px" }}>Status</th>
              <th style={{ width: "160px" }}>Tanggal</th>
              <th style={{ width: "150px" }}>Tempat</th>
            </tr>
          </thead>
          <tbody>
            {IMUNISASI_MASTER.map((jenisImunisasi, index) => {
              const row = rows[index] || { jenis_imunisasi: jenisImunisasi, is_diberikan: false, tanggal_imunisasi: "", tempat: "" };
              return (
                <tr key={jenisImunisasi}>
                  <td>{index + 1}</td>
                  <td>{jenisImunisasi}</td>
                  <td>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={Boolean(row.is_diberikan)}
                        onChange={(event) => updateRow(index, event.target.checked ? { is_diberikan: true } : { is_diberikan: false, tanggal_imunisasi: "", tempat: "" })}
                        id={`imunisasi-${index}`}
                      />
                      <label className="form-check-label" htmlFor={`imunisasi-${index}`}>
                        Diberikan
                      </label>
                    </div>
                  </td>
                  <td>
                    <input className="form-control form-control-sm" type="date" value={row.tanggal_imunisasi || ""} disabled={!row.is_diberikan} onChange={(event) => updateRow(index, { tanggal_imunisasi: event.target.value })} />
                  </td>
                  <td>
                    <select className="form-select form-select-sm" value={row.tempat || ""} disabled={!row.is_diberikan} onChange={(event) => updateRow(index, { tempat: event.target.value })}>
                      <option value="">Pilih</option>
                      {TEMPAT_IMUNISASI.map((tempat) => (
                        <option key={tempat} value={tempat}>
                          {TEMPAT_LABEL[tempat]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
