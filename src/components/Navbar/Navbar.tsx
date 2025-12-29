import React, { useState } from "react";
import { AppBar, Toolbar, Button, Menu, MenuItem, Box } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/lightstormlogo.png";
import UserMenu from "./UserMenu";
import  DateTimeDisplay  from "./DateTimeDisplay";

type NavItem =
  | { type: "menu"; label: string; options: { label: string; path: string }[] }
  | { type: "link"; label: string; path: string };

const NAV_ITEMS: NavItem[] = [
  {
    type: "menu",
    label: "FAULT",
    options: [
      { label: "Active", path: "/faults/active" },
      { label: "Historic", path: "/faults/historical" },
      { label: "Ticketing", path: "/faults/ticketing" },
    ],
  },
  { type: "link", label: "INVENTORY", path: "/inventory" },
];

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>, label: string) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(label);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOpenMenu(null);
  };
  const handleMenuItemClick = (path: string) => {
    navigate(path);
    handleClose();
  };

  // shared button styles
  const btnSx = {
    justifyContent: "center",
    textTransform: "none" as const,
    ":hover": { backgroundColor: "#008080" },
    px: "1vw",
    py: 0,
    height: "3vh",
    minHeight: "3vh",
    fontSize: "3vh",
    whiteSpace: "nowrap" as const,
    color: "white !important",
    Width: "7vw",
    maxWidth: "10vw",
    display: "flex",
    alignItems: "center",
    "& .MuiSvgIcon-root": { color: "white !important" },
  };

  const labelSx = {
    color: "#fff",
    fontSize: "1.5vh",
    whiteSpace: "nowrap" as const,
  };

  return (
    <AppBar position="static" color="default" sx={{ height: "5vh", justifyContent: "center" }}>
      <Toolbar
        disableGutters
        sx={{
          height: "100%",
          minHeight: "unset !important",
          px: "1vw",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left: Logo + Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "0.6vw" }}>
          <Box
            component="img"
            src={logo}
            alt="LightStorm Logo"
            sx={{ height: "4vh", width: "auto", mr: "0.6vw", display: { xs: "none", sm: "block" } }}
          />

          {/* Buttons from NAV_ITEMS */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "0.4vw" }}>
            {NAV_ITEMS.map((item) => {
              if (item.type === "link") {
                return (
                  <Button
                    key={item.label}
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={btnSx}
                    onClick={() => navigate(item.path)}
                  >
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ gap: "0.1vw" }}>
                      <Box component="span" sx={labelSx}>
                        {item.label}
                      </Box>
                    </Box>
                  </Button>
                );
              }

              // dropdown menu
              return (
                <Box key={item.label} sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={btnSx}
                    onClick={(e) => handleOpen(e, item.label)}
                  >
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ gap: "0.1vw" }}>
                      <Box component="span" sx={labelSx}>
                        {item.label}
                      </Box>
                      <ArrowDropDownIcon sx={{ fontSize: "4vh", color: "#fff" }} />
                    </Box>
                  </Button>

                  <Menu
                    anchorEl={anchorEl}
                    open={openMenu === item.label}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    slotProps={{
                      paper: {
                        sx: {
                          width: "6.5vw",
                          mt: 0,
                          backgroundColor: "transparent",
                          boxShadow: "none",
                          "& .MuiMenu-list": { padding: 0 },
                        },
                      },
                    }}
                    MenuListProps={{ sx: { padding: 0 } }}
                  >
                    {item.options.map((opt) => (
                      <MenuItem
                        key={opt.path}
                        onClick={() => handleMenuItemClick(opt.path)}
                        sx={{
                          backgroundColor: "#004d40",
                          color: "#fff",
                          fontSize: "1.6vh",
                          height: "3vh",
                          display: "flex",
                          justifyContent: "flex-start",
                          textAlign: "left",
                          whiteSpace: "nowrap",
                          px: "1vw",
                          borderBottom: "0.1vh solid white",
                          "&:hover": { backgroundColor: "#008080" },
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Right: pushes time + user menu to the far right */}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: "1vw" }}>
          <DateTimeDisplay />
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default Navbar;
