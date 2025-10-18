import { useEffect, useMemo, useCallback } from 'react';
import { Howl } from 'howler';

// Importar os arquivos de áudio
import collectSfx from '@/assets/audio/collect.mp3';
import splitSfx from '@/assets/audio/split.mp3';
import backgroundMusic from '@/assets/audio/background_music.mp3';

// Novos imports para Bolhas Mágicas (assumindo que os arquivos existem)
import popSfx from '@/assets/audio/pop.mp3';
import shootSfx from '@/assets/audio/shoot.mp3';
import magicBgMusic from '@/assets/audio/magic_bg.mp3';


export const useGameAudio = (isPlaying: boolean, gameType: 'divide-io' | 'magic-bubbles') => {
  const sounds = useMemo(() => ({
    // Divide.io sounds
    collect: new Howl({ src: [collectSfx], volume: 0.5 }),
    split: new Howl({ src: [splitSfx], volume: 0.7 }),
    background: new Howl({ 
      src: [backgroundMusic], 
      loop: true, 
      volume: 0.3,
      html5: true, 
    }),
    
    // Magic Bubbles sounds
    pop: new Howl({ src: [popSfx], volume: 0.6 }),
    shoot: new Howl({ src: [shootSfx], volume: 0.5 }),
    magicBg: new Howl({ 
      src: [magicBgMusic], 
      loop: true, 
      volume: 0.4,
      html5: true, 
    }),
  }), []);

  // Divide.io specific plays
  const playCollect = useCallback(() => {
    sounds.collect.play();
  }, [sounds.collect]);

  const playSplit = useCallback(() => {
    sounds.split.play();
  }, [sounds.split]);
  
  // Magic Bubbles specific plays
  const playPop = useCallback(() => {
    sounds.pop.play();
  }, [sounds.pop]);
  
  const playShoot = useCallback(() => {
    sounds.shoot.play();
  }, [sounds.shoot]);

  // Gerenciar a música de fundo
  useEffect(() => {
    const bgSound = gameType === 'magic-bubbles' ? sounds.magicBg : sounds.background;
    const otherSound = gameType === 'magic-bubbles' ? sounds.background : sounds.magicBg;
    
    otherSound.stop(); // Garante que a música do outro jogo pare

    if (isPlaying) {
      if (!bgSound.playing()) {
        bgSound.play();
      }
    } else {
      bgSound.stop();
    }
    
    return () => {
      bgSound.stop();
    };
  }, [isPlaying, gameType, sounds.background, sounds.magicBg]);

  return { playCollect, playSplit, playPop, playShoot };
};