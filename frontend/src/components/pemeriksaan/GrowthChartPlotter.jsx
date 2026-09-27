import React from "react";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * Read-only plotting renderer.
 * All measurements, z-scores, classifications and referral flags come from the backend.
 * This component intentionally performs no clinical calculation.
 */
export default function GrowthChartPlotter({ plottingData }) {
  if (!plottingData) return null;

  const results = plottingData.hasil_plot && typeof plottingData.hasil_plot === "object" ? plottingData.hasil_plot : {};

  const entries = Object.entries(results).filter(([key]) => key !== "status_rujukan" && key !== "is_perlu_rujukan");
  const zScores = plottingData.z_scores || {};
  const measurements = plottingData.pengukuran_step_2 || {};
  const isReferral = Boolean(plottingData.hasil_plot?.is_perlu_rujukan || plottingData.hasil_plot?.status_rujukan);

  return (
    <div className="card rounded-4 border-0 shadow-sm overflow-hidden bg-white">
      <div className="p-3 border-bottom d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2">
          <Activity size={19} className="text-primary" />
          <div>
            <h6 className="fw-bold text-dark mb-0">Hasil Plotting Backend</h6>
            <div className="text-muted small">Hasil evaluasi berasal dari server dan database.</div>
          </div>
        </div>
        {isReferral ? (
          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill">Perlu Rujukan</span>
        ) : (
          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">Tidak Perlu Rujukan</span>
        )}
      </div>

      <div className="p-3">
        <div className="row g-3 mb-3">
          {Object.entries(measurements).map(([key, value]) => (
            <div key={key} className="col-6 col-md-3">
              <div className="bg-light rounded-3 p-2 h-100">
                <div className="text-muted small">{key}</div>
                <div className="fw-semibold text-dark">{value ?? ""}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3 mb-3">
          {Object.entries(zScores).map(([key, value]) => (
            <div key={key} className="col-6 col-md-4">
              <div className="border rounded-3 p-2 h-100">
                <div className="text-muted small">{key}</div>
                <div className="fw-semibold text-dark">{value ?? ""}</div>
              </div>
            </div>
          ))}
        </div>

        {entries.length > 0 && (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Indikator</th>
                  <th>Nilai</th>
                  <th>Kategori</th>
                  <th>Kode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(([key, value]) => {
                  const item = value && typeof value === "object" ? value : { nilai: value };
                  const merah = item.is_merah === true;
                  return (
                    <tr key={key}>
                      <td className="fw-semibold text-dark">{key}</td>
                      <td>{item.nilai ?? item.nilai_riil ?? item.nilai_imt ?? item.nilai_bb ?? ""}</td>
                      <td>{item.kategori ?? ""}</td>
                      <td>{item.kode ?? ""}</td>
                      <td>
                        {item.is_merah === true ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill d-inline-flex align-items-center gap-1">
                            <AlertTriangle size={12} /> Merah
                          </span>
                        ) : item.is_merah === false ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill d-inline-flex align-items-center gap-1">
                            <CheckCircle2 size={12} /> Normal
                          </span>
                        ) : (
                          <span className="text-muted">{item.status ?? ""}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {plottingData.hasil_plot?.status_rujukan && (
          <div className="mt-3 small">
            <strong>Status rujukan:</strong> {plottingData.hasil_plot.status_rujukan}
          </div>
        )}
      </div>
    </div>
  );
}
