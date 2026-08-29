/**
 * BigQuery ML ARIMA_PLUS Model Training Script
 * 
 * Run with: npx ts-node scripts/train_bqml.ts
 * 
 * Creates an ARIMA_PLUS forecasting model trained on the telemetry data.
 * This typically takes 2-5 minutes in BigQuery.
 */

import { BigQuery } from '@google-cloud/bigquery';

const PROJECT_ID = 'project-a9c284f8-6bca-440a-a0c';
const DATASET_ID = 'annapurna_telemetry';

const bigquery = new BigQuery({ projectId: PROJECT_ID });

async function main() {
  console.log('🏔️  Annapurna BigQuery ML Training Script');
  console.log('==========================================\n');

  // Create the ARIMA_PLUS model
  const modelSQL = `
    CREATE OR REPLACE MODEL \`${PROJECT_ID}.${DATASET_ID}.spoilage_forecast_model\`
    OPTIONS(
      model_type = 'ARIMA_PLUS',
      time_series_timestamp_col = 'date',
      time_series_data_col = 'avg_risk',
      auto_arima = TRUE,
      data_frequency = 'DAILY'
    ) AS
    SELECT
      DATE(timestamp) AS date,
      AVG(
        CASE 
          WHEN status = 'Spoiled' THEN temperature_celsius * 3
          WHEN temperature_celsius > 15 THEN temperature_celsius * 2
          ELSE temperature_celsius
        END
      ) AS avg_risk
    FROM \`${PROJECT_ID}.${DATASET_ID}.truck_telemetry\`
    GROUP BY date
    ORDER BY date
  `;

  console.log('📊 Creating ARIMA_PLUS forecasting model...');
  console.log('   This may take 2-5 minutes.\n');

  try {
    const [job] = await bigquery.createQueryJob({ query: modelSQL });
    console.log(`   Job ID: ${job.id}`);
    console.log('   Waiting for training to complete...');

    const [rows] = await job.getQueryResults({ timeoutMs: 300000 }); // 5 min timeout
    console.log('\n✅ Model training complete!');

    // Test the forecast
    console.log('\n🔮 Testing forecast...');
    const forecastSQL = `
      SELECT
        forecast_timestamp,
        forecast_value,
        prediction_interval_lower_bound,
        prediction_interval_upper_bound
      FROM ML.FORECAST(MODEL \`${PROJECT_ID}.${DATASET_ID}.spoilage_forecast_model\`, STRUCT(7 AS horizon))
      ORDER BY forecast_timestamp
    `;

    const [forecastRows] = await bigquery.query({ query: forecastSQL });
    console.log(`\n📈 7-day forecast (${forecastRows.length} predictions):`);
    console.table(forecastRows.map((r: any) => ({
      date: r.forecast_timestamp,
      risk: parseFloat(r.forecast_value).toFixed(2),
      lower: parseFloat(r.prediction_interval_lower_bound).toFixed(2),
      upper: parseFloat(r.prediction_interval_upper_bound).toFixed(2),
    })));

  } catch (e: any) {
    console.error('❌ Training error:', e.message);
  }

  console.log('\n🎉 BQML setup complete!');
}

main().catch(console.error);
