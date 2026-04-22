import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">LeadCoverage</h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered B2B Marketing Intelligence
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Build client brains, run personalized campaigns, and generate
            pipeline at scale.
          </p>
          <Link
            href="/register"
            className="bg-blue-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-800 inline-block"
          >
            Start Free Trial
          </Link>
        </div>
      </main>
    </div>
  );
}
