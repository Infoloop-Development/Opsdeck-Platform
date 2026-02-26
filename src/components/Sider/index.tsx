'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Drawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  useTheme,
  useMediaQuery,
  Tooltip,
  styled,
  Collapse,
  Typography,
  Stack,
  Box,
  Chip,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { usePathname, useRouter } from 'next/navigation';
import { accessTokenKey, appbarHeight, drawerWidth } from '@/utils/constants';
import { Scrollbar } from '../Scrollbar';
import { selectCurrentUser } from '@/redux/selectors';
import Spinner from '../Spinner';
import { useSelector } from 'react-redux';
import { adminItems, regularItems, superUserItemsWithAdmin } from '@/utils/routes';
import { safeLocalStorageGet } from '@/utils/helpers';

interface SiderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isSuperUser?: boolean;
  userRole?: string;
}

interface SidebarProject {
  id: string;
  name: string;
  status: string;
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'In Progress':
    case 'Progress':
      return {
        chipBg: 'rgba(251, 140, 0, 0.15)',
        chipColor: 'rgba(251, 140, 0, 1)',
        cardBg: 'rgba(251, 140, 0, 0.06)',
        barColor: 'rgba(251, 140, 0, 1)',
      };
    case 'Planning':
      return {
        chipBg: 'rgba(124, 77, 255, 0.15)',
        chipColor: 'rgba(124, 77, 255, 1)',
        cardBg: 'rgba(124, 77, 255, 0.06)',
        barColor: 'rgba(124, 77, 255, 1)',
      };
    case 'Completed':
      return {
        chipBg: 'rgba(34, 197, 94, 0.15)',
        chipColor: 'rgba(34, 197, 94, 1)',
        cardBg: 'rgba(34, 197, 94, 0.06)',
        barColor: 'rgba(34, 197, 94, 1)',
      };
    case 'Pending':
    default:
      return {
        chipBg: 'rgba(148, 163, 184, 0.15)',
        chipColor: 'rgba(148, 163, 184, 1)',
        cardBg: 'rgba(148, 163, 184, 0.06)',
        barColor: 'rgba(148, 163, 184, 1)',
      };
  }
};

const StyledDrawer = styled(Drawer)(({ open, theme }) => ({
  '& .MuiDrawer-paper.MuiDrawer-paperAnchorLeft': {
    top: appbarHeight - 1,
    width: !open ? `calc(${theme.spacing(8)} + 20px)` : drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.easeInOut,
      duration: '0.3s',
    }),
    height: `calc(100vh - ${appbarHeight}px)`,
    overflowY: 'auto',
    borderLeft: 'none',
  },
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  overflowX: 'hidden',
  width: !open ? `calc(${theme.spacing(8)} + 20px)` : drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.easeInOut,
    duration: '0.3s',
  }),
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: "8px 18px",
  borderRadius: "50px !important",
  outline: "1px solid",
  outlineColor: theme.palette.mode === "dark" ? "#2A2F3A" : "#F5F5F5",
  /* Text */
  "& .MuiListItemText-primary": {
    color: theme.palette.mode === "dark"
      ? "#FFFFFF"
      : "#1f2937",
    fontWeight: 500,
  },
  /* Icon */
  "& .MuiListItemIcon-root": {
    color: theme.palette.mode === "dark"
      ? "#FFFFFF"
      : "#1f2937",
  },
  "&.Mui-selected": {
    background: "#88dbff !important",
    color: "#1f2937",

    /* Fake gradient border (correct way) */
    position: "relative",
    outline: "none",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      padding: "1px",
      borderRadius: "5px",
      // background: "linear-gradient(90deg, #005B8E 0%, #03D7FE 100%)",
      WebkitMask:
        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      pointerEvents: "none",
    },

    "& .MuiListItemText-primary": {
      color: "#000",
    },
    "& .MuiListItemIcon-root": {
      color: "#000",
    },
  },
}));

const StyledNestedListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: '2px 15px 2px 40px',
  paddingLeft: theme.spacing(3),
  '&.Mui-selected': {
    // outline: `1px solid ${theme.palette.primary.main}`,
    // backgroundColor: theme.palette.action.selected,
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '&:hover': {
      backgroundColor: 'theme.palette.action.selected',
    },
  },
}));

// ✅ PERFECTLY MATCHES YOUR routes.tsx STRUCTURE
const getSiderItems = (isSuperUser: boolean, userRole?: string): any[] => {
  console.log('🔍 Sider Debug:', { isSuperUser, userRole });

  // ✅ SUPER ADMIN - FULL ACCESS (matches superUserItemsWithAdmin)
  if (userRole === 'Super Admin' || isSuperUser === true) {
    console.log('🛡️ SUPER ADMIN → superUserItemsWithAdmin (FULL MENU)');
    return superUserItemsWithAdmin; // 14+ items with Organization, Plans, Admin
  }

  // ✅ ADMIN - adminItems (no Organization/Plans)
  if (userRole === 'Admin') {
    console.log('👑 ADMIN → adminItems');
    return adminItems; // Projects, Department, Admin (no Organization/Plans)
  }

  // ✅ REGULAR - regularItems (most limited)
  console.log('👤 REGULAR → regularItems');
  return regularItems; // Only basic items
};

const Sider: React.FC<SiderProps> = ({
  collapsed,
  setCollapsed,
  isSuperUser: propIsSuperUser, // From Layout: selectSuperuser
  userRole: propUserRole, // From Layout: userInfo?.role
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // ✅ BACKUP: Redux fallback (if Layout props missing)
  const reduxState = useSelector(selectCurrentUser) as any; // Type assertion
  const reduxUserRole = reduxState?.data?.user?.role || reduxState?.user?.role || undefined;
  const reduxIsSystemAdmin =
    (reduxState?.data?.user?.isSystemAdmin as boolean) ||
    (reduxState?.user?.isSystemAdmin as boolean) ||
    false;

  console.log('🔍 ALL ROLES:', {
    propUserRole, // Layout: userInfo?.role → "Super Admin"
    propIsSuperUser, // Layout: selectSuperuser → true/false
    reduxUserRole, // Backup
    reduxIsSystemAdmin, // Backup
  });

  const getRouteKey = (path: string) => {
    const normalized = path.split('?')[0].split('#')[0];
    if (normalized === '/dashboard') return 'projects'; // Default to projects
    if (!normalized.startsWith('/dashboard/')) return normalized.replace(/^\/+/, '');
    return normalized.replace('/dashboard/', '');
  };

  const routeMatches = (routeKey: string, currentKey: string) =>
    currentKey === routeKey || currentKey.startsWith(`${routeKey}/`);

  const getMenuPath = (routeKey: string) => {
    // ✅ FIXED: Handle your exact route keys from routes.tsx
    if (routeKey === 'admin') return '/dashboard/admin/users';
    if (routeKey === 'admin/departments') return '/dashboard/admin/departments';
    if (routeKey === 'admin/organization') return '/dashboard/admin/organization';
    return `/dashboard/${routeKey}`;
  };

  const [selected, setSelected] = useState(getRouteKey(pathname));
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [navigating, setNavigating] = useState(false);
  const [latestProjects, setLatestProjects] = useState<SidebarProject[]>([]);
  const [latestProjectsLoading, setLatestProjectsLoading] = useState<boolean>(false);

  // ✅ PRIORITY: Props from Layout > Redux backup
  const finalUserRole = propUserRole || reduxUserRole;
  const finalIsSuperUser = propIsSuperUser || reduxIsSystemAdmin;

  const siderItems = useMemo(() => {
    const items = getSiderItems(finalIsSuperUser, finalUserRole);
    console.log('✅ FINAL MENU COUNT:', items.length);
    console.log(
      '✅ MENU TITLES:',
      items.map((i: any) => `${i.title} (${i.key})`)
    );
    return items;
  }, [finalIsSuperUser, finalUserRole]);

  // useEffect(() => {
  //   const fetchLatestProjects = async () => {
  //     setLatestProjectsLoading(true);
  //     try {
  //       const token = safeLocalStorageGet(accessTokenKey);
  //       if (!token) {
  //         setLatestProjects([]);
  //         return;
  //       }
  //       const response = await axios.get('/api/projects?limit=6&sortBy=createdAt&sortOrder=desc', {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       if (response.data?.success && Array.isArray(response.data.projects)) {
  //         const mapped: SidebarProject[] = response.data.projects.map((p: any) => ({
  //           id: String(p._id),
  //           name: p.name || 'Untitled Project',
  //           status: p.status || 'Pending',
  //         }));
  //         setLatestProjects(mapped);
  //       } else {
  //         setLatestProjects([]);
  //       }
  //     } catch (error) {
  //       console.error('Projects error:', error);
  //       setLatestProjects([]);
  //     } finally {
  //       setLatestProjectsLoading(false);
  //     }
  //   };
  //   fetchLatestProjects();
  // }, []);

  useEffect(() => {
    const key = getRouteKey(pathname);
    setSelected(key);
    setNavigating(false);

    // Auto-open parent menus with selected children
    siderItems.forEach((item: any) => {
      if (item.children?.length > 0) {
        const hasSelectedChild = item.children.some((child: any) => routeMatches(child.key, key));
        if (hasSelectedChild && !openMenus[item.key]) {
          setOpenMenus((prev) => ({ ...prev, [item.key]: true }));
        }
      }
    });
  }, [pathname, siderItems]);

  const handleClick = useCallback(
    (path: string) => {
      if (navigating || pathname === path) return;
      setNavigating(true);
      router.push(path);
      if (isSmallScreen) setCollapsed(true);
    },
    [navigating, pathname, router, isSmallScreen, setCollapsed]
  );

  const handleMenuToggle = useCallback((key: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: prev[key] !== true, // Toggle: undefined/false → true, true → false
    }));
  }, []);

  const renderMenuItem = useCallback(
    (item: any) => {
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openMenus[item.key] || false;
      const isSelected =
        routeMatches(item.key, selected) ||
        (hasChildren && item.children.some((child: any) => routeMatches(child.key, selected)));

      if (hasChildren) {
        return (
          <React.Fragment key={item.key}>
            <Tooltip title={collapsed ? item.title : ''} placement="right">
              <StyledListItemButton
                selected={isSelected}
                style={{ borderRadius: theme.shape.borderRadius }}
                onClick={() => !collapsed && handleMenuToggle(item.key)}
              >
                <ListItemIcon sx={{ minWidth: '32px', py: 0.5 }}>{item.icon}</ListItemIcon>
                {!collapsed && <ListItemText sx={{ py: 0, my: 0 }} primary={item.title} />}
                {!collapsed && (isOpen ? <ExpandLess /> : <ExpandMore />)}
              </StyledListItemButton>
            </Tooltip>
            <Collapse in={isOpen && !collapsed} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((child: any) => (
                  <Tooltip key={child.key} title={collapsed ? child.title : ''} placement="right">
                    <StyledNestedListItemButton
                      selected={routeMatches(child.key, selected)}
                      style={{ borderRadius: theme.shape.borderRadius }}
                      onClick={() => handleClick(getMenuPath(child.key))}
                    >
                      <ListItemIcon sx={{ minWidth: '32px', py: 0.5 }}>{child.icon}</ListItemIcon>
                      {!collapsed && <ListItemText sx={{ py: 0, my: 0 }} primary={child.title} />}
                    </StyledNestedListItemButton>
                  </Tooltip>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        );
      }

      return (
        <Tooltip key={item.key} title={collapsed ? item.title : ''} placement="right">
          <StyledListItemButton
            selected={routeMatches(item.key, selected)}
            style={{ borderRadius: theme.shape.borderRadius }}
            onClick={() => handleClick(getMenuPath(item.key))}
          >
            <ListItemIcon sx={{ minWidth: '32px', py: 0.5 }}>{item.icon}</ListItemIcon>
            {!collapsed && <ListItemText sx={{ py: 0, my: 0 }} primary={item.title} />}
          </StyledListItemButton>
        </Tooltip>
      );
    },
    [collapsed, selected, openMenus, theme.shape.borderRadius, handleClick, handleMenuToggle]
  );

  return (
    <StyledDrawer
      className="sidebar_design"
      variant={isSmallScreen ? 'temporary' : 'permanent'}
      open={!collapsed}
      onClose={() => setCollapsed(true)}
    >
      <Scrollbar>
        <List>{siderItems.map(renderMenuItem)}</List>
        {/* {!collapsed && (
          <Box sx={{ px: '14px', my: '20px' }}>
            <Typography
              variant="subtitle2"
              sx={{ letterSpacing: '0.12em', color: 'text.secondary', mb: 2 }}
            >
              LATEST PROJECTS
            </Typography>
            <Stack spacing={1}>
              {latestProjectsLoading ? (
                <Typography variant="body2" color="text.secondary">
                  Loading...
                </Typography>
              ) : latestProjects.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No recent projects
                </Typography>
              ) : (
                latestProjects.map((item) => {
                  const styles = getStatusStyles(item.status || 'Pending');
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: '8px',
                        py: '8px',
                        borderRadius: '5px',
                        backgroundColor: styles.cardBg,
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      onClick={() => router.push(`/projects/${item.id}/tasks`)}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 8,
                          bottom: 8,
                          height: 25,
                          width: 2,
                          borderRadius: 1,
                          backgroundColor: styles.barColor,
                        }}
                      />
                      <Typography
                        fontWeight={500}
                        fontSize={13}
                        noWrap
                        sx={{
                          maxWidth: 120,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          backgroundColor: styles.chipBg,
                          color: styles.chipColor,
                          fontWeight: 500,
                          minWidth: 'fit-content !important',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      />
                    </Box>
                  );
                })
              )}
            </Stack>
            <Box
              sx={(theme) => ({
                mt: 1,
                px: '8px',
                py: '8px',
                borderRadius: '5px',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#EEF0F4',
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F5F7FB',
                },
              })}
              onClick={() => router.push('/dashboard/projects')}
            >
              <Typography
                fontWeight={500}
                fontSize={13}
                sx={(theme) => ({
                  color:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.7)'
                      : theme.palette.text.secondary,
                })}
              >
                View all Projects
              </Typography>
              <ArrowRightAltIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        )} */}
      </Scrollbar>
    </StyledDrawer>
  );
};

export default Sider;