import { createHashRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/Dashboard';
import InfrastructurePage from '../pages/Infrastructure';
import WaterQualityPage from '../pages/WaterQuality';
import InspectionPage from '../pages/Inspection';
import RepairPage from '../pages/Repair';
import ReportsPage from '../pages/Reports';
import SmartVillageOverview from '../pages/SmartVillage/SmartVillageOverview';
import SmartVillageDetail from '../pages/SmartVillage/SmartVillageDetail';
import ElderlyCarePage from '../pages/ElderlyCare';

export const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'smart-village', element: <SmartVillageOverview /> },
      { path: 'smart-village/:villageId', element: <SmartVillageDetail /> },
      { path: 'infrastructure', element: <InfrastructurePage /> },
      { path: 'infrastructure/:villageId', element: <InfrastructurePage /> },
      { path: 'water-quality', element: <WaterQualityPage /> },
      { path: 'inspection', element: <InspectionPage /> },
      { path: 'repair', element: <RepairPage /> },
      { path: 'elderly-care', element: <ElderlyCarePage /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
]);
