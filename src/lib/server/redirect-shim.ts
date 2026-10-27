export function installRedirectShim(): void {
  const OrigRequest = globalThis.Request;
  const Patched = new Proxy(OrigRequest, {
    construct(target, args: [RequestInfo, RequestInit?]) {
      const [input, init] = args;
      if (init && init.redirect === 'error') {
        return Reflect.construct(target, [input, { ...init, redirect: 'manual' }]);
      }
      return Reflect.construct(target, args);
    },
  });
  globalThis.Request = Patched as typeof globalThis.Request;
}
