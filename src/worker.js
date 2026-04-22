export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    if (pathname.endsWith('/')) {
      pathname += 'index.html';
    }

    const assetUrl = new URL(pathname, url.origin);
    return env.ASSETS.fetch(new Request(assetUrl, request));
  }
};
