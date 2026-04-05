import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('M-Pesa callback received:', JSON.stringify(body, null, 2))

    const { ResultCode, CheckoutRequestID, CallbackMetadata } =
      body.Body.stkCallback

    const supabase = await createServerSupabase()

    if (ResultCode === 0) {
      const mpesaRef = CallbackMetadata.Item.find(
        (i: any) => i.Name === 'MpesaReceiptNumber'
      )?.Value

      const amount = CallbackMetadata.Item.find(
        (i: any) => i.Name === 'Amount'
      )?.Value

      console.log('Payment confirmed:', { mpesaRef, amount, CheckoutRequestID })

      const { data: schedule } = await supabase
        .from('loan_schedules')
        .select('*')
        .eq('checkout_request_id', CheckoutRequestID)
        .single()

      if (schedule) {
        const newAmountPaid = (schedule.amount_paid ?? 0) + Number(amount)
        const isFullyPaid = newAmountPaid >= schedule.amount_due

        await supabase
          .from('loan_schedules')
          .update({
            amount_paid: newAmountPaid,
            status: isFullyPaid ? 'paid' : 'partial',
            mpesa_ref: mpesaRef,
            paid_at: isFullyPaid ? new Date().toISOString() : null,
          })
          .eq('id', schedule.id)

        await supabase.rpc('decrement_balance', {
          loan_id: schedule.loan_id,
          amount: Number(amount),
        })

        const { data: loan } = await supabase
          .from('loans')
          .select('balance')
          .eq('id', schedule.loan_id)
          .single()

        if (loan && loan.balance <= 0) {
          await supabase
            .from('loans')
            .update({ status: 'paid', balance: 0 })
            .eq('id', schedule.loan_id)
        }
      }

      const { data: contribution } = await supabase
        .from('contributions')
        .select('id')
        .eq('checkout_request_id', CheckoutRequestID)
        .maybeSingle()

      if (contribution) {
        await supabase
          .from('contributions')
          .update({
            status: 'paid',
            mpesa_ref: mpesaRef,
            paid_at: new Date().toISOString(),
          })
          .eq('checkout_request_id', CheckoutRequestID)
      }

    } else {
      console.log('Payment failed. ResultCode:', ResultCode)

      await supabase
        .from('loan_schedules')
        .update({ status: 'pending' })
        .eq('checkout_request_id', CheckoutRequestID)

      await supabase
        .from('contributions')
        .update({ status: 'failed' })
        .eq('checkout_request_id', CheckoutRequestID)
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Callback error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
