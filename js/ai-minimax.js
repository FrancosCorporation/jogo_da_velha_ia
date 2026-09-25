// IA Minimax — port do Teste.java (minimax clássico sem poda alfa-beta, sem ponderação
// por profundidade, com desempate aleatório — fiel ao original didático).
// O PC (X = 2) é o maximizador; o humano (círculo = 1) é o minimizador.

import { LINHAS, JOGADOR_1, JOGADOR_2 } from './ai-heuristica.js';

// -1 = andamento | 1/2 = vencedor | 3 = empate
export function estadoJogo(tabuleiro) {
  for (const jog of [JOGADOR_1, JOGADOR_2]) {
    if (LINHAS.some(([a, b, c]) =>
      tabuleiro[a] === jog && tabuleiro[b] === jog && tabuleiro[c] === jog)) {
      return jog;
    }
  }
  return tabuleiro.every((v) => v !== 0) ? 3 : -1;
}

function maxValor(tabuleiro) {
  const estado = estadoJogo(tabuleiro);
  if (estado === JOGADOR_2) return 1;
  if (estado === JOGADOR_1) return -1;
  if (estado === 3) return 0;

  let melhor = -Infinity;
  for (let i = 0; i < 9; i++) {
    if (tabuleiro[i] !== 0) continue;
    tabuleiro[i] = JOGADOR_2;
    melhor = Math.max(melhor, minValor(tabuleiro));
    tabuleiro[i] = 0;
  }
  return melhor;
}

function minValor(tabuleiro) {
  const estado = estadoJogo(tabuleiro);
  if (estado === JOGADOR_2) return 1;
  if (estado === JOGADOR_1) return -1;
  if (estado === 3) return 0;

  let pior = Infinity;
  for (let i = 0; i < 9; i++) {
    if (tabuleiro[i] !== 0) continue;
    tabuleiro[i] = JOGADOR_1;
    pior = Math.min(pior, maxValor(tabuleiro));
    tabuleiro[i] = 0;
  }
  return pior;
}

// Retorna o índice da melhor jogada para o PC; empates de valor são sorteados (fiel ao original).
export function jogadaMinimax(tabuleiro) {
  let melhorValor = -Infinity;
  let melhores = [];
  for (let i = 0; i < 9; i++) {
    if (tabuleiro[i] !== 0) continue;
    tabuleiro[i] = JOGADOR_2;
    const valor = minValor(tabuleiro);
    tabuleiro[i] = 0;
    if (valor > melhorValor) {
      melhorValor = valor;
      melhores = [i];
    } else if (valor === melhorValor) {
      melhores.push(i);
    }
  }
  return melhores[Math.floor(Math.random() * melhores.length)];
}
