import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { complaints, products, issueTypes } from '../lib/mock-data';

export default function NewComplaint() {
  const navigate = useNavigate();
  const [product, setProduct] = useState('');
  const [issueType, setIssueType] = useState('');
  const [sku, setSku] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !issueType) {
        toast.error('Please select a product and issue type.');
        return;
    }
    const newComplaint = {
      id: (complaints.length + 1).toString(),
      complaint_code: `CMP-00000${complaints.length + 1}`,
      outletName: 'Current Outlet',
      product,
      issueType,
      sku,
      batchNumber,
      quantity: parseInt(quantity, 10),
      description,
      images: [],
      status: 'NEW',
      date: new Date().toISOString().split('T')[0],
      history: [{ status: 'NEW', date: new Date().toISOString().split('T')[0], comment: 'Complaint submitted.' }],
      submittedBy: 'Outlet',
    };
    complaints.push(newComplaint);
    toast.success('Complaint submitted successfully!');
    navigate('/dashboard');
  };

  return (
    <div className='flex justify-center items-center h-full p-4'>
        <Card className='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>Register a New Complaint</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='product'>Product</Label>
              <Select onValueChange={setProduct} required>
                <SelectTrigger>
                  <SelectValue placeholder='Select a product' />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='issueType'>Issue Type</Label>
              <Select onValueChange={setIssueType} required>
                <SelectTrigger>
                  <SelectValue placeholder='Select an issue type' />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((it) => (
                    <SelectItem key={it} value={it}>
                      {it}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='sku'>SKU</Label>
              <Input id='sku' value={sku} onChange={(e) => setSku(e.target.value)} placeholder='Enter SKU' required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='batchNumber'>Batch Number</Label>
              <Input id='batchNumber' value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder='Enter Batch Number' required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='quantity'>Quantity</Label>
              <Input id='quantity' type='number' value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder='Enter Quantity' required />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description'>Description of Complaint</Label>
            <Textarea id='description' value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Describe the issue in detail' required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='photos'>Upload Photos (Optional)</Label>
            <Input id='photos' type='file' multiple />
          </div>
          <Button type='submit' className='w-full'>Submit Complaint</Button>
        </form>
      </CardContent>
    </Card>
    </div>
  );
}