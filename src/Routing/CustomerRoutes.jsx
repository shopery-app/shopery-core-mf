import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../Components/Routes/ProtectedRoute";
import Blog from "../Components/Blogs/Blogs";
import Support from "../Components/Customer/Support";
import Addresses from "../Components/Customer/Addresses";
import Settings from "../Components/Customer/Settings";

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route
        path="/addresses"
        element={
          <ProtectedRoute>
            <Addresses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/blog"
        element={
          <ProtectedRoute>
            <Blog />
          </ProtectedRoute>
        }
      />

      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default CustomerRoutes;
