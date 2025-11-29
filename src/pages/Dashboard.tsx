import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import OutletDashboard from '../components/dashboards/OutletDashboard';
import SalesRepDashboard from '../components/dashboards/SalesRepDashboard';
import WarehouseDashboard from '../components/dashboards/WarehouseDashboard';
import QCDashboard from '../components/dashboards/QCDashboard';
import FinanceDashboard from '../components/dashboards/FinanceDashboard';
import ExcoDashboard from '../components/dashboards/ExcoDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Outlet':
      return <OutletDashboard />;
    case 'Sales Rep':
      return <SalesRepDashboard />;
    case 'FGS Warehouse':
      return <WarehouseDashboard />;
    case 'QC Lab':
      return <QCDashboard />;
    case 'Finance':
      return <FinanceDashboard />;
    case 'EXCO':
      return <ExcoDashboard />;
    default:
      return <div>Invalid user role: {user?.role}. Please contact support.</div>;
  }
}
