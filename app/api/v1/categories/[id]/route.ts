import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories, categoryTypes } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // Fetch the category with its type
    const categoryRows = await db.select({
      category: categories,
      type: categoryTypes,
    })
      .from(categories)
      .leftJoin(categoryTypes, eq(categories.categoryTypeId, categoryTypes.id))
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (categoryRows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const categoryRow = categoryRows[0];

    // Fetch parent if exists
    const parent = categoryRow.category.parentId
      ? await db.select().from(categories).where(eq(categories.id, categoryRow.category.parentId)).limit(1)
      : null;

    // Fetch children
    const children = await db.select()
      .from(categories)
      .where(eq(categories.parentId, categoryId))
      .orderBy(asc(categories.sort), asc(categories.id));

    const result = {
      id: categoryRow.category.id,
      categoryTypeId: categoryRow.category.categoryTypeId,
      parentId: categoryRow.category.parentId,
      name: categoryRow.category.name,
      sort: categoryRow.category.sort,
      isRoot: categoryRow.category.isRoot,
      isActive: categoryRow.category.isActive,
      createdAt: categoryRow.category.createdAt,
      updatedAt: categoryRow.category.updatedAt,
      type: categoryRow.type ? {
        id: categoryRow.type.id,
        name: categoryRow.type.name,
        slug: categoryRow.type.slug,
      } : null,
      parent: parent?.[0] ? {
        id: parent[0].id,
        name: parent[0].name,
        categoryTypeId: parent[0].categoryTypeId,
      } : null,
      children: children.map(c => ({
        id: c.id,
        categoryTypeId: c.categoryTypeId,
        parentId: c.parentId,
        name: c.name,
        sort: c.sort,
        isRoot: c.isRoot,
        isActive: c.isActive,
      })),
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
