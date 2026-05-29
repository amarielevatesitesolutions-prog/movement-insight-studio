
-- Enums
CREATE TYPE public.app_role AS ENUM ('student', 'coach');
CREATE TYPE public.movement_type AS ENUM ('gait_walk','ground_flow','hip_hinge','squat','overhead','spinal_articulation','custom');
CREATE TYPE public.analysis_status AS ENUM ('analyzed','pending_review','reviewed');

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- analyses
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_path TEXT NOT NULL,
  movement_type public.movement_type NOT NULL,
  notes TEXT,
  ai_feedback JSONB,
  awareness_score INTEGER,
  coach_note TEXT,
  status public.analysis_status NOT NULL DEFAULT 'analyzed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX analyses_user_id_idx ON public.analyses(user_id);
CREATE INDEX analyses_status_idx ON public.analyses(status);

GRANT SELECT, INSERT, UPDATE ON public.analyses TO authenticated;
GRANT ALL ON public.analyses TO service_role;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analyses owner read" ON public.analyses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "analyses owner insert" ON public.analyses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analyses owner update" ON public.analyses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "analyses coach read" ON public.analyses FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'coach'));
CREATE POLICY "analyses coach update" ON public.analyses FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'coach'));

-- streaks
CREATE TABLE public.streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  last_practice_date DATE
);
GRANT SELECT, INSERT, UPDATE ON public.streaks TO authenticated;
GRANT ALL ON public.streaks TO service_role;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "streaks self read" ON public.streaks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "streaks self upsert" ON public.streaks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "streaks self update" ON public.streaks FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Signup trigger: create profile + default student role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  desired_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  desired_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, desired_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('movement-videos','movement-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: owner read/write/delete, coaches read all
CREATE POLICY "videos owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'movement-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "videos owner insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'movement-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "videos owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'movement-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "videos coach read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'movement-videos' AND public.has_role(auth.uid(),'coach'));
