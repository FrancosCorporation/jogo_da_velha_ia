# Jogo da Velha IA

![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow?logo=javascript&logoColor=white)
![Node](https://img.shields.io/badge/node-%3E%3D18-green?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-ativo%20(vers%C3%A3o%20web)-blue)
![Tests](https://img.shields.io/badge/testes-11%2F11%20passando-brightgreen)

Jogo da Velha no navegador com **três modos de jogo** e **duas IAs** — versão web (2026) do projeto
Java/Swing de 2022, com os fontes originais preservados em [`java/`](java/).

**Jogar online:** https://francoscorporation.github.io/jogo_da_velha_ia/

## Modos de jogo

| Modo | Oponente | IA |
|---|---|---|
| **Player vs Player** | Outra pessoa no mesmo dispositivo | — |
| **Player vs PC** | Computador com IA heurística de regras (ataca, bloqueia, ocupa o centro) | `js/ai-heuristica.js` |
| **Impossível (Minimax)** | Computador imbatível com minimax clássico + placar de sessão | `js/ai-minimax.js` |

## Instalação e execução

Requer [Node.js 18+](https://nodejs.org/). Sem dependências externas — o projeto roda com Node puro:

```bash
npm install   # no-op (zero dependências), mantido por convenção
npm start     # abre o servidor em http://localhost:3000
npm test      # roda os 11 testes de lógica (vitórias, empate, IAs, minimax imbatível)
```

Depois abra **http://localhost:3000** no navegador.

> Alternativa sem Node: abra `index.html` num servidor estático qualquer (Python `http.server`,
> Live Server do VS Code, nginx...) — a versão web é 100% estática (HTML/CSS/JS).

## Funcionalidades

- Tabuleiro 3×3 clicável com as imagens originais do projeto Java (`img/bola.png` e `img/x.png`).
- Diálogo inicial escolhendo o modo (PvP, vs PC, Impossível) — fiel ao `JOptionPane` original.
- Indicador de vez no topo com as cores do original (Jogador 1 verde, Jogador 2 vermelho).
- Aviso "Movimento Indisponível!" ao clicar em casa ocupada (como no Java).
- Detecção de vitória (com destaque da linha vencedora) e empate ("Deu velha!").
- Modo Impossível com **placar de sessão** (vitórias/empates/derrotas), como no `Teste.java`.
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
│   ├── app.js                 # fluxo do jogo (estados, turnos, fim de jogo)
│   ├── ai-heuristica.js       # IA de regras (port do inteligenciaAtificial())
│   └── ai-minimax.js          # minimax imbatível (port do Teste.java)
├── test/logic-test.mjs        # 11 testes de lógica (npm test)
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
minimax vs minimax sempre empatando (jogo perfeito).

## Licença

MIT — veja [LICENSE](LICENSE).
