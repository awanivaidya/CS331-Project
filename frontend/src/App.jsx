import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import CommunicationPage from './pages/CommunicationPage';
import ProjectsPage from './pages/ProjectsPage';
import SLAPage from './pages/SLAPage';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar />
      {children}
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <PrivateRoute>
            <AppLayout>
              <CustomersPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <PrivateRoute>
            <AppLayout>
              <CustomerDetailPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/communications"
        element={
          <PrivateRoute>
            <AppLayout>
              <CommunicationPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <AppLayout>
              <ProjectsPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/slas"
        element={
          <PrivateRoute>
            <AppLayout>
              <SLAPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
