import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Request a password reset code and store it in Supabase
 */
export async function requestPasswordReset(user_id: string) {
    const code = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit code

    const { error } = await supabaseAdmin.from("password_reset_codes").insert({
        user_id,
        code,
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 min expiry
    });

    if (error) throw error;

    // You can now send the code via your own email method
    // e.g., via Supabase SMTP, nodemailer, or any service

    return code; // return the code so caller can handle sending
}

/**
 * Reset the password using code
 */
export async function resetPassword(user_id: string, code: string, newPassword: string) {
    // Verify code
    const { data, error } = await supabaseAdmin
        .from("password_reset_codes")
        .select("*")
        .eq("user_id", user_id)
        .eq("code", code)
        .eq("used", false)
        .single();

    if (error || !data) throw new Error("Invalid or expired code");
    if (new Date(data.expires_at) < new Date()) throw new Error("Code expired");

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        password: newPassword,
    });
    if (updateError) throw updateError;

    // Mark code as used
    await supabaseAdmin
        .from("password_reset_codes")
        .update({ used: true })
        .eq("id", data.id);

    return true;
}
