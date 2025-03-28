import React from 'react';
import styles from '../styles';

const About = ({ isMobile }) => (
  <div style={isMobile ? styles.aboutMobile : styles.about}>
    <div>
      This application was created to help users track the time it takes to travel a certain route over time. This can be used to monitor best times to commute for example.
    </div>
    <br />
    <div>
      The frontend is a react app hosted using Azure Static Web Apps. The backend is a Python Api hosted on Azure App Services. The route info is retrieved using the Here Maps API. Routes are computed every ten minutes using an Azure Logic App, and data is stored in Azure SQL.
    </div>
  </div>
);

export default About;
