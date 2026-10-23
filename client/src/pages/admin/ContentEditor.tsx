import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Button, Card, FormStatus, Input, Select, Textarea } from '@/components/ui/primitives';
import {
  createContent,
  deleteContent,
  getContent,
  getContentOptions,
  updateContent,
  type AdminContentItem,
  type ContentOptions,
} from '@/lib/adminApi';
import { ArrayField, ImageField } from './contentFields';
import { dynamicOptions, itemToForm, type ContentDef, type FieldDef } from './contentConfig';

function defaultValues(def: ContentDef): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of def.fields) {
    switch (field.type) {
      case 'array':
        values[field.name] = [];
        break;
      case 'number':
        values[field.name] = '';
        break;
      case 'select': {
        const first = field.options[0]?.value;
        values[field.name] =
          field.name === def.visibilityField ? 'true' : (first ?? '');
        break;
      }
      default:
        values[field.name] = '';
    }
  }
  if (def.visibilityField === 'published' && !('published' in values)) values.published = 'true';
  if (def.visibilityField === 'active' && !('active' in values)) values.active = 'true';
  return values;
}

/** Normalise les valeurs du formulaire vers le JSON attendu par l'API. */
function toPayload(
  def: ContentDef,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of def.fields) {
    const raw = values[field.name];
    switch (field.type) {
      case 'array':
        payload[field.name] = Array.isArray(raw)
          ? raw.map((v) => String(v).trim()).filter(Boolean)
          : [];
        break;
      case 'number': {
        if (raw === '' || raw === null || raw === undefined) {
          if (field.required) payload[field.name] = raw;
          break;
        }
        payload[field.name] = Number(raw);
        break;
      }
      case 'boolean':
        payload[field.name] = raw === true || raw === 'true';
        break;
      case 'select':
        if (field.options.length > 0 || field.dynamic) {
          payload[field.name] = raw === 'true' ? true : raw === 'false' ? false : raw ?? '';
        } else {
          payload[field.name] = raw ?? '';
        }
        break;
      default:
        payload[field.name] = typeof raw === 'string' ? raw : '';
    }
  }
  return payload;
}

export function ContentEditor({ def, id }: { def: ContentDef; id?: string }) {
  const navigate = useNavigate();
  const isNew = !id;
  const [values, setValues] = useState<Record<string, unknown>>(() => defaultValues(def));
  const [options, setOptions] = useState<ContentOptions | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setValues(defaultValues(def));
    setError('');
    setSuccess('');
  }, [def]);

  useEffect(() => {
    let active = true;
    void getContentOptions()
      .then((opts) => {
        if (active) setOptions(opts);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isNew || !id) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    getContent<AdminContentItem>(def.entity, id)
      .then((item) => {
        if (!active) return;
        const form = itemToForm(item);
        setValues({ ...defaultValues(def), ...form });
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Chargement impossible');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [def, id, isNew]);

  const grouped = useMemo(() => {
    const known = new Set<string>();
    const groups = def.groups.map((group) => {
      const fields = group.fields
        .map((name) => def.fields.find((f) => f.name === name))
        .filter((f): f is FieldDef => Boolean(f));
      fields.forEach((f) => known.add(f.name));
      return { ...group, fields };
    });
    const rest = def.fields.filter((f) => !known.has(f.name));
    if (rest.length > 0) groups.push({ label: 'Autres', fields: rest });
    return groups;
  }, [def]);

  const setValue = (name: string, value: unknown) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = toPayload(def, values);
      const saved = isNew
        ? await createContent<AdminContentItem>(def.entity, payload)
        : await updateContent<AdminContentItem>(def.entity, id as string, payload);
      if (isNew) {
        navigate(`/admin/contenu/${def.entity}/${saved.id}`, { replace: true });
        setSuccess('Enregistrement créé.');
      } else {
        setSuccess('Modifications enregistrées.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    if (!window.confirm(`Supprimer définitivement ce ${def.singular.toLowerCase()} ?`)) return;
    setDeleting(true);
    setError('');
    try {
      await deleteContent(def.entity, id);
      navigate(`/admin/contenu/${def.entity}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible');
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-ink-500">Chargement…</p>;
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to={`/admin/contenu/${def.entity}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-navy-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour à la liste
          </Link>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-navy-800">
            {isNew ? `Nouveau ${def.singular.toLowerCase()}` : `Modifier le ${def.singular.toLowerCase()}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNew ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={() => void remove()}
              icon={<Trash2 className="h-4 w-4" aria-hidden />}
            >
              Supprimer
            </Button>
          ) : null}
          <Button type="submit" size="sm" loading={saving} icon={<Save className="h-4 w-4" aria-hidden />}>
            Enregistrer
          </Button>
        </div>
      </div>

      {error ? <FormStatus type="error" message={error} /> : null}
      {success ? <FormStatus type="success" message={success} /> : null}

      {grouped.map((group) => (
        <Card key={group.label} className="p-6">
          <h2 className="font-display text-lg font-bold text-navy-800">{group.label}</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {group.fields.map((field) => (
              <div
                key={field.name}
                className={field.type === 'textarea' || field.type === 'image' || field.type === 'array' ? 'sm:col-span-2' : ''}
              >
                <FieldRenderer
                  field={field}
                  value={values[field.name]}
                  onChange={(v) => setValue(field.name, v)}
                  options={options}
                />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </form>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
  options,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  options: ContentOptions | null;
}) {
  const id = `field-${field.name}`;

  if (field.type === 'image') {
    return <ImageField label={field.label} value={String(value ?? '')} onChange={onChange} hint={field.hint} />;
  }
  if (field.type === 'array') {
    return (
      <ArrayField
        label={field.label}
        value={Array.isArray(value) ? (value as string[]) : []}
        onChange={onChange}
        hint={field.hint}
        placeholder={field.placeholder}
      />
    );
  }
  if (field.type === 'textarea') {
    return (
      <Textarea
        id={id}
        label={field.label}
        required={field.required}
        hint={field.hint}
        rows={field.rows}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === 'select') {
    const opts = field.dynamic ? dynamicOptions(field.dynamic, options) : field.options;
    return (
      <Select
        id={id}
        label={field.label}
        required={field.required}
        hint={field.hint}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        options={opts}
        placeholder={field.dynamic ? '— Aucun —' : undefined}
      />
    );
  }
  if (field.type === 'number') {
    return (
      <Input
        id={id}
        label={field.label}
        type="number"
        required={field.required}
        hint={field.hint}
        min={field.min}
        max={field.max}
        step={field.step}
        value={value === '' || value === null || value === undefined ? '' : String(value)}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <Input
      id={id}
      label={field.label}
      required={field.type === 'text' ? field.required : undefined}
      hint={field.hint}
      placeholder={field.type === 'text' ? field.placeholder : undefined}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
