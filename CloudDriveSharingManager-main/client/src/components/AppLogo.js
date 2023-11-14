import React from "react"
import AuthContext from "../auth"
import { useContext } from "react"

export default function AppLogo() {
    const { auth } = useContext(AuthContext)

    let title = "Cloud Drive Sharing Manager"
    if( auth.isAuthorized){
        title = "CDSM";
    }

    return(
        <div>
            <h1 className=" text-4xl font-mono font-bold">
            {title}
            </h1>
        </div>
        


    )
}
