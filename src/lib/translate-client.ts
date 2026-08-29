import { v2 } from '@google-cloud/translate';
const { Translate } = v2;

const translate = new Translate({
  projectId: 'project-a9c284f8-6bca-440a-a0c',
});

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  const supportedLanguages = ['hi', 'mr', 'ta', 'te', 'en'];
  if (!supportedLanguages.includes(targetLanguage)) {
    return text;
  }

  try {
    const [translation] = await translate.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error('Error translating text:', error);
    return text;
  }
}
