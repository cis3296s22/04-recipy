import React from 'react';

const Friend = (props) => {
    return <div>
        <img className='Avatar' src={props.avatarUrl} alt={props.username}/>
    </div>
}