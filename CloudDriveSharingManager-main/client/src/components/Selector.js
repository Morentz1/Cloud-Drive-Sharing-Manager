import { useState } from "react";
import React from 'react';
import {v4 as uuidv4} from 'uuid';

export default function Selector( {label, menu, onChange} ) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState("");

    return(
        <div className=" w-28 font-medium border rounded border-gray-400 ">
            <div  onClick={()=> setOpen((prev)=> !prev)} className="bg-white w-full p-1 flex items-center justify-center rounded">
                {selected ? selected : label ? label : ""}
            </div>
            {menu ? <ul className={"absolute bg-white mt-2 overflow-y-auto border " + (open ? 'max-h-32' : 'max-h-0')}>
                {menu.map((item)=>(
                    <li
                    onClick={()=>{
                        if(item.toLowerCase() !== selected.toLowerCase()){
                            setSelected(item);
                            setOpen(false);
                            onChange(item);
                        }
                    } 
                    } 
                    key={uuidv4()} 
                    id={item}
                    className="p-2 text-sm hover:bg-sky-600 hover:text-white"> {item} </li>
                ))}
            </ul> : null}
        </div>
    )
}