'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { LocaleJson, pickLocale, slugify } from '@/lib/utils';

type ArticleTag = { id: number; name: unknown };

type Article = {
  id: number;
  image: string | null;
  title: unknown;
  summary: unknown;
  publishedAt: Date | string | null;
  hit: number | null;
  author: { id: number; name: string } | null;
  category: { id: number; name: unknown } | null;
  tags: ArticleTag[];
};

interface ArticleListProps {
  articles: Article[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  articleType: string;
}

type View = 'list' | 'grid';

export default function ArticleList({ articles, meta, articleType }: ArticleListProps) {
  const [view, setView] = useState<View>(() => {
    if (typeof window === 'undefined') return 'list';
    const saved = localStorage.getItem('articleView');
    return (saved === 'grid' || saved === 'list') ? saved : 'list';
  });

  const switchView = (v: View) => {
    setView(v);
    localStorage.setItem('articleView', v);
  };

  if (articles.length === 0) {
    return <div className="text-gray-500 py-12 text-center">Tidak ada artikel ditemukan.</div>;
  }

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => switchView('list')}
          className={`px-3 py-1 text-sm border rounded ${view === 'list' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}
          aria-label="Tampilan daftar"
        >
          ☰ Daftar
        </button>
        <button
          onClick={() => switchView('grid')}
          className={`px-3 py-1 text-sm border rounded ${view === 'grid' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}
          aria-label="Tampilan grid"
        >
          ⊞ Grid
        </button>
      </div>

      {view === 'list' ? (
        <ul className="divide-y">
          {articles.map(article => (
            <li key={article.id} className="py-6">
              <div className="flex gap-4">
                {article.image && (
                  <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image src={article.image} alt={pickLocale(article.title as LocaleJson)} fill className="object-cover" sizes="128px" unoptimized />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold mb-1">
                    <Link
                      href={`/${articleType}/${article.id}-${slugify(pickLocale(article.title as LocaleJson) || 'article')}`}
                      className="hover:underline"
                    >
                      {pickLocale(article.title as LocaleJson)}
                    </Link>
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                    {article.publishedAt && (
                      <span>{new Date(article.publishedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    )}
                    {article.category && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded">{pickLocale(article.category.name as LocaleJson)}</span>
                    )}
                    {article.author && <span>{article.author.name}</span>}
                    <span>{article.hit ?? 0} dibaca</span>
                  </div>
                  {pickLocale(article.summary as LocaleJson) && (
                    <p className="text-gray-600 text-sm line-clamp-2">{pickLocale(article.summary as LocaleJson)}</p>
                  )}
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {article.tags.map(tag => (
                        <span key={tag.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {pickLocale(tag.name as LocaleJson)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link
              key={article.id}
              href={`/${articleType}/${article.id}-${slugify(pickLocale(article.title as LocaleJson) || 'article')}`}
              className="group border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative w-full h-48 bg-gray-100">
                {article.image ? (
                  <Image src={article.image} alt={pickLocale(article.title as LocaleJson)} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">&#128240;</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                  {article.category && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{pickLocale(article.category.name as LocaleJson)}</span>
                  )}
                  {article.publishedAt && (
                    <span>{new Date(article.publishedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  )}
                </div>
                <h2 className="font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-blue-600">
                  {pickLocale(article.title as LocaleJson)}
                </h2>
                {pickLocale(article.summary as LocaleJson) && (
                  <p className="text-gray-500 text-sm line-clamp-2">{pickLocale(article.summary as LocaleJson)}</p>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{article.author?.name ?? ''}</span>
                  <span>{article.hit ?? 0} dibaca</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
            <a
              key={p}
              href={`?page=${p}`}
              className={`px-3 py-1 border rounded text-sm ${p === meta.page ? 'bg-gray-800 text-white' : 'bg-white hover:bg-gray-50'}`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
