import { NextRequest, NextResponse } from 'next/server';
import { listArticles } from '@/lib/queries';

export async function GET(request: NextRequest) {
  try {
    const s = request.nextUrl.searchParams;
    const result = await listArticles({
      articleTypeId: s.get('articleTypeId'),
      categoryId: s.get('categoryId'),
      tagId: s.get('tagId'),
      authorId: s.get('authorId'),
      year: s.get('year'),
      search: s.get('search'),
      sortBy: s.get('sortBy'),
      sortDir: s.get('sortDir'),
      page: s.get('page') ? parseInt(s.get('page')!) : undefined,
      limit: s.get('limit') ? parseInt(s.get('limit')!) : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
