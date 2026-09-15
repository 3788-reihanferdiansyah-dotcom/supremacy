export type Courier = {
  id: string
  name: string
  province: string
  cluster: string
  hub: string
  tier: string
  score: number
  star: number
  picked: number
  delivered: number
  attendance: number
  onTime: number
  success: number
  cot: number
  productivity: number
  pod: number
  pofd: number
  dnr: number
  lost: number
  codLate: number
}

export type Summary = { total: number; rows: number; average: number; stars: Record<number, number> }

export const meta = {
  generatedAt: '2026-09-15T00:47:44Z',
  start: '2026-09-01',
  end: '2026-09-14',
  columns: 40,
  sourceChartId: 6291901,
  sourceUrl: 'https://aeolus-va.tiktok-row.net/pages/dataQuery?appId=555771&id=2574746366&isDefault=1&rid=6291901&sid=2129621',
}

export const summaries: Record<string, Summary> = {
  '2026-09-01_2026-09-01': { total: 9157, rows: 9157, average: 52, stars: {1:4077,2:2034,3:1757,4:1136,5:153} },
  '2026-09-01_2026-09-02': { total: 11037, rows: 11087, average: 50, stars: {1:5508,2:2344,3:1869,4:1200,5:166} },
  '2026-09-01_2026-09-03': { total: 11272, rows: 11386, average: 49, stars: {1:5902,2:2397,3:1824,4:1101,5:162} },
  '2026-09-01_2026-09-04': { total: 11418, rows: 11569, average: 48, stars: {1:6179,2:2397,3:1779,4:1051,5:163} },
  '2026-09-01_2026-09-05': { total: 11537, rows: 11704, average: 48, stars: {1:6361,2:2408,3:1757,4:1029,5:149} },
  '2026-09-01_2026-09-06': { total: 11593, rows: 11786, average: 46, stars: {1:6864,2:2344,3:1554,4:890,5:134} },
  '2026-09-01_2026-09-07': { total: 11706, rows: 11910, average: 45, stars: {1:7006,2:2349,3:1588,4:838,5:129} },
  '2026-09-01_2026-09-08': { total: 11808, rows: 12035, average: 45, stars: {1:7022,2:2412,3:1631,4:842,5:128} },
  '2026-09-01_2026-09-09': { total: 11874, rows: 12120, average: 45, stars: {1:7097,2:2447,3:1615,4:838,5:123} },
  '2026-09-01_2026-09-10': { total: 11976, rows: 12257, average: 45, stars: {1:7002,2:2559,3:1614,4:942,5:140} },
  '2026-09-01_2026-09-11': { total: 12071, rows: 12369, average: 47, stars: {1:6829,2:2590,3:1620,4:1141,5:189} },
  '2026-09-01_2026-09-12': { total: 12143, rows: 12453, average: 48, stars: {1:6558,2:2551,3:1651,4:1290,5:403} },
  '2026-09-01_2026-09-13': { total: 12178, rows: 12492, average: 50, stars: {1:6249,2:2526,3:1644,4:1421,5:652} },
  '2026-09-01_2026-09-14': { total: 12251, rows: 12574, average: 52, stars: {1:5905,2:2657,3:1592,4:1590,5:830} },
  '2026-09-14_2026-09-14': { total: 8726, rows: 8726, average: 63, stars: {1:2397,2:2089,3:1073,4:1755,5:1412} },
}

const courier = (id:string,name:string,province:string,cluster:string,hub:string,tier:string,score:number,star:number,picked:number,delivered:number,attendance:number,onTime:number,success:number,cot:number,productivity:number,pod:number,pofd:number,dnr:number,lost:number,codLate:number): Courier => ({id,name,province,cluster,hub,tier,score,star,picked,delivered,attendance,onTime,success,cot,productivity,pod,pofd,dnr,lost,codLate})

export const couriers: Courier[] = [
  courier('16579','MUHAMAD IQBAL TAUFIK HID','West Java','Cianjur','GTL Cianjur Kota Hub','S',100,5,90,87,13,100,98,76,87,98,97,5,0,0),
  courier('16429','Virgiawan Hendri Damora','West Java','Cianjur','GTL Cianjur Kota Hub','S',100,5,69,68,14,100,99,88,68,96,100,5,0,0),
  courier('22116','EPUL SAEPUL MUBAROK','West Java','Tasikmalaya','GTL Singaparna Hub','S',100,5,59,57,13,100,98,92,57,86,100,5,0,0),
  courier('27094','MUHAMMAD RIVASKY ARFIAN SYAH','Central Java','Semarang','GTL Wonosolam Hub','S',100,5,64,64,13,100,100,89,64,99,100,5,0,0),
  courier('27909','ALI USMAN','Central Java','Semarang','GTL Wonosolam Hub','S',100,5,68,68,13,100,100,88,68,95,100,5,0,0),
  courier('19970','Alfan Nugraha','West Java','Garut','GTL Garut Kota Hub','S',100,5,61,60,12,100,99,97,60,91,100,5,0,0),
  courier('17144','Tria Sutriana Tarwenda','West Java','Subang','GTL Ciasem Hub','S',100,5,87,85,12,100,98,87,85,97,100,5,0,0),
  courier('21211','Iyan Suhendi','West Java','Subang','GTL Ciasem Hub','S',100,5,124,119,12,100,97,71,119,96,100,5,0,0),
  courier('19999','Taofik Maulana','West Java','Garut','GTL Garut Kota Hub','S',100,5,77,77,12,100,99,94,77,86,100,5,0,0),
  courier('35590','DEDE AGIS NURUL JAMAN','West Java','Tasikmalaya','GTL Singaparna Hub','S',100,5,59,57,12,100,98,90,57,95,100,5,0,0),
  courier('16468','Dendi Ramdani','West Java','Cianjur','GTL Cianjur Kota Hub','S',100,5,66,63,14,100,97,90,63,92,100,5,0,0),
  courier('22256','FAHMY BHAKTI ANDRIANSYAH','West Java','Bandung','GTL Bandung Kulon Hub','A',100,5,75,74,12,100,100,94,74,94,100,5,0,0),
  courier('28723','Jemi Aprilyandi Maulana','West Java','Bandung','GTL Babakan Ciparay Hub','A',100,5,50,48,12,100,97,73,48,97,100,5,0,0),
  courier('22253','WENDI FEBRIANSYAH','West Java','Bandung','GTL Buahbatu Hub','A',100,5,64,64,12,100,99,95,64,92,100,3,0,0),
  courier('22374','Yudi Supriyadi','West Java','Bandung','GTL Kiaracondong Hub','A',100,5,63,62,14,100,99,82,62,96,100,5,0,0),
]

export const provinces = ['Bali','Central Java','East Java','Jabodetabek','North Sumatera','South Sumatera','West Java']
export const clusters = ['Bali','Bandung','Cianjur','Garut','Jabodetabek - East','Jabodetabek - South','Jabodetabek - West','Jombang','Kediri','Lampung','Malang','Medan','Mojokerto','Padang','Palembang','Pekanbaru','Semarang','Sidoarjo','Subang','Sukabumi','Surabaya','Surakarta','Tasikmalaya','Yogyakarta']
export const hubs = [...new Set(couriers.map(c=>c.hub))].sort()
export const tiers = ['A','Others','S']
