import { Table } from '../index.js'

interface ApiKey { id: string; label: string; created: string; lastUsed: string }

const apiKeys: ApiKey[] = [
  { id: 'key_live_a81f', label: 'Production', created: '12 Mar 2026', lastUsed: '2 minutes ago' },
  { id: 'key_test_33c0', label: 'Staging', created: '4 Jan 2026', lastUsed: 'Yesterday' },
  { id: 'key_test_9d2e', label: 'Local development', created: '19 Nov 2025', lastUsed: 'Never' },
]

/** captionVisible draws the caption above the header row; it names the table either way. */
export default function Demo() {
  return (
    <Table
      captionVisible
      caption="API keys"
      items={apiKeys}
      getKey={(apiKey) => apiKey.id}
      columns={[
        { key: 'label', header: 'Name', cell: (apiKey) => apiKey.label },
        { key: 'id', header: 'Key', cell: (apiKey) => apiKey.id },
        { key: 'created', header: 'Created', cell: (apiKey) => apiKey.created },
        { key: 'lastUsed', header: 'Last used', align: 'end', cell: (apiKey) => apiKey.lastUsed },
      ]}
    />
  )
}
