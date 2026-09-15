import { DateRangePicker } from '@/components/DateRangePicker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  type RecordRow,
  SEVERITY_META,
  type Severity,
  classifyRecord,
  displayDate,
  isOpenCase,
  toSheetDate,
  topLabels,
} from '@/data/airwaybill';
import { feishuResourceUrl, findBinding, sourceUrl } from '@/lib/sources';
import {
  type FeishuTableSdkErrorInfo,
  useFeishuSheetRange,
} from '@/data/publicSheet';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardPlus,
  LayoutDashboard,
  Menu,
  PackageCheck,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRound,
  X,
} from 'lucide-react';
import React, {
  type FormEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from 'recharts';

const BINDING = 'airwaybillRecords';
const DEFAULT_INPUT_BY = 'Aprianto Aprianto';
const STATUSES = [
  'DNR',
  'Damage',
  'Tercecer',
  'Lost',
  'Investigasi',
  'Aging',
  'SOLVED',
  'Misroute',
  'ready return',
  'return proses',
  'delivery proses',
  'AAH EHC',
];
const SEVERITIES: Severity[] = ['high', 'medium', 'low', 'noAchieve'];
type View = 'overview' | 'breach-alert' | 'input-data';
type ActionMode = 'all' | 'unique' | 'healthy' | 'open';

const NAV: Array<{ id: View; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'breach-alert', label: 'Action Required', icon: ShieldAlert },
  { id: 'input-data', label: 'Input Data', icon: ClipboardPlus },
];

function viewFromHash(): View {
  const hash = window.location.hash.slice(1);
  return NAV.some(item => item.id === hash) ? (hash as View) : 'breach-alert';
}

function apiCode(error?: FeishuTableSdkErrorInfo) {
  const value = Number(error?.code);
  if (value > 0) return value;
  const match = /code=(\d+)/.exec(error?.message ?? '');
  return match ? Number(match[1]) : undefined;
}

function FeishuError({
  error,
  kind = 'read',
  onRetry,
}: {
  error?: FeishuTableSdkErrorInfo;
  kind?: 'read' | 'write';
  onRetry?: () => void;
}) {
  const url = feishuResourceUrl(findBinding(BINDING));
  const message = error?.message ?? '';
  const code = apiCode(error);
  const retry = onRetry ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-3"
      onClick={onRetry}
     data-aime-component-name="Button"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="5"  data-aime-line="123"  data-insp-path="src/routes/page.tsx:123:5:Button" >
      <RefreshCw className="mr-2 h-4 w-4"  data-aime-component-name="RefreshCw"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="7"  data-aime-line="130"  data-insp-path="src/routes/page.tsx:130:7:RefreshCw" />
      {kind === 'write' ? 'Coba simpan lagi' : 'Muat ulang data'}
    </Button>
  ) : null;
  if (/has not authorized Feishu/i.test(message)) {
    return (
      <Alert variant="destructive" data-aime-component-name="Alert"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="7"  data-aime-line="136"  data-insp-path="src/routes/page.tsx:136:7:Alert" >
        <AlertTitle data-aime-component-name="AlertTitle" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="137" data-insp-path="src/routes/page.tsx:137:9:AlertTitle">Otorisasi Lark diperlukan</AlertTitle>
        <AlertDescription data-aime-component-name="AlertDescription" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="138" data-insp-path="src/routes/page.tsx:138:9:AlertDescription">
          Data formulir tetap tersimpan di halaman ini. Berikan izin Lark
          melalui{' '}
          <a
            className="underline"
            href="https://aime.bytedance.net"
            target="_blank"
            rel="noreferrer"
           data-aime-component-name="a"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="141"  data-insp-path="src/routes/page.tsx:141:11:a" >
            Aime
          </a>
          , lalu kembali dan muat ulang halaman. (Kode: LARK-AUTH)
          {retry}
        </AlertDescription>
      </Alert>
    );
  }
  if (code === 91403) {
    return (
      <Alert variant="destructive" data-aime-component-name="Alert"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="7"  data-aime-line="157"  data-insp-path="src/routes/page.tsx:157:7:Alert" >
        <AlertTitle data-aime-component-name="AlertTitle" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="158" data-insp-path="src/routes/page.tsx:158:9:AlertTitle">
          {kind === 'write'
            ? 'Tidak memiliki izin edit'
            : 'Tidak memiliki izin file'}
        </AlertTitle>
        <AlertDescription data-aime-component-name="AlertDescription" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="163" data-insp-path="src/routes/page.tsx:163:9:AlertDescription">
          {kind === 'write'
            ? 'Anda dapat membaca sheet, tetapi Lark menolak perubahan. Minta izin edit melalui '
            : 'Ajukan akses melalui '}
          <a className="underline" href={url} target="_blank" rel="noreferrer" data-aime-component-name="a"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="167"  data-insp-path="src/routes/page.tsx:167:11:a" >
            sheet asli
          </a>
          , lalu coba kembali. (Kode: LARK-91403)
          {retry}
        </AlertDescription>
      </Alert>
    );
  }
  if (/missing (bitable|spreadsheet) binding/i.test(message)) {
    return (
      <Alert variant="destructive" data-aime-component-name="Alert"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="7"  data-aime-line="178"  data-insp-path="src/routes/page.tsx:178:7:Alert" >
        <AlertTitle data-aime-component-name="AlertTitle" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="179" data-insp-path="src/routes/page.tsx:179:9:AlertTitle">Konfigurasi sumber data belum aktif</AlertTitle>
        <AlertDescription data-aime-component-name="AlertDescription" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="180" data-insp-path="src/routes/page.tsx:180:9:AlertDescription">
          Binding sheet tidak terkirim ke layanan data. (Kode: SDK-BINDING)
          {retry}
        </AlertDescription>
      </Alert>
    );
  }
  if (error?.code === 'SHEET-FULL') {
    return (
      <Alert variant="destructive" data-aime-component-name="Alert"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="7"  data-aime-line="189"  data-insp-path="src/routes/page.tsx:189:7:Alert" >
        <AlertTitle data-aime-component-name="AlertTitle" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="190" data-insp-path="src/routes/page.tsx:190:9:AlertTitle">Sheet sudah penuh</AlertTitle>
        <AlertDescription data-aime-component-name="AlertDescription" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="191" data-insp-path="src/routes/page.tsx:191:9:AlertDescription">
          Tidak ada baris kosong di dalam rentang A1:E177. Tambahkan baris pada
          sheet asli, lalu muat ulang halaman. (Kode: SHEET-FULL)
          {retry}
        </AlertDescription>
      </Alert>
    );
  }
  if (/HTTP 404/i.test(message)) {
    return (
      <Alert variant="destructive" data-aime-component-name="Alert"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="7"  data-aime-line="201"  data-insp-path="src/routes/page.tsx:201:7:Alert" >
        <AlertTitle data-aime-component-name="AlertTitle" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="202" data-insp-path="src/routes/page.tsx:202:9:AlertTitle">Layanan simpan tidak tersedia</AlertTitle>
        <AlertDescription data-aime-component-name="AlertDescription" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="203" data-insp-path="src/routes/page.tsx:203:9:AlertDescription">
          Data belum dikirim karena endpoint penulisan tidak tersedia. Formulir
          tetap utuh; coba muat ulang atau hubungi pengelola Aime dengan kode
          SDK-WRITE-404.
          {retry}
        </AlertDescription>
      </Alert>
    );
  }
  const safeCode = code
    ? `LARK-${code}`
    : kind === 'write'
      ? 'WRITE-UNKNOWN'
      : 'READ-UNKNOWN';
  return (
    <Alert variant="destructive" data-aime-component-name="Alert"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="5"  data-aime-line="218"  data-insp-path="src/routes/page.tsx:218:5:Alert" >
      <AlertTitle data-aime-component-name="AlertTitle" data-aime-path-name="src/routes/page.tsx" data-aime-column="7" data-aime-line="219" data-insp-path="src/routes/page.tsx:219:7:AlertTitle">
        {kind === 'write' ? 'Data belum tersimpan' : 'Data gagal dimuat'}
      </AlertTitle>
      <AlertDescription data-aime-component-name="AlertDescription" data-aime-path-name="src/routes/page.tsx" data-aime-column="7" data-aime-line="222" data-insp-path="src/routes/page.tsx:222:7:AlertDescription">
        {kind === 'write'
          ? 'Formulir tetap utuh. Periksa koneksi lalu coba simpan lagi.'
          : 'Data terakhir tidak tersedia. Periksa koneksi lalu muat ulang.'}{' '}
        (Kode: {safeCode}){retry}
      </AlertDescription>
    </Alert>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const styles = {
    high: { borderColor: '#166534', background: '#CEE36B', color: '#14532D' },
    medium: { borderColor: '#5B21B6', background: '#E9D5FF', color: '#4C1D95' },
    low: { borderColor: '#92400E', background: '#FEF3C7', color: '#78350F' },
    noAchieve: {
      borderColor: '#9F1239',
      background: '#FCE7F3',
      color: '#881337',
    },
  };
  return (
    <Badge variant="outline" className="font-bold" style={styles[severity]} data-aime-component-name="Badge"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="5"  data-aime-line="244"  data-insp-path="src/routes/page.tsx:244:5:Badge" >
      {SEVERITY_META[severity].label}
    </Badge>
  );
}

function Kpi({
  label,
  value,
  note,
  icon: Icon,
  onActivate,
}: {
  label: string;
  value: number;
  note: string;
  icon: typeof LayoutDashboard;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label={`${label}: ${value.toLocaleString('id-ID')}. ${note}`}
      className="min-w-0 rounded-xl text-left outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
     data-aime-component-name="button"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="5"  data-aime-line="264"  data-insp-path="src/routes/page.tsx:264:5:button" >
      <Card className="h-full min-w-0 cursor-pointer border-sky-200 bg-white/92 backdrop-blur-sm text-slate-900 transition-colors hover:border-violet-400/60 hover:bg-gradient-to-br hover:from-violet-950/50 hover:to-blue-950/50" data-aime-component-name="Card"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="7"  data-aime-line="270"  data-insp-path="src/routes/page.tsx:270:7:Card" >
        <CardHeader className="flex flex-row items-center justify-between pb-2" data-aime-component-name="CardHeader"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="9"  data-aime-line="271"  data-insp-path="src/routes/page.tsx:271:9:CardHeader" >
          <CardDescription className="text-slate-600" data-aime-component-name="CardDescription"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="272"  data-insp-path="src/routes/page.tsx:272:11:CardDescription" >{label}</CardDescription>
          <Icon className="h-4 w-4 text-violet-400" aria-hidden="true"  data-aime-component-name="Icon"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="273"  data-insp-path="src/routes/page.tsx:273:11:Icon" />
        </CardHeader>
        <CardContent data-aime-component-name="CardContent" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="275" data-insp-path="src/routes/page.tsx:275:9:CardContent">
          <div className="text-3xl font-semibold" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="276"  data-insp-path="src/routes/page.tsx:276:11:div" >
            {value.toLocaleString('id-ID')}
          </div>
          <p className="mt-1 text-xs text-slate-600" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="279"  data-insp-path="src/routes/page.tsx:279:11:p" >{note}</p>
        </CardContent>
      </Card>
    </button>
  );
}

function DataTable({
  rows,
  title,
  description,
  onSave,
}: {
  rows: RecordRow[];
  title: string;
  description: string;
  onSave?: (
    row: RecordRow,
    values: Pick<RecordRow, 'status' | 'reason' | 'inputBy'>,
  ) => Promise<void>;
}) {
  const [editing, setEditing] = useState<RecordRow | null>(null);
  const [draft, setDraft] = useState({ status: '', reason: '', inputBy: '' });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);

  function startEditing(row: RecordRow) {
    setEditing(row);
    setDraft({ status: row.status, reason: row.reason, inputBy: row.inputBy });
    setFeedback(null);
  }

  async function saveEditing() {
    if (!editing || !onSave || saving) return;
    setSaving(true);
    setFeedback(null);
    try {
      await onSave(editing, draft);
      setEditing(null);
      setFeedback({ kind: 'success', message: 'Perubahan berhasil disimpan.' });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message:
          error instanceof Error ? error.message : 'Perubahan gagal disimpan.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      data-source-ids={BINDING}
      className="min-w-0 border-sky-200 bg-white/92 backdrop-blur-sm text-slate-900"
     data-aime-component-name="Card"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="5"  data-aime-line="334"  data-insp-path="src/routes/page.tsx:334:5:Card" >
      <CardHeader data-aime-component-name="CardHeader" data-aime-path-name="src/routes/page.tsx" data-aime-column="7" data-aime-line="338" data-insp-path="src/routes/page.tsx:338:7:CardHeader">
        <CardTitle data-aime-component-name="CardTitle" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="339" data-insp-path="src/routes/page.tsx:339:9:CardTitle">{title}</CardTitle>
        <CardDescription className="text-slate-600" data-aime-component-name="CardDescription"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="9"  data-aime-line="340"  data-insp-path="src/routes/page.tsx:340:9:CardDescription" >
          {description}
        </CardDescription>
        {feedback && (
          <output
            className={`text-sm ${feedback.kind === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}
           data-aime-component-name="output"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="344"  data-insp-path="src/routes/page.tsx:344:11:output" >
            {feedback.message}
          </output>
        )}
      </CardHeader>
      <CardContent className="overflow-x-auto" data-aime-component-name="CardContent"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="7"  data-aime-line="351"  data-insp-path="src/routes/page.tsx:351:7:CardContent" >
        <Table data-aime-component-name="Table" data-aime-path-name="src/routes/page.tsx" data-aime-column="9" data-aime-line="352" data-insp-path="src/routes/page.tsx:352:9:Table">
          <TableHeader data-aime-component-name="TableHeader" data-aime-path-name="src/routes/page.tsx" data-aime-column="11" data-aime-line="353" data-insp-path="src/routes/page.tsx:353:11:TableHeader">
            <TableRow className="border-slate-800 hover:bg-transparent" data-aime-component-name="TableRow"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="354"  data-insp-path="src/routes/page.tsx:354:13:TableRow" >
              <TableHead className="text-slate-600" data-aime-component-name="TableHead"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="355"  data-insp-path="src/routes/page.tsx:355:15:TableHead" >Tanggal</TableHead>
              <TableHead className="text-slate-600" data-aime-component-name="TableHead"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="356"  data-insp-path="src/routes/page.tsx:356:15:TableHead" >Airwaybill</TableHead>
              <TableHead className="text-slate-600" data-aime-component-name="TableHead"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="357"  data-insp-path="src/routes/page.tsx:357:15:TableHead" >Status</TableHead>
              <TableHead className="text-slate-600" data-aime-component-name="TableHead"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="358"  data-insp-path="src/routes/page.tsx:358:15:TableHead" >Alasan</TableHead>
              <TableHead className="whitespace-nowrap text-slate-600" data-aime-component-name="TableHead"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="359"  data-insp-path="src/routes/page.tsx:359:15:TableHead" >
                Input By
              </TableHead>
              <TableHead className="text-slate-600" data-aime-component-name="TableHead"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="362"  data-insp-path="src/routes/page.tsx:362:15:TableHead" >Klasifikasi</TableHead>
              {onSave && <TableHead className="text-slate-600" data-aime-component-name="TableHead"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="26"  data-aime-line="363"  data-insp-path="src/routes/page.tsx:363:26:TableHead" >Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody data-aime-component-name="TableBody" data-aime-path-name="src/routes/page.tsx" data-aime-column="11" data-aime-line="366" data-insp-path="src/routes/page.tsx:366:11:TableBody">
            {rows.length ? (
              rows.map(row => {
                const severity = classifyRecord(row);
                const isEditing = editing?.rowIndex === row.rowIndex;
                return (
                  <TableRow
                    key={`${row.rowIndex}-${row.airwaybill}`}
                    className="border-slate-800 hover:bg-slate-800/50"
                   data-aime-component-name="TableRow"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="19"  data-aime-line="372"  data-insp-path="src/routes/page.tsx:372:19:TableRow" >
                    <TableCell className="whitespace-nowrap text-slate-500" data-aime-component-name="TableCell"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="376"  data-insp-path="src/routes/page.tsx:376:21:TableCell" >
                      {row.date || '—'}
                    </TableCell>
                    <TableCell className="font-medium" data-aime-component-name="TableCell"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="379"  data-insp-path="src/routes/page.tsx:379:21:TableCell" >
                      {row.airwaybill || '—'}
                    </TableCell>
                    <TableCell data-aime-component-name="TableCell" data-aime-path-name="src/routes/page.tsx" data-aime-column="21" data-aime-line="382" data-insp-path="src/routes/page.tsx:382:21:TableCell">
                      {isEditing ? (
                        <select
                          aria-label={`Status ${row.airwaybill}`}
                          className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
                          value={draft.status}
                          onChange={event =>
                            setDraft(value => ({
                              ...value,
                              status: event.target.value,
                            }))
                          }
                         data-aime-component-name="select"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="384"  data-insp-path="src/routes/page.tsx:384:25:select" >
                          <option value="" data-aime-component-name="option"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="27"  data-aime-line="395"  data-insp-path="src/routes/page.tsx:395:27:option" >Pilih status</option>
                          {STATUSES.map(item => (
                            <option key={item} data-aime-component-name="option"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="29"  data-aime-line="397"  data-insp-path="src/routes/page.tsx:397:29:option" >{item}</option>
                          ))}
                        </select>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-slate-700 text-slate-600"
                         data-aime-component-name="Badge"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="401"  data-insp-path="src/routes/page.tsx:401:25:Badge" >
                          {row.status || '—'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="min-w-56 text-slate-500" data-aime-component-name="TableCell"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="409"  data-insp-path="src/routes/page.tsx:409:21:TableCell" >
                      {isEditing ? (
                        <Input
                          aria-label={`Alasan ${row.airwaybill}`}
                          className="border-slate-200 bg-white"
                          value={draft.reason}
                          onChange={event =>
                            setDraft(value => ({
                              ...value,
                              reason: event.target.value,
                            }))
                          }
                         data-aime-component-name="Input"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="411"  data-insp-path="src/routes/page.tsx:411:25:Input" />
                      ) : (
                        row.reason || '—'
                      )}
                    </TableCell>
                    <TableCell className="min-w-44 text-slate-500" data-aime-component-name="TableCell"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="426"  data-insp-path="src/routes/page.tsx:426:21:TableCell" >
                      {isEditing ? (
                        <Input
                          aria-label={`Input By ${row.airwaybill}`}
                          className="border-slate-200 bg-white"
                          value={draft.inputBy}
                          onChange={event =>
                            setDraft(value => ({
                              ...value,
                              inputBy: event.target.value,
                            }))
                          }
                         data-aime-component-name="Input"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="428"  data-insp-path="src/routes/page.tsx:428:25:Input" />
                      ) : (
                        row.inputBy || '-'
                      )}
                    </TableCell>
                    <TableCell data-aime-component-name="TableCell" data-aime-path-name="src/routes/page.tsx" data-aime-column="21" data-aime-line="443" data-insp-path="src/routes/page.tsx:443:21:TableCell">
                      <SeverityBadge severity={severity}  data-aime-component-name="SeverityBadge"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="444"  data-insp-path="src/routes/page.tsx:444:23:SeverityBadge" />
                    </TableCell>
                    {onSave && (
                      <TableCell data-aime-component-name="TableCell" data-aime-path-name="src/routes/page.tsx" data-aime-column="23" data-aime-line="447" data-insp-path="src/routes/page.tsx:447:23:TableCell">
                        {isEditing ? (
                          <div className="flex gap-2" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="27"  data-aime-line="449"  data-insp-path="src/routes/page.tsx:449:27:div" >
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-400 hover:to-cyan-400"
                              onClick={() => void saveEditing()}
                              disabled={saving}
                             data-aime-component-name="Button"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="29"  data-aime-line="450"  data-insp-path="src/routes/page.tsx:450:29:Button" >
                              {saving ? 'Menyimpan…' : 'Simpan'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-sky-300/60 bg-white text-sky-900 hover:bg-sky-50 hover:text-sky-900"
                              onClick={() => setEditing(null)}
                              disabled={saving}
                             data-aime-component-name="Button"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="29"  data-aime-line="458"  data-insp-path="src/routes/page.tsx:458:29:Button" >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-sky-300/60 bg-white text-sky-900 hover:bg-sky-50 hover:text-sky-900"
                            onClick={() => startEditing(row)}
                           data-aime-component-name="Button"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="27"  data-aime-line="469"  data-insp-path="src/routes/page.tsx:469:27:Button" >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="border-slate-800" data-aime-component-name="TableRow"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="484"  data-insp-path="src/routes/page.tsx:484:15:TableRow" >
                <TableCell
                  colSpan={onSave ? 7 : 6}
                  className="h-24 text-center text-slate-600"
                 data-aime-component-name="TableCell"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="485"  data-insp-path="src/routes/page.tsx:485:17:TableCell" >
                  Tidak ada catatan yang sesuai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BreachCard({ records }: { records: RecordRow[] }) {
  const counts = Object.fromEntries(
    SEVERITIES.map(severity => [
      severity,
      records.filter(row => classifyRecord(row) === severity).length,
    ]),
  ) as Record<Severity, number>;
  const healthy = counts.high;
  const score = records.length ? healthy / records.length : 0;
  const health =
    score >= 0.7
      ? { label: 'On Track', className: 'bg-sky-500' }
      : score >= 0.4
        ? { label: 'Needs Push', className: 'bg-amber-500' }
        : { label: 'Critical', className: 'bg-rose-500' };
  const strong = topLabels(records, ['high']);
  const medium = topLabels(records, ['medium']);
  const watch = topLabels(records, ['low', 'noAchieve']);
  return (
    <Card
      data-source-ids={BINDING}
      className="border-sky-200 bg-[linear-gradient(145deg,rgba(255,255,255,.98),rgba(239,246,255,.95))] shadow-[0_18px_48px_rgba(14,116,144,.12)] backdrop-blur-sm text-slate-900"
     data-aime-component-name="Card"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="5"  data-aime-line="519"  data-insp-path="src/routes/page.tsx:519:5:Card" >
      <CardHeader className="pb-4" data-aime-component-name="CardHeader"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="7"  data-aime-line="523"  data-insp-path="src/routes/page.tsx:523:7:CardHeader" >
        <div className="flex items-start justify-between gap-4" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="9"  data-aime-line="524"  data-insp-path="src/routes/page.tsx:524:9:div" >
          <div data-aime-component-name="div" data-aime-path-name="src/routes/page.tsx" data-aime-column="11" data-aime-line="525" data-insp-path="src/routes/page.tsx:525:11:div">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="526"  data-insp-path="src/routes/page.tsx:526:13:p" >
              Jakarta Timur · Operasional
            </p>
            <CardTitle className="mt-2 text-xl" data-aime-component-name="CardTitle"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="529"  data-insp-path="src/routes/page.tsx:529:13:CardTitle" >Duren Sawit</CardTitle>
          </div>
          <div className="text-right" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="531"  data-insp-path="src/routes/page.tsx:531:11:div" >
            <Badge className={`${health.className} border-0 text-white`} data-aime-component-name="Badge"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="532"  data-insp-path="src/routes/page.tsx:532:13:Badge" >
              {health.label}
            </Badge>
            <p className="mt-2 text-2xl font-semibold" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="535"  data-insp-path="src/routes/page.tsx:535:13:p" >
              {healthy}/{records.length}
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="9"  data-aime-line="540"  data-insp-path="src/routes/page.tsx:540:9:div" >
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
            style={{ width: `${score * 100}%` }}
           data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="541"  data-insp-path="src/routes/page.tsx:541:11:div" />
        </div>
      </CardHeader>
      <CardContent data-aime-component-name="CardContent" data-aime-path-name="src/routes/page.tsx" data-aime-column="7" data-aime-line="547" data-insp-path="src/routes/page.tsx:547:7:CardContent">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="9"  data-aime-line="548"  data-insp-path="src/routes/page.tsx:548:9:div" >
          {SEVERITIES.map(severity => (
            <div
              key={severity}
              className={`rounded-xl border px-3 py-3 text-center font-bold ${severity === 'high' ? 'border-[#166534] bg-[#CEE36B] text-[#14532D]' : severity === 'medium' ? 'border-[#5B21B6] bg-[#E9D5FF] text-[#4C1D95]' : severity === 'low' ? 'border-[#92400E] bg-[#FEF3C7] text-[#78350F]' : 'border-[#9F1239] bg-[#FCE7F3] text-[#881337]'}`}
             data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="550"  data-insp-path="src/routes/page.tsx:550:13:div" >
              <p className="text-base font-semibold" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="554"  data-insp-path="src/routes/page.tsx:554:15:p" >{counts[severity]}</p>
              <p className="text-xs" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="555"  data-insp-path="src/routes/page.tsx:555:15:p" >{SEVERITY_META[severity].label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="9"  data-aime-line="559"  data-insp-path="src/routes/page.tsx:559:9:div" >
          <p className="rounded-xl border border-black/10 bg-[#F6F7F5] p-4 text-sm font-semibold text-[#1B1A1B]" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="560"  data-insp-path="src/routes/page.tsx:560:11:p" >
            <span className="font-bold text-[#166534]" data-aime-component-name="span"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="561"  data-insp-path="src/routes/page.tsx:561:13:span" >Strong:</span>{' '}
            {strong.join(', ') || 'Belum ada kondisi selesai'}
          </p>
          <p className="rounded-xl border border-black/10 bg-[#F6F7F5] p-4 text-sm font-semibold text-[#1B1A1B]" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="564"  data-insp-path="src/routes/page.tsx:564:11:p" >
            <span className="font-bold text-[#5B21B6]" data-aime-component-name="span"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="565"  data-insp-path="src/routes/page.tsx:565:13:span" >Medium:</span>{' '}
            {medium.join(', ') || 'Tidak ada proses aktif'}
          </p>
          <p className="rounded-xl border border-black/10 bg-[#F6F7F5] p-4 text-sm font-semibold text-[#1B1A1B] md:col-span-2 md:mx-auto md:w-1/2" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="568"  data-insp-path="src/routes/page.tsx:568:11:p" >
            <span className="font-bold text-[#9F1239]" data-aime-component-name="span"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="569"  data-insp-path="src/routes/page.tsx:569:13:span" >Watch:</span>{' '}
            {watch.join(', ') || 'Tidak ada kasus mendesak'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const sheet = useFeishuSheetRange({ bindingId: BINDING, range: 'A1:E177' });
  const [view, setView] = useState<View>(() => viewFromHash());
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [actionMode, setActionMode] = useState<ActionMode>('open');
  const inputFormRef = useRef<HTMLFormElement>(null);
  const pendingScrollPosition = useRef<{ x: number; y: number } | null>(null);
  const [date, setDate] = useState('');
  const [airwaybill, setAirwaybill] = useState('');
  const [status, setStatus] = useState('');
  const [inputBy, setInputBy] = useState(DEFAULT_INPUT_BY);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [writeError, setWriteError] = useState<FeishuTableSdkErrorInfo>();

  useEffect(() => {
    if (!window.location.hash)
      window.history.replaceState(null, '', '#breach-alert');
    const syncViewFromUrl = () => setView(viewFromHash());
    window.addEventListener('popstate', syncViewFromUrl);
    window.addEventListener('hashchange', syncViewFromUrl);
    return () => {
      window.removeEventListener('popstate', syncViewFromUrl);
      window.removeEventListener('hashchange', syncViewFromUrl);
    };
  }, []);

  useLayoutEffect(() => {
    const position = pendingScrollPosition.current;
    if (!position) return;
    window.scrollTo(position.x, position.y);
    pendingScrollPosition.current = null;
  }, [view]);

  const records = useMemo<RecordRow[]>(() => {
    const raw = sheet.data?.rawValues ?? [];
    const header = raw[0]?.map(value =>
      String(value ?? '')
        .trim()
        .toLowerCase(),
    );
    const start =
      header?.[0] === 'date' && header?.[1] === 'airwaybill' ? 1 : 0;
    return raw
      .slice(start)
      .map((row, index) => ({
        rowIndex: index + start + 1,
        date: displayDate(row[0]),
        airwaybill: String(row[1] ?? '').trim(),
        status: String(row[2] ?? '').trim(),
        reason: String(row[3] ?? '').trim(),
        inputBy: String(row[4] ?? '').trim(),
      }))
      .filter(
        row =>
          row.date || row.airwaybill || row.status || row.reason || row.inputBy,
      );
  }, [sheet.data]);

  const openCases = useMemo(
    () => records.filter(isOpenCase).slice().reverse(),
    [records],
  );
  const distribution = useMemo(
    () =>
      Object.entries(
        records.reduce<Record<string, number>>((acc, row) => {
          const key = row.status || 'Tanpa status';
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {}),
      )
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    [records],
  );
  const overviewRows = useMemo(() => records.slice().reverse(), [records]);
  const actionRows = useMemo(() => {
    if (actionMode === 'open') return openCases;

    const newestFirst = records.slice().reverse();
    if (actionMode === 'healthy') {
      return newestFirst.filter(row => classifyRecord(row) === 'high');
    }
    if (actionMode === 'unique') {
      const seen = new Set<string>();
      return newestFirst.filter(row => {
        if (!row.airwaybill || seen.has(row.airwaybill)) return false;
        seen.add(row.airwaybill);
        return true;
      });
    }
    return newestFirst;
  }, [actionMode, openCases, records]);
  const filteredActionRows = useMemo(
    () =>
      actionRows.filter(
        row =>
          (statusFilter === 'Semua' || row.status === statusFilter) &&
          `${row.date} ${row.airwaybill} ${row.status} ${row.reason} ${row.inputBy}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [actionRows, query, statusFilter],
  );
  const actionModeCopy: Record<
    ActionMode,
    { title: string; description: string }
  > = {
    all: {
      title: 'Total catatan',
      description: 'Semua catatan terbaru dari Duren Sawit!A1:E177.',
    },
    unique: {
      title: 'Airwaybill unik',
      description: 'Satu catatan terbaru untuk setiap nomor airwaybill.',
    },
    healthy: {
      title: 'Kondisi sehat',
      description: 'Catatan berstatus SOLVED atau ready return.',
    },
    open: {
      title: 'Action Required',
      description: 'Kasus belum sehat yang memerlukan tindak lanjut.',
    },
  };
  const solved = records.filter(row => classifyRecord(row) === 'high').length;
  const unique = new Set(records.map(row => row.airwaybill).filter(Boolean))
    .size;

  function navigate(next: View) {
    const nextHash = `#${next}`;

    pendingScrollPosition.current = { x: window.scrollX, y: window.scrollY };
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', nextHash);
    }
    setView(next);
    setMenuOpen(false);
  }

  function showActionMode(mode: ActionMode) {
    setActionMode(mode);
    navigate('breach-alert');
  }

  async function updateRecord(
    row: RecordRow,
    values: Pick<RecordRow, 'status' | 'reason' | 'inputBy'>,
  ) {
    await sheet.updateRange({
      range: `C${row.rowIndex}:E${row.rowIndex}`,
      values: [[values.status, values.reason.trim(), values.inputBy.trim()]],
    });
    await sheet.reload();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (
      submitting ||
      !date ||
      !airwaybill.trim() ||
      !status ||
      !inputBy.trim() ||
      !reason.trim()
    )
      return;
    setSubmitting(true);
    setSaved(false);
    setWriteError(undefined);
    try {
      const raw = sheet.data?.rawValues ?? [];
      const lastUsedIndex = raw.reduce(
        (last, row, index) =>
          row.some(value => String(value ?? '').trim()) ? index : last,
        -1,
      );
      const targetRow = lastUsedIndex + 2;
      if (targetRow > 177) {
        setWriteError({
          code: 'SHEET-FULL',
          message: 'No empty row is available inside the bound range.',
        });
        return;
      }
      await sheet.updateRange({
        range: `A${targetRow}:E${targetRow}`,
        values: [
          [
            toSheetDate(date),
            airwaybill.trim(),
            status,
            reason.trim(),
            inputBy.trim(),
          ],
        ],
      });
      setDate('');
      setAirwaybill('');
      setStatus('');
      setInputBy(DEFAULT_INPUT_BY);
      setReason('');
      setSaved(true);
    } catch (error) {
      const value = error as { message?: string; code?: string };
      setWriteError({
        message: value.message ?? 'Submit gagal',
        code: value.code,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const isLoading =
    sheet.status === 'idle' || (sheet.status === 'loading' && !sheet.data);
  const titles: Record<View, { title: string; subtitle: string }> = {
    overview: {
      title: 'Overview',
      subtitle: 'Ringkasan status validasi airwaybill Duren Sawit.',
    },
    'breach-alert': {
      title: 'Action Required',
      subtitle: 'Kasus belum sehat yang memerlukan tindak lanjut.',
    },
    'input-data': {
      title: 'Input Data',
      subtitle: 'Tambahkan catatan baru langsung ke sheet Duren Sawit.',
    },
  };

  return (
    <div className="min-h-screen bg-[#C2C6C9] text-[#1B1A1B]" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="5"  data-aime-line="814"  data-insp-path="src/routes/page.tsx:814:5:div" >
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-[#1B1A1B] p-5 text-[#F6F7F5] shadow-[18px_0_60px_rgba(0,0,0,.20)] transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
       data-aime-component-name="aside"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="7"  data-aime-line="815"  data-insp-path="src/routes/page.tsx:815:7:aside" >
        <div className="flex h-full flex-col" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="9"  data-aime-line="818"  data-insp-path="src/routes/page.tsx:818:9:div" >
          <div className="rounded-2xl border border-sky-200 bg-white/90 p-4 shadow-[0_14px_40px_rgba(14,116,144,.10)] backdrop-blur-sm" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="819"  data-insp-path="src/routes/page.tsx:819:11:div" >
            <div className="flex items-center gap-3" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="820"  data-insp-path="src/routes/page.tsx:820:13:div" >
              <div className="rounded-xl bg-gradient-to-br from-sky-100 to-cyan-100 p-2 text-sky-700" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="821"  data-insp-path="src/routes/page.tsx:821:15:div" >
                <BarChart3 className="h-6 w-6"  data-aime-component-name="BarChart3"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="822"  data-insp-path="src/routes/page.tsx:822:17:BarChart3" />
              </div>
              <div data-aime-component-name="div" data-aime-path-name="src/routes/page.tsx" data-aime-column="15" data-aime-line="824" data-insp-path="src/routes/page.tsx:824:15:div">
                <p className="text-sm font-semibold text-slate-900" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="825"  data-insp-path="src/routes/page.tsx:825:17:p" >
                  Dashboard Workspace
                </p>
                <p className="mt-0.5 text-xs text-slate-500" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="828"  data-insp-path="src/routes/page.tsx:828:17:p" >
                  Validasi Airwaybill
                </p>
              </div>
            </div>
          </div>
          <nav className="mt-7 space-y-2" data-aime-component-name="nav"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="834"  data-insp-path="src/routes/page.tsx:834:11:nav" >
            {NAV.map(item => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${active ? 'border border-[#CEE36B] bg-[#CEE36B] text-[#1B1A1B] shadow-[0_10px_26px_rgba(206,227,107,.18)]' : 'text-[#C2C6C9] hover:bg-[#AE7EFD] hover:text-[#1B1A1B]'}`}
                 data-aime-component-name="button"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="839"  data-insp-path="src/routes/page.tsx:839:17:button" >
                  <Icon className="h-4 w-4"  data-aime-component-name="Icon"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="19"  data-aime-line="845"  data-insp-path="src/routes/page.tsx:845:19:Icon" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="851"  data-insp-path="src/routes/page.tsx:851:11:div" >
            <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-[linear-gradient(90deg,#f8fcff,#e0f2fe)] p-3" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="852"  data-insp-path="src/routes/page.tsx:852:13:div" >
              <div className="rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 p-2 text-white" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="853"  data-insp-path="src/routes/page.tsx:853:15:div" >
                <UserRound className="h-4 w-4"  data-aime-component-name="UserRound"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="854"  data-insp-path="src/routes/page.tsx:854:17:UserRound" />
              </div>
              <p className="truncate text-sm font-medium text-slate-700" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="856"  data-insp-path="src/routes/page.tsx:856:15:p" >
                Made by love
              </p>
            </div>
          </div>
        </div>
      </aside>
      {menuOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMenuOpen(false)}
         data-aime-component-name="button"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="9"  data-aime-line="864"  data-insp-path="src/routes/page.tsx:864:9:button" />
      )}
      <main className="min-h-screen lg:pl-72" data-aime-component-name="main"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="7"  data-aime-line="871"  data-insp-path="src/routes/page.tsx:871:7:main" >
        <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="9"  data-aime-line="872"  data-insp-path="src/routes/page.tsx:872:9:div" >
          <header className="mb-7" data-aime-component-name="header"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="873"  data-insp-path="src/routes/page.tsx:873:11:header" >
            <div className="flex items-start gap-3" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="874"  data-insp-path="src/routes/page.tsx:874:13:div" >
              <Button
                variant="outline"
                size="icon"
                className="border-sky-200 bg-white text-slate-700 shadow-sm lg:hidden"
                onClick={() => setMenuOpen(value => !value)}
               data-aime-component-name="Button"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="875"  data-insp-path="src/routes/page.tsx:875:15:Button" >
                {menuOpen ? <X  data-aime-component-name="X" data-aime-path-name="src/routes/page.tsx" data-aime-column="29" data-aime-line="881" data-insp-path="src/routes/page.tsx:881:29:X"/> : <Menu  data-aime-component-name="Menu" data-aime-path-name="src/routes/page.tsx" data-aime-column="37" data-aime-line="881" data-insp-path="src/routes/page.tsx:881:37:Menu"/>}
              </Button>
              <div data-aime-component-name="div" data-aime-path-name="src/routes/page.tsx" data-aime-column="15" data-aime-line="883" data-insp-path="src/routes/page.tsx:883:15:div">
                <p className="bg-gradient-to-r from-sky-700 to-cyan-500 bg-clip-text text-xs font-semibold uppercase tracking-[0.24em] text-transparent" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="884"  data-insp-path="src/routes/page.tsx:884:17:p" >
                  Dashboard Workspace
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900" data-aime-component-name="h1"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="887"  data-insp-path="src/routes/page.tsx:887:17:h1" >
                  {titles[view].title}
                </h1>
                <p className="mt-2 text-sm text-slate-600" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="890"  data-insp-path="src/routes/page.tsx:890:17:p" >
                  {titles[view].subtitle}
                </p>
                <p className="mt-2 text-xs text-slate-500" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="893"  data-insp-path="src/routes/page.tsx:893:17:p" >
                  Dibuat oleh Aprianto Aprianto · Data tersinkron dengan sumber
                  asli:{' '}
                  <a
                    href={sourceUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-sky-400/60 underline-offset-2 hover:text-sky-700"
                   data-aime-component-name="a"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="19"  data-aime-line="896"  data-insp-path="src/routes/page.tsx:896:19:a" >
                    Validation Airwaybill Anomali&apos;s
                  </a>
                </p>
              </div>
            </div>
          </header>
          {isLoading ? (
            <div className="space-y-4" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="909"  data-insp-path="src/routes/page.tsx:909:13:div" >
              <Skeleton className="h-64 bg-slate-800"  data-aime-component-name="Skeleton"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="910"  data-insp-path="src/routes/page.tsx:910:15:Skeleton" />
              <Skeleton className="h-80 bg-slate-800"  data-aime-component-name="Skeleton"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="15"  data-aime-line="911"  data-insp-path="src/routes/page.tsx:911:15:Skeleton" />
            </div>
          ) : sheet.status === 'error' && !sheet.data ? (
            <FeishuError
              error={sheet.error}
              onRetry={() => void sheet.reload()}
             data-aime-component-name="FeishuError"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="13"  data-aime-line="914"  data-insp-path="src/routes/page.tsx:914:13:FeishuError" />
          ) : (
            <>
              {sheet.status === 'error' && (
                <Alert className="mb-4 border-amber-500/30 bg-amber-500/10 text-amber-100" data-aime-component-name="Alert"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="921"  data-insp-path="src/routes/page.tsx:921:17:Alert" >
                  <AlertDescription className="flex flex-wrap items-center gap-3" data-aime-component-name="AlertDescription"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="19"  data-aime-line="922"  data-insp-path="src/routes/page.tsx:922:19:AlertDescription" >
                    <span data-aime-component-name="span" data-aime-path-name="src/routes/page.tsx" data-aime-column="21" data-aime-line="923" data-insp-path="src/routes/page.tsx:923:21:span">
                      Penyegaran gagal; data terakhir tetap ditampilkan.
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void sheet.reload()}
                     data-aime-component-name="Button"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="926"  data-insp-path="src/routes/page.tsx:926:21:Button" >
                      <RefreshCw className="mr-2 h-4 w-4"  data-aime-component-name="RefreshCw"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="932"  data-insp-path="src/routes/page.tsx:932:23:RefreshCw" />
                      Coba lagi
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {view === 'overview' && (
                <div className="space-y-5" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="939"  data-insp-path="src/routes/page.tsx:939:17:div" >
                  <section
                    data-source-ids={BINDING}
                    className="grid grid-cols-2 gap-3 xl:grid-cols-4"
                   data-aime-component-name="section"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="19"  data-aime-line="940"  data-insp-path="src/routes/page.tsx:940:19:section" >
                    <Kpi
                      label="Total catatan"
                      value={records.length}
                      note="Baris anomali tercatat"
                      icon={LayoutDashboard}
                      onActivate={() => showActionMode('all')}
                     data-aime-component-name="Kpi"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="944"  data-insp-path="src/routes/page.tsx:944:21:Kpi" />
                    <Kpi
                      label="Airwaybill unik"
                      value={unique}
                      note="Nomor AWB berbeda"
                      icon={PackageCheck}
                      onActivate={() => showActionMode('unique')}
                     data-aime-component-name="Kpi"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="951"  data-insp-path="src/routes/page.tsx:951:21:Kpi" />
                    <Kpi
                      label="Kondisi sehat"
                      value={solved}
                      note={`${records.length ? Math.round((solved / records.length) * 100) : 0}% dari total`}
                      icon={CheckCircle2}
                      onActivate={() => showActionMode('healthy')}
                     data-aime-component-name="Kpi"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="958"  data-insp-path="src/routes/page.tsx:958:21:Kpi" />
                    <Kpi
                      label="Action Required"
                      value={openCases.length}
                      note="Kasus belum sehat"
                      icon={AlertTriangle}
                      onActivate={() => showActionMode('open')}
                     data-aime-component-name="Kpi"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="965"  data-insp-path="src/routes/page.tsx:965:21:Kpi" />
                  </section>
                  <Card
                    data-source-ids={BINDING}
                    className="min-w-0 border-sky-200 bg-white/92 backdrop-blur-sm text-slate-900"
                   data-aime-component-name="Card"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="19"  data-aime-line="973"  data-insp-path="src/routes/page.tsx:973:19:Card" >
                    <CardHeader data-aime-component-name="CardHeader" data-aime-path-name="src/routes/page.tsx" data-aime-column="21" data-aime-line="977" data-insp-path="src/routes/page.tsx:977:21:CardHeader">
                      <CardTitle data-aime-component-name="CardTitle" data-aime-path-name="src/routes/page.tsx" data-aime-column="23" data-aime-line="978" data-insp-path="src/routes/page.tsx:978:23:CardTitle">
                        {distribution[0]
                          ? `${distribution[0].name} paling dominan dengan ${distribution[0].value} catatan`
                          : 'Distribusi status'}
                      </CardTitle>
                      <CardDescription className="text-slate-600" data-aime-component-name="CardDescription"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="983"  data-insp-path="src/routes/page.tsx:983:23:CardDescription" >
                        Jumlah catatan berdasarkan status aktual di sheet.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="min-w-0" data-aime-component-name="CardContent"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="987"  data-insp-path="src/routes/page.tsx:987:21:CardContent" >
                      <ChartContainer
                        config={{
                          value: { label: 'Jumlah', color: '#22d3ee' },
                        }}
                        className="h-[360px] w-full"
                       data-aime-component-name="ChartContainer"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="988"  data-insp-path="src/routes/page.tsx:988:23:ChartContainer" >
                        <BarChart
                          data={distribution}
                          layout="vertical"
                          margin={{ top: 4, right: 42, bottom: 4, left: 16 }}
                         data-aime-component-name="BarChart"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="994"  data-insp-path="src/routes/page.tsx:994:25:BarChart" >
                          <CartesianGrid horizontal={false} stroke="#1e293b"  data-aime-component-name="CartesianGrid"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="27"  data-aime-line="999"  data-insp-path="src/routes/page.tsx:999:27:CartesianGrid" />
                          <XAxis
                            type="number"
                            domain={[0, 'dataMax']}
                            allowDecimals={false}
                            tick={{ fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                           data-aime-component-name="XAxis"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="27"  data-aime-line="1000"  data-insp-path="src/routes/page.tsx:1000:27:XAxis" />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={115}
                            interval={0}
                            tick={{ fill: '#cbd5e1', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                           data-aime-component-name="YAxis"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="27"  data-aime-line="1008"  data-insp-path="src/routes/page.tsx:1008:27:YAxis" />
                          <Bar
                            dataKey="value"
                            fill="var(--color-value)"
                            radius={[0, 4, 4, 0]}
                           data-aime-component-name="Bar"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="27"  data-aime-line="1017"  data-insp-path="src/routes/page.tsx:1017:27:Bar" >
                            <LabelList
                              dataKey="value"
                              position="right"
                              fill="#e2e8f0"
                             data-aime-component-name="LabelList"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="29"  data-aime-line="1022"  data-insp-path="src/routes/page.tsx:1022:29:LabelList" />
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                  <div
                    aria-label="Tabel catatan Overview"
                    className="rounded-xl"
                   data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="19"  data-aime-line="1032"  data-insp-path="src/routes/page.tsx:1032:19:div" >
                    <DataTable
                      rows={overviewRows}
                      title={`${overviewRows.length} catatan lengkap`}
                      description="Semua catatan terbaru dari Duren Sawit!A1:E177."
                     data-aime-component-name="DataTable"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="1036"  data-insp-path="src/routes/page.tsx:1036:21:DataTable" />
                  </div>
                </div>
              )}
              {view === 'breach-alert' && (
                <div className="space-y-5" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="1045"  data-insp-path="src/routes/page.tsx:1045:17:div" >
                  <BreachCard records={records}  data-aime-component-name="BreachCard"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="19"  data-aime-line="1046"  data-insp-path="src/routes/page.tsx:1046:19:BreachCard" />
                  <Card
                    data-source-ids={BINDING}
                    className="border-sky-200 bg-white/92 backdrop-blur-sm text-slate-900"
                   data-aime-component-name="Card"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="19"  data-aime-line="1047"  data-insp-path="src/routes/page.tsx:1047:19:Card" >
                    <CardHeader data-aime-component-name="CardHeader" data-aime-path-name="src/routes/page.tsx" data-aime-column="21" data-aime-line="1051" data-insp-path="src/routes/page.tsx:1051:21:CardHeader">
                      <CardTitle data-aime-component-name="CardTitle" data-aime-path-name="src/routes/page.tsx" data-aime-column="23" data-aime-line="1052" data-insp-path="src/routes/page.tsx:1052:23:CardTitle">Aturan klasifikasi</CardTitle>
                      <CardDescription className="text-slate-600" data-aime-component-name="CardDescription"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="1053"  data-insp-path="src/routes/page.tsx:1053:23:CardDescription" >
                        Status SOLVED dan ready return selalu sehat; kasus lain
                        dinilai dari kata kunci operasional pada status dan
                        alasan.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" data-aime-component-name="CardContent"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="1059"  data-insp-path="src/routes/page.tsx:1059:21:CardContent" >
                      {SEVERITIES.map(severity => (
                        <div
                          key={severity}
                          className="rounded-xl border border-sky-100 bg-sky-50/80 p-4"
                         data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1061"  data-insp-path="src/routes/page.tsx:1061:25:div" >
                          <SeverityBadge severity={severity}  data-aime-component-name="SeverityBadge"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="27"  data-aime-line="1065"  data-insp-path="src/routes/page.tsx:1065:27:SeverityBadge" />
                          <p className="mt-3 text-sm leading-6 text-slate-600" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="27"  data-aime-line="1066"  data-insp-path="src/routes/page.tsx:1066:27:p" >
                            {SEVERITY_META[severity].description}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="border-sky-200 bg-white/92 backdrop-blur-sm text-slate-900" data-aime-component-name="Card"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="19"  data-aime-line="1073"  data-insp-path="src/routes/page.tsx:1073:19:Card" >
                    <CardHeader data-aime-component-name="CardHeader" data-aime-path-name="src/routes/page.tsx" data-aime-column="21" data-aime-line="1074" data-insp-path="src/routes/page.tsx:1074:21:CardHeader">
                      <CardTitle data-aime-component-name="CardTitle" data-aime-path-name="src/routes/page.tsx" data-aime-column="23" data-aime-line="1075" data-insp-path="src/routes/page.tsx:1075:23:CardTitle">
                        {actionModeCopy[actionMode].title} · {actionRows.length}{' '}
                        catatan
                      </CardTitle>
                      <CardDescription className="text-slate-600" data-aime-component-name="CardDescription"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="1079"  data-insp-path="src/routes/page.tsx:1079:23:CardDescription" >
                        {actionModeCopy[actionMode].description} Cari
                        berdasarkan airwaybill, status, tanggal, atau alasan.
                      </CardDescription>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="1083"  data-insp-path="src/routes/page.tsx:1083:23:div" >
                        <div className="relative flex-1" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1084"  data-insp-path="src/routes/page.tsx:1084:25:div" >
                          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500"  data-aime-component-name="Search"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="27"  data-aime-line="1085"  data-insp-path="src/routes/page.tsx:1085:27:Search" />
                          <Input
                            className="border-slate-200 bg-white pl-9 text-slate-900 placeholder:text-slate-500"
                            value={query}
                            onChange={event => setQuery(event.target.value)}
                            placeholder="Cari catatan…"
                           data-aime-component-name="Input"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="27"  data-aime-line="1086"  data-insp-path="src/routes/page.tsx:1086:27:Input" />
                        </div>
                        <select
                          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600"
                          value={statusFilter}
                          onChange={event =>
                            setStatusFilter(event.target.value)
                          }
                         data-aime-component-name="select"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1093"  data-insp-path="src/routes/page.tsx:1093:25:select" >
                          <option data-aime-component-name="option" data-aime-path-name="src/routes/page.tsx" data-aime-column="27" data-aime-line="1100" data-insp-path="src/routes/page.tsx:1100:27:option">Semua</option>
                          {STATUSES.map(item => (
                            <option key={item} data-aime-component-name="option"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="29"  data-aime-line="1102"  data-insp-path="src/routes/page.tsx:1102:29:option" >{item}</option>
                          ))}
                        </select>
                      </div>
                    </CardHeader>
                  </Card>
                  <div aria-label="Tabel kasus terbuka" className="rounded-xl" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="19"  data-aime-line="1108"  data-insp-path="src/routes/page.tsx:1108:19:div" >
                    <DataTable
                      rows={filteredActionRows.slice(0, 50)}
                      title={`${filteredActionRows.length} catatan · ${actionModeCopy[actionMode].title}`}
                      description={`${actionModeCopy[actionMode].description} Maksimal 50 catatan ditampilkan.`}
                      onSave={updateRecord}
                     data-aime-component-name="DataTable"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="1109"  data-insp-path="src/routes/page.tsx:1109:21:DataTable" />
                  </div>
                </div>
              )}
              {view === 'input-data' && (
                <Card className="max-w-3xl border-sky-200 bg-white/92 backdrop-blur-sm text-slate-900" data-aime-component-name="Card"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="17"  data-aime-line="1119"  data-insp-path="src/routes/page.tsx:1119:17:Card" >
                  <CardHeader data-aime-component-name="CardHeader" data-aime-path-name="src/routes/page.tsx" data-aime-column="19" data-aime-line="1120" data-insp-path="src/routes/page.tsx:1120:19:CardHeader">
                    <CardTitle data-aime-component-name="CardTitle" data-aime-path-name="src/routes/page.tsx" data-aime-column="21" data-aime-line="1121" data-insp-path="src/routes/page.tsx:1121:21:CardTitle">Tambah catatan baru</CardTitle>
                    <CardDescription className="text-slate-600" data-aime-component-name="CardDescription"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="1122"  data-insp-path="src/routes/page.tsx:1122:21:CardDescription" >
                      Input ditambahkan ke kolom Date, Airwaybill, Status,
                      Reason, dan Input By pada sheet Duren Sawit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent data-aime-component-name="CardContent" data-aime-path-name="src/routes/page.tsx" data-aime-column="19" data-aime-line="1127" data-insp-path="src/routes/page.tsx:1127:19:CardContent">
                    <form
                      ref={inputFormRef}
                      onSubmit={submit}
                      className="space-y-5"
                     data-aime-component-name="form"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="21"  data-aime-line="1128"  data-insp-path="src/routes/page.tsx:1128:21:form" >
                      <DateRangePicker date={date} onChange={setDate}  data-aime-component-name="DateRangePicker"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="1133"  data-insp-path="src/routes/page.tsx:1133:23:DateRangePicker" />
                      <div className="space-y-2" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="1134"  data-insp-path="src/routes/page.tsx:1134:23:div" >
                        <Label htmlFor="awb" data-aime-component-name="Label"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1135"  data-insp-path="src/routes/page.tsx:1135:25:Label" >Airwaybill</Label>
                        <Input
                          id="awb"
                          className="border-slate-200 bg-white"
                          value={airwaybill}
                          onChange={event => setAirwaybill(event.target.value)}
                          placeholder="Contoh: GTL..."
                          required
                         data-aime-component-name="Input"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1136"  data-insp-path="src/routes/page.tsx:1136:25:Input" />
                      </div>
                      <div className="space-y-2" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="1145"  data-insp-path="src/routes/page.tsx:1145:23:div" >
                        <Label htmlFor="status" data-aime-component-name="Label"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1146"  data-insp-path="src/routes/page.tsx:1146:25:Label" >Status</Label>
                        <select
                          id="status"
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                          value={status}
                          onChange={event => setStatus(event.target.value)}
                          required
                         data-aime-component-name="select"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1147"  data-insp-path="src/routes/page.tsx:1147:25:select" >
                          <option value="" data-aime-component-name="option"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="27"  data-aime-line="1154"  data-insp-path="src/routes/page.tsx:1154:27:option" >Pilih status</option>
                          {STATUSES.map(item => (
                            <option key={item} data-aime-component-name="option"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="29"  data-aime-line="1156"  data-insp-path="src/routes/page.tsx:1156:29:option" >{item}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="1160"  data-insp-path="src/routes/page.tsx:1160:23:div" >
                        <Label htmlFor="input-by" data-aime-component-name="Label"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1161"  data-insp-path="src/routes/page.tsx:1161:25:Label" >Input By</Label>
                        <Input
                          id="input-by"
                          className="border-violet-400/60 bg-violet-950/40 font-medium text-violet-50 focus-visible:ring-violet-400"
                          value={inputBy}
                          onChange={event => setInputBy(event.target.value)}
                          placeholder="Nama penginput"
                          autoComplete="name"
                          required
                         data-aime-component-name="Input"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1162"  data-insp-path="src/routes/page.tsx:1162:25:Input" />
                        <p className="text-xs text-slate-600" data-aime-component-name="p"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1171"  data-insp-path="src/routes/page.tsx:1171:25:p" >
                          Nama penginput akan disimpan bersama catatan dan dapat
                          diedit.
                        </p>
                      </div>
                      <div className="space-y-2" data-aime-component-name="div"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="1176"  data-insp-path="src/routes/page.tsx:1176:23:div" >
                        <Label htmlFor="reason" data-aime-component-name="Label"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1177"  data-insp-path="src/routes/page.tsx:1177:25:Label" >Alasan / keterangan</Label>
                        <Textarea
                          id="reason"
                          className="min-h-28 border-slate-200 bg-white"
                          value={reason}
                          onChange={event => setReason(event.target.value)}
                          placeholder="Tuliskan alasan atau progres"
                          required
                         data-aime-component-name="Textarea"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1178"  data-insp-path="src/routes/page.tsx:1178:25:Textarea" />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-950/30 hover:from-violet-400 hover:to-blue-400"
                        disabled={
                          submitting ||
                          !date ||
                          !airwaybill.trim() ||
                          !status ||
                          !inputBy.trim() ||
                          !reason.trim()
                        }
                       data-aime-component-name="Button"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="23"  data-aime-line="1187"  data-insp-path="src/routes/page.tsx:1187:23:Button" >
                        <PlusCircle className="mr-2 h-4 w-4"  data-aime-component-name="PlusCircle"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1199"  data-insp-path="src/routes/page.tsx:1199:25:PlusCircle" />
                        {submitting ? 'Menyimpan…' : 'Simpan ke sheet'}
                      </Button>
                      {saved && (
                        <Alert className="border-emerald-400/30 bg-emerald-400/10" data-aime-component-name="Alert"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1203"  data-insp-path="src/routes/page.tsx:1203:25:Alert" >
                          <AlertTitle data-aime-component-name="AlertTitle" data-aime-path-name="src/routes/page.tsx" data-aime-column="27" data-aime-line="1204" data-insp-path="src/routes/page.tsx:1204:27:AlertTitle">Berhasil disimpan</AlertTitle>
                          <AlertDescription data-aime-component-name="AlertDescription" data-aime-path-name="src/routes/page.tsx" data-aime-column="27" data-aime-line="1205" data-insp-path="src/routes/page.tsx:1205:27:AlertDescription">
                            Catatan baru telah ditambahkan dan data diperbarui.
                          </AlertDescription>
                        </Alert>
                      )}
                      {writeError && (
                        <FeishuError
                          error={writeError}
                          kind="write"
                          onRetry={() => inputFormRef.current?.requestSubmit()}
                         data-aime-component-name="FeishuError"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="25"  data-aime-line="1211"  data-insp-path="src/routes/page.tsx:1211:25:FeishuError" />
                      )}
                    </form>
                  </CardContent>
                </Card>
              )}
            </>
          )}
          <footer className="pb-2 pt-10 text-center text-xs font-semibold text-[#1B1A1B]" data-aime-component-name="footer"  data-aime-path-name="src/routes/page.tsx"  data-aime-column="11"  data-aime-line="1223"  data-insp-path="src/routes/page.tsx:1223:11:footer" >
            页面数据可见性与所引用的数据源权限保持一致｜本页面由 Aime 创建
          </footer>
        </div>
      </main>
    </div>
  );
}
