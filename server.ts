import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

function buildFallbackGuideReply(category: string, userText: string, language: string): { reply: string; insight: string } {
  const lower = userText.toLowerCase();
  const isHe = language === 'he';

  if (isHe) {
    let reply =
      'תודה על השיתוף הסומטי. נסה/י להבחין באיזו נקודה המגע נע בין תת-תגובה מוחזקת (Under), עודף מתפזר (Over), לבין מרכז ה־Flow המווסת.';
    if (lower.includes('גבול') || lower.includes('לא') || lower.includes('דלת') || lower.includes('קילוף') || category.includes('אתיק') || category.includes('גבולות')) {
      reply =
        'סימון גבול בשני הנהרות (יד פתוחה / הרמת אמה / כף יד מושטת) לצד ידיעת "ידית הדלת" ופעימות "רגע / סליחה / שלום" הם שמזינים אמון מלא.';
    } else if (lower.includes('נפיל') || lower.includes('רצפה') || lower.includes('מומנטום') || lower.includes('משקל')) {
      reply =
        'במונחי מכניקה וטנסגריטי, העצמות מתגלגלות בקשת עם כוח המשיכה ועקרון Following Through מבלי להשליך משקל פתאומי.';
    } else if (lower.includes('נוזל') || lower.includes('עור') || lower.includes('קרום') || lower.includes('אמפתי')) {
      reply =
        'דימוי הגוף כ־90% מים והקרום המשתנה (Dimock) מאפשר לקיים אמפתיה קינסטטית חמה (Gallese/Damasio) מבלי להתמזג יתר על המידה.';
    } else if (lower.includes('ריקוד') || lower.includes('חיית') || lower.includes('לאבאן') || lower.includes('עץ')) {
      reply =
        'מהריקוד הקטן של פקסטון ועד דמוקרטיה של Power-With ("טבעות בעץ"), תנועה קשובה פותחת שאלה חיה ברקמות בלי כפייה.';
    }
    return {
      reply,
      insight: `תובנה חדשה: ${userText.slice(0, 64)}${userText.length > 64 ? '...' : ''}`,
    };
  }

  let reply =
    'Thank you for sharing. Notice gently where this experience lives between guarded Under-holding, scattered Over-effort, and quiet integrative Flow.';
  if (lower.includes('boundar') || lower.includes('no') || lower.includes('consent') || lower.includes('keluf') || lower.includes('door')) {
    reply =
      'Two Rivers hand cues, an always-open "door handle", and soft Keluf pacing ("Rega / Slicha / Shalom") nurture fearless trust.';
  } else if (lower.includes('fall') || lower.includes('floor') || lower.includes('weight') || lower.includes('momentum')) {
    reply =
      'In mechanics & tensegrity, bone arches carry mass smoothly with gravity and Following Through without sudden dumping.';
  } else if (lower.includes('fluid') || lower.includes('skin') || lower.includes('membrane') || lower.includes('empath')) {
    reply =
      'Perceiving 90% water mass and Dimock’s adjustable membrane nurtures warm kinesthetic empathy (Gallese/Damasio) without blurring self-boundaries.';
  } else if (lower.includes('small dance') || lower.includes('animal') || lower.includes('laban') || lower.includes('arendt')) {
    reply =
      'From Paxton’s Small Dance and Animal Intelligence to Arendt’s democratic Power-With, entering with a question in the tissues unlocks fresh flow.';
  }
  return {
    reply,
    insight: `New insight: ${userText.slice(0, 64)}${userText.length > 64 ? '...' : ''}`,
  };
}

function buildFallbackIngest(
  rawText: string,
  sourceTitle: string,
  targetKind: 'recommendation' | 'inquiry',
) {
  const cleaned = rawText.replace(/\r\n/g, '\n').trim();
  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  const firstHeading = (lines[0] || sourceTitle || 'Contact Improvisation Study Note')
    .replace(/^#+\s*/, '')
    .slice(0, 120);
  const bodySnippet = lines.slice(1).join(' ').slice(0, 600) || cleaned.slice(0, 600);
  const bullets = lines
    .filter((l) => /^[-*•\d.]/.test(l))
    .map((l) => l.replace(/^[-*•\d.]+\s*/, '').slice(0, 180))
    .slice(0, 4);

  if (targetKind === 'recommendation') {
    return {
      shortTitle: firstHeading,
      shortTitleEn: firstHeading,
      subtitleTag: sourceTitle || 'תרגול סומטי מיובא',
      subtitleTagEn: sourceTitle || 'Imported Somatic Practice',
      axisType: 'perception',
      summaryPreview: bodySnippet.slice(0, 140),
      fullExplanation: cleaned.slice(0, 2000),
      fullExplanationEn: cleaned.slice(0, 2000),
      practicalSteps: bullets.length > 0 ? bullets : [bodySnippet.slice(0, 180) || 'הקדישו 3 דקות להקשבה דרך נקודת המגע.'],
      practicalStepsEn: bullets.length > 0 ? bullets : [bodySnippet.slice(0, 180) || 'Spend 3 minutes listening through the point of contact.'],
      quoteText: firstHeading,
      quoteTextEn: firstHeading,
      quoteAuthor: sourceTitle || 'NotebookLM Study Source',
      quoteAuthorEn: sourceTitle || 'NotebookLM Study Source',
    };
  }

  return {
    title: firstHeading,
    titleEn: firstHeading,
    category: 'מחקר סומטי',
    categoryEn: 'Somatic Study',
    subtitle: sourceTitle || 'מקור מיובא מתוך NotebookLM / Docs',
    subtitleEn: sourceTitle || 'Imported from NotebookLM / Docs',
    relatedStudyQuestion: `מהו העיקרון התנועתי המרכזי העולה מתוך "${firstHeading}"?`,
    relatedStudyQuestionEn: `What core movement principle emerges from "${firstHeading}"?`,
    somaticPrinciple: bodySnippet.slice(0, 400) || firstHeading,
    somaticPrincipleEn: bodySnippet.slice(0, 400) || firstHeading,
    authorReference: sourceTitle || 'NotebookLM / Workshop Notes',
    summaryInsights: bullets.length > 0 ? bullets : [bodySnippet.slice(0, 200) || firstHeading],
    summaryInsightsEn: bullets.length > 0 ? bullets : [bodySnippet.slice(0, 200) || firstHeading],
    initialGuidePrompt: `נחקור יחד את "${firstHeading}". כיצד העיקרון הזה פגש את הגוף שלך בג׳אם האחרון?`,
    initialGuidePromptEn: `Let us explore "${firstHeading}" together. How did this principle show up in your body during your latest jam?`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // 1. Locality check endpoint (detects country headers from reverse proxy/CDN)
  app.get('/api/locality', (req: Request, res: Response) => {
    const headerCountry =
      (req.headers['x-appengine-country'] as string | undefined) ||
      (req.headers['cf-ipcountry'] as string | undefined) ||
      (req.headers['x-vercel-ip-country'] as string | undefined) ||
      (req.headers['x-country-code'] as string | undefined) ||
      '';
    const acceptLanguage = (req.headers['accept-language'] as string | undefined) || '';
    const normalizedCountry = headerCountry.trim().toUpperCase();
    const isHeaderIsrael =
      normalizedCountry === 'IL' ||
      /\b(he|iw)(-il)?\b/i.test(acceptLanguage);

    res.json({
      headerCountryCode: normalizedCountry || null,
      acceptLanguage,
      isHeaderIsrael,
    });
  });

  // 2. Server-side Gemini Somatic Guide endpoint
  app.post('/api/somatic-guide', async (req: Request, res: Response) => {
    const {
      inquiryTitle = '',
      category = '',
      somaticPrinciple = '',
      authorReference = '',
      language = 'en',
      history = [],
      message = '',
    } = req.body ?? {};

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    if (!ai) {
      const fb = buildFallbackGuideReply(category, message, language);
      res.json({ ...fb, source: 'fallback' });
      return;
    }

    try {
      const historySummary = Array.isArray(history)
        ? history
            .slice(-6)
            .map((m: { senderName?: string; text?: string }) => `${m.senderName || 'User'}: ${m.text || ''}`)
            .join('\n')
        : '';

      const systemInstruction = [
        'You are the EYE-on-CI Somatic Guide for Contact Improvisation dancers (v2.0 tri-polar Under ↔ Flow ↔ Over framework).',
        'Ground reflections in Contact Improvisation lineages: Steve Paxton & Daniel Lepkoff (Small Dance, Animal Intelligence, question in the tissues), Nancy Stark Smith (rolling contact, following through), BMC & Deane Juhan (90% fluid body mass, skin as outer brain), Dimock (Variable Membrane Theory), Dual-Brain EEG / Vittorio Gallese / Antonio Damasio (kinesthetic empathy & somatic markers), Tsachor & Shafir (LMA emotional resiliency), Martin Keogh (Two Rivers & 101 Ways to Say No), Robert Bly ("peeled people"), Zohar R. (Keluf / Orange Peeling: Rega, Slicha, Shalom), and Hannah Arendt (Power-With jam democracy & "rings in a tree").',
        `Respond strictly in language code "${language}" (if "he", write natural Hebrew; otherwise write in that language).`,
        'Keep the reply warm, grounded, non-prescriptive, and concise (2 to 4 sentences), ending with one gentle embodied reflection question.',
        'Also return a 1-sentence distilled somatic insight for the user’s study summary.',
      ].join(' ');

      const prompt = [
        `Topic: ${inquiryTitle}`,
        `Category: ${category}`,
        `Reference: ${authorReference}`,
        `Somatic Principle: ${somaticPrinciple}`,
        historySummary ? `Recent Dialogue:\n${historySummary}` : '',
        `Dancer's latest reflection: ${message}`,
      ]
        .filter(Boolean)
        .join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: 'Concise, grounded somatic guide response.' },
              insight: { type: Type.STRING, description: 'One concise distilled insight line.' },
            },
            required: ['reply', 'insight'],
          },
        },
      });

      const raw = (response.text ?? '').trim();
      const parsed = JSON.parse(raw) as { reply?: string; insight?: string };
      if (parsed.reply) {
        res.json({
          reply: parsed.reply,
          insight: parsed.insight || message.slice(0, 72),
          source: 'gemini',
        });
        return;
      }
      const fb = buildFallbackGuideReply(category, message, language);
      res.json({ ...fb, source: 'fallback' });
    } catch (err) {
      console.error('Gemini somatic-guide error, using fallback:', err);
      const fb = buildFallbackGuideReply(category, message, language);
      res.json({ ...fb, source: 'fallback' });
    }
  });

  // 3. Manager Studio AI Ingestion (NotebookLM text / Google Doc -> Structured Recommendation or Inquiry)
  app.post('/api/manager/ingest', async (req: Request, res: Response) => {
    const {
      rawText = '',
      sourceTitle = 'Imported Study Material',
      targetKind = 'recommendation',
    } = req.body ?? {};

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 10) {
      res.status(400).json({ error: 'Please provide at least 10 characters of text to structure.' });
      return;
    }

    const clippedText = rawText.slice(0, 24000);

    if (!ai) {
      res.json({
        structured: buildFallbackIngest(clippedText, sourceTitle, targetKind),
        source: 'fallback',
      });
      return;
    }

    try {
      const systemInstruction =
        'You are an expert Contact Improvisation curriculum editor helping managers convert NotebookLM study guides, workshop transcripts, or Google Docs notes into bilingual (Hebrew + English) structured somatic resources for EYE-on-CI. Return clean, faithful content derived strictly from the provided source text.';

      if (targetKind === 'recommendation') {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Source Title: ${sourceTitle}\n\nSource Text:\n${clippedText}`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                shortTitle: { type: Type.STRING, description: 'Concise Hebrew title' },
                shortTitleEn: { type: Type.STRING, description: 'Concise English title' },
                subtitleTag: { type: Type.STRING, description: 'Short Hebrew subtitle tag' },
                subtitleTagEn: { type: Type.STRING, description: 'Short English subtitle tag' },
                axisType: {
                  type: Type.STRING,
                  description:
                    'One of mechanics, perception, behavior, emotion, ethics',
                },
                summaryPreview: { type: Type.STRING, description: 'Short preview sentence' },
                fullExplanation: { type: Type.STRING, description: 'Hebrew full explanation' },
                fullExplanationEn: { type: Type.STRING, description: 'English full explanation' },
                practicalSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-4 Hebrew practice steps' },
                practicalStepsEn: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-4 English practice steps' },
                quoteText: { type: Type.STRING, description: 'Key quote in Hebrew' },
                quoteTextEn: { type: Type.STRING, description: 'Key quote in English' },
                quoteAuthor: { type: Type.STRING, description: 'Author or source name in Hebrew' },
                quoteAuthorEn: { type: Type.STRING, description: 'Author or source name in English' },
              },
              required: [
                'shortTitle',
                'shortTitleEn',
                'subtitleTag',
                'subtitleTagEn',
                'axisType',
                'summaryPreview',
                'fullExplanation',
                'fullExplanationEn',
                'practicalSteps',
                'practicalStepsEn',
                'quoteText',
                'quoteTextEn',
                'quoteAuthor',
                'quoteAuthorEn',
              ],
            },
          },
        });
        const parsed = JSON.parse((response.text ?? '{}').trim());
        res.json({ structured: parsed, source: 'gemini' });
        return;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Source Title: ${sourceTitle}\n\nSource Text:\n${clippedText}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Inquiry title in Hebrew' },
              titleEn: { type: Type.STRING, description: 'Inquiry title in English' },
              category: { type: Type.STRING, description: 'Category in Hebrew' },
              categoryEn: { type: Type.STRING, description: 'Category in English' },
              subtitle: { type: Type.STRING, description: 'Subtitle in Hebrew' },
              subtitleEn: { type: Type.STRING, description: 'Subtitle in English' },
              relatedStudyQuestion: { type: Type.STRING, description: 'Flashcard front question in Hebrew' },
              relatedStudyQuestionEn: { type: Type.STRING, description: 'Flashcard front question in English' },
              somaticPrinciple: { type: Type.STRING, description: 'Flashcard back somatic principle in Hebrew' },
              somaticPrincipleEn: { type: Type.STRING, description: 'Flashcard back somatic principle in English' },
              authorReference: { type: Type.STRING, description: 'Referenced teacher or source' },
              summaryInsights: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-4 Hebrew insights' },
              summaryInsightsEn: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-4 English insights' },
              initialGuidePrompt: { type: Type.STRING, description: 'Opening somatic guide question in Hebrew' },
              initialGuidePromptEn: { type: Type.STRING, description: 'Opening somatic guide question in English' },
            },
            required: [
              'title',
              'titleEn',
              'category',
              'categoryEn',
              'subtitle',
              'subtitleEn',
              'relatedStudyQuestion',
              'relatedStudyQuestionEn',
              'somaticPrinciple',
              'somaticPrincipleEn',
              'authorReference',
              'summaryInsights',
              'summaryInsightsEn',
              'initialGuidePrompt',
              'initialGuidePromptEn',
            ],
          },
        },
      });
      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ structured: parsed, source: 'gemini' });
    } catch (err) {
      console.error('Gemini manager/ingest error, using fallback:', err);
      res.json({
        structured: buildFallbackIngest(clippedText, sourceTitle, targetKind),
        source: 'fallback',
      });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EYE-on-CI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
