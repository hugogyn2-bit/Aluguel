"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Crown, CreditCard, Lock, LogOut } from "lucide-react";
import { useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Card className="p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
              <Crown className="h-3.5 w-3.5" /> Premium
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-3">Modo Proprietário (bloqueado)</h1>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Para usar o modo proprietário, é necessário ativar o plano. Sem pagamento, o acesso continua bloqueado.
            </p>
          </div>

          <form action="/api/signout" method="post">
            <Button variant="ghost" type="submit">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </form>
        </div>

        <div className="mt-6 grid gap-3 text-sm text-muted">
          <Bullet icon={<Lock className="h-4 w-4 text-secondary" />} text="Cadastrar e gerenciar imóveis" />
          <Bullet icon={<Lock className="h-4 w-4 text-secondary" />} text="Controle de aluguéis e inadimplência" />
          <Bullet icon={<Lock className="h-4 w-4 text-secondary" />} text="Relatórios e notificações" />
          <Bullet icon={<Lock className="h-4 w-4 text-secondary" />} text="Atendimento prioritário" />
        </div>

        <div className="mt-8 grid gap-3">
          <Button
            loading={loading}
            onClick={async () => {
              setLoading(true);
              window.location.href = (process.env.NEXT_PUBLIC_MERCADOPAGO_CHECKOUT_URL ?? "/api/pay/owner/start");
              setLoading(false);
            }}
          >
            <CreditCard className="h-4 w-4" /> Pagar agora e liberar (mock)
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              alert("Você escolheu pagar depois. O modo Proprietário continua bloqueado até ativar o plano.");
            }}
          >
            Pagar depois
          </Button>


<Button
  variant="outline"
  onClick={async () => {
    setLoading(true);
    const r = await fetch("/api/pay/owner/verify", { method: "POST" });
    setLoading(false);
    if (r.ok) window.location.href = "/owner";
    else alert("Ainda não foi possível confirmar a assinatura. Se acabou de pagar, aguarde o webhook e tente de novo.");
  }}
>
  Já paguei (verificar)
</Button>

          <div className="text-xs text-muted">
            Integração Mercado Pago: o botão **Pagar agora** redireciona para o checkout. A confirmação definitiva vem via <code className="px-1 py-0.5 rounded bg-black/20">/api/webhooks/mercadopago</code> (produção).
          </div>
        </div>
      </Card>
    </main>
  );
}

function Bullet({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-2xl bg-surface border border-white/10 grid place-items-center">{icon}</div>
      <div>{text}</div>
    </div>
  );
}
