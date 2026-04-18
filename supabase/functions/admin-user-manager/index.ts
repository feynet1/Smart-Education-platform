import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Required to safely allow your website to talk to your function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialize the Secure Admin Client using server-side variables
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Read what the React Frontend is asking us to do
    let action, payload;
    
    // For GET requests (list), we get action from URL. For POST, from body.
    if (req.method === 'GET') {
       action = new URL(req.url).searchParams.get('action');
    } else {
       const body = await req.json();
       action = body.action;
       payload = body.payload;
    }

    // 3. Action: List Users
    if (action === 'list') {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;
      return new Response(JSON.stringify({ users }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 4. Action: Create User
    if (action === 'create') {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: payload.email,
        password: payload.password, // Set a default password for them
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          name: payload.name,
          role: payload.role
        }
      })
      if (error) throw error
      return new Response(JSON.stringify({ user: data.user }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } 
    
    // 5. Action: Delete User
    if (action === 'delete') {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(payload.userId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    throw new Error('Unknown action command')
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
