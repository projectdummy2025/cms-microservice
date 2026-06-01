import Image from 'next/image';
import { db } from '@/lib/db';
import { articleTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { LocaleJson, ImageRow, TagRow, pickLocale } from '@/lib/utils';
import { getArticleBySlug } from '@/lib/queries';

interface PageProps {
  params: Promise<{ article_type: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, false);
  if (!article) return { title: 'Article Not Found' };
  return { title: pickLocale(article.title as LocaleJson) || 'Article' };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { article_type, slug } = await params;

  const [article, [articleType]] = await Promise.all([
    getArticleBySlug(slug, true),
    db.select().from(articleTypes).where(eq(articleTypes.slug, article_type)).limit(1),
  ]);

  if (!article) return <div className="p-8 text-red-600">Article not found</div>;

  const title = pickLocale(article.title as LocaleJson);
  const summary = pickLocale(article.summary as LocaleJson);
  const content = (article.content as LocaleJson | null)?.en || (article.content as LocaleJson | null)?.id || '';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 text-sm text-gray-500">
        <a href={`/${article_type}`} className="hover:underline">{articleType?.name || article_type}</a>
        {article.category && (
          <>
            <span className="mx-2">/</span>
            <span>{pickLocale(article.category.name as LocaleJson)}</span>
          </>
        )}
      </div>

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {article.publishedAt && (
              <span>{new Date(article.publishedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            )}
            {article.author && <span>Oleh {article.author.name}</span>}
            <span>{article.hit ?? 0} kali dibaca</span>
          </div>
          {summary && <p className="mt-4 text-lg text-gray-700">{summary}</p>}
        </header>

        {article.image && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden">
            <Image src={article.image} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 896px" unoptimized />
          </div>
        )}

        {article.images && article.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(article.images as ImageRow[]).map((img) => (
              <div key={img.id} className="relative w-full h-40 rounded-lg overflow-hidden">
                <Image src={img.path} alt={pickLocale(img.description)} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" unoptimized />
              </div>
            ))}
          </div>
        )}

        {content && (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {(article.tags as TagRow[]).map((tag) => (
                <span key={tag.id} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {pickLocale(tag.name)}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
