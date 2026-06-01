import Link from 'next/link';
import { getArticleTypes } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const types = await getArticleTypes();

  const typeIcons: Record<string, string> = {
    news: '📰',
    gallery: '🖼️',
    page: '📄',
    information: 'ℹ️',
  };

  const typeDescriptions: Record<string, string> = {
    news: 'Berita dan kabar terbaru',
    gallery: 'Koleksi gambar dan media',
    page: 'Halaman statis dan konten',
    information: 'Informasi publik',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CMS Artikel</h1>
          <p className="text-gray-600 text-lg">Kelola dan tampilkan berbagai jenis konten Anda</p>
        </div>

        {types.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Belum ada tipe artikel yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {types.map(type => (
              <Link
                key={type.id}
                href={`/${type.slug}`}
                className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl" role="img" aria-label={type.name}>
                    {typeIcons[type.slug] || '📁'}
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                      {type.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {typeDescriptions[type.slug] || 'Kumpulan artikel'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {type.articleCount} artikel
                  </span>
                  <span className="text-blue-600 group-hover:underline text-sm font-medium">
                    Lihat semua →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
