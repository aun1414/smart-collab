import React from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp,
  Group,
  Assignment,
  Description,
  AccessTime,
  FiberManualRecord,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Team {
  _id: string;
  name: string;
}

interface Project {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface Task {
  _id: string;
  name: string;
  status: string;
}

interface Activity {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
}

interface DashboardData {
  getMyTeams: Team[];
  getMyProjects: Project[];
  getMyTasks: Task[];
  getRecentActivity: Activity[];
}

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    getMyTeams {
      _id
      name
    }
    getMyProjects {
      _id
      name
      status
      createdAt
    }
    getMyTasks {
      _id
      name
      status
    }
    getRecentActivity {
      _id
      type
      description
      createdAt
    }
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, error, data } = useQuery<DashboardData>(GET_DASHBOARD_DATA);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getFirstName = (fullName: string) => {
    return fullName?.split(' ')[0] || 'there';
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
        {error.message}
      </Alert>
    );
  }

  const teams = data?.getMyTeams || [];
  const projects = data?.getMyProjects || [];
  const tasks = data?.getMyTasks || [];
  const activities = data?.getRecentActivity || [];

  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <Box>
      {/* Welcome Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Good {getTimeOfDay()}, {getFirstName(user?.name || '')}! 👋
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Ready to tackle today's challenges?
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects')}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Start New Project
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Group sx={{ fontSize: 30, color: 'white' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {teams.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Teams
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Description sx={{ fontSize: 30, color: 'white' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {projects.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Assignment sx={{ fontSize: 30, color: 'white' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {tasks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <TrendingUp sx={{ fontSize: 30, color: 'white' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {Math.round(taskCompletionRate)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Task Completion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Teams Section */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Group sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Your Teams
                </Typography>
              </Box>
              {teams.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No teams yet
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate('/teams')}
                  >
                    Join a Team
                  </Button>
                </Box>
              ) : (
                <List>
                  {teams.slice(0, 5).map((team, index) => (
                    <ListItem key={team._id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          {team.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={team.name}
                        secondary={`Team ${index + 1}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Projects */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Description sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Projects
                </Typography>
              </Box>
              {projects.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No projects yet
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate('/projects')}
                  >
                    Create Project
                  </Button>
                </Box>
              ) : (
                <List>
                  {projects.slice(0, 5).map((project) => (
                    <ListItem key={project._id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                          {project.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={project.name}
                        secondary={
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span 
                              style={{ 
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                border: '1px solid #1976d2',
                                borderRadius: '16px',
                                color: '#1976d2',
                                backgroundColor: 'transparent'
                              }}
                            >
                              {project.status || 'Active'}
                            </span>
                            <span style={{ fontSize: '0.75rem' }}>
                              {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                          </span>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Feed */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccessTime sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Activity
                </Typography>
              </Box>
              {activities.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No recent activity
                  </Typography>
                </Box>
              ) : (
                <List>
                  {activities.slice(0, 6).map((activity, index) => (
                    <React.Fragment key={activity._id || index}>
                      <ListItem sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: 'grey.200' }}>
                            <FiberManualRecord sx={{ fontSize: 12, color: 'success.main' }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {activity.description || `Activity ${index + 1}`}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {activity.createdAt ? new Date(activity.createdAt).toLocaleTimeString() : 'Just now'}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < activities.length - 1 && <Divider variant="inset" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 