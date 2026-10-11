// App principal — fluxo fiel ao JogoDaVelhaAtualizado.java (Swing, 2022),
// com os modos Fácil (heurística com erro), Médio (heurística), Difícil/Impossível
// (minimax do Teste.java) e LLM 100% local (WebLLM/WebGPU).
import { testarVitoria, jogadaHeuristica, jogadaFacil, LINHAS, JOGADOR_1, JOGADOR_2 } from './ai-heuristica.js';
import { jogadaMinimax, estadoJogo } from './ai-minimax.js';
import { escolheViaLLM, carregaLLM, placaWebGPU, PADRAO as LLM_PADRAO } from './llm.js';

const $ = (sel) => document.querySelector(sel);

const hudVez = $('#vez');
const blocos = [...document.querySelectorAll('.bloco')];
const toast = $('#toast');
const modalInicio = $('#modal-inicio');
const modalFim = $('#modal-fim');
const tituloFim = $('#titulo-fim');
const placarEl = $('#placar');
const llmBox = $('#llm-box');
const llmModelo = $('#llm-modelo');
const llmCarregar = $('#llm-carregar');
const llmStatus = $('#llm-status');

// "contra": 1 = PvP | 2 = PC Médio (heurística) | 3 = Difícil/Impossível (minimax)
//           4 = PC Fácil (heurística com erro) | 5 = LLM (roda no navegador)
let modo = null;
let tabuleiro = new Array(9).fill(0);
let jogadorVez = JOGADOR_1;
let travado = false;
let sessao = 0; // guarda anti-race: sair/restart no meio do "pensando" não deixa a IA jogar no jogo novo
const placar = { vitorias: 0, empates: 0, derrotas: 0 };

const IMG_CIRCULO = 'img/bola.png'; // Jogador 1 (fiel: src/partePrincipal/bola.png)
const IMG_X = 'img/x.png';         // Jogador 2 (fiel: src/partePrincipal/x.png)

function cfgLLM() {
  return { modelo: llmModelo.value || LLM_PADRAO.modelo };
}
function salvaCfgLLM() {
  try { localStorage.setItem('velha-llm', JSON.stringify({ modelo: llmModelo.value })); } catch {}
}
try { // recupera o que tava salvo
  const s = JSON.parse(localStorage.getItem('velha-llm') || '{}');
  if (s.modelo) llmModelo.value = s.modelo;
} catch {}
function sincronizaPainelLLM() {
  llmBox.hidden = modo !== 5;
}
// carrega o modelo: na placa (WebGPU) se houver; senão na RAM/CPU do navegador (1ª vez baixa ~350MB
// e fica no cache; depois é 100% local) — SEM WebGPU o modo LLM também funciona
async function carregaModeloLLM() {
  const placa = await placaWebGPU();
  llmStatus.textContent = placa
    ? 'placa ' + placa.vendor + (placa.arquitetura ? '/' + placa.arquitetura : '') + ' — preparando… 0%'
    : 'sem WebGPU — preparando o modo CPU (RAM do seu sistema)… 0%';
  try {
    const { tipo } = await carregaLLM(cfgLLM(), p => {
      llmStatus.textContent = 'baixando modelo… ' + Math.round(p * 100) + '%';
    });
    llmStatus.textContent = tipo === 'gpu'
      ? '✔ modelo pronto na placa (' + placa.vendor + ') — roda 100% local'
      : '✔ modelo pronto na CPU (RAM do sistema) — 100% local, qualquer navegador';
  } catch (e) {
    llmStatus.textContent = '⚠ ' + (e && e.message ? e.message : e);
  }
}
llmCarregar.addEventListener('click', carregaModeloLLM);
llmModelo.addEventListener('change', () => { salvaCfgLLM(); if (modo === 5) carregaModeloLLM(); });

function iniciarModo(escolhido) {
  modo = escolhido;
  modalInicio.hidden = true;
  sincronizaPainelLLM();
  if (modo === 5) carregaModeloLLM(); // começa a baixar o modelo já, no ato de escolher o modo
  novaPartida();
}

function novaPartida() {
  sessao++;
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
  hudVez.textContent = pcJoga ? (modo === 5 ? 'IA LLM pensando…' : 'PC pensando...') : `Jogador ${jogadorVez}`;
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
    const idSessao = sessao;
    if (modo === 5) {
      // ===== MODO LLM: o modelo escolhe entre as casas que o minimax já avaliou =====
      escolheViaLLM(tabuleiro, { lance: 1 }, cfgLLM(), {
        progresso: p => { if (sessao === idSessao) llmStatus.textContent = 'baixando modelo… ' + Math.round(p * 100) + '%'; },
      }).then(r => {
        if (sessao !== idSessao) return; // saiu/reiniciou no meio
        travado = false;
        if (r.origem === 'llm') mostrarToast('IA LLM: ' + r.motivo);
        const jogada = r.casa !== null && r.casa !== undefined
          ? r.casa
          : jogadaMinimax(tabuleiro); // fallback: minimax assume (o jogo nunca trava)
        marcarCasa(jogada, JOGADOR_2);

        if (testarVitoria(tabuleiro, JOGADOR_2)) {
          destacarVitoria(JOGADOR_2);
          finalizar('PC Venceu!');
        } else if (tabuleiro.every((v) => v !== 0)) {
          finalizar('Deu velha!');
        } else {
          jogadorVez = JOGADOR_1;
          atualizarVez();
        }
      });
      return;
    }
    setTimeout(() => {
      if (sessao !== idSessao) return; // saiu/reiniciou no meio
      const jogada = modo === 3 ? jogadaMinimax(tabuleiro)
                   : modo === 4 ? jogadaFacil(tabuleiro)
                   : jogadaHeuristica(tabuleiro);
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
  if (modo !== 1) {
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
$('#btn-facil').addEventListener('click', () => iniciarModo(4));
$('#btn-pc').addEventListener('click', () => iniciarModo(2));
$('#btn-impossivel').addEventListener('click', () => iniciarModo(3));
$('#btn-llm').addEventListener('click', () => iniciarModo(5));
$('#btn-restart').addEventListener('click', () => { modalFim.hidden = true; novaPartida(); });
$('#btn-sair').addEventListener('click', () => {
  modalFim.hidden = true;
  modalInicio.hidden = false;
  travado = true;
  sessao++; // cancela qualquer resposta do PC/LLM pendente
  llmStatus.textContent = '';
});
