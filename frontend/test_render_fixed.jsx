import React from "react";
import { renderToString } from "react-dom/server";
import { NotificationContext } from "./src/context/NotificationContext.jsx";
import PemeriksaanPage from "./src/pages/kader/PemeriksaanPage.jsx";
import RekapPemeriksaanPage from "./src/pages/kader/RekapPemeriksaanPage.jsx";
import DataSasaranPage from "./src/pages/kader/DataSasaranPage.jsx";

const mockNotification = {
  showNotification: () => {},
  showSuccess: () => {},
  showError: () => {},
  showWarning: () => {},
  showInfo: () => {},
};

const Wrapper = ({ children }) => (
  <NotificationContext.Provider value={mockNotification}>
    {children}
  </NotificationContext.Provider>
);

try {
  console.log("Testing PemeriksaanPage render...");
  renderToString(<Wrapper><PemeriksaanPage /></Wrapper>);
  console.log("PemeriksaanPage rendered successfully.");
} catch (e) {
  console.error("Error in PemeriksaanPage:", e);
}

try {
  console.log("Testing RekapPemeriksaanPage render...");
  renderToString(<Wrapper><RekapPemeriksaanPage /></Wrapper>);
  console.log("RekapPemeriksaanPage rendered successfully.");
} catch (e) {
  console.error("Error in RekapPemeriksaanPage:", e);
}

try {
  console.log("Testing DataSasaranPage render...");
  renderToString(<Wrapper><DataSasaranPage /></Wrapper>);
  console.log("DataSasaranPage rendered successfully.");
} catch (e) {
  console.error("Error in DataSasaranPage:", e);
}
