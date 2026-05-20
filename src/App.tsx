import { useEffect, useState } from 'react';
import { LessonScreen } from '@/components/lesson/LessonScreen';
import { IntroScene } from '@/components/lesson/IntroScene';
import { applyPersistedFont, hasSeenIntro, markIntroSeen } from '@/utils/storage';

function App() {
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro());

  // Apply the saved font choice ONCE on mount so a returning student with
  // Hyperlegible enabled doesn't see a flash of the default font first.
  useEffect(() => {
    applyPersistedFont();
  }, []);

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
