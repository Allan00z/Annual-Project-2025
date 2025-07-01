'use client';

import { useState } from 'react';
import { Question } from '../../models/question';

interface FaqItemProps {
  question: Question;
}

export default function FaqItem({ question }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      <button
        className="w-full text-left p-6 focus:outline-none flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-xl font-semibold text-gray-800">{question.title}</h3>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="p-6 pt-0 border-t border-gray-100">
          <div className="text-gray-600 prose">
            <p>{question.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
