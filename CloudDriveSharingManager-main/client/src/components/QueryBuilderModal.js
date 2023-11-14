import { ACRCreationField } from "./"
import React,{useState, useContext} from 'react'
import StoreContext from "../store";
import AdapterContext from "../cloudservices";

export default function QueryBuilderModal(props) {
    const [groups, setGroups] = useState(false);
    const {store} = useContext(StoreContext);
    const { adapter } = useContext(AdapterContext);

    const handleClose = () => {
        props.handleQueryBuilderButton();
    }
    const handleClear = () => {
        document.querySelector('#qbsearchbar').value = "";
    }

    const handleSubmit = () => {
        let groupsDirective = groups ? "groups:on and " : "groups:off and ";
        if(!adapter.adapter.groupsAllowed){
            groupsDirective = '';
        }
        props.fillSearch(groupsDirective + document.querySelector('#qbsearchbar').value );
    }

    const handleAddButton = (e, id) => {
        let query = document.querySelector(id).value;
        if (query.length !== 0) {
            let queryBuilder = id.substring(1, id.length) + ":\"" + query + "\"";
            let currentQuery = document.querySelector('#qbsearchbar').value;
            if (currentQuery.length === 0)
                document.querySelector('#qbsearchbar').value = queryBuilder;
            else
                document.querySelector('#qbsearchbar').value = currentQuery + " " + queryBuilder;

            document.querySelector(id).value = "";
        }
    }

    const handleGroupsCheckbox = () =>{
        setGroups( (prev) => !prev);
    }

    const handleBlur = (e) => {
        if (e.target.id === 'modal-container')
            handleClose();
    }

    return (
        <div id="modal-container" onClick={handleBlur} tabIndex="-1" aria-hidden="true" className="bg-black bg-opacity-30 fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0 md:h-full">
            <div className="relative min-w-[50vw] min-h-[50vh] max-w-2xl p-4 md:h-auto">
                <div className="font-mono relative rounded-3xl bg-gray-100 shadow dark:bg-gray-700 border-2 border-black">


                    <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
                        <h3 className="text-xl font-mono font-semibold text-gray-900 dark:text-white"> Query Builder </h3>
                        <button onClick={handleClose} type="button" className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
                            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div className="space-y-6 p-6">

                        <ACRCreationField placeholder="Build your query" inputID="qbsearchbar" />
                        <div className="flex justify-center items-center gap-x-10">
                            <button onClick={handleSubmit} className="rounded-lg bg-green-600 text-white p-1 px-3"> Submit</button>
                            <button onClick={handleClear} className="rounded-lg bg-red-600 text-white p-1 px-3"> Clear</button>
                        </div>

                        <div className="flex flex-col  gap-y-3">
                            {store.user.profile[1] === 'Google Drive' ? <div className="justify-center flex gap-x-5">
                                <label>
                                    Groups? :
                                </label> 
                                <input id="groups-directive" onChange={handleGroupsCheckbox} type='checkbox' />
                                {groups ? "groups:on" : "groups:off"}
                            </div> : null}
                            <ACRCreationField addIcon="Add" label="User" placeholder="user" inputID="owner" handleAdd={(e) => handleAddButton(e, "#owner")} />

                            <ACRCreationField addIcon="Add" label="Drive" placeholder="drive" inputID="drive" handleAdd={(e) => handleAddButton(e, "#drive")} />

                            <ACRCreationField addIcon="Add" label="Creator" placeholder="user" inputID="creator" handleAdd={(e) => handleAddButton(e, "#creator")} />

                            <ACRCreationField addIcon="Add" label="From" placeholder="user" inputID="from" handleAdd={(e) => handleAddButton(e, "#from")} />

                            <ACRCreationField addIcon="Add" label="To" placeholder="user" inputID="to" handleAdd={(e) => handleAddButton(e, "#to")} />

                            <ACRCreationField addIcon="Add" label="Readable" placeholder="user" inputID="readable" handleAdd={(e) => handleAddButton(e, "#readable")} />

                            <ACRCreationField addIcon="Add" label="Writable" placeholder="user" inputID="writable" handleAdd={(e) => handleAddButton(e, "#writable")} />

                            <ACRCreationField addIcon="Add" label="Name" placeholder="regex" inputID="name" handleAdd={(e) => handleAddButton(e, "#name")} />

                            <ACRCreationField addIcon="Add" label="In Folder" placeholder="regex" inputID="inFolder" handleAdd={(e) => handleAddButton(e, "#inFolder")} />

                            <ACRCreationField addIcon="Add" label="Folder" placeholder="regex" inputID="folder" handleAdd={(e) => handleAddButton(e, "#folder")} />

                            <ACRCreationField addIcon="Add" label="Path" placeholder="path" inputID="path" handleAdd={(e) => handleAddButton(e, "#path")} />

                            <ACRCreationField addIcon="Add" label="Sharing" placeholder="none, anyone, user, domain" inputID="sharing" handleAdd={(e) => handleAddButton(e, "#sharing")} />

                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}