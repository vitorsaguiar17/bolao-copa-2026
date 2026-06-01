const admin = require('firebase-admin');
const fetch = require('node-fetch');

// ─── INIT FIREBASE ───
// Usa GOOGLE_APPLICATION_CREDENTIALS (arquivo) ou FIREBASE_SERVICE_ACCOUNT (string)
let credential;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  credential = admin.credential.applicationDefault();
} else {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  credential = admin.credential.cert(serviceAccount);
}

admin.initializeApp({
  credential,
  databaseURL: 'https://bolao-copa-2026-v0-default-rtdb.firebaseio.com'
});
const db = admin.database();

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const FD_BASE = 'https://api.football-data.org/v4';
const WC2026_ID = 2000;

const TEAM_MAP = {
  "Brazil":"Brasil","Morocco":"Marrocos","France":"França","Argentina":"Argentina",
  "England":"Inglaterra","Portugal":"Portugal","Spain":"Espanha","Germany":"Alemanha",
  "Netherlands":"Holanda","Belgium":"Bélgica","Croatia":"Croácia","Senegal":"Senegal",
  "Japan":"Japão","South Korea":"Coreia do Sul","United States":"Estados Unidos",
  "Mexico":"México","Canada":"Canadá","Ecuador":"Equador","Uruguay":"Uruguai",
  "Colombia":"Colômbia","Türkiye":"Turquia","Switzerland":"Suíça","Qatar":"Catar",
  "Ghana":"Gana","Tunisia":"Tunísia","Iran":"Irã","Saudi Arabia":"Arábia Saudita",
  "South Africa":"África do Sul","Czech Republic":"República Tcheca","Czechia":"República Tcheca",
  "Norway":"Noruega","Sweden":"Suécia","Austria":"Áustria","Algeria":"Argélia",
  "Egypt":"Egito","New Zealand":"Nova Zelândia","Ivory Coast":"Costa do Marfim",
  "DR Congo":"R. D. Congo","Panama":"Panamá","Paraguay":"Paraguai","Haiti":"Haiti",
  "Scotland":"Escócia","Bosnia-Herzegovina":"Bósnia e Herzegovina","Jordan":"Jordânia",
  "Iraq":"Iraque","Uzbekistan":"Uzbequistão","Curaçao":"Curaçao","Cape Verde":"Cabo Verde",
  "Australia":"Austrália","Poland":"Polônia","Cameroon":"Camarões","Serbia":"Sérvia"
};
function toPort(name) { return TEAM_MAP[name] || name; }

const GROUP_MATCHES = [
  {id:1,home:"México",away:"Coreia do Sul"},{id:2,home:"República Tcheca",away:"África do Sul"},
  {id:25,home:"República Tcheca",away:"Coreia do Sul"},{id:26,home:"México",away:"África do Sul"},
  {id:53,home:"República Tcheca",away:"México"},{id:54,home:"África do Sul",away:"Coreia do Sul"},
  {id:3,home:"Canadá",away:"Bósnia e Herzegovina"},{id:6,home:"Catar",away:"Suíça"},
  {id:27,home:"Suíça",away:"Bósnia e Herzegovina"},{id:28,home:"Canadá",away:"Catar"},
  {id:51,home:"Suíça",away:"Canadá"},{id:52,home:"Bósnia e Herzegovina",away:"Catar"},
  {id:7,home:"Brasil",away:"Marrocos"},{id:8,home:"Escócia",away:"Haiti"},
  {id:29,home:"Escócia",away:"Marrocos"},{id:30,home:"Brasil",away:"Haiti"},
  {id:49,home:"Escócia",away:"Brasil"},{id:50,home:"Marrocos",away:"Haiti"},
  {id:4,home:"Estados Unidos",away:"Paraguai"},{id:5,home:"Austrália",away:"Turquia"},
  {id:31,home:"Turquia",away:"Paraguai"},{id:32,home:"Estados Unidos",away:"Austrália"},
  {id:59,home:"Turquia",away:"Estados Unidos"},{id:60,home:"Paraguai",away:"Austrália"},
  {id:10,home:"Alemanha",away:"Costa do Marfim"},{id:11,home:"Equador",away:"Curaçao"},
  {id:33,home:"Alemanha",away:"Curaçao"},{id:34,home:"Equador",away:"Costa do Marfim"},
  {id:55,home:"Equador",away:"Alemanha"},{id:56,home:"Costa do Marfim",away:"Curaçao"},
  {id:12,home:"Holanda",away:"Japão"},{id:9,home:"Suécia",away:"Tunísia"},
  {id:35,home:"Tunísia",away:"Japão"},{id:36,home:"Holanda",away:"Suécia"},
  {id:57,home:"Japão",away:"Suécia"},{id:58,home:"Tunísia",away:"Holanda"},
  {id:16,home:"Bélgica",away:"Egito"},{id:15,home:"Irã",away:"Nova Zelândia"},
  {id:38,home:"Bélgica",away:"Irã"},{id:39,home:"Nova Zelândia",away:"Egito"},
  {id:63,home:"Nova Zelândia",away:"Bélgica"},{id:64,home:"Egito",away:"Irã"},
  {id:14,home:"Espanha",away:"Cabo Verde"},{id:13,home:"Arábia Saudita",away:"Uruguai"},
  {id:37,home:"Espanha",away:"Arábia Saudita"},{id:40,home:"Uruguai",away:"Cabo Verde"},
  {id:65,home:"Cabo Verde",away:"Arábia Saudita"},{id:66,home:"Uruguai",away:"Espanha"},
  {id:17,home:"França",away:"Senegal"},{id:18,home:"Noruega",away:"Iraque"},
  {id:41,home:"França",away:"Noruega"},{id:42,home:"Iraque",away:"Senegal"},
  {id:61,home:"Noruega",away:"Senegal"},{id:62,home:"Iraque",away:"França"},
  {id:19,home:"Argentina",away:"Argélia"},{id:20,home:"Áustria",away:"Jordânia"},
  {id:43,home:"Argentina",away:"Áustria"},{id:44,home:"Jordânia",away:"Argélia"},
  {id:69,home:"Argélia",away:"Áustria"},{id:70,home:"Jordânia",away:"Argentina"},
  {id:23,home:"Portugal",away:"R. D. Congo"},{id:24,home:"Colômbia",away:"Uzbequistão"},
  {id:47,home:"Portugal",away:"Colômbia"},{id:48,home:"Uzbequistão",away:"R. D. Congo"},
  {id:71,home:"Colômbia",away:"Portugal"},{id:72,home:"R. D. Congo",away:"Uzbequistão"},
  {id:22,home:"Inglaterra",away:"Croácia"},{id:21,home:"Gana",away:"Panamá"},
  {id:45,home:"Inglaterra",away:"Gana"},{id:46,home:"Panamá",away:"Croácia"},
  {id:67,home:"Panamá",away:"Inglaterra"},{id:68,home:"Croácia",away:"Gana"}
];

const PHASE_MAP = {
  "LAST_16":"Oitavas","QUARTER_FINALS":"Quartas",
  "SEMI_FINALS":"Semi","THIRD_PLACE":"Final","FINAL":"Final"
};

async function syncResults() {
  console.log('⚽ Sincronizando resultados...');
  try {
    const resp = await fetch(`${FD_BASE}/competitions/${WC2026_ID}/matches?status=FINISHED`, {
      headers: { 'X-Auth-Token': API_KEY }
    });
    if (!resp.ok) { console.log(`API error: ${resp.status} ${await resp.text()}`); return; }
    const data = await resp.json();
    const matches = data.matches || [];
    const updates = {};

    matches.forEach(match => {
      const h = match.score?.fullTime?.home;
      const a = match.score?.fullTime?.away;
      if (h === null || h === undefined) return;
      const homePT = toPort(match.homeTeam?.name || '');
      const awayPT = toPort(match.awayTeam?.name || '');
      const gm = GROUP_MATCHES.find(m =>
        (m.home === homePT && m.away === awayPT) ||
        (m.home === awayPT && m.away === homePT)
      );
      if (gm) {
        const inv = gm.home === awayPT;
        updates[`results/${gm.id}/h`] = String(inv ? a : h);
        updates[`results/${gm.id}/a`] = String(inv ? h : a);
        console.log(`  ✅ ${homePT} ${h}×${a} ${awayPT}`);
      }
    });

    if (Object.keys(updates).length > 0) {
      await db.ref('bolao').update(updates);
      console.log(`  💾 ${Object.keys(updates).length / 2} resultado(s) salvos`);
    } else {
      console.log('  ℹ️ Nenhum resultado novo');
    }
  } catch(e) { console.error('Erro resultados:', e.message); }
}

async function syncElim() {
  console.log('🏟️ Sincronizando eliminatórias...');
  try {
    const resp = await fetch(
      `${FD_BASE}/competitions/${WC2026_ID}/matches?stage=LAST_16,QUARTER_FINALS,SEMI_FINALS,THIRD_PLACE,FINAL`,
      { headers: { 'X-Auth-Token': API_KEY } }
    );
    if (!resp.ok) { console.log(`API elim error: ${resp.status}`); return; }
    const data = await resp.json();
    const snap = await db.ref('bolao/elimMatches').once('value');
    const existing = Object.values(snap.val() || {});
    const updates = {};
    const resultUpdates = {};

    (data.matches || []).forEach(match => {
      if (!match.homeTeam?.name ||
          match.homeTeam.name === 'TBD' ||
          match.homeTeam.name === 'Yet to be defined') return;
      const phase = PHASE_MAP[match.stage];
      if (!phase) return;
      const homePT = toPort(match.homeTeam.name);
      const awayPT = toPort(match.awayTeam?.name || '');
      const exists = existing.find(m =>
        m.phase === phase && (m.home === homePT || m.away === awayPT)
      );
      if (!exists) {
        const id = match.id || Date.now();
        const dt = new Date(match.utcDate);
        const brt = new Date(dt.getTime() - 3 * 3600000);
        const dd = brt.getUTCDate().toString().padStart(2,'0');
        const mm = (brt.getUTCMonth()+1).toString().padStart(2,'0');
        const hh = brt.getUTCHours().toString().padStart(2,'0');
        const mn = brt.getUTCMinutes();
        updates[`bolao/elimMatches/${id}`] = {
          id, phase, home: homePT, away: awayPT,
          date: `${dd}/${mm}`,
          time: `${hh}h${mn > 0 ? mn.toString().padStart(2,'0') : ''}`,
          city: match.venue || ''
        };
        console.log(`  ✅ Novo: ${homePT} × ${awayPT} (${phase})`);
      }
      const h = match.score?.fullTime?.home;
      const a = match.score?.fullTime?.away;
      if (h !== null && h !== undefined && exists) {
        const inv = exists.home === awayPT;
        resultUpdates[`bolao/results/e_${exists.id}/h`] = String(inv ? a : h);
        resultUpdates[`bolao/results/e_${exists.id}/a`] = String(inv ? h : a);
      }
    });

    if (Object.keys(updates).length > 0) await db.ref('/').update(updates);
    if (Object.keys(resultUpdates).length > 0) await db.ref('/').update(resultUpdates);
    if (!Object.keys(updates).length && !Object.keys(resultUpdates).length)
      console.log('  ℹ️ Nenhuma atualização eliminatória');
  } catch(e) { console.error('Erro elim:', e.message); }
}

async function main() {
  await syncResults();
  await syncElim();
  console.log('✅ Concluído:', new Date().toISOString());
  process.exit(0);
}

main();
