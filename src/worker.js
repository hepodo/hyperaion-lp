export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/hyperaion/lp')) {
      const stripped = url.pathname.replace(/^\/hyperaion\/lp\/?/, '/');
      const assetUrl = new URL(stripped || '/', url.origin);
      return env.ASSETS.fetch(assetUrl);
    }

    return new Response('Not Found', { status: 404 });
  }
};
