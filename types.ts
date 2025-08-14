export const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const SUBJECTS = [
  { id: 'mathematics', name: 'Mathematics', icon: 'calculator' },
  { id: 'english', name: 'English', icon: 'book-open' },
  { id: 'afrikaans', name: 'Afrikaans', icon: 'language' },
  { id: 'natural-sciences', name: 'Natural Sciences', icon: 'flask' },
  { id: 'social-sciences', name: 'Social Sciences', icon: 'globe-africa' },
  { id: 'life-orientation', name: 'Life Orientation', icon: 'heart' },
] as const;

export type Grade = typeof GRADES[number];
export type Subject = typeof SUBJECTS[number]['id'];

export interface ChatMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

export interface Session {
  id: number;
  sessionId: string;
  currentGrade: Grade;
  currentSubject: Subject;
  questionsAsked: number;
  studyTimeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickAction {
  type: 'example' | 'simpler' | 'test';
  label: string;
  icon: string;
}

export const getQuickActionsForSubject = (subject: Subject): QuickAction[] => {
  if (subject === 'afrikaans') {
    return [
      { type: 'example', label: 'Help me create Afrikaans examples', icon: 'lightbulb' },
      { type: 'simpler', label: 'Explain the grammar in English first', icon: 'question-circle' },
      { type: 'test', label: 'Practice with me in Afrikaans', icon: 'check-circle' },
    ];
  }
  
  return [
    { type: 'example', label: 'Help me think of an example', icon: 'lightbulb' },
    { type: 'simpler', label: 'Guide me step by step', icon: 'question-circle' },
    { type: 'test', label: 'Ask me questions to check understanding', icon: 'check-circle' },
  ];
};

export const QUICK_ACTIONS: QuickAction[] = [
  { type: 'example', label: 'Help me think of an example', icon: 'lightbulb' },
  { type: 'simpler', label: 'Guide me step by step', icon: 'question-circle' },
  { type: 'test', label: 'Ask me questions to check understanding', icon: 'check-circle' },
];
