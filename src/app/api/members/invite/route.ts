import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { memberId, fullName, phone, chamaName } = await req.json()

    if (!memberId || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use service role to create auth user
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Generate email and password from phone
    const email = phone.replace(/\s/g, '') + '@chamahub.co.ke'
    const password = phone.replace(/\s/g, '')

    // 1. Create auth user
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError && !authError.message.includes('already been registered')) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authUser?.user?.id

    if (userId) {
      // 2. Link auth user to member record
      const supabase = await createServerSupabase()
      await supabase
        .from('members')
        .update({ user_id: userId })
        .eq('id', memberId)
    }

    // 3. Send SMS with credentials
    const smsMessage = `Welcome to ${chamaName} on ChamaHub!\n\nYour login details:\nEmail: ${email}\nPassword: ${phone.replace(/\s/g, '')}\n\nLogin at: ${process.env.NEXT_PUBLIC_APP_URL}/login\n\nPlease change your password after first login.`

    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [phone.startsWith('0') ? '+254' + phone.slice(1) : phone],
          message: smsMessage,
        }),
      })
    } catch (smsError) {
      console.error('SMS failed:', smsError)
    }

    return NextResponse.json({
      success: true,
      email,
      message: `Account created and SMS sent to ${phone}`,
    })
  } catch (error: any) {
    console.error('Invite error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}