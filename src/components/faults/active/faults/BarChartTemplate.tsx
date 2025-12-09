import React from "react";
import ReactECharts from "echarts-for-react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface BarChartProps {
  title?: string;
  isSidebarOpen?: boolean;
  data: (string | number)[][];
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#d32f2f",   // red
  Major: "#f57c00",      // orange
  MinorWarn: "#fbc02d",  // yellow

};

const BarChartTemplate: React.FC<BarChartProps> = ({
  title = "Severity Bar Graph",
  isSidebarOpen,
  data,
}) => {
  // first row is header → severities
  const severities = data[0].slice(1) as string[];

  const option = {
    legend: {},
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    dataset: {
      source: data,
    },
    xAxis: { type: "category" },
    yAxis: { type: "value", name: "Count" },
    series: severities.map((sev) => ({
      type: "bar",
      itemStyle: {
        color: SEVERITY_COLORS[sev] || "#fbc02d", // fallback yellow
      },
    })),
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: 1,
        boxShadow: 3,
        bgcolor: "background.paper",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          p: 0.9,
          m: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          "&:last-child": {
            paddingBottom: 0, 
          },
        }}
      >
        {/* --------- TOP HEADER (same place as Alarm Severity Trend) --------- */}
        <Box
          sx={{
            mb: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, fontSize: 13 , marginLeft: isSidebarOpen ?'1vh':"7vh"}}
          >
            {title}
          </Typography>
        </Box>

        {/* --------- CHART --------- */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ReactECharts
            option={option}
            style={{ height: "100%", width: "100%" }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BarChartTemplate;
