import React from 'react';

const MOCK_RESULTS = [
  {
    id: 1,
    question: "1. Which of the following is considered Personally Identifiable Information (PII) under current departmental guidelines?",
    userAnswer: "An employee's direct office phone number and biometric login data.",
    correctAnswer: "An employee's direct office phone number and biometric login data.",
    isCorrect: true,
    explanation: "Correct. Both direct contact information assigned to an individual and biometric data used for authentication are strictly classified as PII and require enhanced protection measures."
  },
  {
    id: 2,
    question: "2. When transferring non-classified citizen data to a contracted third-party vendor across state lines, what is the primary required protocol?",
    userAnswer: "Verbal confirmation from the departmental IT security officer.",
    correctAnswer: "Execution of a standard Data Processing Agreement (DPA) and end-to-end encryption.",
    isCorrect: false,
    incorrectMessage: "Verbal confirmation is never sufficient for data transfers involving third parties.",
    explanation: "Any external transfer requires formal legal agreements (DPA) specifying data usage limits, alongside technical safeguards (encryption) to protect the data in transit."
  },
  {
    id: 3,
    question: "3. How long must logs of access to sensitive health records be retained according to the latest compliance mandate?",
    userAnswer: "Minimum of 5 years.",
    correctAnswer: "Minimum of 5 years.",
    isCorrect: true,
    explanation: "Spot on. The revised mandate extended the retention period for health record access logs from 3 to 5 years to support long-term audit capabilities."
  }
];

export default function QuizResults({ score = 80, correctCount = 4, totalCount = 5, onRetake }) {
  return (
    <div className="bg-surface-container-lowest min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">Quiz Results: Advanced Data Privacy</h1>
        <p className="text-on-surface-variant text-base">Review your performance and identify areas for improvement.</p>
      </div>

      {/* Summary Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Score Card */}
        <div className="md:col-span-1 bg-surface-bright border border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-24 h-24 rounded-full border-4 border-emerald-600 flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-emerald-600">{score}<span className="text-2xl">%</span></span>
          </div>
          <h3 className="text-xl font-bold text-on-surface">Excellent Score</h3>
          <p className="text-sm text-on-surface-variant mt-2">You answered {correctCount} out of {totalCount} questions correctly.</p>
        </div>

        {/* Action & Insights Card */}
        <div className="md:col-span-2 bg-primary-container text-white border border-outline-variant rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xl font-bold mb-2">Next Steps</h3>
            <p className="text-sm opacity-90 mb-4 max-w-lg">
              You've demonstrated a strong understanding of core privacy principles. However, a quick review of cross-border data transfer regulations is recommended to achieve mastery.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <button 
              type="button" 
              className="min-h-[44px] bg-white text-primary-container px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-100 transition-colors text-sm flex items-center justify-center cursor-pointer"
            >
              View Recommended Learning
            </button>
            <button 
              type="button" 
              onClick={onRetake}
              className="min-h-[44px] border border-white text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Questions List */}
      <h2 className="text-xl font-bold text-on-surface mb-6">Detailed Review</h2>
      <div className="space-y-6">
        {MOCK_RESULTS.map((item) => (
          <div 
            key={item.id}
            className={`bg-surface-bright border rounded-xl p-6 ${item.isCorrect ? 'border-outline-variant' : 'border-red-200'}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <span className={`material-symbols-outlined text-xl p-1 rounded-full ${item.isCorrect ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'}`}>
                  {item.isCorrect ? 'check_circle' : 'cancel'}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-on-surface mb-3">{item.question}</h4>

                {/* User's Choice */}
                <div className="mb-4">
                  <p className="text-xs text-on-surface-variant mb-1">Your Answer:</p>
                  <div className={`p-3 rounded border text-sm flex items-center gap-2 ${item.isCorrect ? 'border-emerald-500 bg-emerald-50/50' : 'border-red-500 bg-red-50/50'}`}>
                    <span className={`material-symbols-outlined text-sm ${item.isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                      radio_button_checked
                    </span>
                    <span>{item.userAnswer}</span>
                  </div>
                </div>

                {/* Incorrect Feedback Box */}
                {!item.isCorrect && (
                  <div className="bg-red-100 text-red-900 p-4 rounded-lg mb-4 text-sm">
                    <p><span className="font-bold">Incorrect.</span> {item.incorrectMessage}</p>
                  </div>
                )}

                {/* Explanation */}
                <div className="bg-surface-container p-4 rounded-lg border border-outline-variant text-sm text-on-surface-variant">
                  {!item.isCorrect && (
                    <p className="mb-1 font-semibold text-on-surface">
                      Correct Answer: <span className="font-normal">{item.correctAnswer}</span>
                    </p>
                  )}
                  <p><span className="font-semibold text-on-surface">Explanation:</span> {item.explanation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
