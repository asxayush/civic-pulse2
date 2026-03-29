-- ============================================================
-- CIVIC PULSE — Full Database Schema (Safe to re-run)
-- Paste this ENTIRE file into Supabase SQL Editor and click RUN
-- ============================================================

-- ==================== EXTENSIONS ====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== PROFILES ====================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== COMPLAINTS ====================
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'electricity','water','sanitation','hostel',
    'infrastructure','internet','safety','other'
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','resolved','closed')),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_label TEXT,
  image_urls TEXT[] DEFAULT '{}',
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ATTENDANCE RECORDS ====================
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  distance_meters DOUBLE PRECISION,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate attendance on same day via trigger (DATE() is STABLE not IMMUTABLE,
-- so cannot be used in a unique index expression)
CREATE OR REPLACE FUNCTION public.check_attendance_once_per_day()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.attendance_records
    WHERE user_id = NEW.user_id
      AND marked_at::date = NEW.marked_at::date
  ) THEN
    RAISE EXCEPTION 'Attendance already marked for today';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS attendance_once_per_day ON public.attendance_records;
CREATE TRIGGER attendance_once_per_day
  BEFORE INSERT ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.check_attendance_once_per_day();

-- ==================== CHAT MESSAGES ====================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'admin')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at on complaints
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS complaints_updated_at ON public.complaints;
CREATE TRIGGER complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop old policies before recreating (makes this script safe to re-run)
DROP POLICY IF EXISTS "profiles_select_own"     ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"     ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin"   ON public.profiles;

DROP POLICY IF EXISTS "complaints_select_own"   ON public.complaints;
DROP POLICY IF EXISTS "complaints_insert_own"   ON public.complaints;
DROP POLICY IF EXISTS "complaints_update_own"   ON public.complaints;
DROP POLICY IF EXISTS "complaints_select_admin" ON public.complaints;
DROP POLICY IF EXISTS "complaints_update_admin" ON public.complaints;

DROP POLICY IF EXISTS "attendance_select_own"   ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_insert_own"   ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_select_admin" ON public.attendance_records;

DROP POLICY IF EXISTS "chat_select_own"         ON public.chat_messages;
DROP POLICY IF EXISTS "chat_insert_own"         ON public.chat_messages;
DROP POLICY IF EXISTS "chat_select_admin"       ON public.chat_messages;
DROP POLICY IF EXISTS "chat_insert_admin"       ON public.chat_messages;

-- ---------- PROFILES ----------
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ---------- COMPLAINTS ----------
CREATE POLICY "complaints_select_own" ON public.complaints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "complaints_insert_own" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "complaints_update_own" ON public.complaints
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "complaints_select_admin" ON public.complaints
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "complaints_update_admin" ON public.complaints
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ---------- ATTENDANCE ----------
CREATE POLICY "attendance_select_own" ON public.attendance_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "attendance_insert_own" ON public.attendance_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attendance_select_admin" ON public.attendance_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ---------- CHAT MESSAGES ----------
CREATE POLICY "chat_select_own" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "chat_insert_own" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id AND sender = 'user');

CREATE POLICY "chat_select_admin" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "chat_insert_admin" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender = 'admin' AND
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
