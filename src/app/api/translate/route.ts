import { NextResponse } from 'next/server';
import { Translate } from '@google-cloud/translate/build/src/v2';

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: 'Missing text or targetLanguage' }, { status: 400 });
    }

    const translate = new Translate({ projectId: 'project-a9c284f8-6bca-440a-a0c' });
    
    // Map full language names to language codes
    const languageMap: Record<string, string> = {
      'Hindi': 'hi',
      'Japanese': 'ja',
      'Indonesian': 'id',
      'English': 'en'
    };
    
    const targetCode = languageMap[targetLanguage] || 'en';

    if (targetCode === 'en') {
      return NextResponse.json({ translatedText: text });
    }

    const [translations] = await translate.translate(text, targetCode);
    const translatedText = Array.isArray(translations) ? translations[0] : translations;

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
