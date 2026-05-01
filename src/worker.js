const LEGACY_PREFIX = '/hyperaion/lp';
const CANONICAL_PREFIX = '/hyperaion';
const ANALYTICS_PATH = '/analytics';
const CONTACT_PATH = '/contact';
const PERMANENT_REDIRECT = 301;
const MAX_FIELD_LENGTH = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === ANALYTICS_PATH) {
      return handleAnalytics(request);
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
