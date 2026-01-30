import { Link } from "react-router-dom";
import { Shield, Vote, Phone, Mail, MapPin } from "lucide-react";

const footerLinks = {
  platform: [
    { name: "How It Works", href: "/how-it-works" },
    { name: "Security", href: "/security" },
    { name: "Accessibility", href: "/accessibility" },
    { name: "FAQ", href: "/faq" },
  ],
  elections: [
    { name: "Current Elections", href: "/elections" },
    { name: "Past Results", href: "/results" },
    { name: "Election Calendar", href: "/calendar" },
    { name: "Voter Registration", href: "/register" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Data Protection", href: "/data-protection" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 border-t border-primary-900 font-sans">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="relative flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary-600" fill="#4a0404" />
                <Vote className="h-3 w-3 text-neutral-300 absolute" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold text-neutral-100 leading-none tracking-tight">
                  SecureVote
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mt-1">
                  Electoral Commission
                </span>
              </div>
            </Link>
            <p className="text-neutral-400 text-sm max-w-xs mb-8 leading-relaxed">
              Official digital voting platform authorized by the National Electoral Commission. Ensuring secure, transparent, and verified elections for all eligible citizens.
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3 text-neutral-300">
                <Phone className="h-4 w-4 text-accent-500" />
                <span>1-800-VOTE-NOW (Official Helpline)</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <Mail className="h-4 w-4 text-accent-500" />
                <span>helpdesk@commission.gov</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <MapPin className="h-4 w-4 text-accent-500" />
                <span>Commission HQ, Capital City</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-bold text-neutral-100 mb-6 text-xs uppercase tracking-widest border-l-2 border-accent-600 pl-3">
              Platform Info
            </h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-accent-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-neutral-100 mb-6 text-xs uppercase tracking-widest border-l-2 border-accent-600 pl-3">
              Elections
            </h3>
            <ul className="space-y-3">
              {footerLinks.elections.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-accent-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-neutral-100 mb-6 text-xs uppercase tracking-widest border-l-2 border-accent-600 pl-3">
              Legal & Compliance
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-accent-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>
            © {new Date().getFullYear()} National Electoral Commission. All rights reserved. Authorized Government System.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 text-emerald-500" />
              <span className="text-neutral-400">Military-Grade Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-neutral-400">System Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
