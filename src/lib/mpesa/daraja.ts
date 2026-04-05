import axios from 'axios'

const BASE = 'https://sandbox.safaricom.co.ke'

export async function getDarajaToken() {
  const auth = Buffer.from(
    (process.env.MPESA_CONSUMER_KEY ?? '') + ':' + (process.env.MPESA_CONSUMER_SECRET ?? '')
  ).toString('base64')

  const { data } = await axios.get(
    BASE + '/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: 'Basic ' + auth } }
  )
  return data.access_token
}

export async function stkPush({
  token,
  phone,
  amount,
  accountRef,
  description,
}: {
  token: string
  phone: string
  amount: number
  accountRef: string
  description: string
}) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14)

  const password = Buffer.from(
    (process.env.MPESA_SHORTCODE ?? '') +
    (process.env.MPESA_PASSKEY ?? '') +
    timestamp
  ).toString('base64')

  const { data } = await axios.post(
    BASE + '/mpesa/stkpush/v1/processrequest',
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE ?? '',
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE ?? '',
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL ?? '',
      AccountReference: accountRef,
      TransactionDesc: description,
    },
    { headers: { Authorization: 'Bearer ' + token } }
  )
  return data
}