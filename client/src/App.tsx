import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ApolloProvider } from '@apollo/client';
import { theme } from './theme';
import { client } from './apollo-client';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Documents from './pages/Documents';

// Components
import Layout from './components/Layout';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/teams"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Teams />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Projects />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Tasks />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Documents />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;

