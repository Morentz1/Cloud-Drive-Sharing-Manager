import { IconButton } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
export default function LogOutButton () {

    const handleLogOut = () =>{
        window.location.reload();
    }
    
    return (
        <IconButton onClick={handleLogOut} size="medium">
            <LogoutIcon fontSize="inherit" />
        </IconButton>
    );
}
