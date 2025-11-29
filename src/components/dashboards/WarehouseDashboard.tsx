import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { complaints } from "../../lib/mock-data";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";

export default function WarehouseDashboard() {
  const navigate = useNavigate();
  const warehouseComplaints = complaints.filter(c => ['VERIFIED_BY_SALES', 'FORWARDED_TO_FGS'].includes(c.status));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complaints for Warehouse Processing</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Complaint ID</TableHead>
              <TableHead>Outlet</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouseComplaints.map((complaint) => (
              <TableRow key={complaint.id} onClick={() => navigate(`/complaint/${complaint.id}`)} className='cursor-pointer'>
                <TableCell>{complaint.complaint_code}</TableCell>
                <TableCell>{complaint.outletName}</TableCell>
                <TableCell>{complaint.product}</TableCell>
                <TableCell><Badge>{complaint.status}</Badge></TableCell>
                <TableCell>{complaint.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
