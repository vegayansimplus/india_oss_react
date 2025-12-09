import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import LoginPage from "./pages/LoginPage";
import { useReduxTheme } from "./theme/theme";
import { SnackbarProvider } from "./components/common/SnackbarProvider";
import HomePage from "./pages/home/HomePage";
import InventoryHome from "./pages/inventory/InventoryHome";
import ActiveFaultTest from "./pages/Faults/ActiveFaultTest";
import HistoricalFaultsTest from "./pages/Faults/HistoricalFaultsTest";
import TicketingPageTest from "./pages/Faults/TicketingPageTest";
import ChannelDetailsReport from "./pages/inventory/Ciena/ChannelDetailsReport";
import EquipmentDetailsReport from "./pages/inventory/Ciena/EquipmentDetailsReport";
import NEListReport from "./pages/inventory/Ciena/NEListReport";
import NfmtDeviceDetailsReport from "./pages/inventory/NFMT/NfmtDeviceDetailsReport";
import NfmtEquipmentDetailsReport from "./pages/inventory/NFMT/NfmtEquipmentDetailsReport";

function App() {
  const theme = useReduxTheme();
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <div className="app-container">
          <div className="app-content">
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* app – NO ProtectedRoute, NO token check */}
              <Route path="/" element={<HomePage />}>
                {/* default landing under / */}
                <Route index element={<ActiveFaultTest />} />

                {/* faults */}
                <Route path="faults/active" element={<ActiveFaultTest />} />
                <Route path="faults/historical" element={<HistoricalFaultsTest />} />
                <Route path="faults/ticketing" element={<TicketingPageTest />} />

                {/* INVENTORY LAYOUT */}
                <Route path="inventory" element={<InventoryHome />}>
                  {/* default content when visiting /inventory */}
                  <Route index element={<NEListReport />} />
                  <Route path="ciena/ne-list-report" element={<NEListReport />} />
                  <Route path="ciena/equipment-details-report" element={<EquipmentDetailsReport />} />
                  <Route path="ciena/channel-details-report" element={<ChannelDetailsReport />} />
                  <Route path="nfmt/device-details-report" element={<NfmtDeviceDetailsReport />} />
                  <Route path="nfmt/equipment-details-report" element={<NfmtEquipmentDetailsReport />} />
                </Route>
              </Route>
              {/* unknown url → / */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
export default App;

