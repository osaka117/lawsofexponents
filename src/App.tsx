import React, { useState, useEffect } from 'react';
import { AppMode, DifficultyLevel, MockTestConfigState, MockTestResult, Question } from './types';
import { TOPICS } from './math/topics';
import { generateQuestion } from './math/generator';
import { Navbar } from './components/Navbar';
import { PracticeSession } from './components/PracticeSession';
import { MockTestConfig } from './components/MockTestConfig';
import { MockTestSession } from './components/MockTestSession';
import { MockTestResults } from './components/MockTestResults';
import { TopicCheatSheetModal } from './components/TopicCheatSheetModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';

const STORAGE_KEYS = {
  MOCK_CONFIG: 'loe_mock_config',
  LAST_RESULT: 'loe_last_result'
};

export default function App() {
  // Practice mode is the default and home screen of the application
  const [currentMode, setCurrentMode] = useState<AppMode>('practice');
  const [isReferenceOpen, setIsReferenceOpen] = useState<boolean>(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState<boolean>(false);

  // Initial topic if transitioning from mock test missed topics
  const [practiceInitialTopic, setPracticeInitialTopic] = useState<string>('random');

  // Mock test configuration (where multi-topic selection is supported)
  const [mockConfig, setMockConfig] = useState<MockTestConfigState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOCK_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read mock config from storage:', e);
    }
    return {
      questionCount: 10,
      selectedTopics: TOPICS.map(t => t.id)
    };
  });

  // Active mock test questions and answers
  const [mockQuestions, setMockQuestions] = useState<Question[]>([]);
  const [mockUserAnswers, setMockUserAnswers] = useState<(number | null)[]>([]);
  const [mockResult, setMockResult] = useState<MockTestResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_RESULT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read last result from storage:', e);
    }
    return null;
  });

  // Save mock test config
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOCK_CONFIG, JSON.stringify(mockConfig));
    } catch (e) {
      // Storage might be full or disabled
    }
  }, [mockConfig]);

  // Generate questions for mock test (with random 1-5 difficulties and multi-topic distribution)
  const startNewMockTest = (cfg: MockTestConfigState) => {
    setMockConfig(cfg);
    const questions: Question[] = [];
    const topicsPool = [...cfg.selectedTopics];

    for (let i = 0; i < cfg.questionCount; i++) {
      const topicId = topicsPool[i % topicsPool.length];
      const difficulty = (Math.floor(Math.random() * 5) + 1) as DifficultyLevel;
      const q = generateQuestion(topicId, difficulty);
      questions.push(q);
    }

    setMockQuestions(questions);
    setMockUserAnswers(new Array(questions.length).fill(null));
    setCurrentMode('mock-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMockAnswerChange = (questionIdx: number, optionIdx: number) => {
    setMockUserAnswers(prev => {
      const next = [...prev];
      next[questionIdx] = optionIdx;
      return next;
    });
  };

  const handleMockTestSubmit = (result: MockTestResult) => {
    setMockResult(result);
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_RESULT, JSON.stringify(result));
    } catch (e) {
      // ignore
    }
    setCurrentMode('mock-results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetakeMockTest = () => {
    startNewMockTest(mockConfig);
  };

  const handlePracticeMissedTopics = (topicIds: string[]) => {
    if (topicIds.length > 0) {
      setPracticeInitialTopic(topicIds[0]);
    }
    setCurrentMode('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1215] text-[#e6edf3] selection:bg-[#10b981] selection:text-[#0f1215]">
      {/* Retro Navigation Bar */}
      <Navbar
        currentMode={currentMode}
        onNavigate={mode => setCurrentMode(mode)}
        onOpenReference={() => setIsReferenceOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1">
        {currentMode === 'practice' && (
          <PracticeSession
            onOpenReference={() => setIsReferenceOpen(true)}
            onOpenMockTest={() => setCurrentMode('mock-config')}
            initialTopicId={practiceInitialTopic}
          />
        )}

        {currentMode === 'mock-config' && (
          <MockTestConfig
            initialConfig={mockConfig}
            onStart={startNewMockTest}
            onBack={() => setCurrentMode('practice')}
          />
        )}

        {currentMode === 'mock-active' && (
          <MockTestSession
            questions={mockQuestions}
            userAnswers={mockUserAnswers}
            onAnswerChange={handleMockAnswerChange}
            onSubmitTest={handleMockTestSubmit}
            onExit={() => setCurrentMode('practice')}
          />
        )}

        {currentMode === 'mock-results' && mockResult && (
          <MockTestResults
            result={mockResult}
            onRetakeTest={handleRetakeMockTest}
            onReturnHome={() => setCurrentMode('practice')}
            onPracticeMissedTopics={handlePracticeMissedTopics}
          />
        )}
      </main>

      {/* Retro Computer Footer */}
      <footer className="bg-[#161b22] border-t-2 border-[#30363d] py-6 px-4 mt-12 font-mono-code text-xs text-[#8b949e]">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-pixel text-[11px] text-[#f0f6fc]">
              LAWS OF EXPONENTS MATHEMATICS REVIEWER
            </div>
            <div className="text-[11px] text-[#8b949e] mt-1">
              Static single-page educational application · Pure client-side arithmetic · Dark Mode Active
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setCurrentMode('practice')}
              className="hover:text-[#34d399] underline cursor-pointer"
            >
              Practice Reviewer
            </button>
            <button
              onClick={() => setIsReferenceOpen(true)}
              className="hover:text-[#34d399] underline cursor-pointer"
            >
              Laws of Exponents Cheat Sheet
            </button>
            <button
              onClick={() => setIsDeployGuideOpen(true)}
              className="hover:text-[#34d399] underline cursor-pointer"
            >
              GitHub Pages Deployment Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Quick Reference Modal */}
      <TopicCheatSheetModal
        isOpen={isReferenceOpen}
        onClose={() => setIsReferenceOpen(false)}
      />

      {/* GitHub Pages Deployment Guide Modal */}
      <DeploymentGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />
    </div>
  );
}
