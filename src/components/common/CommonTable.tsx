//running code
// import React, { useMemo, useState, useEffect } from 'react';
// import { Box } from '@mui/material';
// import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table';

// interface CommonTableProps {
//   columnOrder: string[];
//   dataObjects: Record<string, any>[];
//   pageSize?: number;
//   onRowClick?: (row: Record<string, any>) => void;
//   /** REQUIRED: shared id with ExcelDownloadButton */
//   tableId: string;
// }

// const LOCALSTORAGE_PREFIX = 'visible_columns_map_';

// const CommonTable: React.FC<CommonTableProps> = ({
//   columnOrder,
//   dataObjects,
//   pageSize = 10,
//   onRowClick,
//   tableId,
// }) => {
//   if (!dataObjects || dataObjects.length === 0) return null;

//   const columns: MRT_ColumnDef<any>[] = useMemo(
//     () =>
//       columnOrder.map((col) => ({
//         accessorFn: (row) => row[col],
//         id: col,
//         header: col,
//       })),
//     [columnOrder],
//   );

//   const buildAllVisible = (keys: string[]) =>
//     keys.reduce((acc, key) => {
//       acc[key] = true;
//       return acc;
//     }, {} as Record<string, boolean>);

//   /** Load map: { [colId]: boolean } */
//   const loadVisibilityMap = (): Record<string, boolean> => {
//     try {
//       const raw = localStorage.getItem(`${LOCALSTORAGE_PREFIX}${tableId}`);
//       if (!raw) return buildAllVisible(columnOrder);
//       const parsed = JSON.parse(raw);
//       if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
//         return buildAllVisible(columnOrder);
//       }
//       // Ensure we have entries for all current columns; unknown/new columns default to visible
//       const map: Record<string, boolean> = { ...parsed };
//       columnOrder.forEach((k) => {
//         if (typeof map[k] !== 'boolean') map[k] = true;
//       });
//       // Drop any keys that no longer exist in columnOrder
//       Object.keys(map).forEach((k) => {
//         if (!columnOrder.includes(k)) delete map[k];
//       });
//       return map;
//     } catch {
//       return buildAllVisible(columnOrder);
//     }
//   };

//   const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
//     () => loadVisibilityMap()
//   );

//   /** Persist the full map whenever it changes. */
//   useEffect(() => {
//     localStorage.setItem(
//       `${LOCALSTORAGE_PREFIX}${tableId}`,
//       JSON.stringify(columnVisibility)
//     );
//   }, [columnVisibility, tableId]);

//   /** If columnOrder changes (rare), normalize the map */
//   useEffect(() => {
//     setColumnVisibility((prev) => {
//       const next = { ...prev };
//       // add new columns as visible
//       columnOrder.forEach((k) => {
//         if (typeof next[k] !== 'boolean') next[k] = true;
//       });
//       // drop removed columns
//       Object.keys(next).forEach((k) => {
//         if (!columnOrder.includes(k)) delete next[k];
//       });
//       return next;
//     });
//   }, [columnOrder]);

//   const orderedData = useMemo(
//     () =>
//       dataObjects.map((obj) =>
//         columnOrder.reduce((acc, key) => {
//           acc[key] = obj[key] ?? '';
//           return acc;
//         }, {} as Record<string, any>),
//       ),
//     [dataObjects, columnOrder],
//   );

//   return (
//     // <Box sx={{ p: 0, m: 0, overflow: 'hidden' }}>
//     <Box
//       sx={{
//         p: 0,
//         m: 0,
//         width: '100%',      // IMPORTANT
//         maxWidth: '100%',
//         overflow: 'hidden',
//       }}
//     >
//       <MaterialReactTable
//       layoutMode="grid"
//         columns={columns}
//         data={orderedData}
//         enableHiding
//         state={{ columnVisibility }}
//         onColumnVisibilityChange={setColumnVisibility}
//         muiTablePaperProps={{
//           sx: {
//             // boxShadow: 'none',
//             // border: '1px solid #e0e0e0',
//             // m: 0,
//             boxShadow: 'none',
//             border: '1px solid #e0e0e0',
//             m: 0,
//             width: '100%',        //  REQUIRED
//             maxWidth: '100%',
//           },
//         }}
//         muiTableHeadCellProps={{
//           sx: {
//             py: 0.2,
//             width: 'auto',
//             fontSize: '0.75rem',
//             fontWeight: 'bold',
//             color: 'white',
//             backgroundColor: '#7e7d7dff',
//             whiteSpace: 'nowrap',
//             position: 'sticky',
//             top: 0,
//             zIndex: 2,
//             '& .MuiSvgIcon-root': { color: 'white !important' },
//             '& .Mui-TableSortLabel-icon': { color: 'white !important' },
//           },
//         }}
//         muiTableBodyCellProps={{
//           sx: {
//             py: 0.4,
//             px: 1,
//             pl: 0.5,
//             fontSize: '0.7rem',
//             whiteSpace: 'nowrap',
//             borderRight: '1px solid grey',
//           },
//         }}

//         muiTableBodyRowProps={({ row }) => ({
//           onClick: onRowClick ? () => onRowClick(row.original) : undefined,
//           sx: {
//             cursor: onRowClick ? 'pointer' : 'default',
//             backgroundColor: row.index % 2 === 0 ? '#ffffff' : '#f0f0f0',
//             '&:hover': { backgroundColor: onRowClick ? '#f5f5f5' : 'inherit' },
//           },
//         })}
//         muiTopToolbarProps={{
//           sx: {
//             p: 0, mb: 1, minHeight: '30px',
//             '& .MuiButton-root': { minWidth: 'auto', padding: '2px 6px', fontSize: '0.7rem' },
//             '& .MuiIconButton-root': { padding: '2px', fontSize: '1rem' },
//             '& .MuiInputBase-root': { fontSize: '0.75rem', height: '28px' },
//             '& .MuiToolbar-root': { minHeight: '30px' },
//           },
//         }}
//         muiBottomToolbarProps={{
//           sx: {
//             p: 0, m: 0, minHeight: '35px',
//             '& .MuiButton-root': { minWidth: 'auto', padding: '2px 6px', fontSize: '0.7rem' },
//             '& .MuiIconButton-root': { padding: '2px', fontSize: '1rem' },
//             '& .MuiInputBase-root': { fontSize: '0.75rem', height: '28px' },
//             '& .MuiToolbar-root': { minHeight: '36px' },
//           },
//         }}
//         enableColumnOrdering
//         muiTableContainerProps={{
//           sx: {

//             width: '100%',          //  KEY FIX
//             maxWidth: '100%',
//             maxHeight: '68vh',
//             overflowY: 'auto',
//             overflowX: 'auto',      //  horizontal scroll if needed
//             position: 'relative',

//             // maxHeight: '68vh', // Make sure only the table body scrolls
//             // overflowY: 'auto', // Enable vertical scrolling for table body
//             // position: 'relative',
//             scrollbarWidth: 'thin',
//             scrollbarColor: '#888 #f1f1f1',
//             '&::-webkit-scrollbar': { width: '12px', height: '12px' },
//             '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '6px' },
//             '&::-webkit-scrollbar-thumb': {
//               background: '#888',
//               borderRadius: '6px',
//               '&:hover': { background: '#555' },
//             },
//             '&::-webkit-scrollbar-corner': { background: '#f1f1f1' },
//           },
//         }}
//         enablePagination
//         enableStickyHeader
//         enableStickyFooter={true}
//         enableGrouping
//         initialState={{
//           pagination: { pageIndex: 0, pageSize },
//         }}
//         muiPaginationProps={{ variant: 'outlined', shape: 'rounded', size: 'small' }}
//         enableBottomToolbar
//         enableTopToolbar
//       />
//     </Box>
//   );
// };
// export default CommonTable;

//working code
// import React, { useMemo, useState, useEffect } from 'react';
// import { Box } from '@mui/material';
// import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table';

// interface CommonTableProps {
//   columnOrder: string[];
//   dataObjects: Record<string, any>[];
//   pageSize?: number;
//   onRowClick?: (row: Record<string, any>) => void;
//   /** REQUIRED: shared id with ExcelDownloadButton */
//   tableId: string;
// }

// const LOCALSTORAGE_PREFIX = 'visible_columns_map_';

// const CommonTable: React.FC<CommonTableProps> = ({
//   columnOrder,
//   dataObjects,
//   pageSize = 10,
//   onRowClick,
//   tableId,
// }) => {
//   if (!dataObjects || dataObjects.length === 0) return null;

//   const columns: MRT_ColumnDef<any>[] = useMemo(
//     () =>
//       columnOrder.map((col) => ({
//         accessorFn: (row) => row[col],
//         id: col,
//         header: col,
//       })),
//     [columnOrder],
//   );

//   const buildAllVisible = (keys: string[]) =>
//     keys.reduce((acc, key) => {
//       acc[key] = true;
//       return acc;
//     }, {} as Record<string, boolean>);

//   /** Load map: { [colId]: boolean } */
//   const loadVisibilityMap = (): Record<string, boolean> => {
//     try {
//       const raw = localStorage.getItem(`${LOCALSTORAGE_PREFIX}${tableId}`);
//       if (!raw) return buildAllVisible(columnOrder);
//       const parsed = JSON.parse(raw);
//       if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
//         return buildAllVisible(columnOrder);
//       }
//       const map: Record<string, boolean> = { ...parsed };
//       columnOrder.forEach((k) => {
//         if (typeof map[k] !== 'boolean') map[k] = true;
//       });
//       Object.keys(map).forEach((k) => {
//         if (!columnOrder.includes(k)) delete map[k];
//       });
//       return map;
//     } catch {
//       return buildAllVisible(columnOrder);
//     }
//   };

//   const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
//     () => loadVisibilityMap()
//   );

//   useEffect(() => {
//     localStorage.setItem(
//       `${LOCALSTORAGE_PREFIX}${tableId}`,
//       JSON.stringify(columnVisibility),
//     );
//   }, [columnVisibility, tableId]);

//   useEffect(() => {
//     setColumnVisibility((prev) => {
//       const next = { ...prev };
//       columnOrder.forEach((k) => {
//         if (typeof next[k] !== 'boolean') next[k] = true;
//       });
//       Object.keys(next).forEach((k) => {
//         if (!columnOrder.includes(k)) delete next[k];
//       });
//       return next;
//     });
//   }, [columnOrder]);

//   const orderedData = useMemo(
//     () =>
//       dataObjects.map((obj) =>
//         columnOrder.reduce((acc, key) => {
//           acc[key] = obj[key] ?? '';
//           return acc;
//         }, {} as Record<string, any>),
//       ),
//     [dataObjects, columnOrder],
//   );

//   return (
//     <Box
//       sx={{
//         p: 0,
//         m: 0,
//         width: '100%',
//         maxWidth: '100%',
//         overflow: 'hidden',
//       }}
//     >
//       <MaterialReactTable
//         layoutMode="grid"
//         columns={columns}
//         data={orderedData}
//         enableHiding
//         state={{ columnVisibility }}
//         onColumnVisibilityChange={setColumnVisibility}
//         muiTablePaperProps={{
//           sx: {
//             boxShadow: 'none',
//             border: '1px solid #e0e0e0',
//             m: 0,
//             width: '100%',
//             maxWidth: '100%',
//           },
//         }}
//         muiTableHeadCellProps={{
//           sx: {
//             py: 0.2,
//             px: 1,
//             width: 'auto',
//             fontSize: '0.75rem',
//             fontWeight: 'bold',
//             color: 'white',
//             backgroundColor: '#7e7d7dff',
//             whiteSpace: 'nowrap',
//             overflow: 'hidden',
//             textOverflow: 'ellipsis',
//             maxWidth: 180,
            
//             position: 'sticky',
//             top: 0,
//             zIndex: 2,
//             borderRight: '1px solid grey',
//             '& .MuiSvgIcon-root': { color: 'white !important' },
//             '& .Mui-TableSortLabel-icon': { color: 'white !important' },
//           },
//         }}
//         muiTableBodyCellProps={{
//           sx: {
//             py: 0.4,
//             px: 1,
//             pl: 0.5,
//             fontSize: '0.7rem',
//             whiteSpace: 'nowrap',
//             borderRight: '1px solid grey',
//           },
          
//         }}
        
//         muiTableBodyRowProps={({ row }) => ({
//           onClick: onRowClick ? () => onRowClick(row.original) : undefined,
//           sx: {
//             cursor: onRowClick ? 'pointer' : 'default',
//             backgroundColor: row.index % 2 === 0 ? '#ffffff' : '#f0f0f0',
//             '&:hover': { backgroundColor: onRowClick ? '#f5f5f5' : 'inherit' },
//           },
//         })}
//         muiTopToolbarProps={{
//           sx: {
//             p: 0,
//             mb: 1,
//             minHeight: '30px',
//             '& .MuiButton-root': { minWidth: 'auto', padding: '2px 6px', fontSize: '0.7rem' },
//             '& .MuiIconButton-root': { padding: '2px', fontSize: '1rem' },
//             '& .MuiInputBase-root': { fontSize: '0.75rem', height: '28px' },
//             '& .MuiToolbar-root': { minHeight: '30px' },
//           },
//         }}
//         muiBottomToolbarProps={{
//           sx: {
//             p: 0,
//             m: 0,
//             minHeight: '35px',
//             '& .MuiButton-root': { minWidth: 'auto', padding: '2px 6px', fontSize: '0.7rem' },
//             '& .MuiIconButton-root': { padding: '2px', fontSize: '1rem' },
//             '& .MuiInputBase-root': { fontSize: '0.75rem', height: '28px' },
//             '& .MuiToolbar-root': { minHeight: '36px' },
//           },
//         }}
//         enableColumnOrdering
//         muiTableContainerProps={{
//           sx: {
//             width: '100%',
//             maxWidth: '100%',
//             maxHeight: '68vh',
//             overflowY: 'auto',
//             overflowX: 'auto',
//             position: 'relative',
//             scrollbarWidth: 'thin',
//             scrollbarColor: '#888 #f1f1f1',
//             '&::-webkit-scrollbar': { width: '12px', height: '12px' },
//             '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '6px' },
//             '&::-webkit-scrollbar-thumb': {
//               background: '#888',
//               borderRadius: '6px',
//               '&:hover': { background: '#555' },
//             },
//             '&::-webkit-scrollbar-corner': { background: '#f1f1f1' },
//           },
//         }}
//         enablePagination
//         enableStickyHeader
//         enableStickyFooter={true}
//         enableColumnDragging={true}
//         enableColumnResizing={true}
//         enableGrouping
//         initialState={{
//           pagination: { pageIndex: 0, pageSize },
//         }}
//         muiPaginationProps={{ variant: 'outlined', shape: 'rounded', size: 'small' }}
//         enableBottomToolbar
//         enableTopToolbar
//       />
//     </Box>
//   );
// };
// export default CommonTable;



import React, { useMemo, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table';

interface CommonTableProps {
  columnOrder: string[];
  dataObjects: Record<string, any>[];
  pageSize?: number;
  onRowClick?: (row: Record<string, any>) => void;
  /** REQUIRED: shared id with ExcelDownloadButton */
  tableId: string;
}

const LOCALSTORAGE_PREFIX = 'visible_columns_map_';

const CommonTable: React.FC<CommonTableProps> = ({
  columnOrder,
  dataObjects,
  pageSize = 10,
  onRowClick,
  tableId,
}) => {
  if (!dataObjects || dataObjects.length === 0) return null;

  const columns: MRT_ColumnDef<any>[] = useMemo(
    () =>
      columnOrder.map((col) => ({
        accessorFn: (row) => row[col],
        id: col,
        header: col,
      })),
    [columnOrder],
  );

  const buildAllVisible = (keys: string[]) =>
    keys.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);

  const loadVisibilityMap = (): Record<string, boolean> => {
    try {
      const raw = localStorage.getItem(`${LOCALSTORAGE_PREFIX}${tableId}`);
      if (!raw) return buildAllVisible(columnOrder);
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return buildAllVisible(columnOrder);
      }
      const map: Record<string, boolean> = { ...parsed };
      columnOrder.forEach((k) => {
        if (typeof map[k] !== 'boolean') map[k] = true;
      });
      Object.keys(map).forEach((k) => {
        if (!columnOrder.includes(k)) delete map[k];
      });
      return map;
    } catch {
      return buildAllVisible(columnOrder);
    }
  };

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    () => loadVisibilityMap(),
  );

  useEffect(() => {
    localStorage.setItem(
      `${LOCALSTORAGE_PREFIX}${tableId}`,
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility, tableId]);

  useEffect(() => {
    setColumnVisibility((prev) => {
      const next = { ...prev };
      columnOrder.forEach((k) => {
        if (typeof next[k] !== 'boolean') next[k] = true;
      });
      Object.keys(next).forEach((k) => {
        if (!columnOrder.includes(k)) delete next[k];
      });
      return next;
    });
  }, [columnOrder]);

  const orderedData = useMemo(
    () =>
      dataObjects.map((obj) =>
        columnOrder.reduce((acc, key) => {
          acc[key] = obj[key] ?? '';
          return acc;
        }, {} as Record<string, any>),
      ),
    [dataObjects, columnOrder],
  );

  return (
    <Box
      sx={{
        p: 0,
        m: 0,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <MaterialReactTable
        layoutMode="grid"
        columns={columns}
        data={orderedData}
        enableHiding

        /*  RESIZING ON */
        enableColumnResizing
        columnResizeMode="onEnd"

        state={{ columnVisibility }}
        onColumnVisibilityChange={setColumnVisibility}

        muiTablePaperProps={{
          sx: {
            boxShadow: 'none',
            border: '1px solid #e0e0e0',
            m: 0,
            width: '100%',
            maxWidth: '100%',
          },
        }}

        /* HERE IS THE MAIN FIX (mota divider always visible) */
        muiTableHeadCellProps={{
          sx: {
            py: 0.2,
            px: 1,
            width: 'auto',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: '#7e7d7dff',
            whiteSpace: 'nowrap',
            maxWidth: 180,
            position: 'sticky',
            top: 0,
            zIndex: 2,

            // divider between columns (thicker)
            borderRight: '3px solid rgba(0,0,0,0.35)',

            //  make room + allow overlay divider
            overflow: 'visible',

            '& .MuiSvgIcon-root': { color: 'white !important' },
            '& .Mui-TableSortLabel-icon': { color: 'white !important' },

            //  Always-visible “resize line” effect (visual only)
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              height: '100%',
              width: '0.1px', // thick line
              backgroundColor: 'rgba(0,0,0,0.28)',
              pointerEvents: 'none', // sorting/filtering break na ho
            },

            '&:hover::after': {
              width: '0.1px',
              backgroundColor: 'rgba(0,0,0,0.45)',
            },
          },
        }}

        muiTableBodyCellProps={{
          sx: {
            py: 0.4,
            px: 1,
            pl: 0.5,
            fontSize: '0.7rem',
            whiteSpace: 'nowrap',
            borderRight: '1px solid grey',
          },
        }}

        muiTableBodyRowProps={({ row }) => ({
          onClick: onRowClick ? () => onRowClick(row.original) : undefined,
          sx: {
            cursor: onRowClick ? 'pointer' : 'default',
            backgroundColor: row.index % 2 === 0 ? '#ffffff' : '#f0f0f0',
            '&:hover': { backgroundColor: onRowClick ? '#f5f5f5' : 'inherit' },
          },
        })}

        muiTopToolbarProps={{
          sx: {
            p: 0,
            mb: 1,
            minHeight: '30px',
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

        enableColumnOrdering

        muiTableContainerProps={{
          sx: {
            width: '100%',
            maxWidth: '100%',
            maxHeight: '68vh',
            overflowY: 'auto',
            overflowX: 'auto',
            position: 'relative',
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

        enablePagination
        enableStickyHeader
        enableStickyFooter
        enableColumnDragging
        enableGrouping
        initialState={{
          pagination: { pageIndex: 0, pageSize },
        }}
        muiPaginationProps={{ variant: 'outlined', shape: 'rounded', size: 'small' }}
        enableBottomToolbar
        enableTopToolbar
      />
    </Box>
  );
};
export default CommonTable;
