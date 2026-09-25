import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

// Guards auth pages (sign in / register) from an already-authenticated user.
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) return <Navigate to="/" replace />;
  return children;
};

export default PublicRoute;
