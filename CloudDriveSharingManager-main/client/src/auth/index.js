/**
 * This file handles authentication between the user and the cloud service.
 */
import { Dropbox } from 'dropbox';
import { gapi } from 'gapi-script';

import AdapterContext from '../cloudservices';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Create authentication context.
const AuthContext = createContext();

// This is every type of update to the authentication state that can be processed.
export const AuthActionType = {
    SET_DROPBOX_ENDPOINT: "SET_DROPBOX_ENDPOINT",
    SET_GOOGLE_ENDPOINT: "SET_GOOGLE_ENDPOINT"
}

function parseQueryString(str) {
    const ret = Object.create(null);

    if (typeof str !== 'string') { return ret; }

    str = str.trim().replace(/^(\?|#|&)/, '');

    if (!str) { return ret; }

    str.split('&').forEach((param) => {
        const parts = param.replace(/\+/g, ' ').split('=');
        let key = parts.shift();
        let val = parts.length > 0 ? parts.join('=') : undefined;

        key = decodeURIComponent(key);

        val = val === undefined ? null : decodeURIComponent(val);

        if (ret[key] === undefined) {
            ret[key] = val;
        } else if (Array.isArray(ret[key])) {
            ret[key].push(val);
        } else {
            ret[key] = [ret[key], val];
        }
    });
    return ret;
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        googleAuthEndpoint: null,
        dropboxAuthEndpoint: null,
        isAuthorized: false
    });

    const { adapter } = useContext(AdapterContext);
    const navigate = useNavigate();

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.SET_DROPBOX_ENDPOINT: {
                return setAuth({
                    googleAuthEndpoint: null,
                    dropboxAuthEndpoint: payload,
                    isAuthorized: true
                });
            }
            case AuthActionType.SET_GOOGLE_ENDPOINT: {
                return setAuth({
                    googleAuthEndpoint: payload,
                    dropboxAuthEndpoint: null,
                    isAuthorized: true
                });
            }
            default:
                throw new Error("Invalid AuthActionType: " + type);
        }
    }

    auth.setDropboxEndpoint = function (endpoint) {
        authReducer({
            type: AuthActionType.SET_DROPBOX_ENDPOINT,
            payload: endpoint
        });
        navigate('/');
    }

    auth.setGoogleEndpoint = function () {
        authReducer({
            type: AuthActionType.SET_GOOGLE_ENDPOINT,
            payload: gapi
        });
    }

    useEffect(() => {
        // Initialize Google endpoint.
        function initClient() {
            gapi.client.init({
                'apiKey': 'AIzaSyCiaIlujfz15TDuN9jams2LbZ5qlvxsx_Q',
                'clientId': '51282406360-evee6rmf1ttv4ni30be7l0dhme9p61ou.apps.googleusercontent.com',
                'scope': 'https://www.googleapis.com/auth/drive',
                'discoveryDocs': ['https://content.googleapis.com/discovery/v1/apis/drive/v3/rest']
            });
        }
        gapi.load('client:auth2', initClient);
        // Finalize Dropbox authentication (if authenticated).
        let dropboxAccessToken = parseQueryString(window.location.hash).access_token;
        if (dropboxAccessToken) {
            auth.setDropboxEndpoint(new Dropbox({ accessToken: dropboxAccessToken }));
        }
    });
    
    useEffect(() => {
        if (auth.dropboxAuthEndpoint) {
            adapter.setDropboxAdapter(auth.dropboxAuthEndpoint);
        } else if (auth.googleAuthEndpoint) {
            adapter.setGoogleAdapter(auth.googleAuthEndpoint);
        }
    }, [auth]);

    return (
        <AuthContext.Provider value={{ auth }}>
            { props.children }
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };
