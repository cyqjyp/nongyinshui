import { createHashRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/Dashboard';
import InfrastructurePage from '../pages/Infrastructure';
import WaterQualityPage from '../pages/WaterQuality';
import InspectionPage from '../pages/Inspection';
import RepairPage from '../pages/Repair';
import ReportsPage from '../pages/Reports';
import SmartVillagePage from '../pages/SmartVillage';

export const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'smart-village', element: <SmartVillagePage /> },
      { path: 'infrastructure', element: <InfrastructurePage /> },
      { path: 'infrastructure/:villageId', element: <InfrastructurePage /> },
      { path: 'water-quality', element: <WaterQualityPage /> },
      { path: 'inspection', element: <InspectionPage /> },
      { path: 'repair', element: <RepairPage /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
]);
