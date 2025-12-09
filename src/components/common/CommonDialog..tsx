import { Dialog, DialogTitle, DialogContent, IconButton, DialogActions, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { ReactNode } from "react";

interface CommonDialogProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  actions?: React.ReactNode; // optional footer actions
  showCloseIcon?: boolean;   // toggle X button in title
}

const CommonDialog: React.FC<CommonDialogProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = "md",
  fullWidth = true,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      {title && (
        <DialogTitle sx={{ m: 0, p: 1.5, fontSize: "1rem" }}>
          {title}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent sx={{ p: 1 }}>{children}</DialogContent>
    </Dialog>
  );
};
export default CommonDialog;