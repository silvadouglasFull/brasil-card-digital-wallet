# --- Estágio 1: Build ---
FROM node:20-alpine AS builder

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência primeiro (para cache do Docker)
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies para conseguir fazer o build)
RUN npm ci

# Copia o restante do código fonte
COPY . .

# Gera os arquivos do Prisma/Drizzle (se necessário) e faz o Build do NestJS
# O comando build gera a pasta /dist
RUN npm run build

# Remove as dependências de desenvolvimento para deixar a imagem leve
# Mantém apenas o que é necessário para rodar (dependencies)
RUN npm prune --production

# --- Estágio 2: Produção ---
FROM node:20-alpine AS production

# Define variável de ambiente para otimização
ENV NODE_ENV=production

WORKDIR /app

# Copia as dependências de produção do estágio anterior
COPY --from=builder /app/node_modules ./node_modules

# Copia o código compilado (dist)
COPY --from=builder /app/dist ./dist

# Copia os arquivos de configuração e migrations do Drizzle
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/package.json ./

# Cria um usuário não-root por segurança
USER node

# Expõe a porta da aplicação
EXPOSE 3000

# Comando para iniciar a aplicação compilada
CMD ["node", "dist/src/main"]