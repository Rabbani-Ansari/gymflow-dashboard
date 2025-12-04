import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Printer, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const AdminQR = () => {
    const registrationUrl = `${window.location.origin}/new-customer`;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/gym-qr.png';
        link.download = 'gym-registration-qr.png';
        link.click();
        toast.success('QR code downloaded');
    };

    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(registrationUrl);
        toast.success('Registration link copied to clipboard');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Customer Registration QR Code"
                description="Display this QR code to new customers for easy registration."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QR Code Display */}
                <Card className="print:col-span-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            Registration QR Code
                        </CardTitle>
                        <CardDescription>
                            Customers can scan this code with any QR scanner to access the registration form
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-6">
                        <div className="bg-white p-8 rounded-xl shadow-lg print:shadow-none">
                            <img
                                src="/gym-qr.png"
                                alt="Gym Registration QR Code"
                                className="w-full max-w-sm mx-auto"
                            />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-sm font-medium">Scan to Register</p>
                            <p className="text-xs text-muted-foreground font-mono break-all">
                                {registrationUrl}
                            </p>
                        </div>
                        <div className="flex gap-2 print:hidden">
                            <Button onClick={handleDownload} variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                            <Button onClick={handlePrint} variant="outline" className="gap-2">
                                <Printer className="h-4 w-4" />
                                Print
                            </Button>
                            <Button onClick={handleCopyLink} variant="outline" className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Copy Link
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="print:hidden">
                    <CardHeader>
                        <CardTitle>How to Use</CardTitle>
                        <CardDescription>
                            Quick guide for using the QR code registration system
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Display QR Code</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Show this QR code at your gym reception or entrance area where new customers can easily see it.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Customer Scans</h4>
                                    <p className="text-sm text-muted-foreground">
                                        New customers can scan the QR code using their phone's camera app, Google Lens, or any QR scanner.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Fill Registration Form</h4>
                                    <p className="text-sm text-muted-foreground">
                                        The customer will be directed to a registration form where they can enter their details.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                    4
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Auto-Generated ID</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Upon submission, a unique customer ID will be automatically generated and displayed to the customer.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                    5
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">View in Dashboard</h4>
                                    <p className="text-sm text-muted-foreground">
                                        All new registrations will appear in the <a href="/admin/customers" className="text-primary hover:underline">Customer List</a> where you can review and manage them.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:col-span-full,
          .print\\:col-span-full * {
            visibility: visible;
          }
          .print\\:col-span-full {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
};

export default AdminQR;
