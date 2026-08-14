import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                AssignHub
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">How it Works</a>
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-primary"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-primary"
                >
                  Sign In
                </button>
              )}
            </div>
            <div className="md:hidden">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-primary text-sm"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-primary text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fadeIn">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Manage Assignments
              <span className="block text-blue-600">The Modern Way</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Streamline assignment management, submissions, and grading with an intuitive platform 
              designed for educators and students. Collaborate effectively and track progress in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="btn btn-primary py-3 px-8 text-lg"
              >
                {isAuthenticated ? '→ Go to Dashboard' : '→ Get Started Free'}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-outline py-3 px-8 text-lg"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
              <p className="text-lg text-gray-600">Powerful features designed for educational success</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card bg-white hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Assignments</h3>
                <p className="text-gray-600">
                  Easily create, manage, and distribute assignments to your students with flexible deadlines and clear instructions.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card bg-white hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7-9 7 9 7zm0 0v6m0-13V5m0 13l-9-7m0 0l9 7m0-7l9-7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Track Submissions</h3>
                <p className="text-gray-600">
                  Monitor student submissions in real-time. See who has submitted, who hasn't, and manage everything from one dashboard.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card bg-white hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Grade Efficiently</h3>
                <p className="text-gray-600">
                  Provide detailed feedback, grade submissions quickly, and maintain comprehensive records all in one place.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-600">Simple steps to streamline your workflow</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  1
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Create</h4>
                <p className="text-gray-600 text-sm">Create assignments with details and deadlines</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  2
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Share</h4>
                <p className="text-gray-600 text-sm">Publish and share with your class</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  3
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Collect</h4>
                <p className="text-gray-600 text-sm">Students submit their work digitally</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  4
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Grade</h4>
                <p className="text-gray-600 text-sm">Review, grade, and provide feedback</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-8 opacity-90">Join educators who are transforming their workflow</p>
            <button
              onClick={handleGetStarted}
              className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition"
            >
              {isAuthenticated ? 'Open Dashboard' : 'Start Free Trial'}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">AssignHub</h4>
              <p className="text-sm">Modern assignment management for educators</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 AssignHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
