import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useProgress } from "@/contexts/ProgressContext";
import { journeyPath, JourneyStage } from "@/data/journey-data";
import { JourneyNode } from "@/components/JourneyNode";
import { Mascot } from "@/components/Mascot";
import mapBackground from "@/assets/journey-map-bg.png";

const Journey = () => {
  const navigate = useNavigate();
  const { progress } = useProgress();

  const isStageCompleted = (stage: JourneyStage) => {
    if (stage.type === 'reading') {
      return progress.completedStories.includes(stage.targetId);
    }
    if (stage.type === 'math') {
      return progress.completedExercises.includes(stage.targetId);
    }
    return false;
  };

  let firstUnlockedStage = -1;

  const stagesWithStatus = journeyPath.map((stage, index) => {
    const completed = isStageCompleted(stage);
    const prevStageCompleted = index === 0 || isStageCompleted(journeyPath[index - 1]);
    
    let status: "locked" | "unlocked" | "completed" = "locked";
    if (completed) {
      status = "completed";
    } else if (prevStageCompleted) {
      status = "unlocked";
      if (firstUnlockedStage === -1) {
        firstUnlockedStage = index;
      }
    }
    
    return { ...stage, status };
  });

  const handleNodeClick = (stage: JourneyStage) => {
    if (stage.type === 'reading') {
      navigate(`/reading/${stage.targetId}`);
    } else if (stage.type === 'math') {
      navigate(`/math/${stage.targetId}`);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] rounded-2xl shadow-card border-4 border-white/50 overflow-hidden" style={{ backgroundImage: `url(${mapBackground})`, backgroundSize: 'cover' }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 750" preserveAspectRatio="none">
            <path
              d="M 150 600 L 300 525 L 500 562 L 650 450 L 500 337 L 300 375 L 150 262 L 300 150 L 500 112 L 700 187"
              fill="none"
              stroke="rgba(255, 255, 255, 0.7)"
              strokeWidth="10"
              strokeDasharray="20 15"
              strokeLinecap="round"
            />
          </svg>

          {stagesWithStatus.map((stage) => (
            <div key={stage.id} className="absolute" style={{ top: stage.position.top, left: stage.position.left, transform: 'translate(-50%, -50%)' }}>
              <JourneyNode
                title={stage.title}
                icon={stage.icon}
                status={stage.status}
                onClick={() => handleNodeClick(stage)}
              />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
            <Mascot message="Siga o caminho para uma grande aventura de conhecimento!" />
        </div>
      </div>
    </div>
  );
};

export default Journey;