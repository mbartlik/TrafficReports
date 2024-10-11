import React from "react";
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'react-router-dom'
import {
    Nav,
    NavLink,
    Bars,
    NavMenu,
    NavBtn,
    NavBtnLink,
} from "./navbarElements";

const Navbar = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <>
      <Nav>
        <Bars />
        <NavMenu>
          <NavLink to="/" activestyle="true">
            Home
          </NavLink>
          <NavLink to="/bots" activestyle="true">
            Our Bots
          </NavLink>
          <NavLink to="/about">
            About
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/my-bots" activestyle="true">
                My bots
              </NavLink>
              <NavLink to="/create-bot" activestyle="true">
                Create Bot
              </NavLink>
            </>
          )}
        </NavMenu>
        {!isAuthenticated && (
          <NavBtn>
            <NavBtnLink onClick={() => loginWithRedirect()}>
              Sign In
            </NavBtnLink>
          </NavBtn>
        )}
        {isAuthenticated && (
          <NavBtn>
            <NavBtnLink onClick={() => logout({
              logoutParams: {
                returnTo: window.location.origin
              }
            })}>
              Log Out
            </NavBtnLink>
          </NavBtn>
        )}
      </Nav>
    </>
  );
};

export default Navbar;