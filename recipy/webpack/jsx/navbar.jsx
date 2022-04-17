import React from "react";
import {useState} from 'react';

const Navbar = (props) => {
    const [isActive, setActive] = useState(false);

    const toggleClass = () => {
        setActive(!isActive);
    }

    const redirect = () => {
        let url = new URL(window.location.href);
        let params = new URLSearchParams(url.search);
        params.delete('search');
    }

    const loggedIn = <>
        <li className="nav-item">
            <a href="/recipe/create/" className="nav-link">Create</a>
        </li>
        <li className="nav-item">
            <a href={"/users/" + props.user_id} className="nav-link">Profile</a>
        </li>
        <li className="nav-item">
            <a href="/accounts/logout/" className="nav-link">Logout</a>
        </li>
    </>;

    const loggedOut = <>
        <li className="nav-item">
            <a href="/accounts/register/" className="nav-link">Sign Up</a>
        </li>
        <li className="nav-item">
            <a href="/accounts/login/" className="nav-link">Log In</a>
        </li>
    </>;

    return (
        <>
            <header className={isActive ? "header header-active" : "header"}>
                <nav className="navbar">
                    <a href="/" className="nav-logo" onClick={redirect}>Reci.py</a>
                    <ul className={isActive ? "nav-menu active" : "nav-menu"}>
                        <li className="nav-item">
                            <a href="/" className="nav-link" onClick={redirect}>Home</a>
                        </li>
                        {(props.authenticated) ? loggedIn : loggedOut }
                    </ul>
                    <div className={isActive ? "hamburger active" : "hamburger"} onClick={toggleClass}>
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </div>
                </nav>
            </header>

            <div className="content">
                {props.children}
            </div>
        </>
    );
}

export default Navbar;