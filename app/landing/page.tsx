"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { FileText, Sparkles, Brain, ShieldCheck, Zap, UserCheck, Lock, Rocket } from "lucide-react"

export default function Landing() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-200 text-gray-900 dark:from-[#18181b] dark:to-[#23232a] dark:text-white transition-colors duration-300 overflow-x-hidden">
      {/* Ambient floating blurred shapes */}
      <div className="pointer-events-none select-none">
        <div className="hidden md:block absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-blue-300 opacity-30 rounded-full blur-3xl animate-float-slow z-0" />
        <div className="hidden md:block absolute bottom-[-100px] right-[-100px] w-[240px] h-[240px] bg-purple-300 opacity-20 rounded-full blur-2xl animate-float z-0" />
        <div className="hidden md:block absolute top-1/2 left-[-80px] w-[160px] h-[160px] bg-pink-200 opacity-20 rounded-full blur-2xl animate-float-reverse z-0" />
      </div>
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Image src="/Agora.jpeg" alt="AgoraAI Logo" width={40} height={40} className="rounded-xl" />
            <span className="font-bold text-xl tracking-tight">AgoraAI</span>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <a href="#home" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
            <a href="#tools" className="hover:text-blue-600 transition-colors">Tools</a>
            <a href="#footer" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/auth/signin")}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative flex flex-col items-center justify-center flex-1 py-16 px-4 text-center overflow-hidden">
        {/* Animated gradient background for hero */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-blue-100/60 via-purple-100/40 to-pink-100/30 dark:from-blue-900/40 dark:via-purple-900/30 dark:to-pink-900/20 animate-gradient-move" />
        </div>
        <div className="relative z-10 mb-6">
          <Image src="/Agora.jpeg" alt="AgoraAI Logo" width={96} height={96} className="rounded-2xl mx-auto shadow-lg" priority />
        </div>
        <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          Unlock the Power of <span className="text-blue-600">AI Tools</span> for Everyone
        </h1>
        <p className="relative z-10 text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          AgoraAI brings together a suite of innovative, privacy-first AI tools designed for simplicity, speed, and accuracy. No clutter—just results.
        </p>
        <Button size="lg" className="relative z-10 px-8 py-4 text-lg shadow-lg" onClick={() => router.push("/auth/signin")}>Get Started</Button>
        {/* Optional: subtle animation/illustration */}
        <div className="relative z-10 mt-10 animate-pulse">
          <Sparkles className="mx-auto text-blue-400 dark:text-blue-300" size={36} />
        </div>
        {/* Floating blurred circle for extra ambient effect */}
        <div className="absolute right-[-60px] bottom-[-60px] w-40 h-40 bg-blue-200 opacity-20 rounded-full blur-2xl animate-float" />
      </section>
      {/* SVG Wave Divider */}
      <div className="w-full -mt-4 z-10 relative">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16">
          <path fill="currentColor" d="M0,32 C360,80 1080,0 1440,48 L1440,80 L0,80 Z" className="text-white dark:text-[#1a1a23]" />
        </svg>
      </div>

      {/* Tools Overview Section */}
      <section id="tools" className="py-16 px-4 bg-white dark:bg-[#1a1a23] transition-colors relative overflow-hidden">
        <h2 className="relative z-10 text-3xl font-bold text-center mb-10">Our Tools</h2>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-2xl p-6 shadow hover:scale-105 transition-transform">
            <FileText className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="font-semibold text-xl mb-2">File Extractor</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Extract and summarize content from documents in seconds.</p>
            <Button variant="secondary" disabled>Coming Soon</Button>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-2xl p-6 shadow hover:scale-105 transition-transform">
            <Sparkles className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="font-semibold text-xl mb-2">Text Humanizer</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Transform robotic text into natural, human-like language.</p>
            <Button variant="secondary" disabled>Coming Soon</Button>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-2xl p-6 shadow hover:scale-105 transition-transform">
            <Brain className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="font-semibold text-xl mb-2">AI Assistant</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Your smart companion for Q&A, brainstorming, and more.</p>
            <Button variant="secondary" disabled>Coming Soon</Button>
          </div>
        </div>
      </section>
      {/* SVG Wave Divider */}
      <div className="w-full -mt-4 z-10 relative">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16">
          <path fill="currentColor" d="M0,32 C360,80 1080,0 1440,48 L1440,80 L0,80 Z" className="text-slate-100 dark:text-[#23232a]" />
        </svg>
      </div>

      {/* Why Choose Us / Benefits Section */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose AgoraAI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <ShieldCheck className="mx-auto h-8 w-8 text-blue-500 mb-2" />
            <h4 className="font-semibold mb-1">Privacy First</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Your data stays yours. We never share or sell your information.</p>
          </div>
          <div>
            <Zap className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
            <h4 className="font-semibold mb-1">Lightning Fast</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Get results in seconds, not minutes. Speed is our priority.</p>
          </div>
          <div>
            <UserCheck className="mx-auto h-8 w-8 text-green-500 mb-2" />
            <h4 className="font-semibold mb-1">Human-Centric</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Tools designed for real people, not just techies.</p>
          </div>
          <div>
            <Lock className="mx-auto h-8 w-8 text-purple-500 mb-2" />
            <h4 className="font-semibold mb-1">Secure & Reliable</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Enterprise-grade security and 99.9% uptime.</p>
          </div>
        </div>
      </section>
      {/* SVG Wave Divider */}
      <div className="w-full -mt-4 z-10 relative">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16">
          <path fill="currentColor" d="M0,32 C360,80 1080,0 1440,48 L1440,80 L0,80 Z" className="text-slate-100 dark:text-[#23232a]" />
        </svg>
      </div>

      {/* About / Vision Section */}
      <section id="about" className="py-16 px-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#23232a] dark:to-[#18181b] transition-colors relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Rocket className="mx-auto h-10 w-10 text-blue-600 mb-4" />
          <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            AgoraAI is on a mission to democratize access to advanced AI tools. We believe in making artificial intelligence simple, ethical, and accessible for everyone—students, professionals, and creators alike.
          </p>
          <p className="text-md text-gray-500 dark:text-gray-400">
            Built by a passionate team, AgoraAI is committed to privacy, transparency, and continuous innovation.
          </p>
        </div>
      </section>
      {/* SVG Wave Divider */}
      <div className="w-full -mt-4 z-10 relative">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16">
          <path fill="currentColor" d="M0,32 C360,80 1080,0 1440,48 L1440,80 L0,80 Z" className="text-slate-100 dark:text-[#23232a]" />
        </svg>
      </div>

      {/* Call to Action Section */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to experience the future of AI?</h2>
        <Button size="lg" className="px-10 py-4 text-lg shadow-lg" onClick={() => router.push("/auth/signin")}>Get Started</Button>
      </section>

      {/* Footer */}
      <footer id="footer" className="py-8 px-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#18181b]/80 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-col md:flex-row items-start justify-between max-w-5xl mx-auto gap-8 md:gap-4">
          {/* Address and contact info */}
          <div className="flex-1 text-left space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/Agorawide.png" alt="AgoraAI Logo" width={256} height={256} className="rounded-lg" />
              <span>© {new Date().getFullYear()} AgoraAI. All rights reserved.</span>
            </div>
            <div className="font-semibold text-gray-800 dark:text-white">Adresse</div>
            <div>227 Bd Ghandi 1er Etage Appt N 2 - Hay-Hassani (AR)</div>
            <div><span className="font-semibold">Tél</span> 05-22-99-15-40</div>
            <div><span className="font-semibold">Fax</span> 05-22-98-90-26</div>
          </div>
          {/* Contact Us Form */}
          <form className="flex-1 w-full max-w-md bg-white dark:bg-[#23232a] rounded-lg shadow p-6 space-y-4 text-left mx-auto md:mx-0">
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Contact Us</h3>
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium mb-1">Name</label>
              <input id="contact-name" name="name" type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-[#18181b] text-gray-900 dark:text-white" />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium mb-1">Email</label>
              <input id="contact-email" name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-[#18181b] text-gray-900 dark:text-white" />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium mb-1">Message</label>
              <textarea id="contact-message" name="message" rows={3} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-[#18181b] text-gray-900 dark:text-white" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition">Send Message</button>
          </form>
        </div>
      </footer>
    </div>
  )
}

// Add keyframes for floating and gradient animation
// Add to your global CSS (e.g., app/globals.css):
//
// @keyframes float {
//   0%, 100% { transform: translateY(0); }
//   50% { transform: translateY(-20px); }
// }
// .animate-float { animation: float 6s ease-in-out infinite; }
// .animate-float-slow { animation: float 12s ease-in-out infinite; }
// .animate-float-reverse { animation: float 8s ease-in-out infinite reverse; }
// @keyframes gradient-move {
//   0%, 100% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
// }
// .animate-gradient-move { background-size: 200% 200%; animation: gradient-move 16s ease-in-out infinite; }