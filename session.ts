import { resolveJwt } from './auth';

function takeQueryJwt(): string | null {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('__jwt')?.trim() || null;
  if (params.has('__jwt')) {
    params.delete('__jwt');
    const search = params.toString();
    window.history.replaceState({}, document.title, `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`);
  }
  return value;
}

function postSession(jwt: string) {
  const region = (window.webApplicationManifest as { region?: string } | undefined)?.region;
  return fetch('/aeolus/session', {
    method: 'POST', credentials: 'include',
    headers: { 'x-jwt-token': jwt, 'content-type': 'application/json' },
    body: JSON.stringify(region ? { region } : {}),
  });
}

export type SessionStatus = 'ready' | 'unauthorized' | 'failed';
export async function initSession(): Promise<SessionStatus> {
  const queryJwt = takeQueryJwt();
  const jwt = queryJwt ?? (await resolveJwt().catch(() => null));
  if (!jwt) return 'unauthorized';
  let response = await postSession(jwt);
  if (response.status === 401 && !queryJwt) {
    const retry = await resolveJwt(true).catch(() => null);
    if (retry && retry !== jwt) response = await postSession(retry);
  }
  if (response.ok) return 'ready';
  return response.status === 401 ? 'unauthorized' : 'failed';
}
