import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";

type NarratorProps = {
  text: string;
  title?: string;
  lang?: string;
};

const prefersMaleName = (name: string) => {
  const n = name.toLowerCase();
  // Heurística simples para priorizar vozes masculinas comuns
  return ["ricardo", "joao", "joão", "luiz", "thiago", "daniel", "male", "pt-br"].some((m) => n.includes(m));
};

const Narrator = ({ text, title = "Narração", lang = "pt-BR" }: NarratorProps) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const queueRef = useRef<string[]>([]);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Carrega vozes disponíveis
  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Seleciona voz pt-BR preferindo masculina
  const selectedVoice = useMemo(() => {
    const ptVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith("pt"));
    const ptBR = ptVoices.filter((v) => v.lang.toLowerCase().includes("br"));
    const maleBR = ptBR.find((v) => prefersMaleName(v.name));
    const malePT = ptVoices.find((v) => prefersMaleName(v.name));
    const choice = maleBR ?? malePT ?? ptBR[0] ?? ptVoices[0] ?? voices[0] ?? null;
    voiceRef.current = choice ?? null;
    return choice;
  }, [voices]);

  // Divide o texto em frases curtas para leitura suave
  const chunks = useMemo(() => {
    const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const parts: string[] = [];
    paragraphs.forEach((p) => {
      const sentences = p.split(/(?<=[.!?…])\s+/).filter(Boolean);
      sentences.forEach((s) => {
        if (s.length <= 240) {
          parts.push(s);
        } else {
          // Quebra adicional para frases muito longas
          for (let i = 0; i < s.length; i += 220) {
            parts.push(s.slice(i, i + 220));
          }
        }
      });
    });
    return parts;
  }, [text]);

  useEffect(() => {
    queueRef.current = chunks;
    setIndex(0);
  }, [chunks]);

  // Limpa fala ao desmontar
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setIndex(0);
    };
  }, []);

  const speakFrom = (startIdx: number) => {
    if (!queueRef.current.length) return;
    const synth = window.speechSynthesis;
    const toSpeak = queueRef.current.slice(startIdx);
    if (!toSpeak.length) return;

    setIsSpeaking(true);
    setIsPaused(false);

    // Informa início
    if (startIdx === 0) {
      toast("Iniciando narração...", { description: "Você pode pausar ou parar quando quiser." });
    }

    const speakNext = (i: number) => {
      if (i >= toSpeak.length) {
        setIsSpeaking(false);
        setIsPaused(false);
        setIndex(queueRef.current.length);
        toast.success("Narração concluída!");
        return;
      }
      const utter = new SpeechSynthesisUtterance(toSpeak[i]);
      utter.lang = selectedVoice?.lang ?? lang;
      if (selectedVoice) utter.voice = selectedVoice;
      utter.rate = 0.95; // ritmo suave
      utter.pitch = 0.9; // tom um pouco mais grave (masculino)
      utter.volume = 1;

      utter.onend = () => {
        const globalIdx = startIdx + i + 1;
        setIndex(globalIdx);
        // Pequena pausa entre frases
        setTimeout(() => speakNext(i + 1), 120);
      };
      utter.onerror = () => {
        // Continua mesmo em caso de erro em uma frase
        const globalIdx = startIdx + i + 1;
        setIndex(globalIdx);
        setTimeout(() => speakNext(i + 1), 120);
      };

      synth.speak(utter);
    };

    speakNext(0);
  };

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }
    if (isSpeaking) return;
    speakFrom(index);
  };

  const handlePause = () => {
    if (!isSpeaking) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setIndex(0);
  };

  const progress = queueRef.current.length ? (index / queueRef.current.length) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Volume2 className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={handlePlay} aria-label={isPaused ? "Retomar narração" : "Iniciar narração"}>
            <Play className="w-4 h-4 mr-1" />
            {isPaused ? "Retomar" : isSpeaking ? "Reproduzindo" : "Ouvir"}
          </Button>
          <Button size="sm" variant="outline" onClick={handlePause} disabled={!isSpeaking || isPaused} aria-label="Pausar narração">
            <Pause className="w-4 h-4 mr-1" />
            Pausar
          </Button>
          <Button size="sm" variant="outline" onClick={handleStop} disabled={!isSpeaking && index === 0} aria-label="Parar narração">
            <Square className="w-4 h-4 mr-1" />
            Parar
          </Button>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {selectedVoice
          ? `Voz: ${selectedVoice.name} (${selectedVoice.lang})`
          : "Voz padrão do navegador (pt-BR)"} • Progresso: {Math.round(progress)}%
      </p>
    </div>
  );
};

export default Narrator;