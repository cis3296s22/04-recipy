import React from 'react';
import {useState} from 'react';
import Navbar from './navbar';
import ReactDOM from 'react-dom';


let context = JSON.parse(window._json);
let user_id = JSON.parse(context["user_id"]);
let user_name = JSON.parse(context["user_name"]);
let recipes = JSON.parse(context['recipes']);

const Friend = (props) => {
    return <div>
        <img className='Avatar' src={props.avatarUrl} alt={props.username}/>
        <h1>Username: {user_name}</h1>
    </div>
};
const RecipePost = (props) => {
    return <div className="container"> 
        <div className="imgContainer" >
            <img src={props.img} className="postImg"/>
            </div>
        <div className="contentContainer">
            <h1 className="postTitle">{props.title}</h1>
            <span className="postUsername">Made by:{props.user}</span>
            <p className="postDesc">Recipe description:{props.desc}</p>
        </div>
    </div>;
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
            
            <div>
                <Navbar authenticated={(user_id !== null)} user_id={user_id}/>
        
                <div className='parent'>
                <div className='profile'>
                    <Friend avatarUrl="/static/default_recipe.png" username={user_name}/>                    
                </div>
                
                <div style={postStyle.lists}>
                    <div className='ChefsFriends'>
                        <h1>Friends List:</h1>

                        <Friend avatarUrl="/static/chefhat3.jpeg" username="James"/>
                        <Friend avatarUrl="/static/chefhat4.png" username="Kevin"/>
                    </div>
                    <div className='ChefsRecipes'>
                        <h1>{user_name}'s Recipes:</h1>
                        <RecipePost title="Pasta" user={user_name} desc="Simple pasta recipe for those who are hungry" img="chefhat3.jpeg" />
                        <RecipePost title="Chicken" user={user_name} desc="Simple chicken recipe for those who are hungry" img="static/chicken.jpeg" />
                        <RecipePost title="Soup" user={user_name} desc="Simple soup recipe for those who are hungry" img="static/pasta.jpeg" />
                    </div>
                </div>
                </div>
            </div>
        );

    };


ReactDOM.render(<Profile />, document.getElementById('root'));