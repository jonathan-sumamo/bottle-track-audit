import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

const complaintSchema = z.object({
  batchNo: z.string().min(1, 'Batch number is required'),
  bottleType: z.string().min(1, 'Please select a bottle type'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  issueType: z.string().min(1, 'Please select an issue type'),
  photos: z.instanceof(FileList).refine(files => files.length >= 3, 'Please upload at least 3 photos'),
  description: z.string().optional(),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

export default function NewComplaint() {
  const navigate = useNavigate();
  const { register, handleSubmit, control, formState: { errors } } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
  });

  const onSubmit = (data: ComplaintFormValues) => {
    console.log(data);
    toast.success('Complaint submitted successfully!');
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto">
       <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      <Card>
        <CardHeader>
          <CardTitle>Submit New Complaint</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="batchNo">Batch No</Label>
                <Input id="batchNo" {...register('batchNo')} />
                {errors.batchNo && <p className="text-sm text-red-600">{errors.batchNo.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" {...register('quantity')} />
                {errors.quantity && <p className="text-sm text-red-600">{errors.quantity.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="bottleType">Bottle Type</Label>
                    <Select onValueChange={(value) => control._setValue('bottleType', value)}>
                    <SelectTrigger id="bottleType">
                        <SelectValue placeholder="Select a bottle type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="300ml-glass">300ml Glass</SelectItem>
                        <SelectItem value="500ml-glass">500ml Glass</SelectItem>
                        <SelectItem value="1l-plastic">1L Plastic</SelectItem>
                        <SelectItem value="1.5l-plastic">1.5L Plastic</SelectItem>
                        <SelectItem value="crate">Crate</SelectItem>
                    </SelectContent>
                    </Select>
                    {errors.bottleType && <p className="text-sm text-red-600">{errors.bottleType.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="issueType">Issue Type</Label>
                    <Select onValueChange={(value) => control._setValue('issueType', value)}>
                    <SelectTrigger id="issueType">
                        <SelectValue placeholder="Select an issue type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="broken">Broken</SelectItem>
                        <SelectItem value="chipped">Chipped</SelectItem>
                        <SelectItem value="contaminated">Contaminated</SelectItem>
                        <SelectItem value="misprinted-label">Misprinted Label</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                    </Select>
                    {errors.issueType && <p className="text-sm text-red-600">{errors.issueType.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photos">Upload Photos (min 3)</Label>
              <Input id="photos" type="file" {...register('photos')} multiple accept="image/*" />
              {errors.photos && <p className="text-sm text-red-600">{errors.photos.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" {...register('description')} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit">Submit Complaint</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}