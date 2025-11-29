import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';

const API_URL = 'http://localhost:4000/api';

export default function OutletDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(`${API_URL}/complaints`);
        setComplaints(response.data);
      } catch (error) {
        toast.error('Failed to fetch your complaints.');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) return <div>Loading your complaints...</div>;

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
              <TableHead>Product (SKU)</TableHead>
              <TableHead>Issue Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {complaints.length > 0 ? complaints.map((complaint: any) => (
              <TableRow key={complaint.id} onClick={() => navigate(`/complaint/${complaint.id}`)} className='cursor-pointer'>
                <TableCell>{complaint.complaint_code}</TableCell>
                <TableCell>{complaint.sku}</TableCell>
                <TableCell>{complaint.issue_type.name}</TableCell>
                <TableCell><Badge>{complaint.status}</Badge></TableCell>
                <TableCell>{new Date(complaint.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">You haven't submitted any complaints yet.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
