'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { LocaleJson, pickLocale } from '@/lib/utils';

interface FilterFormProps {
  categories: Array<{ id: number; name: LocaleJson; parentId: number | null }>;
  tags: Array<{ id: number; name: LocaleJson }>;
  authors: Array<{ id: number; name: string }>;
  currentFilters: Record<string, string | string[] | undefined>;
}

export default function FilterForm({ categories, tags, authors, currentFilters }: FilterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const getValue = (key: string) => {
    const val = currentFilters[key];
    if (Array.isArray(val)) return val[0];
    return val || '';
  };

  return (
    <form className="bg-gray-50 p-4 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
      <div>
        <label className="block text-sm font-medium mb-1">Kategori</label>
        <select
          value={getValue('categoryId')}
          onChange={(e) => updateFilter('categoryId', e.target.value)}
          className="w-full border rounded px-3 py-2 bg-white text-sm"
        >
          <option value="">Semua</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{pickLocale(cat.name)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tag</label>
        <select
          value={getValue('tagId')}
          onChange={(e) => updateFilter('tagId', e.target.value)}
          className="w-full border rounded px-3 py-2 bg-white text-sm"
        >
          <option value="">Semua</option>
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>{pickLocale(tag.name)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Penulis</label>
        <select
          value={getValue('authorId')}
          onChange={(e) => updateFilter('authorId', e.target.value)}
          className="w-full border rounded px-3 py-2 bg-white text-sm"
        >
          <option value="">Semua</option>
          {authors.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tahun</label>
        <input
          type="number"
          value={getValue('year')}
          onChange={(e) => updateFilter('year', e.target.value)}
          placeholder="e.g. 2024"
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cari</label>
        <input
          type="text"
          value={getValue('search')}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Judul..."
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Urutkan</label>
        <div className="flex gap-2">
          <select
            value={getValue('sortBy')}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="flex-1 border rounded px-2 py-2 bg-white text-sm"
          >
            <option value="publishedAt">Tanggal</option>
            <option value="title">Judul</option>
            <option value="hit">Dibaca</option>
          </select>
          <select
            value={getValue('sortDir')}
            onChange={(e) => updateFilter('sortDir', e.target.value)}
            className="w-20 border rounded px-2 py-2 bg-white text-sm"
          >
            <option value="desc">↓</option>
            <option value="asc">↑</option>
          </select>
        </div>
      </div>
    </form>
  );
}
