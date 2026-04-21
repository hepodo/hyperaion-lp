export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return response;
    }
    if (url.pathname.endsWith('/')) {
      const indexUrl = new URL(url.pathname + 'index.html', url.origin);
      return env.ASSETS.fetch(indexUrl);
    }
    return response;
  }
};
