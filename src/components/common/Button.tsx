import React from "react";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

interface CustomIconButtonProps {
  onClick: () => void;
  iconType?: "menu" | "close";
}

const CustomIconButton: React.FC<CustomIconButtonProps> = ({
  onClick,
  iconType = "menu",
}) => {
  const renderIcon = () => {
    switch (iconType) {
      case "close":
        return <CloseIcon />;
      case "menu":
      default:
        return <MenuIcon />;
    }
  };

  return (
    <IconButton color="inherit" onClick={onClick} edge="start">
      {renderIcon()}
    </IconButton>
  );
};

export default CustomIconButton;
