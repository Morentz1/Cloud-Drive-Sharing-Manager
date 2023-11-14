import AuthContext from '../auth';

import { GoogleLogin } from 'react-google-login';

import { useContext } from 'react';

const clientId = "51282406360-evee6rmf1ttv4ni30be7l0dhme9p61ou.apps.googleusercontent.com";

export default function GoogleLoginButton() {
    const { auth } = useContext(AuthContext);

    const onSuccess = (res) => {
        auth.setGoogleEndpoint();
    }

    const onFailure = (res) => {
        console.log("Failure: ", res);
    }

    return (
        <GoogleLogin
            clientId={clientId}
            onSuccess={onSuccess}
            onFailure={onFailure}
            scope='https://www.googleapis.com/auth/drive'
            discoveryDocs='https://content.googleapis.com/discovery/v1/apis/drive/v3/rest'
        />
    );
}
