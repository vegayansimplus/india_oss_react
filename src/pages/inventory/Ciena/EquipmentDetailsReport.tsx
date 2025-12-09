import React, { useEffect, useState } from "react";
import { Grid, Divider, Box } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import axiosClient from "../../../utils/axiosData/axioxClient";
import { FETCH_INVENTORY_EQUIPMENT_REPORT_DATA } from "../../../utils/axiosData/apis";
import CommonTable from "../../../components/common/CommonTable";
import ExcelDownloadButton from "../../../components/common/ExcelDownloadButton";

type OutletContextType = { open: boolean };

const EquipmentDetailsReport: React.FC = () => {
  const { open } = useOutletContext<OutletContextType>();
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const TABLE_ID = "infr-google-circuits-dynamic";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get(`${FETCH_INVENTORY_EQUIPMENT_REPORT_DATA}`);

        let apiData = response.data;
        console.log("Fetched Equipment Details Report Data:", apiData);

        // Standard normalization
        if (apiData && !Array.isArray(apiData)) {
          apiData = apiData.data || apiData.result || apiData.results || apiData.items;
        }

        if (!Array.isArray(apiData)) {
          console.error("API did not return array", apiData);
          setTableData([]);
          return;
        }

        // --------- DYNAMIC COLUMNS LOGIC HERE ----------
        if (apiData.length > 0) {
          const keys = Object.keys(apiData[0]); // extract columns dynamically
          setColumnOrder(keys);
        }

        setTableData(apiData);
      } catch (error) {
        console.error("Error fetching channel details:", error);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#fff",
        minHeight: "100vh",
        padding: "1vh",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      {/* -------- Header Section -------- */}
      <Grid container spacing="1vh" alignItems="center" sx={{ mb: "2vh", mt: "1vh" }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ExcelDownloadButton
            data={tableData}
            columnOrder={columnOrder}
            tableId={TABLE_ID}
            fileName="Equipment_Details_Report"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: "center" }}>
          <Box
            sx={{
              backgroundColor: "#D3D3D3",
              color: "#000",
              padding: "1vh 2vh",
              height: "4vh",
              borderRadius: "2vh",
              display: "inline-block",
              fontWeight: 500,
              fontSize: "1vw",
            }}
          >
            EQUIPMENT DETAILS REPORT
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: "right", pr: "1vh" }}></Grid>
      </Grid>

      <Divider />

      {/* -------- Table Section -------- */}
      <Grid container spacing="0.2vh">
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              padding: "0",
              position: "absolute",
              maxHeight: "80vh",
              maxWidth: !open ? "calc(100vw - 40px)" : "calc(100vw - 260px)",
              overflowY: "auto",
              overflowX: "auto",
            }}
          >
            {loading ? (
              <Box sx={{ textAlign: "center", padding: "2rem" }}>Loading...</Box>
            ) : (
              <CommonTable
                columnOrder={columnOrder}
                dataObjects={tableData}
                pageSize={25}
                onRowClick={undefined}
                tableId={TABLE_ID}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default EquipmentDetailsReport;
