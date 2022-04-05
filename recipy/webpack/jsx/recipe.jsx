import "./polyfills";
import ReactDOM from 'react-dom';
import React from 'react';
import {useState} from 'react';
import {StrictMode} from 'react';
import {Provider, useSelector} from 'react-redux';
import easyRedux from './util/easyRedux';

let recipe = JSON.parse(window._json);

let store = easyRedux(recipe, {
    setRecipeName: (state, {name}) => {
        return {...state, name};
    }
});

const style = {
    recipe: {
	display: 'flex'
    },
    recipeSteps: {
	margin: 10,
	padding: 10,
	boxSizing: 'border-box',
	width: 'calc(100% - 300px)',
    },
    recipeDetails: {
	margin: 10,
	padding: 10,
	boxSizing: 'border-box',
	background: 'lightgray',
	borderRadius: 5,
	width: 300,
	display: 'flex',
	flexFlow: 'column nowrap'
    },
    recipeStep: {
	margin: '10px 0',
	padding: 10,
	boxSizing: 'border-box',
	background: 'lightgray',
	borderRadius: 5,
	width: '100%',
	display: 'flex',
	flexFlow: 'column nowrap'
    },
    row: {
	display: 'flex',
	flexFlow: 'row nowrap'
	},
    process: {
	fontSize: '1.5rem'
    },
    time: {
		fontSize: '1.5rem'
	},
	equipmentList: {

	},
	ingredient: {

	},
	equipment: {
		width: '50%'
	},
        ingredients: {
		width: '50%'
	}
};

const HUMAN_UNITS = [
	'',
	'g',
	'kg',
	'mL',
	'L',
	' pinches',
	''
];

const RecipeDetails = ({}) => {
    const steps = useSelector(s => s.steps);
    const owner = useSelector(s => s.owner);
    const name = useSelector(s => s.name);
    const description = useSelector(s => s.description);
    const makes = useSelector(s => s.makes);
    const picture = useSelector(s => s.picture);

    const numSteps = steps.length;
 
    let equipment = []
    let ingredients = []

    for (const s of steps) {
        for (const i of s.ingredients) {
            ingredients.push(i);
        }

        for (const e of s.equipment) {
	    equipment.push(e);
        }
    }

    return <div className="recipe-details" style={style.recipeDetails}>
		<img src={picture ? picture.url : null} style={{margin: '0 auto', marginBottom: 20, width: 150, height: 150, borderRadius: '100%', background: 'gray'}} />
		<h2 style={{fontSize: '2rem', marginBottom: 5}}>{name}</h2>
                <p style={{fontSize: '1rem', marginBottom: 10}}>By <a href={`/users/${owner.id}/`}>{owner.first_name} {owner.last_name}</a></p>
		<p style={{margin: '10px 0'}}>{description}</p>
		<ul style={{}}>
			<li>{numSteps == 1 ? "1 Step" : `${numSteps} Steps`}</li>
			{makes && <li>Makes {makes}</li>}
		</ul>
    </div>;
};

const Process = ({process}) => {
	return <span className="recipe-step__process" style={style.process} data-tooltip={process.description}>
		{process.name}
	</span>;
};

const Time = ({time}) => {
	return <div className="recipe-step__time" style={style.time}>
		{Object.entries(time).map(([k, v]) => !v ? null : <span key={k}>{v} {k}</span>)}
	</div>;
};

const Ingredient = ({ingredient}) => {
	return <div className="recipe-step__ingredients__ingredient" style={style.ingredient}>
		<span>{ingredient.amount.value}{HUMAN_UNITS[ingredient.amount.units]} {ingredient.name}</span>
	</div>;
};

const Ingredients = ({ingredients}) => {
	return <div className="recipe-step__ingredients" style={style.ingredients}>
		<h3 style={{marginBottom: 5}}>Ingredients</h3>
		{ingredients.map((x, i) => <Ingredient key={i} ingredient={x} />)}
	</div>;
};

const Equipment = ({equipment:{maker, name, kind}}) => {
	return <div className="recipe-step__equipment-list__equipment" style={{}}>
		<span>{kind} <strong style={{fontWeight: 'bold'}}>{name}</strong> from {maker}</span>
	</div>;
};

const EquipmentList = ({equipment}) => {
	return <div className="recipe-step__equipment-list" style={style.equipmentList}>
		<h3 style={{marginBottom: 5}}>Equipment</h3>
		{equipment.map((x, i) => <Equipment equipment={x} key={i} />)}
	</div>;
}

const RecipeStep = ({step}) => {
	return <div className="recipe-step" style={style.recipeStep}>
		<div style={{...style.row, justifyContent: 'space-between', marginBottom: 10}}>
			<Process process={step.process} />
			{step.time && <Time time={step.time} />}
		</div>
		<div style={style.row}>
			<Ingredients ingredients={step.ingredients} />
			<EquipmentList equipment={step.equipment} />
		</div>
	</div>;
};

const RecipeSteps = ({}) => {
    const steps = useSelector(s => s.steps);
    const [showModal, setShowModal] = useState(false);
    return <div className="recipe-steps" style={style.recipeSteps}>
	<h3 style={{fontSize: '1.5rem'}}>Steps</h3>
	{steps.map((x, i) => <RecipeStep key={i} step={x} />)}
	{showModal && null}
    </div>;
};

const Recipe = ({}) => {
    return <div className="recipe" style={style.recipe}>
        <RecipeDetails />
        <RecipeSteps />
    </div>;
};

ReactDOM.render(
    <StrictMode>
	<style>
{`
[data-tooltip]:before {
    /* needed - do not touch */
    content: attr(data-tooltip);
    position: absolute;
    opacity: 0;
    
    /* customizable */
    transition: all 0.15s ease;
    padding: 5px;
    color: white;
    border-radius: 3px;
}

[data-tooltip]:hover:before {
    /* needed - do not touch */
    opacity: 1;
    
    /* customizable */
    background: gray;
    margin-top: -30px;
}

[data-tooltip]:not([data-tooltip-persistent]):before {
    pointer-events: none;
}

`}
	</style>
	<Provider store={store}>
            <Recipe />
	</Provider>
    </StrictMode>, document.querySelector('#content'));
