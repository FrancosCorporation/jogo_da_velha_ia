# Jogo da Velha IA

![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow?logo=javascript&logoColor=white)
![Node](https://img.shields.io/badge/node-%3E%3D18-green?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-ativo%20(vers%C3%A3o%20web)-blue)
![Tests](https://img.shields.io/badge/testes-27%2F27%20passando-brightgreen)

Jogo da Velha no navegador com **cinco modos de jogo** e **três IAs** — versão web (2026) do projeto
Java/Swing de 2022, com os fontes originais preservados em [`java/`](java/).

**Jogar online:** https://francoscorporation.github.io/jogo_da_velha_ia/

## Modos de jogo

| Modo | Oponente | IA |
|---|---|---|
| **Player vs Player** | Outra pessoa no mesmo dispositivo | — |
| **Player vs PC Fácil** | PC heurística com taxa de erro (35% joga casa aleatória) | `js/ai-heuristica.js` |
| **Player vs PC Médio** | PC heurística de regras (ataca, bloqueia, ocupa o centro) | `js/ai-heuristica.js` |
| **Player vs PC Difícil (Impossível)** | PC imbatível com minimax clássico + placar de sessão | `js/ai-minimax.js` |
| **Player vs LLM** | LLM de verdade rodando no navegador (WebGPU ou CPU) | `js/llm.js` |

## Modo LLM — inteligência artificial local, sem servidor

Escolha "Player vs LLM" no início. Aí o jogo para de usar a heurística/minimax e passa a chamar
uma **LLM de verdade** — mas tudo rodando na sua própria máquina:

- **Zero servidor, zero API**: a biblioteca WebLLM está embutida no repositório
  (`js/vendor/webllm.esm.js`) e o modelo (Qwen2.5-0.5B, ~350MB) é baixado **uma única vez**
  pelo navegador, fica no cache local e a inferência acontece **dentro do navegador**.
  Depois do primeiro download, joga 100% offline.
- **NÃO depende de placa de vídeo** — o jogo escolhe o motor sozinho:
  - **Com WebGPU**: o modelo roda na GPU via WebLLM (~64 tok/s no Qwen2.5-0.5B) — o caminho rápido;
  - **Sem WebGPU / sem placa nenhuma**: o **mesmo modelo** (GGUF `q4_k_m`, ~350MB) roda na
    **RAM/CPU do seu sistema** com o llama.cpp compilado em WebAssembly (`@wllama/wllama`,
    embutido em `js/vendor/wllama/`). Funciona em qualquer navegador moderno — sem flag, sem
    driver, sem instalar nada. É mais lento (depende do seu processador) — para jogar rápido,
    ative o WebGPU (abaixo, opcional).
- **O LLM não inventa jogada**: o jogo manda pra ele o menu de casas que o MINIMAX já
  avaliou (+1 = caminho da vitória, 0 = empate, −1 = derrota) e ele escolhe UMA — respondendo
  `{"i": <nº>, "motivo": "<frase em pt-BR>"}`. Resposta fora do menu, JSON torto
  ou falha de qualquer motor → uma segunda tentativa com o limite explícito e, se ainda assim falhar,
  **o minimax clássico assume** (o jogo nunca trava).
- **Quer velocidade máxima? (opcional)** — ative o WebGPU uma vez e ele fica pra sempre:
  1. abra `chrome://flags/#enable-unsafe-webgpu` (no Brave: `brave://flags/#enable-unsafe-webgpu`)
  2. ponha **Enabled** e clique em **Relaunch** (reabra o navegador)
  3. recarregue o jogo — pronto, o painel mostra a placa e o modelo carrega na GPU
  Sem isso, o modo LLM segue funcionando na RAM do seu sistema (é só mais lento).

## Instalação e execução

Requer [Node.js 18+](https://nodejs.org/). Sem dependências externas — o projeto roda com Node puro:

```bash
npm ci         # instala a árvore sem dependências externas
npm start     # abre o servidor em http://localhost:3348
npm run check # verifica a sintaxe dos arquivos JavaScript
npm test      # roda 27 testes (lógica + modos + LLM, inclui a seleção de motor GPU/CPU)
```

Depois abra **http://localhost:3348** no navegador.

O servidor local publica somente os caminhos do jogo definidos na allowlist de `server.js`; ele não entrega `.git`, fontes Java, arquivos de configuração ou testes. Por padrão escuta apenas em `127.0.0.1`. Para disponibilizar na rede, defina `HOST=0.0.0.0` conscientemente. O modo LLM baixa os pesos do modelo do Hugging Face na primeira utilização.

Também é possível executar em container com `docker build -t jogo-da-velha .` e `docker run --rm -p 127.0.0.1:3348:3348 jogo-da-velha`. A porta fica acessível apenas na própria máquina; para disponibilizar na rede, publique a porta conscientemente.

> Alternativa sem Node: abra `index.html` num servidor estático qualquer (Python `http.server`,
> Live Server do VS Code, nginx...) — a versão web é 100% estática (HTML/CSS/JS).

## Funcionalidades

- Tabuleiro 3×3 clicável com as imagens originais do projeto Java (`img/bola.png` e `img/x.png`).
- Diálogo inicial escolhendo o modo (PvP, PC Fácil/Médio/Difícil, LLM) — fiel ao `JOptionPane` original.
- Indicador de vez no topo com as cores do original (Jogador 1 verde, Jogador 2 vermelho).
- Aviso "Movimento Indisponível!" ao clicar em casa ocupada (como no Java).
- Detecção de vitória (com destaque da linha vencedora) e empate ("Deu velha!").
- Modos vs PC com **placar de sessão** (vitórias/empates/derrotas), como no `Teste.java`.
- Modo LLM com painel de carregamento do modelo (WebLLM/WebGPU ou wllama/CPU, 100% local).
- IA heurística portada 1:1 do `JogoDaVelhaAtualizado.java`, com **correção do bug original**
  (o sorteio de canto agora só escolhe casas vazias — o Java podia sobrescrever uma jogada).
- Design responsivo (desktop e celular).

## História e arquitetura

Este repositório começou em 2022 como projeto de estudo **Java Swing** (Eclipse, JavaSE-12) para
praticar eventos, lógica de jogos e IA baseada em regras. Em 2026 foi convertido para JavaScript
puro, mantendo o comportamento fiel:

```
jogo_da_velha_ia/
├── index.html                 # UI (grid 3×3, HUD de vez, modais)
├── style.css                  # visual fiel ao Swing original (botões ciano)
├── js/
│   ├── app.js                 # fluxo do jogo (estados, turnos, fim de jogo, modos, painel do LLM)
│   ├── ai-heuristica.js       # IA de regras (port do inteligenciaAtificial()) + modo fácil
│   ├── ai-minimax.js          # minimax imbatível (port do Teste.java) + candidatos pro LLM
│   ├── llm.js                 # modo LLM: prompt, validação de JSON, motor WebLLM (GPU) ou wllama (CPU), fallback
│   └── vendor/
│       ├── webllm.esm.js      # WebLLM embutido (5,8MB) — caminho rápido (WebGPU), sem CDN
│       └── wllama/            # wllama embutido (index.js + wllama.wasm 8,1MB) — caminho CPU/RAM
├── test/
│   ├── logic-test.mjs         # 11 testes de lógica
│   └── llm-test.mjs           # 26 testes do LLM + modos (npm test roda os 27)
├── img/                       # imagens originais do tabuleiro
├── server.js                  # servidor estático em Node puro (sem deps)
└── java/                      # ✔ PROJETO ORIGINAL 2022 preservado
    ├── JogoDaVelhaAtualizado.java    # versão mais completa (origem da conversão)
    ├── JogoDaVelhaAntigo.java        # primeira versão do jogo
    ├── JogoDaVelhaImplementando.java # esboço com menu de nomes
    ├── Teste.java                    # minimax de terceiros (origem do modo Impossível)
    └── partePrincipal/               # imagens originais
```

### Como rodar a versão Java original (histórica)

```bash
# Requer JDK 12+ (ou Docker: docker run --rm -v $(pwd):/src -w /src eclipse-temurin:17 ...)
cd java
javac -d bin *.java
java -cp bin:. JogoDaVelhaAtualizado   # no Windows: -cp "bin;."
```

> A IA heurística dos fontes próprios **não** usa minimax — a versão original herdava um trecho
> de terceiros (`Teste.java`, blog isjavado) apenas como referência. Na versão web, o minimax
> virou um modo de jogo oficial: **Impossível**.

## Testes

```bash
npm test
```

Cobertura: as 8 combinações de vitória para ambos os jogadores, empate, ataque/bloqueio/centro
da heurística, correção do bug de sobrescrita, minimax imbatível em 300 partidas aleatórias e
minimax vs minimax sempre empatando (jogo perfeito) — mais o modo LLM (prompt com tabuleiro +
casas avaliadas, extração/validação de JSON, retry, fallback no minimax, casa nunca sobrescrita)
os modos de dificuldade (fácil erra de verdade, com erro=0 joga igual ao médio) e a seleção de motor (sem WebGPU → CPU na RAM do sistema · com placa → GPU · download que falha não é mascarado).

## Licença

MIT — veja [LICENSE](LICENSE).
