import { db } from './db';
import { articles, employees, categories, articleTag, images, tags, articleTypes } from './db/schema';
import { eq, lte, desc, asc, inArray, sql, and, SQL, count, ilike } from 'drizzle-orm';

export type ListParams = {
  articleTypeId?: string | null;
  categoryId?: string | null;
  tagId?: string | null;
  authorId?: string | null;
  year?: string | null;
  search?: string | null;
  sortBy?: string | null;
  sortDir?: string | null;
  page?: number;
  limit?: number;
};

export type ArticleTypeInfo = {
  id: number;
  name: string;
  slug: string;
  articleCount: number;
};

export async function getArticleTypes(): Promise<ArticleTypeInfo[]> {
  const now = new Date();
  const baseCondition = and(
    eq(articles.isActive, true),
    lte(articles.publishedAt, now),
  );

  const types = await db.select({
    id: articleTypes.id,
    name: articleTypes.name,
    slug: articleTypes.slug,
  }).from(articleTypes).orderBy(articleTypes.name);

  const typeIds = types.map(t => t.id);

  const counts = await db
    .select({
      articleTypeId: articles.articleTypeId,
      count: count(),
    })
    .from(articles)
    .where(and(baseCondition, inArray(articles.articleTypeId, typeIds)))
    .groupBy(articles.articleTypeId);

  const countMap = new Map<number, number>();
  for (const c of counts) {
    countMap.set(c.articleTypeId, Number(c.count));
  }

  return types.map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    articleCount: countMap.get(t.id) ?? 0,
  }));
}

export async function listArticles(params: ListParams) {
  const now = new Date();
  const conditions: SQL[] = [
    eq(articles.isActive, true),
    lte(articles.publishedAt, now),
  ];

  if (params.articleTypeId) conditions.push(eq(articles.articleTypeId, parseInt(params.articleTypeId)));
  if (params.categoryId) conditions.push(eq(articles.categoryId, parseInt(params.categoryId)));
  if (params.authorId) conditions.push(eq(articles.authorId, parseInt(params.authorId)));
  if (params.year) conditions.push(eq(articles.year, parseInt(params.year)));
  if (params.search) conditions.push(ilike(sql`${articles.title}::text`, `%${params.search}%`));
  // Use subquery for tagId filter to avoid row duplication from JOIN
  if (params.tagId) {
    const sub = db.select({ id: articleTag.articleId }).from(articleTag)
      .where(eq(articleTag.tagId, parseInt(params.tagId)));
    conditions.push(inArray(articles.id, sub));
  }

  const where = and(...conditions);
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(articles)
    .where(where);

  const sortMap = {
    publishedAt: articles.publishedAt,
    title: articles.title,
    hit: articles.hit,
  } as const;
  const dir = params.sortDir === 'asc' ? asc : desc;
  const orderBy = sortMap[(params.sortBy ?? 'publishedAt') as keyof typeof sortMap] ?? articles.publishedAt;

  const rows = await db
    .select({ article: articles, author: employees, category: categories })
    .from(articles)
    .leftJoin(employees, eq(articles.authorId, employees.id))
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)
    .orderBy(dir(orderBy))
    .limit(limit)
    .offset(offset);

  const articleIds = rows.map(r => r.article.id);
  const tagRows = articleIds.length > 0
    ? await db
        .select({ articleId: articleTag.articleId, tagId: articleTag.tagId })
        .from(articleTag)
        .where(inArray(articleTag.articleId, articleIds))
    : [];

  const uniqueTagIds = [...new Set(tagRows.map(tr => tr.tagId))];
  const tagList = uniqueTagIds.length > 0
    ? await db.select().from(tags).where(inArray(tags.id, uniqueTagIds))
    : [];

  const tagsByArticle = new Map<number, typeof tagList>();
  for (const tr of tagRows) {
    if (!tagsByArticle.has(tr.articleId)) tagsByArticle.set(tr.articleId, []);
    const tag = tagList.find(t => t.id === tr.tagId);
    if (tag) tagsByArticle.get(tr.articleId)!.push(tag);
  }

  return {
    data: rows.map(row => ({
      ...row.article,
      author: row.author ?? null,
      category: row.category ?? null,
      tags: tagsByArticle.get(row.article.id) ?? [],
    })),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getArticle(id: number, incrementHit = false) {
  const now = new Date();
  const condition = and(
    eq(articles.id, id),
    eq(articles.isActive, true),
    lte(articles.publishedAt, now),
  );

  let articleRow: typeof articles.$inferSelect | undefined;
  if (incrementHit) {
    const updated = await db
      .update(articles)
      .set({ hit: sql`coalesce(${articles.hit}, 0) + 1` })
      .where(condition)
      .returning();
    articleRow = updated[0];
  } else {
    const rows = await db.select().from(articles).where(condition).limit(1);
    articleRow = rows[0];
  }

  if (!articleRow) return null;

  const [author] = await db.select().from(employees)
    .where(eq(employees.id, articleRow.authorId)).limit(1);

  const category = articleRow.categoryId
    ? (await db.select().from(categories).where(eq(categories.id, articleRow.categoryId)).limit(1))[0] ?? null
    : null;

  const tagRows = await db
    .select({ tagId: articleTag.tagId })
    .from(articleTag)
    .where(eq(articleTag.articleId, id));
  const tagIds = tagRows.map(tr => tr.tagId);
  const tagList = tagIds.length > 0
    ? await db.select().from(tags).where(inArray(tags.id, tagIds))
    : [];

  const imageRows = await db.select().from(images)
    .where(eq(images.articleId, id))
    .orderBy(images.sort);

  return { ...articleRow, author: author ?? null, category, tags: tagList, images: imageRows };
}

export async function getArticleBySlug(slug: string, incrementHit = false) {
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  if (!/^\d+$/.test(lastPart)) return null;
  return getArticle(parseInt(lastPart, 10), incrementHit);
}
