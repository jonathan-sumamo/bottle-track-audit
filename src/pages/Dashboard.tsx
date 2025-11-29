import { useAuth } from "../contexts/AuthContext";
import AdminDashboard from "../components/dashboards/AdminDashboard";
import SalesRepDashboard from "../components/dashboards/SalesRepDashboard";
import OutletDashboard from "../components/dashboards/OutletDashboard";
import QCDashboard from "../components/dashboards/QCDashboard";
import WarehouseDashboard from "../components/dashboards/WarehouseDashboard";
import FinanceDashboard from "../components/dashboards/FinanceDashboard";
import ExcoDashboard from "../components/dashboards/ExcoDashboard";

export default function Dashboard() {
  const { role } = useAuth();

  const renderDashboard = () => {
    switch (role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Sales Rep':
        return <SalesRepDashboard />;
      case 'Outlet':
        return <OutletDashboard />;
      case 'QC Lab':
        return <QCDashboard />;
      case 'Warehouse FGS':
        return <WarehouseDashboard />;
      case 'Finance':
        return <FinanceDashboard />;
      case 'EXCO':
        return <ExcoDashboard />;
      default:
        return <div>Welcome! Please select a role.</div>;
    }
  };

  return <div className='p-4'>{renderDashboard()}</div>;
}