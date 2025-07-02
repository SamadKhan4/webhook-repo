import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import Login from './pages/Login';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import RegisterEmployee from './pages/RegisterEmployee';
import Customers from './pages/Admin/Customers';
import Items from './pages/Admin/Items';
import Vendors from './pages/Admin/Vendors';
import Agents from './pages/Admin/Agents';
import AdminBills from './pages/Admin/Bills';
import AdminEmployees from './pages/AdminEmployees';
import ViewAgentBill from './pages/Admin/ViewAgentBill';
import AdminReturnNotifications from './pages/AdminReturnNotifications';
import AdminReturnConfirm from './pages/AdminReturnConfirm';
import AdminReturnHistory from './pages/AdminReturnHistory';


// Employee Pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import CreateBill from './pages/Employee/CreateBill';
import Profile from './pages/Employee/Profile';
import ViewBills from './pages/Employee/ViewBills';
import ViewSingleBill from './pages/Employee/ViewSingleBill';
import EmployeeNotifications from './pages/EmployeeNotifications';
import GenerateExchangeBill from './pages/GenerateExchangeBill';
import EmployeeReturnExchange from './pages/EmployeeReturnExchange';



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ---------- PUBLIC ROUTES ---------- */}
          <Route path="/login" element={<Login />} />

          {/* ---------- ADMIN ROUTES ---------- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/register-employee"
            element={
              <ProtectedRoute role="admin">
                <RegisterEmployee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute role="admin">
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/items"
            element={
              <ProtectedRoute role="admin">
                <Items />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <ProtectedRoute role="admin">
                <Vendors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agents"
            element={
              <ProtectedRoute role="admin">
                <Agents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute role="admin">
                <AdminEmployees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bills"
            element={
              <ProtectedRoute role="admin">
                <AdminBills />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/view-bill/:id"
            element={
              <ProtectedRoute role="admin">
                <ViewSingleBill />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/view-agent-bill/:id"
            element={
              <ProtectedRoute role="admin">
                <ViewAgentBill />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/return-notifications" element={<AdminReturnNotifications />} />
          <Route path="/admin/return-confirm/:id" element={<AdminReturnConfirm />} />
          <Route path="/admin/return-history" element={<AdminReturnHistory />} />

         


          {/* ---------- EMPLOYEE ROUTES ---------- */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute role="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/create-bill"
            element={
              <ProtectedRoute role="employee">
                <CreateBill />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute role="employee">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/view-bills"
            element={
              <ProtectedRoute role="employee">
                <ViewBills />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/view-bill/:id"
            element={
              <ProtectedRoute role="employee">
                <ViewSingleBill />
              </ProtectedRoute>
            }
          />
          <Route path="/employee/notifications" element={<EmployeeNotifications />} />
          <Route path="/employee/generate-bill/:id" element={<GenerateExchangeBill />} />
          <Route path="/employee/return-exchange" element={<EmployeeReturnExchange />} />

        


        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
