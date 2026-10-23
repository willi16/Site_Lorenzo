import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  Download,
  Eye,
  FileText,
  Mail,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Seo } from '@/lib/seo';
import { formatDateShort } from '@/lib/format';
import { Button, Card, Badge, FormStatus } from '@/components/ui/primitives';
import {
  adminRequest,
  currentUser,
  APPOINTMENT_STATUS_LABELS,
  LEAD_STATUS_LABELS,
  type AdminUser,
  type Appointment,
  type AuditEntry,
  type DashboardData,
  type Lead,
} from '@/lib/adminApi';

type Tab = 'leads' | 'appointments' | 'audit';

const LEAD_STATUS_TONE: Record<Lead['status'], 'navy' | 'clay' | 'olive' | 'sky' | 'neutral'> = {
  NEW: 'clay',
  IN_PROGRESS: 'sky',
  QUALIFIED: 'navy',
  WON: 'olive',
  LOST: 'neutral',
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [tab, setTab] = useState<Tab>('leads');
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError('');
    try {
      const dashboard = await adminRequest<DashboardData>('/admin/dashboard');
      setData(dashboard);
      const [leadList, apptList] = await Promise.all([
        adminRequest<Lead[]>('/leads?limit=100'),
        adminRequest<Appointment[]>('/appointments'),
      ]);
      setLeads(leadList);
      setAppointments(apptList);
      if (user?.role === 'ADMIN') {
        const entries = await adminRequest<AuditEntry[]>('/admin/audit');
        setAudit(entries);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible');
    } finally {
      setRefreshing(false);
    }
  }, [user?.role]);

  useEffect(() => {
    let active = true;
    currentUser()
      .then((u) => {
        if (!active) return;
        if (!u) {
          navigate('/admin/login', { replace: true });
          return;
        }
        setUser(u);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const updateLeadStatus = async (lead: Lead, status: Lead['status']) => {
    try {
      const updated = await adminRequest<Lead>(`/leads/${lead.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setLeads((current) => current.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible');
    }
  };

  const updateAppointmentStatus = async (
    appointment: Appointment,
    status: Appointment['status'],
  ) => {
    try {
      const updated = await adminRequest<Appointment>(`/appointments/${appointment.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setAppointments((current) =>
        current.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible');
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-cream-100">
        <p className="text-sm text-ink-500">Vérification de la session…</p>
      </div>
    );
  }

  return (
    <>
      <Seo title="Tableau de bord — B.A. Construction" noindex />

      <div className="space-y-8 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-navy-800">
              Bonjour {user?.name}
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Vue d’ensemble des demandes, rendez-vous et contenus du site.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            loading={refreshing}
            icon={<RefreshCw className="h-4 w-4" aria-hidden />}
          >
            Actualiser
          </Button>
        </div>

        <div className="space-y-8">
          {error ? <FormStatus type="error" message={error} /> : null}

          {data ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: 'Demandes de devis',
                  value: data.leads.total,
                  detail: `${data.leads.last30Days} sur 30 jours`,
                  icon: <FileText className="h-5 w-5" aria-hidden />,
                },
                {
                  label: 'Taux de conversion',
                  value: `${data.leads.conversion}%`,
                  detail: `${data.leads.won} dossier(s) gagné(s)`,
                  icon: <TrendingUp className="h-5 w-5" aria-hidden />,
                },
                {
                  label: 'Rendez-vous',
                  value: data.appointments.total,
                  detail: `${data.appointments.pending} en attente`,
                  icon: <CalendarClock className="h-5 w-5" aria-hidden />,
                },
                {
                  label: 'Abonnés newsletter',
                  value: data.newsletter.active,
                  detail: `${data.newsletter.total} au total`,
                  icon: <Mail className="h-5 w-5" aria-hidden />,
                },
              ].map((card) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest2 text-ink-400">
                        {card.label}
                      </span>
                      <span className="text-navy-700">{card.icon}</span>
                    </div>
                    <p className="mt-3 font-display text-3xl font-extrabold text-navy-800">
                      {card.value}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">{card.detail}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: 'leads', label: `Demandes (${leads.length})`, icon: <Users className="h-4 w-4" aria-hidden /> },
                {
                  key: 'appointments',
                  label: `Rendez-vous (${appointments.length})`,
                  icon: <CalendarClock className="h-4 w-4" aria-hidden />,
                },
                ...(user?.role === 'ADMIN'
                  ? [{ key: 'audit', label: 'Journal d’audit', icon: <Eye className="h-4 w-4" aria-hidden /> }]
                  : []),
              ] as { key: Tab; label: string; icon: React.ReactNode }[]
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                aria-pressed={tab === item.key}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  tab === item.key
                    ? 'bg-navy-800 text-white'
                    : 'bg-white text-ink-700 hover:bg-navy-700/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'leads' ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-ink-800/[0.03]">
                    <tr>
                      {['Client', 'Contact', 'Projet', 'Localisation', 'Reçu le', 'Statut'].map((head) => (
                        <th key={head} scope="col" className="px-4 py-3 font-semibold text-ink-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-t border-ink-800/[0.06] align-top">
                        <td className="px-4 py-3">
                          <span className="block font-semibold text-navy-800">
                            {lead.firstName} {lead.lastName}
                          </span>
                          <span className="mt-0.5 block max-w-sm text-xs leading-relaxed text-ink-500">
                            {lead.description}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <a href={`mailto:${lead.email}`} className="block text-clay-600 hover:underline">
                            {lead.email}
                          </a>
                          <span className="block text-xs text-ink-500">{lead.phone}</span>
                          {lead.attachments.length > 0 ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500">
                              <Download className="h-3 w-3" aria-hidden />
                              {lead.attachments.length} pièce(s)
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-ink-600">
                          <span className="block">{lead.projectType}</span>
                          {lead.budget ? <span className="text-xs text-ink-500">{lead.budget}</span> : null}
                        </td>
                        <td className="px-4 py-3 text-ink-600">{lead.location}</td>
                        <td className="px-4 py-3 text-xs text-ink-500">
                          {formatDateShort(lead.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={LEAD_STATUS_TONE[lead.status]}>
                            {LEAD_STATUS_LABELS[lead.status]}
                          </Badge>
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              void updateLeadStatus(lead, e.target.value as Lead['status'])
                            }
                            aria-label={`Changer le statut de ${lead.firstName} ${lead.lastName}`}
                            className="mt-2 block w-full rounded-lg border border-ink-800/12 bg-white px-2 py-1.5 text-xs"
                          >
                            {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-ink-500">
                          Aucune demande pour le moment.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          {tab === 'appointments' ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-ink-800/[0.03]">
                    <tr>
                      {['Client', 'Créneau', 'Sujet', 'Statut', 'Action'].map((head) => (
                        <th key={head} scope="col" className="px-4 py-3 font-semibold text-ink-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="border-t border-ink-800/[0.06]">
                        <td className="px-4 py-3">
                          <span className="block font-semibold text-navy-800">{appointment.name}</span>
                          <span className="block text-xs text-ink-500">{appointment.phone}</span>
                        </td>
                        <td className="px-4 py-3 text-ink-600">
                          {formatDateShort(appointment.date)} · {appointment.slot}
                        </td>
                        <td className="px-4 py-3 text-ink-600">{appointment.subject ?? '—'}</td>
                        <td className="px-4 py-3">
                          <Badge tone={appointment.status === 'CONFIRMED' ? 'olive' : 'neutral'}>
                            {APPOINTMENT_STATUS_LABELS[appointment.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={appointment.status}
                            onChange={(e) =>
                              void updateAppointmentStatus(
                                appointment,
                                e.target.value as Appointment['status'],
                              )
                            }
                            aria-label={`Changer le statut du rendez-vous de ${appointment.name}`}
                            className="rounded-lg border border-ink-800/12 bg-white px-2 py-1.5 text-xs"
                          >
                            {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-ink-500">
                          Aucun rendez-vous planifié.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          {tab === 'audit' ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-ink-800/[0.03]">
                    <tr>
                      {['Date', 'Action', 'Entité', 'Utilisateur', 'IP'].map((head) => (
                        <th key={head} scope="col" className="px-4 py-3 font-semibold text-ink-600">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {audit.map((entry) => (
                      <tr key={entry.id} className="border-t border-ink-800/[0.06]">
                        <td className="px-4 py-3 text-xs text-ink-500">
                          {formatDateShort(entry.createdAt)}
                        </td>
                        <td className="px-4 py-3 font-medium text-navy-800">{entry.action}</td>
                        <td className="px-4 py-3 text-ink-600">
                          {entry.entity ?? '—'}
                          {entry.entityId ? (
                            <span className="block text-xs text-ink-400">{entry.entityId}</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-ink-600">
                          {entry.user?.name ?? entry.user?.email ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-ink-500">{entry.ip ?? '—'}</td>
                      </tr>
                    ))}
                    {audit.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-ink-500">
                          Aucune entrée enregistrée.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
