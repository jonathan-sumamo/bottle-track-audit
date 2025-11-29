import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';

const API_URL = 'http://localhost:4000';

interface IssueType {
  id: number;
  name: string;
}

// Static product list as it's not from the DB
const products = [
  'St. George Lager Beer',
  'St. George Amber Beer',
  'St. George Panach\' Shandy',
  'Meta Bremer',
  'Meta Decor',
  'Raya',
  'Castel Beer',
  'Zebidar',
  'Draft beer',
  'Xuma',
  'Doppel Brown Beer',
  'Acacia',
  'Rift Valley',
  'Sen\'q Malt',
];

export default function NewComplaint() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    outlet_name: user?.name || '',
    outlet_phone: '',
    outlet_email: user?.email || '',
    sku: '',
    batch_number: '',
    quantity: '',
    production_date: '',
    expiry_date: '',
    issue_type_id: '',
    description: '',
    photos: [],
  });

  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/issue-types`);
        setIssueTypes(response.data);
      } catch (error) {
        toast.error('Failed to load issue types.');
      }
    };
    fetchIssueTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        issue_type_id: parseInt(formData.issue_type_id, 10),
      };
      await axios.post(`${API_URL}/api/complaints`, submissionData);
      toast.success('Complaint submitted successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-start p-4'>
      <Card className='w-full max-w-4xl'>
        <CardHeader>
          <CardTitle>Register a New Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className='space-y-2'>
                    <Label htmlFor='outlet_name'>Outlet Name</Label>
                    <Input id='outlet_name' value={formData.outlet_name} onChange={handleChange} placeholder='Your Outlet Name' required />
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='outlet_phone'>Outlet Phone</Label>
                    <Input id='outlet_phone' value={formData.outlet_phone} onChange={handleChange} placeholder='Phone Number' required />
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='outlet_email'>Outlet Email</Label>
                    <Input id='outlet_email' type="email" value={formData.outlet_email} onChange={handleChange} placeholder='email@example.com' required />
                </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='sku'>Product (SKU)</Label>
                <Select onValueChange={(value) => handleSelectChange('sku', value)} required>
                    <SelectTrigger><SelectValue placeholder='Select a product' /></SelectTrigger>
                    <SelectContent>{products.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='issue_type_id'>Issue Type</Label>
                <Select onValueChange={(value) => handleSelectChange('issue_type_id', value)} required>
                  <SelectTrigger><SelectValue placeholder='Select an issue type' /></SelectTrigger>
                  <SelectContent>{issueTypes.map((it) => <SelectItem key={it.id} value={it.id.toString()}>{it.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='batch_number'>Batch Number</Label>
                <Input id='batch_number' value={formData.batch_number} onChange={handleChange} placeholder='Enter Batch Number' required />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='quantity'>Quantity</Label>
                <Input id='quantity' type='number' value={formData.quantity} onChange={handleChange} placeholder='Enter Quantity' required />
              </div>
               <div className='space-y-2'>
                <Label htmlFor='production_date'>Production Date (Optional)</Label>
                <Input id='production_date' type='date' value={formData.production_date} onChange={handleChange} />
              </div>
               <div className='space-y-2'>
                <Label htmlFor='expiry_date'>Expiry Date (Optional)</Label>
                <Input id='expiry_date' type='date' value={formData.expiry_date} onChange={handleChange} />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description'>Description of Complaint</Label>
              <Textarea id='description' value={formData.description} onChange={handleChange} placeholder='Describe the issue in detail' required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='photos'>Upload Photos (Optional)</Label>
              <Input id='photos' type='file' multiple />
            </div>
            <Button type='submit' className='w-full' disabled={loading}>{loading ? 'Submitting...' : 'Submit Complaint'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
