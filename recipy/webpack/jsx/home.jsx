import React from "react";

let context = JSON.parse(window._json);
console.log(context)

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

const Home = () => {
    return (
        <>
            <RecipeSearch />
            { 
                context.map((recipe) => {
                    const imgUrl = recipe.hasOwnProperty("picture") ? recipe.picture.url : "static/default_recipe.png"

                    return (
                       <RecipePost key={recipe.id} id={recipe.id} title={recipe.name} user={recipe.owner.username} desc={recipe.description} img={imgUrl} />
                    )
                }) 
            }
        </>
    );
}

export default Home;