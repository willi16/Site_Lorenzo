import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar,
  CalendarCheck,
  Check,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  Upload,
  X,
} from 'lucide-react';

import { Seo, breadcrumbSchema, faqSchema, organizationSchema } from '@/lib/seo';
import { BUDGET_RANGES, CONTACT, PROJECT_TYPES } from '@/lib/constants';
import { ensureCsrfToken, getCsrfToken } from '@/lib/data';
import { Button, Container, Section, SectionHeading, Card, Input, Select, Textarea, FormStatus } from '@/components/ui/primitives';
import { PageHero } from '@/components/sections/PageHero';
import { contactLoader, useLoaderDataOf } from '@/app/loaders';

const contactSchema = z.object({
  firstName: z.string().trim().min(2, 'Merci d’indiquer votre prénom').max(80),
  lastName: z.string().trim().min(2, 'Merci d’indiquer votre nom').max(80),
  email: z.string().trim().email('Adresse e-mail invalide').max(160),
  phone: z
    .string()
    .trim()
    .min(6, 'Numéro de téléphone invalide')
    .max(30)
    .regex(/^[+\d][\d\s().-]{5,29}$/, 'Numéro de téléphone invalide'),
  projectType: z.enum(PROJECT_TYPES, { errorMap: () => ({ message: 'Sélectionnez un type de projet' }) }),
  area: z.string().trim().max(40).optional(),
  budget: z.string().trim().max(60).optional(),
  location: z.string().trim().min(2, 'Où se situe votre projet ?').max(160),
  description: z
    .string()
    .trim()
    .min(20, 'Décrivez votre projet en quelques lignes (20 caractères minimum)')
    .max(4000),
  contactPreference: z.enum(['email', 'phone', 'whatsapp']).default('email'),
  website: z.string().max(0).optional(),
});

type ContactValues = z.infer<typeof contactSchema>;

const FAQ = [
  {
    question: 'Le devis est-il gratuit ?',
    answer:
      'Oui. La première estimation et la visite technique sont gratuites et sans engagement. Seuls les services de maîtrise d’œuvre et les travaux font l’objet d’une facturation.',
  },
  {
    question: 'Sous quel délai recevez-vous une réponse ?',
    answer:
      'Nous répondons à chaque demande sous 48 heures ouvrées. Pour les projets urgents, appelez-nous directement au +228 91 08 55 50.',
  },
  {
    question: 'Travaillez-vous en dehors de Lomé ?',
    answer:
      'Oui : nous intervenons dans tout le Togo (Tsévié, Kégué, Aného, Sokodé…) ainsi qu’au Bénin et au Ghana pour les projets d’envergure.',
  },
  {
    question: 'Puis-je avoir un devis à partir de plans ?',
    answer:
      'Absolument. Envoyez-nous vos plans, votre titre de propriété et vos desiderata : nous revenons avec une estimation de constructibilité et un chiffrage préliminaire.',
  },
];

export default function ContactPage() {
  const { services } = useLoaderDataOf<typeof contactLoader>();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactPreference: 'email',
      website: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setStatus('idle');
    try {
      await ensureCsrfToken();
      const csrfToken = getCsrfToken();

      // Les pièces jointes sont d'abord déposées sur l'API, puis référencées
      // dans la demande : le cabinet reçoit un dossier complet et traçable.
      let attachments: string[] = [];
      if (files.length > 0) {
        const uploadData = new FormData();
        files.forEach((file) => uploadData.append('files', file));
        uploadData.append('csrfToken', csrfToken);
        const uploadRes = await fetch('/api/uploads/lead', {
          method: 'POST',
          body: uploadData,
          headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined,
          credentials: 'same-origin',
        });
        const uploadPayload = await uploadRes.json().catch(() => null);
        if (!uploadRes.ok) {
          throw new Error(
            uploadPayload?.error?.message ?? 'Impossible de joindre les fichiers',
          );
        }
        attachments = (uploadPayload?.data ?? []) as string[];
      }

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        credentials: 'same-origin',
        body: JSON.stringify({ ...values, attachments }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error?.message ?? 'Une erreur est survenue');
      setStatus('success');
      setMessage(
        payload?.data?.message ??
          'Votre demande a bien été transmise. Nous vous répondons sous 48 heures.',
      );
      reset();
      setFiles([]);
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Impossible d’envoyer votre demande. Appelez-nous au +228 91 08 55 50.',
      );
    }
  });

  return (
    <>
      <Seo
        title="Contact & demande de devis — B.A. Construction, Lomé Togo"
        description="Parlez-nous de votre projet de construction, rénovation ou aménagement à Lomé. Devis gratuit sous 48 h, rendez-vous en ligne, coordonnées complètes du cabinet."
        canonical="/contact"
        keywords={[
          'devis construction Lomé',
          'contact architecte Togo',
          'rendez-vous architecte Lomé',
          'devis rénovation maison Togo',
        ]}
        jsonLd={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Contact', url: '/contact' },
          ]),
          faqSchema(FAQ.map((item) => ({ question: item.question, answer: item.answer }))),
        ]}
      />

      <PageHero
        eyebrow="Contact"
        title="Parlons de votre projet"
        description="Décrivez votre projet, envoyez vos plans, ou prenez simplement rendez-vous. Le premier échange est gratuit et sans engagement."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <Section spacing="tight">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            {/* ────────────────────────── FORMULAIRE ─────────────────────── */}
            <div>
              <Card className="p-7 sm:p-9">
                <h2 className="font-display text-2xl font-extrabold text-navy-800">
                  Demande de devis gratuit
                </h2>
                <p className="mt-2 text-sm text-ink-600">
                  Tous les champs marqués d’un astérisque sont obligatoires.
                </p>

                {status !== 'idle' ? (
                  <div className="mt-6">
                    <FormStatus
                      type={status === 'success' ? 'success' : 'error'}
                      message={message}
                    />
                  </div>
                ) : null}

                <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    className="hidden"
                    {...register('website')}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      label="Prénom"
                      required
                      autoComplete="given-name"
                      placeholder="Koffi"
                      error={errors.firstName?.message}
                      {...register('firstName')}
                    />
                    <Input
                      label="Nom"
                      required
                      autoComplete="family-name"
                      placeholder="Kouassi"
                      error={errors.lastName?.message}
                      {...register('lastName')}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      label="E-mail"
                      required
                      type="email"
                      autoComplete="email"
                      placeholder="koffi@example.tg"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label="Téléphone"
                      required
                      type="tel"
                      autoComplete="tel"
                      placeholder="+228 90 00 00 00"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Select
                      label="Type de projet"
                      required
                      placeholder="Sélectionnez…"
                      options={PROJECT_TYPES.map((type) => ({ value: type, label: type }))}
                      error={errors.projectType?.message}
                      {...register('projectType')}
                    />
                    <Input
                      label="Superficie estimée"
                      placeholder="Ex. 180 m²"
                      error={errors.area?.message}
                      {...register('area')}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Select
                      label="Budget prévu"
                      placeholder="Sélectionnez…"
                      options={BUDGET_RANGES.map((range) => ({ value: range, label: range }))}
                      error={errors.budget?.message}
                      {...register('budget')}
                    />
                    <Input
                      label="Localisation du projet"
                      required
                      placeholder="Ex. Lomé — Tokoin"
                      error={errors.location?.message}
                      {...register('location')}
                    />
                  </div>

                  <Textarea
                    label="Description du projet"
                    required
                    rows={6}
                    placeholder="Parlez-nous du terrain, de l’usage recherché, de vos contraintes, de vos délais…"
                    error={errors.description?.message}
                    {...register('description')}
                  />

                  <div>
                    <p className="text-sm font-semibold text-ink-800">
                      Plans, photos ou documents
                      <span className="ml-1 text-ink-400/70 text-xs font-normal">(optionnel)</span>
                    </p>
                    <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink-800/20 bg-cream-100/50 px-4 py-4 transition hover:border-clay-500/50 hover:bg-cream-100">
                      <Upload className="h-5 w-5 shrink-0 text-clay-500" aria-hidden />
                      <span className="text-sm text-ink-600">
                        {files.length > 0
                          ? `${files.length} fichier${files.length > 1 ? 's' : ''} sélectionné${files.length > 1 ? 's' : ''}`
                          : 'Joindre des fichiers (PDF, JPG, PNG, DWG — 10 Mo max)'}
                      </span>
                      <input
                        type="file"
                        multiple
                        className="sr-only"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.dwg"
                        onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 6))}
                      />
                    </label>
                    {files.length > 0 ? (
                      <ul className="mt-2 space-y-1.5">
                        {files.map((file) => (
                          <li
                            key={file.name}
                            className="flex items-center justify-between gap-3 rounded-lg bg-ink-800/[0.04] px-3 py-2 text-xs text-ink-600"
                          >
                            <span className="truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setFiles((current) => current.filter((f) => f !== file))}
                              className="shrink-0 text-ink-400 transition hover:text-red-600"
                              aria-label={`Retirer ${file.name}`}
                            >
                              <X className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <fieldset>
                    <legend className="text-sm font-semibold text-ink-800">
                      Comment préférez-vous être rappelé&nbsp;?
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        { value: 'email', label: 'E-mail' },
                        { value: 'phone', label: 'Téléphone' },
                        { value: 'whatsapp', label: 'WhatsApp' },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="cursor-pointer rounded-full border border-ink-800/12 px-4 py-2 text-sm font-medium text-ink-700 transition has-[:checked]:border-navy-700 has-[:checked]:bg-navy-700 has-[:checked]:text-white"
                        >
                          <input
                            type="radio"
                            value={option.value}
                            className="sr-only"
                            {...register('contactPreference')}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="flex flex-col gap-3 border-t border-ink-800/[0.08] pt-6 sm:flex-row sm:items-center">
                    <Button type="submit" size="lg" loading={isSubmitting} icon={<Send className="h-4 w-4" aria-hidden />}>
                      Envoyer ma demande
                    </Button>
                    <p className="text-xs leading-relaxed text-ink-500">
                      Vos informations restent confidentielles et ne sont jamais transmises à des tiers.
                    </p>
                  </div>
                </form>
              </Card>
            </div>

            {/* ──────────────────────────── ASIDE ─────────────────────────── */}
            <aside className="space-y-5">
              <Card className="p-7">
                <h2 className="font-display text-lg font-extrabold text-navy-800">Le cabinet</h2>
                <ul className="mt-5 space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-clay-500" aria-hidden />
                    <span>
                      <span className="block font-semibold text-navy-800">Adresse</span>
                      {CONTACT.address}
                      <br />
                      {CONTACT.city}, {CONTACT.country}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-clay-500" aria-hidden />
                    <span>
                      <span className="block font-semibold text-navy-800">Téléphone / WhatsApp</span>
                      <a href={CONTACT.phoneHref} className="text-clay-600 hover:underline">
                        {CONTACT.phone}
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-clay-500" aria-hidden />
                    <span>
                      <span className="block font-semibold text-navy-800">E-mail</span>
                      <a href={`mailto:${CONTACT.email}`} className="text-clay-600 hover:underline">
                        {CONTACT.email}
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-clay-500" aria-hidden />
                    <span>
                      <span className="block font-semibold text-navy-800">Horaires</span>
                      {CONTACT.hours.map((slot) => (
                        <span key={slot.days} className="block">
                          {slot.days} : {slot.time}
                        </span>
                      ))}
                    </span>
                  </li>
                </ul>
              </Card>

              <AppointmentCard />

              <div className="overflow-hidden rounded-2xl border border-ink-800/[0.07]">
                <iframe
                  title="Plan d’accès au cabinet B.A. Construction"
                  src={CONTACT.mapsEmbed}
                  width="100%"
                  height="240"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block h-full min-h-[240px] w-full"
                />
              </div>

              <Card className="p-7">
                <h2 className="font-display text-base font-bold text-navy-800">
                  Nos prestations les plus demandées
                </h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {services.slice(0, 5).map((service) => (
                    <li key={service.id} className="flex items-start gap-2 text-ink-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-olive-600" aria-hidden />
                      {service.title}
                    </li>
                  ))}
                </ul>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="cream">
        <Container>
          <SectionHeading
            eyebrow="Questions fréquentes"
            title="Avant de nous écrire"
            description="Les réponses aux questions que l’on nous pose le plus souvent."
            align="center"
          />
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {FAQ.map((item) => (
              <Card key={item.question} className="p-6">
                <h3 className="font-display text-base font-bold text-navy-800">{item.question}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{item.answer}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

/* ─────────────────────────── Prise de rendez-vous ─────────────────────────── */

const SLOTS = ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00'];

function AppointmentCard() {
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [available, setAvailable] = useState<string[]>(SLOTS);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const today = new Date();
  const minDate = today.toISOString().slice(0, 10);
  const maxDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const loadSlots = async (value: string) => {
    setDate(value);
    setSlot('');
    if (!value) return;
    try {
      const res = await fetch(`/api/appointments/slots?date=${value}`, { credentials: 'same-origin' });
      const payload = await res.json();
      if (payload?.ok) setAvailable(payload.data.slots);
    } catch {
      setAvailable(SLOTS);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    try {
      await ensureCsrfToken();
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getCsrfToken() ? { 'X-CSRF-Token': getCsrfToken() } : {}),
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          name,
          email,
          phone,
          date,
          slot,
          csrfToken: getCsrfToken(),
          subject: 'Rendez-vous via le site',
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error?.message ?? 'Impossible de créer le rendez-vous');
      setStatus('success');
      setMessage(
        payload?.data?.message ?? 'Rendez-vous enregistré. Vous recevrez une confirmation.',
      );
      setName('');
      setEmail('');
      setPhone('');
      setDate('');
      setSlot('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Une erreur est survenue.');
    }
  };

  return (
    <Card className="p-7">
      <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-navy-800">
        <CalendarCheck className="h-5 w-5 text-clay-500" aria-hidden />
        Prendre rendez-vous
      </h2>
      <p className="mt-1.5 text-sm text-ink-600">
        45 minutes, en visioconférence ou au cabinet.
      </p>

      {status === 'success' ? (
        <div className="mt-5">
          <FormStatus type="success" message={message} />
        </div>
      ) : null}
      {status === 'error' ? (
        <div className="mt-5">
          <FormStatus type="error" message={message} />
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-5 space-y-3">
        <Input
          label="Date"
          type="date"
          required
          min={minDate}
          max={maxDate}
          value={date}
          onChange={(e) => void loadSlots(e.target.value)}
        />
        <Input label="Nom complet" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="E-mail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Téléphone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {date ? (
          <div>
            <p className="text-sm font-semibold text-ink-800">Créneaux disponibles</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {available.length === 0 ? (
                <p className="text-sm text-ink-500">Aucun créneau libre ce jour-là.</p>
              ) : (
                available.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSlot(value)}
                    aria-pressed={slot === value}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      slot === value
                        ? 'border-navy-700 bg-navy-700 text-white'
                        : 'border-ink-800/12 text-ink-700 hover:border-navy-700/40'
                    }`}
                  >
                    {value}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}

        <Button type="submit" fullWidth loading={status === 'loading'} disabled={!slot}>
          <Calendar className="h-4 w-4" aria-hidden />
          Confirmer le rendez-vous
        </Button>
      </form>
    </Card>
  );
}
