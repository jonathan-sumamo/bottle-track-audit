import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { users as initialUsers, issueTypes as initialIssueTypes } from '../../lib/mock-data';
import { toast } from 'sonner';

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
  const [newIssueType, setNewIssueType] = useState({ name: '', description: '' });

  const handleAdd = () => {
    if (newIssueType.name.trim() === '') {
        toast.error('Issue type name cannot be empty');
        return;
    }
    setIssueTypes([...issueTypes, { id: (issueTypes.length + 1).toString(), ...newIssueType }]);
    setNewIssueType({ name: '', description: '' });
    toast.success('Issue type added successfully!');
  };

  const handleDelete = (id) => {
    setIssueTypes(issueTypes.filter(it => it.id !== id));
    toast.success('Issue type deleted successfully!');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Types Management</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex gap-2'>
          <Input placeholder='New Issue Type Name' value={newIssueType.name} onChange={(e) => setNewIssueType({...newIssueType, name: e.target.value})} />
          <Input placeholder='Description' value={newIssueType.description} onChange={(e) => setNewIssueType({...newIssueType, description: e.target.value})} />
          <Button onClick={handleAdd}>Add Issue Type</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issueTypes.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>{issue.name}</TableCell>
                <TableCell>{issue.description}</TableCell>
                <TableCell>
                    <Button onClick={() => handleDelete(issue.id)} size='sm' variant='destructive'>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('userManagement');

  return (
    <div className='space-y-4'>
        <div className='flex gap-2'>
            <Button onClick={() => setActiveTab('userManagement')} variant={activeTab === 'userManagement' ? 'default' : 'outline'}>User Management</Button>
            <Button onClick={() => setActiveTab('issueTypes')} variant={activeTab === 'issueTypes' ? 'default' : 'outline'}>Issue Types Management</Button>
        </div>
      {activeTab === 'userManagement' && <UserManagement />}
      {activeTab === 'issueTypes' && <IssueTypeManagement />}
    </div>
  );
}
