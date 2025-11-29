import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

const API_URL = 'http://localhost:4000';

const validTransitions: Record<UserRole, string[]> = {
    'Sales Rep': ['Validated', 'Forwarded to FGS'],
    'FGS Warehouse': ['Forwarded to QC', 'Replacement Approved'],
    'QC Lab': ['QC Report Uploaded'],
    'Finance': ['ERP Updated'],
    'Admin': ['Closed'],
    'Outlet': [],
    'EXCO': [],
};

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/complaints/${id}`);
      setComplaint(response.data.complaint);
      setHistory(response.data.history);
    } catch (error) {
      toast.error('Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!updateStatus) {
        toast.warning('Please select a status to update.');
        return;
    }
    setIsUpdating(true);
    try {
        await axios.patch(`${API_URL}/api/complaints/${id}/status`, { status: updateStatus, remarks });
        toast.success('Complaint status updated successfully!');
        setUpdateStatus('');
        setRemarks('');
        fetchComplaintDetails(); // Refresh data
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to update status.');
    } finally {
        setIsUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading complaint details...</div>;
  }

  if (!complaint) {
    return <div>Complaint not found</div>;
  }
  
  const availableStatuses = user ? validTransitions[user.role] : [];

  return (
    <div className='p-4 space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
                <CardTitle>Complaint Details</CardTitle>
                <CardDescription>{complaint.complaint_code}</CardDescription>
            </div>
            <Badge>{complaint.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className='grid md:grid-cols-3 gap-4'>
            <div><span className='font-semibold'>Outlet:</span> {complaint.outlet_name}</div>
            <div><span className='font-semibold'>Outlet Phone:</span> {complaint.outlet_phone}</div>
            <div><span className='font-semibold'>Outlet Email:</span> {complaint.outlet_email}</div>
            <div><span className='font-semibold'>Product (SKU):</span> {complaint.sku}</div>
            <div><span className='font-semibold'>Batch Number:</span> {complaint.batch_number}</div>
            <div><span className='font-semibold'>Quantity:</span> {complaint.quantity}</div>
            <div><span className='font-semibold'>Submitted By:</span> {complaint.sales_rep.name}</div>
            <div><span className='font-semibold'>Issue Type:</span> {complaint.issue_type.name}</div>
            <div><span className='font-semibold'>Date:</span> {new Date(complaint.created_at).toLocaleDateString()}</div>
            <div className='md:col-span-3'><span className='font-semibold'>Description:</span> {complaint.description}</div>
        </CardContent>
      </Card>

      {availableStatuses.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>Update Complaint Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className='space-y-2'>
                        <Label htmlFor='status'>New Status</Label>
                        <Select onValueChange={setUpdateStatus} value={updateStatus}>
                            <SelectTrigger><SelectValue placeholder="Select a new status" /></SelectTrigger>
                            <SelectContent>
                                {availableStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='remarks'>Remarks</Label>
                    <Textarea id='remarks' value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder='Add any relevant remarks...' />
                </div>
                <Button onClick={handleStatusUpdate} disabled={isUpdating}>{isUpdating ? 'Updating...' : 'Update Status'}</Button>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Complaint History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status To</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-2/5">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell><Badge>{entry.status_to}</Badge></TableCell>
                  <TableCell>{entry.changed_by.name}</TableCell>
                  <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                  <TableCell>{entry.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
