// IA de LLM 100% local — o modelo roda DENTRO do navegador (WebGPU + WebLLM), junto com o JS do jogo.
// ZERO servidor / ZERO API: os pesos são baixados UMA vez (~350MB), ficam no cache do navegador e a
// inferência acontece na placa de vídeo (RAM/VRAM) da máquina do jogador.
// O LLM não inventa jogada: escolhe ENTRE as casas que o MINIMAX já avaliou (scores no prompt).
// Resposta inválida/fora da lista/falha de WebGPU → volta o minimax clássico (o jogo nunca trava).

import { candidatosAvaliados } from './ai-minimax.js';
import { casasVazias } from './ai-heuristica.js';

export const PADRAO = { modelo: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC' };

export const MODELOS = [
  { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', nome: 'Qwen2.5-0.5B — padrão (rápido, obedece o JSON)' },
  { id: 'SmolLM2-360M-Instruct-q4f16_1-MLC', nome: 'SmolLM2-360M — leve (resposta instantânea)' },
];

const SISTEMA = 'Você é a IA de um jogo da velha no navegador. Responda APENAS com JSON válido, sem ``` e sem texto fora do JSON, sem raciocínio.';

const ROTULO = ['canto superior esquerdo', 'topo centro', 'canto superior direito', 'meio esquerdo', 'centro', 'meio direito', 'canto inferior esquerdo', 'base centro', 'canto inferior direito'];

// monta o prompt (curto = rápido): tabuleiro compacto + menu de casas avaliadas pelo minimax
export function montaPrompt(tabuleiro, cands, ctx = {}) {
  const linhas = [];
  for (let l = 0; l < 3; l++) {
    let linha = '';
    for (let c = 0; c < 3; c++) {
      const v = tabuleiro[l * 3 + c];
      linha += v === 0 ? '.' : v === 1 ? 'O' : 'X';
    }
    linhas.push(linha);
  }
  const candsTxt = cands.map((c, i) => {
    const rotulo = c.casa === 4 ? 'centro' : `${c.casa + 1} (${ROTULO[c.casa]})`;
    const score = c.score > 0 ? '+1' : String(c.score);
    return `${i + 1}. casa ${rotulo} | score ${score}`;
  });
  return [
    'Jogo: jogo da velha 3x3. Voce e o X (jogador 2) e joga DEPOIS do O.',
    'Casas 1-9 (1 = canto superior esquerdo, 5 = centro, 9 = canto inferior direito).',
    'Tabuleiro (3 linhas de 3 casas, de cima pra baixo; . = vazia, X = voce, O = adversario):',
    ...linhas,
    `Regras: 3 em linha vence; tabuleiro cheio = empate (deu velha).`,
    `Este e a sua jogada ${ctx.lance || 1}.`,
    `CANDIDATOS (avaliados pelo minimax; maior score = melhor; +1 = caminho da vitoria, 0 = empate, -1 = DERROTA; ha ${cands.length} candidatos, numerados 1 a ${cands.length}):`,
    ...candsTxt,
    `Escolha EXATAMENTE UM candidato do texto acima. Seu "i" deve ser um numero de 1 a ${cands.length}.`,
    `Responda APENAS JSON no formato {"i": <numero>, "motivo": "<uma frase curta em pt-BR>"} — nada fora do JSON.`,
  ].join('\n');
}

// aceita JSON puro, JSON dentro de ```json ... ```, texto com {...} no meio e
// até "}}" (modelo pequeno às vezes fecha a chave duas vezes — pega o 1º objeto balanceado)
export function extraiEscolha(texto) {
  if (!texto) return null;
  let t = String(texto).trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const a = t.indexOf('{');
  if (a < 0) return null;
  let prof = 0, fim = -1;
  for (let k = a; k < t.length; k++) {
    const ch = t[k];
    if (ch === '{') prof++;
    else if (ch === '}') { prof--; if (prof === 0) { fim = k; break; } }
  }
  if (fim < 0) return null;
  try { return JSON.parse(t.slice(a, fim + 1)); } catch { return null; }
}

// valida contra o menu: i precisa apontar pra uma casa existente
export function validaEscolha(escolha, cands) {
  if (!escolha || typeof escolha !== 'object') return null;
  const i = Math.trunc(Number(escolha.i));
  if (!Number.isFinite(i) || i < 1 || i > cands.length) return null;
  const motivo = typeof escolha.motivo === 'string' && escolha.motivo.trim()
    ? escolha.motivo.trim().slice(0, 120) : 'escolheu pelo menu avaliado';
  return { idx: i - 1, cand: cands[i - 1], motivo };
}

// --- motor local: WebLLM embutido no repo (js/vendor), modelo no cache do navegador ---------------
let motor = null;
let motorModelo = null;
let carregando = null;

// informa a placa WebGPU (null = navegador sem WebGPU / placa não ativa)
export async function placaWebGPU() {
  if (!globalThis.navigator || !navigator.gpu) return null;
  try {
    const a = await navigator.gpu.requestAdapter();
    if (!a) return null;
    const info = a.info || {};
    return { vendor: info.vendor || 'ok', arquitetura: info.architecture || info.device || '' };
  } catch { return null; }
}

// carrega (e deixa em cache) o modelo na placa — 1ª vez baixa, próximas instantâneo
export async function carregaWebLLM(modelo = PADRAO.modelo, onProgress) {
  if (motor && motorModelo === modelo) return motor;
  if (carregando) return carregando;
  carregando = (async () => {
    if (!globalThis.navigator || !navigator.gpu) throw new Error('WebGPU indisponível neste navegador');
    const adapt = await navigator.gpu.requestAdapter();
    if (!adapt) throw new Error('placa WebGPU não ativa (veja o README: flags do Chrome/Brave)');
    const webllm = await import('./vendor/webllm.esm.js');
    const eng = await webllm.CreateMLCEngine(modelo, {
      initProgressCallback: p => onProgress && onProgress(p.progress || 0),
      logLevel: 'ERROR',
    });
    if (motor) { try { await motor.unload(); } catch {} }
    motor = eng;
    motorModelo = modelo;
    return eng;
  })();
  try { return await carregando; } finally { carregando = null; }
}

export function modeloCarregado() { return motorModelo; }

export function descarregaLLM() {
  const m = motor;
  motor = null;
  motorModelo = null;
  if (m) { try { m.unload(); } catch {} }
}

async function chatLocal(prompt, onProgress, cfg) {
  const eng = await carregaWebLLM((cfg && cfg.modelo) || PADRAO.modelo, onProgress);
  const r = await eng.chat.completions.create({
    messages: [{ role: 'system', content: SISTEMA }, { role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 300,
  });
  const texto = r && r.choices && r.choices[0] && r.choices[0].message
    ? (r.choices[0].message.content || '') : '';
  // hook de debug/E2E: deixa a última resposta crua visível pro teste
  globalThis.__ultimaRespLLM = texto;
  return texto;
}

function erroCurto(e) {
  const m = e && e.message ? String(e.message) : String(e);
  if (/WebGPU|placa WebGPU/.test(m)) return m;
  if (/fetch|network|carreg|load/i.test(m)) return 'falha ao baixar o modelo';
  return 'LLM indisponível (' + m.slice(0, 60) + ')';
}

// jogada do turno: casas avaliadas → LLM escolhe → validação → ou fallback no minimax
export async function escolheViaLLM(tabuleiro, ctx, cfg = {}, deps = {}) {
  const avalia = deps.avaliacoes || candidatosAvaliados;
  const candidatos = avalia(tabuleiro);
  globalThis.__candLLM = candidatos.length; // hook de debug/E2E
  if (!candidatos.length) return { casa: null, motivo: 'nenhum candidato', origem: 'minimax' };

  const prompt = montaPrompt(tabuleiro, candidatos, ctx);
  try {
    const pede = deps.chat ? (p => deps.chat(p)) : (p => chatLocal(p, deps.progresso, cfg));
    let texto = await pede(prompt);
    let escolha = validaEscolha(extraiEscolha(texto), candidatos);
    if (!escolha && deps.retry !== false) {
      // 2ª chance: avisa o limite exato (modelo pequeno às vezes inventa índice)
      const p2 = prompt + `\nERRO: i invalido. Use somente numeros de 1 a ${candidatos.length}. Responda de novo, APENAS o JSON.`;
      texto = await pede(p2);
      escolha = validaEscolha(extraiEscolha(texto), candidatos);
    }
    if (escolha) {
      return { casa: escolha.cand.casa, motivo: escolha.motivo, origem: 'llm' };
    }
    return { casa: null, motivo: 'resposta do LLM inválida', origem: 'minimax' };
  } catch (e) {
    return { casa: null, motivo: erroCurto(e), origem: 'minimax' };
  }
}
