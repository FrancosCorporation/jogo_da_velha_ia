# Jogo da Velha IA

Jogo da velha com interface gráfica em Java Swing e oponente controlado por uma IA de regras — **projeto de estudo** (2022).

![Java](https://img.shields.io/badge/Java-12-orange?logo=openjdk&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-conclu%C3%ADdo%20(estudo)-blue)

## Sobre

Projeto de estudo desenvolvido em 2022 para praticar **Java Swing**, eventos, lógica de jogos e uma
primeira noção de **inteligência artificial baseada em regras**. O jogador pode escolher entre
**Player vs Player** (dois jogadores no mesmo teclado/mouse) ou **Player vs PC**, no qual o computador
escolhe as jogadas sozinho.

> Importante: a IA implementada aqui é **heurística**, baseada em uma sequência de verificações
> "ataque/bloqueio" (o computador fecha a própria linha de vitória e bloqueia as do adversário).
> O código **não** usa minimax — o `README.md` antigo deste repositório continha apenas um trecho de
> código de terceiros colado de um blog, sem relação com os fontes deste projeto.

## Funcionalidades

- Tabuleiro 3×3 clicável com imagens (`src/partePrincipal/bola.png` e `x.png`).
- Modo **Player vs Player** e modo **Player vs PC** (escolhidos em diálogo na abertura).
- IA por regras: fecha linhas de vitória do computador e bloqueia as jogadas do adversário.
- Detecção de vitória e de empate ("deu velha"), com diálogo de reinício.
- Indicador de vez do jogador no topo da janela.
- Três versões/iterações do jogo no mesmo repositório (`JogoDaVelhaAntigo`, `JogoDaVelhaAtualizado`,
  `JogoDaVelhaImplementando`) e uma classe de teste (`Teste`).
- Na versão `JogoDaVelhaImplementando` há menu para **alterar o nome dos jogadores**.

## Stack

- **Java 12** (projeto Eclipse `JavaSE-12`).
- **Java Swing / AWT** (`JFrame`, `JButton`, `JPanel`, `GridLayout`, `ImageIcon`, `JOptionPane`).
- Sem dependências externas.

## Como rodar

Requer JDK 12+ instalado. Não há build automatizado (Maven/Gradle) — o projeto é Eclipse puro.

Via linha de comando, a partir da raiz do repositório:

```bash
javac -d bin src/*.java
java -cp bin:src JogoDaVelhaAtualizado
```

> O `src` entra no classpath porque as imagens são carregadas como recurso
> (`getClass().getResource("/partePrincipal/bola.png")`) e permanecem em `src/partePrincipal/`.
> No Windows, use `-cp "bin;src"`.

Outras classes com `main` (versões alternativas): `JogoDaVelhaAntigo`, `JogoDaVelhaImplementando`, `Teste`.
A versão mais completa é `JogoDaVelhaAtualizado`.

## Estrutura do projeto

```
jogo_da_velha_ia/
├── src/
│   ├── JogoDaVelhaAtualizado.java       # versão mais completa (recomendada)
│   ├── JogoDaVelhaAntigo.java           # primeira versão do jogo
│   ├── JogoDaVelhaImplementando.java    # versão com menu de nomes dos jogadores
│   ├── Teste.java                       # classe de testes/experimentos
│   └── partePrincipal/                  # imagens do tabuleiro (bola/x)
├── .classpath / .project                # configuração Eclipse
└── README.md
```

## Licença

MIT — veja [LICENSE](LICENSE).
