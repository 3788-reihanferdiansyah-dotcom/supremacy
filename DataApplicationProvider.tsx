import { createAeolusClient } from '@aeolus/data-sdk';
import { AeolusProvider } from '@aeolus/data-sdk/react';
import { FeishuTableProvider, type FeishuTableManifest } from '@aeolus/feishu-table-sdk';
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { initSession, type SessionStatus } from './session';

let sharedClient: ReturnType<typeof createAeolusClient> | null = null;
export function DataApplicationProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => (sharedClient ??= createAeolusClient()));
  const [manifest] = useState(() => window.webApplicationManifest as FeishuTableManifest);
  const [session, setSession] = useState<SessionStatus | null>(null);
  useEffect(() => { let cancelled = false; void initSession().then((s) => !cancelled && setSession(s)); return () => { cancelled = true; }; }, []);
  if (!session) return <Skeleton className="h-screen w-full"  data-aime-component-name="Skeleton"  data-aime-path-name="src/infra/sso/DataApplicationProvider.tsx"  data-aime-column="24"  data-aime-line="15"  data-insp-path="src/infra/sso/DataApplicationProvider.tsx:15:24:Skeleton" />;
  if (session === 'unauthorized') return <Alert variant="destructive" className="m-6" data-aime-component-name="Alert"  data-aime-path-name="src/infra/sso/DataApplicationProvider.tsx"  data-aime-column="42"  data-aime-line="16"  data-insp-path="src/infra/sso/DataApplicationProvider.tsx:16:42:Alert" ><AlertDescription data-aime-component-name="AlertDescription" data-aime-path-name="src/infra/sso/DataApplicationProvider.tsx" data-aime-column="87" data-aime-line="16" data-insp-path="src/infra/sso/DataApplicationProvider.tsx:16:87:AlertDescription">Kredensial akses tidak tersedia. Silakan masuk dan pastikan akun Anda memiliki izin.</AlertDescription></Alert>;
  return <AeolusProvider client={client} data-aime-component-name="AeolusProvider"  data-aime-path-name="src/infra/sso/DataApplicationProvider.tsx"  data-aime-column="10"  data-aime-line="17"  data-insp-path="src/infra/sso/DataApplicationProvider.tsx:17:10:AeolusProvider" ><FeishuTableProvider manifest={manifest} data-aime-component-name="FeishuTableProvider"  data-aime-path-name="src/infra/sso/DataApplicationProvider.tsx"  data-aime-column="42"  data-aime-line="17"  data-insp-path="src/infra/sso/DataApplicationProvider.tsx:17:42:FeishuTableProvider" >{children}</FeishuTableProvider></AeolusProvider>;
}
