FROM node:22-alpine

ENV NODE_ENV=production PORT=3348 HOST=0.0.0.0
WORKDIR /app

COPY --chown=node:node server.js index.html 404.html style.css ./
COPY --chown=node:node js/app.js js/ai-heuristica.js js/ai-minimax.js js/llm.js js/erro.js ./js/
COPY --chown=node:node js/vendor/webllm.esm.js ./js/vendor/
COPY --chown=node:node js/vendor/wllama/index.js ./js/vendor/wllama/
COPY --chown=node:node js/vendor/wllama/wasm/wllama.wasm ./js/vendor/wllama/wasm/
COPY --chown=node:node img/bola.png img/x.png ./img/

USER node
EXPOSE 3348
CMD ["node", "server.js"]
