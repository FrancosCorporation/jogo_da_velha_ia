// Testes do Modo LLM 100% local (navegador) + modos de dificuldade: prompt com tabuleiro + casas,
// extração de JSON, validação do menu, fallback no minimax e o caminho do motor — SEM rede.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estadoJogo, candidatosAvaliados, jogadaMinimax } from '../js/ai-minimax.js';
import { jogadaHeuristica, jogadaFacil, casasVazias } from '../js/ai-heuristica.js';
import {
  montaPrompt, extraiEscolha, validaEscolha, escolheViaLLM,
  carregaWebLLM, carregaLLM, motorEscolhido, MODELO_CPU, placaWebGPU, PADRAO, MODELOS,
} from '../js/llm.js';

test('montaPrompt: tabuleiro compacto + candidatos com score + instrução de JSON', () => {
  const tab = new Array(9).fill(0);
  const cands = candidatosAvaliados(tab);
  assert.equal(cands.length, 9, '9 casas vazias no início');
  const p = montaPrompt(tab, cands, { lance: 2 });
  assert.ok(p.includes('3 linhas de 3 casas'), 'tabuleiro compacto');
  assert.ok(p.includes('sua jogada 2'), 'qual jogada');
  assert.ok(p.includes('score'), 'cada casa tem score do minimax');
  assert.ok(p.includes('1.'), 'lista numerada');
  assert.ok(p.includes('"i"'), 'pede JSON com o índice');
  assert.ok(p.includes(`numerados 1 a ${cands.length}`), 'limite explícito do menu');
  assert.ok(p.includes(`de 1 a ${cands.length}`), 'i com limite no final');
});

test('montaPrompt: casas 1-9 com rótulo (o LLM lê casas, não índice cru)', () => {
  const p = montaPrompt(new Array(9).fill(0), candidatosAvaliados(new Array(9).fill(0)));
  assert.ok(/casa \d+/.test(p), 'casa numerada');
  assert.ok(p.includes('centro'), 'o centro tem rótulo');
});

test('candidatosAvaliados: só casas vazias, ordenado do melhor pro pior (1 vence, -1 perde)', () => {
  const tab = [1, 2, 1, 2, 0, 0, 0, 0, 0]; // o X (jogador 2) joga
  const cands = candidatosAvaliados(tab);
  assert.equal(cands.length, 5, '5 casas vazias');
  for (let k = 1; k < cands.length; k++) {
    assert.ok(cands[k - 1].score >= cands[k].score, 'ordenado');
  }
  assert.ok(cands[0].score >= 0, 'a IA nunca recebe uma jogada perdedora como melhor opção');
});

test('escolheViaLLM: 1ª resposta inválida → RETRY com o limite → 2ª válida joga', async () => {
  const tab = new Array(9).fill(0);
  let chamadas = 0;
  const r = await escolheViaLLM(tab, { lance: 1 }, PADRAO, {
    chat: async (p) => {
      chamadas++;
      if (chamadas === 1) return '{"i": 42, "motivo": "inventei índice"}';
      assert.ok(p.includes('ERRO: i invalido'), 'retry avisa o limite');
      return '{"i": 1, "motivo": "segunda tentativa"}';
    },
  });
  assert.equal(chamadas, 2, 'duas chamadas');
  assert.equal(r.origem, 'llm');
  assert.equal(r.motivo, 'segunda tentativa');
});

test('escolheViaLLM: resposta válida na 1ª não gasta retry', async () => {
  const tab = new Array(9).fill(0);
  let chamadas = 0;
  await escolheViaLLM(tab, { lance: 1 }, PADRAO, {
    chat: async () => { chamadas++; return '{"i": 2, "motivo": "ok"}'; },
  });
  assert.equal(chamadas, 1);
});

test('extraiEscolha: JSON puro, dentro de ``` e no meio do texto', () => {
  assert.deepEqual(extraiEscolha('{"i":3,"motivo":"bom"}'), { i: 3, motivo: 'bom' });
  assert.deepEqual(extraiEscolha('```json\n{"i":1,"motivo":"x"}\n```'), { i: 1, motivo: 'x' });
  assert.deepEqual(extraiEscolha('Claro! Aqui está: {"i":2,"motivo":"y"} espero que sirva'), { i: 2, motivo: 'y' });
  assert.equal(extraiEscolha('não sei nada'), null);
  assert.equal(extraiEscolha(''), null);
  assert.equal(extraiEscolha('{quebrado'), null);
  assert.deepEqual(extraiEscolha('{"i":4,"motivo":"dupla"}}'), { i: 4, motivo: 'dupla' }, 'chave }} extra');
});

test('validaEscolha: só aceita índice dentro do menu', () => {
  const menu = [{ casa: 0 }, { casa: 4 }, { casa: 8 }];
  const ok = validaEscolha({ i: 2, motivo: 'escolhi o 2' }, menu);
  assert.equal(ok.idx, 1, 'i é 1-based');
  assert.equal(ok.cand, menu[1]);
  assert.equal(ok.motivo, 'escolhi o 2');
  assert.equal(validaEscolha({ i: 0 }, menu), null, 'i=0 inválido');
  assert.equal(validaEscolha({ i: 4 }, menu), null, 'fora do menu');
  assert.equal(validaEscolha({ i: 'abc' }, menu), null, 'não numérico');
  assert.equal(validaEscolha(null, menu), null);
  const semMotivo = validaEscolha({ i: 1 }, menu);
  assert.ok(semMotivo.motivo.length > 0, 'motivo padrão quando falta');
});

test('PADRAO/MODELOS: modelo padrão existe na lista (é o Qwen que obedece o JSON)', () => {
  assert.ok(MODELOS.some(m => m.id === PADRAO.modelo), 'padrão na lista');
  assert.ok(PADRAO.modelo.includes('Qwen2.5-0.5B'), 'escolhido pelo teste real de velocidade/JSON');
});

test('escolheViaLLM: resposta válida → o LLM joga numa casa VAZIA de verdade', async () => {
  const tab = [1, 0, 0, 0, 2, 0, 0, 0, 0];
  const cands = candidatosAvaliados(tab);
  const r = await escolheViaLLM(tab, { lance: 1 }, PADRAO, {
    chat: async () => JSON.stringify({ i: 1, motivo: 'melhor opção' }),
  });
  assert.equal(r.origem, 'llm');
  assert.equal(r.motivo, 'melhor opção');
  assert.equal(r.casa, cands[0].casa);
  assert.equal(tab[r.casa], 0, 'a casa era vazia (o LLM nunca sobrescreve)');
});

test('escolheViaLLM: prompt chega inteiro pro modelo (tabuleiro + candidatos)', async () => {
  const tab = new Array(9).fill(0);
  let capturado = '';
  await escolheViaLLM(tab, { lance: 2 }, PADRAO, {
    chat: async (p) => { capturado = p; return '{"i":1,"motivo":"x"}'; },
  });
  assert.ok(capturado.includes('CANDIDATOS'), 'vem com o menu avaliado');
  assert.ok(capturado.includes('sua jogada 2'), 'contexto do turno');
});

test('escolheViaLLM: motor quebrado/sem placa → fallback no minimax (o jogo nunca trava)', async () => {
  const tab = new Array(9).fill(0);
  const r = await escolheViaLLM(tab, { lance: 1 }, PADRAO, {
    chat: async () => { throw new Error('WebGPU indisponível neste navegador'); },
  });
  assert.equal(r.origem, 'minimax');
  assert.equal(r.casa, null, 'app aplica o minimax por fora');
  assert.ok(r.motivo.includes('WebGPU'), r.motivo);
});

test('escolheViaLLM: resposta fora do menu (i=99) → retry falha → fallback', async () => {
  const tab = new Array(9).fill(0);
  const r = await escolheViaLLM(tab, { lance: 1 }, PADRAO, {
    chat: async () => '{"i":99,"motivo":"inventei"}',
  });
  assert.equal(r.origem, 'minimax');
  assert.equal(r.casa, null);
  assert.ok(r.motivo.includes('inválida'), r.motivo);
});

test('escolheViaLLM: texto livre do modelo (sem JSON) → fallback', async () => {
  const tab = new Array(9).fill(0);
  const r = await escolheViaLLM(tab, { lance: 1 }, PADRAO, {
    chat: async () => 'Eu acho que devo jogar no centro, mas não sei...',
  });
  assert.equal(r.origem, 'minimax');
  assert.equal(r.casa, null);
});

test('escolheViaLLM: jogada do LLM é SEMPRE uma casa do minimax (nunca inventa)', async () => {
  const tab = [0, 1, 0, 0, 2, 0, 0, 0, 0];
  const cands = candidatosAvaliados(tab);
  for (let i = 1; i <= cands.length; i++) {
    const r = await escolheViaLLM(tab, { lance: 1 }, PADRAO, {
      chat: async () => JSON.stringify({ i, motivo: 'x' }),
    });
    assert.equal(r.origem, 'llm');
    assert.equal(r.casa, cands[i - 1].casa, 'casa = do menu (candidato ' + i + ')');
  }
});

test('carregaWebLLM fora do navegador: erro claro de WebGPU (sem rede, sem servidor)', async () => {
  await assert.rejects(() => carregaWebLLM(PADRAO.modelo), /WebGPU indisponível/, 'mensagem em pt-BR');
});

test('placaWebGPU: sem navigator.gpu no Node → null (modo minimax)', async () => {
  const p = await placaWebGPU();
  assert.equal(p, null);
});

// ===== modos de dificuldade (a ligação nova) =====

test('modo FÁCIL: jogadaFacil devolve casa vazia legal (com taxa de erro)', () => {
  const tab = new Array(9).fill(0);
  for (let k = 0; k < 50; k++) {
    const i = jogadaFacil(tab);
    assert.ok(i >= 0 && i < 9, 'casa válida');
    assert.equal(tab[i], 0, 'casa vazia');
  }
});

test('modo FÁCIL: com erro=0 joga IGUAL ao médio (a heurística pura)', () => {
  const tab = [1, 1, 0, 2, 2, 0, 0, 0, 0];
  // média: fechar a própria linha (0-1-2) — a jogadaFacil com erro 0 também
  assert.equal(jogadaFacil(tab, 0), jogadaHeuristica(tab), 'erro=0 = heurística pura');
});

test('modos: FÁCIL erra (35% de erro gera lances diferentes da heurística em partidas longas)', () => {
  const tab = [1, 2, 1, 2, 0, 0, 0, 0, 0];
  const medias = new Set();
  const faceis = new Set();
  for (let k = 0; k < 40; k++) {
    medias.add(jogadaHeuristica(tab));
    faceis.add(jogadaFacil(tab));
  }
  assert.ok(medias.size === 1, 'média é determinística');
  assert.ok(faceis.size > 1, 'fácil erra às vezes (jogadas variadas)');
});

// --- motor: o modo LLM NUNCA depende de placa de vídeo (GPU acelera; CPU/RAM é o fallback) ---

test('carregaLLM: sem WebGPU → motor CPU (RAM do sistema) — o modo LLM nunca fica indisponível', async () => {
  let gpuTentada = false;
  const r = await carregaLLM({ modelo: PADRAO.modelo }, null, {
    placa: null,
    carregaGPU: async () => { gpuTentada = true; throw new Error('WebGPU indisponível neste navegador'); },
    carregaCPU: async () => 'motor-cpu',
  });
  assert.equal(r.tipo, 'cpu');
  assert.equal(r.eng, 'motor-cpu');
  assert.equal(gpuTentada, false, 'sem placa nem tenta a GPU');
});

test('carregaLLM: com placa → GPU (WebLLM) é o caminho normal, CPU não é chamado', async () => {
  const r = await carregaLLM({}, null, {
    placa: { vendor: 'teste' },
    carregaGPU: async () => 'motor-gpu',
    carregaCPU: async () => { throw new Error('CPU não devia ser chamado'); },
  });
  assert.equal(r.tipo, 'gpu');
  assert.equal(r.eng, 'motor-gpu');
  assert.equal(r.placa.vendor, 'teste');
});

test('carregaLLM: placa existe mas WebGPU quebra → cai no CPU na sequência', async () => {
  const r = await carregaLLM({}, null, {
    placa: { vendor: 'teste' },
    carregaGPU: async () => { throw new Error('placa WebGPU não ativa (veja o README)'); },
    carregaCPU: async () => 'motor-cpu',
  });
  assert.equal(r.tipo, 'cpu');
  assert.equal(r.eng, 'motor-cpu');
});

test('carregaLLM: falha de download/redes na GPU NÃO cai no CPU (não duplica o download)', async () => {
  await assert.rejects(() => carregaLLM({}, null, {
    placa: { vendor: 'teste' },
    carregaGPU: async () => { throw new Error('falha ao baixar o modelo'); },
    carregaCPU: async () => 'motor-cpu',
  }), /falha ao baixar/, 'erro real de rede é repassado, não mascarado');
});

test('carregaLLM: cfg.motor "gpu" não tem fallback silencioso; cfg "cpu" força a CPU mesmo com placa', async () => {
  await assert.rejects(() => carregaLLM({ motor: 'gpu' }, null, {
    placa: null,
    carregaCPU: async () => 'motor-cpu',
  }), /WebGPU/);
  const r = await carregaLLM({ motor: 'cpu' }, null, {
    placa: { vendor: 'teste' },
    carregaGPU: async () => { throw new Error('não devia'); },
    carregaCPU: async () => 'motor-cpu',
  });
  assert.equal(r.tipo, 'cpu', 'usuário pode escolher rodar só na CPU');
});

test('motorEscolhido: regra pura — sem placa = CPU (RAM do sistema), com placa = GPU', () => {
  assert.equal(motorEscolhido(null), 'cpu');
  assert.equal(motorEscolhido({ vendor: 'x' }), 'gpu');
});

test('MODELO_CPU: mesmo Qwen2.5-0.5B, quantização GGUF q4_k_m (caminho do llama.cpp na CPU)', () => {
  assert.equal(MODELO_CPU.repo, 'Qwen/Qwen2.5-0.5B-Instruct-GGUF');
  assert.equal(MODELO_CPU.arquivo, 'qwen2.5-0.5b-instruct-q4_k_m.gguf');
});
