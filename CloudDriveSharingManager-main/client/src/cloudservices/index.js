import { DropboxCloudServiceAdapter } from './DropboxCloudServiceAdapter';
import { GoogleCloudServiceAdapter } from '../cloudservices/GoogleCloudServiceAdapter';

import React, { createContext, useState } from 'react';

// Create adapter context.
const AdapterContext = createContext();

// This is every type of update to the adapter state that can be processed.
export const AdapterActionType = {
    SET_ADAPTER: "SET_ADAPTER"
}

function AdapterContextProvider(props) {
    const [adapter, setAdapter] = useState({
        adapter: null
    });

    const adapterReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AdapterActionType.SET_ADAPTER:
                return setAdapter({
                    adapter: payload
                });
            default:
                throw new Error("Invalid AdapterActionType: " + type);
        }
    }

    adapter.setDropboxAdapter = function (endpoint) {
        adapterReducer({
            type: AdapterActionType.SET_ADAPTER,
            payload: new DropboxCloudServiceAdapter(endpoint)
        });
    }

    adapter.setGoogleAdapter = function (endpoint) {
        adapterReducer({
            type: AdapterActionType.SET_ADAPTER,
            payload: new GoogleCloudServiceAdapter(endpoint)
        });
    }

    return (
        <AdapterContext.Provider value={{ adapter }}>
            { props.children }
        </AdapterContext.Provider>
    );
}

export default AdapterContext;
export { AdapterContextProvider };
