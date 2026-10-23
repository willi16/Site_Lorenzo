import { useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, Plus, UploadCloud, X } from 'lucide-react';
import { Button, Field, Input } from '@/components/ui/primitives';
import { uploadImage } from '@/lib/adminApi';

/**
 * Champ image : aperçu, saisie d'URL manuelle et envoi de fichier vers
 * `/api/uploads`. La valeur stockée est l'URL publique renvoyée par le serveur.
 */
export function ImageField({
  label,
  value,
  onChange,
  hint,
  allowUpload = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  allowUpload?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const id = `image-${label.replace(/\s+/g, '-').toLowerCase()}`;

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadImage(file, label);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
      <div className="space-y-3">
        <div className="flex items-start gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-800/12 bg-cream-100">
            {value ? (
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus className="h-6 w-6 text-ink-400" aria-hidden />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/uploads/mon-image.jpg ou https://…"
              aria-label={label}
            />
            <div className="flex flex-wrap items-center gap-2">
              {allowUpload ? (
                <>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={(e) => void handleFile(e)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={uploading}
                    onClick={() => inputRef.current?.click()}
                    icon={<UploadCloud className="h-4 w-4" aria-hidden />}
                  >
                    Téléverser une image
                  </Button>
                </>
              ) : null}
              {value ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange('')}
                  icon={<X className="h-4 w-4" aria-hidden />}
                >
                  Retirer
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Field>
  );
}

/**
 * Champ liste de chaînes : chaque ligne est un input avec un bouton de
 * suppression, plus un bouton d'ajout.
 */
export function ArrayField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const update = (index: number, next: string) => {
    onChange(value.map((item, i) => (i === index ? next : item)));
  };
  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };
  const add = () => onChange([...value, '']);

  return (
    <Field label={label} htmlFor={`array-${label}`} hint={hint}>
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => update(index, e.target.value)}
              placeholder={placeholder}
              aria-label={`${label} ${index + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              aria-label={`Supprimer la ligne ${index + 1}`}
              icon={<X className="h-4 w-4" aria-hidden />}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          icon={<Plus className="h-4 w-4" aria-hidden />}
        >
          Ajouter une entrée
        </Button>
      </div>
    </Field>
  );
}
