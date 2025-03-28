const COLORS = {
  primary: 'rgb(183, 195, 243)',
  secondary: 'rgb(221, 117, 150)',
  accent: 'rgb(242, 243, 217)',
  background: 'rgb(64, 78, 92)',
  text: 'rgb(79, 98, 114)',
  error: 'rgb(183, 18, 89)',
};

const styles = {
  body: {
    padding: '0 2rem',
    height: 'calc(100dvh - 6.5rem)',
    overflowY: 'auto'
  },
  bodyMobile: { 
    padding: '0 0.5rem'
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: `rgba(${COLORS.background.replace(/rgb\((.*?)\)/, '$1')}, 0.8)` ,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: '1rem'
  },

  // navbar styles
  nav: {
    background: COLORS.text,
    height: "85px",
    display: "flex",
    justifyContent: "space-between",
    padding: '0 1rem',
    zIndex: 12,
  },
  navLink: {
    color: COLORS.accent,
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    padding: "0 1rem",
    height: "100%",
    cursor: "pointer",
    fontSize: "1.5rem",
  },
  navLinkActive: {
    color: COLORS.primary, 
  },
  navLinkMobile: {
    padding: '0.25rem'
  },
  bars: {
    display: "none", // Hidden by default
    color: COLORS.accent,
    fontSize: "3rem",
    position: "relative",
    top: '0.75rem',
    cursor: "pointer",
  },
  navMenu: {
    display: "flex",
    alignItems: "center",
  },
  navMenuMobileOpen: {
    display: "flex",
    flexDirection: "column",
    justifyContent: 'space-between',
    position: "absolute",
    top: "85px",
    right: "0",
    left: "0",
    background: COLORS.text,
    zIndex: 10,
    paddingTop: "1rem",
    paddingBottom: "1rem",
    boxSizing: "border-box",
    margin: '0 0.5rem',
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    marginRight: "24px",
  },
  navBtnLink: {
    borderRadius: "4px",
    background: COLORS.secondary,
    padding: "10px 22px",
    color: COLORS.background,
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    textDecoration: "none",
    marginLeft: "24px",
    "&:hover": {
      background: "#fff",
      color: COLORS.secondary,
    },
  },
  barsMobile: {
    display: "block",
  },
  about: {
    marginTop: "2rem",
    fontSize: "1.2rem",
    padding: "0 2rem",
  },
  aboutMobile: {
    marginTop: "2rem",
    fontSize: '1.5rem',
    padding: "0 0.5rem"
  },
  mobileHeader: {
    fontSize: '2rem',
    marginBottom: '0.25rem'
  },
  mobileList: {
    listStyleType: 'none',
    paddingInlineStart: 0
  },
  mobileButton: {
    height: '3rem',
    width: '6rem',
    fontSize: '1.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  standardButton: {
    padding: "5px 10px",
    borderRadius: "3px",
    border: "none",
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "14px",
    backgroundColor: COLORS.text,
    color: COLORS.accent
  },
  deleteButton: {
    backgroundColor: COLORS.secondary,
    color: COLORS.background,
  },
  clickableText: {
    color: COLORS.text,
    textDecoration: 'underline',
    cursor: 'pointer',
  }
};

export default styles;