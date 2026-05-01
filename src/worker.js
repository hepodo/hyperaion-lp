const LEGACY_PREFIX = '/hyperaion/lp';
const CANONICAL_PREFIX = '/hyperaion';
const ANALYTICS_PATH = '/analytics';
const PERMANENT_REDIRECT = 301;

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === ANALYTICS_PATH) {
      return handleAnalytics(request);
    }
    if (shouldRedirect(url.pathname)) {
      return Response.redirect(buildCanonicalUrl(request.url), PERMANENT_REDIRECT);
    }
    return env.ASSETS.fetch(request);
  },
};
