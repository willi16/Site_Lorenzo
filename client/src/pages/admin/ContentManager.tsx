import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Badge, Button, Card, FormStatus, Input } from '@/components/ui/primitives';
import {
  deleteContent,
  listContent,
  type AdminContentItem,
  type ContentList,
} from '@/lib/adminApi';
import { formatDateShort } from '@/lib/format';
import type { ContentDef } from './contentConfig';

type StatusFilter = 'all' | 'published' | 'draft';

function itemTitle(item: AdminContentItem, field: string): string {
  const value = (item as unknown as Record<string, unknown>)[field];
  return typeof value === 'string' && value ? value : '—';
}

function isVisible(item: AdminContentItem, field: 'published' | 'active'): boolean {
  return Boolean((item as unknown as Record<string, unknown>)[field]);
}

export function ContentManager({ def }: { def: ContentDef }) {
  const navigate = useNavigate();
  const [list, setList] = useState<ContentList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: { status?: 'published' | 'draft'; q?: string } = {};
      if (status !== 'all') params.status = status;
      if (query.trim().length >= 2) params.q = query.trim();
      setList(await listContent(def.entity, params));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  }, [def.entity, status, query]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  const remove = async (item: AdminContentItem) => {
    if (!window.confirm(`Supprimer définitivement « ${itemTitle(item, def.titleField)} » ?`)) return;
    setDeletingId(item.id);
    setError('');
    setSuccess('');
    try {
      await deleteContent(def.entity, item.id);
      setSuccess('Élément supprimé.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible');
    } finally {
      setDeletingId(null);
    }
  };

  const items = list?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy-800">{def.plural}</h1>
          <p className="mt-1 text-sm text-ink-500">
            {list ? `${list.total} élément(s)` : 'Chargement…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void load()}
            loading={loading}
            icon={<RefreshCw className="h-4 w-4" aria-hidden />}
          >
            Actualiser
          </Button>
          <Link
            to={`/admin/contenu/${def.entity}/nouveau`}
            className="inline-flex items-center gap-2 rounded-xl bg-clay-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-clay-600"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Ajouter
          </Link>
        </div>
      </div>

      {error ? <FormStatus type="error" message={error} /> : null}
      {success ? <FormStatus type="success" message={success} /> : null}

      {def.searchable || def.supportsStatusFilter ? (
        <div className="flex flex-wrap items-end gap-3">
          {def.searchable ? (
            <div className="w-full max-w-sm">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                icon={<Search className="h-4 w-4" aria-hidden />}
                aria-label="Rechercher"
              />
            </div>
          ) : null}
          {def.supportsStatusFilter ? (
            <div className="flex gap-1 rounded-xl bg-white p-1 shadow-soft">
              {(
                [
                  { key: 'all', label: 'Tous' },
                  { key: 'published', label: 'Publiés' },
                  { key: 'draft', label: 'Brouillons' },
                ] as { key: StatusFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatus(tab.key)}
                  aria-pressed={status === tab.key}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    status === tab.key ? 'bg-navy-800 text-white' : 'text-ink-600 hover:bg-navy-700/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-ink-800/[0.03]">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-600">Titre</th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-600">Statut</th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-600">Modifié le</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-ink-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-ink-800/[0.06]">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/contenu/${def.entity}/${item.id}`}
                      className="font-semibold text-navy-800 hover:text-clay-600"
                    >
                      {itemTitle(item, def.titleField)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {isVisible(item, def.visibilityField) ? (
                      <Badge tone="olive">Visible</Badge>
                    ) : (
                      <Badge tone="neutral">Masqué</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">{formatDateShort(item.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/contenu/${def.entity}/${item.id}`)}
                        aria-label="Modifier"
                        icon={<Pencil className="h-4 w-4" aria-hidden />}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void remove(item)}
                        loading={deletingId === item.id}
                        aria-label="Supprimer"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        icon={<Trash2 className="h-4 w-4" aria-hidden />}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-ink-500">
                    Aucun élément. Cliquez sur « Ajouter » pour en créer un.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
