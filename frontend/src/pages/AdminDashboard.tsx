import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AdminPanelSettings,
  FitnessCenter,
  Restaurant,
  EmojiEvents,
  Add,
  Dashboard,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ExerciseManagement from '../components/admin/ExerciseManagement';
import AdminStats from '../components/admin/AdminStats';
import FoodManagement from '../components/admin/FoodManagement';
import AchievementManagement from '../components/admin/AchievementManagement';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user has admin role
    if (user.role !== 'Admin') {
      setError('Access denied. Admin privileges required.');
      setTimeout(() => navigate('/dashboard'), 3000);
      return;
    }

    setLoading(false);
  }, [user, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AdminPanelSettings sx={{ mr: 2, verticalAlign: 'middle' }} />
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage exercises, foods, achievements, and system settings
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab
            label="Overview"
            icon={<Dashboard />}
            iconPosition="start"
          />
          <Tab
            label="Exercises"
            icon={<FitnessCenter />}
            iconPosition="start"
          />
          <Tab
            label="Foods"
            icon={<Restaurant />}
            iconPosition="start"
          />
          <Tab
            label="Achievements"
            icon={<EmojiEvents />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <AdminStats />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ExerciseManagement />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <FoodManagement />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <AchievementManagement />
      </TabPanel>
    </Container>
  );
};

export default AdminDashboard;
