-- ThreadCounty Database Schema Setup
-- Target Engine: PostgreSQL / Supabase
-- Date: 2026-06-26

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 0. USERS AUTH TABLE (Custom Node.js Backend Auth)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for users_auth
CREATE INDEX IF NOT EXISTS idx_users_auth_email ON public.users_auth(email);

-- Enable RLS on users_auth
ALTER TABLE public.users_auth ENABLE ROW LEVEL SECURITY;

-- users_auth Policies
CREATE POLICY "Admins can manage all auth records" 
    ON public.users_auth FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 1. PROFILES TABLE (User metadata & status)
-- ==========================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES public.users_auth(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) DEFAULT '',
    avatar_url TEXT DEFAULT '',
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    plan VARCHAR(50) DEFAULT 'Free' CHECK (plan IN ('Free', 'Student', 'Professional', 'Enterprise')),
    storage_used BIGINT DEFAULT 0 CHECK (storage_used >= 0),
    is_demo BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" 
    ON public.profiles FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ==========================================
-- 2. UPLOADS TABLE (Stores fabric images)
-- ==========================================
CREATE TABLE public.uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    file_path TEXT NOT NULL,
    is_demo BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for uploads
CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);

-- Enable RLS on uploads
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- Uploads Policies
CREATE POLICY "Users can view their own uploads" 
    ON public.uploads FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads" 
    ON public.uploads FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads" 
    ON public.uploads FOR DELETE 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and delete all uploads" 
    ON public.uploads FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ==========================================
-- 3. REPORTS TABLE (Stores AI fabric analysis)
-- ==========================================
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID REFERENCES public.uploads(id) ON DELETE CASCADE NOT NULL UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    warp_count INT NOT NULL CHECK (warp_count > 0),
    weft_count INT NOT NULL CHECK (weft_count > 0),
    thread_density INT NOT NULL CHECK (thread_density > 0),
    fabric_type VARCHAR(100) NOT NULL,
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    suggestions TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    is_demo BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for reports
CREATE INDEX idx_reports_user_id ON public.reports(user_id);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Reports Policies
CREATE POLICY "Users can view their own reports" 
    ON public.reports FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" 
    ON public.reports FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" 
    ON public.reports FOR DELETE 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and delete all reports" 
    ON public.reports FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ==========================================
-- 4. CONTACT MESSAGES TABLE (Guest inquiries)
-- ==========================================
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_demo BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Contact Messages Policies
CREATE POLICY "Anyone can submit contact messages" 
    ON public.contact_messages FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Admins can view and manage all contact messages" 
    ON public.contact_messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ==========================================
-- 5. NOTIFICATIONS TABLE (System alerts)
-- ==========================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    is_demo BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id);


-- ==========================================
-- 6. HELPER STORAGE RPC FUNCTIONS
-- ==========================================
-- Function to safely increment storage size
CREATE OR REPLACE FUNCTION public.increment_storage(user_id UUID, size_bytes BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET storage_used = storage_used + size_bytes
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 7. PASSWORD RESET OTPS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.password_reset_otps (
    email VARCHAR(255) PRIMARY KEY,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for password_reset_otps
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON public.password_reset_otps(email);

-- Enable RLS on password_reset_otps
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Allow insert/update/select/delete for auth operations (the server role accesses this)
CREATE POLICY "Enable all actions for authenticated backend service" ON public.password_reset_otps FOR ALL USING (true);

