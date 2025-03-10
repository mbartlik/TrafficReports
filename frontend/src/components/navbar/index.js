import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router-dom";
import styles from "../../styles";

const Navbar = ({ isMobile, onClickHome }) => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);
  const homeClick = () => {
    closeMenu();
    onClickHome();
  };

  const getNavLinkStyles = (isActive) => ({
    ...styles.navLink,
    ...(isActive ? styles.navLinkActive : {}),
    ...(isMobile ? styles.navLinkMobile : {}),
  });

  const renderNavLinks = () => (
    <>
      <NavLink to="/" style={({ isActive }) => getNavLinkStyles(isActive)} onClick={homeClick}>
        Home
      </NavLink>
      <NavLink to="/about" style={({ isActive }) => getNavLinkStyles(isActive)} onClick={closeMenu}>
        About
      </NavLink>
      {isAuthenticated && (
        <>
          <NavLink to="/track-new-route" style={({ isActive }) => getNavLinkStyles(isActive)} onClick={closeMenu}>
            Track new route
          </NavLink>
        </>
      )}
    </>
  );

  return (
    <nav style={styles.nav}>
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
          {renderNavLinks()}
        </div>
      )}
      <div style={styles.navBtn}>
        {!isAuthenticated ? (
          <button
            style={{
              ...styles.navBtnLink,
              ...(isMobile ? { ...styles.mobileButton, minWidth: '6rem', padding: 0 } : {}),
            }}
            onClick={loginWithRedirect}
          >
            Sign In
          </button>
        ) : (
          <button
            style={{
              ...styles.navBtnLink,
              ...(isMobile ? { ...styles.mobileButton, minWidth: '6rem', padding: 0 } : {}),
            }}
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Log Out
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
