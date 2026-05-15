import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const action: string = body.action
    const payload: Record<string, string> = body.payload ?? {}

    // List Users
    if (action === 'list') {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
      if (error) throw error
      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Invite User — sends invite email, user sets their own password
    if (action === 'invite') {
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(payload.email, {
        redirectTo: payload.redirectTo,
        data: { name: payload.name, role: payload.role, branch_id: payload.branch_id || null }
      })
      if (error) throw error
      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update Role & Name — preserves existing user_metadata, updates role and optionally name
    if (action === 'update-role') {
      const { data: existing, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(payload.userId)
      if (fetchError) throw fetchError
      const currentMeta = existing.user?.user_metadata ?? {}
      const updatedMeta: Record<string, string> = { ...currentMeta, role: payload.role }
      if (payload.name) updatedMeta.name = payload.name
      if (payload.branch_id !== undefined) updatedMeta.branch_id = payload.branch_id
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(payload.userId, {
        user_metadata: updatedMeta
      })
      if (error) throw error
      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update Status (ban/unban)
    if (action === 'update-status') {
      const isBanned = payload.status === 'inactive'
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(payload.userId, {
        ban_duration: isBanned ? '876600h' : 'none'
      })
      if (error) throw error
      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Delete User
    if (action === 'delete') {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(payload.userId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Unknown action command')
  } catch (error) {
    const msg = (error as Error).message ?? 'Unknown error'
    console.error('[admin-user-manager] Error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
