// Firestore REST API utility - bypasses WebSocket connections

const PROJECT_ID = 'fantacalcio-rigori'
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

interface FirestoreValue {
  stringValue?: string
  integerValue?: string
  doubleValue?: number
  booleanValue?: boolean
  mapValue?: { fields: Record<string, FirestoreValue> }
  arrayValue?: { values: FirestoreValue[] }
  nullValue?: null
  referenceValue?: string
}

interface FirestoreDocument {
  name: string
  fields: Record<string, FirestoreValue>
  createTime: string
  updateTime: string
}

// Convert Firestore REST format to plain JavaScript object
function parseFirestoreValue(value: FirestoreValue): any {
  if (value.stringValue !== undefined) return value.stringValue
  if (value.integerValue !== undefined) return parseInt(value.integerValue)
  if (value.doubleValue !== undefined) return value.doubleValue
  if (value.booleanValue !== undefined) return value.booleanValue
  if (value.nullValue !== undefined) return null
  if (value.referenceValue !== undefined) return value.referenceValue
  if (value.mapValue) {
    const result: Record<string, any> = {}
    for (const [key, val] of Object.entries(value.mapValue.fields)) {
      result[key] = parseFirestoreValue(val)
    }
    return result
  }
  if (value.arrayValue) {
    return (value.arrayValue.values || []).map(parseFirestoreValue)
  }
  return null
}

function parseFirestoreDocument(doc: FirestoreDocument): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(doc.fields || {})) {
    result[key] = parseFirestoreValue(value)
  }
  return result
}

// Extract document ID from full path
function getDocumentId(fullPath: string): string {
  const parts = fullPath.split('/')
  return parts[parts.length - 1] ?? ''
}

// Get a single document
export async function getDocRest(collection: string, docId: string): Promise<{ id: string, data: Record<string, any> } | null> {
  try {
    const response = await fetch(`${BASE_URL}/${collection}/${docId}`)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`HTTP ${response.status}`)
    }
    const doc: FirestoreDocument = await response.json()
    return {
      id: getDocumentId(doc.name),
      data: parseFirestoreDocument(doc)
    }
  } catch (error) {
    // Network errors or JSON parsing errors
    // Note: 404s are handled above and return null before reaching this catch
    console.error(`Error fetching ${collection}/${docId}:`, error)
    return null
  }
}

// Get all documents in a collection
export async function getCollectionRest(collection: string): Promise<Array<{ id: string, data: Record<string, any> }>> {
  try {
    const response = await fetch(`${BASE_URL}/${collection}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const result = await response.json()
    
    return (result.documents || []).map((doc: FirestoreDocument) => ({
      id: getDocumentId(doc.name),
      data: parseFirestoreDocument(doc)
    }))
  } catch (error) {
    console.error(`Error fetching collection ${collection}:`, error)
    return []
  }
}

// Get multiple documents by IDs (batched fetch)
export async function getDocsRest(collection: string, docIds: string[]): Promise<Array<{ id: string, data: Record<string, any> }>> {
  // Fetch all in parallel
  const promises = docIds.map(id => getDocRest(collection, id))
  const results = await Promise.all(promises)
  return results.filter((doc): doc is { id: string, data: Record<string, any> } => doc !== null)
}

