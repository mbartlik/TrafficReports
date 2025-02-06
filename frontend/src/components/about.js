import React from 'react';
import styles from '../styles';

function About(props) {
  const { isMobile } = props;
  return (
    <div style={isMobile ? styles.aboutMobile : styles.about}>
      <div>
        This is an application where you can create and share chatbots which you can provide unique knowledge too. You provide the bot some context, and it will be able to chat with others with knowledge of that context, using the provided link.
      </div>
      <br />
      <div>
        This is a React app hosted with Miscrosoft Azure Static Web Apps. The API is made with the Python Flask framework and hosted with Azure App service. It uses Azure AI Service to dynamically interact with an LLM, and Azure SQL for storing necessary information. The authentication is managed with Auth0.
      </div>
    </div>
  )
}

export default About;
