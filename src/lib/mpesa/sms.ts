import AfricasTalking from 'africastalking'

const at = AfricasTalking({
  apiKey: process.env.AT_API_KEY!,
  username: process.env.AT_USERNAME!,
})

export async function sendSMS(to: string[], message: string) {
  return at.SMS.send({
    to,
    message,
    from: process.env.AT_SENDER_ID,
  })
}
