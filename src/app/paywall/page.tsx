"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Crown, CreditCard, Lock, LogOut } from "lucide-react";
import { useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    try {
      setLoading(true);

      // ✅ chama seu endpoint e espera { url }
      const r = await fetch("/api/pay/owner/start", { method: "POST" });
      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        alert(data?.error || "Erro ao iniciar pagamento.");
        return;
      }

      const url = data?.url;
      if (!url) {
        alert("O servidor não retornou a URL do checkout.");
        return;
      }

      window.location.href = url;
    } catch (e: any) {
      alert(e?.message || "Erro inesperado ao iniciar pagamento.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyPayment() {
    try {
      setLoading(true);
      const r = await fetch("/api/pay/owner/verify", { method: "POST" });
      const data = await r.json().catch(() => ({}));

      if (r.ok) {
        window.location.href = "/owner";
        return;
      }

      alert(
        data?.error ||
          "Ainda não foi possível confirmar a assinatura. Se acabou de pagar, aguarde o webhook e tente de novo."
      );
    } catch (e: any) {
      alert(e?.message || "Erro inesperado ao verificar pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Card className="p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
              <Crown className="h-3.5 w-3.5" /> Premium
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-3">
              Modo Proprietário (bloqueado)
            </h1>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Para usar o modo proprietário, é necessário ativar o plano. Sem pagamento (ou trial válido),
              o acesso continua bloqueado.
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
          <Button loading={loading} onClick={startCheckout}>
            <CreditCard className="h-4 w-4" /> Pagar agora e liberar
          </Button>

          <Button
            variant="outline"
            disabled={loading}
            onClick={() => {
              alert("Você escolheu pagar depois. O modo Proprietário continua bloqueado até ativar o plano.");
            }}
          >
            Pagar depois
          </Button>

          <Button variant="outline" loading={loading} onClick={verifyPayment}>
            Já paguei (verificar)
          </Button>

          <div className="text-xs text-muted">
            Integração Mercado Pago: o botão <b>Pagar agora</b> abre o checkout retornado por{" "}
            <code className="px-1 py-0.5 rounded bg-black/20">/api/pay/owner/start</code>. A confirmação definitiva vem via{" "}
            <code className="px-1 py-0.5 rounded bg-black/20">/api/webhooks/mercadopago</code> (produção).
          </div>
        </div>
      </Card>
    </main>
  );
}

function Bullet({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-2xl bg-surface border border-white/10 grid place-items-center">
        {icon}
      </div>
      <div>{text}</div>
    </div>
  );
}
