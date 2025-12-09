import React, { useMemo, useState } from "react";
import {
    Box, Typography, IconButton, Menu, MenuItem, Divider,
    Chip, ListItemIcon, Tooltip,} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../store/userSlice";
import type { RootState } from "../../store/store";
import logoLightStorm from "../../../public/lightstormlogoRemovebg.png";
import logoVegayan from "../../../src/assets/logo_vega.png";


function UserMenu() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // Prefer Vite-style env var; fallback to CRA-style; final fallback is hardcoded
    const APP_VERSION = "v1.0.0";

    // You can set company name from user/org or keep a constant
    const COMPANY_NAME = "LightStorm Networks";

    const initials = useMemo(() => {
        const name = user?.userName || "";
        const parts = name.split(/\s+/).filter(Boolean);
        return (parts[0]?.[0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
    }, [user?.userName]);

    const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        dispatch(clearUser());
        sessionStorage.clear();
        window.location.href = "/login";
    };
    const copyVersion = async () => {
        try {
            await navigator.clipboard.writeText(APP_VERSION);
        } catch { }
    };

    if (!user) return null;

    return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* Compact identity pill (logo + name) */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.6vh", pr: "0.4vw" }}>
                <Box
                    component="img"
                    src={logoLightStorm}
                    alt="Company"
                    sx={{ height: "3vh", width: "auto", display: "block" }}
                />
                <Typography
                    sx={{
                        fontSize: "0.9vw",
                        mr: 0,
                        color: "#302828ff",
                        fontWeight: 600,
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                    }}
                    title={COMPANY_NAME}
                >
                    Hello, {user.userName}
                </Typography>
            </Box>

            <Tooltip title="Account menu">
                <IconButton onClick={handleMenuClick} sx={{ color: "#302828ff" }}>
                    <ArrowDropDownIcon sx={{ fontSize: "4vh" }} />
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 0,
                            ml:"0.8vh",
                            width: 300,
                            borderRadius: 2,
                            overflow: "hidden",
                            
                            
                        },
                    },
                }}
            >
                {/* Header section */}
                <Box
                    sx={{
                        px: 1,
                        py: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        bgcolor: "#f5f7fb",
                    }}
                >
                    {/* Round initials avatar */}
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: "#e6efff",
                            color: "#2a3b8f",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            letterSpacing: 0.5,
                            fontSize: 14,
                            flexShrink: 0,
                            border: "1px solid #d7e2ff",
                        }}
                    >
                        {initials || <AccountCircleOutlinedIcon />}
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                color: "#1b2430",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {user.userName}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 12,
                                color: "#5b6473",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                            title={"mail@mail.com"}
                        >
                            {"mail@mail.com"}
                        </Typography>
                    </Box>
                </Box>
                <Divider />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, m: 1 }}>
                     <Chip
                        size="small"
                        // icon={<BusinessOutlinedIcon sx={{ fontSize: 16 }} />}
                        label="Build Release"
                        sx={{
                            height: 22,
                            "& .MuiChip-label": { px: 0.8, fontSize: 11, fontWeight: 600 },
                        }}
                    />
                    <Chip
                        size="small"
                        // icon={<VerifiedOutlinedIcon sx={{ fontSize: 16 }} />}
                        label={APP_VERSION}
                        onClick={copyVersion}
                        sx={{
                            height: 22,
                            "& .MuiChip-label": { px: 0.8, fontSize: 11, fontWeight: 700 },
                        }}
                    />
                   
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: "0.6vh", pr: "0.4vw" ,ml:1, mb:1}}>
                    <Box
                        component="img"
                        src={logoVegayan}
                        alt="Company"
                        sx={{ height: "2vh", width: "auto", display: "block" }}
                    />
                    <Typography
                        sx={{
                            fontSize: "0.9vw",
                            mr: 0,
                            color: "#302828ff",
                            fontWeight: 600,
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Powered by SiMPLuS &copy; Vegayan Systems.
                    </Typography>
                </Box>
              

                <Divider />

                {/* Actions */}
                {/* <MenuItem onClick={gotoProfile}>
          <ListItemIcon>
            <AccountCircleOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>

        <MenuItem onClick={gotoSettings}>
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem> */}

                {/* <MenuItem onClick={openHelp}>
          <ListItemIcon>
            <HelpOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Help / Docs
        </MenuItem> */}

                {/* <MenuItem onClick={openAbout}>
          <ListItemIcon>
            <InfoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          About
        </MenuItem> */}

                <Divider />

                {/* Secondary row with copy actions */}
                {/* {user?.userId && (
                    <MenuItem
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(String(user.userId));
                            } catch { }
                            handleClose();
                        }}
                    >
                        <ListItemIcon>
                            <ContentCopyOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        Copy User ID
                    </MenuItem>
                )} */}

                <Divider />

                {/* Logout */}
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: "#d64545",
                        fontWeight: 700,
                        "& .MuiListItemIcon-root": { color: "#d64545" },
                    }}
                >
                    <ListItemIcon>
                        <LogoutOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default UserMenu;
