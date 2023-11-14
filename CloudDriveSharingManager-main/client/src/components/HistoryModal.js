import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { v4 as uuidv4 } from 'uuid';
import FileFolderDiffCard from "./FileFolderDiffCard";
import apis from "../api";
import StoreContext from "../store";
import { ToastContext } from "../toast";
import { useContext } from "react";

export default function HistoryModal({ logs,handleClose }) {
    const {store} = useContext(StoreContext);
    const {dispatch} = useContext(ToastContext);

    //history = [Log]
    // Log{ timestamp, files, deletePermissions, addPermissions }
    
    const handleClearHistory = async () =>{

        if(logs.length !== 0){
            await apis.deleteHistory(store.user.profile);
            await store.updateUser();
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "SUCCESS",
                    title: "History clear success!",
                    message: "All logs of permission changes have been cleared"
                }
            })
            handleClose();
        }
        else{
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "DANGER",
                    title: "History clear error!",
                    message: "There are no logs to clear"
                }
            })
            return
        }

        
    }

    const handleCloseButton = () => {
        handleClose();
    }

    const handleBlur = (e) => {
        if (e.target.id === 'modal-container')
            handleClose();
    }

    let displayHistory = logs.map((log, index) => (
        <div key={uuidv4()} className="flex gap-x-3 items-start">
            <Accordion sx={{
                bgcolor: 'gray',
                font: '',
                width: '100%'
            }} >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} id={index}>
                    <div className="flex gap-x-2">
                        <h1 className="font-bold"> {index + 1}. Timestamp: </h1>
                        <h1> {log.timestamp} </h1>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div className="grid grid-cols-3 gap-x-5">
                        <div className="flex flex-col p-1 ">
                            <h1> File Name: </h1>
                            {log.files.map((file, index) => (
                                <h1 > {index + 1}.{file}</h1>
                            ))}
                        </div>
                        <div className="flex flex-col gap-y-2 p-1 items-center  ">
                            <h1> Added Permisisons</h1>
                            {log.addPermissions.map((permission) => (
                                <FileFolderDiffCard perm={permission} type={'original'} />
                            ))}
                        </div>
                        <div className="flex flex-col p-1  ">
                            <h1> Removed Permisisons</h1>
                            {log.deletePermissions.map((permission) => (
                                <h1> {permission}</h1>
                            ))}
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    ))

    return (
        <div id="modal-container" onClick={handleBlur} tabIndex="-1" aria-hidden="true" className=" bg-black bg-opacity-30 fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0 md:h-full">
            <div className="font-mono flex justify-center relative min-h-[80vh] min-w-[50vw] max-w-2xl p-4 md:h-auto text-mono">
                <div className=" relative rounded-3xl bg-white shadow w-full dark:bg-gray-700 border-2 border-black">


                    <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
                        <h3 className="text-xl font-mono font-semibold text-gray-900 dark:text-white">History</h3>
                        <button onClick={handleCloseButton} type="button" className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
                            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <div onClick={handleClearHistory} className=" flex justify-center p-4"> 
                        <button className="bg-red-600 hover:bg-red-700 p-1 rounded text-white px-3"> Clear History </button>
                    </div>

                    <div className="flex flex-col max-h-[65vh] p-4 gap-y-2 overflow-y-auto px-10">
                        {displayHistory.length === 0 ? <h1 className="flex justify-center mt-3"> No history found</h1> : displayHistory}

                    </div>

                </div>
            </div>
        </div>

    );
}