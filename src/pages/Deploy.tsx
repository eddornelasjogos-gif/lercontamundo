import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Deploy = () => {
  const hookUrl = import.meta.env.VITE_VERCEL_DEPLOY_HOOK as string | undefined;
  const [loading, setLoading] = useState(false);

  const maskedHook = useMemo(() => {
    if (!hookUrl) return null;
    const start = hookUrl.slice(0, 32);
    const end = hookUrl.slice(-6);
    return `${start}...${end}`;
  }, [hookUrl]);

  const triggerDeploy = () => {
    if (!hookUrl) {
      toast.error("Configure a variável VITE_VERCEL_DEPLOY_HOOK com a URL do Deploy Hook do Vercel.");
      return;
    }
    setLoading(true);
    fetch(hookUrl, { method: "POST" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Falha no deploy: ${res.status}`);
        }
        toast.success("Deploy acionado no Vercel! Verifique o painel de Deployments.");
      })
      .catch((err) => {
        toast.error("Não foi possível acionar o deploy.", {
          description: err instanceof Error ? err.message : String(err),
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6 shadow-card border-2 border-primary/20 space-y-4">
            <h1 className="text-2xl font-display font-bold">Deploy Vercel</h1>
            <p className="text-sm text-muted-foreground">
              Use este botão para acionar um novo deploy no seu projeto Vercel via Deploy Hook.
            </p>

            <div className="rounded-lg bg-white/70 p-4 border">
              {hookUrl ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold">Deploy Hook configurado:</span>{" "}
                    <span className="text-muted-foreground break-all">{maskedHook}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O valor completo está em VITE_VERCEL_DEPLOY_HOOK.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm">
                    Variável <span className="font-semibold">VITE_VERCEL_DEPLOY_HOOK</span> não configurada.
                  </p>
                  <ol className="list-decimal ml-5 text-sm space-y-1 text-muted-foreground">
                    <li>No Vercel: Project → Settings → Git → Deploy Hooks → Create Hook e copie a URL.</li>
                    <li>Adicione a variável VITE_VERCEL_DEPLOY_HOOK neste projeto com essa URL.</li>
                    <li>Depois, clique em Rebuild e volte aqui.</li>
                  </ol>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              size="lg"
              onClick={triggerDeploy}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Acionando..." : "Disparar Deploy no Vercel"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Deploy;