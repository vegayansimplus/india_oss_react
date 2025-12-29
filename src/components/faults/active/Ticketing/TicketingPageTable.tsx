

// // import React, { useEffect, useState } from 'react';
// // import { Box, Tooltip } from '@mui/material';
// // import {
// //   MaterialReactTable,
// //   MRT_ColumnDef,
// // } from 'material-react-table';
// // import { useSnackbar } from '../../../common/SnackbarProvider';
// // import LoadingBox from '../../../common/LoadingBox';
// // import ExcelDownloadButton from '../../../common/ExcelDownloadButton';

// // interface CommonTableProps {
// //   isLoading?: boolean;
// //   columnOrder: string[];
// //   dataObjects: Record<string, any>[];
// //   viewGraph: boolean;
// //   setViewGraph: (viewGraph: boolean) => void;
// //   pageSize?: number;
// //   onRowClick?: (row: Record<string, any>) => void;
// //   defaultVisibleColumns?: string[];
// //   isActiveTab?: boolean;

// //   // full-screen drawer aware layout
// //   tableId?: string;
// //   drawerOpen?: boolean;
// //   drawerWidthCss?: string;
// // }

// // // ------------ helpers for ticket state colours ------------
// // const norm = (v?: string | null) => (v ?? '').toString().trim();

// // function getTicketStateColors(raw: string) {
// //   const v = norm(raw);
// //   if (!v) return { bg: undefined, color: undefined, border: undefined };

// //   const lower = v.toLowerCase();

// //   if (lower === 'resolved') {
// //     return {
// //       bg: '#d4edda !important',
// //       color: '#155724',
// //       border: '1px solid #c3e6cb',
// //     };
// //   }
// //   if (lower === 'creation failed' || lower === 'resolution failed') {
// //     return {
// //       bg: '#f8d7da !important',
// //       color: '#721c24',
// //       border: '1px solid #f5c6cb',
// //     };
// //   }
// //   if (lower === 'open') {
// //     return {
// //       bg: '#ffe5b4 !important',
// //       color: '#856404',
// //       border: '1px solid #ffcf71',
// //     };
// //   }

// //   // default
// //   return { bg: undefined, color: undefined, border: undefined };
// // }

// // const TicketingPageTable: React.FC<CommonTableProps> = ({
// //   columnOrder,
// //   dataObjects,
// //   pageSize = 10,
// //   viewGraph,
// //   setViewGraph, // (graph use nahi kar rahe, but prop rakha hai)
// //   onRowClick,
// //   defaultVisibleColumns,
// //   isLoading,
// //   isActiveTab = true, // ticketing main tab
// //   tableId = 'ticketing-table',
// //   drawerOpen = false,
// //   drawerWidthCss = '20vw',
// // }) => {
// //   const { showMessage } = useSnackbar();

// //   // keep original and filtered rows
// //   const [allRows, setAllRows] = useState<Record<string, any>[]>([]);
// //   const [rows, setRows] = useState<Record<string, any>[]>([]);

// //   useEffect(() => {
// //     setAllRows(dataObjects ?? []);
// //     setRows(dataObjects ?? []);
// //   }, [dataObjects]);

// //   const getInitialColumnVisibility = () => {
// //     const visibleSet = new Set(defaultVisibleColumns ?? columnOrder);
// //     const visibility: Record<string, boolean> = {};
// //     columnOrder.forEach((col) => (visibility[col] = visibleSet.has(col)));
// //     return visibility;
// //   };

// //   const initialColumnSizes: Record<string, number> = {
// //     Adapter: 110,
// //     Family: 100,
// //     'VegayanOSS Ticket': 160,
// //     'FS Ticket': 140,
// //     'Ticket State': 140,
// //     'Alarm Received Time': 180,
// //     'Alarm Cleared Time': 150,
// //     'OSS DBInsertion(Receive)': 150,
// //     'OSS DBInsertion(Clear)': 200,
// //     'OSS Ticket Created Time': 220,
// //     'OSS Ticket Resolution Time': 240,
// //     'FS Error': 140,
// //     'Backend Error': 130,
// //     'Root Alarm ID': 180,
// //     'Node Name': 130,
// //     Severity: 100,
// //     'IP Address': 160,
// //     'Symptom Type': 180,
// //     'Ticket Description': 180,
// //     'Last Modify Date': 180,
// //   };

// //   const AdapterBadge = (raw?: string) => {
// //     const val = (raw ?? '').trim().toUpperCase();
// //     const bg =
// //       val === 'MCP'
// //         ? '#009688'
// //         : val === 'NFMT'
// //         ? '#8283eb !important'
// //         : '#607D8B';
// //     return (
// //       <Box
// //         sx={{
// //           px: 1.2,
// //           py: 0.2,
// //           lineHeight: 1.6,
// //           bgcolor: bg,
// //           color: '#fff',
// //           display: 'inline-flex',
// //           alignItems: 'center',
// //           justifyContent: 'center',
// //           borderRadius: '10px',
// //           fontSize: '0.72rem',
// //           fontWeight: 700,
// //           minWidth: 64,
// //           textTransform: 'uppercase',
// //         }}
// //       >
// //         {val || 'NA'}
// //       </Box>
// //     );
// //   };

// //   const sevBadge = (raw?: string) => {
// //     const label = norm(raw); // "Critical" / "Major" / ...
// //     return (
// //       <Box
// //         sx={{
// //           display: 'flex',
// //           alignItems: 'flex-start',
// //           justifyContent: 'flex-start',
// //           fontSize: '0.73rem',
// //           fontWeight: 500,
// //           minWidth: '4.8rem',
// //           textTransform: 'none',
// //           whiteSpace: 'nowrap',
// //         }}
// //       >
// //         {label || '-'}
// //       </Box>
// //     );
// //   };

// //   const columns: MRT_ColumnDef<any>[] = columnOrder.map((col) => {
// //     const base: MRT_ColumnDef<any> = {
// //       accessorFn: (row) => row[col],
// //       id: col,
// //       header: col,
// //       size: initialColumnSizes[col] ?? 140,
// //     };

// //     // Adapter chip
// //     if (col === 'Adapter') {
// //       base.Cell = ({ cell }) => (
// //         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
// //           {AdapterBadge(cell.getValue<string>())}
// //         </Box>
// //       );
// //       base.enableSorting = false;
// //       base.muiTableBodyCellProps = { align: 'center' as const };
// //     }

// //     // Severity text
// //     if (col === 'Severity') {
// //       base.Cell = ({ cell }) => (
// //         <Box sx={{ display: 'flex', justifyContent: 'center' }}>
// //           <Tooltip title={(cell.getValue<string>() ?? '').toString()}>
// //             <span>{sevBadge(cell.getValue<string>())}</span>
// //           </Tooltip>
// //         </Box>
// //       );
// //       base.enableSorting = false;
// //       base.muiTableBodyCellProps = { align: 'center' as const };
// //     }

// //     // Ticket State colour band
// //     if (col === 'Ticket State') {
// //       base.Cell = ({ cell }) => {
// //         const value = norm(String(cell.getValue() ?? ''));
// //         const { bg, color, border } = getTicketStateColors(value);

// //         return (
// //           <Box
// //             sx={{
// //               bgcolor: bg,
// //               color,
// //               border,
// //               borderRadius: '4px',
// //               px: 1,
// //               py: 0.4,
// //               fontSize: '0.72rem',
// //               textAlign: 'center',
// //               minWidth: '7.5rem',
// //               whiteSpace: 'nowrap',
// //             }}
// //           >
// //             {value || '-'}
// //           </Box>
// //         );
// //       };
// //       base.enableSorting = false;
// //       base.muiTableBodyCellProps = { align: 'center' as const };
// //     }

// //     return base;
// //   });

// //   const orderedData = rows.map((obj) =>
// //     columnOrder.reduce((acc, key) => {
// //       acc[key] = obj[key] ?? '';
// //       return acc;
// //     }, {} as Record<string, any>),
// //   );

// //   const showLoading = !dataObjects || dataObjects.length === 0;

// //   return (
// //     <Box
// //       sx={{
// //         p: 0,
// //         m: 0,
// //         borderRadius: 2,
// //         border: 1,
// //         height: viewGraph ? '45vh' : '83vh',
// //       }}
// //     >
// //       {showLoading ? (
// //         <LoadingBox isLoading={isLoading} />
// //       ) : (
// //         <>
// //           <MaterialReactTable
// //             columns={columns}
// //             data={orderedData}
// //             muiTablePaperProps={({ table }) => ({
// //               sx: {
// //                 boxShadow: 'none',
// //                 border: '1px solid #e0e0e0',
// //                 borderRadius: 3,
// //                 m: 0,
// //                 height: '100%',
// //                 display: 'flex',
// //                 flexDirection: 'column',
// //               },
// //               style: table.getState().isFullScreen
// //                 ? {
// //                     left: drawerOpen ? drawerWidthCss : 0,
// //                     width: drawerOpen
// //                       ? `calc(100vw - ${drawerWidthCss})`
// //                       : '100vw',
// //                     right: 0,
// //                     top: 0,
// //                     bottom: 0,
// //                     height: '100vh',
// //                     maxWidth: '100vw',
// //                     maxHeight: '100vh',
// //                     margin: 0,
// //                     padding: 0,
// //                     position: 'fixed',
// //                     zIndex: 999,
// //                   }
// //                 : undefined,
// //             })}
// //             muiTableHeadCellProps={{
// //               sx: {
// //                 backgroundColor: '#7e7d7dff',
// //                 color: 'white',
// //                 py: 0,
// //                 fontSize: '0.75rem',
// //               },
// //             }}
// //             muiTableContainerProps={{
// //               sx: {
// //                 flexGrow: 0,
// //                 maxWidth: '100%',
// //                 overflow: 'auto',
// //                 scrollbarWidth: 'thin',
// //                 scrollbarColor: '#888 #f1f1f1',
// //                 '&::-webkit-scrollbar': { width: '12px', height: '12px' },
// //                 '&::-webkit-scrollbar-track': {
// //                   background: '#f1f1f1',
// //                   borderRadius: '6px',
// //                 },
// //                 '&::-webkit-scrollbar-thumb': {
// //                   background: '#888',
// //                   borderRadius: '6px',
// //                   '&:hover': { background: '#555' },
// //                 },
// //                 '&::-webkit-scrollbar-corner': { background: '#f1f1f1' },
// //               },
// //             }}
// //             muiTableBodyRowProps={({ row }) => ({
// //               onClick: onRowClick ? () => onRowClick(row.original) : undefined,
// //               sx: {
// //                 cursor: onRowClick ? 'pointer' : 'default',
// //                 backgroundColor:
// //                   row.index % 2 === 0 ? '#ffffff' : '#f0f0f0',
// //                 '&:hover': {
// //                   backgroundColor: onRowClick
// //                     ? '#e3f2fd !important'
// //                     : 'inherit',
// //                 },
// //               },
// //             })}
// //             muiTableBodyCellProps={() => ({
// //               sx: {
// //                 py: 0.3,
// //                 pl: 0.5,
// //                 fontSize: '0.7rem',
// //                 whiteSpace: 'nowrap',
// //                 borderRight: '1px solid grey',
// //               },
// //             })}
// //             initialState={{
// //               pagination: { pageIndex: 0, pageSize },
// //               columnVisibility: getInitialColumnVisibility(),
// //             }}
// //             enableColumnOrdering
// //             enableColumnResizing
// //             enableHiding
// //             enablePagination
// //             enableColumnActions
// //             enableSorting={true}
// //             positionToolbarAlertBanner="bottom"
// //             enableStickyHeader
// //             enableColumnDragging={false}
// //             enableStickyFooter
// //             enableColumnPinning
// //             columnFilterDisplayMode="subheader"
// //             columnResizeMode="onEnd"
// //             enableGrouping
// //             muiPaginationProps={{
// //               variant: 'outlined',
// //               shape: 'rounded',
// //               size: 'small',
// //               rowsPerPageOptions: [10, 20, 50, 100, 200],
// //             }}
// //             enableBottomToolbar
// //             enableTopToolbar
// //             enableSelectAll={false}
// //             enableMultiRowSelection={false}
// //             muiTopToolbarProps={{
// //               sx: {
// //                 p: 0,
// //                 mb: 1,
// //                 minHeight: '39px',        // same as Active table
// //                 display: 'flex',
// //                 flexWrap: 'nowrap',
// //                 alignItems: 'center',
// //                 justifyContent: 'space-between',
// //                 overflowX: 'auto',
// //                 '& .MuiButton-root': {
// //                   minWidth: 'auto',
// //                   padding: '2px 6px',
// //                   fontSize: '0.7rem',
// //                 },
// //                 '& .MuiIconButton-root': {
// //                   padding: '2px',
// //                   fontSize: '1rem',
// //                 },
// //                 '& .MuiInputBase-root': {
// //                   fontSize: '0.75rem',
// //                   height: '28px',
// //                 },
// //                 '& .MuiToolbar-root': { minHeight: '30px' },
// //               },
// //             }}
// //             muiBottomToolbarProps={{
// //               sx: {
// //                 p: 0,
// //                 m: 0,
// //                 minHeight: '35px',
// //                 '& .MuiButton-root': {
// //                   minWidth: 'auto',
// //                   padding: '2px 6px',
// //                   fontSize: '0.7rem',
// //                 },
// //                 '& .MuiIconButton-root': {
// //                   padding: '2px',
// //                   fontSize: '1rem',
// //                 },
// //                 '& .MuiInputBase-root': {
// //                   fontSize: '0.75rem',
// //                   height: '28px',
// //                 },
// //                 '& .MuiToolbar-root': { minHeight: '36px' },
// //               },
// //             }}
// //             // Excel download button – Active table style ke jaise hi toolbar mein
// //             renderTopToolbarCustomActions={() =>
// //               isActiveTab ? (
// //                 <Box
// //                   sx={{
// //                     display: 'flex',
// //                     alignItems: 'center',
// //                     justifyContent: 'flex-start', // left align like Active
// //                     gap: 1,
// //                     px: 1,
// //                     mt: 0,                        // NO negative margin
// //                     flexWrap: 'nowrap',
// //                   }}
// //                 >
// //                   <ExcelDownloadButton
// //                     data={rows}              // filtered rows export
// //                     columnOrder={columnOrder}
// //                     tableId={tableId}
// //                     fileName="Ticketing_Report"
// //                   />
// //                 </Box>
// //               ) : null
// //             }
// //           />
// //         </>
// //       )}
// //     </Box>
// //   );
// // };
// // export default TicketingPageTable;

// import React, { useEffect, useState } from 'react';
// import { Box, Tooltip } from '@mui/material';
// import {
//   MaterialReactTable,
//   MRT_ColumnDef,
// } from 'material-react-table';
// import { useSnackbar } from '../../../common/SnackbarProvider';
// import LoadingBox from '../../../common/LoadingBox';
// import ExcelDownloadButton from '../../../common/ExcelDownloadButton';

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
//   drawerOpen?: boolean;
//   drawerWidthCss?: string;
// }

// // ------------ helpers for ticket state colours ------------
// const norm = (v?: string | null) => (v ?? '').toString().trim();

// function getTicketStateColors(raw: string) {
//   const v = norm(raw);
//   if (!v) return { bg: undefined, color: undefined, border: undefined };

//   const lower = v.toLowerCase();

//   if (lower === 'resolved') {
//     return {
//       bg: '#d4edda !important',
//       color: '#155724',
//       border: '1px solid #c3e6cb',
//     };
//   }
//   if (lower === 'creation failed' || lower === 'resolution failed') {
//     return {
//       bg: '#f8d7da !important',
//       color: '#721c24',
//       border: '1px solid #f5c6cb',
//     };
//   }
//   if (lower === 'open') {
//     return {
//       bg: '#ffe5b4 !important',
//       color: '#856404',
//       border: '1px solid #ffcf71',
//     };
//   }

//   // default
//   return { bg: undefined, color: undefined, border: undefined };
// }

// const LOCALSTORAGE_PREFIX = 'visible_columns_map_';

// const TicketingPageTable: React.FC<CommonTableProps> = ({
//   columnOrder,
//   dataObjects,
//   pageSize = 10,
//   viewGraph,
//   setViewGraph, 
//   onRowClick,
//   defaultVisibleColumns,
//   isLoading,
//   isActiveTab = true, // ticketing main tab
//   tableId = 'ticketing-table',
//   drawerOpen = false,
//   drawerWidthCss = '20vw',
// }) => {
//   const { showMessage } = useSnackbar();
  

//   // keep original and filtered rows
//   const [allRows, setAllRows] = useState<Record<string, any>[]>([]);
//   const [rows, setRows] = useState<Record<string, any>[]>([]);

//   useEffect(() => {
//     setAllRows(dataObjects ?? []);
//     setRows(dataObjects ?? []);
//   }, [dataObjects]);

//   const getInitialColumnVisibility = () => {
//     const visibleSet = new Set(defaultVisibleColumns ?? columnOrder);
//     const visibility: Record<string, boolean> = {};
//     columnOrder.forEach((col) => (visibility[col] = visibleSet.has(col)));
//     return visibility;
//   };

//   // ---- NEW: columnVisibility ko controlled + localStorage se hook karo ----
//   const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
//     () => {
//       try {
//         const stored = localStorage.getItem(
//           `${LOCALSTORAGE_PREFIX}${tableId}`,
//         );
//         if (stored) {
//           const parsed = JSON.parse(stored);
//           if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
//             return parsed as Record<string, boolean>;
//           }
//         }
//       } catch {
//         // ignore
//       }
//       return getInitialColumnVisibility();
//     },
//   );

//   // persist to localStorage whenever visibility changes
//   useEffect(() => {
//     try {
//       localStorage.setItem(
//         `${LOCALSTORAGE_PREFIX}${tableId}`,
//         JSON.stringify(columnVisibility),
//       );
//     } catch (e) {
//       console.error('Failed to persist ticketing column visibility', e);
//     }
//   }, [columnVisibility, tableId]);
//   // ------------------------------------------------------------------------

//   const initialColumnSizes: Record<string, number> = {
//     Adapter: 140,
//     Family: 150,
//     'VegayanOSS Ticket': 170,
//     'FS Ticket': 140,
//     'Ticket State': 140,
//     'Alarm Received Time': 180,
//     'Alarm Cleared Time': 150,
//     'OSS DBInsertion(Receive)': 260,
//     'OSS DBInsertion(Clear)': 240,
//     'OSS Ticket Created Time': 250,
//     'OSS Ticket Resolution Time': 270,
//     'FS Error': 140,
//     'Backend Error': 130,
//     'Root Alarm ID': 180,
//     'Node Name': 130,
//     Severity: 100,
//     'IP Address': 160,
//     'Symptom Type': 180,
//     'Ticket Description': 180,
//     'Last Modify Date': 180,
//   };

//   const AdapterBadge = (raw?: string) => {
//     const val = (raw ?? '').trim().toUpperCase();
//     const bg =
//       val === 'MCP'
//         ? '#009688'
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
//     const label = norm(raw); // "Critical" / "Major" / ...
//     return (
//       <Box
//         sx={{
//           display: 'flex',
//           alignItems: 'flex-start',
//           justifyContent: 'flex-start',
//           fontSize: '0.73rem',
//           fontWeight: 500,
//           minWidth: '4.8rem',
//           textTransform: 'none',
//           whiteSpace: 'nowrap',
//         }}
//       >
//         {label || '-'}
//       </Box>
//     );
//   };

//   const columns: MRT_ColumnDef<any>[] = columnOrder.map((col) => {
//     const base: MRT_ColumnDef<any> = {
//       accessorFn: (row) => row[col],
//       id: col,
//       header: col,
//       size: initialColumnSizes[col] ?? 140,
//     };

//     if (col === 'Adapter') {
//       base.Cell = ({ cell }) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
//           {AdapterBadge(cell.getValue<string>())}
//         </Box>
//       );
//       base.enableSorting = false;
//       base.muiTableBodyCellProps = { align: 'center' as const };
//     }

//     if (col === 'Severity') {
//       base.Cell = ({ cell }) => (
//         <Box sx={{ display: 'flex', justifyContent: 'center' }}>
//           <Tooltip title={(cell.getValue<string>() ?? '').toString()}>
//             <span>{sevBadge(cell.getValue<string>())}</span>
//           </Tooltip>
//         </Box>
//       );
//       base.enableSorting = false;
//       base.muiTableBodyCellProps = { align: 'center' as const };
//     }

//     if (col === 'Ticket State') {
//       base.Cell = ({ cell }) => {
//         const value = norm(String(cell.getValue() ?? ''));
//         const { bg, color, border } = getTicketStateColors(value);

//         return (
//           <Box
//             sx={{
//               bgcolor: bg,
//               color,
//               border,
//               borderRadius: '4px',
//               px: 1,
//               py: 0.4,
//               fontSize: '0.72rem',
//               textAlign: 'center',
//               minWidth: '7.5rem',
//               whiteSpace: 'nowrap',
//             }}
//           >
//             {value || '-'}
//           </Box>
//         );
//       };
//       base.enableSorting = false;
//       base.muiTableBodyCellProps = { align: 'center' as const };
//     }

//     return base;
//   });

//   const orderedData = rows.map((obj) =>
//     columnOrder.reduce((acc, key) => {
//       acc[key] = obj[key] ?? '';
//       return acc;
//     }, {} as Record<string, any>),
//   );

//   const showLoading = !dataObjects || dataObjects.length === 0;

//   return (
//     <Box
//       sx={{
//         p: 0,
//         m: 0,
//         borderRadius: 2,
//         border: 1,
//         height: viewGraph ? '45vh' : '83vh',
//       }}
//     >
//       {showLoading ? (
//         <LoadingBox isLoading={isLoading} />
//       ) : (
//         <>
//           <MaterialReactTable
//             columns={columns}
//             data={orderedData}
//             // ---- yahan se MRT ko controlled visibility state dein ----
//             state={{ columnVisibility }}
//             onColumnVisibilityChange={setColumnVisibility}
//             // ---------------------------------------------------------
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
//                     width: drawerOpen
//                       ? `calc(100vw - ${drawerWidthCss})`
//                       : '100vw',
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
//                 py: 0,
//                 fontSize: '0.75rem',
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
//             muiTableBodyRowProps={({ row }) => ({
//               onClick: onRowClick ? () => onRowClick(row.original) : undefined,
//               sx: {
//                 cursor: onRowClick ? 'pointer' : 'default',
//                 backgroundColor:
//                   row.index % 2 === 0 ? '#ffffff' : '#f0f0f0',
//                 '&:hover': {
//                   backgroundColor: onRowClick
//                     ? '#e3f2fd !important'
//                     : 'inherit',
//                 },
//               },
//             })}
//             muiTableBodyCellProps={() => ({
//               sx: {
//                 py: 0.3,
//                 pl: 0.5,
//                 fontSize: '0.7rem',
//                 whiteSpace: 'nowrap',
//                 borderRight: '1px solid grey',
//               },
//             })}
//             initialState={{
//               pagination: { pageIndex: 0, pageSize },
//               columnVisibility: getInitialColumnVisibility(),
//             }}
//             enableColumnOrdering
//             enableColumnResizing
//             enableHiding
//             enablePagination
//             enableColumnActions
//             enableSorting={true}
//             positionToolbarAlertBanner="bottom"
//             enableStickyHeader
//             enableColumnDragging={true}
//             enableStickyFooter
//             enableColumnPinning
//             columnFilterDisplayMode="subheader"
//             columnResizeMode="onEnd"
//             enableGrouping
//             muiPaginationProps={{
//               variant: 'outlined',
//               shape: 'rounded',
//               size: 'small',
//               rowsPerPageOptions: [10, 20, 50, 100, 200],
//             }}
//             enableBottomToolbar
//             enableTopToolbar
//             enableSelectAll={false}
//             enableMultiRowSelection={false}
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
//                   padding: '2px 6px',
//                   fontSize: '0.7rem',
//                 },
//                 '& .MuiIconButton-root': {
//                   padding: '2px',
//                   fontSize: '1rem',
//                 },
//                 '& .MuiInputBase-root': {
//                   fontSize: '0.75rem',
//                   height: '28px',
//                 },
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
//                 '& .MuiIconButton-root': {
//                   padding: '2px',
//                   fontSize: '1rem',
//                 },
//                 '& .MuiInputBase-root': {
//                   fontSize: '0.75rem',
//                   height: '28px',
//                 },
//                 '& .MuiToolbar-root': { minHeight: '36px' },
//               },
//             }}
//             renderTopToolbarCustomActions={() =>
//               isActiveTab ? (
//                 <Box
//                   sx={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'flex-start',
//                     gap: 1,
//                     px: 1,
//                     mt: 0,
//                     flexWrap: 'nowrap',
//                   }}
//                 >
//                   <ExcelDownloadButton
//                     data={rows}
//                     columnOrder={columnOrder}
//                     tableId={tableId}
//                     fileName="Ticketing_Report"
//                   />
//                 </Box>
//               ) : null
//             }
//           />
//         </>
//       )}
//     </Box>
//   );
// };

// export default TicketingPageTable;

import React, { useEffect, useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table';
import { useSnackbar } from '../../../common/SnackbarProvider';
import LoadingBox from '../../../common/LoadingBox';
import ExcelDownloadButton from '../../../common/ExcelDownloadButton';

interface CommonTableProps {
  isLoading?: boolean;
  hasFetchedOnce?: boolean;
  columnOrder: string[];
  dataObjects: Record<string, any>[];
  viewGraph: boolean;
  setViewGraph: (viewGraph: boolean) => void;
  pageSize?: number;
  onRowClick?: (row: Record<string, any>) => void;
  defaultVisibleColumns?: string[];
  isActiveTab?: boolean;
  tableId?: string;
  drawerOpen?: boolean;
  drawerWidthCss?: string;
}

// ------------ helpers for ticket state colours ------------
const norm = (v?: string | null) => (v ?? '').toString().trim();

function getTicketStateColors(raw: string) {
  const v = norm(raw);
  if (!v) return { bg: undefined, color: undefined, border: undefined };

  const lower = v.toLowerCase();

  if (lower === 'resolved') {
    return { bg: '#d4edda !important', color: '#155724', border: '1px solid #c3e6cb' };
  }
  if (lower === 'creation failed' || lower === 'resolution failed') {
    return { bg: '#f8d7da !important', color: '#721c24', border: '1px solid #f5c6cb' };
  }
  if (lower === 'open') {
    return { bg: '#ffe5b4 !important', color: '#856404', border: '1px solid #ffcf71' };
  }
  return { bg: undefined, color: undefined, border: undefined };
}

const LOCALSTORAGE_PREFIX = 'visible_columns_map_';

const TicketingPageTable: React.FC<CommonTableProps> = ({
  columnOrder,
  dataObjects,
  pageSize = 10,
  viewGraph,
  setViewGraph,
  onRowClick,
  defaultVisibleColumns,
  isLoading = false,
  hasFetchedOnce = false, //  ADD DEFAULT
  isActiveTab = true,
  tableId = 'ticketing-table',
  drawerOpen = false,
  drawerWidthCss = '20vw',
}) => {
  const { showMessage } = useSnackbar();

  const [allRows, setAllRows] = useState<Record<string, any>[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);

  

  useEffect(() => {
    setAllRows(dataObjects ?? []);
    setRows(dataObjects ?? []);
  }, [dataObjects]);

  const getInitialColumnVisibility = () => {
    const visibleSet = new Set(defaultVisibleColumns ?? columnOrder);
    const visibility: Record<string, boolean> = {};
    columnOrder.forEach((col) => (visibility[col] = visibleSet.has(col)));
    return visibility;
  };

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(`${LOCALSTORAGE_PREFIX}${tableId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, boolean>;
        }
      }
    } catch {
      // ignore
    }
    return getInitialColumnVisibility();
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        `${LOCALSTORAGE_PREFIX}${tableId}`,
        JSON.stringify(columnVisibility),
      );
    } catch (e) {
      console.error('Failed to persist ticketing column visibility', e);
    }
  }, [columnVisibility, tableId]);

  const initialColumnSizes: Record<string, number> = {
    Adapter: 140,
    Family: 150,
    'VegayanOSS Ticket': 170,
    'FS Ticket': 140,
    'Ticket State': 140,
    'Alarm Received Time': 180,
    'Alarm Cleared Time': 150,
    'OSS DBInsertion(Receive)': 260,
    'OSS DBInsertion(Clear)': 240,
    'OSS Ticket Created Time': 250,
    'OSS Ticket Resolution Time': 270,
    'FS Error': 140,
    'Backend Error': 130,
    'Root Alarm ID': 180,
    'Node Name': 130,
    Severity: 100,
    'IP Address': 160,
    'Symptom Type': 180,
    'Ticket Description': 180,
    'Last Modify Date': 180,
  };

  const AdapterBadge = (raw?: string) => {
    const val = (raw ?? '').trim().toUpperCase();
    const bg = val === 'MCP' ? '#009688' : val === 'NFMT' ? '#8283eb !important' : '#607D8B';
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
    const label = norm(raw);
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          fontSize: '0.73rem',
          fontWeight: 500,
          minWidth: '4.8rem',
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {label || '-'}
      </Box>
    );
  };

  const columns: MRT_ColumnDef<any>[] = columnOrder.map((col) => {
    const base: MRT_ColumnDef<any> = {
      accessorFn: (row) => row[col],
      id: col,
      header: col,
      size: initialColumnSizes[col] ?? 140,
    };

    if (col === 'Adapter') {
      base.Cell = ({ cell }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          {AdapterBadge(cell.getValue<string>())}
        </Box>
      );
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

    if (col === 'Ticket State') {
      base.Cell = ({ cell }) => {
        const value = norm(String(cell.getValue() ?? ''));
        const { bg, color, border } = getTicketStateColors(value);

        return (
          <Box
            sx={{
              bgcolor: bg,
              color,
              border,
              borderRadius: '4px',
              px: 1,
              py: 0.4,
              fontSize: '0.72rem',
              textAlign: 'center',
              minWidth: '7.5rem',
              whiteSpace: 'nowrap',
            }}
          >
            {value || '-'}
          </Box>
        );
      };
      base.enableSorting = false;
      base.muiTableBodyCellProps = { align: 'center' as const };
    }

    return base;
  });

  const orderedData = rows.map((obj) =>
    columnOrder.reduce((acc, key) => {
      acc[key] = obj[key] ?? '';
      return acc;
    }, {} as Record<string, any>),
  );

  // SAME pattern as HistoricFaultTableForSidebar
  const showEmptyMessage = !isLoading && hasFetchedOnce && (!dataObjects || dataObjects.length === 0);
  const showTable = !!dataObjects && dataObjects.length > 0;

  return (
    <Box
      sx={{
        p: 0,
        m: 0,
        borderRadius: 2,
        border: 1,
        height: viewGraph ? '45vh' : '83vh',
      }}
    >
      {isLoading ? (
        <LoadingBox isLoading={true} />
      ) : showEmptyMessage ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            minHeight: '20vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9vw',
            fontWeight: 600,
          }}
        >
          No data is found for this time range. Please select a different time range.
        </Box>
      ) : showTable ? (
        <MaterialReactTable
          columns={columns}
          data={orderedData}
          state={{ columnVisibility }}
          onColumnVisibilityChange={setColumnVisibility}
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
              py: 0,
              fontSize: '0.75rem',
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
              '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '6px' },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '6px',
                '&:hover': { background: '#555' },
              },
              '&::-webkit-scrollbar-corner': { background: '#f1f1f1' },
            },
          }}
          muiTableBodyRowProps={({ row }) => ({
            onClick: onRowClick ? () => onRowClick(row.original) : undefined,
            sx: {
              cursor: onRowClick ? 'pointer' : 'default',
              backgroundColor: row.index % 2 === 0 ? '#ffffff' : '#f0f0f0',
              '&:hover': { backgroundColor: onRowClick ? '#e3f2fd !important' : 'inherit' },
            },
          })}
          muiTableBodyCellProps={() => ({
            sx: {
              py: 0.3,
              pl: 0.5,
              fontSize: '0.7rem',
              whiteSpace: 'nowrap',
              borderRight: '1px solid grey',
            },
          })}
          initialState={{
            pagination: { pageIndex: 0, pageSize },
            columnVisibility: getInitialColumnVisibility(),
          }}
          enableColumnOrdering
          enableColumnResizing
          enableHiding
          enablePagination
          enableColumnActions
          enableSorting={true}
          positionToolbarAlertBanner="bottom"
          enableStickyHeader
          enableColumnDragging={true}
          enableStickyFooter
          enableColumnPinning
          columnFilterDisplayMode="subheader"
          columnResizeMode="onEnd"
          enableGrouping
          muiPaginationProps={{
            variant: 'outlined',
            shape: 'rounded',
            size: 'small',
            rowsPerPageOptions: [10, 20, 50, 100, 200],
          }}
          enableBottomToolbar
          enableTopToolbar
          enableSelectAll={false}
          enableMultiRowSelection={false}
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
              '& .MuiButton-root': { minWidth: 'auto', padding: '2px 6px', fontSize: '0.7rem' },
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
              '& .MuiButton-root': { minWidth: 'auto', padding: '2px 6px', fontSize: '0.7rem' },
              '& .MuiIconButton-root': { padding: '2px', fontSize: '1rem' },
              '& .MuiInputBase-root': { fontSize: '0.75rem', height: '28px' },
              '& .MuiToolbar-root': { minHeight: '36px' },
            },
          }}
          renderTopToolbarCustomActions={() =>
            isActiveTab ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 1,
                  px: 1,
                  mt: 0,
                  flexWrap: 'nowrap',
                }}
              >
                <ExcelDownloadButton
                  data={rows}
                  columnOrder={columnOrder}
                  tableId={tableId}
                  fileName="Ticketing_Report"
                />
              </Box>
            ) : null
          }
        />
      ) : null}
    </Box>
  );
};
export default TicketingPageTable;
