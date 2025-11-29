import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';

const API_URL = 'http://localhost:4000/api';

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(`${API_URL}/complaints`);
        setComplaints(response.data);
      } catch (error) {
        toast.error('Failed to fetch complaints for finance.');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) return <div>Loading complaints...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complaints for Financial Approval</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Complaint ID</TableHead>
              <TableHead>Outlet</TableHead>
              <TableHead>Product (SKU)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((complaint: any) => (
              <TableRow key={complaint.id} onClick={() => navigate(`/complaint/${complaint.id}`)} className='cursor-pointer'>
                <TableCell>{complaint.complaint_code}</TableCell>
                <TableCell>{complaint.outlet_name}</TableCell>
                <TableCell>{complaint.sku}</TableCell>
                <TableCell><Badge>{complaint.status}</Badge></TableCell>
                <TableCell>{new Date(complaint.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
