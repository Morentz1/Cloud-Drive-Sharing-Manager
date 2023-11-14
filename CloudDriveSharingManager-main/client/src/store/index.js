/**
 * This file handles current snapshot and directory information.
 */
import api from '../api';
import AdapterContext from '../cloudservices';

import React, { createContext, useContext, useState } from 'react';

// Create store context.
const StoreContext = createContext();

// This is every type of update to the store state that can be processed.
export const StoreActionType = {
    PUSH_DIRECTORY: "PUSH_DIRECTORY",
    POP_DIRECTORY: "POP_DIRECTORY",
    SET_FOLDER: "SET_FOLDER",
    SET_SNAPSHOT: "SET_SNAPSHOT",
    RESET: "RESET",
    UPDATE_USER: "UPDATE_USER"
}

function StoreContextProvider(props) {
    const [store, setStore] = useState({
        directory: [],
        currentSnapshot: null,
        user: null
    });

    const { adapter } = useContext(AdapterContext);

    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case StoreActionType.PUSH_DIRECTORY:
                return setStore({
                    directory: [...store.directory, payload],
                    currentSnapshot: store.currentSnapshot,
                    user: store.user
                });
            case StoreActionType.POP_DIRECTORY:
                return setStore({
                    directory: store.directory.slice(0, store.directory.length - 1),
                    currentSnapshot: store.currentSnapshot,
                    user: store.user
                })
            case StoreActionType.SET_FOLDER:
                return setStore({
                    directory: [payload],
                    currentSnapshot: store.currentSnapshot,
                    user: store.user
                });
            case StoreActionType.SET_SNAPSHOT:
                return setStore({
                    directory: [payload.snapshot.root],
                    currentSnapshot: payload.snapshot,
                    user: payload.user
                });
            case StoreActionType.RESET:
                return setStore({
                    directory: [],
                    currentSnapshot: null,
                    user: null
                });
            case StoreActionType.UPDATE_USER:
                return setStore({
                    directory: store.directory,
                    currentSnapshot: store.currentSnapshot,
                    user: payload
                });
            default:
                throw new Error("Invalid StoreActionType: " + type);
        }
    }

    store.pushDirectory = function (folder) {
        storeReducer({
            type: StoreActionType.PUSH_DIRECTORY,
            payload: folder
        });
    }
    store.popDirectory = function (folder) {
        if (store.directory.length !== 1) {
            storeReducer({
                type: StoreActionType.POP_DIRECTORY,
                payload: folder
            });
        }
    }

    store.setFolder = function (folder) {
        storeReducer({
            type: StoreActionType.SET_FOLDER,
            payload: folder
        });
    }
    store.getCurrentFolder = function () {
        return store.directory[store.directory.length - 1];
    }

    store.onLogin = async function () {
        if (adapter.adapter) {
            let user;
            try {
                user = await api.getUser(await adapter.adapter.getProfile());
                store.setSnapshot(await api.getSnapshot(user.fileSnapshotIDs.keys().next().value));
            } catch {
                store.takeSnapshot();
            }
        }
    }

    store.setSnapshot = async function (snapshot) {
        const user = await api.getUser(snapshot.profile);
        storeReducer({
            type: StoreActionType.SET_SNAPSHOT,
            payload: {
                snapshot: snapshot,
                user: user
            }
        });
    }
    store.takeSnapshot = async function () {
        if (adapter.adapter) {
            let snapshot = await adapter.adapter.takeSnapshot();
            await api.addSnapshot(snapshot);
            await store.setSnapshot(snapshot);
        }
    }

    store.updateUser = async function () {
        const user = await api.getUser(store.user.profile);
        storeReducer({
            type: StoreActionType.UPDATE_USER,
            payload: user
        });
    }

    store.reset = function () {
        storeReducer({
            type: StoreActionType.RESET,
            payload: null
        });
    }

    return (
        <StoreContext.Provider value={{ store }}>
            { props.children }
        </StoreContext.Provider>
    );
}

export default StoreContext;
export { StoreContextProvider };
