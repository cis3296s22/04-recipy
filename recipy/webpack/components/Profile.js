function Avatar(props) {
    return (
        <img className="Avatar" 
            src={props.user.avatarUrl} 
            alt={props.user.name}/>
    );
}

function RecipeList(props) {
    return (
        <div className="RecipeList">
            <button onclick = {allRecipes}>
                Show All Recipes
            </button>
            <List>
                Recipe List
            </List>
        </div>
    );
}

function FriendsList(props) {
    return (
        <div className="FriendsList">
            <List>
                Friends List
            </List>
        </div>
    );
}

class UserPage extends React.Component {
    render() {
        return(
            <div className="Top">
                <div className="tRow">
                    <Avatar />
                </div>
                <div className="bRow">
                    <FriendsList />
                    <RecipeList />
                </div>
            </div>
        );
    }
}