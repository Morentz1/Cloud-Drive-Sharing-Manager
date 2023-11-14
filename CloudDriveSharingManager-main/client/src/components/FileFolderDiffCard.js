
import { useState} from 'react';


export default function FileFolderDiffCard({perm, type}){
    const [showDetails, setShowDetails] = useState(false);

    const handleShowDetails = () =>{
        setShowDetails((prev) => !prev);
    } 
    let icon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>

    let downIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  


  
    if(type === 'original'){
        return (
            <div className="flex flex-col justify-center ">
                <div className="flex items-center gap-x-1">
                    <div onClick={handleShowDetails} className="bg-gray-200 rounded-full p-1"> {showDetails ? downIcon : icon} </div>       
                    <h1 > Entity : {perm.entity}</h1>
                </div>
                {showDetails &&
                    <div className="flex flex-col ml-12">
                        <p> Type: {perm.type} </p>
                        <p> Role: {perm.role} </p> 
                    </div>}
            </div>
                
        )
        }
        
    
    if(type ==='file'){
    return (
        <div className="flex flex-col justify-center ">
            <div className="flex items-center gap-x-1">
                <div onClick={handleShowDetails} className="bg-gray-200 rounded-full p-1"> {showDetails ? downIcon : icon} </div>       
                <h1 className="bg-green-300">+ Entity : {perm.entity}</h1>
            </div>
            {showDetails &&
                <div className="flex flex-col ml-12">
                    <p> Type: {perm.type} </p>
                    <p> Role: {perm.role} </p> 
                </div>}
        </div>
            
    )
    }
    if(type ==='folder'){
        return (
            
            <div className="flex flex-col justify-center ">
                <div className="flex items-center gap-x-1">
                    <div onClick={handleShowDetails} className="bg-gray-200 rounded-full p-1"> {showDetails ? downIcon : icon} </div>       
                    <h1 className='bg-red-300'>- Entity : {perm.entity}</h1>
                </div>
                {showDetails &&
                    <div className="flex flex-col ml-12">
                        <p> Type: {perm.type} </p>
                        <p> Role: {perm.role} </p> 
                    </div>}
            </div>
                
        )
        }
}