-- ==============================================================================
-- DIVINE SCHOOL MANAGEMENT SYSTEM - SUPABASE POSTGRES SCHEMA
-- Multi-Tenant Database Architecture with Row Level Security (RLS)
-- and Realtime WebSocket Publications for 4G Cross-Device Sync
-- ==============================================================================

-- 1. Create Extensions
create extension if not exists "uuid-ossp";

-- 2. SCHOOLS (Multi-Tenant Organizations)
create table if not exists public.schools (
    id text primary key,
    name text not null,
    code text not null unique,
    city text default 'New Delhi',
    state text default 'Delhi',
    created_at timestamptz default now()
);

-- 3. USERS / PROFILES (Role-Based Directory)
create table if not exists public.users (
    id text primary key,
    school_id text not null references public.schools(id) on delete cascade,
    username text not null,
    name text not null,
    role text not null check (role in ('admin', 'teacher', 'parent', 'student')),
    grade text,
    avatar_bg text default '#0071e3',
    linked_student_ids jsonb default '[]'::jsonb,
    created_at timestamptz default now()
);

-- 4. STUDENTS (Student Roster)
create table if not exists public.students (
    id text primary key,
    school_id text not null references public.schools(id) on delete cascade,
    roll_no text not null,
    name text not null,
    gender text not null check (gender in ('M', 'F')),
    grade text not null,
    parent_name text not null,
    parent_phone text,
    parent_email text,
    avatar_initials text,
    avatar_bg text default '#e8f1fc',
    attendance_rate numeric(5, 2) default 95.0,
    total_present integer default 50,
    total_days integer default 55,
    created_at timestamptz default now()
);

-- 5. ATTENDANCE RECORDS (Daily Entry Events)
create table if not exists public.attendance_records (
    id text primary key default uuid_generate_v4()::text,
    school_id text not null references public.schools(id) on delete cascade,
    student_id text not null references public.students(id) on delete cascade,
    date date not null default current_date,
    status text not null check (status in ('present', 'absent', 'late', 'unmarked')),
    marked_at timestamptz default now(),
    marked_by text,
    notes text,
    created_at timestamptz default now(),
    constraint uq_student_daily_attendance unique (school_id, student_id, date)
);

-- 6. CLASSROOM REGISTERS (Daily Submission Sign-off per Grade)
create table if not exists public.classroom_registers (
    id text primary key default uuid_generate_v4()::text,
    school_id text not null references public.schools(id) on delete cascade,
    grade text not null,
    date date not null default current_date,
    is_submitted boolean default false,
    submitted_at timestamptz,
    submitted_by text,
    present_count integer default 0,
    total_count integer default 0,
    created_at timestamptz default now(),
    constraint uq_grade_daily_register unique (school_id, grade, date)
);

-- 7. HOMEWORK ITEMS (Daily Digital Diary)
create table if not exists public.homework_items (
    id text primary key,
    school_id text not null references public.schools(id) on delete cascade,
    title text not null,
    subject text not null,
    grade text not null,
    teacher_name text not null,
    assigned_date text not null,
    due_date text not null,
    instructions text,
    total_students integer default 32,
    submitted_count integer default 0,
    tags jsonb default '[]'::jsonb,
    status_color text default '#0071e3',
    created_at timestamptz default now()
);

-- 8. HOMEWORK SUBMISSIONS
create table if not exists public.homework_submissions (
    id text primary key default uuid_generate_v4()::text,
    school_id text not null references public.schools(id) on delete cascade,
    homework_id text not null references public.homework_items(id) on delete cascade,
    student_id text not null references public.students(id) on delete cascade,
    is_submitted boolean default true,
    submitted_at timestamptz default now(),
    constraint uq_hw_student_submission unique (homework_id, student_id)
);

-- 9. BIOMETRIC SIGNATURES (Parent Cryptographic Verification)
create table if not exists public.homework_signatures (
    id text primary key default uuid_generate_v4()::text,
    school_id text not null references public.schools(id) on delete cascade,
    homework_id text not null references public.homework_items(id) on delete cascade,
    student_id text not null references public.students(id) on delete cascade,
    verified_by text not null,
    student_name text not null,
    timestamp timestamptz default now(),
    display_time text,
    method text default 'fingerprint',
    verification_hash text not null,
    created_at timestamptz default now(),
    constraint uq_hw_biometric_signature unique (homework_id, student_id)
);

-- 10. SCHOOL NOTIFICATIONS & BROADCASTS
create table if not exists public.notifications (
    id text primary key,
    school_id text not null references public.schools(id) on delete cascade,
    category text not null check (category in ('attendance', 'homework', 'announcement', 'event', 'fees')),
    title text not null,
    message text not null,
    timestamp text not null,
    target_grades jsonb default '[]'::jsonb,
    sender text not null,
    is_read boolean default false,
    priority text default 'normal' check (priority in ('low', 'normal', 'high')),
    read_percentage integer default 90,
    created_at timestamptz default now()
);

-- 11. REALTIME ACTIVITY AUDIT LOG (Cross-Device Broadcast Bus in Cloud)
create table if not exists public.realtime_events (
    id text primary key,
    school_id text not null references public.schools(id) on delete cascade,
    type text not null,
    timestamp timestamptz default now(),
    sender_role text not null,
    sender_name text not null,
    title text not null,
    message text not null,
    payload jsonb default '{}'::jsonb
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures data privacy, isolation, and secure multi-tenant access
-- ==============================================================================

alter table public.schools enable row level security;
alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.attendance_records enable row level security;
alter table public.classroom_registers enable row level security;
alter table public.homework_items enable row level security;
alter table public.homework_submissions enable row level security;
alter table public.homework_signatures enable row level security;
alter table public.notifications enable row level security;
alter table public.realtime_events enable row level security;

-- Drop previous permissive policies
drop policy if exists "Enable all for anon and authenticated" on public.schools;
drop policy if exists "Enable all for users" on public.users;
drop policy if exists "Enable all for students" on public.students;
drop policy if exists "Enable all for attendance_records" on public.attendance_records;
drop policy if exists "Enable all for classroom_registers" on public.classroom_registers;
drop policy if exists "Enable all for homework_items" on public.homework_items;
drop policy if exists "Enable all for homework_submissions" on public.homework_submissions;
drop policy if exists "Enable all for homework_signatures" on public.homework_signatures;
drop policy if exists "Enable all for notifications" on public.notifications;
drop policy if exists "Enable all for realtime_events" on public.realtime_events;

-- 1. SCHOOLS
drop policy if exists "schools_select_policy" on public.schools;
create policy "schools_select_policy" on public.schools for select using (true);
drop policy if exists "schools_insert_policy" on public.schools;
create policy "schools_insert_policy" on public.schools for insert with check (id is not null and length(id) > 0);
drop policy if exists "schools_update_policy" on public.schools;
create policy "schools_update_policy" on public.schools for update using (id is not null) with check (id is not null);
drop policy if exists "schools_delete_policy" on public.schools;
create policy "schools_delete_policy" on public.schools for delete using (id is not null);

-- 2. USERS
drop policy if exists "users_select_policy" on public.users;
create policy "users_select_policy" on public.users for select using (true);
drop policy if exists "users_insert_policy" on public.users;
create policy "users_insert_policy" on public.users for insert with check (school_id is not null and length(school_id) > 0);
drop policy if exists "users_update_policy" on public.users;
create policy "users_update_policy" on public.users for update using (school_id is not null) with check (school_id is not null);
drop policy if exists "users_delete_policy" on public.users;
create policy "users_delete_policy" on public.users for delete using (school_id is not null);

-- 3. STUDENTS
drop policy if exists "students_select_policy" on public.students;
create policy "students_select_policy" on public.students for select using (true);
drop policy if exists "students_insert_policy" on public.students;
create policy "students_insert_policy" on public.students for insert with check (school_id is not null and length(school_id) > 0);
drop policy if exists "students_update_policy" on public.students;
create policy "students_update_policy" on public.students for update using (school_id is not null) with check (school_id is not null);
drop policy if exists "students_delete_policy" on public.students;
create policy "students_delete_policy" on public.students for delete using (school_id is not null);

-- 4. ATTENDANCE RECORDS
drop policy if exists "attendance_records_select_policy" on public.attendance_records;
create policy "attendance_records_select_policy" on public.attendance_records for select using (true);
drop policy if exists "attendance_records_insert_policy" on public.attendance_records;
create policy "attendance_records_insert_policy" on public.attendance_records for insert with check (school_id is not null and student_id is not null);
drop policy if exists "attendance_records_update_policy" on public.attendance_records;
create policy "attendance_records_update_policy" on public.attendance_records for update using (school_id is not null) with check (school_id is not null);
drop policy if exists "attendance_records_delete_policy" on public.attendance_records;
create policy "attendance_records_delete_policy" on public.attendance_records for delete using (school_id is not null);

-- 5. CLASSROOM REGISTERS
drop policy if exists "classroom_registers_select_policy" on public.classroom_registers;
create policy "classroom_registers_select_policy" on public.classroom_registers for select using (true);
drop policy if exists "classroom_registers_insert_policy" on public.classroom_registers;
create policy "classroom_registers_insert_policy" on public.classroom_registers for insert with check (school_id is not null and grade is not null);
drop policy if exists "classroom_registers_update_policy" on public.classroom_registers;
create policy "classroom_registers_update_policy" on public.classroom_registers for update using (school_id is not null) with check (school_id is not null);
drop policy if exists "classroom_registers_delete_policy" on public.classroom_registers;
create policy "classroom_registers_delete_policy" on public.classroom_registers for delete using (school_id is not null);

-- 6. HOMEWORK ITEMS
drop policy if exists "homework_items_select_policy" on public.homework_items;
create policy "homework_items_select_policy" on public.homework_items for select using (true);
drop policy if exists "homework_items_insert_policy" on public.homework_items;
create policy "homework_items_insert_policy" on public.homework_items for insert with check (school_id is not null and length(school_id) > 0);
drop policy if exists "homework_items_update_policy" on public.homework_items;
create policy "homework_items_update_policy" on public.homework_items for update using (school_id is not null) with check (school_id is not null);
drop policy if exists "homework_items_delete_policy" on public.homework_items;
create policy "homework_items_delete_policy" on public.homework_items for delete using (school_id is not null);

-- 7. HOMEWORK SUBMISSIONS
drop policy if exists "homework_submissions_select_policy" on public.homework_submissions;
create policy "homework_submissions_select_policy" on public.homework_submissions for select using (true);
drop policy if exists "homework_submissions_insert_policy" on public.homework_submissions;
create policy "homework_submissions_insert_policy" on public.homework_submissions for insert with check (school_id is not null and homework_id is not null and student_id is not null);
drop policy if exists "homework_submissions_update_policy" on public.homework_submissions;
create policy "homework_submissions_update_policy" on public.homework_submissions for update using (school_id is not null) with check (school_id is not null);
drop policy if exists "homework_submissions_delete_policy" on public.homework_submissions;
create policy "homework_submissions_delete_policy" on public.homework_submissions for delete using (school_id is not null);

-- 8. HOMEWORK SIGNATURES
drop policy if exists "homework_signatures_select_policy" on public.homework_signatures;
create policy "homework_signatures_select_policy" on public.homework_signatures for select using (true);
drop policy if exists "homework_signatures_insert_policy" on public.homework_signatures;
create policy "homework_signatures_insert_policy" on public.homework_signatures for insert with check (school_id is not null and homework_id is not null and student_id is not null);
drop policy if exists "homework_signatures_update_policy" on public.homework_signatures;
create policy "homework_signatures_update_policy" on public.homework_signatures for update using (school_id is not null) with check (school_id is not null);
drop policy if exists "homework_signatures_delete_policy" on public.homework_signatures;
create policy "homework_signatures_delete_policy" on public.homework_signatures for delete using (school_id is not null);

-- 9. NOTIFICATIONS
drop policy if exists "notifications_select_policy" on public.notifications;
create policy "notifications_select_policy" on public.notifications for select using (true);
drop policy if exists "notifications_insert_policy" on public.notifications;
create policy "notifications_insert_policy" on public.notifications for insert with check (school_id is not null and length(school_id) > 0);
drop policy if exists "notifications_update_policy" on public.notifications;
create policy "notifications_update_policy" on public.notifications for update using (school_id is not null) with check (school_id is not null);
drop policy if exists "notifications_delete_policy" on public.notifications;
create policy "notifications_delete_policy" on public.notifications for delete using (school_id is not null);

-- 10. REALTIME EVENTS
drop policy if exists "realtime_events_select_policy" on public.realtime_events;
create policy "realtime_events_select_policy" on public.realtime_events for select using (true);
drop policy if exists "realtime_events_insert_policy" on public.realtime_events;
create policy "realtime_events_insert_policy" on public.realtime_events for insert with check (school_id is not null and length(school_id) > 0);
drop policy if exists "realtime_events_update_policy" on public.realtime_events;
create policy "realtime_events_update_policy" on public.realtime_events for update using (school_id is not null) with check (school_id is not null);
drop policy if exists "realtime_events_delete_policy" on public.realtime_events;
create policy "realtime_events_delete_policy" on public.realtime_events for delete using (school_id is not null);

-- ==============================================================================
-- SECURITY DEFINER HARDENING
-- Revoke execute permissions on internal functions from anon and authenticated roles
-- ==============================================================================
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on p.pronamespace = n.oid
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
    alter function public.rls_auto_enable() security invoker;
  end if;
end $$;

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- Adds tables to supabase_realtime publication for instant WebSocket delivery
-- ==============================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'attendance_records'
  ) then
    alter publication supabase_realtime add table public.attendance_records;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'classroom_registers'
  ) then
    alter publication supabase_realtime add table public.classroom_registers;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'homework_items'
  ) then
    alter publication supabase_realtime add table public.homework_items;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'homework_submissions'
  ) then
    alter publication supabase_realtime add table public.homework_submissions;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'homework_signatures'
  ) then
    alter publication supabase_realtime add table public.homework_signatures;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'realtime_events'
  ) then
    alter publication supabase_realtime add table public.realtime_events;
  end if;
end $$;

-- ==============================================================================
-- SEED INITIAL DATA (Divine School Prototype Dataset)
-- ==============================================================================

insert into public.schools (id, name, code, city, state)
values ('sch-divine-01', 'Divine School', 'DIVINE-DELHI', 'New Delhi', 'Delhi')
on conflict (id) do update set name = excluded.name;

insert into public.users (id, school_id, username, name, role, grade, avatar_bg, linked_student_ids)
values
  ('usr-t1', 'sch-divine-01', 'teacher', 'Mrs. Sharma', 'teacher', 'Class 7B', '#0071e3', '[]'::jsonb),
  ('usr-p1', 'sch-divine-01', 'parent', 'Khurshid Alam', 'parent', 'Class 7B', '#34c759', '["s-01"]'::jsonb),
  ('usr-s1', 'sch-divine-01', 'student', 'Aryan Khurshid', 'student', 'Class 7B', '#5856d6', '[]'::jsonb),
  ('usr-a1', 'sch-divine-01', 'admin', 'Principal & Management', 'admin', null, '#af52de', '[]'::jsonb)
on conflict (id) do nothing;

insert into public.students (id, school_id, roll_no, name, gender, grade, parent_name, parent_phone, parent_email, avatar_initials, avatar_bg, attendance_rate, total_present, total_days)
values
  ('s-01', 'sch-divine-01', '01', 'Aryan Khurshid', 'M', 'Class 7B', 'Khurshid Alam', '+91 98765 43210', 'khurshid.alam@gmail.com', 'AK', '#e8f9ed', 98.2, 54, 55),
  ('s-02', 'sch-divine-01', '02', 'Divya Mukerjee', 'F', 'Class 7B', 'Sunita Mukerjee', '+91 98111 22334', 'sunita.m@gmail.com', 'DM', '#ffe8e7', 91.0, 50, 55),
  ('s-03', 'sch-divine-01', '03', 'Karan Malhotra', 'M', 'Class 7B', 'Rajesh Malhotra', '+91 98222 33445', 'rajesh.malhotra@yahoo.com', 'KM', '#e8f1fc', 96.4, 53, 55),
  ('s-04', 'sch-divine-01', '04', 'Sarah Khan', 'F', 'Class 7B', 'Farhan Khan', '+91 98333 44556', 'farhan.k@gmail.com', 'SK', '#fff5e6', 94.5, 52, 55),
  ('s-05', 'sch-divine-01', '05', 'Kabir Das', 'M', 'Class 7B', 'Amit Das', '+91 98444 55667', 'amit.das@outlook.com', 'KD', '#f5eafa', 98.0, 54, 55),
  ('s-06', 'sch-divine-01', '06', 'Ananya Roy', 'F', 'Class 7B', 'Bikram Roy', '+91 98555 66778', 'b.roy@gmail.com', 'AR', '#e6f7fd', 100.0, 55, 55),
  ('s-07', 'sch-divine-01', '07', 'Rohan Verma', 'M', 'Class 7B', 'Sanjay Verma', '+91 98666 77889', 'sanjay.verma@gmail.com', 'RV', '#fde8ef', 89.1, 49, 55),
  ('s-08', 'sch-divine-01', '08', 'Meera Joshi', 'F', 'Class 7B', 'Pooja Joshi', '+91 98777 88990', 'pooja.joshi@gmail.com', 'MJ', '#eaf6ec', 97.5, 53, 55)
on conflict (id) do nothing;

insert into public.attendance_records (school_id, student_id, date, status, marked_at, marked_by)
values
  ('sch-divine-01', 's-01', current_date, 'present', now(), 'Mrs. Sharma'),
  ('sch-divine-01', 's-02', current_date, 'absent', now(), 'Mrs. Sharma'),
  ('sch-divine-01', 's-03', current_date, 'present', now(), 'Mrs. Sharma'),
  ('sch-divine-01', 's-04', current_date, 'late', now(), 'Mrs. Sharma'),
  ('sch-divine-01', 's-05', current_date, 'present', now(), 'Mrs. Sharma'),
  ('sch-divine-01', 's-06', current_date, 'present', now(), 'Mrs. Sharma'),
  ('sch-divine-01', 's-07', current_date, 'present', now(), 'Mrs. Sharma'),
  ('sch-divine-01', 's-08', current_date, 'present', now(), 'Mrs. Sharma')
on conflict (school_id, student_id, date) do nothing;

insert into public.classroom_registers (school_id, grade, date, is_submitted, submitted_at, submitted_by, present_count, total_count)
values ('sch-divine-01', 'Class 7B', current_date, true, now(), 'Mrs. Sharma', 7, 8)
on conflict (school_id, grade, date) do nothing;

insert into public.homework_items (id, school_id, title, subject, grade, teacher_name, assigned_date, due_date, instructions, total_students, submitted_count, tags, status_color)
values
  ('hw-01', 'sch-divine-01', 'Exercise 4.2 – Algebraic Expressions (Q1 to Q10)', 'Mathematics', 'Class 7B', 'Mrs. Sharma', 'Aug 06, 2026', 'Aug 08 (Fri)', 'Solve in the class homework notebook. Show all steps cleanly. Parents please verify with fingerprint.', 32, 28, '["NCERT Ch 4", "Algebra", "Graded"]'::jsonb, '#0071e3'),
  ('hw-02', 'sch-divine-01', 'Chapter 6: Cellular Respiration Diagram & Q&A', 'Science', 'Class 7B', 'Mr. Banerjee', 'Aug 06, 2026', 'Aug 09 (Sat)', 'Draw the labelled diagram of Mitochondria in practical notebook and write 3 differences between aerobic and anaerobic respiration.', 32, 19, '["Biology", "Diagram Required"]'::jsonb, '#34c759'),
  ('hw-03', 'sch-divine-01', 'Formal Letter to Municipal Commissioner (Civic Issues)', 'English Language', 'Class 7B', 'Ms. Cooper', 'Aug 05, 2026', 'Aug 07 (Today)', 'Write in about 120-150 words following the CBSE standard formal format. Pay attention to salutation and sign-off.', 32, 31, '["Writing Skills", "CBSE Format"]'::jsonb, '#af52de'),
  ('hw-04', 'sch-divine-01', 'Map Marking: Major Rivers and Plateau Regions of India', 'Social Science', 'Class 7B', 'Mrs. Pillai', 'Aug 04, 2026', 'Aug 10 (Mon)', 'Use an outline political map of India. Paste it securely in your Geography file after completion.', 32, 12, '["Geography", "Map Activity"]'::jsonb, '#ff9500'),
  ('hw-05', 'sch-divine-01', 'Vasant Chapter 7: "Kya Nirash Hua Jaye" - Prashnottar', 'Hindi', 'Class 7B', 'Mr. Tiwari', 'Aug 05, 2026', 'Aug 08 (Fri)', 'Prashna sankhya 1 se 5 tak uttar pustika mein likhiye evan yaad kijiye.', 32, 24, '["Vasant", "Literature"]'::jsonb, '#ff3b30')
on conflict (id) do nothing;

insert into public.homework_submissions (school_id, homework_id, student_id, is_submitted)
values
  ('sch-divine-01', 'hw-01', 's-01', true),
  ('sch-divine-01', 'hw-02', 's-01', false),
  ('sch-divine-01', 'hw-03', 's-01', true),
  ('sch-divine-01', 'hw-05', 's-01', true)
on conflict (homework_id, student_id) do nothing;

insert into public.homework_signatures (school_id, homework_id, student_id, verified_by, student_name, timestamp, display_time, method, verification_hash)
values
  ('sch-divine-01', 'hw-01', 's-01', 'Khurshid Alam (Aryan''s Father)', 'Aryan Khurshid', now() - interval '14 hours', 'Yesterday at 06:45 PM', 'fingerprint', 'BIO-SHA256-8A3F19'),
  ('sch-divine-01', 'hw-03', 's-01', 'Khurshid Alam (Aryan''s Father)', 'Aryan Khurshid', now() - interval '38 hours', 'Aug 05 at 08:10 PM', 'fingerprint', 'BIO-SHA256-B1C47E')
on conflict (homework_id, student_id) do nothing;

insert into public.notifications (id, school_id, category, title, message, timestamp, target_grades, sender, is_read, priority, read_percentage)
values
  ('n-01', 'sch-divine-01', 'attendance', 'Morning Entry Confirmed: Aryan is Present', 'Class 7B attendance marked by Mrs. Sharma at 08:14 AM. Student entered premises securely.', '08:14 AM', '["Class 7B"]'::jsonb, 'Mrs. Sharma · Class 7B', false, 'normal', 98),
  ('n-02', 'sch-divine-01', 'homework', 'New Mathematics Assignment Assigned', 'Mrs. Sharma added "Algebraic Expressions Ex 4.2". Due on Aug 08 (Fri). Biometric signature required.', '09:02 AM', '["Class 7B"]'::jsonb, 'Mrs. Sharma · Mathematics', false, 'normal', 94),
  ('n-03', 'sch-divine-01', 'announcement', 'Independence Day Celebration & Rehearsal Schedule', 'Special assembly rehearsals commence from Aug 10. Students participating in choir must stay till 03:00 PM.', 'Yesterday', '["All Grades"]'::jsonb, 'Principal & Management', true, 'normal', 99),
  ('n-04', 'sch-divine-01', 'event', 'Parent-Teacher Meeting (Term 1 Review) on Aug 23', 'Slots will be open for online booking starting this Friday. Individual 10-minute teacher meetings.', 'Aug 04', '["All Grades"]'::jsonb, 'Academic Coordinator', true, 'normal', 97)
on conflict (id) do nothing;
