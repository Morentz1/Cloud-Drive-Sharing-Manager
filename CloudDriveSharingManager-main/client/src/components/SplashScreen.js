//libraries and packages
import { useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

//our stuff
import { HistoryModal, ValidatePermisisonViolation, GroupInfoModal, GroupSSModal, Toast, ValidateACRResult, ACRModal, LoginPage, WorkSpace, TopBar, SideBar, AnalysisModal, SharingChangesModal, QueryBuilderModal, PermissionModal, LoadingScreen, AnalysisResult, FileFolderDiffResult, SharingChangesResult, SwitchSnapshotModal } from './';
import AuthContext from '../auth';
import { ToastContext } from '../toast';
import StoreContext from '../store';
import { findDeviantSharing, findFileFolderSharingDifferences, compareSnapshots } from '../snapshotoperations/SharingAnalysis';
import apis from '../api';
import Query from '../snapshotoperations/Query';
import AdapterContext from "../cloudservices";
import { Folder, File } from '../classes/file-class';

export default function SplashScreen() {
    const { adapter } = useContext(AdapterContext);
    const { dispatch } = useContext(ToastContext);
    const { auth } = useContext(AuthContext);
    const { store } = useContext(StoreContext);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [showQBB, setShowQBB] = useState(false);
    const [showPermissionsModal, setPermissionsModal] = useState(false);
    const [files, setFiles] = useState(null);
    const [selectedIDs, setSelectedIDs] = useState([]);
    const [checkboxVisible, setCheckboxVisible] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [ffDiffResult, setFFDiffResult] = useState(null);
    const [sharingChangesResult, setSharingChangesResult] = useState(null);
    const [showSharingChangesModal, setSharingChangesModal] = useState(null);
    const [showSnapshots, setShowSnapshots] = useState(null);
    const [showACRModal, setShowACRModal] = useState(null);
    const [validateACRResult, setValidateACRResult] = useState(null);
    const [groupSS, setGroupSS] = useState(null);
    const [searchActive, setSearchActive] = useState(false);
    const [permissionView, setPermissionView] = useState(false);
    const [groupToShow, setGroupToShow] = useState(false);
    const [ACRViolations, setACRViolations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(null);

    const enableLoading = () => {
        setLoading(true);
    }

    const disableLoading = () => {
        setLoading(false);
    }

    //closes acr violations modal during permission mode
    const handleCloseACRViolation = () => {
        setACRViolations(null);

    }

    //show Group Membership Modal
    const handleGroupMembershipButton = () => {
        //retrieve group snapshot [] and pass it to the modal
        let groups = store.user.groupSnapshots;
        setGroupSS(groups);
    }

    //close Group Membership Modal
    const handleCloseGroupSSModal = () => {
        setGroupSS(null);
    }

    //retakes a snapshot
    const handleRefreshButton = async () => {
        store.reset();
        await store.takeSnapshot();
        setFiles(null);
    }

    //shows ACR Modal
    const handleShowACRModal = () => {
        //retrieve acr and pass to modal
        let currentACRs = store.user.acrs;
        setShowACRModal(currentACRs);
    }

    //close ACR Modal
    const handleCloseACRModal = () => {
        setShowACRModal(null);
    }

    //Opens ACR Result Modal
    const handleValidateACRButton = () => {
        //retrieves acr List and validate, pass to modal
        let ACRList = store.user.acrs;
        let result = store.currentSnapshot.validate(ACRList, store.user, adapter.adapter);
        setValidateACRResult(result);

    }

    //Closes ACR Result Modal
    const handleCloseValidateACR = () => {
        setValidateACRResult(null);
    }

    //handles checkbox for each file
    const handleFileCheckBox = (e) => {
        //gets their 'checked' status
        const checked = e.target.checked;
        //if checked, then add to selectedIDs
        if (checked) {
            setSelectedIDs([...selectedIDs, e.target.value]);
        }
        //if not checked, then remove from selectedIDs
        else {
            const allCheck = document.querySelector('.allfile-checkbox');
            if (allCheck) {
                document.querySelector('.allfile-checkbox').checked = false;
            }
            setSelectedIDs(selectedIDs.filter((id) => id !== e.target.value));
        }
    }

    //handles clickALL checkbox
    const handleAllFileCheckbox = (e) => {
        //gets checked status
        const checked = e.target.checked;
        let list = document.querySelectorAll('.file-checkbox');
        let s = [];
        //if checked, set to check and add all to selectedIDs
        if (checked) {
            setSelectedIDs([]);
            for (let i = 0; i < list.length; i++) {
                list[i].checked = true;
                s.push(list[i].value);
            }
            setSelectedIDs(s);
        }
        // if not checked, remove all files from selectedIDs and set uncheck
        else {
            for (let i = 0; i < list.length; i++) {
                list[i].checked = false;
            }
            setSelectedIDs([]);
        }
    }

    //handles clicking on folder to see contents inside
    const handleClickFolder = (e, folder) => {
        e.stopPropagation();
        //reset selectedIDs, if any and set checks to unchecks
        setSelectedIDs([]);
        let list = document.querySelectorAll('.file-checkbox');
        for (let i = 0; i < list.length; i++) {
            list[i].checked = false;
        }
        document.querySelector('.allfile-checkbox').checked = false;
        //push folder to directory and display them
        store.pushDirectory(folder);
        setFiles(null);
    }

    //Opens analysis mode options(deviancy, etc) modal
    const handleAnalysisModal = () => {
        setShowAnalysisModal((prevState) => !prevState);
    };

    //Opens query builder for query
    const handleQueryBuilderButton = () => {
        setShowQBB((prevState) => !prevState);
    }

    //takes user back to root
    const handleHomeButton = () => {
        //set searchMode to false
        setSearchActive(false);
        //set current direcotry to root and display
        store.setFolder(store.currentSnapshot.root);
        setFiles(null);
    }

    //shows Modal with all permission changes
    const handleHistoryButton = () => {
        //retrieve history from db
        let history = store.user.history;
        setShowHistoryModal(history);
    }

    //go back up one directory
    const handleBackButton = (folder) => {
        //set selectedIDs to empty and set checks to unchecks
        setSelectedIDs([]);
        let list = document.querySelectorAll('.file-checkbox');
        for (let i = 0; i < list.length; i++) {
            list[i].checked = false;
        }
        document.querySelector('.allfile-checkbox').checked = false;
        //remove from directory and display files from the next
        store.popDirectory(folder);
        setFiles(null);
    }

    //submits search query in search bar
    const handleQuery = async (query) => {
        //if in permission mode, disallow search
        if (permissionView) {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "WARNING",
                    title: "Cannot handle query",
                    message: "Cannot search while in edit permissions"
                }
            })
            return;
        }

        //make query object with given queryString
        try {
            let q = new Query(query, store.currentSnapshot, store.user, adapter.adapter);
            //evalute to get the files
            let files = q.evaluate();
            // Add this query to user's recent queries.
            await apis.addQuery({
                profile: store.user.profile,
                query: query
            });
            await store.updateUser();
            //create a "Search Folder" folder
            let searchFile = new File("", "Search Result", [], "", "", "SYSTEM", "/Search Result", "", "");
            let searchFolder = new Folder(searchFile, files);

            //set search to active and set current directory to the search folder
            setSearchActive(true);
            store.setFolder(searchFolder);
            setFiles(null);
        } catch (e) {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "DANGER",
                    title: "Query Error",
                    message: e.message
                }
            });
        }
    }

    //fill the search bar with query from querybuilder
    const fillSearch = (querybuilder) => {
        //closes query builder modal
        setShowQBB((prevState) => !prevState);
        //set the string from query builder to search bard
        document.querySelector('#default-searchbar').value = querybuilder;
        handleQuery(querybuilder);
    }

    const finalizePermissionChanges = async (payload) => {
        setACRViolations(null);
        enableLoading();
        try {
            let log = await adapter.adapter.deploy(payload.files, payload.deletePermissions, payload.addPermissions);
                await apis.addHistory({ profile: store.user.profile, log: log });
                await store.updateUser();
                await store.takeSnapshot();
                setFiles(null);
                disableLoading();

                setPermissionsModal(false);
                setCheckboxVisible(false);
                setSelectedIDs([]);
                setSearchActive(false);
                setPermissionView(false);

                dispatch({
                    type: "ADD_NOTIFICATION",
                    payload: {
                        id: uuidv4(),
                        type: "SUCCESS",
                        title: "Successful Changes!",
                        message: "Permission changes have been applied"

                    }
                })
                return;
        } catch (e) {
            disableLoading();
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "DANGER",
                    title: "Invalid Request",
                    message: "Could not edit permissions!"

                }
            })
            return;
        }
    }

    //handles permission changes upon clicking 'proceed'
    const editPermission = async (payload) => {
        //check if current files to push changes on have up-to-date permissions
        let validate = await adapter.adapter.deployValidatePermissions(payload.files);

        // if not up-to-date, dispatch toast
        if (validate === false) {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "DANGER",
                    title: "Edit permission failed",
                    message: "Current permissions mismatch with cloud drive."
                }
            })
            return;
        }
        //files are up to date

        //validate ACRs
        let result = adapter.adapter.deployValidateACRs(
            payload.files,
            payload.deletePermissions,
            payload.addPermissions,
            store.currentSnapshot,
            store.user.acrs,
            adapter.adapter.writable,
            store.user,
            adapter.adapter.groupsAllowed);

        //no violations from ACRs
        if (result.size === 0) {
            //deploy changes
            enableLoading();
            try {
                let log = await adapter.adapter.deploy(payload.files, payload.deletePermissions, payload.addPermissions);
                await apis.addHistory({ profile: store.user.profile, log: log });
                await store.updateUser();
                await store.takeSnapshot();
                setFiles(null);
                disableLoading();

                setPermissionsModal(false);
                setCheckboxVisible(false);
                setSelectedIDs([]);
                setSearchActive(false);
                setPermissionView(false);

                dispatch({
                    type: "ADD_NOTIFICATION",
                    payload: {
                        id: uuidv4(),
                        type: "SUCCESS",
                        title: "Successful Changes!",
                        message: "Permission changes have been applied"

                    }
                })
                return;

            } catch (e) {
                disableLoading();
                dispatch({
                    type: "ADD_NOTIFICATION",
                    payload: {
                        id: uuidv4(),
                        type: "DANGER",
                        title: "Invalid Request",
                        message: "Could not edit permissions!"

                    }
                })
                return;
            }

        }
        //yes violdations

        setPermissionsModal(false);
        setACRViolations({ result: result, payload: payload });

    }

    // Open Modal to edit permissions
    const showEditPermissionModal = () => {
        //do not open modal if no files/folder is open
        if (selectedIDs.length === 0) {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "WARNING",
                    title: "Cannot edit permissions",
                    message: "Please select a file or folder first"
                }
            })
            return;
        }

        //open modal
        setPermissionsModal(true);
    }

    // Close Modal to edit permissions
    const hideEditPermissionModal = () => {
        setPermissionsModal(false);
    }

    //TODO
    const sharingChanges = () => {
        let map = store.user.fileSnapshotIDs;
        setShowAnalysisModal(false);
        setSharingChangesModal(map);
    }

    const closeSharingChangesModal = () => {
        setSharingChangesModal(null);
    }


    const confirmSharingChanges = async (id1, id2) => {
        const snapshot1 = await apis.getSnapshot(id1);
        const snapshot2 = await apis.getSnapshot(id2);
        let result = new compareSnapshots(snapshot1, snapshot2);
        setSharingChangesModal(null);
        setSharingChangesResult(result);
    }

    const closeSharingResultsModal = () => {
        setSharingChangesResult(null);
    }

    //show switch snapshot modal
    const showSwitchSnapshotModal = () => {
        //retrieve map of ids and snapshots and pass to modal
        let map = store.user.fileSnapshotIDs;
        setShowSnapshots(map);
    }

    //closes swtich snapshot modal
    const closeSwitchSnapshotModal = () => {
        setShowSnapshots(null);
    }

    //handles switching snapshot given ssID
    const confirmSwitchSnapshot = async (ssID) => {
        let id = ssID;
        setShowSnapshots(null);
        //retrieve snapshot from db
        const snapshot = await apis.getSnapshot(id);
        //set store snapshot to retrieved one
        store.setSnapshot(snapshot);
        setFiles(null);
        //dispatch toast
        dispatch({
            type: "ADD_NOTIFICATION",
            payload: {
                id: uuidv4(),
                type: "SUCCESS",
                title: "File Snapshot Changed",
                message: "Successfully changed file snapshot"
            }
        })
    }

    //hides all checkboxes option
    const handleHideCheckBox = () => {
        //empty any selected files and set checks to uncheck
        setSelectedIDs([]);
        let list = document.querySelectorAll('.file-checkbox');
        for (let i = 0; i < list.length; i++) {
            list[i].checked = false;
        }
        document.querySelector('.allfile-checkbox').checked = false;
        setCheckboxVisible(false);
    }

    //performs deviancy analysis on store.getCurrentFolder() given threshold from analysis modal and passes to a result modal
    const deviancyAnalysis = (threshold) => {
        //closes analysis mode modal
        setShowAnalysisModal(false);

        //if it isn't a system file then perform deviancy
        if (store.getCurrentFolder().name !== "root" && store.getCurrentFolder().name !== "Search Result") {
            let result = findDeviantSharing(store.getCurrentFolder(), (threshold / 100));
            setAnalysisResult(result);
        }
        //dispatch toast
        else {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "DANGER",
                    title: "Analysis mode closed",
                    message: "Cannot do analysis on current directory"
                }
            });
            return;
        }
    }

    //closes deviancy result modal
    const closeDeviancyAnalysisModal = () => {
        setAnalysisResult(null);
    }

    //closes File/Folder Diff Modal
    const closeFFDiffModal = () => {
        setFFDiffResult(null);
    }

    //performs File/Folder Diff on store.currentFolder() thats not root, myDrive, sharedWithMe or Search Result
    const fileFolderDiff = () => {
        //closes modal for analysis mode
        setShowAnalysisModal(false);

        //if current file is owned by system do analyis
        if (store.getCurrentFolder().owner !== "SYSTEM") {
            setFFDiffResult(findFileFolderSharingDifferences(store.getCurrentFolder()));
        }
        // else dispatch toast
        else {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "DANGER",
                    title: "Analysis mode closed",
                    message: "Cannot do analysis on current directory"
                }
            });
            return;
        }
    }




    //show permission mode (permissions button calls this)
    const handlePermissionMode = () => {
        let [recentTimestamp] = store.user.fileSnapshotIDs.values();

        //check if current snapshot is the most recent
        if (recentTimestamp !== store.currentSnapshot.timestamp) {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "DANGER",
                    title: "Edit permission denied",
                    message: "Please select the most recent snapshot"
                }
            });
            return;
        }

        //prevent edit permission if at root and search is not active
        if (store.directory.length === 1 && !searchActive && adapter.adapter.multipleDrivesAllowed === true) {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "DANGER",
                    title: "Edit permission denied",
                    message: "Cannot edit permission of root"
                }
            });
            return;
        }

        //enable the two buttons and show checkbox
        setPermissionView(true);
        setCheckboxVisible(true);
    }

    //cancel permission mode (exit button calls this)
    const cancelPermissionMode = () => {
        //disable the two buttons and checkbox, clear selectedIDs
        setSelectedIDs([]);
        let list = document.querySelectorAll('.file-checkbox');
        for (let i = 0; i < list.length; i++) {
            list[i].checked = false;
        }
        document.querySelector('.allfile-checkbox').checked = false;
        setPermissionView(false);
        setCheckboxVisible(false);
    }

    //show group info modal with the specified group
    //takes in a group SS object
    const handleGroupToShow = (group) => {
        setGroupToShow(group);
    }

    //closes group info modal
    const hideGroupInfoModal = () => {
        setGroupToShow(null);
    }

    //handle closing history modal
    const handleCloseHistoryModal = () => {
        setShowHistoryModal(null);
    }

    if (files === null) {
        if (store.currentSnapshot === null) {
            store.onLogin();
        } else {
            setFiles(store.getCurrentFolder().files);
        }
    }

    //login screen
    let screen = <div>
        <TopBar />
        <div className=" bg-black h-1">  </div>
        <LoginPage />
    </div>;

    if (loading) {
        return (
            <div>
                <LoadingScreen label="Editting Permissions" />
            </div>
        )
    }
    //show loggedIn screen
    if (auth.isAuthorized) {
        screen = store.currentSnapshot === null ?
            <LoadingScreen />
            :
            <div className="flex-nowrap">
                <TopBar
                    handleQuery={handleQuery} //gets queryString and handles the query object
                    handleQueryBuilderButton={handleQueryBuilderButton}// opens qb modal
                />
                <div className="bg-black h-1"></div>
                <div className="grid grid-flow-col justify-start">
                    <SideBar
                        handlePermissionMode={handlePermissionMode} // functionaility "Permission" button 
                        cancelPermissionMode={cancelPermissionMode} // for "Exit" button under Permission Mode
                        permissionView={permissionView} // state to on/off Permission Mode side bar
                        showEditPermissionModal={showEditPermissionModal} //functionaility for "Edit Permisisons" under Permission Mode
                        handleHideCheckBox={handleHideCheckBox} //hides all checkbox 
                        handleGroupMembershipButton={handleGroupMembershipButton} //functionaility Group membership button
                        handleRefreshButton={handleRefreshButton} // functionality for refresh button
                        handleValidateACRButton={handleValidateACRButton} //functionaility ACR button
                        showSwitchSnapshotModal={showSwitchSnapshotModal} // functionaility switch snapshot button
                        handleAnalysisModal={handleAnalysisModal} // functionaility for analysis button
                        handleHomeButton={handleHomeButton} // functionality for home button
                        handleHistoryButton={handleHistoryButton} //functionality for history button
                        showACRModal={handleShowACRModal} // functionaility validate ACR
                    />
                    <div className=" w-[85vw] h-[92vh] overflow-y-auto overflow-x-hidden text-ellipsis break-words">
                        <div className="font-bold border-b"> Current Snapshot: {store.currentSnapshot.timestamp + (store.currentSnapshot.timestamp === store.user.fileSnapshotIDs.values().next().value ? " (most recent snapshot)" : " (older snapshot)")/* Show Current Snapshot timestamp*/} </div>
                        <h1 className="font-bold">
                            {/* Directory Button ternary */ store.directory.length === 1 ? "" : <button onClick={handleBackButton}>
                                <ArrowBackIosIcon fontSize="small" />
                            </button>}
                            { /* ternary to show current path */searchActive ? "" : "directory: " + store.getCurrentFolder().path}
                        </h1>
                        { /* ternary to see if search is active */ searchActive ? <h1 className="font-bold"> Search Results. Use Home button to see your drives </h1> : ""}
                        <WorkSpace
                            visible={checkboxVisible} //whether to show checkbox next to files
                            handleAllFileCheckbox={handleAllFileCheckbox} //whehter to show checkbox 'all'
                            handleFileCheckBox={handleFileCheckBox} //handles single checkbox funtionality
                            data={files} //files to show on workspace
                            handleClickFolder={handleClickFolder} //handle showing content when click folder
                            handleGroupToShow={handleGroupToShow} //handles showing the information of the specified group ss

                        />
                    </div>
                </div>
            </div>;


    }
    return (
        <div className=" min-w-fit min-h-screen  ">
            {ACRViolations && <ValidatePermisisonViolation
                handleCloseACRViolation={handleCloseACRViolation}
                finalizePermissionChanges={finalizePermissionChanges} //finalize the changes
                violations={ACRViolations} //violations resulting from staging permission changes
            //closes the warning modal
            />}
            {groupToShow && <GroupInfoModal
                group={groupToShow}  //group ss to show info about
                handleClose={hideGroupInfoModal} // functionally to hide group info modal
            />}
            {showQBB && <QueryBuilderModal
                fillSearch={fillSearch} //fills search bar with the query that was built
                handleQueryBuilderButton={handleQueryBuilderButton} //functionally for open/close of qb modal
            />}
            {showAnalysisModal && <AnalysisModal
                sharingChanges={sharingChanges} //functionality for snapshot changes modal
                fileFolderDiff={fileFolderDiff} //functionality for file/folder diff button
                deviancyAnalysis={deviancyAnalysis} //functionality for deviancy analysis button
                handleAnalysisModal={handleAnalysisModal} //functionality for closing analysis modal
            />}
            {showPermissionsModal && <PermissionModal
                data={selectedIDs} //list of file IDs to show in the modal
                editPermission={editPermission}  // proceed with permissions changes
                hideEditPermissionModal={hideEditPermissionModal} /> // closes the modal

            }
            {analysisResult && <AnalysisResult
                result={analysisResult} //result from deviancy analysis
                closeDeviancyAnalysisModal={closeDeviancyAnalysisModal} // closes the modal
            />}
            {ffDiffResult && <FileFolderDiffResult
                result={ffDiffResult} //result from file/folder diff
                closeFFDiffModal={closeFFDiffModal} // closes the modal
            />}
            {sharingChangesResult && <SharingChangesResult
                result={sharingChangesResult} //result from file/folder diff
                closeSharingResultsModal={closeSharingResultsModal} // closes the modal
            />}
            {showSnapshots && <SwitchSnapshotModal
                result={showSnapshots}  //result from switch snapshot
                closeSwitchSnapshotModal={closeSwitchSnapshotModal} // closes the modal
                confirmSwitchSnapshot={confirmSwitchSnapshot} // confirms and switches snapshot
            />}
            {showACRModal && <ACRModal
                acr={showACRModal} //acr list to show on modal
                handleCloseACRModal={handleCloseACRModal} // closes the modal
            />}
            {validateACRResult && <ValidateACRResult
                result={validateACRResult} //result after validating acr list
                handleCloseValidateACR={handleCloseValidateACR} // closes the modal
            />}
            {groupSS && <GroupSSModal
                list={groupSS} //list of group membership snapshots
                handleCloseGroupSSModal={handleCloseGroupSSModal} // closes the modal
            />}
            {showSharingChangesModal && <SharingChangesModal
                result={showSharingChangesModal} //result from showSharingChanges analysis
                closeSharingChangesModal={closeSharingChangesModal} //closes the modal
                confirmSharingChanges={confirmSharingChanges} //confirm
            />}
            {showHistoryModal && <HistoryModal logs={showHistoryModal} handleClose={handleCloseHistoryModal} />

            }

            {screen}
            <Toast position="bottom-right" //toast notification display
            />
        </div>
    );
}
