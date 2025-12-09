import React, { useMemo, useState, useEffect, } from "react";
import ReactECharts from "echarts-for-react";
import {
  Card, CardContent, Box, Typography, FormControl, InputLabel,
  Select, MenuItem, TextField,
} from "@mui/material";
import axiosClient from "../../../../utils/axiosData/axioxClient";

// accept ANY severity string
interface SeverityTrendData {
  name: string;
  color?: string;
  data: { time: string | Date; value: number }[];
}
interface SeverityTrendGraphProps {
  title?: string;
  yLabel?: string;
}
// API response
interface SeverityTrendApiRow {
  date: string; // "2025-10-28"
  countCritical: string;
  countMajor: string;
  countMinor: string;
  countCleared: string;
}
// adapter list
const ADAPTER_OPTIONS: string[] = ["MCP", "NFMT"];

const formatDateInput = (d: Date): string => {
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
};

const GraphTemplateSeverityTrend: React.FC<SeverityTrendGraphProps> = ({
  title = "Alarm Severity Trend",
  yLabel = "Count"
}) => {
  // -------------------- FILTER STATES --------------------
  const [adapterName, setAdapterName] = useState<string>("MCP");

  const today = useMemo(() => new Date(), []);
  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);

  const [dateStart, setDateStart] = useState<string>(
    formatDateInput(sevenDaysAgo)
  );
  const [dateEnd, setDateEnd] = useState<string>(formatDateInput(today));


  const [autoSeriesData, setAutoSeriesData] = useState<SeverityTrendData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);


  const finalSeriesData = autoSeriesData;
  // -------------------- API CALL --------------------
  const fetchSeverityTrend = async () => {

    try {
      setLoading(true);

      const params = {
        AdapterName: adapterName,
        dateStart: `${dateStart} 00:00:00`,
        dateEnd: `${dateEnd} 00:00:00`,
      };

      const response = await axiosClient.get<SeverityTrendApiRow[]>(
        `/v1/faultbrowser/active-traps/graphtrend`,
        { params }
      );
      console.log("Severity Trend API response:", response.data);
      const rows = response.data ?? [];
      // API response -> ECharts seriesData
      const criticalSeries: SeverityTrendData = {
        name: "Critical",
        color: "#ff4d4f",
        data: rows.map((r) => ({
          time: r.date,
          value: Number(r.countCritical) || 0,
        })),
      };
      const majorSeries: SeverityTrendData = {
        name: "Major",
        color: "#faad14",
        data: rows.map((r) => ({
          time: r.date,
          value: Number(r.countMajor) || 0,
        })),
      };

      const minorSeries: SeverityTrendData = {
        name: "Minor",
        color: "#40a9ff",
        data: rows.map((r) => ({
          time: r.date,
          value: Number(r.countMinor) || 0,
        })),
      };

      const clearedSeries: SeverityTrendData = {
        name: "Cleared",
        color: "#52c41a",
        data: rows.map((r) => ({
          time: r.date,
          value: Number(r.countCleared) || 0,
        })),
      };

      setAutoSeriesData([
        criticalSeries,
        majorSeries,
        minorSeries,
        clearedSeries,
      ]);
    } catch (error) {
      console.error("Error fetching severity trend:", error);
      setAutoSeriesData([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchSeverityTrend();
  }, [dateStart, dateEnd, adapterName]);

  // -------------------- ECHARTS OPTION --------------------
  const option = useMemo(() => {
    return {
      title: { show: false },
      tooltip: { trigger: "axis", confine: true },
      legend: {
        data: finalSeriesData.map((s) => s.name),
        orient: "horizontal",
        bottom: 27,
      },
      grid: { top: 10, left: 60, right: 5, bottom: 70 },
      dataZoom: [
        { type: "slider", show: true, height: 15, bottom: 15 },
        { type: "inside", realtime: true, start: 0, end: 100 },
      ],
      xAxis: {
        type: "time",
        name: "Time",
        axisLabel: { fontSize: 10 },
        splitLine: { show: true, lineStyle: { type: "dashed" } },
      },
      yAxis: {
        type: "value",
        name: yLabel,
        nameLocation: "middle",
        nameGap: 45,
        min: 0,
        splitLine: { show: true, lineStyle: { type: "dashed" } },
      },
      series: finalSeriesData.map((s) => ({
        name: s.name,
        type: "line",
        smooth: false,
        showSymbol: true,
        symbolSize: 2,
        sampling: "lttb",
        lineStyle: { width: 1 },
        data: s.data.map((d) => [d.time, d.value]),
        itemStyle: { color: s.color || undefined },
        areaStyle: { opacity: 0.15 },
        animation: false,
      })),
    };
  }, [yLabel, finalSeriesData]);

  return (
    <Card
      sx={{
        boxShadow: 3,
        borderRadius: 3,
        height: "100%",
        border: 1,
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: 0.9,
        }}
      >
        {/* --------- TOP HEADER + FILTERS --------- */}
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
            sx={{ fontWeight: 600, fontSize: 13 }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              '& .MuiInputBase-root': {
                height: 30, // each fields get same height
              }
            }}
          >
            {/* Adapter dropdown (top-right) */}
            <FormControl size="small" sx={{ minWidth: 10 }}>
              <InputLabel>Adapter</InputLabel>
              <Select
                label="Adapter"
                value={adapterName}
                onChange={(e) => setAdapterName(e.target.value as string)}
              >
                {ADAPTER_OPTIONS.map((ad) => (
                  <MenuItem key={ad} value={ad}>
                    {ad}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* From date */}
            <TextField
              size="small"
              type="date"
              label="From"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 135, }}
            />

            {/* To date */}
            <TextField
              size="small"
              type="date"
              label="To"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 135 }}
            />
          </Box>
        </Box>

        {/* --------- CHART --------- */}
        <Box sx={{ flex: 1 }}>
          <ReactECharts
            option={option}
            style={{ height: "28.5vh", width: "100%" }}
            notMerge
            lazyUpdate
            showLoading={loading}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
export default GraphTemplateSeverityTrend;
