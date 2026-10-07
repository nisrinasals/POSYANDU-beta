import React from "react";
import { renderToString } from "react-dom/server";
import PemeriksaanPage from "./src/pages/kader/PemeriksaanPage.jsx";
import RekapPemeriksaanPage from "./src/pages/kader/RekapPemeriksaanPage.jsx";
import DataSasaranPage from "./src/pages/kader/DataSasaranPage.jsx";

try {
  console.log("Testing PemeriksaanPage render...");
  renderToString(<PemeriksaanPage />);
  console.log("PemeriksaanPage rendered successfully.");
} catch (e) {
  console.error("Error in PemeriksaanPage:", e);
}

try {
  console.log("Testing RekapPemeriksaanPage render...");
  renderToString(<RekapPemeriksaanPage />);
  console.log("RekapPemeriksaanPage rendered successfully.");
} catch (e) {
  console.error("Error in RekapPemeriksaanPage:", e);
}

try {
  console.log("Testing DataSasaranPage render...");
  renderToString(<DataSasaranPage />);
  console.log("DataSasaranPage rendered successfully.");
} catch (e) {
  console.error("Error in DataSasaranPage:", e);
}
