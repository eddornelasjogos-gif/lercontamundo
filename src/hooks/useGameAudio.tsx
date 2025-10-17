import { useEffect, useMemo, useCallback } from 'react';
import { Howl } from 'howler';

// Importar os arquivos de áudio
import collectSfx from '@/assets/audio/collect.mp3';
import splitSfx from '@/assets/audio/split.mp3';
import backgroundMusic from '@/assets/audio/background_music.mp3';

export const useGameAudio = (isPlaying: boolean) => {
  const sounds = useMemo(() => ({
    collect: new Howl({ src: [collectSfx], volume: 0.5 }),
    split: new Howl({ src: [splitSfx], volume: 0.7 }),
    background: new Howl({ 
      src: [backgroundMusic], 
      loop: true, 
      volume: 0.3,
      html5: true, // Usar HTML5 Audio para streaming de música de fundo
    }),
  }), []);

  const playCollect = useCallback(() => {
    sounds.collect.play();
  }, [sounds.collect]);

  const playSplit = useCallback(() => {
    sounds.split.play();
  }, [sounds.split]);

  // Gerenciar a música de fundo
  useEffect(() => {
    if (isPlaying) {
      if (!sounds.background.playing()) {
        sounds.background.play();
      }
    } else {
      sounds.background.stop();
    }
    
    // Limpeza: parar a música quando o componente for desmontado
    return () => {
      sounds.background.stop();
    };
  }, [isPlaying, sounds.background]);

  return { playCollect, playSplit };
};