import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saveCustomer } from '@/utils/customerStorage';
import { CustomerFormData, MEMBERSHIP_TYPES } from '@/types/customer';
import { CheckCircle2, Loader2, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

// Form validation schema
const customerSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number'),
    age: z.string().refine((val) => {
        const num = parseInt(val);
        return !isNaN(num) && num >= 10 && num <= 100;
    }, 'Age must be between 10 and 100'),
    gender: z.enum(['male', 'female', 'other']),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    emergencyContact: z.string().regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number'),
    membershipType: z.enum(['1-month-trial', '3-month-basic', '6-month-standard', '12-month-premium']),
    startDate: z.string().min(1, 'Start date is required'),
});

const NewCustomer = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedCustomerId, setSubmittedCustomerId] = useState<string | null>(null);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            startDate: new Date().toISOString().split('T')[0],
        },
    });

    const onSubmit = async (data: CustomerFormData) => {
        setIsSubmitting(true);
        try {
            const customer = await saveCustomer(data);
            setSubmittedCustomerId(customer.customerId);
            toast.success('Registration successful!');
        } catch (error) {
            toast.error('Failed to save registration. Please try again.');
            console.error('Error saving customer:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success state
    if (submittedCustomerId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-success" />
                        </div>
                        <CardTitle className="text-2xl">Registration Successful!</CardTitle>
                        <CardDescription>
                            Welcome to our gym family. Your registration has been completed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-1">Your Customer ID</p>
                            <p className="text-xl font-bold font-mono">{submittedCustomerId}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Please save this ID for future reference
                            </p>
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Our team will contact you shortly to complete your membership setup.</p>
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => {
                                setSubmittedCustomerId(null);
                                window.location.reload();
                            }}
                        >
                            Register Another Customer
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Form state
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Dumbbell className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Sweat Ledger Gym</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Welcome! Please fill out the form below to register your membership.
                    </p>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>New Member Registration</CardTitle>
                        <CardDescription>
                            All fields are required. Please provide accurate information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    {...register('fullName')}
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                                )}
                            </div>

                            {/* Phone and Age */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+91-9876543210"
                                        {...register('phone')}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        placeholder="25"
                                        {...register('age')}
                                    />
                                    {errors.age && (
                                        <p className="text-sm text-destructive">{errors.age.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select onValueChange={(value) => setValue('gender', value as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && (
                                    <p className="text-sm text-destructive">{errors.gender.message}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    placeholder="123 Main St, City"
                                    {...register('address')}
                                />
                                {errors.address && (
                                    <p className="text-sm text-destructive">{errors.address.message}</p>
                                )}
                            </div>

                            {/* Emergency Contact */}
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                                <Input
                                    id="emergencyContact"
                                    placeholder="+91-9876543211"
                                    {...register('emergencyContact')}
                                />
                                {errors.emergencyContact && (
                                    <p className="text-sm text-destructive">{errors.emergencyContact.message}</p>
                                )}
                            </div>

                            {/* Membership Type and Start Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="membershipType">Membership Plan</Label>
                                    <Select onValueChange={(value) => setValue('membershipType', value as any)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(MEMBERSHIP_TYPES).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.membershipType && (
                                        <p className="text-sm text-destructive">{errors.membershipType.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        {...register('startDate')}
                                    />
                                    {errors.startDate && (
                                        <p className="text-sm text-destructive">{errors.startDate.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Complete Registration'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    By registering, you agree to our terms and conditions.
                </p>
            </div>
        </div>
    );
};

export default NewCustomer;
