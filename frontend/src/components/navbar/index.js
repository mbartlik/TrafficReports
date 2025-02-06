import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router-dom";
import styles from "../../styles";

const Navbar = (props) => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const { isMobile } = props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prevState) => !prevState);

  const closeMenu = () => setIsMenuOpen(false); // Function to close the menu

  return (
    <nav style={styles.nav}>
      {/* Mobile Hamburger Icon */}
      {isMobile && (
        <div
          style={{ ...styles.bars, ...(isMobile ? styles.barsMobile : {}) }}
          onClick={toggleMenu}
        >
          &#9776;
        </div>
      )}
      {(!isMobile || isMenuOpen) && (
        <div
          style={{
            ...styles.navMenu,
            ...(isMobile && isMenuOpen ? styles.navMenuMobileOpen : {}),
          }}
        >
          <NavLink
            to="/"
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
              ...(isMobile ? styles.navLinkMobile : {}),
            })}
            onClick={closeMenu} // Close the menu when clicked
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
              ...(isMobile ? styles.navLinkMobile : {}),
            })}
            onClick={closeMenu} // Close the menu when clicked
          >
            About
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink
                to="/my-bots"
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                  ...(isMobile ? styles.navLinkMobile : {}),
                })}
                onClick={closeMenu} // Close the menu when clicked
              >
                My Bots
              </NavLink>
              <NavLink
                to="/create-bot"
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                  ...(isMobile ? styles.navLinkMobile : {}),
                })}
                onClick={closeMenu} // Close the menu when clicked
              >
                Create Bot
              </NavLink>
            </>
          )}
        </div>
      )}
      {!isAuthenticated && (
        <div style={styles.navBtn}>
          <button style={{ ...styles.navBtnLink, ...(isMobile ? { ...styles.mobileButton, minWidth: '6rem', padding: 0 } : {}) }} onClick={() => loginWithRedirect()}>
            Sign In
          </button>
        </div>
      )}
      {isAuthenticated && (
        <div style={styles.navBtn}>
          <button
            style={{ ...styles.navBtnLink, ...(isMobile ? { ...styles.mobileButton, minWidth: '6rem', padding: 0 } : {}) }}
            onClick={() =>
              logout({
                logoutParams: {
                  returnTo: window.location.origin,
                },
              })
            }
          >
            Log Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
