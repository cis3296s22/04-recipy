import React from "react";

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
        boxSizing: 'border-box'
    },
    
    contentContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '60%',
        boxSizing: 'border-box',
        outline: '1px solid black',
        padding: '20px'
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

const RecipePost = (props) => {
    return <div style={postStyle.container}> 
        <div style={postStyle.imgContainer}><img src={props.img} style={postStyle.img}/></div>
        <div style={postStyle.contentContainer}>
            <h1 style={postStyle.title}>{props.title}</h1>
            <span>{props.user}</span>
            <p style={postStyle.desc}>{props.desc}</p>
        </div>
    </div>;
};

const Home = () => {
    return (
        <>
            <RecipePost title="Pasta" user="Some User" desc="Simple pasta recipe for those who are hungry" img="static/pasta.png" />
            <RecipePost title="Pasta" user="Some User" desc="Simple pasta recipe for those who are hungry" img="static/pasta.png" />
            <RecipePost title="Pasta" user="Some User" desc="Simple pasta recipe for those who are hungry" img="static/pasta.png" />
            <RecipePost title="Pasta" user="Some User" desc="Simple pasta recipe for those who are hungry" img="static/pasta.png" />
            <RecipePost title="Pasta" user="Some User" desc="Simple pasta recipe for those who are hungry" img="static/pasta.png" />
            <RecipePost title="Pasta" user="Some User" desc="Simple pasta recipe for those who are hungry" img="static/pasta.png" />
        </>
    );
}

export default Home;