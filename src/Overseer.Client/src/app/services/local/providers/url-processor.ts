export function processUrl(url: string, refPath?: string): string {
  const uri = new URL(url);

  // if the ref path is a url the use it if possible
  if (refPath && URL.canParse(refPath)) {
    try {
      const refUri = new URL(refPath);
      if (refUri.host === 'localhost' || refUri.host === '127.0.0.1') {
        const relative = new URL(refUri.pathname, url);
        if (refUri.search) {
          relative.search = refUri.search;
        }
        return relative.toString();
      }
      return refUri.toString();
    } catch (error) {
      return url;
    }
  }

  let query: string | undefined = undefined;
  if (refPath) {
    if (refPath.startsWith('/')) {
      refPath = refPath.substring(1);
    }

    if (refPath.includes('?')) {
      query = new URLSearchParams(refPath.substring(refPath.indexOf('?'))).toString();
      refPath = refPath.substring(0, refPath.indexOf('?'));
    }
  }

  uri.pathname = refPath ? `${uri.pathname}${uri.pathname.endsWith('/') ? '' : '/'}${refPath}` : uri.pathname;
  uri.search = query ?? '';

  const result = uri.toString();
  return result;
}
