export interface WorkLog {
  id: string;
  date: string;
  address: string;
  department: string;
  description: string;
  hours: number;
  rate: number;
  totalAmount: number;
  status: 'Unbilled' | 'Billed';
  clientName?: string;
  createdAt: string;
  excelGroup?: string;
}

export interface ClientDetails {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  terms: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  client: ClientDetails;
  items: WorkLog[];
  taxRate: number; // percentage (e.g., 18 for GST)
  discount: number; // flat discount
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  notes?: string;
  createdAt: string;
}
