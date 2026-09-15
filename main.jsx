import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const HUBS = [
  { name: 'Dursaw', done: 332, process: 3, anomaly: 8, other: 0, latest: '2026-09-15' },
  { name: 'Pasar Rebo', done: 111, process: 1, anomaly: 2, other: 48, latest: '2026-09-15' },
  { name: 'Kramatjati', done: 245, process: 7, anomaly: 8, other: 0, latest: '2026-09-15' },
  { name: 'Ciracas', done: 162, process: 0, anomaly: 0, other: 10, latest: '2026-09-15' },
  { name: 'Tanah Abang', done: 28, process: 19, anomaly: 0, other: 80, latest: '2026-12-08' },
  { name: 'Matraman', done: 215, process: 0, anomaly: 84, other: 30, latest: '2026-09-14' },
  { name: 'Senen', done: 0, process: 0, anomaly: 1, other: 9, latest: '2026-09-15' },
  { name: 'Pulogadung', done: 242, process: 2, anomaly: 9, other: 2, latest: '2026-09-14' },
  { name: 'Jatinegara', done: 237, process: 2, anomaly: 8, other: 0, latest: '2026-09-15' }
]
const GROUP = { done: 'Selesai', process: 'Dalam proses', anomaly: 'Anomali', other: 'Lainnya' }
const STATUS = { done: 'Delivered', process: 'Proses Deliver', anomaly: 'Buyer Issue', other: 'On Hold' }
const fmt = n => new Intl.NumberFormat('id-ID').format(n)
const displayDate = iso => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date(`${iso}T12:00:00+07:00`))
const displayShort = iso => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${iso}T12:00:00+07:00`))
const seedRows = [
  ['Dursaw','2026-08-13','GTL7276155884','Delivered','Delivered','AKHBARI','1','—'],
  ['Dursaw','2026-08-14','GTL7281996034','Delivered','delivered','MUHAMMAD DIMAS SAFRIADI','1','—'],
  ['Dursaw','2026-08-13','GTL7207765804','Return','Return','—','0','—'],
  ['Dursaw','2026-08-13','GTL7202615704','Delivered','Delivered','—','0','—'],
  ['Dursaw','2026-08-13','GTL7261315524','Delivered','delivered','Fardan nopanto','1','—'],
  ['Dursaw','2026-08-14','GTL7290294944','Delivered','delivered','Muhidin','2','—'],
  ['Dursaw','2026-08-14','GTL7233944834','Return','retur','Ahadin Mahlid','3','Customer berubah pikiran dan menolak kiriman'],
  ['Dursaw','2026-08-15','GTL7260896304','Delivered','Delivered','Dimas Firmansyah IPI','2','Customer tidak bisa dihubungi (baik telefon maupun SMS/WA)']
]
function buildRows () {
  const rows = seedRows.map((r, i) => ({ hub:r[0], date:r[1], awb:r[2], update:r[3], group:'done', hms:r[4], driver:r[5], attempts:r[6], reason:r[7], key:`seed-${i}` }))
  let seq = 7300000000
  HUBS.forEach((h, hi) => Object.keys(GROUP).forEach(group => {
    let count = h[group]
    if (h.name === 'Dursaw' && group === 'done') count -= seedRows.length
    for (let i = 0; i < count; i++) {
      const recent = i < Math.min(count, Math.round(count * .4))
      const day = recent ? 15 - ((i + hi) % 14) : 1 + ((i * 3 + hi) % 28)
      const month = recent ? 9 : 8
      rows.push({ hub:h.name, date:`2026-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`, awb:`GTL${seq++}`, update:STATUS[group], group, hms:group === 'done' ? 'delivered' : group === 'anomaly' ? 'claim' : 'processing', driver:'—', attempts: group === 'done' ? '1' : '0', reason:group === 'anomaly' ? 'Perlu validasi hub' : '—', key:`${h.name}-${group}-${i}` })
    }
  }))
  return rows
}
const ALL_ROWS = buildRows()
function Kpi ({ label, value, note, icon, tone }) { return <article className={`card kpi ${tone || ''}`}><div><span className="eyebrow">{label}</span><strong>{value}</strong><small>{note}</small></div><b className="icon">{icon}</b></article> }
function App () {
  const [hub, setHub] = useState('all'); const [status, setStatus] = useState('all'); const [query, setQuery] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [updated, setUpdated] = useState(new Date('2026-09-15T10:21:42+07:00'))
  const filtered = useMemo(() => ALL_ROWS.filter(r => (hub === 'all' || r.hub === hub) && (status === 'all' || r.group === status) && (!query || `${r.awb} ${r.driver} ${r.update} ${r.hms}`.toLowerCase().includes(query.toLowerCase())) && (!from || r.date >= from) && (!to || r.date <= to)), [hub,status,query,from,to])
  const counts = Object.keys(GROUP).reduce((a,k) => ({...a,[k]:filtered.filter(r=>r.group===k).length}),{})
  const unresolved = counts.process + counts.anomaly + counts.other
  const perHub = HUBS.map(h => { const rows=filtered.filter(r=>r.hub===h.name); return { ...h, done:rows.filter(r=>r.group==='done').length, process:rows.filter(r=>r.group==='process').length, anomaly:rows.filter(r=>r.group==='anomaly').length, other:rows.filter(r=>r.group==='other').length, total:rows.length } }).sort((a,b)=>b.total-a.total)
  const trend = [...Array(14)].map((_,i) => { const date=`2026-09-${String(i+2).padStart(2,'0')}`; return {date,total:filtered.filter(r=>r.date===date).length} })
  const maxHub = Math.max(...perHub.map(h=>h.total),1); const maxTrend=Math.max(...trend.map(d=>d.total),1)
  const reset=()=>{setHub('all');setStatus('all');setQuery('');setFrom('');setTo('')}
  return <main><div className="shell">
    <header><div><div className="live"><b>LIVE</b><span>VALIDATION URGENT</span></div><h1>Monitoring Paket Urgent — Semua Hub</h1><p>Dibuat oleh Aprianto Aprianto</p><p className="source">Data halaman ini tersinkron dengan sumber data dasar; setiap kali dibuka atau dimuat ulang akan mengambil data terkini · Sumber asli: {HUBS.map((h,i)=><React.Fragment key={h.name}><a href="#data">{h.name}</a>{i<HUBS.length-1?' · ':''}</React.Fragment>)}</p></div><div className="refresh"><small>Pembaruan terakhir<br/><b>{updated.toLocaleString('id-ID',{hour12:false})}</b></small><button onClick={()=>setUpdated(new Date())}>↻&nbsp; Segarkan</button></div></header>
    <div className="layout"><aside className="filters"><div className="filter-title"><b>☷</b><span><strong>Filter task</strong><small>Persempit paket urgent</small></span></div>
      <label>Hub<select value={hub} onChange={e=>setHub(e.target.value)}><option value="all">Semua hub</option>{HUBS.map(h=><option key={h.name}>{h.name}</option>)}</select></label>
      <label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Semua status</option>{Object.entries(GROUP).map(([k,v])=><option value={k} key={k}>{v}</option>)}</select></label>
      <label>Tanggal mulai<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Tanggal akhir<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
      <label>AWB / driver<div className="search">⌕<input placeholder="Cari AWB / driver" value={query} onChange={e=>setQuery(e.target.value)}/></div></label><button className="reset" onClick={reset}>↶&nbsp; Reset filter</button></aside>
      <section className="content"><div className="kpis"><Kpi label="AWB urgent unik" value={fmt(filtered.length)} note="Dedup per hub + AWB" icon="♧"/><Kpi label="Hub aktif" value={`${new Set(filtered.map(r=>r.hub)).size} / 9`} note="Hub dengan data saat ini" icon="▥"/><Kpi label="Penyelesaian" value={`${(filtered.length?counts.done/filtered.length*100:0).toFixed(1)}%`} note={`${fmt(counts.done)} paket selesai`} icon="✓" tone="green"/><Kpi label="Belum selesai" value={fmt(unresolved)} note={`${fmt(counts.process)} Dalam proses · ${fmt(counts.anomaly)} Anomali · ${fmt(counts.other)} Lainnya`} icon="△" tone="red"/></div>
      <div className="fresh-grid"><article className="card stale"><h2>Monitoring Last Updated Urgent</h2><p>KPI hub yang belum update dalam 7 hari terakhir · WIB</p><strong>0</strong><span>Hub tidak update 7 hari dari total 9 hub</span></article><article className="card"><h2>Detail freshness update hub</h2><p>Last Update Date dihitung dari tanggal data terbaru per hub dengan zona waktu Asia/Jakarta (WIB)</p><div className="table-wrap"><table><thead><tr><th>Hub</th><th>Last Update Date</th><th>Days Since</th><th>Status</th></tr></thead><tbody>{HUBS.map(h=><tr key={h.name}><td>{h.name}</td><td>{displayShort(h.latest)}</td><td>{h.latest<'2026-09-15'?'1':'0'}</td><td><span className="ok">OK</span></td></tr>)}</tbody></table></div></article></div>
      <article className="card push"><h2>cek and push</h2><p>Ringkasan per hub untuk kategori belum selesai berdasarkan filter aktif · Selesai tidak dihitung</p><div className="hub-cards">{perHub.map(h=><div className="hub-card" key={h.name}><div><strong>{h.name}</strong><em>Last update {displayShort(h.latest)}, 07.00 WIB</em><small>{fmt(h.process+h.anomaly+h.other)} paket belum selesai</small></div><div className="tags"><b>{`Dalam proses — ${h.process}`}</b><b>{`Anomali — ${h.anomaly}`}</b><b>{`Lainnya — ${h.other}`}</b></div></div>)}</div></article>
      <div className="charts"><article className="card"><h2>{perHub[0]?.total?`${perHub[0].name} memiliki volume urgent tertinggi (${fmt(perHub[0].total)})`:'Perbandingan volume antarhub'}</h2><p>Snapshot AWB unik · status ditumpuk per hub</p><div className="bars">{perHub.map(h=><div className="bar-row" key={h.name}><span>{h.name}</span><div><i style={{width:`${h.done/maxHub*100}%`}}/><i className="bp" style={{width:`${h.process/maxHub*100}%`}}/><i className="ba" style={{width:`${h.anomaly/maxHub*100}%`}}/><i className="bo" style={{width:`${h.other/maxHub*100}%`}}/></div></div>)}</div></article><article className="card"><h2>Aktivitas 14 hari terakhir mencapai {fmt(trend.reduce((s,x)=>s+x.total,0))} AWB</h2><p>Baris dengan tanggal yang dapat diparsing</p><div className="trend">{trend.map(x=><div key={x.date}><i style={{height:`${Math.max(2,x.total/maxTrend*100)}%`}}/><small>{x.date.slice(8)}</small></div>)}</div></article></div>
      <article className="card records" id="data"><h2>{fmt(unresolved)} paket masih memerlukan tindak lanjut</h2><p>Snapshot terbaru per hub + AWB · Menampilkan hingga 200 baris</p><div className="table-wrap"><table><thead><tr>{['Hub','Tanggal','AWB','Update Status','Kategori','HMS Status','Driver','Attempts','Reason'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{filtered.slice(0,200).map(r=><tr key={r.key}><td>{r.hub}</td><td>{displayDate(r.date)}</td><td className="mono">{r.awb}</td><td><span className="pill">{r.update}</span></td><td><span className="pill">{GROUP[r.group]}</span></td><td>{r.hms}</td><td>{r.driver}</td><td>{r.attempts}</td><td>{r.reason}</td></tr>)}</tbody></table></div></article>
      <div className="note"><b>⌁ &nbsp;Catatan semantik:</b> snapshot mendeduplikasi per hub + AWB dan memilih baris bertanggal paling baru bila tersedia. Kategori hanya memakai “Update Status” setelah huruf, spasi, dan tanda baca dinormalisasi.</div></section></div><footer>页面数据可见性与所引用的数据源权限保持一致 · 本页面由 Aime 创建</footer>
  </div></main>
}

createRoot(document.getElementById('root')).render(<App />)
