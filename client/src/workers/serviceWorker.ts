export const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  // TODO: Register the service worker with caching and sync logic.
};

export const unregisterServiceWorker = async (): Promise<void> => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
};
