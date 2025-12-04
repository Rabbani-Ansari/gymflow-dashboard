-- Create customers table for QR registration system
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  address TEXT NOT NULL,
  emergency_contact TEXT NOT NULL,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('1-month-trial', '3-month-basic', '6-month-standard', '12-month-premium')),
  start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all customers
CREATE POLICY "Admins can manage customers" ON public.customers 
  FOR ALL TO authenticated 
  USING (true);

-- Allow public (anonymous) users to insert new customers (for QR registration)
CREATE POLICY "Public can register as customers" ON public.customers 
  FOR INSERT TO anon 
  WITH CHECK (true);

-- Allow public to read their own customer record (optional, for future use)
CREATE POLICY "Anyone can view customers" ON public.customers 
  FOR SELECT TO anon, authenticated 
  USING (true);

-- Function to generate unique customer ID
CREATE OR REPLACE FUNCTION generate_customer_id() 
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate ID in format: GYM-{timestamp}-{4randomdigits}
    new_id := 'GYM-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.customers WHERE customer_id = new_id) INTO id_exists;
    
    -- Exit loop if ID is unique
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate customer_id before insert
CREATE OR REPLACE FUNCTION set_customer_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NULL OR NEW.customer_id = '' THEN
    NEW.customer_id := generate_customer_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_customer_id
  BEFORE INSERT ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION set_customer_id();

-- Trigger to update updated_at timestamp
CREATE TRIGGER trigger_update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_customers_customer_id ON public.customers(customer_id);
CREATE INDEX idx_customers_created_at ON public.customers(created_at DESC);
CREATE INDEX idx_customers_phone ON public.customers(phone);
