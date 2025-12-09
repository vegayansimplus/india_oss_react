// // by default 24 hour data 
// import { useState, useEffect, useMemo } from 'react';
// import { styled } from '@mui/material/styles';
// import Box from '@mui/material/Box';
// import Drawer from '@mui/material/Drawer';
// import CssBaseline from '@mui/material/CssBaseline';
// import IconButton from '@mui/material/IconButton';
// import Divider from '@mui/material/Divider';
// import MenuIcon from '@mui/icons-material/Menu';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// import { useTheme } from '@mui/material/styles';
// import { DynamicTableRow } from '../../store/types';
// import DateTimeRangeCompact from '../../components/common/DateTimeRangeCompact';
// import { Button, Grid } from '@mui/material';
// import TrapDetailsDialog from '../../components/faults/active/faults/TrapDetailsDialog';
// import { getNow, getYesterday } from '../../components/common/CurrentDateTimeOneDayDiff';
// import dayjs from 'dayjs';
// import axiosClient from '../../utils/axiosData/axioxClient';
// import { FETCH_HISTORICAL_FAULTS_TABLE_DATA } from '../../utils/axiosData/apis';
// import AlarmSummaryCardsInsideSidebar from '../../components/faults/active/faults/AlarmSummaryCardSidebar';
// import HistoricFaultTableForSidebar from '../../components/faults/active/HistoricFaultTableForSidebar';

// /* ===== Layout constants ===== */
// const drawerWidth = '20vw';
// const TOP_OFFSET = '5vh';
// const TABLE_MAX_HEIGHT = 'calc(100vh - 18vh)';

// const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
//   open?: boolean;
// }>(({ theme, open }) => ({
//   boxSizing: 'border-box',
//   minHeight: `calc(100vh - ${TOP_OFFSET})`,
//   paddingTop: `calc(${TOP_OFFSET} + ${theme.spacing(1)})`,
//   marginLeft: open ? 0 : 0,
//   width: '100%',
//   overflowX: 'hidden',
//   transition: theme.transitions.create(['margin-left', 'width'], {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.enteringScreen,
//   }),
// }));

// const DrawerHeader = styled('div')(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'flex-end',
//   padding: theme.spacing(1),
// }));

// type SeriesPoint = { time: Date; value: number };
// type Series = { name: string; data: SeriesPoint[] };

// function mapSeverity(s?: string) {
//   const u = (s ?? '').toUpperCase();
//   if (u === 'CRI' || u === 'CRITICAL') return 'Critical';
//   if (u === 'MAJ' || u === 'MAJOR') return 'Major';
//   if (u === 'MIN' || u === 'MINOR' || u === 'MINORWARN') return 'Minor';
//   if (u === 'WARN' || u === 'WARNING') return 'Warning';
//   if (u === 'INFO' || u === 'INFORMATIONAL') return 'Info';
//   if (u === 'CLEAR' || u === 'CLEARED') return 'Clear';
//   return s ?? '';
// }

// /**
//  * dto -> row: all date-time fields are used AS-IS from backend
//  */
// const dtoToRow = (dto: any): DynamicTableRow => {
//   const recTimeRaw = dto.rec_time ?? '';
//   const ackTimeRaw = dto.ack_time ?? '';
//   const clearTimeRaw = dto.clear_time ?? '';
//   const updateTimeRaw = dto.update_time ?? '';
//   const insertionTimeRaw = dto.insertion_time ?? '';

//   return {
//     Adapter: dto.adapaterName ?? dto.clientType ?? '',
//     Severity: mapSeverity(dto.severity),
//     Alarm: dto.traptype ?? '',
//     Client: dto.clientType ?? '',
//     Technology: dto.vendor ?? '',
//     'Device Name': dto.nodename ?? '',
//     Source: dto.senderip ?? '',
//     'Port Name': dto.ifdesc ?? '',
//     'No.Services_Affected': dto.numberOfServiceAffecting ?? '',
//     'Device Type': dto.nodetype ?? '',

//     // DATE-TIME FIELDS: AS-IS FROM RESPONSE
//     'NMS Received Time': recTimeRaw,
//     Description: dto.desc ?? '',
//     'Ack Status': dto.ack_stat ?? '',
//     'Ack Time': ackTimeRaw,
//     'Ack Msg': dto.ack_msg ?? '',
//     'Ack User': dto.ack_user ?? '',
//     'Clear Msg': dto.clear_msg ?? '',
//     'Clear User': dto.clear_user ?? '',
//     'Object Ref': dto.ref ?? '',
//     'Trap Source': dto.trpsource ?? '',
//     'Update Time': updateTimeRaw,
//     'OSS Insertion Time': insertionTimeRaw,
//     'Clear Time': clearTimeRaw,
//     'Internal TicketId': dto.trapid ?? '',
//     'Alarm Id': dto.alarmid ?? '',
//     'External TicketId': dto.ticket ?? '',

//     __trapid: dto.trapid ?? '',
//     __adapaterName: dto.adapaterName ?? '',
//     __vendor: dto.vendor ?? '',
//     // keep raw rec_time for dialogs/graphs as well
//     __rec_time: recTimeRaw,
//   };
// };

// /* ===== Component ===== */
// export default function HistoricalFaultsTest() {
//   const theme = useTheme();
//   const [open, setOpen] = useState(false);

//   const handleToggle = () => setOpen((v) => !v);
//   const handleDrawerClose = () => setOpen(false);

//   const [openModel, setOpenModel] = useState(false);
//   const [trapSelected, setTrapSelected] = useState<string[]>([]);
//   const [tableData, setTableData] = useState<DynamicTableRow[]>([]);
//   const [finalFilteredData, setFinalFilteredData] = useState<DynamicTableRow[]>([]);
//   const [alarmSeveritySelected, setAlarmSeveritySelected] = useState<string>('ALL');
//   const [alarmSourceSelected, setAlarmSourceSelected] = useState<string>('ALL');
//   const [popUpDataRow, setPopUpDataRow] = useState<DynamicTableRow | null>(null);
//   const [viewGraph, setViewGraph] = useState<boolean>(false);
//   const [fav, setFav] = useState(false);

//   const today = getNow();
//   const yesterday = getYesterday();
//   const [fromDate, setFromDate] = useState<Date | null>(yesterday);
//   const [toDate, setToDate] = useState<Date | null>(today);

//   const ALARM_SEVERITIES = ['Critical', 'Major', 'Minor'] as const;
//   const PRESET_SOURCES = ['MCP', 'NEC'] as const;

//   // API load
//   const fetchHistoricalGata = async () => {
//     try {
//       const formattedFrom = dayjs(fromDate).format('YYYY-MM-DD HH:mm:ss');
//       const formattedTo = dayjs(toDate).format('YYYY-MM-DD HH:mm:ss');

//       console.log('from:', formattedFrom);
//       console.log('to:', formattedTo);

//       const res = await axiosClient.get(FETCH_HISTORICAL_FAULTS_TABLE_DATA, {
//         params: {
//           intraptype: 'ALL',
//           startDate: formattedFrom,
//           endDate: formattedTo,
//         },
//       });

//       if (res.status === 200) {
//         console.log('row raw data hist: ', res.data.slice(0, 5));
//         const rowsDTO = (res.data ?? []) as any[];
//         const rows = rowsDTO.map(dtoToRow);
//         setTableData(rows);
//         setFinalFilteredData(rows);
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   // initial load
//   useEffect(() => {
//     fetchHistoricalGata();
//   }, []);

//   function normalizeSeverity(s: string) {
//     const u = s?.toUpperCase?.() ?? '';
//     if (u === 'MINORWARN' || u === 'MINOR') return 'Minor';
//     if (u === 'MAJOR') return 'Major';
//     if (u === 'CRITICAL') return 'Critical';
//     if (u === 'WARNING' || u === 'WARN') return 'Warning';
//     if (u === 'INFO' || u === 'INFORMATIONAL') return 'Info';
//     if (u === 'CLEAR' || u === 'CLEARED') return 'Clear';
//     return s || '';
//   }

//   const norm = (v?: string | null) => (v ?? '').toString().trim();
//   const up = (v?: string | null) => norm(v).toUpperCase();

//   function groupByAdapterAndSeverity(rows: DynamicTableRow[]) {
//     const result: Record<string, Record<string, number>> = {};
//     for (const src of PRESET_SOURCES) {
//       result[src] = {};
//       for (const sev of ALARM_SEVERITIES) result[src][sev] = 0;
//     }

//     for (const r of rows) {
//       const Adapter = up(r['Adapter'] as string) || 'UNKNOWN';
//       const sevNorm = normalizeSeverity((r['Severity'] as string) ?? '');
//       if (!result[Adapter]) {
//         result[Adapter] = {};
//         for (const s of ALARM_SEVERITIES) result[Adapter][s] = 0;
//       }
//       if ((ALARM_SEVERITIES as readonly string[]).includes(sevNorm)) {
//         result[Adapter][sevNorm] = (result[Adapter][sevNorm] ?? 0) + 1;
//       }
//     }
//     return result;
//   }

//   const defaultVisibleColumns = [
//     'Adapter',
//     'Severity',
//     'Alarm',
//     'Technology',
//     'Device Name',
//     'Source',
//     'Port Name',
//     'No.Services_Affected',
//     'Description',
//     'Ack Time',
//     'Ack Msg',
//     'Ack User',
//     'Clear Msg',
//     'Clear User',
//     'NMS Received Time',
//     'Clear Time',
//     'OSS Insertion Time',
//     'Internal TicketId',
//   ];

//   const columnOrder = [
//     'Adapter',
//     'Severity',
//     'Alarm',
//     'Client',
//     'Technology',
//     'Device Name',
//     'Source',
//     'Device Type',
//     'Port Name',
//     'No.Services_Affected',
//     'Description',
//     'Ack Status',
//     'Ack Time',
//     'Ack Msg',
//     'Ack User',
//     'Clear Msg',
//     'Clear User',
//     'Object Ref',
//     'Trap Source',
//     'NMS Received Time',
//     'Update Time',
//     'Clear Time',
//     'OSS Insertion Time',
//     'Alarm Id',
//     'Internal TicketId',
//     'External TicketId',
//   ];

//   function buildBarDataset(rows: DynamicTableRow[]) {
//     const grouped = groupByAdapterAndSeverity(rows);
//     const header = ['Adapter', ...ALARM_SEVERITIES];
//     const Adapters = [
//       ...PRESET_SOURCES,
//       ...Object.keys(grouped).filter((a) => !PRESET_SOURCES.includes(a as any)),
//     ];
//     const body = Adapters.map((Adapter) => {
//       const sevMap = grouped[Adapter] || {};
//       return [Adapter, ...ALARM_SEVERITIES.map((s) => sevMap[s] ?? 0)];
//     });
//     return [header, ...body];
//   }

//   function buildSeverityTrend(
//     rows: DynamicTableRow[],
//     minutesWindow = 10,
//     severities: readonly string[] = ['Critical', 'Major', 'Minor']
//   ): Series[] {
//     const now = new Date();
//     const buckets: Date[] = Array.from({ length: minutesWindow }, (_, i) => {
//       const t = new Date(now);
//       t.setSeconds(0, 0);
//       t.setMinutes(t.getMinutes() - (minutesWindow - 1 - i));
//       return t;
//     });

//     const first = buckets[0].getTime();
//     const last = buckets[buckets.length - 1].getTime();

//     const countMap: Record<number, Record<string, number>> = {};
//     for (const b of buckets) {
//       countMap[b.getTime()] = {};
//       for (const s of severities) countMap[b.getTime()][s] = 0;
//     }

//     for (const r of rows) {
//       // if you want to base this on NMS Received Time, you can also use r['NMS Received Time']
//       const tsRaw = (r['Received Time'] as string) || (r['NMS Received Time'] as string);
//       if (!tsRaw) continue;
//       const ts = new Date(tsRaw);
//       if (isNaN(ts.getTime())) continue;

//       const snapped = new Date(ts);
//       snapped.setSeconds(0, 0);
//       const key = snapped.getTime();
//       if (key < first || key > last) continue;

//       const sevNorm = normalizeSeverity(r['Severity'] as string);
//       if ((severities as readonly string[]).includes(sevNorm)) {
//         countMap[key][sevNorm] = (countMap[key][sevNorm] ?? 0) + 1;
//       }
//     }

//     const series: Series[] = severities.map((s) => ({
//       name: s,
//       data: buckets.map((b) => ({ time: b, value: countMap[b.getTime()][s] ?? 0 })),
//     }));

//     return series;
//   }

//   useEffect(() => {
//     let filtered = [...tableData];
//     if (alarmSeveritySelected !== 'ALL') {
//       filtered = filtered.filter(
//         (row) =>
//           normalizeSeverity(norm(row['Severity'] as string)) ===
//           alarmSeveritySelected
//       );
//     }
//     if (alarmSourceSelected !== 'ALL') {
//       filtered = filtered.filter(
//         (row) => up(row['Adapter'] as string) === alarmSourceSelected
//       );
//     }
//     if (trapSelected.length > 0) {
//       filtered = filtered.filter((row) =>
//         trapSelected.includes(norm(row['Alarm'] as string))
//       );
//     }
//     setFinalFilteredData(filtered);
//   }, [tableData, alarmSeveritySelected, alarmSourceSelected, trapSelected]);

//   const barData = useMemo(() => buildBarDataset(finalFilteredData), [finalFilteredData]);
//   const severitySeriesData = useMemo(
//     () => buildSeverityTrend(finalFilteredData, 10, ['Critical', 'Major', 'Minor']),
//     [finalFilteredData]
//   );

//   return (
//     <div
//       style={{
//         backgroundColor: '#fff',
//         minHeight: '100vh',
//         maxWidth: '100vw',
//         width: '100vw',
//         // overflow: 'hidden',
//         overflowX: 'hidden',
//         overflowY: 'auto',
//       }}
//     >
//       <Box sx={{ display: 'flex', width: '100%' }}>
//         <CssBaseline />

//         {/* Floating toggle button */}
//         <IconButton
//           onClick={handleToggle}
//           aria-label="toggle menu"
//           sx={{
//             position: 'fixed',
//             top: `calc(${TOP_OFFSET} + 2px)`,
//             left: 12,
//             zIndex: (t) => t.zIndex.drawer + 2,
//             bgcolor: 'white',
//             border: '1px solid rgba(0,0,0,0.12)',
//             boxShadow: 1,
//             '&:hover': { bgcolor: 'white' },
//           }}
//           size="small"
//         >
//           <MenuIcon />
//         </IconButton>

//         {/* Persistent Drawer */}
//         <Drawer
//           variant="persistent"
//           anchor="left"
//           open={open}
//           sx={{
//             width: open ? drawerWidth : 0,
//             flexShrink: 0,
//             '& .MuiDrawer-paper': {
//               width: drawerWidth,
//               boxSizing: 'border-box',
//               position: 'fixed',
//               top: TOP_OFFSET,
//               height: `calc(100vh - ${TOP_OFFSET})`,
//             },
//           }}
//         >
//           <DrawerHeader>
//             <IconButton onClick={handleDrawerClose}>
//               {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
//             </IconButton>
//           </DrawerHeader>
//           <Divider />
//           <Grid container spacing={1}>
//             <AlarmSummaryCardsInsideSidebar
//               tableData={tableData}
//               alarmSeveritySelected={alarmSeveritySelected}
//               setAlarmSeveritySelected={setAlarmSeveritySelected}
//               alarmSourceSelected={alarmSourceSelected}
//               setAlarmSourceSelected={setAlarmSourceSelected}
//             />
//           </Grid>
//           <Divider />
//         </Drawer>

//         {/* Main content */}
//         <Main open={open} sx={{ p: '1vh' }}>
//           <Grid container spacing={1} display="flex" justifyContent="flex-end">
//             <Box
//             sx={{fontSize: '1.0vw', fontWeight: '700', mt: '2.5vh', mr: '9vw'}}
//             >INDIA Historic Faults</Box>
//             <Grid size={{ xs: 12, md: 4 }} container spacing={1} sx={{ mt: '1vh' }}>
//               <DateTimeRangeCompact
//                 fromDate={fromDate}
//                 toDate={toDate}
//                 onChange={({ from, to }) => {
//                   setFromDate(from);
//                   setToDate(to);
//                 }}
//                 sx={{ mt: '0.3vh', width: '100%' }}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, md: 1 }}>
//               <Button
//                 fullWidth
//                 sx={{
//                   backgroundColor: '#990033',
//                   ':hover': { backgroundColor: '#990033' },
//                   fontSize: '0.8vw',
//                   color: '#ffffff',
//                   mt: '2.0vh',
//                   height: '4vh',
//                 }}
//                 onClick={fetchHistoricalGata}
//               >
//                 View
//               </Button>
//             </Grid>
//           </Grid>

//           <Grid size={{ xs: 12, md: 6 }} sx={{ borderRadius: 3, mt: 0.5 }}>
//             <HistoricFaultTableForSidebar
            
//               defaultVisibleColumns={defaultVisibleColumns}
//               columnOrder={columnOrder}
//               dataObjects={finalFilteredData}
//               pageSize={100}
//               viewGraph={viewGraph}
//               setViewGraph={setViewGraph}
//               onRowClick={(row) => {
//                 setPopUpDataRow(row);
//                 setOpenModel(true);
//               }}
//             />
//           </Grid>

//           <TrapDetailsDialog
//             open={openModel}
//             onClose={() => setOpenModel(false)}
//             popUpDataRow={popUpDataRow}
//           />
//         </Main>
//       </Box>
//     </div>
//   );
// }

// by default 1 hour data now
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
import DateTimeRangeCompact from '../../components/common/DateTimeRangeCompact';
import { Button, Grid } from '@mui/material';
import TrapDetailsDialog from '../../components/faults/active/faults/TrapDetailsDialog';
import { getNow, getOneHourAgo } from '../../components/common/CurrentDateTimeOneDayDiff';
import dayjs from 'dayjs';
import axiosClient from '../../utils/axiosData/axioxClient';
import { FETCH_HISTORICAL_FAULTS_TABLE_DATA } from '../../utils/axiosData/apis';
import AlarmSummaryCardsInsideSidebar from '../../components/faults/active/faults/AlarmSummaryCardSidebar';
import HistoricFaultTableForSidebar from '../../components/faults/active/HistoricFaultTableForSidebar';

/* ===== Layout constants ===== */
const drawerWidth = '20vw';
const TOP_OFFSET = '5vh';
const TABLE_MAX_HEIGHT = 'calc(100vh - 18vh)';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  boxSizing: 'border-box',
  minHeight: `calc(100vh - ${TOP_OFFSET})`,
  paddingTop: `calc(${TOP_OFFSET} + ${theme.spacing(1)})`,
  marginLeft: open ? 0 : 0,
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

type SeriesPoint = { time: Date; value: number };
type Series = { name: string; data: SeriesPoint[] };

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

/**
 * dto -> row: all date-time fields are used AS-IS from backend
 */
const dtoToRow = (dto: any): DynamicTableRow => {
  const recTimeRaw = dto.rec_time ?? '';
  const ackTimeRaw = dto.ack_time ?? '';
  const clearTimeRaw = dto.clear_time ?? '';
  const updateTimeRaw = dto.update_time ?? '';
  const insertionTimeRaw = dto.insertion_time ?? '';

  return {
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

    // DATE-TIME FIELDS: AS-IS FROM RESPONSE
    'NMS Received Time': recTimeRaw,
    Description: dto.desc ?? '',
    'Ack Status': dto.ack_stat ?? '',
    'Ack Time': ackTimeRaw,
    'Ack Msg': dto.ack_msg ?? '',
    'Ack User': dto.ack_user ?? '',
    'Clear Msg': dto.clear_msg ?? '',
    'Clear User': dto.clear_user ?? '',
    'Object Ref': dto.ref ?? '',
    'Trap Source': dto.trpsource ?? '',
    'Update Time': updateTimeRaw,
    'OSS Insertion Time': insertionTimeRaw,
    'Clear Time': clearTimeRaw,
    'Internal TicketId': dto.trapid ?? '',
    'Alarm Id': dto.alarmid ?? '',
    'External TicketId': dto.ticket ?? '',

    __trapid: dto.trapid ?? '',
    __adapaterName: dto.adapaterName ?? '',
    __vendor: dto.vendor ?? '',
    // keep raw rec_time for dialogs/graphs as well
    __rec_time: recTimeRaw,
  };
};

/* ===== Component ===== */
export default function HistoricalFaultsTest() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleToggle = () => setOpen((v) => !v);
  const handleDrawerClose = () => setOpen(false);

  const [openModel, setOpenModel] = useState(false);
  const [trapSelected, setTrapSelected] = useState<string[]>([]);
  const [tableData, setTableData] = useState<DynamicTableRow[]>([]);
  const [finalFilteredData, setFinalFilteredData] = useState<DynamicTableRow[]>([]);
  const [alarmSeveritySelected, setAlarmSeveritySelected] = useState<string>('ALL');
  const [alarmSourceSelected, setAlarmSourceSelected] = useState<string>('ALL');
  const [popUpDataRow, setPopUpDataRow] = useState<DynamicTableRow | null>(null);
  const [viewGraph, setViewGraph] = useState<boolean>(false);
  const [fav, setFav] = useState(false);

  // NEW: loading + fetch state
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  // NEW: default 1 hour range
  const now = getNow();
  const oneHourAgo = getOneHourAgo();
  const [fromDate, setFromDate] = useState<Date | null>(oneHourAgo);
  const [toDate, setToDate] = useState<Date | null>(now);

  const ALARM_SEVERITIES = ['Critical', 'Major', 'Minor'] as const;
  const PRESET_SOURCES = ['MCP', 'NEC'] as const;

  // API load
  const fetchHistoricalGata = async () => {
    try {
      setIsLoading(true);

      const formattedFrom = dayjs(fromDate).format('YYYY-MM-DD HH:mm:ss');
      const formattedTo = dayjs(toDate).format('YYYY-MM-DD HH:mm:ss');

      console.log('from:', formattedFrom);
      console.log('to:', formattedTo);

      const res = await axiosClient.get(FETCH_HISTORICAL_FAULTS_TABLE_DATA, {
        params: {
          intraptype: 'ALL',
          startDate: formattedFrom,
          endDate: formattedTo,
        },
      });

      if (res.status === 200) {
        console.log('row raw data hist: ', res.data.slice(0, 5));
        const rowsDTO = (res.data ?? []) as any[];
        const rows = rowsDTO.map(dtoToRow);
        setTableData(rows);
        setFinalFilteredData(rows);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setHasFetchedOnce(true);
    }
  };

  // initial load
  useEffect(() => {
    fetchHistoricalGata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const norm = (v?: string | null) => (v ?? '').toString().trim();
  const up = (v?: string | null) => norm(v).toUpperCase();

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
      const tsRaw = (r['Received Time'] as string) || (r['NMS Received Time'] as string);
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
      data: buckets.map((b) => ({ time: b, value: countMap[b.getTime()][s] ?? 0 })),
    }));

    return series;
  }

  useEffect(() => {
    let filtered = [...tableData];
    if (alarmSeveritySelected !== 'ALL') {
      filtered = filtered.filter(
        (row) =>
          normalizeSeverity(norm(row['Severity'] as string)) === alarmSeveritySelected,
      );
    }
    if (alarmSourceSelected !== 'ALL') {
      filtered = filtered.filter((row) => up(row['Adapter'] as string) === alarmSourceSelected);
    }
    if (trapSelected.length > 0) {
      filtered = filtered.filter((row) =>
        trapSelected.includes(norm(row['Alarm'] as string)),
      );
    }
    setFinalFilteredData(filtered);
  }, [tableData, alarmSeveritySelected, alarmSourceSelected, trapSelected]);

  const barData = useMemo(() => buildBarDataset(finalFilteredData), [finalFilteredData]);
  const severitySeriesData = useMemo(
    () => buildSeverityTrend(finalFilteredData, 10, ['Critical', 'Major', 'Minor']),
    [finalFilteredData],
  );

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

        {/* Persistent Drawer */}
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

        {/* Main content */}
        <Main open={open} sx={{ p: '1vh' }}>
          <Grid container spacing={1} display="flex" justifyContent="flex-end">
            <Box
              sx={{
                fontSize: '1.0vw',
                fontWeight: '700',
                mt: '2.5vh',
                mr: '9vw',
              }}
            >
              INDIA Historic Faults
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
                onClick={fetchHistoricalGata}
              >
                View
              </Button>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} sx={{ borderRadius: 3, mt: 0.5 }}>
            <HistoricFaultTableForSidebar
              defaultVisibleColumns={defaultVisibleColumns}
              columnOrder={columnOrder}
              dataObjects={finalFilteredData}
              pageSize={100}
              viewGraph={viewGraph}
              setViewGraph={setViewGraph}
              isLoading={isLoading}
              hasFetchedOnce={hasFetchedOnce}
              onRowClick={(row) => {
                setPopUpDataRow(row);
                setOpenModel(true);
              }}
            />
          </Grid>

          <TrapDetailsDialog
            open={openModel}
            onClose={() => setOpenModel(false)}
            popUpDataRow={popUpDataRow}
          />
        </Main>
      </Box>
    </div>
  );
}
