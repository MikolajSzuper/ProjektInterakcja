import Button from "./Button.jsx";
import {Link, useNavigate} from "react-router-dom";
import React from "react";
import Autologin from "./Auth/Autologin.jsx";
import {useAuth} from "../AuthContext.jsx";
import Logout from "./Auth/Logout.jsx";
import UsersSearches from "./UsersSearches.jsx";

export default function Sidebar() {
    const navigate = useNavigate();

    const {username,loading} = useAuth();
    if(loading){
        return <p>Loading....</p>
    }

    return (
        <>
            <div className="sidebar">
                <nav>
                    <ul>
                        <li><Autologin/></li>
                        {username ?
                            <>
                                <li><Link to="/"><Button text="Strona glowna" action={() => console.log("Strona")}/></Link></li>
                                <li><Button text="Eksport z bazy" action={
                                    async () => {
                                        const respo = await fetch("http://localhost:3000/api/latest",{
                                            credentials:'include',
                                            method:'GET'
                                        });
                                        const dataFromBack = await respo.json();
                                        const json = JSON.stringify(dataFromBack, null, 2);
                                        const blob = new Blob([json], {type: 'application/json'});
                                        const link = document.createElement('a');
                                        link.href = URL.createObjectURL(blob);
                                        link.download = 'dataLast5RequestResponse.json';
                                        link.click();
                                    }
                                }></Button></li>
                                <li><Logout/></li>
                                <UsersSearches/>
                            </>
                            :
                            <>
                                <li><Link to="/login"><Button text="Zaloguj się"
                                                              action={() => console.log("Loguj")}/></Link></li>
                                <li><Link to="/register"><Button text="Zarejestruj się"
                                                                 action={() => console.log("Rejestruj")}/></Link></li>
                            </>
                        }


                    </ul>
                </nav>
            </div>
        </>
    )
}