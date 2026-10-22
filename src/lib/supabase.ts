import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pbxootcdttwvwokhnhqy.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseAnonKey) {
  console.warn("⚠️ Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in .env.local");
}

// 1. عميل Supabase الرسمي (PostgREST, Realtime, Storage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. مجمع الاتصال المباشر عبر PostgreSQL (Pool) للاستعلامات المتقدمة والمعاملات (Transactions)
let pool: Pool | null = null;

export function getPgPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = getPgPool();
  const res = await p.query(text, params);
  return res.rows;
}
