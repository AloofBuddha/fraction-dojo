import { useState } from 'react';
import { LessonScreen } from '@/components/lesson/LessonScreen';
import { IntroScene } from '@/components/lesson/IntroScene';
import { hasSeenIntro, markIntroSeen } from '@/utils/storage';

function App() {
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro());

  if (showIntro) {
    return (
      <IntroScene
        onDone={() => {
          markIntroSeen();
          setShowIntro(false);
        }}
      />
    );
  }
  return <LessonScreen />;
}

export default App;
