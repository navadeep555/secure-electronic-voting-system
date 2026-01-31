import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Shield, Menu, X, Vote, User, Eye, Settings } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Elections", href: "/elections" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Results", href: "/results" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();



  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white shadow-sm border-t-[4px] border-t-primary-700 font-sans"
    >
      <div className="container flex h-20 items-center justify-between">
        {/* Logo - OFFICIAL & SERIOUS */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center">
            <Shield className="h-10 w-10 text-primary-700 fill-primary-50" strokeWidth={1.5} />
            <Vote className="h-4 w-4 text-primary-900 absolute" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold text-neutral-900 leading-none tracking-tight">
              SCV
            </span>
            <span className="text-[11px] text-neutral-600 uppercase tracking-widest font-semibold mt-1">
              Secure Vote Commission
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - CLEAN & UNDERLINED */}
        <nav className="hidden md:flex items-center gap-6">
          {navigation.map((item, index) => (
            <Link
              key={item.name}
              to={item.href}
              className={`relative px-1 py-1 text-sm font-bold uppercase tracking-wide transition-colors ${isActive(item.href)
                ? "text-primary-700"
                : "text-neutral-600 hover:text-primary-700"
                }`}
            >
              {item.name}
              {isActive(item.href) && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-primary-700"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons - SQUARED & OFFICIAL */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-semibold text-neutral-700 hover:bg-neutral-100 uppercase text-xs tracking-wider">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-primary-700 hover:bg-primary-800 text-white font-bold uppercase text-xs tracking-wider px-6 rounded-sm shadow-sm transition-all">
              Register
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-neutral-700" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-white border-l-primary-700 border-l-4">
            <div className="flex flex-col gap-8 mt-8">
              <div className="flex items-center gap-2 pb-4 border-b border-neutral-200">
                <Shield className="h-8 w-8 text-primary-700" />
                <span className="font-display font-bold text-lg">Menu</span>
              </div>
              <nav className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 text-sm font-bold uppercase tracking-wide border-l-2 transition-all ${isActive(item.href)
                      ? "text-primary-700 border-primary-700 bg-primary-50"
                      : "text-neutral-600 border-transparent hover:bg-neutral-50"
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3 pt-4">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full border-neutral-300 font-bold uppercase text-xs">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-primary-700 text-white font-bold uppercase text-xs">
                    Register to Vote
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
