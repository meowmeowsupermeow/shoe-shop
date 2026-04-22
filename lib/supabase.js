import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://gpgeuqypjzlfvnatzyqc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZ2V1cXlwanpsZnZuYXR6eXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTI1MjksImV4cCI6MjA5MTkyODUyOX0.Q-rLtKH42ihdtp_9WeORqW1XJdwLIynQFGuzVcqCrmM'
export const supabase = createClient(supabaseUrl, supabaseKey)
