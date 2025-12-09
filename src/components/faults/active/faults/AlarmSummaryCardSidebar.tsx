import Grid from '@mui/material/Grid';
import { Box, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { DynamicTableRow } from '../../../../store/types';

const StatusCard = styled(Box)(() => ({
  backgroundColor: "#7e7d7dff",
  borderRadius: "1.5vh",
  padding: "1vh 0.6vw",
  minWidth: "9vw",
  textAlign: 'center' as const,
}));

const StatusChip = styled('div')<{
  chipcolor?: "Critical" | "Major" | "Minor" | "default";
  selected?: boolean;
  disabled?: boolean;
}>(({ chipcolor = "default", selected = false, disabled = false }) => ({
  minWidth: "2.5vw",
  height: "3vh",
  fontSize: "1.7vh",
  fontWeight: "bold",
  borderRadius: "1vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  cursor: disabled ? "not-allowed" : "pointer",
  pointerEvents: disabled ? "none" : "auto",
  opacity: disabled ? 0.45 : 1,

  border: selected ? '0.1vw solid white' : 'none',

  ...(chipcolor === "Major" && { backgroundColor: "#e5990cff", color: "white" }),
  ...(chipcolor === "Critical" && { backgroundColor: "#f11212ff", color: "white" }),
  ...(chipcolor === "Minor" && { backgroundColor: "#eed812ff", color: "white" }),
  ...(chipcolor === "default" && { backgroundColor: "#b0ababff", color: "white" }),
}));

// Table field keys
const F = { TRAP_SOURCE: 'Adapter', SEVERITY: 'Severity' };
const NORM = (v?: string | null) => (v ?? '').toString().trim();
const NORM_UP = (v?: string | null) => NORM(v).toUpperCase();

// Map table severity -> chip palette keys
const normSevForChip = (s?: string | null) => {
  const u = NORM_UP(s);
  if (u === 'CRITICAL' || u === 'CRI') return 'Critical';
  if (u === 'MAJOR' || u === 'MAJ') return 'Major';
  if (u === 'MINOR' || u === 'MIN' || u === 'MINORWARN') return 'Minor';
  return NORM(s);
};

interface AlarmSummaryCardsProps {
  tableData: DynamicTableRow[];
  alarmSeveritySelected: string;
  setAlarmSeveritySelected: (severity: string) => void;
  alarmSourceSelected: string;
  setAlarmSourceSelected: (src: string) => void;
}

/** Center title + right count header (count clickable) */
const HeaderRow = ({
  title,
  total,
  onTotalClick,
}: {
  title: string;
  total: number;
  onTotalClick?: () => void;
}) => (
  <Box
    sx={{
      position: "relative",
      mb: "0.5vh",
      px: "0.2vw",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "2.2vh",
    }}
  >
    {/* Title center */}
    <Typography
      variant="body2"
      sx={{
        color: "#ffffff",
        fontSize: "1.6vh",
        fontWeight: 600,
        width: "100%",
        textAlign: "center",
        lineHeight: 1.2,
        userSelect: "none",
      }}
    >
      {title}
    </Typography>

    {/* Count right end (absolute) - CLICKABLE ONLY IF total > 0 */}
    <Box
      onClick={total > 0 ? onTotalClick : undefined}
      sx={{
        position: "absolute",
        right: 0,
        px: "0.5vw",
        py: "0.2vh",
        borderRadius: "1vh",
        cursor: total > 0 ? "pointer" : "not-allowed",
        pointerEvents: total > 0 ? "auto" : "none",
        opacity: total > 0 ? 1 : 0.45,
        userSelect: "none",
        fontSize: "1.8vh",
        fontWeight: 700,
        color: "#ffffff",

        backgroundColor: "rgba(255,255,255,0.15)",   // default visible button feel
        transition: "all 0.15s ease",

        "&:hover": total > 0
          ? { backgroundColor: "rgba(255,255,255,0.28)" }
          : undefined,

        "&:active": total > 0
          ? {
              backgroundColor: "rgba(255,255,255,0.35)",
              transform: "scale(0.94)",
            }
          : undefined,
      }}
    >
      {total}
    </Box>
  </Box>
);

function AlarmSummaryCardsInsideSidebar({
  tableData,
  alarmSeveritySelected,
  setAlarmSeveritySelected,
  alarmSourceSelected,
  setAlarmSourceSelected,
}: AlarmSummaryCardsProps) {

  const PRESET_SOURCES = ['MCP', 'NFMT',] as const;
  const ALARM_SEVERITIES: Array<'Critical'|'Major'|'Minor'> = ['Critical','Major','Minor'];

  // overall total count
  const overallTotal = tableData?.length ?? 0;

  function groupBySourceAndSeverity(data: DynamicTableRow[]) {
    return data.reduce((acc, trap) => {
      const source = NORM_UP(trap[F.TRAP_SOURCE] as string) || 'UNKNOWN';
      const sev = normSevForChip(trap[F.SEVERITY] as string) || 'UNKNOWN';
      if (!acc[source]) acc[source] = {};
      if (!acc[source][sev]) acc[source][sev] = 0;
      acc[source][sev] += 1;
      return acc;
    }, {} as Record<string, Record<string, number>>);
  }

  const grouped = groupBySourceAndSeverity(tableData);

  // Overall counts (sum across all sources actually present in data)
  const overallCounts = ALARM_SEVERITIES.map(sev =>
    Object.values(grouped).reduce((sum, sevMap) => sum + (sevMap[sev] ?? 0), 0)
  );

  // helper to reset filters
  const resetToAll = (source: string) => {
    setAlarmSeveritySelected('ALL');
    setAlarmSourceSelected(source);
  };

  return (
    <Grid
      container
      spacing="1vh"
      justifyContent="flex-end"
      alignItems="center"
      sx={{ p: "1vh" }}
    >
      {/* Overall - All Sources */}
      <Grid size={{ xs: 12, sm: 6, md: 12 }}>
        <StatusCard>

          {/* Center All Sources + right count (click => show ALL, only if total > 0) */}
          <HeaderRow
            title="All Sources"
            total={overallTotal}
            onTotalClick={() => resetToAll('ALL')}
          />

          <Grid container spacing="0.5vh" justifyContent="center">
            {ALARM_SEVERITIES.map((sev, i) => (
              <Grid size={{ xs: 4 }} key={`ALL-${sev}`}>
                <StatusChip
                  disabled={overallCounts[i] === 0}
                  onClick={() => {
                    const next = alarmSeveritySelected === sev ? 'ALL' : sev;
                    setAlarmSeveritySelected(next);
                    setAlarmSourceSelected('ALL');
                  }}
                  selected={alarmSeveritySelected === sev && alarmSourceSelected === 'ALL'}
                  chipcolor={overallCounts[i] > 0 ? sev : "default"}
                >
                  {overallCounts[i]}
                </StatusChip>
              </Grid>
            ))}
          </Grid>
        </StatusCard>
      </Grid>

      {/* Per-source cards */}
      {PRESET_SOURCES.map((source) => {
        const sevMap = grouped[source] ?? {};
        const counts = ALARM_SEVERITIES.map(sev => sevMap[sev] ?? 0);
        const sourceTotal = counts.reduce((a, b) => a + b, 0);

        return (
          <Grid size={{ xs: 12, sm: 6, md: 12 }} key={source}>
            <StatusCard>

              {/* Center source + right count (click => ALL severities of this source, only if > 0) */}
              <HeaderRow
                title={source}
                total={sourceTotal}
                onTotalClick={() => resetToAll(source)}
              />

              <Grid container spacing="0.5vh" justifyContent="center">
                {ALARM_SEVERITIES.map((sev, i) => {
                  const isSelected =
                    alarmSeveritySelected === sev && alarmSourceSelected === source;
                  const count = counts[i];

                  return (
                    <Grid size={{ xs: 4 }} key={`${source}-${sev}`}>
                      <StatusChip
                        disabled={count === 0}
                        selected={isSelected}
                        onClick={() => {
                          if (isSelected) {
                            resetToAll('ALL'); // clicking same chip again => full reset
                          } else {
                            setAlarmSeveritySelected(sev);
                            setAlarmSourceSelected(source);
                          }
                        }}
                        chipcolor={count > 0 ? sev : "default"}
                      >
                        {count}
                      </StatusChip>
                    </Grid>
                  );
                })}
              </Grid>
            </StatusCard>
          </Grid>
        );
      })}
    </Grid>
  );
}
export default AlarmSummaryCardsInsideSidebar;
