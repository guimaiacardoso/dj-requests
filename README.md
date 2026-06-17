# 🎵 DJ Requests

App para pedidos de músicas em tempo real.

## Deploy (5 minutos)

### 1. Criar repositório no GitHub
- Vai a github.com → "New repository" → nome: `dj-requests` → Create

### 2. Fazer upload dos ficheiros
- Clica "uploading an existing file"
- Arrastra TODOS os ficheiros desta pasta (incluindo as pastas `api/` e `public/`)
- Commit changes

### 3. Deploy no Vercel
- Vai a vercel.com → Log in with GitHub
- "Add New Project" → importa `dj-requests`
- Antes de fazer deploy, vai a **Environment Variables** e adiciona:
  - `SPOTIFY_CLIENT_ID` = `3d6b5dd619da45019709e4c95518e42a`
  - `SPOTIFY_CLIENT_SECRET` = `a5c62b1816c24a7c8ab8f539ce15b0bb`
- Clica **Deploy**

### 4. Pronto!
- O link público é o URL do Vercel → gera QR code em qr-code-generator.com
- Painel DJ: abre o mesmo link, carrega nos "···" no fundo → password: `dj2025`
