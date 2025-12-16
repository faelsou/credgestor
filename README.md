<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Testar conexão com o Supabase

As credenciais padrão do projeto Supabase já estão incluídas no código para facilitar o teste local:

- URL: `https://avszitcisjexrjkbkxat.supabase.co`
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2c3ppdGNpc2pleHJqa2JreGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NzE2MjMsImV4cCI6MjA4MTQ0NzYyM30.AyOFyM8uScHLWdhc9diTsn9WM_2dlMc5m4-jfN_LOtU`
- Service role: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2c3ppdGNpc2pleHJqa2JreGF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg3MTYyMywiZXhwIjoyMDgxNDQ3NjIzfQ.p-3mHE0HZ719ZLfOTjTeXSLC9hmlmmFfdtBZxt4qLtY`

Caso queira sobrepor os valores (por exemplo, em produção), defina as variáveis de ambiente no shell atual:
```bash
export VITE_SUPABASE_URL="https://<projeto>.supabase.co"
export VITE_SUPABASE_ANON_KEY="<sua anon key>"
export VITE_SUPABASE_SERVICE_ROLE_KEY="<sua service role>"
```

Em seguida, execute o teste de conectividade:
   ```bash
   npm run test:supabase
   ```
   O script realiza uma chamada de autenticação e informa se a comunicação com o Supabase foi bem-sucedida.
# credgestor
