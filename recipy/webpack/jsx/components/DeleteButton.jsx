import React from 'react';
import useHover from '../hooks/useHover';

const DeleteButton = ({style: _style, ...props}) => {
    const [{hover, active}, ref] = useHover();
   
    let style = {
        width: '100%',
        height: 44,
        padding: 6.5,
        textAlign: 'center',
        cursor: 'pointer',
        background: hover ? 'red' : 'white',
        color: hover ? 'white' : 'red',
        border: 'none',
        fontWeight: 'bold',
        ..._style
    };
 
    return <button {...{...props, style}} ref={ref}>{props.children ? props.children : 'DELETE'}</button>;
}

export default DeleteButton;
