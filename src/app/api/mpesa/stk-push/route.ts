import { NextResponse } from 'next/server'
import { getDarajaToken, stkPush } from '@/lib/mpesa/daraja'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { phone, amount, memberId, chamaId, period } = await req.json()

    if (!phone || !amount || !memberId || !chamaId || !period) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 1. Get OAuth token from Safaricom
    const token = await getDarajaToken()

    // 2. Initiate STK push
    const result = await stkPush({
      token,
      phone,
      amount,
      accountRef: 'CHAMA-' + chamaId,
      description: 'Monthly contribution',
    })

    // 3. Save pending transaction in Supabase
    const supabase = createServerSupabase()
    await supabase.from('contributions').insert({
      member_id: memberId,
      chama_id: chamaId,
      amount,
      period,
      status: 'pending',
      checkout_request_id: result.CheckoutRequestID,
    })

    return NextResponse.json({
      success: true,
      checkoutRequestId: result.CheckoutRequestID,
      message: 'Payment prompt sent to ' + phone,
    })
  } catch (error: any) {
    console.error('STK Push error:', error)
    return NextResponse.json(
      { error: error.message || 'STK push failed' },
      { status: 500 }
    )
  }
}