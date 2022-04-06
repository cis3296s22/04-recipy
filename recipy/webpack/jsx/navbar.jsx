import React from "react";

const style = {
    navbar: { 
        position: 'fixed',
        top: '0px',
        left: '0px', 
        zIndex: 1,
        width: '100%',

        backgroundColor: '#00ffc1',
        color: 'black',
        padding: '5px',
        fontFamily: 'Arial',
        fontSize: '40px',
        letterSpacing: '1.5px'
    },
            
    title: {
        fontWeight: 900,
        textAlign: 'center',
        paddingTop: '3px',
        paddingBottom: '3px',
    },

    nav: { 
        position: 'fixed',
        top: '0px',
        right: '0px',
        textAlign: 'right',
        fontSize: '18px',
        padding: '12px',
        paddingTop: '22px'
    },

    navLink: { 
        textDecoration: 'none',
        color: '#686868',
        paddingRight: '7px',
        paddingLeft: '7px'
    },

    dropdown: {
        position: 'relative',
        display: 'inline-block'
    },

    dropdownContent: {
        display: 'none',
        position: 'absolute',
        backgroundColor: '#f9f9f9',
        boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
        minWidth: '90px',
        zIndex: 1,
        marginTop: '11px'
    },

    dropdownContentLink: {
        color: 'black', 
        textDecoration: 'none', 
        display: 'block'
    }
};

const Navbar = (props) => {
    let loggedIn = <div className="navbar">
        <div className="navTitle">Reci.py</div>

        <div className="nav">
            <a href="">Home</a>
            <a href="">Posts</a>
            <a href="">Create</a>

            <div className="navDropdown">
                <a href="">{props.username}</a>
                <div className="navDropdownContent">
                    <a href="">Profile</a>
                    <a href="">Logout</a>
                </div>
            </div>
        </div>
    </div>;

    let loggedOut = <div className="navbar">
        <div className="navTitle">Reci.py</div>

        <div className="nav">
            <a href="">Home</a>
            <a href="">Log In</a>
        </div>
    </div>;

    return (props.loggedIn === "true" ? loggedIn : loggedOut);
};

export default Navbar;