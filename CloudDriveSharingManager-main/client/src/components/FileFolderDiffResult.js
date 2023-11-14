import {FileFolderDiffCard} from './'
import {v4 as uuidv4} from 'uuid';

export default function FileFolderDiffResult(props) {
    const handleClose = () => {
        props.closeFFDiffModal();
    }

    const handleBlur = (e) =>{
        if( e.target.id === 'modal-container')
            handleClose();
    }

    return (
        <div id="modal-container" onClick={handleBlur} tabIndex="-1" aria-hidden="true" className="bg-black bg-opacity-30 fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0 md:h-full">
            <div className=" font-mono relative min-h-[70vh] min-w-[40vw] max-w-2xl p-4 md:h-auto">
                <div className=" relative rounded-3xl min-h-[70vh] min-w-[40vw] bg-white shadow dark:bg-gray-700 border-2 border-black">


                    <div className="flex items-start justify-between border-b rounded-t p-4 dark:border-gray-600">
                        <h3 className="text-xl font-mono font-semibold text-gray-900 dark:text-white">File-Folder Difference Result</h3>
                        <button onClick={handleClose} type="button" className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
                            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <div className="flex flex-col p-4 ">
                        <div className="border-b border-black max-h-64 overflow-y-auto">
                             Current Folder: {props.result.folder.name}
                            <div className="flex flex-col gap-y-1">
                                {props.result.folder.permissions.length !== 0 ? props.result.folder.permissions.map((perm)=>(
                                    <FileFolderDiffCard key={uuidv4()} perm={perm} type={'original'}/>
                                )) : <h1> No Permissions Found</h1>}
                            </div>
                         </div>
                    
                        <h1 className="border-b"> Differing Files: </h1>
                        <div className="flex  flex-col max-h-64 overflow-y-auto  ">
                            {props.result.differingFiles.length !== 0 ? props.result.differingFiles.map((file)=>(
                                <div className="border-b pl-5"> File Name: {file.file.name}
                                    
                                    {file.fileDifferences.map((permission)=>(
                                        <FileFolderDiffCard key={uuidv4()} perm={permission} type={'file'}/>
                                    ))}
                                    {file.folderDifferences.map((permission)=>(
                                        <FileFolderDiffCard key={uuidv4()} perm={permission} type={'folder'}/>
                                    ))}
                                 </div>
                                
                            )) : <h1 className="flex justify-center"> No Differences Found</h1>}
                        </div>

                    </div>

                </div>
            </div>
        </div>

    );
}