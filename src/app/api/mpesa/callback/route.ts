import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { ResultCode, CheckoutRequestID, CallbackMetadata } =
      body.Body.stkCallback

    const supabase = createServerSupabase()

    if (ResultCode === 0) {
      // Payment successful — extract M-Pesa receipt number
      const mpesaRef = CallbackMetadata.Item.find(
        (i: any) => i.Name === 'MpesaReceiptNumber'
      )?.Value

      const amount = CallbackMetadata.Item.find(
        (i: any) => i.Name === 'Amount'
      )?.Value

      const phone = CallbackMetadata.Item.find(
        (i: any) => i.Name === 'PhoneNumber'
      )?.Value

      // Update contribution to paid
      await supabase
        .from('contributions')
        .update({
          status: 'paid',
          mpesa_ref: mpesaRef,
          paid_at: new Date().toISOString(),
        })
        .eq('checkout_request_id', CheckoutRequestID)

      console.log('Payment confirmed:', { mpesaRef, amount, phone })
    } else {
      // Payment failed or cancelled — mark as failed
      await supabase
        .from('contributions')
        .update({ status: 'failed' })
        .eq('checkout_request_id', CheckoutRequestID)

      console.log('Payment failed. ResultCode:', ResultCode)
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Callback error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}