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
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface ProjectWithTeam {
  _id: string;
  name: string;
  team: {
    _id: string;
    name: string;
  };
  createdBy: {
    name: string;
  };
}

interface Team {
  _id: string;
  name: string;
}

const GET_TEAMS_AND_PROJECTS = gql`
  query GetTeamsAndProjects {
    getMyTeams {
      _id
      name
    }
    getMyProjects {
      _id
      name
      team {
        _id
        name
      }
      createdBy {
        name
      }
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      _id
      name
      team {
        _id
        name
      }
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($projectId: ID!) {
    deleteProject(projectId: $projectId)
  }
`;

const validationSchema = yup.object({
  name: yup.string().required('Project name is required'),
  teamId: yup.string().required('Team is required'),
});

const Projects = () => {
  const [open, setOpen] = useState(false);
  const { loading, error, data, refetch } = useQuery(GET_TEAMS_AND_PROJECTS);
  const [createProject] = useMutation(CREATE_PROJECT);
  const [deleteProject] = useMutation(DELETE_PROJECT);

  const formik = useFormik({
    initialValues: {
      name: '',
      teamId: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createProject({
          variables: {
            input: values,
          },
        });
        resetForm();
        setOpen(false);
        refetch();
      } catch (err) {
        console.error('Error creating project:', err);
      }
    },
  });

  const handleDelete = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject({
          variables: { projectId },
        });
        refetch();
      } catch (err) {
        console.error('Error deleting project:', err);
      }
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          New Project
        </Button>
      </Box>

      <Grid container spacing={3}>
        {data?.getMyProjects?.map((project: ProjectWithTeam) => (
          <Grid item xs={12} sm={6} md={4} key={project._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Team: {project.team.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created by: {project.createdBy.name}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="error" onClick={() => handleDelete(project._id)}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        disableRestoreFocus={false}
        keepMounted={false}
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              label="Project Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              autoFocus
            />
            <TextField
              fullWidth
              margin="normal"
              label="Team"
              name="teamId"
              select
              value={formik.values.teamId}
              onChange={formik.handleChange}
              error={formik.touched.teamId && Boolean(formik.errors.teamId)}
              helperText={formik.touched.teamId && formik.errors.teamId}
            >
              {data?.getMyTeams?.map((team: Team) => (
                <MenuItem key={team._id} value={team._id}>
                  {team.name}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Projects; 