import React, { useState } from "react";
import { IconButton, Tooltip, Menu, MenuItem, Fade } from "@mui/material";
import xlsIcon from "../../assets/xls.png";
import { downloadExcel } from "../../utils/excelUtils";

interface ExcelDownloadButtonProps {
  /** Data as shown in the table (rows of objects) */
  data: any[];
  /** Column order used in the table; we’ll honor this order in the export */
  columnOrder: string[];
  /** MUST match the table's tableId so we read the same visibility state */
  tableId: string;
  fileName?: string;
  tooltip?: string;
  disabled?: boolean;
}
const LOCALSTORAGE_PREFIX = "visible_columns_map_";
const ExcelDownloadButton: React.FC<ExcelDownloadButtonProps> = ({
  data,
  columnOrder,
  tableId,
  fileName = "Export",
  // tooltip = "Download Excel",
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) setAnchorEl(event.currentTarget);
  };
  const handleMouseLeave = () => setAnchorEl(null);

  /** Read the visibility map straight from localStorage (fresh each click). */
  const readVisibilityMap = (): Record<string, boolean> | null => {
    try {
      const raw = localStorage.getItem(`${LOCALSTORAGE_PREFIX}${tableId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, boolean>;
      }
      return null;
    } catch {
      return null;
    }
  };

  /** Get the visible columns (ordered by columnOrder) from storage. */
  const getVisibleColumnsOrdered = (): string[] => {
    const visMap = readVisibilityMap();
    if (!visMap) {
      // if no saved map, assume all visible (common initial case)
      return [...columnOrder];
    }
    return columnOrder.filter((col) => visMap[col] !== false); // true/undefined => visible; only explicit false is hidden
  };

  const handleDownload = (type: "selected" | "all") => {
    if (!data || data.length === 0) {
      setAnchorEl(null);
      return;
    }

    let exportColumns: string[];
    if (type === "all") {
      // gather all keys seen across rows, but keep columnOrder first, then any extras (if any)
      const allKeys = Array.from(new Set(data.flatMap((r: any) => Object.keys(r))));
      const orderedKnown = columnOrder.filter((k) => allKeys.includes(k));
      const extras = allKeys.filter((k) => !columnOrder.includes(k));
      exportColumns = [...orderedKnown, ...extras];
    } else {
      // "selected" => only visible columns, ordered by columnOrder
      const visible = getVisibleColumnsOrdered();
      if (!visible.length) {
        console.warn("No visible columns found; exporting nothing.");
        exportColumns = []; // explicit: empty set if user hid everything
      } else {
        exportColumns = visible;
      }
    }

    // Build export rows with columns in the exact exportColumns order
    const exportData = data.map((row: any) => {
      const out: Record<string, any> = {};
      exportColumns.forEach((k) => (out[k] = row?.[k]));
      return out;
    });

    const nameSuffix = type === "selected" ? "_selected" : "_all";
    downloadExcel(exportData, `${fileName}${nameSuffix}`);
    setAnchorEl(null);
  };

  return (
    <Tooltip title={""}>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ position: "relative", display: "inline-block" }}
      >
        <IconButton
          color="success"
          size="small"
          disabled={disabled || !data || data.length === 0}
        >
          <img
            src={xlsIcon}
            alt="Download Excel"
            style={{ width: 25, height: 25, cursor: "pointer", marginTop: 3, marginLeft: 22 }}
          />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMouseLeave}
          TransitionComponent={Fade}
          PaperProps={{
            onMouseEnter: () => { },
            onMouseLeave: handleMouseLeave,
            sx: {
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
              width: 240,
              height: 0,
              minHeight: 80,
              py: 0.5,
              px: 1,
              '& .MuiMenuItem-root': {
                fontSize: '0.85rem',
                py: 0.8,
                borderRadius: '6px',
              },
              '& .MuiMenuItem-root:hover': {
                backgroundColor: '#f5f5f5',
                fontWeight: 600,
              },
            },
          }}
        >
          <MenuItem onClick={() => handleDownload("selected")}>
            📘 Download Selected Columns
          </MenuItem>
          <MenuItem onClick={() => handleDownload("all")}>
            📗 Download All Columns
          </MenuItem>
        </Menu>
      </span>
    </Tooltip>
  );
};
export default ExcelDownloadButton;




