import { NextResponse } from 'next/server'
import { getDarajaToken, stkPush } from '@/lib/mpesa/daraja'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { phone, amount, memberId, chamaId, period, scheduleId, loanId } = await req.json()

    if (!phone || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 1. Get OAuth token
    const token = await getDarajaToken()

    // 2. Initiate STK push
    const result = await stkPush({
      token,
      phone,
      amount,
      accountRef: 'CHAMAHUB',
      description: 'Loan repayment',
    })

    const checkoutRequestId = result.CheckoutRequestID

    const supabase = await createServerSupabase()

    // 3. If this is a loan schedule payment, save checkout_request_id on schedule
    if (scheduleId && loanId) {
      await supabase
        .from('loan_schedules')
        .update({ checkout_request_id: checkoutRequestId })
        .eq('id', scheduleId)
    }

    // 4. If this is a contribution payment, save to contributions table
    if (memberId && chamaId) {
      await supabase.from('contributions').insert({
        member_id: memberId,
        chama_id: chamaId,
        amount,
        period: period ?? new Date().toISOString().slice(0, 7),
        status: 'pending',
        checkout_request_id: checkoutRequestId,
      })
    }

    return NextResponse.json({
      success: true,
      checkoutRequestId,
      message: 'Payment prompt sent to ' + phone,
    })
  } catch (error: any) {
    console.error('STK Push error:', error?.response?.data || error.message)
    return NextResponse.json(
      { error: error?.response?.data?.errorMessage || error.message || 'STK push failed' },
      { status: 500 }
    )
  }
}