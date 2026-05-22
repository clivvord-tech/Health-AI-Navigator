-- HealthNav Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Reports table (radiology AI analysis results)
create table if not exists reports (
  id bigint primary key generated always as identity,
  user_id text not null,
  title text not null,
  original_text text,
  simplified_explanation text,
  urgency text default 'low',
  status text default 'complete',
  recommended_next_steps text,
  medical_terms_breakdown text,
  report_type text,
  body_part text,
  share_token text unique,
  created_at timestamptz default now()
);

-- Chat messages table
create table if not exists chat_messages (
  id bigint primary key generated always as identity,
  user_id text not null,
  report_id bigint references reports(id) on delete set null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists reports_user_id_idx on reports(user_id);
create index if not exists reports_created_at_idx on reports(created_at desc);
create index if not exists chat_messages_user_id_idx on chat_messages(user_id);

-- Row Level Security (optional but recommended for production)
-- alter table reports enable row level security;
-- alter table chat_messages enable row level security;
