export function processUrl(url: string, refPath?: string): string {
  const uri = new URL(url);
  let refPort = '';

  if (refPath && URL.canParse(refPath)) {
    try {
      const refUri = new URL(refPath);
      if (refUri.host.startsWith('localhost') || refUri.host.startsWith('127.0.0.1')) {
        refPath = `${refUri.pathname}${refUri.search}`;
        refPort = refUri.host.includes(':') ? refUri.host.substring(refUri.host.indexOf(':') + 1) : '';
      } else {
        return refUri.toString();
      }
    } catch (error) {
      return url;
    }
  }

  refPath = refPath?.startsWith('/') ? refPath.substring(1) : refPath;
  let query: string | undefined = undefined;
  if (refPath?.includes('?')) {
    query = new URLSearchParams(refPath.substring(refPath.indexOf('?'))).toString();
    refPath = refPath.substring(0, refPath.indexOf('?'));
  }

  if (refPort && !uri.host.includes(refPort)) {
    // if there is a port, and it's different, the path should be relative to the host
    let host = uri.host;
    if (host.includes(':')) {
      host = host.substring(0, host.indexOf(':') + 1);
    }

    uri.host = `${host}:${refPort}`;
    uri.pathname = refPath ?? '';
  } else {
    uri.pathname = refPath ? `${uri.pathname}${uri.pathname.endsWith('/') ? '' : '/'}${refPath}` : uri.pathname;
  }

  uri.search = query ?? '';

  const result = uri.toString();
  return result;
}
