import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import LockIcon from '@mui/icons-material/Lock';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import ScreenLockLandscapeIcon from '@mui/icons-material/ScreenLockLandscape';
import LockResetIcon from '@mui/icons-material/LockReset';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import CancelIcon from '@mui/icons-material/Cancel';
import StoreContext from '../store';
import { useContext } from 'react';

export default function SideBar( props ) {
    const {store  } = useContext(StoreContext);

    const handleRefreshButton = () =>{
        props.handleRefreshButton();
    }

    const handleACRButton = () => {
        props.showACRModal();
    }

    const handleValidateACRButton = () =>{
        props.handleValidateACRButton();
    }

    const handlePermissionButton =  () => {
        props.handlePermissionMode();
        //props.handlePermissionModal();
    }

    const handleAnalysisButton = () => {
        props.handleAnalysisModal();
    }

    const handleHomeButton = () =>{
        props.handleHomeButton();
    }

    const handleHistoryButton = () =>{
        props.handleHistoryButton();
    }

    const handleSwitchSnapshotButton = () => {
        props.showSwitchSnapshotModal();
    }

    const editPermissionButton = () => {
        props.showEditPermissionModal();
    }


    const handleGroupMembershipButton = ()=>{
        props.handleGroupMembershipButton();
    }

    if (props.permissionView){
        return (
            <div className="flex flex-col justify-start mt-4 mx-5 gap-y-4 items-baseline">
                <button onClick={editPermissionButton} type="button" className="sidebar-greenbtn"> <EditIcon fontSize="small" sx={{color: 'black'}}/> Edit Permissions </button>
                <button onClick={props.cancelPermissionMode} type="button" className="sidebar-redbtn "> <CancelIcon fontSize="small" sx={{color: 'black'}} /> Exit </button>
           </div>
        )
    }

    return (
            <div className="flex flex-col justify-start p-5 gap-y-4">
                <button onClick={handleAnalysisButton}type="button" className="sidebarbtn" >
                    <TroubleshootIcon fontSize="small" sx={{color: 'black'}}/>
                    Analysis
                </button>

                <button onClick={handlePermissionButton}className="sidebarbtn flex" >
                    <LockIcon fontSize="small" sx={{color: 'black'}}/>
                    Permissions
                </button>

                <button onClick={handleRefreshButton} className="sidebarbtn" >
                    <RefreshIcon fontSize="small" sx={{color: 'black'}}/> 
                    Refresh
                </button>

                <button onClick={handleHistoryButton} className="sidebarbtn" >
                    <HistoryIcon fontSize="small" sx={{color: 'black'}}/>
                    History
                </button>

                <button onClick={handleSwitchSnapshotButton} className="sidebarbtn" >
                    <FlipCameraIosIcon fontSize="small" sx={{color: 'black'}}/>
                    Switch Snapshot
                </button>

                <button onClick={ handleACRButton } className="sidebarbtn" >
                    <ScreenLockLandscapeIcon fontSize="small" sx={{color: 'black'}}/>
                    Access Control Requirement
                </button>

                <button onClick={handleValidateACRButton} className="sidebarbtn" >
                    <LockResetIcon fontSize="small" sx={{color: 'black'}}/>
                    Validate ACR
                </button>

                {store.user.profile[1] === 'Google Drive' ? <button onClick={handleGroupMembershipButton} className="sidebarbtn" >
                    <GroupIcon fontSize="small" sx={{color: 'black'}}/>
                    Group Membership Snapshot
                </button> : null}

                <button onClick={handleHomeButton} className="sidebarbtn" >
                    <HomeIcon fontSize="small" sx={{color: 'black'}}/>
                    Home
                </button>
           </div>
    );
}
