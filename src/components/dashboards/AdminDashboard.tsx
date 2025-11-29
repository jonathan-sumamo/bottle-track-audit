import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { users as initialUsers, issueTypes as initialIssueTypes, complaints } from '../../lib/mock-data';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';

function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState(null);

  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleSave = () => {
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    toast.success('User updated successfully!');
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingUser({ ...editingUser, [name]: value });
  };
  
  const handleRoleChange = (value) => {
    setEditingUser({ ...editingUser, role: value });
  };

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
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{editingUser?.id === user.id ? <Input name='name' value={editingUser.name} onChange={handleChange} /> : user.name}</TableCell>
                <TableCell>{editingUser?.id === user.id ? <Input name='email' value={editingUser.email} onChange={handleChange} /> : user.email}</TableCell>
                <TableCell>{editingUser?.id === user.id ? (
                    <Select onValueChange={handleRoleChange} defaultValue={editingUser.role}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Admin'>Admin</SelectItem>
                            <SelectItem value='Sales Rep'>Sales Rep</SelectItem>
                            <SelectItem value='Outlet'>Outlet</SelectItem>
                            <SelectItem value='QC Lab'>QC Lab</SelectItem>
                            <SelectItem value='Warehouse FGS'>Warehouse FGS</SelectItem>
                            <SelectItem value='Finance'>Finance</SelectItem>
                            <SelectItem value='EXCO'>EXCO</SelectItem>
                        </SelectContent>
                    </Select>
                ) : user.role}</TableCell>
                <TableCell>{editingUser?.id === user.id ? <Input name='department' value={editingUser.department} onChange={handleChange} /> : user.department}</TableCell>
                <TableCell>{editingUser?.id === user.id ? <Input name='status' value={editingUser.status} onChange={handleChange} /> : user.status}</TableCell>
                <TableCell>
                  {editingUser?.id === user.id ? (
                    <div className='flex gap-2'>
                      <Button onClick={handleSave} size='sm'>Save</Button>
                      <Button onClick={handleCancel} size='sm' variant='outline'>Cancel</Button>
                    </div>
                  ) : (
                    <Button onClick={() => handleEdit(user)} size='sm'>Edit</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function IssueTypeManagement() {
  const [issueTypes, setIssueTypes] = useState(initialIssueTypes);
  const [newIssueType, setNewIssueType] = useState('');

  const handleAdd = () => {
    if (newIssueType.trim() === '') {
        toast.error('Issue type name cannot be empty');
        return;
    }
    setIssueTypes([...issueTypes, newIssueType]);
    setNewIssueType('');
    toast.success('Issue type added successfully!');
  };

  const handleDelete = (issueToDelete) => {
    setIssueTypes(issueTypes.filter(it => it !== issueToDelete));
    toast.success('Issue type deleted successfully!');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Types Management</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex gap-2'>
          <Input placeholder='New Issue Type Name' value={newIssueType} onChange={(e) => setNewIssueType(e.target.value)} />
          <Button onClick={handleAdd}>Add Issue Type</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issueTypes.map((issue) => (
              <TableRow key={issue}>
                <TableCell>{issue}</TableCell>
                <TableCell>
                    <Button onClick={() => handleDelete(issue)} size='sm' variant='destructive'>Delete</Button>
                </TableCell>
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
                            <TableHead>Product</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {complaints.map((complaint) => (
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
    )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('complaints');

  return (
    <div className='space-y-4'>
        <div className='flex gap-2'>
            <Button onClick={() => setActiveTab('complaints')} variant={activeTab === 'complaints' ? 'default' : 'outline'}>All Complaints</Button>
            <Button onClick={() => setActiveTab('userManagement')} variant={activeTab === 'userManagement' ? 'default' : 'outline'}>User Management</Button>
            <Button onClick={() => setActiveTab('issueTypes')} variant={activeTab === 'issueTypes' ? 'default' : 'outline'}>Issue Types Management</Button>
        </div>
      {activeTab === 'complaints' && <ComplaintsList />}
      {activeTab === 'userManagement' && <UserManagement />}
      {activeTab === 'issueTypes' && <IssueTypeManagement />}
    </div>
  );
}
