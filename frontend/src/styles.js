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
  errorMsg: {
    color: COLORS.error,
  },
  myBotListItem: {
    marginBottom: '15px', 
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
  botDescription: {
    marginTop: '0',
    marginBottom: '1rem',
  },
  formTitle: {
    color: COLORS.primary,
    marginBottom: '1rem',
  },
  formField: {
    marginBottom: '1.5rem',
    maxWidth: '80%'
  },
  formFieldSmall: {
    maxWidth: '10rem',
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    color: COLORS.text,
  },
  formInput: {
    width: '100%',
    padding: '0.8rem',
    border: `1px solid ${COLORS.text}`,
    borderRadius: '4px',
    backgroundColor: COLORS.accent,
    color: COLORS.text,
    fontFamily: 'Arial, sans-serif'
  },
  formTextarea: {
    width: '100%',
    padding: '0.8rem',
    border: `1px solid ${COLORS.text}`,
    borderRadius: '4px',
    backgroundColor: COLORS.accent,
    color: COLORS.text,
    fontFamily: 'Arial, sans-serif'
  },
  formCheckbox: {
    marginRight: '0.5rem',
    accentColor: COLORS.secondary,
  },
  actionButton: {
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '18px',
  },
  cancelButton: {
    backgroundColor: COLORS.secondary,
    color: COLORS.background,
    '&:hover': {
      backgroundColor: COLORS.primary,
    },
  },
  formButton: {
    backgroundColor: COLORS.text,
    color: COLORS.secondary,
    border: '1px solid',
    '&:hover': {
      backgroundColor: COLORS.secondary,
      color: COLORS.background,
    },
  },
  chatButton: {
    marginRight: '1rem',
    backgroundColor: COLORS.primary,
    color: 'white',
    padding: '4px 16px',
  },
  detailsContainer: {
    padding: '1rem',
    position: 'relative',
  },
  backArrow: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '1.5rem',
    color: COLORS.secondary,
    marginBottom: '1rem',
  },
  backText: {
    marginLeft: '0.5rem', 
    fontSize: '1.25rem',
    color: COLORS.secondary
  },
  mobileHeader: {
    fontSize: '2rem',
    marginBottom: '0.25rem'
  },
  mobileSubHeader: {
    fontSize: '1.5rem'
  },
  mobileSubText: {
    fontSize: '1.25rem'
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
  chatContainer: {
    maxWidth: "600px",
    margin: "20px auto",
    padding: "0 20px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    height: "calc(100dvh - 13rem)",
  },
  chatContainerMobile: {
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    height: "calc(100dvh - 12.6rem)",
  },
  messagesContainer: {
    flexGrow: 1,
    overflowY: "auto",
    marginBottom: "10px",
    paddingBottom: "20px",
  },
  messagesContainerMobile: {
    flexGrow: 1,
    overflowY: "auto",
    marginBottom: "10px",
    paddingBottom: "20px",
  },
  userMessage: {
    background: COLORS.primary,
    borderRadius: "10px",
    padding: "10px",
    marginBottom: "10px",
    textAlign: "right",
  },
  botMessage: {
    background: COLORS.secondary,
    borderRadius: "10px",
    padding: "10px",
    marginBottom: "10px",
    textAlign: "left",
  },
  systemMessage: {
    background: '#939995',
    borderRadius: "10px",
    padding: "10px",
    marginBottom: "10px",
    textAlign: "left",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    position: "sticky",
    bottom: 0,
    padding: "10px 0",
  },
  chatInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  sendButton: {
    padding: "10px 20px",
    background: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  botTitle: {
    fontSize: "1.5rem",
    color: COLORS.text,
  },
  linkCopyButton: {
    background: "none",
    border: "none",
    padding: "8px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  copyBanner: {
    position: "fixed",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: COLORS.primary,
    color: "white",
    padding: "10px 20px",
    fontSize: "14px",
    borderRadius: "4px",
    zIndex: 1000, // Ensure it stays on top
    textAlign: "center",
  },
};

export default styles;