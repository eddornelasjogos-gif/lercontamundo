import { Navigation } from "@/components/Navigation";
import { Mascot } from "@/components/Mascot";
import ColorHeader from "@/components/ColorHeader";
import { Gamepad2 } from "lucide-react";
import mascotBackground from "@/assets/mascot-owl.png";

const Games = () => {
  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-200 via-pink-200 to-red-200 shadow-soft">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${mascotBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute -top-12 right-4 h-56 w-56 rounded-full bg-pink-300 opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 -translate-y-1/4 rounded-full bg-purple-300 opacity-60 blur-3xl" />
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full gradient-primary">
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
            <ColorHeader
              title="Área de Jogos"
              subtitle="Divirta-se com jogos educativos e ganhe XP!"
              gradientFrom="#8b5cf6"
              gradientTo="#ec4899"
            />
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 py-8 space-y-10">
        <section className="relative overflow-hidden rounded-3xl bg-white/80 p-8 shadow-card">
          <div className="text-center">
            <Mascot message="Nossos jogos estão sendo preparados com muito carinho! Volte em breve para se divertir e aprender." />
            <h2 className="mt-6 text-2xl font-display font-bold text-foreground">
              Novos Jogos em Breve!
            </h2>
            <p className="text-muted-foreground mt-2">
              Estamos criando desafios incríveis para você. Fique de olho!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Games;