import { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';
import { DynamicTableRow } from '../../store/types';
import BarChartTemplate from '../../components/faults/active/faults/BarChartTemplate';
import GraphTemplateSeverityTrend from '../../components/faults/active/faults/SeverityCountTrendGraph';
import axiosClient, { baseURL_WS } from '../../utils/axiosData/axioxClient';
import { FETCH_ACTIVE_FAULTS_TABLE_DATA } from '../../utils/axiosData/apis';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import TrapDetailsDialog from '../../components/faults/active/faults/TrapDetailsDialog';
import { Grid, Typography } from '@mui/material';
import AlarmSummaryCardsInsideSidebar from '../../components/faults/active/faults/AlarmSummaryCardSidebar';
import ActiveFaultsTableForSidebar from '../../components/faults/active/faults/ActiveFaultTableForSidebar';
import LoadingBox from '../../components/common/LoadingBox';

/* ===== Layout constants ===== */
const drawerWidth = '20vw';
const TOP_OFFSET = '5vh';

/* ===== Local storage key (cache last WS/API data) ===== */
const STORAGE_KEY = 'active_faults_last_payload_v1';

/* ===== Styled pieces ===== */
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

/* ===== utils & mapping ===== */
const norm = (v?: string | null) => (v ?? '').toString().trim();
const up = (v?: string | null) => norm(v).toUpperCase();

const ALARM_SEVERITIES = ['Critical', 'Major', 'Minor'] as const;
const PRESET_SOURCES = ['MCP', 'NFMT'] as const;

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

function shouldHighlightRow(row: DynamicTableRow) {
  const msg = (row['Clear Time'] ?? '').toString().trim().toUpperCase();
  return msg !== '' && msg !== 'NA';
}

const dtoToRow = (dto: any): DynamicTableRow => ({
  Adapter: dto.adapaterName ?? dto.clientType ?? '',
  Severity: mapSeverity(dto.severity),
  Alarm: dto.traptype ?? '',
  Client: dto.clientType ?? '',
  Technology: dto.vendor ?? '',
  'Device Name': dto.nodename ?? '',
  Source: dto.senderip ?? '',
  'Port Name': dto.ifdesc ?? '',
  'No.Services_Affected': dto.numberOfServiceAffecting ?? '',
  'Device Type': dto.nodetype ?? '',
  'NMS Received Time': dto.rec_time ?? '',
  Description: dto.desc ?? '',
  'Ack Status': dto.ack_stat ?? '',
  'Ack Time': dto.ack_time ?? '',
  'Ack Msg': dto.ack_msg ?? '',
  'Ack User': dto.ack_user ?? '',
  'Clear Msg': dto.clear_msg ?? '',
  'Clear User': dto.clear_user ?? '',
  'Object Ref': dto.ref ?? '',
  'Trap Source': dto.trpsource ?? '',
  'Update Time': dto.update_time ?? '',
  'OSS Insertion Time': dto.insertion_time ?? '',
  'Clear Time': dto.clear_time ?? 's',
  'Internal TicketId': dto.trapid ?? '',
  'Alarm Id': dto.alarmid ?? '',
  'External TicketId': dto.ticket ?? '',
  __trapid: dto.trapid ?? '',
  __adapaterName: dto.adapaterName ?? '',
  __vendor: dto.vendor ?? '',
  __rec_time: dto.rec_time ?? '',
});

const defaultVisibleColumns = [
  'Adapter',
  'Severity',
  'Alarm',
  'Technology',
  'Device Name',
  'Source',
  'Port Name',
  'No.Services_Affected',
  'Description',
  'Ack Time',
  'Ack Msg',
  'Ack User',
  'Clear Msg',
  'Clear User',
  'NMS Received Time',
  'Clear Time',
  'OSS Insertion Time',
  'Internal TicketId',
];

const columnOrder = [
  'Adapter',
  'Severity',
  'Alarm',
  'Client',
  'Technology',
  'Device Name',
  'Source',
  'Device Type',
  'Port Name',
  'No.Services_Affected',
  'Description',
  'Ack Status',
  'Ack Time',
  'Ack Msg',
  'Ack User',
  'Clear Msg',
  'Clear User',
  'Object Ref',
  'Trap Source',
  'NMS Received Time',
  'Update Time',
  'Clear Time',
  'OSS Insertion Time',
  'Alarm Id',
  'Internal TicketId',
  'External TicketId',
];

/* ===== chart builders ===== */
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
  const Adapters = [...PRESET_SOURCES,...Object.keys(grouped).filter((a) =>
     !PRESET_SOURCES.includes(a as any)),
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
  severities: readonly string[] = ['Critical', 'Major', 'Minor']
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
    const tsRaw =
      (r['Received Time'] as string) || (r['NMS Received Time'] as string);
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

  const series: Series[] = severities.map((s) => ({
    name: s,
    data: buckets.map((b) => ({
      time: b,
      value: countMap[b.getTime()][s] ?? 0,
    })),
  }));

  return series;
}

/* ===== Helper: load cached data synchronously for initial render ===== */
function loadInitialRowsFromCache(): DynamicTableRow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      console.log('Initial rows from cache:', parsed.length);
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to load cached active faults (initial)', e);
    return [];
  }
}

/* ===== Component ===== */
export default function ActiveFaultTest() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const [openModel, setOpenModel] = useState(false);
  const [trapSelected, setTrapSelected] = useState<string[]>([]);

  // Initial data directly from cache (if any)
  const [tableData, setTableData] = useState<DynamicTableRow[]>(() =>
    loadInitialRowsFromCache()
  );
  const [finalFilteredData, setFinalFilteredData] = useState<DynamicTableRow[]>(
    () => loadInitialRowsFromCache()
  );

  const [alarmSeveritySelected, setAlarmSeveritySelected] =
    useState<string>('ALL');
  const [alarmSourceSelected, setAlarmSourceSelected] =
    useState<string>('ALL');
  const [popUpDataRow, setPopUpDataRow] =
    useState<DynamicTableRow | null>(null);
  const [viewGraph, setViewGraph] = useState<boolean>(false);

  // NEW: loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleToggle = () => setOpen((v) => !v);
  const handleDrawerClose = () => setOpen(false);

  const TABLE_ID = 'active-faults-table';

  /* ===== Helper: persist rows to state + localStorage ===== */
  const persistTableData = (rows: DynamicTableRow[]) => {
    setTableData(rows);
    setFinalFilteredData(rows);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch (e) {
      console.error('Failed to cache active faults in localStorage', e);
    }
  };

  // API load
  const fetchFaultsData = async () => {
    try {
      setIsLoading(true); // start spinner
      const response = await axiosClient.get(FETCH_ACTIVE_FAULTS_TABLE_DATA);
      if (response.status === 200) {
        const rowsDTO = (response.data ?? []) as any[];
        const rows = rowsDTO.map(dtoToRow);
        persistTableData(rows); // update + recache
      } else {
        // optional: clear data on non-200
        setTableData([]);
        setFinalFilteredData([]);
      }
    } catch (e) {
      console.error(e);
      setTableData([]);
      setFinalFilteredData([]);
    } finally {
      setIsLoading(false); // stop spinner
    }
  };

  // WebSocket live updates
  useEffect(() => {
    let isActive = true;
    // const socket = new SockJS(`${baseURL_WS}/ws`);
    const socket = new SockJS("/ws");
    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      onConnect: () => {
        if (!isActive) return;
        client.subscribe(`/topic/active-traps`, (message) => {
          console.log('WS MESSAGE RECEIVED:');
          console.log('RAW MESSAGE:', message);
          if (!isActive) return;
          if (message.body) {
            const payloadDTO = JSON.parse(message.body) as any[];
            console.log('Parsed DTO count:', payloadDTO.length);
            const payload = payloadDTO.map(dtoToRow);
            console.log(
              'Converted rows (DynamicTableRow count):',
              payload.length
            );
            persistTableData(payload);
          }
        });
      },
    });
    client.activate();
    return () => {
      isActive = false;
      client.deactivate();
    };
  }, []);

  // Initial API call
  useEffect(() => {
    fetchFaultsData();
  }, []);

  // filters
  useEffect(() => {
    let filtered = [...tableData];
    if (alarmSeveritySelected !== 'ALL') {
      filtered = filtered.filter(
        (row) =>
          normalizeSeverity(norm(row['Severity'] as string)) ===
          alarmSeveritySelected
      );
    }
    if (alarmSourceSelected !== 'ALL') {
      filtered = filtered.filter(
        (row) => up(row['Adapter'] as string) === alarmSourceSelected
      );
    }
    if (trapSelected.length > 0) {
      filtered = filtered.filter((row) =>
        trapSelected.includes(norm(row['Alarm'] as string))
      );
    }
    setFinalFilteredData(filtered);
  }, [tableData, alarmSeveritySelected, alarmSourceSelected, trapSelected]);

  // chart-ready data
  const barData = useMemo(
    () => buildBarDataset(finalFilteredData),
    [finalFilteredData]
  );
  const severitySeriesData = useMemo(
    () =>
      buildSeverityTrend(finalFilteredData, 10, [
        'Critical',
        'Major',
        'Minor',
      ]),
    [finalFilteredData]
  );

  const hasRows = finalFilteredData.length > 0;

  return (
    <div
      style={{
        backgroundColor: '#fff',
        minHeight: '100vh',
        maxWidth: '100vw',
        width: '100vw',
        overflow: 'hidden',
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
            top: `calc(${TOP_OFFSET} + 1.7vh)`,
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

        {/* Persistent Drawer (offset below top nav) */}
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
              {theme.direction === 'ltr' ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <Grid container spacing={1}>
            <AlarmSummaryCardsInsideSidebar
              tableData={tableData}
              alarmSeveritySelected={alarmSeveritySelected}
              setAlarmSeveritySelected={setAlarmSeveritySelected}
              alarmSourceSelected={alarmSourceSelected}
              setAlarmSourceSelected={setAlarmSourceSelected}
            />
          </Grid>
          <Divider />
        </Drawer>

        {/* Main content; always fits in 100vw */}
        <Main open={open} sx={{ p: '1vh' }}>
          <Grid container spacing={0} sx={{ width: '100%' }}>
            {/* <MiniCardsTop tableData={tableData}/> */}
          </Grid>

          {viewGraph && (
            <Grid
              container
              sx={{ height: '35vh', my: 0.5 }}
              spacing={1}
              alignItems="stretch"
            >
              <Grid size={{ xs: 12, md: 6 }} sx={{ p: 0, height: '100%' }}>
                <BarChartTemplate
                  title="Active alarms by Adapter"
                  data={barData}
                  isSidebarOpen={open}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ p: 0, height: '100%' }}>
                <GraphTemplateSeverityTrend
                />
              </Grid>
            </Grid>
          )}

          {/* Table area: spinner -> table -> no data */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ borderRadius: '1vh', mt: '0.5vh' }}
          >
            {isLoading && !hasRows ? (
              // Initial / full reload loading state
              <LoadingBox isLoading />
            ) : hasRows ? (
              // Data available ⇒ show actual table
              <ActiveFaultsTableForSidebar
                columnOrder={columnOrder}
                defaultVisibleColumns={defaultVisibleColumns}
                dataObjects={finalFilteredData}
                pageSize={100}
                isActiveTab={true}
                viewGraph={viewGraph}
                setViewGraph={setViewGraph}
                tableId={TABLE_ID}
                highlightPredicate={shouldHighlightRow}
                onRowClick={(row) => {
                  setPopUpDataRow(row);
                  setOpenModel(true);
                }}
                drawerOpen={open}
                drawerWidthCss={drawerWidth}
              />
            ) : (
              // API done, but no rows
              <Box
                sx={{
                  height: '70vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '1vh',
                  border: '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: '#fafafa',
                }}
              >
                <Typography variant="subtitle1" sx={{ color: '#666' }}>
                  No active alarms found.
                </Typography>
              </Box>
            )}
          </Grid>

          <TrapDetailsDialog
            open={!!openModel}
            onClose={() => setOpenModel(false)}
            popUpDataRow={popUpDataRow}
          />
        </Main>
      </Box>
    </div>
  );
}

