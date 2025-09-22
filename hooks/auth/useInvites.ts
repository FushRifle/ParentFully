import { supabase } from '@/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Short referral code generator (6 characters)
function generateShortCode(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Create an invite and return the referral code (e.g., ABC123)
export async function createInviteLink(inviterId: string): Promise<string> {
    const now = new Date();

    // Step 1: Check for existing valid invite
    const { data: existingInvite, error: existingError } = await supabase
        .from('invites')
        .select('code, expires_at, accepted')
        .eq('inviter_id', inviterId)
        .eq('accepted', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!existingError && existingInvite && new Date(existingInvite.expires_at) > now) {
        return existingInvite.code;
    }

    // Step 2: Get inviter's family_id from family_members table
    const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', inviterId)
        .maybeSingle();

    if (membershipError || !membership?.family_id) {
        throw new Error('Inviter must belong to a family.');
    }

    // Step 3: Generate new invite
    const token = uuidv4();
    const code = generateShortCode();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24); // 24h from now

    // Step 4: Insert new invite
    const { data, error } = await supabase
        .from('invites')
        .insert([{
            token,
            code,
            family_id: membership.family_id,
            inviter_id: inviterId,
            expires_at: expiresAt.toISOString(),
            accepted: false,
        }])
        .select()
        .single();

    if (error || !data) {
        console.error('Invite creation failed:', error);
        throw new Error('Could not create invite');
    }

    return code;
}

// Accept invite using referral code
export async function acceptInviteByCode(code: string, newUserId: string): Promise<boolean> {
    const { data: invite, error } = await supabase
        .from('invites')
        .select('*')
        .eq('code', code)
        .eq('accepted', false)
        .single();

    if (error || !invite) throw new Error('Invalid or expired invite code');
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) throw new Error('Invite has expired');

    // ✅ Use invite.family_id as source of truth
    const familyId = invite.family_id;

    // Optional: update the users.family_id just to keep it in sync
    await supabase
        .from('users')
        .update({ family_id: familyId })
        .eq('id', newUserId);

    // Insert into family_members
    await supabase
        .from('family_members')
        .insert({ user_id: newUserId, family_id: familyId });

    // Link to children (if needed)
    const { data: children } = await supabase
        .from('children')
        .select('id')
        .eq('family_id', familyId);

    if (children?.length) {
        const inserts = children.map((child) => ({
            user_id: newUserId,
            child_id: child.id,
        }));

        await supabase.from('child_users').insert(inserts);
    }

    // Mark invite as accepted
    await supabase
        .from('invites')
        .update({ accepted: true })
        .eq('id', invite.id);

    return true;
}

