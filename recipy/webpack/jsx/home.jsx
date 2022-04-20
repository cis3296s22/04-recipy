import React from "react";
import {useState} from 'react';
import Navbar from './navbar';

let context = JSON.parse(window._json);
let recipes = JSON.parse(context['recipes']);
let chefs = JSON.parse(context['chefs']);
let user_id = JSON.parse(context["user_id"]);

const PostStyle = () => {
    return (
        <style> {`
            .container {
                position: relative;
                width: 50%;
                height: 200px;
                margin-left: 25%;
                margin-right: 25%;
                margin-top: 25px;
                margin-bottom: 25px;
            }

            .imgContainer {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 30%;
                border: 1px solid black;
                border-right: 0px solid black;
                box-sizing: border-box;
                cursor: pointer;

                display: flex;
                justify-content: center;
                align-items: center;
            }

            .contentContainer {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                width: 70%;
                box-sizing: border-box;
                border: 1px solid black;
                border-left: 0px solid black;
                padding: 20px;
                cursor: pointer;
            }

            .postImg {
                width: 100%;
                height: auto;
                max-height: 200px;
                max-width: 200px;
            }

            .postTitle {
                font-size: 32;
                margin-bottom: 5px;
                margin-top: 15px;
            }

            .postDesc {
                font-size: 24;
                margin-top: 20px;
            }

            .postUsername {
                font-size: 18;
            }

            @media only screen and (max-width: 768px) {
                .container {
                    position: relative;
                    width: 80%;
                    height: 300px;
                    margin-left: 10%;
                    margin-right: 10%;
                    margin-rop: 25px;
                    margin-bottom: 25px;
                }

                .imgContainer {
                    width: auto;
                    height: 45%;
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 0;
                    border: 1px solid black;
                    border-bottom: 0px solid black;
                    box-sizing: border-box;
                    cursor: pointer;

                    display: flex;
                    justify-content: center;
                    alignItems: center;
                }
                
                .contentContainer {
                    width: auto;
                    height: 55%;
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    box-sizing: border-box;
                    border: 1px solid black;
                    border-top: 0px solid black;
                    padding: 20px;
                    cursor: pointer;

                    margin-top: 100px;
                }

                .postImg {
                    width: 100%;
                    height: auto;
                    max-height: 100px;
                    max-width: 100px;
                }

                .postTitle {
                    font-size: 32;
                    margin-top: 5px;
                    margin-bottom: 5px;
                }

                .postDesc {
                    font-size: 20;
                    margin-top: 15px;
                }
            }
        `}</style>
    );
}

const SearchStyle = () => {
    return (
        <style> {`
            .searchContainer {
                text-align: center;
            }

            .searchInput {
                width: 50%;
                padding: 12px 20px;
                margin: 8px 0px;
                box-sizing: border-box;
            }

            @media only screen and (max-width: 768px) {
                .searchInput {
                    width: 80%;
                    padding: 12px 20px;
                    margin: 8px 0px;
                    box-sizing: border-box;
                }
            }
        `}</style>
    );
}

const selectionStyle = {
    container: {
        textAlign: 'center'
    },

    btn: {
        width: '25%',
        height: '50px'
    },

    activeRight: {
        height: '100%',
        background: 'linear-gradient(to right, #eee 50%, #aaa 50%)',

        "&:hover": {
            background: "#aaa"
        }
    },

    activeLeft: {
        height: '100%',
        background: 'linear-gradient(to right, #aaa 50%, #eee 50%)',

        "&:hover": {
            background: "#aaa"
        }
    },

    nameWrapper: {
        display: 'flex',
        justifyConent: 'space-between',
    },

    recipes: {
        marginTop: '15px',
        width: '50%',
        height: '100%',
        textAlign: 'center'
    },

    users: {
        marginTop: '15px',
        width: '50%',
        width: '50%',
        height: '100%',
        textAlign: 'center'
    }
}

class RecipeSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        window.location.replace('/?search=' + this.state.value)
    }

    render() {
        return (
            <>
                <SearchStyle />
                <div className="searchContainer"> 
                    <form onSubmit={this.handleSubmit}>
                        <input placeholder="Search recipes or users..." className="searchInput" onChange={this.handleChange} />
                    </form>
                </div>
            </>
        );
    };
};

const RecipePost = (props) => {
    const redirect = () => {
        window.location.replace('/recipe/' + props.id)
    }


    return <div className="container"> 
        <div className="imgContainer" onClick={redirect}><img src={props.img} className="postImg"/></div>
        <div className="contentContainer" onClick={redirect}>
            <h1 className="postTitle">{props.title}</h1>
            <span className="postUsername">{props.user}</span>
            <p className="postDesc">{props.desc}</p>
        </div>
    </div>;
};

const UserPost = (props) => {
    const redirect = () => {
        window.location.replace('/users/' + props.id)
    }

    return <div className="container"> 
        <div className="imgContainer" onClick={redirect}><img src={props.img} className="postImg"/></div>
        <div className="contentContainer" onClick={redirect}>
            <h1 className="postTitle">{props.username}</h1>
        </div>
    </div>;
};

const Recipes = (props) => {
    return (
        <>
            <PostStyle />
            <RecipeSearch />
            { 
                props.recipes.map((recipe) => {
                    const imgUrl = recipe.hasOwnProperty("picture") ? recipe.picture.url : "static/default_recipe.png"

                    return (
                       <RecipePost key={recipe.id} id={recipe.id} title={recipe.name} user={recipe.owner.username} desc={recipe.description} img={imgUrl} />
                    )
                }) 
            }
        </> 
    );
}

const Users = (props) => {
    return (
        <>
            <PostStyle />
            <RecipeSearch />
            { 
                props.chefs.map((chef) => {
                    const imgUrl = chef.hasOwnProperty("picture") ? chef.picture.url : "static/default_recipe.png"

                    return (
                       <UserPost key={chef.id} id={chef.id} username={chef.username} img={imgUrl} />
                    )
                }) 
            }
        </> 
    );
}

const Home = () => {
    const [toggle, setToggle] = useState(true);
    const toggleSelection = () => setToggle(toggle => !toggle);
    return (
        <Navbar loggedIn={(user_id !== null)} user_id={user_id}>
            <div style={selectionStyle.container}>
                <button style={selectionStyle.btn} onClick={toggleSelection}>
                    <div style={(toggle ? selectionStyle.activeLeft : selectionStyle.activeRight)}>
                        <div style={selectionStyle.nameWrapper}> 
                            <p style={selectionStyle.recipes}>Recipes</p>
                            <p style={selectionStyle.users}>User</p>
                        </div>
                    </div>
                </button>
            </div>

            {toggle && <Recipes recipes={recipes} /> }
            {!toggle && <Users chefs={chefs} /> }
        </Navbar>
    );
}

export default Home;