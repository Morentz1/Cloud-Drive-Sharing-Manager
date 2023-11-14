import React from 'react'

export default function ValidatePermissionViolation({ violations, finalizePermissionChanges,handleCloseACRViolation }) {
    let ACRViolationList = violations.result; //MAP
    let payload = violations.payload;
    // let rollback = violations.result[1];
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



    const handleProceedButton = () =>{
        finalizePermissionChanges(payload);
    }

    const handleCancelButton = () =>{
        handleCloseACRViolation();  
    }

    return (
        <div id="modal-container"  tabIndex="-1" aria-hidden="true" className="bg-black bg-opacity-30 fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0 md:h-full h-50vh">
            <div className="relative min-h-[50vh] min-w-[50vw] max-w-2xl p-4 md:h-auto font-mono">
                <div className=" relative rounded-3xl bg-white shadow dark:bg-gray-700 border-2 border-black">

                    <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
                        <h3 className="text-xl font-mono font-semibold text-gray-900 dark:text-white">Validate ACR Result</h3>
                    </div>

                    <h1 className='justify-center flex'> ACR Violations: </h1>
                    <div className="flex flex-col items-center max-h-[40vh] p-4 overflow-y-auto gap-y-2 border-b ">
                        {displayList}
                    </div>

                    <h1 className="flex justify-center mt-5"> Permission changes will violate above ACRs. Do you wish to continue? </h1>
                    <div className="flex gap-x-2 justify-center mt-5 p-4">
                        <button onClick={handleProceedButton} className="rounded bg-green-600 hover:bg-green-700 p-1 px-3 text-white"> Proceed</button>
                        <button onClick={handleCancelButton} className="rounded bg-red-600 hover:bg-red-700 p-1 px-3 text-white"> Cancel</button>
                    </div>

                </div>
            </div>
        </div>
    );
}