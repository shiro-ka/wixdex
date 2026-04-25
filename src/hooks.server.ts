import { installRedirectShim } from '$lib/server/redirect-shim';

// Must run before any @atproto/oauth-client-node code is loaded.
installRedirectShim();
