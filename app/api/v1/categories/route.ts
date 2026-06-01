import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories, categoryTypes } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get active categories with their types
    const rows = await db.select({
      category: categories,
      type: categoryTypes,
    })
      .from(categories)
      .leftJoin(categoryTypes, eq(categories.categoryTypeId, categoryTypes.id))
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sort), asc(categories.id));

    const result = rows.map(row => ({
      id: row.category.id,
      categoryTypeId: row.category.categoryTypeId,
      parentId: row.category.parentId,
      name: row.category.name,
      sort: row.category.sort,
      isRoot: row.category.isRoot,
      isActive: row.category.isActive,
      type: row.type ? {
        id: row.type.id,
        name: row.type.name,
        slug: row.type.slug,
      } : null,
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
