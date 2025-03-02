import React from 'react';
import styles from '../styles';

const About = ({ isMobile }) => (
  <div style={isMobile ? styles.aboutMobile : styles.about}>
    <div>
      Traffic routes app details
    </div>
  </div>
);

export default About;
