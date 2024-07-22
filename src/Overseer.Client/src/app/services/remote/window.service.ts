// This is only used by the .Net Framework version of signalr
// to access jquery. However in the production build the window
// reference doesn't get loaded if this is in the mono provider file.
// This will end up in the build for the other build types, but that
// shouldn't really be an issue since it's not used.
export class WindowService extends Window {
  $: any;
}
