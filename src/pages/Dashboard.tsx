import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const complaints = [
  {
    id: 'C001',
    submissionDate: '2025-10-28',
    status: 'PENDING',
    bottleType: '300ml Glass',
    quantity: 50,
  },
  {
    id: 'C002',
    submissionDate: '2025-10-25',
    status: 'SALES_VERIFIED',
    bottleType: '1L Plastic',
    quantity: 25,
  },
  {
    id: 'C003',
    submissionDate: '2025-10-22',
    status: 'QC_APPROVED',
    bottleType: '500ml Glass',
    quantity: 120,
  },
  {
    id: 'C004',
    submissionDate: '2025-10-20',
    status: 'REJECTED_BY_SALES',
    bottleType: '300ml Glass',
    quantity: 30,
  },
   {
    id: 'C005',
    submissionDate: '2025-10-18',
    status: 'FINANCE_PAID',
    bottleType: '1.5L Plastic',
    quantity: 75,
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: { [key: string]: string } = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    SALES_VERIFIED: 'bg-blue-100 text-blue-800',
    QC_APPROVED: 'bg-green-100 text-green-800',
    REJECTED_BY_SALES: 'bg-red-100 text-red-800',
    FINANCE_PAID: 'bg-purple-100 text-purple-800',
  };

  return (
    <Badge className={`${statusStyles[status]} hover:${statusStyles[status]}`}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
};

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Outlet Dashboard</h1>
        <Button asChild>
          <Link to="/new-complaint">Submit New Complaint</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complaint No</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Bottle Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">{complaint.id}</TableCell>
                  <TableCell>{complaint.submissionDate}</TableCell>
                  <TableCell>{complaint.bottleType}</TableCell>
                  <TableCell>{complaint.quantity}</TableCell>
                  <TableCell>
                    <StatusBadge status={complaint.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}