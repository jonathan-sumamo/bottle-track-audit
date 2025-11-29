import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { complaints } from "../../lib/mock-data";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function SalesRepDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // For a sales rep, we might show complaints from outlets they manage.
  // This is a simplified version. A real app would have a mapping.
  const salesRepComplaints = complaints.filter(c => c.status === 'NEW');

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Complaints for Verification</CardTitle>
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
            {salesRepComplaints.map((complaint) => (
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
