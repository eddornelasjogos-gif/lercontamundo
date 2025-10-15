import mascotImage from "@/assets/mascot-owl.png";

interface MascotProps {
  className?: string;
  message?: string;
}

export const Mascot = ({ className = "", message }: MascotProps) => {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="animate-float">
        <img
          src={mascotImage}
          alt="Mascote Corujinha"
          className="w-24 h-24 md:w-32 md:h-32 drop-shadow-lg"
        />
      </div>
      {message && (
        <div className="relative">
          <div className="bg-white rounded-2xl px-6 py-3 shadow-card border-2 border-primary/20 max-w-xs">
            <p className="text-sm font-body font-medium text-foreground text-center">
              {message}
            </p>
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-primary/20 rotate-45" />
        </div>
      )}
    </div>
  );
};
