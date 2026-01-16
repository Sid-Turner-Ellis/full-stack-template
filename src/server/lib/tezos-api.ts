const TEZOS_GRAPHQL_URL = "https://data.objkt.com/v3/graphql"

export type TezosEvent = {
  id: string
  event_type: string | null
  marketplace_event_type: string | null
  price_xtz: number | null
  timestamp: string
  ophash: string
  amount: number | null
  token_pk: string | null
  creator_address: string | null
  recipient_address: string | null
}

type TezosEventsResponse = {
  data?: {
    event?: TezosEvent[]
  }
  errors?: { message: string }[]
}

const EVENTS_QUERY = `
  query EventsByWallet($address: String!, $limit: Int!, $offset: Int!) {
    event(
      where: {
        _or: [
          { creator_address: { _eq: $address } }
          { recipient_address: { _eq: $address } }
        ]
      }
      order_by: { timestamp: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      event_type
      marketplace_event_type
      price_xtz
      timestamp
      ophash
      amount
      token_pk
      creator_address
      recipient_address
    }
  }
`

const DEFAULT_PAGE_SIZE = 500
const MAX_EVENTS = 2000

const fetchEventsPage = async ({
  address,
  limit,
  offset,
}: {
  address: string
  limit: number
  offset: number
}) => {
  const response = await fetch(TEZOS_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: EVENTS_QUERY,
      variables: { address, limit, offset },
    }),
  })

  if (!response.ok) {
    throw new Error(`Tezos API error: ${response.status}`)
  }

  const payload = (await response.json()) as TezosEventsResponse

  if (payload.errors?.length) {
    throw new Error(
      payload.errors.map((error) => error.message).join("; "),
    )
  }

  return payload.data?.event ?? []
}

const fetchEventsForWallet = async (address: string) => {
  const events: TezosEvent[] = []
  let offset = 0
  let hasMore = true

  while (hasMore && events.length < MAX_EVENTS) {
    const remaining = MAX_EVENTS - events.length
    const limit = Math.min(DEFAULT_PAGE_SIZE, remaining)
    const page = await fetchEventsPage({ address, limit, offset })

    events.push(...page)
    offset += limit
    hasMore = page.length === limit
  }

  return events
}

export const tezosApiService = {
  fetchEventsForWallet,
}
