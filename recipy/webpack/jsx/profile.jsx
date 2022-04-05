import React from 'react';
import Friend from './components/Friend';

    const Profile = (props) => {
        let postStyle = {
            container: {

            }
        };
        return (
            <div style ={postStyle.container}>
                <div>
                    <img className='Avatar' src={props.user.avatarUrl} alt={props.user.name}/>
                </div>
                <div>
                    <div className='ChefsFriends'>
                        <Friend avatarUrl="static/pasta.png" username="user1"/>
                        <Friend avatarUrl="static/pasta.png" username="user1"/>
                        <Friend avatarUrl="static/pasta.png" username="user1"/>
                    </div>
                    <div className='ChefsRecipes'>
                        <RecipePost title="Pasta" user="Some User" desc="Simple pasta recipe for those who are hungry" img="static/pasta.png" />    
                    </div>
                </div>
            </div>
        );

    };
export default Profile;