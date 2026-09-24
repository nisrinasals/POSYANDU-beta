import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ChevronRight,
  Maximize2,
  Calendar,
  Layers
} from 'lucide-react';
import antropometriData from '../../data/antropometriData.json';
import { 
  normalizeGender, 
  evaluateTbu, 
  evaluateBbu, 
  evaluateBbpb, 
  evaluateImtu,
  lookupStandardRow,
  lookupImt5to18Row
} from '../../utils/antropometriHelper';

/**
 * GrowthChartPlotter Component
 * Plotting grafik standar antropometri Permenkes No. 2 Tahun 2020 / WHO Growth Charts
 */
export default function GrowthChartPlotter({
  gender = 'Perempuan',
  umurBulan = 36,
  bb = 13.5,
  tb = 92.0,
  riwayatPemeriksaan = [],
  activeCategory = 'balita-12-59', // 'bayi-0-11', 'balita-12-59', 'apras', 'usekrem-6-14', 'usekrem-15-18'
  namaAnak = 'Anak'
}) {
  const gCode = normalizeGender(gender);
  const isFemale = gCode === 'F';
  const isTeen = ['usekrem-6-14', 'usekrem-15-18', 'usekrem', 'remaja'].some(k => (activeCategory || '').includes(k)) || umurBulan >= 60;

  // Tabs pilihan tipe grafik
  const defaultChartType = isTeen ? 'imtu' : (umurBulan >= 24 ? 'tbu' : 'pbu');
  const [chartType, setChartType] = useState(defaultChartType);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Konfigurasi kurva & dataset berdasarkan chartType & gender
  const { datasetKey, chartTitle, yLabel, xLabel, xMin, xMax, yMin, yMax, unitX, unitY, isImtTeen } = useMemo(() => {
    if (chartType === 'tbu') {
      return {
        datasetKey: `${gCode}(24-60) TBU`,
        chartTitle: `Grafik Tinggi Badan Menurut Usia Anak ${isFemale ? 'Perempuan' : 'Laki-laki'} 2 - 5 Tahun`,
        yLabel: 'Tinggi Badan (cm)',
        xLabel: 'Umur (Bulan Penuh)',
        xMin: 24,
        xMax: 60,
        yMin: 75,
        yMax: 125,
        unitX: 'bln',
        unitY: 'cm',
        isImtTeen: false
      };
    } else if (chartType === 'pbu') {
      return {
        datasetKey: `${gCode}(0-24) PBU`,
        chartTitle: `Grafik Panjang Badan Menurut Usia Anak ${isFemale ? 'Perempuan' : 'Laki-laki'} 0 - 24 Bulan`,
        yLabel: 'Panjang Badan (cm)',
        xLabel: 'Umur (Bulan Penuh)',
        xMin: 0,
        xMax: 24,
        yMin: 40,
        yMax: 95,
        unitX: 'bln',
        unitY: 'cm',
        isImtTeen: false
      };
    } else if (chartType === 'bbu') {
      return {
        datasetKey: `${gCode}(0-60) BBU`,
        chartTitle: `Grafik Berat Badan Menurut Usia Anak ${isFemale ? 'Perempuan' : 'Laki-laki'} 0 - 5 Tahun`,
        yLabel: 'Berat Badan (kg)',
        xLabel: 'Umur (Bulan Penuh)',
        xMin: 0,
        xMax: 60,
        yMin: 1,
        yMax: 26,
        unitX: 'bln',
        unitY: 'kg',
        isImtTeen: false
      };
    } else if (chartType === 'bbpb') {
      const is0to24 = umurBulan <= 24 || parseFloat(tb || 0) <= 85;
      return {
        datasetKey: is0to24 ? `${gCode}(0-24) BBPB` : `${gCode}(24-60) BBPB`,
        chartTitle: `Grafik Berat Badan Menurut ${is0to24 ? 'Panjang Badan (0-2 Tahun)' : 'Tinggi Badan (2-5 Tahun)'} Anak ${isFemale ? 'Perempuan' : 'Laki-laki'}`,
        yLabel: 'Berat Badan (kg)',
        xLabel: is0to24 ? 'Panjang Badan (cm)' : 'Tinggi Badan (cm)',
        xMin: is0to24 ? 45 : 65,
        xMax: is0to24 ? 110 : 120,
        yMin: is0to24 ? 1.5 : 5,
        yMax: is0to24 ? 26 : 28,
        unitX: 'cm',
        unitY: 'kg',
        isImtTeen: false
      };
    } else {
      // IMT/U
      if (isTeen) {
        return {
          datasetKey: `${gCode}(5-18 tahun) IMTU`,
          chartTitle: `Grafik Indeks Massa Tubuh (IMT) Menurut Usia Anak ${isFemale ? 'Perempuan' : 'Laki-laki'} 5 - 18 Tahun`,
          yLabel: 'IMT (kg/m²)',
          xLabel: 'Umur (Tahun)',
          xMin: 60,
          xMax: 216,
          yMin: 10,
          yMax: 32,
          unitX: 'thn',
          unitY: 'kg/m²',
          isImtTeen: true
        };
      } else {
        const is0to24 = umurBulan <= 24;
        return {
          datasetKey: is0to24 ? `${gCode}(0-24) IMTU` : `${gCode}(24-60) IMTU`,
          chartTitle: `Grafik Indeks Massa Tubuh (IMT) Menurut Usia Anak ${isFemale ? 'Perempuan' : 'Laki-laki'} ${is0to24 ? '0 - 24 Bulan' : '2 - 5 Tahun'}`,
          yLabel: 'IMT (kg/m²)',
          xLabel: 'Umur (Bulan Penuh)',
          xMin: is0to24 ? 0 : 24,
          xMax: is0to24 ? 24 : 60,
          yMin: 9,
          yMax: 22,
          unitX: 'bln',
          unitY: 'kg/m²',
          isImtTeen: false
        };
      }
    }
  }, [chartType, gCode, isFemale, isTeen, umurBulan, tb]);

  // Data kurva standar dari file JSON
  const rawTableData = useMemo(() => {
    return antropometriData[datasetKey] || [];
  }, [datasetKey]);

  // Hitung Nilai Pengukuran Saat Ini
  const currentVal = useMemo(() => {
    const numAge = parseFloat(umurBulan) || 0;
    const numTb = parseFloat(tb) || 0;
    const numBb = parseFloat(bb) || 0;
    const numImt = (numBb > 0 && numTb > 0) ? (numBb / Math.pow(numTb / 100, 2)) : 0;

    if (chartType === 'tbu' || chartType === 'pbu') {
      return { x: numAge, y: numTb, valid: numTb > 0 };
    } else if (chartType === 'bbu') {
      return { x: numAge, y: numBb, valid: numBb > 0 };
    } else if (chartType === 'bbpb') {
      return { x: numTb, y: numBb, valid: numTb > 0 && numBb > 0 };
    } else {
      // imtu
      return { x: numAge, y: parseFloat(numImt.toFixed(1)), valid: numImt > 0 };
    }
  }, [chartType, umurBulan, tb, bb]);

  // Evaluasi Klinis Z-Score Berdasarkan Permenkes 2/2020
  const evaluation = useMemo(() => {
    if (chartType === 'tbu' || chartType === 'pbu') {
      return evaluateTbu(gender, umurBulan, tb);
    } else if (chartType === 'bbu') {
      return evaluateBbu(gender, umurBulan, bb);
    } else if (chartType === 'bbpb') {
      return evaluateBbpb(gender, umurBulan, tb, bb);
    } else {
      const numTb = parseFloat(tb) || 0;
      const numBb = parseFloat(bb) || 0;
      const numImt = (numBb > 0 && numTb > 0) ? (numBb / Math.pow(numTb / 100, 2)).toFixed(1) : 0;
      return evaluateImtu(gender, umurBulan, numImt);
    }
  }, [chartType, gender, umurBulan, tb, bb]);

  // Transformasi Koordinat SVG (Width: 800, Height: 480, Padding: 60)
  const svgWidth = 780;
  const svgHeight = 440;
  const padding = { top: 35, right: 45, bottom: 50, left: 55 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const scaleX = (val) => {
    return padding.left + ((val - xMin) / (xMax - xMin)) * plotWidth;
  };

  const scaleY = (val) => {
    return padding.top + plotHeight - ((val - yMin) / (yMax - yMin)) * plotHeight;
  };

  // Bangun path garis SVG untuk masing-masing garis SD
  const generatePath = (key) => {
    if (!rawTableData || rawTableData.length === 0) return '';
    const points = rawTableData.map(d => {
      const xVal = isImtTeen ? d.totalBulan : d.x;
      const yVal = d[key];
      return `${scaleX(xVal)},${scaleY(yVal)}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const pathMin3 = useMemo(() => generatePath('min3'), [rawTableData, isImtTeen]);
  const pathMin2 = useMemo(() => generatePath('min2'), [rawTableData, isImtTeen]);
  const pathMedian = useMemo(() => generatePath('median'), [rawTableData, isImtTeen]);
  const pathPlus2 = useMemo(() => generatePath('plus2'), [rawTableData, isImtTeen]);
  const pathPlus3 = useMemo(() => generatePath('plus3'), [rawTableData, isImtTeen]);

  // Tema Warna (Pink untuk Perempuan sesuai Buku KIA Kemenkes, Biru untuk Laki-laki)
  const theme = isFemale ? {
    primary: '#e83e8c',
    headerBg: '#fce4ec',
    border: '#f48fb1',
    areaNormal: 'rgba(76, 175, 80, 0.08)',
    areaWarning: 'rgba(255, 152, 0, 0.08)',
    areaDanger: 'rgba(244, 67, 54, 0.08)',
    accent: '#d81b60',
    gridColor: '#f1f1f1'
  } : {
    primary: '#0288d1',
    headerBg: '#e1f5fe',
    border: '#81d4fa',
    areaNormal: 'rgba(76, 175, 80, 0.08)',
    areaWarning: 'rgba(255, 152, 0, 0.08)',
    areaDanger: 'rgba(244, 67, 54, 0.08)',
    accent: '#0277bd',
    gridColor: '#f1f1f1'
  };

  // Grid Ticks
  const xTicks = useMemo(() => {
    const ticks = [];
    const step = isImtTeen ? 24 : (xMax - xMin <= 24 ? 2 : 4);
    for (let i = xMin; i <= xMax; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [xMin, xMax, isImtTeen]);

  const yTicks = useMemo(() => {
    const ticks = [];
    const step = (yMax - yMin) <= 30 ? 5 : 10;
    for (let i = yMin; i <= yMax; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [yMin, yMax]);

  return (
    <div className="card rounded-4 border-0 shadow-sm overflow-hidden mb-4 bg-white">
      {/* Header Banner Khas Buku KIA Kemenkes / WHO */}
      <div className="p-3 border-bottom d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2" style={{ backgroundColor: theme.headerBg, borderTop: `4px solid ${theme.primary}` }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge px-2.5 py-1 rounded-pill fw-bold text-white small" style={{ backgroundColor: theme.primary }}>
              WHO &amp; Kemenkes RI
            </span>
            <span className="badge bg-white text-dark border px-2 py-0.5 rounded-pill small" style={{ fontSize: '0.75rem' }}>
              Permenkes No. 2 Tahun 2020
            </span>
          </div>
          <h5 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.3px' }}>
            {chartTitle}
          </h5>
          <div className="text-muted small mt-0.5" style={{ fontSize: '0.8rem' }}>
            Pengisian oleh kader didampingi tenaga kesehatan untuk memantau pertumbuhan &amp; deteksi dini stunting
          </div>
        </div>

        {/* Tipe Grafik Tabs */}
        <div className="btn-group btn-group-sm bg-white p-1 rounded-pill border shadow-xs" role="group">
          {!isTeen && (
            <>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 font-semibold ${chartType === (umurBulan >= 24 ? 'tbu' : 'pbu') ? 'text-white' : 'text-dark border-0'}`}
                style={{ backgroundColor: chartType === (umurBulan >= 24 ? 'tbu' : 'pbu') ? theme.primary : 'transparent' }}
                onClick={() => setChartType(umurBulan >= 24 ? 'tbu' : 'pbu')}
              >
                {umurBulan >= 24 ? 'TB/U' : 'PB/U'} (Tinggi)
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 font-semibold ${chartType === 'bbu' ? 'text-white' : 'text-dark border-0'}`}
                style={{ backgroundColor: chartType === 'bbu' ? theme.primary : 'transparent' }}
                onClick={() => setChartType('bbu')}
              >
                BB/U (Berat)
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 font-semibold ${chartType === 'bbpb' ? 'text-white' : 'text-dark border-0'}`}
                style={{ backgroundColor: chartType === 'bbpb' ? theme.primary : 'transparent' }}
                onClick={() => setChartType('bbpb')}
              >
                {umurBulan <= 24 ? 'BB/PB' : 'BB/TB'}
              </button>
            </>
          )}
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 font-semibold ${chartType === 'imtu' ? 'text-white' : 'text-dark border-0'}`}
            style={{ backgroundColor: chartType === 'imtu' ? theme.primary : 'transparent' }}
            onClick={() => setChartType('imtu')}
          >
            IMT/U (Gizi)
          </button>
        </div>
      </div>

      {/* SVG Canvas Plotting */}
      <div className="p-3 bg-white position-relative">
        <div className="table-responsive d-flex justify-content-center">
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            style={{ width: '100%', maxWidth: '900px', height: 'auto', maxHeight: '460px', userSelect: 'none' }}
          >
            {/* Background Grid */}
            <rect 
              x={padding.left} 
              y={padding.top} 
              width={plotWidth} 
              height={plotHeight} 
              fill="#ffffff" 
              stroke="#cbd5e1" 
              strokeWidth="1.2" 
            />

            {/* Grid Lines Horizontal (Y) */}
            {yTicks.map(val => (
              <g key={`y-${val}`}>
                <line 
                  x1={padding.left} 
                  y1={scaleY(val)} 
                  x2={padding.left + plotWidth} 
                  y2={scaleY(val)} 
                  stroke={val % 10 === 0 ? '#e2e8f0' : '#f1f5f9'} 
                  strokeWidth="1" 
                />
                <text 
                  x={padding.left - 8} 
                  y={scaleY(val) + 4} 
                  textAnchor="end" 
                  fontSize="10.5" 
                  fontWeight="600"
                  fill="#64748b"
                >
                  {val}
                </text>
                <text 
                  x={padding.left + plotWidth + 8} 
                  y={scaleY(val) + 4} 
                  textAnchor="start" 
                  fontSize="10.5" 
                  fontWeight="600"
                  fill="#64748b"
                >
                  {val}
                </text>
              </g>
            ))}

            {/* Grid Lines Vertical (X) */}
            {xTicks.map(val => (
              <g key={`x-${val}`}>
                <line 
                  x1={scaleX(val)} 
                  y1={padding.top} 
                  x2={scaleX(val)} 
                  y2={padding.top + plotHeight} 
                  stroke="#e2e8f0" 
                  strokeWidth="1" 
                />
                <text 
                  x={scaleX(val)} 
                  y={padding.top + plotHeight + 16} 
                  textAnchor="middle" 
                  fontSize="11" 
                  fontWeight="600"
                  fill="#475569"
                >
                  {isImtTeen ? `${Math.floor(val / 12)} Th` : val}
                </text>
              </g>
            ))}

            {/* 5 Kurva Standar Antropometri Permenkes / WHO */}
            {/* Kurva +3 SD (Hitam) */}
            <path d={pathPlus3} fill="none" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />
            
            {/* Kurva +2 SD (Merah) */}
            <path d={pathPlus2} fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />

            {/* Kurva Median / 0 SD (Hijau Ideal) */}
            <path d={pathMedian} fill="none" stroke="#16a34a" strokeWidth="2.6" strokeLinecap="round" />

            {/* Kurva -2 SD (Merah) */}
            <path d={pathMin2} fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />

            {/* Kurva -3 SD (Hitam) */}
            <path d={pathMin3} fill="none" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />

            {/* Label Z-Score di Ujung Kanan Garis */}
            {rawTableData.length > 0 && (() => {
              const last = rawTableData[rawTableData.length - 1];
              const lastX = isImtTeen ? last.totalBulan : last.x;
              const posX = scaleX(lastX) - 14;
              return (
                <g fontWeight="bold" fontSize="11.5">
                  <text x={posX + 18} y={scaleY(last.plus3) + 4} fill="#334155">+3</text>
                  <text x={posX + 18} y={scaleY(last.plus2) + 4} fill="#ef4444">+2</text>
                  <text x={posX + 18} y={scaleY(last.median) + 4} fill="#16a34a">0</text>
                  <text x={posX + 18} y={scaleY(last.min2) + 4} fill="#ef4444">-2</text>
                  <text x={posX + 18} y={scaleY(last.min3) + 4} fill="#334155">-3</text>
                </g>
              );
            })()}

            {/* Label Sumbu X & Y */}
            <text 
              x={padding.left + plotWidth / 2} 
              y={svgHeight - 12} 
              textAnchor="middle" 
              fontSize="12" 
              fontWeight="bold" 
              fill="#1e293b"
            >
              {xLabel}
            </text>

            <text 
              transform={`rotate(-90)`}
              x={-(padding.top + plotHeight / 2)} 
              y={18} 
              textAnchor="middle" 
              fontSize="12" 
              fontWeight="bold" 
              fill="#1e293b"
            >
              {yLabel}
            </text>

            {/* Titik Plotting Hasil Pengukuran Saat Ini */}
            {currentVal.valid && currentVal.x >= xMin && currentVal.x <= xMax && currentVal.y >= yMin && currentVal.y <= yMax && (
              <g 
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(currentVal)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Glowing Outer Ring */}
                <circle 
                  cx={scaleX(currentVal.x)} 
                  cy={scaleY(currentVal.y)} 
                  r="12" 
                  fill={evaluation.color} 
                  opacity="0.25"
                  className="animate-pulse"
                />
                {/* Solid Point */}
                <circle 
                  cx={scaleX(currentVal.x)} 
                  cy={scaleY(currentVal.y)} 
                  r="6.5" 
                  fill={evaluation.color} 
                  stroke="#ffffff" 
                  strokeWidth="2.5" 
                  className="shadow-sm"
                />

                {/* Point Label Marker */}
                <rect 
                  x={scaleX(currentVal.x) - 40} 
                  y={scaleY(currentVal.y) - 28} 
                  width="80" 
                  height="20" 
                  rx="4" 
                  fill="#0f172a" 
                  opacity="0.88" 
                />
                <text 
                  x={scaleX(currentVal.x)} 
                  y={scaleY(currentVal.y) - 14} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fontWeight="bold" 
                  fill="#ffffff"
                >
                  {currentVal.y} {unitY}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Tabel Standar Permenkes No. 2 Tahun 2020 (Inset Legend Box seperti Gambar User) */}
        <div className="row g-3 mt-3 align-items-stretch">
          <div className="col-12 col-md-7">
            <div className="card border-0 bg-white rounded-4 p-3.5 h-100 shadow-xs border">
              <h6 className="fw-bold text-dark mb-2.5 small d-flex align-items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                <Info size={16} className="text-primary flex-shrink-0" />
                <span>Standar Kategori Z-Score (Permenkes No. 2 Tahun 2020)</span>
              </h6>
              
              <div className="table-responsive">
                <table className="table table-sm table-bordered bg-white mb-0 text-center small align-middle" style={{ fontSize: '0.8rem' }}>
                  <thead className="table-light">
                    <tr className="text-secondary fw-bold">
                      <th className="py-2" style={{ width: '40%' }}>Rentang Z-Score</th>
                      <th className="py-2 text-start ps-3">Kategori / Status Pertumbuhan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartType === 'tbu' || chartType === 'pbu' ? (
                      <>
                        <tr className={evaluation.zRange === '< -3 SD' ? 'table-danger fw-bold' : ''}>
                          <td className="py-1.5">&lt; -3 SD</td>
                          <td className="py-1.5 text-start ps-3 text-danger fw-semibold">Sangat pendek (severely stunted)</td>
                        </tr>
                        <tr className={evaluation.zRange === '-3 SD s.d. < -2 SD' ? 'table-warning fw-bold' : ''}>
                          <td className="py-1.5">-3 SD s.d. &lt; -2 SD</td>
                          <td className="py-1.5 text-start ps-3 text-warning-emphasis fw-semibold">Pendek (stunted)</td>
                        </tr>
                        <tr className={evaluation.zRange === '-2 SD s.d. +3 SD' ? 'table-success fw-bold' : ''}>
                          <td className="py-1.5">-2 SD s.d. +3 SD</td>
                          <td className="py-1.5 text-start ps-3 text-success fw-semibold">Normal</td>
                        </tr>
                        <tr className={evaluation.zRange === '> +3 SD' ? 'table-primary fw-bold' : ''}>
                          <td className="py-1.5">&gt; +3 SD</td>
                          <td className="py-1.5 text-start ps-3 text-primary fw-semibold">Tinggi</td>
                        </tr>
                      </>
                    ) : chartType === 'bbu' ? (
                      <>
                        <tr className={evaluation.zRange === '< -3 SD' ? 'table-danger fw-bold' : ''}>
                          <td className="py-1.5">&lt; -3 SD</td>
                          <td className="py-1.5 text-start ps-3 text-danger fw-semibold">Berat badan sangat kurang</td>
                        </tr>
                        <tr className={evaluation.zRange === '-3 SD s.d. < -2 SD' ? 'table-warning fw-bold' : ''}>
                          <td className="py-1.5">-3 SD s.d. &lt; -2 SD</td>
                          <td className="py-1.5 text-start ps-3 text-warning-emphasis fw-semibold">Berat badan kurang (underweight)</td>
                        </tr>
                        <tr className={evaluation.zRange === '-2 SD s.d. +1 SD' ? 'table-success fw-bold' : ''}>
                          <td className="py-1.5">-2 SD s.d. +1 SD</td>
                          <td className="py-1.5 text-start ps-3 text-success fw-semibold">Berat badan normal</td>
                        </tr>
                        <tr className={evaluation.zRange === '> +1 SD' ? 'table-info fw-bold' : ''}>
                          <td className="py-1.5">&gt; +1 SD</td>
                          <td className="py-1.5 text-start ps-3 text-info-emphasis fw-semibold">Risiko berat badan lebih</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr className={evaluation.zRange === '< -3 SD' ? 'table-danger fw-bold' : ''}>
                          <td className="py-1.5">&lt; -3 SD</td>
                          <td className="py-1.5 text-start ps-3 text-danger fw-semibold">Gizi buruk (severely wasted)</td>
                        </tr>
                        <tr className={evaluation.zRange === '-3 SD s.d. < -2 SD' ? 'table-warning fw-bold' : ''}>
                          <td className="py-1.5">-3 SD s.d. &lt; -2 SD</td>
                          <td className="py-1.5 text-start ps-3 text-warning-emphasis fw-semibold">Gizi kurang (wasted)</td>
                        </tr>
                        <tr className={evaluation.zRange === '-2 SD s.d. +1 SD' ? 'table-success fw-bold' : ''}>
                          <td className="py-1.5">-2 SD s.d. +1 SD</td>
                          <td className="py-1.5 text-start ps-3 text-success fw-semibold">Gizi baik (normal)</td>
                        </tr>
                        <tr className={evaluation.zRange?.includes('> +1 SD') ? 'table-info fw-bold' : ''}>
                          <td className="py-1.5">&gt; +1 SD s.d. +2 SD</td>
                          <td className="py-1.5 text-start ps-3 text-info-emphasis fw-semibold">Berisiko gizi lebih</td>
                        </tr>
                        <tr className={evaluation.zRange?.includes('> +2 SD') || evaluation.zRange?.includes('> +3 SD') ? 'table-danger fw-bold' : ''}>
                          <td className="py-1.5">&gt; +2 SD / +3 SD</td>
                          <td className="py-1.5 text-start ps-3 text-danger fw-semibold">Gizi lebih / Obesitas</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Kartu Status Hasil & Rekomendasi Klinis */}
          <div className="col-12 col-md-5">
            <div className="card border-0 rounded-4 p-3.5 h-100 shadow-xs border d-flex flex-column justify-content-between" style={{ backgroundColor: '#ffffff', borderLeft: `5px solid ${evaluation.color || '#10b981'}` }}>
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                    Hasil Plotting Pengukuran
                  </span>
                  <span className={`badge px-3 py-1 rounded-pill fw-bold ${evaluation.badgeClass}`} style={{ fontSize: '0.8rem' }}>
                    {evaluation.short || evaluation.status}
                  </span>
                </div>

                <div className="p-3 bg-light rounded-3 border mb-3">
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom text-muted" style={{ fontSize: '0.83rem' }}>
                    <span>Sasaran / Umur:</span>
                    <strong className="text-dark">{namaAnak} ({umurBulan} Bulan)</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom text-muted" style={{ fontSize: '0.83rem' }}>
                    <span>Hasil Ukur Saat Ini:</span>
                    <strong className="text-primary">{currentVal.y > 0 ? `${currentVal.y} ${unitY}` : 'Belum diukur'}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-1 text-muted" style={{ fontSize: '0.83rem' }}>
                    <span>Posisi Kurva:</span>
                    <span className="fw-bold" style={{ color: evaluation.color }}>{evaluation.zRange}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-3 bg-light border mt-2">
                <div className="fw-bold small text-dark mb-1 d-flex align-items-center gap-1.5" style={{ fontSize: '0.82rem' }}>
                  <Activity size={15} className="text-danger" />
                  <span>Rekomendasi / Tindak Lanjut:</span>
                </div>
                <div className="text-secondary" style={{ fontSize: '0.8rem', lineHeight: '1.45' }}>
                  {evaluation.rekomendasi || 'Tumbuh kembang optimal sesuai umur. Pertahankan stimulasi dan gizi seimbang.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
