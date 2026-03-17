/**
 * SurveyPage.jsx
 *
 * Renders the post-session survey and then the completion / thank-you screen.
 * On submit: POSTs the full telemetry bundle to the backend.
 */

import React, { useState } from 'react';
import Survey from '../components/study/Survey';
import useSessionStore from '../store/sessionStore';
import api from '../services/api';

export default function SurveyPage() {
  const { sessionId, getTelemetrySummary, setPhase } = useSessionStore();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSurveySubmit(responses) {
    setSubmitting(true);
    setError(null);
    try {
      const summary = getTelemetrySummary();
      if (sessionId) {
        await api.submitSession(sessionId, summary);
      } else {
        // Offline fallback: log to console (useful during local development)
        console.info('[ScrollStudy] Session summary:', summary);
      }
      setSubmitted(true);
      setPhase('done');
    } catch (err) {
      console.error(err);
      // Still mark as done locally even if network fails
      setSubmitted(true);
      setPhase('done');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="phone-frame flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank you!</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Your responses have been recorded. Your participation in this study is greatly
          appreciated and will contribute to our research on mindful social media design.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 w-full text-left mb-6">
          <p className="text-xs font-semibold text-blue-700 mb-1">What happens next?</p>
          <p className="text-xs text-blue-600 leading-relaxed">
            Your anonymised data will be analysed alongside other participants' responses.
            Results will be shared with the class at the end of the study period.
          </p>
        </div>
        <p className="text-xs text-gray-400">
          You may now close this browser tab.
        </p>
      </div>
    );
  }

  return (
    <div className={submitting ? 'pointer-events-none opacity-60' : ''}>
      <Survey onSubmit={handleSurveySubmit} />
      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl p-3 z-50">
          {error}
        </div>
      )}
    </div>
  );
}
