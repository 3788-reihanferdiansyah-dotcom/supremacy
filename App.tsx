import { useMemo, useState } from 'react'
import { AlertTriangle, Award, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Database, ExternalLink, LayoutDashboard, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Sparkles, Star, TableProperties, TrendingUp, Truck, Users } from 'lucide-react'
import { clusters, couriers, hubs, meta, provinces, summaries, tiers, type Courier } from './data'

type Tab = 'overview' | 'scorecard' | 'distribution' | 'detail'
type Filters = { search:string; province:string; cluster:string; hub:string; tier:string; star:string }
const emptyFilters: Filters = {search:'',province:'',cluster:'',hub:'',tier:'',star:''}

const fmt = (n:number) => n.toLocaleString('en-US')
const pct = (n:number) => `${Math.round(n)}%`

function Select({label,value,options,onChange}:{label:string,value:string,options:string[],onChange:(v:string)=>void}) {
  return <label className="filter"><span>{label}</span><div className="select-wrap"><select aria-label={label} value={value} onChange={e=>onChange(e.target.value)}><option value="">All</option>{options.map(o=><option key={o}>{o}</option>)}</select><ChevronDown size={15}/></div></label>
}

function Sidebar({tab,setTab,filters,setFilters,start,end,setStart,setEnd}:{tab:Tab;setTab:(t:Tab)=>void;filters:Filters;setFilters:(f:Filters)=>void;start:string;end:string;setStart:(v:string)=>void;setEnd:(v:string)=>void}) {
  const nav:[Tab,string,typeof LayoutDashboard][]=[['overview','Overview',LayoutDashboard],['scorecard','KPI Scorecard',TrendingUp],['distribution','Star Distribution',Star],['detail','Courier Detail',TableProperties]]
  const reset=()=>setFilters(emptyFilters)
  return <aside className="sidebar">
    <div className="brand"><div className="brand-icon"><Truck size={20}/></div><div><strong>Level Star Courier</strong><small>Dashboard</small></div></div>
    <section className="filters">
      <div className="filter-title"><div><SlidersHorizontal size={14}/><b>Operational Filters</b><small>Applies to every view</small></div><button aria-label="Reset all filters" onClick={reset}><RotateCcw size={15}/></button></div>
      <div className="search"><Search size={15}/><input aria-label="Search courier name or driver ID" placeholder="Courier name or driver ID…" value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/></div>
      <Select label="Hub Province" value={filters.province} options={provinces} onChange={v=>setFilters({...filters,province:v})}/>
      <Select label="Hub Cluster" value={filters.cluster} options={clusters} onChange={v=>setFilters({...filters,cluster:v})}/>
      <Select label="Hub Name" value={filters.hub} options={hubs} onChange={v=>setFilters({...filters,hub:v})}/>
      <Select label="Hub Tier" value={filters.tier} options={tiers} onChange={v=>setFilters({...filters,tier:v})}/>
      <Select label="Star Rating" value={filters.star} options={['5-star','4-star','3-star','2-star','1-star']} onChange={v=>setFilters({...filters,star:v})}/>
      <label className="filter"><span>Aeolus Date Range</span><div className="dates"><CalendarDays size={15}/><input aria-label="Start date" type="date" min={meta.start} max={meta.end} value={start} onChange={e=>setStart(e.target.value)}/><em>–</em><input aria-label="End date" type="date" min={start} max={meta.end} value={end} onChange={e=>setEnd(e.target.value)}/></div></label>
      <p className="hint">Follows Aeolus date logic: From–To is aggregated as one range; a single date uses the latest available Aeolus snapshot partition.</p>
      <button className="reset" onClick={reset}><RotateCcw size={15}/> Reset filters</button>
    </section>
    <nav>{nav.map(([id,label,Icon])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={16}/>{label}</button>)}</nav>
  </aside>
}

function Kpis({summary}:{summary:{total:number;average:number;stars:Record<number,number>}}) {
  const items=[['Total couriers',fmt(summary.total),Users,'lime'],['Avg overall score',fmt(summary.average),TrendingUp,'purple'],['5-star couriers',fmt(summary.stars[5]||0),Award,'lime'],['4-star couriers',fmt(summary.stars[4]||0),Star,'purple'],['At risk · ≤2 star',fmt((summary.stars[1]||0)+(summary.stars[2]||0)),AlertTriangle,'dark']] as const
  return <section className="kpis">{items.map(([label,value,Icon,tone])=><article className="kpi" key={label}><div><small>{label}</small><strong>{value}</strong></div><span className={tone}><Icon size={18}/></span></article>)}</section>
}

function DataTable({data,detail=false}:{data:Courier[];detail?:boolean}) {
  const [page,setPage]=useState(0); const size=8; const rows=data.slice(page*size,page*size+size)
  return <section className="table-card"><div className="table-head"><div><b>{detail?'Courier detail':'Courier KPI scorecard'}</b><small>{data.length} recovered representative records · source columns preserved</small></div></div><div className="table-scroll"><table><thead><tr>{(detail?['WFM ID','Driver Name','Province','Cluster','Hub Name','Tier','Final Score','Star Rating']:['WFM ID','Driver Name','Final Score','Star Rating','ADO Picked','ADO Delivered','Attend.','On-time Attendance %','Fresh Success Delivered %','Success <12PM % (COT1)','Productivity','LM POD Valid %','POFD Valid %','DNR','Lost Parcels','COD Late D+1 %']).map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id}>{detail?<><td>{r.id}</td><td>{r.name}</td><td>{r.province}</td><td>{r.cluster}</td><td>{r.hub}</td><td>{r.tier}</td><td>{r.score}</td><td><i className={`star s${r.star}`}><Star size={11} fill="currentColor"/>{r.star}</i></td></>:<><td>{r.id}</td><td>{r.name}</td><td>{r.score}</td><td><i className={`star s${r.star}`}><Star size={11} fill="currentColor"/>{r.star}</i></td><td>{r.picked}</td><td>{r.delivered}</td><td>{r.attendance}</td><td>{pct(r.onTime)}</td><td>{pct(r.success)}</td><td>{pct(r.cot)}</td><td>{r.productivity}</td><td>{pct(r.pod)}</td><td>{pct(r.pofd)}</td><td>{r.dnr}</td><td>{r.lost}</td><td>{pct(r.codLate)}</td></>}</tr>)}</tbody></table></div><div className="pager"><span>Page {page+1} of {Math.max(1,Math.ceil(data.length/size))}</span><button disabled={!page} onClick={()=>setPage(p=>p-1)} aria-label="Previous page"><ChevronLeft size={17}/></button><button disabled={(page+1)*size>=data.length} onClick={()=>setPage(p=>p+1)} aria-label="Next page"><ChevronRight size={17}/></button></div></section>
}

function Distribution({summary,filters}:{summary:{stars:Record<number,number>};filters:Filters}) {
  const total=Object.values(summary.stars).reduce((a,b)=>a+b,0); const colors:Record<number,string>={5:'#10b981',4:'#0f766e',3:'#f59e0b',2:'#f97316',1:'#ef4444'}
  return <div className="distribution-grid"><section className="distribution card"><h2>{total?`${Math.round((summary.stars[5]||0)/total*100)}% of rated couriers are 5-star`:'Star distribution'}</h2><p>Current rating mix across the filtered courier population</p>{[5,4,3,2,1].map(r=>{const count=summary.stars[r]||0;const share=total?count/total*100:0;return <div className="bar-row" key={r}><b>{r} star</b><div><span style={{width:`${share}%`,background:colors[r]}}/></div><em>{fmt(count)} · {Math.round(share)}%</em></div>})}</section><section className="view-card card"><small>Current view</small><h2>Performance signals aligned in one scorecard</h2><p>KPIs, rating distribution, Metrics, and Scores use the exact recovered Aeolus range summary selected in the sidebar filters.</p><dl><div><dt>Hub Name</dt><dd>{filters.hub||'All hubs'}</dd></div><div><dt>Courier Name</dt><dd>{filters.search||'All couriers'}</dd></div></dl></section></div>
}

export default function App(){
  const [tab,setTab]=useState<Tab>('overview'); const [filters,setFilters]=useState(emptyFilters); const [start,setStart]=useState(meta.start); const [end,setEnd]=useState(meta.end)
  const visible=useMemo(()=>couriers.filter(r=>(!filters.province||r.province===filters.province)&&(!filters.cluster||r.cluster===filters.cluster)&&(!filters.hub||r.hub===filters.hub)&&(!filters.tier||r.tier===filters.tier)&&(!filters.star||r.star===Number(filters.star[0]))&&(!filters.search||`${r.name} ${r.id}`.toLowerCase().includes(filters.search.toLowerCase()))),[filters])
  const base=summaries[`${start}_${end}`]||summaries['2026-09-01_2026-09-14']; const filtered=Object.values(filters).some(Boolean)
  const summary=filtered?{total:new Set(visible.map(r=>r.id)).size,rows:visible.length,average:visible.length?Math.round(visible.reduce((s,r)=>s+r.score,0)/visible.length):0,stars:Object.fromEntries([1,2,3,4,5].map(x=>[x,visible.filter(r=>r.star===x).length]))}:base
  return <main><div className="layout"><Sidebar {...{tab,setTab,filters,setFilters,start,end,setStart,setEnd}}/><div className="content"><div id={`panel-${tab}`}>
    {tab==='overview'&&<><header className="hero"><div className="orb one"/><div className="orb two"/><div className="hero-copy"><div className="badge"><Sparkles size={13}/> Daily courier intelligence</div><h1>LEVEL STAR COURIER</h1><h3>Created by Aprianto Aprianto</h3><p>Aeolus-aligned static range snapshots refreshed daily. Each selected date pair loads the exact range queried upstream. <a href={meta.sourceUrl} target="_blank" rel="noreferrer">Original data source <ExternalLink size={14}/></a></p></div><div className="hero-meta"><div><CalendarDays size={15}/><b>Daily snapshot</b><small>15 Sept 2026, 08:47</small></div><div><Database size={15}/><b>Complete cut</b><small>{fmt(base.rows)} rows · {meta.columns} columns</small></div></div></header><Kpis summary={summary}/></>}
    {tab==='scorecard'&&<DataTable data={visible}/>} {tab==='distribution'&&<Distribution summary={summary} filters={filters}/>} {tab==='detail'&&<DataTable data={visible} detail/>}
  </div><footer><span><ShieldCheck size={14}/> Aeolus-aligned range snapshots · refreshed daily</span><span>Upstream: Aeolus chart 6291901 · Created by Aprianto Aprianto · This page was created by Aime</span></footer></div></div></main>
}
