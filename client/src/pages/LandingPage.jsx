import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, Smartphone, QrCode, Gift, Shield, Zap, Users, TrendingUp, ChevronRight, Star } from 'lucide-react';
import { assets } from "../assets/assets";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "UPI Payments",
      description: "Send money instantly using UPI ID or mobile number. Fast, secure, and available 24/7."
    },
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "QR Code Scanning",
      description: "Scan any UPI QR code to pay merchants, friends, or family within seconds."
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Redeem Codes",
      description: "Enter gift codes and vouchers to instantly receive money in your wallet."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Level Security",
      description: "256-bit encryption and multi-factor authentication keeps your money safe."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Cashback & Rewards",
      description: "Earn cashback on every transaction and unlock exclusive rewards."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Split Bills",
      description: "Easily split expenses with friends and request money hassle-free."
    }
  ];

  const steps = [
    { number: "1", title: "Download App", description: "Get the app from Play Store or App Store" },
    { number: "2", title: "Link Bank Account", description: "Securely connect your bank account via UPI" },
    { number: "3", title: "Verify Identity", description: "Complete KYC verification in minutes" },
    { number: "4", title: "Start Paying", description: "Send money, scan QR, or redeem codes" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechCorp",
      text: "This platform transformed how our team works. Productivity increased by 300%!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      text: "Best investment we've made. The ROI was evident within the first month.",
      rating: 5
    },
    {
      name: "Emily Davis",
      role: "Startup Founder",
      text: "Simple, powerful, and exactly what we needed to scale our business.",
      rating: 5
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white min-h-screen">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-22">
            <div className="flex items-center gap-3">
                <img
                  src={assets.mudraLogo}
                  alt="MudraPay Logo"
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  MudraPay
                </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-emerald-400 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-emerald-400 transition-colors font-medium">How It Works</a>
              <a href="#testimonials" className="text-gray-300 hover:text-emerald-400 transition-colors font-medium">Testimonials</a>
              <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-0.5"
                onClick={() => navigate('/login')}> Get Started</button>
            </div>

            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900/98 backdrop-blur-lg border-t border-white/10">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a href="#features" className="block px-4 py-3 hover:bg-purple-900/50 rounded-lg transition-colors">Features</a>
              <a href="#how-it-works" className="block px-4 py-3 hover:bg-purple-900/50 rounded-lg transition-colors">How It Works</a>
              <a href="#testimonials" className="block px-4 py-3 hover:bg-purple-900/50 rounded-lg transition-colors">Testimonials</a>
              <button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 rounded-lg font-semibold mt-2"
              onClick={() => navigate('/login')}> Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">India's Fastest Payment App</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Pay Anyone,
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Anywhere,
              </span>
              <br />
              Instantly
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Send money via UPI, scan QR codes, redeem gift codes and earn cashback.
              Experience seamless transactions with bank-level security.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button className="group bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-full text-lg font-bold border-2 border-emerald-500 hover:bg-emerald-500/10 transition-all">
                Watch Demo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto md:mx-0">
              <div>
                <div className="text-3xl font-bold text-emerald-400 mb-1">50M+</div>
                <div className="text-gray-400 text-sm">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-400 mb-1">₹500Cr+</div>
                <div className="text-gray-400 text-sm">Transactions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-400 mb-1">99.9%</div>
                <div className="text-gray-400 text-sm">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-[3rem] p-8 border border-white/10 backdrop-blur-sm shadow-2xl animate-float">
              <div className="bg-slate-800 rounded-3xl p-6 space-y-4">
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-6">
                  <p className="text-slate-900 text-sm font-semibold mb-1">Available Balance</p>
                  <h3 className="text-slate-900 text-4xl font-bold">₹12,450.00</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-700/50 p-4 rounded-xl text-center border border-white/5 hover:border-emerald-500/30 transition-colors cursor-pointer">
                    <Smartphone className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                    <span className="text-sm font-semibold">UPI Pay</span>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-xl text-center border border-white/5 hover:border-emerald-500/30 transition-colors cursor-pointer">
                    <QrCode className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                    <span className="text-sm font-semibold">Scan QR</span>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-xl text-center border border-white/5 hover:border-emerald-500/30 transition-colors cursor-pointer">
                    <Gift className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                    <span className="text-sm font-semibold">Redeem</span>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-xl text-center border border-white/5 hover:border-emerald-500/30 transition-colors cursor-pointer">
                    <Shield className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                    <span className="text-sm font-semibold">Cards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold text-emerald-400">WHY CHOOSE US</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Complete payment solution with advanced features for modern transactions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-emerald-500/30 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {React.cloneElement(feature.icon, { className: 'w-8 h-8 text-slate-900' })}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold text-emerald-400">SIMPLE PROCESS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Start sending money in just 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-3xl font-black text-slate-900 mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold text-emerald-400">TESTIMONIALS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-gray-400 text-lg">Trusted by thousands of businesses worldwide</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/30 rounded-3xl p-12 text-center backdrop-blur-sm">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Start Sending Money Today</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join millions of Indians who trust us for their daily transactions
            </p>
            <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-10 py-4 rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-1 inline-flex items-center gap-2">
              Download Now
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={assets.mudraLogo}
                    alt="MudraPay Logo"
                    className="w-10 h-10 rounded-full"
                  />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  MudraPay
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-sm">
                India's most trusted payment app for instant UPI transfers, QR payments, and digital transactions.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-emerald-400 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-emerald-400 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>© 2025 MudraPay. All rights reserved. | Made in India 🇮🇳</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}