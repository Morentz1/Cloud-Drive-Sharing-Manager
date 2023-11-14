import { useState, useContext } from "react";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import { v4 as uuidv4 } from 'uuid';
import StoreContext from "../store";

export default function FileCard(props) {
    const { store } = useContext(StoreContext);
    const [clicked, setClicked] = useState(false);
    let file = props.file;

    let showPermIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>;
    const handleClicked = (e) => {
        e.preventDefault();
        if (e.target.getAttribute('type') !== 'SYSTEM') {
            setClicked((prevClicked) => !prevClicked);
        }

    }

    return (
        <tr key={file.id} className="filecard border-b-2 hover:bg-gray-100">
            <th>
                <input
                    style={{ visibility: props.visible ? 'visible' : 'hidden' }} //
                    className="file-checkbox"
                    value={file.id}
                    onChange={props.handleFileCheckBox}
                    type='checkbox' />
            </th>
            <td className='max-w-[40vw] min-w-[40vw] flex flex-col text-ellipsis overflow-hidden whitespace-nowrap' type={"" + file.owner}>
                <div className='flex items-center' >
                    {file.owner !== "SYSTEM" ? <button className="ml-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300" onClick={(e) => handleClicked(e)}>
                        {showPermIcon}
                    </button> : ""}
                    {file.owner === 'SYSTEM' ? <FolderSpecialIcon /> : (file.files === undefined ? <InsertDriveFileIcon /> : <FolderIcon />)}
                    <span className={" " + (file.files !== undefined ? "underline" : "")} onClick={file.files === undefined ? null : (e) => props.handleClickFolder(e, file)} >{file.name}</span>

                </div>
                {file.owner === "SYSTEM" ? "" :
                    <div className="flex flex-row items-start gap-x-1 ml-3">
                        {clicked && <div className="px-2"> Permissions: {file.permissions.length === 0 ? "No Permissions" : file.permissions.map((permission, index) => (
                            <div key={uuidv4()} className="px-2 py-1 flex gap-x-3 flex-col border-b rounded bg-gray-400">
                                <h1
                                    onClick={() => {
                                        if (store.user.groupSnapshots.some( (group) => group.groupEmail === permission.entity)) {
                                            let list = store.user.groupSnapshots.filter((group) => group.groupEmail === permission.entity);
                                            if (list.length > 0) {
                                                props.handleGroupToShow(list[0]);
                                            }
                                            else {
                                                return;
                                            }
                                        }
                                    }}
                                    className="flex" > {index + 1}.Entity: {(permission.type === 'group' && store.user.groupSnapshots.some(group => group.groupEmail === permission.entity)) ? 
                                    <h1 className="underline">{store.user.groupSnapshots.filter((group) => group.groupEmail === permission.entity)[0].name}</h1> : permission.entity} </h1>
                                <div className="flex gap-x-2 ml-5">
                                    <h1>Role: {permission.role},</h1>
                                    <h1>Type: {permission.type},</h1>
                                    <h1>Can Share: {permission.canShare ? "Yes" : "No"},</h1>
                                    <h1>Inherited: {permission.isInherited ? "Yes" : "No"}</h1>
                                </div>
                            </div>
                        ))}
                        </div>}
                    </div>
                }
            </td>
            <td className='min-w-[25vw] max-w-[25vw] text-ellipsis overflow-hidden whitespace-nowrap '> {file.owner} </td>
            <td className='min-w-[20vw] max-w-[20vw] text-ellipsis overflow-hidden whitespace-nowrap '>  {file.createdTime} </td>
        </tr>
    )
}