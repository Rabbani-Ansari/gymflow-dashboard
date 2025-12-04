import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllCustomers, exportCustomersAsCSV } from '@/utils/customerStorage';
import { Customer, MEMBERSHIP_TYPES } from '@/types/customer';
import { Search, Download, RefreshCw, Users, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { StatCard } from '@/components/shared/StatCard';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const loadCustomers = () => {
        setIsLoading(true);
        try {
            const data = getAllCustomers();
            setCustomers(data);
        } catch (error) {
            toast.error('Failed to load customers');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return customers;

        const query = searchQuery.toLowerCase();
        return customers.filter(
            (customer) =>
                customer.fullName.toLowerCase().includes(query) ||
                customer.phone.includes(query) ||
                customer.customerId.toLowerCase().includes(query) ||
                customer.address.toLowerCase().includes(query)
        );
    }, [customers, searchQuery]);

    const handleExportCSV = () => {
        try {
            const csv = exportCustomersAsCSV();
            if (!csv) {
                toast.error('No customers to export');
                return;
            }

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `customers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success('Customer list exported successfully');
        } catch (error) {
            toast.error('Failed to export customers');
            console.error(error);
        }
    };

    const getGenderBadgeColor = (gender: string) => {
        switch (gender) {
            case 'male':
                return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case 'female':
                return 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20';
            default:
                return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
        }
    };

    // Calculate stats
    const stats = useMemo(() => {
        const total = customers.length;
        const today = new Date().toISOString().split('T')[0];
        const newToday = customers.filter(c => c.createdAt.split('T')[0] === today).length;

        const membershipCounts = customers.reduce((acc, c) => {
            acc[c.membershipType] = (acc[c.membershipType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { total, newToday, membershipCounts };
    }, [customers]);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Customer Registrations"
                description="View and manage all customer registrations from the QR code intake system."
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={loadCustomers}>
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Registrations"
                    value={stats.total}
                    icon={Users}
                    variant="primary"
                />
                <StatCard
                    title="New Today"
                    value={stats.newToday}
                    icon={UserPlus}
                    variant="success"
                />
                <StatCard
                    title="Premium Members"
                    value={stats.membershipCounts['12-month-premium'] || 0}
                    icon={Users}
                />
                <StatCard
                    title="Trial Members"
                    value={stats.membershipCounts['1-month-trial'] || 0}
                    icon={Users}
                />
            </div>

            {/* Search */}
            <div className="filter-bar">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, phone, ID, or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    Showing {filteredCustomers.length} of {customers.length} customers
                </div>
            </div>

            {/* Table */}
            <Card className="overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Loading customers...
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        {searchQuery ? 'No customers found matching your search.' : 'No customer registrations yet.'}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Customer ID</TableHead>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Age</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead>Membership</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Registered</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.map((customer) => (
                                <TableRow key={customer.customerId} className="data-table-row">
                                    <TableCell className="font-mono text-xs">
                                        {customer.customerId}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div>
                                            <p>{customer.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{customer.address}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell>{customer.age}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getGenderBadgeColor(customer.gender)}>
                                            {customer.gender}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {MEMBERSHIP_TYPES[customer.membershipType]}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(customer.startDate), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(customer.createdAt), 'MMM dd, yyyy HH:mm')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>

            {filteredCustomers.length > 0 && (
                <div className="text-sm text-muted-foreground text-center">
                    💡 Tip: Click "Export CSV" to download all customer data for backup or processing.
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
