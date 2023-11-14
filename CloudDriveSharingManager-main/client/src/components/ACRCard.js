import { useState, useContext } from "react";
import StoreContext from "../store";


export default function ACRCard(props) {
    const {store} = useContext(StoreContext);
    const [showDetails, setShowDetails] = useState(false);

    let plusIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>;

    let minusIcon = < svg xmlns = "http://www.w3.org/2000/svg" fill = "none" viewBox = "0 0 24 24" strokeWidth = { 1.5} stroke = "currentColor" className = "w-6 h-6" >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
  </svg >;


    let entry = props.acr;
    let index = props.index;

    return (
        <div className="flex flex-col bg-gray-300 w-4/6 rounded-xl p-1 px-2 font-bold">
            <div className="flex justify-between">
                <h1 title={entry.query} className="truncate"> {index + 1}. Query: {entry.query} </h1>
                <button onClick={(e) => setShowDetails((prevState => !prevState))} className="ml-2 rounded-xl bg-gray-400 hover:bg-gray-500"> {showDetails ? minusIcon : plusIcon} </button>
            </div>

            {showDetails ? <div className="flex flex-col">
                <div className="ml-5" >
                    <h1 className="underline"> Allowed Readers: </h1>
                    {entry.allowedReaders.length === 0 ? <h1 className="ml-5"> No Entities </h1> : entry.allowedReaders.map((reader, index) => (
                        <h1 className="ml-5">{index + 1}. {reader} </h1>
                    ))}
                </div>
                <div className="ml-5">
                    <h1 className="underline"> Allowed Writers: </h1>
                    {entry.allowedWriters.length === 0 ? <h1 className="ml-5"> No Entities </h1> : entry.allowedWriters.map((writer, index) => (
                        <h1 className="ml-5">{index + 1}. {writer} </h1>
                    ))}
                </div>
                <div className="ml-5">
                    <h1 className="underline"> Denied Readers: </h1>
                    {entry.deniedReaders.length === 0 ? <h1 className="ml-5"> No Entities </h1> : entry.deniedReaders.map((reader, index) => (
                        <h1 className="ml-5">{index + 1}. {reader} </h1>
                    ))}
                </div>
                <div className="ml-5">
                    <h1 className="underline"> Denied Writers: </h1>
                    {entry.deniedWriters.length === 0 ? <h1 className="ml-5"> No Entities </h1> : entry.deniedWriters.map((writer, index) => (
                        <h1 className="ml-5">{index + 1}. {writer} </h1>
                    ))}
                </div>
                {store.user.profile[1] === 'Google Drive' ? <div className=" flex ml-5 gap-x-1">
                    <h1 className="underline"> Take group membership into account?:</h1>
                    {"" + entry.grp}
                </div> : ""}
            </div> : ""}
        </div>
    )
}