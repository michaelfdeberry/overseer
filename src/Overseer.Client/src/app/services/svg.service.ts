export class SvgService {
  private static cache = new Map<string, string>();
  private static fetchCache = new Map<string, Promise<string>>();

  async getSvg(name: string): Promise<string> {
    let svg = SvgService.cache.get(name);

    if (!svg) {
      return await this.fetchSvg(name);
    }

    return svg;
  }

  private fetchSvg(name: string): Promise<string> {
    if (SvgService.fetchCache.has(name)) {
      const promise = SvgService.fetchCache.get(name);
      return new Promise<string>((resolve, reject) => {
        promise?.then(resolve, reject);
      });
    }

    const promise = new Promise<string>((resolve) => {
      fetch(`/images/overseer_${name}.svg`).then((response) => {
        if (response.ok) {
          response.text().then((svg) => {
            SvgService.cache.set(name, svg);
            resolve(svg);
            SvgService.fetchCache.delete(name);
          });
        }
      });
    });

    SvgService.fetchCache.set(name, promise);
    return promise;
  }
}
