// IA heurística — port fiel do método inteligenciaAtificial() de JogoDaVelhaAtualizado.java (2022).
// Casa vazia = 0 | Jogador 1 (círculo) = 1 | Jogador 2 / PC (X) = 2
// Ordem de decisão (idêntica ao original): 1) atacar  2) bloquear  3) centro  4) canto aleatório.

export const LINHAS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export const JOGADOR_1 = 1;
export const JOGADOR_2 = 2;

export function testarVitoria(tabuleiro, jog) {
  return LINHAS.some(([a, b, c]) =>
    tabuleiro[a] === jog && tabuleiro[b] === jog && tabuleiro[c] === jog
  );
}

export function casasVazias(tabuleiro) {
  return tabuleiro.reduce((acc, v, i) => (v === 0 ? [...acc, i] : acc), []);
}

export function jogadaHeuristica(tabuleiro, pc = JOGADOR_2, humano = JOGADOR_1) {
  // 1) Atacar: fechar linha própria com 2 marcas + 1 vazia
  for (const [a, b, c] of LINHAS) {
    const linha = [tabuleiro[a], tabuleiro[b], tabuleiro[c]];
    if (linha.filter((v) => v === pc).length === 2 && linha.includes(0)) {
      return [a, b, c][linha.indexOf(0)];
    }
  }

  // 2) Bloquear: linha do humano com 2 marcas + 1 vazia
  for (const [a, b, c] of LINHAS) {
    const linha = [tabuleiro[a], tabuleiro[b], tabuleiro[c]];
    if (linha.filter((v) => v === humano).length === 2 && linha.includes(0)) {
      return [a, b, c][linha.indexOf(0)];
    }
  }

  // 3) Centro, se vazio
  if (tabuleiro[4] === 0) return 4;

  // 4) Canto aleatório de índice par (0,2,6,8) — correção do bug original:
  //    agora só sorteia entre cantos VAZIOS (o Java podia sobrescrever casa ocupada)
  const cantos = [0, 2, 6, 8].filter((i) => tabuleiro[i] === 0);
  if (cantos.length > 0) {
    return cantos[Math.floor(Math.random() * cantos.length)];
  }

  // 5) Fallback: qualquer casa vazia (o original travava aqui em casos raros)
  const vazias = casasVazias(tabuleiro);
  return vazias.length > 0 ? vazias[Math.floor(Math.random() * vazias.length)] : -1;
}
