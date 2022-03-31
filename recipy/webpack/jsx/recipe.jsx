import ReactDOM from 'react-dom';
import React from 'react';

let recipe = JSON.parse(window._json);

const Recipe = ({recipe}) => {
    return <div>hello, {recipe.owner.first_name} {recipe.owner.last_name}</div>;
};

ReactDOM.render(<Recipe recipe={recipe} />, document.querySelector('#content'));
