import React, { useState } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  People,
  Inventory,
  Assessment,
  Settings,
  Receipt,
} from '@mui/icons-material';
import SidebarToggle from './SidebarToggle';

const DRAWER_WIDTH = 280;

interface SidebarToggleExampleProps {
  children?: React.ReactNode;
}

const SidebarToggleExample: React.FC<SidebarToggleExampleProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleToggle = (open: boolean) => {
    setSidebarOpen(open);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, href: '/app/dashboard' },
    { text: 'Customers', icon: <People />, href: '/app/customers' },
    { text: 'Inventory', icon: <Inventory />, href: '/app/inventory' },
    { text: 'Quotes', icon: <Receipt />, href: '/app/quotes' },
    { text: 'Reports', icon: <Assessment />, href: '/app/reports' },
    { text: 'Settings', icon: <Settings />, href: '/app/settings' },
  ];

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%' }}>
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Apparel Quoter
        </Typography>
      </Box>
      <List sx={{ pt: 1 }}>
        {menuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              sx={{
                mx: 1,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.main,
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar Toggle Button */}
      <SidebarToggle open={sidebarOpen} onToggle={handleToggle} />

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: sidebarOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: sidebarOpen && !isMobile ? 0 : 0,
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Demo Content */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Sidebar Toggle Demo
          </Typography>
          <Typography variant="body1" paragraph>
            Click the toggle button on the left edge to open/close the sidebar.
            The button remains fixed at 50% viewport height and rotates the chevron icon.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current sidebar state: <strong>{sidebarOpen ? 'Open' : 'Closed'}</strong>
          </Typography>
          
          {/* Custom content can be passed as children */}
          {children}
          
          {/* Demo content */}
          <Box sx={{ mt: 4, p: 2, backgroundColor: theme.palette.background.paper, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Features Demonstrated:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Fixed position toggle button at 50% viewport height" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Chevron icon rotates 180° when toggled" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Background color #6E55FF with hover effects" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Rounded right side, flush left edge" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• High z-index (1200) stays above content" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Responsive design for mobile devices" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Light/dark theme support" />
              </ListItem>
            </List>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarToggleExample;
