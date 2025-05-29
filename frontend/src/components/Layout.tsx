import React from 'react';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Pages that should not show navigation
  const publicPages = ['/login', '/register', '/profile-setup'];
  const isPublicPage = publicPages.includes(location.pathname);

  // Don't show navigation on public pages or when not authenticated
  if (!isAuthenticated || isPublicPage) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isMobile ? 0 : 250}px)` },
          ml: { md: `250px` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
