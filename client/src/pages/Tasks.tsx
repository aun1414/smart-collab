import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface Task {
  _id: string;
  name: string;
  status: string;
  assignedTo?: {
    name: string;
  };
}

interface Project {
  _id: string;
  name: string;
}

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
}

const GET_MY_PROJECTS = gql`
  query GetMyProjects {
    getMyProjects {
      _id
      name
    }
  }
`;

const GET_PROJECT_TASKS = gql`
  query GetProjectTasks($projectId: ID!) {
    getProjectTasksGrouped(projectId: $projectId) {
      Todo {
        _id
        name
        status
        assignedTo {
          name
        }
      }
      InProgress {
        _id
        name
        status
        assignedTo {
          name
        }
      }
      Done {
        _id
        name
        status
        assignedTo {
          name
        }
      }
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      _id
      name
      status
      assignedTo {
        name
      }
    }
  }
`;

const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($taskId: ID!, $status: String!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      _id
      status
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($taskId: ID!) {
    deleteTask(taskId: $taskId)
  }
`;

const validationSchema = yup.object({
  name: yup.string().required('Task name is required'),
  status: yup.string().required('Status is required'),
});

const Tasks = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [open, setOpen] = useState(false);

  const { loading: projectsLoading, error: projectsError, data: projectsData } = useQuery(GET_MY_PROJECTS);
  
  const { loading: tasksLoading, error: tasksError, data: tasksData, refetch } = useQuery(GET_PROJECT_TASKS, {
    variables: { projectId: selectedProject },
    skip: !selectedProject,
  });

  const [createTask] = useMutation(CREATE_TASK);
  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS);
  const [deleteTask] = useMutation(DELETE_TASK);

  const formik = useFormik({
    initialValues: {
      name: '',
      status: 'Todo',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (!selectedProject) {
          alert('Please select a project first');
          return;
        }
        
        const taskInput = {
          ...values,
          projectId: selectedProject,
        };
        
        console.log('Creating task with input:', taskInput);
        
        const result = await createTask({ variables: { input: taskInput } });
        console.log('Task created successfully:', result);
        
        resetForm();
        setOpen(false);
        refetch();
      } catch (err) {
        console.error('Error creating task:', err);
        // Show the error to user
        alert(`Error creating task: ${err.message || 'Unknown error'}`);
      }
    },
  });

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({ variables: { taskId, status: newStatus } });
      refetch();
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask({ variables: { taskId } });
        refetch();
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  const TaskCard = ({ task, onStatusChange, onDelete }: TaskCardProps) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1">{task.name}</Typography>
          <IconButton size="small" color="error" onClick={() => onDelete(task._id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
        {task.assignedTo && (
          <Typography variant="body2" color="text.secondary">
            Assigned to: {task.assignedTo.name}
          </Typography>
        )}
        <Box sx={{ mt: 2 }}>
          <TextField
            select
            size="small"
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            fullWidth
          >
            <MenuItem value="Todo">Todo</MenuItem>
            <MenuItem value="InProgress">In Progress</MenuItem>
            <MenuItem value="Done">Done</MenuItem>
          </TextField>
        </Box>
      </CardContent>
    </Card>
  );

  const projects = projectsData?.getMyProjects ?? [];

  if (!selectedProject) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Select a Project
        </Typography>
        <TextField
          select
          fullWidth
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          label="Project"
        >
          {projects.length > 0 ? (
            projects.map((project: Project) => (
              <MenuItem key={project._id} value={project._id}>
                {project.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>
              {projectsLoading ? 'Loading projects...' : 'No projects available'}
            </MenuItem>
          )}
        </TextField>
      </Box>
    );
  }

  if (projectsLoading || tasksLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (projectsError || tasksError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {projectsError?.message || tasksError?.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        <Box>
          <TextField
            select
            size="small"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            sx={{ mr: 2, minWidth: 200 }}
          >
            {projects.length > 0 ? (
              projects.map((project: Project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                No projects available
              </MenuItem>
            )}
          </TextField>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            New Task
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {['Todo', 'InProgress', 'Done'].map((status) => (
          <Paper key={status} sx={{ p: 2, backgroundColor: 'background.default', minHeight: 400 }}>
            <Typography variant="h6" gutterBottom>
              {status === 'InProgress' ? 'In Progress' : status}
            </Typography>
            {(tasksData?.getProjectTasksGrouped?.[status] ?? []).map((task: Task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </Paper>
        ))}
      </Box>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        disableRestoreFocus={false}
        keepMounted={false}
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              label="Task Name"
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
              label="Status"
              name="status"
              select
              value={formik.values.status}
              onChange={formik.handleChange}
            >
              <MenuItem value="Todo">Todo</MenuItem>
              <MenuItem value="InProgress">In Progress</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
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

export default Tasks;
