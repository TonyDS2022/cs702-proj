/**
 * ConsentForm.jsx
 *
 * Informed consent screen. Participant must tick a checkbox and press
 * "I Agree" before proceeding. No data is collected before this point.
 */

import React, { useState } from 'react';

export default function ConsentForm({ onConsent }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="phone-frame flex flex-col">
      <div className="bg-blue-600 text-white px-5 pt-10 pb-6">
        <h1 className="text-xl font-bold">Participant Information &amp; Consent</h1>
        <p className="text-blue-100 text-xs mt-1">CS702 · Design Frictions Study</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 text-sm text-gray-700">
        <section>
          <h2 className="font-semibold text-gray-800 mb-1">Purpose of the study</h2>
          <p className="leading-relaxed">
            This study investigates how different types of design friction in a social media
            feed affect content engagement and user experience. You will browse a feed of posts
            and then answer a few questions. The session takes approximately 15–20 minutes.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-1">What you will do</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Fill in a short demographics form</li>
            <li>Browse a social media feed (≈ 30 posts)</li>
            <li>Complete a brief memory recognition task</li>
            <li>Answer a short questionnaire about your experience</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-1">Data &amp; privacy</h2>
          <p className="leading-relaxed">
            All data is collected anonymously. You will be assigned a random participant ID.
            No personal identifying information (name, email, IP address) is stored.
            Interaction logs (scrolling, timing, button presses) are recorded for research purposes only.
            You may withdraw at any time without penalty.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-1">Contact</h2>
          <p className="leading-relaxed text-gray-600">
            If you have questions, please contact the research team via your course portal.
          </p>
        </section>

        <label className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-blue-500"
          />
          <span className="text-xs text-gray-700 leading-relaxed">
            I have read and understood the information above. I voluntarily agree to participate
            in this study and I am 18 years of age or older.
          </span>
        </label>
      </div>

      <div className="px-5 pb-8 pt-3 border-t border-gray-100 bg-white">
        <button
          disabled={!agreed}
          onClick={onConsent}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base shadow-md transition-all active:scale-95
            disabled:bg-gray-300 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600"
        >
          I Agree — Continue
        </button>
      </div>
    </div>
  );
}
