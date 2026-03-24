
import { ArrowRight, TrendingUp, Lock, Zap, PieChart, BarChart3 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const Homepage: React.FC = () => {
    const iconAnimationClass = "transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12";
    
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-50">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 md:px-12 lg:px-20">
                <div className="flex items-center gap-2">
                    <PieChart className="w-8 h-8 text-blue-600 animate-pulse" />
                    <span className="text-2xl font-bold text-slate-900">ExpenseNest</span>
                </div>
                <NavLink to={"/login"} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
                    Sign In
                </NavLink>
            </nav>

            {/* Hero Section */}
            <section className="px-6 md:px-12 lg:px-20 py-20 text-center">
                <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                    Take Control of Your
                    <span className="block bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Financial Future
                    </span>
                </h1>
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                    Track, analyze, and optimize your spending with ExpenseNest. Smart insights for better financial decisions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition transform hover:scale-105">
                        Get Started Free <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                    <button className="px-8 py-4 border-2 border-blue-300 text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition">
                        Watch Demo
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-6 md:px-12 lg:px-20 py-20 bg-slate-100">
                <h2 className="text-4xl font-bold text-slate-900 text-center mb-16">Powerful Features</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        { icon: TrendingUp, title: 'Smart Analytics', desc: 'AI-powered insights into your spending patterns' },
                        { icon: Lock, title: 'Secure & Private', desc: 'Bank-level encryption keeps your data safe' },
                        { icon: Zap, title: 'Real-time Tracking', desc: 'Monitor expenses instantly across all devices' },
                        { icon: BarChart3, title: 'Detailed Reports', desc: 'Visualize your finances with interactive charts' },
                        { icon: PieChart, title: 'Budget Planning', desc: 'Create and manage budgets effortlessly' },
                        { icon: ArrowRight, title: 'Goal Setting', desc: 'Achieve financial goals with guided planning' },
                    ].map((feature, idx) => (
                        <div key={idx} className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition transform hover:scale-105">
                            <feature.icon className={`w-12 h-12 text-blue-600 mb-4 ${iconAnimationClass}`} />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                            <p className="text-slate-600">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 md:px-12 lg:px-20 py-20 text-center">
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to Transform Your Finances?</h2>
                <p className="text-slate-600 mb-8 text-lg">Start tracking, analyzing, and growing your wealth today.</p>
                <button className="px-10 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg text-lg transition transform hover:scale-105">
                    Start Your Free Trial
                </button>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 px-6 md:px-12 lg:px-20 py-8 text-center text-slate-500">
                <p>&copy; 2024 ExpenseNest. All rights reserved.</p>
            </footer>
        </div>
    );
};