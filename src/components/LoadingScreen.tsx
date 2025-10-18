import React from 'react';
import { Loader2 } from 'lucide-react';
import { Mascot } from './Mascot';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-center">
      <Mascot message="Carregando a próxima aventura..." className="mb-8" />
      <div className="flex items-center text-primary font-display font-bold text-xl">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        Carregando...
      </div>
    </div>
  );
};

export default LoadingScreen;