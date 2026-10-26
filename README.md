# Dynago

App web para registrar treinos na academia: rápido, com uma mão, com contas de usuário e dados na nuvem.

## Arquivos
- `index.html` — o app
- `config.js` — endereço e chave pública do Supabase (preencher)
- `supabase.sql` — cria a tabela de dados com segurança por usuário
- `sw.js`, `manifest.webmanifest`, `icons/` — instalação na tela inicial e uso offline

## 1. Supabase (login e dados)
1. Crie uma conta grátis em supabase.com → **New project** (anote a senha do banco).
2. **SQL Editor → New query**: cole o conteúdo de `supabase.sql` → **Run**.
3. **Authentication → URL Configuration**: em **Site URL** coloque o endereço do app (ex.: `https://SEU-USUARIO.github.io/dynago/`) e adicione o mesmo em **Redirect URLs**.
4. **Project Settings → API**: copie a **Project URL** e a **anon public key** para o `config.js`.

## 2. GitHub Pages
**Settings → Pages → Deploy from a branch** → branch `main`, pasta `/ (root)` → **Save**.

## 3. Instalar no celular
- **Android (Chrome):** menu ⋮ → **Instalar app**.
- **iPhone (Safari):** Compartilhar → **Adicionar à Tela de Início**.

## Como os dados funcionam
- Cada usuário entra com e-mail e senha e só vê os próprios treinos e histórico.
- Uma cópia fica no aparelho: o app funciona sem internet e sincroniza quando a conexão volta.
- Sem `config.js` preenchido, o app abre em **modo demonstração** (dados só no aparelho).
