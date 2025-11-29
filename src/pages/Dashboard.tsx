import { useAuth } from "../contexts/AuthContext";
import AdminDashboard from "../components/dashboards/AdminDashboard";
import SalesRepDashboard from "../components/dashboards/SalesRepDashboard";
import OutletDashboard from "../components/dashboards/OutletDashboard";
import QCDashboard from "../components/dashboards/QCDashboard";
import WarehouseDashboard from "../components/dashboards/WarehouseDashboard";
import FinanceDashboard from "../components/dashboards/FinanceDashboard";
import ExcoDashboard from "../components/dashboards/ExcoDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'SALES_REP':
        return <SalesRepDashboard />;
      case 'OUTLET_USER':
        return <OutletDashboard />;
      case 'QC_LAB':
        return <QCDashboard />;
      case 'FGS_WAREHOUSE':
        return <WarehouseDashboard />;
      case 'FINANCE':
        return <FinanceDashboard />;
      case 'EXCO':
        return <ExcoDashboard />;
      default:
        return <div>Welcome! Please select a role.</div>;
    }
  };

  return <div className='p-4'>{renderDashboard()}</div>;
}