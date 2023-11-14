import {v4 as uuidv4} from 'uuid';


export default function GroupInfoModal({ group, handleClose }) {

    const handleBlur = (e) => {
        if (e.target.id === 'modal-container') {
            handleClose();
        }
    }

    const handleCloseButton = () =>(
        handleClose()
    )

    return (
        <div id="modal-container" onClick={handleBlur} tabIndex="-1" aria-hidden="true" className=" bg-black bg-opacity-30 fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0 md:h-full">
            <div className="font-mono flex justify-center relative min-h-[60vh] min-w-[40vw] max-w-2xl p-4 md:h-auto text-mono">
                <div className=" relative rounded-3xl bg-white shadow w-full dark:bg-gray-700 border-2 border-black">


                    <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
                        <h3 className="text-xl font-mono font-semibold text-gray-900 dark:text-white">Group Information</h3>
                        <button onClick={handleCloseButton} type="button" className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
                            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <div className="p-4 flex flex-col gap-y-2">
                        <h1> Group Name: {group.name}</h1>
                        <h1> Group Email: {group.groupEmail}</h1>
                        <h1> Timestamp: {group.timestamp}</h1>
                        Members: {"["+group.members.length+" members]"}
                        <div className="max-h-72 overflow-y-auto">
                            {group.members.map((email, index) => (
                                <h1 key={uuidv4()}className="ml-5"> {index + 1}. {email}</h1>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}