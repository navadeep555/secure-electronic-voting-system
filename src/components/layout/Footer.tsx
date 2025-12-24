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
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="relative">
                <Shield className="h-8 w-8 text-accent" />
                <Vote className="h-4 w-4 text-primary-foreground absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-semibold leading-tight">
                  SecureVote
                </span>
                <span className="text-[10px] text-primary-foreground/70 uppercase tracking-widest">
                  Electoral Commission
                </span>
              </div>
            </Link>
            <p className="text-primary-foreground/70 text-sm max-w-xs mb-6">
              A secure, anonymous, and transparent online voting platform ensuring fair and accessible elections for all citizens.
            </p>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>1-800-VOTE-NOW</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@securevote.gov</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Electoral Commission HQ</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Platform
            </h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Elections
            </h3>
            <ul className="space-y-2">
              {footerLinks.elections.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} SecureVote Electoral Commission. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="security-indicator bg-success/20 text-success">
              <Shield className="h-3 w-3" />
              <span>256-bit Encryption</span>
            </div>
            <div className="security-indicator bg-success/20 text-success">
              <span>WCAG 2.1 AA</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
