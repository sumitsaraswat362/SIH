import sys

def replace_in_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

# File 1
replace_in_file('/Users/sumitsaraswat/Annapurna-Gemini-APAC/src/app/architecture/page.tsx', [
    ('Google Cloud IoT Core', 'IoT Core'),
    ("id: 'vertexai'", "id: 'neuralengine'"),
    ('id: "vertexai"', 'id: "neuralengine"'),
    ('Gemini 2.5 Flash', 'Annapurna Neural Engine'),
    ('Vertex AI • Generative AI', 'Neural Engine • Generative AI'),
    ("title: 'BigQuery'", "title: 'Data Analytics'"),
    ('title: "BigQuery"', 'title: "Data Analytics"'),
    ('BigQuery ML runs ARIMA forecasts', 'ML engine runs ARIMA forecasts'),
    ("title: 'Cloud Firestore'", "title: 'Real-Time Database'"),
    ('title: "Cloud Firestore"', 'title: "Real-Time Database"'),
    ('Google Cloud AI', 'Annapurna AI'),
    ('Google Cloud Conversational AI', 'Conversational AI'),
    ('Google Workspace', 'Workspace Integration'),
    ('Google Docs', 'documents'),
    ('Google Sheets', 'spreadsheets'),
    ('Powered by Google Cloud Platform', 'Powered by Annapurna AI'),
    ('Explore the Google Cloud services powering', 'Explore the cloud services powering'),
    ('Google Services', 'Cloud Services'),
    ('Google Cloud Native', 'Cloud Native'),
])

# File 2
replace_in_file('/Users/sumitsaraswat/Annapurna-Gemini-APAC/src/app/fleet/page.tsx', [
    ('BigQuery Sync Failed', 'Data Sync Failed'),
    ('Failed to stream to BigQuery', 'Failed to stream to data warehouse'),
    ('BigQuery Sync', 'Data Sync'),
    ("message: 'Streaming data to BigQuery...'", "message: 'Streaming data to data warehouse...'"),
    ('message: "Streaming data to BigQuery..."', 'message: "Streaming data to data warehouse..."'),
    ('Powered by Gemini LLM', 'Powered by Neural Engine'),
    ('Google Maps API Key', 'Maps API Key'),
    ('Gemini AI Project ID', 'AI Project ID'),
])

# File 3
replace_in_file('/Users/sumitsaraswat/Annapurna-Gemini-APAC/src/app/analytics/page.tsx', [
    ('BigQuery Conversational Agent', 'Conversational Analytics Agent'),
    ('Gemini will generate SQL and query BigQuery directly', 'The AI will generate SQL and query the data warehouse directly'),
    ('Ask BigQuery', 'Ask Analytics'),
    ('Generated BigQuery SQL (Google Standard SQL)', 'Generated SQL (Standard SQL)'),
    ('BigQuery Agent Standby', 'Analytics Agent Standby'),
    ('Ask a question to generate a BigQuery SQL report', 'Ask a question to generate an analytics report'),
    ('BigQuery ML: Predictive Forecasting', 'ML: Predictive Forecasting'),
    ('Google Cloud BigQuery ML', 'our ML forecasting engine'),
    ('Executing BigQuery Job...', 'Executing Analytics Query...'),
])

print("Replacements complete.")
