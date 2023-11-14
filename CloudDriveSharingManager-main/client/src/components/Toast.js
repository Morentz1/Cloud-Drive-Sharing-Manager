import { ToastContext } from "../toast";
import React, { useContext } from "react";
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import DangerousIcon from '@mui/icons-material/Dangerous';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import CloseIcon from '@mui/icons-material/Close';

export default function Toast(props) {
    const { state, dispatch } = useContext(ToastContext);

    let timeoutInterval = 10000; //ms
    let transitionFrom = "bottom-right";

    if (props.position) {
        transitionFrom = props.position;
    }

    const getIcon = (type) => {
        switch (type) {
            case "INFO":
                return <InfoIcon fontSize="large" />;
            case "WARNING":
                return <WarningIcon fontSize="large" />;
            case "DANGER":
                return <DangerousIcon fontSize="large" />
            case "SUCCESS":
                return <DoneOutlineIcon fontSize="large" />;
            default:
                return;
        }
    }

    const bgColor = (type) => {
        switch (type) {
            case "INFO":
                return "bg-blue-400";
            case "WARNING":
                return "bg-yellow-400";
            case "DANGER":
                return "bg-red-400";
            case "SUCCESS":
                return "bg-green-400";
            default:
                return;
        }
    }


    return (
        <div className={'notif-container ' + transitionFrom} >
            {state.map((notification, index) => {
                setTimeout(() => {
                    dispatch({
                        type: "DELETE_NOTIFICATION",
                        payload: notification.id
                    });
                }, timeoutInterval);
                return (
                    <div key={notification.id} className={"notif-card " + bgColor(notification.type) + " " + transitionFrom}>
                        <CloseIcon onClick={() => dispatch({ type: "DELETE_NOTIFICATION", payload: notification.id })} className="absolute top-2 right-2 hover:bg-red-700 hover:text-white rounded-xl " fontSize="medium" />
                        <div className="notif-image"> {getIcon(notification.type)}</div>
                        <div>
                            <p title={notification.title} className="notif-title"> {notification.title}</p>
                            <p title={notification.message} className="notif-msg">{notification.message}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}