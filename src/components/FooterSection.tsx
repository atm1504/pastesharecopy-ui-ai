
import React from "react";
import { Link } from "react-router-dom";

const FooterSection: React.FC = () => {
  return (
    <footer className="border-t border-border/40">
      <div className="container max-w-6xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="inline-block">
              <div className="font-bold text-xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                pastesharecopy
              </div>
            </Link>
            <p className="text-muted-foreground mt-4 text-sm">
              Share code snippets instantly with developers around the world.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 text-sm">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">API</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Integrations</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 text-sm">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Guides</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Support</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Status</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 text-sm">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} pastesharecopy. All rights reserved.
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
