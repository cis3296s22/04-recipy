import React from "react";
import {useState} from 'react';
import Navbar from './navbar';

let context = JSON.parse(window._json);
let recipes = JSON.parse(context['recipes']);
let chefs = JSON.parse(context['chefs']);
let user_id = JSON.parse(context["user_id"]);

let postStyle = {
    container: {
        position: 'relative',
        width: '50%',
        height: '300px',
        marginLeft: '25%',
        marginRight: '25%',
        marginTop: '25px',
        marginBottom: '25px'
    },

    imgContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '40%',
        border: '1px solid black',
        borderRight: '0px solid black',
        boxSizing: 'border-box',
        cursor: 'pointer'
    },
    
    contentContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '60%',
        boxSizing: 'border-box',
        border: '1px solid black',
        borderLeft: '0px solid black',
        padding: '20px',
        cursor: 'pointer'
    },
        
    img: {
        width: '100%',
        height: '100%',
    },

    title: {
        fontSize: '64px',
        marginBottom: '5px',
        marginTop: '25px'
    },

    desc: {
        fontSize: '28px',
        marginTop: '30px'
    }
};

const searchStyle = {
    div: {
        textAlign: 'center'
    },

    input: {
        width: '50%',
        padding: '12px 20px',
        margin: '8px 0px',
        boxSizing: 'border-box'
    }
};

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
            <div style={searchStyle.div}> 
                <form onSubmit={this.handleSubmit}>
                    <input placeholder="Search recipes or users..." style={searchStyle.input} onChange={this.handleChange} />
                </form>
            </div>
        );
    };
};

const RecipePost = (props) => {
    const redirect = () => {
        window.location.replace('/recipe/' + props.id)
    }

    return <div style={postStyle.container}> 
        <div style={postStyle.imgContainer} onClick={redirect}><img src={props.img} style={postStyle.img}/></div>
        <div style={postStyle.contentContainer} onClick={redirect}>
            <h1 style={postStyle.title}>{props.title}</h1>
            <span>{props.user}</span>
            <p style={postStyle.desc}>{props.desc}</p>
        </div>
    </div>;
};

const UserPost = (props) => {
    const redirect = () => {
        window.location.replace('/user/' + props.id)
    }

    return <div style={postStyle.container}> 
        <div style={postStyle.imgContainer} onClick={redirect}><img src={props.img} style={postStyle.img}/></div>
        <div style={postStyle.contentContainer} onClick={redirect}>
            <h1 style={postStyle.title}>{props.username}</h1>
        </div>
    </div>;
};

const Recipes = () => {
    return (
        <>
            <RecipeSearch />
            { 
                recipes.map((recipe) => {
                    const imgUrl = recipe.hasOwnProperty("picture") ? recipe.picture.url : "static/default_recipe.png"

                    return (
                       <RecipePost key={recipe.id} id={recipe.id} title={recipe.name} user={recipe.owner.username} desc={recipe.description} img={imgUrl} />
                    )
                }) 
            }
        </> 
    );
}

const Users = () => {
    return (
        <>
            <RecipeSearch />
            { 
                chefs.map((chef) => {
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
        <Navbar authenticated={(user_id !== null)} user_id={user_id}>
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

            {toggle && <Recipes /> }
            {!toggle && <Users /> }

        </Navbar>
    );
    // NOTE(anand): this is for testing
    // <RecipePost title="Pasta" user="Some User" desc="Simple pasta recipe for those who are hungry" img="static/pasta.png" />
}

export default Home;