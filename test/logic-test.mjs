// Testes de lógica do Jogo da Velha (Node puro, sem deps).
// Uso: npm test  (ou node test/logic-test.mjs)
import { LINHAS, JOGADOR_1, JOGADOR_2, testarVitoria, jogadaHeuristica, casasVazias } from '../js/ai-heuristica.js';
import { jogadaMinimax, estadoJogo } from '../js/ai-minimax.js';

let falhas = 0;
function check(nome, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'} - ${nome}`);
  if (!cond) falhas++;
}

// --- testarVitoria: as 8 combinações, para os 2 jogadores ---
let ok = true;
for (const [a, b, c] of LINHAS) {
  for (const jog of [JOGADOR_1, JOGADOR_2]) {
    const t = new Array(9).fill(0);
    t[a] = t[b] = t[c] = jog;
    if (!testarVitoria(t, jog)) ok = false;
    if (testarVitoria(t, jog === 1 ? 2 : 1)) ok = false;
  }
}
check('testarVitoria reconhece as 8 linhas para ambos os jogadores', ok);
check('testarVitoria ignora tabuleiro vazio', !testarVitoria(new Array(9).fill(0), 1));

// --- estadoJogo: empate e andamento ---
check('estadoJogo: empate com tabuleiro cheio sem vencedor', estadoJogo([1, 2, 1, 2, 1, 2, 2, 1, 2]) === 3);
check('estadoJogo: andamento com casa vazia', estadoJogo([1, 0, 0, 0, 0, 0, 0, 0, 0]) === -1);

// --- Heurística: ataca linha própria com 2 marcas ---
{
  const t = [2, 2, 0, 0, 0, 0, 0, 0, 0];
  check('heurística fecha a própria linha (0-1-2)', jogadaHeuristica(t) === 2);
}
// --- Heurística: bloqueia ameaça do humano ---
{
  const t = [1, 1, 0, 0, 0, 0, 0, 0, 2];
  check('heurística bloqueia ameaça do humano na linha 0-1-2', jogadaHeuristica(t) === 2);
}
// --- Heurística: prefere atacar a bloquear ---
{
  const t = [2, 2, 0, 1, 1, 0, 0, 0, 0];
  check('heurística prioriza vitória própria sobre bloqueio', jogadaHeuristica(t) === 2);
}
// --- Heurística: centro quando não há ameaça ---
{
  const t = [0, 0, 0, 0, 0, 0, 0, 0, 1];
  check('heurística ocupa o centro', jogadaHeuristica(t) === 4);
}
// --- Heurística: canto vazio quando centro ocupado (fix do bug original) ---
{
  const t = [0, 1, 0, 0, 1, 2, 0, 2, 0]; // sem vitória imediata, centro ocupado
  const jogada = jogadaHeuristica(t);
  check('heurística joga em canto/casa vazia (nunca sobrescreve)', t[jogada] === 0 && jogada >= 0);
}

// --- Minimax: nunca perde contra 300 partidas aleatórias do humano ---
{
  let derrotas = 0;
  for (let partida = 0; partida < 300; partida++) {
    const t = new Array(9).fill(0);
    let vez = JOGADOR_1;
    while (estadoJogo(t) === -1) {
      const vazias = casasVazias(t);
      if (vez === JOGADOR_1) {
        t[vazias[Math.floor(Math.random() * vazias.length)]] = JOGADOR_1;
      } else {
        t[jogadaMinimax(t)] = JOGADOR_2;
      }
      vez = vez === JOGADOR_1 ? JOGADOR_2 : JOGADOR_1;
    }
    if (estadoJogo(t) === JOGADOR_1) derrotas++;
  }
  check(`minimax não perde em 300 partidas vs humano aleatório (derrotas: ${derrotas})`, derrotas === 0);
}

// --- Minimax: jogo perfeito dos dois lados termina sempre empatado ---
{
  // Humano perfeito = minimax pelo lado dele (via simetria: troca 1↔2, joga como maximizador)
  const jogadaHumanoPerfeito = (t) => {
    const espelhado = t.map((v) => (v === 1 ? 2 : v === 2 ? 1 : 0));
    return jogadaMinimax(espelhado);
  };
  let empatesSempre = true;
  for (let tentativa = 0; tentativa < 100; tentativa++) {
    const t = new Array(9).fill(0);
    let vez = JOGADOR_1;
    while (estadoJogo(t) === -1) {
      t[vez === JOGADOR_1 ? jogadaHumanoPerfeito(t) : jogadaMinimax(t)] = vez;
      vez = vez === JOGADOR_1 ? JOGADOR_2 : JOGADOR_1;
    }
    if (estadoJogo(t) !== 3) empatesSempre = false;
  }
  check('minimax vs minimax (jogo perfeito) termina sempre empatado', empatesSempre);
}

console.log(falhas === 0 ? '\nTODOS OS TESTES PASSARAM ✔' : `\n${falhas} TESTE(S) FALHARAM ✘`);
process.exit(falhas === 0 ? 0 : 1);
