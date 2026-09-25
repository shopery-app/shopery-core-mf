import { Navigate } from "react-router-dom";
import { isAdminAuthenticated } from "../../utils/auth";

const AdminRoute = ({ children }) => {
  if (!isAdminAuthenticated()) return <Navigate to="/admins" replace />;
  return children;
};

export default AdminRoute;
