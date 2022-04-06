import './polyfills';
import ReactDOM from 'react-dom';
import React from 'react';
import Home from './home.jsx';
import Navbar from './navbar';

/*
  - Recipe edit/create
  - Discover/Search view
  - User's recipes view SLASH profile page
  - Homepage w/ random recipes
      - evolves to include followed chefs
      - like instagram homepage

*/

const App = () => {
  return <>
    <Navbar username="Some User" loggedIn="true" />
    <div style={{marginTop: '80px'}}>
      <Home />
    </div>
  </>;
}

ReactDOM.render(<App />, document.getElementById('root'));
