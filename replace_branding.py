import os

base_dir = "/Users/sumitsaraswat/Annapurna-Gemini-APAC/src/components/landing"

def process_file(filename, replacements):
    path = os.path.join(base_dir, filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

replacements_bento = [
    ("{/* Box 5: Gemini 2.5 Flash */}", "{/* Box 5: Annapurna Neural Engine */}"),
    (">Vertex AI</span>", ">Neural Engine</span>"),
    (">Gemini 2.5 Flash</h3>", ">Annapurna Neural Engine</h3>"),
    ("Google's fastest model", "our fastest AI model"),
    (">Gemini + RAG</span>", ">AI + RAG</span>"),
    ("Gemini Vision", "Annapurna Vision AI"),
    (">Google BigQuery</span>", ">Data Analytics</span>"),
    (">BigQuery Analytics</h3>", ">Data Analytics</h3>"),
    ("Gemini agents", "AI agents"),
    ("{/* Box 11: Google Cloud Stack */}", "{/* Box 11: Cloud Stack */}"),
    ('aria-label="Google Cloud Stack"', 'aria-label="Cloud Stack"'),
    (">Google Cloud</span>", ">Cloud Native</span>"),
    ("Cloud Stack Explorer", "Cloud Architecture"),
    ("Explore how Vertex AI, Cloud Run, BigQuery, and Firestore power the Annapurna platform end-to-end.", "Explore how our cloud infrastructure powers the Annapurna platform end-to-end.")
]

replacements_arch = [
    ("100% Google Cloud Native", "100% Cloud Native"),
    ("Google Cloud's cutting-edge AI and data processing", "cutting-edge AI and data processing"),
    ('title: "Vertex AI Agents"', 'title: "AI Agents"'),
    ("Gemini 2.5 Flash", "Annapurna Neural Engine"),
    ('title: "BigQuery ML"', 'title: "ML Forecasting"'),
    ('title: "Cloud Run & Firestore"', 'title: "Cloud Infrastructure"')
]

replacements_features = [
    ('title: "Gemini 2.5 Flash"', 'title: "Annapurna Neural Engine"'),
    ('badge: "Vertex AI"', 'badge: "Neural Engine"'),
    ('badge: "Gemini Tools"', 'badge: "AI Tools"'),
    ('badge: "Gemini Multi-Modal"', 'badge: "Multi-Modal AI"'),
    ('badge: "Google Cloud"', 'badge: "Cloud Native"'),
    ('badge: "Google Cloud AI"', 'badge: "Annapurna AI"'),
    ('title: "Google Workspace API"', 'title: "Workspace API"'),
    ("Powered by Google Cloud", "Powered by Annapurna AI")
]

replacements_hero = [
    ("Firestore real-time sync", "real-time database sync")
]

replacements_showcase = [
    ("Firestore real-time sync", "real-time database sync")
]

process_file("BentoGrid.tsx", replacements_bento)
process_file("CloudArchitectureSection.tsx", replacements_arch)
process_file("FeaturesPage.tsx", replacements_features)
process_file("Hero.tsx", replacements_hero)
process_file("FeatureShowcase.tsx", replacements_showcase)

print("Done")
