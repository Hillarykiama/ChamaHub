import { NextResponse } from 'next/server'
import { getDarajaToken } from '@/lib/mpesa/daraja'
import axios from 'axios'

const BASE = 'https://sandbox.safaricom.co.ke'

export async function POST(req: Request) {
  try {
    const { phone, amount, loanId, memberName } = await req.json()

    if (!phone || !amount || !loanId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const token = await getDarajaToken()

    const { data } = await axios.post(
      `${BASE}/mpesa/b2c/v3/paymentrequest`,
      {
        InitiatorName: process.env.MPESA_INITIATOR_NAME,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
        CommandID: 'BusinessPayment',
        Amount: amount,
        PartyA: process.env.MPESA_B2C_SHORTCODE,
        PartyB: phone,
        Remarks: `Loan disbursement - ${memberName}`,
        QueueTimeOutURL: process.env.MPESA_B2C_CALLBACK_URL,
        ResultURL: process.env.MPESA_B2C_CALLBACK_URL,
        Occasion: `LOAN-${loanId}`,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('B2C error:', error?.response?.data || error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}