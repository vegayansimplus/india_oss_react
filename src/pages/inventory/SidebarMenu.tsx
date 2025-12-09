import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Box,
  IconButton,
  Divider,
  Badge,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  ChevronLeft as MuiChevronLeft,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import useRouteNavigator from "../../utils/customNevigator/useRouterNevigator";

const drawerWidth = "18.5vw";

type SubMenuItem = { title: string; path: string; newTab?: boolean };
type ChildMenuItem = {
  title: string;
  path?: string;
  newTab?: boolean;
  children?: SubMenuItem[];
};
type MenuItem = {
  title: string;
  icon?: React.ReactNode;
  path?: string;
  children?: ChildMenuItem[];
};

type SidebarMenuProps = {
  open: boolean;
  onClose: () => void;
  /** Height of your fixed top navbar (AppBar). Typical: 64 desktop, 56 mobile */
  appBarHeight?: string | number;
};

const INVENTORY_BASE = "/inventory";
const toInventory = (p?: string) =>
  p ? `${INVENTORY_BASE}/${p.replace(/^\/+/, "")}` : INVENTORY_BASE;

const menuItems: MenuItem[] = [
  {
    title: "MCP (Ciena)",
    // icon: <BookOpen size={16} />,
    children: [
      {
        title: "NE List Report",
        path: "ciena/ne-list-report",
      },
      {
        title: "Equipment Details Report",
        path: "ciena/equipment-details-report",
      },
      {
        title: "Channel Details Report",
        path: "ciena/channel-details-report",
      },
    ],
  },
  {
    title: "NFMT (NOKIA)",
    // icon: <Server size={16} />,
    children: [
      {
        title: "Device Details Report",
        path: "nfmt/device-details-report",
      },
      {
        title: "Equipment Details Report",
        path: "nfmt/equipment-details-report",
      },
    ],
  },
];

export default function SidebarMenu({
  open,
  onClose,
  appBarHeight = "5vh",
}: SidebarMenuProps) {
  const { goTo } = useRouteNavigator();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const isActivePath = (rel?: string) =>
    rel ? location.pathname === toInventory(rel) : false;

  const handleToggle = (menu: string) => {
    setOpenMenu((p) => (p === menu ? null : menu));
    setOpenSubMenu(null);
  };

  const handleSubToggle = (key: string) =>
    setOpenSubMenu((p) => (p === key ? null : key));

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          // Offset the drawer below your AppBar and adjust its height
          top: appBarHeight,
          height: `calc(100vh - ${appBarHeight}px)`,
          position: "fixed",
          // keep it under/behind the AppBar if needed
          zIndex: (theme) => theme.zIndex.appBar - 1,

          borderRight: "1px solid rgba(0,0,0,0.12)",
          backgroundImage: `
            radial-gradient(60% 40% at 30% 10%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%),
            linear-gradient(180deg, #f8f5f1 0%, #f3efe9 100%)
          `,
          backgroundColor: "#f7f3ee",
          color: "#2b2b2b",
          paddingTop: "0.6vh",
          boxShadow:
            "inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 6px 12px rgba(0,0,0,0.04)",
          fontFamily:
            'Georgia, "Times New Roman", Times, "Iowan Old Style", "Palatino Linotype", serif',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: "0.65vw",
          py: "0.6vh",
        }}
      >
        <Box
          sx={{
            fontVariant: "small-caps",
            letterSpacing: "0.04vw",
            fontWeight: 700,
            fontSize: "2.6vh",
            color: "#3a332c",
          }}
        >
          Inventory
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#4b433b",
            "&:hover": { color: "#2f2a25", background: "transparent" },
          }}
        >
          <MuiChevronLeft />
        </IconButton>
      </Box>

      <Divider
        sx={{ my: "0.3vh", borderColor: "rgba(0,0,0,0.08)", mx: "0.5vw" }}
      />

      <List disablePadding>
        {menuItems.map((item, idx) => {
          const isOpen = openMenu === item.title;
          const itemActive = isActivePath(item.path);
          const key = `menu-${item.title}-${idx}`;

          return (
            <Box key={key} sx={{ mx: "0.3vw" }}>
              <ListItemButton
                onClick={() => {
                  if (item.children) handleToggle(item.title);
                  else if (item.path) goTo(toInventory(item.path));
                }}
                sx={{
                  mx: "0.4vw",
                  mb: "0.15vh",
                  borderRadius: "0.3vw",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: isOpen
                    ? "inset 0 0 0 1px rgba(0,0,0,0.05)"
                    : "none",
                  background: itemActive
                    ? "linear-gradient(180deg, #efe9e1 0%, #e9e2d8 100%)"
                    : "transparent",
                  "&:hover": {
                    background:
                      "linear-gradient(180deg, rgba(239,233,225,0.6) 0%, rgba(233,226,216,0.6) 100%)",
                  },
                  transition: "all .18s ease",
                  py: "0.5vh",
                  pl: "0.65vw",
                  pr: "0.5vw",
                  color: "#3b332c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* LEFT Section */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "0.5vw" }}
                >
                  {/* <Box
                    sx={{
                      width: "1.6vw",
                      height: "1.6vw",
                      minWidth: "22px",
                      minHeight: "22px",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "999px",
                      background: "rgba(0,0,0,0.06)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                      color: "#4a4139",
                      fontSize: "0.9vw",
                    }}
                  >
                    {item.icon ?? <BookOpen size={14} />}
                  </Box> */}
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: 600,
                        fontSize: "2.4vh",
                        letterSpacing: "0.015vw",
                        color: "#3a332c",
                      },
                    }}
                  />
                </Box>

                {/* RIGHT Section */}
                {item.children && (
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "0.5vw" }}
                  >
                    <Badge
                      color="default"
                      sx={{
                        "& .MuiBadge-badge": {
                          bgcolor: "#d8cfc4",
                          color: "#3b332c",
                          fontWeight: 600,
                          fontSize: "1.5vh",
                          minWidth: "1.3vw",
                          height: "1.3vw",
                          border: "1px solid rgba(0,0,0,0.08)",
                        },
                      }}
                      badgeContent={item.children.length}
                    />
                    {isOpen ? (
                      <ExpandLess
                        sx={{ color: "#6a5f54", fontSize: "1.5vw" }}
                      />
                    ) : (
                      <ExpandMore
                        sx={{ color: "#6a5f54", fontSize: "1.5vw" }}
                      />
                    )}
                  </Box>
                )}
              </ListItemButton>

              {item.children && (
                <Collapse
                  in={isOpen}
                  timeout={180}
                  unmountOnExit
                  sx={{ ml: "0.8vw", mr: "0.65vw" }}
                >
                  <List component="div" disablePadding sx={{ mb: "0.3vh" }}>
                    {item.children.map((child, cIdx) => {
                      const subKey = `${item.title}-${child.title}-${cIdx}`;
                      const isSubOpen = openSubMenu === subKey;
                      const childActive = isActivePath(child.path);

                      return (
                        <Box key={subKey}>
                          <ListItemButton
                            sx={{
                              borderRadius: "0.3vw",
                              my: "0.5vh",
                              pl: "1.5vw",
                              pr: "0.5vw",
                              py: "0.8vh",
                              border: "1px dashed rgba(0,0,0,0.08)",
                              bgcolor: childActive
                                ? "rgba(0,0,0,0.04)"
                                : isSubOpen
                                ? "rgba(0,0,0,0.03)"
                                : "transparent",
                              "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                            }}
                            onClick={() => {
                              if (child.children) handleSubToggle(subKey);
                              else if (child.path) goTo(toInventory(child.path));
                            }}
                          >
                            <ListItemText
                              primary={child.title}
                              primaryTypographyProps={{
                                sx: {
                                  fontSize: "2.3vh",
                                  color: "#3e3831",
                                  fontWeight: 500,
                                },
                              }}
                            />
                            {child.children &&
                              (isSubOpen ? (
                                <ExpandLess
                                  fontSize="small"
                                  sx={{ color: "#6a5f54", fontSize: "2.3vw" }}
                                />
                              ) : (
                                <ExpandMore
                                  fontSize="small"
                                  sx={{ color: "#6a5f54", fontSize: "2.3vw" }}
                                />
                              ))}
                          </ListItemButton>

                          {child.children && (
                            <Collapse
                              in={isSubOpen}
                              timeout={160}
                              unmountOnExit
                              sx={{ ml: "0.5vw" }}
                            >
                              <List component="div" disablePadding>
                                {child.children.map((subChild, sIdx) => {
                                  const full = toInventory(subChild.path);
                                  const active = location.pathname === full;
                                  return (
                                    <ListItemButton
                                      key={`${subKey}-${sIdx}`}
                                      sx={{
                                        borderRadius: "0.3vw",
                                        my: "0.5vh",
                                        pl: "1.8vw",
                                        pr: "0.5vw",
                                        py: "0.8vh",
                                        "&:hover": {
                                          backgroundColor: "rgba(0,0,0,0.04)",
                                        },
                                        background: active
                                          ? "linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))"
                                          : "transparent",
                                      }}
                                      onClick={() => goTo(full)}
                                    >
                                      <ListItemText
                                        primary={subChild.title}
                                        primaryTypographyProps={{
                                          sx: {
                                            fontSize: "1.5vh",
                                            color: active
                                              ? "#382f26"
                                              : "#4b433b",
                                            fontWeight: 550,
                                          },
                                        }}
                                      />
                                    </ListItemButton>
                                  );
                                })}
                              </List>
                            </Collapse>
                          )}
                        </Box>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>

      <Box
        sx={{
          mt: "auto",
          px: "1vw",
          py: "0.8vh",
          color: "#6b6157",
          fontSize: "0.85vh",
          borderTop: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {""}
      </Box>
    </Drawer>
  );
}
