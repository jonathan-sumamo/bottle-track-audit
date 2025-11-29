import { useParams } from 'react-router-dom';
import { complaints } from '../lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const complaint = complaints.find((c) => c.id === id);

  if (!complaint) {
    return <div>Complaint not found</div>;
  }

  return (
    <div className='p-4 space-y-4'>
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
        <CardContent className='grid md:grid-cols-2 gap-4'>
            <div><span className='font-semibold'>Outlet:</span> {complaint.outletName}</div>
            <div><span className='font-semibold'>Product:</span> {complaint.product}</div>
            <div><span className='font-semibold'>SKU:</span> {complaint.sku}</div>
            <div><span className='font-semibold'>Batch Number:</span> {complaint.batchNumber}</div>
            <div><span className='font-semibold'>Quantity:</span> {complaint.quantity}</div>
            <div><span className='font-semibold'>Date:</span> {complaint.date}</div>
            <div className='md:col-span-2'><span className='font-semibold'>Description:</span> {complaint.description}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complaint History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaint.history.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell><Badge>{entry.status}</Badge></TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.comment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
