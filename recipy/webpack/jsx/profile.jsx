import React from 'react';
import {useState} from 'react';
import Navbar from './navbar';
import ReactDOM from 'react-dom';

let context = JSON.parse(window._json);
let user_id = JSON.parse(context["user_id"]);

const Friend = (props) => {
    return <div>
        <img className='Avatar' src={props.avatarUrl} alt={props.username}/>
    </div>
};

    const Profile = (props) => {
        let postStyle = {
            container: {
                position: 'relative',
                width: '75%',
                height: '200px',
                marginLeft: '25%',
                marginRight: '25%',
                marginTop: '25px',
                marginBottom: '25px'
            },
            picture: {
                position: 'absolute',
                left: 0,
                top: 0,
                width: '40%',
                boxSizing: 'border-box'
            },
            lists: {
                display: "flex"
            }
        };
        return (
            
            <div style ={postStyle.container}>
                <Navbar />
                <div style={postStyle.picture}>
                    <img className='Avatar' src={props.user.avatarUrl} alt={props.user.name}/>
                    <h1>{props.username}</h1>
                </div>
                <div style={postStyle.lists}>
                    <div className='ChefsFriends'>
                        <Friend avatarUrl="static/pasta.png" username="user1"/>
                        <Friend avatarUrl="static/pasta.png" username="user1"/>
                        <Friend avatarUrl="static/pasta.png" username="user1"/>
                    </div>
                    <div className='ChefsRecipes'>
                        <RecipePost title="Pasta" user="Some User" desc="Simple pasta recipe for those who are hungry" img="static/pasta.png" />
                        <RecipePost title="Pasta" user="Some User" desc="Simple pasta recipe for those who are hungry" img="static/pasta.png" />
                        <RecipePost title="Pasta" user="Some User" desc="Simple pasta recipe for those who are hungry" img="static/pasta.png" />    
                    </div>
                </div>
            </div>
        );

    };


ReactDOM.render(<Profile />, document.getElementById('root'));