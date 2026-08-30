import React, { useState } from 'react';
import QuizResults from './QuizResults';

const SAMPLE_QUIZ_DATA = {
  title: "Statistical Methodology",
  subtitle: "Data Analysis Certification",
  totalQuestions: 5,
  questions: [
    {
      id: 1,
      question: "Which statistical method is most appropriate for analyzing population growth over a 10-year census cycle?",
      options: [
        { label: "A", text: "Simple Linear Regression", value: "A" },
        { label: "B", text: "Time Series Analysis", value: "B" },
        { label: "C", text: "Logistic Growth Model", value: "C" },
        { label: "D", text: "Standard Deviation", value: "D" }
      ],
      correctAnswer: "B"
    },
    {
      id: 2,
      question: "In stratified random sampling, how are subgroups (strata) formed?",
      options: [
        { label: "A", text: "Completely at random regardless of attributes", value: "A" },
        { label: "B", text: "Based on shared characteristics or attributes", value: "B" },
        { label: "C", text: "By selecting every 10th respondent in line", value: "C" },
        { label: "D", text: "According to geographic convenience only", value: "D" }
      ],
      correctAnswer: "B"
    }
  ]
};

export default function Quiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQ = SAMPLE_QUIZ_DATA.questions[currentIdx] || SAMPLE_QUIZ_DATA.questions[0];
  const selectedOption = selectedAnswers[currentIdx];
  const progressPercent = ((currentIdx + 1) / SAMPLE_QUIZ_DATA.totalQuestions) * 100;

  const handleOptionSelect = (val) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIdx]: val
    }));
  };

  const handleNext = () => {
    if (currentIdx < SAMPLE_QUIZ_DATA.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  if (isSubmitted) {
    return <QuizResults onRetake={() => { setIsSubmitted(false); setCurrentIdx(0); setSelectedAnswers({}); }} />;
  }

  return (
    <div className="flex-1 min-h-screen bg-surface p-4 md:p-8 max-w-[1280px] mx-auto">
      {/* Header / Progress */}
      <header className="mb-8">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface">{SAMPLE_QUIZ_DATA.title}</h2>
            <p className="text-sm text-on-surface-variant mt-1">{SAMPLE_QUIZ_DATA.subtitle}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-secondary">
              Question {currentIdx + 1} of {SAMPLE_QUIZ_DATA.totalQuestions}
            </span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
          <div 
            className="h-full bg-secondary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </header>

      {/* Quiz Container */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 md:p-8 shadow-sm">
        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl md:text-2xl font-semibold text-on-surface leading-relaxed">
            {currentQ.question}
          </h3>
        </div>

        {/* Options */}
        <form className="space-y-4 mb-8">
          {currentQ.options.map((opt) => {
            const isChecked = selectedOption === opt.value;
            return (
              <label 
                key={opt.value} 
                className="block relative cursor-pointer group"
                onClick={() => handleOptionSelect(opt.value)}
              >
                <input 
                  type="radio" 
                  name="quiz-option" 
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => {}}
                  className="sr-only"
                />
                <div className={`flex items-center min-h-[44px] p-4 rounded-lg border transition-colors duration-200 ${
                  isChecked 
                    ? 'border-secondary bg-secondary/5' 
                    : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                    isChecked ? 'border-secondary' : 'border-outline group-hover:border-secondary'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ${
                      isChecked ? 'bg-secondary scale-100' : 'bg-transparent scale-0'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-on-surface-variant mr-3">{opt.label}</span>
                    <span className="text-base text-on-surface">{opt.text}</span>
                  </div>
                </div>
              </label>
            );
          })}
        </form>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
          <button 
            type="button" 
            onClick={handlePrevious}
            disabled={currentIdx === 0}
            className="min-h-[44px] text-sm font-semibold px-6 py-2.5 border border-primary text-primary rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
          >
            Previous
          </button>
          <button 
            type="button"
            onClick={handleNext}
            disabled={!selectedOption}
            className={`min-h-[44px] text-sm font-semibold px-6 py-2.5 bg-primary text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
              !selectedOption 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-primary-container'
            }`}
          >
            {currentIdx === SAMPLE_QUIZ_DATA.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
}
