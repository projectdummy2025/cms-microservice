import { NextRequest, NextResponse } from 'next/server';
import { getArticle } from '@/lib/queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id, 10);
    if (isNaN(articleId)) {
      return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
    }

    const article = await getArticle(articleId, true);
    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
