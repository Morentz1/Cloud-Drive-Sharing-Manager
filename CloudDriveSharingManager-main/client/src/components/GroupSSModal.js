import { useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import AdapterContext from "../cloudservices";
import { ToastContext } from '../toast';
import StoreContext from "../store";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import apis from "../api";
import { ACRCreationField } from './'

export default function GroupSSModal(props) {
    const { store } = useContext(StoreContext);
    const { dispatch } = useContext(ToastContext);
    const { adapter } = useContext(AdapterContext);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [groups, setGroups] = useState(props.list);

    const handleClose = () => {
        props.handleCloseGroupSSModal();
    }

    const handleUpload = (e) => {
        let filepath = e.target.value;
        const allowedExtensions = /(\.html)$/i;
        if (!allowedExtensions.exec(filepath)) {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "WARNING",
                    title: "Cannot edit permissions",
                    message: "Please select a file or folder first"
                }
            })
            setUploadedFile(null);
            return;
        }
        else {
            let file = e.target.files[0];
            setUploadedFile(file);
        }
    }

    const handleCreateSnapshot = async () => {
        let name = document.querySelector("#group-ss-name").value;
        let groupEmail = document.querySelector("#group-email").value;

        if (name.length === 0) {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "DANGER",
                    title: "Cannot make group snapshot",
                    message: "Make sure group name field is filled"
                }
            })
            return;
        }

        if (groupEmail.length === 0) {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "DANGER",
                    title: "Cannot make group snapshot",
                    message: "Make sure group email field is filled"
                }
            })
            return;
        }

        if (uploadedFile === null) {
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "DANGER",
                    title: "Cannot make group snapshot",
                    message: "Please upload a .html file"
                }
            })
            return;
        }

        document.querySelector("#group-email").value = "";
        document.querySelector("#group-ss-name").value = "";
        document.querySelector("#groupss-upload-button").value = "";
        setUploadedFile(null);

        const reader = new FileReader();
        let groupSS = null;
        reader.onload = async (e) => {
            groupSS = await adapter.adapter.takeGroupSnapshot(e.target.result, groupEmail, JSON.stringify(uploadedFile.lastModifiedDate), name);
            dispatch({
                type: "ADD_NOTIFICATION",
                payload: {
                    id: uuidv4(),
                    type: "SUCCESS",
                    title: "Group Snapshot Made",
                    message: "Successfully made group snapshot "
                }
            })
            await apis.addGroupSnapshot(groupSS);
            await store.updateUser();
            let gss = (await apis.getUser(store.user.profile)).groupSnapshots;
            setGroups(gss);
        }
        reader.readAsText(uploadedFile);


    }



    const handleBlur = (e) => {
        if (e.target.id === 'modal-container')
            handleClose();
    }

    // const handleDeleteGroupSS = (e) =>{
    //     let index = e.currentTarget.id;
    //     if ( index > -1){
    //         let list = [...groups];
    //         list.splice(index, 1);
    //     }
    // }

    // let trashIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    //     <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    // </svg>;

    return (
        <div id="modal-container" onClick={handleBlur} tabIndex="-1" aria-hidden="true" className=" bg-black bg-opacity-30 fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0 md:h-full">
            <div className="font-mono flex justify-center relative min-h-[80vh] min-w-[50vw] max-w-2xl p-4 md:h-auto text-mono">
                <div className=" relative rounded-3xl bg-white shadow w-full dark:bg-gray-700 border-2 border-black">


                    <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
                        <h3 className="text-xl font-mono font-semibold text-gray-900 dark:text-white">Group Memberships</h3>
                        <button onClick={handleClose} type="button" className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
                            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <div className="flex flex-col border-t p-4 gap-y-3  border-b-2 ">
                        <ACRCreationField label="Group Name" inputID="group-ss-name" placeholder="name" />
                        <ACRCreationField label="Group Email" inputID="group-email" placeholder="email" />

                        <div className="flex w-full justify-center items-baseline ">
                            <h1 className="p-1 ml-16 pl-2 justify-self-start ">  Upload HTML: </h1>
                            <input onChange={handleUpload} type="file" id="groupss-upload-button" />
                        </div>

                        <div className="flex w-full justify-center items-baseline ">
                            <button onClick={handleCreateSnapshot} className=" bg-green-500 rounded-xl p-1 px-4 hover:bg-green-600 text-white"> Create group membership</button>
                        </div>

                    </div>

                    <h1 className="flex justify-center" > Group Snapshots: </h1>
                    <div className="flex flex-col max-h-96  gap-y-2 overflow-y-auto px-10">

                        {groups.map((group, index) => (
                            <div className="flex gap-x-3 items-start">
                                <Accordion sx={{
                                    bgcolor: 'gray',
                                    font: '',
                                    width: '100%'
                                }} >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} id={index}>
                                        <div className="flex gap-x-5">
                                            <div className="flex gap-x-2">
                                                <h1 className="font-bold"> {index + 1}. Group Name: </h1>
                                                <h1> {group.name} </h1>
                                            </div>
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className="flex gap-x-2">
                                            <h1 className="font-bold"> Group Email: </h1>
                                            <h1> {group.groupEmail} </h1>
                                        </div>
                                        <div className="flex gap-x-2">
                                            <h1 className="font-bold"> Timestamp: </h1>
                                            <h1> {group.timestamp} </h1>
                                        </div>
                                        <p className="font-bold"> Memebers {"(" + group.members.length + ")"} : </p>
                                        <div className="ml-10">
                                            {group.members.map((member, index) => (
                                                <p> {index + 1}. {member}</p>
                                            ))}
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

    );
}