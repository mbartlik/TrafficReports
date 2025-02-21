import React from 'react';
import styles from '../styles';

const About = ({ isMobile }) => (
  <div style={isMobile ? styles.aboutMobile : styles.about}>
    <div>
      This is an application where you can create and share chatbots, providing them with unique knowledge. You provide the bot with context, and it can chat with others using that context, through a shared link.
    </div>
    <br />
    <div>
      This React app is hosted on Microsoft Azure Static Web Apps. The API is built with the Python Flask framework and hosted on Azure App Service. It uses Azure AI Service for dynamic interactions with an LLM, and Azure SQL for data storage. Authentication is managed through Auth0.
    </div>
  </div>
);

export default About;
