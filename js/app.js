// App principal — fluxo fiel ao JogoDaVelhaAtualizado.java (Swing, 2022),
// com o modo extra "Impossível" (minimax do Teste.java).
import { testarVitoria, jogadaHeuristica, LINHAS, JOGADOR_1, JOGADOR_2 } from './ai-heuristica.js';
import { jogadaMinimax, estadoJogo } from './ai-minimax.js';

const $ = (sel) => document.querySelector(sel);

const hudVez = $('#vez');
const blocos = [...document.querySelectorAll('.bloco')];
const toast = $('#toast');
const modalInicio = $('#modal-inicio');
const modalFim = $('#modal-fim');
const tituloFim = $('#titulo-fim');
const placarEl = $('#placar');

// "contra": 1 = Player vs Player | 2 = Player vs PC (heurística) | 3 = Impossível (minimax)
let modo = null;
let tabuleiro = new Array(9).fill(0);
let jogadorVez = JOGADOR_1;
let travado = false;
const placar = { vitorias: 0, empates: 0, derrotas: 0 };

const IMG_CIRCULO = 'img/bola.png'; // Jogador 1 (fiel: src/partePrincipal/bola.png)
const IMG_X = 'img/x.png';         // Jogador 2 (fiel: src/partePrincipal/x.png)

function iniciarModo(escolhido) {
  modo = escolhido;
  modalInicio.hidden = true;
  novaPartida();
}

function novaPartida() {
  tabuleiro = new Array(9).fill(0);
  jogadorVez = JOGADOR_1;
  travado = false;
  blocos.forEach((b) => {
    b.innerHTML = '';
    b.disabled = false;
    b.classList.remove('vencedor');
  });
  atualizarVez();
}

function atualizarVez() {
  const pcJoga = modo !== 1 && jogadorVez === JOGADOR_2;
  hudVez.textContent = pcJoga ? 'PC pensando...' : `Jogador ${jogadorVez}`;
  hudVez.className = `vez ${jogadorVez === JOGADOR_1 ? 'vez-j1' : 'vez-j2'}`;
}

function jogar(i) {
  if (travado || tabuleiro[i] !== 0) {
    if (!travado) mostrarToast('Movimento Indisponível!');
    return;
  }

  marcarCasa(i, jogadorVez);

  if (testarVitoria(tabuleiro, jogadorVez)) {
    destacarVitoria(jogadorVez);
    finalizar(jogadorVez === JOGADOR_2 && modo !== 1 ? 'PC Venceu!' : `Jogador ${jogadorVez} Venceu!`);
    return;
  }
  if (tabuleiro.every((v) => v !== 0)) {
    finalizar('Deu velha!');
    return;
  }

  jogadorVez = jogadorVez === JOGADOR_1 ? JOGADOR_2 : JOGADOR_1;
  atualizarVez();

  // Modos vs PC: o PC responde logo após a jogada do humano (fiel ao original)
  if (modo !== 1 && jogadorVez === JOGADOR_2) {
    travado = true;
    setTimeout(() => {
      const jogada = modo === 3 ? jogadaMinimax(tabuleiro) : jogadaHeuristica(tabuleiro);
      marcarCasa(jogada, JOGADOR_2);
      travado = false;

      if (testarVitoria(tabuleiro, JOGADOR_2)) {
        destacarVitoria(JOGADOR_2);
        finalizar('PC Venceu!');
      } else if (tabuleiro.every((v) => v !== 0)) {
        finalizar('Deu velha!');
      } else {
        jogadorVez = JOGADOR_1;
        atualizarVez();
      }
    }, 420);
  }
}

function marcarCasa(i, jog) {
  tabuleiro[i] = jog;
  const img = document.createElement('img');
  img.src = jog === JOGADOR_1 ? IMG_CIRCULO : IMG_X;
  img.alt = jog === JOGADOR_1 ? 'Círculo' : 'X';
  blocos[i].appendChild(img);
}

function destacarVitoria(jog) {
  const linha = LINHAS.find(([a, b, c]) =>
    tabuleiro[a] === jog && tabuleiro[b] === jog && tabuleiro[c] === jog);
  if (linha) linha.forEach((i) => blocos[i].classList.add('vencedor'));
}

function finalizar(mensagem) {
  travado = true;
  if (modo === 3) {
    if (mensagem === 'Deu velha!') placar.empates++;
    else if (mensagem === 'PC Venceu!') placar.derrotas++;
    else placar.vitorias++;
    placarEl.hidden = false;
    placarEl.textContent = `${placar.vitorias} Vitórias · ${placar.empates} Empates · ${placar.derrotas} Derrotas`;
  } else {
    placarEl.hidden = true;
  }
  tituloFim.textContent = mensagem;
  setTimeout(() => { modalFim.hidden = false; }, 650);
}

let toastTimer = null;
function mostrarToast(texto) {
  toast.textContent = texto;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 1600);
}

blocos.forEach((b) => b.addEventListener('click', () => jogar(Number(b.dataset.i))));
$('#btn-pvp').addEventListener('click', () => iniciarModo(1));
$('#btn-pc').addEventListener('click', () => iniciarModo(2));
$('#btn-impossivel').addEventListener('click', () => iniciarModo(3));
$('#btn-restart').addEventListener('click', () => { modalFim.hidden = true; novaPartida(); });
$('#btn-sair').addEventListener('click', () => {
  modalFim.hidden = true;
  modalInicio.hidden = false;
  travado = true;
});
