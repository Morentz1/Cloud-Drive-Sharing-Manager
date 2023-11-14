import { Dropbox } from 'dropbox';

import { Button } from '@mui/material';

const clientId = "uw4cgtludeaf8id";

export default function DropboxLoginButton() {
    function handleClick() {
        let dbx = new Dropbox({ clientId: clientId });
        dbx.auth.getAuthenticationUrl('http://localhost:3000').then((authUrl) => {
            window.location.href = authUrl;
        });
    }

    return (
        <Button
            onClick={handleClick}
            sx={{
                width: '20vh',
                color: 'white',
                background: 'blue',
                marginTop: 5
            }}
        >
            Dropbox Login
        </Button>
    );
}
