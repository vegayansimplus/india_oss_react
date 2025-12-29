// import React, { useEffect, useState, useMemo } from 'react';
// import { Box, Button, Tooltip } from '@mui/material';
// import { MaterialReactTable, MRT_ColumnDef, MRT_RowSelectionState,} from 'material-react-table';
// import StarBorderIcon from '@mui/icons-material/StarBorder';
// import { DynamicTableRow } from '../../../../store/types';
// import ClearTrap from './ClearTrap';
// import { useSnackbar } from '../../../common/SnackbarProvider';
// import AcknowledgeTrap from './AcknowledgeTrap';
// import ExcelDownloadButton from '../../../common/ExcelDownloadButton';
// import LoadingBox from '../../../common/LoadingBox';
// import CommonDialog from '../../../common/CommonDialog.';
// import Dialog from '@mui/material/Dialog';
// import TicketingPageTest from '../../../../pages/Faults/TicketingPageTest';
// import AddToFavContent from './AddToFav';

// type ApplyPayload = {
//   groupIds: string[];
//   adapters: string[];
//   trapTypes: string[];
// };

// interface CommonTableProps {
//   isLoading?: boolean;
//   columnOrder: string[];
//   dataObjects: Record<string, any>[];
//   viewGraph: boolean;
//   setViewGraph: (viewGraph: boolean) => void;
//   pageSize?: number;
//   onRowClick?: (row: Record<string, any>) => void;
//   defaultVisibleColumns?: string[];
//   isActiveTab?: boolean;
//   tableId?: string;
//   highlightPredicate?: (row: DynamicTableRow) => boolean;

//   // drawer info for fullscreen adjust
//   drawerOpen?: boolean;
//   drawerWidthCss?: string;
// }

// const LOCALSTORAGE_PREFIX = 'visible_columns_map_';

// const ActiveFaultsTableForSidebar: React.FC<CommonTableProps> = ({
//   columnOrder,
//   dataObjects,
//   pageSize = 10,
//   viewGraph,
//   setViewGraph,
//   onRowClick,
//   defaultVisibleColumns,
//   isLoading,
//   isActiveTab = false,
//   highlightPredicate,
//   tableId = 'active-faults-table',
//   drawerOpen = false,
//   drawerWidthCss = '20vw',
// }) => {
//   const { showMessage } = useSnackbar();

//   const normalize = (s: any) => String(s ?? '').trim().toUpperCase();

//   const [allRows, setAllRows] = useState<Record<string, any>[]>([]);
//   const [rows, setRows] = useState<Record<string, any>[]>([]);
//   const [adaptersForFilter, setAdaptersForFilter] = useState<Set<string>>(new Set());
//   const [alarmsForFilter, setAlarmsForFilter] = useState<Set<string>>(new Set());

//   // Ticketing dialog open/close
//   const [openTicketing, setOpenTicketing] = useState(false);

//   // dataObjects + fav filters se effective rows bana ke state me daalo
//   useEffect(() => {
//     const filtered = dataObjects.filter((r) => {
//       const a = normalize(r['Adapter']);
//       const t = normalize(r['Alarm']);
//       const adapterOk =
//         adaptersForFilter.size === 0 || adaptersForFilter.has(a);
//       const trapOk = alarmsForFilter.size === 0 || alarmsForFilter.has(t);
//       return adapterOk && trapOk;
//     });
//     setAllRows(filtered ?? []);
//     setRows(filtered ?? []);
//   }, [dataObjects, adaptersForFilter, alarmsForFilter]);

//   const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
//   const [selectedRows, setSelectedRows] = useState<DynamicTableRow[]>([]);
//   const [openModel, setOpenModel] = useState(false);
//   const [modelContent, setModelContent] = useState<'clear' | 'ack' | 'fav'>();

//   // when this key changes, table remounts
//   const [tableResetKey, setTableResetKey] = useState(0);

//   /* ========= COLUMN VISIBILITY LOGIC ========= */

//   // 1) clear old Local Storage on mount
//   useEffect(() => {
//     try {
//       const key = `${LOCALSTORAGE_PREFIX}${tableId}`;
//       if (localStorage.getItem(key)) {
//         localStorage.removeItem(key);
//       }
//     } catch (e) {
//       console.error('Failed to clear old column visibility from localStorage', e);
//     }
//   }, [tableId]);

//   // 2) defaults from array
//   const buildVisibilityFromDefaults = (): Record<string, boolean> => {
//     const visibleSet = new Set(defaultVisibleColumns ?? columnOrder);
//     const visibility: Record<string, boolean> = {};

//     columnOrder.forEach((col) => {
//       visibility[col] = visibleSet.has(col);
//     });

//     return visibility;
//   };

//   const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
//     () => buildVisibilityFromDefaults()
//   );

//   // 3) persist to localStorage on change
//   useEffect(() => {
//     try {
//       const key = `${LOCALSTORAGE_PREFIX}${tableId}`;
//       localStorage.setItem(key, JSON.stringify(columnVisibility));
//     } catch (e) {
//       console.error('Failed to persist column visibility', e);
//     }
//   }, [columnVisibility, tableId]);

//   // 4) if columnOrder or defaultVisibleColumns change, recalc visibility
//   useEffect(() => {
//     setColumnVisibility((prev) => {
//       const visibleSet = new Set(defaultVisibleColumns ?? columnOrder);
//       const next: Record<string, boolean> = {};

//       columnOrder.forEach((col) => {
//         if (typeof prev[col] === 'boolean') {
//           next[col] = prev[col];
//         } else {
//           next[col] = visibleSet.has(col);
//         }
//       });

//       return next;
//     });
//   }, [columnOrder, defaultVisibleColumns]);

//   /* ========= END COLUMN VISIBILITY ========= */

//   const initialColumnSizes: Record<string, number> = {
//     Adapter: 110,
//     Severity: 100,
//     Alarm: 160,
//     Client: 140,
//     Technology: 140,
//     'Device Name': 180,
//     Source: 150,
//     'Port Name': 150,
//     'No.Services_Affected': 200,
//     Description: 360,
//     'Ack Time': 180,
//     'Ack Msg': 200,
//     'Ack User': 130,
//     'Clear Msg': 160,
//     'Clear User': 170,
//     'NMS Received Time': 210,
//     'OSS Insertion Time': 210,
//     'Internal TicketId': 180,
//     'Clear Time': 180,
//   };

//   const AdapterBadge = (raw?: string) => {
//     const val = (raw ?? '').trim().toUpperCase();
//     const bg =
//       val === 'MCP'
//         ? '#009688 !important'
//         : val === 'NFMT'
//         ? '#8283eb !important'
//         : '#607D8B';
//     return (
//       <Box
//         sx={{
//           px: 1.2,
//           py: 0.2,
//           lineHeight: 1.6,
//           bgcolor: bg,
//           color: '#fff',
//           display: 'inline-flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           borderRadius: '10px',
//           fontSize: '0.72rem',
//           fontWeight: 700,
//           minWidth: 64,
//           textTransform: 'uppercase',
//         }}
//       >
//         {val || 'NA'}
//       </Box>
//     );
//   };

//   const sevBadge = (raw?: string) => {
//     const s = (raw ?? '').trim().toUpperCase();
//     const map = {
//       CRITICAL: { bg: '#E53935', fg: '#FFFFFF', letter: 'c' },
//       MAJOR: { bg: '#FB8C00', fg: '#FFFFFF', letter: 'M' },
//       MINOR: { bg: '#FDD835', fg: '#FFFFFF', letter: 'm' },
//       MINORWARN: { bg: '#FDD835', fg: '#FFFFFF', letter: 'm' },
//       WARNING: { bg: '#FFD54F', fg: '#333333', letter: 'w' },
//       WARN: { bg: '#FFD54F', fg: '#333333', letter: 'w' },
//     } as const;
//     const conf = (map as any)[s] ?? { bg: '#BDBDBD', fg: '#FFFFFF', letter: '•' };
//     return (
//       <Box
//         component="span"
//         sx={{
//           display: 'inline-flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           width: 19,
//           height: 19,
//           bgcolor: conf.bg,
//           color: conf.fg,
//           borderRadius: '50%',
//           fontSize: '0.65rem',
//           fontWeight: 700,
//         }}
//         aria-label={s}
//       >
//         {conf.letter}
//       </Box>
//     );
//   };

//   // MRT columns – memoized
//   const columns: MRT_ColumnDef<any>[] = useMemo(
//     () =>
//       columnOrder.map((col) => {
//         const isCorePinned =
//           col === 'Adapter' || col === 'Severity' || col === 'Alarm';

//         const base: MRT_ColumnDef<any> = {
//           accessorFn: (row) => row[col],
//           id: col,
//           header: col,
//           size: initialColumnSizes[col] ?? 140,
//           enablePinning: isCorePinned,
//           enableColumnDragging: !isCorePinned,
//         };

//         // Helper: row highlighted hai ya nahi
//         const getIsHighlighted = (rowOriginal: any) =>
//           highlightPredicate?.(rowOriginal as DynamicTableRow) ?? false;

//         // ------------ Alarm column ------------
//         // if (col === 'Alarm') {
//         //   base.Cell = ({ cell, row }) => {
//         //     const isHighlighted = getIsHighlighted(row.original);
//         //     return (
//         //       <Box
//         //         sx={{
//         //           width: '100%',
//         //           height: '100%',
//         //           display: 'flex',
//         //           alignItems: 'center',
//         //           px: 0.5,
//         //           ...(isHighlighted && {
//         //             backgroundColor: '#92c6ebff',
//         //             borderRadius: '2px',
//         //           }),
//         //            '&:hover': {
//         //             backgroundColor: onRowClick ? '#e3f2fd !important' : 'inherit',
//         //           },
//         //         }}
//         //       >
//         //         {cell.getValue<string>()}
//         //       </Box>
//         //     );
//         //   };
//         // }
//         if (col === 'Alarm') {
//         // make cell flex container 
//         base.muiTableBodyCellProps = {
//           sx: {
//             display: 'flex',
//             alignItems: 'stretch',
//             p: 0, // global padding override
//             borderRight: '1px solid grey',
//             fontSize: '0.7rem',
//             whiteSpace: 'nowrap',
//           },
//         };

//         base.Cell = ({ cell, row }) => {
//           const isHighlighted = getIsHighlighted(row.original);
//           return (
//             <Box
//               sx={{
//                 flex: 1,
//                 width: '100%',
//                 height: '100%',
//                 display: 'flex',
//                 alignItems: 'center',
//                 px: 0.5,
//                 ...(isHighlighted && {
//                   backgroundColor: '#92c6ebff',
//                   borderRadius: '2px',
//                 }),
//                 '&:hover': {
//                   backgroundColor: onRowClick ? '#e3f2fd !important' : 'inherit',
//                 },
//               }}
//             >
//               {cell.getValue<string>()}
//             </Box>
//           );
//         };
//       }
//         // ------------ Adapter column ------------
//         if (col === 'Adapter') {
//           base.Cell = ({ cell, row }) => {
//             const isHighlighted = getIsHighlighted(row.original);
//             return (
//               <Box
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 0.6,
//                   ...(isHighlighted && {
//                     backgroundColor: '#e3f2fd', // same as row highlight
//                     borderRadius: '2px',
//                   }),
//                 }}
//               >
//                 {AdapterBadge(cell.getValue<string>())}
//               </Box>
//             );
//           };
//           base.enableSorting = false;
//           base.muiTableBodyCellProps = {
//             align: 'center' as const,
//           };
//         }

//         // ------------ Severity column ------------
//         if (col === 'Severity') {
//           base.Cell = ({ cell }) => (
//             <Box sx={{ display: 'flex', justifyContent: 'center' }}>
//               <Tooltip title={(cell.getValue<string>() ?? '').toString()}>
//                 <span>{sevBadge(cell.getValue<string>())}</span>
//               </Tooltip>
//             </Box>
//           );
//           base.enableSorting = false;
//           base.muiTableBodyCellProps = { align: 'center' as const };
//         }

//         return base;
//       }),
//     [columnOrder, highlightPredicate]
//   );

//   const applyGroupFilter = (payload: ApplyPayload) => {
//     const adapterSet = new Set(payload.adapters.map((a) => a.toUpperCase()));
//     const trapSet = new Set(payload.trapTypes.map((t) => t.toUpperCase()));

//     setAdaptersForFilter(new Set(adapterSet));
//     setAlarmsForFilter(new Set(trapSet));

//     const filtered = allRows.filter((r) => {
//       const a = normalize(r['Adapter']);
//       const t = normalize(r['Alarm']);
//       const adapterOk = adapterSet.size === 0 || adapterSet.has(a);
//       const trapOk = trapSet.size === 0 || trapSet.has(t);
//       return adapterOk && trapOk;
//     });

//     setRows(filtered);
//     setRowSelection({});
//     setSelectedRows([]);
//   };

//   const clearGroupFilter = () => {
//     setAdaptersForFilter(new Set());
//     setAlarmsForFilter(new Set());
//     setRows(allRows);
//     setSelectedRows([]);
//     setTableResetKey((k) => k + 1);
//   };

//   // orderedData memoized
//   const orderedData = useMemo(
//     () =>
//       rows.map((obj) =>
//         columnOrder.reduce((acc, key) => {
//           acc[key] = obj[key] ?? '';
//           return acc;
//         }, {} as Record<string, any>)
//       ),
//     [rows, columnOrder]
//   );

//   const onAckDone = () => {
//     setOpenModel(false);
//     showMessage('Selected traps acknowledged successfully.', 'success');
//     setSelectedRows([]);
//     setTableResetKey((k) => k + 1);
//   };

//   const onClearDone = () => {
//     setOpenModel(false);
//     showMessage('Selected traps cleared successfully.', 'success');
//     setSelectedRows([]);
//     setTableResetKey((k) => k + 1);
//   };

//   // pin order
//   const leftPinnedColumns = isActiveTab
//     ? ['mrt-row-select', 'Adapter', 'Severity', 'Alarm']
//     : ['Adapter', 'Severity', 'Alarm'];

//   const showLoading = !dataObjects || dataObjects.length === 0;

//   return (
//     <Box
//       sx={{
//         p: 0,
//         m: 0,
//         borderRadius: 2,
//         border: 1,
//         height: viewGraph ? '55.98vh' : '92vh',
//       }}
//     >
//       {showLoading ? (
//         <LoadingBox isLoading={isLoading} />
//       ) : (
//         <>
//           <MaterialReactTable
//             key={tableResetKey}
//             columns={columns}
//             data={orderedData}
//             enableHiding
//             enableGlobalFilter
//             positionGlobalFilter="right"
//             state={{
//               columnVisibility,
//               rowSelection,
//             }}
//             onColumnVisibilityChange={setColumnVisibility}
//             onRowSelectionChange={setRowSelection}
//             muiTablePaperProps={({ table }) => ({
//               sx: {
//                 boxShadow: 'none',
//                 border: '1px solid #e0e0e0',
//                 borderRadius: 3,
//                 m: 0,
//                 height: '100%',
//                 display: 'flex',
//                 flexDirection: 'column',
//               },
//               style: table.getState().isFullScreen
//                 ? {
//                     left: drawerOpen ? drawerWidthCss : 0,
//                     width: drawerOpen ? `calc(100vw - ${drawerWidthCss})` : '100vw',
//                     right: 0,
//                     top: 0,
//                     bottom: 0,
//                     height: '100vh',
//                     maxWidth: '100vw',
//                     maxHeight: '100vh',
//                     margin: 0,
//                     padding: 0,
//                     position: 'fixed',
//                     zIndex: 999,
//                   }
//                 : undefined,
//             })}
//             muiTableHeadCellProps={{
//               sx: {
//                 backgroundColor: '#7e7d7dff',
//                 color: 'white',
//                 py: 0.2,
//                 fontSize: '0.75rem',
//                 '&[data-pinned="true"]': {
//                   backgroundColor: '#7e7d7dff',
//                   boxShadow: 'none',
//                 },
//               },
//             }}
//             muiTableContainerProps={{
//               sx: {
//                 flexGrow: 0,
//                 maxWidth: '100%',
//                 overflow: 'auto',
//                 scrollbarWidth: 'thin',
//                 scrollbarColor: '#888 #f1f1f1',
//                 '&::-webkit-scrollbar': { width: '12px', height: '12px' },
//                 '&::-webkit-scrollbar-track': {
//                   background: '#f1f1f1',
//                   borderRadius: '6px',
//                 },
//                 '&::-webkit-scrollbar-thumb': {
//                   background: '#888',
//                   borderRadius: '6px',
//                   '&:hover': { background: '#555' },
//                 },
//                 '&::-webkit-scrollbar-corner': { background: '#f1f1f1' },
//               },
//             }}
//             muiTableBodyRowProps={({ row }) => {
//               const isHighlighted = highlightPredicate?.(
//                 row.original as DynamicTableRow
//               );

//               return {
//                 onClick: onRowClick ? () => onRowClick(row.original) : undefined,
//                 sx: {
//                   cursor: onRowClick ? 'pointer' : 'default',
//                   backgroundColor: isHighlighted
//                     ? '#92c6ebff'
//                     : row.index % 2 === 0
//                     ? '#ffffff'
//                     : '#f0f0f0',
//                   '&:hover': {
//                     backgroundColor: onRowClick ? '#e3f2fd !important' : 'inherit',
//                   },
//                 },
//               };
//             }}
//             muiTableBodyCellProps={() => ({
//               sx: {
//                 py: 0,
//                 pl: 0.5,
//                 fontSize: '0.7rem',
//                 whiteSpace: 'nowrap',
//                 borderRight: '1px solid grey',
//               },
//             })}
//             initialState={{
//               pagination: { pageIndex: 0, pageSize },
//               columnPinning: {
//                 left: leftPinnedColumns,
//               },
//             }}
//             enableColumnOrdering
//             enableColumnDragging={true}
//             enableColumnResizing

//             enableRowSelection={!!isActiveTab}
//             displayColumnDefOptions={
//               isActiveTab
//                 ? {
//                     'mrt-row-select': {
//                       header: '',
//                       size: 25,
//                       enablePinning: false,
//                       enableColumnDragging: false,
//                       muiTableHeadCellProps: {
//                         sx: {
//                           p: 0.4,
//                           '& .MuiCheckbox-root': {
//                             p: '2px',
//                             '& .MuiSvgIcon-root': { fontSize: '16px' },
//                             color: '#7e7d7dff',
//                             '&.Mui-checked': { color: '#7e7d7dff' },
//                           },
//                         },
//                       },
//                     },
//                   }
//                 : undefined
//             }
//             muiSelectCheckboxProps={{
//               sx: {
//                 padding: '2px',
//                 '& .MuiSvgIcon-root': { fontSize: '16px' },
//                 color: '#7e7d7dff',
//                 '&.Mui-checked': { color: '#7e7d7dff' },
//               },
//             }}
//             renderTopToolbarCustomActions={({ table }: { table: any }) =>
//               isActiveTab ? (
//                 <Box
//                   sx={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'space-between',
//                     gap: 1,
//                     px: 1,
//                     mt: -1.2,
//                     flexWrap: 'nowrap',
//                   }}
//                 >
//                   {/* Left cluster */}
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <ExcelDownloadButton
//                       data={rows}
//                       columnOrder={columnOrder}
//                       tableId={tableId}
//                       fileName="Active_Faults_Report"
//                     />

//                     <Button
//                       variant="contained"
//                       sx={{
//                         bgcolor: '#7e7d7dff',
//                         fontSize: '0.4vw',
//                         width: '9vw',
//                         height: '3.2vh',
//                         mt: 1,
//                         borderRadius: '1vh',
//                       }}
//                       size="small"
//                       onClick={() => setViewGraph(!viewGraph)}
//                     >
//                       {viewGraph ? 'Hide Graphs' : 'Show Graphs'}
//                     </Button>
//                   </Box>

//                   {/* Right cluster */}
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
//                     <Button
//                       onClick={() => {
//                         const selected = table
//                           .getSelectedRowModel()
//                           .rows.map(
//                             (r: any) => r.original as DynamicTableRow
//                           );
//                         if (!selected.length) {
//                           return showMessage(
//                             'Please select at least one row to clear.',
//                             'warning'
//                           );
//                         }
//                         setSelectedRows(selected);
//                         setModelContent('clear');
//                         setOpenModel(true);
//                       }}
//                       sx={{
//                         width: '5vw',
//                         height: '3vh',
//                         backgroundColor: '#990033',
//                         borderRadius: '1vh',
//                         ':hover': { backgroundColor: '#770026' },
//                         fontSize: '0.5vh',
//                         color: '#FFFFFF',
//                       }}
//                     >
//                       Clear
//                     </Button>

//                     <Button
//                       onClick={() => {
//                         const selected = table
//                           .getSelectedRowModel()
//                           .rows.map(
//                             (r: any) => r.original as DynamicTableRow
//                           );
//                         if (!selected.length) {
//                           return showMessage(
//                             'Please select at least one row to acknowledge.',
//                             'warning'
//                           );
//                         }
//                         setSelectedRows(selected);
//                         setModelContent('ack');
//                         setOpenModel(true);
//                       }}
//                       sx={{
//                         width: '5vw',
//                         borderRadius: '1vh',
//                         backgroundColor: 'yellow',
//                         ':hover': { backgroundColor: '#cccc00' },
//                         fontSize: '0.5vh',
//                         color: '#000',
//                         height: '3vh',
//                       }}
//                     >
//                       Ack
//                     </Button>

//                     <Button
//                       onClick={() => {
//                         setModelContent('fav');
//                         setOpenModel(true);
//                       }}
//                       sx={{
//                         width: '5vw',
//                         borderRadius: '1vh',
//                         backgroundColor: '#00FFFF',
//                         ':hover': { backgroundColor: '#00cccc' },
//                         fontSize: '0.5vh',
//                         height: '3vh',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         p: 0,
//                       }}
//                     >
//                       <StarBorderIcon sx={{ fontSize: '2.5vh' }} />
//                     </Button>

//                     {/* TicketingPageTest Dialog open button */}
//                     <Button
//                       onClick={() => setOpenTicketing(true)}
//                       sx={{
//                         width: '6vw',
//                         borderRadius: '1vh',
//                         backgroundColor: '#7e7d7dff',
//                         ':hover': { backgroundColor: '#7e7d7dff' },
//                         fontSize: '0.5vh',
//                         height: '3vh',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         color: '#FFFFFF',
//                         p: 0,
//                       }}
//                     >
//                       Ticketing                     
//                     </Button>

//                     <Button
//                       onClick={() => setOpenTicketing(true)}
//                       sx={{
//                         width: '6vw',
//                         borderRadius: '1vh',
//                         backgroundColor: '#b84b4bff',
//                         ':hover': { backgroundColor: '#b84b4bff' },
//                         fontSize: '0.5vh',
//                         height: '3vh',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         color: '#FFFFFF',
//                         p: 0,
//                       }}
//                     >
//                       Download                     
//                     </Button>

//                     <Box sx={{ fontSize: '1.0vw', fontWeight: '700', marginLeft: 9 }}>
//                       INDIA Active Faults
//                     </Box>
//                   </Box>
//                 </Box>
//               ) : null
//             }
//             enablePagination
//             enableColumnActions
//             enableSorting={true}
//             positionToolbarAlertBanner="bottom"
//             enableStickyHeader
//             enableStickyFooter
//             enableColumnPinning
//             columnFilterDisplayMode="subheader"
//             columnResizeMode="onEnd"
//             enableGrouping
//             enableRowVirtualization
//             enableColumnVirtualization
//             muiPaginationProps={{
//               variant: 'outlined',
//               shape: 'rounded',
//               size: 'small',
//               rowsPerPageOptions: [10, 20, 50, 100, 200],
//             }}
//             enableBottomToolbar
//             enableTopToolbar
//             enableSelectAll={false}
//             enableMultiRowSelection
//             muiTopToolbarProps={{
//               sx: {
//                 p: 0,
//                 mb: 1,
//                 minHeight: '39px',
//                 display: 'flex',
//                 flexWrap: 'nowrap',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 overflowX: 'auto',
//                 '& .MuiButton-root': {
//                   minWidth: 'auto',
//                   padding: '1vh 1vh',
//                   fontSize: '0.9vw',
//                 },
//                 '& .MuiIconButton-root': { padding: '2px', fontSize: '1rem' },
//                 '& .MuiInputBase-root': { fontSize: '0.75rem', height: '28px' },
//                 '& .MuiToolbar-root': { minHeight: '30px' },
//               },
//             }}
//             muiBottomToolbarProps={{
//               sx: {
//                 p: 0,
//                 m: 0,
//                 minHeight: '35px',
//                 '& .MuiButton-root': {
//                   minWidth: 'auto',
//                   padding: '2px 6px',
//                   fontSize: '0.7rem',
//                 },
//                 '& .MuiIconButton-root': { padding: '2px', fontSize: '1rem' },
//                 '& .MuiInputBase-root': { fontSize: '0.75rem', height: '28px' },
//                 '& .MuiToolbar-root': { minHeight: '36px' },
//               },
//             }}
//           />

//           <CommonDialog
//             open={openModel}
//             onClose={() => setOpenModel(false)}
//             title="Trap Details"
//             maxWidth={modelContent === 'fav' ? 'md' : 'sm'}
//           >
//             <hr />
//             {modelContent === 'clear' ? (
//               <ClearTrap selectedrows={selectedRows} onDone={onClearDone} />
//             ) : modelContent === 'ack' ? (
//               <AcknowledgeTrap selectedrows={selectedRows} onDone={onAckDone} />
//             ) : modelContent === 'fav' ? (
//               <AddToFavContent
//                 onApplied={(payload) => {
//                   applyGroupFilter(payload);
//                 }}
//                 onCleared={() => {
//                   clearGroupFilter();
//                 }}
//               />
//             ) : null}
//           </CommonDialog>

//           {/* TicketingPageTest full-screen dialog */}
//           <Dialog
//             open={openTicketing}
//             onClose={() => setOpenTicketing(false)}
//             fullScreen
//             sx={{
//               '& .MuiDialog-paper': {
//                 m: 0,
//                 borderRadius: 0,
//               },
//             }}
//           >
//             {/* Container with small back icon on top-left */}
//             <Box
//               sx={{
//                 position: 'relative',
//                 height: 'calc(100vh - 48px)',
//                 overflow: 'hidden',
//               }}
//             >
//               <Button
//                       onClick={() => setOpenTicketing(false)}
//                       sx={{
//                         position: 'absolute',
//                         width: '7vw',
//                         borderRadius: '1vh',
//                         backgroundColor: '#7e7d7dff',
//                         ':hover': { backgroundColor: '#7e7d7dff' },
//                         fontSize: '1.3vh',
//                         height: '3vh',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         color: '#FFFFFF',
//                         p: 0,
//                         ml: "20vw",
//                         mt: 2.5,
//                       }}
//                     >
//                       Active Faults                     
//                     </Button>

//               {/* Ticketing Page UI */}
//               <Box sx={{ width: '100%', height: '100%' }}>
//                 <TicketingPageTest />
//               </Box>
//             </Box>
//           </Dialog>
//         </>
//       )}
//     </Box>
//   );
// };
// export default ActiveFaultsTableForSidebar;

import React, { useEffect, useState, useMemo } from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import { MaterialReactTable, MRT_ColumnDef, MRT_RowSelectionState,} from 'material-react-table';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { DynamicTableRow } from '../../../../store/types';
import ClearTrap from './ClearTrap';
import { useSnackbar } from '../../../common/SnackbarProvider';
import AcknowledgeTrap from './AcknowledgeTrap';
import ExcelDownloadButton from '../../../common/ExcelDownloadButton';
import LoadingBox from '../../../common/LoadingBox';
import CommonDialog from '../../../common/CommonDialog.';
import Dialog from '@mui/material/Dialog';
import TicketingPageTest from '../../../../pages/Faults/TicketingPageTest';
import AddToFavContent from './AddToFav';
import * as XLSX from 'xlsx';
import axiosClient from '../../../../utils/axiosData/axioxClient';
import { AUTO_TT_ALARMS_API } from '../../../../utils/axiosData/apis';

type ApplyPayload = {
  groupIds: string[];
  adapters: string[];
  trapTypes: string[];
};

interface CommonTableProps {
  isLoading?: boolean;
  columnOrder: string[];
  dataObjects: Record<string, any>[];
  viewGraph: boolean;
  setViewGraph: (viewGraph: boolean) => void;
  pageSize?: number;
  onRowClick?: (row: Record<string, any>) => void;
  defaultVisibleColumns?: string[];
  isActiveTab?: boolean;
  tableId?: string;
  highlightPredicate?: (row: DynamicTableRow) => boolean;

  // drawer info for fullscreen adjust
  drawerOpen?: boolean;
  drawerWidthCss?: string;
}

const LOCALSTORAGE_PREFIX = 'visible_columns_map_';

const ActiveFaultsTableForSidebar: React.FC<CommonTableProps> = ({
  columnOrder,
  dataObjects,
  pageSize = 10,
  viewGraph,
  setViewGraph,
  onRowClick,
  defaultVisibleColumns,
  isLoading,
  isActiveTab = false,
  highlightPredicate,
  tableId = 'active-faults-table',
  drawerOpen = false,
  drawerWidthCss = '20vw',
}) => {
  const { showMessage } = useSnackbar();

  const normalize = (s: any) => String(s ?? '').trim().toUpperCase();

  const [allRows, setAllRows] = useState<Record<string, any>[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [adaptersForFilter, setAdaptersForFilter] = useState<Set<string>>(
    new Set()
  );
  const [alarmsForFilter, setAlarmsForFilter] = useState<Set<string>>(new Set());

  // Ticketing dialog open/close
  const [openTicketing, setOpenTicketing] = useState(false);

  //  download loading state
  const [downloadingAutoTt, setDownloadingAutoTt] = useState(false);

  // dataObjects + fav filters se effective rows bana ke state me daalo
  useEffect(() => {
    const filtered = dataObjects.filter((r) => {
      const a = normalize(r['Adapter']);
      const t = normalize(r['Alarm']);
      const adapterOk = adaptersForFilter.size === 0 || adaptersForFilter.has(a);
      const trapOk = alarmsForFilter.size === 0 || alarmsForFilter.has(t);
      return adapterOk && trapOk;
    });
    setAllRows(filtered ?? []);
    setRows(filtered ?? []);
  }, [dataObjects, adaptersForFilter, alarmsForFilter]);

  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [selectedRows, setSelectedRows] = useState<DynamicTableRow[]>([]);
  const [openModel, setOpenModel] = useState(false);
  const [modelContent, setModelContent] = useState<'clear' | 'ack' | 'fav'>();

  // when this key changes, table remounts
  const [tableResetKey, setTableResetKey] = useState(0);

  /* ========= COLUMN VISIBILITY LOGIC ========= */

  // 1) clear old Local Storage on mount
  useEffect(() => {
    try {
      const key = `${LOCALSTORAGE_PREFIX}${tableId}`;
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('Failed to clear old column visibility from localStorage', e);
    }
  }, [tableId]);

  // 2) defaults from array
  const buildVisibilityFromDefaults = (): Record<string, boolean> => {
    const visibleSet = new Set(defaultVisibleColumns ?? columnOrder);
    const visibility: Record<string, boolean> = {};

    columnOrder.forEach((col) => {
      visibility[col] = visibleSet.has(col);
    });

    return visibility;
  };

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    () => buildVisibilityFromDefaults()
  );

  // 3) persist to localStorage on change
  useEffect(() => {
    try {
      const key = `${LOCALSTORAGE_PREFIX}${tableId}`;
      localStorage.setItem(key, JSON.stringify(columnVisibility));
    } catch (e) {
      console.error('Failed to persist column visibility', e);
    }
  }, [columnVisibility, tableId]);

  // 4) if columnOrder or defaultVisibleColumns change, recalc visibility
  useEffect(() => {
    setColumnVisibility((prev) => {
      const visibleSet = new Set(defaultVisibleColumns ?? columnOrder);
      const next: Record<string, boolean> = {};

      columnOrder.forEach((col) => {
        if (typeof prev[col] === 'boolean') {
          next[col] = prev[col];
        } else {
          next[col] = visibleSet.has(col);
        }
      });

      return next;
    });
  }, [columnOrder, defaultVisibleColumns]);

  /* ========= END COLUMN VISIBILITY ========= */

  const initialColumnSizes: Record<string, number> = {
    Adapter: 110,
    Severity: 100,
    Alarm: 160,
    Client: 140,
    Technology: 140,
    'Device Name': 180,
    Source: 150,
    'Port Name': 150,
    'No.Services_Affected': 200,
    Description: 360,
    'Ack Time': 180,
    'Ack Msg': 200,
    'Ack User': 130,
    'Clear Msg': 160,
    'Clear User': 170,
    'NMS Received Time': 210,
    'OSS Insertion Time': 210,
    'Internal TicketId': 180,
    'Clear Time': 180,
  };

  const AdapterBadge = (raw?: string) => {
    const val = (raw ?? '').trim().toUpperCase();
    const bg =
      val === 'MCP'
        ? '#009688 !important'
        : val === 'NFMT'
          ? '#8283eb !important'
          : '#607D8B';
    return (
      <Box
        sx={{
          px: 1.2,
          py: 0.2,
          lineHeight: 1.6,
          bgcolor: bg,
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
          fontSize: '0.72rem',
          fontWeight: 700,
          minWidth: 64,
          textTransform: 'uppercase',
        }}
      >
        {val || 'NA'}
      </Box>
    );
  };

  const sevBadge = (raw?: string) => {
    const s = (raw ?? '').trim().toUpperCase();
    const map = {
      CRITICAL: { bg: '#E53935', fg: '#FFFFFF', letter: 'c' },
      MAJOR: { bg: '#FB8C00', fg: '#FFFFFF', letter: 'M' },
      MINOR: { bg: '#FDD835', fg: '#FFFFFF', letter: 'm' },
      MINORWARN: { bg: '#FDD835', fg: '#FFFFFF', letter: 'm' },
      WARNING: { bg: '#FFD54F', fg: '#333333', letter: 'w' },
      WARN: { bg: '#FFD54F', fg: '#333333', letter: 'w' },
    } as const;
    const conf = (map as any)[s] ?? { bg: '#BDBDBD', fg: '#FFFFFF', letter: '•' };
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 19,
          height: 19,
          bgcolor: conf.bg,
          color: conf.fg,
          borderRadius: '50%',
          fontSize: '0.65rem',
          fontWeight: 700,
        }}
        aria-label={s}
      >
        {conf.letter}
      </Box>
    );
  };

  //  Auto-TT alarms download handler
  const handleDownloadAutoTtAlarms = async () => {
    try {
      setDownloadingAutoTt(true);

      // choose adapters: filter set > adapters from rows > fallback
      const adaptersFromFilter = Array.from(adaptersForFilter);
      const adaptersFromRows = Array.from(
        new Set(rows.map((r) => normalize(r['Adapter'])).filter(Boolean))
      );

      const adapters =
        adaptersFromFilter.length > 0
          ? adaptersFromFilter
          : adaptersFromRows.length > 0
            ? adaptersFromRows
            : ['MCP', 'NFMT'];

      const adapterName = adapters.join(',');
      const url = `${AUTO_TT_ALARMS_API}?adapterName=${adapterName}`;
      const response = await axiosClient.get(url);
      const data = response?.data;

      if (!Array.isArray(data) || data.length === 0) {
        showMessage('No data received from Auto-TT API.', 'warning');
        return;
      }

      // shape excel columns
      const excelRows = data.map((r: any) => ({
        Adapter: r.Adapter ?? '',
        Alarm: r.alarm ?? '',
        Treated: r.Treated ?? '',
        Family: r.family ?? '',
        Persistence_in_sec: r.Persistence_in_sec ?? '',
        Short_period: r.Short_period ?? '',
        Short_repetition: r.Short_repetition ?? '',
      }));

      const ws = XLSX.utils.json_to_sheet(excelRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AutoTT_Alarms');

      const fileName = `AutoTT_Alarms_${adapterName}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      XLSX.writeFile(wb, fileName);

      showMessage('Auto-TT alarms Excel downloaded.', 'success');
    } catch (err: any) {
      console.error(err);
      showMessage(err?.message || 'Failed to download Auto-TT alarms.', 'error');
    } finally {
      setDownloadingAutoTt(false);
    }
  };

  // MRT columns – memoized
  const columns: MRT_ColumnDef<any>[] = useMemo(
    () =>
      columnOrder.map((col) => {
        const isCorePinned = col === 'Adapter' || col === 'Severity' || col === 'Alarm';

        const base: MRT_ColumnDef<any> = {
          accessorFn: (row) => row[col],
          id: col,
          header: col,
          size: initialColumnSizes[col] ?? 140,
          enablePinning: isCorePinned,
          enableColumnDragging: !isCorePinned,
        };

        const getIsHighlighted = (rowOriginal: any) =>
          highlightPredicate?.(rowOriginal as DynamicTableRow) ?? false;

        if (col === 'Alarm') {
          base.muiTableBodyCellProps = {
            sx: {
              display: 'flex',
              alignItems: 'stretch',
              p: 0,
              borderRight: '1px solid grey',
              fontSize: '0.7rem',
              whiteSpace: 'nowrap',
            },
          };

          base.Cell = ({ cell, row }) => {
            const isHighlighted = getIsHighlighted(row.original);
            return (
              <Box
                sx={{
                  flex: 1,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  px: 0.5,
                  ...(isHighlighted && {
                    backgroundColor: '#92c6ebff',
                    borderRadius: '2px',
                  }),
                  '&:hover': {
                    backgroundColor: onRowClick ? '#e3f2fd !important' : 'inherit',
                  },
                }}
              >
                {cell.getValue<string>()}
              </Box>
            );
          };
        }

        if (col === 'Adapter') {
          base.Cell = ({ cell, row }) => {
            const isHighlighted = getIsHighlighted(row.original);
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  ...(isHighlighted && {
                    backgroundColor: '#e3f2fd',
                    borderRadius: '2px',
                  }),
                }}
              >
                {AdapterBadge(cell.getValue<string>())}
              </Box>
            );
          };
          base.enableSorting = false;
          base.muiTableBodyCellProps = { align: 'center' as const };
        }

        if (col === 'Severity') {
          base.Cell = ({ cell }) => (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Tooltip title={(cell.getValue<string>() ?? '').toString()}>
                <span>{sevBadge(cell.getValue<string>())}</span>
              </Tooltip>
            </Box>
          );
          base.enableSorting = false;
          base.muiTableBodyCellProps = { align: 'center' as const };
        }

        return base;
      }),
    [columnOrder, highlightPredicate, onRowClick]
  );

  const applyGroupFilter = (payload: ApplyPayload) => {
    const adapterSet = new Set(payload.adapters.map((a) => a.toUpperCase()));
    const trapSet = new Set(payload.trapTypes.map((t) => t.toUpperCase()));

    setAdaptersForFilter(new Set(adapterSet));
    setAlarmsForFilter(new Set(trapSet));

    const filtered = allRows.filter((r) => {
      const a = normalize(r['Adapter']);
      const t = normalize(r['Alarm']);
      const adapterOk = adapterSet.size === 0 || adapterSet.has(a);
      const trapOk = trapSet.size === 0 || trapSet.has(t);
      return adapterOk && trapOk;
    });

    setRows(filtered);
    setRowSelection({});
    setSelectedRows([]);
  };

  const clearGroupFilter = () => {
    setAdaptersForFilter(new Set());
    setAlarmsForFilter(new Set());
    setRows(allRows);
    setSelectedRows([]);
    setTableResetKey((k) => k + 1);
  };

  const orderedData = useMemo(
    () =>
      rows.map((obj) =>
        columnOrder.reduce((acc, key) => {
          acc[key] = obj[key] ?? '';
          return acc;
        }, {} as Record<string, any>)
      ),
    [rows, columnOrder]
  );

  const onAckDone = () => {
    setOpenModel(false);
    showMessage('Selected traps acknowledged successfully.', 'success');
    setSelectedRows([]);
    setTableResetKey((k) => k + 1);
  };

  const onClearDone = () => {
    setOpenModel(false);
    showMessage('Selected traps cleared successfully.', 'success');
    setSelectedRows([]);
    setTableResetKey((k) => k + 1);
  };

  const leftPinnedColumns = isActiveTab
    ? ['mrt-row-select', 'Adapter', 'Severity', 'Alarm']
    : ['Adapter', 'Severity', 'Alarm'];

  const showLoading = !dataObjects || dataObjects.length === 0;

  return (
    <Box
      sx={{
        p: 0,
        m: 0,
        borderRadius: 2,
        border: 1,
        height: viewGraph ? '55.98vh' : '92vh',
      }}
    >
      {showLoading ? (
        <LoadingBox isLoading={isLoading} />
      ) : (
        <>
          <MaterialReactTable
            key={tableResetKey}
            columns={columns}
            data={orderedData}
            enableHiding
            enableGlobalFilter
            positionGlobalFilter="right"
            state={{
              columnVisibility,
              rowSelection,
            }}
            onColumnVisibilityChange={setColumnVisibility}
            onRowSelectionChange={setRowSelection}
            muiTablePaperProps={({ table }) => ({
              sx: {
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                m: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              },
              style: table.getState().isFullScreen
                ? {
                  left: drawerOpen ? drawerWidthCss : 0,
                  width: drawerOpen ? `calc(100vw - ${drawerWidthCss})` : '100vw',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  height: '100vh',
                  maxWidth: '100vw',
                  maxHeight: '100vh',
                  margin: 0,
                  padding: 0,
                  position: 'fixed',
                  zIndex: 999,
                }
                : undefined,
            })}
            muiTableHeadCellProps={{
              sx: {
                backgroundColor: '#7e7d7dff',
                color: 'white',
                py: 0.2,
                fontSize: '0.75rem',
                '&[data-pinned="true"]': {
                  backgroundColor: '#7e7d7dff',
                  boxShadow: 'none',
                },
              },
            }}
            muiTableContainerProps={{
              sx: {
                flexGrow: 0,
                maxWidth: '100%',
                overflow: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#888 #f1f1f1',
                '&::-webkit-scrollbar': { width: '12px', height: '12px' },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '6px',
                  '&:hover': { background: '#555' },
                },
                '&::-webkit-scrollbar-corner': { background: '#f1f1f1' },
              },
            }}
            muiTableBodyRowProps={({ row }) => {
              const isHighlighted = highlightPredicate?.(row.original as DynamicTableRow);

              return {
                onClick: onRowClick ? () => onRowClick(row.original) : undefined,
                sx: {
                  cursor: onRowClick ? 'pointer' : 'default',
                  backgroundColor: isHighlighted
                    ? '#92c6ebff'
                    : row.index % 2 === 0
                      ? '#ffffff'
                      : '#f0f0f0',
                  '&:hover': {
                    backgroundColor: onRowClick ? '#e3f2fd !important' : 'inherit',
                  },
                },
              };
            }}
            muiTableBodyCellProps={() => ({
              sx: {
                py: 0,
                pl: 0.5,
                fontSize: '0.7rem',
                whiteSpace: 'nowrap',
                borderRight: '1px solid grey',
              },
            })}
            initialState={{
              pagination: { pageIndex: 0, pageSize },
              columnPinning: {
                left: leftPinnedColumns,
              },
            }}
            enableColumnOrdering
            enableColumnDragging={true}
            enableColumnResizing
            enableRowSelection={!!isActiveTab}
            displayColumnDefOptions={
              isActiveTab
                ? {
                  'mrt-row-select': {
                    header: '',
                    size: 25,
                    enablePinning: false,
                    enableColumnDragging: false,
                    muiTableHeadCellProps: {
                      sx: {
                        p: 0.4,
                        '& .MuiCheckbox-root': {
                          p: '2px',
                          '& .MuiSvgIcon-root': { fontSize: '16px' },
                          color: '#7e7d7dff',
                          '&.Mui-checked': { color: '#7e7d7dff' },
                        },
                      },
                    },
                  },
                }
                : undefined
            }
            muiSelectCheckboxProps={{
              sx: {
                padding: '2px',
                '& .MuiSvgIcon-root': { fontSize: '16px' },
                color: '#7e7d7dff',
                '&.Mui-checked': { color: '#7e7d7dff' },
              },
            }}
            renderTopToolbarCustomActions={({ table }: { table: any }) =>
              isActiveTab ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    px: 1,
                    mt: -1.2,
                    flexWrap: 'nowrap',
                  }}
                >
                  {/* Left cluster */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ExcelDownloadButton
                      data={rows}
                      columnOrder={columnOrder}
                      tableId={tableId}
                      fileName="Active_Faults_Report"
                    />

                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: '#7e7d7dff',
                        fontSize: '0.4vw',
                        width: '9vw',
                        height: '3.2vh',
                        mt: 1,
                        borderRadius: '1vh',
                      }}
                      size="small"
                      onClick={() => setViewGraph(!viewGraph)}
                    >
                      {viewGraph ? 'Hide Graphs' : 'Show Graphs'}
                    </Button>
                  </Box>

                  {/* Right cluster */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Button
                      onClick={() => {
                        const selected = table
                          .getSelectedRowModel()
                          .rows.map((r: any) => r.original as DynamicTableRow);
                        if (!selected.length) {
                          return showMessage('Please select at least one row to clear.', 'warning');
                        }
                        setSelectedRows(selected);
                        setModelContent('clear');
                        setOpenModel(true);
                      }}
                      sx={{
                        width: '5vw',
                        height: '3vh',
                        backgroundColor: '#990033',
                        borderRadius: '1vh',
                        ':hover': { backgroundColor: '#770026' },
                        fontSize: '0.5vh',
                        color: '#FFFFFF',
                      }}
                    >
                      Clear
                    </Button>

                    <Button
                      onClick={() => {
                        const selected = table
                          .getSelectedRowModel()
                          .rows.map((r: any) => r.original as DynamicTableRow);
                        if (!selected.length) {
                          return showMessage(
                            'Please select at least one row to acknowledge.',
                            'warning'
                          );
                        }
                        setSelectedRows(selected);
                        setModelContent('ack');
                        setOpenModel(true);
                      }}
                      sx={{
                        width: '5vw',
                        borderRadius: '1vh',
                        backgroundColor: 'yellow',
                        ':hover': { backgroundColor: '#cccc00' },
                        fontSize: '0.5vh',
                        color: '#000',
                        height: '3vh',
                      }}
                    >
                      Ack
                    </Button>

                    <Button
                      onClick={() => {
                        setModelContent('fav');
                        setOpenModel(true);
                      }}
                      sx={{
                        width: '5vw',
                        borderRadius: '1vh',
                        backgroundColor: '#00FFFF',
                        ':hover': { backgroundColor: '#00cccc' },
                        fontSize: '0.5vh',
                        height: '3vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 0,
                      }}
                    >
                      <StarBorderIcon sx={{ fontSize: '2.5vh' }} />
                    </Button>

                    <Button
                      onClick={() => setOpenTicketing(true)}
                      sx={{
                        width: '6vw',
                        borderRadius: '1vh',
                        backgroundColor: '#7e7d7dff',
                        ':hover': { backgroundColor: '#7e7d7dff' },
                        fontSize: '0.5vh',
                        height: '3vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        p: 0,
                      }}
                    >
                      Ticketing
                    </Button>

                    {/*  Download uses API and xlsx */}
                    <Button
                      onClick={handleDownloadAutoTtAlarms}
                      // disabled={downloadingAutoTt}
                      sx={{
                        width: '6vw',
                        borderRadius: '1vh',
                        backgroundColor: '#b84b4bff',
                        ':hover': { backgroundColor: '#b84b4bff' },
                        fontSize: '0.5vh',
                        height: '3vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        p: 0,
                        // opacity: downloadingAutoTt ? 0.75 : 1,
                      }}
                    >
                      {downloadingAutoTt ? 'Auto TT' : 'Auto TT'}
                    </Button>

                    <Box sx={{ fontSize: '1.0vw', fontWeight: '700', marginLeft: 9 }}>
                      INDIA Active Faults
                    </Box>
                  </Box>
                </Box>
              ) : null
            }
            enablePagination
            enableColumnActions
            enableSorting={true}
            positionToolbarAlertBanner="bottom"
            enableStickyHeader
            enableStickyFooter
            enableColumnPinning
            columnFilterDisplayMode="subheader"
            columnResizeMode="onEnd"
            enableGrouping
            enableRowVirtualization
            enableColumnVirtualization
            muiPaginationProps={{
              variant: 'outlined',
              shape: 'rounded',
              size: 'small',
              rowsPerPageOptions: [10, 20, 50, 100, 200],
            }}
            enableBottomToolbar
            enableTopToolbar
            enableSelectAll={false}
            enableMultiRowSelection
            muiTopToolbarProps={{
              sx: {
                p: 0,
                mb: 1,
                minHeight: '39px',
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                overflowX: 'auto',
                '& .MuiButton-root': {
                  minWidth: 'auto',
                  padding: '1vh 1vh',
                  fontSize: '0.9vw',
                },
                '& .MuiIconButton-root': { padding: '2px', fontSize: '1rem' },
                '& .MuiInputBase-root': { fontSize: '0.75rem', height: '28px' },
                '& .MuiToolbar-root': { minHeight: '30px' },
              },
            }}
            muiBottomToolbarProps={{
              sx: {
                p: 0,
                m: 0,
                minHeight: '35px',
                '& .MuiButton-root': {
                  minWidth: 'auto',
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                },
                '& .MuiIconButton-root': { padding: '2px', fontSize: '1rem' },
                '& .MuiInputBase-root': { fontSize: '0.75rem', height: '28px' },
                '& .MuiToolbar-root': { minHeight: '36px' },
              },
            }}
          />

          <CommonDialog
            open={openModel}
            onClose={() => setOpenModel(false)}
            title="Trap Details"
            maxWidth={modelContent === 'fav' ? 'md' : 'sm'}
          >
            <hr />
            {modelContent === 'clear' ? (
              <ClearTrap selectedrows={selectedRows} onDone={onClearDone} />
            ) : modelContent === 'ack' ? (
              <AcknowledgeTrap selectedrows={selectedRows} onDone={onAckDone} />
            ) : modelContent === 'fav' ? (
              <AddToFavContent
                onApplied={(payload) => {
                  applyGroupFilter(payload);
                }}
                onCleared={() => {
                  clearGroupFilter();
                }}
              />
            ) : null}
          </CommonDialog>

          {/* TicketingPageTest full-screen dialog */}
          <Dialog
            open={openTicketing}
            onClose={() => setOpenTicketing(false)}
            fullScreen
            sx={{
              '& .MuiDialog-paper': {
                m: 0,
                borderRadius: 0,
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                height: 'calc(100vh - 48px)',
                overflow: 'hidden',
              }}
            >
              <Button
                onClick={() => setOpenTicketing(false)}
                sx={{
                  position: 'absolute',
                  width: '7vw',
                  borderRadius: '1vh',
                  backgroundColor: '#7e7d7dff',
                  ':hover': { backgroundColor: '#7e7d7dff' },
                  fontSize: '1.3vh',
                  height: '3vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  p: 0,
                  ml: '20vw',
                  mt: 2.5,
                }}
              >
                Active Faults
              </Button>

              <Box sx={{ width: '100%', height: '100%' }}>
                <TicketingPageTest />
              </Box>
            </Box>
          </Dialog>
        </>
      )}
    </Box>
  );
};
export default ActiveFaultsTableForSidebar;




