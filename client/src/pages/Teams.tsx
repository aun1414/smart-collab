import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Group as GroupIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  PersonAdd as PersonAddIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

interface Member {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
}

interface Team {
  _id: string;
  name: string;
  description?: string;
  members: Member[];
  owner: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const GET_TEAMS = gql`
  query GetMyTeams {
    getMyTeams {
      _id
      name
      description
      members {
        _id
        name
        email
      }
      owner {
        _id
        name
      }
      createdAt
    }
  }
`;

const CREATE_TEAM = gql`
  mutation CreateTeam($input: CreateTeamInput!) {
    createTeam(input: $input) {
      _id
      name
      description
      members {
        _id
        name
        email
      }
      owner {
        _id
        name
      }
    }
  }
`;

const INVITE_MEMBER = gql`
  mutation InviteMember($teamId: ID!, $email: String!) {
    inviteMember(teamId: $teamId, email: $email) {
      _id
      name
      description
      members {
        _id
        name
        email
      }
      owner {
        _id
        name
      }
    }
  }
`;

const validationSchema = yup.object({
  name: yup.string().required('Team name is required'),
  description: yup.string(),
});

const inviteSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

const Teams = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const { loading, error, data, refetch } = useQuery(GET_TEAMS);
  const [createTeam] = useMutation(CREATE_TEAM);
  const [inviteMember] = useMutation(INVITE_MEMBER);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createTeam({
          variables: {
            input: values,
          },
        });
        resetForm();
        setOpen(false);
        refetch();
      } catch (err) {
        console.error('Error creating team:', err);
      }
    },
  });

  const inviteFormik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: inviteSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!selectedTeam) return;
      try {
        await inviteMember({
          variables: {
            teamId: selectedTeam._id,
            email: values.email,
          },
        });
        resetForm();
        setInviteOpen(false);
        setSelectedTeam(null);
        refetch();
      } catch (err) {
        console.error('Error inviting member:', err);
      }
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, teamId: string) => {
    setAnchorEl({ ...anchorEl, [teamId]: event.currentTarget });
  };

  const handleMenuClose = (teamId: string) => {
    setAnchorEl({ ...anchorEl, [teamId]: null });
  };

  const handleInvite = (team: Team) => {
    setSelectedTeam(team);
    setInviteOpen(true);
    handleMenuClose(team._id);
  };

  const isOwner = (team: Team) => {
    return team.owner._id === user?._id;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Teams
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Collaborate with your team members
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          size="large"
        >
          Create Team
        </Button>
      </Box>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
          }}
        >
          <GroupIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            No teams yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Create your first team to start collaborating
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            size="large"
          >
            Create Your First Team
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {teams.map((team: Team) => (
            <Grid item xs={12} md={6} lg={4} key={team._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 50,
                        height: 50,
                        mr: 2,
                        fontSize: '1.2rem',
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(team.name)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {team.name}
                      </Typography>
                      {isOwner(team) && (
                        <Chip
                          icon={<StarIcon />}
                          label="Owner"
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      )}
                      {team.description && (
                        <Typography variant="body2" color="text.secondary">
                          {team.description}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, team._id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {/* Members List */}
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Members ({team.members.length})
                  </Typography>
                  <List dense>
                    {team.members.slice(0, 3).map((member: Member) => (
                      <ListItem key={member._id} sx={{ px: 0, py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 30, height: 30, fontSize: '0.8rem' }}>
                            {getInitials(member.name)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {member.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {member.role}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                    {team.members.length > 3 && (
                      <Typography variant="caption" color="text.secondary" sx={{ pl: 5 }}>
                        +{team.members.length - 3} more
                      </Typography>
                    )}
                  </List>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  {isOwner(team) && (
                    <Button
                      size="small"
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleInvite(team)}
                    >
                      Invite Member
                    </Button>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    Created {new Date(team.createdAt).toLocaleDateString()}
                  </Typography>
                </CardActions>

                {/* Team Menu */}
                <Menu
                  anchorEl={anchorEl[team._id]}
                  open={Boolean(anchorEl[team._id])}
                  onClose={() => handleMenuClose(team._id)}
                >
                  {isOwner(team) && (
                    <MenuItem onClick={() => handleInvite(team)}>
                      <PersonAddIcon sx={{ mr: 1 }} />
                      Invite Member
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => handleMenuClose(team._id)}>
                    View Details
                  </MenuItem>
                </Menu>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Team Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus={false}
        keepMounted={false}
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              label="Team Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              autoFocus
              InputProps={{
                startAdornment: <GroupIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description (Optional)"
              name="description"
              multiline
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Team
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog 
        open={inviteOpen} 
        onClose={() => setInviteOpen(false)} 
        maxWidth="sm" 
        fullWidth
        disableRestoreFocus={false}
        keepMounted={false}
      >
        <form onSubmit={inviteFormik.handleSubmit}>
          <DialogTitle>
            Invite Member to {selectedTeam?.name}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the email address of the person you want to invite to this team.
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Email Address"
              name="email"
              type="email"
              value={inviteFormik.values.email}
              onChange={inviteFormik.handleChange}
              error={inviteFormik.touched.email && Boolean(inviteFormik.errors.email)}
              helperText={inviteFormik.touched.email && inviteFormik.errors.email}
              autoFocus
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Send Invitation
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Teams; 