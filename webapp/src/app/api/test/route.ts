import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      return NextResponse.json({ error: 'Missing variables', url: !!url, key: !!key });
    }

    const supabase = createClient(url.trim(), key.trim());

    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test_health_check@example.com',
      password: 'password123',
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({
        message: error.message,
        name: error.name,
        stack: error.stack,
        details: error,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({
      catch_message: e.message,
      catch_name: e.name,
      catch_stack: e.stack,
      catch_cause: e.cause ? String(e.cause) : null
    });
  }
}
