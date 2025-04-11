'use client';

import { useState } from 'react';

export default function Navbar() {
    const [navbarOpen, setNavbarOpen] = useState(false);
    const toggleNavbar = () => setNavbarOpen(!navbarOpen);

    return (
        <nav className="navbar">
          <div className="navbar-brand">
            <a className="navbar-item" href="/">
                DS Downloader
            </a>
            {/* <a className={`navbar-burger ${navbarOpen ? "is-active" : ""}`} role="button" aria-label="menu" aria-expanded={navbarOpen} onClick={toggleNavbar}>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>
          <div className={`navbar-menu ${navbarOpen ? "is-active" : ""}`}>
            <div className="navbar-end">
              <div className="navbar-item">
                <a className="button" href="/login">Dashboard Login</a>
              </div>
            </div>
          </div> */}
          </div>
        </nav>
    )
}