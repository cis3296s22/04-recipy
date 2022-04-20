import React from "react";
import ReactDOM from 'react-dom';
import Navbar from "./navbar";
import {useState} from "react";

let context = JSON.parse(window._json);
let responseErr = (context["error"] === undefined) ? false : JSON.parse(context["error"]);
console.log(responseErr)

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

const CSRFToken = () => {
    return (
        <input type="hidden" name="csrfmiddlewaretoken" value={csrftoken} />
    );
};

const ErrMsg = () => {
    const errKeys = Object.keys(responseErr)

    return (
        <div>
            {errKeys.map((errKey) => {
                <p>{errKey}</p>
            })}
        </div>
    );
};

const RegisterStyle = () => {
    return (
        <style> {`
            .registerContainer {
                text-align: center;
            }

            .registerTitle {
                font-size: 32;
            }

            .registerInputContainer {
                width: 100%;
            }

            .registerInput {
                width: 50%;
                padding: 12px 20px;
                margin: 8px 0px;
                box-sizing: border-box;
            }

            .registerBtn {
                width: 25%;
                height: 3em;
                text-align: center;
            }

            @media only screen and (max-width: 768px) {
                .registerInput {
                    width: 80%;
                    padding: 12px 20px;
                    margin: 8px 0px;
                    box-sizing: border-box;
                }
            }
        `}</style>
    );
}
const Register = () => {
    return <Navbar> 
        <RegisterStyle />
        <ErrMsg />
        <div className="registerContainer">
            <h1 className="registerTitle">Sign Up</h1>

            <form method="POST">
                <CSRFToken />
                <div className="registerInputContainter"><input className="registerInput" placeholder="Username" name="username" id="username-input" /></div>
                <div className="registerInputContainter"><input className="registerInput" placeholder="Email" name="email" id="email-input" /></div>
                <div className="registerInputContainter"><input className="registerInput" placeholder="First Name" name="fname" id="fname-input" /></div>
                <div className="registerInputContainter"><input className="registerInput" placeholder="Last Name" name="lname" id="lname-input" /></div>
                <div className="registerInputContainter"><input className="registerInput" placeholder="Password" name="password" id="password-input" type="password" /></div>
                <div className="registerInputContainter"><input className="registerInput" placeholder="Confirm" name="confirm" id="confirm-input" type="password" /></div>
                <input className="registerBtn" type="submit" />
            </form>
        </div>
    </Navbar>;
};

ReactDOM.render(<Register />, document.getElementById('root'));