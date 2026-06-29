const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://bolao-copa-2026-v0-default-rtdb.firebaseio.com'
});
const db = admin.database();

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const FD_BASE = 'https://api.football-data.org/v4';
const WC2026_ID = 2000;

const TEAM_MAP = {
  "Mexico":"México","South Africa":"África do Sul","Korea Republic":"Coreia do Sul",
  "Rep. of Korea":"Coreia do Sul","Czech Republic":"República Tcheca","Czechia":"República Tcheca",
  "Canada":"Canadá","Bosnia and Herzegovina":"Bósnia e Herzegovina","Bosnia-Herzegovina":"Bósnia e Herzegovina",
  "Qatar":"Catar","Switzerland":"Suíça","Brazil":"Brasil","Morocco":"Marrocos",
  "Haiti":"Haiti","Scotland":"Escócia","United States":"Estados Unidos","USA":"Estados Unidos",
  "Paraguay":"Paraguai","Australia":"Austrália","Turkey":"Turquia","Türkiye":"Turquia",
  "Germany":"Alemanha","Curaçao":"Curaçao","Ivory Coast":"Costa do Marfim","Côte d'Ivoire":"Costa do Marfim",
  "Ecuador":"Equador","Netherlands":"Holanda","Japan":"Japão","Sweden":"Suécia",
  "Tunisia":"Tunísia","Belgium":"Bélgica","Egypt":"Egito","Iran":"Irã","IR Iran":"Irã",
  "New Zealand":"Nova Zelândia","Spain":"Espanha","Cape Verde":"Cabo Verde",
  "Saudi Arabia":"Arábia Saudita","Uruguay":"Uruguai","France":"França","Senegal":"Senegal",
  "Iraq":"Iraque","Norway":"Noruega","Argentina":"Argentina","Algeria":"Argélia",
  "Austria":"Áustria","Jordan":"Jordânia","Ghana":"Gana","Panama":"Panamá",
  "England":"Inglaterra","Croatia":"Croácia","Portugal":"Portugal",
  "DR Congo":"R. D. Congo","Democratic Republic of Congo":"R. D. Congo","Congo DR":"R. D. Congo",
  "Cape Verde Islands":"Cabo Verde",
  "Uzbekistan":"Uzbequistão","Colombia":"Colômbia"
};
function toPort(name) {
  if(!name) return "";
  return TEAM_MAP[name] || name;
}

// Todos os 72 jogos de grupos com home/away corretos
const GROUP_MATCHES = [
  {id:1,home:"México",away:"África do Sul"},
  {id:2,home:"Coreia do Sul",away:"República Tcheca"},
  {id:3,home:"Canadá",away:"Bósnia e Herzegovina"},
  {id:4,home:"Estados Unidos",away:"Paraguai"},
  {id:5,home:"Haiti",away:"Escócia"},
  {id:6,home:"Austrália",away:"Turquia"},
  {id:7,home:"Brasil",away:"Marrocos"},
  {id:8,home:"Catar",away:"Suíça"},
  {id:9,home:"Costa do Marfim",away:"Equador"},
  {id:10,home:"Alemanha",away:"Curaçao"},
  {id:11,home:"Holanda",away:"Japão"},
  {id:12,home:"Suécia",away:"Tunísia"},
  {id:13,home:"Arábia Saudita",away:"Uruguai"},
  {id:14,home:"Espanha",away:"Cabo Verde"},
  {id:15,home:"Irã",away:"Nova Zelândia"},
  {id:16,home:"Bélgica",away:"Egito"},
  {id:17,home:"França",away:"Senegal"},
  {id:18,home:"Iraque",away:"Noruega"},
  {id:19,home:"Argentina",away:"Argélia"},
  {id:20,home:"Áustria",away:"Jordânia"},
  {id:21,home:"Gana",away:"Panamá"},
  {id:22,home:"Inglaterra",away:"Croácia"},
  {id:23,home:"Portugal",away:"R. D. Congo"},
  {id:24,home:"Uzbequistão",away:"Colômbia"},
  {id:25,home:"República Tcheca",away:"África do Sul"},
  {id:26,home:"Suíça",away:"Bósnia e Herzegovina"},
  {id:27,home:"Canadá",away:"Catar"},
  {id:28,home:"México",away:"Coreia do Sul"},
  {id:29,home:"Brasil",away:"Haiti"},
  {id:30,home:"Escócia",away:"Marrocos"},
  {id:31,home:"Turquia",away:"Paraguai"},
  {id:32,home:"Estados Unidos",away:"Austrália"},
  {id:33,home:"Alemanha",away:"Costa do Marfim"},
  {id:34,home:"Equador",away:"Curaçao"},
  {id:35,home:"Holanda",away:"Suécia"},
  {id:36,home:"Tunísia",away:"Japão"},
  {id:37,home:"Uruguai",away:"Cabo Verde"},
  {id:38,home:"Espanha",away:"Arábia Saudita"},
  {id:39,home:"Bélgica",away:"Irã"},
  {id:40,home:"Nova Zelândia",away:"Egito"},
  {id:41,home:"Noruega",away:"Senegal"},
  {id:42,home:"França",away:"Iraque"},
  {id:43,home:"Argentina",away:"Áustria"},
  {id:44,home:"Jordânia",away:"Argélia"},
  {id:45,home:"Inglaterra",away:"Gana"},
  {id:46,home:"Panamá",away:"Croácia"},
  {id:47,home:"Portugal",away:"Uzbequistão"},
  {id:48,home:"Colômbia",away:"R. D. Congo"},
  {id:49,home:"Escócia",away:"Brasil"},
  {id:50,home:"Marrocos",away:"Haiti"},
  {id:51,home:"Suíça",away:"Canadá"},
  {id:52,home:"Bósnia e Herzegovina",away:"Catar"},
  {id:53,home:"República Tcheca",away:"México"},
  {id:54,home:"África do Sul",away:"Coreia do Sul"},
  {id:55,home:"Curaçao",away:"Costa do Marfim"},
  {id:56,home:"Equador",away:"Alemanha"},
  {id:57,home:"Japão",away:"Suécia"},
  {id:58,home:"Tunísia",away:"Holanda"},
  {id:59,home:"Turquia",away:"Estados Unidos"},
  {id:60,home:"Paraguai",away:"Austrália"},
  {id:61,home:"Noruega",away:"França"},
  {id:62,home:"Senegal",away:"Iraque"},
  {id:63,home:"Egito",away:"Irã"},
  {id:64,home:"Nova Zelândia",away:"Bélgica"},
  {id:65,home:"Cabo Verde",away:"Arábia Saudita"},
  {id:66,home:"Uruguai",away:"Espanha"},
  {id:67,home:"Panamá",away:"Inglaterra"},
  {id:68,home:"Croácia",away:"Gana"},
  {id:69,home:"Argélia",away:"Áustria"},
  {id:70,home:"Jordânia",away:"Argentina"},
  {id:71,home:"Colômbia",away:"Portugal"},
  {id:72,home:"R. D. Congo",away:"Uzbequistão"}
];

const PHASE_MAP = {
  "LAST_32":"R32","ROUND_OF_32":"R32",
  "LAST_16":"Oitavas","ROUND_OF_16":"Oitavas","QUARTER_FINALS":"Quartas",
  "SEMI_FINALS":"Semi","THIRD_PLACE":"Final","FINAL":"Final"
};

async function syncResults() {
  console.log('⚽ Sincronizando resultados...');
  try {
    const resp = await fetch(`${FD_BASE}/competitions/${WC2026_ID}/matches?status=FINISHED`, {
      headers: { 'X-Auth-Token': API_KEY }
    });
    if (!resp.ok) {
      console.log(`API error: ${resp.status} ${await resp.text()}`);
      return;
    }
    const data = await resp.json();
    const matches = data.matches || [];
    console.log(`  API retornou ${matches.length} jogos finalizados`);

    const updates = {};
    matches.forEach(match => {
      // REGRA: empate em pênaltis conta como EMPATE no bolão (placar dos 120', sem os pênaltis).
      // A API soma os pênaltis ao fullTime quando duration=PENALTY_SHOOTOUT, então corrigimos aqui.
      let h, a;
      const duration = match.score?.duration;
      if (duration === 'PENALTY_SHOOTOUT') {
        const rt = match.score?.regularTime, et = match.score?.extraTime;
        if (rt?.home === undefined || rt?.home === null || et?.home === undefined || et?.home === null) {
          h = undefined; a = undefined;
        } else {
          h = rt.home + et.home;
          a = rt.away + et.away;
        }
      } else {
        h = match.score?.fullTime?.home;
        a = match.score?.fullTime?.away;
      }
      if (match.status !== 'FINISHED' || h === null || h === undefined || a === null || a === undefined || !Number.isFinite(h) || !Number.isFinite(a)) return;

      const homeEN = match.homeTeam?.name || '';
      const awayEN = match.awayTeam?.name || '';
      const homePT = toPort(homeEN);
      const awayPT = toPort(awayEN);

      console.log(`  Processando: ${homeEN} (${homePT}) ${h}×${a} ${awayEN} (${awayPT})${duration==='PENALTY_SHOOTOUT'?' [resultado pós-pênaltis ajustado p/ empate dos 120min]':''}`);

      // Busca pelo par home/away exato
      const gm = GROUP_MATCHES.find(m =>
        (m.home === homePT && m.away === awayPT) ||
        (m.home === awayPT && m.away === homePT)
      );

      if (gm) {
        const inv = gm.home === awayPT;
        const finalH = String(inv ? a : h);
        const finalA = String(inv ? h : a);
        updates[`results/${gm.id}/h`] = finalH;
        updates[`results/${gm.id}/a`] = finalA;
        console.log(`  ✅ Match ${gm.id}: ${gm.home} ${finalH}×${finalA} ${gm.away}`);
      } else {
        console.log(`  ⚠️ Não encontrado no bolão: ${homePT} × ${awayPT}`);
      }
    });

    if (Object.keys(updates).length > 0) {
      await db.ref('bolao').update(updates);
      console.log(`  💾 ${Object.keys(updates).length / 2} resultado(s) salvos`);
    } else {
      console.log('  ℹ️ Nenhum resultado novo');
    }
  } catch(e) {
    console.error('Erro resultados:', e.message);
  }
}

async function syncElim() {
  console.log('🏟️ Sincronizando eliminatórias...');
  try {
    const resp = await fetch(
      `${FD_BASE}/competitions/${WC2026_ID}/matches?stage=LAST_32,LAST_16,ROUND_OF_32,ROUND_OF_16,QUARTER_FINALS,SEMI_FINALS,THIRD_PLACE,FINAL`,
      { headers: { 'X-Auth-Token': API_KEY } }
    );
    if (!resp.ok) return;
    const data = await resp.json();
    const snap = await db.ref('bolao/elimMatches').once('value');
    const existing = Object.values(snap.val() || {});
    const updates = {};
    const resultUpdates = {};

    (data.matches || []).forEach(match => {
      const homeNameRaw = match.homeTeam?.name;
      const awayNameRaw = match.awayTeam?.name;
      const isPlaceholder = (n) => !n || n === 'TBD' || n === 'Yet to be defined';

      // Só processa quando os DOIS times já estão confirmados pela API
      if (isPlaceholder(homeNameRaw) || isPlaceholder(awayNameRaw)) {
        console.log(`  ⏳ Confronto ainda incompleto, aguardando definição: ${homeNameRaw||'?'} × ${awayNameRaw||'?'} (${match.stage})`);
        return;
      }

      const phase = PHASE_MAP[match.stage];
      if (!phase) return;

      const homePT = toPort(homeNameRaw);
      const awayPT = toPort(awayNameRaw);

      // Casa pelo ID do jogo da API quando disponível (mais confiável que nomes parciais)
      const exists = existing.find(m => m.apiMatchId === match.id) ||
        existing.find(m =>
          m.phase === phase &&
          ((m.home === homePT && m.away === awayPT) || (m.home === awayPT && m.away === homePT))
        );

      // Considera "incompleto" se o adversário está vazio, placeholder, ou diferente do que a API confirma agora
      const isIncomplete = (m) => !m.home || !m.away || m.home === 'Time A' || m.away === 'Time B' || m.home === '' || m.away === '';

      if (!exists || isIncomplete(exists)) {
        const id = exists ? exists.id : (match.id || Date.now());
        const dt = new Date(match.utcDate);
        const brt = new Date(dt.getTime() - 3 * 3600000);
        const dd = brt.getUTCDate().toString().padStart(2,'0');
        const mm = (brt.getUTCMonth()+1).toString().padStart(2,'0');
        const hh = brt.getUTCHours().toString().padStart(2,'0');
        const mn = brt.getUTCMinutes();
        updates[`bolao/elimMatches/${id}`] = {
          id, phase, home: homePT, away: awayPT,
          apiMatchId: match.id,
          date: `${dd}/${mm}`,
          time: `${hh}h${mn > 0 ? mn.toString().padStart(2,'0') : ''}`,
          city: match.venue || '',
          noEarlyLock: exists?.noEarlyLock || null // preserva exceção de prazo definida manualmente pelo admin
        };
        console.log(`  ✅ ${exists?'Atualizado':'Novo'} confronto: ${homePT} × ${awayPT} (${phase})`);
      }

      // REGRA: empate em pênaltis conta como EMPATE no bolão (placar dos 120', sem pênaltis)
      let h, a, pensH, pensA;
      const duration = match.score?.duration;
      if (duration === 'PENALTY_SHOOTOUT') {
        const rt = match.score?.regularTime, et = match.score?.extraTime;
        // Só calcula se AMBOS os blocos de tempo existirem de fato — nunca assume 0 por padrão.
        // Isso evita gravar um falso 0x0 quando a API ainda não consolidou os dados do jogo.
        if (rt?.home === undefined || rt?.home === null || et?.home === undefined || et?.home === null) {
          h = undefined; a = undefined;
        } else {
          h = rt.home + et.home;
          a = rt.away + et.away;
        }
        pensH = match.score?.penalties?.home;
        pensA = match.score?.penalties?.away;
      } else {
        h = match.score?.fullTime?.home;
        a = match.score?.fullTime?.away;
      }
      const resultId = exists ? exists.id : (match.id || Date.now());
      const resultHome = exists ? exists.home : homePT;
      // Validação extra: só grava se o jogo está de fato FINISHED e o placar é um número válido
      if (match.status === 'FINISHED' && h !== null && h !== undefined && a !== null && a !== undefined && Number.isFinite(h) && Number.isFinite(a)) {
        const inv = resultHome === awayPT;
        resultUpdates[`bolao/results/e_${resultId}/h`] = String(inv ? a : h);
        resultUpdates[`bolao/results/e_${resultId}/a`] = String(inv ? h : a);
        if (pensH !== undefined && pensH !== null) {
          // Guarda o placar dos pênaltis só para exibição (não entra na pontuação)
          resultUpdates[`bolao/results/e_${resultId}/pensH`] = String(inv ? pensA : pensH);
          resultUpdates[`bolao/results/e_${resultId}/pensA`] = String(inv ? pensH : pensA);
        }
        console.log(`  ✅ Resultado elim: ${homePT} ${h}×${a} ${awayPT}${duration==='PENALTY_SHOOTOUT'?` [pênaltis ${pensH}×${pensA} — não contam p/ pontuação]`:''}`);
      } else if (duration === 'PENALTY_SHOOTOUT' && (h === undefined)) {
        console.log(`  ⏳ Jogo ${homePT} × ${awayPT} foi a pênaltis mas a API ainda não consolidou o placar dos 120min — aguardando próxima execução`);
      }
    });

    if (Object.keys(updates).length > 0) await db.ref('/').update(updates);
    if (Object.keys(resultUpdates).length > 0) await db.ref('/').update(resultUpdates);
    if (!Object.keys(updates).length && !Object.keys(resultUpdates).length)
      console.log('  ℹ️ Nenhuma atualização eliminatória');
  } catch(e) {
    console.error('Erro elim:', e.message);
  }
}

async function main() {
  await syncResults();
  await syncElim();
  console.log('✅ Concluído:', new Date().toISOString());
  process.exit(0);
}

main();
