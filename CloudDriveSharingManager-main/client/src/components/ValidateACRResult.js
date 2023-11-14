export default function ValidateACRResult(props) {
    let ACRViolationList = props.result; //MAP
    let displayList = [];

    function violationCard(props) {
        return (
            <h1 className="ml-5">
                <b>File:</b> {props.file}
                <br />
                <b>Entity:</b> {props.entity}
                <hr />
            </h1>
        )
    }

    ACRViolationList.forEach((value, key) => {
        displayList.push(
            <div className="bg-red-200 rounded-xl w-4/5 p-2">
                <h1>Query: "{key}"</h1>
                <div className="ml-5">AR:
                    {value.ar.map(entry => (
                        violationCard({file: entry.file, entity: entry.entity})
                    ))}
                </div>
                <div className="pl-5">AW:
                    {value.aw.map(entry => (
                        violationCard({file: entry.file, entity: entry.entity})
                    ))}
                </div>
                <div className="pl-5">DR:
                    {value.dr.map(entry => (
                        violationCard({file: entry.file, entity: entry.entity})
                    ))}
                </div>
                <div className="ml-5">DW:
                    {value.dw.map(entry => (
                        violationCard({file: entry.file, entity: entry.entity})
                    ))}
                </div>
            </div>
        );
    });

    const handleClose = () => {
        props.handleCloseValidateACR();
    }
    const handleBlur = (e) => {
        if (e.target.id === 'modal-container')
            handleClose();
    }

    return (
        <div id="modal-container" onClick={handleBlur} tabIndex="-1" aria-hidden="true" className="bg-black bg-opacity-30 fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0 md:h-full">
            <div className="flex justify-center  relative min-h-[60vh] min-w-[50vw] max-w-2xl p-4 md:h-auto font-mono">
                <div className=" relative rounded-3xl bg-white shadow w-full dark:bg-gray-700 border-2 border-black">

                    <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
                        <h3 className="text-xl font-mono font-semibold text-gray-900 dark:text-white">Validate ACR Result</h3>
                        <button onClick={handleClose} type="button" className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
                            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <h1 className='justify-center flex'> ACR Violations: </h1>
                    <div className="flex flex-col items-center max-h-[55vh] p-4 overflow-y-auto gap-y-2 ">
                        {ACRViolationList.size === 0 ? <h1>No Violations Found</h1> : displayList}
                    </div>
                </div>
            </div>
        </div>
    );
}
