"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("feedback").insert({
      user_id: user?.id,
      message,
    });
    setMessage("");
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setOpen(false);
    }, 2000);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-700 text-white px-4 py-2 rounded-full text-sm shadow-lg hover:bg-blue-800"
      >
        Feedback
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Send Feedback</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          {"✕"}
        </button>
      </div>
      {submitted ? (
        <p className="text-green-600 text-sm">Thanks for your feedback!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="What's on your mind?"
          />
          <button
            type="submit"
            className="mt-2 w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
