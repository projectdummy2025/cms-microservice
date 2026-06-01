import { NextRequest, NextResponse } from 'next/server';
import { getArticleBySlug } from '@/lib/queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await getArticleBySlug(slug, true);
    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
