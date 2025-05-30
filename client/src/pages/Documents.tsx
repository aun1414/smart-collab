import React, { useCallback, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Paper,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { Description as DocumentIcon } from '@mui/icons-material';

interface Project {
  _id: string;
  name: string;
}

interface Document {
  _id: string;
  name: string;
  summary: string;
  uploadedBy: {
    name: string;
  };
  createdAt: string;
}

const GET_MY_PROJECTS = gql`
  query GetMyProjects {
    getMyProjects {
      _id
      name
    }
  }
`;

const GET_PROJECT_DOCUMENTS = gql`
  query GetProjectDocuments($projectId: ID!) {
    getProjectDocuments(projectId: $projectId) {
      _id
      name
      summary
      uploadedBy {
        name
      }
      createdAt
    }
  }
`;

const Documents = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const { loading: projectsLoading, error: projectsError, data: projectsData } = useQuery(GET_MY_PROJECTS);
  
  const { loading: documentsLoading, error: documentsError, data: documentsData, refetch } = useQuery(GET_PROJECT_DOCUMENTS, {
    variables: { projectId: selectedProject },
    skip: !selectedProject,
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!selectedProject) {
        alert('Please select a project first');
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);
      formData.append('projectId', selectedProject);

      try {
        const response = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        refetch();
      } catch (err) {
        console.error('Error uploading document:', err);
        alert('Failed to upload document');
      } finally {
        setUploading(false);
      }
    },
    [selectedProject, refetch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
      'text/plain': ['.txt'],
    },
  });

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
          {projectsData?.getMyProjects?.length > 0 ? (
            projectsData.getMyProjects.map((project: Project) => (
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

  if (projectsLoading) {
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

  if (projectsError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {projectsError.message}
      </Alert>
    );
  }

  if (documentsLoading) {
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

  if (documentsError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {documentsError.message}
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
          Documents
        </Typography>
        <TextField
          select
          size="small"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {projectsData?.getMyProjects?.length > 0 ? (
            projectsData.getMyProjects.map((project: Project) => (
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
      </Box>

      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 4,
          textAlign: 'center',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          cursor: 'pointer',
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Drop files here or click to upload
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: PDF, DOC, DOCX, TXT
            </Typography>
          </>
        )}
      </Paper>

      <Grid container spacing={3}>
        {documentsData?.getProjectDocuments?.map((doc: Document) => (
          <Grid item xs={12} sm={6} md={4} key={doc._id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <DocumentIcon
                    sx={{ fontSize: 40, color: 'primary.main', mr: 2 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {doc.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Uploaded by: {doc.uploadedBy.name}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Summary: {doc.summary}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Documents; 