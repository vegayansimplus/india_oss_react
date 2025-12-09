// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import type { RootState } from '../store/store';

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const user = useSelector((state: RootState) => state.user.user);
//   return user ? children : <Navigate to="/login" />;
// };

// export default ProtectedRoute;


import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedRoute;

