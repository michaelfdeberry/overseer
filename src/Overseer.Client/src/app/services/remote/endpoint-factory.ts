export function endpointFactory(baseEndpoint: string): (...s: any[]) => string {
  return (...segments: any[]) => {
    let endpoint = baseEndpoint;
    segments.forEach((segment) => (endpoint += `/${segment}`));

    return endpoint;
  };
}
