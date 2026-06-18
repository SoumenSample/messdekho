import { Link } from "react-router-dom";
import { Home, Instagram, Linkedin, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer
      className="mt-24 border-t border-gray-200 bg-white"
      data-testid="app-footer"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <Home className="h-5 w-5" />
            </div>
            <span className="font-heading text-xl font-bold text-gray-900">
              Mess<span className="text-emerald-700">Dekho</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-gray-500">
            India's homeliest marketplace for PGs, hostels & mess services — vetted by real students.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-emerald-700 hover:border-emerald-200" data-testid="social-instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-emerald-700 hover:border-emerald-200" data-testid="social-twitter">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-emerald-700 hover:border-emerald-200" data-testid="social-linkedin">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Explore</h4>
          <ul className="mt-5 space-y-3 text-sm text-gray-600">
            <li><Link to="/listings" className="hover:text-emerald-700">All PGs</Link></li>
            <li><Link to="/listings?city=Bengaluru" className="hover:text-emerald-700">Bengaluru</Link></li>
            <li><Link to="/listings?city=Mumbai" className="hover:text-emerald-700">Mumbai</Link></li>
            <li><Link to="/listings?city=Pune" className="hover:text-emerald-700">Pune</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Company</h4>
          <ul className="mt-5 space-y-3 text-sm text-gray-600">
            <li><a href="#" className="hover:text-emerald-700">About</a></li>
            <li><a href="#" className="hover:text-emerald-700">Careers</a></li>
            <li><a href="#" className="hover:text-emerald-700">Contact</a></li>
            <li><Link to="/auth?mode=signup&role=owner" className="hover:text-emerald-700">List your PG</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Support</h4>
          <ul className="mt-5 space-y-3 text-sm text-gray-600">
            <li><a href="#" className="hover:text-emerald-700">Help Center</a></li>
            <li><a href="#" className="hover:text-emerald-700">Refund Policy</a></li>
            <li><a href="#" className="hover:text-emerald-700">Terms</a></li>
            <li><a href="#" className="hover:text-emerald-700">Privacy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Mess Dekho. Crafted with care in Bengaluru.
      </div>
    </footer>
  );
};
