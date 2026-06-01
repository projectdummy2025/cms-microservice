import { db } from '@/lib/db';
import { articleTypes, categoryTypes, categories as categoriesTable, employees, articles, tags, articleTag } from '@/lib/db/schema';
import { eq, asc, and, lte } from 'drizzle-orm';
import ArticleList from '@/components/ArticleList';
import FilterForm from '@/components/FilterForm';
import { LocaleJson } from '@/lib/utils';
import { listArticles } from '@/lib/queries';

interface PageProps {
  params: Promise<{ article_type: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function param(search: Record<string, string | string[] | undefined>, key: string): string | null {
  const val = search[key];
  if (!val) return null;
  return Array.isArray(val) ? val[0] : val;
}

export async function generateMetadata({ params }: PageProps) {
  const { article_type } = await params;
  const [rec] = await db.select().from(articleTypes)
    .where(eq(articleTypes.slug, article_type)).limit(1);
  return { title: rec?.name ?? 'Articles' };
}

export default async function ArticleTypePage({ params, searchParams }: PageProps) {
  const { article_type } = await params;
  const search = await searchParams;

  const [articleType] = await db.select().from(articleTypes)
    .where(eq(articleTypes.slug, article_type)).limit(1);
  if (!articleType) return <div className="p-8 text-red-600">Article type not found</div>;

  const [categoryType] = await db.select().from(categoryTypes)
    .where(eq(categoryTypes.slug, article_type)).limit(1);

  const now = new Date();
  const publishedBase = and(
    eq(articles.articleTypeId, articleType.id),
    eq(articles.isActive, true),
    lte(articles.publishedAt, now),
  );

  const [categoriesData, availableTags, availableAuthors, result] = await Promise.all([
    categoryType
      ? db.select().from(categoriesTable)
          .where(eq(categoriesTable.categoryTypeId, categoryType.id))
          .orderBy(asc(categoriesTable.sort), asc(categoriesTable.id))
      : Promise.resolve([]),

    db.selectDistinct({ id: tags.id, name: tags.name })
      .from(tags)
      .innerJoin(articleTag, eq(articleTag.tagId, tags.id))
      .innerJoin(articles, eq(articles.id, articleTag.articleId))
      .where(and(publishedBase, eq(tags.isActive, true))),

    db.selectDistinct({ id: employees.id, name: employees.name })
      .from(employees)
      .innerJoin(articles, eq(articles.authorId, employees.id))
      .where(publishedBase),

    listArticles({
      articleTypeId: articleType.id.toString(),
      categoryId: param(search, 'categoryId'),
      tagId: param(search, 'tagId'),
      authorId: param(search, 'authorId'),
      year: param(search, 'year'),
      search: param(search, 'search'),
      sortBy: param(search, 'sortBy'),
      sortDir: param(search, 'sortDir'),
      page: param(search, 'page') ? parseInt(param(search, 'page')!) : 1,
      limit: param(search, 'limit') ? parseInt(param(search, 'limit')!) : 20,
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{articleType.name}</h1>

      <FilterForm
        categories={categoriesData as Array<{ id: number; name: LocaleJson; parentId: number | null }>}
        tags={availableTags as Array<{ id: number; name: LocaleJson }>}
        authors={availableAuthors}
        currentFilters={search}
      />

      <ArticleList articles={result.data} meta={result.meta} articleType={article_type} />
    </div>
  );
}
