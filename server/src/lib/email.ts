import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.MAIL_ENABLED || !env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      pool: true,
      maxConnections: 3,
    });
  }
  return transporter;
}

interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendMail(options: MailOptions): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    logger.warn({ to: options.to, subject: options.subject }, 'Email non envoyé (SMTP désactivé)');
    return false;
  }
  try {
    await t.sendMail({
      from: env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text ?? options.html.replace(/<[^>]+>/g, ' '),
      replyTo: options.replyTo,
    });
    logger.info({ to: options.to, subject: options.subject }, 'Email envoyé');
    return true;
  } catch (err) {
    logger.error({ err, to: options.to }, "Échec de l'envoi de l'email");
    return false;
  }
}

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const layout = (title: string, body: string) => `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f1e6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a3751">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1e6;padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e1cf">
<tr><td style="background:#1a3751;padding:24px 32px">
  <div style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:.14em">B.A. CONSTRUCTION</div>
  <div style="color:#a6d7ee;font-size:12px;letter-spacing:.2em;margin-top:4px">LUNDI BÂTISSEUR · TOGO</div>
</td></tr>
<tr><td style="padding:32px">${body}</td></tr>
<tr><td style="background:#f9f6e7;padding:18px 32px;color:#6b7280;font-size:12px;line-height:1.6">
  B.A. Construction · Lomé, Togo · +228 91 08 55 50<br>
  <a href="https://ba-construction.tg" style="color:#e76836">ba-construction.tg</a>
</td></tr>
</table></td></tr></table></body></html>`;

export const emailTemplates = {
  newLead(lead: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    projectType: string;
    location: string;
    description: string;
  }) {
    const title = `Nouveau projet : ${lead.firstName} ${lead.lastName}`;
    const html = layout(
      title,
      `<h1 style="margin:0 0 16px;font-size:22px">Nouvelle demande de projet</h1>
       <p style="margin:0 0 20px;line-height:1.7;color:#374151">Un nouveau prospect a utilise le formulaire de contact du site.</p>
       <table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;border-collapse:collapse">
         ${(
           [
             ['Nom', `${lead.firstName} ${lead.lastName}`],
             ['Email', lead.email],
             ['Téléphone', lead.phone],
             ['Type de projet', lead.projectType],
             ['Localisation', lead.location],
           ] as [string, string][]
         )
           .map(
             ([k, v]) =>
               `<tr><td style="border-bottom:1px solid #eee;color:#6b7280;width:38%">${esc(k)}</td><td style="border-bottom:1px solid #eee;font-weight:600">${esc(v)}</td></tr>`,
           )
           .join('')}
       </table>
       <p style="margin:20px 0 0;padding:16px;background:#f9f6e7;border-radius:10px;line-height:1.7;font-size:14px">${esc(lead.description)}</p>`,
    );
    return { title, html };
  },

  leadConfirmation(lead: { firstName: string; projectType: string }) {
    const title = 'Votre demande a bien été reçue';
    const html = layout(
      title,
      `<h1 style="margin:0 0 16px;font-size:22px">Merci ${esc(lead.firstName)} !</h1>
       <p style="margin:0 0 16px;line-height:1.7;color:#374151">Votre demande concernant un projet de type
       <strong>${esc(lead.projectType)}</strong> a bien été enregistrée par notre équipe.</p>
       <p style="margin:0 0 16px;line-height:1.7;color:#374151">Un architecte vous recontacte sous 48&nbsp;heures ouvrées
       pour organiser un premier échange et comprendre vos attentes.</p>
       <p style="margin:0;padding:16px;background:#eef6fb;border-left:3px solid #e76836;border-radius:8px;line-height:1.7;font-size:14px">
       Besoin d'échanger plus vite&nbsp;? Appelez-nous au <strong>+228 91 08 55 50</strong>.</p>`,
    );
    return { title, html };
  },

  newsletterWelcome(name?: string, unsubscribeLink?: string) {
    const title = 'Bienvenue dans la communauté B.A. Construction';
    const html = layout(
      title,
      `<h1 style="margin:0 0 16px;font-size:22px">Bienvenue${name ? ` ${esc(name)}` : ''} !</h1>
       <p style="margin:0;line-height:1.7;color:#374151">Vous êtes désormais inscrit à notre lettre d'architecture.
       Vous recevrez chaque mois nos meilleures réalisations, nos conseils de construction et les tendances
       architecturales togolaises et ouest-africaines.</p>
       ${
         unsubscribeLink
           ? `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#6b7280;line-height:1.6">
              Vous ne souhaitez plus recevoir cette lettre&nbsp;?
              <a href="${esc(unsubscribeLink)}" style="color:#e76836">Se désinscrire</a>.
             </p>`
           : ''
       }`,
    );
    return { title, html };
  },
};
