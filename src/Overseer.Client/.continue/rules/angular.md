# Overseer UI & Monitoring Component (Angular / TypeScript)

## UI Context

The frontend handles real-time monitoring data (e.g., `heaters`, `machineType`) and must parse data efficiently in the browser.

## Angular & TypeScript Standards

- Use Angular Signals for state management and reactivity instead of RxJS observables where possible.
- Write strict TypeScript. Do not use `any`; define precise interfaces or types for all printer payloads.
- Use standalone components.
- Keep component classes focused on presentation logic and delegate data fetching to services.

## Styling (SCSS / HTML)

- Use standard SCSS variables for thematic consistency.
- Ensure HTML monitoring components are fully responsive across desktop and mobile browsers.
- Utilize Angular's built-in control flow syntax (`@if`, `@for`) in templates.

## Documentation Reference

When generating or refactoring UI code, refer to:

- Angular Signals: https://angular.dev/guide/signals
- Angular Control Flow: https://angular.dev/guide/templates/control-flow
