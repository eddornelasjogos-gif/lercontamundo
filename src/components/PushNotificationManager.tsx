"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, Play, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { subscribeToPush, sendTestNotification, clearSubscriptions, NOTIFICATION_MESSAGES, getStoredSubscriptions } from "@/utils/push-notifications";
import { useProgress } from "@/contexts/ProgressContext";

// Component to manage push notifications
const PushNotificationManager: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { progress } = useProgress();
  const userId = `user_${progress.xp || 0}`; // Use a unique user ID, e.g., based on progress

  useEffect(() => {
    // Check if already subscribed
    const subscriptions = getStoredSubscriptions();
    setIsSubscribed(subscriptions.length > 0);
  }, []);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const subscription = await subscribeToPush(userId);
      if (subscription) {
        setIsSubscribed(true);
        toast.success("Inscrito para notificações push!");
      } else {
        toast.error("Falha ao se inscrever para notificações.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Erro ao se inscrever para notificações.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleTestNotification = (type: keyof typeof NOTIFICATION_MESSAGES) => {
    sendTestNotification(type);
  };

  const handleClearSubscriptions = () => {
    clearSubscriptions();
    setIsSubscribed(false);
    toast.info("Assinaturas removidas.");
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <h3 className="font-semibold flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Gerenciar Notificações Push
      </h3>
      
      {!isSubscribed ? (
        <Button 
          onClick={handleSubscribe} 
          disabled={isSubscribing}
          className="w-full"
        >
          {isSubscribing ? (
            <>
              <Play className="w-4 h-4 mr-2 animate-spin" />
              Inscrevendo...
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Ativar Notificações
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Você está inscrito para receber notificações!</p>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleTestNotification('dailyReward')}
              size="sm"
            >
              Teste: Recompensa Diária
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleTestNotification('newStory')}
              size="sm"
            >
              Teste: Nova História
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleTestNotification('mathChallenge')}
              size="sm"
            >
              Teste: Desafio Matemática
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleTestNotification('achievementUnlocked')}
              size="sm"
            >
              Teste: Conquista
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleTestNotification('reminder')}
              size="sm"
            >
              Teste: Lembrete
            </Button>
          </div>
          
          <Button 
            variant="destructive" 
            onClick={handleClearSubscriptions}
            size="sm"
          >
            <StopCircle className="w-4 h-4 mr-2" />
            Desinscrever
          </Button>
        </div>
      )}
    </div>
  );
};

export default PushNotificationManager;