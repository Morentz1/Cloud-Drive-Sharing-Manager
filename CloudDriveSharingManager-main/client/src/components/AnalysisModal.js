import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SnippetFolderIcon from '@mui/icons-material/SnippetFolder';
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';
import StoreContext from '../store';
import { useContext, useState } from 'react';

export default function AnalysisModal(props) {
    const { store } = useContext(StoreContext);
    const [thresholdSlider, setThresholdSlider] = useState(false);
    const [threshold, setThreshold] = useState(51);
    

    const handleClose = () => {
        props.handleAnalysisModal();
    }

    const fileFolderDiffButton = () => {
        props.fileFolderDiff();
    }

    const sharingChangesButton = () => {
        props.sharingChanges();
    }

    const handleThresholdSlider = () =>{
        setThresholdSlider((prevState) => !prevState);
    }

    const handleThresholdChange = (e) => {
        setThreshold(e.target.value);
    }

    const cancelThresholdSlider = () => {
        setThresholdSlider((prevState) => !prevState);
        setThreshold( (prevValue) => prevValue=51);
    }

    const submitThreshold = () =>{
        setThresholdSlider((prevState) => !prevState);
        props.deviancyAnalysis(threshold);
        setThreshold( (prevValue) => prevValue=50);
    }

    const handleBlur = (e) =>{
        if(e.target.id === 'modal-container')
            handleClose();
    }

    let slider = 
        <div className="flex flex-col items-center py-16 gap-y-8 "> 
            <h1 className="font-mono text-base leading-relaxed text-gray-500 dark:text-gray-400"> Set threshold for deviancy analysis </h1>
            <h2 className="font-mono text-base leading-relaxed text-gray-500 dark:text-gray-400"> Threshold : {threshold}% </h2>
            <div className="flex w-4/6 gap-x-6"> <h1 className="font-mono">51%</h1> <input className="w-full h-4 outline-none opacity-1" type="range" defaultValue={threshold} onChange={(e) => handleThresholdChange(e)} min={51} max={100}/><h1 className="font-mono">100%</h1></div>
            <div className="flex gap-x-3"> 
                <button onClick={submitThreshold} className="bg-green-700 px-6 py-2 rounded-xl text-white font-mono"> Submit </button>
                <button onClick={cancelThresholdSlider} className="bg-red-700 px-6 py-2 rounded-xl text-white font-mono"> Cancel </button>
            </div>
        </div>

    return (
        <div id="modal-container" onClick={handleBlur} tabIndex="-1" aria-hidden="true" className="bg-black bg-opacity-30 h-modal fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0 md:h-full">
            <div className="relative h-full w-full max-w-2xl p-4 md:h-auto">
                <div className=" relative rounded-3xl bg-white shadow dark:bg-gray-700 border-2 border-black">


                    <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
                        <h3 className="text-xl font-mono font-semibold text-gray-900 dark:text-white">Analysis Mode</h3>
                        <button onClick={handleClose} type="button" className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
                            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    {thresholdSlider ? slider : <div className="space-y-6 p-6">
                        <p className="font-mono text-base leading-relaxed text-gray-500 dark:text-gray-400">Select the type of analysis you would like to perform on the current folder: {store.getCurrentFolder().name}</p>
                        <div className="flex flex-col items-center gap-5">
                            <button onClick={handleThresholdSlider} className="analysisbtn">
                                <ReportProblemIcon fontSize="large" />
                                <h1> Deviancy Analysis </h1>
                            </button>
                            <button onClick={fileFolderDiffButton} className="analysisbtn">
                                <SnippetFolderIcon fontSize="large" />
                                <h1> File-Folder Difference </h1>
                            </button>
                            <button onClick={sharingChangesButton} className="analysisbtn">
                                <CameraEnhanceIcon fontSize="large" />
                                <h1> Sharing Changes </h1>
                            </button>
                        </div>
                    </div>}
                </div>
            </div>
        </div>

    );
}