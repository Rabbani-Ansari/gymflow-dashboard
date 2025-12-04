import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user from the JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, targetUserId } = await req.json();
    console.log(`Action: ${action}, User: ${user.id}, Target: ${targetUserId}`);

    if (action === 'grant-initial-admin') {
      // Check if there are any admins
      const { data: existingAdmins, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (checkError) {
        console.error('Check error:', checkError);
        return new Response(
          JSON.stringify({ error: 'Failed to check existing admins' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (existingAdmins && existingAdmins.length > 0) {
        return new Response(
          JSON.stringify({ error: 'Admin already exists. Contact an existing admin.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Grant admin role to the requesting user (first user becomes admin)
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'admin' });

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to grant admin role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Admin role granted to user: ${user.id}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Admin role granted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'grant-admin') {
      // Check if the requesting user is an admin
      const { data: requesterRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

    if (action === 'grant-admin-self') {
      // Directly grant admin role to the current user (for debugging)
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'admin' });

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to grant admin role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Admin role self-granted to user: ${user.id}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Admin role self-granted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

      if (roleError || !requesterRole) {
        return new Response(
          JSON.stringify({ error: 'Only admins can grant admin roles' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!targetUserId) {
        return new Response(
          JSON.stringify({ error: 'Target user ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Grant admin role to target user
      const { error: insertError } = await supabase
        .from('user_roles')
        .upsert({ user_id: targetUserId, role: 'admin' }, { onConflict: 'user_id,role' });

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to grant admin role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Admin role granted to user: ${targetUserId} by ${user.id}`);
      return new Response(
        JSON.stringify({ success: true, message: 'Admin role granted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'check-admin-exists') {
      const { data: existingAdmins, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (checkError) {
        return new Response(
          JSON.stringify({ error: 'Failed to check' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ adminExists: existingAdmins && existingAdmins.length > 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
