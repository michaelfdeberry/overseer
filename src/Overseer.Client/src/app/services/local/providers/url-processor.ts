import * as Url from 'url-parse';

export function processUrl(url: string, refPath?: string): string {
  const uri = new Url(url, {});
  const refUri = new Url(refPath, {});

  // if the ref path is a url the use it if possible
  if (refUri.protocol && refUri.protocol.startsWith('http')) {
    // if the host is localhost or a loopback ip assume the url is relative to the base url
    if (refUri.host === 'localhost' || refUri.host === '127.0.0.1') {
      uri.set('pathname', refUri.pathname);
      uri.set('query', refUri.query);

      return uri.toString();
    }

    // if the reference path is a valid url just use it
    return refUri.toString();
  }

  let query: any = {};
  if (refPath && refPath.indexOf('?') > 0) {
    if (refPath.startsWith('/')) {
      refPath = refPath.substr(1);
    }

    const parts = refPath.split('?');
    refPath = parts[0];
    query = Url.qs.parse(parts[1]);
  }

  // will either clear the path and query or set it to the path and query from the ref path
  uri.set('pathname', refPath || '');
  uri.set('query', query);

  return uri.toString();
}
