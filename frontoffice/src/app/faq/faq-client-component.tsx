'use client';

import { useState } from 'react';
import { Question } from '../../models/question';
import FaqItem from './faq-item';

interface FaqClientComponentProps {
  questions: Question[];
}

export default function FaqClientComponent({ questions }: FaqClientComponentProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuestions = questions.filter(question => 
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Rechercher une question..."
            className="w-full p-4 pl-12 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-xl text-gray-600">Aucune question ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <FaqItem key={question.id} question={question} />
          ))}
        </div>
      )}
    </>
  );
}
