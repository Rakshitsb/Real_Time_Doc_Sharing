import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoadingState from "../components/common/LoadingState";
import { ROUTES } from "../constants/routes";
import ProtectedRoute from "./ProtectedRoute";

const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const DocumentDetailsPage = lazy(() => import("../pages/DocumentDetailsPage"));
const DocumentFormPage = lazy(() => import("../pages/DocumentFormPage"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6"><LoadingState message="Loading page..." /></div>}>
        <Routes>
          <Route path={ROUTES.HOME} element={<LandingPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.DOCUMENT_DETAILS} element={<DocumentDetailsPage />} />
            <Route path={ROUTES.NEW_DOCUMENT} element={<DocumentFormPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
