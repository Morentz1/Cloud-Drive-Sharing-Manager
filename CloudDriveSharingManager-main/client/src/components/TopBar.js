import * as React from 'react';
import UserNavBar from './UserNavBar';
import AppLogo from './AppLogo';
import { useContext } from 'react';
import AuthContext from '../auth';

export default function TopBar( props ) {
    const { auth } = useContext(AuthContext);

    if (auth.isAuthorized) {
        return (
           <UserNavBar  handleQuery={props.handleQuery}
                        handleQueryBuilderButton={props.handleQueryBuilderButton}/>
        );
    }
    return (
        <div className="flex flex-row justify-between p-3">
            <AppLogo />
        </div>
    );
}
