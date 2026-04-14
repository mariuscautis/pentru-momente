const WISE_API_BASE = 'https://api.transferwise.com'
const WISE_API_KEY = process.env.WISE_API_KEY!
const WISE_PROFILE_ID = process.env.WISE_PROFILE_ID!

interface WiseQuote {
  id: string
  targetAmount: number
}

interface WiseRecipient {
  id: number
}

interface WiseTransfer {
  id: number
  status: string
}

async function wiseRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${WISE_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${WISE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Wise API error ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

async function createQuote(targetAmountRon: number): Promise<WiseQuote> {
  return wiseRequest<WiseQuote>('/v3/profiles/' + WISE_PROFILE_ID + '/quotes', {
    method: 'POST',
    body: JSON.stringify({
      sourceCurrency: 'RON',
      targetCurrency: 'RON',
      targetAmount: targetAmountRon,
      payOut: 'BANK_TRANSFER',
    }),
  })
}

async function createRecipient(iban: string, name: string): Promise<WiseRecipient> {
  return wiseRequest<WiseRecipient>('/v1/accounts', {
    method: 'POST',
    body: JSON.stringify({
      currency: 'RON',
      type: 'iban',
      profile: Number(WISE_PROFILE_ID),
      accountHolderName: name,
      legalType: 'PRIVATE',
      details: { iban },
    }),
  })
}

async function createTransfer(
  quoteId: string,
  recipientId: number,
  reference: string
): Promise<WiseTransfer> {
  const uniqueTransactionId = `pentrumomente-${Date.now()}-${Math.random().toString(36).slice(2)}`

  return wiseRequest<WiseTransfer>('/v1/transfers', {
    method: 'POST',
    body: JSON.stringify({
      targetAccount: recipientId,
      quoteUuid: quoteId,
      customerTransactionId: uniqueTransactionId,
      details: { reference },
    }),
  })
}

async function fundTransfer(transferId: number): Promise<void> {
  await wiseRequest(`/v3/profiles/${WISE_PROFILE_ID}/transfers/${transferId}/payments`, {
    method: 'POST',
    body: JSON.stringify({ type: 'BALANCE' }),
  })
}

export interface InitiatePayoutInput {
  amountRon: number
  organiserIban: string
  organiserName: string
  reference: string // e.g. "Plata eveniment slug-ul"
}

export interface InitiatePayoutResult {
  wiseTransferId: string
}

export async function initiatePayout(
  input: InitiatePayoutInput
): Promise<InitiatePayoutResult> {
  const quote = await createQuote(input.amountRon)
  const recipient = await createRecipient(input.organiserIban, input.organiserName)
  const transfer = await createTransfer(quote.id, recipient.id, input.reference)
  await fundTransfer(transfer.id)

  return { wiseTransferId: String(transfer.id) }
}
