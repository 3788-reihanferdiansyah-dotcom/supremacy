import { ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Dashboard = {
  id: string;
  label: string;
  title: string;
  description: string;
  url: string;
  group: string;
};

const dashboards: Dashboard[] = [
  { id: 'ongoing', label: 'ONGOING', title: 'Ongoing Operations Dashboard', description: 'Operational rider monitoring, delivery progress, and POFD checking in one operational dashboard.', url: 'https://bc6a1d20ca96.aime-site.bytedance.net', group: 'Operations' },
  { id: 'supernova', label: 'SUPERNOVA', title: 'Supernova Performance Dashboard', description: 'Overall Supernova performance view for courier and operational performance tracking.', url: 'https://573452c54e14.aime-site.bytedance.net', group: 'Performance' },
  { id: 'validation-awb', label: 'ANOMALI', title: 'Anomali Dashboard', description: 'Airwaybill anomaly workflow dashboard for operational review and action tracking.', url: 'https://00d3b763db73.aime-site.bytedance.net', group: 'Anomali' },
  { id: 'urgent-hub', label: 'URGENT HUB', title: 'Validation Urgent Dashboard', description: 'Focused dashboard for urgent parcel validation, monitoring, and operational follow-up.', url: 'https://bcaa719aad58.aime-site.bytedance.net', group: 'Validation Urgent' },
  { id: 'level-star', label: 'LEVEL STAR', title: 'Level Star Courier Dashboard', description: 'Courier-level star and ranking dashboard for level, score, and performance visibility.', url: 'https://319e5afa672c.aime-site.bytedance.net', group: 'Courier' },
  { id: 'wfm-attendance', label: 'ATTENDANCE', title: 'Attendance Dashboard', description: 'Attendance and WFM tracking dashboard for workforce monitoring and discipline control.', url: 'https://58c7ce58db6e.aime-site.bytedance.net/#home', group: 'Attendance' },
];

function initialDashboard() {
  const requested = new URLSearchParams(window.location.search).get('dashboard');
  return dashboards.some((item) => item.id === requested) ? requested! : dashboards[0].id;
}

export default function App() {
  const [activeId, setActiveId] = useState(initialDashboard);
  const active = useMemo(() => dashboards.find((item) => item.id === activeId) ?? dashboards[0], [activeId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('dashboard', activeId);
    window.history.replaceState({}, document.title, `${window.location.pathname}?${params}`);
  }, [activeId]);

  return (
    <main className="min-h-screen bg-[#C2C6C9] text-[#1B1A1B]">
      <div className="mx-auto flex min-h-screen w-full max-w-full flex-col px-2 py-2 lg:px-3 lg:py-3">
        <section className="overflow-hidden rounded-3xl border border-black/20 bg-[#F6F7F5] shadow-xl shadow-black/10">
          <header className="border-b border-black/20 bg-[#1B1A1B] px-2 py-1 lg:px-3">
            <div className="flex items-center gap-2">
              <div className="shrink-0 border-r border-white/20 px-2 pr-3 lg:px-3 lg:pr-4">
                <span className="whitespace-nowrap text-sm font-black tracking-tight text-[#CEE36B] lg:text-base">$upremacy</span>
              </div>
              <nav className="scrollbar-none flex min-w-0 flex-1 gap-0.5 overflow-x-auto" aria-label="Dashboard navigation">
                {dashboards.map((item) => {
                  const selected = item.id === active.id;
                  return (
                    <button key={item.id} type="button" onClick={() => setActiveId(item.id)} className={`relative flex shrink-0 items-center rounded-xl px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition lg:text-xs ${selected ? 'bg-[#CEE36B] text-[#1B1A1B] shadow-sm' : 'text-[#F6F7F5] hover:bg-[#AE7EFD] hover:text-[#1B1A1B]'}`}>
                      {item.label}
                      {selected && <span className="absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-[#AE7EFD]" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </header>

          <div className="border-b border-black/10 bg-[#F6F7F5] px-3 py-3 lg:px-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#4A433C]">{active.group}</p>
                <h1 className="mt-1 text-lg font-semibold text-[#1B1A1B] lg:text-xl">{active.title}</h1>
                <p className="mt-1 text-sm font-medium text-[#4A433C]">Unified workspace with bold lime and purple accents.</p>
              </div>
              <a href={active.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-[#AE7EFD] px-4 py-2 text-sm font-semibold text-[#1B1A1B] transition hover:bg-[#CEE36B]">
                Open full page <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="bg-[#C2C6C9] p-2 lg:p-3">
            <section className="overflow-hidden rounded-3xl border border-black/15 bg-[#F6F7F5] shadow-inner shadow-black/10">
              <iframe key={active.id} title={active.title} src={active.url} className="h-screen w-full border-0 bg-white" />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
