import './polyfills';
import ReactDOM from 'react-dom';
import React from 'react';
import Homepage from './Homepage.jsx';

/*
  - Recipe edit/create
  - Discover/Search view
  - User's recipes view SLASH profile page
  - Homepage w/ random recipes
      - evolves to include followed chefs
      - like instagram homepage

*/

const App = () => {
  return <Homepage />;
}

console.log("Hello world");
ReactDOM.render(<App />, document.getElementById('root'));
