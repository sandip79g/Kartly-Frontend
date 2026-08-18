import React from "react";

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="text-white font-semibold mb-3">Get to know us</h4>
          <ul className="space-y-1">
            <li>About Kartly</li>
            <li>Careers</li>
            <li>Press releases</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Connect with us</h4>
          <ul className="space-y-1">
            <li>Facebook</li>
            <li>Twitter</li>
            <li>Instagram</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Let us help you</h4>
          <ul className="space-y-1">
            <li>Your account</li>
            <li>Returns centre</li>
            <li>Help</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Prototype notice</h4>
          <p className="text-gray-400">
            This is a demo storefront built for evaluation purposes — no real payments are processed.
          </p>
        </div>
      </div>
      <div className="border-t border-navy-light text-center text-xs text-gray-500 py-4">
        © {new Date().getFullYear()} Kartly Your doorstep marketplace.
      </div>
    </footer>
  );
}
