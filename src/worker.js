const LEGACY_PREFIX = '/hyperaion/lp';
const CANONICAL_PREFIX = '/hyperaion';
const ANALYTICS_PATH = '/analytics';
const CONTACT_PATH = '/contact';
const LEADS_PATH = '/contact/leads';
const PERMANENT_REDIRECT = 301;
const MAX_FIELD_LENGTH = 2000;
const LEADS_LIMIT = 50;
const ADMIN_USER = 'admin';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

async function getAnalyticsEvent(request) {
  const url = new URL(request.url);
  const body = await request.json().catch(() => ({}));
  return {
    event: body.event || 'analytics_event',
    path: body.path || url.pathname,
    label: body.label || '',
    referrer: request.headers.get('referer') || '',
    country: request.cf?.country || '',
    colo: request.cf?.colo || '',
  };
}

function buildCanonicalUrl(requestUrl) {
  const url = new URL(requestUrl);
  url.pathname = url.pathname.replace(LEGACY_PREFIX, CANONICAL_PREFIX);
  if (url.pathname === CANONICAL_PREFIX) url.pathname = `${CANONICAL_PREFIX}/`;
  return url;
}

function shouldRedirect(pathname) {
  return pathname === LEGACY_PREFIX || pathname.startsWith(`${LEGACY_PREFIX}/`);
}

async function handleAnalytics(request) {
  console.log(JSON.stringify(await getAnalyticsEvent(request)));
  return new Response(null, { status: 204 });
}

function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function htmlResponse(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

function getFormValue(formData, name) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : '';
}

function buildLead(request, formData) {
  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    name: getFormValue(formData, 'name'),
    email: getFormValue(formData, 'email'),
    company: getFormValue(formData, 'company'),
    purpose: getFormValue(formData, 'purpose'),
    timing: getFormValue(formData, 'timing'),
    message: getFormValue(formData, 'message'),
    referrer: request.headers.get('referer') || '',
    user_agent: request.headers.get('user-agent') || '',
    country: request.cf?.country || '',
    colo: request.cf?.colo || '',
  };
}

function validateLead(lead) {
  return Boolean(
    lead.name &&
    EMAIL_PATTERN.test(lead.email) &&
    lead.company &&
    lead.purpose &&
    lead.timing &&
    lead.message
  );
}

async function saveLead(db, lead) {
  await db.prepare(
    `INSERT INTO leads (
      id, created_at, name, email, company, purpose, timing, message,
      referrer, user_agent, country, colo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    lead.id, lead.created_at, lead.name, lead.email, lead.company,
    lead.purpose, lead.timing, lead.message, lead.referrer,
    lead.user_agent, lead.country, lead.colo
  ).run();
}

async function handleContact(request, env) {
  if (request.method !== 'POST') return jsonResponse({ error: 'method_not_allowed' }, 405);
  if (!env.LEADS_DB) return jsonResponse({ error: 'lead_storage_unavailable' }, 500);
  const formData = await request.formData();
  if (getFormValue(formData, 'website')) return jsonResponse({ ok: true });
  const lead = buildLead(request, formData);
  if (!validateLead(lead)) return jsonResponse({ error: 'invalid_lead' }, 400);
  await saveLead(env.LEADS_DB, lead);
  console.info(JSON.stringify({ event: 'contact_lead', id: lead.id, company: lead.company }));
  return jsonResponse({ ok: true });
}

function unauthorizedResponse() {
  return htmlResponse('Authentication required', 401, {
    'WWW-Authenticate': 'Basic realm="HyperAION Leads"',
  });
}

function getBasicCredentials(request) {
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return null;
  const [user, password] = atob(header.slice(6)).split(':');
  return { user, password };
}

function isAuthorized(request, env) {
  if (!env.LEADS_ADMIN_PASSWORD) return false;
  const credentials = getBasicCredentials(request);
  return credentials?.user === ADMIN_USER && credentials.password === env.LEADS_ADMIN_PASSWORD;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => HTML_ESCAPE_MAP[char]);
}

function renderLeadRow(lead) {
  return `<tr>
    <td>${escapeHtml(lead.created_at)}</td>
    <td>${escapeHtml(lead.name)}</td>
    <td><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></td>
    <td>${escapeHtml(lead.company)}</td>
    <td>${escapeHtml(lead.purpose)}</td>
    <td>${escapeHtml(lead.timing)}</td>
    <td>${escapeHtml(lead.message)}</td>
  </tr>`;
}

function renderLeadsPage(leads) {
  const rows = leads.map(renderLeadRow).join('') || '<tr><td colspan="7">No leads yet.</td></tr>';
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>HyperAION Leads</title><style>
    body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Noto Sans JP",sans-serif;background:#0b0d13;color:#eef2ff;margin:0;padding:28px}
    h1{font-size:22px;margin:0 0 18px}table{width:100%;border-collapse:collapse;background:#111827}th,td{border:1px solid #283244;padding:10px;vertical-align:top;font-size:13px}th{background:#182033;text-align:left;color:#aeb9d5}a{color:#8fd5ff}td:last-child{min-width:280px;line-height:1.6;white-space:pre-wrap}
  </style></head><body><h1>HyperAION Leads</h1><table><thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Company</th><th>Purpose</th><th>Timing</th><th>Message</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

async function listLeads(db) {
  const result = await db.prepare(
    `SELECT created_at, name, email, company, purpose, timing, message
     FROM leads ORDER BY created_at DESC LIMIT ?`
  ).bind(LEADS_LIMIT).all();
  return result.results || [];
}

async function handleLeads(request, env) {
  if (request.method !== 'GET') return jsonResponse({ error: 'method_not_allowed' }, 405);
  if (!env.LEADS_DB) return jsonResponse({ error: 'lead_storage_unavailable' }, 500);
  if (!isAuthorized(request, env)) return unauthorizedResponse();
  return htmlResponse(renderLeadsPage(await listLeads(env.LEADS_DB)));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === ANALYTICS_PATH) {
      return handleAnalytics(request);
    }
    if (url.pathname === LEADS_PATH) {
      return handleLeads(request, env);
    }
    if (url.pathname === CONTACT_PATH) {
      return handleContact(request, env);
    }
    if (shouldRedirect(url.pathname)) {
      return Response.redirect(buildCanonicalUrl(request.url), PERMANENT_REDIRECT);
    }
    return env.ASSETS.fetch(request);
  },
};
