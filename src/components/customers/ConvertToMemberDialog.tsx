import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types/customer';
import { useCreateMember } from '@/hooks/useMembers';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';
import { addMonths } from 'date-fns';

interface ConvertToMemberDialogProps {
    customer: Customer | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ConvertToMemberDialog = ({ customer, open, onOpenChange }: ConvertToMemberDialogProps) => {
    const createMember = useCreateMember();

    const handleConvert = async () => {
        if (!customer) return;

        if (!customer.email || !customer.email.includes('@')) {
            toast.error('Customer does not have a valid email address');
            return;
        }

        // Calculate expiry date based on membership type
        const startDate = new Date(customer.startDate);
        let expiryDate: Date;

        switch (customer.membershipType) {
            case '1-month-trial':
                expiryDate = addMonths(startDate, 1);
                break;
            case '3-month-basic':
                expiryDate = addMonths(startDate, 3);
                break;
            case '6-month-standard':
                expiryDate = addMonths(startDate, 6);
                break;
            case '12-month-premium':
                expiryDate = addMonths(startDate, 12);
                break;
            default:
                expiryDate = addMonths(startDate, 1);
        }

        // Determine status based on dates
        const now = new Date();
        let status: 'active' | 'expired' | 'trial' = 'active';
        if (customer.membershipType === '1-month-trial') {
            status = 'trial';
        } else if (expiryDate < now) {
            status = 'expired';
        }

        try {
            await createMember.mutateAsync({
                name: customer.fullName,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                photo: null,
                plan: customer.membershipType,
                status: status,
                start_date: customer.startDate,
                expiry_date: expiryDate.toISOString().split('T')[0],
                payment_due: 0,
                gym_id: customer.gymId || null, // Pass gym_id from customer
            });

            toast.success(`${customer.fullName} has been converted to a member!`);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to convert customer:', error);
            toast.error('Failed to convert customer to member');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Convert to Member
                    </DialogTitle>
                    <DialogDescription>
                        Convert {customer?.fullName} from a customer registration to a full member.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                        <p><strong>Name:</strong> {customer?.fullName}</p>
                        <p><strong>Email:</strong> {customer?.email}</p>
                        <p><strong>Phone:</strong> {customer?.phone}</p>
                        <p><strong>Membership:</strong> {customer?.membershipType}</p>
                        <p><strong>Start Date:</strong> {customer?.startDate}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        The customer will be converted to a member using their registered email for login and notifications.
                    </p>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={createMember.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConvert}
                        disabled={createMember.isPending || !customer?.email}
                    >
                        {createMember.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Convert to Member
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

