import React from 'react';
import { STANDAR_PLOT } from '../../utils/plotHelper';

/**
 * Reusable Card Renderer for Plotting Result
 */
const PlotCard = ({ title, subtitle, statusText, isMerah, mainResult, subResult, acuanTitle, items, activeCode, activeKategori }) => {
  const isDanger = Boolean(isMerah);
  const bannerBg = isDanger ? '#fef2f2' : '#f0fdf4';
  const bannerBorder = isDanger ? '#f87171' : '#86efac';
  const bannerText = isDanger ? '#dc2626' : '#15803d';

  return (
    <div className="col-12">
      <div className="card border-0 bg-white p-4 rounded-4 shadow-xs">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold text-dark mb-0">{title}</h6>
          {subtitle && <span className="badge bg-light text-muted small fw-normal">{subtitle}</span>}
        </div>

        {/* BANNER STATUS EVALUASI */}
        <div 
          className="p-3 rounded-3 mb-3 d-flex align-items-center justify-content-between"
          style={{
            backgroundColor: bannerBg,
            border: `2px solid ${bannerBorder}`,
          }}
        >
          <div>
            <span className="text-muted small fw-medium d-block">Status Evaluasi:</span>
            <span className="fs-5 fw-bold" style={{ color: bannerText }}>
              {statusText || 'Normal'}
            </span>
          </div>
          {mainResult && (
            <div className="text-end">
              <span className="text-muted small fw-medium d-block">Hasil Pengukuran:</span>
              <span className="fs-6 fw-bold text-dark">
                {mainResult}
              </span>
              {subResult && (
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {subResult}
                </div>
              )}
            </div>
          )}
        </div>

        {/* KATEGORI ACUAN STANDAR */}
        {items && items.length > 0 && (
          <>
            <div className="text-secondary fw-semibold mb-2 small" style={{ fontSize: '0.82rem' }}>
              {acuanTitle || 'Kategori Acuan Standar:'}
            </div>
            <div className="d-flex flex-column gap-2 small">
              {items.map((item, idx) => {
                const isCurrent = (activeCode && item.kode === activeCode) || 
                  (activeKategori && (
                    item.kategori?.toLowerCase() === activeKategori?.toLowerCase() || 
                    item.label?.toLowerCase()?.includes(activeKategori?.toLowerCase())
                  ));
                const itemIsMerah = item.is_merah !== undefined ? item.is_merah : isDanger;
                
                const activeRowBg = itemIsMerah ? '#fef2f2' : '#f0fdf4';
                const activeRowBorder = itemIsMerah ? '#f87171' : '#86efac';
                const activeText = itemIsMerah ? '#dc2626' : '#15803d';
                const badgeBg = itemIsMerah ? '#fee2e2' : '#dcfce7';
                const badgeColor = itemIsMerah ? '#dc2626' : '#15803d';
                const badgeBorder = itemIsMerah ? '#fca5a5' : '#86efac';

                const labelText = item.label || `${item.kategori}${item.batas ? ` (${item.batas})` : item.subkategori ? ` (${item.subkategori})` : ''}`;

                return (
                  <div 
                    key={idx}
                    className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 transition-all"
                    style={{
                      backgroundColor: isCurrent ? activeRowBg : '#f8fafc',
                      border: isCurrent ? `1.5px solid ${activeRowBorder}` : '1px solid #e2e8f0',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div className="d-flex align-items-center gap-2.5">
                      {isCurrent ? (
                        <span className="fw-bold fs-6" style={{ color: activeText }}>✓</span>
                      ) : (
                        <span className="text-muted" style={{ width: '14px', textAlign: 'center' }}>•</span>
                      )}
                      <span className={isCurrent ? 'fw-bold' : 'text-secondary'} style={{ color: isCurrent ? activeText : undefined, lineHeight: '1.4' }}>
                        {labelText}
                      </span>
                    </div>
                    {item.kode && (
                      <span 
                        className="badge fw-bold px-2.5 py-1 rounded-pill"
                        style={{ 
                          backgroundColor: isCurrent ? badgeBg : '#e2e8f0', 
                          color: isCurrent ? badgeColor : '#475569',
                          border: isCurrent ? `1px solid ${badgeBorder}` : '1px solid transparent',
                          fontSize: '0.78rem'
                        }}
                      >
                        {item.kode}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Main Dynamic Plotting View for All Posyandu Target Categories
 */
const Langkah3PlottingView = ({ activeSubmenu, plottingResult }) => {
  if (!plottingResult) return null;

  // 1. IBU HAMIL (Bumil)
  if (activeSubmenu === 'bumil') {
    const evImt = plottingResult?.evalImtBumil;
    const evLila = plottingResult?.evalLilaBumil;
    const evTensi = plottingResult?.evalTensiBumil;
    return (
      <div className="row g-3 mb-4">
        <PlotCard
          title="Plotting IMT Sebelum Hamil"
          subtitle="Kurva Buku KIA"
          statusText={evImt ? `${evImt.kategori} (${evImt.batas})` : 'Normal (18.5 - 24.9 kg/m²)'}
          isMerah={evImt?.is_merah}
          mainResult={`${plottingResult?.imt} kg/m²`}
          subResult={`(${plottingResult?.bb} kg / ${plottingResult?.tb} cm)`}
          acuanTitle="Kategori Acuan Standar IMT Ibu Hamil:"
          items={STANDAR_PLOT.bumil.plot[0].items}
          activeCode={evImt?.kode}
        />
        <PlotCard
          title="Plotting LiLA (Lingkar Lengan Atas)"
          subtitle="Pita LiLA Bumil"
          statusText={evLila ? `${evLila.kategori === 'KEK' ? 'Kurang Energi Kronis / KEK' : 'Normal'} (${evLila.batas})` : 'Normal (≥ 23.5 cm)'}
          isMerah={evLila?.is_merah}
          mainResult={`${plottingResult?.lila} cm`}
          acuanTitle="Kategori Acuan Standar LiLA Ibu Hamil:"
          items={STANDAR_PLOT.bumil.plot[1].items}
          activeCode={evLila?.kode}
        />
        <PlotCard
          title="Plotting Tekanan Darah"
          subtitle="Tensimeter Digital KIA"
          statusText={evTensi ? `${evTensi.kategori === 'Normal' ? 'Normal' : 'Risiko Hipertensi'} (${evTensi.batas} mmHg)` : 'Normal (< 130/85 mmHg)'}
          isMerah={evTensi?.is_merah}
          mainResult={`${plottingResult?.sistol}/${plottingResult?.diastol} mmHg`}
          acuanTitle="Kategori Acuan Standar Tekanan Darah Bumil:"
          items={STANDAR_PLOT.bumil.plot[2].items}
          activeCode={evTensi?.kode}
        />
      </div>
    );
  }

  // 2. IBU NIFAS / MENYUSUI (Busui)
  if (activeSubmenu === 'nifas') {
    const evImt = plottingResult?.evalImtBusui;
    const evTensi = plottingResult?.evalTensiBusui;
    return (
      <div className="row g-3 mb-4">
        <PlotCard
          title="Plotting IMT (Indeks Massa Tubuh)"
          subtitle="Kurva Ibu Menyusui"
          statusText={evImt ? `${evImt.kategori} (${evImt.batas})` : 'Normal (18.5 - 24.9)'}
          isMerah={evImt?.is_merah}
          mainResult={`${plottingResult?.imt} kg/m²`}
          subResult={`(${plottingResult?.bb} kg / ${plottingResult?.tb} cm)`}
          acuanTitle="Kategori Acuan Standar IMT Ibu Menyusui:"
          items={STANDAR_PLOT.busui.plot[0].items}
          activeCode={evImt?.kode}
        />
        <PlotCard
          title="Plotting Tekanan Darah"
          subtitle="Tensimeter Digital"
          statusText={evTensi ? `${evTensi.kategori === 'Normal' ? 'Normal' : 'Risiko Hipertensi'} (${evTensi.batas} mmHg)` : 'Normal (< 130/85 mmHg)'}
          isMerah={evTensi?.is_merah}
          mainResult={`${plottingResult?.sistol}/${plottingResult?.diastol} mmHg`}
          acuanTitle="Kategori Acuan Standar Tekanan Darah Ibu Menyusui:"
          items={STANDAR_PLOT.busui.plot[1].items}
          activeCode={evTensi?.kode}
        />
      </div>
    );
  }

  // 3. BAYI (0-11 BLN) & BALITA (12-59 BLN) - STANDAR WHO PERMENKES
  if (['bayi-0-11', 'balita-12-59'].includes(activeSubmenu)) {
    const plotRef = activeSubmenu === 'bayi-0-11' ? STANDAR_PLOT.bayi : STANDAR_PLOT.balita;
    const evBbu = plottingResult?.evalBBU;
    const evTbu = plottingResult?.evalTBU;
    const evBbtb = plottingResult?.evalBBTB;
    const evLila = plottingResult?.evalLilaBayi;

    return (
      <div className="row g-3 mb-4">
        <PlotCard
          title="3.1 Plotting Penimbangan (BB/U)"
          subtitle="Standar WHO Permenkes"
          statusText={evBbu?.kategori ? `${evBbu.kategori} (${evBbu.sd_position || '-2 SD s.d +1 SD'})` : 'BB Normal (-2 SD s.d +1 SD)'}
          isMerah={evBbu?.is_merah}
          mainResult={`${plottingResult?.bb} kg`}
          acuanTitle="Kategori Acuan Standar BB/U:"
          items={plotRef.plot[0].items}
          activeCode={evBbu?.kode}
        />
        <PlotCard
          title={activeSubmenu === 'bayi-0-11' ? '3.2 Plotting Pengukuran PB (PB/U)' : '3.2 Plotting Pengukuran TB (TB/U)'}
          subtitle="Standar WHO Permenkes"
          statusText={evTbu?.kategori ? `${evTbu.kategori} (${evTbu.sd_position || '-2 SD s.d +3 SD'})` : 'Normal (-2 SD s.d +3 SD)'}
          isMerah={evTbu?.is_merah}
          mainResult={`${plottingResult?.tb} cm`}
          acuanTitle="Kategori Acuan Standar PB/TB per Umur:"
          items={plotRef.plot[1].items}
          activeCode={evTbu?.kode}
        />
        <PlotCard
          title={activeSubmenu === 'bayi-0-11' ? '3.3 Plotting Penimbangan Pengukuran (BB/PB)' : '3.3 Plotting Penimbangan Pengukuran (BB/TB)'}
          subtitle="Status Gizi WHO"
          statusText={evBbtb?.kategori ? `${evBbtb.kategori} (${evBbtb.sd_position || '-2 SD s.d +1 SD'})` : 'Gizi Baik (-2 SD s.d +1 SD)'}
          isMerah={evBbtb?.is_merah}
          mainResult={`${plottingResult?.bb} kg / ${plottingResult?.tb} cm`}
          acuanTitle="Kategori Acuan Standar BB per Panjang/Tinggi Badan:"
          items={plotRef.plot[2].items}
          activeCode={evBbtb?.kode}
        />
        <PlotCard
          title="3.4 Plotting Lingkar Kepala"
          subtitle="Pita Ukur LK"
          statusText={plottingResult?.lkStatus || 'Normal (-2 SD s.d +2 SD)'}
          isMerah={plottingResult?.isLkMerah}
          mainResult={`${plottingResult?.lk} cm`}
          acuanTitle="Kategori Acuan Standar Lingkar Kepala:"
          items={plotRef.plot[3].items}
          activeCode={plottingResult?.lkCode}
        />
        <PlotCard
          title="3.5 Plotting LiLA"
          subtitle="Pita LiLA Balita"
          statusText={evLila ? `${evLila.kategori} (${evLila.batas})` : 'Gizi Normal (≥ 12.5 cm)'}
          isMerah={evLila?.is_merah}
          mainResult={`${plottingResult?.lila} cm`}
          acuanTitle="Kategori Acuan Standar LiLA Balita:"
          items={plotRef.plot[4].items}
          activeCode={evLila?.kode}
        />
      </div>
    );
  }

  // 4. APRAS (60-72 BLN)
  if (activeSubmenu === 'apras') {
    const evImt = plottingResult?.evalImtApras;
    const evLila = plottingResult?.evalLilaApras;
    return (
      <div className="row g-3 mb-4">
        <PlotCard
          title="3.1 Plotting IMT / U"
          subtitle="Anak Prasekolah"
          statusText={evImt?.kategori ? `${evImt.kategori} (${evImt.sd_position || '-2 SD s.d +1 SD'})` : 'Gizi Baik (-2 SD s.d +1 SD)'}
          isMerah={evImt?.is_merah}
          mainResult={`${plottingResult?.imt} kg/m²`}
          subResult={`(${plottingResult?.bb} kg / ${plottingResult?.tb} cm)`}
          acuanTitle="Kategori Acuan Standar IMT/U Apras:"
          items={STANDAR_PLOT.apras.plot[0].items}
          activeCode={evImt?.kode}
        />
        <PlotCard
          title="3.2 Plotting LiLA"
          subtitle="Pita LiLA Apras"
          statusText={evLila ? `${evLila.kategori} (${evLila.batas})` : 'Gizi Normal (≥ 14 cm)'}
          isMerah={evLila?.is_merah}
          mainResult={`${plottingResult?.lila} cm`}
          acuanTitle="Kategori Acuan Standar LiLA Apras:"
          items={STANDAR_PLOT.apras.plot[1].items}
          activeCode={evLila?.kode}
        />
      </div>
    );
  }

  // 5. USIA SEKOLAH 6-14 TAHUN
  if (activeSubmenu === 'usekrem-6-14') {
    const evImt = plottingResult?.evalImtUsekrem614;
    return (
      <div className="row g-3 mb-4">
        <PlotCard
          title="Plotting IMT / U"
          subtitle="Usia 6 - 14 Tahun"
          statusText={evImt?.kategori ? `${evImt.kategori} (${evImt.sd_position || '-2 SD s.d +1 SD'})` : 'Gizi Baik (-2 SD s.d +1 SD)'}
          isMerah={evImt?.is_merah}
          mainResult={`${plottingResult?.imt} kg/m²`}
          subResult={`(${plottingResult?.bb} kg / ${plottingResult?.tb} cm)`}
          acuanTitle="Kategori Acuan Standar IMT/U Usia Sekolah:"
          items={STANDAR_PLOT.uskrem_6_14.plot[0].items}
          activeCode={evImt?.kode}
        />
      </div>
    );
  }

  // 6. USIA SEKOLAH / REMAJA 15-18 TAHUN
  if (activeSubmenu === 'usekrem-15-18') {
    const evImt = plottingResult?.evalImtUsekrem1518;
    const evTensi = plottingResult?.evalTensiUsekrem1518;
    return (
      <div className="row g-3 mb-4">
        <PlotCard
          title="Plotting IMT / U"
          subtitle="Standar WHO Remaja"
          statusText={evImt?.kategori ? `${evImt.kategori} (${evImt.sd_position || '-2 SD s.d +1 SD'})` : 'Gizi Baik (-2 SD s.d +1 SD)'}
          isMerah={evImt?.is_merah}
          mainResult={`${plottingResult?.imt} kg/m²`}
          subResult={`(${plottingResult?.bb} kg / ${plottingResult?.tb} cm)`}
          acuanTitle="Kategori Acuan Standar IMT/U Remaja:"
          items={STANDAR_PLOT.uskrem_15_18.plot[0].items}
          activeCode={evImt?.kode}
        />
        <PlotCard
          title="Plotting Tekanan Darah"
          subtitle="Tensimeter Remaja"
          statusText={evTensi ? `${evTensi.kategori} (${evTensi.batas} mmHg)` : 'Normal'}
          isMerah={evTensi?.is_merah}
          mainResult={`${plottingResult?.sistol}/${plottingResult?.diastol} mmHg`}
          acuanTitle="Kategori Acuan Standar Tekanan Darah Remaja:"
          items={STANDAR_PLOT.uskrem_15_18.plot[1].items}
          activeCode={evTensi?.kode}
        />
      </div>
    );
  }

  // 7. DEWASA & LANSIA
  const isLansia = activeSubmenu === 'lansia';
  const plotRef = isLansia ? STANDAR_PLOT.lansia : STANDAR_PLOT.dewasa;
  const evImt = isLansia ? plottingResult?.evalImtLansia : plottingResult?.evalImtDewasa;
  const evLp = isLansia ? plottingResult?.evalLpLansia : plottingResult?.evalLpDewasa;
  const evLila = isLansia ? plottingResult?.evalLilaLansia : plottingResult?.evalLilaDewasa;
  const evTensi = isLansia ? plottingResult?.evalTensiLansia : plottingResult?.evalTensiDewasa;

  return (
    <div className="row g-3 mb-4">
      <PlotCard
        title="Plotting IMT"
        subtitle={isLansia ? 'Standar Lansia 60+ Thn' : 'Indeks Massa Tubuh Dewasa'}
        statusText={evImt ? `${evImt.kategori} (${evImt.batas})` : 'Normal'}
        isMerah={evImt?.is_merah}
        mainResult={`${plottingResult?.imt} kg/m²`}
        subResult={`(${plottingResult?.bb} kg / ${plottingResult?.tb} cm)`}
        acuanTitle="Kategori Acuan Standar IMT:"
        items={plotRef.plot[0].items}
        activeCode={evImt?.kode}
      />
      <PlotCard
        title="Plotting Lingkar Perut"
        subtitle="Batas Gender"
        statusText={evLp ? (evLp.is_merah ? `Berisiko Obesitas Sentral (${evLp.batas})` : `Normal (${evLp.batas})`) : 'Normal'}
        isMerah={evLp?.is_merah}
        mainResult={`${plottingResult?.lp} cm`}
        acuanTitle="Kategori Acuan Standar Lingkar Perut:"
        items={plotRef.plot[1].items}
        activeCode={evLp?.kode}
      />
      <PlotCard
        title="Plotting LiLA"
        subtitle="Pita Pengukur LiLA"
        statusText={evLila ? `${evLila.kategori} (${evLila.batas})` : 'Normal'}
        isMerah={evLila?.is_merah}
        mainResult={`${plottingResult?.lila} cm`}
        acuanTitle="Kategori Acuan Standar LiLA:"
        items={plotRef.plot[2].items}
        activeCode={evLila?.kode}
      />
      <PlotCard
        title="Plotting Tekanan Darah"
        subtitle="Tensimeter Digital"
        statusText={evTensi ? `${evTensi.kategori} (${evTensi.batas} mmHg)` : 'Normal'}
        isMerah={evTensi?.is_merah}
        mainResult={`${plottingResult?.sistol}/${plottingResult?.diastol} mmHg`}
        acuanTitle="Kategori Acuan Standar Tekanan Darah:"
        items={plotRef.plot[3].items}
        activeCode={evTensi?.kode}
      />
    </div>
  );
};

export default Langkah3PlottingView;
