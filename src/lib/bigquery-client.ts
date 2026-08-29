import { BigQuery } from '@google-cloud/bigquery';

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'project-a9c284f8-6bca-440a-a0c';

function createClient(): BigQuery {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, 'base64').toString()
    );
    return new BigQuery({ projectId: PROJECT_ID, credentials });
  }
  return new BigQuery({ projectId: PROJECT_ID });
}

let _bigqueryInstance: BigQuery | null = null;
export const bigquery = new Proxy({} as BigQuery, {
  get(target, prop) {
    if (!_bigqueryInstance) {
      _bigqueryInstance = createClient();
    }
    const val = (_bigqueryInstance as any)[prop];
    return typeof val === 'function' ? val.bind(_bigqueryInstance) : val;
  }
});

export interface ForecastDataPoint {
  date: string;
  predicted_spoilage_risk: number;
  anomaly: boolean;
}

/**
 * Attempts to query a real BigQuery ML ARIMA_PLUS forecast model.
 * Falls back to querying raw telemetry data for risk aggregation.
 * Final fallback: deterministic sine-wave pattern.
 */
export async function getARIMAForecast(): Promise<ForecastDataPoint[]> {
  // Strategy 1: Try real BigQuery ML forecast
  try {
    const forecastSQL = `
      SELECT
        forecast_timestamp AS date,
        forecast_value AS predicted_risk,
        prediction_interval_lower_bound AS lower_bound,
        prediction_interval_upper_bound AS upper_bound
      FROM ML.FORECAST(MODEL \`${PROJECT_ID}.annapurna_telemetry.spoilage_forecast_model\`, STRUCT(14 AS horizon))
      ORDER BY forecast_timestamp
    `;
    const [rows] = await bigquery.query({ query: forecastSQL });
    
    if (rows && rows.length > 0) {
      console.log('[BigQuery ML] ARIMA forecast returned', rows.length, 'rows');
      return rows.map((row: any) => {
        // Handle BigQueryTimestamp { value: '...' } objects
        let dateStr: string;
        if (row.date && typeof row.date === 'object' && 'value' in row.date) {
          dateStr = String(row.date.value).split('T')[0];
        } else if (row.date instanceof Date) {
          dateStr = row.date.toISOString().split('T')[0];
        } else {
          dateStr = String(row.date).split('T')[0];
        }

        const risk = typeof row.predicted_risk === 'number' ? row.predicted_risk : parseFloat(String(row.predicted_risk)) || 15;
        const lower = typeof row.lower_bound === 'number' ? row.lower_bound : parseFloat(String(row.lower_bound)) || 0;
        const upper = typeof row.upper_bound === 'number' ? row.upper_bound : parseFloat(String(row.upper_bound)) || 0;

        return {
          date: dateStr,
          predicted_spoilage_risk: Math.min(100, Math.max(0, parseFloat(risk.toFixed(2)))),
          anomaly: (upper - lower) > 5,
        };
      });
    }
  } catch (e) {
    console.warn('[BigQuery ML] ARIMA model not available, trying raw aggregation:', (e as Error).message);
  }

  // Strategy 2: Query raw telemetry for actual risk data
  try {
    const rawSQL = `
      SELECT
        DATE(timestamp) as date,
        AVG(temperature_celsius) as avg_temp,
        COUNT(CASE WHEN status = 'Spoiled' THEN 1 END) as spoiled_count,
        COUNT(*) as total_count
      FROM \`${PROJECT_ID}.annapurna_telemetry.truck_telemetry\`
      GROUP BY date
      ORDER BY date
      LIMIT 14
    `;
    const [rows] = await bigquery.query({ query: rawSQL });

    if (rows && rows.length > 0) {
      console.log('[BigQuery] Raw telemetry aggregation returned', rows.length, 'rows');
      return rows.map((row: any) => {
        const avgTemp = typeof row.avg_temp === 'number' ? row.avg_temp : parseFloat(row.avg_temp);
        const spoiledCount = parseInt(String(row.spoiled_count), 10);
        const totalCount = parseInt(String(row.total_count), 10);
        const spoilageRate = totalCount > 0 ? (spoiledCount / totalCount) * 100 : 0;
        // Combine temperature anomaly and spoilage rate into a risk score
        const riskScore = Math.min(100, avgTemp * 2 + spoilageRate * 3);

        return {
          date: typeof row.date === 'object' && row.date !== null && 'value' in row.date
            ? String(row.date.value) : String(row.date),
          predicted_spoilage_risk: parseFloat(riskScore.toFixed(2)),
          anomaly: spoiledCount > 0,
        };
      });
    }
  } catch (e) {
    console.warn('[BigQuery] Raw aggregation failed:', (e as Error).message);
  }

  // Strategy 3: Deterministic fallback (no randomness)
  console.log('[Fallback] Using deterministic sine-wave forecast');
  const data: ForecastDataPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 14; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);

    const dayOfYear = Math.floor((nextDate.getTime() - new Date(nextDate.getFullYear(), 0, 0).getTime()) / 86400000);
    const wave = Math.sin(dayOfYear * 0.3) * 8;
    const trend = i * 0.7;
    const risk = 15 + wave + trend;
    const isAnomaly = i === 9 || i === 10;

    data.push({
      date: nextDate.toISOString().split('T')[0],
      predicted_spoilage_risk: Math.max(0, parseFloat(risk.toFixed(2)) + (isAnomaly ? 25 : 0)),
      anomaly: isAnomaly,
    });
  }
  return data;
}
