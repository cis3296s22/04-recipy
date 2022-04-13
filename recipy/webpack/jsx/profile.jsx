import React from 'react';
import Friend from './components/Friend';

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
                <div style={postStyle.picture}>
                    <img className='Avatar' src={props.user.avatarUrl} alt={props.user.name}/>
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
export default Profile;