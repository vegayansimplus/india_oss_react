import React, { useEffect, useState } from "react";
import { Grid, Divider, Box } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import axiosClient from "../../../utils/axiosData/axioxClient";
import { FETCH_INVENTORY_CHANNEL_REPORT_DATA } from "../../../utils/axiosData/apis";
import CommonTable from "../../../components/common/CommonTable";
import ExcelDownloadButton from "../../../components/common/ExcelDownloadButton";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type OutletContextType = { open: boolean };

const ChannelDetailsReport: React.FC = () => {
  const { open } = useOutletContext<OutletContextType>();
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const TABLE_ID = "infr-google-circuits-dynamic";
  const convertToIST = (val: any) => {
  if (!val) return val;

  const str = String(val).trim();

  // if string already has timezone info
  const hasTZ =
    /Z$/.test(str) || /[+-]\d{2}:\d{2}$/.test(str);

  let d;
  if (hasTZ) {
    // convert whatever input is → IST
    d = dayjs(str).tz("Asia/Kolkata");
  } else {
    // assume data already IST
    d = dayjs.tz(str, "Asia/Kolkata");
  }

  if (!d.isValid()) return val;

  return d.format("YYYY-MM-DD HH:mm:ss"); // IST output
};
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await axiosClient.get(`${FETCH_INVENTORY_CHANNEL_REPORT_DATA}`);
        let apiData = response.data;

        console.log("Fetched Channel Details Report Data:", apiData);

        // Standard normalization
        if (apiData && !Array.isArray(apiData)) {
          apiData = apiData.data || apiData.result || apiData.results || apiData.items;
        }
        if (!Array.isArray(apiData)) {
          console.error("API did not return array", apiData);
          setTableData([]);
          return;
        }

        // Convert the 2 specific columns to UTC
        const updated = apiData.map((item) => {
          const copy = { ...item };

          // EXACT column
          copy["Last Updated Admin State"] = convertToIST(copy["Last Updated Admin State"]);
          copy["Last Updated Operational State"] = convertToIST(copy["Last Updated Operational State"]);

          return copy;
        });

        // Dynamic columns
        if (updated.length > 0) {
          const keys = Object.keys(updated[0]);
          setColumnOrder(keys);
        }

        setTableData(updated);
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
            fileName="Channel_Details_Report"
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
            CHANNEL DETAILS REPORT
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

export default ChannelDetailsReport;
