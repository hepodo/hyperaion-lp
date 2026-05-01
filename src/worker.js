const LEGACY_PREFIX = '/hyperaion/lp';
const CANONICAL_PREFIX = '/hyperaion';
const PERMANENT_REDIRECT = 301;

function buildCanonicalUrl(requestUrl) {
  const url = new URL(requestUrl);
  url.pathname = url.pathname.replace(LEGACY_PREFIX, CANONICAL_PREFIX);
  if (url.pathname === CANONICAL_PREFIX) url.pathname = `${CANONICAL_PREFIX}/`;
  return url;
}

function shouldRedirect(pathname) {
  return pathname === LEGACY_PREFIX || pathname.startsWith(`${LEGACY_PREFIX}/`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (shouldRedirect(url.pathname)) {
      return Response.redirect(buildCanonicalUrl(request.url), PERMANENT_REDIRECT);
    }
    return env.ASSETS.fetch(request);
  },
};
