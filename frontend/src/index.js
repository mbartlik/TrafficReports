import React from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App';

const auth0Domain = process.env.REACT_APP_AUTH_DOMAIN;
const auth0ClientId = process.env.REACT_APP_AUTH_CLIENT;

ReactDOM.render(
    <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{
          redirect_uri: window.location.origin
        }}
    >
        <App />
    </Auth0Provider>, 
    document.getElementById('root')
);
