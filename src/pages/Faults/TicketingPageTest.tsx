import { useEffect, useMemo, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Box, CssBaseline, Drawer, IconButton, Divider, Grid, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axiosClient from '../../utils/axiosData/axioxClient';
import { FETCH_TICKETING_TABLE_DATA } from '../../utils/axiosData/apis';
import { DynamicTableRow } from '../../store/types';
import DateTimeRangeCompact from '../../components/common/DateTimeRangeCompact';
import { getNow, getOneHourAgo } from '../../components/common/CurrentDateTimeOneDayDiff';
import dayjs from 'dayjs';

import TicketingPageTable from '../../components/faults/active/Ticketing/TicketingPageTable';
import AlarmSummaryCardsInsideSidebarTicketing from '../../components/faults/active/Ticketing/AlarmSummaryCardsInsideSidebarTicketing';
import TicketingDetailsDialog from '../../components/faults/active/Ticketing/TicketingDetailsDialog';

/* ===== Layout constants ===== */
const drawerWidth = '20vw';
const TOP_OFFSET = '0.5vh';

/* ===== Styled components ===== */
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme }) => ({
  boxSizing: 'border-box',
  minHeight: `calc(100vh - ${TOP_OFFSET})`,
  paddingTop: `calc(${TOP_OFFSET} + ${theme.spacing(1)})`,
  marginLeft: 0,
  width: '100%',
  overflowX: 'hidden',
  transition: theme.transitions.create(['margin-left', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(1),
}));

/* ====== utils ====== */
const norm = (v?: string | null) => (v ?? '').toString().trim();
const up = (v?: string | null) => norm(v).toUpperCase();

const ALARM_SEVERITIES = ['Critical', 'Major', 'Minor'] as const;
const PRESET_SOURCES = ['MCP', 'NOKIA'] as const;

function mapSeverity(s?: string) {
  const u = (s ?? '').toUpperCase();
  if (u === 'CRI' || u === 'CRITICAL') return 'Critical';
  if (u === 'MAJ' || u === 'MAJOR') return 'Major';
  if (u === 'MIN' || u === 'MINOR' || u === 'MINORWARN') return 'Minor';
  if (u === 'WARN' || u === 'WARNING') return 'Warning';
  if (u === 'INFO' || u === 'INFORMATIONAL') return 'Info';
  if (u === 'CLEAR' || u === 'CLEARED') return 'Clear';
  return s ?? '';
}


function normalizeSeverity(s: string) {
  const u = s?.toUpperCase?.() ?? '';
  if (u === 'MINORWARN' || u === 'MINOR') return 'Minor';
  if (u === 'MAJOR') return 'Major';
  if (u === 'CRITICAL') return 'Critical';
  if (u === 'WARNING' || u === 'WARN') return 'Warning';
  if (u === 'INFO' || u === 'INFORMATIONAL') return 'Info';
  if (u === 'CLEAR' || u === 'CLEARED') return 'Clear';
  return s || '';
}
const normalizeTicketState = (s?: string | null) => {
  const u = (s ?? '').toString().trim().toUpperCase();
  if (u === 'OPEN') return 'OPEN';
  if (u === 'RESOLVED') return 'RESOLVED';
  if (u === 'CREATION FAILED') return 'CREATION FAILED';
  if (u === 'RESOLUTION FAILED') return 'CREATION FAILED';
  return u;
};


const dtoToRow = (dto: any): DynamicTableRow => ({
  Adapter: dto.clientType ?? '',
  Severity: mapSeverity(dto.severity),
  Family: dto.family ?? '',
  'VegayanOSS Ticket': dto.internalTicketId ?? '',
  'FS Ticket': dto.externalTicketId ?? '',
  'Ticket State': dto.state ?? '',
  'Alarm Received Time': dto.recTime ?? '',
  'Alarm Cleared Time': dto.clearTime ?? '',
  'OSS Ticket Created Time': dto.ticketCreationDate ?? '',
  'OSS Ticket Resolution Time': dto.ticketResolutionDate ?? '',
  'FS Error': dto.fserr ?? '',
  'Backend Error': dto.bckenderr ?? '',
  'Root Alarm ID': dto.alarmId ?? '',
  'Node Name': dto.nodeName ?? '',
  'IP Address': dto.ipAddress ?? '',
  'Symptom Type': dto.symptomType ?? '',
  'Ticket Description': dto.description ?? '',
  'Last Modify Date': dto.lastModifiedDate ?? '',
  'OSS DBInsertion(Receive)': dto.dbinsert_rec ?? '',
  'OSS DBInsertion(Clear)': dto.dbinsert_clear ?? '',
});

/* ====== chart builders (if needed later) ====== */
function groupByAdapterAndSeverity(rows: DynamicTableRow[]) {
  const result: Record<string, Record<string, number>> = {};
  for (const src of PRESET_SOURCES) {
    result[src] = {};
    for (const sev of ALARM_SEVERITIES) result[src][sev] = 0;
  }

  for (const r of rows) {
    const Adapter = up(r['Adapter'] as string) || 'UNKNOWN';
    const sevNorm = normalizeSeverity((r['Severity'] as string) ?? '');
    if (!result[Adapter]) {
      result[Adapter] = {};
      for (const s of ALARM_SEVERITIES) result[Adapter][s] = 0;
    }
    if ((ALARM_SEVERITIES as readonly string[]).includes(sevNorm)) {
      result[Adapter][sevNorm] = (result[Adapter][sevNorm] ?? 0) + 1;
    }
  }
  return result;
}

function buildBarDataset(rows: DynamicTableRow[]) {
  const grouped = groupByAdapterAndSeverity(rows);
  const header = ['Adapter', ...ALARM_SEVERITIES];
  const Adapters = [
    ...PRESET_SOURCES,
    ...Object.keys(grouped).filter((a) => !PRESET_SOURCES.includes(a as any)),
  ];
  const body = Adapters.map((Adapter) => {
    const sevMap = grouped[Adapter] || {};
    return [Adapter, ...ALARM_SEVERITIES.map((s) => sevMap[s] ?? 0)];
  });
  return [header, ...body];
}

type SeriesPoint = { time: Date; value: number };
type Series = { name: string; data: SeriesPoint[] };

function buildSeverityTrend(
  rows: DynamicTableRow[],
  minutesWindow = 10,
  severities: readonly string[] = ['Critical', 'Major', 'Minor'],
): Series[] {
  const now = new Date();
  const buckets: Date[] = Array.from({ length: minutesWindow }, (_, i) => {
    const t = new Date(now);
    t.setSeconds(0, 0);
    t.setMinutes(t.getMinutes() - (minutesWindow - 1 - i));
    return t;
  });

  const first = buckets[0].getTime();
  const last = buckets[buckets.length - 1].getTime();
  const countMap: Record<number, Record<string, number>> = {};

  for (const b of buckets) {
    countMap[b.getTime()] = {};
    for (const s of severities) countMap[b.getTime()][s] = 0;
  }

  for (const r of rows) {
    const tsRaw = r['Alarm Received Time'] as string;
    if (!tsRaw) continue;
    const ts = new Date(tsRaw);
    if (isNaN(ts.getTime())) continue;

    const snapped = new Date(ts);
    snapped.setSeconds(0, 0);
    const key = snapped.getTime();
    if (key < first || key > last) continue;

    const sevNorm = normalizeSeverity(r['Severity'] as string);
    if ((severities as readonly string[]).includes(sevNorm)) {
      countMap[key][sevNorm] = (countMap[key][sevNorm] ?? 0) + 1;
    }
  }

  return severities.map((s) => ({
    name: s,
    data: buckets.map((b) => ({ time: b, value: countMap[b.getTime()][s] ?? 0 })),
  }));
}

/* ====== component ====== */
export default function TicketingPageTest() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const handleToggle = () => setOpen((v) => !v);
  const handleDrawerClose = () => setOpen(false);

  const [openModel, setOpenModel] = useState(false);
  const [trapSelected, setTrapSelected] = useState<string[]>([]);
  const [tableData, setTableData] = useState<DynamicTableRow[]>([]);
  const [finalFilteredData, setFinalFilteredData] = useState<DynamicTableRow[]>([]);

  // Ticket State store : 'ALL' | 'Open' | 'Resolved' | 'Creation failed'
  const [alarmSeveritySelected, setAlarmSeveritySelected] = useState<string>('ALL');
  const [alarmSourceSelected, setAlarmSourceSelected] = useState<string>('ALL');

  const [popUpDataRow, setPopUpDataRow] = useState<DynamicTableRow | null>(null);
  const [viewGraph, setViewGraph] = useState<boolean>(false);

  const now = getNow();
  const oneHourAgo = getOneHourAgo();
  const [fromDate, setFromDate] = useState<Date | null>(oneHourAgo);
  const [toDate, setToDate] = useState<Date | null>(now);

  // API load
  const fetchTicketingData = async () => {
    try {
      const formattedFrom = dayjs(fromDate).format('YYYY-MM-DD HH:mm:ss');
      const formattedTo = dayjs(toDate).format('YYYY-MM-DD HH:mm:ss');

      const res = await axiosClient.get(FETCH_TICKETING_TABLE_DATA, {
        params: { startTime: formattedFrom, endTime: formattedTo },
      });

      if (res.status === 200) {
        const rowsDTO = (res.data ?? []) as any[];
        const rows = rowsDTO.map(dtoToRow);
        setTableData(rows);
        setFinalFilteredData(rows);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTicketingData();
  }, []);

  // FILTERS – Based on "Ticket State"
  useEffect(() => {
    let filtered = [...tableData];

    // Ticket State filter
    if (alarmSeveritySelected !== 'ALL') {
      filtered = filtered.filter((row) => {
        const raw = (row['Ticket State'] as string) ?? '';
        const val = normalizeTicketState(raw);
        const selected = normalizeTicketState(alarmSeveritySelected);
        return val === selected;
      });
    }

    // Adapter / Source filter
    if (alarmSourceSelected !== 'ALL') {
      filtered = filtered.filter(
        (row) => up(row['Adapter'] as string) === alarmSourceSelected,
      );
    }
    setFinalFilteredData(filtered);
  }, [tableData, alarmSeveritySelected, alarmSourceSelected]);

  const barData = useMemo(() => buildBarDataset(finalFilteredData), [finalFilteredData]);
  const severitySeriesData = useMemo(
    () => buildSeverityTrend(finalFilteredData, 10, ['Critical', 'Major', 'Minor']),
    [finalFilteredData],
  );

  const defaultVisibleColumns = [
    'Adapter',
    'Severity',
    'FS Ticket',
    'VegayanOSS Ticket',
    'Family',
    'Ticket State',
    'Alarm Received Time',
    'Alarm Cleared Time',
    'OSS Ticket Created Time',
    'OSS Ticket Resolution Time',
    'FS Error',
    'Backend Error',
    'Root Alarm ID',
    'Node Name',
    'IP Address',
    'Symptom Type',
    'Ticket Description',
    'Last Modify Date',
  ];

  const columnOrder = [
    'Adapter',
    'Family',
    'VegayanOSS Ticket',
    'FS Ticket',
    'Ticket State',
    'Alarm Received Time',
    'Alarm Cleared Time',
    'OSS DBInsertion(Receive)',
    'OSS DBInsertion(Clear)',
    'OSS Ticket Created Time',
    'OSS Ticket Resolution Time',
    'FS Error',
    'Backend Error',
    'Root Alarm ID',
    'Node Name',
    'Severity',
    'IP Address',
    'Symptom Type',
    'Ticket Description',
    'Last Modify Date',
  ];

  return (
    <div
      style={{
        backgroundColor: '#fff',
        minHeight: '100vh',
        maxWidth: '100vw',
        width: '100vw',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', width: '100%' }}>
        <CssBaseline />

        {/* Floating toggle button */}
        <IconButton
          onClick={handleToggle}
          aria-label="toggle menu"
          sx={{
            position: 'fixed',
            top: `calc(${TOP_OFFSET} + 2px)`,
            left: 12,
            zIndex: (t) => t.zIndex.drawer + 2,
            bgcolor: 'white',
            border: '1px solid rgba(0,0,0,0.12)',
            boxShadow: 1,
            '&:hover': { bgcolor: 'white' },
          }}
          size="small"
        >
          <MenuIcon />
        </IconButton>

        {/* Drawer Sidebar */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={open}
          sx={{
            width: open ? drawerWidth : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              position: 'fixed',
              top: TOP_OFFSET,
              height: `calc(100vh - ${TOP_OFFSET})`,
            },
          }}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <Grid container spacing={1}>
            <AlarmSummaryCardsInsideSidebarTicketing
              tableData={tableData}
              alarmSeveritySelected={alarmSeveritySelected} // yahan Ticket State aa raha hai
              setAlarmSeveritySelected={setAlarmSeveritySelected}
              alarmSourceSelected={alarmSourceSelected}
              setAlarmSourceSelected={setAlarmSourceSelected}
            />
          </Grid>
          <Divider />
        </Drawer>

        {/* Main content */}
        <Main open={open} sx={{ p: '1vh' }}>
          <Grid container spacing={1} display="flex" justifyContent="flex-end">
            <Box sx={{ fontSize: '1.0vw', fontWeight: '700', mt: '2.5vh', mr: '9vw' }}>
              INDIA Ticketing Browser
            </Box>
            <Grid size={{ xs: 12, md: 4 }} container spacing={1} sx={{ mt: '1vh' }}>
              <DateTimeRangeCompact
                fromDate={fromDate}
                toDate={toDate}
                onChange={({ from, to }) => {
                  setFromDate(from);
                  setToDate(to);
                }}
                sx={{ mt: '0.3vh', width: '100%' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 1 }}>
              <Button
                fullWidth
                sx={{
                  backgroundColor: '#990033',
                  ':hover': { backgroundColor: '#990033' },
                  fontSize: '0.8vw',
                  color: '#ffffff',
                  mt: '2.0vh',
                  height: '4vh',
                }}
                onClick={fetchTicketingData}
              >
                View
              </Button>
            </Grid>
          </Grid>

          {/* Table Section */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ borderRadius: 3, mt: 0.5 }}>
            <TicketingPageTable
              defaultVisibleColumns={defaultVisibleColumns}
              columnOrder={columnOrder}
              dataObjects={finalFilteredData}
              pageSize={100}
              viewGraph={viewGraph}
              setViewGraph={setViewGraph}
              onRowClick={(row) => {
                setPopUpDataRow(row);
                setOpenModel(true);
              }}
              isActiveTab={true}
              tableId="ticketing-table"
              drawerOpen={open}
              drawerWidthCss={drawerWidth}
            />
          </Grid>
          <TicketingDetailsDialog
            open={openModel}
            onClose={() => setOpenModel(false)}
            popUpDataRow={popUpDataRow}
          />
        </Main>
      </Box>
    </div>
  );
}
