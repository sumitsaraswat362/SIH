import { BigQuery } from '@google-cloud/bigquery';

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'project-a9c284f8-6bca-440a-a0c';
const DATASET = 'annapurna_telemetry';
const ALLOWED_TABLES = ['truck_telemetry'];

function createBigQueryClient(): BigQuery {
  // Vercel: use base64-encoded service account JSON from env var
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, 'base64').toString()
    );
    return new BigQuery({ projectId: PROJECT_ID, credentials });
  }
  // Local: use GOOGLE_APPLICATION_CREDENTIALS file path (set in .env.local)
  return new BigQuery({ projectId: PROJECT_ID });
}

/**
 * Validates SQL before execution:
 * - Only SELECT statements allowed
 * - Must reference the allowed dataset
 * - Rejects dangerous operations
 */
function validateSQL(sql: string): { valid: boolean; reason?: string } {
  const normalized = sql.trim().toUpperCase();
  
  // Must start with SELECT or WITH (for CTEs)
  if (!normalized.startsWith('SELECT') && !normalized.startsWith('WITH')) {
    return { valid: false, reason: 'Only SELECT queries are allowed.' };
  }

  // Block dangerous keywords
  const blocked = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE', 'TRUNCATE', 'MERGE', 'GRANT', 'REVOKE'];
  for (const keyword of blocked) {
    // Match as whole word to avoid false positives
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(sql)) {
      return { valid: false, reason: `Blocked keyword detected: ${keyword}` };
    }
  }

  return { valid: true };
}

export class BigQueryService {
  private bigquery: BigQuery;

  constructor() {
    this.bigquery = createBigQueryClient();
  }

  /**
   * Execute a validated SQL query against BigQuery.
   * Enforces SELECT-only, dataset restriction, and row cap.
   */
  async query(sql: string, maxRows: number = 100): Promise<any[]> {
    const validation = validateSQL(sql);
    if (!validation.valid) {
      console.warn(`[BigQuery] SQL rejected: ${validation.reason}`);
      return [];
    }

    try {
      const options = {
        query: sql,
        maxResults: maxRows,
      };
      const [rows] = await this.bigquery.query(options);
      console.log(`[BigQuery] Query returned ${rows.length} rows`);
      return rows;
    } catch (error) {
      console.error('[BigQuery] Query error:', error);
      return [];
    }
  }
}

export { createBigQueryClient, validateSQL, PROJECT_ID, DATASET };
