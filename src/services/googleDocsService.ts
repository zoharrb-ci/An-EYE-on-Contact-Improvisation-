import { GoogleDocFileSummary } from '../types/contactWays';

export async function listGoogleDocs(accessToken: string, searchQuery = ''): Promise<GoogleDocFileSummary[]> {
  const safeQuery = searchQuery.trim().replace(/'/g, "\\'");
  const qParts = [
    "mimeType='application/vnd.google-apps.document'",
    'trashed=false',
  ];
  if (safeQuery) {
    qParts.push(`name contains '${safeQuery}'`);
  }

  const params = new URLSearchParams({
    q: qParts.join(' and '),
    fields: 'files(id,name,modifiedTime)',
    orderBy: 'modifiedTime desc',
    pageSize: '25',
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Drive error (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { files?: GoogleDocFileSummary[] };
  return json.files ?? [];
}

function extractParagraphText(element: unknown): string {
  if (!element || typeof element !== 'object') return '';
  const el = element as Record<string, unknown>;

  if (el.paragraph && typeof el.paragraph === 'object') {
    const para = el.paragraph as { elements?: Array<{ textRun?: { content?: string } }> };
    return (para.elements ?? [])
      .map((item) => item.textRun?.content ?? '')
      .join('');
  }

  if (el.table && typeof el.table === 'object') {
    const table = el.table as {
      tableRows?: Array<{
        tableCells?: Array<{ content?: unknown[] }>;
      }>;
    };
    return (table.tableRows ?? [])
      .map((row) =>
        (row.tableCells ?? [])
          .map((cell) => (cell.content ?? []).map(extractParagraphText).join(''))
          .join(' | '),
      )
      .join('\n');
  }

  return '';
}

export async function readGoogleDocContent(
  accessToken: string,
  documentId: string,
): Promise<{ title: string; text: string }> {
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Docs error (${res.status}): ${text}`);
  }

  const doc = (await res.json()) as {
    title?: string;
    body?: { content?: unknown[] };
  };

  const rawText = (doc.body?.content ?? []).map(extractParagraphText).join('');
  return {
    title: doc.title || 'Google Doc',
    text: rawText.trim(),
  };
}
