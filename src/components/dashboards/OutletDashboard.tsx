import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { complaints } from "../../lib/mock-data";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export default function OutletDashboard() {
  const navigate = useNavigate();
  // Assuming 'Current Outlet' is the logged in user. 
  // In a real app, this would come from the auth context.
  const outletComplaints = complaints.filter(c => c.outletName === 'Zuri Bar' || c.outletName === 'Asante Grill' || c.outletName === 'Karibu Lounge');

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>My Submitted Complaints</CardTitle>
        <Button onClick={() => navigate('/new-complaint')}>New Complaint</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Complaint ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outletComplaints.map((complaint) => (
              <TableRow key={complaint.id} onClick={() => navigate(`/complaint/${complaint.id}`)} className='cursor-pointer'>
                <TableCell>{complaint.complaint_code}</TableCell>
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