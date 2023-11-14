import SharingChangesCard from './SharingChangesCard';
import { v4 as uuidv4 } from 'uuid';

export default function SharingChangesResult(props) {
    const handleClose = () => {
        props.closeSharingResultsModal();
    }

    const handleBlur = (e) =>{
        if(e.target.id === "modal-container")
            handleClose();
    }

   

    return (
        <div onClick={handleBlur} id="modal-container" tabIndex="-1" aria-hidden="true" className="bg-black bg-opacity-30 h-modal fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0 md:h-full">
            <div className=" font-mono relative min-h-[70vh] min-w-[40vw] max-w-2xl p-4 md:h-auto">
                <div className=" relative rounded-3xl min-h-[70vh] min-w-[40vw] bg-white shadow dark:bg-gray-700 border-2 border-black">

                
            <div className="flex items-start justify-between border-b rounded-t p-4 dark:border-gray-600">
                        <h3 className="text-xl font-mono font-semibold text-gray-900 dark:text-white">Sharing Changes</h3>
                        <button onClick={handleClose} type="button" className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
                            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <div className="flex flex-col p-4 ">
                        <div className="border-b border-black max-h-64 overflow-y-auto">
                             Earlier Snapshot: {props.result.earlierSnapshot.timestamp}
                             <p> </p>
                             Later Snapshot: {props.result.laterSnapshot.timestamp}
                            <div className="flex flex-col gap-y-1">
                                
                            </div>
                         </div>

                    

                    <h1 className="border-b"> Differing Files: { "[" + props.result.fileDifferences.length + " found]"} </h1>
                        <div className="flex  flex-col max-h-64 overflow-y-auto  ">
                            {props.result.fileDifferences ? props.result.fileDifferences.map((file,index) =>(
                                <SharingChangesCard key={uuidv4()} data={file} index={index} />
                            )) : ""}
                            </div>
                        </div>
                </div>
            </div>



        </div>
    );
}