-- 1. Create the records table
create table public.records (
    id text primary key,
    type text not null,
    timestamp bigint not null,
    "milkType" text,
    amount numeric,
    "leftDuration" numeric,
    "rightDuration" numeric,
    "endTime" bigint,
    duration numeric,
    photo text,
    note text,
    "updatedAt" bigint not null
);

-- Enable RLS (Row Level Security) if needed, or keep it open for simple family tracking
alter table public.records enable row level security;
create policy "Allow public access" on public.records for all using (true) with check (true);

-- 2. Enable Realtime on the records table
alter publication supabase_realtime add table public.records;

-- 3. Storage Bucket Configuration
-- Please create a public storage bucket named "baby-photos" in your Supabase dashboard.
-- Once created, add the following policy to allow public uploads and downloads:
-- Go to Storage -> Policies -> "baby-photos" bucket -> Create policy:
-- Allow insert, select, delete for all users (or public).
