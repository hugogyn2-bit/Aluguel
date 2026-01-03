# Aluga App — Inquilino & Proprietário (Premium Paywall) — Next.js 15 + NextAuth + Prisma + Tailwind

Projeto **completo e funcional**, pronto para rodar localmente e publicar (Vercel).
- **Landing** chamativa com 2 acessos: **Inquilino** e **Proprietário**
- **Cadastro/Login** com senha (Credentials) usando **NextAuth**
- **Proprietário:** após cadastro/login, se **não estiver pago**, é redirecionado ao **Paywall**
- **Paywall** com:
  - **Pagar agora** (simulação + endpoint pronto para integrar Stripe/IAP)
  - **Pagar depois** (não libera modo proprietário; mantém bloqueado até pagar)
- **Middleware** bloqueando rotas `/owner/*` caso `ownerPaid=false`

## Rodar local
1) Instale deps:
```bash
npm i
```

2) Crie `.env`:
```bash
cp .env.example .env
```

3) Prisma:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4) Suba:
```bash
npm run dev
```

## Publicar
- Vercel: setar as variáveis de ambiente (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
- Para produção recomendo Postgres (Neon/Supabase/Railway). Troque o `datasource provider` para `postgresql`.

## Onde integrar pagamento real
- `src/app/api/pay/owner/route.ts` (hoje é **mock**)
- `src/app/paywall/page.tsx` (botões e UI)

## Rotas
- `/` Landing
- `/auth/sign-in?role=TENANT|OWNER`
- `/auth/sign-up?role=TENANT|OWNER`
- `/tenant` Home do inquilino
- `/owner` Home do proprietário (guardado por pagamento)
- `/paywall` Paywall do proprietário



## Mercado Pago (assinatura)
Você informou um Checkout de Assinaturas (plan):
- https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a3d9c55a69aa4d69b1345e1f1469d632

### Como funciona neste projeto
- O botão **Pagar agora** redireciona para `MERCADOPAGO_CHECKOUT_URL`.
- Ao concluir a assinatura, a confirmação definitiva em produção deve vir via **Webhook**.
- Este projeto inclui um webhook em: `POST /api/webhooks/mercadopago` que:
  1) Recebe a notificação (payload varia por evento).
  2) Se conseguir extrair um `id` de preapproval, consulta a API `GET https://api.mercadopago.com/preapproval/{id}`
  3) Se `status` estiver ativo/aprovado, marca `ownerPaid=true` para o usuário cujo email seja igual ao `payer_email`.

### Variáveis de ambiente
- `MERCADOPAGO_ACCESS_TOKEN` (obrigatório para verificação server-side)
- `MERCADOPAGO_WEBHOOK_TOKEN` (opcional, mas recomendado)  
  Use como querystring no webhook: `/api/webhooks/mercadopago?token=SEU_TOKEN`

> Observação: para ligar pagamento a usuário, este projeto faz match por **e-mail do pagador**. Se você quiser algo mais forte (external_reference),
o ideal é criar a assinatura via API (ao invés de link fixo) e enviar um identificador do usuário.
