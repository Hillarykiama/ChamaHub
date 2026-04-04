import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = body.Result

    if (result.ResultCode === 0) {
      const loanId = result.ReferenceData?.ReferenceItem?.Value?.replace('LOAN-', '')
      const amount = result.ResultParameters?.ResultParameter
        ?.find((p: any) => p.Key === 'TransactionAmount')?.Value
      const mpesaRef = result.ResultParameters?.ResultParameter
        ?.find((p: any) => p.Key === 'TransactionReceipt')?.Value

      if (loanId) {
        const supabase = await createServerSupabase()
        await supabase
          .from('loans')
          .update({ disbursement_ref: mpesaRef, disbursement_status: 'sent' })
          .eq('id', loanId)
      }

      console.log('B2C disbursement successful:', { loanId, amount, mpesaRef })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('B2C callback error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}