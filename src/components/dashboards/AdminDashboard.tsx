import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`);
        setUsers(response.data);
      } catch (error) {
        toast.error('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function IssueTypeManagement() {
  const [issueTypes, setIssueTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const response = await axios.get(`${API_URL}/issue-types`);
        setIssueTypes(response.data);
      } catch (error) {
        toast.error('Failed to fetch issue types.');
      } finally {
        setLoading(false);
      }
    };
    fetchIssueTypes();
  }, []);

  if (loading) return <div>Loading issue types...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Types Management</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issueTypes.map((issue: any) => (
              <TableRow key={issue.id}>
                <TableCell>{issue.id}</TableCell>
                <TableCell>{issue.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ComplaintsList() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await axios.get(`${API_URL}/complaints`);
                setComplaints(response.data);
            } catch (error) {
                toast.error('Failed to fetch complaints.');
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
                <CardTitle>All Complaints</CardTitle>
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
    )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('complaints');

  return (
    <div className='space-y-4'>
        <div className='flex gap-2 border-b'>
            <Button onClick={() => setActiveTab('complaints')} variant={activeTab === 'complaints' ? 'default' : 'ghost'}>All Complaints</Button>
            <Button onClick={() => setActiveTab('userManagement')} variant={activeTab === 'userManagement' ? 'default' : 'ghost'}>User Management</Button>
            <Button onClick={() => setActiveTab('issueTypes')} variant={activeTab === 'issueTypes' ? 'default' : 'ghost'}>Issue Types</Button>
        </div>
      {activeTab === 'complaints' && <ComplaintsList />}
      {activeTab === 'userManagement' && <UserManagement />}
      {activeTab === 'issueTypes' && <IssueTypeManagement />}
    </div>
  );
}
