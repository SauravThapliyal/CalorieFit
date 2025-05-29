import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Badge,
  Avatar,
  LinearProgress,
  Alert,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  EmojiEvents,
  FitnessCenter,
  Restaurant,
  TrendingUp,
  LocalFireDepartment,
  Timer,
  Star,
  Lock,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { achievementApi } from '../services/api';

const Achievements: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const [allAchievements, earnedAchievements] = await Promise.all([
        achievementApi.getAll(),
        achievementApi.getUserAchievements(),
      ]);

      setAchievements(Array.isArray(allAchievements) ? allAchievements : []);
      setUserAchievements(Array.isArray(earnedAchievements) ? earnedAchievements : []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAchievements = async () => {
    try {
      await achievementApi.checkAchievements();
      fetchAchievements(); // Refresh data
    } catch (err) {
      console.error('Error checking achievements:', err);
      setError('Failed to check achievements');
    }
  };

  const formatNumber = (num: number | undefined | null, decimals: number = 2): string => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Number(num).toFixed(decimals);
  };

  const getAchievementIcon = (type: string | number | undefined) => {
    const typeStr = String(type || 'general').toLowerCase();
    switch (typeStr) {
      case 'exercise':
      case 'workout':
      case '1':
        return <FitnessCenter />;
      case 'nutrition':
      case 'meal':
      case '2':
        return <Restaurant />;
      case 'weight':
      case '3':
        return <TrendingUp />;
      case 'streak':
      case '4':
        return <LocalFireDepartment />;
      case 'time':
      case '5':
        return <Timer />;
      default:
        return <EmojiEvents />;
    }
  };

  const getAchievementColor = (type: string | number | undefined) => {
    const typeStr = String(type || 'general').toLowerCase();
    switch (typeStr) {
      case 'exercise':
      case 'workout':
      case '1':
        return 'primary';
      case 'nutrition':
      case 'meal':
      case '2':
        return 'secondary';
      case 'weight':
      case '3':
        return 'success';
      case 'streak':
      case '4':
        return 'error';
      case 'time':
      case '5':
        return 'info';
      default:
        return 'warning';
    }
  };

  const isAchievementEarned = (achievementId: number) => {
    return userAchievements.some(ua => ua.achievementId === achievementId);
  };

  const getEarnedDate = (achievementId: number) => {
    const earned = userAchievements.find(ua => ua.achievementId === achievementId);
    return earned ? earned.earnedAt : null;
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

  const earnedCount = userAchievements.length;
  const totalCount = achievements.length;
  const stats = {
    totalAchievements: totalCount,
    earnedAchievements: earnedCount,
    totalPoints: earnedCount * 100,
  };

  const earnedAchievements = achievements.filter(a => isAchievementEarned(a.id));
  const availableAchievements = achievements.filter(a => !isAchievementEarned(a.id));

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Achievements & Badges
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your milestones and celebrate your fitness journey
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleCheckAchievements}
        >
          Check Progress
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {stats.earnedAchievements}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Achievements Earned
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Star sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {stats.totalPoints}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Points
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {formatNumber((stats.earnedAchievements / stats.totalAchievements) * 100, 0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completion Rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(stats.earnedAchievements / stats.totalAchievements) * 100}
                color="success"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Achievements Grid */}
      <Typography variant="h5" gutterBottom>
        All Achievements
      </Typography>

      {/* Tabs for filtering */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label={`All (${achievements.length})`} />
          <Tab label={`Earned (${earnedCount})`} />
          <Tab label={`Available (${availableAchievements.length})`} />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {(tabValue === 0 ? achievements :
          tabValue === 1 ? earnedAchievements :
          availableAchievements).map((achievement) => {
          const isEarned = isAchievementEarned(achievement.id);
          const earnedDate = getEarnedDate(achievement.id);
          const achievementType = achievement.type || 'general';
          const color = getAchievementColor(achievementType);

          return (
            <Grid item xs={12} sm={6} md={4} key={achievement.id}>
              <Card
                sx={{
                  height: '100%',
                  opacity: isEarned ? 1 : 0.7,
                  border: isEarned ? 2 : 0,
                  borderColor: isEarned ? `${color}.main` : 'transparent',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Badge
                      badgeContent={isEarned ? <CheckCircle sx={{ fontSize: 16 }} /> : null}
                      color="success"
                    >
                      <Avatar
                        sx={{
                          bgcolor: `${color}.main`,
                          width: 56,
                          height: 56,
                        }}
                      >
                        {getAchievementIcon(achievementType)}
                      </Avatar>
                    </Badge>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6" component="div">
                        {achievement.title}
                      </Typography>
                      {isEarned && earnedDate && (
                        <Typography variant="caption" color="success.main">
                          Earned on {new Date(earnedDate).toLocaleDateString()}
                        </Typography>
                      )}
                      {!isEarned && (
                        <Chip
                          icon={<Lock />}
                          label="Locked"
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {achievement.description}
                  </Typography>

                  {achievement.targetValue && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Target: {formatNumber(achievement.targetValue, 0)} {achievement.unit || ''}
                      </Typography>
                    </Box>
                  )}

                  {achievement.points && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={<Star />}
                        label={`${achievement.points} points`}
                        size="small"
                        color="warning"
                        variant={isEarned ? "filled" : "outlined"}
                      />
                    </Box>
                  )}

                  {isEarned && (
                    <Box sx={{
                      textAlign: 'center',
                      py: 1,
                      backgroundColor: `${color}.light`,
                      borderRadius: 1,
                      mt: 1
                    }}>
                      <Typography variant="body2" color={`${color}.dark`}>
                        🎉 Achievement Unlocked!
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {achievements.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <EmojiEvents sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No achievements available yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start your fitness journey to unlock achievements!
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Achievements;
